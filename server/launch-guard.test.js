import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const testDbDir = path.join(currentDir, '..', 'data', 'launch-guard-test');
const testDbPath = path.join(testDbDir, 'sarvam.db');

process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';
process.env.JWT_SECRET = 'launch-guard-test-secret-for-auth-suite';
process.env.SARVAM_DB_PATH = testDbPath;
process.env.GOOGLE_CLIENT_ID = '';
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';
process.env.GROQ_API_KEY = '';
process.env.MISTRAL_API_KEY = '';
process.env.GEMINI_API_KEY = '';
process.env.SARVAM_API_KEY = '';
process.env.CARTESIA_API_KEY = '';

let appServer;
let baseUrl;
let testDb;

test('public API rejects unverified login and direct wallet top-ups', async () => {
  fs.mkdirSync(testDbDir, { recursive: true });
  ({ db: testDb } = await import('./db.js'));
  const { server } = await import('./server.js');
  appServer = server;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;

  const emailLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'attacker@example.com', role: 'owner' })
  });
  assert.equal(emailLogin.status, 410);

  const passwordLogin = await fetch(`${baseUrl}/api/auth/email/password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'attacker@example.com', password: 'wrong-password' })
  });
  assert.equal(passwordLogin.status, 410);

  // The temporary test-login route must not exist unless explicitly enabled.
  const disabledTestLogin = await fetch(`${baseUrl}/api/auth/test-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'smoke@sarvam-smoke.test', password: 'SmokeTest#1' })
  });
  assert.equal(disabledTestLogin.status, 404);

  process.env.TEST_LOGIN_CREDENTIALS = 'smoke@sarvam-smoke.test:SmokeTest#1';

  const wrongTestPassword = await fetch(`${baseUrl}/api/auth/test-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'smoke@sarvam-smoke.test', password: 'wrong-password' })
  });
  assert.equal(wrongTestPassword.status, 401);

  const unknownTestEmail = await fetch(`${baseUrl}/api/auth/test-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'stranger@example.com', password: 'SmokeTest#1' })
  });
  assert.equal(unknownTestEmail.status, 401);

  const goodTestLogin = await fetch(`${baseUrl}/api/auth/test-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'smoke@sarvam-smoke.test', password: 'SmokeTest#1' })
  });
  assert.equal(goodTestLogin.status, 200);
  const goodTestBody = await goodTestLogin.json();
  assert.ok(goodTestBody.token, 'enabled test login should issue a session token');
  delete process.env.TEST_LOGIN_CREDENTIALS;

  const spoofedGoogle = await fetch(`${baseUrl}/api/auth/google`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'attacker@example.com', name: 'Attacker' })
  });
  assert.equal(spoofedGoogle.status, 503);

  const token = jwt.sign({ id: 'test-user', tenant_id: 'test-tenant', role: 'client' }, process.env.JWT_SECRET);
  const legacyToken = jwt.sign(
    { id: 'forged-user', tenant_id: 'forged-tenant', role: 'owner' },
    'launch-guard-test-secret'
  );
  const legacyAuthResponse = await fetch(`${baseUrl}/api/admin/overview`, {
    headers: { authorization: `Bearer ${legacyToken}` }
  });
  assert.equal(legacyAuthResponse.status, 401, 'legacy hard-coded JWT secrets must not authenticate requests');

  const noBalanceToken = jwt.sign(
    { id: 'unfunded-user', tenant_id: 'unfunded-tenant', role: 'client' },
    process.env.JWT_SECRET
  );
  const noBalanceHeaders = { authorization: `Bearer ${noBalanceToken}` };
  testDb.prepare('INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('unfunded-employee', 'unfunded-tenant', 'Unfunded Agent', 'instant_lead', 'en', 'E01', 'active');
  const billingResponse = await fetch(`${baseUrl}/api/billing`, { headers: noBalanceHeaders });
  assert.equal(billingResponse.status, 200);
  assert.equal((await billingResponse.json()).balance_credits, 0, 'missing billing rows must not fabricate credits');
  const statsResponse = await fetch(`${baseUrl}/api/stats`, { headers: noBalanceHeaders });
  assert.equal(statsResponse.status, 200);
  assert.equal((await statsResponse.json()).balanceCredits, 0, 'stats must not report demo balances for an unfunded tenant');
  const blockedUnfundedCall = await fetch(`${baseUrl}/api/calls/dispatch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${noBalanceToken}` },
    body: JSON.stringify({
      phone: '+919849012345',
      employee_id: 'unfunded-employee'
    })
  });
  assert.equal(blockedUnfundedCall.status, 402, 'calls must be blocked when the workspace cannot fund one minute');
  assert.equal(testDb.prepare('SELECT COUNT(*) AS count FROM calls WHERE tenant_id = ?').get('unfunded-tenant').count, 0);

  const noProviderResponse = await fetch(`${baseUrl}/api/employees/parse-prompt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({
      prompt: 'Create a friendly employee for Acme Clinic',
      businessName: 'Acme Clinic',
      language: 'en'
    })
  });
  assert.equal(noProviderResponse.status, 503);
  assert.match((await noProviderResponse.json()).error, /requires a Groq, Cerebras, Mistral, or Gemini API key/);

  const noScriptProviderResponse = await fetch(`${baseUrl}/api/employees/generate-script`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({
      prompt: 'Answer calls for our clinic and help callers request appointments.',
      businessName: 'Acme Clinic',
      language: 'en'
    })
  });
  assert.equal(noScriptProviderResponse.status, 503);
  assert.match((await noScriptProviderResponse.json()).error, /No AI provider is configured/);

  const noBuildProviderResponse = await fetch(`${baseUrl}/api/employees/build-stage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
    body: JSON.stringify({
      stage: 'analyze',
      prompt: 'Answer calls for our clinic and help callers request appointments.',
      language: 'en',
      purpose: 'sales'
    })
  });
  assert.equal(noBuildProviderResponse.status, 503);
  assert.match((await noBuildProviderResponse.json()).error, /No AI provider is configured/);

  const [{ groqClient }, { mistralClient }] = await Promise.all([
    import('./groqClient.js'),
    import('./mistralClient.js')
  ]);
  const originalGroqKey = process.env.GROQ_API_KEY;
  const originalMistralKey = process.env.MISTRAL_API_KEY;
  const originalGroqGeneration = groqClient.generateEmployeeScript;
  const originalMistralGeneration = mistralClient.generateEmployeeScript;
  const originalGroqSupportGeneration = groqClient.generateSupportScript;
  const originalGroqBuildStageGeneration = groqClient.generateEmployeeBuildStage;
  const originalMistralBuildStageGeneration = mistralClient.generateEmployeeBuildStage;
  process.env.GROQ_API_KEY = 'mock-groq-key';
  process.env.MISTRAL_API_KEY = 'mock-mistral-key';
  let failGroqAnalysis = false;
  const mockPlanSteps = [
    { title: 'Welcome callers', detail: 'Introduce Priya from Acme Clinic.' },
    { title: 'Understand appointment needs', detail: 'Ask what appointment the caller wants.' },
    { title: 'Clarify relevant details', detail: 'Ask one question at a time.' },
    { title: 'Share confirmed information', detail: 'Only share facts supplied by the clinic.' },
    { title: 'Offer callback', detail: 'Ask permission before offering a callback.' },
    { title: 'Summarize and close', detail: 'Recap the request and thank the caller.' }
  ];
  groqClient.generateEmployeeBuildStage = async request => request.stage === 'analyze' && failGroqAnalysis
    ? {}
    : request.stage === 'analyze'
    ? {
      industry: 'Healthcare',
      role: 'Patient Coordinator',
      summary: 'This appears to be a clinic appointment workflow.',
      offerings: ['Appointment requests', 'Clinic information', 'Callback requests'],
      nextActions: ['Request a callback', 'Ask for human follow-up'],
      objectionOptions: ['Acknowledge the concern', 'Offer human follow-up'],
      questions: ['What price details may be shared?', 'Which services should be covered?', 'What should callers do next?']
    }
    : { steps: mockPlanSteps };
  mistralClient.generateEmployeeBuildStage = async request => {
    assert.equal(request.stage, 'analyze');
    return {
      industry: 'Healthcare',
      role: 'Patient Coordinator',
      summary: 'This appears to be a clinic appointment workflow.',
      offerings: ['Appointment requests', 'Clinic information', 'Callback requests'],
      nextActions: ['Request a callback', 'Ask for human follow-up'],
      objectionOptions: ['Acknowledge the concern', 'Offer human follow-up'],
      questions: ['What price details may be shared?', 'Which services should be covered?', 'What should callers do next?']
    };
  };
  groqClient.generateEmployeeScript = async () => ({
    openingLine: 'Hello there.',
    enquiryPrompts: ['Question one?', 'Question two?', 'Question three?']
  });
  mistralClient.generateEmployeeScript = async request => {
    assert.equal(request.businessName, 'Acme Clinic');
    return {
      openingLine: 'Hello, this is Priya from Acme Clinic. How may I help?',
      enquiryPrompts: [
        'What appointment do you need?',
        'What would you like to know?',
        'Would you prefer a callback?'
      ]
    };
  };
  try {
    const buildAnalysisResponse = await fetch(`${baseUrl}/api/employees/build-stage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        stage: 'analyze',
        purpose: 'sales',
        prompt: 'Answer clinic calls and help callers request appointments.',
        language: 'en'
      })
    });
    const buildAnalysis = await buildAnalysisResponse.json();
    assert.equal(buildAnalysisResponse.status, 200);
    assert.equal(buildAnalysis.stage, 'analyze');
    assert.equal(buildAnalysis.role, 'Patient Coordinator');
    assert.match(buildAnalysis.source, /Groq/);

    const buildPlanResponse = await fetch(`${baseUrl}/api/employees/build-stage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        stage: 'plan',
        purpose: 'sales',
        prompt: 'Answer clinic calls and help callers request appointments.',
        language: 'en',
        businessName: 'Acme Clinic',
        role: 'Patient Coordinator',
        offerings: ['Appointment requests'],
        nextActions: ['Request a callback']
      })
    });
    const buildPlan = await buildPlanResponse.json();
    assert.equal(buildPlanResponse.status, 200);
    assert.equal(buildPlan.stage, 'plan');
    assert.equal(buildPlan.steps.length, 6);
    assert.match(buildPlan.source, /Groq/);

    failGroqAnalysis = true;
    const failoverAnalysisResponse = await fetch(`${baseUrl}/api/employees/build-stage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        stage: 'analyze',
        purpose: 'sales',
        prompt: 'Answer clinic calls and help callers request appointments.',
        language: 'en'
      })
    });
    const failoverAnalysis = await failoverAnalysisResponse.json();
    assert.equal(failoverAnalysisResponse.status, 200);
    assert.match(failoverAnalysis.source, /Mistral/);
    failGroqAnalysis = false;

    const supportPlanResponse = await fetch(`${baseUrl}/api/employees/build-stage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        stage: 'plan',
        purpose: 'support',
        prompt: 'Help customers with delivery and payment issues.',
        language: 'en',
        businessName: 'Acme Store',
        commonIssues: ['Delivery delay', 'Payment issue'],
        policies: 'Escalate refund decisions to a human.'
      })
    });
    const supportPlan = await supportPlanResponse.json();
    assert.equal(supportPlanResponse.status, 200);
    assert.equal(supportPlan.stage, 'plan');
    assert.equal(supportPlan.steps.length, 6);

    const generatedSalesResponse = await fetch(`${baseUrl}/api/employees/generate-script`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        prompt: 'Answer clinic calls and help callers request appointments.',
        businessName: 'Acme Clinic',
        employeeName: 'Priya',
        role: 'Patient Coordinator',
        industry: 'Healthcare',
        language: 'en',
        offerings: ['Appointment requests'],
        nextActions: ['Request a callback']
      })
    });
    const generatedSales = await generatedSalesResponse.json();
    assert.equal(generatedSalesResponse.status, 200);
    assert.match(generatedSales.source, /Mistral/);
    assert.equal(generatedSales.business_name, 'Acme Clinic');
    assert.equal(generatedSales.call_steps.length, 6);

    const saveGeneratedSalesResponse = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        name: generatedSales.employee_name,
        type: 'instant_lead',
        primary_language: 'en',
        industry: generatedSales.industry,
        opening_greeting: generatedSales.opening_greeting,
        prompt_text: generatedSales.small_context,
        scriptSteps: generatedSales.call_steps,
        status: 'ready'
      })
    });
    const savedGeneratedSales = await saveGeneratedSalesResponse.json();
    assert.equal(saveGeneratedSalesResponse.status, 200);
    const salesRow = testDb.prepare('SELECT tenant_id, name, opening_greeting, call_steps, status FROM employees WHERE id = ?')
      .get(savedGeneratedSales.id);
    assert.equal(salesRow.tenant_id, 'test-tenant');
    assert.equal(salesRow.name, 'Priya');
    assert.equal(salesRow.opening_greeting, generatedSales.opening_greeting);
    assert.equal(JSON.parse(salesRow.call_steps).length, 6);
    assert.equal(salesRow.status, 'ready');

    groqClient.generateSupportScript = async request => ({
      openingLine: `Hello, thank you for contacting ${request.businessName}.`,
      empathyLine: 'I am sorry this has caused trouble.',
      issueQuestions: [
        'Is this about your delivery?',
        'Could you describe the payment issue?',
        'What would help resolve this?'
      ]
    });
    const generatedSupportResponse = await fetch(`${baseUrl}/api/employees/generate-support-script`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        prompt: 'Help customers with delivery and payment issues.',
        businessName: 'Acme Store',
        employeeName: 'Maya',
        language: 'en',
        commonIssues: ['Delivery delay', 'Payment issue'],
        policies: 'Escalate refund decisions to a human.',
        nextActions: ['Escalate to a human']
      })
    });
    const generatedSupport = await generatedSupportResponse.json();
    assert.equal(generatedSupportResponse.status, 200);
    assert.equal(generatedSupport.call_steps.length, 6);
    assert.match(generatedSupport.call_steps[3].body, /Escalate refund decisions to a human/);

    const saveGeneratedSupportResponse = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({
        name: generatedSupport.employee_name,
        type: 'customer_support',
        primary_language: 'en',
        industry: generatedSupport.industry,
        opening_greeting: generatedSupport.opening_greeting,
        prompt_text: generatedSupport.small_context,
        scriptSteps: generatedSupport.call_steps,
        status: 'draft'
      })
    });
    const savedGeneratedSupport = await saveGeneratedSupportResponse.json();
    assert.equal(saveGeneratedSupportResponse.status, 200);
    const supportRow = testDb.prepare('SELECT tenant_id, name, opening_greeting, call_steps, status FROM employees WHERE id = ?')
      .get(savedGeneratedSupport.id);
    assert.equal(supportRow.tenant_id, 'test-tenant');
    assert.equal(supportRow.name, 'Maya');
    assert.equal(JSON.parse(supportRow.call_steps).length, 6);
    assert.equal(supportRow.status, 'draft');
  } finally {
    groqClient.generateEmployeeScript = originalGroqGeneration;
    groqClient.generateSupportScript = originalGroqSupportGeneration;
    groqClient.generateEmployeeBuildStage = originalGroqBuildStageGeneration;
    mistralClient.generateEmployeeBuildStage = originalMistralBuildStageGeneration;
    mistralClient.generateEmployeeScript = originalMistralGeneration;
    process.env.GROQ_API_KEY = originalGroqKey;
    process.env.MISTRAL_API_KEY = originalMistralKey;
  }

  const directTopup = await fetch(`${baseUrl}/api/billing/topup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount: 10000, bonusCredits: 100000 })
  });
  assert.equal(directTopup.status, 410);

  const productionSendCode = await fetch(`${baseUrl}/api/auth/email/send-code`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'production-code@example.com' })
  });
  const productionSendCodeData = await productionSendCode.json();
  assert.equal(productionSendCode.status, 503, 'serverless production auth must require a configured email sender');
  assert.equal('code' in productionSendCodeData, false, 'production responses must never reveal verification codes');

  const otpVercelValue = process.env.VERCEL;
  delete process.env.VERCEL;
  try {
    const sendCodeResponse = await fetch(`${baseUrl}/api/auth/email/send-code`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'verified-code@example.com' })
    });
    const sendCodeData = await sendCodeResponse.json();
    assert.equal(sendCodeResponse.status, 200);
    assert.match(sendCodeData.code, /^\d{6}$/);
    assert.notEqual(sendCodeData.code, '123456', 'verification codes must not use the historical fixed bypass');

    const wrongCode = sendCodeData.code === '000000' ? '000001' : '000000';
    const invalidVerification = await fetch(`${baseUrl}/api/auth/email/verify-code`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'verified-code@example.com', code: wrongCode })
    });
    assert.equal(invalidVerification.status, 401);

    const validVerification = await fetch(`${baseUrl}/api/auth/email/verify-code`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'verified-code@example.com', code: sendCodeData.code })
    });
    const verifiedUser = await validVerification.json();
    assert.equal(validVerification.status, 200);
    assert.equal(verifiedUser.success, true);

    const replayedCode = await fetch(`${baseUrl}/api/auth/email/verify-code`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'verified-code@example.com', code: sendCodeData.code })
    });
    assert.equal(replayedCode.status, 401, 'verification codes must be single use');
  } finally {
    process.env.VERCEL = otpVercelValue;
  }

  const unavailablePayment = await fetch(`${baseUrl}/api/billing/create-order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount: 100 })
  });
  assert.equal(unavailablePayment.status, 503, 'payment test must fail before contacting Razorpay when credentials are absent');

  const unconfiguredWebhook = await fetch(`${baseUrl}/api/billing/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event: 'payment.captured' })
  });
  assert.equal(unconfiguredWebhook.status, 503, 'webhook settlement must stay disabled until RAZORPAY_WEBHOOK_SECRET is configured');

  process.env.RAZORPAY_WEBHOOK_SECRET = 'launch-guard-webhook-secret';
  const forgedWebhook = await fetch(`${baseUrl}/api/billing/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-razorpay-signature': 'deadbeef' },
    body: JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_x', order_id: 'order_x', amount: 59000, status: 'captured' } } } })
  });
  assert.equal(forgedWebhook.status, 401, 'webhook must reject a forged signature before touching the ledger');

  const unknownOrderRaw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_x', order_id: 'order_unknown', amount: 59000, status: 'captured' } } } });
  const unknownOrderSignature = crypto.createHmac('sha256', 'launch-guard-webhook-secret').update(unknownOrderRaw).digest('hex');
  const unknownOrderWebhook = await fetch(`${baseUrl}/api/billing/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-razorpay-signature': unknownOrderSignature },
    body: unknownOrderRaw
  });
  assert.equal(unknownOrderWebhook.status, 200, 'a signed webhook for an unknown order is acknowledged without crediting');
  const unknownOrderBody = await unknownOrderWebhook.json();
  assert.equal(unknownOrderBody.ignored, 'unknown_order');
  delete process.env.RAZORPAY_WEBHOOK_SECRET;

  for (const provider of ['sarvam', 'cartesia']) {
    const unavailableVoiceTest = await fetch(`${baseUrl}/api/voice/test-${provider}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: 'No external synthesis should occur in this test.' })
    });
    assert.equal(unavailableVoiceTest.status, 503, `${provider} test must fail before contacting a speech provider`);
  }

  const config = await fetch(`${baseUrl}/api/config`).then(response => response.json());
  assert.equal(config.hasGoogleAuth, false);
  assert.equal(config.hasRazorpay, false);
  assert.equal(config.hasPersistentDatabase, false);
  assert.equal(config.databaseBackend, 'ephemeral_sqlite');

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 503);
  assert.equal(health.status, 'degraded');
  assert.equal(health.providers.database, 'not_configured');
  assert.equal(health.providers.databaseBackend, 'ephemeral_sqlite');
  assert.equal(health.providers.aiGeneration, 'not_configured');
  assert.equal(health.providers.voiceGateway, 'not_configured');

  testDb.prepare('INSERT INTO employees (id, tenant_id, name, type, primary_language, voice) VALUES (?, ?, ?, ?, ?, ?)')
    .run('tenant-a-employee', 'tenant-a', 'Tenant A Agent', 'instant_lead', 'en', 'E01');
  testDb.prepare('INSERT INTO employees (id, tenant_id, name, type, primary_language, voice) VALUES (?, ?, ?, ?, ?, ?)')
    .run('tenant-b-employee', 'tenant-b', 'Tenant B Agent', 'instant_lead', 'en', 'E01');
  testDb.prepare('INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('tenant-a-draft-employee', 'tenant-a', 'Draft Support Agent', 'customer_support', 'en', 'E01', 'draft');
  testDb.prepare('INSERT INTO leads (id, tenant_id, name, phone) VALUES (?, ?, ?, ?)')
    .run('tenant-a-lead', 'tenant-a', 'A Contact', '+14155550101');
  testDb.prepare('INSERT INTO leads (id, tenant_id, name, phone) VALUES (?, ?, ?, ?)')
    .run('tenant-b-lead', 'tenant-b', 'B Contact', '+14155550102');
  testDb.prepare('INSERT INTO campaigns (id, tenant_id, name) VALUES (?, ?, ?)')
    .run('tenant-a-campaign', 'tenant-a', 'A Draft');
  testDb.prepare('INSERT INTO campaigns (id, tenant_id, name) VALUES (?, ?, ?)')
    .run('tenant-b-campaign', 'tenant-b', 'B Draft');
  const now = new Date();
  const recentCallTime = new Date(now.getTime() - 60_000).toISOString().replace('T', ' ').slice(0, 19);
  const oldCallTime = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  testDb.prepare('INSERT INTO calls (id, tenant_id, phone, contact_name, duration_seconds, direction, channel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('tenant-a-recent-call', 'tenant-a', '+14155550110', 'Recent Customer', 45, 'inbound', 'Inbound', recentCallTime);
  testDb.prepare('INSERT INTO calls (id, tenant_id, phone, contact_name, duration_seconds, direction, channel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('tenant-a-unanswered-call', 'tenant-a', '+14155550111', 'Unanswered Customer', 0, 'outbound', 'Outbound', recentCallTime);
  testDb.prepare('INSERT INTO calls (id, tenant_id, phone, contact_name, duration_seconds, direction, channel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('tenant-a-old-call', 'tenant-a', '+14155550112', 'Old Customer', 90, 'outbound', 'Outbound', oldCallTime);
  testDb.prepare('INSERT INTO calls (id, tenant_id, phone, contact_name, duration_seconds, direction, channel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('tenant-b-recent-call', 'tenant-b', '+14155550113', 'Other Workspace', 120, 'outbound', 'Outbound', recentCallTime);
  testDb.prepare('INSERT INTO leads (id, tenant_id, name, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('tenant-a-recent-qualified', 'tenant-a', 'Recent Qualified', '+14155550114', 'qualified', recentCallTime);
  testDb.prepare('INSERT INTO leads (id, tenant_id, name, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('tenant-a-old-qualified', 'tenant-a', 'Old Qualified', '+14155550115', 'qualified', oldCallTime);
  testDb.prepare('INSERT INTO billing (id, tenant_id, balance_credits, balance_inr, rate_standard) VALUES (?, ?, ?, ?, ?)')
    .run('tenant-a-billing', 'tenant-a', 100, 100, 10);

  const tenantA = jwt.sign({ id: 'user-a', tenant_id: 'tenant-a', role: 'client' }, process.env.JWT_SECRET);
  const dashboardResponse = await fetch(`${baseUrl}/api/dashboard-summary?range=7d`, {
    headers: { authorization: 'Bearer ' + tenantA }
  });
  assert.equal(dashboardResponse.status, 200);
  const dashboard = await dashboardResponse.json();
  assert.equal(dashboard.totalCalls, 2, 'dashboard calls should use the selected date range and workspace');
  assert.equal(dashboard.atAGlance.customersReached, 1);
  assert.equal(dashboard.atAGlance.avgConversationFormatted, '45s');
  assert.equal(dashboard.qualifiedLeads, 1, 'qualified leads should use the selected date range');
  assert.equal(dashboard.summary.unansweredCalls, 1);
  assert.equal(dashboard.summary.minutesLeft, 10, 'available minutes should use the workspace standard rate');
  assert.equal(dashboard.summary.activeEmployeesCount, 1, 'draft employees are not counted as active');
  assert.equal(dashboard.recentCalls.some(call => call.tenant_id === 'tenant-b'), false);

  const performanceResponse = await fetch(`${baseUrl}/api/performance?range=all`, {
    headers: { authorization: 'Bearer ' + tenantA }
  });
  assert.equal(performanceResponse.status, 200);
  const performance = await performanceResponse.json();
  assert.equal(performance.summary.totalCalls, 3, 'analytics must count only this tenant actual calls');
  assert.equal(performance.summary.totalTalkTimeHours, '0.0');
  assert.equal(performance.summary.avgDurationSec, 68);
  assert.equal(performance.funnel[0].count, 3);
  assert.equal(performance.funnel[1].count, 2);
  assert.equal(performance.funnel[3].count, 2);

  const recentPerformanceResponse = await fetch(`${baseUrl}/api/performance?range=7d`, {
    headers: { authorization: 'Bearer ' + tenantA }
  });
  assert.equal(recentPerformanceResponse.status, 200);
  assert.equal((await recentPerformanceResponse.json()).summary.totalCalls, 2);

  const invalidPerformanceRange = await fetch(`${baseUrl}/api/performance?range=year`, {
    headers: { authorization: 'Bearer ' + tenantA }
  });
  assert.equal(invalidPerformanceRange.status, 400);

  for (const route of ['/api/employees', '/api/campaigns', '/api/leads', '/api/calls']) {
    const response = await fetch(`${baseUrl}${route}`, { headers: { authorization: `Bearer ${tenantA}` } });
    assert.equal(response.status, 200, `${route} should load for an authenticated tenant`);
    const rows = await response.json();
    assert.equal(rows.some(row => row.tenant_id === 'tenant-b'), false, `${route} must not expose another tenant's rows`);
  }

  const saveEmployee = await fetch(`${baseUrl}/api/employees`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      name: 'Workspace Agent',
      primary_language: 'te',
      scriptSteps: [{ id: 1, title: 'Qualify', body: 'Ask the contact about their needs.' }]
    })
  });
  const savedEmployee = await saveEmployee.json();
  assert.equal(saveEmployee.status, 200);
  const storedEmployee = testDb.prepare('SELECT tenant_id, call_steps FROM employees WHERE id = ?').get(savedEmployee.id);
  assert.equal(storedEmployee.tenant_id, 'tenant-a');
  assert.equal(JSON.parse(storedEmployee.call_steps)[0].body, 'Ask the contact about their needs.');

  const crossTenantUpdate = await fetch(`${baseUrl}/api/employees`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({ id: 'tenant-b-employee', name: 'Hijacked', primary_language: 'en' })
  });
  assert.notEqual(crossTenantUpdate.status, 200);
  assert.equal(testDb.prepare('SELECT name FROM employees WHERE id = ?').get('tenant-b-employee').name, 'Tenant B Agent');

  const createDraft = await fetch(`${baseUrl}/api/campaigns`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      name: 'Uploaded contacts',
      employee_id: 'tenant-a-employee',
      leads: [{ name: 'New Contact', phone: '+14155550103' }]
    })
  });
  const draftResult = await createDraft.json();
  assert.equal(createDraft.status, 200);
  assert.equal(draftResult.status, 'draft');
  assert.equal(draftResult.dialingStarted, false);
  assert.equal(draftResult.leadsCreated, 1);
  assert.equal(
    testDb.prepare('SELECT employee_id FROM campaigns WHERE id = ?').get(draftResult.id).employee_id,
    'tenant-a-employee'
  );

  const unassignedCampaign = await fetch(`${baseUrl}/api/campaigns`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tenantA },
    body: JSON.stringify({
      name: 'Unassigned campaign',
      leads: [{ name: 'New Contact', phone: '+14155550105' }]
    })
  });
  assert.equal(unassignedCampaign.status, 400);
  assert.match((await unassignedCampaign.json()).error, /select a published AI employee/i);

  const draftEmployeeCampaign = await fetch(`${baseUrl}/api/campaigns`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tenantA },
    body: JSON.stringify({
      name: 'Draft employee campaign',
      employee_id: 'tenant-a-draft-employee',
      leads: [{ name: 'New Contact', phone: '+14155550104' }]
    })
  });
  assert.equal(draftEmployeeCampaign.status, 400);
  assert.match((await draftEmployeeCampaign.json()).error, /publish this employee/i);

  const addDncEntry = await fetch(`${baseUrl}/api/dnc`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({ phone: '98490 12345', reason: 'Caller requested no further calls' })
  });
  const dncEntry = await addDncEntry.json();
  assert.equal(addDncEntry.status, 200);
  assert.equal(dncEntry.entry.phone, '+919849012345', 'DNC entries should be normalized to E.164');

  const blockedDncCall = await fetch(`${baseUrl}/api/calls/dispatch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      phone: '98490 12345',
      employee_id: 'tenant-a-employee',
      employee: { name: 'Untrusted client employee', opening_greeting: 'Override' }
    })
  });
  assert.equal(blockedDncCall.status, 403, 'DNC entries must block calls before provider dispatch');
  assert.equal(testDb.prepare('SELECT COUNT(*) AS count FROM calls WHERE phone = ?').get('+919849012345').count, 0);

  const crossTenantEmployeeCall = await fetch(`${baseUrl}/api/calls/dispatch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      phone: '+919849012346',
      employee_id: 'tenant-b-employee',
      employee: { name: 'Untrusted cross-tenant employee' }
    })
  });
  assert.equal(crossTenantEmployeeCall.status, 403, 'calls must not use another workspace employee');

  const inlineEmployeeWithoutId = await fetch(`${baseUrl}/api/calls/dispatch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      phone: '+919849012347',
      employee: { name: 'Unpersisted employee', opening_greeting: 'Client-controlled script' }
    })
  });
  assert.equal(inlineEmployeeWithoutId.status, 400, 'client-supplied employee data must not authorize dispatch');

  const inlineEmployeeWithUnknownId = await fetch(`${baseUrl}/api/calls/dispatch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      phone: '+919849012348',
      employee_id: 'not-saved-employee',
      employee: { name: 'Unpersisted employee', opening_greeting: 'Client-controlled script' }
    })
  });
  assert.equal(inlineEmployeeWithUnknownId.status, 404, 'an inline profile must not substitute for a saved employee');

  const draftEmployeeCall = await fetch(`${baseUrl}/api/calls/dispatch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tenantA}` },
    body: JSON.stringify({
      phone: '+919849012349',
      employee_id: 'tenant-a-draft-employee',
      employee: { name: 'Draft Support Agent', opening_greeting: 'Client override' }
    })
  });
  assert.equal(draftEmployeeCall.status, 400, 'draft employees must not be dispatched');
  assert.equal(
    testDb.prepare("SELECT COUNT(*) AS count FROM calls WHERE phone IN (?, ?, ?)").get(
      '+919849012347',
      '+919849012348',
      '+919849012349'
    ).count,
    0,
    'rejected employee profiles must not create call records'
  );

  const originalFetch = globalThis.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  process.env.GOOGLE_CLIENT_ID = 'google-client-test';
  const missingDatabaseResponse = await originalFetch(`${baseUrl}/api/auth/google`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ credential: 'mock-google-id-token' })
  });
  const missingDatabaseData = await missingDatabaseResponse.json();
  assert.equal(missingDatabaseResponse.status, 503, 'Vercel must not issue accounts backed by ephemeral SQLite');
  assert.match(missingDatabaseData.error, /persistent business data storage/i);

  process.env.NODE_ENV = 'test';
  globalThis.fetch = async (input, init) => {
    if (String(input).includes('oauth2.googleapis.com/tokeninfo')) {
      return new Response(JSON.stringify({
        aud: 'google-client-test',
        email_verified: true,
        email: 'verified-login@example.com',
        name: 'Verified User',
        sub: 'google-sub-test'
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return originalFetch(input, init);
  };
  try {
    const loginResponse = await originalFetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ credential: 'mock-google-id-token' })
    });
    const loginData = await loginResponse.json();
    assert.equal(loginResponse.status, 200, 'verified Google login should accept boolean email_verified');
    assert.equal(loginData.success, true);
    assert.equal(loginData.user.email, 'verified-login@example.com');
    const newTenantId = loginData.user.tenant_id;
    const signupBalance = testDb.prepare('SELECT balance_credits, balance_inr FROM billing WHERE tenant_id = ?').get(newTenantId);
    assert.equal(signupBalance.balance_credits, 50, 'new accounts receive the advertised 50 free credits');
    assert.equal(signupBalance.balance_inr, 0, 'free signup credits are not recorded as paid revenue');
    assert.equal(
      testDb.prepare("SELECT COUNT(*) AS count FROM transactions WHERE tenant_id = ? AND type = 'signup_bonus' AND credits = 50").get(newTenantId).count,
      1,
      'signup credits are represented in the account ledger'
    );

    const profileResponse = await originalFetch(`${baseUrl}/api/auth/me`, {
      headers: { authorization: `Bearer ${loginData.token}` }
    });
    const profileData = await profileResponse.json();
    assert.equal(profileResponse.status, 200, 'newly issued token should validate on the profile endpoint');
    assert.equal(profileData.user.id, loginData.user.id);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.GOOGLE_CLIENT_ID = '';
    process.env.NODE_ENV = originalNodeEnv;
  }
});

test.after(async () => {
  if (appServer?.listening) {
    await new Promise(resolve => appServer.close(resolve));
  }
  testDb?.close();
  if (fs.existsSync(testDbDir)) {
    fs.rmSync(testDbDir, { recursive: true, force: true });
  }
  delete process.env.SARVAM_DB_PATH;
  delete process.env.VERCEL;
});
