import {test} from 'node:test';
import {equal,deepStrictEqual} from 'node:assert/strict';
import {matchItem,purchaseLines} from '../src/inventoryPlanning.ts';

const inventory=[
 {id:'wine-a',name:'Huiswijn',category:'Dranken',quantity:8,unit:'flessen',price:7,supplier:'Leverancier A'},
 {id:'wine-b',name:'Huiswijn',category:'Dranken',quantity:24,unit:'flessen',price:9,supplier:'Leverancier B'},
];
test('explicit inventory ID wins over ambiguous product names',()=>{
 equal(matchItem('Huiswijn',inventory,'wine-b')?.id,'wine-b');
 equal(matchItem('Huiswijn',inventory,'missing'),undefined);
});
test('purchase calculations use linked inventory quantities',()=>{
 const [line]=purchaseLines([{name:'Huiswijn',unit:'flessen',amount:30,inventoryItemId:'wine-b'}],inventory,0);
 equal(line.stock,24);equal(line.shortage,6);equal(line.supplier,'Leverancier B');
});
test('ambiguous legacy names do not select arbitrary stock',()=>{
 equal(matchItem('Huiswijn',inventory),undefined);
});
