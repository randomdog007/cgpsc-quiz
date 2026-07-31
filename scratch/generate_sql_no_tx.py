import csv
import json

data = [
    {
        "Q(EN)": "Indravati National Park, the first national park of Chhattisgarh, was established in which of the following years?",
        "Q(HI)": "छत्तीसगढ़ का प्रथम राष्ट्रीय उद्यान, इंद्रावती राष्ट्रीय उद्यान, निम्नलिखित में से किस वर्ष स्थापित किया गया था?",
        "OptA(EN)": "1975",
        "OptA(HI)": "1975",
        "OptB(EN)": "1978",
        "OptB(HI)": "1978",
        "OptC(EN)": "1981",
        "OptC(HI)": "1981",
        "OptD(EN)": "1982",
        "OptD(HI)": "1982",
        "Correct": 2,
        "Exp(EN)": "Indravati National Park, located in the Bijapur district, was established in 1978. It is the first and oldest National Park of Chhattisgarh, covering an area of 1258 sq km.",
        "Exp(HI)": "बीजापुर जिले में स्थित इंद्रावती राष्ट्रीय उद्यान की स्थापना 1978 में हुई थी। यह 1258 वर्ग किलोमीटर क्षेत्र में फैला हुआ छत्तीसगढ़ का पहला और सबसे पुराना राष्ट्रीय उद्यान है।"
    },
    {
        "Q(EN)": "Which of the following National Parks is the largest in Chhattisgarh in terms of geographical area?",
        "Q(HI)": "भौगोलिक क्षेत्रफल की दृष्टि से छत्तीसगढ़ का सबसे बड़ा राष्ट्रीय उद्यान निम्नलिखित में से कौन सा है?",
        "OptA(EN)": "Indravati National Park",
        "OptA(HI)": "इंद्रावती राष्ट्रीय उद्यान",
        "OptB(EN)": "Kanger Valley National Park",
        "OptB(HI)": "कांगेर घाटी राष्ट्रीय उद्यान",
        "OptC(EN)": "Guru Ghasidas National Park",
        "OptC(HI)": "गुरु घासीदास राष्ट्रीय उद्यान",
        "OptD(EN)": "Sanjay Dubri National Park",
        "OptD(HI)": "संजय दुबरी राष्ट्रीय उद्यान",
        "Correct": 3,
        "Exp(EN)": "Guru Ghasidas National Park, formerly a part of Sanjay National Park, is the largest in Chhattisgarh with an area of 1441 sq km. It spans across Koriya, MCB, and Surajpur districts.",
        "Exp(HI)": "गुरु घासीदास राष्ट्रीय उद्यान (पूर्व में संजय राष्ट्रीय उद्यान का हिस्सा) 1441 वर्ग किमी क्षेत्रफल के साथ छत्तीसगढ़ का सबसे बड़ा राष्ट्रीय उद्यान है। इसका विस्तार कोरिया, एमसीबी और सूरजपुर जिलों में है।"
    },
    {
        "Q(EN)": "Consider the following statements regarding Kanger Valley National Park:\n\n1. It was established in the year 1982.\n2. It is the smallest national park in Chhattisgarh with an area of 200 sq km.\n3. It currently holds the status of a Biosphere Reserve under the MAB program.\n\nWhich of the statement(s) given above is/are correct?",
        "Q(HI)": "कांगेर घाटी राष्ट्रीय उद्यान के संबंध में निम्नलिखित कथनों पर विचार करें:\n\n1. इसकी स्थापना वर्ष 1982 में हुई थी।\n2. यह 200 वर्ग किमी क्षेत्रफल के साथ छत्तीसगढ़ का सबसे छोटा राष्ट्रीय उद्यान है।\n3. यह वर्तमान में MAB कार्यक्रम के तहत बायोस्फीयर रिजर्व का दर्जा रखता है।\n\nऊपर दिए गए कथनों में से कौन सा/से सही है/हैं?",
        "OptA(EN)": "1 and 2 only",
        "OptA(HI)": "केवल 1 और 2",
        "OptB(EN)": "2 and 3 only",
        "OptB(HI)": "केवल 2 और 3",
        "OptC(EN)": "1 and 3 only",
        "OptC(HI)": "केवल 1 और 3",
        "OptD(EN)": "1, 2, and 3",
        "OptD(HI)": "1, 2, और 3",
        "Correct": 1,
        "Exp(EN)": "Statements 1 and 2 are correct. Statement 3 is incorrect because while it was declared Asia's first biosphere reserve in 1982, it does not hold that status currently (Achanakmar is the only current Biosphere Reserve in CG).",
        "Exp(HI)": "कथन 1 और 2 सही हैं। कथन 3 गलत है क्योंकि यद्यपि इसे 1982 में एशिया का पहला बायोस्फीयर रिजर्व घोषित किया गया था, लेकिन वर्तमान में इसके पास यह दर्जा नहीं है (अचानकमार छ.ग. का एकमात्र वर्तमान बायोस्फीयर रिजर्व है)।"
    },
    {
        "Q(EN)": "Match the following protected areas with their respective districts:\n\nList-I\n(a) Indravati National Park\n(b) Guru Ghasidas National Park\n(c) Kanger Valley National Park\n(d) Achanakmar Tiger Reserve\n\nList-II\n(i) Mungeli\n(ii) Bijapur\n(iii) Bastar\n(iv) Koriya/Surajpur\n\nCodes:",
        "Q(HI)": "निम्नलिखित संरक्षित क्षेत्रों को उनके संबंधित जिलों के साथ सुमेलित करें:\n\nसूची-I\n(a) इंद्रावती राष्ट्रीय उद्यान\n(b) गुरु घासीदास राष्ट्रीय उद्यान\n(c) कांगेर घाटी राष्ट्रीय उद्यान\n(d) अचानकमार टाइगर रिजर्व\n\nसूची-II\n(i) मुंगेली\n(ii) बीजापुर\n(iii) बस्तर\n(iv) कोरिया/सूरजपुर\n\nकूट:",
        "OptA(EN)": "(a)-(ii), (b)-(iv), (c)-(i), (d)-(iii)",
        "OptA(HI)": "(a)-(ii), (b)-(iv), (c)-(i), (d)-(iii)",
        "OptB(EN)": "(a)-(iv), (b)-(ii), (c)-(iii), (d)-(i)",
        "OptB(HI)": "(a)-(iv), (b)-(ii), (c)-(iii), (d)-(i)",
        "OptC(EN)": "(a)-(ii), (b)-(iv), (c)-(iii), (d)-(i)",
        "OptC(HI)": "(a)-(ii), (b)-(iv), (c)-(iii), (d)-(i)",
        "OptD(EN)": "(a)-(iii), (b)-(i), (c)-(iv), (d)-(ii)",
        "OptD(HI)": "(a)-(iii), (b)-(i), (c)-(iv), (d)-(ii)",
        "Correct": 3,
        "Exp(EN)": "Indravati is in Bijapur, Guru Ghasidas spans Koriya/Surajpur/MCB, Kanger Valley is in Bastar, and Achanakmar is in Mungeli.",
        "Exp(HI)": "इंद्रावती बीजापुर में है, गुरु घासीदास कोरिया/सूरजपुर/एमसीबी में फैला है, कांगेर घाटी बस्तर में है, और अचानकमार मुंगेली में है।"
    },
    {
        "Q(EN)": "Assertion (A): Guru Ghasidas-Tamor Pingla has been recently notified as a new Tiger Reserve.\n\nReason (R): It has been officially declared as the 56th Tiger Reserve of India and the 4th Tiger Reserve of Chhattisgarh in 2024.\n\nCodes:",
        "Q(HI)": "कथन (A): गुरु घासीदास-तमोर पिंगला को हाल ही में एक नए टाइगर रिजर्व के रूप में अधिसूचित किया गया है।\n\nकारण (R): इसे 2024 में आधिकारिक तौर पर भारत के 56वें और छत्तीसगढ़ के चौथे टाइगर रिजर्व के रूप में घोषित किया गया है।\n\nकूट:",
        "OptA(EN)": "Both A and R are true, and R is the correct explanation of A.",
        "OptA(HI)": "A और R दोनों सत्य हैं, और R, A का सही स्पष्टीकरण है।",
        "OptB(EN)": "Both A and R are true, but R is not the correct explanation of A.",
        "OptB(HI)": "A और R दोनों सत्य हैं, लेकिन R, A का सही स्पष्टीकरण नहीं है।",
        "OptC(EN)": "A is true, but R is false.",
        "OptC(HI)": "A सत्य है, लेकिन R असत्य है।",
        "OptD(EN)": "A is false, but R is true.",
        "OptD(HI)": "A असत्य है, लेकिन R सत्य है।",
        "Correct": 1,
        "Exp(EN)": "Both statements are absolutely correct. The combination of Guru Ghasidas NP and Tamor Pingla WLS was notified as India's 56th and CG's 4th Tiger Reserve in 2024.",
        "Exp(HI)": "दोनों कथन बिल्कुल सही हैं। गुरु घासीदास राष्ट्रीय उद्यान और तमोर पिंगला अभयारण्य के संयोजन को 2024 में भारत के 56वें और छत्तीसगढ़ के चौथे टाइगर रिजर्व के रूप में अधिसूचित किया गया था।"
    },
    {
        "Q(EN)": "Arrange the National Parks of Chhattisgarh in chronological order of their establishment:\n\n1. Kanger Valley National Park\n2. Indravati National Park\n3. Guru Ghasidas National Park\n\nChoose the correct code:",
        "Q(HI)": "छत्तीसगढ़ के राष्ट्रीय उद्यानों को उनकी स्थापना के कालानुक्रमिक (समय के) क्रम में व्यवस्थित करें:\n\n1. कांगेर घाटी राष्ट्रीय उद्यान\n2. इंद्रावती राष्ट्रीय उद्यान\n3. गुरु घासीदास राष्ट्रीय उद्यान\n\nसही कूट चुनें:",
        "OptA(EN)": "2, 1, 3",
        "OptA(HI)": "2, 1, 3",
        "OptB(EN)": "3, 2, 1",
        "OptB(HI)": "3, 2, 1",
        "OptC(EN)": "1, 2, 3",
        "OptC(HI)": "1, 2, 3",
        "OptD(EN)": "2, 3, 1",
        "OptD(HI)": "2, 3, 1",
        "Correct": 4,
        "Exp(EN)": "The exact sequence is Indravati (1978) -> Guru Ghasidas (1981) -> Kanger Valley (1982). Examiners frequently test this specific chronology.",
        "Exp(HI)": "सटीक क्रम इंद्रावती (1978) -> गुरु घासीदास (1981) -> कांगेर घाटी (1982) है। परीक्षक अक्सर इस विशिष्ट कालक्रम का परीक्षण करते हैं।"
    },
    {
        "Q(EN)": "The Kutru Game Sanctuary, the only game sanctuary of Chhattisgarh, is situated within the boundaries of which National Park?",
        "Q(HI)": "छत्तीसगढ़ का एकमात्र गेम सेंचुरी, कुटरू गेम सेंचुरी, किस राष्ट्रीय उद्यान की सीमाओं के भीतर स्थित है?",
        "OptA(EN)": "Kanger Valley National Park",
        "OptA(HI)": "कांगेर घाटी राष्ट्रीय उद्यान",
        "OptB(EN)": "Indravati National Park",
        "OptB(HI)": "इंद्रावती राष्ट्रीय उद्यान",
        "OptC(EN)": "Guru Ghasidas National Park",
        "OptC(HI)": "गुरु घासीदास राष्ट्रीय उद्यान",
        "OptD(EN)": "None of the above",
        "OptD(HI)": "उपरोक्त में से कोई नहीं",
        "Correct": 2,
        "Exp(EN)": "Kutru Game Sanctuary is located within the Indravati National Park in the Bijapur district. It is the sole designated game sanctuary in the state.",
        "Exp(HI)": "कुटरू गेम सेंचुरी बीजापुर जिले में इंद्रावती राष्ट्रीय उद्यान के भीतर स्थित है। यह राज्य का एकमात्र नामित गेम सेंचुरी है।"
    },
    {
        "Q(EN)": "Which of the following protected areas is NOT a designated Tiger Reserve in Chhattisgarh?",
        "Q(HI)": "निम्नलिखित में से कौन सा संरक्षित क्षेत्र छत्तीसगढ़ में एक नामित टाइगर रिजर्व नहीं है?",
        "OptA(EN)": "Achanakmar",
        "OptA(HI)": "अचानकमार",
        "OptB(EN)": "Udanti-Sitanadi",
        "OptB(HI)": "उदंती-सीतानदी",
        "OptC(EN)": "Indravati",
        "OptC(HI)": "इंद्रावती",
        "OptD(EN)": "Kanger Valley",
        "OptD(HI)": "कांगेर घाटी",
        "Correct": 4,
        "Exp(EN)": "Chhattisgarh has 4 Tiger Reserves: Indravati, Achanakmar, Udanti-Sitanadi, and the newly formed Guru Ghasidas-Tamor Pingla. Kanger Valley is a National Park but not a Tiger Reserve.",
        "Exp(HI)": "छत्तीसगढ़ में 4 टाइगर रिजर्व हैं: इंद्रावती, अचानकमार, उदंती-सीतानदी, और नवगठित गुरु घासीदास-तमोर पिंगला। कांगेर घाटी एक राष्ट्रीय उद्यान है लेकिन टाइगर रिजर्व नहीं है।"
    },
    {
        "Q(EN)": "Match the prominent features/places with their respective National Parks:\n\nList-I\n(a) Kotumsar Cave\n(b) Kutru Game Sanctuary\n(c) Neelkanth Waterfall\n\nList-II\n(i) Guru Ghasidas NP\n(ii) Indravati NP\n(iii) Kanger Valley NP\n\nCodes:",
        "Q(HI)": "प्रमुख विशेषताओं/स्थानों को उनके संबंधित राष्ट्रीय उद्यानों के साथ सुमेलित करें:\n\nसूची-I\n(a) कुटुमसर गुफा\n(b) कुटरू गेम सेंचुरी\n(c) नीलकंठ जलप्रपात\n\nसूची-II\n(i) गुरु घासीदास राष्ट्रीय उद्यान\n(ii) इंद्रावती राष्ट्रीय उद्यान\n(iii) कांगेर घाटी राष्ट्रीय उद्यान\n\nकूट:",
        "OptA(EN)": "(a)-(iii), (b)-(ii), (c)-(i)",
        "OptA(HI)": "(a)-(iii), (b)-(ii), (c)-(i)",
        "OptB(EN)": "(a)-(ii), (b)-(iii), (c)-(i)",
        "OptB(HI)": "(a)-(ii), (b)-(iii), (c)-(i)",
        "OptC(EN)": "(a)-(iii), (b)-(i), (c)-(ii)",
        "OptC(HI)": "(a)-(iii), (b)-(i), (c)-(ii)",
        "OptD(EN)": "(a)-(i), (b)-(ii), (c)-(iii)",
        "OptD(HI)": "(a)-(i), (b)-(ii), (c)-(iii)",
        "Correct": 1,
        "Exp(EN)": "Kotumsar Cave is in Kanger Valley NP, Kutru Game Sanctuary is in Indravati NP, and Neelkanth and Chul waterfalls are in Guru Ghasidas NP.",
        "Exp(HI)": "कुटुमसर गुफा कांगेर घाटी राष्ट्रीय उद्यान में है, कुटरू गेम सेंचुरी इंद्रावती राष्ट्रीय उद्यान में है, और नीलकंठ तथा चूल जलप्रपात गुरु घासीदास राष्ट्रीय उद्यान में हैं।"
    },
    {
        "Q(EN)": "Consider the following statements regarding the Udanti-Sitanadi Tiger Reserve:\n\n1. It was granted the status of a combined Tiger Reserve in the year 2009.\n2. Sitanadi Sanctuary is located in Dhamtari, while Udanti Sanctuary is located in Gariaband.\n3. Project Tiger was initiated in these sanctuaries in 2006.\n\nWhich of the statement(s) given above is/are correct?",
        "Q(HI)": "उदंती-सीतानदी टाइगर रिजर्व के संबंध में निम्नलिखित कथनों पर विचार करें:\n\n1. इसे वर्ष 2009 में एक संयुक्त टाइगर रिजर्व का दर्जा दिया गया था।\n2. सीतानदी अभयारण्य धमतरी में स्थित है, जबकि उदंती अभयारण्य गरियाबंद में स्थित है।\n3. इन अभयारण्यों में प्रोजेक्ट टाइगर की शुरुआत 2006 में हुई थी।\n\nऊपर दिए गए कथनों में से कौन सा/से सही है/हैं?",
        "OptA(EN)": "1 and 2 only",
        "OptA(HI)": "केवल 1 और 2",
        "OptB(EN)": "2 and 3 only",
        "OptB(HI)": "केवल 2 और 3",
        "OptC(EN)": "1 and 3 only",
        "OptC(HI)": "केवल 1 और 3",
        "OptD(EN)": "1, 2, and 3",
        "OptD(HI)": "1, 2, और 3",
        "Correct": 4,
        "Exp(EN)": "All three statements are strictly correct. Sitanadi (Dhamtari) and Udanti (Gariaband) were included in Project Tiger in 2006 and officially notified as a combined Tiger Reserve in 2009.",
        "Exp(HI)": "तीनों कथन पूर्णतः सत्य हैं। सीतानदी (धमतरी) और उदंती (गरियाबंद) को 2006 में प्रोजेक्ट टाइगर में शामिल किया गया था और 2009 में आधिकारिक तौर पर संयुक्त टाइगर रिजर्व के रूप में अधिसूचित किया गया था।"
    },
    {
        "Q(EN)": "The state bird of Chhattisgarh, the Hill Myna (Pahari Myna), is primarily conserved in which of the following National Parks?",
        "Q(HI)": "छत्तीसगढ़ के राजकीय पक्षी, पहाड़ी मैना का मुख्य रूप से किस राष्ट्रीय उद्यान में संरक्षण किया जाता है?",
        "OptA(EN)": "Guru Ghasidas National Park",
        "OptA(HI)": "गुरु घासीदास राष्ट्रीय उद्यान",
        "OptB(EN)": "Kanger Valley National Park",
        "OptB(HI)": "कांगेर घाटी राष्ट्रीय उद्यान",
        "OptC(EN)": "Indravati National Park",
        "OptC(HI)": "इंद्रावती राष्ट्रीय उद्यान",
        "OptD(EN)": "Sanjay National Park",
        "OptD(HI)": "संजय राष्ट्रीय उद्यान",
        "Correct": 2,
        "Exp(EN)": "The Kanger Valley National Park in Bastar is the primary natural habitat and conservation center for the Hill Myna (Gracula religiosa peninsularis), the state bird of CG.",
        "Exp(HI)": "बस्तर में कांगेर घाटी राष्ट्रीय उद्यान, छ.ग. के राजकीय पक्षी पहाड़ी मैना (ग्रेकुला रिलिजिओसा पेनिनसुलरिस) का प्राथमिक प्राकृतिक आवास और संरक्षण केंद्र है।"
    },
    {
        "Q(EN)": "The blind fish species 'Kempii' (locally known as Shankari fish), discovered by Prof. Shankar Tiwari, is found in which specific cave of Kanger Valley National Park?",
        "Q(HI)": "प्रो. शंकर तिवारी द्वारा खोजी गई अंधी मछली की प्रजाति 'केम्पी' (स्थानीय रूप से शंकरी मछली के रूप में जानी जाती है), कांगेर घाटी राष्ट्रीय उद्यान की किस विशिष्ट गुफा में पाई जाती है?",
        "OptA(EN)": "Dandak Cave",
        "OptA(HI)": "दंडक गुफा",
        "OptB(EN)": "Kailash Cave",
        "OptB(HI)": "कैलाश गुफा",
        "OptC(EN)": "Kotumsar Cave",
        "OptC(HI)": "कुटुमसर गुफा",
        "OptD(EN)": "Aranyak Cave",
        "OptD(HI)": "अरण्यक गुफा",
        "Correct": 3,
        "Exp(EN)": "The unique blind fish 'Kempii' (Shankari fish) is found in the deep pools of the Kotumsar Cave, a prominent limestone cave within the Kanger Valley National Park.",
        "Exp(HI)": "अद्वितीय अंधी मछली 'केम्पी' (शंकरी मछली) कांगेर घाटी राष्ट्रीय उद्यान के भीतर एक प्रमुख चूना पत्थर गुफा, कुटुमसर गुफा के गहरे कुंडों में पाई जाती है।"
    },
    {
        "Q(EN)": "Consider the following pairs of National Parks and the rivers flowing through them:\n\n1. Indravati NP : Indravati River\n2. Kanger Valley NP : Kanger River\n3. Guru Ghasidas NP : Banas, Gopad, and Neyur Rivers\n\nWhich of the pairs given above are correctly matched?",
        "Q(HI)": "राष्ट्रीय उद्यानों और उनसे होकर बहने वाली नदियों के निम्नलिखित युग्मों पर विचार करें:\n\n1. इंद्रावती राष्ट्रीय उद्यान : इंद्रावती नदी\n2. कांगेर घाटी राष्ट्रीय उद्यान : कांगेर नदी\n3. गुरु घासीदास राष्ट्रीय उद्यान : बनास, गोपद और नेयुर नदियां\n\nऊपर दिए गए युग्मों में से कौन से सही सुमेलित हैं?",
        "OptA(EN)": "1 and 2 only",
        "OptA(HI)": "केवल 1 और 2",
        "OptB(EN)": "2 and 3 only",
        "OptB(HI)": "केवल 2 और 3",
        "OptC(EN)": "1 and 3 only",
        "OptC(HI)": "केवल 1 और 3",
        "OptD(EN)": "1, 2, and 3",
        "OptD(HI)": "1, 2, और 3",
        "Correct": 4,
        "Exp(EN)": "All three pairs are perfectly matched. The Banas, Gopad, and Neyur rivers are key hydrological features of the Guru Ghasidas NP in northern Chhattisgarh.",
        "Exp(HI)": "तीनों युग्म पूरी तरह से सुमेलित हैं। बनास, गोपद और नेयुर नदियां उत्तरी छत्तीसगढ़ में गुरु घासीदास राष्ट्रीय उद्यान की प्रमुख जलवैज्ञानिक विशेषताएं हैं।"
    },
    {
        "Q(EN)": "Bhaisadarha, a natural conservation site for crocodiles, is situated on which river within the Kanger Valley National Park?",
        "Q(HI)": "मगरमच्छों के लिए एक प्राकृतिक संरक्षण स्थल, भैंसादरहा, कांगेर घाटी राष्ट्रीय उद्यान के भीतर किस नदी पर स्थित है?",
        "OptA(EN)": "Sabari River",
        "OptA(HI)": "शबरी नदी",
        "OptB(EN)": "Indravati River",
        "OptB(HI)": "इंद्रावती नदी",
        "OptC(EN)": "Mungabahar River",
        "OptC(HI)": "मुनगाबहार नदी",
        "OptD(EN)": "Kanger River",
        "OptD(HI)": "कांगेर नदी",
        "Correct": 4,
        "Exp(EN)": "Bhaisadarha is a deep pool (approx 4 hectares) formed on the Kanger river within the Kanger Valley National Park where crocodiles are conserved naturally.",
        "Exp(HI)": "भैंसादरहा कांगेर घाटी राष्ट्रीय उद्यान के भीतर कांगेर नदी पर बना ഏക गहरा कुंड (लगभग 4 हेक्टेयर) है जहां मगरमच्छों का प्राकृतिक रूप से संरक्षण किया जाता है।"
    },
    {
        "Q(EN)": "Arrange the National Parks of Chhattisgarh in descending order based on their total geographical area:\n\n1. Kanger Valley National Park\n2. Guru Ghasidas National Park\n3. Indravati National Park\n\nChoose the correct sequence:",
        "Q(HI)": "छत्तीसगढ़ के राष्ट्रीय उद्यानों को उनके कुल भौगोलिक क्षेत्रफल के आधार पर अवरोही (घटते) क्रम में व्यवस्थित करें:\n\n1. कांगेर घाटी राष्ट्रीय उद्यान\n2. गुरु घासीदास राष्ट्रीय उद्यान\n3. इंद्रावती राष्ट्रीय उद्यान\n\nसही क्रम चुनें:",
        "OptA(EN)": "2, 3, 1",
        "OptA(HI)": "2, 3, 1",
        "OptB(EN)": "3, 2, 1",
        "OptB(HI)": "3, 2, 1",
        "OptC(EN)": "2, 1, 3",
        "OptC(HI)": "2, 1, 3",
        "OptD(EN)": "1, 3, 2",
        "OptD(HI)": "1, 3, 2",
        "Correct": 1,
        "Exp(EN)": "Descending order of area: Guru Ghasidas (1441 sq km) > Indravati (1258 sq km) > Kanger Valley (200 sq km).",
        "Exp(HI)": "क्षेत्रफल का अवरोही क्रम: गुरु घासीदास (1441 वर्ग किमी) > इंद्रावती (1258 वर्ग किमी) > कांगेर घाटी (200 वर्ग किमी)।"
    },
    {
        "Q(EN)": "Which of the following statements is INCORRECT regarding the Indravati National Park?",
        "Q(HI)": "इंद्रावती राष्ट्रीय उद्यान के संबंध में निम्नलिखित में से कौन सा कथन गलत है?",
        "OptA(EN)": "It was established as a National Park in 1978.",
        "OptA(HI)": "इसे 1978 में राष्ट्रीय उद्यान के रूप में स्थापित किया गया था।",
        "OptB(EN)": "It was included in Project Tiger in the year 1983.",
        "OptB(HI)": "इसे वर्ष 1983 में प्रोजेक्ट टाइगर में शामिल किया गया था।",
        "OptC(EN)": "It is the largest National Park in Chhattisgarh by area.",
        "OptC(HI)": "यह क्षेत्रफल के हिसाब से छत्तीसगढ़ का सबसे बड़ा राष्ट्रीय उद्यान है।",
        "OptD(EN)": "It forms a border with the state of Maharashtra to the west.",
        "OptD(HI)": "यह पश्चिम में महाराष्ट्र राज्य के साथ सीमा बनाता है।",
        "Correct": 3,
        "Exp(EN)": "Statement C is incorrect because Guru Ghasidas NP (1441 sq km) is the largest in Chhattisgarh, not Indravati NP (1258 sq km). All other statements are true.",
        "Exp(HI)": "कथन C गलत है क्योंकि गुरु घासीदास राष्ट्रीय उद्यान (1441 वर्ग किमी) छत्तीसगढ़ में सबसे बड़ा है, न कि इंद्रावती राष्ट्रीय उद्यान (1258 वर्ग किमी)। अन्य सभी कथन सत्य हैं।"
    },
    {
        "Q(EN)": "Which newly formed Tiger Reserve of Chhattisgarh shares its ecological landscape and borders with the Sanjay Dubri Tiger Reserve of Madhya Pradesh?",
        "Q(HI)": "छत्तीसगढ़ का कौन सा नवगठित टाइगर रिजर्व मध्य प्रदेश के संजय दुबरी टाइगर रिजर्व के साथ अपना पारिस्थितिक परिदृश्य और सीमाएं साझा करता है?",
        "OptA(EN)": "Achanakmar Tiger Reserve",
        "OptA(HI)": "अचानकमार टाइगर रिजर्व",
        "OptB(EN)": "Guru Ghasidas-Tamor Pingla Tiger Reserve",
        "OptB(HI)": "गुरु घासीदास-तमोर पिंगला टाइगर रिजर्व",
        "OptC(EN)": "Indravati Tiger Reserve",
        "OptC(HI)": "इंद्रावती टाइगर रिजर्व",
        "OptD(EN)": "Udanti-Sitanadi Tiger Reserve",
        "OptD(HI)": "उदंती-सीतानदी टाइगर रिजर्व",
        "Correct": 2,
        "Exp(EN)": "The Guru Ghasidas-Tamor Pingla Tiger Reserve in northern Chhattisgarh directly borders the Sanjay Dubri Tiger Reserve of Madhya Pradesh, forming a contiguous tiger corridor.",
        "Exp(HI)": "उत्तरी छत्तीसगढ़ में गुरु घासीदास-तमोर पिंगला टाइगर रिजर्व सीधे मध्य प्रदेश के संजय दुबरी टाइगर रिजर्व की सीमा से लगा है, जो एक सन्निहित बाघ गलियारा बनाता है।"
    },
    {
        "Q(EN)": "Consider the following statements about the Achanakmar Tiger Reserve:\n\n1. It was established as a Wildlife Sanctuary in 1975 in the Mungeli district.\n2. It was included in Project Tiger in 2006 and declared a Tiger Reserve in 2009.\n3. The Maniyari river flows through the middle of this reserve.\n\nWhich of the statement(s) given above is/are correct?",
        "Q(HI)": "अचानकमार टाइगर रिजर्व के बारे में निम्नलिखित कथनों पर विचार करें:\n\n1. इसे 1975 में मुंगेली जिले में एक वन्यजीव अभयारण्य के रूप में स्थापित किया गया था।\n2. इसे 2006 में प्रोजेक्ट टाइगर में शामिल किया गया और 2009 में टाइगर रिजर्व घोषित किया गया।\n3. मनियारी नदी इस रिजर्व के मध्य से होकर बहती है।\n\nऊपर दिए गए कथनों में से कौन सा/से सही है/हैं?",
        "OptA(EN)": "1 and 2 only",
        "OptA(HI)": "केवल 1 और 2",
        "OptB(EN)": "2 and 3 only",
        "OptB(HI)": "केवल 2 और 3",
        "OptC(EN)": "1 and 3 only",
        "OptC(HI)": "केवल 1 और 3",
        "OptD(EN)": "1, 2, and 3",
        "OptD(HI)": "1, 2, और 3",
        "Correct": 4,
        "Exp(EN)": "All statements are completely factual. Achanakmar (Mungeli, 1975) became a Project Tiger site in 2006, a TR in 2009, and the Maniyari river acts as its lifeline.",
        "Exp(HI)": "सभी कथन पूर्णतः तथ्यात्मक हैं। अचानकमार (मुंगेली, 1975) 2006 में प्रोजेक्ट टाइगर साइट बना, 2009 में टीआर बना, और मनियारी नदी इसकी जीवन रेखा के रूप में कार्य करती है।"
    },
    {
        "Q(EN)": "Which of the following National Parks was formerly a part of Madhya Pradesh's Sanjay National Park before the state reorganization in 2000?",
        "Q(HI)": "निम्नलिखित में से कौन सा राष्ट्रीय उद्यान 2000 में राज्य पुनर्गठन से पहले मध्य प्रदेश के संजय राष्ट्रीय उद्यान का हिस्सा था?",
        "OptA(EN)": "Indravati National Park",
        "OptA(HI)": "इंद्रावती राष्ट्रीय उद्यान",
        "OptB(EN)": "Kanger Valley National Park",
        "OptB(HI)": "कांगेर घाटी राष्ट्रीय उद्यान",
        "OptC(EN)": "Guru Ghasidas National Park",
        "OptC(HI)": "गुरु घासीदास राष्ट्रीय उद्यान",
        "OptD(EN)": "Kanha National Park",
        "OptD(HI)": "कान्हा राष्ट्रीय उद्यान",
        "Correct": 3,
        "Exp(EN)": "Before the formation of Chhattisgarh, Guru Ghasidas National Park was part of the undivided Sanjay National Park. Its name was changed to Guru Ghasidas in 2001.",
        "Exp(HI)": "छत्तीसगढ़ के गठन से पहले, गुरु घासीदास राष्ट्रीय उद्यान अविभाजित संजय राष्ट्रीय उद्यान का हिस्सा था। 2001 में इसका नाम बदलकर गुरु घासीदास कर दिया गया।"
    },
    {
        "Q(EN)": "Geographically, the Kanger Valley National Park extends from the Tirathgarh waterfall in the west to which river serving as the Odisha border in the east?",
        "Q(HI)": "भौगोलिक दृष्टि से, कांगेर घाटी राष्ट्रीय उद्यान पश्चिम में तीरथगढ़ जलप्रपात से लेकर पूर्व में ओडिशा सीमा के रूप में कार्य करने वाली किस नदी तक फैला हुआ है?",
        "OptA(EN)": "Kolab River",
        "OptA(HI)": "कोलाब नदी",
        "OptB(EN)": "Sabari River",
        "OptB(HI)": "शबरी नदी",
        "OptC(EN)": "Indravati River",
        "OptC(HI)": "इंद्रावती नदी",
        "OptD(EN)": "Mahanadi River",
        "OptD(HI)": "महानदी नदी",
        "Correct": 1,
        "Exp(EN)": "The Kanger Valley National Park officially extends from the Tirathgarh waterfall to the Kolab river, which demarcates the boundary with the state of Odisha in the east.",
        "Exp(HI)": "कांगेर घाटी राष्ट्रीय उद्यान आधिकारिक तौर पर तीरथगढ़ जलप्रपात से कोलाब नदी तक फैला हुआ है, जो पूर्व में ओडिशा राज्य के साथ सीमा का सीमांकन करती है।"
    }
]

