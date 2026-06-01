/**
 * URL Helpers — Shared URL normalization and processing functions
 */

/**
 * Helper to guarantee all external links start with an absolute protocol.
 * Only adds https:// if missing. Does NOT modify domains, paths, or
 * any other part of the URL — preserves the original extracted URL exactly.
 *
 * @param {string} url - Raw URL string
 * @returns {string} - URL with protocol prefix guaranteed
 */
const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  const cleanUrl = url.trim();

  // Already has a full protocol — return the original URL untouched
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  // Protocol-relative URL (e.g. //github.com/user)
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }

  // No protocol at all — just prepend https://
  return `https://${cleanUrl}`;
};

/**
 * Highly robust helper to normalize social links of any structure (arrays, objects, strings, various keys).
 *
 * @param {Array|Object|string} socialLinks - Social links input in raw format
 * @returns {Array<{platform: string, url: string}>} - Normalized array of social link objects
 */
const normalizeSocialLinks = (socialLinks) => {
  const normalized = [];
  if (!socialLinks) return normalized;

  // Case 1: Plain object mapping (e.g. { github: "url", linkedin: "url" })
  if (typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
    for (const [key, value] of Object.entries(socialLinks)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        normalized.push({ platform: key.toLowerCase(), url: ensureAbsoluteUrl(value) });
      }
    }
    return normalized;
  }

  // Case 2: Array of links
  if (Array.isArray(socialLinks)) {
    socialLinks.forEach(item => {
      if (!item) return;

      // 2a. String URL (e.g. "github.com/dear-asutosh")
      if (typeof item === 'string') {
        const url = item.trim();
        if (url.includes('github.com')) {
          normalized.push({ platform: 'github', url: ensureAbsoluteUrl(url) });
        } else if (url.includes('linkedin.com')) {
          normalized.push({ platform: 'linkedin', url: ensureAbsoluteUrl(url) });
        } else if (url.includes('leetcode.com')) {
          normalized.push({ platform: 'leetcode', url: ensureAbsoluteUrl(url) });
        } else if (url.includes('instagram.com')) {
          normalized.push({ platform: 'instagram', url: ensureAbsoluteUrl(url) });
        }
      } 
      // 2b. Struct object (e.g. { platform: "github", url: "..." } or { name: "github", link: "..." })
      else if (typeof item === 'object') {
        let platform = (item.platform || item.name || item.label || item.type || '').toString().toLowerCase();
        let url = (item.url || item.link || item.href || '').toString().trim();
        
        // Robust fallback: if standard keys are missing, check if any key matches a platform directly
        if (url.length === 0) {
          for (const [key, val] of Object.entries(item)) {
            if (['github', 'linkedin', 'leetcode', 'instagram'].includes(key.toLowerCase()) && typeof val === 'string' && val.trim().length > 0) {
              platform = key.toLowerCase();
              url = val.trim();
              break;
            }
          }
        }
        
        if (url.length > 0) {
          const absUrl = ensureAbsoluteUrl(url);
          if (platform && ['github', 'linkedin', 'leetcode', 'instagram'].includes(platform)) {
            normalized.push({ platform, url: absUrl });
          } else {
            // infer platform from URL domain
            if (url.includes('github.com')) {
              normalized.push({ platform: 'github', url: absUrl });
            } else if (url.includes('linkedin.com')) {
              normalized.push({ platform: 'linkedin', url: absUrl });
            } else if (url.includes('leetcode.com')) {
              normalized.push({ platform: 'leetcode', url: absUrl });
            } else if (url.includes('instagram.com')) {
              normalized.push({ platform: 'instagram', url: absUrl });
            }
          }
        }
      }
    });
  }

  return normalized;
};

module.exports = {
  ensureAbsoluteUrl,
  normalizeSocialLinks,
};
