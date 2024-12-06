/* eslint-disable prefer-const */
/* eslint-disable camelcase */
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');
const AuthenticationError = require('../exceptions/AuthenticationError');

class DonationsService {
  constructor(pool) {
    this._pool = pool;
  }


  /**
   * Tambahkan donasi baru
   */
  async addDonation({ donorId, title, description, category_id, image_url }) {
    const query = {
      text: 'INSERT INTO donations (donor_id, title, description, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [donorId, title, description, category_id, image_url],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Donasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Dapatkan semua donasi, dengan optional filter by category_id dan verifyOwner
   * @param {number} [categoryId] - ID kategori donasi
   * @param {boolean} [verifyOwner] - Jika true, hanya donasi milik pengguna yang sedang mengautentikasi
   * @param {number} [userId] - ID pengguna yang sedang mengautentikasi
   * @returns {Array} list of donations
   */
  async getDonations(categoryId, verifyOwner = false, userId = null) {
    let query;
    const values = [];
    const whereClauses = [];

    // Filter berdasarkan category_id jika disediakan
    if (categoryId) {
      whereClauses.push('donations.category_id = $1');
      values.push(categoryId);
    }

    // Jika verifyOwner adalah true, tambahkan filter berdasarkan donor_id
    if (verifyOwner && userId !== null) {
      whereClauses.push(`donations.donor_id = $${values.length + 1}`);
      values.push(userId);
    }

    // Gabungkan klausa WHERE jika ada
    let whereStatement = '';
    if (whereClauses.length > 0) {
      whereStatement = `WHERE ${whereClauses.join(' AND ')}`;
    }

    // Query SQL
    query = {
      text: `
        SELECT donations.id, donations.title, donations.description, donations.category_id, donations.image_url, donations.created_at, donations.updated_at,
               donation_categories.name AS category_name
        FROM donations
        LEFT JOIN users ON donations.donor_id = users.id
        LEFT JOIN profiles ON users.id = profiles.user_id
        LEFT JOIN donation_categories ON donations.category_id = donation_categories.id
        ${whereStatement}
        ORDER BY donations.created_at DESC
      `,
      values: values,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Dapatkan donasi berdasarkan ID
   */
  async getDonationById(id) {
    const query = {
      text: `
        SELECT donations.id, donations.title, donations.description, donations.category_id, donations.image_url, donations.created_at, donations.updated_at,
               users.email AS donor_email, profiles.name AS donor_name, donation_categories.name AS category_name
        FROM donations
        LEFT JOIN users ON donations.donor_id = users.id
        LEFT JOIN profiles ON users.id = profiles.user_id
        LEFT JOIN donation_categories ON donations.category_id = donation_categories.id
        WHERE donations.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Donasi tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Perbarui donasi berdasarkan ID
   */
  async editDonationById(id, { title, description, category_id, image_url }) {
    const query = {
      text: `
        UPDATE donations
        SET title = $1, description = $2, category_id = $3, image_url = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id
      `,
      values: [title, description, category_id, image_url, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui donasi. Id tidak ditemukan');
    }
  }

  /**
   * Hapus donasi berdasarkan ID
   */
  async deleteDonationById(id) {
    const query = {
      text: 'DELETE FROM donations WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Donasi gagal dihapus. Id tidak ditemukan');
    }
  }

  /**
   * Verifikasi kepemilikan donasi
   */
  async verifyDonationOwner(donationId, userId) {
    const query = {
      text: 'SELECT donor_id FROM donations WHERE id = $1',
      values: [donationId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Donasi tidak ditemukan');
    }

    const donation = result.rows[0];

    if (donation.donor_id !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /**
   * Verifikasi token pengguna
   */
  async verifyUserToken(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Token tidak valid atau pengguna tidak ditemukan');
    }
  }

  /**
   * Dapatkan semua kategori donasi
   * @returns {Array} list of donation categories
   */
  async getDonationCategories() {
    const query = {
      text: 'SELECT id, name, description FROM donation_categories',
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = DonationsService;
