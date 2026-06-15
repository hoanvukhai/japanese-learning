import re
import os

def patch_record_placement(filepath, type_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace the whole level button content block
    # from <div className="flex items-center gap-3 text-left"> to })()}
    # Let's use regex.
    
    old_button_inner = r'''<div className="flex items-center gap-3 text-left">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black \${isEasy \? 'bg-emerald-100 text-emerald-600' : isHard \? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            \{cfg\.kanji\}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-white">Mức \{cfg\.label\}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">\{desc\}</div>
                          </div>
                        </div>
                        \{\(\(\) => \{
                          const bp = getBestExp\(getStorageKey\(STORAGE_TYPE, l\)\);
                          if \(bp <= 0\) return null;
                          const r = getRankByExp\(bp\);
                          const m = getRankModifier\(bp\);
                          return \(
                            <div className="text-right">
                              <div className="text-\[10px\] font-bold text-slate-400 uppercase">Kỷ lục</div>
                              <div className={`text-xs font-black \$\{level === l \? 'text-(indigo|amber)-600 dark:text-\2-400' : 'text-slate-600 dark:text-slate-400'\}`}>
                                \[ \{r\.badge\}\{m\.modifier\} \] \{bp\}
                              </div>
                            </div>
                          \);
                        \}\)\(\)\}'''

    new_button_inner = r'''<div className="flex items-center gap-3 text-left">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${isEasy ? 'bg-emerald-100 text-emerald-600' : isHard ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {cfg.kanji}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-white">Mức {cfg.label}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                            {(() => {
                              const bp = getBestExp(getStorageKey(STORAGE_TYPE, l));
                              if (bp <= 0) return null;
                              const r = getRankByExp(bp);
                              const m = getRankModifier(bp);
                              return (
                                <div className={`mt-1.5 text-xs font-black ${level === l ? 'text-\2-600 dark:text-\2-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  🏆 Kỷ lục: [ {r.badge}{m.modifier} ] {bp} EXP
                                </div>
                              );
                            })()}
                          </div>
                        </div>'''
                        
    # Try alternate spacing for Grammar/Vocab which might have slightly different spacing
    # Let's write a generic replacer.
    
    def replacer(match):
        theme_color = match.group(2) # indigo or amber
        return f'''<div className="flex items-center gap-3 text-left">
                          <div className={{`w-8 h-8 rounded-lg flex items-center justify-center font-black ${{isEasy ? 'bg-emerald-100 text-emerald-600' : isHard ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }}`}}>
                            {{cfg.kanji}}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-white">Mức {{cfg.label}}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{{desc}}</div>
                            {{(() => {{
                              const bp = getBestExp(getStorageKey(STORAGE_TYPE, l));
                              if (bp <= 0) return null;
                              const r = getRankByExp(bp);
                              const m = getRankModifier(bp);
                              return (
                                <div className={{`mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-black ${{level === l ? 'bg-{theme_color}-100 text-{theme_color}-700 dark:bg-{theme_color}-900/40 dark:text-{theme_color}-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}}`}}>
                                  🏆 Kỷ lục: [ {{r.badge}}{{m.modifier}} ] {{bp}} EXP
                                </div>
                              );
                            }})()}}
                          </div>
                        </div>'''

    content = re.sub(old_button_inner, replacer, content, flags=re.DOTALL)
    
    # Let's also handle the exact matches for Kanji
    if type_str == 'kanji':
        # restore showKana
        if 'const [showKana, setShowKana]' not in content:
            content = content.replace("const [level, setLevel] = useState<Level>('normal');", "const [level, setLevel] = useState<Level>('normal');\n  const [showKana, setShowKana] = useState(true);")
        
        if 'label: \'Hiển thị Hiragana\'' not in content:
            # We need to add back the options array!
            kanji_opts = r'''            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">Luật hỗ trợ</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm border border-slate-200 dark:border-slate-700">'''
            kanji_opts_new = r'''            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">Tuỳ chọn</label>
                <div className="space-y-2">
                  {[
                    { key: 'kana', label: 'Hiển thị Hiragana', desc: 'Hiện furigana (ẩn nếu hỏi cách đọc)', icon: <Eye size={16}/>, val: showKana, set: setShowKana },
                  ].map(t => (
                    <button key={t.key} onClick={() => t.set(!t.val)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${t.val ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                      <div className={t.val ? 'text-amber-600' : 'text-slate-400'}>{t.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-700 dark:text-white">{t.label}</div>
                        <div className="text-xs text-slate-500">{t.desc}</div>
                      </div>
                      <div className={`w-9 h-5 rounded-full relative transition-colors ${t.val ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${t.val ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">Luật hỗ trợ</label>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm border border-slate-200 dark:border-slate-700">'''
            content = content.replace(kanji_opts, kanji_opts_new)
        
        # Now add the top bar button for Kanji (it was removed)
        # Wait, the user asked to put it in setup. Do we need it in game top bar? The user didn't explicitly say top bar, but the previous setup had it in both places. Let's restore top bar toggle too.
        top_bar_target = r'''          {level === 'hard' && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map(i => (
                <motion.div key={i} animate={i <= lives ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Heart size={16} className={i <= lives ? "text-red-500 fill-red-500 drop-shadow-sm" : "text-slate-200 dark:text-slate-700"} />
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-slate-500 dark:text-slate-400 font-medium">{qIdx + 1}/{totalQ}</div>'''
        top_bar_new = r'''          {level === 'hard' && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map(i => (
                <motion.div key={i} animate={i <= lives ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Heart size={16} className={i <= lives ? "text-red-500 fill-red-500 drop-shadow-sm" : "text-slate-200 dark:text-slate-700"} />
                </motion.div>
              ))}
            </div>
          )}
          <button onClick={() => setShowKana(k => !k)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-bold transition-colors ${showKana ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
            {showKana ? <Eye size={11}/> : <EyeOff size={11}/>} かな
          </button>
          <div className="text-slate-500 dark:text-slate-400 font-medium">{qIdx + 1}/{totalQ}</div>'''
        content = content.replace(top_bar_target, top_bar_new)

        # Apply safe showKana in Quiz and Typing
        # For Quiz:
        content = content.replace("{showKana && currentQ.promptSub && <div className=\"text-sm text-slate-500 mb-2 font-mono\">{currentQ.promptSub}</div>}", "{showKana && currentQ.promptSub && currentQ.promptSub !== currentQ.options.find(o => o.id === currentQ.correctId)?.label && <div className=\"text-sm text-slate-500 mb-2 font-mono\">{currentQ.promptSub}</div>}")
        # For Typing:
        content = content.replace("{showKana && currentQ.promptSub && <div className=\"text-sm font-medium text-slate-500 mb-2\">{currentQ.promptSub}</div>}", "{showKana && currentQ.promptSub && currentQ.promptSub !== currentQ.answer && <div className=\"text-sm font-medium text-slate-500 mb-2\">{currentQ.promptSub}</div>}")
        
        # Fix MatchingMini showKana prop
        content = content.replace("showKana={false}", "showKana={showKana}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_record_placement(r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx', 'kanji')
patch_record_placement(r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx', 'vocab')
patch_record_placement(r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx', 'grammar')

print("Patched successfully")
