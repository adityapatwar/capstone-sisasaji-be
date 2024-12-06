/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('notifications', {
    id: 'id',
    user_id: { type: 'integer', references: '"users"', onDelete: 'CASCADE' },
    message: { type: 'text', notNull: true },
    is_read: { type: 'boolean', notNull: true, default: false },
    related_donation_request_id: { type: 'integer', references: '"donation_requests"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('notifications');
};