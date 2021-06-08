import Xel from '../../node_modules/xel/xel.js';

document.body.hidden = true;

document.addEventListener('DOMContentLoaded', async () => {
  await Xel.whenThemeReady;
  document.body.hidden = false;
});