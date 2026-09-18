import test from 'node:test';
import assert from 'node:assert/strict';
import {audit,allowedPath,STORE,TARGETS,DONORS} from './printful-pending-audit.mjs';
test('rejects unrelated products, arbitrary catalogs, orders and store mutation paths',()=>{
  assert.equal(TARGETS.length,21);assert.equal(new Set(TARGETS).size,21);
  for(const id of [...TARGETS,...DONORS])assert.match(id,/^\d{13}$/);
  assert(TARGETS.includes('8650220339234'));
  assert(allowedPath('/sync/products/@8641656848418',new Set()));
  for(const path of ['/orders','/files','/sync/products/@8634330939426','/products/999','/sync/variant/12','https://example.com','/stores/1'])assert.equal(allowedPath(path,new Set()),false);
});
test('missing token never makes a request',async()=>{
  let calls=0;await assert.rejects(audit({env:{},fetchImpl:()=>{calls++;}}));assert.equal(calls,0);
});
test('fixed origin, GET-only, store pinned and redirects refused',async()=>{
  let calls=0;
  await assert.rejects(audit({env:{PRINTFUL_MIGRATION_API_TOKEN:'test'},fetchImpl:async(url,options)=>{
    calls++;assert.equal(url,'https://api.printful.com/oauth/scopes');assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.headers['X-PF-Store-Id'],String(STORE));
    return new Response('{}',{status:302});
  }}));assert.equal(calls,1);
});
test('extra scopes stop before store data access',async()=>{
  let calls=0;await assert.rejects(audit({env:{PRINTFUL_MIGRATION_API_TOKEN:'test'},fetchImpl:async()=>{calls++;return new Response(JSON.stringify({code:200,result:{scopes:[{scope:'sync_products'},{scope:'file_library'},{scope:'orders'}]}}));}}));assert.equal(calls,1);
});
