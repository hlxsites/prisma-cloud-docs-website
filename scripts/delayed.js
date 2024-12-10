// eslint-disable-next-line import/no-cycle
import { loadCSS, loadScript, sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

async function loadBodyScript(src, attrs) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.text = src;
    if (attrs) {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const attr in attrs) {
        script.setAttribute(attr, attrs[attr]);
      }
    }
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });
}

async function loadAdobeLaunch() {
  const adobedtmSrc = 'https://assets.adobedtm.com/9273d4aedcd2/6eb97addd328/launch-1dd947b3f935.min.js';

  await loadScript(adobedtmSrc, {
    type: 'text/javascript',
    async: true,
  });
}

async function loadGA() {
  const gaId = 'G-9SEQK7FPPQ';
  const gaSrc = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  await loadScript(gaSrc, {
    type: 'text/javascript',
    async: true,
  });
  // eslint-disable-next-line
  window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', gaId);
}

async function loadGetFeedback() {
  // eslint-disable-next-line
  const src = `window.lightningjs||function(n){var e="lightningjs";function t(e,t){var r,i,a,o,d,c;return t&&(t+=(/\\?/.test(t)?"&":"?")+"lv=1"),n[e]||(r=window,i=document,a=e,o=i.location.protocol,d="load",c=0,function(){n[a]=function(){var t=arguments,i=this,o=++c,d=i&&i!=r&&i.id||0;function s(){return s.id=o,n[a].apply(s,arguments)}return(e.s=e.s||[]).push([o,d,t]),s.then=function(n,t,r){var i=e.fh[o]=e.fh[o]||[],a=e.eh[o]=e.eh[o]||[],d=e.ph[o]=e.ph[o]||[];return n&&i.push(n),t&&a.push(t),r&&d.push(r),s},s};var e=n[a]._={};function s(){e.P(d),e.w=1,n[a]("_load")}e.fh={},e.eh={},e.ph={},e.l=t?t.replace(/^\\/\\//,("https:"==o?o:"http:")+"//"):t,e.p={0:+new Date},e.P=function(n){e.p[n]=new Date-e.p[0]},e.w&&s(),r.addEventListener?r.addEventListener(d,s,!1):r.attachEvent("onload",s);var l=function(){function n(){return["<!DOCTYPE ",o,"><",o,"><head></head><",t,"><",r,' src="',e.l,'"></',r,"></",t,"></",o,">"].join("")}var t="body",r="script",o="html",d=i[t];if(!d)return setTimeout(l,100);e.P(1);var c,s=i.createElement("div"),h=s.appendChild(i.createElement("div")),u=i.createElement("iframe");s.style.display="none",d.insertBefore(s,d.firstChild).id="lightningjs-"+a,u.frameBorder="0",u.id="lightningjs-frame-"+a,/MSIE[ ]+6/.test(navigator.userAgent)&&(u.src="javascript:false"),u.allowTransparency="true",h.appendChild(u);try{u.contentWindow.document.open()}catch(n){e.domain=i.domain,c="javascript:var d=document.open();d.domain='"+i.domain+"';",u.src=c+"void(0);"}try{var p=u.contentWindow.document;p.write(n()),p.close()}catch(e){u.src=c+'d.write("'+n().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}e.P(2)};e.l&&l()}()),n[e].lv="1",n[e]}var r=window.lightningjs=t(e);r.require=t,r.modules=n}({});window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/fc9bea86c613.js");`;
  await loadBodyScript(src, {
    type: 'text/javascript',
  });
}

store.emit('delayed:loaded');

loadCSS(`${window.hlx.codeBasePath}/styles/icons.css`);

loadAdobeLaunch();
loadGA();
loadGetFeedback();
