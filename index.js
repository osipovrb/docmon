const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
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

app.whenReady().then(() => {



})

app.on('ready', () => {
    function refreshDocuments() {
        let documents = Document.all()
        let rows = []
        let states = []

        documents.forEach( (doc) => { 
            rows.unshift((new DocumentTableRow(doc)).row()) 
        })
        
        documents.forEach( (doc) => { 
            states.push([doc.id, Document.state(doc)]) 
        })

        mainWindow.webContents.send('documents', rows, states)
    }

    const mainWindow = createWindow('windows/main.html', 1800, 970)

    mainWindow.once('ready-to-show', () => { 
        mainWindow.show() 
    })

    // --- create document
    ipcMain.on('create-document', (_event, docData) => {
        (new Document()).fill(docData).insert()
        mainWindow.webContents.send('notification', 'Документ успешно добавлен')
        refreshDocuments()
    })

    ipcMain.on('get-documents', (_event, ids) => {
        refreshDocuments()
        mainWindow.webContents.send('notification', 'Таблица документов загружена')
    })

})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
