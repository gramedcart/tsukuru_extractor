"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.checkIsMapFile = void 0;
const path_1 = __importDefault(require("path"));
const checkIsMapFile = function (fileName) {
    try {
        fileName = path_1.default.parse(fileName).name;
        if (fileName === 'Map') {
            return true;
        }
        else if (fileName.substring(0, 3) == 'Map') {
            const anum = parseInt(fileName.substring(3, fileName.length));
            if (!isNaN(anum)) {
                return true;
            }
        }
        return false;
    }
    catch (error) {
        return false;
    }
};
exports.checkIsMapFile = checkIsMapFile;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
