/* eslint-disable camelcase */
const Joi = require('joi');

const DonationPayloadSchema = Joi.object({
  title: Joi.string().max(150).required(),
  description: Joi.string().required(),
  category_id: Joi.number().integer().positive().required(),
  image_url: Joi.string().uri().optional(),
});

const DonationIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const DonationQuerySchema = Joi.object({
  category_id: Joi.number().integer().positive().optional(),
  verifyowner: Joi.boolean().optional(),
});

module.exports = {
  DonationPayloadSchema,
  DonationIdSchema,
  DonationQuerySchema,
};
