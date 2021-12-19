const Generator = require("react-router-sitemap-generator");
const Router = require("./Router"); //import your react router component

const generator = new Generator(
  "https://typechat.world",
  Router({}),
  {
    lastmod: new Date().toISOString().slice(0, 10),
    changefreq: "monthly",
    priority: 0.8,
  }
);
generator.save("public/sitemap.xml");

export {}