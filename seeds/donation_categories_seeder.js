require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

const donationCategories = [
  { name: 'Pendidikan', description: 'Dukungan untuk inisiatif pendidikan.' },
  { name: 'Kesehatan', description: 'Dukungan untuk kebutuhan terkait kesehatan.' },
  { name: 'Lingkungan', description: 'Dukungan untuk pelestarian lingkungan.' },
  { name: 'Bantuan Bencana', description: 'Dukungan untuk wilayah yang terdampak bencana.' },
  { name: 'Kesejahteraan Hewan', description: 'Dukungan untuk perlindungan hewan.' },
  { name: 'Seni dan Budaya', description: 'Dukungan untuk program seni dan budaya.' },
  { name: 'Pengembangan Komunitas', description: 'Dukungan untuk proyek berbasis komunitas.' },
];

const seedDonationCategories = async () => {
  try {
    await pool.connect();

    for (const category of donationCategories) {
      const { name, description } = category;

      // Cek apakah kategori sudah ada
      const checkQuery = {
        text: 'SELECT id FROM donation_categories WHERE name = $1',
        values: [name],
      };
      const checkResult = await pool.query(checkQuery);

      if (checkResult.rows.length === 0) {
        // Insert kategori
        const insertQuery = {
          text: 'INSERT INTO donation_categories (name, description) VALUES ($1, $2)',
          values: [name, description],
        };
        await pool.query(insertQuery);
      } else {
        console.log(`Kategori sudah ada: ${name}`);
      }
    }

  } catch (error) {
    console.error('Terjadi kesalahan saat seeding kategori donasi:', error);
  } finally {
    await pool.end();
  }
};

seedDonationCategories();
