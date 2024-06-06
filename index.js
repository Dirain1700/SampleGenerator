window.onerror=(message,file,lineNo,colNo)=>{if(message!=="Script error.")alert("Please report this to developer:\n"+[message,file,lineNo,colNo].join("\n"));},/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/js/index.js":
/*!**************************!*\
  !*** ./dist/js/index.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var import_tools = __webpack_require__(/*! ./tools */ "./dist/js/tools.js");
import_tools.Tools.setLinksToInputFromCookies();
import_tools.Tools.setOnTextInput();
import_tools.Tools.setOnGenerateButtonClick();
//# sourceMappingURL=index.js.map


/***/ }),

/***/ "./dist/js/tools.js":
/*!**************************!*\
  !*** ./dist/js/tools.js ***!
  \**************************/
/***/ ((module) => {


var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var tools_exports = {};
__export(tools_exports, {
  Tools: () => Tools
});
module.exports = __toCommonJS(tools_exports);
class Tools {
  static cookieName = "pokepastlinks";
  static cookieExpireTime = 7 * 24 * 60 * 60 * 1e3;
  // 7 days
  static inputTextAreaId = "linksInput";
  static generateButtonId = "generateHTML";
  static generatedCodeStyleId = "htmlStyle";
  static outputTextAreaId = "htmlCode";
  static linkRegex = /(https:\/\/)?pokepast\.es\/[a-zA-Z0-9]{16}/gm;
  static storeLinksToCookies(links) {
    const cookieExpireDate = new Date(Date.now() + Tools.cookieExpireTime);
    const cookieValue = `${Tools.cookieName}=${encodeURIComponent(links)}; expires=${cookieExpireDate.toUTCString()}; path=/`;
    document.cookie = cookieValue;
  }
  static getLinksFromCookies() {
    if (document.cookie === "") {
      return "";
    }
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      if (cookie.startsWith(Tools.cookieName)) {
        return decodeURIComponent(cookie.split("=")[1]);
      }
    }
    return "";
  }
  static clearCookies() {
    document.cookie = `${Tools.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
  static setLinksToInputFromCookies() {
    const links = Tools.getLinksFromCookies();
    if (links !== "") {
      const inputTextArea = document.getElementById(Tools.inputTextAreaId);
      if (!inputTextArea) throw new Error("Input text area not found");
      inputTextArea.value = links;
    }
  }
  static setOnTextInput() {
    const inputTextArea = document.getElementById(Tools.inputTextAreaId);
    if (!inputTextArea) throw new Error("Input text area not found");
    inputTextArea.addEventListener("input", () => Tools.onTextInput());
  }
  static onTextInput() {
    const inputTextArea = document.getElementById(Tools.inputTextAreaId);
    if (!inputTextArea) throw new Error("Input text area not found");
    Tools.storeLinksToCookies(inputTextArea.value);
  }
  static copyHTMLToClipboard() {
    const outputTextArea = document.getElementById(Tools.outputTextAreaId);
    if (!outputTextArea) throw new Error("Output text area not found");
    outputTextArea.focus();
    void navigator.clipboard.writeText(outputTextArea.value);
  }
  static fetchTeam(link) {
    return fetch(link + "/json", {
      headers: {
        accept: "*/*",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"'
      },
      referrer: "127.0.0.1",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit"
    }).then((response) => response.json()).then((team) => {
      const pokemons = team.paste.split("\n").filter((l) => l.includes("@")).map((l) => l.split("@")[0].split("(")[0].trim());
      return { pokemons, author: team.author, title: team.title, link };
    });
  }
  static isPokepastLink(link) {
    return Tools.linkRegex.test(link);
  }
  static onGenerateButtonClick() {
    const inputTextArea = document.getElementById(Tools.inputTextAreaId);
    const outputTextArea = document.getElementById(Tools.outputTextAreaId);
    if (!inputTextArea || !outputTextArea) throw new Error("Input text area not found");
    const links = (inputTextArea.value?.split("\n") ?? []).map((l) => l.trim());
    const style = document.getElementById(Tools.generatedCodeStyleId);
    if (!style) throw new Error("Please select a style");
    Promise.all(links.map((l) => Tools.fetchTeam(l))).then((teams) => {
      const code = Tools.generateHTMLCode(teams.filter((t) => t !== null), style.value);
      outputTextArea.value = code;
      Tools.copyHTMLToClipboard();
    }).catch((e) => console.error(e));
  }
  static setOnGenerateButtonClick() {
    const generateButton = document.getElementById(Tools.generateButtonId);
    if (!generateButton) throw new Error("Generate button not found");
    generateButton.addEventListener("click", () => {
      Tools.onGenerateButtonClick();
    });
  }
  static generateHTMLCode(teams, style) {
    switch (style) {
      case "ou": {
        return Tools.generateOUStyle(teams);
      }
      case "uu": {
        return Tools.generateUUStyle(teams);
      }
      case "uber": {
        return Tools.generateOldUberStyle(teams);
      }
      default: {
        throw style;
      }
    }
  }
  static generateOUStyle(teams) {
    let code = "";
    for (const team of teams) {
      const last = team.pokemons[team.pokemons.length - 1];
      for (const pokemon of team.pokemons) {
        code += '<a href="//dex.pokemonshowdown.com/pokemon/' + pokemon + '" target="_blank" rel="noopener"><psicon pokemon="' + pokemon + '"></a>';
        if (pokemon !== last) code += "|";
        else
          code += '- <b><a href="' + team.link + '" target="_blank" rel="noopener">' + team.title + " by " + team.author + "</a></b>";
      }
    }
    return code;
  }
  static generateUUStyle(teams) {
    let code = "";
    const limit = teams.length - 1;
    const i = 0;
    for (const team of teams) {
      code += team.title + " by " + team.author + '<br><a href="' + team.link + '" target="_blank" rel="noopener">' + team.link + "</a>";
      if (i !== limit) code += "<br>";
    }
    return code;
  }
  static generateOldUberStyle(teams) {
    let code = '<ul style="list-style-type: none">';
    for (const team of teams) {
      code += '<li style="margin-bottom: 5px">';
      code += "<i>" + team.title + " by <b>" + team.author + '</b></i><br><a href="' + team.link + '" style="text-decoration: none" target="_blank" rel="noopener">';
      for (const pokemon of team.pokemons) {
        code += '<psicon pokemon="' + pokemon + '">';
      }
      code += "</a></li>";
    }
    code += "</ul>";
    return code;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (0);
//# sourceMappingURL=tools.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("./dist/js/tools.js");
/******/ 	var __webpack_exports__ = __webpack_require__("./dist/js/index.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map