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
const isValidDashboard = (data) =>
  data &&
  typeof data === 'object' &&
  typeof data.daily_insight === 'string' &&
  typeof data.focus_recommendation === 'string' &&
  Array.isArray(data.next_milestones);

const extractJson = (text) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) throw new Error('No JSON found');
  return JSON.parse(text.slice(start, end + 1));
};

const flattenRoadmap = (roadmap, checked = {}) => {
  const rows = [];
  for (const category of roadmap.categories || []) {
    for (const item of category.items || []) {
      rows.push({
        id: item.id,
        title: item.label,
        type: item.type,
        category: category.name,
        completed: Boolean(checked[item.id])
      });
    }
  }
  return rows;
};

const fallbackDashboard = ({ goal, estimate, items }) => {
  const remaining = items.filter((x) => !x.completed);
  const completedCount = items.length - remaining.length;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  const next_milestones = remaining.slice(0, 3).map((item, index) => ({
    title: item.title,
    reason: `Prioritize ${item.category.toLowerCase()} to reduce risk in the next phase.`,
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
  }));

  return {
    daily_insight:
      progress >= 70
        ? `Strong momentum: you have completed ${progress}% of your roadmap for ${goal}.`
        : `You have completed ${progress}% so far. Finish one high-impact task this week to keep momentum.`,
    focus_recommendation: estimate?.explanation || 'Protect 2-3 focused sessions this week and complete one milestone end-to-end.',
    next_milestones
  };
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

app.post('/api/dashboard', async (req, res) => {
  try {
    const { goal, roadmap, checked, estimate } = req.body || {};
    if (!goal || goal.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a goal (minimum 5 characters).' });
    }
    if (!isValidRoadmap(roadmap)) {
      return res.status(400).json({ error: 'Please provide a valid roadmap.' });
    }

    const items = flattenRoadmap(roadmap, checked || {});
    const payload = items.slice(0, 30);

    const prompt = `
You are a practical accountability coach.
Given goal + roadmap progress, produce concise dashboard copy.
Return ONLY valid JSON.

Rules:
- daily_insight: 1 sentence, max 26 words.
- focus_recommendation: 1 sentence, max 22 words.
- next_milestones: exactly 3 actionable items that are likely next priorities.
- priority must be one of: high, medium, low.
- No markdown. No extra keys.

Goal: "${goal}"
Roadmap items with completion:
${JSON.stringify(payload)}
Estimate (optional):
${JSON.stringify(estimate || null)}

Return JSON in this exact shape:
{
  "daily_insight": string,
  "focus_recommendation": string,
  "next_milestones": [
    { "title": string, "reason": string, "priority": "high"|"medium"|"low" }
  ]
}
`.trim();

    const resp = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'Return valid JSON only. No explanations outside JSON.' },
        { role: 'user', content: prompt }
      ]
    });

    const text = resp.choices?.[0]?.message?.content || '{}';
    const json = extractJson(text);
    if (!isValidDashboard(json) || json.next_milestones.length < 1) {
      throw new Error('Invalid dashboard JSON');
    }

    const normalized = {
      daily_insight: json.daily_insight,
      focus_recommendation: json.focus_recommendation,
      next_milestones: json.next_milestones.slice(0, 3).map((m, index) => ({
        title: m.title || `Milestone ${index + 1}`,
        reason: m.reason || 'Keep progress steady with a focused task block this week.',
        priority: ['high', 'medium', 'low'].includes(m.priority) ? m.priority : 'medium'
      }))
    };

    res.json(normalized);
  } catch (e) {
    console.error(e);
    try {
      const { goal, roadmap, checked, estimate } = req.body || {};
      if (!goal || !isValidRoadmap(roadmap)) {
        return res.status(500).json({ error: 'Failed to build dashboard.' });
      }
      const fallback = fallbackDashboard({
        goal,
        estimate,
        items: flattenRoadmap(roadmap, checked || {})
      });
      return res.json(fallback);
    } catch {
      return res.status(500).json({ error: 'Failed to build dashboard.' });
    }
  }
});

const PORT = Number(process.env.PORT || 5174);
app.listen(PORT, () => console.log(`Roadmap API running on port ${PORT}`));
