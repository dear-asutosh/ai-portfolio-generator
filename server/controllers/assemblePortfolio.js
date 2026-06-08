/**
 * assemblePortfolio — Final Asset Combiner & Preview Engine
 *
 * Responsibility:
 *   Takes the raw outputs from the 3-layer code generation pipeline and
 *   produces a clean, preview-ready full HTML document.
 *
 * Architecture decision:
 *   The three assets (html, customCss, js) are ALWAYS kept separate in the
 *   return value. The `fullPreviewHtml` is a assembled rendering document
 *   generated at request time. This separation future-proofs:
 *     - Downloadable ZIP export
 *     - Static hosting
 *     - Self-hosted builds
 *     - Future server-side Tailwind compilation
 *
 * Tailwind strategy:
 *   Tailwind CDN (JIT mode) is injected into the preview document only —
 *   not stored in the html asset. This keeps the html asset clean and
 *   architecture-agnostic. A future compile step can replace the CDN
 *   injection without touching the stored html.
 */

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Normalizes the AI-generated HTML body string.
 * The AI sometimes includes CDN tags inside the html string itself.
 * We strip those here so the assembler controls the document structure.
 *
 * @param {string} rawHtml - HTML string from Layer 1 (body content)
 * @returns {string} - Cleaned body content
 */
const normalizeHtml = (rawHtml) => {
  if (!rawHtml) return "";
  let html = rawHtml.trim();

  // If the AI wrapped the content in a full document, extract just the body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1].trim();
  }

  // Remove any <html>, <head>, </html> wrappers the AI may have included
  html = html
    .replace(/^\s*<!DOCTYPE[^>]*>/i, "")
    .replace(/^\s*<html[^>]*>/i, "")
    .replace(/<\/html>\s*$/i, "")
    .trim();

  return html;
};

/**
 * Builds the full preview HTML document from assembled parts.
 * This is the document that gets injected into the iframe srcDoc.
 *
 * CDN injection order:
 *   1. Google Fonts (referenced by customCss @import)
 *   2. FontAwesome (icons used in html)
 *   3. Tailwind CDN (JIT — scans document on load)
 *   4. Custom CSS (premium effects, keyframes, glassmorphism)
 *   5. Body HTML
 *   6. JS (deferred — runs after DOM is ready)
 *
 * @param {string} bodyHtml  - Normalized body content
 * @param {string} customCss - Premium CSS from Layer 2
 * @param {string} js        - Interactions JS from Layer 3
 * @returns {string} - Complete preview HTML document
 */
const buildPreviewDocument = (bodyHtml, customCss, js) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="/" target="_self" />
  <title>Portfolio Preview</title>

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

  <!-- Tailwind CSS CDN (JIT — scans and loads only used classes) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Tailwind config extension for custom values the AI may reference -->
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

  <!-- Premium Custom CSS (keyframes, glassmorphism, neon effects, etc.) -->
  <style>
    /* Base reset */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    /* Custom Sleek Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: #0a0a0c;
    }
    ::-webkit-scrollbar-thumb {
      background: #2a2a2e;
      border-radius: 9999px;
      border: 2px solid #0a0a0c;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3e3e44;
    }
    /* Firefox Support */
    * {
      scrollbar-width: thin;
      scrollbar-color: #2a2a2e #0a0a0c;
    }

    /* Custom CSS from AI Layer 2 */
    ${customCss || "/* No custom CSS provided */"}
  </style>
</head>
<body>

${bodyHtml}

<script>
  // Portfolio Interactions (from AI Layer 3)
  (function() {
    'use strict';
    ${js || "// No JS provided"}
  })();
</script>

