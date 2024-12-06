const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class DonationRequestsHandler {
  constructor(service, donationsService, notificationsService, validator) {
    this._service = service; // DonationRequestsService
    this._donationsService = donationsService; // DonationsService
    this._notificationsService = notificationsService; // NotificationsService
    this._validator = validator; // DonationRequestsValidator

    autoBind(this);
  }

  /**
 * Handler untuk mengajukan permohonan donasi baru
 */
  async postDonationRequestHandler(request, h) {
    try {
      this._validator.validateDonationRequestPayload(request.payload);

      const { reason } = request.payload;
      const { id: donationId } = request.params;
      const { id: userId } = request.auth.credentials.id;

      // Cek donasi
      const donation = await this._donationsService.getDonationById(donationId);

      if (donation.donor_id === userId) {
        console.error('User mencoba mengajukan donasi mereka sendiri:', { donationId, userId });
        throw new InvariantError('Anda tidak dapat mengajukan permohonan untuk donasi Anda sendiri');
      }

      // Cek pengajuan sebelumnya
      await this._service.verifyNotAlreadyApplied(donationId, userId);

      // Menyimpan permohonan
      const requestId = await this._service.addDonationRequest({
        donationId,
        userId,
        reason,
      });

      // Mengirim notifikasi kepada donatur
      await this._notificationsService.addNotification({
        userId: donation.donor_id,
        message: `Anda menerima permohonan baru untuk donasi "${donation.title}"`,
        relatedDonationRequestId: requestId,
      });

      const response = h.response({
        status: 'success',
        message: 'Permohonan donasi berhasil diajukan',
        data: {
          requestId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error('Error dalam postDonationRequestHandler:', error); // Log error lengkap
      if (error instanceof InvariantError || error instanceof NotFoundError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error instanceof NotFoundError ? 404 : 400);
      }

      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }


  /**
   * Handler untuk mendapatkan semua permohonan donasi berdasarkan ID donasi
   */
  async getDonationRequestsHandler(request, h) {
    try {
      const { id: donationId } = request.params;
      const { id: userId } = request.auth.credentials;

      // Cek apakah donasi ada dan milik pengguna
      await this._donationsService.verifyDonationOwner(donationId, userId);

      const requests = await this._service.getDonationRequestsByDonationId(donationId);

      return h.response({
        status: 'success',
        data: {
          requests,
        },
      }).code(200);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvariantError || error instanceof AuthorizationError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error instanceof NotFoundError ? 404 : 403);
      }

      console.error('Error in getDonationRequestsHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }

  /**
   * Handler untuk memperbarui status permohonan donasi
   */
  async putDonationRequestHandler(request, h) {
    try {
      // Validasi payload
      this._validator.validateDonationRequestStatusPayload(request.payload);
      const { status } = request.payload;
      const { donationId, requestId } = request.params;
      const { id: userId } = request.auth.credentials;

      // Cek apakah donasi ada dan milik pengguna
      await this._donationsService.verifyDonationOwner(donationId, userId);

      // Memperbarui status permohonan
      await this._service.updateDonationRequestStatus(requestId, status);

      // Mengambil data permohonan donasi untuk notifikasi
      const donationRequest = await this._service.getDonationRequestById(requestId);
      if (!donationRequest) {
        throw new NotFoundError('Permohonan donasi tidak ditemukan');
      }

      // Mengirim notifikasi kepada pelamar
      await this._notificationsService.addNotification({
        userId: donationRequest.applicant_id,
        message: `Permohonan Anda untuk donasi "${donationRequest.donation_title}" telah ${status === 'accepted' ? 'diterima' : 'ditolak'}.`,
        relatedDonationRequestId: requestId,
      });

      return h.response({
        status: 'success',
        message: 'Status permohonan berhasil diperbarui',
      }).code(200);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvariantError || error instanceof AuthorizationError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error instanceof NotFoundError ? 404 : 403);
      }

      console.error('Error in putDonationRequestHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }

  /**
   * Handler untuk mendapatkan detail permohonan donasi berdasarkan ID permohonan
   */
  async getDonationRequestDetailHandler(request, h) {
    try {
      const { requestId } = request.params;
      const { id: userId } = request.auth.credentials;

      // Validasi parameter
      this._validator.validateDonationRequestParams({ donationId: null, requestId }); // donationId tidak diperlukan di sini

      // Mendapatkan detail permohonan donasi
      const detail = await this._service.getDonationRequestDetail(requestId, userId, this._donationsService);

      return h.response({
        status: 'success',
        data: {
          donationRequest: detail.donationRequest,
          donation: detail.donation,
          donorProfile: detail.donorProfile, // null jika status bukan 'accepted'
        },
      }).code(200);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvariantError || error instanceof AuthorizationError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error instanceof NotFoundError ? 404 : 403);
      }

      console.error('Error in getDonationRequestDetailHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }
}

module.exports = DonationRequestsHandler;
