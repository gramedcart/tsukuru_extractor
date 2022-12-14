(() => {
    const { ipcRenderer} = require('electron');
    const bottomMenu = document.querySelector('.smalmar') as HTMLDivElement
    const mainMenu = document.querySelector('#mainMenu') as HTMLDivElement
    const simpleMenu = document.querySelector('#simpleMenu') as HTMLDivElement
    const Popper = (window as any).Popper as any
    
    let globalSettings:{[key:string]:any}
    
    ipcRenderer.send('setheight', 420);

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

        }
        document.getElementById('handTrans').onclick = () => {
            document.getElementById('marTrans').removeAttribute('selected')
            document.getElementById('handTrans').setAttribute('selected', '')
            document.getElementById('handCont').style.display = 'flex'
            document.getElementById('marCont').style.display = 'none'

        }
    }
    
})()