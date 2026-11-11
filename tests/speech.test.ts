import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {LESSONS,getLesson} from '../lib/lessons.ts';
import {practiceSpeechPlan} from '../lib/practice-speech.ts';
import courseAudio from '../lib/course-audio.json' with { type:'json' };
import {SpeechPlayer} from '../lib/speech-player.ts';
test('all pinyin tasks have a local recording; all words and passages preserve target language and text',()=>{
 for(const lesson of LESSONS){
  if(!['pinyin','english','alphabet'].includes(lesson.kind))continue;
  for(const task of lesson.tasks){
   const plan=practiceSpeechPlan(task,lesson);
   if(lesson.kind==='pinyin'&&!lesson.ime){
    assert.ok(plan.audio,`${lesson.id}: ${task.input}`);
    const path=new URL('../public/'+plan.audio,import.meta.url);
    assert.ok(existsSync(path));assert.ok(statSync(path).size>500);
    assert.deepEqual(plan.segments,[]);
   }else if(lesson.kind==='alphabet'||lesson.stage==='letters'){
    assert.deepEqual(plan.segments,[]);assert.ok(plan.audios?.length);
    for(const clip of plan.audios!)assert.ok(existsSync(new URL('../public/'+clip,import.meta.url)));
    assert.ok(plan.audios!.every(s=>/\/[a-z]\.wav$/.test(s)));
    assert.equal(plan.english,true);
   }else{
    assert.deepEqual(plan.segments,[]);assert.equal(plan.english,lesson.kind==='english');
    const entry=(courseAudio as Record<string,{text:string;file:string}>)[`${plan.english?'en':'zh'}|${task.input}`];
    assert.equal(entry.text,task.input);assert.equal(plan.audio,entry.file);
    assert.ok(statSync(new URL('../public/'+entry.file,import.meta.url)).size>1000);
   }
  }
 }
});
test('STU is three letters; ball remains one word; tone recordings differ',()=>{
 assert.deepEqual(practiceSpeechPlan({input:'stu'},getLesson('en-letters-review')).audios,['audio/letters/s.wav','audio/letters/t.wav','audio/letters/u.wav']);
 assert.equal(practiceSpeechPlan({input:'ball',label:'足球'},getLesson('en-positions')).audio,courseAudio['en|ball'].file);
 const tones=getLesson('zh-tones');
 assert.deepEqual(tones.tasks.slice(0,4).map(t=>practiceSpeechPlan(t,tones).audio),['audio/pinyin/ma1.mp3','audio/pinyin/ma2.mp3','audio/pinyin/ma3.mp3','audio/pinyin/ma4.mp3']);
});
test('cancelled audio callbacks cannot resume or overlap the next question',async()=>{
 const clips:any[]=[];
 const original=globalThis.Audio;
 class MockAudio {
  src:string;volume=1;duration=3;onended:any;onerror:any;onloadedmetadata:any;paused=false;
  constructor(src:string){this.src=src;clips.push(this);}
  play(){return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){}load(){}
 }
 Object.assign(globalThis,{Audio:MockAudio});
 const player=new SpeechPlayer();
 try{
  player.play({segments:[],english:true,audios:['s.wav','t.wav','u.wav']},()=>assert.fail('unexpected error'));
  const old=clips[0],lateEnd=old.onended,lateError=old.onerror;
  player.stop();assert.ok(old.paused);lateEnd();lateError();
  await new Promise(r=>setTimeout(r,160));assert.equal(clips.length,1);
  player.play({segments:[],english:true,audio:'ball.mp3'},()=>assert.fail('unexpected error'));
  lateEnd();assert.equal(clips.at(-1).src,'ball.mp3');assert.equal(clips.length,2);
 }finally{player.stop();Object.assign(globalThis,{Audio:original});}
});
test('missing recording reports an error without falling back to system speech',()=>{
 const player=new SpeechPlayer();let errors=0;
 player.play({segments:['must never be spoken'],english:true},()=>errors++);
 assert.equal(errors,1);player.stop();
});
