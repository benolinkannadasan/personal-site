import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(await readFile(path.join(root,'content/site.json'),'utf8'));
const ids=new Set();
for(const p of data.projects){if(!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id))throw Error('Project ID must be unique and URL safe');ids.add(p.id);if(!p.title||!p.sections.length)throw Error('Project content missing');for(const s of p.sections)if(!s.title||!s.text)throw Error('Project section missing content');}
if(!data.essays.some(e=>e.id===data.featuredEssay))throw Error('Featured essay missing');
for(const e of data.essays){if(!e.id||!e.title)throw Error('Essay missing fields');const u=new URL(e.url);if(!['https:','http:'].includes(u.protocol))throw Error('Invalid essay URL');}
for(const list of [data.writing,...data.projects.map(p=>p.links)])for(const link of list){if(!link.label||!/^https?:$/.test(new URL(link.url).protocol))throw Error('Invalid external link');}
const html=await readFile(path.join(root,'index.html'),'utf8');
const markupIDs=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(markupIDs).size!==markupIDs.length)throw Error('Duplicate HTML IDs');
for(const match of html.matchAll(/(?:src|href)="((?:assets\/|styles\.css|theme\.css|app\.js)[^"]*)"/g))await access(path.join(root,match[1]));
execFileSync(process.execPath,['--check',path.join(root,'app.js')],{stdio:'inherit'});
console.log(`Checks passed: ${data.projects.length} project pages, ${data.essays.length} archive reads, local assets and JavaScript syntax.`);

for(const social of data.socials){if(!social.label)throw Error('Social placeholder needs a label');if(social.url&&!['https:','http:'].includes(new URL(social.url).protocol))throw Error('Invalid social URL');}
