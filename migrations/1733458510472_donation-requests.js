/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('donation_requests', {
    id: 'id',
    donation_id: { type: 'integer', references: '"donations"', onDelete: 'CASCADE' },
    applicant_id: { type: 'integer', references: '"users"', onDelete: 'CASCADE' },
    reason: { type: 'text', notNull: true },
    status: { type: 'donation_request_status', notNull: true, default: 'pending' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('donation_requests');
};