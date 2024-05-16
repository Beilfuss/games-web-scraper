const PORT = 3000;
const cheerio = require("cheerio");
const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");

const gamesData = require("./data.json");

const app = express();

app.use(express.static("src"));

/* URLs:
https://www.metacritic.com/browse/game/
https://www.mobygames.com/game/
*/

const gamesMap = new Map();

function getRandomInt(max, min) {
  return Math.floor(Math.random() * max);
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

  const stopMoby =
    $('b:contains("Sorry, guest/bot limit reached.")').length > 0;

  return { tempGames, stopMoby };
}

app.get("/scrape", async (req, res) => {
  try {
    let stopMeta = false;
    let stopMoby = false;
    let page = 1;

    while (!stopMeta || !stopMoby) {
      if (!stopMeta) {
        tempGames = await scrapeMeta(page);

        tempGames.forEach((item) => {
          const titulo = item.title;
          if (gamesMap.has(titulo)) {
            const dadosCombinados = gamesMap.get(titulo);
            const scoreMeta = item.scoreMeta;
            const complementaryUrl = item.url;
            gamesMap.set(titulo, {
              ...dadosCombinados,
              scoreMeta,
              complementaryUrl,
            });
          } else {
            gamesMap.set(titulo, { ...item });
          }
        });

        if (tempGames.length < 24) {
          stopMeta = true;
          console.log("Condição de parada para o Metacritic atingida!");
        } else {
          time = getRandomInt(10000);

          console.log(
            "esperando " + time / 1000 + " segundos para a próxima requisição"
          );

          await new Promise((r) => setTimeout(r, time));
        }
      }

      if (!stopMoby) {
        data = await scrapeMoby(page);

        stopMoby = data.stopMoby;

        data.tempGames.forEach((item) => {
          const titulo = item.title;
          if (gamesMap.has(titulo)) {
            const dadosCombinados = gamesMap.get(titulo);
            const scoreMoby = item.scoreMoby;
            const company = item.company;
            const complementaryUrl = item.url;
            gamesMap.set(titulo, {
              ...dadosCombinados,
              scoreMoby,
              company,
              complementaryUrl,
            });
          } else {
            gamesMap.set(titulo, { ...item });
          }
        });

        if (stopMoby) {
          // Sorry, guest/bot limit reached. Please login (register) to increase the limit (or unlimited with MobyPro!)
          console.log("Condição de parada para o Mobygames atingida!");
        } else {
          time = getRandomInt(10000);

          console.log(
            "esperando" + time / 1000 + "segundos para a próxima requisição"
          );

          await new Promise((r) => setTimeout(r, time));
        }
      }
      page++;
    }

    games = Array.from(gamesMap.values());

    const jsonContent = JSON.stringify(games, null, 2);

    const arquivo = "./data.json";

    fs.writeFile(arquivo, jsonContent, "utf8", (err) => {
      if (err) {
        console.error("Ocorreu um erro ao gravar o arquivo JSON:", err);
        return;
      }
      console.log("O arquivo JSON foi criado e gravado com sucesso.");
    });

    res.json(games); // Retorna os dados em formato JSON
  } catch (error) {
    console.error("Erro ao raspar os dados:", error);
    res.status(500).send("Erro ao raspar os dados");
  }
});

app.get("/update-data/:page", (req, res) => {
  const { page } = req.params;
  start = (parseInt(page) - 1) * 25;
  res.json(gamesData.slice(start, start + 25));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
