const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, authenticationsService, tokenManager, validator }) => {
    const usersHandler = new UsersHandler(
      service, // UsersService
      authenticationsService, // AuthenticationsService
      tokenManager, // TokenManager instance
      validator // UsersValidator
    );
    server.route(routes(usersHandler));
  },
};
