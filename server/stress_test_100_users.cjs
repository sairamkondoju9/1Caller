const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DURATION_SECONDS = parseInt(process.env.STRESS_DURATION_SECONDS || '3600', 10); // Default 3600s = 60 mins
const CONCURRENT_USERS = parseInt(process.env.STRESS_USERS || '100', 10);
const LOCAL_BASE_URL = 'http://127.0.0.1:3001';
const CLOUD_BASE_URL = 'https://sarvam-eta-rose.vercel.app';

const logFile = path.join(__dirname, 'stress_test_100_users.log');
const reportFile = path.join(__dirname, 'stress_test_report.json');

fs.writeFileSync(logFile, `=== 100-USER RIGOROUS STRESS TEST INITIALIZED ===\nStart Time: ${new Date().toISOString()}\nTarget Duration: ${DURATION_SECONDS}s (${(DURATION_SECONDS/60).toFixed(1)}m)\nConcurrent Users: ${CONCURRENT_USERS}\n\n`);

function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

// HTTP request helper
function request(urlStr, options = {}, data = null) {
  return new Promise((resolve) => {
    const start = Date.now();
    const u = new URL(urlStr);
    const client = u.protocol === 'https:' ? https : http;
    const postBody = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;

    const reqHeaders = {
      'User-Agent': 'SarvamStressTester/2.0',
      ...(postBody ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postBody) } : {}),
      ...(options.headers || {})
    };

    const req = client.request({
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      method: options.method || 'GET',
      headers: reqHeaders,
      timeout: 15000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const latency = Date.now() - start;
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode,
          latency,
          headers: res.headers,
          body
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 408, latency: Date.now() - start, error: 'TIMEOUT' });
    });

    req.on('error', (err) => {
      resolve({ ok: false, status: 0, latency: Date.now() - start, error: err.message });
    });

    if (postBody) req.write(postBody);
    req.end();
  });
}

// Global Metrics Tracker
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  errors: [],
  endpointStats: {},
  latencies: [],
  startTime: Date.now(),
  userSessions: []
};

function recordMetric(endpoint, res) {
  metrics.totalRequests++;
  if (res.ok) {
    metrics.successfulRequests++;
  } else {
    metrics.failedRequests++;
    if (metrics.errors.length < 200) {
      metrics.errors.push({
        time: new Date().toISOString(),
        endpoint,
        status: res.status,
        error: res.error || res.body?.slice(0, 200)
      });
    }
  }

  metrics.latencies.push(res.latency);
  if (metrics.latencies.length > 50000) metrics.latencies.shift(); // keep memory bounded

  if (!metrics.endpointStats[endpoint]) {
    metrics.endpointStats[endpoint] = { calls: 0, errors: 0, totalLatency: 0, min: 99999, max: 0 };
  }
  const stat = metrics.endpointStats[endpoint];
  stat.calls++;
  if (!res.ok) stat.errors++;
  stat.totalLatency += res.latency;
  if (res.latency < stat.min) stat.min = res.latency;
  if (res.latency > stat.max) stat.max = res.latency;
}

// User class representing 1 simulated user session
class VirtualUser {
  constructor(id) {
    this.id = id;
    this.email = `stress_user_${id}_${Date.now()}@outpero.test`;
    this.name = `StressUser_${id}`;
    this.token = null;
    this.user = null;
    this.employeeIds = [];
    this.campaignIds = [];
    this.dncIds = [];
  }

