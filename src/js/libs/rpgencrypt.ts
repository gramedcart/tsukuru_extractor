import fs from "fs"
import path from "path"

export const EncryptedExtensions:string[] = [".rpgmvo", ".rpgmvm", ".rpgmvw", ".rpgmvp", ".ogg_", ".m4a_", ".wav_", ".png_"]
export const DecryptedExtensions:string[] = [".ogg", ".m4a", ".wav", ".png", ".ogg", ".m4a", ".wav", ".png"]
const HEADER_MV:string[] = ["52", "50", "47", "4D", "56", "00", "00", "00", "00", "03", "01", "00", "00", "00", "00", "00"]

function splitString(str:string, p:number){
    let chunks = [];
    for (var i = 0, charsLength = str.length; i < charsLength; i += p) {
        chunks.push(str.substring(i, i + p));
    }
    return chunks
}

function hexToByte(hex:string){
    return Buffer.from(hex, "hex")[0]
}

function VerifyFakeHeader(filePath:string){
    if(!fs.existsSync(filePath)){
        throw "file dosen't exist"
    }
    const file = (fs.readFileSync(filePath))
    for (let index = 0; index < HEADER_MV.length; index++)
    {
        if (file[index] != hexToByte(HEADER_MV[index]))
        {
            return false;
        }
    }
    return true
}


export function Encrypt(filePath:string, saveDir:string, key:string){
    if(!fs.existsSync(filePath)){
        throw "file dosen't exist"
    }
    const extension = path.parse(filePath).ext.toLowerCase()
    if (!DecryptedExtensions.includes(extension))
    {
        throw "Incompatible file format used."
    }
    const header = Buffer.from(HEADER_MV.join(''), "hex")
    let file = fs.readFileSync(filePath)
    const keys = splitString(key, 2)
    for (let index = 0; index < keys.length; index++)
    {
        file[index] = (file[index] ^ hexToByte(keys[index]));
    }
    const encryptedExt = EncryptedExtensions[DecryptedExtensions.indexOf(extension)]
    const fileData = Buffer.concat([header, file], header.length + file.length)
    fs.writeFileSync(path.join(saveDir, `${path.parse(filePath).name}${encryptedExt}`), fileData)
}

export function Decrypt(filePath:string, saveDir:string, key:string){
    if(!fs.existsSync(filePath)){
        throw "file dosen't exist"
    }
    const extension = path.parse(filePath).ext.toLowerCase()
    if (!EncryptedExtensions.includes(extension))
    {
        throw "Incompatible file format used."
    }
    let file = (fs.readFileSync(filePath).slice(16))
    const keys = splitString(key, 2)
    for (let index = 0; index < keys.length; index++)
    {
        file[index] = (file[index] ^ hexToByte(keys[index]));
    }
    const decryptedExt = DecryptedExtensions[EncryptedExtensions.indexOf(extension)]
    fs.writeFileSync(path.join(saveDir, `${path.parse(filePath).name}${decryptedExt}`), file)
}