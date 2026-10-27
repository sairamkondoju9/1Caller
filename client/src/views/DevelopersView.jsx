import { getAuthHeaders } from '../utils/api';
import React, { useState } from 'react';
import {
  Code2,
  Key,
  Webhook,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Download,
  BookOpen,
  CheckCircle2,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function DevelopersView() {
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'webhooks' | 'quickstart' | 'integrations'
  const [envMode, setEnvMode] = useState('live'); // 'live' | 'test'
  
  // API Keys state
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [liveApiKey, setLiveApiKey] = useState('sarv_live_9a7f4e8b2c1d0e5f6a7b8c9d0e1f2a3b');
  const [testApiKey, setTestApiKey] = useState('sarv_test_41c09e88d721fa62b489e31d0411a77c');

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('https://crm.yourcompany.com/api/voice-events');
  const [webhookSecret, setWebhookSecret] = useState('whsec_5f2d91a8c3e4b7069123456789abcdef');
  const [showSecret, setShowSecret] = useState(false);
  const [webhookSubscribedEvents, setWebhookSubscribedEvents] = useState([
    'call.initiated',
    'call.connected',
    'lead.qualified',
    'call.completed',
    'barge_in.detected'
  ]);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Quickstart tab state
  const [selectedLang, setSelectedLang] = useState('curl'); // 'curl' | 'node' | 'python'

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSendTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/developers/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await res.json();
      setTestingWebhook(false);
      setTestResult(data);
    } catch (err) {
      setTestingWebhook(false);
      setTestResult({
        success: false,
        error: 'Failed to dispatch test webhook payload'
      });
    }
  };

  const codeSnippets = {
    curl: `curl -X POST https://api.sarvam.ai/v1/calls/dispatch \\
  -H "Authorization: Bearer ${envMode === 'live' ? liveApiKey : testApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+919849012345",
    "employee_id": "emp-1",
    "first_name": "Sairam",
    "metadata": {
      "lead_source": "Meta Ads",
      "project": "Aura Luxury Villas Gachibowli"
    }
  }'`,

    node: `import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.sarvam.ai/v1',
  headers: {
    'Authorization': 'Bearer ${envMode === 'live' ? liveApiKey : testApiKey}',
    'Content-Type': 'application/json'
  }
});

// Dispatch single AI voice outbound call
async function dispatchCall() {
  const { data } = await client.post('/calls/dispatch', {
    phone: '+919849012345',
    employee_id: 'emp-1',
    first_name: 'Sairam',
    metadata: {
      lead_source: 'Website Form',
      preferred_lang: 'te'
    }
  });

  console.log('Call dispatched. Call ID:', data.call_id);
}

dispatchCall();`,

    python: `import requests

API_KEY = "${envMode === 'live' ? liveApiKey : testApiKey}"
BASE_URL = "https://api.sarvam.ai/v1"

payload = {
    "phone": "+919849012345",
    "employee_id": "emp-1",
    "first_name": "Sairam",
    "metadata": {
        "lead_source": "Google Search Ads",
        "budget": "₹3.5 Cr"
    }
}

response = requests.post(
    f"{BASE_URL}/calls/dispatch",
    json=payload,
    headers={"Authorization": f"Bearer {API_KEY}"}
)

call_data = response.json()
print("Call queued successfully:", call_data["call_id"])`
  };

  const downloadPostman = () => {
    const postman = {
      info: {
        name: "Sarvam Voice API v1",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        { name: "Dispatch Call", request: { method: "POST", url: "https://api.sarvam.ai/v1/calls/dispatch" } },
        { name: "Get Call Details", request: { method: "GET", url: "https://api.sarvam.ai/v1/calls/:id" } },
        { name: "List AI Employees", request: { method: "GET", url: "https://api.sarvam.ai/v1/employees" } },
        { name: "Wallet Balance", request: { method: "GET", url: "https://api.sarvam.ai/v1/balance" } }
      ]
    };
    const blob = new Blob([JSON.stringify(postman, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Sarvam_Voice_Postman_Collection.json";
    a.click();
  };

  const downloadOpenApi = () => {
    const openapi = `openapi: 3.0.3
info:
  title: Sarvam Autonomous Voice Engine API
  version: 1.0.0
paths:
  /v1/calls/dispatch:
    post:
      summary: Dispatch an outbound AI voice call
  /v1/calls/{id}:
    get:
      summary: Get call transcript, audio recording, and timeline telemetry
  /v1/balance:
    get:
      summary: Fetch remaining wallet credits`;
    const blob = new Blob([openapi], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sarvam-openapi.yaml";
    a.click();
  };

  return (
    <div className="p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#0f0e17] font-display">Developer Platform</h1>
            <span className="text-xs bg-[#f6f7fb] text-[#0f0e17] font-semibold px-2.5 py-0.5 rounded-full border border-[#e2e4ed]">
              REST &amp; Webhooks v1
            </span>
          </div>
          <p className="text-sm text-[#6c6b7e] mt-1">
            Dispatch calls via API, subscribe to real-time WebRTC audio events, and pipe lead data into your CRM.
          </p>
        </div>

        {/* Environment Toggle & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f0f1f6] p-1 rounded-xl border border-[#e2e4ed]">
            <button
              onClick={() => setEnvMode('live')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                envMode === 'live' ? 'bg-white text-[#16a34a] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
              }`}
            >
              Live Production
            </button>
            <button
              onClick={() => setEnvMode('test')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                envMode === 'test' ? 'bg-white text-[#ea580c] shadow-xs font-bold' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
              }`}
            >
              Test Sandbox
            </button>
          </div>
        </div>
      </div>

      {/* Base URL Card (Apple Liquid Glass Stage) */}
      <div className="apple-glass-stage text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white/60">BASE URL:</span>
          <span className="text-[#cbd0df] font-bold">https://api.sarvam.ai/v1</span>
        </div>
        <button
          onClick={() => copyToClipboard('https://api.sarvam.ai/v1', setCopiedBaseUrl)}
          className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1 rounded transition-colors self-start sm:self-auto cursor-pointer"
        >
          {copiedBaseUrl ? <Check className="w-3.5 h-3.5 text-[#86efac]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedBaseUrl ? 'Copied' : 'Copy Base URL'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e4ed] pb-1">
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'keys'
              ? 'bg-[#f6f7fb] text-[#0f0e17] border-b-2 border-[#0f0e17]'
              : 'text-[#6c6b7e] hover:bg-[#f0f1f6] hover:text-[#0f0e17]'
          }`}
        >
          <Key className="w-4 h-4" />
          API Keys &amp; Credentials
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'webhooks'
              ? 'bg-[#f6f7fb] text-[#0f0e17] border-b-2 border-[#0f0e17]'
              : 'text-[#6c6b7e] hover:bg-[#f0f1f6] hover:text-[#0f0e17]'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Webhooks &amp; Events
        </button>
        <button
          onClick={() => setActiveTab('quickstart')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'quickstart'
              ? 'bg-[#f6f7fb] text-[#0f0e17] border-b-2 border-[#0f0e17]'
              : 'text-[#6c6b7e] hover:bg-[#f0f1f6] hover:text-[#0f0e17]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Code Quickstart
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'integrations'
              ? 'bg-[#f6f7fb] text-[#0f0e17] border-b-2 border-[#0f0e17]'
              : 'text-[#6c6b7e] hover:bg-[#f0f1f6] hover:text-[#0f0e17]'
          }`}
        >
          <Layers className="w-4 h-4" />
          n8n / Make / Postman
        </button>
      </div>

      {/* TAB 1: API KEYS & CREDENTIALS */}
      {activeTab === 'keys' && (
        <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17]">API Authentication Keys</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">
              Include your API key as a Bearer token in the <code className="text-[#0f0e17]">Authorization</code> header of every request.
            </p>
          </div>

          {/* Current Key Card */}
          <div className="space-y-4">
            <div className="p-4 bg-[#f8f9fc] rounded-xl border border-[#e2e4ed] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${envMode === 'live' ? 'bg-[#16a34a]' : 'bg-[#ea580c]'}`}></span>
                  <span className="text-xs font-bold text-[#0f0e17] uppercase">
                    {envMode === 'live' ? 'Live Production Key' : 'Test Sandbox Key'}
                  </span>
                </div>
                <span className="text-[11px] text-[#6c6b7e]">Created 2 days ago Â· Full Access</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type={showLiveKey ? 'text' : 'password'}
                  readOnly
                  value={envMode === 'live' ? liveApiKey : testApiKey}
                  className="apple-glass-input w-full font-mono text-xs font-semibold px-3 py-2 text-[#0f0e17]"
                />
                <button
                  onClick={() => setShowLiveKey(!showLiveKey)}
                  className="p-2 border border-[#e2e4ed] hover:bg-[#f0f1f6] rounded-lg text-[#6c6b7e] cursor-pointer"
                  title={showLiveKey ? "Hide key" : "Show key"}
                >
                  {showLiveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(envMode === 'live' ? liveApiKey : testApiKey, setCopiedKey)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#0f0e17] hover:bg-[#1f1e28] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6c6b7e] pt-1">
                <span className="text-[#ea580c]">Never share your secret key in client-side repositories.</span>
                <button
                  onClick={() => {
                    const newKey = `sarv_${envMode}_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
                    if (envMode === 'live') setLiveApiKey(newKey);
                    else setTestApiKey(newKey);
                    alert("API Key regenerated successfully. Previous key will expire in 24 hours.");
                  }}
                  className="text-[#0f0e17] hover:text-[#1f1e28] font-semibold cursor-pointer"
                >
                  Regenerate Key
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#f6f7fb] rounded-xl border border-[#e2e4ed] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0f0e17] shrink-0 mt-0.5" />
            <div className="text-xs text-[#3a3f5c] space-y-1">
              <div className="font-bold text-[#0f0e17]">Rate Limits &amp; Concurrency Contract</div>
              <p className="text-[11px] text-[#3a3f5c] leading-relaxed">
                Standard accounts can dispatch up to <strong>21 calls/sec (CPS)</strong> and run up to <strong>500 concurrent live calls</strong>. For 500,000 CCU carrier bypass, contact Enterprise trunk support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOKS & REAL-TIME EVENTS */}
      {activeTab === 'webhooks' && (
        <div className="apple-glass rounded-2xl border border-[#e2e4ed] p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-[#0f0e17]">Webhook Configuration &amp; Signature Verification</h2>
            <p className="text-xs text-[#6c6b7e] mt-0.5">
              Receive immediate HTTP POST payloads whenever a call connects, an AI agent qualifies a lead, or a call concludes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a3f5c]">Webhook Destination Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://yourcrm.com/api/webhooks/voice"
                  className="apple-glass-input w-full text-xs font-mono"
                />
                <button
                  disabled={testingWebhook}
                  onClick={handleSendTestWebhook}
                  className="bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testingWebhook ? 'Sending...' : 'Send Test Ping'}
                </button>
              </div>
            </div>

            {/* Test Result Banner */}
            {testResult && (
              <div className={`p-4 rounded-xl border text-xs ${
                testResult.success ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  Webhook delivered successfully to {testResult.targetUrl}
                </div>
                <div className="mt-2 font-mono text-[11px] bg-white/80 p-2.5 rounded border border-[#bbf7d0]">
                  Status: 200 OK Â· Round-trip latency: {testResult.latencyMs}ms Â· Event: call.completed
                </div>
              </div>
            )}

            {/* Webhook Secret Key */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[#3a3f5c]">Webhook HMAC Secret (for signature verification)</label>
              <div className="flex items-center gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  readOnly
                  value={webhookSecret}
                  className="apple-glass-input w-full font-mono text-xs font-semibold px-3 py-2 text-[#6c6b7e]"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 border border-[#e2e4ed] hover:bg-[#f0f1f6] rounded-lg text-[#6c6b7e] cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#6c6b7e]">
                Validate the <code className="text-[#0f0e17]">X-Sarvam-Signature</code> header with HMAC-SHA256 using this secret.
              </p>
            </div>

            {/* Subscribed Events Checklist */}
            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-[#3a3f5c]">Subscribed Event Types</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'call.initiated', label: 'call.initiated (Dial triggered)' },
                  { id: 'call.connected', label: 'call.connected (User answered)' },
                  { id: 'turn.latency', label: 'turn.latency (Waterfall telemetry)' },
                  { id: 'barge_in.detected', label: 'barge_in.detected (User interrupted)' },
                  { id: 'lead.qualified', label: 'lead.qualified (Key criteria extracted)' },
                  { id: 'call.completed', label: 'call.completed (Recording & transcript ready)' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg border border-[#e2e4ed] cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={webhookSubscribedEvents.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookSubscribedEvents([...webhookSubscribedEvents, item.id]);
                        } else {
                          setWebhookSubscribedEvents(webhookSubscribedEvents.filter(x => x !== item.id));
                        }
                      }}
                      className="rounded accent-[#0f0e17]"
                    />
                    <span className="font-mono text-[11px] text-[#0f0e17]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CODE QUICKSTART */}
      {activeTab === 'quickstart' && (
        <div className="apple-glass rounded-2xl border border-[#e2e4ed] overflow-hidden max-w-4xl">
          <div className="p-5 border-b border-[#e2e4ed] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f0e17]">Dispatch Outbound Call via API</h2>
              <p className="text-xs text-[#6c6b7e] mt-0.5">Trigger an AI call instantaneously from your backend.</p>
            </div>
            <div className="flex items-center bg-[#f0f1f6] p-0.5 rounded-lg border border-[#e2e4ed]">
              {['curl', 'node', 'python'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-3 py-1 text-xs font-bold rounded-md uppercase transition-all cursor-pointer ${
                    selectedLang === lang ? 'bg-white text-[#0f0e17] shadow-xs' : 'text-[#6c6b7e] hover:text-[#0f0e17]'
                  }`}
                >
                  {lang === 'node' ? 'Node.js' : lang}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0f0e1a] p-5 overflow-x-auto relative group">
            <button
              onClick={() => copyToClipboard(codeSnippets[selectedLang], () => alert("Code snippet copied!"))}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-gray-300 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <pre className="text-xs font-mono text-[#cbd0df] leading-relaxed">
              <code>{codeSnippets[selectedLang]}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATION GUIDES & DOWNLOADS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* n8n Integration Box */}
            <div className="apple-glass p-6 rounded-2xl border border-[#e2e4ed] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-[#0f0e17]">n8n Workflow</span>
                <span className="text-[10px] font-bold bg-[#fff7ed] text-[#c2410c] px-2 py-0.5 rounded border border-[#fed7aa]">
                  Ready Template
                </span>
              </div>
              <p className="text-xs text-[#6c6b7e] leading-relaxed">
                Connect Google Sheets or HubSpot leads directly into Sarvam AI. Auto-dials leads within 15 seconds of form submission.
              </p>
              <button
                onClick={() => {
                  const n8nJson = {
                    nodes: [
                      { name: "Webhook Trigger", type: "n8n-nodes-base.webhook" },
                      { name: "Sarvam Dispatch", type: "n8n-nodes-base.httpRequest", parameters: { url: "https://api.sarvam.ai/v1/calls/dispatch" } }
                    ]
                  };
                  const blob = new Blob([JSON.stringify(n8nJson, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "sarvam-n8n-workflow.json";
                  a.click();
                }}
                className="w-full bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                Download n8n Template JSON
              </button>
            </div>

            {/* Make.com Box */}
            <div className="apple-glass p-6 rounded-2xl border border-[#e2e4ed] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-[#0f0e17]">Make (Integromat)</span>
                <span className="text-[10px] font-bold bg-[#f6f7fb] text-[#0f0e17] px-2 py-0.5 rounded border border-[#e2e4ed]">
                  Webhook Blueprint
                </span>
              </div>
              <p className="text-xs text-[#6c6b7e] leading-relaxed">
                Listen to completed calls and push call recordings, transcripts, and qualification tags directly into Salesforce or Zoho.
              </p>
              <button
                onClick={() => alert("Make.com blueprint copied to clipboard.")}
                className="w-full bg-[#f6f7fb] hover:bg-[#f0f2f8] text-[#0f0e17] border border-[#e2e4ed] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Make Blueprint
              </button>
            </div>
          </div>

          {/* Official Spec Downloads */}
          <div className="apple-glass p-6 rounded-2xl border border-[#e2e4ed] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#0f0e17]">Official API Specifications</h3>
              <p className="text-xs text-[#6c6b7e] mt-0.5">Import directly into Postman, Insomnia, or Swagger UI.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadPostman}
                className="flex items-center gap-1.5 bg-[#f0f1f6] hover:bg-[#e2e4ed] text-[#0f0e17] font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-colors border border-[#e2e4ed]"
              >
                <Download className="w-3.5 h-3.5" />
                Postman Collection
              </button>
              <button
                onClick={downloadOpenApi}
                className="flex items-center gap-1.5 bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                OpenAPI 3.0 Spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
