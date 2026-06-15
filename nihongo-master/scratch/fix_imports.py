import re
import os

base_dir = r'f:\Workspace\learn-language\nihongo-master'

# 1. Files where useEffect is used but not imported
files_need_useeffect = [
    r'src/pages/Grammar/GrammarErrorDetect.tsx',
    r'src/pages/Grammar/GrammarFillBlank.tsx',
    r'src/pages/Grammar/GrammarFlashcard.tsx',
    r'src/pages/Grammar/GrammarQuiz.tsx',
    r'src/pages/Kanji/KanjiErrorDetect.tsx',
    r'src/pages/Kanji/KanjiFlashcard.tsx',
    r'src/pages/Kanji/KanjiQuiz.tsx',
    r'src/pages/Vocabulary/VocabErrorDetect.tsx',
    r'src/pages/Vocabulary/VocabFlashcard.tsx',
]

for rel_path in files_need_useeffect:
    filepath = os.path.join(base_dir, rel_path)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse the React import line
        match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]react['\"]", content)
        if match:
            imports_str = match.group(1)
            imports = [i.strip() for i in imports_str.split(',')]
            if 'useEffect' not in imports:
                imports.append('useEffect')
                new_imports_str = ', '.join(imports)
                new_import_line = f"import {{ {new_imports_str} }} from 'react'"
                content = content[:match.start()] + new_import_line + content[match.end():]
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Added useEffect to {rel_path}")

# 2. Files where Info is imported from lucide-react but not used
files_unused_info = [
    r'src/pages/Grammar/components/GrammarError.tsx',
    r'src/pages/Grammar/components/GrammarQuiz.tsx',
    r'src/pages/Kanji/components/KanjiError.tsx',
    r'src/pages/Kanji/components/KanjiQuiz.tsx',
    r'src/pages/Kanji/components/KanjiTyping.tsx',
    r'src/pages/Vocabulary/components/VocabError.tsx',
    r'src/pages/Vocabulary/components/VocabQuiz.tsx',
    r'src/pages/Vocabulary/components/VocabTyping.tsx',
]

for rel_path in files_unused_info:
    filepath = os.path.join(base_dir, rel_path)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Remove Info, or , Info from lucide-react import
        match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"]", content)
        if match:
            imports_str = match.group(1)
            imports = [i.strip() for i in imports_str.split(',')]
            if 'Info' in imports:
                imports.remove('Info')
                new_imports_str = ', '.join(imports)
                new_import_line = f"import {{ {new_imports_str} }} from 'lucide-react'"
                content = content[:match.start()] + new_import_line + content[match.end():]
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Removed unused Info from {rel_path}")

# 3. VocabQuiz.tsx unused useEffect
filepath = os.path.join(base_dir, r'src/pages/Vocabulary/VocabQuiz.tsx')
if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]react['\"]", content)
    if match:
        imports_str = match.group(1)
        imports = [i.strip() for i in imports_str.split(',')]
        if 'useEffect' in imports:
            imports.remove('useEffect')
            new_imports_str = ', '.join(imports)
            new_import_line = f"import {{ {new_imports_str} }} from 'react'"
            content = content[:match.start()] + new_import_line + content[match.end():]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Removed unused useEffect from VocabQuiz.tsx")

# 4. KanjiCommon.tsx let skIdxFlash = 0;
filepath = os.path.join(base_dir, r'src/pages/Kanji/components/KanjiCommon.tsx')
if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('let skIdxFlash = 0;', '')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed skIdxFlash from KanjiCommon.tsx")

print("Imports fix complete.")
