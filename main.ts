// Modules to control application life and create native browser window
// E:\Gamr\Tool\PPLSS\www\data\Extracted
import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron';
import fs from 'fs';
import open from 'open';
import tools from './src/js/libs/projectTools'
import Store from 'electron-store';
const storage = new Store();
import * as ExtTool from './src/js/rpgmv/extract.js';
import path from 'path';
import * as edTool from './src/js/rpgmv/edtool.js';
let mainid = 0
const defaultHeight = 550
// 350 + 170
import axios from 'axios';
import * as dataBaseO from './src/js/rpgmv/datas.js';
import * as applyjs from "./src/js/rpgmv/apply.js";
import * as eztrans from "./src/js/rpgmv/translator.js";
import { checkIsMapFile, sleep } from './src/js/rpgmv/globalutils.js';
import * as yaml from 'js-yaml';
import * as prjc from './src/js/rpgmv/projectConvert';
import Themes from './src/js/rpgmv/styles'
import sendUpdateInfo from './main_update'
import { wolfInit } from './src/js/wolf/main.js';
import { initFontIPC } from './src/js/rpgmv/fonts';
import { papagoTrans } from './src/js/libs/papagotrans';
import { initExtentions } from './src/js/libs/extentions';


function ErrorAlert(msg){
  sendError(msg)
}

export function worked(){
  getMainWindow().webContents.send('worked', 0);
  getMainWindow().webContents.send('loading', 0);
}

function getSettings(){
  return globalThis.settings
}

async function loadSettings(){
  let givensettings = {}

  if(storage.has('settings')){
    givensettings = JSON.parse(storage.get('settings') as any)
  }

  globalThis.settings = dataBaseO.settings


  globalThis.settings = {...globalThis.settings, ...givensettings}
  globalThis.settings.version = app.getVersion()
  storage.set('settings', JSON.stringify(globalThis.settings))
}

let mainWindow:Electron.BrowserWindow

ipcMain.on('changeLang', (ev, arg) => {
  globalThis.settings.language = arg
  storage.set('settings', JSON.stringify(globalThis.settings))
  globalThis.mwindow.reload()
})


function createWindow() {
  loadSettings()
  setOPath()
  mainWindow = new BrowserWindow({
    width: 800,
    height: defaultHeight,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'res/icon.png')
  })
  
  mainWindow.setMenu(null)
  // and load the index.html of the app.
  // mainWindow.loadFile('./src/html/main/index.html')
  mainWindow.loadFile('./src/html/simple/index.html')
  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.show();
    getMainWindow().webContents.send('is_version', app.getVersion());
    async function v(currentVersionNumber){
      function c(yy){
        yy = yy.split('.')
        let v = 0
        for(let i in yy){
          v = (v*100)+parseInt(yy[i])
        }
        return v
      }
      const currentVersion = c(currentVersionNumber)
      const ver = (await axios.get('https://raw.githubusercontent.com/gramedcart/tsukuru_extractor/main/version.json')).data.version
      let last_version = c(ver)
      if(!storage.has('myversion')){
        storage.set("myversion", 0)
      }
      const myversion = storage.has('myversion') ? storage.get('myversion') : currentVersion
      if(currentVersion < last_version){
        getMainWindow().webContents.send('updateFound');
      }
      else if(myversion !== currentVersion){
        storage.set("myversion", currentVersion)
        sendUpdateInfo()
      }
    }
    v(app.getVersion())
    globalThis.settings.themeData = Themes[globalThis.settings.theme]
    getMainWindow().webContents.send('getGlobalSettings', globalThis.settings);
    if(!tools.packed){
      globalShortcut.register('Control+Shift+I', () => {
        mainWindow.webContents.openDevTools()
        return false;
      });
    }
  });
  mainid = mainWindow.id;
  globalThis.mwindow = mainWindow
  mainWindow.on('close', () => {
    app.quit()
  })
  tools.init()
  // Open the DevTools.
}

const getMainWindow = () => {
  const ID = mainid * 1;
  return BrowserWindow.fromId(ID)
}

function sendAlert(txt){
  getMainWindow().webContents.send('alert', txt);
}

