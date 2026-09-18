import {runPreflight} from './printful-migration-token-preflight.mjs';
import {readFile} from 'node:fs/promises';
const check=(v,c)=>{if(!v)throw Error(c)};
try{
 check((await runPreflight({})).status==='verified','preflight_failed');
 const plans=JSON.parse(await readFile(new URL('./printful-batch4-plans.json',import.meta.url),'utf8')).filter(p=>p.key==='moon');check(plans.length===1&&plans.every(p=>[692,1635,636].includes(p.catalogId)),'plans_refused');
 const allowed=new Set(plans.flatMap(p=>[`/products/${p.catalogId}`,`/mockup-generator/printfiles/${p.catalogId}`]));const tasks=new Set();
 async function req(path,body){check(body?plans.some(p=>path===`/mockup-generator/create-task/${p.catalogId}`):allowed.has(path)||tasks.has(path),'path_refused');const r=await fetch('https://api.printful.com'+path,{method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':'18682636','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});check(r.ok,`http_${r.status}`);const d=await r.json();check(d.code===200,'response_failed');return d.result}
 const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&(u.hostname.endsWith('.printful.com')||u.hostname==='printful-upload.s3-accelerate.amazonaws.com')?u.href:null}catch{return null}};
 await new Promise(r=>setTimeout(r,65000));const report=[];let count=0;
 for(const p of plans){if(count++)await new Promise(r=>setTimeout(r,32000));const c=await req(`/products/${p.catalogId}`),areas=await req(`/mockup-generator/printfiles/${p.catalogId}`);check(c.product.model===p.model,'model_mismatch');
  for(const id of p.variantIds){const v=c.variants.find(v=>v.id===id);check(v&&v.size==='M'&&v.in_stock,'variant_mismatch');const areaId=areas.variant_printfiles.find(v=>v.variant_id===id)?.placements?.[p.placement];const a=areas.printfiles.find(a=>a.printfile_id===areaId);check(a&&a.width===p.area.width&&a.height===p.area.height&&a.dpi===p.area.dpi,'area_mismatch')}
  let result=await req(`/mockup-generator/create-task/${p.catalogId}`,{variant_ids:p.variantIds,format:'png',files:[{placement:p.placement,image_url:p.url,position:{area_width:p.area.width,area_height:p.area.height,width:p.area.width,height:p.area.height,top:0,left:0}}]});check(/^[a-zA-Z0-9_-]{1,200}$/.test(result.task_key),'task_mismatch');const path='/mockup-generator/task?task_key='+encodeURIComponent(result.task_key);tasks.add(path);
  for(let i=0;result.status==='pending'&&i<18;i++){await new Promise(r=>setTimeout(r,4000));result=await req(path)}check(result.status==='completed','generation_incomplete');
  const row={key:p.key,shopifyId:p.shopifyId,mockups:(result.mockups??[]).map(m=>({placement:m.placement,variantIds:m.variant_ids,url:safeURL(m.mockup_url),extras:(m.extra??[]).map(e=>safeURL(e.url)).filter(Boolean)}))};check(row.mockups.length>0,'no_mockups');report.push(row);console.log('BATCH4_PROOF='+JSON.stringify(row));
 }
 console.log('BATCH4_PROOFS_COMPLETE='+JSON.stringify({productWrites:0,proofs:report}));
}catch(e){console.log('BATCH4_PROOFS_FAILED='+(/^[a-z_0-9]{1,40}$/.test(e.message)?e.message:'internal_error'));process.exitCode=1}
