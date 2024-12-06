const DonationRequestsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'donationRequests',
  version: '1.0.0',
  register: async (server, { service, donationsService, notificationsService, validator }) => {
    const donationRequestsHandler = new DonationRequestsHandler(
      service, // DonationRequestsService
      donationsService, // DonationsService
      notificationsService, // NotificationsService
      validator // DonationRequestsValidator
    );
    server.route(routes(donationRequestsHandler));
  },
};
