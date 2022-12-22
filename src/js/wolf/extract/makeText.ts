import fs from 'fs'
import path from 'path'
import { decodeEncoding } from '../../../utils'
import { sleep } from '../../rpgmv/globalutils';
import WolfExtDataParser from './wolfExtData'


function setProgressBar(now:number, max:number, multipl=90){
    globalThis.mwindow.webContents.send('loading', 10 + ((now/max) * multipl));
}

export default async function makeText(){
    const ext = globalThis.WolfExtData
    let texts:{[key:string]:string[]} = {}
    for(let i =0;i<ext.length;i++){
        setProgressBar(i,ext.length)
        await sleep(1)
        let decoded = (decodeEncoding(ext[i].str.str)).replaceAll('\\','\\\\')
        if(decoded.endsWith('\0')){
            decoded = decoded.substring(0,decoded.length-1)
            globalThis.WolfExtData[i].endsWithNull = true
        }

        const text = decoded.split('\n')
        globalThis.WolfExtData[i].textLineNumber = []

        if(!texts[ext[i].extractFile]){
            texts[ext[i].extractFile] = []
        }
        texts[ext[i].extractFile].push(`--- ${ext[i].codeStr} ---`)

        for(const txt of text){
            texts[ext[i].extractFile].push(txt)
            globalThis.WolfExtData[i].textLineNumber.push(texts[ext[i].extractFile].length-1)
        }
    }
    const extTextDir = path.join(globalThis.sourceDir, '_Extract')
    if(fs.existsSync(extTextDir)){
        fs.rmSync(extTextDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extTextDir)
    fs.mkdirSync(path.join(extTextDir, 'Texts'))

    for(const key in texts){
        console.log(path.join(extTextDir, 'Texts',`${key}.txt`))
        fs.writeFileSync(path.join(extTextDir, 'Texts',`${key}.txt`),texts[key].join('\n'), 'utf-8')
    }
    globalThis.mwindow.webContents.send('loading', 0);
    WolfExtDataParser.create(path.join(extTextDir, '.extracteddata'))
}