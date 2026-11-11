import type { Lesson, Task } from './lessons';

export const LANGUAGE_STAGES = {
 pinyin: [
  {id:'sounds',title:'拼音第一课',desc:'先听单韵母，再认识声母、声调和拼读。'},
  {id:'characters',title:'单字',desc:'用拼音输入法打出汉字，练习选对候选字。'},
  {id:'words',title:'词语',desc:'从校园生活练到足球场上的双字词和三字词。'},
  {id:'sentences',title:'句子',desc:'把动作、人物和事情连成完整的句子。'},
  {id:'articles',title:'足球短文',desc:'跟着段落打完一篇足球故事。'},
 ],
 english: [
  {id:'letters',title:'字母',desc:'从 A 到 Z，认读大小写，练习字母和空格。'},
  {id:'words',title:'单词',desc:'从颜色、数字和动作练到球场词汇。'},
  {id:'sentences',title:'句子',desc:'练习短句、问答和赛场对话。'},
  {id:'articles',title:'足球短文',desc:'逐句读懂并打完一篇英文足球故事。'},
 ],
} as const;

export type LanguageStage = (typeof LANGUAGE_STAGES)[keyof typeof LANGUAGE_STAGES][number]['id'];

type LanguageKind = keyof typeof LANGUAGE_STAGES;
function course(kind:LanguageKind, stage:LanguageStage, id:string, title:string, desc:string, tasks:Task[]):Lesson {
 return {
  id,title,desc,kind,stage,tasks,
  tag:LANGUAGE_STAGES[kind].find(item=>item.id===stage)!.title,
  color:kind==='pinyin'?'orange':'blue',minutes:'约 4–8 分钟',
  ime:kind==='pinyin'&&stage!=='sounds',
 };
}

function soundPractice(entries:[string,string,string][], review:string):Task[] {
 const examples=entries.map(([input,label,speech])=>({input,label,speech}));
 return [
  ...examples.map(task=>({...task,phase:'① 听音认读'})),
  ...review.split(' ').map(input=>({...examples.find(task=>task.input===input)!,phase:'② 交替复习'})),
 ];
}

const chinese=(entries:[string,string,string?][]):Task[]=>
 entries.map(([input,tone,word])=>({input,tone,word}));

const english=(entries:[string,string][]):Task[]=>entries.map(([input,label])=>({input,label}));

function passage(entries:[string,string][][], translated=false):Task[] {
 return entries.flatMap((paragraph,index)=>paragraph.map(([input,guide])=>({
  input,phase:`第 ${index+1} / ${entries.length} 段`,
  ...(translated?{label:guide}:{tone:guide}),
 })));
}

