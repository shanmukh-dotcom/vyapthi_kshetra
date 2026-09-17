import { TextToSpeech } from '@capacitor-community/text-to-speech';
/**
 * VYAPTI KSHETRA — Guided Voice Tour with Element Highlighting
 * Walks the user through each page step-by-step, highlighting
 * the relevant UI card/section and speaking its description.
 */

class GuidedAssistant {
  constructor() {
    this.currentStep = 0;
    this.isPlaying = false;
    this.stopped = false;
    this.overlay = null;

    const path = window.location.pathname;

    if (path.includes('farmer-home')) {
      this.steps = [
        {
          // The 3-card grid container (select by its grid style)
          finder: () => {
            // Find the grid that contains the 3 main cards
            const allGrids = document.querySelectorAll('.app-main-layout > div');
            for (const div of allGrids) {
              if (div.style.display === 'grid' && div.style.gridTemplateColumns && div.style.gridTemplateColumns.includes('repeat(3')) {
                return div;
              }
            }
            // Fallback: find grid with 3 <a> children
            const grids = document.querySelectorAll('div[style*="grid-template-columns: repeat(3"]');
            return grids.length > 0 ? grids[0] : null;
          },
          en: 'Welcome to your farm dashboard. These 3 cards show your daily summary.',
          hi: 'आपके फार्म डैशबोर्ड में स्वागत है। ये 3 कार्ड आज का सारांश दिखाते हैं।',
          te: 'మీ ఫార్మ్ డాష్‌బోర్డ్‌కు స్వాగతం. ఈ 3 కార్డులు రోజువారీ సారాంశాన్ని చూపిస్తాయి.'
        },
        {
          // Card 1: Your Crop — 2nd <a> with href to my-farm (skip sidebar)
          finder: () => {
            const links = document.querySelectorAll('.app-main-layout a[href="/farmer-my-farm.html"]');
            return links.length > 0 ? links[0] : null;
          },
          en: 'This is your active crop — Potato, 500 kilograms ready to sell.',
          hi: 'यह आपकी सक्रिय फसल है — आलू, 500 किलो बिक्री के लिए तैयार।',
          te: 'ఇది మీ ప్రస్తుత పంట — బంగాళాదుంప, 500 కిలోలు అమ్మకానికి సిద్ధం.'
        },
        {
          finder: () => {
            const links = document.querySelectorAll('.app-main-layout a[href="/farmer-market.html"]');
            return links.length > 0 ? links[0] : null;
          },
          en: "Today's market price is 22 rupees per kilogram. Prices are 12 percent higher this week.",
          hi: 'आज का बाज़ार मूल्य 22 रुपये प्रति किलो है। इस हफ्ते कीमतें 12 प्रतिशत अधिक हैं।',
          te: 'నేటి మార్కెట్ ధర కిలోకు 22 రూపాయలు. ఈ వారం ధరలు 12 శాతం ఎక్కువగా ఉన్నాయి.'
        },
        {
          finder: () => {
            const links = document.querySelectorAll('.app-main-layout a[href="/farmer-find-buyers.html"]');
            return links.length > 0 ? links[0] : null;
          },
          en: '3 buyers are interested in your crop. 2 are ready to buy now.',
          hi: '3 खरीदार आपकी फसल में रुचि रखते हैं। 2 अभी खरीदने के लिए तैयार हैं।',
          te: '3 మంది కొనుగోలుదారులు మీ పంటపై ఆసక్తి కలిగి ఉన్నారు. 2 మంది ఇప్పుడే కొనడానికి సిద్ధంగా ఉన్నారు.'
        },
        {
          // "Other Options" grid — the 4-grid options section
          finder: () => {
            const h3s = document.querySelectorAll('.app-main-layout h3');
            for (const h3 of h3s) {
              if (h3.textContent.includes('Other Options')) {
                return h3.closest('div');
              }
            }
            return null;
          },
          en: 'Use these quick options to manage your farm, check prices, find buyers, or arrange transport.',
          hi: 'अपना खेत प्रबंधित करने, कीमतें देखने, खरीदार खोजने या परिवहन की व्यवस्था के लिए इन विकल्पों का उपयोग करें।',
          te: 'మీ పొలం నిర్వహించడానికి, ధరలు చూడటానికి, కొనుగోలుదారులను కనుగొనడానికి ఈ ఎంపికలను ఉపయోగించండి.'
        }
      ];
    } else if (path.includes('farmer-my-farm')) {
      this.steps = [
        {
          selector: '.page-title-row',
          en: 'This is your farm profile — My Farm.',
          hi: 'यह आपकी खेत की प्रोफ़ाइल है — मेरा खेत।',
          te: 'ఇది మీ పొలం ప్రొఫైల్ — నా పొలం.'
        },
        {
          selector: '.glass-card',
          en: 'Your farm — Krishna Farm. 2.5 acres verified in Krishna District, Andhra Pradesh.',
          hi: 'आपका खेत — कृष्णा फार्म। कृष्णा जिला, आंध्र प्रदेश में 2.5 एकड़ सत्यापित।',
          te: 'మీ పొలం — కృష్ణా ఫార్మ్. కృష్ణా జిల్లా, ఆంధ్రప్రదేశ్‌లో 2.5 ఎకరాలు ధృవీకరించబడినవి.'
        },
        {
          selector: '.crops-grid',
          en: 'You have 3 active crops: Potato, Tomato, and Chilli.',
          hi: 'आपके पास 3 सक्रिय फसलें हैं: आलू, टमाटर, और मिर्च।',
          te: 'మీ వద్ద 3 పంటలు ఉన్నాయి: బంగాళాదుంప, టమాటా, మరియు మిర్చి.'
        },
        {
          selector: '.weather-card',
          en: "Today's weather is 32 degrees, partly cloudy with 10 percent rain chance.",
          hi: 'आज का मौसम 32 डिग्री, आंशिक बादल छाए हैं, बारिश की 10 प्रतिशत संभावना।',
          te: 'నేటి వాతావరణం 32 డిగ్రీలు, పాక్షికంగా మేఘావృతం, 10 శాతం వర్షం అవకాశం.'
        },
        {
          selector: '.qa-row',
          en: 'Use these quick actions to add a new crop, update farm details, or download a report.',
          hi: 'नई फसल जोड़ने, खेत विवरण अपडेट करने, या रिपोर्ट डाउनलोड करने के लिए इन कार्यों का उपयोग करें।',
          te: 'కొత్త పంట జోడించడానికి, పొలం వివరాలు నవీకరించడానికి, లేదా నివేదిక డౌన్‌లోడ్ చేయడానికి వీటిని ఉపయోగించండి.'
        }
      ];
    } else if (path.includes('farmer-market')) {
      this.steps = [
        { selector: '.page-title-row', en: 'Welcome to Market and Fair Price intelligence.', hi: 'बाज़ार और उचित मूल्य खुफिया जानकारी में स्वागत है।', te: 'మార్కెట్ మరియు న్యాయమైన ధర తెలివికి స్వాగతం.' },
        { selector: '.card-today-price', en: "Today's market price for Potato is 22 rupees per kilogram — 12 percent higher than last week.", hi: 'आलू का आज का बाज़ार मूल्य 22 रुपये प्रति किलो है — पिछले हफ्ते से 12 प्रतिशत अधिक।', te: 'బంగాళాదుంప నేటి మార్కెట్ ధర కిలోకు 22 రూపాయలు — గత వారం కంటే 12 శాతం ఎక్కువ.' },
        { selector: '.card-fair-price', en: 'The estimated fair price range for farmers is 21 to 23 rupees per kilogram.', hi: 'किसानों के लिए अनुमानित उचित मूल्य 21 से 23 रुपये प्रति किलो है।', te: 'రైతులకు అంచనా వేసిన న్యాయమైన ధర కిలోకు 21 నుండి 23 రూపాయలు.' },
        { selector: '.card-trend', en: 'This chart shows the price trend over the last 6 months.', hi: 'यह चार्ट पिछले 6 महीनों में मूल्य प्रवृत्ति दिखाता है।', te: 'ఈ చార్ట్ గత 6 నెలల ధరల ధోరణిని చూపిస్తుంది.' },
        { selector: '.card-nearby', en: 'Nearby market prices: Krishna 22, Vijayawada 24, Guntur 20 rupees per kilogram.', hi: 'निकटवर्ती बाज़ार मूल्य: कृष्णा 22, विजयवाड़ा 24, गुंटूर 20 रुपये प्रति किलो।', te: 'సమీప మార్కెట్ ధరలు: కృష్ణా 22, విజయవాడ 24, గుంటూరు 20 రూపాయలు కిలోకు.' },
        { selector: '.insight-card, .card-insight', en: 'Market insight: Potato prices are 12 percent higher this week. Good time to sell.', hi: 'बाज़ार जानकारी: इस हफ्ते आलू की कीमतें 12 प्रतिशत अधिक हैं। बेचने का अच्छा समय है।', te: 'మార్కెట్ సమాచారం: ఈ వారం బంగాళాదుంప ధరలు 12 శాతం ఎక్కువ. అమ్మకానికి మంచి సమయం.' }
      ];
    } else if (path.includes('farmer-grade-sell')) {
      this.steps = [
        { selector: '.stepper-container', en: 'Follow these 5 steps: Upload photos, get AI analysis, view results, find buyers, and sell.', hi: 'इन 5 चरणों का पालन करें: फ़ोटो अपलोड करें, AI विश्लेषण प्राप्त करें, परिणाम देखें, खरीदार खोजें, और बेचें।', te: 'ఈ 5 దశలను అనుసరించండి: ఫోటోలు అప్‌లోడ్ చేయండి, AI విశ్లేషణ పొందండి, ఫలితాలు చూడండి, కొనుగోలుదారులను కనుగొనండి, మరియు అమ్మండి.' },
        { selector: '.dropzone', en: 'Click here to upload clear photos of your crop for AI grading.', hi: 'AI ग्रेडिंग के लिए अपनी फसल की स्पष्ट तस्वीरें अपलोड करने के लिए यहाँ क्लिक करें।', te: 'AI గ్రేడింగ్ కోసం మీ పంట ఫోటోలను అప్‌లోడ్ చేయడానికి ఇక్కడ క్లిక్ చేయండి.' },
        { selector: '.ai-top-row', en: 'AI analysis complete. Your Potato received Grade A with 94 percent confidence.', hi: 'AI विश्लेषण पूरा। आपके आलू को 94 प्रतिशत विश्वास के साथ ग्रेड A मिला।', te: 'AI విశ్లేషణ పూర్తయింది. మీ బంగాళాదుంపకు 94 శాతం నమ్మకంతో గ్రేడ్ A వచ్చింది.' },
        { selector: '.rec-box, .rec-green-block', en: 'The recommended fair price for Grade A potatoes is 22 to 24 rupees per kilogram.', hi: 'ग्रेड A आलू के लिए अनुशंसित उचित मूल्य 22 से 24 रुपये प्रति किलो है।', te: 'గ్రేడ్ A బంగాళాదుంపలకు సిఫార్సు చేయబడిన న్యాయమైన ధర కిలోకు 22 నుండి 24 రూపాయలు.' },
        { selector: '.ns-btns', en: 'Now you can view all buyers or arrange pickup for your produce.', hi: 'अब आप सभी खरीदारों को देख सकते हैं या अपनी उपज के लिए पिकअप की व्यवस्था कर सकते हैं।', te: 'ఇప్పుడు మీరు అన్ని కొనుగోలుదారులను చూడవచ్చు లేదా మీ ఉత్పత్తి కోసం పికప్ ఏర్పాటు చేయవచ్చు.' }
      ];
    } else if (path.includes('farmer-find-buyers')) {
      this.steps = [
        { selector: '.page-title-row', en: 'Welcome to Find Buyers — connect with trusted buyers for your crops.', hi: 'खरीदार खोजें में स्वागत है — अपनी फसलों के लिए विश्वसनीय खरीदारों से जुड़ें।', te: 'కొనుగోలుదారులను కనుగొనండి — మీ పంటల కోసం నమ్మకమైన కొనుగోలుదారులతో అనుసంధానం అవ్వండి.' },
        { selector: '.stats-grid', en: '128 active buyers in Andhra Pradesh. Price range is 20 to 26 rupees per kilogram.', hi: 'आंध्र प्रदेश में 128 सक्रिय खरीदार। मूल्य सीमा 20 से 26 रुपये प्रति किलो।', te: 'ఆంధ్రప్రదేశ్‌లో 128 సక్రియ కొనుగోలుదారులు. ధర పరిధి కిలోకు 20 నుండి 26 రూపాయలు.' },
        { selector: '.buyer-card', en: 'Top buyer: Krishna Fresh Mart offering 24 rupees per kilogram, 12 kilometres away.', hi: 'शीर्ष खरीदार: कृष्णा फ्रेश मार्ट, 24 रुपये प्रति किलो, 12 किलोमीटर दूर।', te: 'టాప్ కొనుగోలుదారు: కృష్ణా ఫ్రెష్ మార్ట్, కిలోకు 24 రూపాయలు, 12 కిలోమీటర్ల దూరంలో.' },
        { finder: () => { const cards = document.querySelectorAll('.buyer-card'); return cards.length > 1 ? cards[1] : null; }, en: 'Reliance Fresh is offering 26 rupees per kilogram for 1000 to 5000 kilograms.', hi: 'रिलायंस फ्रेश 1000 से 5000 किलो के लिए 26 रुपये प्रति किलो दे रहा है।', te: 'రిలయన్స్ ఫ్రెష్ 1000 నుండి 5000 కిలోలకు కిలోకు 26 రూపాయలు ఇస్తుంది.' },
        { selector: '.widget', en: 'Use the map to see buyer locations or follow tips for better matches.', hi: 'खरीदार स्थान देखने के लिए मानचित्र का उपयोग करें।', te: 'కొనుగోలుదారుల స్థానాలు చూడటానికి మ్యాప్ ఉపయోగించండి.' }
      ];
    } else if (path.includes('farmer-collective') || path.includes('farmer-logistics')) {
      this.steps = [
        { selector: '.page-title-row', en: 'Welcome to Collective and Logistics. Join farmers, reduce transport costs.', hi: 'सामूहिक और लॉजिस्टिक्स में स्वागत है। किसानों से जुड़ें, परिवहन लागत कम करें।', te: 'సామూహిక మరియు లాజిస్టిక్స్‌కు స్వాగతం. రైతులతో చేరి, రవాణా ఖర్చులు తగ్గించండి.' },
        { selector: '.stats-grid', en: '12 active farmer groups, 8 verified transport partners, 20 to 30 percent lower costs.', hi: '12 सक्रिय किसान समूह, 8 सत्यापित परिवहन भागीदार, 20 से 30 प्रतिशत कम लागत।', te: '12 సక్రియ రైతు సమూహాలు, 8 ధృవీకరించబడిన రవాణా భాగస్వాములు, 20 నుండి 30 శాతం తక్కువ ఖర్చు.' },
        { selector: '.transport-card', en: 'Nearest vehicle: Mathrusri Logistics, 1 kilometre away, 52 rupees per kilometre.', hi: 'निकटतम वाहन: मातृश्री लॉजिस्टिक्स, 1 किलोमीटर दूर, 52 रुपये प्रति किलोमीटर।', te: 'సమీప వాహనం: మాతృశ్రీ లాజిస్టిక్స్, 1 కిలోమీటర్ దూరంలో, కిలోమీటర్‌కు 52 రూపాయలు.' },
        { selector: '.group-promo', en: 'Join farmer groups for shared transport to reduce costs.', hi: 'लागत कम करने के लिए साझा परिवहन के लिए किसान समूहों में शामिल हों।', te: 'ఖర్చులు తగ్గించడానికి భాగస్వామ్య రవాణా కోసం రైతు సమూహాలలో చేరండి.' },
        { selector: '.center-item, .center-list', en: 'Nearby collection centers: Krishna at 5 kilometres, Gudivada at 28 kilometres.', hi: 'निकटवर्ती संग्रह केंद्र: कृष्णा 5 किलोमीटर, गुडिवाड़ा 28 किलोमीटर।', te: 'సమీప సేకరణ కేంద్రాలు: కృష్ణా 5 కిలోమీటర్లు, గుడివాడ 28 కిలోమీటర్లు.' }
      ];
    } else if (path.includes('farmer-transactions')) {
      this.steps = [
        { selector: '.page-title-banner', en: 'This is your transaction history and payment ledger.', hi: 'यह आपका लेन-देन इतिहास और भुगतान खाता है।', te: 'ఇది మీ లావాదేవీ చరిత్ర మరియు చెల్లింపు లెడ్జర్.' },
        { selector: '.stat-card.sc-green', en: 'Total sales this season: 1 lakh 24 thousand 800 rupees, up 18 percent.', hi: 'इस सीज़न कुल बिक्री: 1 लाख 24 हज़ार 800 रुपये, 18 प्रतिशत बढ़ी।', te: 'ఈ సీజన్ మొత్తం అమ్మకాలు: 1 లక్ష 24 వేల 800 రూపాయలు, 18 శాతం పెరిగాయి.' },
        { selector: '.stat-card.sc-blue', en: 'Amount received: 1 lakh 8 thousand 300 rupees — 87 percent of total.', hi: 'प्राप्त राशि: 1 लाख 8 हज़ार 300 रुपये — कुल का 87 प्रतिशत।', te: 'అందుకున్న మొత్తం: 1 లక్ష 8 వేల 300 రూపాయలు — మొత్తంలో 87 శాతం.' },
        { selector: '.stat-card.sc-orange', en: 'Pending payments: 16 thousand 500 rupees.', hi: 'लंबित भुगतान: 16 हज़ार 500 रुपये।', te: 'పెండింగ్ చెల్లింపులు: 16 వేల 500 రూపాయలు.' },
        { selector: '.table-container', en: 'Here is your detailed transaction history across all crops.', hi: 'यहाँ आपकी सभी फसलों का विस्तृत लेन-देन इतिहास है।', te: 'ఇక్కడ అన్ని పంటలలో మీ వివరమైన లావాదేవీ చరిత్ర ఉంది.' }
      ];
    } else if (path.includes('farmer-production-alerts')) {
      this.steps = [
        { selector: '.page-title-row', en: 'Crop Production Monitor — tracking regional production against thresholds.', hi: 'फसल उत्पादन मॉनिटर — क्षेत्रीय उत्पादन की ट्रैकिंग।', te: 'పంట ఉత్పత్తి మానిటర్ — ప్రాంతీయ ఉత్పత్తి ట్రాకింగ్.' },
        { selector: '#pa-summary-cards', en: 'Currently monitoring 6 crops from 279 farmers. 2 active alerts detected.', hi: '279 किसानों की 6 फसलों की निगरानी। 2 सक्रिय अलर्ट मिले।', te: '279 మంది రైతుల నుండి 6 పంటలను పర్యవేక్షిస్తోంది. 2 సక్రియ హెచ్చరికలు.' },
        { selector: '#pa-active-alerts', en: 'Critical alert: Potato production in Krishna District is 18 percent below the required threshold.', hi: 'गंभीर अलर्ट: कृष्णा जिले में आलू उत्पादन सीमा से 18 प्रतिशत नीचे है।', te: 'క్రిటికల్ హెచ్చరిక: కృష్ణా జిల్లాలో బంగాళాదుంప ఉత్పత్తి 18 శాతం తక్కువగా ఉంది.' },
        { selector: '#pa-table-body', en: 'This table shows production data for all monitored crops and their status.', hi: 'यह तालिका सभी फसलों का उत्पादन डेटा और उनकी स्थिति दिखाती है।', te: 'ఈ పట్టిక అన్ని పంటల ఉత్పత్తి డేటా మరియు వాటి స్థితిని చూపిస్తుంది.' },
        { selector: '#pa-chart-container', en: 'This chart compares expected production against required thresholds.', hi: 'यह चार्ट अपेक्षित उत्पादन की तुलना आवश्यक सीमाओं से करता है।', te: 'ఈ చార్ట్ అంచనా ఉత్పత్తిని అవసరమైన పరిమితులతో పోలుస్తుంది.' }
      ];
    } else if (path.includes('farmer-profile')) {
      this.steps = [
        { selector: '#name-input', en: 'Look here, this is where you enter your full name.', hi: 'यहाँ देखें, यहाँ आपको अपना पूरा नाम दर्ज करना है।', te: 'ఇక్కడ చూడండి, ఇక్కడ మీరు మీ పేరును నమోదు చేయాలి.' },
        { selector: '#mobile-input', en: 'Here, enter your ten digit mobile number.', hi: 'यहाँ अपना दस अंकों का मोबाइल नंबर दर्ज करें।', te: 'ఇక్కడ, మీ మొబైల్ నంబర్‌ను నమోదు చేయండి.' },
        { selector: '#village-input', en: 'This is where you type the name of your village and district.', hi: 'यहाँ आप अपने गाँव और जिले का नाम टाइप करें।', te: 'ఇక్కడ మీరు మీ గ్రామం మరియు జిల్లా పేరును టైప్ చేయాలి.' },
        { selector: '#crop-input', en: 'Enter your crop detail, like potato or rice.', hi: 'यहाँ अपनी फसल का विवरण दर्ज करें।', te: 'ఇక్కడ మీరు మీ పంట వివరాలను నమోదు చేయాలి.' },
        { selector: '#continue-profile-btn', en: 'Click the continue button to go to your farm dashboard.', hi: 'फार्म डैशबोर्ड पर जाने के लिए जारी रखें बटन पर क्लिक करें।', te: 'ఫార్మ్ డాష్‌బోర్డ్‌కు వెళ్ళడానికి కొనసాగించు బటన్‌ను క్లిక్ చేయండి.' }
      ];
    } else {
      this.steps = [
        { selector: '.page-title-row, .page-title-left, h1', en: 'Welcome to this page. You can use the menu on the left to navigate.', hi: 'इस पृष्ठ पर स्वागत है। नेविगेट करने के लिए बाईं ओर मेनू का उपयोग करें।', te: 'ఈ పేజీకి స్వాగతం. నావిగేట్ చేయడానికి ఎడమ వైపు మెనూ ఉపయోగించండి.' }
      ];
    }
  }

