export default function handler(req, res) {
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return res.status(500).json({ error: 'TURNSTILE_SITE_KEY missing in Environment Variables.' });
  }
  return res.status(200).json({ siteKey });
}
