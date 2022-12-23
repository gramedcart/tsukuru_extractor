import request from "request"

export function kakaoTrans(text:string, queryLanguage:string) {
    const bodyObj = {
        queryLanguage: queryLanguage,
        resultLanguage: 'kr',
        q: (text)
    }
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
	}
    return new Promise<string>((resolve, reject) => {
        request(reqOptions, (error, response, body) => {
            try {
                const outs:string[][] = JSON.parse(body).result.output
                let result:string[] = []
                for(const q of outs){
                    result.push(q[0])
                }
                const re = decodeURIComponent(result.join('\n'))
                resolve(re)
            } catch (error) {
                reject()
            }
        })
    })
}