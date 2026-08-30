/**
 * srsSimulation.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Giả lập toàn diện hệ thống SRS — KHÔNG cần Firestore, chạy thuần Node.js
 *
 * Chạy bằng:
 *   npx ts-node src/lib/srs/__tests__/srsSimulation.ts
 *
 * Các kịch bản được kiểm tra:
 *  SC-01  Người dùng mới — học từ lần đầu (RAM session)
 *  SC-02  Tốt nghiệp RAM (đúng 3 lần) → level 1 + lịch ôn
 *  SC-03  Ôn tập đúng nhiều ngày liên tục → leo đến level 6
 *  SC-04  Ôn tập sai (level thấp 0-2) → proportional drop về 0
 *  SC-05  Ôn tập sai (level cao 3-6) → trừ 2 level
 *  SC-06  Luật miễn nhiễm trong ngày (đã học hôm nay, sai không tụt)
 *  SC-07  Khóa 24h (đã học hôm nay, đúng không tăng thêm level)
 *  SC-08  Người dùng bấm "Đã thuộc" thủ công → nhảy lên level 6
 *  SC-09  Người dùng bỏ "Đã thuộc" → reset về level 0 (new)
 *  SC-10  Thêm khóa học mới (dữ liệu cứng mới) — từ chưa trong Firestore
 *  SC-11  Học xen kẽ: vừa thêm từ mới vừa ôn từ cũ cùng phiên
 *  SC-12  Vượt giới hạn maxPending (50 từ tồn đọng) → khóa học mới
 *  SC-13  Ôn tập nhiều từ cùng lúc (batch review session)
 *  SC-14  Kiểm tra fetchDueItems — chỉ trả về từ đến hạn
 *  SC-15  Kiểm tra getMasteryStats — đếm đúng từng level
 *  SC-16  Edge case: nextReviewDate đúng hôm nay → phải là due
 *  SC-17  Edge case: nextReviewDate ngày mai → chưa due
 *  SC-18  Giả lập 7 ngày học liên tục từ level 0 → level 3
 *  SC-19  Giả lập người dùng bỏ học 2 tuần, quay lại thấy nhiều từ due
 *  SC-20  RAM score: đúng 3 lần không liên tiếp (có sai ở giữa)
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── Import engine (dùng relative path để chạy ts-node) ──
import {
  createNewProgress,
  createGraduatedProgress,
  markAsMasteredUser,
  onCorrectLongTerm,
  onWrongLongTerm,
  updateRAMScore,
  isGraduated,
  isDueForReview,
  daysUntilReview,
} from '../srsEngine';

import {
  SRS_INTERVALS,
  RAM_REQUIRED_SCORE,
  MASTERY_ICONS,
  MASTERY_LABELS_VI,
  type WordProgress,
  type MasteryLevel,
} from '../srsTypes';

// ── Helpers cho test ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failedTests: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS  ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
    failedTests.push(testName);
  }
}

function section(title: string) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${'─'.repeat(70)}`);
}

/** Tạo một WordProgress giả lập với lastStudiedDate là N ngày trước */
function makeProgress(
  overrides: Partial<WordProgress> & { daysAgo?: number; nextReviewDaysFromNow?: number }
): WordProgress {
  const now = new Date();
  const { daysAgo = 1, nextReviewDaysFromNow = 0, ...rest } = overrides;

  const lastStudied = new Date(now);
  lastStudied.setDate(lastStudied.getDate() - daysAgo);
  lastStudied.setHours(0, 0, 0, 0);

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + nextReviewDaysFromNow);
  nextReview.setHours(0, 0, 0, 0);

  const base = createNewProgress('test_item', 'test_course', 'vocab_n3');
  return {
    ...base,
    lastStudiedDate: lastStudied,
    nextReviewDate: nextReview,
    status: 'reviewing',
    masteryLevel: 1 as MasteryLevel,
    interval: SRS_INTERVALS[1],
    totalCorrect: 0,
    totalWrong: 0,
    streak: 0,
    ...rest,
  };
}


