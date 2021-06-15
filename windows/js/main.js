import Xel from '../../node_modules/xel/xel.js'

const { DataTable } = require('simple-datatables')
const { ipcRenderer } = require('electron')

document.body.hidden = true

document.addEventListener('DOMContentLoaded', async () => {
    await Xel.whenThemeReady
    document.body.hidden = false

    const getDocuments = () => {
        ipcRenderer.send('get-documents', '')
    }

    const closeDocumentForm = () => {
        document.querySelectorAll('#document-form .collect:not(.date)').forEach(input => input.value = '')
        document.querySelectorAll('#document-form .date').forEach(input => {
            const parent = input.parentNode
            const newInput = document.createElement('x-input')
            newInput.type = input.type
            newInput.id = input.id
            newInput.classList.add('collect')
            newInput.classList.add('date')
            parent.removeChild(input)
            parent.appendChild(newInput)
        })
        document.getElementById('secret_label').value = 's'
        document.getElementById('document-form').close()
    }

    const saveDocumentForm = () => {
        ipcRenderer.send('create-document', [...document.getElementsByClassName('collect')].map(input => [input.id, input.value]))
        closeDocumentForm()
    }

    const showDocuments = (rows, states) => {
        const parent = document.getElementById('#documents-parent')
        const documents = document.getElementById('#documents')
        const updateStates = (states) => {
            const tableRows = Array.from(document.querySelector('#documents > tbody').childNodes)
            states.forEach(state => {
                const tr = tableRows.filter(tr => tr.firstChild.innerHTML == state[0])[0]
                if (tr) {
                    tr.classList.add(`doc-${state[1]}`)
                }
            });
           
        }
        if (documents) {
            documents.remove()
            documents = document.createElement('table')
            documents.attributes['id'] = 'documents'
            parent.appendChild(documents)
        }
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
        const datatable = new DataTable('#documents', {
            'data': data,
            'labels': {
                placeholder: "Поиск...",
                perPage: "Показывать {select} строк на странице",
                noRows: "Документы не найдены",
                info: "Показаны строки с {start} по {end}. Всего строк: {rows}",
            },
            'layout': {
                'top': '{search}{pager}',
                'bottom': '{info}',
            },
            'perPage': 10,
            'perPageSelect': false
        })

        updateStates(states)

        datatable.on('datatable.page', (_page) => {
            updateStates(states)
        })
    }

    const notification = (msg) => {
        const notification = document.getElementById('notification')
        notification.innerHTML = msg
        notification.opened = true
    }

    document.getElementById('document-close-button').addEventListener('click', () => closeDocumentForm())
    document.getElementById('document-save-button').addEventListener('click', () => saveDocumentForm())

    ipcRenderer.on('notification', (_event, msg) => {
        notification(msg)
    })
    
    ipcRenderer.on('alert', (_event, msg) => {
        alert(msg)
    })

    ipcRenderer.on('documents', (_event, rows, states) => {
        showDocuments(rows, states)
    })

    getDocuments()
})



