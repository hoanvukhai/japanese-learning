import re

files = [
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Buttons
    content = content.replace('ĐÚNG (1)', 'ĐÚNG (←)')
    content = content.replace('SAI (2)', 'SAI (→)')
    content = content.replace('Chưa nhớ (1)', 'Chưa nhớ (←)')
    content = content.replace('Nhớ rồi (2)', 'Nhớ rồi (→)')
    
    # Logic in handler (remove the '1' and '2' alternatives for True/False)
    # Vocab/Kanji:
    content = content.replace("e.key === 'ArrowLeft' || e.key === '2'", "e.key === 'ArrowLeft'")
    content = content.replace("e.key === 'ArrowRight' || e.key === 'Enter' || e.key === '1'", "e.key === 'ArrowRight' || e.key === 'Enter'")
    content = content.replace("e.key === 'ArrowLeft' || e.key === '1'", "e.key === 'ArrowLeft'")
    content = content.replace("e.key === 'ArrowRight' || e.key === '2'", "e.key === 'ArrowRight'")

    # Grammar KbHints
    content = content.replace("{ key: '1', desc: 'Chưa nhớ' }, { key: '2', desc: 'Nhớ rồi' }", "{ key: '←', desc: 'Chưa nhớ' }, { key: '→', desc: 'Nhớ rồi' }")
    content = content.replace("{ key: '1', desc: 'Đúng' }, { key: '2', desc: 'Sai' }", "{ key: '←', desc: 'Đúng' }, { key: '→', desc: 'Sai' }")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Shortcuts patched")
