import Xel from '../../node_modules/xel/xel.js'

const { DataTable } = require('simple-datatables')
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

ipcRenderer.on('documents', (_event, documents) => {
    let data = {
        'headings': [
            'ID',
            'Вх. дата',
            'Вх. №',
            'Гриф',
            'Исх. дата',
            'Исх. номер',
            'Откуда поступил',
            'Вид',
            'Содержание',
            'Листов',
            '№№ экз.',
            'Исполнить до',
            'Исполнители',
            'Факт. исполнен',
            'Отметка об исполнении',
            'Место хранения',
        ],
        'data': []
    }
    documents.forEach(doc => {
        data.data.push([
            doc.id,
            doc.delivered_at,
            doc.delivered_number, 
            doc.secret_label,
            doc.reg_date, 
            doc.reg_number,
            doc.origin,
            doc.doc_type,
            doc.doc_content,
            doc.sheets_count, 
            doc.instance_number,
            doc.execute_till,
            doc.executant,
            doc.executed_at,
            doc.execute_label,
            doc.stored_in,
        ])

    })
    new DataTable('#documents', {
        'data': data,
        'labels': {
            placeholder: "Поиск...",
            perPage: "Показывать {select} строк на странице",
            noRows: "Документы не найдены",
            info: "Показаны строки с {start} по {end}. Всего строк: {rows}",
        },
        'perPage': 25,
        'perPageSelect': false
    })

})

