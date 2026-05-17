// src/pages/Practice/KeigoQuest.tsx
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Zap, RefreshCw, Heart, X, Check } from 'lucide-react';
import { keigoVerbs } from '../../data/keigoDb';
import type { KeigoVerb, KeigoFormKey } from '../../types/keigo';
import { getKeigoResult, generateDistractors, buildRuleExplanation } from '../../lib/keigoEngine';
import { useSettings } from '../../context/global/useSettings';

// ── CHARACTERS ────────────────────────────────────────────────
const CHARS = {
  boss:     { emoji:'👔', name:'Giám đốc Tanaka', nameEn:'Director Tanaka', role:'Cấp trên của bạn', roleEn:'Your superior', grad:'from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900' },
  president:{ emoji:'🏛️', name:'Chủ tịch Suzuki', nameEn:'President Suzuki', role:'Lãnh đạo tập đoàn', roleEn:'Group president', grad:'from-amber-600 to-orange-800 dark:from-amber-700 dark:to-orange-900' },
  customer: { emoji:'🧳', name:'Khách hàng Yamada', nameEn:'Client Yamada', role:'Khách hàng VIP', roleEn:'VIP client', grad:'from-indigo-600 to-blue-800 dark:from-indigo-700 dark:to-blue-900' },
  senior:   { emoji:'👩‍💼', name:'Senpai Sato', nameEn:'Senior Sato', role:'Đồng nghiệp cấp cao', roleEn:'Senior colleague', grad:'from-violet-600 to-purple-800 dark:from-violet-700 dark:to-purple-900' },
  sensei:   { emoji:'👨‍🏫', name:'Thầy Nakamura', nameEn:'Teacher Nakamura', role:'Giáo viên của bạn', roleEn:'Your teacher', grad:'from-teal-600 to-emerald-800 dark:from-teal-700 dark:to-emerald-900' },
  doctor:   { emoji:'👨‍⚕️', name:'Bác sĩ Ito', nameEn:'Dr. Ito', role:'Bác sĩ trưởng khoa', roleEn:'Head physician', grad:'from-blue-600 to-cyan-800 dark:from-blue-700 dark:to-cyan-900' },
  self:     { emoji:'🙋', name:'Bạn', nameEn:'You', role:'Nhân viên mới', roleEn:'New employee', grad:'from-emerald-600 to-teal-800 dark:from-emerald-700 dark:to-teal-900' },
} as const;
type CharKey = keyof typeof CHARS;

// ── SCENARIO TEMPLATES ────────────────────────────────────────
interface TmplDef { charKey: CharKey; formKey: KeigoFormKey; bg: string;
  vi:(v:string,c:string)=>string; en:(v:string,c:string)=>string; }

