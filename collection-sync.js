/* Nocturna · collection reading state synchronization */
(()=>{"use strict";
const KEY="nocturna-reading-progress-v1";
const read=()=>{try{return JSON.parse(window.localStorage.getItem(KEY)||"{}")}catch{return{}}};
const write=v=>{try{window.localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
const chapters=()=> (window.DATA?.series||[]).flatMap(s=>(s.blocks||[]).flatMap(b=>(b.chapters||[]).map(c=>({s,b,c,id:"series:"+s.id+":chapter:"+c.id}))));
window.NocturnaCollectionRead={read,write,chapters};
})();