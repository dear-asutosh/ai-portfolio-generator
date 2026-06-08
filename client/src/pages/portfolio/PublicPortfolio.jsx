import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit2, AlertTriangle, ArrowLeft, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import API from '../../apis/api';
import { useAuth } from '../../context/AuthContext';
import ExpiredPortfolioPage from './ExpiredPortfolioPage';

const PublicPortfolio = () => {
  const { username, slug, id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      try {
        let endpoint = '';
        if (id) {
          endpoint = `/projects/public/${id}`;
        } else if (username && slug) {
          endpoint = `/projects/public/user/${username}/${slug}`;
        } else if (username) {
          endpoint = `/projects/public/user/${username}`;
        }

        const res = await API.get(endpoint);
        if (res.data.success) {
          if (res.data.archived) {
            setProject({ archived: true, ownerUsername: res.data.ownerUsername, archivedReason: res.data.archivedReason });
          } else {
            setProject(res.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching public portfolio:', err);
        setError(err.response?.data?.message || 'Portfolio not found or is in Draft mode.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPortfolio();
  }, [username, slug, id]);

  const getOrdinalSuffix = (num) => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const getCombinedCode = () => {
    if (!project?.generatedCode?.html) return '';
    const { html, css, js } = project.generatedCode;
    
    // Inject dynamic real-time visitor counter
    let assembledHtml = html;
    if (project.views !== undefined) {
      const formattedViews = Number(project.views).toLocaleString();
      assembledHtml = html.replace(
        /You are the <span class="font-bold text-zinc-100">30,037th<\/span> visitor/g,
        `You are the <span class="font-bold text-zinc-100">${formattedViews}${getOrdinalSuffix(project.views)}</span> visitor`
      );
    }

    const safeJs = String(js || '').replace(
      /(\b[A-Za-z_$][\w$]*\s*)\.className\s*=\s*(['"])calendar-cell\2\s*;/g,
      '$1.setAttribute("class", "calendar-cell");'
    );

    const rawCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="/" target="_self" />
  <title>${project.title} - Live Portfolio</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Lexend:wght@100..900&family=Plus+Jakarta+Sans:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">

  <!-- FontAwesome Icons -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    crossorigin="anonymous"
  />

  <!-- Devicon Icons -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css"
  />

  <!-- Tailwind CSS CDN (JIT) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Tailwind config extension for custom values -->
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          animation: {
            'spin-slow': 'spin 8s linear infinite',
            'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'bounce-slow': 'bounce 3s infinite',
          },
          backdropBlur: {
            xs: '2px',
          },
        },
      },
    };
  </script>

  <style>
    /* Base reset */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    /* Custom compiled CSS */
    ${css}
  </style>
</head>
<body>
  ${assembledHtml}
  <script>
    window.addEventListener('error', function(event) {
      console.warn('[Portfolio] Non-fatal script error:', event.message);
      event.preventDefault();
    });
    (function(){'use strict'; try { ${safeJs} } catch (error) { console.warn('[Portfolio] Script initialization skipped:', error.message); } })();
  </script>
</body>
</html>`;

    // Dynamic absolute URL guarantee for social platforms (ensures https://www. prefix and standard slash endings)
    let cleanedCode = rawCode.replace(/href=["'](?:https?:\/\/)?(?:www\.)?linkedin\.com\/([^\s"'<>]+)["']/gi, (match, path) => {
      const cleanPath = path.endsWith('/') ? path : path + '/';
      return `href="https://www.linkedin.com/${cleanPath}"`;
    });

    cleanedCode = cleanedCode.replace(/href=["'](?:https?:\/\/)?(?:www\.)?github\.com\/([^\s"'<>]+)["']/gi, (match, path) => {
      const cleanPath = path.replace(/\/$/, '');
      return `href="https://www.github.com/${cleanPath}"`;
    });

    cleanedCode = cleanedCode.replace(/href=["'](?:https?:\/\/)?(?:www\.)?leetcode\.com\/([^\s"'<>]+)["']/gi, (match, path) => {
      const cleanPath = path.replace(/\/$/, '');
      return `href="https://leetcode.com/${cleanPath}"`;
    });

    return cleanedCode;
  };

  const isOwner = user && project && project.user && (
    user.username === username || user.id === project.user || user._id === project.user
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#070708] flex flex-col items-center justify-center text-white z-50">
        <div className="relative flex flex-col items-center">
          {/* Glowing ring spinner */}
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/10 border-t-cyan-500 animate-spin mb-6" />
          <div className="absolute -top-1 w-18 h-18 rounded-full border border-purple-500/5 blur-sm animate-pulse" />
          
          <h2 className="text-xl font-heading font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse">
            Retrieving Live Portfolio...
          </h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-mono">Securing sandbox connection</p>
        </div>
      </div>
    );
  }

  if (project && project.archived) {
    return <ExpiredPortfolioPage ownerUsername={project.ownerUsername} />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full bg-[#0d0d0f] border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-red-500">
            <AlertTriangle size={150} />
          </div>
          
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          
          <h1 className="text-2xl font-bold font-heading mb-3">Portfolio Unreachable</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {error || 'This URL does not contain any active live portfolio. It might be set to Draft mode, or the link is expired.'}
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              to="/" 
              className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-cyan-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Go Back Home
            </Link>
            {user && (
              <Link 
                to={`/${user.username}/dashboard`}
                className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {/* Portfolio Sandbox Frame */}
      <iframe 
        title={project.title}
        srcDoc={getCombinedCode()}
        className="w-full h-full border-none m-0 p-0"
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />

      {/* Collapsible floating brand and control badge */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2">
        {/* Expanded action bar */}
        {isOverlayExpanded && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {isOwner && (
              <Link 
                to={`/project/${project._id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-black/85 hover:bg-cyan-500 border border-white/10 text-white hover:text-black rounded-xl text-xs font-bold font-mono tracking-wider shadow-2xl backdrop-blur-md transition-all uppercase group hover:-translate-y-1 active:translate-y-0"
                title="Return to AI Workspace Editor"
              >
                <Edit2 size={12} className="group-hover:rotate-12 transition-transform" /> Edit Portfolio
              </Link>
            )}

            <div className="group relative flex items-center">
              <Link 
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 bg-black/85 border border-white/10 text-white rounded-xl text-xs font-bold font-mono tracking-wider shadow-2xl backdrop-blur-md transition-all uppercase overflow-hidden hover:-translate-y-1 active:translate-y-0"
              >
                <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-500 ease-in-out inline-block whitespace-nowrap text-[10px] text-gray-300">
                  Build yours at
                </span>
                <span>PROFILIO</span>
              </Link>
            </div>
          </div>
        )}

        {/* Toggle button — always visible */}
        <button
          onClick={() => setIsOverlayExpanded(prev => !prev)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold font-mono tracking-wider shadow-2xl backdrop-blur-md transition-all border ${
            isOverlayExpanded
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
              : 'bg-black/85 border-white/10 text-white hover:bg-white/10'
          }`}
          title={isOverlayExpanded ? 'Collapse overlay' : 'Show actions'}
        >
          <Sparkles size={10} className="text-cyan-400" />
          {!isOverlayExpanded && <span className="text-[10px] uppercase tracking-widest">Profilio</span>}
          {isOverlayExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>
    </div>
  );
};

export default PublicPortfolio;
