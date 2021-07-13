const request = require('superagent')
const cheerio = require('cheerio')

//https://www.atmosusa.com/collections/mens-footwear-1/products/pro-leather-hi-white-red
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

    
/**
 * 1.商品URL连接
 *     ↓
 *     ↓
 * 2.https://www.atmosusa.com/cart/add  POST请求  Form Data：
 *     ↓                                         {
 *     ↓                                          form_type: product
 *     ↓                                          utf8: ✓
 *     ↓                                          id: 39331036135476
 *     ↓                                          quantity: 1
 *     ↓                                          event_id: 7a588303-5161-402A-87B2-537937B7942D
 *     ↓                                         }
 *     ↓302
 * 3.https://www.atmosusa.com/cart
 *     ↓
 *     ↓302
 * 4.https://www.atmosusa.com/1185742900/checkouts/1b7ad1cfe18ed77bedfce783b14b8411/stock_problems?_ga=2.90590938.1324631667.1625535226-732808981.1625113790
 *                             商店ID                 cookie：tracked_start_checkout                      cookie：_shopify_ga
 *     ↓
 *     ↓
 * 5.https://www.atmosusa.com/1185742900/checkouts/1b7ad1cfe18ed77bedfce783b14b8411
 *     ↓
 * 6.https://www.atmosusa.com/1185742900/checkouts/1b7ad1cfe18ed77bedfce783b14b8411?previous_step=contact_information&step=shipping_method 
 * _method: patch
authenticity_token: WDvH4DV8PqNJJlX6GacjIGNArVVLwCWLMnl47UyTEGIVBzMO6MoPCFxwVoytbQM1VGJLnKQjAUwF5Gok_zwSFA
previous_step: contact_information
step: shipping_method
checkout[email]: 598449069@qq.com
checkout[buyer_accepts_marketing]: 0
checkout[buyer_accepts_marketing]: 1
checkout[shipping_address][first_name]: 
checkout[shipping_address][last_name]: 
checkout[shipping_address][address1]: 
checkout[shipping_address][address2]: 
checkout[shipping_address][city]: 
checkout[shipping_address][country]: 
checkout[shipping_address][province]: 
checkout[shipping_address][zip]: 
checkout[shipping_address][first_name]: Cheney
checkout[shipping_address][last_name]: Zhu
checkout[shipping_address][address1]: 624 Rodeo Place
checkout[shipping_address][address2]: 
checkout[shipping_address][city]: Anchorage
checkout[shipping_address][country]: United States
checkout[shipping_address][province]: AK
checkout[shipping_address][zip]: 99508
 */

    //https://www.atmosusa.com/1185742900/checkouts/1b7ad1cfe18ed77bedfce783b14b8411/stock_problems?_ga=2.60865580.1015421839.1625113790-732808981.1625113790
    
    //https://www.ubiqlife.com/checkout
    //https://www.atmosusa.com/cart/add->/cart
    //https://www.atmosusa.com/1185742900/checkouts/1b7ad1cfe18ed77bedfce783b14b8411


    //https://www.atmosusa.com/1185742900/checkouts/0155ce0694a5790099d9dcb21fa2f1e2?previous_step=shipping_method&step=payment_method
    //https://www.atmosusa.com/1185742900/checkouts/0155ce0694a5790099d9dcb21fa2f1e2?previous_step=contact_information&step=shipping_method
    //https://www.atmosusa.com/1185742900/checkouts/0155ce0694a5790099d9dcb21fa2f1e2
    //https://www.atmosusa.com/1185742900/checkouts/0155ce0694a5790099d9dcb21fa2f1e2/stock_problems?_ga=2.244221383.390684814.1625121117-1255912041.1624341380


    //2021282210175
    // cookie _shopify_ga  _ga=2.122263051.1015421839.1625113790-732808981.1625113790
    //tracked_start_checkout	1b7ad1cfe18ed77bedfce783b14b8411