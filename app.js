const $ = (selector) => document.querySelector(selector);
const make = (tag, className, text) => { const el = document.createElement(tag); if(className) el.className=className; if(text!==undefined) el.textContent=text; return el; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let data, currentView = 'home', lastPick, originScroll = 0;
function safeURL(value){if(typeof value!=='string'||!value.trim())return null;try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
function externalLink(label,url,className='text-link'){const a=make('a',className,label);const valid=safeURL(url);if(!valid)return null;a.href=valid;a.target='_blank';a.rel='noopener noreferrer';return a;}
function addLinks(container,items){container.replaceChildren();for(const item of items){const a=externalLink(item.label+' ↗',item.url);if(a)container.append(a);}}
function render(){
 $('#projects-subtitle').textContent=data.projectsSubtitle??'Data science, questions, and a few experiments.';
 $('#intro').textContent=data.intro;$('#about').textContent=data.about;
 const essay=data.essays.find(e=>e.id===data.featuredEssay)||data.essays[0];
 if(essay){$('#essay-title').textContent=essay.title;$('#essay-note').textContent=essay.note;$('#essay-author').textContent=essay.author;const url=safeURL(essay.url);if(url)$('#daily-essay').href=url;}
 else{$('#daily-essay').hidden=true;$('#surprise').disabled=true;}
 for(const [i,p] of data.projects.entries()){
  const row=make('a','project-row');row.href='#project/'+encodeURIComponent(p.id);row.append(make('span','index',String(i+1).padStart(2,'0')));const name=make('div');name.append(make('h3','',p.title),make('span','category',p.category));row.append(name,make('p','',p.summary),make('span','arrow','↗'));$('#projects').append(row);
 }
 for(const [i,book] of data.books.entries()){
  const b=make('div','book'),art=make('div','book-art');art.style.setProperty('--book-color',/^#[0-9a-f]{6}$/i.test(book.color)?book.color:'#bac1a8');art.style.setProperty('--book-rotation',[-4,3,-2][i%3]+'deg');art.append(make('span','book-name',book.title),make('span','book-author',book.author));
  if(book.cover){const img=make('img');img.src=book.cover;img.alt=book.title+' cover';img.loading='lazy';img.addEventListener('error',()=>img.remove());art.append(img);}
  b.append(art,make('span','book-kind',book.kind),make('h3','',book.title),make('p','',book.author));if(book.note)b.append(make('p','book-note',book.note));if(book.url){const link=externalLink('Read more',book.url);if(link)b.append(link);}$('#books').append(b);
 }
 $('#writing-links').replaceChildren();for(const post of data.writing){const link=externalLink('',post.url,'writing-post');if(!link)continue;link.append(make('h3','',post.label),make('p','',post.note||''));$('#writing-links').append(link);} $('#substack-more').href=safeURL(data.substackUrl)||'https://windowwatch.substack.com/';renderSocials();renderShelf(); $('#writing-empty').hidden=data.writing.length>0; $('#socials-empty').hidden=data.socials.length>0;
 for(const film of data.films){$('#films').append(make('p','',film.title+' - '+film.note));}
 for(const e of data.essays){const a=externalLink('',e.url,'archive-item');if(!a)continue;const body=make('div');body.append(make('h2','',e.title),make('p','',e.author+' — '+e.note));a.append(body,make('span','arrow','↗'));$('#archive-list').append(a);}
 for(const album of data.albums||[]){$('#albums').append(make('p','',album.title+' - '+(album.note||'')));} shufflePeople();
}

function renderSocials(){
 const list=$('#socials');list.replaceChildren();
 for(const [index,item]of data.socials.entries()){
  if(index)list.append(make('span','social-separator','/'));
  const link=externalLink(item.label,item.url);
  if(link)list.append(link);else{const placeholder=make('span','social-placeholder',item.label);placeholder.setAttribute('role','link');placeholder.setAttribute('aria-disabled','true');placeholder.title='Coming soon';list.append(placeholder);}
 }
}
function renderShelf(){
 for(const [kind,target]of [['books','#book-suggestions'],['films','#film-suggestions'],['albums','#album-suggestions']]){
  const container=$(target);container.replaceChildren();const items=data[kind]||[];
  if(!items.length){container.append(make('p','shelf-empty',kind+' — more soon.'));continue;}
  for(const [index,item]of items.entries()){
   const href=safeURL(item.url);const card=href?externalLink('',href,'shelf-card'):make('article','shelf-card');
   const cover=safeURL(item.cover);
   if(cover){const image=make('img','shelf-cover');image.src=cover;image.alt=item.title+' — cover';image.loading='lazy';image.style.setProperty('--cover-turn',[-6,5,-3][index%3]+'deg');image.addEventListener('error',()=>image.remove());card.append(image);}
   card.append(make('h4','',item.title));if(item.author)card.append(make('span','shelf-author',item.author));if(item.note)card.append(make('p','shelf-note',item.note));else if(item.kind)card.append(make('p','shelf-note',item.kind));container.append(card);
  }
 }
}

function projectContent(p){
 $('#project-title').textContent=p.title;$('#project-category').textContent=p.category;$('#project-intro').textContent=p.intro;$('#project-sections').replaceChildren();
 for(const part of p.sections){const section=make('section');section.append(make('h2','',part.title),make('p','',part.text));$('#project-sections').append(section);}
 addLinks($('#project-links'),p.links);
 const next=data.projects[(data.projects.indexOf(p)+1)%data.projects.length];$('#next-project').replaceChildren();if(next&&next!==p){const a=make('a','text-link','Next: '+next.title+' ↗');a.href='#project/'+encodeURIComponent(next.id);$('#next-project').append(a);}
}
function route(){
 const hash=location.hash.slice(1);let p;try{p=hash.startsWith('project/')&&data.projects.find(p=>p.id===decodeURIComponent(hash.slice(8)));}catch{}
 const target=p?'project':hash==='archive'?'archive':'home';
 if(target===currentView&&target==='home'){if(hash)requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({behavior:'instant'}));return;}
 
 if(currentView==='home')originScroll=scrollY;
 if(p)projectContent(p);
 const mutate=()=>{
  $('#home').hidden=target!=='home';$('#project-view').hidden=target!=='project';$('#archive-view').hidden=target!=='archive';
  const slot=target==='project'?$('#project-computer-slot'):$('#home-computer-slot');slot.append($('#computer'));$('#computer').hidden=target==='archive';
  
  document.title=p?p.title+' — beno.':target==='archive'?'The archive — beno.':'beno. — a few things on my mind';
  currentView=target; document.body.classList.toggle('detail',target!=='home'); updateReveal();
  if(target==='home'){const section=document.getElementById(hash);if(section)section.scrollIntoView({behavior:'instant'});else window.scrollTo({top:0,behavior:'instant'});}else window.scrollTo({top:0,behavior:'instant'});
 };
 const finish=()=>{if(p)$('#project-title').focus({preventScroll:true});else if(target==='archive')$('#archive-view').setAttribute('tabindex','-1'),$('#archive-view').focus({preventScroll:true});$('#announcer').textContent=p?p.title+' project opened':target==='archive'?'Archive opened':'Back to the table';};
 if(document.startViewTransition&&!reduced){const t=document.startViewTransition(mutate);t.finished.then(finish).catch(finish);}else{const before=$('#computer').getBoundingClientRect();mutate();const after=$('#computer').getBoundingClientRect();if(!reduced&&before.width&&after.width)$('#computer').animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px) scale(${before.width/after.width})`},{transform:'none'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});finish();}
}
function pick(){
 const pool=data.essays.filter(e=>e.id!==lastPick);const e=(pool.length?pool:data.essays)[Math.floor(Math.random()*(pool.length||data.essays.length))];if(!e)return;
 lastPick=e.id;$('#surprise-heading').textContent=e.title;$('#surprise-note').textContent=e.note;$('#surprise-author').textContent=e.author;const url=safeURL(e.url);$('#surprise-read').hidden=!url;if(url)$('#surprise-read').href=url;
 if(!$('#surprise-dialog').open)$('#surprise-dialog').showModal();
}
function shufflePeople(){
 const pool=[...(data.illustrations||[])];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 document.querySelectorAll('.people').forEach((el,i)=>{el.replaceChildren();const p=pool[i%pool.length];if(!p)return;const figure=make('figure','person-figure');const art=make('span','person-art');art.setAttribute('role','img');art.setAttribute('aria-label',p.name);art.title=p.name;art.style.backgroundImage='url("'+p.image+'")';art.style.backgroundSize=p.atlas?'400% 200%':'contain';art.style.backgroundPosition=p.atlas?(p.col/3*100)+'% '+(p.row*100)+'%':'center';figure.append(art,make('figcaption','',p.name));el.append(figure);});
}
$('#surprise').addEventListener('click',pick);$('#pick-again').addEventListener('click',pick);$('.dialog-close').addEventListener('click',()=>$('#surprise-dialog').close());$('#surprise-dialog').addEventListener('click',e=>{if(e.target===$('#surprise-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
try{const r=await fetch('content/site.json');if(!r.ok)throw Error('Content unavailable');data=await r.json();if(data.writingSource==='feed'){try{const feedResponse=await fetch('content/substack.json');if(feedResponse.ok){const cachedFeed=await feedResponse.json();if(cachedFeed.posts?.length)data.writing=cachedFeed.posts;}}catch{}}render();$('#home-computer-slot').append($('#computer'));window.addEventListener('hashchange',route);route();}catch(error){console.error(error);$('#site-error').hidden=false;}

function updateReveal(){
 const landing=document.querySelector('.landing');if(!landing)return;
 const progress=Math.max(0,Math.min(1,window.scrollY/(landing.offsetHeight*.75)));
 document.documentElement.style.setProperty('--reveal',String(progress));
 document.body.classList.toggle('revealed',progress>.9); document.getElementById('site-header').inert=currentView==='home'&&progress<=.9; document.querySelector('.table-reveal').inert=progress<.9;
}
let scrollQueued=false;
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{updateReveal();scrollQueued=false;});}},{passive:true});
window.addEventListener('resize',updateReveal);
updateReveal();
const cultureDialog=document.getElementById('culture-dialog');
document.querySelectorAll('[data-culture]').forEach(button=>button.addEventListener('click',()=>{
 const kind=button.dataset.culture;
 document.getElementById('culture-title').textContent=kind;
 for(const name of ['books','films','albums'])document.getElementById(name).hidden=name!==kind;
 const container=document.getElementById(kind);
 if(!container.children.length)container.append(make('p','empty-culture','Nothing here just yet.'));
 if(!cultureDialog.open)cultureDialog.showModal();
}));
document.querySelector('.culture-close').addEventListener('click',()=>cultureDialog.close());
cultureDialog.addEventListener('click',e=>{if(e.target===cultureDialog){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cultureDialog.close();}});

const shelfScroller=document.getElementById('culture-scroll');
document.querySelectorAll('[data-shelf-target]').forEach(button=>button.addEventListener('click',()=>{
 const target=document.getElementById('shelf-'+button.dataset.shelfTarget);
 const top=target.offsetTop-document.getElementById('shelf-books').offsetTop;
 shelfScroller.scrollTo({top,behavior:reduced?'instant':'smooth'});
 document.querySelectorAll('[data-shelf-target]').forEach(b=>b.setAttribute('aria-current',String(b===button)));
}));
document.getElementById('shelf-up').addEventListener('click',()=>shelfScroller.scrollBy({top:-shelfScroller.clientHeight*.75,behavior:reduced?'instant':'smooth'}));
document.getElementById('shelf-down').addEventListener('click',()=>shelfScroller.scrollBy({top:shelfScroller.clientHeight*.75,behavior:reduced?'instant':'smooth'}));

// A tap gives several puffs; another tap renews the short burst.
const coffee=document.getElementById('coffee');
let coffeeSteamTimer;
coffee.addEventListener('click',()=>{
 clearTimeout(coffeeSteamTimer);
 coffee.classList.add('is-steaming');
 coffeeSteamTimer=setTimeout(()=>coffee.classList.remove('is-steaming'),4200);
});
