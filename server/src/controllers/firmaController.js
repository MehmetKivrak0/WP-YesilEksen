//Firma Panel İstatistikleri
const { pool } = require('../config/database.js');

const getPanelStats = async (req, res) => {
     try {
          const userId = req.user.id;

          //Firma Id'sini bul
          const firmaResullt = await pool.query
               ('SELECT * FROM firmalar WHERE id = $1', [userId]);

          if (firmaResullt.rowCount === 0) {
               return res.status(404).json({ message: 'Firma bulunamadı' });
          }

          const firmaId = firmaResullt.rows[0].id;

          //Toplam Teklif Sayısı
          const teklifResult = await pool.query
               ('SELECT COUNT(*) FROM teklifler WHERE firma_id = $1', [firmaId]);

          // Onaylanan Teklif Sayısı
          const onaylananTeklifResult = await pool.query
               ('SELECT COUNT(*) FROM teklifler WHERE firma_id = $1 AND durum = $2', [firmaId, 'Onaylandı']);
          //Bekleyen Teklif Sayısı
          const bekleyenTeklifResult = await pool.query
               ('SELECT COUNT(*) FROM teklifler WHERE firma_id = $1 AND durum = $2', [firmaId, 'Beklemede']);

          //Toplam sipariş sayısı

          const siparisResult = await pool.query
               ('SELECT COUNT(*) FROM siparisler WHERE firma_id = $1', [firmaId]);
          // Toplam harcama
          const harcamaResult = await pool.query(
               `SELECT COALESCE(SUM(toplam_tutar), 0) as toplam_harcama
          FROM siparisler 
          WHERE firma_id = $1 AND durum IN ('onaylandi', 'hazirlaniyor', 'kargoda', 'tamamlandi')`,
               [firmaId]
          );

          const sonSiparislerResult = await pool.query(
               `SELECT 
                   s.id,
                   s.siparis_no,
                   u.baslik as urun_adi,
                   c.ad as ciftlik_adi,
                   s.miktar,
                   s.birim_fiyat,
                   s.toplam_tutar,
                   s.durum,
                   s.olusturma
               FROM siparisler s
               JOIN urunler u ON s.urun_id = u.id
               JOIN ciftlikler c ON u.ciftlik_id = c.id
               WHERE s.firma_id = $1
               ORDER BY s.olusturma DESC
               LIMIT 5`,
               [firmaId]
          );

          res.json({
               success: true,
               stats: {
                    toplamTeklif: parseInt(teklifResult.rows[0].toplam),
                    onayliTeklif: parseInt(onayliResult.rows[0].onayli),
                    bekleyenTeklif: parseInt(bekleyenResult.rows[0].bekleyen),
                    toplamSiparis: parseInt(siparisResult.rows[0].toplam),
                    toplamHarcama: parseFloat(harcamaResult.rows[0].toplam_harcama),
                    sonSiparisler: sonSiparislerResult.rows
               }
          });
     } catch (error) {
          console.error('Firma panel stats hatası:', error);
          res.status(500).json({
               success: false,
               message: 'İstatistikler alınamadı'
          });
     }


}

// Başvuru Durumu Kontrol

const getBasvuruStatus = async (rep, res) => {
     try {
          const userId = await req.user.id;

          //Firma Bilgilerini getir

          const result = await pool.query(
               `SELECT 
               f.id,
               f.ad,
               f.durum,
               f.olusturma,
               k.eposta,
               k.telefon,
               k.ad as kullanici_adi,
               k.soyad as kullanici_soyadi
          FROM firmalar f
          JOIN kullanicilar k ON f.kullanici_id = k.id
          WHERE f.kullanici_id = $1`,
               [userId]
          );

          if (result.rowCount === 0) {
               return res.status(404).json({ message: 'Firma bulunamadı' });
          }
          const firma = result.rows[0];
          res.json({
               success: true,
               firma: {
                    id: firma.id,
                    ad: firma.ad,
                    durum: firma.durum,
                    olusturmaTarihi: firma.olusturma,
                    yetkili: {
                         ad: firma.kullanici_adi,
                         soyad: firma.kullanici_soyadi,
                         eposta: firma.eposta,
                         telefon: firma.telefon
                    }
               }
          });
     } catch (error) {
          console.error('Başvuru durum hatası:', error);
          res.status(500).json({
               success: false,
               message: 'Başvuru durumu alınamadı'
          });
     }
 

}

module.exports = {
     getPanelStats,
     getBasvuruStatus
 };
