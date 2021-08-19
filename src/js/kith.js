const puppeteer = require('puppeteer')
//const solveCaptcha = require('../tools/captcha');
const proxyChain = require('proxy-chain')
const useProxy = require('puppeteer-page-proxy')

import solveCaptcha from '../tools/captcha.js';


const shippingAddress =  {
  first_name:'Kcpro',
  last_name:'Qiyo',
  address_line_1:'CLQE 217 MIA DR',
  address_line_2:'APT 71199',
  city:'Newark',
  country:'United States',
  state:'Delaware',
  postal_code:'19711',
  phone_number:'3127412743'
}

const productInfo ={
    url : "https://kith.com/collections/mens-footwear/products/nkdc5331-001",
    size: 8
}

//z869903437
//N93cFWlAeMvCx3YO_country-UnitedStates_session-boH2aoDw
async function testPuppeteer({url, size}){

    //const newProxyUrl = await proxyChain.anonymizeProxy('proxy3.wukong.business:9999')

    const browser = await puppeteer.launch({
        headless:false,
    })
    const page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
    
    //await useProxy(page, 'http://z869903437:N93cFWlAeMvCx3YO_country-UnitedStates_session-gQWeK1hN@34.194.151.90:31112')


    page.setDefaultNavigationTimeout(0);

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

    let checkoutComplete = false;

    if(isInCart){
      await page.waitForTimeout(50);

      checkoutComplete = await checkouts({
          page,
          url,
          shippingAddress
        })

      return checkoutComplete;
    }else{
        console.log('Add to cart failure!')
    }
    
}

async function checkouts({
  page,
  url,
  shippingAddress
}){

    console.log('Navigating to checkout page');

    await page.goto(`https://kith.com/checkout`, { waitUntil: 'domcontentloaded' });

    let hasCaptcha = false;
    let checkoutComplete = false;

    let cardDetails = {
      cardNumber: 4859530199510780,
      nameOnCard: 'Maxcard',
      expirationMonth: 4,
      expirationYear: 2024,
      securityCode: 64
    };
    
    // if (cardFriendlyName) {
    //   cardDetails = getCardDetailsByFriendlyName(cardFriendlyName);
    // }

    const emailSelector = 'input#checkout_email';
    const submitButtonsSelector = 'button#continue_button';

    const shippingSpeedsSelector = 'input[name="checkout[shipping_rate][id]"]';

    const cardFieldsIframeSelector = 'iframe.card-fields-iframe';
    const creditCardNumberSelector = 'input#number';
    const nameOnCardSelector = 'input#name';
    const creditCardExpirationDateSelector = 'input#expiry';
    const creditCardCVVSelector = 'input#verification_value';

    const differentBillingAddressSelector = 'input#checkout_different_billing_address_true';

    const captchaSelector = 'div#g-recaptcha';
    try {
      hasCaptcha = await page.waitForSelector(captchaSelector, { timeout: 1000 });
    } catch (err) {
      // no-op if timeout occurs
    }

    if (hasCaptcha) {
      if (autoSolveCaptchas) {
        const solved = await solveCaptcha({
           page, captchaSelector
        });
        if (solved) hasCaptcha = false;
      } else {
        console.log('Detected captcha for manual solving');
        //const recipient = notificationEmailAddress;
        //const subject = 'Checkout task unsuccessful';
        //const text = `The checkout task for ${url} size ${size} has a captcha. Please open the browser and complete it within 5 minutes.`;
        //await sendEmail({ recipient, subject, text });
        //console.log(text);

        await Promise.race([
          new Promise(() => {
            setTimeout(() => {
              throw new Error('The captcha was not solved in time.');
            }, 5 * 60 * 1000);
          }),
          new Promise((resolve) => {
            const interval = setInterval(async () => {
              const solved = await page.evaluate(() => {
                return document.querySelector('#g-recaptcha-response').value.length > 0;
              });
              if (solved) {
                hasCaptcha = false;
                resolve();
                clearInterval(interval);
              }
            }, 1000);
          })
        ]);
      }
    }

    await page.waitForSelector(emailSelector);
    await page.type(emailSelector, 'yvonlara9@gmail.com', {
      delay: 10
    });
    await page.waitForTimeout(500);

    console.log('Entering shipping details');
    await enterAddressDetails({ page, address: shippingAddress, type: 'shipping' });

    await page.waitForSelector(submitButtonsSelector);
    await page.click(submitButtonsSelector);
    await page.waitForTimeout(500);

    console.log('Selecting desired shipping speed');
    await page.waitForSelector(shippingSpeedsSelector);
    const shippingSpeeds = await page.$$(shippingSpeedsSelector);
    await shippingSpeeds[0].click();
    await page.waitForTimeout(500);

    await page.waitForSelector(submitButtonsSelector);
    await page.click(submitButtonsSelector);
    await page.waitForTimeout(500);

    console.log('Entering card details');
    await page.waitForSelector(cardFieldsIframeSelector);
    const cardFieldIframes = await page.$$(cardFieldsIframeSelector);

    const cardNumberFrameHandle = cardFieldIframes[0];
    const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
    await cardNumberFrame.waitForSelector(creditCardNumberSelector);
    await cardNumberFrame.type(
      creditCardNumberSelector,
      cardDetails.cardNumber,
      {
        delay: 10
      }
    );

    const nameOnCardFrameHandle = cardFieldIframes[1];
    const nameOnCardFrame = await nameOnCardFrameHandle.contentFrame();
    await nameOnCardFrame.waitForSelector(
      nameOnCardSelector
    );
    await nameOnCardFrame.type(
      nameOnCardSelector,
      cardDetails.nameOnCard,
      {
        delay: 10
      }
    );
    await page.waitForTimeout(2000);

    const cardExpirationDateFrameHandle = cardFieldIframes[2];
    const cardExpirationDateFrame = await cardExpirationDateFrameHandle.contentFrame();
    await cardExpirationDateFrame.waitForSelector(
      creditCardExpirationDateSelector
    );
    await cardExpirationDateFrame.type(
      creditCardExpirationDateSelector,
      cardDetails.expirationMonth + cardDetails.expirationYear,
      {
        delay: 10
      }
    );
    await page.waitForTimeout(500);

    const cardCVVFrameHandle = cardFieldIframes[3];
    const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
    await cardCVVFrame.type(creditCardCVVSelector, cardDetails.securityCode, {
      delay: 10
    });
    await page.waitForTimeout(500);

    // some sites do not require billing address or do not allow a different billing address from shipping address
    try {
      await page.waitForSelector(differentBillingAddressSelector);
      await page.click(differentBillingAddressSelector);
      await page.waitForTimeout(500);

      console.log('Entering billing details');
      await enterAddressDetails({
        page,address: shippingAddress, type: 'billing'
      });
    } catch (err) {
      // no-op if timeout occurs
    }

    console.log('Clicking submit order button');
    await page.waitForSelector(submitButtonsSelector);
    await page.click(submitButtonsSelector);
    await page.waitForTimeout(2000);

    await page.goto(`https://kith.com/checkout`, { waitUntil: 'domcontentloaded' });
    if (page.url() === `https://kith.com/cart`) {
      checkoutComplete = true;
    }

    return checkoutComplete;
}

