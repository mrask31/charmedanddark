import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runCatalogAudit, KNOWN_PRODUCTS, API_ORIGIN} from './printful-catalog-audit.mjs';
const TOKEN = 'secret-token-must-never-appear';
const PRIVATE = 'private-upstream-content-do-not-log';
const STORE = {id: 314159, name: 'Charmed & Dark', type: 'shopify'};
const SGG = '8636169617442';
const obj = (value) => structuredClone(value);
const envelope = (result, extra = {}) => ({code: 200, result, ...extra});
const response = (body, opts = {}) => new Response(JSON.stringify(body), {status: 200, ...opts});
function product(external_id = SGG, id = 123) {
  return {id, external_id, name: PRIVATE, thumbnail_url: `https://${PRIVATE}.invalid/file`, variants: 1, synced: 1, is_ignored: false};
}
function detail(p = product()) {
  return {sync_product: obj(p), sync_variants: [{id: 300, external_id: PRIVATE, sync_product_id: p.id,
    name: PRIVATE, sku: PRIVATE, synced: true, variant_id: 3456, is_ignored: false,
    files: [{id: 900, type: 'front', status: 'ok', width: 1800, height: 2400, dpi: 150,
      url: `https://${PRIVATE}.invalid/file.png`, filename: PRIVATE, hash: PRIVATE},
      {type: 'preview', status: 'ok', width: 1000, height: 1000, dpi: 300}]}]};
}
function catalog71() {return {product:{id:71,brand:'Bella + Canvas',model:'3001',currency:'USD',is_discontinued:false},
  variants:[{id:4017,product_id:71,color:'Black',size:'M',price:'9.85',in_stock:true,availability_status:[{region:'US',status:'in_stock'}],name:PRIVATE,image:`https://${PRIVATE}.invalid/a`}]};}
function area71() {return {product_id:71,available_placements:{front:PRIVATE,back:PRIVATE},
  printfiles:[{printfile_id:1,width:1800,height:2400,dpi:150,fill_mode:'fit',can_rotate:false}],
  variant_printfiles:[{variant_id:4017,placements:{front:1,back:1}}]};}
function harness({products = [product()], scopes = ['sync_products/read'], stores = [STORE], store = STORE,
  overrides = {}, details = {}, env = {PRINTFUL_API_TOKEN: TOKEN}, options = {}} = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const u = new URL(url);
    calls.push({url, init});
    const path = u.pathname + u.search;
    if (Object.hasOwn(overrides, path)) {
      const value = overrides[path];
      return typeof value === 'function' ? value(url, init) : response(value);
    }
    if (path === '/oauth/scopes') return response(envelope({scopes: scopes.map((scope) => ({scope, display_name: PRIVATE}))}));
    if (path === '/stores') return response(envelope(stores));
    if (path === `/stores/${STORE.id}`) return response(envelope(store));
    if (path === '/products/71') return response(envelope(catalog71()));
    if (path === '/mockup-generator/printfiles/71?technique=DTG') return response(envelope(area71()));
    if (u.pathname === '/sync/products') {
      const offset = Number(u.searchParams.get('offset'));
      return response(envelope(products.slice(offset, offset + 100), {paging: {offset, limit: 100, total: products.length}}));
    }
    if (u.pathname.startsWith('/sync/products/@')) {
      const id = u.pathname.slice('/sync/products/@'.length);
      return response(envelope(details[id] ?? detail(products.find((p) => String(p.external_id) === id))));
    }
    throw new Error(PRIVATE);
  };
  return {calls, run: () => runCatalogAudit({env, fetchImpl, ...options})};
}
const sgg = (report) => report.products.find((p) => p.shopify_id === SGG);
const blocked = async (h, code) => {const r = await h.run(); assert.equal(r.status, 'blocked'); assert.equal(r.error, code); return r;};

