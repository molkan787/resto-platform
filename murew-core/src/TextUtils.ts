import { Days } from "./interfaces";

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

export function getDayNameFromDate(date: Date){
    return Days[date.getDay()];
}

export function minutesToText(totalMinutes: number){
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes - hours * 60;
    return [
        hours > 0 ? (hours > 1 ? `${hours} Hours` : '1 Hour') : '',
        minutes > 0 ? (minutes > 1 ? `${minutes} Minutes` : '1 Minute') : ''
    ].join(' ').trim();
}