/* Local data layer: same query API the app uses, backed by in-browser data (no server). */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,3500)}
const getUser=()=>{try{const s=JSON.parse(sessionStorage.getItem('ssc_user'));if(s&&s.exp>Date.now())return s.u;sessionStorage.removeItem('ssc_user')}catch(e){}return null};
const setUser=u=>sessionStorage.setItem('ssc_user',JSON.stringify({u,exp:Date.now()+6*3600e3}));
const busy=async(b,f)=>{if(b.disabled)return;b.disabled=true;const o=b.textContent;b.textContent='Please wait…';try{await f()}catch(e){toast('Something went wrong. Try again.');console.error(e.message)}finally{b.disabled=false;b.textContent=o}};
const SAFE='id,name,mobile,email,role,ssc_gd_premium,referral_code_used,is_active,created_at';
const DB=(()=>{
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const r=rng(13792),ri=(a,b)=>a+Math.floor(r()*(b-a+1)),pick=a=>a[ri(0,a.length-1)],gs=()=>{let s=0;for(let i=0;i<6;i++)s+=r();return(s-3)/.707},cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const FN='Aarav Rahul Priya Neha Rohit Amit Sunita Vikas Pooja Karan Anjali Deepak Mohit Ritu Sachin Kavita Manoj Sneha Ajay Komal Nitin Pinky Suresh Rekha Harish Mamta Jitendra Sonu Dinesh Anita'.split(' '),LN='Sharma Verma Meena Yadav Choudhary Singh Gurjar Jat Rathore Saini Kumar Gupta Patel Bairwa Jangid Khan Shekhawat Nagar Prajapat Mali'.split(' ');
const NOW=Date.now(),DAY=864e5,iso=t=>new Date(t).toISOString(),T={users:[],attempts:[],referral_codes:[]};
const U=(id,name,mobile,pw,role,pr,ago)=>({id,name,mobile,email:null,password:pw,role,ssc_gd_premium:pr,referral_code_used:null,is_active:true,created_at:iso(NOW-ago*DAY)});
T.users.push(U('u-admin','Main Admin','9000000000','admin123','admin',true,300),U('u-sub','Sub Admin','9000000099','sub123','sub_admin',true,250),U('u-r1','Rahul Sharma','9000000001','user1234','user',false,20),U('u-r2','Priya Verma','9000000002','user1234','user',false,12));
for(let i=0;T.users.length<13792;i++){const pr=r()<.22;const u=U('u'+i,pick(FN)+' '+pick(LN),'7'+String(100000000+i*37),'x'+i,'user',pr,ri(1,300));u.is_active=r()<.94;u.email=r()<.4?'u'+i+'@mail.in':null;T.users.push(u)}
const tn=new Map;let aid=0;
for(const u of T.users){if(u.role!=='user'||u.id.startsWith('u-r')||r()>.62)continue;const tests=u.ssc_gd_premium?ri(1,4):1,skill=gs()*20+88;
for(let j=0;j<tests;j++){const tid='ssc-gd-full-'+String(ri(1,10)).padStart(2,'0'),k=u.id+tid;for(let a=tn.get(k)||0;a<(r()<.4?2:1)&&a<2;a++){
const c=Math.round(cl((skill+gs()*8)/2.3,8,76)),w=Math.round(cl(gs()*6+16,0,80-c)),sk=80-c-w;tn.set(k,a+1);
const q=n=>{const x=Math.floor(n/4);return[x,x,x,n-3*x]};const cc=q(c),ww=q(w);
T.attempts.push({id:'a'+aid++,user_id:u.id,test_id:tid,test_type:'full',attempt_number:a+1,score:2*c-.25*w,correct:c,wrong:w,skipped:sk,time_taken:ri(1500,3600),created_at:iso(NOW-ri(0,90)*DAY-ri(0,DAY)),
sections:['General Intelligence and Reasoning','General Knowledge and General Awareness','Elementary Mathematics','English/Hindi'].map((t,i)=>({title:t,correct:cc[i],wrong:ww[i],skipped:20-cc[i]-ww[i]}))})}}}
T.referral_codes.push({id:'r1',code:'SSC10',discount_type:'percentage',discount_value:10,is_active:true,created_at:iso(NOW-60*DAY)},{id:'r2',code:'FLAT50',discount_type:'fixed',discount_value:50,is_active:true,created_at:iso(NOW-30*DAY)});
let X={users:[],attempts:[],referral_codes:[],patch:{users:{},referral_codes:{}}};try{X=JSON.parse(localStorage.getItem('ssc_x'))||X}catch(e){}
const save=()=>{try{localStorage.setItem('ssc_x',JSON.stringify(X))}catch(e){}};
T.users.push(...X.users);T.attempts.push(...X.attempts);T.referral_codes.push(...X.referral_codes);
for(const t in X.patch)for(const id in X.patch[t]){const o=T[t].find(x=>x.id===id);o&&Object.assign(o,X.patch[t][id])}
const UI=new Map(T.users.map(u=>[u.id,u])),AU=new Map;T.attempts.forEach(a=>{(AU.get(a.user_id)||AU.set(a.user_id,[]).get(a.user_id)).push(a)});
class Q{constructor(t){this.t=t;this.f=[];this.op='select';this.l=1e9}
select(c){this.sel=c||'*';return this}eq(k,v){this.f.push(x=>x[k]===v);return this}order(k,{ascending=true}={}){this.o=[k,ascending];return this}limit(n){this.l=n;return this}
insert(p){this.op='insert';this.p=p;return this}update(p){this.op='update';this.p=p;return this}maybeSingle(){this.one=1;return this}
then(a,b){return Promise.resolve(this.run()).then(a,b)}
run(){const t=this.t,tb=T[t];
if(this.op==='insert'){const p={...this.p,id:'n'+Date.now()+Math.random().toString(36).slice(2,6),created_at:iso(Date.now())};
if(t==='users'&&tb.some(u=>u.mobile===p.mobile))return{data:null,error:{code:'23505',message:'duplicate'}};
if(t==='referral_codes'&&tb.some(u=>u.code===p.code))return{data:null,error:{code:'23505',message:'duplicate code'}};
if(t==='attempts'){const mine=AU.get(p.user_id)||[],usr=UI.get(p.user_id);if(p.test_type==='full'){if(mine.filter(a=>a.test_id===p.test_id).length>=2)return{data:null,error:{message:'Max 2 attempts'}};
if(!usr.ssc_gd_premium&&mine.some(a=>a.test_type==='full'&&a.test_id!==p.test_id))return{data:null,error:{message:'Free mock used'}}}(AU.get(p.user_id)||AU.set(p.user_id,[]).get(p.user_id)).push(p)}
tb.push(p);if(t==='users')UI.set(p.id,p);X[t].push(p);save();return{data:null,error:null}}
let rows=tb.filter(x=>this.f.every(f=>f(x)));
if(this.op==='update'){rows.forEach(x=>{Object.assign(x,this.p);const pt=X.patch[t]=X.patch[t]||{};if(!X[t].some(y=>y.id===x.id))pt[x.id]={...pt[x.id],...this.p}});save();return{data:null,error:null}}
if(this.o){const[k,asc]=this.o;rows=[...rows].sort((a,b)=>(a[k]>b[k]?1:-1)*(asc?1:-1))}rows=rows.slice(0,this.l);const s=this.sel||'';
rows=rows.map(x=>{const o={...x};delete o.password;if(t==='attempts'&&s.includes('users('))o.users={name:UI.get(x.user_id)?.name};if(t==='users'&&s.includes('attempts('))o.attempts=(AU.get(x.id)||[]).map(a=>({score:a.score}));return o});
return{data:this.one?(rows[0]||null):rows,error:null}}}
return{from:t=>new Q(t)}})();
const sb=DB;
document.addEventListener('DOMContentLoaded',()=>{if(CFG.SHOW_SAMPLE_NOTICE){const p=document.createElement('p');p.className='muted';p.style.cssText='text-align:center;font-size:12px;margin:0 0 70px';p.textContent='Sample data shown for preview.';document.body.appendChild(p)}});
