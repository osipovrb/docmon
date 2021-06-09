import Xel from '../../node_modules/xel/xel.js'

document.body.hidden = true

document.addEventListener('DOMContentLoaded', async () => {
  await Xel.whenThemeReady
  document.body.hidden = false
})

// --------------------------------------------------------------------------

const { ipcRenderer } = require('electron')

document.getElementById('open-form-button').addEventListener('click', () => {
    document.getElementById('open-form-button').disabled = true
    ipcRenderer.send('open-form')
})

ipcRenderer.on('main', (_event, msg) => {
    if (msg == 'form-closed') {
        document.getElementById('open-form-button').disabled = false
    }
})

ipcRenderer.on('notification', (_event, msg) => {
    const notification = document.getElementById('notification')
    notification.innerHTML = msg
    notification.opened = true
})

ipcRenderer.on('alert', (_event, msg) => {
    alert(msg)
})