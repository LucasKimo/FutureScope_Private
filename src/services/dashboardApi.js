export async function getDashboardData({ goal, roadmap, checked, estimate }) {
  const res = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, roadmap, checked, estimate })
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Dashboard request failed');
  }

  return res.json();
}
