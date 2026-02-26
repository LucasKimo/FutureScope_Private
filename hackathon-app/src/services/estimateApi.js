export async function getEstimate({ goal, roadmap, checked }) {
  const res = await fetch('/api/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, roadmap, checked })
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Estimate request failed');
  }

  return res.json();
}
