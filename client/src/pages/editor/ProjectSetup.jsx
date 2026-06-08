import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Link2, 
  ChevronRight, 
  ArrowLeft, 
  Upload, 
  Sparkles,
  CheckCircle2,
  Info,
  X,
  User,
  Cpu,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  PlusCircle,
  Save
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import API from '../../apis/api';
import routes from '../../routes';
import Notification from '../../components/common/Notification';
import UpgradeModal from '../../components/common/UpgradeModal';



const ProjectSetup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // High-fidelity demo data for rapid onboarding/testing
  const demoData = {
    personalInfo: {
      name: 'Alex Rivera',
      targetRole: 'Senior Full Stack Engineer',
      email: 'alex.rivera@dev.io',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      bio: 'Senior Full Stack Engineer with 6+ years of experience specializing in building highly scalable React applications and robust Node.js microservices. Passionate about developer tools, aesthetic UI design systems, and AI integrations.',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/alexrivera' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/alexrivera' },
        { platform: 'LeetCode', url: 'https://leetcode.com/u/alexrivera' }
      ]
    },
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'GraphQL', 'Python', 'LLMs'],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechFlow Solutions',
        location: 'San Francisco, CA',
        duration: '2023 - Present',
        description: '• Led a team of 4 engineers to rebuild the core SaaS analytics dashboard, improving query speeds by 40% and visual load times by 60%.\n• Designed and maintained a custom internal React design system, driving UI consistency across 5 distinct products.\n• Integrated LLM-powered autocomplete features, saving active users an average of 15 minutes per day.'
      },
      {
        title: 'Full Stack Developer',
        company: 'AppForge Inc.',
        location: 'Austin, TX',
        duration: '2020 - 2023',
        description: '• Developed and deployed scalable microservices using Express.js and Docker, handling over 10M daily API requests.\n• Collaborated closely with product designers to implement pixel-perfect, responsive UI using Tailwind CSS.\n• Set up robust CI/CD pipelines via GitHub Actions, reducing deployment errors by 75%.'
      }
    ],
    projects: [
      {
        title: 'Aura AI - Semantic Search',
        description: 'An AI-powered document search engine that parses and indexes PDF files to support natural language questions and return instant semantic references using vector embeddings.',
        technologies: ['React', 'FastAPI', 'Pinecone', 'OpenAI', 'Tailwind CSS']
      },
      {
        title: 'Velo - Task Workspace',
        description: 'A rich collaborative workspace featuring real-time kanban boards, dynamic team chat, nested documentation wiki, and interactive productivity analytics.',
        technologies: ['Next.js', 'Socket.io', 'MongoDB', 'Framer Motion']
      }
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        school: 'University of California, Berkeley',
        year: '2020'
      }
    ]
  };

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null); // 'resume', 'linkedin', 'manual'
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  
  // Project general details
  const [projectName, setProjectName] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // Guided wizard states
  const [manualTab, setManualTab] = useState('profile'); // 'profile', 'skills', 'experience', 'projects', 'education'
  const [manualData, setManualData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      socialLinks: [
        { platform: 'GitHub', url: '' },
        { platform: 'LinkedIn', url: '' },
        { platform: 'LeetCode', url: '' }
      ]
    },
    skills: [],
    experience: [],
    projects: [],
    education: []
  });

  // Local Form Entry States for arrays (Experience, Projects, Education)
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
  const [tempExperience, setTempExperience] = useState({
    title: '', company: '', location: '', duration: '', description: ''
  });

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [tempProject, setTempProject] = useState({
    title: '', description: '', technologies: []
  });
  const [projectTechInput, setProjectTechInput] = useState('');

  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);
  const [tempEducation, setTempEducation] = useState({
    degree: '', school: '', year: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  const [notification, setNotification] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalMessage, setUpgradeModalMessage] = useState('');

  const methods = [
    {
      id: 'resume',
      title: 'Import from Resume',
      description: 'Upload your PDF resume and let AI extract your experience.',
      icon: <FileText size={32} className="text-cyan-400" />,
      color: 'cyan'
    },
    {
      id: 'github',
      title: 'Sync from GitHub',
      description: 'Import your repositories, pinned projects, and profile details.',
      icon: <FolderGit2 size={32} className="text-emerald-400" />,
      color: 'emerald'
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
      title: 'Guided Form Entry',
      description: 'Build your custom profile step-by-step with our interactive form.',
      icon: <Sparkles size={32} className="text-purple-400" />,
      color: 'purple'
    }
  ];

  const manualTabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Cpu size={16} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={16} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> }
  ];

  const popularSkills = [
    'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 
    'Python', 'PostgreSQL', 'Docker', 'UI/UX Design', 'Figma', 'GraphQL'
  ];

  const handleMethodSelect = (id) => {
    setMethod(id);
    setStep(2);
    // Pre-initialize states
    if (id === 'manual' && !projectName) {
      setProjectName("My Portfolio Draft");
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else if (step === 2) {
      setStep(1);
      setFile(null);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      setNotification({ type: 'warning', message: 'Please upload a PDF, DOCX, or Image file.' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePreFill = () => {
    setManualData(demoData);
    setProjectName(`${demoData.personalInfo.name}'s Portfolio`);
    setTargetRole(demoData.personalInfo.targetRole);
  };

  // Profile Form Updates
  const handleProfileChange = (field, val) => {
    setManualData(prev => {
      const updated = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: val
        }
      };
      if (field === 'name' && val) {
        setProjectName(`${val}'s Portfolio`);
      }
      if (field === 'targetRole' && val) {
        setTargetRole(val);
      }
      return updated;
    });
  };

  const handleSocialChange = (platform, val) => {
    setManualData(prev => {
      const links = [...prev.personalInfo.socialLinks];
      const idx = links.findIndex(l => l.platform.toLowerCase() === platform.toLowerCase());
      if (idx > -1) {
        links[idx].url = val;
      } else {
        links.push({ platform, url: val });
      }
      return {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          socialLinks: links
        }
      };
    });
  };

  // Skill Managers
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (skillInput.trim() && !manualData.skills.includes(skillInput.trim())) {
      setManualData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleToggleSkill = (skill) => {
    setManualData(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists 
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill]
      };
    });
  };

  const handleRemoveSkill = (skill) => {
    setManualData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Experience Managers
  const saveExperience = () => {
    if (!tempExperience.title.trim() || !tempExperience.company.trim()) {
      setNotification({ type: 'warning', message: 'Please enter both job title and company name.' });
      return;
    }
    setManualData(prev => {
      const list = [...prev.experience];
      if (editingExperienceIndex !== null) {
        list[editingExperienceIndex] = tempExperience;
      } else {
        list.push(tempExperience);
      }
      return { ...prev, experience: list };
    });
    setTempExperience({ title: '', company: '', location: '', duration: '', description: '' });
    setIsAddingExperience(false);
    setEditingExperienceIndex(null);
  };

  const startEditExperience = (idx) => {
    setEditingExperienceIndex(idx);
    setTempExperience(manualData.experience[idx]);
    setIsAddingExperience(true);
  };

  const deleteExperience = (idx) => {
    setManualData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }));
  };

  // Projects Managers
  const saveProject = () => {
    if (!tempProject.title.trim()) {
      setNotification({ type: 'warning', message: 'Please enter a project title.' });
      return;
    }
    setManualData(prev => {
      const list = [...prev.projects];
      if (editingProjectIndex !== null) {
        list[editingProjectIndex] = tempProject;
      } else {
        list.push(tempProject);
      }
      return { ...prev, projects: list };
    });
    setTempProject({ title: '', description: '', technologies: [] });
    setIsAddingProject(false);
    setEditingProjectIndex(null);
  };

  const startEditProject = (idx) => {
    setEditingProjectIndex(idx);
    setTempProject(manualData.projects[idx]);
    setIsAddingProject(true);
  };

  const deleteProject = (idx) => {
    setManualData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx)
    }));
  };

  const addProjectTech = (e) => {
    if (e) e.preventDefault();
    if (projectTechInput.trim() && !tempProject.technologies.includes(projectTechInput.trim())) {
      setTempProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, projectTechInput.trim()]
      }));
      setProjectTechInput('');
    }
  };

  const removeProjectTech = (tech) => {
    setTempProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  // Education Managers
  const saveEducation = () => {
    if (!tempEducation.degree.trim() || !tempEducation.school.trim()) {
      setNotification({ type: 'warning', message: 'Please enter both degree and school/university name.' });
      return;
    }
    setManualData(prev => {
      const list = [...prev.education];
      if (editingEducationIndex !== null) {
        list[editingEducationIndex] = tempEducation;
      } else {
        list.push(tempEducation);
      }
      return { ...prev, education: list };
    });
    setTempEducation({ degree: '', school: '', year: '' });
    setIsAddingEducation(false);
    setEditingEducationIndex(null);
  };

  const startEditEducation = (idx) => {
    setEditingEducationIndex(idx);
    setTempEducation(manualData.education[idx]);
    setIsAddingEducation(true);
  };

  const deleteEducation = (idx) => {
    setManualData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  const handleStepNext = async () => {
    if (!projectName.trim()) {
      setNotification({ type: 'warning', message: 'Please enter a project name.' });
      return;
    }
    if (!targetRole.trim()) {
      setNotification({ type: 'warning', message: 'Please enter a target role.' });
      return;
    }
    
    if (method !== 'manual' && method !== 'github' && !file) {
      setNotification({ type: 'warning', message: 'Please upload your resume file.' });
      return;
    }

    if (method === 'github' && !githubUsername.trim()) {
      setNotification({ type: 'warning', message: 'Please enter your GitHub username.' });
      return;
    }

    if (method === 'manual') {
      if (!manualData.personalInfo.name.trim()) {
        setNotification({ type: 'warning', message: 'Please fill out your name in the Profile section.' });
        setManualTab('profile');
        return;
      }
      if (!manualData.personalInfo.bio.trim()) {
        setNotification({ type: 'warning', message: 'Please write a brief summary in the Profile section.' });
        setManualTab('profile');
        return;
      }
    }

    await handleFinalize();
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      let finalContent = {};

      if (method === 'manual') {
        finalContent = manualData;
      } else if (method === 'github') {
        const syncRes = await API.post('/ai/import-github', {
          username: githubUsername.trim()
        });

        if (syncRes.data.success) {
          finalContent = syncRes.data.data;
        }
      } else if (file && (method === 'resume' || method === 'linkedin')) {
        const formData = new FormData();
        formData.append('resume', file);
        
        const parseRes = await API.post('/ai/parse-resume', formData);

        if (parseRes.data.success) {
          finalContent = parseRes.data.data;
        }
      }

      const res = await API.post('/projects', {
        title: projectName || `My Professional Portfolio`,
        description: targetRole || 'Personalized AI Portfolio',
        content: finalContent
      });
      
      if (res.data.success) {
        navigate(routes.project.index.replace(':id', res.data.data._id));
      }
    } catch (err) {
      console.error('Error creating project:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create project. Please try again.';
      
      // Check if it's a plan limit block
      if (err.response?.status === 403 && (errMsg.toLowerCase().includes('limit') || errMsg.toLowerCase().includes('block') || errMsg.toLowerCase().includes('portfolio'))) {
        setUpgradeModalMessage(errMsg);
        setIsUpgradeModalOpen(true);
      } else {
        setNotification({ type: 'error', message: errMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigations between manual wizard tabs
  const handleTabNext = () => {
    const activeIdx = manualTabs.findIndex(t => t.id === manualTab);
    if (activeIdx < manualTabs.length - 1) {
      setManualTab(manualTabs[activeIdx + 1].id);
    } else {
      handleStepNext();
    }
  };

  const handleTabPrev = () => {
    const activeIdx = manualTabs.findIndex(t => t.id === manualTab);
    if (activeIdx > 0) {
      setManualTab(manualTabs[activeIdx - 1].id);
    } else {
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-12 px-6 max-w-5xl mx-auto w-full">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          {step === 1 ? 'Back to Dashboard' : step === 2 ? 'Change Method' : 'Back to Details'}
        </button>

        {step === 1 && (
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
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  {methods.find(m => m.id === method)?.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{methods.find(m => m.id === method)?.title}</h2>
                  <p className="text-gray-500 text-sm">Step 2 of 3: Provide your details</p>
                </div>
              </div>

              {method === 'manual' && (
                <button
                  onClick={handlePreFill}
                  className="px-4 py-2 text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Pre-fill with Demo Data
                </button>
              )}
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              
              {method === 'github' ? (
                // GitHub + LeetCode Flow
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Project Name</label>
                      <input 
                        type="text" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer Portfolio"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-white placeholder-gray-650"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Target Role</label>
                      <input 
                        type="text" 
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Full Stack Engineer"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-white placeholder-gray-650"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-emerald-400 font-bold">GitHub Username *</label>
                    <input 
                      type="text" 
                      value={githubUsername}
                      onChange={(e) => {
                        setGithubUsername(e.target.value);
                        if (!projectName && e.target.value) {
                          setProjectName(`${e.target.value}'s Developer Portfolio`);
                        }
                      }}
                      placeholder="e.g. octocat"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-white placeholder-gray-650 font-mono"
                    />
                  </div>

                  <button 
                    onClick={handleStepNext}
                    disabled={!githubUsername.trim() || loading}
                    className="w-full mt-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none shadow-lg"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
                    {loading ? 'AI is building your stunning developer portfolio...' : 'Generate My Portfolio'}
                  </button>
                </div>
              ) : method !== 'manual' ? (
                // Resume / LinkedIn Flow
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Project Name</label>
                      <input 
                        type="text" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer Portfolio"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-white placeholder-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Target Role</label>
                      <input 
                        type="text" 
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Product Designer"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-white placeholder-gray-600"
                      />
                    </div>
                  </div>

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

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                  />

                  {!file ? (
                    <div 
                      onClick={triggerFileInput}
                      className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-3xl hover:border-cyan-500/30 transition-colors cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                        <Upload className="text-gray-400 group-hover:text-cyan-400 transition-colors" size={32} />
                      </div>
                      <p className="font-bold mb-1">Click to upload your {method === 'resume' ? 'Resume' : 'LinkedIn PDF'}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-tighter">PDF, DOCX, or Images (Max 5MB)</p>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                          <FileText className="text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={handleStepNext}
                    disabled={!file || loading}
                    className="w-full mt-12 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none shadow-lg"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
                    {loading ? 'AI is building your stunning portfolio...' : 'Generate My Portfolio'}
                  </button>
                </div>
              ) : (
                // Guided Form Flow (Manual Entry)
                <div className="space-y-6">
                  
                  {/* Tab Navigation */}
                  <div className="flex border-b border-white/10 overflow-x-auto pb-1 mb-4 gap-2 no-scrollbar scroll-smooth">
                    {manualTabs.map((t) => {
                      const isActive = manualTab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setManualTab(t.id)}
                          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 shrink-0 ${
                            isActive 
                              ? 'border-purple-500 bg-purple-500/5 text-purple-400 font-bold'
                              : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {t.icon}
                          {t.label}
                          {t.id === 'profile' && manualData.personalInfo.name && <CheckCircle2 size={12} className="text-green-400" />}
                          {t.id === 'skills' && manualData.skills.length > 0 && <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-300 rounded-full font-mono">{manualData.skills.length}</span>}
                          {t.id === 'experience' && manualData.experience.length > 0 && <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-300 rounded-full font-mono">{manualData.experience.length}</span>}
                          {t.id === 'projects' && manualData.projects.length > 0 && <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-300 rounded-full font-mono">{manualData.projects.length}</span>}
                          {t.id === 'education' && manualData.education.length > 0 && <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-300 rounded-full font-mono">{manualData.education.length}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Profile & Social Links */}
                  {manualTab === 'profile' && (
                    <div className="space-y-6 animate-fade-in-down">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Full Name *</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.name}
                            onChange={(e) => handleProfileChange('name', e.target.value)}
                            placeholder="Alex Rivera"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Target Professional Role *</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.targetRole || ''}
                            onChange={(e) => handleProfileChange('targetRole', e.target.value)}
                            placeholder="e.g. Senior Full Stack Engineer"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Email</label>
                          <input 
                            type="email"
                            value={manualData.personalInfo.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            placeholder="alex.rivera@dev.io"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Phone</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                            placeholder="+1 (555) 234-5678"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Location</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.location}
                            onChange={(e) => handleProfileChange('location', e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Professional Summary / elevator pitch *</label>
                        <textarea 
                          rows={4}
                          value={manualData.personalInfo.bio}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                          placeholder="Introduce yourself. Highlight key tech stacks, your design philosophy, and what value you drive."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700 leading-relaxed font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">GitHub Profile URL</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.socialLinks.find(l => l.platform.toLowerCase() === 'github')?.url || ''}
                            onChange={(e) => handleSocialChange('GitHub', e.target.value)}
                            placeholder="https://github.com/yourusername"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700 font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">LinkedIn Profile URL</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.socialLinks.find(l => l.platform.toLowerCase() === 'linkedin')?.url || ''}
                            onChange={(e) => handleSocialChange('LinkedIn', e.target.value)}
                            placeholder="https://linkedin.com/in/yourusername"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700 font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">LeetCode Profile URL</label>
                          <input 
                            type="text"
                            value={manualData.personalInfo.socialLinks.find(l => l.platform.toLowerCase() === 'leetcode')?.url || ''}
                            onChange={(e) => handleSocialChange('LeetCode', e.target.value)}
                            placeholder="https://leetcode.com/u/yourusername"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Skills */}
                  {manualTab === 'skills' && (
                    <div className="space-y-6 animate-fade-in-down">
                      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                        <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">Build Your Tech Stack</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Add programming languages, frameworks, design skills, or specific concepts. These populate the dynamic skills grids.</p>
                      </div>

                      <form onSubmit={handleAddSkill} className="flex gap-2">
                        <input 
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Type a skill (e.g. Next.js) and press Enter"
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-white placeholder-gray-700"
                        />
                        <button
                          type="submit"
                          className="px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1 text-sm shadow-md"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </form>

                      {/* Popular Quick-add Row */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Quick Suggestions</label>
                        <div className="flex flex-wrap gap-2">
                          {popularSkills.map((sk) => {
                            const isAdded = manualData.skills.includes(sk);
                            return (
                              <button
                                key={sk}
                                onClick={() => handleToggleSkill(sk)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  isAdded
                                    ? 'bg-purple-500 text-black border border-purple-400 font-bold'
                                    : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                              >
                                {isAdded ? '✓ ' : '+ '} {sk}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Render Active Skills */}
                      <div className="space-y-2 pt-4 border-t border-white/5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Active Skills ({manualData.skills.length})</label>
                        {manualData.skills.length === 0 ? (
                          <p className="text-sm text-gray-600 italic py-3">No skills added yet. Use the input above or select some suggestions.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 bg-black/20 p-4 border border-white/5 rounded-2xl">
                            {manualData.skills.map((sk) => (
                              <span 
                                key={sk}
                                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-300 font-medium flex items-center gap-1.5 group hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-300 transition-all cursor-pointer"
                                onClick={() => handleRemoveSkill(sk)}
                              >
                                {sk}
                                <X size={12} className="text-purple-400/50 group-hover:text-red-400 transition-colors" />
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Work Experience */}
                  {manualTab === 'experience' && (
                    <div className="space-y-6 animate-fade-in-down">
                      
                      {!isAddingExperience ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-300">Work Experience History</h4>
                            <button
                              onClick={() => {
                                setIsAddingExperience(true);
                                setEditingExperienceIndex(null);
                                setTempExperience({ title: '', company: '', location: '', duration: '', description: '' });
                              }}
                              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <PlusCircle size={14} /> Add Work Experience
                            </button>
                          </div>

                          {manualData.experience.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-black/10">
                              <Briefcase className="text-gray-600 mx-auto mb-2" size={32} />
                              <p className="text-sm text-gray-500 font-medium">No experience blocks added yet.</p>
                              <p className="text-xs text-gray-600 mt-1">Use the "Add" button or pre-fill at the top to populate.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {manualData.experience.map((exp, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between hover:border-purple-500/30 transition-all group">
                                  <div className="space-y-1">
                                    <h5 className="font-bold text-sm text-purple-300">{exp.title}</h5>
                                    <p className="text-xs text-gray-300 font-medium">{exp.company} <span className="text-gray-500 font-normal">({exp.location})</span></p>
                                    <span className="text-[10px] text-gray-500 font-mono block">{exp.duration}</span>
                                    {exp.description && (
                                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{exp.description}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1 ml-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => startEditExperience(idx)}
                                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => deleteExperience(idx)}
                                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Experience Item Form Creator
                        <div className="p-5 border border-purple-500/20 bg-purple-500/[0.02] rounded-2xl space-y-4 animate-fade-in-down">
                          <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold">
                            {editingExperienceIndex !== null ? "Edit Experience Entry" : "Create Experience Entry"}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Job Title *</label>
                              <input 
                                type="text"
                                value={tempExperience.title}
                                onChange={(e) => setTempExperience({...tempExperience, title: e.target.value})}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Company Name *</label>
                              <input 
                                type="text"
                                value={tempExperience.company}
                                onChange={(e) => setTempExperience({...tempExperience, company: e.target.value})}
                                placeholder="e.g. Acme Corp"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Duration *</label>
                              <input 
                                type="text"
                                value={tempExperience.duration}
                                onChange={(e) => setTempExperience({...tempExperience, duration: e.target.value})}
                                placeholder="e.g. 2023 - Present or Jan 2021 - Dec 2022"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Location</label>
                              <input 
                                type="text"
                                value={tempExperience.location}
                                onChange={(e) => setTempExperience({...tempExperience, location: e.target.value})}
                                placeholder="e.g. San Francisco, CA (Remote)"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Key Responsibilities / Accomplishments</label>
                            <textarea 
                              rows={4}
                              value={tempExperience.description}
                              onChange={(e) => setTempExperience({...tempExperience, description: e.target.value})}
                              placeholder="Write bullet points or a short paragraph. Start with actionable verbs: Led UI team... Optimised SQL query performance..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700 font-sans"
                            />
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => {
                                setIsAddingExperience(false);
                                setEditingExperienceIndex(null);
                              }}
                              className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveExperience}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-lg"
                            >
                              <Save size={12} /> Save Job
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Projects */}
                  {manualTab === 'projects' && (
                    <div className="space-y-6 animate-fade-in-down">
                      
                      {!isAddingProject ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-300">Key Projects</h4>
                            <button
                              onClick={() => {
                                setIsAddingProject(true);
                                setEditingProjectIndex(null);
                                setTempProject({ title: '', description: '', technologies: [] });
                              }}
                              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <PlusCircle size={14} /> Add Project
                            </button>
                          </div>

                          {manualData.projects.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-black/10">
                              <FolderGit2 className="text-gray-600 mx-auto mb-2" size={32} />
                              <p className="text-sm text-gray-500 font-medium">No project blocks added yet.</p>
                              <p className="text-xs text-gray-600 mt-1">Add your favorite github projects or client works.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {manualData.projects.map((proj, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between hover:border-purple-500/30 transition-all group">
                                  <div className="space-y-1">
                                    <h5 className="font-bold text-sm text-purple-300">{proj.title}</h5>
                                    <p className="text-xs text-gray-400 leading-relaxed font-sans">{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                      {proj.technologies.map((t) => (
                                        <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] font-mono text-gray-400 rounded-md">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => startEditProject(idx)}
                                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => deleteProject(idx)}
                                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Project Item Form Creator
                        <div className="p-5 border border-purple-500/20 bg-purple-500/[0.02] rounded-2xl space-y-4 animate-fade-in-down">
                          <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold">
                            {editingProjectIndex !== null ? "Edit Project Details" : "Create Project Details"}
                          </h4>

                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Project Title *</label>
                            <input 
                              type="text"
                              value={tempProject.title}
                              onChange={(e) => setTempProject({...tempProject, title: e.target.value})}
                              placeholder="e.g. Acme SaaS Platform"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Project Description</label>
                            <textarea 
                              rows={3}
                              value={tempProject.description}
                              onChange={(e) => setTempProject({...tempProject, description: e.target.value})}
                              placeholder="Describe what you built, the core problem it solves, and your specific contribution."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700 font-sans"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Technologies Used (Pill insertion)</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={projectTechInput}
                                onChange={(e) => setProjectTechInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addProjectTech();
                                  }
                                }}
                                placeholder="Type a tech tag (e.g. Tailwind) and press Enter"
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                              <button
                                onClick={addProjectTech}
                                className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                Add
                              </button>
                            </div>

                            {tempProject.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 bg-black/20 p-3 border border-white/5 rounded-xl mt-2">
                                {tempProject.technologies.map((t) => (
                                  <span 
                                    key={t}
                                    className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-[10px] text-purple-300 font-mono flex items-center gap-1 cursor-pointer hover:bg-red-500/5 hover:border-red-500/40 hover:text-red-300 transition-all"
                                    onClick={() => removeProjectTech(t)}
                                  >
                                    {t} <X size={10} />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => {
                                setIsAddingProject(false);
                                setEditingProjectIndex(null);
                              }}
                              className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveProject}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-lg"
                            >
                              <Save size={12} /> Save Project
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 5: Education */}
                  {manualTab === 'education' && (
                    <div className="space-y-6 animate-fade-in-down">
                      
                      {!isAddingEducation ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-300">Education & Certifications</h4>
                            <button
                              onClick={() => {
                                setIsAddingEducation(true);
                                setEditingEducationIndex(null);
                                setTempEducation({ degree: '', school: '', year: '' });
                              }}
                              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <PlusCircle size={14} /> Add Degree / School
                            </button>
                          </div>

                          {manualData.education.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-black/10">
                              <GraduationCap className="text-gray-600 mx-auto mb-2" size={32} />
                              <p className="text-sm text-gray-500 font-medium">No education blocks added yet.</p>
                              <p className="text-xs text-gray-600 mt-1">Provide schools, colleges, or key online course specializations.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {manualData.education.map((edu, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between hover:border-purple-500/30 transition-all group">
                                  <div className="space-y-1">
                                    <h5 className="font-bold text-sm text-purple-300">{edu.degree}</h5>
                                    <p className="text-xs text-gray-300 font-medium">{edu.school}</p>
                                    <span className="text-[10px] text-gray-500 font-mono block">{edu.year}</span>
                                  </div>
                                  <div className="flex gap-1 ml-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => startEditEducation(idx)}
                                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => deleteEducation(idx)}
                                      className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Education Item Form Creator
                        <div className="p-5 border border-purple-500/20 bg-purple-500/[0.02] rounded-2xl space-y-4 animate-fade-in-down">
                          <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold">
                            {editingEducationIndex !== null ? "Edit Education Entry" : "Create Education Entry"}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Degree / Certification *</label>
                              <input 
                                type="text"
                                value={tempEducation.degree}
                                onChange={(e) => setTempEducation({...tempEducation, degree: e.target.value})}
                                placeholder="e.g. B.S. in Software Engineering or AWS Solutions Architect"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Graduation Year *</label>
                              <input 
                                type="text"
                                value={tempEducation.year}
                                onChange={(e) => setTempEducation({...tempEducation, year: e.target.value})}
                                placeholder="e.g. 2023 or 2020 - 2024"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">School / University *</label>
                            <input 
                              type="text"
                              value={tempEducation.school}
                              onChange={(e) => setTempEducation({...tempEducation, school: e.target.value})}
                              placeholder="e.g. Stanford University"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-gray-700"
                            />
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => {
                                setIsAddingEducation(false);
                                setEditingEducationIndex(null);
                              }}
                              className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEducation}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-lg"
                            >
                              <Save size={12} /> Save Education
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Footer for Wizard Form */}
                  <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
                    <button
                      onClick={handleTabPrev}
                      className="px-5 py-3 rounded-xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleStepNext}
                        disabled={loading}
                        className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold transition-all text-xs shadow-md uppercase tracking-wider flex items-center gap-1.5"
                      >
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={14} />}
                        Generate Portfolio
                      </button>
                      <button
                        onClick={handleTabNext}
                        className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg"
                      >
                        Next Section <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}


      </main>

      <Footer />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Portfolio Limit Reached"
        message={upgradeModalMessage}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectSetup;
