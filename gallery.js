const galleryContainer = document.getElementById('model-gallery');
const expandAllButton = document.getElementById('expand-all');
const collapseAllButton = document.getElementById('collapse-all');

function createGalleryItem(entry) {
  const article = document.createElement('article');
  article.className = 'gallery-item';

  if (entry.kind === 'image') {
    const image = document.createElement('img');
    image.src = entry.path;
    image.alt = entry.name;
    article.appendChild(image);
  } else if (entry.kind === 'video') {
    const video = document.createElement('video');
    video.src = entry.path;
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    article.appendChild(video);
  } else {
    const icon = document.createElement('div');
    icon.className = 'gallery-item-icon';
    icon.textContent = '📄';
    icon.style.fontSize = '2rem';
    icon.style.padding = '2rem';
    icon.style.textAlign = 'center';
    article.appendChild(icon);
  }

  const meta = document.createElement('div');
  meta.className = 'gallery-item-meta';
  const link = document.createElement('a');
  link.href = entry.path;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = entry.name;
  meta.appendChild(link);

  if (entry.kind !== 'image' && entry.kind !== 'video') {
    const typeText = document.createElement('p');
    typeText.textContent = `File type: ${entry.kind}`;
    meta.appendChild(typeText);
  }

  article.appendChild(meta);
  return article;
}

function createSection(title, entries) {
  const section = document.createElement('div');
  section.className = 'gallery-section';

  const heading = document.createElement('h3');
  heading.textContent = title;
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';

  entries.forEach((entry) => {
    if (entry.type === 'file') {
      grid.appendChild(createGalleryItem(entry));
    }
  });

  section.appendChild(grid);
  return section;
}

function renderItems(items, parent) {
  items.forEach((item) => {
    if (item.type === 'folder') {
      parent.appendChild(renderFolder(item));
    } else {
      parent.appendChild(createGalleryItem(item));
    }
  });
}

function findPreviewImage(folder) {
  for (const item of folder.items) {
    if (item.type === 'file' && item.kind === 'image') {
      return item.path;
    }
    if (item.type === 'folder') {
      const nestedPreview = findPreviewImage(item);
      if (nestedPreview) return nestedPreview;
    }
  }
  return null;
}

function renderFolder(folder) {
  const details = document.createElement('details');
  details.className = 'gallery-folder';

  const summary = document.createElement('summary');
  const summaryInfo = document.createElement('div');
  summaryInfo.className = 'folder-summary-info';

  const previewPath = findPreviewImage(folder);
  if (previewPath) {
    const previewImage = document.createElement('img');
    previewImage.className = 'folder-thumbnail';
    previewImage.src = previewPath;
    previewImage.alt = `${folder.name} preview`;
    summaryInfo.appendChild(previewImage);
  }

  const titleBlock = document.createElement('div');
  titleBlock.className = 'folder-summary-text';

  const title = document.createElement('span');
  title.className = 'folder-title';
  title.textContent = folder.name;
  titleBlock.appendChild(title);

  const badge = document.createElement('span');
  badge.className = 'folder-badge';
  badge.textContent = `${countFiles(folder)} item(s)`;
  titleBlock.appendChild(badge);

  summaryInfo.appendChild(titleBlock);
  summary.appendChild(summaryInfo);
  details.appendChild(summary);

  const content = document.createElement('div');
  content.className = 'folder-content';
  renderItems(folder.items, content);
  details.appendChild(content);

  return details;
}

function countFiles(folder) {
  return folder.items.reduce((count, item) => {
    if (item.type === 'file') return count + 1;
    return count + countFiles(item);
  }, 0);
}

function renderGallery(data) {
  galleryContainer.innerHTML = '';

  const rootFiles = data.items.filter((entry) => entry.type === 'file');
  const folders = data.items.filter((entry) => entry.type === 'folder');

  if (rootFiles.length) {
    galleryContainer.appendChild(createSection('Uncategorized files', rootFiles));
  }

  if (folders.length) {
    folders.forEach((folder) => {
      galleryContainer.appendChild(renderFolder(folder));
    });
  }

  if (!rootFiles.length && !folders.length) {
    galleryContainer.innerHTML = '<div class="gallery-error">No gallery items found. Run the generator and add files to the 3D models folder.</div>';
  }
}

function toggleAll(open) {
  document.querySelectorAll('.gallery-folder').forEach((folder) => {
    folder.open = open;
  });
}

async function initGallery() {
  try {
    const response = await fetch('gallery-data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery data: ${response.status}`);
    }
    const data = await response.json();
    renderGallery(data);
  } catch (error) {
    galleryContainer.innerHTML = '<div class="gallery-error">Gallery could not be loaded. Check gallery-data.json or run the generator.</div>';
    console.error(error);
  }
}

expandAllButton.addEventListener('click', () => toggleAll(true));
collapseAllButton.addEventListener('click', () => toggleAll(false));

initGallery();
