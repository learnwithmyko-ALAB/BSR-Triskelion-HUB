/* BSR Triskelion HUB — browser frontend. No private records embedded in the public website. */
(()=>{'use strict';
const CFG=window.BSR_SETTINGS||{}, APP=document.getElementById('app'), PORTAL=document.getElementById('portal');
const S={token:sessionStorage.getItem('bsr_token')||'',me:null,view:'home',tab:'all',data:{},selected:{},cards:[],quiz:[],answers:{},quizResult:null,flashIndex:0,flashRevealed:false,busy:false,lastDashboard:null};
const editableRoles=['officer','admin','superadmin'],managerRoles=['admin','superadmin'];
const residentMode=()=>S.me&&S.me.role==='member';
const admin=()=>S.me&&managerRoles.includes(S.me.role),writer=()=>S.me&&editableRoles.includes(S.me.role);
const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico=(name)=>{const p={house:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',book:'<path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2 2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2 2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>',branch:'<circle cx="6" cy="4" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12M8 12h6a4 4 0 0 0 4-4"/>',landmark:'<path d="m3 10 9-7 9 7M4 10h16M5 10v10m5-10v10m4-10v10m5-10v10M3 21h18"/>',layers:'<rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="11" width="18" height="5" rx="1"/><path d="M5 20h14"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 10h18c0-3-3-3-3-10M10 22h4"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',users:'<path d="M16 20a6 6 0 0 0-12 0M18 8a3 3 0 1 1-1 6M21 20a5 5 0 0 0-3-4"/><circle cx="10" cy="9" r="4"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m8 12 3 3 5-6"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="m16 4 4 4L9 19l-5 1 1-5L16 4z"/>',trash:'<path d="M4 7h16M10 11v7M14 11v7M6 7l1 14h10l1-14M9 7V4h6v3"/>',close:'<path d="M5 5 19 19M19 5 5 19"/>',check:'<path d="m4 12 5 5L20 6"/>',star:'<path d="m12 2 3 6 7 .9-5 5 1.3 7.1L12 17.5 5.7 21l1.3-7.1-5-5L9 8z"/>',folder:'<path d="M3 6h6l2 2h10v12H3z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',award:'<circle cx="12" cy="8" r="5"/><path d="m8 12-2 10 6-3 6 3-2-10"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',logout:'<path d="M9 4H4v16h5m4-4 4-4-4-4m-7 4h11"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 8 10-8"/>',photo:'<rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m3 18 6-6 4 4 3-3 5 5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',heart:'<path d="M20 5c-2-2-5-2-8 1-3-3-6-3-8-1-4 4 1 9 8 16 7-7 12-12 8-16"/>',history:'<path d="M4 4v6h6M4 10a8 8 0 1 1 2 7M12 7v5l3 2"/>'};return `<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name]||p.star}</svg>`;};
function toast(text,error){const el=document.getElementById('toast');el.textContent=text;el.className=error?'error':'';el.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display='none',5500);}
function safeError(e){const m=String(e&&e.message||e||'Request failed');toast(m,true);if(/Session expired|not active/i.test(m)){sessionStorage.removeItem('bsr_token');S.token='';S.me=null;render();}}
function configured(){return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CFG.apiUrl||'');}
const pending=new Map();
window.addEventListener('message',event=>{
  const o=event.origin;
  // GAS HtmlService may relay its sandboxed response via a googleusercontent.com origin.
  const trusted=o==='https://script.google.com'||/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/.test(o)||o==='null';
  if(!trusted||!event.data||event.data.bridge!=='BSR_TRISKELION_HUB')return;
  const id=event.data.requestId,entry=pending.get(id);if(!entry)return;
  clearTimeout(entry.timer);pending.delete(id);entry.form.remove();entry.frame.remove();
  const result=event.data.result;
  if(result&&result.ok)entry.resolve(result.data);else entry.reject(Error(result&&result.error||'Unable to complete request.'));
});
function api(action,payload={}){
  if(!configured())return Promise.reject(Error('App is not connected. Set the deployed Apps Script URL in config.js.'));
  const id=crypto.randomUUID(),frame=document.createElement('iframe'),form=document.createElement('form'),field=document.createElement('input');
  frame.name='bsr_rpc_'+id;frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;frame.style.display='none';
  form.method='POST';form.action=CFG.apiUrl;form.target=frame.name;form.style.display='none';
  field.name='request';field.type='hidden';field.value=JSON.stringify({requestId:id,action,token:S.token,payload});form.appendChild(field);
  document.body.append(frame,form);
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);form.remove();frame.remove();reject(Error('Request timed out. Verify Apps Script deployment, permissions and network access.'));},40000);
    pending.set(id,{resolve,reject,form,frame,timer});
    try{form.submit();}catch(err){clearTimeout(timer);pending.delete(id);form.remove();frame.remove();reject(err);}
  });
}
function loading(){APP.innerHTML='<div class="loader"><div><div class="spin"></div><div>Loading BSR HUB…</div></div></div>';}
const txt=(name,value='',placeholder='',type='text',required=false)=>`<label class="field">${h(name)}<input name="${h(name)}" type="${type}" ${required?'required':''} value="${h(value)}" placeholder="${h(placeholder)}" autocomplete="off"></label>`;
const area=(name,value='',required=false)=>`<label class="field wide">${h(name)}<textarea name="${h(name)}" ${required?'required':''}>${h(value)}</textarea></label>`;
const select=(name,options,value='',required=false)=>`<label class="field">${h(name)}<select name="${h(name)}" ${required?'required':''}>${options.map(o=>`<option value="${h(o.value)}" ${String(o.value)===String(value)?'selected':''}>${h(o.label)}</option>`).join('')}</select></label>`;
const yesno=(name,checked)=>`<div class="checkline wide"><input type="checkbox" id="f_${name}" name="${name}" ${checked?'checked':''}><label for="f_${name}">${h(name)}</label></div>`;
const btn=(label,action,klass='secondary',extra='')=>`<button type="button" class="btn ${klass}" data-action="${h(action)}" ${extra}>${label}</button>`;
const back=(view)=>`<button type="button" class="btn secondary small" data-action="nav" data-view="${view}">${ico('back')} Back</button>`;
const empty=(msg)=>`<div class="empty">${ico('book')}<p>${h(msg)}</p></div>`;
const tag=(s)=>`<span class="pill">${h(s||'Not set')}</span>`;
const date=s=>s?new Date(s).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'Not specified';
const money=n=>Number(n||0).toLocaleString('en-PH');
function navItems(){return residentMode()?[['home','house','Home'],['learn','book','Learn'],['legacy','branch','Lineage'],['more','bell','Updates'],['profile','user','Profile']]:[['home','house','Home'],['learn','book','Learn'],['legacy','branch','Lineage'],['leadership','landmark','Leaders'],['more','more','More']];}
function navButton(item){const [v,i,l]=item;return `<button class="navbtn ${S.view===v?'active':''}" data-action="nav" data-view="${v}" aria-label="${l}">${ico(i)}<span>${l}</span></button>`;}
function chrome(inner){const name=S.me?.name||'Member',initial=name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  APP.innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><img src="bsr-logo-original.png" alt="Original BSR chapter logo"><div><b>BSR TRISKELION<br>HUB</b><span>LEARN • LEAD • PRESERVE</span></div></div><div class="sideheading">YOUR CHAPTER HUB</div><div class="side-accent">PRIVATE MEMBER EXPERIENCE</div>${navItems().map(navButton).join('')}<div class="side-bottom">${btn(ico('user')+' My Profile','profile','secondary full')}${btn(ico('logout')+' Log Out','logout','outline full')}</div></aside><main class="page"><div class="topbar"><div class="top-title">TAU GAMMA PHI / SIGMA · BAGUIO SESSION ROAD</div><div class="topright"><button class="top-logout" type="button" data-action="logout" aria-label="Log out">${ico('logout')}<span>Log Out</span></button><span class="badge">${h(S.me?.role||'member').toUpperCase()}</span><span class="avatar" aria-label="${h(name)}">${h(initial)}</span></div></div>${inner}<div class="footer">BSR TRISKELION HUB • Official emblem reproduced from the supplied original • Private member platform</div></main><nav class="bottom-nav" aria-label="Primary navigation">${navItems().map(navButton).join('')}</nav></div>`;
}
function loginView(){APP.innerHTML=`<section class="auth-screen"><div class="auth-panel"><img class="emblem" src="bsr-logo-original.png" alt="Original BSR chapter emblem"><div class="eyebrow">Verified BSR members only</div><h1>BSR Triskelion HUB</h1><p class="sub">One chapter. A living legacy.<br>Knowledge • Brotherhood • Service</p>${!configured()?'<div class="notice" style="text-align:left;margin-bottom:14px">Setup required: deploy the backend, then paste the Apps Script /exec URL into <b>github/config.js</b>.</div>':''}<form id="login-form">${txt('Assigned Name','','e.g. Maestro','text',true)}<label class="field">Password<input type="password" name="Password" placeholder="Your private password" autocomplete="current-password" required></label><button type="submit" class="btn full" ${!configured()?'disabled':''}>${ico('lock')} Secure Member Login</button></form><p class="auth-foot">Accounts are created by authorized BSR administrators and officers. Public registration is disabled.</p></div></section>`;}
function passwordView(){APP.innerHTML=`<section class="auth-screen"><div class="auth-panel"><img class="emblem" src="bsr-logo-original.png" alt="BSR logo"><h1>Protect Your Account</h1><p class="sub">You are using a temporary password. Please choose a new private password before continuing.</p><form id="password-form">${txt('Current Password','','Temporary password','password',true)}${txt('New Password','','12+ chars, upper/lower, number, symbol','password',true)}<button class="btn full" type="submit">${ico('shield')} Save Secure Password</button></form><div class="actions" style="margin-top:18px;justify-content:center">${btn('Log out','logout','outline')}</div></div></section>`;}
function render(){if(!S.me){loginView();return;}if(S.me.mustChangePassword){passwordView();return;}
  const pages={home:homeView,learn:learnView,legacy:legacyView,leadership:leadershipView,more:moreView,profile:profileView,projects:projectsView,admin:adminView,lesson:lessonView,project:projectView,quiz:quizView};
  chrome((pages[S.view]||homeView)());if(S.view==='project')loadProjectPhotos();}
function homeView(){if(residentMode())return residentHomeView();const d=S.lastDashboard||{},ann=d.announcements||[];
 const first=h(S.me?.name?.split(' ')[0]||'Member');const honorific=S.me?.salutation==='Sis'?'Sis.':'Bro.';
 return `<section class="hero premium-hero"><div class="hero-content"><div class="eyebrow">THE BAGUIO SESSION ROAD CHAPTER · MEMBERS' PORTAL</div><div class="hero-rule"></div><h1>Welcome, ${honorific}<br><em>${first}!</em></h1><p class="sub">One chapter. A living legacy.<br>Knowledge, brotherhood, leadership and service.</p><div class="actions hero-actions">${btn('Enter Learning Center '+ico('arrow'),'nav','','data-view="learn"')}${btn('Explore Our Legacy','nav','outline','data-view="legacy"')}</div><div class="hero-footnote">BSR TRISKELION HUB <span>◆</span> LEARN · LEAD · PRESERVE</div></div><div class="hero-crest"><div class="crest-halo"><img src="bsr-logo-original.png" alt="Official BSR chapter emblem"></div><div class="crest-caption">BAGUIO SESSION ROAD</div></div></section>
 <div class="sectionhead premium-section"><div><div class="eyebrow">AT A GLANCE</div><h3>Chapter overview</h3></div><span class="section-meta">YOUR PRIVATE MEMBER SPACE</span></div>
 <div class="stats premium-stats"><div class="stat"><div class="stat-head"><small>Learning library</small>${ico('book')}</div><b>${money(d.lessons)}</b><span class="stat-foot">Lessons available</span></div><div class="stat"><div class="stat-head"><small>Learning progress</small>${ico('clock')}</div><b>${money(d.due)}</b><span class="stat-foot">Reviews due</span></div><div class="stat"><div class="stat-head"><small>Chapter heritage</small>${ico('landmark')}</div><b>${money(d.terms)}</b><span class="stat-foot">Administrations</span></div><div class="stat"><div class="stat-head"><small>Chapter impact</small>${ico('folder')}</div><b>${money(d.projects)}</b><span class="stat-foot">Projects documented</span></div></div>
 <div class="sectionhead premium-section"><div><div class="eyebrow">DISCOVER & EXPLORE</div><h3>Explore the HUB</h3></div></div>
 <div class="grid premium-grid">${tile('book','Learning Center','Prayer, tenets, codes, flashcards and quiz','learn')}${tile('branch','BSR Genealogy','Founders, batches and verified residents','legacy')}${tile('landmark','Leadership Archive','GT / GLT administrations and officers','leadership')}${tile('folder','Chapter Projects','Service, initiatives and accomplishments','projects')}${tile('bell','Announcements','Official chapter updates and notices','more')}${writer()?tile('settings','Admin Console','Manage and verify chapter records','admin'):''}</div>
 <div class="home-lower"><section><div class="sectionhead premium-section"><div><div class="eyebrow">STAY INFORMED</div><h3>Latest announcements</h3></div>${btn('View all','nav','secondary small','data-view="more"')}</div>${ann.length?`<div class="record-list">${ann.slice(0,3).map(a=>`<div class="listcard"><div class="list-main"><strong>${h(a.title)}</strong><small>${h((a.body||'').slice(0,180))}</small></div>${a.pinned?tag('Pinned'):''}</div>`).join('')}</div>`:empty('No announcements have been published yet.')}</section><section><div class="sectionhead premium-section"><div><div class="eyebrow">LEADERSHIP</div><h3>Current administration</h3></div></div>${d.currentTerm?`<div class="card current-term"><div class="eyebrow">CURRENT LEADERSHIP</div><h3>${h(d.currentTerm.title)}</h3><p>${h(d.currentTerm.summary||'Explore the term to view officers and chapter projects.')}</p>${btn('View Leadership '+ico('arrow'),'nav','','data-view="leadership"')}</div>`:empty('Current leadership information will appear after an administrator enters the verified term.')}</section></div>`;
}

function residentHomeView(){const d=S.lastDashboard||{},first=h(S.me?.name?.trim().split(/\s+/)[0]||'Member');const honorific=S.me?.salutation==='Sis'?'Sis.':'Bro.';const ann=d.announcements||[];
return `<section class="hero premium-hero resident-hero"><div class="hero-content"><div class="eyebrow">BSR TRISKELION HUB · RESIDENT PORTAL</div><div class="hero-rule"></div><h1>Welcome, ${honorific}<br><em>${first}!</em></h1><p class="sub">Your chapter. Your legacy. Your home.</p><div class="actions hero-actions">${btn('Start Learning '+ico('arrow'),'nav','','data-view="learn"')}${btn('View Chapter Lineage','nav','outline','data-view="legacy"')}</div></div><div class="hero-crest"><div class="crest-halo"><img src="bsr-logo-original.png" alt="Official BSR emblem"></div><div class="crest-caption">BAGUIO SESSION ROAD</div></div></section>
<div class="sectionhead premium-section"><div><div class="eyebrow">YOUR MEMBER SPACE</div><h3>Explore Your HUB</h3></div></div>
<div class="grid premium-grid resident-grid">${tile('book','Learning Center','Lessons, flashcards and quizzes','learn')}${tile('branch','Chapter Lineage','Names and batch numbers only','legacy')}${tile('bell','Chapter Updates','Announcements from your chapter','more')}${tile('user','My Profile','Your account and password','profile')}</div>
<div class="sectionhead"><h3>Latest Announcements</h3>${btn('View All','nav','secondary small','data-view="more"')}</div>${ann.length?`<div class="record-list">${ann.slice(0,3).map(a=>`<div class="listcard"><div class="list-main"><strong>${h(a.title)}</strong><small>${h((a.body||'').slice(0,180))}</small></div></div>`).join('')}</div>`:empty('No announcements have been published yet.')}`;
}

function tile(icon,title,desc,view){return `<button type="button" class="tile" data-action="nav" data-view="${view}">${ico(icon)}<strong>${h(title)}</strong><p>${h(desc)}</p></button>`;}
function filteredLessons(){const lessons=S.data.lessons||[];return lessons.filter(x=>S.tab==='all'||x.type===S.tab);}
function learnView(){const lessons=filteredLessons(),types=[['all','All Lessons'],['prayer','Prayer'],['tenet','Tenets'],['code','Codes'],['reference','Other']];
 return `<div class="eyebrow">Study • Recall • Reflect</div><h2 class="headline">Learning Center</h2><p class="sub">Consistent review strengthens long-term memory. Explore each lesson, reveal flashcards, and test your recall.</p><div class="grid two" style="margin-top:17px">${tile('layers','Flashcards','Active recall and spaced repetition','flash')}${tile('award','Knowledge Quiz','Review tenets, codes and prayer','quiz')}</div><div class="filters">${types.map(([id,label])=>`<button class="chip ${S.tab===id?'active':''}" data-action="tab" data-tab="${id}">${label}</button>`).join('')}</div><div class="record-list">${lessons.length?lessons.map(x=>`<div class="listcard"><div class="list-main"><div class="eyebrow">${h(x.type||'Reference')}</div><strong>${h(x.title)}</strong><small>Tap to study and mark your progress</small></div>${btn('Read '+ico('arrow'),'lessonOpen','secondary small','data-id="'+h(x.id)+'"')}</div>`).join(''):empty('No lessons found for this category.')}</div>`;
}
function lessonView(){const x=S.selected.lesson;if(!x)return empty('Select a lesson from Learning Center.');const progress=(S.cards||[]).find(c=>c.id===x.id)?.progress;
 return `<div class="reading-tools">${back('learn')}<div class="actions">${tag(x.type||'Reference')}${progress?tag(progress.stage>0?'Review stage '+progress.stage:'Needs review'):''}</div></div><div class="reading"><h2>${h(x.title)}</h2><div>${h(x.body)}</div></div><div class="reading-tools" style="margin-top:18px"><p class="sub">Were you able to recall the main ideas?</p><div class="actions">${btn('Review sooner','review','secondary','data-remember="false" data-id="'+h(x.id)+'"')}${btn(ico('check')+' I remembered','review','','data-remember="true" data-id="'+h(x.id)+'"')}</div></div>`;
}
function flashView(){const c=S.cards.filter(c=>(S.data.lessons||[]).some(x=>x.id===c.id));const card=c[S.flashIndex%c.length];if(!card)return empty('No flashcards yet.');const lesson=(S.data.lessons||[]).find(x=>x.id===card.id);
 return `<div class="eyebrow">Active Recall</div><h2>Study Flashcards</h2><p class="sub">Try to remember the passage before revealing it. Each successful review schedules a later repetition.</p><div class="reading-tools"><span class="pill">Card ${S.flashIndex%c.length+1} of ${c.length}</span>${back('learn')}</div><button class="flash" data-action="reveal" style="width:100%"><div><div class="prompt">${S.flashRevealed?'REVEALED PASSAGE':'RECALL THE PASSAGE'}</div><h2>${h(lesson?.title||card.title)}</h2>${S.flashRevealed?`<p class="answer">${h(lesson?.body||'')}</p>`:'<p class="hint">Tap to reveal the passage</p>'}</div></button><div class="actions" style="justify-content:center;margin-top:16px">${S.flashRevealed?`${btn('Again','flashReview','secondary','data-remember="false"')}${btn('I Remembered '+ico('check'),'flashReview','','data-remember="true"')}`:btn('Reveal Passage','reveal','')}</div>`;
}
function quizView(){if(S.quizResult){const r=S.quizResult;return `<div class="card" style="text-align:center"><div class="eyebrow">Knowledge Check</div><h2>Your Result</h2><div style="font-size:50px;font-weight:800;color:var(--gold)">${r.score}/${r.total}</div><p class="sub">${Math.round(r.score/r.total*100)}% correct</p>${r.results.map((x,i)=>`<div class="listcard" style="text-align:left"><div class="list-main"><strong>Question ${i+1}: ${x.correct?'Correct':'Review this'}</strong><small>${h(x.explanation||'')}</small></div>${tag(x.correct?'✓':'Retry')}</div>`).join('')}<div class="actions" style="justify-content:center;margin-top:20px">${btn('Try Again','quizRestart')}${btn('Return to Learning','nav','secondary','data-view="learn"')}</div></div>`;}
 const q=S.quiz;if(!q.length)return `<div class="eyebrow">Knowledge Check</div><h2>Quick Quiz</h2>${empty('No quiz questions are available yet. Ask an administrator to add questions.')}${back('learn')}`;
 return `<div class="eyebrow">Challenge your knowledge</div><h2>Knowledge Quiz</h2><p class="sub">Answer all ${q.length} questions, then submit to view your result.</p><form id="quiz-form">${q.map((x,i)=>`<div class="card" style="margin:15px 0"><div class="eyebrow">QUESTION ${i+1} OF ${q.length}</div><h3 style="margin-top:12px">${h(x.question)}</h3>${x.options.map((o,j)=>`<label class="quiz-choice ${S.answers[x.id]===j?'selected':''}" style="display:flex;align-items:center;gap:12px"><input type="radio" name="q_${h(x.id)}" value="${j}" ${S.answers[x.id]===j?'checked':''} required><span>${h(o)}</span></label>`).join('')}</div>`).join('')}<button type="submit" class="btn full">Submit Answers ${ico('arrow')}</button></form>`;
}
function legacyView(){const batches=S.data.batches||[],founders=S.data.founders||[],res=S.data.residents||[];
 if(residentMode())return `<div class="eyebrow">OUR CHAPTER HERITAGE</div><h2>Chapter Lineage</h2><p class="sub">Know the brothers and sisters who came before you. Only names and batch numbers are displayed.</p><label class="field">Search batch or name<input type="search" id="batch-search" placeholder="Search name or batch number…"></label><div class="sectionhead"><h3>Founding Members</h3></div>${founders.length?`<div class="card lineage-card">${founders.map(f=>`<div class="lineage-name">${ico('user')}<span>${h(f.name)}</span></div>`).join('')}</div>`:empty('Founding members have not yet been entered.')}<div class="sectionhead"><h3>Batches — Earliest First</h3></div><div class="record-list" id="batch-results">${batchList(batches,res)}</div>`;
 return `<div class="eyebrow">A living chapter record</div><h2>BSR Genealogy & Heritage</h2><p class="sub">Explore verified founders and residents organized by batch.</p><div class="sectionhead"><h3>Chapter Founders</h3></div>${founders.length?`<div class="grid two">${founders.map(x=>`<div class="card"><h3>${h(x.name)}</h3><p>${h(x.note)}</p></div>`).join('')}</div>`:empty('Founder records awaiting verified documentation.')}<div class="sectionhead"><h3>Residents by Batch</h3></div><label class="field">Find a batch<input type="search" id="batch-search" placeholder="Search batch or year…"></label><div class="record-list" id="batch-results">${batchList(batches,res)}</div>`;
}
function batchList(batches,res,query=''){const ordered=batches.slice().sort((a,b)=>Number(a.sortOrder||999)-Number(b.sortOrder||999)||Number(a.year||9999)-Number(b.year||9999)||String(a.name).localeCompare(String(b.name),undefined,{numeric:true}));const shown=ordered.filter(b=>!query||`${b.name} ${b.year}`.toLowerCase().includes(query.toLowerCase())||res.some(r=>r.batchId===b.id&&String(r.displayName||'').toLowerCase().includes(query.toLowerCase())));return shown.length?shown.map(b=>`<div class="listcard" style="display:block"><button type="button" data-action="toggleBatch" data-id="${h(b.id)}" class="lineage-toggle"><div><strong>${h(b.name)}</strong><small>${res.filter(r=>r.batchId===b.id).length} names</small></div>${ico('arrow')}</button><div class="batch-body" id="batch_${h(b.id)}" hidden>${res.filter(r=>r.batchId===b.id).map(r=>`<div class="lineage-name">${ico('user')}<span>${h(r.displayName)}</span></div>`).join('')||'<div class="empty">No verified names recorded yet.</div>'}</div></div>`).join(''):empty('No matching batch records.');}
function leadershipView(){const terms=S.data.terms||[], assignments=S.data.assignments||[],projects=S.data.projects||[];
 const sorted=terms.slice().sort((a,b)=>(a.status==='current'?-1:0)-(b.status==='current'?-1:0));
 const active=S.selected.termId&&terms.find(x=>x.id===S.selected.termId)||sorted[0];
 return `<div class="eyebrow">Chapter leadership through the years</div><h2>GT / GLT Administrations</h2><p class="sub">Each administration, its officers and projects remain part of the BSR historical archive.</p>${!active?empty('No leadership terms have been entered yet.'): `<label class="field" style="max-width:460px">Select Administration<select id="term-select">${sorted.map(t=>`<option value="${h(t.id)}" ${t.id===active.id?'selected':''}>${h(t.title)}${t.status==='current'?' · Current':''}</option>`).join('')}</select></label><div class="hero" style="margin:17px 0"><div><div class="eyebrow">${h(active.status)} Administration</div><h1>${h(active.title)}</h1><p class="sub">${h(active.startDate||'Start not entered')} — ${h(active.endDate||'Present')}</p><p class="sub">${h(active.summary||'')}</p></div>${ico('landmark')}</div><div class="sectionhead"><h3>Leadership Officers</h3></div><div class="grid two">${assignments.filter(a=>a.termId===active.id).map(x=>`<div class="card"><div class="eyebrow">${h(x.position)}</div><h3>${h(x.displayName)}</h3><p>${h(x.notes||'Chapter leadership')}</p></div>`).join('')||empty('Officers awaiting verified appointment records.')}</div><div class="sectionhead"><h3>Projects & Accomplishments</h3>${btn('All Projects','nav','secondary small','data-view="projects"')}</div><div class="record-list">${projects.filter(p=>p.termId===active.id).map(p=>projectRow(p)).join('')||empty('No projects recorded for this administration.')}</div>`}<div class="sectionhead"><h3>Leadership Timeline</h3></div><div class="timeline">${sorted.map(t=>`<div class="timeline-item"><strong>${h(t.title)}</strong><small style="display:block">${h(t.startDate||'—')} ${t.endDate?'to '+h(t.endDate):''}</small></div>`).join('')}</div>`;
}
function projectRow(p){return `<div class="listcard"><div class="list-main"><strong>${h(p.title)}</strong><small>${h(p.category)} · ${h(p.status)} ${p.date?'· '+h(date(p.date)):''}</small></div>${btn('View','openProject','secondary small','data-id="'+h(p.id)+'"')}</div>`;}
function projectsView(){const list=S.data.projects||[];
 return `<div class="eyebrow">Service & achievements</div><h2>Chapter Projects</h2><p class="sub">Documenting the initiatives and accomplishments of each GT/GLT administration.</p><div class="filters">${['All','Community Service','Education','Environment','Brotherhood','Other'].map(t=>`<button data-action="projectFilter" data-filter="${h(t)}" class="chip ${S.tab===t?'active':''}">${h(t)}</button>`).join('')}</div><div class="record-list">${(S.tab==='All'?list:list.filter(x=>x.category===S.tab)).map(projectRow).join('')||empty('No projects found for this category.')}</div>`;}
function projectView(){const p=S.selected.project,term=(S.data.terms||[]).find(x=>x.id===p?.termId);if(!p)return empty('Choose a project from the project list.');
 return `${back('projects')}<div class="eyebrow" style="margin-top:18px">${h(p.category)} ${p.status?'· '+h(p.status):''}</div><h2>${h(p.title)}</h2><div class="actions">${tag(p.status)}${term?tag(term.title):''}${p.date?tag(date(p.date)):''}</div><div class="card" style="margin-top:16px"><h3>Project Overview</h3><p style="white-space:pre-wrap">${h(p.description||'No description has been entered.')}</p><h3>Outcomes & Accomplishments</h3><p style="white-space:pre-wrap">${h(p.outcome||'Outcomes awaiting documentation.')}</p></div><div class="sectionhead"><h3>Private Photo Gallery</h3>${writer()?btn(ico('photo')+' Add Photo','addPhoto','secondary small'):''}</div><div class="photo-grid" id="project-photos"><div class="empty">Loading member-only photos…</div></div>`;
}
function moreView(){const a=S.data.announcements||[];
 return `<div class="eyebrow">The chapter at a glance</div><h2>More from BSR</h2><div class="grid two">${tile('folder','Projects','Chapter events and accomplishments','projects')}${tile('user','My Profile','Account and reminders','profile')}${writer()?tile('settings','Admin Console','Chapter data management','admin'):''}</div><div class="sectionhead"><h3>Chapter Announcements</h3></div><div class="record-list">${a.length?a.map(x=>`<div class="card"><div class="actions" style="justify-content:space-between"><h3>${h(x.title)}</h3>${x.pinned?tag('Pinned'):''}</div><p style="white-space:pre-wrap">${h(x.body)}</p><small>${h(date(x.createdAt))}</small></div>`).join(''):empty('No chapter announcements yet.')}</div>`;
}
function profileView(){return `<div class="eyebrow">Member profile</div><h2>My Account</h2><div class="card"><div class="actions" style="margin-bottom:18px"><span class="member-icon">${ico('user')}</span><div><h3>${h(S.me.name)}</h3><span class="pill">${h(S.me.role)}</span></div></div><div class="divider"></div><p><strong>Assigned Name:</strong> ${h(S.me.username||'')}</p><p><strong>Status:</strong> ${h(S.me.status)}</p><div class="divider"></div><div class="actions">${btn('Change Password','passwordModal','secondary')}${btn('Log Out','logout','outline')}</div></div><p class="sub" style="margin-top:18px">Your account was created by an authorized BSR administrator or officer. For account recovery, contact chapter administration.</p>`;}
const ADMIN_SECTIONS=[['members','users','Members & Accounts'],['terms','landmark','Administrations'],['assignments','award','Officer Assignments'],['founders','branch','Chapter Founders'],['batches','layers','Resident Batches'],['residents','users','Resident Records'],['projects','folder','Project Records'],['announcements','bell','Announcements'],['lessons','book','Learning Content'],['questions','award','Quiz Questions'],['audit','history','Activity Log']];
function adminView(){if(!writer())return empty('Only authorized chapter administrators and officers can access this section.');
 const section=S.selected.adminSection||'index';if(section==='index')return `<div class="eyebrow">Verified access</div><h2>Administration Console</h2><p class="sub">Maintain accurate chapter records. All changes are saved to the private Google Sheets database and audited.</p><div class="grid">${ADMIN_SECTIONS.filter(([k])=>admin()||['members','projects','announcements'].includes(k)).map(([kind,icon,title])=>tileAdmin(kind,icon,title)).join('')}</div>`;
 const entries=section==='members'?S.data.members||[]:section==='audit'?S.data.audit||[]:S.data[section]||[];
 const title=ADMIN_SECTIONS.find(x=>x[0]===section)?.[2]||section;
 return `${btn(ico('back')+' Console','adminHome','secondary small')}<div class="sectionhead"><div><div class="eyebrow">Editable chapter database</div><h2>${h(title)}</h2></div>${section==='audit'?'':btn(ico('plus')+' Add New','editRecord','','data-kind="'+h(section)+'"')}</div>${section==='audit'?`<div class="record-list">${entries.map(x=>`<div class="listcard"><div class="list-main"><strong>${h(x.action)}</strong><small>${h(x.actorId)} · ${h(date(x.createdAt))}</small><small>${h(x.details)}</small></div></div>`).join('')||empty('No actions recorded yet.')}</div>`:`<label class="field">Search records<input id="admin-search" type="search" placeholder="Filter ${h(title.toLowerCase())}…"></label><div id="admin-records" class="record-list">${adminRecords(section,entries)}</div>`}`;
}
function tileAdmin(kind,icon,title){return `<button class="tile" data-action="adminSection" data-kind="${kind}">${ico(icon)}<strong>${h(title)}</strong><p>Open records and editing tools</p></button>`;}
function recordName(kind,x){return kind==='members'?x.name+' · '+x.role:kind==='terms'?x.title:kind==='assignments'?x.position+' · '+x.displayName:kind==='founders'?x.name:kind==='batches'?x.year+' · '+x.name:kind==='residents'?x.displayName:kind==='questions'?x.question:x.title||x.name||'Record';}
function adminRecords(kind,items,q=''){const list=items.filter(x=>recordName(kind,x).toLowerCase().includes(q.toLowerCase()));return list.length?list.map(x=>`<div class="listcard"><div class="list-main"><strong>${h(recordName(kind,x))}</strong><small>${h(x.status||x.username||x.category||x.startDate||x.type||x.description?.slice(0,70)||x.notes||'')}</small></div><div class="row-actions">${btn(ico('edit')+' Edit','editRecord','secondary small','data-kind="'+h(kind)+'" data-id="'+h(x.id)+'"')}${kind==='members'?btn('Reset Password','resetPassword','outline small','data-id="'+h(x.id)+'"'):['projects','announcements','assignments','founders','residents','questions','lessons'].includes(kind)&&admin()?btn(ico('trash'),'deleteRecord','danger small','data-kind="'+h(kind)+'" data-id="'+h(x.id)+'"'):''}</div></div>`).join(''):empty('No records found.');}
function modal(title,body,submitLabel='Save Changes',formId='record-form'){
  PORTAL.innerHTML=`<div class="modal-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="${h(title)}"><div class="modal-head"><h3>${h(title)}</h3><button type="button" class="close" data-action="closeModal" aria-label="Close">${ico('close')}</button></div><form id="${h(formId)}">${body}<div class="modal-actions">${btn('Cancel','closeModal','secondary')}<button class="btn" type="submit">${h(submitLabel)} ${ico('check')}</button></div></form></div></div>`;
  PORTAL.querySelector('input:not([type=hidden]),select,textarea')?.focus();
}
const opts=(arr,label='name')=>[{value:'',label:'— Select / Not assigned —'},...arr.map(x=>({value:x.id,label:x[label]||x.title||x.displayName||x.id}))];
function recordForm(kind,existing={}){
 const x=existing;let form='';const role=S.me.role;
 if(kind==='members'){
   form=txt('Name',x.name,'Full name','text',true)+txt('Assigned Name',x.username,'e.g. Maestro','text',true);
   const allowed=role==='superadmin'?['member','officer','admin',...(x.role==='superadmin'?['superadmin']:[])]:role==='admin'?['member','officer']:['member'];
   form+=select('Role',allowed.map(v=>({value:v,label:v.toUpperCase()})),x.role||'member');
   form+=select('Status',['active','suspended'].map(v=>({value:v,label:v})),x.status||'active');
   form+=select('Batch',opts(S.data.batches||[],'name'),x.batchId||'')+area('Note',x.note||'');
 }else if(kind==='terms'){
   form=txt('Title',x.title,'Example: Administration 2026–2027','text',true)+txt('Start Date',x.startDate,'','date')+txt('End Date',x.endDate,'','date')+select('Status',['current','historical','upcoming'].map(v=>({value:v,label:v})),x.status||'current')+txt('GT Label',x.gtLabel||'GT')+txt('GLT Label',x.gltLabel||'GLT')+area('Summary',x.summary||'');
 }else if(kind==='assignments'){
   form=select('Term ID',opts(S.data.terms||[],'title'),x.termId,true)+select('Member ID',opts(S.data.members||[],'name'),x.memberId)+txt('Position',x.position,'e.g. Grand Triskelion','text',true)+txt('Display Name',x.displayName,'Required for historical records without member accounts')+area('Notes',x.notes);
 }else if(kind==='founders'){
   form=txt('Name',x.name,'Full name','text',true)+txt('Year',x.year,'Year (if verified)')+area('Note',x.note)+txt('Sort Order',x.sortOrder||100,'','number');
 }else if(kind==='batches'){
   form=txt('Name',x.name,'Verified batch title','text',true)+txt('Year',x.year,'e.g. 2026')+area('Description',x.description)+txt('Sort Order',x.sortOrder||100,'','number');
 }else if(kind==='residents'){
   form=select('Batch ID',opts(S.data.batches||[],'name'),x.batchId,true)+select('Member ID',opts(S.data.members||[],'name'),x.memberId)+txt('Display Name',x.displayName,'Name if no account is linked')+txt('Year Joined',x.yearJoined)+area('Note',x.note)+yesno('Hidden',x.hidden);
 }else if(kind==='projects'){
   form=txt('Title',x.title,'Project name','text',true)+select('Category',['Community Service','Education','Environment','Brotherhood','Other'].map(v=>({value:v,label:v})),x.category||'Community Service')+select('Status',['Planned','Ongoing','Completed','Archived'].map(v=>({value:v,label:v})),x.status||'Planned')+select('Term ID',opts(S.data.terms||[],'title'),x.termId)+txt('Date',x.date,'','date')+area('Description',x.description)+area('Outcome',x.outcome);
 }else if(kind==='announcements'){
   form=txt('Title',x.title,'Announcement title','text',true)+area('Body',x.body,true)+yesno('Active',x.active!==false)+yesno('Pinned',x.pinned);
 }else if(kind==='lessons'){
   form=txt('Title',x.title,'Lesson title','text',true)+select('Type',['prayer','tenet','code','reference'].map(v=>({value:v,label:v})),x.type||'reference')+area('Body',x.body,true)+txt('Sort Order',x.sortOrder||100,'','number')+yesno('Visible',x.visible!==false);
 }else if(kind==='questions'){
   form=select('Lesson ID',opts(S.data.lessons||[],'title'),x.lessonId)+area('Question',x.question,true)+txt('Option 1',x.options?.[0]||'','','text',true)+txt('Option 2',x.options?.[1]||'','','text',true)+txt('Option 3',x.options?.[2]||'','','text',true)+txt('Option 4',x.options?.[3]||'','','text',true)+select('Correct Answer',[0,1,2,3].map(i=>({value:i,label:'Option '+(i+1)})),x.correctIndex??0)+area('Explanation',x.explanation);
 }
 PORTAL.dataset.kind=kind;PORTAL.dataset.id=x.id||'';
 modal((x.id?'Edit ':'Add ')+(ADMIN_SECTIONS.find(a=>a[0]===kind)?.[2]||kind),`<div class="formgrid">${form}</div>`);
}
async function getLists(kinds){const missing=kinds.filter(k=>!S.data[k]);await Promise.all(missing.map(async kind=>{
  const a=kind==='members'?'members':kind==='audit'?'audit':'list';const p=a==='list'?{kind}:{};
  const res=await api(a,p);S.data[kind]=res.items||[];
 }));}
