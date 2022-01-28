import LZString from './lz-string.min.js';
import fs from 'fs';

export function read(dir: string){
    try {
        const data = JSON.parse(LZString.decompressFromUint8Array(fs.readFileSync(dir + '/.extracteddata')))
        write(dir, data)
        return data.dat
    } catch (error) {
        console.log('trying in base64')
        const data = JSON.parse(LZString.decompressFromBase64(fs.readFileSync(dir + '/.extracteddata', 'utf8')))
        write(dir, data)
        return data
    }
}

export function write(dir: string, ext_data: Object, newVersion:boolean = true){
    fs.writeFileSync(dir + `/.extracteddata`, LZString.compressToUint8Array(JSON.stringify({dat: ext_data})))
}

export function exists (dir: string){
    return (fs.existsSync(dir + '/.extracteddata') )
}