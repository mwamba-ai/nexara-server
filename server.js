const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ status: 'Nexara server live' });
});

app.post('/generate', async (req, res) => {
  const { system, prompt } = req.body;
  if (!system || !prompt) return res.status(400).json({ error: 'Missing fields' });
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.7
      })
    });
    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Groq error' });
    }
    const data = await response.json();
    res.json({ text: data.choices?.[0]?.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log('Nexara server running on port ' + PORT));
