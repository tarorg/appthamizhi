// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server', // Change this from 'static' to 'server'
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    define: {
      'import.meta.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID': JSON.stringify(process.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID),
      'import.meta.env.PUBLIC_R2_ACCESS_KEY_ID': JSON.stringify(process.env.PUBLIC_R2_ACCESS_KEY_ID),
      'import.meta.env.PUBLIC_R2_SECRET_ACCESS_KEY': JSON.stringify(process.env.PUBLIC_R2_SECRET_ACCESS_KEY),
      'import.meta.env.PUBLIC_R2_BUCKET_NAME': JSON.stringify(process.env.PUBLIC_R2_BUCKET_NAME),
      'import.meta.env.PUBLIC_R2_DOMAIN': JSON.stringify(process.env.PUBLIC_R2_DOMAIN),
      'import.meta.env.GROQ_API_KEY': JSON.stringify(process.env.GROQ_API_KEY),
      'import.meta.env.PUBLIC_NHOST_SUBDOMAIN': JSON.stringify(process.env.PUBLIC_NHOST_SUBDOMAIN),
      'import.meta.env.PUBLIC_NHOST_REGION': JSON.stringify(process.env.PUBLIC_NHOST_REGION),
    },
  }
});
