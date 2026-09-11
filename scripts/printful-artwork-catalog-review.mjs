import {runPreflight} from './printful-migration-token-preflight.mjs';
const check=(v)=>{if(!v)throw Error('review_failed')};
try {
 check((await runPreflight({})).status==='verified');
 const allowed=new Set(['/files/1063597238','/products','/products/1635','/products/271','/products/84','/products/3','/products/636']);
 const get=async path=>{check(allowed.has(path));const r=await fetch('https://api.printful.com'+path,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.PRINTFUL_MIGRATION_API_TOKEN}`,'X-PF-Store-Id':'18682636'}});check(r.ok);const d=await r.json();check(d.code===200);return d.result};
 const assetURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&(u.hostname.endsWith('.printful.com')||u.hostname==='printful-upload.s3-accelerate.amazonaws.com')?u.href:null}catch{return null}};
 const f=await get('/files/1063597238');
 const report={file:{id:f.id,width:f.width,height:f.height,dpi:f.dpi,status:f.status,filename:f.filename,url:assetURL(f.url),previewUrl:assetURL(f.preview_url),thumbnailUrl:assetURL(f.thumbnail_url)},catalog:[]};
 const products=await get('/products');const cc=products.filter(p=>p.model==='1717');check(cc.length===1);allowed.add(`/products/${cc[0].id}`);
 for(const id of [cc[0].id,1635,271,84,3,636]){const d=await get(`/products/${id}`);allowed.add(`/mockup-generator/printfiles/${id}`);const areas=await get(`/mockup-generator/printfiles/${id}`);report.catalog.push({id,model:d.product.model,title:d.product.title,variants:d.variants,files:d.product.files,printAreas:areas})}
 console.log('ARTWORK_CATALOG_REVIEW='+JSON.stringify(report));
} catch {console.log('ARTWORK_CATALOG_REVIEW_FAILED');process.exitCode=1}
