/* Nocturna · Dark Romanticism enhancement layer */
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SOURCE=typeof DATA!=="undefined"?DATA:{},cats=SOURCE.cats||[],pubs=SOURCE.pubs||[],catById=new Map(cats.map(c=>[c.id,c]));
const countWords=s=>String(s||"").trim().split(/\s+/).filter(Boolean).length;
const isHome=()=>!location.hash&&(/\/Nocturna\/?$/.test(location.pathname)||location.pathname==="/");
const currentPub=()=>{const m=location.hash.match(/#\/artigos\/([^/?#]+)/)||location.pathname.match(/\/artigos\/([^/]+)\/?$/);return m?pubs.find(p=>p.id===decodeURIComponent(m[1])):null};
function heroSigil(){const hero=$(".hero");if(!hero||$(".nr-hero-sigil"))return;const el=document.createElement("div");el.className="nr-hero-sigil";el.setAttribute("aria-hidden","true");el.innerHTML='<span class="nr-sigil-glyph">☾</span>';hero.append(el)}
function constellation(){if(!isHome()||$(".nr-visual-section"))return;const sec=document.createElement("section");sec.className="nr-visual-section";sec.setAttribute("aria-labelledby","nr-map-title");const n=cats.length||1,cx=310,cy=160,rx=220,ry=112;
const points=cats.map((c,i)=>{const a=-Math.PI/2+i/n*Math.PI*2;return {...c,x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)}});
const lines=points.map((p,i)=>{const q=points[(i+1)%points.length];return '<line x1="'+p.x+'" y1="'+p.y+'" x2="'+q.x+'" y2="'+q.y+'" />'}).join("");
const nodes=points.map(p=>'<g><circle cx="'+p.x+'" cy="'+p.y+'" r="10"/><text x="'+p.x+'" y="'+(p.y+28)+'" text-anchor="middle">'+esc(p.name)+'</text></g>').join("");
sec.innerHTML='<span class="nr-kicker">✦ cartografia editorial</span><h2 id="nr-map-title">Constelação editorial</h2><p class="meta">As categorias funcionam como pontos de uma mesma noite intelectual. Nenhuma ideia precisa fingir que vive sozinha.</p><div class="nr-constellation"><svg viewBox="0 0 620 330" role="img" aria-label="Diagrama das categorias editoriais da Nocturna"><g fill="none" stroke="rgba(163,58,86,.45)" stroke-width="1">'+lines+'</g><circle cx="'+cx+'" cy="'+cy+'" r="48" fill="rgba(110,25,50,.16)" stroke="rgba(201,173,120,.4)"/><text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" fill="#efe6d5" font-family="Georgia,serif" font-size="20">Nocturna</text><g fill="#a33a56" stroke="#c9ad78" stroke-width="1.5">'+nodes+'</g></svg></div>';
$("#main")?.append(sec)}
function readingBar(){const article=$(".read");const p=currentPub();if(!article||$(".nr-reading-bar",article)||!p)return;const words=countWords(p.content),mins=Math.max(1,Math.round(words/210));const bar=document.createElement("div");bar.className="nr-reading-bar";bar.setAttribute("aria-label","Metadados da leitura");bar.innerHTML='<span>☾ leitura</span><span>⌛ '+mins+' min</span><span>✒ '+words.toLocaleString("pt-BR")+' palavras</span><span>✦ '+(p.tags?.length||0)+' conceitos</span>';const fig=$("figure",article);fig?fig.after(bar):article.prepend(bar)}
function infographic(){const article=$(".read"),p=currentPub();if(!article||!p||$(".nr-infographic",article))return;const data=(p.cats||[]).map(id=>{const c=catById.get(id);return c?{name:c.name,n:pubs.filter(x=>(x.cats||[]).includes(id)).length}:null}).filter(Boolean),max=Math.max(1,...data.map(x=>x.n));const sec=document.createElement("section");sec.className="nr-infographic";sec.setAttribute("aria-labelledby","nr-density-title");sec.innerHTML='<div class="nr-infographic-head"><div><span class="nr-kicker">✦ índice temático</span><h2 id="nr-density-title">Densidade das categorias</h2></div><span class="nr-caption">presença no acervo</span></div><div class="nr-bars">'+data.map(x=>'<div class="nr-bar"><span class="nr-bar-label">'+esc(x.name)+'</span><span class="nr-track"><span class="nr-fill" style="width:'+Math.round(x.n/max*100)+'%"></span></span><span class="nr-bar-value">'+x.n+'</span></div>').join("")+'</div><p class="nr-note">Uma visualização editorial, não uma medida de valor ou importância.</p>';article.insertBefore(sec,$(".read-content",article))}
function conceptDiagram(){const article=$(".read"),p=currentPub();if(!article||!p||$(".nr-diagram",article))return;const concepts=(p.tags||[]).slice(0,8);if(!concepts.length)return;const sec=document.createElement("section");sec.className="nr-diagram";sec.setAttribute("aria-labelledby","nr-diagram-title");const pts=concepts.map((t,i)=>{const a=i/concepts.length*Math.PI*2-Math.PI/2;return{x:260+Math.cos(a)*190,y:150+Math.sin(a)*100,t}}),lines=pts.map(x=>'<line x1="260" y1="150" x2="'+x.x+'" y2="'+x.y+'" />').join(""),labels=pts.map(x=>'<g><circle cx="'+x.x+'" cy="'+x.y+'" r="7"/><text x="'+x.x+'" y="'+(x.y+23)+'" text-anchor="middle">'+esc(x.t.slice(0,18))+'</text></g>').join("");sec.innerHTML='<span class="nr-kicker">☩ diagrama de leitura</span><h2 id="nr-diagram-title">Eixo conceitual</h2><svg viewBox="0 0 520 310" role="img" aria-label="Diagrama com os principais conceitos da publicação"><g stroke="rgba(163,58,86,.48)" stroke-width="1">'+lines+'</g><circle cx="260" cy="150" r="42" fill="rgba(110,25,50,.2)" stroke="rgba(201,173,120,.5)"/><text x="260" y="155" text-anchor="middle" fill="#efe6d5" font-family="Georgia,serif" font-size="17">texto</text><g fill="#a33a56" stroke="#c9ad78" stroke-width="1">'+labels+'</g></svg><p class="nr-note">Os conceitos são extraídos das tags editoriais da própria publicação. O diagrama sugere relações, não inventa uma tese nova. Humanos já fazem isso bastante sem ajuda.</p>';article.insertBefore(sec,article.querySelector(".pager")||null)}
function adorn(){heroSigil();constellation();readingBar();infographic();conceptDiagram()}
adorn();addEventListener("hashchange",()=>setTimeout(adorn,0));
})();
/* Nocturna · Editorial visual system v2 */
(()=>{"use strict";
const esc2=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const data2=typeof DATA!=="undefined"?DATA:{}, pubs2=data2.pubs||[], cats2=data2.cats||[];
const byId2=new Map(pubs2.map(p=>[p.id,p]));
const root2="/Nocturna/";
const slug2=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const fallbackArt2=(p)=>{
 const title=esc2(String(p.title||"Nocturna").slice(0,44));
 const cat=(p.cats||[]).map(id=>cats2.find(c=>c.id===id)?.name).filter(Boolean)[0]||"Ensaio";
 const catSafe=esc2(cat);
 const seed=(String(p.id||"nocturna").length%5)+1;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><defs><radialGradient id="g"><stop stop-color="#8b2948"/><stop offset="1" stop-color="#0d0b0f"/></radialGradient></defs><rect width="1200" height="675" fill="#0d0b0f"/><circle cx="'+(760+seed*20)+'" cy="250" r="250" fill="url(#g)" opacity=".72"/><path d="M120 540 Q360 '+(390-seed*15)+' 600 540 T1080 540" fill="none" stroke="#d2b77f" stroke-opacity=".5" stroke-width="2"/><circle cx="600" cy="285" r="94" fill="none" stroke="#d2b77f" stroke-opacity=".34"/><path d="M600 192 L650 285 L600 378 L550 285 Z" fill="none" stroke="#b34362" stroke-width="2"/><text x="72" y="82" fill="#d2b77f" font-family="Georgia,serif" font-size="20" letter-spacing="5">NOCTURNA · '+catSafe.toUpperCase()+'</text><text x="72" y="600" fill="#f2eadc" font-family="Georgia,serif" font-size="34">'+title+'</text></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
};
const artSrc2=p=>{const s=p?.image?.src;if(!s)return root2+"assets/editorial/"+slug2(p?.title||p?.id)+".svg";if(/^(https?:|data:|\/)/.test(s))return s;return root2+s.replace(/^\.\//,"");};
function cardArt2(card,p){
 if(!card||!p||card.dataset.nrArt==="1")return;
 const a=card.querySelector("a[href*='/artigos/']");
 if(!a)return;
 card.dataset.nrArt="1";
 const art=document.createElement("div"); art.className="nr-card-art";
 const img=document.createElement("img"); img.loading="lazy"; img.decoding="async"; img.alt=p.image?.alt||("Arte editorial de "+p.title);
 img.src=artSrc2(p); img.onerror=()=>{if(img.dataset.fallback)return;img.dataset.fallback="1";img.src=fallbackArt2(p)};
 art.appendChild(img);
 const body=document.createElement("div"); body.className="nr-card-body";
 while(card.firstChild)body.appendChild(card.firstChild);
 const kicker=document.createElement("div"); kicker.className="nr-card-kicker"; kicker.textContent=(p.cats||[]).map(id=>cats2.find(c=>c.id===id)?.name).filter(Boolean)[0]||"Ensaio";
 body.insertBefore(kicker,body.firstChild);
 card.append(art,body);
}
function decorateCards2(){
 document.querySelectorAll(".card").forEach(card=>{
   const a=card.querySelector("a[href*='/artigos/']"); if(!a)return;
   const m=a.getAttribute("href").match(/\/artigos\/([^/?#]+)/); const p=m&&byId2.get(decodeURIComponent(m[1]));
   if(p)cardArt2(card,p);
 });
}
function decoratePost2(){
 const read=document.querySelector(".read"); if(!read)return;
 const m=location.hash.match(/#\/artigos\/([^/?#]+)/)||location.pathname.match(/\/artigos\/([^/]+)\/?$/);
 const p=m&&byId2.get(decodeURIComponent(m[1])); if(!p)return;
 if(!read.querySelector(".nr-post-art")){
   const fig=document.createElement("figure");fig.className="nr-post-art";
   const img=document.createElement("img");img.loading="eager";img.decoding="async";img.alt=p.image?.alt||("Arte editorial de "+p.title);img.src=artSrc2(p);
   img.onerror=()=>{if(img.dataset.fallback)return;img.dataset.fallback="1";img.src=fallbackArt2(p)};
   fig.appendChild(img);
   const cap=document.createElement("figcaption");cap.textContent=p.image?.caption||"Composição editorial original · Nocturna";fig.appendChild(cap);
   const content=read.querySelector(".read-content"); content?read.insertBefore(fig,content):read.prepend(fig);
 }
}
function refresh2(){decorateCards2();decoratePost2();}
refresh2();
new MutationObserver(()=>refresh2()).observe(document.body,{subtree:true,childList:true});
addEventListener("hashchange",()=>setTimeout(refresh2,40));
})();


(()=>{'use strict';
const RP='nocturna-reading-progress-v1',RR='nocturna-reading-read-v1',RA='nocturna-reading-activity-v1',ROOT='/Nocturna/';
const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const reads=()=>{const v=get(RR,[]);return new Set(Array.isArray(v)?v:Object.keys(v||{}).filter(k=>v[k]))},prog=()=>get(RP,{});
const roman=n=>{let s='';for(const x of [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=x[0])s+=x[1],n-=x[0];return s};
const route=()=>{const raw=location.hash.slice(1)||location.pathname.replace(/^\/Nocturna(?=\/|$)/,'')||'/';return(raw.replace(/\/+$/,'')||'/')};
const ctx=()=>{const m=route().match(/^\/series\/([^/]+)\/([^/]+)\/([^/]+)$/);if(!m)return;const d=decodeURIComponent,s=(DATA.series||[]).find(x=>x.slug===d(m[1])||x.id===d(m[1])),b=s?.blocks?.find(x=>x.slug===d(m[2])||x.id===d(m[2])),c=b?.chapters?.find(x=>x.slug===d(m[3])||x.id===d(m[3]));if(!s||!b||!c)return;const all=(s.blocks||[]).flatMap(z=>(z.chapters||[]).map(y=>({s,b:z,c:y}))),i=all.findIndex(x=>x.c.id===c.id);return{s,b,c,all,i,id:'series:'+s.id+':chapter:'+c.id,url:ROOT+'series/'+encodeURIComponent(s.slug)+'/'+encodeURIComponent(b.slug)+'/'+encodeURIComponent(c.slug)}};
const pubCtx=()=>{const m=route().match(/^\/artigos\/([^/]+)$/);if(!m)return;const p=(DATA.pubs||[]).find(x=>x.id===decodeURIComponent(m[1]));return p?{p,id:'article:'+p.id,url:ROOT+'#/artigos/'+encodeURIComponent(p.id)+'/'}:null};
const state=s=>{const a=(s.blocks||[]).flatMap(x=>x.chapters||[]),r=reads(),n=a.filter(c=>r.has('series:'+s.id+':chapter:'+c.id)).length;return{a,n,t:a.length,p:a.length?Math.round(n/a.length*100):0}};
const collectionProgress=s=>{const chapters=(s.blocks||[]).flatMap(b=>b.chapters||[]),q=prog(),n=chapters.filter(c=>Math.round(q['series:'+s.id+':chapter:'+c.id]?.percent||0)>=100).length;return{t:chapters.length,n,p:chapters.length?Math.round(n/chapters.length*100):0}};
const collectionIsRead=s=>{const chapters=(s.blocks||[]).flatMap(b=>b.chapters||[]);if(!chapters.length)return false;const q=prog();return chapters.every(c=>Math.round(q['series:'+s.id+':chapter:'+c.id]?.percent||0)>=100)};
const publicationIsRead=p=>Math.round(prog()['article:'+p.id]?.percent||0)>=100;
const root=()=>document.querySelector('article.series-content')?.querySelector(':scope > .series-content')||document.querySelector('article.series-content');
const pubRoot=()=>document.querySelector('.read .read-content');
const pctFrom=el=>{if(!el)return 0;const r=el.getBoundingClientRect(),a=r.top+scrollY,b=r.bottom+scrollY;if(b<=a)return 0;if(scrollY+innerHeight>=b-4)return 100;return Math.round(Math.max(0,Math.min(1,(scrollY+innerHeight*.45-a)/(b-a)))*100)};
const pct=()=>pctFrom(root());
const pubPct=()=>pctFrom(pubRoot());
const anchor=x=>{const q=root();if(!q)return;const p=[...q.querySelectorAll('p,[data-reading-block-id],[data-block-id]')];p.forEach((e,i)=>e.dataset.readingBlockId ||= e.id?'id:'+e.id:(e.getAttribute('data-block-id')||'p-'+(i+1)));if(!p.length)return;const y=scrollY+innerHeight*.28,e=p.reduce((a,z)=>Math.abs(z.getBoundingClientRect().top+scrollY+z.getBoundingClientRect().height/2-y)<Math.abs(a.getBoundingClientRect().top+scrollY+a.getBoundingClientRect().height/2-y)?z:a);const r=e.getBoundingClientRect();return{contentId:x.id,contentUrl:x.url,url:x.url,blockId:e.dataset.readingBlockId,offset:+Math.max(0,Math.min(1,(y-r.top-scrollY)/Math.max(1,r.height))).toFixed(4),timestamp:Date.now()}};
const saveSeries=x=>{const q=prog(),o=q[x.id]||{},now=Date.now();q[x.id]={...o,percent:pct(),url:x.url,anchor:anchor(x)||o.anchor||null,updatedAt:now};put(RP,q);put(RA,{collectionId:x.s.id,chapterId:x.c.id,url:x.url,updatedAt:now});refresh()};
const savePub=p=>{const q=prog(),id='article:'+p.id,now=Date.now();q[id]={...(q[id]||{}),percent:pubPct(),url:ROOT+'#/artigos/'+encodeURIComponent(p.id)+'/',updatedAt:now};put(RP,q);refresh()};
const save=()=>{const x=ctx();if(x)return saveSeries(x);const p=pubCtx();if(p)return savePub(p.p)};
const restore=async()=>{const x=ctx();if(!x)return;try{await document.fonts?.ready}catch{};await Promise.allSettled([...document.images].filter(i=>!i.complete).map(i=>new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const o=prog()[x.id]||{},a=o.anchor,e=a&&[...document.querySelectorAll('[data-reading-block-id]')].find(e=>e.dataset.readingBlockId===a.blockId);if(e){const r=e.getBoundingClientRect();scrollTo(0,Math.max(0,r.top+scrollY+r.height*(+a.offset||0)-innerHeight*.28));return}const q=root();if(q){const r=q.getBoundingClientRect();scrollTo(0,Math.max(0,r.top+scrollY+r.height*(+o.percent||0)/100-innerHeight*.45))}};
const style=()=>{if(document.getElementById('nr-read-style'))return;const s=document.createElement('style');s.id='nr-read-style';s.textContent='.nr-read-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin:1rem 0;padding:.75rem;border:1px solid var(--line);border-radius:8px;background:var(--panel)}.nr-read-summary b{display:block;font:600 1.15rem var(--serif)}.nr-read-summary span,.nr-read-state{color:var(--mute);font-size:.82rem}.nr-read-toggle{margin:.5rem 0}.nr-continue{margin:1.25rem 0 2rem;padding:1rem;border:1px solid var(--line);border-left:3px solid var(--wine2);border-radius:8px;background:var(--panel)}.nr-continue .nr-continue-track{display:block}.nr-continue .nr-continue-item{display:flex;flex-direction:column;gap:.35rem;padding:.85rem;border:1px solid var(--line);border-radius:8px;background:var(--bg,var(--panel));scroll-snap-align:start}.nr-continue .nr-continue-item h2{margin:.1rem 0 .5rem}.nr-continue .nr-continue-item p{margin:.35rem 0}.nr-continue .nr-continue-item .nr-continue-chapter,.nr-continue .nr-continue-item .nr-continue-collection{font-weight:600;letter-spacing:.02em}.nr-continue .nr-continue-item .nr-continue-count{color:var(--mute);font-size:.9rem}.nr-continue .nr-continue-item .btn{align-self:flex-start;margin-top:.65rem}.nr-continue .nr-read-list{display:flex;flex-wrap:wrap;gap:.35rem;margin:.5rem 0}.nr-continue .nr-read-list span{font-size:.8rem;color:var(--mute);padding:.15rem .45rem;border:1px solid var(--line);border-radius:999px}.nr-read-list-title{margin:.25rem 0 .1rem;font-size:.78rem;color:var(--mute);letter-spacing:.04em;text-transform:uppercase}.nr-category-map{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:.4rem;margin:.75rem 0;padding:.65rem;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.nr-category{min-width:0;text-align:center}.nr-category b{display:block;font:600 .78rem var(--serif);letter-spacing:.05em;text-transform:uppercase}.nr-category small{display:block;margin-top:.15rem;color:var(--mute);font-size:.68rem}.nr-category-arrow{color:var(--mute);font-size:.9rem;text-align:center}.card .nr-read-indicator{display:none!important}.nr-read-indicator{display:inline-flex;align-items:center;justify-content:center;width:max-content;margin:.55rem 0 .7rem;padding:.22rem .55rem;border:1px solid var(--line);border-radius:999px;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.nr-read-indicator.is-read{border-color:var(--wine2);color:var(--hi);background:rgba(163,58,86,.12)}.nr-read-indicator.is-unread{color:var(--mute);background:rgba(255,255,255,.025)}@media(max-width:560px){.nr-category-map{grid-template-columns:1fr;gap:.25rem}.nr-category-arrow{transform:rotate(90deg)}}';document.head.appendChild(s)};
const indicator=read=>'<span class="nr-read-indicator '+(read?'is-read':'is-unread')+'">'+(read?'LIDO':'NÃO LIDO')+'</span>';
const decorateStatus=()=>{};
const restorePub=async()=>{const p=pubCtx()?.p;if(!p)return;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const q=pubRoot(),o=prog()['article:'+p.id]||{};if(q&&o.percent>0&&o.percent<100){const r=q.getBoundingClientRect();scrollTo(0,Math.max(0,r.top+scrollY+r.height*(+o.percent||0)/100-innerHeight*.45))}};
const chapterUI=x=>{style();const a=document.querySelector('article.series-content');if(!a)return;const z=state(x.s),o=prog()[x.id]||{},r=reads().has(x.id),cp=r?100:Math.round(o.percent||0),lp=cp>=100?'100%':cp+'%',gc=z.p>=100?'100%':z.p+'%',sig=[cp,z.p,z.n,r].join('|');let w=a.querySelector('.nr-read-wrap');if(!w){w=document.createElement('div');w.className='nr-read-wrap';a.querySelector('h1')?.insertAdjacentElement('afterend',w)}if(w.dataset.sig===sig)return;w.dataset.sig=sig;w.innerHTML='<section class="nr-read-summary"><div><b>'+lp+'</b><span>Capítulo</span></div><div><b>'+gc+'</b><span>Coleção</span></div><div><b>'+z.n+' de '+z.t+'</b><span>capítulos concluídos</span></div></section><button class="btn alt nr-read-toggle" data-rid="'+x.id+'">'+(r?'Desmarcar como lido':'Marcar como lido')+'</button>};
const allChapters=()=> (DATA.series||[]).flatMap(s=>(s.blocks||[]).flatMap(b=>(b.chapters||[]).map(c=>({s,b,c,id:'series:'+s.id+':chapter:'+c.id,url:ROOT+'series/'+encodeURIComponent(s.slug||s.id)+'/'+encodeURIComponent(b.slug||b.id)+'/'+encodeURIComponent(c.slug||c.id)}))));
const chooseResume=()=>{const all=allChapters(),r=reads(),q=prog(),a=get(RA,null),active=a&&all.find(y=>y.s.id===a.collectionId&&y.c.id===a.chapterId&&!r.has(y.id));if(active)return active;const pending=all.filter(y=>!r.has(y.id)&&q[y.id]?.percent>0).sort((u,v)=>(q[v.id]?.updatedAt||0)-(q[u.id]?.updatedAt||0));if(pending[0])return pending[0];return all.find(y=>!r.has(y.id))||null};
const home=()=>{const p=location.pathname.replace(/\/+$/,'')||'/';if(p!=='/'&&p!=='/Nocturna')return;style();const all=allChapters(),r=reads(),q=prog(),x=chooseResume();if(!x){const review=all[0];if(!review)return;const z=state(review.s),readList=z.a.map((c,i)=>r.has('series:'+review.s.id+':chapter:'+c.id)?'<span>CAPÍTULO '+roman(i+1)</span>':'').join(''),old=document.querySelector('.nr-continue');old?.remove();const card=document.createElement('section');card.className='nr-continue';card.innerHTML='<p class="eyebrow">CONTINUAR LEITURA</p><div class="nr-continue-track"><article class="nr-continue-item"><h2>'+review.s.title+'</h2><p class="nr-read-list-title">CAPÍTULOS CONCLUÍDOS</p><div class="nr-read-list">'+readList+'</div><p class="nr-continue-collection">COLEÇÃO · 100%</p><p class="nr-continue-count">'+z.n+' de '+z.t+' capítulos concluídos</p><a class="btn" href="'+review.url+'">REVISAR COLEÇÃO</a></article></div>';const main=document.getElementById('main'),hero=document.querySelector('.hero');(hero?.parentNode?hero.parentNode.insertBefore(card,hero.nextSibling):main?.prepend(card));return}const z=state(x.s),o=q[x.id]||{},i=z.a.findIndex(c=>c.id===x.c.id),cp=r.has(x.id)?100:Math.round(o.percent||0),lp=cp>=100?'100%':cp+'%',gc=z.p>=100?'100%':z.p+'%',readList=z.a.map((c,j)=>r.has('series:'+x.s.id+':chapter:'+c.id)?'<span>CAPÍTULO '+roman(j+1)</span>':'').join(''),sig=[x.id,z.p,z.n,cp,r.size].join('|'),old=document.querySelector('.nr-continue');if(old?.dataset.sig===sig)return;old?.remove();const card=document.createElement('section');card.className='nr-continue';card.dataset.sig=sig;card.innerHTML='<p class="eyebrow">CONTINUAR LEITURA</p><div class="nr-continue-track"><article class="nr-continue-item"><h2>'+x.s.title+'</h2>'+(readList?'<p class="nr-read-list-title">CAPÍTULOS CONCLUÍDOS</p><div class="nr-read-list">'+readList+'</div>':'')+'<p class="nr-continue-chapter">CAPÍTULO '+roman(i+1)+' · '+lp+'</p><p class="nr-continue-collection">COLEÇÃO · '+gc+'</p><p class="nr-continue-count">'+z.n+' de '+z.t+' capítulos concluídos</p><a class="btn" href="'+x.url+'">CONTINUAR LEITURA</a></article></div>';const main=document.getElementById('main'),hero=document.querySelector('.hero');(hero?.parentNode?hero.parentNode.insertBefore(card,hero.nextSibling):main?.prepend(card))};
const refresh=()=>{const x=ctx();if(x){chapterUI(x)}else if(!location.hash)home();decorateStatus()};let frame=0,lastSave=0;const onReadingScroll=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const now=Date.now();if(now-lastSave<250)return;lastSave=now;save()})};const onReadingPageHide=()=>save();const onReadingVisibility=()=>document.visibilityState==='hidden'&&save();addEventListener('scroll',onReadingScroll,{passive:true});addEventListener('pagehide',onReadingPageHide);addEventListener('visibilitychange',onReadingVisibility);addEventListener('hashchange',()=>setTimeout(()=>{refresh();const x=ctx();if(x){put(RA,{collectionId:x.s.id,chapterId:x.c.id,url:x.url,updatedAt:Date.now()});restore()}else if(pubCtx())restorePub()},50));document.addEventListener('click',e=>{const b=e.target.closest('.nr-read-toggle');if(!b)return;const r=reads();r.has(b.dataset.rid)?r.delete(b.dataset.rid):r.add(b.dataset.rid);put(RR,[...r]);refresh();home()});new MutationObserver(refresh).observe(document.getElementById('main')||document.body,{childList:true,subtree:true});style();refresh();const initial=ctx();if(initial){put(RA,{collectionId:initial.s.id,chapterId:initial.c.id,url:initial.url,updatedAt:Date.now()});restore()}else if(pubCtx())restorePub();
})();

/* NOCTURNA_PHILOSOPHICAL_QUOTES */
(()=>{"use strict";
/* A página de frases é acessada pelo rodapé. Nenhum componente de comentários é injetado nas publicações. */
})();


/* NOCTURNA_COVER_INTERACTION_FLAGS_V1 */
(()=>{"use strict";
const FAV_KEY="nocturna-cover-favorites-v1";
const PROGRESS_KEY="nocturna-reading-progress-v1";
const ROOT="/Nocturna/";
const readJson=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch{return fallback}};
const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const escCover=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const data=typeof DATA!=="undefined"?DATA:{};
const pubs=Array.isArray(data.pubs)?data.pubs:[];
const series=Array.isArray(data.series)?data.series:[];
const favorites=()=>readJson(FAV_KEY,{});
const progress=()=>readJson(PROGRESS_KEY,{});
const slug=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const decodePart=s=>{try{return decodeURIComponent(s)}catch{return s}};
const publicationFromCard=card=>{
  const link=card.querySelector("a[href*='/artigos/'],a[href*='#/artigos/']");
  if(!link)return null;
  const href=link.getAttribute("href")||"";
  const match=href.match(/(?:#)?\/artigos\/([^/?#]+)/);
  if(!match)return null;
  const id=decodePart(match[1]);
  return pubs.find(p=>p.id===id)||null;
};
const collectionFromCard=card=>{
  const link=card.querySelector("a[href*='/series/'],a[href*='#/series/']");
  if(!link)return null;
  const href=link.getAttribute("href")||"";
  const match=href.match(/(?:#)?\/series\/([^/?#]+)/);
  if(!match)return null;
  const id=decodePart(match[1]);
  return series.find(s=>s.id===id||s.slug===id||slug(s.id)===id||slug(s.title)===id)||null;
};
const publicationIsRead=p=>Math.round(progress()["article:"+p.id]?.percent||0)>=100;
const collectionKey=s=>"collection:"+s.id;
const publicationKey=p=>"article:"+p.id;
const isFavorite=key=>favorites()[key]===true;
const setFavorite=(key,next)=>{
  const q=favorites();
  if(next)q[key]=true;else delete q[key];
  writeJson(FAV_KEY,q);
};
const setPublicationRead=(p,next)=>{
  const q=progress(),key=publicationKey(p);
  if(next){
    q[key]={...(q[key]||{}),percent:100,url:ROOT+"#/artigos/"+encodeURIComponent(p.id)+"/",updatedAt:Date.now()};
  }else{
    delete q[key];
  }
  writeJson(PROGRESS_KEY,q);
};
const button=(kind)=>{
  const b=document.createElement("button");
  b.type="button";
  b.className="nr-cover-flag nr-cover-flag-"+kind;
  b.dataset.nrCoverFlag=kind;
  b.setAttribute("aria-live","polite");
  return b;
};
const setFavoriteButton=(b,active)=>{
  b.classList.toggle("is-favorite",active);
  b.setAttribute("aria-pressed",String(active));
  b.setAttribute("aria-label",active?"Remover dos favoritos":"Adicionar aos favoritos");
  const html='<span class="nr-cover-heart" aria-hidden="true">'+(active?"♥":"♡")+'</span><span class="nr-cover-label">Favorito</span>';
  if(b.innerHTML!==html)b.innerHTML=html;
};
const setReadButton=(b,active)=>{
  b.classList.toggle("is-read",active);
  b.setAttribute("aria-pressed",String(active));
  b.setAttribute("aria-label",active?"Marcar como não lido":"Marcar como lido");
  const label=active?"Lido":"Marcar como lido";
  if(b.textContent!==label)b.textContent=label;
};
const installStyles=()=>{
  if(document.getElementById("nr-cover-flag-style"))return;
  const s=document.createElement("style");
  s.id="nr-cover-flag-style";
  s.textContent=
    '.nr-cover-flag-host{position:relative!important;isolation:isolate!important}'+
    '.nr-cover-flag-host>.nr-cover-flag{position:absolute;top:10px;z-index:8;display:inline-flex;align-items:center;justify-content:center;gap:.3rem;min-height:40px;min-width:40px;padding:.42rem .62rem;border:1px solid rgba(255,255,255,.34);border-radius:999px;background:rgba(18,18,18,.84);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#fff;font:600 .78rem/1 var(--sans,system-ui,sans-serif);letter-spacing:.01em;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.35);touch-action:manipulation;-webkit-tap-highlight-color:transparent}'+
    '.nr-cover-flag-host>.nr-cover-flag:hover{background:rgba(34,34,34,.94);border-color:rgba(255,255,255,.62)}'+
    '.nr-cover-flag-host>.nr-cover-flag:focus-visible{outline:2px solid var(--hi,#e0bfae);outline-offset:2px}'+
    '.nr-cover-flag-favorite{right:10px}'+
    '.nr-cover-flag-read{left:10px}'+
    '.nr-cover-flag-favorite .nr-cover-heart{font-size:1.05rem;line-height:1;color:#fff}'+
    '.nr-cover-flag-favorite.is-favorite{border-color:#ef4d67;background:rgba(91,12,30,.9);color:#fff}'+
    '.nr-cover-flag-favorite.is-favorite .nr-cover-heart{color:#ef4d67}'+
    '.nr-cover-flag-read.is-read{border-color:#9c2d49;background:rgba(122,31,53,.92);color:#fff}'+
    '.nr-cover-flag-read:not(.is-read){color:#fff}'+
    '.nr-cover-frame{position:relative!important;isolation:isolate!important}'+
    '.nr-cover-frame>img,.nr-cover-frame>.series-cover{display:block}'+
    '@media(max-width:560px){.nr-cover-flag-host>.nr-cover-flag{top:8px;min-height:40px;padding:.4rem .55rem;font-size:.72rem}.nr-cover-flag-favorite{right:8px}.nr-cover-flag-read{left:8px}.nr-cover-flag-favorite .nr-cover-label{display:none}}';
  document.head.appendChild(s);
};
const ensureCoverHost=card=>{
  let host=card.querySelector(".nr-card-art,.nr-cover-frame");
  if(host)return host;
  const cover=card.querySelector(".series-cover");
  if(!cover)return null;
  host=document.createElement("div");
  host.className="nr-cover-frame";
  cover.parentNode.insertBefore(host,cover);
  host.appendChild(cover);
  return host;
};
const wirePublication=card=>{
  const p=publicationFromCard(card);
  if(!p)return;
  const host=ensureCoverHost(card);
  if(!host)return;
  host.classList.add("nr-cover-flag-host");
  let read=host.querySelector('[data-nr-cover-flag="read"]');
  let fav=host.querySelector('[data-nr-cover-flag="favorite"]');
  if(!read){
    read=button("read");
    host.appendChild(read);
    read.addEventListener("click",e=>{
      e.preventDefault();e.stopPropagation();
      setPublicationRead(p,!publicationIsRead(p));
      refresh();
    });
  }
  if(!fav){
    fav=button("favorite");
    host.appendChild(fav);
    fav.addEventListener("click",e=>{
      e.preventDefault();e.stopPropagation();
      setFavorite(publicationKey(p),!isFavorite(publicationKey(p)));
      refresh();
    });
  }
  setReadButton(read,publicationIsRead(p));
  setFavoriteButton(fav,isFavorite(publicationKey(p)));
};
const wireCollection=card=>{
  const s=collectionFromCard(card);
  if(!s)return;
  const host=ensureCoverHost(card);
  if(!host)return;
  host.classList.add("nr-cover-flag-host");
  let fav=host.querySelector('[data-nr-cover-flag="favorite"]');
  if(!fav){
    fav=button("favorite");
    host.appendChild(fav);
    fav.addEventListener("click",e=>{
      e.preventDefault();e.stopPropagation();
      setFavorite(collectionKey(s),!isFavorite(collectionKey(s)));
      refresh();
    });
  }
  setFavoriteButton(fav,isFavorite(collectionKey(s)));
};
const refresh=()=>{
  installStyles();
  document.querySelectorAll(".card").forEach(card=>{
    if(publicationFromCard(card))wirePublication(card);
    else if(collectionFromCard(card))wireCollection(card);
  });
};
refresh();
new MutationObserver(()=>refresh()).observe(document.body,{subtree:true,childList:true});
})();
