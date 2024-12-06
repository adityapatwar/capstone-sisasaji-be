/* eslint-disable no-unused-vars */
const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  /**
   * Generate access token
   * @param {Object} payload - Data yang akan dimasukkan ke dalam token
   * @returns {String} - Access token yang dihasilkan
   */
  generateAccessToken: (payload) => {
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY, {
      ttlSec: parseInt(process.env.ACCESS_TOKEN_AGE, 10) || 3600, // Default 1 jam
    });
  },

  /**
   * Generate refresh token
   * @param {Object} payload - Data yang akan dimasukkan ke dalam token
   * @returns {String} - Refresh token yang dihasilkan
   */
  generateRefreshToken: (payload) => {
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY, {
      ttlSec: 7 * 24 * 60 * 60, // Default 7 hari
    });
  },

  /**
   * Verify access token
   * @param {String} token - Access token yang akan diverifikasi
   * @returns {Object} - Payload yang terdapat dalam token
   */
  verifyAccessToken: (token) => {
    try {
      const artifacts = Jwt.token.decode(token);
      Jwt.token.verify(artifacts, process.env.ACCESS_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Access token tidak valid');
    }
  },

  /**
   * Verify refresh token
   * @param {String} token - Refresh token yang akan diverifikasi
   * @returns {Object} - Payload yang terdapat dalam token
   */
  verifyRefreshToken: (token) => {
    try {
      const artifacts = Jwt.token.decode(token);
      Jwt.token.verify(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
