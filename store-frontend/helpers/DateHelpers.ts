export function dateToStringValue(date: Date, sep: string = '-'): string{
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1).toString()).substr(-2);
    const dd = ('0' + date.getDate()).substr(-2);
    return `${yyyy}${sep}${mm}${sep}${dd}`;
}