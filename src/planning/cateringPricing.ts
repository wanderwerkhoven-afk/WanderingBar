/** Fixed quantity thresholds; independently configurable endpoint prices, interpolated in cents. */
export const CATERING_TIER_RANGES=[{min:25,max:49},{min:50,max:99},{min:100,max:149},{min:150,max:199},{min:200,max:null}] as const;
export type CateringPriceEndpoints={classicStart:number;classicEnd:number;signatureStart:number;signatureEnd:number};
export const DEFAULT_CATERING_PRICES:CateringPriceEndpoints={classicStart:6.5,classicEnd:4.5,signatureStart:7.5,signatureEnd:5.5};
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const safePrice=(n:number,fallback:number)=>Number.isFinite(Number(n))?Math.max(0,money(Number(n))):fallback;
export function normalizeCateringPrices(input?:Partial<CateringPriceEndpoints>):CateringPriceEndpoints{
 return {classicStart:safePrice(input?.classicStart??DEFAULT_CATERING_PRICES.classicStart,DEFAULT_CATERING_PRICES.classicStart),classicEnd:safePrice(input?.classicEnd??DEFAULT_CATERING_PRICES.classicEnd,DEFAULT_CATERING_PRICES.classicEnd),signatureStart:safePrice(input?.signatureStart??DEFAULT_CATERING_PRICES.signatureStart,DEFAULT_CATERING_PRICES.signatureStart),signatureEnd:safePrice(input?.signatureEnd??DEFAULT_CATERING_PRICES.signatureEnd,DEFAULT_CATERING_PRICES.signatureEnd)};
}
export function cateringTiers(input?:Partial<CateringPriceEndpoints>){
 const p=normalizeCateringPrices(input);
 return CATERING_TIER_RANGES.map((range,index)=>({...range,classic:money(p.classicStart+(p.classicEnd-p.classicStart)*index/4),signature:money(p.signatureStart+(p.signatureEnd-p.signatureStart)*index/4)}));
}
export const CATERING_TIERS=cateringTiers();
export const CATERING_MIN_HOURS=3;
export const CATERING_BASE_PRICE=175;
export const CATERING_EXTRA_HOURLY_RATE=45;
export const CATERING_SECOND_BARTENDER_HOURLY_RATE=45;
export const CATERING_MIN_COCKTAILS=25;
export type CateringPlan={cocktails:number;signaturePercentage:number;hours:number;secondBartender:boolean;secondBartenderHours:number;extraCocktails?:number;prices?:CateringPriceEndpoints;extraCocktailRateOverride?:number|null};
export const DEFAULT_CATERING_PLAN:CateringPlan={cocktails:50,signaturePercentage:50,hours:3,secondBartender:false,secondBartenderHours:3,extraCocktails:0,prices:{...DEFAULT_CATERING_PRICES}};
export function normalizeCateringPlan(input?:Partial<CateringPlan>):CateringPlan{
 const raw={...DEFAULT_CATERING_PLAN,...input};
 const safe=(v:number,fallback:number)=>Number.isFinite(Number(v))?Number(v):fallback;
 const hours=Math.max(CATERING_MIN_HOURS,Math.floor(safe(raw.hours,3)));
 return {extraCocktails:Math.max(0,Math.floor(safe(raw.extraCocktails??0,0))),cocktails:Math.max(0,Math.floor(safe(raw.cocktails,50))),signaturePercentage:Math.min(100,Math.max(0,safe(raw.signaturePercentage,50))),hours,secondBartender:!!raw.secondBartender,secondBartenderHours:Math.min(hours,Math.max(1,Math.floor(safe(raw.secondBartenderHours,3)))),prices:normalizeCateringPrices(raw.prices),extraCocktailRateOverride:raw.extraCocktailRateOverride==null?null:safePrice(raw.extraCocktailRateOverride,0)};
}
export function calculateCatering(input?:Partial<CateringPlan>){
 const plan=normalizeCateringPlan(input);
 const tiers=cateringTiers(plan.prices);
 const tier=[...tiers].reverse().find(t=>plan.cocktails>=t.min)||tiers[0];
 const signatureCount=Math.round(plan.cocktails*plan.signaturePercentage/100);
 const classicCount=plan.cocktails-signatureCount;
 const classicTotal=money(classicCount*tier.classic),signatureTotal=money(signatureCount*tier.signature);
 const extraCocktailRate=plan.extraCocktailRateOverride??tier.classic;
 const extraCocktailsTotal=money((plan.extraCocktails??0)*extraCocktailRate);
 const barTotal=CATERING_BASE_PRICE+(plan.hours-CATERING_MIN_HOURS)*CATERING_EXTRA_HOURLY_RATE;
 const secondBartenderTotal=plan.secondBartender?plan.secondBartenderHours*CATERING_SECOND_BARTENDER_HOURLY_RATE:0;
 return {...plan,tiers,tier,signatureCount,classicCount,classicTotal,signatureTotal,extraCocktailRate,extraCocktailsTotal,barTotal,secondBartenderTotal,drinksTotal:money(classicTotal+signatureTotal+extraCocktailsTotal),total:money(classicTotal+signatureTotal+extraCocktailsTotal+barTotal+secondBartenderTotal),validMinimum:plan.cocktails>=CATERING_MIN_COCKTAILS};
}
