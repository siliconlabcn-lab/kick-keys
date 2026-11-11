'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Dumbbell, Globe2, BookOpen, Trophy, ChevronRight, Play, ArrowLeft, Target, Star, Check, Volume2, VolumeX, Lightbulb, Pause, RotateCcw, ArrowUpRight, X, CheckCircle2, Keyboard, Clock3, Flag, Sparkles, Medal, BarChart3, LockKeyhole, Heart, Menu } from 'lucide-react';
import type { CSSProperties } from 'react';
import { EMPTY, migrateLegacyProgress, readProgress, saveProgress } from '../lib/player-progress';
import type { Progress, RecordItem } from '../lib/player-progress';
import { LESSONS, LETTER_LESSONS, NUMBER_LESSONS, SHIFTED_KEYS, LOCKED_COURSES, isCourseLocked as isPublicCourseLocked, nextAvailableLessonAfter, getLesson, nextLessonFor } from '../lib/lessons';
import type { Lesson, Task } from '../lib/lessons';
import ProgressBackup from './progress-backup';
import PlayerCollection from './player-collection';
import {practiceSpeechPlan} from '../lib/practice-speech';
import {SpeechPlayer} from '../lib/speech-player';
import { LANGUAGE_STAGES } from '../lib/language-lessons';
import type { LanguageStage } from '../lib/language-lessons';

import { DESTINATIONS, PLAYERS, availableStars, destinationOpen, redeemPlayer, recordSkillAchievements } from '../lib/rewards';

type View = 'home'|'train'|'world'|'chinese'|'english'|'stats'|'session';
const COMPETITIONS: {title:string; description:string; icon:typeof Flag; courses:{id:Lesson['kind']; label:string}[]}[] = [
 {title:'青训联赛', description:'认识字母、数字和标点，再巩固双手指法。', icon:Flag, courses:[
  {id:'alphabet',label:'字母 A–Z'}, {id:'numbers',label:'数字 0–9'}, {id:'symbols',label:'键盘标点'}, {id:'basic',label:'指法巩固'},
 ]},
 {title:'冠军杯', description:'参加 30、60 或 90 秒成长测试，也可以挑战点球、接力和杯赛。', icon:Trophy, courses:[
  {id:'test',label:'成长测试'}, {id:'game',label:'足球游戏'},
 ]},
];
const KEYBOARD_ROWS = [
 [...'`1234567890-=', 'Backspace'],
 ['Tab', ...'qwertyuiop[]\\'],
 ['CapsLock', ..."asdfghjkl;'", 'Enter'],
 ['ShiftLeft', ...'zxcvbnm,./', 'ShiftRight'],
 ['Fn', 'Control', 'AltLeft', 'MetaLeft', ' ', 'MetaRight', 'AltRight', 'ArrowLeft', 'ArrowUpDown', 'ArrowRight'],
];
const SHIFT_LABELS = Object.fromEntries(Object.entries(SHIFTED_KEYS).map(([shifted,key])=>[key,shifted]));
const PHYSICAL_PUNCTUATION: Record<string, string> = {
 Backquote:'`', Minus:'-', Equal:'=', BracketLeft:'[', BracketRight:']', Backslash:'\\',
 Semicolon:';', Quote:"'", Comma:',', Period:'.', Slash:'/', Space:' ',
};
const MAC_CONTROLS: Record<string, {label:string; width:number}> = {
 Backspace:{label:'delete',width:2}, Tab:{label:'tab',width:1.5}, '\\':{label:'',width:1.5},
 CapsLock:{label:'caps lock',width:1.75}, Enter:{label:'return',width:2.25},
 ShiftLeft:{label:'⇧ shift',width:2.25}, ShiftRight:{label:'⇧ shift',width:2.75},
 Fn:{label:'fn',width:1}, Control:{label:'⌃',width:1}, AltLeft:{label:'⌥',width:1},
 MetaLeft:{label:'⌘',width:1.25}, ' ':{label:'空格',width:5.5}, MetaRight:{label:'⌘',width:1.25},
 AltRight:{label:'⌥',width:1}, ArrowLeft:{label:'←',width:1}, ArrowUpDown:{label:'↑↓',width:1}, ArrowRight:{label:'→',width:1},
};

function practiceKey(event:KeyboardEvent):string {
 const {key,code,shiftKey,isComposing}=event;
 if(!isComposing && (key==='Backspace'||/^[ -~]$/.test(key)))return key;
 const base=PHYSICAL_PUNCTUATION[code] ?? /^(?:Key|Digit)([A-Z0-9])$/.exec(code)?.[1].toLowerCase();
 if(base)return shiftKey?SHIFT_LABELS[base]??base:base;
 return isComposing?'Process':key.normalize('NFKC');
}

