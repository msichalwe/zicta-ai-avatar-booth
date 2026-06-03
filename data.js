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
    { img: "photo-1.png", tag: "CYBER SAFETY",   title: "Stay safe & scam-smart online" },
    { img: "photo-2.png", tag: "CONNECTIVITY",   title: "Nationwide 4G & 5G coverage" },
    { img: "photo-3.png", tag: "ACCESS FOR ALL", title: "Bridging the digital divide" },
    { img: "photo-4.png", tag: "DIGITAL SKILLS", title: "Empowering communities with ICT" }
  ],

  /* ---- "Did you know" ticker facts (cyber + ZICTA) ---- */
  facts: [
    { tag: "CYBER SAFETY", html: "A strong passphrase like <b>blue-otter-sails-7</b> beats <b>P@ss1</b> — length defeats guessing." },
    { tag: "STAY SAFE", html: "<b>ZICTA</b> never asks for your PIN or password by SMS. If someone does, it's a scam." },
    { tag: "DID YOU KNOW", html: "Turning on <b>two-factor authentication</b> blocks the vast majority of account takeovers." },
    { tag: "ZICTA", html: "Every SIM in Zambia must be <b>registered</b> to a real identity — it protects you if your line is misused." },
    { tag: "PHISHING", html: "Hover before you tap. A link that reads <b>z1cta-prizes.com</b> is not <b>zicta.zm</b>." },
    { tag: "DIGITAL LITERACY", html: "Public Wi-Fi is like an open lagoon — use a <b>VPN</b> or avoid banking on it." }
  ],

  /* ---- Cyber Quiz ---- */
  quiz: [
    {
      cat: "Online Safety",
      q: "You get an SMS: “ZICTA: claim your K500 data bonus, login here.” What's the safest move?",
      opts: [
        "Tap the link quickly before it expires",
        "Ignore & delete — verify only via the official zicta.zm site",
        "Reply with your phone PIN to confirm",
        "Forward it to all your contacts"
      ],
      answer: 1,
      explain: "Urgency + a reward + a login link is the classic <b>phishing</b> recipe. Regulators never ask for PINs or logins by SMS."
    },
    {
      cat: "Passwords",
      q: "Which of these is the strongest account password?",
      opts: [ "qwerty123", "YourName2024", "coral-tide-lantern-92", "P@ss!" ],
      answer: 2,
      explain: "A long, random <b>passphrase</b> of unrelated words is far harder to crack than short complex strings."
    },
    {
      cat: "ZICTA",
      q: "What does ZICTA primarily regulate in Zambia?",
      opts: [
        "Roads and highways",
        "Information & Communication Technologies, telecoms and postal services",
        "Food safety standards",
        "Electricity tariffs"
      ],
      answer: 1,
      explain: "ZICTA is the <b>Zambia Information & Communications Technology Authority</b> — overseeing ICT, telecom and postal sectors."
    },
    {
      cat: "Account Security",
      q: "Two-factor authentication (2FA) protects you by…",
      opts: [
        "Making your password longer automatically",
        "Requiring a second proof (a code or app) on top of your password",
        "Hiding your account from search engines",
        "Encrypting your phone screen"
      ],
      answer: 1,
      explain: "Even if a thief learns your password, <b>2FA</b> stops them without that second factor."
    },
    {
      cat: "Scams",
      q: "A caller claims your line will be 'switched off by ZICTA' unless you send mobile money now. This is…",
      opts: [
        "A normal ZICTA procedure",
        "A social-engineering scam using fear & urgency",
        "A reason to pay immediately",
        "A free airtime offer"
      ],
      answer: 1,
      explain: "Pressure, fear and a payment demand = <b>social engineering</b>. Hang up and verify through official channels."
    },
    {
      cat: "Devices",
      q: "Why should you keep your phone & apps updated?",
      opts: [
        "Updates only change the colours",
        "They patch security holes attackers exploit",
        "It makes the battery bigger",
        "It's required to make calls"
      ],
      answer: 1,
      explain: "Updates fix <b>vulnerabilities</b>. Running old software leaves a door open for attackers."
    },
    {
      cat: "Privacy",
      q: "Best practice when an app asks for permissions it doesn't need (e.g. a torch app wanting your contacts)?",
      opts: [
        "Always allow everything",
        "Deny what isn't needed for the app to work",
        "Uninstall your antivirus",
        "Share it on social media"
      ],
      answer: 1,
      explain: "Grant the <b>least privilege</b> necessary. Unneeded permissions are a privacy risk."
    },
    {
      cat: "Consumer Awareness",
      q: "If your network provider can't resolve your complaint, who can you escalate to?",
      opts: [
        "No one — the provider's word is final",
        "ZICTA, the sector regulator, through its official complaints channels",
        "Your nearest bank",
        "The electricity utility"
      ],
      answer: 1,
      explain: "ZICTA protects consumers and can step in when a complaint isn't resolved by your <b>operator</b>. Keep your reference details."
    },
    {
      cat: "Consumer Awareness",
      q: "Why does ZICTA require devices to be 'type-approved' before sale in Zambia?",
      opts: [
        "To make phones more expensive",
        "To ensure devices are safe and work properly on local networks",
        "To slow down imports",
        "It doesn't — any device is fine"
      ],
      answer: 1,
      explain: "<b>Type approval</b> confirms equipment meets safety and technical standards so it won't harm you or the network."
    },
    {
      cat: "Consumer Awareness",
      q: "You keep getting unwanted premium-rate SMS subscriptions. What's the right step?",
      opts: [
        "Pay to make them stop",
        "Unsubscribe/opt out and report it to your provider or ZICTA",
        "Ignore it forever",
        "Share your PIN to cancel"
      ],
      answer: 1,
      explain: "You have the right to <b>opt out</b> of unsolicited subscriptions. Report persistent ones so they can be investigated."
    },
    {
      cat: "Consumer Awareness",
      q: "As a telecom consumer in Zambia, you are entitled to…",
      opts: [
        "Hidden charges with no explanation",
        "Clear tariff information and a fair quality of service",
        "Free phones from ZICTA",
        "Unlimited data forever"
      ],
      answer: 1,
      explain: "Consumers have a right to <b>transparent pricing</b> and a reasonable <b>quality of service</b> from licensed operators."
    },
    {
      cat: "Consumer Awareness",
      q: "What is the main purpose of SIM registration?",
      opts: [
        "To send you more adverts",
        "To link a line to a verified identity and curb fraud & crime",
        "To slow down your internet",
        "To charge extra fees"
      ],
      answer: 1,
      explain: "Registering your SIM ties it to a real identity, which helps protect you and trace <b>misuse</b> of mobile lines."
    }
  ],

  /* ---- Mini game: Spot the Scam (tap SCAM or SAFE) ---- */
  scam: [
    { text: "ZICTA: You've WON K5,000! Click bit.ly/zicta-win and enter your mobile money PIN to claim now.", scam: true, why: "Prizes + a link + asking for your PIN = phishing. ZICTA never asks for PINs." },
    { text: "Hi, this is your bank. We noticed a login from a new device. If this wasn't you, open the app and change your password.", scam: false, why: "It tells you to use the official app and doesn't ask for secrets — generally legitimate advice." },
    { text: "URGENT: Your line will be disconnected in 1 hour. Send K50 airtime to 097xxxxxxx to keep it active.", scam: true, why: "Fear + urgency + pay-now to a personal number is a classic scam." },
    { text: "Your data bundle expires tomorrow. Dial *115# to check your balance.", scam: false, why: "A normal reminder using an official USSD code, asking for nothing sensitive." },
    { text: "Dear customer, verify your account here: http://mtn-verify-login.tk or lose access today.", scam: true, why: "A look-alike domain (.tk) and a verify-or-lose-it threat — a phishing link." },
    { text: "Reminder: Register your SIM at any official service centre with your NRC. No payment required.", scam: false, why: "Genuine guidance — registration is done in person and is free." },
    { text: "Congrats! You're selected for a ZICTA job. Pay a K300 'processing fee' to confirm your slot.", scam: true, why: "Legitimate recruiters never ask for fees to secure a job." }
  ],

  /* ---- Mini game: True or False (ICT & ZICTA facts) ---- */
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

  /* ---- Knowledge cards ---- */
  knowledge: [
    {
      cat: "Cyber Security", ico: "shield", color: "linear-gradient(150deg,#38bdf8,#0369a1)",
      title: "Spot a phishing message",
      body: "Phishing fakes a trusted sender to steal logins or money. Watch for urgency, odd links, spelling errors and requests for PINs.",
      tip: "Verify on the official site — never via the link sent to you."
    },
    {
      cat: "Cyber Security", ico: "key", color: "linear-gradient(150deg,#22d3ee,#0e7490)",
      title: "Build a strong passphrase",
      body: "Four random words beat a short complex password. Use a unique one per account and a password manager to remember them.",
      tip: "Length > complexity. Never reuse the same password."
    },
    {
      cat: "Cyber Security", ico: "lock", color: "linear-gradient(150deg,#60a5fa,#1d4ed8)",
      title: "Turn on 2FA",
      body: "Two-factor authentication adds a second check — an app code or token — so a stolen password alone isn't enough to get in.",
      tip: "Prefer an authenticator app over SMS codes where possible."
    },
    {
      cat: "Cyber Security", ico: "wifi", color: "linear-gradient(150deg,#0ea5e9,#075985)",
      title: "Public Wi-Fi care",
      body: "Open networks can be snooped. Avoid logging into banking or email on them, or use a trusted VPN to encrypt your traffic.",
      tip: "Forget the network after use so you don't auto-reconnect."
    },
    {
      cat: "ZICTA", ico: "globe", color: "linear-gradient(150deg,#34d399,#047857)",
      title: "What ZICTA does",
      body: "The Zambia Information & Communications Technology Authority regulates telecom, ICT and postal services — licensing operators and protecting consumers.",
      tip: "Official, trusted information lives at zicta.zm."
    },
    {
      cat: "ZICTA", ico: "sim", color: "linear-gradient(150deg,#a78bfa,#6d28d9)",
      title: "Why register your SIM",
      body: "SIM registration ties a line to a verified identity. It deters fraud and helps trace misuse — protecting you and the network.",
      tip: "Keep your registration details current and private."
    },
    {
      cat: "ZICTA", ico: "chat", color: "linear-gradient(150deg,#fb7185,#be123c)",
      title: "Report a scam",
      body: "If you receive a fraudulent SMS, call or message, you can report it so it can be investigated and others warned.",
      tip: "Don't engage — capture details and report through official channels."
    },
    {
      cat: "Digital Literacy", ico: "spark", color: "linear-gradient(150deg,#f59e0b,#b45309)",
      title: "Think before you share",
      body: "Once posted, content is hard to fully remove. Check before forwarding — misinformation spreads fastest when we don't pause.",
      tip: "Pause, verify the source, then decide to share."
    },
    {
      cat: "Digital Literacy", ico: "child", color: "linear-gradient(150deg,#38bdf8,#6366f1)",
      title: "Child online protection",
      body: "Use parental controls, talk openly about online risks, and keep devices in shared spaces to help children explore safely.",
      tip: "Agree on screen-time and 'tell an adult' rules together."
    },
    {
      cat: "Cyber Security", ico: "update", color: "linear-gradient(150deg,#2dd4bf,#0f766e)",
      title: "Keep software updated",
      body: "Updates patch the security holes attackers exploit. Enable automatic updates for your OS, apps and browser.",
      tip: "An out-of-date device is the easiest target."
    }
  ]
};
