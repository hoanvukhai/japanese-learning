// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/global/SettingsProvider';
import { FlashcardSettingsProvider } from './context/features/flashcard/FlashcardSettingsProvider';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Dictionary from './pages/Dictionary';
import PracticeDashboard from './pages/Practice/index'; 
import ConjugationDashboard from './pages/Practice/ConjugationDashboard';
import ConjugationGame from './pages/Practice/ConjugationGame';
import ConjugationStudy from './pages/Practice/ConjugationStudy';
import KeigoDashboard from './pages/Practice/KeigoDashboard';
import KeigoStudy from './pages/Practice/KeigoStudy';
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
        <ScrollToTop />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
          <Navbar />
          {/* Khu vực nội dung sẽ thay đổi theo URL */}
          <main className="pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/study" element={<Study />} />
              <Route path="/practice" element={<PracticeDashboard />} />
              
              {/* Conjugation */}
              <Route path="/study/conjugation" element={<ConjugationStudy />} />
              <Route path="/practice/conjugation" element={<ConjugationDashboard />} />
              <Route path="/practice/conjugation/game" element={<ConjugationGame />} />
              
              {/* Keigo */}
              <Route path="/study/keigo" element={<KeigoStudy />} />
              <Route path="/practice/keigo" element={<KeigoDashboard />} />
              <Route path="/practice/keigo/flashcards" element={<KeigoFlashcards />} />
              <Route path="/practice/keigo/quest" element={<KeigoQuest />} />
              
              <Route path="/settings" element={<Settings />} />
              
              {/* Vocabulary */}
              <Route path="/practice/vocabulary" element={<VocabDashboard />} />
              <Route path="/practice/vocabulary/flashcard" element={<VocabFlashcard />} />
              <Route path="/practice/vocabulary/quiz" element={<VocabQuiz />} />
              <Route path="/practice/vocabulary/matching" element={<VocabMatching />} />
              <Route path="/practice/vocabulary/typing" element={<VocabTyping />} />
              <Route path="/study/vocabulary" element={<VocabStudy />} />
              
              {/* Kanji */}
              <Route path="/practice/kanji" element={<KanjiDashboard />} />
              <Route path="/study/kanji" element={<KanjiStudy />} />
              <Route path="/practice/kanji/flashcard" element={<KanjiFlashcard />} />
              <Route path="/practice/kanji/quiz" element={<KanjiQuiz />} />
              <Route path="/practice/kanji/matching" element={<KanjiMatching />} />
              <Route path="/practice/kanji/typing" element={<KanjiTyping />} />
              
              {/* Grammar */}
              <Route path="/practice/grammar" element={<GrammarDashboard />} />
              <Route path="/study/grammar" element={<GrammarStudy />} />
              <Route path="/practice/grammar/flashcard" element={<GrammarFlashcard />} />
              <Route path="/practice/grammar/quiz" element={<GrammarQuiz />} />
              <Route path="/practice/grammar/wordorder" element={<GrammarWordOrder />} />
              <Route path="/practice/grammar/matching" element={<GrammarMatching />} />
              <Route path="/practice/grammar/fillblank" element={<GrammarFillBlank />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      </FlashcardSettingsProvider>
    </SettingsProvider>
  );
}