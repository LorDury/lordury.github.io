const fs = require('fs').promises;
const path = require('path');

const rootDir = path.join(__dirname, '3D model photos and videos', '3D models');
const outputFile = path.join(__dirname, 'gallery-data.json');

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
const videoExtensions = new Set(['mp4', 'webm', 'mov', 'ogg']);
const descriptionFileNames = new Set(['description.txt', 'description.md']);

function fileKind(name) {
  const ext = path.extname(name).slice(1).toLowerCase();
  if (imageExtensions.has(ext)) return 'image';
  if (videoExtensions.has(ext)) return 'video';
  return 'file';
}

function normalizePath(filePath) {
  return encodeURI(filePath.split(path.sep).join('/'));
}

async function readFolderDescription(directory) {
  for (const fileName of descriptionFileNames) {
    const descriptionPath = path.join(directory, fileName);

    try {
      const content = await fs.readFile(descriptionPath, 'utf8');
      const trimmed = content.trim();
      if (trimmed) {
        return trimmed;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`Could not read ${descriptionPath}: ${error.message}`);
      }
    }
  }

  return null;
}

async function scanDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const items = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const description = await readFolderDescription(fullPath);
      items.push({
        type: 'folder',
        name: entry.name,
        description,
        items: await scanDirectory(fullPath),
      });
      continue;
    }

    if (entry.isFile()) {
      const loweredName = entry.name.toLowerCase();
      if (descriptionFileNames.has(loweredName)) continue;

      const relativePath = path.relative(__dirname, fullPath);
      const isStl = loweredName.endsWith('.stl');
      items.push({
        type: 'file',
        name: entry.name,
        path: normalizePath(relativePath),
        kind: isStl ? 'stl' : fileKind(entry.name),
        downloadable: isStl,
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
