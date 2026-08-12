const root=document.documentElement;
const panels=[...document.querySelectorAll('[data-panel]')];
const railButtons=[...document.querySelectorAll('.section-rail [data-go]')];
const goButtons=[...document.querySelectorAll('[data-go]')];
const modeButtons=[...document.querySelectorAll('[data-mode-button]')];
const progress=document.querySelector('[data-progress]');
const currentLabel=document.querySelector('[data-current]');
const footerMode=document.querySelector('[data-footer-mode]');
const modeStamp=document.querySelector('[data-mode-stamp]');
const terminal=document.querySelector('[data-terminal]');
const terminalInput=document.querySelector('[data-terminal-input]');
const terminalOutput=document.querySelector('[data-terminal-output]');
const terminalForm=document.querySelector('[data-terminal-form]');
const terminalPrompt=document.querySelector('[data-prompt]');
const terminalMode=document.querySelector('[data-terminal-mode]');
const entryVectorLink=document.querySelector('[data-entryvector-link]');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let savedMode='red';
try{const stored=localStorage.getItem('jb-purple-mode');savedMode=['red','purple','blue'].includes(stored)?stored:'red'}catch(error){savedMode='red'}
let mode=savedMode;
let current=0;
let transitioning=false;
let wheelTotal=0;
let wheelTimer;
let touchY=0;
let commandHistory=[];
let historyIndex=0;

// Keeps the EntryVector placeholder inert until its hosted URL replaces href="#" in index.html.
entryVectorLink?.addEventListener('click',event=>{if(entryVectorLink.getAttribute('href')==='#')event.preventDefault()});

function applyMode(next,announce=true){
  if(!['red','purple','blue'].includes(next))return;
  mode=next;
  root.dataset.mode=mode;
  root.classList.add('is-switching');
  document.querySelectorAll('[data-red][data-blue]').forEach(el=>{el.textContent=el.dataset[mode]||el.dataset.red});
  modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modeButton===mode)));
  footerMode.textContent=`${mode.toUpperCase()} TEAM`;
  modeStamp.textContent=mode.toUpperCase();
  terminalMode.textContent=`${mode.toUpperCase()} CHANNEL`;
  terminalPrompt.textContent=`${mode}@purple:~$`;
  try{localStorage.setItem('jb-purple-mode',mode)}catch(error){/* File previews may block storage; mode still works for this visit. */}
  setTimeout(()=>root.classList.remove('is-switching'),reduceMotion?20:580);
  if(announce)addLine(`Perspective shifted to ${mode.toUpperCase()} TEAM. Content and telemetry synchronized.`,'success');
}

