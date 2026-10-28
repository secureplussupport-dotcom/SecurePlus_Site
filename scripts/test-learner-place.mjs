import test from 'node:test';
import assert from 'node:assert/strict';
import {readPlace,writePlace,navigateDetail} from '../src/lib/learnerPlace.js';

test('list preferences survive module reload and remain isolated per learner',async()=>{
 const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 writePlace('alice:pbq:format','terminal',storage);writePlace('bob:pbq:format','hotspot',storage);
 writePlace('alice:scroll',{window:350,main:720,focus:'Open PBQ: port scanner'},storage);
 const fresh=await import(`../src/lib/learnerPlace.js?reload=${Date.now()}`);
 assert.equal(fresh.readPlace('alice:pbq:format','all',storage),'terminal');
 assert.equal(fresh.readPlace('bob:pbq:format','all',storage),'hotspot');
 assert.deepEqual(fresh.readPlace('alice:scroll',{},storage),{window:350,main:720,focus:'Open PBQ: port scanner'});
 assert.equal(fresh.readPlace('eve:pbq:format','all',storage),'all');
});
test('denied storage remains usable; malformed preferences fall back',()=>{
 const denied={getItem(){throw Error('denied');},setItem(){throw Error('full');}};
 assert.equal(readPlace('denied','all',denied),'all');writePlace('denied', 'chapter-4',denied);
 assert.equal(readPlace('denied','all',denied),'chapter-4');
 for(const text of ['{broken','[]','123','null'])assert.equal(readPlace(`bad:${text}`,'all',{getItem:()=>text}),'all');
});
function browserHistory(){
 const entries=[{secureplusView:'pbq'}];let index=0;
 return {get state(){return entries[index];},pushState(state){entries.splice(++index);entries.push(state);},replaceState(state){entries[index]=state;},back(){index=Math.max(0,index-1);},forward(){index=Math.min(entries.length-1,index+1);},get length(){return entries.length;}};
}
test('Back and Forward restore detail entries without losing the parent route',()=>{
 const history=browserHistory();navigateDetail(history,'pbq-question',{id:'p001'});
 assert.equal(history.state.secureplusView,'pbq');assert.equal(history.length,2);
 navigateDetail(history,'pbq-question',{id:'p001'});assert.equal(history.length,2,'replayed initial effects must not duplicate history');
 assert.equal(navigateDetail(history,'pbq-question',null),true);assert.equal(history.state.learnerDetail,undefined);
 history.forward();assert.deepEqual(history.state.learnerDetail,{'pbq-question':{id:'p001'}});
 assert.equal(navigateDetail(history,'unopened',null),false);assert.equal(history.length,2);
});
test('closing an expanded diagnostic for signup is synchronous and cannot race auth navigation',()=>{
 const history=browserHistory();navigateDetail(history,'diagnostic',true);
 assert.equal(navigateDetail(history,'diagnostic',null,true),false);
 history.pushState({secureplusView:'auth'});assert.equal(history.state.secureplusView,'auth');
 history.back();assert.deepEqual(history.state.learnerDetail,{});
});
