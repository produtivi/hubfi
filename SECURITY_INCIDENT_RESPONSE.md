# 🚨 Resposta ao Incidente de Segurança - Cryptojacking Attack

## Resumo do Ataque

Sua aplicação foi comprometida com um ataque de **RCE (Remote Code Execution)** que resultou na instalação de um minerador de criptomoedas (XMRig).

### Vetor de Ataque Identificado

A vulnerabilidade estava no endpoint `/api/presells/[id]/regenerate-screenshot` que:
1. Aceitava URLs sem validação adequada
2. Usava Playwright com `--no-sandbox`
3. Permitia execução de JavaScript arbitrário
4. Não tinha whitelist de domínios permitidos

### Credenciais Expostas

As seguintes credenciais foram **EXPOSTAS PUBLICAMENTE** nos logs:

- ❌ Digital Ocean Spaces Access Key
- ❌ Digital Ocean Spaces Secret Key
- ❌ PostgreSQL Database Password
- ❌ Google OAuth Client Secret

## ✅ Correções Implementadas

### 1. Validação de URL (`app/lib/url-validator.ts`)
- ✅ Whitelist de domínios permitidos (apenas plataformas conhecidas)
- ✅ Bloqueio de IPs internos (SSRF protection)
- ✅ Detecção de command injection
- ✅ Bloqueio de protocolos maliciosos (file://, javascript:, data:)

### 2. Proteção do Playwright (`app/lib/screenshot.ts`)
- ✅ Sandbox habilitado por padrão
- ✅ Bloqueio de recursos suspeitos (mineradores)
- ✅ Filtragem de requisições (apenas document, stylesheet, image, font)
- ✅ Timeout de 30 segundos
- ✅ CSP (Content Security Policy) respeitado

### 3. Middleware de Segurança (`middleware.ts`)
- ✅ Rate limiting (100 req/min por IP)
- ✅ Detecção de command injection
- ✅ Detecção de padrões de mineração
- ✅ Auto-bloqueio de IPs maliciosos
- ✅ Validação de User-Agent
- ✅ Logs de auditoria

### 4. Validação nos Endpoints
- ✅ `/api/presells` - Valida URLs antes de salvar
- ✅ `/api/presells/[id]/regenerate-screenshot` - Valida URLs antes de screenshot

## 🔥 AÇÕES URGENTES NECESSÁRIAS

### Prioridade 1: ROTACIONAR CREDENCIAIS (FAÇA AGORA!)

#### Digital Ocean Spaces
1. Acesse: https://cloud.digitalocean.com/account/api/spaces_access_keys
2. **DELETE** as chaves comprometidas:
   - Access Key: `DO00DA7H49LLVCYR8TPV`
   - Secret Key: `1u7uK6UdeLDybgMI4X21+DTz0UAgzpoa15+j7AbrJ50`
3. Gere novas chaves
4. Atualize as variáveis de ambiente no Digital Ocean App Platform

#### PostgreSQL Database
1. Acesse o cluster: `hubfi-do-user-3820793-0`
2. Altere a senha do usuário `doadmin`
3. Atualize a `DATABASE_URL` com a nova senha

#### Google OAuth
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Regenere o Client Secret para: `699187309644-s1ht0m0r3otgfsi6dvqapt7cs64kt9c2`
3. Atualize `GOOGLE_CLIENT_SECRET`

### Prioridade 2: LIMPAR O SERVIDOR

```bash
# Acesse o pod/container via Digital Ocean console ou doctl
doctl apps logs <app-id> --follow

# Se tiver acesso SSH/shell ao container:
rm -rf /workspace/moneroocean
rm -f /workspace/xor.txt
rm -f /workspace/cookies.txt
pkill -9 xmrig
```

### Prioridade 3: REBUILD DA APLICAÇÃO

```bash
# No seu ambiente local
cd /home/borges/git/produtive/hubfi

# Commit das correções de segurança
git add .
git commit -m "security: fix RCE vulnerability and add security protections

- Add URL validation with whitelist
- Enable Playwright sandbox
- Add security middleware
- Block cryptomining attempts
- Add rate limiting"

# Push para forçar rebuild
git push origin hub-title+login

# Force rebuild no Digital Ocean
doctl apps create-deployment <app-id>
```

### Prioridade 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

No Digital Ocean App Platform, configure:

```bash
# REMOVER (não usar --no-sandbox em produção)
# PLAYWRIGHT_USE_SANDBOX=false

# ADICIONAR as novas credenciais rotacionadas
DATABASE_URL=<nova-url-com-senha-nova>
DO_SPACES_ACCESS_KEY=<nova-access-key>
DO_SPACES_SECRET_KEY=<nova-secret-key>
GOOGLE_CLIENT_SECRET=<novo-client-secret>
```

## 🛡️ Proteções Adicionais Recomendadas

### 1. Web Application Firewall (WAF)
Configure Cloudflare ou AWS WAF na frente da aplicação:
- Rate limiting mais robusto
- Proteção contra DDoS
- Filtragem de bots maliciosos

### 2. Monitoramento e Alertas
Configure alertas para:
- Uso anormal de CPU (mineração)
- Requisições bloqueadas pelo middleware
- Tentativas de acesso a `/api/presells/*/regenerate-screenshot`
- IPs bloqueados automaticamente

### 3. Auditoria de Logs
- Configure logs centralizados (Papertrail, Logtail, etc.)
- Monitore padrões suspeitos
- Alerte sobre comandos shell nos logs

### 4. Secrets Management
Use um gerenciador de secrets ao invés de variáveis de ambiente:
- Digital Ocean App Platform Secrets
- HashiCorp Vault
- AWS Secrets Manager

### 5. Container Security
- Rode containers como usuário não-root
- Use imagens Docker oficiais e atualizadas
- Scan de vulnerabilidades com Snyk ou Trivy

## 📊 Checklist de Resposta ao Incidente

- [ ] Rotacionar TODAS as credenciais expostas
- [ ] Deletar chaves antigas do Digital Ocean
- [ ] Alterar senha do banco de dados
- [ ] Regenerar Client Secret do Google OAuth
- [ ] Remover malware do servidor (moneroocean, xmrig, xor.txt)
- [ ] Fazer commit das correções de segurança
- [ ] Push para produção
- [ ] Force rebuild da aplicação
- [ ] Atualizar variáveis de ambiente
- [ ] Verificar que não há processos xmrig rodando
- [ ] Revisar logs de acesso dos últimos 7 dias
- [ ] Verificar se há presells com URLs suspeitas no banco
- [ ] Configurar alertas de segurança
- [ ] Documentar o incidente para auditoria
- [ ] Considerar adicionar WAF (Cloudflare)

## 🔍 Análise Forense

### Evidências do Ataque

1. **Execução de comandos shell:**
   - `printenv` - Expôs variáveis de ambiente
   - `ls /workspace` - Listou diretório da aplicação
   - `find / -type f -iname ".env"` - Procurou por arquivos sensíveis
   - `id` - Verificou permissões do usuário

2. **Instalação de malware:**
   - Download do XMRig miner
   - Criação do diretório `moneroocean`
   - Arquivos: `xor.txt`, `cookies.txt`

3. **Tentativas de persistência:**
   - Múltiplos processos "Killed" (OOM por uso de CPU)
   - Tentativas de usar `bc` e `killall`

### Lições Aprendidas

1. **Nunca confie em input de usuário** - Sempre valide URLs
2. **Whitelist > Blacklist** - Use whitelist de domínios permitidos
3. **Sandbox é essencial** - Nunca desabilite sandbox em produção
4. **Credenciais nos logs** - Configure logs para não expor secrets
5. **Rate limiting** - Previne abuso de endpoints custosos

## 📞 Contato

Se precisar de ajuda adicional:
- Digital Ocean Support: https://www.digitalocean.com/support
- Security disclosure: security@digitalocean.com

---

**Data do Incidente:** 2026-01-18 a 2026-01-20
**Severidade:** CRÍTICA
**Status:** Em remediação
