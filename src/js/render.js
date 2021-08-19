const {ipcRenderer} = require('electron')
const minWin = document.querySelector(".min-win")
const closeWin = document.querySelector(".close-win")

//缩小主界面
minWin.onclick = () => {
    ipcRenderer.send('min-app')
}

//关闭主界面
closeWin.onclick = () => {
    ipcRenderer.send('close-app')
}


//右下角时间
const time = document.querySelector("#time")
setInterval("time.innerHTML=new Date().toLocaleString()+'  星期'+'日一二三四五六'.charAt(new Date().getDay());",1000)

//左侧导航栏按钮,右侧功能界面切换
const task = document.querySelector('.task-page-wrap')
const profile = document.querySelector('.profile-page-wrap')
const proxy = document.querySelector('.proxy-page-wrap')
const login = document.querySelector('.login-page-wrap')
const chart = document.querySelector('.chart-page-wrap')

const task_btn = document.querySelector('.task-btn')
const profile_btn = document.querySelector('.profile-btn')
const proxy_btn = document.querySelector('.proxy-btn')
const login_btn = document.querySelector('.login-btn')
const chart_btn = document.querySelector('.chart-btn')

const title = document.querySelector('.title')



//chart界面
chart_btn.onclick = function(){
    chart.style.display = "flex"
    task.style.display = "none"
    profile.style.display = "none"
    proxy.style.display = "none"
    login.style.display = "none"
    title.innerHTML = "DashBoard"
}

//task界面
task_btn.onclick = function(){
    chart.style.display = "none"
    task.style.display = "flex"
    profile.style.display = "none"
    proxy.style.display = "none"
    login.style.display = "none"
    title.innerHTML = "Tasks"
}

//profile界面
profile_btn.onclick = function(){
    chart.style.display = "none"
    task.style.display = "none"
    profile.style.display = "flex"
    proxy.style.display = "none"
    login.style.display = "none"
    title.innerHTML = "Profile"
}

//proxy界面
proxy_btn.onclick = function(){
    chart.style.display = "none"
    task.style.display = "none"
    profile.style.display = "none"
    proxy.style.display = "flex"
    login.style.display = "none"
    title.innerHTML = "Proxy"
}

//用户login界面
login_btn.onclick = function(){
    chart.style.display = "none"
    task.style.display = "none"
    profile.style.display = "none"
    proxy.style.display = "none"
    login.style.display = "flex"
    title.innerHTML = "Login"
}
