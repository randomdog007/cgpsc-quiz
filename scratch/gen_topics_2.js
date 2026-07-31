const fs = require('fs');

const topics = [
  { id: 1200, name_hi: "वन्यजीव प्रबंधन (राष्ट्रीय उद्यान और अभयारण्य)" },
  { id: 1201, name_hi: "राज्य कार्यपालिका, विधायिका, न्यायपालिका" },
  { id: 1202, name_hi: "जिला प्रशासन व्यवस्था" },
  { id: 1203, name_hi: "राजस्व प्रशासन" },
  { id: 1204, name_hi: "छत्तीसगढ़ में पंचायती राज संस्थाएं" },
  { id: 1205, name_hi: "शहरी स्थानीय निकाय (नगर निगम संरचना)" },
  { id: 1206, name_hi: "राज्य के संदर्भ में 73वां/74वां संशोधन" },
  { id: 1207, name_hi: "खनिज संसाधन - प्रकार, भंडार, उत्पादन, वितरण" },
  { id: 1208, name_hi: "ऊर्जा संसाधन (कोयला, तापीय ऊर्जा, गैर-पारंपरिक स्रोत)" },
  { id: 1209, name_hi: "औद्योगिक विकास और संरचना (बड़े, मध्यम, लघु उद्योग)" },
  { id: 1210, name_hi: "कृषि, वन और खनिज आधारित उद्योग" },
  { id: 1211, name_hi: "छत्तीसगढ़ में परिवहन के साधन" },
  { id: 1212, name_hi: "हालिया राज्य सरकार की योजनाएं और नीतियां" },
  { id: 1213, name_hi: "हालिया नियुक्तियां और पुरस्कार (राज्य स्तर)" },
  { id: 1214, name_hi: "राज्य सरकार की पहल (पिछले 1 वर्ष की)" },
  { id: 1215, name_hi: "हालिया बुनियादी ढांचा/विकास परियोजनाएं" },
  { id: 1216, name_hi: "बोधगम्यता आधारित तर्क (Comprehension-based reasoning)" },
  { id: 1217, name_hi: "प्रभावी संचार की अवधारणाएं" },
  { id: 1218, name_hi: "समरूपता / समानता आधारित प्रश्न (Analogy)" },
  { id: 1219, name_hi: "विषम छांटना (शब्द/संख्या)" },
  { id: 1220, name_hi: "विषम शब्द युग्म" },
  { id: 1221, name_hi: "कोडिंग-डिकोडिंग" },
  { id: 1222, name_hi: "रक्त संबंध (Blood Relations)" },
  { id: 1223, name_hi: "वर्णमाला परीक्षण (Alphabet Test)" },
  { id: 1224, name_hi: "श्रृंखला पूर्ण करना (संख्या/आकृति/अक्षर)" },
  { id: 1225, name_hi: "कथन और कारण" },
  { id: 1226, name_hi: "स्थिति प्रतिक्रिया परीक्षण (Situation Reaction Test)" },
  { id: 1227, name_hi: "लुप्त संख्या/शब्द प्रविष्टि" },
  { id: 1228, name_hi: "शब्दों का तार्किक विश्लेषण" },
  { id: 1229, name_hi: "आंकड़े पर्याप्तता (Data sufficiency)" },
  { id: 1230, name_hi: "पैटर्न पहचान (Pattern recognition)" },
  { id: 1231, name_hi: "स्थिति आधारित निर्णय परिदृश्य (Case-based decisions)" },
  { id: 1232, name_hi: "समस्या समाधान तकनीक (Problem-solving techniques)" },
  { id: 1233, name_hi: "पहेलियां (Puzzles)" },
  { id: 1234, name_hi: "दृश्य/आकृति तर्क (Visual reasoning)" },
  { id: 1235, name_hi: "संख्या प्रणाली और मूल अंकगणितीय संचालन" },
  { id: 1236, name_hi: "अनुपात और समानुपात" },
  { id: 1237, name_hi: "प्रतिशत, लाभ और हानि" },
  { id: 1238, name_hi: "साधारण और चक्रवृद्धि ब्याज" },
  { id: 1239, name_hi: "समय, गति और दूरी (नाव और धारा सहित)" },
  { id: 1240, name_hi: "औसत" },
  { id: 1241, name_hi: "लघुत्तम समापवर्त्य (LCM) और महत्तम समापवर्तक (HCF), गुणनखंड" },
  { id: 1242, name_hi: "वैदिक गणित तकनीकें (वर्ग, घन, मूल)" },
  { id: 1243, name_hi: "बैंकिंग गणना (बचत, सावधि जमा, आवर्ती जमा ब्याज)" },
  { id: 1244, name_hi: "आयकर गणना के मूल तत्व" },
  { id: 1245, name_hi: "भारतीय गणितज्ञ (आर्यभट्ट, ब्रह्मगुप्त, भास्कराचार्य, रामानुजन)" },
  { id: 1246, name_hi: "चार्ट और ग्राफ" },
  { id: 1247, name_hi: "सारणियां (Tables)" },
  { id: 1248, name_hi: "आंकड़े पर्याप्तता (Data Sufficiency)" },
  { id: 1249, name_hi: "सांख्यिकीय माप (माध्य, माध्यिका, बहुलक)" },
  { id: 1250, name_hi: "प्रायिकता (मूल प्रमेय)" },
  { id: 1251, name_hi: "व्याकरण के मूल तत्व (Grammar basics)" },
  { id: 1252, name_hi: "बोध (Comprehension)" },
  { id: 1253, name_hi: "मूल शब्दावली और बोध (Basic vocabulary & comprehension)" },
  { id: 1254, name_hi: "सामान्य उपयोग (Common usage)" }
];

let sql = '-- Update topics name_hi Part 2\n\n';
topics.forEach(t => {
  sql += `UPDATE topics SET name_hi = '${t.name_hi}' WHERE id = ${t.id};\n`;
});

fs.writeFileSync('C:/Users/bhave/cgpsc-quiz/scratch/update_topics_hi_2.sql', sql, 'utf8');
console.log(`Generated ${topics.length} statements.`);
