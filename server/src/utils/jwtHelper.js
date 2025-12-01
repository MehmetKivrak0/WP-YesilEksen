const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'yesileksen_super_secret_key_2024',
        { expiresIn }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'yesileksen_super_secret_key_2024');
    } catch (error) {
        throw new Error('Geçersiz token');
    }
};

/**
 * Token'dan kullanıcı bilgilerini çıkar
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};

