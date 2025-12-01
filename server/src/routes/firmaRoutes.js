const express = require('express');
const router = express.Router();

// Geçici route - Firma API'leri için
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Firma route çalışıyor' });
});

module.exports = router;

