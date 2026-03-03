async function jsonOrEmpty(res) {
  return res.json().catch(() => ({}));
}

export async function register({ email, password }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const body = await jsonOrEmpty(res);
  if (!res.ok) throw new Error(body.error || 'Registration failed');
  return body;
}

export async function login({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const body = await jsonOrEmpty(res);
  if (!res.ok) throw new Error(body.error || 'Login failed');
  return body;
}

export async function me(token) {
  const res = await fetch('/api/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await jsonOrEmpty(res);
  if (!res.ok) throw new Error(body.error || 'Not authenticated');
  return body;
}

