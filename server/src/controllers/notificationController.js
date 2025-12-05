const { pool } = require('../config/database');

/**
 * Tüm bildirimleri getir
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Bildirimleri getir (en yeni önce)
        const result = await pool.query(
            `SELECT 
                b.id,
                b.baslik,
                b.mesaj,
                b.link,
                b.okundu,
                b.okunma_tarihi,
                b.olusturma,
                bt.kod as bildirim_tipi_kod
            FROM bildirimler b
            LEFT JOIN bildirim_turleri bt ON b.bildirim_turu_id = bt.id
            WHERE b.kullanici_id = $1
            ORDER BY b.olusturma DESC`,
            [user_id]
        );

        // Frontend'in beklediği formata dönüştür
        const notifications = result.rows.map(row => ({
            id: row.id,
            baslik: row.baslik,
            mesaj: row.mesaj,
            tarih: row.olusturma ? new Date(row.olusturma).toISOString() : new Date().toISOString(),
            okundu: row.okundu || false,
            tip: mapNotificationType(row.bildirim_tipi_kod) || 'sistem',
            link: row.link || undefined,
            createdAt: row.olusturma ? new Date(row.olusturma).toISOString() : undefined
        }));

        // Okunmamış sayısını hesapla
        const unreadCount = notifications.filter(n => !n.okundu).length;

        res.json({
            success: true,
            notifications: notifications,
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Bildirimler yüklenirken bir hata oluştu'
        });
    }
};

/**
 * Okunmamış bildirim sayısını getir
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
    try {
        const user_id = req.user.id;

        const result = await pool.query(
            `SELECT COUNT(*) as count
            FROM bildirimler
            WHERE kullanici_id = $1 AND okundu = FALSE`,
            [user_id]
        );

        const count = parseInt(result.rows[0].count) || 0;

        res.json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Okunmamış bildirim sayısı yüklenirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Okunmamış bildirim sayısı yüklenirken bir hata oluştu'
        });
    }
};

/**
 * Bildirimi okundu olarak işaretle
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
    try {
        const user_id = req.user.id;
        const notification_id = req.params.id;

        // Bildirimin bu kullanıcıya ait olduğunu kontrol et
        const checkResult = await pool.query(
            `SELECT id FROM bildirimler WHERE id = $1 AND kullanici_id = $2`,
            [notification_id, user_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bildirim bulunamadı'
            });
        }

        // Okundu olarak işaretle
        await pool.query(
            `UPDATE bildirimler 
            SET okundu = TRUE, okunma_tarihi = NOW()
            WHERE id = $1 AND kullanici_id = $2`,
            [notification_id, user_id]
        );

        res.json({
            success: true,
            message: 'Bildirim okundu olarak işaretlendi'
        });
    } catch (error) {
        console.error('Bildirim okundu işaretlenirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Bildirim okundu işaretlenirken bir hata oluştu'
        });
    }
};

/**
 * Tüm bildirimleri okundu olarak işaretle
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
    try {
        const user_id = req.user.id;

        await pool.query(
            `UPDATE bildirimler 
            SET okundu = TRUE, okunma_tarihi = NOW()
            WHERE kullanici_id = $1 AND okundu = FALSE`,
            [user_id]
        );

        res.json({
            success: true,
            message: 'Tüm bildirimler okundu olarak işaretlendi'
        });
    } catch (error) {
        console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Bildirimler okundu işaretlenirken bir hata oluştu'
        });
    }
};

/**
 * Bildirimi sil
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
    try {
        const user_id = req.user.id;
        const notification_id = req.params.id;

        // Bildirimin bu kullanıcıya ait olduğunu kontrol et
        const checkResult = await pool.query(
            `SELECT id FROM bildirimler WHERE id = $1 AND kullanici_id = $2`,
            [notification_id, user_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bildirim bulunamadı'
            });
        }

        // Bildirimi sil (CASCADE ile metadata da silinecek)
        await pool.query(
            `DELETE FROM bildirimler WHERE id = $1 AND kullanici_id = $2`,
            [notification_id, user_id]
        );

        res.json({
            success: true,
            message: 'Bildirim silindi'
        });
    } catch (error) {
        console.error('Bildirim silinirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Bildirim silinirken bir hata oluştu'
        });
    }
};

/**
 * Tüm bildirimleri sil
 * DELETE /api/notifications
 */
const deleteAllNotifications = async (req, res) => {
    try {
        const user_id = req.user.id;

        await pool.query(
            `DELETE FROM bildirimler WHERE kullanici_id = $1`,
            [user_id]
        );

        res.json({
            success: true,
            message: 'Tüm bildirimler silindi'
        });
    } catch (error) {
        console.error('Tüm bildirimler silinirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Bildirimler silinirken bir hata oluştu'
        });
    }
};

/**
 * Bildirim tipi kodunu frontend'in beklediği tipe dönüştür
 * Database'deki bildirim_turleri.kod değerlerini frontend tip'ine map eder
 */
const mapNotificationType = (kod) => {
    if (!kod) return 'sistem';
    
    // Database'deki kodları frontend'in beklediği tiplere map et
    const typeMap = {
        'SISTEM': 'sistem',
        'BASVURU': 'onay',
        'SIPARIS': 'siparis',
        'TEKLIF': 'teklif',
        'BELGE': 'belge',
        'BELGE_GUNCELLEME': 'belge',
        'MESAJ': 'sistem',
        'UYARI': 'sistem',
        'URUN_DUZENLEME': 'urun',
        'URUN_SILME': 'urun',
        // Küçük harf versiyonları da destekle
        'sistem': 'sistem',
        'basvuru': 'onay',
        'siparis': 'siparis',
        'teklif': 'teklif',
        'belge': 'belge',
        'belge_guncelleme': 'belge',
        'mesaj': 'sistem',
        'uyari': 'sistem',
        'urun_duzenleme': 'urun',
        'urun_silme': 'urun'
    };

    return typeMap[kod] || 'sistem';
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};
