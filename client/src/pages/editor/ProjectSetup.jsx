import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Link2, 
  ChevronRight, 
  ArrowLeft, 
  Upload, 
  Sparkles,
  Layout,
  CheckCircle2,
  Info
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import API from '../../apis/api';
import routes from '../../routes';

const ProjectSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null); // 'resume', 'linkedin', 'manual'
  const [loading, setLoading] = useState(false);

  const methods = [
    {
      id: 'resume',
      title: 'Import from Resume',
      description: 'Upload your PDF resume and let AI extract your experience.',
      icon: <FileText size={32} className="text-cyan-400" />,
      color: 'cyan'
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Import',
      description: 'Upload your LinkedIn "Save to PDF" profile extract.',
      icon: <Link2 size={32} className="text-blue-400" />,
      color: 'blue'
    },
    {
      id: 'manual',
      title: 'Direct Interactive Edit',
      description: 'Start with a beautiful template and fill in your details.',
      icon: <Layout size={32} className="text-purple-400" />,
      color: 'purple'
    }
  ];

  const handleMethodSelect = (id) => {
    setMethod(id);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep(1);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const res = await API.post('/projects', {
        title: `My Professional Portfolio`,
        description: 'Personalized AI Portfolio'
      });
      
      if (res.data.success) {
        navigate(routes.project.index.replace(':id', res.data.data._id));
      }
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-12 px-6 max-w-4xl mx-auto w-full">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-heading font-bold mb-4 gradient-text">
              Let's build your story.
            </h1>
            <p className="text-gray-400 text-lg mb-12">
              How would you like to start? We'll use this to seed your personalized portfolio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMethodSelect(m.id)}
                  className="bg-[#111] border border-white/5 p-8 rounded-2xl text-left hover:border-white/20 transition-all hover:translate-y-[-4px] group relative overflow-hidden"
                >
                  <div className="mb-6">{m.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.description}</p>
                  
                  <div className="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select Method <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                {methods.find(m => m.id === method)?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{methods.find(m => m.id === method)?.title}</h2>
                <p className="text-gray-500 text-sm">Step 2 of 2: Provide your information</p>
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl p-10">
              {method === 'manual' ? (
                <div className="space-y-8">
                  <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-start gap-4">
                    <Sparkles className="text-cyan-400 shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-cyan-100 font-medium mb-1">Interactive Template Mode</p>
                      <p className="text-xs text-cyan-100/60">You'll be taken to a live-editable portfolio where you can fill in the sections as you go. AI will assist you in refining the copy.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Project Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Senior Frontend Engineer Portfolio"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Target Role</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Product Designer"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {method === 'linkedin' && (
                    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-xs uppercase tracking-widest">
                        <Info size={14} /> Guide: How to export your profile
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-blue-400/60 font-bold">Step 1</span>
                          <p className="text-sm text-gray-300">Go to your <span className="text-white font-medium">LinkedIn Profile</span> page.</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-blue-400/60 font-bold">Step 2</span>
                          <p className="text-sm text-gray-300">Click <span className="text-white font-medium">"More"</span> (near the Resources section).</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-blue-400/60 font-bold">Step 3</span>
                          <p className="text-sm text-gray-300">Select <span className="text-white font-medium">"Save to PDF"</span> and upload it below.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-3xl hover:border-cyan-500/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                      <Upload className="text-gray-400 group-hover:text-cyan-400 transition-colors" size={32} />
                    </div>
                    <p className="font-bold mb-1">Click to upload your {method === 'resume' ? 'Resume' : 'LinkedIn PDF'}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">PDF Format only (Max 5MB)</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleFinalize}
                disabled={loading}
                className="w-full mt-12 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading ? <CheckCircle2 className="animate-pulse" /> : <Sparkles size={20} />}
                {loading ? 'Processing Your Story...' : 'Generate My Portfolio'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProjectSetup;
