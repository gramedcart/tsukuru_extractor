globalThis.loadEn = (async () => {
    while(true){
        const d = document.querySelectorAll('[enlang]')
        for(const ele of d){
            ele.innerHTML = ele.getAttribute('enlang').replace(/\r/g, '').replace(/\n/g, '<br>');
        }
        await new Promise(r => setTimeout(r, 5));    
    }
})