INSERT INTO sertifika_turleri (kod, ad, aciklama, gecerlilik_suresi, aktif) VALUES
    ('CIFTCLIK_EGITIM', 'Çiftçilik Eğitimi Sertifikası', 'Çiftçilik eğitimi tamamlama sertifikası', NULL, TRUE),
    ('ORGANIK_TARIM_MUTESEBBIS', 'Organik Tarım Müteşebbis Sertifikası', 'Organik tarım müteşebbis sertifikası', NULL, TRUE),
    ('BUYUKBAS_HAYVANCILIK', 'Büyükbaş Hayvancılık Sertifikası', 'Büyükbaş hayvancılık sertifikası', NULL, TRUE),
    ('KUCUKBAS_HAYVANCILIK', 'Küçükbaş Hayvancılık Sertifikası', 'Küçükbaş hayvancılık sertifikası', NULL, TRUE),
    ('ORG_HAYVAN_EGITIM', 'Organik Hayvan Yetiştiriciliği Eğitimi Sertifikası', 'Organik hayvan yetiştiriciliği eğitimi sertifikası', NULL, TRUE)
ON CONFLICT (kod) DO NOTHING;

