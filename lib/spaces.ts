import AWS from 'aws-sdk';
import fs from 'fs/promises';
import path from 'path';
import { spacesConfig } from './spaces-config';

export async function uploadScreenshotToSpaces(
  localFilePath: string, 
  fileName: string, 
  folder: string = 'screenshots'
) {
  try {
    // Configurar S3 client com credenciais diretas
    const spacesEndpoint = new AWS.Endpoint(spacesConfig.endpoint);
    
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: spacesConfig.accessKeyId,
      secretAccessKey: spacesConfig.secretAccessKey,
      region: spacesConfig.region,
      s3ForcePathStyle: false,
      signatureVersion: 'v4'
    });
    
    console.log('Configuração Spaces:', {
      accessKey: spacesConfig.accessKeyId.substring(0, 10) + '...',
      endpoint: spacesConfig.endpoint,
      bucket: spacesConfig.bucket,
      region: spacesConfig.region
    });
    
    // Ler arquivo local
    const fileBuffer = await fs.readFile(localFilePath);
    
    // Definir parâmetros para upload
    const uploadParams = {
      Bucket: spacesConfig.bucket,
      Key: `${folder}/${fileName}`,
      Body: fileBuffer,
      ContentType: 'image/png',
      ACL: 'public-read' // Tornar a imagem pública
    };

    // Fazer upload
    const result = await s3.upload(uploadParams).promise();
    
    console.log('Arquivo enviado com sucesso para Spaces:', result.Location);
    
    // Retornar URL pública
    return result.Location;
    
  } catch (error) {
    console.error('Erro ao enviar arquivo para Spaces:', error);
    throw error;
  }
}

export async function deleteScreenshotFromSpaces(fileName: string, folder: string = 'screenshots') {
  try {
    // Configurar S3 client
    const spacesEndpoint = new AWS.Endpoint(spacesConfig.endpoint);
    
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: spacesConfig.accessKeyId,
      secretAccessKey: spacesConfig.secretAccessKey,
      region: spacesConfig.region,
      s3ForcePathStyle: false,
      signatureVersion: 'v4'
    });
    
    const deleteParams = {
      Bucket: spacesConfig.bucket,
      Key: `${folder}/${fileName}`
    };

    await s3.deleteObject(deleteParams).promise();
    console.log('Arquivo deletado do Spaces:', fileName);
    
  } catch (error) {
    console.error('Erro ao deletar arquivo do Spaces:', error);
    throw error;
  }
}

// Função helper para extrair nome do arquivo da URL do Spaces
export function getFileNameFromSpacesUrl(url: string): string {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1];
}