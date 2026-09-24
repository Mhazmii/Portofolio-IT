const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
// Theme (dark/light) — persisted, defaults to visitor's OS preference.
(function initTheme(){
  const saved=localStorage.getItem('hz-theme');
  const theme=saved||'light';
  document.documentElement.setAttribute('data-theme',theme);
})();
function toggleTheme(){
  const next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem('hz-theme',next);
  $('meta[name="theme-color"]')?.setAttribute('content',next==='light'?'#f7f6f3':'#131316');
}
$('#themeToggle')?.addEventListener('click',toggleTheme);
const guiMode=$('#guiMode'), terminalMode=$('#terminalMode'), transition=$('#transitionLayer');
let currentMode='gui';
function setMode(mode,instant=false){if(mode===currentMode&&!instant)return;currentMode=mode;const apply=()=>{guiMode.style.display=mode==='gui'?'block':'none';terminalMode.style.display=mode==='terminal'?'block':'none';$$('.mode-switch').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));if(mode==='terminal'){bootTerminal();terminalMode.classList.add('boot-flicker');setTimeout(()=>terminalMode.classList.remove('boot-flicker'),480);setTimeout(()=>$('#terminalInput')?.focus(),60)}else{window.scrollTo({top:0,behavior:'instant'})}};if(instant){apply();return}transition.classList.add('active');setTimeout(apply,280);setTimeout(()=>transition.classList.remove('active'),850)}
$$('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
const navLinks=$('#navLinks');$('#navMenu')?.addEventListener('click',()=>navLinks.classList.toggle('open'));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'});navLinks.classList.remove('open')}));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.12});$$('.reveal').forEach(el=>revealObserver.observe(el));
const sectionEls=$$('main section[id]'), navAnchors=$$('#navLinks a');const navObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navAnchors.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-42% 0px -48% 0px',threshold:0});sectionEls.forEach(s=>navObserver.observe(s));
const progress=$('#scrollProgress');window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max?Math.max(0,Math.min(1,scrollY/max))*100:0}%`},{passive:true});


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

// Tool wall — real brand marks (simpleicons) where they exist, direct high-res icons
// (dashboard-icons / selfhst CDN) for exact brand matches, plus purpose-built field
// icons for non-brand categories (CCTV, Smart Door).
const tools=[
{name:'Windows',short:'WIN',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/windows-11.svg',kind:'OS / ENDPOINT',color:'0078D4',cat:'dev',desc:'Instalasi, konfigurasi, maintenance, dan troubleshooting perangkat Windows.'},
{name:'MikroTik',short:'MT',slug:'mikrotik',kind:'NETWORK',color:'293239',cat:'network',desc:'Router, gateway, routing, bandwidth policy, NAT, LAN/Wi-Fi, dan troubleshooting.',brand:true},
{name:'Cisco',short:'C',slug:'cisco',kind:'NETWORK',color:'1BA0D7',cat:'network',desc:'Konsep switching, VLAN, trunking, interface status, dan network flow.',brand:true},
{name:'Ubiquiti',short:'UI',slug:'ubiquiti',kind:'WIRELESS',color:'0559C9',cat:'network',desc:'Reference ecosystem untuk wireless dan network access point.',brand:true},
{name:'SAP',short:'SAP',slug:'sap',kind:'ERP / SYSTEMS',color:'0FAAFF',cat:'dev',desc:'Support pengguna, pengecekan data, dan penyelesaian kendala operasional SAP.',brand:true},
{name:'Synology',short:'SY',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/synology.svg',kind:'STORAGE',color:'B5B5B5',cat:'hardware',desc:'Monitoring dan support Synology NAS di lingkungan operasional.'},
{name:'Synology File Station',short:'SFS',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/synology-file-station.png',kind:'STORAGE / FILES',color:'FFD34D',cat:'hardware',desc:'Manajemen file, sharing, dan permission melalui Synology File Station.'},
{name:'Wireshark',short:'WS',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/wireshark.png',kind:'NETWORK ANALYSIS',color:'1679A7',cat:'network',desc:'Packet inspection dan analisis konektivitas jaringan.'},
{name:'PuTTY',short:'PT',img:'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/putty.svg',kind:'REMOTE / CLI',color:'F9D14C',cat:'network',desc:'Remote terminal utility untuk akses perangkat jaringan.'},
{name:'VS Code',short:'VS',img:'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/visual-studio-code.svg',kind:'DEV / DOCS',color:'23A8F2',cat:'dev',desc:'Editor untuk dokumentasi, scripting, dan development support.'},
{name:'Git',short:'GIT',slug:'git',kind:'VERSIONING',color:'F05032',cat:'dev',desc:'Version control untuk dokumentasi dan project teknis.',brand:true},
{name:'Linux',short:'LNX',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/linux.svg',kind:'OS / SERVER',color:'FCC624',cat:'dev',desc:'Lingkungan OS dan command-line concepts untuk troubleshooting.'},
{name:'Postman',short:'PM',slug:'postman',kind:'API / TEST',color:'FF6C37',cat:'dev',desc:'API utility untuk test endpoint dan kebutuhan integrasi.',brand:true},
{name:'Python',short:'PY',slug:'python',kind:'SCRIPTING',color:'3776AB',cat:'dev',desc:'Scripting untuk automasi ringan dan problem solving.',brand:true},
{name:'Java',short:'JAVA',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/java.svg',kind:'PROGRAMMING',color:'ED8B00',cat:'dev',desc:'Pengalaman pengembangan aplikasi saat project coding.'},
{name:'C++',short:'C++',slug:'cplusplus',kind:'PROGRAMMING',color:'00599C',cat:'dev',desc:'Pengalaman pengembangan aplikasi saat project coding.',brand:true},
{name:'Claude',short:'AI',slug:'claude',kind:'AI / PRODUCTIVITY',color:'D97757',cat:'productivity',desc:'AI fluency dan workflow assistance pada aktivitas belajar/kerja.',brand:true},
{name:'Microsoft 365',short:'365',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/microsoft-365.svg',kind:'PRODUCTIVITY',color:'5E5CE6',cat:'productivity',desc:'Dokumen, user productivity, dan support operasional.'},
{name:'Notion',short:'NTN',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/notion.svg',kind:'PRODUCTIVITY / DOCS',color:'2F3437',cat:'productivity',desc:'Dokumentasi kerja, knowledge base, dan pencatatan operasional.'},
{name:'Fortinet',short:'FTN',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/fortinet.svg',kind:'NETWORK SECURITY',color:'EE3124',cat:'network',desc:'Firewall dan security appliance untuk perimeter jaringan.'},
{name:'Aruba',short:'ARU',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/aruba.svg',kind:'NETWORK / WIRELESS',color:'FF8300',cat:'network',desc:'Switching dan wireless enterprise untuk konektivitas end-user.'},
{name:'TP-Link',short:'TPL',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tp-link.svg',kind:'NETWORK HARDWARE',color:'4ACBD6',cat:'network',desc:'Perangkat router/switch/AP untuk jaringan kantor dan lapangan.'},
{name:'Tenda',short:'TND',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tenda.svg',kind:'NETWORK HARDWARE',color:'EE1C25',cat:'network',desc:'Perangkat jaringan untuk kebutuhan konektivitas operasional.'},
{name:'Netgear',short:'NTG',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/netgear.svg',kind:'NETWORK HARDWARE',color:'62B0DA',cat:'network',desc:'Router/switch untuk infrastruktur jaringan lokal.'},
{name:'CCTV Support',short:'CAM',icon:'camera',kind:'SECURITY',color:'0891B2',cat:'hardware',desc:'Support CCTV sebagai bagian dari infrastruktur IT.',field:true},
{name:'Smart Door',short:'LOCK',icon:'lock',kind:'ACCESS',color:'A78BFA',cat:'hardware',desc:'Support perangkat smart door dan kebutuhan akses operasional.',field:true},
{name:'Printer / Scanner',short:'I/O',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/printer.svg',kind:'END-USER',color:'F59E0B',cat:'hardware',desc:'Instalasi, troubleshooting, dan support printer/scanner.'},
{name:'Proxmox',short:'PVE',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/proxmox-light.svg',kind:'VIRTUALIZATION',color:'E57000',cat:'dev',desc:'Virtualisasi server — VM/container untuk kebutuhan home lab dan testing.'},
{name:'D-Link',short:'DL',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/d-link.svg',kind:'NETWORK HARDWARE',color:'D91F26',cat:'network',desc:'Perangkat jaringan (switch/router) untuk kebutuhan konektivitas lapangan.'},
{name:'Diagrams.net',short:'DGM',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/diagrams-net.svg',kind:'DOCUMENTATION',color:'F08705',cat:'productivity',desc:'Dokumentasi topologi jaringan dan diagram teknis.'},
{name:'OpenVPN',short:'VPN',img:'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/openvpn.svg',kind:'NETWORK SECURITY',color:'EA7E20',cat:'network',desc:'Konfigurasi remote access VPN untuk koneksi aman ke jaringan internal.'}
];
const toolIcons={
 camera:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 4.5 7.8 6.5H4.5A1.5 1.5 0 0 0 3 8v10a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 18V8a1.5 1.5 0 0 0-1.5-1.5h-3.3L14.9 4.5H9Zm3 5.75a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 2a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V9H6.5A1.5 1.5 0 0 0 5 10.5v9A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 17.5 9H16.5V6.5A4.5 4.5 0 0 0 12 2Zm0 2a2.5 2.5 0 0 1 2.5 2.5V9h-5V6.5A2.5 2.5 0 0 1 12 4Zm0 9.25a1.5 1.5 0 0 1 .75 2.8V17.5a.75.75 0 0 1-1.5 0v-1.45A1.5 1.5 0 0 1 12 13.25Z"/></svg>'
};
const toolCats=[
  {id:'all',label:'All'},
  {id:'network',label:'Network'},
  {id:'hardware',label:'Hardware'},
  {id:'dev',label:'Systems & Dev'},
  {id:'productivity',label:'Productivity & AI'}
];
const toolWall=$('#toolWall'), toolFilters=$('#toolFilters'), toolPopover=$('#toolPopover');
let activeCat='all', visibleTools=tools, activeTile=null;
const workLabels={network:'MikroTik & Network Monitoring',server:'Server Setup',cctv:'CCTV Configuration',printer:'Servis Printer',sapdata:'SAP Input Data Error',laptop:'Servis Laptop'};
function toolLink(t){
  const map={MikroTik:'network',Cisco:'network',Ubiquiti:'network',Wireshark:'network',PuTTY:'network',Fortinet:'network',Aruba:'network','TP-Link':'network',Tenda:'network',Netgear:'network',Synology:'server','Synology File Station':'server','CCTV Support':'cctv','Smart Door':'cctv','Printer / Scanner':'printer',SAP:'sapdata',Windows:'laptop'};
  return map[t.name]||null;
}
function toolVisual(t){
  if(t.field){return `<span class="field-mark" style="--mark:#${t.color}">${toolIcons[t.icon]||''}</span>`}
  const src=t.img?t.img:`https://cdn.simpleicons.org/${t.slug}/${t.color}`;
  return `<span class="brand-wrap" style="--brand:#${t.color}"><img class="brand-mark" src="${src}" alt="${t.name} logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'"><span class="tool-fallback">${t.short}</span></span>`;
}
function renderFilters(){
  if(!toolFilters)return;
  toolFilters.innerHTML='';
  toolCats.forEach(c=>{
    const count=c.id==='all'?tools.length:tools.filter(t=>t.cat===c.id).length;
    if(count===0)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='tool-filter'+(c.id===activeCat?' active':'');
    b.innerHTML=`${c.label}<span>${String(count).padStart(2,'0')}</span>`;
    b.addEventListener('click',()=>{if(activeCat===c.id)return;activeCat=c.id;renderFilters();renderTools()});
    toolFilters.appendChild(b)
  })
}
function renderTools(){
  visibleTools=activeCat==='all'?tools:tools.filter(t=>t.cat===activeCat);
  toolWall.innerHTML='';
  hidePopover();
  visibleTools.forEach((t,i)=>{
    const b=document.createElement('button');
    b.className='tool-tile';
    b.type='button';
    b.setAttribute('aria-label',`${t.name} — ${t.kind}`);
    b.innerHTML=`<div class="tool-icon" style="--brand:#${t.color}">${toolVisual(t)}</div><small>${t.kind}</small><strong>${t.name}</strong>`;
    b.addEventListener('click',()=>{
      if(activeTile===b){hidePopover();return}
      selectTool(b,t)
    });
    toolWall.appendChild(b)
  });
}
function selectTool(tile,t){
  $$('.tool-tile',toolWall).forEach(el=>el.classList.toggle('selected',el===tile));
  activeTile=tile;
  const link=toolLink(t);
  const linkHtml=link?`<button type="button" class="tool-popover-link">Dipakai di workstream ${workLabels[link]} →</button>`:'';
  toolPopover.innerHTML=`<div class="tool-popover-head"><strong>${t.name}</strong><small>${t.kind}</small></div><p>${t.desc}</p>${linkHtml}`;
  if(link){toolPopover.querySelector('.tool-popover-link').addEventListener('click',()=>{hidePopover();$('#work')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$(`.work-action[data-detail="${link}"]`)?.click(),350)})}
  positionPopover(tile);
  toolPopover.classList.add('show');
}
function positionPopover(tile){
  const r=tile.getBoundingClientRect();
  const pw=270, margin=12;
  let left=r.left+r.width/2-pw/2;
  left=Math.max(margin,Math.min(left,innerWidth-pw-margin));
  const popH=toolPopover.offsetHeight||140;
  let placeAbove=r.top-popH-14>8;
  let top=placeAbove?r.top-popH-14:r.bottom+14;
  toolPopover.style.left=left+'px';
  toolPopover.style.top=top+'px';
  toolPopover.classList.toggle('arrow-bottom',placeAbove);
  toolPopover.classList.toggle('arrow-top',!placeAbove);
  toolPopover.style.setProperty('--arrow-x',Math.max(16,Math.min(pw-28,(r.left+r.width/2-left)-6))+'px');
}
function hidePopover(){toolPopover.classList.remove('show');activeTile=null;$$('.tool-tile',toolWall).forEach(el=>el.classList.remove('selected'))}
document.addEventListener('click',e=>{if(activeTile&&!toolPopover.contains(e.target)&&!activeTile.contains(e.target))hidePopover()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePopover()});
window.addEventListener('scroll',()=>{if(activeTile)hidePopover()},{passive:true});
window.addEventListener('resize',()=>{if(activeTile)hidePopover()});
renderFilters();
renderTools();

