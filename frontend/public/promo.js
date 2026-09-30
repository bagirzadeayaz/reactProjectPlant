/* global document, window */
const copy = {
  en: {
    back: 'Back to shop',
    title: 'A little green.',
    subtitle: 'A different feeling.',
    intro: 'Step inside the world of Planto.\nFrom first leaf to a place called home.',
    meta: '28 seconds / Sound on',
    playFilm: 'Play film',
    pauseFilm: 'Pause film',
    seek: 'Video position',
    chapter1: 'Beginnings',
    chapter2: 'Grow',
    chapter3: 'Make room',
    chapter4: 'Exhale',
    chapter5: 'Your green',
    chapter6: 'Planto',
    captionsOn: 'Show captions',
    captionsOff: 'Hide captions',
    footer: 'Your next green corner starts here.',
    studio: 'Explore Room Studio',
    mute: 'Mute sound',
    unmute: 'Unmute sound',
    fullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen',
    error: 'Playback is unavailable in this browser. Please try another browser.',
    loading: 'Loading film…',
    chapters: 'Film chapters',
  },
  ru: {
    back: 'В магазин',
    title: 'Немного зелени.',
    subtitle: 'Другое настроение.',
    intro: 'Загляните в мир Planto.\nОт первого листа до уютного дома.',
    meta: '28 секунд / Со звуком',
    playFilm: 'Смотреть ролик',
    pauseFilm: 'Пауза',
    seek: 'Положение видео',
    chapter1: 'Начало',
    chapter2: 'Рост',
    chapter3: 'Новый уют',
    chapter4: 'Выдох',
    chapter5: 'Ваша зелень',
    chapter6: 'Planto',
    captionsOn: 'Показать субтитры',
    captionsOff: 'Скрыть субтитры',
    footer: 'Ваш зелёный уголок начинается здесь.',
    studio: 'Открыть студию',
    mute: 'Выключить звук',
    unmute: 'Включить звук',
    fullscreen: 'На весь экран',
    exitFullscreen: 'Выйти из полного экрана',
    error: 'Видео не воспроизводится в этом браузере. Попробуйте другой браузер.',
    loading: 'Загрузка ролика…',
    chapters: 'Сцены ролика',
  },
};
const lang = new URLSearchParams(window.location.search).get('lang') === 'ru' ? 'ru' : 'en';
const t = copy[lang];
document.documentElement.lang = lang;
for (const el of document.querySelectorAll('[data-text]')) el.textContent = t[el.dataset.text];
for (const el of document.querySelectorAll('a[href="/"],a[href="/catalog"],a[href="/studio"]'))
  el.href += '?lang=' + lang;
document.querySelector('.chapters').setAttribute('aria-label', t.chapters);
const video = document.querySelector('#film');
const mobileFilm = window.matchMedia('(max-width: 640px)').matches;
video.src = mobileFilm ? '/media/planto-promo-mobile.mp4?v=4' : '/media/planto-promo.mp4?v=4';
video.poster = mobileFilm
  ? '/media/planto-promo-mobile-poster.jpg?v=4'
  : '/media/planto-promo-poster.jpg?v=4';
