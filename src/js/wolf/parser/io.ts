import { lenStr } from "../../../../globals"

export class WolfParserIo{
    data:Buffer
    pointer:number = 0
    constructor(data:Buffer){
        this.data = Buffer.from(data)
    }
    readBytes(bytes:number){
        const arr = this.data.subarray(this.pointer, this.pointer + bytes)
        this.pointer += bytes
        return arr
    }
    byteArrayCompare(data:Buffer, equals:number[]){
        const comp = Buffer.from(new Uint8Array(equals))
        return comp.equals(data)
    }
    readU4le(){
        const bytes = 4
        const arr = this.data.subarray(this.pointer, this.pointer + bytes)
        this.pointer += bytes
        return arr.readInt32LE()
    }
    readU1(){
        const bytes = 1
        const arr = this.data.subarray(this.pointer, this.pointer + bytes)
        this.pointer += bytes
        return arr.readUInt8()
    }
    readLenStr():lenStr{
        const pos1 = (this.pointer);
        const len = this.readU4le();
        const pos2 = (this.pointer);
        const str = this.readBytes(len);
        const pos3 = (this.pointer);
        return {
            pos1: pos1,
            pos2: pos2,
            pos3: pos3,
            str: str,
            len: len
        }
    }
    readMapEvent():WolfMapEvent{
        const check1 = this.readU1();
        if (!(check1 === 111)) {
          throw 'ValidationNotEqualError'
        }
        const check2 = this.readU4le();
        if (!(check2 === 12345)) {
          throw 'ValidationNotEqualError'
        }
        const eventId = this.readU4le();
        const name = this.readLenStr()
        const x = this.readU4le();
        const y = this.readU4le();
        const pageLen = this.readU4le();
        const unkLen = this.readU4le();
        const unk = this.readBytes(unkLen);
        let pages:WolfPage[] = [];
        for (let i = 0; i < pageLen; i++) {
          pages.push(this.readEventPage());
        }
        const check3 = this.readU1();
        if (!(check3 == 112)) {
          throw 'ValidationNotEqualError'
        }
        return {
            eventId: eventId,
            name: name,
            x: x,
            y: y,
            pages: pages
        }
    }

    readCmd():WolfCmd{
        const numArgLen = this.readU1();
        let numArg:number[] = [];
        for (let i = 0; i < numArgLen; i++) {
          numArg.push(this.readU4le());
        }
        const indent = this.readU1();
        const strArgLen = this.readU1();
        let strArg:lenStr[] = [];
        for (let i = 0; i < strArgLen; i++) {
          strArg.push(this.readLenStr());
        }
        const hasMoveRoute = this.readU1();
        if (!( ((hasMoveRoute == 0) || (hasMoveRoute == 1)) )) {
          throw "ValidationNotAnyOfError"
        }
        if (hasMoveRoute >= 1) {
            const moveRoute = this.readMoveRoute()
        }
        return {
            numArg: numArg,
            strArg: strArg
        }
    }

    readMoveRoute(){
        const moveRouteType = ({
            DONT_MOVE: 0,
            CUSTOM: 1,
            RANDOM: 2,
            TOWARD_HERO: 3,
      
            0: "DONT_MOVE",
            1: "CUSTOM",
            2: "RANDOM",
            3: "TOWARD_HERO",
        
        })
        const animSpeed = this.readU1();
        const moveSpeed = this.readU1();
        const moveFreq = this.readU1();
        const type = this.readU1();
        const options = this.readRouteOptions()
        const customRouteOptions = this.readRouteOptions()
        const routeLen = this.readU4le();
        let routes:WolfRoute[] = [];
        for (let i = 0; i < routeLen; i++) {
            routes.push(this.readRoute());
        }
        return routes
    }

    readRoute():WolfRoute{
        const type = this.readU1();
        const u4ArgLen = this.readU1();
        let u4Arg:number[] = [];
        for (let i = 0; i < u4ArgLen; i++) {
            u4Arg.push(this.readU4le());
        }
        const u1ArgLen = this.readU1();
        let u1Arg:number[] = [];
        for (let i = 0; i < u1ArgLen; i++) {
            u1Arg.push(this.readU1());
        }
        return {
            type: type,
            u1Arg: u1Arg,
            u4Arg: u4Arg
        }
    }

    readRouteOptions(){
        const flag = this.readU1();
        return {flag:flag}
    }

    readEventPage():WolfPage{
        const check = this.readU1();
        if (!(check === 121)) {
          throw 'ValidationNotEqualError'
        }
        const graphic = this.readEventGraphic()
        const cond = this.readEventCond()
        const moveRoute = this.readMoveRoute();
        const cmdLen = this.readU4le();
        let cmd:WolfCmd[] = [];
        for (let i = 0; i < cmdLen; i++) {
          cmd.push(this.readCmd());
        }
        const unkLen = this.readU4le();
        const unk = this.readBytes(unkLen);
        const check2 = this.readU1();
        if (!(check2 === 122)) {
          throw 'ValidationNotEqualError'
        }
        return {
            cmd: cmd,
        }
    }

    readEventGraphic(){
        const unk = this.readU4le();
        const graphicName = this.readLenStr()
        const graphicDirection = this.readU1();
        const graphicFrame = this.readU1();
        const graphicOpacity = this.readU1();
        const graphicRenderMode = this.readU1();
        return {
            unk: unk,
            graphicName: graphicName,
            graphicDirection: graphicDirection,
            graphicFrame: graphicFrame,
            graphicOpacity: graphicOpacity,
            graphicRenderMode: graphicRenderMode
        }
    }

