import re

with open(r'C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.system_generated\steps\354\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = [m.start() for m in re.finditer(r'##\s+\d+\.', text)]
print('Found headings:', len(matches))
with open('parsed_sections.txt', 'w', encoding='utf-8') as out:
    for idx in matches:
        chunk = text[idx:idx+2000]
        # clean JSON escapes
        cleaned = chunk.replace('\\n', '\n').replace('\\"', '"').replace('\\t', '\t')
        out.write("\n" + "="*80 + "\n")
        out.write(cleaned + "\n")

print("Saved to parsed_sections.txt")
