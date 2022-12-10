"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sendUpdateInfo() {
    sendAlertSmall(`<div class="updateInfoContainer">
    !! 번역기 사용시 아네모네가 아닌 내장 번역기를 사용해주세요 !!
    <br><br>업데이트 2.0.0<br>
    <span class="updateInfo">
    - 추출 속도 개선<br>
    - 설정창 디자인 수정<br>
    - 텍스트 간 구분 추가<br>
    - 카카오 번역기 스마트 모드 추가<br>
    - 다음 code를 가진 데이터를 추가로 추출하기 설정 추가<br>
    - 스크립트 추출 시 코드 122 추출 설정 삭제<br>
    - Node.js 19로 업데이트<br>
    - Electron 22로 업데이트<br>
    - 보안 취약점 수정<br>
    </span>
    <br><br>업데이트 1.18.7<br>
    <span class="updateInfo">
    - 카카오 번역 오류 수정<br>
    </span>
    <br><br>업데이트 1.18.6<br>
    <span class="updateInfo">
    - 프로젝트 변환 오류 수정<br>
    </span>
    <br><br>업데이트 1.18.5<br>
    <span class="updateInfo">
    - 암호화/복호화 개선<br>
    </span>
    <br><br>업데이트 1.18.4<br>
    <span class="updateInfo">
    - 암호화/복호화 폴더이름 오류 수정<br>
    </span>
    <br><br>업데이트 1.18.3<br>
    <span class="updateInfo">
    - eztrans 사용시 스마트 번역이 제대로 되지 않는 오류 수정<br>
    </span>
    <br><br>업데이트 1.18.2<br>
    <span class="updateInfo">
    - eztrans 사용시 %가 제대로 번역되지 않는 오류 수정<br>
    </span>
    <br><br>업데이트 1.18.1<br>
    <span class="updateInfo">
    - 카카오 번역기 사용시 %가 제대로 번역되지 않는 오류 수정<br>
    - 카카오 번역기 사용시 번역 중 사용하는 # 문자가 남아있는 오류 수정<br>
    - 업데이트 알림 개선<br>
    </span>
    <br><br>업데이트 1.18.0<br>
    <span class="updateInfo">
    - 업데이트 알림 추가됨<br>
    - 파일 암복호화 개선<br>
    - 카카오 번역기 오류 수정<br>
    </span>
    </div>`);
}
exports.default = sendUpdateInfo;
function sendAlertSmall(txt) {
    globalThis.mwindow.webContents.send('alert_free', { html: txt, width: "90vw" });
}