  async authenticate(baseUrl, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // 1. send-code
        const sendRes = await request(`${baseUrl}/api/auth/email/send-code`, { method: 'POST' }, { email: this.email });
        recordMetric('/api/auth/email/send-code', sendRes);
        if (!sendRes.ok) {
          await new Promise(r => setTimeout(r, 300 * attempt));
          continue;
        }

        let code = '123456';
        let otpToken = '';
        try {
          const parsed = JSON.parse(sendRes.body);
          if (parsed.code) code = parsed.code;
          if (parsed.otpToken) otpToken = parsed.otpToken;
        } catch {}

        // 2. verify-code
        const verifyRes = await request(`${baseUrl}/api/auth/email/verify-code`, { method: 'POST' }, { email: this.email, code, otpToken });
        recordMetric('/api/auth/email/verify-code', verifyRes);
        if (!verifyRes.ok) {
          await new Promise(r => setTimeout(r, 300 * attempt));
          continue;
        }

        const data = JSON.parse(verifyRes.body);
        if (data.token) {
          this.token = data.token;
          this.user = data.user;
          return true;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 300 * attempt));
      }
    }
    return false;
  }

  async runUserJourney(baseUrl) {
    if (!this.token) {
      const authed = await this.authenticate(baseUrl);
      if (!authed) return;
    }
    const authHeaders = { 'Authorization': `Bearer ${this.token}` };

    // 1. Session verification
    const meRes = await request(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    recordMetric('/api/auth/me', meRes);

    // 2. Stats & dashboard
    const statsRes = await request(`${baseUrl}/api/stats`, { headers: authHeaders });
    recordMetric('/api/stats', statsRes);

    const summaryRes = await request(`${baseUrl}/api/dashboard-summary?range=7d`, { headers: authHeaders });
    recordMetric('/api/dashboard-summary', summaryRes);

    // 3. Employees list
    const empListRes = await request(`${baseUrl}/api/employees`, { headers: authHeaders });
    recordMetric('/api/employees [GET]', empListRes);

    // 4. Create an employee
    const newEmpPayload = {
      name: `Agent_${this.id}_${Math.floor(Math.random()*1000)}`,
      type: 'sales',
      primary_language: ['te', 'hi', 'en', 'ta'][Math.floor(Math.random()*4)],
      voice: ['P09', 'P01', 'P07', 'S39', 'S36'][Math.floor(Math.random()*5)],
      industry: 'Real Estate & Property',
      opening_greeting: 'Hello, I am calling regarding your commercial property inquiry.',
      prompt_text: 'Sales agent specializing in commercial leasing.',
      call_steps: [
        { id: 1, step: 'Greeting', prompt: 'Introduce yourself' },
        { id: 2, step: 'Discovery', prompt: 'Ask about space requirements' }
      ]
    };
    const createEmpRes = await request(`${baseUrl}/api/employees`, { method: 'POST', headers: authHeaders }, newEmpPayload);
    recordMetric('/api/employees [POST]', createEmpRes);
    if (createEmpRes.ok) {
      try {
        const created = JSON.parse(createEmpRes.body);
        if (created.employee?.id) this.employeeIds.push(created.employee.id);
      } catch {}
    }

    // 5. Campaigns
    const validEmpId = this.employeeIds[0];
    if (validEmpId) {
      const createCmpRes = await request(`${baseUrl}/api/campaigns`, { method: 'POST', headers: authHeaders }, {
        name: `Q4_Outreach_${this.id}_${Math.floor(Math.random()*1000)}`,
        employee_id: validEmpId,
        leads: [
          { name: `Client_Alpha_${this.id}`, phone: `+9198${Math.floor(10000000 + Math.random()*90000000)}` },
          { name: `Client_Beta_${this.id}`, phone: `+9197${Math.floor(10000000 + Math.random()*90000000)}` }
        ],
        concurrency: 5,
        pacing_cps: 2.5
      });
      recordMetric('/api/campaigns [POST]', createCmpRes);
      if (createCmpRes.ok) {
        try {
          const cmpData = JSON.parse(createCmpRes.body);
          if (cmpData.id) this.campaignIds.push(cmpData.id);
        } catch {}
      }
    }

    const getCmpRes = await request(`${baseUrl}/api/campaigns`, { headers: authHeaders });
    recordMetric('/api/campaigns [GET]', getCmpRes);

    // 6. Leads & Calls
    const leadsRes = await request(`${baseUrl}/api/leads`, { headers: authHeaders });
    recordMetric('/api/leads', leadsRes);

    const callsRes = await request(`${baseUrl}/api/calls`, { headers: authHeaders });
    recordMetric('/api/calls', callsRes);

    // 7. Billing & Orders
    const billingRes = await request(`${baseUrl}/api/billing`, { headers: authHeaders });
    recordMetric('/api/billing', billingRes);

    const txRes = await request(`${baseUrl}/api/billing/transactions`, { headers: authHeaders });
    recordMetric('/api/billing/transactions', txRes);

    const orderRes = await request(`${baseUrl}/api/billing/create-order`, { method: 'POST', headers: authHeaders }, {
      amount: 100,
      planName: 'Custom Amount Top-Up'
    });
    recordMetric('/api/billing/create-order', orderRes);

    // 8. Settings & DNC
    const settingsRes = await request(`${baseUrl}/api/settings`, { headers: authHeaders });
    recordMetric('/api/settings [GET]', settingsRes);

    const phone = `+9198${Math.floor(10000000 + Math.random()*90000000)}`;
    const dncRes = await request(`${baseUrl}/api/dnc`, { method: 'POST', headers: authHeaders }, {
      phone,
      reason: 'Customer request'
    });
    recordMetric('/api/dnc [POST]', dncRes);
    if (dncRes.ok) {
      try {
        const dncData = JSON.parse(dncRes.body);
        if (dncData.entry?.id) this.dncIds.push(dncData.entry.id);
      } catch {}
    }

    const dncListRes = await request(`${baseUrl}/api/dnc`, { headers: authHeaders });
    recordMetric('/api/dnc [GET]', dncListRes);

    if (this.dncIds.length > 0) {
      const deleteId = this.dncIds.pop();
      const delDncRes = await request(`${baseUrl}/api/dnc/${deleteId}`, { method: 'DELETE', headers: authHeaders });
      recordMetric('/api/dnc [DELETE]', delDncRes);
    }

    // 9. Phone Numbers & Performance
    const phonesRes = await request(`${baseUrl}/api/phone-numbers`, { headers: authHeaders });
    recordMetric('/api/phone-numbers', phonesRes);

    const perfRes = await request(`${baseUrl}/api/performance?range=7d`, { headers: authHeaders });
    recordMetric('/api/performance', perfRes);

    // 10. Voice Clips & Ambience Sound Verification
    const voiceRes = await request(`${baseUrl}/audio/voices/P09.wav`);
    recordMetric('/audio/voices/P09.wav', voiceRes);

    const ambienceRes = await request(`${baseUrl}/audio/ambience/quiet-office.wav`);
    recordMetric('/audio/ambience/quiet-office.wav', ambienceRes);

    // 11. Compliance Routes
    const termsRes = await request(`${baseUrl}/terms`);
    recordMetric('/terms', termsRes);

    const refundRes = await request(`${baseUrl}/refund`);
    recordMetric('/refund', refundRes);

    // 12. Cleanup created employees to prevent DB bloat
    if (this.employeeIds.length > 2) {
      const delEmpId = this.employeeIds.shift();
      const delEmpRes = await request(`${baseUrl}/api/employees/${delEmpId}`, { method: 'DELETE', headers: authHeaders });
      recordMetric('/api/employees [DELETE]', delEmpRes);
    }
  }
}

