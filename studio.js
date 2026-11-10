"use strict";
const examples = [
    { slug: 'chapel-garden', name: 'Chapel Garden', portrait: [42, 48, 754, 1112], landscape: [51, 52, 1229, 637] },
    { slug: 'classic-stained-glass', name: 'Classic Stained Glass', portrait: [90, 145, 711, 1073], landscape: [99, 119, 1183, 632] },
    { slug: 'floral-garden', name: 'Floral Garden', portrait: [64, 65, 736, 1147], landscape: [52, 48, 1228, 697] }
];
const frameButtons = document.querySelectorAll('[data-frame]');
let activeFrame = 0;
let frameTimer;
let swapTimer;
const displays = document.querySelectorAll('.frame-display');
function showFrame(index) {
    const example = examples[index];
    if (!example)
        return;
    activeFrame = index;
    for (const orientation of ['portrait', 'landscape']) {
        const image = document.getElementById(orientation + '-frame');
        image.src = 'assets/' + example.slug + '-' + orientation + '.webp';
        image.alt = example.name + ' ' + orientation + ' frame';
        const [left, top, right, bottom] = example[orientation];
        const width = orientation === 'portrait' ? 800 : 1280;
        const height = orientation === 'portrait' ? 1280 : 800;
        document.getElementById(orientation + '-placeholder').style.inset =
            [top / height * 100, (width - right) / width * 100, (height - bottom) / height * 100, left / width * 100].map(n => n + '%').join(' ');
    }
    for (const option of frameButtons)
        option.setAttribute('aria-pressed', String(Number(option.dataset.frame) === index));
    document.getElementById('frame-status').textContent = example.name + ' - portrait & landscape';
}
function stopRotation() {
    clearTimeout(frameTimer);
    clearTimeout(swapTimer);
    displays.forEach(display => display.classList.remove('is-changing'));
}
function scheduleRotation() {
    stopRotation();
    if (motionPaused || reducedMotion.matches || document.hidden)
        return;
    frameTimer = setTimeout(() => {
        const next = (activeFrame + 1 + Math.floor(Math.random() * (examples.length - 1))) % examples.length;
        displays.forEach(display => display.classList.add('is-changing'));
        swapTimer = setTimeout(() => { showFrame(next); scheduleRotation(); }, 350);
    }, 6500);
}
for (const example of examples)
    for (const orientation of ['portrait', 'landscape']) {
        const preload = new Image();
        preload.src = 'assets/' + example.slug + '-' + orientation + '.webp';
    }
for (const button of frameButtons)
    button.addEventListener('click', () => {
        stopRotation();
        showFrame(Number(button.dataset.frame));
        scheduleRotation();
    });
document.addEventListener('visibilitychange', scheduleRotation);
const motionButton = document.getElementById('pause-motion');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reducedMotion.matches;
function updateMotion() {
    const paused = reducedMotion.matches || motionPaused;
    const label = reducedMotion.matches ? 'Reduced motion enabled' : paused ? 'Resume motion' : 'Pause motion';
    document.body.dataset.motion = paused ? 'paused' : 'playing';
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    scheduleRotation();
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
reducedMotion.addEventListener('change', updateMotion);
updateMotion();
const helpDialog = document.getElementById('help-dialog');
document.getElementById('how-it-works').addEventListener('click', () => helpDialog.showModal());
document.getElementById('close-help').addEventListener('click', () => helpDialog.close());
