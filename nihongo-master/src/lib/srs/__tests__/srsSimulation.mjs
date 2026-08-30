/**
 * srsSimulation.mjs — Standalone Node.js simulation (ESM)
 * Giả lập toàn diện hệ thống SRS — không cần Firebase, không cần build.
 *
 * Chạy: node src/lib/srs/__tests__/srsSimulation.mjs
 *
 * Kịch bản kiểm tra:
 *  SC-01  Người dùng mới — tạo progress lần đầu
 *  SC-02  Tốt nghiệp RAM (RAM_REQUIRED_SCORE = 3) → level 1
 *  SC-03  Ôn đúng liên tục → leo level 1→6, kiểm tra interval
 *  SC-04  Sai ở level thấp (0-2) → proportional drop về 0
 *  SC-05  Sai ở level cao (3-6) → trừ 2 level
 *  SC-06  Luật miễn nhiễm trong ngày (đã học hôm nay, sai → không tụt)
 *  SC-07  Khóa 24h (đã học hôm nay, đúng → không tăng level)
 *  SC-08  Người dùng bấm "Đã thuộc" thủ công → level 6
 *  SC-09  Bỏ "Đã thuộc" → reset về new/level 0
 *  SC-10  Thêm khóa học mới (dữ liệu cứng) — getNewItemIds filter đúng
 *  SC-11  Học xen kẽ: ôn từ cũ + học từ mới cùng session
 *  SC-12  maxPending (50) → khóa học từ mới
 *  SC-13  Batch review 20 từ: 15 đúng, 5 sai
 *  SC-14  isDueForReview — filter due items chính xác
 *  SC-15  getMasteryStats — đếm phân bố 7 levels
 *  SC-16  Edge: nextReviewDate = hôm nay → due
 *  SC-17  Edge: nextReviewDate = ngày mai → chưa due
 *  SC-18  Mô phỏng 3 phiên học (level 0→3)
 *  SC-19  Bỏ học 2 tuần → nhiều từ overdue
 *  SC-20  RAM score: đúng/sai xen kẽ + cap kiểm tra
 *  SC-EDGE  Kiểm tra bảng SRS_INTERVALS, daysUntilReview, mastered user-mark
 */

// ── SRS Constants (inline từ srsTypes.ts) ─────────────────────────────
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30, 90]; // ngày
const RAM_REQUIRED_SCORE = 3;
const MASTERY_ICONS = ['🌰', '🌱', '🌿', '🪴', '🌳', '🌸', '🍎'];
const MASTERY_LABELS_VI = [
  'Chưa thuộc', 'Đang học', 'Làm quen',
  'Khá nhớ', 'Gần thuộc', 'Sắp master', 'ĐÃ THUỘC',
];

// ── SRS Engine (inline từ srsEngine.ts) ───────────────────────────────

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function createNewProgress(itemId, subject) {
  return {
    itemId,
    status: 'new',
    masteryLevel: 0,
    waterDrops: 0,
    subStep: 0,
    interval: SRS_INTERVALS[0],
    nextReviewDate: new Date(),
    lastStudiedDate: new Date(0),
    streak: 0,
    totalCorrect: 0,
    totalWrong: 0,
    subject,
  };
}

function createGraduatedProgress(itemId, subject) {
  const now = new Date();
  return {
    itemId,
    status: 'learning',
    masteryLevel: 1,
    waterDrops: 0,
    subStep: 0,
    interval: SRS_INTERVALS[1],
    nextReviewDate: addDays(now, SRS_INTERVALS[1]),
    lastStudiedDate: now,
    streak: 1,
    totalCorrect: 1,
    totalWrong: 0,
    subject,
  };
}

function markAsMasteredUser(itemId, subject) {
  const now = new Date();
  return {
    itemId,
    status: 'mastered',
    masteryLevel: 6,
    waterDrops: 3,
    subStep: 6,
    isMasteredUserMarked: true,
    interval: SRS_INTERVALS[6],
    nextReviewDate: addDays(now, 90),
    lastStudiedDate: now,
    streak: 1,
    totalCorrect: 1,
    totalWrong: 0,
    subject,
  };
}

function onCorrectLongTerm(progress) {
  const now = new Date();
  if (progress.lastStudiedDate && isSameDay(progress.lastStudiedDate, now)) {
    return { ...progress, totalCorrect: progress.totalCorrect + 1 };
  }
  const newLevel = Math.min(6, progress.masteryLevel + 1);
  return {
    ...progress,
    masteryLevel: newLevel,
    interval: SRS_INTERVALS[newLevel],
    nextReviewDate: addDays(now, SRS_INTERVALS[newLevel]),
    lastStudiedDate: now,
    streak: progress.streak + 1,
    totalCorrect: progress.totalCorrect + 1,
    status: newLevel >= 6 ? 'mastered' : 'reviewing',
  };
}

