import re

files = [
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx',
    r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Top container flex-col on mobile
    content = content.replace(
        '<div className="flex items-center justify-between mb-8">',
        '<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">'
    )

    # 2. Global record flex-wrap
    content = content.replace(
        '<div className="flex items-center justify-center gap-1.5 text-sm">',
        '<div className="flex flex-wrap items-center justify-center gap-1.5 text-sm">'
    )

    # 3. Button overflow prevention and min-w-0
    content = content.replace(
        '<div className="flex items-center gap-3 text-left">',
        '<div className="flex items-center gap-3 text-left w-full overflow-hidden">'
    )
    
    # The right wrapper inside button. It's usually <div> right after the icon div.
    # To be safe, we'll use a regex for that specific block.
    # Pattern: 
    #   </div>
    #   <div>
    #     <div className="font-bold text-sm text-slate-800 dark:text-white">
    pattern = r'(</div>\s*)<div>(\s*<div className="font-bold text-sm text-slate-800 dark:text-white">Mức \{cfg\.label\})'
    content = re.sub(pattern, r'\1<div className="flex-1 min-w-0">\2', content)

    # 4. Button inner record flex-wrap
    # In Kanji & Vocab: className={`mt-2 text-[11px] font-medium ${level === l ...
    # In Grammar:       className={`mt-2 text-[11px] font-medium ${level === l ...
    pattern_record = r'(<div className={`mt-2 text-\[11px\] font-medium )(\$\{level === l)'
    content = re.sub(pattern_record, r'\1flex flex-wrap items-center gap-x-1 gap-y-1 \2', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Responsive patches applied.")