test('fixed catalog contains exactly31 legacy,12existing drafts,1protected sample; IDs unique', () => {
  assert.equal(KNOWN_PRODUCTS.length, 44);
  assert.equal(new Set(KNOWN_PRODUCTS.map((p) => p.shopify_id)).size, 44);
  assert.equal(KNOWN_PRODUCTS.filter((p) => p.category === 'existing_printful_draft').length, 12);
  assert.equal(KNOWN_PRODUCTS.filter((p) => p.category === 'protected_sample').length, 1);
  assert.equal(KNOWN_PRODUCTS.filter((p) => p.category === 'pending_migration').length, 23);
  assert.ok(KNOWN_PRODUCTS.every((p) => /^[0-9]{13}$/.test(p.shopify_id) && /^[a-z0-9_]+$/.test(p.alias)));
});
test('minimal permitted token verifies store; one matching product summarized without leaking private fields', async () => {
  const h = harness(); const r = await h.run();
  assert.equal(r.status, 'complete'); assert.equal(r.store_verified, true);
  assert.deepEqual(r.catalog, {complete:true,pages:1,products:1,variants:1,synced_variants:1,ignored_products:0,unknown_products:0,known_products_present:1});
  assert.equal(sgg(r).presence, 'present'); assert.equal(sgg(r).detail_status, 'verified');
  assert.equal(sgg(r).summary.all_variants_synced, true); assert.equal(sgg(r).summary.all_artwork_ready, true);
  assert.equal(sgg(r).summary.physical_print_placement_verified, false);
  assert.deepEqual(sgg(r).summary.artwork_metadata_profiles, [{placement:'front',width_pixels:1800,height_pixels:2400,file_dpi:150,references:1}]);
  assert.equal(sgg(r).summary.preview_file_references,1);
  assert.equal(JSON.stringify(r).includes(TOKEN), false); assert.equal(JSON.stringify(r).includes(PRIVATE), false);
  assert.equal(JSON.stringify(r).includes(String(STORE.id)), false);
  for (const {url,init} of h.calls) {
    assert.equal(new URL(url).origin, API_ORIGIN); assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'error');
    assert.equal(init.body,undefined); assert.equal(init.headers.Authorization,`Bearer ${TOKEN}`);
    assert.equal(new URL(url).pathname.includes('orders'),false);
  }
  assert.ok(h.calls.slice(2).every((call) => call.init.headers['X-PF-Store-Id'] === String(STORE.id)));
});
test('unknown products only appear as counts; detail requests only use predeclared IDs', async () => {
  const h = harness({products: [product(PRIVATE,555),product(SGG,123)]}); const r = await h.run();
  assert.equal(r.status,'complete'); assert.equal(r.catalog.unknown_products,1);
  assert.equal(h.calls.filter((c) => c.url.includes('/sync/products/@')).length,1);
  assert.equal(JSON.stringify(r).includes(PRIVATE),false); assert.equal(JSON.stringify(r).includes('555'),false);
});
test('multiple pages include known match only on second page and exact fixed query params', async () => {
  const products = Array.from({length:101},(_,i)=>product(`unknown-${i}`,500+i)); products[100]=product();
  const h=harness({products});const r=await h.run();
  assert.equal(r.status,'complete');assert.equal(r.catalog.pages,2);assert.equal(r.catalog.unknown_products,100);
  assert.equal(sgg(r).presence,'present');
  assert.deepEqual(h.calls.filter(c=>c.url.includes('/sync/products?')).map(c=>c.url),[`${API_ORIGIN}/sync/products?limit=100&offset=0`,`${API_ORIGIN}/sync/products?limit=100&offset=100`]);
});
test('exact2000product cap succeeds with20requests and no extra page',async()=>{
  const h=harness({products:Array.from({length:2000},(_,i)=>product(`unknown-${i}`,500+i))});const r=await h.run();
  assert.equal(r.status,'complete');assert.equal(r.catalog.products,2000);assert.equal(r.catalog.pages,20);assert.equal(h.calls.length,25);
});
test('empty catalog positively marks known products absent without GET detail requests',async()=>{
  const h=harness({products:[]});const r=await h.run();assert.equal(r.status,'complete');assert.equal(h.calls.length,6);
  assert.ok(r.products.every(p=>p.presence==='absent' && p.detail_status==='not_applicable'));
});
for(const [name,paging,result,code] of [
  ['overcap',{offset:0,limit:100,total:2001},[],'pagination_limit_exceeded'],
  ['missing',undefined,[],'invalid_paging'],
  ['negative total',{offset:0,limit:100,total:-1},[],'invalid_paging'],
  ['wrongoffset',{offset:100,limit:100,total:1},[product()],'invalid_paging'],
  ['wronglimit',{offset:0,limit:20,total:1},[product()],'invalid_paging'],
  ['short page',{offset:0,limit:100,total:2},[product()],'invalid_paging'],
  ['oversized page',{offset:0,limit:100,total:101},Array.from({length:101},()=>product()),'invalid_paging'],
])test(`fails closed on pagination ${name}`,async()=>{
  const r=await blocked(harness({overrides:{'/sync/products?limit=100&offset=0':envelope(result,{paging})}}),code);
  assert.equal(r.catalog.complete,false);assert.ok(r.products.every(p=>p.presence==='not_checked'));
});
test('catalog changing between pages blocks rather than falsely marking absent',async()=>{
  const ps=Array.from({length:101},(_,i)=>product(`unknown-${i}`,500+i));
  const r=await blocked(harness({products:ps,overrides:{'/sync/products?limit=100&offset=100':envelope([ps[100]],{paging:{offset:100,limit:100,total:102}})}}),'catalog_changed');
  assert.equal(r.catalog.complete,false);
});
for(const field of ['id','external_id'])test(`rejects duplicate ${field} across pages`,async()=>{
  const ps=Array.from({length:101},(_,i)=>product(`unknown-${i}`,500+i));ps[100][field]=ps[0][field];
  await blocked(harness({products:ps}),'duplicate_product');
});
for(const scopes of [['sync_products'],['sync_products/read','orders'],['sync_products/read',PRIVATE]])test(`refuses extraneous granted scopes ${JSON.stringify(scopes).replace(PRIVATE,'unknown')}`,async()=>{
  const h=harness({scopes});const r=await blocked(h,'extra_scope_refused');assert.equal(h.calls.length,1);assert.equal(JSON.stringify(r).includes(PRIVATE),false);
});
test('missingrequired scope stops before listing stores',async()=>{const h=harness({scopes:[]});await blocked(h,'missing_required_scope');assert.equal(h.calls.length,1);});
test('optional store/file read scopes accepted without extra API calls',async()=>{const h=harness({scopes:['sync_products/read','stores_list/read','file_library/read']});assert.equal((await h.run()).status,'complete');assert.equal(h.calls.length,7);});
for(const [label,stores,code] of [
  ['no matching store',[{...STORE,name:'Another Store'}],'store_not_found'],
  ['wrong store type',[{...STORE,type:'api'}],'store_not_found'],
  ['multiple matches',[STORE,{...STORE,id:5}],'store_ambiguous'],
])test(label,async()=>{const h=harness({stores});await blocked(h,code);assert.equal(h.calls.length,2);});
test('store identity reconfirmation mismatch stops before product list',async()=>{const h=harness({store:{...STORE,name:'wrong'}});await blocked(h,'store_mismatch');assert.equal(h.calls.length,3);});
test('optional storeID pin rejects another observed store',async()=>{await blocked(harness({env:{PRINTFUL_API_TOKEN:TOKEN,PRINTFUL_STORE_ID:'999'}}),'store_not_found');});
test('normalizes expectedstore spelling without allowing substring match',async()=>{assert.equal((await harness({stores:[{...STORE,name:'  Charmed AND Dark  '}],store:{...STORE,name:'Charmed and Dark'}}).run()).status,'complete');});
for(const [field,value,code]of[['id',999,'product_mismatch'],['external_id','999','product_mismatch'],['store_id',999,'store_mismatch'],['variants',2,'catalog_changed']])test(`detail identity ${field} mismatch rejected`,async()=>{const d=detail();d.sync_product[field]=value;await blocked(harness({details:{[SGG]:d}}),code);});
test('duplicate detail variants rejected',async()=>{const p=product();p.variants=2;p.synced=2;const d=detail(p);d.sync_variants.push(obj(d.sync_variants[0]));await blocked(harness({products:[p],details:{[SGG]:d}}),'duplicate_variant');});
test('wrong parent variant mapping rejected',async()=>{const d=detail();d.sync_variants[0].sync_product_id=9;await blocked(harness({details:{[SGG]:d}}),'variant_mismatch');});
test('synced variant missingcatalogmapping rejected',async()=>{const d=detail();d.sync_variants[0].variant_id=null;await blocked(harness({details:{[SGG]:d}}),'variant_mismatch');});
test('unsynced unmapped product reports migration gap rather than abort',async()=>{
  const p=product();p.synced=0;const d=detail(p);Object.assign(d.sync_variants[0],{synced:false,variant_id:null,files:[]});
  const r=await harness({products:[p],details:{[SGG]:d}}).run();assert.equal(r.status,'complete');const s=sgg(r).summary;
  assert.equal(s.mapped_variants,0);assert.equal(s.unsynced_variants,1);assert.equal(s.variants_without_artwork,1);assert.equal(s.all_artwork_ready,false);
});
test('ignored product reportsstate without modifying or pretending readyforfulfillment',async()=>{
  const p=product();p.is_ignored=true;const d=detail(p);d.sync_variants[0].is_ignored=true;
  const r=await harness({products:[p],details:{[SGG]:d}}).run();assert.equal(r.status,'complete');assert.equal(sgg(r).summary.ignored,true);assert.equal(sgg(r).summary.ignored_variants,1);
});
for(const [status,field] of [['waiting','processing_artwork_file_references'],['processing','processing_artwork_file_references'],['failed','failed_artwork_file_references'],[PRIVATE,'unknown_status_artwork_file_references']])test(`artworkstatus ${status===PRIVATE?'unknown':status} is safely counted`,async()=>{
  const d=detail();d.sync_variants[0].files[0].status=status;const r=await harness({details:{[SGG]:d}}).run();assert.equal(r.status,'complete');assert.equal(sgg(r).summary[field],1);assert.equal(sgg(r).summary.all_artwork_ready,false);assert.equal(JSON.stringify(r).includes(PRIVATE),false);
});
test('position presence observed only, arbitrary positionvalues and unknownplacementstrings never printed',async()=>{
  const d=detail();d.sync_product.position=PRIVATE;d.sync_variants[0].position={private:PRIVATE};const f=d.sync_variants[0].files[0];f.position={private:PRIVATE,top:1,left:2};f.type=PRIVATE;
  const r=await harness({details:{[SGG]:d}}).run();const s=sgg(r).summary;assert.equal(s.files_with_position_object,1);assert.equal(s.unknown_placement_file_references,1);assert.equal(s.product_has_position_field,true);assert.equal(s.variants_with_position_field,1);assert.equal(s.physical_print_placement_verified,false);assert.equal(JSON.stringify(r).includes(PRIVATE),false);
});
test('dimensions optional, missingorzero values become null without claiming DPI',async()=>{const d=detail();delete d.sync_variants[0].files[0].width;d.sync_variants[0].files[0].height=0;d.sync_variants[0].files[0].dpi=null;const r=await harness({details:{[SGG]:d}}).run();assert.equal(r.status,'complete');assert.deepEqual(sgg(r).summary.artwork_metadata_profiles,[{placement:'front',width_pixels:null,height_pixels:null,file_dpi:null,references:1}]);});
for(const [field,value]of[['width',-1],['height',1_000_001],['dpi',100_001],['dpi',PRIVATE]])test(`invalid metadata ${field}/${typeof value==='string'?'string':value} blocked`,async()=>{const d=detail();d.sync_variants[0].files[0][field]=value;await blocked(harness({details:{[SGG]:d}}),'invalid_file_metadata');});
for(const [status,code]of[[401,'http_unauthorized'],[403,'http_forbidden'],[404,'http_not_found'],[429,'http_rate_limited'],[500,'http_error']])test(`HTTP ${status} safeerror no raw upstream message`,async()=>{const h=harness({overrides:{'/oauth/scopes':()=>new Response(PRIVATE,{status})}});const r=await blocked(h,code);assert.equal(JSON.stringify(r).includes(PRIVATE),false);assert.equal(h.calls.length,1);});
test('redirectblocked without secondrequest',async()=>{const h=harness({overrides:{'/oauth/scopes':()=>new Response('',{status:302,headers:{location:'https://evil.invalid'}})}});await blocked(h,'redirect_blocked');assert.equal(h.calls.length,1);});
test('exceptionmessage not leaked',async()=>{const r=await blocked(harness({overrides:{'/oauth/scopes':()=>{throw Error(PRIVATE);}}}),'network_error');assert.equal(JSON.stringify(r).includes(PRIVATE),false);});
test('deadline aborts hanging request',async()=>{const h=harness({options:{timeoutMs:5},overrides:{'/oauth/scopes':()=>new Promise(()=>{})}});await blocked(h,'request_timeout');assert.equal(h.calls[0].init.signal.aborted,true);});
test('declared body size bounded',async()=>{await blocked(harness({options:{maxResponseBytes:500},overrides:{'/oauth/scopes':()=>response(envelope({scopes:[]}),{headers:{'content-length':'501'}})}}),'response_too_large');});
test('streamed body sizebounded withoutlengthheader',async()=>{await blocked(harness({options:{maxResponseBytes:100},overrides:{'/oauth/scopes':()=>new Response('x'.repeat(101))}}),'response_too_large');});
for(const body of ['not json','[]','{"result":{},"code":201}','{"code":200}'])test(`invalidresponse shape ${body}`,async()=>{await blocked(harness({overrides:{'/oauth/scopes':()=>new Response(body)}}),'invalid_response');});
for(const [env,code]of[[{},'missing_token'],[{PRINTFUL_API_TOKEN:'a b'},'invalid_token'],[{PRINTFUL_API_TOKEN:'x'.repeat(8193)},'invalid_token'],[{PRINTFUL_API_TOKEN:TOKEN,PRINTFUL_STORE_ID:'https://evil.invalid'},'invalid_store_id']])test(`configuration ${code} requestsnothing`,async()=>{const h=harness({env});await blocked(h,code);assert.equal(h.calls.length,0);});
test('CLI refuses anyarguments without reading token or network',()=>{const r=spawnSync(process.execPath,[fileURLToPath(new URL('./printful-catalog-audit.mjs',import.meta.url)),'--url',PRIVATE],{encoding:'utf8',env:{PATH:process.env.PATH,PRINTFUL_API_TOKEN:TOKEN}});assert.equal(r.status,1);const out=JSON.parse(r.stdout);assert.equal(out.error,'request_not_allowed');assert.equal(r.stdout.includes(PRIVATE),false);assert.equal(r.stdout.includes(TOKEN),false);});
test('verified publiccatalog emits only fixedcandidatecolors/sizes with publiccatalogIDs,prices and regions',async()=>{
  const c=catalog71();c.variants.push({...obj(c.variants[0]),id:4000,color:PRIVATE,size:'S'});
  c.variants[0].availability_status.push({region:PRIVATE,status:PRIVATE});
  const h=harness({overrides:{'/products/71':envelope(c)}});const r=await h.run();assert.equal(r.status,'complete');
  assert.deepEqual(r.public_catalog.catalog_product,{status:'verified',catalog_product_id:71,expected_model:'bella_canvas_3001',model_verified:true,is_discontinued:false,currency:'USD',total_catalog_variants:2,
    selected_variants:[{catalog_variant_id:4017,color:'Black',size:'M',base_price:9.85,in_stock:true,availability:[{region:'US',status:'in_stock'}]}]});
  assert.equal(JSON.stringify(r).includes(PRIVATE),false);
  assert.ok(h.calls.some(c=>c.url===`${API_ORIGIN}/mockup-generator/printfiles/71?technique=DTG`));
});
test('publicprintareas preserve candidate variant mapping and dimensions without descriptions',async()=>{
  const r=await harness().run();assert.equal(r.public_catalog.print_area.status,'verified');
  assert.deepEqual(r.public_catalog.print_area.printareas,[{public_printfile_id:1,width_pixels:1800,height_pixels:2400,dpi:150,fill_mode:'fit',can_rotate:false}]);
  assert.deepEqual(r.public_catalog.print_area.variant_printareas,[{catalog_variant_id:4017,placements:[{placement:'front',public_printfile_id:1},{placement:'back',public_printfile_id:1}]}]);
});
test('publiccatalog403 is independently blocked while mainreconciliation completes',async()=>{
  const h=harness({overrides:{'/products/71':()=>new Response(PRIVATE,{status:403})}});const r=await h.run();assert.equal(r.status,'complete');assert.deepEqual(r.public_catalog.catalog_product,{status:'blocked',error:'http_forbidden'});assert.equal(sgg(r).detail_status,'verified');assert.equal(h.calls.some(c=>c.url.includes('mockup-generator')),false);
});
test('publicprintarea403 is independently blocked while mainreconciliation completes',async()=>{
  const r=await harness({overrides:{'/mockup-generator/printfiles/71?technique=DTG':()=>new Response(PRIVATE,{status:403})}}).run();assert.equal(r.status,'complete');assert.deepEqual(r.public_catalog.print_area,{status:'blocked',error:'http_forbidden'});assert.equal(sgg(r).detail_status,'verified');
});
for(const [field,value]of[['id',72],['brand','Gildan'],['model','64000']])test(`wrong catalog ${field} never treated as requestedmodel`,async()=>{
  const c=catalog71();c.product[field]=value;const r=await harness({overrides:{'/products/71':envelope(c)}}).run();assert.equal(r.status,'complete');assert.deepEqual(r.public_catalog.catalog_product,{status:'blocked',error:'catalog_product_mismatch'});
});
test('catalog selectedvariant wrongparent rejected independently',async()=>{const c=catalog71();c.variants[0].product_id=1;const r=await harness({overrides:{'/products/71':envelope(c)}}).run();assert.equal(r.public_catalog.catalog_product.error,'catalog_product_mismatch');assert.equal(r.status,'complete');});
test('catalog selectedvariant unsafe price rejected with no echoedvalue',async()=>{const c=catalog71();c.variants[0].price=PRIVATE;const r=await harness({overrides:{'/products/71':envelope(c)}}).run();assert.equal(r.public_catalog.catalog_product.error,'invalid_response');assert.equal(JSON.stringify(r).includes(PRIVATE),false);});
test('printarea missing referencedfile rejected',async()=>{const a=area71();a.printfiles=[];const r=await harness({overrides:{'/mockup-generator/printfiles/71?technique=DTG':envelope(a)}}).run();assert.equal(r.public_catalog.print_area.error,'invalid_response');assert.equal(r.status,'complete');});
test('sync publiccatalog IDs are numeric and preserve blankidentity only',async()=>{const d=detail();d.sync_variants[0].product={product_id:181,name:PRIVATE,variant_id:999,image:PRIVATE};const r=await harness({details:{[SGG]:d}}).run();assert.deepEqual(sgg(r).summary.public_catalog_product_ids,[181]);assert.equal(JSON.stringify(r).includes(PRIVATE),false);});
