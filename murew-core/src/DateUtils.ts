/**
 * Returns a month date string formated as "yyyy-mm"
 * @param date The date to format as string
 */
export function getDateMonthValue(date: Date): string{
    const yyyy = date.getFullYear();
    const mm = ('0' + (1 + date.getMonth()).toString()).substr(-2);
    return `${yyyy}-${mm}`;
}

export function getCurrentMonthValue(){
    return getDateMonthValue(new Date());
}

export function getDateTimeValue(date: Date){
    const hh = ('0' + date.getHours().toString()).substr(-2);
    const mm = ('0' + date.getMinutes().toString()).substr(-2);
    return `${hh}:${mm}`;
}