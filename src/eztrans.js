const path = require('path')
const fs = require('fs');
const PU = require('tcp-port-used');
const spawn = require('child_process').spawn;
const dataBaseO = require('./datas.js')
const {checkIsMapFile, sleep} = require('./globalutils.js')
const axios = require('axios')
const {translateable, note2able} = require('./datas.js')
const translatte = require('translatte');

function oPath(){
    return globalThis.oPath
}

function applyUserDict(input){
    const Udict = globalThis.settings.userdict
  
    for(let i=0;i<Object.keys(Udict).length;i++){
      const akey = Object.keys(Udict)[i]
      input = input.replaceAll(akey,Udict[akey])
    }
    return input
}

function encodeURIp(p) {
    p = p.replaceAll('■', '■0')
    p = p.replaceAll('%', '■1')
    p = p.replaceAll('％', '■2')
    return encodeURIComponent(p)
}

function decodeURIp(p, encodeSp=false) {
    p = decodeURIComponent(p)
    p = p.replaceAll('■1', '%')
    p = p.replaceAll('■0', '■')
    p = p.replaceAll('■2', '％')
    if(encodeSp){
        p = p.replaceAll(' ', ' ')
    }
    return p
}

function encodeSp(p, change=false){
    if(change){
        p = p.replaceAll(' ', ' ')
    }
    return p
}

class Translator{
    constructor(type){
        this.type = type
    }
    async translate(text){
        if(this.type === 'eztrans'){
            const t =  ((await axios.get(`http://localhost:8000/?text=${encodeURIp(text)}`))).data
            if(typeof(t) !== 'string'){
                console.log(t)
                return `ERROR: RETURNED ${JSON.stringify(t)}`
            }
            return decodeURIp(t)
        }
        if(this.type === 'google'){
            const translated = (await translatte(text, {to: 'ko'}))
            if(translated.text === '찾으시는 주소가 없습니다'){
                translated.text = text
            }
            console.log(translated.text)
            return translated.text
        }
    }
    getType(){
        return this.type
    }
    async isCrash(){
        if(this.type === 'eztrans'){
            if (!(await PU.check(8000))) {
                console.log('err')
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: 'Eztrans 서버와 연결할 수 없습니다.'
                });
                globalThis.mwindow.webContents.send('worked', 0);
                return true
            }
        }
        
        return false
    }
}

