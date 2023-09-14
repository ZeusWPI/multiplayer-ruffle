# Single-keyboard, multi-player Flash games; now over the network!

Remember, way back, when Flash games were all the hype, and you had a friend come over to play a game together? You'd share the same keyboard, with one of you controlling a character with the arrow keys, and the other controlling their character with the WASD keys. Now, thanks to [Ruffle](https://ruffle.rs/) (a Flash emulator) and modern browser technology, you can play those games over the internet!

## Sounds great, do you have a demo?

Yes: https://multiplayer-ruffle-demo.zeus.gent/

## How does it work?

One player, Alice, is the host: she will have the game running in Ruffle, and will stream a videostream of the game to Bob (the guest). Bob will send his keyboard events to Alice; these are then injected back into the game. Thanks to WebRTC, this can be entirely done in a peer-to-peer fashion: we don't need a game server. This demo runs entirely in the browser.

## Future features

At the moment, the game is playable, but some features aren't implemented yet.

- [ ] The layout looks pretty bad; I'm not a frontend developer
- [ ] Selecting games: at the moment, "Tank Trouble" is hardcoded, but this can be swapped out easily.
- [ ] Lobby & matchmaking (we'll need a small backend for this)
    - At the moment, the guest must send their ID out-of-band to the host
    - A lobby system could be implemented, where guests send their ID to a backend server, and hosts request a guest ID
    - Risk with this approach: this lobby-server approach would make it easy for an attacker to obtain guest IDs, with which they could stream arbitrary video to guests.
- [ ] Optimize video for latency
- [ ] Compensate lag: at the moment, the host has an advantage over the host with regards to latency: they immediately see the game, and their input arrives faster. To make it fair, the host view and input can be artificially delayed, until the guest and host have the same video and input latency.
- [ ] Sound: the game sound is not transmitted to the guest yet
