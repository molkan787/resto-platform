export function generateReferenceNumber(pointer: number, domain: string){
    return `${domain}${prependZeros(pointer, 4)}`
}

export function prependZeros(num: number, minLength: number){
    const str = num.toString();
    const pc = Math.max(minLength - str.length, 0);
    return '0'.repeat(pc) + str;
}