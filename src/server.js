/* eslint-disable no-unused-vars */
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Pool } = require('pg'); // Tambahkan ini untuk koneksi database

// Import Plugin
const users = require('./api/users');
const authentications = require('./api/authentications');
const donations = require('./api/donations');
const donationRequests = require('./api/donationRequests');
const notifications = require('./api/notifications');

// Import Services
const UsersService = require('./services/UsersService');
const AuthenticationsService = require('./services/AuthenticationsService');
const DonationsService = require('./services/DonationsService');
const DonationRequestsService = require('./services/DonationRequestsService');
const NotificationsService = require('./services/NotificationsService');
const ClientError = require('./exceptions/ClientError');

// Import Token Manager dan Validator
const TokenManager = require('./tokenize/TokenManager');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const DonationsValidator = require('./validator/donations');
const DonationRequestsValidator = require('./validator/donationRequests');

// Konfigurasi Pool untuk PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const init = async () => {
  const usersService = new UsersService(pool);
  const authenticationsService = new AuthenticationsService(pool);
  const donationsService = new DonationsService(pool);
  const donationRequestsService = new DonationRequestsService(pool);
  const notificationsService = new NotificationsService(pool);

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Mendefinisikan strategi autentikasi JWT
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE || 3600, // 1 jam
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
          token: artifacts.token, // Tambahkan token ke credentials
        },
      };
    },
  });

  // Menerapkan autentikasi JWT secara default
  server.auth.default('jwt');

  // Registrasi plugin API internal
  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        authenticationsService: authenticationsService,
        tokenManager: TokenManager,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: donations,
      options: {
        service: donationsService,
        authenticationsService: authenticationsService,
        validator: DonationsValidator,
      },
    },
    {
      plugin: donationRequests,
      options: {
        service: donationRequestsService,
        donationsService,
        notificationsService,
        validator: DonationRequestsValidator,
      },
    },
    {
      plugin: notifications,
      options: {
        service: notificationsService,
      },
    },
  ]);

  // Penanganan error secara global
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Client Error
      if (response instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: response.message,
          })
          .code(response.statusCode);
      }

      // Server Error
      console.error(response);
      return h
        .response({
          status: 'error',
          message: 'Terjadi kesalahan pada server.',
        })
        .code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