  startTour() {
    if (this.isPlaying || this.steps.length === 0) return;
    this.isPlaying = true;
    this.stopped = false;
    this.currentStep = 0;
    this.createOverlay();
    this.playNextStep();
  }

  stopTour() {
    this.stopped = true;
    this.isPlaying = false;
    this.currentStep = 0;
    
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

    this.removeHighlights();
    this.removeOverlay();
  }

  createOverlay() {
    if (this.overlay) return;
    this.overlay = document.createElement('div');
    this.overlay.id = 'guided-tour-overlay';
    // this.overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 9990; pointer-events: none; transition: opacity 0.3s;';
    // document.body.appendChild(this.overlay);
  }

  removeOverlay() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }

  findElement(step) {
    // If the step has a custom finder function, use that
    if (typeof step.finder === 'function') {
      return step.finder();
    }
    // Otherwise try each selector in a comma-separated list
    if (step.selector) {
      const selectors = step.selector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel);
          if (el) return el;
        } catch (e) { /* ignore */ }
      }
    }
    return null;
  }

  playNextStep() {
    // Check if stopped
    if (this.stopped || this.currentStep >= this.steps.length) {
      this.isPlaying = false;
      this.removeHighlights();
      this.removeOverlay();
      return;
    }

    const step = this.steps[this.currentStep];
    const element = this.findElement(step);

    
      
      if (element) {
        this.removeHighlights();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove old floater if it exists
        const oldFloater = document.getElementById('vyapti-floating-highlight');
        if (oldFloater) oldFloater.remove();
        
        // Foolproof inline highlighting
        element.dataset.originalBorder = element.style.border || '';
        element.dataset.originalBackground = element.style.backgroundColor || '';
        element.dataset.originalBoxShadow = element.style.boxShadow || '';
        element.dataset.originalTransition = element.style.transition || '';
        
        element.style.transition = 'all 0.3s ease';
        element.style.border = '4px solid #2ECC71';
        element.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        element.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.5)';
        
        element.classList.add('guided-highlight');
      } else {


      // Element not found, skip
      this.currentStep++;
      if (!this.stopped) this.playNextStep();
      return;
    }

    // Get language
    const langKey = localStorage.getItem('vyapti_selected_language') || 'en';
    const langCodes = { 'en': 'en-IN', 'hi': 'hi-IN', 'te': 'te-IN', 'ta': 'ta-IN', 'kn': 'kn-IN' };
    const spokenText = step[langKey] || step.en;

    
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

    
    try {
      TextToSpeech.speak({
        text: spokenText,
        lang: langCodes[langKey] || 'en-IN',
        rate: 0.92
      });
    } catch(e) {
      if(window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        // removed
        // removed
        // removed
      }
    }

