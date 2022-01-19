const LZString = require('./lz-string.min.js');
const fs = require('fs');

exports.read = (dir) => {
    try {
        const data = JSON.parse(LZString.decompressFromUint8Array(fs.readFileSync(dir + '/.extracteddata')))
        return data.dat
    } catch (error) {
        console.log('trying in base64')
        return JSON.parse(LZString.decompressFromBase64(fs.readFileSync(dir + '/.extracteddata', 'utf8')))
    }
}

exports.write = (dir, ext_data) => {
    fs.writeFileSync(dir + `/.extracteddata`, LZString.compressToUint8Array(JSON.stringify({dat: ext_data})))
}

exports.oldWrite = (dir, ext_data) => {
    fs.writeFileSync(dir + `/.extracteddata`, LZString.compressToBase64(JSON.stringify(ext_data)),'utf-8')
}
