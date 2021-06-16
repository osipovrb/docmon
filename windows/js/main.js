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
        let documentsWrapper = document.querySelector('.dataTable-wrapper')
        let parent = document.getElementById('documents-parent')
        if (documentsWrapper) {
            parent.removeChild(documentsWrapper)
        }
    
        let newDocuments = document.createElement('table')
        newDocuments.id = 'documents'
        parent.appendChild(newDocuments)

        let data = {
            'headings': [
                'ID',
                'Входящий',
                'Исходящий',
                'Откуда',
                'Документ',
                'Экз.',
                'Исп. до',
                'Исп-ли',
                'Факт. исп.',
                'Отметка об исп.',
                'Место хранения',
            ],
            'data': []
        }
        data.data = rows
        const datatable = new DataTable('#documents', {
            'data': data,
            'labels': {
                placeholder: "Поиск...",
                perPage: "Показывать по {select} строк",
                noRows: "Документы не найдены",
                info: "Показаны строки с {start} по {end}. Всего строк: {rows}",
            },
            'layout': {
                'top': '{search}{pager}',
                'bottom': '{select}{info}',
            },
            'perPage': 10,
            'perPageSelect': [10, 25, 100, 500],
            'sortable': false
        })

        const alterRows = (states) => {
            const tableRows = Array.from(document.querySelector('#documents > tbody').childNodes)
            states.forEach(state => {
                // разукрашиваю
                const tr = tableRows.filter(tr => tr.firstChild.innerHTML == state[0])[0]
                if (tr) {
                    tr.className = ''
                    tr.classList.add(`doc-${state[1]}`)
                }
            });
           tableRows.forEach(tr => {
               const id = parseInt(tr.firstChild.innerHTML, 10)

           })
        }

        alterRows(states)

        datatable.on('datatable.page', (_page) => {
            alterRows(states)
        })

        datatable.on('datatable.sort', (_column, _direction) => {
            alterRows(states)
        });

        datatable.on('datatable.perpage', (_perpage) => {
            alterRows(states)
        });
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



