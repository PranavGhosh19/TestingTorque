// Suppress harmless client abort errors (ECONNRESET, EPIPE) on Node 24 in Next.js dev server
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ETIMEDOUT')) {
    // Harmless client connection reset (e.g. browser reload or aborted request)
    return;
  }
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
