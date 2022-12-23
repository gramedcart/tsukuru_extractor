import axios from "axios";
import { app, ipcMain } from "electron";
import { existsSync, mkdir, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { sleep } from "../rpgmv/globalutils";


let gExt = false
let acceptedExt = false
export const ExtentionPath = path.join(app.getPath('userData'), 'Ext')
export function initExtentions(){
    if(!existsSync(app.getPath('userData'))){
        mkdirSync(app.getPath('userData'))
    }
    if(!existsSync(ExtentionPath)){
        mkdirSync(ExtentionPath)
    }
    ipcMain.on('getextention', async (ev, arg) => {
        acceptedExt = true
        switch(arg){
            case 'wolfdec':{
                const v = Buffer.from((await axios.get('https://github.com/Sinflower/WolfDec/releases/download/v0.3/WolfDec.exe', {
                    responseType: 'arraybuffer'
                })).data)
                writeFileSync(path.join(ExtentionPath, 'wolfdec.exe'), v)
                break
            }
            case 'none':{
                acceptedExt = false
            }
        }

        gExt = true
    })
}

export async function checkExtention(param:'wolfdec') {
    const isInstalled = param === 'wolfdec' ? existsSync(path.join(ExtentionPath, 'wolfdec.exe')) : null
    const parKo = {
        'wolfdec': '복호화'
    }
    const parEn = {
        'wolfdec': 'Decryption'
    }

    if(!isInstalled){
        if(globalThis.settings.language === 'ko'){
            mwindow.webContents.send('alertExten', [`${parKo[param]}에는 확장 설치가 필요합니다. 설치하시겠습니까?`,param])
        }
        else{
            mwindow.webContents.send('alertExten', [`${parEn[param]} requires an extension installation. Do you want to install it?`,param])
        }
        gExt = false
        while(!gExt){
            await sleep(10)
        }
        return acceptedExt
    }
    else{
        return true
    }
}