const path = require('path')
const fs = require('fs');
const PU = require('tcp-port-used');
const spawn = require('child_process').spawn;
const dataBaseO = require('./datas.js')
const {checkIsMapFile, sleep} = require('./globalutils.js')
const axios = require('axios')
const {translateable, note2able, translateableOne, hanguls} = require('./datas.js')
const translatte = require('translatte');
const edTool = require('./edtool')
const { performance } = require('perf_hooks');
const open = require('open');

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
    p = p.replaceAll('|', '■3')
    return p
}

function decodeURIp(p, encodeSp=false) {
    p = p.replaceAll('■1', '%')
    p = p.replaceAll('■0', '■')
    p = p.replaceAll('■2', '％')
    p = p.replaceAll('■3', '|')
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
        if(globalThis.settings.DoNotTransHangul){
            if(hanguls.test(text)){
                return text
            }
        }
        text = applyUserDict(text)
        if(this.type === 'eztrans'){
            const a =  await axios.post(
                'http://localhost:8000/',
                text
            )
            let t = a.data
            if(typeof(t) !== 'string' && typeof(t) !== 'number'){
                return `ERROR: RETURNED ${JSON.stringify(t)}`
            }
            return (t)
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
    let ls

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
            ls = spawn(path.join(oPath(), 'exfiles', 'eztrans' ,'eztransServer.exe'));

            await sleep(1000)
            try {
                await PU.waitUntilUsed(8000)
            } catch (error) {
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: 'dotnet 6.0 이 설치되지 않은 것 같습니다. 5초 내에 다운로드 창을 띄웁니다.'
                });
                setTimeout(() => {open(`https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-desktop-6.0.1-windows-x86-installer`)}, 2000)
                try {
                    ls.kill()
                } catch (error) {   }
                globalThis.mwindow.webContents.send('worked', 0);
                return
            }
            await sleep(1000)
        }

        const fileList = fs.readdirSync(edir)
        const max_files = fileList.length
        let worked_files = 0
        const edDat = edTool.read(dir)
        let eed = {}
        console.log(Object.keys(edDat.main))
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
                    if(!globalThis.settings.smartTrans){
                        console.log('skiping note')
                        continue
                    }
                } else if (name.includes('ext_note2.txt')) {
                    typeOfFile = 'note2'
                    if(!globalThis.settings.smartTrans){
                        console.log('skiping note2')
                        continue
                    }
                    else{
                        let eed2 = edDat.main['ext_note2.json'].data
                        for(const i2 in eed2){
                            const cdat = eed2[i2]
                            eed[i2] = cdat.conf.code
                        }
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
            const fileRead = (fs.readFileSync(iPath, 'utf-8'))
            let output = ''
            let transIt = false
            let folkt = false
            let typeofit = 0

            if(typeOfFile == '' && translator.getType() === 'eztrans'){
                let reads = fileRead.split('\n')
                let a = ''
                let l = 0
                let chunks = []
                let debuging = false
                if(fileList[i] === 'Map004.txt'){
                    debuging = true
                }
                while(reads.length > 0){
                    const d = reads[0]
                    l += d.length
                    a += d + '\n'
                    if(l > 2000){
                        l = 0
                        chunks.push(encodeURIp(a))
                        a = ''
                    }
                    reads.shift()
                }
                chunks.push(encodeURIp(a))
                for(const v in chunks){
                    globalThis.mwindow.webContents.send('loading', ((worked_files / max_files) + (v / chunks.length / max_files)) * 100);
                    let ouput = ''
                    let temps = ''
                    try {
                        temps = await translator.translate(chunks[v])
                    } catch (error) {
                        console.log('err')
                        if (await translator.isCrash()) {
                            return
                        }
                        temps = chunks[v]
                    }
                    if(temps == chunks[v]){
                        console.log('err')
                        const r = chunks[v].split('\n')
                        let r2 = []
                        for (const a in r) {
                            const readLine = r[a]
                            try {
                                const tr = await translator.translate((readLine))
                                console.log(tr)
                                r2.push(tr)
                            } catch (error) {
                                console.log(readLine)
                                if (await translator.isCrash()) {
                                    return
                                }
                                r2.push(readLine)
                            }
                        }
                        ouput = r2.join('\n')
                    }
                    else{
                        ouput = temps
                    }
                    output += encodeSp(decodeURIp(ouput))
                }
            }
            else{
                const read = fileRead.split('\n')
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
                                    if(rl.length == 3 && isNaN(rl[2])){
                                        console.log(rl.join(' '))
                                        rl[1] = rl[1]+' '+rl[2]
                                        rl.splice(2)
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
                                        if (readLine.replaceAll(' ','').startsWith(translateable[vv])){
                                            startAble = true
                                            fi = translateable[vv]
                                            folkt = translateableOne.includes(fi)
                                            console.log(`${fi} | ${folkt}`)
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
                                    if(rl.includes('>') || (folkt && rl.includes(' '))){
                                        transIt = false
                                        let keyString = '>'
                                        if((folkt && rl.includes(' '))){
                                            keyString = ' '
                                        }
                                        let vax = '>\n'
                                        vax = rl.substring(rl.indexOf(keyString)) + '\n'
    
                                        
                                        rl = rl.substring(0, rl.indexOf(keyString))
                                        const ouput = await translator.translate((rl))
                                        try{
                                            output += fi + encodeSp(ouput, true) + vax
                                        }
                                        catch{
                                            output += fi + rl + vax
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
                                    if(eed[v] == 408){
                                        let run = true
                                        if(readLine.startsWith('\\>')){
                                            typeofit = 1
                                        }
                                        else if(typeofit == 1){
                                            run = false
                                            transIt = false
                                        }
                                        if(run){
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
                                    }
                                    else{
                                        transIt = false
                                    }
                                }
                                if(!transIt){
                                    if(note2able.includes(readLine) && eed[v] == 108){
                                        transIt = true
                                        typeofit = 0
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
            }
            worked_files += 1
            fs.writeFileSync(iPath, output, 'utf-8')
            globalThis.mwindow.webContents.send('loading', worked_files / max_files * 100);
            await sleep(0)
        }
        if(translator.getType('eztrans')){
            try {
                ls.kill()
            } catch (error) {}
        }
        globalThis.mwindow.webContents.send('alert', '완료되었습니다');
        globalThis.mwindow.webContents.send('loading', 0);
    } catch (err) {
        try {
            ls.kill()
        } catch (error) {}
        globalThis.mwindow.webContents.send('alert', {
            icon: 'error',
            message: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    }
    globalThis.mwindow.webContents.send('worked', 0);
}
