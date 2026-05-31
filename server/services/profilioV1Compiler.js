/**
 * Profilio Design System V1 Compiler — Deterministic Portfolio Engine
 * 
 * Compiles the Structured JSON profile data + live GitHub & LeetCode details
 * into high-fidelity, responsive HTML, CSS, and JS.
 * Bypasses LLM generation for instant, pixel-perfect, branded results.
 */

const { ensureAbsoluteUrl, normalizeSocialLinks } = require("../utils/urlHelpers");

/**
 * Calculates initials from user's full name.
 * e.g. "Alex Rivera" -> "AR"
 */
const getInitials = (name) => {
  if (!name) return 'PF';
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
};

/**
 * Resolves a technology name to the appropriate Devicon CSS class name.
 * Handles custom mappings for standard software/language terms.
 */
const getDeviconClass = (skillName) => {
  const name = skillName.trim().toLowerCase();
  const overrides = {
    'c++': 'cplusplus-plain',
    'c#': 'csharp-plain',
    'node.js': 'nodejs-plain',
    'node': 'nodejs-plain',
    'react.js': 'react-original',
    'react': 'react-original',
    'vue.js': 'vuejs-plain',
    'vue': 'vuejs-plain',
    'angular.js': 'angularjs-plain',
    'angular': 'angularjs-plain',
    'javascript': 'javascript-plain',
    'js': 'javascript-plain',
    'typescript': 'typescript-plain',
    'ts': 'typescript-plain',
    'html': 'html5-plain',
    'html5': 'html5-plain',
    'css': 'css3-plain',
    'css3': 'css3-plain',
    'sass': 'sass-original',
    'scss': 'sass-original',
    'tailwind': 'tailwindcss-plain',
    'tailwind css': 'tailwindcss-plain',
    'tailwindcss': 'tailwindcss-plain',
    'bootstrap': 'bootstrap-plain',
    'git': 'git-plain',
    'github': 'github-original',
    'gitlab': 'gitlab-plain',
    'docker': 'docker-plain',
    'kubernetes': 'kubernetes-plain',
    'k8s': 'kubernetes-plain',
    'aws': 'amazonwebservices-original',
    'amazon web services': 'amazonwebservices-original',
    'gcp': 'googlecloud-plain',
    'google cloud': 'googlecloud-plain',
    'azure': 'azure-plain',
    'mongodb': 'mongodb-plain',
    'postgres': 'postgresql-plain',
    'postgresql': 'postgresql-plain',
    'mysql': 'mysql-plain',
    'sqlite': 'sqlite-plain',
    'redis': 'redis-plain',
    'python': 'python-plain',
    'ruby': 'ruby-plain',
    'rails': 'rails-plain',
    'ruby on rails': 'rails-plain',
    'php': 'php-plain',
    'go': 'go-original-wordmark',
    'golang': 'go-original-wordmark',
    'rust': 'rust-original',
    'java': 'java-plain',
    'kotlin': 'kotlin-plain',
    'swift': 'swift-plain',
    'dart': 'dart-plain',
    'flutter': 'flutter-plain',
    'figma': 'figma-plain',
    'vscode': 'vscode-plain',
    'visual studio code': 'vscode-plain',
    'graphql': 'graphql-plain',
    'apollo': 'apollo-plain',
    'next.js': 'nextjs-original-wordmark',
    'nextjs': 'nextjs-original-wordmark',
    'nuxt': 'nuxtjs-plain',
    'nuxt.js': 'nuxtjs-plain',
    'redux': 'redux-original',
    'webpack': 'webpack-plain',
    'babel': 'babel-plain',
    'npm': 'npm-original-wordmark',
    'yarn': 'yarn-plain',
    'jquery': 'jquery-plain',
    'ajax': 'jquery-plain',
    'linux': 'linux-plain',
    'ubuntu': 'ubuntu-plain',
    'nginx': 'nginx-original',
    'apache': 'apache-plain',
    'heroku': 'heroku-original',
    'vercel': 'vercel-original',
    'netlify': 'netlify-plain',
    'firebase': 'firebase-plain',
    'supabase': 'supabase-plain',
    'django': 'django-plain',
    'flask': 'flask-original',
    'spring': 'spring-plain',
    'spring boot': 'spring-plain',
    'laravel': 'laravel-original',
    'symfony': 'symfony-original',
    'wordpress': 'wordpress-plain'
  };

  if (overrides[name]) return overrides[name];
  const normalized = name.replace(/[^a-z0-9]/g, '');
  return `${normalized}-plain`;
};

/**
 * Compiles HTML structure for Profilio Design System V1.
 */
