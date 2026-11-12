import { Render } from '@renderinc/sdk';
import fs from 'fs';

async function deploy() {
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    console.error('ERROR: RENDER_API_KEY environment variable is missing.');
    console.log('Usage: $env:RENDER_API_KEY="rnd_..."; node scripts/deploy-render.mjs');
    process.exit(1);
  }

  // Read Groq API key from .env.local if present
  let groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey && fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/);
    for (const l of lines) {
      if (l.startsWith('GROQ_API_KEY=')) {
        groqApiKey = l.slice('GROQ_API_KEY='.length).trim();
      }
    }
  }

  console.log('Connecting to Render API...');
  const render = new Render({ apiKey });

  // 1. Get Owner / Workspace ID
  const owners = await render.owners.list();
  if (!owners || owners.length === 0) {
    console.error('ERROR: No workspaces/owners found in Render account.');
    process.exit(1);
  }
  const ownerId = owners[0].id;
  console.log(`Found Workspace: ${owners[0].name} (ID: ${ownerId})`);

  // 2. Check if service already exists
  const services = await render.services.list();
  const existing = services.find((s) => s.service.name === 'adaptivelearn-ai' || s.service.name === 'techmate-ai');

  const repoUrl = 'https://github.com/bskcode/TECHMATE';

  const envVars = [
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '10000' },
    { key: 'AI_PROVIDER', value: 'groq' },
    { key: 'GROQ_MODEL', value: 'llama-3.3-70b-versatile' },
  ];
  if (groqApiKey) {
    envVars.push({ key: 'GROQ_API_KEY', value: groqApiKey });
  }

  if (existing) {
    console.log(`Found existing service: ${existing.service.name} (ID: ${existing.service.id})`);
    console.log('Triggering manual deploy...');
    const dep = await render.services.triggerDeploy(existing.service.id, { clearCache: 'do_not_clear' });
    console.log('Deploy triggered successfully! Deploy ID:', dep.id);
    console.log(`Live Dashboard: https://dashboard.render.com/web/${existing.service.id}`);
    return;
  }

  console.log(`Creating new Free Web Service for repository: ${repoUrl}...`);
  const created = await render.services.createWebService({
    name: 'adaptivelearn-ai',
    ownerId,
    repo: repoUrl,
    branch: 'main',
    autoDeploy: 'yes',
    serviceDetails: {
      env: 'node',
      plan: 'free',
      buildCommand: 'npm install && npm run build',
      startCommand: 'npm run start',
      healthCheckPath: '/api/health',
      envVars,
    },
  });

  console.log('SUCCESS! Service created on Render.');
  console.log(`Service ID: ${created.id}`);
  console.log(`Service Name: ${created.name}`);
  console.log(`Dashboard URL: https://dashboard.render.com/web/${created.id}`);
}

deploy().catch((err) => {
  console.error('Deployment script failed:', err.message || err);
  process.exit(1);
});
