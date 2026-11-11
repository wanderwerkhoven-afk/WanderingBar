/** Persisted inventory model; null quantity means uncounted, not zero. */
export type Category='Bar & materialen'|'Dranken'|'Garneringen'|'Verbruiksartikelen';
export type Item={id:string;name:string;category:Category;subcategory:string;quantity:number|null;unit:string;location:string;notes:string;brand?:string;price?:number|null;supplier?:string;priceCheckedAt?:string;webLink?:string;recipe?:string;image?:string;imageUrl?:string};
