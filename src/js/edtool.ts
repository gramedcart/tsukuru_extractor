import LZString from './lz-string.min.js';
import fs from 'fs';

export function read(dir: string){
    try {
        let data = JSON.parse(LZString.decompressFromUint8Array(fs.readFileSync(dir + '/.extracteddata')))
        write(dir, data)
        if(data.main === undefined){
            while(data.main === undefined){
                data = data.dat
            }
        }
        return data
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