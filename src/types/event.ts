/** Canonical persisted event model. Optional fields preserve older localStorage records. */
import type {CateringPlan} from '../planning/cateringPricing';
import type {WorkshopQuote} from '../planning/workshopQuotes';
import type {WorkshopPricing} from '../planning/workshopPricing';
import type {BeerBarPlan} from '../planning/beerBar';
export type EventStatus='Aankomend'|'In voorbereiding'|'Afgerond';
export type ScheduleItem={id:number;time:string;title:string;description:string;done:boolean};
export type PackingItem={id:number;name:string;quantity:number;unit:string;done:boolean};
export type EventActionTask={id:number;title:string;deadline?:string;done:boolean};
export type StaffMember={id:number;name:string;role:string;start:string;end:string};
export type EventData={id:number;title:string;date:string;city:string;guests:number;progress:number;status:EventStatus;photo:string;service?:string;address?:string;contact?:string;phone?:string;notes?:string;start?:string;end?:string;arrival?:string;departure?:string;menu?:string[];quantities?:Record<string,number>;schedule?:ScheduleItem[];packing?:PackingItem[];staff?:StaffMember[];tasks?:EventActionTask[];purchaseMargin?:number;logisticsNotes?:string;beerBarPlan?:BeerBarPlan;workshopPricing?:WorkshopPricing;workshopQuotes?:WorkshopQuote[];cateringPlan?:CateringPlan};
export type DeletedEvent={event:EventData;deletedAt:string};
