/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('tokens', {
    id: 'id',
    user_id: { type: 'integer', references: '"users"', onDelete: 'CASCADE' },
    access_token: { type: 'text', notNull: true },
    refresh_token: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tokens');
};