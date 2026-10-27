import jwt from 'jsonwebtoken';

const BASE_URL = 'https://sarvam-eta-rose.vercel.app';
const JWT_SECRET = 'sarvam_production_secret_key_849203810293';

async function runVerification() {
  console.log(`Starting Live Employee Suite Verification on ${BASE_URL}...`);

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('1. Health check status:', healthRes.status, 'db backend:', healthData.database?.backend, 'status:', healthData.database?.status);

  // 2. Generate signed JWT matching production secret
  const token = jwt.sign(
    {
      id: 'usr_owner_demo',
      email: 'owner@telugudemo.com',
      role: 'owner',
      tenant_id: 'tenant_demo_owner'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log('2. Production JWT token generated for tenant: tenant_demo_owner');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Test Swara Copilot script rewrite
  const copilotRes = await fetch(`${BASE_URL}/api/copilot/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'Add a step to ask callers about their budget and tile sizes',
      language: 'te',
      currentSteps: [
        { id: 1, title: 'Open conversation', content: 'నమస్కారం, సనా టైల్స్ షోరూమ్‌కు స్వాగతం.' },
        { id: 2, title: 'Understand need', content: 'Listen and ask what they need.' }
      ]
    })
  });
  const copilotData = await copilotRes.json();
  console.log('3. Swara Copilot response status:', copilotRes.status);
  console.log('   Copilot reply snippet:', (copilotData.reply || '').substring(0, 100));
  if (copilotData.steps && copilotData.steps.length > 0) {
    console.log('   Copilot rewritten steps count:', copilotData.steps.length);
  }

  // 4. Create an Employee in Production Turso
  const testEmpId = `emp_live_test_${Date.now()}`;
  const createEmpRes = await fetch(`${BASE_URL}/api/employees`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      id: testEmpId,
      name: 'కావ్య (Kavya Live Test)',
      role: 'సేల్స్ ఎగ్జిక్యూటివ్',
      language: 'te',
      business_name: 'సనా టైల్స్ షోరూమ్',
      opening_greeting: 'నమస్కారం, సనా టైల్స్ షోరూమ్‌కు స్వాగతం. నేను కావ్య. మీకు ఎలా సహాయం చేయగలను?',
      prompt: 'Detailed Telugu tiles showroom employee prompt with 5 steps.',
      status: 'active',
      voice_id: 'meera',
      steps: [
        { id: 1, title: 'Open the conversation', content: 'నమస్కారం, సనా టైల్స్ షోరూమ్‌కు స్వాగతం. నేను కావ్య.' },
        { id: 2, title: 'Understand the caller’s need', content: 'మీకు ఏ రకమైన టైల్స్ కావాలి? మీ బడ్జెట్ ఎంత ఉంది?' },
        { id: 3, title: 'Answer from confirmed business info', content: 'Ceramic tiles and flooring solutions.' },
        { id: 4, title: 'Handle questions and objections safely', content: 'Do not promise discounts without confirmation.' },
        { id: 5, title: 'Offer the approved next step', content: 'Offer catalog and showroom visit.' }
      ]
    })
  });
  const createEmpData = await createEmpRes.json();
  console.log('4. Create Employee status:', createEmpRes.status, createEmpData.id || createEmpData);

  // 5. Read employees and verify created employee exists
  const getEmpRes = await fetch(`${BASE_URL}/api/employees`, { headers: authHeaders });
  const getEmpData = await getEmpRes.json();
  const foundEmp = Array.isArray(getEmpData) ? getEmpData.find(e => e.id === testEmpId) : null;
  console.log('5. List Employees: Found test employee?', Boolean(foundEmp), `(Total employees: ${getEmpData.length})`);
  if (!foundEmp) {
    console.error('Test employee was not found in listing!');
    process.exit(1);
  }

  // 6. Delete Employee in Production Turso via DELETE /api/employees/:id
  const delEmpRes = await fetch(`${BASE_URL}/api/employees/${testEmpId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const delEmpData = await delEmpRes.json();
  console.log('6. Delete Employee status:', delEmpRes.status, delEmpData);

  // 7. Re-check employees list to verify removal
  const verifyDelRes = await fetch(`${BASE_URL}/api/employees`, { headers: authHeaders });
  const verifyDelData = await verifyDelRes.json();
  const stillExists = Array.isArray(verifyDelData) && verifyDelData.some(e => e.id === testEmpId);
  console.log('7. Re-list Employees: Is employee completely removed?', !stillExists);

  if (stillExists) {
    console.error('FAILED: Employee was not removed from database.');
    process.exit(1);
  }

  console.log('\n ALL LIVE EMPLOYEE FEATURES & DELETION VERIFIED SUCCESSFULLY ON PRODUCTION!');
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