    readEventCond(){
        const type = this.readU1();
        let flags:{ flag: number; }[] = [];
        for (let i = 0; i < 4; i++) {
          flags.push(this.readRouteOptions())
        }
        let lets:number[] = [];
        for (let i = 0; i < 4; i++) {
          lets.push(this.readU4le());
        }
        let values:number[] = [];
        for (let i = 0; i < 4; i++) {
          values.push(this.readU4le());
        }
    }

    readCEvent(){
        const checka = this.readU1();
        if (!(checka === 142)) {
          throw `ValidationNotEqualError ${checka} 1 `
        }
        const id = this.readU4le();
        const runCond = this.readU1();
        const c = this.readU4le();
        if (!(c === 2000000)) {
            return false
            // throw `ValidationNotEqualError ${c} 2 `
        }
        const d = this.readU4le();
        if (!(d === 0)) {
          return false
            // throw `ValidationNotEqualError ${d} 3 `
        }
        const enabledNumArgNum = this.readU1();
        const enabledStrArgNum = this.readU1();
        const name = this.readLenStr();
        const len = this.readU4le();
        let ins:WolfCmd[] = [];
        for (let i = 0; i < len; i++) {
            const inst = this.readCInstruction()
            if(inst){
                ins.push(inst);
            }
        }
        const noteLen = this.readU4le();
        const unk = this.readBytes(noteLen);
        if (noteLen >= 1) {
          const note = this.readLenStr();
        }
        const check = this.readU1();
        if (!( ((check === 142) || (check === 143) || (check === 144)) )) {
            throw `ValidationNotEqualError ${check}`
        }
        if (check !== 142) {
          const hmm = this.readHmm()
        }
        return {events: ins}
    }

    readCInstruction(){
        const u8ArgLen = this.readU1();
        let u8Arg:number[] = [];
        for (let i = 0; i < u8ArgLen; i++) {
          u8Arg.push(this.readU4le());
        }
        const indent = this.readU1();
        const strArgLen = this.readU1();
        let strArg:lenStr[] = [];
        for (let i = 0; i < strArgLen; i++) {
          strArg.push(this.readLenStr());
        }
        const l4 = this.readU1();
        if (l4 >= 1) {
          const l5 = this.readBytes(6);
        }
        if (l4 >= 1) {
          const l6 = this.readU4le();
          if (l6 <= 65536) {
            const l7 = this.readKuku()
          }
        }
        return {numArg:u8Arg, strArg: strArg}
    }
    readKuku(){
        const ku1 = this.readU1();
        const ku2Len = this.readU1();
        let ku2:number[] = [];
        for (let i = 0; i < ku2Len; i++) {
          ku2.push(this.readU4le());
        }
        const ku3Len = this.readU1();
        const ku3 = this.readBytes(ku3Len);
    }
    readHmm(){
      const argNamesLen = this.readU4le();
      let argNames:lenStr[] = [];
      for (let i = 0; i < argNamesLen; i++) {
        argNames.push(this.readLenStr());
      }
      const typeLen = this.readU4le();
      let types:number[] = [];
      for (let i = 0; i < typeLen; i++) {
        types.push(this.readU1());
      }
      const argSpecialStrDataLen = this.readU4le();
      let argSpecialStrData:lenStr[][] = [];
      for (let i = 0; i < argSpecialStrDataLen; i++) {
        argSpecialStrData.push(this.readArgSpecialStrData());
      }
      const argSpecialNumDataLen = this.readU4le();
      let argSpecialNumData:number[][] = [];
      for (let i = 0; i < argSpecialNumDataLen; i++) {
        argSpecialNumData.push(this.readArgSpecialNumData());
      }
      const argDefaultLen = this.readU4le();
      let argDefault:number[] = [];
      for (let i = 0; i < argDefaultLen; i++) {
        argDefault.push(this.readU4le());
      }
      const check = this.readU1();
      if (!( ((check == 143) || (check == 144)) )) {
        throw 'ValidationNotAnyOfError'
      }
      if (check === 144) {
        const po = this.readCpo()
      }
    }
    readArgSpecialStrData(){
      const valuesLen = this.readU4le();
      let values:lenStr[] = [];
      for (let i = 0; i < valuesLen; i++) {
        values.push(this.readLenStr());
      }
      return values
    }

    readArgSpecialNumData(){
      const valuesLen = this.readU4le();
      let values:number[] = [];
      for (let i = 0; i < valuesLen; i++) {
        values.push(this.readU4le());
      }
      return values
    }

    readCpo(){
      const color = this.readU4le();
      let varNames:lenStr[] = [];
      for (var i = 0; i < 100; i++) {
        varNames.push(this.readLenStr());
      }
      const check = this.readU1();
      if (!( ((check == 144) || (check == 145)) )) {
        throw `ValidationNotAnyOfError ${check} [144|145]`
      }
      if (check == 145) {
        const wm = this.readWm()
      }
    }

    readWm(){
      const a = this.readLenStr()
      const check = this.readU1();
      if (!( ((check == 145) || (check == 146)) )) {
        throw `ValidationNotAnyOfError ${check} [145|146]`
      }
      if (check == 146) {
        const returner = this.readWmReturn()
      }
    }

    readWmReturn(){
      const name =this.readLenStr()
      const valueId = this.readU4le();
      const check = this.readU1();
      if (!(check == 146)) {
        throw `ValidationNotEqualError ${check} [146]`
      }
    }
}

interface WolfRoute{
    type: number,
    u1Arg: number[],
    u4Arg: number[]
}

export interface WolfCmd{
    numArg:number[],
    strArg:lenStr[]
}

interface WolfPage{
    cmd: WolfCmd[]
}

export interface WolfMapEvent{
    eventId: number,
    name: lenStr,
    x: number,
    y: number,
    pages: WolfPage[]
}