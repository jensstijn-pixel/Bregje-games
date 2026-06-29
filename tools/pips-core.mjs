// Gedeelde Pips-logica: parsen, regelcheck en de uniciteits-solver.
// Een puzzel: { cols, rows, grid:[".."], regions:[".."], rules:{a:{t,n}}, dominoes:[[a,b]], solution:[{cells,vals}] }
// Regeltypes: 'sum'(n) | 'eq' | 'neq' | 'lt'(n) | 'gt'(n) | 'none'

export function parse(pz) {
  const rows = pz.grid.length, cols = pz.grid[0].length;
  const cells = [];                 // lijst [r,c] van speelbare cellen
  const idOf = {};                  // "r,c" -> index
  const region = {};                // "r,c" -> regioletter
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (pz.grid[r][c] === '.') { const k = r + ',' + c; idOf[k] = cells.length; cells.push([r, c]); region[k] = pz.regions[r][c]; }
  }
  // orthogonale buren
  const adj = cells.map(([r, c]) => {
    const out = [];
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => { const k=(r+dr)+','+(c+dc); if (k in idOf) out.push(idOf[k]); });
    return out;
  });
  // regio -> cel-indices
  const regCells = {};
  cells.forEach(([r,c],i)=>{ const g=region[r+','+c]; (regCells[g]=regCells[g]||[]).push(i); });
  return { rows, cols, cells, idOf, region, adj, regCells };
}

// Controleer of een volledige waarde-toekenning (val per celindex) alle regels vervult.
export function rulesOK(pz, info, val) {
  for (const g in info.regCells) {
    const rule = pz.rules[g]; if (!rule || rule.t === 'none') continue;
    const vs = info.regCells[g].map(i => val[i]);
    if (vs.some(v => v == null)) return false;
    if (rule.t === 'sum') { if (vs.reduce((a,b)=>a+b,0) !== rule.n) return false; }
    else if (rule.t === 'eq') { if (vs.some(v => v !== vs[0])) return false; }
    else if (rule.t === 'neq') { if (new Set(vs).size !== vs.length) return false; }
    else if (rule.t === 'lt') { if (vs.some(v => !(v < rule.n))) return false; }
    else if (rule.t === 'gt') { if (vs.some(v => !(v > rule.n))) return false; }
  }
  return true;
}

// Tel het aantal geldige volledige plaatsingen (domino-multiset op bord, regels gerespecteerd).
// Stopt bij `cap` (default 2) — genoeg om uniciteit te bepalen.
export function countSolutions(pz, info, cap = 2) {
  const n = info.cells.length;
  const val = new Array(n).fill(null);
  const covered = new Array(n).fill(false);
  // multiset van dominostenen: sleutel "min,max" -> aantal
  const bag = {};
  pz.dominoes.forEach(([a,b]) => { const k = Math.min(a,b)+','+Math.max(a,b); bag[k]=(bag[k]||0)+1; });
  // per-regio lopende staat
  const rstate = {}; // g -> {sum, cnt, total, set:Set, rule}
  for (const g in info.regCells) rstate[g] = { sum:0, cnt:0, total:info.regCells[g].length, set:new Set(), rule:pz.rules[g]||{t:'none'} };
  const regOf = info.cells.map(([r,c]) => info.region[r+','+c]);

  function place(ci, v) { // probeer waarde v in cel ci; return false als regel direct breekt
    const g = regOf[ci], st = rstate[g], rule = st.rule;
    if (rule.t === 'lt' && !(v < rule.n)) return false;
    if (rule.t === 'gt' && !(v > rule.n)) return false;
    if (rule.t === 'eq' && st.cnt > 0 && v !== st.first) return false;
    if (rule.t === 'neq' && st.set.has(v)) return false;
    if (rule.t === 'sum') { if (st.sum + v > rule.n) return false; }
    // toepassen
    val[ci]=v; st.cnt++; st.sum+=v; st.set.add(v); if (st.cnt===1) st.first=v;
    if (st.cnt===st.total) { // regio compleet -> exacte checks
      if (rule.t==='sum' && st.sum!==rule.n) { undo(ci,v); return false; }
    }
    return true;
  }
  function undo(ci, v) { const g=regOf[ci], st=rstate[g]; val[ci]=null; st.cnt--; st.sum-=v; st.set.delete(v); }

  let count = 0;
  (function rec() {
    if (count >= cap) return;
    let ci = -1; for (let i=0;i<n;i++) if (!covered[i]) { ci=i; break; }
    if (ci === -1) { count++; return; }              // bord vol; regels al incrementeel gegarandeerd
    for (const nb of info.adj[ci]) {
      if (covered[nb]) continue;
      for (const key in bag) {
        if (bag[key]===0) continue;
        const [a,b] = key.split(',').map(Number);
        const orients = a===b ? [[a,b]] : [[a,b],[b,a]];
        for (const [va,vb] of orients) {
          covered[ci]=covered[nb]=true; bag[key]--;
          if (place(ci,va)) { if (place(nb,vb)) { rec(); undo(nb,vb); } undo(ci,va); }
          covered[ci]=covered[nb]=false; bag[key]++;
          if (count>=cap) return;
        }
      }
    }
  })();
  return count;
}
