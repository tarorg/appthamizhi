import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnvVars = [
  'PUBLIC_CLOUDFLARE_ACCOUNT_ID',
  'PUBLIC_R2_ACCESS_KEY_ID',
  'PUBLIC_R2_SECRET_ACCESS_KEY',
  'PUBLIC_R2_BUCKET_NAME',
  'PUBLIC_R2_DOMAIN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  throw new Error('Missing required environment variables');
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${import.meta.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.PUBLIC_R2_SECRET_ACCESS_KEY,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    console.log('Received FormData:', Object.fromEntries(formData.entries()));

    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    const contentType = formData.get('contentType') as string;

    if (!file || !filename || !contentType) {
      console.error('Missing required fields:', { file, filename, contentType });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('Creating PutObjectCommand with:', {
      Bucket: import.meta.env.PUBLIC_R2_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
    });

    const command = new PutObjectCommand({
      Bucket: import.meta.env.PUBLIC_R2_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `https://${import.meta.env.PUBLIC_R2_DOMAIN}/${filename}`;

    console.log('Generated signed URL:', signedUrl);
    console.log('Public URL:', publicUrl);

    return new Response(JSON.stringify({ signedUrl, publicUrl, filename, contentType }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in /api/test:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
};