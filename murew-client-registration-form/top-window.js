window.onmessage = function(e) {
    const { applicationId } = e.data
    console.log('got applicationId:', applicationId)
    const search = (window.location.search.length > 0 ? '&' : '?') + `aid=${applicationId}`
    window.location.replace(window.location.href + search)
}


function getQueryVariable(variableName) {
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
const queryApplicationId = getQueryVariable('aid')
if(typeof queryApplicationId === 'string' && queryApplicationId.length > 1){
    loadFormPage(queryApplicationId)
}else{
    loadFormPage()
}

function loadFormPage(aid){
    /** @type {HTMLIFrameElement} */
    const el = document.getElementById('regform_iframe')
    el.src = '/registration-app/' + (aid ? '?aid=' + aid : '')
}