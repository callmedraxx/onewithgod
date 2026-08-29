import { chromium } from "playwright";
const [out,w=1440,h=900] = process.argv.slice(2);
const b = await chromium.launch({ args:["--no-sandbox"] });
const p = await b.newPage({ viewport:{width:+w,height:+h}, isMobile:+w<500, hasTouch:+w<500 });
const got=[]; p.on("request", r=>{const f=r.url().split("/").pop(); if(/\.mp4$/.test(f)) got.push(f);});
await p.goto("https://onewithgod.vercel.app/",{waitUntil:"domcontentloaded"}).catch(()=>{});
await p.waitForTimeout(9000);
const st = await p.$eval("video", v=>({src:(v.currentSrc||"").split("/").pop(), paused:v.paused,
  t:+v.currentTime.toFixed(1), vw:v.videoWidth, vh:v.videoHeight,
  box:[Math.round(v.getBoundingClientRect().width),Math.round(v.getBoundingClientRect().height)]})).catch(e=>({err:String(e).slice(0,60)}));
console.log(`[${w}px] encode=${got.join(",")||"none"} state=${JSON.stringify(st)}`);
await p.screenshot({ path: out });
console.log("shot:", out); await b.close();
