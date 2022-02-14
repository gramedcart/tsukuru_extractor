"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decrypt = exports.Encrypt = exports.VerifyFakeHeader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const EncryptedExtensions = [".rpgmvo", ".rpgmvm", ".rpgmvw", ".rpgmvp", ".ogg_", ".m4a_", ".wav_", ".png_"];
const DecryptedExtensions = [".ogg", ".m4a", ".wav", ".png", ".ogg", ".m4a", ".wav", ".png"];
const HEADER_MV = ["52", "50", "47", "4D", "56", "00", "00", "00", "00", "03", "01", "00", "00", "00", "00", "00"];
function splitString(str, p) {
    let chunks = [];
    for (var i = 0, charsLength = str.length; i < charsLength; i += p) {
        chunks.push(str.substring(i, i + p));
    }
    return chunks;
}
function hexToByte(hex) {
    return Buffer.from(hex, "hex")[0];
}
function log(p) {
    console.log(p);
}
function VerifyFakeHeader(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        throw "file dosen't exist";
    }
    const file = (fs_1.default.readFileSync(filePath));
    for (let index = 0; index < HEADER_MV.length; index++) {
        if (file[index] != hexToByte(HEADER_MV[index])) {
            return false;
        }
    }
    return true;
}
exports.VerifyFakeHeader = VerifyFakeHeader;
function Encrypt(filePath, saveDir, key) {
    if (!fs_1.default.existsSync(filePath)) {
        throw "file dosen't exist";
    }
    const extension = path_1.default.parse(filePath).ext.toLowerCase();
    if (!DecryptedExtensions.includes(extension)) {
        throw "Incompatible file format used.";
    }
    const header = Buffer.from(HEADER_MV.join(''), "hex");
    let file = fs_1.default.readFileSync(filePath);
    const keys = splitString(key, 2);
    for (let index = 0; index < keys.length; index++) {
        file[index] = (file[index] ^ hexToByte(keys[index]));
    }
    const encryptedExt = EncryptedExtensions[DecryptedExtensions.indexOf(extension)];
    const fileData = Buffer.concat([header, file], header.length + file.length);
    fs_1.default.writeFileSync(path_1.default.join(saveDir, `${path_1.default.parse(filePath).name}${encryptedExt}`), fileData);
}
exports.Encrypt = Encrypt;
function Decrypt(filePath, saveDir, key) {
    if (!fs_1.default.existsSync(filePath)) {
        throw "file dosen't exist";
    }
    const extension = path_1.default.parse(filePath).ext.toLowerCase();
    if (!EncryptedExtensions.includes(extension)) {
        throw "Incompatible file format used.";
    }
    let file = (fs_1.default.readFileSync(filePath).slice(16));
    const keys = splitString(key, 2);
    for (let index = 0; index < keys.length; index++) {
        file[index] = (file[index] ^ hexToByte(keys[index]));
    }
    const decryptedExt = DecryptedExtensions[EncryptedExtensions.indexOf(extension)];
    fs_1.default.writeFileSync(path_1.default.join(saveDir, `${path_1.default.parse(filePath).name}${decryptedExt}`), file);
}
exports.Decrypt = Decrypt;