async function openView(view){
 if(view==='flash'){
   loading();try{await getLists(['lessons']);const r=await api('learningCards');S.cards=r.items||[];S.flashIndex=0;S.flashRevealed=false;S.view='flash';chrome(flashView());}catch(e){safeError(e);render();}return;
 }
 if(view==='quiz'){loading();try{const r=await api('quizStart');S.quiz=r.questions||[];S.quizResult=null;S.answers={};S.view='quiz';render();}catch(e){safeError(e);render();}return;}
 if(view==='learn'||view==='projects'){S.tab=view==='learn'?'all':'All';}
 S.view=view;loading();
 try{
   if(view==='home')S.lastDashboard=await api('dashboard');
   if(view==='learn'){await getLists(['lessons']);const r=await api('learningCards');S.cards=r.items||[];}
   if(view==='legacy')await getLists(['founders','batches','residents']);
   if(view==='leadership')await getLists(['terms','assignments','projects']);
   if(view==='projects')await getLists(['projects','terms']);
   if(view==='more')await getLists(['announcements']);
   if(view==='admin'&&!(writer()))throw Error('You do not have access to the admin console.');
   render();window.scrollTo(0,0);
 }catch(e){safeError(e);if(S.me)chrome(`<div class="error-page"><h2>Could not load this section</h2><p class="sub">${h(e.message)}</p>${btn('Retry','nav','','data-view="'+h(view)+'"')}</div>`);}
}
async function openAdminSection(kind){
 if(!writer())return;
 S.selected.adminSection=kind;loading();
 try{
   const needs=[kind];
   if(kind==='members')needs.push('batches');
   if(kind==='assignments')needs.push('terms','members');
   if(kind==='residents')needs.push('batches','members');
   if(kind==='projects')needs.push('terms');
   if(kind==='questions')needs.push('lessons');
   await getLists(needs);S.view='admin';render();
 }catch(e){safeError(e);render();}
}
async function openRecordForm(kind,id){
 try{
   if(kind==='members'&&S.me.role==='officer'){}else if(!admin()&&kind!=='members'&&kind!=='projects'&&kind!=='announcements')throw Error('Permission denied.');
   const deps={members:['batches'],assignments:['terms','members'],residents:['batches','members'],projects:['terms'],questions:['lessons']};
   await getLists(deps[kind]||[]);
   const old=(S.data[kind]||[]).find(x=>x.id===id)||{};
   recordForm(kind,old);
 }catch(e){safeError(e);}
}
async function saveRecord(form){
 const kind=PORTAL.dataset.kind,id=PORTAL.dataset.id,fd=new FormData(form),values={};
 for(const [k,v] of fd.entries())values[k]=v;
 if(id)values.id=id;
 for(const check of ['Hidden','Active','Pinned','Visible'])if(form.querySelector('[name="'+check+'"]'))values[check]=form.querySelector('[name="'+check+'"]').checked;
 const remap={
   members:{Name:'name','Assigned Name':'username',Role:'role',Status:'status',Batch:'batchId',Note:'note'},
   terms:{Title:'title','Start Date':'startDate','End Date':'endDate',Status:'status','GT Label':'gtLabel','GLT Label':'gltLabel',Summary:'summary'},
   assignments:{'Term ID':'termId','Member ID':'memberId',Position:'position','Display Name':'displayName',Notes:'notes'},
   founders:{Name:'name',Year:'year',Note:'note','Sort Order':'sortOrder'},
   batches:{Name:'name',Year:'year',Description:'description','Sort Order':'sortOrder'},
   residents:{'Batch ID':'batchId','Member ID':'memberId','Display Name':'displayName','Year Joined':'yearJoined',Note:'note',Hidden:'hidden'},
   projects:{Title:'title',Category:'category',Status:'status','Term ID':'termId',Date:'date',Description:'description',Outcome:'outcome'},
   announcements:{Title:'title',Body:'body',Active:'active',Pinned:'pinned'},
   lessons:{Title:'title',Type:'type',Body:'body','Sort Order':'sortOrder',Visible:'visible'},
   questions:{'Lesson ID':'lessonId',Question:'question','Correct Answer':'correctIndex',Explanation:'explanation'}
 };
 const p={};for(const [key,newKey] of Object.entries(remap[kind]||{}))if(Object.prototype.hasOwnProperty.call(values,key))p[newKey]=values[key];
 if(kind==='questions')p.options=[0,1,2,3].map(i=>values['Option '+(i+1)]||'');
 if(id)p.id=id;
 try{
   S.busy=true;form.querySelector('[type="submit"]').disabled=true;
   const res=kind==='members'?await api('memberSave',p):await api('save',{kind,values:p});
   PORTAL.innerHTML='';S.data[kind]=null;
   await getLists([kind]);render();toast('Changes saved to the private chapter database.');
   if(res.temporaryPassword)showOneTimePassword(res.temporaryPassword,res.member?.username||'');
 }catch(e){safeError(e);form.querySelector('[type="submit"]').disabled=false;}finally{S.busy=false;}
}
function showOneTimePassword(password,username){
 PORTAL.innerHTML=`<div class="modal-overlay"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h3>One-Time Member Password</h3><button class="close" data-action="closeModal">${ico('close')}</button></div><div class="notice">Share this password privately with the verified member. It is shown only once. Never post it in group chats or public lists. The member must change it on first login.</div><p style="margin-top:16px">${h(username)}</p><div class="password" id="temp-password">${h(password)}</div><div class="modal-actions">${btn('Copy Password','copyPassword')}${btn('Done','closeModal','secondary')}</div></div></div>`;
}
async function loadProjectPhotos(){const target=document.getElementById('project-photos');if(!target||!S.selected.project)return;
 try{
  const result=await api('photoList',{projectId:S.selected.project.id});
  if(!target.isConnected)return;
  if(!result.items.length){target.innerHTML=empty('No project photos uploaded. Photos remain private to verified members.');return;}
  target.innerHTML=result.items.map(p=>`<div><img id="photo_${h(p.id)}" alt="${h(p.name)}" loading="lazy"><p class="muted" style="font-size:10px">${h(p.name)}</p>${admin()?btn('Remove photo','removePhoto','danger small','data-id="'+h(p.id)+'"'):''}</div>`).join('');
  for(const p of result.items){if(!target.isConnected)return;try{const data=await api('photoRead',{photoId:p.id});const img=document.getElementById('photo_'+p.id);if(img&&['image/jpeg','image/png','image/webp'].includes(data.mime))img.src='data:'+data.mime+';base64,'+data.base64;}catch(e){toast('Could not load one photo.',true);}}
 }catch(e){if(target.isConnected)target.innerHTML=empty('Unable to load project photographs.');}
}
function uploadPhotoModal(){if(!S.selected.project)return;
 modal('Add a Private Project Photo','<p class="sub">Upload a JPG, PNG or WEBP image. Your phone will optimize large photos before upload. Photos remain private in Google Drive.</p><label class="field">Choose Photo<input type="file" id="photo-file" accept="image/jpeg,image/png,image/webp" required></label>','Upload Photo','upload-photo-form');
}
function imageToBase64(file){return new Promise((resolve,reject)=>{
 if(!/^image\/(jpeg|png|webp)$/.test(file.type))return reject(Error('Please select a JPG, PNG or WEBP photo.'));
 const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{
   try{const canvas=document.createElement('canvas'),ratio=Math.min(1,1200/Math.max(img.width,img.height));canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
   const data=canvas.toDataURL('image/jpeg',0.72);URL.revokeObjectURL(url);const b64=data.split(',')[1];if(b64.length>1400000)throw Error('Image is still too large. Try a smaller photo.');resolve({mime:'image/jpeg',base64:b64});
   }catch(e){URL.revokeObjectURL(url);reject(e);} };img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not read this image.'));};img.src=url;
 });}