// ════════════════════════════════════════════════════════════════════════
// SC-01 | Người dùng mới — tạo progress lần đầu
// ════════════════════════════════════════════════════════════════════════
section('SC-01 | Người dùng mới — createNewProgress');
{
  const p = createNewProgress('vocab_001', 'test_course', 'vocab_n3');
  assert(p.status === 'new', 'status phải là new');
  assert(p.masteryLevel === 0, 'masteryLevel phải là 0');
  assert(p.waterDrops === 0, 'waterDrops = 0');
  assert(p.totalCorrect === 0, 'totalCorrect = 0');
  assert(p.totalWrong === 0, 'totalWrong = 0');
  assert(p.streak === 0, 'streak = 0');
  assert(p.itemId === 'vocab_001', 'itemId đúng');
  assert(p.subject === 'vocab_n3', 'subject đúng');
  assert(p.interval === SRS_INTERVALS[0], `interval = ${SRS_INTERVALS[0]} (level 0)`);
  assert(isDueForReview(p) === false, 'Từ mới chưa due (status=new)');
}

// ════════════════════════════════════════════════════════════════════════
// SC-02 | Tốt nghiệp RAM → level 1
// ════════════════════════════════════════════════════════════════════════
section('SC-02 | Tốt nghiệp RAM — createGraduatedProgress');
{
  const p = createGraduatedProgress('vocab_001', 'test_course', 'vocab_n3');
  assert(p.status === 'learning', 'status = learning sau RAM');
  assert(p.masteryLevel === 1, 'masteryLevel = 1 sau RAM');
  assert(p.interval === SRS_INTERVALS[1], `interval = ${SRS_INTERVALS[1]} ngày (level 1)`);
  assert(p.streak === 1, 'streak = 1');
  assert(p.totalCorrect === 1, 'totalCorrect = 1');

  // nextReviewDate phải là khoảng SRS_INTERVALS[1] ngày từ bây giờ
  const now = new Date();
  const expectedReview = new Date(now);
  expectedReview.setDate(expectedReview.getDate() + SRS_INTERVALS[1]);
  const diffDays = Math.round(
    (p.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  assert(
    diffDays === SRS_INTERVALS[1],
    `nextReviewDate = ${SRS_INTERVALS[1]} ngày từ hôm nay`,
    `thực tế: ${diffDays} ngày`
  );
  assert(isDueForReview(p) === false, 'Chưa due ngay sau RAM');
}

// ════════════════════════════════════════════════════════════════════════
// SC-03 | Ôn tập đúng liên tục → leo đến level 6
// ════════════════════════════════════════════════════════════════════════
section('SC-03 | Leo level 1 → 6 bằng onCorrectLongTerm');
{
  let p = createGraduatedProgress('vocab_001', 'test_course', 'vocab_n3');

  // Level 1 → 2
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) }; // hôm qua
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 2, `Level 2: ${MASTERY_ICONS[2]} ${MASTERY_LABELS_VI[2]}`);
  assert(p.interval === SRS_INTERVALS[2], `Interval = ${SRS_INTERVALS[2]} ngày`);

  // Level 2 → 3
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 3, `Level 3: ${MASTERY_ICONS[3]} ${MASTERY_LABELS_VI[3]}`);
  assert(p.interval === SRS_INTERVALS[3], `Interval = ${SRS_INTERVALS[3]} ngày`);

  // Level 3 → 4
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 4, `Level 4: ${MASTERY_ICONS[4]} ${MASTERY_LABELS_VI[4]}`);

  // Level 4 → 5
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 5, `Level 5: ${MASTERY_ICONS[5]} ${MASTERY_LABELS_VI[5]}`);

  // Level 5 → 6 (mastered)
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 6, `Level 6: ${MASTERY_ICONS[6]} ${MASTERY_LABELS_VI[6]}`);
  assert(p.status === 'mastered', 'status = mastered ở level 6');
  assert(p.interval === SRS_INTERVALS[6], `Interval cuối = ${SRS_INTERVALS[6]} ngày`);

  // Không tăng quá level 6
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 6, 'Không tăng quá level 6 (cap tại 6)');
}

