import { BrowserWindow } from "electron";

interface PTools{
    send: (channel: string, ...args: any[]) => void;
    packed?: boolean;
    sendError: (txt: string) => void;
    sendAlert: (txt: string) => void;
    worked: () => void;
    init: () => void;
    rmBom?: (txt:string) => string
}


function INIT(){
    pTools = {
        send: globalThis.mwindow.webContents.send,
        sendError: (txt:string) => {
            globalThis.mwindow.webContents.send('alert', {icon: 'error',  message: txt});
        },
        sendAlert: (txt:string) => {
            globalThis.mwindow.webContents.send('alert', txt);
        },
        worked: () => {
            globalThis.mwindow.webContents.send('worked', 0);
            globalThis.mwindow.webContents.send('loading', 0);
        },
        init: () => {}
    }
}

function callBeforeInit(){console.error('Ptools called before init')}

let pTools:PTools = {
    send: (channel: string, ...args: any[]) => {callBeforeInit()},
    sendError: (txt: string) => {callBeforeInit()},
    sendAlert: (txt: string) => {callBeforeInit()},
    worked: () => {callBeforeInit()},
    init: INIT
}



const Tools = {
    send: (channel: string, ...args: any[]) => {pTools.send(channel, ...args)},
    packed: ((require.main && require.main.filename.indexOf('app.asar') !== -1) || (process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 0)),
    sendError: (txt: string) => {pTools.sendError(txt)},
    sendAlert: (txt: string) => {pTools.sendAlert(txt)},
    worked: () => {pTools.worked()},
    init: INIT,
    rmBom: (txt:string) => {
        if (txt.charCodeAt(0) === 0xFEFF) {
            txt = txt.substring(1);
        }
        return txt
    }
}


export default Tools