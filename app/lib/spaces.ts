// DigitalOcean Spaces functionality
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';

// Configuração do DigitalOcean Spaces
const spacesClient = new S3Client({
  region: 'nyc3',
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || ''
  }
});

const BUCKET_NAME = 'produtivi';
const CDN_URL = 'https://produtivi.nyc3.cdn.digitaloceanspaces.com';

export async function uploadToSpaces(file: Buffer, filename: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `screenshots/${filename}`,
      Body: file,
      ACL: 'public-read',
      ContentType: 'image/png'
    });

    await spacesClient.send(command);
    
    // Retornar URL do CDN para melhor performance
    return `${CDN_URL}/screenshots/${filename}`;
    
  } catch (error) {
    console.error('Erro ao fazer upload para Spaces:', error);
    throw new Error('Falha no upload para Spaces');
  }
}

export async function uploadScreenshotToSpaces(filePath: string, filename: string): Promise<string> {
  // Lê o arquivo local
  const fileBuffer = await fs.readFile(filePath);
  
  // Upload usando a função principal
  return await uploadToSpaces(fileBuffer, filename);
}

export function generateSpacesUrl(filename: string): string {
  return `${CDN_URL}/screenshots/${filename}`;
}