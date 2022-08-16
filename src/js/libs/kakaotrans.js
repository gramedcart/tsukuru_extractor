"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kakaoTrans = void 0;
const request_1 = __importDefault(require("request"));
function kakaoTrans(text, queryLanguage) {
    const bodyObj = {
        queryLanguage: 'en',
        resultLanguage: 'kr',
        q: (text)
    };
    const reqOptions = {
        url: 'https://translate.kakao.com/translator/translate.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'translate.kakao.com',
            'Origin': 'https://translate.kakao.com',
            'Referer': 'https://translate.kakao.com/',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        },
        form: bodyObj
    };
    return new Promise((resolve, reject) => {
        (0, request_1.default)(reqOptions, (error, response, body) => {
            try {
                const outs = JSON.parse(body).result.output;
                let result = [];
                for (const q of outs) {
                    result.push(q[0]);
                }
                const re = decodeURIComponent(result.join('\n'));
                console.log(re);
                resolve(re);
            }
            catch (error) {
                reject();
            }
        });
    });
}
exports.kakaoTrans = kakaoTrans;