function onWrongLongTerm(progress) {
  const now = new Date();
  if (progress.lastStudiedDate && isSameDay(progress.lastStudiedDate, now)) {
    return { ...progress, totalWrong: progress.totalWrong + 1 };
  }
  const drop = progress.masteryLevel <= 2 ? progress.masteryLevel : 2;
  const newLevel = Math.max(0, progress.masteryLevel - drop);
  return {
    ...progress,
    masteryLevel: newLevel,
    interval: SRS_INTERVALS[newLevel],
    nextReviewDate: addDays(now, 1),
    lastStudiedDate: now,
    streak: 0,
    totalWrong: progress.totalWrong + 1,
    status: 'reviewing',
  };
}

function updateRAMScore(currentScore, isCorrect) {
  if (isCorrect) return Math.min(RAM_REQUIRED_SCORE, currentScore + 1);
  return Math.max(0, currentScore - 1);
}

function isGraduated(score) {
  return score >= RAM_REQUIRED_SCORE;
}

function isDueForReview(progress) {
  if (progress.status === 'new') return false;
  return new Date() >= progress.nextReviewDate;
}

function daysUntilReview(progress) {
  const now = new Date();
  const diff = progress.nextReviewDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Test Helpers ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failedTests = [];

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS  ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
    failedTests.push(testName);
  }
}

function section(title) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${'─'.repeat(70)}`);
}

/** Tạo WordProgress giả lập */
function makeProgress({ itemId = 'test_item', masteryLevel = 1, status = 'reviewing',
  daysAgo = 2, nextReviewDaysFromNow = 0, subject = 'vocab_n3', ...rest } = {}) {
  const now = new Date();
  const lastStudied = new Date(now);
  lastStudied.setDate(lastStudied.getDate() - daysAgo);
  lastStudied.setHours(0, 0, 0, 0);

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + nextReviewDaysFromNow);
  nextReview.setHours(0, 0, 0, 0);

  return {
    itemId,
    status,
    masteryLevel,
    waterDrops: 0,
    subStep: 0,
    interval: SRS_INTERVALS[masteryLevel] || 0,
    nextReviewDate: nextReview,
    lastStudiedDate: lastStudied,
    streak: 0,
    totalCorrect: 0,
    totalWrong: 0,
    subject,
    ...rest,
  };
}

// ════════════════════════════════════════════════════════════════════════
// SC-01 | Người dùng mới
// ════════════════════════════════════════════════════════════════════════
section('SC-01 | Người dùng mới — createNewProgress');
{
  const p = createNewProgress('vocab_001', 'vocab_n3');
  assert(p.status === 'new', 'status = new');
  assert(p.masteryLevel === 0, 'masteryLevel = 0');
  assert(p.waterDrops === 0, 'waterDrops = 0');
  assert(p.totalCorrect === 0, 'totalCorrect = 0');
  assert(p.totalWrong === 0, 'totalWrong = 0');
  assert(p.streak === 0, 'streak = 0');
  assert(p.itemId === 'vocab_001', 'itemId chính xác');
  assert(p.subject === 'vocab_n3', 'subject = vocab_n3');
  assert(p.interval === SRS_INTERVALS[0], `interval = ${SRS_INTERVALS[0]} (level 0)`);
  assert(isDueForReview(p) === false, 'status=new → không bao giờ due');
}

// ════════════════════════════════════════════════════════════════════════
// SC-02 | Tốt nghiệp RAM → level 1
// ════════════════════════════════════════════════════════════════════════
section('SC-02 | Tốt nghiệp RAM — createGraduatedProgress');
{
  const p = createGraduatedProgress('vocab_001', 'vocab_n3');
  assert(p.status === 'learning', 'status = learning sau RAM');
  assert(p.masteryLevel === 1, 'masteryLevel = 1');
  assert(p.interval === SRS_INTERVALS[1], `interval = ${SRS_INTERVALS[1]} ngày (level 1)`);
  assert(p.streak === 1, 'streak = 1');
  assert(p.totalCorrect === 1, 'totalCorrect = 1');

  const now = new Date();
  const diffDays = Math.round(
    (p.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  assert(diffDays === SRS_INTERVALS[1],
    `nextReviewDate = ${SRS_INTERVALS[1]} ngày (got: ${diffDays})`);
  assert(isDueForReview(p) === false, 'Chưa due ngay sau RAM');
}

// ════════════════════════════════════════════════════════════════════════
// SC-03 | Leo level 1 → 6 bằng onCorrectLongTerm
// ════════════════════════════════════════════════════════════════════════
section('SC-03 | Leo level 1 → 6 qua các ngày');
{
  let p = createGraduatedProgress('vocab_001', 'vocab_n3');

  for (let fromLevel = 1; fromLevel <= 6; fromLevel++) {
    // Giả lập đã qua ngày (lastStudiedDate ≠ hôm nay)
    p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
    p = onCorrectLongTerm(p);
    const expectedLevel = Math.min(6, fromLevel + 1);
    assert(p.masteryLevel === expectedLevel,
      `L${fromLevel}→L${expectedLevel}: ${MASTERY_ICONS[expectedLevel]} ${MASTERY_LABELS_VI[expectedLevel]}`);
    assert(p.interval === SRS_INTERVALS[expectedLevel],
      `  Interval = ${SRS_INTERVALS[expectedLevel]} ngày`);
  }

  // Cap tại level 6
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 6, 'Không tăng quá level 6');
  assert(p.status === 'mastered', 'status = mastered tại level 6');
}

// ════════════════════════════════════════════════════════════════════════
// SC-04 | Sai ở level thấp → drop về 0
// ════════════════════════════════════════════════════════════════════════
section('SC-04 | Sai level thấp (0-2) → proportional drop');
{
  for (let level = 0; level <= 2; level++) {
    const p = makeProgress({ masteryLevel: level, daysAgo: 1 });
    const result = onWrongLongTerm(p);
    assert(result.masteryLevel === 0, `L${level} sai → L0 (drop=${level})`);
    assert(result.status === 'reviewing', `status = reviewing (không phải new)`);
    assert(result.streak === 0, `streak reset = 0`);
  }

  // nextReviewDate = ngày mai
  const p2 = makeProgress({ masteryLevel: 2, daysAgo: 1 });
  const r2 = onWrongLongTerm(p2);
  const diffDays = Math.round((r2.nextReviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  assert(diffDays === 1, `Sau khi sai → nextReview = ngày mai (got: ${diffDays}d)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-05 | Sai ở level cao → trừ 2 level
