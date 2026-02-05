# Playwright em Produção

## Problema

O erro indica que o Playwright não tem os binários do navegador instalados no ambiente de produção:

```
Executable doesn't exist at /workspace/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell
```

## Soluções

### Opção 1: Instalar Playwright no Build (Recomendado para Vercel/Render)

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "postinstall": "playwright install chromium --with-deps || true"
  }
}
```

### Opção 2: Dockerfile (Para Docker/Custom Deploy)

```dockerfile
FROM node:20-alpine

# Instalar dependências do Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar variáveis de ambiente
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_USE_SANDBOX=false

# ... resto do Dockerfile
```

### Opção 3: Desabilitar Screenshots em Produção

Se não conseguir instalar Playwright, a aplicação agora funciona sem screenshots.

Adicione ao `.env.production`:

```bash
# Desabilitar screenshots se Playwright não estiver disponível
DISABLE_SCREENSHOTS=true
```

## Configuração Atual

A aplicação já está preparada para funcionar sem screenshots:

1. ✅ Screenshots são opcionais - presells são criadas mesmo se falhar
2. ✅ Verificação automática se Playwright está disponível
3. ✅ Retorna `null` para screenshots quando não disponível
4. ✅ Processo assíncrono - não bloqueia criação da presell

## Performance

### Antes
- Criação da presell: ~15-30 segundos (esperando screenshots)
- Bloqueava resposta da API

### Agora
- Criação da presell: **~1-2 segundos** (instantâneo)
- Screenshots processados em background
- API retorna imediatamente

## Variáveis de Ambiente

```bash
# Desabilitar sandbox do Chromium (necessário em alguns ambientes)
PLAYWRIGHT_USE_SANDBOX=false

# URL base da aplicação (para callbacks internos)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```
