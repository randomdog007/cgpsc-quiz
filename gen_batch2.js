const fs = require('fs');

const quizzes = [
  {
    fileName: "1857_causes_quiz.json",
    data: {
      "quiz": {
        "topic_id": 1021,
        "title": "Revolt of 1857 - Political, Economic & Social Causes",
        "title_hi": "1857 का विद्रोह - राजनीतिक, आर्थिक और सामाजिक कारण",
        "description": "Causes of the 1857 revolt",
        "description_hi": "1857 विद्रोह के कारण",
        "difficulty": "Moderate",
        "total_questions": 15,
        "time_limit_mins": 15,
        "is_previous_year": false
      },
      "questions": [
        {
          "question": "Which of the following was NOT a political cause of the Revolt of 1857?",
          "question_hi": "निम्नलिखित में से कौन 1857 के विद्रोह का राजनीतिक कारण नहीं था?",
          "option_a": "Doctrine of Lapse introduced by Lord Dalhousie",
          "option_b": "Annexation of Oudh on grounds of misgovernance",
          "option_c": "Abolition of titles and pensions of Indian princes",
          "option_d": "Introduction of the Ilbert Bill",
          "option_a_hi": "लॉर्ड डलहौजी द्वारा पेश की गई व्यपगत का सिद्धांत (Doctrine of Lapse)",
          "option_b_hi": "कुशासन के आधार पर अवध का विलय",
          "option_c_hi": "भारतीय राजकुमारों की उपाधियों और पेंशन का उन्मूलन",
          "option_d_hi": "इल्बर्ट बिल की शुरुआत",
          "correct_option": 4,
          "explanation": "The Ilbert Bill was introduced much later in 1883 during the viceroyalty of Lord Ripon.",
          "explanation_hi": "इल्बर्ट बिल 1883 में लॉर्ड रिपन के कार्यकाल में बहुत बाद में पेश किया गया था।"
        },
        {
          "question": "Who was the Governor-General of India during the Revolt of 1857?",
          "question_hi": "1857 के विद्रोह के समय भारत का गवर्नर-जनरल कौन था?",
          "option_a": "Lord Dalhousie", "option_b": "Lord Canning", "option_c": "Lord Wellesley", "option_d": "Lord Bentinck",
          "option_a_hi": "लॉर्ड डलहौजी", "option_b_hi": "लॉर्ड कैनिंग", "option_c_hi": "लॉर्ड वेलेस्ली", "option_d_hi": "लॉर्ड बेंटिंक",
          "correct_option": 2,
          "explanation": "Lord Canning was the Governor-General of India during the 1857 Revolt.",
          "explanation_hi": "लॉर्ड कैनिंग 1857 के विद्रोह के दौरान भारत के गवर्नर-जनरल थे।"
        },
        {
          "question": "Consider the following statements regarding the economic causes of the 1857 Revolt:\n1. Heavy taxation under new land revenue settlements impoverished the peasantry.\n2. The British policies promoted the growth of Indian traditional industries.\nWhich of the statements given above is/are correct?",
          "question_hi": "1857 के विद्रोह के आर्थिक कारणों के संबंध में निम्नलिखित कथनों पर विचार करें:\n1. नए भू-राजस्व बंदोबस्त के तहत भारी कराधान ने किसानों को गरीब बना दिया।\n2. ब्रिटिश नीतियों ने भारतीय पारंपरिक उद्योगों के विकास को बढ़ावा दिया।\nऊपर दिए गए कथनों में से कौन सा/से सही है/हैं?",
          "option_a": "1 only", "option_b": "2 only", "option_c": "Both 1 and 2", "option_d": "Neither 1 nor 2",
          "option_a_hi": "केवल 1", "option_b_hi": "केवल 2", "option_c_hi": "1 और 2 दोनों", "option_d_hi": "न तो 1 और न ही 2",
          "correct_option": 1,
          "explanation": "Statement 2 is incorrect as British policies ruined Indian traditional industries (deindustrialization).",
          "explanation_hi": "कथन 2 गलत है क्योंकि ब्रिटिश नीतियों ने भारतीय पारंपरिक उद्योगों (विऔद्योगीकरण) को नष्ट कर दिया।"
        },
        {
          "question": "Which specific Act mandated all new recruits to the Bengal Army to be ready for service anywhere, within or outside India?",
          "question_hi": "किस विशिष्ट अधिनियम ने बंगाल सेना में सभी नए रंगरूटों के लिए भारत के भीतर या बाहर कहीं भी सेवा के लिए तैयार रहने को अनिवार्य कर दिया?",
          "option_a": "Religious Disabilities Act, 1856",
          "option_b": "General Service Enlistment Act, 1856",
          "option_c": "Post Office Act, 1854",
          "option_d": "Lex Loci Act, 1850",
          "option_a_hi": "धार्मिक निर्योग्यता अधिनियम, 1856",
          "option_b_hi": "सामान्य सेवा भर्ती अधिनियम, 1856",
          "option_c_hi": "डाकघर अधिनियम, 1854",
          "option_d_hi": "लेक्स लोकी अधिनियम, 1850",
          "correct_option": 2,
          "explanation": "The General Service Enlistment Act of 1856, passed by Lord Canning, required recruits to serve overseas, conflicting with caste taboos of crossing the sea.",
          "explanation_hi": "1856 के सामान्य सेवा भर्ती अधिनियम ने समुद्र पार सेवा करना अनिवार्य कर दिया, जो समुद्र पार करने के धार्मिक प्रतिबंधों के खिलाफ था।"
        },
        {
          "question": "The introduction of which rifle was the immediate cause (spark) of the Revolt of 1857?",
          "question_hi": "किस राइफल की शुरुआत 1857 के विद्रोह का तात्कालिक कारण (चिंगारी) थी?",
          "option_a": "Brown Bess Musket", "option_b": "Enfield Rifle", "option_c": "Martini-Henry Rifle", "option_d": "Lee-Enfield Rifle",
          "option_a_hi": "ब्राउन बेस मस्कट", "option_b_hi": "एनफील्ड राइफल", "option_c_hi": "मार्टिनी-हेनरी राइफल", "option_d_hi": "ली-एनफील्ड राइफल",
          "correct_option": 2,
          "explanation": "The new Enfield Pattern 1853 rifle cartridges were rumored to be greased with cow and pig fat.",
          "explanation_hi": "नई एनफील्ड पैटर्न 1853 राइफल के कारतूसों में गाय और सूअर की चर्बी लगे होने की अफवाह थी।"
        },
        {
          "question": "Match the following policies with their authors:\nList I (Policy)\nA. Subsidiary Alliance\nB. Doctrine of Lapse\nC. Permanent Settlement\n\nList II (Author)\n1. Lord Dalhousie\n2. Lord Cornwallis\n3. Lord Wellesley",
          "question_hi": "निम्नलिखित नीतियों का उनके लेखकों से मिलान करें:\nसूची I (नीति)\nA. सहायक संधि\nB. व्यपगत का सिद्धांत\nC. स्थायी बंदोबस्त\n\nसूची II (लेखक)\n1. लॉर्ड डलहौजी\n2. लॉर्ड कॉर्नवॉलिस\n3. लॉर्ड वेलेस्ली",
          "option_a": "A-3, B-1, C-2", "option_b": "A-1, B-3, C-2", "option_c": "A-2, B-1, C-3", "option_d": "A-3, B-2, C-1",
          "option_a_hi": "A-3, B-1, C-2", "option_b_hi": "A-1, B-3, C-2", "option_c_hi": "A-2, B-1, C-3", "option_d_hi": "A-3, B-2, C-1",
          "correct_option": 1,
          "explanation": "Subsidiary Alliance (Wellesley), Doctrine of Lapse (Dalhousie), Permanent Settlement (Cornwallis).",
          "explanation_hi": "सहायक संधि (वेलेस्ली), व्यपगत का सिद्धांत (डलहौजी), स्थायी बंदोबस्त (कॉर्नवॉलिस)।"
        },
        {
          "question": "The Religious Disabilities Act of 1850 modified Hindu law by:",
          "question_hi": "1850 के धार्मिक निर्योग्यता अधिनियम ने हिंदू कानून को किस प्रकार संशोधित किया?",
          "option_a": "Banning the practice of Sati",
          "option_b": "Legalizing widow remarriage",
          "option_c": "Allowing Christian converts to inherit ancestral property",
          "option_d": "Prohibiting child marriage",
          "option_a_hi": "सती प्रथा पर प्रतिबंध लगाकर",
          "option_b_hi": "विधवा पुनर्विवाह को वैध बनाकर",
          "option_c_hi": "ईसाई धर्म अपनाने वालों को पैतृक संपत्ति प्राप्त करने की अनुमति देकर",
          "option_d_hi": "बाल विवाह पर रोक लगाकर",
          "correct_option": 3,
          "explanation": "The Act allowed converts from Hinduism to Christianity to inherit ancestral property.",
          "explanation_hi": "इस अधिनियम ने हिंदू धर्म से ईसाई धर्म अपनाने वालों को पैतृक संपत्ति प्राप्त करने की अनुमति दी।"
        },
        {
          "question": "Which of the following was annexed by Lord Dalhousie on the pretext of 'misgovernance'?",
          "question_hi": "लॉर्ड डलहौजी ने 'कुशासन' के बहाने निम्नलिखित में से किसे साम्राज्य में मिला लिया था?",
          "option_a": "Satara", "option_b": "Jhansi", "option_c": "Awadh (Oudh)", "option_d": "Nagpur",
          "option_a_hi": "सतारा", "option_b_hi": "झांसी", "option_c_hi": "अवध (Oudh)", "option_d_hi": "नागपुर",
          "correct_option": 3,
          "explanation": "Awadh was annexed in 1856 on charges of misgovernance (maladministration) under Nawab Wajid Ali Shah.",
          "explanation_hi": "अवध को 1856 में नवाब वाजिद अली शाह के शासनकाल में कुशासन के आरोप में मिला लिया गया था।"
        },
        {
          "question": "The annexation of which state created deep resentment among the sepoys of the Bengal Army, as many of them hailed from there?",
          "question_hi": "किस राज्य के विलय ने बंगाल सेना के सिपाहियों में गहरा असंतोष पैदा कर दिया, क्योंकि उनमें से कई वहां के थे?",
          "option_a": "Punjab", "option_b": "Awadh", "option_c": "Sindh", "option_d": "Bengal",
          "option_a_hi": "पंजाब", "option_b_hi": "अवध", "option_c_hi": "सिंध", "option_d_hi": "बंगाल",
          "correct_option": 2,
          "explanation": "Awadh was considered the 'nursery of the Bengal Army', and its annexation deeply affected the sepoys.",
          "explanation_hi": "अवध को 'बंगाल सेना की नर्सरी' माना जाता था, और इसके विलय ने सिपाहियों को गहराई से प्रभावित किया।"
        },
        {
          "question": "Which rumor prevalent before 1857 added to the socio-religious fears of the Indians?",
          "question_hi": "1857 से पहले प्रचलित किस अफवाह ने भारतीयों की सामाजिक-धार्मिक चिंताओं को बढ़ा दिया था?",
          "option_a": "Bone dust of cows and pigs was mixed in flour sold in markets",
          "option_b": "The British planned to forcibly convert everyone to Christianity in 10 years",
          "option_c": "New coins bore the image of Christian crosses",
          "option_d": "All of the above",
          "option_a_hi": "बाजारों में बिकने वाले आटे में गायों और सूअरों की हड्डियों का चूरा मिलाया जाता है",
          "option_b_hi": "अंग्रेजों ने 10 वर्षों में सभी को जबरन ईसाई बनाने की योजना बनाई है",
          "option_c_hi": "नए सिक्कों पर ईसाई क्रॉस की छवि थी",
          "option_d_hi": "उपरोक्त सभी",
          "correct_option": 4,
          "explanation": "All these rumors were widely circulated and added to the fear of forced Christianization.",
          "explanation_hi": "ये सभी अफवाहें व्यापक रूप से फैली हुई थीं और इससे जबरन ईसाईकरण का डर बढ़ गया था।"
        },
        {
          "question": "Who among the following was deprived of his pension by the British, leading to his participation in the Revolt of 1857?",
          "question_hi": "निम्नलिखित में से किसे अंग्रेजों ने उसकी पेंशन से वंचित कर दिया था, जिसके कारण उसने 1857 के विद्रोह में भाग लिया?",
          "option_a": "Rani Lakshmibai", "option_b": "Nana Sahib", "option_c": "Begum Hazrat Mahal", "option_d": "Kunwar Singh",
          "option_a_hi": "रानी लक्ष्मीबाई", "option_b_hi": "नाना साहब", "option_c_hi": "बेगम हजरत महल", "option_d_hi": "कुंवर सिंह",
          "correct_option": 2,
          "explanation": "Nana Sahib, the adopted son of Peshwa Baji Rao II, was denied his father's pension.",
          "explanation_hi": "नाना साहब, पेशवा बाजीराव द्वितीय के दत्तक पुत्र थे, जिन्हें उनके पिता की पेंशन देने से इनकार कर दिया गया था।"
        },
        {
          "question": "The introduction of the Post Office Act (1854) caused resentment among sepoys because:",
          "question_hi": "डाकघर अधिनियम (1854) लागू होने से सिपाहियों में आक्रोश फैल गया क्योंकि:",
          "option_a": "It banned communication in native languages",
          "option_b": "It withdrew the privilege of free postage enjoyed by sepoys",
          "option_c": "It allowed reading of personal letters by British officers",
          "option_d": "It required a loyalty oath before sending mail",
          "option_a_hi": "इसने देशी भाषाओं में संचार पर प्रतिबंध लगा दिया",
          "option_b_hi": "इसने सिपाहियों द्वारा प्राप्त मुफ्त डाक की सुविधा वापस ले ली",
          "option_c_hi": "इसने ब्रिटिश अधिकारियों को व्यक्तिगत पत्र पढ़ने की अनुमति दी",
          "option_d_hi": "मेल भेजने से पहले वफादारी की शपथ की आवश्यकता थी",
          "correct_option": 2,
          "explanation": "The Act of 1854 withdrew the privilege of free postage, which the sepoys previously enjoyed.",
          "explanation_hi": "1854 के अधिनियम ने मुफ्त डाक की सुविधा वापस ले ली, जिसका सिपाही पहले लाभ उठाते थे।"
        },
        {
          "question": "Which of the following classes largely did NOT support the Revolt of 1857?",
          "question_hi": "निम्नलिखित में से किस वर्ग ने बड़े पैमाने पर 1857 के विद्रोह का समर्थन नहीं किया?",
          "option_a": "Peasants", "option_b": "Artisans", "option_c": "English-educated middle class", "option_d": "Dispossessed Zamindars",
          "option_a_hi": "किसान", "option_b_hi": "कारीगर", "option_c_hi": "अंग्रेजी शिक्षित मध्यम वर्ग", "option_d_hi": "बेदखल ज़मींदार",
          "correct_option": 3,
          "explanation": "The English-educated middle class did not support the revolt, believing British rule would help modernize India.",
          "explanation_hi": "अंग्रेजी शिक्षित मध्यम वर्ग ने विद्रोह का समर्थन नहीं किया, उनका मानना ​​था कि ब्रिटिश शासन भारत के आधुनिकीकरण में मदद करेगा।"
        },
        {
          "question": "Dalhousie refused to recognize the adoption rights of which of the following states?\n1. Satara\n2. Jhansi\n3. Nagpur",
          "question_hi": "डलहौजी ने निम्नलिखित में से किस राज्य के गोद लेने के अधिकार को मान्यता देने से इनकार कर दिया था?\n1. सतारा\n2. झांसी\n3. नागपुर",
          "option_a": "1 and 2 only", "option_b": "2 and 3 only", "option_c": "1 and 3 only", "option_d": "1, 2, and 3",
          "option_a_hi": "केवल 1 और 2", "option_b_hi": "केवल 2 और 3", "option_c_hi": "केवल 1 और 3", "option_d_hi": "1, 2, और 3",
          "correct_option": 4,
          "explanation": "All three states were annexed under the Doctrine of Lapse after the rulers died without natural heirs.",
          "explanation_hi": "प्राकृतिक उत्तराधिकारी के बिना शासकों की मृत्यु के बाद व्यपगत सिद्धांत के तहत तीनों राज्यों पर कब्जा कर लिया गया था।"
        },
        {
          "question": "Who stated that the Revolt of 1857 was \"neither first, nor national, nor a war of independence\"?",
          "question_hi": "किसने कहा था कि 1857 का विद्रोह \"न तो पहला, न ही राष्ट्रीय, और न ही स्वतंत्रता संग्राम\" था?",
          "option_a": "V.D. Savarkar", "option_b": "R.C. Majumdar", "option_c": "S.N. Sen", "option_d": "Benjamin Disraeli",
          "option_a_hi": "वी.डी. सावरकर", "option_b_hi": "आर.सी. मजूमदार", "option_c_hi": "एस.एन. सेन", "option_d_hi": "बेंजामिन डिसरायली",
          "correct_option": 2,
          "explanation": "Historian R.C. Majumdar characterized the revolt in this manner in his book.",
          "explanation_hi": "इतिहासकार आर.सी. मजूमदार ने अपनी पुस्तक में विद्रोह को इस प्रकार चित्रित किया है।"
        }
      ]
    }
  },
  {
    fileName: "1857_course_leaders_quiz.json",
    data: {
      "quiz": {
        "topic_id": 1021,
        "title": "Revolt of 1857 - Centers & Leaders",
        "title_hi": "1857 का विद्रोह - केंद्र और नेता",
        "description": "Important centers and leaders of 1857 revolt.",
        "description_hi": "1857 के विद्रोह के महत्वपूर्ण केंद्र और नेता।",
        "difficulty": "Moderate",
        "total_questions": 10,
        "time_limit_mins": 20,
        "is_previous_year": false
      },
      "questions": [
        {
          "question": "Who was the symbolic head of the 1857 Revolt at Delhi?",
          "question_hi": "दिल्ली में 1857 के विद्रोह का प्रतीकात्मक प्रमुख कौन था?",
          "option_a": "General Bakht Khan", "option_b": "Bahadur Shah Zafar", "option_c": "Mirza Ghalib", "option_d": "Hakim Ahsanullah",
          "option_a_hi": "जनरल बख्त खान", "option_b_hi": "बहादुर शाह ज़फ़र", "option_c_hi": "मिर्ज़ा ग़ालिब", "option_d_hi": "हकीम अहसानुल्लाह",
          "correct_option": 2,
          "explanation": "The mutineers proclaimed the aging Mughal Emperor Bahadur Shah Zafar as the Emperor of India.",
          "explanation_hi": "विद्रोहियों ने वयोवृद्ध मुगल सम्राट बहादुर शाह जफर को भारत का सम्राट घोषित किया।"
        },
        {
          "question": "At Delhi, the real command of the rebel forces was in the hands of a court of soldiers headed by:",
          "question_hi": "दिल्ली में, विद्रोही ताकतों की वास्तविक कमान सैनिकों के एक दरबार के हाथों में थी, जिसके प्रमुख थे:",
          "option_a": "Tantia Tope", "option_b": "General Bakht Khan", "option_c": "Kunwar Singh", "option_d": "Azeemullah Khan",
          "option_a_hi": "तात्या टोपे", "option_b_hi": "जनरल बख्त खान", "option_c_hi": "कुंवर सिंह", "option_d_hi": "अजीमुल्ला खान",
          "correct_option": 2,
          "explanation": "While Bahadur Shah was the nominal head, the real command was with General Bakht Khan.",
          "explanation_hi": "जबकि बहादुर शाह नाममात्र के प्रमुख थे, वास्तविक कमान जनरल बख्त खान के पास थी।"
        },
        {
          "question": "Match the leaders with their respective centers of revolt:\nList I\nA. Begum Hazrat Mahal\nB. Kunwar Singh\nC. Khan Bahadur Khan\n\nList II\n1. Jagdishpur (Bihar)\n2. Bareilly\n3. Lucknow",
          "question_hi": "नेताओं को उनके विद्रोह के केंद्रों से मिलाएँ:\nसूची I\nA. बेगम हज़रत महल\nB. कुंवर सिंह\nC. खान बहादुर खान\n\nसूची II\n1. जगदीशपुर (बिहार)\n2. बरेली\n3. लखनऊ",
          "option_a": "A-3, B-1, C-2", "option_b": "A-1, B-2, C-3", "option_c": "A-3, B-2, C-1", "option_d": "A-2, B-1, C-3",
          "option_a_hi": "A-3, B-1, C-2", "option_b_hi": "A-1, B-2, C-3", "option_c_hi": "A-3, B-2, C-1", "option_d_hi": "A-2, B-1, C-3",
          "correct_option": 1,
          "explanation": "Lucknow: Begum Hazrat Mahal, Bihar: Kunwar Singh, Bareilly: Khan Bahadur Khan.",
          "explanation_hi": "लखनऊ: बेगम हजरत महल, बिहार: कुंवर सिंह, बरेली: खान बहादुर खान।"
        },
        {
          "question": "Who led the revolt in Kanpur?",
          "question_hi": "कानपुर में विद्रोह का नेतृत्व किसने किया?",
          "option_a": "Begum Hazrat Mahal", "option_b": "Nana Sahib", "option_c": "Rani Lakshmibai", "option_d": "Maulvi Ahmadullah",
          "option_a_hi": "बेगम हजरत महल", "option_b_hi": "नाना साहब", "option_c_hi": "रानी लक्ष्मीबाई", "option_d_hi": "मौलवी अहमदुल्लाह",
          "correct_option": 2,
          "explanation": "Nana Sahib, the adopted son of Baji Rao II, led the revolt in Kanpur.",
          "explanation_hi": "बाजीराव द्वितीय के दत्तक पुत्र नाना साहब ने कानपुर में विद्रोह का नेतृत्व किया।"
        },
        {
          "question": "The trusted commander of Nana Sahib, who was later betrayed by a zamindar and executed by the British, was:",
          "question_hi": "नाना साहब का विश्वसनीय सेनापति, जिसे बाद में एक ज़मींदार ने धोखा दिया और अंग्रेज़ों ने फाँसी दे दी, वह था:",
          "option_a": "Azeemullah Khan", "option_b": "Tantia Tope", "option_c": "Rao Tula Ram", "option_d": "Mangal Pandey",
          "option_a_hi": "अजीमुल्ला खान", "option_b_hi": "तात्या टोपे", "option_c_hi": "राव तुला राम", "option_d_hi": "मंगल पांडे",
          "correct_option": 2,
          "explanation": "Tantia Tope was betrayed by Mansingh (zamindar of Narwar) and hanged by the British in 1859.",
          "explanation_hi": "तात्या टोपे को मानसिंह (नरवर के जमींदार) ने धोखा दिया और 1859 में अंग्रेजों ने उन्हें फांसी दे दी।"
        },
        {
          "question": "Who was the British commanding officer who suppressed the revolt at Jhansi and fought against Rani Lakshmibai?",
          "question_hi": "वह ब्रिटिश कमांडिंग ऑफिसर कौन था जिसने झाँसी में विद्रोह को दबाया और रानी लक्ष्मीबाई के खिलाफ लड़ाई लड़ी?",
          "option_a": "Colin Campbell", "option_b": "Hugh Rose", "option_c": "John Nicholson", "option_d": "Henry Havelock",
          "option_a_hi": "कॉलिन कैंपबेल", "option_b_hi": "ह्यूग रोज़", "option_c_hi": "जॉन निकोलसन", "option_d_hi": "हेनरी हैवलॉक",
          "correct_option": 2,
          "explanation": "Sir Hugh Rose commanded the Central India Field Force and defeated Rani Lakshmibai.",
          "explanation_hi": "सर ह्यूग रोज़ ने सेंट्रल इंडिया फील्ड फोर्स की कमान संभाली और रानी लक्ष्मीबाई को हराया।"
        },
        {
          "question": "Which leader of the 1857 revolt in Faizabad was considered the most dangerous enemy by the British due to his organizing ability?",
          "question_hi": "फ़ैज़ाबाद में 1857 के विद्रोह के किस नेता को उसकी आयोजन क्षमता के कारण अंग्रेज़ सबसे खतरनाक दुश्मन मानते थे?",
          "option_a": "Liyaqat Ali", "option_b": "Maulvi Ahmadullah", "option_c": "Khan Bahadur", "option_d": "Birjis Qadir",
          "option_a_hi": "लियाकत अली", "option_b_hi": "मौलवी अहमदुल्लाह", "option_c_hi": "खान बहादुर", "option_d_hi": "बिरजिस कादिर",
          "correct_option": 2,
          "explanation": "Maulvi Ahmadullah of Faizabad was an outstanding leader. A reward of Rs 50,000 was placed on his head.",
          "explanation_hi": "फैजाबाद के मौलवी अहमदुल्ला एक उत्कृष्ट नेता थे। उनके सिर पर 50,000 रुपये का इनाम रखा गया था।"
        },
        {
          "question": "Who among the following was the leader of the revolt in Allahabad and Banaras?",
          "question_hi": "निम्नलिखित में से कौन इलाहाबाद और बनारस में विद्रोह का नेता था?",
          "option_a": "Liyaqat Ali", "option_b": "Kunwar Singh", "option_c": "Tantia Tope", "option_d": "Azeemullah Khan",
          "option_a_hi": "लियाकत अली", "option_b_hi": "कुंवर सिंह", "option_c_hi": "तात्या टोपे", "option_d_hi": "अजीमुल्ला खान",
          "correct_option": 1,
          "explanation": "Maulvi Liyaqat Ali led the revolt in Allahabad and Banaras.",
          "explanation_hi": "मौलवी लियाकत अली ने इलाहाबाद और बनारस में विद्रोह का नेतृत्व किया।"
        },
        {
          "question": "Who proclaimed Birjis Qadir as the Nawab of Awadh during the revolt?",
          "question_hi": "विद्रोह के दौरान बिरजिस कादिर को अवध का नवाब किसने घोषित किया?",
          "option_a": "Wajid Ali Shah", "option_b": "Begum Hazrat Mahal", "option_c": "Nana Sahib", "option_d": "Ahmadullah Shah",
          "option_a_hi": "वाजिद अली शाह", "option_b_hi": "बेगम हजरत महल", "option_c_hi": "नाना साहब", "option_d_hi": "अहमदुल्ला शाह",
          "correct_option": 2,
          "explanation": "Begum Hazrat Mahal proclaimed her young son, Birjis Qadir, as the Nawab of Awadh.",
          "explanation_hi": "बेगम हज़रत महल ने अपने युवा पुत्र बिरजिस कादिर को अवध का नवाब घोषित किया।"
        },
        {
          "question": "Which prominent leader from Assam was hanged by the British for participating in the 1857 revolt?",
          "question_hi": "असम के किस प्रमुख नेता को 1857 के विद्रोह में भाग लेने के लिए अंग्रेजों ने फांसी दी थी?",
          "option_a": "Maniram Dewan", "option_b": "Kandapeswar Singh", "option_c": "Surendra Sai", "option_d": "Ujjwal Sahi",
          "option_a_hi": "मनीराम दीवान", "option_b_hi": "कंदपेश्वर सिंह", "option_c_hi": "सुरेंद्र साई", "option_d_hi": "उज्ज्वल साही",
          "correct_option": 1,
          "explanation": "Maniram Dewan and Pioli Barua were hanged for plotting a rebellion in Assam in 1857.",
          "explanation_hi": "1857 में असम में विद्रोह की साजिश रचने के आरोप में मनीराम दीवान और पियोली बरुआ को फांसी दे दी गई।"
        }
      ]
    }
  },
  {
    fileName: "1857_consequences_quiz.json",
    data: {
      "quiz": {
        "topic_id": 1021,
        "title": "Revolt of 1857 - Suppression & Consequences",
        "title_hi": "1857 का विद्रोह - दमन और परिणाम",
        "description": "Consequences of the 1857 revolt.",
        "description_hi": "1857 विद्रोह के परिणाम।",
        "difficulty": "Moderate",
        "total_questions": 10,
        "time_limit_mins": 15,
        "is_previous_year": false
      },
      "questions": [
        {
          "question": "Which Act marked the end of the rule of the East India Company in India?",
          "question_hi": "किस अधिनियम ने भारत में ईस्ट इंडिया कंपनी के शासन का अंत कर दिया?",
          "option_a": "Charter Act of 1853",
          "option_b": "Government of India Act, 1858",
          "option_c": "Indian Councils Act, 1861",
          "option_d": "Regulating Act, 1773",
          "option_a_hi": "1853 का चार्टर अधिनियम",
          "option_b_hi": "भारत सरकार अधिनियम, 1858",
          "option_c_hi": "भारतीय परिषद अधिनियम, 1861",
          "option_d_hi": "विनियमन अधिनियम, 1773",
          "correct_option": 2,
          "explanation": "The Government of India Act 1858 transferred the power to govern India from the EIC to the British Crown.",
          "explanation_hi": "भारत सरकार अधिनियम 1858 ने भारत पर शासन करने की शक्ति ईआईसी से ब्रिटिश क्राउन को हस्तांतरित कर दी।"
        },
        {
          "question": "Following the 1857 revolt, the title of Governor-General was changed to:",
          "question_hi": "1857 के विद्रोह के बाद, गवर्नर-जनरल का पदनाम बदलकर क्या कर दिया गया?",
          "option_a": "Secretary of State", "option_b": "Viceroy", "option_c": "President of Board of Control", "option_d": "Chief Commissioner",
          "option_a_hi": "राज्य सचिव", "option_b_hi": "वायसराय", "option_c_hi": "नियंत्रण बोर्ड के अध्यक्ष", "option_d_hi": "मुख्य आयुक्त",
          "correct_option": 2,
          "explanation": "The Governor-General received the additional title of Viceroy, acting as the direct representative of the Crown.",
          "explanation_hi": "गवर्नर-जनरल को वायसराय का अतिरिक्त पदनाम मिला, जो क्राउन के प्रत्यक्ष प्रतिनिधि के रूप划 काम करता था।"
        },
        {
          "question": "Who was the first Viceroy of India?",
          "question_hi": "भारत का पहला वायसराय कौन था?",
          "option_a": "Lord Dalhousie", "option_b": "Lord Canning", "option_c": "Lord Elgin", "option_d": "Lord Lawrence",
          "option_a_hi": "लॉर्ड डलहौजी", "option_b_hi": "लॉर्ड कैनिंग", "option_c_hi": "लॉर्ड एल्गिन", "option_d_hi": "लॉर्ड लॉरेंस",
          "correct_option": 2,
          "explanation": "Lord Canning, the incumbent Governor-General, became the first Viceroy under the 1858 Act.",
          "explanation_hi": "लॉर्ड कैनिंग, तत्कालीन गवर्नर-जनरल, 1858 के अधिनियम के तहत पहले वायसराय बने।"
        },
        {
          "question": "The 'Peel Commission' was appointed after 1857 to:",
          "question_hi": "1857 के बाद 'पील आयोग' (Peel Commission) की नियुक्ति किसलिए की गई थी?",
          "option_a": "Investigate the causes of the revolt",
          "option_b": "Reorganize the Indian Army",
          "option_c": "Reform the land revenue system",
          "option_d": "Suggest educational reforms",
          "option_a_hi": "विद्रोह के कारणों की जांच करना",
          "option_b_hi": "भारतीय सेना का पुनर्गठन करना",
          "option_c_hi": "भू-राजस्व प्रणाली में सुधार",
          "option_d_hi": "शैक्षिक सुधारों का सुझाव देना",
          "correct_option": 2,
          "explanation": "The Peel Commission recommended the reorganization of the Indian Army, increasing the ratio of European to Indian soldiers.",
          "explanation_hi": "पील आयोग ने भारतीय सेना के पुनर्गठन की सिफारिश की, जिसमें यूरोपीय और भारतीय सैनिकों का अनुपात बढ़ाया गया।"
        },
        {
          "question": "Which of the following rulers remained loyal to the British and were described by Lord Canning as 'breakwaters to the storm'?",
          "question_hi": "निम्नलिखित में से कौन से शासक अंग्रेजों के प्रति वफादार रहे और लॉर्ड कैनिंग द्वारा 'तूफान के सामने लहर-रोधी (breakwaters)' के रूप में वर्णित किए गए?",
          "option_a": "Scindias of Gwalior and Holkars of Indore",
          "option_b": "Nizam of Hyderabad and Rajput rulers",
          "option_c": "Nawab of Bhopal and Sikh chiefs",
          "option_d": "All of the above",
          "option_a_hi": "ग्वालियर के सिंधिया और इंदौर के होल्कर",
          "option_b_hi": "हैदराबाद के निज़ाम और राजपूत शासक",
          "option_c_hi": "भोपाल के नवाब और सिख प्रमुख",
          "option_d_hi": "उपरोक्त सभी",
          "correct_option": 4,
          "explanation": "Most Indian princes and chiefs, including Scindias, Holkars, Nizam, and Rajputs, actively supported the British.",
          "explanation_hi": "सिंधिया, होल्कर, निज़ाम और राजपूतों सहित अधिकांश भारतीय राजकुमारों और प्रमुखों ने अंग्रेजों का सक्रिय समर्थन किया।"
        },
        {
          "question": "The Queen's Proclamation of 1858 was read out by Lord Canning at:",
          "question_hi": "1858 की महारानी की घोषणा (Queen's Proclamation) को लॉर्ड कैनिंग ने कहाँ पढ़कर सुनाया था?",
          "option_a": "Delhi", "option_b": "Calcutta", "option_c": "Allahabad", "option_d": "Lucknow",
          "option_a_hi": "दिल्ली", "option_b_hi": "कलकत्ता", "option_c_hi": "इलाहाबाद", "option_d_hi": "लखनऊ",
          "correct_option": 3,
          "explanation": "The Queen's Proclamation was read at a Grand Darbar in Allahabad on November 1, 1858.",
          "explanation_hi": "महारानी की घोषणा 1 नवंबर, 1858 को इलाहाबाद में एक भव्य दरबार में पढ़ी गई थी।"
        },
        {
          "question": "What was the new policy of the British towards the Indian Princely States after 1857?",
          "question_hi": "1857 के बाद भारतीय रियासतों के प्रति अंग्रेजों की नई नीति क्या थी?",
          "option_a": "To annex them at the earliest opportunity",
          "option_b": "To abandon the Doctrine of Lapse and guarantee their existence",
          "option_c": "To force them to merge with British provinces",
          "option_d": "To establish a democratic setup in the states",
          "option_a_hi": "जल्द से जल्द उन पर कब्जा करना",
          "option_b_hi": "व्यपगत के सिद्धांत को त्यागना और उनके अस्तित्व की गारंटी देना",
          "option_c_hi": "उन्हें ब्रिटिश प्रांतों में विलय के लिए मजबूर करना",
          "option_d_hi": "राज्यों में एक लोकतांत्रिक व्यवस्था स्थापित करना",
          "correct_option": 2,
          "explanation": "The Crown abandoned annexation policies and recognized the rights, dignity, and honour of native princes.",
          "explanation_hi": "क्राउन ने विलय की नीतियों को त्याग दिया और देशी राजकुमारों के अधिकारों, गरिमा और सम्मान को मान्यता दी।"
        },
        {
          "question": "Which new office was created in London by the Government of India Act 1858 to oversee Indian administration?",
          "question_hi": "भारतीय प्रशासन की देखरेख के लिए भारत सरकार अधिनियम 1858 द्वारा लंदन में कौन सा नया कार्यालय बनाया गया था?",
          "option_a": "Governor-General of India",
          "option_b": "Secretary of State for India",
          "option_c": "President of the Board of Control",
          "option_d": "High Commissioner of India",
          "option_a_hi": "भारत के गवर्नर-जनरल",
          "option_b_hi": "भारत के राज्य सचिव (Secretary of State)",
          "option_c_hi": "नियंत्रण बोर्ड के अध्यक्ष",
          "option_d_hi": "भारत के उच्चायुक्त",
          "correct_option": 2,
          "explanation": "The Secretary of State for India, a member of the British Cabinet, was appointed and assisted by a 15-member Council of India.",
          "explanation_hi": "भारत के राज्य सचिव, जो ब्रिटिश कैबिनेट के सदस्य थे, नियुक्त किए गए और उनकी सहायता के लिए 15 सदस्यीय भारतीय परिषद बनाई गई।"
        },
        {
          "question": "Which British officer successfully recaptured Delhi from the rebels in September 1857 but died from injuries sustained during the assault?",
          "question_hi": "किस ब्रिटिश अधिकारी ने सितंबर 1857 में विद्रोहियों से दिल्ली पर सफलतापूर्वक फिर से कब्जा कर लिया, लेकिन हमले के दौरान लगी चोटों से उसकी मृत्यु हो गई?",
          "option_a": "Henry Lawrence", "option_b": "John Nicholson", "option_c": "Hugh Wheeler", "option_d": "James Outram",
          "option_a_hi": "हेनरी लॉरेंस", "option_b_hi": "जॉन निकोलसन", "option_c_hi": "ह्यूग व्हीलर", "option_d_hi": "जेम्स आउटराम",
          "correct_option": 2,
          "explanation": "Brigadier-General John Nicholson led the successful assault on Delhi but died of his wounds.",
          "explanation_hi": "ब्रिगेडियर-जनरल जॉन निकोलसन ने दिल्ली पर सफल हमले का नेतृत्व किया, लेकिन घावों के कारण उनकी मृत्यु हो गई।"
        },
        {
          "question": "What happened to Mughal Emperor Bahadur Shah Zafar after the suppression of the revolt?",
          "question_hi": "विद्रोह के दमन के बाद मुगल सम्राट बहादुर शाह जफर का क्या हुआ?",
          "option_a": "He was executed at the Red Fort.",
          "option_b": "He was exiled to Rangoon (Burma).",
          "option_c": "He was restored to power as a British pensioner.",
          "option_d": "He escaped to Nepal.",
          "option_a_hi": "उन्हें लाल किले में फांसी दे दी गई।",
          "option_b_hi": "उन्हें रंगून (बर्मा) निर्वासित कर दिया गया।",
          "option_c_hi": "उन्हें ब्रिटिश पेंशनभोगी के रूप में सत्ता में बहाल किया गया।",
          "option_d_hi": "वह भाग कर नेपाल चले गए।",
          "correct_option": 2,
          "explanation": "Bahadur Shah Zafar was tried for treason, exiled to Rangoon in 1858, and died there in 1862.",
          "explanation_hi": "बहादुर शाह जफर पर राजद्रोह का मुकदमा चलाया गया, 1858 में उन्हें रंगून निर्वासित कर दिया गया, जहाँ 1862 में उनकी मृत्यु हो गई।"
        }
      ]
    }
  },
  {
    fileName: "inc_formation_quiz.json",
    data: {
      "quiz": {
        "topic_id": 1022,
        "title": "Early Phase of Indian National Congress",
        "title_hi": "भारतीय राष्ट्रीय कांग्रेस का प्रारंभिक चरण",
        "description": "Formation and early years of INC.",
        "description_hi": "INC का गठन और प्रारंभिक वर्ष।",
        "difficulty": "Moderate",
        "total_questions": 10,
        "time_limit_mins": 15,
        "is_previous_year": false
      },
      "questions": [
        {
          "question": "Who among the following was NOT associated with the formation of the Indian National Association (1876)?",
          "question_hi": "निम्नलिखित में से कौन इंडियन नेशनल एसोसिएशन (1876) के गठन से जुड़ा नहीं था?",
          "option_a": "Surendranath Banerjee", "option_b": "Ananda Mohan Bose", "option_c": "A.O. Hume", "option_d": "None of the above",
          "option_a_hi": "सुरेंद्रनाथ बनर्जी", "option_b_hi": "आनंद मोहन बोस", "option_c_hi": "ए.ओ. ह्यूम", "option_d_hi": "इनमें से कोई नहीं",
          "correct_option": 3,
          "explanation": "A.O. Hume founded the INC in 1885. The Indian Association of Calcutta was founded by S.N. Banerjee and A.M. Bose.",
          "explanation_hi": "ए.ओ. ह्यूम ने 1885 में INC की स्थापना की। कलकत्ता की इंडियन एसोसिएशन की स्थापना एस.एन. बनर्जी और ए.एम. बोस ने की थी।"
        },
        {
          "question": "Where was the first session of the Indian National Congress held in 1885?",
          "question_hi": "1885 में भारतीय राष्ट्रीय कांग्रेस का पहला अधिवेशन कहाँ आयोजित किया गया था?",
          "option_a": "Calcutta", "option_b": "Madras", "option_c": "Bombay", "option_d": "Poona",
          "option_a_hi": "कलकत्ता", "option_b_hi": "मद्रास", "option_c_hi": "बंबई (Bombay)", "option_d_hi": "पूना",
          "correct_option": 3,
          "explanation": "The first session was held at Gokuldas Tejpal Sanskrit College, Bombay. It was originally scheduled for Poona but shifted due to cholera.",
          "explanation_hi": "पहला अधिवेशन गोकुलदास तेजपाल संस्कृत कॉलेज, बंबई में आयोजित किया गया था। इसे मूल रूप से पूना में आयोजित होना था, लेकिन हैजा फैलने के कारण स्थानांतरित कर दिया गया।"
        },
        {
          "question": "Who was the first President of the Indian National Congress?",
          "question_hi": "भारतीय राष्ट्रीय कांग्रेस के प्रथम अध्यक्ष कौन थे?",
          "option_a": "A.O. Hume", "option_b": "W.C. Bonnerjee", "option_c": "Dadabhai Naoroji", "option_d": "Badruddin Tyabji",
          "option_a_hi": "ए.ओ. ह्यूम", "option_b_hi": "डब्ल्यू.सी. बनर्जी", "option_c_hi": "दादाभाई नौरोजी", "option_d_hi": "बदरुद्दीन तैयबजी",
          "correct_option": 2,
          "explanation": "Womesh Chandra Bonnerjee (W.C. Bonnerjee) presided over the first session of INC in 1885.",
          "explanation_hi": "व्योमेश चंद्र बनर्जी (डब्ल्यू.सी. बनर्जी) ने 1885 में INC के पहले सत्र की अध्यक्षता की।"
        },
        {
          "question": "Who was the Viceroy of India when the Indian National Congress was founded?",
          "question_hi": "जब भारतीय राष्ट्रीय कांग्रेस की स्थापना हुई, तब भारत का वायसराय कौन था?",
          "option_a": "Lord Lytton", "option_b": "Lord Ripon", "option_c": "Lord Dufferin", "option_d": "Lord Curzon",
          "option_a_hi": "लॉर्ड लिटन", "option_b_hi": "लॉर्ड रिपन", "option_c_hi": "लॉर्ड डफरिन", "option_d_hi": "लॉर्ड कर्जन",
          "correct_option": 3,
          "explanation": "Lord Dufferin was the Viceroy (1884-1888) during the formation of INC.",
          "explanation_hi": "लॉर्ड डफरिन INC के गठन के दौरान वायसराय (1884-1888) थे।"
        },
        {
          "question": "Which theory suggests that the INC was founded with the blessing of Viceroy Dufferin to act as an outlet for Indian discontent?",
          "question_hi": "कौन सा सिद्धांत बताता है कि INC की स्थापना वायसराय डफरिन के आशीर्वाद से भारतीय असंतोष के लिए एक आउटलेट के रूप में कार्य करने के लिए की गई थी?",
          "option_a": "Drain Theory", "option_b": "Safety Valve Theory", "option_c": "Conspiracy Theory", "option_d": "Lightning Conductor Theory",
          "option_a_hi": "धन निकासी सिद्धांत (Drain Theory)", "option_b_hi": "सुरक्षा वाल्व सिद्धांत (Safety Valve Theory)", "option_c_hi": "साजिश का सिद्धांत", "option_d_hi": "लाइटनिंग कंडक्टर थ्योरी",
          "correct_option": 2,
          "explanation": "The 'Safety Valve Theory', popularized by Lala Lajpat Rai, suggested Hume founded the INC to prevent another mass revolt like 1857.",
          "explanation_hi": "लाला लाजपत राय द्वारा लोकप्रिय 'सेफ्टी वाल्व थ्योरी' ने सुझाव दिया कि ह्यूम ने 1857 जैसे एक और बड़े विद्रोह को रोकने के लिए INC की स्थापना की।"
        },
        {
          "question": "Who propounded the 'Lightning Conductor' theory regarding the formation of the INC?",
          "question_hi": "INC के गठन के संबंध में 'लाइटनिंग कंडक्टर' (Lightning Conductor) सिद्धांत किसने प्रतिपादित किया?",
          "option_a": "Gopal Krishna Gokhale", "option_b": "Bal Gangadhar Tilak", "option_c": "Bipin Chandra Pal", "option_d": "A.O. Hume",
          "option_a_hi": "गोपाल कृष्ण गोखले", "option_b_hi": "बाल गंगाधर तिलक", "option_c_hi": "बिपिन चंद्र पाल", "option_d_hi": "ए.ओ. ह्यूम",
          "correct_option": 1,
          "explanation": "Gokhale argued that Indian leaders used Hume as a 'lightning conductor' to avoid official suppression of the new organization.",
          "explanation_hi": "गोखले ने तर्क दिया कि भारतीय नेताओं ने ह्यूम का उपयोग एक 'लाइटनिंग कंडक्टर' के रूप में किया ताकि नए संगठन के आधिकारिक दमन से बचा जा सके।"
        },
        {
          "question": "Who was the first Muslim President of the Indian National Congress?",
          "question_hi": "भारतीय राष्ट्रीय कांग्रेस के पहले मुस्लिम अध्यक्ष कौन थे?",
          "option_a": "Abul Kalam Azad", "option_b": "Badruddin Tyabji", "option_c": "Syed Ahmad Khan", "option_d": "Nawab Syed Muhammad Bahadur",
          "option_a_hi": "अबुल कलाम आजाद", "option_b_hi": "बदरुद्दीन तैयबजी", "option_c_hi": "सैयद अहमद खान", "option_d_hi": "नवाब सैयद मुहम्मद बहादुर",
          "correct_option": 2,
          "explanation": "Badruddin Tyabji presided over the third session of the INC in Madras (1887).",
          "explanation_hi": "बदरुद्दीन तैयबजी ने मद्रास (1887) में INC के तीसरे सत्र की अध्यक्षता की।"
        },
        {
          "question": "The Moderate Phase of the Indian National Congress roughly corresponds to which period?",
          "question_hi": "भारतीय राष्ट्रीय कांग्रेस का उदारवादी चरण (Moderate Phase) मोटे तौर पर किस अवधि से मेल खाता है?",
          "option_a": "1885 - 1905", "option_b": "1905 - 1919", "option_c": "1919 - 1947", "option_d": "1857 - 1885",
          "option_a_hi": "1885 - 1905", "option_b_hi": "1905 - 1919", "option_c_hi": "1919 - 1947", "option_d_hi": "1857 - 1885",
          "correct_option": 1,
          "explanation": "The early phase from 1885 to 1905 was dominated by Moderates who believed in constitutional methods.",
          "explanation_hi": "1885 से 1905 तक के प्रारंभिक चरण में उदारवादियों का वर्चस्व था जो संवैधानिक तरीकों में विश्वास करते थे।"
        },
        {
          "question": "Which of the following was NOT a demand of the Moderates?",
          "question_hi": "निम्नलिखित में से कौन उदारवादियों की मांग नहीं थी?",
          "option_a": "Expansion of legislative councils",
          "option_b": "Indianization of higher civil services",
          "option_c": "Complete Independence (Purna Swaraj)",
          "option_d": "Reduction in military expenditure",
          "option_a_hi": "विधान परिषदों का विस्तार",
          "option_b_hi": "उच्च सिविल सेवाओं का भारतीयकरण",
          "option_c_hi": "पूर्ण स्वतंत्रता (पूर्ण स्वराज)",
          "option_d_hi": "सैन्य व्यय में कमी",
          "correct_option": 3,
          "explanation": "Complete Independence was not demanded by Moderates. They sought self-government within the British Empire.",
          "explanation_hi": "उदारवादियों ने पूर्ण स्वतंत्रता की मांग नहीं की थी। वे ब्रिटिश साम्राज्य के भीतर स्वशासन चाहते थे।"
        },
        {
          "question": "Who authored the book 'Poverty and Un-British Rule in India'?",
          "question_hi": "'पॉवर्टी एंड अन-ब्रिटिश रूल इन इंडिया' पुस्तक के लेखक कौन हैं?",
          "option_a": "R.C. Dutt", "option_b": "Dadabhai Naoroji", "option_c": "Dinshaw Wacha", "option_d": "M.G. Ranade",
          "option_a_hi": "आर.सी. दत्त", "option_b_hi": "दादाभाई नौरोजी", "option_c_hi": "दिनशॉ वाचा", "option_d_hi": "एम.जी. रानाडे",
          "correct_option": 2,
          "explanation": "Dadabhai Naoroji formulated the 'Drain of Wealth' theory in this seminal book.",
          "explanation_hi": "दादाभाई नौरोजी ने इस ऐतिहासिक पुस्तक में 'धन निकासी (Drain of Wealth)' के सिद्धांत को प्रतिपादित किया।"
        }
      ]
    }
  },
  {
    fileName: "partition_swadeshi_quiz.json",
    data: {
      "quiz": {
        "topic_id": 1023,
        "title": "Partition of Bengal & Swadeshi Movement",
        "title_hi": "बंगाल का विभाजन और स्वदेशी आंदोलन",
        "description": "Swadeshi movement and Partition of Bengal.",
        "description_hi": "स्वदेशी आंदोलन और बंगाल का विभाजन।",
        "difficulty": "Moderate",
        "total_questions": 10,
        "time_limit_mins": 15,
        "is_previous_year": false
      },
      "questions": [
        {
          "question": "The decision to partition Bengal was officially announced in which year?",
          "question_hi": "बंगाल विभाजन के निर्णय की आधिकारिक घोषणा किस वर्ष की गई थी?",
          "option_a": "1903", "option_b": "1904", "option_c": "1905", "option_d": "1906",
          "option_a_hi": "1903", "option_b_hi": "1904", "option_c_hi": "1905", "option_d_hi": "1906",
          "correct_option": 3,
          "explanation": "The official announcement was made on 19 July 1905, and partition came into effect on 16 October 1905.",
          "explanation_hi": "आधिकारिक घोषणा 19 जुलाई 1905 को की गई थी, और विभाजन 16 अक्टूबर 1905 को प्रभावी हुआ।"
        },
        {
          "question": "Who was the Viceroy of India when Bengal was partitioned?",
          "question_hi": "बंगाल विभाजन के समय भारत का वायसराय कौन था?",
          "option_a": "Lord Minto", "option_b": "Lord Hardinge", "option_c": "Lord Curzon", "option_d": "Lord Chelmsford",
          "option_a_hi": "लॉर्ड मिंटो", "option_b_hi": "लॉर्ड हार्डिंग", "option_c_hi": "लॉर्ड कर्जन", "option_d_hi": "लॉर्ड चेम्सफोर्ड",
          "correct_option": 3,
          "explanation": "Lord Curzon partitioned Bengal on the pretext of administrative convenience.",
          "explanation_hi": "लॉर्ड कर्जन ने प्रशासनिक सुविधा के बहाने बंगाल का विभाजन किया।"
        },
        {
          "question": "The formal proclamation of the Swadeshi Movement was made on 7 August 1905 at a meeting held in:",
          "question_hi": "स्वदेशी आंदोलन की औपचारिक घोषणा 7 अगस्त 1905 को कहाँ आयोजित एक बैठक में की गई थी?",
          "option_a": "Wellington Square, Calcutta", "option_b": "Town Hall, Calcutta", "option_c": "Dhaka", "option_d": "Surat",
          "option_a_hi": "वेलिंगटन स्क्वायर, कलकत्ता", "option_b_hi": "टाउन हॉल, कलकत्ता", "option_c_hi": "ढाका", "option_d_hi": "सूरत",
          "correct_option": 2,
          "explanation": "The Swadeshi Movement was officially launched from the Calcutta Town Hall.",
          "explanation_hi": "स्वदेशी आंदोलन आधिकारिक तौर पर कलकत्ता टाउन हॉल से शुरू किया गया था।"
        },
        {
          "question": "Who among the following was the principal author of the song 'Amar Sonar Bangla', composed during the Swadeshi Movement?",
          "question_hi": "स्वदेशी आंदोलन के दौरान रचित गीत 'आमार सोनार बांग्ला' के प्रमुख लेखक कौन थे?",
          "option_a": "Bankim Chandra Chatterjee", "option_b": "Rabindranath Tagore", "option_c": "Dwijendralal Ray", "option_d": "Mukunda Das",
          "option_a_hi": "बंकिम चंद्र चटर्जी", "option_b_hi": "रवींद्रनाथ टैगोर", "option_c_hi": "द्विजेंद्रलाल रॉय", "option_d_hi": "मुकुंद दास",
          "correct_option": 2,
          "explanation": "Rabindranath Tagore composed 'Amar Sonar Bangla' to inspire the people. It later became the national anthem of Bangladesh.",
          "explanation_hi": "रवींद्रनाथ टैगोर ने लोगों को प्रेरित करने के लिए 'आमार सोनार बांग्ला' की रचना की। यह बाद में बांग्लादेश का राष्ट्रगान बना।"
        },
        {
          "question": "What did Rabindranath Tagore suggest observing the day of partition (16 October 1905) as?",
          "question_hi": "रवींद्रनाथ टैगोर ने विभाजन के दिन (16 अक्टूबर 1905) को किस रूप में मनाने का सुझाव दिया?",
          "option_a": "Black Day", "option_b": "Raksha Bandhan Day", "option_c": "Swadeshi Day", "option_d": "Martyrs' Day",
          "option_a_hi": "काला दिन", "option_b_hi": "रक्षा बंधन दिवस", "option_c_hi": "स्वदेशी दिवस", "option_d_hi": "शहीद दिवस",
          "correct_option": 2,
          "explanation": "Tagore suggested observing it as a day of Raksha Bandhan to symbolize the unbroken unity of Bengal.",
          "explanation_hi": "टैगोर ने इसे बंगाल की अटूट एकता के प्रतीक के रूप में रक्षा बंधन के दिन के रूप में मनाने का सुझाव दिया।"
        },
        {
          "question": "Who set up the 'Swadesh Bandhab Samiti' to mobilize the masses in Barisal during the movement?",
          "question_hi": "आंदोलन के दौरान बारीसाल में जनता को संगठित करने के लिए 'स्वदेश बांधव समिति' की स्थापना किसने की?",
          "option_a": "Aurobindo Ghosh", "option_b": "Bipin Chandra Pal", "option_c": "Ashwini Kumar Dutt", "option_d": "Surendranath Banerjee",
          "option_a_hi": "अरबिंदो घोष", "option_b_hi": "बिपिन चंद्र पाल", "option_c_hi": "अश्विनी कुमार दत्त", "option_d_hi": "सुरेंद्रनाथ बनर्जी",
          "correct_option": 3,
          "explanation": "Ashwini Kumar Dutt, a prominent school teacher, organized the Swadesh Bandhab Samiti.",
          "explanation_hi": "एक प्रमुख स्कूल शिक्षक अश्विनी कुमार दत्त ने स्वदेश बांधव समिति का आयोजन किया।"
        },
        {
          "question": "Which prominent leader led the Swadeshi Movement in Madras?",
          "question_hi": "मद्रास में स्वदेशी आंदोलन का नेतृत्व किस प्रमुख नेता ने किया?",
          "option_a": "Bal Gangadhar Tilak", "option_b": "Lala Lajpat Rai", "option_c": "Chidambaram Pillai", "option_d": "Syed Haider Raza",
          "option_a_hi": "बाल गंगाधर तिलक", "option_b_hi": "लाला लाजपत राय", "option_c_hi": "चिदंबरम पिल्लई", "option_d_hi": "सैयद हैदर रज़ा",
          "correct_option": 3,
          "explanation": "V.O. Chidambaram Pillai led the movement in Madras and even founded the Swadeshi Steam Navigation Company.",
          "explanation_hi": "वी.ओ. चिदंबरम पिल्लई ने मद्रास में आंदोलन का नेतृत्व किया और स्वदेशी स्टीम नेविगेशन कंपनी की स्थापना भी की।"
        },
        {
          "question": "The National Council of Education was set up in 1906 under the leadership of:",
          "question_hi": "राष्ट्रीय शिक्षा परिषद (National Council of Education) की स्थापना 1906 में किसके नेतृत्व में की गई थी?",
          "option_a": "Satish Chandra Mukherjee", "option_b": "Aurobindo Ghosh", "option_c": "Rabindranath Tagore", "option_d": "Ananda Mohan Bose",
          "option_a_hi": "सतीश चंद्र मुखर्जी", "option_b_hi": "अरबिंदो घोष", "option_c_hi": "रवींद्रनाथ टैगोर", "option_d_hi": "आनंद मोहन बोस",
          "correct_option": 1,
          "explanation": "Satish Chandra Mukherjee was instrumental in setting up the National Council of Education to organize a system of education on national lines.",
          "explanation_hi": "सतीश चंद्र मुखर्जी ने राष्ट्रीय स्तर पर शिक्षा प्रणाली को व्यवस्थित करने के लिए राष्ट्रीय शिक्षा परिषद की स्थापना में महत्वपूर्ण भूमिका निभाई।"
        },
        {
          "question": "The Partition of Bengal was finally annulled in which year?",
          "question_hi": "बंगाल का विभाजन अंततः किस वर्ष रद्द किया गया था?",
          "option_a": "1909", "option_b": "1911", "option_c": "1914", "option_d": "1916",
          "option_a_hi": "1909", "option_b_hi": "1911", "option_c_hi": "1914", "option_d_hi": "1916",
          "correct_option": 2,
          "explanation": "The partition was annulled in 1911 by Lord Hardinge at the Delhi Durbar, to curb the revolutionary menace.",
          "explanation_hi": "क्रांतिकारी खतरे पर अंकुश लगाने के लिए दिल्ली दरबार में लॉर्ड हार्डिंग द्वारा 1911 में विभाजन को रद्द कर दिया गया था।"
        },
        {
          "question": "Consider the following statements regarding the Swadeshi Movement:\n1. It was the first time that women participated in large numbers in the national movement.\n2. The movement garnered overwhelming support from the Muslim peasantry in Bengal.\nWhich is correct?",
          "question_hi": "स्वदेशी आंदोलन के संबंध में निम्नलिखित कथनों पर विचार करें:\n1. यह पहली बार था जब महिलाओं ने राष्ट्रीय आंदोलन में बड़ी संख्या में भाग लिया।\n2. आंदोलन को बंगाल में मुस्लिम किसानों का भारी समर्थन मिला।\nकौन सा सही है?",
          "option_a": "1 only", "option_b": "2 only", "option_c": "Both 1 and 2", "option_d": "Neither 1 nor 2",
          "option_a_hi": "केवल 1", "option_b_hi": "केवल 2", "option_c_hi": "1 और 2 दोनों", "option_d_hi": "न तो 1 और न ही 2",
          "correct_option": 1,
          "explanation": "Statement 2 is wrong; the British successfully employed a divide and rule policy, and the movement failed to draw massive support from Muslim peasants.",
          "explanation_hi": "कथन 2 गलत है; अंग्रेजों ने फूट डालो और राज करो की नीति को सफलतापूर्वक नियोजित किया, और आंदोलन मुस्लिम किसानों से भारी समर्थन प्राप्त करने में विफल रहा।"
        }
      ]
    }
  }
];

async function insertAll() {
  for (const q of quizzes) {
    fs.writeFileSync(q.fileName, JSON.stringify(q.data, null, 2));
  }
}
insertAll();
