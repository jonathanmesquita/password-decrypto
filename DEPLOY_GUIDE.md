# 📋 Guia de Deploy - Password Decryptor em jm.dev.br

Passo a passo para colocar a ferramenta no ar em seu domínio.

---

## ✅ Pré-requisitos

- [ ] Conta GitHub (para repositório)
- [ ] Conta Vercel (para frontend) - https://vercel.com
- [ ] Conta Render (para backend) - https://render.com
- [ ] Acesso Cloudflare (jm.dev.br já configurado)
- [ ] Git instalado localmente

---

## 🔴 PASSO 1: GitHub - Criar Repositório

### 1.1 Criar repositório em GitHub

```bash
# Acessar GitHub e criar novo repositório
# Nome: password-decryptor
# Descrição: Ferramenta web para descriptografar senhas com 3DES + MD5
# Visibilidade: Public (para portfolio)
```

### 1.2 Clonar e fazer push

```bash
# Clonar o repositório vazio
git clone https://github.com/SEU_USER/password-decryptor.git
cd password-decryptor

# Copiar todos os arquivos do projeto
# (Copiar o conteúdo de /home/claude/decrypt-app para aqui)

# Fazer commit inicial
git add .
git commit -m "feat: initial commit - password decryptor app"
git push -u origin main
```

---

## 🟠 PASSO 2: Vercel - Deploy Frontend

### 2.1 Conectar repositório Vercel

1. Acessar https://vercel.com/dashboard
2. Clicar em "Add New..." → "Project"
3. Selecionar "Import Git Repository"
4. Autenticação GitHub → Selecionar repositório `password-decryptor`

### 2.2 Configurar projeto Vercel

```
Project Name: password-decryptor
Framework Preset: Other
Build Command: (deixar vazio)
Output Directory: public
Environment Variables:
  (nenhuma necessária por enquanto)
```

### 2.3 Deploy

1. Clicar "Deploy"
2. Aguardar ~2 minutos
3. Obter URL: `https://password-decryptor.vercel.app`

---

## 🟡 PASSO 3: Render - Deploy Backend

### 3.1 Criar novo Web Service

1. Acessar https://dashboard.render.com
2. Clicar "New" → "Web Service"
3. Conectar GitHub → Selecionar repositório
4. Configurar:

```
Name: password-decryptor-api
Runtime: Node
Build Command: npm install
Start Command: npm start
Environment: Production
Region: (sua região mais próxima)
```

### 3.2 Adicionar Variáveis de Ambiente

Em "Environment" adicionar:

```
NODE_ENV = production
DECRYPT_KEY = DefaultKey123!@#
```

Opcional: Se quiser usar chave customizada:
```
DECRYPT_KEY = SUA_CHAVE_SEGURA_AQUI
```

### 3.3 Deploy

1. Clicar "Create Web Service"
2. Aguardar build (~3-5 min)
3. Obter URL: `https://password-decryptor-api.onrender.com`

---

## 🟢 PASSO 4: Cloudflare DNS - Apontar Domínios

### 4.1 Adicionar registros DNS

Acessar Cloudflare Dashboard → jm.dev.br → DNS Records

**Para Frontend (Vercel):**
```
Name: decrypt
Type: CNAME
Content: cname.vercel-dns.com
Proxied: On (nuvem laranja)
TTL: Auto
```

**Para Backend (Render):**
```
Name: decrypt-api
Type: CNAME
Content: decrypt-api.onrender.com
Proxied: Off (nuvem cinza)
TTL: Auto
```

### 4.2 Validar DNS

```bash
# Aguarde 5-10 minutos para propagação
# Depois teste:
nslookup decrypt.jm.dev.br
nslookup decrypt-api.jm.dev.br

# Deve retornar os CNAMEs configurados
```

---

## 🔵 PASSO 5: Atualizar URLs no Frontend

### 5.1 Editar arquivo de configuração

No arquivo `public/index.html`, procure por:

```javascript
const API_URL = '/api';
```

Isso já está correto! O Vercel será configurado para fazer proxy das chamadas de API.

### 5.2 Verificar vercel.json

O arquivo `vercel.json` já contém:

```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "https://decrypt-api.onrender.com/api/$1"
  }
]
```

Isso faz automaticamente o proxy de `/api/decrypt` para `https://decrypt-api.onrender.com/api/decrypt`.

### 5.3 Fazer push