const compileHTML = (userData, githubData, leetcodeData) => {
  const { personalInfo, skills = [], experience = [], projects = [], education = [] } = userData;
  const name = personalInfo?.name || 'Developer';
  const role = personalInfo?.targetRole || 'Software Engineer';
  const bio = personalInfo?.bio || 'Passionate developer dedicated to engineering clean and scalable solutions.';
  const email = personalInfo?.email || '';
  const phone = personalInfo?.phone || '';
  const location = personalInfo?.location || '';
  const initials = getInitials(name);

  // Social Links mapping
  const socialLinks = normalizeSocialLinks(personalInfo?.socialLinks);
  const githubUrl = socialLinks.find(l => l.platform === 'github')?.url || '';
  const linkedinUrl = socialLinks.find(l => l.platform === 'linkedin')?.url || '';
  const instagramUrl = socialLinks.find(l => l.platform === 'instagram')?.url || '';

  // Avatar URL selection (use GitHub profile avatar as fallback)
  const avatarUrl = githubData?.profile?.avatarUrl || '/profile-white.png';

  // Dotted tags in hero (top 3 skills)
  const heroTags = skills.slice(0, 3);

  // Dynamically render top skills inside the hero section description
  let heroSkillsHtml = '';
  if (skills.length > 0) {
    const topSkills = skills.slice(0, 3);
    if (topSkills.length === 1) {
      heroSkillsHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">${topSkills[0]}</span>`;
    } else if (topSkills.length === 2) {
      heroSkillsHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">${topSkills[0]}</span> and <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">${topSkills[1]}</span>`;
    } else {
      heroSkillsHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">${topSkills[0]}</span>, <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">${topSkills[1]}</span>, and <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">${topSkills[2]}</span>`;
    }
  } else {
    heroSkillsHtml = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">TypeScript</span>, <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">React</span>, and <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-800 border-dashed text-xs font-semibold bg-zinc-900/50 text-zinc-300">Node.js</span>`;
  }

  const heroBio = personalInfo?.bio || 'Focused on crafting aesthetic UI systems and writing clean, scalable backend architecture. Driven by a keen eye for details and user experience.';

  const aboutBioHtml = personalInfo?.bio 
    ? personalInfo.bio.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')
    : `
        <p>
          Hello, World! I am <span class="font-semibold text-zinc-200">${name}</span> — a passionate ${role} focused on crafting modern, high-performance web systems with clean architectures and elegant aesthetic design systems.
        </p>
        <p>
          I specialize in full-stack development, mapping business goals to elegant technological outcomes. I consistently explore cutting-edge developer tooling, state-of-the-art frameworks, and elegant system optimization strategies to exceed expectation.
        </p>
        <p>
          Beyond writing code, I actively participate in open-source developer communities, sharing tools and scripts to improve developer productivity worldwide. Let's connect and build something extraordinary!
        </p>
      `;

  // Gather active skill objects with Devicon classes
  const stackItems = skills.map(skill => {
    const deviconClass = getDeviconClass(skill);
    const iconHtml = `<i class="devicon-${deviconClass} colored text-3xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"></i>`;
    return { name: skill, iconHtml };
  });

  return `
  <!-- ambient mesh gradient absolute spheres -->
  <div class="mesh-sphere absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-40 mix-blend-screen pointer-events-none animate-pulse"></div>
  <div class="mesh-sphere absolute top-[40%] -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>

  <!-- NAVIGATION HEADER -->
  <header id="nav" class="flex justify-center border-b border-transparent sticky top-0 z-50 transition-all duration-300">
    <div class="flex items-center justify-between w-full max-w-3xl py-4 px-6 sm:px-8">
      <span class="font-bold text-2xl tracking-tight sm:text-3xl text-zinc-100 logo">${initials}</span>
      <div class="flex items-center gap-4">
        <nav class="hidden sm:flex items-center gap-6 text-sm font-semibold tracking-wide">
          <a href="#about" class="hover:text-cyan-400 transition-colors text-zinc-400">About</a>
          ${experience.length > 0 ? `<a href="#experience" class="hover:text-cyan-400 transition-colors text-zinc-400">Experience</a>` : ''}
          ${projects.length > 0 ? `<a href="#projects" class="hover:text-cyan-400 transition-colors text-zinc-400">Projects</a>` : ''}
        </nav>
        


        ${githubUrl ? `
        <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="p-2 border border-zinc-800 bg-zinc-900/50 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 hover:border-zinc-700 hover:text-blue-400 text-zinc-400" title="GitHub">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </a>` : ''}

        <!-- Dark/Light Theme Toggle -->
        <button id="theme-toggle" class="p-2 border border-zinc-800 bg-zinc-900/50 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 text-yellow-400 hover:border-zinc-700" title="Toggle Theme">
          <svg id="sun-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>
          <svg id="moon-icon" class="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- PORTFOLIO CONTAINER WRAPPER -->
  <main class="w-full max-w-3xl mx-auto px-6 sm:px-8 py-10 space-y-16">

    <!-- HERO SECTION -->
    <section id="hero" class="w-full pt-6">
      <div class="flex flex-col md:flex-row gap-8 relative items-start">
        
        <!-- Profile Picture Column with glowing indicator -->
        <div class="relative shrink-0">
          <div class="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl flex items-center justify-center">
            <img src="${avatarUrl}" alt="${name}" onerror="this.src='https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=200'" class="w-full h-full object-cover">
          </div>
          <!-- Glowing green status dot -->
          <div class="absolute -bottom-1 -right-1 rounded-full p-1.5 bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center status-dot animate-pulse">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>

        <!-- Info Column -->
        <div class="flex-1 space-y-4">
          <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight gradient-text py-0.5">
            Hi, I'm ${name} — A ${role}.
          </h1>
          
          <div class="text-base leading-relaxed text-zinc-400 space-y-2 font-sans font-light">
            <p>
              I build high-performance web applications using
              ${heroSkillsHtml}.
            </p>
            <p>
              ${heroBio}
            </p>
          </div>

          <!-- CTAs -->
          <div class="flex flex-wrap gap-4 pt-3">
            <a href="mailto:${email}" id="btn-email" class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-950 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <span id="btn-email-text">Get in touch</span>
            </a>
            ${phone ? `
            <a href="https://wa.me/${phone.replace(/[^\d+]/g, '')}" class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 shadow-sm transition-all hover:scale-[1.02]">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 2.03 14.113.992 11.995.992 6.56.992 2.137 5.362 2.133 10.793c-.001 1.705.452 3.37 1.312 4.848l-.993 3.629 3.715-.974zm13.682-7.391c-.272-.136-1.614-.796-1.863-.887-.249-.09-.431-.136-.613.136-.182.271-.703.887-.862 1.069-.159.182-.318.204-.59.068-.272-.136-1.15-.424-2.19-1.354-.809-.722-1.354-1.616-1.513-1.887-.159-.271-.017-.417.119-.553.123-.122.272-.318.409-.477.136-.159.182-.272.272-.453.09-.182.045-.34-.022-.477-.068-.136-.613-1.477-.839-2.021-.22-.53-.442-.458-.613-.467-.159-.008-.34-.01-.522-.01-.182 0-.477.068-.727.34-.25.272-.953.932-.953 2.27 0 1.338.975 2.63 1.111 2.812.136.182 1.92 2.931 4.65 4.114.65.28 1.157.447 1.554.573.653.208 1.248.179 1.718.109.524-.078 1.614-.658 1.841-1.294.227-.636.227-1.18.159-1.294-.068-.113-.249-.182-.522-.318z"/></svg>
              WhatsApp
            </a>` : ''}
          </div>

          <!-- Social Links -->
          <div class="flex items-center gap-5 pt-4 text-zinc-600 hover-icons">
            ${linkedinUrl ? `
            <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="transition-all hover:scale-110 hover:text-blue-400">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>` : ''}
            ${githubUrl ? `
            <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="transition-all hover:scale-110 hover:text-white">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>` : ''}
            ${instagramUrl ? `
            <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="transition-all hover:scale-110 hover:text-pink-500">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>` : ''}
          </div>
        </div>

      </div>
    </section>

    <!-- ABOUT SECTION -->
    <section id="about" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">About</h2>
      <div class="space-y-4 text-zinc-400 font-sans font-light leading-relaxed">
        ${aboutBioHtml}
      </div>
    </section>

    <!-- GITHUB CONTRIBUTION GRAPH -->
    ${githubUrl ? `
    <section id="github-contributions" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">Activity</h2>
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm overflow-hidden w-full flex flex-col items-center">
        <!-- Contribution Graph Container -->
        <div id="github-calendar" class="w-full overflow-x-auto select-none py-2 px-1 flex justify-center scrollbar-hide text-center" style="touch-action: pan-x;">
          <div class="text-zinc-500 font-mono text-xs flex flex-col items-center justify-center min-h-[110px]">
            <svg class="w-8 h-8 animate-spin border-2 border-cyan-500/20 border-t-cyan-500 rounded-full mb-3" viewBox="0 0 24 24"></svg>
            <span>Retrieving live contributions...</span>
          </div>
        </div>
      </div>
    </section>` : ''}

    <!-- DYNAMIC LIVE GITHUB PROJECTS SECTION -->
    ${githubData?.repos?.length > 0 ? `
    <section id="github-repos" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">Featured Pinned Repositories</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${githubData.repos.map(r => `
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 shadow-sm flex flex-col justify-between group hover:scale-[1.01]">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[16px] font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors truncate max-w-[200px]">${r.name}</h3>
              <svg class="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </div>
            <p class="text-xs text-zinc-400 font-light leading-relaxed line-clamp-2 mb-4">${r.description}</p>
          </div>
          <div class="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-900/50">
            <span class="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-zinc-400">
              <span class="w-2 h-2 rounded-full bg-cyan-500"></span> ${r.language}
            </span>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> ${r.stars}</span>
              <span class="inline-flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 10c0-5.523-4.477-10-10-10z"/></svg> ${r.forks}</span>
            </div>
          </div>
        </a>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- DYNAMIC LEETCODE CREDIBILITY DASHBOARD -->
    ${leetcodeData ? `
    <section id="leetcode-dashboard" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">LeetCode Credibility</h2>
      <div class="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        
        <!-- Left: General score circular metric wrapper -->
        <div class="flex items-center gap-6">
          <div class="relative w-24 h-24 flex items-center justify-center shrink-0">
            <!-- Sleek SVG progress circle -->
            <svg class="absolute w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" stroke-width="6" fill="none"></circle>
              <circle cx="48" cy="48" r="40" stroke="#10b981" stroke-width="6" fill="none" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * (leetcodeData.totalSolved / 3200))}"></circle>
            </svg>
            <div class="text-center">
              <p class="text-xl font-extrabold text-zinc-100 leading-none">${leetcodeData.totalSolved}</p>
              <p class="text-[9px] uppercase tracking-widest text-zinc-500 font-mono mt-1">Solved</p>
            </div>
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-zinc-100">Competitive Programming</h3>
            <p class="text-xs text-zinc-400 font-light font-mono leading-relaxed">Acceptance Rate: <span class="font-bold text-zinc-200">${leetcodeData.acceptanceRate}%</span></p>
            <p class="text-xs text-zinc-400 font-light font-mono leading-relaxed">Global Ranking: <span class="font-bold text-zinc-200">#${leetcodeData.ranking.toLocaleString()}</span></p>
          </div>
        </div>

        <!-- Right: Difficulty splits -->
        <div class="w-full md:w-56 space-y-3 font-mono text-xs">
          <div class="space-y-1">
            <div class="flex justify-between font-bold">
              <span class="text-emerald-400">Easy</span>
              <span class="text-zinc-300">${leetcodeData.easySolved}</span>
            </div>
            <div class="w-full h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500" style="width: ${Math.min(100, (leetcodeData.easySolved / 700) * 100)}%"></div>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between font-bold">
              <span class="text-yellow-400">Medium</span>
              <span class="text-zinc-300">${leetcodeData.mediumSolved}</span>
            </div>
            <div class="w-full h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-yellow-500" style="width: ${Math.min(100, (leetcodeData.mediumSolved / 1400) * 100)}%"></div>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between font-bold">
              <span class="text-red-400">Hard</span>
              <span class="text-zinc-300">${leetcodeData.hardSolved}</span>
            </div>
            <div class="w-full h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-red-500" style="width: ${Math.min(100, (leetcodeData.hardSolved / 400) * 100)}%"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
    ` : ''}

    <!-- STACK / SKILLS GRID SECTION -->
    ${stackItems.length > 0 ? `
    <section id="stack" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">Stack</h2>
      <div class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 shadow-sm">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          ${stackItems.map((item, idx) => `
          <div class="group relative cursor-pointer p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/40 hover:border-zinc-800 transition-all duration-300 flex items-center gap-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
            <div class="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-zinc-900/50 border border-zinc-850 group-hover:border-zinc-700 transition-colors">
              ${item.iconHtml}
            </div>
            <span class="text-xs font-semibold tracking-wide text-zinc-300 group-hover:text-cyan-300 transition-colors font-sans uppercase text-[10px]">${item.name}</span>
          </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- EXPERIENCE SECTION -->
    ${experience.length > 0 ? `
    <section id="experience" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">Experience</h2>
      <div class="space-y-3">
        ${experience.map((item, idx) => `
        <div class="accordion-item p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 transition-colors duration-300">
          <!-- Accordion Header -->
          <div class="flex items-center justify-between cursor-pointer accordion-trigger" data-index="exp-${idx}">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-zinc-800/60 border border-zinc-850 rounded-full flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-zinc-100">${item.company}</h3>
                <p class="text-xs text-zinc-500 font-mono font-medium">${item.title} • ${item.duration}</p>
              </div>
            </div>
            <div class="text-zinc-500 accordion-arrow transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <!-- Accordion Content -->
          <div class="accordion-content overflow-hidden max-h-0 transition-all duration-300 mt-0">
            <div class="pt-4 ml-12 space-y-3 border-t border-zinc-900/50 mt-4 text-sm text-zinc-400 font-sans font-light leading-relaxed">
              ${item.description ? item.description.split('\n').map(line => `<p>${line}</p>`).join('') : ''}
              ${item.location ? `<p class="text-xs text-zinc-500 italic mt-2">Location: ${item.location}</p>` : ''}
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- PROJECTS SECTION -->
    ${projects.length > 0 ? `
    <section id="projects" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">Projects</h2>
      <div class="space-y-3">
        ${projects.map((item, idx) => `
        <div class="accordion-item p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 transition-colors duration-300">
          <!-- Accordion Header -->
          <div class="flex items-center justify-between cursor-pointer accordion-trigger" data-index="proj-${idx}">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-zinc-800/60 border border-zinc-850 rounded-full flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-zinc-100">${item.title}</h3>
                <p class="text-xs text-zinc-500 font-mono font-medium">${item.technologies ? item.technologies.join(', ') : 'Software Application'}</p>
              </div>
            </div>
            <div class="text-zinc-500 accordion-arrow transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <!-- Accordion Content -->
          <div class="accordion-content overflow-hidden max-h-0 transition-all duration-300 mt-0">
            <div class="pt-4 ml-12 space-y-3 border-t border-zinc-900/50 mt-4 text-sm text-zinc-400 font-sans font-light leading-relaxed">
              <p>${item.description}</p>
              ${item.technologies?.length > 0 ? `
              <div class="flex flex-wrap gap-2 mt-4 text-xs">
                ${item.technologies.map(t => `<span class="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 font-mono text-[11px]">${t}</span>`).join('')}
              </div>` : ''}
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- EDUCATION SECTION -->
    ${education.length > 0 ? `
    <section id="education" class="w-full space-y-4 reveal animate-reveal">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-100">Education</h2>
      <div class="space-y-3">
        ${education.map((item, idx) => `
        <div class="accordion-item p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 transition-colors duration-300">
          <!-- Accordion Header -->
          <div class="flex items-center justify-between cursor-pointer accordion-trigger" data-index="edu-${idx}">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-zinc-800/60 border border-zinc-850 rounded-full flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479L12 21l-4.825-3.422a12.083 12.083 0 01.666-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-zinc-100">${item.degree}</h3>
                <p class="text-xs text-zinc-500 font-mono font-medium">${item.school} • ${item.year}</p>
              </div>
            </div>
            <div class="text-zinc-500 accordion-arrow transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <!-- Accordion Content -->
          <div class="accordion-content overflow-hidden max-h-0 transition-all duration-300 mt-0">
            <div class="pt-4 ml-12 space-y-3 border-t border-zinc-900/50 mt-4 text-sm text-zinc-400 font-sans font-light leading-relaxed">
              <p>Graduated successfully from ${item.school} in ${item.year}. Focus: ${item.degree}.</p>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

  </main>

  <!-- FOOTER -->
  <footer class="w-full py-20 border-t border-zinc-900 relative">
    <div class="max-w-3xl mx-auto px-6 sm:px-8 space-y-12">
      
      <!-- SAVILE QUOTE CARD -->
      <div class="relative p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 shadow-xl overflow-hidden">
        <div class="absolute -top-4 -left-4 opacity-5 text-zinc-500 select-none">
          <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.748-9.762 9-11l.569 1.13c-4.72 1.156-6.19 3.208-6.19 5.867h6.19v8.394h-9.569zm-14.017 0v-7.391c0-5.704 3.748-9.762 9-11l.569 1.13c-4.72 1.156-6.19 3.208-6.19 5.867h6.19v8.394h-9.569z"/></svg>
        </div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <p class="text-lg md:text-xl font-medium italic text-zinc-300">
            "A man who is master of patience is master of everything else."
          </p>
          <span class="text-sm font-bold text-zinc-500 whitespace-nowrap uppercase tracking-wider">— George Savile</span>
        </div>
      </div>

      <!-- VISITOR COUNTER -->
      <div class="flex justify-center">
        <div class="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-400">
          <div class="p-2 rounded-lg bg-zinc-800 text-zinc-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </div>
          <p class="text-xs font-semibold uppercase tracking-wider">You are the <span class="font-bold text-zinc-100">30,037th</span> visitor</p>
        </div>
      </div>

      <!-- BRANDING & COPYRIGHT -->
      <div class="text-center space-y-2">
        <p class="text-xs font-bold uppercase tracking-widest text-zinc-500">Designed & Compiled via <span class="text-cyan-400">PROFILIO</span></p>
        <p class="text-[11px] text-zinc-600">© ${new Date().getFullYear()} ${name}. All rights reserved.</p>
      </div>

    </div>
  </footer>

  <!-- FLOATING COMMAND CENTER / AI CHATBOT WIDGET -->
  <div id="chatbot-container" class="fixed bottom-6 right-6 z-50 font-mono flex flex-col items-end">
    <!-- Chat Dialog Window (hidden by default) -->
    <div id="chat-dialog" class="w-80 sm:w-96 h-[400px] border border-zinc-800 bg-zinc-900/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 max-h-0 opacity-0 transform translate-y-4 scale-95 transition-all duration-300">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/40">
        <div class="flex items-center gap-2.5">
          <div class="relative">
            <div class="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-xs font-bold text-cyan-400">${initials}</div>
            <div class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900"></div>
          </div>
          <div>
            <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-widest">${name.split(' ')[0]}'s Assistant</h4>
            <p class="text-[9px] text-emerald-400 font-bold uppercase tracking-wide">Dynamic Client AI</p>
          </div>
        </div>
        <button id="chat-close" class="p-1 hover:bg-zinc-850 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <!-- Messages List -->
      <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans font-light leading-relaxed">
        <div class="flex gap-2.5 max-w-[85%]">
          <div class="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-cyan-400 border border-zinc-700">${initials}</div>
          <div class="p-3 rounded-2xl bg-zinc-850 border border-zinc-800 text-zinc-300">
            Hello! I'm ${name.split(' ')[0]}'s custom assistant. Click a topic or type any question to learn about:
            <div class="flex flex-wrap gap-2 mt-3 font-mono text-[10px]">
              <button class="chat-suggest px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors uppercase font-bold" data-query="skills">Skills</button>
              <button class="chat-suggest px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors uppercase font-bold" data-query="projects">Projects</button>
              <button class="chat-suggest px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors uppercase font-bold" data-query="experience">Jobs</button>
              <button class="chat-suggest px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors uppercase font-bold" data-query="education">Education</button>
              <button class="chat-suggest px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors uppercase font-bold" data-query="contact">Contact</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Chat Input -->
      <form id="chat-form" class="p-3 border-t border-zinc-850 flex gap-2 bg-zinc-950/20">
        <input type="text" id="chat-input" placeholder="Type a message..." autocomplete="off" class="flex-1 bg-zinc-950/40 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/30 transition-colors font-sans" />
        <button type="submit" class="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 shrink-0 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
        </button>
      </form>
    </div>

    <!-- Toggle Button -->
    <button id="chat-toggle" class="p-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-950 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group hover:scale-105" title="Command Center">
      <svg class="w-5 h-5 text-zinc-900 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      <span class="text-xs uppercase font-bold tracking-widest text-zinc-900 hidden sm:inline">Command</span>
    </button>
  </div>
  `;
};

/**
 * Compiles premium CSS styles for Profilio Design System V1.
 * Supports elegant transition variables, keyframes, scrollbar hidings,
 * and dark/light modes.
 */
const compileCSS = () => {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    --color-accent-1: #06b6d4;
    --color-accent-2: #10b981;
    --color-highlight: #6366f1;
    --font-sans: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --bg-color: #000000;
    --text-color: #f4f4f5;
    --border-color: rgba(255, 255, 255, 0.08);
  }

  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-sans);
    background-color: var(--bg-color);
    color: var(--text-color);
    overflow-x: hidden;
    transition: background-color 0.3s, color 0.3s;
  }

  /* Font classes */
  .font-mono { font-family: var(--font-mono); }
  .font-sans { font-family: var(--font-sans); }

  /* Comprehensive Light Theme Overrides */
  body.light {
    --bg-color: #ffffff;
    --text-color: #18181b;
    --border-color: rgba(0, 0, 0, 0.08);
  }

  body.light .mesh-sphere {
    opacity: 0.15;
    background-color: #6366f1/5;
  }

  body.light header {
    background-color: rgba(255, 255, 255, 0.7);
    border-color: rgba(0, 0, 0, 0.05);
  }

  body.light header.scrolled {
    background-color: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.08);
  }

  body.light .logo { color: #000000; }
  body.light nav a { color: #71717a; }
  body.light nav a:hover { color: #06b6d4; }
  body.light .gradient-text {
    background: linear-gradient(to right, #18181b, #71717a, #18181b);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  body.light .status-dot {
    background-color: #ffffff;
    border-color: rgba(0, 0, 0, 0.08);
  }
  
  /* Comprehensive zinc utility overrides for light mode */
  body.light .text-zinc-100 { color: #18181b !important; }
  body.light .text-zinc-200 { color: #27272a !important; }
  body.light .text-zinc-300 { color: #3f3f46 !important; }
  body.light .text-zinc-400 { color: #52525b !important; }
  body.light .text-zinc-500 { color: #71717a !important; }
  body.light .text-zinc-600 { color: #a1a1aa !important; }
  
  body.light .bg-zinc-900 { background-color: #f4f4f5 !important; }
  body.light .bg-zinc-900\\/50 { background-color: rgba(0, 0, 0, 0.03) !important; }
  body.light .bg-zinc-900\\/30 { background-color: rgba(0, 0, 0, 0.02) !important; }
  body.light .bg-zinc-950\\/20 { background-color: rgba(0, 0, 0, 0.01) !important; }
  body.light .bg-zinc-950\\/40 { background-color: rgba(0, 0, 0, 0.04) !important; }
  body.light .bg-zinc-850 { background-color: #e4e4e7 !important; }
  body.light .bg-zinc-800\\/60 { background-color: rgba(0, 0, 0, 0.04) !important; }
  body.light .bg-zinc-950 { background-color: #ffffff !important; }
  
  body.light .border-zinc-800 { border-color: rgba(0, 0, 0, 0.08) !important; }
  body.light .border-zinc-850 { border-color: rgba(0, 0, 0, 0.06) !important; }
  body.light .border-zinc-900\\/50 { border-color: rgba(0, 0, 0, 0.04) !important; }

  body.light .hover-icons a { color: #71717a; }
  body.light .hover-icons a:hover { color: #000000; }
  body.light #btn-email { background-color: #18181b; color: #ffffff; }
  body.light #btn-email:hover { background-color: #27272a; }
  body.light #theme-toggle { border-color: rgba(0, 0, 0, 0.08); background-color: rgba(0, 0, 0, 0.03); color: #d97706 !important; }
  body.light #chatbot-container button#chat-toggle { background-color: #18181b; border-color: #18181b; color: #ffffff; }
  body.light #chatbot-container button#chat-toggle svg { color: #ffffff; }
  body.light #chatbot-container button#chat-toggle span { color: #ffffff; }
  body.light #chatbot-container #chat-dialog { background-color: rgba(255, 255, 255, 0.95); border-color: rgba(0, 0, 0, 0.08); color: #18181b !important; }
  body.light #chatbot-container #chat-dialog h4 { color: #18181b; }
  body.light #chatbot-container #chat-dialog #chat-input { background-color: rgba(0, 0, 0, 0.03); border-color: rgba(0, 0, 0, 0.08); color: #18181b; }
  body.light #chatbot-container #chat-dialog #chat-messages .bg-zinc-850 { background-color: rgba(0, 0, 0, 0.03); border-color: rgba(0, 0, 0, 0.05); color: #18181b; }
  body.light #chatbot-container #chat-dialog #chat-messages .chat-suggest { background-color: #ffffff; border-color: rgba(0, 0, 0, 0.08); color: #71717a; }
  body.light #chatbot-container #chat-dialog #chat-messages .chat-suggest:hover { color: #06b6d4; border-color: rgba(6, 182, 212, 0.3); }

  /* Header scrolling shadow */
  header.scrolled {
    background-color: rgba(0, 0, 0, 0.7);
    border-color: var(--border-color);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
  }

  /* Custom gradients */
  .gradient-text {
    background: linear-gradient(to right, #d4d4d8, #ffffff, #d4d4d8);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: shine 4s linear infinite;
  }

  @keyframes shine {
    to { background-position: 200% center; }
  }

  /* Hide scrollbar utility */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Sleek Thin Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9px;
  }
  body.light ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
  }

  /* Accordion Item expander transitions */
  .accordion-item:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }
  body.light .accordion-item {
    border-color: rgba(0, 0, 0, 0.06);
    background-color: rgba(0, 0, 0, 0.01);
  }
  body.light .accordion-item:hover {
    border-color: rgba(0, 0, 0, 0.12);
    background-color: rgba(0, 0, 0, 0.02);
  }
  body.light .accordion-trigger h3 { color: #18181b; }
  body.light .accordion-trigger p { color: #71717a; }

  /* Calendar graph layout */
  .calendar-day-grid {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, 1fr);
    gap: 3px;
  }
  .calendar-day {
    width: 11px;
    height: 11px;
    border-radius: 2px;
    transition: transform 0.1s;
  }
  .calendar-day:hover {
    transform: scale(1.15);
    z-index: 10;
  }

  /* Custom glow effect on hover logos */
  .hover-logo:hover {
    filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
  }
  `;
};

/**
 * Compiles dynamic JavaScript logic for Profilio Design System V1.
 * Binds sticky nav event listener, accordions, theme toggler,
 * email copier, custom chatbot widget, and fetches GitHub contribution history.
 */
const compileJS = (userData) => {
  const { personalInfo, skills = [], experience = [], projects = [], education = [] } = userData;
  const name = personalInfo?.name || 'Developer';
  const initials = getInitials(name);
  const email = personalInfo?.email || '';
  const phone = personalInfo?.phone || '';
  const location = personalInfo?.location || '';
  
  // Format details for the AI Chatbot to read
  const chatbotData = {
    name,
    skills,
    experience: experience.map(e => ({ company: e.company, role: e.title, duration: e.duration, details: e.description })),
    projects: projects.map(p => ({ title: p.title, description: p.description, tech: p.technologies })),
    education: education.map(e => ({ degree: e.degree, school: e.school, year: e.year })),
    contact: { email, phone, location }
  };

  const socialLinks = normalizeSocialLinks(personalInfo?.socialLinks);
  const githubUrl = socialLinks.find(l => l.platform === 'github')?.url || '';
  let githubUsername = '';
  if (githubUrl) {
    const parts = githubUrl.trim().replace(/\/$/, '').split('/');
    githubUsername = parts[parts.length - 1];
  }

  return `
  (function() {
    function init() {
      // 1. Sticky Navbar Listener
      const nav = document.getElementById('nav');
      if (nav) {
        window.addEventListener('scroll', () => {
          if (window.scrollY > 20) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
        });
      }

      // 2. Light/Dark Mode Theme Switcher
      const themeToggle = document.getElementById('theme-toggle');
      const sunIcon = document.getElementById('sun-icon');
      const moonIcon = document.getElementById('moon-icon');
      
      if (themeToggle && sunIcon && moonIcon) {
        // Check localStorage safely
        let savedTheme = 'dark';
        try {
          savedTheme = localStorage.getItem('theme') || 'dark';
        } catch (e) {
          console.warn("[Theme] localStorage read blocked inside sandbox:", e.message);
        }

        if (savedTheme === 'light') {
          document.body.classList.add('light');
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        }

        themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('light');
          const isLight = document.body.classList.contains('light');
          
          try {
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
          } catch (e) {
            console.warn("[Theme] localStorage write blocked inside sandbox:", e.message);
          }
          
          if (isLight) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
          } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
          }
          
          // Emit event to update contribution graph theme colorScheme if present
          if (window.updateGraphTheme) {
            window.updateGraphTheme(isLight ? 'light' : 'dark');
          }
        });
      }

    // 3. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // 4. Accordion Collapse/Expand Logic
    const triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const arrow = item.querySelector('.accordion-arrow');
        const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

        // Close all other accordions in the same section
        const section = item.closest('section');
        section.querySelectorAll('.accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            const otherContent = otherItem.querySelector('.accordion-content');
            const otherArrow = otherItem.querySelector('.accordion-arrow');
            otherContent.style.maxHeight = '0px';
            otherContent.classList.remove('mt-4');
            otherArrow.style.transform = 'rotate(0deg)';
          }
        });

        // Toggle current accordion
        if (isOpen) {
          content.style.maxHeight = '0px';
          content.classList.remove('mt-4');
          arrow.style.transform = 'rotate(0deg)';
        } else {
          content.classList.add('mt-4');
          content.style.maxHeight = content.scrollHeight + 'px';
          arrow.style.transform = 'rotate(180deg)';
        }
      });
    });

    // 5. Get in Touch Clipboard Copy & Text Feedback
    const btnEmail = document.getElementById('btn-email');
    const btnText = document.getElementById('btn-email-text');
    const developerEmail = "${email}";

    if (btnEmail && developerEmail) {
      btnEmail.addEventListener('click', (e) => {
        // Only trigger copy feedback if there's an email
        if (navigator.clipboard) {
          e.preventDefault();
          navigator.clipboard.writeText(developerEmail);
          btnText.textContent = "Email Copied!";
          btnEmail.style.borderColor = "#10b981";
          
          setTimeout(() => {
            btnText.textContent = "Get in touch";
            btnEmail.style.borderColor = "";
          }, 2000);
        }
      });
    }

    // 6. Conversational AI Chatbot Widget Logic
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatDialog = document.getElementById('chat-dialog');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Portfolio structured data loaded directly into the client
    const profile = ${JSON.stringify(chatbotData)};

    const toggleChat = () => {
      const isClosed = chatDialog.classList.contains('opacity-0');
      if (isClosed) {
        chatDialog.classList.remove('max-h-0', 'opacity-0', 'scale-95', 'translate-y-4');
        chatDialog.classList.add('max-h-[400px]', 'opacity-100', 'scale-100', 'translate-y-0');
      } else {
        chatDialog.classList.remove('max-h-[400px]', 'opacity-100', 'scale-100', 'translate-y-0');
        chatDialog.classList.add('max-h-0', 'opacity-0', 'scale-95', 'translate-y-4');
      }
    };

    if (chatToggle) chatToggle.addEventListener('click', toggleChat);
    if (chatClose) chatClose.addEventListener('click', toggleChat);



    const appendMessage = (text, isBot = false) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = "flex gap-2.5 " + (isBot ? "max-w-[85%]" : "max-w-[85%] ml-auto justify-end");
      
      const avatar = isBot 
        ? '<div class="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-cyan-400 border border-zinc-700">${initials}</div>' 
        : '';
        
      const bubblesClass = isBot 
        ? "bg-zinc-850 border border-zinc-850 text-zinc-300 rounded-2xl" 
        : "bg-zinc-100 text-zinc-950 rounded-2xl";

      msgDiv.innerHTML = \`
        \${avatar}
        <div class="p-3 \${bubblesClass}">
          \${text}
        </div>
      \`;
      
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Bind suggestion clicks on newly appended elements
      msgDiv.querySelectorAll('.chat-suggest').forEach(btn => {
        btn.addEventListener('click', () => {
          chatInput.value = btn.getAttribute('data-query');
          chatForm.dispatchEvent(new Event('submit'));
        });
      });
    };

    const processChatQuery = (rawQuery) => {
      const q = rawQuery.toLowerCase().trim();
      
      if (q.includes('skill') || q.includes('technology') || q.includes('stack') || q.includes('know')) {
        const list = profile.skills.map(s => \`• \${s}\`).join('<br>');
        return \`My primary technical stack details:<br><br>\${list}<br><br>I specialize in engineering full-stack solutions with modern visual systems.\`;
      }
      
      if (q.includes('project') || q.includes('work') || q.includes('built') || q.includes('portfolio')) {
        if (profile.projects.length === 0) return "I haven't featured any custom projects yet, but please feel free to check out my GitHub!";
        const list = profile.projects.map(p => \`<strong>\${p.title}</strong>: \${p.description}<br><span class="text-zinc-500 font-mono text-[10px]">Tech: \${p.tech.join(', ')}</span>\`).join('<br><br>');
        return \`Here are my featured custom applications:<br><br>\${list}\`;
      }

      if (q.includes('experience') || q.includes('job') || q.includes('career') || q.includes('history')) {
        if (profile.experience.length === 0) return "I'm currently seeking new full-time software engineering roles! Feel free to reach out to collaborate.";
        const list = profile.experience.map(e => \`<strong>\${e.company}</strong> — \${e.role}<br><span class="text-zinc-500 font-mono text-[10px]">\${e.duration}</span>\`).join('<br><br>');
        return \`My professional work timeline:<br><br>\${list}\`;
      }

      if (q.includes('education') || q.includes('study') || q.includes('college') || q.includes('degree')) {
        if (profile.education.length === 0) return "I am a self-taught engineer passionate about structural design and algorithm design.";
        const list = profile.education.map(edu => \`<strong>\${edu.degree}</strong> at \${edu.school} (\${edu.year})\`).join('<br><br>');
        return \`My educational timeline:<br><br>\${list}\`;
      }

      if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('phone')) {
        return \`You can easily reach out to me via:<br><br>• Email: \${profile.contact.email || 'N/A'}<br>• Phone: \${profile.contact.phone || 'N/A'}<br>• Location: \${profile.contact.location || 'N/A'}\`;
      }

      if (q.includes('resume') || q.includes('cv')) {
        return \`You can view/download my complete resume directly in the Hero section by clicking 'Resume / CV'. Let's collaborate!\`;
      }

      return "I'm sorry, I didn't quite catch that. Click one of the topics below or ask about: <strong>skills</strong>, <strong>projects</strong>, <strong>experience</strong>, <strong>education</strong>, or <strong>contact</strong>!";
    };

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = chatInput.value;
        if (!raw.trim()) return;
        
        // Append user message
        appendMessage(raw, false);
        chatInput.value = '';

        // Typing indicator delay
        setTimeout(() => {
          const reply = processChatQuery(raw);
          appendMessage(reply, true);
        }, 400);
      });
    }

    // Bind initial suggestion click buttons
    document.querySelectorAll('.chat-suggest').forEach(btn => {
      btn.addEventListener('click', () => {
        chatInput.value = btn.getAttribute('data-query');
        chatForm.dispatchEvent(new Event('submit'));
      });
    });

    // 7. GitHub Contribution Calendar Client Fetcher
    const calendarContainer = document.getElementById('github-calendar');
    const githubUser = "${githubUsername}";
    const githubUrl = "${githubUrl}";

    // Check if the parsed username is empty or is a domain placeholder
    const isInvalidUser = !githubUser || 
                          githubUser.toLowerCase() === 'github.com' || 
                          githubUser.toLowerCase() === 'www.github.com' || 
                          githubUser.toLowerCase() === 'github';

    if (calendarContainer) {
      if (isInvalidUser) {
        console.warn("[Client Calendar] Missing or invalid GitHub username. Rendering fallback.");
        renderFallbackMessage();
      } else {
        console.log("[Client Calendar] Triggering live fetch for user:", githubUser);
        fetch(\`https://github-contributions-api.jogruber.de/v4/\${githubUser}?y=last\`)
          .then(res => {
            if (!res.ok) {
              throw new Error(\`HTTP error! status: \${res.status}\`);
            }
            return res.json();
          })
          .then(data => {
            if (data && data.contributions && data.contributions.length > 0) {
              renderContributionCalendar(data.contributions, data.total.lastYear);
            } else {
              throw new Error("Invalid or empty contributions payload.");
            }
          })
          .catch(err => {
            console.warn("[Client Calendar] Fetch failed, rendering fallback:", err.message);
            renderFallbackMessage();
          });
      }
    }

    function renderFallbackMessage() {
      calendarContainer.innerHTML = \`
        <div class="flex flex-col items-center justify-center min-h-[110px] text-center p-4">
          <span class="text-zinc-500 font-mono text-xs mb-2">GitHub contributions currently unavailable</span>
          \${githubUrl ? \`
          <a href="\${githubUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-semibold text-zinc-300 hover:text-cyan-400 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300">
            View GitHub Profile 
            <svg class="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>\` : ''}
        </div>
      \`;
    }


    function renderContributionCalendar(contributions, totalCount) {
      calendarContainer.innerHTML = '';
      
      // Create SVG grid
      const svgNamespace = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNamespace, "svg");
      
      // Calculate sizes: 53 columns of 7 cells
      const blockSize = 11;
      const blockMargin = 3;
      const textHeight = 15;
      
      // We will render columns sequentially. Contributions array is chronologically sorted.
      // Group contributions by week
      const cols = [];
      let currentCol = [];
      
      // Contributions are normally 365 or 366 items
      contributions.forEach(day => {
        currentCol.push(day);
        if (currentCol.length === 7) {
          cols.push(currentCol);
          currentCol = [];
        }
      });
      if (currentCol.length > 0) {
        cols.push(currentCol);
      }

      const totalCols = cols.length;
      const width = totalCols * (blockSize + blockMargin) - blockMargin;
      const height = 7 * (blockSize + blockMargin) - blockMargin;
      
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      svg.style.overflow = "visible";
      
      // Color themes mapping
      const themes = {
        dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
        light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
      };

      let currentTheme = document.body.classList.contains('light') ? 'light' : 'dark';
      
      // Render columns
      cols.forEach((col, colIdx) => {
        const colG = document.createElementNS(svgNamespace, "g");
        colG.setAttribute("transform", \`translate(\${colIdx * (blockSize + blockMargin)}, 0)\`);
        
        col.forEach((day, dayIdx) => {
          if (!day) return;
          const rect = document.createElementNS(svgNamespace, "rect");
          rect.setAttribute("x", "0");
          rect.setAttribute("y", dayIdx * (blockSize + blockMargin));
          rect.setAttribute("width", blockSize);
          rect.setAttribute("height", blockSize);
          rect.setAttribute("rx", "2");
          rect.setAttribute("ry", "2");
          rect.setAttribute("fill", themes[currentTheme][day.level]);
          rect.setAttribute("data-date", day.date);
          rect.setAttribute("data-count", day.count);
          rect.style.cursor = "pointer";
          rect.style.transition = "transform 0.1s";
          rect.className = "calendar-cell";
          
          // Simple title tooltip
          const title = document.createElementNS(svgNamespace, "title");
          title.textContent = \`\${day.count} contributions on \${day.date}\`;
          rect.appendChild(title);
          
          colG.appendChild(rect);
        });
        svg.appendChild(colG);
      });

      calendarContainer.appendChild(svg);
      
      // Global hook to repaint graph on theme switch
      window.updateGraphTheme = (theme) => {
        currentTheme = theme;
        svg.querySelectorAll('.calendar-cell').forEach((rect, idx) => {
          const dayIdx = Math.floor(idx / 7);
          const blockIdx = idx % 7;
          if (cols[dayIdx] && cols[dayIdx][blockIdx]) {
            const level = cols[dayIdx][blockIdx].level;
            rect.setAttribute("fill", themes[theme][level]);
          }
        });
      };
    }

    function renderMockCalendar() {
      // Create empty mock calendar
      const mockContributions = [];
      const now = new Date();
      for (let i = 365; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const count = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
        const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4;
        mockContributions.push({
          date: date.toISOString().split('T')[0],
          count,
          level
        });
      }
      renderContributionCalendar(mockContributions, 120);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
  `;
};

module.exports = {
  compileHTML,
  compileCSS,
  compileJS
};
