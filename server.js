const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Chave padrão (pode ser sobrescrita via variável de ambiente)
const DEFAULT_KEY = process.env.DECRYPT_KEY || 'DefaultKey123!@#';

/**
 * Converte entrada para Buffer
 * Aceita: hexadecimal, Base64, ou string comum
 */
function parseInput(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Entrada inválida');
    }

    input = input.trim();

    // Tentar como hexadecimal (caracteres 0-9, a-f)
    if (/^[0-9a-fA-F]+$/.test(input)) {
        if (input.length % 2 !== 0) {
            throw new Error('Hexadecimal deve ter número par de caracteres');
        }
        return Buffer.from(input, 'hex');
    }

    // Tentar como Base64
    try {
        const buffer = Buffer.from(input, 'base64');
        // Validação básica: se decodificar e codificar de volta é igual
        if (buffer.toString('base64') === input) {
            return buffer;
        }
    } catch (e) {
        // Continue tentando
    }

    // Fallback: UTF-8
    return Buffer.from(input, 'utf8');
}

/**
 * Gera chave MD5 para 3DES
 * 3DES precisa de 24 bytes, MD5 gera 16, então usamos 2x MD5
 */
function generateDesKey(keyMaterial) {
    const md5 = crypto.createHash('md5');
    md5.update(keyMaterial);
    
    let key = md5.digest(); // 16 bytes
    
    // 3DES precisa de 24 bytes, então geramos mais 8 bytes
    const md5_2 = crypto.createHash('md5');
    md5_2.update(keyMaterial + 'Extended');
    const extraBytes = md5_2.digest().slice(0, 8);
    
    return Buffer.concat([key, extraBytes]); // 24 bytes
}

/**
 * Gera chave AES-256 a partir da chave/senha informada
 * AES-256 precisa de 32 bytes, MD5 gera 16, então usamos 2x MD5
 */
function generateAesKey(keyMaterial) {
    const key1 = crypto.createHash('md5').update(keyMaterial).digest(); // 16 bytes
    const key2 = crypto.createHash('md5').update(keyMaterial + 'AES256').digest(); // 16 bytes

    return Buffer.concat([key1, key2]); // 32 bytes
}

/**
 * Converte o IV informado (hexadecimal ou Base64) para Buffer de 16 bytes
 */
function parseIv(input) {
    if (!input || typeof input !== 'string' || !input.trim()) {
        throw new Error('Campo "iv" é obrigatório para AES-256-CBC (16 bytes, hexadecimal ou Base64)');
    }

    const trimmed = input.trim();
    const buffer = /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0
        ? Buffer.from(trimmed, 'hex')
        : Buffer.from(trimmed, 'base64');

    if (buffer.length !== 16) {
        throw new Error(`IV inválido: precisa ter 16 bytes (recebido ${buffer.length})`);
    }

    return buffer;
}

/**
 * Descriptografa usando AES-256-CBC
 */
function decryptAES(encryptedData, keyMaterial, ivBuffer) {
    if (encryptedData.length === 0 || encryptedData.length % 16 !== 0) {
        throw new Error(
            `Tamanho de dado inválido para AES-256-CBC (${encryptedData.length} bytes após decodificação; ` +
            'precisa ser múltiplo de 16). Confira se a chave e o valor colado estão completos.'
        );
    }

    try {
        const key = generateAesKey(keyMaterial);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);

        let decrypted = decipher.update(encryptedData, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Falha na descriptografia AES: ${error.message}`);
    }
}

/**
 * Descriptografa usando 3DES-ECB
 */
function decryptPassword(encryptedData, keyMaterial) {
    if (encryptedData.length === 0 || encryptedData.length % 8 !== 0) {
        throw new Error(
            `Tamanho de dado inválido para 3DES (${encryptedData.length} bytes após decodificação; ` +
            'precisa ser múltiplo de 8). Confira se a chave e o valor colado estão completos.'
        );
    }

    try {
        const key = generateDesKey(keyMaterial);
        const decipher = crypto.createDecipheriv('des-ede3-ecb', key, '');

        let decrypted = decipher.update(encryptedData, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Falha na descriptografia: ${error.message}`);
    }
}

