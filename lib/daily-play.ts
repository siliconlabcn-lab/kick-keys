import type {Progress,RecordItem} from './player-progress';
export function dayKey(date=new Date()){
 return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
export function playedToday(p:Progress,id:string,date=new Date()){
 const day=dayKey(date);
 return !!p.achievements?.includes(`daily:${day}:${id}`)||p.records.some(r=>r.id===id&&Number.isFinite(Date.parse(r.date))&&dayKey(new Date(r.date))===day);
}
export function dailyStamp(record:RecordItem){return `daily:${dayKey(new Date(record.date))}:${record.id}`;}
