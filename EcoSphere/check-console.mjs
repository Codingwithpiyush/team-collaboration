import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 5000 });
    console.log('Page loaded successfully. Checking for root element...');
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    if (!rootHtml) {
      console.log('Root element is empty!');
    } else {
      console.log('Root element has content. Length:', rootHtml.length);
    }
  } catch (e) {
    console.log('Navigation failed:', e.message);
  }

  await browser.close();
})();
