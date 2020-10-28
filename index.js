const puppeteer = require("puppeteer");
const fs = require("fs");

async function run(config) {
  let dataToWrite = 'keyword, url,';

  let data = fs.readFileSync(config.inputFile).toString('utf8');
  let dataArray = data.split('\n');

  for (let k = 1; k < dataArray.length; k++) {
    if (dataArray[k] === '') {
      continue;
    }
    let keyword = dataArray[k].replace(',', '');
    console.log('Keyword being searched: ', keyword);
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();

    await page.goto("https://www.google.co.in/");
    await page.click('[name="q"]');
    await page.keyboard.type(keyword);
    await page.keyboard.down("Enter");
    await page.waitFor(2000);

    dataToWrite += keyword + ', ';

    let resultsLength = await page.evaluate($el => {
      return document.querySelector($el).childNodes.length;
    }, "#search > div > div > div > div > div");

    for (let i = 1; i <= resultsLength; i++) {
      let heading =
        "#search > div > div > div > div > div > div:nth-of-type(" + i + ") > div > div > div > a";
      let href = await page.evaluate($el => {
        return document.querySelector($el).href;
      }, heading);

      dataToWrite += i + '. ' + href + '\n';
    }
    dataToWrite += ',';
    console.log(dataToWrite);
  }

  fs.writeFile(config.outputFile, dataToWrite, 'utf8', (err) => {
    if (err) {
      console.log('Some error occurred, contact Gaurav Nanda');
    } else {
      console.log('It went well');
    }
  });
}

run({
  inputFile: 'input.csv',
  outputFile: 'output.csv'
});
