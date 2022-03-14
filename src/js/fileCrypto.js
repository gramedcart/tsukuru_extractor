"use strict";

const path = require('path')
const fs = require('fs')
const rpgencrypt = require("./libs/rpgencrypt");

function reader(dir){
    let data = fs.readFileSync(dir, "utf-8")
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.substring(1);
    }
    return JSON.parse(data)
}


exports.DecryptDir = (DataDir, type) => {
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
    let dirs = fs.readdirSync(imgDir)
    let temp = []
    for (const i in dirs){
        const a = path.join(imgDir, dirs[i])
        if(fs.lstatSync(a).isDirectory()){
            temp.push(dirs[i])
        }
    }
    dirs = temp
    for (const i in dirs){
        const dir = path.join(imgDir, dirs[i])
        const dir_dat =  fs.readdirSync(dir)
        const eDir = path.join(ExtractImgDir, dirs[i])
        if(!fs.existsSync(eDir)){
            fs.mkdirSync(eDir);
        }
        for(const i2 in dir_dat){
            globalThis.mwindow.webContents.send('loadingTag', `${type} 복호화 중 : `);
            globalThis.mwindow.webContents.send('loading', ((i / dirs.length) + ( (i2/dir_dat.length) * (1/dirs.length)))*100 );
            const loc = (path.join(dir, dir_dat[i2]))
            try{
                rpgencrypt.Decrypt(loc, eDir, Key)
            }catch{}
        }
    }
    globalThis.mwindow.webContents.send('loading', 0);
}


exports.EncryptDir = (DataDir, type, instantapply) => {
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
    let dirs = []
    fs.readdirSync(ExtractImgDir).forEach((element) => {
        const a = path.join(ExtractImgDir, element)
        if(fs.lstatSync(a).isDirectory()){
            dirs.push(element)
        }
    })
    for(const i in dirs){
        const dir = path.join(ExtractImgDir, dirs[i])
        const dir_dat =  fs.readdirSync(dir)
        const cDir = path.join(CompleteDir, dirs[i])
        if(!fs.existsSync(cDir)){
            fs.mkdirSync(cDir);
        }
        for(const i2 in dir_dat){
            globalThis.mwindow.webContents.send('loadingTag', `${type} 암호화 중 : `);
            globalThis.mwindow.webContents.send('loading', ((i / dirs.length) + ( (i2/dir_dat.length) * (1/dirs.length)))*100 );
            const loc = (path.join(dir, dir_dat[i2]))
            try{
                rpgencrypt.Encrypt(loc, cDir, Key)
            }catch{}
        }
    }
}