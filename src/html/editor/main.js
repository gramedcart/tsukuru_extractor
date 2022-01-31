let fileData = ''

const infoDom = document.getElementById('info')
const editor = document.getElementById('editor')

function reloadInfo(){
    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
     }
    let info = `문자: ${fileData.length} | 줄: ${fileData.split('\n').length} | 용량: ${bytesToSize((new TextEncoder().encode(fileData)).length)}`
    infoDom.innerHTML = info
}

reloadInfo()

editor.addEventListener('input', () => {
    fileData = editor.value
    reloadInfo()
})

document.addEventListener("keydown", function(e) {
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      alert('saveEvent');
    }
}, false);
console.log('e')