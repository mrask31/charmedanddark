import {runPreflight} from './printful-migration-token-preflight.mjs';
const check=v=>{if(!v)throw Error('audit_failed')};
try{
 check((await runPreflight({})).status==='verified');
 const ids=[692,1635,636],products=['8650217816098','8650245734434','8650227351586'];
 const allowed=new Set([...ids.flatMap(id=>[`/products/${id}`,`/mockup-generator/printfiles/${id}`]),...products.map(id=>`/sync/products/@${id}`)]);
 const get=async path=>{check(allowed.has(path));const r=await fetch('https://api.printful.com'+path,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':'18682636'}});check(r.ok);const d=await r.json();check(d.code===200);return d.result};
 const report={status:'complete',storeId:18682636,productWrites:0,catalog:[],products:[]};
 for(const id of ids){const c=await get(`/products/${id}`),a=await get(`/mockup-generator/printfiles/${id}`);report.catalog.push({id,model:c.product.model,title:c.product.title,files:c.product.files,variants:c.variants.filter(v=>['Black','White','Solid Black Blend','Solid White Blend'].includes(v.color)),printAreas:a})}
 for(const id of products){const d=await get(`/sync/products/@${id}`);check(String(d.sync_product.external_id)===id);report.products.push({shopifyId:id,id:d.sync_product.id,variants:d.sync_variants.map(v=>({id:v.id,externalId:String(v.external_id),sku:v.sku,retailPrice:v.retail_price,synced:v.synced,isIgnored:v.is_ignored,catalogVariantId:v.variant_id,files:v.files.filter(f=>f.type!=='preview').map(f=>({id:f.id,type:f.type,status:f.status,width:f.width,height:f.height,dpi:f.dpi}))}))})}
 console.log('BATCH4_AUDIT='+JSON.stringify(report));
}catch{console.log('BATCH4_AUDIT_FAILED');process.exitCode=1}
