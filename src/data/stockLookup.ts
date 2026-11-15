/** Pure lookup: explicit IDs are authoritative, names only when unambiguous. */
export function findStock<T extends {id:string;name:string}>(items:T[],name:string,id?:string):T|undefined{
 if(id)return items.find(item=>item.id===id);
 const key=name.trim().toLocaleLowerCase('nl');
 const matches=items.filter(item=>item.name.trim().toLocaleLowerCase('nl')===key);
 return matches.length===1?matches[0]:undefined;
}
