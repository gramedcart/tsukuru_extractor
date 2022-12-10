(() => {
    const { ipcRenderer } = require('electron');
    const bottomMenu = document.querySelector('.smalmar');
    const mainMenu = document.querySelector('#mainMenu');
    const simpleMenu = document.querySelector('#simpleMenu');
    const Popper = window.Popper;
    let globalSettings;
    ipcRenderer.on('getGlobalSettings', (evn, tt) => {
        globalSettings = tt;
        const tData = (globalSettings.themeData);
        let root = document.documentElement;
        for (const i in tData) {
            root.style.setProperty(i, tData[i]);
        }
    });
    function genPopper(id, text) {
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        document.body.appendChild(tooltip);
        const button = document.getElementById(id);
        tooltip.innerText = text;
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
    function changeMenu(type) {
        bottomMenu.style.display = 'none';
        mainMenu.style.display = 'none';
        simpleMenu.style.display = 'none';
        if (type === 'simple') {
            simpleMenu.style.display = 'block';
            bottomMenu.style.display = 'flex';
        }
        else if (type === 'main') {
            mainMenu.style.display = 'block';
        }
    }
    function loadSimple() {
        changeMenu('simple');
        {
            genPopper('marTrans', '번역기로 번역합니다.');
            document.getElementById('marTrans').onclick = () => {
                document.getElementById('handTrans').removeAttribute('selected');
                document.getElementById('marTrans').setAttribute('selected', '');
                document.getElementById('marCont').style.display = 'flex';
                document.getElementById('handCont').style.display = 'none';
            };
            genPopper('handTrans', '직접 번역합니다.');
            document.getElementById('handTrans').onclick = () => {
                document.getElementById('marTrans').removeAttribute('selected');
                document.getElementById('handTrans').setAttribute('selected', '');
                document.getElementById('handCont').style.display = 'flex';
                document.getElementById('marCont').style.display = 'none';
            };
        }
    }
    document.getElementById('icon1').onclick = () => { ipcRenderer.send('close'); };
    document.getElementById('icon2').onclick = () => { ipcRenderer.send('minimize'); };
    document.getElementById('gokupu').onclick = () => { ipcRenderer.send('changeURL', './src/html/main/index.html'); };
    document.getElementById('simpuru').onclick = loadSimple;
    document.getElementById('sel').addEventListener('click', () => {
        ipcRenderer.send('select_folder', 'folder_input');
    });
    ipcRenderer.on('set_path', (evn, tt) => {
        document.getElementById(tt.type).value = tt.dir;
        if (tt.type !== 'folder_input') {
            document.getElementById(tt.type).innerText = tt.dir;
        }
    });
    changeMenu('main');
})();