const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 620,
    minWidth:1200,
    minHeight:620,
    webPreferences:{
      nodeIntegration:true,
      contextIsolation:false,
      webSecurity:false,
      webviewTag:true
    },
    frame:false
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.setMenu(null)
  mainWindow.setResizable(false)

  //关闭窗口
  ipcMain.on('close-app', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })
  //缩小窗口
  ipcMain.on('min-app', () => {
    mainWindow.minimize()
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};


app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


