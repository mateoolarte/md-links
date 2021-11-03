const fs = require("fs/promises");
const path = require("path");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();
const axios = require("axios");

function parseLinks(file) {
  const linkValidation = "http" || "https";
  return file.filter((result) => result.content.includes(linkValidation));
}

function objLink(item, pathToRead) {
  const link = item.content.match(/\((.*?)\)/)[1];
  const text = item.content.match(/\[(.*?)\]/)[1];
  const baseResult = {
    href: link,
    text: text.substring(0, 50),
    file: pathToRead,
  };

  return baseResult;
}

function getLinksArray(data, pathToRead) {
  return data.map((item) => objLink(item, pathToRead));
}

function validateStatusLink(item) {
  return axios
    .get(item.href)
    .then((res) => {
      return {
        ...item,
        statusCode: res.status,
        status: "ok",
      };
    })
    .catch(() => {
      return {
        ...item,
        statusCode: 400,
        status: "fail",
      };
    });
}

function checkDirectory(pathToRead) {
  return fs.stat(pathToRead).then((res) => res.isDirectory());
}

function readFile(pathToRead, options) {
  return new Promise((resolve, reject) => {
    const fileExt = path.extname(pathToRead);

    if (fileExt !== ".md") {
      reject("It is not a .md file");
    }

    if (fileExt === ".md") {
      fs.readFile(pathToRead, {
        encoding: "utf-8",
      })
        .then((res) => {
          const markdownResult = md.parse(res);
          const links = parseLinks(markdownResult);
          const response = getLinksArray(links, pathToRead);

          if (options.validate) {
            const linksWithStatus = response.map(validateStatusLink);

            return Promise.all(linksWithStatus).then((res) => resolve(res));
          }

          return resolve(response);
        })
        .catch((err) => {
          reject(err.message);
        });
    }
  });
}

function getMdFiles(pathToRead, mdLinks) {
  return fs
    .readdir(pathToRead, {
      encoding: "utf-8",
      withFileTypes: true,
    })
    .then((data) => {
      // read md files
      // save on an array with the routes
      // loop each route and save in the final result
      // pass to resolve function the final result

      data.forEach((item) => {
        const parsedPath = path.join(pathToRead, item.name);

        if (item.isFile() && path.extname(item.name) === ".md") {
          mdLinks.push(parsedPath);
        }

        // if (item.isDirectory()) {
        //   return getMdFiles(parsedPath, mdLinks)
        //     .then((links) => mdLinks.push(...links))
        //     .catch(() => mdLinks);
        // }
      });

      // console.log({ mdLinks });

      return mdLinks;
    })
    .catch((err) => `Something wrong with the directory ${err}`);
}

function readFiles(pathToRead, options) {
  return new Promise((resolve, reject) => {
    getMdFiles(pathToRead, []).then((links) => {
      links.forEach((item) => {
        readFile(item, options)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
      resolve(links);
    });
  });
}

function mdLinks(pathToProcess, options) {
  return new Promise((resolve, reject) => {
    checkDirectory(pathToProcess).then((isDirectory) => {
      if (isDirectory) {
        return readFiles(pathToProcess, options)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      } else {
        return readFile(pathToProcess, options)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      }
    });
  });
}

module.exports = mdLinks;
