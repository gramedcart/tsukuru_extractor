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
exports.EncryptDir = exports.DecryptDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rpgencrypt = __importStar(require("./libs/rpgencrypt"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function reader(dir) {
    if (fs_1.default.existsSync(dir + '.yaml')) {
        let data = fs_1.default.readFileSync(dir + '.yaml', "utf-8");
        return js_yaml_1.default.load(data);
    }
    let data = fs_1.default.readFileSync(dir, "utf-8");
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.substring(1);
    }
    return JSON.parse(data);
}
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
async function DecryptDir(DataDir, type) {
    globalThis.mwindow.webContents.send('loading', 0);
    globalThis.mwindow.webContents.send('loadingTag', `${type} 복호화 중`);
    const SysFile = reader(path_1.default.join(DataDir, "System.json"));
    const Key = SysFile.encryptionKey;
    const ExtractImgDir = path_1.default.join(DataDir, `Extract_${type}`);
    if (fs_1.default.existsSync(ExtractImgDir)) {
        fs_1.default.rmSync(ExtractImgDir, { recursive: true, force: true });
    }
    fs_1.default.mkdirSync(ExtractImgDir);
    const imgDir = path_1.default.join(path_1.default.dirname(DataDir), type);
    let files = [];
    const imgd = imgDir.replaceAll('\\', '/');
    for (const exts of rpgencrypt.EncryptedExtensions) {
        const glob = path_1.default.join(imgDir, '**', `*${exts}`).replaceAll('\\', '/');
        const fi = await (0, fast_glob_1.default)(`${glob}`);
        for (const file of fi) {
            files.push(file);
        }
    }
    for (let i = 0; i < files.length; i++) {
        globalThis.mwindow.webContents.send('loadingTag', `${type} 복호화 중 : `);
        globalThis.mwindow.webContents.send('loading', ((i / files.length) * 100));
        const loc = files[i];
        let tlan = path_1.default.dirname(loc).replaceAll('\\', '/').substring(imgd.length);
        if (tlan.startsWith('/')) {
            tlan = tlan.substring(1);
        }
        try {
            const pat = path_1.default.join(ExtractImgDir, tlan);
            fs_extra_1.default.mkdirsSync(pat);
            rpgencrypt.Decrypt(loc, pat, Key);
        }
        catch (_a) { }
        await sleep(1);
    }
    globalThis.mwindow.webContents.send('loading', 0);
}
exports.DecryptDir = DecryptDir;
async function EncryptDir(DataDir, type, instantapply) {
    const SysFile = reader(path_1.default.join(DataDir, "System.json"));
    const Key = SysFile.encryptionKey;
    const ExtractImgDir = path_1.default.join(DataDir, `Extract_${type}`);
    const CompleteDir = (() => {
        if (instantapply) {
            return path_1.default.join(path_1.default.dirname(DataDir), type);
        }
        return path_1.default.join(DataDir, 'Completed', type);
    })();
    if (!fs_1.default.existsSync(ExtractImgDir)) {
        return;
    }
    if (!fs_1.default.existsSync(CompleteDir)) {
        fs_1.default.mkdirSync(CompleteDir);
    }
    let files = [];
    const imgd = CompleteDir.replaceAll('\\', '/');
    for (const exts of rpgencrypt.DecryptedExtensions) {
        const glob = path_1.default.join(ExtractImgDir, '**', `*${exts}`).replaceAll('\\', '/');
        const fi = await (0, fast_glob_1.default)(`${glob}`);
        for (const file of fi) {
            files.push(file);
        }
    }
    for (let i = 0; i < files.length; i++) {
        globalThis.mwindow.webContents.send('loadingTag', `${type} 암호화 중 : `);
        globalThis.mwindow.webContents.send('loading', ((i / files.length) * 100));
        const loc = files[i];
        let tlan = path_1.default.dirname(loc).replaceAll('\\', '/').substring(imgd.length - 1);
        if (tlan.startsWith('/')) {
            tlan = tlan.substring(1);
        }
        try {
            const pat = path_1.default.join(CompleteDir, tlan);
            fs_extra_1.default.mkdirsSync(pat);
            rpgencrypt.Encrypt(loc, pat, Key);
        }
        catch (err) { }
        await sleep(1);
    }
    globalThis.mwindow.webContents.send('loading', 0);
}
exports.EncryptDir = EncryptDir;
