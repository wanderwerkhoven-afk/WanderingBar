/** VAT amounts are calculated per invoice/quotation line in euro cents.
 * The rate is a proposal; mixed or bundled services need accounting review. */
export type VatRate=0|9|21;
export type VatLine={description:string;quantity:number;rate:number;amount:number;vatRate?:VatRate};
export type VatSummary={subtotal:number;vat9:number;vat21:number;vat0:number;vatTotal:number;totalIncludingVat:number};
export const cents=(value:number)=>Math.round((value+Number.EPSILON)*100);
export const eurosFromCents=(value:number)=>Math.round(value)/100;
export function calculateVat(lines:VatLine[]):VatSummary{
 const result:VatSummary={subtotal:0,vat9:0,vat21:0,vat0:0,vatTotal:0,totalIncludingVat:0};
 let net=0,vat9=0,vat21=0;
 for(const line of lines){
  const amount=cents(line.amount);
  net+=amount;
  if(line.vatRate===9)vat9+=Math.round(amount*0.09);
  if(line.vatRate===21)vat21+=Math.round(amount*0.21);
  if(line.vatRate===undefined)throw new Error('Btw-tarief ontbreekt bij '+line.description);
 }
 result.subtotal=eurosFromCents(net);result.vat9=eurosFromCents(vat9);result.vat21=eurosFromCents(vat21);result.vatTotal=eurosFromCents(vat9+vat21);result.totalIncludingVat=eurosFromCents(net+vat9+vat21);return result;
}
export function suggestedVatRate(description:string):VatRate{
 const name=description.toLowerCase();
 if(/mocktail|alcoholvrij|frisdrank|sap\b/.test(name))return 9;
 return 21;
}
