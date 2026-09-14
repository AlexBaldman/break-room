import {rack,moving,strike,step,placeCue} from './physics.js';
export const groupOf=id=>id===0||id===8?null:id<8?'solids':'stripes';
export class Match {
  constructor(mode='practice') {
    this.mode=mode;this.balls=rack();this.turn=0;this.groups=[null,null];this.shots=0;
    this.phase='aim';this.hand=false;this.winner=null;this.log=[];this.events=[];
    this.message='The table is yours. Make the break.';this.replay=null;
  }
  remaining(turn=this.turn) {return this.balls.filter(b=>!b.sunk&&groupOf(b.id)===this.groups[turn]&&b.id!==0&&b.id!==8);}
  targets(turn=this.turn) {
    if(!this.groups[turn])return this.balls.filter(b=>!b.sunk&&groupOf(b.id));
    const left=this.remaining(turn);return left.length?left:this.balls.filter(b=>b.id===8&&!b.sunk);
  }
  shoot(angle,power,spin=0,follow=0) {
    if(this.phase!=='aim'||this.hand||moving(this.balls))return false;
    const before=structuredClone(this.balls);
    if(!strike(this.balls,angle,power,spin,follow))return false;
    this.replay={balls:before,angle,power,spin,follow};
    this.shot={first:null,rail:false,pots:[],allowed:this.targets().map(b=>b.id),break:this.shots===0};
    this.shots++;this.phase='rolling';this.events.push({type:'shot',power});this.message='Let it roll.';return true;
  }
  tick() {
    if(this.phase!=='rolling')return;
    const events=step(this.balls);this.events.push(...events);
    for(const e of events) {
      if(e.type==='collision' && this.shot.first===null && (e.a===0||e.b===0))this.shot.first=e.a||e.b;
      if(e.type==='rail' && this.shot.first!==null)this.shot.rail=true;
      if(e.type==='pocket')this.shot.pots.push(e.ball);
    }
    if(!moving(this.balls))this.finish();
  }
  finish() {
    const s=this.shot,practice=this.mode==='practice',scratch=s.pots.includes(0);
    let foul=scratch?'Scratch.':s.first===null?'No object ball hit.':!s.allowed.includes(s.first)?'Wrong ball first.':!s.rail&&!s.pots.length?'No cushion after contact.':null;
    if(practice)foul=scratch?'Scratch.':null;
    if(s.pots.includes(8)&&!practice) {
      if(s.break){this.spotEight();this.message='Eight on the break — spotted.';}
      else {this.winner=!foul&&s.allowed.includes(8)?this.turn:1-this.turn;this.phase='over';this.message=`${this.name(this.winner)} wins${this.winner!==this.turn?' — early eight or foul on the eight':''}.`;this.events.push({type:'match:won',winner:this.winner});return;}
    }
    if(!practice && !foul && !this.groups[0] && !s.break) {
      const first=s.pots.find(id=>groupOf(id));
      if(first){this.groups[this.turn]=groupOf(first);this.groups[1-this.turn]=groupOf(first)==='solids'?'stripes':'solids';}
    }
    const legalPot=s.pots.some(id=>groupOf(id)&&(!this.groups[this.turn]||groupOf(id)===this.groups[this.turn]));
    const shooter=this.name(this.turn);
    if(!practice&&(foul||!legalPot))this.turn=1-this.turn;
    this.hand=!!foul;this.phase='aim';
    if(this.hand){const cue=this.balls.find(b=>b.id===0);cue.sunk=true;cue.vx=cue.vy=0;}
    this.message=foul?`${foul} ${this.name()} has ball in hand.`:legalPot?`${shooter} pockets ${s.pots.filter(Boolean).join(', ')}. Keep shooting.`:`${this.name()} at the table.`;
    this.log.unshift(this.message);this.log=this.log.slice(0,12);
    if(practice && this.balls.filter(b=>b.id&&!b.sunk).length===0){this.phase='over';this.winner=0;this.message=`Table cleared in ${this.shots} shots.`;this.events.push({type:'match:won',winner:0});}
    this.events.push({type:'shot:settled',foul,pots:s.pots});
  }
  name(turn=this.turn){return turn===0?'Alex':this.mode==='cpu'?'The house':'Player two';}
  place(x,y){if(!this.hand||!placeCue(this.balls,x,y))return false;this.hand=false;this.message=`${this.name()}: line up your shot.`;return true;}
  spotEight(){const b=this.balls.find(b=>b.id===8);for(let x=560;x<780;x+=19){if(!this.balls.some(o=>o!==b&&!o.sunk&&Math.hypot(o.x-x,o.y-200)<19)){Object.assign(b,{x,y:200,vx:0,vy:0,sunk:false});break;}}}
  drain(){const events=this.events;this.events=[];return events;}
}
