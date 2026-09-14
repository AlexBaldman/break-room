// The world owns the balls. Canvas, audio and controllers only project/events/commands.
export const TABLE = Object.freeze({ width: 800, height: 400, radius: 9, pocket: 19 });
export const POCKETS = [[0,0],[400,-5],[800,0],[0,400],[400,405],[800,400]];
export const STEP = 1 / 240;
export const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
export function ball(id,x,y) { return {id,x,y,vx:0,vy:0,spin:0,follow:0,sunk:false}; }
export function rack() {
  const balls=[ball(0,200,200)];
  // Eight in the middle; back corners in opposite groups.
  const order=[1,9,2,10,8,3,4,11,5,12,6,13,7,14,15];
  let n=0;
  for(let row=0;row<5;row++) for(let col=0;col<=row;col++)
    balls.push(ball(order[n++],560+row*15.8,200+(col-row/2)*18.25));
  return balls;
}
export function moving(balls) { return balls.some(b=>!b.sunk && Math.hypot(b.vx,b.vy)>0); }
export function strike(balls,angle,power,spin=0,follow=0) {
  const cue=balls.find(b=>b.id===0);
  if(!cue || cue.sunk || moving(balls)) return false;
  const speed=120+clamp(power,0,1)*1080;
  cue.vx=Math.cos(angle)*speed; cue.vy=Math.sin(angle)*speed;
  cue.spin=clamp(spin,-1,1)*speed*.2; cue.follow=clamp(follow,-1,1)*speed*.35;
  return true;
}
export function legalPosition(balls,x,y) {
  const r=TABLE.radius;
  return x>=r && x<=800-r && y>=r && y<=400-r &&
    !POCKETS.some(([px,py])=>Math.hypot(x-px,y-py)<TABLE.pocket+2) &&
    !balls.some(b=>b.id && !b.sunk && Math.hypot(x-b.x,y-b.y)<r*2+.5);
}
export function placeCue(balls,x,y) {
  if(moving(balls)||!legalPosition(balls,x,y)) return false;
  Object.assign(balls.find(b=>b.id===0),{x,y,vx:0,vy:0,spin:0,follow:0,sunk:false});return true;
}
export function step(balls,dt=STEP) {
  const events=[]; const r=TABLE.radius;
  for(const b of balls) {
    if(b.sunk) continue;
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    const pocket=POCKETS.findIndex(([x,y])=>Math.hypot(b.x-x,b.y-y)<TABLE.pocket);
    if(pocket>=0) {b.sunk=true;b.vx=b.vy=b.spin=b.follow=0;events.push({type:'pocket',ball:b.id,pocket});continue;}
    // Open pocket mouths; cushion segments end before each jaw.
    const topGap=b.x<24 || b.x>776 || Math.abs(b.x-400)<22;
    const sideGap=b.y<24 || b.y>376;
    let rail=false;
    if(!sideGap && (b.x<r || b.x>800-r)) {
      b.x=clamp(b.x,r,800-r); b.vx=(b.x===r?1:-1)*Math.abs(b.vx)*.82;
      b.vy+=b.spin*(b.x===r?1:-1)*.25;rail=true;
    }
    if(!topGap && (b.y<r || b.y>400-r)) {
      b.y=clamp(b.y,r,400-r); b.vy=(b.y===r?1:-1)*Math.abs(b.vy)*.82;
      b.vx+=b.spin*(b.y===r?-1:1)*.25;rail=true;
    }
    // Rounded jaws keep near misses in the bed instead of leaking out.
    for(const [jx,jy] of [[24,0],[376,0],[424,0],[776,0],[24,400],[376,400],[424,400],[776,400],[0,24],[0,376],[800,24],[800,376]]) {
      let dx=b.x-jx,dy=b.y-jy,d=Math.hypot(dx,dy);
      if(d<r+3 && d>0) {
        const nx=dx/d,ny=dy/d,v=b.vx*nx+b.vy*ny;
        b.x=jx+nx*(r+3);b.y=jy+ny*(r+3);
        if(v<0) {b.vx-=1.75*v*nx;b.vy-=1.75*v*ny;rail=true;}
      }
    }
    if(b.x < -r || b.x>800+r || b.y < -r || b.y>400+r) {
      // Balls that crossed a pocket mouth are captured by that nearest pocket.
      const p=POCKETS.reduce((best,p,i)=>Math.hypot(b.x-p[0],b.y-p[1])<Math.hypot(b.x-POCKETS[best][0],b.y-POCKETS[best][1])?i:best,0);
      b.sunk=true;b.vx=b.vy=0;events.push({type:'pocket',ball:b.id,pocket:p});continue;
    }
    if(rail){events.push({type:'rail',ball:b.id,speed:Math.hypot(b.vx,b.vy)});b.spin*=.6;}
  }
  for(let i=0;i<balls.length;i++) for(let j=i+1;j<balls.length;j++) {
    const a=balls[i],b=balls[j]; if(a.sunk||b.sunk)continue;
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>=r*2) continue;
    const nx=d?dx/d:1,ny=d?dy/d:0,overlap=(r*2-d)/2+.001;
    a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
    const speed=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
    if(speed<=0)continue;
    const impulse=speed*.985;
    a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;
    const cue=a.id===0?a:b.id===0?b:null;
    if(cue && cue.follow) {
      const sign=cue===a?1:-1;
      cue.vx+=nx*sign*cue.follow;cue.vy+=ny*sign*cue.follow;cue.follow=0;
    }
    events.push({type:'collision',a:a.id,b:b.id,speed});
  }
  for(const b of balls) {
    if(b.sunk)continue;
    const speed=Math.hypot(b.vx,b.vy),next=Math.max(0,speed-48*dt);
    if(next<3){b.vx=b.vy=0;}else{b.vx*=next/speed;b.vy*=next/speed;}
    b.spin*=Math.exp(-1.5*dt);b.follow*=Math.exp(-.8*dt);
  }
  return events;
}
