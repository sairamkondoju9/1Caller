// Sarvam Samvaad Telephony Service
// Connects to Sarvam Voice Agents Instant Outbound API for live PSTN calling

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
    return this.config.connectionId || process.env.SARVAM_CONNECTION_ID;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.primaryCli);
  }

  async dialCall({ to, employee, message, language = 'Telugu', appVersion = 1, webhookUrl = null }) {
    if (!this.apiKey) {
      throw new Error('SARVAM_TELEPHONY_API_KEY is not configured. Set your Sarvam Telephony API key to place calls.');
    }
    if (!to) {
      throw new Error('Destination phone number is required.');
    }

    const cleanTo = String(to).replace(/\s+/g, '');
    const cleanFrom = String(this.primaryCli).replace(/\s+/g, '');

    if (!this.orgId || !this.workspaceId) {
      throw new Error(
        `Sarvam Telephony requires your Sarvam Organization ID (SARVAM_ORG_ID) and Workspace ID (SARVAM_WORKSPACE_ID). ` +
        `You can find these in your Sarvam dashboard URL at https://apps.sarvam.ai/ (e.g. https://apps.sarvam.ai/orgs/<org_id>/workspaces/<workspace_id>).`
      );
    }

    const payload = {
      app_config: {
        app_id: this.appId || employee?.id || 'agent-default',
        app_version: appVersion,
        connection_config: {
          connection_id: this.connectionId || 'conn_sarvam_vobiz',
          agent_phone_number: cleanFrom
        },
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
      throw new Error(`Sarvam Outbound Call failed (${response.status}): ${typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail}`);
    }

    return {
      success: true,
      attemptId: data.attempt_id,
      from: cleanFrom,
      to: cleanTo,
      status: 'initiated'
    };
  }
}

export const TelephonyService = new SarvamTelephonyService();
export default TelephonyService;
