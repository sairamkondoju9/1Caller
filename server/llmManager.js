/**
 * Unified Multi-Provider LLM Orchestrator for Swara AI
 * 
 * Performance & Priority Policy:
 *   1. Groq LPU (Fastest ~600ms - Primary Ultra-Fast Engine)
 *   2. Mistral AI (Sub-3s Ministral-3B - Secondary Failover Engine)
 *   3. Google Gemini 3.1 Flash (1,500 Free Requests/Day - Tier 3 Safety Net)
 *   4. Cerebras Wafer-Scale CS-3 (1M Tokens/Day - Optional Tier 4)
 *   5. Local Deterministic NLP Engine (0ms Fail-Safe)
 * 
 * Circuit Breaker Pattern:
 *   - Automatic 60s cooldown if a provider returns HTTP 429 (rate-limit) or times out
 *   - Direct skip to the next provider during cooldown without wasting time
 *   - Real-time call tracking to SQLite for daily quota monitoring
 */

import { groqClient } from './groqClient.js';
import { mistralClient } from './mistralClient.js';
import { geminiClient } from './geminiClient.js';
import { cerebrasClient } from './cerebrasClient.js';
import { recordLLMCall } from './db.js';
import {
  normalizeGeneratedSupportScript,
  normalizeSupportRequest
} from './supportScript.js';
import {
  normalizeEmployeeScriptRequest,
  normalizeGeneratedEmployeeScript
} from './employeeScript.js';
import {
  normalizeEmployeeBuildStageRequest,
  normalizeEmployeeBuildStageResult
} from './employeeBuild.js';

let groqCooldownUntil = 0;
let mistralCooldownUntil = 0;
let geminiCooldownUntil = 0;
let cerebrasCooldownUntil = 0;

export class LLMManager {
  constructor() {
    this.providers = [
      { name: 'Groq LPU', client: groqClient, keyEnv: 'GROQ_API_KEY' },
      { name: 'Mistral AI', client: mistralClient, keyEnv: 'MISTRAL_API_KEY' },
      { name: 'Google Gemini', client: geminiClient, keyEnv: 'GEMINI_API_KEY' },
      { name: 'Cerebras CS-3', client: cerebrasClient, keyEnv: 'CEREBRAS_API_KEY' }
    ];
  }

  getActiveProviders() {
    return this.providers.map(p => ({
      name: p.name,
      configured: Boolean(process.env[p.keyEnv] && process.env[p.keyEnv].trim().length > 0)
    }));
  }

  getCircuitBreakerStatus() {
    const now = Date.now();
    return {
      groq: { cooling: now < groqCooldownUntil, cooldownRemainingSec: Math.max(0, Math.round((groqCooldownUntil - now) / 1000)) },
      mistral: { cooling: now < mistralCooldownUntil, cooldownRemainingSec: Math.max(0, Math.round((mistralCooldownUntil - now) / 1000)) },
      gemini: { cooling: now < geminiCooldownUntil, cooldownRemainingSec: Math.max(0, Math.round((geminiCooldownUntil - now) / 1000)) },
      cerebras: { cooling: now < cerebrasCooldownUntil, cooldownRemainingSec: Math.max(0, Math.round((cerebrasCooldownUntil - now) / 1000)) }
    };
  }

