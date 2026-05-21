// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/global/SettingsProvider';
import { FlashcardSettingsProvider } from './context/features/flashcard/FlashcardSettingsProvider';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dictionary from './pages/Dictionary';
import PracticeDashboard from './pages/Practice/index'; 
import ConjugationPractice from './pages/Practice/ConjugationPractice';
import KeigoDashboard from './pages/Practice/KeigoDashboard';
import KeigoFlashcards from './pages/Practice/KeigoFlashcards';
import KeigoQuest from './pages/Practice/KeigoQuest';
import Study from './pages/Study';
import Settings from './pages/Settings';
import VocabDashboard from './pages/Vocabulary/VocabDashboard';
import VocabFlashcard from './pages/Vocabulary/VocabFlashcard';
import VocabQuiz from './pages/Vocabulary/VocabQuiz';
import VocabMatching from './pages/Vocabulary/VocabMatching';
import VocabTyping from './pages/Vocabulary/VocabTyping';
import VocabStudy from './pages/Vocabulary/VocabStudy';
import KanjiDashboard from './pages/Kanji/KanjiDashboard';
import KanjiStudy from './pages/Kanji/KanjiStudy';
import KanjiFlashcard from './pages/Kanji/KanjiFlashcard';
import KanjiQuiz from './pages/Kanji/KanjiQuiz';
import KanjiMatching from './pages/Kanji/KanjiMatching';
import KanjiTyping from './pages/Kanji/KanjiTyping';
import GrammarDashboard from './pages/Grammar/GrammarDashboard';
import GrammarStudy from './pages/Grammar/GrammarStudy';
import GrammarFlashcard from './pages/Grammar/GrammarFlashcard';
import GrammarQuiz from './pages/Grammar/GrammarQuiz';
import GrammarWordOrder from './pages/Grammar/GrammarWordOrder';
import GrammarMatching from './pages/Grammar/GrammarMatching';
import GrammarFillBlank from './pages/Grammar/GrammarFillBlank';

export default function App() {
  return (
    <SettingsProvider>
      <FlashcardSettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
          <Navbar />
          {/* Khu vực nội dung sẽ thay đổi theo URL */}
          <main className="pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/study" element={<Study />} />
              <Route path="/practice" element={<PracticeDashboard />} />
              <Route path="/practice/conjugation" element={<ConjugationPractice />} />
              <Route path="/practice/keigo" element={<KeigoDashboard />} />
              <Route path="/practice/keigo/flashcards" element={<KeigoFlashcards />} />
              <Route path="/practice/keigo/quest" element={<KeigoQuest />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/vocabulary" element={<VocabDashboard />} />
              <Route path="/vocabulary/flashcard" element={<VocabFlashcard />} />
              <Route path="/vocabulary/quiz" element={<VocabQuiz />} />
              <Route path="/vocabulary/matching" element={<VocabMatching />} />
              <Route path="/vocabulary/typing" element={<VocabTyping />} />
              <Route path="/vocabulary/study" element={<VocabStudy />} />
              <Route path="/kanji" element={<KanjiDashboard />} />
              <Route path="/kanji/study" element={<KanjiStudy />} />
              <Route path="/kanji/flashcard" element={<KanjiFlashcard />} />
              <Route path="/kanji/quiz" element={<KanjiQuiz />} />
              <Route path="/kanji/matching" element={<KanjiMatching />} />
              <Route path="/kanji/typing" element={<KanjiTyping />} />
              <Route path="/grammar" element={<GrammarDashboard />} />
              <Route path="/grammar/study" element={<GrammarStudy />} />
              <Route path="/grammar/flashcard" element={<GrammarFlashcard />} />
              <Route path="/grammar/quiz" element={<GrammarQuiz />} />
              <Route path="/grammar/wordorder" element={<GrammarWordOrder />} />
              <Route path="/grammar/matching" element={<GrammarMatching />} />
              <Route path="/grammar/fillblank" element={<GrammarFillBlank />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      </FlashcardSettingsProvider>
    </SettingsProvider>
  );
}