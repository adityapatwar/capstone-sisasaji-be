const {
  DonationPayloadSchema,
  DonationIdSchema,
  DonationQuerySchema,
} = require('../../validator/donations/schema');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/donations',
    handler: handler.postDonationHandler,
    options: {
      auth: 'jwt',
      description: 'Menambahkan donasi baru',
      tags: ['api', 'donations'],
      validate: {
        payload: DonationPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/donations',
    handler: handler.getDonationsHandler,
    options: {
      auth: 'jwt',
      description: 'Mendapatkan semua donasi, dengan optional filter category_id dan verifyowner',
      tags: ['api', 'donations'],
      validate: {
        query: DonationQuerySchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/donations/{id}',
    handler: handler.getDonationByIdHandler,
    options: {
      auth: 'jwt',
      description: 'Mendapatkan donasi berdasarkan ID',
      tags: ['api', 'donations'],
      validate: {
        params: DonationIdSchema,
      },
    },
  },
  {
    method: 'PUT',
    path: '/donations/{id}',
    handler: handler.putDonationByIdHandler,
    options: {
      auth: 'jwt',
      description: 'Memperbarui donasi berdasarkan ID',
      tags: ['api', 'donations'],
      validate: {
        params: DonationIdSchema,
        payload: DonationPayloadSchema,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/donations/{id}',
    handler: handler.deleteDonationByIdHandler,
    options: {
      auth: 'jwt',
      description: 'Menghapus donasi berdasarkan ID',
      tags: ['api', 'donations'],
      validate: {
        params: DonationIdSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/donations/category/list',
    handler: handler.getDonationCategoriesHandler,
    options: {
      auth: 'jwt',
      description: 'Mendapatkan daftar kategori donasi',
      tags: ['api', 'donations', 'categories'],
    },
  },
];

module.exports = routes;
