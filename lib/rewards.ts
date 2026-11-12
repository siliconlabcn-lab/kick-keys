import type { Progress } from './player-progress';
import {LESSONS} from './lessons.ts';
export const DESTINATIONS = [
 {id:'br',kind:'alphabet',title:'字母 A–Z'}, {id:'es',kind:'numbers',title:'数字 0–9'},
 {id:'fr',kind:'symbols',title:'键盘标点'}, {id:'jp',kind:'basic',title:'指法巩固'},
 {id:'ar',kind:'pinyin',title:'中文训练'}, {id:'pt',kind:'english',title:'英语训练'},
];
export function destinationProgress(p:Progress,id:string){
 const d=DESTINATIONS.find(x=>x.id===id);
 const lessons=d?LESSONS.filter(l=>l.kind===d.kind&&(!['alphabet','numbers'].includes(d.kind)||!!l.focusKey)):[];
 return {title:d?.title||'',total:lessons.length,done:lessons.filter(l=>p.completed.includes(l.id)).length};
}
import catalog from './player-catalog.json' with { type: 'json' };
export const PLAYERS = catalog.filter(p=>p.country!=='cn'&&p.country!=='jp');
export function skillCount(p:Progress,player:typeof PLAYERS[number]){
 const saved=p.achievements?.filter(a=>a.startsWith(`typing:${player.cpm}:${player.accuracy}:`)).length||0;
 const records=new Set(p.records.filter(r=>r.id==='test-final'&&r.seconds>=85&&r.cpm>=player.cpm&&r.accuracy>=player.accuracy).map(r=>r.date)).size;
 return Math.max(saved,records);
}
export function recordSkillAchievements(p:Progress,record:Progress['records'][number]){
 const achievements=new Set(p.achievements||[]);
 for(const player of PLAYERS){
  if(record.id==='test-final'&&record.seconds>=85&&record.cpm>=player.cpm&&record.accuracy>=player.accuracy){
   const count=Math.min(player.wins,skillCount(p,player)+1);
   for(let i=1;i<=count;i++)achievements.add(`typing:${player.cpm}:${player.accuracy}:${i}`);
  }
 }
 return [...achievements];
}
export function availableStars(p:Progress){return Math.max(0,p.points-catalog.filter(x=>p.players?.includes(x.id)&&!p.achievements?.includes(`gift:${x.id}`)).reduce((n,x)=>n+x.cost,0));}
export function destinationOpen(p:Progress,id:string){const {total,done}=destinationProgress(p,id);return total>0&&done===total;}
export function redeemPlayer(p:Progress,id:string,route:'stars'|'skill'='stars'):Progress {
 const player=PLAYERS.find(x=>x.id===id);
 if(!player||p.players?.includes(id))return p;
 if(route==='skill'){
  if(skillCount(p,player)<player.wins)return p;
  return {...p,players:[...(p.players||[]),id],achievements:[...(p.achievements||[]),`gift:${id}`]};
 }
 if(!destinationOpen(p,player.country)||availableStars(p)<player.cost)return p;
 return {...p,players:[...(p.players||[]),id]};
}
