const fs=require('fs'),assert=require('node:assert/strict');const html=fs.readFileSync('index.html','utf8');
assert.match(html,/class="sleeve"/,'original record sleeve artwork exists');assert.match(html,/class="skip" href="#finder"/);assert.match(html,/style-20261115-library.css/);
for(const id of ['search','mode','exclude','tags','saved','clear','relax','results','backup-export','backup-import','backup-file'])assert.match(html,new RegExp('id="'+id+'"'));
assert.match(html,/noindex,follow/);for(const file of ['data','backup','app'])assert.match(html,new RegExp(file+'-20261115-v2.js'));
console.log('PASS: sleeve design, skip link, immutable assets and retained controls');
