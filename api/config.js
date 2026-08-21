export default function handler(req, res) {
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return res.status(500).json({ error: 'TURNSTILE_SITE_KEY is missing in environment variables.' });
  }
  return res.status(200).json({ siteKey });
}
