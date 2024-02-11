export function fixDecimals(num: number, decimalsCount: number){
    const factor = Math.pow(10, decimalsCount)
    return Math.floor(num * factor) / factor
}