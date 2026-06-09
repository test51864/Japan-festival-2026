import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './QuizPolish.css';

const FORM_URL = 'https://forms.office.com/r/mbXENTrknQ';
const TIMER_SECONDS = 15;
const BASE_POINTS = 100;
const SPEED_POINTS = 150;
const LEADERBOARD_KEY = 'yanmar-quiz-arena-leaderboard';

const languages = [
  { id: 'en', label: 'EN' },
  { id: 'nl', label: 'NL' },
  { id: 'ja', label: 'JPN' },
];

const teams = {
  netherlands: {
    code: 'NED',
    color: '#f47b20',
    trim: '#ffffff',
    text: '#101114',
    labels: { en: 'Team Netherlands', nl: 'Team Nederland', ja: 'チーム・オランダ' },
  },
  japan: {
    code: 'JPN',
    color: '#e30613',
    trim: '#ffffff',
    text: '#ffffff',
    labels: { en: 'Team Japan', nl: 'Team Japan', ja: 'チーム・日本' },
  },
};

const keeperKits = {
  netherlands: {
    primary: '#f47b20',
    trim: '#ffffff',
    text: '#101114',
  },
  japan: {
    primary: '#174a9c',
    trim: '#e30613',
    text: '#ffffff',
  },
};

const setupCopy = {
  title: 'Yanmar Quiz Arena',
  intro: 'Pick a name, choose your team, and play the Japan Festival challenge.',
  language: 'Quiz language',
  name: 'Player name',
  namePlaceholder: 'Enter your name',
  team: 'Your team',
  start: 'Start game',
};

const copy = {
  en: {
    round: 'Round',
    progress: 'Progress',
    answer: 'Choose your answer',
    timeout: 'TIME OUT!',
    goal: 'GOAL!',
    save: 'SAVED!',
    next: 'Next round',
    finish: 'Finish game',
    complete: 'Finished',
    playAgain: 'Play again',
    changeSetup: 'Change setup',
    formsTitle: 'Join the prize draw',
    formsText: 'Open Microsoft Forms to submit your entry. Winners are selected at random.',
    formsButton: 'Open prize form',
    points: 'points',
    correct: 'correct',
    leaderboard: 'Leaderboard',
    noScores: 'No scores yet.',
    finalLead: (score, total, points, name) => `${name ? `${name}, y` : 'Y'}ou scored ${points} points (${score}/${total}).`,
    perfect: 'Perfect score.',
    solid: 'Strong score.',
    nice: 'Nice effort.',
  },
  nl: {
    round: 'Ronde',
    progress: 'Voortgang',
    answer: 'Kies je antwoord',
    timeout: 'TIJD OM!',
    goal: 'GOAL!',
    save: 'GEPAKT!',
    next: 'Volgende ronde',
    finish: 'Game afronden',
    complete: 'Klaar',
    playAgain: 'Speel opnieuw',
    changeSetup: 'Setup wijzigen',
    formsTitle: 'Doe mee aan de winactie',
    formsText: 'Open Microsoft Forms om je deelname in te sturen. De winnaar wordt willekeurig gekozen.',
    formsButton: 'Open winactie formulier',
    points: 'punten',
    correct: 'goed',
    leaderboard: 'Leaderboard',
    noScores: 'Nog geen scores.',
    finalLead: (score, total, points, name) => `${name ? `${name}, j` : 'J'}e scoorde ${points} punten (${score}/${total}).`,
    perfect: 'Perfecte score.',
    solid: 'Sterke score.',
    nice: 'Netjes gedaan.',
  },
  ja: {
    round: 'ラウンド',
    progress: '進行状況',
    answer: '答えを選択',
    timeout: '時間切れ！',
    goal: 'ゴール！',
    save: 'セーブ！',
    next: '次のラウンド',
    finish: 'ゲーム終了',
    complete: '終了',
    playAgain: 'もう一度プレイ',
    changeSetup: '設定変更',
    formsTitle: '抽選に参加',
    formsText: 'Microsoft Formsを開いて参加してください。 Gewinner はランダムに選ばれます。',
    formsButton: 'フォームを開く',
    points: 'ポイント',
    correct: '正解',
    leaderboard: 'リーダーボード',
    noScores: 'まだスコアがありません。',
    finalLead: (score, total, points, name) => `${name ? `${name}: ` : ''}${points}ポイント（${total}問中${score}問正解）。`,
    perfect: '完璧なスコア。',
    solid: '素晴らしいスコアです。',
    nice: 'よくできました。',
  },
};

