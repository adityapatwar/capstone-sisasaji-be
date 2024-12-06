const { UserPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const { error } = UserPayloadSchema.validate(payload, { abortEarly: false });

    if (error) {
      // Ambil semua pesan error dari validasi Joi
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      throw new InvariantError(`Validasi gagal: ${errorMessage}`);
    }
  },
};

module.exports = UsersValidator;