export const CHINESE_STARTERS:Lesson[]=[
 course('pinyin','sounds','zh-vowels-a','单韵母第一课 · a、o、e','先听三个单韵母，看看口型，再按提示打出字母。',soundPractice([
  ['a','a · 张大嘴','啊。张大嘴，啊。'],
  ['o','o · 嘴唇拢圆','喔。嘴唇拢圆，喔。'],
  ['e','e · 嘴角展开','鹅。白鹅的鹅，去掉声调。'],
 ],'a o e a e o o a e e o a a o e o e a')),
 course('pinyin','sounds','zh-vowels-b','单韵母第二课 · i、u、ü','听清三个不同的口型。键盘上用 v 练习 ü。',soundPractice([
  ['i','i · 嘴角展开','衣。衣服的衣。'],
  ['u','u · 嘴唇收圆','乌。乌鸦的乌。'],
  ['v','ü · 圆唇发音，键盘按 V','迂。小鱼的鱼，去掉声调。'],
 ],'i u v i v u u i v v u i i u v u v i')),
 course('pinyin','sounds','zh-tones','声调练习 · 一声到四声','听出平、升、转、降。打字时输入屏幕下方的不带声调字母。',[
  ...Array.from({length:3},()=>[
   {input:'ma',label:'mā · 一声 · 妈',speech:'妈。第一声，平平地读。'},
   {input:'ma',label:'má · 二声 · 麻',speech:'麻。第二声，往上扬。'},
   {input:'ma',label:'mǎ · 三声 · 马',speech:'马。第三声，先降再升。'},
   {input:'ma',label:'mà · 四声 · 骂',speech:'骂。第四声，往下降。'},
   {input:'da',label:'dā · 搭',speech:'搭。搭积木。'},
   {input:'da',label:'dá · 答',speech:'答。回答。'},
   {input:'da',label:'dǎ · 打',speech:'打。打字。'},
   {input:'da',label:'dà · 大',speech:'大。大小。'},
  ]).flat(),
 ]),
 course('pinyin','sounds','zh-initials-a','声母第一组 · b、p、m、f、d、t、n、l','先找每个音节开头的声母，再练拼成完整音节。',[
  ...soundPractice([
   ['b','b · 八的开头','八。听开头的声音。'],['p','p · 怕的开头','怕。听开头的声音。'],
   ['m','m · 妈的开头','妈。听开头的声音。'],['f','f · 发的开头','发。听开头的声音。'],
   ['d','d · 大的开头','大。听开头的声音。'],['t','t · 塔的开头','塔。听开头的声音。'],
   ['n','n · 拿的开头','拿。听开头的声音。'],['l','l · 拉的开头','拉。听开头的声音。'],
  ],'b p m f d t n l p b t d l n f m'),
  ...['ba','pa','ma','fa','da','ta','na','la'].map(input=>({input,phase:'③ 声母和韵母拼读'})),
 ]),
 course('pinyin','sounds','zh-initials-b','声母第二组 · 从 g 到 w','认识其余声母，练习单键和 zh、ch、sh 双键。',soundPractice([
  ['g','g · 哥的开头','哥。'],['k','k · 科的开头','科。'],['h','h · 喝的开头','喝。'],
  ['j','j · 鸡的开头','鸡。'],['q','q · 七的开头','七。'],['x','x · 西的开头','西。'],
  ['z','z · 早的开头','早。'],['c','c · 草的开头','草。'],['s','s · 三的开头','三。'],
  ['zh','zh · 找的开头','找。'],['ch','ch · 炒的开头','炒。'],['sh','sh · 山的开头','山。'],
  ['r','r · 人的开头','人。'],['y','y · 鸭的开头','鸭。'],['w','w · 蛙的开头','蛙。'],
 ],'g k h j q x z zh c ch s sh r y w j x ch zh s sh')),
 course('pinyin','sounds','zh-blend','复韵母和鼻韵母 · 拼读接力','从复韵母和鼻韵母拼到完整音节，练 ai、ou、an、ang 等。',[
  ...soundPractice([
   ['ai','ai · 爱','爱。爱心。'],['ei','ei · 飞的韵母','飞。听后面的声音。'],
   ['ao','ao · 奥','奥。奥运。'],['ou','ou · 欧','欧。欧洲。'],
   ['an','an · 安','安。安全。'],['ang','ang · 昂','昂。昂首。'],
   ['en','en · 恩','恩。感恩。'],['eng','eng · 风的韵母','风。听后面的声音。'],
   ['in','in · 音的韵母','音。听后面的声音。'],['ing','ing · 英的韵母','英。听后面的声音。'],
  ],'ai ei ao ou an ang en eng in ing'),
  ...['bai','fei','pao','tou','ban','bang','men','peng','xin','xing','xie','xiao'].map(input=>({input,phase:'③ 拼成完整音节'})),
 ]),
];

