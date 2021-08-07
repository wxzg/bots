const {ipcRenderer} = require('electron')
const minWin = document.querySelector(".min-win")
const closeWin = document.querySelector(".close-win")

minWin.onclick = () => {
    ipcRenderer.send('min-app')
}

closeWin.onclick = () => {
    ipcRenderer.send('close-app')
}