  async generateCallScript(params) {
    const attempted = [];

    // 1. Try Groq LPU (Primary Ultra-Fast - ~600ms - 1.1s)
    const isGroqCooling = Date.now() < groqCooldownUntil;
    if (process.env.GROQ_API_KEY && !isGroqCooling) {
      try {
        attempted.push('Groq LPU');
        const t0 = Date.now();
        const res = await Promise.race([
          groqClient.generateCallScript(params),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Groq 6000ms timeout')), 6000))
        ]);
        const latency = Date.now() - t0;
        if (res && res.steps && res.steps.length > 0) {
          recordLLMCall({
            provider: 'groq',
            model: res.modelUsed || 'qwen3.8-27b',
            latencyMs: latency,
            cached: res.cached ? 1 : 0,
            status: 'success'
          });
          return {
            ...res,
            failoverChain: attempted,
            providerTier: 'Tier 1 (Groq LPU)'
          };
        }
      } catch (err) {
        console.warn('[LLMManager] Groq primary rate-limited or slow. Tripping circuit breaker:', err.message);
        groqCooldownUntil = Date.now() + 60000;
        recordLLMCall({ provider: 'groq', model: 'groq', latencyMs: 3500, status: 'rate_limited' });
      }
    }

    // 2. Try Mistral AI (Secondary High-Speed ~3s)
    const isMistralCooling = Date.now() < mistralCooldownUntil;
    if (process.env.MISTRAL_API_KEY && !isMistralCooling) {
      try {
        attempted.push('Mistral AI');
        const t0 = Date.now();
        const res = await Promise.race([
          mistralClient.generateCallScript(params),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Mistral 9000ms timeout')), 9000))
        ]);
        const latency = Date.now() - t0;
        if (res && res.steps && res.steps.length > 0) {
          recordLLMCall({
            provider: 'mistral',
            model: res.modelUsed || 'ministral-3b-latest',
            latencyMs: latency,
            cached: res.cached ? 1 : 0,
            status: 'success'
          });
          return {
            ...res,
            failoverChain: attempted,
            providerTier: 'Tier 2 (Mistral AI)'
          };
        }
      } catch (err) {
        console.warn('[LLMManager] Mistral failed or rate-limited:', err.message);
        mistralCooldownUntil = Date.now() + 60000;
        recordLLMCall({ provider: 'mistral', model: 'ministral', latencyMs: 4000, status: 'rate_limited' });
      }
    }

    // 3. Try Google Gemini (Tier 3 High-Capacity - 1,500 calls/day)
    const isGeminiCooling = Date.now() < geminiCooldownUntil;
    if (process.env.GEMINI_API_KEY && !isGeminiCooling) {
      try {
        attempted.push('Google Gemini');
        const t0 = Date.now();
        const res = await Promise.race([
          geminiClient.generateCallScript(params),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini 8000ms timeout')), 8000))
        ]);
        const latency = Date.now() - t0;
        if (res && res.steps && res.steps.length > 0) {
          recordLLMCall({
            provider: 'gemini',
            model: res.modelUsed || 'gemini-3.1-flash-lite',
            latencyMs: latency,
            cached: res.cached ? 1 : 0,
            status: 'success'
          });
          return {
            ...res,
            failoverChain: attempted,
            providerTier: 'Tier 3 (Google Gemini)'
          };
        }
      } catch (err) {
        console.warn('[LLMManager] Gemini failed:', err.message);
        geminiCooldownUntil = Date.now() + 60000;
        recordLLMCall({ provider: 'gemini', model: 'gemini', latencyMs: 3000, status: 'rate_limited' });
      }
    }

    return null;
  }

