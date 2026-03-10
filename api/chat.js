export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        // I updated this to the current stable Sonnet model, as the one in your App.js was invalid
        model: 'claude-3-5-sonnet-20241022', 
        max_tokens: req.body.max_tokens || 1000,
        system: req.body.system,
        messages: req.body.messages
      })
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Anthropic' });
  }
}