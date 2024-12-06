
const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Login handler
   */
  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);
    const { email, password } = request.payload;

    const userId = await this._usersService.verifyUserCredential(email, password);

    // Hapus token lama
    await this._authenticationsService.deleteRefreshTokenByUserId(userId);

    // Generate token baru
    const accessToken = this._tokenManager.generateAccessToken({ id: userId });
    const refreshToken = this._tokenManager.generateRefreshToken({ id: userId });

    // Simpan refresh token
    await this._authenticationsService.addRefreshToken(userId, refreshToken, accessToken);

    return h.response({
      status: 'success',
      message: 'Login berhasil',
      data: {
        accessToken,
        refreshToken,
      },
    }).code(201);
  }

  /**
 * Refresh token handler
 */
  async putAuthenticationHandler(request, h) {
    // Validasi payload
    this._validator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;

    try {
      // Verifikasi refresh token
      await this._authenticationsService.verifyRefreshToken(refreshToken);

      // Periksa apakah refresh token masih aktif
      const isActive = await this._authenticationsService.isRefreshTokenActive(refreshToken);

      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Refresh token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Generate access token baru
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
      const accessToken = this._tokenManager.generateAccessToken({ id });

      return {
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      console.error('Error verifying refresh token:', error);
      return h.response({
        status: 'fail',
        message: 'Refresh token tidak valid',
      }).code(401);
    }
  }


  /**
   * Logout handler
   */
  async deleteAuthenticationHandler(request, h) {
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return h.response({
        status: 'fail',
        message: 'Token tidak valid atau tidak disertakan',
      }).code(401);
    }

    const token = authorization.split(' ')[1];

    try {
      const { id: userId } = this._tokenManager.verifyAccessToken(token);

      // Verifikasi apakah token masih aktif
      const isActive = await this._authenticationsService.isAccessTokenActive(token);

      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Hapus semua token user
      await this._authenticationsService.deleteRefreshTokenByUserId(userId);

      return {
        status: 'success',
        message: 'Logout berhasil',
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return h.response({
        status: 'fail',
        message: 'Token tidak valid',
      }).code(401);
    }
  }
}

module.exports = AuthenticationsHandler;
