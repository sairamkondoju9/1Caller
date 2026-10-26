import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/saira/.gemini/antigravity/brain/678211d2-0414-4411-b73c-879fbac0e848';

async function verify() {
  console.log('Launching browser to verify industry synchronization on production...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('Navigating to production...');
    await page.goto('https://sarvam-eta-rose.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Click "Start free" to reach the Dashboard
    console.log('Clicking Start free to reach dashboard...');
    const buttons = await page.$$('button');
    let startBtn = null;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.includes('Start free')) {
        startBtn = b;
        break;
      }
    }
    if (startBtn) {
      await startBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }

    // Verify Dashboard Industry Selector & Prompts
    console.log('Capturing Dashboard industry templates...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_industry_dashboard.png'), fullPage: false });

    // Click "Hospital & clinic"
    console.log('Clicking Hospital & clinic industry pill...');
    const indButtons = await page.$$('button');
    let clinicBtn = null;
    for (const b of indButtons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.includes('Hospital & clinic')) {
        clinicBtn = b;
        break;
      }
    }
    if (clinicBtn) {
      await clinicBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }

    // Check prompt text in textarea
    const promptValue = await page.$eval('textarea', el => el.value);
    console.log('Textarea value after clicking Hospital & clinic:');
    console.log(promptValue);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_clinic_selected.png'), fullPage: false });

    // Click "Build AI Employee"
    console.log('Clicking Build AI Employee...');
    const buildButtons = await page.$$('button');
    for (const b of buildButtons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && (text.includes('Build AI Employee') || text.includes('Plan Call'))) {
        await b.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 2000));
    console.log('Capturing Quick Details Q1...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_clinic_q1.png'), fullPage: false });

    // Step through Q1 -> Q2
    console.log('Advancing to Q2...');
    const nextBtn1 = await page.$('button[type="button"]');
    // find Next button
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.trim() === 'Next') {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // Q2 -> Q3 (Categories)
    console.log('Advancing to Q3...');
    const allBtns2 = await page.$$('button');
    for (const b of allBtns2) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.trim() === 'Next') {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));
    console.log('Capturing Q3 categories for Clinic...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_clinic_q3_categories.png'), fullPage: false });

    // Q3 -> Q4 (Next Action)
    console.log('Advancing to Q4...');
    const allBtns3 = await page.$$('button');
    for (const b of allBtns3) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && (text.trim() === 'Next' || text.includes('Next: Plan Call'))) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));
    console.log('Capturing Q4 next action for Clinic...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_clinic_q4_next_action.png'), fullPage: false });

    // Finish to Studio / Script
    console.log('Clicking Plan Call to open Call Script tab...');
    const allBtns4 = await page.$$('button');
    for (const b of allBtns4) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && (text.includes('Plan Call') || text.includes('Open Call Script'))) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    console.log('Capturing final Call Script in Studio...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_clinic_call_script_verified.png'), fullPage: false });

    console.log('All verification screenshots saved successfully!');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
  }
}

verify();