// Workstream modal / evidence behavior. Evidence file paths are ready for user-uploaded assets.
const workDetails={fo:'Pemasangan dan penyambungan kabel fiber optic 24 core untuk backbone jaringan antar gedung — penggalian jalur, terminasi ODF, splicing, sampai pengukuran redaman.',cctv:'Konfigurasi IP address dan setup kamera CCTV untuk integrasi ke sistem monitoring.',network:'Monitoring koneksi jaringan via MikroTik (Netwatch) dan konfigurasi VLAN pada switch.',server:'Instalasi dan konfigurasi awal server — rack mounting, kabel manajemen, dan koneksi jaringan dasar.',isp:'Aktivasi dan migrasi perpindahan layanan ISP — instalasi ulang koneksi dan pengujian konektivitas.',port:'Konfigurasi port pada perangkat jaringan/firewall untuk kebutuhan akses dan segmentasi.',sappo:'Troubleshooting SAP yang tidak bisa print Purchase Order (PO) — cek printer, driver, spool, dan koneksi ke sistem.',sapdata:'Troubleshooting error SAP saat input data — pengecekan reservation, movement type, dan data transaksi.',qms:'Troubleshooting sistem QMS (document control) — akses login, koneksi ke server lokal, dan kendala pengguna saat membuka dokumen.',printer:'Bongkar dan servis printer — pengecekan cartridge, selang tinta, dan mekanisme print head.',laptop:'Bongkar laptop untuk troubleshooting hardware — pengecekan motherboard, fan, dan komponen internal.',cleaning:'Pembersihan menyeluruh bagian dalam laptop — fan, heatsink, dan komponen dari debu untuk mencegah overheat.',ram:'Upgrade/penggantian RAM pada PC/laptop untuk peningkatan performa.',stb:'Project pribadi root mini server rumahan menggunakan perangkat STB bekas untuk kebutuhan home lab.'};
// Evidence photos per workstream — any number of files, gallery lays out however many exist.
const workEvidence={
 fo:['https://cdn.corenexis.com/f/exsSEsbX6zQ.jpg','https://cdn.corenexis.com/f/HVmJGXzzdTl.jpg','https://cdn.corenexis.com/f/d0N9j33oYvR.jpg','https://cdn.corenexis.com/f/cn4Zsz39ZOd.jpg','https://cdn.corenexis.com/f/5fkY4mrGFQn.jpg','https://cdn.corenexis.com/f/PtVkCU7zZr9.jpg','https://cdn.corenexis.com/f/Li8cVEemW93.jpg'],
 cctv:['https://cdn.corenexis.com/f/ISi8fCIbYgq.jpg','https://cdn.corenexis.com/f/47UefnOxRFS.jpg'],
 network:['https://cdn.corenexis.com/f/BC3SuOibrbc.jpg','https://cdn.corenexis.com/f/ak8kLbpYLUH.jpg'],
 server:['https://cdn.corenexis.com/f/LpT9gxuHaIN.jpg'],
 isp:['https://cdn.corenexis.com/f/pzouCGEetMO.jpeg','https://cdn.corenexis.com/f/2UwKxnAHQfr.jpeg','https://cdn.corenexis.com/f/8Xs8Igj10hW.jpeg'],
 port:['https://cdn.corenexis.com/f/MUt4btbazSJ.jpg'],
 sappo:['https://cdn.corenexis.com/f/yratpygJRkz.jpg'],
 sapdata:['https://cdn.corenexis.com/f/O1Dfq8Qz8JI.jpg'],
 qms:['https://cdn.corenexis.com/f/ZPgQF65uPhl.jpg'],
 printer:['https://cdn.corenexis.com/f/xlGS6moVakL.jpeg'],
 laptop:['https://cdn.corenexis.com/f/RAV2A5omW2f.jpg'],
 cleaning:['https://cdn.corenexis.com/f/Tzup5c1qhOm.jpg'],
 ram:['https://cdn.corenexis.com/f/7GYaMBhYncI.jpg'],
 stb:['https://cdn.corenexis.com/f/zzxXVZ0Zjp4.jpg']
};
const toast=$('#toast');let toastTimer;function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2800)}
function loadEvidenceSlot(src){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=src})}
async function openWorkModal(btn){
  const card=btn.closest('.work-card'),key=btn.dataset.detail;
  $('#workModalTitle').innerHTML=card.querySelector('h3').innerHTML;
  const meta=card.querySelector('.work-meta');
  $('#workModalMeta').textContent=meta?[...meta.querySelectorAll('span')].map(s=>s.textContent).join(' · '):'';
  $('#workModalText').textContent=workDetails[key]||'';
  const gallery=$('#workModalGallery');
  gallery.innerHTML='<div class="work-modal-photo loading"><span>Memuat foto…</span></div>';
  gallery.classList.add('empty');
  $('#workModal').classList.add('show');$('#workModal').setAttribute('aria-hidden','false');
  const paths=workEvidence[key]||[];
  const ok=await Promise.all(paths.map(loadEvidenceSlot));
  const loaded=paths.filter((_,i)=>ok[i]);
  gallery.innerHTML='';
  gallery.classList.toggle('empty',loaded.length===0);
  if(loaded.length===0){gallery.innerHTML='<div class="work-modal-photo empty-note"><span>Belum ada foto evidence untuk workstream ini.</span></div>';return}
  loaded.forEach(src=>{
    const a=document.createElement('a');
    a.href=src;a.target='_blank';a.rel='noreferrer';a.className='work-modal-photo has-image';
    a.innerHTML=`<img src="${src}" alt="Evidence photo">`;
    gallery.appendChild(a)
  })
}
$$('.work-action').forEach(b=>b.addEventListener('click',()=>openWorkModal(b)));
// Work category filters.
const workGrid=$('#workGrid'), workFilters=$('#workFilters');
const workCats=[{id:'all',label:'All'},{id:'project',label:'Project'},{id:'infrastructure',label:'Infrastructure'},{id:'network',label:'Network'},{id:'system',label:'System'},{id:'maintenance',label:'Maintenance'}];
const workCards=$$('.work-card',workGrid);
let activeWorkCat='all';
function renderWorkFilters(){
  if(!workFilters)return;
  workFilters.innerHTML='';
  workCats.forEach(c=>{
    const count=c.id==='all'?workCards.length:workCards.filter(w=>w.dataset.cat===c.id).length;
    if(count===0)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='work-filter'+(c.id===activeWorkCat?' active':'');
    b.innerHTML=`${c.label}<span>${String(count).padStart(2,'0')}</span>`;
    b.addEventListener('click',()=>{if(activeWorkCat===c.id)return;activeWorkCat=c.id;renderWorkFilters();applyWorkFilter()});
    workFilters.appendChild(b)
  })
}
function applyWorkFilter(){workCards.forEach(w=>{w.style.display=(activeWorkCat==='all'||w.dataset.cat===activeWorkCat)?'':'none'})}
renderWorkFilters();applyWorkFilter();