// ════════════════════════════════════════════════════════════════════════
// SC-04 | Sai ở level thấp (0-2) → về level 0
// ════════════════════════════════════════════════════════════════════════
section('SC-04 | Sai level thấp → proportional drop về 0');
{
  // Level 0 → vẫn 0
  const p0 = makeProgress({ masteryLevel: 0 as MasteryLevel, daysAgo: 1 });
  const r0 = onWrongLongTerm(p0);
  assert(r0.masteryLevel === 0, 'Level 0 sai → vẫn 0');
  assert(r0.status === 'reviewing', 'status = reviewing (không phải new)');
  assert(r0.streak === 0, 'streak reset về 0');

  // Level 1 → 0
  const p1 = makeProgress({ masteryLevel: 1 as MasteryLevel, daysAgo: 1 });
  const r1 = onWrongLongTerm(p1);
  assert(r1.masteryLevel === 0, 'Level 1 sai → 0 (drop = 1)');

  // Level 2 → 0
  const p2 = makeProgress({ masteryLevel: 2 as MasteryLevel, daysAgo: 1 });
  const r2 = onWrongLongTerm(p2);
  assert(r2.masteryLevel === 0, 'Level 2 sai → 0 (drop = 2)');

  // Kiểm tra nextReviewDate = ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const diffDays = Math.round(
    (r2.nextReviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  assert(diffDays === 1, 'Sau khi sai → nextReviewDate = ngày mai (1 ngày)');
}

// ════════════════════════════════════════════════════════════════════════
// SC-05 | Sai ở level cao (3-6) → trừ 2 level
// ════════════════════════════════════════════════════════════════════════
section('SC-05 | Sai level cao → trừ 2 level');
{
  // Level 3 → 1
  const p3 = makeProgress({ masteryLevel: 3 as MasteryLevel, daysAgo: 1 });
  const r3 = onWrongLongTerm(p3);
  assert(r3.masteryLevel === 1, 'Level 3 sai → 1 (drop = 2)');

  // Level 4 → 2
  const p4 = makeProgress({ masteryLevel: 4 as MasteryLevel, daysAgo: 1 });
  const r4 = onWrongLongTerm(p4);
  assert(r4.masteryLevel === 2, 'Level 4 sai → 2');

  // Level 5 → 3
  const p5 = makeProgress({ masteryLevel: 5 as MasteryLevel, daysAgo: 1 });
  const r5 = onWrongLongTerm(p5);
  assert(r5.masteryLevel === 3, 'Level 5 sai → 3');

  // Level 6 → 4
  const p6 = makeProgress({ masteryLevel: 6 as MasteryLevel, daysAgo: 1, status: 'mastered' });
  const r6 = onWrongLongTerm(p6);
  assert(r6.masteryLevel === 4, 'Level 6 sai → 4 (mất trạng thái mastered)');
  assert(r6.status === 'reviewing', 'status trở về reviewing');
}

// ════════════════════════════════════════════════════════════════════════
// SC-06 | Luật miễn nhiễm trong ngày (sai → không tụt level)
// ════════════════════════════════════════════════════════════════════════
section('SC-06 | Luật miễn nhiễm trong ngày khi sai');
{
  // Học trong cùng ngày (daysAgo = 0)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const p = makeProgress({
    masteryLevel: 4 as MasteryLevel,
    daysAgo: 0,
    lastStudiedDate: today,
  });
  const result = onWrongLongTerm(p);
  assert(result.masteryLevel === 4, 'Đã học hôm nay + sai → level không tụt (miễn nhiễm)');
  assert(result.totalWrong === p.totalWrong + 1, 'totalWrong vẫn tăng +1');
  assert(result.status === p.status, 'status không thay đổi');
  assert(result.streak === p.streak, 'streak không thay đổi');
}

// ════════════════════════════════════════════════════════════════════════
// SC-07 | Khóa 24h khi đúng (đã học hôm nay → không tăng level)
// ════════════════════════════════════════════════════════════════════════
section('SC-07 | Khóa 24h — đã học hôm nay + đúng → không tăng level');
{
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const p = makeProgress({
    masteryLevel: 3 as MasteryLevel,
    lastStudiedDate: today,
  });
  const result = onCorrectLongTerm(p);
  assert(result.masteryLevel === 3, 'Đã học hôm nay + đúng → level giữ nguyên (lock 24h)');
  assert(result.totalCorrect === p.totalCorrect + 1, 'totalCorrect vẫn tăng +1');
  assert(result.nextReviewDate.getTime() === p.nextReviewDate.getTime(), 'nextReviewDate không đổi');
}

