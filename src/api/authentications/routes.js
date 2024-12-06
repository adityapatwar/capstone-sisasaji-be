const routes = (handler) => [
  {
    method: 'POST',
    path: '/login',
    handler: handler.postAuthenticationHandler,
    options: {
      auth: false, // Tidak memerlukan autentikasi
    },
  },
  {
    method: 'PUT',
    path: '/token',
    handler: handler.putAuthenticationHandler,
    options: {
      auth: false, // Tidak memerlukan autentikasi
    },
  },
  {
    method: 'DELETE',
    path: '/logout',
    handler: handler.deleteAuthenticationHandler,
    options: {
      auth: 'jwt', // Memerlukan autentikasi
    },
  },
];

module.exports = routes;