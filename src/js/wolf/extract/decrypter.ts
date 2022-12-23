import { exec } from "child_process";
import { removeSync } from "fs-extra";
import path from "path";
import { checkExtention, ExtentionPath } from "../../libs/extentions";

const Decrypter = path.join(ExtentionPath, 'wolfdec.exe')

function setProgressBar(now:number, max:number, multipl=100){
    globalThis.mwindow.webContents.send('loading', (now/max) * multipl);
}

function DecryptFile(file:string) {
    return new Promise<void>((resolve) => {
        const d = exec(`${Decrypter} ${file}`, {cwd: path.dirname(file)})
        d.on('exit', () => {
            removeSync(file)
            resolve()
        })
    })
}


export async function wolfDecrypt(files:string[]) {
    if(await checkExtention('wolfdec')){
        globalThis.mwindow.webContents.send('loadingTag', `복호화 중`);
        let i=0;
        for(const file of files){
            setProgressBar(i, files.length)
            console.log(file)
            await DecryptFile(file)
            i+=1
        }
        globalThis.mwindow.webContents.send('loadingTag', ``);
        return true
    }
    else{
        return false
    }
}