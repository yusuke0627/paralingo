import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { ElectronMainInterface } from './interface/electron-main/index';

let mainWindow: BrowserWindow | null = null;
let mainInterface: ElectronMainInterface | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 760,
    show: true, // Show initially for visibility during development
    webPreferences: {
      preload: path.join(__dirname, 'interface/electron-main/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Make it look like a popup/overlay
    backgroundColor: '#1a1a1a', // Ensure background is visible even if CSS is slow
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

  // Setup Tray
  const iconPath = path.join(__dirname, '../assets/tray_template.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  trayIcon.setTemplateImage(true);
  
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Translation', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit ParaLingo', click: () => app.quit() },
  ]);
  
  tray.setToolTip('ParaLingo');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
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
