const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const expoDotenvFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
  '.env.test',
  '.env.test.local',
];

function getEnvironmentKeys(contents) {
  return contents
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.replace(/^export\s+/, '').match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1])
    .filter(Boolean);
}

const invalidEntries = expoDotenvFiles.flatMap(fileName => {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const keys = getEnvironmentKeys(fs.readFileSync(filePath, 'utf8'));
  return keys
    .filter(key => !key.startsWith('EXPO_PUBLIC_'))
    .map(key => `${fileName}: ${key}`);
});

if (invalidEntries.length > 0) {
  console.error(
    [
      'Mobile dotenv files may only contain EXPO_PUBLIC_* configuration.',
      'Move backend secrets outside the frontend repository before running Expo:',
      ...invalidEntries.map(entry => `- ${entry}`),
    ].join('\n')
  );
  process.exit(1);
}

console.log('Mobile environment check passed.');
