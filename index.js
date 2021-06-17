const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { Document } = require('./document')
const { DocumentTableRow } = require('./documentTableRow')


const path = require('path')

function createWindow (file, width, height) {
    const window = new BrowserWindow({
        width: width,
        height: height,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            defaultEncoding: 'UTF-8',
        },
    })
    window.loadFile(file)
    //window.removeMenu()
    return window
}

app.on('ready', () => {
    function refreshDocuments(filter = '') {
        let documents = Document.all()
        let rows = []
        let states = []
        let stateCounts = [
            ['default', 0],
            ['expired', 0],
            ['executing', 0],
            ['executed', 0],
        ]
        documents.forEach( (doc) => {
            let state = Document.state(doc) 
            if (!filter || (filter && state == filter)) {
                rows.unshift((new DocumentTableRow(doc)).row()) 
                states.push([doc.id, state])
            }            
            let stateIndex = stateCounts.map((item) => item[0]).indexOf(state)
            if (stateIndex > -1) {
                stateCounts[stateIndex][1] += 1
            }
        })

        mainWindow.webContents.send('documents', rows, states, stateCounts)
    }

    const mainWindow = createWindow('windows/main.html', 1800, 920)

    mainWindow.once('ready-to-show', () => { 
        mainWindow.show() 
    })

    // --- create document
    ipcMain.on('create-document', (_event, doc) => {
        (new Document()).fill(doc).create()
        mainWindow.webContents.send('notification', 'Документ добавлен')
        refreshDocuments()
    })

    ipcMain.on('get-documents', (_event, filter) => {
        refreshDocuments(filter)
    })

    ipcMain.on('get-document', (_event, docid) => {
        mainWindow.webContents.send('document', Document.find(docid))
    })

    ipcMain.on('delete-document', (_event, docid, filter) => {
        const doc = Document.find(docid)
        let message = ['Вы уверены, что хотите удалить документ?', '', `ID: ${doc.id}`]
        if (doc.origin) message.push(`Откуда: ${doc.origin}`)
        if (doc.doc_type) message.push(`Вид: ${doc.doc_type}`)
        if (doc.doc_content) message.push(`Краткое содержание: ${doc.doc_content}`)
        if (confirm = dialog.showMessageBoxSync(mainWindow, {
            message: message.join('\n'),
            title: 'Подтверждение',
            type: 'question',
            buttons: ['Удалить', 'Отмена'],
            defaultId: 1,
            cancelId: 1,
        }) === 0) {
            Document.delete(docid)
            mainWindow.webContents.send('notification', 'Документ удален')
            refreshDocuments(filter)
        }
    })

    ipcMain.on('update-document', (_event, id, doc, filter) => {
        (new Document()).fill(doc).update(id)
        mainWindow.webContents.send('notification', 'Документ отредактирован')
        refreshDocuments(filter)
    })

})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
