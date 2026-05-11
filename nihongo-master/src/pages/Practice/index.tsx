// src/pages/Practice/index.tsx
import { Link } from 'react-router-dom';
import { Book, GraduationCap, Pen, Trophy, Puzzle, Award, Lock } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const practiceModules = [
  {
    name: 'Luyện Chia Thể',
    path: '/practice/conjugation',
    icon: Pen,
    desc: 'Phản xạ chia động từ, tính từ siêu tốc',
    color: 'text-blue-500',
    bgLight: 'bg-blue-100',
    borderColor: 'border-blue-500',
    disabled: false
  },
  {
    name: 'Luyện Kính Ngữ',
    path: '/practice/keigo',
    icon: GraduationCap,
    desc: 'Làm chủ Tôn kính ngữ & Khiêm nhường ngữ',
    color: 'text-green-500',
    bgLight: 'bg-green-100',
    borderColor: 'border-green-500',
    disabled: false
  },
  {
    name: 'Luyện Ngữ Pháp',
    path: '#',
    icon: Book,
    desc: 'Ghép câu chuẩn xác theo JLPT',
    color: 'text-orange-500',
    bgLight: 'bg-orange-100',
    borderColor: 'border-orange-500',
    disabled: true
  },
  {
    name: 'Từ Vựng',
    path: '#',
    icon: Puzzle,
    desc: 'Học từ vựng qua thẻ ghi nhớ thông minh',
    color: 'text-purple-500',
    bgLight: 'bg-purple-100',
    borderColor: 'border-purple-500',
    disabled: true
  },
  {
    name: 'Chữ Hán (Kanji)',
    path: '#',
    icon: Award,
    desc: 'Nhận diện và viết Kanji mỗi ngày',
    color: 'text-rose-500',
    bgLight: 'bg-rose-100',
    borderColor: 'border-rose-500',
    disabled: true
  },
  {
    name: 'Đua Top',
    path: '#',
    icon: Trophy,
    desc: 'Thi đấu trực tuyến với bạn bè',
    color: 'text-amber-500',
    bgLight: 'bg-amber-100',
    borderColor: 'border-amber-500',
    disabled: true
  },
];

// Hiệu ứng xuất hiện lần lượt
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PracticeDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left"
        >
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-3">Trung Tâm Luyện Tập</h1>
          <p className="text-lg text-slate-500">Chọn một kỹ năng để rèn luyện phản xạ mỗi ngày.</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {practiceModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div variants={item} key={mod.name} className="h-full">
                <Link
                  to={mod.disabled ? '#' : mod.path}
                  className={`
                    group relative flex flex-col h-full bg-white p-6 rounded-2xl border-2 transition-all duration-200
                    ${mod.disabled
                      ? 'border-slate-200 opacity-60 cursor-not-allowed grayscale-[0.5]'
                      : `border-slate-200 hover:${mod.borderColor} hover:shadow-xl hover:-translate-y-1 hover:border-b-[6px] active:border-b-2 active:translate-y-0`
                    }
                  `}
                >
                  {/* Badge Sắp ra mắt */}
                  {mod.disabled && (
                    <div className="absolute top-4 right-4 flex items-center bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">
                      <Lock className="w-3 h-3 mr-1" /> Sắp ra mắt
                    </div>
                  )}

                  <div className={`inline-flex p-4 rounded-xl ${mod.bgLight} ${mod.color} mb-5 w-fit group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-2">{mod.name}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow">
                    {mod.desc}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default PracticeDashboard;