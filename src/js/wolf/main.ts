import { ipcMain } from "electron";
import path from 'path'
import fs from 'fs'
import { worked } from "../../../main";
import { extractWolfFolder } from "./extract/extractor";
import makeText from "./extract/makeText";
import { wolfAppyier } from "./apply/applyWolf";

export async function wolfInit() {
    ipcMain.on('wolf_ext', async (ev, arg:{folder:string,config:{[key:string]:boolean}}) => {
        const dir = arg.folder
        if(!fs.existsSync(dir)){
          mwindow.webContents.send('alert', {icon: 'error', message: '지정된 디렉토리가 없습니다'}); 
          worked()
          return
        }
        if(path.parse(dir).name !== 'data' && (!arg.config.force)){
          mwindow.webContents.send('alert', {icon: 'error', message: 'data 폴더가 아닙니다'}); 
          worked()
          return
        }
        globalThis.sourceDir  = arg.folder
        globalThis.WolfExtData = []
        await extractWolfFolder(dir, arg.config)
        await makeText()
        mwindow.webContents.send('alert2'); 
        worked()
    })
    ipcMain.on('wolf_apply',  async (ev, arg:{folder:string,config:{[key:string]:boolean}}) => {
        const dir = arg.folder
        if(!fs.existsSync(dir)){
          mwindow.webContents.send('alert', {icon: 'error', message: '지정된 디렉토리가 없습니다'}); 
          worked()
          return
        }
        if(path.parse(dir).name !== 'data' && (!arg.config.force)){
          mwindow.webContents.send('alert', {icon: 'error', message: 'data 폴더가 아닙니다'}); 
          worked()
          return
        }
        globalThis.sourceDir  = arg.folder
        globalThis.WolfExtData = []
        await wolfAppyier()
        mwindow.webContents.send('alert2'); 
        worked()

    })
}