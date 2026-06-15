import os

# 1. Update GameSubject in RankSystem.ts
rank_path = r'f:\Workspace\learn-language\nihongo-master\src\lib\rankSystem.ts'
with open(rank_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace("export type GameSubject = 'vocab' | 'kanji';", "export type GameSubject = 'vocab' | 'kanji' | 'grammar';")
with open(rank_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Fix max-w-2xl -> max-w-3xl in all 3 fullrun files
files = [
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('max-w-2xl mx-auto', 'max-w-3xl mx-auto')
    
    if 'GrammarFullRun' in filepath:
        # Fix TS error for caution
        content = content.replace("<div>{(currentQ as QuizQ | FillBlankQ).caution}</div>", "{'caution' in currentQ && currentQ.caution && <div>{currentQ.caution}</div>}")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixes applied.")