async function handleClick(b){const action=b.dataset.action,id=b.dataset.id;
 try{switch(action){
 case 'nav': S.selected.adminSection='index';await openView(b.dataset.view);break;
 case 'profile':await openView('profile');break;
 case 'closeModal':PORTAL.innerHTML='';break;
 case 'adminHome':S.selected.adminSection='index';render();break;
 case 'adminSection':await openAdminSection(b.dataset.kind);break;
 case 'editRecord':await openRecordForm(b.dataset.kind,id);break;
 case 'lessonOpen':S.selected.lesson=(S.data.lessons||[]).find(x=>x.id===id);S.view='lesson';render();window.scrollTo(0,0);break;
 case 'openProject':S.selected.project=(S.data.projects||[]).find(x=>x.id===id);S.view='project';render();window.scrollTo(0,0);break;
 case 'toggleBatch':{const v=document.getElementById('batch_'+id);if(v)v.hidden=!v.hidden;break;}
 case 'tab':S.tab=b.dataset.tab;render();break;
 case 'projectFilter':S.tab=b.dataset.filter;render();break;
 case 'reveal':S.flashRevealed=true;chrome(flashView());break;
 case 'review':await api('learningReview',{lessonId:id,remembered:b.dataset.remember==='true'});toast('Learning progress saved.');S.view='learn';await openView('learn');break;
 case 'flashReview':{const card=S.cards[S.flashIndex%S.cards.length];await api('learningReview',{lessonId:card.id,remembered:b.dataset.remember==='true'});S.flashIndex++;S.flashRevealed=false;chrome(flashView());toast('Next review scheduled.');break;}
 case 'quizRestart':await openView('quiz');break;
 case 'resetPassword':{
   if(!confirm('Reset this account? All existing sessions will be revoked.'))break;
   const r=await api('memberResetPassword',{memberId:id});showOneTimePassword(r.temporaryPassword,'');break;}
 case 'deleteRecord':{
   if(!confirm('Permanently delete this record? This action is logged.'))break;
   await api('delete',{kind:b.dataset.kind,id});S.data[b.dataset.kind]=null;await getLists([b.dataset.kind]);render();toast('Record deleted.');break;}
 case 'copyPassword':await navigator.clipboard.writeText(document.getElementById('temp-password').textContent);toast('Password copied. Share it privately.');break;
 case 'passwordModal':modal('Change Your Password',txt('Current Password','','','password',true)+txt('New Password','','12+ chars with numbers and symbols','password',true),'Update Password','change-pw-form');break;
 case 'logout':{
   try{await api('logout');}catch(_){}sessionStorage.removeItem('bsr_token');S.token='';S.me=null;S.data={};S.view='home';PORTAL.innerHTML='';render();break;}
 case 'addPhoto':uploadPhotoModal();break;
 case 'removePhoto':if(confirm('Remove this private project photo?')){await api('photoDelete',{photoId:id});await loadProjectPhotos();toast('Photo removed.');}break;
 }}catch(e){safeError(e);}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b){e.preventDefault();if(!S.busy)handleClick(b);}});