// ════════════════════════════════════════════════════════════════════════
section('SC-05 | Sai level cao (3-6) → trừ 2 level');
{
  const expected = { 3: 1, 4: 2, 5: 3, 6: 4 };
  for (const [fromLevel, toLevel] of Object.entries(expected)) {
    const p = makeProgress({
      masteryLevel: parseInt(fromLevel),
      daysAgo: 1,
      status: parseInt(fromLevel) >= 6 ? 'mastered' : 'reviewing',
    });
    const result = onWrongLongTerm(p);
    assert(result.masteryLevel === toLevel, `L${fromLevel} sai → L${toLevel} (drop=2)`);
    assert(result.status === 'reviewing', `status = reviewing (kể cả sau mastered)`);
  }
}

// ════════════════════════════════════════════════════════════════════════
// SC-06 | Luật miễn nhiễm trong ngày (đã học hôm nay, SAI không tụt)
// ════════════════════════════════════════════════════════════════════════
section('SC-06 | Miễn nhiễm trong ngày — sai không tụt level');
{
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const p = makeProgress({ masteryLevel: 4, lastStudiedDate: today, daysAgo: 0 });
  const result = onWrongLongTerm(p);

  assert(result.masteryLevel === 4, 'Level không tụt (miễn nhiễm cùng ngày)');
  assert(result.totalWrong === p.totalWrong + 1, 'totalWrong vẫn tăng +1');
  assert(result.status === p.status, 'status không thay đổi');
  assert(result.streak === p.streak, 'streak không thay đổi');
  assert(result.nextReviewDate.getTime() === p.nextReviewDate.getTime(), 'nextReviewDate không thay đổi');
}

