export function itemsText(count: number, singular: string, plural: string): string {
    return count == 1 ? `1 ${singular}` : `${count} ${plural}`;
}

const CURRENCY_SYMBOL = '£';

export function formatPrice(val: number | string){
    let _val = typeof val == 'string' ? parseFloat(val) : val;
    const negative = _val < 0;
    if(negative){
        _val *= -1;
    }
    const str_val = _val.toFixed(2);
    return (negative ? '- ' : '').concat(CURRENCY_SYMBOL).concat(str_val);
}