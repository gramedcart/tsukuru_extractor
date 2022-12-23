(() => {
    const { ipcRenderer} = require('electron');
    const mainMenu = document.querySelector('#mainMenu') as HTMLDivElement
    
    let globalSettings
    
    ipcRenderer.on('getGlobalSettings', (evn, tt) => {
        globalSettings = tt
        if(tt.language === 'en'){
            document.getElementById('lang-en').classList.add('btxSel')            
            globalThis.loadEn()
        }
        else{
            document.getElementById('lang-ko').classList.add('btxSel')
        }
        const tData = (globalSettings.themeData)
        let root = document.documentElement;
        for(const i in tData){
            root.style.setProperty(i,tData[i]);
        }
    })
    
    document.getElementById('icon1').onclick = () => {ipcRenderer.send('close')}
    document.getElementById('icon2').onclick = () => {ipcRenderer.send('minimize')}
    document.getElementById('gokupu').onclick = () => {ipcRenderer.send('changeURL', './src/html/main/index.html')}
    document.getElementById('simpuru').onclick = () => {ipcRenderer.send('changeURL', './src/html/wolf/index.html')}
    document.getElementById('lang-en').onclick = () => {ipcRenderer.send('changeLang', 'en')}
    document.getElementById('lang-ko').onclick = () => {ipcRenderer.send('changeLang', 'ko')}

    ipcRenderer.on('set_path', (evn, tt) => {
        (document.getElementById(tt.type) as HTMLInputElement).value = tt.dir
        if(tt.type !== 'folder_input'){
            document.getElementById(tt.type).innerText = tt.dir
        }
    });
    mainMenu.style.display = 'block'

    ipcRenderer.on('alert_free', (evn, tt) => {
        //@ts-ignore
        Swal.fire(tt)
    });
})()