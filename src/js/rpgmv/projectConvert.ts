import fs from 'fs'
import fsa from 'fs-extra'
import {app, dialog} from 'electron'
import path from 'path'
import tools from '../libs/projectTools'
import fg from 'fast-glob'
import * as rpgencrypt from '../libs/rpgencrypt'

function setProgressBar(now:number, max:number=100){
    globalThis.mwindow.webContents.send('loading', (now/max) * 100);
}

function sleep(ms:number){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createTempFolder(){
    const qTemp = path.join(app.getPath('temp'), 'Extractorpp')
    if(!fs.existsSync(qTemp)){
        fs.mkdirSync(qTemp)
    }
    const tempDir = path.join(qTemp, Date.now().toString(16))
    return tempDir
}

async function clearTemp() {
    const qTemp = path.join(app.getPath('temp'), 'Extractorpp')
    fsa.emptyDirSync(qTemp)
    console.log('temp clear')
}


export async function ConvertProject(dir:string){
    try {
        if(!fs.existsSync(dir)){
            tools.sendError("경로가 올바르지 않습니다")
            tools.worked()
            return
        }

        for(const a of '$^*+?()[]'){
            if(dir.includes(a)){
                tools.sendError("경로가 올바르지 않습니다")
                tools.worked()
                return
            }
        }
    
        const fd = await dialog.showOpenDialog(globalThis.mwindow, {
            title: "프로젝트 저장 위치 선택",
            properties: ['openDirectory']
        })
        if(fd.canceled){
            tools.worked()
            return
        }
    
    
        dir = path.dirname(dir)
        const projectSaveDir = path.join(fd.filePaths[0], `Project${Math.floor(Date.now()/1000).toString(16)}`)
        if(fs.existsSync(projectSaveDir)){
            fsa.emptyDirSync(projectSaveDir)
        }
        else{
            fs.mkdirSync(projectSaveDir)
        }
        const commonDir = dir.replaceAll('\\','/')
        let files = await fg(path.join(dir,'**','*.*').replaceAll('\\','/'))
        for(let i = 0;i<files.length;i++){
            const f = files[i].substring(commonDir.length + 1)
            const targetdir = (path.join(projectSaveDir, f))
            if(!fs.existsSync(path.dirname(targetdir))){
                fsa.mkdirsSync(path.dirname(targetdir))
            }
            await fsa.copyFile(files[i], targetdir)
            setProgressBar((i/files.length*50))
        }
        // await fsa.copy(dir, projectSaveDir)
    
        // plugin.js
        const pluginjsPath = path.join(projectSaveDir, 'js', 'plugins.js')
        if(fs.existsSync(pluginjsPath)){
            let pluginjs = fs.readFileSync(pluginjsPath, 'utf8')
            let hail0 = pluginjs.split('$plugins =')
            pluginjs = hail0[hail0.length - 1] + '  '
            pluginjs = pluginjs.substring(pluginjs.indexOf('['), pluginjs.lastIndexOf(']') + 1)
            const plugins:any[] = (JSON.parse(pluginjs))
            let pluginDat = `// Generated by RPG Maker.\n`
            + `// Do not edit this file directly.\n`
            + `var $plugins =\n[`
            for(const i in plugins){
                pluginDat += '\n' + JSON.stringify(plugins[i]) + ','
            }
            pluginDat = pluginDat.substring(0, pluginDat.length-1) + '\n];\n'
            fs.writeFileSync(pluginjsPath, pluginDat, 'utf8')
            console.log('pluginjs')
        }
        const sysJsonDir = path.join(projectSaveDir, 'data', 'System.json')
        if(fs.existsSync(sysJsonDir)){
            let sysdata = JSON.parse(tools.rmBom(await fsa.readFile(sysJsonDir, 'utf-8')))
            sysdata.hasEncryptedImages = false
            sysdata.hasEncryptedAudio = false
            fs.writeFileSync(sysJsonDir, JSON.stringify(sysdata))
            const EncryptedExtensions:string[] = [".rpgmvo", ".rpgmvm", ".rpgmvw", ".rpgmvp", ".ogg_", ".m4a_", ".wav_", ".png_"]
            let patterns:string[] = []
            for(const i in EncryptedExtensions){
                patterns.push(path.join(projectSaveDir,'**','*' + EncryptedExtensions[i]).replaceAll('\\','/'))
            }
            const encryptedFiles = (await fg(patterns, {dot: true}))
            if(encryptedFiles.length > 0){
                const key:string = sysdata.encryptionKey
                for(const i in encryptedFiles){
                    setProgressBar(50 + (parseInt(i)/encryptedFiles.length*50))
                    await rpgencrypt.Decrypt(encryptedFiles[i], path.dirname(encryptedFiles[i]), key)
                    fs.rmSync(encryptedFiles[i])
                }
            }
        }
        let isMz = false
        let fileVersion = 'RPGMV 1.0.0'
        const rpgCoreDir = path.join(projectSaveDir, 'js', 'rpg_core.js')
        const mzCoreDir = path.join(projectSaveDir, 'js', 'rmmz_core.js')
        if(fs.existsSync(rpgCoreDir)){
            const d = fs.readFileSync(rpgCoreDir, 'utf-8').split('\n')
            for(let i=0;i<d.length;i++){
                if(d[i].includes('rpg_core.js')){
                    let t = d[i].replaceAll(' ','')
                    const t2 = t.split('v')
                    t = t2[t2.length - 1]
                    fileVersion = `RPGMV ${t}`
                    break
                }
            }
            console.log('mv core')
        }
        if(fs.existsSync(mzCoreDir)){
            isMz = true
            const d = fs.readFileSync(mzCoreDir, 'utf-8').split('\n')
            for(let i=0;i<d.length;i++){
                if(d[i].includes('rmmz_core.js')){
                    let t = d[i].replaceAll(' ','')
                    const t2 = t.split('v')
                    t = t2[t2.length - 1]
                    fileVersion = `RPGMZ ${t}`
                    break
                }
            }
            console.log('mz core')
        }
        console.log(fileVersion)
        if(isMz){
            fs.writeFileSync(path.join(projectSaveDir, 'game.rmmzproject'), fileVersion)
        }
        else{
            fs.writeFileSync(path.join(projectSaveDir, 'Game.rpgproject'), fileVersion)
        }
        setProgressBar(0)
        tools.sendAlert('완료되었습니다')
        tools.worked()
        clearTemp()
    } catch (err) {
        globalThis.mwindow.webContents.send('alert', {icon: 'error', message: JSON.stringify(err, Object.getOwnPropertyNames(err))}); 
    }
}