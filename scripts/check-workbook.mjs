import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
const file=new URL('../content/site-content.xlsx',import.meta.url);
const original=await fs.readFile(file);
const archive=await JSZip.loadAsync(original);
function changeCell(xml,ref,value){const pattern=new RegExp('(<x:c\\b[^>]*\\br="'+ref+'"[^>]*>)([\\s\\S]*?)(<\\/x:c>)');if(!pattern.test(xml))throw Error('Fixture cell missing: '+ref);return xml.replace(pattern,(_,a,b,c)=>a+b.replace(/<x:v>.*?<\/x:v>/,'<x:v>'+value+'</x:v>')+c);}
let essays=await archive.file('xl/worksheets/sheet3.xml').async('string');
essays=changeCell(essays,'F2','0');essays=changeCell(essays,'F3','1');archive.file('xl/worksheets/sheet3.xml',essays);
let books=await archive.file('xl/worksheets/sheet4.xml').async('string');books=changeCell(books,'I2','0');archive.file('xl/worksheets/sheet4.xml',books);
const modified=await archive.generateAsync({type:'nodebuffer'});
try{await fs.writeFile(file,modified);let response=await fetch((process.env.PREVIEW_URL||'http://127.0.0.1:4173')+'/content/site.json');assert.equal(response.status,200);const changed=await response.json();assert.equal(changed.featuredEssay,'commons');assert.equal(changed.books.length,2);console.log('Saving the workbook updates the featured essay and hides a book on the running site.');}finally{const current=await fs.readFile(file);assert.ok(current.equals(modified),'Workbook changed externally; refusing to overwrite it.');await fs.writeFile(file,original);const restored=await fetch((process.env.PREVIEW_URL||'http://127.0.0.1:4173')+'/content/site.json').then(r=>r.json());assert.equal(restored.featuredEssay,'knowledge');assert.equal(restored.books.length,3);console.log('Original content restored.');}
