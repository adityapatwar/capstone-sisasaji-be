const {
  DonationPayloadSchema,
  DonationIdSchema,
  DonationQuerySchema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const DonationsValidator = {
  validateDonationPayload: (payload) => {
    const { error } = DonationPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(`Payload tidak valid: ${error.message}`);
    }
  },

  validateDonationId: (params) => {
    const { error } = DonationIdSchema.validate(params);
    if (error) {
      throw new InvariantError(`ID tidak valid: ${error.message}`);
    }
  },

  validateDonationQuery: (query) => {
    const { error } = DonationQuerySchema.validate(query);
    if (error) {
      throw new InvariantError(`Query tidak valid: ${error.message}`);
    }
  },
};

module.exports = DonationsValidator;
