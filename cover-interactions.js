(()=>{"use strict";
const FAV_KEY="nocturna-cover-favorites-v1";
const READ_KEY="nocturna-reading-progress-v1";
const ROOT="/Nocturna/";

const json=(key,fallback)=>{
  try{const v=JSON.parse(localStorage.getItem(key));return v==null?fallback:v}catch{return fallback}
};
const save=(key,value)=>{
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
};
const data=typeof window.DATA==="object"?window.DATA:{};
const pubs=Array.isArray(data.pubs)?data.pubs:[];
const series=Array.isArray(data.series)?data.series:[];

const pubFromCard=card=>{
  const a=card.querySelector("a[href*='/artigos/']");
  if(!a)return null;
  const m=(a.getAttribute("href")||"").match(/(?:#)?\/artigos\/([^/?#]+)/);
  if(!m)return null;
  let id=m[1];
  try{id=decodeURIComponent(id)}catch{}
  return pubs.find(p=>p.id===id)||null;
};
const seriesFromCard=card=>{
  const a=card.querySelector("a[href*='/series/']");
  if(!a)return null;
  const m=(a.getAttribute("href")||"").match(/(?:#)?\/series\/([^/?#]+)/);
  if(!m)return null;
  let id=m[1];
  try{id=decodeURIComponent(id)}catch{}
  return series.find(s=>s.id===id||s.slug===id)||null;
};
const fav=(key,on)=>{
  const q=json(FAV_KEY,{});
  if(on)q[key]=true;else delete q[key];
  save(FAV_KEY,q);
};
const isFav=key=>json(FAV_KEY,{})[key]===true;
const isRead=p=>Math.round(json(READ_KEY,{})["article:"+p.id]?.percent||0)>=100;
const setRead=(p,on)=>{
  const q=json(READ_KEY,{});
  const key="article:"+p.id;
  if(on)q[key]={...(q[key]||{}),percent:100,url:ROOT+"#/artigos/"+encodeURIComponent(p.id)+"/",updatedAt:Date.now()};
  else delete q[key];
  save(READ_KEY,q);
};

const ensureStyle=()=>{
  if(document.getElementById("nocturna-cover-actions-style"))return;
  const s=document.createElement("style");
  s.id="nocturna-cover-actions-style";
  s.textContent=
    ".nocturna-cover-actions{position:absolute!important;inset:0!important;z-index:50!important;pointer-events:none!important}"+
    ".nocturna-cover-action{position:absolute!important;top:8px!important;z-index:51!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.32rem!important;min-height:44px!important;padding:.42rem .68rem!important;border:1px solid rgba(255,255,255,.62)!important;border-radius:999px!important;background:rgba(10,10,12,.94)!important;color:#fff!important;font:600 .78rem/1 system-ui,sans-serif!important;box-shadow:0 3px 14px rgba(0,0,0,.58)!important;cursor:pointer!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;pointer-events:auto!important}"+
    ".nocturna-cover-action.read{left:8px!important}"+
    ".nocturna-cover-action.favorite{right:8px!important}"+
    ".nocturna-cover-action.favorite.active{border-color:#ef4d67!important;background:#5b0c1e!important}"+
    ".nocturna-cover-action.favorite .heart{font-size:1.1rem!important;line-height:1!important}"+
    ".nocturna-cover-action.favorite.active .heart{color:#ff4964!important}"+
    ".nocturna-cover-action.read.active{background:#711d39!important;border-color:#b34362!important}"+
    ".nocturna-cover-action.read:focus-visible,.nocturna-cover-action.favorite:focus-visible{outline:3px solid #e0bfae!important;outline-offset:2px!important}"+
    "@media(max-width:560px){.nocturna-cover-action{top:8px!important;min-height:42px!important;padding:.4rem .56rem!important;font-size:.72rem!important}.nocturna-cover-action.read{left:8px!important}.nocturna-cover-action.favorite{right:8px!important}}";
  document.head.appendChild(s);
};

const coverHost=card=>{
  let host=card.querySelector(".nr-card-art,.nr-cover-frame,.nr-cover-host");
  if(!host){
    const img=card.querySelector(".publication-cover,.series-cover");
    if(!img)return null;
    host=document.createElement("div");
    host.className="nr-cover-host";
    img.parentNode.insertBefore(host,img);
    host.appendChild(img);
  }
  host.style.position="relative";
  host.style.isolation="isolate";
  return host;
};

const actionsHost=host=>{
  let box=host.querySelector(".nocturna-cover-actions");
  if(!box){
    box=document.createElement("div");
    box.className="nocturna-cover-actions";
    host.appendChild(box);
  }
  return box;
};

const makeButton=(kind,key)=>{
  let b=document.querySelector('[data-nocturna-cover-action="'+kind+'"][data-nocturna-key="'+CSS.escape(key)+'"]');
  if(b)return b;
  b=document.createElement("button");
  b.type="button";
  b.className="nocturna-cover-action "+kind;
  b.dataset.nocturnaCoverAction=kind;
  b.dataset.nocturnaKey=key;
  return b;
};

const paint=()=>{
  ensureStyle();
  document.querySelectorAll(".card").forEach(card=>{
    const p=pubFromCard(card);
    const s=p?null:seriesFromCard(card);
    if(!p&&!s)return;
    const host=coverHost(card);
    if(!host)return;
    const box=actionsHost(host);

    if(p){
      const read=makeButton("read","article:"+p.id);
      const favorite=makeButton("favorite","article:"+p.id);
      if(read.parentNode!==box)box.appendChild(read);
      if(favorite.parentNode!==box)box.appendChild(favorite);
      const r=isRead(p),f=isFav("article:"+p.id);
      read.classList.toggle("active",r);
      read.textContent=r?"Lido":"Marcar como lido";
      read.setAttribute("aria-pressed",String(r));
      read.setAttribute("aria-label",r?"Marcar como não lido":"Marcar como lido");
      favorite.classList.toggle("active",f);
      favorite.innerHTML='<span class="heart" aria-hidden="true">'+(f?"♥":"♡")+'</span><span>Favorito</span>';
      favorite.setAttribute("aria-pressed",String(f));
      favorite.setAttribute("aria-label",f?"Remover dos favoritos":"Adicionar aos favoritos");
    }else{
      const favorite=makeButton("favorite","collection:"+s.id);
      if(favorite.parentNode!==box)box.appendChild(favorite);
      const f=isFav("collection:"+s.id);
      favorite.classList.toggle("active",f);
      favorite.innerHTML='<span class="heart" aria-hidden="true">'+(f?"♥":"♡")+'</span><span>Favorito</span>';
      favorite.setAttribute("aria-pressed",String(f));
      favorite.setAttribute("aria-label",f?"Remover dos favoritos":"Adicionar aos favoritos");
    }
  });
};

document.addEventListener("click",e=>{
  const b=e.target.closest(".nocturna-cover-action");
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  const kind=b.dataset.nocturnaCoverAction;
  const key=b.dataset.nocturnaKey||"";
  if(kind==="read"){
    const p=pubs.find(x=>"article:"+x.id===key);
    if(p)setRead(p,!isRead(p));
  }else if(kind==="favorite"){
    fav(key,!isFav(key));
  }
  paint();
},true);

let scheduled=false;
const schedule=()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;paint()});
};
const observer=new MutationObserver(schedule);
observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",paint,{once:true});else paint();
})();