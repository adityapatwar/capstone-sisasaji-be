/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('profiles', {
    id: 'id',
    user_id: { type: 'integer', notNull: true, unique: true, references: '"users"', onDelete: 'CASCADE' },
    name: { type: 'varchar(100)', notNull: true },
    phone_number: { type: 'varchar(15)', default: null },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('profiles');
};