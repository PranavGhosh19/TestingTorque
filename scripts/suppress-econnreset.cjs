const IGNORED_CODES = new Set([
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'UND_ERR_SOCKET',
  'ERR_STREAM_PREMATURE_CLOSE',
  'ERR_HTTP_HEADERS_SENT',
  'ERR_SOCKET_CONNECTION_TIMEOUT'
]);

process.on('uncaughtException', (err) => {
  if (
    err &&
    (IGNORED_CODES.has(err.code) ||
      (typeof err.message === 'string' &&
        (err.message.includes('socket hang up') ||
          err.message.includes('aborted') ||
          err.message.includes('premature close'))))
  ) {
    return;
  }
  console.error('Dev Server Notice (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Dev Server Notice (Unhandled Rejection):', reason);
});
