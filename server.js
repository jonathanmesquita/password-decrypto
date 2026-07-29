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
 * Endpoint POST /api/decrypt
 */
app.post('/api/decrypt', (req, res) => {
    try {
        const { encrypted, key } = req.body;

        if (!encrypted || typeof encrypted !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Campo "encrypted" é obrigatório e deve ser string'
            });
        }

        // Parse da entrada (hex, base64, etc)
        let encryptedBuffer;
        try {
            encryptedBuffer = parseInput(encrypted);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                error: `Erro ao processar entrada: ${parseError.message}`
            });
        }

        // Usar chave fornecida ou padrão
        const keyMaterial = key || DEFAULT_KEY;

        // Descriptografar
        const decrypted = decryptPassword(encryptedBuffer, keyMaterial);

        // Retornar resultado
        res.json({
            success: true,
            decrypted: decrypted.trim(),
            algorithm: '3DES-ECB + MD5',
            keyUsed: key ? 'Custom' : 'Default'
        });

    } catch (error) {
        console.error('Erro na descriptografia:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * Endpoint POST /api/encrypt (bônus)
 */
app.post('/api/encrypt', (req, res) => {
    try {
        const { password, key } = req.body;

        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Campo "password" é obrigatório'
            });
        }

        const keyMaterial = key || DEFAULT_KEY;
        const desKey = generateDesKey(keyMaterial);

        // Encriptar
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
});

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
