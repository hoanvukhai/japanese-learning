import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/auth/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { fetchGlobalLeaderboard, type LeaderboardUser } from '../../lib/srs/firestoreSync';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { LeaderboardWidget } from '../../components/shared/LeaderboardWidget';
import { Trophy, Flame, Pencil, Check } from 'lucide-react';

export default function Profile() {
  const { user, userProfile, role } = useAuth();

  const [userData, setUserData] = useState<any>(null);


  const [studyLeaderboard, setStudyLeaderboard] = useState<LeaderboardUser[]>([]);
  const [raceLeaderboard, setRaceLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingStudy, setLoadingStudy] = useState(true);
  const [loadingRace, setLoadingRace] = useState(true);


  const [modalLeaderboard, setModalLeaderboard] = useState<'study' | 'race' | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const nameEditRef = useRef<HTMLDivElement>(null);
  const avatarEditRef = useRef<HTMLDivElement>(null);




  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nameEditRef.current && !nameEditRef.current.contains(event.target as Node)) {
        setIsEditingName(false);
      }
      if (avatarEditRef.current && !avatarEditRef.current.contains(event.target as Node)) {
        setIsEditingAvatar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadUser = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (e) {
        console.error("Error loading user data", e);
      }
    };
    loadUser();

    fetchGlobalLeaderboard('study').then(data => {
      setStudyLeaderboard(data);
      setLoadingStudy(false);
    });

    fetchGlobalLeaderboard('race').then(data => {
      setRaceLeaderboard(data);
      setLoadingRace(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Vui lòng đăng nhập để xem hồ sơ.</p>
      </div>
    );
  }

  const totalExp = userProfile?.totalExp || 0;
  const totalRaceScore = userData?.totalRaceScore || 0;
  const activityHistory = userData?.dailyStudyTime || {}; // Pass time instead of exp
  const currentStreak = userProfile?.currentStreak || 0;
  // Tổng điểm học của tất cả các khóa = cộng tổng courseStudyScores (tách riêng khỏi Level EXP)
  const totalStudyScore = Object.values(userData?.courseStudyScores || {}).reduce((sum: number, v: unknown) => sum + (v as number), 0);
  const displayName = userData?.displayName || user.email?.split('@')[0] || 'Học viên';
  const avatarUrl = userData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  const level = userProfile?.level || 1;
  const nextLevelExp = userProfile?.nextLevelExp || 100;
  const currentLevelExp = Math.pow(level - 1, 2) * 100;
  const expInLevel = totalExp - currentLevelExp;
  const expNeededInLevel = nextLevelExp - currentLevelExp;
  const progressPercent = Math.min(100, Math.max(0, (expInLevel / expNeededInLevel) * 100));



  const toggleEditName = () => {
    if (isEditingName) {
      setIsEditingName(false);
    } else {
      setEditName(displayName);
      setIsEditingName(true);
    }
  };

  const toggleEditAvatar = () => {
    if (isEditingAvatar) {
      setIsEditingAvatar(false);
    } else {
      setEditAvatar(userData?.photoURL || '');
      setIsEditingAvatar(true);
    }
  };

  const handleSaveProfile = async (field: 'name' | 'avatar') => {
    if (!user) return;

    const finalName = field === 'name' ? editName : displayName;
    const finalAvatar = field === 'avatar' ? editAvatar : (userData?.photoURL || null);

    if (!finalName.trim()) return;

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: finalName,
        photoURL: finalAvatar || null,
      });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: finalName,
        photoURL: finalAvatar || null,
      });
      setUserData((prev: any) => ({ ...prev, displayName: finalName, photoURL: finalAvatar }));

      if (field === 'name') setIsEditingName(false);
      if (field === 'avatar') setIsEditingAvatar(false);

      const newStudy = await fetchGlobalLeaderboard('study');
      setStudyLeaderboard(newStudy);
      const newRace = await fetchGlobalLeaderboard('race');
      setRaceLeaderboard(newRace);

    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-4 pb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center relative pt-8">

          {role === 'admin' && (
            <div className="absolute top-4 left-4 px-2 py-1 text-[10px] font-black tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md">
              ADMIN
            </div>
          )}

          {currentStreak > 0 && (
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 text-orange-500 font-bold text-sm bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800/50 shadow-sm"
              title={`${currentStreak} ngày học liên tiếp`}
            >
              <Flame size={16} className="fill-orange-500" />
              {currentStreak}
            </div>
          )}

          {/* Avatar Area */}
          <div className="relative mb-3 flex flex-col items-center" ref={avatarEditRef}>
            <button
              onClick={toggleEditAvatar}
              className="relative group rounded-full shadow-lg border-4 border-white dark:border-slate-700 w-24 h-24 bg-slate-100"
            >
              <img
                src={isEditingAvatar && editAvatar ? editAvatar : avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || displayName)}&background=random`;
                }}
              />
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Pencil Badge (Bottom Left) */}
            <div className="absolute -bottom-0 -left-0 p-1.5 rounded-full bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 shadow-sm border-2 border-slate-100/30 dark:border-slate-700/30 z-10 pointer-events-none group-hover:text-indigo-600 transition-colors">
              <Pencil size={16} />
            </div>

            {/* Level Badge (Bottom Right) */}
            <div className="absolute -bottom-0 -right-3 px-2.5 py-0.5 rounded-full bg-blue-500/70 text-white shadow-sm text-sm font-black border-2 border-white/30 dark:border-slate-700/30 z-10 pointer-events-none">
              Lv.{level}
            </div>

            {/* Absolute Popup for Avatar Link */}
            {isEditingAvatar && (
              <div className="absolute -bottom-16 mt-2 w-[280px] z-50 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Dán Link Ảnh (https://...)"
                  autoFocus
                  className="flex-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-400"
                />
                <button
                  onClick={() => handleSaveProfile('avatar')}
                  disabled={saving}
                  className="p-2 rounded-xl text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors shrink-0"
                >
                  <Check size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Name Area */}
          <div className="w-full text-center flex flex-col items-center mt-2 relative" ref={nameEditRef}>
            <button
              onClick={toggleEditName}
              className="flex items-center justify-center gap-1.5 mb-1 group px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <h2 className="text-2xl font-black text-slate-800 dark:text-white truncate max-w-[200px]">{displayName}</h2>
              <Pencil size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>

            {isEditingName && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-2 animate-in zoom-in-95 duration-200">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tên hiển thị"
                  autoFocus
                  className="w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-400"
                />
                <button
                  onClick={() => handleSaveProfile('name')}
                  disabled={saving || !editName.trim()}
                  className="p-1.5 rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors shrink-0"
                >
                  <Check size={16} />
                </button>
              </div>
            )}

            <p className="text-sm text-slate-500 mb-3 truncate w-full">{user.email}</p>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full mt-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">Level {level}</span>
              <span className="text-xs font-bold text-slate-400">{totalExp} / {nextLevelExp} EXP</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Còn <span className="font-bold text-blue-500">{expNeededInLevel - expInLevel} EXP</span> nữa để lên cấp!
            </p>
          </div>
        </div>

        {/* Compact Leaderboards (acting as Total Score Summaries) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => setModalLeaderboard('study')}
            className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-3xl"
          >
            <LeaderboardWidget
              title="Tổng Học Tập"
              subtitle={
                <div className="flex flex-col items-center justify-center py-2">
                  <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {totalStudyScore.toLocaleString()}
                  </span>
                </div>
              }
              leaderboard={studyLeaderboard}
              loading={loadingStudy}
              currentUserId={user.uid}
              getScore={(u) => u.totalStudyScore || 0}
              size="sm"
              maxItems={4}
              footer={
                <div className="w-full text-center py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors uppercase tracking-wider">
                  Nhấn để xem toàn bộ ➔
                </div>
              }
            />
          </div>

          <div 
            onClick={() => setModalLeaderboard('race')}
            className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-3xl"
          >
            <LeaderboardWidget
              title="Tổng Đua Top"
              subtitle={
                <div className="flex flex-col items-center justify-center py-2">
                  <span className="text-4xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
                    {totalRaceScore.toLocaleString()}
                  </span>
                </div>
              }
              icon={<Trophy className="w-5 h-5 text-orange-500" />}
              leaderboard={raceLeaderboard}
              loading={loadingRace}
              currentUserId={user.uid}
              getScore={(u) => u.totalRaceScore || 0}
              size="sm"
              maxItems={4}
              footer={
                <div className="w-full text-center py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-orange-500 transition-colors uppercase tracking-wider">
                  Nhấn để xem toàn bộ ➔
                </div>
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        {/* HEATMAP SECTION */}
        <ActivityHeatmap activityHistory={activityHistory} />
      </div>



      </div>

      {/* LEADERBOARD MODALS */}
      {modalLeaderboard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setModalLeaderboard(null)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Trophy className={`w-6 h-6 ${modalLeaderboard === 'study' ? 'text-amber-500' : 'text-orange-500'}`} />
                {modalLeaderboard === 'study' ? 'Bảng Xếp Hạng Học Giả' : 'Bảng Xếp Hạng Đua Top'}
              </h3>
              <button
                onClick={() => setModalLeaderboard(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {modalLeaderboard === 'study' ? (
                <LeaderboardWidget
                  leaderboard={studyLeaderboard}
                  loading={loadingStudy}
                  currentUserId={user.uid}
                  getScore={(u) => u.totalStudyScore || 0}
                  size="md"
                  maxItems={50}
                  hideTitle={true}
                />
              ) : (
                <LeaderboardWidget
                  leaderboard={raceLeaderboard}
                  loading={loadingRace}
                  currentUserId={user.uid}
                  getScore={(u) => u.totalRaceScore || 0}
                  size="md"
                  maxItems={50}
                  hideTitle={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
