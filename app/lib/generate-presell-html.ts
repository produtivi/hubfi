import { getPresellTemplate } from './presell-templates';

interface PresellData {
  id: number;
  pageName: string;
  faviconUrl: string | null;
  screenshotDesktop: string | null;
  screenshotMobile: string | null;
  affiliateLink: string;
  presellType: string;
  language: string;
}

/**
 * Gera HTML estático da presell
 */
export function generatePresellHTML(presell: PresellData): string {
  const template = getPresellTemplate(presell.presellType, presell.language);

  // Determinar se deve mostrar modal
  const showModal = [
    'Cookies',
    'Maior de Idade',
    'Sexo',
    'Idade Homem',
    'Idade Mulher',
    'Assinar newsletter',
    'País',
    'Player de vídeo',
    'Teste de captcha'
  ].includes(presell.presellType);

  return `<!DOCTYPE html>
<html lang="${presell.language === 'Português' ? 'pt-BR' : presell.language === 'Inglês' ? 'en' : 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presell.pageName}</title>
  ${presell.faviconUrl ? `<link rel="icon" href="${presell.faviconUrl}">` : ''}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }

    .page-container {
      min-height: 100vh;
      position: relative;
      margin: 0;
      padding: 0;
    }

    .screenshot-background {
      min-height: 100vh;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #f3f4f6;
      overflow: hidden;
    }

    .screenshot-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      object-position: top left;
      z-index: 1;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 100;
      cursor: pointer;
    }

    .modal-content {
      background-color: white;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      text-align: center;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      color: #000;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      font-size: 24px;
      line-height: 1;
    }

    .modal-title {
      font-size: 24px;
      font-weight: 600;
      color: #000;
      margin-bottom: 16px;
      margin-top: 0;
    }

    .modal-text {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .modal-button {
      background-color: #000;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      width: 100%;
    }

    .modal-button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="screenshot-background">
      ${presell.screenshotDesktop ? `<img src="${presell.screenshotDesktop}" alt="Preview" class="screenshot-img">` : ''}
    </div>

    ${showModal && template ? `
    <div class="modal-overlay" onclick="redirect()">
      <div class="modal-content" onclick="redirect()">
        <button class="modal-close" onclick="redirect()">×</button>
        <h2 class="modal-title">${(template as any).title || 'Continue para acessar'}</h2>
        <p class="modal-text">${(template as any).text || 'Clique no botão abaixo para continuar'}</p>
        <button class="modal-button" onclick="redirect()">
          ${(template as any).accept || (template as any).button || 'Continuar'}
        </button>
      </div>
    </div>
    ` : ''}
  </div>

  <script>
    function redirect() {
      window.location.href = '${presell.affiliateLink}';
    }

    // Se não tiver modal, redirecionar direto após 2 segundos
    ${!showModal ? `setTimeout(redirect, 2000);` : ''}
  </script>
</body>
</html>`;
}

/**
 * Salva HTML no Digital Ocean Spaces
 */
export async function savePresellHTML(presell: PresellData): Promise<string | null> {
  try {
    const html = generatePresellHTML(presell);
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
      region: process.env.DO_SPACES_REGION || 'nyc3',
      credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY || ''
      }
    });

    const key = `presells/presell-${presell.id}.html`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET || '',
      Key: key,
      Body: Buffer.from(html, 'utf-8'),
      ACL: 'public-read',
      ContentType: 'text/html; charset=utf-8'
    }));

    const publicUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${key}`;
    console.log(`[HTML] Presell HTML salvo: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    console.error('[HTML] Erro ao salvar presell HTML:', error);
    return null;
  }
}