document.addEventListener('change',async e=>{
 if(e.target.id==='term-select'){S.selected.termId=e.target.value;render();}
 if(e.target.type==='radio'&&e.target.closest('#quiz-form')){S.answers[e.target.name.slice(2)]=Number(e.target.value);}
});
document.addEventListener('input',e=>{
 if(e.target.id==='batch-search'){const el=document.getElementById('batch-results');if(el)el.innerHTML=batchList(S.data.batches||[],S.data.residents||[],e.target.value);}
 if(e.target.id==='admin-search'){const kind=S.selected.adminSection;const el=document.getElementById('admin-records');if(el)el.innerHTML=adminRecords(kind,S.data[kind]||[],e.target.value);}
});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!form.id)return;e.preventDefault();if(S.busy)return;
 try{
  if(form.id==='login-form'){
   S.busy=true;form.querySelector('[type="submit"]').disabled=true;
   const r=await api('login',{username:form.elements['Assigned Name'].value,password:form.elements.Password.value});
   S.token=r.token;sessionStorage.setItem('bsr_token',r.token);S.me=r.member;S.me.mustChangePassword=r.mustChangePassword;S.data={};
   if(S.me.mustChangePassword)render();else await openView('home');
  }else if(form.id==='password-form'||form.id==='change-pw-form'){
   S.busy=true;const r=await api('changePassword',{currentPassword:form.elements['Current Password'].value,newPassword:form.elements['New Password'].value});
   S.token=r.token;sessionStorage.setItem('bsr_token',r.token);S.me=r.member;S.me.mustChangePassword=false;PORTAL.innerHTML='';toast('Password updated.');await openView('home');
  }else if(form.id==='record-form')await saveRecord(form);
  else if(form.id==='prefs-form'){
   const r=await api('preferences',{remindEmail:document.getElementById('emailReminder').checked});S.me=r.member;toast('Reminder preference saved.');render();
  }else if(form.id==='quiz-form'){
   const answers=S.quiz.map(q=>({id:q.id,choice:S.answers[q.id]}));
   if(answers.some(a=>!Number.isInteger(a.choice))){toast('Answer every question before submitting.',true);return;}
   S.quizResult=await api('quizSubmit',{answers});render();window.scrollTo(0,0);
  }else if(form.id==='upload-photo-form'){
   const file=document.getElementById('photo-file')?.files?.[0];if(!file)throw Error('Select a photo first.');
   S.busy=true;const image=await imageToBase64(file);
   await api('photoUpload',{projectId:S.selected.project.id,name:file.name,mime:image.mime,base64:image.base64});
   PORTAL.innerHTML='';await loadProjectPhotos();toast('Photo saved privately.');
  }
 }catch(err){safeError(err);}finally{S.busy=false;const b=form.querySelector('[type="submit"]');if(b)b.disabled=false;}
});
async function init(){
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
 if(!S.token){render();return;}
 loading();try{const r=await api('me');S.me=r.member;if(S.me.mustChangePassword)render();else await openView('home');}
 catch(e){sessionStorage.removeItem('bsr_token');S.token='';S.me=null;render();toast('Please log in again.',true);}
}
init();
})();
