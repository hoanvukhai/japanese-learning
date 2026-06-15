import re

def process_file(filepath, is_grammar=False, is_kanji=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update RankTooltip to put modifier in the list
    tooltip_orig = '''                  <div key={r.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${r.bgColor}`}>
                    <span className="text-lg">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold ${r.color}`}>{r.kanji} — {r.nameVi}</div>
                      <div className="text-xs text-slate-500">{r.minExp} EXP+</div>
                    </div>
                  </div>'''
    tooltip_new = '''                  <div key={r.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${r.bgColor}`}>
                    <span className="text-lg">{r.emoji}</span>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <div className={`text-xs font-bold ${r.color}`}>{r.kanji} — {r.nameVi}</div>
                        <div className="text-xs text-slate-500">{r.minExp} EXP+</div>
                      </div>
                      <div className={`text-xs font-black opacity-60 ${r.color}`}>
                        {r.badge}- / {r.badge} / {r.badge}+
                      </div>
                    </div>
                  </div>'''
    content = content.replace(tooltip_orig, tooltip_new)
    
    # 2. Setup screen UI consistency for best scores inside mode selection
    if 'Kỷ lục Tổng' in content:
        # First, remove the old Kỷ lục Dễ code if it exists (in VocabFullRun)
        content = re.sub(r'\{bpE > 0 && \(\s*<div className="mt-3 bg-emerald-50.+?</div>\s*\)\}', '', content, flags=re.DOTALL)
        
        setup_level_button_orig = r'''<div className="flex items-center gap-3 text-left">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black \${
                              isEasy \? 'bg-emerald-100 text-emerald-600' : isHard \? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                              \{cfg\.kanji\}
                           </div>
                           <div>
                             <div className="font-bold text-sm text-slate-800 dark:text-white">Mức \{cfg\.label\}</div>
                             <div className="text-xs text-slate-500 line-clamp-1">\{desc\}</div>
                           </div>
                        </div>'''
        
        # We need to get the records per level. The storage keys:
        # getStorageKey(type, level)
        setup_level_button_new = '''<div className="flex items-center gap-3 text-left">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                              isEasy ? 'bg-emerald-100 text-emerald-600' : isHard ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                              {cfg.kanji}
                           </div>
                           <div>
                             <div className="font-bold text-sm text-slate-800 dark:text-white">Mức {cfg.label}</div>
                             <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                           </div>
                        </div>
                        {(() => {
                           const bp = getBestExp(getStorageKey(STORAGE_TYPE, l));
                           if (bp <= 0) return null;
                           const r = getRankByExp(bp);
                           const m = getRankModifier(bp);
                           return (
                             <div className="text-right">
                               <div className="text-[10px] font-bold text-slate-400 uppercase">Kỷ lục</div>
                               <div className={`text-xs font-black ${level === l ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                 [ {r.badge}{m.modifier} ] {bp}
                               </div>
                             </div>
                           );
                        })()}'''
        
        type_str = "'grammar'" if is_grammar else ("'kanji'" if is_kanji else "'vocab'")
        content = content.replace("const BACK_PATH", f"const STORAGE_TYPE = {type_str};\nconst BACK_PATH")
        
        content = re.sub(setup_level_button_orig, setup_level_button_new, content, flags=re.DOTALL)

    # 3. Flashcard mirrored text fix
    # Replace rotateY(180deg) and preserve-3d with normal framer-motion flip
    flashcard_orig = r'''<div className="w-full aspect-\[4/3\] perspective-1000">
                  <motion\.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate=\{\{ rotateY: flashFlipped \? 180 : 0 \}\}
                    transition=\{\{ type: 'spring', stiffness: 200, damping: 20 \}\}
                    onClick=\{\(\) => \{ if \(!blitzPaused\) setFlashFlipped\(!flashFlipped\); \}\}
                  >
                    \{\/\* Front \*\/\}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
(.*?)
                    </div>
                    \{\/\* Back \*\/\}
                    <div className="absolute inset-0 backface-hidden bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-800/50 flex flex-col items-center justify-center text-center" style=\{\{ transform: 'rotateY\(180deg\)' \}\}>
(.*?)
                    </div>
                  </motion\.div>
                </div>'''

    flashcard_new = r'''<div className="w-full aspect-[4/3] perspective-1000 relative cursor-pointer" onClick={() => { if (!blitzPaused) setFlashFlipped(!flashFlipped); }}>
                  {/* Front */}
                  <motion.div
                    className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center"
                    animate={{ rotateY: flashFlipped ? -180 : 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
\1
                  </motion.div>
                  {/* Back */}
                  <motion.div
                    className="absolute inset-0 backface-hidden bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-800/50 flex flex-col items-center justify-center text-center"
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: flashFlipped ? 0 : 180 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
\2
                  </motion.div>
                </div>'''
    
    content = re.sub(flashcard_orig, flashcard_new, content, flags=re.DOTALL)

    # 4. Shortcut Hints UI
    if not is_grammar:
        # Grammar has KbHints, others might not
        pass

    # Keyboard shortcuts alignment
    # Left -> True/Chưa nhớ, Right -> False/Nhớ rồi
    if is_grammar:
        content = content.replace("e.key === '1') && flashFlipped) { e.preventDefault(); advance(false); }", "e.key === '2') && flashFlipped) { e.preventDefault(); advance(false); }")
        content = content.replace("e.key === '2') && flashFlipped) { e.preventDefault(); advance(true); }", "e.key === '1') && flashFlipped) { e.preventDefault(); advance(true); }")
        # Flashcard: 1/Left -> Chưa nhớ (False), 2/Right/Enter -> Nhớ rồi (True). Actually, let's keep Left Arrow = Chưa nhớ (Advance False), Right Arrow = Nhớ Rồi.
        content = re.sub(r"if \(\(e\.key === 'ArrowLeft' \|\| e\.key === '1'\) && flashFlipped\)", "if ((e.key === 'ArrowLeft' || e.key === '2') && flashFlipped)", content)
        content = re.sub(r"if \(\(e\.key === 'ArrowRight' \|\| e\.key === 'Enter' \|\| e\.key === '2'\) && flashFlipped\)", "if ((e.key === 'ArrowRight' || e.key === 'Enter' || e.key === '1') && flashFlipped)", content)
        content = re.sub(r"if \(e\.key\.toLowerCase\(\) === 't' \|\| e\.key === '1'\)", "if (e.key === 'ArrowLeft' || e.key === '1')", content)
        content = re.sub(r"if \(e\.key\.toLowerCase\(\) === 'f' \|\| e\.key === '2'\)", "if (e.key === 'ArrowRight' || e.key === '2')", content)
        
        # Add Up/Down support for Quiz? Wait, just keeping 1-4 is fine. The user said "chuyển hết sang phím di chuyển cho đúng sai". True/False is "đúng sai". So changing ErrorDetect to ArrowLeft/ArrowRight is what they asked for.
    else:
        # Vocab/Kanji
        # Flashcard: Left = False, Right = True
        content = content.replace("if (e.key === 'ArrowLeft' && flashFlipped) { e.preventDefault(); advance(false); }", "if ((e.key === 'ArrowLeft' || e.key === '2') && flashFlipped) { e.preventDefault(); advance(false); }")
        content = content.replace("if ((e.key === 'ArrowRight' || e.key === 'Enter') && flashFlipped) { e.preventDefault(); advance(true); }", "if ((e.key === 'ArrowRight' || e.key === 'Enter' || e.key === '1') && flashFlipped) { e.preventDefault(); advance(true); }")
        
        # Error: Right = True, Left = False --> Change to Left = True, Right = False
        content = content.replace("if (e.key === 'ArrowRight') {", "if (e.key === 'ArrowLeft' || e.key === '1') {")
        content = content.replace("if (e.key === 'ArrowLeft') {", "if (e.key === 'ArrowRight' || e.key === '2') {")
        
        # Button UI in Vocab/Kanji:
        content = content.replace("<CheckCircle2/> ĐÚNG (→)", "<CheckCircle2/> ĐÚNG (1)")
        content = content.replace("<XCircle/> SAI (←)", "<XCircle/> SAI (2)")
        content = content.replace("<CheckCircle2 className=\"w-5 h-5\"/> ĐÚNG (→)", "<CheckCircle2 className=\"w-5 h-5\"/> ĐÚNG (1)")
        content = content.replace("<XCircle className=\"w-5 h-5\"/> SAI (←)", "<XCircle className=\"w-5 h-5\"/> SAI (2)")

        # Quiz subLabel fix for Vocab/Kanji
        # Remove getMeaning(o) from subLabel in options when prompt is the other side
        if not is_kanji:
            content = content.replace("label: getJpLabel(o), subLabel: getMeaning(o)", "label: getJpLabel(o)")
            content = content.replace("label: o.hiragana, subLabel: getMeaning(o)", "label: o.hiragana")

    if is_kanji:
        # Completely remove showKana
        content = re.sub(r'const \[showKana, setShowKana\] = useState\(true\);\n?', '', content)
        content = re.sub(r'\{ key: \'kana\',    label: \'Hiển thị Hiragana\'.+?set: setShowKana \},', '', content, flags=re.DOTALL)
        content = re.sub(r'showKana && ', '', content)
        # Fix Quiz options revealing answers in Kanji (subLabel: getMeaning(o))
        content = content.replace("label: o.reading, subLabel: o.meaning", "label: o.reading")
        content = content.replace("label: o.kanji, subLabel: o.meaning", "label: o.kanji")
        
    if is_grammar:
        # Add Translation toggle
        if 'showTranslation' not in content:
            content = content.replace('const [showKana, setShowKana] = useState(true);', 'const [showKana, setShowKana] = useState(true);\n  const [showTranslation, setShowTranslation] = useState(true);')
            content = content.replace("{ key: 'kana',    label: 'Hiển thị Hiragana', desc: 'Hiện furigana trên câu hỏi', icon: <Eye size={16}/>, val: showKana, set: setShowKana },", "{ key: 'kana',    label: 'Hiển thị Hiragana', desc: 'Hiện furigana trên câu hỏi', icon: <Eye size={16}/>, val: showKana, set: setShowKana },\n                    { key: 'trans',   label: 'Hiển thị Dịch nghĩa', desc: 'Hiện tiếng Việt trong câu hỏi (nếu có)', icon: <Languages size={16}/>, val: showTranslation, set: setShowTranslation },")
            
            # Apply showTranslation to fill_blank
            content = content.replace("showKana && (currentQ as FillBlankQ).kana", "(showKana || showTranslation) && ((currentQ as FillBlankQ).kana || (currentQ as FillBlankQ).translation)")
            content = content.replace("{showKana && (currentQ as FillBlankQ).kana && <div className=\"text-sm font-medium text-slate-500 font-mono mb-2\">{(currentQ as FillBlankQ).kana}</div>}", "{((showKana && (currentQ as FillBlankQ).kana) || (showTranslation && (currentQ as FillBlankQ).translation)) && <div className=\"text-sm font-medium text-slate-500 font-mono mb-2\">{showKana && (currentQ as FillBlankQ).kana} {showKana && showTranslation && ' — '} {showTranslation && (currentQ as FillBlankQ).translation}</div>}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx', False, False)
process_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx', False, True)
process_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx', True, False)

print("Patched successfully")
