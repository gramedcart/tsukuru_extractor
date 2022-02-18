const { ipcRenderer } = require('electron');

let settings = {}
const CheckboxValues = [
  'extractJs',
  'code122',
  'safeTrans',
  'smartTrans',
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
]

ipcRenderer.on("settings", (evt, arg) => {
  settings = arg
  const userdict = arg.userdict
  const ess2 = arg.extractSomeScript2

  for(const keys in Object.keys(userdict)){
    const key = Object.keys(userdict)[keys]
    document.getElementById('userdict').value += key + '=' + userdict[key] + '\n'
  }

  document.getElementById('extractSomeScript2').value += ess2.join('\n')
  CheckboxValues.forEach((val) => {
    document.getElementById(val).checked = settings[val]
  })
  document.getElementById('update').innerText = `업데이트 확인 (현재: ${settings.version})`
  document.getElementById('update').onclick = () => {ipcRenderer.send('updates')}
  document.getElementById('license').onclick = () => {ipcRenderer.send('license')}
  _reload()
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
  settings.extractSomeScript2 = document.getElementById('extractSomeScript2').value.split('\n')
  ipcRenderer.send('applysettings', settings);
}

document.getElementById('close').onclick = () => {
  ipcRenderer.send('closesettings', settings);
}