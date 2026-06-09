import * as md from './streaming-markdown-parser.js';

const names = Object.fromEntries(Object.entries(md).filter(([k,v])=>typeof v==='number').map(([k,v])=>[v,k]));
function collect(input, options={parseCodeBlock:true}){
  const events=[];
  const r={
    add_token(t,p){events.push(['+', names[t] || t]);},
    end_token(t,p){events.push(['-', names[t] || t]); return '';},
    add_text(s,p){events.push(['text', s]);},
    set_attr(a,v){events.push(['attr', a, v]);}
  };
  const p=md.createMarkdownParser(r, options);
  // chunk by char to exercise streaming line-prefix state
  for (const ch of input) p.write(ch);
  p.end();
  return events;
}
function count(events, kind, name){ return events.filter(e=>e[0]===kind && e[1]===name).length; }
function texts(events){ return events.filter(e=>e[0]==='text').map(e=>e[1]).join(''); }
function assert(cond, msg){ if(!cond) throw new Error(msg); }
function test(name, input, fn){
  const ev=collect(input);
  try { fn(ev); console.log('ok', name); }
  catch(e){ console.error('FAIL', name, JSON.stringify(input)); console.error(ev); throw e; }
}

test('top-level soft line keeps paragraph', 'a\nb\n', ev => {
  assert(count(ev,'+','PARAGRAPH') === 1, 'expected one paragraph open');
  assert(count(ev,'-','PARAGRAPH') === 1, 'expected one paragraph close');
  assert(texts(ev) === 'a b', 'expected folded text');
});

test('blockquote soft line keeps paragraph', '> a\n> b\n', ev => {
  assert(count(ev,'+','BLOCKQUOTE') === 1, 'expected one blockquote');
  assert(count(ev,'+','PARAGRAPH') === 1, 'expected one paragraph open in quote');
  assert(count(ev,'-','PARAGRAPH') === 1, 'expected one paragraph close in quote');
  assert(texts(ev) === 'a b', 'expected folded quoted text');
});

test('list item continuation keeps paragraph', '- a\n  b\n', ev => {
  assert(count(ev,'+','LIST_ITEM') === 1, 'expected one list item');
  assert(count(ev,'+','PARAGRAPH') === 1, 'expected one paragraph in item');
  assert(texts(ev) === 'a b', 'expected folded item text');
});

test('blockquote-list continuation keeps paragraph', '> - a\n>   b\n', ev => {
  assert(count(ev,'+','BLOCKQUOTE') === 1, 'expected one blockquote');
  assert(count(ev,'+','LIST_ITEM') === 1, 'expected one list item');
  assert(count(ev,'+','PARAGRAPH') === 1, 'expected one paragraph');
  assert(texts(ev) === 'a b', 'expected folded text');
});

test('list-blockquote continuation keeps paragraph', '- > a\n  > b\n', ev => {
  assert(count(ev,'+','BLOCKQUOTE') === 1, 'expected one blockquote');
  assert(count(ev,'+','PARAGRAPH') === 1, 'expected one paragraph');
  assert(texts(ev) === 'a b', 'expected folded text');
});

test('new list item still closes previous paragraph', '- a\n- b\n', ev => {
  assert(count(ev,'+','LIST_ITEM') === 2, 'expected two list items');
  assert(count(ev,'+','PARAGRAPH') === 2, 'expected two paragraphs');
});

test('block marker inside quote closes paragraph', '> a\n> # H\n', ev => {
  assert(count(ev,'+','PARAGRAPH') === 1, 'expected one paragraph before heading');
  assert(count(ev,'+','HEADING_1') === 1, 'expected heading');
});
