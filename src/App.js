import React, { useMemo, useState } from 'react';
import './App.css';
import './QuizPolish.css';

const FORM_URL = 'https://forms.office.com/r/mbXENTrknQ';

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
    goal: 'GOAL!',
    save: 'SAVED!',
    next: 'Next round',
    finish: 'Finish game',
    complete: 'Finished',
    playAgain: 'Play again',
    changeSetup: 'Change setup',
    formsTitle: 'Join the prize draw',
    formsText: 'Open Microsoft Forms to submit your entry.',
    formsButton: 'Open prize form',
    finalLead: (score, total, name) => `${name ? `${name}, y` : 'Y'}ou scored ${score} of ${total}.`,
    perfect: 'Perfect score.',
    solid: 'Strong score.',
    nice: 'Nice effort.',
  },
  nl: {
    round: 'Ronde',
    progress: 'Voortgang',
    answer: 'Kies je antwoord',
    goal: 'GOAL!',
    save: 'GEPAKT!',
    next: 'Volgende ronde',
    finish: 'Game afronden',
    complete: 'Klaar',
    playAgain: 'Speel opnieuw',
    changeSetup: 'Setup wijzigen',
    formsTitle: 'Doe mee aan de winactie',
    formsText: 'Open Microsoft Forms om je deelname in te sturen.',
    formsButton: 'Open winactie formulier',
    finalLead: (score, total, name) => `${name ? `${name}, j` : 'J'}e scoorde ${score} van ${total}.`,
    perfect: 'Perfecte score.',
    solid: 'Sterke score.',
    nice: 'Netjes gedaan.',
  },
  ja: {
    round: 'ラウンド',
    progress: '進行状況',
    answer: '答えを選択',
    goal: 'ゴール！',
    save: 'セーブ！',
    next: '次のラウンド',
    finish: 'ゲーム終了',
    complete: '終了',
    playAgain: 'もう一度プレイ',
    changeSetup: '設定変更',
    formsTitle: '抽選に参加',
    formsText: 'Microsoft Formsを開いて参加してください。',
    formsButton: 'フォームを開く',
    finalLead: (score, total, name) => `${name ? `${name}: ` : ''}${total}問中${score}問正解。`,
    perfect: '完璧なスコア。',
    solid: '素晴らしいスコアです。',
    nice: 'よくできました。',
  },
};

const visualImages = {
  'flying-y': {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yanmar_logo_flying-Y.svg',
  },
  dragonfly: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Damselfly_07844.jpg?width=720',
  },
  'red-panda': {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Panda_by_Robert_Hoevels.jpg?width=720',
  },
  koi: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Koi_carp%3B_March_2009.jpg?width=720',
  },
};

