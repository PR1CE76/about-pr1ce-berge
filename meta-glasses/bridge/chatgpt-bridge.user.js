// ==UserScript==
// @name         Glasses Ask: ChatGPT auto bridge
// @namespace    pricefamilydealerships.glasses-ask
// @version      0.1.0
// @description  Optional. Watches the Glasses Ask relay for questions from Meta Ray-Ban Display glasses, types them into the open chatgpt.com tab, and relays the finished reply back to the lens. Uses the free ChatGPT web page you are already logged into, no API key.
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
/*
  Set PAIR_CODE to the code shown on the glasses under "Pair with phone". Keep one chatgpt.com tab open.

  This drives the ChatGPT web page in your own browser. It depends on page markup that OpenAI can change
  without notice. If it stops working, open DevTools, inspect the composer and the send button, and update
  SEL below. Automating the site may conflict with OpenAI's Terms of Use. The manual flow in bridge/index.html
  needs nothing like this. Use at your own discretion.
*/
(function () {
  'use strict';
  var PAIR_CODE = 'pfd-CHANGE-ME';
  var RELAY = 'https://ntfy.sh/';
  var SEL = {                                    /* selectors last checked against community userscripts, Oct 2026 */
    composer: '#prompt-textarea, div[contenteditable="true"][id="prompt-textarea"], textarea',
    send: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
    stop: 'button[data-testid="stop-button"], button[aria-label="Stop streaming"]',
    assistant: '[data-message-author-role="assistant"]'
  };
  var POLL_MS = 3000, SETTLE_MS = 2500, MAX_WAIT_MS = 180000;
  var K = { last: 'gab.us.lastId', busy: 'gab.us.busy' };
  var lastId = localStorage.getItem(K.last) || null, busy = false;

  function publish(topic, obj) { return fetch(RELAY + topic, { method: 'POST', body: JSON.stringify(obj), headers: { 'Content-Type': 'text/plain' } }); }
  function badge(t) { var b = document.getElementById('ga-badge'); if (!b) { b = document.createElement('div'); b.id = 'ga-badge';
      b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99999;background:#001d3d;color:#ffc300;font:600 12px -apple-system,Segoe UI,Roboto,sans-serif;padding:6px 10px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.45);max-width:40vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      document.body.appendChild(b); } b.textContent = 'Glasses Ask: ' + t; }

  function poll() {
    if (busy || PAIR_CODE.indexOf('CHANGE') >= 0) { if (PAIR_CODE.indexOf('CHANGE') >= 0) badge('set PAIR_CODE in the script'); return; }
    fetch(RELAY + PAIR_CODE + '-ask/json?poll=1&since=' + encodeURIComponent(lastId || '5m'))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        badge('listening · ' + PAIR_CODE);
        var lines = txt.split('\n').filter(Boolean), next = null;
        lines.forEach(function (l) { var m; try { m = JSON.parse(l); } catch (e) { return; } if (m.event !== 'message') return;
          lastId = m.id; localStorage.setItem(K.last, lastId);
          var b; try { b = JSON.parse(m.message); } catch (e) { b = { t: 'ask', id: m.id, q: m.message }; }
          if (b.t === 'ask' && !next) next = b; });
        if (next) ask(next);
      })
      .catch(function (e) { badge('relay error ' + (e.message || e)); });
  }

  function setComposer(text) {
    var el = document.querySelector(SEL.composer); if (!el) return false;
    el.focus();
    if (el.tagName === 'TEXTAREA') { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); return true; }
    /* contenteditable (ProseMirror): select all, then insert as typed text so the editor sees it */
    var sel = window.getSelection(), range = document.createRange(); range.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(range);
    var ok = document.execCommand && document.execCommand('insertText', false, text);
    if (!ok) { el.textContent = text; el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })); }
    return true;
  }
  function lastAssistantText() { var n = document.querySelectorAll(SEL.assistant); return n.length ? n[n.length - 1].innerText.trim() : ''; }

  function ask(msg) {
    busy = true; badge('asking: ' + msg.q);
    var before = document.querySelectorAll(SEL.assistant).length;
    if (!setComposer(msg.q)) { busy = false; badge('composer not found, update SEL'); return; }
    setTimeout(function () {
      var btn = document.querySelector(SEL.send);
      if (btn && !btn.disabled) btn.click();
      else { var el = document.querySelector(SEL.composer); el && el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })); }
      var start = Date.now(), lastText = '', stableSince = 0;
      var t = setInterval(function () {
        var count = document.querySelectorAll(SEL.assistant).length, streaming = !!document.querySelector(SEL.stop), text = lastAssistantText();
        if (count > before && !streaming && text) {
          if (text === lastText) { if (!stableSince) stableSince = Date.now(); }
          else { lastText = text; stableSince = 0; }
          if (stableSince && Date.now() - stableSince > SETTLE_MS) { clearInterval(t); deliver(msg, text); }
        }
        if (Date.now() - start > MAX_WAIT_MS) { clearInterval(t); deliver(msg, text || 'ChatGPT did not answer in time.'); }
      }, 800);
    }, 400);
  }
  function deliver(msg, text) {
    publish(PAIR_CODE + '-ans', { t: 'ans', id: msg.id, q: msg.q, a: text, ts: Date.now() })
      .then(function () { badge('sent answer to glasses'); }).catch(function (e) { badge('send failed ' + (e.message || e)); })
      .then(function () { busy = false; });
  }
  setInterval(poll, POLL_MS); poll();
})();
