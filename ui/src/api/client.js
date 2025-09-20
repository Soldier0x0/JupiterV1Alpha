export const fetchJSON = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const token = localStorage.getItem('JWT');
  const tenant = localStorage.getItem('TENANT_ID');

  const response = await fetch(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': tenant,
      ...headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('JWT');
      localStorage.removeItem('TENANT_ID');
      window.location.href = '/login';
    }
    throw new Error(await response.text());
  }

  return response.json();
};
