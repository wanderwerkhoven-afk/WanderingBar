/** Canonical visual presets for The Wandering Bar framed event menus. */
export const MENU_TEMPLATES=[
 {id:'signature',name:'Signature',background:'#F2E5D1',foreground:'#4B2C1D',accent:'#A88D6B'},
 {id:'minimal',name:'Minimal',background:'#FFFDF8',foreground:'#2E2A25',accent:'#A88D6B'},
 {id:'elegant',name:'Elegant',background:'#2E251F',foreground:'#E8C99A',accent:'#E8C99A'}
] as const;
export type MenuTemplateId=typeof MENU_TEMPLATES[number]['id'];
export type MenuFrameStyle='plain'|'ornate';
export const MENU_PRINT_SIZES=[{id:'A4',label:'A4 · 21 × 29,7 cm',widthMm:210,heightMm:297},{id:'A5',label:'A5 · 14,8 × 21 cm',widthMm:148,heightMm:210}] as const;
export type MenuPrintSize=typeof MENU_PRINT_SIZES[number]['id'];
