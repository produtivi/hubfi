#!/bin/bash

echo "🔒 HubFi Security Cleanup Script"
echo "=================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar processos suspeitos
echo -e "${YELLOW}1. Verificando processos suspeitos...${NC}"
if pgrep -f "xmrig" > /dev/null; then
    echo -e "${RED}⚠️  XMRig detectado! Matando processo...${NC}"
    pkill -9 -f "xmrig"
else
    echo -e "${GREEN}✓ Nenhum processo de mineração detectado${NC}"
fi

# 2. Remover diretórios maliciosos
echo -e "\n${YELLOW}2. Removendo diretórios maliciosos...${NC}"
MALICIOUS_DIRS=("moneroocean" ".xmrig" "xmr-stak")
for dir in "${MALICIOUS_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${RED}⚠️  Removendo $dir${NC}"
        rm -rf "$dir"
    fi
done
echo -e "${GREEN}✓ Diretórios limpos${NC}"

# 3. Remover arquivos suspeitos
echo -e "\n${YELLOW}3. Removendo arquivos suspeitos...${NC}"
MALICIOUS_FILES=("xor.txt" "cookies.txt" ".xmrig.json" "config.json")
for file in "${MALICIOUS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${RED}⚠️  Removendo $file${NC}"
        rm -f "$file"
    fi
done
echo -e "${GREEN}✓ Arquivos limpos${NC}"

# 4. Verificar conexões de rede suspeitas
echo -e "\n${YELLOW}4. Verificando conexões de rede suspeitas...${NC}"
if command -v netstat &> /dev/null; then
    SUSPICIOUS_PORTS=$(netstat -tunlp 2>/dev/null | grep -E ":(3333|4444|5555|8080|14444|14433)" | grep -v grep)
    if [ -n "$SUSPICIOUS_PORTS" ]; then
        echo -e "${RED}⚠️  Portas suspeitas abertas:${NC}"
        echo "$SUSPICIOUS_PORTS"
    else
        echo -e "${GREEN}✓ Nenhuma porta suspeita detectada${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  netstat não disponível${NC}"
fi

# 5. Verificar cron jobs maliciosos
echo -e "\n${YELLOW}5. Verificando cron jobs...${NC}"
if crontab -l 2>/dev/null | grep -E "(xmrig|monero|miner|curl.*sh)" > /dev/null; then
    echo -e "${RED}⚠️  Cron jobs suspeitos detectados!${NC}"
    crontab -l | grep -E "(xmrig|monero|miner|curl.*sh)"
else
    echo -e "${GREEN}✓ Nenhum cron job suspeito${NC}"
fi

# 6. Verificar permissões de arquivos críticos
echo -e "\n${YELLOW}6. Verificando permissões de arquivos...${NC}"
if [ -f "package.json" ]; then
    PERMS=$(stat -c "%a" package.json 2>/dev/null || stat -f "%A" package.json 2>/dev/null)
    if [ "$PERMS" != "644" ] && [ "$PERMS" != "664" ]; then
        echo -e "${YELLOW}⚠️  Permissões incomuns em package.json: $PERMS${NC}"
    else
        echo -e "${GREEN}✓ Permissões OK${NC}"
    fi
fi

# 7. Verificar .env para exposição
echo -e "\n${YELLOW}7. Verificando segurança do .env...${NC}"
if [ -f ".env" ]; then
    if [ "$(stat -c "%a" .env 2>/dev/null || stat -f "%A" .env 2>/dev/null)" = "644" ]; then
        echo -e "${YELLOW}⚠️  .env está muito permissivo! Ajustando...${NC}"
        chmod 600 .env
    fi
    echo -e "${GREEN}✓ .env protegido${NC}"
else
    echo -e "${YELLOW}⚠️  .env não encontrado${NC}"
fi

# 8. Verificar integridade do package.json
echo -e "\n${YELLOW}8. Verificando package.json...${NC}"
if grep -E "(xmrig|monero|coinhive)" package.json > /dev/null 2>&1; then
    echo -e "${RED}⚠️  Dependências suspeitas encontradas em package.json!${NC}"
else
    echo -e "${GREEN}✓ package.json limpo${NC}"
fi

# 9. Listar arquivos modificados recentemente (últimas 24h)
echo -e "\n${YELLOW}9. Arquivos modificados nas últimas 24h:${NC}"
find . -type f -mtime -1 -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" 2>/dev/null | head -20

# 10. Resumo e recomendações
echo -e "\n${YELLOW}=================================="
echo "📋 AÇÕES NECESSÁRIAS:"
echo -e "==================================${NC}"
echo ""
echo "1. ⚠️  ROTACIONE IMEDIATAMENTE todas as credenciais:"
echo "   - Digital Ocean Spaces (Access Key + Secret)"
echo "   - Database PostgreSQL (senha do doadmin)"
echo "   - Google OAuth (Client Secret)"
echo ""
echo "2. 🔍 Analise os logs da aplicação para identificar a origem do ataque"
echo ""
echo "3. 🚀 Redeploy da aplicação com o novo middleware de segurança"
echo ""
echo "4. 📊 Configure monitoramento de segurança (ex: fail2ban, cloudflare)"
echo ""
echo "5. 🔐 Ative 2FA em todas as contas de serviço"
echo ""
echo -e "${GREEN}Script finalizado!${NC}"
