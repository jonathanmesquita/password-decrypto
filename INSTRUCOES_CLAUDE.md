# 🔐 Descriptografador de Senhas - Instruções para Claude Code

**Projeto:** `password-decryptor`  
**Status:** Produção (jm.dev.br)  
**Stack:** Node.js/Express (Backend) + HTML/CSS/JS (Frontend)  
**Algoritmo:** 3DES-ECB com chave derivada por MD5  

---

## 📋 Contexto Técnico

### Origem
- Convertido de aplicação Windows Forms (.NET 4.7.2)
- Original: `WindowsFormsApp1.exe` (11 KB)
- Algoritmo identificado: `TripleDESCryptoServiceProvider` + `MD5CryptoServiceProvider`

### Fluxo de Funcionamento

```
[Entrada] (Hex/Base64)
    ↓
[Parse Input] → Buffer
    ↓
[Generate Key] → MD5(keyMaterial) + MD5(keyMaterial + "Extended")
    ↓
[Decrypt] → 3DES-ECB com chave de 24 bytes
    ↓
[Saída] → Plaintext UTF-8
```

### Specs Técnicas
- **Algoritmo:** Triple DES (DES-EDE3)
- **Modo:** ECB (Electronic Code Book)
- **Derivação de chave:** MD5 (16 bytes) + 8 bytes extras
- **Chave total:** 24 bytes
- **Entrada aceita:** Hexadecimal, Base64, UTF-8
- **Saída:** UTF-8 (plaintext)

---

## 🚀 Deploy

### Vercel (Frontend - Recomendado)
```bash
# 1. Conectar repositório GitHub
# 2. Framework: "Other"
# 3. Build command: (deixar vazio)
# 4. Output directory: "public"

# Arquivo: vercel.json
{
  "buildCommand": "",
  "outputDirectory": "public",
  "cleanUrls": false
}
```

**URL:** `https://decrypt.jm.dev.br`

### Render (Backend - Node.js)
```bash
# 1. Criar novo Web Service
# 2. Conectar repositório
# 3. Environment: Node.js
# 4. Build command: npm install
# 5. Start command: npm start
# 6. Environment variables:
#    - NODE_ENV=production
#    - DECRYPT_KEY=SUA_CHAVE_AQUI (opcional)

# Add-on: PostgreSQL (não necessário por enquanto)
```

**URL:** `https://decrypt-api.onrender.com`

### Cloudflare DNS (jm.dev.br)
```
decrypt.jm.dev.br → CNAME → decrypt.vercel.app
decrypt-api.jm.dev.br → CNAME → decrypt-api.onrender.com

# Ou usar Vercel+Render juntos com proxy no Vercel
```

---

## 📁 Estrutura do Projeto

```
decrypt-app/
├── public/
│   ├── index.html          # Interface web (formulário)
│   ├── tokens.css          # Variáveis de design (Oracle Redwood)
│   └── style.css           # (importado em index.html)
├── server.js               # Backend Express
├── package.json            # Dependências
├── INSTRUCOES_CLAUDE.md    # Este arquivo
├── vercel.json             # Config Vercel
├── .env                    # Variáveis de ambiente (local)
├── .gitignore
└── README.md               # Documentação pública
```

---

## 🔧 Desenvolvimento Local

### Setup
```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env
echo "NODE_ENV=development" > .env
echo "PORT=3001" >> .env

# 3. Rodar em desenvolvimento
npm run dev
```

**URL Local:** http://localhost:3001

### Testes Manuais

#### Teste 1: Descriptografar (Hexadecimal)
```bash
curl -X POST http://localhost:3001/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",
    "key": "DefaultKey123!@#"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "decrypted": "YourPassword123",
  "algorithm": "3DES-ECB + MD5",
  "keyUsed": "Custom"
}
```

#### Teste 2: Descriptografar (Base64)
```bash
curl -X POST http://localhost:3001/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted": "bFcyY+0ZwwdTvEP9RlTLW5YD"
  }'
```

#### Teste 3: Criptografar (Bonus)
```bash
curl -X POST http://localhost:3001/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MinhaSenha123",
    "key": "DefaultKey123!@#"
  }'
```

#### Health Check
```bash
curl http://localhost:3001/api/health
```

---

## 🐛 Troubleshooting

### Erro: "Falha na descriptografia"
**Causa:** Chave incorreta ou dados corrompidos  
**Solução:**
- Verificar se a chave MD5 está correta
- Testar com chave padrão
- Validar se entrada é hex/base64 válido