quiz_id = 1294
topic_id = 1158

with open("c:/Users/bhave/cgpsc-quiz/scratch/insert_quiz.sql", "w", encoding="utf-8") as f:
    
    quiz_insert = f"INSERT INTO quizzes (id, topic_id, title, title_hi, total_questions, time_limit_mins, is_premium, difficulty, is_previous_year, description, description_hi) VALUES ({quiz_id}, {topic_id}, 'National Parks & Tiger Reserves Master Quiz', 'राष्ट्रीय उद्यान एवं टाइगर रिजर्व मास्टर क्विज़', 20, 20, 0, 'medium', 0, 'Master Chhattisgarh''s protected areas with this CGPSC Prelims quiz. Evaluate your knowledge of the state''s 3 National Parks, 4 Tiger Reserves, establishment years, areas, and unique flora/fauna.', 'इस सीजीपीएससी प्रीलिम्स क्विज़ के साथ छत्तीसगढ़ के संरक्षित क्षेत्रों पर अपनी पकड़ मजबूत करें। राज्य के 3 राष्ट्रीय उद्यानों, 4 टाइगर रिजर्व, स्थापना वर्षों, क्षेत्रफल और अद्वितीय वनस्पतियों/जीवों के अपने ज्ञान का मूल्यांकन करें।');\n\n"
    f.write(quiz_insert)
    
    for i, q in enumerate(data):
        def escape(text):
            if text is None:
                return "NULL"
            return "'" + str(text).replace("'", "''") + "'"
            
        q_en = escape(q["Q(EN)"])
        q_hi = escape(q["Q(HI)"])
        opt_a_en = escape(q["OptA(EN)"])
        opt_a_hi = escape(q["OptA(HI)"])
        opt_b_en = escape(q["OptB(EN)"])
        opt_b_hi = escape(q["OptB(HI)"])
        opt_c_en = escape(q["OptC(EN)"])
        opt_c_hi = escape(q["OptC(HI)"])
        opt_d_en = escape(q["OptD(EN)"])
        opt_d_hi = escape(q["OptD(HI)"])
        correct = q["Correct"]
        exp_en = escape(q["Exp(EN)"])
        exp_hi = escape(q["Exp(HI)"])
        sort_order = i + 1
        
        insert_stmt = f"INSERT INTO questions (quiz_id, topic_id, question, question_hi, option_a, option_a_hi, option_b, option_b_hi, option_c, option_c_hi, option_d, option_d_hi, correct_option, explanation, explanation_hi, sort_order) VALUES ({quiz_id}, {topic_id}, {q_en}, {q_hi}, {opt_a_en}, {opt_a_hi}, {opt_b_en}, {opt_b_hi}, {opt_c_en}, {opt_c_hi}, {opt_d_en}, {opt_d_hi}, {correct}, {exp_en}, {exp_hi}, {sort_order});\n"
        f.write(insert_stmt)
