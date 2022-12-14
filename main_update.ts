interface changeLog{
    name:string
    inner:{
        ko: string[],
        en: string[]
    }
}


function genChangeLog(data:changeLog[]){
    let log = `<div class="updateInfoContainer"><h2>CHANGELOG</h2>`
    if(globalThis.settings.language === 'ko'){
        log += '!! 되도록이면 아네모네, Weztrans가 아닌 내장 번역기를 사용해주세요 !!'
    }
    for(const da of data){
        log += `<br><br>Update ${da.name}<br><span class="updateInfo">`
        const inner = (globalThis.settings.language === 'ko') ? da.inner.ko : da.inner.en
        for(const t of inner){
            log += `${t}<br>`
        }
        log += '</span>'
    }
    return log
}



export default function sendUpdateInfo(){
    const logHTML = genChangeLog([
        {
            name: '2.0.0',
            inner: {
                ko:[
                    '추출 속도 개선',
                    '설정창 디자인 수정',
                    '텍스트 간 구분 추가',
                    '카카오 번역기 스마트 모드 추가',
                    '다음 code를 가진 데이터를 추가로 추출하기 설정 추가',
                    '스크립트 추출 시 코드 122 추출 설정 삭제',
                    'Node.js 19로 업데이트',
                    'Electron 22로 업데이트',
                    '보안 취약점 수정',
                    '업데이트 알림이 나오지 않는 오류 수정',
                    '영어 지원 추가 (베타)'
                ],
                en:[
                    'Improved extract performance',
                    'Updated Config menu',
                    'Added Text Separator',
                    'Added Smart mode for kakao translator',
                    'Added config: "extract specific code"',
                    'Updated to Node.js 19',
                    'Updated Electron 22',
                    'Fixed bugs',
                    'Added English (Experimental)'
                ]
            }
        }
    ])


    sendAlertSmall(logHTML)
}


function sendAlertSmall(txt:string){
    globalThis.mwindow.webContents.send('alert_free', {html: txt, width:"90vw"});
}