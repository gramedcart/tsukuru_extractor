"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const tcp_port_used_1 = __importDefault(require("tcp-port-used"));
const spawn = require('child_process').spawn;
const datas_js_1 = __importDefault(require("./datas.js"));
const globalutils_js_1 = require("./globalutils.js");
const axios_1 = __importDefault(require("axios"));
const datas_js_2 = require("./datas.js");
const edTool = __importStar(require("./edtool"));
const open_1 = __importDefault(require("open"));
const translatte_1 = __importDefault(require("translatte"));
const kakaotrans_js_1 = require("./libs/kakaotrans.js");
let junChori = false;
function oPath() {
    return globalThis.oPath;
}
function applyUserDict(input) {
    const Udict = globalThis.settings.userdict;
    for (let i = 0; i < Object.keys(Udict).length; i++) {
        const akey = Object.keys(Udict)[i];
        input = input.replaceAll(akey, Udict[akey]);
    }
    return input;
}
function encodeURIp(p) {
    p = p.replaceAll('■', '@user0');
    p = p.replaceAll('%', '@user1');
    p = p.replaceAll('％', '@user2');
    p = p.replaceAll('|', '@user3');
    return p;
}
function decodeURIp(p, encodeSp = false) {
    p = p.replaceAll('@user0', '■');
    p = p.replaceAll('@user1', '%');
    p = p.replaceAll('@user2', '％');
    p = p.replaceAll('@user3', '|');
    if (encodeSp) {
        p = p.replaceAll(' ', ' ');
    }
    return p;
}
function encodeSp(p, change = false) {
    if (change) {
        p = p.replaceAll(' ', ' ');
    }
    return p;
}
function isUnsafe(str) {
    return (str.includes('<') || str.includes('>') || str.includes('\\'));
}
const safeTransRegex = /(\%[0-9]+)|((\\[A-Za-z]+)((\[[A-Za-z0-9]+\])|(\<[A-Za-z0-9]+\>)))|(\\lsoff)|(<br>)|(\\(ii|[VvNnPpGgCcIi{}$.|!><^])(\[[0-9]+\])?)|(#)|(%)|(■[0-9]+)/g;
const fndi = /\\ *V *\[/g;
function makeid() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${result}`;
}
class Translator {
    constructor(type, type2 = '', langu = 'jp') {
        this.type = type;
        this.type2 = type2;
        this.ls = null;
        this.transMemory = {};
        this.langu = langu;
    }
    setLs(ls) {
        this.ls = ls;
    }
    KillLs() {
        try {
            this.ls.kill();
        }
        catch (error) { }
    }
    async translate(text) {
        let isEndPadding = 0;
        while (text.at(text.length - 1) === '\n') {
            text = text.substring(0, text.length - 1);
            isEndPadding += 1;
        }
        text = await this.translate2(text);
        while (isEndPadding > 0) {
            text += '\n';
            isEndPadding -= 1;
        }
        return text;
    }
    async translate2(text) {
        if (globalThis.settings.DoNotTransHangul) {
            if (datas_js_2.hanguls.test(text)) {
                return text;
            }
        }
        text = applyUserDict(text);
        if (this.type === 'eztrans') {
            let t;
            // console.log(text)
            try {
                const a = await axios_1.default.get('http://localhost:8000/', {
                    params: {
                        text: text
                    },
                    timeout: 10000
                });
                t = a.data;
            }
            catch (error) {
                try {
                    try {
                        this.KillLs();
                    }
                    catch (error) { }
                    this.ls = spawn(path_1.default.join(oPath(), 'exfiles', 'eztrans', 'eztransServer.exe'));
                    console.log('spawned');
                    await (0, globalutils_js_1.sleep)(2000);
                    await tcp_port_used_1.default.waitUntilUsed(8000);
                }
                catch (error) {
                    console.log('spawn failed');
                }
            }
            if (typeof (t) !== 'string' && typeof (t) !== 'number') {
                return `ERROR: RETURNED ${JSON.stringify(t)}`;
            }
            return (t);
        }
        else if (this.type === 'transEngine') {
            function encodeSafe(text, sup = false) {
                if (sup) {
                    console.log('encodeSafe');
                    text.replaceAll('◆', '◇').replaceAll('\n', '◆');
                }
                return text;
            }
            function decodeSafe(text, sup = false) {
                if (sup) {
                    console.log('decodeSafe');
                    text.replaceAll('◆', '\n');
                }
                text.replaceAll(fndi, '\\V[');
                return text;
            }
            let t;
            // console.log(text)
            try {
                if (text.length < 1) {
                    console.log("zero len");
                    t = text;
                }
                else if (Object.keys(this.transMemory).includes(text)) {
                    console.log('from memory');
                    t = this.transMemory[text];
                }
                else {
                    const tempTxt = encodeSafe(text, this.type2 === 'papago');
                    console.log('requesting');
                    if (this.type2 === 'google') {
                        const a = await (0, translatte_1.default)(tempTxt, { from: (this.langu), to: 'ko' });
                        await (0, globalutils_js_1.sleep)(3000);
                        return (a.text);
                    }
                    else if (this.type2 === 'googleh' || this.type2 === 'kakao') {
                        await (0, globalutils_js_1.sleep)(5000);
                        let posqi = 0;
                        let ids = [];
                        function makeSureIsSafe(str) {
                            while (true) {
                                const matches = safeTransRegex.exec(str);
                                if (matches === null) {
                                    console.log(str);
                                    return str.replaceAll('㈜', '#');
                                }
                                const m = matches[0];
                                const id = `#${ids.length}`;
                                const vid = `㈜${ids.length}`;
                                ids.push(m);
                                str = str.replaceAll(m, vid);
                            }
                        }
                        let sliced = decodeURIp(tempTxt).split('\n');
                        let mog = [];
                        for (let i = 0; i < sliced.length; i++) {
                            const origin = sliced[i];
                            sliced[i] = makeSureIsSafe(sliced[i]);
                            if (isUnsafe(sliced[i])) {
                                console.log(origin);
                                mog.push([origin, i]);
                                sliced[i] = 'a';
                            }
                        }
                        const temp2 = sliced.join('\n');
                        if (mog.length === sliced.length) {
                            return encodeURIp(tempTxt);
                        }
                        const a = this.type2 === 'kakao' ? (await (0, kakaotrans_js_1.kakaoTrans)(temp2, this.langu)) : (await (0, translatte_1.default)(temp2, { from: (this.langu), to: 'ko' })).text;
                        console.log('after process');
                        let finalStr = a;
                        for (let i = (ids.length - 1); i >= 0; i--) {
                            const str = ids[i];
                            const findRegex = new RegExp(`# *${i}`, 'g');
                            finalStr = finalStr.replace(findRegex, str);
                        }
                        let aSplit = finalStr.split('\n');
                        for (const m of mog) {
                            aSplit[m[1]] = m[0];
                        }
                        return encodeURIp(aSplit.join('\n'));
                    }
                    else {
                        const a = (await axios_1.default.get('http://localhost:8000/', {
                            params: {
                                text: tempTxt,
                                platform: this.type2,
                                source: this.langu,
                                target: 'ko'
                            },
                            timeout: 10000
                        }));
                        try {
                            t = a.data.data.translatedContent;
                            t = decodeSafe(t, this.type2 === 'papago');
                            this.transMemory[text] = t;
                        }
                        catch (error) {
                            console.log('err: notranslatedContent');
                            t = text;
                        }
                    }
                }
            }
            catch (error) {
                if (this.type2 === 'googleh' || this.type2 === 'kakao') {
                    console.log(error);
                }
                else {
                    try {
                        try {
                            this.KillLs();
                        }
                        catch (error) { }
                        this.ls = spawn(path_1.default.join(oPath(), 'exfiles', 'transEngine', 'translate_engine.exe'));
                        console.log('spawned');
                        await (0, globalutils_js_1.sleep)(2000);
                        await tcp_port_used_1.default.waitUntilUsed(8000);
                    }
                    catch (error) {
                        console.log('spawn failed');
                    }
                }
            }
            if (typeof (t) !== 'string' && typeof (t) !== 'number') {
                return `ERROR: RETURNED ${JSON.stringify(t)}`;
            }
            return `${t}`;
        }
    }
    getType() {
        return this.type;
    }
    async isCrash() {
        if (this.type === 'eztrans') {
            if (!(await tcp_port_used_1.default.check(8000))) {
                console.log('err');
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: 'Eztrans 서버와 연결할 수 없습니다.'
                });
                globalThis.mwindow.webContents.send('worked', 0);
                return true;
            }
        }
        return false;
    }
}
function setProgressBar(now, max, multipl = 70) {
    console.log(`${now} / ${max}`);
    globalThis.mwindow.webContents.send('loading', (now / max) * multipl);
}
let translateMemorys = {};
exports.trans = async (ev, arg) => {
    const dm = true;
    globalThis.settings.safeTrans = true;
    globalThis.settings.smartTrans = true;
    globalThis.settings.fastEztrans = true;
    let compatibilityMode = false;
    let type2 = '';
    const langu = arg.langu;
    if (arg.type == 'eztransh') {
        globalThis.settings.smartTrans = false;
        compatibilityMode = true;
        arg.type = 'eztrans';
    }
    if (arg.type == 'papago') {
        globalThis.settings.smartTrans = false;
        arg.type = 'transEngine';
        type2 = 'papago';
    }
    if (arg.type == 'google') {
        globalThis.settings.smartTrans = false;
        arg.type = 'transEngine';
        type2 = 'google';
    }
    if (arg.type == 'googleh') {
        junChori = true;
        globalThis.settings.smartTrans = false;
        arg.type = 'transEngine';
        type2 = 'googleh';
    }
    if (arg.type == 'kakao') {
        junChori = true;
        globalThis.settings.smartTrans = false;
        arg.type = 'transEngine';
        type2 = 'kakao';
    }
    const translator = new Translator(arg.type, type2, langu);
    let ls;
    try {
        const dir = Buffer.from(arg.dir, "base64").toString('utf8');
        const edir = path_1.default.join(dir, 'Extract');
        if (!fs_1.default.existsSync(edir)) {
            globalThis.mwindow.webContents.send('alert', {
                icon: 'error',
                message: 'Extract 폴더가 존재하지 않습니다'
            });
            globalThis.mwindow.webContents.send('worked', 0);
            return;
        }
        let isUsed;
        const fileList = fs_1.default.readdirSync(edir);
        const max_files = fileList.length;
        let fullFileLength = 0;
        let workedFileLength = 0;
        console.log(translator.getType());
        for (const i in fileList) {
            const iPath = path_1.default.join(edir, fileList[i]);
            fullFileLength += fs_1.default.readFileSync(iPath, 'utf-8').length;
        }
        console.log(fullFileLength);
        if (translator.getType() == 'transEngine' && type2 === 'papago') {
            console.log('transEngine');
            await tcp_port_used_1.default.check(8000).then(function (inUse) {
                isUsed = inUse;
            });
            if (isUsed) {
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: '포트 8000이 사용중입니다.'
                });
                globalThis.mwindow.webContents.send('worked', 0);
                return;
            }
            ls = spawn(path_1.default.join(oPath(), 'exfiles', 'transEngine', 'translate_engine.exe'));
            translator.setLs(ls);
            await (0, globalutils_js_1.sleep)(1000);
            try {
                await tcp_port_used_1.default.waitUntilUsed(8000);
            }
            catch (error) {
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: '구동 도중 오류가 발생하였습니다'
                });
                try {
                    translator.KillLs();
                }
                catch (error) { }
                globalThis.mwindow.webContents.send('worked', 0);
                return;
            }
            await (0, globalutils_js_1.sleep)(1000);
        }
        if (translator.getType() == 'eztrans') {
            console.log('eztrans');
            await tcp_port_used_1.default.check(8000).then(function (inUse) {
                isUsed = inUse;
            });
            if (isUsed) {
                globalThis.mwindow.webContents.send('alert', {
                    icon: 'error',
                    message: '포트 8000이 사용중입니다.'
                });
                globalThis.mwindow.webContents.send('worked', 0);
                return;
            }
            ls = spawn(path_1.default.join(oPath(), 'exfiles', 'eztrans', 'eztransServer.exe'));
            translator.setLs(ls);
            // ls.stdout.on('data', function (data) {
            //     console.log("eztrans");
            //     console.log('data' + data);
            // });
            ls.stderr.on('data', function (data) {
                console.log("eztrans - Error");
                console.log('test: ' + data);
            });
            ls.on('close', function (code) {
                console.log("eztrans");
                console.log("close");
            });
            await (0, globalutils_js_1.sleep)(3000);
            try {
                await tcp_port_used_1.default.waitUntilUsed(8000);
            }
            catch (error) {
                globalThis.mwindow.webContents.send('eztransError');
                setTimeout(() => { (0, open_1.default)(`https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-desktop-6.0.1-windows-x86-installer`); }, 2000);
                try {
                    translator.KillLs();
                }
                catch (error) { }
                globalThis.mwindow.webContents.send('worked', 0);
                return;
            }
            await (0, globalutils_js_1.sleep)(1000);
        }
        let worked_files = 0;
        const edDat = edTool.read(dir);
        let eed = {};
        console.log(Object.keys(edDat.main));
        let typeOfFile = '';
        function checkVaildTransFile(name) {
            if (globalThis.settings.safeTrans || globalThis.settings.smartTrans) {
                console.log(name);
                if (compatibilityMode) {
                    const NoneCompList = [
                        'System.txt'
                    ];
                    if (NoneCompList.includes(name)) {
                        console.log('skipping by compatibilityMode');
                        return false;
                    }
                }
                if (name.includes('ext_scripts.txt')) {
                    typeOfFile = 'src';
                    console.log('src');
                    if (!globalThis.settings.smartTrans || compatibilityMode) {
                        return false;
                    }
                }
                else if (name.includes('ext_note.txt')) {
                    typeOfFile = 'note';
                    if (!globalThis.settings.smartTrans || compatibilityMode) {
                        console.log('skiping note');
                        return false;
                    }
                }
                else if (name.includes('ext_note2.txt')) {
                    typeOfFile = 'note2';
                    if (!globalThis.settings.smartTrans || compatibilityMode) {
                        console.log('skiping note2');
                        return false;
                    }
                    else {
                        let eed2 = edDat.main['ext_note2.json'].data;
                        for (const i2 in eed2) {
                            const cdat = eed2[i2];
                            eed[i2] = cdat.conf.code;
                        }
                    }
                }
                else if ((!(datas_js_1.default.default.includes(name))) && (!(0, globalutils_js_1.checkIsMapFile)(name))) {
                    console.log('skiping');
                    return false;
                }
                else if (name == 'ext_plugins.txt') {
                    if (globalThis.settings.safeTrans || compatibilityMode) {
                        console.log('skiping ' + name);
                        return false;
                    }
                }
                return true;
            }
        }
        const useOldWay = (translator.getType() === 'eztrans');
        const readLen = (translator.getType() === 'eztrans') ? 1000
            : (translator.type2 === 'google') ? 1000
                : (translator.type2 === 'googleh') ? 4500
                    : (translator.type2 === 'kakao') ? 4500
                        : 220;
        if (!useOldWay) {
            let readed = [];
            let transTargetLen = 0;
            for (const i in fileList) {
                if (!checkVaildTransFile(fileList[i])) {
                    continue;
                }
                const iPath = path_1.default.join(edir, fileList[i]);
                const read = fs_1.default.readFileSync(iPath, 'utf-8');
                transTargetLen += read.length;
                readed = readed.concat(read.split('\n'));
            }
            let memoryAdd = {};
            let mem = [];
            let ind = 0;
            for (const s of readed) {
                ind += 1;
                if (!mem.includes(s)) {
                    mem.push(s);
                    memoryAdd[s] = s;
                }
                if (ind % 1000 === 0) {
                    console.log(`parsing: ${ind} / ${readed.length}`);
                    await (0, globalutils_js_1.sleep)(1);
                }
            }
            let chunks = [];
            let chunkKeys = [];
            let cLen = 0;
            let translatedLen = 0;
            async function doTrans() {
                let translated = '';
                console.log('translating new');
                const chunkJoin = chunks.join('\n');
                try {
                    translated = await translator.translate(encodeURIp(chunkJoin));
                }
                catch (error) {
                    translated = chunkJoin;
                }
                let translatedSplit = translated.split('\n');
                const isLine = (translatedSplit.length !== chunks.length);
                const hangule = (translated === chunkJoin) && ((!globalThis.settings.DoNotTransHangul) || (!datas_js_2.hanguls.test(translated)));
                if (hangule || isLine) {
                    async function reTrans(i, size) {
                        try {
                            const sliced = chunks.slice(i, i + (size - 1));
                            const slicejoin = sliced.join('\n');
                            console.log(`retranslating: ${i} / ${slicejoin.length}`);
                            const retrans = (await translator.translate(encodeURIp(slicejoin))).split('\n');
                            if (retrans.length !== sliced.length) {
                                throw 'err';
                            }
                            for (let i2 = 0; i2 < sliced.length; i2++) {
                                chunks[i + i2] = retrans[i2];
                            }
                            translatedLen += slicejoin.length;
                            setProgressBar(translatedLen, transTargetLen, 100);
                        }
                        catch (error) {
                            console.log(`error on ${chunks.slice(i, i + (size - 1))}`);
                        }
                    }
                    console.log(`err-line ${chunks.length} | ${translatedSplit.length}`);
                    const retransSize = Math.floor(chunks.length / 5);
                    for (let i = 0; i < chunks.length; i += retransSize) {
                        reTrans(i, retransSize);
                    }
                }
                else {
                    for (let i = 0; i < chunks.length; i++) {
                        translatedLen += chunks[i].length;
                        setProgressBar(translatedLen, transTargetLen, 100);
                        chunks[i] = translatedSplit[i];
                    }
                }
                for (let i = 0; i < chunks.length; i++) {
                    translateMemorys[chunkKeys[i]] = chunks[i];
                }
                chunks = [];
                chunkKeys = [];
                cLen = 0;
            }
            for (const key in memoryAdd) {
                const toTrans = memoryAdd[key];
                const len = (toTrans.length + 1);
                if (toTrans.length === 1) {
                    translatedLen += 1;
                    translateMemorys[key] = toTrans;
                    setProgressBar(translatedLen, transTargetLen, 100);
                }
                else if (cLen + len > readLen) {
                    await doTrans();
                }
                else {
                    cLen += len;
                    chunks.push(toTrans);
                    chunkKeys.push(key);
                }
            }
            await doTrans();
        }
        for (const i in fileList) {
            typeOfFile = '';
            if (!checkVaildTransFile(fileList[i])) {
                continue;
            }
            console.log(typeOfFile);
            const iPath = path_1.default.join(edir, fileList[i]);
            const fileRead = (fs_1.default.readFileSync(iPath, 'utf-8'));
            let output = '';
            let transIt = false;
            let folkt = false;
            let typeofit = 0;
            if (typeOfFile == '' && globalThis.settings.fastEztrans) {
                if (!useOldWay) {
                    const readed = fileRead.split('\n');
                    let resultArray = [];
                    for (const s of readed) {
                        resultArray.push(translateMemorys[s]);
                    }
                    console.log('applied new');
                    output += encodeSp(decodeURIp(resultArray.join('\n')));
                    setProgressBar(workedFileLength + output.length, fullFileLength);
                }
                else {
                    let reads = fileRead.split('\n');
                    let a = '';
                    let l = 0;
                    let chunks = [];
                    while (reads.length > 0) {
                        const d = reads[0];
                        if (l + d.length > readLen) {
                            l = 0;
                            chunks.push(encodeURIp(a));
                            a = '';
                        }
                        l += d.length;
                        a += d + '\n';
                        reads.shift();
                    }
                    chunks.push(encodeURIp(a));
                    for (const v in chunks) {
                        let ouput = '';
                        let temps = '';
                        try {
                            temps = await translator.translate(chunks[v]);
                        }
                        catch (error) {
                            console.log('err-crash');
                            if (await translator.isCrash()) {
                                return;
                            }
                            temps = chunks[v];
                        }
                        const chunkLen = chunks[v].split('\n').length;
                        const tempLen = temps.split('\n').length;
                        const isLine = (chunkLen !== tempLen);
                        const hangule = (temps == chunks[v]) && ((!globalThis.settings.DoNotTransHangul) || (!datas_js_2.hanguls.test(temps)));
                        if (hangule || isLine) {
                            console.log(`err-line ${chunkLen} | ${tempLen}`);
                            const r = chunks[v].split('\n');
                            let r2 = [];
                            for (const a in r) {
                                const readLine = r[a];
                                try {
                                    const tr = await translator.translate((readLine));
                                    r2.push(tr);
                                }
                                catch (error) {
                                    console.log(readLine);
                                    if (await translator.isCrash()) {
                                        return;
                                    }
                                    r2.push(readLine);
                                }
                            }
                            ouput = r2.join('\n');
                        }
                        else {
                            ouput = temps;
                        }
                        output += encodeSp(decodeURIp(ouput));
                        setProgressBar(workedFileLength + output.length, fullFileLength);
                    }
                }
            }
            else {
                const read = fileRead.split('\n');
                for (const v in read) {
                    try {
                        setProgressBar(workedFileLength + output.length, fullFileLength);
                        const readLine = read[v];
                        switch (typeOfFile) {
                            case '':
                                const ouput = await translator.translate((readLine));
                                const d = encodeSp(ouput) + '\n';
                                output += d;
                                break;
                            case 'src':
                                if (readLine.startsWith('D_TEXT ')) {
                                    let rl = readLine.split(' ');
                                    if (rl.length > 3) {
                                        while (rl.length > 3) {
                                            rl[1] = rl[1] + ' ' + rl[2];
                                            rl.splice(2);
                                        }
                                    }
                                    if (rl.length == 3 && isNaN(parseInt(rl[2]))) {
                                        console.log(rl.join(' '));
                                        rl[1] = rl[1] + ' ' + rl[2];
                                        rl.splice(2);
                                    }
                                    const ouput = await translator.translate((rl[1]));
                                    rl[1] = encodeSp(ouput, true);
                                    output += rl.join(' ') + '\n';
                                }
                                else {
                                    output += readLine + '\n';
                                }
                                break;
                            case 'note':
                                let fi = '';
                                let rl = readLine;
                                if (!transIt) {
                                    let startAble = false;
                                    for (const vv in datas_js_2.translateable) {
                                        if (readLine.replaceAll(' ', '').startsWith(datas_js_2.translateable[vv])) {
                                            startAble = true;
                                            fi = datas_js_2.translateable[vv];
                                            folkt = datas_js_2.translateableOne.includes(fi);
                                            console.log(`${fi} | ${folkt}`);
                                            break;
                                        }
                                    }
                                    if (startAble) {
                                        transIt = true;
                                        rl = rl.substring(fi.length, rl.length);
                                    }
                                    else {
                                        output += rl + '\n';
                                        break;
                                    }
                                }
                                if (transIt) {
                                    if (rl.includes('>') || (folkt && rl.includes(' '))) {
                                        transIt = false;
                                        let keyString = '>';
                                        if ((folkt && rl.includes(' '))) {
                                            keyString = ' ';
                                        }
                                        let vax = '>\n';
                                        vax = rl.substring(rl.indexOf(keyString)) + '\n';
                                        rl = rl.substring(0, rl.indexOf(keyString));
                                        const ouput = await translator.translate((rl));
                                        try {
                                            output += fi + encodeSp(ouput, true) + vax;
                                        }
                                        catch (_a) {
                                            output += fi + rl + vax;
                                            if (await translator.isCrash()) {
                                                return;
                                            }
                                        }
                                    }
                                    else {
                                        const ouput = await translator.translate((rl));
                                        try {
                                            output += fi + encodeSp(ouput, true) + '\n';
                                        }
                                        catch (_b) {
                                            output += fi + rl + '\n';
                                            if (await translator.isCrash()) {
                                                return;
                                            }
                                        }
                                    }
                                }
                                else {
                                    output += rl + '\n';
                                }
                                break;
                            case 'note2':
                                if (transIt) {
                                    if (eed[v] == 408) {
                                        let run = true;
                                        if (readLine.startsWith('\\>')) {
                                            typeofit = 1;
                                        }
                                        else if (typeofit == 1) {
                                            run = false;
                                            transIt = false;
                                        }
                                        if (run) {
                                            const ouput = await translator.translate((readLine));
                                            try {
                                                output += encodeSp(ouput, true) + '\n';
                                            }
                                            catch (_c) {
                                                output += readLine + '\n';
                                                if (await translator.isCrash()) {
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        transIt = false;
                                    }
                                }
                                if (!transIt) {
                                    if (datas_js_2.note2able.includes(readLine) && eed[v] == 108) {
                                        transIt = true;
                                        typeofit = 0;
                                    }
                                    output += readLine + '\n';
                                }
                                break;
                        }
                    }
                    catch (error) {
                        console.log(read[v]);
                        console.log('err');
                        if (await translator.isCrash()) {
                            return;
                        }
                        output += read[v] + '\n';
                    }
                }
            }
            worked_files += 1;
            workedFileLength += output.length;
            fs_1.default.writeFileSync(iPath, output, 'utf-8');
            // globalThis.mwindow.webContents.send('loading', worked_files / max_files * 100);
            await (0, globalutils_js_1.sleep)(0);
        }
        translator.KillLs();
        globalThis.mwindow.webContents.send('alert', '완료되었습니다');
        globalThis.mwindow.webContents.send('loading', 0);
    }
    catch (err) {
        translator.KillLs();
        globalThis.mwindow.webContents.send('alert', {
            icon: 'error',
            message: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    }
    globalThis.mwindow.webContents.send('worked', 0);
};
