/* eslint-disable camelcase */
const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersHandler {
  constructor(service, authenticationsService, tokenManager, validator) {
    this._service = service;
    this._authenticationsService = authenticationsService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validateUserPayload(request.payload);

      const { email, password, name, phone_number } = request.payload;

      // Periksa apakah email sudah digunakan
      await this._service.verifyNewEmail(email);

      // Tambahkan user
      const userId = await this._service.addUser({ email, password, name, phone_number });

      if (!Number.isInteger(userId)) {
        throw new InvariantError('Gagal mendapatkan user ID yang valid');
      }

      // Generate token
      const accessToken = this._tokenManager.generateAccessToken({ id: userId });
      const refreshToken = this._tokenManager.generateRefreshToken({ id: userId });

      // Simpan refresh token
      await this._authenticationsService.addRefreshToken(userId, refreshToken, accessToken);

      // Response
      return h.response({
        status: 'success',
        message: 'Registrasi berhasil',
        data: {
          accessToken,
          refreshToken,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof InvariantError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }


  async getProfileHandler(request, h) {
    try {
      // Ekstrak user_id dari token yang telah divalidasi
      const { id: userId } = request.auth.credentials;
      const authorization = request.headers.authorization;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return h.response({
          status: 'fail',
          message: 'Token tidak valid atau tidak disertakan',
        }).code(401);
      }

      const token = authorization.split(' ')[1];

      // Verifikasi apakah token masih aktif di database
      const isActive = await this._authenticationsService.isAccessTokenActive(token);

      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Dapatkan data pengguna berdasarkan userId
      const user = await this._service.getUserById(userId);

      return {
        status: 'success',
        data: {
          user,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(404);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }
}

module.exports = UsersHandler;
