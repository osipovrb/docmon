import Xel from '../../node_modules/xel/xel.js'
const { ipcRenderer } = require('electron')

document.body.hidden = true

document.addEventListener('DOMContentLoaded', async () => {
    await Xel.whenThemeReady
    document.body.hidden = false

    const closeDocumentForm = () => {
        Array.from(document.querySelectorAll('#document-form .collect')).forEach(input => input.value = '')
        document.getElementById('secret_label').value = 's'
        document.getElementById('document-form').close()
    }

    const saveDocumentForm = () => {
        ipcRenderer.send('create-document', [...document.getElementsByClassName('collect')].map(input => [input.id, input.value]))
        closeDocumentForm()
    }

    document.getElementById('document-close-button').addEventListener('click', () => closeDocumentForm())
    document.getElementById('document-save-button').addEventListener('click', () => saveDocumentForm())

    ipcRenderer.on('notification', (_event, msg) => {
        const notification = document.getElementById('notification')
        notification.innerHTML = msg
        notification.opened = true
    })
    
    ipcRenderer.on('alert', (_event, msg) => {
        alert(msg)
    })
})