// Hero parallax.
const heroVisual=$('#heroVisual');window.addEventListener('pointermove',e=>{if(innerWidth<900)return;const rx=(e.clientX/innerWidth-.5)*8,ry=(e.clientY/innerHeight-.5)*8;heroVisual.style.transform=`translate3d(${rx}px,${ry}px,0)`},{passive:true});


// Certifications: click opens the uploaded file; add files under certificates/ with the exact paths below.
const creds=[
['AI','Claude Academy: AI Fluency for Students','Anthropic','Agustus 2026',''],
['TF','Getting Started with Terraform on SAP BTP – Course Completion','SAP','Agustus 2026',''],
['SAP','Introducing SAP Business Data Cloud – Course Completion','SAP','Agustus 2026',''],
['CY','Sertifikat Cyber Security','BSSN','Februari 2026',''],
['AI','Boosting AI-Driven Business Transformation','SAP','2025',''],
['BDC','Positioning SAP Business Data Cloud','SAP','2025',''],
['NET','Network Security Design, Installation and Routing Configuration','STMIK WIDYA PRATAMA','April 2025','']
];
const credGrid=$('#credGrid');creds.forEach((c)=>{const a=document.createElement('article');a.className='cred-card';a.innerHTML=`<div class="cred-mark">${c[0]}</div><small>${c[2]} · ${c[3]}</small><strong>${c[1]}</strong><button class="cred-open" data-title="${c[1]}" data-issuer="${c[2]}" data-date="${c[3]}" data-link="${c[4]||''}">View credential ↗</button>`;credGrid.appendChild(a)});

