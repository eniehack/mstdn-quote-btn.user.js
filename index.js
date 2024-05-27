// SPDX-License-Identifier: MIT
// ==UserScript==
// @name      Add button to copy toot's url
// @name:en      Add button to copy toot's url
// @name:ja      Mastodonに引用ボタンを追加する
// @namespace    http://www.eniehack.net/~eniehack/works/firefox-userscripts
// @version      0.1.4
// @description:en  Add button to copy toot's url for quote toot on Mastodon's deck UI 
// @description:ja  MastodonのDeck UIにtootを引用するためのURLコピーボタンをboostボタンの隣に追加します。
// @author       eniehack
// @license      MIT
// @match        https://fedibird.com/deck/*
// @match        https://best-friends.chat/deck/*
// @match        https://mstdn.jp/deck/*
// @match        https://pawoo.net/deck/*
// @grant        GM.setValue
// @grant        GM.getValue
// @description MastodonのDeck UIにtootを引用するためのURLコピーボタンをboostボタンの隣に追加します。
// @downloadURL https://update.greasyfork.org/scripts/496161/Add%20button%20to%20copy%20toot%27s%20url.user.js
// @updateURL https://update.greasyfork.org/scripts/496161/Add%20button%20to%20copy%20toot%27s%20url.meta.js
// ==/UserScript==
/*jshint esversion: 8 */

const INTERVAL = 1000;

const insertBefore = (newNode, existingNode) => {
    existingNode.parentNode.insertBefore(newNode, existingNode.previousSibling);
};

const createQuoteButtonElement = () => {
  const qtBtn = document.createElement("button");
  qtBtn.setAttribute("class", "status__action-bar__button icon-button quote-icon");
  qtBtn.setAttribute("type", "button");
  qtBtn.setAttribute("style", "font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;");
  qtBtn.setAttribute("aria-label", "quote");
  qtBtn.setAttribute("aria-hidden", "false");
  qtBtn.setAttribute("title","quote");
  qtBtn.setAttribute("tabindex","0");
  const quoteIcon = document.createElement("i");
  quoteIcon.setAttribute("class", "fa fa-quote-left");
  quoteIcon.setAttribute("aria-hidden", "true");
  qtBtn.appendChild(quoteIcon);
  return qtBtn;
};

const fetchPostId = (target) => {
  return target.querySelector("a.status__relative-time").href.match(/\/[0-9]+$/)[0].substring(1);
};

const generateText = async (url) =>  {
  const tmpl = await GM.getValue("template", `{{url}}`);
  return tmpl.replace("{{url}}", url);
};

const copyText = (text) => {
  navigator.clipboard.writeText(text);
};

const insertQuoteButton = (targetArticle) => {
  const target = targetArticle.querySelector(".status__action-bar__button.star-icon.icon-button");
  const qtbtn = createQuoteButtonElement();
  // console.log(targetArticle)
  const postId = fetchPostId(targetArticle);
  const textareaElem = document.querySelector("textarea.autosuggest-textarea__textarea");
  qtbtn.onclick = () => {
    fetch(`https://${location.host}/api/v1/statuses/${postId}`)
      .then(res => res.json())
      .then(json => json.url)
      .then(url => generateText(url))
      .then(txt => copyText(txt));
  };
  insertBefore(qtbtn, target);
};

let timer;

timer = setInterval(() => {
    const articles = document.getElementsByTagName("article");
    for (const article of articles) {
      if (1 <= article.querySelectorAll(".quote-icon").length) continue;
      insertQuoteButton(article);
      // console.log("insertQuoteButton");
    }
  }, INTERVAL);

document.removeEventListener("unload", () => {
  clearInterval(timer);
});
