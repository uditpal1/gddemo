const TE={T:null,si:0,qi:0,sel:null,tick:null,end:0,done:false,t0:0,n:0,
stop(){clearInterval(this.tick)},
async start(b,id,type,path){await busy(b,async()=>{const u=getUser();
const{data:prev,error}=await sb.from('attempts').select('test_id,test_type').eq('user_id',u.id);if(error)return toast('Could not check attempts.');
const n=prev.filter(x=>x.test_id===id).length;if(type==='full'){if(n>=2)return toast('Attempts completed for this mock.');
if(!u.ssc_gd_premium&&prev.some(x=>x.test_type==='full'&&x.test_id!==id))return toast('Free mock used. Unlock Premium.')}
let j;try{const r=await fetch(`${CFG.GITHUB_TEST_BASE_URL}/${path}`);if(!r.ok)throw 0;j=await r.json()}catch(e){return toast('Test file not found or failed to load.')}
const ss=j.sections||[];if(!ss.length)return toast('Invalid test file.');
this.T={id,type,title:j.title,neg:j.negativeMarking??.25,mp:j.marksPerQuestion??2,secs:ss.map(s=>({id:s.id,title:s.title,dur:s.duration||15,qs:s.questions.map(q=>({...q,a:null,st:'unanswered',rv:false}))}))};
this.n=n;this.si=0;this.done=false;this.t0=Date.now();this.beginSection();showSection('active-test')})},
S(){return this.T.secs[this.si]},Q(){return this.S().qs[this.qi]},
beginSection(){this.qi=0;this.sel=null;this.end=Date.now()+this.S().dur*60000;this.stop();this.tick=setInterval(()=>this.clock(),1000);this.render()},
clock(){const left=Math.max(0,this.end-Date.now()),e=$('#te-time');if(e){const m=Math.floor(left/60000),s=Math.floor(left/1000)%60;e.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
if(left<=0){this.stop();this.nextSection(true)}},
cls(q,i){return'pb '+(q.rv?'rv':q.st==='skipped'?'sk':q.st==='attempted'?'at':'')+(i===this.qi?' cur':'')},
render(){const S=this.S(),q=this.Q(),L=S.qs.length;this.sel=this.sel??q.a;
$('#s-active-test').innerHTML=`<div class="thead"><div><b>${esc(this.T.title)}</b><br><small>${esc(S.title)} · Q ${this.qi+1}/${L}</small></div><div id="te-time" class="timer">--:--</div></div>
<details class="pal" open><summary>Question Palette</summary><div class="legend"><span><i class="d at"></i>Attempted</span><span><i class="d sk"></i>Skipped</span><span><i class="d rv"></i>Review</span><span><i class="d"></i>Unanswered</span></div>
<div class="palette">${S.qs.map((x,i)=>`<button class="${this.cls(x,i)}" aria-label="Question ${i+1}" onclick="TE.go(${i})">${i+1}</button>`).join('')}</div></details>
<div class="qpanel"><h3>Question ${this.qi+1}</h3><div class="qtext">${esc(q.question)}</div>${q.image?`<img src="${esc(q.image)}" alt="" loading="lazy">`:''}
<div role="radiogroup">${q.options.map((o,i)=>`<button class="opt${this.sel===i?' on':''}" role="radio" aria-checked="${this.sel===i}" onclick="TE.pick(${i})">${esc(o)}</button>`).join('')}</div></div>
<div class="actions"><button class="btn out" onclick="TE.go(${this.qi-1})" ${this.qi?'':'disabled'}>Previous</button><button class="btn rvb" onclick="TE.mark()">Mark for Review</button><button class="btn out" onclick="TE.skip()">Skip</button><button class="btn" onclick="TE.save()">Save &amp; Next</button></div>
<button class="btn danger sub" onclick="TE.confirm()">Submit Section</button>`;this.clock()},
go(i){if(i<0||i>=this.S().qs.length)return;this.qi=i;this.sel=null;this.render();window.scrollTo(0,0)},
pick(i){this.sel=i;$$('.opt').forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-checked',k===i)})},
adv(){this.qi<this.S().qs.length-1?this.go(this.qi+1):(this.sel=null,this.render())},
save(){if(this.sel==null)return toast('Select an option first, or use Skip.');const q=this.Q();q.a=this.sel;q.st='attempted';q.rv=false;this.adv()},
skip(){const q=this.Q();q.a=null;q.st='skipped';q.rv=false;this.adv()},
mark(){const q=this.Q();if(this.sel!=null){q.a=this.sel;q.st='attempted'}q.rv=true;this.adv()},
cnt(S){const c={at:0,sk:0,rv:0,un:0};S.qs.forEach(q=>{q.st==='attempted'&&c.at++;q.st==='skipped'&&c.sk++;q.rv&&c.rv++;q.st==='unanswered'&&c.un++});return c},
confirm(){const c=this.cnt(this.S()),last=this.si===this.T.secs.length-1;
$('#modal').innerHTML=`<div class="mbox"><h3>${last?'Submit Full Mock?':'Submit this section?'}</h3><p>Attempted: ${c.at}<br>Skipped: ${c.sk}<br>Marked for Review: ${c.rv}<br>Unanswered: ${c.un}</p><div class="actions"><button class="btn out" onclick="TE.close()">Continue Test</button><button class="btn danger" onclick="TE.close();TE.nextSection(false)">${last?'Submit Test':'Submit Section'}</button></div></div>`;$('#modal').hidden=false},
close(){$('#modal').hidden=true},
nextSection(auto){this.stop();if(this.si<this.T.secs.length-1){this.si++;if(auto){$('#modal').innerHTML='<div class="mbox"><h3>Section Completed</h3><p>Next Section Starting…</p></div>';$('#modal').hidden=false;setTimeout(()=>{this.close();this.beginSection()},1800)}else this.beginSection()}else this.finish()},
async finish(){if(this.done)return;this.done=true;const T=this.T;let C=0,W=0,K=0;const secs=[],ans=[];
T.secs.forEach(s=>{let c=0,w=0,k=0;s.qs.forEach(q=>{if(q.a==null){k++}else if(q.a===q.correctAnswer)c++;else w++;ans.push({s:s.id,id:q.id,a:q.a,rv:q.rv})});C+=c;W+=w;K+=k;secs.push({title:s.title,correct:c,wrong:w,skipped:k})});
const row={user_id:getUser().id,test_id:T.id,test_type:T.type,attempt_number:this.n+1,score:C*T.mp-W*T.neg,correct:C,wrong:W,skipped:K,time_taken:Math.round((Date.now()-this.t0)/1000),sections:secs,answers:ans};
this.res={row,T};$('#modal').innerHTML='<div class="mbox"><p>Saving result…</p></div>';$('#modal').hidden=false;
const{error}=await sb.from('attempts').insert(row);this.close();
if(error)toast('Result could not be saved: '+error.message);
showSection('result')},
result(){const r=this.res;if(!r)return showSection('dashboard');const x=r.row;
$('#s-result').innerHTML=`<h2>Result</h2><div class="grid">${card('Score',f1(x.score)+' / 160')}${card('Percentage',f1(x.score/1.6)+'%')}${card('Correct',x.correct)}${card('Wrong',x.wrong)}${card('Skipped',x.skipped)}${card('Attempted',x.correct+x.wrong)}${card('Total Questions',x.correct+x.wrong+x.skipped)}${card('Time Taken',Math.floor(x.time_taken/60)+'m '+x.time_taken%60+'s')}</div>
<h3>Sections</h3><div class="grid">${x.sections.map(s=>`<div class="card"><b>${esc(s.title)}</b><p>${s.correct} correct · ${s.wrong} wrong · ${s.skipped} skipped</p></div>`).join('')}</div>
<div class="actions col"><button class="btn" onclick="showSection('review')">Review Answers</button><button class="btn out" onclick="showSection('performance')">My Performance</button><button class="btn out" onclick="showSection('dashboard')">Back to Dashboard</button></div>`},
review(){const r=this.res;if(!r)return showSection('dashboard');let h='<h2>Answer Review</h2>';
r.T.secs.forEach(s=>{h+=`<h3>${esc(s.title)}</h3>`;s.qs.forEach((q,i)=>{const st=q.a==null?'Skipped':q.a===q.correctAnswer?'Correct':'Wrong';
h+=`<div class="card"><b>Q${i+1}. ${st}${q.rv?' + Review':''}</b><div class="qtext">${esc(q.question)}</div>${q.options.map((o,k)=>`<div class="opt ro${k===q.correctAnswer?' ok':k===q.a?' bad':''}">${esc(o)}</div>`).join('')}<p class="muted">Your answer: ${q.a==null?'—':esc(q.options[q.a])}<br>Correct: ${esc(q.options[q.correctAnswer])}</p></div>`})});$('#s-review').innerHTML=h}};
R.result=()=>TE.result();R.review=()=>TE.review();
window.addEventListener('beforeunload',e=>{if(TE.T&&!TE.done&&$('#s-active-test')&&!$('#s-active-test').hidden){e.preventDefault();e.returnValue=''}});
