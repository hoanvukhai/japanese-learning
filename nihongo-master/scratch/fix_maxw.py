import os

files = [
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('max-w-2xl', 'max-w-3xl')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixes applied.")