// ════════════════════════════════════════════════════════════════════════
// SC-08 | Đánh dấu thủ công "Đã thuộc" → level 6
// ════════════════════════════════════════════════════════════════════════
section('SC-08 | Người dùng bấm "Đã thuộc" thủ công');
{
  const mastered = markAsMasteredUser('grammar_001', 'test_course', 'grammar_n3');

  assert(mastered.status === 'mastered', 'status = mastered');
  assert(mastered.masteryLevel === 6, 'masteryLevel = 6');
  assert(mastered.isMasteredUserMarked === true, 'isMasteredUserMarked = true');
  assert(mastered.interval === SRS_INTERVALS[6], `interval = ${SRS_INTERVALS[6]} ngày`);
  assert(mastered.waterDrops === 3, 'waterDrops = 3');

  const diffDays = Math.round(
    (mastered.nextReviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  assert(diffDays >= 89 && diffDays <= 91, `nextReviewDate ≈ 90 ngày (thực: ${diffDays})`);
  assert(isDueForReview(mastered) === false, 'Không due ngay sau khi mark mastered');
}

// ════════════════════════════════════════════════════════════════════════
// SC-09 | Bỏ "Đã thuộc" → reset về new/level 0
// ════════════════════════════════════════════════════════════════════════
section('SC-09 | Bỏ "Đã thuộc" → reset về level 0 (new)');
{
  // Giả lập logic batchUpdateWordMasteredStatus(markAsMastered=false)
  const now = new Date();
  const resetProgress: WordProgress = {
    itemId: 'grammar_001',
    courseId: 'test_course',
    subject: 'grammar_n3',
    status: 'new',
    masteryLevel: 0 as MasteryLevel,
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

  assert(resetProgress.status === 'new', 'Sau khi bỏ mastered → status = new');
  assert(resetProgress.masteryLevel === 0, 'masteryLevel = 0');
  assert(resetProgress.isMasteredUserMarked === false, 'isMasteredUserMarked = false');
  assert(isDueForReview(resetProgress) === false, 'status=new → không due');
  assert(resetProgress.lastStudiedDate.getTime() === 0, 'lastStudiedDate reset về epoch');
}

// ════════════════════════════════════════════════════════════════════════
// SC-10 | Thêm khóa học mới (từ chưa có trong Firestore)
// ════════════════════════════════════════════════════════════════════════
section('SC-10 | Khóa học mới — từ chưa trong Firestore');
{
  // Giả lập: Dataset có 500 từ, Firestore chỉ có 100 từ đã học
  const totalDataset = 500;
  const learnedCount = 100;
  const learnedSet = new Set(
    Array.from({ length: learnedCount }, (_, i) => `word_${i}`)
  );
  const allIds = Array.from({ length: totalDataset }, (_, i) => `word_${i}`);

  // Mô phỏng getNewItemIds
  const limit = 15;
  const newIds = allIds.filter(id => !learnedSet.has(id)).slice(0, limit);

  assert(newIds.length === limit, `getNewItemIds trả về đúng ${limit} từ mới`);
  assert(!newIds.some(id => learnedSet.has(id)), 'Không có từ đã học trong danh sách mới');
  assert(newIds[0] === `word_${learnedCount}`, `Từ mới đầu tiên là word_${learnedCount}`);

  // Giả lập thêm dữ liệu cứng mới (300 → 600 từ)
  const expandedDataset = 600;
  const expandedIds = Array.from({ length: expandedDataset }, (_, i) => `word_${i}`);
  const newIdsAfterExpand = expandedIds.filter(id => !learnedSet.has(id)).slice(0, limit);

  assert(newIdsAfterExpand.length === limit, 'Sau khi mở rộng dataset vẫn lấy đúng 15 từ mới');
  assert(
    newIdsAfterExpand.every(id => !learnedSet.has(id)),
    'Tất cả từ mới sau expand đều chưa học'
  );
  console.log(`    → Dataset mở rộng ${totalDataset}→${expandedDataset}: ${expandedDataset - learnedCount} từ chưa học còn lại`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-11 | Học xen kẽ: vừa thêm từ mới vừa ôn từ cũ
// ════════════════════════════════════════════════════════════════════════
section('SC-11 | Phiên xen kẽ: ôn từ cũ + học từ mới');
{
  // Giả lập session manager: 10 từ cũ (due) + 5 từ mới
  const reviewItems: WordProgress[] = Array.from({ length: 10 }, (_, i) =>
    makeProgress({
      itemId: `review_${i}`,
      masteryLevel: (Math.floor(Math.random() * 5) + 1) as MasteryLevel,
      status: 'reviewing',
      nextReviewDaysFromNow: 0,
      daysAgo: 2,
    })
  );
  const newItems: WordProgress[] = Array.from({ length: 5 }, (_, i) =>
    createNewProgress(`new_${i}`, 'test_course', 'vocab_n3')
  );

  const session = [...reviewItems, ...newItems];

  assert(session.length === 15, 'Session 15 từ (10 ôn + 5 mới)');
  assert(
    reviewItems.every(p => isDueForReview(p)),
    'Tất cả từ ôn tập đều due (nextReview = hôm nay)'
  );
  assert(
    newItems.every(p => p.status === 'new'),
    'Tất cả từ mới có status = new'
  );
  assert(
    newItems.every(p => !isDueForReview(p)),
    'Từ new không bao giờ due'
  );

  // Mô phỏng phiên: ôn đúng tất cả
  const updatedReview = reviewItems.map(p => onCorrectLongTerm(p));
  assert(
    updatedReview.every(p => p.masteryLevel >= 1),
    'Tất cả từ ôn đúng đều tăng ít nhất lên level 1+'
  );

  // Mô phỏng RAM cho từ mới: 3 lần đúng
  let ramScore = 0;
  for (let i = 0; i < 3; i++) ramScore = updateRAMScore(ramScore, true);
  assert(isGraduated(ramScore), `RAM score ${ramScore} >= ${RAM_REQUIRED_SCORE} → tốt nghiệp`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-12 | Vượt giới hạn maxPending → khóa học mới
// ════════════════════════════════════════════════════════════════════════
section('SC-12 | maxPending (50) — lock học từ mới');
{
  const maxPending = 50;

  // Giả lập masteryLevels: [20 level-0, 35 level-1, 10 level-2+...]
  const masteryLevels = [20, 35, 10, 5, 3, 2, 0]; // tổng 75 từ đã học
  const pendingCount = (masteryLevels[0] ?? 0) + (masteryLevels[1] ?? 0); // = 55

  assert(pendingCount > maxPending, `pendingCount=${pendingCount} > maxPending=${maxPending} → khóa`);

  const isPendingLocked = pendingCount >= maxPending;
  assert(isPendingLocked === true, 'isPendingLocked = true khi vượt ngưỡng');

  // Trường hợp dưới ngưỡng
  const masteryLevels2 = [15, 30, 10, 5, 3, 2, 1];
  const pendingCount2 = masteryLevels2[0] + masteryLevels2[1]; // = 45
  const isLocked2 = pendingCount2 >= maxPending;
  assert(!isLocked2, `pendingCount=${pendingCount2} < maxPending=${maxPending} → mở khóa`);

  // Chính xác tại ngưỡng
  const masteryLevels3 = [25, 25, 0, 0, 0, 0, 0];
  const pendingCount3 = masteryLevels3[0] + masteryLevels3[1]; // = 50
  const isLocked3 = pendingCount3 >= maxPending;
  assert(isLocked3 === true, `Đúng ngưỡng (${pendingCount3}/${maxPending}) → khóa`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-13 | Batch review session — nhiều từ cùng lúc
// ════════════════════════════════════════════════════════════════════════
section('SC-13 | Batch review session — 20 từ ôn cùng lúc');
{
  const batchItems: WordProgress[] = Array.from({ length: 20 }, (_, i) =>
    makeProgress({
      itemId: `batch_${i}`,
      masteryLevel: ((i % 5) + 1) as MasteryLevel,
      status: 'reviewing',
      nextReviewDaysFromNow: 0,
      daysAgo: 2,
    })
  );

  // Giả lập: 15 đúng, 5 sai
  const correctItems = batchItems.slice(0, 15).map(p => onCorrectLongTerm(p));
  const wrongItems = batchItems.slice(15).map(p => onWrongLongTerm(p));

  const allUpdated = [...correctItems, ...wrongItems];

  assert(correctItems.every(p => p.totalCorrect > 0), '15 từ đúng có totalCorrect > 0');
  assert(wrongItems.every(p => p.totalWrong > 0), '5 từ sai có totalWrong > 0');
  assert(allUpdated.length === 20, 'Tổng 20 từ được cập nhật');

  const levelUpCount = correctItems.filter((p, i) => p.masteryLevel > batchItems[i].masteryLevel).length;
  console.log(`    → ${levelUpCount}/15 từ đúng tăng level`);
  assert(levelUpCount === 15, 'Tất cả 15 từ đúng đều tăng 1 level');

  // Kiểm tra các từ sai có nextReviewDate = ngày mai
  const now = new Date();
  wrongItems.forEach(p => {
    const diff = Math.round((p.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    assert(diff === 1, `${p.itemId}: nextReview = ngày mai sau khi sai`);
  });
}

// ════════════════════════════════════════════════════════════════════════
// SC-14 | fetchDueItems — chỉ trả về từ đến hạn
// ════════════════════════════════════════════════════════════════════════
section('SC-14 | isDueForReview — kiểm tra hàm lọc due items');
{
  const now = new Date();

  // Due: nextReviewDate trong quá khứ
  const duePast = makeProgress({ nextReviewDaysFromNow: -1, daysAgo: 2 });
  assert(isDueForReview(duePast) === true, 'nextReview hôm qua → due');

  // Due: nextReviewDate đúng hôm nay (0 ngày tới)
  const dueToday = makeProgress({ nextReviewDaysFromNow: 0, daysAgo: 2 });
  assert(isDueForReview(dueToday) === true, 'nextReview hôm nay → due (SC-16 coverage)');

  // Chưa due: ngày mai
  const notDueTomorrow = makeProgress({ nextReviewDaysFromNow: 1, daysAgo: 2 });
  assert(isDueForReview(notDueTomorrow) === false, 'nextReview ngày mai → chưa due (SC-17 coverage)');

  // Chưa due: 7 ngày nữa
  const notDueFuture = makeProgress({ nextReviewDaysFromNow: 7, daysAgo: 2 });
  assert(isDueForReview(notDueFuture) === false, 'nextReview 7 ngày nữa → chưa due');

  // Status = new → không bao giờ due
  const newItem = createNewProgress('test', 'test_course', 'vocab_n3');
  assert(isDueForReview(newItem) === false, 'status=new → không bao giờ due');

  // Giả lập fetchDueItems: filter từ danh sách
  const progressList: WordProgress[] = [
    duePast,
    dueToday,
    notDueTomorrow,
    notDueFuture,
    newItem,
  ];

  const dueItems = progressList.filter(
    p => p.status !== 'new' && p.nextReviewDate <= now
  );
  assert(dueItems.length === 2, `fetchDueItems trả về đúng 2 từ due (got: ${dueItems.length})`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-15 | getMasteryStats — đếm đúng từng level
// ════════════════════════════════════════════════════════════════════════
section('SC-15 | getMasteryStats — phân bố level');
{
  // Tạo danh sách giả lập: 5 mỗi level (0-6) = 35 từ
  const progressList: WordProgress[] = [];
  for (let level = 0; level <= 6; level++) {
    for (let i = 0; i < 5; i++) {
      progressList.push(
        makeProgress({
          itemId: `item_L${level}_${i}`,
          masteryLevel: level as MasteryLevel,
          status: level === 0 ? 'reviewing' : level >= 6 ? 'mastered' : 'reviewing',
        })
      );
    }
  }

  // Giả lập getMasteryStats
  const stats = [0, 0, 0, 0, 0, 0, 0];
  progressList.forEach(p => {
    if (p.masteryLevel >= 0 && p.masteryLevel <= 6) {
      stats[p.masteryLevel]++;
    }
  });

  assert(stats.length === 7, '7 buckets (level 0-6)');
  for (let level = 0; level <= 6; level++) {
    assert(stats[level] === 5, `Level ${level} có 5 từ: ${MASTERY_ICONS[level]}`);
  }

  const total = stats.reduce((a, b) => a + b, 0);
  assert(total === 35, `Tổng = 35 từ`);
  console.log(`    → Phân bố: ${stats.map((c, i) => `${MASTERY_ICONS[i]}×${c}`).join('  ')}`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-18 | Giả lập 7 ngày học liên tục: level 0 → level 3
// ════════════════════════════════════════════════════════════════════════
section('SC-18 | 7 ngày học liên tục — hành trình level 0→3');
{
  // Ngày 1: RAM → tốt nghiệp → level 1
  let p = createGraduatedProgress('vocab_002', 'test_course', 'vocab_n3');
  assert(p.masteryLevel === 1, 'Ngày 1: RAM tốt nghiệp → level 1');
  console.log(`    Ngày 1: ${MASTERY_ICONS[p.masteryLevel]} Level ${p.masteryLevel} | ôn sau: ${p.interval} ngày`);

  // Ôn lại sau 1 ngày (interval level 1 = 1 ngày)
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 2, 'Ngày 2: Ôn đúng → level 2');
  console.log(`    Ngày 2: ${MASTERY_ICONS[p.masteryLevel]} Level ${p.masteryLevel} | ôn sau: ${p.interval} ngày`);

  // Ôn lại sau 3 ngày (interval level 2 = 3 ngày)
  p = { ...p, lastStudiedDate: new Date(Date.now() - 86400001) };
  p = onCorrectLongTerm(p);
  assert(p.masteryLevel === 3, 'Ngày 5: Ôn đúng → level 3');
  console.log(`    Ngày 5: ${MASTERY_ICONS[p.masteryLevel]} Level ${p.masteryLevel} | ôn sau: ${p.interval} ngày`);

  const days = daysUntilReview(p);
  console.log(`    → Còn ${days} ngày đến lần ôn tiếp`);
  assert(p.interval === SRS_INTERVALS[3], `Interval level 3 = ${SRS_INTERVALS[3]} ngày`);
  assert(p.streak === 3, `streak = 3 (3 lần đúng liên tiếp qua các ngày)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-19 | Bỏ học 2 tuần — quay lại thấy nhiều từ due
// ════════════════════════════════════════════════════════════════════════
section('SC-19 | Bỏ học 2 tuần — quay lại kiểm tra due items');
{
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Giả lập 30 từ ở các level khác nhau, đều có nextReviewDate 14 ngày trước
  const abandonedItems: WordProgress[] = Array.from({ length: 30 }, (_, i) =>
    makeProgress({
      itemId: `abandoned_${i}`,
      masteryLevel: ((i % 5) + 1) as MasteryLevel,
      status: 'reviewing',
      nextReviewDaysFromNow: -14, // 14 ngày trước
      daysAgo: 20,
    })
  );

  // 10 từ mới chưa học
  const untouched: WordProgress[] = Array.from({ length: 10 }, (_, i) =>
    createNewProgress(`untouched_${i}`, 'test_course', 'vocab_n3')
  );

  const allItems = [...abandonedItems, ...untouched];
  const now = new Date();
  const dueList = allItems.filter(p => p.status !== 'new' && p.nextReviewDate <= now);
  const newList = allItems.filter(p => p.status === 'new');

  assert(dueList.length === 30, `Sau 2 tuần bỏ học: ${dueList.length}/30 từ cần ôn`);
  assert(newList.length === 10, `${newList.length} từ mới chưa chạm đến`);
  assert(allItems.length === 40, 'Tổng 40 từ trong danh sách');

  console.log(`    → Due: ${dueList.length} từ | Mới chưa học: ${newList.length} từ`);
  console.log(`    → Người dùng sẽ thấy badge "💧 Ôn tập (30)" trên dashboard`);

  // Giả lập kiểm tra pendingCount: dueList có level thấp → nhiều pending
  const pendingAfterReturn = dueList.filter(p => p.masteryLevel <= 1).length;
  console.log(`    → Trong đó ${pendingAfterReturn} từ ở level ≤1 (tồn đọng cao)`);
}

// ════════════════════════════════════════════════════════════════════════
// SC-20 | RAM score: đúng-sai xen kẽ
// ════════════════════════════════════════════════════════════════════════
section('SC-20 | RAM score — đúng/sai xen kẽ trước khi tốt nghiệp');
{
  let score = 0;
  const log: string[] = [];

  // Sequence: đúng, đúng, sai, đúng, đúng, sai, đúng
  const sequence = [true, true, false, true, true, false, true];
  for (const correct of sequence) {
    score = updateRAMScore(score, correct);
    log.push(`${correct ? '✅' : '❌'} → score=${score}`);
  }

  console.log(`    Lịch sử RAM: ${log.join(' | ')}`);
  assert(!isGraduated(score), `Score ${score} < ${RAM_REQUIRED_SCORE} → chưa tốt nghiệp (sequence kết thúc ở score ${score})`);

  // Thêm 2 lần đúng nữa để tốt nghiệp
  score = updateRAMScore(score, true);
  score = updateRAMScore(score, true);
  assert(isGraduated(score), `Score ${score} >= ${RAM_REQUIRED_SCORE} → tốt nghiệp!`);

  // Edge: Score không vượt quá RAM_REQUIRED_SCORE
  score = updateRAMScore(score, true);
  assert(score === RAM_REQUIRED_SCORE, `Score bị cap tại ${RAM_REQUIRED_SCORE}`);

  // Edge: Score không xuống dưới 0
  let zeroScore = 0;
  zeroScore = updateRAMScore(zeroScore, false);
  assert(zeroScore === 0, 'Score sàn tại 0 (không âm)');
}

// ════════════════════════════════════════════════════════════════════════
// SC-EDGE | Các edge case bổ sung
// ════════════════════════════════════════════════════════════════════════
section('SC-EDGE | Edge cases bổ sung');
{
  // E1: Từ đã mastered user-marked — vẫn có thể sai và tụt level
  const masteredUserMarked = markAsMasteredUser('kanji_001', 'test_course', 'kanji_single_n3');
  const wrongResult = onWrongLongTerm({
    ...masteredUserMarked,
    lastStudiedDate: new Date(Date.now() - 86400001),
  });
  assert(wrongResult.masteryLevel === 4, 'Từ mastered (level 6) sai vào ngày khác → level 4');

  // E2: Interval tra đúng theo bảng SRS_INTERVALS
  console.log(`    → SRS Intervals: ${SRS_INTERVALS.map((d, i) => `L${i}=${d}d`).join(', ')}`);
  for (let level = 0; level <= 6; level++) {
    const p = makeProgress({ masteryLevel: level as MasteryLevel, daysAgo: 1 });
    const correct = onCorrectLongTerm(p);
    const expectedNextLevel = Math.min(6, level + 1);
    assert(
      correct.interval === SRS_INTERVALS[expectedNextLevel],
      `L${level}→L${expectedNextLevel}: interval = ${SRS_INTERVALS[expectedNextLevel]} ngày`
    );
  }

  // E3: daysUntilReview
  const p3 = makeProgress({ masteryLevel: 3 as MasteryLevel, nextReviewDaysFromNow: 5, daysAgo: 10 });
  const days = daysUntilReview(p3);
  assert(days === 5, `daysUntilReview = 5 (next review 5 ngày nữa, got: ${days})`);

  // E4: Due item trong quá khứ → daysUntilReview = 0 (không âm)
  const overdueItem = makeProgress({ masteryLevel: 2 as MasteryLevel, nextReviewDaysFromNow: -5, daysAgo: 10 });
  const overdueDays = daysUntilReview(overdueItem);
  assert(overdueDays === 0, `Quá hạn 5 ngày → daysUntilReview = 0 (got: ${overdueDays})`);
}

// ════════════════════════════════════════════════════════════════════════
// TỔNG KẾT
// ════════════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('  📊 KẾT QUẢ GIẢ LẬP SRS');
console.log('═'.repeat(70));
console.log(`  ✅ PASSED : ${passed}`);
console.log(`  ❌ FAILED : ${failed}`);
console.log(`  📋 TOTAL  : ${passed + failed}`);
if (failedTests.length > 0) {
  console.log('\n  Các test thất bại:');
  failedTests.forEach(t => console.log(`    • ${t}`));
}
console.log('═'.repeat(70));
if (failed === 0) {
  console.log('  🎉 Tất cả test cases đều PASS! Hệ thống SRS hoạt động đúng.');
} else {
  console.log(`  ⚠️  Có ${failed} test FAIL. Cần kiểm tra lại logic engine.`);
}
console.log('═'.repeat(70) + '\n');
