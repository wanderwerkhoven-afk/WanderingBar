/** Workshop packages and pricing rules. Travel is quoted separately. */
export const WORKSHOP_PACKAGES={
 classics:{name:'Cocktail Classics!',cocktails:['Woo Woo','Daiquiri','Mojito'],pricePerPerson:35},
 times:{name:'Cocktail Times!',cocktails:["Bee's Knees",'Lychacha','Zombie'],pricePerPerson:45}
} as const;
export type WorkshopPackageId=keyof typeof WORKSHOP_PACKAGES;
export type WorkshopPricing={packageId:WorkshopPackageId;pricePerPerson:number};
export const MIN_WORKSHOP_GUESTS=10;
export function isCocktailWorkshop(service?:string){return /cocktail\s*workshop/i.test(service||'')}
export function workshopPricing(value?:Partial<WorkshopPricing>):WorkshopPricing{
 const packageId:WorkshopPackageId=value?.packageId==='times'?'times':'classics';
 const price=Number(value?.pricePerPerson);
 return {packageId,pricePerPerson:Number.isFinite(price)&&price>=0?price:WORKSHOP_PACKAGES[packageId].pricePerPerson};
}
export function workshopStaffSuggestion(guests:number){return guests<=20?'1 begeleider':guests>=30?'Overweeg 2 begeleiders':'1 begeleider; bij grotere groepen extra hulp overwegen'}