### Erro: "Hexadecimal deve ter número par de caracteres"
**Causa:** String hex com número ímpar de chars  
**Solução:**
- Contar chars da entrada: `echo "6C5..." | wc -c`
- Adicionar "0" no início se necessário

### Erro: "Entrada inválida"
**Causa:** Campo vazio ou tipo errado  
**Solução:**
- Não deixar campo em branco
- Usar string válida (hex ou base64)

### CORS Error
**Causa:** Frontend em domínio diferente do backend  
**Solução:**
- Usar proxy no Vercel
- Configurar CORS no Express (já feito)
- Testar com `curl` primeiro

---

## 📝 Melhorias Futuras (Backlog)

- [ ] Suporte a outros algoritmos (AES, RSA, etc)
- [ ] Interface para gerar chaves
- [ ] Histórico de descriptografias (IndexedDB)
- [ ] Modo batch (múltiplas senhas)
- [ ] Integração com OAuth (PH3A)
- [ ] Teste de segurança (OWASP)
- [ ] PWA (Progressive Web App)
- [ ] Tema escuro
- [ ] Suporte a mobile app (React Native)

---

## 📚 Prompts para Claude Code

### Prompt 1: Adicionar Suporte a AES
```markdown
# Adicionar suporte a AES-256-CBC

Contexto: Projeto de descriptografia de senhas (3DES). Preciso expandir para suportar AES.

Requisitos:
1. Adicionar endpoint POST /api/decrypt-aes
2. Aceitar: encrypted (hex/base64), key (string), iv (opcional)
3. Usar AES-256-CBC com PKCS#7 padding
4. Retornar JSON: {success, decrypted, algorithm, keyUsed}
5. Atualizar HTML para adicionar campo "Algoritmo" com dropdown

Entrada esperada:
- Hexadecimal: 48F8C3E7D1A2B9F5...
- Chave: "SuaChaveAES256Aqui"

Saída esperada:
- Plaintext descriptografado

Stack: Node.js crypto + Express
```

### Prompt 2: Modo Batch com Upload CSV
```markdown
# Adicionar modo batch para descriptografar múltiplas senhas

Contexto: Usuários precisam descriptografar listas de senhas (CSV).

Requisitos:
1. Novo endpoint POST /api/decrypt-batch (aceita JSON ou arquivo CSV)
2. Entrada: array de {encrypted, key} ou upload de CSV
3. Processamento: paralelo (Promise.all) com limite de 10 concurrent
4. Saída: JSON com array de {encrypted, decrypted, status, error}
5. Interface: novo form para upload + preview antes de processar
6. Download resultado em CSV ou JSON

Exemplo de entrada CSV:
```
encrypted,key
6C573263ED19C30753BC43FD4654CB5B9603,DefaultKey
...
```

Validações:
- Máximo 1000 linhas
- Máximo 10 MB de arquivo
- Timeout 30s por item
```

### Prompt 3: Integração com Banco de Dados
```markdown
# Adicionar persistência com PostgreSQL

Contexto: Rastrear histórico de descriptografias para auditoria/segurança.

Requisitos:
1. Tabela: descriptografacoes (id, encrypted_hash, timestamp, usuario, status)
2. Usar Prisma ORM com Render PostgreSQL
3. Novo endpoint GET /api/history (com autenticação)
4. Histórico paginado (20 itens/página)
5. Dashboard com gráficos (Chart.js)
6. Filtro por data range + status

Não guardar senhas descriptografadas (apenas hash + metadados)
```

---

## 🔐 Segurança

### Considerações
- ⚠️ 3DES é legado; considerar migração para AES em novo código
- ✅ CORS habilitado apenas para jm.dev.br
- ✅ Sem persistência de senhas
- ⚠️ ECB mode é menos seguro (considerar CBC/GCM)
- ✅ Input validation em todos endpoints
- ✅ Error messages genéricas (não expor detalhes internos)

### Recomendações
```
[ ] Implementar rate limiting (100 req/min por IP)
[ ] Adicionar logging de tentativas falhadas
[ ] Usar HTTPS sempre (Vercel + Render fazem automaticamente)
[ ] Considerar autenticação (token API)
[ ] Audit log de todas as descriptografias
```

---

## 📞 Contato & Links

**Desenvolvedor:** Jonathan Martins  
**Email:** jonathan@jm.dev.br  
**Portfólio:** https://jm.dev.br  
**Projeto:** https://decrypt.jm.dev.br  

---

**Última atualização:** 2026-07-27  
**Versão:** 1.0.0  
**Mantido por:** Jonathan Martins / Arriba Platform
