// Genereert geldige Pips-puzzels met EXACT 1 oplossing (via de solver in pips-core).
// node tools/pips-gen.mjs --test   -> genereert + rapporteert, schrijft niets in de HTML
// node tools/pips-gen.mjs          -> genereert 50 en zet ze als const PIPS in de HTML
import { readFileSync, writeFileSync } from "node:fs";
import * as core from "./pips-core.mjs";

const N_WANTED = 50;
const TEMPLATES = [
  ["...","..."],                 // 2x3 = 6
  ["....","...."],               // 2x4 = 8
  [".....","....."],             // 2x5 = 10
  ["......","......"],           // 2x6 = 12
  ["....","....","...."],        // 3x4 = 12
  ["...","...","...","..."],     // 4x3 = 12
  ["....",".##.","...."],        // 3x4 - 2 = 10
];

const rnd = (a)=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function parseGridOnly(grid){
  const rows=grid.length, cols=grid[0].length; const cells=[]; const idOf={};
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++) if(grid[r][c]==='.'){ idOf[r+','+c]=cells.length; cells.push([r,c]); }
  const adj=cells.map(([r,c])=>{const o=[];[[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{const k=(r+dr)+','+(c+dc); if(k in idOf)o.push(idOf[k]);});return o;});
  return {rows,cols,cells,idOf,adj};
}
function matching(info){
  const n=info.cells.length, used=new Array(n).fill(false), pairs=[];
  function rec(){ let i=-1; for(let x=0;x<n;x++) if(!used[x]){i=x;break;} if(i===-1)return true;
    for(const j of shuffle(info.adj[i].filter(x=>!used[x]))){ used[i]=used[j]=true; pairs.push([i,j]); if(rec())return true; pairs.pop(); used[i]=used[j]=false; } return false; }
  return rec()?pairs.slice():null;
}
function partition(info,k){
  const n=info.cells.length, reg=new Array(n).fill(-1);
  const seeds=shuffle([...Array(n).keys()]).slice(0,k); const fr=seeds.map((s,gi)=>{reg[s]=gi;return [s];}); let asg=k;
  while(asg<n){ let grew=false;
    for(const gi of shuffle([...Array(k).keys()])){ for(const cell of shuffle(fr[gi])){ const nbs=shuffle(info.adj[cell].filter(x=>reg[x]===-1)); if(nbs.length){reg[nbs[0]]=gi;fr[gi].push(nbs[0]);asg++;grew=true;break;} } if(grew)break; }
    if(!grew)return null; }
  return reg;
}
function ruleFor(vals){
  const sum=vals.reduce((a,b)=>a+b,0); const allEq=vals.every(v=>v===vals[0]); const allDiff=new Set(vals).size===vals.length;
  const opts=[{t:'sum',n:sum}]; if(vals.length>=2&&allEq)opts.push({t:'eq'}); if(vals.length>=2&&allDiff&&vals.length<=7)opts.push({t:'neq'});
  if(opts.length>1 && Math.random()<0.45) return opts[1+Math.floor(Math.random()*(opts.length-1))];
  return opts[0];
}
function buildRegionsString(grid,info,reg,letters){ const out=grid.map(row=>row.split('')); info.cells.forEach(([r,c],i)=>{out[r][c]=letters[reg[i]];}); return out.map(a=>a.join('')); }

function genOne(grid){
  const info0=parseGridOnly(grid), n=info0.cells.length, letters='abcdefgh';
  for(let av=0; av<50; av++){
    const m=matching(info0); if(!m)return null;
    const val=info0.cells.map(()=>Math.floor(Math.random()*7));
    for(let ar=0; ar<14; ar++){
      const kmax=Math.min(4,Math.max(2,Math.floor(n/2))); const k=2+Math.floor(Math.random()*(kmax-1));
      const reg=partition(info0,k); if(!reg)continue;
      const regionsStr=buildRegionsString(grid,info0,reg,letters);
      const rules={};
      for(let gi=0; gi<k; gi++){ const idxs=[...Array(n).keys()].filter(i=>reg[i]===gi); if(!idxs.length)continue; rules[letters[gi]]=ruleFor(idxs.map(i=>val[i])); }
      const dominoes=[], solution=[];
      for(const [i,j] of m){ dominoes.push([val[i],val[j]]); solution.push({cells:[info0.cells[i],info0.cells[j]],vals:[val[i],val[j]]}); }
      const pz={cols:info0.cols,rows:info0.rows,grid,regions:regionsStr,rules,dominoes,solution};
      const info=core.parse(pz);
      if(core.countSolutions(pz,info,2)===1){ pz.dominoes=shuffle(dominoes); return pz; }
    }
  }
  return null;
}

// genereer
const out=[]; const seen=new Set(); let tries=0; const t0=Date.now();
while(out.length<N_WANTED && tries<6000){
  tries++;
  const pz=genOne(rnd(TEMPLATES)); if(!pz)continue;
  const key=pz.regions.join('|')+'#'+JSON.stringify(pz.dominoes.map(d=>d.slice().sort()).sort());
  if(seen.has(key))continue; seen.add(key); out.push(pz);
}
const ms=Date.now()-t0;
// stats
const sizes={}, rtypes={};
out.forEach(p=>{const nc=p.grid.join('').split('').filter(c=>c==='.').length; sizes[nc]=(sizes[nc]||0)+1; for(const g in p.rules)rtypes[p.rules[g].t]=(rtypes[p.rules[g].t]||0)+1;});
console.log(`Gegenereerd: ${out.length}/${N_WANTED} in ${tries} pogingen (${ms}ms)`);
console.log("celgroottes:",JSON.stringify(sizes));
console.log("regeltypes:",JSON.stringify(rtypes));
if(out[0]){console.log("voorbeeld puzzel 1:");console.log("  grid:",JSON.stringify(out[0].grid));console.log("  regions:",JSON.stringify(out[0].regions));console.log("  rules:",JSON.stringify(out[0].rules));console.log("  dominoes:",JSON.stringify(out[0].dominoes));}

if(process.argv.includes("--test")){ process.exit(out.length<N_WANTED?1:0); }

// embed in HTML als const PIPS = [...]
const FILE="remixed-507c05a6.html";
let html=readFileSync(FILE,"utf8");
const body=out.map(p=>JSON.stringify(p)).join(",\n");
const decl="const PIPS = [\n"+body+"\n];\n";
if(html.includes("const PIPS = [")){
  const s=html.indexOf("const PIPS = ["); const arrS=html.indexOf("[",s); let d=0,e=arrS; for(;e<html.length;e++){if(html[e]==="[")d++;else if(html[e]==="]"){d--;if(d===0){e++;break;}}}
  // tot en met evt. puntkomma
  let end=e; if(html[end]===';')end++;
  html=html.slice(0,s)+decl.trimEnd()+html.slice(end);
} else {
  // plaats vlak na de MINI-array
  const mi=html.indexOf("const MINI"); const arrS=html.indexOf("[",mi); let d=0,e=arrS; for(;e<html.length;e++){if(html[e]==="[")d++;else if(html[e]==="]"){d--;if(d===0){e++;break;}}}
  let end=e; if(html[end]===';')end++;
  html=html.slice(0,end)+"\n"+decl.trimEnd()+html.slice(end);
}
writeFileSync(FILE,html);
console.log(`In HTML gezet: const PIPS met ${out.length} puzzels.`);