const captions = document.querySelector('#captions');
let captionsEnabled = lang === 'ru';
function updateCaptions() {
  for (const track of video.textTracks)
    track.mode = captionsEnabled && track.language === lang ? 'showing' : 'disabled';
  captions.setAttribute('aria-label', t[captionsEnabled ? 'captionsOff' : 'captionsOn']);
  captions.setAttribute('aria-pressed', String(captionsEnabled));
}
captions.addEventListener('click', () => {
  captionsEnabled = !captionsEnabled;
  updateCaptions();
});
video.addEventListener('loadedmetadata', updateCaptions);
updateCaptions();
const screen = document.querySelector('#screen');
let hideControlsTimer;
function revealControls() {
  screen.dataset.controls = 'true';
  window.clearTimeout(hideControlsTimer);
  if (!video.paused)
    hideControlsTimer = window.setTimeout(() => {
      screen.dataset.controls = 'false';
    }, 2000);
}
screen.addEventListener('pointermove', revealControls);
screen.addEventListener('pointerdown', revealControls);
screen.addEventListener('focusin', revealControls);
video.addEventListener('play', revealControls);
video.addEventListener('pause', revealControls);
const cover = document.querySelector('#cover');
const mainPlay = document.querySelector('#main-play');
const toggle = document.querySelector('#toggle');
const mute = document.querySelector('#mute');
const fullscreen = document.querySelector('#fullscreen');
const seek = document.querySelector('#seek');
const status = document.querySelector('#media-status');
const chapters = [...document.querySelectorAll('[data-time]')];
const clock = (n) => '00:' + String(Math.floor(Number.isFinite(n) ? n : 0)).padStart(2, '0');
function message(text) {
  status.textContent = text;
  status.hidden = !text;
}
function update() {
  const playing = !video.paused && !video.ended;
  screen.dataset.playing = String(playing);
  toggle.setAttribute('aria-label', playing ? t.pauseFilm : t.playFilm);
  toggle.querySelector('use').setAttribute('href', playing ? '#pause' : '#play');
  mainPlay.hidden = playing || (video.currentTime > 0 && !video.ended);
  mainPlay.setAttribute('aria-label', t.playFilm);
  mute.setAttribute('aria-label', video.muted ? t.unmute : t.mute);
  mute.querySelector('use').setAttribute('href', video.muted ? '#muted' : '#sound');
  fullscreen.setAttribute(
    'aria-label',
    document.fullscreenElement ? t.exitFullscreen : t.fullscreen,
  );
  seek.max = Number.isFinite(video.duration) ? video.duration : 28;
  seek.value = video.currentTime;
  seek.style.setProperty('--played', `${(video.currentTime / Number(seek.max)) * 100}%`);
  seek.setAttribute(
    'aria-valuetext',
    clock(video.currentTime) + ' / ' + clock(video.duration || 28),
  );
  document.querySelector('#time').textContent =
    clock(video.currentTime) + ' / ' + clock(video.duration || 28);
  let active = 0;
  chapters.forEach((b, i) => {
    if (video.currentTime >= Number(b.dataset.time)) active = i;
  });
  chapters.forEach((b, i) => {
    if (i === active) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
}
async function play() {
  try {
    await video.play();
    cover.classList.add('dismissed');
    message('');
  } catch {
    message(t.error);
  }
  update();
}
function switchPlayback() {
  if (video.paused || video.ended) void play();
  else video.pause();
}
mainPlay.addEventListener('click', switchPlayback);
toggle.addEventListener('click', switchPlayback);
mute.addEventListener('click', () => {
  video.muted = !video.muted;
  update();
});
seek.addEventListener('input', () => {
  video.currentTime = Number(seek.value);
  cover.classList.add('dismissed');
  update();
});
chapters.forEach((b) =>
  b.addEventListener('click', () => {
    video.currentTime = Number(b.dataset.time);
    void play();
  }),
);
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (screen.requestFullscreen) await screen.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  } catch {
    /* Native video controls remain available if fullscreen is unsupported. */
  }
});
if (!screen.requestFullscreen && !video.webkitEnterFullscreen) fullscreen.hidden = true;
['timeupdate', 'play', 'pause', 'ended', 'loadedmetadata', 'volumechange'].forEach((event) =>
  video.addEventListener(event, update),
);
video.addEventListener('playing', () => {
  cover.classList.add('dismissed');
  message('');
});
video.addEventListener('waiting', () => message(t.loading));
video.addEventListener('error', () => {
  message(t.error);
  video.controls = true;
  document.querySelector('#transport').hidden = true;
  mainPlay.hidden = true;
});
document.addEventListener('fullscreenchange', update);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
});
cover.hidden = false;
video.controls = false;
document.querySelector('#transport').hidden = false;
mainPlay.hidden = false;
update();
document.body.classList.add('ready');
