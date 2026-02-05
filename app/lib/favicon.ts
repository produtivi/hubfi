/**
 * Gera URL do favicon usando Google Favicon API
 * Usa a API melhor do Google que tem fallback automático
 * @param url - URL da página de vendas do produtor
 * @param size - Tamanho do favicon em pixels (padrão: 64)
 * @returns URL do favicon
 */
export function getFaviconUrl(url: string, size: number = 64): string {
  try {
    const parsedUrl = new URL(url);
    const origin = parsedUrl.origin;

    // Usar a API do Google Favicon V2 que tem melhor fallback
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=${size}`;
  } catch (error) {
    console.error('Erro ao extrair domínio da URL:', error);
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://example.com&size=${size}`;
  }
}

/**
 * Baixa o favicon e salva localmente
 * @param url - URL da página de vendas do produtor
 * @param presellId - ID da presell para nomear o arquivo
 * @returns Caminho local do favicon salvo ou null se falhar
 */
export async function downloadAndSaveFavicon(url: string, presellId: number): Promise<string | null> {
  try {
    const faviconUrl = getFaviconUrl(url, 64);

    // Fazer download do favicon
    const response = await fetch(faviconUrl);
    if (!response.ok) {
      console.error('Erro ao baixar favicon:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salvar no Digital Ocean Spaces
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
      region: process.env.DO_SPACES_REGION || 'nyc3',
      credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY || ''
      }
    });

    const key = `favicons/presell-${presellId}-favicon.png`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET || '',
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: 'image/png'
    }));

    // Retornar URL pública
    const publicUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${key}`;
    return publicUrl;

  } catch (error) {
    console.error('Erro ao baixar e salvar favicon:', error);
    return null;
  }
}
