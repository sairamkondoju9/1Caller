// Sarvam Samvaad Telephony Service
// Connects to Sarvam Voice Agents Instant Outbound API for live PSTN calling

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = '+91' + cleaned.slice(1);
    } else if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

export class SarvamTelephonyService {
  constructor(config = {}) {
    this.config = config;
  }

  get apiKey() {
    return this.config.apiKey || process.env.SARVAM_TELEPHONY_API_KEY || process.env.SARVAM_API_KEY;
  }

  get primaryCli() {
    return this.config.primaryCli || process.env.SARVAM_PRIMARY_CLI || '+917965481367';
  }

  get orgId() {
    return this.config.orgId || process.env.SARVAM_ORG_ID;
  }

  get workspaceId() {
    return this.config.workspaceId || process.env.SARVAM_WORKSPACE_ID;
  }

  get appId() {
    return this.config.appId || process.env.SARVAM_APP_ID;
  }

  get connectionId() {
    return this.config.connectionId || process.env.SARVAM_CONNECTION_ID || 'de08394b-11-5a4532ad-606b';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.primaryCli);
  }

  async dialCall({ to, employee, message, language = 'Telugu', appVersion = 1, appId = null, webhookUrl = null }) {
    if (!this.apiKey) {
      throw new Error('SARVAM_TELEPHONY_API_KEY is not configured. Set your Sarvam Telephony API key to place calls.');
    }
    if (!to) {
      throw new Error('Destination phone number is required.');
    }

    const cleanTo = formatPhoneNumber(to);
    const cleanFrom = String(this.primaryCli).replace(/\s+/g, '');

    if (!cleanTo || cleanTo.length < 10) {
      throw new Error(`Invalid phone number: ${to}. Please provide a valid 10-digit mobile number.`);
    }

    if (!this.orgId || !this.workspaceId) {
      throw new Error(
        `Sarvam Telephony requires your Sarvam Organization ID (SARVAM_ORG_ID) and Workspace ID (SARVAM_WORKSPACE_ID). ` +
        `You can find these in your Sarvam dashboard URL at https://apps.sarvam.ai/ (e.g. https://apps.sarvam.ai/orgs/<org_id>/workspaces/<workspace_id>).`
      );
    }

    const resolvedAppId = appId || employee?.sarvam_app_id || this.appId || employee?.id || 'agent-default';

    // Extract rich script steps and variables from the employee
    let parsedSteps = [];
    if (employee?.call_steps) {
      try {
        parsedSteps = typeof employee.call_steps === 'string' ? JSON.parse(employee.call_steps) : employee.call_steps;
      } catch (e) {
        parsedSteps = [];
      }
    }
    const stepsText = Array.isArray(parsedSteps) && parsedSteps.length > 0
      ? parsedSteps.map((s, idx) => `${idx + 1}. ${s.title || s.step || ''}: ${s.body || s.detail || ''}`).join('\n')
      : '';

    let parsedVars = {};
    if (employee?.variables) {
      try {
        parsedVars = typeof employee.variables === 'string' ? JSON.parse(employee.variables) : employee.variables;
      } catch (e) {
        parsedVars = {};
      }
    }

    const agentVariables = {
      business_name: employee?.business || employee?.name || 'Our Business',
      employee_name: employee?.name || 'AI Assistant',
      role: employee?.role || 'Customer Representative',
      industry: employee?.industry || 'General Business',
      language: language,
      prompt_context: employee?.prompt_text || '',
      call_script: stepsText,
      ...(Array.isArray(parsedVars) ? { offerings: parsedVars.join(', ') } : (typeof parsedVars === 'object' ? parsedVars : {}))
    };

    const payload = {
      app_config: {
        app_id: resolvedAppId,
        app_version: appVersion,
        app_type: 'agent',
        connection_config: {
          connection_id: this.connectionId,
          agent_phone_number: cleanFrom
        },
        agent_variables: agentVariables,
        app_overrides: {
          initial_bot_message: message || employee?.opening_greeting || undefined,
          initial_language_name: language
        }
      },
      user_config: {
        user_phone_number: cleanTo
      }
    };

    if (webhookUrl) {
      payload.webhook_config = { url: webhookUrl };
    }

    const endpoint = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${encodeURIComponent(this.orgId)}/workspaces/${encodeURIComponent(this.workspaceId)}/outbounds`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errDetail = data?.error?.data?.details || data?.detail || data?.error?.message || response.statusText;
      const errStr = typeof errDetail === 'object' ? JSON.stringify(errDetail) : String(errDetail);
      if (errStr.includes('not found') || response.status === 404) {
        throw new Error(
          `Sarvam Agent '${resolvedAppId}' was not found in your Sarvam Workspace. ` +
          `Please provide your Sarvam Voice Agent ID (found at apps.sarvam.ai → Build → Agents → click ··· → 'Copy agent ID').`
        );
      }
      throw new Error(`Sarvam Outbound Call failed (${response.status}): ${errStr}`);
    }

    return {
      success: true,
      attemptId: data.attempt_id,
      from: cleanFrom,
      to: cleanTo,
      appId: resolvedAppId,
      status: 'initiated'
    };
  }
}

export const TelephonyService = new SarvamTelephonyService();
export default TelephonyService;
