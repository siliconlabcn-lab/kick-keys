import test from 'node:test';
import assert from 'node:assert/strict';
import {playedToday,dailyStamp,dayKey} from '../lib/daily-play.ts';
import {createBackup,parseBackup,mergeProgress} from '../lib/progress-backup.ts';
const record={id:'letter-a',title:'A',accuracy:100,correct:7,mistakes:0,seconds:10,cpm:42,date:'2026-11-12T15:59:00Z',points:14};
test('daily lock recognizes old history and resets at midnight Shanghai',()=>{
 const p={records:[record],points:14,completed:['letter-a']};
 assert.equal(dayKey(new Date(record.date)),'2026-11-12');
 assert.equal(playedToday(p,'letter-a',new Date('2026-11-12T15:59:59Z')),true);
 assert.equal(playedToday(p,'letter-b',new Date(record.date)),false);
 assert.equal(playedToday(p,'letter-a',new Date('2026-11-12T16:00:00Z')),false);
});
test('daily locks survive history truncation and backup merge',()=>{
 const p={records:[],points:14,completed:['letter-a'],achievements:[dailyStamp(record)]};
 const restored=parseBackup(createBackup(p));
 const merged=mergeProgress(restored,{records:[],points:0,completed:[]});
 assert.equal(playedToday(merged,'letter-a',new Date(record.date)),true);
});
