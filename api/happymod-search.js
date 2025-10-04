const axios = require("axios");
const cheerio = require("cheerio");

async function happymod(query) {
  try {
    const res = await axios.get("https://unduh.happymod.com/search.html?q=" + query);
    const html = res.data;
    const $ = cheerio.load(html);
    const data = [];

    $('article.flex-item').each((index, element) => {
      const appName = $(element).find('h2.has-normal-font-size.no-margin.no-padding.truncate').text().trim();
      const appVersion = $(element).find('div.has-small-font-size.truncate').first().text().trim();
      const appUrl = $(element).find('a.app.clickable').attr('href');

      if (appName && appVersion && appUrl) {
        data.push({
          name: appName,
          version: appVersion,
          url: "https://unduh.happymod.com/" + appUrl
        });
      }
    });

    return {
      status: true,
      data
    }
  } catch (error) {
    return {
      status: false,
      message: "Permintaan tidak dapat diproses"
    }
  }
}

module.exports = {
  name: "Happymod Search",
  desc: "Search apk happymod",
  category: "Search",
  path: "/search/happymod?apikey=&q=",
  async run(req, res) {
    const { apikey, q } = req.query;

    if (!global.apikey.includes(apikey)) {
      return res.json({ status: false, error: 'Apikey invalid' });
    }

    if (!q) {
      return res.json({ status: false, error: 'Query is required' });
    }

    try {
      const results = await happymod(q);
      res.status(200).json({
        status: true,
        result: results.data
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};