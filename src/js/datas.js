const styles = require('./styles').default

exports.settings = {
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
    themeList: Object.keys(styles)
}

exports.onebyone = {
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
    'Troops.json': 'ene',
    'ext_plugins.json': 'plugin',
    'Troops.json': 'ene2',
}

exports.default = [
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

exports.ignores = [
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

exports.translateable = [
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

exports.translateableOne = [
    "<namePop:"
]

exports.note2able = [
    '選択肢ヘルプ',
]

exports.hanguls = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

exports.beautifyCodes = [
    108
]

exports.beautifyCodes2 = [
    355,356,357
]