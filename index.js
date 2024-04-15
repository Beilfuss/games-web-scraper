const PORT = 8000;
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

/* URLs:
https://www.metacritic.com/browse/game/
https://www.mobygames.com/game/

https://www.igdb.com/top-100/games
*/

// const url = 'https://www.metacritic.com/browse/game/';

const games = [];

for(let page = 1; page <= 100; page++) {
    const url = `https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=${page}`;
    //const url = 'https://www.mobygames.com/game/sort:moby_score/page:1/';

    async function getUrlPuppeteer() {
        let count = 0;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
        );
        await page.goto(url, { waitUntil: "load" });
        //await page.waitForSelector(".table");
        const html = await page.content();
        await browser.close();
        const $ = cheerio.load(html);
        $('.c-finderProductCard', html).each(function () {
            const title = $(this).find('.c-finderProductCard_titleHeading span:nth-child(2)').text();
            const img = $(this).find('.c-finderProductCard_img img').attr('src');
            const score = $(this).find('.c-siteReviewScore span').text();
            const year = ($(this).find('.c-finderProductCard_meta .u-text-uppercase').text()).trim().slice(-4);
            games.push({
                title,
                img,
                score,
                year,
                url
            });
        });
        console.log(games);
        console.log(games.length);
        }
    getUrlPuppeteer();
}

console.log(games);
console.log(games.length);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Puppeteer

/*
async function getUrlPuppeteer() {
    let count = 0;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "load" });
    await page.waitForSelector(".table");
    const html = await page.content();
    await browser.close();
    const $ = cheerio.load(html);
    await $("tr", html).each(function () {
      count++;
      const name = $(this).text();
      console.log(name);
      // teste.push({
      //     name
      // })
    });
    console.log(count);
  }
*/