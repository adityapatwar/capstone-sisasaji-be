const autoBind = require('auto-bind');

class NotificationsHandler {
  constructor(service) {
    this._service = service;
    autoBind(this);
  }

  async getNotificationsHandler(request) {
    const { id: userId } = request.auth.credentials;
    const notifications = await this._service.getNotificationsByUserId(userId);
    return {
      status: 'success',
      data: {
        notifications,
      },
    };
  }

  async markNotificationAsReadHandler(request) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.markNotificationAsRead(id, userId);
    return {
      status: 'success',
      message: 'Notifikasi berhasil ditandai sebagai telah dibaca',
    };
  }
}

module.exports = NotificationsHandler;