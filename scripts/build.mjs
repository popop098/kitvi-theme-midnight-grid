import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Local preflight checks, not a replacement for Kitvi's complete installer validation.
const MiB = 1024 * 1024;
const reserved = /^(?:con|prn|aux|nul|conin\$|conout\$|clock\$|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i;
const excluded = new Set(['.git', 'node_modules', 'dist', '.cache']);
const omitted = (name) => excluded.has(name) || name.startsWith('.env');
const colors = ['canvas', 'panel', 'surface', 'text', 'muted', 'border', 'accent', 'accentText', 'accentSoft', 'cpu', 'memory', 'gpu'];
const sections = ['summary', 'performance', 'storage', 'displays', 'devices', 'bgm'];

function check(condition, message) { if (!condition) throw new Error(message); }
function object(value, keys, label) {
  check(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object.`);
  check(Object.keys(value).every((key) => keys.includes(key)), `${label} contains an unknown field.`);
  return value;
}
function text(value, max, label) {
  check(typeof value === 'string' && value.trim() && value.length <= max && !/[\p{Cc}]/u.test(value), `Invalid ${label}.`);
}
function number(value, min, max, label) {
  check(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max, `Invalid ${label}.`);
}
function safePath(value) {
  check(typeof value === 'string' && value.length > 0 && value.length <= 240 && value === value.normalize('NFC') && !/[\\\x00-\x1f\x7f<>:"|?*]/.test(value), 'Invalid package path.');
  check(value.split('/').every((part) => part && part !== '.' && part !== '..' && part.length <= 128 && !/[. ]$/.test(part) && !reserved.test(part) && !omitted(part)), `Unsafe or excluded package path: ${value}`);
  return value;
}
function version(value, label) {
  check(typeof value === 'string' && /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(value), `${label} must be a stable x.y.z version.`);
  const parts = value.split('.').map(Number);
  check(parts.every(Number.isSafeInteger), `Invalid ${label}.`);
  return parts;
}
function pluginId(value) {
  check(typeof value === 'string' && value.length <= 128 && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/.test(value) && !reserved.test(value), 'Invalid plugin ID.');
}
function validateManifest(raw, pkg) {
  object(raw, ['apiVersion', 'kind', 'id', 'name', 'version', 'minKitviVersion', 'description', 'author', 'authorEmail', 'theme', 'entry', 'permissions'], 'Manifest');
  check(raw.apiVersion === 2 && raw.kind === 'theme', 'Expected an SDK 2 theme manifest.');
  pluginId(raw.id);
  for (const [key, max] of [['name', 80], ['description', 1000], ['author', 120]]) text(raw[key], max, key);
  version(raw.version, 'Manifest version');
  check(pkg.version === raw.version, 'package.json and manifest versions must match.');
  const minimum = version(raw.minKitviVersion, 'minKitviVersion');
  check(minimum[0] > 0 || minimum[1] >= 7, 'SDK 2 requires minKitviVersion 0.7.0 or later.');
  check(Array.isArray(raw.permissions) && raw.permissions.includes('theme') && raw.permissions.length <= 5 && new Set(raw.permissions).size === raw.permissions.length && raw.permissions.every((permission) => ['theme', 'playback', 'storage', 'downloads', 'media'].includes(permission)), 'Invalid theme permissions.');
  if (raw.authorEmail !== undefined) check(typeof raw.authorEmail === 'string' && raw.authorEmail.length <= 254 && !/[\p{Cc}\s]/u.test(raw.authorEmail) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw.authorEmail), 'Invalid optional author email.');
  check(safePath(raw.theme).endsWith('.json'), 'The theme must be a packaged JSON file.');
  if (raw.entry !== undefined) check(safePath(raw.entry).endsWith('.html'), 'Optional entry must be a packaged HTML file.');
}
function validateTheme(raw, manifest) {
  object(raw, ['schemaVersion', 'id', 'name', 'modes', 'typography', 'shape', 'background', 'layout', 'bgm'], 'Theme');
  check(raw.schemaVersion === 1 && raw.id === manifest.id, 'Theme schema must be 1 and its ID must match the manifest.');
  text(raw.name, 80, 'theme name');
  object(raw.modes, ['light', 'dark'], 'Theme modes');
  for (const mode of ['light', 'dark']) {
    object(raw.modes[mode], colors, `${mode} palette`);
    check(colors.every((key) => typeof raw.modes[mode][key] === 'string' && /^#[a-fA-F0-9]{6}(?:[a-fA-F0-9]{2})?$/.test(raw.modes[mode][key])), `${mode} needs every semantic color token.`);
  }
  const references = [];
  const asset = (path, kind) => {
    const name = safePath(path);
    const accepted = kind === 'image' ? /\.(?:png|jpe?g|gif|webp)$/i : kind === 'font' ? /\.(?:woff2?|ttf|otf)$/i : /\.(?:mp3|ogg|wav|m4a)$/i;
    check(name.startsWith('assets/') && accepted.test(name), `${kind} resources must use a supported file in assets/.`);
    references.push({ path: name, kind });
  };
  if (raw.typography !== undefined) {
    const value = object(raw.typography, ['fontFamily', 'fontAsset', 'baseSize'], 'Typography');
    check(['pretendard', 'system', 'custom'].includes(value.fontFamily), 'Invalid font family.');
    if (value.fontFamily === 'custom') asset(value.fontAsset, 'font');
    else check(value.fontAsset === undefined, 'fontAsset requires a custom font family.');
    if (value.baseSize !== undefined) number(value.baseSize, 14, 20, 'baseSize');
  }
  if (raw.shape !== undefined) {
    const value = object(raw.shape, ['radius', 'spacing'], 'Shape');
    if (value.radius !== undefined) number(value.radius, 0, 20, 'radius');
    if (value.spacing !== undefined) number(value.spacing, 0.8, 1.3, 'spacing');
  }
  if (raw.background !== undefined) {
    const value = object(raw.background, ['asset', 'opacity', 'fit'], 'Background');
    asset(value.asset, 'image'); number(value.opacity, 0, 1, 'background opacity');
    check(['cover', 'contain'].includes(value.fit), 'Invalid background fit.');
  }
  if (raw.layout !== undefined) {
    const value = object(raw.layout, ['order', 'hidden', 'columns'], 'Layout');
    for (const field of ['order', 'hidden']) check(Array.isArray(value[field]) && value[field].length <= sections.length && new Set(value[field]).size === value[field].length && value[field].every((section) => sections.includes(section)), `Invalid layout ${field}.`);
    check(!value.hidden.includes('summary') && !value.hidden.includes('performance'), 'Required dashboard sections cannot be hidden.');
    check([1, 2, 3].includes(value.columns), 'Invalid column count.');
  }
  if (raw.bgm !== undefined) {
    const value = object(raw.bgm, ['title', 'tracks', 'volume', 'loop'], 'BGM');
    check(manifest.permissions.includes('playback'), 'BGM requires the playback permission.');
    text(value.title, 80, 'BGM title'); number(value.volume, 0, 100, 'BGM volume');
    check(typeof value.loop === 'boolean' && Array.isArray(value.tracks) && value.tracks.length >= 1 && value.tracks.length <= 32, 'Invalid BGM tracks or loop.');
    const ids = new Set();
    for (const track of value.tracks) {
      object(track, ['id', 'title', 'source'], 'Track');
      check(typeof track.id === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(track.id) && !ids.has(track.id), 'Invalid or duplicate track ID.');
      ids.add(track.id); text(track.title, 120, 'track title');
      const source = object(track.source, ['type', 'path', 'videoId'], 'Track source');
      if (source.type === 'asset' && source.videoId === undefined) asset(source.path, 'audio');
      else check(source.type === 'youtube' && source.path === undefined && typeof source.videoId === 'string' && /^[A-Za-z0-9_-]{11}$/.test(source.videoId), 'Invalid track source.');
    }
  }
  return references;
}
function signature(file) {
  const data = file.data, ext = extname(file.name).toLowerCase();
  const ascii = (start, end) => data.toString('ascii', start, end);
  const prefix = (bytes) => data.subarray(0, bytes.length).equals(Buffer.from(bytes));
  const valid = {
    '.png': () => prefix([137, 80, 78, 71, 13, 10, 26, 10]),
    '.jpg': () => prefix([255, 216, 255]), '.jpeg': () => prefix([255, 216, 255]),
    '.gif': () => ['GIF87a', 'GIF89a'].includes(ascii(0, 6)),
    '.webp': () => ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP',
    '.wav': () => ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE',
    '.ogg': () => ascii(0, 4) === 'OggS',
    '.mp3': () => ascii(0, 3) === 'ID3' || (data.length > 1 && data[0] === 255 && (data[1] & 0xe0) === 0xe0),
    '.m4a': () => ascii(4, 8) === 'ftyp',
    '.woff': () => ascii(0, 4) === 'wOFF', '.woff2': () => ascii(0, 4) === 'wOF2',
    '.ttf': () => prefix([0, 1, 0, 0]) || ascii(0, 4) === 'true', '.otf': () => ascii(0, 4) === 'OTTO',
  };
  check(valid[ext]?.(), `Unsupported asset or invalid signature: ${file.name}`);
}
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(files) {
  const local = [], central = []; let offset = 0;
  for (const { name: path, data } of files) {
    const name = Buffer.from(path, 'utf8'), crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(0x21, 12);
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0x800, 8); entry.writeUInt16LE(0x21, 14);
    entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(data.length, 20); entry.writeUInt32LE(data.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
    central.push(entry, name); offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export async function build(source = resolve(import.meta.dirname, '..')) {
  check(Number(process.versions.node.split('.')[0]) >= 24, 'Node.js 24 or later is required.');
  source = resolve(source);
  const rootStat = await lstat(source);
  check(rootStat.isDirectory() && !rootStat.isSymbolicLink(), 'Source must be a real directory.');
  const files = [], names = new Set(); let total = 0;
  const read = async (name, optional = false) => {
    safePath(name);
    let stat;
    // Check every component so a symlinked parent cannot escape the source root.
    let current = source;
    for (const segment of name.split('/')) {
      current = join(current, segment);
      try { stat = await lstat(current); }
      catch (error) { if (optional && error.code === 'ENOENT') return; throw error; }
      check(!stat.isSymbolicLink(), `Links are not allowed: ${name}`);
    }
    check(stat.isFile(), `Expected a regular file: ${name}`);
    const key = name.toLowerCase();
    check(!names.has(key), `Duplicate or case-colliding path: ${name}`);
    const limit = /\.(?:woff2?|ttf|otf)$/i.test(name) ? 2 * MiB : 4 * MiB;
    check(stat.size <= limit, `File exceeds ${limit / MiB} MiB: ${name}`);
    const data = await readFile(current);
    check(data.length <= limit, `File grew beyond its size limit: ${name}`);
    total += data.length; check(total <= 16 * MiB, 'Resources exceed 16 MiB.');
    check(files.length < 256, 'Package exceeds 256 entries.');
    names.add(key); const file = { name, data }; files.push(file); return file;
  };
  // Package metadata is used for the release filename, never included in the ZIP.
  const pkgStat = await lstat(join(source, 'package.json'));
  check(pkgStat.isFile() && !pkgStat.isSymbolicLink() && pkgStat.size <= 64 * 1024, 'Invalid package.json.');
  const pkg = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
  check(typeof pkg.name === 'string' && /^[a-z][a-z0-9-]{0,127}$/.test(pkg.name), 'Package name must be a portable lowercase repository name.');
  const manifest = JSON.parse((await read('kitvi-plugin.json')).data.toString('utf8'));
  validateManifest(manifest, pkg);
  const theme = JSON.parse((await read(manifest.theme)).data.toString('utf8'));
  const references = validateTheme(theme, manifest);
  const visit = async (folder, prefix) => {
    const stat = await lstat(folder);
    check(stat.isDirectory() && !stat.isSymbolicLink(), `Expected a real assets directory: ${prefix}`);
    for (const item of (await readdir(folder, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (omitted(item.name)) continue;
      const name = safePath(`${prefix}/${item.name}`);
      check(!item.isSymbolicLink(), `Links are not allowed: ${name}`);
      if (item.isDirectory()) await visit(join(folder, item.name), name);
      else signature(await read(name));
    }
  };
  try { await visit(join(source, 'assets'), 'assets'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const name of ['README.md', 'README.en.md', 'LICENSE']) await read(name, true);
  for (const ref of references) check(files.some((file) => file.name === ref.path), `Missing ${ref.kind} asset: ${ref.path}`);
  if (manifest.entry !== undefined) check(files.some((file) => file.name === manifest.entry), `Missing optional entry: ${manifest.entry}`);
  files.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const archive = zip(files);
  check(archive.length <= 16 * MiB, 'ZIP exceeds 16 MiB.');
  const output = join(source, 'dist');
  try { const stat = await lstat(output); check(stat.isDirectory() && !stat.isSymbolicLink(), 'dist must be a real directory.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; await mkdir(output); }
  const filename = `${pkg.name}-${manifest.version}.kitvi-plugin.zip`;
  for (const name of [filename, 'SHA256SUMS.txt']) {
    try { const stat = await lstat(join(output, name)); check(stat.isFile() && !stat.isSymbolicLink(), `Output cannot be a link: ${name}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const sha256 = createHash('sha256').update(archive).digest('hex');
  await writeFile(join(output, filename), archive);
  await writeFile(join(output, 'SHA256SUMS.txt'), `${sha256}  ${filename}\n`);
  return { filename, sha256, bytes: archive.length, entries: files.length, id: manifest.id };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await build(), null, 2)); }
  catch (error) { console.error(`Build failed: ${error.message}`); process.exitCode = 1; }
}
