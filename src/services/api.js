const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "rms_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(method, path, body = null, customHeaders = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: buildHeaders(customHeaders),
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    removeToken();
    window.location.hash = "#/login";
    throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.");
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.detail || data.message || "Error del servidor";
    throw new Error(message);
  }

  return data;
}

function apiGet(path) {
  return request("GET", path);
}

function apiPost(path, body) {
  return request("POST", path, body);
}

function apiPut(path, body) {
  return request("PUT", path, body);
}

function apiDelete(path) {
  return request("DELETE", path);
}

async function apiLogin(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const url = `${BASE_URL}/api/v1/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Credenciales inválidas");
  }

  setToken(data.access_token);
  return data;
}

export { apiGet, apiPost, apiPut, apiDelete, apiLogin, getToken, setToken, removeToken, BASE_URL };
