const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const guiMode=$('#guiMode'), terminalMode=$('#terminalMode'), transition=$('#transitionLayer');
let currentMode='gui';
function setMode(mode,instant=false){if(mode===currentMode&&!instant)return;currentMode=mode;const apply=()=>{guiMode.style.display=mode==='gui'?'block':'none';terminalMode.style.display=mode==='terminal'?'block':'none';$$('.mode-switch').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));if(mode==='terminal'){bootTerminal();setTimeout(()=>$('#terminalInput')?.focus(),60)}else{window.scrollTo({top:0,behavior:'instant'})}};if(instant){apply();return}transition.classList.add('active');setTimeout(apply,280);setTimeout(()=>transition.classList.remove('active'),850)}
$$('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
const navLinks=$('#navLinks');$('#navMenu')?.addEventListener('click',()=>navLinks.classList.toggle('open'));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'});navLinks.classList.remove('open')}));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.12});$$('.reveal').forEach(el=>revealObserver.observe(el));
const sectionEls=$$('main section[id]'), navAnchors=$$('#navLinks a');const navObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navAnchors.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-42% 0px -48% 0px',threshold:0});sectionEls.forEach(s=>navObserver.observe(s));
const progress=$('#scrollProgress');window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max?Math.max(0,Math.min(1,scrollY/max))*100:0}%`},{passive:true});
const glow=$('#cursorGlow');window.addEventListener('pointermove',e=>{glow.style.opacity=.7;glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});

// Live operations: date-driven 90-day activity rail + clickable incident markers.
const activityGrid=$('#activityGrid'), liveClock=$('#liveClock'), liveDateLabel=$('#liveDateLabel');
const incidentTypes=[
  ['Wi-Fi AP unreachable','Access point lost connectivity; representative troubleshooting case.','Network / Wi-Fi'],
  ['Printer offline','Print queue or device connectivity issue; representative end-user case.','Printer / Scanner'],
  ['ERP login issue','User unable to proceed in ERP workflow; representative support case.','SAP / ERP'],
  ['MikroTik interface issue','Interface connectivity needs checking; representative network case.','MikroTik / LAN'],
  ['NAS access warning','Storage access requires validation; representative infrastructure case.','Synology NAS']
];
function dateSeed(d){let s=Math.floor(d.getTime()/86400000);return Math.abs(Math.sin(s*12.9898)*43758.5453)%1}
function buildActivity(){const today=new Date();liveDateLabel.textContent=today.toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});activityGrid.innerHTML='';const start=new Date(today);start.setHours(0,0,0,0);start.setDate(start.getDate()-89);for(let i=0;i<90;i++){const d=new Date(start);d.setDate(start.getDate()+i);const seed=dateSeed(d);const h=24+Math.round(seed*66);const incident=seed<.075&&i>5;const c=document.createElement('button');c.type='button';c.className='activity-cell'+(incident?' incident':'')+(i===89?' today':'');c.style.setProperty('--h',h+'px');c.title=`${d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}${incident?' · klik untuk detail':''}`;if(incident){const item=incidentTypes[Math.floor(seed*incidentTypes.length)];c.dataset.title=item[0];c.dataset.text=item[1];c.dataset.meta=item[2];c.dataset.date=d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});c.addEventListener('click',()=>openIncident(c));}activityGrid.appendChild(c)}
$('#axisStart').textContent=new Date(start).toLocaleDateString('id-ID',{day:'2-digit',month:'short'}).toUpperCase()}
function openIncident(c){$('#incidentTitle').textContent=c.dataset.title;$('#incidentMeta').textContent=`${c.dataset.meta} · ${c.dataset.date}`;$('#incidentText').textContent=c.dataset.text;$('#incidentStatus').textContent='Representative incident';$('#incidentModal').classList.add('show');$('#incidentModal').setAttribute('aria-hidden','false')}
function updateClock(){liveClock.textContent=new Date().toLocaleTimeString('id-ID',{hour12:false})}buildActivity();updateClock();setInterval(updateClock,1000);setInterval(()=>{const n=new Date(),d=new Date();if(n.getHours()===0&&n.getMinutes()===0){d.setSeconds(1);buildActivity()}},20000);
const countObs=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,target=Number(el.dataset.count);let v=0;const step=Math.max(1,Math.ceil(target/35));const t=setInterval(()=>{v=Math.min(target,v+step);el.childNodes[0].nodeValue=v;if(v>=target)clearInterval(t)},28);countObs.unobserve(el)}),{threshold:.8});$$('[data-count]').forEach(el=>countObs.observe(el));

// Tool wall — real brand marks where they exist, plus purpose-built field icons for non-brand categories.
const tools=[
{name:'Windows',short:'WIN',icon:'windows',kind:'OS / ENDPOINT',color:'0078D4',desc:'Instalasi, konfigurasi, maintenance, dan troubleshooting perangkat Windows.',brand:false},
{name:'MikroTik',short:'MT',slug:'mikrotik',kind:'NETWORK',color:'293239',desc:'Router, gateway, routing, bandwidth policy, NAT, LAN/Wi-Fi, dan troubleshooting.',brand:true},
{name:'Cisco',short:'C',slug:'cisco',kind:'NETWORK',color:'1BA0D7',desc:'Konsep switching, VLAN, trunking, interface status, dan network flow.',brand:true},
{name:'Ubiquiti',short:'UI',slug:'ubiquiti',kind:'WIRELESS',color:'0559C9',desc:'Reference ecosystem untuk wireless dan network access point.',brand:true},
{name:'SAP',short:'SAP',slug:'sap',kind:'ERP / SYSTEMS',color:'0FAAFF',desc:'Support pengguna, pengecekan data, dan penyelesaian kendala operasional SAP.',brand:true},
{name:'Synology',short:'SY',slug:'synology',kind:'STORAGE',color:'B5B5B5',desc:'Monitoring dan support Synology NAS di lingkungan operasional.',brand:true},
{name:'Wireshark',short:'WS',slug:'wireshark',kind:'NETWORK ANALYSIS',color:'1679A7',desc:'Packet inspection dan analisis konektivitas jaringan.',brand:true},
{name:'PuTTY',short:'PT',icon:'putty',kind:'REMOTE / CLI',color:'F9D14C',desc:'Remote terminal utility untuk akses perangkat jaringan.',brand:false},
{name:'VS Code',short:'VS',slug:'visualstudiocode',kind:'DEV / DOCS',color:'23A8F2',desc:'Editor untuk dokumentasi, scripting, dan development support.',brand:true},
{name:'Git',short:'GIT',slug:'git',kind:'VERSIONING',color:'F05032',desc:'Version control untuk dokumentasi dan project teknis.',brand:true},
{name:'Linux',short:'LNX',slug:'linux',kind:'OS / SERVER',color:'FCC624',desc:'Lingkungan OS dan command-line concepts untuk troubleshooting.',brand:true},
{name:'Postman',short:'PM',slug:'postman',kind:'API / TEST',color:'FF6C37',desc:'API utility untuk test endpoint dan kebutuhan integrasi.',brand:true},
{name:'Python',short:'PY',slug:'python',kind:'SCRIPTING',color:'3776AB',desc:'Scripting untuk automasi ringan dan problem solving.',brand:true},
{name:'Java',short:'JAVA',icon:'java',kind:'PROGRAMMING',color:'ED8B00',desc:'Pengalaman pengembangan aplikasi saat project coding.',brand:false},
{name:'C++',short:'C++',slug:'cplusplus',kind:'PROGRAMMING',color:'00599C',desc:'Pengalaman pengembangan aplikasi saat project coding.',brand:true},
{name:'Claude',short:'AI',slug:'claude',kind:'AI / PRODUCTIVITY',color:'D97757',desc:'AI fluency dan workflow assistance pada aktivitas belajar/kerja.',brand:true},
{name:'Microsoft 365',short:'365',slug:'microsoft365',kind:'PRODUCTIVITY',color:'5E5CE6',desc:'Dokumen, user productivity, dan support operasional.',brand:true},
{name:'CCTV Support',short:'CAM',icon:'camera',kind:'SECURITY',color:'72E6F3',desc:'Support CCTV sebagai bagian dari infrastruktur IT.',brand:false},
{name:'Smart Door',short:'LOCK',icon:'lock',kind:'ACCESS',color:'A78BFA',desc:'Support perangkat smart door dan kebutuhan akses operasional.',brand:false},
{name:'Printer / Scanner',short:'I/O',icon:'printer',kind:'END-USER',color:'F59E0B',desc:'Instalasi, troubleshooting, dan support printer/scanner.',brand:false},
{name:'Access Point',short:'AP',icon:'wifi',kind:'NETWORK ACCESS',color:'4ADE80',desc:'Deploy, check signal, SSID, dan konektivitas wireless.',brand:false},
{name:'Ethernet / LAN',short:'LAN',icon:'ethernet',kind:'NETWORK',color:'22D3EE',desc:'Patching, IP configuration, link check, dan end-to-end troubleshooting.',brand:false}
];
const toolIcons={
 camera:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h4l1.3-2h5.4L16 7h4v11H4z"/><circle cx="12" cy="12.5" r="3.25"/></svg>',
 lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>',
 printer:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/><circle cx="17" cy="12" r="1"/></svg>',
 wifi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5a13 13 0 0 1 17 0"/><path d="M6.5 12.5a8.5 8.5 0 0 1 11 0"/><path d="M9.5 15.5a4 4 0 0 1 5 0"/><circle cx="12" cy="18.5" r=".9" fill="currentColor" stroke="none"/></svg>',
 ethernet:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v5M12 3v5M16 3v5"/><path d="M5 8h14v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M12 15v6"/></svg>',
 windows:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx=".5"/><rect x="13" y="3" width="8" height="8" rx=".5"/><rect x="3" y="13" width="8" height="8" rx=".5"/><rect x="13" y="13" width="8" height="8" rx=".5"/></svg>',
 java:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 6c-.5-1 .5-1.4 0-2.4M12 6c-.5-1 .5-1.4 0-2.4"/></svg>',
 putty:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="m7 9.2 3 2.3-3 2.3M12.5 14h4.5"/><path d="M9 20h6M12 17v3"/></svg>'
};
const toolWall=$('#toolWall'), detailTitle=$('#detailTitle'), detailText=$('#detailText'), detailIcon=$('#detailIcon');
function toolVisual(t,detail=false){
  if(t.brand){return `<span class="brand-wrap" style="--brand:${t.color}"><img class="brand-mark" src="https://cdn.simpleicons.org/${t.slug}/${t.color}" alt="${t.name} logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'"><span class="tool-fallback">${t.short}</span></span>`}
  return `<span class="field-mark" style="--mark:${t.color}">${toolIcons[t.icon]||''}</span>`;
}
function renderTools(){
  toolWall.innerHTML='';
  tools.forEach((t,i)=>{
    const b=document.createElement('button');
    b.className='tool-tile';
    b.setAttribute('aria-label',`${t.name} — ${t.kind}`);
    b.innerHTML=`<div class="tool-icon" style="--brand:${t.color}">${toolVisual(t)}<div class="tool-orbit"></div><div class="tool-scan"></div></div><small>${t.kind}</small><strong>${t.name}</strong><span class="tool-pulse"></span><span class="tool-index">${String(i+1).padStart(2,'0')}</span>`;
    b.addEventListener('mouseenter',()=>selectTool(i));
    b.addEventListener('focus',()=>selectTool(i));
    b.addEventListener('click',()=>selectTool(i));
    toolWall.appendChild(b)
  });
  selectTool(0)
}
function selectTool(i){
  const t=tools[i];
  $$('.tool-tile',toolWall).forEach((el,idx)=>el.classList.toggle('selected',idx===i));
  detailIcon.innerHTML=toolVisual(t,true);
  detailTitle.textContent=t.name;
  detailText.textContent=t.desc;
  detailIcon.style.setProperty('--brand',t.color);
}
renderTools();

// Workstream modal / evidence behavior. Evidence file paths are ready for user-uploaded assets.
const workDetails={infra:'Hardware, network devices, LAN/Wi-Fi, MikroTik, access point, printer/scanner, NAS, CCTV, Smart Door, and end-user support.',erp:'SAP and internal ERP support, user troubleshooting, data checks, operational coordination, and system assistance.',device:'Installation, configuration, preventive maintenance, asset monitoring, and troubleshooting across 50+ devices.'};
const toast=$('#toast');let toastTimer;function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2800)}
$$('.work-action').forEach(b=>b.addEventListener('click',()=>showToast(workDetails[b.dataset.detail])));

// Architecture interactive flow — static topology, animated SVG paths.
const archData={
isp:{title:'ISP / WAN',tag:'INTERNET',text:'Titik masuk koneksi dari service provider menuju edge router. Dalam model referensi ini, traffic masuk ke routing layer sebelum diteruskan ke internal network.',specs:['WAN','UPLINK','EDGE'],flow:'ISP → MikroTik'},
router:{title:'MikroTik',tag:'ROUTER',text:'Edge/router layer untuk gateway, routing, NAT, dan policy sebelum traffic menuju switching layer.',specs:['GATEWAY','ROUTING','NAT'],flow:'ISP → MikroTik → Core Switch'},
switch:{title:'Core Switch',tag:'SWITCHING',text:'Layer switching yang membawa konektivitas ke jalur trunk dan access layer.',specs:['TRUNK','ACCESS','SWITCHING'],flow:'MikroTik → Core Switch'},
trunk:{title:'802.1Q Trunk',tag:'VLAN CARRY',text:'Jalur trunk membawa beberapa VLAN dalam satu link dari switching layer menuju segment jaringan.',specs:['802.1Q','TAGGED','TRUNK'],flow:'Core Switch → Trunk → VLANs'},
users:{title:'VLAN 10',tag:'USER',text:'Segment user untuk workstation dan endpoint operasional.',specs:['USER','ACCESS','PC / LAPTOP'],flow:'Trunk → VLAN 10 → Access Point'},
admin:{title:'VLAN 20',tag:'ADMIN',text:'Segment admin/management untuk kebutuhan internal dan pengelolaan perangkat.',specs:['ADMIN','MGMT','OPS'],flow:'Trunk → VLAN 20'},
cctv:{title:'VLAN 30',tag:'CCTV',text:'Reference segment untuk memisahkan traffic CCTV dari user network.',specs:['CAMERA','SECURITY','VLAN'],flow:'Trunk → VLAN 30 → Storage'},
ap:{title:'Access Point',tag:'WI-FI',text:'Wireless access layer yang melayani user melalui SSID dan segment jaringan yang sesuai.',specs:['SSID','WI-FI','ACCESS'],flow:'VLAN 10 → Access Point → Wi-Fi Users'},
apuser:{title:'Wi-Fi Users',tag:'ENDPOINT',text:'Client wireless yang menerima konektivitas melalui access point.',specs:['CLIENT','SSID','IP'],flow:'Access Point → Wi-Fi Users'},
nas:{title:'Synology NAS',tag:'STORAGE',text:'Storage/NAS layer untuk kebutuhan file dan data operasional di lingkungan kerja.',specs:['NAS','STORAGE','MONITOR'],flow:'VLAN 30 / Network → Synology NAS'},
sap:{title:'SAP / ERP',tag:'SYSTEMS',text:'System layer yang digunakan user untuk kebutuhan kerja dan operasional.',specs:['ERP','SAP','USERS'],flow:'Network / Storage → SAP / ERP'}
};
const archTitle=$('#archTitle'),archTag=$('#archTag'),archText=$('#archText'),archSpecs=$('#archSpecs'),archMiniFlow=$('#archMiniFlow');
function selectNode(key){const d=archData[key]||archData.isp;$$('.arch-v9-node').forEach(n=>n.classList.toggle('active',n.dataset.node===key));archTitle.textContent=d.title;archTag.textContent=d.tag;archText.textContent=d.text;archSpecs.innerHTML=d.specs.map(s=>`<span>${s}</span>`).join('');archMiniFlow.textContent=d.flow}
$$('.arch-v9-node').forEach(n=>n.addEventListener('click',()=>selectNode(n.dataset.node)));
selectNode('isp');

// Hero parallax.
const heroVisual=$('#heroVisual');window.addEventListener('pointermove',e=>{if(innerWidth<900)return;const rx=(e.clientX/innerWidth-.5)*8,ry=(e.clientY/innerHeight-.5)*8;heroVisual.style.transform=`translate3d(${rx}px,${ry}px,0)`},{passive:true});

// Evidence auto-loader: when screenshots are dropped into evidence/, the placeholders turn into real images automatically.
$$('.work-evidence').forEach(box=>{const src=box.dataset.evidence;const img=new Image();img.onload=()=>{box.querySelector('.evidence-image').innerHTML=`<img src="${src}" alt="Work evidence"><div class="evidence-overlay">FIELD EVIDENCE</div>`;box.classList.add('has-image')};img.onerror=()=>{};img.src=src});

// Certifications: click opens the uploaded file; add files under certificates/ with the exact paths below.
const creds=[
['AI','Claude Academy: AI Fluency for Students','Anthropic','Agustus 2026','certificates/claude-ai-fluency.pdf'],
['TF','Getting Started with Terraform on SAP BTP – Course Completion','SAP','Agustus 2026','certificates/terraform-sap-btp.pdf'],
['SAP','Introducing SAP Business Data Cloud – Course Completion','SAP','Agustus 2026','certificates/sap-business-data-cloud.pdf'],
['CY','Sertifikat Cyber Security','BSSN','Februari 2026','certificates/bssn-cyber-security.pdf'],
['AI','Boosting AI-Driven Business Transformation','SAP','2025','certificates/sap-ai-business-transformation.pdf'],
['BDC','Positioning SAP Business Data Cloud','SAP','2025','certificates/sap-positioning-bdc.pdf'],
['NET','Network Security Design, Installation and Routing Configuration','STMIK WIDYA PRATAMA','April 2025','certificates/network-security-routing.pdf']
];
const credGrid=$('#credGrid');creds.forEach((c,idx)=>{const a=document.createElement('article');a.className='cred-card';a.innerHTML=`<div class="cred-mark">${c[0]}</div><small>${c[2]} · ${c[3]}</small><strong>${c[1]}</strong><button class="cred-open" data-file="${c[4]}" data-title="${c[1]}">Open certificate ↗</button><div class="cred-file">${c[4]}</div>`;credGrid.appendChild(a)});

// Modal helpers.
function closeModals(){$$('.modal').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')})}
$$('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModals));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});
async function openCredential(btn){const file=btn.dataset.file,title=btn.dataset.title;try{const res=await fetch(file,{method:'HEAD',cache:'no-store'});if(res.ok){window.open(file,'_blank','noopener,noreferrer');return}}catch(e){}$('#credentialTitle').textContent=title;$('#credentialText').textContent=`File target: ${file}. Upload the certificate file to this path, then clicking the card will open it automatically.`;$('#credentialOpen').href=file;$('#credentialDownload').href=file;$('#credentialOpen').textContent='Open certificate';$('#credentialModal').classList.add('show');$('#credentialModal').setAttribute('aria-hidden','false')}$$('.cred-open').forEach(btn=>btn.addEventListener('click',()=>openCredential(btn)));

// Terminal.
const terminalOutput=$('#terminalOutput'), terminalForm=$('#terminalForm'), terminalInput=$('#terminalInput');let cmdHistory=[],cmdIndex=0;
function tEsc(s){return s.replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function addTerm(html,cls=''){const d=document.createElement('div');d.className='term-line '+cls;d.innerHTML=html.replace(/\n/g,'<br>');terminalOutput.appendChild(d);terminalOutput.scrollTop=terminalOutput.scrollHeight}
const helpText=`AVAILABLE COMMANDS\n\n  about           profile summary\n  live            activity timeline\n  stack           field toolkit\n  work            operational work\n  architecture    interactive network flow\n  experience      career timeline\n  certifications  credentials\n  education       education\n  contact         contact\n  gui             switch to GUI mode\n  clear           clear terminal\n\nNETWORK COMMANDS\n  ping isp\n  show vlan\n  show interfaces\n  traceroute core`;
function terminalCommand(raw){const c=raw.trim().toLowerCase();if(!c)return;addTerm(`hazmi@portfolio:~$ <span class="term-command">${tEsc(raw)}</span>`);switch(c){case'help':case'?':addTerm(helpText,'term-accent');break;case'about':addTerm('Muhammad Hazmi\nIT & Network Operations\nBatang, Jawa Tengah, Indonesia\n\nHardware · Network · Systems · End-user support.');break;case'live':addTerm('LIVE ACTIVITY\n90-day date-driven activity rail\nIncident markers are representative examples, not company telemetry.','term-accent');break;case'stack':addTerm('Windows\nMikroTik\nCisco / VLAN / switching concepts\nLAN / Wi-Fi / Access Point\nSAP / Internal ERP\nSynology NAS\nWireshark / PuTTY\nCCTV / Smart Door\nPrinter / Scanner\nIT Asset Management');break;case'work':addTerm('OPERATIONAL WORK\n\n[01] IT Infrastructure & End-User Support\n[02] SAP & Internal ERP\n[03] Device Maintenance / 50+ devices\n\nEvidence files can be attached under evidence/.');break;case'architecture':addTerm('REFERENCE FLOW\n\nISP / WAN\n   |\nMikroTik Router\n   |\nCore Switch\n   |-- 802.1Q TRUNK\n       |-- VLAN 10 / USER\n       |-- VLAN 20 / ADMIN\n       |-- VLAN 30 / CCTV\n   |-- Access Point / Wi-Fi\n   |-- Synology NAS\n   `-- SAP / ERP');break;case'experience':addTerm('2026 — NOW   YIH YOU FOOTWEAR INDONESIA · IT Hardware\n2025 — 2026  PT JAYAMAS MEDICA INDUSTRI TBK · IT Support\n2024         PLATINUM MEDIA · IT & Admin Internship\n2023 — 2024  PT CERAH MEDIA SMM · Customer Service');break;case'certifications':addTerm('Claude Academy — AI Fluency for Students — Anthropic — 2026\nTerraform on SAP BTP — SAP — 2026\nSAP Business Data Cloud — SAP — 2026\nCyber Security — BSSN — 2026\nNetwork Security Design / Routing — 2025');break;case'education':addTerm('Universitas Terbuka — Sistem Informasi — 2026—NOW\nSMK NU Bandar — TKJ — 2022—2025');break;case'contact':addTerm('Email    muhhazmi69@gmail.com\nLinkedIn linkedin.com/in/muhammadhazmii');break;case'ping isp':addTerm('PING ISP\n64 bytes from gateway: time=12.4 ms\n64 bytes from gateway: time=11.8 ms\n64 bytes from gateway: time=12.0 ms\nstatus: reachable','term-accent');break;case'show vlan':addTerm('VLAN TABLE\n\n10   USER\n20   ADMIN / MANAGEMENT\n30   CCTV\n\nreference segmentation model — not a live config');break;case'show interfaces':addTerm('INTERFACES\n\nWAN      up\nLAN      up\nTRUNK    up\nWIFI     up\nNAS      up');break;case'traceroute core':addTerm('TRACEROUTE TO CORE\n1  ISP / WAN\n2  MikroTik\n3  Core Switch\n4  VLAN / access layer');break;case'gui':setMode('gui');break;case'clear':terminalOutput.innerHTML='';bootTerminal();break;default:addTerm(`command not found: ${tEsc(raw)}\nType 'help' for available commands`,'term-dim')}}
function bootTerminal(){terminalOutput.innerHTML='';addTerm('hazmi@portfolio — interactive shell','term-accent');addTerm('IT / Network Operations portfolio console','term-dim');addTerm('Type “help” to explore the environment.')}terminalForm.addEventListener('submit',e=>{e.preventDefault();const v=terminalInput.value.trim();if(!v)return;cmdHistory.push(v);cmdIndex=cmdHistory.length;terminalCommand(v);terminalInput.value=''});terminalInput.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();if(cmdIndex>0){cmdIndex--;terminalInput.value=cmdHistory[cmdIndex]||''}}else if(e.key==='ArrowDown'){e.preventDefault();if(cmdIndex<cmdHistory.length-1){cmdIndex++;terminalInput.value=cmdHistory[cmdIndex]||''}else{cmdIndex=cmdHistory.length;terminalInput.value=''}}else if(e.key==='Tab'){e.preventDefault();const list=['help','about','live','stack','work','architecture','experience','certifications','education','contact','gui','clear','ping isp','show vlan','show interfaces','traceroute core'];const match=list.find(x=>x.startsWith(terminalInput.value.toLowerCase()));if(match)terminalInput.value=match}});$$('[data-cmd]').forEach(b=>b.addEventListener('click',()=>{terminalInput.value=b.dataset.cmd;terminalForm.requestSubmit()}));bootTerminal();
