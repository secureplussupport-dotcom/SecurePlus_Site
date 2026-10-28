// One reporting domain per tag, including concepts with no question yet.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const output=fileURLToPath(new URL('../src/data/readinessConceptCatalogue.js',import.meta.url));
export function buildReadinessCatalogue(){
 const mapping=JSON.parse(readFileSync(new URL('../src/data/readinessConceptDomains.json',import.meta.url),'utf8'));
 return Object.fromEntries([1,2,3,4,5].map(id=>[id,Object.entries(mapping).filter(([,domain])=>domain===id).map(([tag])=>tag).sort()]));
}
const catalogue=buildReadinessCatalogue();
const rendered=`// Generated from readinessConceptDomains.json; includes every current concept once.\nexport const READINESS_CONCEPT_CATALOGUE = Object.freeze(${JSON.stringify(catalogue,null,2)});\n`;
if(process.argv.includes('--check')){
 if(readFileSync(output,'utf8')!==rendered)throw Error('Readiness catalogue is stale. Run node scripts/build-readiness-catalogue.mjs');
 console.log('Readiness catalogue: all concepts, one primary domain each.');
}else writeFileSync(output,rendered);