// removed utterance
    // removed
    // removed

    // Try to find a native voice
    // removed
    // removed
    if (false) {
      utterance.voice = nativeVoice;
    } else if (langKey === 'en') {
      const indVoice = voices.find(v => v.lang.includes('en-IN'));
      if (indVoice) utterance.voice = indVoice;
    }

    utterance.onend = () => {
      if (this.stopped) return; // Don't advance if stopped
      setTimeout(() => {
        if (this.stopped) return;
        this.currentStep++;
        this.playNextStep();
      }, 500);
    };

    utterance.onerror = () => {
      if (this.stopped) return;
      setTimeout(() => {
        if (this.stopped) return;
        this.currentStep++;
        this.playNextStep();
      }, 500);
    };

    // removed
  }

  
    
    removeHighlights() {
      document.querySelectorAll('.guided-highlight').forEach(el => {
        el.style.border = el.dataset.originalBorder || '';
        el.style.backgroundColor = el.dataset.originalBackground || '';
        el.style.boxShadow = el.dataset.originalBoxShadow || '';
        el.style.transition = el.dataset.originalTransition || '';
        el.classList.remove('guided-highlight');
      });
    }
}

// Inject CSS for the glow animation
const gtStyle = document.createElement('style');
gtStyle.innerHTML = `
  @keyframes guideGlow {
    0% { box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.5), 0 0 20px 6px rgba(46, 204, 113, 0.25); }
    50% { box-shadow: 0 0 0 6px rgba(46, 204, 113, 0.8), 0 0 35px 12px rgba(46, 204, 113, 0.45); }
    100% { box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.5), 0 0 20px 6px rgba(46, 204, 113, 0.25); }
  }
  
`;
document.head.appendChild(gtStyle);

