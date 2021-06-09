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
    let mainWindow = createWindow('windows/main.html', 1200, 1000)
    mainWindow.once('ready-to-show', () => { mainWindow.show() })

    // --- open form ---
    ipcMain.on('open-form', (_event, _args) => {
        let formWindow = createWindow('windows/form.html', 900, 900)
        formWindow.once('ready-to-show', () => { formWindow.show() })
        formWindow.on('close', (_event) => { 
            mainWindow.webContents.send('main', 'form-closed')
            formWindow = null 
        })
        mainWindow.on('close', (_event) => { 
            if (formWindow) formWindow.close() 
        })
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
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
