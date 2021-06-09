const { app, BrowserWindow, ipcMain } = require('electron')
const { Document } = require('./document')

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
    //win.removeMenu()
    return window
}

app.whenReady().then(() => {



})

app.on('ready', () => {
    let mainWindow = createWindow('windows/main.html', 1800, 1000)

    mainWindow.once('ready-to-show', () => { 
        mainWindow.show() 
    })

    // --- create document
    ipcMain.on('create-document', (_event, docData) => {
        (async () => {
            try {
                const doc = new Document().fill(docData)
                await doc.insert()
                mainWindow.webContents.send('notification', 'Документ успешно добавлен')
            } catch(err) {
                mainWindow.webContents.send('alert', err)
            }

        })()
    })

    ipcMain.on('get-documents', (_event, _msg) => {
        (async () => {
            const documents = await Document.all()
            mainWindow.webContents.send('documents', documents)
        })()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
