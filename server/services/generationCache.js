/**
 * Generation Cache — In-Memory LRU Cache with TTL
 *
 * Caches the full output of the portfolio generation pipeline
 * keyed on a hash of: userData + templateId + blueprint fingerprint.
 *
 * Why in-memory (not Redis):
 *   - Free-tier Vercel: no persistent Redis available
 *   - Current scale: single-instance Node.js, Map is perfectly adequate
 *   - Redis migration path: swap the Map implementation for a Redis client
 *     — the public API (get/set/del/clear) stays identical
 *
 * Cache key strategy:
 *   key = sha256(JSON.stringify(userData) + templateId)
 *   This means: same user profile + same template = cache hit
 *   Blueprint tweaks (which are derived from userData) are naturally included
 *
 * Eviction:
 *   - TTL-based: entries expire after MAX_AGE_MS (default 30 minutes)
 *   - Capacity-based: when MAX_ENTRIES is reached, oldest entry is evicted (LRU)
 */

const crypto = require("crypto");

// ─── Configuration ────────────────────────────────────────────────────────────

const MAX_ENTRIES = 50;         // Max cached generations
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes TTL

// ─── Internal State ───────────────────────────────────────────────────────────

/** @type {Map<string, { value: Object, createdAt: number, hitCount: number }>} */
const cache = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a deterministic cache key from userData.
 * Uses sha256 to keep the key short regardless of userData size.
 *
 * @param {Object} userData   - Normalized user profile
 * @returns {string} - 64-char hex hash
 */
const buildCacheKey = (userData) => {
  const payload = JSON.stringify({
    userData,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
};

/**
 * Removes the oldest cache entry (FIFO approximation for LRU).
 * Map iteration order = insertion order in V8.
 */
const evictOldest = () => {
  const firstKey = cache.keys().next().value;
  if (firstKey) {
    cache.delete(firstKey);
    console.log(`[Cache] Evicted oldest entry (capacity: ${MAX_ENTRIES} reached).`);
  }
};

/**
 * Removes all entries that have exceeded MAX_AGE_MS.
 * Called on every set() to prevent stale accumulation.
 */
const sweepExpired = () => {
  const now = Date.now();
  let swept = 0;
  for (const [key, entry] of cache.entries()) {
    if (now - entry.createdAt > MAX_AGE_MS) {
      cache.delete(key);
      swept++;
    }
  }
  if (swept > 0) {
    console.log(`[Cache] Swept ${swept} expired entries.`);
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Looks up a cached portfolio generation result.
 *
 * @param {string} key - Cache key from buildCacheKey()
 * @returns {{ hit: true, value: Object } | { hit: false }}
 */
const cacheGet = (key) => {
  const entry = cache.get(key);
  if (!entry) return { hit: false };

  // Check TTL
  if (Date.now() - entry.createdAt > MAX_AGE_MS) {
    cache.delete(key);
    console.log(`[Cache] MISS (expired): ${key.slice(0, 16)}...`);
    return { hit: false };
  }

  entry.hitCount++;
  console.log(`[Cache] HIT: ${key.slice(0, 16)}... (hits: ${entry.hitCount}, age: ${Math.round((Date.now() - entry.createdAt) / 1000)}s)`);
  return { hit: true, value: entry.value };
};

/**
 * Stores a portfolio generation result in the cache.
 *
 * @param {string} key   - Cache key from buildCacheKey()
 * @param {Object} value - The assembled portfolio object to cache
 */
const cacheSet = (key, value) => {
  // Sweep expired entries before adding a new one
  sweepExpired();

  // Evict oldest if at capacity
  if (cache.size >= MAX_ENTRIES) {
    evictOldest();
  }

  cache.set(key, {
    value,
    createdAt: Date.now(),
    hitCount: 0,
  });

  console.log(`[Cache] SET: ${key.slice(0, 16)}... (size: ${cache.size}/${MAX_ENTRIES})`);
};

/**
 * Deletes a specific entry from the cache.
 * Call this after a section regeneration so the next full generation
 * isn't served stale.
 *
 * @param {string} key - Cache key to invalidate
 */
const cacheDelete = (key) => {
  const deleted = cache.delete(key);
  if (deleted) {
    console.log(`[Cache] INVALIDATED: ${key.slice(0, 16)}...`);
  }
};

module.exports = {
  buildCacheKey,
  cacheGet,
  cacheSet,
  cacheDelete,
};
