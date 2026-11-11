import test from 'node:test';
import assert from 'node:assert/strict';
import {availableStars,destinationOpen,redeemPlayer,recordSkillAchievements,skillCount,PLAYERS} from '../lib/rewards.ts';
import {createBackup,parseBackup,mergeProgress} from '../lib/progress-backup.ts';
const p={points:1000,completed:[],records:[]};
test('redemption deducts once, requires destination and funds',()=>{
 const next=redeemPlayer(p,'sun');assert.equal(availableStars(next),800);assert.equal(availableStars(redeemPlayer(next,'sun')),800);
 assert.equal(redeemPlayer(p,'mitoma'),p);assert.equal(redeemPlayer({...p,points:0},'sun').players,undefined);
 assert.equal(next.points,1000);assert.equal(destinationOpen(next,'cn'),true);
});
test('legend destinations require progress or qualified final, collection survives backups',()=>{
 assert.equal(destinationOpen(p,'pt'),false);assert.equal(destinationOpen({...p,achievements:['final-pass']},'pt'),true);
 const next=redeemPlayer(p,'sun');assert.deepEqual(parseBackup(createBackup(next)),next);
 assert.equal(availableStars(mergeProgress(next,p)),800);
 assert.equal(availableStars(mergeProgress(next,next)),800);
});

test('skill route grants a legend without stars or map and never refunds purchased cards',()=>{
 const skilled={...p,points:0,achievements:Array.from({length:5},(_,i)=>`typing:180:97:${i+1}`)};
 const result=redeemPlayer(skilled,'ronaldo','skill');
 assert.deepEqual(result.players,['ronaldo']);assert.equal(availableStars(result),0);
 assert.equal(redeemPlayer(result,'ronaldo','skill'),result);
 const paid=redeemPlayer({...p,points:9000,completed:Array.from({length:30},(_,i)=>String(i))},'ronaldo');
 assert.equal(availableStars(paid),1000);
 assert.equal(redeemPlayer({...paid,achievements:skilled.achievements},'ronaldo','skill').achievements?.includes('gift:ronaldo'),false);
 assert.equal(availableStars(parseBackup(createBackup(result))),0);
});

test('skill certificates survive history pruning and reject short or inaccurate tests',()=>{
 const legend=PLAYERS.find(p=>p.id==='ronaldo')!;
 const record={id:'test-final',title:'test',accuracy:97,correct:270,mistakes:8,seconds:90,cpm:180,date:'2026-11-11T01:00:00Z',points:540};
 assert.equal(recordSkillAchievements(p,{...record,seconds:10}).length,0);
 assert.equal(recordSkillAchievements(p,{...record,accuracy:80}).length,0);
 let next={...p,achievements:[] as string[]};
 for(let i=0;i<5;i++)next={...next,achievements:recordSkillAchievements(next,record)};
 assert.equal(skillCount(next,legend),5);
 assert.equal(skillCount(parseBackup(createBackup(next)),legend),5);
 const paid={...p,points:9000,players:['ronaldo']};
 const free=redeemPlayer(next,'ronaldo','skill');
 assert.equal(availableStars(mergeProgress(paid,free)),1000);
});