export const CHINESE_WRITING:Lesson[]=[
 course('pinyin','characters','zh-characters-school','校园常用字','先拼出字音，再从候选栏选对汉字。',chinese([
  ['我','wǒ','我们'],['你','nǐ','你好'],['他','tā','他们'],['她','tā','她们'],
  ['学','xué','学习'],['生','shēng','学生'],['书','shū','书包'],['笔','bǐ','铅笔'],
  ['写','xiě','写字'],['读','dú','读书'],['看','kàn','看书'],['听','tīng','听课'],
  ['说','shuō','说话'],['问','wèn','提问'],['答','dá','回答'],['想','xiǎng','想办法'],
  ['好','hǎo','好朋友'],['来','lái','过来'],['去','qù','回去'],['回','huí','回家'],
 ])),
 course('pinyin','characters','zh-characters-field','球场常用字','练习球场里的人、动作和方向，留意同音字。',chinese([
  ['球','qiú','足球'],['门','mén','球门'],['队','duì','队友'],['跑','pǎo','跑步'],
  ['传','chuán','传球'],['接','jiē','接球'],['踢','tī','踢球'],['射','shè','射门'],
  ['停','tíng','停球'],['跳','tiào','跳高'],['手','shǒu','双手'],['头','tóu','抬头'],
  ['脚','jiǎo','左脚'],['左','zuǒ','左边'],['右','yòu','右边'],['前','qián','前方'],
  ['后','hòu','后面'],['快','kuài','加快'],['慢','màn','慢跑'],['赢','yíng','赢球'],
 ])),
 course('pinyin','words','zh-words-school','校园词语接力','把两个或三个音节连起来，试着一次选中完整词语。',chinese([
  ['早上','zǎo shang'],['上学','shàng xué'],['书包','shū bāo'],['铅笔','qiān bǐ'],
  ['写字','xiě zì'],['读书','dú shū'],['同学','tóng xué'],['老师','lǎo shī'],
  ['教室','jiào shì'],['操场','cāo chǎng'],['体育课','tǐ yù kè'],['休息','xiū xi'],
  ['游戏','yóu xì'],['拍手','pāi shǒu'],['抬头','tái tóu'],['小伙伴','xiǎo huǒ bàn'],
  ['一起','yì qǐ'],['认真','rèn zhēn'],['努力','nǔ lì'],['放学','fàng xué'],
 ])),
 course('pinyin','sentences','zh-sentences-school','从校园写到操场','练习完整句子和中文标点。可以分词输入，也可以用输入法整句选字。',chinese([
  ['早上好，今天见！','zǎo shang hǎo, jīn tiān jiàn!'],
  ['我把足球放进书包。','wǒ bǎ zú qiú fàng jìn shū bāo.'],
  ['下课了，我们一起去操场。','xià kè le, wǒ men yì qǐ qù cāo chǎng.'],
  ['你的球衣是什么颜色？','nǐ de qiú yī shì shén me yán sè?'],
  ['我穿着一件蓝色的球衣。','wǒ chuān zhe yí jiàn lán sè de qiú yī.'],
  ['先喝一口水，再去热身。','xiān hē yì kǒu shuǐ, zài qù rè shēn.'],
  ['老师，请问我们可以开球了吗？','lǎo shī, qǐng wèn wǒ men kě yǐ kāi qiú le ma?'],
  ['大家站好位置，比赛马上开始！','dà jiā zhàn hǎo wèi zhi, bǐ sài mǎ shàng kāi shǐ!'],
  ['哨声响了，球滚到了脚边。','shào shēng xiǎng le, qiú gǔn dào le jiǎo biān.'],
  ['今天玩得真开心，明天再见！','jīn tiān wán de zhēn kāi xīn, míng tiān zài jiàn!'],
 ])),
 course('pinyin','sentences','zh-sentences-match','场边口令与加油','练问句、命令和感叹句，记住队友之间怎么配合。',chinese([
  ['把球传给左边的队友。','bǎ qiú chuán gěi zuǒ biān de duì yǒu.'],
  ['我在右边，你看见我了吗？','wǒ zài yòu biān, nǐ kàn jiàn wǒ le ma?'],
  ['别急，先把球停下来。','bié jí, xiān bǎ qiú tíng xià lái.'],
  ['你传得真准，再来一次！','nǐ chuán de zhēn zhǔn, zài lái yí cì!'],
  ['门将抱住了球，大家回到自己的位置。','mén jiàng bào zhù le qiú, dà jiā huí dào zì jǐ de wèi zhi.'],
  ['我们现在是几比几？','wǒ men xiàn zài shì jǐ bǐ jǐ?'],
  ['比分是一比一，还有时间。','bǐ fēn shì yì bǐ yī, hái yǒu shí jiān.'],
  ['不管谁赢，赛后都要握手。','bù guǎn shéi yíng, sài hòu dōu yào wò shǒu.'],
  ['刚才那次配合，我们做得很好。','gāng cái nà cì pèi hé, wǒ men zuò de hěn hǎo.'],
  ['谢谢你和我一起踢球！','xiè xie nǐ hé wǒ yì qǐ tī qiú!'],
 ])),
 course('pinyin','articles','zh-story-pass','短文 · 最后一次传球','按顺序打完四段故事。从落后到扳平，看看小队怎样学会配合。',passage([
  [['周五放学后，小雨和同学们来到操场。','zhōu wǔ fàng xué hòu, xiǎo yǔ hé tóng xué men lái dào cāo chǎng.'],['他们分成两队，约好踢一场友谊赛。','tā men fēn chéng liǎng duì, yuē hǎo tī yì chǎng yǒu yì sài.'],['开场不久，对方就进了一球。','kāi chǎng bù jiǔ, duì fāng jiù jìn le yì qiú.']],
  [['小雨有些着急，一拿到球就往前跑。','xiǎo yǔ yǒu xiē zháo jí, yì ná dào qiú jiù wǎng qián pǎo.'],['可是两名对手很快围了上来。','kě shì liǎng míng duì shǒu hěn kuài wéi le shàng lái.'],['队友大声喊，我在左边！','duì yǒu dà shēng hǎn, wǒ zài zuǒ biān!']],
  [['小雨抬起头，把球传了过去。','xiǎo yǔ tái qǐ tóu, bǎ qiú chuán le guò qu.'],['队友接住球，又轻轻回传。','duì yǒu jiē zhù qiú, yòu qīng qīng huí chuán.'],['这一次，小雨跑到了空处，顺势把球踢进球门。','zhè yí cì, xiǎo yǔ pǎo dào le kòng chù, shùn shì bǎ qiú tī jìn qiú mén.']],
  [['比赛结束时，比分是一比一。','bǐ sài jié shù shí, bǐ fēn shì yì bǐ yī.'],['两队互相握手，还约好下周再踢。','liǎng duì hù xiāng wò shǒu, hái yuē hǎo xià zhōu zài tī.'],['小雨记住了，抬头看看队友，球才会走得更远。','xiǎo yǔ jì zhù le, tái tóu kàn kan duì yǒu, qiú cái huì zǒu de gèng yuǎn.']],
 ])),
 course('pinyin','articles','zh-story-goalkeeper','短文 · 第一次当门将','四段接力。跟着小宁从紧张到敢于出声指挥。',passage([
  [['星期六的早晨，小宁第一次站在球门前。','xīng qī liù de zǎo chén, xiǎo níng dì yí cì zhàn zài qiú mén qián.'],['他拉紧手套，心里有一点紧张。','tā lā jǐn shǒu tào, xīn li yǒu yì diǎn jǐn zhāng.'],['队友告诉他，有事就大声说。','duì yǒu gào su tā, yǒu shì jiù dà shēng shuō.']],
  [['比赛开始后，一个高球飞了过来。','bǐ sài kāi shǐ hòu, yí ge gāo qiú fēi le guò lái.'],['小宁喊了一声，我来接！','xiǎo níng hǎn le yì shēng, wǒ lái jiē!'],['身前的队友让开一步，他稳稳抱住了球。','shēn qián de duì yǒu ràng kāi yí bù, tā wěn wěn bào zhù le qiú.']],
  [['后来，对方又踢出一脚低球。','hòu lái, duì fāng yòu tī chū yì jiǎo dī qiú.'],['小宁弯下膝盖，用双手把球挡了下来。','xiǎo níng wān xià xī gài, yòng shuāng shǒu bǎ qiú dǎng le xià lái.'],['他看见右边有空位，就把球传给队友。','tā kàn jiàn yòu biān yǒu kòng wèi, jiù bǎ qiú chuán gěi duì yǒu.']],
  [['哨声响起时，大家跑过来和他击掌。','shào shēng xiǎng qǐ shí, dà jiā pǎo guò lái hé tā jī zhǎng.'],['小宁笑着说，下次我还想当门将。','xiǎo níng xiào zhe shuō, xià cì wǒ hái xiǎng dāng mén jiàng.'],['原来有人一起配合，守门也能很有意思。','yuán lái yǒu rén yì qǐ pèi hé, shǒu mén yě néng hěn yǒu yì si.']],
 ])),
];

