import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSupportGenerationPrompt,
  normalizeGeneratedSupportScript,
  normalizeSupportRequest
} from './supportScript.js';
import { GroqClient } from './groqClient.js';
import { GeminiClient } from './geminiClient.js';
import { MistralClient } from './mistralClient.js';
import {
  buildEmployeeScriptPrompt,
  normalizeEmployeeScriptRequest,
  normalizeGeneratedEmployeeScript
} from './employeeScript.js';

const validRequest = {
  prompt: 'Help customers resolve delivery and payment issues with empathy.',
  language: 'en',
  businessName: 'Acme Store',
  role: 'Customer Support Specialist',
  policies: 'Escalate refund decisions to a human support agent.',
  commonIssues: ['Delivery delay', 'Payment issue'],
  nextActions: ['Escalate to a human']
};

const validProviderResult = {
  openingLine: 'Hello, thank you for contacting Acme Store. How can I help?',
  empathyLine: 'I’m sorry this has caused trouble.',
  issueQuestions: [
    'Is this about a delivery delay?',
    'Could you describe the payment issue?',
    'What outcome would help resolve this?'
  ]
};

test('support request requires a real brief, business name, supported language, and customer issue', () => {
  assert.throws(() => normalizeSupportRequest({ ...validRequest, prompt: 'help' }), /at least 10 characters/);
  assert.throws(() => normalizeSupportRequest({ ...validRequest, businessName: '' }), /Enter your business name/);
  assert.throws(() => normalizeSupportRequest({ ...validRequest, language: 'xx' }), /supported employee language/);
  assert.throws(() => normalizeSupportRequest({ ...validRequest, commonIssues: [] }), /at least one customer issue/);
});

test('support generation prompt preserves client facts and guardrails against invented policies', () => {
  const request = normalizeSupportRequest(validRequest);
  const prompt = buildSupportGenerationPrompt(request);
  assert.match(prompt, /Acme Store/);
  assert.match(prompt, /Escalate refund decisions to a human support agent/);
  assert.match(prompt, /Delivery delay/);
  assert.match(prompt, /Never invent order status/);
  assert.match(prompt, /do not write a script or steps/i);
});

test('support personalization validation rejects incomplete or malformed provider output', () => {
  const request = normalizeSupportRequest(validRequest);
  assert.throws(() => normalizeGeneratedSupportScript({}, request), /incomplete support personalization/);
  assert.throws(() => normalizeGeneratedSupportScript({
    ...validProviderResult,
    issueQuestions: ['Only one question']
  }, request), /incomplete support personalization/);
  assert.throws(() => normalizeGeneratedSupportScript({
    ...validProviderResult,
    openingLine: ''
  }, request), /incomplete support personalization/);
  assert.throws(() => normalizeGeneratedSupportScript({
    ...validProviderResult,
    openingLine: 'Hello, how can I help you?'
  }, request), /does not use your business name/);
});

test('support script combines compact AI personalization with the fixed support flow', () => {
  const request = normalizeSupportRequest(validRequest);
  const generated = normalizeGeneratedSupportScript(validProviderResult, request);
  assert.equal(generated.business_name, 'Acme Store');
  assert.equal(generated.role, 'Customer Support Specialist');
  assert.equal(generated.opening_greeting, validProviderResult.openingLine);
  assert.equal(generated.call_steps.length, 6);
  assert.equal(generated.call_steps[0].title, '1. Welcome and acknowledge');
  assert.match(generated.call_steps[3].body, /Escalate refund decisions to a human support agent/);
  assert.match(generated.call_steps[4].body, /offer this permitted follow-up/);
});

test('Groq support client sends the support-specific prompt and parses JSON', async () => {
  const client = new GroqClient('test-key');
  let submittedPrompt = '';
  client._callGroqChat = async ({ messages }) => {
    submittedPrompt = messages[1].content;
    return { content: JSON.stringify(validProviderResult), modelUsed: 'test-model' };
  };
  const result = await client.generateSupportScript(normalizeSupportRequest(validRequest));
  assert.match(submittedPrompt, /brief personalization fields/i);
  assert.equal(result.modelUsed, 'test-model');
  assert.equal(result.openingLine, validProviderResult.openingLine);
  assert.equal(result.steps, undefined);
  assert.equal(result.issueQuestions.length, 3);
});

test('Gemini and Mistral support clients parse their provider response formats', async () => {
  const responseJson = JSON.stringify(validProviderResult);
  const gemini = new GeminiClient('test-key');
  gemini._generateContent = async ({ userPrompt }) => {
    assert.match(userPrompt, /Acme Store/);
    return { text: responseJson, modelUsed: 'gemini-test' };
  };
  const mistral = new MistralClient('test-key');
  mistral._callMistralChat = async ({ messages }) => {
    assert.match(messages[1].content, /Acme Store/);
    return { content: responseJson, modelUsed: 'mistral-test' };
  };

  const request = normalizeSupportRequest(validRequest);
  const [geminiResult, mistralResult] = await Promise.all([
    gemini.generateSupportScript(request),
    mistral.generateSupportScript(request)
  ]);
  assert.equal(geminiResult.modelUsed, 'gemini-test');
  assert.equal(mistralResult.modelUsed, 'mistral-test');
  assert.equal(geminiResult.issueQuestions.length, 3);
  assert.equal(mistralResult.issueQuestions.length, 3);
});

