import SHA3 from "sha3";
import { ModeOfOperation, Counter } from "aes-js";
import {serialize, deserialize} from "bson";
import {randomBytes} from "crypto"
import { performance } from "perf_hooks";

function hashKey(params:string): Buffer {
    const key = new SHA3(256)
    key.update(params)
    key.update(key.digest.toString() + key)
    return key.digest()
}

const ctr = new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5])

function EncryptData(file:Uint8Array, key:string){
    const salt = randomBytes(16)
    const keys = hashKey(key + salt.toString('base64'))
    const aesCtr = new ModeOfOperation.ctr(keys, new Counter(ctr));
    const returnFile = aesCtr.encrypt(file)
    return serialize({data: returnFile, salt:salt})
}

function DecryptData(file:Uint8Array, key:string): Uint8Array{
    const f = deserialize(file)
    if(f.data === null || f.salt === null){
        throw 'data is null'
    }
    const MainFile:Buffer = f.data.buffer
    const salt:Buffer = f.salt.buffer
    const keys = hashKey(key + salt.toString('base64'))
    const aesCtr = new ModeOfOperation.ctr(keys, new Counter(ctr));
    const returnFile = aesCtr.decrypt(MainFile)
    return returnFile
}

export function Encrypt(file:Uint8Array, password:string, showPerform:boolean = false): Uint8Array{
    const startTime = performance.now()
    file = new Uint8Array(file)
    const chunkSize = 10240000
    let chunks:Uint8Array[] = []
    for (let i = 0, j = file.length; i < j; i += chunkSize) {
        chunks.push(EncryptData(file.slice(i, i + chunkSize), password))
    }
    let length = 0;
    chunks.forEach(item => {
        length += item.length;
    });
    let mergedArray = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(item => {
        mergedArray.set(item, offset);
        offset += item.length;
    });
    if(showPerform){
        console.log(performance.now() - startTime)
    }

    return mergedArray
}

export function Decrypt(file:Uint8Array, password:string, showPerform:boolean = false): Uint8Array{
    const startTime = performance.now()
    file = new Uint8Array(file)
    const chunkSize = 10240000 + 43
    let chunks:Uint8Array[] = []
    for (let i = 0, j = file.length; i < j; i += chunkSize) {
        chunks.push(DecryptData(file.slice(i, i + chunkSize), password))
    }
    let length = 0;
    chunks.forEach(item => {
        length += item.length;
    });
    let mergedArray = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(item => {
        mergedArray.set(item, offset);
        offset += item.length;
    });
    if(showPerform){
        console.log(performance.now() - startTime)
    }

    return mergedArray
}