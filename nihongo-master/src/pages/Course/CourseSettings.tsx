import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../data/courses/registry';
import { useAuth } from '../../context/auth/useAuth';
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useMyCourses } from '../../context/global/useMyCourses';

export default function CourseSettings() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId || '');
  const { user } = useAuth();
  const { removeCourse } = useMyCourses();
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!course) return null;

  const handleReset = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để thực hiện chức năng này.');
      return;
    }
    
    setIsDeleting(true);
    try {
      await resetCourseProgress(user.uid, course.id);
      alert('Đã xóa thành công toàn bộ tiến độ của khóa học này!');
      navigate(`/course/${course.id}`);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi xóa tiến độ.');
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  const handleRemoveFromMyCourses = () => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này khỏi danh sách "Khóa học của tôi"? (Tiến độ học sẽ không bị mất)')) {
      removeCourse(course.id);
      navigate('/');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <button onClick={() => navigate(`/course/${course.id}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm mb-6">
        <ArrowLeft size={16} /> Quay lại Khóa học
      </button>

      <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Cài đặt khóa học</h1>
      <p className="text-slate-500 mb-8">Tùy chỉnh hoặc xóa dữ liệu cho khóa: <strong className="text-indigo-600 dark:text-indigo-400">{course.name}</strong></p>

      <div className="space-y-6">
        {/* Remove from My Courses */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Xóa khỏi danh sách</h3>
            <p className="text-sm text-slate-500 mt-1">Khóa học sẽ không còn hiển thị ở tab "Khóa học của tôi".</p>
          </div>
          <button
            onClick={handleRemoveFromMyCourses}
            className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all"
          >
            Gỡ bỏ
          </button>
        </div>


      </div>
    </div>
  );
}
