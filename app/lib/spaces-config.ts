// DigitalOcean Spaces configuration

export const spacesConfig = {
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'nyc3',
  bucket: 'produtivi',
  accessKeyId: process.env.DO_SPACES_KEY || '',
  secretAccessKey: process.env.DO_SPACES_SECRET || '',
};