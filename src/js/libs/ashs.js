"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decrypt = exports.Encrypt = void 0;
const sha3_1 = __importDefault(require("sha3"));
const aes_js_1 = require("aes-js");
const bson_1 = require("bson");
const crypto_1 = require("crypto");
const perf_hooks_1 = require("perf_hooks");
function hashKey(params) {
    const key = new sha3_1.default(256);
    key.update(params);
    key.update(key.digest.toString() + key);
    return key.digest();
}
const ctr = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]);
function EncryptData(file, key) {
    const salt = (0, crypto_1.randomBytes)(16);
    const keys = hashKey(key + salt.toString('base64'));
    const aesCtr = new aes_js_1.ModeOfOperation.ctr(keys, new aes_js_1.Counter(ctr));
    const returnFile = aesCtr.encrypt(file);
    return (0, bson_1.serialize)({ data: returnFile, salt: salt });
}
function DecryptData(file, key) {
    const f = (0, bson_1.deserialize)(file);
    if (f.data === null || f.salt === null) {
        throw 'data is null';
    }
    const MainFile = f.data.buffer;
    const salt = f.salt.buffer;
    const keys = hashKey(key + salt.toString('base64'));
    const aesCtr = new aes_js_1.ModeOfOperation.ctr(keys, new aes_js_1.Counter(ctr));
    const returnFile = aesCtr.decrypt(MainFile);
    return returnFile;
}
function Encrypt(file, password, showPerform = false) {
    const startTime = perf_hooks_1.performance.now();
    file = new Uint8Array(file);
    const chunkSize = 10240000;
    let chunks = [];
    for (let i = 0, j = file.length; i < j; i += chunkSize) {
        chunks.push(EncryptData(file.slice(i, i + chunkSize), password));
    }
    let length = 0;
    chunks.forEach(item => {
        length += item.length;
    });
    let mergedArray = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(item => {
        mergedArray.set(item, offset);
        offset += item.length;
    });
    if (showPerform) {
        console.log(perf_hooks_1.performance.now() - startTime);
    }
    return mergedArray;
}
exports.Encrypt = Encrypt;
function Decrypt(file, password, showPerform = false) {
    const startTime = perf_hooks_1.performance.now();
    file = new Uint8Array(file);
    const chunkSize = 10240000 + 43;
    let chunks = [];
    for (let i = 0, j = file.length; i < j; i += chunkSize) {
        chunks.push(DecryptData(file.slice(i, i + chunkSize), password));
    }
    let length = 0;
    chunks.forEach(item => {
        length += item.length;
    });
    let mergedArray = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(item => {
        mergedArray.set(item, offset);
        offset += item.length;
    });
    if (showPerform) {
        console.log(perf_hooks_1.performance.now() - startTime);
    }
    return mergedArray;
}
exports.Decrypt = Decrypt;
