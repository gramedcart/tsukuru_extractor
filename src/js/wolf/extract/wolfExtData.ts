import { writeFileSync, readFileSync } from 'fs'
import zlib from 'zlib'

const WolfExtDataParser = {
    create: (dir:string)=>{
        writeFileSync(dir,zlib.deflateSync(Buffer.from(JSON.stringify(globalThis.WolfExtData), 'utf-8')))
    },
    read:(dir:string) =>{
        globalThis.WolfExtData = JSON.parse(zlib.inflateSync(readFileSync(dir)).toString('utf-8'))
    }
}

export default WolfExtDataParser