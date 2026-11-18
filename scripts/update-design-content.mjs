import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {FileBlob,Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const source=path.join(root,'content/site-content.xlsx');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const socials=wb.worksheets.getItem('Socials');
socials.getRange('E2').values=[[5]];
const socialRows=[['linkedin','LinkedIn','',true,1],['twitter','Twitter','',true,2],['instagram','Instagram','',true,3],['youtube','YouTube','',true,4]];
socials.tables.items[0].rows.add(null,socialRows);
socials.getRange('D2:D6').dataValidation={rule:{type:'list',values:['TRUE','FALSE']}};
socials.getRange('A1:E6').format.font={name:'Arial',size:10};
socials.getRange('A1:E1').format.font={name:'Arial',size:10,bold:true,color:'#ffffff'};
const books=wb.worksheets.getItem('Books');
for(let i=0;i<3;i++){const file=path.join(root,'assets/books/book-'+(i+1)+'.jpg');try{await fs.access(file);books.getRange('G'+(i+2)).values=[['assets/books/book-'+(i+1)+'.jpg']];}catch{}}
books.getRange('F2:F4').values=[['https://www.penguin.co.in/book/the-ideas-that-shaped-india-and-its-economy/'],['https://www.penguin.co.uk/books/418340/dust-by-howey-hugh/9781804940846'],['https://books.google.com/books?id=sYnwzgEACAAJ']];
const readme=wb.worksheets.getItem('Read me');
readme.getRange('B4').values=[['Books, films and albums share one scrolling shelf. Use note for your recommendation; cover is the actual cover/poster URL or local file.']];
readme.getRange('B6').values=[['Socials includes LinkedIn, Twitter, Instagram and YouTube placeholders. Add a URL to turn each into a live link.']];
readme.getRange('B4:B6').format.wrapText=true;readme.getRange('B4:B6').format.autofitRows();
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Socials!A1:E6',tableMaxRows:6,tableMaxCols:5,maxChars:1500})).ndjson);
const out=path.join(root,'../../outputs/content');await fs.mkdir(out,{recursive:true});
for(const [name,range] of [['Socials','A1:E6'],['Books','A1:G4'],['Read me','A1:B7']]){const image=await wb.render({sheetName:name,range,format:'png',scale:1});await fs.writeFile(path.join(out,'Updated-'+name.replaceAll(' ','-')+'.png'),new Uint8Array(await image.arrayBuffer()));}
await (await SpreadsheetFile.exportXlsx(wb)).save(source);
await fs.copyFile(source,path.join(root,'../../outputs/site-content.xlsx'));console.log('Workbook updated without replacing unrelated tabs.');
