# Break Room — deep improvement sprint

The requested destination is a compelling pixel-art pool game: a navigable hall, Alex and Archimedes with authored sprites, satisfying physical shots, complete matches, controller and mobile play, and uINVERSE continuity. A timing-card prototype does not satisfy it.

## Source of direction

uINVERSE Platform Thesis (2026-08-08): world model → semantic events → experience director → projection. Keep game truth independent of rendering; preserve identity and history across lenses; make capabilities into places and rituals. Use the hall, table, jukebox and scorebook as functional places. Do not claim a connection to other worlds that has not been implemented.

## Execution

1. Replace the score timer with deterministic fixed-step billiards: equal-mass collisions, rails, six pockets, friction, cue spin, ball placement, shot events and replay.
2. Implement documented house 8-ball rules, practice, local two-player and a computer opponent; verify fouls, turn changes, groups, wins/losses, restart and return to hall.
3. Integrate the actual existing sprite sheet and align room colliders to the room art; find the user's original likeness sheets before claiming faithful Alex/Archie identity.
4. Build a coherent warm-brass/teal pixel presentation, table aiming and power controls, readable shot feedback, sound, hall interactions and a persistent scorebook.
5. Support keyboard, pointer/touch, and standard gamepad input including disconnect, drift, held-button and focus behavior.
6. Verify simulation and full browser workflows at desktop/mobile sizes, then deploy the verified build to GitHub Pages with visible feedback entry and reproducible tester notes.

## Completion evidence still required

- Physical and rules tests; real browser screenshots and interaction checks.
- Whole playable matches and replay/state consistency.
- Mobile and multiple browser checks; actual controller hardware remains a separate verification from simulated input.
- Original Alex/Archimedes reference fidelity; current generated sheet is a provisional character design created without those references.
- Public deployment serves the verified revision.

Keep the sprint active until the actual destination is verified. Record limitations honestly.
