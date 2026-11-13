import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'public', 'Git_to_Render_Deployment_Cheatsheet.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 36, bottom: 36, left: 40, right: 40 },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

// Colors
const primary = '#3E2D68';
const secondary = '#7C3AED';
const textDark = '#1E293B';
const textMuted = '#64748B';
const accentBg = '#F8FAFC';
const borderCol = '#E2E8F0';
const tagGreen = '#166534';
const tagGreenBg = '#DCFCE7';

// Header
doc.rect(40, 36, 515, 60).fill(primary);

doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
   .text('GIT TO RENDER DEPLOYMENT CHEATSHEET', 56, 50);

doc.fillColor('#DDD6FE').fontSize(9.5).font('Helvetica')
   .text('End-to-End Quick Reference: Local Changes -> GitHub -> Render Free Web Service', 56, 72);

let y = 112;

function drawSectionHeader(title, stepNumber) {
  doc.rect(40, y, 515, 22).fill(accentBg);
  doc.rect(40, y, 515, 22).strokeColor(borderCol).lineWidth(1).stroke();
  doc.rect(40, y, 4, 22).fill(secondary);

  doc.fillColor(primary).font('Helvetica-Bold').fontSize(11)
     .text(`STEP ${stepNumber}: ${title}`, 52, y + 6);
  y += 28;
}

function drawCodeBox(lines) {
  const boxHeight = lines.length * 13 + 12;
  doc.rect(40, y, 515, boxHeight).fill('#0F172A');
  doc.rect(40, y, 515, boxHeight).strokeColor('#334155').lineWidth(1).stroke();

  doc.fillColor('#38BDF8').font('Courier-Bold').fontSize(9);
  lines.forEach((l, idx) => {
    doc.text(l, 52, y + 6 + idx * 13);
  });

  y += boxHeight + 8;
}

function drawBullet(title, desc) {
  doc.circle(48, y + 4, 2.5).fill(secondary);
  doc.fillColor(textDark).font('Helvetica-Bold').fontSize(9.5).text(title + ': ', 56, y, { continued: true });
  doc.fillColor(textDark).font('Helvetica').fontSize(9).text(desc);
  y += 14;
}

// SECTION 1: GIT WORKFLOW
drawSectionHeader('LOCAL GIT WORKFLOW & COMMITS', 1);
drawBullet('Check Working Tree', 'Review changed and untracked files before committing.');
drawCodeBox([
  'git status',
  'git add .',
  'git commit -m "feat: updates for production deployment"'
]);

drawBullet('Branch Check', 'Ensure you are working on the production deployment branch (usually main).');
drawCodeBox([
  'git branch -M main',
  'git push origin main'
]);

y += 4;

// SECTION 2: GITHUB DESKTOP SHORTCUT
drawSectionHeader('GITHUB DESKTOP PUSH (GUI ALTERNATIVE)', 2);
drawBullet('Open Local Repo', 'File -> Add Local Repository (Ctrl + O) -> Select your project root folder.');
drawBullet('Commit Changes', 'Enter summary in bottom-left box -> Click "Commit to main".');
drawBullet('Push / Publish', 'Click the top-bar button "Push origin" (or "Publish repository" if brand new).');
y += 8;

// SECTION 3: RENDER AUTOMATION VIA SCRIPT / SDK
drawSectionHeader('DEPLOY VIA RENDER AUTOMATION SCRIPT', 3);
drawBullet('One-Command Deploy', 'Provisions service, connects repo, and injects production env vars.');
drawCodeBox([
  '$env:RENDER_API_KEY="rnd_your_key_here"',
  'node scripts/deploy-render.mjs'
]);
drawBullet('Script Logic', 'Automatically attaches repo https://github.com/bskcode/TECHMATE to Render.');
y += 4;

// SECTION 4: RENDER MANUAL SETUP & CONFIGURATION
drawSectionHeader('RENDER DASHBOARD CONFIGURATION (FREE TIER)', 4);
drawBullet('Create Web Service', 'Dashboard -> New + -> Web Service -> Select repository.');
drawBullet('Runtime & Build', 'Runtime: Node | Region: Singapore | Plan: Free ($0/mo)');
drawCodeBox([
  'Build Command : npm install && npm run build',
  'Start Command : npm run start'
]);

drawBullet('Essential Env Vars', 'Set under the "Environment Variables" section of the service:');

const envs = [
  ['NODE_ENV', 'production', 'Production optimization mode'],
  ['PORT', '10000', 'Render internal traffic port'],
  ['AI_PROVIDER', 'groq', 'Primary inference engine'],
  ['GROQ_MODEL', 'llama-3.3-70b-versatile', 'Ultra-fast 70B model'],
  ['GROQ_API_KEY', 'gsk_...', 'Your private Groq API key']
];

envs.forEach(([k, v, note]) => {
  doc.rect(52, y, 503, 14).fill(accentBg);
  doc.rect(52, y, 503, 14).strokeColor(borderCol).lineWidth(0.5).stroke();
  doc.fillColor(primary).font('Courier-Bold').fontSize(8.5).text(k, 58, y + 3, { width: 110 });
  doc.fillColor(textDark).font('Courier').fontSize(8.5).text(v, 175, y + 3, { width: 140 });
  doc.fillColor(textMuted).font('Helvetica').fontSize(8).text(note, 325, y + 3);
  y += 16;
});

y += 4;

// SECTION 5: VERIFICATION & FREE TIER TIPS
drawSectionHeader('LIVE VERIFICATION & FREE TIER NOTES', 5);
drawBullet('Health Check', 'Visit https://<app-name>.onrender.com/api/health (returns 200 healthy).');
drawBullet('Inactivity Sleep', 'Free tier spins down after 15 min idle; first wake-up takes ~45s.');
drawBullet('Auto-Deploy', 'Render auto-redeploys whenever you push new commits to GitHub main.');

// Footer
doc.rect(40, 780, 515, 26).fill('#F1F5F9');
doc.rect(40, 780, 515, 26).strokeColor(borderCol).lineWidth(1).stroke();
doc.fillColor(textMuted).font('Helvetica').fontSize(8)
   .text('AdaptiveLearn AI / TECHMATE  |  Deployment Reference Sheet  |  Generated for Render & Groq', 52, 789);

doc.end();

stream.on('finish', () => {
  console.log('PDF successfully created at:', outPath);
});

