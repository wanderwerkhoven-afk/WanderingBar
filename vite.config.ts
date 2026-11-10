import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
const uploadedIcon='F84641DF-7011-4AD4-8662-96A0AABA3DAC.png';
export default defineConfig({
 plugins:[react(),{
  name:'wandering-bar-app-icon',
  generateBundle(){
   this.emitFile({type:'asset',fileName:'apple-touch-icon.png',source:readFileSync(uploadedIcon)});
   this.emitFile({type:'asset',fileName:'app-icon.png',source:readFileSync(uploadedIcon)});
  }
 }],
 base:'/WanderingBar/'
});
