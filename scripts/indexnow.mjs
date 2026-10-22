import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {ORIGIN} from '../src/site.mjs';

const key = '15e442b4ff7e07be5b8e8b4d36c3bb6d';
const endpoint = 'https://api.indexnow.org/indexnow';
const root = new URL('../', import.meta.url);
const origin = new URL(ORIGIN);
const keyLocation = new URL(`${key}.txt`, origin).href;
const read = path => readFile(new URL(path, root), 'utf8');

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(`Preview sitemap: npm run indexnow
Preview changed pages: npm run indexnow -- https://devjohn.site/about/
Submit changed pages: npm run indexnow -- --submit https://devjohn.site/about/
Initial submission: npm run indexnow -- --submit --all
Deleted pages can also be supplied explicitly. Deploy changes and the key file first.`);
    return;
  }
  for (const arg of args) {
    if (arg.startsWith('-') && !['--submit', '--all'].includes(arg)) {
      throw Error(`Unknown option: ${arg}`);
    }
  }
  const submit = args.includes('--submit');
  const all = args.includes('--all');
  const requested = args.filter(arg => !arg.startsWith('-'));
  if (all && requested.length) throw Error('Use --all or explicit URLs, not both.');
  if (submit && !all && !requested.length) {
    throw Error('Supply changed URLs, or --all for an initial sitemap submission.');
  }
  if ((await read(`${key}.txt`)).trim() !== key) throw Error('Local key file does not match.');
  const sitemap = await read('sitemap.xml');
  const decode = value => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  const urls = requested.length ? requested : [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => decode(m[1]));
  const urlList = [...new Set(urls.map(value => {
    const url = new URL(value);
    if (url.origin !== origin.origin || url.username || url.password || url.hash) {
      throw Error(`Use an absolute URL on ${origin.origin} without credentials or a fragment: ${value}`);
    }
    return url.href;
  }))];
  if (!urlList.length || urlList.length > 10000) throw Error('Provide between 1 and 10,000 URLs.');
  const payload = {host: origin.host, key, keyLocation, urlList};
  if (!submit) {
    console.log(JSON.stringify(payload, null, 2));
    console.log(`Preview only: ${urlList.length} URLs. No request sent.`);
    return;
  }

  // Verify the deployed file on the submitted host before notifying search engines.
  const verification = await fetch(keyLocation, {redirect: 'manual', signal: AbortSignal.timeout(15000)});
  if (verification.status >= 300 && verification.status < 400) {
    throw Error(`Key URL redirects to ${verification.headers.get('location')}. Make ${origin.origin} the primary domain in Vercel so it serves the key and canonical pages directly, then retry.`);
  }
  if (verification.status !== 200 || (await verification.text()).trim() !== key) {
    throw Error(`Live key verification failed (HTTP ${verification.status}). Deploy ${fileURLToPath(new URL(`${key}.txt`, root))} and retry.`);
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  const messages = {
    200: 'URLs received successfully. This does not guarantee indexing.',
    202: 'URLs received; key validation is pending.',
    400: 'Invalid request format.',
    403: 'Key verification failed. Check the public key file.',
    422: 'URL host or key does not match the protocol requirements.',
    429: 'Rate limited. Wait before submitting again.',
  };
  const message = messages[response.status] || 'Unexpected response; check the IndexNow service before retrying.';
  if (![200, 202].includes(response.status)) throw Error(`IndexNow HTTP ${response.status}: ${message}`);
  console.log(`IndexNow HTTP ${response.status}: ${message} (${urlList.length} URLs)`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