const TEMPLATES: TmplDef[] = [
  // === SONKEI (上位者がする) ===
  { charKey:'boss',     formKey:'sonkei', bg:'🏢',
    vi:(v,c)=>`Trong cuộc họp sáng nay, ${c} đang ${v}. Bạn kể lại với đồng nghiệp bằng kính ngữ nào?`,
    en:(v,c)=>`In this morning's meeting, ${c} is [${v}]. How do you report this to a colleague?` },
  { charKey:'president',formKey:'sonkei', bg:'🏛️',
    vi:(v,c)=>`${c} vừa ${v} xong. Thư ký cần thông báo với nhân viên. Dùng kính ngữ gì?`,
    en:(v,c)=>`${c} just finished [${v}]. The secretary needs to announce it. Which honorific?` },
  { charKey:'customer', formKey:'sonkei', bg:'☕',
    vi:(v,c)=>`${c} đang ${v} tại phòng chờ. Bạn nói với sếp về tình huống này:`,
    en:(v,c)=>`${c} is [${v}] in the waiting room. You're telling your boss about this:` },
  { charKey:'senior',   formKey:'sonkei', bg:'🍱',
    vi:(v,c)=>`${c} đang ${v} trong giờ nghỉ trưa. Bạn mô tả điều này trong email:`,
    en:(v,c)=>`${c} is [${v}] during lunch break. You describe this in an email:` },
  { charKey:'sensei',   formKey:'sonkei', bg:'📚',
    vi:(v,c)=>`${c} đang ${v} bài kiểm tra. Bạn nói với phụ huynh học sinh:`,
    en:(v,c)=>`${c} is [${v}] the exam. You tell the students' parents:` },
  { charKey:'doctor',   formKey:'sonkei', bg:'🏥',
    vi:(v,c)=>`${c} đang ${v}. Y tá thông báo cho bệnh nhân chờ bên ngoài:`,
    en:(v,c)=>`${c} is [${v}]. The nurse announces this to waiting patients:` },
  { charKey:'boss',     formKey:'sonkei', bg:'📊',
    vi:(v,c)=>`${c} sẽ ${v} báo cáo vào chiều nay. Bạn nhắn tin cho đồng nghiệp:`,
    en:(v,c)=>`${c} will [${v}] the report this afternoon. You text a colleague:` },
  { charKey:'customer', formKey:'sonkei', bg:'🎁',
    vi:(v,c)=>`${c} muốn ${v} sản phẩm của chúng tôi. Nhân viên ghi vào biên bản:`,
    en:(v,c)=>`${c} wants to [${v}] our product. The staff records this in the minutes:` },

  // === KENJOU (自分がする) ===
  { charKey:'self',     formKey:'kenjou', bg:'📋',
    vi:(_v,_c)=>`Bạn muốn nói với Giám đốc rằng BẠN sẽ ${_v}. Dùng thể khiêm nhường nào?`,
    en:(_v,_c)=>`You want to tell the Director that YOU will [${_v}]. Which humble form?` },
  { charKey:'self',     formKey:'kenjou', bg:'📞',
    vi:(_v,_c)=>`Bạn điện thoại cho khách hàng và nói rằng bạn sẽ ${_v} cho họ:`,
    en:(_v,_c)=>`You call the client and say you will [${_v}] for them:` },
  { charKey:'self',     formKey:'kenjou', bg:'✉️',
    vi:(_v,_c)=>`Trong email gửi sếp, bạn muốn xin phép ${_v}. Cách diễn đạt khiêm nhường là:`,
    en:(_v,_c)=>`In an email to your boss, you want to ask permission to [${_v}]. The humble expression:` },
  { charKey:'self',     formKey:'kenjou', bg:'🤝',
    vi:(_v,_c)=>`Tại buổi gặp mặt khách hàng, bạn giới thiệu: "Tôi sẽ ${_v} cho quý vị."`,
    en:(_v,_c)=>`At the client meeting, you introduce: "I will [${_v}] for you."` },
  { charKey:'self',     formKey:'kenjou', bg:'🏢',
    vi:(_v,_c)=>`Trong buổi phỏng vấn, bạn tự tin nói: "Tôi có thể ${_v} tốt cho công ty."`,
    en:(_v,_c)=>`In the interview, you confidently say: "I can [${_v}] well for the company."` },
  { charKey:'self',     formKey:'kenjou', bg:'📝',
    vi:(_v,_c)=>`Bạn gặp chủ tịch lần đầu và muốn nói rằng bạn đã ${_v} trước khi đến:`,
    en:(_v,_c)=>`Meeting the president for the first time, you say you already [${_v}] before coming:` },

  // === TEINEI (丁寧語) ===
  { charKey:'boss',     formKey:'teinei', bg:'🗣️',
    vi:(v,c)=>`Bạn đang trình bày với ${c} về việc ${v}. Dùng thể lịch sự cơ bản:`,
    en:(v,c)=>`You're presenting to ${c} about [${v}]. Use the basic polite form:` },
  { charKey:'senior',   formKey:'teinei', bg:'☕',
    vi:(v,c)=>`${c} hỏi bạn về kế hoạch ${v}. Bạn trả lời lịch sự:`,
    en:(v,c)=>`${c} asks about your plan to [${v}]. You reply politely:` },
  { charKey:'customer', formKey:'teinei', bg:'🏪',
    vi:(v,c)=>`Nhân viên cửa hàng hỏi ${c} có muốn ${v} không. Câu hỏi lịch sự là gì?`,
    en:(v,c)=>`The store clerk asks if ${c} wants to [${v}]. What is the polite question?` },
  { charKey:'sensei',   formKey:'teinei', bg:'📖',
    vi:(v,c)=>`${c} yêu cầu bạn ${v} bài tập. Bạn xác nhận lịch sự:`,
    en:(v,c)=>`${c} asks you to [${v}] the assignment. You confirm politely:` },
];

