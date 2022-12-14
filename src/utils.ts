export function decodeEncoding(buffer:Uint8Array){
    return Buffer.from(buffer).toString('utf-8')
    // return iconv.decode(Buffer.from(buffer), "Shift_JIS")
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
