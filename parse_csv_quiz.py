import csv
import json
import sys

def parse_csv(file_path, output_path, topic_id=1131):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    title_en = ""
    title_hi = ""
    desc_en = ""
    desc_hi = ""
    
    csv_start_idx = 0
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("Quiz Title:") and not line == "Quiz Title:":
            title_en = line.replace("Quiz Title:", "").strip()
        elif line.startswith("Quiz Title (English)"):
            if line == "Quiz Title (English)":
                # Next non-empty line is the title
                for j in range(i+1, len(lines)):
                    if lines[j].strip():
                        title_en = lines[j].strip()
                        break
            else:
                title_en = line.replace("Quiz Title (English)", "").replace(":", "").strip()
        elif line.startswith("क्विज़ शीर्षक:") or line.startswith("Quiz Title (Hindi):"):
            if line == "क्विज़ शीर्षक:" or line == "Quiz Title (Hindi):":
                for j in range(i+1, len(lines)):
                    if lines[j].strip():
                        title_hi = lines[j].strip()
                        break
            else:
                title_hi = line.replace("क्विज़ शीर्षक:", "").replace("Quiz Title (Hindi):", "").strip()
        elif line.startswith("Quiz Title (Hindi)"):
            if line == "Quiz Title (Hindi)":
                for j in range(i+1, len(lines)):
                    if lines[j].strip():
                        title_hi = lines[j].strip()
                        break
            else:
                title_hi = line.replace("Quiz Title (Hindi)", "").replace(":", "").strip()
        elif line.startswith("Quiz Description:") and not line == "Quiz Description:":
            desc_en = line.replace("Quiz Description:", "").strip()
        elif line.startswith("Quiz Description (English)"):
            if line == "Quiz Description (English)":
                for j in range(i+1, len(lines)):
                    if lines[j].strip():
                        desc_en = lines[j].strip()
                        break
            else:
                desc_en = line.replace("Quiz Description (English)", "").replace(":", "").strip()
        elif line.startswith("क्विज़ विवरण:") or line.startswith("Quiz Description (Hindi):"):
            if line == "क्विज़ विवरण:" or line == "Quiz Description (Hindi):":
                for j in range(i+1, len(lines)):
                    if lines[j].strip():
                        desc_hi = lines[j].strip()
                        break
            else:
                desc_hi = line.replace("क्विज़ विवरण:", "").replace("Quiz Description (Hindi):", "").strip()
        elif line.startswith("Quiz Description (Hindi)"):
            if line == "Quiz Description (Hindi)":
                for j in range(i+1, len(lines)):
                    if lines[j].strip():
                        desc_hi = lines[j].strip()
                        break
            else:
                desc_hi = line.replace("Quiz Description (Hindi)", "").replace(":", "").strip()
        elif line.startswith('"Q(EN)"') or line.startswith('Q(EN)'):
            csv_start_idx = i
            break
            
    csv_data = lines[csv_start_idx:]
    
    reader = csv.reader(csv_data)
    headers = next(reader)
    
    questions = []
    
    for row in reader:
        if len(row) < 13:
            continue
        
        q_en = row[0]
        q_hi = row[1]
        opt_a_en = row[2]
        opt_a_hi = row[3]
        opt_b_en = row[4]
        opt_b_hi = row[5]
        opt_c_en = row[6]
        opt_c_hi = row[7]
        opt_d_en = row[8]
        opt_d_hi = row[9]
        correct = int(row[10])
        exp_en = row[11]
        exp_hi = row[12]
        
        
        questions.append({
            "question": q_en,
            "question_hi": q_hi,
            "option_a": opt_a_en,
            "option_a_hi": opt_a_hi,
            "option_b": opt_b_en,
            "option_b_hi": opt_b_hi,
            "option_c": opt_c_en,
            "option_c_hi": opt_c_hi,
            "option_d": opt_d_en,
            "option_d_hi": opt_d_hi,
            "correct_option": correct,
            "explanation": exp_en,
            "explanation_hi": exp_hi
        })
        
    quiz_obj = {
        "quiz": {
            "topic_id": topic_id,
            "title": title_en,
            "title_hi": title_hi,
            "description": desc_en,
            "description_hi": desc_hi,
            "difficulty": "Medium",
            "total_questions": len(questions),
            "time_limit_mins": len(questions),
            "is_previous_year": False
        },
        "questions": questions
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump([quiz_obj], f, ensure_ascii=False, indent=2)
        
    print(f"Generated {output_path} with {len(questions)} questions for topic {topic_id}.")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        topic_id = int(sys.argv[3]) if len(sys.argv) > 3 else 1131
        parse_csv(sys.argv[1], sys.argv[2], topic_id)
    else:
        parse_csv('scratch/cg_prehistoric_csv.txt', 'cg_prehistoric_quiz.json', 1131)
