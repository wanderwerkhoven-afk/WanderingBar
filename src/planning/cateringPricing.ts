/** Canonical catering rates. The selected volume tier applies to all preordered cocktails. */
export const CATERING_TIERS=[
 {min:25,max:49,classic:6.5,signature:7.5},
 {min:50,max:99,classic:6,signature:7},
 {min:100,max:149,classic:5.5,signature:6.5},
 {min:150,max:199,classic:5,signature:6},
 {min:200,max:null,classic:4.5,signature:5.5}
] as const;
export const CATERING_MIN_HOURS=3;
export const CATERING_BASE_PRICE=175;
export const CATERING_EXTRA_HOURLY_RATE=45;
export const CATERING_SECOND_BARTENDER_HOURLY_RATE=45;
export const CATERING_MIN_COCKTAILS=25;
export type CateringPlan={cocktails:number;signaturePercentage:number;hours:number;secondBartender:boolean;secondBartenderHours:number;extraCocktails?:number};
export const DEFAULT_CATERING_PLAN:CateringPlan={cocktails:50,signaturePercentage:50,hours:3,secondBartender:false,secondBartenderHours:3,extraCocktails:0};
export function normalizeCateringPlan(input?:Partial<CateringPlan>):CateringPlan{
 const raw={...DEFAULT_CATERING_PLAN,...input};
 const safe=(v:number,fallback:number)=>Number.isFinite(Number(v))?Number(v):fallback;
 const hours=Math.max(CATERING_MIN_HOURS,Math.floor(safe(raw.hours,3)));
 return {extraCocktails:Math.max(0,Math.floor(safe(raw.extraCocktails??0,0))),cocktails:Math.max(0,Math.floor(safe(raw.cocktails,50))),signaturePercentage:Math.min(100,Math.max(0,safe(raw.signaturePercentage,50))),hours,secondBartender:!!raw.secondBartender,secondBartenderHours:Math.min(hours,Math.max(1,Math.floor(safe(raw.secondBartenderHours,3))))};
}
export function calculateCatering(input?:Partial<CateringPlan>){
 const plan=normalizeCateringPlan(input);
 const tier=[...CATERING_TIERS].reverse().find(t=>plan.cocktails>=t.min)||CATERING_TIERS[0];
 const signatureCount=Math.round(plan.cocktails*plan.signaturePercentage/100);
 const classicCount=plan.cocktails-signatureCount;
 const classicTotal=classicCount*tier.classic,signatureTotal=signatureCount*tier.signature;
 const extraCocktailRate=tier.classic;
 const extraCocktailsTotal=(plan.extraCocktails??0)*extraCocktailRate;
 const barTotal=CATERING_BASE_PRICE+(plan.hours-CATERING_MIN_HOURS)*CATERING_EXTRA_HOURLY_RATE;
 const secondBartenderTotal=plan.secondBartender?plan.secondBartenderHours*CATERING_SECOND_BARTENDER_HOURLY_RATE:0;
 return {...plan,tier,signatureCount,classicCount,classicTotal,signatureTotal,extraCocktailRate,extraCocktailsTotal,barTotal,secondBartenderTotal,drinksTotal:classicTotal+signatureTotal+extraCocktailsTotal,total:classicTotal+signatureTotal+extraCocktailsTotal+barTotal+secondBartenderTotal,validMinimum:plan.cocktails>=CATERING_MIN_COCKTAILS};
}
