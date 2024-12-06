const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class DonationRequestsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Tambahkan permohonan donasi baru
   */
  async addDonationRequest({ donationId, applicantId, reason }) {
    const query = {
      text: 'INSERT INTO donation_requests (donation_id, applicant_id, reason) VALUES ($1, $2, $3) RETURNING id',
      values: [donationId, applicantId, reason],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Permohonan donasi gagal diajukan');
    }

    return result.rows[0].id;
  }

  /**
   * Verifikasi bahwa pengguna belum mengajukan permohonan untuk donasi tertentu
   */
  async verifyNotAlreadyApplied(donationId, applicantId) {
    const query = {
      text: 'SELECT id FROM donation_requests WHERE donation_id = $1 AND applicant_id = $2',
      values: [donationId, applicantId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Anda sudah mengajukan permohonan untuk donasi ini');
    }
  }

  /**
   * Dapatkan semua permohonan donasi berdasarkan ID donasi
   */
  async getDonationRequestsByDonationId(donationId) {
    const query = {
      text: `
        SELECT donation_requests.*, users.email AS applicant_email, profiles.name AS applicant_name, donations.title AS donation_title
        FROM donation_requests
        LEFT JOIN users ON donation_requests.applicant_id = users.id
        LEFT JOIN profiles ON users.id = profiles.user_id
        JOIN donations ON donation_requests.donation_id = donations.id
        WHERE donation_requests.donation_id = $1
      `,
      values: [donationId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  /**
   * Memperbarui status permohonan donasi berdasarkan ID permohonan
   */
  async updateDonationRequestStatus(requestId, status) {
    const query = {
      text: `
        UPDATE donation_requests
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id
      `,
      values: [status, requestId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Permohonan donasi tidak ditemukan atau gagal diperbarui');
    }
  }

  /**
   * Dapatkan permohonan donasi berdasarkan ID permohonan
   */
  async getDonationRequestById(requestId) {
    const query = {
      text: `
        SELECT donation_requests.id, donation_requests.status, donation_requests.applicant_id, donations.title AS donation_title, donations.donor_id
        FROM donation_requests
        JOIN donations ON donation_requests.donation_id = donations.id
        WHERE donation_requests.id = $1
      `,
      values: [requestId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Permohonan donasi tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Dapatkan detail permohonan donasi, donasi terkait, dan profil donatur (jika status accepted)
   * @param {number} requestId - ID permohonan donasi
   * @param {number} userId - ID pengguna yang mengakses API
   * @param {DonationsService} donationsService - Instance DonationsService
   * @returns {object} - Detail lengkap permohonan donasi
   */
  async getDonationRequestDetail(requestId, userId, donationsService) {
    // Dapatkan permohonan donasi
    const donationRequest = await this.getDonationRequestById(requestId);

    // Validasi bahwa userId adalah applicant_id
    if (donationRequest.applicant_id !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    // Dapatkan detail donasi terkait
    const donation = await donationsService.getDonationById(donationRequest.donation_id);

    let donorProfile = null;
    if (donationRequest.status === 'accepted') {
      // Dapatkan profil donatur
      donorProfile = await donationsService.getDonorProfile(donation.donor_id);
    }

    return {
      donationRequest,
      donation,
      donorProfile,
    };
  }
}

module.exports = DonationRequestsService;
