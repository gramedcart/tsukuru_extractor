const fs = require('fs');
const ExtTool = require('./extract.js')
const path = require('path')
const edTool = require('./edtool.js')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getBinarySize(string) {
    return Buffer.byteLength(string, 'utf8');
}
const getMainWindow = () => {
  return globalThis.mwindow
}
exports.apply = async (ev, arg) => {
    try {
      const dir = (Buffer.from(arg.dir, "base64").toString('utf8'));
      if (! await fs.existsSync(dir + '/Extract')){
        globalThis.mwindow.webContents.send('alert', {icon: 'error', message: 'Extract 폴더가 존재하지 않습니다'}); 
        globalThis.mwindow.webContents.send('worked', 0);
        return
      }
      if (!edTool.exists(dir)){
        globalThis.mwindow.webContents.send('alert', {icon: 'error', message: '.extracteddata 파일이 존재하지 않습니다'}); 
        globalThis.mwindow.webContents.send('worked', 0);
        return
      }
      if(!arg.instantapply){
        if (await fs.existsSync(dir + '/.Completed')){
          await fs.rmSync(dir + '/Completed', { recursive: true })
        }
        if (!await fs.existsSync(dir + '/.Completed')){
          try {
            await fs.mkdirSync(dir + '/Completed')
          } catch (error) {}
          try {
            await fs.mkdirSync(dir + '/Completed/data')
          } catch (error) {}
          try {
            await fs.mkdirSync(dir + '/Completed/js')
          } catch (error) {}
        }
      }
      const jsdir = ((dir.substring(0,dir.length-5) + '/js').replaceAll('//','/'))
      let ext_data = edTool.read(dir)
      if(ext_data.main === undefined){
        while(ext_data.main === undefined){
          ext_data = ext_data.dat
        }
      }
      const ext_dat = ext_data.main
      const max_files = Object.keys(ext_dat).length
      let worked_files = 0
      let OutputData = {}
      for(const i of Object.keys(ext_dat)){
        if(fs.existsSync(dir + '/Backup/' + i)){
          let filedata = await fs.readFileSync(dir + '/Backup/' + i, 'utf8')
          if (filedata.charCodeAt(0) === 0xFEFF) {
            filedata = filedata.substring(1);
          }
          try {
            OutputData[i] = JSON.parse(filedata)  
          } catch (error) {}
        }
      }
      for(const i of Object.keys(ext_dat)){
        worked_files += 1
        if(i.includes('.json')){
          let Edata = (await fs.readFileSync(dir + '/Extract/' + path.parse(i).name + '.txt', 'utf8')).split('\n')
          for(const q of Object.keys(ext_dat[i].data)){
            let output = ''
            let autoline = false
            let originFile = ext_dat[i].data[q].origin ?? i
            if(ext_dat[i].data[q].conf !== undefined){
                const econf = ext_dat[i].data[q].conf
                if(arg.autoline && econf.type == 'event' && econf.code == 401){
                    autoline = true
                }
            }
            for(let x=parseInt(q);x<ext_dat[i].data[q].m;x++){
              let forUse = Edata[x]
              if(autoline && (getBinarySize(forUse) > 60)){
                  const v = forUse.split(' ')
                  if(v.length > 0){
                    v[(Math.floor(v.length/2)) - 1] = '\n' + v[(Math.floor(v.length/2)) - 1]
                  }
                  forUse = v.join(' ')
              }
              output += forUse
              if(x !== (ext_dat[i].data[q].m - 1)){
                output += '\n'
              }
            }
            try {
              OutputData[originFile] = ExtTool.setObj(ext_dat[i].data[q].val, output, OutputData[originFile]) 
            } catch (error) {
              console.log(ext_dat[i].data[q].val)
              console.log(error)
            }
          }
        }
        globalThis.mwindow.webContents.send('loading', worked_files/max_files*100);
        await sleep(0)
      }

      for(const i of Object.keys(OutputData)){
        const data = OutputData[i]
        if(i == 'ext_plugins.json'){
          const vaq = `var $plugins = ${JSON.stringify(data)};`
          if(arg.instantapply){
            fs.writeFileSync(jsdir + '/plugins.js', vaq,'utf8')
          }
          else{
            fs.writeFileSync(dir + '/Completed/js/plugins.js', vaq,'utf8')
          }
        }
        else if(i == 'ExternMsgcsv.json'){
          await ExtTool.pack_externMsg(dir + '/Completed/data/ExternMessage.csv', data)
        }
        else{
          const dataJson = JSON.stringify(data, null, 4*globalThis.JsonChangeLine)
          if(arg.instantapply){
            fs.writeFileSync(dir + '/' + i, dataJson,'utf8')
          }
          else{
            fs.writeFileSync(dir + '/Completed/data/' + i, dataJson,'utf8')
          }
        }
      }
      
      ExtTool.EncryptDir(dir, 'img', arg.instantapply)
      ExtTool.EncryptDir(dir, 'audio', arg.instantapply)

      globalThis.mwindow.webContents.send('alert', '완료되었습니다'); 
      globalThis.mwindow.webContents.send('loading', 0);
    } catch (err) {
      globalThis.mwindow.webContents.send('alert', {icon: 'error', message: JSON.stringify(err, Object.getOwnPropertyNames(err))}); 
    }
    globalThis.mwindow.webContents.send('worked', 0);
}