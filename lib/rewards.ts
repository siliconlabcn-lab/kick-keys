import type { Progress } from './player-progress';
export const DESTINATIONS = [
 {id:'cn', lessons:0}, {id:'jp',lessons:4}, {id:'br',lessons:8},
 {id:'es',lessons:12}, {id:'fr',lessons:18}, {id:'ar',lessons:24}, {id:'pt',lessons:30},
];
import catalog from './player-catalog.json' with { type: 'json' };
export const PLAYERS = catalog;
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
export function availableStars(p:Progress){return Math.max(0,p.points-PLAYERS.filter(x=>p.players?.includes(x.id)&&!p.achievements?.includes(`gift:${x.id}`)).reduce((n,x)=>n+x.cost,0));}
export function destinationOpen(p:Progress,id:string){const d=DESTINATIONS.find(x=>x.id===id);return !!d&&(p.completed.length>=d.lessons||((id==='pt'||id==='ar')&&(p.achievements?.includes('final-pass')||p.records.some(r=>r.id==='test-final'&&r.accuracy>=90&&r.correct>=90))));}
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
