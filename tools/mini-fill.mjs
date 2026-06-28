// Vult 5x5 zwarte-vakjes-roosters met echte woorden uit de gevette lijst.
// Elk across/down-woord komt uit de lijst -> gegarandeerd bestaand. Levert grids; clues schrijf ik los.
import { readFileSync } from "node:fs";
const html = readFileSync("remixed-507c05a6.html", "utf8");
function grabArr(name){const i=html.indexOf("const "+name);const s=html.indexOf("[",i);let d=0,j=s;for(;j<html.length;j++){if(html[j]==="[")d++;else if(html[j]==="]"){d--;if(d===0){j++;break;}}}return eval("("+html.slice(s,j)+")");}

// --- woordenboek oogsten (echte woorden, 3-5 letters) ---
const words = new Set();
const BLOCK = new Set(["NEGER","PENIS","REET","KUTJE","LULLY"]); // ongewenst voor een collega-spel
const add = w => { w = String(w).toUpperCase().replace(/[^A-Z]/g, ""); if (w.length>=3 && w.length<=5 && !BLOCK.has(w)) words.add(w); };
grabArr("CONN").forEach(p=>p.groups.forEach(g=>g.words.forEach(add)));
grabArr("STRANDS").forEach(p=>{p.words.forEach(o=>add(o.w));});
const MINI=grabArr("MINI");
const N=5;
function existingEntries(p){const g=p.grid.map(r=>r.split(""));const bl=(r,c)=>g[r][c]==="#";const out=[];
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(bl(r,c))continue;
   if((c===0||bl(r,c-1))&&c+1<N&&!bl(r,c+1)){let cc=c,w="";while(cc<N&&!bl(r,cc)){w+=g[r][cc];cc++;}out.push(w);}
   if((r===0||bl(r-1,c))&&r+1<N&&!bl(r+1,c)){let rr=r,w="";while(rr<N&&!bl(rr,c)){w+=g[rr][c];rr++;}out.push(w);}}
 return out;}
MINI.forEach(p=>existingEntries(p).forEach(add));
html.match(/ANSWERS_RAW\s*=\s*"([^"]*)"/)[1].trim().toUpperCase().split(/\s+/).forEach(add);

const byLen = {3:[],4:[],5:[]};
[...words].forEach(w=>byLen[w.length].push(w));

// --- patronen (bewezen uit bestaande Mini's) ---
const PATTERNS = [
  ["#....","#....",".....","....#","....#"],
  ["....#","....#",".....","#....","#...."],
  ["...##",".....",".....",".....","##..."],
  ["##...",".....",".....",".....","...##"],
];

// slots bepalen voor een patroon
function makeSlots(pat){
  const bl=(r,c)=>pat[r][c]==="#";const slots=[];
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(bl(r,c))continue;
    if((c===0||bl(r,c-1))&&c+1<N&&!bl(r,c+1)){const cells=[];let cc=c;while(cc<N&&!bl(r,cc)){cells.push([r,cc]);cc++;}slots.push({dir:"A",cells});}
    if((r===0||bl(r-1,c))&&r+1<N&&!bl(r+1,c)){const cells=[];let rr=r;while(rr<N&&!bl(rr,c)){cells.push([rr,c]);rr++;}slots.push({dir:"D",cells});}
  }
  return slots;
}

let seed=987654321;
const rand=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=(rand()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};

function fillPattern(pat, want, attempts=2500){
  const slots=makeSlots(pat);
  const results=[]; const seenGrids=new Set();
  // langste slot om mee te "zaaien"
  let seedSlot=slots[0]; slots.forEach(s=>{if(s.cells.length>seedSlot.cells.length)seedSlot=s;});

  function solveOnce(){
    const grid=Array.from({length:N},()=>Array(N).fill(null));
    const usedWords=new Set();
    let steps=0;
    function candidates(slot){
      const len=slot.cells.length;
      const pat2=slot.cells.map(([r,c])=>grid[r][c]);
      return shuffle(byLen[len]).filter(w=>{
        if(usedWords.has(w))return false;
        for(let i=0;i<len;i++)if(pat2[i]&&pat2[i]!==w[i])return false;
        return true;
      });
    }
    function rec(order){
      if(++steps>20000)return false;
      let best=-1,bestCands=null;
      for(let s=0;s<order.length;s++){if(order[s].done)continue;const cs=candidates(order[s].slot);if(bestCands===null||cs.length<bestCands.length){best=s;bestCands=cs;if(cs.length<=1)break;}}
      if(best===-1)return true;
      const node=order[best];node.done=true;
      for(const w of bestCands){
        const saved=node.slot.cells.map(([r,c])=>grid[r][c]);
        node.slot.cells.forEach(([r,c],i)=>grid[r][c]=w[i]);usedWords.add(w);
        if(rec(order))return true;
        usedWords.delete(w);node.slot.cells.forEach(([r,c],i)=>grid[r][c]=saved[i]);
      }
      node.done=false;return false;
    }
    // zaai het langste slot met een willekeurig passend woord
    const seedWord=shuffle(byLen[seedSlot.cells.length])[0];
    seedSlot.cells.forEach(([r,c],i)=>grid[r][c]=seedWord[i]);usedWords.add(seedWord);
    const order=slots.filter(s=>s!==seedSlot).map(slot=>({slot,done:false}));
    if(rec(order)){
      return grid.map((row,r)=>row.map((ch,c)=>pat[r][c]==="#"?"#":ch).join(""));
    }
    return null;
  }
  for(let a=0;a<attempts && results.length<want;a++){
    seed=(a*2654435761 + seedSlot.cells.length*7919)>>>0 || 1;
    const g=solveOnce();
    if(g){const key=g.join("|");if(!seenGrids.has(key)){seenGrids.add(key);results.push(g);}}
  }
  return results;
}

// genereer een mix over de patronen
const all=[];
PATTERNS.forEach((pat,pi)=>{
  const got=fillPattern(pat, 40, 8000);
  got.forEach(g=>all.push(g));
  console.error(`patroon ${pi+1}: ${got.length} vullingen`);
});

// uniek + dump
const seenG=new Set();const uniq=[];
for(const g of all){const k=g.join("|");if(!seenG.has(k)){seenG.add(k);uniq.push(g);}}
console.log(JSON.stringify(uniq));
