import test from 'node:test';
import assert from 'node:assert/strict';
import {MAPPINGS,validateImport,run} from './printful-link-signature-white-tee.mjs';
const fixture=()=>({product:{sync_product:{external_id:'8641656848418'},sync_variants:MAPPINGS.map(m=>({id:m.id,external_id:m.externalId,sku:m.sku,retail_price:m.price,synced:false}))},catalog:{product:{id:71,model:'3001'},variants:MAPPINGS.map(m=>({id:m.variantId,product_id:71,color:m.color,size:m.size,in_stock:true}))}});
test('accept all21 exact imported variants',()=>{const f=fixture();validateImport(f.product,f.catalog)});
test('reject a foreign product or SKU',()=>{const f=fixture();f.product.sync_product.external_id='8634330939426';assert.throws(()=>validateImport(f.product,f.catalog));f.product.sync_product.external_id='8641656848418';f.product.sync_variants[0].sku='foreign';assert.throws(()=>validateImport(f.product,f.catalog))});
test('reject unavailable or wrong-color catalog variant',()=>{const f=fixture();f.catalog.variants[0].in_stock=false;assert.throws(()=>validateImport(f.product,f.catalog));f.catalog.variants[0].in_stock=true;f.catalog.variants[0].color='White';assert.throws(()=>validateImport(f.product,f.catalog))});
test('reject existing conflicting fulfillment mapping',()=>{const f=fixture();Object.assign(f.product.sync_variants[0],{synced:true,variant_id:4017});assert.throws(()=>validateImport(f.product,f.catalog))});
test('missing migration token performs zero requests',async()=>{let calls=0;await assert.rejects(run({env:{},fetchImpl:async()=>{calls++;throw Error('unexpected')}}));assert.equal(calls,0)});
