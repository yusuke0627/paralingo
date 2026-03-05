import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ElectronMainInterface } from './interface/electron-main/index';

let mainWindow: BrowserWindow | null = null;
let mainInterface: ElectronMainInterface | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false, // Hide initially until triggered
    webPreferences: {
      preload: path.join(__dirname, 'interface/electron-main/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Make it look like a popup/overlay
    frame: false,
    transparent: true,
    alwaysOnTop: true,
  });

  // Load the Vite dev server URL in development, or the local HTML file in production
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Hide window when it loses focus (optional, good for a translation popup)
  mainWindow.on('blur', () => {
    mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup Clean Architecture interface
  mainInterface = new ElectronMainInterface(mainWindow);
  mainInterface.setup();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (mainInterface) {
    mainInterface.cleanup();
  }
});