// ── UTILS ─────────────────────────────────────────────────────
const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const LABELS = ['A', 'B', 'C', 'D'];
const TOTAL = 15;

interface Scenario { tmpl: TmplDef; verb: KeigoVerb; }
interface Question { scenario: Scenario; correct: string; choices: string[]; correctIdx: number; exVi: string; exEn: string; }

const buildScenarios = (): Scenario[] => {
  const list: Scenario[] = [];
  keigoVerbs.forEach(verb => {
    TEMPLATES.forEach(tmpl => {
      if (verb[tmpl.formKey].type === 'none') return;
      list.push({ tmpl, verb });
    });
  });
  return shuffle(list).slice(0, TOTAL);
};

const buildQ = (s: Scenario): Question => {
  const correct = getKeigoResult(s.verb, s.tmpl.formKey);
  const distractors = generateDistractors(s.verb, s.tmpl.formKey, 3);
  // Fallback được xử lý hoàn toàn trong generateDistractors (cross-verb pool)
  const choices = shuffle([correct, ...distractors.slice(0, 3)]);
  const isSpecial = s.verb[s.tmpl.formKey].type === 'special';

  const buildEx = (lang: 'vi' | 'en') => {
    if (isSpecial) {
      return lang === 'vi'
        ? `“${correct}” là dạng ĐẶC BIỆT của “${s.verb.kanji}” (${s.verb.meaning.vi}). Bắt buộc học thuộc!`
        : `“${correct}” is the SPECIAL form of “${s.verb.kanji}” (${s.verb.meaning.en}). Must memorize!`;
    }
    const rule = buildRuleExplanation(s.tmpl.formKey, s.verb, lang);
    return `“${correct}” — ${rule}`;
  };

  return {
    scenario: s, correct, choices,
    correctIdx: choices.indexOf(correct),
    exVi: buildEx('vi'),
    exEn: buildEx('en'),
  };
};