const COUNTRIES=[
{id:'cn',name:'中国',en:'China',flag:'🇨🇳',continent:'亚洲',lat:35,lon:104,color:'#e95b4e',accent:'#ffd268',number:'9',fact:'2022 年，中国女足赢得了女足亚洲杯冠军。',player:'孙雯',role:'中国女足代表人物',playerFact:'孙雯在 1999 年女足世界杯获得金球奖，并与巴西球员茜茜共享金靴奖。',source:'https://www.the-afc.com/en/national/afc_womens_asian_cup/news/final_china_pr_v_korea_republic.html'},
{id:'br',name:'巴西',en:'Brazil',flag:'🇧🇷',continent:'南美洲',lat:-12,lon:-52,color:'#ffd451',accent:'#208b57',number:'10',fact:'巴西男足曾五次夺得世界杯冠军。',player:'贝利',role:'巴西足球传奇',playerFact:'贝利随巴西队赢得过三届男足世界杯冠军。',source:'https://www.fifamuseum.com/en/champions-garden/brazil'},
{id:'ar',name:'阿根廷',en:'Argentina',flag:'🇦🇷',continent:'南美洲',lat:-36,lon:-64,color:'#83c8ef',accent:'#ffffff',number:'10',fact:'阿根廷男足赢得了 2022 年世界杯冠军。',player:'梅西',role:'2022 年世界杯冠军队长',playerFact:'梅西带领阿根廷队在 2022 年世界杯夺冠。',source:'https://www.fifa.com/en/tournaments/mens/worldcup/qatar2022/articles/world-cup-2022-qatar-the-stats-behind-argentina-triumph'},
{id:'fr',name:'法国',en:'France',flag:'🇫🇷',continent:'欧洲',lat:47,lon:2,color:'#496bc6',accent:'#ed6c6c',number:'10',fact:'法国男足在 1998 年和 2018 年赢得世界杯冠军。',player:'姆巴佩',role:'法国前锋',playerFact:'姆巴佩在 2018 年随法国队赢得世界杯冠军。',source:'https://www.fifa.com/fr/news/articles/resume-tournoi-coupe-du-monde-2018-russie'},
{id:'jp',name:'日本',en:'Japan',flag:'🇯🇵',continent:'亚洲',lat:36,lon:138,color:'#4c81d0',accent:'#ffffff',number:'7',fact:'日本和中国同在亚洲，隔海相望。',player:'认识亚洲足球',role:'地理小发现',playerFact:'在地图上找一找：中国和日本都位于亚洲的东部。',source:'https://www.the-afc.com/'},
{id:'es',name:'西班牙',en:'Spain',flag:'🇪🇸',continent:'欧洲',lat:40,lon:-4,color:'#e36754',accent:'#fbd160',number:'6',fact:'西班牙女足在 2023 年赢得女足世界杯冠军。',player:'团队的力量',role:'认识女子足球',playerFact:'足球场上，每一次配合都很重要。女子足球同样精彩！',source:'https://rfef.es/en/noticias/match-report-spain-wins-the-womens-world-cup'},
{id:'pt',name:'葡萄牙',en:'Portugal',flag:'🇵🇹',continent:'欧洲',lat:39,lon:-8,color:'#c74e4e',accent:'#31946b',number:'7',fact:'葡萄牙位于欧洲西南部，面向大西洋。',player:'C 罗',role:'葡萄牙球员',playerFact:'在这里收藏 C 罗球员卡。',source:'https://www.fpf.pt/'}
];
const QUIZZES=[
{q:'标准 11 人制足球中，每队场上最多有多少名队员？',a:['11 人，包含守门员','11 人，另加守门员','5 人'],correct:0,explain:'每队最多 11 人，其中一人是守门员。校园小场比赛可能采用不同人数。',icon:'👕'},
{q:'什么情况下，球才算进了球门？',a:['碰到球门线就算','整个球越过球门线，在两门柱之间、横梁下方，且没有犯规','球碰到门柱就算'],correct:1,explain:'整个球都要越过球门线，并满足球门范围和无犯规等条件，才算进球。',icon:'🥅'},
{q:'掷界外球时，应怎样把球掷出？',a:['用脚踢出去','只用一只手甩出去','用双手，从头后经头顶掷出'],correct:2,explain:'掷界外球用双手，从头后经头顶掷出；两脚也要按规则接触边线或线外地面。',icon:'⚽'}
];
const FINGER_COLORS=['#f18b92','#edbb58','#a6ce66','#67bfd4','#7ba9ec','#a294e8','#c39be8','#e98fbd','#a8b8ca'];
const FINGER_KEYS=['qaz1`','wsx2','edc3','rfvtgb45','yuhjnm67','ik,8','ol.9',"p;/'0-=[]\\"];
const FINGER_NAMES=['左手小指','左手无名指','左手中指','左手食指','右手食指','右手中指','右手无名指','右手小指'];
const keyFinger=(key:string)=>key===' '?8:!key?-1:FINGER_KEYS.findIndex(s=>s.includes(key.toLowerCase()));
function Shirt({color='#209769',accent='#f6f6e9',number='10',className=''}:{color?:string;accent?:string;number?:string;className?:string}){return <svg viewBox="0 0 140 150" className={`shirt ${className}`} aria-hidden="true"><path d="M47 18 20 30 4 60 29 75 38 60 34 137Q70 148 106 137L102 60 111 75 136 60 120 30 93 18 82 27H58Z" fill={color}/><path d="M47 18Q70 53 93 18L82 15Q70 31 58 15Z" fill={accent}/><path d="m20 30 17 32M120 30 103 62" stroke={accent} strokeWidth="8"/><text x="70" y="103" textAnchor="middle" fill={accent} fontSize="51" fontFamily="Arial" fontWeight="900">{number}</text><path d="M36 132Q70 141 104 132" fill="none" stroke="black" strokeOpacity=".06" strokeWidth="5"/></svg>}
function Ball({className='',style}:{className?:string;style?:CSSProperties}){return <svg className={`football ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="white" stroke="#243a32" strokeWidth="3"/><path d="m50 28 22 16-8 26H36L28 44ZM7 38l16-15-3-11M78 12l2 18 15 8M13 75l21 1 8 19M86 76l-21 1-8 18" fill="#253a32"/><path d="m50 28 1-24M28 44 7 38M36 70 14 75M64 70l22 6M72 44l23-6" stroke="#253a32" strokeWidth="2"/></svg>}
function Hands({finger,showColors=true}:{finger:number;showColors?:boolean}){return <div className="hands"><Hand side="left" finger={finger} showColors={showColors}/><span className="hand-home">同色键，同根手指<br/><strong>按完回到基准键</strong></span><Hand side="right" finger={finger} showColors={showColors}/></div>}
function Hand({side,finger,showColors}:{side:'left'|'right';finger:number;showColors:boolean}){
 const left=side==='left';
 const pads=[
  {d:'M25 69C23 61 26 55 32 55C38 55 41 60 42 67L48 94C49 101 46 105 40 106C34 106 31 101 30 95Z',x:34,y:73},
  {d:'M49 44C48 35 51 30 58 30C65 30 68 35 69 43L74 86C75 94 72 99 66 100C60 101 56 96 55 89Z',x:60,y:50},
  {d:'M79 28C79 19 82 15 88 15C94 15 97 20 97 28L97 82C97 91 93 96 87 96C81 96 78 91 78 83Z',x:88,y:36},
  {d:'M111 40C112 33 115 30 121 31C126 32 128 36 127 43L120 91C119 99 115 103 109 101C103 100 101 94 102 87Z',x:118,y:51},
 ];
 return <svg viewBox="14 5 168 212" className="hand" role="img" aria-label={`${left?'左':'右'}手指法图`}>
  <ellipse cx="92" cy="195" rx="48" ry="5" fill="#234d4010"/>
  <g transform={left?'':'translate(190,0) scale(-1,1)'} strokeLinejoin="round" strokeLinecap="round">
   <path d="M54 171C34 158 30 139 27 108L21 69C19 58 23 51 31 50C39 49 45 55 46 65L50 85L44 44C43 33 48 26 57 25C66 24 72 31 73 42L76 79L74 27C74 16 79 10 88 10C97 10 102 17 102 28L102 78L106 39C107 29 113 24 121 26C129 27 133 34 132 44L126 102L147 79C154 71 162 69 168 75C175 81 174 88 168 96L146 132C137 149 130 164 121 171L120 184H56Z" fill="#fffdf7" stroke="#476f62" strokeWidth="2.5"/>
   <path d="M33 111C38 135 44 150 61 157C83 166 109 158 121 140C128 130 133 121 139 117C130 134 127 158 115 169H59C44 161 36 145 33 111Z" fill="#eaf2e7"/>
   {pads.map((pad,i)=>{const idx=left?i:7-i;const active=idx===finger;const color=showColors?FINGER_COLORS[idx]:'#e6ece7';return <g key={i} className={active?'active-finger':''} style={{'--finger-color':color} as CSSProperties}>
    <path className="finger-shape" d={pad.d} fill={color} stroke={color} strokeWidth={active?2.5:1}/>
    <text x={pad.x} y={pad.y} textAnchor="middle" transform={left?undefined:`translate(${pad.x*2},0) scale(-1,1)`} fontSize="12" fontWeight="800" fill="#344656">{(left?['A','S','D','F']:[';','L','K','J'])[i]}</text>
   </g>})}
   <g className={finger===8?'active-finger':''} style={{'--finger-color':FINGER_COLORS[8]} as CSSProperties}><path className="finger-shape" d="M145 87L152 81Q160 73 164 79Q168 84 163 91L143 115Q137 122 132 117Q127 112 133 105Z" fill={showColors?FINGER_COLORS[8]:'#e6ece7'} stroke={showColors?FINGER_COLORS[8]:'#e6ece7'} strokeWidth="2"/></g>
   <path d="M43 119Q48 134 63 139M122 118Q116 140 103 150" fill="none" stroke="#c5dbcd" strokeWidth="2"/>
   <circle cx="83" cy="134" r="15" fill="#e4efe6" stroke="#c5dbcd"/>
   <path d="m83 126 7 5-3 8h-8l-3-8Z" fill="#8eafa0"/>
   <path d="M83 126v-6m7 11 6-2m-9 10 4 6m-12-6-4 6m1-14-6-2" fill="none" stroke="#8eafa0" strokeWidth="1.3"/>
   <rect x="51" y="171" width="74" height="21" rx="7" fill="#438d74" stroke="#356b5c" strokeWidth="2"/>
   <path d="M58 177H118" stroke="#bfe0ca" strokeWidth="2"/>
  </g>
  <text x="96" y="211" textAnchor="middle" fontSize="11" fontWeight="600" fill="#70897b">{left?'左手':'右手'}</text>
 </svg>;
}
function Pitch({progress,goals,feedback,lesson,paused}:{progress:number;goals:number;feedback:string;lesson:Lesson;paused:boolean}){
 const scene=lesson.id==='game'?'penalty':lesson.id.includes('final')?'stadium':'relay';
 const shooting=feedback==='goal';
 const step=progress%4;
 const paths=scene==='penalty'?[[58,63],[63,60],[68,56],[73,51]]:scene==='stadium'?[[18,63],[40,35],[56,62],[73,42]]:[[16,64],[40,36],[62,60],[75,40]];
 const position=shooting?[89,goals%2?43:55]:paths[step];
 const phases=scene==='penalty'?['准备','助跑','瞄准','射门']:['接球','推进','配合','射门'];
 return <section className="pitch-panel" aria-label="互动足球场">

  <div className={`pitch pitch-${scene} ${shooting?'is-goal':''} ${paused?'pitch-paused':''}`}>
   {scene==='stadium'&&<div className="pitch-crowd" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{background:['#f5ce70','#b5d9ed','#faf4de'][i%3]}}/>)}</div>}
   <div className="pitch-lines"><div className="center-circle"/><div className="half-line"/><div className="penalty-area"/><div className="goal-box"/></div>
   <div className="pitch-badge"><span className="live-dot"/>{scene==='penalty'?'点球训练场':scene==='stadium'?'冠军之夜':'团队配合场'}</div><div className="score-board">你的小队 <b>{goals}</b><span>⚽</span></div>
   <svg className="pass-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={paths.slice(0,step+1).map(p=>p.join(',')).join(' ')} fill="none" stroke="currentColor" strokeWidth=".65" strokeDasharray="2 2"/></svg>
   <div className={`pitch-player p-one ${step===0?'has-ball':''}`}><Shirt number="7"/></div><div className={`pitch-player p-two ${step===1?'has-ball':''}`}><Shirt number="9" color="#f3ca59" accent="#fff9da"/></div><div className={`pitch-player p-three ${step>=2?'has-ball':''}`}><Shirt number="10"/></div>
   <div className="goal-net"/><div className="pitch-keeper" style={{top:shooting?(goals%2?'56%':'36%'):'45%',transform:shooting?'rotate(-30deg)':'rotate(0deg)'}}><Shirt number="1" color="#dc927c"/></div>
   <Ball className="moving-ball" style={{left:`${position[0]}%`,top:`${position[1]}%`,transform:shooting?'rotate(300deg) scale(.7)':`rotate(${progress*65}deg)`}}/>
   {shooting&&<div className="goal-celebration" key={goals}><strong>好球！</strong><span>{goals} 次精彩进球</span>{Array.from({length:9},(_,i)=><i key={i} style={{left:`${10+i*10}%`,animationDelay:`${i*.04}s`}}/>)}</div>}
   <div className="pitch-caption" aria-live="polite">{shooting?'GOAL！配合成功，漂亮的射门！':feedback==='wrong'?'稳住，找准按键再出发':feedback==='good'?`${phases[step]}！继续保持节奏`:lesson.kind==='game'?'打完一组完成射门，慢慢来也可以':'每 4 次正确击键，完成一次射门'}</div>
  </div><div className="pitch-phases">{phases.map((label,i)=><span key={label} className={shooting||i<=step?'reached':''}><i>{shooting?'✓':i+1}</i>{label}</span>)}</div>
 </section>;
}

export default function App(){
 const [ready,setReady]=useState(false);
 useEffect(()=>{migrateLegacyProgress();setReady(true);},[]);
 if(!ready)return <main className="profile-loading" aria-live="polite">正在准备你的足球主场…</main>;
 return <PlayerApp/>;
}

function PlayerApp(){
 // Keep the existing child storage key across releases; old parent selections are ignored.
 const profile='child' as const;
 const allCoursesOpen=Object.keys(LOCKED_COURSES).length===0;
 const isCourseLocked=(kind:string)=>!allCoursesOpen && isPublicCourseLocked(kind);
 const [view,setView]=useState<View>('home');const [progress,setProgress]=useState<Progress>(EMPTY);const [saveError,setSaveError]=useState(false);const [filter,setFilter]=useState<Lesson['kind']|null>(null);const competition=COMPETITIONS.find(group=>group.courses.some(course=>course.id===filter))??(filter==='pinyin'?{title:'国内联赛 · 中文',description:'从拼音第一课，到写出自己的足球故事。',courses:[]} :filter==='english'?{title:'世界杯 · 英语',description:'从英文字母，到读写一篇足球故事。',courses:[]}:undefined);const [sound,setSound]=useState(true);const [mobileNav,setMobileNav]=useState(false);
 const [lesson,setLesson]=useState<Lesson>(getLesson('letter-a'));const [task,setTask]=useState(0);const [offset,setOffset]=useState(0);const [correct,setCorrect]=useState(0);const [mistakes,setMistakes]=useState(0);const [feedback,setFeedback]=useState('');const [paused,setPaused]=useState(false);const [hints,setHints]=useState(true);const [screenShift,setScreenShift]=useState<string|null>(null);const [remaining,setRemaining]=useState(60);const [result,setResult]=useState<RecordItem|null>(null);const [started,setStarted]=useState(false);const startRef=useRef(0);const elapsedRef=useRef(0);const segmentRef=useRef(0);const savedRef=useRef(false);const feedbackRef=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [selectedCountry,setSelectedCountry]=useState(0);const [learnTab,setLearnTab]=useState('stories');const [quiz,setQuiz]=useState(0);const [answer,setAnswer]=useState<number|null>(null);const [mapPaths,setMapPaths]=useState<string[]>([]);const [imeWarning,setImeWarning]=useState(false);const [showHelp,setShowHelp]=useState(false);
 const [languageStage,setLanguageStage]=useState<LanguageStage|null>(null);
 const languageStages=filter==='pinyin'||filter==='english'?LANGUAGE_STAGES[filter]:null;
 const activeStage=languageStages?.find(stage=>stage.id===languageStage);
 const languageLessons=languageStages?LESSONS.filter(lesson=>lesson.kind===filter):[];
 const selectCourse=(kind:Lesson['kind']|null)=>{setLanguageStage(kind==='pinyin'?LANGUAGE_STAGES.pinyin[0].id:kind==='english'?LANGUAGE_STAGES.english[0].id:null);setFilter(kind);};
 const imeInput=useRef<HTMLInputElement>(null);
 const composing=useRef(false);
 const audioRef=useRef<AudioContext|null>(null);
 const speechRef=useRef<SpeechPlayer|null>(null);
 const [speechError,setSpeechError]=useState('');
 const stopSpeech=useCallback(()=>{speechRef.current?.stop();},[]);
 useEffect(()=>{setProgress(readProgress(profile)||EMPTY);},[profile]);
 useEffect(()=>{fetch(`${import.meta.env.BASE_URL}world-paths.json`).then(r=>r.json()).then(data=>{if(Array.isArray(data))setMapPaths(data.filter((x):x is string=>typeof x==='string'));}).catch(()=>{});},[]);
 const navigate=(next:View)=>{if(next==='train'&&(filter==='pinyin'||filter==='english'))next=filter==='pinyin'?'chinese':'english';if(view==='session'&&next!=='session')stopSpeech();setView(next);setMobileNav(false);if(typeof window!=='undefined')window.scrollTo({top:0,behavior:next==='session'?'instant':'smooth'});};
 const playTone=useCallback((good:boolean)=>{if(!sound)return;try{const ac=audioRef.current||(audioRef.current=new AudioContext());if(ac.state==='suspended')void ac.resume();const osc=ac.createOscillator();const gain=ac.createGain();osc.connect(gain);gain.connect(ac.destination);osc.type='sine';osc.frequency.setValueAtTime(good?620:220,ac.currentTime);gain.gain.setValueAtTime(.035,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.12);osc.start();osc.stop(ac.currentTime+.13);}catch{}},[sound]);
 const speak=useCallback((t:Task,l:Lesson,force=false)=>{
  setSpeechError('');
  if(!sound&&!force)return;
  const player=speechRef.current||(speechRef.current=new SpeechPlayer());
  player.play(practiceSpeechPlan(t,l,import.meta.env.BASE_URL),setSpeechError);
  player.preload(l.tasks.map(task=>practiceSpeechPlan(task,l,import.meta.env.BASE_URL)));
 },[sound]);
 useEffect(()=>{
  const stop=()=>stopSpeech();
  const hidden=()=>{if(document.hidden)stop();};
  window.addEventListener('pagehide',stop);
  document.addEventListener('visibilitychange',hidden);
  return()=>{stop();window.removeEventListener('pagehide',stop);document.removeEventListener('visibilitychange',hidden);};
 },[]);
 useEffect(()=>{if(view!=='session'||paused||result||showHelp||!sound)stopSpeech();},[view,paused,result,showHelp,sound]);
 const begin=(l:Lesson)=>{setFilter(l.kind);setLanguageStage(l.stage??null);composing.current=false;if(imeInput.current){imeInput.current.value='';imeInput.current.focus({preventScroll:true});}if(isCourseLocked(l.kind)){navigate(l.kind==='pinyin'?'chinese':l.kind==='english'?'english':'train');return;}stopSpeech();if(sound&&(l.kind==='pinyin'||l.kind==='english'||l.kind==='alphabet'))speak(l.tasks[0],l);setLesson(l);setTask(0);setOffset(0);setCorrect(0);setMistakes(0);setResult(null);setFeedback('');setPaused(false);setHints(true);setScreenShift(null);setRemaining(l.timed||60);setStarted(false);setImeWarning(false);startRef.current=0;elapsedRef.current=0;segmentRef.current=0;savedRef.current=false;navigate('session');};
 const finish=useCallback(()=>{if(savedRef.current)return;savedRef.current=true;const seconds=Math.max(1,Math.round((elapsedRef.current+(segmentRef.current?Date.now()-segmentRef.current:0))/1000));const accuracy=correct+mistakes?Math.round(correct/(correct+mistakes)*100):0;const record:RecordItem={id:lesson.id,title:lesson.title,accuracy,correct,mistakes,seconds,cpm:Math.round(correct/seconds*60),date:new Date().toISOString(),points:correct>0?Math.max(5,correct*2):0};setResult(record);const previous=readProgress(profile)||progress;const next={...previous,achievements:[...new Set([...recordSkillAchievements(previous,record),...(lesson.id==='test-final'&&accuracy>=90&&correct>=90?['final-pass']:[])])],records:[record,...previous.records].slice(0,100),completed:correct>0?[...new Set([...previous.completed,lesson.id])]:previous.completed,points:previous.points+record.points};setSaveError(!saveProgress(profile,next));setProgress(next);},[correct,mistakes,lesson,profile,progress]);
 useEffect(()=>{if(view==='session'&&task>=lesson.tasks.length&&!lesson.timed&&!result)finish();},[task,lesson,view,result,finish]);
 useEffect(()=>{if(view!=='session'||!lesson.timed||!started||paused||result)return;const timer=setInterval(()=>{const seconds=(elapsedRef.current+(segmentRef.current?Date.now()-segmentRef.current:0))/1000;setRemaining(Math.max(0,Math.ceil((lesson.timed||60)-seconds)));},200);return()=>clearInterval(timer);},[view,lesson,started,paused,result]);
 useEffect(()=>{if(view==='session'&&lesson.timed&&started&&remaining===0&&!result)finish();},[view,lesson,started,remaining,result,finish]);
 const togglePause=useCallback(()=>{stopSpeech();if(paused){if(started)segmentRef.current=Date.now();setPaused(false);}else{if(segmentRef.current)elapsedRef.current+=Date.now()-segmentRef.current;segmentRef.current=0;setPaused(true);}},[paused,started]);
 useEffect(()=>{const blur=()=>{stopSpeech();if(view==='session'&&started&&!paused&&!result){if(segmentRef.current)elapsedRef.current+=Date.now()-segmentRef.current;segmentRef.current=0;setPaused(true);}};window.addEventListener('blur',blur);return()=>window.removeEventListener('blur',blur);},[view,started,paused,result]);
 const current=lesson.tasks[task%lesson.tasks.length];const target=current?.input[offset]||'';
 useEffect(()=>{
  if(view==='session'&&lesson.ime&&!paused&&!result&&!showHelp)imeInput.current?.focus({preventScroll:true});
 },[view,lesson,paused,result,showHelp]);
 const displayKey=SHIFTED_KEYS[target]||target;const needsShift=!!SHIFTED_KEYS[target];
 const finger=keyFinger(displayKey);const shiftSide=finger<4?'右':'左';
 const press=useCallback((key:string)=>{
  if(view!=='session'||paused||result||(!lesson.timed&&task>=lesson.tasks.length))return;
  if(!started){setStarted(true);startRef.current=Date.now();segmentRef.current=Date.now();}
  if(key==='Backspace'){
   if(offset>0){setOffset(o=>o-1);setCorrect(c=>Math.max(0,c-1));}
   return;
  }
  let matched=0;
  let wrong=false;
  for(const character of key){
   const expected=current.input[offset+matched];
   if(expected===undefined)break;
   const typed=lesson.ime?character.normalize('NFKC').replace('。','.'):character.toLowerCase();
   const answer=lesson.ime?expected.normalize('NFKC').replace('。','.'):expected.toLowerCase();
   if(typed!==answer){wrong=true;break;}
   matched++;
  }
  playTone(!wrong);
  if(feedbackRef.current)clearTimeout(feedbackRef.current);
  if(wrong)setMistakes(m=>m+1);
  if(matched){
   const count=correct+matched;
   setCorrect(count);
   const roundComplete=offset+matched>=current.input.length;
   const scored=lesson.kind==='game'?roundComplete:Math.floor(count/4)>Math.floor(correct/4);
   setFeedback(wrong?'wrong':scored?'goal':'good');
   if(roundComplete){
    const next=lesson.tasks[task+1];
    stopSpeech();
    if(sound&&next&&(lesson.kind==='pinyin'||lesson.kind==='english'||lesson.kind==='alphabet'))speak(next,lesson);
    setTask(t=>t+1);
    setOffset(0);
   }else setOffset(o=>o+matched);
  }else if(wrong)setFeedback('wrong');
  feedbackRef.current=setTimeout(()=>setFeedback(''),900);
 },[view,paused,result,lesson,task,started,offset,current,correct,playTone,sound,speak]);
 const commitIme=(input:HTMLInputElement)=>{
  const text=input.value;
  input.value='';
  if(!text)return;
  if(/[\u3400-\u9fff，。！？、；：]/u.test(text)||/^[,.!?;:]+$/.test(text)){
   setImeWarning(false);
   press(text);
  }else setImeWarning(true);
 };
 const pressScreenKey=(key:string)=>{press(screenShift?SHIFT_LABELS[key]??key:key);setScreenShift(null);};
 useEffect(()=>{
  const keydown=(event:KeyboardEvent)=>{
   if(view!=='session'||result||showHelp||event.metaKey||event.ctrlKey||event.altKey||event.repeat)return;
   const tag=(event.target as HTMLElement)?.tagName;
   if(tag==='INPUT'||tag==='TEXTAREA'||(event.target as HTMLElement)?.isContentEditable)return;
   if(event.key==='Escape'){event.preventDefault();togglePause();return;}
   if(lesson.ime)return;
   const key=practiceKey(event);
   if(!/^[ -~]$/.test(key)&&key!=='Backspace'){
    if(event.isComposing||event.key==='Process'||key.length===1)setImeWarning(true);
    return;
   }
   if(tag==='BUTTON'&&key===' ')return;
   event.preventDefault();
   setImeWarning(false);
   press(key);
  };
  window.addEventListener('keydown',keydown);
  return()=>window.removeEventListener('keydown',keydown);
 },[view,result,press,togglePause,showHelp,lesson.ime]);
 const nextLesson=nextLessonFor(progress.completed,allCoursesOpen);const followingLesson=nextAvailableLessonAfter(lesson.id,allCoursesOpen);const stamps=COUNTRIES.filter(c=>destinationOpen(progress,c.id)).length;const goals=lesson.kind==='game'?task:Math.floor(correct/4);const country=COUNTRIES[selectedCountry];const totalTargets=lesson.tasks.reduce((a,t)=>a+t.input.length,0);const completedCount=progress.completed.length;
 const navItems=[{id:'home' as View,label:'我的主场',icon:Home},{id:'train' as View,label:'足球赛场',icon:Dumbbell},{id:'chinese' as View,label:'国内联赛 · 中文',icon:BookOpen},{id:'english' as View,label:'世界杯 · 英语',icon:Globe2},{id:'world' as View,label:'足球环游记',icon:Globe2},{id:'stats' as View,label:'成长记录',icon:BarChart3}];
 return <div className={view==='session'&&!result?'app-shell practice-shell':'app-shell'}>
  <aside className={`sidebar ${mobileNav?'nav-open':''}`}><button className="brand" onClick={()=>navigate('home')} aria-label="Kick & Keys 首页"><div className="brand-mark"><Ball/></div><div><strong>Kick <i>&</i> Keys</strong><span>足球打字学院</span></div></button><div className="nav-caption">LET’S PLAY & LEARN</div><nav>{navItems.map(({id,label,icon:Icon})=><button key={id} onClick={()=>{if(id==='train')selectCourse(null);if(id==='chinese')selectCourse('pinyin');if(id==='english')selectCourse('english');setView(id);setMobileNav(false);window.scrollTo(0,0);}} className={view===id||(view==='session'&&id===(lesson.kind==='pinyin'?'chinese':lesson.kind==='english'?'english':'train'))?'nav-item selected':'nav-item'}><Icon size={21}/>{label}{id==='world'&&<span className="nav-new">探索</span>}</button>)}</nav><div className="side-coach"><span className="coach-ball">⚽</span><strong>小进步，也值得欢呼！</strong><p>每天练一小会儿，<br/>让手指成为你的好队友。</p><button onClick={()=>setShowHelp(true)}>看看怎么练 <ChevronRight size={15}/></button></div><div className="side-bottom"><span className="online-dot"/> 为小球员设计 · 从零开始</div></aside>
  <div className="app-main"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-toggle" onClick={()=>setMobileNav(!mobileNav)} aria-label="打开导航"><Menu size={22}/></button><span>我的足球成长之旅</span><ChevronRight size={14}/><strong>{view==='session'?'训练进行中':navItems.find(n=>n.id===view)?.label}</strong></div><div className="topbar-right"><span className="point-pill"><Star size={16} fill="currentColor"/>{availableStars(progress)} 星星</span><button className="icon-button" onClick={()=>{if(sound)stopSpeech();setSound(!sound);}} aria-label={sound?'关闭音效':'开启音效'}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><div className="player-badge" aria-label="小球员"><span className="profile-avatar" aria-hidden="true">⚽</span><span className="current-profile-name">小球员</span></div></div></header>
  <main className={`page-content ${view==='session'?'session-content':''}`}>
  {saveError&&<div className="progress-save-warning" role="alert">当前浏览器无法保存记录。本次成绩仍可查看，请先不要关闭页面。</div>}
  {view==='home'&&<>
   <div className="welcome-row"><div><div className="eyebrow"><span/> READY, LITTLE CHAMPION?</div><h1>你好，小球员！<span className="wave">👋</span></h1><p>让手指动起来，一起踢向更大的世界。</p></div><div className="day-badge"><Flag size={17}/><span>你的旅程，从这里开始</span></div></div>
   <section className="hero"><div className="hero-copy"><span className="section-pill"><Sparkles size={14}/> 小小手指，大大梦想</span><h2>练好每一次击键，<br/>踢出你的<span>精彩世界。</span></h2><p>从 A 到 Z，再到数字和拼音，<br/>跟着足球，收集一路的成长与惊喜。</p><button className="primary" onClick={()=>begin(nextLesson)}><Play size={17} fill="currentColor"/> 开始今天的训练 <ArrowUpRight size={18}/></button><div className="hero-note"><CheckCircle2 size={14}/> 不用会英语 <span>·</span> 可以看键盘 <span>·</span> 慢慢来就好</div></div><div className="hero-visual"><img src={`${import.meta.env.BASE_URL}football-hero.png`} alt="小球员和足球伙伴在球场上练习，F 和 J 键陪伴在旁"/><div className="float-note note-one">⚽ 好传球！</div><div className="float-note note-two"><Star size={16} fill="#f5bc4e" color="#f5bc4e"/> 每一步都算数</div></div></section>
   <div className="home-grid"><section className="today-card"><div className="section-heading"><h2><span className="mini-icon green"><Target size={19}/></span> 今天的小目标</h2><span className="soft-label">从基础开始</span></div><div className="mission"><div className="keycaps"><kbd>{nextLesson.focusKey?.toUpperCase()||'⚽'}</kbd>{nextLesson.kind==='alphabet'&&nextLesson.focusKey&&<kbd>{nextLesson.focusKey}</kbd>}</div><div><h3>{nextLesson.title}</h3><p>{nextLesson.desc}</p></div><button onClick={()=>begin(nextLesson)} className="circle-go" aria-label="进入推荐训练"><ChevronRight size={23}/></button></div><div className="mission-bottom"><span><Clock3 size={14}/> {nextLesson.minutes}，轻松练一练</span><span>正确指法优先 <Heart size={13}/></span></div></section><section className="passport-mini" onClick={()=>navigate('world')}><div><span className="eyebrow">MY FOOTBALL PASSPORT</span><h3>下一站，世界球场</h3><p>练习解锁目的地，用星星邀请心仪球员。</p><button className="text-link" onClick={()=>navigate('world')}>打开足球护照 <ArrowUpRight size={15}/></button></div><div className="passport-art"><Globe2 size={76}/><span className="flag-sticker">{COUNTRIES[Math.min(stamps,5)].flag}</span></div></section></div>
   <div className="section-heading spaced"><div><h2>选一块你喜欢的训练场</h2><p>先打好基础，再慢慢探索新的挑战。</p></div><button className="text-link" onClick={()=>{selectCourse(null);navigate('train');}}>全部赛事 <ChevronRight size={16}/></button></div>
   <div className="training-tiles"><button className="training-tile green-tile" onClick={()=>{selectCourse('alphabet');navigate('train');}}><div className="tile-top"><span className="tile-tag">推荐从这里开始</span><Keyboard size={21}/></div><div className="tile-illustration keys-art"><kbd>A</kbd><Ball/><kbd>Z</kbd></div><h3>小球员入门</h3><p>从 A 起步 · 再练数字 · 每键学指法</p><div className="tile-bottom"><span>26 个字母 · 10 个数字</span><span className="round-arrow"><ChevronRight size={18}/></span></div></button><button className={`training-tile orange-tile ${allCoursesOpen?'':'locked-tile'}`} onClick={()=>{selectCourse('pinyin');navigate('chinese');}}><div className="tile-top"><span className="tile-tag">{allCoursesOpen?'拼音入门':<><LockKeyhole size={12}/> 暂未开放</>}</span>{allCoursesOpen?<Volume2 size={21}/>:<LockKeyhole size={21}/>}</div><div className="tile-illustration pinyin-art"><span>zú qiú</span><Ball/></div><h3>国内联赛 · 中文</h3><p>听读拼音 · 认识汉字 · 打出足球故事</p><div className="tile-bottom"><span>{allCoursesOpen?'中文训练':'中文训练 · 已锁定'}</span><span className="round-arrow">{allCoursesOpen?<ChevronRight size={18}/>:<LockKeyhole size={16}/>}</span></div></button><button className={`training-tile blue-tile ${allCoursesOpen?'':'locked-tile'}`} onClick={()=>{selectCourse('english');navigate('english');}}><div className="tile-top"><span className="tile-tag">{allCoursesOpen?'足球英语':<><LockKeyhole size={12}/> 暂未开放</>}</span>{allCoursesOpen?<BookOpen size={21}/>:<LockKeyhole size={21}/>}</div><div className="tile-illustration english-art"><Shirt color="#80aee0" number="10"/><span>Hello!</span></div><h3>世界杯 · 英语</h3><p>足球单词 · 简单短句 · 打开新世界</p><div className="tile-bottom"><span>{allCoursesOpen?'英语训练':'英语训练 · 已锁定'}</span><span className="round-arrow">{allCoursesOpen?<ChevronRight size={18}/>:<LockKeyhole size={16}/>}</span></div></button></div>
   <section className="bottom-banner"><div className="trophy-graphic">🏆</div><div><h3>{allCoursesOpen?'点球训练场':'点球训练场，等待开场'}</h3><p>从基准键出发，打完一组键就完成一次射门。</p></div><button className={allCoursesOpen?'secondary':'secondary locked-entry'} onClick={()=>begin(getLesson('game'))}>{allCoursesOpen?<><Play size={16}/> 足球游戏</>:<><LockKeyhole size={16}/> 足球游戏 · 已锁定</>}</button></section>
  </>}
  {view==='train'&&!competition&&<>
   <PageTitle eyebrow="MATCH DAY" title="足球赛场" subtitle="青训练好键盘基本功，冠军杯检验速度与准确率。中文和英语请从左侧进入。"/>
   <div className="competition-grid">
    {COMPETITIONS.map(({title,description,icon:Icon,courses},index)=><button key={title} className="competition-card" onClick={()=>selectCourse(courses[0].id)}>
     <span className="competition-icon"><Icon size={26}/></span>
     <span className="eyebrow">第 {index+1} 级</span>
     <h2>{title}</h2><p>{description}</p>
     <span className="competition-link">进入赛事 <ChevronRight size={16}/></span>
    </button>)}
   </div>
  </>}
  {(view==='train'||view==='chinese'||view==='english')&&competition&&filter&&<>
   {view==='train'&&<button className="back-link competition-back" onClick={()=>selectCourse(null)}><ArrowLeft size={17}/> 返回足球赛场</button>}
   <PageTitle eyebrow="MATCH DAY" title={competition.title} subtitle={competition.description}/>
   <div className="tabs">{languageStages?.map(stage=><button key={stage.id} className={activeStage?.id===stage.id?'active':''} onClick={()=>setLanguageStage(stage.id)}>{stage.title}</button>)}{competition.courses.map(({id,label})=>{
    const locked=isCourseLocked(id);
    return <button key={id} className={`course-tab ${filter===id?'active':''} ${locked?'locked':''}`} onClick={()=>selectCourse(id)} aria-label={locked?`${label} · 已锁定`:label}>
     {locked&&<LockKeyhole size={14}/>} {label} {locked&&<small>锁定</small>}
    </button>;
   })}</div>
   <div className="coach-tip"><Lightbulb size={21}/><span>{isCourseLocked(filter)?'先练好字母、数字和指法。带锁的训练场暂未开放，慢慢来，每一步都算数。':filter==='alphabet'?'先把左手放在 A S D F，右手放在 J K L ;。看清屏幕的小写字母，找到键盘上对应的大写字母，再用提示的手指按下。':filter==='numbers'?'字母熟悉后，再练键盘最上排的 0–9。每按完一个数字，手指回到基准键。':filter==='basic'?'从 F 和 J 出发，混着练字母、数字和标点。每次伸手按键后，回到基准键再出发。':filter==='symbols'?'可以先分开练普通标点和 Shift 组合键，再到「标点混合接力」练习切换。':filter==='pinyin'?'从单韵母开始，逐步练到汉字、词语、句子和足球短文。':filter==='test'?'选一场测试。按下第一个键开始计时，和自己的同关成绩比较。':'选自己喜欢的一课开始。学会一点点，也值得开心！'}</span></div>
   {isCourseLocked(filter)?
    <LockedCourse title={LOCKED_COURSES[filter]!} onReturn={()=>selectCourse('alphabet')}/>:
    (filter==='alphabet'||filter==='numbers')?
    <StarterCourse kind={filter} completed={progress.completed} nextId={nextLesson.id} onBegin={begin}/>:
    languageStages&&!activeStage?
    <div className="competition-grid language-stages" aria-label="学习阶段">
     {languageStages.map(({id,title,desc},index)=>{
      const courses=languageLessons.filter(lesson=>lesson.stage===id);
      const done=courses.filter(lesson=>progress.completed.includes(lesson.id)).length;
      return <button key={id} className="competition-card" onClick={()=>setLanguageStage(id)}>
       <span className="eyebrow">第 {index+1} 阶段 · {done} / {courses.length} 节已练习</span>
       <h2>{title}</h2><p>{desc}</p>
       <span className="competition-link">查看课程 <ChevronRight size={16}/></span>
      </button>;
     })}
    </div>:
    <>
     {activeStage&&<div className="language-stage-heading">

      <h2>{activeStage.title}</h2><p>{activeStage.desc}</p>
     </div>}
     <div className="lesson-grid">{LESSONS.filter(l=>l.kind===filter&&(!activeStage||l.stage===activeStage.id)).map((l,i)=><button className={`lesson-card ${l.color}`} onClick={()=>begin(l)} key={l.id}>
      <div className="lesson-top"><span className="lesson-number">{String(i+1).padStart(2,'0')}</span>{progress.completed.includes(l.id)?<span className="completed-tag"><CheckCircle2 size={14}/> 已练习</span>:<span className="soft-label">{activeStage?`${l.tasks.length} 道练习`:l.minutes}</span>}</div>
      <span className="eyebrow">{l.tag}</span><h3>{l.title}</h3><p>{l.desc}</p>
      <div className="lesson-preview">{l.tasks.slice(0,4).map((t,j)=><span key={j}>{t.label||t.input}</span>)}</div>
      <div className="lesson-bottom">开始练习 <span className="round-arrow"><Play size={15} fill="currentColor"/></span></div>
     </button>)}</div>
    </>}
  </>}
  {view==='session'&&!result&&<>
   <div className="session-header">
    <button className="back-link" onClick={()=>navigate('train')}><ArrowLeft size={17}/> 返回课程</button>
    <h1>{lesson.title}</h1>
    <div className="session-actions">
     <button className="icon-button" onClick={()=>begin(lesson)} aria-label="重新开始"><RotateCcw size={18}/></button>
     <button className="secondary small" onClick={togglePause}>{paused?<Play size={15}/>:<Pause size={15}/>} {paused?'继续':'暂停'}</button>
    </div>
   </div>
   <div className="session-layout"><section className={`practice-card ${feedback==='wrong'?'shake':''}`}><div className="practice-top"><span><span className="live-dot"/>{started?'训练中':'按下第一个键开始'}</span><span>{lesson.timed?<><Clock3 size={15}/>{remaining}s</>:<>{Math.min(task+1,lesson.tasks.length)} / {lesson.tasks.length}</>}</span></div><div className="progress-track"><i style={{width:`${lesson.timed?(1-remaining/lesson.timed)*100:correct/totalTargets*100}%`}}/></div><div className="typing-task">{current.phase&&<div className="exercise-phase">{current.phase}</div>}{(current.label||lesson.ime||lesson.kind==='english'||lesson.kind==='alphabet')&&<div className="hanzi-label">{current.label}<button className="voice-button" disabled={paused} onClick={()=>{setSound(true);speak(current,lesson,true);imeInput.current?.focus({preventScroll:true});}} aria-label="朗读当前词语"><Volume2 size={19}/></button></div>}{speechError&&<p className="speech-error" role="status">{speechError}</p>}{current.tone&&<div className="tone-label">{current.tone}{current.word&&<span className="pinyin-word"> · {current.word}</span>}</div>}<div className={`target-text ${lesson.ime||current.input.length>12?'long-text':''}`}>{current.input.split('').map((char,i)=><span className={i<offset?'typed':i===offset?'current':''} key={`${task}-${i}`}>{char===' '?'␣':char}</span>)}</div>{(lesson.kind==='basic'||lesson.kind==='alphabet')&&<div className="letter-match">屏幕上的 <b>{target}</b>，就是键盘上的 <kbd>{target.toUpperCase()}</kbd></div>}{lesson.kind==='numbers'&&<div className="letter-match">数字 <b>{target}</b>，在键盘最上面一排</div>}<div className={`finger-message ${feedback==='wrong'?'error-message':''}`} aria-live="polite">{lesson.ime?(feedback==='wrong'?'这个字不一样，再看看候选栏。':'用中文输入法拼读并选字，可以逐字或分词输入。'):feedback==='wrong'?'没关系，再看一眼亮起的键，试一次。':finger===8?'用拇指轻按空格键':`${FINGER_NAMES[finger]||'对应手指'} → ${displayKey===' '?'空格':displayKey.toUpperCase()} 键${needsShift?`（另一只手按住${shiftSide} Shift）`:''}`}</div>
   {lesson.ime&&<input ref={imeInput} className="ime-practice-input" aria-label="输入汉字" placeholder="在这里用拼音输入法选字" autoComplete="off" spellCheck={false} disabled={paused||showHelp}
    onCompositionStart={()=>{composing.current=true;}}
    onCompositionEnd={event=>{composing.current=false;commitIme(event.currentTarget);}}
    onChange={event=>{if(!composing.current&&!(event.nativeEvent as InputEvent).isComposing)commitIme(event.currentTarget);}}/>}
   </div>{imeWarning&&<div className="ime-warning">{lesson.ime?'请切换到中文输入法，选中候选汉字后再提交。':'请切换到英文输入状态，再按屏幕上提示的键。'}</div>}
   {!lesson.ime&&<><div className="keyboard-toolbar"><span><Keyboard size={15}/> 跟着闪动的键和手指练习</span><button onClick={()=>setHints(!hints)}>{hints?'试试隐藏提示':'显示键位提示'}</button></div><div className="key-guide" key={`${lesson.id}-${task}-${offset}-${hints}`}><div className={`visual-keyboard mac-keyboard ${!hints?'no-hints':''}`} aria-label="MacBook ANSI 屏幕键盘">
    {KEYBOARD_ROWS.map((row,index)=><div className="key-row" key={index}>
     {row.map(key=>{
      const control=MAC_CONTROLS[key];
      const label=key.length===1&&key!==' '?key.toUpperCase():control.label;
      const width=control?.width??1;
      const shiftKey=key==='ShiftLeft'||key==='ShiftRight';
      const recommendedShift=needsShift&&key===(shiftSide==='右'?'ShiftRight':'ShiftLeft');
      const active=hints&&(shiftKey?recommendedShift:displayKey.toLowerCase()===key);
      const fingerIndex=shiftKey?(key==='ShiftLeft'?0:7):keyFinger(key);
      const style={'--key-width':width,'--finger-color':FINGER_COLORS[fingerIndex]??'#e9eee5'} as CSSProperties;
      const isAction=key.length===1||key==='Backspace'||shiftKey;
      const className=`keyboard-key ${key==='f'||key==='j'?'home-key':''} ${active?'key-active':''}`;
      if(!isAction)return <span className="keyboard-key mac-control" style={style} key={key}>{label}</span>;
      const name=shiftKey?(key==='ShiftLeft'?'左 Shift':'右 Shift'):key==='Backspace'?'退格':label;
      return <button type="button" tabIndex={-1} key={key} aria-label={`屏幕键 ${name}`} aria-pressed={shiftKey?screenShift===key:undefined} style={style} className={className}
       onClick={event=>{
        event.currentTarget.blur();
        if(shiftKey)setScreenShift(value=>value===key?null:key);
        else pressScreenKey(key);
       }}>
       {SHIFT_LABELS[key]&&<small>{SHIFT_LABELS[key]}</small>}{label}
      </button>;
     })}
    </div>)}
   </div><Hands finger={hints?finger:-1} showColors={hints}/></div><div className="keyboard-footnote">用电脑键盘练习效果更好 · 按完回到基准键 · Esc 暂停</div></>}</section><aside className="session-right"><Pitch key={lesson.id} lesson={lesson} paused={paused} progress={lesson.kind==='game'?Math.floor(offset*4/current.input.length):correct} goals={goals} feedback={feedback}/><div className="live-stats"><div><span className="stat-symbol green"><Check size={20}/></span><strong>{correct+mistakes?Math.round(correct/(correct+mistakes)*100):100}<small>%</small></strong><span>准确率</span></div><div><span className="stat-symbol orange"><Flag size={20}/></span><strong>{goals}</strong><span>精彩进球</span></div></div><div className="session-coach"><div className="coach-face">⚽</div><div><strong>{feedback==='goal'?'太棒了，球进啦！':'教练的小提醒'}</strong><p>{lesson.ime?'先看清汉字和拼音，再从候选词里选正确的字。':lesson.kind==='pinyin'?'先听读音，再用对应的手指打出拼音。':'可以看键盘，也可以慢慢按。重要的是，让每根手指做好自己的工作。'}</p></div></div><button className="text-link help-link" onClick={()=>setShowHelp(true)}><Lightbulb size={16}/> 不知道手怎么放？</button></aside></div>{paused&&<div className="modal-backdrop"><div className="pause-modal"><div className="modal-emoji">🥤</div><h2>中场休息一下</h2><p>放松双手，准备好了再继续。</p><button className="primary" onClick={togglePause}><Play size={17}/> 继续训练</button><button className="text-link" onClick={()=>navigate('train')}>返回课程</button></div></div>}</>}
  {view==='session'&&result&&<div className="result-page"><div className="confetti">{Array.from({length:22},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,background:['#85c9a6','#f4ca64','#a9c7ee','#e9aba4'][i%4],animationDelay:`${i*.07}s`,transform:`rotate(${i*43}deg)`}}/>)}</div><span className="result-trophy">🏆</span><div className="eyebrow">GREAT JOB, LITTLE CHAMPION!</div><h1>{result.correct>0?'这一次，你又进步了一点！':'第一次尝试，也是一种开始。'}</h1><p>完成了「{lesson.title}」，为认真练习的自己鼓掌。</p><div className="result-stars"><Star fill="currentColor"/><Star fill="currentColor"/>{result.accuracy>=90?<Star fill="currentColor"/>:<Star/>}</div><div className="result-stats"><div><strong>{result.accuracy}%</strong><span>准确率</span></div><div><strong>{result.correct}</strong><span>正确击键</span></div><div>{lesson.timed?<><strong>{result.cpm}</strong><span>每分钟正确击键</span></>:lesson.kind==='game'?<><strong>{goals}</strong><span>进球数</span></>:<><strong>{result.seconds}s</strong><span>练习时长</span></>}</div><div><strong>+{result.points}</strong><span>成长星星</span></div></div><div className="result-reward"><span>🌍</span><div><b>已开放 {stamps} 个目的地 · 已收藏 {progress.players?.length||0} 位球员</b><p>星星可用于兑换球员，自由选择你的下一位队友。</p></div><button className="text-link" onClick={()=>navigate('world')}>去收藏 <ArrowUpRight size={16}/></button></div><div className="result-buttons">{followingLesson&&<button className="primary" onClick={()=>begin(followingLesson)}>下一课：{followingLesson.focusKey?.toUpperCase()||followingLesson.title} <ChevronRight size={16}/></button>}<button className="secondary" onClick={()=>begin(lesson)}><RotateCcw size={16}/> 再练一次</button><button className="secondary" onClick={()=>navigate('train')}>返回课程 <ChevronRight size={18}/></button></div><p className="muted">{result.accuracy>=90?'保持正确指法，下次可以试试少看几次键盘。':'慢一点没关系，先把容易按错的键练熟。'}</p></div>}
  {view==='world'&&<><PageTitle eyebrow="A FOOTBALL PASSPORT" title="小小足球，带你认识大世界。" subtitle="先用练习点亮地图，再用星星兑换喜欢的球员。兑换不影响累计成长进度。"/><div className="world-layout"><section className="map-card"><div className="section-heading"><h2><Globe2 size={20}/> 世界足球地图</h2><span className="soft-label">已开放 {stamps} / {COUNTRIES.length} 个目的地</span></div><div className="world-map"><svg viewBox="0 0 1000 520" role="img" aria-label="世界足球目的地地图"><defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d9e5dc"/></pattern></defs><rect width="1000" height="520" fill="url(#dots)"/>{mapPaths.map((d,i)=><path key={i} d={d} fill="#dfece3" stroke="#fff" strokeWidth=".5"/>)}{COUNTRIES.map((c,i)=>{const x=(c.lon+180)/360*1000,y=(90-c.lat)/180*520;const dx=c.id==='fr'?24:c.id==='es'?-36:c.id==='pt'?-65:0,dy=c.id==='fr'?-18:c.id==='es'?24:c.id==='pt'?-22:0;return <g key={c.id} className="map-marker" transform={`translate(${x+dx},${y+dy})`} onClick={()=>setSelectedCountry(i)} tabIndex={0} role="button" aria-label={`查看${c.name}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedCountry(i);}}}><line x1={-dx} y1={-dy} x2="0" y2="0" stroke="#9bbba1" strokeWidth="2"/><circle r={selectedCountry===i?24:17} fill={selectedCountry===i?'#1e9567':'white'} stroke="#1e9567" strokeWidth="2"/><text textAnchor="middle" y="7" fontSize="23">{destinationOpen(progress,c.id)?c.flag:'🔒'}</text><text textAnchor="middle" y={38} fontSize="13" fontWeight="700" fill="#315c46">{c.name}</text></g>})}<text x="190" y="145" className="continent-label">北美洲</text><text x="330" y="370" className="continent-label">南美洲</text><text x="510" y="185" className="continent-label">欧洲</text><text x="535" y="300" className="continent-label">非洲</text><text x="735" y="170" className="continent-label">亚洲</text><text x="850" y="400" className="continent-label">大洋洲</text></svg></div><div className="map-footnote">点击国旗探索 · 地图用于认识大洲与国家的大致位置</div><div className="country-picker">{COUNTRIES.map((c,i)=><button className={selectedCountry===i?'active':''} key={c.id} onClick={()=>setSelectedCountry(i)}><span>{c.flag}</span>{c.name}{destinationOpen(progress,c.id)&&<CheckCircle2 size={13}/>}</button>)}</div></section><section className="country-card" key={country.id}><div className="country-top" style={{background:`${country.color}18`}}><span className="country-continent"><Globe2 size={14}/> {country.continent}</span><Shirt color={country.color} accent={country.accent} number={country.number}/><span className="country-flag">{country.flag}</span></div><div className="country-body"><span className="eyebrow">{country.en.toUpperCase()}</span><h2>{country.name}</h2><p>{destinationOpen(progress,country.id)?'目的地已开放，可以兑换这里的球员。':`完成 ${DESTINATIONS.find(d=>d.id===country.id)?.lessons} 节不同训练后开放。`}</p><p>{country.fact}</p><div className="player-fact"><strong>{country.player}</strong><small>{country.role}</small><p>{country.playerFact}</p></div><a href={country.source} target="_blank" rel="noreferrer" className="source-link">查看资料来源 <ArrowUpRight size={12}/></a><button className="secondary full" onClick={()=>document.getElementById('player-collection')?.scrollIntoView({behavior:'smooth'})}><Star size={16}/> 查看球员与兑换条件</button></div></section></div><div className="section-heading spaced"><h2>地图解锁进度</h2><span className="muted">已完成 {completedCount} 节不同训练</span></div><div className="stamp-row">{COUNTRIES.map((c,i)=><button key={c.id} className={`stamp ${destinationOpen(progress,c.id)?'earned':''}`} onClick={()=>setSelectedCountry(i)}><span>{destinationOpen(progress,c.id)?c.flag:<LockKeyhole size={27}/>}</span><strong>{c.name}</strong><small>{destinationOpen(progress,c.id)?'已开放':`完成 ${DESTINATIONS.find(d=>d.id===c.id)?.lessons} 节不同训练`}</small></button>)}</div><PlayerCollection progress={progress} onClaim={(id,route)=>{const previous=readProgress(profile)||progress;const next=redeemPlayer(previous,id,route);if(next!==previous){const saved=saveProgress(profile,next);setSaveError(!saved);if(saved)setProgress(next);return saved;}return false;}} onTrain={()=>begin(getLesson('test-final'))}/>
