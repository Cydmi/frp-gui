import { app, BrowserWindow, ipcMain,Menu} from 'electron'
// import path from "path";
// import { execFile } from "child_process";
// import fs from "fs";
// const fixPath = require('fix-path');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow;
let frpid;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  ipcMain.on('frpid', (event, arg) => {
    frpid = arg;
  })

  ipcMain.on('restart',(event,arg)=>{
    process.kill(arg);
    frpid='';
    app.relaunch();
    app.exit(0);
  })
  const template = [
 
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://electronjs.org') }
        }
      ]
    }
  ]
  
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about',label:'关于'},
        {role:'quit',label:'退出'}
      ]
    })
  
  
  }
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 380
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null;
    if(frpid){
      process.kill(frpid)
      app.exit(0);
    }

  })
  //mainWindow.webContents.openDevTools()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log(frpid,22)
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
