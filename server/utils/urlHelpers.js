/**
 * URL Helpers — Shared URL normalization and processing functions
 */

/**
 * Helper to guarantee all external links start with an absolute protocol.
 * Standardizes common platforms (LinkedIn, GitHub) and adds https:// if missing.
 *
 * @param {string} url - Raw URL string
 * @returns {string} - Cleaned absolute URL
 */
const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim();
  
  // Standardize the URL by stripping any existing protocol/www temporarily
  let standardUrl = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/i, '');
  
  if (standardUrl.toLowerCase().startsWith('linkedin.com')) {
    let path = standardUrl.substring('linkedin.com'.length);
    if (path && !path.endsWith('/')) {
      path += '/';
    }
    return `https://www.linkedin.com${path}`;
  }
  
  if (standardUrl.toLowerCase().startsWith('github.com')) {
    let path = standardUrl.substring('github.com'.length);
    path = path.replace(/\/$/, '');
    return `https://www.github.com${path}`;
  }

  if (!/^https?:\/\//i.test(cleanUrl)) {
    if (cleanUrl.startsWith('//')) {
      return `https:${cleanUrl}`;
    }
    return `https://${cleanUrl}`;
  }
  return cleanUrl;
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
