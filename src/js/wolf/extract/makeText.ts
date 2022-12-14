import fs from 'fs'
import path from 'path'
import { decodeEncoding } from '../../../utils'
import WolfExtDataParser from './wolfExtData'

export default function makeText(){
    const ext = globalThis.WolfExtData
    let texts:{[key:string]:string[]} = {}
    for(let i =0;i<ext.length;i++){
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
    const extTextDir = path.join(path.dirname(globalThis.sourceDir), 'Extract')
    if(fs.existsSync(extTextDir)){
        fs.rmSync(extTextDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extTextDir)
    fs.mkdirSync(path.join(extTextDir, 'Texts'))


    for(const key in texts){
        fs.writeFileSync(path.join(extTextDir, 'Texts',`${key}.txt`),texts[key].join('\n'), 'utf-8')
    }
    WolfExtDataParser.create(path.join(extTextDir, '.extracteddata'))
}