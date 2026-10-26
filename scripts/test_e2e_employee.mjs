import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/saira/sarvam/.env' });

// Dynamic import after dotenv has loaded!
const { LLMManager } = await import('../server/llmManager.js');
const { SarvamClient } = await import('../server/sarvamClient.js');
const { ensureTursoSchema } = await import('../server/tursoSchema.js');
const { createClient } = await import('@libsql/client');

async function runTest() {
  console.log('=== Step 1: Testing AI Employee Generation ===');
  const llm = new LLMManager();
  const brief = 'Create a customer care and appointment booking assistant for Dr. Sneha Dental Clinic in Jubilee Hills Hyderabad. Speaks Telugu and English.';
  
  const scriptParams = {
    prompt: brief,
    language: 'te',
    businessName: 'Dr. Sneha Dental Clinic',
    employeeName: 'Kavitha',
    role: 'Dental Clinic Care Specialist',
    industry: 'Hospital & clinic',
    offerings: ['Teeth Cleaning', 'Root Canal', 'Dental Implants', 'Orthodontic Braces'],
    priceRange: '₹500 consultation fee',
    nextActions: ['Book morning or evening doctor appointment'],
    objectionHandling: 'Explain painless modern treatments and easy EMI options'
  };

  const scriptResult = await llm.generateEmployeeScript(scriptParams);
  console.log('Generated Employee Name:', scriptResult.employee_name);
  console.log('Generated Business Name:', scriptResult.business_name);
  console.log('Generated Opening Greeting:', scriptResult.opening_greeting);
  console.log('Call Steps Count:', scriptResult.call_steps?.length);
  console.log('AI Model Used:', scriptResult.modelUsed || scriptResult.source);

  if (!scriptResult.opening_greeting || !scriptResult.call_steps?.length) {
    throw new Error('AI generation failed: incomplete script result');
  }

  console.log('\n=== Step 2: Testing Turso Database Persistence ===');
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  await ensureTursoSchema(turso);

  const testEmpId = `emp_test_${Date.now()}`;
  const tenantId = 'tenant_prod_launch_test';

  await turso.execute({
    sql: `INSERT INTO employees (
      id, tenant_id, name, type, primary_language, voice, industry,
      opening_greeting, prompt_text, call_steps, variables, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    args: [
      testEmpId,
      tenantId,
      scriptResult.employee_name || 'Kavitha',
      'instant_lead',
      'te',
      'P09',
      'Hospital & clinic',
      scriptResult.opening_greeting,
      brief,
      JSON.stringify(scriptResult.call_steps),
      JSON.stringify(scriptParams.offerings)
    ]
  });

  const queryRes = await turso.execute({
    sql: 'SELECT * FROM employees WHERE id = ?',
    args: [testEmpId]
  });

  if (!queryRes.rows.length) {
    throw new Error('Persistence failed: employee row was not found in Turso');
  }
  const persisted = queryRes.rows[0];
  console.log('Successfully persisted to Turso:');
  console.log('  ID:', persisted.id);
  console.log('  Name:', persisted.name);
  console.log('  Primary Language:', persisted.primary_language);
  console.log('  Opening Greeting:', persisted.opening_greeting);

  console.log('\n=== Step 3: Testing Sarvam Voice Synthesis on Saved Greeting ===');
  const sarvam = new SarvamClient(process.env.SARVAM_API_KEY);
  const ttsRes = await sarvam.synthesizeSpeech({
    text: persisted.opening_greeting,
    targetLanguageCode: 'te-IN'
  });
  console.log('Synthesized audio base64 chars:', ttsRes.audioBase64?.length);
  console.log('Synthesis latency ms:', ttsRes.latencyMs);

  // Clean up test employee
  await turso.execute({
    sql: 'DELETE FROM employees WHERE id = ?',
    args: [testEmpId]
  });
  console.log('Cleaned up test record.');

  console.log('\n>>> ALL 3 WORKFLOW STEPS VERIFIED WITH LIVE SERVICES! <<<');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
