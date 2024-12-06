const Joi = require('joi');
const {
  DonationRequestPayloadSchema,
  DonationRequestStatusPayloadSchema,
  DonationRequestQuerySchema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const DonationRequestsValidator = {
  /**
   * Validasi payload untuk pembuatan permohonan donasi
   */
  validateDonationRequestPayload: (payload) => {
    const { error } = DonationRequestPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(`Payload tidak valid: ${error.message}`);
    }
  },

  /**
   * Validasi payload untuk pembaruan status permohonan donasi
   */
  validateDonationRequestStatusPayload: (payload) => {
    const { error } = DonationRequestStatusPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(`Payload tidak valid: ${error.message}`);
    }
  },

  /**
   * Validasi parameter path untuk permohonan donasi
   */
  validateDonationRequestParams: (params) => {
    const { error } = Joi.object({
      donationId: Joi.number().integer().positive().required(),
      requestId: Joi.number().integer().positive().required(),
    }).validate(params);
    if (error) {
      throw new InvariantError(`Params tidak valid: ${error.message}`);
    }
  },

  /**
   * Validasi query parameters untuk pencarian permohonan donasi
   */
  validateDonationRequestQuery: (query) => {
    const { error } = DonationRequestQuerySchema.validate(query);
    if (error) {
      throw new InvariantError(`Query tidak valid: ${error.message}`);
    }
  },
};

module.exports = DonationRequestsValidator;
