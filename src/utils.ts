import path from 'path'
import fs from 'fs'

export function decodeEncoding(buffer:Uint8Array){
    return Buffer.from(buffer).toString('utf-8')
    // return iconv.decode(Buffer.from(buffer), "Shift_JIS")
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function getAllFileInDir(Directory:string, ext:null|string = null) {
    let Files:string[] = [];

    function ThroughDirectory(Directory) {
        fs.readdirSync(Directory).forEach(File => {
            const Absolute = path.join(Directory, File);
            if (fs.statSync(Absolute).isDirectory()){
                ThroughDirectory(Absolute);
                return
            }
            else{
                if(ext){
                    if(path.extname(Absolute) === ext){
                        Files.push(Absolute);
                    }
                }
                else{
                    Files.push(Absolute);
                }
                return
            }
        });
    }

    ThroughDirectory(Directory);
    return Files
}