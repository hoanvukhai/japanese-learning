import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove RankTooltip multiplier text
    tooltip_regex = r'<div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-\[11px\] text-slate-500 dark:text-slate-400 space-y-1\.5">.*?</div>\s*</div>'
    content = re.sub(tooltip_regex, '', content, flags=re.DOTALL)

    # 2. Update Global record block
    global_record_old1 = r'''<div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl text-center shadow-sm">
                <div className="text-\[10px\] uppercase font-black tracking-wider text-amber-600 dark:text-amber-500 mb-0\.5">Kỷ lục Tổng</div>
                <div className="flex items-center justify-center gap-1\.5">
                  <span className="text-lg">\{br\.emoji\}</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">\{bp\} EXP</span>
                </div>
              </div>'''
    global_record_old2 = r'''<div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl text-center shadow-sm">
                  <div className="text-\[10px\] uppercase font-black tracking-wider text-amber-600 dark:text-amber-500 mb-0\.5">Kỷ lục Tổng</div>
                  <div className="flex items-center justify-center gap-1\.5">
                    <span className="text-lg font-black tracking-widest text-amber-700 dark:text-amber-400">\[ \{br\.badge\}\{bMod\.modifier\} \]</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">\{bp\} EXP</span>
                  </div>
                </div>'''
    global_record_old3 = r'''<div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl text-center shadow-sm">
                  <div className="text-\[10px\] uppercase font-black tracking-wider text-amber-600 dark:text-amber-500 mb-0\.5">Kỷ lục Tổng</div>
                  <div className="flex items-center justify-center gap-1\.5">
                    <span className="text-lg">\{br\.emoji\}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">\{bp\} EXP</span>
                  </div>
                </div>'''
    
    global_record_new = r'''<div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl text-center shadow-sm">
                  <div className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-500 mb-0.5">Kỷ lục Tổng</div>
                  {(() => {
                    const bMod = getRankModifier(bp);
                    return (
                      <div className="flex items-center justify-center gap-1.5 text-sm">
                        <span className="text-lg">{br.emoji}</span>
                        <span className="font-bold text-amber-800 dark:text-amber-300">{br.kanji} — {br.nameVi}</span>
                        <span className="text-lg font-black tracking-widest text-amber-700 dark:text-amber-400 ml-1">[ {br.badge}{bMod.modifier} ]</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{bp} EXP</span>
                      </div>
                    );
                  })()}
                </div>'''
    # We might need to ensure bMod is available or we can compute it inside.
    # Notice the new block defines bMod just in case.

    content = re.sub(global_record_old1, global_record_new, content)
    content = re.sub(global_record_old2, global_record_new, content)
    content = re.sub(global_record_old3, global_record_new, content)

    # 3. Update Level record block
    level_record_regex = r'''<div className=\{`mt-1\.5 text-xs font-black \$\{level === l \? 'text-(indigo|amber)-600 dark:text-\1-400' : 'text-slate-500 dark:text-slate-400'\}[\s\w-:]*`\}>
\s*🏆 Kỷ lục: \[ \{r\.badge\}\{m\.modifier\} \] \{bp\} EXP
\s*</div>'''
    
    def replacer(match):
        c = match.group(1)
        return f'''<div className={{`mt-2 text-[11px] font-medium ${{level === l ? 'text-{c}-700 dark:text-{c}-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-{c}-600 dark:group-hover:text-{c}-400'}} transition-colors`}}>
                                  <span className="font-bold opacity-75 uppercase tracking-wider text-[10px] mr-1">Kỷ lục:</span> 
                                  <span className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-bold">
                                    <span>{{r.emoji}}</span> <span>{{r.kanji}} — {{r.nameVi}}</span>
                                    <span className="opacity-50 ml-0.5 mr-0.5">|</span>
                                    <span className="font-black tracking-wider">[ {{r.badge}}{{m.modifier}} ]</span>
                                  </span>
                                  <span className="ml-1.5 font-bold">{{bp}} EXP</span>
                                </div>'''
    
    content = re.sub(level_record_regex, replacer, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx')
patch_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx')

print("Patched successfully")