/**
 * Normaliza o algoritmo pedido pelo cliente ('3des' | 'aes' | 'aes-256-cbc')
 */
function normalizeAlgorithm(algorithm) {
    const algo = (algorithm || '3des').toLowerCase();
    return (algo === 'aes' || algo === 'aes-256-cbc') ? 'aes-256-cbc' : '3des';
}

/**
 * Handler compartilhado por /api/decrypt e /api/decrypt-aes
 */
function handleDecrypt(forcedAlgorithm) {
    return (req, res) => {
        try {
            const { encrypted, key, algorithm, iv } = req.body;

            if (!encrypted || typeof encrypted !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Campo "encrypted" é obrigatório e deve ser string'
                });
            }

            let encryptedBuffer;
            try {
                encryptedBuffer = parseInput(encrypted);
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    error: `Erro ao processar entrada: ${parseError.message}`
                });
            }

            const keyMaterial = key || DEFAULT_KEY;
            const algo = forcedAlgorithm || normalizeAlgorithm(algorithm);

            let decrypted;
            let algorithmLabel;

            if (algo === 'aes-256-cbc') {
                let ivBuffer;
                try {
                    ivBuffer = parseIv(iv);
                } catch (ivError) {
                    return res.status(400).json({ success: false, error: ivError.message });
                }
                decrypted = decryptAES(encryptedBuffer, keyMaterial, ivBuffer);
                algorithmLabel = 'AES-256-CBC + MD5';
            } else {
                decrypted = decryptPassword(encryptedBuffer, keyMaterial);
                algorithmLabel = '3DES-ECB + MD5';
            }

            res.json({
                success: true,
                decrypted: decrypted.trim(),
                algorithm: algorithmLabel,
                keyUsed: key ? 'Custom' : 'Default'
            });

        } catch (error) {
            console.error('Erro na descriptografia:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro interno do servidor'
            });
        }
    };
}

/**
 * Handler compartilhado por /api/encrypt e /api/encrypt-aes
 */
function handleEncrypt(forcedAlgorithm) {
    return (req, res) => {
        try {
            const { password, key, algorithm } = req.body;

            if (!password || typeof password !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Campo "password" é obrigatório'
                });
            }

            const keyMaterial = key || DEFAULT_KEY;
            const algo = forcedAlgorithm || normalizeAlgorithm(algorithm);

            if (algo === 'aes-256-cbc') {
                const aesKey = generateAesKey(keyMaterial);
                const ivBuffer = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, ivBuffer);

                let encrypted = cipher.update(password, 'utf8', 'hex');
                encrypted += cipher.final('hex');

                return res.json({
                    success: true,
                    encrypted,
                    iv: ivBuffer.toString('hex'),
                    algorithm: 'AES-256-CBC + MD5',
                    format: 'hexadecimal'
                });
            }

            const desKey = generateDesKey(keyMaterial);
            const cipher = crypto.createCipheriv('des-ede3-ecb', desKey, '');
            let encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            res.json({
                success: true,
                encrypted,
                algorithm: '3DES-ECB + MD5',
                format: 'hexadecimal'
            });

        } catch (error) {
            console.error('Erro na criptografia:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro interno do servidor'
            });
        }
    };
}

// Endpoints de descriptografia: /api/decrypt aceita { algorithm: '3des' | 'aes-256-cbc' },
// /api/decrypt-aes força AES-256-CBC (compatibilidade com clientes que já esperam esse endpoint)
app.post('/api/decrypt', handleDecrypt(null));
app.post('/api/decrypt-aes', handleDecrypt('aes-256-cbc'));

// Endpoints de criptografia (bônus)
app.post('/api/encrypt', handleEncrypt(null));
app.post('/api/encrypt-aes', handleEncrypt('aes-256-cbc'));

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Password Decryptor API'
    });
});

/**
 * Root
 */
app.get('/', (req, res) => {
    const publicIndexPath = path.join(__dirname, 'public', 'index.html');
    const rootIndexPath = path.join(__dirname, 'index.html');
    const indexPath = fs.existsSync(publicIndexPath) ? publicIndexPath : rootIndexPath;

    res.sendFile(indexPath);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
    console.log(`✓ API disponível em http://localhost:${PORT}/api`);
    console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
});

module.exports = app;
