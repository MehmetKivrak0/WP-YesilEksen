const { Pool } = require('pg');
// dotenv zaten server.js'de yüklenmiş olmalı

console.log('🔍 database.js - ENV değerleri:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '****' + process.env.DB_PASSWORD.slice(-4) : 'BOŞ!');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL Havuz Hatası:', err);
});

const query = async (text, params) => {
    return await pool.query(text, params);
};

module.exports = {
    pool,
    query
};