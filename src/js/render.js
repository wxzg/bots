let holder = document.querySelector('#holder')
let fs = require('fs')

console.log(holder)
holder.addEventListener('drop', (e) => {
    //阻止默认行为
    e.preventDefault()
    //阻止冒泡
    e.stopPropagation()

    for (const file of e.dataTransfer.files) {
        const path = file.path

        fs.readFile(path, 'utf8',(err,data) => {

            const divs = document.createElement('li')
            const wrap = document.querySelector('#wrap')

            divs.innerHTML = data

            wrap.appendChild(divs)
        })
    }
})

holder.addEventListener('dragover', (e) => {
    //阻止默认行为
    e.preventDefault()
    //阻止冒泡
    e.stopPropagation()
})

