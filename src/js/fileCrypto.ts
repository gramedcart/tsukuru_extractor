"use strict";

import path from 'path';
import fs from 'fs';
import * as rpgencrypt from "./libs/rpgencrypt";
import yaml from 'js-yaml';
import fg from "fast-glob";
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
    let files:string[] = []
    const imgd = imgDir.replaceAll('\\','/')
    for (const exts of rpgencrypt.EncryptedExtensions){
        const glob = path.join(imgDir, '**', `*${exts}`).replaceAll('\\','/')
        const fi =await fg(`${glob}`)
        for(const file of fi){
            files.push(file)
        }
    }
    for(let i=0;i<files.length;i++){
        globalThis.mwindow.webContents.send('loadingTag', `${type} 복호화 중 : `);
        globalThis.mwindow.webContents.send('loading', ((i/files.length)*100))
        const loc = files[i]
        let tlan = path.dirname(loc).replaceAll('\\','/').substring(imgd.length)
        if(tlan.startsWith('/')){
            tlan = tlan.substring(1)
        }
        try{
            const pat =path.join(ExtractImgDir , tlan)
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
    const ExtractImgDir = path.join(DataDir, `Extract_${type}`)
    const CompleteDir = (()=>{
        if(instantapply){
            return path.join(path.dirname(DataDir), type)
        }
        return path.join(DataDir, 'Completed', type)
    })()
    if(!fs.existsSync(ExtractImgDir)){
        return
    }
    if(!fs.existsSync(CompleteDir)){
        fs.mkdirSync(CompleteDir)
    }
    let files:string[] = []
    const imgd = CompleteDir.replaceAll('\\','/')
    for (const exts of rpgencrypt.DecryptedExtensions){
        const glob = path.join(ExtractImgDir, '**', `*${exts}`).replaceAll('\\','/')
        const fi =await fg(`${glob}`)
        for(const file of fi){
            files.push(file)
        }
    }



    for(let i=0;i<files.length;i++){
        globalThis.mwindow.webContents.send('loadingTag', `${type} 암호화 중 : `);
        globalThis.mwindow.webContents.send('loading', ((i/files.length)*100))
        const loc = files[i]
        let tlan = path.dirname(loc).replaceAll('\\','/').substring(imgd.length - 1)
        if(tlan.startsWith('/')){
            tlan = tlan.substring(1)
        }
        try{
            const pat =path.join(CompleteDir , tlan)
            fsx.mkdirsSync(pat)
            rpgencrypt.Encrypt(loc, pat, Key)
        }catch(err){}
        await sleep(1)
    }

    globalThis.mwindow.webContents.send('loading', 0);
}