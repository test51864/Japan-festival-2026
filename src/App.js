import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './QuizPolish.css';
import './FestivalUpgrade.css';

const FORM_URL = 'https://forms.office.com/r/mbXENTrknQ';
const YANMAR_WORDMARK_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath/Yanmar_logo_2013_full_horizontal.svg';
const GAME_TITLE = 'Yanmar Festival Cup';
const TIMER_SECONDS = 15;
const BASE_POINTS = 100;
const SPEED_POINTS = 150;
const LEADERBOARD_KEY = 'yanmar-festival-cup-leaderboard';

const languages = [
  { id: 'en', code: 'EN', name: 'English', flagClass: 'flag-en' },
  { id: 'nl', code: 'NL', name: 'Nederlands', flagClass: 'flag-nl' },
  { id: 'ja', code: 'JPN', name: 'Japanese', flagClass: 'flag-jp' },
];

const teams = {
  netherlands: { code: 'NED', color: '#f36c21', trim: '#123f8c', text: '#101114', labels: { en: 'Team Netherlands', nl: 'Team Nederland', ja: '\u30c1\u30fc\u30e0\u30fb\u30aa\u30e9\u30f3\u30c0' } },
  japan: { code: 'JPN', color: '#102f7a', trim: '#ffffff', text: '#ffffff', labels: { en: 'Team Japan', nl: 'Team Japan', ja: '\u30c1\u30fc\u30e0\u30fb\u65e5\u672c' } },
};

const keeperKits = {
  netherlands: { primary: '#f36c21', trim: '#123f8c', text: '#101114' },
  japan: { primary: '#102f7a', trim: '#ffffff', text: '#ffffff' },
};

const setupCopy = {
  title: GAME_TITLE,
  intro: 'Choose your language, enter your name, pick your team, and take penalty shots through the Japan Festival challenge.',
  language: 'Choose language',
  name: 'Player name',
  namePlaceholder: 'Enter your name',
  team: 'Your team',
  start: 'Start match',
};

const copy = {
  en: {
    round: 'Round', progress: 'Progress', answer: 'Choose your answer', timeout: 'TIME OUT!', goal: 'GOAL!', save: 'SAVED!', miss: 'MISS!', next: 'Next round', finish: 'Finish game', complete: 'Finished', playAgain: 'Play again', changeSetup: 'Change setup',
    formsTitle: 'Prize draw', formsText: 'Submit your entry through the form. The winner is selected at random, no matter the score.', formsButton: 'Enter prize draw', points: 'points', correct: 'correct', leaderboard: 'Leaderboard', noScores: 'No scores yet.',
    finalLead: (score, total, points, name) => `${name ? `${name}, y` : 'Y'}ou scored ${points} points (${score}/${total}).`,
    perfect: 'Perfect score.', solid: 'Strong score.', nice: 'Nice effort.',
  },
  nl: {
    round: 'Ronde', progress: 'Voortgang', answer: 'Kies je antwoord', timeout: 'TIJD OM!', goal: 'GOAL!', save: 'GEPAKT!', miss: 'NAAST!', next: 'Volgende ronde', finish: 'Game afronden', complete: 'Klaar', playAgain: 'Speel opnieuw', changeSetup: 'Setup wijzigen',
    formsTitle: 'Winactie', formsText: 'Stuur je deelname in via het formulier. De winnaar wordt willekeurig gekozen, ongeacht de score.', formsButton: 'Naar winactie', points: 'punten', correct: 'goed', leaderboard: 'Leaderboard', noScores: 'Nog geen scores.',
    finalLead: (score, total, points, name) => `${name ? `${name}, j` : 'J'}e scoorde ${points} punten (${score}/${total}).`,
    perfect: 'Perfecte score.', solid: 'Sterke score.', nice: 'Netjes gedaan.',
  },
  ja: {
    round: '\u30e9\u30a6\u30f3\u30c9', progress: '\u9032\u884c\u72b6\u6cc1', answer: '\u7b54\u3048\u3092\u9078\u629e', timeout: '\u6642\u9593\u5207\u308c\uff01', goal: '\u30b4\u30fc\u30eb\uff01', save: '\u30bb\u30fc\u30d6\uff01', miss: '\u30df\u30b9\uff01', next: '\u6b21\u306e\u30e9\u30a6\u30f3\u30c9', finish: '\u30b2\u30fc\u30e0\u7d42\u4e86', complete: '\u7d42\u4e86', playAgain: '\u3082\u3046\u4e00\u5ea6\u30d7\u30ec\u30a4', changeSetup: '\u8a2d\u5b9a\u5909\u66f4',
    formsTitle: '\u62bd\u9078', formsText: '\u30d5\u30a9\u30fc\u30e0\u304b\u3089\u53c2\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u5f53\u9078\u8005\u306f\u30b9\u30b3\u30a2\u306b\u95a2\u4fc2\u306a\u304f\u30e9\u30f3\u30c0\u30e0\u306b\u9078\u3070\u308c\u307e\u3059\u3002', formsButton: '\u62bd\u9078\u306b\u53c2\u52a0', points: '\u30dd\u30a4\u30f3\u30c8', correct: '\u6b63\u89e3', leaderboard: '\u30ea\u30fc\u30c0\u30fc\u30dc\u30fc\u30c9', noScores: '\u307e\u3060\u30b9\u30b3\u30a2\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
    finalLead: (score, total, points, name) => `${name ? `${name}: ` : ''}${points}\u30dd\u30a4\u30f3\u30c8\uff08${total}\u554f\u4e2d${score}\u554f\u6b63\u89e3\uff09\u3002`,
    perfect: '\u5b8c\u74a7\u306a\u30b9\u30b3\u30a2\u3002', solid: '\u7d20\u6674\u3089\u3057\u3044\u30b9\u30b3\u30a2\u3067\u3059\u3002', nice: '\u3088\u304f\u3067\u304d\u307e\u3057\u305f\u3002',
  },
};

