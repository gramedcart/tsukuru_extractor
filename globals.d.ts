import { BrowserWindow } from "electron"

export declare global {
    var mwindow:BrowserWindow
    var settings:{[key:string]: boolean}
}