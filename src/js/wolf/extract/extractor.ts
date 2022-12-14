import path from 'path'
import fs from 'fs'
import { extractEvent } from './ext_events.js'
import { wolfExtractMap } from '../parser/Map.js';

export async function extract(){
    
}

function getAllFileInDir(Directory:string, ext:null|string = null) {
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

export async function extractFolder(DataDir:string){
    // const maps = await fg(path.join(DataDir,'**','*.mps').replaceAll('\\','/'))
    const maps = (getAllFileInDir(DataDir, '.mps'))

    for(const map of maps){
        try {
            const pa = wolfExtractMap(fs.readFileSync(map))
            for(const event of pa.events){
                for(const page of event.pages){
                    extractEvent(page.cmd, map)
                }
            }   
        } catch (error) {
            console.log(`failed on ${map}`)
        }

    }
    console.log('extract done')
}