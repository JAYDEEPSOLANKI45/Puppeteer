const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = "./followers.json";
const cookiesPath = "./cookies.json"; // <-- File to store session cookies

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  // Try to load cookies if available
  try {
    const cookiesString = await fs.readFile(cookiesPath);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    console.log("🍪 Loaded session cookies!");
  } catch (err) {
    console.log("⚠️ No cookies found, you’ll need to log in manually once.");
  }

  await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });

  // Check if still logged in (look for profile icon instead of login form)
  const loggedIn = await page.evaluate(() => {
    return !!document.querySelector('svg[aria-label="Home"]'); // home icon shows when logged in
  });

  if (!loggedIn) {
    console.log("🔐 Please log in manually...");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });

    // Save cookies after login
    const cookies = await page.cookies();
    await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log("✅ Session cookies saved. Next time, no need to log in!");
  } else {
    console.log("✅ Already logged in using saved session!");
  }

  const username = "deepinyoheart"; // CHANGE this to your profile
  await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "networkidle2" });

  // Wait for followers count
  await page.waitForSelector("ul li a span");

  // Extract follower count
  const followerCount = await page.evaluate(() => {
    const followersLink = Array.from(document.querySelectorAll("ul li a"))
      .find(el => el.href.includes("/followers"));
    if (!followersLink) return 0;
    const text = followersLink.textContent.replace(/,/g, "").replace(/k/i, "000").replace(/m/i, "000000");
    return parseInt(text, 10);
  });

  console.log(`👥 Follower count: ${followerCount}`);

  // Ask user to click manually
  console.log("📌 Please click on the Followers count manually to open the modal...");
  await page.waitForSelector('div[role="dialog"] div[class*="x6nl9eh"]', { timeout: 0 });
  console.log("✅ Modal is open and detected!");

  // Scroll logic
  const scrollSelector = 'div[role="dialog"] div[class*="x6nl9eh"]';
  const scrollTimes = Math.ceil(followerCount / 10);

  console.log(`🔄 Scrolling ${scrollTimes} times to load all followers...`);

  for (let i = 0; i < scrollTimes + 5; i++) {
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) el.scrollTop = el.scrollHeight;
    }, scrollSelector);

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("✅ Finished scrolling. Collecting usernames...");

  // Extract usernames
  const usernames = await page.evaluate(() => {
    const items = document.querySelectorAll('div[role="dialog"] a[href^="/"][role="link"]');
    return Array.from(items)
      .map(el => el.textContent.trim())
      .filter(name => name.length > 0 && !name.includes("Remove"));
  });

  console.log("🎉 Total followers collected:", usernames.length);

  // Load old followers
  let oldFollowers = [];
  try {
    const data = await fs.readFile(path, "utf-8");
    oldFollowers = JSON.parse(data);
  } catch (e) {
    console.log("No old followers data found, starting fresh.");
  }

  // Find differences
  const newFollowers = usernames.filter(x => !oldFollowers.includes(x));
  const lostFollowers = oldFollowers.filter(x => !usernames.includes(x));

  console.log(`➕ New followers since last run (${newFollowers.length}):`, newFollowers);
  console.log(`➖ Unfollowed since last run (${lostFollowers.length}):`, lostFollowers);

  // Save current list for next time
  await fs.writeFile(path, JSON.stringify(usernames, null, 2), "utf-8");

  // await browser.close();
})();