// Modal helpers.
function closeModals(){$$('.modal').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')})}
$$('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModals));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});
function openCredential(btn){
  const {title,issuer,date,link}=btn.dataset;
  $('#credentialTitle').textContent=title;
  $('#credentialText').textContent=`Diterbitkan oleh ${issuer} — ${date}.`;
  const openBtn=$('#credentialOpen');
  if(link){openBtn.href=link;openBtn.style.display='';openBtn.textContent='Open credential'}else{openBtn.style.display='none'}
  $('#credentialModal').classList.add('show');$('#credentialModal').setAttribute('aria-hidden','false')
}
$$('.cred-open').forEach(btn=>btn.addEventListener('click',()=>openCredential(btn)));

// Terminal.
const terminalOutput=$('#terminalOutput'), terminalForm=$('#terminalForm'), terminalInput=$('#terminalInput');let cmdHistory=[],cmdIndex=0,popoverAutoHide;
function tEsc(s){return s.replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function typeLine(el,html,speed=9){
  return new Promise(resolve=>{
    let i=0;
    (function step(){
      if(i>=html.length){el.innerHTML=html;terminalOutput.scrollTop=terminalOutput.scrollHeight;resolve();return}
      i=html[i]==='<'?html.indexOf('>',i)+1:i+1;
      el.innerHTML=html.slice(0,i)+'<span class="caret"></span>';
      terminalOutput.scrollTop=terminalOutput.scrollHeight;
      setTimeout(step,speed)
    })()
  })
}
function addTerm(html,cls='',instant=false){
  const d=document.createElement('div');
  d.className='term-line '+cls;
  terminalOutput.appendChild(d);
  const content=html.replace(/\n/g,'<br>');
  if(instant){d.innerHTML=content;terminalOutput.scrollTop=terminalOutput.scrollHeight;return Promise.resolve()}
  return typeLine(d,content)
}
const helpText=`AVAILABLE COMMANDS\n\n  about           profile summary\n  live            activity timeline\n  stack           field toolkit\n  work            operational work\n  architecture    network topology reference\n  experience      career timeline\n  certifications  credentials\n  education       education\n  contact         contact\n  gui             switch to GUI mode\n  clear           clear terminal\n\nNETWORK COMMANDS\n  ping isp\n  show vlan\n  show interfaces\n  traceroute core`;
async function terminalCommand(raw){const c=raw.trim().toLowerCase();if(!c)return;await addTerm(`hazmi@portfolio:~$ <span class="term-command">${tEsc(raw)}</span>`,'',true);switch(c){case'help':case'?':await addTerm(helpText,'term-accent');break;case'about':await addTerm('Muhammad Hazmi\nIT & Network Operations\nBatang, Jawa Tengah, Indonesia\n\nHardware · Network · Systems · End-user support.');break;case'live':await addTerm('LIVE ACTIVITY\n90-day date-driven activity rail\nIncident markers are representative examples, not company telemetry.','term-accent');break;case'stack':await addTerm('Windows\nMikroTik\nCisco / VLAN / switching concepts\nLAN / Wi-Fi / Access Point\nSAP / Internal ERP\nSynology NAS\nWireshark / PuTTY\nCCTV / Smart Door\nPrinter / Scanner\nIT Asset Management');break;case'work':await addTerm('OPERATIONAL WORK\n\n[01] FO 24 Core Backbone Project\n[02] CCTV Configuration\n[03] MikroTik & Network Monitoring\n[04] Server Setup\n[05] ISP Migration Activation\n[06] Port Configuration\n[07] SAP Print PO Troubleshooting\n[08] SAP Input Data Error\n[09] QMS Troubleshooting\n[10-13] Device Repair (printer/laptop/RAM)\n[14] Home Lab (STB mini server)');break;case'architecture':await addTerm('REFERENCE TOPOLOGY\n\nInternet -> ISP -> MikroTik -> Trunk 802.1Q -> Core Switch\n\nVLAN 10  Management     192.168.10.0/24\nVLAN 20  Staff / Office  192.168.20.0/24\nVLAN 30  WiFi User       192.168.30.0/24\nVLAN 40  CCTV            192.168.40.0/24\nVLAN 50  Server (ERP/NAS) 192.168.50.0/24\nVLAN 60  Warehouse       192.168.60.0/24\nVLAN 70  Guest WiFi       192.168.70.0/24\n\nCore Switch trunks out to per-building switches (AP + PC + CCTV).');break;case'experience':await addTerm('JUL 2026—NOW      YIH YOU FOOTWEAR INDONESIA · IT Hardware\nMEI 2025—APR 2026 PT JAYAMAS MEDICA INDUSTRI TBK · IT\nSEP 2023—OKT 2024 PT CERAH MEDIA SMM · Customer Service (Freelance)\nAGU—OKT 2024      PLATINUM MEDIA · IT & Admin Internship\nJAN—MAR 2024      INSTITUT WIDYA PRATAMA · Magang Project Coding');break;case'certifications':await addTerm('Claude Academy — AI Fluency for Students — Anthropic — 2026\nTerraform on SAP BTP — SAP — 2026\nSAP Business Data Cloud — SAP — 2026\nCyber Security — BSSN — 2026\nBoosting AI-Driven Business Transformation — SAP — 2025\nPositioning SAP Business Data Cloud — SAP — 2025\nNetwork Security Design / Routing — STMIK Widya Pratama — 2025');break;case'education':await addTerm('Universitas Terbuka — Sistem Informasi — 2026—NOW\nSMK NU Bandar — TKJ — 2022—2025');break;case'contact':await addTerm('Email    muhhazmi69@gmail.com\nLinkedIn linkedin.com/in/muhammadhazmii');break;case'ping isp':await addTerm('PING ISP\n64 bytes from gateway: time=12.4 ms\n64 bytes from gateway: time=11.8 ms\n64 bytes from gateway: time=12.0 ms\nstatus: reachable','term-accent');break;case'show vlan':await addTerm('VLAN TABLE\n\n10   USER\n20   ADMIN / MANAGEMENT\n30   CCTV\n\nreference segmentation model — not a live config');break;case'show interfaces':await addTerm('INTERFACES\n\nWAN      up\nLAN      up\nTRUNK    up\nWIFI     up\nNAS      up');break;case'traceroute core':await addTerm('TRACEROUTE TO CORE\n1  ISP / WAN\n2  MikroTik\n3  Core Switch\n4  VLAN / access layer');break;case'gui':setMode('gui');break;case'clear':terminalOutput.innerHTML='';bootTerminal();break;default:await addTerm(`command not found: ${tEsc(raw)}\nType 'help' for available commands`,'term-dim')}}
async function bootTerminal(){terminalOutput.innerHTML='';await addTerm('hazmi@portfolio — interactive shell','term-accent');await addTerm('IT / Network Operations portfolio console','term-dim');await addTerm('Type “help” to explore the environment.')}
terminalForm.addEventListener('submit',e=>{e.preventDefault();const v=terminalInput.value.trim();if(!v)return;cmdHistory.push(v);cmdIndex=cmdHistory.length;terminalCommand(v);terminalInput.value=''});
terminalInput.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();if(cmdIndex>0){cmdIndex--;terminalInput.value=cmdHistory[cmdIndex]||''}}else if(e.key==='ArrowDown'){e.preventDefault();if(cmdIndex<cmdHistory.length-1){cmdIndex++;terminalInput.value=cmdHistory[cmdIndex]||''}else{cmdIndex=cmdHistory.length;terminalInput.value=''}}else if(e.key==='Tab'){e.preventDefault();const list=['help','about','live','stack','work','architecture','experience','certifications','education','contact','gui','clear','ping isp','show vlan','show interfaces','traceroute core'];const match=list.find(x=>x.startsWith(terminalInput.value.toLowerCase()));if(match)terminalInput.value=match}});
const cmdInfo={help:'Menampilkan semua command yang tersedia di terminal ini.',about:'Ringkasan singkat profil dan fokus kerja saya.',work:'Ringkasan pekerjaan operasional & workstream yang saya tangani.',architecture:'Alur jaringan referensi — dari ISP sampai ke VLAN dan perangkat.',stack:'Daftar ringkas tools dan platform yang saya pakai di lapangan.',gui:'Kembali ke tampilan GUI (mode visual normal).'};
function showCmdPopover(el,cmd){
  toolPopover.innerHTML=`<div class="tool-popover-head"><strong>${cmd}</strong><small>TERMINAL CMD</small></div><p>${cmdInfo[cmd]||`Menjalankan command "${cmd}".`}</p>`;
  activeTile=el;
  positionPopover(el);
  toolPopover.classList.add('show');
  clearTimeout(popoverAutoHide);
  popoverAutoHide=setTimeout(hidePopover,3200)
}
$$('[data-cmd]').forEach(b=>b.addEventListener('click',()=>{showCmdPopover(b,b.dataset.cmd);terminalInput.value=b.dataset.cmd;terminalForm.requestSubmit()}));
bootTerminal();
