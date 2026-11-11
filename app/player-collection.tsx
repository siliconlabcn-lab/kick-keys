import {useState} from 'react';
import {Star, LockKeyhole, CheckCircle2, Trophy, ArrowUpRight, UserRound} from 'lucide-react';
import type {Progress} from '../lib/player-progress';
import {PLAYERS,availableStars,destinationOpen,skillCount,DESTINATIONS} from '../lib/rewards';
const TEAMS=[
 {id:'cn',name:'中国',flag:'🇨🇳',color:'#ad4040'}, {id:'jp',name:'日本',flag:'🇯🇵',color:'#31599a'},
 {id:'br',name:'巴西',flag:'🇧🇷',color:'#84702a'}, {id:'es',name:'西班牙',flag:'🇪🇸',color:'#a84935'},
 {id:'fr',name:'法国',flag:'🇫🇷',color:'#3a5184'}, {id:'ar',name:'阿根廷',flag:'🇦🇷',color:'#447d99'},
 {id:'pt',name:'葡萄牙',flag:'🇵🇹',color:'#366953'},
];
function Portrait({photo,name}:{photo?:string;name:string}){
 const [failed,setFailed]=useState(false);
 return photo&&!failed?<img src={photo.startsWith('https:')?photo:`${import.meta.env.BASE_URL}${photo}`} alt={`${name}的真实照片`} loading="lazy" onError={()=>setFailed(true)}/>:<div className="portrait-unavailable"><UserRound size={48}/><span>{name}</span><small>照片暂时无法显示</small></div>;
}
export default function PlayerCollection({progress,onClaim,onTrain}:{progress:Progress;onClaim:(id:string,route:'stars'|'skill')=>boolean;onTrain:()=>void}){
 const [team,setTeam]=useState('cn');
 const [notice,setNotice]=useState('');
 const selected=TEAMS.find(t=>t.id===team)!;
 const players=PLAYERS.filter(p=>p.country===team);
 const owned=PLAYERS.filter(p=>progress.players?.includes(p.id)).length;
 const open=destinationOpen(progress,team);
 return <section className="collection" id="player-collection">
  <header className="collection-heading"><div><span className="eyebrow">YOUR FOOTBALL COLLECTION</span><h2>我的球星卡册</h2><p>7 支国家队 · {PLAYERS.length} 张球星卡 · 已收藏 {owned} 张</p></div><div className="collection-wallet"><Star size={20}/><strong>{availableStars(progress)}</strong><span>可用星星</span></div></header>
  <div className="collection-rules"><p><b>慢慢积累，也能遇见传奇。</b> 解锁目的地后用星星兑换；或多次通过 90 秒打字挑战，直接领取，不花星星。每张卡都写明了条件。</p><button className="secondary" onClick={onTrain}><Trophy size={16}/> 去练熟打字</button></div>
  <div className="team-tabs" aria-label="选择国家队">{TEAMS.map(t=><button key={t.id} aria-pressed={team===t.id} onClick={()=>{setTeam(t.id);setNotice('');}}><span>{t.flag}</span><b>{t.name}</b><small>{PLAYERS.filter(p=>p.country===t.id&&progress.players?.includes(p.id)).length} / {PLAYERS.filter(p=>p.country===t.id).length}</small></button>)}</div>
  <div className="team-collection-heading"><div><h3>{selected.flag} {selected.name} · 球星与传奇</h3><p>跨年代收藏，包含现役与退役球员，不代表当前国家队名单。</p></div><span className="soft-label">{open?'目的地已开放':`地图条件：完成 ${DESTINATIONS.find(d=>d.id===team)?.lessons} 节不同课程`}</span></div>
  <p className="collection-notice" role="status">{notice}</p>
  <div className="star-card-grid">{players.map(player=>{
   const collected=progress.players?.includes(player.id);
   const count=Math.min(player.wins,skillCount(progress,player));
   const skilled=count>=player.wins;
   const affordable=availableStars(progress)>=player.cost;
   return <article className={`star-card tier-${player.tier==='传奇'?'legend':player.tier==='巨星'?'elite':'classic'} ${collected?'collected':''}`} key={player.id} style={{'--team-color':selected.color} as React.CSSProperties}>
    <div className="star-card-portrait"><Portrait photo={player.photo} name={player.name}/><span className="card-tier">{player.tier}收藏</span><span className="card-country">{selected.flag}</span>{collected&&<span className="card-owned"><CheckCircle2 size={14}/> 已收藏</span>}<div className="star-card-name"><small>{player.english}</small><h3>{player.name}</h3></div></div>
    <div className="star-card-body"><div className="card-price"><Star size={16}/><strong>{player.cost.toLocaleString()}</strong><span>星星兑换</span></div><div className="card-skill"><b>或凭打字实力领取</b><p>90 秒挑战 · 每分钟 ≥ {player.cpm} 次正确击键<br/>准确率 ≥ {player.accuracy}% · 达标 {player.wins} 次</p><div className="skill-meter" role="progressbar" aria-label={`${player.name}挑战进度`} aria-valuenow={count} aria-valuemin={0} aria-valuemax={player.wins}><i style={{width:`${count/player.wins*100}%`}}/></div><small>已达标 {count} / {player.wins} 次</small></div>
    {collected?<div className="card-complete"><CheckCircle2 size={16}/> 已加入你的球星卡册</div>:<div className="card-claim"><button className="primary" disabled={!skilled} onClick={()=>{if(onClaim(player.id,'skill'))setNotice(`已领取 ${player.name}，没有消耗星星。`);}}>{skilled?'凭实力免费领取':`挑战还需 ${player.wins-count} 次达标`}</button><button className="secondary" disabled={!open||!affordable} onClick={()=>{if(onClaim(player.id,'stars'))setNotice(`已兑换 ${player.name}，消耗 ${player.cost} 星星。`);}}>{!open?<><LockKeyhole size={13}/> 先解锁{selected.name}</>:affordable?`用 ${player.cost} 星星兑换`:`还差 ${player.cost-availableStars(progress)} 星星`}</button></div>}
    <details className="photo-credit"><summary>照片来源与署名</summary><p>{player.author} · {player.license}</p><p>卡面以裁切方式展示原照片。</p><a href={player.source} target="_blank" rel="noreferrer">查看原照片 <ArrowUpRight size={12}/></a>{player.licenseUrl&&<a href={player.licenseUrl} target="_blank" rel="noreferrer">查看许可</a>}</details>
    </div>
   </article>;
  })}</div>
 </section>;
}