</>}
  {view==='stats' &&<><PageTitle eyebrow="YOUR OWN PERSONAL BEST" title="每一小步，都在这里留下脚印。" subtitle="只和昨天的自己比。先看准确率，再看速度。"/><div className="stats-overview"><StatCard icon={<Medal/>} value={progress.completed.length} label="已练习课程" color="green"/><StatCard icon={<Star/>} value={progress.points} label="成长星星" color="orange"/><StatCard icon={<Clock3/>} value={`${Math.round(progress.records.reduce((a,r)=>a+r.seconds,0)/60)}`} label="累计练习分钟" color="blue"/><StatCard icon={<Globe2/>} value={stamps} label="国家贴纸" color="purple"/></div>{progress.records.length?<><section className="chart-card"><div className="section-heading"><h2>我的准确率在成长</h2><span className="soft-label">最近 10 次练习</span></div><div className="accuracy-chart"><div className="chart-axis">100%<span>50%</span><span>0%</span></div>{progress.records.slice(0,10).reverse().map((r,i)=><div className="chart-column" key={`${r.date}-${i}`}><strong>{r.accuracy}%</strong><div style={{height:`${Math.max(2,r.accuracy*1.6)}px`}}/><small>第 {i+1} 次</small></div>)}</div></section><section className="history-card"><h2>训练记录</h2><div className="table-scroll"><table><thead><tr><th>训练内容</th><th>准确率</th><th>正确击键 / 分钟</th><th>用时</th><th>日期</th></tr></thead><tbody>{progress.records.slice(0,12).map((r,i)=><tr key={`${r.date}-${i}`}><td><CheckCircle2 size={17}/>{r.title}</td><td><span className="accuracy-pill">{r.accuracy}%</span></td><td>{r.cpm}</td><td>{r.seconds} 秒</td><td>{new Date(r.date).toLocaleDateString('zh-CN')}</td></tr>)}</tbody></table></div></section></>:<div className="empty-state"><div>🌱</div><h2>成长记录，等你写下第一笔</h2><p>完成一节训练后，准确率、用时和进步曲线就会出现在这里。</p><button className="primary" onClick={()=>begin(getLesson('letter-a'))}>从 A 开始 <ChevronRight size={17}/></button></div>}<ProgressBackup progress={progress} onImported={next=>{setProgress(next);setSaveError(false);}}/><p className="data-note">当前显示「小球员」的独立记录。记录保存在当前浏览器中，清除浏览器数据会同时清除档案。</p></>}
  </main><footer className="page-footer"><span>Kick & Keys <i>·</i> 快乐击键，踢向世界。</span><span>每个小球员，都有自己的节奏 ⚽</span></footer></div>
  {showHelp&&<div className="modal-backdrop" onClick={()=>setShowHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-label="指法入门说明" onClick={e=>e.stopPropagation()}><button className="close-modal icon-button" onClick={()=>setShowHelp(false)} aria-label="关闭说明"><X size={22}/></button><span className="modal-emoji">👐</span><h2>先让手指找到自己的家</h2><p>左手：小指 A、无名指 S、中指 D、食指 F。<br/>右手：食指 J、中指 K、无名指 L、小指 ;。</p><Hands finger={3}/><ol><li>摸摸 F 和 J 上的小凸点，把两个食指放好。</li><li>开始可以看键盘，用亮起的手指按对应的键。</li><li>手指向外伸去按键，按完再回家，双手放松。</li><li>先练 5–10 分钟；熟悉后，逐渐减少看键盘。</li></ol><div className="coach-tip"><Heart size={19}/><span>请家长开始时陪着看看：网页能提示手指，但不能判断孩子实际用了哪根手指。</span></div><button className="primary full" onClick={()=>setShowHelp(false)}>我知道啦，准备上场！</button></section></div>}
 </div>
}
function PageTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <div className="page-title"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>}
function StatCard({icon,value,label,color}:{icon:React.ReactNode;value:string|number;label:string;color:string}){return <div className="stat-card"><span className={`stat-symbol ${color}`}>{icon}</span><strong>{value}</strong><p>{label}</p></div>}

