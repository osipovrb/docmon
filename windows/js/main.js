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

