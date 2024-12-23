export function getQueryVariable(variableName: string): string | undefined {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variableName) {
            return decodeURIComponent(pair[1]);
        }
    }
    return undefined
}