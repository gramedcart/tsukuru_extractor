import { writeFileSync, readFileSync } from 'fs'
import zlib from 'zlib'
import {encode, decode} from '@msgpack/msgpack'

const WolfExtDataParser = {
    create: (dir:string)=>{
        writeFileSync(dir,zlib.deflateSync(Buffer.from(encode({
            ext: globalThis.WolfExtData,
            cache: globalThis.WolfCache,
            meta: globalThis.WolfMetadata
        }))))
    },
    read:(dir:string) =>{
        const ca =  decode(zlib.inflateSync(readFileSync(dir))) as any
        globalThis.WolfExtData = ca.ext
        globalThis.WolfMetadata = ca.meta
        globalThis.WolfCache = ca.cache
    }
}

export default WolfExtDataParser