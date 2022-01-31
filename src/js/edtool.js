"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exports.write = exports.read = void 0;
const lz_string_min_js_1 = __importDefault(require("./lz-string.min.js"));
const fs_1 = __importDefault(require("fs"));
function read(dir) {
    try {
        let data = JSON.parse(lz_string_min_js_1.default.decompressFromUint8Array(fs_1.default.readFileSync(dir + '/.extracteddata')));
        write(dir, data);
        if (data.main === undefined) {
            while (data.main === undefined) {
                data = data.dat;
            }
        }
        return data;
    }
    catch (error) {
        console.log('trying in base64');
        const data = JSON.parse(lz_string_min_js_1.default.decompressFromBase64(fs_1.default.readFileSync(dir + '/.extracteddata', 'utf8')));
        write(dir, data);
        return data;
    }
}
exports.read = read;
function write(dir, ext_data, newVersion = true) {
    fs_1.default.writeFileSync(dir + `/.extracteddata`, lz_string_min_js_1.default.compressToUint8Array(JSON.stringify({ dat: ext_data })));
}
exports.write = write;
function exists(dir) {
    return (fs_1.default.existsSync(dir + '/.extracteddata'));
}
exports.exists = exists;
