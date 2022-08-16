const path = require('path')

exports.checkIsMapFile = function (fileName) {
    try {
        fileName = path.parse(fileName).name
        if(fileName === 'Map'){
            return true
        }
        else if (fileName.substring(0, 3) == 'Map') {
            const anum = parseInt(fileName.substring(3, fileName.length))
            if (!isNaN(anum)) {
                return true
            }
        }
        return false
    } catch (error) {
        return false
    }
}

exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}