function StarterCourse({kind,completed,nextId,onBegin}:{kind:'alphabet'|'numbers';completed:string[];nextId:string;onBegin:(lesson:Lesson)=>void}){
 const letters=kind==='alphabet';
 const lessons=letters?LETTER_LESSONS:NUMBER_LESSONS;
 const done=lessons.filter(l=>completed.includes(l.id)).length;
 const review=getLesson(letters?'letters-review':'numbers-review');
 return <section className={`starter-course ${letters?'letter-course':'number-course'}`}>
  <div className="starter-banner"><div className="starter-emblem" aria-hidden="true">{letters?<><b>A</b><span>a</span></>:<Shirt color="#7ba9ec" accent="#fff" number="10"/>}</div><div className="starter-intro"><span className="eyebrow">{letters?'FIRST TOUCH · 字母起跑线':'NEXT MATCH · 数字训练营'}</span><h2>{letters?'26 个字母，一个一个认识。':'10 个数字，组成你的小球队。'}</h2><p>{letters?'屏幕小写 a ↔ 键盘大写 A · 每课只加入一个新字母':'按键盘最上面一排的数字 · 每课只加入一个新数字'}</p><div className="starter-progress" role="progressbar" aria-label={letters?'字母课程进度':'数字课程进度'} aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={done}><i style={{width:`${done/lessons.length*100}%`}}/></div></div><div className="starter-tally"><strong>{done}<small> / {lessons.length}</small></strong><span>个键已练习</span></div></div>
  <div className="key-lesson-grid">{lessons.map(l=>{const key=l.focusKey!;const done=completed.includes(l.id);const next=l.id===nextId;const finger=keyFinger(key);return <button key={l.id} className={`key-lesson ${done?'done':''} ${next?'next':''}`} style={{'--key-color':FINGER_COLORS[finger]} as CSSProperties} onClick={()=>onBegin(l)} aria-label={l.title}>
   <span className="key-lesson-status">{done?<><CheckCircle2 size={13}/> 已练习</>:next?'从这里继续':'等你上场'}</span><span className="key-lesson-letter"><b>{key.toUpperCase()}</b>{letters&&<small>{key}</small>}</span><span className="key-lesson-finger">{FINGER_NAMES[finger]}</span><span className="key-lesson-action">{done?'再练一次':'开始练习'} <ChevronRight size={13}/></span>
  </button>})}</div>
  <button className="starter-review" onClick={()=>onBegin(review)}><span className="review-ball"><Ball/></span><span><strong>{review.title}</strong><small>{review.desc}</small></span><span className="review-action">{completed.includes(review.id)?'再来一场':'综合复习'} <ChevronRight size={17}/></span></button>
  <p className="starter-note">每课约 1–2 分钟 · 可以看键盘 · 按对再前进 · 学熟后试试隐藏提示</p>
 </section>;
}

function LockedCourse({title,onReturn}:{title:string;onReturn:()=>void}){
 return <section className="locked-course" aria-labelledby="locked-title">
  <div className="locked-course-art" aria-hidden="true"><span className="lock-spark spark-left">✦</span><div className="lock-shield"><LockKeyhole size={48} strokeWidth={1.7}/></div><span className="lock-spark spark-right">✦</span></div>
  <span className="locked-status"><LockKeyhole size={12}/> 训练场已锁定</span><h2 id="locked-title">{title}，还没开场哦</h2>
  <p>这个训练场暂未开放。<br/>先在字母、数字和指法训练场里，把小手指练得更熟吧！</p>
  <div className="open-course-chips"><span>🔤 字母 A–Z</span><span>🔢 数字 0–9</span><span>⌨️ 指法巩固</span></div>
  <button className="primary" onClick={onReturn}>去练字母 <ChevronRight size={17}/></button><small>练习记录和已获得的星星都会保留</small>
 </section>;
}
