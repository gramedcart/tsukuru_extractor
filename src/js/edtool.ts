import LZString from './libs/lz-string.min.js';
import fs from 'fs';
import zlib from 'zlib'
import iconv from 'iconv-lite'
import axios from 'axios';

export function read(dir: string){
    try {
        const readF = fs.readFileSync(dir + '/.extracteddata')
        let data:any
        try {
            data = JSON.parse(iconv.decode(zlib.inflateSync(readF), 'utf8'))
        } catch (error) {
            console.log('fallback')
            data = JSON.parse(LZString.decompressFromUint8Array(readF))   
        }
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
    if(newVersion){
        const d = iconv.encode(JSON.stringify({dat: ext_data}), 'utf8')
        fs.writeFileSync(dir + `/.extracteddata`, zlib.deflateSync(d))
    }
    else{
        fs.writeFileSync(dir + `/.extracteddata`, LZString.compressToUint8Array(JSON.stringify({dat: ext_data})))
    }
}

export function exists (dir: string){
    return (fs.existsSync(dir + '/.extracteddata') )
}
