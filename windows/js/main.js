import Xel from '../../node_modules/xel/xel.js'

const { DataTable } = require('simple-datatables')
const { ipcRenderer } = require('electron')

document.body.hidden = true

document.addEventListener('DOMContentLoaded', async () => {
    await Xel.whenThemeReady
    document.body.hidden = false

    function getDocuments(event) {
        ipcRenderer.send('get-documents', getFilter())
    }

    function getAlert() {
        ipcRenderer.send('get-alert')
    }

    function getFilter() {
        return document.querySelector('.filter[toggled]').dataset.filter
    }

    function deleteDocument(event) {
        const docid = event.currentTarget.dataset.docid
        const filter = getFilter()
        ipcRenderer.send('delete-document', docid, filter)
    }

    function editDocument(event) {
        const docid = event.currentTarget.dataset.docid
        ipcRenderer.send('get-document', docid)
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
        const hiddenId = document.querySelector('#document-form #hidden-id')
        if (hiddenId) {
            hiddenId.parentNode.removeChild(hiddenId)
        }
        document.getElementById('secret_label').value = 's'
        document.getElementById('document-form').close()
    }

    const saveDocumentForm = () => {
        const hiddenId = document.querySelector('#document-form #hidden-id')
        let doc = [...document.getElementsByClassName('collect')].map(input => [input.id, input.value])
        if (hiddenId) {
            ipcRenderer.send('update-document', hiddenId.value, doc, getFilter())
        } else {
            ipcRenderer.send('create-document', doc)
        }
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
            'perPage': 500,
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
               tr.addEventListener('contextmenu', function(event) {
                    event.preventDefault()

                    const menu = document.getElementById('context-menu')
                    const edit = document.getElementById('context-edit')
                    const del = document.getElementById('context-delete')
        
                    const id = tr.firstChild.innerHTML
                    edit.dataset.docid = id
                    del.dataset.docid = id
                    
                    edit.addEventListener('click', editDocument, {once: true})
                    del.addEventListener('click', deleteDocument, {once: true})

                    menu.open(event.clientX, event.clientY)
                    return false
               })
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

    const updateLabels = (stateCounts) => {
        stateCounts.forEach((item) => {
            const state = item[0]
            const count = item[1]
            const label = document.querySelector(`.filter-${state} > x-label`)
            if (label) {
                label.innerHTML = `${label.dataset.label} <strong>${count}</strong>`
            }
        })
    }

    const notification = (msg) => {
        const notification = document.getElementById('notification')
        notification.innerHTML = msg
        notification.opened = true
    }

    document.getElementById('document-close-button').addEventListener('click', () => closeDocumentForm())
    document.getElementById('document-save-button').addEventListener('click', () => saveDocumentForm())
    document.querySelectorAll('.filter').forEach((btn) => {
        btn.addEventListener('click', getDocuments)
    })

    ipcRenderer.on('notification', (_event, msg) => {
        notification(msg)
    })
    
    ipcRenderer.on('alert', (_event, msg) => {
        const alertWindow = document.getElementById('alert')
        const alertContent = document.getElementById('alert-content')
        const alertCloseButton = document.getElementById('alert-close-button')

        alertContent.innerHTML = msg
        alertCloseButton.addEventListener('click', () => document.getElementById('alert').close())
        alertWindow.showModal()
    })

    ipcRenderer.on('documents', (_event, rows, states, stateCounts) => {
        showDocuments(rows, states)
        updateLabels(stateCounts)
    })

    ipcRenderer.on('document', (_event, doc) => {
        document.querySelectorAll('#document-form .collect').forEach(input => {
            input.value = doc[input.id] 
        })
        const hiddenId = document.createElement('input')
        hiddenId.type = 'hidden'
        hiddenId.id = 'hidden-id'
        hiddenId.value = doc.id
        document.getElementById('document-form').appendChild(hiddenId)
        document.getElementById('document-form').showModal()
    })

    getDocuments()
    getAlert()
})
