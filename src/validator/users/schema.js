/* eslint-disable camelcase */
const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Format email tidak valid.',
    'any.required': 'Email wajib diisi.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password harus memiliki panjang minimal 6 karakter.',
    'any.required': 'Password wajib diisi.',
  }),
  name: Joi.string().required().messages({
    'any.required': 'Nama wajib diisi.',
  }),
  phone_number: Joi.string().pattern(/^[0-9]+$/).optional().messages({
    'string.pattern.base': 'Nomor telepon hanya boleh berisi angka.',
  }),
});

module.exports = { UserPayloadSchema };
