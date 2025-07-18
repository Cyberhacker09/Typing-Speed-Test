// TypingTestClone - Multilingual Support + Error Highlighting + Leaderboard
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const WORD_BANKS = {
  english: [
    "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
    "practice", "makes", "perfect", "keyboard", "speed", "accuracy",
    "test", "your", "typing", "skills", "daily", "improve", "focus",
    "never", "give", "up", "stay", "determined", "creative"
  ],
  spanish: [
    "el", "zorro", "marrón", "rápido", "salta", "sobre", "el", "perro", "perezoso",
    "práctica", "hace", "perfecto", "teclado", "velocidad", "precisión",
    "prueba", "tus", "habilidades", "escribir", "diario", "mejora", "enfócate"
  ],
  hindi: [
    "तेज़", "भूरा", "लोमड़ी", "कूदता", "ऊपर", "आलसी", "कुत्ता",
    "अभ्यास", "बनाता", "संपूर्ण", "कुंजीपटल", "गति", "सटीकता",
    "परीक्षण", "आपका", "टाइपिंग", "कौशल", "दैनिक", "सुधार", "ध्यान"
  ]
};

const generateWords = (language = 'english', count = 100) => {
  const wordList = WORD_BANKS[language] || WORD_BANKS.english;
  return Array.from({ length: count }, () => wordList[Math.floor(Math.random() * wordList.length)]);
};

export default function TypingTestClone() {
  const [language, setLanguage] = useState('english');
  const [words, setWords] = useState(generateWords(language));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrectIndexes, setIncorrectIndexes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finished, setFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState(() => {
    return JSON.parse(localStorage.getItem('leaderboard')) || [];
  });

  const inputRef = useRef();

  useEffect(() => {
    let timer;
    if (startTime && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setFinished(true);
      saveResult();
    }
    return () => clearInterval(timer);
  }, [startTime, timeLeft]);

  const handleInput = (e) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    if (val.endsWith(' ')) {
      const current = words[currentWordIndex];
      if (val.trim() === current) {
        setCorrect(prev => prev + 1);
      } else {
        setIncorrectIndexes(prev => [...prev, currentWordIndex]);
      }
      setCurrentWordIndex(prev => prev + 1);
      setTyped('');
    } else {
      setTyped(val);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setWords(generateWords(lang));
    reset();
  };

  const reset = () => {
    setWords(generateWords(language));
    setCurrentWordIndex(0);
    setTyped('');
    setCorrect(0);
    setIncorrectIndexes([]);
    setStartTime(null);
    setTimeLeft(60);
    setFinished(false);
    inputRef.current.focus();
  };

  const wpm = Math.round(correct / ((60 - timeLeft) / 60)) || 0;

  const saveResult = () => {
    const accuracy = Math.round((correct / (currentWordIndex || 1)) * 100);
    const newResult = { wpm, accuracy, time: new Date().toLocaleString() };
    const updatedLeaderboard = [...leaderboard, newResult].sort((a, b) => b.wpm - a.wpm).slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
    setLeaderboard(updatedLeaderboard);
  };

  return (
    <div className="container">
      <h1>Typing Speed Test</h1>
      <label htmlFor="language">Choose Language: </label>
      <select id="language" value={language} onChange={handleLanguageChange}>
        <option value="english">English</option>
        <option value="spanish">Spanish</option>
        <option value="hindi">Hindi</option>
      </select>

      <div className="words">
        {words.map((word, i) => {
          let className = '';
          if (i === currentWordIndex) className = 'highlight';
          else if (i < currentWordIndex) className = incorrectIndexes.includes(i) ? 'incorrect' : 'completed';
          return (
            <span key={i} className={className}>{word}</span>
          );
        })}
      </div>

      {!finished ? (
        <input
          ref={inputRef}
          type="text"
          className="typing-input"
          value={typed}
          onChange={handleInput}
          disabled={finished || timeLeft === 0}
          autoFocus
        />
      ) : (
        <button onClick={reset}>Restart</button>
      )}

      <div className="stats">
        <p>Time Left: {timeLeft}s</p>
        <p>WPM: {wpm}</p>
        <p>Correct Words: {correct}</p>
      </div>

      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>
              {index + 1}. {entry.wpm} WPM - {entry.accuracy}% - {entry.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
