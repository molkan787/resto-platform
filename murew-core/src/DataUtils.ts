export function getMapItems<T>(map: Map<String, T>, keys: String[]): T[] {
    return <T[]>keys.map(k => map.get(k)).filter(i => typeof i !== "undefined");
}

export function arrayToMap<T>(array: T[], key: keyof T): Map<String, T> {
    const map = new Map<String, T>();
    const len = array.length;
    for(let i = 0; i < len; i++) {
        const item = array[i];
        map.set((<any>item)[key], item);
    }
    return map;
}