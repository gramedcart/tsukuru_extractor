const { ipcRenderer } = require('electron');

let settings = {}
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
    settings = arg
    const userdict = arg.userdict
    const ess2 = arg.extractSomeScript2
    const extractPlus = arg.extractPlus
  
    for(const keys in Object.keys(userdict)){
      const key = Object.keys(userdict)[keys]
      document.getElementById('userdict').value += key + '=' + userdict[key] + '\n'
    }
  
    document.getElementById('extractSomeScript2').value += ess2.join('\n')
    document.getElementById('extractPlus').value += extractPlus.map(String).join('\n')
  
    CheckboxValues.forEach((val) => {
      document.getElementById(val).checked = settings[val]
    })
    document.getElementById('update').innerText = `업데이트 확인 (현재: ${settings.version})`
    document.getElementById('update').onclick = () => {ipcRenderer.send('updates')}
    document.getElementById('license').onclick = () => {ipcRenderer.send('license')}
    _reload()
  }
  catch(e){
    alert(e)
  }
})

function _reload(){
  if(settings.extractSomeScript){
    document.getElementById('extractSomeScript2').className = ''
  }
  else{
    document.getElementById('extractSomeScript2').className = 'invisible'
  }
}

document.getElementById('extractSomeScript').addEventListener('change', (event) => {
  settings.extractSomeScript = document.getElementById('extractSomeScript').checked
  _reload()
})

document.getElementById('apply').onclick = () => {
  const iVal = (document.getElementById('userdict').value).split('\n')
  let userdict = {}
  for(let i=0;i<iVal.length;i++){
    if(typeof(iVal[i]) == 'string'){
      if(iVal[i].includes('=')&& (iVal[i].split('=').length == 2)){
        const temp = iVal[i].split('=')
        userdict[temp[0]] = temp[1]
      }
    }
  }
  settings.userdict = userdict
  CheckboxValues.forEach((val) => {
    settings[val] = document.getElementById(val).checked
  })
  settings.theme = 'Dracula'
  settings.extractSomeScript2 = document.getElementById('extractSomeScript2').value.split('\n')

  const extractPlusValues = document.getElementById('extractPlus').value.split('\n')
  let extP = []
  for(const val of extractPlusValues){
    const tn = parseInt(val)
    if(!isNaN(tn)){
      extP.push(tn)
    }
  }
  settings.extractPlus = extP


  ipcRenderer.send('applysettings', settings);
}

document.getElementById('close').onclick = () => {
  ipcRenderer.send('closesettings', settings);
}