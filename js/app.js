const AUTH=['dashboard','full-tests','subject-tests','active-test','result','review','performance','scoreboard','profile','premium'];
const SUBJ=[['reasoning','Reasoning'],['gk-ga','GK/GA'],['mathematics','Mathematics'],['english-hindi','English/Hindi']];
let U=null;
function showSection(n){if(AUTH.includes(n)&&!getUser()){toast('Session expired. Please login.');n='login'}
$$('main>section').forEach(s=>s.hidden=s.id!=='s-'+n);
$$('[data-nav]').forEach(b=>{const on=b.dataset.nav===n||(b.dataset.nav==='tests'&&/tests/.test(n));b.classList.toggle('on',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
const r=R[n];r&&r();window.scrollTo(0,0)}
async function enterApp(){U=getUser();document.body.classList.add('in');showSection('dashboard')}
async function refreshUser(){const{data}=await sb.from('users').select(SAFE).eq('id',getUser().id).maybeSingle();if(!data||!data.is_active){logout();return null}setUser(data);return U=data}
const mine=async()=>(await sb.from('attempts').select('*').eq('user_id',U.id).order('created_at')).data||[];
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0, f1=n=>(Math.round(n*100)/100).toString();
const card=(t,v)=>`<div class="stat"><b>${esc(v)}</b><span>${esc(t)}</span></div>`;
const R={
async dashboard(){await refreshUser();if(!U)return;const a=await mine();const full=a.filter(x=>x.test_type==='full');
$('#s-dashboard').innerHTML=`<h2>Welcome, ${esc(U.name)}</h2><p class="muted">${U.ssc_gd_premium?'Premium active':'Free plan · '+(full.length?'Free mock used':'1 free full mock available')}</p>
<div class="grid">${card('Tests Attempted',a.length)}${card('Average Score',f1(avg(a.map(x=>x.score))))}${card('Best Score',f1(Math.max(0,...a.map(x=>x.score))))}${card('Average %',f1(avg(a.map(x=>x.score/1.6)))+'%')}</div>
<div class="grid cta">${[['full-tests','Full Mock Tests'],['subject-tests','Subject-wise Tests'],['performance','My Performance'],['scoreboard','Scoreboard'],['profile','Profile'],['premium','Premium']].map(([s,t])=>`<button class="card" onclick="showSection('${s}')">${t}</button>`).join('')}</div>`},
async 'full-tests'(){await refreshUser();const a=(await mine()).filter(x=>x.test_type==='full');
$('#s-full-tests').innerHTML='<h2>Full Mock Tests</h2><div class="grid">'+Array.from({length:10},(_,i)=>{const n=String(i+1).padStart(2,'0'),id='ssc-gd-full-'+n,used=a.filter(x=>x.test_id===id).length;
const lock=!U.ssc_gd_premium&&a.length&&!used,done=used>=2;
return`<div class="card"><h3>SSC GD Full Mock ${n}</h3><p class="muted">80 Questions · 160 Marks · 60 Minutes</p><p>Attempts: ${used}/2 · Remaining: ${2-used} · <b>${U.ssc_gd_premium?'Included':lock?'Premium':'Free'}</b></p>
${done?'<button class="btn" disabled>Attempts Completed</button>':lock?'<button class="btn gold" onclick="showSection(\'premium\')">Unlock Premium</button>':`<button class="btn" onclick="TE.start(this,'${id}','full','full/mock-${n}.json')">Start Test</button>`}</div>`}).join('')+'</div>'},
'subject-tests'(){$('#s-subject-tests').innerHTML='<h2>Subject-wise Tests</h2><p class="muted">Unlimited attempts.</p><div class="grid">'+SUBJ.map(([k,t])=>`<div class="card"><h3>${t}</h3><p class="muted">20 Questions · Subject test · Open</p><button class="btn" onclick="TE.start(this,'ssc-gd-sub-${k}-01','subject','subjects/${k}/test-01.json')">Start Test</button></div>`).join('')+'</div>'},
async performance(){const a=await mine();const sub={};a.forEach(x=>(x.sections||[]).forEach(s=>{const o=sub[s.title]=sub[s.title]||{c:0,w:0,s:0};o.c+=s.correct;o.w+=s.wrong;o.s+=s.skipped}));
const sum=k=>a.reduce((x,y)=>x+y[k],0);
$('#s-performance').innerHTML=`<h2>My Performance</h2><div class="grid">${card('Total Attempts',a.length)}${card('Tests',new Set(a.map(x=>x.test_id)).size)}${card('Average Score',f1(avg(a.map(x=>x.score))))}${card('Best Score',f1(Math.max(0,...a.map(x=>x.score))))}${card('Average %',f1(avg(a.map(x=>x.score/1.6)))+'%')}${card('Correct',sum('correct'))}${card('Wrong',sum('wrong'))}${card('Skipped',sum('skipped'))}</div>
<h3>Subjects</h3><div class="grid">${Object.entries(sub).map(([t,o])=>{const tot=o.c+o.w+o.s||1;return`<div class="card"><b>${esc(t)}</b><div class="bar"><i style="width:${o.c/tot*100}%"></i></div><small>${o.c} correct · ${o.w} wrong · ${o.s} skipped</small></div>`}).join('')||'<p class="muted">Take a test to see subject performance.</p>'}</div>`},
async scoreboard(){$('#s-scoreboard').innerHTML='<h2>Scoreboard</h2><p class="muted">Loading…</p>';$('#s-scoreboard').innerHTML='<h2>Scoreboard</h2>'+await scoreboardHTML(sb)},
profile(){const u=U||getUser();$('#s-profile').innerHTML=`<h2>Profile</h2><div class="card prof">${[['Name',u.name],['Mobile',u.mobile],['Email',u.email||'—'],['SSC GD Premium',u.ssc_gd_premium?'Active':'Not active'],['Referral Code',u.referral_code_used||'—'],['Member since',new Date(u.created_at).toLocaleDateString()]].map(([k,v])=>`<p><span class="muted">${k}</span><br><b>${esc(v)}</b></p>`).join('')}
${u.ssc_gd_premium?'':'<button class="btn gold" onclick="showSection(\'premium\')">Buy Premium</button>'}<button class="btn out" onclick="logout()">Logout</button></div>`},
premium(){const u=U||getUser(),m=encodeURIComponent(`Hi, I want SSC GD Premium.\nName: ${u.name}\nMobile: ${u.mobile}`);
$('#s-premium').innerHTML=`<h2>SSC GD Premium</h2><div class="card"><ul><li>All 50 Full Mocks</li><li>All Subject Tests</li><li>Future SSC GD Tests</li></ul><p class="muted">Premium is activated manually by admin after payment verification.</p>
<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${CFG.WHATSAPP_NUMBER}?text=${m}">Buy on WhatsApp</a><a class="btn out" target="_blank" rel="noopener" href="https://t.me/${CFG.TELEGRAM_USERNAME}?text=${m}">Buy on Telegram</a></div>`}};
async function scoreboardHTML(c){const{data,error}=await c.from('attempts').select('user_id,score,users(name)');if(error)return'<p class="muted">Could not load scoreboard.</p>';
const m={};(data||[]).forEach(x=>{const o=m[x.user_id]=m[x.user_id]||{n:x.users?.name||'User',s:[]};o.s.push(x.score)});
const rows=Object.values(m).map(o=>({n:o.n,t:o.s.length,a:avg(o.s),b:Math.max(...o.s)})).sort((x,y)=>y.a-x.a||y.b-x.b);
return rows.length?`<div class="grid">${rows.slice(0,100).map((r,i)=>`<div class="card"><b>#${i+1} ${esc(r.n)}</b><p>Tests: ${r.t} · Average: ${f1(r.a)} · Best: ${f1(r.b)} · ${f1(r.a/1.6)}%</p></div>`).join('')}</div>`:'<p class="muted">No attempts yet.</p>'}
document.addEventListener('DOMContentLoaded',()=>{if(!$('#s-home'))return;$$('[data-go]').forEach(b=>b.onclick=()=>showSection(b.dataset.go));$$('[data-nav]').forEach(b=>b.onclick=()=>showSection(b.dataset.nav==='tests'?'full-tests':b.dataset.nav));
$('#l-btn').onclick=e=>login(e.target);$('#r-btn').onclick=e=>register(e.target);const u=getUser();if(u&&u.role==='user')enterApp();else showSection('home')});
