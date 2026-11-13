import fs from 'fs';

async function deploy() {
  const apiKey = process.env.RENDER_API_KEY || 'rnd_T9rL5alxxbcP69nuwLN4vfdoTboh';

  // Extract Groq API Key from .env.local
  let groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey && fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/);
    for (const l of lines) {
      if (l.startsWith('GROQ_API_KEY=')) {
        groqApiKey = l.slice('GROQ_API_KEY='.length).trim();
      }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  console.log('Connecting to Render API...');
  const ownersRes = await fetch('https://api.render.com/v1/owners', { headers });
  const owners = await ownersRes.json();
  if (!ownersRes.ok || !owners.length) {
    throw new Error('Failed to list Render owners: ' + JSON.stringify(owners));
  }

  const owner = owners[0].owner;
  console.log(`Using Workspace: ${owner.name} (${owner.id})`);

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

  const payload = {
    type: 'web_service',
    name: 'techmate-ai',
    ownerId: owner.id,
    repo: repoUrl,
    branch: 'main',
    autoDeploy: 'yes',
    serviceDetails: {
      env: 'node',
      plan: 'free',
      region: 'singapore',
      buildCommand: 'npm install && npm run build',
      startCommand: 'npm run start',
      healthCheckPath: '/api/health',
      envVars,
    },
  };

  console.log('Creating Web Service on Render...');
  const createRes = await fetch('https://api.render.com/v1/services', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const created = await createRes.json();
  if (!createRes.ok) {
    console.error('Render API Error:', JSON.stringify(created, null, 2));
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('SUCCESSFULLY CREATED RENDER WEB SERVICE!');
  console.log(`Service Name: ${created.name}`);
  console.log(`Service ID:   ${created.id}`);
  console.log(`Live URL:     ${created.serviceDetails?.url || 'Will be active once build completes'}`);
  console.log(`Dashboard:    ${created.dashboardUrl}`);
  console.log('======================================================\n');
}

deploy().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
