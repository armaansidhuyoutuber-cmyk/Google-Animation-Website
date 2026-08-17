// glass-card.js
// The card is a window onto a refracted duplicate of the background video.
// Every frame we redraw the current video frame into an off-card canvas
// that is sized and positioned to the viewport, then let the SVG filter
// (applied via CSS on the canvas) do the refraction on composite.

const video = document.getElementById('bg-video');
const card = document.querySelector('[data-glass-card]');
const dupContainer = document.getElementById('dup-video-container');
const dupCanvas = document.getElementById('dup-image');
const ctx = dupCanvas.getContext('2d');

const DUP_PIXEL_RATIO = 1;

let lastW = 0;
let lastH = 0;

function tick() {
  requestAnimationFrame(tick);

  if (!card) return;

  const rect = card.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  if (!video.videoWidth || !video.videoHeight) return;

  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  // Position the duplicate container so that, being absolutely positioned
  // inside the card, its negative offset lands it exactly over the
  // viewport origin — its pixels line up 1:1 with the real video behind it.
  dupContainer.style.left = `${-rect.left}px`;
  dupContainer.style.top = `${-rect.top}px`;
  dupContainer.style.width = `${vw}px`;
  dupContainer.style.height = `${vh}px`;

  // Sizing the duplicate to the viewport rather than to the card is
  // deliberate. The filter shifts each colour channel by a different
  // amount, so the filtered element's own leading edges show hard
  // channel-separation bands. At viewport size those bands fall outside
  // the card and only clean refraction shows.
  const targetW = vw * DUP_PIXEL_RATIO;
  const targetH = vh * DUP_PIXEL_RATIO;
  if (targetW !== lastW || targetH !== lastH) {
    dupCanvas.width = targetW;
    dupCanvas.height = targetH;
    dupCanvas.style.width = `${vw}px`;
    dupCanvas.style.height = `${vh}px`;
    lastW = targetW;
    lastH = targetH;
  }

  // Reproduce object-fit: cover for the video draw.
  const cover = Math.max(vw / video.videoWidth, vh / video.videoHeight);
  const sw = vw / cover;
  const sh = vh / cover;
  const sx = (video.videoWidth - sw) / 2;
  const sy = (video.videoHeight - sh) / 2;

  try {
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dupCanvas.width, dupCanvas.height);
  } catch (e) {
    // A frame may not be decodable yet — skip and try again next tick.
  }
}

// The duplicate stays at 1× even on retina: the SVG filter's cost scales
// with pixel count, and what shows through is a soft refraction where 4×
// the filter work buys nothing.

requestAnimationFrame(tick);
