import {slotsFor,tutors} from './tutors';
const key='dana-demo-bookings-v1';
type Booking={tutorId:string,slot:string,reference:string};
function read():Booking[]{try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(b=>b&&typeof b.tutorId==='string'&&typeof b.slot==='string'):[];}catch{return [];}}
export async function demoRequest(path:string,init?:RequestInit):Promise<Response>{
  if(path.startsWith('/api/availability')){const id=new URL(path,'https://demo.invalid').searchParams.get('tutor')||'';return Response.json({slots:slotsFor(id).filter(s=>!read().some(b=>b.tutorId===id&&b.slot===s))});}
  if(path==='/api/bookings'){
    const body=JSON.parse(String(init?.body||'{}'));const t=tutors.find(t=>t.id===body.tutorId);
    if(!t||!slotsFor(t.id).includes(body.slot)||!t.grades.includes(body.grade)||!t.subjects.includes(body.subject))return Response.json({error:'Please check your selected time, grade, and subject.'},{status:400});
    const bookings=read();if(bookings.some(b=>b.tutorId===body.tutorId&&b.slot===body.slot))return Response.json({error:'You already selected this sample time. Please choose another.'},{status:409});
    const reference='DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase();
    try{localStorage.setItem(key,JSON.stringify([...bookings,{tutorId:t.id,slot:body.slot,reference}]));}catch{return Response.json({error:'Browser storage is unavailable. Enable it to save a demo request.'},{status:503});}
    return Response.json({reference},{status:201});
  }
  return Response.json({error:'Unknown demo action'},{status:404});
}
export function track(event:string,properties:Record<string,unknown>={}){
  const config=(window as unknown as {POSTHOG_CONFIG?:{projectToken:string,host:string}}).POSTHOG_CONFIG;
  if(!config?.projectToken)return;
  const safe:Record<string,unknown>={prototype:true,$process_person_profile:false};
  for(const k of ['tutor_id','subject','format','rate'])if(properties[k]!==undefined)safe[k]=properties[k];
  let id='anonymous';try{id=sessionStorage.getItem('visitor')||id;}catch{}
  fetch(config.host.replace(/\/$/,'')+'/i/v0/e/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:config.projectToken,event,distinct_id:id,properties:safe,timestamp:new Date().toISOString()}),keepalive:true}).catch(()=>{});
}