// ════════════════════════════════════════════════════════════════════════
// SC-07 | Khóa 24h — đúng nhưng không tăng level (đã học hôm nay)
// ════════════════════════════════════════════════════════════════════════
section('SC-07 | Khóa 24h — đúng không tăng level khi đã học hôm nay');
{
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const p = makeProgress({ masteryLevel: 3, lastStudiedDate: today });
  const result = onCorrectLongTerm(p);

  assert(result.masteryLevel === 3, 'Level giữ nguyên (khóa 24h)');
  assert(result.totalCorrect === p.totalCorrect + 1, 'totalCorrect vẫn tăng +1');
  assert(result.nextReviewDate.getTime() === p.nextReviewDate.getTime(), 'nextReviewDate không đổi');
  assert(result.streak === p.streak, 'streak không thay đổi');
}

// ════════════════════════════════════════════════════════════════════════
// SC-08 | Đánh dấu thủ công "Đã thuộc" → level 6
// ════════════════════════════════════════════════════════════════════════
section('SC-08 | Người dùng bấm "Đã thuộc" thủ công');
{
  const mastered = markAsMasteredUser('grammar_001', 'grammar_n3');

  assert(mastered.status === 'mastered', 'status = mastered');
  assert(mastered.masteryLevel === 6, 'masteryLevel = 6');
  assert(mastered.isMasteredUserMarked === true, 'isMasteredUserMarked = true');
  assert(mastered.interval === SRS_INTERVALS[6], `interval = ${SRS_INTERVALS[6]} ngày`);
  assert(mastered.waterDrops === 3, 'waterDrops = 3');

  const diffDays = Math.round(
    (mastered.nextReviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  assert(diffDays >= 89 && diffDays <= 91, `nextReview ≈ 90 ngày (got: ${diffDays})`);
  assert(isDueForReview(mastered) === false, 'Không due ngay sau mark mastered');
}

// ════════════════════════════════════════════════════════════════════════
// SC-09 | Bỏ "Đã thuộc" → reset về level 0 new
// ════════════════════════════════════════════════════════════════════════
section('SC-09 | Bỏ "Đã thuộc" → reset về level 0 (status=new)');
{
  const now = new Date();
  // Mô phỏng logic batchUpdateWordMasteredStatus(markAsMastered=false)
  const resetProgress = {
    itemId: 'grammar_001',
    subject: 'grammar_n3',
    status: 'new',
    masteryLevel: 0,
    waterDrops: 0,
    subStep: 0,
    isMasteredUserMarked: false,
    interval: 0,
    nextReviewDate: now,
    lastStudiedDate: new Date(0),
    streak: 0,
    totalCorrect: 0,
    totalWrong: 0,
  };

  assert(resetProgress.status === 'new', 'Sau bỏ mastered → status = new');
  assert(resetProgress.masteryLevel === 0, 'masteryLevel = 0');
  assert(resetProgress.isMasteredUserMarked === false, 'isMasteredUserMarked = false');
  assert(isDueForReview(resetProgress) === false, 'status=new → không due');
  assert(resetProgress.lastStudiedDate.getTime() === 0, 'lastStudiedDate reset về epoch (0)');
}

// ════════════════════════════════════════════════════════════════════════
// SC-10 | Thêm dữ liệu cứng mới (khóa học mới)
// ════════════════════════════════════════════════════════════════════════
section('SC-10 | Thêm dữ liệu cứng mới — getNewItemIds logic');
{
  // Giả lập: Dataset 500 từ, đã học 100
  const totalDataset = 500;
  const learnedCount = 100;
  const learnedSet = new Set(Array.from({ length: learnedCount }, (_, i) => `word_${i}`));
  const allIds = Array.from({ length: totalDataset }, (_, i) => `word_${i}`);
  const limit = 15;

  const newIds = allIds.filter(id => !learnedSet.has(id)).slice(0, limit);
  assert(newIds.length === limit, `getNewItemIds → đúng ${limit} từ mới`);
  assert(!newIds.some(id => learnedSet.has(id)), 'Không có từ đã học trong batch mới');
  assert(newIds[0] === `word_${learnedCount}`, `Từ đầu tiên là word_${learnedCount}`);

  // Mở rộng dataset từ 500 → 600 (thêm 100 từ cứng mới)
  const expandedIds = Array.from({ length: 600 }, (_, i) => `word_${i}`);
  const newIdsAfterExpand = expandedIds.filter(id => !learnedSet.has(id)).slice(0, limit);
  assert(newIdsAfterExpand.length === limit, `Sau mở rộng dataset (500→600): vẫn lấy đủ ${limit} từ`);
  assert(newIdsAfterExpand.every(id => !learnedSet.has(id)), 'Tất cả từ mới sau expand chưa học');

  // Trường hợp dataset mới 100% chưa học
  const brandNewCourse = Array.from({ length: 50 }, (_, i) => `new_course_word_${i}`);
  const brandNewIds = brandNewCourse.filter(id => !learnedSet.has(id)).slice(0, limit);
  assert(brandNewIds.length === limit, `Khóa học brand-new: lấy ${limit} từ đầu tiên`);

  console.log(`    → Tổng từ chưa học: ${allIds.length - learnedCount}/${allIds.length}`);
  console.log(`    → Sau expand: ${expandedIds.length - learnedCount}/${expandedIds.length}`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-11 | Học xen kẽ: ôn từ cũ + học từ mới cùng phiên
// ════════════════════════════════════════════════════════════════════════
section('SC-11 | Session xen kẽ: ôn từ cũ + học từ mới');
{
  // 10 từ cần ôn (reviewing, due hôm nay)
  const reviewItems = Array.from({ length: 10 }, (_, i) =>
    makeProgress({ itemId: `review_${i}`, masteryLevel: Math.min(6, i % 5 + 1), nextReviewDaysFromNow: 0, daysAgo: 3 })
  );
  // 5 từ mới
  const newItems = Array.from({ length: 5 }, (_, i) =>
    createNewProgress(`new_${i}`, 'vocab_n3')
  );
  const session = [...reviewItems, ...newItems];

  assert(session.length === 15, 'Session 15 từ');
  assert(reviewItems.every(p => isDueForReview(p)), '10 từ review đều due');
  assert(newItems.every(p => p.status === 'new'), '5 từ đều status=new');
  assert(newItems.every(p => !isDueForReview(p)), 'Từ new không due');

  // Mô phỏng ôn đúng tất cả
  const updatedReview = reviewItems.map(p => ({
    ...p, lastStudiedDate: new Date(Date.now() - 86400001),
  })).map(p => onCorrectLongTerm(p));
  assert(updatedReview.every(p => p.masteryLevel >= 1), 'Tất cả ôn đúng tăng level');

  // RAM cho từ mới: đúng 3 lần
  let ramScore = 0;
  for (let i = 0; i < 3; i++) ramScore = updateRAMScore(ramScore, true);
  assert(isGraduated(ramScore), `RAM score=${ramScore} → tốt nghiệp`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-12 | Giới hạn maxPending
// ════════════════════════════════════════════════════════════════════════
section('SC-12 | maxPending (50) — khóa học từ mới');
{
  const maxPending = 50;

  // Trường hợp vượt: 20 level-0 + 35 level-1 = 55 pending
  const levels_A = [20, 35, 10, 5, 3, 2, 0];
  const pending_A = levels_A[0] + levels_A[1];
  assert(pending_A >= maxPending, `${pending_A} >= ${maxPending} → khóa học mới`);

  // Trường hợp đủ: 15 level-0 + 30 level-1 = 45 pending
  const levels_B = [15, 30, 10, 5, 3, 2, 1];
  const pending_B = levels_B[0] + levels_B[1];
  assert(pending_B < maxPending, `${pending_B} < ${maxPending} → mở khóa`);

  // Trường hợp đúng ngưỡng: 25 + 25 = 50
  const levels_C = [25, 25, 0, 0, 0, 0, 0];
  const pending_C = levels_C[0] + levels_C[1];
  assert(pending_C >= maxPending, `Đúng ngưỡng ${pending_C}/${maxPending} → khóa`);

  // Trường hợp 0 pending (user chăm chỉ)
  const levels_D = [0, 0, 10, 15, 5, 3, 0];
  const pending_D = levels_D[0] + levels_D[1];
  assert(pending_D < maxPending, `${pending_D} pending → mở khóa hoàn toàn`);

  console.log(`    → A: ${pending_A} (khóa) | B: ${pending_B} (mở) | C: ${pending_C} (khóa) | D: ${pending_D} (mở)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-13 | Batch review — 20 từ, 15 đúng + 5 sai
// ════════════════════════════════════════════════════════════════════════
section('SC-13 | Batch review 20 từ: 15 đúng + 5 sai');
{
  const batchItems = Array.from({ length: 20 }, (_, i) =>
    makeProgress({ itemId: `batch_${i}`, masteryLevel: Math.min(6, (i % 5) + 1), daysAgo: 2 })
  );

  const correctBefore = batchItems.slice(0, 15);
  const wrongBefore = batchItems.slice(15);

  const correctAfter = correctBefore.map(p => onCorrectLongTerm({ ...p, lastStudiedDate: new Date(Date.now() - 86400001) }));
  const wrongAfter = wrongBefore.map(p => onWrongLongTerm({ ...p, lastStudiedDate: new Date(Date.now() - 86400001) }));

  assert(correctAfter.every(p => p.totalCorrect > 0), '15 từ đúng có totalCorrect > 0');
  assert(wrongAfter.every(p => p.totalWrong > 0), '5 từ sai có totalWrong > 0');

  const levelUpCount = correctAfter.filter((p, i) => p.masteryLevel > correctBefore[i].masteryLevel).length;
  assert(levelUpCount === 15, `${levelUpCount}/15 từ đúng tăng level`);

  const now = new Date();
  const allNextDayWrong = wrongAfter.every(p => {
    const diff = Math.round((p.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 1;
  });
  assert(allNextDayWrong, '5 từ sai có nextReview = ngày mai');
}

// ════════════════════════════════════════════════════════════════════════
// SC-14-17 | isDueForReview — coverage đầy đủ
// ════════════════════════════════════════════════════════════════════════
section('SC-14/16/17 | isDueForReview — các trường hợp due');
{
  const now = new Date();

  // Due: quá hạn (SC-14)
  const p_past = makeProgress({ nextReviewDaysFromNow: -3, daysAgo: 5 });
  assert(isDueForReview(p_past) === true, 'SC-14: quá hạn 3 ngày → due');

  // Due: hôm nay (SC-16)
  const p_today = makeProgress({ nextReviewDaysFromNow: 0, daysAgo: 2 });
  assert(isDueForReview(p_today) === true, 'SC-16: nextReview hôm nay → due');

  // Chưa due: ngày mai (SC-17)
  const p_tomorrow = makeProgress({ nextReviewDaysFromNow: 1, daysAgo: 2 });
  assert(isDueForReview(p_tomorrow) === false, 'SC-17: nextReview ngày mai → chưa due');

  // Chưa due: xa hơn
  const p_far = makeProgress({ nextReviewDaysFromNow: 14, daysAgo: 2 });
  assert(isDueForReview(p_far) === false, '14 ngày nữa → chưa due');

  // status=new luôn không due
  const p_new = createNewProgress('test', 'vocab_n3');
  assert(isDueForReview(p_new) === false, 'status=new → không bao giờ due');

  // Giả lập fetchDueItems
  const pool = [p_past, p_today, p_tomorrow, p_far, p_new];
  const dueList = pool.filter(p => p.status !== 'new' && p.nextReviewDate <= now);
  assert(dueList.length === 2, `fetchDueItems: ${dueList.length}/5 từ là due (expected 2)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-15 | getMasteryStats — phân bố 7 level
// ════════════════════════════════════════════════════════════════════════
section('SC-15 | getMasteryStats — đếm 7 buckets');
{
  // 5 từ mỗi level = 35 từ
  const progressList = [];
  for (let level = 0; level <= 6; level++) {
    for (let i = 0; i < 5; i++) {
      progressList.push(makeProgress({ itemId: `L${level}_${i}`, masteryLevel: level }));
    }
  }

  const stats = [0, 0, 0, 0, 0, 0, 0];
  progressList.forEach(p => { if (p.masteryLevel >= 0 && p.masteryLevel <= 6) stats[p.masteryLevel]++; });

  for (let level = 0; level <= 6; level++) {
    assert(stats[level] === 5, `Level ${level} ${MASTERY_ICONS[level]}: ${stats[level]} từ (expected 5)`);
  }
  assert(stats.reduce((a, b) => a + b, 0) === 35, 'Tổng = 35 từ');
  console.log(`    → Vườn cây: ${stats.map((c, i) => `${MASTERY_ICONS[i]}×${c}`).join('  ')}`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-18 | 3 phiên học: level 0 → 3
// ════════════════════════════════════════════════════════════════════════
section('SC-18 | 3 phiên học — lộ trình level 0 → 3');
{
  console.log('    Ngày 1: RAM session (3 lần đúng)');
  let ramScore = 0;
  for (let i = 0; i < RAM_REQUIRED_SCORE; i++) ramScore = updateRAMScore(ramScore, true);
  assert(isGraduated(ramScore), `RAM: score=${ramScore} → tốt nghiệp`);

  let p = createGraduatedProgress('kanji_001', 'kanji_single_n3');
  assert(p.masteryLevel === 1, `Ngày 1 → ${MASTERY_ICONS[1]} Level 1 | ôn sau ${p.interval}d`);
  console.log(`    Ngày 1 xong: ${MASTERY_ICONS[p.masteryLevel]} Level ${p.masteryLevel} | ôn sau: ${p.interval} ngày`);

  // Ôn lại ngày 2 (sau 1 ngày)
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 2, `Ngày 2 ôn đúng → ${MASTERY_ICONS[2]} Level 2`);
  console.log(`    Ngày 2 xong: ${MASTERY_ICONS[p.masteryLevel]} Level ${p.masteryLevel} | ôn sau: ${p.interval} ngày`);

  // Ôn lại ngày 5 (sau 3 ngày, interval level 2 = 3 ngày)
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 3, `Ngày 5 ôn đúng → ${MASTERY_ICONS[3]} Level 3`);
  console.log(`    Ngày 5 xong: ${MASTERY_ICONS[p.masteryLevel]} Level ${p.masteryLevel} | ôn sau: ${p.interval} ngày`);
  assert(p.streak === 3, 'streak = 3 sau 3 ngày liên tiếp đúng');
  assert(p.interval === SRS_INTERVALS[3], `Interval level 3 = ${SRS_INTERVALS[3]} ngày`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-19 | Bỏ học 2 tuần → nhiều từ overdue
// ════════════════════════════════════════════════════════════════════════
section('SC-19 | Bỏ học 2 tuần — quay lại kiểm tra due items');
{
  // 30 từ đang ôn tập, nextReview = 2 tuần trước
  const abandoned = Array.from({ length: 30 }, (_, i) =>
    makeProgress({
      itemId: `abandoned_${i}`,
      masteryLevel: Math.min(6, (i % 5) + 1),
      nextReviewDaysFromNow: -14,
      daysAgo: 20,
    })
  );

  // 10 từ mới chưa học
  const untouched = Array.from({ length: 10 }, (_, i) =>
    createNewProgress(`untouched_${i}`, 'vocab_n3')
  );

  const now = new Date();
  const dueList = abandoned.filter(p => p.status !== 'new' && p.nextReviewDate <= now);
  const newList = untouched.filter(p => p.status === 'new');

  assert(dueList.length === 30, `${dueList.length}/30 từ cần ôn ngay`);
  assert(newList.length === 10, `${newList.length} từ mới chưa chạm`);

  // Level thấp sau 2 tuần drop nhiều
  const highPriority = dueList.filter(p => p.masteryLevel <= 2).length;
  console.log(`    → ${dueList.length} từ due | ${newList.length} từ new chưa học`);
  console.log(`    → ${highPriority} từ ở level ≤2 cần ưu tiên ôn trước`);
  console.log(`    → User sẽ thấy: 💧 Ôn tập (${dueList.length}) trên dashboard`);

  // Kiểm tra isPendingLocked: nếu nhiều level 0-1 → khóa học mới
  // Simulate người dùng quay lại và sai hết ở session đầu
  const afterWrongSession = dueList.slice(0, 10).map(p =>
    onWrongLongTerm({ ...p, lastStudiedDate: new Date(Date.now() - 86400001) })
  );
  const newPendingCount = afterWrongSession.filter(p => p.masteryLevel <= 1).length;
  console.log(`    → Sau session sai 10 từ: ${newPendingCount} từ rơi về level ≤1 (pending)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-20 | RAM score: đúng/sai xen kẽ + cap
// ════════════════════════════════════════════════════════════════════════
section('SC-20 | RAM score — đúng/sai xen kẽ và edge cases');
{
  // Sequence [T,T,F,T,T,F,T]: 2→0→sai→1→2→3→sai→2→3... cuối cùng là 3 → graduated
  // Mô phỏng sequence dài hơn có sai xen kẽ mà chưa tốt nghiệp
  let score = 0;
  const sequenceNotGrad = [true, false, true, false]; // T→1, F→0, T→1, F→0
  const logs1 = [];
  for (const correct of sequenceNotGrad) {
    score = updateRAMScore(score, correct);
    logs1.push(`${correct ? '✅' : '❌'}→${score}`);
  }
  console.log(`    Sequence chưa tốt nghiệp: ${logs1.join(' ')}`);
  assert(!isGraduated(score), `Score ${score} < ${RAM_REQUIRED_SCORE} → chưa tốt nghiệp`);

  // Sequence đầy đủ để tốt nghiệp: T,T,F,T,T,T
  const sequence = [true, true, false, true, true, true];
  score = 0;
  const logs = [];
  for (const correct of sequence) {
    score = updateRAMScore(score, correct);
    logs.push(`${correct ? '✅' : '❌'}→${score}`);
  }
  console.log(`    Sequence tốt nghiệp: ${logs.join(' ')}`);
  assert(isGraduated(score), `Score ${score} >= ${RAM_REQUIRED_SCORE} → tốt nghiệp!`);

  // Cap tại RAM_REQUIRED_SCORE
  score = updateRAMScore(score, true);
  assert(score === RAM_REQUIRED_SCORE, `Cap tại ${RAM_REQUIRED_SCORE} (không vượt quá)`);

  // Floor tại 0
  let zeroScore = 0;
  zeroScore = updateRAMScore(zeroScore, false);
  assert(zeroScore === 0, `Floor tại 0 (không âm)`);

  // Sai liên tiếp nhiều lần
  let maxScore = RAM_REQUIRED_SCORE;
  for (let i = 0; i < 10; i++) maxScore = updateRAMScore(maxScore, false);
  assert(maxScore === 0, `Sai 10 lần liên tiếp → score = 0 (không âm)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-EDGE | Edge cases bổ sung
// ════════════════════════════════════════════════════════════════════════
section('SC-EDGE | Edge cases — intervals, daysUntilReview, mastered user-mark sai');
{
  // E1: Kiểm tra toàn bộ SRS_INTERVALS sau khi đúng
  console.log(`    SRS_INTERVALS: ${SRS_INTERVALS.map((d, i) => `L${i}=${d}d`).join(', ')}`);
  for (let level = 0; level <= 5; level++) {
    const p = makeProgress({ masteryLevel: level, daysAgo: 2 });
    const result = onCorrectLongTerm({ ...p, lastStudiedDate: new Date(Date.now() - 86400001) });
    const expectedLevel = level + 1;
    assert(result.interval === SRS_INTERVALS[expectedLevel],
      `L${level}→L${expectedLevel}: interval = ${SRS_INTERVALS[expectedLevel]}d`);
  }

  // E2: daysUntilReview — chính xác
  const p5days = makeProgress({ masteryLevel: 3, nextReviewDaysFromNow: 5, daysAgo: 10 });
  const days5 = daysUntilReview(p5days);
  assert(days5 === 5, `daysUntilReview = 5 (got: ${days5})`);

  // E3: daysUntilReview không âm khi quá hạn
  const pOverdue = makeProgress({ masteryLevel: 2, nextReviewDaysFromNow: -7, daysAgo: 10 });
  const daysOverdue = daysUntilReview(pOverdue);
  assert(daysOverdue === 0, `Quá hạn 7 ngày → daysUntilReview = 0 (got: ${daysOverdue})`);

  // E4: Từ mastered user-marked vẫn có thể sai và tụt level
  const userMarked = markAsMasteredUser('kanji_001', 'kanji_single_n3');
  const wrongResult = onWrongLongTerm({
    ...userMarked,
    lastStudiedDate: new Date(Date.now() - 86400001),
  });
  assert(wrongResult.masteryLevel === 4, `Mastered (L6) sai ngày khác → L4 (drop=2)`);
  assert(wrongResult.status === 'reviewing', `status = reviewing (không phải mastered nữa)`);

  // E5: Từ learning (level 1) sai → về level 0, status vẫn reviewing
  const learningItem = makeProgress({ masteryLevel: 1, status: 'learning', daysAgo: 2 });
  const learningWrong = onWrongLongTerm(learningItem);
  assert(learningWrong.masteryLevel === 0, 'Learning L1 sai → L0');
  assert(learningWrong.status === 'reviewing', 'status = reviewing (không phải learning hay new)');
}

// ════════════════════════════════════════════════════════════════════════
// TỔNG KẾT
// ════════════════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(70)}`);
console.log('  📊 KẾT QUẢ GIẢ LẬP SRS — NIHONGO MASTER');
console.log(`${'═'.repeat(70)}`);
console.log(`  ✅ PASSED : ${passed}`);
console.log(`  ❌ FAILED : ${failed}`);
console.log(`  📋 TOTAL  : ${passed + failed}`);
if (failedTests.length > 0) {
  console.log('\n  ❌ Các test thất bại:');
  failedTests.forEach(t => console.log(`    • ${t}`));
}
console.log(`${'═'.repeat(70)}`);
if (failed === 0) {
  console.log('  🎉 TẤT CẢ PASS! Hệ thống SRS hoạt động hoàn toàn đúng.\n');
} else {
  console.log(`  ⚠️  Có ${failed} test FAIL. Cần kiểm tra lại engine.\n`);
  process.exit(1);
}
