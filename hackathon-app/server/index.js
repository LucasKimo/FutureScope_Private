import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const isValidRoadmap = (data) => data && typeof data === 'object' && Array.isArray(data.categories);
const isValidEstimate = (data) =>
  data &&
  typeof data === 'object' &&
  Number.isFinite(data.total_hours) &&
  data.suggested_hours_per_week &&
  Number.isFinite(data.suggested_hours_per_week.low) &&
  Number.isFinite(data.suggested_hours_per_week.mid) &&
  Number.isFinite(data.suggested_hours_per_week.high);

const extractJson = (text) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) throw new Error('No JSON found');
  return JSON.parse(text.slice(start, end + 1));
};

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
- 4-6 categories total; ~20-25 items overall.
- "categories[].name" is a concise topic.
- Each item.label is concise English (8-18 words).
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
    const json = extractJson(text);
    if (!isValidRoadmap(json)) throw new Error('Invalid JSON');

    res.json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
});

app.post('/api/estimate', async (req, res) => {
  try {
    const { goal, roadmap, checked } = req.body || {};
    if (!goal || goal.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a goal (minimum 5 characters).' });
    }
    if (!isValidRoadmap(roadmap)) {
      return res.status(400).json({ error: 'Please provide a valid roadmap.' });
    }

    const selected = [];
    for (const category of roadmap.categories || []) {
      for (const item of category.items || []) {
        const done = Boolean(checked && checked[item.id]);
        selected.push({
          id: item.id,
          label: item.label,
          type: item.type,
          category: category.name,
          completed: done
        });
      }
    }

    const prompt = `
You estimate realistic effort for learning/career goals.
Return ONLY valid JSON for time estimate, based on user goal and already-completed knowledge.

Rules:
- Account for completed knowledge to reduce remaining hours.
- Keep values realistic and conservative.
- suggested_hours_per_week must satisfy low <= mid <= high.
- total_hours is remaining effort from now.
- explanation is one concise sentence.
- JSON only.

User goal: "${goal}"
Knowledge checklist (completed true/false):
${JSON.stringify(selected)}

Return JSON in this exact shape:
{
  "total_hours": number,
  "suggested_hours_per_week": { "low": number, "mid": number, "high": number },
  "explanation": string
}
`.trim();

    const resp = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Return valid JSON only. No explanations outside JSON.' },
        { role: 'user', content: prompt }
      ]
    });

    const text = resp.choices?.[0]?.message?.content || '{}';
    const json = extractJson(text);
    if (!isValidEstimate(json)) throw new Error('Invalid estimate JSON');

    const low = Math.max(1, Math.round(json.suggested_hours_per_week.low));
    const mid = Math.max(low, Math.round(json.suggested_hours_per_week.mid));
    const high = Math.max(mid, Math.round(json.suggested_hours_per_week.high));

    res.json({
      total_hours: Math.max(1, Math.round(json.total_hours)),
      suggested_hours_per_week: { low, mid, high },
      explanation: typeof json.explanation === 'string' ? json.explanation : ''
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to estimate effort.' });
  }
});

const PORT = Number(process.env.PORT || 5174);
app.listen(PORT, () => console.log(`Roadmap API running on port ${PORT}`));
