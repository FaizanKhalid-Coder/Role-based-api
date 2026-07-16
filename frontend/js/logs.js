auth.requireAuth();

const currentUser = auth.getUser();
document.getElementById("whoamiName").textContent = currentUser?.username || "—";
document.getElementById("logoutBtn").addEventListener("click", () => auth.logout());

const logWrap = document.getElementById("logWrap");
const logCountSub = document.getElementById("logCountSub");
const refreshBtn = document.getElementById("refreshBtn");

function renderLogs(logs) {
  if (logs.length === 0) {
    logWrap.innerHTML = `
      <div class="empty-state">
        <div class="icon">◌</div>
        <strong>No activity yet</strong>
        <p>Promote, block, and delete actions will appear here as they happen.</p>
      </div>`;
    return;
  }

  const entries = logs
    .map((log) => {
      const who = log.performedByUsername || "System";
      const isSystem = who === "System";
      const target = log.targetUsername ? ` → <strong>${escapeHtml(log.targetUsername)}</strong>` : "";

      return `
        <div class="log-entry">
          <div class="log-time">${timeAgo(log.createdAt)}</div>
          <div class="log-action ${escapeHtml(log.action)}">${escapeHtml(log.action)}</div>
          <div class="log-details">
            <strong>${escapeHtml(who)}</strong>${target}
            ${isSystem ? `<span class="system-tag">automated</span>` : ""}
            <div style="color:var(--text-muted); margin-top:2px;">${escapeHtml(log.details || "")}</div>
          </div>
        </div>`;
    })
    .join("");

  logWrap.innerHTML = entries;
}

async function loadLogs() {
  refreshBtn.disabled = true;
  try {
    const data = await apiRequest("/admin/logs");
    logCountSub.textContent = `${data.count} recorded event${data.count === 1 ? "" : "s"}`;
    renderLogs(data.logs);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      logWrap.innerHTML = `
        <div class="empty-state">
          <div class="icon">⛔</div>
          <strong>Admin access required</strong>
          <p>${escapeHtml(err.message)}</p>
        </div>`;
      logCountSub.textContent = "Access restricted";
    } else {
      logWrap.innerHTML = `<div class="empty-state"><strong>Couldn't load activity</strong><p>${escapeHtml(err.message)}</p></div>`;
    }
  } finally {
    refreshBtn.disabled = false;
  }
}

refreshBtn.addEventListener("click", loadLogs);
loadLogs();