import { readFile, writeFile} from 'fs/promises'
import path from 'path'
import fsx from 'fs-extra'

const d = [

]

function isASCII(str:string) {
    return /^[\x00-\x7F]*$/.test(str);
}

export async function preProcessTranslate(edir:string){
    const fileList = fsx.readdirSync(edir)
    for(const file of fileList){
        if((file.startsWith('Map') && file.length === 10) || (file === 'CommonEvents.txt') || (file === 'Maps.txt')){
            const dir = path.join(edir, file)
            let da = (await readFile(dir,'utf-8')).split('\n')
            let chunked:number[] = []
            let chunkIndex = 0
            let chunkStr:string[] = []
            let skipArea = false
            for(let i=0;i<da.length;i++){
                const tile = da[i]
                if(tile.startsWith('---') || (tile.split(' ').length <= 3)){
                    if(chunkIndex !== 0){
                        const str = chunkStr.join(' ')
                        for(const ind of chunked){
                            da[ind] = `@@Excludes|chunkstr|${chunked[0]}`
                        }
                        da[chunked[0]] = str
                    }
                    chunked = []
                    chunkStr = []
                    chunkIndex = 0
                }
                else{
                    chunked.push(i)
                    chunkStr.push(tile)
                    chunkIndex += 1
                }
            }
            await writeFile(dir, da.join('\n'), 'utf-8')
        }
    }
}

function getBinarySize(string) {
    return Buffer.byteLength(string, 'utf8');
}


export async function postProcessTranslate(edir:string) {
    const fileList = fsx.readdirSync(edir)
    for(const file of fileList){
        if((file.startsWith('Map') && file.length === 10) || (file === 'CommonEvents.txt') || (file === 'Maps.txt')){
            const dir = path.join(edir, file)
            let da = (await readFile(dir,'utf-8')).split('\n')
            let doingHook = ''
            let hookIndex:number[] =[]
            for(let i=0;i<da.length;i++){
                const tile = da[i]

                if(doingHook !== ''){
                    if(doingHook === tile){
                        hookIndex.push(i)
                    }
                    else{
                        const forUse = da[hookIndex[0]]
                        let v = forUse.split(' ')
                        const len = hookIndex.length
                        let repeatTimes = hookIndex.length - 1
                        if(repeatTimes > v.length){
                            repeatTimes = v.length
                        }
                        for(let i2=0;i2<repeatTimes;i2++){
                            const ind = (Math.floor(v.length/len) * (i2+1)) - 1
                            v[ind] = '\n' + v[ind]
                        }
                        const tap = v.join(' ').split('\n')
                        for(let i2=0;i2<len;i2++){
                            da[hookIndex[i2]] = tap[i2]
                        }
                        hookIndex = []
                        doingHook = ''
                    }
                }


                if(doingHook === ''){
                    if(tile.startsWith('@@Excludes')){
                        const arg = tile.split('|')
                        if(arg[1] === 'chunkstr'){
                            doingHook = tile
                            hookIndex = [parseInt(arg[2]) ,i]
                        }
                    }
                }
            }
            await writeFile(dir, da.join('\n'), 'utf-8')
        }
    }
}