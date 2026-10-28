import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {THEMES} from '../src/lib/themes.js';
const luminance=hex=>{
 const rgb=hex.replace('#','').match(/../g).map(value=>parseInt(value,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('light text, accents, placeholders and code labels meet 4.5:1 on their shared surfaces',()=>{
 for(const surface of ['bg','surface','panel','cardBg','inputBg'])for(const ink of ['text','textSec','textDim','accent','green','red','amber','blue','purple'])
  assert(contrast(THEMES.light[ink],THEMES.light[surface])>=4.5,`${ink} on ${surface}`);
 for(const surface of ['codeBg','codePanel'])for(const ink of ['codeText','codeMuted','codePrompt','codeCommand','codeError','codeWarn'])
  assert(contrast(THEMES.light[ink],THEMES.light[surface])>=4.5,`${ink} on ${surface}`);
 for(const ink of ['accent','accentHover','green','red'])assert(contrast('#ffffff',THEMES.light[ink])>=4.5,`white button label on ${ink}`);
});
test('dark palette preserves its colours and increases caption contrast',()=>{
 assert.deepEqual(THEMES.dark,{bg:'#0c111b',surface:'#171e2b',panel:'#111824',border:'#2b3748',text:'#f7f9fc',textSec:'#b2bdcf',textDim:'#9aa8be',accent:'#4f8cff',accentHover:'#3476ed',green:'#20c997',red:'#ff5d73',amber:'#ffb020',cardBg:'#171e2b',inputBg:'#0e1521',codeBg:'#050814',codePanel:'#0a1020',codeBorder:'#27344d',codeText:'#d6e2ff',codeMuted:'#7f8ba6',codePrompt:'#5eead4',codeCommand:'#93c5fd',codeError:'#fb7185',codeWarn:'#fbbf24'});
});
test('SEC-01 light keywords and labels meet 4.5:1 on its panels',()=>{
 const css=readFileSync('src/pilots/sec01/style.css','utf8').split('.s01-dark')[0];
 const vars=Object.fromEntries([...css.matchAll(/--([\w-]+):(#[0-9a-f]{6})/g)].map(m=>[m[1],m[2]]));
 for(const surface of ['bg','panel','soft'])for(const ink of ['text','muted','blue','rose','mint','violet','gold'])assert(contrast(vars[ink],vars[surface])>=4.5,`${ink} on pilot ${surface}`);
});

test('captions meet AA contrast in both themes without dimming locked content',()=>{
 for(const theme of Object.values(THEMES))for(const surface of ['bg','surface','panel','inputBg'])for(const ink of ['text','textSec','textDim'])assert(contrast(theme[ink],theme[surface])>=4.5,`${ink} on ${surface}`);
});

test('shared keyboard focus ring meets 3:1 contrast on light and dark surfaces',()=>{
 for(const theme of Object.values(THEMES))for(const surface of ['bg','surface','panel','inputBg'])assert(contrast('#668bd5',theme[surface])>=3,`focus ring on ${surface}`);
});
