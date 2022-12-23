(() => {
    const { ipcRenderer} = require('electron');
    const bottomMenu = document.querySelector('.smalmar') as HTMLDivElement
    const mainMenu = document.querySelector('#mainMenu') as HTMLDivElement
    const simpleMenu = document.querySelector('#simpleMenu') as HTMLDivElement
    const Popper = (window as any).Popper as any
    let running = false
    let globalSettings:{[key:string]:any}
    let LastPercent = -1.0
    let zinheng = [0, 0]
    let estimatedTime = ''
    let loadingTag = ''

    ipcRenderer.send('setheight', 420);
    //@ts-ignore
    const Swal = window.Swal
    
    ipcRenderer.on('getGlobalSettings', (evn, tt) => {
        globalSettings = tt
        if(tt.language === 'en'){
            globalThis.loadEn()
        }
        const tData = (globalSettings.themeData)
        let root = document.documentElement;
        for(const i in tData){
            root.style.setProperty(i,tData[i]);
        }
    })

    ipcRenderer.on('alertExten', async (ev, arg) => {
        const {isDenied} = await Swal.fire({
            icon: 'success',
            showDenyButton: true,
            denyButtonText: "아니요",
            title: arg[0],
        })
        if(!isDenied){
            ipcRenderer.send("getextention", arg[1])
        }
        else{
            ipcRenderer.send("getextention", 'none')
        }
    })

    let config:{[key:string]:boolean} = {}
    let LastTime = -1


    function genPopper(id:string, text:string, entext:string|null = null){
        entext = entext ?? text
        const tooltip = document.createElement('div')
        tooltip.classList.add('tooltip')
        document.body.appendChild(tooltip)
        const button = document.getElementById(id)
        tooltip.innerHTML = text.replace(/\r/g, '').replace(/\n/g, '<br>');
        tooltip.setAttribute('enlang', entext)
        const popperInstance = Popper.createPopper(button, tooltip, {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
            ],
        });
        function show() {
            tooltip.setAttribute('data-show', '');
            popperInstance.update();
        }
        function hide() {
            tooltip.removeAttribute('data-show');
        }
        const showEvents = ['mouseenter', 'focus'];
        const hideEvents = ['mouseleave', 'blur'];

        showEvents.forEach((event) => {
            button.addEventListener(event, show);
        });

        hideEvents.forEach((event) => {
            button.addEventListener(event, hide);
        });
    }

    function changeMenu(type:'main'|'simple'){
        bottomMenu.style.display = 'none'
        simpleMenu.style.display = 'none'
        if(type === 'simple'){
            simpleMenu.style.display = 'block'
            bottomMenu.style.display = 'flex'
        }
    }
    
    document.getElementById('icon1').onclick = () => {ipcRenderer.send('close')}
    document.getElementById('icon2').onclick = () => {ipcRenderer.send('minimize')}
    document.getElementById('sel').addEventListener('click', () => {
        ipcRenderer.send('select_folder', 'folder_input');
    });
    ipcRenderer.on('set_path', (evn, tt) => {
        (document.getElementById(tt.type) as HTMLInputElement).value = tt.dir
        if(tt.type !== 'folder_input'){
            document.getElementById(tt.type).innerText = tt.dir
        }
    });
    document.getElementById('WolfBtn').onclick = () => {
        ipcRenderer.send('changeURL', './src/html/main/index.html')
    }
    changeMenu('simple')
    {
        genPopper('ext-buran', '수정 시 불안정할 수 있는 텍스트도 추출합니다.', 'Extract text that can make errors the game when modifying it.')
        genPopper('ext-all', '발견할 수 있는 이벤트 내의 모든 텍스트를 추출합니다.\n수정 시 오류가 나기 쉽습니다.', 'Extract all Texts from game.\nEditing these strings is prone to errors.')
        genPopper('runbtn', '추출을 시작합니다', 'Start extract')
        genPopper('runbtn2', '적용을 시작합니다', 'Start apply')
        genPopper('marTrans', '게임에서 텍스트를 추출합니다', 'Extract strings from the game')
        genPopper('handTrans', '추출한 텍스트를 다시 게임에 적용합니다', 'Apply the extracted text back to the game')
        document.getElementById('marTrans').onclick = () => {
            document.getElementById('handTrans').removeAttribute('selected')
            document.getElementById('marTrans').setAttribute('selected', '')
            document.getElementById('marCont').style.display = 'flex'
            document.getElementById('handCont').style.display = 'none'
            if(globalSettings.HideExtractAll){
                document.getElementById('ext-all').style.display = 'none'
            }
            else{
                document.getElementById('ext-all').style.display = 'block'

            }

        }
        document.getElementById('handTrans').onclick = () => {
            document.getElementById('marTrans').removeAttribute('selected')
            document.getElementById('handTrans').setAttribute('selected', '')
            document.getElementById('handCont').style.display = 'flex'
            document.getElementById('marCont').style.display = 'none'
        }
        document.getElementById('runbtn').onclick = () => {
            if(running){
                Swal.fire({
                    icon: 'error',
                    text: '이미 다른 작업이 시행중입니다!',
                })
                return
            }
            running = true
            const folder = (document.getElementById('folder_input') as HTMLInputElement).value
            ipcRenderer.send('wolf_ext', {folder:folder,config:config})
        }
        document.getElementById('runbtn2').onclick = () => {
            if(running){
                Swal.fire({
                    icon: 'error',
                    text: '이미 다른 작업이 시행중입니다!',
                })
                return
            }
            running = true
            const folder = (document.getElementById('folder_input') as HTMLInputElement).value
            ipcRenderer.send('wolf_apply', {folder:folder,config:config})
        }

        document.getElementById('fold').onclick = () => {ipcRenderer.send("openFolder", (document.getElementById('folder_input') as HTMLInputElement).value)}

    }
    {
        const doms = document.querySelectorAll('[btn-val]')
        for(let i=0;i<doms.length;i++){
            const dom = doms[i] as HTMLElement
            dom.addEventListener('click', () => {
                const da = dom.getAttribute('btn-val')
                if(dom.hasAttribute('btn-active')){
                    dom.removeAttribute('btn-active')
                }
                else{
                    dom.setAttribute('btn-active', '')
                }
                config[da] = dom.hasAttribute('btn-active')
            })
        }
    }

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

    ipcRenderer.on('alert2', async (evn, tt) => {
        const {isDenied} = await Swal.fire({
            icon: 'success',
            showDenyButton: true,
            denyButtonText: "폴더 열기",
            
            title: '완료되었습니다',
        })
        if(isDenied){
            ipcRenderer.send("openFolder", (document.getElementById('folder_input') as HTMLInputElement).value)
        }
    });

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
            'eztrans': '일본어만 지원합니다. Eztrans가 설치되어 있어야 합니다.',
            'kakao': '카카오 번역 모드입니다.<br>일본어 이외의 언어를 번역하는데 유용합니다',
        }
    
    
        const selectOptions = {
            'eztrans': 'EzTrans',
            'kakao': '카카오 번역기',
        }
    
        const v = await Swal.fire({
            icon: 'info',
            title: '번역기를 선택해주세요',
            input: 'select',
            inputOptions: selectOptions,
            confirmButtonText: '확인',
            inputValidator: (value) => {
                return new Promise<void|string>((resolve) => {
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
            const inputs = transtype === 'kakao' ? {
                'en': '영어 (english)',
                'jp': '일본어 (日本語)',
                'cn': '대만어 (台灣語)',
                'fr': '프랑스어 (Français)',
                'es': '스페인어 (español)',
                'ru': '러시아어 (Русский)',
                'de': "독일어 (deutches)"
            } : {
                'en': '영어 (english)',
                'ja': '일본어 (日本語)',
                'zh-CN': '대만어-간체 (台灣語)',
                'zh-TW': '대만어-정체 (台灣語)',
                'fr': '프랑스어 (Français)',
                'es': '스페인어 (español)',
                'ru': '러시아어 (Русский)'
            }
    
            const langu2 = await Swal.fire({
                icon: 'info',
                title: '시작 언어를 선택해주세요',
                input: 'select',
                inputOptions: inputs,
                confirmButtonText: '확인',
                inputValidator: (value) => {
                    return new Promise<void|string>((resolve) => {
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
            dir: Buffer.from((document.getElementById('folder_input') as HTMLInputElement).value.replace('\\','/'), "utf8").toString('base64'),
            type: transtype,
            langu: langu,
            game: 'wolf'
        };
        running = true
        ipcRenderer.send('eztrans', a);
        return
    }
    ipcRenderer.on('worked', () => {
        running = false
    })

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
    
})()