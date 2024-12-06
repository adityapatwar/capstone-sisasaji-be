require('dotenv').config();
const { Pool } = require('pg');

// Konfigurasi koneksi database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || null,
  host: process.env.DATABASE_URL ? null : process.env.PGHOST,
  port: process.env.DATABASE_URL ? null : process.env.PGPORT,
  database: process.env.DATABASE_URL ? null : process.env.PGDATABASE,
  user: process.env.DATABASE_URL ? null : process.env.PGUSER,
  password: process.env.DATABASE_URL ? null : process.env.PGPASSWORD,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Gunakan SSL jika DATABASE_URL tersedia
});

// Data kategori donasi
const donationCategories = [
  { name: 'Pendidikan', description: 'Dukungan untuk inisiatif pendidikan.' },
  { name: 'Kesehatan', description: 'Dukungan untuk kebutuhan terkait kesehatan.' },
  { name: 'Lingkungan', description: 'Dukungan untuk pelestarian lingkungan.' },
  { name: 'Bantuan Bencana', description: 'Dukungan untuk wilayah yang terdampak bencana.' },
  { name: 'Kesejahteraan Hewan', description: 'Dukungan untuk perlindungan hewan.' },
  { name: 'Seni dan Budaya', description: 'Dukungan untuk program seni dan budaya.' },
  { name: 'Pengembangan Komunitas', description: 'Dukungan untuk proyek berbasis komunitas.' },
];

// Fungsi untuk seeding kategori donasi
const seedDonationCategories = async () => {
  const client = await pool.connect();
  try {
    for (const category of donationCategories) {
      const { name, description } = category;

      // Cek apakah kategori sudah ada
      const checkQuery = `
        SELECT id FROM donation_categories WHERE name = $1
      `;
      const checkResult = await client.query(checkQuery, [name]);

      if (checkResult.rows.length === 0) {
        // Insert kategori jika belum ada
        const insertQuery = `
          INSERT INTO donation_categories (name, description) VALUES ($1, $2)
        `;
        await client.query(insertQuery, [name, description]);
        console.log(`Kategori ditambahkan: ${name}`);
      } else {
        console.log(`Kategori sudah ada: ${name}`);
      }
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat seeding kategori donasi:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

// Jalankan seeding
seedDonationCategories();