function setPanel(next,direction=1){
  next=Math.max(0,Math.min(panels.length-1,next));
  if(next===current||transitioning)return;
  transitioning=true;
  const old=panels[current];
  const incoming=panels[next];
  panels.forEach(panel=>panel.classList.toggle('reverse',direction<0));
  old.classList.remove('is-active');old.classList.add('was-active');old.setAttribute('aria-hidden','true');
  incoming.classList.remove('was-active');incoming.classList.add('is-active');incoming.removeAttribute('aria-hidden');
  current=next;
  railButtons.forEach((button,index)=>{button.classList.toggle('is-active',index===current);if(index===current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
  progress.style.width=`${(current+1)/panels.length*100}%`;
  currentLabel.textContent=String(current+1).padStart(2,'0');
  window.history.replaceState(null,'',`#${incoming.id}`);
  setTimeout(()=>{panels.forEach(panel=>{if(panel!==incoming)panel.classList.remove('was-active')});transitioning=false},reduceMotion?20:850);
}

function panelCanScroll(panel,direction){if(panel.scrollHeight<=panel.clientHeight+2)return false;return direction>0?panel.scrollTop+panel.clientHeight<panel.scrollHeight-2:panel.scrollTop>2}
addEventListener('wheel',event=>{if(terminal.open||transitioning)return;const direction=Math.sign(event.deltaY);if(panelCanScroll(panels[current],direction))return;event.preventDefault();wheelTotal+=event.deltaY;clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheelTotal=0,180);if(Math.abs(wheelTotal)<42)return;const move=wheelTotal>0?1:-1;wheelTotal=0;setPanel(current+move,move)},{passive:false});
addEventListener('touchstart',event=>touchY=event.changedTouches[0].clientY,{passive:true});
addEventListener('touchend',event=>{if(terminal.open||transitioning)return;const delta=touchY-event.changedTouches[0].clientY;if(Math.abs(delta)<48)return;const direction=delta>0?1:-1;if(!panelCanScroll(panels[current],direction))setPanel(current+direction,direction)},{passive:true});
goButtons.forEach(button=>button.addEventListener('click',event=>{event.preventDefault();const next=Number(button.dataset.go);setPanel(next,next>current?1:-1)}));
modeButtons.forEach(button=>button.addEventListener('click',()=>applyMode(button.dataset.modeButton)));

function openTerminal(){if(!terminal.open)terminal.showModal();setTimeout(()=>terminalInput.focus(),30)}
function closeTerminal(){if(terminal.open)terminal.close()}
function addLine(text='',className=''){const line=document.createElement('p');line.className=className;line.textContent=text;terminalOutput.appendChild(line);terminalOutput.scrollTop=terminalOutput.scrollHeight}
function addTable(rows){rows.forEach(([key,value])=>{const line=document.createElement('p');line.className='table';const label=document.createElement('b');label.textContent=key;line.append(label,document.createTextNode(value));terminalOutput.appendChild(line)});terminalOutput.scrollTop=terminalOutput.scrollHeight}
const phases={identity:0,doctrine:1,capabilities:2,operations:3,credentials:4,connect:5};
const commands=['help','mode red','mode purple','mode blue','status','whoami','compare','matrix','goto','resume','contact','clear','exit'];
function runCommand(raw){const command=raw.trim();if(!command)return;addLine(command,'command');const [base,...parts]=command.toLowerCase().split(/\s+/);const arg=parts.join(' ');switch(base){
  case'help':addTable([['mode <red|purple|blue>','switch the entire portfolio perspective'],['compare','show the purple-team feedback loop'],['matrix','compare current offensive and defensive strengths'],['status','inspect candidate and interface status'],['whoami','show active operating identity'],['goto <stage>','identity | doctrine | capabilities | operations | credentials | connect'],['resume','download résumé PDF'],['contact','reveal contact vectors'],['clear','clear console'],['exit','close console']]);break;
  case'mode':if(['red','purple','blue'].includes(arg))applyMode(arg);else addLine('Usage: mode <red|purple|blue>','error');break;
  case'whoami':addLine(`${mode}_operator@purple_bridge // Jonathan Buford candidate profile`,'success');break;
  case'status':addTable([['SUBJECT','Jonathan Buford'],['MODE',`${mode.toUpperCase()} TEAM`],['PURPLE LINK','SYNCHRONIZED'],['LOCATION','Detroit, Michigan'],['CLEARANCE','Secret'],['AVAILABILITY','OPEN TO OPPORTUNITIES']]);break;
  case'compare':addLine('PURPLE TEAM FEEDBACK LOOP','success');addLine('RED tests assumptions → BLUE measures visibility → RED refines simulation → BLUE improves controls → shared risk decreases.');break;
  case'matrix':addTable([['VULNERABILITIES','discover ↔ prioritize'],['NETWORKS','recon ↔ monitor'],['SYSTEMS','enumerate ↔ harden'],['CONTROLS','test ↔ validate'],['INCIDENTS','document ↔ respond'],['RISK','demonstrate impact ↔ govern exposure']]);break;
  case'goto':if(arg in phases){closeTerminal();setTimeout(()=>setPanel(phases[arg],phases[arg]>current?1:-1),60)}else addLine('Unknown stage. Type help.','error');break;
  case'resume':addLine('Preparing résumé payload...','success');setTimeout(()=>{const link=document.createElement('a');link.href='assets/May Resumes Jonathan Buford.pdf';link.download='Jonathan Buford Resume.pdf';link.click()},200);break;
  case'contact':addLine('EMAIL: jpbuford30@yahoo.com\nVOICE: 313.209.1550','success');break;
  case'clear':terminalOutput.replaceChildren();break;
  case'exit':closeTerminal();break;
  default:addLine(`${base}: command not found. Type "help".`,'error')
}}
document.querySelector('[data-terminal-open]').addEventListener('click',openTerminal);
document.querySelector('[data-terminal-close]').addEventListener('click',closeTerminal);
terminal.addEventListener('click',event=>{if(event.target===terminal)closeTerminal()});
terminalForm.addEventListener('submit',event=>{event.preventDefault();const value=terminalInput.value;terminalInput.value='';if(value.trim()){commandHistory.push(value.trim());historyIndex=commandHistory.length}runCommand(value)});
terminalInput.addEventListener('keydown',event=>{if(event.key==='ArrowUp'){event.preventDefault();historyIndex=Math.max(0,historyIndex-1);terminalInput.value=commandHistory[historyIndex]||''}if(event.key==='ArrowDown'){event.preventDefault();historyIndex=Math.min(commandHistory.length,historyIndex+1);terminalInput.value=commandHistory[historyIndex]||''}if(event.key==='Tab'){event.preventDefault();const matches=commands.filter(command=>command.startsWith(terminalInput.value.toLowerCase()));if(matches.length===1)terminalInput.value=matches[0];else if(matches.length>1)addLine(matches.join('    '),'dim')}});
addEventListener('keydown',event=>{if(event.key==='Escape'&&terminal.open){closeTerminal();return}if(event.ctrlKey&&event.key==='`'){event.preventDefault();terminal.open?closeTerminal():openTerminal();return}if(terminal.open)return;if(event.key.toLowerCase()==='r')applyMode('red');if(event.key.toLowerCase()==='p')applyMode('purple');if(event.key.toLowerCase()==='b')applyMode('blue');if(['ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();setPanel(current+1,1)}if(['ArrowUp','PageUp'].includes(event.key)){event.preventDefault();setPanel(current-1,-1)}if(event.key==='Home')setPanel(0,-1);if(event.key==='End')setPanel(panels.length-1,1)});
const hashIndex=panels.findIndex(panel=>`#${panel.id}`===location.hash);if(hashIndex>0){panels[0].classList.remove('is-active');panels[0].setAttribute('aria-hidden','true');panels[hashIndex].classList.add('is-active');panels[hashIndex].removeAttribute('aria-hidden');current=hashIndex}
railButtons.forEach((button,index)=>button.classList.toggle('is-active',index===current));progress.style.width=`${(current+1)/panels.length*100}%`;currentLabel.textContent=String(current+1).padStart(2,'0');applyMode(mode,false);
