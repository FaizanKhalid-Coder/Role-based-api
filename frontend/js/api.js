/* ============================================
   Shared API helper
   ============================================ */

const API_BASE = "http://localhost:5000/api";

const auth = {
  getToken() {
    return localStorage.getItem("rba_token");
  },
  getUser() {
    const raw = localStorage.getItem("rba_user");
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem("rba_token", token);
    localStorage.setItem("rba_user", JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem("rba_token");
    localStorage.removeItem("rba_user");
  },
  requireAuth() {
    if (!this.getToken()) {
      window.location.href = "index.html";
    }
  },
  logout() {
    this.clearSession();
    window.location.href = "index.html";
  },
};

async function apiRequest(path, { method = "GET", body, auth: needsAuth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (needsAuth) {
    const token = auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }

  return data;
}

function showToast(message, type = "ok") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type} show`;
  toast.textContent = message;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}