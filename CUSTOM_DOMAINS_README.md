# Sistema de Domínios Customizados - HubFi

## Visão Geral

Sistema completo para gerenciar domínios customizados usando Cloudflare Workers, KV e SSL for SaaS.

## Como Funciona

1. **Usuário adiciona domínio** em `/hubpage/domains`
2. **API cria Custom Hostname** no Cloudflare
3. **Worker KV é atualizado** com configuração do domínio
4. **Usuário configura DNS** apontando CNAME para `customers.eduardoborges.dev.br`
5. **Cloudflare valida DNS e emite certificado SSL** automaticamente
6. **Domínio fica ativo** e serve conteúdo do DigitalOcean Spaces

## Antes de Começar

### 1. Pegar Account ID do Cloudflare

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. No menu lateral → **Workers & Pages**
3. No lado direito, copie o **Account ID**
4. Atualize no [.env](./.env):
   ```bash
   CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
   ```

### 2. Criar CNAME Target

1. Acesse seu domínio no Cloudflare: [eduardoborges.dev.br](https://dash.cloudflare.com/80ad44160b1ef7d1051abd9af998891c)
2. Menu lateral → **DNS** → **Records**
3. Clique em **Add record**
4. Configure:
   ```
   Type: CNAME
   Name: customers
   Target: eduardoborges.dev.br
   Proxy status: Proxied (nuvem laranja ativada)
   TTL: Auto
   ```
5. Clique em **Save**

### 3. Habilitar SSL for SaaS

1. No dashboard do Cloudflare
2. Selecione seu domínio
3. **SSL/TLS** → **Custom Hostnames**
4. Clique em **Enable** ou **Get Started**

## Deploy do Worker

Execute na pasta `cloudflare-worker`:

```bash
cd cloudflare-worker
npx wrangler deploy
```

Isso vai fazer o deploy do Worker que roteia requisições dos domínios customizados para o DigitalOcean Spaces.

## Usando o Sistema

### 1. Adicionar Domínio Customizado

1. Acesse `/hubpage/domains` na aplicação
2. Clique em **Adicionar domínio**
3. Digite o domínio (ex: `minhaloja.com` ou `loja.minhaempresa.com`)
4. Clique em **Adicionar**

### 2. Configurar DNS do Cliente

O cliente precisa criar um registro CNAME no painel DNS dele:

```
Type: CNAME
Name: @ (para domínio raiz) ou subdomínio (ex: loja)
Target: customers.eduardoborges.dev.br
TTL: Auto ou 3600
```

**Exemplos:**
- Para `minhaloja.com` → Name: `@`
- Para `loja.minhaempresa.com` → Name: `loja`

### 3. Validar DNS

1. Aguarde propagação do DNS (5 minutos a 24 horas)
2. Na página de domínios, clique em **Validar DNS**
3. Se configurado corretamente, verá "DNS configurado corretamente"

### 4. Aguardar SSL

O Cloudflare vai emitir o certificado SSL automaticamente:
- Pode levar de alguns minutos até 24 horas
- Status muda de "Pending" para "Active"
- Quando ambos (Status e SSL) estiverem "Active", o domínio está funcionando

## Estrutura de Arquivos

### API Routes

- `app/api/custom-domains/route.ts` - Listar e adicionar domínios
- `app/api/custom-domains/[id]/route.ts` - Buscar, atualizar e deletar domínio
- `app/api/custom-domains/validate-dns/route.ts` - Validar configuração de DNS

### Páginas

- `app/hubpage/domains/page.tsx` - Interface de gerenciamento de domínios

### Tipos

- `app/types/custom-domain.ts` - Tipos TypeScript para domínios

### Utilitários

- `app/lib/cloudflare.ts` - Funções para comunicação com Cloudflare API

### Worker

- `cloudflare-worker/src/index.js` - Worker que roteia requisições
- `cloudflare-worker/wrangler.toml` - Configuração do Worker

## Variáveis de Ambiente

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=seu_token_aqui
CLOUDFLARE_ZONE_ID=seu_zone_id_aqui
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
CLOUDFLARE_KV_NAMESPACE_ID=94496b4f6c0d4b228861d046e6b3dc57
CUSTOM_DOMAIN_CNAME_TARGET=customers.eduardoborges.dev.br

# Digital Ocean Spaces
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=produtivi
DO_SPACES_ACCESS_KEY=sua_access_key
DO_SPACES_SECRET_KEY=sua_secret_key
```

## Fluxo de Dados

```
Cliente acessa: https://minhaloja.com
              ↓
DNS resolve para: customers.eduardoborges.dev.br
              ↓
Cloudflare recebe requisição
              ↓
Worker busca config no KV
              ↓
Worker busca HTML no DigitalOcean Spaces
              ↓
Worker retorna HTML para o cliente
```

## Estrutura no DigitalOcean Spaces

```
produtivi/
  presells/
    minhaloja.com/
      index.html
      assets/
        styles.css
        script.js
      images/
        logo.png
```

## Troubleshooting

### Erro: "CLOUDFLARE_ACCOUNT_ID not configured"
- Você precisa adicionar o Account ID no arquivo `.env`
- Veja seção "Pegar Account ID" acima

### Erro: "Invalid hostname format"
- Verifique se o domínio está no formato correto
- Exemplos válidos: `exemplo.com`, `loja.exemplo.com`, `app.minhaloja.com.br`
- Não inclua `http://`, `https://` ou `/` no final

### DNS não valida
- Verifique se o CNAME está configurado corretamente
- Use ferramentas online: [dnschecker.org](https://dnschecker.org)
- Aguarde mais tempo (propagação pode levar até 24h)

### SSL Status "Pending"
- Aguarde - certificado pode levar até 24h para ser emitido
- Verifique se DNS está configurado corretamente
- Se passar de 24h, verifique erros na API do Cloudflare

### Erro 522 (Connection Timed Out)
- Verifique credenciais do DigitalOcean Spaces
- Verifique se os arquivos existem no Spaces
- Verifique ACL dos arquivos (devem ser `public-read`)

## Comandos Úteis

```bash
# Listar domínios cadastrados
curl http://localhost:3000/api/custom-domains?userId=1

# Adicionar domínio
curl -X POST http://localhost:3000/api/custom-domains \
  -H "Content-Type: application/json" \
  -d '{"hostname": "teste.com", "userId": 1}'

# Validar DNS
curl -X POST http://localhost:3000/api/custom-domains/validate-dns \
  -H "Content-Type: application/json" \
  -d '{"hostname": "teste.com"}'

# Ver logs do Worker
cd cloudflare-worker
npx wrangler tail

# Atualizar Worker
npx wrangler deploy
```

## Próximos Passos

- [ ] Adicionar autenticação real (substituir userId hardcoded)
- [ ] Criar banco de dados para armazenar relacionamento userId ↔ domínio
- [ ] Implementar webhook do Cloudflare para atualizar status automaticamente
- [ ] Adicionar monitoramento e alertas
- [ ] Implementar renovação automática de certificados
- [ ] Adicionar painel de analytics por domínio

## Suporte

Se tiver problemas:
1. Verifique os logs do Worker: `npx wrangler tail`
2. Verifique status no dashboard do Cloudflare
3. Consulte a documentação: [Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
