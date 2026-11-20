const puppeteer = require('puppeteer');

async function verify() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Load default page (PMA selected, All filter)
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });

  const auditText = await page.$eval('#audit-strip', el => el.textContent);
  console.log('Audit strip:', auditText);

  const checklistCount = await page.$$eval('#checklist-pane .trophy-row-wrapper', rows => rows.length);
  console.log('Checklist rows count under All:', checklistCount);

  const detailTitle = await page.$eval('#detail-pane h2', el => el.textContent);
  console.log('Detail title (default PMA):', detailTitle);

  const stepCount = await page.$$eval('#detail-pane .step-item', steps => steps.length);
  console.log('Detail steps count:', stepCount);

  const citationCount = await page.$$eval('#detail-pane .citation-chip', chips => chips.length);
  console.log('Detail citation chips count:', citationCount);

  const sourcesCount = await page.$$eval('#sources-rail li', lis => lis.length);
  console.log('Sources rail sources count:', sourcesCount);

  // Test 2: Load with hash #filter=activities&open=32&seed=2,3,4,5,8,9,15,17,22,30,33
  await page.goto('http://localhost:8080/#filter=activities&open=32&seed=2,3,4,5,8,9,15,17,22,30,33', { waitUntil: 'networkidle0' });

  const selectedTitle = await page.$eval('#detail-pane h2', el => el.textContent);
  console.log('Selected trophy title (#32):', selectedTitle);

  const earnedDisplay = await page.$eval('#earned-count-display', el => el.textContent);
  console.log('Earned display text:', earnedDisplay);

  await browser.close();
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
