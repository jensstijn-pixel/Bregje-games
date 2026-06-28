// Solver voor Woordlijn-puzzels (Strands).
// Input: {theme, spangram, words:[...incl spangram], rows, cols}
// Output: geldige tiling -> {rows,cols,letters,words:[{w,path,span}],theme,spangram}  of null.
// Elk woord wordt als aaneengesloten pad (8-richtingen) gelegd; alle cellen precies 1x;
// spangram raakt twee tegenoverliggende randen.

export function solve(spec, { restarts = 240, stepBudget = 200000 } = {}) {
  const { rows, cols } = spec;
  const N = rows * cols;
  const words = spec.words.map(w => w.toUpperCase());
  const spanW = spec.spangram.toUpperCase();
  const sum = words.reduce((a, w) => a + w.length, 0);
  if (sum !== N) throw new Error(`${spec.theme}: letters ${sum} ≠ ${rows}×${cols}=${N}`);

  // buren (8-richtingen)
  const nbr = Array.from({ length: N }, (_, i) => {
    const r = (i / cols) | 0, c = i % cols, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
    }
    return out;
  });

  // spangram eerst plaatsen (langste-ish, met randvoorwaarde), dan rest aflopend op lengte
  const rest = words.filter(w => w !== spanW).sort((a, b) => b.length - a.length);
  const order = [spanW, ...rest];

  const used = new Array(N).fill(false);
  const paths = {}; // word -> path
  let steps = 0;

  // willekeur per restart
  let rng = 1;
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const shuffled = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rand() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };

  function spangramOK(path) {
    const rs = path.map(i => (i / cols) | 0), cs = path.map(i => i % cols);
    const lr = cs.includes(0) && cs.includes(cols - 1);
    const tb = rs.includes(0) && rs.includes(rows - 1);
    return lr || tb;
  }

  // leg één woord neer vanaf elke mogelijke start; DFS over de letters
  function layWord(word, isSpan, done) {
    // mogelijke startcellen
    let starts = [];
    for (let i = 0; i < N; i++) if (!used[i]) starts.push(i);
    starts = shuffled(starts);
    for (const s of starts) {
      const path = [s];
      used[s] = true;
      if (dfsLetters(word, 1, path, isSpan, done)) return true;
      used[s] = false;
    }
    return false;
  }
  function dfsLetters(word, k, path, isSpan, done) {
    if (++steps > stepBudget) return false;
    if (k === word.length) {
      if (isSpan && !spangramOK(path)) return false;
      paths[word] = path.slice();
      const ok = done();
      if (ok) return true;
      delete paths[word];
      return false;
    }
    const last = path[path.length - 1];
    for (const nx of shuffled(nbr[last])) {
      if (used[nx]) continue;
      used[nx] = true; path.push(nx);
      if (dfsLetters(word, k + 1, path, isSpan, done)) return true;
      path.pop(); used[nx] = false;
    }
    return false;
  }

  // snoei: elke ongebruikte samenhangende regio moet groot genoeg zijn voor een resterend woord
  function feasible(remaining) {
    if (!remaining.length) return true;
    const minLen = Math.min(...remaining.map(w => w.length));
    const seen = new Array(N).fill(false);
    for (let i = 0; i < N; i++) {
      if (used[i] || seen[i]) continue;
      // BFS component
      let size = 0; const stack = [i]; seen[i] = true;
      while (stack.length) { const c = stack.pop(); size++; for (const nb of nbr[c]) if (!used[nb] && !seen[nb]) { seen[nb] = true; stack.push(nb); } }
      if (size < minLen) return false;
    }
    return true;
  }

  function place(idx) {
    if (idx === order.length) return true;
    const word = order[idx];
    const isSpan = word === spanW;
    const remainingAfter = order.slice(idx + 1);
    return layWord(word, isSpan, () => feasible(remainingAfter) && place(idx + 1));
  }

  for (let r = 0; r < restarts; r++) {
    rng = (r + 1) * 2654435761 & 0x7fffffff;
    used.fill(false);
    for (const k of Object.keys(paths)) delete paths[k];
    steps = 0;
    if (place(0)) {
      const letters = new Array(N).fill("");
      for (const w of words) paths[w].forEach((cell, i) => letters[cell] = w[i]);
      return {
        rows, cols, letters: letters.join(""),
        words: words.map(w => ({ w, path: paths[w], span: w === spanW })),
        theme: spec.theme, spangram: spanW,
      };
    }
  }
  return null;
}
