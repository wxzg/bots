const webview = document.querySelector("#vw")


webview.addEventListener('did-start-loading', () => {
    console.log('loading...')
})

webview.addEventListener('did-stop-loading', () => {
    

    webview.executeJavascript(`
        
    `)
})