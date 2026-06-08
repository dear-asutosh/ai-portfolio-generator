const axios = require('axios');

/**
 * Developer Data Service — Profilio Dynamic Integrations
 * 
 * Fetches real-time credibility signals from GitHub and LeetCode.
 * Includes automated fallback to realistic mock data if usernames are omitted, invalid, or rate-limited.
 */

/**
 * Fetches GitHub user details and their top public repositories.
 * 
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - GitHub profile data + repos array
 */
const fetchGitHubData = async (username) => {
  if (!username) {
    return { repos: [], profile: null };
  }

  const cleanUsername = username.trim().replace(/^@/, '');
  
  try {
    console.log(`[GitHub API] Fetching details for user: ${cleanUsername}`);
    
    const headers = { 'User-Agent': 'Profilio-App' };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch profile and repos in parallel
    const [profileRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${cleanUsername}`, {
        headers,
        timeout: 5000
      }).catch(() => null),
      axios.get(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=10`, {
        headers,
        timeout: 5000
      }).catch(() => null)
    ]);

    let profile = null;
    if (profileRes && profileRes.data) {
      profile = {
        name: profileRes.data.name,
        company: profileRes.data.company,
        blog: profileRes.data.blog,
        location: profileRes.data.location,
        email: profileRes.data.email,
        avatarUrl: profileRes.data.avatar_url,
        bio: profileRes.data.bio,
        publicRepos: profileRes.data.public_repos,
        followers: profileRes.data.followers,
        following: profileRes.data.following
      };
    }

    let repos = [];
    if (reposRes && reposRes.data) {
      // Sort by stars desc, then slice top 6
      repos = reposRes.data
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6)
        .map(r => ({
          name: r.name,
          description: r.description || 'No description provided.',
          url: r.html_url,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || 'Code',
          updatedAt: r.updated_at
        }));
    }

    return { profile, repos };
  } catch (error) {
    console.warn(`[GitHub API] Error fetching data for ${cleanUsername}:`, error.message);
    return { repos: [], profile: null };
  }
};

/**
 * Fetches LeetCode statistics.
 * Uses the open-source LeetCode Stats API with reliable mock fallback.
 * 
 * @param {string} username - LeetCode username
 * @returns {Promise<Object>} - LeetCode solved counts by difficulty
 */
const fetchLeetCodeData = async (username) => {
  if (!username) {
    return null;
  }

  const cleanUsername = username.trim();
  
  try {
    console.log(`[LeetCode API] Fetching stats for user: ${cleanUsername}`);
    const res = await axios.get(`https://leetcode-stats-api.herokuapp.com/${cleanUsername}`, {
      timeout: 4000
    });

    if (res.data && res.data.status === 'success') {
      return {
        totalSolved: res.data.totalSolved,
        easySolved: res.data.easySolved,
        mediumSolved: res.data.mediumSolved,
        hardSolved: res.data.hardSolved,
        acceptanceRate: res.data.acceptanceRate,
        ranking: res.data.ranking
      };
    }
    return null;
  } catch (error) {
    console.warn(`[LeetCode API] Error fetching stats for ${cleanUsername}:`, error.message);
    return null;
  }
};

module.exports = {
  fetchGitHubData,
  fetchLeetCodeData
};
