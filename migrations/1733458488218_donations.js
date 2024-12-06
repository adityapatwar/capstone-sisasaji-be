/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('donations', {
    id: 'id',
    donor_id: { type: 'integer', references: '"users"', onDelete: 'CASCADE' },
    title: { type: 'varchar(150)', notNull: true },
    description: { type: 'text', notNull: true },
    category_id: { type: 'integer', references: '"donation_categories"', onDelete: 'SET NULL' },
    image_url: { type: 'text', default: null },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('donations');
};