/* eslint-disable camelcase */
const bcrypt = require('bcryptjs');
const InvariantError = require('../exceptions/InvariantError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const NotFoundError = require('../exceptions/NotFoundError');

class UsersService {
  constructor(pool) {
    this._pool = pool;
  }


  /**
   * Menambahkan pengguna baru
   * @param {Object} param0
   * @returns {String} userId
   */
  async addUser({ email, password, name, phone_number = null }) {
    // Verifikasi apakah email sudah terdaftar
    await this.verifyNewEmail(email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mulai transaksi
    const client = await this._pool.connect();

    try {
      await client.query('BEGIN');

      // Menyimpan data ke tabel users
      const insertUserQuery = {
        text: `
          INSERT INTO users (email, password)
          VALUES ($1, $2)
          RETURNING id
        `,
        values: [email, hashedPassword],
      };
      const resUser = await client.query(insertUserQuery);
      const userId = resUser.rows[0].id;

      // Menyimpan data ke tabel profiles
      const insertProfileQuery = {
        text: `
          INSERT INTO profiles (user_id, name, phone_number)
          VALUES ($1, $2, $3)
        `,
        values: [userId, name, phone_number],
      };
      await client.query(insertProfileQuery);

      await client.query('COMMIT');

      return userId;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saat menambahkan pengguna:', error.message);
      throw new InvariantError('Gagal menambahkan pengguna. Silakan coba lagi.');
    } finally {
      client.release();
    }
  }

  /**
   * Memeriksa apakah email sudah terdaftar
   * @param {String} email
   */
  async verifyNewEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Email sudah terdaftar');
    }
  }

  /**
   * Verifikasi kredensial pengguna saat login
   * @param {String} email
   * @param {String} password
   * @returns {String} userId
   */
  async verifyUserCredential(email, password) {
    const query = {
      text: `
        SELECT id, password
        FROM users
        WHERE email = $1
      `,
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Email atau password salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    if (!hashedPassword) {
      throw new AuthenticationError('Email atau password salah');
    }

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Email atau password salah');
    }

    return id;
  }

  /**
   * Mendapatkan data pengguna berdasarkan ID
   * @param {String} userId
   * @returns {Object} user
   */
  async getUserById(userId) {
    const query = {
      text: `
        SELECT 
          u.email, 
          p.name, 
          p.phone_number
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = UsersService;
