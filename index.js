const PORT = 3000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.use(express.static("src"));

/* URLs:
https://www.metacritic.com/browse/game/
https://www.mobygames.com/game/
https://www.igdb.com/top-100/games
*/

let mock = [
  {
    title: "The Legend of Zelda: Ocarina of Time",
    img: "https://www.metacritic.com/a/img/resize/32e0a7f3e8a36d4a12553d053b4f429a2cc1f3c3/catalog/provider/6/3/6-1-4763-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "99",
    year: "1998",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "SoulCalibur",
    img: "https://www.metacritic.com/a/img/resize/0a5ee80dcd6deb31c8c7b629832bf034a952726f/catalog/provider/6/3/6-1-7379-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "98",
    year: "1999",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Grand Theft Auto IV",
    img: "https://www.metacritic.com/a/img/resize/ea221e31706ec302498c1225e48320b2c0cba46d/catalog/provider/6/12/6-1-76228-52.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "98",
    year: "2008",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Super Mario Galaxy",
    img: "https://www.metacritic.com/a/img/resize/866a8bcfd788728cc388cd8c71f3bc8a95a6173c/catalog/provider/6/3/6-1-55597-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2007",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Super Mario Galaxy 2",
    img: "https://www.metacritic.com/a/img/resize/d4ed30759bfa322a4789fa30a145f959b16f43f4/catalog/provider/6/3/6-1-595362-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2010",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "The Legend of Zelda: Breath of the Wild",
    img: "https://www.metacritic.com/a/img/resize/a3c18f5187e5f339d883f5dcb50565a8e4712c94/catalog/provider/6/3/6-1-844837-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2017",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Tony Hawk's Pro Skater 3",
    img: "https://www.metacritic.com/a/img/resize/0ae2d0752c47efb0bb7373937971c08eaccaf804/catalog/provider/6/3/6-1-13655-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2001",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Red Dead Redemption 2",
    img: "https://www.metacritic.com/a/img/resize/2fcfbd91ba65955fe3e0e3b69cf51ff0e14fb065/catalog/provider/6/3/6-1-674478-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2018",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Grand Theft Auto V",
    img: "https://www.metacritic.com/a/img/resize/809b197db2a89301cfe50f357663da63fca23201/catalog/provider/6/3/6-1-675075-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2014",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Metroid Prime",
    img: "https://www.metacritic.com/a/img/resize/317ab506b3c84cb3a8d92b67a2b0fca51d1f9330/catalog/provider/6/3/6-1-12131-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2002",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Grand Theft Auto III",
    img: "https://www.metacritic.com/a/img/resize/9a06027973cde69d87b6cdb57420a93b53ffb96d/catalog/provider/6/3/6-1-12649-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2001",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Super Mario Odyssey",
    img: "https://www.metacritic.com/a/img/resize/b2f0e2cfd46ea9e27b89fd2fb717936b100c1b63/catalog/provider/6/3/6-1-856470-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2017",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Halo: Combat Evolved",
    img: "https://www.metacritic.com/a/img/resize/eb4e91aa2482caafca7f3a381f6a6e10373cede2/catalog/provider/6/12/6-1-10563-52.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2001",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "NFL 2K1",
    img: "https://www.metacritic.com/a/img/resize/294c3a51749c972c6273ef4a9ec58199860fda43/catalog/provider/6/3/6-1-9973-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "97",
    year: "2000",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Half-Life 2",
    img: "https://www.metacritic.com/a/img/resize/84071b43988b1af408979e3de4d8a5117363323f/catalog/provider/6/3/6-1-43965-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2004",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "BioShock",
    img: "https://www.metacritic.com/a/img/resize/681da8e3b5ba1c2dd889e5664bbe31cc484773f9/catalog/provider/6/12/6-1-63862-52.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2007",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "GoldenEye 007",
    img: "https://www.metacritic.com/a/img/resize/37c852b0e4a0458a65925c177338c260e34bdd3a/catalog/provider/6/3/6-1-3971-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "1997",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Uncharted 2: Among Thieves",
    img: "https://www.metacritic.com/a/img/resize/81922687ae52fcfb836a1c8108ebbc6dee2592e5/catalog/provider/6/3/6-1-106607-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2009",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Resident Evil 4 (2005)",
    img: "https://www.metacritic.com/a/img/resize/192109673b813f4dbcb2a67b7b2ccc5e42f04701/catalog/provider/6/3/6-1-15522-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2005",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Baldur's Gate 3",
    img: "https://www.metacritic.com/a/img/resize/2ef698de417fa86c137b8d7565f64ae0045b3ec4/catalog/provider/7/2/7-1695438055.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2023",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "The Orange Box",
    img: "https://www.metacritic.com/a/img/resize/1bcde73ee5effade7fcd4999994916af33c3abc1/catalog/provider/6/12/6-1-78321-52.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2007",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Tekken 3",
    img: "https://www.metacritic.com/a/img/resize/9a17c61e5810a8c7cf838309ef6380f0c16b7ad0/catalog/provider/6/3/6-1-7967-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "1998",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "Mass Effect 2",
    img: "https://www.metacritic.com/a/img/resize/5f2b8669e57122fea17b44d965d9889bc1247b24/catalog/provider/6/12/6-1-657262-52.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2010",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
  {
    title: "The House in Fata Morgana - Dreams of the Revenants Edition -",
    img: "https://www.metacritic.com/a/img/resize/078211ba68eca6101ac85e2fe6ca73ba0744e078/catalog/provider/6/3/6-1-737912-13.jpg?auto=webp&fit=cover&height=132&width=88",
    scoreMeta: "96",
    year: "2021",
    url: "https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=1",
  },
];

const gamesMap = new Map();

// Adicionar dados da primeira lista ao mapa
mock.forEach((item) => {
  gamesMap.set(item.title, { ...item });
});

let games = Array.from(gamesMap.values());

for (let page = 1; page <= 100; page++) {
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
    $(".c-finderProductCard", html).each(function () {
      const title = $(this)
        .find(".c-finderProductCard_titleHeading span:nth-child(2)")
        .text();
      const img = $(this).find(".c-finderProductCard_img img").attr("src");
      const score = $(this).find(".c-siteReviewScore span").text();
      const year = $(this)
        .find(".c-finderProductCard_meta .u-text-uppercase")
        .text()
        .trim()
        .slice(-4);
      games.push({
        title,
        img,
        score,
        year,
        url,
      });
    });
    console.log(games);
    console.log(games.length);
  }
  //getUrlPuppeteer();
}

