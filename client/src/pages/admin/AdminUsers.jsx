import React, { useState, useEffect } from 'react';
// No unused react-router-dom imports
import { Search, Loader2, ArrowLeft, ArrowRight, ShieldAlert, Award, Calendar, ExternalLink } from 'lucide-react';
import API from '../../apis/api';
import PlanBadge from '../../components/common/PlanBadge';
import Notification from '../../components/common/Notification';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  // Search and filter parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  // Plan override modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState('free');
  const [updatingUser, setUpdatingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users', {
        params: {
          page: currentPage,
          limit: 20,
          search: searchTerm,
          plan: planFilter
        }
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, planFilter]);

  // Debounced search query trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1); // Reset page to 1 on new search query
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleOpenPlanOverride = (user) => {
    setSelectedUser(user);
    setNewPlan(user.plan || 'free');
  };

  const handlePlanOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUpdatingUser(true);
    try {
      const res = await API.put(`/admin/users/${selectedUser._id}/plan`, { plan: newPlan });
      if (res.data.success) {
        setToast({ type: 'success', message: `Plan for user ${selectedUser.name} successfully updated to ${newPlan.toUpperCase()}` });
        
        // Update user locally
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, plan: newPlan } : u));
        setSelectedUser(null);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to update user plan.' });
    } finally {
      setUpdatingUser(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {toast && (
        <Notification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          className="mb-8"
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 pb-6 border-b border-b-white/5">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Registered Users</h1>
          <p className="text-gray-400 mt-2">Manage customer accounts and overwrite subscriptions</p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-xl text-sm outline-none transition"
          />
        </div>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-48 bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-xl py-2.5 px-3 text-sm text-slate-300 outline-none cursor-pointer transition"
        >
          <option value="">All Tiers</option>
          <option value="free">Free Users</option>
          <option value="pro">Pro Members</option>
          <option value="lifetime">Lifetime Access</option>
        </select>
      </div>

      {/* Main Table Content */}
      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center font-medium max-w-md mx-auto">
          {error}
        </div>
      ) : loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white/5 border border-white/5 rounded-2xl">
          <p className="text-slate-500 text-sm">No registered users matched the filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/5">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] text-slate-500 uppercase tracking-widest">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Billing Plan</th>
                  <th className="p-4 text-center">Active Portfolios</th>
                  <th className="p-4 text-center">Expired Portfolios</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {users.map((row) => (
                  <tr key={row._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-bold text-white">{row.name}</td>
                    <td className="p-4 text-slate-400 font-sans">{row.email}</td>
                    <td className="p-4"><PlanBadge plan={row.plan} size="sm" /></td>
                    <td className="p-4 text-center font-semibold text-green-400">{row.activePortfoliosCount || 0}</td>
                    <td className="p-4 text-center font-semibold text-red-400">{row.archivedPortfoliosCount || 0}</td>
                    <td className="p-4 text-slate-400">{formatDate(row.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenPlanOverride(row)}
                        className="px-3 py-1.5 rounded-lg border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black transition text-[11px] font-semibold font-mono"
                      >
                        Edit Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-t-white/5">
              <span className="text-xs text-slate-500 font-mono">
                Showing Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2 font-mono">
                <button
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={12} /> Previous
                </button>
                <button
                  disabled={currentPage >= pagination.pages || loading}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan Override Dialog Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f1322] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-cyan-400" /> Overwrite User Plan
            </h3>
            
            <div className="mb-4 text-xs text-slate-400 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3">
              <p>User: <strong>{selectedUser.name}</strong> ({selectedUser.email})</p>
              <p className="mt-1">Current Tier: <span className="uppercase font-mono text-cyan-400 font-semibold">{selectedUser.plan}</span></p>
            </div>

            <form onSubmit={handlePlanOverrideSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Select New Target Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none cursor-pointer focus:border-cyan-500/50 transition"
                >
                  <option value="free">Free Plan</option>
                  <option value="pro">Pro Plan (₹199/mo)</option>
                  <option value="lifetime">Lifetime Access (₹999)</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                ⚠️ Modifying user plan will immediately upgrade/downgrade access and trigger reactivation queues of archived portfolios. Down-grading to Free will trigger a 30-day migration grace period.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={updatingUser}
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                >
                  {updatingUser ? <Loader2 size={12} className="animate-spin" /> : <>Confirm Change</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
