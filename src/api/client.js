const API_BASE = 'http://localhost:8000';

function getToken() {
  const stored = localStorage.getItem('pp_user');
  if (stored) {
    try {
      return JSON.parse(stored).token;
    } catch { return null; }
  }
  return null;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function pinLookup(pinCode) {
  return request(`/auth/pin-lookup/${pinCode}`);
}

export async function registerUser({ phone, password, name, home_pin_code }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, name, home_pin_code }),
  });
}

export async function loginUser({ phone, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function getMe() {
  return request('/auth/me');
}

// ── Submissions ─────────────────────────────────────────────────────────────

export async function submitIssue({ submission_pin_code, input_type, raw_text, raw_language, audio_file, image_file }) {
  const formData = new FormData();
  formData.append('submission_pin_code', submission_pin_code);
  formData.append('input_type', input_type);
  if (raw_text) formData.append('raw_text', raw_text);
  if (raw_language) formData.append('raw_language', raw_language);
  if (audio_file) formData.append('audio_file', audio_file);
  if (image_file) formData.append('image_file', image_file);

  return request('/submissions/', { method: 'POST', body: formData });
}

export async function getMySubmissions() {
  return request('/submissions/my');
}

export async function getSubmission(id) {
  return request(`/submissions/${id}`);
}

export async function editSubmission(id, raw_text) {
  const formData = new FormData();
  formData.append('raw_text', raw_text);
  return request(`/submissions/${id}`, { method: 'PUT', body: formData });
}

// ── Citizen Dashboard ───────────────────────────────────────────────────────

export async function getCitizenDashboard() {
  return request('/citizen/dashboard');
}

export async function getNotifications() {
  return request('/citizen/notifications');
}

export async function markNotificationRead(id) {
  return request(`/citizen/notifications/${id}/read`, { method: 'PUT' });
}

// ── MP Dashboard ────────────────────────────────────────────────────────────

export async function getMpDashboard() {
  return request('/mp/dashboard');
}

export async function getMpClusters(status, category) {
  let q = '/mp/clusters';
  const params = [];
  if (status) params.push(`status=${status}`);
  if (category) params.push(`category=${category}`);
  if (params.length) q += '?' + params.join('&');
  return request(q);
}

export async function getMpClusterDetail(id) {
  return request(`/mp/clusters/${id}`);
}

export async function decideMpCluster(id, { decision, reason, allocated_amount, financial_year }) {
  return request(`/mp/clusters/${id}/decide`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason, allocated_amount, financial_year }),
  });
}

export async function getMpDecisions() {
  return request('/mp/decisions');
}

export async function getMpBudget() {
  return request('/mp/budget');
}
