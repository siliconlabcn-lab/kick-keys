export type SpeechPlan={segments:string[];english:boolean;audio?:string;audios?:string[]};
/** Fixed recordings only. Cancellation invalidates pending events and letter sequences. */
export class SpeechPlayer {
 private context:AudioContext|null=null;
 private source:AudioBufferSourceNode|null=null;
 private buffers=new Map<string,Promise<AudioBuffer>>();
 private generation=0;
 private buffer(clip:string){
  let pending=this.buffers.get(clip);
  if(!pending){
   pending=fetch(clip,{signal:AbortSignal.timeout(20000)}).then(response=>{
    if(!response.ok)throw new Error(`Audio HTTP ${response.status}`);
    return response.arrayBuffer();
   }).then(data=>this.context!.decodeAudioData(data));
   this.buffers.set(clip,pending);
   void pending.catch(()=>this.buffers.delete(clip));
  }
  return pending;
 }
 preload(plans:SpeechPlan[]){
  if(!this.context)return;
  const clips=new Set(plans.flatMap(plan=>plan.audios??(plan.audio?[plan.audio]:[])));
  for(const clip of clips)void this.buffer(clip).catch(()=>{});
 }
 private audio:HTMLAudioElement|null=null;
 private timer:ReturnType<typeof setTimeout>|undefined;
 stop(){
  this.generation++;
  clearTimeout(this.timer);
  if(this.source){this.source.onended=null;this.source.stop();this.source.disconnect();this.source=null;}
  if(this.audio){
   this.audio.onended=null;this.audio.onerror=null;this.audio.onloadedmetadata=null;
   this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio=null;
  }
 }
 play(plan:SpeechPlan,onError:(message:string)=>void){
  this.stop();const generation=this.generation;
  const active=()=>generation===this.generation;
  const fail=(error?:unknown)=>{if(active()){this.stop();onError(error instanceof DOMException&&error.name==='NotAllowedError'?'浏览器尚未开启声音，请点题目旁的小喇叭播放。':'音频加载失败，请检查网络后点小喇叭重试。');}};
  const clips=plan.audios??(plan.audio?[plan.audio]:[]);
  if(!clips.length){fail();return;}
  // Resume within the click/keypress gesture, before fetching. A shared AudioContext
  // avoids creating a separately autoplay-restricted media element for every question.
  if(typeof window!=='undefined' && typeof window.AudioContext==='function'){
   try{
    const context=this.context??(this.context=new AudioContext());
    const ready=context.resume();
    const playClip=async(index:number):Promise<void>=>{
     if(!active()||index>=clips.length)return;
     const [buffer]=await Promise.all([this.buffer(clips[index]),ready]);
     if(!active())return;
     if(context.state!=='running')throw new DOMException('Audio suspended','NotAllowedError');
     const source=context.createBufferSource();source.buffer=buffer;
     const gain=context.createGain();gain.gain.value=1;
     source.connect(gain);gain.connect(context.destination);this.source=source;
     source.onended=()=>{
      source.disconnect();gain.disconnect();
      if(!active())return;
      this.source=null;
      this.timer=setTimeout(()=>{void playClip(index+1).catch(fail);},120);
     };
     source.start();
    };
    this.preload([plan]);
    void playClip(0).catch(fail);
   }catch(error){fail(error);}
   return;
  }
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
   audio.onerror=()=>fail();
   void audio.play().catch(fail);
  };
  next();
 }
}
