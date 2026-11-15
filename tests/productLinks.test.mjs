import {test} from 'node:test';
import {equal} from 'node:assert/strict';
import {findStock} from '../src/data/stockLookup.ts';

const inventory=[
 {id:'wine-a',name:'Huiswijn',quantity:8,unit:'flessen'},
 {id:'wine-b',name:'Huiswijn',quantity:24,unit:'flessen'},
 {id:'gin-a',name:'Gin',quantity:3,unit:'flessen'},
];
test('stable ID chooses the intended product even with duplicate names',()=>{
 equal(findStock(inventory,'Huiswijn','wine-b')?.quantity,24);
});
test('missing explicit ID never silently falls back to another item',()=>{
 equal(findStock(inventory,'Huiswijn','missing'),undefined);
});
test('ambiguous names do not select arbitrary inventory',()=>{
 equal(findStock(inventory,'Huiswijn'),undefined);
});
test('unique legacy name still resolves without migration',()=>{
 equal(findStock(inventory,'Gin')?.id,'gin-a');
});
