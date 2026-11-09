/** Canonical visual presets for The Wandering Bar framed event menus. */
export const MENU_TEMPLATES=[
 {id:'signature',name:'Signature',background:'#F2E5D1',foreground:'#4B2C1D',accent:'#A88D6B'},
 {id:'minimal',name:'Minimal',background:'#FFFDF8',foreground:'#2E2A25',accent:'#A88D6B'},
 {id:'elegant',name:'Elegant',background:'#2E251F',foreground:'#E8C99A',accent:'#E8C99A'}
] as const;
export type MenuTemplateId=typeof MENU_TEMPLATES[number]['id'];
export type MenuFrameStyle='plain'|'ornate';
