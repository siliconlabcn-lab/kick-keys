import { CHINESE_STARTERS, CHINESE_WRITING, ENGLISH_STARTERS, LANGUAGE_STAGES } from './language-lessons.ts';
import type { LanguageStage } from './language-lessons.ts';

export type Task = { input:string; label?:string; tone?:string; word?:string; speech?:string; phase?:string };
export type Lesson = { id:string; title:string; tag:string; desc:string; kind:'alphabet'|'numbers'|'basic'|'pinyin'|'english'|'symbols'|'game'|'test'; tasks:Task[]; color:string; minutes:string; timed?:number; focusKey?:string; stage?:LanguageStage; ime?:boolean };
const simple=(s:string):Task[]=>s.split(' ').map(input=>({input}));
export const PUNCTUATION_KEYS = ['`', '-', '=', '[', ']', '\\', ';', "'", ',', '.', '/'];
export const SHIFTED_KEYS: Record<string, string> = {
 '!':'1', '@':'2', '#':'3', '$':'4', '%':'5', '^':'6', '&':'7', '*':'8', '(':'9', ')':'0',
 '~':'`', '_':'-', '+':'=', '{':'[', '}':']', '|':'\\', ':':';', '"':"'", '<':',', '>':'.', '?':'/',
};
const lines=(inputs:string[]):Task[]=>inputs.map(input=>({input}));
const syllables=(entries:[string,string,string,string][]):Task[]=>
 entries.map(([input,label,tone,word])=>({input,label,tone,word}));
const english=(entries:[string,string][]):Task[]=>
 entries.map(([input,label])=>({input,label}));

const warmupTest=[
 'fj7, dk4. sl8?', 'a1; j2. f3,', 'q4, p5; z6.', 'm7. v8, c9;', 'r0; t1. y2,',
 'a4, s3. d2;', 'f7; g8, h9.', 'j0. k1; l2,', 'w3, e4. r5;', 'u6; i7, o8.',
 'b9. n0; m1,', 'z2, x3. c4;', 'go 6-2.', 'pass 7!', 'team 9?',
];
const matchTest=[
 'team 7: pass left.', 'score 2-1!', 'who has ball 4?', 'player 9, run!', 'try pass #8.',
 'kick at 3:15.', 'blue 2, green 0.', 'goal 6, great shot!', 'run to gate 5.', 'round 4: shoot!',
 'left 1, right 2.', 'kick 8? pass 9!', 'team 5 needs 1 goal.', 'pass to player 7.', 'score: 3-3.',
 'a pass for #10.', 'ready in 5, 4, 3!', 'stop at line 6.', 'next: round 9.', 'match 2 is done.',
];
const finalTest=[
 'green 12, blue 10; next goal wins!', 'pass to #8, then run to gate 3.', 'can team 4 score in 15 seconds?',
 'the score is (2-1). keep playing!', 'round [7]: pass, turn, shoot!', 'we won 3-2; shake hands!',
 'players #6 and #9, switch sides.', 'at 4:30, meet by goal 2.', 'scoreboard: home 5, away 4.',
 'we need 2 passes + 1 good shot!', 'plan a: pass left; plan b: shoot.', 'who saved the shot from #11?',
 'team (blue) has 3 points today.', 'watch #5, then pass to #12.', 'halftime: water, rest, and talk.',
 'pass 1 was good; pass 2 was better.', 'final score: 4-3. good game!', 'we have 10 seconds, stay calm!',
 'go left? yes, use lane #2.', 'shot 6 hits the post. try again!', 'warm up at 2:05, start at 2:15.',
 'press 7, then !, then pass right.', 'round 8: go [left], then right.', 'score 0-0? keep helping your team!',
];