// Wire up the Listen / Read Aloud button
document.addEventListener('DOMContentLoaded', () => {
  // Pre-load voices
  window.speechSynthesis.getVoices();

  const assistant = new GuidedAssistant();

  // Find ALL possible read-aloud buttons (some pages use different markup)
  setTimeout(() => {
    const allButtons = document.querySelectorAll('.btn-read-aloud, .acc-btn');
    let readBtn = null;

    // First try the specific class
    readBtn = document.querySelector('.btn-read-aloud');

    // If not found, try to find any button containing "Read Aloud" or "Listen" text
    if (!readBtn) {
      for (const btn of allButtons) {
        if (btn.textContent.trim().includes('Read Aloud') || btn.textContent.trim().includes('Listen')) {
          readBtn = btn;
          break;
        }
      }
    }

    // Also search all buttons broadly
    if (!readBtn) {
      const allBtns = document.querySelectorAll('button');
      for (const btn of allBtns) {
        const txt = btn.textContent.trim();
        if (txt === 'Read Aloud' || txt === 'Listen') {
          readBtn = btn;
          break;
        }
      }
    }

    if (readBtn) {
      // Clone to remove existing event listeners
      const clone = readBtn.cloneNode(true);
      readBtn.parentNode.replaceChild(clone, readBtn);

      clone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (assistant.isPlaying) {
          assistant.stopTour();
          clone.innerHTML = `
            <svg style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Listen</span>
          `;
        } else {
          
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

          clone.innerHTML = `
            <svg style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            <span>Stop</span>
          `;
          assistant.startTour();
        }
      });
    }
  }, 300);
});

