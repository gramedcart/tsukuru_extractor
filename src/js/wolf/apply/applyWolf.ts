import fs from 'fs'
import path from 'path'
import { sleep } from '../../rpgmv/globalutils'
import WolfExtDataParser from '../extract/wolfExtData'

function setProgressBar(now:number, max:number, multipl=100){
    globalThis.mwindow.webContents.send('loading', (now/max) * multipl);
}
export async function wolfAppyier() {
    let totalOffset:{[key:string]:number} = {}
    let sourceDic:{[key:string]:Buffer} = {}
    let extractedTextDic:{[key:string]:string[]} = {}
    const extTextDir = path.join(globalThis.sourceDir, '_Extract')
    WolfExtDataParser.read(path.join(extTextDir, '.extracteddata'))
    for(let i=0;i<globalThis.WolfExtData.length;i++){
        setProgressBar(i, globalThis.WolfExtData.length)
        const dat = (globalThis.WolfExtData[i])
        if(!Object.keys(extractedTextDic).includes(dat.extractFile)){
            extractedTextDic[dat.extractFile] = fs.readFileSync(path.join(extTextDir, 'Texts',`${dat.extractFile}.txt`),'utf-8').split('\n')
        }
        let extractedText = extractedTextDic[dat.extractFile]
        if(!Object.keys(sourceDic).includes(dat.sourceFile)){
            sourceDic[dat.sourceFile] = globalThis.WolfCache[dat.sourceFile]
            totalOffset[dat.sourceFile] = 0
        }
        let source = sourceDic[dat.sourceFile]
        const currentOffset =  totalOffset[dat.sourceFile]
        const pos1 = dat.str.pos1 + currentOffset
        const pos2 = dat.str.pos2 + currentOffset
        const pos3 = dat.str.pos3 + currentOffset
        const strLen = source.subarray(pos1, pos2).readUInt32LE()
        if(strLen !== dat.str.len){
            console.log(`invaild len ${strLen} / ${dat.str.len}`)
            continue
        }
        const oneT = source.subarray(pos2, pos3)
        if(!Buffer.from(oneT).equals(dat.str.str)) {
            console.log(`invaild text`)
            console.log(Buffer.from(oneT).byteLength)
            console.log(Buffer.from(dat.str.str).byteLength)
            continue
        }
        let strArr:string[] = []
        for(const s of dat.textLineNumber){
            strArr.push(extractedText[s])
        }
        let str = strArr.join('\n')
        if(dat.endsWithNull){
            str += '\0'
        }
        const strBuffer = (Buffer.from(str.replaceAll('\\\\','\\'), 'utf-8'))
        totalOffset[dat.sourceFile] += (strBuffer.length - strLen)
        source.writeInt32LE(strBuffer.length, pos1)
        source = Buffer.concat([source.subarray(0, pos2), strBuffer , source.subarray(pos3)])
        sourceDic[dat.sourceFile] = source
        await sleep(1)
    }
    for(const key in sourceDic){
        fs.writeFileSync(key,sourceDic[key])
    }
    console.log('apply end')
    setProgressBar(0,1)
}