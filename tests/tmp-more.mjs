import * as md from './streaming-markdown-parser.js';

const names=Object.fromEntries(Object.entries(md).filter(([k,v])=>typeof v==='number').map(([k,v])=>[v,k]));
function run(s){let ev=[];const r={add_text(t,p){ev.push(['text',t,[...p.tokens].map(x=>names[x]).join('>')])},add_token(tok,p,arg){ev.push(['start',names[tok],[...p.tokens].map(x=>names[x]).join('>')])},end_token(tok,p){ev.push(['end',names[tok],[...p.tokens].map(x=>names[x]).join('>')]);return ''},set_attr(a,v){ev.push(['attr',a,v])}};const p=md.createMarkdownParser(r,{parseCodeBlock:true});p.write(s);p.end();console.log('\nCASE',JSON.stringify(s)); console.log(ev.map(JSON.stringify).join('\n'));}
run('> > nested\n> outer\n');
run('- item\n  # H\n  > q\n  ```js\n  code\n  ```\n');
run('> | a | b |\n> |---|---|\n> | c | d |\n');
run('- a\n    code\n- b\n');
run('- a\n  ---\n- b\n');
