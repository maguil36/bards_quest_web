import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update `site` to your real production URL before deploying
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [sitemap()],
});
