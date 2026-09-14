const canvas = document.querySelector('#game'); const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const bg = new Image(); bg.src = 'assets/pool-hall.png';
const keys = new Set(); let score=0, modal=false, power=42, powerDir=1, last=0;
let activeGamepad = null; let previousPadButtons = [];
const player={x:128,y:414,w:18,h:28,dir:1}; const archie={x:171,y:431,w:17,h:15};
const blocks=[{x:250,y:190,w:280,h:105},{x:592,y:294,w:235,h:90},{x:62,y:90,w:155,h:70},{x:748,y:90,w:145,h:72}];
window.addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('gamepadconnected', e => { activeGamepad=e.gamepad.index; document.querySelector('#controller').textContent=`${e.gamepad.id.slice(0,22)} · connected`; });
window.addEventListener('gamepaddisconnected', e => { if(activeGamepad===e.gamepad.index) activeGamepad=null; document.querySelector('#controller').textContent='gamepad disconnected'; });
function readGamepad(){
  if(!navigator.getGamepads) return {dx:0,dy:0,pressed:false};
  const pads=navigator.getGamepads(); const pad=activeGamepad===null ? [...pads].find(Boolean) : pads[activeGamepad];
  if(!pad) return {dx:0,dy:0,pressed:false};
  if(activeGamepad===null){activeGamepad=pad.index;document.querySelector('#controller').textContent=`${pad.id.slice(0,22)} · connected`;}
  const dead=.18; const axis=v=>Math.abs(v)<dead?0:v;
  const dx=axis(pad.axes[0]||0), dy=axis(pad.axes[1]||0);
  const pressed=Boolean(pad.buttons[0]?.pressed && !previousPadButtons[0]);
  previousPadButtons=pad.buttons.map(b=>b.pressed);
  return {dx,dy,pressed};
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function hit(a,b){return a.x<a.x+a.w && a.x+a.w>b.x && a.y<a.y+a.h && a.y+a.h>b.y;}
function blocked(nx,ny){const r={x:nx-9,y:ny-24,w:18,h:24}; return blocks.some(b=>r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y);}
function drawChar(x,y,type,frame){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(2,2);ctx.fillStyle='rgba(3,5,12,.35)';ctx.fillRect(-8,10,16,3);
  if(type==='alex'){ctx.fillStyle='#13192b';ctx.fillRect(-7,-5,14,17);ctx.fillStyle='#ff6c63';ctx.fillRect(-6,-12,12,7);ctx.fillStyle='#f5b98f';ctx.fillRect(-5,-8,10,8);ctx.fillStyle='#26324d';ctx.fillRect(-8,0,5,10);ctx.fillRect(3,0,5,10);ctx.fillStyle='#79e4ce';ctx.fillRect(-4,1,8,3);ctx.fillStyle='#e6c68e';ctx.fillRect(7,-4,2,18);ctx.fillStyle='#172036';ctx.fillRect(-6,11,5,3);ctx.fillRect(1,11,5,3);}
  else {ctx.fillStyle='#e58a57';ctx.fillRect(-8,-5,16,10);ctx.fillStyle='#f5c991';ctx.fillRect(-6,-8,12,9);ctx.fillStyle='#e58a57';ctx.fillRect(-7,-10,-1+5,5);ctx.fillRect(3,-10,5,5);ctx.fillStyle='#172036';ctx.fillRect(-4,-4,2,2);ctx.fillRect(3,-4,2,2);ctx.fillStyle='#2cdbb0';ctx.fillRect(-7,2,14,3);ctx.fillStyle='#e58a57';ctx.fillRect(-7,5,4,7);ctx.fillRect(3,5,4,7);}
  ctx.restore(); }
function draw(){ctx.clearRect(0,0,960,540); if(bg.complete)ctx.drawImage(bg,0,0,960,540); else {ctx.fillStyle='#182b38';ctx.fillRect(0,0,960,540);}
  // reinforce a playable floor plane and object silhouettes over generated key art
  ctx.fillStyle='rgba(9,15,28,.18)';ctx.fillRect(0,330,960,210);
  ctx.fillStyle='#14283b';ctx.fillRect(250,190,280,105);ctx.fillStyle='#1f9c87';ctx.fillRect(260,200,260,84);ctx.strokeStyle='#e3b677';ctx.lineWidth=5;ctx.strokeRect(248,188,284,109);
  ctx.fillStyle='#14283b';ctx.fillRect(592,294,235,90);ctx.fillStyle='#267d71';ctx.fillRect(602,303,215,72);ctx.strokeStyle='#e3b677';ctx.strokeRect(590,292,239,94);
  drawChar(archie.x,archie.y,'archie',0); drawChar(player.x,player.y,'alex',0);
  if(!modal && Math.hypot(player.x-390,player.y-320)<145){ctx.fillStyle='#fff0c9';ctx.font='12px monospace';ctx.fillText('SPACE  PLAY',player.x-45,player.y-38);}
  requestAnimationFrame(loop);
}
function loop(t){const dt=Math.min((t-last)/16.67,2);last=t;const pad=readGamepad();if(!modal){let dx=0,dy=0;if(keys.has('w')||keys.has('arrowup'))dy-=1;if(keys.has('s')||keys.has('arrowdown'))dy+=1;if(keys.has('a')||keys.has('arrowleft'))dx-=1;if(keys.has('d')||keys.has('arrowright'))dx+=1;dx+=pad.dx;dy+=pad.dy;const mag=Math.hypot(dx,dy);if(mag>1){dx/=mag;dy/=mag;}const sp=2.4*dt;if(dx||dy){const nx=clamp(player.x+dx*sp,24,936),ny=clamp(player.y+dy*sp,72,510);if(!blocked(nx,player.y))player.x=nx;if(!blocked(player.x,ny))player.y=ny;player.dir=dx||player.dir;}archie.x+=(player.x-38-archie.x)*.025*dt;archie.y+=(player.y+10-archie.y)*.025*dt;if((keys.has(' ')||pad.pressed)&&Math.hypot(player.x-390,player.y-320)<145)openTable();} else {power+=powerDir*1.8*dt;if(power>96||power<4)powerDir*=-1;document.querySelector('#power').style.width=power+'%';if(pad.pressed)takeShot();} draw();}
function takeShot(){score+=Math.round(power);document.querySelector('#score').textContent=score;document.querySelector('#status').textContent='purring · nice break';document.querySelector('#shot-copy').textContent='Shot made! Press A / Space for another break.';}
function openTable(){modal=true;document.querySelector('#modal').classList.add('open');document.querySelector('#hint').style.display='none';}
document.querySelector('#close').onclick=()=>{modal=false;document.querySelector('#modal').classList.remove('open');document.querySelector('#hint').style.display='block';};
document.querySelector('#modal').addEventListener('keydown',e=>{});
document.querySelector('#modal').onclick=e=>{if(e.target===document.querySelector('#modal'))document.querySelector('#close').click();};
window.addEventListener('keydown',e=>{if(modal&&e.key===' ')takeShot();});
bg.onload=()=>draw(); draw();
