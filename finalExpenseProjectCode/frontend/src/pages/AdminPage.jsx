
import React, { useCallback, useEffect, useState } from "react";
import {
  fetchAllUsers,
  fetchUserTransactions,
  changeUserRole,
  setUserBanned,
  exportUserTransactionsCsv
} from "../api";
import { Download } from "lucide-react";

const roleOptions = ["ALL", "ADMIN", "USER", "BANNED"];

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserTransactions, setSelectedUserTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers({ search: searchText, role: filterRole, size: 500 });
      const arr = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
      // normalize each user so UI expects .banned boolean and .active kept
      const normalized = arr.map(u => ({
        ...u,
        active: typeof u.active === "boolean" ? u.active : (u.active === "true" || u.active === 1),
        banned: !(typeof u.active === "boolean" ? u.active : (u.active === "true" || u.active === 1))
      }));
      setUsers(normalized);
    } catch (err) {
      console.error("fetchAllUsers failed:", err);
      alert("Failed to load users. See console for details.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, filterRole]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleViewTransactions = async (user) => {
    setSelectedUserId(user.id);
    setTxLoading(true);
    setSelectedUserTransactions([]);
    try {
      const tx = await fetchUserTransactions(user.id);
      if (Array.isArray(tx)) setSelectedUserTransactions(tx);
      else if (tx && Array.isArray(tx.content)) setSelectedUserTransactions(tx.content);
      else setSelectedUserTransactions([]);
    } catch (err) {
      console.error("fetchUserTransactions failed:", err);
      alert("Failed to fetch transactions. See console for details.");
      setSelectedUserTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      await changeUserRole(userId, newRole);
      setUsers((prev) => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      alert("Role updated.");
    } catch (err) {
      console.error("changeUserRole failed:", err);
      alert("Failed to change role. See console.");
    }
  };

  const handleBanToggle = async (userId, currentlyBanned) => {
    const message = currentlyBanned ? "Unban this user?" : "Ban this user?";
    if (!window.confirm(message)) return;
    try {
      await setUserBanned(userId, !currentlyBanned);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, banned: !currentlyBanned, active: currentlyBanned } : u)));
      if (!currentlyBanned && selectedUserId === userId) {
        setSelectedUserId(null);
        setSelectedUserTransactions([]);
      }
      alert(currentlyBanned ? "User unbanned." : "User banned.");
    } catch (err) {
      console.error("setUserBanned failed:", err);
      alert("Failed to update ban status. See console.");
    }
  };

  const handleExportCsv = async (userId, filenameBase) => {
    try {
      const blob = await exportUserTransactionsCsv(userId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filenameBase || "transactions"}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("exportUserTransactionsCsv failed:", err);
      alert("Export failed. See console.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Control Panel</h1>

      <div className="flex items-center justify-end space-x-3 mb-6">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search users..."
          className="p-2 border rounded-lg w-64"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 border rounded-lg"
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r === "ALL" ? "All Roles" : r[0] + r.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <button onClick={loadUsers} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Apply</button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Users List</h3>

          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="py-3">User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Controls</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="4" className="py-6 text-center text-gray-500">Loading users...</td></tr>
                )}

                {!loading && users.length === 0 && (
                  <tr><td colSpan="4" className="py-6 text-center text-gray-500">No users found</td></tr>
                )}

                {!loading && users.map((u) => {
                  const banned = !!u.banned || (u.active === false);
                  return (
                    <tr key={u.id} className="border-b">
                      <td className="py-4">
                        <div className="font-semibold">{u.username || u.name || "—"}</div>
                        <div className="text-xs text-gray-500">{u.displayName || ""}</div>
                      </td>
                      <td>{u.email || "-"}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs ${u.role === "ADMIN" ? "bg-green-100 text-green-800" : "bg-blue-50 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewTransactions(u)}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg"
                          >
                            Transactions
                          </button>

                          <select
                            defaultValue={u.role || "USER"}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="p-2 border rounded-lg"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          <button
                            onClick={() => handleBanToggle(u.id, banned)}
                            className={`px-3 py-2 rounded-lg text-white ${banned ? "bg-yellow-600" : "bg-red-600"}`}
                          >
                            {banned ? "Unban" : "Ban"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">User Transactions</h3>

          {!selectedUserId && <div className="text-sm text-gray-500">Select a user to view their transactions.</div>}

          {selectedUserId && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-indigo-700">
                  {users.find(u => u.id === selectedUserId)?.username || "User"}'s Transactions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const u = users.find(x => x.id === selectedUserId);
                      if (!u) return;
                      handleExportCsv(selectedUserId, (u.username || u.name || "user"));
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>

              {txLoading && <div className="text-gray-500">Loading transactions...</div>}

              {!txLoading && selectedUserTransactions.length === 0 && (
                <div className="text-gray-400">No transactions found</div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedUserTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">₹{Number(tx.amount).toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{tx.description}</div>
                        <div className="text-xs text-gray-400">Category: {tx.category || "—"}</div>
                      </div>
                      <div className="text-xs text-gray-400">{(tx.date || "").split("T")[0]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
