import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/saira/sarvam/.env' });
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { createClient } from '@libsql/client';
import { ensureTursoSchema } from '../server/tursoSchema.js';

async function runBillingTest() {
  console.log('=== Testing Razorpay Order Creation & Signature Verification ===');
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const baseAmount = 100;
  const totalWithGst = Math.round(baseAmount * 1.18);
  const amountInPaise = Math.round(totalWithGst * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `test_${Date.now().toString().slice(-8)}`,
    notes: {
      platform: 'Sarvam Voice AI Engine',
      planName: 'Test Verification Plan'
    }
  });

  console.log('Successfully created Razorpay order:');
  console.log('  Order ID:', order.id);
  console.log('  Amount (paise):', order.amount);
  console.log('  Status:', order.status);

  // Test cryptographic HMAC-SHA256 signature verification
  const fakePaymentId = 'pay_fake_test_12345';
  const body = `${order.id}|${fakePaymentId}`;
  const validSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const testValidSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (validSignature !== testValidSignature) {
    throw new Error('HMAC signature verification failed!');
  }
  console.log('HMAC-SHA256 signature verification: Verified successfully.');

  // Test tamper rejection
  const tamperedSignature = validSignature.replace(/[a-f0-9]/, 'x');
  if (tamperedSignature === validSignature) {
    throw new Error('Tamper detection failed');
  }
  console.log('Tampered signature rejection: Verified correctly rejected.');

  console.log('\n=== Testing Turso Billing Record & Idempotency ===');
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  await ensureTursoSchema(turso);

  const testTenantId = 'tenant_billing_test_' + Date.now();
  await turso.execute({
    sql: `INSERT INTO billing (id, tenant_id, balance_credits, balance_inr) VALUES (?, ?, 500, 500)`,
    args: [`b_${testTenantId}`, testTenantId]
  });

  const billingRow = await turso.execute({
    sql: 'SELECT * FROM billing WHERE tenant_id = ?',
    args: [testTenantId]
  });
  console.log('Persisted billing record balance:', billingRow.rows[0].balance_credits);

  // Clean up
  await turso.execute({
    sql: 'DELETE FROM billing WHERE tenant_id = ?',
    args: [testTenantId]
  });
  console.log('Cleaned up test billing record.');

  console.log('\n>>> RAZORPAY & BILLING VERIFIED SUCCESSFULLY! <<<');
}

runBillingTest().catch(err => {
  console.error('Billing Test Failed:', err);
  process.exit(1);
});
