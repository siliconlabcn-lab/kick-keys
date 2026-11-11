export type SpeechPlan={segments:string[];english:boolean;audio?:string;audios?:string[]};
/** Fixed recordings only. Cancellation invalidates pending events and letter sequences. */
export class SpeechPlayer {
 private generation=0;
 private audio:HTMLAudioElement|null=null;
 private timer:ReturnType<typeof setTimeout>|undefined;
 stop(){
  this.generation++;
  clearTimeout(this.timer);
  if(this.audio){
   this.audio.onended=null;this.audio.onerror=null;this.audio.onloadedmetadata=null;
   this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio=null;
  }
 }
 play(plan:SpeechPlan,onError:(message:string)=>void){
  this.stop();const generation=this.generation;
  const active=()=>generation===this.generation;
  const fail=()=>{if(active()){this.stop();onError('这次读音没有播放成功，可以点小喇叭重听。');}};
  const clips=plan.audios??(plan.audio?[plan.audio]:[]);
  if(!clips.length){fail();return;}
  let index=0;
  const next=()=>{
   if(!active())return;
   const clip=clips[index++];if(!clip)return;
   const audio=new Audio(clip);this.audio=audio;audio.volume=.7;
   // Give loading a deadline, then allow the entire recording to finish, including long passages.
   this.timer=setTimeout(fail,20000);
   audio.onloadedmetadata=()=>{
    if(!active())return;
    clearTimeout(this.timer);
    this.timer=setTimeout(fail,Number.isFinite(audio.duration)?Math.max(20000,(audio.duration+10)*1000):120000);
   };
   audio.onended=()=>{if(active()){clearTimeout(this.timer);this.audio=null;this.timer=setTimeout(next,120);}};
   audio.onerror=fail;
   void audio.play().catch(fail);
  };
  next();
 }
}
