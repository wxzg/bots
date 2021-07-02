const request = require('superagent')
const cheerio = require('cheerio')

let monitorUrl = 'https://www.atmosusa.com/collections/adidas/products/ws-nizza-platform-black-white'
request
    .get(monitorUrl)
    .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
    .set('accept-language', 'en-US,en;q=0.9')
    .set('cache-control', 'max-age=0')
    .set('dnt', '1')
    .set('sec-fetch-dest', 'document')
    .set('sec-fetch-mode', 'navigate')
    .set('sec-fetch-site', 'none')
    .set('sec-fetch-user', '?1')
    .set('upgrade-insecure-requests', '1')
    .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36')
    .end((err, res) => {
        if(err){
            console.log(err,'ubip-18')
        }else{                                                                                                  
            const $ = cheerio.load(res.text)
            const allScript = $('script')
            let shopId = ''
            for(const script of allScript){

                const data = script.children[0].data
 
                if(/shopId/.test(data)){
                    let sJSON = JSON.parse(data)
                    shopId = sJSON["shopId"]
                    console.log(sJSON)
                    console.log(shopId)
                    break;
                }
            }
        }
    })

    
    //https://www.atmosusa.com/1185742900/checkouts/1b7ad1cfe18ed77bedfce783b14b8411/stock_problems?_ga=2.60865580.1015421839.1625113790-732808981.1625113790
    //https://www.ubiqlife.com/checkout
    //2021282210175