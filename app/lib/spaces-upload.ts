// Utilitário para upload de arquivos no DigitalOcean Spaces

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
  region: process.env.DO_SPACES_REGION || 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || '',
  },
});

interface UploadOptions {
  bucket?: string;
  contentType?: string;
  cacheControl?: string;
  acl?: 'private' | 'public-read';
}

/**
 * Faz upload de conteúdo para o DigitalOcean Spaces
 */
export async function uploadToSpaces(
  key: string,
  content: string | Buffer,
  options: UploadOptions = {}
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const bucket = options.bucket || process.env.DO_SPACES_BUCKET || 'produtivi';
    const contentType = options.contentType || 'text/html; charset=utf-8';
    const cacheControl = options.cacheControl || 'public, max-age=86400';
    const acl = options.acl || 'public-read';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: typeof content === 'string' ? Buffer.from(content, 'utf-8') : content,
      ContentType: contentType,
      CacheControl: cacheControl,
      ACL: acl,
    });

    await s3Client.send(command);

    const url = `https://${bucket}.${process.env.DO_SPACES_ENDPOINT}/${key}`;

    return { success: true, url };
  } catch (error) {
    console.error('Erro ao fazer upload no Spaces:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Faz upload de HTML de presell para domínio customizado
 */
export async function uploadPresellToCustomDomain(
  hostname: string,
  pagePath: string,
  htmlContent: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Garantir que pagePath tem extensão .html
  const fileName = pagePath.endsWith('.html') ? pagePath : `${pagePath}.html`;

  // Path no Spaces: presells/{hostname}/{fileName}
  const key = `presells/${hostname}/${fileName}`;

  return uploadToSpaces(key, htmlContent, {
    contentType: 'text/html; charset=utf-8',
  });
}

/**
 * Faz upload de arquivo index.html para domínio customizado
 */
export async function uploadIndexToCustomDomain(
  hostname: string,
  htmlContent: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const key = `presells/${hostname}/index.html`;

  return uploadToSpaces(key, htmlContent, {
    contentType: 'text/html; charset=utf-8',
  });
}
