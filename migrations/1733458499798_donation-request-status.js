exports.up = (pgm) => {
  pgm.createType('donation_request_status', ['pending', 'accepted', 'rejected']);
};

exports.down = (pgm) => {
  pgm.dropType('donation_request_status');
};