const questions = [
  {
    id: 'yanmar-logo',
    correct: 0,
    visualOnly: true,
    visuals: ['flying-y', 'target', 'diamonds'],
    en: { question: 'Which logo truly fits Yanmar?', answers: ['Flying-Y', 'Target symbol', 'Mitsubishi diamonds'] },
    nl: { question: 'Welk logo past echt bij Yanmar?', answers: ['Flying-Y', 'Target-symbool', 'Mitsubishi-diamanten'] },
    ja: { question: 'Yanmarに本当に合うロゴはどれですか？', answers: ['Flying-Y', 'ターゲットシンボル', '三菱のダイヤ'] },
  },
  {
    id: 'yanmar-products',
    correct: 0,
    visuals: ['machine', 'luxury', 'console'],
    en: { question: 'What does Yanmar mainly make?', answers: ['Powerful machines, such as tractors and engines', 'Luxury clothing and watches', 'Video game consoles'] },
    nl: { question: 'Wat maakt Yanmar vooral?', answers: ['Krachtige machines, zoals tractoren en motoren', 'Luxe kleding en horloges', 'Spelcomputers en consoles'] },
    ja: { question: 'Yanmarは主に何を作っていますか？', answers: ['トラクターやエンジンなどの力強い機械', '高級服や時計', 'ゲーム機'] },
  },
  {
    id: 'yanmar-color',
    correct: 1,
    visuals: ['forest-green', 'premium-red', 'bright-yellow'],
    en: { question: 'Which color do you often see on Yanmar machines?', answers: ['Forest green', 'Premium Red', 'Bright yellow'] },
    nl: { question: 'Welke kleur zie je vaak terug bij de machines van Yanmar?', answers: ['Bosgroen', 'Premium Rood', 'Felgeel'] },
    ja: { question: 'Yanmarの機械でよく見る色はどれですか？', answers: ['フォレストグリーン', 'プレミアムレッド', '明るい黄色'] },
  },
  {
    id: 'oniyanma-animal',
    correct: 0,
    visuals: ['dragonfly', 'red-panda', 'koi'],
    en: { question: "The name 'Yanmar' comes from the 'Oniyanma'. What Japanese animal is that?", answers: ['A large, fast dragonfly', 'A fluffy red panda', 'A colorful koi carp'] },
    nl: { question: "De naam 'Yanmar' komt van de 'Oniyanma'. Wat voor Japans dier is dat?", answers: ['Een grote, snelle libel', 'Een pluizige rode panda', 'Een kleurrijke Koi karper'] },
    ja: { question: '「Yanmar」という名前は「オニヤンマ」に由来します。これはどんな日本の生き物ですか？', answers: ['大きくて速いトンボ', 'ふわふわのレッサーパンダ', '色鮮やかな錦鯉'] },
  },
  {
    id: 'football-owner',
    correct: 1,
    visuals: ['ajax-vissel', 'almere-cerezo', 'feyenoord-urawa'],
    en: { question: 'Which two football clubs is Yanmar owner of?', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
    nl: { question: 'Van welke twee voetbalclubs is Yanmar eigenaar?', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
    ja: { question: 'Yanmarがオーナーである2つのサッカークラブはどれですか？', answers: ['Ajax & Vissel Kobe', 'Almere City FC & Cerezo Osaka', 'Feyenoord & Urawa Reds'] },
  },
  {
    id: 'yanmar-city',
    correct: 1,
    visuals: ['tokyo', 'osaka', 'kyoto'],
    en: { question: 'In which Japanese city is Yanmar based?', answers: ['Tokyo', 'Osaka', 'Kyoto'] },
    nl: { question: 'In welke Japanse stad is Yanmar gevestigd?', answers: ['Tokyo', 'Osaka', 'Kyoto'] },
    ja: { question: 'Yanmarは日本のどの都市に拠点がありますか？', answers: ['東京', '大阪', '京都'] },
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
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
      <span className='sprite-leg sprite-leg-left' />
      <span className='sprite-leg sprite-leg-right' />
    </div>
  );
}

function PenaltyArena({ outcome, animationId, playerTeam, keeperTeam, keeperKit }) {
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
      <div className='arena-topline'>
        <span>Penalty Arena</span>
        <span>{keeperTeam.code} GK</span>
      </div>
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

function FinalScreen({ score, total, playerName, t, onPlayAgain, onChangeSetup }) {
  const label = score === total ? t.perfect : score >= Math.ceil(total * 0.6) ? t.solid : t.nice;

  return (
    <main className='app app-final'>
      <section className='final-card'>
        <div className='wordmark-final'>YANMAR</div>
        <p className='eyebrow'>{t.complete}</p>
        <h1>{t.finalLead(score, total, playerName.trim())}</h1>
        <div className='result-medal'>{label}</div>

        <div className='forms-panel'>
          <h2>{t.formsTitle}</h2>
          <p>{t.formsText}</p>
          <a className='primary-cta form-link' href={FORM_URL} target='_blank' rel='noreferrer'>{t.formsButton}</a>
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
  const [selected, setSelected] = useState(null);
  const [outcome, setOutcome] = useState('idle');
  const [animationId, setAnimationId] = useState(0);

  const t = copy[language];
  const match = getMatch(team);
  const questionData = questions[current];
  const localizedQuestion = questionData?.[language];
  const isFinal = current >= questions.length;
  const answered = selected !== null;
  const progress = useMemo(() => {
    const base = isFinal ? questions.length : current + (answered ? 1 : 0);
    return Math.round((base / questions.length) * 100);
  }, [answered, current, isFinal]);

  function resetRound() {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setOutcome('idle');
    setAnimationId((value) => value + 1);
  }

  function startGame() {
    resetRound();
    setStarted(true);
  }

  function handleAnswer(index) {
    if (answered || isFinal) return;
    const isCorrect = index === questionData.correct;
    setSelected(index);
    setOutcome(isCorrect ? 'goal' : 'save');
    setAnimationId((value) => value + 1);
    if (isCorrect) setScore((value) => value + 1);
  }

  function nextQuestion() {
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

  const statusText = answered ? (outcome === 'goal' ? t.goal : t.save) : t.answer;

  return (
    <main className='app app-game'>
      <section className='game-shell'>
        <header className='game-header'>
          <div className='game-brand'>Yanmar Quiz Arena</div>
          <div className='match-info'>
            <span className='team-chip' style={{ '--chip-color': match.playerTeam.color, '--chip-text': match.playerTeam.text }}>{playerName.trim() || match.playerTeam.labels[language]}</span>
            <span className='team-chip keeper-chip' style={{ '--chip-color': match.keeperKit.primary, '--chip-text': match.keeperKit.text }}>{match.keeperTeam.code} GK</span>
            <strong>{t.round} {current + 1}/{questions.length}</strong>
          </div>
        </header>

        <div className='progress-bar' aria-label={`${t.progress}: ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className='game-grid'>
          <section className={cx('question-card', questionData.visualOnly && 'visual-only-question')}>
            <div className='question-copy'>
              <p className='eyebrow'>{t.round} {current + 1}</p>
              <h1>{localizedQuestion.question}</h1>
            </div>

            <div className='answer-grid'>
              {localizedQuestion.answers.map((answer, index) => (
                <button className={cx('answer-button', answerClass(index))} disabled={answered} key={`${questionData.id}-${answer}`} type='button' onClick={() => handleAnswer(index)} aria-label={answer}>
                  <AnswerVisual type={questionData.visuals[index]} />
                  <span className='answer-letter'>{String.fromCharCode(65 + index)}</span>
                  <strong className='answer-title'>{answer}</strong>
                </button>
              ))}
            </div>

            <div className={cx('feedback', answered && 'show', outcome)}>
              <strong>{statusText}</strong>
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
