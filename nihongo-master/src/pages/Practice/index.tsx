// src/pages/Practice/index.tsx
import { Link } from 'react-router-dom';
import { Book, GraduationCap, Pen, Trophy, Puzzle, Award, Lock } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useSettings } from '../../context/global/useSettings';

const container: Variants = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.1}} };
const item: Variants = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0,transition:{type:'spring',stiffness:300,damping:24}} };

export default function PracticeDashboard() {
  const { language } = useSettings();
  const lang = (language ?? 'vi') as 'vi' | 'en';

  const practiceModules = [
    {
      name: lang==='en'?'Conjugation Practice':'Luyện Chia Thể',
      path: '/practice/conjugation', icon: Pen,
      desc: lang==='en'?'Reflex training for verb & adjective conjugation':'Phản xạ chia động từ, tính từ siêu tốc',
      color:'text-blue-500', bgLight:'bg-blue-100 dark:bg-blue-900/30', borderColor:'hover:border-blue-500', disabled:false,
    },
    {
      name: lang==='en'?'Keigo Practice':'Luyện Kính Ngữ',
      path: '/practice/keigo', icon: GraduationCap,
      desc: lang==='en'?'Master Sonkei & Kenjou honorifics':'Làm chủ Tôn kính ngữ & Khiêm nhường ngữ',
      color:'text-green-500', bgLight:'bg-green-100 dark:bg-green-900/30', borderColor:'hover:border-green-500', disabled:false,
    },
    {
      name: lang==='en'?'Grammar Practice':'Luyện Ngữ Pháp',
      path:'#', icon: Book,
      desc: lang==='en'?'Build accurate JLPT-level sentences':'Ghép câu chuẩn xác theo JLPT',
      color:'text-orange-500', bgLight:'bg-orange-100 dark:bg-orange-900/30', borderColor:'hover:border-orange-500', disabled:true,
    },
    {
      name: lang==='en'?'Vocabulary':'Từ Vựng N3',
      path:'/vocabulary', icon: Puzzle,
      desc: lang==='en'?'Flashcard, quiz, matching & typing for N3 vocab':'Lật thẻ, trắc nghiệm, nối từ & nhập liệu từ vựng N3',
      color:'text-purple-500', bgLight:'bg-purple-100 dark:bg-purple-900/30', borderColor:'hover:border-purple-500', disabled:false,
    },
    {
      name: lang==='en'?'Kanji':'Chữ Hán (Kanji)',
      path:'#', icon: Award,
      desc: lang==='en'?'Recognize and write Kanji daily':'Nhận diện và viết Kanji mỗi ngày',
      color:'text-rose-500', bgLight:'bg-rose-100 dark:bg-rose-900/30', borderColor:'hover:border-rose-500', disabled:true,
    },
    {
      name: lang==='en'?'Leaderboard':'Đua Top',
      path:'#', icon: Trophy,
      desc: lang==='en'?'Compete online with friends':'Thi đấu trực tuyến với bạn bè',
      color:'text-amber-500', bgLight:'bg-amber-100 dark:bg-amber-900/30', borderColor:'hover:border-amber-500', disabled:true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3 transition-colors">
            {lang==='en'?'Practice Center':'Trung Tâm Luyện Tập'}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 transition-colors">
            {lang==='en'?'Choose a skill to sharpen your reflexes every day.':'Chọn một kỹ năng để rèn luyện phản xạ mỗi ngày.'}
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div variants={item} key={mod.name} className="h-full">
                <Link to={mod.disabled?'#':mod.path}
                  className={`group relative flex flex-col h-full bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 transition-all duration-200 ${
                    mod.disabled
                      ? 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed grayscale-[0.5]'
                      : `border-slate-200 dark:border-slate-700 ${mod.borderColor} hover:shadow-xl hover:-translate-y-1 hover:border-b-[6px] active:border-b-2 active:translate-y-0`
                  }`}>
                  {mod.disabled && (
                    <div className="absolute top-4 right-4 flex items-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full">
                      <Lock className="w-3 h-3 mr-1"/>
                      {lang==='en'?'Coming soon':'Sắp ra mắt'}
                    </div>
                  )}
                  <div className={`inline-flex p-4 rounded-xl ${mod.bgLight} ${mod.color} mb-5 w-fit group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8"/>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">{mod.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-grow transition-colors">{mod.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}