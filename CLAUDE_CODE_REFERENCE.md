# 🔐 Password Decryptor - Referência Rápida para Claude Code

**Projeto:** Password Decryptor  
**Objetivo:** Ferramenta web para descriptografar senhas (3DES + MD5)  
**Status:** Pronto para deploy  
**Deploy:** Vercel (frontend) + Render (backend) + jm.dev.br  

---

## 📋 Resumo do Projeto

Aplicação Windows Forms (.NET) convertida para web moderna.

### O que faz?
- Recebe senha criptografada (hex ou base64)
- Deriv chave via MD5
- Descriptografa com 3DES-ECB
- Retorna senha em plaintext

### Stack
```
Frontend:  HTML + JS Vanilla + Bootstrap 5 CDN
Backend:   Node.js 18 + Express 4
Deploy:    Vercel (frontend) + Render (backend)
Domínio:   decrypt.jm.dev.br (Cloudflare DNS)
```

---

## 📁 Arquivos Criados

```
decrypt-app/
├── public/index.html              # Interface (formulário)
├── server.js                       # Backend Express + endpoints
├── package.json                    # Dependências (express, cors)
├── vercel.json                     # Config Vercel (rewrites p/ API)
├── .env.example                    # Vars de ambiente
├── .gitignore
├── README.md                       # Docs públicas
├── INSTRUCOES_CLAUDE.md            # Instruções detalhadas
├── DEPLOY_GUIDE.md                 # Passo a passo deploy
└── CLAUDE_CODE_REFERENCE.md        # Este arquivo
```

---

## 🔧 Setup Local

```bash
# Instalar
npm install

# Desenvolver
npm run dev
# Acesso: http://localhost:3001

# Testar
curl -X POST http://localhost:3001/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted":"6C573263ED19C30753BC43FD4654CB5B9603"}'
```

---

## 🌐 API Reference

### Decrypt Password
```
POST /api/decrypt

Input:
{
  "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",  // hex/base64
  "key": "DefaultKey123!@#"                             // opcional
}

Output:
{
  "success": true,
  "decrypted": "YourPassword123",
  "algorithm": "3DES-ECB + MD5",
  "keyUsed": "Custom"
}
```

### Encrypt Password (Bonus)
```
POST /api/encrypt

Input:
{
  "password": "MinhaSenha123",
  "key": "DefaultKey123!@#"
}

Output:
{
  "success": true,
  "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",
  "format": "hexadecimal"
}
```

### Health Check
```
GET /api/health

Output:
{
  "status": "ok",
  "service": "Password Decryptor API",
  "timestamp": "2026-07-27T..."
}
```

---

## 🚀 Deploy em 3 Passos

### 1️⃣ GitHub
```bash
git clone https://github.com/SEU_USER/password-decryptor.git
# Copiar arquivos
git push
```

### 2️⃣ Vercel (Frontend)
- Acessar https://vercel.com
- Import projeto GitHub
- Build: (vazio) | Output: `public`
- Deploy automático
- URL: `https://password-decryptor.vercel.app`

### 3️⃣ Render (Backend)
- Acessar https://render.com
- New Web Service
- GitHub → password-decryptor
- Start: `npm start`
- Env: `NODE_ENV=production`
- URL: `https://password-decryptor-api.onrender.com`

### 4️⃣ Cloudflare DNS
```
decrypt.jm.dev.br → CNAME → password-decryptor.vercel.app
decrypt-api.jm.dev.br → CNAME → password-decryptor-api.onrender.com
```

**Tempo total:** ~30 min | **Custo:** Grátis (com limitações em Render free)

---

## 🔐 Algoritmo Simplificado

```javascript
// Client
1. User enters: "6C573263ED19C30753BC43FD4654CB5B9603" (hex)
2. Sends to API: POST /api/decrypt

// Server
3. Parse Input → Buffer
4. Generate Key:
   - key1 = MD5("DefaultKey123!@#") → 16 bytes
   - key2 = MD5("DefaultKey123!@#Extended") → +8 bytes
   - finalKey = key1 + key2 → 24 bytes
5. Decrypt: 3DES-ECB(buffer, finalKey)
6. Return: UTF-8 plaintext

// Client
7. Display: "YourPassword123"
```

---

## 🎯 Melhorias Futuras (Backlog)

**Priority 1:**
- [ ] Rate limiting (100 req/min)
- [ ] Logging de tentativas falhadas
- [ ] Suporte a AES-256 (além de 3DES)

**Priority 2:**
- [ ] Modo batch (CSV upload)
- [ ] Histórico de descriptografias (DB + dashboard)
- [ ] Integração OAuth (PH3A)

**Priority 3:**
- [ ] PWA (offline support)
- [ ] Tema escuro
- [ ] Mobile app (React Native)

### Como Implementar

Use os prompts em `INSTRUCOES_CLAUDE.md` com Claude Code:

```markdown
# Prompt para AES Support

Contexto: Projeto de descriptografia. Atual: 3DES

Adicionar suporte a AES-256-CBC:
1. Novo endpoint POST /api/decrypt-aes
2. Aceitar {encrypted, key, iv}
3. Retornar {success, decrypted, algorithm}
4. Update HTML dropdown para algoritmo selecionável

Stack: Node crypto + Express
```

---

## 📚 Documentação

