const fs = require('fs').promises;
const path = require('path');

const rootDir = path.join(__dirname, '3D model photos and videos', '3D models');
const outputFile = path.join(__dirname, 'gallery-data.json');

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
const videoExtensions = new Set(['mp4', 'webm', 'mov', 'ogg']);

function fileKind(name) {
  const ext = path.extname(name).slice(1).toLowerCase();
  if (imageExtensions.has(ext)) return 'image';
  if (videoExtensions.has(ext)) return 'video';
  return 'file';
}

function normalizePath(filePath) {
  return encodeURI(filePath.split(path.sep).join('/'));
}

async function scanDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const items = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      items.push({
        type: 'folder',
        name: entry.name,
        items: await scanDirectory(fullPath),
      });
      continue;
    }

    if (entry.isFile()) {
      const relativePath = path.relative(__dirname, fullPath);
      items.push({
        type: 'file',
        name: entry.name,
        path: normalizePath(relativePath),
        kind: fileKind(entry.name),
      });
    }
  }

  return items;
}

async function buildGallery() {
  const items = await scanDirectory(rootDir);
  const gallery = {
    generatedAt: new Date().toISOString(),
    root: '3D model photos and videos/3D models',
    items,
  };

  await fs.writeFile(outputFile, JSON.stringify(gallery, null, 2), 'utf8');
  console.log(`Generated gallery data with ${items.length} root item(s) at ${outputFile}`);
}

buildGallery().catch((error) => {
  console.error('Failed to generate gallery data:', error);
  process.exit(1);
});
