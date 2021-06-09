import Xel from '../../node_modules/xel/xel.js'

document.body.hidden = true

document.addEventListener('DOMContentLoaded', async () => {
  await Xel.whenThemeReady
  document.body.hidden = false
})

// --------------------------------------------------------------------------

const { ipcRenderer } = require('electron')

document.getElementById('create-button').addEventListener('click', () => {
  ipcRenderer.send('create-document', [...document.getElementsByClassName('collect')].map(input => [input.id, input.value]))
  window.close()
})