function sendAlertSmall(txt){
  getMainWindow().webContents.send('alert_free', {html: txt, width:"90vw", height:"95vh"});
}

function sendError(txt){
  getMainWindow().webContents.send('alert', {icon: 'error',  message: txt});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  initExtentions()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.on('license', () => {
  const licenseWindow = new BrowserWindow({
    width: 800,
    height: 400,
    resizable: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'res/icon.png')
  })
  licenseWindow.setMenu(null)
  licenseWindow.loadFile('src/html/license.html')
  licenseWindow.show()
})

ipcMain.on('changeURL', (ev, arg) => {
  globalThis.mwindow.loadFile(arg)
  if(arg.endsWith('main/index.html')){
  }
})

ipcMain.on('settings', () => {
  globalThis.settingsWindow = new BrowserWindow({
    width: 800,
    height: 700,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'res/icon.png'),
  })
  globalThis.settingsWindow.setMenu(null)
  globalThis.settingsWindow.loadFile('src/html/config/settings.html')
  globalThis.settingsWindow.webContents.on('did-finish-load', function () {
    globalThis.settingsWindow.show();
    globalThis.settingsWindow.webContents.send('settings', getSettings());
  });
  globalThis.settingsWindow.on('close', function() { //   <---- Catch close event
    worked()
  });
  globalThis.settingsWindow.show()
})

ipcMain.on('gamePatcher', (ev, dir) => {
  if(!edTool.exists(dir)){
    sendError('추출된 파일이 없습니다')
    worked()
    return
  }
  globalThis.settingsWindow = new BrowserWindow({
    width: 800,
    height: 400,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'res/icon.png'),
  })
  globalThis.settingsWindow.setMenu(null)
  globalThis.settingsWindow.loadFile('src/html/patcher/index.html')
  globalThis.settingsWindow.webContents.on('did-finish-load', function () {
    globalThis.settingsWindow.show();
    globalThis.settingsWindow.webContents.send('settings', getSettings());
  });
  globalThis.settingsWindow.on('close', function() { //   <---- Catch close event
    worked()
  });
  globalThis.settingsWindow.show()
})


