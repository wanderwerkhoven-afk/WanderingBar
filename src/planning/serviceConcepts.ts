import {SERVICE_OPTIONS,serviceMenuKinds,type MenuKind} from '../data/menuCatalog';
export type ServiceConcept={name:string;menuKinds:MenuKind[];menuLimit:number|null;usesBeerPlan:boolean;needsMenu:boolean};
/** Derived from existing service definitions; never a second drink or recipe catalog. */
export function getServiceConcept(service?:string):ServiceConcept{
 const name=service||'Anders';const menuKinds=serviceMenuKinds(service);
 const usesBeerPlan=menuKinds.length===1&&menuKinds[0]==='Speciaalbier';
 const isKnown=SERVICE_OPTIONS.some(option=>option===name);
 return {name,menuKinds,menuLimit:menuKinds.every(k=>k==='Cocktail'||k==='Mocktail')?3:null,usesBeerPlan,needsMenu:isKnown};
}
