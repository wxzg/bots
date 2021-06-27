const request = require('superagent')
const cheerio = require('cheerio')

request
    .post('https://www.atmosusa.com/')
    .end((err, res) => {
        if(err){
            console.log(err)
        }else{
            console.log(1)
            console.log(res.text)
        }
    })