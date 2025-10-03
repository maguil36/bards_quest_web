# Switch

A small top‑down character adventure that lives under public/games/switch. You wander a simple world, talk to the other personas, and "switch" into them over time. Each persona has a color theme and a musical motif. Finishing all cross‑persona conversations unlocks a final glitch ending.

Play it at /games/switch/ (served from public/games/switch/index.html).

## Controls
- Move: WASD or Arrow Keys
- Interact / advance dialogue: Space
- Options: Gear button (top‑right). Escape closes open windows and can open Options when nothing else is open.

## Objective & Progression
- You start as Alexis. The remaining seven personas exist in the world as NPCs.
- Talk to someone once to unlock them as a playable character (Victor never pre‑unlocks this way; see Final character below).
- After conversations, a prompt may offer to switch into the last person you talked to. If you accept, you become them, and your previous self remains in the world at your old position as an NPC (a "ghost"), so the world gradually fills with characters you’ve inhabited.
- Conversations are tracked per "speaker -> target" pair. For non‑final characters there are 7 speakers × 7 targets = 49 total interactions to finish the game’s core objective.

Final character (Victor)
- Victor is the final persona and never unlocks early.
- To be allowed to switch to Victor you must:
  1) Complete all 49 non‑final cross interactions (7 speakers × 7 targets).
  2) Have just spoken to Victor as your current character (the last conversation you finished must be with Victor).
- Switching to Victor triggers the glitch ending sequence.

## Ending: Glitch sequence
- When you accept the prompt to switch to Victor (after meeting the conditions), the ending begins immediately.
- Victor’s music plays continuously throughout the glitch sequence.
- The screen simulates a failing digital TV signal:
  - The image becomes heavily pixelated and jitters.
  - Several horizontal slices shift left/right, creating digital tearing.
  - A subset of pixels “stick” in place (they freeze and don’t update) while the rest of the image moves around them.
  - A fullscreen overlay flashes patterned images at a regular interval.
  - Time‑lapse group‑up: during the glitch, characters appear to jump through past/future snapshots of conversations. Roughly every few seconds there is an active phase (~2 seconds) where characters are teleported into one or two clusters at visibly different places on the map; within these clusters characters exhibit subtle micro‑motions to imply they are talking to each other and multiple quick “scenes” are shown. After the active window, everyone snaps back to their exact original present positions. Following a snap‑back, there is a calm phase (~5 seconds) before the next time‑lapse.
- The glitch is purely visual/audio and does not require input.

## Saving & Resetting
- Progress autosaves to localStorage under the key switchGameState.
  - Saved data includes: current character, finished conversations (speaker:target), unlocked characters, and saved positions for each character/NPC.
  - Position changes are persisted whenever you complete a conversation or perform a character switch.
- Audio settings save under switchAudioSettings (volume, mute, enabled).
- Use Options → Danger zone → "Re‑start game" to clear saves (removes switchGameState and switchAudioSettings) and reload fresh.

## Audio
- Each persona has a looping theme track in audio/<characterId>.mp3.
  - Expected files: alexis.mp3, austine.mp3, chloe.mp3, isabell.mp3, nicholas.mp3, opal.mp3, tyson.mp3, victor.mp3
- Volume is adjustable in Options. Due to browser autoplay rules, music starts after your first interaction (key press is enough).
- **Music Fade-Out on Completion**: When you complete all 49 non-final interactions (the "Until game complete" counter reaches 0 remaining), the music will automatically fade out over ~2.5 seconds and stop playing. This only occurs when you're not playing as Victor—Victor's music continues uninterrupted during the glitch ending sequence.

## UI & Feedback
- Canvas view with a simple procedural map (world ~1600×1200; 32px tiles). The camera follows the player.
- Dialogue box appears at the bottom; portraits panel highlights the current speaker.
- Settings gear (top‑right) shows:
  - Playing as: current persona
  - Controls summary
  - Progress: per‑character completion and total remaining until game complete
  - Volume slider
  - Danger zone: reset button

## Interaction Rules (short version)
- Interact range is ~50px to an NPC.
- Talking to someone marks that conversation as completed for your current persona.
- After a conversation:
  - The NPC you just spoke to (if non‑final) becomes switch‑eligible and is proposed by the switch prompt.
  - If all 49 non‑final interactions are done and you just spoke to Victor, the prompt proposes Victor; accepting triggers the ending.
- When you switch, you don’t need to talk to the person you just swapped from when you’re playing as the new persona (they’re excluded from that persona’s required targets).

## Authoring content
- Dialogue lives in dialogue.js under the DIALOGUES map.
  - Structure: DIALOGUES[npcId].dialogues[characterId] = array of lines.
  - Lines can be plain strings (auto‑alternating npc/player) or objects like { speaker: 'npc'|'player', text: '...' }.
  - If a specific pairing is missing, a generic fallback dialogue is shown so interactions always work.
- Characters and colors live in characters.js and are driven by CSS variables defined in public/styles.css (e.g., --alexis, --austine, …). Theme accent updates automatically when you switch.
- Music files go in public/games/switch/audio and must be named exactly after the character ids listed above.

## File layout
- index.html – page wrapper, UI, error overlays, script loading
- game.js – movement, camera, rendering, switching, saving, ending
- characters.js – character/NPC data, colors, unlock rules, save schema
- dialogue.js – authored dialogue and dialogue runtime
- audio.js – audio playback, volume/mute persistence
- audio/ – mp3 assets for each character

## Troubleshooting
- If you see a black screen or the game halts, an on‑page error box should appear with details. Browser devtools console may have more info.
- If music doesn’t play, press any key or move once to satisfy autoplay policies, then open Options and check the volume.

## Plot
- 