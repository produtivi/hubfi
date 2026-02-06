import { uploadToSpaces } from './spaces';

interface ReviewHTMLInput {
  id: number;
  pageName: string;
  productName: string;
  faviconUrl: string | null;
  affiliateLink: string;
  headline: string | null;
  subheadline: string | null;
  introduction: string | null;
  benefits: string | null; // JSON string
  features: string | null; // JSON string
  whoIsItFor: string | null;
  callToAction: string | null;
  language: string;
}

function getDefaultCtaText(language: string): string {
  const texts: Record<string, string> = {
    'Português': 'QUERO GARANTIR MEU ACESSO AGORA',
    'Inglês': 'GET ACCESS NOW',
    'Espanhol': 'QUIERO MI ACCESO AHORA'
  };
  return texts[language] || texts['Português'];
}

function getSectionTitles(language: string) {
  const titles: Record<string, { benefits: string; features: string; whoIsItFor: string }> = {
    'Português': {
      benefits: 'O Que Você Vai Conquistar',
      features: 'O Que Está Incluso',
      whoIsItFor: 'Para Quem É Este Produto?'
    },
    'Inglês': {
      benefits: 'What You Will Achieve',
      features: 'What\'s Included',
      whoIsItFor: 'Who Is This For?'
    },
    'Espanhol': {
      benefits: 'Lo Que Vas a Lograr',
      features: 'Qué Está Incluido',
      whoIsItFor: '¿Para Quién Es Este Producto?'
    }
  };
  return titles[language] || titles['Português'];
}

export async function saveReviewHTML(input: ReviewHTMLInput): Promise<string | null> {
  try {
    const benefits = input.benefits ? JSON.parse(input.benefits) : [];
    const features = input.features ? JSON.parse(input.features) : [];
    const ctaText = input.callToAction || getDefaultCtaText(input.language);
    const sectionTitles = getSectionTitles(input.language);

    const html = `<!DOCTYPE html>
<html lang="${input.language === 'Português' ? 'pt-BR' : input.language === 'Espanhol' ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.pageName}</title>
  ${input.faviconUrl ? `<link rel="icon" href="${input.faviconUrl}" type="image/x-icon">` : ''}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f8f9fa;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .header p {
      font-size: 1.25rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.75rem;
      }
      .header p {
        font-size: 1rem;
      }
    }

    /* Content Section */
    .content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .content h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #1a1a1a;
    }

    .content p {
      color: #444;
      margin-bottom: 16px;
      line-height: 1.8;
    }

    /* Benefits and Features Grid */
    .grid-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 32px 0;
    }

    @media (max-width: 768px) {
      .grid-section {
        grid-template-columns: 1fr;
      }
    }

    .benefits-box, .features-box {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .benefits-box h3, .features-box h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      margin-bottom: 20px;
      color: #1a1a1a;
    }

    .benefits-box ul, .features-box ul {
      list-style: none;
    }

    .benefits-box li, .features-box li {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: #444;
    }

    .benefits-box li:last-child, .features-box li:last-child {
      border-bottom: none;
    }

    .benefits-box li::before {
      content: "✓";
      color: #059669;
      font-weight: bold;
      flex-shrink: 0;
    }

    .features-box li::before {
      content: "★";
      color: #F59E0B;
      font-weight: bold;
      flex-shrink: 0;
    }

    /* Who Is It For Section */
    .who-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
      color: white;
      border-radius: 16px;
      padding: 40px;
      margin-bottom: 32px;
      text-align: center;
    }

    .who-section h2 {
      font-size: 1.75rem;
      margin-bottom: 20px;
    }

    .who-section p {
      font-size: 1.125rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.8;
    }

    /* CTA Section */
    .cta-section {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 20px 48px;
      font-size: 1.25rem;
      font-weight: 700;
      text-decoration: none;
      border-radius: 50px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px rgba(5, 150, 105, 0.4);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(5, 150, 105, 0.5);
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>${input.headline || input.productName}</h1>
      <p>${input.subheadline || ''}</p>
    </div>
  </header>

  <main class="container">
    <section class="content" style="margin-top: 32px;">
      <p>${input.introduction || ''}</p>
    </section>

    <div class="grid-section">
      <div class="benefits-box">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          ${sectionTitles.benefits}
        </h3>
        <ul>
          ${benefits.map((benefit: string) => `<li>${benefit}</li>`).join('')}
        </ul>
      </div>

      <div class="features-box">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          ${sectionTitles.features}
        </h3>
        <ul>
          ${features.map((feature: string) => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
    </div>

    <section class="who-section">
      <h2>${sectionTitles.whoIsItFor}</h2>
      <p>${input.whoIsItFor || ''}</p>
    </section>

    <section class="cta-section">
      <a href="${input.affiliateLink}" class="cta-button" target="_blank" rel="noopener">
        ${ctaText}
      </a>
    </section>
  </main>

  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} - Todos os direitos reservados</p>
  </footer>

  <script>
    // Track clicks
    document.querySelector('.cta-button').addEventListener('click', function() {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
          'event_category': 'CTA',
          'event_label': 'Product Summary CTA Click'
        });
      }
    });
  </script>
</body>
</html>`;

    // Salvar no Spaces
    const filename = `review-${input.id}.html`;
    const htmlBuffer = Buffer.from(html, 'utf-8');

    // Upload para Spaces como HTML
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const spacesClient = new S3Client({
      region: 'nyc3',
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY || ''
      }
    });

    const command = new PutObjectCommand({
      Bucket: 'produtivi',
      Key: `reviews/${filename}`,
      Body: htmlBuffer,
      ACL: 'public-read',
      ContentType: 'text/html; charset=utf-8'
    });

    await spacesClient.send(command);

    const htmlUrl = `https://produtivi.nyc3.cdn.digitaloceanspaces.com/reviews/${filename}`;
    console.log(`[Review HTML] Salvo em: ${htmlUrl}`);

    return htmlUrl;

  } catch (error) {
    console.error('[Review HTML] Erro ao gerar HTML:', error);
    return null;
  }
}
