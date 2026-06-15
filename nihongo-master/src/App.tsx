// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/global/SettingsProvider';
import { FlashcardSettingsProvider } from './context/features/flashcard/FlashcardSettingsProvider';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Dictionary from './pages/Dictionary';
import Study from './pages/Study';
import Settings from './pages/Settings';

// Practice Hub
import PracticeDashboard from './pages/Practice/index';

// Conjugation
import ConjugationStudy from './pages/Practice/ConjugationStudy';
import ConjugationDashboard from './pages/Practice/ConjugationDashboard';
import ConjugationGame from './pages/Practice/ConjugationGame';

// Keigo
import KeigoStudy from './pages/Practice/KeigoStudy';
import KeigoDashboard from './pages/Practice/KeigoDashboard';
import KeigoFlashcards from './pages/Practice/KeigoFlashcards';
import KeigoQuest from './pages/Practice/KeigoQuest';

// Vocabulary
import VocabStudy from './pages/Vocabulary/VocabStudy';
import VocabDashboard from './pages/Vocabulary/VocabDashboard';
import VocabFlashcard from './pages/Vocabulary/VocabFlashcard';
import VocabQuiz from './pages/Vocabulary/VocabQuiz';
import VocabMatching from './pages/Vocabulary/VocabMatching';
import VocabTyping from './pages/Vocabulary/VocabTyping';
import VocabErrorDetect from './pages/Vocabulary/VocabErrorDetect';
import VocabFullRun from './pages/Vocabulary/VocabFullRun';

// Kanji
import KanjiStudy from './pages/Kanji/KanjiStudy';
import KanjiDashboard from './pages/Kanji/KanjiDashboard';
import KanjiFlashcard from './pages/Kanji/KanjiFlashcard';
import KanjiQuiz from './pages/Kanji/KanjiQuiz';
import KanjiMatching from './pages/Kanji/KanjiMatching';
import KanjiTyping from './pages/Kanji/KanjiTyping';
import KanjiErrorDetect from './pages/Kanji/KanjiErrorDetect';
import KanjiFullRun from './pages/Kanji/KanjiFullRun';

// Grammar
import GrammarStudy from './pages/Grammar/GrammarStudy';
import GrammarDashboard from './pages/Grammar/GrammarDashboard';
import GrammarFlashcard from './pages/Grammar/GrammarFlashcard';
import GrammarQuiz from './pages/Grammar/GrammarQuiz';
import GrammarFullRun from './pages/Grammar/GrammarFullRun';
import GrammarMatching from './pages/Grammar/GrammarMatching';
import GrammarFillBlank from './pages/Grammar/GrammarFillBlank';
import GrammarErrorDetect from './pages/Grammar/GrammarErrorDetect';
import StudyRoadmap from './pages/StudyRoadmap';

export default function App() {
  return (
    <SettingsProvider>
      <FlashcardSettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* === CORE === */}
                <Route path="/" element={<Home />} />
                <Route path="/dictionary" element={<Dictionary />} />
                <Route path="/settings" element={<Settings />} />

                {/* === STUDY HUB === */}
                <Route path="/study" element={<Study />} />
                <Route path="/study/conjugation" element={<ConjugationStudy />} />
                <Route path="/study/keigo" element={<KeigoStudy />} />
                <Route path="/study/vocabulary" element={<VocabStudy />} />
                <Route path="/study/kanji" element={<KanjiStudy />} />
                <Route path="/study/grammar" element={<GrammarStudy />} />
                <Route path="/study/roadmap" element={<StudyRoadmap />} />

                {/* === PRACTICE HUB === */}
                <Route path="/practice" element={<PracticeDashboard />} />

                {/* Conjugation */}
                <Route path="/practice/conjugation" element={<ConjugationDashboard />} />
                <Route path="/practice/conjugation/game" element={<ConjugationGame />} />

                {/* Keigo */}
                <Route path="/practice/keigo" element={<KeigoDashboard />} />
                <Route path="/practice/keigo/flashcards" element={<KeigoFlashcards />} />
                <Route path="/practice/keigo/quest" element={<KeigoQuest />} />

                {/* Vocabulary */}
                <Route path="/practice/vocabulary" element={<VocabDashboard />} />
                <Route path="/practice/vocabulary/flashcard" element={<VocabFlashcard />} />
                <Route path="/practice/vocabulary/quiz" element={<VocabQuiz />} />
                <Route path="/practice/vocabulary/matching" element={<VocabMatching />} />
                <Route path="/practice/vocabulary/typing" element={<VocabTyping />} />
                <Route path="/practice/vocabulary/errordetect" element={<VocabErrorDetect />} />
                <Route path="/practice/vocabulary/fullrun" element={<VocabFullRun />} />

                {/* Kanji */}
                <Route path="/practice/kanji" element={<KanjiDashboard />} />
                <Route path="/practice/kanji/flashcard" element={<KanjiFlashcard />} />
                <Route path="/practice/kanji/quiz" element={<KanjiQuiz />} />
                <Route path="/practice/kanji/matching" element={<KanjiMatching />} />
                <Route path="/practice/kanji/typing" element={<KanjiTyping />} />
                <Route path="/practice/kanji/errordetect" element={<KanjiErrorDetect />} />
                <Route path="/practice/kanji/fullrun" element={<KanjiFullRun />} />

                {/* Grammar */}
                <Route path="/practice/grammar" element={<GrammarDashboard />} />
                <Route path="/practice/grammar/flashcard" element={<GrammarFlashcard />} />
                <Route path="/practice/grammar/quiz" element={<GrammarQuiz />} />
                <Route path="/practice/grammar/matching" element={<GrammarMatching />} />
                <Route path="/practice/grammar/fullrun" element={<GrammarFullRun />} />
                <Route path="/practice/grammar/fillblank" element={<GrammarFillBlank />} />
                <Route path="/practice/grammar/errordetect" element={<GrammarErrorDetect />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </FlashcardSettingsProvider>
    </SettingsProvider>
  );
}
