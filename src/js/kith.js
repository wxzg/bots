const puppeteer = require('puppeteer')


const productInfo ={
    url : "https://kith.com/collections/mens-footwear/products/lnaglr041-dk",
    size: 7
}

async function testPuppeteer({url, size}){
    const browser = await puppeteer.launch({
        headless:false,
    })
    const page = await browser.newPage()
    await page.goto(url, { 
        waitUntil: 'domcontentloaded'
     })

     console.log("Gets the product Id for the specified dimensions of the product.")

    //获取商品ID -- find 遍历数组返回符合要求的第一个元素 --  endswith 如果末尾字符串中包含传入字符串则返回true
    const variantId = await page.evaluate((sizeStr) => {
        //window.ShopifyAnalytics.meta.product中保存着当前商品所有size的详细信息，是个数组
        const { variants } = window.ShopifyAnalytics.meta.product;
        return variants.find((variant) => variant.name.endsWith(sizeStr)).id;
    }, size);

    console.log("Get a success，the product Id is ：", variantId)

    let isInCart = false;
    while (!isInCart) {
      console.log('Attempting to add product to cart.');

      // evaluate函数可以在当前page环境下执行
      isInCart = await page.evaluate(async (id) => {
        /* 
            form_type: product
            utf8: ✓
            properties[upsell]: mens
            id: 39246497775744
            quantity: 1
        */
        const item = { id, quantity: 1 };

        const data = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: [item]
          })
        };

        //添加到购物车
        const response = await fetch('/cart/add.js', data);
        if (response.status === 200) return true
        return false;
      }, variantId);
    }

    if(isInCart){
        console.log('Added to cart successfully!')
    }else{
        console.log('Add to cart failure!')
    }
    
}

  testPuppeteer(productInfo)