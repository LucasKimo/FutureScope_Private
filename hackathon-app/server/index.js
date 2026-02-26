import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const isValidRoadmap = (data) => data && typeof data === 'object' && Array.isArray(data.categories);

app.post('/api/roadmap', async (req, res) => {
  try {
    const { goal } = req.body || {};
    if (!goal || goal.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a goal (mininum 5 characters).' });
    }

    const prompt = `
You are a career/learning roadmap expert. Given the user's goal, return ONLY JSON
listing the essential knowledge and experiences required to achieve it.

Constraints:
- Use the JSON schema below.
- 4–7 categories total; ~20–25 items overall.
- "categories[].name" is a concise topic.
- Each item.label is concise English (8–18 words).
- type is "skill" or "experience".
- Output JSON only. No extra text.

User goal: "${goal}"

Return JSON in the shape:
{
  "goal": string,
  "timeframe_months": number,
  "categories": [
    { "name": string,
      "items": [ { "id": string, "label": string, "type": "skill"|"experience" } ]
    }
  ]
}
`.trim();

    const resp = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'Return valid JSON only. No explanations.' },
        { role: 'user', content: prompt }
      ]
    });

    const text = resp.choices?.[0]?.message?.content || '{}';
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const json = JSON.parse(text.slice(start, end + 1));
    if (!isValidRoadmap(json)) throw new Error('Invalid JSON');

    res.json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
});

const PORT = Number(process.env.PORT || 5174);
app.listen(PORT, () => console.log(`Roadmap API running on port ${PORT}`));