export const ENGLISH_STARTERS:Lesson[]=[
 course('english','letters','en-letters-a','Letters A–M','认读 A 到 M，先单个打，再用短键组复习顺序。',[
  ...Array.from('abcdefghijklm',input=>({input,label:`${input.toUpperCase()} / ${input}`,speech:input.toUpperCase()})),
  ...['abc','bca','def','fde','ghi','ihg','jkl','lkj','mab','cde','fgh','ijk','klm','abm','a f m'].map(input=>({input,phase:'字母接力'})),
 ]),
 course('english','letters','en-letters-b','Letters N–Z','认读 N 到 Z，再交叉复习字母和空格。',[
  ...Array.from('nopqrstuvwxyz',input=>({input,label:`${input.toUpperCase()} / ${input}`,speech:input.toUpperCase()})),
  ...['nop','pno','qrs','srq','tuv','vut','wxy','yxw','zno','opq','rst','uvw','xyz','a z','a m z'].map(input=>({input,phase:'字母接力'})),
 ]),
 course('english','letters','en-letters-review','Alphabet Relay','把前后半段连起来，读字母、打键组，再试试简单组合。',[
  ...['abc','def','ghi','jkl','mno','pqr','stu','vwx','yz','az','by','cx','dw','ev','fu','gt','hs','ir','jq','kp','lo','mn','a b c','x y z','abcdefghijklmnopqrstuvwxyz'].map(input=>({input,phase:'全字母复习'})),
 ]),
 course('english','words','en-colors-numbers','Colors and Numbers','认读球衣颜色和球员号码。先练单词，再把颜色和数量组合起来。',english([
  ['red','红色'],['blue','蓝色'],['green','绿色'],['yellow','黄色'],['white','白色'],['black','黑色'],
  ['one','一'],['two','二'],['three','三'],['four','四'],['five','五'],['six','六'],['seven','七'],['eight','八'],['nine','九'],['ten','十'],
  ['red team','红队'],['blue shirt','蓝色球衣'],['two balls','两个球'],['three cones','三个标志桶'],
  ['number seven','七号'],['number ten','十号'],['green field','绿色球场'],['white line','白线'],
 ])),
 course('english','words','en-positions','Players and Places','认一认球员、位置、球场物品和方向。',english([
  ['player','球员'],['coach','教练'],['keeper','守门员'],['captain','队长'],['referee','裁判'],
  ['field','球场'],['goal','球门'],['net','球网'],['line','线'],['bench','替补席'],
  ['shirt','球衣'],['boots','球鞋'],['gloves','手套'],['whistle','哨子'],['flag','旗子'],
  ['left','左边'],['right','右边'],['front','前面'],['back','后面'],['middle','中间'],
 ])),
 course('english','sentences','en-sentences-team','Talk to Your Team','练习向队友打招呼、提问和请求帮助。',english([
  ['Hi, I am ready.','你好，我准备好了。'],['Can I play with you?','我可以和你们一起玩吗？'],
  ['Which team am I on?','我在哪一队？'],['You are on the blue team.','你在蓝队。'],
  ['I can play on the left.','我可以踢左边。'],['Please pass the ball to me.','请把球传给我。'],
  ['Look up and find your team.','抬头找找你的队友。'],['Wait for me by the goal.','在球门旁等我。'],
  ['Can you help me?','你能帮我吗？'],['Yes, I can help.','可以，我能帮忙。'],
  ['Let us practice together.','我们一起练习吧。'],['Thank you for playing with me.','谢谢你和我一起踢球。'],
 ])),
 course('english','articles','en-story-pass','The Last Pass','四段短文。小球员从单带到传球，最后和队友一起扳平比分。',passage([
  [['It is Friday after school.','星期五放学了。'],['Mia and her friends go to the field.','米娅和朋友们来到球场。'],['They are ready for a football match.','他们准备好踢一场足球赛。']],
  [['The red team scores first.','红队先得分。'],['Mia gets the ball and runs fast.','米娅拿到球，跑得很快。'],['Two players run to stop her.','两名球员跑来拦她。']],
  [['Mia looks up and sees Leo.','米娅抬头看见了利奥。'],['She passes the ball to him.','她把球传给利奥。'],['Leo passes it back, and Mia scores!','利奥把球传回去，米娅进球了！']],
  [['The score is one to one.','比分是一比一。'],['The players shake hands.','球员们握手。'],['Mia says, "Good game, everyone!"','米娅说，大家踢得真棒！']],
 ],true)),
 course('english','articles','en-story-keeper','My First Match in Goal','四段短文。用句号、逗号、问号和感叹号打完整场守门故事。',passage([
  [['Ben puts on his gloves.','本戴上手套。'],['It is his first match as a keeper.','这是他第一次当守门员。'],['He asks, "Can I do this?"','他问，我能做到吗？']],
  [['The ball comes high and fast.','球又高又快地飞过来。'],['Ben calls, "I have it!"','本喊，我来接！'],['He catches the ball with both hands.','他用双手接住了球。']],
  [['Then he sees a friend on the right.','然后他看见右边有一位队友。'],['He rolls the ball to her.','他把球沿地面滚给她。'],['She runs up the field and passes again.','她沿球场向前跑，再次传球。']],
  [['At the end, his team cheers.','比赛结束时，队友们欢呼起来。'],['Ben smiles and takes off his gloves.','本笑着摘下手套。'],['He wants to play in goal again.','他还想再守一次门。']],
 ],true)),
];
