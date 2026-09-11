import {runPreflight} from './printful-migration-token-preflight.mjs';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const check=(v,c)=>{if(!v)throw Error(c)};
const STORE=18682636;
export function validate(p,product,catalog){
 check(['8648971616290','8648970272802','8650244882466'].includes(p.shopifyId),'target_refused');
 check(String(product.sync_product.external_id)===p.shopifyId&&product.sync_variants.length===p.mappings.length,'product_mismatch');
 check(catalog.product.id===p.catalogId&&catalog.product.model===p.model,'catalog_mismatch');
 check(p.mappings.length===(p.shopifyId==='8648970272802'?6:7),'mapping_count_mismatch');
 for(const m of p.mappings){const s=product.sync_variants.find(v=>v.id===m.id);const c=catalog.variants.find(v=>v.id===m.variantId);
  check(s&&String(s.external_id)===m.externalId&&s.sku===m.sku&&Number(s.retail_price)===Number(m.price),'variant_mismatch');
  check(c&&c.product_id===p.catalogId&&c.color===m.color&&c.size===m.size&&c.in_stock,'catalog_variant_mismatch');
  check(!s.synced||s.variant_id===m.variantId,'existing_mapping_conflict');
 }
}
export async function run({env=process.env,fetchImpl=fetch,delay=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 check((await runPreflight({env,fetchImpl})).status==='verified','preflight_failed');
 const plans=JSON.parse(await readFile(new URL('./printful-next-batch-mappings.json',import.meta.url),'utf8'));
 check(plans.length===3&&new Set(plans.map(p=>p.shopifyId)).size===3,'plan_mismatch');
 const fileIds=new Set(),uploads=new Map();let writes=0;
 const allowedGet=new Set([`/stores/${STORE}`,...plans.flatMap(p=>[`/products/${p.catalogId}`,`/sync/products/@${p.shopifyId}`])]);
 async function req(method,path,body){
  const allowed=method==='GET'?allowedGet.has(path)||[...fileIds].some(id=>path===`/files/${id}`):method==='POST'?path==='/files'&&plans.some(p=>p.files.some(f=>f.url===body.url)):method==='PUT'?plans.some(p=>p.mappings.some(m=>path===`/sync/variant/${m.id}`&&body.variant_id===m.variantId&&body.sku===m.sku&&body.retail_price===m.price&&body.is_ignored===false&&body.files.length===p.files.length&&p.files.every(f=>body.files.some(x=>x.type===f.type&&x.id===uploads.get(f.url)?.id)))):false;
  check(allowed,'path_refused');const r=await fetchImpl('https://api.printful.com'+path,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':String(STORE),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok){const failure=await r.json().catch(()=>({}));let message=typeof failure.result==='string'?failure.result:failure.error?.message??failure.message??'no_message';message=String(message).replaceAll(env.PRINTFUL_MIGRATION_API_TOKEN,'[redacted]').replace(/https?:\/\/\S+/g,'[url]').slice(0,1000);console.log('API_FAILURE='+JSON.stringify({status:r.status,method,path,message}));throw Error(`http_${r.status}`)}const d=await r.json();check(d.code===200,'response_failed');return d.result;
 }
 const store=await req('GET',`/stores/${STORE}`);check(store.id===STORE&&store.type==='shopify','store_mismatch');
 const catalogs=new Map(),before=new Map();
 // Verify all three products before the first file or variant mutation.
 for(const p of plans){if(!catalogs.has(p.catalogId))catalogs.set(p.catalogId,await req('GET',`/products/${p.catalogId}`));const product=await req('GET',`/sync/products/@${p.shopifyId}`);validate(p,product,catalogs.get(p.catalogId));before.set(p.shopifyId,product)}
 for(const p of plans){for(const f of p.files){let file=await req('POST','/files',{url:f.url,filename:`CND_${p.key}_${f.placement}_12x16in_150dpi.png`,visible:true});check(Number.isSafeInteger(file.id)&&file.id>0,'file_invalid');fileIds.add(file.id);
  for(let i=0;file.status==='waiting'&&i<12;i++){await delay(3000);file=await req('GET',`/files/${file.id}`)}check(file.status==='ok'&&file.width===1800&&file.height===2400&&Math.abs(file.dpi-150)<1,'file_quality_mismatch');uploads.set(f.url,file);
  console.log('BATCH_FILE_VERIFIED='+JSON.stringify({key:p.key,placement:f.placement,id:file.id,width:file.width,height:file.height,dpi:file.dpi}));
 }}
 const products=[];
 for(const p of plans){const pilot=p.mappings.find(m=>m.size==='M');const order=[pilot,...p.mappings.filter(m=>m.id!==pilot.id)];const files=p.files.map(f=>({type:f.type,id:uploads.get(f.url).id}));
  const checkFiles=v=>v.files.filter(f=>f.type!=='preview').length===files.length&&files.every(f=>v.files.some(x=>x.id===f.id&&x.type===f.type));
  for(const m of order){const current=before.get(p.shopifyId).sync_variants.find(v=>v.id===m.id);if(current.synced){check(checkFiles(current),'existing_file_conflict');continue}
   if(writes)await delay(6500);await req('PUT',`/sync/variant/${m.id}`,{variant_id:m.variantId,retail_price:m.price,sku:m.sku,is_ignored:false,files});writes++;
   const updated=await req('GET',`/sync/products/@${p.shopifyId}`);const v=updated.sync_variants.find(v=>v.id===m.id);check(v&&v.synced&&!v.is_ignored&&v.variant_id===m.variantId&&checkFiles(v),'write_verification_failed');console.log('BATCH_VARIANT_LINKED='+JSON.stringify({key:p.key,id:m.id,size:m.size}));
  }
  const final=await req('GET',`/sync/products/@${p.shopifyId}`);validate(p,final,catalogs.get(p.catalogId));check(final.sync_variants.every(v=>v.synced&&!v.is_ignored&&checkFiles(v)),'final_verification_failed');
  const result={key:p.key,shopifyId:p.shopifyId,synced:final.sync_variants.length,variants:final.sync_variants.map(v=>({id:v.id,externalId:String(v.external_id),catalogVariantId:v.variant_id,sku:v.sku,retailPrice:v.retail_price,files:v.files.filter(f=>f.type!=='preview').map(f=>({id:f.id,type:f.type,status:f.status,width:f.width,height:f.height,dpi:f.dpi}))}))};products.push(result);console.log('BATCH_PRODUCT_COMPLETE='+JSON.stringify(result));
 }
 return {status:'complete',storeId:STORE,writes,products};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{check(process.argv.length===2,'args_refused');console.log('NEXT_BATCH_RESULT='+JSON.stringify(await run()));}catch(e){console.log('NEXT_BATCH_FAILED='+(/^[a-z_0-9]{1,50}$/.test(e.message)?e.message:'internal_error'));process.exitCode=1}}
