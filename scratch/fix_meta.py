import json

with open('cg_kalchuri_later_quiz.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data[0]['quiz']['title'] = 'The Kalchuri Supremacy: Later Kings & Decline'
data[0]['quiz']['title_hi'] = 'कलचुरी सर्वोच्चता: परवर्ती शासक एवं पतन'
data[0]['quiz']['description'] = 'This quiz rigorously examines the later phase of the Ratanpur Kalchuris, from the "Dark Age" recovery under Baharandradeva to the Maratha invasion of 1741. It tests crucial facts surrounding Kalyan Sai\'s Jama Bandi, Raj Singh\'s succession drama, and the ultimate surrender of Raghunath Singh, strictly aligned with CGPSC Prelims standards.'
data[0]['quiz']['description_hi'] = 'यह क्विज़ रतनपुर कलचुरियों के परवर्ती चरण का कड़ाई से परीक्षण करता है, जिसमें बाहरेंद्रदेव के तहत "अंधकार युग" की वसूली से लेकर 1741 के मराठा आक्रमण तक शामिल हैं। यह सीजीपीएससी प्रारंभिक परीक्षा मानकों के साथ कड़ाई से संरेखित, कल्याण साय की जमाबंदी, राज सिंह के उत्तराधिकार नाटक और रघुनाथ सिंह के अंतिम आत्मसमर्पण से घिरे महत्वपूर्ण तथ्यों का परीक्षण करता है।'

with open('cg_kalchuri_later_quiz.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated metadata successfully.")
