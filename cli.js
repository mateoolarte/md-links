#!/usr/bin/env node

const path = process.argv[2];
const options = process.argv.slice(3);
const mdLinks = require("./");

const validate = options.includes("--validate");
const stats = options.includes("--stats");

const resultsWithoutStats = (res) => {
  res.forEach((item) => {
    if (validate) {
      console.log(
        `${item.file} ${item.href} ${item.status} ${item.statusCode} ${item.text}`
      );
    } else {
      console.log(`${item.file} ${item.href} ${item.text}`);
    }
  });
};

const resultsWithStats = (res) => {
  const uniqueLinks = [];

  res.forEach((item) => {
    if (!uniqueLinks.includes(item.href)) {
      const payload = {
        href: item.href,
        statusCode: item.statusCode,
      };

      uniqueLinks.push(payload);
    }
  });

  if (validate) {
    const errorCode = 400;
    const brokenLinks = 0;

    uniqueLinks.forEach((item) => {
      if (item.statusCode === errorCode) {
        brokenLinks++;
      }
    });

    console.log(
      `Total: ${res.length} \nUnique: ${uniqueLinks.length} \nBroken: ${brokenLinks}`
    );
  } else {
    console.log(`Total: ${res.length} \nUnique: ${uniqueLinks.length}`);
  }
};

mdLinks(path, { validate })
  .then((res) => {
    if (!stats) {
      resultsWithoutStats(res);
    }

    if (stats) {
      resultsWithStats(res);
    }
  })
  .catch((err) => {
    console.log(err);
  });
