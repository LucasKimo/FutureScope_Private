async function jsonOrEmpty(res) {
  return res.json().catch(() => ({}));
}

export async function loadState(token) {
  const res = await fetch('/api/state', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await jsonOrEmpty(res);
  if (!res.ok) throw new Error(body.error || 'Failed to load state');
  return body.state || null;
}

export async function saveState(token, state) {
  const res = await fetch('/api/state', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ state })
  });
  const body = await jsonOrEmpty(res);
  if (!res.ok) throw new Error(body.error || 'Failed to save state');
  return body;
}