async function scrapeMeta(pageCount) {
  const url = `https://www.metacritic.com/browse/game/?releaseYearMin=1958&releaseYearMax=2024&page=${pageCount}`;
  console.log(url);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
  );
  await page.goto(url, { waitUntil: "load" });

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  let tempGames = [];

  $(".c-finderProductCard", html).each(function () {
    const title = $(this)
      .find(".c-finderProductCard_titleHeading span:nth-child(2)")
      .text();
    const img = $(this).find(".c-finderProductCard_img img").attr("src");
    const scoreMeta = $(this).find(".c-siteReviewScore span").text();
    const year = $(this)
      .find(".c-finderProductCard_meta .u-text-uppercase")
      .text()
      .trim()
      .slice(-4);
    tempGames.push({
      title,
      img,
      scoreMeta,
      year,
      url,
    });
  });

  console.log(tempGames);
  console.log(tempGames.length);
  return tempGames;
}

async function scrapeMoby(pageCount) {
  const url = `https://www.mobygames.com/game/sort:moby_score/page:${pageCount}/`;
  console.log(url);

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
  let tempGames = [];
  $("tr").each((index, element) => {
    const $tds = $(element).find("td");
    const img = $tds.eq(0).find("img").attr("src");
    const title = $tds.eq(0).find("a:last-of-type").text();
    const scoreMoby = $tds.eq(1).find(".mobyscore").text();
    const year = $tds.eq(2).text();
    const company = $tds.eq(3).text();

    tempGames.push({ img, title, scoreMoby, year, company, url });
  });

  console.log(tempGames);
  console.log(tempGames.length);
  return tempGames;
}

app.get("/scrape/:site/:pageCount", async (req, res) => {
  try {
    const { site, pageCount } = req.params;
    if (site == "meta") {
      tempGames = await scrapeMeta(pageCount);
    } else {
      tempGames = await scrapeMoby(pageCount);
    }

    tempGames.forEach((item) => {
      const titulo = item.title;
      if (gamesMap.has(titulo)) {
        const dadosCombinados = gamesMap.get(titulo);
        gamesMap.set(titulo, { ...dadosCombinados, ...item });
      } else {
        gamesMap.set(titulo, { ...item });
      }
    });

    games = Array.from(gamesMap.values());

    res.json(games); // Retorna os dados em formato JSON
  } catch (error) {
    console.error("Erro ao raspar os dados:", error);
    res.status(500).send("Erro ao raspar os dados");
  }
});

app.get("/update-data", (req, res) => {
  res.json(games);
});

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