</body>
</html>`;
};

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * assemblePortfolio — combines all pipeline outputs into the final portfolio.
 *
 * @param {Object} params
 * @param {string} params.html      - Raw HTML body from Layer 1
 * @param {string} params.customCss - Premium CSS from Layer 2
 * @param {string} params.js        - Vanilla JS from Layer 3
 *
 * @returns {{
 *   html: string,
 *   customCss: string,
 *   js: string,
 *   fullPreviewHtml: string,
 *   meta: { htmlChars: number, cssChars: number, jsChars: number, totalChars: number }
 * }}
 */
const assemblePortfolio = ({ html, customCss, js }) => {
  const t0 = Date.now();

  // Step 1: Normalize the AI-generated HTML
  const normalizedHtml = normalizeHtml(html);

  // Step 2: Sanitize CSS (strip any <style> tags the AI may have included)
  const cleanCss = (customCss || "")
    .replace(/<\/?style[^>]*>/gi, "")
    .trim();

  // Step 3: Sanitize JS (strip any <script> tags the AI may have included)
  const cleanJs = (js || "")
    .replace(/<\/?script[^>]*>/gi, "")
    .trim();

  // Step 4: Build the preview document
  const fullPreviewHtml = buildPreviewDocument(normalizedHtml, cleanCss, cleanJs);

  const ms = Date.now() - t0;
  console.log(
    `[Assembler] Portfolio assembled in ${ms}ms | ` +
    `HTML: ${normalizedHtml.length}c | CSS: ${cleanCss.length}c | JS: ${cleanJs.length}c | ` +
    `Preview doc: ${fullPreviewHtml.length}c`
  );

  return {
    html: normalizedHtml,
    customCss: cleanCss,
    js: cleanJs,
    fullPreviewHtml,
    meta: {
      htmlChars: normalizedHtml.length,
      cssChars: cleanCss.length,
      jsChars: cleanJs.length,
      totalChars: fullPreviewHtml.length,
      assembledInMs: ms,
    },
  };
};

/**
 * Assembles ONLY a single section's HTML into the full document.
 * Used by the section regeneration feature to splice updated section
 * HTML back into an existing full portfolio document.
 *
 * @param {string} fullHtml        - Existing full portfolio HTML (body content)
 * @param {string} sectionId       - The section id to replace (e.g. "hero", "skills")
 * @param {string} newSectionHtml  - The replacement HTML for that section
 * @returns {string} - Updated full HTML with the section replaced
 */
const spliceSectionHtml = (fullHtml, sectionId, newSectionHtml) => {
  if (!fullHtml || !sectionId || !newSectionHtml) return fullHtml;

  // Find the opening tag of the section with the target id
  // Handles: <section id="hero">, <div id="hero">, <header id="hero">, etc.
  const tagTypes = "section|div|header|footer|main|article|aside|nav";
  const openTagRegex = new RegExp(
    `(<(${tagTypes})[^>]*\\bid=["']?${sectionId}["']?[^>]*>)`,
    "i"
  );

  const match = openTagRegex.exec(fullHtml);
  if (match) {
    const openTag = match[1];
    const tagType = match[2];
    const startIndex = match.index;

    // Helper to find the matching closing tag index by tracking nesting levels
    const findClosingTagIndex = (html, type, searchStart) => {
      const regex = new RegExp(`<\/?${type}\\b[^>]*>`, "gi");
      regex.lastIndex = searchStart;
      let nestingLevel = 1;
      let m;
      while ((m = regex.exec(html)) !== null) {
        const tag = m[0];
        if (tag.startsWith("</") || tag.startsWith("</")) {
          nestingLevel--;
          if (nestingLevel === 0) {
            return {
              closeTagStart: m.index,
              closeTagEnd: regex.lastIndex,
              closeTag: tag,
            };
          }
        } else if (!tag.endsWith("/>")) {
          nestingLevel++;
        }
      }
      return null;
    };

    const closingResult = findClosingTagIndex(fullHtml, tagType, startIndex + openTag.length);
    if (closingResult) {
      const { closeTagStart, closeTagEnd, closeTag } = closingResult;
      
      // If the new section HTML already contains a root wrapper with the target id,
      // replace the entire matched block (opening wrapper to closing tag).
      // Otherwise, replace only the inner content to preserve the original wrapper tag + attributes.
      const hasOuterWrapper = new RegExp(`<\\w+[^>]*\\bid=["']?${sectionId}["']?[^>]*>`, "i").test(newSectionHtml);
      
      if (hasOuterWrapper) {
        return (
          fullHtml.substring(0, startIndex) +
          newSectionHtml +
          fullHtml.substring(closeTagEnd)
        );
      } else {
        return (
          fullHtml.substring(0, startIndex) +
          openTag +
          "\n" +
          newSectionHtml +
          "\n" +
          closeTag +
          fullHtml.substring(closeTagEnd)
        );
      }
    }
  }

  // Fallback: if pattern or matching tag doesn't match, append to end (fail-safe)
  console.warn(`[Assembler] Section id="${sectionId}" not found in HTML — appending instead.`);
  return fullHtml + "\n" + newSectionHtml;
};

module.exports = {
  assemblePortfolio,
  spliceSectionHtml,
};