const visualImages = {
  'flying-y': 'https://commons.wikimedia.org/wiki/Special:FilePath/Yanmar_logo_flying-Y.svg',
  target: 'https://rabbitlogo.com/wp-content/uploads/2026/01/target.jpg',
  mitsubishi: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mitsubishi_logo.svg',
  dragonfly: 'https://commons.wikimedia.org/wiki/Special:FilePath/Green_eyes_dragonfly_HNP_dorsal_%2816257832922%29.jpg?width=900',
  'red-panda': 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Panda_just_chillin.jpg?width=900',
  koi: 'https://commons.wikimedia.org/wiki/Special:FilePath/Koi_head_closeup.jpg?width=900',
};

const questions = [
  {
    id: 'yanmar-logo', correct: 0, visualOnly: true, visuals: ['flying-y', 'target', 'mitsubishi'],
    en: { question: 'Which logo truly fits Yanmar?', answers: ['Flying-Y', 'Target symbol', 'Mitsubishi diamonds'] },
    nl: { question: 'Welk logo past echt bij Yanmar?', answers: ['Flying-Y', 'Target-symbool', 'Mitsubishi-diamanten'] },
    ja: { question: 'Yanmar\u306b\u672c\u5f53\u306b\u5408\u3046\u30ed\u30b4\u306f\u3069\u308c\u3067\u3059\u304b\uff1f', answers: ['Flying-Y', '\u30bf\u30fc\u30b2\u30c3\u30c8\u30b7\u30f3\u30dc\u30eb', '\u4e09\u83f1\u306e\u30c0\u30a4\u30e4'] },
  },
  {
    id: 'yanmar-products', correct: 0, plain: true,
    en: { question: 'What does Yanmar mainly make?', answers: ['Powerful machines, such as tractors and engines', 'Luxury clothing and watches', 'Video game consoles'] },
    nl: { question: 'Wat maakt Yanmar vooral?', answers: ['Krachtige machines, zoals tractoren en motoren', 'Luxe kleding en horloges', 'Spelcomputers en consoles'] },
    ja: { question: 'Yanmar\u306f\u4e3b\u306b\u4f55\u3092\u4f5c\u3063\u3066\u3044\u307e\u3059\u304b\uff1f', answers: ['\u30c8\u30e9\u30af\u30bf\u30fc\u3084\u30a8\u30f3\u30b8\u30f3\u306a\u3069\u306e\u529b\u5f37\u3044\u6a5f\u68b0', '\u9ad8\u7d1a\u670d\u3084\u6642\u8a08', '\u30b2\u30fc\u30e0\u6a5f'] },
  },
  {
    id: 'yanmar-color', correct: 1, swatches: true, visuals: ['forest-green', 'premium-red', 'bright-yellow'],
    en: { question: 'Which color do you often see on Yanmar machines?', answers: ['Forest green', 'Premium Red', 'Bright yellow'] },
    nl: { question: 'Welke kleur zie je vaak terug bij de machines van Yanmar?', answers: ['Bosgroen', 'Premium Rood', 'Felgeel'] },
    ja: { question: 'Yanmar\u306e\u6a5f\u68b0\u3067\u3088\u304f\u898b\u308b\u8272\u306f\u3069\u308c\u3067\u3059\u304b\uff1f', answers: ['\u30d5\u30a9\u30ec\u30b9\u30c8\u30b0\u30ea\u30fc\u30f3', '\u30d7\u30ec\u30df\u30a2\u30e0\u30ec\u30c3\u30c9', '\u660e\u308b\u3044\u9ec4\u8272'] },
  },
  {
    id: 'oniyanma-animal', correct: 0, imageChoices: true, visuals: ['dragonfly', 'red-panda', 'koi'],
    en: { question: "The name 'Yanmar' comes from the 'Oniyanma'. What Japanese animal is that?", answers: ['A large, fast dragonfly', 'A fluffy red panda', 'A colorful koi carp'] },
    nl: { question: "De naam 'Yanmar' komt van de 'Oniyanma'. Wat voor Japans dier is dat?", answers: ['Een grote, snelle libel', 'Een pluizige rode panda', 'Een kleurrijke Koi karper'] },
    ja: { question: '\u300cYanmar\u300d\u3068\u3044\u3046\u540d\u524d\u306f\u300c\u30aa\u30cb\u30e4\u30f3\u30de\u300d\u306b\u7531\u6765\u3057\u307e\u3059\u3002\u3053\u308c\u306f\u3069\u3093\u306a\u65e5\u672c\u306e\u751f\u304d\u7269\u3067\u3059\u304b\uff1f', answers: ['\u5927\u304d\u304f\u3066\u901f\u3044\u30c8\u30f3\u30dc', '\u3075\u308f\u3075\u308f\u306e\u30ec\u30c3\u30b5\u30fc\u30d1\u30f3\u30c0', '\u8272\u9bae\u3084\u304b\u306a\u9326\u9bc9'] },
  },
  {
    id: 'football-owner', correct: 1, plain: true,
    en: { question: 'Which two football clubs is Yanmar owner of?', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
    nl: { question: 'Van welke twee voetbalclubs is Yanmar eigenaar?', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
    ja: { question: 'Yanmar\u304c\u30aa\u30fc\u30ca\u30fc\u3067\u3042\u308b2\u3064\u306e\u30b5\u30c3\u30ab\u30fc\u30af\u30e9\u30d6\u306f\u3069\u308c\u3067\u3059\u304b\uff1f', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
  },
  {
    id: 'yanmar-city', correct: 1, plain: true,
    en: { question: 'In which Japanese city is Yanmar based?', answers: ['Tokyo', 'Osaka', 'Kyoto'] },
    nl: { question: 'In welke Japanse stad is Yanmar gevestigd?', answers: ['Tokyo', 'Osaka', 'Kyoto'] },
    ja: { question: 'Yanmar\u306f\u65e5\u672c\u306e\u3069\u306e\u90fd\u5e02\u306b\u62e0\u70b9\u304c\u3042\u308a\u307e\u3059\u304b\uff1f', answers: ['\u6771\u4eac', '\u5927\u962a', '\u4eac\u90fd'] },
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function shuffleIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function createQuestionOrders() {
  return questions.map((question) => shuffleIndexes(question.en.answers.length));
}

function randomGoalVariant() {
  return Math.random() < 0.5 ? 'goal-left' : 'goal-right';
}

function randomWrongVariant() {
  const variants = ['save-center', 'miss-left', 'miss-right'];
  return variants[Math.floor(Math.random() * variants.length)];
}

function outcomeFromVariant(variant) {
  return variant === 'save-center' ? 'save' : 'miss';
}

function randomFieldDistraction(roundIndex = 0) {
  const animals = ['cat', 'fox', 'crane'];
  const animal = animals[roundIndex % animals.length];
  const side = Math.random() < 0.5 ? 'left' : 'right';
  return `${animal}-${side}`;
}

function readLeaderboard() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEADERBOARD_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(entries) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {
    return;
  }
}

function answerPoints(timeLeft) {
  return BASE_POINTS + Math.round((Math.max(0, timeLeft) / TIMER_SECONDS) * SPEED_POINTS);
}

function getMatch(team) {
  const keeperTeamId = team === 'netherlands' ? 'japan' : 'netherlands';
  return { playerTeam: teams[team], keeperKit: keeperKits[keeperTeamId] };
}

function AnswerVisual({ type }) {
  const src = visualImages[type];
  return (
    <span className={cx('answer-visual', src && 'has-image', `visual-${type}`)} aria-hidden='true'>
      {src ? <img src={src} alt='' loading='lazy' /> : null}
      <i /><b /><em />
    </span>
  );
}

function SetupScreen({ language, setLanguage, team, setTeam, playerName, setPlayerName, onStart }) {
  return (
    <main className='app app-setup'>
      <section className='setup-shell'>
        <div className='setup-brand-panel'>
          <div className='wordmark-only'>YANMAR</div>
          <div className='festival-lockup'><span>Japan Festival 2026</span></div>
          <div className='pitch-preview' aria-hidden='true'><span className='preview-goal' /><span className='preview-ball' /><span className='preview-line' /></div>
        </div>
        <div className='setup-panel'>
          <p className='eyebrow'>Japan Festival 2026</p>
          <h1>{setupCopy.title}</h1>
          <p className='intro-copy'>{setupCopy.intro}</p>
          <div className='setup-group'>
            <div className='group-label'>{setupCopy.language}</div>
            <div className='segmented-control language-flags' aria-label={setupCopy.language}>
              {languages.map((option) => (
                <button className={cx(language === option.id && 'active')} key={option.id} type='button' onClick={() => setLanguage(option.id)} aria-label={option.name}>
                  <span className={cx('flag-mark', option.flagClass)} aria-hidden='true' />
                  <span>{option.code}</span>
                </button>
              ))}
            </div>
          </div>
          <label className='setup-group'>
            <span className='group-label'>{setupCopy.name}</span>
            <input className='name-input' value={playerName} placeholder={setupCopy.namePlaceholder} maxLength={18} onChange={(event) => setPlayerName(event.target.value)} />
          </label>
          <div className='setup-group'>
            <div className='group-label'>{setupCopy.team}</div>
            <div className='team-grid'>
              {Object.entries(teams).map(([id, value]) => (
                <button className={cx('team-card', `team-${id}`, team === id && 'active')} key={id} style={{ '--team-color': value.color, '--team-text': value.text }} type='button' onClick={() => setTeam(id)}>
                  <span>{value.code}</span><strong>{value.labels.en}</strong>
                </button>
              ))}
            </div>
          </div>
          <button className='primary-cta' type='button' onClick={onStart}>{setupCopy.start}</button>
        </div>
      </section>
    </main>
  );
}

function PlayerSprite({ className }) {
  return (
    <div className={className} aria-hidden='true'>
      <span className='sprite-shadow' /><span className='sprite-head' /><span className='sprite-body' />
      <span className='sprite-arm sprite-arm-left' /><span className='sprite-arm sprite-arm-right' />
      <span className='sprite-hand sprite-hand-left' /><span className='sprite-hand sprite-hand-right' />
      <span className='sprite-leg sprite-leg-left' /><span className='sprite-leg sprite-leg-right' />
    </div>
  );
}

function FieldCat({ direction, animationId }) {
  if (!direction) return null;
  return (
    <div key={`field-distraction-${animationId}-${direction}`} className={cx('field-cat', direction)} aria-hidden='true'>
      <span className='cat-tail' /><span className='cat-body' /><span className='cat-head' />
      <span className='cat-ear cat-ear-left' /><span className='cat-ear cat-ear-right' />
      <span className='cat-leg cat-leg-one' /><span className='cat-leg cat-leg-two' />
    </div>
  );
}

function PenaltyArena({ outcome, shotVariant, fieldDistraction, animationId, playerTeam, keeperKit }) {
  const active = outcome !== 'idle';
  const banner = outcome === 'goal' ? 'GOAL' : outcome === 'save' ? 'SAVE' : outcome === 'miss' ? 'MISS' : '';
  const keeperMotion = outcome === 'goal'
    ? (shotVariant === 'goal-left' ? 'dive-right' : 'dive-left')
    : shotVariant;
  return (
    <aside className='arena-card' style={{ '--player-color': playerTeam.color, '--player-trim': playerTeam.trim, '--player-text': playerTeam.text, '--keeper-color': keeperKit.primary, '--keeper-trim': keeperKit.trim, '--keeper-text': keeperKit.text }}>
      <div className={cx('result-flash', active && 'show', outcome)}>{banner}</div>
      <div className={cx('confetti', outcome === 'goal' && 'show')} aria-hidden='true'><span /><span /><span /><span /><span /><span /><span /></div>
      <div className='arena-field'>
        <div className={cx('goal-net', outcome === 'goal' && 'shake')} /><div className='goal-line' />
        <FieldCat direction={fieldDistraction} animationId={animationId} />
        <PlayerSprite className={cx('sprite keeper-sprite', keeperMotion)} />
        <PlayerSprite className='sprite striker-sprite' />
        <div key={`line-${animationId}`} className={cx('shot-line', outcome, shotVariant)} />
        <div key={`ball-${animationId}`} className={cx('ball', outcome, shotVariant)} />
      </div>
    </aside>
  );
}

function FinalScreen({ score, total, points, leaderboard, playerName, t, onPlayAgain, onChangeSetup }) {
  const label = score === total ? t.perfect : score >= Math.ceil(total * 0.6) ? t.solid : t.nice;
  return (
    <main className='app app-final'>
      <section className='final-card'>
        <div className='wordmark-final'>YANMAR</div>
        <p className='eyebrow'>{t.complete}</p>
        <h1>{t.finalLead(score, total, points, playerName.trim())}</h1>
        <div className='result-medal'>{label}</div>
        <div className='score-summary'><span><strong>{points}</strong>{t.points}</span><span><strong>{score}/{total}</strong>{t.correct}</span></div>
        <div className='forms-panel'><h2>{t.formsTitle}</h2><p>{t.formsText}</p><a className='primary-cta form-link' href={FORM_URL} target='_blank' rel='noreferrer'>{t.formsButton}</a></div>
        <div className='leaderboard-panel'>
          <h2>{t.leaderboard}</h2>
          {leaderboard.length ? <ol>{leaderboard.map((entry, index) => <li key={`${entry.date}-${entry.name}-${index}`}><span>{index + 1}</span><strong>{entry.name}</strong><em>{entry.points} {t.points}</em></li>)}</ol> : <p>{t.noScores}</p>}
        </div>
        <div className='final-actions'><button className='secondary-cta' type='button' onClick={onChangeSetup}>{t.changeSetup}</button><button className='primary-cta' type='button' onClick={onPlayAgain}>{t.playAgain}</button></div>
      </section>
    </main>
  );
}

export default function App() {
  const [language, setLanguage] = useState('nl');
  const [team, setTeam] = useState('netherlands');
  const [playerName, setPlayerName] = useState('');
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [selected, setSelected] = useState(null);
  const [outcome, setOutcome] = useState('idle');
  const [shotVariant, setShotVariant] = useState('');
  const [animationId, setAnimationId] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [lastPoints, setLastPoints] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [fieldDistraction, setFieldDistraction] = useState('');
  const [questionOrders, setQuestionOrders] = useState(createQuestionOrders);
  const [leaderboard, setLeaderboard] = useState(readLeaderboard);
  const [leaderboardSaved, setLeaderboardSaved] = useState(false);

  const t = copy[language];
  const match = getMatch(team);
  const questionData = questions[current];
  const localizedQuestion = questionData?.[language];
  const isFinal = current >= questions.length;
  const answered = selected !== null;
  const currentOrder = questionData ? questionOrders[current] || shuffleIndexes(questionData.en.answers.length) : [];
  const displayedAnswers = localizedQuestion ? currentOrder.map((originalIndex, displayIndex) => ({
    originalIndex,
    displayIndex,
    answer: localizedQuestion.answers[originalIndex],
    visualType: questionData.visuals?.[originalIndex],
  })) : [];
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / TIMER_SECONDS) * 100));
  const progress = useMemo(() => Math.round(((isFinal ? questions.length : current + (answered ? 1 : 0)) / questions.length) * 100), [answered, current, isFinal]);

  useEffect(() => {
    if (!started || isFinal) return;
    setTimeLeft(TIMER_SECONDS);
  }, [started, current, isFinal]);

  useEffect(() => {
    if (!started || isFinal || answered) return undefined;
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, Math.round((value - 0.1) * 10) / 10)), 100);
    return () => window.clearInterval(timer);
  }, [started, isFinal, answered, current]);

  useEffect(() => {
    if (!started || isFinal || answered || timeLeft > 0) return;
    const variant = 'miss-right';
    setSelected(-1);
    setOutcome('miss');
    setShotVariant(variant);
    setTimedOut(true);
    setLastPoints(0);
    setAnimationId((value) => value + 1);
  }, [timeLeft, started, isFinal, answered]);

  useEffect(() => {
    if (!isFinal || leaderboardSaved) return;
    const entry = { name: playerName.trim() || teams[team].labels[language] || teams[team].labels.en, points, correct: score, total: questions.length, date: new Date().toISOString() };
    const nextLeaderboard = [entry, ...readLeaderboard()].sort((a, b) => b.points - a.points || b.correct - a.correct).slice(0, 5);
    writeLeaderboard(nextLeaderboard);
    setLeaderboard(nextLeaderboard);
    setLeaderboardSaved(true);
  }, [isFinal, leaderboardSaved, language, playerName, points, score, team]);

  function resetRound() {
    setCurrent(0);
    setScore(0);
    setPoints(0);
    setSelected(null);
    setOutcome('idle');
    setShotVariant('');
    setTimeLeft(TIMER_SECONDS);
    setLastPoints(0);
    setTimedOut(false);
    setFieldDistraction(randomFieldDistraction(0));
    setLeaderboardSaved(false);
    setAnimationId((value) => value + 1);
  }

  function startGame() {
    setQuestionOrders(createQuestionOrders());
    resetRound();
    setStarted(true);
  }

  function handleAnswer(displayIndex) {
    if (answered || isFinal) return;
    const originalIndex = currentOrder[displayIndex] ?? displayIndex;
    const isCorrect = originalIndex === questionData.correct;
    const variant = isCorrect ? randomGoalVariant() : randomWrongVariant();
    const gained = isCorrect ? answerPoints(timeLeft) : 0;
    setSelected(displayIndex);
    setOutcome(isCorrect ? 'goal' : outcomeFromVariant(variant));
    setShotVariant(variant);
    setTimedOut(false);
    setLastPoints(gained);
    setAnimationId((value) => value + 1);
    if (isCorrect) {
      setScore((value) => value + 1);
      setPoints((value) => value + gained);
    }
  }

  function nextQuestion() {
    const nextIndex = current + 1;
    setTimeLeft(TIMER_SECONDS);
    setTimedOut(false);
    setLastPoints(0);
    setShotVariant('');
    if (nextIndex >= questions.length) {
      setCurrent(questions.length);
      setSelected(null);
      setOutcome('idle');
      setFieldDistraction('');
      return;
    }
    setCurrent(nextIndex);
    setSelected(null);
    setOutcome('idle');
    setFieldDistraction(randomFieldDistraction(nextIndex));
    setAnimationId((value) => value + 1);
  }

  function answerClass(displayIndex) {
    if (!answered) return '';
    const originalIndex = currentOrder[displayIndex] ?? displayIndex;
    if (originalIndex === questionData.correct) return 'is-correct';
    if (displayIndex === selected) return 'is-wrong';
    return 'is-muted';
  }

  if (!started) return <SetupScreen language={language} setLanguage={setLanguage} team={team} setTeam={setTeam} playerName={playerName} setPlayerName={setPlayerName} onStart={startGame} />;

  if (isFinal) {
    return <FinalScreen score={score} total={questions.length} points={points} leaderboard={leaderboard} playerName={playerName} t={t} onPlayAgain={startGame} onChangeSetup={() => { resetRound(); setStarted(false); }} />;
  }

  const statusText = timedOut ? t.timeout : answered ? (outcome === 'goal' ? t.goal : outcome === 'miss' ? t.miss : t.save) : t.answer;

  return (
    <main className='app app-game'>
      <section className='game-shell'>
        <header className='game-header'>
          <div className='game-brand'><img src={YANMAR_WORDMARK_URL} alt='YANMAR' /><span>Festival Cup</span></div>
          <div className='match-info'><span className='team-chip' style={{ '--chip-color': match.playerTeam.color, '--chip-text': match.playerTeam.text }}>{playerName.trim() || match.playerTeam.labels[language]}</span><strong>{t.round} {current + 1}/{questions.length}</strong></div>
        </header>
        <div className='progress-bar' aria-label={`${t.progress}: ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
        <div className={cx('timer-row', timeLeft <= 4 && !answered && 'danger')} aria-label={`Timer: ${Math.ceil(timeLeft)} seconds`}><span className='timer-track'><span style={{ width: `${timerPercent}%` }} /></span><strong>{Math.ceil(timeLeft)}s</strong></div>
        <div className='game-grid'>
          <section className={cx('question-card', questionData.visualOnly && 'visual-only-question', questionData.imageChoices && 'image-choice-question', questionData.swatches && 'swatch-question', questionData.plain && 'plain-question')}>
            <div className='question-copy'><p className='eyebrow'>{t.round} {current + 1}</p><h1>{localizedQuestion.question}</h1></div>
            <div className='answer-grid'>
              {displayedAnswers.map(({ answer, displayIndex, originalIndex, visualType }) => (
                <button className={cx('answer-button', !visualType && 'no-visual-answer', answerClass(displayIndex))} disabled={answered} key={`${questionData.id}-${originalIndex}-${answer}`} type='button' onClick={() => handleAnswer(displayIndex)} aria-label={answer}>
                  {visualType ? <AnswerVisual type={visualType} /> : null}
                  <span className='answer-letter'>{String.fromCharCode(65 + displayIndex)}</span>
                  <strong className='answer-title'>{answer}</strong>
                </button>
              ))}
            </div>
            <div className={cx('feedback', answered && 'show', outcome, timedOut && 'timeout')}>
              <strong>{statusText}{lastPoints > 0 ? <span className='points-pop'>+{lastPoints}</span> : null}</strong>
              {answered ? <button className='next-action' type='button' onClick={nextQuestion}>{current + 1 >= questions.length ? t.finish : t.next}</button> : null}
            </div>
          </section>
          <PenaltyArena outcome={outcome} shotVariant={shotVariant} fieldDistraction={fieldDistraction} animationId={animationId} playerTeam={match.playerTeam} keeperKit={match.keeperKit} />
        </div>
      </section>
    </main>
  );
}
