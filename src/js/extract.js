"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptDir = exports.DecryptDir = exports.format_extracted = exports.extract = exports.pack_externMsg = exports.parse_externMsg = exports.init_extract = exports.setObj = void 0;
const path_1 = __importDefault(require("path"));
const parse_1 = __importDefault(require("@fast-csv/parse"));
const encoding_japanese_1 = __importDefault(require("encoding-japanese"));
const format_1 = require("@fast-csv/format");
const fileCrypto_1 = require("./fileCrypto");
const datas_1 = require("./datas");
let eventID = 0;
let hadComment = false;
let hadMemoComment = false;
function addtodic(pa, obj, usePath = '', conf = undefined, spliter = false) {
    const Path = pa;
    if (pa === '%comment%') {
        const id = `comment_${(Object.keys(obj.main)).length}`;
        obj.main[id] = { var: conf.comment, conf: { isComment: true }, qpath: usePath };
        return obj;
    }
    let val = returnVal(Path, obj.edited);
    if (!strNullSafe(usePath)) {
        usePath = '';
    }
    if (usePath == '') {
        if (conf !== undefined && conf.type == 'event') {
            if ([356, 357].includes(conf.code)) {
                usePath = 'script';
            }
            if ([355, 655].includes(conf.code)) {
                usePath = 'javascript';
            }
            if ([108, 408].includes(conf.code)) {
                usePath = 'note2';
            }
        }
    }
    if (val !== undefined && val !== null && typeof (val) === 'string' && (val.length > 0 || globalThis.settings.ExtractAddLine)) {
        const id = Path;
        if (usePath === 'note' || spliter) {
            obj = addtodic('%comment%', obj, usePath, { comment: '-----' });
        }
        obj.main[id] = { var: val, conf: conf, qpath: usePath };
        hadComment = false;
    }
    return obj;
}
function addtodicSpliter(pa, obj, usePath = '', conf = undefined) {
    return addtodic(pa, obj, usePath, conf, true);
}
function addComment(obj, comment, usePath = '', force = 'nonforce') {
    if (force === 'force') {
        hadComment = false;
    }
    if (!hadComment) {
        hadComment = true;
        return addtodic('%comment%', obj, usePath, { comment: comment });
    }
    return obj;
}
const addto = (key, val, temppp) => {
    let Keys = key.split('.');
    const fkey = Keys[0];
    if (temppp === undefined) {
        temppp = {};
    }
    if (Keys.length == 1) {
        temppp[fkey] = val;
    }
    else {
        Keys.shift();
        if (temppp[fkey] === undefined) {
            temppp[fkey] = {};
        }
        temppp[fkey] = addto(Keys.join('.'), val, temppp[fkey]);
    }
    return temppp;
};
const returnVal = (key, temppp) => {
    let Keys = key.split('.');
    const fkey = Keys[0];
    if (temppp === undefined) {
        console.log(key);
        return '';
    }
    if (Keys.length == 1) {
        return temppp[fkey];
    }
    else {
        Keys.shift();
        if (temppp[fkey] === undefined) {
            temppp[fkey] = {};
        }
        return returnVal(Keys.join('.'), temppp[fkey]);
    }
};
exports.setObj = addto;
function obNullSafe(c) {
    return (typeof c === 'object' && c !== undefined && c !== null);
}
function strNullSafe(d) {
    return (typeof d === 'string' && d !== undefined && d !== null);
}
const init_extract = (arg) => {
    hadComment = false;
    function c(fileName) {
        globalThis.gb[fileName] = { data: {} };
        globalThis.gb[fileName].outputText = '';
        globalThis.gb[fileName].isbom = false;
    }
    if (globalThis.settings.onefile_src && arg.ext_src) {
        c('ext_scripts.json');
    }
    if (globalThis.settings.onefile_src && arg.ext_javascript) {
        c('ext_javascript.json');
    }
    if (globalThis.settings.onefile_note && arg.ext_note) {
        c('ext_note.json');
        c('ext_note2.json');
    }
    if (globalThis.settings.oneMapFile) {
        c('Maps.json');
    }
};
exports.init_extract = init_extract;
function Extreturnit(dat_obj, Path = '', nas = null) {
    if (typeof (nas) === 'object' && nas !== null) {
        const keys = Object.keys(nas);
        for (let i = 0; i < keys.length; i++) {
            if (Path === '') {
                dat_obj = Extreturnit(dat_obj, keys[i], nas[keys[i]]);
            }
            else {
                dat_obj = Extreturnit(dat_obj, Path + '.' + keys[i], nas[keys[i]]);
            }
        }
        return dat_obj;
    }
    else {
        return addtodic(Path, dat_obj, 'ext');
    }
}
const parse_externMsg = (dir, useI) => {
    return new Promise((resolve, reject) => {
        let a = {};
        parse_1.default.parseFile(dir, { encoding: "binary" })
            .on('data', (row) => {
            function Convert(txt) {
                if (txt === undefined || txt === null) {
                    return '';
                }
                const bf = Buffer.from(txt, "binary");
                const Utf8Array = new Uint8Array(encoding_japanese_1.default.convert(bf, 'UTF8', 'AUTO'));
                return new TextDecoder().decode(Utf8Array);
            }
            if (useI) {
                a[`\\M[${Convert(row[0])}]`] = Convert(row[1]);
            }
            else {
                a[Convert(row[0])] = Convert(row[1]);
            }
        })
            .on('end', () => {
            resolve(a);
        });
    });
};
exports.parse_externMsg = parse_externMsg;
const pack_externMsg = (dir, data) => {
    return new Promise((resolve, reject) => {
        let rows = [];
        for (const i in data) {
            rows.push([i, data[i]]);
        }
        (0, format_1.writeToPath)(dir, rows)
            .on('error', err => console.error(err))
            .on('finish', () => resolve());
    });
};
exports.pack_externMsg = pack_externMsg;
const extract = async (filedata, conf, ftype) => {
    const extended = conf.extended;
    const fileName = conf.fileName;
    const dir = conf.dir;
    const dirf = dir + fileName + '\\';
    globalThis.gb[fileName] = { data: {} };
    if (filedata.charCodeAt(0) === 0xFEFF) {
        filedata = filedata.substr(1);
        globalThis.gb[fileName].isbom = true;
    }
    else {
        globalThis.gb[fileName].isbom = false;
    }
    let data;
    try {
        data = JSON.parse(filedata);
    }
    catch (_a) {
        return {
            datobj: {},
            edited: {},
            conf: conf
        };
    }
    let dat_obj = {
        main: {},
        edited: data
    };
    if (ftype == 'map') {
        if (globalThis.settings.oneMapFile) {
            dat_obj = addComment(dat_obj, '------- MAP -------');
        }
        if (strNullSafe(data.displayName)) {
            dat_obj = addtodic(`displayName`, dat_obj);
        }
        if (conf.note) {
            if (globalThis.settings.extractSomeScript) {
                if (isIncludeAble(data.note)) {
                    dat_obj = addtodic('note', dat_obj, 'note');
                }
            }
            else {
                dat_obj = addtodic('note', dat_obj, 'note');
            }
        }
        if (obNullSafe(data.events)) {
            for (let i = 0; i < (data.events.length); i++) {
                if (obNullSafe(data.events[i]) && obNullSafe(data.events[i].pages)) {
                    if (conf.note) {
                        console.log(data.events[i].note);
                        if (globalThis.settings.extractSomeScript) {
                            if (isIncludeAble(data.events[i].note)) {
                                dat_obj = addtodic(`events.${i}.note`, dat_obj, 'note');
                            }
                        }
                        else {
                            dat_obj = addtodic(`events.${i}.note`, dat_obj, 'note');
                        }
                    }
                    for (let a = 0; a < (data.events[i].pages.length); a++) {
                        if (obNullSafe(data.events[i].pages[a]) && obNullSafe(data.events[i].pages[a].list)) {
                            dat_obj = forEvent(data.events[i].pages[a], dat_obj, conf, `events.${i}.pages.${a}`);
                        }
                    }
                }
            }
        }
    }
    else if (ftype == 'sys') {
        if (obNullSafe(data.armorTypes)) {
            for (let i = 0; i < (data.armorTypes.length); i++) {
                dat_obj = addtodicSpliter(`armorTypes.${i}`, dat_obj);
            }
        }
        addtodic(`currencyUnit`, dat_obj);
        if (obNullSafe(data.elements)) {
            for (let i = 0; i < (data.elements.length); i++) {
                dat_obj = addtodicSpliter(`elements.${i}`, dat_obj);
            }
        }
        if (obNullSafe(data.equipTypes)) {
            for (let i = 0; i < (data.equipTypes.length); i++) {
                dat_obj = addtodicSpliter(`equipTypes.${i}`, dat_obj);
            }
        }
        addtodic(`gameTitle`, dat_obj);
        if (obNullSafe(data.skillTypes)) {
            for (let i = 0; i < (data.skillTypes.length); i++) {
                dat_obj = addtodicSpliter(`skillTypes.${i}`, dat_obj);
            }
        }
        if (obNullSafe(data.terms)) {
            if (obNullSafe(data.terms.basic)) {
                for (let i = 0; i < (data.terms.basic.length); i++) {
                    dat_obj = addtodicSpliter(`terms.basic.${i}`, dat_obj);
                }
            }
            if (obNullSafe(data.terms.commands)) {
                for (let i = 0; i < (data.terms.commands.length); i++) {
                    dat_obj = addtodicSpliter(`terms.commands.${i}`, dat_obj);
                }
            }
            if (obNullSafe(data.terms.params)) {
                for (let i = 0; i < (data.terms.params.length); i++) {
                    dat_obj = addtodicSpliter(`terms.params.${i}`, dat_obj);
                }
            }
            if (obNullSafe(data.terms.messages)) {
                for (const i of Object.keys(data.terms.messages)) {
                    dat_obj = addtodicSpliter(`terms.messages.${i}`, dat_obj);
                }
            }
        }
        if (obNullSafe(data.weaponTypes)) {
            for (let i = 0; i < (data.weaponTypes.length); i++) {
                dat_obj = addtodicSpliter(`weaponTypes.${i}`, dat_obj);
            }
        }
    }
    else if (ftype == 'ex') {
        dat_obj = Extreturnit(dat_obj, '', dat_obj.edited);
    }
    else if (ftype == 'ene2') {
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            if (!(obNullSafe(d) && obNullSafe(d.pages))) {
                continue;
            }
            for (let i2 = 0; i2 < d.pages.length; i2++) {
                if (!(obNullSafe(d.pages[i2]) && obNullSafe(d.pages[i2].list))) {
                    continue;
                }
                dat_obj = forEvent(d.pages[i2], dat_obj, conf, `${i}.pages.${i2}`);
            }
        }
    }
    else {
        for (let i = 0; i < (data.length); i++) {
            const d = data[i];
            const Path = `${i}`;
            if (ftype == 'events') {
                dat_obj = forEvent(d, dat_obj, conf, Path);
            }
            else if (obNullSafe(d)) {
                if (ftype == 'actor') {
                    dat_obj = addtodicSpliter(Path + '.name', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.nickname', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.profile', dat_obj);
                }
                else if (ftype == 'class') {
                    dat_obj = addtodicSpliter(Path + '.name', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.learnings.name', dat_obj);
                }
                else if (ftype == 'skill') {
                    dat_obj = addtodicSpliter(Path + '.description', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.message1', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.message2', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.name', dat_obj);
                }
                else if (ftype == 'state') {
                    dat_obj = addtodicSpliter(Path + '.description', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.message1', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.message2', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.message3', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.message4', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.name', dat_obj);
                }
                else if (ftype == 'ene') {
                    dat_obj = addtodicSpliter(Path + '.name', dat_obj);
                }
                else if (ftype == 'item') {
                    dat_obj = addtodicSpliter(Path + '.name', dat_obj);
                    dat_obj = addtodicSpliter(Path + '.description', dat_obj);
                }
                if (ftype == 'plugin') {
                    const v = Object.keys(d.parameters);
                    let shownName = false;
                    const without = ['false', 'true', 'on', 'off', 'auto'];
                    for (let i2 = 0; i2 < v.length; i2++) {
                        const targ = d.parameters[v[i2]];
                        if (isNaN(targ) && (!without.includes(targ))) {
                            if (!shownName) {
                                dat_obj = addComment(dat_obj, `//== ${d.name} ==//`, '', 'force');
                                shownName = true;
                            }
                            if (obNullSafe(targ)) {
                                console.log('obj');
                            }
                            dat_obj = addComment(dat_obj, `--- ${v[i2]}`, '', 'force');
                            dat_obj = addtodic(Path + '.parameters.' + v[i2], dat_obj, d.name);
                            dat_obj = addComment(dat_obj, ``);
                        }
                    }
                }
                else {
                    if (conf.note) {
                        if (globalThis.settings.extractSomeScript) {
                            if (isIncludeAble(d.note)) {
                                dat_obj = addtodic(Path + '.note', dat_obj, 'note');
                            }
                        }
                        else {
                            dat_obj = addtodic(Path + '.note', dat_obj, 'note');
                        }
                    }
                }
            }
        }
    }
    return {
        datobj: dat_obj.main,
        edited: dat_obj.edited,
        conf: conf
    };
};
exports.extract = extract;
function isIncludeAble(sc) {
    console.log('includeable');
    console.log(sc);
    const ess = globalThis.settings.extractSomeScript2;
    let able = false;
    if (sc === null || sc === undefined) {
        return false;
    }
    for (let i = 0; i < ess.length; i++) {
        if (ess[i] === '') {
            continue;
        }
        else if (sc.includes(ess[i])) {
            able = true;
            break;
        }
    }
    return able;
}
function forEvent(d, dat_obj, conf, Path) {
    const extended = conf.extended;
    const fileName = conf.fileName;
    const dir = conf.dir;
    if (obNullSafe(d)) {
        if (conf.note) {
            if (globalThis.settings.extractSomeScript) {
                if (isIncludeAble(d.note)) {
                    dat_obj = addtodic(Path + '.note', dat_obj, 'note');
                }
            }
            else {
                dat_obj = addtodic(Path + '.note', dat_obj, 'note');
            }
        }
        if (typeof d.list === 'object' && d.list !== undefined && d.list !== null) {
            let messageHasFace = false;
            for (let i = 0; i < d.list.length; i++) {
                let acceptable = [401, 102, 405, 101, 105];
                let ischeckable = false;
                let reportDebug = false;
                if (conf.srce) {
                    acceptable = acceptable.concat([356, 357]);
                }
                if (conf.arg.ext_javascript) {
                    acceptable = acceptable.concat([355, 655]);
                }
                if (conf.note) {
                    acceptable = acceptable.concat([408, 108]);
                }
                if ([356, 355, 108, 408, 357].includes(d.list[i].code) && globalThis.settings.extractSomeScript) {
                    ischeckable = true;
                }
                acceptable.concat(globalThis.settings.extractPlus);
                eventID += 1;
                function checker(dat_obj, da, ca) {
                    if (typeof da === 'object') {
                        for (let i3 in da) {
                            dat_obj = checker(dat_obj, da[i3], ca + `.${i3}`);
                        }
                    }
                    else if (!ischeckable || isIncludeAble(da)) {
                        dat_obj = addtodic(ca, dat_obj, '', { type: "event", code: d.list[i].code, eid: eventID, face: messageHasFace });
                    }
                    return dat_obj;
                }
                if (acceptable.includes(d.list[i].code) && d.list[i].parameters !== undefined && d.list[i].parameters !== null) {
                    if ([101, 102, 105].includes(d.list[i].code)) {
                        dat_obj = addComment(dat_obj, `--- ${d.list[i].code} ---`);
                    }
                    if (d.list[i].code === 101) {
                        if (d.list[i].parameters.length >= 5) {
                            dat_obj = checker(dat_obj, d.list[i].parameters[4], Path + `.list.${i}.parameters.${4}`);
                        }
                    }
                    else if (![105].includes(d.list[i].code)) {
                        for (let i2 = 0; i2 < d.list[i].parameters.length; i2++) {
                            dat_obj = checker(dat_obj, d.list[i].parameters[i2], Path + `.list.${i}.parameters.${i2}`);
                        }
                    }
                }
                else {
                    try {
                        switch (d.list[i].code) {
                            case 101:
                                messageHasFace = (d.list[i].parameters[0] !== '');
                                break;
                        }
                    }
                    catch (error) { }
                }
            }
        }
    }
    return dat_obj;
}
function jpathIsMap(jpath) {
    const name = path_1.default.parse(jpath).name;
    return (name.length === 6 && name.substring(0, 3) === 'Map' && !isNaN(Number(name.substring(3))));
}
const format_extracted = async (dats, typ = 0) => {
    const datobj = dats.datobj;
    const conf = dats.conf;
    const extended = conf.extended;
    const fileName = conf.fileName;
    const dir = conf.dir;
    if (typ == 0) {
        const Keys = Object.keys(datobj);
        let LenMemory = {};
        let LenKeys = [];
        let usedEid = [];
        globalThis.gb[fileName].outputText = '';
        for (const d of Keys) {
            let jpath = fileName;
            if (datobj[d].qpath === 'script' && globalThis.settings.onefile_src) {
                jpath = 'ext_scripts.json';
            }
            else if (datobj[d].qpath === 'note' && globalThis.settings.onefile_note) {
                jpath = 'ext_note.json';
            }
            else if (datobj[d].qpath === 'note2' && globalThis.settings.onefile_note) {
                jpath = 'ext_note2.json';
            }
            else if (datobj[d].qpath === 'javascript' && globalThis.settings.onefile_src) {
                jpath = 'ext_javascript.json';
            }
            else if (globalThis.settings.oneMapFile && jpathIsMap(jpath)) {
                jpath = 'Maps.json';
            }
            if (globalThis.useExternMsg) {
                if (globalThis.externMsgKeys.includes(datobj[d].var)) {
                    datobj[d].var = globalThis.externMsg[datobj[d].var];
                }
            }
            if (!LenKeys.includes(jpath)) {
                console.log(jpath);
                LenMemory[jpath] = (globalThis.gb[jpath].outputText.split('\n').length - 1);
                LenKeys.push(jpath);
            }
            if (globalThis.settings.formatNice && obNullSafe(datobj[d].conf)) {
                if (datas_1.beautifyCodes.includes(datobj[d].conf.code)) {
                    const toadd = '==========\n';
                    globalThis.gb[jpath].outputText += toadd;
                    LenMemory[jpath] += (toadd.split('\n').length - 1);
                }
                const eid = datobj[d].conf.eid;
                if (eid !== undefined && eid !== null) {
                    if (!usedEid.includes(eid) && datas_1.beautifyCodes2.includes(datobj[d].conf.code)) {
                        const toadd = `//==========//\n`;
                        globalThis.gb[jpath].outputText += toadd;
                        LenMemory[jpath] += (toadd.split('\n').length - 1);
                        usedEid.push(eid);
                    }
                }
            }
            const cid = LenMemory[jpath];
            globalThis.gb[jpath].data[cid] = {};
            globalThis.gb[jpath].data[cid].origin = fileName;
            globalThis.gb[jpath].data[cid].type = 'None';
            globalThis.gb[jpath].data[cid].val = d;
            globalThis.gb[jpath].data[cid].conf = datobj[d].conf;
            globalThis.gb[jpath].data[cid].originText = datobj[d].var;
            // const toadd = datobj[d].var + ` -- ${fileName}` +'\n' //for testing
            const toadd = datobj[d].var + '\n';
            globalThis.gb[jpath].outputText += toadd;
            LenMemory[jpath] += (toadd.split('\n').length - 1);
            globalThis.gb[jpath].data[cid].m = LenMemory[jpath];
        }
    }
};
exports.format_extracted = format_extracted;
exports.DecryptDir = fileCrypto_1.DecryptDir;
exports.EncryptDir = fileCrypto_1.EncryptDir;
