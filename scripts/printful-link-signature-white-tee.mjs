import {runPreflight} from './printful-migration-token-preflight.mjs';
import {pathToFileURL} from 'node:url';
const STORE=18682636, PRODUCT='8641656848418';
const SOURCE='https://cdn.shopify.com/s/files/1/0861/2079/2098/files/cnd-signature-white-tee-production-front-161dpi.png?v=1789142837';
export const MAPPINGS=[{"externalId":"47433168257058","id":5495049947,"variantId":9527,"size":"XS","color":"Black","price":"29.99","sku":"CND-SIG-WHT-BC3001-BLK-XS"},{"externalId":"47433168289826","id":5495049948,"variantId":4016,"size":"S","color":"Black","price":"29.99","sku":"CND-SIG-WHT-BC3001-BLK-S"},{"externalId":"47433168322594","id":5495049949,"variantId":4017,"size":"M","color":"Black","price":"29.99","sku":"CND-SIG-WHT-BC3001-BLK-M"},{"externalId":"47433168355362","id":5495049950,"variantId":4018,"size":"L","color":"Black","price":"29.99","sku":"CND-SIG-WHT-BC3001-BLK-L"},{"externalId":"47433168388130","id":5495049951,"variantId":4019,"size":"XL","color":"Black","price":"29.99","sku":"CND-SIG-WHT-BC3001-BLK-XL"},{"externalId":"47433168420898","id":5495049952,"variantId":4020,"size":"2XL","color":"Black","price":"31.99","sku":"CND-SIG-WHT-BC3001-BLK-2XL"},{"externalId":"47433168453666","id":5495049953,"variantId":5295,"size":"3XL","color":"Black","price":"33.99","sku":"CND-SIG-WHT-BC3001-BLK-3XL"},{"externalId":"47433168486434","id":5495049954,"variantId":9545,"size":"XS","color":"Maroon","price":"29.99","sku":"CND-SIG-WHT-BC3001-MAR-XS"},{"externalId":"47433168519202","id":5495049955,"variantId":4106,"size":"S","color":"Maroon","price":"29.99","sku":"CND-SIG-WHT-BC3001-MAR-S"},{"externalId":"47433168551970","id":5495049956,"variantId":4107,"size":"M","color":"Maroon","price":"29.99","sku":"CND-SIG-WHT-BC3001-MAR-M"},{"externalId":"47433168584738","id":5495049957,"variantId":4108,"size":"L","color":"Maroon","price":"29.99","sku":"CND-SIG-WHT-BC3001-MAR-L"},{"externalId":"47433168617506","id":5495049958,"variantId":4109,"size":"XL","color":"Maroon","price":"29.99","sku":"CND-SIG-WHT-BC3001-MAR-XL"},{"externalId":"47433168650274","id":5495049959,"variantId":4110,"size":"2XL","color":"Maroon","price":"31.99","sku":"CND-SIG-WHT-BC3001-MAR-2XL"},{"externalId":"47433168683042","id":5495049960,"variantId":15792,"size":"3XL","color":"Maroon","price":"33.99","sku":"CND-SIG-WHT-BC3001-MAR-3XL"},{"externalId":"47433168715810","id":5495049961,"variantId":9546,"size":"XS","color":"Navy","price":"29.99","sku":"CND-SIG-WHT-BC3001-NVY-XS"},{"externalId":"47433168748578","id":5495049962,"variantId":4111,"size":"S","color":"Navy","price":"29.99","sku":"CND-SIG-WHT-BC3001-NVY-S"},{"externalId":"47433168781346","id":5495049963,"variantId":4112,"size":"M","color":"Navy","price":"29.99","sku":"CND-SIG-WHT-BC3001-NVY-M"},{"externalId":"47433168814114","id":5495049964,"variantId":4113,"size":"L","color":"Navy","price":"29.99","sku":"CND-SIG-WHT-BC3001-NVY-L"},{"externalId":"47433168846882","id":5495049966,"variantId":4114,"size":"XL","color":"Navy","price":"29.99","sku":"CND-SIG-WHT-BC3001-NVY-XL"},{"externalId":"47433168879650","id":5495049967,"variantId":4115,"size":"2XL","color":"Navy","price":"31.99","sku":"CND-SIG-WHT-BC3001-NVY-2XL"},{"externalId":"47433168912418","id":5495049968,"variantId":12874,"size":"3XL","color":"Navy","price":"33.99","sku":"CND-SIG-WHT-BC3001-NVY-3XL"}];
const check=(v,c)=>{if(!v)throw Error(c);};
export function validateImport(product,catalog){
 check(String(product.sync_product.external_id)===PRODUCT&&product.sync_variants.length===21,'product_mismatch');
 check(catalog.product.id===71&&catalog.product.model==='3001','catalog_mismatch');
 for(const m of MAPPINGS){const s=product.sync_variants.find(v=>v.id===m.id);const c=catalog.variants.find(v=>v.id===m.variantId);
  check(s&&String(s.external_id)===m.externalId&&s.sku===m.sku&&Number(s.retail_price)===Number(m.price),'variant_mismatch');
  check(c&&c.product_id===71&&c.color===m.color&&c.size===m.size&&c.in_stock===true,'catalog_variant_mismatch');
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
 let file=await req('POST','/files',{url:SOURCE,filename:'CND_SignatureWhiteTee_Front_12x16in_161dpi.png',visible:true});fileId=file.id;check(Number.isSafeInteger(fileId)&&fileId>0,'file_invalid');
 for(let i=0;file.status==='waiting'&&i<12;i++){await delay(3000);file=await req('GET',`/files/${fileId}`);}
 check(file.status==='ok'&&file.width===1932&&file.height===2576&&Math.abs(file.dpi-161)<1,'file_quality_mismatch');
 console.log('PRODUCTION_FILE_VERIFIED='+JSON.stringify({id:fileId,status:file.status,width:file.width,height:file.height,dpi:file.dpi}));
 const pilot=MAPPINGS.find(m=>m.size==='M'&&m.color==='Black');const ordered=[pilot,...MAPPINGS.filter(m=>m.id!==pilot.id)];
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
 return {status:'complete',shopifyId:PRODUCT,storeId:STORE,synced:21,productWrites,file:{id:fileId,width:file.width,height:file.height,dpi:file.dpi,status:file.status},variants:final.sync_variants.map(v=>({id:v.id,externalId:String(v.external_id),catalogVariantId:v.variant_id,synced:v.synced,sku:v.sku,retailPrice:v.retail_price,files:v.files.map(f=>({id:f.id,type:f.type,status:f.status,width:f.width,height:f.height,dpi:f.dpi}))}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{check(process.argv.length===2,'args_refused');console.log('SIGNATURE_LINK_RESULT='+JSON.stringify(await run()));}catch(e){console.log('SIGNATURE_LINK_FAILED='+(/^[a-z_0-9]{1,50}$/.test(e.message)?e.message:'internal_error'));process.exitCode=1;}}
