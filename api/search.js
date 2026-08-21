export default async function handler(req, res) {
  const { q, 'cf-turnstile-response': token } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  if (!token) {
    return res.status(400).json({ error: 'Security verification failed. Missing CAPTCHA token.' });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const apiKey = process.env.API_KEY;

  if (!turnstileSecret || !apiKey) {
    return res.status(500).json({ 
      error: 'Server configuration error: Environment keys missing.' 
    });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', turnstileSecret);
    formData.append('response', token);
    formData.append('remoteip', req.headers['x-forwarded-for'] || req.socket.remoteAddress);

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const turnstileData = await turnstileRes.json();

    if (!turnstileData.success) {
      return res.status(403).json({ 
        error: 'Anti-bot verification failed or token expired. Please try again.' 
      });
    }

    const targetUrl = `https://pak-sim-info-black.vercel.app/search?q=${encodeURIComponent(q)}&api-key=${encodeURIComponent(apiKey)}`;
    const backendRes = await fetch(targetUrl);
    const data = await backendRes.json();

    return res.status(backendRes.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to process search request.', 
      details: error.message 
    });
  }
}
