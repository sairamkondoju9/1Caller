import test from 'node:test';
import assert from 'node:assert/strict';
import { CartesiaClient } from './cartesiaClient.js';
import { SarvamClient } from './sarvamClient.js';

test('speech providers fail explicitly when credentials are missing', async () => {
  const sarvam = new SarvamClient('');
  const cartesia = new CartesiaClient('');

  await assert.rejects(sarvam.synthesizeSpeech({ text: 'hello' }), /SARVAM_API_KEY is not configured/);
  await assert.rejects(sarvam.transcribeAudio({ audioBuffer: Buffer.from('audio') }), /SARVAM_API_KEY is not configured/);
  await assert.rejects(sarvam.generateCompletion({ messages: [] }), /SARVAM_API_KEY is not configured/);
  await assert.rejects(cartesia.synthesizeSpeech({ text: 'hello' }), /CARTESIA_API_KEY is not configured/);
});

test('Sarvam rejects missing audio rather than returning a mock transcript', async () => {
  const sarvam = new SarvamClient('test-key');
  await assert.rejects(sarvam.transcribeAudio({}), /Audio data is required/);
});

test('Sarvam rejects unsuccessful upstream responses', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('provider unavailable', { status: 503 });
  try {
    const sarvam = new SarvamClient('test-key');
    await assert.rejects(
      sarvam.generateCompletion({ messages: [{ role: 'user', content: 'hello' }] }),
      /Sarvam completion failed \(503\)/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Cartesia reports real synthesis output and does not synthesize fallback audio', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 });
  try {
    const cartesia = new CartesiaClient('test-key');
    const result = await cartesia.synthesizeSpeech({ text: 'hello' });
    assert.equal(result.liveApi, true);
    assert.equal(result.audioBase64, Buffer.from([1, 2, 3]).toString('base64'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
