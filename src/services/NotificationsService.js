const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class NotificationsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Mendapatkan daftar notifikasi berdasarkan userId
   * @param {String} userId
   * @returns {Array} notifications
   */
  async getNotificationsByUserId(userId) {
    const query = {
      text: 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Menandai notifikasi sebagai telah dibaca
   * @param {String} notificationId
   * @param {String} userId
   */
  async markNotificationAsRead(notificationId, userId) {
    const query = {
      text: 'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
      values: [notificationId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Notifikasi tidak ditemukan atau Anda tidak memiliki akses');
    }
  }

  /**
   * Menambahkan notifikasi baru
   * @param {Object} param0
   * @returns {String} notificationId
   */
  async addNotification({ userId, message, relatedDonationRequestId }) {
    const query = {
      text: 'INSERT INTO notifications (user_id, message, related_donation_request_id) VALUES ($1, $2, $3) RETURNING id',
      values: [userId, message, relatedDonationRequestId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan notifikasi');
    }

    return result.rows[0].id;
  }
}

module.exports = NotificationsService;