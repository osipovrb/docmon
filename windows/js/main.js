import Xel from '../../node_modules/xel/xel.js'

const { DataTable } = require('simple-datatables')
const { ipcRenderer } = require('electron')

document.body.hidden = true

var datatable

document.addEventListener('DOMContentLoaded', async () => {
    await Xel.whenThemeReady
    document.body.hidden = false

    const closeDocumentForm = () => {
        //Array.from(document.querySelectorAll('#document-form .collect')).forEach(input => input.value = null)
        document.getElementById('dform').reset()
        document.getElementById('secret_label').value = 's'
        document.getElementById('document-form').close()
    }

    const saveDocumentForm = () => {
        ipcRenderer.send('create-document', [...document.getElementsByClassName('collect')].map(input => [input.id, input.value]))
        closeDocumentForm()
    }

    document.getElementById('document-close-button').addEventListener('click', () => closeDocumentForm())
    document.getElementById('document-save-button').addEventListener('click', () => saveDocumentForm())

    ipcRenderer.send('get-documents', '')

    ipcRenderer.on('notification', (_event, msg) => {
        const notification = document.getElementById('notification')
        notification.innerHTML = msg
        notification.opened = true
    })
    
    ipcRenderer.on('alert', (_event, msg) => {
        alert(msg)
    })
})

ipcRenderer.on('documents', (_event, rows, states) => {
    let data = {
        'headings': [
            '&nbsp;',
            'Входящий',
            'Исходящий',
            'Откуда поступил',
            'Документ',
            'Экз.',
            'Исполнить до',
            'Исполнители',
            'Факт. исполнен',
            'Отметка об исполнении',
            'Место хранения',
        ],
        'data': []
    }
    data.data = rows
    if (datatable) {
        datatable.destroy()
    }
    datatable = new DataTable('#documents', {
        'data': data,
        'labels': {
            placeholder: "Поиск...",
            perPage: "Показывать {select} строк на странице",
            noRows: "Документы не найдены",
            info: "Показаны строки с {start} по {end}. Всего строк: {rows}",
        },
        'perPage': 10,
        'perPageSelect': false
    })

    datatable.on('datatable.page', function(page) {
        const rows = document.querySelectorAll('#document > tbody > tr')
        ipcRenderer.send('get-states', Array.from(rows).map(row => row.firstChild.innerHTML))
        ipcRenderer.once('states', (states) => {
            Array.from(rows).forEach(row => row.classList.add(`doc-${states[row.innerHTML]}`))
        })
    });

    states.forEach(state => Array.from(document.querySelector('#documents > tbody').childNodes).filter(tr => tr.firstChild.innerHTML == state[0])[0].classList.add(`doc-${state[1]}`))
})

