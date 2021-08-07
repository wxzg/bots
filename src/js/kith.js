const puppeteer = require('puppeteer')


async function testPuppeteer(){
    const browser = await puppeteer.launch({
        headless:false,
    })
    const page = await browser.newPage()
    await page.goto('https://www.yeezysupply.com/product/FV5666', { 
        waitUntil: 'domcontentloaded'
     })

     console.log(1)

    // //获取商品ID -- find 遍历数组返回符合要求的第一个元素 --  endswith 如果末尾字符串中包含传入字符串则返回true
    // const variantId = await page.evaluate((sizeStr) => {
    // //window.ShopifyAnalytics.meta.product中保存着当前商品所有size的详细信息，是个数组
    // const { variants } = window.ShopifyAnalytics.meta.product;
    // return variants.find((variant) => variant.name.endsWith(sizeStr)).id;
    // }, 7);


}

 testPuppeteer()