exports.trans = async (ev, arg) => {
    const dm = true
    const translator = new Translator(arg.type)
    try {
        const dir = Buffer.from(arg.dir, "base64").toString('utf8');
        const edir = path.join(dir, 'Extract')
        if (!fs.existsSync(edir)) {
            globalThis.mwindow.webContents.send('alert', {
                icon: 'error',
                message: 'Extract 폴더가 존재하지 않습니다'
            });
            globalThis.mwindow.webContents.send('worked', 0);
            return
        }
        let isUsed
        let ls
        console.log(translator.getType())
        if(translator.getType() == 'eztrans'){
            console.log('eztrans')
            await PU.check(8000).then(function (inUse) {
                isUsed = inUse
            })
            if (isUsed) {
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: '포트 8000이 사용중입니다.'
                });
                globalThis.mwindow.webContents.send('worked', 0);
                return
            }
            ls = spawn(path.join(oPath(), 'exfiles', 'eztrans-server.exe'));

            await sleep(1000)
            await PU.waitUntilUsed(8000)
            await sleep(1000)

        }

        const fileList = fs.readdirSync(edir)
        const max_files = fileList.length
        let worked_files = 0
        for (const i in fileList) {
            let typeOfFile = ''
            if (globalThis.settings.safeTrans || globalThis.settings.smartTrans) {
                const name = fileList[i]
                console.log(name)
                if (name.includes('ext_scripts.txt')) {
                    typeOfFile = 'src'
                    console.log('src')
                    if(!globalThis.settings.smartTrans){
                        continue
                    }
                } else if (name.includes('ext_note.txt')) {
                    typeOfFile = 'note'
                    console.log('skiping')
                    if(!globalThis.settings.smartTrans){
                        continue
                    }
                } else if (name.includes('ext_note2.txt')) {
                    typeOfFile = 'note2'
                    console.log('skiping')
                    if(!globalThis.settings.smartTrans){
                        continue
                    }
                } else if ((!(dataBaseO.default.includes(name))) && (!checkIsMapFile(name))) {
                    console.log('skiping')
                    continue
                }
                else if(name == 'ext_plugins.txt'){
                    if(!globalThis.settings.safeTrans){
                        console.log('skiping')
                        continue
                    }
                }
            }
            const iPath = path.join(edir, fileList[i])
            const read = applyUserDict(fs.readFileSync(iPath, 'utf-8')).split('\n')
            let output = ''
            let transIt = false
            for (const v in read) {
                try {
                    globalThis.mwindow.webContents.send('loading', ((worked_files / max_files) + (v / read.length / max_files)) * 100);
                    const readLine = read[v];
                    switch (typeOfFile){
                        case '':
                            const ouput = await translator.translate((readLine))
                            output += encodeSp(ouput) + '\n'
                            break
                        case 'src':
                            if(readLine.startsWith('D_TEXT ')){
                                let rl = readLine.split(' ')
                                if(rl.length > 3){
                                    while(rl.length > 3){
                                        rl[1] = rl[1]+' '+rl[2]
                                        rl.splice(2)
                                    }
                                }
                                const ouput = await translator.translate((rl[1]))
                                rl[1] = encodeSp(ouput, true)
                                output += rl.join(' ') + '\n'
                            }
                            else{
                                output += readLine + '\n'
                            }
                            break
                        case 'note':
                            let fi = ''
                            let rl = readLine
                            if(!transIt){
                                let startAble = false
                                for(const vv in translateable){
                                    if (readLine.startsWith(translateable[vv])){
                                        startAble = true
                                        fi = translateable[vv]
                                        break
                                    }
                                }
                                if(startAble){
                                    transIt = true
                                    rl = rl.substring(fi.length, rl.length)
                                }
                                else{
                                    output += rl + '\n'
                                    break
                                }
                            }
                            if(transIt){
                                if(rl.includes('>')){
                                    transIt = false
                                    rl = rl.substring(0, rl.indexOf('>'))
                                    const ouput = await translator.translate((rl))
                                    try{
                                        output += fi + encodeSp(ouput, true) + '>\n'
                                    }
                                    catch{
                                        output += fi + rl + '>\n'
                                        if (await translator.isCrash()){
                                            return
                                        }
                                    }
                                }
                                else{
                                    const ouput = await translator.translate((rl))
                                    try{
                                        output += fi + encodeSp(ouput, true) + '\n'
                                    }
                                    catch{
                                        output += fi + rl + '\n'
                                        if (await translator.isCrash()){
                                            return
                                        }
                                    }
                                }
                            }
                            else{
                                output += rl + '\n'
                            }
                            break
                        case 'note2':
                            if(transIt){
                                if(readLine.startsWith('\\>')){
                                    const ouput = await translator.translate((readLine))
                                    try{
                                        output += encodeSp(ouput, true) + '\n'
                                    }
                                    catch{
                                        output += readLine + '\n'
                                        if (await translator.isCrash()){
                                            return
                                        }
                                    }
                                }
                                else{
                                    transIt = false
                                }
                            }
                            if(!transIt){
                                if(note2able.includes(readLine)){
                                    transIt = true
                                }
                                output += readLine + '\n'
                            }
                            break
                    }
                } catch (error) {
                    console.log(read[v])
                    console.log('err')
                    if (await translator.isCrash()) {
                        return
                    }
                    output += read[v] + '\n'
                }
            }
            worked_files += 1
            fs.writeFileSync(iPath, output, 'utf-8')
            globalThis.mwindow.webContents.send('loading', worked_files / max_files * 100);
            await sleep(0)
        }
        if(translator.getType('eztrans')){
            ls.kill()
        }
        globalThis.mwindow.webContents.send('alert', '완료되었습니다');
        globalThis.mwindow.webContents.send('loading', 0);
    } catch (err) {
        globalThis.mwindow.webContents.send('alert', {
            icon: 'error',
            message: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    }
    globalThis.mwindow.webContents.send('worked', 0);
}
