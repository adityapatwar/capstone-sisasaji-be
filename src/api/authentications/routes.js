const routes = (handler) => [
  {
    method: 'POST',
    path: '/login',
    handler: handler.postAuthenticationHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/token',
    handler: handler.putAuthenticationHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'DELETE',
    path: '/logout',
    handler: handler.deleteAuthenticationHandler,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = routes;