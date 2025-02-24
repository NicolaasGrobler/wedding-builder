import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

if (!process.env.NEXT_PUBLIC_R2_ACCOUNT_ID || !process.env.R2_API_TOKEN || !process.env.NEXT_PUBLIC_R2_BUCKET || !process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY) {
  console.error('R2 configuration missing:', {
    accountId: process.env.NEXT_PUBLIC_R2_ACCOUNT_ID,
    apiToken: process.env.R2_API_TOKEN,
    bucket: process.env.NEXT_PUBLIC_R2_BUCKET,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });
  throw new Error('Missing R2 environment variables');
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(file: File, key: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  await r2.send(command);
  return `https://${process.env.PUBLIC_R2_DOMAIN}/${key}`;
}

export default r2;