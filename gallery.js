const galleryContainer = document.getElementById('model-gallery');
const expandAllButton = document.getElementById('expand-all');
const collapseAllButton = document.getElementById('collapse-all');

function isDescriptionFile(entry) {
  return entry.type === 'file' && ['description.txt', 'description.md'].includes(entry.name.toLowerCase());
}

function isDownloadableFile(entry) {
  return entry.type === 'file' && (entry.downloadable || entry.kind === 'stl');
}

function createDownloadItem(entry) {
  const item = document.createElement('li');
  item.className = 'gallery-download-item';

  const link = document.createElement('a');
  link.href = entry.path;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = entry.name;

  item.appendChild(link);
  return item;
}

function createGalleryItem(entry) {
  const article = document.createElement('article');
  article.className = 'gallery-item';

  if (entry.kind === 'image') {
    const thumbLink = document.createElement('a');
    thumbLink.href = entry.path;
    thumbLink.target = '_blank';
    thumbLink.rel = 'noopener';
    thumbLink.className = 'gallery-item-thumb-link';

    const image = document.createElement('img');
    image.src = entry.path;
    image.alt = entry.name;
    image.className = 'gallery-item-thumbnail';
    thumbLink.appendChild(image);
    article.appendChild(thumbLink);
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

function renderDownloads(downloadEntries, parent) {
  if (!downloadEntries.length) return;

  const downloads = document.createElement('div');
  downloads.className = 'gallery-downloads';

  const heading = document.createElement('h4');
  heading.textContent = 'Downloads';
  downloads.appendChild(heading);

  const list = document.createElement('ul');
  list.className = 'gallery-download-list';
  downloadEntries.forEach((entry) => {
    list.appendChild(createDownloadItem(entry));
  });

  downloads.appendChild(list);
  parent.appendChild(downloads);
}

function createSection(title, entries) {
  const section = document.createElement('div');
  section.className = 'gallery-section';

  const heading = document.createElement('h3');
  heading.textContent = title;
  section.appendChild(heading);

  const visibleEntries = entries.filter((entry) => entry.type === 'file' && !isDescriptionFile(entry) && !isDownloadableFile(entry));
  const downloadEntries = entries.filter(isDownloadableFile);

  if (visibleEntries.length) {
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    visibleEntries.forEach((entry) => {
      grid.appendChild(createGalleryItem(entry));
    });
    section.appendChild(grid);
  }

  renderDownloads(downloadEntries, section);
  return section;
}

function renderItems(items, parent) {
  const visibleEntries = [];
  const downloadEntries = [];
  const folders = [];

  items.forEach((item) => {
    if (item.type === 'folder') {
      folders.push(item);
    } else if (isDescriptionFile(item)) {
      return;
    } else if (isDownloadableFile(item)) {
      downloadEntries.push(item);
    } else {
      visibleEntries.push(item);
    }
  });

  if (visibleEntries.length) {
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    visibleEntries.forEach((entry) => {
      grid.appendChild(createGalleryItem(entry));
    });
    parent.appendChild(grid);
  }

  renderDownloads(downloadEntries, parent);

  folders.forEach((folder) => {
    parent.appendChild(renderFolder(folder));
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

  if (folder.description) {
    const description = document.createElement('p');
    description.className = 'folder-description';
    description.textContent = folder.description;
    titleBlock.appendChild(description);
  }

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
    galleryContainer.innerHTML = '<div class="loading">Loading gallery…</div>';
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
