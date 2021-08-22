const puppeteer = require('puppeteer')
const proxyChain = require('proxy-chain')
const useProxy = require('puppeteer-page-proxy')

import solveCaptcha from '../tools/captcha.js';

const card = {
    cardNumber: '4859530199510780',
    nameOnCard: 'Maxcard',
    expirationMonth: '4',
    expirationYear: '2024',
    securityCode: '64'
}

const shippingAddress = {
    first_name: 'Kcpro',
    last_name: 'Qiyo',
    address_line_1: 'CLQE 217 MIA DR',
    address_line_2: 'APT 71199',
    city: 'Newark',
    country: 'United States',
    state: 'Delaware',
    postal_code: '19711',
    phone_number: '3127412743'
}

const productInfo = {
    url: "https://kith.com/collections/mens-footwear/products/nkdc5331-001",
    size: 8,
    billingAddress: shippingAddress
}

async function enterAddressDetails({
    page,
    address
}) {
    try {
        const nameSelector = 'input#order_billing_name';
        const emailSelector = 'input#order_email';
        const phoneNumberSelector = 'input#order_tel';
        const address1Selector = 'input#bo';
        const address2Selector = 'input#oba3';
        const postalCodeSelector = 'input#order_billing_zip';
        // const citySelector = 'input#order_billing_city';
        // const stateSelector = 'select#order_billing_state';

        await page.waitForSelector(nameSelector);
        await page.type(nameSelector, `${address.first_name} ${address.last_name}`, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        await page.waitForSelector(emailSelector);
        await page.type(emailSelector, address.email_address, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        await page.waitForSelector(phoneNumberSelector);
        await page.type(phoneNumberSelector, address.phone_number, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        await page.waitForSelector(address1Selector);
        await page.type(address1Selector, address.address_line_1, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        await page.waitForSelector(address2Selector);
        await page.type(address2Selector, address.address_line_2, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        await page.waitForSelector(postalCodeSelector);
        await page.type(postalCodeSelector, address.postal_code, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        // Prefilled by supremenewyork

        // await page.waitForSelector(citySelector);
        // await page.type(citySelector, address.city, {
        //     delay: 10
        // });
        // await page.waitForTimeout(2000);

        // await page.waitForSelector(stateSelector);
        // await page.select(stateSelector, address.state);
        // await page.waitForTimeout(2000);
    } catch (err) {
        throw err;
    }
}

async function checkout({
    taskLogger,
    page,
    billingAddress,
    autoSolveCaptchas,
    url,
    size
}) {
    try {
        console.log('Navigating to checkout page');
        const checkoutButtonSelector = 'a.button.checkout';
        await page.waitForSelector(checkoutButtonSelector);
        await page.click(checkoutButtonSelector);

        let hasCaptcha = false;
        let checkoutComplete = false;

        let cardDetails = card;

        //   if (cardFriendlyName) {
        //     cardDetails = getCardDetailsByFriendlyName(cardFriendlyName);
        //   }

        const creditCardNumberSelector = 'div#card_details input[placeholder="number"]';
        const creditCardExpirationMonthSelector = 'select#credit_card_month';
        const creditCardExpirationYearSelector = 'select#credit_card_year';
        const creditCardCVVSelector = 'div#card_details input[placeholder="CVV"]';

        const orderTermsCheckboxSelector = 'input#order_terms';
        const submitButtonsSelector = 'div#pay input[type="submit"]';

        console.log('Entering billing details (must be same as shipping details)');
        await enterAddressDetails({
            page,
            address: billingAddress
        });

        console.log('Entering card details');
        await page.waitForSelector(creditCardNumberSelector);
        await page.type(
            creditCardNumberSelector,
            cardDetails.cardNumber, {
                delay: 10
            }
        );

        await page.waitForSelector(
            creditCardExpirationMonthSelector
        );
        await page.select(
            creditCardExpirationMonthSelector,
            cardDetails.expirationMonth
        );
        await page.waitForTimeout(2000);

        await page.waitForSelector(
            creditCardExpirationYearSelector
        );
        await page.select(
            creditCardExpirationYearSelector,
            `20${cardDetails.expirationYear}`
        );
        await page.waitForTimeout(2000);

        await page.type(creditCardCVVSelector, cardDetails.securityCode, {
            delay: 10
        });
        await page.waitForTimeout(2000);

        await page.waitForSelector(orderTermsCheckboxSelector);
        await page.click(orderTermsCheckboxSelector);
        await page.waitForTimeout(5000);

        console.log('Clicking submit order button');
        await page.waitForSelector(submitButtonsSelector);
        await page.click(submitButtonsSelector);
        await page.waitForTimeout(5000);

        const captchaSelector = 'div.g-recaptcha';
        try {
            hasCaptcha = await page.waitForSelector(captchaSelector);
        } catch (err) {
            // no-op if timeout occurs
        }

        if (hasCaptcha) {
            if (autoSolveCaptchas) {
                const solved = await solveCaptcha({
                    taskLogger,
                    page,
                    captchaSelector
                });
                if (solved) hasCaptcha = false;
                await page.evaluate(() => {
                    document.querySelector('iframe[title="recaptcha challenge"]').parentNode.style = 'display:none';
                });
            } else {
                console.log('Detected captcha for manual solving');
                const recipient = notificationEmailAddress;
                const subject = 'Checkout task unsuccessful';
                const text = `The checkout task for ${url} size ${size} has a captcha. Please open the browser and complete it within 5 minutes.`;
                await sendEmail({
                    recipient,
                    subject,
                    text
                });
                taskLogger.info(text);

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

        const confirmationTabSelected = 'div#cart-header div#tabs div.tab.tab-confirmation.selected';
        await page.waitForSelector(confirmationTabSelected);

        checkoutComplete = await page.evaluate(() => {
            const confirmationFailed = document.querySelector('div#confirmation.failed');
            return Boolean(!confirmationFailed);
        });

        return checkoutComplete;
    } catch (err) {
        throw err;
    }
}

async function guestCheckout({
    url,
    size,
    billingAddress,
}) {
    try {
        console.log('Navigating to URL');

        const browser = await puppeteer.launch({
            headless: false,
        })
        const page = await browser.newPage()

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');

        //await useProxy(page, 'http://z869903437:N93cFWlAeMvCx3YO_country-UnitedStates_session-gQWeK1hN@34.194.151.90:31112')


        page.setDefaultNavigationTimeout(0);

        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        });

        let isInCart = false;
        while (!isInCart) {
            console.log('Attempting to add product to cart');
            await page.evaluate((sizeStr) => {
                const form = document.querySelector('div#cctrl form#cart-addf');

                if (sizeStr) {
                    const sElem = form.querySelectorAll('fieldset select#s');
                    sElem.selected = true;
                }

                const atcButtonElem = form.querySelector('fieldset#add-remove-buttons input[type="submit"]');
                atcButtonElem.click();
            }, size);

            await page.waitForTimeout(1 * 1000);

            isInCart = await page.evaluate(() => {
                const atcButtonElem = document.querySelector('fieldset#add-remove-buttons input[type="submit"]');
                return atcButtonElem.getAttribute('value') === 'remove';
            });
        }

        let checkoutComplete = false;
        if (isInCart) {
            await page.waitForTimeout(2 * 1000);

            checkoutComplete = await checkout({
                page,
                billingAddress,
                autoSolveCaptchas,
                url,
                size
            });
        }

        return checkoutComplete;
    } catch (err) {
        throw err;
    }
};


guestCheckout(productInfo)