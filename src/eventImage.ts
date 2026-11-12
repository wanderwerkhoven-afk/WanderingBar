/** Convert an uploaded event photo into a compact Firestore-compatible data URL. */
export async function imageToBase64(file:File):Promise<string>{
 if(!file.type.startsWith('image/'))throw new Error('Kies een afbeelding.');
 if(file.size>15*1024*1024)throw new Error('De afbeelding mag maximaal 15 MB zijn.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  const max=960;const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Afbeelding kan niet worden verwerkt.');
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  // JPEG discards alpha (transparent PNGs can turn black). Preserve transparency
  // only when actual transparent pixels are present; keep opaque photos compact.
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let transparent=false;
  for(let i=3;i<pixels.length;i+=4){if(pixels[i]<255){transparent=true;break}}
  const data=transparent?canvas.toDataURL('image/png'):canvas.toDataURL('image/jpeg',0.75);
  // Firestore documents have a 1 MiB limit; keep room for other event fields.
  if(data.length>700000)throw new Error('De afbeelding is te groot voor Firestore. Kies een kleinere foto.');
  return data;
 }finally{URL.revokeObjectURL(url)}
}
