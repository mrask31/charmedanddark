import {runPreflight} from './printful-migration-token-preflight.mjs';
const check=v=>{if(!v)throw Error('audit_failed')};
try{check((await runPreflight({})).status==='verified');
const paths=['/products','/mockup-generator/printfiles/952?technique=EMBROIDERY','/mockup-generator/printfiles/422?technique=EMBROIDERY','/products/266','/products/952','/products/422'];
const get=async path=>{check(paths.includes(path));const r=await fetch('https://api.printful.com'+path,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':'18682636'}});const d=await r.json();return {httpStatus:r.status,result:d.result}};
const out=[];for(const path of paths){const d=await get(path);if(path==='/products')d.result=d.result.filter(p=>/tank|ringer|sleeveless/i.test(p.title+' '+p.model));out.push({path,...d})}console.log('REPLACEMENTS_AUDIT='+JSON.stringify(out));}catch{console.log('REPLACEMENTS_AUDIT_FAILED');process.exitCode=1}
