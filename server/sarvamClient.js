/**
 * Sarvam AI API Client Adapter
 * Official Specs:
 * - ASR: Sarvam Saaras v3 (WebSocket streaming, 8k->16k BWE, 22 Indian languages)
 * - TTS: Sarvam Bulbul V4 Flash (95ms first chunk, native Telugu/Tamil/Kannada/Marathi/Hindi prosody)
 * - LLM: Sarvam-M 30B (Apache-2.0, Indian context & multilingual voice prompt tuned)
 */

export class SarvamClient {
  constructor(apiKey = process.env.SARVAM_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.sarvam.ai';
  }

  // 1. Sarvam Bulbul V4 Flash Text-to-Speech
  async synthesizeSpeech({
    text,
    targetLanguageCode = 'te-IN', // Telugu default, supports hi-IN, ta-IN, kn-IN, mr-IN, bn-IN, etc.
    speaker = 'meera', // 'meera', 'pavithra', 'mahesh', 'arvind'
    model = 'bulbul:v4-flash',
    pace = 1.05
  }) {
    const tStart = Date.now();

    if (!this.apiKey) throw new Error('SARVAM_API_KEY is not configured.');

    const langPrefix = (targetLanguageCode || 'te-IN').split('-')[0].toLowerCase();
    const defaultSpeakerMap = {
      te: 'kavitha_te_conversation',
      hi: 'aditya_hi_conversational',
      en: 'simran_en_conversation',
      ta: 'aravind_ta_ads',
      kn: 'chetan_kn_conversation',
      mr: 'nilesh_mr_conversation',
      bn: 'arnab_bn_conversation',
      gu: 'pooja_gu_conversational',
      pa: 'anand_pa_conversation'
    };
    const validSpeaker = (speaker && speaker !== 'meera' && speaker !== 'pavithra' && speaker !== 'mahesh')
      ? speaker
      : (defaultSpeakerMap[langPrefix] || 'simran_en_conversation');

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': this.apiKey
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: targetLanguageCode,
          speaker: validSpeaker,
          pitch: 0,
          pace: pace,
          loudness: 1.5,
          speech_sample_rate: 16000,
          enable_preprocessing: true,
          model: model
        })
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`Sarvam text-to-speech failed (${response.status}): ${detail}`);
      }
      const data = await response.json();
      const latencyMs = Date.now() - tStart;
      const audioBase64 = data.audios?.[0];
      if (!audioBase64) throw new Error('Sarvam text-to-speech returned no audio.');

      return {
        success: true,
        model: 'Sarvam Bulbul V4 Flash',
        engine: 'bulbul:v4-flash',
        language: targetLanguageCode,
        audioBase64,
        latencyMs: latencyMs,
        mock: false
      };
    } catch (err) {
      throw new Error(`Sarvam text-to-speech request failed: ${err.message}`, { cause: err });
    }
  }

  // 2. Sarvam Saaras v3 Speech-to-Text
  async transcribeAudio({
    audioBuffer,
    languageCode = 'te-IN',
    model = 'saaras:v3'
  }) {
    const tStart = Date.now();

    if (!this.apiKey) throw new Error('SARVAM_API_KEY is not configured.');
    if (!audioBuffer?.byteLength) throw new Error('Audio data is required for transcription.');

    try {
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), 'audio.wav');
      formData.append('model', model);
      formData.append('language_code', languageCode);

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: {
          'api-subscription-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`Sarvam speech-to-text failed (${response.status}): ${detail}`);
      }
      const data = await response.json();
      const latencyMs = Date.now() - tStart;
      if (typeof data.transcript !== 'string') {
        throw new Error('Sarvam speech-to-text returned an invalid transcript.');
      }

      return {
        success: true,
        model: 'Sarvam Saaras v3 Streaming ASR',
        transcript: data.transcript || '',
        language: languageCode,
        latencyMs: latencyMs,
        mock: false
      };
    } catch (err) {
      throw new Error(`Sarvam speech-to-text request failed: ${err.message}`, { cause: err });
    }
  }

  // 3. Sarvam-M 30B LLM Chat Completion
  async generateCompletion({
    messages,
    temperature = 0.2,
    maxTokens = 120
  }) {
    const tStart = Date.now();

    if (!this.apiKey) throw new Error('SARVAM_API_KEY is not configured.');

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'sarvam-m-30b',
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`Sarvam completion failed (${response.status}): ${detail}`);
      }
      const data = await response.json();
      const ttftMs = Date.now() - tStart;
      const text = data.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) {
        throw new Error('Sarvam completion returned no response text.');
      }

      return {
        success: true,
        model: 'Sarvam-M 30B FP8 (vLLM)',
        text,
        ttftMs: ttftMs,
        mock: false
      };
    } catch (err) {
      throw new Error(`Sarvam completion request failed: ${err.message}`, { cause: err });
    }
  }
}

export const sarvam = new SarvamClient();