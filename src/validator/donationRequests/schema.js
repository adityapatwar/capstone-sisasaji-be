const Joi = require('joi');

/**
 * Schema untuk payload pembuatan permohonan donasi
 */
const DonationRequestPayloadSchema = Joi.object({
  reason: Joi.string().required(),
});

/**
 * Schema untuk payload pembaruan status permohonan donasi
 */
const DonationRequestStatusPayloadSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
});

/**
 * Schema untuk query parameters (jika diperlukan)
 */
const DonationRequestQuerySchema = Joi.object({
  donationId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('pending', 'accepted', 'rejected').optional(),
});

module.exports = {
  DonationRequestPayloadSchema,
  DonationRequestStatusPayloadSchema,
  DonationRequestQuerySchema,
};
