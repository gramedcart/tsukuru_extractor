const { ipcRenderer } = require('electron');
const { set } = require('lodash');

let settings = {}

ipcRenderer.on("settings", (evt, arg) => {
  settings = arg
  const userdict = arg.userdict
  const ess2 = arg.extractSomeScript2

  for(const keys in Object.keys(userdict)){
    const key = Object.keys(userdict)[keys]
    document.getElementById('userdict').value += key + '=' + userdict[key] + '\n'
  }

  document.getElementById('extractSomeScript2').value += ess2.join('\n')
  document.getElementById('extractJs').checked = settings.extractJs
  document.getElementById('code122').checked = settings.code122
  document.getElementById('safeTrans').checked = settings.safeTrans
  document.getElementById('smartTrans').checked = settings.smartTrans
  document.getElementById('ExtractAddLine').checked = settings.ExtractAddLine
  document.getElementById('onefile_src').checked = settings.onefile_src
  document.getElementById('onefile_note').checked = settings.onefile_note
  document.getElementById('JsonChangeLine').checked = settings.JsonChangeLine
  document.getElementById('extractSomeScript').checked = settings.extractSomeScript
  document.getElementById('oneMapFile').checked = settings.oneMapFile
  document.getElementById('loadingText').checked = settings.loadingText
  document.getElementById('oneMapFile').checked = settings.oneMapFile
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
  settings.extractJs = document.getElementById('extractJs').checked
  settings.code122 = document.getElementById('code122').checked
  settings.ExtractAddLine = document.getElementById('ExtractAddLine').checked
  settings.onefile_src = document.getElementById('onefile_src').checked
  settings.onefile_note = document.getElementById('onefile_note').checked
  settings.loadingText = document.getElementById('loadingText').checked
  settings.safeTrans = document.getElementById('safeTrans').checked
  settings.smartTrans = document.getElementById('smartTrans').checked
  settings.extractSomeScript = document.getElementById('extractSomeScript').checked
  settings.JsonChangeLine = document.getElementById('JsonChangeLine').checked
  settings.oneMapFile = document.getElementById('oneMapFile').checked
  settings.extractSomeScript2 = document.getElementById('extractSomeScript2').value.split('\n')
  ipcRenderer.send('applysettings', settings);
}

document.getElementById('close').onclick = () => {
  ipcRenderer.send('closesettings', settings);
}