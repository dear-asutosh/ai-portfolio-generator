import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Trash2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import fallbackUser from '../../assets/images/fallback-user.png';

const FALLBACK_AVATAR = fallbackUser;

export default function SettingsPage() {
  const { user, verifyUser } = useAuth();
  const [searchParams] = useSearchParams();
  const fileInputRef = React.useRef(null);
  
  // Only show onboarding if the user actually lacks a username
  const isOnboarding = user && !user.username;

  const handleImageError = (e) => {
    e.target.src = FALLBACK_AVATAR;
  };
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
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
      // Create local preview URL without uploading
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

      // Only upload to Cloudinary if a new file was selected
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
        setSelectedFile(null); // Clear selected file after success
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

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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

            {/* Success Toast (Global) */}
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
                    <button 
                      onClick={() => setSuccess(false)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <Save className="w-4 h-4 rotate-45" /> {/* Close-like icon */}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white font-heading">Settings</h1>
                <p className="text-gray-400 mt-2">Manage your profile and account preferences</p>
              </div>
            </div>

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

                {/* Email (Read Only) */}
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
        </motion.div>
      </div>
    </div>
  );
}
