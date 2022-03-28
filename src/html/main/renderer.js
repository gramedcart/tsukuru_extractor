const { ipcRenderer} = require('electron');
const {_} = require('lodash');
const info = document.getElementById('info')
require = () => {
    
}
let running = false
let loadingTag = ''
let menu_open = false
let globalSettings = {}
let LastTime = -1
let LastPercent = -1.0
let estimatedTime = ''
let zinheng = [0, 0]

let config = {
    ext_plugin: false,
    ext_src: false,
    autoline: false,
    instantapply: false,
    ext_note: false,
    exJson: false,
    decryptImg: false,
    decryptAudio: false,
    ext_javascript: false
}
let _mode = -1

document.getElementById('icon1').onclick = () => {ipcRenderer.send('close')}
document.getElementById('icon2').onclick = () => {ipcRenderer.send('minimize')}
document.getElementById('fold').onclick = () => {ipcRenderer.send("openFolder", document.getElementById('folder_input').value)}
document.querySelector('#sel').addEventListener('click', () => {
    ipcRenderer.send('select_folder', 'folder_input');
});

ipcRenderer.on('set_path', (evn, tt) => {
    document.getElementById(tt.type).value = tt.dir
    if(tt.type !== 'folder_input'){
        document.getElementById(tt.type).innerText = tt.dir
    }
});

ipcRenderer.on('updateFound', (evn, tt) => {
    Swal.fire({
        icon: 'question',
        text: '업데이트가 발견되었습니다. \n업데이트 하시겠습니까?',
        confirmButtonText: '예',
        showDenyButton: true,
        denyButtonText: `아니오`,
    }).then((result) => {
        if (result.isConfirmed) {
            ipcRenderer.send('updatePage');
        }
    })
});



ipcRenderer.on('getGlobalSettings', (evn, tt) => {
    globalSettings = tt
})

ipcRenderer.on('loadingTag', (evn, tt) => {
    loadingTag = tt
})

ipcRenderer.on('loading', (evn, tt) => {
    document.getElementById('border_r').style.width = `${tt}vw`
    let ds = Math.floor(new Date().getTime()/1000)
    if(tt > 0 && globalSettings.loadingText){
        if(LastTime != ds){
            const toHHMMSS = function (num) {
                const sec_num = parseInt(num, 10);
                const hours   = Math.floor(sec_num / 3600);
                const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                const seconds = sec_num - (hours * 3600) - (minutes * 60);
                let timeString = ''
                if(hours > 0){timeString += `${hours}시간 `}
                if(minutes > 0){timeString += `${minutes}분 `}
                timeString += `${seconds}초`
                return timeString;
            }
            const ChangedTime = ds - LastTime
            LastTime = ds
            let OldPercent = LastPercent
            LastPercent = parseFloat(tt)
            const movedPercent = (LastPercent - OldPercent) / ChangedTime
            if(zinheng[1] == 0){
                zinheng[0] = movedPercent
            }
            else{
                zinheng[0] = ((zinheng[0]*zinheng[1]) + movedPercent)/(zinheng[1]+1)
            }
            zinheng[1] += 1
            let TimeLeftSec = (100 - LastPercent)/zinheng[0]
            estimatedTime = `${toHHMMSS(TimeLeftSec)} 남음`
        }
        document.getElementById('loading-text').innerText = `${loadingTag}${Number.parseFloat(tt).toFixed(3)}% ${estimatedTime}`
        document.getElementById('loading-text').style.visibility = 'visible'
    }
    else{
        zinheng = [0, 0]
        estimatedTime = ''
        LastTime = ds
        LastPercent = -1.0
        document.getElementById('loading-text').style.visibility = 'hidden'
        loadingTag = ''
    }
});

ipcRenderer.on('worked', () => {running = false})

ipcRenderer.on('check_force', (evn, arg) => {
    Swal.fire({
        icon: 'question',
        text: 'Extract 폴더가 존재합니다. \n덮어씌우겠습니까?',
        confirmButtonText: '예',
        showDenyButton: true,
        denyButtonText: `아니오`,
    }).then((result) => {
        if (result.isConfirmed) {
            arg.force = true
            ipcRenderer.send('extract', arg);
        }
    })
});

ipcRenderer.on('alert', (evn, tt) => {
    if (typeof tt === 'string') {
        Swal.fire({
            icon: 'success',
            title: tt,
        })
    }
    else{
        Swal.fire({
            icon: tt.icon,
            title: tt.message,
        })
    }
});

