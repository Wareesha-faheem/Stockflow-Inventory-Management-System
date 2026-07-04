import { useContext, useMemo, useState } from "react";
import GlobalContext from "../contexts/GlobalContext";
import LoginContext from "../contexts/LoginContext";
import ToastContext from "../contexts/ToastContext";
import ConfirmContext from "../contexts/ConfirmContext";
import Stamp from "./Stamp";
import { UserPlus, Search, Pencil, Trash2, X, ShieldCheck, Check, Minus } from "lucide-react";
import { ROLES, ROLE_ACCESS, ROLE_CLASS, ROLE_DESCRIPTION, MODULES } from "../constants/roles";

const EMPTY_FORM = { username: "", password: "", email: "", role: "Cashier/Biller" };

function Users() {
  const { appUsers, setAppUsers } = useContext(GlobalContext);
  const { displayName } = useContext(LoginContext);
  const { pushToast } = useContext(ToastContext);
  const { confirm } = useContext(ConfirmContext);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  function submit() {
    const username = form.username.trim();
    if (!username) {
      setError("Username is required.");
      return;
    }
    if (!editingId && !form.password.trim()) {
      setError("Password is required for a new account.");
      return;
    }
    const clash = appUsers.some(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== editingId,
    );
    if (clash) {
      setError(`"${username}" is already taken.`);
      return;
    }

    if (editingId) {
      setAppUsers((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? {
                ...u,
                username,
                email: form.email.trim(),
                role: form.role,
                password: form.password.trim() ? form.password.trim() : u.password,
              }
            : u,
        ),
      );
      pushToast(`Updated ${username}'s account.`, "success");
    } else {
      setAppUsers((prev) => [
        ...prev,
        {
          id: (prev.at(-1)?.id || 0) + 1,
          username,
          password: form.password.trim(),
          email: form.email.trim(),
          role: form.role,
          active: true,
        },
      ]);
      pushToast(`${username} added as ${form.role}.`, "success");
    }

    resetForm();
  }

  function startEdit(u) {
    setEditingId(u.id);
    setForm({ username: u.username, password: "", email: u.email || "", role: u.role });
    setError("");
  }

  function toggleActive(u) {
    setAppUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)));
    pushToast(`${u.username} ${u.active ? "deactivated" : "activated"}.`, "info");
  }

  async function removeUser(u) {
    if (u.username === displayName) {
      pushToast("You can't remove the account you're signed in with.", "error");
      return;
    }
    const remainingSuperAdmins = appUsers.filter((x) => x.role === "Super Admin" && x.id !== u.id);
    if (u.role === "Super Admin" && remainingSuperAdmins.length === 0) {
      pushToast("At least one Super Admin must remain.", "error");
      return;
    }

    const ok = await confirm({
      title: `Remove ${u.username}?`,
      message: "This deletes their account permanently. They won't be able to sign in anymore.",
      confirmLabel: "Remove account",
      danger: true,
    });
    if (!ok) return;

    setAppUsers((prev) => prev.filter((x) => x.id !== u.id));
    if (editingId === u.id) resetForm();
    pushToast(`${u.username} removed.`, "info");
  }

  const filtered = useMemo(() => {
    return appUsers.filter((u) => {
      const matchesQuery =
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [appUsers, query, roleFilter]);

  const moduleKeys = Object.keys(MODULES);

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Section 06</p>
          <h2>Users</h2>
        </div>
        <div className="datestamp">{appUsers.length} accounts</div>
      </div>

      <div className="panel">
        <h3>{editingId ? "Edit account" : "Create account"}</h3>
        <div className="field-row">
          <div className="field">
            <label htmlFor="uname">Username</label>
            <input id="uname" type="text" value={form.username} onChange={(e) => update("username", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="upass">{editingId ? "New password (optional)" : "Password"}</label>
            <input id="upass" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="uemail">Email</label>
            <input id="uemail" type="email" placeholder="name@StockFlow.app" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="urole">Role</label>
            <select id="urole" value={form.role} onChange={(e) => update("role", e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={submit}>
            <UserPlus size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            {editingId ? "Save changes" : "Add user"}
          </button>
          {editingId && (
            <button className="btn ghost" onClick={resetForm}>
              <X size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
              Cancel
            </button>
          )}
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <h3 style={{ margin: 0 }}>Accounts</h3>
          <div className="toolbar-controls">
            <div className="search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search username or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="ledger">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">No accounts match that search.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar-chip">{u.username.slice(0, 1).toUpperCase()}</span>
                      {u.username}
                    </div>
                  </td>
                  <td><span className={`role-badge ${ROLE_CLASS[u.role]}`}>{u.role}</span></td>
                  <td>{u.email || "-"}</td>
                  <td>
                    <button className="status-toggle" onClick={() => toggleActive(u)}>
                      {u.active !== false ? <Stamp type="ok">Active</Stamp> : <Stamp type="out">Inactive</Stamp>}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-btn" onClick={() => startEdit(u)}><Pencil size={12} /></button>
                      <button className="action-btn action-btn-danger" onClick={() => removeUser(u)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3><ShieldCheck size={17} style={{ marginRight: 6, verticalAlign: -3 }} />Role permissions</h3>
        <div className="perm-matrix">
          <table className="ledger">
            <thead>
              <tr>
                <th>Role</th>
                {moduleKeys.map((k) => (
                  <th key={k}>{MODULES[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r}>
                  <td>
                    <span className={`role-badge ${ROLE_CLASS[r]}`}>{r}</span>
                  </td>
                  {moduleKeys.map((k) => (
                    <td key={k} className="perm-cell">
                      {ROLE_ACCESS[r].includes(k) ? (
                        <Check size={15} className="perm-yes" />
                      ) : (
                        <Minus size={15} className="perm-no" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="role-desc-list">
          {ROLES.map((r) => (
            <li key={r}>
              <span className={`role-badge ${ROLE_CLASS[r]}`}>{r}</span>
              <span>{ROLE_DESCRIPTION[r]}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Users;
