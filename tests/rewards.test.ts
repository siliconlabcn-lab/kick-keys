import {LESSONS,LETTER_LESSONS} from '../lib/lessons.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {availableStars,destinationOpen,redeemPlayer,recordSkillAchievements,skillCount,PLAYERS} from '../lib/rewards.ts';
import {createBackup,parseBackup,mergeProgress} from '../lib/progress-backup.ts';
const p={points:1000,completed:[],records:[]};
const brazil={...p,completed:LETTER_LESSONS.map(l=>l.id)};
const brazilPlayer=PLAYERS.find(p=>p.country==='br')!;
test('redemption requires the whole module and deducts once',()=>{
 const base={...brazil,points:10000};const next=redeemPlayer(base,brazilPlayer.id);
 assert.equal(availableStars(next),10000-brazilPlayer.cost);
 assert.equal(redeemPlayer(next,brazilPlayer.id),next);
 assert.equal(redeemPlayer(p,brazilPlayer.id),p);
 assert.equal(destinationOpen({...brazil,completed:brazil.completed.slice(0,25)},'br'),false);
 assert.equal(destinationOpen(brazil,'br'),true);
 assert.equal(destinationOpen(brazil,'cn'),false);
 assert.ok(PLAYERS.every(p=>!['cn','jp'].includes(p.country)));
});
test('passport cannot be unlocked by unrelated lessons or a final-pass flag',()=>{
 assert.equal(destinationOpen({...p,achievements:['final-pass'],completed:Array.from({length:100},(_,i)=>String(i))},'pt'),false);
 const next=redeemPlayer({...brazil,points:10000},brazilPlayer.id);
 assert.deepEqual(parseBackup(createBackup(next)),next);
 assert.equal(availableStars(mergeProgress(next,next)),availableStars(next));
});

test('skill route grants a legend without stars or map and never refunds purchased cards',()=>{
 const skilled={...p,points:0,achievements:Array.from({length:5},(_,i)=>`typing:180:97:${i+1}`)};
 const result=redeemPlayer(skilled,'ronaldo','skill');
 assert.deepEqual(result.players,['ronaldo']);assert.equal(availableStars(result),0);
 assert.equal(redeemPlayer(result,'ronaldo','skill'),result);
 const paid=redeemPlayer({...p,points:9000,completed:LESSONS.filter(l=>l.kind==='english').map(l=>l.id)},'ronaldo');
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
