import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const file=new URL('../content/site-content.xlsx',import.meta.url);
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(fileURLToPath(file)));
function fileURLToPath(url){return decodeURIComponent(url.pathname.slice(1));}
const books=wb.worksheets.getItem('Books');books.getRange('F2:G4').format.autofitRows();
wb.recalculate();
const image=await wb.render({sheetName:'Books',range:'A1:G4',format:'png',scale:1});
await fs.writeFile(new URL('../../../outputs/content/Updated-Books.png',import.meta.url),new Uint8Array(await image.arrayBuffer()));
await (await SpreadsheetFile.exportXlsx(wb)).save(fileURLToPath(file));
await fs.copyFile(file,new URL('../../../outputs/site-content.xlsx',import.meta.url));
console.log('Adjusted link row heights.');
