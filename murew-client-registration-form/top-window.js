window.onmessage = function(e) {
    const { applicationId } = e.data
    console.log('got applicationId:', applicationId)
    const search = (window.location.search.length > 0 ? '&' : '?') + `aid=${applicationId}`
    window.location.replace(window.location.href + search)
}


function loadFormPage(){
    let qs = window.location.search
    const appLink = encodeURIComponent(window.location.href)
    if(qs.length > 0){
        qs += `&appLink=${appLink}`
    }else{
        qs = `?appLink=${appLink}`
    }
    /** @type {HTMLIFrameElement} */
    const el = document.getElementById('regform_iframe')
    el.src = `/registration-app/${qs}`
}
loadFormPage()