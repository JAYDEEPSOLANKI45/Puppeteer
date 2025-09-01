# Instagram Automation with Puppeteer

This project uses [Puppeteer](https://pptr.dev/) to automate interactions with Instagram, such as logging in, navigating to profiles, and saving followers to a JSON file.

---

## 🚀 Features
- Automated Instagram login
- Session persistence with cookies (no need to log in every run)
- Fetch followers and store them in `followers.json`
- Browser automation with headless/non-headless modes

---

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/instagram-puppeteer.git
   cd instagram-puppeteer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## ⚙️ Usage

Run the script:
```bash
node app.js
```

The script will:
- Open Instagram in a browser
- Log in (using stored cookies if available)
- Scrape followers
- Save results into `followers.json`

---

## 📂 Project Structure
```
├── app.js          # Main Puppeteer script
├── followers.json  # Saved Instagram followers
├── cookies.json    # Session cookies
├── package.json    # Node.js dependencies
└── README.md       # Project documentation
```

---


## 🤖 About This Project

This automation project was developed using a low-code approach, using the power of AI assistance from ChatGPT. Thank you.
