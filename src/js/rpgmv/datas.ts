const styles = require('./styles').default

export const settings = {
    userdict: {},
    extractJs: false,
    extractSomeScript: false,
    extractSomeScript2: [],
    code122: false,
    onefile_src: true,
    onefile_note: true,
    safeTrans: true,
    smartTrans: true,
    exJson: false,
    loadingText: true,
    JsonChangeLine: false,
    ExtractAddLine: false,
    oneMapFile: false,
    ExternMsgJson: true,
    DoNotTransHangul: true,
    formatNice: true,
    fastEztrans: true,
    theme: "Dracula",
    themeData: {},
    extractPlus: [],
    themeList: Object.keys(styles),
    hideUnrecomenedTranslators: true,
    language: 'en'
}

export const onebyone = {
    'Actors.json': 'actor',
    'Armors.json': 'item',
    'Classes.json': 'class',
    'CommonEvents.json': 'events',
    'Skills.json': 'skill',
    'States.json': 'state',
    'System.json': 'sys',
    'Enemies.json': 'ene',
    'Weapons.json': 'item',
    'Items.json': 'item',
    'ext_plugins.json': 'plugin',
    'Troops.json': 'ene2'
}

const odat = [
    'Actors.txt',
    'Armors.txt',
    'Classes.txt',
    'CommonEvents.txt',
    'Skills.txt',
    'States.txt',
    'System.txt',
    'Enemies.txt',
    'Troops.txt',
    'Weapons.txt',
    'Items.txt',
    'Troops.txt',
]
export default odat

export const ignores = [
    'Actors.json',
    'Animations.json',
    'Armors.json',
    'Classes.json',
    'CommonEvents.json',
    'Enemies.json',
    'Troops.json',
    'Items.json',
    'Skills.json',
    'States.json',
    'System.json',
    'Tilesets.json',
    'Troops.json',
    'Weapons.json'
]

export const translateable = [
    '<profile:',
    '<desc1:',
    '<desc2:',
    '<desc3:',
    '<SG説明',
    '<SG説明2:',
    "<namePop:",
    "<SGカテゴリ:",
    '<shop_mes:',
]

export const translateableOne = [
    "<namePop:"
]

export const note2able = [
    '選択肢ヘルプ',
]

export const hanguls = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

export const beautifyCodes = [
    108
]

export const beautifyCodes2 = [
    355,356,357
]