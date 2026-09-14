# BREAK ROOM

A tiny playable pixel-art pool hall prototype starring Alex and Archimedes.

Open `index.html` in a browser. Walk with WASD or arrow keys, or connect an Xbox/standard gamepad and use the left stick. Approach the central table and press A/Space to enter the table view. In table view, aim with left/right or the stick, tune power with W/S, and shoot with A/Space; B/Escape returns to the hall. The physics simulation is fixed-step and handles ball-ball collisions, cushions, pockets, friction, spin, scratches, and practice-match state.

The environment and character reference art were generated as project assets, then the game layer adds deterministic movement, collision, character silhouettes, and interaction so the hall remains playable even when art is replaced later with production sprite sheets.

## Playtest

Live build: https://alexbaldman.github.io/break-room/

Found a bug or have a playtest note? Open an issue at https://github.com/AlexBaldman/break-room/issues/new/choose and include your browser, device, controller, and what you tried.