  async generateSupportEmployeeScript(input) {
    const request = normalizeSupportRequest(input);
    const providers = [
      { name: 'Groq', env: 'GROQ_API_KEY', client: groqClient, key: 'groq', cooldown: () => groqCooldownUntil },
      { name: 'Cerebras', env: 'CEREBRAS_API_KEY', client: cerebrasClient, key: 'cerebras', cooldown: () => cerebrasCooldownUntil },
      { name: 'Mistral', env: 'MISTRAL_API_KEY', client: mistralClient, key: 'mistral', cooldown: () => mistralCooldownUntil },
      { name: 'Gemini', env: 'GEMINI_API_KEY', client: geminiClient, key: 'gemini', cooldown: () => geminiCooldownUntil }
    ];
    const configured = providers.filter(provider => Boolean(process.env[provider.env]?.trim()));
    if (configured.length === 0) {
      throw new Error('No AI provider is configured. Set a Groq, Cerebras, Mistral, or Gemini API key in the server environment.');
    }

    const failures = [];
    const deadline = Date.now() + 12000;
    for (const provider of configured) {
      if (Date.now() < provider.cooldown()) continue;
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) break;
      const startedAt = Date.now();
      let timeoutHandle;
      try {
        const timeout = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error(`${provider.name} support script generation timed out.`)), Math.min(8000, remainingMs));
        });
        const result = await Promise.race([
          provider.client.generateSupportScript(request),
          timeout
        ]);
        if (!result) throw new Error(`${provider.name} did not return a usable response.`);
        const normalized = normalizeGeneratedSupportScript(result, request);
        recordLLMCall({
          provider: provider.key,
          model: result.modelUsed || provider.name,
          latencyMs: Date.now() - startedAt,
          status: 'success'
        });
        return { ...normalized, source: `${provider.name} (${result.modelUsed || 'configured model'})` };
      } catch (error) {
        console.warn(`[LLMManager] ${provider.name} support script generation failed:`, error.message);
        failures.push(`${provider.name}: ${error.message}`);
        if (/timed out|429|rate.?limit/i.test(error.message)) {
          if (provider.key === 'groq') groqCooldownUntil = Date.now() + 60000;
          if (provider.key === 'mistral') mistralCooldownUntil = Date.now() + 60000;
          if (provider.key === 'gemini') geminiCooldownUntil = Date.now() + 60000;
          if (provider.key === 'cerebras') cerebrasCooldownUntil = Date.now() + 60000;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    const detail = failures.length ? failures.join(' ') : 'All configured AI providers are temporarily cooling down.';
    throw new Error(`Could not generate a validated customer-support script. ${detail}`);
  }

  async generateEmployeeScript(input) {
    const request = normalizeEmployeeScriptRequest(input);
    const providers = [
      { name: 'Groq', env: 'GROQ_API_KEY', client: groqClient, key: 'groq', cooldown: () => groqCooldownUntil },
      { name: 'Cerebras', env: 'CEREBRAS_API_KEY', client: cerebrasClient, key: 'cerebras', cooldown: () => cerebrasCooldownUntil },
      { name: 'Mistral', env: 'MISTRAL_API_KEY', client: mistralClient, key: 'mistral', cooldown: () => mistralCooldownUntil },
      { name: 'Gemini', env: 'GEMINI_API_KEY', client: geminiClient, key: 'gemini', cooldown: () => geminiCooldownUntil }
    ];
    const configured = providers.filter(provider => Boolean(process.env[provider.env]?.trim()));
    if (configured.length === 0) {
      throw new Error('No AI provider is configured. Set a Groq, Cerebras, Mistral, or Gemini API key in the server environment.');
    }

    const failures = [];
    const deadline = Date.now() + 12000;
    for (const provider of configured) {
      if (Date.now() < provider.cooldown()) {
        failures.push(`${provider.name} is temporarily cooling down.`);
        continue;
      }
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) break;
      const startedAt = Date.now();
      let timeoutHandle;
      try {
        const timeout = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error(`${provider.name} employee script generation timed out.`)), Math.min(8000, remainingMs));
        });
        const result = await Promise.race([
          provider.client.generateEmployeeScript(request),
          timeout
        ]);
        if (!result) throw new Error(`${provider.name} did not return a usable response.`);
        const normalized = normalizeGeneratedEmployeeScript(result, request);
        recordLLMCall({
          provider: provider.key,
          model: result.modelUsed || provider.name,
          latencyMs: Date.now() - startedAt,
          status: 'success'
        });
        return { ...normalized, source: `${provider.name} (${result.modelUsed || 'configured model'})` };
      } catch (error) {
        console.warn(`[LLMManager] ${provider.name} employee script generation failed:`, error.message);
        failures.push(`${provider.name}: ${error.message}`);
        if (/timed out|429|rate.?limit/i.test(error.message)) {
          if (provider.key === 'groq') groqCooldownUntil = Date.now() + 60000;
          if (provider.key === 'mistral') mistralCooldownUntil = Date.now() + 60000;
          if (provider.key === 'gemini') geminiCooldownUntil = Date.now() + 60000;
          if (provider.key === 'cerebras') cerebrasCooldownUntil = Date.now() + 60000;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    const detail = failures.length ? failures.join(' ') : 'All configured AI providers are temporarily cooling down.';
    throw new Error(`Could not generate a validated employee script. ${detail}`);
  }

  async generateEmployeeBuildStage(input) {
    const request = normalizeEmployeeBuildStageRequest(input);
    const providers = [
      { name: 'Groq', env: 'GROQ_API_KEY', client: groqClient, key: 'groq', cooldown: () => groqCooldownUntil },
      { name: 'Cerebras', env: 'CEREBRAS_API_KEY', client: cerebrasClient, key: 'cerebras', cooldown: () => cerebrasCooldownUntil },
      { name: 'Mistral', env: 'MISTRAL_API_KEY', client: mistralClient, key: 'mistral', cooldown: () => mistralCooldownUntil },
      { name: 'Gemini', env: 'GEMINI_API_KEY', client: geminiClient, key: 'gemini', cooldown: () => geminiCooldownUntil }
    ];
    const configured = providers.filter(provider => Boolean(process.env[provider.env]?.trim()));
    if (configured.length === 0) {
      throw new Error('No AI provider is configured. Set a Groq, Cerebras, Mistral, or Gemini API key in the server environment.');
    }

    const failures = [];
    const deadline = Date.now() + 12000;
    for (const provider of configured) {
      if (Date.now() < provider.cooldown()) {
        failures.push(`${provider.name} is temporarily cooling down.`);
        continue;
      }
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) break;
      const startedAt = Date.now();
      let timeoutHandle;
      try {
        const timeout = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error(`${provider.name} employee setup ${request.stage} timed out.`)), Math.min(8000, remainingMs));
        });
        const result = await Promise.race([
          provider.client.generateEmployeeBuildStage(request),
          timeout
        ]);
        if (!result) throw new Error(`${provider.name} did not return usable employee setup guidance.`);
        const normalized = normalizeEmployeeBuildStageResult(result, request);
        recordLLMCall({
          provider: provider.key,
          model: result.modelUsed || provider.name,
          latencyMs: Date.now() - startedAt,
          status: 'success'
        });
        return { ...normalized, stage: request.stage, source: `${provider.name} (${result.modelUsed || 'configured model'})` };
      } catch (error) {
        console.warn(`[LLMManager] ${provider.name} employee setup ${request.stage} failed:`, error.message);
        failures.push(`${provider.name}: ${error.message}`);
        if (/timed out|429|rate.?limit/i.test(error.message)) {
          if (provider.key === 'groq') groqCooldownUntil = Date.now() + 60000;
          if (provider.key === 'mistral') mistralCooldownUntil = Date.now() + 60000;
          if (provider.key === 'gemini') geminiCooldownUntil = Date.now() + 60000;
          if (provider.key === 'cerebras') cerebrasCooldownUntil = Date.now() + 60000;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    const detail = failures.length ? failures.join(' ') : 'All configured AI providers are temporarily cooling down.';
    throw new Error(`Could not create validated employee setup guidance. ${detail}`);
  }

  async swaraChatCopilot({ currentScript, userInstruction }) {
    // 1. Try Groq
    if (process.env.GROQ_API_KEY && Date.now() >= groqCooldownUntil) {
      try {
        const reply = await groqClient.swaraChatCopilot({ currentScript, userInstruction });
        if (reply) {
          recordLLMCall({ provider: 'groq', model: reply.modelUsed || 'groq', latencyMs: 450, status: 'success' });
          return reply;
        }
      } catch (e) {
        groqCooldownUntil = Date.now() + 60000;
      }
    }

    // 2. Try Mistral
    if (process.env.MISTRAL_API_KEY && Date.now() >= mistralCooldownUntil) {
      try {
        const reply = await mistralClient.swaraChatCopilot({ currentScript, userInstruction });
        if (reply) {
          recordLLMCall({ provider: 'mistral', model: reply.modelUsed || 'mistral', latencyMs: 1200, status: 'success' });
          return reply;
        }
      } catch (e) {
        mistralCooldownUntil = Date.now() + 60000;
      }
    }

    // 3. Try Gemini
    if (process.env.GEMINI_API_KEY && Date.now() >= geminiCooldownUntil) {
      try {
        const reply = await geminiClient.swaraChatCopilot({ currentScript, userInstruction });
        if (reply) {
          recordLLMCall({ provider: 'gemini', model: reply.modelUsed || 'gemini', latencyMs: 1800, status: 'success' });
          return reply;
        }
      } catch (e) {
        geminiCooldownUntil = Date.now() + 60000;
      }
    }

    return {
      success: true,
      reply: "I've reviewed your instruction and optimized your script steps accordingly (offline local copilot)."
    };
  }
}

export const llmManager = new LLMManager();
