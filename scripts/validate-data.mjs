import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const sander = await readJson('data/sander-2026.json');
const extras = await readJson('data/curated-extras.json');
const papers = [...sander, ...extras];

const allowedCategories = new Set([
  'foundations', 'precursors', 'discrete', 'continuous', 'simplex', 'hybrid',
  'flow', 'latent', 'systems', 'agents', 'evaluation', 'multimodal', 'surveys',
]);
const allowedTiers = new Set(['essential', 'recommended', 'frontier', 'context']);
const required = ['id', 'title', 'authors', 'year', 'published', 'venue', 'url', 'category', 'tags', 'tier', 'sourceCollections', 'lastVerified'];
const errors = [];

if (sander.length !== 81) errors.push(`Sander collection must contain 81 records; found ${sander.length}.`);

const sourceIndexes = sander.map((paper) => paper.sourceIndex).sort((a, b) => a - b);
if (sourceIndexes.some((value, index) => value !== index + 1)) {
  errors.push('Sander source indexes must be exactly 1–81.');
}

const seenIds = new Map();
const seenTitles = new Map();

for (const [index, paper] of papers.entries()) {
  const label = paper.id || `record ${index + 1}`;
  for (const field of required) {
    if (paper[field] === undefined || paper[field] === null || paper[field] === '') {
      errors.push(`${label}: missing ${field}.`);
    }
  }
  if (!Array.isArray(paper.authors) || paper.authors.length === 0) errors.push(`${label}: authors must be a non-empty array.`);
  if (!Array.isArray(paper.tags) || paper.tags.length === 0) errors.push(`${label}: tags must be a non-empty array.`);
  if (!allowedCategories.has(paper.category)) errors.push(`${label}: unknown category ${paper.category}.`);
  if (!allowedTiers.has(paper.tier)) errors.push(`${label}: unknown tier ${paper.tier}.`);
  if (!/^https:\/\//.test(paper.url)) errors.push(`${label}: URL must use HTTPS.`);
  if (!/^\d{4}(?:-\d{2}-\d{2})?$/.test(paper.published)) errors.push(`${label}: invalid published date ${paper.published}.`);

  if (seenIds.has(paper.id)) errors.push(`${label}: duplicate id (also record ${seenIds.get(paper.id)}).`);
  seenIds.set(paper.id, index + 1);

  const normalizedTitle = paper.title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (seenTitles.has(normalizedTitle)) errors.push(`${label}: duplicate normalized title (also ${seenTitles.get(normalizedTitle)}).`);
  seenTitles.set(normalizedTitle, label);
}

const essential = papers.filter((paper) => paper.tier === 'essential');
const essentialOrder = essential.map((paper) => paper.essentialOrder).sort((a, b) => a - b);
if (essential.length !== 12 || essentialOrder.some((value, index) => value !== index + 1)) {
  errors.push('Essential reading path must contain exactly 12 records ordered 1–12.');
}
for (const paper of essential) {
  if (!paper.whyReadZh) errors.push(`${paper.id}: essential paper needs whyReadZh.`);
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${papers.length} unique papers (${sander.length} from Sander 2026; ${essential.length} essential).`);
