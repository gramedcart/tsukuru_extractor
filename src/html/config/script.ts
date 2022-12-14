const { ipcRenderer } = require('electron');

let gsettings:{[key:string]:any} = {}
const CheckboxValues = [
  'ExtractAddLine',
  'onefile_src',
  'onefile_note',
  'JsonChangeLine',
  'extractSomeScript',
  'oneMapFile',
  'loadingText',
  'ExternMsgJson',
  'DoNotTransHangul',
  'formatNice',
  'hideUnrecomenedTranslators'
]

ipcRenderer.on("settings", (evt, arg) => {
  try{
    gsettings = arg
    const userdict = arg.userdict
    const ess2 = arg.extractSomeScript2
    const extractPlus = arg.extractPlus
    if(arg.language === 'en'){
      globalThis.loadEn()
    }
  
    for(const keys in Object.keys(userdict)){
      const key = Object.keys(userdict)[keys];
      (document.getElementById('userdict') as HTMLTextAreaElement).value += key + '=' + userdict[key] + '\n'
    }
  
    (document.getElementById('extractSomeScript2') as HTMLTextAreaElement).value += ess2.join('\n');
    (document.getElementById('extractPlus') as HTMLTextAreaElement).value += extractPlus.map(String).join('\n');
    (document.getElementById('language') as HTMLSelectElement).value = arg.language
    CheckboxValues.forEach((val) => {
      (document.getElementById(val) as HTMLInputElement).checked = gsettings[val]
    })
    document.getElementById('update').innerText = `업데이트 확인 (현재: ${gsettings.version})`
    document.getElementById('update').onclick = () => {ipcRenderer.send('updates')}
    document.getElementById('license').onclick = () => {ipcRenderer.send('license')}
    _reload()
  }
  catch(e){
    alert(e)
  }
})

function _reload(){
  if(gsettings.extractSomeScript){
    document.getElementById('extractSomeScript2').className = ''
  }
  else{
    document.getElementById('extractSomeScript2').className = 'invisible'
  }
}

document.getElementById('extractSomeScript').addEventListener('change', (event) => {
  gsettings.extractSomeScript = (document.getElementById('extractSomeScript') as HTMLInputElement).checked
  _reload()
})

document.getElementById('apply').onclick = () => {
  const iVal = ((document.getElementById('userdict') as HTMLInputElement).value).split('\n')
  let userdict = {}
  for(let i=0;i<iVal.length;i++){
    if(typeof(iVal[i]) == 'string'){
      if(iVal[i].includes('=')&& (iVal[i].split('=').length == 2)){
        const temp = iVal[i].split('=')
        userdict[temp[0]] = temp[1]
      }
    }
  }
  gsettings.userdict = userdict
  CheckboxValues.forEach((val) => {
    gsettings[val] = (document.getElementById(val) as HTMLInputElement).checked
  })
  gsettings.theme = 'Dracula'
  gsettings.extractSomeScript2 = (document.getElementById('extractSomeScript2') as HTMLTextAreaElement).value.split('\n')

  const extractPlusValues = (document.getElementById('extractPlus') as HTMLTextAreaElement).value.split('\n')
  let extP = []
  for(const val of extractPlusValues){
    const tn = parseInt(val)
    if(!isNaN(tn)){
      extP.push(tn)
    }
  }
  gsettings.extractPlus = extP

  gsettings.language = (document.getElementById('language') as HTMLSelectElement).value
  ipcRenderer.send('applysettings', gsettings);
}

document.getElementById('close').onclick = () => {
  ipcRenderer.send('closesettings', gsettings);
}