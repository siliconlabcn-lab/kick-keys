export type Task = { input:string; label?:string; tone?:string; phase?:string };
export type Lesson = { id:string; title:string; tag:string; desc:string; kind:'alphabet'|'numbers'|'basic'|'pinyin'|'english'|'symbols'|'game'|'test'; tasks:Task[]; color:string; minutes:string; timed?:number; focusKey?:string };
const simple=(s:string):Task[]=>s.split(' ').map(input=>({input}));
const EXISTING_LESSONS:Lesson[]=[
{id:'home-fj',title:'找到你的主场',tag:'第 01 课 · F / J',desc:'认识两个小凸点，让左右食指找到家。',kind:'basic',tasks:simple('f j f j ff jj fj jf'),color:'green',minutes:'约 2 分钟'},
{id:'home-dk',title:'中指来助攻',tag:'第 02 课 · D / K',desc:'加入两位新队友，手指按完记得回家。',kind:'basic',tasks:simple('d k d k fd jk df kj fk jd'),color:'green',minutes:'约 3 分钟'},
{id:'home-sl',title:'无名指登场',tag:'第 03 课 · S / L',desc:'用固定的手指，完成左右两边的传球。',kind:'basic',tasks:simple('s l s l ds kl fs jl sd lk'),color:'green',minutes:'约 3 分钟'},
{id:'home-as',title:'主场小队集合',tag:'第 04 课 · A / ;',desc:'小指加入！一起熟悉八个基准键。',kind:'basic',tasks:simple('a ; a ; as l; asdf jkl; fj dk sl a;'),color:'green',minutes:'约 4 分钟'},
{id:'upper',title:'向前场出发',tag:'第 05 课 · 上排键',desc:'从基准键向上伸手，再回到原来的位置。',kind:'basic',tasks:simple('r u e i t y w o q p frf juj ded kik'),color:'green',minutes:'约 4 分钟'},
{id:'lower',title:'后场好搭档',tag:'第 06 课 · 下排键',desc:'认识下排字母，也认识它们负责的手指。',kind:'basic',tasks:simple('v m c n b x z fvf jmj dcd jnj fbf'),color:'green',minutes:'约 4 分钟'},
{id:'pinyin-one',title:'你好，小球员',tag:'拼音入门 · 单字',desc:'听一听，看拼音，用正确的手指打出来。',kind:'pinyin',tasks:[{input:'ma',label:'妈',tone:'mā'},{input:'ba',label:'爸',tone:'bà'},{input:'ni',label:'你',tone:'nǐ'},{input:'hao',label:'好',tone:'hǎo'},{input:'wo',label:'我',tone:'wǒ'},{input:'da',label:'大',tone:'dà'}],color:'orange',minutes:'约 3 分钟'},
{id:'pinyin-ball',title:'我的第一脚射门',tag:'拼音进阶 · 足球词语',desc:'把熟悉的足球词语，变成一次次漂亮传球。',kind:'pinyin',tasks:[{input:'zuqiu',label:'足球',tone:'zú qiú'},{input:'qiumen',label:'球门',tone:'qiú mén'},{input:'chuanqiu',label:'传球',tone:'chuán qiú'},{input:'shemen',label:'射门',tone:'shè mén'},{input:'duiyou',label:'队友',tone:'duì yǒu'}],color:'orange',minutes:'约 4 分钟'},
{id:'pinyin-china',title:'为中国队加油',tag:'拼音小故事 · 中国足球',desc:'从“中国”和“加油”开始，为队伍送上鼓励。',kind:'pinyin',tasks:[{input:'zhongguo',label:'中国',tone:'zhōng guó'},{input:'jiayou',label:'加油',tone:'jiā yóu'},{input:'nuzu',label:'女足',tone:'nǚ zú'},{input:'tuanjie',label:'团结',tone:'tuán jié'},{input:'jianchi',label:'坚持',tone:'jiān chí'}],color:'orange',minutes:'约 4 分钟'},
{id:'english-ball',title:'Hello, football!',tag:'英语选修 · 单词',desc:'认识 ball、goal、team，英语学习慢慢来。',kind:'english',tasks:[{input:'ball',label:'球'},{input:'goal',label:'球门 / 进球'},{input:'team',label:'队伍'},{input:'pass',label:'传球'},{input:'win',label:'获胜'}],color:'blue',minutes:'约 3 分钟'},
{id:'english-sentence',title:'We are a team.',tag:'英语选修 · 短句',desc:'先听意思，再一起打出简单的足球短句。',kind:'english',tasks:[{input:'a ball',label:'一个球'},{input:'my team',label:'我的球队'},{input:'we can win',label:'我们能赢'},{input:'we are a team',label:'我们是一个团队'}],color:'blue',minutes:'约 4 分钟'},
{id:'symbols',title:'球衣号码与记分牌',tag:'基础加练 · 数字与符号',desc:'认识数字、空格和标点，练习用退格键修正。',kind:'symbols',tasks:simple('1 2 3 4 5 6 7 8 9 0 10 11 1-0 2:1 ! ?'),color:'purple',minutes:'约 3 分钟'},
{id:'test',title:'60 秒成长测试',tag:'看看自己的进步',desc:'不和别人比，记录自己的准确率和按键速度。',kind:'test',tasks:simple('f j d k fj dk jf kd ff jj dd kk fdkj jkdf'),color:'blue',minutes:'60 秒',timed:60},
{id:'game',title:'点球小英雄',tag:'足球小游戏 · F / J',desc:'按对一次向前传球，每四次正确击键射门得分！',kind:'game',tasks:simple('f j fj jf ff jj fj jf fjfj jfjf'),color:'orange',minutes:'自由挑战'}
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
export const LEARNING_PATH=[...STARTER_LESSONS,...EXISTING_LESSONS.filter(l=>l.kind==='basic'),...EXISTING_LESSONS.filter(l=>l.kind==='pinyin')];
// These areas are temporarily closed, independent of earned stars or past completions.
export const LOCKED_COURSES:Partial<Record<Lesson['kind'],string>>={pinyin:'拼音训练',english:'英语选修',symbols:'符号加练',test:'成长测试',game:'足球游戏'};
export function isCourseLocked(kind:string):boolean{return Object.prototype.hasOwnProperty.call(LOCKED_COURSES,kind);}
const openLearningPath=LEARNING_PATH.filter(l=>!isCourseLocked(l.kind));
export function nextAvailableLessonAfter(id:string):Lesson|undefined{
 const index=openLearningPath.findIndex(l=>l.id===id);
 return index>=0?openLearningPath[index+1]:undefined;
}
export function getLesson(id:string):Lesson{
 const lesson=LESSONS.find(l=>l.id===id);
 if(!lesson)throw new Error(`Unknown lesson: ${id}`);
 return lesson;
}
export function nextLessonFor(completed:string[]):Lesson{
 return openLearningPath.find(l=>!completed.includes(l.id))||getLesson('letters-review');
}
