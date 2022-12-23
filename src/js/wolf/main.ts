import { ipcMain } from "electron";
import path from 'path'
import fs from 'fs'
import { worked } from "../../../main";
import { extractWolfFolder } from "./extract/extractor";
import makeText from "./extract/makeText";
import { wolfAppyier } from "./apply/applyWolf";
import { getAllFileInDir } from "../../utils";
import { wolfDecrypt } from "./extract/decrypter";

export async function wolfInit() {
    ipcMain.on('wolf_ext', async (ev, arg:{folder:string,config:{[key:string]:boolean}}) => {
        try {
          globalThis.WolfMetadata = {
            ver:-1
          }
          let dir = arg.folder
          if(path.parse(dir).name !== 'data'){
            if(fs.existsSync(path.join(dir, 'Data'))){
              dir = path.join(dir, 'Data')
            }
            else if(fs.existsSync(path.join(dir, 'data'))){
              dir = path.join(dir, 'data')
            }
          }
          if(!fs.existsSync(dir)){
            mwindow.webContents.send('alert', {icon: 'error', message: '지정된 디렉토리가 없습니다'}); 
            worked()
            return
          }
          if((path.parse(dir).name !== 'data' && (!fs.existsSync(path.join(dir, 'Data.wolf')))) && (!arg.config.force)){
            mwindow.webContents.send('alert', {icon: 'error', message: 'data 폴더가 아닙니다'}); 
            worked()
            return
          }

          globalThis.sourceDir  = arg.folder
          globalThis.WolfExtData = []
          const encrypted = getAllFileInDir(path.dirname(dir), '.wolf')
          if(encrypted.length > 0){
            const d = await wolfDecrypt(encrypted)
            if(!d){
              worked()
            }
          }
          if(path.parse(dir).name !== 'data'){
            if(fs.existsSync(path.join(dir, 'Data'))){
              dir = path.join(dir, 'Data')
            }
            else if(fs.existsSync(path.join(dir, 'data'))){
              dir = path.join(dir, 'data')
            }
          }
          await extractWolfFolder(dir, arg.config)
          await makeText()
          mwindow.webContents.send('alert2'); 
          worked()
        }
        catch(err){
          mwindow.webContents.send('alert', {icon: 'error', message: JSON.stringify(err, Object.getOwnPropertyNames(err))}); 
        }
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