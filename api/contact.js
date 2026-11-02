export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, businessName, email, phone, requirements } = body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    console.log(`[Contact Lead] Received inquiry from ${name} (${businessName || 'Business'}) - Email: ${email}, Phone: ${phone || 'N/A'}`);
    console.log(`[Contact Requirements] ${requirements || 'N/A'}`);

    return res.status(200).json({
      ok: true,
      message: 'Inquiry received. Our enterprise calling specialist will reach out within 2 hours.'
    });
  } catch (err) {
    console.error('[Contact Error]', err);
    return res.status(500).json({ error: 'Failed to process inquiry.' });
  }
}