const EXISTING_LESSONS:Lesson[]=[
 ...CHINESE_STARTERS, ...CHINESE_WRITING, ...ENGLISH_STARTERS,
{id:'home-fj',title:'找到你的主场',tag:'第 01 课 · 基准键与数字',desc:'用 F、J 找到基准键，再在数字和常用标点之间来回切换。',kind:'basic',tasks:simple('f j f4. j7, fj47; jf74. f5,j6. j8;f9. fj04, jf17.'),color:'green',minutes:'约 3 分钟'},
{id:'home-dk',title:'中指来助攻',tag:'第 02 课 · 跨排换指',desc:'让中指练习从基准键伸向数字和字母，再配合其他手指打出标点。',kind:'basic',tasks:simple('d3. k8, dk38; kd83. de3,ki8. dc3;ik8. d3k8, k8d3. dek38; kic83.'),color:'green',minutes:'约 3 分钟'},
{id:'home-sl',title:'无名指登场',tag:'第 03 课 · 两手交替',desc:'把 S、L 和附近的字母、数字、标点串起来，练左右手轮流出脚。',kind:'basic',tasks:simple('s2. l9, sl29; ls92. sw2,lo9. sx2;lo9. s2l9. l9s2, sw29; lo92.'),color:'green',minutes:'约 3 分钟'},
{id:'home-as',title:'主场小队集合',tag:'第 04 课 · 八个基准键与混合键位',desc:'复习 A 和分号，再把八个基准键与数字、标点串起来。',kind:'basic',tasks:simple('a ; a ; a1; l9, as2; jk7. asdf4, jkl;7. fj47. dk38, sl29; a0?'),color:'green',minutes:'约 3 分钟'},
{id:'upper',title:'向前场出发',tag:'第 05 课 · 上排字母与 Shift',desc:'练上排字母和数字，用问号、冒号、感叹号练两手配合。',kind:'basic',tasks:simple('q1! w2? e3: r4, t5. y6! u7? i8: o9, p0. qr14! ty56? ui78: op90.'),color:'green',minutes:'约 3 分钟'},
{id:'lower',title:'后场好搭档',tag:'第 06 课 · 全键区混练',desc:'穿插上排数字、下排字母和普通或 Shift 标点，像打一小段赛场记录。',kind:'basic',tasks:simple('z1! x2? c3: v4, b5. n6; m7. zx12? cv34, bn56: m7/8. pass#9, goal(0)!'),color:'green',minutes:'约 3 分钟'},
{
 id:'pinyin-foundations',title:'拼音基础 · 听音打字',tag:'拼音入门 · 单字和词语',
 desc:'先听读音，再打出不带声调的拼音。每题出现时读一次，也可以点小喇叭重听。',
 kind:'pinyin',stage:'sounds',color:'orange',minutes:'约 3 分钟',
 tasks:[
  {input:'xie',label:'写',tone:'xiě',word:'写字'},
  {input:'tou',label:'头',tone:'tóu',word:'抬头'},
  {input:'shou',label:'手',tone:'shǒu',word:'拍手'},
  {input:'qiu',label:'球',tone:'qiú',word:'足球'},
  {input:'men',label:'门',tone:'mén',word:'球门'},
  {input:'pao',label:'跑',tone:'pǎo',word:'跑步'},
  {input:'tiao',label:'跳',tone:'tiào',word:'跳绳'},
  {input:'xiao',label:'笑',tone:'xiào',word:'微笑'},
  {input:'tie',label:'贴',tone:'tiē',word:'贴纸'},
  {input:'tui',label:'腿',tone:'tuǐ',word:'小腿'},
  {input:'dian',label:'点',tone:'diǎn',word:'点球'},
  {input:'chuan',label:'传',tone:'chuán',word:'传球'},
  {input:'tuan',label:'团',tone:'tuán',word:'团结'},
  {input:'shan',label:'山',tone:'shān',word:'大山'},
  {input:'xing',label:'星',tone:'xīng',word:'星星'},
  {input:'peng',label:'朋',tone:'péng',word:'朋友'},
  {input:'shuo',label:'说',tone:'shuō',word:'说话'},
  {input:'xue',label:'学',tone:'xué',word:'学习'},

 ],
},
{
 id:'pinyin-one',title:'你好，小球员',tag:'拼音复习 · 日常音节',
 desc:'练习常见称呼和动作，先听当前音节，再打出不带声调的拼音。',
 kind:'pinyin',stage:'sounds',color:'orange',minutes:'约 4 分钟',
 tasks:syllables([
  ['ma','妈','mā','妈妈'], ['ba','爸','bà','爸爸'], ['ni','你','nǐ','你好'],
  ['hao','好','hǎo','好朋友'], ['wo','我','wǒ','我们'], ['da','大','dà','大小'],
  ['ta','他','tā','他们'], ['lai','来','lái','过来'], ['qu','去','qù','回去'],
  ['hui','回','huí','回家'], ['kan','看','kàn','看书'], ['ting','听','tīng','听课'],
  ['du','读','dú','读书'], ['wen','问','wèn','提问'], ['da','答','dá','回答'],
  ['zao','早','zǎo','早上'], ['wan','晚','wǎn','晚上'], ['xiao','小','xiǎo','小朋友'],
 ]),
},
{
 id:'pinyin-vowels',title:'韵母换一换',tag:'拼音基础 · ie / iao、ou / ui / iu',
 desc:'把容易混淆的韵母放在一起听。比较写和小、头和腿，再看拼音打出来。',
 kind:'pinyin',stage:'sounds',color:'orange',minutes:'约 4 分钟',
 tasks:syllables([
  ['xie','写','xiě','写字'], ['xiao','小','xiǎo','大小'], ['tie','贴','tiē','贴纸'],
  ['tiao','条','tiáo','线条'], ['tou','头','tóu','点头'], ['tui','腿','tuǐ','小腿'],
  ['gou','狗','gǒu','小狗'], ['gui','龟','guī','乌龟'], ['liu','六','liù','六个'],
  ['lou','楼','lóu','楼梯'], ['jiu','九','jiǔ','九月'], ['ji','鸡','jī','小鸡'],
 ]),
},
{
 id:'pinyin-initials',title:'听清平舌和翘舌',tag:'拼音辨音 · z / zh、c / ch、s / sh',
 desc:'两两比较字音，听清开头的声母，再把汉字和例词一起记住。',
 kind:'pinyin',stage:'sounds',color:'orange',minutes:'约 4 分钟',
 tasks:syllables([
  ['zu','足','zú','足球'], ['zhu','竹','zhú','竹子'], ['zao','早','zǎo','早上'],
  ['zhao','找','zhǎo','找到'], ['cai','猜','cāi','猜谜'], ['chai','拆','chāi','拆开'],
  ['cu','粗','cū','粗细'], ['chu','出','chū','出门'], ['san','三','sān','三个'],
  ['shan','山','shān','大山'], ['si','四','sì','四月'], ['shi','试','shì','试试'],
 ]),
},
{
 id:'pinyin-nasals',title:'听清前鼻音和后鼻音',tag:'拼音辨音 · an / ang、en / eng、in / ing',
 desc:'对照班和帮、盆和棚、心和星，把容易漏掉的 g 听清楚。',
 kind:'pinyin',stage:'sounds',color:'orange',minutes:'约 4 分钟',
 tasks:syllables([
  ['ban','班','bān','班级'], ['bang','帮','bāng','帮忙'], ['lan','蓝','lán','蓝色'],
  ['lang','狼','láng','大灰狼'], ['pen','盆','pén','脸盆'], ['peng','棚','péng','雨棚'],
  ['men','门','mén','开门'], ['meng','蒙','méng','蒙住'], ['xin','心','xīn','开心'],
  ['xing','星','xīng','星星'], ['jin','金','jīn','金色'], ['jing','京','jīng','北京'],
 ]),
},
{id:'pinyin-ball',title:'我的第一脚射门',tag:'拼音进阶 · 足球词语',desc:'把熟悉的足球词语，变成一次次漂亮传球。',kind:'pinyin',stage:'words',ime:true,tasks:[{input:'足球',tone:'zú qiú'},{input:'球门',tone:'qiú mén'},{input:'传球',tone:'chuán qiú'},{input:'射门',tone:'shè mén'},{input:'队友',tone:'duì yǒu'},{input:'跑动',tone:'pǎo dòng'},{input:'接球',tone:'jiē qiú'},{input:'停球',tone:'tíng qiú'},{input:'回传',tone:'huí chuán'},{input:'左边',tone:'zuǒ biān'},{input:'右边',tone:'yòu biān'},{input:'球衣',tone:'qiú yī'},{input:'球鞋',tone:'qiú xié'},{input:'门将',tone:'mén jiàng'},{input:'守门员',tone:'shǒu mén yuán'},{input:'教练',tone:'jiào liàn'},{input:'队长',tone:'duì zhǎng'},{input:'裁判',tone:'cái pàn'},{input:'球场',tone:'qiú chǎng'},{input:'热身',tone:'rè shēn'}],color:'orange',minutes:'约 4 分钟'},
{id:'pinyin-china',title:'为中国队加油',tag:'拼音小故事 · 中国足球',desc:'从“中国”和“加油”开始，为队伍送上鼓励。',kind:'pinyin',stage:'words',ime:true,tasks:[{input:'中国',tone:'zhōng guó'},{input:'加油',tone:'jiā yóu'},{input:'女足',tone:'nǚ zú'},{input:'团结',tone:'tuán jié'},{input:'坚持',tone:'jiān chí'},{input:'训练',tone:'xùn liàn'},{input:'比赛',tone:'bǐ sài'},{input:'比分',tone:'bǐ fēn'},{input:'落后',tone:'luò hòu'},{input:'扳平',tone:'bān píng'},{input:'领先',tone:'lǐng xiān'},{input:'换人',tone:'huàn rén'},{input:'反击',tone:'fǎn jī'},{input:'半场',tone:'bàn chǎng'},{input:'决赛',tone:'jué sài'},{input:'奖杯',tone:'jiǎng bēi'},{input:'互助',tone:'hù zhù'},{input:'握手',tone:'wò shǒu'},{input:'友谊',tone:'yǒu yì'},{input:'中国队',tone:'zhōng guó duì'}],color:'orange',minutes:'约 4 分钟'},
{id:'english-ball',title:'Hello, football!',tag:'英语训练 · 单词',desc:'认识 ball、goal、team，英语学习慢慢来。',kind:'english',stage:'words',tasks:[{input:'ball',label:'球'},{input:'goal',label:'球门 / 进球'},{input:'team',label:'队伍'},{input:'pass',label:'传球'},{input:'win',label:'获胜'},{input:'match',label:'比赛'},{input:'score',label:'比分'},{input:'game',label:'游戏、比赛'},{input:'fan',label:'球迷'},{input:'cup',label:'奖杯'},{input:'club',label:'俱乐部'},{input:'point',label:'分数'},{input:'kickoff',label:'开球'},{input:'half',label:'半场'},{input:'draw',label:'平局'},{input:'save',label:'扑救'}],color:'blue',minutes:'约 3 分钟'},
{
 id:'english-field',title:'On the field',tag:'英语训练 · 球场动作',
 desc:'认一认跑、停、传球和射门，再练给队友的简短指令。',
 kind:'english',stage:'words',color:'blue',minutes:'约 3 分钟',
 tasks:english([
  ['run','跑'], ['stop','停'], ['kick','踢'], ['shoot','射门'], ['catch','接住'],
  ['pass left','向左传球'], ['run right','向右跑'], ['stop the ball','停球'],
  ['catch the ball','接住球'], ['shoot at the goal','朝球门射门'],
 ]),
},
{id:'english-sentence',title:'We are a team.',tag:'英语训练 · 短句',desc:'先听意思，再一起打出简单的足球短句。',kind:'english',stage:'sentences',tasks:[{input:'a ball',label:'一个球'},{input:'my team',label:'我的球队'},{input:'we can win',label:'我们能赢'},{input:'We are a team.',label:'我们是一个团队。'},{input:'This is my ball.',label:'这是我的球。'},{input:'I like football.',label:'我喜欢足球。'},{input:'My shirt is blue.',label:'我的球衣是蓝色的。'},{input:'The ball is on the line.',label:'球在线上。'},{input:'She can run fast.',label:'她跑得很快。'},{input:'He can kick well.',label:'他踢得很好。'},{input:'We play after school.',label:'我们放学后踢球。'},{input:'We help each other.',label:'我们互相帮助。'},{input:'Our coach is here.',label:'我们的教练来了。'}],color:'blue',minutes:'约 4 分钟'},
{
 id:'english-match',title:'Match day',tag:'英语训练 · 赛场对话',
 desc:'练习在场上问问题、给队友加油，顺便复习空格、问号和感叹号。',
 kind:'english',stage:'sentences',color:'blue',minutes:'约 4 分钟',
 tasks:english([
  ['Are you ready?','你准备好了吗？'], ['Yes, I am.','是的，我准备好了。'],
  ['Where is the ball?','球在哪里？'], ['Here it is.','在这里。'], ['Pass to me!','传给我！'],
  ['Nice pass!','传得好！'], ['What is the score?','比分是多少？'], ['It is 2-1.','现在是二比一。'],
  ['Let us try again.','我们再试一次吧。'], ['Good game, team!','大家踢得真棒！'],
 ]),
},
{id:'symbols',title:'标点首发',tag:'键盘标点 · 直接按键',desc:'找到逗号、句号、方括号等标点所在的键，直接按下。',kind:'symbols',tasks:PUNCTUATION_KEYS.map(input=>({input})),color:'purple',minutes:'约 2 分钟'},
{id:'symbols-shift',title:'Shift 双手配合',tag:'键盘标点 · 组合按键',desc:'一只手按住 Shift，另一只手按标点所在的键，例如 Shift + 1 打出 !。',kind:'symbols',tasks:Object.keys(SHIFTED_KEYS).map(input=>({input})),color:'purple',minutes:'约 3 分钟'},
{id:'symbols-mixed',title:'标点混合接力',tag:'键盘标点 · 混合练习',desc:'普通标点和 Shift 标点轮流上场。看清下一个符号，练习什么时候按住 Shift、什么时候松开。',kind:'symbols',tasks:simple(`,!. .?, ;:; /?/ -_- =+= [}{] (<,>) '"'. -#=+`),color:'purple',minutes:'约 3 分钟'},
{id:'test-warmup',title:'30 秒热身测试',tag:'成长测试 · 键位混合',desc:'从短键组热身，记录准确率和每分钟正确击键数。',kind:'test',tasks:lines(warmupTest),color:'green',minutes:'30 秒',timed:30},
{id:'test',title:'60 秒成长测试',tag:'成长测试 · 球场短句',desc:'在一分钟里打比分、球员号码和传球指令，和自己的同关成绩比较。',kind:'test',tasks:lines(matchTest),color:'blue',minutes:'60 秒',timed:60},
{id:'test-final',title:'90 秒全场挑战',tag:'成长测试 · 综合耐力',desc:'用更长的赛场短句练习稳定节奏，包含空格、数字和 Shift 标点。',kind:'test',tasks:lines(finalTest),color:'purple',minutes:'90 秒',timed:90},
{id:'game',title:'点球小英雄',tag:'足球游戏 · 基准键点球',desc:'每组四个键。连着完成助跑，最后一键射门。',kind:'game',tasks:simple('fjfj jfjf ffdj jjkf dfjk jkdf dksl sldk'),color:'green',minutes:'8 次射门'},
{id:'game-relay',title:'传球接力赛',tag:'足球游戏 · 分区传球',desc:'按球衣号把球传给队友，再打完口令完成射门。',kind:'game',tasks:lines(['pass 7','pass 9','left 4','right 2','back 3','wide 6','cross 8','run 11','shoot 5','goal 10']),color:'blue',minutes:'10 次射门'},
{id:'game-final',title:'杯赛决胜局',tag:'足球游戏 · 比分和口令',desc:'先过比分关，再打传球和射门口令。每完成一组就进一球。',kind:'game',tasks:lines(['0-0: start','1-0: pass','1-1: run','2-1: cross','2-2: again','3-2: defend','3-3: keep calm','pass to #7','shoot at 4:00','nice shot!','score 4-3','good game!']),color:'orange',minutes:'12 次射门'},
];

