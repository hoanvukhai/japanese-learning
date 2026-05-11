// src/pages/Practice/KeigoDashboard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Keyboard, CheckSquare, Zap } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const gameModes = [
  { 
    name: 'Lật Thẻ (Flashcards)', 
    path: '/practice/keigo/flashcards', 
    icon: BookOpen, 
    description: 'Ôn tập nhanh qua thẻ ghi nhớ 2 mặt', 
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    border: 'hover:border-blue-500',
    disabled: false 
  },
  { 
    name: 'Nhập Liệu (Typing)', 
    path: '/practice/keigo/typing', 
    icon: Keyboard, 
    description: 'Gõ lại từ/câu để luyện nhớ mặt chữ và cách viết', 
    color: 'text-indigo-500',
    bg: 'bg-indigo-100',
    border: 'hover:border-indigo-500',
    disabled: false 
  },
  { 
    name: 'Trắc Nghiệm (Quiz)', 
    path: '#', 
    icon: CheckSquare, 
    description: 'Kiểm tra độ hiểu sâu với 4 đáp án A B C D', 
    color: 'text-rose-500',
    bg: 'bg-rose-100',
    border: 'hover:border-rose-500',
    disabled: true 
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const KeigoDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/practice')} 
          className="group flex items-center text-slate-500 hover:text-slate-800 font-semibold mb-8 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 hover:shadow-md"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </motion.button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-2 flex items-center">
              Luyện Kính Ngữ <Zap className="ml-3 text-yellow-400 h-8 w-8 fill-yellow-400" />
            </h1>
            <p className="text-lg text-slate-500">Chọn một chế độ chơi để bắt đầu cày cuốc.</p>
          </div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col space-y-5"
        >
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.div variants={item} key={mode.name}>
                <Link
                  to={mode.disabled ? '#' : mode.path}
                  className={`
                    group flex items-center p-5 sm:p-6 bg-white rounded-2xl border-2 transition-all duration-200
                    ${mode.disabled 
                      ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50 grayscale-[0.5]' 
                      : `border-slate-200 ${mode.border} hover:shadow-lg hover:-translate-y-1 hover:border-b-[6px] active:border-b-2 active:translate-y-0`
                    }
                  `}
                >
                  <div className={`flex-shrink-0 p-4 rounded-2xl ${mode.bg} ${mode.color} mr-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{mode.name}</h3>
                      {mode.disabled && (
                        <span className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
                          Sắp ra mắt
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm sm:text-base">{mode.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
};

export default KeigoDashboard;