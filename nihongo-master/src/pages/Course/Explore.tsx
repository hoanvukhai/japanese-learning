import { Link, useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../data/courses/registry';
import { useMyCourses } from '../../context/global/useMyCourses';
import { Plus, Check, Compass } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';

export default function Explore() {
  const { myCourseIds, addCourse } = useMyCourses();
  const { user } = useAuth();
  const exploreCourses = getAllCourses();
  const navigate = useNavigate();

  const handleAddCourse = (courseId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addCourse(courseId);
    navigate(`/course/${courseId}`, { state: { from: '/explore' } });
  };


  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <Compass className="text-indigo-500" size={32} />
              Khám Phá
            </h1>
            <p className="text-slate-500">Khám phá và thêm các khóa học vào danh sách của bạn.</p>
          </div>
        </div>

        {/* Explore Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exploreCourses.map(c => {
            const isAdded = myCourseIds.includes(c.id);
            return (
              <div
                key={c.id}
                className="flex flex-col p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Clicking on the card itself should preview it */}
                <Link to={`/course/${c.id}`} state={{ from: '/explore' }} className="absolute inset-0 z-0 rounded-2xl"></Link>
                
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white shadow-md bg-${c.color}-500 z-10`} style={{ backgroundColor: c.color === 'emerald' ? '#10b981' : c.color === 'orange' ? '#f97316' : c.color === 'blue' ? '#3b82f6' : c.color === 'violet' ? '#8b5cf6' : c.color === 'fuchsia' ? '#d946ef' : '#6366f1'}}>
                  {c.subject === 'vocab' ? 'Aa' : (c.subject === 'kanji_single' || c.subject === 'kanji_words') ? '漢' : c.subject === 'grammar' ? '📖' : '🎓'}
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 z-10 pointer-events-none">{c.name}</h2>
                <div className="flex items-center gap-2 mb-3 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded">
                    {c.level}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded">
                    {c.subject.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1 z-10 pointer-events-none">
                  {c.description}
                </p>
                
                <div className="z-10 mt-auto">
                  {isAdded ? (
                    <button
                      onClick={(e) => { e.preventDefault(); navigate(`/course/${c.id}`, { state: { from: '/explore' } }); }}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Check size={18} className="text-green-500" />
                      Vào học ngay
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddCourse(c.id); }}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800/50 transition-colors"
                    >
                      <Plus size={18} />
                      Thêm vào của tôi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
