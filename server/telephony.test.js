import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneNumber, SarvamTelephonyService } from './telephony.js';

test('formatPhoneNumber formats Indian phone numbers to E.164 standard', () => {
  assert.equal(formatPhoneNumber('9849012345'), '+919849012345');
  assert.equal(formatPhoneNumber('09849012345'), '+919849012345');
  assert.equal(formatPhoneNumber('919849012345'), '+919849012345');
  assert.equal(formatPhoneNumber('+91 98490 12345'), '+919849012345');
  assert.equal(formatPhoneNumber('+919849012345'), '+919849012345');
});

test('SarvamTelephonyService requires destination number and API key', async () => {
  const service = new SarvamTelephonyService({ apiKey: '' });
  await assert.rejects(
    () => service.dialCall({ to: '9849012345' }),
    /SARVAM_TELEPHONY_API_KEY is not configured/
  );

  const activeService = new SarvamTelephonyService({
    apiKey: 'test-key',
    orgId: '',
    workspaceId: ''
  });
  await assert.rejects(
    () => activeService.dialCall({ to: '' }),
    /Destination phone number is required/
  );
});
