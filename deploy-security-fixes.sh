#!/bin/bash

echo "🔒 HubFi - Deploy de Correções de Segurança"
echo "==========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar que estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script da raiz do projeto.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Arquivos de segurança criados:${NC}"
echo "  ✓ middleware.ts - Middleware de segurança"
echo "  ✓ app/lib/url-validator.ts - Validação de URLs"
echo "  ✓ app/lib/screenshot.ts - Playwright com sandbox"
echo "  ✓ app/api/presells/route.ts - Validação de URLs"
echo "  ✓ app/api/presells/[id]/regenerate-screenshot/route.ts - Proteção RCE"
echo "  ✓ SECURITY_INCIDENT_RESPONSE.md - Documentação do incidente"
echo "  ✓ security-cleanup.sh - Script de limpeza"
echo "  ✓ .env.example - Exemplo de variáveis seguras"
echo ""

# 2. Verificar status do git
echo -e "${YELLOW}🔍 Verificando status do repositório...${NC}"
if ! git status &>/dev/null; then
    echo -e "${RED}❌ Erro: Este não é um repositório git.${NC}"
    exit 1
fi

# 3. Mostrar arquivos modificados
echo -e "\n${BLUE}📝 Arquivos modificados:${NC}"
git status --short

# 4. Confirmar com o usuário
echo ""
read -p "$(echo -e ${YELLOW}Deseja fazer commit e push das correções de segurança? [s/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}⚠️  Operação cancelada pelo usuário.${NC}"
    exit 0
fi

# 5. Fazer commit
echo -e "\n${BLUE}📦 Fazendo commit das correções...${NC}"
git add \
  middleware.ts \
  app/lib/url-validator.ts \
  app/lib/screenshot.ts \
  app/api/presells/route.ts \
  app/api/presells/[id]/regenerate-screenshot/route.ts \
  app/api/pixels/[pixelId]/track/route.ts \
  SECURITY_INCIDENT_RESPONSE.md \
  security-cleanup.sh \
  .env.example

git commit -m "security: fix RCE vulnerability and cryptojacking attack

CRITICAL SECURITY FIXES:
- Add URL validation with domain whitelist
- Enable Playwright sandbox by default
- Add security middleware with rate limiting
- Block command injection attempts
- Block cryptomining patterns (XMRig, Monero)
- Auto-block malicious IPs
- Add comprehensive security logging

AFFECTED ENDPOINTS:
- /api/presells - Now validates URLs before saving
- /api/presells/[id]/regenerate-screenshot - Protected against RCE

ATTACK VECTOR CLOSED:
- Remote Code Execution via malicious URLs in screenshot endpoint
- Cryptojacking with XMRig miner installation

See SECURITY_INCIDENT_RESPONSE.md for full incident details.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer commit.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Commit realizado com sucesso!${NC}"

# 6. Push para o repositório
echo -e "\n${BLUE}🚀 Fazendo push para o repositório...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Branch atual: ${YELLOW}${CURRENT_BRANCH}${NC}"

git push origin "$CURRENT_BRANCH"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer push.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"

# 7. Instruções finais
echo ""
echo -e "${GREEN}==========================================="
echo "✅ CORREÇÕES DE SEGURANÇA DEPLOYADAS!"
echo -e "===========================================${NC}"
echo ""
echo -e "${YELLOW}🔥 AÇÕES CRÍTICAS RESTANTES:${NC}"
echo ""
echo "1. ⚠️  ROTACIONE IMEDIATAMENTE as credenciais:"
echo "   a) Digital Ocean Spaces Keys"
echo "   b) PostgreSQL Database Password"
echo "   c) Google OAuth Client Secret"
echo ""
echo "2. 🧹 Limpe o servidor de produção:"
echo "   - Acesse o container via Digital Ocean console"
echo "   - Execute: rm -rf /workspace/moneroocean"
echo "   - Execute: rm -f /workspace/xor.txt /workspace/cookies.txt"
echo "   - Execute: pkill -9 xmrig"
echo ""
echo "3. 🔄 Force rebuild no Digital Ocean App Platform:"
echo "   - Acesse: https://cloud.digitalocean.com/apps"
echo "   - Selecione sua aplicação"
echo "   - Clique em 'Create Deployment'"
echo ""
echo "4. 🔐 Atualize as variáveis de ambiente com as NOVAS credenciais"
echo ""
echo "5. 📊 Monitore os logs para atividade suspeita:"
echo "   - doctl apps logs <app-id> --follow"
echo ""
echo -e "${BLUE}📖 Leia SECURITY_INCIDENT_RESPONSE.md para mais detalhes.${NC}"
echo ""
