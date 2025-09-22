const http = require('http');
const url = require('url');
const { getClient, getCSS } = require('./responses');
const {
  handleSuccess,
  handleBadRequest,
  handleUnauthorized,
  handleForbidden,
  handleInternal,
  handleNotImplemented,
  handleNotFound,
} = require('./responses');

const PORT = process.env.PORT || 3000;

const onRequest = (request, response) => {
  const parsed = url.parse(request.url, true);
  const { pathname, query } = parsed;

  if (request.method !== 'GET') {
    response.writeHead(405, { 'Content-Type': 'application/json' });
    response.end(
      JSON.stringify({ message: 'Method Not Allowed', id: 'methodNotAllowed' }),
    );
    return;
  }

  if (pathname === '/') {
    getClient(request, response);
    return;
  }
  if (pathname === '/style.css') {
    getCSS(request, response);
    return;
  }

  switch (pathname) {
    case '/success':
      handleSuccess(request, response);
      return;
    case '/badRequest':
      handleBadRequest(request, response, query);
      return;
    case '/unauthorized':
      handleUnauthorized(request, response, query);
      return;
    case '/forbidden':
      handleForbidden(request, response);
      return;
    case '/internal':
      handleInternal(request, response);
      return;
    case '/notImplemented':
      handleNotImplemented(request, response);
      return;
    default:
      handleNotFound(request, response);
  }
};

http.createServer(onRequest).listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
