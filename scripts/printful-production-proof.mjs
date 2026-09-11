// Generate production printfiles and preview images only. No product/order changes.
import {runPreflight} from './printful-migration-token-preflight.mjs';
import {pathToFileURL} from 'node:url';
export const STORE=18682636;
export const ROSE_URL='https://cdn.shopify.com/s/files/1/0861/2079/2098/files/cnd-charmed-by-night-production-rose-transparent.png?v=1789142002';
const assert=(v,c)=>{if(!v)throw Error(c);};
const assetURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&![...u.searchParams.keys()].some(k=>/signature|token|credential|authorization/i.test(k))&&(u.hostname.endsWith('.printful.com')||u.hostname==='printful-upload.s3-accelerate.amazonaws.com'||u.hostname==='cdn.shopify.com')?u.href:null;}catch{return null;}};
export async function run({env=process.env,fetchImpl=fetch,delay=ms=>new Promise(r=>setTimeout(r,ms))}={}){
  const preflight=await runPreflight({env,fetchImpl});assert(preflight.status==='verified','preflight_failed');
  const token=env.PRINTFUL_MIGRATION_API_TOKEN;
  const tasks=new Set();
  const allowedGet=new Set([`/stores/${STORE}`,'/products/71','/mockup-generator/printfiles/71','/files/1063597238']);
  async function req(path,body){
    const method=body?'POST':'GET';
    assert(body?path==='/mockup-generator/create-task/71':allowedGet.has(path)||[...tasks].some(k=>path===`/mockup-generator/task?task_key=${encodeURIComponent(k)}`),'path_refused');
    const response=await fetchImpl(`https://api.printful.com${path}`,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${token}`,'X-PF-Store-Id':String(STORE),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    assert(response.ok&&!response.redirected,'request_failed');
    const content=await response.text();assert(content.length<8*1024*1024,'response_too_large');const json=JSON.parse(content);assert(json.code===200,'response_failed');return json.result;
  }
  const store=await req(`/stores/${STORE}`);assert(store.id===STORE&&store.type==='shopify','store_mismatch');
  const catalog=await req('/products/71');const areas=await req('/mockup-generator/printfiles/71');
  assert(catalog.product.id===71&&catalog.product.model==='3001'&&areas.product_id===71,'catalog_mismatch');
  const plans=[{key:'charmed-by-night',shopifyId:'8648982396962',source:ROSE_URL,color:'White',variantId:4012,position:{area_width:1800,area_height:2400,width:450,height:566,top:150,left:1125}}];
  const file=await req('/files/1063597238');
  const source=assetURL(file.url);
  if(file.id===1063597238&&file.status==='ok'&&file.width===1287&&file.height===1222&&source){plans.push({key:'signature-white-tee',shopifyId:'8641656848418',source,color:'Black',variantId:4017,position:{area_width:1800,area_height:2400,width:1200,height:1139,top:150,left:300}});}
  const report={status:'complete',storeVerified:true,productWrites:0,proofs:[],signatureSourceAvailable:plans.length===2};
  for(const p of plans){
    const variant=catalog.variants.find(v=>v.id===p.variantId);assert(variant&&variant.size==='M'&&variant.color===p.color&&variant.in_stock===true,'variant_mismatch');
    const areaId=areas.variant_printfiles.find(v=>v.variant_id===p.variantId)?.placements?.front;
    const area=areas.printfiles.find(f=>f.printfile_id===areaId);assert(area&&area.width===1800&&area.height===2400&&area.dpi===150&&area.fill_mode==='fit','area_mismatch');
    const payload={variant_ids:[p.variantId],format:'png',files:[{placement:'front',image_url:p.source,position:p.position}]};
    let result=await req('/mockup-generator/create-task/71',payload);
    assert(typeof result.task_key==='string'&&/^[a-zA-Z0-9_-]{1,200}$/.test(result.task_key),'task_invalid');tasks.add(result.task_key);
    for(let i=0;result.status==='pending'&&i<12;i++){await delay(4000);result=await req(`/mockup-generator/task?task_key=${encodeURIComponent(result.task_key)}`);}
    assert(result.status==='completed','generation_incomplete');
    const files=(result.printfiles??[]).map(f=>({placement:f.placement,variantIds:f.variant_ids,url:assetURL(f.url)}));
    const mockups=(result.mockups??[]).map(m=>({placement:m.placement,variantIds:m.variant_ids,url:assetURL(m.mockup_url),extras:(m.extra??[]).map(e=>assetURL(e.url)).filter(Boolean)}));
    report.proofs.push({key:p.key,shopifyId:p.shopifyId,variantId:p.variantId,position:p.position,printfiles:files,mockups});
  }
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{assert(process.argv.length===2,'args_refused');console.log('PRODUCTION_PROOFS='+JSON.stringify(await run()));}catch(e){const codes=['preflight_failed','path_refused','request_failed','response_too_large','response_failed','store_mismatch','catalog_mismatch','variant_mismatch','area_mismatch','task_invalid','generation_incomplete','args_refused'];console.log('PRODUCTION_PROOF_FAILED='+ (codes.includes(e.message)?e.message:'internal_error'));process.exitCode=1;}}
