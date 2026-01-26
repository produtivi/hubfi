

export default {
     async fetch(request, env, ctx) {
          const url = new URL(request.url);
          const hostname = url.hostname;

          // Health check
          if (url.pathname === '/_health') {
               return new Response('OK', {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' }
               });
          }

          // Buscar configuração do domínio no KV
          const domainConfig = await env.DOMAINS_KV.get(hostname, { type: 'json' });

          if (!domainConfig) {
               return createErrorResponse(
                    'Domain Not Configured',
                    `O domínio ${hostname} não está configurado no HubFi.`,
                    404
               );
          }

          if (!domainConfig.active) {
               return createErrorResponse(
                    'Domain Pending Validation',
                    'Este domínio está aguardando validação DNS. Por favor, verifique se o CNAME está configurado corretamente.',
                    403
               );
          }

          // Determinar path no Digital Ocean Spaces
          let path = url.pathname;

          // Se termina com /, adiciona index.html
          if (path.endsWith('/')) {
               path += 'index.html';
          }

          // Se não tem extensão, adiciona /index.html
          const lastSegment = path.substring(path.lastIndexOf('/'));
          if (!lastSegment.includes('.')) {
               path += '/index.html';
          }

          // Construir URL do Spaces
          // Formato: presells/{domain}/{path}
          const spacesPath = `presells/${hostname}${path}`;
          const spacesUrl = `https://${domainConfig.bucket}.${env.DO_SPACES_ENDPOINT}/${spacesPath}`;

          console.log(`[Router] ${hostname}${url.pathname} → ${spacesUrl}`);

          // Fetch do Digital Ocean Spaces
          const spacesResponse = await fetch(spacesUrl, {
               cf: {
                    cacheTtl: 3600,
                    cacheEverything: true
               }
          });

          if (!spacesResponse.ok) {
               // Tentar fallback: /index.html na raiz do domínio
               const fallbackUrl = `https://${domainConfig.bucket}.${env.DO_SPACES_ENDPOINT}/presells/${hostname}/index.html`;
               const fallbackResponse = await fetch(fallbackUrl);

               if (!fallbackResponse.ok) {
                    return createErrorResponse(
                         'Page Not Found',
                         `A página ${url.pathname} não foi encontrada.`,
                         404
                    );
               }

               return createHtmlResponse(fallbackResponse, hostname);
          }

          return createHtmlResponse(spacesResponse, hostname);
     }
};

/**
 * Cria resposta HTML otimizada
 */
function createHtmlResponse(originalResponse, hostname) {
     const headers = new Headers(originalResponse.headers);

     // Otimizar cache
     headers.set('Cache-Control', 'public, max-age=86400'); // 24h

     // Headers de segurança
     headers.set('X-Content-Type-Options', 'nosniff');
     headers.set('X-Frame-Options', 'SAMEORIGIN');
     headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

     // Custom headers
     headers.set('X-Served-By', 'HubFi');
     headers.set('X-Domain', hostname);

     // Remover headers desnecessários do S3
     headers.delete('X-Amz-Request-Id');
     headers.delete('X-Amz-Id-2');

     return new Response(originalResponse.body, {
          status: originalResponse.status,
          headers
     });
}

/**
 * Cria resposta de erro customizada
 */
function createErrorResponse(title, message, status) {
     const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }
    p {
      font-size: 1.1rem;
      opacity: 0.8;
      line-height: 1.6;
    }
    a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${status}</h1>
    <h2>${title}</h2>
    <p>${message}</p>
    <p style="margin-top: 2rem; font-size: 0.9rem;">
      Powered by <a href="https://hubfi.com">HubFi</a>
    </p>
  </div>
</body>
</html>
  `;

     return new Response(html, {
          status,
          headers: {
               'Content-Type': 'text/html; charset=utf-8'
          }
     });
}