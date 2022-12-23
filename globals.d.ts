import { BrowserWindow } from "electron"

export declare global {
    var mwindow:BrowserWindow
    var settings:{[key:string]: any}
    var keyvalue:CryptoKey|undefined
    var oPath:string
    var sourceDir:string
    var iconPath:string
    var WolfExtData: extData[]
    var WolfEncoding:'utf8'|'shift-jis'
    var WolfCache: {[key:string]:Buffer}
    var WolfMetadata: wolfMetadata
}

interface wolfMetadata{
    ver:number
}

interface extData{
    str:lenStr
    sourceFile:string
    extractFile:string
    endsWithNull:boolean
    textLineNumber:number[]
    codeStr:string


}

export interface lenStr{
    pos1:number
    pos2:number
    pos3:number
    str:Uint8Array
    len:number
}