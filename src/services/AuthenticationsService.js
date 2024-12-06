const InvariantError = require('../exceptions/InvariantError');

class AuthenticationsService {
  constructor(pool) {
    this._pool = pool;
  }


  /**
 * Menambahkan refresh token dan access token untuk user
 * @param {Number} userId - ID pengguna
 * @param {String} refreshToken - Token refresh
 * @param {String} accessToken - Token akses
 */
  async addRefreshToken(userId, refreshToken, accessToken) {
    // Validasi bahwa userId adalah angka positif
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new InvariantError('User ID harus berupa angka positif dan tidak boleh kosong');
    }

    // Validasi bahwa refreshToken dan accessToken tidak kosong
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
      throw new InvariantError('Refresh token tidak boleh kosong atau null');
    }

    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      throw new InvariantError('Access token tidak boleh kosong atau null');
    }

    const query = {
      text: 'INSERT INTO tokens (user_id, refresh_token, access_token) VALUES($1, $2, $3)',
      values: [userId, refreshToken.trim(), accessToken.trim()],
    };

    await this._pool.query(query);
  }


  /**
   * Memverifikasi refresh token
   * @param {String} token - Refresh token yang akan diverifikasi
   */
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT id FROM tokens WHERE refresh_token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /**
   * Menghapus refresh token
   * @param {String} token - Refresh token yang akan dihapus
   */
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM tokens WHERE refresh_token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }

  /**
   * Menghapus semua token untuk user tertentu
   * @param {String} userId - ID pengguna
   */
  async deleteRefreshTokenByUserId(userId) {
    const query = {
      text: 'DELETE FROM tokens WHERE user_id = $1',
      values: [userId],
    };

    await this._pool.query(query);
  }

  /**
   * Mengecek apakah refresh token ada di database
   * @param {String} token - Refresh token yang akan dicek
   * @returns {Boolean}
   */
  async isRefreshTokenActive(token) {
    const query = {
      text: 'SELECT id FROM tokens WHERE refresh_token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    return result.rows.length > 0;
  }

  /**
   * Mengecek apakah access token masih aktif
   * @param {String} accessToken - Access token yang akan dicek
   * @returns {Boolean}
   */
  async isAccessTokenActive(accessToken) {
    const query = {
      text: 'SELECT id FROM tokens WHERE access_token = $1',
      values: [accessToken],
    };

    const result = await this._pool.query(query);

    return result.rows.length > 0;
  }
}

module.exports = AuthenticationsService;
