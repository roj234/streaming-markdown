import * as md from './streaming-markdown-parser.js';

const names = Object.fromEntries(Object.entries(md).filter(([k,v])=>typeof v==='number').map(([k,v])=>[v,k]));
function parse(s, opts={parseCodeBlock:true,preserveLineBreaks:false}) {
  const ev=[];
  const renderer={
    add_text(t,p){ev.push(['text',t,[...p.tokens].map(x=>names[x]||x).join('>')]);},
    add_token(tok,p,arg){ev.push(['start',names[tok]||tok,arg??'', [...p.tokens].map(x=>names[x]||x).join('>')]);},
    end_token(tok,p,undo){ev.push(['end',names[tok]||tok, undo?'undo':'', [...p.tokens].map(x=>names[x]||x).join('>')]); return '';},
    set_attr(a,v){ev.push(['attr',a,v]);}
  };
  const p=md.createMarkdownParser(renderer, opts);
  for (const ch of s) p.write(ch); // streaming char by char
  p.end();
  return ev;
}
const cases = [
  '- a\n  - b\n  - c\n- d\n',
  '> quote\n> - item\n>   - nested\n> para\n',
  '- item\n  > quote\n  > - qitem\n  after\n- next\n',
  '> # H\n> para **b**\n>\n> - x\n',
  '- a\n\n  still?\n- b\n',
  '1. a\n2. b\n   > q\n   1. n\n'
];
for (const s of cases) {
 console.log('\nCASE', JSON.stringify(s));
 console.log(parse(s).map(e=>JSON.stringify(e)).join('\n'));
}
