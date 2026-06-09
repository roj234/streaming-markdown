import * as md from './streaming-markdown-parser.js';

const names = Object.fromEntries(Object.entries(md).filter(([k,v])=>typeof v==='number').map(([k,v])=>[v,k]));
function trace(input){
  const events=[];
  const r={
    add_token(t,p,arg){events.push(['+',names[t]||t, p.tokens.slice(), p.token, arg]);},
    end_token(t,p){events.push(['-',names[t]||t, p.tokens.slice(), p.token]); return ''},
    add_text(s,p){events.push(['text',JSON.stringify(s), p.tokens.slice(), p.token]);},
    set_attr(a,v){events.push(['attr',a,v]);}
  };
  const p=md.createMarkdownParser(r,{preserveLineBreaks:false, parseCodeBlock:true});
  p.write(input); p.end();
  console.log('INPUT:', JSON.stringify(input));
  for (const e of events) console.log(...e);
  console.log('---');
}
trace('a\nb\n');
trace('> a\n> b\n');
trace('- a\n  b\n');
trace('- a\n- b\n');
trace('> - a\n>   b\n');
trace('> a\n> - b\n');
