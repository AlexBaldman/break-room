import test from 'node:test';
import assert from 'node:assert/strict';
import {ball,step,strike,rack,moving} from '../physics.js';

test('equal mass collision transfers forward velocity',()=>{
  const a=ball(0,100,200),b=ball(1,118,200);a.vx=300;
  step([a,b],1/240);
  assert.ok(b.vx>0,'object ball should leave the collision');
  assert.ok(a.vx<b.vx,'cue ball should lose forward speed');
});
test('rail reflects and damps speed',()=>{
  const a=ball(1,9.5,200);a.vx=-240;
  const events=step([a],1/240);
  assert.ok(a.vx>0);assert.ok(a.vx<240);assert.ok(events.some(e=>e.type==='rail'));
});
test('pocket sinks a ball and stops it',()=>{
  const a=ball(1,10,10);a.vx=-240;a.vy=-240;
  const events=step([a],1/60);
  assert.equal(a.sunk,true);assert.equal(a.vx,0);assert.ok(events.some(e=>e.type==='pocket'));
});
test('strike starts a rack shot and rolling detects motion',()=>{
  const balls=rack();assert.equal(balls.length,16);assert.equal(strike(balls,0,.5),true);assert.equal(moving(balls),true);
});
