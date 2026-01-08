const AWS = require('aws-sdk');

// Configuração direta
const spacesConfig = {
  accessKeyId: 'DO00DA7H49LLVCY',
  secretAccessKey: 'DO00DA7H49LLVCYR8TPV',
  endpoint: 'nyc3.digitaloceanspaces.com',
  bucket: 'produtivi',
  region: 'nyc3'
};

async function testSpaces() {
  try {
    console.log('Testando conexão com DigitalOcean Spaces...\n');
    
    // Configurar S3
    const spacesEndpoint = new AWS.Endpoint(spacesConfig.endpoint);
    
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: spacesConfig.accessKeyId,
      secretAccessKey: spacesConfig.secretAccessKey,
      region: spacesConfig.region,
      s3ForcePathStyle: false,
      signatureVersion: 'v4'
    });
    
    console.log('Configuração:', {
      accessKey: spacesConfig.accessKeyId.substring(0, 10) + '...',
      endpoint: spacesConfig.endpoint,
      bucket: spacesConfig.bucket
    });
    
    // Testar listando objetos
    console.log('\nListando objetos no bucket...');
    const result = await s3.listObjectsV2({
      Bucket: spacesConfig.bucket,
      MaxKeys: 5,
      Prefix: 'screenshots/'
    }).promise();
    
    console.log(`\nEncontrados ${result.KeyCount} objetos:`);
    result.Contents?.forEach(obj => {
      console.log(`- ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
    });
    
    console.log('\n✅ Conexão com Spaces funcionando!');
    
  } catch (error) {
    console.error('\n❌ Erro ao conectar com Spaces:', error.message);
    console.error('Código:', error.code);
    console.error('Status:', error.statusCode);
  }
}

testSpaces();