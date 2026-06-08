import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, LayoutGrid, CreditCard, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import API from '../../apis/api';
import PlanBadge from '../../components/common/PlanBadge';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch admin statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-cyan-500 mr-3" size={32} />
        <span className="font-mono">Loading Admin Overview...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Admin Control Panel</h1>
          <p className="text-gray-400 mt-2">Aggregated metrics and system overview</p>
        </div>
        <Link
          to="/admin/users"
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-xs transition flex items-center gap-2"
        >
          Manage Users <ArrowRight size={14} />
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl max-w-md mx-auto text-center font-medium">
          {error}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Users */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-400"><Users size={100} /></div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1">Total Registered Users</span>
              <div className="text-4xl font-extrabold font-heading mb-4 text-white">{stats.users.total}</div>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1"><PlanBadge plan="free" size="sm" /> {stats.users.free}</span>
                <span className="flex items-center gap-1"><PlanBadge plan="pro" size="sm" /> {stats.users.pro}</span>
                <span className="flex items-center gap-1"><PlanBadge plan="lifetime" size="sm" /> {stats.users.lifetime}</span>
              </div>
            </div>

            {/* Portfolios hosting */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-400"><LayoutGrid size={100} /></div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1">Portfolios Hosting Status</span>
              <div className="text-4xl font-extrabold font-heading mb-4 text-white">{stats.portfolios.live + stats.portfolios.archived}</div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-green-400 font-semibold">● {stats.portfolios.live} Live</span>
                <span className="text-red-400 font-semibold">● {stats.portfolios.archived} Expired</span>
                <span className="text-slate-500">● {stats.portfolios.draft} Drafts</span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500"><CreditCard size={100} /></div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1">Cumulative Sales Revenue</span>
              <div className="text-4xl font-extrabold font-heading mb-4 text-amber-400">
                ₹{stats.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] font-mono text-slate-500">Includes recurring monthly bills and lifetime packages.</p>
            </div>

          </div>

          {/* Quick Info Grid */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" /> Platform Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center font-mono">
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Paid Users Ratio</div>
                <div className="text-xl font-bold text-white">
                  {stats.users.total ? ((stats.users.pro + stats.users.lifetime) / stats.users.total * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Portfolios Per User</div>
                <div className="text-xl font-bold text-white">
                  {stats.users.total ? ((stats.portfolios.live + stats.portfolios.draft + stats.portfolios.archived) / stats.users.total).toFixed(1) : 0}
                </div>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Active Portfolios Ratio</div>
                <div className="text-xl font-bold text-white">
                  {stats.portfolios.live + stats.portfolios.archived ? (stats.portfolios.live / (stats.portfolios.live + stats.portfolios.archived) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Average Order Value</div>
                <div className="text-xl font-bold text-amber-400">
                  ₹{stats.users.pro + stats.users.lifetime ? (stats.revenue.total / (stats.users.pro + stats.users.lifetime)).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
