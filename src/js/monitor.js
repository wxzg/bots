const axios = require('axios-https-proxy-fix')
const $ = require('cheerio')
const request = require('request-promise')
const btn = document.getElementById('monitorBtn')
const tunnel = require('tunnel')

btn.onclick = function () {
    btn.classList.toggle("btn-success")
    btn.classList.toggle("btn-danger")
    if (btn.classList.contains('btn-success')) {
        btn.innerHTML = '开始监听'
        
    } else {
        btn.innerHTML = '停止监听'
        getPageContents()
    }

}

//请求获取目标页面
async function getPageContents() {
    
    const option = {
        url:'https://www.atmosusa.com/collections/adidas',
        // method:'get',
        // proxy: {
            //     host: '43.92.71.52',
            //     port: 6837
            // 
        }
        
        return await axios(option).then(res => {
            const body = $.load(res.data)
            let arr = [...body("h2.ProductItem__Title a")]
            console.log(arr)
            const itemList = document.getElementById('show')
            for (const item of arr) {
                console.log(item.children[0].data)
                const li = document.createElement('li')
                li.innerHTML = item.children[0].data
                itemList.append(li)
            }
            //return res
        }).catch(err => {
            console.error(err)
        })
}
    
async function monitorPage() {
    
}



    // const option = {
    //     uri: "https://www.yeezysupply.com",
    //     proxy: getProxyString({
    //         "ip_address": "43.92.71.52",
    //         "port": 6837,
    //         "protocol": "http",
    //         "username": 'B9HhPUTuAM',
    //         "password": 'xl2JPv544U'
    //     }),
    //     resolveWithFullResponse:true
    // }

    function getProxyString(proxy) {
        return `${proxy.protocol}://${proxy.username
        ? `${proxy.username}${proxy.password ? `:${proxy.password}@` : '@'}`
        : ''}${proxy.ip_address}${proxy.port ? `:${proxy.port}` : ''}`
    }