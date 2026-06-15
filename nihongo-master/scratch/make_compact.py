import re
import os

files = [
    # Vocab
    r'src/pages/Vocabulary/VocabFlashcard.tsx',
    r'src/pages/Vocabulary/VocabQuiz.tsx',
    r'src/pages/Vocabulary/VocabMatching.tsx',
    r'src/pages/Vocabulary/VocabTyping.tsx',
    r'src/pages/Vocabulary/VocabErrorDetect.tsx',
    r'src/pages/Vocabulary/VocabFullRun.tsx',
    
    # Kanji
    r'src/pages/Kanji/KanjiFlashcard.tsx',
    r'src/pages/Kanji/KanjiQuiz.tsx',
    r'src/pages/Kanji/KanjiMatching.tsx',
    r'src/pages/Kanji/KanjiTyping.tsx',
    r'src/pages/Kanji/KanjiErrorDetect.tsx',
    r'src/pages/Kanji/KanjiFullRun.tsx',
    
    # Grammar
    r'src/pages/Grammar/GrammarFlashcard.tsx',
    r'src/pages/Grammar/GrammarQuiz.tsx',
    r'src/pages/Grammar/GrammarMatching.tsx',
    r'src/pages/Grammar/GrammarFillBlank.tsx',
    r'src/pages/Grammar/GrammarErrorDetect.tsx',
    r'src/pages/Grammar/GrammarFullRun.tsx',

    # Conjugation & Keigo
    r'src/pages/Practice/ConjugationGame.tsx',
    r'src/pages/Practice/KeigoFlashcards.tsx',
    r'src/pages/Practice/KeigoQuest.tsx',
]

for relative_path in files:
    filepath = os.path.join(r'f:\Workspace\learn-language\nihongo-master', relative_path)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace min-h-screen with min-h-[calc(100vh-3.5rem)]
    content = content.replace('min-h-screen', 'min-h-[calc(100vh-3.5rem)]')

    # 2. Setup screen header adjustments: mb-8, mb-10 in back-link, title, description
    # Replace back-link margins: e.g. mb-8 transition-colors -> mb-4 transition-colors
    content = re.sub(r'mb-8(\s+transition-colors)', r'mb-4\1', content)
    content = re.sub(r'mb-8(\s+group)', r'mb-3\1', content) # conjugation game back button mb-8
    content = re.sub(r'mb-8(\s+space-y)', r'mb-4\1', content) # conjugation game header wrapper
    
    # Replace header wrapper mb-10 -> mb-4
    content = content.replace('mb-10 text-center', 'mb-4 text-center')
    content = content.replace('mb-10 flex flex-col', 'mb-4 flex flex-col')
    
    # Replace H1 font size and margin:
    # text-3xl font-extrabold mb-2 -> text-xl md:text-2xl font-extrabold mb-1
    content = content.replace('text-3xl font-extrabold mb-2', 'text-xl md:text-2xl font-bold mb-1')
    content = content.replace('text-3xl md:text-4xl font-extrabold mb-4', 'text-2xl md:text-3xl font-bold mb-2')
    
    # Replace paragraph margins:
    # mb-8 description -> mb-4
    content = re.sub(r'text-slate-500 dark:text-slate-400 mb-8', r'text-slate-500 dark:text-slate-400 mb-4', content)
    content = re.sub(r'text-slate-500 mb-8', r'text-slate-500 mb-4', content)
    
    # Replace cards padding and vertical spacing
    # space-y-6 -> space-y-4
    content = content.replace('rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6', 'rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4')
    content = content.replace('rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-8', 'rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4')
    content = content.replace('space-y-6 w-full', 'space-y-4 w-full')
    content = content.replace('space-y-8 w-full', 'space-y-4 w-full')
    content = content.replace('space-y-8 md:space-y-10', 'space-y-4 md:space-y-6')
    content = content.replace('space-y-6 md:space-y-8', 'space-y-4 md:space-y-6')
    
    # Game screen card paddings: p-8 md:p-12 -> p-5 md:p-8
    content = content.replace('p-8 md:p-12 text-center', 'p-5 md:p-8 text-center')
    content = content.replace('min-h-64 rounded-3xl p-8', 'min-h-[12rem] rounded-2xl p-5')
    content = content.replace('min-h-[300px] rounded-3xl p-6 md:p-8', 'min-h-[200px] rounded-2xl p-5')
    content = content.replace('p-10 shadow-xl max-w-sm', 'p-6 shadow-lg max-w-xs') # done screen
    
    # Done screen margins and paddings
    content = content.replace('text-6xl mb-6', 'text-5xl mb-4')
    content = content.replace('text-6xl mb-4', 'text-5xl mb-3')
    content = content.replace('my-6', 'my-3')
    content = content.replace('mb-8', 'mb-4')
    
    # Card spacing and elements margins
    content = content.replace('mb-8 overflow-hidden', 'mb-4 overflow-hidden') # Progress bar margin
    content = content.replace('mb-6', 'mb-4') # spacing in game screens
    content = content.replace('mb-4', 'mb-3')
    content = content.replace('mt-8', 'mt-4')
    content = content.replace('mt-6', 'mt-4')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Make compact script complete.")