async function enterAddressDetails({ page, address, type }) {
  try {
    const firstNameSelector = `input#checkout_${type}_address_first_name`;
    const lastNameSelector = `input#checkout_${type}_address_last_name`;
    const address1Selector = `input#checkout_${type}_address_address1`;
    const address2Selector = `input#checkout_${type}_address_address2`;
    const citySelector = `input#checkout_${type}_address_city`;
    const countrySelector = `select#checkout_${type}_address_country`;
    const stateSelector = `select#checkout_${type}_address_province`;
    const postalCodeSelector = `input#checkout_${type}_address_zip`;
    const phoneNumberSelector = `input#checkout_${type}_address_phone`;

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, address.first_name, {
      delay: 10
    });
    await page.waitForTimeout(500);

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, address.last_name, {
      delay: 10
    });
    await page.waitForTimeout(500);

    await page.waitForSelector(address1Selector);
    await page.type(address1Selector, address.address_line_1, {
      delay: 10
    });
    await page.waitForTimeout(500);

    await page.waitForSelector(address2Selector);
    await page.type(address2Selector, address.address_line_2, {
      delay: 10
    });
    await page.waitForTimeout(500);

    await page.waitForSelector(citySelector);
    await page.type(citySelector, address.city, {
      delay: 10
    });
    await page.waitForTimeout(500);
    
    try {
      await page.waitForSelector(countrySelector);
      await page.select(countrySelector, address.country);
      await page.waitForTimeout(2000);
    } catch (err) {
      // no op if timeout waiting for state selector
    }

    try {
      await page.waitForSelector(stateSelector);
      await page.type(stateSelector, address.state,{
        delay:10
      });
      await page.waitForTimeout(500);
    } catch (err) {
      // no op if timeout waiting for state selector
    }

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postal_code, {
      delay: 10
    });
    await page.waitForTimeout(500);

    await page.waitForSelector(phoneNumberSelector);
    await page.type(phoneNumberSelector, 1 + address.phone_number, {
      delay: 10
    });
    await page.waitForTimeout(500);
  } catch (err) {
    throw err;
  }
}

testPuppeteer(productInfo)