```bash
# Se tiver alterações
git add public/index.html vercel.json
git commit -m "fix: update api endpoints"
git push
```

Vercel fará redeploy automaticamente.

---

## 🟣 PASSO 6: Testar Tudo

### 6.1 Teste de acesso

```bash
# Frontend
curl https://decrypt.jm.dev.br
# Deve retornar HTML da aplicação

# Backend
curl https://decrypt-api.onrender.com/api/health
# Deve retornar: {"status":"ok","service":"Password Decryptor API",...}
```

### 6.2 Teste completo (descriptografia)

```bash
curl -X POST https://decrypt-api.onrender.com/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted": "6C573263ED19C30753BC43FD4654CB5B9603",
    "key": "DefaultKey123!@#"
  }'

# Resposta esperada:
# {"success":true,"decrypted":"YourPassword123",...}
```

### 6.3 Teste via navegador

1. Abrir https://decrypt.jm.dev.br
2. Colar: `6C573263ED19C30753BC43FD4654CB5B9603`
3. Deixar "Chave/Salt" vazio (usa padrão)
4. Clicar "Descriptografar"
5. Resultado deve aparecer na caixa de resultado

---

## 📊 Monitoramento

### Vercel Logs
```
https://vercel.com/seu-user/password-decryptor/deployments
```

### Render Logs
```
https://dashboard.render.com → Web Service → password-decryptor-api → Logs
```

### Health Check Automático

Para monitorar se tudo está funcionando:

```bash
# Criar script de health check (opcional)
# Executar a cada 5 minutos via cron ou GitHub Actions

curl -s https://decrypt-api.onrender.com/api/health | grep "ok"
```

---

## 🆘 Troubleshooting

### Problema: "API não responde"

**Solução:**
```bash
# 1. Verificar se Render está rodando
curl https://decrypt-api.onrender.com/api/health

# 2. Checar logs no Render Dashboard
# 3. Se vazio, fazer push novamente (trigger redeploy)

git add .
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

### Problema: "CORS error no frontend"

**Solução:**
- Verificar se `vercel.json` está configurado corretamente
- Fazer redeploy do Vercel:
  - Acessar https://vercel.com/seu-user/password-decryptor
  - Clicar em último deployment
  - Clicar "Redeploy"

### Problema: "DNS ainda não propagou"

**Solução:**
- Aguarde 5-10 minutos
- Usar ping com IP direto:
```bash
dig decrypt.jm.dev.br
# Deve retornar IP do Vercel
```

### Problema: "Render entra em sleep"

**Solução (apenas se usar plano free):**
- Render coloca apps em sleep após 15 min inativo
- Primeira requisição leva ~30s para acordar
- Upgrade para Starter ($7/mês) para evitar isso

---

## ✨ Depois do Deploy

### 1. Adicionar ao Portfólio

Atualizar `https://jm.dev.br`:
```markdown
## 🔐 Password Decryptor

Ferramenta web para descriptografar senhas com 3DES + MD5.
Convertida de aplicação Windows Forms para web moderna.

- **Live:** https://decrypt.jm.dev.br
- **Repo:** https://github.com/seu-user/password-decryptor
- **Stack:** Node.js/Express + Vercel + Render
```

### 2. Documentar no GitHub

- [ ] Adicionar `INSTRUCOES_CLAUDE.md` ao README
- [ ] Adicionar badges de status
- [ ] Adicionar screenshots/GIFs

### 3. Configurar CI/CD (Opcional)

Criar `.github/workflows/test.yml` para testes automáticos em cada push.

---

## 🚀 Próximos Steps

1. **Testar em produção**
2. **Compartilhar com equipe PH3A** (se relevante)
3. **Adicionar ao Arriba Platform** como ferramenta auxiliar
4. **Implementar melhorias** (veja `INSTRUCOES_CLAUDE.md`)

---

## 📞 Suporte

Se tiver dúvidas:

1. Consultar `INSTRUCOES_CLAUDE.md` (detalhes técnicos)
2. Consultar `README.md` (documentação)
3. Verificar logs em Vercel/Render
4. Consultar documentação oficial:
   - https://vercel.com/docs
   - https://render.com/docs

---

**Tempo estimado:** 30 minutos  
**Custo:** $0-7/mês (Render Starter se quiser remover sleep)  
**Resultado:** App em produção em seu domínio! 🎉
