const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow (file, width, height) {
    const window = new BrowserWindow({
        width: width,
        height: height,
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
    const mainWindow = createWindow('windows/main.html', 800, 600)
    ipcMain.on('open-form', (_event, _args) => {
        const formWindow = createWindow('windows/form.html', 900, 850)
        formWindow.on('close', (_event) => {
            mainWindow.webContents.send('main', 'form-closed')
        })
        mainWindow.on('close', (_event) => {
            formWindow.close()
        })
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
