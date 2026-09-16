/**
 * Client-walkthrough scaffolding, not app content. Every string here is
 * read only by <DevNote>, which itself renders nothing unless
 * NEXT_PUBLIC_SHOW_DEV_NOTES is set — see components/dev/DevNote.tsx.
 * Removing the feature later is: delete this file, delete
 * components/dev/, delete the env flag from .env.example and lib/env.ts,
 * then delete the <DevNote> import/line the compiler points at on each page.
 */

export interface DevNoteText {
  en: string;
  hi: string;
}

export interface DevNoteContent {
  purpose: DevNoteText;
  tradeContext?: DevNoteText;
  notBuiltYet?: DevNoteText;
  question?: DevNoteText;
}

export const devNotes = {
  buyer_feed: {
    purpose: {
      en: 'This is your rate board — every seller offer that matches your area and buying rules shows up here, grouped by product.',
      hi: 'यह आपका रेट बोर्ड है — आपके क्षेत्र और खरीद के नियमों से मेल खाने वाला हर विक्रेता का ऑफ़र यहाँ उत्पाद के हिसाब से दिखता है।',
    },
    tradeContext: {
      en: "This is the buyer's starting screen after signing in — from here he opens a product to see all offers on it.",
      hi: 'साइन इन करने के बाद खरीदार की यह पहली स्क्रीन है — यहाँ से वह किसी उत्पाद पर सभी ऑफ़र देखने जाता है।',
    },
  },
  buyer_product: {
    purpose: {
      en: 'All the offers on one product, from different sellers, so the buyer can compare rates and conditions before choosing one to buy.',
      hi: 'एक उत्पाद पर अलग-अलग विक्रेताओं के सभी ऑफ़र, ताकि खरीदार खरीदने से पहले दरों और शर्तों की तुलना कर सके।',
    },
    tradeContext: {
      en: "Reached by tapping a product on the rate board. From here he either buys one seller's offer directly, or, if the seller needs a minimum quantity bigger than one buyer wants, joins a shared pool with other buyers instead.",
      hi: 'रेट बोर्ड पर किसी उत्पाद पर टैप करने से यहाँ पहुँचते हैं। यहाँ से वह सीधे किसी विक्रेता का ऑफ़र खरीदता है, या अगर विक्रेता को एक खरीदार से ज़्यादा की न्यूनतम मात्रा चाहिए, तो दूसरे खरीदारों के साथ साझा पूल में शामिल होता है।',
    },
  },
  buyer_buy: {
    purpose: {
      en: "The screen where a buyer commits to one seller's offer — he picks how many boxes and where to deliver, then sends the request. The rate shown already has GST included; whatever number is on screen is exactly what he pays, nothing is added later.",
      hi: 'यह वह स्क्रीन है जहाँ खरीदार किसी विक्रेता के ऑफ़र को पक्का करता है — वह कितने बॉक्स चाहिए और कहाँ डिलीवरी करनी है यह चुनता है, फिर माँग भेजता है। दिखाई गई दर में जीएसटी पहले से शामिल है; स्क्रीन पर जो आँकड़ा है वही आखिरी भुगतान है, बाद में कुछ नहीं जुड़ता।',
    },
    tradeContext: {
      en: 'This happens right after choosing an offer on the product screen, and before the seller has confirmed anything — his stock is not reserved yet. This is only a request the seller can accept, quote differently, or turn down.',
      hi: 'यह उत्पाद स्क्रीन पर कोई ऑफ़र चुनने के तुरंत बाद होता है, और विक्रेता की पुष्टि से पहले — उसका स्टॉक अभी आरक्षित नहीं है। यह सिर्फ़ एक माँग है जिसे विक्रेता स्वीकार कर सकता है, अलग दर दे सकता है, या मना कर सकता है।',
    },
  },
  buyer_ask: {
    purpose: {
      en: 'For when nothing on the rate board fits — the buyer states what he needs (product, quantity, how fresh, how fast) without naming a price, and sellers who can supply it send him their own rates.',
      hi: 'जब रेट बोर्ड पर कुछ भी सही न बैठे — खरीदार बताता है कि उसे क्या चाहिए (उत्पाद, मात्रा, कितनी ताज़ी, कितनी जल्दी) बिना कीमत बताए, और जो विक्रेता दे सकते हैं वे अपनी दर भेजते हैं।',
    },
    tradeContext: {
      en: "An alternative to the rate board — used when a buyer can't find a ready offer and wants sellers to come to him instead.",
      hi: 'यह रेट बोर्ड का एक विकल्प है — तब इस्तेमाल होता है जब खरीदार को कोई तैयार ऑफ़र नहीं मिलता और वह चाहता है कि विक्रेता खुद उसके पास आएँ।',
    },
  },
  buyer_my_asks: {
    purpose: {
      en: 'The list of everything the buyer has asked for, and the rates sellers have sent back on each one — he compares them here and accepts the one(s) he wants, in full or split across a few sellers.',
      hi: 'खरीदार ने जो कुछ भी माँगा है उसकी सूची, और हर एक पर विक्रेताओं ने जो दरें भेजी हैं — वह यहाँ उनकी तुलना करता है और जो चाहे स्वीकार करता है, पूरी मात्रा या कुछ विक्रेताओं में बाँटकर।',
    },
    tradeContext: {
      en: 'This is where an ask, raised on the previous screen, turns into a real order — accepting a rate here creates the order.',
      hi: 'यहीं पर पिछली स्क्रीन पर की गई माँग असली ऑर्डर बनती है — यहाँ किसी दर को स्वीकार करना ऑर्डर बना देता है।',
    },
  },
  buyer_orders: {
    purpose: {
      en: 'Every order the buyer has ever placed, with where each one currently stands — placed, paid, on the way, or delivered.',
      hi: 'खरीदार ने अब तक जितने भी ऑर्डर दिए हैं, उन सबकी मौजूदा स्थिति — दर्ज हुआ, भुगतान हुआ, रास्ते में, या डिलीवर हुआ।',
    },
    tradeContext: {
      en: "The buyer's own record of his trade history; tapping any order opens its full detail.",
      hi: 'यह खरीदार के अपने व्यापार का रिकॉर्ड है; किसी भी ऑर्डर पर टैप करने से उसकी पूरी जानकारी खुलती है।',
    },
  },
  buyer_order_detail: {
    purpose: {
      en: 'The full story of one order — how far it has travelled (placed → paid → seller confirmed → on the way to Indore → paperwork → on the way to the buyer → delivered), the invoice and transport papers, and, once it arrives, a button to confirm receipt or report a problem.',
      hi: 'एक ऑर्डर की पूरी कहानी — वह अब तक कहाँ तक पहुँचा (दर्ज हुआ → भुगतान हुआ → विक्रेता ने पुष्टि की → इंदौर के रास्ते में → कागज़ी कार्रवाई → खरीदार की ओर रवाना → डिलीवर हुआ), इनवॉइस और ट्रांसपोर्ट के कागज़ात, और पहुँचने पर, रसीद की पुष्टि करने या शिकायत दर्ज करने का बटन।',
    },
    tradeContext: {
      en: "Every order physically routes through Indore in the middle — that is why 'paperwork at Indore' is its own step even though the buyer never sees or deals with Indore directly.",
      hi: "हर ऑर्डर बीच में इंदौर से होकर गुज़रता है — इसीलिए 'इंदौर में कागज़ी कार्रवाई' अपना अलग चरण है, भले ही खरीदार का इंदौर से सीधा कोई सरोकार न हो।",
    },
    notBuiltYet: {
      en: "Two things aren't finished here yet. If the buyer never taps 'I have received this' and never raises a complaint, the order should automatically count as delivered after 7 days — that automatic step doesn't run, so someone has to close it out by hand for now. And if the seller who was supposed to supply this order can't, there's meant to be a screen offering a replacement seller at the same price — that screen doesn't exist yet either.",
      hi: "यहाँ दो चीज़ें अभी अधूरी हैं। अगर खरीदार 'मुझे यह मिल गया' नहीं दबाता और कोई शिकायत भी नहीं करता, तो 7 दिन बाद ऑर्डर अपने आप डिलीवर मान लिया जाना चाहिए — यह अपने आप होने वाला चरण अभी काम नहीं करता, इसलिए फ़िलहाल किसी को इसे हाथ से बंद करना पड़ता है। और अगर जिस विक्रेता को यह ऑर्डर देना था वह नहीं दे पाता, तो उसी कीमत पर बदली विक्रेता का प्रस्ताव देने वाली स्क्रीन आनी चाहिए — वह स्क्रीन भी अभी नहीं बनी है।",
    },
  },
  buyer_payment: {
    purpose: {
      en: 'Where the buyer tells TriFid he has paid — he enters the UTR number or bank message for the transfer he made. This is not proof of payment by itself; staff still confirm the money actually landed before the order moves forward.',
      hi: 'यहाँ खरीदार ट्राईफिड को बताता है कि उसने भुगतान कर दिया है — वह अपने ट्रांसफर का यूटीआर नंबर या बैंक मैसेज डालता है। यह अपने आप में भुगतान का सबूत नहीं है; स्टाफ यह पुष्टि करता है कि पैसा वाकई पहुँचा, तभी ऑर्डर आगे बढ़ता है।',
    },
    tradeContext: {
      en: "This screen only becomes available once an order exists and is waiting for money — the seller's stock is not committed to this buyer until payment is confirmed.",
      hi: 'यह स्क्रीन तभी खुलती है जब कोई ऑर्डर बन चुका हो और भुगतान का इंतज़ार हो — जब तक भुगतान की पुष्टि नहीं होती, विक्रेता का स्टॉक इस खरीदार के लिए पक्का नहीं होता।',
    },
  },
  buyer_complaint: {
    purpose: {
      en: "For reporting a problem with an order that has arrived — damaged goods, wrong material, or short count. Raising one here immediately stops the 7-day delivery clock so the buyer isn't rushed while it's being looked into.",
      hi: 'किसी पहुँचे हुए ऑर्डर में समस्या बताने के लिए — क्षतिग्रस्त सामान, गलत सामान, या मात्रा में कमी। यहाँ शिकायत दर्ज करते ही 7 दिन की डिलीवरी की समय सीमा तुरंत रुक जाती है, ताकि जाँच होने तक खरीदार पर जल्दी का दबाव न रहे।',
    },
    tradeContext: {
      en: "Only reachable from an order's own detail screen, once that order is at the delivery stage.",
      hi: 'यह सिर्फ़ किसी ऑर्डर की अपनी विवरण स्क्रीन से ही खुलती है, जब वह ऑर्डर डिलीवरी के चरण में हो।',
    },
    notBuiltYet: {
      en: 'Right now this only records the complaint and pauses the clock. There is no screen yet for staff to decide the outcome — refund, replacement, or something else — so every complaint currently needs a staff member to follow up by hand.',
      hi: 'अभी यह सिर्फ़ शिकायत दर्ज करती है और घड़ी रोक देती है। स्टाफ के लिए यह तय करने की कोई स्क्रीन अभी नहीं है कि नतीजा क्या होगा — रिफंड, बदलाव, या कुछ और — इसलिए फ़िलहाल हर शिकायत पर स्टाफ को खुद हाथ से आगे बढ़ना पड़ता है।',
    },
  },
  buyer_pools: {
    purpose: {
      en: "A shared order — several buyers wanting the same product commit together until the seller's minimum quantity is reached, then everyone gets that seller's rate at once. This screen shows how full the pool is and lets a buyer join, reconfirm, or drop out.",
      hi: 'एक साझा ऑर्डर — एक ही उत्पाद चाहने वाले कई खरीदार तब तक साथ में प्रतिबद्ध रहते हैं जब तक विक्रेता की न्यूनतम मात्रा पूरी न हो जाए, फिर सबको एक साथ उस विक्रेता की दर मिलती है। यह स्क्रीन दिखाती है कि पूल कितना भरा है और खरीदार को शामिल होने, दोबारा पुष्टि करने, या हटने देती है।',
    },
    tradeContext: {
      en: "A buyer lands here from a product's offer list when the only way to buy that product is together with others, because the seller set a minimum order size above one box.",
      hi: 'खरीदार यहाँ किसी उत्पाद की ऑफ़र सूची से तब पहुँचता है जब उस उत्पाद को खरीदने का एकमात्र तरीका दूसरों के साथ मिलकर हो, क्योंकि विक्रेता ने एक बॉक्स से ज़्यादा की न्यूनतम मात्रा तय की है।',
    },
    question: {
      en: 'Right now every buyer pays his own normal rate once the pool triggers, rather than everyone paying one flat shared rate — is that the right way for it to work, or should everyone in a pool pay the same single price?',
      hi: 'अभी पूल शुरू होने पर हर खरीदार अपनी सामान्य दर चुकाता है, न कि सब मिलकर एक ही दर — क्या यह सही तरीका है, या पूल में सबको एक ही कीमत चुकानी चाहिए?',
    },
  },
  buyer_profile: {
    purpose: {
      en: "The buyer's own account hub — his mobile number, his standing with TriFid, his saved delivery addresses, and any refunds owed to him, all in one place.",
      hi: 'खरीदार का अपना खाता केंद्र — उसका मोबाइल नंबर, ट्राईफिड के साथ उसकी स्थिति, उसके सेव किए गए डिलीवरी पते, और उसे मिलने वाले किसी भी रिफंड — सब एक जगह।',
    },
    tradeContext: {
      en: 'A settings and information screen, not part of the buying flow itself.',
      hi: 'यह एक सेटिंग्स और जानकारी की स्क्रीन है, खरीदने की प्रक्रिया का हिस्सा नहीं।',
    },
    notBuiltYet: {
      en: "The 'standing' section only shows how many rates he's viewed for now — the strike system that would show warnings for bad conduct (like backing out of an order) doesn't exist yet, so it honestly shows zero strikes rather than a made-up history.",
      hi: "'स्थिति' वाला हिस्सा अभी सिर्फ़ देखी गई दरें दिखाता है — गलत व्यवहार (जैसे ऑर्डर से पीछे हटना) की चेतावनी दिखाने वाला स्ट्राइक सिस्टम अभी नहीं बना है, इसलिए यह ईमानदारी से शून्य स्ट्राइक दिखाता है, कोई बनावटी इतिहास नहीं।",
    },
  },
  registration: {
    purpose: {
      en: 'Where a new buyer or seller signs up — a short form asking for the essentials (GST number, firm details, and either where he buys from or what he sells).',
      hi: 'जहाँ कोई नया खरीदार या विक्रेता पंजीकरण करता है — एक छोटा फ़ॉर्म जिसमें ज़रूरी जानकारी माँगी जाती है (जीएसटी नंबर, फ़र्म का विवरण, और वह कहाँ से खरीदता है या क्या बेचता है)।',
    },
    tradeContext: {
      en: 'The very first screen for anyone new to TriFid. After submitting, nothing happens automatically — a staff member reviews it before the account can trade.',
      hi: 'ट्राईफिड में नए किसी भी व्यक्ति के लिए यह सबसे पहली स्क्रीन है; जमा करने के बाद अपने आप कुछ नहीं होता — खाता व्यापार शुरू करने से पहले स्टाफ इसकी समीक्षा करता है।',
    },
  },
  pending_gate: {
    purpose: {
      en: "The waiting screen for someone whose registration hasn't been approved yet, has been rejected, or has been blocked — he sees this instead of any rate, listing, or order screen until staff act on his account.",
      hi: 'जिसका पंजीकरण अभी स्वीकृत नहीं हुआ, अस्वीकृत हो गया, या रोक दिया गया है, उसके लिए यह इंतज़ार वाली स्क्रीन है — जब तक स्टाफ उसके खाते पर कार्रवाई नहीं करता, उसे कोई रेट, लिस्टिंग या ऑर्डर स्क्रीन नहीं दिखती, यही दिखती है।',
    },
    tradeContext: {
      en: 'Sits between registration and the real app — everyone lands here first after signing up, or after signing in if their status has changed.',
      hi: 'यह पंजीकरण और असली ऐप के बीच में है — पंजीकरण के बाद, या स्थिति बदलने पर साइन इन करते समय, हर कोई पहले यहीं पहुँचता है।',
    },
  },
  login: {
    purpose: {
      en: 'How both buyers and sellers sign in — just a mobile number and a one-time code sent by SMS, no password to remember.',
      hi: 'खरीदार और विक्रेता दोनों इसी तरह साइन इन करते हैं — सिर्फ़ मोबाइल नंबर और एसएमएस से भेजा गया एक बार का कोड, याद रखने के लिए कोई पासवर्ड नहीं।',
    },
    tradeContext: {
      en: 'The very first screen anyone sees when opening the app.',
      hi: 'ऐप खोलते ही हर किसी को दिखने वाली सबसे पहली स्क्रीन।',
    },
  },
  seller_demand: {
    purpose: {
      en: 'The list of what buyers are currently asking for that this seller is positioned to supply — he picks one and sends his own rate.',
      hi: 'उन खरीदारों की माँगों की सूची जिन्हें यह विक्रेता दे सकता है — वह किसी एक को चुनकर अपनी दर भेजता है।',
    },
    tradeContext: {
      en: "The seller's equivalent of the buyer's rate board — where he goes looking for business rather than waiting for someone to buy his listing.",
      hi: 'यह खरीदार के रेट बोर्ड जैसा ही विक्रेता का पन्ना है — यहाँ वह खुद व्यापार ढूँढने आता है, बजाय इसके कि कोई उसकी लिस्टिंग खरीदे।',
    },
  },
  seller_quote: {
    purpose: {
      en: "Where the seller answers one buyer's ask with his own rate, how much he can supply, how fresh the stock is, and how fast he can get it to Indore.",
      hi: 'यहाँ विक्रेता किसी खरीदार की माँग का जवाब अपनी दर, वह कितना दे सकता है, माल कितना ताज़ा है, और इंदौर कितनी जल्दी पहुँचा सकता है, बताकर देता है।',
    },
    tradeContext: {
      en: "Reached by picking an ask from the demand board. Once sent, the buyer sees this rate alongside any other sellers' quotes and chooses.",
      hi: 'मांग बोर्ड से कोई माँग चुनकर यहाँ पहुँचते हैं; भेजने के बाद, खरीदार इस दर को दूसरे विक्रेताओं की दरों के साथ देखकर चुनता है।',
    },
  },
  seller_create_listing: {
    purpose: {
      en: "Where a seller puts stock up for sale — product, rate, quantity, who can see it (his own area, all India, or everywhere except his area), and the stock's condition (how fresh, where it's coming from).",
      hi: 'जहाँ विक्रेता बिक्री के लिए स्टॉक चढ़ाता है — उत्पाद, दर, मात्रा, कौन देख सकता है (उसका अपना क्षेत्र, पूरा भारत, या उसके क्षेत्र को छोड़कर हर जगह), और स्टॉक की स्थिति (कितना ताज़ा, कहाँ से आ रहा है)।',
    },
    tradeContext: {
      en: "The starting point of everything a seller sells through TriFid — once published, it appears on matching buyers' rate boards.",
      hi: 'विक्रेता ट्राईफिड के ज़रिए जो कुछ भी बेचता है उसकी यह शुरुआत है — प्रकाशित होते ही यह मेल खाने वाले खरीदारों के रेट बोर्ड पर दिखने लगता है।',
    },
    notBuiltYet: {
      en: "One visibility choice — picking specific tehsils by hand rather than a whole area — isn't available here yet; only the three broader options are.",
      hi: 'एक विकल्प — हाथ से खास तहसीलें चुनना, पूरे क्षेत्र की बजाय — अभी यहाँ उपलब्ध नहीं है; सिर्फ़ तीन बड़े विकल्प ही हैं।',
    },
  },
  seller_my_stock: {
    purpose: {
      en: 'Every listing the seller currently has live or paused, with its rate, how many days of shelf life are shown, and quick links to see where he stands against competitors or to change his rate.',
      hi: 'विक्रेता की हर चालू या रोकी गई लिस्टिंग, उसकी दर, कितने दिनों की शेल्फ लाइफ दिखाई गई है, और प्रतिस्पर्धियों के मुक़ाबले अपनी स्थिति देखने या दर बदलने के त्वरित लिंक के साथ।',
    },
    tradeContext: {
      en: "The seller's main working screen — where he manages everything he's put up for sale.",
      hi: 'विक्रेता की मुख्य काम की स्क्रीन — जहाँ वह अपनी सारी बिक्री की चीज़ों को संभालता है।',
    },
  },
  seller_position: {
    purpose: {
      en: "Shows a seller, for one listing, whether he's the cheapest, competitive, or behind the market — as a rank and a range, never another seller's exact rate or name.",
      hi: 'किसी एक लिस्टिंग के लिए विक्रेता को दिखाता है कि वह सबसे सस्ता है, प्रतिस्पर्धी है, या बाज़ार से पीछे है — एक रैंक और एक सीमा के रूप में, कभी किसी दूसरे विक्रेता की सटीक दर या नाम नहीं।',
    },
    tradeContext: {
      en: "Opened from 'My stock' for a specific listing; helps him decide whether to change his rate.",
      hi: "'मेरा स्टॉक' से किसी खास लिस्टिंग के लिए यहाँ खोला जाता है; यह तय करने में मदद करता है कि दर बदलनी है या नहीं।",
    },
    notBuiltYet: {
      en: 'This comparison only shows once enough other sellers are listing the same thing nearby — with too few to compare against, it deliberately shows nothing rather than pointing at one competitor.',
      hi: 'यह तुलना तभी दिखती है जब पास में उतनी ही चीज़ बेचने वाले काफ़ी विक्रेता हों — कम होने पर यह जानबूझकर कुछ नहीं दिखाता, ताकि किसी एक प्रतिस्पर्धी की ओर इशारा न हो।',
    },
  },
  seller_rate_change: {
    purpose: {
      en: 'Where a seller changes the rate on a live listing. Cutting the rate by more than 2% needs two separate confirmations, and that cut is then held for review before it takes effect.',
      hi: 'जहाँ विक्रेता किसी चालू लिस्टिंग की दर बदलता है। 2% से ज़्यादा कटौती के लिए दो अलग-अलग पुष्टि चाहिए, और वह कटौती लागू होने से पहले समीक्षा के लिए रोकी जाती है।',
    },
    tradeContext: {
      en: "Reached from 'My stock' for a specific listing; this changes the price everyone sees, it does not create a new listing.",
      hi: "'मेरा स्टॉक' से किसी खास लिस्टिंग के लिए यहाँ पहुँचते हैं; यह वह कीमत बदलता है जो सब देखते हैं, यह नई लिस्टिंग नहीं बनाता।",
    },
    question: {
      en: "Who is supposed to review a rate cut bigger than 2%, and how quickly should that happen? Right now the app holds the cut for review but doesn't say who does that or on what timeline.",
      hi: 'यह 2% से बड़ी कटौती की समीक्षा कौन करेगा, और कितनी जल्दी? अभी ऐप कटौती को समीक्षा के लिए रोक देता है लेकिन यह नहीं बताता कि यह कौन करेगा या कितने समय में।',
    },
  },
  seller_confirmations: {
    purpose: {
      en: 'Where a seller decides how much he can actually send against buyers who have already committed to his stock — he can confirm the full amount, confirm only what he has, requote, or decline.',
      hi: 'जहाँ विक्रेता तय करता है कि उन खरीदारों को कितना भेज सकता है जिन्होंने पहले ही उसके स्टॉक के लिए प्रतिबद्धता जताई है — वह पूरी मात्रा की पुष्टि कर सकता है, जितना है उतने की पुष्टि कर सकता है, नई दर दे सकता है, या मना कर सकता है।',
    },
    tradeContext: {
      en: 'One decision here can cover several buyers at once, all waiting on the same stock — each still gets his own separate order and his own bill once confirmed; the seller never learns who they are or sees them individually. After confirming, there are 5 seconds to undo before it becomes final and every buyer is notified.',
      hi: 'यहाँ एक फ़ैसला एक साथ कई खरीदारों को कवर कर सकता है, जो सब उसी स्टॉक का इंतज़ार कर रहे हैं — पुष्टि होने पर हर एक को अपना अलग ऑर्डर और अपना अलग बिल मिलता है; विक्रेता को कभी पता नहीं चलता कि वे कौन हैं या उन्हें अलग-अलग नहीं देखता। पुष्टि के बाद, पक्का होने और सभी खरीदारों को सूचना जाने से पहले 5 सेकंड तक वापस लेने का मौका रहता है।',
    },
    notBuiltYet: {
      en: "The 'Requote' button here only flags the buyer's request as needing a new rate — there is no working screen yet for the buyer to see or respond to that new rate. Following up after a requote currently needs a staff member's phone call.",
      hi: "यहाँ 'नई दर दें' बटन सिर्फ़ खरीदार की माँग को नई दर चाहिए के रूप में चिह्नित करता है — खरीदार के लिए वह नई दर देखने या जवाब देने की कोई स्क्रीन अभी काम नहीं करती। नई दर के बाद आगे की बात फ़िलहाल स्टाफ के फ़ोन कॉल से होती है।",
    },
  },
  seller_claims: {
    purpose: {
      en: "A board of stalled orders that another seller couldn't supply, open for any seller to step in and claim at the original rate.",
      hi: 'अटके हुए ऐसे ऑर्डरों का बोर्ड जिन्हें कोई दूसरा विक्रेता नहीं दे सका, जिसे कोई भी विक्रेता मूल दर पर आकर ले सकता है।',
    },
    tradeContext: {
      en: 'Only comes into play when a confirmed order runs into trouble elsewhere — a fallback, not part of a normal sale.',
      hi: 'यह तभी काम में आता है जब किसी पक्के ऑर्डर में कहीं और दिक्कत आ जाए — यह एक विकल्प है, सामान्य बिक्री का हिस्सा नहीं।',
    },
    notBuiltYet: {
      en: "This feature is switched off by default while it's still being cleared for use — most sellers will simply see nothing here rather than a board, and that is expected, not a bug.",
      hi: 'यह सुविधा अभी उपयोग के लिए मंज़ूरी मिलने तक डिफ़ॉल्ट रूप से बंद है — ज़्यादातर विक्रेताओं को यहाँ कोई बोर्ड नहीं बल्कि खाली स्क्रीन दिखेगी, और यह गड़बड़ी नहीं बल्कि तय व्यवस्था है।',
    },
  },
  seller_orders: {
    purpose: {
      en: 'Every order a seller has been confirmed to supply, and how far each one has moved — dispatched, at Indore, delivered.',
      hi: 'विक्रेता ने जितने भी ऑर्डर देने की पुष्टि की है, और हर एक कितना आगे बढ़ा है — डिस्पैच हुआ, इंदौर में, डिलीवर हुआ।',
    },
    tradeContext: {
      en: "The seller's own trade record; tapping one opens its full detail with the dispatch and extension actions.",
      hi: 'यह विक्रेता का अपना व्यापार रिकॉर्ड है; किसी एक पर टैप करने से उसकी पूरी जानकारी डिस्पैच और समय-विस्तार के विकल्पों के साथ खुलती है।',
    },
  },
  seller_order_detail: {
    purpose: {
      en: "One order's detail — its progress, and, when it's time, the form to record dispatch (transport or bus, driver details, freight) or to ask for more time if he can't meet the deadline.",
      hi: 'एक ऑर्डर की पूरी जानकारी — उसकी प्रगति, और जब समय हो, डिस्पैच दर्ज करने का फ़ॉर्म (ट्रांसपोर्ट या बस, ड्राइवर का विवरण, भाड़ा) या समय सीमा पूरी न कर पाने पर और समय माँगने का विकल्प।',
    },
    tradeContext: {
      en: 'Once the seller marks it dispatched here for the second leg (Indore to the buyer), he only ever sees that it left — never where it actually went. That is deliberate: sellers and buyers are never shown each other.',
      hi: 'जब विक्रेता यहाँ दूसरे चरण (इंदौर से खरीदार तक) के लिए डिस्पैच दर्ज करता है, उसके बाद उसे सिर्फ़ यह दिखता है कि माल निकल गया — कभी नहीं कि वह असल में कहाँ गया। यह जानबूझकर है: विक्रेता और खरीदार को कभी एक-दूसरे को नहीं दिखाया जाता।',
    },
  },
  seller_area: {
    purpose: {
      en: "Shows the seller exactly which tehsils he's approved to sell into, and the time by which he must dispatch each day.",
      hi: 'विक्रेता को दिखाता है कि वह किन-किन तहसीलों में बेचने के लिए स्वीकृत है, और हर दिन उसे किस समय तक डिस्पैच करना है।',
    },
    tradeContext: {
      en: 'Read-only information, set by staff at approval — a seller cannot change this himself; he can only ask staff to.',
      hi: 'यह सिर्फ़ देखने के लिए जानकारी है, स्वीकृति के समय स्टाफ द्वारा तय की गई — विक्रेता इसे खुद नहीं बदल सकता; वह सिर्फ़ स्टाफ से बदलाव के लिए कह सकता है।',
    },
  },
  seller_profile: {
    purpose: {
      en: "The seller's own account hub — his mobile number, his scorecard (trust tier, how many supplies he's completed or failed), and the list of buyers he's chosen to never sell to.",
      hi: 'विक्रेता का अपना खाता केंद्र — उसका मोबाइल नंबर, उसका स्कोरकार्ड (भरोसे का स्तर, उसने कितनी आपूर्ति पूरी की या नहीं कर सका), और उन खरीदारों की सूची जिन्हें उसने कभी न बेचने के लिए चुना है।',
    },
    tradeContext: {
      en: 'A settings and standing screen, not part of selling itself — exclusions here only ever hide his own listings from a named buyer; that buyer is never told, and can still buy the same product from someone else.',
      hi: 'यह सेटिंग्स और स्थिति की स्क्रीन है, बेचने की प्रक्रिया का हिस्सा नहीं — यहाँ बहिष्करण सिर्फ़ किसी नामित खरीदार से अपनी लिस्टिंग छुपाता है; उस खरीदार को कभी नहीं बताया जाता, और वह वही उत्पाद किसी और से खरीद सकता है।',
    },
  },
} satisfies Record<string, DevNoteContent>;

export type DevNoteKey = keyof typeof devNotes;
