const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// registra o esquema custom (tem que ser antes do app ready)
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  if (app.isPackaged) {
    win.loadURL('app://local/index.html');
  } else {
    win.loadURL('http://localhost:3000');
  }

  // win.webContents.openDevTools(); // descomenta pra depurar
}

app.whenReady().then(() => {
  // serve os arquivos da pasta /out pelo protocolo app://
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let filePath = path.join(__dirname, 'out', decodeURIComponent(url.pathname));
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});