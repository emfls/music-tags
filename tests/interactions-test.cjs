const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ids=['exclude','tags','search','mode','count','result-title','similar-note','saved','saved-count','empty','results','toast','clear','relax','backup-status','backup-file','backup-export','backup-import'];
const els=Object.fromEntries(ids.map(id=>[id,{value:id==='mode'?'all':'',innerHTML:'',textContent:'',events:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.events[k]=fn},scrollIntoView(){},click(){this.clicked=true}}]));
const listeners={},storage={},downloads=[];let approved=true,blob;
const ctx={document:{getElementById:id=>els[id],addEventListener:(k,f)=>listeners[k]=f,createElement:()=>({click(){downloads.push({name:this.download,url:this.href})}})},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},setTimeout:()=>0,clearTimeout(){},Blob,URL:{createObjectURL:b=>(blob=b,'blob:local'),revokeObjectURL(){}},confirm:()=>approved};
vm.createContext(ctx);vm.runInContext(['data','backup','app'].map(x=>fs.readFileSync(x+'-20261115-v2.js','utf8')).join('\n'),ctx);
const click=dataset=>listeners.click({target:{closest:()=>({dataset})}}),clear=()=>els.clear.events.click(),count=n=>assert.match(els.count.textContent,new RegExp('^'+n+'곡'));
(async()=>{
count(7);click({preset:'설렘,밤산책'});count(2);els.mode.value='any';els.mode.events.change();count(4);els.exclude.value='밤산책';els.exclude.events.change();count(1);clear();count(7);
click({save:'butter'});assert.deepEqual(JSON.parse(storage['gyeol-v1']).favorites,['butter']);assert.equal(els['saved-count'].textContent,1);els.saved.events.click();count(1);click({save:'butter'});count(0);assert.equal(els.empty.hidden,false);els.saved.events.click();count(7);
const submit=(id,tag)=>listeners.submit({preventDefault(){},target:{dataset:{form:id},querySelector:()=>({value:tag})}});
submit('yellow','  퇴근길  ');assert.deepEqual(JSON.parse(storage['gyeol-v1']).personal.yellow,['퇴근길']);submit('yellow','퇴근길');assert.equal(els.toast.textContent,'이미 있는 태그예요.');els.search.value='퇴근길';els.search.events.input();count(1);clear();click({related:'dynamite'});count(2);assert.equal(els['result-title'].textContent,'비슷한 결의 다음 곡');clear();click({remove:'yellow',value:'퇴근길'});assert.deepEqual(JSON.parse(storage['gyeol-v1']).personal.yellow,[]);
submit('yellow','<b>');assert.match(els.results.innerHTML,/&lt;b&gt;/);assert.ok(!els.results.innerHTML.includes('><b> ×'));
for(let i=0;i<11;i++)submit('yellow','test'+i);assert.equal(JSON.parse(storage['gyeol-v1']).personal.yellow.length,10);assert.match(els.toast.textContent,/10개/);
els['backup-export'].onclick();assert.equal(downloads[0].name,'gyeol-music-backup.json');const exported=JSON.parse(await blob.text());assert.equal(exported.app,'gyeol-music');assert.equal(exported.personal.yellow.length,10);
const valid={app:'gyeol-music',version:1,favorites:['dynamite'],personal:{yellow:['밤공기']}};
async function restore(data,size=100){els['backup-file'].files=[{size,text:async()=>JSON.stringify(data)}];await els['backup-file'].onchange();}
const before=storage['gyeol-v1'];approved=false;await restore(valid);assert.equal(storage['gyeol-v1'],before);assert.match(els['backup-status'].textContent,/취소/);approved=true;await restore(valid);assert.deepEqual(JSON.parse(storage['gyeol-v1']).favorites,['dynamite']);assert.equal(els['saved-count'].textContent,1);assert.match(els['backup-status'].textContent,/저장했습니다/);
const after=storage['gyeol-v1'];await restore({...valid,favorites:['unknown']});assert.equal(storage['gyeol-v1'],after);assert.match(els['backup-status'].textContent,/복원하지 않았습니다/);await restore(valid,131073);assert.equal(storage['gyeol-v1'],after);assert.match(els['backup-status'].textContent,/128KB/);
console.log('PASS: music interaction regression: preset/AND/OR/exclusion/reset, favorites, personal tags add/remove/escape/duplicate/limit, related, export and restore cancel/success/invalid/oversize');
})().catch(e=>{console.error(e);process.exitCode=1});
