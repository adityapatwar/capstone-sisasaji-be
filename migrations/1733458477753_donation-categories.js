/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('donation_categories', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    description: { type: 'text', default: null },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('donation_categories');
};