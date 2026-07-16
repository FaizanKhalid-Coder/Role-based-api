auth.requireAuth();

const currentUser = auth.getUser();
document.getElementById("whoamiName").textContent = currentUser?.username || "—";
document.getElementById("logoutBtn").addEventListener("click", () => auth.logout());

const tableWrap = document.getElementById("tableWrap");
const userCountSub = document.getElementById("userCountSub");

function roleBadge(role) {
  return role === "admin"
    ? `<span class="badge badge-admin">Admin</span>`
    : `<span class="badge badge-user">User</span>`;
}

function statusBadge(isBlocked) {
  return isBlocked
    ? `<span class="badge badge-blocked">Blocked</span>`
    : `<span class="badge badge-active">Active</span>`;
}

function renderTable(users) {
  if (users.length === 0) {
    tableWrap.innerHTML = `
      <div class="empty-state">
        <div class="icon">◌</div>
        <strong>No users yet</strong>
        <p>New registrations will show up here.</p>
      </div>`;
    return;
  }

  const rows = users
    .map((u) => {
      const isSelf = u._id === currentUser?.id;
      const isAdmin = u.role === "admin";

      const actions = [];

      if (!isAdmin) {
        actions.push(
          `<button class="btn btn-ghost btn-sm" data-action="promote" data-id="${u._id}" data-name="${escapeHtml(u.username)}">Promote</button>`
        );
        actions.push(
          `<button class="btn btn-ghost btn-sm" data-action="block" data-id="${u._id}" data-name="${escapeHtml(u.username)}">${u.isBlocked ? "Unblock" : "Block"}</button>`
        );
        actions.push(
          `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${u._id}" data-name="${escapeHtml(u.username)}">Delete</button>`
        );
      } else {
        actions.push(`<span class="mono" style="color:var(--text-faint); font-size:12px;">${isSelf ? "you" : "protected"}</span>`);
      }

      return `
        <tr>
          <td class="cell-user">
            <strong>${escapeHtml(u.username)}</strong>
            <span>${escapeHtml(u.email)}</span>
          </td>
          <td>${roleBadge(u.role)}</td>
          <td>${statusBadge(u.isBlocked)}</td>
          <td>
            <div class="row-actions">${actions.join("")}</div>
          </td>
        </tr>`;
    })
    .join("");

  tableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Status</th>
          <th style="text-align:right;">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  tableWrap.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn));
  });
}

async function loadUsers() {
  try {
    const data = await apiRequest("/admin/users");
    userCountSub.textContent = `${data.count} account${data.count === 1 ? "" : "s"} in the system`;
    renderTable(data.users);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      tableWrap.innerHTML = `
        <div class="empty-state">
          <div class="icon">⛔</div>
          <strong>Admin access required</strong>
          <p>${escapeHtml(err.message)}</p>
        </div>`;
      userCountSub.textContent = "Access restricted";
    } else {
      tableWrap.innerHTML = `<div class="empty-state"><strong>Couldn't load users</strong><p>${escapeHtml(err.message)}</p></div>`;
    }
  }
}

async function handleAction(btn) {
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const name = btn.dataset.name;

  if (action === "delete" && !confirm(`Delete ${name}? This can't be undone.`)) return;

  btn.disabled = true;

  try {
    let data;
    if (action === "promote") {
      data = await apiRequest(`/admin/users/${id}/promote`, { method: "PUT" });
    } else if (action === "block") {
      data = await apiRequest(`/admin/users/${id}/block`, { method: "PUT" });
    } else if (action === "delete") {
      data = await apiRequest(`/admin/users/${id}`, { method: "DELETE" });
    }
    showToast(data.message, "ok");
    loadUsers();
  } catch (err) {
    showToast(err.message, "error");
    btn.disabled = false;
  }
}

loadUsers();