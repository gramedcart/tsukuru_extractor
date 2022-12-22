import fs from 'fs';
import zlib from 'zlib'
import iconv from 'iconv-lite'
import axios from 'axios';

export function read(dir: string){ 
    const readF = fs.readFileSync(dir + '/.extracteddata')
    let data:any
    data = JSON.parse(iconv.decode(zlib.inflateSync(readF), 'utf8'))
    if(data.main === undefined){
        while(data.main === undefined){
            data = data.dat
        }
    }
    return data
}

export function write(dir: string, ext_data: Object, newVersion:boolean = true){
    const d = iconv.encode(JSON.stringify({dat: ext_data}), 'utf8')
    fs.writeFileSync(dir + `/.extracteddata`, zlib.deflateSync(d))
}

export function exists (dir: string){
    return (fs.existsSync(dir + '/.extracteddata') )
}
