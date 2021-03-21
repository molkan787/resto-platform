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