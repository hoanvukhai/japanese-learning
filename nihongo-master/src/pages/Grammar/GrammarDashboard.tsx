import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, CheckSquare, Shuffle, GitMerge, Swords, PenLine, ArrowLeft, BookOpen } from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVar = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

const GROUP_LABELS: Record<string, string> = {
  Emotion_Desire: '🎭 Cảm xúc & Mong muốn',
  Request_Advice: '🙏 Yêu cầu & Lời khuyên',
  Hearsay_Quotation: '💬 Truyền đạt & Nghe nói',
  Negative_Condition: '🚫 Phủ định & Điều kiện',
  Habit_Rule: '📋 Thói quen & Quy tắc',
  Addition_Emphasis: '➕ Bổ sung & Nhấn mạnh',
  Effort_Intention: '💪 Nỗ lực & Ý định',
  CompoundVerbs: '⚔️ Ghép động từ',
  TimeSequence: '⏱️ Thời gian & Thứ tự',
  CauseReason: '🔗 Nguyên nhân & Kết quả',
  StateTendency: '🎯 Tình trạng & Xu hướng',
  Inference: '🕵️ Phán đoán & Suy luận',
  Contrast: '⚖️ Đối lập & So sánh',
  AdvancedParticles: '📌 Giới từ nâng cao',
  SpokenLanguage: '🗣️ Văn nói & Cảm xúc',
};

// 3 game cơ bản — KHÔNG bao gồm Học lý thuyết
const basicModes = [
  {
    id: 'flashcard',
    name: 'Lật thẻ',
    path: '/practice/grammar/flashcard',
    icon: Layers,
    desc: 'Luyện phản xạ nhớ cấu trúc và nghĩa. Lọc theo Bài hoặc Nhóm bẫy.',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/30',
    border: 'hover:border-teal-400',
  },
  {
    id: 'fillblank',
    name: 'Điền vào chỗ trống',
    path: '/practice/grammar/fillblank',
    icon: PenLine,
    desc: '📝 Đúng dạng JLPT Part 5: đọc câu ví dụ, chọn cấu trúc ngữ pháp phù hợp.',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    border: 'hover:border-cyan-400',
  },
  {
    id: 'quiz',
    name: 'Trắc nghiệm',
    path: '/practice/grammar/quiz',
    icon: CheckSquare,
    desc: 'Cấu trúc → Nghĩa (hoặc ngược lại). 4 đáp án với nhiễu từ cùng nhóm.',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/30',
    border: 'hover:border-sky-400',
  },
];

// 3 game nâng cao
const advancedModes = [
  {
    id: 'matching',
    name: 'Nối từ',
    path: '/practice/grammar/matching',
    icon: GitMerge,
    desc: 'Nối cấu trúc với nghĩa tiếng Việt hoặc cách thành lập. 6 cặp mỗi vòng.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    border: 'hover:border-violet-400',
    badge: undefined,
  },
  {
    id: 'wordorder',
    name: 'Xếp câu',
    path: '/practice/grammar/wordorder',
    icon: Shuffle,
    desc: 'Bấm các mảnh ghép theo đúng thứ tự để tái tạo câu ví dụ hoàn chỉnh.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    border: 'hover:border-indigo-400',
    badge: undefined,
  },
  {
    id: 'arena',
    name: 'Bẫy đối kháng',
    path: '/practice/grammar/quiz',
    icon: Swords,
    desc: 'Đáp án nhiễu đều là mẫu cùng nhóm. Cực hóc búa — cực thực chiến!',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'hover:border-red-400',
    badge: '⚔️ KILLER',
  },
];

function ModeCard({ mode }: { mode: (typeof basicModes)[0] & { badge?: string } }) {
  const Icon = mode.icon;
  return (
    <motion.div variants={cardVar}>
      <Link to={mode.path} className="block group h-full">
        <div className={`relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-700 ${mode.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col`}>
          {'badge' in mode && mode.badge && (
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
              {mode.badge}
            </span>
          )}
          <div className={`w-12 h-12 ${mode.bg} rounded-xl flex items-center justify-center ${mode.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1.5">{mode.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-grow">{mode.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function GrammarDashboard() {
  const navigate = useNavigate();
  const lessons = getN3GrammarLessons();
  const groups = [...new Set(grammarN3.map(g => g.group))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <button
                onClick={() => navigate('/practice')}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-bold rounded-full">
                JLPT N3
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
              📝 Ngữ Pháp N3
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Hệ thống kép: học theo bài (Riki) · luyện game theo nhóm bẫy
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              {grammarN3.length} mẫu · {lessons.length} bài · {groups.length} nhóm bẫy
            </span>
            <Link 
              to="/study/grammar" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <BookOpen size={16} />
              Học lý thuyết Ngữ pháp
            </Link>
          </div>
        </motion.header>

        {/* Game sections */}
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Basic */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nhóm Ghi nhớ · Cơ bản</span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {basicModes.map(m => <ModeCard key={m.id} mode={m} />)}
          </div>

          {/* Advanced */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nhóm Phản xạ · Nâng cao</span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {advancedModes.map(m => <ModeCard key={m.id} mode={m} />)}
          </div>

          {/* Group Map */}
          {groups.length > 0 && (
            <motion.div variants={cardVar} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                🗺️ Bản đồ nhóm bẫy (dùng cho Trắc nghiệm & Bẫy đối kháng)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groups.map(group => {
                  const count = grammarN3.filter(g => g.group === group).length;
                  const label = GROUP_LABELS[group] ?? group;
                  return (
                    <div key={group} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
                      <span className="text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