ipcRenderer.on('alert2', async (evn, tt) => {
    const {isDenied} = await Swal.fire({
        icon: 'success',
        showDenyButton: true,
        denyButtonText: "폴더 열기",
        
        title: '완료되었습니다',
    })
    if(isDenied){
        ipcRenderer.send("openFolder", document.getElementById('folder_input').value)
    }
});



function _reload(){
    if(_mode == 0){
        document.getElementById('ext').style.backgroundColor = '#3700b390'
        document.getElementById('apply').style.backgroundColor = '#ffffff10'
        if (document.getElementById('c-ext').classList.contains("hiddenc")) {
            document.getElementById('c-ext').classList.remove("hiddenc");}
        if (!document.getElementById('c-app').classList.contains("hiddenc")) {
            document.getElementById('c-app').classList.add("hiddenc");}
    }
    else if(_mode == 1){
        document.getElementById('ext').style.backgroundColor = '#ffffff10'
        document.getElementById('apply').style.backgroundColor = '#3700b390'
        if (document.getElementById('c-app').classList.contains("hiddenc")) {
            document.getElementById('c-app').classList.remove("hiddenc");}
        if (!document.getElementById('c-ext').classList.contains("hiddenc")) {
            document.getElementById('c-ext').classList.add("hiddenc");}
    }
    else{
        document.getElementById('ext').style.backgroundColor = '#ffffff10'
        document.getElementById('apply').style.backgroundColor = '#ffffff10'
    }
    const DomList = ['ext_plugin','ext_note','ext_src','autoline','instantapply','exJson','decryptImg','decryptAudio', 'ext_javascript']
    for(const i in DomList){
        if(config[DomList[i]]){
            document.getElementById(DomList[i]).style.backgroundColor = '#3700b390'
        }
        else{
            document.getElementById(DomList[i]).style.backgroundColor = '#ffffff10'
        }
    }
}

ipcRenderer.on('is_version', (ev, arg)=>{
    globalThis.version = arg
})

document.getElementById('ext').onclick = () => {_mode=0;_reload()}
document.getElementById('apply').onclick = () => {_mode=1;_reload()}
_reload()

if(true){
    document.getElementById('addons_btn').onclick = () => {
        document.getElementById("addons").style.height = "165px";
        ipcRenderer.send('extend', 460)
        menu_open = true
    }
    
    const InfoList = {
        'ext_plugin': '추출 시 플러그인을\n추출합니다',
        'decryptImg': '추출 시 이미지의\n암호화를 해제하고\n추출합니다',
        'decryptAudio': '추출 시 오디오의\n암호화를 해제하고\n추출합니다',
        'ext_src': '추출 시 스크립트를\n추출합니다',
        'ext': '추출 모드로\n전환합니다',
        'apply': '적용 모드로\n전환합니다',
        'changeAll': '문자열을 일괄\n변경합니다',
        'addons_btn': '추가 기능을\n펼칩니다',
        'eztrans': 'Extract 폴더 내\n파일을 이지트랜스로\n번역합니다',
        'ext_note': '노트/메모를\n추출합니다',
        'exJson': 'Rpg Maker에\n기본적으로는\n존재하지 않는\nJSON 또는 CSV를\n추출합니다',
        'autoline': '적용 시 자동\n줄바꿈을 합니다',
        'instantapply': '적용 시 Completed\n폴더 대신\n원본 폴더에\n즉시 적용합니다',
        'instantapply': '적용 시 Completed\n폴더 대신\n원본 폴더에\n즉시 적용합니다',
        'versionUp': '버전 업 툴을\n엽니다',
        'settings': '설정',
        'fontConfig': '게임 내 폰트를\n변경합니다',
        'ext_javascript': '게임 내\n자바스크립트를\n추출합니다.'
    }
    for(const i in InfoList){
        document.getElementById(i).addEventListener('mouseenter', ()=>{
            info.innerText = InfoList[i]
        })
    }
    document.getElementById('run').addEventListener('mouseenter', ()=>{
        if(_mode == 0){
            info.innerText = "추출을 시작합니다"
        }
        else{
            info.innerText = "적용을 시작합니다"
        }
    })
}

