// ==UserScript==
// @name        Twitter Download
// @namespace   Violentmonkey Scripts
// @match       *://twitter.com/*
// @grant       none
// @version     1.0
// @author      akane
// @description 2023/4/12 16:26:35
// @downloadURL https://github.com/akane/vmscripts/raw/master/src/twitter_download.js
// ==/UserScript==

const css = document.createElement('style');
css.innerHTML = `
.akane-download {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
}`;
document.head.append(css);

function get_one(testid) {
  return document.querySelector(`[data-testid=${testid}]`);
}

function get_all(testid) {
  return document.querySelectorAll(`[data-testid=${testid}]`);
}

async function download(url, name) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function mount() {
  for (const tweet of get_all('tweetPhoto')) {
    if (tweet.querySelector('.akane-download') !== null) {
      continue;
    }
    const img = tweet.querySelector('img[alt=Image]');
    if (img === null) {
      continue;
    }
    const button = document.createElement('button');
    button.innerHTML = 'D';
    button.classList.add('akane-download');
    tweet.appendChild(button);
    const url = new URL(img.src, window.location.href);
    url.searchParams.set('name', 'orig');
    const a = (() => {
      for(let t = tweet; t != null; t = t.parentElement) {
        if (t.tagName === 'A' && t.role === 'link') {
          return t;
        }
      }
    })();
    const [, tweet_id, photo_id] = a.getAttribute('href').match(/^\/.*\/status\/(\d+)\/photo\/(\d+)$/);
    button.addEventListener('click', async (ev) => {
      ev.preventDefault();
      button.innerHTML = 'Downloading...';
      await download(url, `${tweet_id}_${photo_id}.${url.searchParams.get('format')}`);
      button.innerHTML = 'OK!';
    });
  }
}

const mountedList = new WeakSet;

function mountList() {
  const innerDiv = get_one('cellInnerDiv');
  if (innerDiv === null) return;
  if (mountedList.has(innerDiv)) return;
  mountedList.add(innerDiv);
  mount();
  const observer = new MutationObserver(mount);
  observer.observe(get_one('cellInnerDiv').parentElement, {
    childList: true,
  });
}

setInterval(mountList, 1000);
