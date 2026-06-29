// Audit op herhaalde "beschrijvingen" in Verbind Vier (groepsnamen) en Woordlijn (thema's).
import { readFileSync } from "node:fs";
const html = readFileSync("remixed-507c05a6.html", "utf8");
function grab(name){const i=html.indexOf("const "+name);const s=html.indexOf("[",i);let d=0,j=s;for(;j<html.length;j++){if(html[j]==="[")d++;else if(html[j]==="]"){d--;if(d===0){j++;break;}}}return eval("("+html.slice(s,j)+")");}
const CONN=grab("CONN"), STRANDS=grab("STRANDS");

function dups(label, items){
  const m=new Map();
  items.forEach(({key,where})=>{const k=key.toLowerCase();if(!m.has(k))m.set(k,[]);m.get(k).push(where);});
  const d=[...m.entries()].filter(([,l])=>l.length>1);
  console.log(`\n=== ${label} ===`);
  if(!d.length){console.log("  ✓ geen herhalingen");return 0;}
  d.sort((a,b)=>b[1].length-a[1].length).forEach(([k,l])=>console.log(`  ${l.length}×  "${l[0].name}"  -> ${l.map(x=>x.tag).join(", ")}`));
  return d.length;
}

// Verbind Vier: groepsnamen over alle puzzels
const connNames=[];
CONN.forEach((p,pi)=>p.groups.forEach(g=>connNames.push({key:g.name, where:{name:g.name, tag:`P${pi+1}`}})));
const c1=dups("VERBIND VIER — groepsnamen (over alle puzzels)", connNames);

// Verbind Vier: dubbele namen BINNEN dezelfde puzzel
console.log("\n=== VERBIND VIER — dubbele groepsnaam binnen één puzzel ===");
let cin=0;CONN.forEach((p,pi)=>{const names=p.groups.map(g=>g.name.toLowerCase());const set=new Set(names);if(set.size<4){cin++;console.log(`  P${pi+1}: ${p.groups.map(g=>g.name).join(" / ")}`);}});
if(!cin)console.log("  ✓ geen");

// Woordlijn: thema's en spangrammen
const themes=STRANDS.map((p,pi)=>({key:p.theme, where:{name:p.theme, tag:`#${pi+1}`}}));
dups("WOORDLIJN — thema's", themes);
const spans=STRANDS.map((p,pi)=>({key:p.spangram, where:{name:p.spangram, tag:`#${pi+1}`}}));
dups("WOORDLIJN — spangrammen", spans);
