import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import PlanBadge from '../../components/common/PlanBadge';
import API from '../../apis/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  Mail, 
  AtSign, 
  FileText, 
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Trash2,
  CreditCard,
  History,
  Calendar,
  XCircle,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import fallbackUser from '../../assets/images/fallback-user.png';
import Notification from '../../components/common/Notification';

const FALLBACK_AVATAR = fallbackUser;

export default function SettingsPage() {
  const { user, verifyUser } = useAuth();
  const { plan, subscription, limits, usage, payments, refreshSubscription } = useSubscription();
  const { openStandardCheckout, isProcessing } = useRazorpay();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = React.useRef(null);
  
  // Tab state: 'profile' or 'billing'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'billing' ? 'billing' : 'profile');

  // Only show onboarding if the user actually lacks a username
  const isOnboarding = user && !user.username;

  const handleImageError = (e) => {
    e.target.src = FALLBACK_AVATAR;
  };
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [usernameStatus, setUsernameStatus] = useState({
    loading: false,
    available: null,
    message: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username !== user?.username) {
        checkUsernameAvailability(formData.username);
      } else {
        setUsernameStatus({ loading: false, available: null, message: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, user?.username]);

  const checkUsernameAvailability = async (username) => {
    if (!username) return;
    setUsernameStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await API.get(`/auth/checkusername/${username}`);
      setUsernameStatus({
        loading: false,
        available: res.data.available,
        message: res.data.message
      });
    } catch (err) {
      setUsernameStatus({
        loading: false,
        available: false,
        message: 'Error checking availability'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: previewUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username && usernameStatus.available === false && formData.username !== user?.username) {
      setError('Please choose a different username');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      let finalAvatarUrl = formData.avatar;

      if (selectedFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('avatar', selectedFile);
        
        const uploadRes = await API.post('/auth/uploadavatar', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.success) {
          finalAvatarUrl = uploadRes.data.url;
        }
        setUploading(false);
      }

      const res = await API.put('/auth/updatedetails', {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        avatar: finalAvatarUrl
      });

      if (res.data.success) {
        setSuccess(true);
        setSelectedFile(null);
        await verifyUser();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your monthly subscription? Your active portfolios will remain online until the end of your billing cycle.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const res = await API.post('/subscription/cancel');
      if (res.data.success) {
        setToast({ type: 'success', message: 'Your subscription has been successfully cancelled.' });
        await refreshSubscription();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to cancel subscription.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCheckoutSuccess = async (newPlan) => {
    setToast({ type: 'success', message: `Upgrade successful! Welcome to ${newPlan.toUpperCase()}!` });
    await refreshSubscription();
    await verifyUser();
  };

  const handleCheckoutFailure = (errMessage) => {
    setToast({ type: 'error', message: errMessage });
  };

  const handleUpgrade = (planType) => {
    if (planType === 'pro') {
      openStandardCheckout(19900, 'pro', handleCheckoutSuccess, handleCheckoutFailure);
    } else if (planType === 'lifetime') {
      openStandardCheckout(99900, 'lifetime', handleCheckoutSuccess, handleCheckoutFailure);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (paise) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {toast && (
          <Notification
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
            className="mb-8"
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Onboarding Alert */}
          <AnimatePresence>
            {isOnboarding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6 flex gap-4"
              >
                <div className="p-2 bg-cyan-500/20 rounded-xl h-fit">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-gray-400 mt-1 text-sm leading-relaxed">
                    Set a unique <strong>UserID (username)</strong> to publish your portfolios. This ID will be part of your public URLs (e.g., <span className="text-cyan-400">profilio.com/u/yourname</span>).
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Toast */}
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
              >
                <div className="bg-[#0f0f0f] border border-green-500/30 rounded-2xl p-4 shadow-2xl shadow-green-500/10 flex items-center gap-4 backdrop-blur-xl">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">Profile Updated</h4>
                    <p className="text-gray-400 text-xs">Your changes have been saved successfully.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-heading">Settings</h1>
              <p className="text-gray-400 mt-2">Manage your profile and account preferences</p>
            </div>
            
            {/* Custom Tab Switcher */}
            <div className="flex bg-[#0f0f0f] p-1 rounded-xl border border-white/5 font-mono">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setSearchParams({});
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'profile' ? 'bg-cyan-500 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <User size={14} /> Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab('billing');
                  setSearchParams({ tab: 'billing' });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'billing' ? 'bg-cyan-500 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard size={14} /> Billing & Plan
              </button>
            </div>
          </div>

          {activeTab === 'profile' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <User size={200} />
                </div>

                {/* Profile Pic Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-cyan-500/50 p-1 bg-gradient-to-br from-cyan-500/20 to-purple-600/20">
                      <img 
                        src={formData.avatar || FALLBACK_AVATAR} 
                        alt="Profile" 
                        onError={handleImageError}
                        className={`w-full h-full rounded-full object-cover shadow-2xl transition-all ${uploading ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`}
                      />
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        </div>
                      )}
                    </div>
                    {user?.provider === 'local' && !uploading && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer border border-white/10">
                        <Camera className="w-6 h-6 text-white" />
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full space-y-4">
                    {user?.provider === 'local' ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-white font-bold text-lg">Profile Picture</h4>
                          <p className="text-gray-400 text-sm">Upload a high-quality professional headshot.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => fileInputRef.current.click()}
                            className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-cyan-400 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4" /> Change Photo
                              </>
                            )}
                          </button>

                          {formData.avatar && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, avatar: '' }));
                                setSelectedFile(null);
                              }}
                              className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h4 className="text-white font-semibold">Social Profile Sync</h4>
                        <p className="text-xs text-gray-400">Your profile picture is automatically synced from your {user?.provider} account.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mt-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] text-gray-300 font-mono uppercase tracking-tighter">Connected via {user?.provider}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {/* Username */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <AtSign className="w-3 h-3" /> UserID (Public Username)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="unique_handle"
                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white outline-none transition-all ${
                          usernameStatus.available === true ? 'border-green-500/50 focus:border-green-500' :
                          usernameStatus.available === false ? 'border-red-500/50 focus:border-red-500' :
                          'border-white/10 focus:border-cyan-500/50'
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {usernameStatus.loading ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : usernameStatus.available === true ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : usernameStatus.available === false ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : null}
                      </div>
                    </div>
                    {usernameStatus.message && (
                      <p className={`text-[11px] font-medium ${usernameStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                        {usernameStatus.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5 px-1">
                      <Info className="w-3 h-3" />
                      Used for your profile URL and project routing.
                    </p>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3 h-3" /> Display Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2 opacity-50">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  {/* Bio */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      maxLength="200"
                      placeholder="Briefly describe your expertise..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all resize-none"
                    />
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] text-gray-500">Maximum 200 characters</p>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {formData.bio.length}/200
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || (formData.username && usernameStatus.available === false && formData.username !== user?.username)}
                  className="group flex items-center gap-3 bg-white text-black px-10 py-4 rounded-xl font-bold hover:bg-cyan-400 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {isOnboarding ? 'Finish Setup' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* BILLING & PLAN MANAGEMENT TIER */
            <div className="space-y-6">
              
              {/* CURRENT PLAN BOX */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <CreditCard size={180} />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-cyan-400 animate-pulse" /> Active Plan Details
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-sm font-bold text-slate-300">Plan:</span>
                      <PlanBadge plan={plan} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400">
                      {plan === 'free' && 'Active portfolios limited to 1 hosted for 7 days.'}
                      {plan === 'pro' && 'Hosting remains online while subscription remains active.'}
                      {plan === 'lifetime' && 'Unlimited hosting and lifetime code export.'}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-400 sm:text-right">
                    <div>Portfolios: {usage?.activePortfolios || 0} active / {limits?.maxPortfolios === Infinity ? 'Unlimited' : limits?.maxPortfolios || 1} allowed</div>
                    <div>Hosting Duration: {limits?.hostingDuration || '7 days'}</div>
                  </div>
                </div>

                {/* PRO BILLING SCHEDULER OR LIFETIME STATUS */}
                {plan === 'pro' && subscription && (
                  <div className="space-y-4 border-t border-white/5 pt-6 text-xs text-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-cyan-400" />
                        <span><strong>Next Billing Date:</strong> {formatDate(subscription.currentPeriodEnd)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-400" />
                        <span><strong>Status:</strong> <span className="capitalize font-semibold text-green-400">{subscription.status}</span></span>
                      </div>
                    </div>

                    {subscription.status !== 'cancelled' && (
                      <div className="pt-4 flex justify-end">
                        <button
                          disabled={isCancelling}
                          onClick={handleCancelSubscription}
                          className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500 hover:text-white transition duration-300 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <>
                              <XCircle size={14} /> Cancel Subscription
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {subscription.status === 'cancelled' && subscription.gracePeriodEnd && (
                      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 flex items-center gap-2.5">
                        <AlertCircle size={16} />
                        <span>Subscription cancelled. Hosting remains active in grace period until <strong>{formatDate(subscription.gracePeriodEnd)}</strong>.</span>
                      </div>
                    )}
                  </div>
                )}

                {plan === 'lifetime' && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-400 flex items-center gap-3">
                    <Sparkles size={18} className="animate-pulse" />
                    <span><strong>Lifetime Membership Confirmed!</strong> You have unlocked permanent hosting, unlimited creation, and source code downloads forever. Thank you for your support!</span>
                  </div>
                )}
              </div>

              {/* UPGRADE OPTIONS FOR FREE OR DOWNGRADED PLAN */}
              {plan === 'free' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" /> Premium Upgrades Available
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pro monthly */}
                    <div className="p-5 rounded-2xl border border-cyan-500/30 bg-white/5 relative hover:border-cyan-400 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-sm font-bold text-white">Pro Plan</span>
                          <span className="text-xs font-mono text-cyan-400 font-bold">₹199 / month</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4">Host up to 5 portfolios, download source code, and get priority AI generation.</p>
                      </div>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpgrade('pro')}
                        className="w-full py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-black flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <>Upgrade to Pro <ArrowRight size={10} /></>}
                      </button>
                    </div>

                    {/* Lifetime */}
                    <div className="p-5 rounded-2xl border border-amber-500/20 bg-white/5 relative hover:border-amber-400 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-sm font-bold text-white">Lifetime Access</span>
                          <span className="text-xs font-mono text-amber-400 font-bold">₹999 one-time</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4">Unlimited active portfolios, permanent lifetime hosting, and source code export forever.</p>
                      </div>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpgrade('lifetime')}
                        className="w-full py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <>Get Lifetime Access <ArrowRight size={10} /></>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* BILLING HISTORY TABLE */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <History size={18} className="text-slate-400" /> Payment & Billing History
                </h3>

                {!payments || payments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No payment records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left font-mono">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-widest">
                          <th className="py-2.5 pr-4">Invoice Date</th>
                          <th className="py-2.5 pr-4">Description</th>
                          <th className="py-2.5 pr-4">Amount</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                        {payments.map((payment) => (
                          <tr key={payment._id}>
                            <td className="py-3 pr-4">{formatDate(payment.createdAt)}</td>
                            <td className="py-3 pr-4 capitalize">{payment.type === 'pro_monthly' ? 'Pro Monthly Subscription' : 'Lifetime Access Plan'}</td>
                            <td className="py-3 pr-4">{formatAmount(payment.amount)}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                payment.status === 'paid' 
                                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
