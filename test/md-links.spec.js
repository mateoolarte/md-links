const mdLinks = require("../");
const simpleMock = require("../mocks/simple.md");
const multipleMock = require("../mocks/multiple.md");

describe("mdLinks", () => {
  it("should return the links with default options", () => {
    const result = [
      {
        href: "https://mateoolarte.com",
        text: "link",
        file: "../mocks/simple.md",
      },
    ];

    return expect(mdLinks(simpleMock)).resolves.toBe(result);
  });

  it("should return the links with status code response", () => {
    const result = [
      {
        href: "https://mateoolarte.com",
        text: "link",
        file: "../mocks/simple.md",
        statusCode: 200,
        status: "ok",
      },
    ];

    return expect(mdLinks(simpleMock, { validate: true })).resolves.toBe(
      result
    );
  });

  it("should return the links with status code response and error message", () => {
    const result = [
      {
        href: "https://mateoolarte.com",
        text: "link",
        file: "../mocks/simple.md",
        statusCode: 400,
        status: "fail",
      },
    ];

    return expect(mdLinks(simpleMock, { validate: true })).resolves.toBe(
      result
    );
  });

  it("should return multiple links", () => {
    const result = [
      {
        href: "https://mateoolarte.com",
        text: "link",
        file: "../mocks/multiple.md",
      },
      {
        href: "https://laboratoria.la",
        text: "link 2",
        file: "../mocks/multiple.md",
      },
      {
        href: "https://google.com",
        text: "link 3",
        file: "../mocks/multiple.md",
      },
    ];

    return expect(mdLinks(multipleMock)).resolves.toBe(result);
  });
});
