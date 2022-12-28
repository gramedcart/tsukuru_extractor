import path from 'path'
import fs from 'fs'
import { extractEvent } from './ext_events.js'
import { wolfExtractCommon, wolfExtractMap } from '../parser/Map.js';
import { getAllFileInDir } from '../../../utils.js';
import { sleep } from '../../rpgmv/globalutils.js';
import { wolfDecrypt } from './decrypter.js';
import { wolfExtractMapPattern } from '../parser/patternBased.js';

function setProgressBar(now:number, max:number, multipl=50){
    globalThis.mwindow.webContents.send('loading', (now/max) * multipl);
}

export async function extractWolfFolder(DataDir:string, conf:{[key:string]:boolean}){

    const maps = (getAllFileInDir(DataDir, '.mps'))
    const commonEvent = (path.join(DataDir, 'BasicData','CommonEvent.dat'))
    globalThis.WolfCache = {}
    let patternMode = conf.extPattern
    let i = 0;
    for(const map of maps){
        setProgressBar(i,maps.length)
        try {
            const buf = fs.readFileSync(map)
            WolfCache[map] = buf
            if(patternMode){
                const pa = wolfExtractMapPattern(buf)
                extractEvent(pa, map, conf)

            }
            else{
                const pa = wolfExtractMap(buf)
                for(const event of pa.events){
                    for(const page of event.pages){
                        extractEvent(page.cmd, map, conf)
                    }
                }
            }
        } catch (error) {
            console.log(`failed on ${map}`)
            console.log(error)
        }
        await sleep(1)
        i += 1

    }
    // {
    //     try {
    //         const buf = fs.readFileSync(commonEvent)
    //         WolfCache[commonEvent] = buf
    //         const c = wolfExtractCommon(fs.readFileSync(commonEvent))
    //         extractEvent(c, commonEvent, conf, {commonevent:true})   
    //     } catch (error) {
    //         console.log(`failed on ${commonEvent}`)
    //         console.log(error)
    //     }
    // }   
    setProgressBar(1,1)
    console.log('extract done')
}