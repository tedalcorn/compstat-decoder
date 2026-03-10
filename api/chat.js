export default async function handler(req, res) {
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
        // Switched to the most universally accessible model ID
        model: 'claude-3-5-sonnet-20240620', 
        max_tokens: req.body.max_tokens || 1000,
        system: req.body.system,
        messages: req.body.messages
      })
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      // This will print the FULL error from Anthropic in your Vercel logs
      console.error('Anthropic Error Detail:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Route Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}