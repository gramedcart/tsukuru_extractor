import { writeFileSync, readFileSync } from 'fs'
import zlib from 'zlib'
import {encode, decode} from '@msgpack/msgpack'

const WolfExtDataParser = {
    create: (dir:string)=>{
        writeFileSync(dir,zlib.deflateSync(Buffer.from(encode({
            ext: globalThis.WolfExtData,
            cache: globalThis.WolfCache
        }))))
    },
    read:(dir:string) =>{
        const ca =  decode(zlib.inflateSync(readFileSync(dir))) as any
        globalThis.WolfExtData = ca.ext
        globalThis.WolfCache = ca.cache
    }
}

export default WolfExtDataParser