// New course IDs and the original IDs are stable so completed lessons survive updates.
function keyTasks(key:string,previous:string,earlier:string):Task[]{
 return [
  {input:key,phase:'① 找到新键'}, {input:key,phase:'① 找到新键'}, {input:key,phase:'① 找到新键'},
  {input:key+key,phase:'② 稳稳按两次'},
  {input:previous+key,phase:'③ 传球小复习'}, {input:key+previous,phase:'③ 传球小复习'},
  {input:earlier+key+previous,phase:'③ 传球小复习'},
 ];
}
const alphabet='abcdefghijklmnopqrstuvwxyz';
const digits='0123456789';
export const LETTER_LESSONS:Lesson[]=Array.from(alphabet,(key,i)=>({
 id:`letter-${key}`,title:`认识 ${key.toUpperCase()} 键`,tag:`字母第 ${String(i+1).padStart(2,'0')} 课 · ${key.toUpperCase()} / ${key}`,
 desc:`把屏幕上的 ${key} 和键盘上的 ${key.toUpperCase()} 对上，用对应的手指轻轻按下。`,
 kind:'alphabet',focusKey:key,tasks:keyTasks(key,alphabet[Math.max(0,i-1)],alphabet[Math.max(0,i-2)]),color:'green',minutes:'约 1–2 分钟',
}));
const letterReview:Lesson={id:'letters-review',title:'字母传球接力',tag:'A–Z · 综合复习',desc:'26 个字母都认识了！按小组传球，再练一次熟悉的位置。',kind:'alphabet',tasks:simple('abc def ghi jkl mno pqr stu vwx yz bad cab fed ice jam pen run sun win').map(t=>({...t,phase:'字母组合 · 跟着提示传球'})),color:'green',minutes:'约 3 分钟'};
export const NUMBER_LESSONS:Lesson[]=Array.from(digits,(key,i)=>({
 id:`number-${key}`,title:`认识数字 ${key}`,tag:`数字第 ${String(i+1).padStart(2,'0')} 课 · ${key}`,
 desc:`在键盘最上面一排找到 ${key}，伸出对应的手指，按完回到基准键。`,
 kind:'numbers',focusKey:key,tasks:keyTasks(key,digits[Math.max(0,i-1)],digits[Math.max(0,i-2)]),color:'blue',minutes:'约 1–2 分钟',
}));
const numberReview:Lesson={id:'numbers-review',title:'球衣号码集合',tag:'0–9 · 号码组合',desc:'把数字组成球衣号码，帮小队找到 7 号、10 号和 23 号队员。',kind:'numbers',tasks:simple('0 1 2 3 4 5 6 7 8 9 7 10 11 23 30 99 2026').map(t=>({...t,phase:'球衣号码 · 数字小挑战'})),color:'blue',minutes:'约 3 分钟'};
export const STARTER_LESSONS=[...LETTER_LESSONS,letterReview,...NUMBER_LESSONS,numberReview];
export const LESSONS=[...STARTER_LESSONS,...EXISTING_LESSONS];
export const LEARNING_PATH=[
 ...STARTER_LESSONS,
 ...EXISTING_LESSONS.filter(l=>l.kind==='symbols'||l.kind==='basic'),
 ...(['pinyin','english'] as const).flatMap(kind=>LANGUAGE_STAGES[kind].flatMap(stage=>
  EXISTING_LESSONS.filter(lesson=>lesson.kind===kind&&lesson.stage===stage.id))),
 ...EXISTING_LESSONS.filter(l=>l.kind==='test'||l.kind==='game'),
];
// These areas are temporarily closed, independent of earned stars or past completions.
export const LOCKED_COURSES:Partial<Record<Lesson['kind'],string>>={};
export function isCourseLocked(kind:string):boolean{return Object.prototype.hasOwnProperty.call(LOCKED_COURSES,kind);}
const openLearningPath=LEARNING_PATH.filter(l=>!isCourseLocked(l.kind));
export function nextAvailableLessonAfter(id:string,unlocked=false):Lesson|undefined{
 const path=unlocked?LEARNING_PATH:openLearningPath;
 const index=path.findIndex(l=>l.id===id);
 return index>=0?path[index+1]:undefined;
}
export function getLesson(id:string):Lesson{
 const lesson=LESSONS.find(l=>l.id===id);
 if(!lesson)throw new Error(`Unknown lesson: ${id}`);
 return lesson;
}
export function nextLessonFor(completed:string[],unlocked=false):Lesson{
 return (unlocked?LEARNING_PATH:openLearningPath).find(l=>!completed.includes(l.id))||getLesson('letters-review');
}
