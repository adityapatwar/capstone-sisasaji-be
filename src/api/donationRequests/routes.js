const Joi = require('joi');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/donations/{id}/requests',
    handler: handler.postDonationRequestHandler,
    options: {
      auth: 'jwt',
      description: 'Mengajukan permohonan donasi baru',
      tags: ['api', 'donationRequests'],
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
        payload: Joi.object({
          reason: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: '/donations/{id}/requests',
    handler: handler.getDonationRequestsHandler,
    options: {
      auth: 'jwt',
      description: 'Mendapatkan semua permohonan donasi berdasarkan ID donasi',
      tags: ['api', 'donationRequests'],
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
      },
    },
  },
  {
    method: 'PUT',
    path: '/donations/{donationId}/requests/{requestId}',
    handler: handler.putDonationRequestHandler,
    options: {
      auth: 'jwt',
      description: 'Memperbarui status permohonan donasi berdasarkan ID permohonan',
      tags: ['api', 'donationRequests'],
      validate: {
        params: Joi.object({
          donationId: Joi.number().integer().positive().required(),
          requestId: Joi.number().integer().positive().required(),
        }),
        payload: Joi.object({
          status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: '/donationRequests/{requestId}',
    handler: handler.getDonationRequestDetailHandler,
    options: {
      auth: 'jwt',
      description: 'Mendapatkan detail permohonan donasi berdasarkan ID permohonan',
      tags: ['api', 'donationRequests'],
      validate: {
        params: Joi.object({
          requestId: Joi.number().integer().positive().required(),
        }),
      },
    },
  },
];

module.exports = routes;
