import { lenStr } from "../../../../globals"
import { WolfCmd, WolfMapEvent, WolfParserIo } from "./io"

export function wolfExtractMapPattern(data:Buffer){
    const io = new WolfParserIo(data)
    const magic = io.readBytes(20)
    if (!io.byteArrayCompare(magic, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 87, 79, 76, 70, 77, 0, 85, 0, 0, 0])){
        if(io.byteArrayCompare(magic,[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 87, 79, 76, 70,77, 0, 0,  0,  0,  0])){
            globalThis.WolfMetadata.ver = 2
        }
        else{
            console.log(Uint8Array.from(magic))
            throw 'Unvalid 1'
        }
    }
    else{
        globalThis.WolfMetadata.ver = 3
    }
    const len = io.readU4le()
    const check = io.readU1()
    if(globalThis.WolfMetadata.ver === 2){
        if (!(check == 101)) {
            console.log(check)
            throw 'Unvalid 2'
        }
    }
    else{
        if (!(check == 102)) {
            console.log(check)
            throw 'Unvalid 2'
        }
    }
    const unk = io.readLenStr()
    const tilesetId = io.readU4le();
    const width = io.readU4le();
    const height = io.readU4le();
    const eventSize = io.readU4le();
    let map:number[] = []
    for (let i = 0; i < ((width * height) * 3); i++) {
        map.push(io.readU4le());
    }


    //find Event Pattern Based
    let currentPoint = io.pointer
    let events:WolfCmd[] = [];
    const blen = data.length
    while(true){
        try {
            io.pointer = currentPoint
            const numArgLen = io.readU1();
            let numArg:number[] = [];
            if(numArgLen <= 0){
                throw 'nein'
            }
            if(numArgLen >= 300){
                throw 'nein'
            }
            for (let i = 0; i < numArgLen; i++) {
              numArg.push(io.readU4le());
            }
            if((numArg[0] >= 1000) || (numArg[0] < 0) ){
                throw 'nein'
            }
            const indent = io.readU1();
            const strArgLen = io.readU1();
            if(strArgLen <= 0){
                throw 'nein'
            }
            if(strArgLen >= 300){
                throw 'nein'
            }
            let strArg:lenStr[] = [];
            for (let i = 0; i < strArgLen; i++) {
                const str = io.readLenStr()
                if(str.str[str.len-1] === 0){
                    strArg.push(str)
                }
                else{
                    throw 'nein2'
                }
            }
            const hasMoveRoute = io.readU1();
            if (!( ((hasMoveRoute == 0) || (hasMoveRoute == 1)) )) {
              throw "ValidationNotAnyOfError"
            }
            events.push({
                numArg: numArg,
                strArg: strArg
            })
        } catch (error) {
            if(io.pointer >= blen){
                break
            }
            if(currentPoint >= blen){
                break
            }
        }
        if(currentPoint % 10000 === 0){
            console.log(currentPoint)
        }
        currentPoint += 1
    }
    return events
}