export type ProfileId = 'child' | 'parent';
export type RecordItem = {id:string;title:string;accuracy:number;correct:number;mistakes:number;seconds:number;cpm:number;date:string;points:number};
export type Progress = {records:RecordItem[];completed:string[];points:number};
export const EMPTY:Progress = {records:[],completed:[],points:0};
export const LEGACY_STORAGE = 'kick-and-keys-v1';
export const PROFILE_SESSION = 'kick-and-keys-active-profile';
export const PROFILES = {
  child: {name:'小球员',subtitle:'孩子的训练档案',avatar:'⚽'},
  parent: {name:'家长测试',subtitle:'家长的专属测试档案',avatar:'🧑‍🏫'},
} as const;
export const progressKey = (profile:ProfileId) => `kick-and-keys-v2:${profile}`;
export function isProfileId(value:unknown):value is ProfileId {return value==='child'||value==='parent';}
function parseProgress(raw:string|null):Progress|null {
  if(!raw)return null;
  try {
    const data=JSON.parse(raw);
    if(!data||!Array.isArray(data.records)||!Array.isArray(data.completed)||typeof data.points!=='number'||!Number.isFinite(data.points))return null;
    return {records:data.records.filter((r:RecordItem)=>r&&typeof r.id==='string'&&typeof r.title==='string'&&typeof r.date==='string'&&['accuracy','correct','mistakes','seconds','cpm','points'].every(k=>typeof r[k as keyof RecordItem]==='number'&&Number.isFinite(r[k as keyof RecordItem]))),completed:data.completed.filter((x:unknown)=>typeof x==='string'),points:data.points};
  }catch{return null;}
}
export function readProgress(profile:ProfileId):Progress|null {
  try{return parseProgress(localStorage.getItem(progressKey(profile)));}catch{return null;}
}
export function saveProgress(profile:ProfileId,progress:Progress):boolean {
  try{localStorage.setItem(progressKey(profile),JSON.stringify(progress));return true;}catch{return false;}
}
// Preserve the original record as a backup. Never replace an existing parent or child profile.
export function migrateLegacyProgress():void {
  try {
    if(localStorage.getItem(progressKey('parent'))!==null)return;
    const legacy=parseProgress(localStorage.getItem(LEGACY_STORAGE));
    if(legacy)saveProgress('parent',legacy);
  }catch{}
}