document.getElementById('ext_plugin').onclick = () => {
    if(!config.ext_plugin){
        Swal.fire({
            icon: 'warning',
            text: '플러그인을 추출하여 번역할 시\n게임 내에서 오류가 날 수 있습니다\n정말로 활성화하시겠습니까?',
            confirmButtonText: '예',
            showDenyButton: true,
            denyButtonText: `아니오`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    text: '활성화 되었습니다.\n번역 시 원어만 번역해 주시고,\n추출 모드에서 RUN을 눌러 추출하세요',
                })
                config.ext_plugin = true
                _reload()
            }
        })
    }
    else{
        config.ext_plugin = false
        _reload()
    }
}

document.getElementById('decryptImg').onclick = () => {config.decryptImg = !config.decryptImg; _reload()}
document.getElementById('decryptAudio').onclick = () => {config.decryptAudio = !config.decryptAudio; _reload()}

document.getElementById('exJson').onclick = () => {
    if(!config.exJson){
        Swal.fire({
            icon: 'warning',
            text: '비표준 JSON / CSV를 추출하여 번역할 시\n게임 내에서 오류가 날 수 있습니다\n정말로 활성화하시겠습니까?',
            confirmButtonText: '예',
            showDenyButton: true,
            denyButtonText: `아니오`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    text: '활성화 되었습니다.\n추출 모드에서 RUN을 눌러 추출하세요',
                })
                config.exJson = true
                _reload()
            }
        })
    }
    else{
        config.exJson = false
        _reload()
    }
}

document.getElementById('settings').onclick = () => {
    if(running){
        Swal.fire({
            icon: 'error',
            text: '이미 다른 작업이 시행중입니다!',
        })
        return
    }
    ipcRenderer.send('settings')
    running = true
}

document.getElementById('ext_src').onclick = () => {
    if(!config.ext_src){
        Swal.fire({
            icon: 'warning',
            text: '스크립트를 추출하여 번역할 시\n게임 내에서 오류가 날 수 있습니다\n정말로 활성화하시겠습니까?',
            confirmButtonText: '예',
            showDenyButton: true,
            denyButtonText: `아니오`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    text: '활성화 되었습니다.\n번역 시 원어만 번역해 주시고,\n추출 모드에서 RUN을 눌러 추출하세요',
                })
                config.ext_src = true
                _reload()
            }
        })
    }
    else{
        config.ext_src = false
        _reload()
    }
}

document.getElementById('ext_javascript').onclick = () => {
    if(!config.ext_javascript){
        Swal.fire({
            icon: 'warning',
            text: '자바스크립트를 추출하여 번역할 시\n게임 내에서 오류가 날 수 있습니다\n정말로 활성화하시겠습니까?',
            confirmButtonText: '예',
            showDenyButton: true,
            denyButtonText: `아니오`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    text: '활성화 되었습니다.\n잘못된 곳을 번역하지 않도록 주의하시고,\n추출 모드에서 RUN을 눌러 추출하세요',
                })
                config.ext_javascript = true
                _reload()
            }
        })
    }
    else{
        config.ext_javascript = false
        _reload()
    }
}

document.getElementById('ext_note').onclick = () => {
    if(!config.ext_note){
        Swal.fire({
            icon: 'warning',
            text: '노트/메모를 추출하여 번역할 시\n게임 내에서 오류가 날 수 있습니다\n정말로 활성화하시겠습니까?',
            confirmButtonText: '예',
            showDenyButton: true,
            denyButtonText: `아니오`,
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    text: '활성화 되었습니다.\n번역 시 원어만 번역해 주시고,\n추출 모드에서 RUN을 눌러 추출하세요',
                })
                config.ext_note = true
                _reload()
            }
        })
    }
    else{
        config.ext_note = false
        _reload()
    }
}

document.getElementById('autoline').onclick = () => {config.autoline = !config.autoline;_reload();}
document.getElementById('instantapply').onclick = () => {config.instantapply = !config.instantapply;_reload();}

document.getElementById('run').onclick = () => {
    if(running){
        Swal.fire({
            icon: 'error',
            text: '이미 다른 작업이 시행중입니다!',
        })
        return
    }
    const kas = document.getElementById('folder_input').value
    if(_mode == 0){
        const a = {
            dir: Buffer.from(kas.replace('\\','/'), "utf8").toString('base64')
        };
        running = true
        ipcRenderer.send('extract', _.merge({}, a, config));
    }
    else if(_mode == 1){
        const a = {
            dir: Buffer.from(kas.replace('\\','/'), "utf8").toString('base64')
        };
        running = true
        ipcRenderer.send('apply', _.merge({}, a, config));
    }
}

