import Xel from '../../node_modules/xel/xel.js';

document.body.hidden = true;

document.addEventListener('DOMContentLoaded', async () => {
  await Xel.whenThemeReady;
  document.body.hidden = false;
});

// --------------------------------------------------------------------------

const { ipcRenderer } = require('electron')

document.getElementById('open-form-button').addEventListener('click', () => {
    document.getElementById('open-form-button').disabled = true
    ipcRenderer.send('open-form')
})

ipcRenderer.on('main', (event, msg) => {
    if (msg == 'form-closed') {
        document.getElementById('open-form-button').disabled = false
    }
})

