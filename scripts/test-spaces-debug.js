const AWS = require('aws-sdk');

// Debug detalhado
async function debugSpaces() {
  console.log('=== DEBUG SPACES ===\n');
  
  // Verificar formato das credenciais
  const accessKey = 'DO00DA7H49LLVCYR8TPV';
  const secretKey = '1u7uK6UdeLDybgMI4X21+DTz0UAgzpoa15+j7AbrJ50';
  
  console.log('Access Key ID:', accessKey);
  console.log('Access Key Length:', accessKey.length);
  console.log('Secret Key Length:', secretKey.length);
  console.log('Secret Key Format:', secretKey.substring(0, 10) + '...' + secretKey.substring(secretKey.length - 5));
  
  // Verificar se as credenciais parecem válidas
  if (!accessKey.startsWith('DO')) {
    console.log('\n⚠️  Access Key não começa com "DO" - pode estar incorreta');
  }
  
  if (accessKey.length < 15) {
    console.log('\n⚠️  Access Key parece muito curta');
  }
  
  console.log('\n=== TENTANDO CONEXÃO ===\n');
  
  try {
    const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
    
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: 'nyc3',
      signatureVersion: 'v4',
      s3ForcePathStyle: false
    });
    
    // Tentar operação simples
    const result = await s3.headBucket({
      Bucket: 'produtivi'
    }).promise();
    
    console.log('✅ Bucket acessível!');
    
  } catch (error) {
    console.log('❌ Erro detalhado:');
    console.log('Message:', error.message);
    console.log('Code:', error.code);
    console.log('Status:', error.statusCode);
    console.log('Request ID:', error.requestId);
    
    if (error.code === 'InvalidAccessKeyId') {
      console.log('\n🔑 Problema: Access Key ID inválida ou não reconhecida');
      console.log('Verifique se a chave está correta no painel do DigitalOcean');
    }
  }
}

debugSpaces();