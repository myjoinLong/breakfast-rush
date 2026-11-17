'use strict';

const breakfastAudio = (() => {
  const folder = './assets/audio/';
  const channel = (volume, loop = false) => {
    const media = new Audio();
    media.preload = 'none';
    media.volume = volume;
    media.loop = loop;
    return { media, name: '', pending: false, blocked: false, attempt: 0, volume };
  };
  const music = channel(.76, true);
  const street = channel(.62, true);
  const kitchen = channel(.52, true);
  const voice = channel(.9);
  const effects = [channel(.74), channel(.74), channel(.74)];
  const channels = [music, street, kitchen, voice, ...effects];
  const lastEffect = new Map();
  const muteKey = 'breakfast-rush:mute';
  let muted = false;
  try { muted = localStorage.getItem(muteKey) === '1'; } catch { /* Private browser storage. */ }
  let activated = false;
  let cursor = 0;
  let lastVoiceAt = -Infinity;
  let spokenLesson = '';

  function allowed() {
    return activated && !document.hidden && !muted && !rewardPending;
  }

  function play(track, name) {
    const { media } = track;
    const attempt = ++track.attempt;
    if (track.name !== name) {
      track.name = name;
      media.src = folder + name + '.mp3';
    } else if (!media.loop) {
      media.currentTime = 0;
    }
    track.pending = true;
    track.blocked = false;
    Promise.resolve(media.play()).catch(() => {
      if (track.attempt === attempt) track.blocked = true;
    }).finally(() => {
      if (track.attempt === attempt) track.pending = false;
    });
  }

  function stop(track) {
    track.attempt++;
    track.media.pause();
    track.pending = false;
  }

  function stopVoice() {
    stop(voice);
    duck(false);
  }

  function duck(speaking) {
    music.media.volume = speaking ? music.volume * .43 : music.volume;
    street.media.volume = speaking ? street.volume * .63 : street.volume;
    kitchen.media.volume = speaking ? kitchen.volume * .63 : kitchen.volume;
  }

  for (const event of ['ended', 'pause', 'error']) {
    voice.media.addEventListener(event, () => { if (voice.media.paused) duck(false); });
  }
  voice.media.addEventListener('playing', () => duck(true));

  function loop(track, name) {
    if (!name) {
      if (!track.media.paused || track.pending) stop(track);
    } else if (track.name !== name || (track.media.paused && !track.pending && !track.blocked)) {
      play(track, name);
    }
  }

  function pause() {
    for (const track of channels) if (!track.media.paused || track.pending) stop(track);
    duck(false);
  }

  function sync() {
    if (!allowed()) {
      pause();
      return;
    }
    const liveStreet = !titleOpen && page === 'stall' && game.phase === 'live';
    const melody = titleOpen ? 'music-title' : game.phase === 'report' || page === 'ledger' ? 'music-evening' : liveStreet ? 'music-street' : 'music-title';
    loop(music, game.settings.music ? melody : '');
    loop(street, game.sound && liveStreet ? (forecast().kind === 'rain' ? 'amb-rain' : 'amb-street') : '');
    loop(kitchen, game.sound && liveStreet && game.speed > 0 && !dialog.open && occupiedStovePortions() ? 'amb-cooking' : '');
    if (!game.settings.voice && (!voice.media.paused || voice.pending)) stopVoice();
  }

  function unlock() {
    if (activated) {
      if ([music, street, kitchen].some(track => track.blocked)) {
        for (const track of channels) track.blocked = false;
        sync();
      }
      return;
    }
    activated = true;
    // Reuse the same elements on mobile. Start them during the first gesture so later simulation events can play audio.
    for (const track of channels) {
      play(track, 'silence');
      if (track.media.loop) stop(track);
    }
    sync();
  }

  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem(muteKey, muted ? '1' : '0'); } catch { /* Private browser storage. */ }
    sync();
    return muted;
  }

  function effect(name) {
    if (!allowed() || !game.sound) return;
    const now = performance.now();
    if (now - (lastEffect.get(name) ?? -Infinity) < (name === 'tap' ? 90 : 195)) return;
    lastEffect.set(name, now);
    const track = effects.find(item => item.media.paused && !item.pending) ?? effects[cursor++ % effects.length];
    play(track, 'sfx-' + name);
  }

  function say(name, { important = false, gap = 2200 } = {}) {
    if (!allowed() || !game.settings.voice) return false;
    const now = performance.now();
    const busy = !voice.media.paused || voice.pending;
    if (!important && (busy || now - lastVoiceAt < gap)) return false;
    if (busy && voice.name === 'vo-' + name) return true;
    lastVoiceAt = now;
    play(voice, 'vo-' + name);
    return true;
  }

  function lesson() {
    const line = { seat: (game.lessonRound ?? 0) === 2 ? 'group' : 'seat', serve: 'serve', clean: 'clean' }[game.streetLesson];
    if (!line || dialog.open) return;
    const key = `${activeSlot}:${game.day}:${game.lessonRound ?? 0}:${line}`;
    if (key !== spokenLesson && say(line, { important: true })) spokenLesson = key;
  }

  function guest(order, gap) {
    if (!order || game.streetLesson || dialog.open) return;
    const characters = ['office', 'elder', 'grandpa', 'student', 'rider', 'office'];
    say(order.toGo ? 'takeout' : characters[order.person % characters.length] ?? 'office', { gap });
  }

  function reset() {
    stopVoice();
    for (const track of effects) stop(track);
    spokenLesson = '';
    lastVoiceAt = -Infinity;
    lastEffect.clear();
  }

  return { sync, unlock, effect, say, lesson, guest, pause, stopVoice, reset, toggleMute, isMuted: () => muted };
})();