// Compute percentile
function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function printReport(iteration, elapsedSec) {
  const p50 = getPercentile(metrics.latencies, 50);
  const p90 = getPercentile(metrics.latencies, 90);
  const p95 = getPercentile(metrics.latencies, 95);
  const p99 = getPercentile(metrics.latencies, 99);
  const avg = metrics.latencies.length > 0 ? (metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(1) : 0;
  const mem = process.memoryUsage();
  const rps = (metrics.totalRequests / (elapsedSec || 1)).toFixed(1);

  log(`--- [PROGRESS REPORT: ${elapsedSec}s elapsed / ${DURATION_SECONDS}s target] ---`);
  log(`Total Requests: ${metrics.totalRequests} | Success: ${metrics.successfulRequests} | Failed: ${metrics.failedRequests} | RPS: ${rps}`);
  log(`Latencies: avg=${avg}ms | p50=${p50}ms | p90=${p90}ms | p95=${p95}ms | p99=${p99}ms`);
  log(`Memory RSS: ${(mem.rss / 1024 / 1024).toFixed(1)}MB | Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`);

  if (metrics.failedRequests > 0) {
    const recentErrors = metrics.errors.slice(-5);
    log(`Recent Errors (${recentErrors.length}): ${JSON.stringify(recentErrors)}`);
  }

  // Dump detailed report to JSON
  const report = {
    elapsedSeconds: elapsedSec,
    targetDuration: DURATION_SECONDS,
    concurrentUsers: CONCURRENT_USERS,
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    errorRate: ((metrics.failedRequests / (metrics.totalRequests || 1)) * 100).toFixed(2) + '%',
    rps,
    latencies: { avg, p50, p90, p95, p99 },
    memory: {
      rssMB: (mem.rss / 1024 / 1024).toFixed(1),
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1)
    },
    endpointStats: metrics.endpointStats,
    recentErrors: metrics.errors.slice(-20)
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
}

async function main() {
  log(`Starting 100-User Stress Test Suite...`);
  log(`Duration: ${DURATION_SECONDS} seconds | Users: ${CONCURRENT_USERS}`);

  // Create 100 virtual users
  const users = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    users.push(new VirtualUser(i));
  }

  log(`Step 1: Authenticating all 100 virtual users in controlled batches...`);
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await Promise.all(batch.map((u, idx) => {
      const targetBase = (i + idx) % 2 === 0 ? LOCAL_BASE_URL : CLOUD_BASE_URL;
      return u.authenticate(targetBase);
    }));
    await new Promise(r => setTimeout(r, 150));
  }
  const authedCount = users.filter(u => u.token).length;
  log(`Authentication complete. Successfully authenticated: ${authedCount}/${CONCURRENT_USERS} users.`);

  log(`Step 2: Commencing continuous rigorous user journey simulation...`);
  const startTime = Date.now();
  let iteration = 0;

  // Run continuous concurrent user loops
  const userWorkers = users.map(async (user, userIdx) => {
    while ((Date.now() - startTime) < (DURATION_SECONDS * 1000)) {
      // Alternate requests between local high-throughput port and live cloud
      const targetBase = (iteration + userIdx) % 3 === 0 ? CLOUD_BASE_URL : LOCAL_BASE_URL;
      try {
        await user.runUserJourney(targetBase);
      } catch (err) {
        metrics.failedRequests++;
        metrics.errors.push({ time: new Date().toISOString(), user: user.id, error: err.message });
      }

      // Small jittered think time (30ms - 150ms)
      const thinkTime = 30 + Math.floor(Math.random() * 120);
      await new Promise(r => setTimeout(r, thinkTime));
    }
  });

  // Monitoring interval: prints report every 30 seconds
  const monitorInterval = setInterval(() => {
    iteration++;
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    printReport(iteration, elapsedSec);

    if (elapsedSec >= DURATION_SECONDS) {
      clearInterval(monitorInterval);
    }
  }, 30000);

  // Initial report at 5 seconds
  setTimeout(() => {
    printReport(0, Math.floor((Date.now() - startTime) / 1000));
  }, 5000);

  await Promise.all(userWorkers);
  clearInterval(monitorInterval);

  const totalElapsed = Math.floor((Date.now() - startTime) / 1000);
  log(`=== STRESS TEST COMPLETED ===`);
  printReport(iteration, totalElapsed);
  log(`Detailed report saved to: ${reportFile}`);
}

main().catch(err => {
  log(`FATAL ERROR IN STRESS TEST RUNNER: ${err.stack}`);
  process.exit(1);
});