ipcMain.on('updatePage', () => {
  open('https://github.com/gramedcart/tsukuru_extractor/releases/latest')
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('applysettings', async (ev, arg) => {
  globalThis.settings = {...globalThis.settings, ...arg}
  storage.set('settings', JSON.stringify(globalThis.settings))
  globalThis.settingsWindow.close()
  globalThis.settings.themeData = Themes[globalThis.settings.theme]
  console.log(globalThis.settings)
  getMainWindow().webContents.send('getGlobalSettings', globalThis.settings);
  worked()
})

ipcMain.on('closesettings', async (ev, arg) => {
  globalThis.settingsWindow.close()
  worked()
})

ipcMain.on('select_folder', async (ev, typeo) => {
  let Path = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if(!Path.canceled){
    const qs = Path.filePaths[0]
    let qv
    if(qs.includes('\\')){
      qv = qs.split('\\')[qs.split('\\').length-1]
    }
    else{
      qv = qs.split('/')[qs.split('/').length-1]
    }
    let dir = qs
    if(qv === 'data'){
      getMainWindow().webContents.send('set_path', {type:typeo, dir:dir});
    }
    else{
      if(fs.existsSync(path.join(qs, 'www', 'data'))){
        getMainWindow().webContents.send('set_path', {type:typeo, dir:path.join(qs, 'www', 'data')});
      }
      else if(fs.existsSync(path.join(qs, 'data'))){
        getMainWindow().webContents.send('set_path', {type:typeo, dir:path.join(qs, 'data')});
      }
      else if(fs.existsSync(path.join(qs, 'Data.wolf'))){
        getMainWindow().webContents.send('set_path', {type:typeo, dir:path.join(qs)});
      }
      else{
        getMainWindow().webContents.send('alert', {icon: 'error',  message:'폴더가 올바르지 않습니다'});
      }
    }
  }
});

async function extractor(arg){
  try {
    globalThis.gb = {}
    let file
    let v
    const extended = true
    if(!arg.silent){
      arg.silent = false
    }
    const dir = Buffer.from(arg.dir, "base64").toString('utf8');
    if(fs.existsSync(dir)){}
    else{
      getMainWindow().webContents.send('alert', {icon: 'error', message: '지정된 디렉토리가 없습니다'}); 
      worked()
      return
    }
    if(path.parse(dir).name !== 'data' && (!arg.force)){
      getMainWindow().webContents.send('alert', {icon: 'error', message: 'data 폴더가 아닙니다'}); 
      worked()
      return
    }
    if(fs.existsSync(dir + '/Extract')){
      if(!arg.force){
        getMainWindow().webContents.send('check_force', arg); 
        worked()
        return
      }
      else{
        fs.rmSync(dir + '/Extract', { recursive: true });
        if(fs.existsSync(dir + '/Backup')){
          fs.rmSync(dir + '/Backup', { recursive: true });
        }
      }
    }
    console.log(arg.ext_plugin)
    if(arg.ext_plugin){
      if(true){
        let jsdir = ((dir.substring(0,dir.length-5) + '/js').replaceAll('//','/'))
        if(!fs.existsSync(jsdir + '/plugins.js')){
          jsdir = path.join(path.dirname(path.dirname(path.dirname(jsdir))), 'js')
          console.log(jsdir)
          if(!fs.existsSync(jsdir + '/plugins.js')){
            getMainWindow().webContents.send('alert', {icon: 'error', message: 'plugin.js가 존재하지 않습니다'}); 
            worked()
            return
          }
        }
        let hail2 = fs.readFileSync(jsdir + '/plugins.js', 'utf-8')
        let hail = hail2.split('$plugins =')
        hail2 = hail[hail.length - 1] + '  '
        hail2 = hail2.substring(hail2.indexOf('['), hail2.lastIndexOf(']') + 1)
        fs.writeFileSync(dir + '/ext_plugins.json', JSON.stringify(JSON.parse(hail2)), 'utf-8')
      }
    }
    globalThis.externMsg = {}
    globalThis.useExternMsg = false
    if(fs.existsSync(dir + '/ExternMessage.csv') && arg.exJson && globalThis.settings.ExternMsgJson){
      console.log('extern Exists')
      const Emsg = await ExtTool.parse_externMsg(dir + '/ExternMessage.csv', !globalThis.settings.ExternMsgJson)
      globalThis.externMsg = Emsg
      if(globalThis.settings.ExternMsgJson){
        fs.writeFileSync(dir + '/ExternMsgcsv.json', JSON.stringify(Emsg, null, 4), 'utf-8')
      }
      else{
        globalThis.useExternMsg = true
        globalThis.externMsgKeys = Object.keys(Emsg)
      }
    }
    let tempjsons = []
    const fileList2 = fs.readdirSync(dir)
    for(const i in fileList2){
      const f = path.join(dir, fileList2[i])
      const pf = path.parse(f)
      if(f.endsWith('.json.yaml')){
        console.log(f)
        const fname = path.join(pf.dir, pf.name)
        const fd = JSON.stringify(yaml.load(fs.readFileSync(f, 'utf-8')))
        fs.writeFileSync(fname, fd, 'utf-8')
        tempjsons.push(fname)
      }
    }

    const fileList = fs.readdirSync(dir)

    if (! fs.existsSync(dir + '/Extract')){
      fs.mkdirSync(dir + '/Extract')
    }
    if (! fs.existsSync(dir + '/Backup')){
      fs.mkdirSync(dir + '/Backup')
    }
    const onebyone = dataBaseO.onebyone

    const max_files = fileList.length
    let worked_files = 0
    let jT = 0
    ExtTool.init_extract(arg)
    let performT = performance.now()
    for (const i in fileList){
      worked_files += 1
      const fileName = fileList[i]
      if(path.parse(fileName).ext != '.json'){
        continue
      }
      const conf = {
        extended: extended,
        fileName: fileName,
        dir: dir,
        srce: arg.ext_src,
        autoline: arg.autoline,
        note: arg.ext_note,
        arg: arg
      }
      let runBackup = async () => {
        try {
          fs.copyFileSync(dir + '/' + fileName, dir + '/Backup/' + fileName) 
        } catch (error) {}
      }
      runBackup()
      if (checkIsMapFile(fileName)){
        file = fs.readFileSync(dir + '/' + fileName, 'utf8')
        jT += file.length
        await ExtTool.format_extracted(await ExtTool.extract(file, conf, 'map'))
      }
      else if (Object.keys(onebyone).includes(fileName)){
        file = fs.readFileSync(dir + '/' + fileName, 'utf8')
        jT += file.length
        await ExtTool.format_extracted(await ExtTool.extract(file, conf, onebyone[fileName]))
      }
      else if (arg.exJson){
        if(!dataBaseO.ignores.includes(fileName)){
          file = fs.readFileSync(dir + '/' + fileName, 'utf8')
          jT += file.length
          await ExtTool.format_extracted(await ExtTool.extract(file, conf, 'ex'))
        }
      }
      getMainWindow().webContents.send('loading', worked_files/max_files*100);
      await sleep(0)
    }
    const pTime = performance.now() - performT
    console.log(`perform in ${(pTime).toFixed(3)}ms\nPerformed Texts: ${jT}\nText per ms: ${(jT / pTime).toFixed(3)}`)
    const gbKeys = {...Object.keys(globalThis.gb)}
    for (const i in gbKeys){
      const fileName = gbKeys[i]
      if(globalThis.gb[fileName].outputText === ''){
        delete globalThis.gb[fileName]
      }
      else if(fileName === 'ext_javascript.json'){
        fs.writeFileSync(dir + `/Extract/${path.parse(fileName).name}.js`, globalThis.gb[fileName].outputText,'utf-8')
        delete globalThis.gb[fileName].outputText
      }
      else{
        fs.writeFileSync(dir + `/Extract/${path.parse(fileName).name}.txt`, globalThis.gb[fileName].outputText,'utf-8')
        delete globalThis.gb[fileName].outputText
      }
    }
    const ext_data = {
      main: globalThis.gb
    }
    edTool.write(dir, ext_data)
    if (fs.existsSync(dir + '/ext_plugins.json')){
      fs.rmSync(dir + '/ext_plugins.json')
    }
    if (fs.existsSync(dir + '/ExternMsgcsv.json')){
      fs.rmSync(dir + '/ExternMsgcsv.json')
    }
    for(const i in tempjsons){
      fs.rmSync(tempjsons[i])
    }
    getMainWindow().webContents.send('loading', 0);
    ['img','audio'].forEach((type) => {
      const ExtractImgDir = path.join(dir, `Extract_${type}`)
      if(fs.existsSync(ExtractImgDir)){
        fs.rmSync(ExtractImgDir, { recursive: true, force: true });
      }
    })
    if(arg.decryptImg){
      await ExtTool.DecryptDir(dir, "img")
    }
    if(arg.decryptAudio){
      await ExtTool.DecryptDir(dir, "audio")
    }
    if(!arg.silent){
      getMainWindow().webContents.send('alert2'); 
    }
  } catch (err) {
    getMainWindow().webContents.send('alert', {icon: 'error', message: JSON.stringify(err, Object.getOwnPropertyNames(err))}); 
  }
}

ipcMain.on('extract', async (ev, arg) => {
  await extractor(arg)
  worked()
})

ipcMain.on('apply', applyjs.apply)

function setOPath(){
  if(tools.packed){
    globalThis.oPath = process.resourcesPath
  }
  else{
    globalThis.oPath = __dirname
  }
}

ipcMain.on('eztrans', eztrans.trans)

ipcMain.on('eztransHelp', () => {open('https://github.com/gramedcart/tsukuru_extractor/wiki/ezTrans-%EC%98%A4%EB%A5%98-%ED%95%B4%EA%B2%B0')})

ipcMain.on('minimize', () => {
  getMainWindow().minimize()
})

ipcMain.on('close', () => {
  getMainWindow().close()
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('updates', ()=> {
  open("https://github.com/gramedcart/tsukuru_extractor/releases/")
})

ipcMain.on('updates', ()=> {
  open("https://github.com/gramedcart/tsukuru_extractor/releases/")
})

ipcMain.on('openFolder', (ev, arg) => {
  open(arg)
})

ipcMain.on('changeAllString', async (ev, arg) => {
  try {
    const dir = path.join(Buffer.from(arg.dir, "base64").toString('utf8'), 'Extract');
    if(fs.existsSync(dir)){
      const fileList = fs.readdirSync(dir)
      for(const i in fileList){
        const filePath = (path.join(dir,fileList[i]))
        const v = fs.readFileSync(filePath, "utf-8").replaceAll(arg.data[0], arg.data[1])
        fs.writeFileSync(filePath, v, "utf-8")
      }
      worked()
      getMainWindow().webContents.send('alert', "완료되었습니다"); 
    }
    else{
      worked()
      getMainWindow().webContents.send('alert', {icon: 'error', message: 'Extract 폴더가 존재하지 않습니다'}); 
    } 
  } catch (err) {
    worked()
    getMainWindow().webContents.send('alert', {icon: 'error', message: JSON.stringify(err, Object.getOwnPropertyNames(err))}); 
  }
})

ipcMain.on('updateVersion', async (ev, arg) => {
  function endThis(){
    worked()
  }
  try {
    if(!fs.existsSync(path.join(arg.dir1_base, 'Extract'))){
      ErrorAlert('구버전 번역본의 Extract 폴더가 존재하지 않습니다')
      worked()
      return
    }
    
    console.log(arg.dir3)
    await extractor({
      ...arg.dir3,
      dir: Buffer.from(path.join(arg.dir3_base), "utf8").toString('base64'),
      force: true,
      silent: true
    })
    console.log(arg.dir2)
    await extractor({
      ...arg.dir2,
      dir: Buffer.from(path.join(arg.dir2_base), "utf8").toString('base64'),
      force: true,
      silent: true
    })
    const TranslatedDir = path.join(arg.dir1_base, 'Extract')
    const OldDir = path.join(arg.dir3_base, 'Extract')
    const NewDir = path.join(arg.dir2_base, 'Extract')
    const fileList1 = fs.readdirSync(OldDir)
    for(let i in (fileList1)){
      const parsed = path.parse(fileList1[i])
      const file = parsed.name.concat(parsed.ext)
      let TransDict = {}
      console.log(file)
      const dat1 = fs.readFileSync(path.join(OldDir, file), 'utf-8').split('\n')
      if(!((fs.existsSync(path.join(TranslatedDir, file))))){
        ErrorAlert('구버전의 번역본 파일과 미번역본 파일이 서로 통하지 않습니다. ')
        endThis()
        return
      }
      const dat0 = fs.readFileSync(path.join(TranslatedDir, file), 'utf-8').split('\n')
      let dat2 = fs.readFileSync(path.join(NewDir, file), 'utf-8')
      let dat2_dat = dat2.split('\n')
      function UpReplacer(data, source, to, all=false){
        for(let i =0;i<data.length;i++){
          if(data[i] === source){
            data[i] = to;
            if(!all){
              break
            }
          }
        }
        return data
      }
      for(let i2 in (dat0)){
        TransDict[dat1[i2]] = dat0[i2]
        dat2_dat = UpReplacer(dat2_dat, dat1[i2], dat0[i2], false)
      }
      for(let i2 in TransDict){
        dat2_dat = UpReplacer(dat2_dat, dat1[i2], dat0[i2], true)
      }
      dat2 = dat2_dat.join('\n')
      fs.writeFileSync(path.join(NewDir, file), dat2, 'utf-8')




      getMainWindow().webContents.send('loading', Number(i)/fileList1.length*100);
      await sleep(0)
    }
    getMainWindow().webContents.send('alert', '완료되었습니다')
    endThis()
  } catch (err) {
    getMainWindow().webContents.send('alert', {icon: 'error', message: JSON.stringify(err, Object.getOwnPropertyNames(err))}); 
    endThis()
  }
})

process.on('uncaughtException', function (err) {
  console.log(err);
})

ipcMain.on('setheight', (ev,arg) =>{
  globalThis.mwindow.setResizable(true);
  globalThis.mwindow.setSize(800, arg, false)
  globalThis.mwindow.setResizable(false)
})
wolfInit()
initFontIPC()

ipcMain.on('log', async(ev, arg) => console.log(arg))
ipcMain.on('projectConvert', async(ev, arg) => prjc.ConvertProject(arg))