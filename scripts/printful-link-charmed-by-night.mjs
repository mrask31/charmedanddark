import {runPreflight} from './printful-migration-token-preflight.mjs';
import {pathToFileURL} from 'node:url';
const STORE=18682636, PRODUCT='8648982396962';
const SOURCE='https://cdn.shopify.com/s/files/1/0861/2079/2098/files/cnd-charmed-by-night-production-front-273dpi.png?v=1789142434';
export const MAPPINGS=[
 ['47501881016354',5495050015,9526,'XS','29.99'],['47501881049122',5495050016,4011,'S','29.99'],['47501881081890',5495050017,4012,'M','29.99'],['47501881114658',5495050018,4013,'L','29.99'],['47501881147426',5495050019,4014,'XL','29.99'],['47501881180194',5495050020,4015,'2XL','31.99'],['47501881212962',5495050021,5294,'3XL','33.99']
].map(([externalId,id,variantId,size,price])=>({externalId,id,variantId,size,price,sku:`CND-CBN-BC3001-WHT-${size}`}));
const check=(v,c)=>{if(!v)throw Error(c);};
export function validateImport(product,catalog){
 check(String(product.sync_product.external_id)===PRODUCT&&product.sync_variants.length===7,'product_mismatch');
 check(catalog.product.id===71&&catalog.product.model==='3001','catalog_mismatch');
 for(const m of MAPPINGS){const s=product.sync_variants.find(v=>v.id===m.id);const c=catalog.variants.find(v=>v.id===m.variantId);
  check(s&&String(s.external_id)===m.externalId&&s.sku===m.sku&&Number(s.retail_price)===Number(m.price),'variant_mismatch');
  check(c&&c.product_id===71&&c.color==='White'&&c.size===m.size&&c.in_stock===true,'catalog_variant_mismatch');
  check(!s.synced||(s.variant_id===m.variantId),'existing_mapping_conflict');
 }
}
export async function run({env=process.env,fetchImpl=fetch,delay=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 check((await runPreflight({env,fetchImpl})).status==='verified','preflight_failed');
 let fileId;let productWrites=0;
 const getPaths=new Set([`/stores/${STORE}`,'/products/71',`/sync/products/@${PRODUCT}`]);
 async function req(method,path,body){
  const allowed=method==='GET'?(getPaths.has(path)||(fileId&&path===`/files/${fileId}`)):method==='POST'?(path==='/files'&&body.url===SOURCE):method==='PUT'?MAPPINGS.some(m=>path===`/sync/variant/${m.id}`&&body.variant_id===m.variantId&&body.sku===m.sku&&body.retail_price===m.price&&body.is_ignored===false&&body.files.length===1&&body.files[0].id===fileId&&body.files[0].type==='default'):false;
  check(allowed,'path_refused');
  const response=await fetchImpl(`https://api.printful.com${path}`,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':String(STORE),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  check(response.ok&&!response.redirected,`http_${response.status}`);const data=await response.json();check(data.code===200,'response_failed');return data.result;
 }
 const store=await req('GET',`/stores/${STORE}`);check(store.id===STORE&&store.type==='shopify','store_mismatch');
 const catalog=await req('GET','/products/71');const before=await req('GET',`/sync/products/@${PRODUCT}`);validateImport(before,catalog);
 let file=await req('POST','/files',{url:SOURCE,filename:'CND_CharmedByNight_Front_12x16in_273dpi.png',visible:true});fileId=file.id;check(Number.isSafeInteger(fileId)&&fileId>0,'file_invalid');
 for(let i=0;file.status==='waiting'&&i<12;i++){await delay(3000);file=await req('GET',`/files/${fileId}`);}
 check(file.status==='ok'&&file.width===3276&&file.height===4368&&Math.abs(file.dpi-273)<1,'file_quality_mismatch');
 console.log('PRODUCTION_FILE_VERIFIED='+JSON.stringify({id:fileId,status:file.status,width:file.width,height:file.height,dpi:file.dpi}));
 const ordered=[MAPPINGS.find(m=>m.size==='M'),...MAPPINGS.filter(m=>m.size!=='M')];
 for(const m of ordered){
  const current=before.sync_variants.find(v=>v.id===m.id);
  if(current.synced){check(current.files.some(f=>f.id===fileId&&f.type==='default'),'existing_file_conflict');continue;}
  if(productWrites)await delay(6500);
  const updated=await req('PUT',`/sync/variant/${m.id}`,{variant_id:m.variantId,retail_price:m.price,sku:m.sku,is_ignored:false,files:[{type:'default',id:fileId}]});
  productWrites++;
  // The response schema is rechecked using the authoritative product endpoint.
  const progress=await req('GET',`/sync/products/@${PRODUCT}`);const v=progress.sync_variants.find(v=>v.id===m.id);
  check(v&&v.synced&&v.variant_id===m.variantId&&v.files.some(f=>f.id===fileId&&f.type==='default')&&!v.files.some(f=>f.type==='back'),'write_verification_failed');
  console.log('VARIANT_LINKED='+JSON.stringify({id:m.id,externalId:m.externalId,size:m.size,variantId:m.variantId,fileId}));
 }
 const final=await req('GET',`/sync/products/@${PRODUCT}`);validateImport(final,catalog);check(final.sync_variants.every(v=>v.synced&&!v.is_ignored&&v.files.some(f=>f.id===fileId&&f.type==='default')),'final_verification_failed');
 return {status:'complete',shopifyId:PRODUCT,storeId:STORE,synced:7,productWrites,file:{id:fileId,width:file.width,height:file.height,dpi:file.dpi,status:file.status},variants:final.sync_variants.map(v=>({id:v.id,externalId:String(v.external_id),catalogVariantId:v.variant_id,synced:v.synced,sku:v.sku,retailPrice:v.retail_price,files:v.files.map(f=>({id:f.id,type:f.type,status:f.status,width:f.width,height:f.height,dpi:f.dpi}))}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{check(process.argv.length===2,'args_refused');console.log('CBN_LINK_RESULT='+JSON.stringify(await run()));}catch(e){console.log('CBN_LINK_FAILED='+(/^[a-z_0-9]{1,50}$/.test(e.message)?e.message:'internal_error'));process.exitCode=1;}}
