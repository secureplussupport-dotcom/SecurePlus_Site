// Creates only the explicitly named disposable loopback container.
import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {writeFileSync,existsSync} from 'node:fs';
const name='secureplus-4d-pg176',image='supabase/postgres@sha256:4c39816ce8d9303a3aba1161c842929c73a40c7109a9ef1b644582478e31832e',path='/tmp/secureplus-4d-db-secret';
const existing=spawnSync('docker',['inspect',name,'--format','{{.Config.Image}}'],{encoding:'utf8'});
if(existing.status===0){if(existing.stdout.trim()!==image||!existsSync(path))throw new Error('Existing rehearsal identity mismatch');console.log('Disposable target already exists');}
else{
 const installed=spawnSync('docker',['image','inspect',image],{stdio:'ignore'});if(installed.status)throw new Error('Pull the pinned official Supabase image before starting');
 const password=randomBytes(24).toString('hex');writeFileSync(path,password,{mode:0o600,flag:'wx'});
 const result=spawnSync('docker',['run','-d','--name',name,'-p','127.0.0.1:55442:5432','-e','POSTGRES_PASSWORD','-e','POSTGRES_DB=postgres',image,'postgres','-D','/var/lib/postgresql/data','-c','listen_addresses=*'],{env:{...process.env,POSTGRES_PASSWORD:password},stdio:'ignore'});
 if(result.status)throw new Error('Disposable target creation failed');console.log('Created isolated target-version database');
}
