# 🔐 Password Decryptor

Ferramenta web para descriptografar senhas criptografadas com **3DES + MD5**.

Convertida de aplicação Windows Forms (.NET Framework 4.7.2) para web moderna com Node.js/Express e HTML puro.

## 🚀 Features

- ✅ Descriptografa senhas com 3DES-ECB
- ✅ Suporta múltiplos formatos de entrada (Hexadecimal, Base64, UTF-8)
- ✅ API REST documentada
- ✅ Interface responsiva (Bootstrap 5 + Oracle Redwood design)
- ✅ Chave customizável por requisição
- ✅ Criptografa senhas (endpoint bonus)
- ✅ Health check e diagnostics

## 🛠️ Stack

- **Backend:** Node.js 18 + Express 4
- **Frontend:** HTML5 + CSS3 + Vanilla JS
- **Cryptography:** `crypto` (Node.js built-in)
- **Styling:** Bootstrap 5 CDN + Custom CSS
- **Deploy:** Vercel (frontend) + Render (backend)

## 📦 Instalação

### Local Development

```bash
# 1. Clonar repositório
git clone https://github.com/seu-user/password-decryptor.git
cd password-decryptor

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env
cp .env.example .env

# 4. Rodar servidor
npm run dev
```

Acesse: http://localhost:3001

### Production Deploy

#### Vercel (Frontend)
```bash
# 1. Conectar repositório GitHub ao Vercel
# 2. Configurar build command: (deixar vazio)
# 3. Output directory: public
# 4. Deploy
```

#### Render (Backend)
```bash
# 1. Criar novo Web Service no Render
# 2. Conectar repositório
# 3. Build command: npm install
# 4. Start command: npm start
# 5. Adicionar variáveis de ambiente
# 6. Deploy
```

## 📖 API

### POST `/api/decrypt`

Descriptografa uma senha criptografada.

**Request:**
```json
{
  "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",
  "key": "DefaultKey123!@#"
}
```

**Response:**
```json
{
  "success": true,
  "decrypted": "YourPassword123",
  "algorithm": "3DES-ECB + MD5",
  "keyUsed": "Custom"
}
```

### POST `/api/encrypt`

Criptografa uma senha (bônus).

**Request:**
```json
{
  "password": "MinhaSenha123",
  "key": "DefaultKey123!@#"
}
```

**Response:**
```json
{
  "success": true,
  "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",
  "algorithm": "3DES-ECB + MD5",
  "format": "hexadecimal"
}
```

### GET `/api/health`

Health check da API.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-27T10:30:00.000Z",
  "service": "Password Decryptor API"
}
```

## 🔐 Algoritmo

```
Entrada (Hex/Base64)
    ↓
MD5(keyMaterial) → 16 bytes
MD5(keyMaterial + "Extended") → +8 bytes
    ↓
Chave total: 24 bytes
    ↓
3DES-ECB Decrypt
    ↓
Saída (UTF-8 plaintext)
```

## 📝 Exemplos de Uso

### Via cURL

```bash
# Descriptografar
curl -X POST http://localhost:3001/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",
    "key": "DefaultKey123!@#"
  }'

# Criptografar
curl -X POST http://localhost:3001/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MinhaSenha123",
    "key": "DefaultKey123!@#"
  }'
```

### Via JavaScript

```javascript
const response = await fetch('/api/decrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    encrypted: '6C573263ED19C30753BC43FD4654CB5B9603',
    key: 'DefaultKey123!@#'
  })
});

const data = await response.json();
console.log(data.decrypted); // YourPassword123
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `development` | Ambiente (development/production) |
| `PORT` | `3001` | Porta do servidor |
| `DECRYPT_KEY` | `DefaultKey123!@#` | Chave padrão para descriptografia |

## 📊 Estrutura do Projeto

```
├── public/
│   └── index.html          # Interface web
├── server.js               # Backend Express
├── package.json            # Dependências
├── .env.example            # Variáveis de exemplo
├── .gitignore              # Git ignore
├── vercel.json             # Config Vercel
├── INSTRUCOES_CLAUDE.md    # Instruções para Claude Code
└── README.md               # Este arquivo
```

## 🧪 Testes

```bash
# Teste de saúde
npm test

# Ou executar manual
npm run dev
# Depois testar em outro terminal:
curl http://localhost:3001/api/health
```

## 🐛 Troubleshooting

**Q: "Falha na descriptografia"**  
A: Verifique se a chave e o formato da entrada estão corretos.

**Q: "CORS error"**  
A: Certifique-se de que o backend está rodando e acessível.

**Q: "Hexadecimal deve ter número par de caracteres"**  
A: A string hexadecimal deve ter um número par de caracteres.

## 📚 Documentação Detalhada

Veja [INSTRUCOES_CLAUDE.md](./INSTRUCOES_CLAUDE.md) para:
- Deploy detalhado (Vercel + Render)
- Prompts para Claude Code
- Backlog de features
- Considerações de segurança

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

## 👤 Autor

**Jonathan Martins**
- 📧 jonathan@jm.dev.br
- 🌐 https://jm.dev.br
- 💼 IT Support Analyst → Full-Stack Developer

---

**Desenvolvido com ❤️ como portfolio project**
