const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    handler: handler.postUserHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/profile',
    handler: handler.getProfileHandler,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = routes;
