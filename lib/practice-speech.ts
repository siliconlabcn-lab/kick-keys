import courseAudio from './course-audio.json' with { type: 'json' };
import pinyinAudio from './pinyin-audio.json' with { type: 'json' };
import type { SpeechPlan } from './speech-player';
import type { Task, Lesson } from './lessons';
export function practiceSpeechPlan(task:Task,lesson:Pick<Lesson,'kind'|'ime'|'id'|'stage'>,base=''):SpeechPlan {
 const english=lesson.kind==='english'||lesson.kind==='alphabet';
 if(lesson.kind==='pinyin'&&!lesson.ime){
  const key=`${lesson.id}|${task.input}|${task.tone||task.label||''}`;
  const audio=(pinyinAudio as Record<string,string>)[key];
  return {segments:[],english:false,...(audio?{audio:base+audio}:{})};
 }
 if(lesson.kind==='alphabet'||(english&&lesson.stage==='letters')){
  return {segments:[],english:true,audios:task.input.replace(/[^a-z]/gi,'').toLowerCase().split('').map(letter=>`${base}audio/letters/${letter}.wav`)};
 }
 const entry=(courseAudio as Record<string,{file:string}>)[`${english?'en':'zh'}|${task.input}`];
 return {segments:[],english,...(entry?{audio:base+entry.file}:{})};
}
