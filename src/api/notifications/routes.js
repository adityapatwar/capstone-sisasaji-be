const routes = (handler) => [
  {
    method: 'GET',
    path: '/notifications',
    handler: handler.getNotificationsHandler,
    options: {
      auth: 'jwt',
    },
  },
  {
    method: 'PUT',
    path: '/notifications/{id}',
    handler: handler.markNotificationAsReadHandler,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = routes;