document.getElementById('eztrans').onclick = async () => {
    if(running){
        Swal.fire({
            icon: 'error',
            text: '이미 다른 작업이 시행중입니다!',
        })
        return
    }
    const result = await Swal.fire({
        icon: 'warning',
        text: "정말로 번역기를 사용하시겠습니까?",
        confirmButtonText: '예',
        showDenyButton: true,
        denyButtonText: `아니오`,
    })
    let confirmit = 5
    let lastvalue = -1
    if (!result.isConfirmed) {
        return
    }
    const infos = {
        'eztrans': '최대한 많이 번역하는 모드입니다.<br>많은 스크립트를 안전하게 번역합니다.<br>적은 확률로 번역 한 게임에 오류가 발생할 수 있습니다.',
        'eztransh': '오류가 나올 만한 부분을 번역하지 않는 모드입니다.<br>번역되지 않는 부분이 있을 수 있습니다.',
        'google': '권장되지 않는 베타 번역기입니다.<br>속도가 굉장히 느리며, 중간에 번역이 되지 않을 수 있습니다.<br>여러가지 언어를 지원합니다.',
        'papago': '권장되지 않는 베타 번역기입니다.<br>속도가 굉장히 느리며, 중간에 번역이 되지 않을 수 있습니다.<br>여러가지 언어를 지원합니다.'
    }

    const v = await Swal.fire({
        icon: 'info',
        title: '번역기를 선택해주세요',
        input: 'select',
        inputOptions: {
            'eztrans': 'eztrans (스마트 모드)',
            'eztransh': 'eztrans (안전 모드)',
            'google': '구글 번역기 (베타)',
            'papago': '파파고 (베타)'
        },
        confirmButtonText: '확인',
        inputValidator: (value) => {
            return new Promise((resolve) => {
                if(lastvalue !== value){
                    lastvalue = value
                    confirmit = 3
                }
                if (value) {
                    if(confirmit > 0){
                        resolve(`${infos[value]}<br>계속하려면 확인 버튼을 ${confirmit}번 더 눌려주세요`)
                        confirmit -= 1
                    }
                    resolve()
                }
                else {
                    ipcRenderer.send('log', value)
                    resolve('설정되지 않음')
                }
            })
        }
    })
    const transtype = v.value
    if(!transtype){
        return
    }
    let langu = 'jp'
    if(!(transtype === 'eztrans'|| transtype === 'eztransh')){
        const langu2 = await Swal.fire({
            icon: 'info',
            title: '시작 언어를 선택해주세요',
            input: 'select',
            inputOptions: {
                'en': '영어 (english)',
                'ja': '일본어 (日本語)',
                'zh-CN': '대만어 (台灣語)',
                'fr': '프랑스어 (Français)',
                'es': '스페인어 (español)',
                'ru': '러시아어 (Русский)'
            },
            confirmButtonText: '확인',
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve()
                    }
                    else {
                        ipcRenderer.send('log', value)
                        resolve('설정되지 않음')
                    }
                })
            }
        })
        langu = langu2.value
        if(!langu){
            return
        }
    }
    ipcRenderer.send('log', v.value)
    const a = {
        dir: Buffer.from(document.getElementById('folder_input').value.replace('\\','/'), "utf8").toString('base64'),
        type: transtype,
        langu: langu
    };
    running = true
    ipcRenderer.send('eztrans', a);
    return
}

document.getElementById('changeAll').onclick = async () => {
    if(running){
        Swal.fire({
            icon: 'error',
            text: '이미 다른 작업이 시행중입니다!',
        })
        return
    }
    const { value: formValues } = await Swal.fire({
        title: '문자열 일괄 변경',
        html:
          '<input id="swal-input1" class="swal2-input" placeholder="기존 값">' +
          '<input id="swal-input2" class="swal2-input" placeholder="변경할 값">',
        focusConfirm: false,
        showDenyButton: true,
        denyButtonText: `취소`,
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value
          ]
        }
    })
    
    if (formValues) {
        if(!(formValues[0] === formValues[1] || formValues[0] === '' || formValues[1] === '' )){
            const kas = document.getElementById('folder_input').value
            const a = {
                dir: Buffer.from(kas.replace('\\','/'), "utf8").toString('base64'),
                data: formValues
            };
            running = true
            ipcRenderer.send("changeAllString",(a))
        }
    }
}


