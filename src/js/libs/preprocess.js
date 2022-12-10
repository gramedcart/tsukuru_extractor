"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProcessTranslate = exports.preProcessTranslate = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const d = [];
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}
async function preProcessTranslate(edir) {
    const fileList = fs_extra_1.default.readdirSync(edir);
    for (const file of fileList) {
        if ((file.startsWith('Map') && file.length === 10) || (file === 'CommonEvents.txt') || (file === 'Maps.txt')) {
            const dir = path_1.default.join(edir, file);
            let da = (await (0, promises_1.readFile)(dir, 'utf-8')).split('\n');
            let chunked = [];
            let chunkIndex = 0;
            let chunkStr = [];
            let skipArea = false;
            for (let i = 0; i < da.length; i++) {
                const tile = da[i];
                if (tile.startsWith('---') || (tile.split(' ').length <= 3)) {
                    if (chunkIndex !== 0) {
                        const str = chunkStr.join(' ');
                        for (const ind of chunked) {
                            da[ind] = `@@Excludes|chunkstr|${chunked[0]}`;
                        }
                        da[chunked[0]] = str;
                    }
                    chunked = [];
                    chunkStr = [];
                    chunkIndex = 0;
                }
                else {
                    chunked.push(i);
                    chunkStr.push(tile);
                    chunkIndex += 1;
                }
            }
            await (0, promises_1.writeFile)(dir, da.join('\n'), 'utf-8');
        }
    }
}
exports.preProcessTranslate = preProcessTranslate;
function getBinarySize(string) {
    return Buffer.byteLength(string, 'utf8');
}
async function postProcessTranslate(edir) {
    const fileList = fs_extra_1.default.readdirSync(edir);
    for (const file of fileList) {
        if ((file.startsWith('Map') && file.length === 10) || (file === 'CommonEvents.txt') || (file === 'Maps.txt')) {
            const dir = path_1.default.join(edir, file);
            let da = (await (0, promises_1.readFile)(dir, 'utf-8')).split('\n');
            let doingHook = '';
            let hookIndex = [];
            for (let i = 0; i < da.length; i++) {
                const tile = da[i];
                if (doingHook !== '') {
                    if (doingHook === tile) {
                        hookIndex.push(i);
                    }
                    else {
                        const forUse = da[hookIndex[0]];
                        let v = forUse.split(' ');
                        const len = hookIndex.length;
                        let repeatTimes = hookIndex.length - 1;
                        if (repeatTimes > v.length) {
                            repeatTimes = v.length;
                        }
                        for (let i2 = 0; i2 < repeatTimes; i2++) {
                            const ind = (Math.floor(v.length / len) * (i2 + 1)) - 1;
                            v[ind] = '\n' + v[ind];
                        }
                        const tap = v.join(' ').split('\n');
                        for (let i2 = 0; i2 < len; i2++) {
                            da[hookIndex[i2]] = tap[i2];
                        }
                        hookIndex = [];
                        doingHook = '';
                    }
                }
                if (doingHook === '') {
                    if (tile.startsWith('@@Excludes')) {
                        const arg = tile.split('|');
                        if (arg[1] === 'chunkstr') {
                            doingHook = tile;
                            hookIndex = [parseInt(arg[2]), i];
                        }
                    }
                }
            }
            await (0, promises_1.writeFile)(dir, da.join('\n'), 'utf-8');
        }
    }
}
exports.postProcessTranslate = postProcessTranslate;
