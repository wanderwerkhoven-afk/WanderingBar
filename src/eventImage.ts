/** Convert an uploaded event photo into a compact Firestore-compatible data URL. */
export async function imageToBase64(file:File):Promise<string>{
 if(!file.type.startsWith('image/'))throw new Error('Kies een afbeelding.');
 if(file.size>15*1024*1024)throw new Error('De afbeelding mag maximaal 15 MB zijn.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  // Resize progressively to stay below Firestore's document limit.
  // PNG retains its alpha channel; converting to JPEG would destroy transparency.
  const max=960;
  const initialScale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Afbeelding kan niet worden verwerkt.');
  let width=Math.max(1,Math.round(image.naturalWidth*initialScale));
  let height=Math.max(1,Math.round(image.naturalHeight*initialScale));
  let transparent=false;
  let data='';
  for(let attempt=0;attempt<12;attempt++){
   canvas.width=width;canvas.height=height;
   ctx.clearRect(0,0,width,height);
   ctx.drawImage(image,0,0,width,height);
   if(attempt===0){
    const pixels=ctx.getImageData(0,0,width,height).data;
    for(let i=3;i<pixels.length;i+=4){if(pixels[i]<255){transparent=true;break}}
   }
   data=transparent?canvas.toDataURL('image/png'):canvas.toDataURL('image/jpeg',0.75);
   if(data.length<=700000)return data;
   // PNG has no browser quality setting: reduce pixel count instead.
   // The 0.8 multiplier lowers area by 36% per attempt.
   if(width<=1&&height<=1)break;
   width=Math.max(1,Math.floor(width*0.8));
   height=Math.max(1,Math.floor(height*0.8));
  }
  throw new Error('De afbeelding kan niet voldoende worden verkleind voor Firestore.');

 }finally{URL.revokeObjectURL(url)}
}
