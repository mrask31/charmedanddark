import {runPreflight} from './printful-migration-token-preflight.mjs';
import {readFile} from 'node:fs/promises';
const check=(v,c)=>{if(!v)throw Error(c)};
try {
 check((await runPreflight({})).status==='verified','preflight_failed');
 const plans=JSON.parse(await readFile(new URL('./printful-next-batch-plans.json',import.meta.url),'utf8'));check(plans.length===3,'plan_mismatch');
 const tasks=new Set();const allowed=new Set(['/products/71','/products/586','/mockup-generator/printfiles/71','/mockup-generator/printfiles/586']);
 async function req(path,body){check(body?['/mockup-generator/create-task/71','/mockup-generator/create-task/586'].includes(path):allowed.has(path)||tasks.has(path),'path_refused');const r=await fetch('https://api.printful.com'+path,{method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':'18682636','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});check(r.ok,'request_failed');const d=await r.json();check(d.code===200,'response_failed');return d.result}
 const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&(u.hostname.endsWith('.printful.com')||u.hostname==='printful-upload.s3-accelerate.amazonaws.com')?u.href:null}catch{return null}};
 const report=[];
 for(const p of plans){const c=await req(`/products/${p.catalogId}`);const a=await req(`/mockup-generator/printfiles/${p.catalogId}`);const v=c.variants.find(v=>v.id===p.variantId);check(v&&v.color===p.color&&v.size==='M'&&v.in_stock,'variant_mismatch');
  for(const f of p.files){const id=a.variant_printfiles.find(v=>v.variant_id===p.variantId)?.placements?.[f.placement];const area=a.printfiles.find(a=>a.printfile_id===id);check(area&&area.width===1800&&area.height===2400&&area.dpi===150,'area_mismatch')}
  let result=await req(`/mockup-generator/create-task/${p.catalogId}`,{variant_ids:[p.variantId],format:'png',files:p.files.map(f=>({placement:f.placement,image_url:f.url,position:{area_width:1800,area_height:2400,width:1800,height:2400,top:0,left:0}}))});check(/^[a-zA-Z0-9_-]{1,200}$/.test(result.task_key),'task_mismatch');const taskPath='/mockup-generator/task?task_key='+encodeURIComponent(result.task_key);tasks.add(taskPath);
  for(let i=0;result.status==='pending'&&i<18;i++){await new Promise(r=>setTimeout(r,4000));result=await req(taskPath)}check(result.status==='completed','generation_incomplete');
  const row={key:p.key,shopifyId:p.shopifyId,mockups:(result.mockups??[]).map(m=>({placement:m.placement,url:safeURL(m.mockup_url),extras:(m.extra??[]).map(e=>safeURL(e.url)).filter(Boolean)}))};report.push(row);console.log('BATCH_PROOF='+JSON.stringify(row));
 }
 console.log('BATCH_PROOFS_COMPLETE='+JSON.stringify({productWrites:0,proofs:report}));
}catch(e){console.log('BATCH_PROOFS_FAILED='+(/^[a-z_]{1,40}$/.test(e.message)?e.message:'internal_error'));process.exitCode=1}