const employeeRequest = {
  prompt: 'Answer calls for our clinic and help callers request appointments.',
  businessName: 'Acme Clinic',
  employeeName: 'Priya',
  role: 'Patient Coordinator',
  industry: 'Healthcare',
  language: 'en',
  offerings: ['Appointment requests'],
  nextActions: ['Request a callback']
};

const validEmployeeResult = {
  openingLine: 'Hello, this is Priya from Acme Clinic. How may I help?',
  enquiryPrompts: [
    'What appointment do you need?',
    'What would you like to know?',
    'Would you prefer a callback?'
  ]
};

test('employee script requests require the client brief, business name, and supported language', () => {
  assert.throws(() => normalizeEmployeeScriptRequest({ ...employeeRequest, prompt: 'help' }), /at least 10 characters/);
  assert.throws(() => normalizeEmployeeScriptRequest({ ...employeeRequest, businessName: '' }), /Enter your business name/);
  assert.throws(() => normalizeEmployeeScriptRequest({ ...employeeRequest, language: 'xx' }), /supported employee language/);
});

test('employee prompt requests only compact personalization and fixed flow is validated', () => {
  const request = normalizeEmployeeScriptRequest(employeeRequest);
  const prompt = buildEmployeeScriptPrompt(request);
  assert.match(prompt, /Never invent products, prices, discounts, policies/);
  assert.match(prompt, /do not write a script or steps/i);
  assert.match(prompt, /Acme Clinic/);
  assert.throws(() => normalizeGeneratedEmployeeScript({}, request), /incomplete employee personalization/);
  assert.throws(() => normalizeGeneratedEmployeeScript({
    ...validEmployeeResult,
    enquiryPrompts: []
  }, request), /incomplete employee personalization/);
  assert.throws(() => normalizeGeneratedEmployeeScript({
    ...validEmployeeResult,
    openingLine: 'Hello, how can I help?'
  }, request), /did not use your business name/);
});

test('employee script normalization keeps the client business name and creates editable steps', () => {
  const request = normalizeEmployeeScriptRequest(employeeRequest);
  const generated = normalizeGeneratedEmployeeScript(validEmployeeResult, request);
  assert.equal(generated.business_name, 'Acme Clinic');
  assert.equal(generated.role, 'Patient Coordinator');
  assert.equal(generated.small_context, employeeRequest.prompt);
  assert.equal(generated.call_steps.length, 6);
  assert.equal(generated.call_steps[0].title, '1. Open the conversation');
  assert.equal(generated.call_steps[1].title, '2. Understand the caller’s need');
  assert.match(generated.call_steps[1].body, /What appointment do you need/);
  assert.match(generated.call_steps[4].body, /Request a callback/);
  assert.match(generated.call_steps[3].body, /do not guess/);
  assert.doesNotMatch(generated.call_steps[2].body, /businessSummary/i);
});

test('Groq, Gemini, and Mistral employee clients use compact output budgets', async () => {
  const request = normalizeEmployeeScriptRequest(employeeRequest);
  const responseJson = JSON.stringify(validEmployeeResult);
  const groq = new GroqClient('test-key');
  groq._callGroqChat = async ({ messages, maxTokens }) => {
    assert.match(messages[1].content, /Never invent products, prices/);
    assert.equal(maxTokens, 420);
    return { content: responseJson, modelUsed: 'groq-test' };
  };
  const gemini = new GeminiClient('test-key');
  gemini._generateContent = async ({ userPrompt, maxOutputTokens }) => {
    assert.match(userPrompt, /Never invent products, prices/);
    assert.equal(maxOutputTokens, 420);
    return { text: responseJson, modelUsed: 'gemini-test' };
  };
  const mistral = new MistralClient('test-key');
  mistral._callMistralChat = async ({ messages, maxTokens }) => {
    assert.match(messages[1].content, /Never invent products, prices/);
    assert.equal(maxTokens, 420);
    return { content: responseJson, modelUsed: 'mistral-test' };
  };
  const results = await Promise.all([
    groq.generateEmployeeScript(request),
    gemini.generateEmployeeScript(request),
    mistral.generateEmployeeScript(request)
  ]);
  assert.deepEqual(results.map(result => result.modelUsed), ['groq-test', 'gemini-test', 'mistral-test']);
  assert.equal(results.every(result => Array.isArray(result.enquiryPrompts)), true);
});
