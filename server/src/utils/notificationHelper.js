const { pool } = require('../config/database');

/**
 * Bildirim oluşturma helper fonksiyonu
 * @param {Object} options - Bildirim seçenekleri
 * @param {string} options.kullanici_id - Bildirimi alacak kullanıcı ID'si
 * @param {string} options.bildirim_tipi_kod - Bildirim tipi kodu (BASVURU, SIPARIS, BELGE, vb.)
 * @param {string} options.baslik - Bildirim başlığı
 * @param {string} options.mesaj - Bildirim mesajı
 * @param {string} [options.link] - Bildirime tıklandığında gidilecek link (opsiyonel)
 * @returns {Promise<Object>} Oluşturulan bildirim bilgisi
 */
const createNotification = async (options) => {
    try {
        const { kullanici_id, bildirim_tipi_kod, baslik, mesaj, link } = options;

        // Bildirim tipi ID'sini al
        const bildirimTipiResult = await pool.query(
            `SELECT id FROM bildirim_turleri WHERE kod = $1 AND aktif = TRUE`,
            [bildirim_tipi_kod]
        );

        if (bildirimTipiResult.rows.length === 0) {
            console.error(`⚠️ Bildirim tipi bulunamadı: ${bildirim_tipi_kod}`);
            // Varsayılan olarak SISTEM bildirim tipini kullan
            const sistemTipiResult = await pool.query(
                `SELECT id FROM bildirim_turleri WHERE kod = 'SISTEM' AND aktif = TRUE LIMIT 1`
            );
            
            if (sistemTipiResult.rows.length === 0) {
                throw new Error('Bildirim tipi bulunamadı ve sistem tipi de yok');
            }
            
            var bildirim_turu_id = sistemTipiResult.rows[0].id;
        } else {
            var bildirim_turu_id = bildirimTipiResult.rows[0].id;
        }

        // Bildirimi oluştur
        const result = await pool.query(
            `INSERT INTO bildirimler (kullanici_id, bildirim_turu_id, baslik, mesaj, link, okundu, olusturma)
             VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
             RETURNING id, baslik, mesaj, link, olusturma`,
            [kullanici_id, bildirim_turu_id, baslik, mesaj, link || null]
        );

        if (result.rows.length > 0) {
            console.log(`✅ Bildirim oluşturuldu:`, {
                id: result.rows[0].id,
                kullanici_id: kullanici_id,
                baslik: baslik,
                bildirim_tipi_kod: bildirim_tipi_kod
            });
            return {
                success: true,
                notification: result.rows[0]
            };
        } else {
            throw new Error('Bildirim oluşturulamadı');
        }
    } catch (error) {
        console.error('❌ Bildirim oluşturma hatası:', error);
        console.error('❌ Bildirim detayları:', {
            kullanici_id: options?.kullanici_id,
            bildirim_tipi_kod: options?.bildirim_tipi_kod,
            baslik: options?.baslik,
            error: error.message,
            stack: error.stack
        });
        // Hata durumunda exception fırlat ki çağrı yapan fonksiyon hatayı yakalayabilsin
        throw error;
    }
};

module.exports = {
    createNotification
};