| Arquivo | Propósito | Para quem |
|---------|-----------|-----------|
| `README.md` | Overview + API | Público |
| `INSTRUCOES_CLAUDE.md` | Detalhe técnico completo | Developers |
| `DEPLOY_GUIDE.md` | Passo a passo deploy | DevOps |
| `CLAUDE_CODE_REFERENCE.md` | Quick reference | Claude Code |

---

## 🛠️ Dev Workflow

### Adicionar Nova Feature

1. **Branch local**
   ```bash
   git checkout -b feat/aes-support
   ```

2. **Editar código**
   ```bash
   # Exemplo: adicionar endpoint AES
   nano server.js
   npm run dev
   ```

3. **Testar**
   ```bash
   curl -X POST http://localhost:3001/api/decrypt-aes ...
   ```

4. **Push + Deploy automático**
   ```bash
   git add .
   git commit -m "feat: add AES-256 support"
   git push origin feat/aes-support
   # Vercel + Render redeploy automaticamente
   ```

---

## 🔍 Debugging

### Issue: API não responde

**Passo 1:** Health check
```bash
curl https://decrypt-api.onrender.com/api/health
# Se vazio/erro → Render está down
```

**Passo 2:** Logs
```bash
# Vercel: https://vercel.com/seu-user/password-decryptor/logs
# Render: Dashboard → Web Service → Logs tab
```

**Passo 3:** Redeploy
```bash
# Force redeploy (via dashboard ou git push)
git commit --allow-empty -m "chore: force redeploy"
git push
```

### Issue: "Falha na descriptografia"

**Verificar:**
1. Chave está correta?
2. Entrada é hex válido? (número par de chars)
3. Dados não estão corrompidos?

**Testar com curl:**
```bash
curl -X POST https://decrypt-api.onrender.com/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted":"6C573263ED19C30753BC43FD4654CB5B9603","key":"DefaultKey123!@#"}'
```

---

## 📊 Monitoramento

### Uptime
- Vercel: ~99.9% SLA (enterprise)
- Render: ~99.5% SLA (free tier pode dormir)

### Performance
- Frontend: ~200ms (CDN Vercel)
- Backend: ~100ms (decrypt) + network
- Total: ~300-500ms por request

### Limites
- Vercel: Unlimited requests
- Render Free: 750 compute hours/mês (~1000 reqs/dia)
- Render Starter: $7/mês, sem limits

---

## 💡 Tips & Tricks

1. **Usar variável de ambiente para chave:**
   ```bash
   # Em Render: adicionar DECRYPT_KEY=sua_chave
   # No código: const key = process.env.DECRYPT_KEY
   ```

2. **Testar localmente antes de deploy:**
   ```bash
   npm run dev
   # Testar todos endpoints
   # Depois fazer push
   ```

3. **Monitorar logs em tempo real:**
   ```bash
   # Render: Logs tab no dashboard (auto refresh)
   # Vercel: Similar
   ```

4. **Cache busting no Vercel:**
   ```bash
   # Se HTML/CSS não atualiza, fazer:
   # - Clear cache no Vercel dashboard
   # - Ou fazer hard refresh (Cmd+Shift+R)
   ```

---

## 🎓 Aprendizado

**O que este projeto ensina:**

- ✅ Conversão de desktop → web
- ✅ Criptografia em Node.js (`crypto` module)
- ✅ API REST com Express
- ✅ Deploy em produção (Vercel + Render)
- ✅ DNS + Cloudflare
- ✅ Frontend vanilla (sem framework)
- ✅ Arquitetura monorepo simples

**Próximos passos para portfolio:**

1. Adicionar autenticação (OAuth)
2. Adicionar banco de dados (Prisma + PostgreSQL)
3. Adicionar testes (Jest + Supertest)
4. Adicionar CI/CD (GitHub Actions)
5. Adicionar monitoring (Sentry)

---

## 📞 Referências Rápidas

```bash
# Node.js crypto
https://nodejs.org/api/crypto.html

# Express docs
https://expressjs.com

# Vercel deploy
https://vercel.com/docs/getting-started-with-vercel

# Render deploy
https://render.com/docs

# 3DES algorithm
https://en.wikipedia.org/wiki/Triple_DES

# Seu domínio
https://jm.dev.br
https://decrypt.jm.dev.br (quando deployado)
```

---

## ✅ Checklist Pre-Deploy

- [ ] `npm install` executa sem erro
- [ ] `npm run dev` inicia servidor
- [ ] Health check: `curl localhost:3001/api/health` retorna 200
- [ ] Decrypt teste funciona
- [ ] GitHub push funciona
- [ ] Vercel build bem-sucedido
- [ ] Render build bem-sucedido
- [ ] DNS propagou (test com `dig`)
- [ ] HTTPS funciona
- [ ] API proxy funciona (Vercel → Render)

---

## 🎉 Success Criteria

✨ Projeto completo quando:

- [ ] Live em https://decrypt.jm.dev.br
- [ ] API respondendo
- [ ] Descriptografia funcionando end-to-end
- [ ] Logs monitoráveis
- [ ] Documentação completa
- [ ] Adicionado ao portfólio
- [ ] Compartilhado com time (se relevante)

---

**Última atualização:** 2026-07-27  
**Versão:** 1.0.0  
**Autor:** Jonathan Martins

Para mais detalhes, consulte `INSTRUCOES_CLAUDE.md` ou `DEPLOY_GUIDE.md`.
