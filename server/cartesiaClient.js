/**
 * Cartesia Sonic-2 Production API Client Adapter
 * Official Specs:
 * - TTS: Cartesia Sonic-2 (Ultra-fast streaming WebSocket & REST, 80ms TTFB)
 * - Supported Languages: English, Hindi, Hinglish, Spanish, French, German, Japanese
 * - Audio Format: PCM 16-bit 16kHz / 24kHz / Opus 24kbps
 * - Primary Voice Engine for Antigravity Voice Platform
 */

export class CartesiaClient {
  constructor(apiKey = process.env.CARTESIA_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.cartesia.ai';
    this.version = '2024-06-10';

    // Official Cartesia Voice Presets
    this.voices = {
      indianFemale: {
        id: 'a0e99841-438c-4a64-b679-ae501e7d6091',
        name: 'Kavya - Indian English / Hindi Natural Female',
        lang: 'en'
      },
      indianMale: {
        id: '694f9389-aac1-45b6-b726-9d9369183238',
        name: 'Arjun - Indian English Conversational Male',
        lang: 'en'
      },
      globalFemale: {
        id: '79a125e8-cd45-4c13-8a67-188112f4dd22',
        name: 'Sarah - Global Executive Female',
        lang: 'en'
      },
      globalMale: {
        id: '2ee87190-8f84-47a5-9279-d29e4f07b55e',
        name: 'David - Confident Professional Male',
        lang: 'en'
      }
    };
  }

  // 1. Cartesia Sonic-2 Streaming Text-to-Speech
  async synthesizeSpeech({
    text,
    voiceId = 'a0e99841-438c-4a64-b679-ae501e7d6091',
    language = 'en',
    modelId = 'sonic-2',
    encoding = 'pcm_s16le',
    sampleRate = 16000
  }) {
    const tStart = Date.now();
    if (!this.apiKey) throw new Error('CARTESIA_API_KEY is not configured.');

    // If Cartesia API key is configured, invoke the live Cartesia Sonic-2 streaming API
    try {
      const response = await fetch(`${this.baseUrl}/tts/bytes`, {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: {
          'Cartesia-Version': this.version,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: modelId,
          transcript: text,
          voice: {
            mode: 'id',
            id: voiceId
          },
          output_format: {
            container: 'wav',
            encoding: encoding,
            sample_rate: sampleRate
          },
          language: language
        })
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`Cartesia text-to-speech failed (${response.status}): ${detail}`);
      }
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0) throw new Error('Cartesia text-to-speech returned no audio.');
      const latencyMs = Date.now() - tStart;
      const base64Audio = Buffer.from(buffer).toString('base64');

      return {
        success: true,
        model: 'Cartesia Sonic-2 Streaming TTS',
        engine: 'sonic-2',
        language: language,
        voiceId: voiceId,
        audioBase64: base64Audio,
        audioUrl: `data:audio/wav;base64,${base64Audio}`,
        latencyMs: latencyMs,
        liveApi: true,
        ttfbMs: latencyMs
      };
    } catch (err) {
      throw new Error(`Cartesia text-to-speech request failed: ${err.message}`, { cause: err });
    }
  }

  // 2. Cartesia Ink-Whisper Streaming ASR
  async transcribeAudio({
    audioBuffer,
    language = 'en'
  }) {
    void audioBuffer;
    void language;
    throw new Error('Cartesia speech-to-text is not implemented in this client.');
  }
}

export const cartesia = new CartesiaClient();