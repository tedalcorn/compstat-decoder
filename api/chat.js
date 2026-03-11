export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const useThinking = req.body.thinking !== false;
    const body = {
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: useThinking ? 16000 : (req.body.max_tokens || 1000),
      system: req.body.system,
      messages: req.body.messages
    };

    if (useThinking) {
      body.thinking = { type: 'enabled', budget_tokens: 10000 };
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2025-04-14'
      },
      body: JSON.stringify(body)
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      console.error('Anthropic Error Detail:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Route Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