const visualImages = {
  'flying-y': {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yanmar_logo_flying-Y.svg',
  },
  target: {
    src: 'https://rabbitlogo.com/wp-content/uploads/2026/01/target.jpg',
  },
  mitsubishi: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mitsubishi_logo.svg',
  },
  dragonfly: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Green_eyes_dragonfly_HNP_dorsal_%2816257832922%29.jpg?width=900',
  },
  'red-panda': {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Panda_just_chillin.jpg?width=900',
  },
  koi: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Koi_head_closeup.jpg?width=900',
  },
};

const questions = [
  {
    id: 'yanmar-logo',
    correct: 0,
    visualOnly: true,
    visuals: ['flying-y', 'target', 'mitsubishi'],
    en: { question: 'Which logo truly fits Yanmar?', answers: ['Flying-Y', 'Target symbol', 'Mitsubishi diamonds'] },
    nl: { question: 'Welk logo past echt bij Yanmar?', answers: ['Flying-Y', 'Target-symbool', 'Mitsubishi-diamanten'] },
    ja: { question: 'Yanmarに本当に合うロゴはどれですか？', answers: ['Flying-Y', 'ターゲットシンボル', '三菱のダイヤ'] },
  },
  {
    id: 'yanmar-products',
    correct: 0,
    plain: true,
    en: { question: 'What does Yanmar mainly make?', answers: ['Powerful machines, such as tractors and engines', 'Luxury clothing and watches', 'Video game consoles'] },
    nl: { question: 'Wat maakt Yanmar vooral?', answers: ['Krachtige machines, zoals tractoren en motoren', 'Luxe kleding en horloges', 'Spelcomputers en consoles'] },
    ja: { question: 'Yanmarは主に何を作っていますか？', answers: ['トラクターやエンジンなどの力強い機械', '高級服や時計', 'ゲーム機'] },
  },
  {
    id: 'yanmar-color',
    correct: 1,
    swatches: true,
    visuals: ['forest-green', 'premium-red', 'bright-yellow'],
    en: { question: 'Which color do you often see on Yanmar machines?', answers: ['Forest green', 'Premium Red', 'Bright yellow'] },
    nl: { question: 'Welke kleur zie je vaak terug bij de machines van Yanmar?', answers: ['Bosgroen', 'Premium Rood', 'Felgeel'] },
    ja: { question: 'Yanmarの機械でよく見る色はどれですか？', answers: ['フォレストグリーン', 'プレミアムレッド', '明るい黄色'] },
  },
  {
    id: 'oniyanma-animal',
    correct: 0,
    imageChoices: true,
    visuals: ['dragonfly', 'red-panda', 'koi'],
    en: { question: "The name 'Yanmar' comes from the 'Oniyanma'. What Japanese animal is that?", answers: ['A large, fast dragonfly', 'A fluffy red panda', 'A colorful koi carp'] },
    nl: { question: "De naam 'Yanmar' komt van de 'Oniyanma'. Wat voor Japans dier is dat?", answers: ['Een grote, snelle libel', 'Een pluizige rode panda', 'Een kleurrijke Koi karper'] },
    ja: { question: '「Yanmar」という名前は「オニヤンマ」に由来します。これはどんな日本の生き物ですか？', answers: ['大きくて速いトンボ', 'ふわふわのレッサーパンダ', '色鮮やかな錦鯉'] },
  },
  {
    id: 'football-owner',
    correct: 1,
    plain: true,
    en: { question: 'Which two football clubs is Yanmar owner of?', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
    nl: { question: 'Van welke twee voetbalclubs is Yanmar eigenaar?', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
    ja: { question: 'Yanmarがオーナーである2つのサッカークラブはどれですか？', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
  },
  {
    id: 'yanmar-city',
    correct: 1,
    plain: true,
    en: { question: 'In which Japanese city is Yanmar based?', answers: ['Tokyo', 'Osaka', 'Kyoto'] },
    nl: { question: 'In welke Japanse stad is Yanmar gevestigd?', answers: ['Tokyo', 'Osaka', 'Kyoto'] },
    ja: { question: 'Yanmarは日本のどの都市に拠点がありますか？', answers: ['東京', '大阪', '京都'] },
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function readLeaderboard() {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(LEADERBOARD_KEY);
    const parsed = value ? JSON.parse(value) : [];
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
    // Local storage is optional; the game still works without it.
  }
}

function getAnswerPoints(timeLeft) {
  const speedBonus = Math.round((Math.max(0, timeLeft) / TIMER_SECONDS) * SPEED_POINTS);
  return BASE_POINTS + speedBonus;
}

function opponentOf(team) {
  return team === 'netherlands' ? 'japan' : 'netherlands';
}

function getMatch(team) {
  const keeperTeamId = opponentOf(team);
  return {
    playerTeam: teams[team],
    keeperTeam: teams[keeperTeamId],
    keeperKit: keeperKits[keeperTeamId],
  };
}

function AnswerVisual({ type }) {
  const image = visualImages[type];

  return (
    <span className={cx('answer-visual', image && 'has-image', `visual-${type}`)} aria-hidden='true'>
      {image ? <img src={image.src} alt='' loading='lazy' /> : null}
      <i />
      <b />
      <em />
    </span>
  );
}

function SetupScreen({ language, setLanguage, team, setTeam, playerName, setPlayerName, onStart }) {
  return (
    <main className='app app-setup'>
      <section className='setup-shell'>
        <div className='setup-brand-panel'>
          <div className='wordmark-only'>YANMAR</div>
          <div className='festival-lockup'>
            <span>Japan Festival 2026</span>
          </div>
          <div className='pitch-preview' aria-hidden='true'>
            <span className='preview-goal' />
            <span className='preview-ball' />
            <span className='preview-line' />
          </div>
        </div>

        <div className='setup-panel'>
          <p className='eyebrow'>Japan Festival 2026</p>
          <h1>{setupCopy.title}</h1>
          <p className='intro-copy'>{setupCopy.intro}</p>

          <div className='setup-group'>
            <div className='group-label'>{setupCopy.language}</div>
            <div className='segmented-control' aria-label={setupCopy.language}>
              {languages.map((option) => (
                <button className={cx(language === option.id && 'active')} key={option.id} type='button' onClick={() => setLanguage(option.id)}>
                  {option.label}
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
                <button className={cx('team-card', team === id && 'active')} key={id} style={{ '--team-color': value.color, '--team-text': value.text }} type='button' onClick={() => setTeam(id)}>
                  <span>{value.code}</span>
                  <strong>{value.labels.en}</strong>
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
      <span className='sprite-shadow' />
      <span className='sprite-head' />
      <span className='sprite-body' />
      <span className='sprite-arm sprite-arm-left' />
      <span className='sprite-arm sprite-arm-right' />
      <span className='sprite-hand sprite-hand-left' />
      <span className='sprite-hand sprite-hand-right' />
      <span className='sprite-leg sprite-leg-left' />
      <span className='sprite-leg sprite-leg-right' />
    </div>
  );
}

function PenaltyArena({ outcome, animationId, playerTeam, keeperKit }) {
  const active = outcome !== 'idle';
  const banner = outcome === 'goal' ? 'GOAL' : outcome === 'save' ? 'SAVE' : '';

  return (
    <aside
      className='arena-card'
      style={{
        '--player-color': playerTeam.color,
        '--player-trim': playerTeam.trim,
        '--player-text': playerTeam.text,
        '--keeper-color': keeperKit.primary,
        '--keeper-trim': keeperKit.trim,
        '--keeper-text': keeperKit.text,
      }}
    >
      <div className={cx('result-flash', active && 'show', outcome)}>{banner}</div>
      <div className={cx('confetti', outcome === 'goal' && 'show')} aria-hidden='true'><span /><span /><span /><span /><span /><span /><span /></div>
      <div className='arena-field'>
        <div className={cx('goal-net', outcome === 'goal' && 'shake')} />
        <div className='goal-line' />
        <PlayerSprite className={cx('sprite keeper-sprite', outcome === 'goal' && 'dive-left', outcome === 'save' && 'save-center')} />
        <PlayerSprite className='sprite striker-sprite' />
        <div key={`line-${animationId}`} className={cx('shot-line', outcome)} />
        <div key={`ball-${animationId}`} className={cx('ball', outcome)} />
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

        <div className='score-summary'>
          <span><strong>{points}</strong>{t.points}</span>
          <span><strong>{score}/{total}</strong>{t.correct}</span>
        </div>

        <div className='forms-panel'>
          <h2>{t.formsTitle}</h2>
          <p>{t.formsText}</p>
          <a className='primary-cta form-link' href={FORM_URL} target='_blank' rel='noreferrer'>{t.formsButton}</a>
        </div>

        <div className='leaderboard-panel'>
          <h2>{t.leaderboard}</h2>
          {leaderboard.length ? (
            <ol>
              {leaderboard.map((entry, index) => (
                <li key={`${entry.date}-${entry.name}-${index}`}>
                  <span>{index + 1}</span>
                  <strong>{entry.name}</strong>
                  <em>{entry.points} {t.points}</em>
                </li>
              ))}
            </ol>
          ) : <p>{t.noScores}</p>}
        </div>

        <div className='final-actions'>
          <button className='secondary-cta' type='button' onClick={onChangeSetup}>{t.changeSetup}</button>
          <button className='primary-cta' type='button' onClick={onPlayAgain}>{t.playAgain}</button>
        </div>
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
  const [animationId, setAnimationId] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [lastPoints, setLastPoints] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [leaderboard, setLeaderboard] = useState(readLeaderboard);
  const [leaderboardSaved, setLeaderboardSaved] = useState(false);

  const t = copy[language];
  const match = getMatch(team);
  const questionData = questions[current];
  const localizedQuestion = questionData?.[language];
  const isFinal = current >= questions.length;
  const answered = selected !== null;
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / TIMER_SECONDS) * 100));
  const progress = useMemo(() => {
    const base = isFinal ? questions.length : current + (answered ? 1 : 0);
    return Math.round((base / questions.length) * 100);
  }, [answered, current, isFinal]);

  useEffect(() => {
    if (!started || isFinal) return;
    setTimeLeft(TIMER_SECONDS);
  }, [started, current, isFinal]);

  useEffect(() => {
    if (!started || isFinal || answered) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, Math.round((value - 0.1) * 10) / 10));
    }, 100);

    return () => window.clearInterval(timer);
  }, [started, isFinal, answered, current]);

  useEffect(() => {
    if (!started || isFinal || answered || timeLeft > 0) return;
    handleTimeout();
  }, [timeLeft, started, isFinal, answered]);

  useEffect(() => {
    if (!isFinal || leaderboardSaved) return;

    const fallbackName = teams[team].labels[language] || teams[team].labels.en;
    const entry = {
      name: playerName.trim() || fallbackName,
      points,
      correct: score,
      total: questions.length,
      date: new Date().toISOString(),
    };
    const nextLeaderboard = [entry, ...readLeaderboard()]
      .sort((a, b) => b.points - a.points || b.correct - a.correct)
      .slice(0, 5);

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
    setTimeLeft(TIMER_SECONDS);
    setLastPoints(0);
    setTimedOut(false);
    setLeaderboardSaved(false);
    setAnimationId((value) => value + 1);
  }

  function startGame() {
    resetRound();
    setStarted(true);
  }

  function handleAnswer(index) {
    if (answered || isFinal) return;
    const isCorrect = index === questionData.correct;
    const gained = isCorrect ? getAnswerPoints(timeLeft) : 0;

    setSelected(index);
    setOutcome(isCorrect ? 'goal' : 'save');
    setTimedOut(false);
    setLastPoints(gained);
    setAnimationId((value) => value + 1);
    if (isCorrect) {
      setScore((value) => value + 1);
      setPoints((value) => value + gained);
    }
  }

  function handleTimeout() {
    if (answered || isFinal) return;
    setSelected(-1);
    setOutcome('save');
    setTimedOut(true);
    setLastPoints(0);
    setAnimationId((value) => value + 1);
  }

  function nextQuestion() {
    setTimeLeft(TIMER_SECONDS);
    setTimedOut(false);
    setLastPoints(0);

    if (current + 1 >= questions.length) {
      setCurrent(questions.length);
      setSelected(null);
      setOutcome('idle');
      return;
    }
    setCurrent((value) => value + 1);
    setSelected(null);
    setOutcome('idle');
    setAnimationId((value) => value + 1);
  }

  function answerClass(index) {
    if (!answered) return '';
    if (index === questionData.correct) return 'is-correct';
    if (index === selected) return 'is-wrong';
    return 'is-muted';
  }

  if (!started) {
    return (
      <SetupScreen
        language={language}
        setLanguage={setLanguage}
        team={team}
        setTeam={setTeam}
        playerName={playerName}
        setPlayerName={setPlayerName}
        onStart={startGame}
      />
    );
  }

  if (isFinal) {
    return (
      <FinalScreen
        score={score}
        total={questions.length}
        points={points}
        leaderboard={leaderboard}
        playerName={playerName}
        t={t}
        onPlayAgain={startGame}
        onChangeSetup={() => {
          resetRound();
          setStarted(false);
        }}
      />
    );
  }

  const statusText = timedOut ? t.timeout : answered ? (outcome === 'goal' ? t.goal : t.save) : t.answer;

  return (
    <main className='app app-game'>
      <section className='game-shell'>
        <header className='game-header'>
          <div className='game-brand'>Yanmar Quiz Arena</div>
          <div className='match-info'>
            <span className='team-chip' style={{ '--chip-color': match.playerTeam.color, '--chip-text': match.playerTeam.text }}>{playerName.trim() || match.playerTeam.labels[language]}</span>
            <strong>{t.round} {current + 1}/{questions.length}</strong>
          </div>
        </header>

        <div className='progress-bar' aria-label={`${t.progress}: ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className={cx('timer-row', timeLeft <= 4 && !answered && 'danger')} aria-label={`Timer: ${Math.ceil(timeLeft)} seconds`}>
          <span className='timer-track'><span style={{ width: `${timerPercent}%` }} /></span>
          <strong>{Math.ceil(timeLeft)}s</strong>
        </div>

        <div className='game-grid'>
          <section className={cx(
            'question-card',
            questionData.visualOnly && 'visual-only-question',
            questionData.imageChoices && 'image-choice-question',
            questionData.swatches && 'swatch-question',
            questionData.plain && 'plain-question'
          )}>
            <div className='question-copy'>
              <p className='eyebrow'>{t.round} {current + 1}</p>
              <h1>{localizedQuestion.question}</h1>
            </div>

            <div className='answer-grid'>
              {localizedQuestion.answers.map((answer, index) => {
                const visualType = questionData.visuals?.[index];

                return (
                  <button
                    className={cx('answer-button', !visualType && 'no-visual-answer', answerClass(index))}
                    disabled={answered}
                    key={`${questionData.id}-${answer}`}
                    type='button'
                    onClick={() => handleAnswer(index)}
                    aria-label={answer}
                  >
                    {visualType ? <AnswerVisual type={visualType} /> : null}
                    <span className='answer-letter'>{String.fromCharCode(65 + index)}</span>
                    <strong className='answer-title'>{answer}</strong>
                  </button>
                );
              })}
            </div>

            <div className={cx('feedback', answered && 'show', outcome, timedOut && 'timeout')}>
              <strong>{statusText}{lastPoints > 0 ? <span className='points-pop'>+{lastPoints}</span> : null}</strong>
              {answered ? (
                <button className='next-action' type='button' onClick={nextQuestion}>{current + 1 >= questions.length ? t.finish : t.next}</button>
              ) : null}
            </div>
          </section>

          <PenaltyArena outcome={outcome} animationId={animationId} playerTeam={match.playerTeam} keeperTeam={match.keeperTeam} keeperKit={match.keeperKit} />
        </div>
      </section>
    </main>
  );
}
