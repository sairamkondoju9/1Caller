import { lazy } from 'react';

/**
 * Robust lazy loading wrapper with automatic reload on stale chunk fetch failure.
 * When Vite/Rollup rebuilds with new chunk hashes, existing clients may attempt to fetch
 * an old hashed chunk that no longer exists on the server.
 * lazyRetry catches this and triggers an immediate, seamless refresh so the user gets
 * the latest assets without crashing.
 */
export function lazyRetry(componentImport, chunkKey = 'view') {
  return lazy(async () => {
    const sessionKey = `outpero_chunk_retry_${chunkKey}`;
    const hasRetried = window.sessionStorage.getItem(sessionKey);

    try {
      const module = await componentImport();
      // On successful load, clear retry flag
      window.sessionStorage.removeItem(sessionKey);
      return module;
    } catch (error) {
      const errorMessage = error?.message || '';
      const isDynamicImportError =
        errorMessage.includes('dynamically imported module') ||
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Load chunk failed') ||
        errorMessage.includes('error loading dynamically imported module');

      if (isDynamicImportError && !hasRetried) {
        console.warn(`[Outpero Asset Sync] Stale chunk detected for ${chunkKey}. Refreshing with latest assets...`);
        window.sessionStorage.setItem(sessionKey, 'true');
        // Cache-busting refresh
        window.location.reload();
        return new Promise(() => {}); // Hold until reload
      }

      console.error(`[Outpero LazyLoad Error] Chunk ${chunkKey} failed to load:`, error);
      throw error;
    }
  });
}