document.getElementById('versionUp').onclick = async () => {
    if(running){
        Swal.fire({
            icon: 'error',
            text: '이미 다른 작업이 시행중입니다!',
        })
        return
    }
    if(_mode != '0'){
        Swal.fire({
            icon: 'error',
            text: '추출 모드 상태이여야 합니다!',
        })
        return
    }
    const { isConfirmed: isConfirmed} = await Swal.fire({
        title: '버전 업 툴 주의사항',
        icon: 'warning',
        text: "버전 업 툴 사용 시 추출 모드의 설정 및 옵션이 그대로 적용됩니다. 구버전 번역본의 추출된 데이터를 기반으로 이식되며, 추출된 데이터가 많을 수록 더 많은 데이터가 이식됩니다.만약 구버전 번역본을 추출하였을 때랑 다른 설정 및 옵션을 사용할 시, 예기치 못한 문제가 발생할 수 있습니다.",
        showDenyButton: true,
        denyButtonText: `취소`,
    })
    if(!isConfirmed){
        return
    }
    const { value: formValues } = await Swal.fire({
        title: '버전 업 툴',
        html:
          '<div id="swi1" class="cfolder" placeholder="구버전 번역 data 폴더"'+
          'onclick="ipcRenderer.send(\'select_folder\', \'swi1\')">구버전 번역본 폴더</div>' +
          '<div id="swi3" class="cfolder" placeholder="구버전 미번역 data 폴더"'+
          'onclick="ipcRenderer.send(\'select_folder\', \'swi3\')">구버전 미번역 폴더</div>' +
          '<div id="swi2" class="cfolder" placeholder="신버전 미번역 data 폴더"'+
          'onclick="ipcRenderer.send(\'select_folder\', \'swi2\')">신버전 폴더</div>',
        focusConfirm: false,
        showDenyButton: true,
        denyButtonText: `취소`,
        preConfirm: () => {
          return [
            document.getElementById('swi1').innerText,
            document.getElementById('swi2').innerText,
            document.getElementById('swi3').innerText
          ]
        }
    })
    
    if (formValues) {
        if(!(formValues[0] === '' || formValues[1] === '' || formValues[2] === '' )){
            if(formValues[0] === formValues[1] || formValues[1] === formValues[2] || formValues[0] === formValues[2] ){
                Swal.fire({icon: 'error',text: '같은 폴더입니다!'})
            }
            else{
                const kas = formValues[0]
                const kas2 = formValues[1]
                const kas3 = formValues[2]
                const a = {
                    dir1: _.merge({}, {dir: Buffer.from(kas.replace('\\','/'), "utf8").toString('base64')}, config),
                    dir2: _.merge({}, {dir: Buffer.from(kas2.replace('\\','/'), "utf8").toString('base64')}, config),
                    dir3: _.merge({}, {dir: Buffer.from(kas3.replace('\\','/'), "utf8").toString('base64')}, config),
                    dir1_base: kas,
                    dir2_base: kas2,
                    dir3_base: kas3,
                    config: config
                };
                running = true
                ipcRenderer.send('updateVersion', a);
            }
        }
    }
}

document.getElementById('fontConfig').onclick = async () => {
    if(running){
        Swal.fire({
            icon: 'error',
            text: '이미 다른 작업이 시행중입니다!',
        })
        return
    }
    await Swal.fire({
        title: '주의사항',
        icon: 'warning',
        text: '폰트 변경/크기 변경은 게임 내 폰트를 즉시 변경합니다.'
    })
    let result = await Swal.fire({
        title: '무엇을 하시겠습니까?',
        icon: 'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '폰트 변경',
        denyButtonText: `폰트 크기 변경`,
        cancelButtonText: '취소'
    })
    if (result.isConfirmed) {
        running = true
        ipcRenderer.send('selFont', document.getElementById('folder_input').value)
    } else if (result.isDenied) {
        let { value: result2 } = await Swal.fire({
            title: '폰트 크기 입력',
            input: 'text',
            inputValue: 24,
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return '무언가 입력해야 합니다!'
              }
              if (isNaN(value)) {
                return '숫자가 아닙니다!'
              }
            }
        })
        if(result2){
            running = true
            ipcRenderer.send('changeFontSize', [document.getElementById('folder_input').value, parseInt(result2)])
        }

    }
}