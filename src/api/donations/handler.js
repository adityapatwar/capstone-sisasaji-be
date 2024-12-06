/* eslint-disable camelcase */
const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');

class DonationsHandler {
  constructor(service, authenticationsService, validator) {
    this._service = service;
    this._authenticationsService = authenticationsService;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handler untuk menambahkan donasi baru
   */
  async postDonationHandler(request, h) {
    try {
      // Validasi payload
      this._validator.validateDonationPayload(request.payload);

      const { title, description, category_id, image_url } = request.payload;
      const { id: donorId, token } = request.auth.credentials;

      // Validasi akses token
      const isActive = await this._authenticationsService.isAccessTokenActive(token);
      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Tambahkan donasi
      const donationId = await this._service.addDonation({
        donorId,
        title,
        description,
        category_id,
        image_url,
      });

      return h.response({
        status: 'success',
        message: 'Donasi berhasil ditambahkan',
        data: {
          donationId,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof InvariantError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }

      console.error('Error in postDonationHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }


  /**
   * Handler untuk mendapatkan semua donasi, dengan filter optional category_id dan verifyOwner
   */
  async getDonationsHandler(request, h) {
    try {
      const { token, id: userId } = request.auth.credentials;

      // Validasi akses token
      const isActive = await this._authenticationsService.isAccessTokenActive(token);
      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Ambil query parameter category_id dan verifyowner jika ada
      const { category_id, verifyowner } = request.query;
      let verifyOwner = false;

      if (verifyowner !== undefined) {
        // Pastikan nilai verifyowner adalah boolean
        if (typeof verifyowner === 'string') {
          verifyOwner = verifyowner.toLowerCase() === 'true';
        } else if (typeof verifyowner === 'boolean') {
          verifyOwner = verifyowner;
        } else {
          // Jika nilai tidak valid, kembalikan error
          return h.response({
            status: 'fail',
            message: 'Parameter verifyowner harus berupa boolean (true atau false)',
          }).code(400);
        }
      }

      let donations;
      if (category_id || verifyOwner) {
        // Validasi category_id sudah dilakukan oleh route's validation
        const categoryIdNum = category_id ? parseInt(category_id, 10) : null;

        donations = await this._service.getDonations(categoryIdNum, verifyOwner, userId);
      } else {
        donations = await this._service.getDonations();
      }

      return {
        status: 'success',
        data: {
          donations,
        },
      };
    } catch (error) {
      console.error('Error in getDonationsHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }

  /**
   * Handler untuk mendapatkan donasi berdasarkan ID
   */
  async getDonationByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { token } = request.auth.credentials;

      // Validasi akses token
      const isActive = await this._authenticationsService.isAccessTokenActive(token);
      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Dapatkan donasi berdasarkan ID
      const donation = await this._service.getDonationById(id);
      return {
        status: 'success',
        data: {
          donation,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(404);
      }

      console.error('Error in getDonationByIdHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }

  /**
   * Handler untuk memperbarui donasi berdasarkan ID
   */
  async putDonationByIdHandler(request, h) {
    try {
      // Validasi payload
      this._validator.validateDonationPayload(request.payload);
      const { id } = request.params;
      const { id: donorId, token } = request.auth.credentials;

      // Validasi akses token
      const isActive = await this._authenticationsService.isAccessTokenActive(token);
      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Validasi kepemilikan donasi
      await this._service.verifyDonationOwner(id, donorId);

      const { title, description, category_id, image_url } = request.payload;
      await this._service.editDonationById(id, {
        title,
        description,
        category_id,
        image_url,
      });

      return {
        status: 'success',
        message: 'Donasi berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error instanceof NotFoundError ? 404 : 403);
      }

      console.error('Error in putDonationByIdHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }

  /**
   * Handler untuk menghapus donasi berdasarkan ID
   */
  async deleteDonationByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: donorId, token } = request.auth.credentials;

      // Validasi akses token
      const isActive = await this._authenticationsService.isAccessTokenActive(token);
      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Validasi kepemilikan donasi
      await this._service.verifyDonationOwner(id, donorId);

      // Hapus donasi
      await this._service.deleteDonationById(id);

      return {
        status: 'success',
        message: 'Donasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error instanceof NotFoundError ? 404 : 403);
      }

      console.error('Error in deleteDonationByIdHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }

  /**
   * Handler untuk mendapatkan semua kategori donasi
   */
  async getDonationCategoriesHandler(request, h) {
    try {
      const { token } = request.auth.credentials;

      // Validasi akses token
      const isActive = await this._authenticationsService.isAccessTokenActive(token);
      if (!isActive) {
        return h.response({
          status: 'fail',
          message: 'Token sudah tidak valid atau telah dihapus',
        }).code(401);
      }

      // Dapatkan kategori donasi
      const categories = await this._service.getDonationCategories();
      return {
        status: 'success',
        data: {
          categories,
        },
      };
    } catch (error) {
      console.error('Error in getDonationCategoriesHandler:', error);
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      }).code(500);
    }
  }
}

module.exports = DonationsHandler;
