import re

def patch_file(filepath, theme_color):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The button start
    old_btn_start = f'className={{`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${{level === l ? \'border-{theme_color}-500 bg-{theme_color}-50 dark:bg-{theme_color}-900/30\' : \'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-{theme_color}-300\'}}`}}>\n                        <div className="flex items-center gap-3 text-left">\n                          <div className={{`w-8 h-8 rounded-lg flex items-center justify-center font-black ${{isEasy ? \'bg-emerald-100 text-emerald-600\' : isHard ? \'bg-red-100 text-red-600\' : \'bg-blue-100 text-blue-600\'\n                            }}`}}>'
    
    new_btn_start = f'className={{`w-full text-left p-3.5 rounded-xl border-2 transition-all ${{level === l ? \'border-{theme_color}-500 bg-{theme_color}-50 dark:bg-{theme_color}-900/30\' : \'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-{theme_color}-300\'}}`}}>\n                        <div className="flex items-center gap-3">\n                          <div className={{`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black ${{isEasy ? \'bg-emerald-100 text-emerald-600\' : isHard ? \'bg-red-100 text-red-600\' : \'bg-blue-100 text-blue-600\'\n                            }}`}}>'
    
    content = content.replace(old_btn_start, new_btn_start)

    # The flex-1 wrapper around title/desc
    old_title_desc = '''                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-white">Mức {cfg.label}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                            {(() => {'''
    new_title_desc = '''                          <div className="flex-1">
                            <div className="font-bold text-sm text-slate-800 dark:text-white">Mức {cfg.label}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                          </div>
                        </div>
                        {(() => {'''
    content = content.replace(old_title_desc, new_title_desc)

    # The record display block
    old_record = f'''                                <div className={{`mt-2 text-[11px] font-medium ${{level === l ? 'text-{theme_color}-700 dark:text-{theme_color}-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-{theme_color}-600 dark:group-hover:text-{theme_color}-400'}} transition-colors`}}>
                                  <span className="font-bold opacity-75 uppercase tracking-wider text-[10px] mr-1">Kỷ lục:</span> 
                                  <span className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-bold">
                                    <span>{{r.emoji}}</span> <span>{{r.kanji}} — {{r.nameVi}}</span>
                                    <span className="opacity-50 ml-0.5 mr-0.5">|</span>
                                    <span className="font-black tracking-wider">[ {{r.badge}}{{m.modifier}} ]</span>
                                  </span>
                                  <span className="ml-1.5 font-bold">{{bp}} EXP</span>
                                </div>
                              );
                            }})()}}
                          </div>
                        </div>'''
    
    new_record = f'''                                <div className={{`mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-medium ${{level === l ? 'text-{theme_color}-700 dark:text-{theme_color}-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-{theme_color}-600 dark:group-hover:text-{theme_color}-400'}} transition-colors`}}>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold opacity-75 uppercase tracking-wider text-[10px]">Kỷ lục</span> 
                                    <span className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-bold">
                                      <span>{{r.emoji}}</span> <span>{{r.kanji}} — {{r.nameVi}}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-black tracking-wider">[ {{r.badge}}{{m.modifier}} ]</span>
                                    <span className="font-bold">{{bp}} EXP</span>
                                  </div>
                                </div>
                              );
                            }})()}}'''
    content = content.replace(old_record, new_record)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Vocabulary\VocabFullRun.tsx', 'indigo')
patch_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Kanji\KanjiFullRun.tsx', 'amber')
patch_file(r'f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx', 'indigo')

print("Patched successfully")
