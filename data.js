/* ============================================================
   TideOS — Content data
   ============================================================ */
window.TIDE_DATA = {

  /* ---- Sliding tiles (weather + tide carousel) ---- */
  weather: {
    city: "Lusaka",
    forecast: [
      { d: "MON", t: "27°", ic: "sun" },
      { d: "TUE", t: "25°", ic: "cloud" },
      { d: "WED", t: "23°", ic: "rain" },
      { d: "THU", t: "26°", ic: "sun" },
      { d: "FRI", t: "28°", ic: "sun" }
    ]
  },

  /* ---- Photo slideshow (full-bleed images + overlay captions) ---- */
  photos: [
    { img: "assets/zicta/z11.jpg", tag: "CYBER SAFETY",   title: "Stay safe & scam-smart online" },
    { img: "assets/zicta/z2.jpg",  tag: "CONNECTIVITY",   title: "Nationwide 4G & 5G coverage" },
    { img: "assets/zicta/z6.jpg",  tag: "ACCESS FOR ALL", title: "Bridging the digital divide" },
    { img: "assets/zicta/z1.jpg",  tag: "DIGITAL SKILLS", title: "Empowering communities with ICT" }
  ],

  /* ---- "Did you know" ticker facts (cyber + ZICTA) ---- */
  facts: [
    { tag: "CYBER SAFETY", html: "A strong passphrase like <b>blue-otter-sails-7</b> beats <b>P@ss1</b> — length defeats guessing." },
    { tag: "STAY SAFE", html: "<b>ZICTA</b> never asks for your PIN or password by SMS. If someone does, it's a scam." },
    { tag: "DID YOU KNOW", html: "Turning on <b>two-factor authentication</b> blocks the vast majority of account takeovers." },
    { tag: "ZICTA", html: "Every SIM in Zambia must be <b>registered</b> to a real identity — it protects you if your line is misused." },
    { tag: "PHISHING", html: "Hover before you tap. A link that reads <b>z1cta-prizes.com</b> is not <b>zicta.zm</b>." },
    { tag: "DIGITAL LITERACY", html: "Public Wi-Fi is like an open lagoon — use a <b>VPN</b> or avoid banking on it." },
    { tag: "CYBER LAW", html: "Zambia's <b>Cyber Security &amp; Cyber Crimes Act (2021)</b> makes hacking, fraud and cyber-harassment criminal offences." }
  ],

  /* ---- Network Pulse widget (operator coverage bars) ---- */
  networks: [
    { name: "Airtel", strength: 5, color: "#ef4444" },
    { name: "MTN",    strength: 4, color: "#f59e0b" },
    { name: "Zamtel", strength: 3, color: "#22c55e" },
    { name: "Beeline",strength: 3, color: "#6366f1" }
  ],

  /* ---- Quick-action chips (Quick Actions widget) ---- */
  quickActions: [
    { label: "Report a scam", sub: "Forward suspicious SMS", ico: "chat", app: "knowledge" },
    { label: "Check a link", sub: "Is it phishing?", ico: "shield", game: "phish" },
    { label: "SIM help", sub: "Register & protect", ico: "sim", app: "knowledge" }
  ],

  /* ============================================================
     CYBER QUIZ — selectable topic sets
     ============================================================ */
  quizSets: [
    {
      id: "core", title: "ZICTA & Online Safety", tag: "ALL-ROUNDER", ico: "shield",
      grad: "linear-gradient(150deg,#38bdf8,#0369a1)",
      blurb: "A broad mix of ZICTA, scams, passwords and consumer-rights questions.",
      questions: [
        { cat: "Online Safety", q: "You get an SMS: “ZICTA: claim your K500 data bonus, login here.” What's the safest move?",
          opts: ["Tap the link quickly before it expires","Ignore & delete — verify only via the official zicta.zm site","Reply with your phone PIN to confirm","Forward it to all your contacts"],
          answer: 1, explain: "Urgency + a reward + a login link is the classic <b>phishing</b> recipe. Regulators never ask for PINs or logins by SMS." },
        { cat: "Passwords", q: "Which of these is the strongest account password?",
          opts: ["qwerty123","YourName2024","coral-tide-lantern-92","P@ss!"], answer: 2,
          explain: "A long, random <b>passphrase</b> of unrelated words is far harder to crack than short complex strings." },
        { cat: "ZICTA", q: "What does ZICTA primarily regulate in Zambia?",
          opts: ["Roads and highways","Information & Communication Technologies, telecoms and postal services","Food safety standards","Electricity tariffs"],
          answer: 1, explain: "ZICTA is the <b>Zambia Information & Communications Technology Authority</b> — overseeing ICT, telecom and postal sectors." },
        { cat: "Account Security", q: "Two-factor authentication (2FA) protects you by…",
          opts: ["Making your password longer automatically","Requiring a second proof (a code or app) on top of your password","Hiding your account from search engines","Encrypting your phone screen"],
          answer: 1, explain: "Even if a thief learns your password, <b>2FA</b> stops them without that second factor." },
        { cat: "Scams", q: "A caller claims your line will be 'switched off by ZICTA' unless you send mobile money now. This is…",
          opts: ["A normal ZICTA procedure","A social-engineering scam using fear & urgency","A reason to pay immediately","A free airtime offer"],
          answer: 1, explain: "Pressure, fear and a payment demand = <b>social engineering</b>. Hang up and verify through official channels." },
        { cat: "Devices", q: "Why should you keep your phone & apps updated?",
          opts: ["Updates only change the colours","They patch security holes attackers exploit","It makes the battery bigger","It's required to make calls"],
          answer: 1, explain: "Updates fix <b>vulnerabilities</b>. Running old software leaves a door open for attackers." },
        { cat: "Consumer Awareness", q: "If your network provider can't resolve your complaint, who can you escalate to?",
          opts: ["No one — the provider's word is final","ZICTA, the sector regulator, through its official complaints channels","Your nearest bank","The electricity utility"],
          answer: 1, explain: "ZICTA protects consumers and can step in when a complaint isn't resolved by your <b>operator</b>." },
        { cat: "Consumer Awareness", q: "What is the main purpose of SIM registration?",
          opts: ["To send you more adverts","To link a line to a verified identity and curb fraud & crime","To slow down your internet","To charge extra fees"],
          answer: 1, explain: "Registering your SIM ties it to a real identity, which helps protect you and trace <b>misuse</b>." }
      ]
    },
    {
      id: "pass", title: "Passwords & Login", tag: "ACCESS SECURITY", ico: "key",
      grad: "linear-gradient(150deg,#22d3ee,#0e7490)",
      blurb: "Lock down your accounts: passphrases, 2FA and login hygiene.",
      questions: [
        { cat: "Passphrases", q: "What makes a password hardest to crack?",
          opts: ["Adding one number at the end","Its length and unpredictability","Using your birth year","Making it ALL CAPS"], answer: 1,
          explain: "Each extra character multiplies the guesses needed. <b>Length</b> beats a few clever symbols." },
        { cat: "Reuse", q: "Why is reusing the same password everywhere dangerous?",
          opts: ["It isn't — it's convenient","One breached site exposes all your accounts","It slows your phone","Websites ban it"], answer: 1,
          explain: "Attackers try leaked passwords on other sites (<b>credential stuffing</b>). Use a unique one per account." },
        { cat: "2FA", q: "Which second factor is generally the most secure?",
          opts: ["An SMS code","An authenticator app or hardware key","Your mother's maiden name","A memorable PIN"], answer: 1,
          explain: "SMS can be intercepted or SIM-swapped. An <b>authenticator app/hardware key</b> is stronger." },
        { cat: "Managers", q: "A password manager helps you by…",
          opts: ["Sharing your passwords with friends","Generating & storing a strong unique password per site","Making all passwords the same","Posting them to the cloud publicly"], answer: 1,
          explain: "It remembers long random passwords so you don't have to reuse weak ones." },
        { cat: "OTP", q: "Someone calls saying they're 'support' and asks for the one-time code you just received. You should…",
          opts: ["Read it out to be helpful","Never share it — that code is the key to your account","Send it by SMS instead","Post it in a group chat"], answer: 1,
          explain: "Genuine staff never need your <b>OTP</b>. Sharing it hands over your account." },
        { cat: "Breach", q: "A site you use was hacked. What's the priority action?",
          opts: ["Do nothing","Change that password and any place you reused it, enable 2FA","Delete your phone","Buy a new SIM"], answer: 1,
          explain: "Rotate the exposed password everywhere it was reused and turn on <b>2FA</b>." }
      ]
    },
    {
      id: "phish", title: "Phishing & Scams", tag: "SPOT THE BAIT", ico: "hook",
      grad: "linear-gradient(150deg,#fb7185,#be123c)",
      blurb: "Recognise the bait: fake links, urgency, prizes and impostors.",
      questions: [
        { cat: "Links", q: "Which link is the genuine ZICTA website?",
          opts: ["zicta-rewards.tk","https://zicta.zm","z1cta-login.com","zicta.verify-now.net"], answer: 1,
          explain: "Look-alike domains and odd endings (.tk) are red flags. The official site is <b>zicta.zm</b>." },
        { cat: "Urgency", q: "An SMS says 'Act in 10 minutes or lose your number!' This pressure usually means…",
          opts: ["A genuine deadline","A scam trying to rush you past your judgement","A network upgrade","A reward"], answer: 1,
          explain: "Manufactured <b>urgency</b> is a hallmark of scams — slow down and verify." },
        { cat: "Prizes", q: "You 'won' a prize you never entered for, and must pay a fee to claim it. This is…",
          opts: ["Good luck","An advance-fee scam","Normal for lotteries","A ZICTA promotion"], answer: 1,
          explain: "Paying to receive a 'prize' is the classic <b>advance-fee</b> scam. Real prizes don't need a fee." },
        { cat: "Impostors", q: "A 'bank' email asks you to confirm your PIN via a form. Best response?",
          opts: ["Fill it in quickly","Delete it; banks never ask for your PIN like that","Reply asking for proof","Forward to friends"], answer: 1,
          explain: "Legitimate banks never request your <b>full PIN/password</b> by email or form." },
        { cat: "Verify", q: "Safest way to check a suspicious 'ZICTA' message?",
          opts: ["Click the link in it","Contact ZICTA via details from the official zicta.zm site","Reply to the SMS","Ask the sender if it's real"], answer: 1,
          explain: "Always verify through <b>independently-found</b> official contacts, not the message itself." }
      ]
    },
    {
      id: "law", title: "Cyber Law in Zambia", tag: "KNOW THE LAW", ico: "gavel",
      grad: "linear-gradient(150deg,#a78bfa,#6d28d9)",
      blurb: "Your rights & responsibilities under Zambia's digital laws.",
      questions: [
        { cat: "Cyber Crimes", q: "Zambia's main law on hacking and online fraud is the…",
          opts: ["Roads Act","Cyber Security & Cyber Crimes Act (2021)","Banking Act","Education Act"], answer: 1,
          explain: "The <b>Cyber Security and Cyber Crimes Act, 2021</b> covers offences like hacking, fraud and harassment." },
        { cat: "Unauthorised Access", q: "Logging into someone else's account without permission is…",
          opts: ["Fine if you don't change anything","A criminal offence (unauthorised access)","Allowed for family","Only illegal for banks"], answer: 1,
          explain: "<b>Unauthorised access</b> to a computer system is an offence — even just looking." },
        { cat: "Data Protection", q: "Zambia's Data Protection Act (2021) mainly exists to…",
          opts: ["Tax the internet","Safeguard how personal data is collected & used","Ban social media","Speed up Wi-Fi"], answer: 1,
          explain: "It gives people rights over their <b>personal data</b> and sets duties for those who process it." },
        { cat: "Harassment", q: "Sending repeated threatening or abusive messages online is…",
          opts: ["Just a joke","Cyber-harassment, which is punishable by law","Protected free speech always","Only wrong if they reply"], answer: 1,
          explain: "<b>Cyber-harassment / bullying</b> is an offence under the cyber-crimes law." },
        { cat: "Evidence", q: "If you're a victim of an online crime, a useful first step is to…",
          opts: ["Delete everything in anger","Preserve screenshots & details, then report to authorities/ZICTA","Confront the attacker","Pay them off"], answer: 1,
          explain: "Keep <b>evidence</b> (screenshots, numbers, times) and report through official channels." }
      ]
    },
    {
      id: "tech", title: "How Technology Works", tag: "UNDER THE HOOD", ico: "chip",
      grad: "linear-gradient(150deg,#34d399,#047857)",
      blurb: "Peek inside: networks, the web, encryption and data.",
      questions: [
        { cat: "Networks", q: "What does an IP address do?",
          opts: ["Stores your photos","Identifies a device so data can be routed to it","Charges your battery","Blocks viruses"], answer: 1,
          explain: "An <b>IP address</b> is like a postal address for devices on a network." },
        { cat: "Web", q: "The 's' and padlock in HTTPS mean…",
          opts: ["The site is fast","Traffic to the site is encrypted","The site is owned by ZICTA","Ads are blocked"], answer: 1,
          explain: "<b>HTTPS</b> encrypts data between you and the site so it can't be easily read in transit." },
        { cat: "Encryption", q: "Encryption protects data by…",
          opts: ["Deleting it","Scrambling it so only the right key can read it","Making it bigger","Hiding the screen"], answer: 1,
          explain: "<b>Encryption</b> turns readable data into ciphertext that needs a key to unlock." },
        { cat: "Data", q: "Roughly how many bits are in one byte?",
          opts: ["2","8","100","1000"], answer: 1,
          explain: "A <b>byte</b> = 8 bits. Bits (0/1) are the basic units computers store and process." },
        { cat: "Cloud", q: "'The cloud' really means…",
          opts: ["Storage in the sky","Someone else's servers you access over the internet","A weather service","Your phone's battery"], answer: 1,
          explain: "Cloud services run on <b>remote data-centre servers</b> you reach over the network." },
        { cat: "Mobile", q: "Moving from 4G to 5G mainly improves…",
          opts: ["Screen size","Speed and capacity (and lower latency)","Camera megapixels","Battery shape"], answer: 1,
          explain: "<b>5G</b> offers higher speeds, more capacity and lower delay than 4G." }
      ]
    },
    {
      id: "privacy", title: "Data & Privacy", tag: "YOUR DATA", ico: "lock",
      grad: "linear-gradient(150deg,#60a5fa,#1d4ed8)",
      blurb: "Control your footprint: permissions, sharing and consent.",
      questions: [
        { cat: "Permissions", q: "A simple torch app requests access to your contacts. You should…",
          opts: ["Allow it","Deny — it doesn't need that to work","Allow then forget","Share your contacts list"], answer: 1,
          explain: "Grant the <b>least privilege</b> needed. Over-asking apps are a privacy risk." },
        { cat: "Oversharing", q: "Posting your boarding pass photo online can leak…",
          opts: ["Nothing","Personal details a fraudster can misuse","Only the airline's logo","Your battery level"], answer: 1,
          explain: "Booking codes and names on tickets can be abused — think before you <b>share</b>." },
        { cat: "Consent", q: "Under data-protection principles, your personal data should be…",
          opts: ["Collected for any reason, forever","Collected for a clear purpose, with your awareness/consent","Sold by default","Public automatically"], answer: 1,
          explain: "Data should be used for a <b>specific, lawful purpose</b> you're informed about." },
        { cat: "Tracking", q: "A good privacy habit on a shared/public device is to…",
          opts: ["Stay logged in","Log out and use private browsing","Save your passwords","Disable the screen lock"], answer: 1,
          explain: "Always <b>log out</b> on shared devices so the next person can't reach your accounts." },
        { cat: "Children", q: "Best way to help children stay safe online?",
          opts: ["Give full unrestricted access","Use parental controls and talk openly about risks","Hide all devices","Ignore it"], answer: 1,
          explain: "Mix <b>parental controls</b> with open conversation about online risks." }
      ]
    }
  ],

  /* ============================================================
     MINI-GAMES DATA
     ============================================================ */

  /* Spot the Scam (tap SCAM or SAFE) */
  scam: [
    { text: "ZICTA: You've WON K5,000! Click bit.ly/zicta-win and enter your mobile money PIN to claim now.", scam: true, why: "Prizes + a link + asking for your PIN = phishing. ZICTA never asks for PINs." },
    { text: "Hi, this is your bank. We noticed a login from a new device. If this wasn't you, open the app and change your password.", scam: false, why: "It tells you to use the official app and doesn't ask for secrets — generally legitimate advice." },
    { text: "URGENT: Your line will be disconnected in 1 hour. Send K50 airtime to 097xxxxxxx to keep it active.", scam: true, why: "Fear + urgency + pay-now to a personal number is a classic scam." },
    { text: "Your data bundle expires tomorrow. Dial *115# to check your balance.", scam: false, why: "A normal reminder using an official USSD code, asking for nothing sensitive." },
    { text: "Dear customer, verify your account here: http://mtn-verify-login.tk or lose access today.", scam: true, why: "A look-alike domain (.tk) and a verify-or-lose-it threat — a phishing link." },
    { text: "Reminder: Register your SIM at any official service centre with your NRC. No payment required.", scam: false, why: "Genuine guidance — registration is done in person and is free." },
    { text: "Congrats! You're selected for a ZICTA job. Pay a K300 'processing fee' to confirm your slot.", scam: true, why: "Legitimate recruiters never ask for fees to secure a job." }
  ],

  /* True or False (ICT & ZICTA facts) */
  tf: [
    { s: "A longer passphrase is generally harder to crack than a short complex password.", a: true, why: "Length adds far more combinations than swapping a few symbols." },
    { s: "It's safe to do mobile banking on open public Wi-Fi without any protection.", a: false, why: "Open networks can be snooped — use mobile data or a trusted VPN." },
    { s: "ZICTA regulates ICT, telecom and postal services in Zambia.", a: true, why: "That's exactly ZICTA's mandate." },
    { s: "Two-factor authentication makes a stolen password useless on its own.", a: true, why: "The attacker still needs your second factor." },
    { s: "You should share your one-time PIN (OTP) if someone helpful asks for it.", a: false, why: "Never share an OTP — that's how accounts get hijacked." },
    { s: "Software updates often fix security holes that attackers exploit.", a: true, why: "Updating promptly closes known vulnerabilities." },
    { s: "Registering your SIM helps trace misuse of a mobile line.", a: true, why: "It links the line to a verified identity." },
    { s: "A torch app needing access to your contacts is completely normal.", a: false, why: "That's an over-reach — grant only permissions an app truly needs." }
  ],

  /* Strong or Weak? (password judgement) */
  passwords: [
    { p: "123456", strong: false, why: "The most common password in the world — cracked instantly." },
    { p: "k®8-River!lantern-42", strong: true, why: "Long, mixed and unpredictable — excellent." },
    { p: "Password1", strong: false, why: "A dictionary word + a number is guessed in seconds." },
    { p: "correct-horse-battery-staple", strong: true, why: "Four random words = a long, memorable, strong passphrase." },
    { p: "Lusaka2024", strong: false, why: "A place + year is easy to guess and often in breach lists." },
    { p: "qx7$Mango_breeze_55", strong: true, why: "Length + variety + no obvious words = strong." },
    { p: "qwerty", strong: false, why: "Keyboard patterns are top of every cracking list." }
  ],

  /* Phish or Legit? (URL inspection) */
  phish: [
    { url: "https://zicta.zm/consumers", legit: true, why: "Correct official domain (zicta.zm) over HTTPS." },
    { url: "http://zicta-rewards.tk/claim", legit: false, why: "Look-alike name + .tk + 'claim' bait = phishing." },
    { url: "https://www.airtel.co.zm", legit: true, why: "Genuine operator domain over HTTPS." },
    { url: "http://mtn.verify-account.com/login", legit: false, why: "Real brand placed on a stranger's domain — a trick." },
    { url: "https://account-secure-zm.000webhost.app", legit: false, why: "Free-host domain pretending to be 'secure' — a red flag." },
    { url: "https://www.gov.zm", legit: true, why: "Official Zambian government domain." },
    { url: "https://paypaI-zm.com", legit: false, why: "That's a capital 'i' replacing the 'l' — a homograph trick." }
  ],

  /* Legal or Illegal? (Zambian cyber law) */
  law: [
    { act: "Reporting a fraudulent SMS to ZICTA", legal: true, why: "Reporting cyber-crime is encouraged and lawful." },
    { act: "Guessing a colleague's password to read their email", legal: false, why: "Unauthorised access is an offence under the Cyber Crimes Act." },
    { act: "Using a strong VPN to protect your own privacy", legal: true, why: "Protecting your own traffic is legitimate." },
    { act: "Posting someone's ID and home address to threaten them", legal: false, why: "Cyber-harassment / doxxing is a punishable offence." },
    { act: "Backing up your own files to the cloud", legal: true, why: "Managing your own data is perfectly legal." },
    { act: "Selling a database of people's personal data without consent", legal: false, why: "Breaches the Data Protection Act, 2021." },
    { act: "Spreading software that locks others' files for ransom", legal: false, why: "Creating or distributing ransomware is a serious cyber-crime." }
  ],

  /* Memory Match — ICT term ↔ meaning pairs */
  memory: [
    { a: "HTTPS", b: "Encrypted web" },
    { a: "2FA", b: "Second login check" },
    { a: "VPN", b: "Private tunnel" },
    { a: "Phishing", b: "Fake-message bait" },
    { a: "Firewall", b: "Traffic guard" },
    { a: "Backup", b: "Spare copy" }
  ],

  /* Cipher Crack — Caesar shift decode (multiple choice) */
  cipher: [
    { cipher: "KHOOR", answer: "HELLO", opts: ["HELLO", "WORLD", "HACKER", "SECURE"] },
    { cipher: "FBEHU", answer: "CYBER", opts: ["LOGIN", "CYBER", "PHONE", "TOKEN"] },
    { cipher: "VHFXUH", answer: "SECURE", opts: ["SECURE", "DECODE", "ACCESS", "DANGER"] },
    { cipher: "CDPELD", answer: "ZAMBIA", opts: ["ZAMBIA", "ZICTAS", "LUSAKA", "KWACHA"] },
    { cipher: "WRNHQ", answer: "TOKEN", opts: ["LOGIN", "TOKEN", "MODEM", "CABLE"] }
  ],

  /* Threat Defender — items stream in; tap THREATS, spare the SAFE ones */
  threats: [
    { label: "Phishing link", bad: true },
    { label: "OS update", bad: false },
    { label: "malware.exe", bad: true },
    { label: "Verified app", bad: false },
    { label: "Fake prize SMS", bad: true },
    { label: "Bank app (official)", bad: false },
    { label: "Ransomware", bad: true },
    { label: "Trusted Wi-Fi", bad: false },
    { label: "Spyware", bad: true },
    { label: "2FA code prompt", bad: false },
    { label: "Cloned login page", bad: true },
    { label: "Software patch", bad: false }
  ],

  /* ---- Knowledge cards ---- */
  knowledge: [
    { cat: "Cyber Security", ico: "shield", color: "linear-gradient(150deg,#38bdf8,#0369a1)",
      title: "Spot a phishing message",
      body: "Phishing fakes a trusted sender to steal logins or money. Watch for urgency, odd links, spelling errors and requests for PINs.",
      tip: "Verify on the official site — never via the link sent to you." },
    { cat: "Cyber Security", ico: "key", color: "linear-gradient(150deg,#22d3ee,#0e7490)",
      title: "Build a strong passphrase",
      body: "Four random words beat a short complex password. Use a unique one per account and a password manager to remember them.",
      tip: "Length > complexity. Never reuse the same password." },
    { cat: "Cyber Security", ico: "lock", color: "linear-gradient(150deg,#60a5fa,#1d4ed8)",
      title: "Turn on 2FA",
      body: "Two-factor authentication adds a second check — an app code or token — so a stolen password alone isn't enough to get in.",
      tip: "Prefer an authenticator app over SMS codes where possible." },
    { cat: "Cyber Security", ico: "wifi", color: "linear-gradient(150deg,#0ea5e9,#075985)",
      title: "Public Wi-Fi care",
      body: "Open networks can be snooped. Avoid logging into banking or email on them, or use a trusted VPN to encrypt your traffic.",
      tip: "Forget the network after use so you don't auto-reconnect." },
    { cat: "ZICTA", ico: "globe", color: "linear-gradient(150deg,#34d399,#047857)",
      title: "What ZICTA does",
      body: "The Zambia Information & Communications Technology Authority regulates telecom, ICT and postal services — licensing operators and protecting consumers.",
      tip: "Official, trusted information lives at zicta.zm." },
    { cat: "ZICTA", ico: "sim", color: "linear-gradient(150deg,#a78bfa,#6d28d9)",
      title: "Why register your SIM",
      body: "SIM registration ties a line to a verified identity. It deters fraud and helps trace misuse — protecting you and the network.",
      tip: "Keep your registration details current and private." },
    { cat: "ZICTA", ico: "chat", color: "linear-gradient(150deg,#fb7185,#be123c)",
      title: "Report a scam",
      body: "If you receive a fraudulent SMS, call or message, you can report it so it can be investigated and others warned.",
      tip: "Don't engage — capture details and report through official channels." },
    { cat: "Digital Literacy", ico: "spark", color: "linear-gradient(150deg,#f59e0b,#b45309)",
      title: "Think before you share",
      body: "Once posted, content is hard to fully remove. Check before forwarding — misinformation spreads fastest when we don't pause.",
      tip: "Pause, verify the source, then decide to share." },
    { cat: "Digital Literacy", ico: "child", color: "linear-gradient(150deg,#38bdf8,#6366f1)",
      title: "Child online protection",
      body: "Use parental controls, talk openly about online risks, and keep devices in shared spaces to help children explore safely.",
      tip: "Agree on screen-time and 'tell an adult' rules together." },
    { cat: "Cyber Security", ico: "update", color: "linear-gradient(150deg,#2dd4bf,#0f766e)",
      title: "Keep software updated",
      body: "Updates patch the security holes attackers exploit. Enable automatic updates for your OS, apps and browser.",
      tip: "An out-of-date device is the easiest target." }
  ]
};
