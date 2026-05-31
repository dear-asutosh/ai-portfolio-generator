const { fetchGitHubData, fetchLeetCodeData } = require("../services/developerDataService");
const { compileHTML, compileCSS, compileJS } = require("../services/profilioV1Compiler");
const { ensureAbsoluteUrl, normalizeSocialLinks } = require("../utils/urlHelpers");

// Helper to extract platform username from social link URL
const extractPlatformUsername = (socialLinks = [], platform) => {
  if (!Array.isArray(socialLinks)) return '';
  const linkObj = socialLinks.find(l => l && typeof l.platform === 'string' && l.platform.toLowerCase() === platform.toLowerCase());
  if (!linkObj || !linkObj.url) return '';
  
  // Strip trailing slashes and split by path
  const cleanLink = linkObj.url.trim().replace(/\/$/, '');
  const parts = cleanLink.split('/');
  return parts[parts.length - 1] || '';
};

// ─── Pipeline Orchestrator ──────────────────────────────────────────────────

/**
 * Runs the deterministic compiler for Profilio Design System V1.
 * Fetches external stats in parallel, compiles instantly, and bypasses LLM calls.
 *
 * @param {Object} blueprint - PortfolioBlueprint JSON
 * @param {Object} userData  - Normalized user profile
 * @returns {Promise<{html: string, css: string, js: string}>}
 */
const runCodeGenPipeline = async (blueprint, userData) => {
  console.log(`[Profilio Orchestration] 🚀 Programmatically compiling Profilio Design System V1`);
  const pipelineStart = Date.now();

  const rawSocialLinks = userData?.personalInfo?.socialLinks || [];
  const socialLinks = normalizeSocialLinks(rawSocialLinks);
  
  // Extract usernames for live API fetching
  const githubUser = extractPlatformUsername(socialLinks, 'github');
  const leetcodeUser = extractPlatformUsername(socialLinks, 'leetcode');

  console.log(`[Developer Integrations] Parsed usernames - GitHub: '${githubUser}', LeetCode: '${leetcodeUser}'`);

  // Fetch stats in parallel
  let githubData = { repos: [], profile: null };
  let leetcodeData = null;

  try {
    const [gh, lc] = await Promise.all([
      fetchGitHubData(githubUser),
      fetchLeetCodeData(leetcodeUser)
    ]);
    githubData = gh;
    leetcodeData = lc;
    console.log(`[Developer Integrations] ✓ Live stats fetched successfully.`);
  } catch (apiErr) {
    console.warn(`[Developer Integrations] ⚠ Fetch failed (falling back to mock data):`, apiErr.message);
  }

  // Programmatically compile portfolio assets
  const html = compileHTML(userData, githubData, leetcodeData);
  const css = compileCSS();
  const js = compileJS(userData);

  const totalTime = Date.now() - pipelineStart;
  console.log(`[Profilio Orchestration] ✅ Compiled instantly in ${totalTime}ms! | HTML: ${html.length}c | CSS: ${css.length}c | JS: ${js.length}c`);

  return { html, css, js };
};

module.exports = {
  runCodeGenPipeline,
};