// ── MAIN ──────────────────────────────────────────────────────
export default function KeigoQuest() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const lang = (language ?? 'vi') as 'vi' | 'en';

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [charMood, setCharMood] = useState<'neutral'|'happy'|'sad'>('neutral');

  const init = useCallback(() => {
    const s = buildScenarios();
    setScenarios(s);
    setQIdx(0);
    setQuestion(buildQ(s[0]));
    setSelected(null); setIsCorrect(null);
    setScore(0); setStreak(0); setLives(3);
    setIsGameOver(false); setIsFinished(false); setCharMood('neutral');
  }, []);
  useEffect(() => { init(); }, [init]);

  const handleSelect = (idx: number) => {
    if (selected !== null || !question) return;
    const ok = idx === question.correctIdx;
    setSelected(idx); setIsCorrect(ok); setCharMood(ok ? 'happy' : 'sad');
    if (ok) { setScore(s => s + 10 + streak * 2); setStreak(s => s + 1); }
    else { setStreak(0); const nl = lives - 1; setLives(nl); if (nl <= 0) setIsGameOver(true); }
  };

  const handleNext = () => {
    const ni = qIdx + 1;
    if (ni >= scenarios.length) { setIsFinished(true); return; }
    setQIdx(ni); setQuestion(buildQ(scenarios[ni]));
    setSelected(null); setIsCorrect(null); setCharMood('neutral');
  };

  if (!question) return null;

  const { scenario, choices, correctIdx, exVi, exEn } = question;
  const char = CHARS[scenario.tmpl.charKey];
  const vMeaning = lang === 'en' ? scenario.verb.meaning.en : scenario.verb.meaning.vi;
  const sitText = lang === 'en'
    ? scenario.tmpl.en(vMeaning, char.nameEn)
    : scenario.tmpl.vi(vMeaning, char.name);
  const moodEmoji = charMood === 'happy' ? '😄' : charMood === 'sad' ? '😠' : char.emoji;
  const formLabels: Record<KeigoFormKey,string> = {
    sonkei: lang==='vi'?'尊敬語 Tôn kính':'尊敬語 Sonkei',
    kenjou: lang==='vi'?'謙譲語 Khiêm nhường':'謙譲語 Kenjou',
    teinei: lang==='vi'?'丁寧語 Lịch sự':'丁寧語 Teinei',
  };

  // END SCREENS
  if (isGameOver || isFinished) {
    const won = isFinished && !isGameOver;
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors">
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}
          className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">{won?'🏆':'💀'}</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">
            {won?(lang==='vi'?'Xuất sắc!':'Excellent!'):(lang==='vi'?'Game Over!':'Game Over!')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{lang==='vi'?`Điểm số: ${score}`:`Score: ${score}`}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-3">
              <div className="text-yellow-500 text-xl font-bold">{score}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{lang==='vi'?'Điểm':'Score'}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-3">
              <div className="text-emerald-500 text-xl font-bold">{qIdx}/{TOTAL}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{lang==='vi'?'Câu':'Rounds'}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>navigate('/practice/keigo')} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-2xl font-semibold text-sm transition-colors">
              {lang==='vi'?'Quay lại':'Back'}
            </button>
            <button onClick={init} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
              <RefreshCw size={16}/> {lang==='vi'?'Chơi lại':'Retry'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col transition-colors">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={()=>navigate('/practice/keigo')} className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <ArrowLeft size={18}/>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(3)].map((_,i)=>(
              <Heart key={i} size={18} className={i<lives?'text-red-400 fill-red-400':'text-slate-300 dark:text-slate-600'}/>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-400/10 border border-yellow-200 dark:border-yellow-400/30 rounded-full px-3 py-1">
            <Star size={13} className="text-yellow-500 fill-yellow-500"/>
            <span className="text-yellow-600 dark:text-yellow-300 font-bold text-sm">{score}</span>
          </div>
          {streak>1&&(
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-400/10 border border-orange-200 dark:border-orange-400/30 rounded-full px-3 py-1 animate-pulse">
              <Zap size={13} className="text-orange-500 fill-orange-500"/>
              <span className="text-orange-600 dark:text-orange-300 font-bold text-sm">{streak}x</span>
            </div>
          )}
        </div>
      </div>

      {/* PROGRESS */}
      <div className="px-4 mb-3">
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{width:`${(qIdx/TOTAL)*100}%`}}/>
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 text-right">{qIdx+1} / {TOTAL}</p>
      </div>

      {/* SCENE CARD */}
      <div className={`mx-4 rounded-2xl bg-gradient-to-br ${char.grad} p-5 mb-4 shadow-lg border border-black/10`}>
        <div className="flex items-center gap-3 mb-4">
          <motion.div key={charMood} animate={{scale:[1,1.2,1]}} transition={{duration:0.35}}
            className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl border border-white/20 shadow shrink-0">
            {moodEmoji}
          </motion.div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{lang==='en'?char.nameEn:char.name}</p>
            <p className="text-white/60 text-xs">{lang==='en'?char.roleEn:char.role}</p>
            <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/90">
              {scenario.tmpl.bg} {formLabels[scenario.tmpl.formKey]}
            </span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 mb-3">
          <p className="text-white text-sm leading-relaxed">{sitText}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/50 text-xs">{lang==='vi'?'Từ gốc:':'Base:'}</span>
          <span className="bg-white/20 text-white font-bold text-sm px-3 py-0.5 rounded-full border border-white/20">{scenario.verb.kanji}</span>
          <span className="text-white/50 text-xs">({vMeaning})</span>
        </div>
      </div>

      {/* CHOICES */}
      <div className="px-4 flex flex-col gap-2.5 flex-1">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {lang==='vi'?'Chọn đáp án đúng:':'Choose the correct answer:'}
        </p>
        {choices.map((choice, i) => {
          let st: 'idle'|'correct'|'wrong'|'dim' = 'idle';
          if (selected!==null) st = i===correctIdx?'correct':i===selected?'wrong':'dim';
          const cls = {
            idle: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700',
            correct: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-800 dark:text-emerald-300',
            wrong: 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300',
            dim: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500',
          }[st];
          const lblCls = {
            idle: 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-500 text-slate-500 dark:text-slate-300',
            correct:'bg-emerald-500 border-emerald-500 text-white',
            wrong:'bg-red-500 border-red-500 text-white',
            dim:'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600',
          }[st];
          return (
            <motion.button key={i} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
              disabled={selected!==null} onClick={()=>handleSelect(i)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left font-medium transition-all shadow-sm ${cls}`}>
              <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-extrabold border-2 ${lblCls}`}>
                {st==='correct'?<Check size={13}/>:st==='wrong'?<X size={13}/>:LABELS[i]}
              </span>
              <span className="text-lg leading-snug break-all">{choice}</span>
            </motion.button>
          );
        })}
      </div>

      {/* FEEDBACK PANEL */}
      <AnimatePresence>
        {selected!==null&&(
          <motion.div initial={{y:90,opacity:0}} animate={{y:0,opacity:1}} exit={{y:90,opacity:0}}
            className={`fixed bottom-0 inset-x-0 rounded-t-3xl p-5 shadow-2xl border-t-2 z-50 ${isCorrect?'bg-emerald-50 dark:bg-emerald-900/90 border-emerald-400':'bg-red-50 dark:bg-red-900/90 border-red-400'}`}>
            <div className="flex gap-3 items-start mb-3">
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect?'bg-emerald-500':'bg-red-500'}`}>
                {isCorrect?<Check size={16} className="text-white"/>:<X size={16} className="text-white"/>}
              </div>
              <div>
                <p className={`font-bold text-sm mb-1 ${isCorrect?'text-emerald-700 dark:text-emerald-300':'text-red-700 dark:text-red-300'}`}>
                  {isCorrect?(lang==='vi'?'🎉 Chính xác!':'🎉 Correct!'):( lang==='vi'?'❌ Chưa đúng':'❌ Wrong')}
                  {isCorrect&&streak>1&&<span className="ml-2 text-amber-600 dark:text-amber-400">🔥 {streak}x</span>}
                </p>
                <p className={`text-sm leading-relaxed ${isCorrect?'text-emerald-800 dark:text-emerald-200':'text-red-800 dark:text-red-200'}`}>
                  ✅ {lang==='en'?exEn:exVi}
                </p>
              </div>
            </div>
            <button onClick={handleNext}
              className={`w-full py-3 rounded-2xl font-bold text-white text-base transition-colors ${isCorrect?'bg-emerald-500 hover:bg-emerald-400':'bg-red-500 hover:bg-red-400'}`}>
              {lang==='vi'?'Tiếp tục →':'Continue →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-32 shrink-0"/>
    </div>
  );
}
