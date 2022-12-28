"use strict";

import path, { dirname } from 'path';
import fs, { readdirSync } from 'fs';
import * as rpgencrypt from "../libs/rpgencrypt";
import yaml from 'js-yaml';
import fsx from 'fs-extra'

function reader(dir:string){
    if(fs.existsSync(dir+'.yaml')){
        let data = fs.readFileSync(dir+'.yaml', "utf-8")
        return yaml.load(data)
    }
    let data = fs.readFileSync(dir, "utf-8")
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.substring(1);
    }
    return JSON.parse(data)
}

const sleep = (ms:number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getFilesRecursively (directory:string, dita:null|string = null):string[] {
    let files:string[] = []
    const filesInDirectory = fs.readdirSync(directory);
    const dira = dita ?? ''
    for (const file of filesInDirectory) {
      const absolute = path.join(directory, file);
      const absoluteDira = path.join(dira, file);
      if (fs.statSync(absolute).isDirectory()) {
          const fi = getFilesRecursively(absolute, absoluteDira);
          for(const f of fi){
            files.push(f)
          }
      } else {
          files.push(absoluteDira);
      }
    }
    return files
};

export async function DecryptDir (DataDir:string, type:string):Promise<void> {
    globalThis.mwindow.webContents.send('loading', 0);
    globalThis.mwindow.webContents.send('loadingTag', `${type} 복호화 중`);
    const SysFile = reader(path.join(DataDir, "System.json"))
    const Key = SysFile.encryptionKey
    const ExtractImgDir = path.join(DataDir, `Extract_${type}`)
    if(fs.existsSync(ExtractImgDir)){
        fs.rmSync(ExtractImgDir, { recursive: true, force: true });
    }
    fs.mkdirSync(ExtractImgDir)

    const imgDir = path.join(path.dirname(DataDir), type)
    console.log(imgDir)
    const files:string[] = getFilesRecursively(imgDir)
    for(let i=0;i<files.length;i++){
        globalThis.mwindow.webContents.send('loadingTag', `${type} 복호화 중 : `);
        globalThis.mwindow.webContents.send('loading', ((i/files.length)*100))
        const loc = path.join(imgDir,files[i])
        let tlan = path.dirname(files[i])
        if(tlan.startsWith('/')){
            tlan = tlan.substring(1)
        }
        try{
            const pat =path.join(ExtractImgDir , tlan)
            console.log(loc)
            fsx.mkdirsSync(pat)
            rpgencrypt.Decrypt(loc, pat, Key)
        }catch{}
        await sleep(1)
    }

    globalThis.mwindow.webContents.send('loading', 0);
}


export async function EncryptDir (DataDir:string, type:string, instantapply:boolean) {
    const SysFile = reader(path.join(DataDir, "System.json"))
    const Key = SysFile.encryptionKey
    const ExtractImgDirReal = path.join(DataDir, `Extract_${type}`)
    const ExtractImgDir = ExtractImgDirReal
    const CompleteDir = (()=>{
        if(instantapply){
            return path.join(path.dirname(DataDir), type)
        }
        return path.join(DataDir, 'Completed', type)
    })()
    if(!fs.existsSync(ExtractImgDirReal)){
        console.log('encrypt')
        return
    }
    if(!fs.existsSync(CompleteDir)){
        fs.mkdirSync(CompleteDir)
    }
    const files = getFilesRecursively(ExtractImgDir)
    console.log(ExtractImgDir)
    const wwwDir = (dirname(dirname(dirname(CompleteDir))))
    let MVMode = (wwwDir.endsWith('www\\') || wwwDir.endsWith('www/') || wwwDir.endsWith('www'))

    for(let i=0;i<files.length;i++){
        globalThis.mwindow.webContents.send('loadingTag', `${type} 암호화 중 : `);
        globalThis.mwindow.webContents.send('loading', ((i/files.length)*100))
        const loc = path.join(ExtractImgDir,files[i])
        let tlan = path.dirname(files[i])
        if(tlan.startsWith('/')){
            tlan = tlan.substring(1)
        }
        try{
            const pat =path.join(CompleteDir , tlan)
            fsx.mkdirsSync(pat)
            rpgencrypt.Encrypt(loc, pat, Key, MVMode)
        }catch{}
        await sleep(1)
    }

    globalThis.mwindow.webContents.send('loading', 0);
}