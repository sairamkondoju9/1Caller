export function buildSwaraPrompt({
  currentScript,
  userInstruction,
  businessName,
  employeeName,
  openingGreeting,
  language
}) {
  const stepsList = Array.isArray(currentScript)
    ? currentScript.map((s, idx) => `Step ${s.id || idx + 1} (${s.title || ''}): ${s.body || ''}`).join('\n')
    : String(currentScript || '');

  return `Current Script Steps:
${stepsList}

Current Opening Greeting: "${openingGreeting || ''}"
Business Name: "${businessName || 'Our Business'}"
Employee Name: "${employeeName || 'AI Assistant'}"
Language: "${language || 'Telugu + English'}"

User Instruction / Dictation:
"${userInstruction}"

Your task as Swara Voice AI Copilot for Indian Voice Agents:
1. Seamlessly apply the user's instruction into the appropriate step(s) of the script.
2. If the instruction covers pricing, discounts, offers, or objections, update Step 4 ("Handle questions and objections safely") and Step 6.
3. If the instruction covers what is expected from the customer (e.g. schedule a showroom or store visit, place an order, send WhatsApp catalog/brochure, book an appointment, request callback), update Step 5 ("Offer the approved next step") and Step 6 ("Close politely").
4. If the instruction asks for greeting adjustments, update Step 1 ("Open the conversation") and the opening greeting.
5. If the instruction asks what questions to ask callers or understand needs, update Step 2 ("Understand the caller’s need").
6. Provide a short 1-2 sentence confirmation in the language of the script (e.g. Telugu) in "reply".
7. Ask a short question in "suggestedNextQuestion" clarifying what the business expects from the customer next (e.g. "మీరు కస్టమర్ నుండి ఏమి ఆశిస్తున్నారు: షోరూమ్ విజిట్ షెడ్యూల్ చేయాలా, ఆర్డర్ తీసుకోవాలా, లేదా వాట్సాప్‌లో క్యాటలాగ్ పంపాలా?").

Return ONLY a valid JSON object with no markdown formatting around it:
{
  "reply": "1-2 sentence confirmation in Telugu or English",
  "openingGreeting": "Updated or retained opening greeting",
  "expectedCustomerAction": "Schedule a showroom visit / Place an order / WhatsApp catalog",
  "suggestedNextQuestion": "మీరు కస్టమర్ నుండి ఏమి ఆశిస్తున్నారు: షోరూమ్ విజిట్ షెడ్యూల్ చేయాలా, ఆర్డర్ తీసుకోవాలా, లేదా వాట్సాప్‌లో క్యాటలాగ్ పంపాలా?",
  "steps": [
    { "id": 1, "title": "1. Open the conversation", "body": "..." },
    { "id": 2, "title": "2. Understand the caller’s need", "body": "..." },
    { "id": 3, "title": "3. Answer from confirmed business information", "body": "..." },
    { "id": 4, "title": "4. Handle questions and objections safely", "body": "..." },
    { "id": 5, "title": "5. Offer the approved next step", "body": "..." },
    { "id": 6, "title": "6. Close politely", "body": "..." }
  ]
}`;
}

export function parseSwaraResponse(rawContent, currentScript = [], userInstruction = '') {
  let parsed = null;
  if (typeof rawContent === 'object' && rawContent !== null) {
    parsed = rawContent;
  } else if (typeof rawContent === 'string') {
    const clean = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      // Try to find JSON block in text
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }
  }

  if (
    parsed &&
    Array.isArray(parsed.steps) &&
    parsed.steps.length >= 5 &&
    parsed.steps[0].body
  ) {
    return {
      success: true,
      reply: parsed.reply || 'Swara updated your script steps with your instruction.',
      openingGreeting: parsed.openingGreeting || null,
      expectedCustomerAction: parsed.expectedCustomerAction || null,
      suggestedNextQuestion: parsed.suggestedNextQuestion || 'What are you expecting from the customer? (e.g. Schedule a showroom visit, place an order, or send details on WhatsApp)',
      steps: parsed.steps.map((s, idx) => ({
        id: s.id || idx + 1,
        title: s.title || `${idx + 1}. Step ${idx + 1}`,
        body: String(s.body || '').trim()
      }))
    };
  }

  // Deterministic local fallback ensuring instructions are NEVER lost
  const next = Array.isArray(currentScript) ? JSON.parse(JSON.stringify(currentScript)) : [];
  const lower = (userInstruction || '').toLowerCase();
  let actionSummary = '';

  if (lower.includes('discount') || lower.includes('price') || lower.includes('expensive') || lower.includes('objection')) {
    const step4 = next.find(s => (s.title && s.title.toLowerCase().includes('objection')) || s.id === 4);
    if (step4) {
      step4.body += `\n[Swara Update]: ${userInstruction}`;
    }
  }

  if (lower.includes('visit') || lower.includes('store') || lower.includes('showroom')) {
    actionSummary = 'Schedule a showroom/store visit';
    const step5 = next.find(s => (s.title && s.title.toLowerCase().includes('next step')) || s.id === 5);
    if (step5) {
      step5.body = `Ask permission before offering this next step: Schedule a showroom or store visit. Details: ${userInstruction}`;
    }
    const step6 = next.find(s => (s.title && s.title.toLowerCase().includes('close')) || s.id === 6);
    if (step6) {
      step6.body = `Briefly recap the caller's request, confirm the scheduled showroom visit, ask if they need anything else, and thank them warmly.`;
    }
  } else if (lower.includes('order') || lower.includes('book') || lower.includes('buy')) {
    actionSummary = 'Place an order / booking';
    const step5 = next.find(s => (s.title && s.title.toLowerCase().includes('next step')) || s.id === 5);
    if (step5) {
      step5.body = `Ask permission before offering this next step: Confirm the order / booking details. Details: ${userInstruction}`;
    }
  } else if (lower.includes('whatsapp') || lower.includes('catalog') || lower.includes('brochure')) {
    actionSummary = 'Send WhatsApp catalog & pricing';
    const step5 = next.find(s => (s.title && s.title.toLowerCase().includes('next step')) || s.id === 5);
    if (step5) {
      step5.body = `Ask permission before offering this next step: Send product catalog and pricing via WhatsApp. Details: ${userInstruction}`;
    }
  } else {
    const targetStep = next[3] || next[1] || next[0];
    if (targetStep) {
      targetStep.body += `\n[Swara Update]: ${userInstruction}`;
    }
  }

  return {
    success: true,
    reply: `Swara incorporated your instruction into the call script: "${userInstruction}"`,
    openingGreeting: null,
    expectedCustomerAction: actionSummary || null,
    suggestedNextQuestion: 'What are you expecting from the customer? (e.g. Schedule a showroom visit, place an order, or send details on WhatsApp)',
    steps: next
  };
}
