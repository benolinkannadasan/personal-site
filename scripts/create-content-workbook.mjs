import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const data=JSON.parse(await fs.readFile(path.join(root,'content/site.json'),'utf8'));
const feed=JSON.parse(await fs.readFile(path.join(root,'content/substack.json'),'utf8'));
const wb=Workbook.create();
const definitions=[];
function add(name,headers,rows,widths){const s=wb.worksheets.add(name);s.showGridLines=false;s.getRangeByIndexes(0,0,rows.length+1,headers.length).values=[headers,...rows];const all=s.getRangeByIndexes(0,0,Math.max(rows.length+1,5),headers.length);all.format.font={name:'Arial',size:10,color:'#262c26'};all.format.rowHeight=29;all.format.verticalAlignment='center';s.getRangeByIndexes(0,0,1,headers.length).format={fill:'#244d77',font:{name:'Arial',size:10,bold:true,color:'#ffffff'},rowHeight:30};headers.forEach((h,i)=>{s.getRangeByIndexes(0,i,Math.max(rows.length+1,5),1).format.columnWidth=widths?.[i]||24;if(['visible','featured'].includes(h))s.getRangeByIndexes(1,i,200,1).dataValidation={rule:{type:'list',values:['TRUE','FALSE']}};});all.format.wrapText=true;all.format.autofitRows();s.getRangeByIndexes(0,0,1,headers.length).format.rowHeight=30;s.freezePanes.freezeRows(1);if(rows.length)s.tables.add(`A1:${String.fromCharCode(64+headers.length)}${rows.length+1}`,true,name.replace(/\W/g,'')+'Content');return s;}
add('Read me',['What to edit','How it works'],[
 ['Save and refresh','Save this workbook in the website content folder as site-content.xlsx, then refresh the local website.'],
 ['Essays','One row per read. Set featured=TRUE for exactly one visible essay. Surprise Me picks a visible essay from this sheet.'],
 ['Books / Films / Albums','Add items, notes, links and cover images. Set visible=FALSE to hide a row. Smaller order values appear first.'],
 ['Writing','Your real Substack posts are prefilled. Site writing_source=feed shows latest posts; change to sheet to curate this tab.'],
 ['Substack','The local server refreshes the public RSS feed when it is used, with a 15 minute cache. A static build includes a snapshot.'],
 ['Cover images','Use an https URL or a path such as assets/books/dust.jpg. Leave blank for a typeset fallback.'],
 ['Projects','Edit the two section title/text pairs and a project link. Line breaks in text are preserved.'],
 ['Illustrations','All named characters are listed. Atlas column/row values locate original illustrations; image can also be a standalone PNG.'],
 ['Your portrait','Benolin is disabled until a reference photo and the resulting illustration are available.'],
 ['Publishing','Local edits are not automatically pushed to GitHub or a public website. Rebuild and publish when ready.'],
 ['Field names','Keep the row 1 column names. Add rows inside or immediately after the existing table. IDs must be unique.']
],[24,110]);
add('Site',['key','value'],[['name','beno.'],['fullName','benolin sk'],['intro',data.intro],['about',data.about],['substack_url','https://windowwatch.substack.com/'],['writing_source','feed']],[24,90]);
add('Essays',['id','title','author','note','url','featured','visible','order'],data.essays.map((e,i)=>[e.id,e.title,e.author,e.note,e.url,e.id===data.featuredEssay,true,i+1]),[18,45,24,50,65,12,12,10]);
add('Books',['id','title','author','status','note','url','cover','color','visible','order'],data.books.map((b,i)=>['book-'+(i+1),b.title,b.author,b.kind,'','',b.cover,b.color,true,i+1]),[18,58,28,22,40,50,50,14,12,10]);
add('Films',['id','title','creator','status','note','url','cover','visible','order'],[['example-film','','','','','','',false,1]],[18,40,28,20,50,50,50,12,10]);
add('Albums',['id','title','creator','status','note','url','cover','visible','order'],[['example-album','','','','','','',false,1]],[18,40,28,20,50,50,50,12,10]);
add('Writing',['id','title','note','url','visible','order'],feed.posts.map((p,i)=>['post-'+(i+1),p.label,p.note,p.url,true,i+1]),[18,38,50,65,12,10]);
add('Projects',['id','title','category','summary','intro','section_1_title','section_1_text','section_2_title','section_2_text','link_label','link_url','visible','order'],data.projects.map((p,i)=>[p.id,p.title,p.category,p.summary,p.intro,p.sections[0]?.title||'',p.sections[0]?.text||'',p.sections[1]?.title||'',p.sections[1]?.text||'',p.id==='window-watch'?'Read Window Watch':'',p.id==='window-watch'?'https://windowwatch.substack.com/':'',true,i+1]),[24,26,25,70,60,28,100,30,100,25,55,12,10]);
add('Socials',['id','label','url','visible','order'],[['substack','Substack','https://windowwatch.substack.com/',true,1]],[18,24,65,12,10]);
const names=['Richard Dawkins','Christopher Hitchens','Kaber Vasuki','Friedrich Hayek','Adam Smith','Leto II Atreides','Charles Darwin','Isaac Newton','Albert Einstein','Niels Bohr','Amit Varma','Ilaiyaraaja','Mahatma Gandhi','Jawaharlal Nehru'];
add('Illustrations',['id','name','image','column','row','atlas','visible','order'],names.map((n,i)=>['person-'+(i+1),n,'assets/people-'+(i<8?'a':'b')+'.png',i%4,Math.floor((i%8)/4),true,true,i+1]).concat([['benolin','Benolin SK','',0,0,false,false,15]]),[18,30,35,12,12,12,12,10]);
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Essays!A1:H3',tableMaxRows:3,tableMaxCols:8,maxChars:2000})).ndjson);
await fs.mkdir(path.join(root,'../../outputs/content'),{recursive:true});
for(const name of ['Read me','Site','Essays','Books','Films','Albums','Writing','Projects','Socials','Illustrations']){const preview=await wb.render({sheetName:name,range:name==='Read me'?'A1:B6':name==='Site'?'A1:B7':'A1:D5',scale:1,format:'png'});await fs.writeFile(path.join(root,'../../outputs/content',name.replaceAll(' ','-')+'.png'),new Uint8Array(await preview.arrayBuffer()));}
const output=await SpreadsheetFile.exportXlsx(wb);await output.save(path.join(root,'content/site-content.xlsx'));await fs.copyFile(path.join(root,'content/site-content.xlsx'),path.join(root,'../../outputs/site-content.xlsx'));console.log('Content workbook exported.');
