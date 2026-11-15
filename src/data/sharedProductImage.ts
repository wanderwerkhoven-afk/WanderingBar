import {useEffect,useState} from 'react';
import {cachedInventoryImage,readInventoryImage} from '../cloud/inventoryImages';
import type {Item} from '../types/inventory';
export function useSharedInventoryImage(item?:Item):string{
 const [remote,setRemote]=useState('');
 useEffect(()=>{let active=true;setRemote(item?.imageRef?cachedInventoryImage(item.imageRef):'');if(item?.imageRef)void readInventoryImage(item.imageRef).then(value=>{if(active)setRemote(value)}).catch(()=>{});return()=>{active=false}},[item?.imageRef]);
 return item?.image||remote||item?.imageUrl||'';
}
