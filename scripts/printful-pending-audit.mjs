// Fixed Charmed & Dark migration inventory. GET only; never logs tokens or asset URLs.
import { pathToFileURL } from 'node:url';
export const STORE = 18682636;
export const TARGETS = Object.freeze(['8648973418530','8648970272802','8648971616290','8648982396962','8641656848418','8650217816098','8650224435234','8650227351586','8650220109858','8650220339234','8650220535842','8650242228258','8650245734434','8650242424866','8650242719778','8650242949154','8650244390946','8650244653090','8650244816930','8650244882466','8650245505058']);
export const DONORS = Object.freeze(['8634332282914','8634331529250']);
const safe = (condition, code) => { if (!condition) throw new Error(code); };
const number = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
const enums = (value, allowed) => allowed.includes(value) ? value : null;
const sizes = ['XS','S','M','L','XL','2XL','3XL','4XL','5XL','One size'];
const colors = ['White','Black','Maroon','Navy','Black / White','White / Black'];
export function allowedPath(path, catalogIds) {
  return ['/oauth/scopes','/stores',`/stores/${STORE}`,'/products'].includes(path)
    || [...TARGETS,...DONORS].some(id => path === `/sync/products/@${id}`)
    || [...catalogIds].some(id => path === `/products/${id}` || path === `/mockup-generator/printfiles/${id}`);
}
export async function audit({env=process.env,fetchImpl=fetch}={}) {
  const token=env.PRINTFUL_MIGRATION_API_TOKEN;
  safe(typeof token==='string' && token.length>0 && token.length<=8192 && !/\s/.test(token),'token_missing_or_invalid');
  const catalogIds=new Set();
  async function get(path) {
    safe(allowedPath(path,catalogIds),'path_refused');
    const url=`https://api.printful.com${path}`;
    const response=await fetchImpl(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${token}`,'X-PF-Store-Id':String(STORE),Accept:'application/json'}});
    if(response.status===404) return null;
    safe(response.ok && !response.redirected && (!response.url||response.url===url),'request_failed');
    const reader=response.body.getReader(); let length=0; const chunks=[];
    while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;safe(length<=8*1024*1024,'response_too_large');chunks.push(value);}
    const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    safe(body.code===200 && Object.hasOwn(body,'result'),'invalid_response');
    return body.result;
  }
  const scopes=await get('/oauth/scopes');
  safe(Array.isArray(scopes?.scopes),'scopes_invalid');
  const labels=scopes.scopes.map(x=>x.scope);
  safe(labels.length===2 && labels.includes('sync_products') && labels.includes('file_library'),'scope_mismatch');
  const stores=await get('/stores');
  safe(Array.isArray(stores)&&stores.length===1&&stores[0].id===STORE,'store_mismatch');
  const store=await get(`/stores/${STORE}`);
  safe(store?.id===STORE&&store.type==='shopify'&&['charmed & dark','charmed and dark'].includes(store.name?.trim().toLowerCase()),'store_mismatch');
  const report={status:'complete',mode:'get_only',storeVerified:true,writes:0,products:[],catalog:[]};
  for(const id of [...TARGETS,...DONORS]) {
    const detail=await get(`/sync/products/@${id}`);
    if(detail===null){report.products.push({shopifyId:id,present:false});continue;}
    const p=detail.sync_product;
    safe(String(p?.external_id)===id&&Array.isArray(detail.sync_variants)&&detail.sync_variants.length===p.variants,'product_mismatch');
    report.products.push({shopifyId:id,present:true,id:number(p.id),variants:number(p.variants),synced:number(p.synced),ignored:p.is_ignored===true,items:detail.sync_variants.map(v=>{
      safe(v.sync_product_id===p.id,'variant_parent_mismatch');
      return {id:number(v.id),externalId:/^\d+$/.test(String(v.external_id))?String(v.external_id):null,synced:v.synced===true,catalogVariantId:number(v.variant_id),catalogProductId:number(v.product?.product_id),size:enums(v.size,sizes),color:enums(v.color,colors),files:(v.files??[]).filter(f=>f.type!=='preview').map(f=>({id:number(f.id),type:enums(f.type,['default','front','back','embroidery_front','embroidery_chest_left']),status:enums(f.status,['ok','waiting','failed']),width:number(f.width),height:number(f.height),dpi:number(f.dpi),hasPosition:!!f.position,options:(f.options??[]).map(o=>({id:enums(o.id,['template_type']),value:enums(o.value,['native','advanced'])}))}))};
    })});
  }
  const products=await get('/products');
  safe(Array.isArray(products)&&products.length<3000,'catalog_invalid');
  const models=['3001','18600','3023CL','4062','1501KC','31-069','112','8803','6030',' racer','Tote','Canvas'];
  for(const p of products){if(models.some(m=>(String(p.model)+' '+String(p.title)).toLowerCase().includes(m.toLowerCase()))){catalogIds.add(p.id);}}
  safe(catalogIds.size<=60,'catalog_too_broad');
  for(const id of catalogIds){
    const d=await get(`/products/${id}`); if(!d)continue;
    const p=d.product;
    report.catalog.push({id,model:String(p.model).slice(0,80),title:String(p.title).slice(0,150),variants:d.variants.filter(v=>colors.includes(v.color)||p.type==='TOTE'||p.type==='CANVAS').map(v=>({id:v.id,color:v.color,size:v.size,price:v.price,inStock:v.in_stock})),files:p.files,options:p.options});
  }
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try {safe(process.argv.length===2,'arguments_refused'); console.log('PENDING_AUDIT_RESULT='+JSON.stringify(await audit()));}
  catch{console.log('PENDING_AUDIT_FAILED');process.exitCode=1;}
}
