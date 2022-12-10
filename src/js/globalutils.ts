import path from 'path'

export const checkIsMapFile = function (fileName:string) {
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

export const sleep = (ms:number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
