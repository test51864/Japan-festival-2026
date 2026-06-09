import React, { useMemo, useState } from 'react';
import './App.css';

const assets = {
  logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Yanmar_logo_2013_full_horizontal.svg',
  mark: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Yanmar_logo_flying-Y.svg',
};

const languages = [
  { id: 'nl', label: 'NL' },
  { id: 'en', label: 'EN' },
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
  netherlands: [
    {
      id: 'ned-orange',
      primary: '#f47b20',
      trim: '#ffffff',
      text: '#101114',
      labels: { en: 'NED orange', nl: 'NED oranje', ja: 'NED オレンジ' },
    },
    {
      id: 'ned-white',
      primary: '#ffffff',
      trim: '#f47b20',
      text: '#101114',
      labels: { en: 'NED white', nl: 'NED wit', ja: 'NED ホワイト' },
    },
    {
      id: 'ned-graphite',
      primary: '#15171b',
      trim: '#f47b20',
      text: '#ffffff',
      labels: { en: 'NED graphite', nl: 'NED graphite', ja: 'NED グラファイト' },
    },
  ],
  japan: [
    {
      id: 'jpn-blue',
      primary: '#174a9c',
      trim: '#e30613',
      text: '#ffffff',
      labels: { en: 'JPN blue', nl: 'JPN blauw', ja: 'JPN ブルー' },
    },
    {
      id: 'jpn-red',
      primary: '#e30613',
      trim: '#ffffff',
      text: '#ffffff',
      labels: { en: 'JPN red', nl: 'JPN rood', ja: 'JPN レッド' },
    },
    {
      id: 'jpn-black',
      primary: '#101114',
      trim: '#e30613',
      text: '#ffffff',
      labels: { en: 'JPN black', nl: 'JPN zwart', ja: 'JPN ブラック' },
    },
  ],
};

const copy = {
  en: {
    title: 'Yanmar Power League',
    event: 'Japan Festival 2026',
    intro: 'Pick your side, beat the keeper, and clear the Yanmar brand challenge.',
    chooseLanguage: 'Language',
    chooseTeam: 'Your team',
    chooseKeeper: 'Opponent keeper',
    keeperVs: 'Keeper',
    start: 'Kick off',
    round: 'Round',
    progress: 'Progress',
    answer: 'Choose your shot',
    goal: 'Correct. Goal.',
    save: 'Wrong. Saved.',
    miss: 'Wrong. Miss.',
    next: 'Next shot',
    finish: 'Finish match',
    complete: 'Full time',
    playAgain: 'Play again',
    changeSetup: 'Change teams',
    finalLead: (score, total) => `You scored ${score} of ${total}.`,
    perfect: 'Perfect striker.',
    solid: 'Strong performance.',
    nice: 'Good effort.',
    prizeTitle: 'Prize draw',
    prizeText: 'Leave an email address to join the draw.',
    emailPlaceholder: 'Email address',
    emailError: 'Enter a valid email address.',
    submit: 'Join draw',
    thanks: 'Entry saved.',
  },
  nl: {
    title: 'Yanmar Power League',
    event: 'Japan Festival 2026',
    intro: 'Kies je team, versla de keeper en speel de Yanmar brand challenge uit.',
    chooseLanguage: 'Taal',
    chooseTeam: 'Jouw team',
    chooseKeeper: 'Keeper tegenstander',
    keeperVs: 'Keeper',
    start: 'Aftrappen',
    round: 'Ronde',
    progress: 'Voortgang',
    answer: 'Kies je schot',
    goal: 'Goed. Goal.',
    save: 'Fout. Gepakt.',
    miss: 'Fout. Mis.',
    next: 'Volgend schot',
    finish: 'Wedstrijd afronden',
    complete: 'Full time',
    playAgain: 'Speel opnieuw',
    changeSetup: 'Teams wijzigen',
    finalLead: (score, total) => `Je scoorde ${score} van ${total}.`,
    perfect: 'Perfecte striker.',
    solid: 'Sterke prestatie.',
    nice: 'Netjes gedaan.',
    prizeTitle: 'Winactie',
    prizeText: 'Laat een e-mailadres achter om mee te doen.',
    emailPlaceholder: 'E-mailadres',
    emailError: 'Vul een geldig e-mailadres in.',
    submit: 'Doe mee',
    thanks: 'Inschrijving opgeslagen.',
  },
  ja: {
    title: 'Yanmar Power League',
    event: 'Japan Festival 2026',
    intro: 'チームを選び、キーパーを破ってYanmarブランドチャレンジに挑戦。',
    chooseLanguage: '言語',
    chooseTeam: '自分のチーム',
    chooseKeeper: '相手GK',
    keeperVs: 'GK',
    start: 'キックオフ',
    round: 'ラウンド',
    progress: '進行状況',
    answer: 'シュートを選択',
    goal: '正解。ゴール。',
    save: '不正解。セーブ。',
    miss: '不正解。ミス。',
    next: '次のシュート',
    finish: '試合終了',
    complete: '試合終了',
    playAgain: 'もう一度プレイ',
    changeSetup: 'チーム変更',
    finalLead: (score, total) => `${total}問中${score}問正解。`,
    perfect: '完璧なストライカー。',
    solid: '素晴らしい成績です。',
    nice: 'よくできました。',
    prizeTitle: '抽選参加',
    prizeText: '抽選に参加するにはメールアドレスを入力してください。',
    emailPlaceholder: 'メールアドレス',
    emailError: '有効なメールアドレスを入力してください。',
    submit: '参加する',
    thanks: '登録しました。',
  },
};

const questions = [
  {
    id: 'brand-mark',
    correct: 0,
    visual: 'brand-focus',
    en: {
      question: 'Which logo mark is associated with Yanmar?',
      answers: ['Flying-Y', 'Target symbol', 'Mitsubishi diamonds'],
      fact: 'Yanmar’s brand mark is the Flying-Y, inspired by the Y in Yanmar and the wings of the Oniyanma.',
    },
    nl: {
      question: 'Welk logo mark hoort bij Yanmar?',
      answers: ['Flying-Y', 'Target-symbool', 'Mitsubishi-diamanten'],
      fact: 'Het Yanmar brand mark is de Flying-Y, geïnspireerd door de Y van Yanmar en de vleugels van de Oniyanma.',
    },
    ja: {
      question: 'Yanmarに関連するロゴマークはどれですか？',
      answers: ['Flying-Y', 'ターゲット', '三菱ダイヤ'],
      fact: 'YanmarのブランドマークはFlying-Yです。YanmarのYとオニヤンマの羽をモチーフにしています。',
    },
    answerVisuals: ['flying-y', 'target', 'diamonds'],
  },
  {
    id: 'products',
    correct: 0,
    visual: 'products-stage',
    en: {
      question: 'What does Yanmar produce?',
      answers: ['Engines, generators, pumps and machinery', 'Only smartphones', 'Only clothing'],
      fact: 'Yanmar works across power, marine, agriculture, construction and energy solutions.',
    },
    nl: {
      question: 'Wat produceert Yanmar?',
      answers: ['Motoren, generatoren, pompen en machines', 'Alleen smartphones', 'Alleen kleding'],
      fact: 'Yanmar werkt aan power, marine, landbouw, bouwmachines en energie-oplossingen.',
    },
    ja: {
      question: 'Yanmarは何をつくっていますか？',
      answers: ['エンジン・発電機・ポンプ・機械', 'スマートフォンだけ', '衣服だけ'],
      fact: 'Yanmarはパワー、マリン、農業、建設機械、エネルギー分野で事業を展開しています。',
    },
    answerVisuals: ['products', 'phone', 'shirt'],
  },
  {
    id: 'premium-red',
    correct: 0,
    visual: 'red-stage',
    en: {
      question: 'Which color is strongly linked to Yanmar branding?',
      answers: ['Premium Red', 'Neon Purple', 'Pastel Pink'],
      fact: 'Yanmar red represents pioneering spirit, passion, sunlight and natural wealth.',
    },
    nl: {
      question: 'Welke kleur hoort sterk bij Yanmar branding?',
      answers: ['Premium Red', 'Neonpaars', 'Pastelroze'],
      fact: 'Yanmar rood staat voor pioniersgeest, passie, zonlicht en natuurlijke rijkdom.',
    },
    ja: {
      question: 'Yanmarのブランドに強く結びつく色は？',
      answers: ['プレミアムレッド', 'ネオンパープル', 'パステルピンク'],
      fact: 'Yanmarの赤は、開拓精神、情熱、太陽、自然の豊かさを表しています。',
    },
    answerVisuals: ['premium-red', 'purple', 'pink'],
  },
  {
    id: 'oniyanma',
    correct: 0,
    visual: 'oniyanma-stage',
    en: {
      question: 'What is an Oniyanma?',
      answers: ['A dragonfly', 'A mountain', 'A football club'],
      fact: 'The Yanmar name is connected to the Oniyanma, a powerful Japanese dragonfly and harvest symbol.',
    },
    nl: {
      question: 'Wat is een Oniyanma?',
      answers: ['Een libel', 'Een berg', 'Een voetbalclub'],
      fact: 'De naam Yanmar is verbonden met de Oniyanma, een krachtige Japanse libel en symbool voor oogst.',
    },
    ja: {
      question: 'オニヤンマとは何ですか？',
      answers: ['トンボ', '山', 'サッカークラブ'],
      fact: 'Yanmarの名前は、日本で豊かな収穫の象徴とされるオニヤンマに由来しています。',
    },
    answerVisuals: ['oniyanma', 'mountain', 'football'],
  },
  {
    id: 'osaka',
    correct: 0,
    visual: 'city-stage',
    en: {
      question: 'In which Japanese city was Yanmar founded?',
      answers: ['Osaka', 'Paris', 'New York'],
      fact: 'Yanmar was founded in Osaka, Japan in 1912.',
    },
    nl: {
      question: 'In welke Japanse stad is Yanmar opgericht?',
      answers: ['Osaka', 'Parijs', 'New York'],
      fact: 'Yanmar is in 1912 opgericht in Osaka, Japan.',
    },
    ja: {
      question: 'Yanmarは日本のどの都市で創業しましたか？',
      answers: ['大阪', 'パリ', 'ニューヨーク'],
      fact: 'Yanmarは1912年に日本の大阪で創業しました。',
    },
    answerVisuals: ['osaka', 'paris', 'new-york'],
  },
  {
    id: 'football',
    correct: 0,
    visual: 'football-stage',
    en: {
      question: 'Which clubs connect Yanmar with football?',
      answers: ['Almere City FC and Cerezo Osaka', 'Real Madrid and Chelsea', 'Ajax and Barcelona'],
      fact: 'This quiz links the Yanmar brand story with its football presence in the Netherlands and Japan.',
    },
    nl: {
      question: 'Welke clubs verbinden Yanmar met voetbal?',
      answers: ['Almere City FC en Cerezo Osaka', 'Real Madrid en Chelsea', 'Ajax en Barcelona'],
      fact: 'Deze quiz verbindt het Yanmar brand verhaal met voetbal in Nederland en Japan.',
    },
    ja: {
      question: 'Yanmarとサッカーをつなぐクラブは？',
      answers: ['アルメレ・シティFCとセレッソ大阪', 'レアル・マドリードとチェルシー', 'アヤックスとバルセロナ'],
      fact: 'このクイズは、Yanmarのブランドストーリーとオランダ・日本でのサッカーのつながりを表しています。',
    },
    answerVisuals: ['club-pair', 'generic-clubs', 'generic-clubs'],
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function opponentOf(team) {
  return team === 'netherlands' ? 'japan' : 'netherlands';
}

function defaultKeeperKit(team) {
  return keeperKits[opponentOf(team)][0].id;
}

function getKeeperKit(keeperTeam, kitId) {
  return keeperKits[keeperTeam].find((kit) => kit.id === kitId) || keeperKits[keeperTeam][0];
}

function Visual({ type, size = 'regular' }) {
  if (type === 'flying-y') {
    return (
      <div className={cx('visual', 'visual-logo', `visual-${size}`)}>
        <img src={assets.mark} alt='Yanmar Flying-Y' />
      </div>
    );
  }

  if (type === 'brand-focus') {
    return (
      <div className='stage-visual stage-brand'>
        <img src={assets.mark} alt='Yanmar Flying-Y' />
        <span>FLYING-Y</span>
      </div>
    );
  }

  if (type === 'target') return <div className={cx('visual', 'symbol-target', `visual-${size}`)} aria-hidden='true' />;
  if (type === 'diamonds') return <div className={cx('visual', 'symbol-diamonds', `visual-${size}`)} aria-hidden='true'><span /><span /><span /></div>;
  if (type === 'premium-red') return <div className={cx('visual', 'swatch-red', `visual-${size}`)}><span>RED</span></div>;
  if (type === 'purple') return <div className={cx('visual', 'swatch-purple', `visual-${size}`)}><span>PUR</span></div>;
  if (type === 'pink') return <div className={cx('visual', 'swatch-pink', `visual-${size}`)}><span>PNK</span></div>;
  if (type === 'products') return <ProductIcons size={size} />;
  if (type === 'products-stage') return <ProductIcons stage />;
  if (type === 'phone') return <DeviceIcon label='APP' />;
  if (type === 'shirt') return <ShirtIcon />;
  if (type === 'oniyanma' || type === 'oniyanma-stage') return <OniyanmaVisual stage={type === 'oniyanma-stage'} />;
  if (type === 'mountain') return <MountainIcon />;
  if (type === 'football' || type === 'football-stage') return <FootballVisual stage={type === 'football-stage'} />;
  if (type === 'osaka' || type === 'city-stage') return <CityVisual label='OSAKA' stage={type === 'city-stage'} />;
  if (type === 'paris') return <CityVisual label='PAR' />;
  if (type === 'new-york') return <CityVisual label='NYC' />;
  if (type === 'club-pair') return <ClubPair />;
  if (type === 'generic-clubs') return <GenericClubs />;
  if (type === 'red-stage') return <div className='stage-visual stage-red'><span>PREMIUM RED</span></div>;
  return null;
}

function ProductIcons({ stage = false, size = 'regular' }) {
  return (
    <div className={cx('product-icons', stage && 'stage-visual', !stage && `visual-${size}`)} aria-hidden='true'>
      <span>ENG</span><span>GEN</span><span>PUMP</span><span>MACH</span>
    </div>
  );
}

function DeviceIcon({ label }) {
  return <div className='visual device-icon'><span>{label}</span></div>;
}

function ShirtIcon() {
  return <div className='visual shirt-icon' aria-hidden='true'><span /></div>;
}

function OniyanmaVisual({ stage = false }) {
  return (
    <div className={cx(stage ? 'stage-visual' : 'visual', 'oniyanma-visual')} aria-hidden='true'>
      <span className='wing wing-left' />
      <span className='wing wing-right' />
      <span className='body' />
      <span className='head' />
    </div>
  );
}

function MountainIcon() {
  return <div className='visual mountain-icon' aria-hidden='true'><span /></div>;
}

function FootballVisual({ stage = false }) {
  return <div className={cx(stage ? 'stage-visual' : 'visual', 'football-visual')} aria-hidden='true'><span /></div>;
}

function CityVisual({ label, stage = false }) {
  return (
    <div className={cx(stage ? 'stage-visual' : 'visual', 'city-visual')} aria-hidden='true'>
      <span>{label}</span><i /><i /><i />
    </div>
  );
}

function ClubPair() {
  return <div className='visual club-pair' aria-hidden='true'><span>ALM</span><span>CER</span></div>;
}

function GenericClubs() {
  return <div className='visual club-pair muted-clubs' aria-hidden='true'><span>FC</span><span>FC</span></div>;
}

function KitPreview({ kit }) {
  return (
    <span className='kit-preview' style={{ '--kit-primary': kit.primary, '--kit-trim': kit.trim, '--kit-text': kit.text }}>
      <i />
    </span>
  );
}

function SetupScreen({ language, setLanguage, team, onTeamChange, keeperKit, setKeeperKit, onStart }) {
  const t = copy[language];
  const keeperTeamId = opponentOf(team);
  const keeperTeam = teams[keeperTeamId];
  const kitOptions = keeperKits[keeperTeamId];

  return (
    <main className='app app-setup'>
      <section className='setup-shell'>
        <div className='setup-brand-panel'>
          <div className='brand-card'>
            <img className='yanmar-wordmark' src={assets.logo} alt='YANMAR' />
            <div className='brand-divider' />
            <p>{t.event}</p>
          </div>
          <img className='hero-mark' src={assets.mark} alt='' aria-hidden='true' />
          <div className='arcade-badge'>PK QUIZ</div>
        </div>

        <div className='setup-panel'>
          <p className='eyebrow'>{t.event}</p>
          <h1>{t.title}</h1>
          <p className='intro-copy'>{t.intro}</p>

          <div className='setup-group'>
            <div className='group-label'>{t.chooseLanguage}</div>
            <div className='segmented-control' aria-label={t.chooseLanguage}>
              {languages.map((option) => (
                <button className={cx(language === option.id && 'active')} key={option.id} type='button' onClick={() => setLanguage(option.id)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className='setup-group'>
            <div className='group-label'>{t.chooseTeam}</div>
            <div className='team-grid'>
              {Object.entries(teams).map(([id, value]) => (
                <button className={cx('team-card', team === id && 'active')} key={id} style={{ '--team-color': value.color, '--team-text': value.text }} type='button' onClick={() => onTeamChange(id)}>
                  <span>{value.code}</span>
                  <strong>{value.labels[language]}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className='setup-group'>
            <div className='keeper-row'>
              <div className='group-label'>{t.chooseKeeper}</div>
              <strong>{t.keeperVs}: {keeperTeam.code}</strong>
            </div>
            <div className='kit-grid'>
              {kitOptions.map((option) => (
                <button className={cx('kit-card', keeperKit === option.id && 'active')} key={option.id} type='button' onClick={() => setKeeperKit(option.id)}>
                  <KitPreview kit={option} />
                  <strong>{option.labels[language]}</strong>
                </button>
              ))}
            </div>
          </div>

          <button className='primary-cta' type='button' onClick={onStart}>{t.start}</button>
        </div>
      </section>
    </main>
  );
}

function PenaltyArena({ outcome, animationId, playerTeam, keeperTeam, keeperKit, t }) {
  const active = outcome !== 'idle';
  const banner = outcome === 'goal' ? 'GOAL' : outcome === 'save' ? 'SAVE' : outcome === 'miss' ? 'MISS' : '';

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
        <div className={cx('keeper', outcome === 'goal' && 'dive-left', outcome === 'save' && 'save-center', outcome === 'miss' && 'dive-right')}>
          <span className='keeper-head' />
          <span className='keeper-body' />
          <span className='keeper-leg keeper-leg-left' />
          <span className='keeper-leg keeper-leg-right' />
        </div>
        <div className='striker'>
          <span className='striker-head' />
          <span className='striker-body' />
          <span className='striker-leg striker-leg-left' />
          <span className='striker-leg striker-leg-right' />
        </div>
        <div key={`line-${animationId}`} className={cx('shot-line', outcome)} />
        <div key={`ball-${animationId}`} className={cx('ball', outcome)} />
      </div>
    </aside>
  );
}

function FinalScreen({ score, total, t, onPlayAgain, onChangeSetup }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const label = score === total ? t.perfect : score >= Math.ceil(total * 0.66) ? t.solid : t.nice;

  function submitEmail(event) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError(t.emailError);
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('yanmar_quiz_leads') || '[]');
      existing.push({ email: trimmed, score, total, createdAt: new Date().toISOString() });
      localStorage.setItem('yanmar_quiz_leads', JSON.stringify(existing));
    } catch (storageError) {
      // Keep the flow playable when local storage is unavailable.
    }

    setError('');
    setSubmitted(true);
  }

  return (
    <main className='app app-final'>
      <section className='final-card'>
        <img className='final-logo' src={assets.logo} alt='YANMAR' />
        <p className='eyebrow'>{t.complete}</p>
        <h1>{t.finalLead(score, total)}</h1>
        <div className='result-medal'>{label}</div>

        <form className='lead-form' onSubmit={submitEmail} noValidate>
          <h2>{t.prizeTitle}</h2>
          <p>{submitted ? t.thanks : t.prizeText}</p>
          {!submitted ? (
            <>
              <input value={email} type='email' placeholder={t.emailPlaceholder} onChange={(event) => setEmail(event.target.value)} />
              {error ? <div className='form-error'>{error}</div> : null}
              <button className='primary-cta' type='submit'>{t.submit}</button>
            </>
          ) : null}
        </form>

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
  const [keeperKit, setKeeperKit] = useState(defaultKeeperKit('netherlands'));
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [outcome, setOutcome] = useState('idle');
  const [animationId, setAnimationId] = useState(0);

  const t = copy[language];
  const playerTeam = teams[team];
  const keeperTeamId = opponentOf(team);
  const keeperTeam = teams[keeperTeamId];
  const activeKeeperKit = getKeeperKit(keeperTeamId, keeperKit);
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

  function chooseTeam(nextTeam) {
    setTeam(nextTeam);
    setKeeperKit(defaultKeeperKit(nextTeam));
  }

  function startGame() {
    resetRound();
    setStarted(true);
  }

  function handleAnswer(index) {
    if (answered || isFinal) return;
    const isCorrect = index === questionData.correct;
    const nextOutcome = isCorrect ? 'goal' : current % 2 === 0 ? 'save' : 'miss';
    setSelected(index);
    setOutcome(nextOutcome);
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
        onTeamChange={chooseTeam}
        keeperKit={keeperKit}
        setKeeperKit={setKeeperKit}
        onStart={startGame}
      />
    );
  }

  if (isFinal) {
    return (
      <FinalScreen
        score={score}
        total={questions.length}
        t={t}
        onPlayAgain={startGame}
        onChangeSetup={() => {
          resetRound();
          setStarted(false);
        }}
      />
    );
  }

  const statusText = answered ? (outcome === 'goal' ? t.goal : outcome === 'save' ? t.save : t.miss) : t.answer;

  return (
    <main className='app app-game'>
      <section className='game-shell'>
        <header className='game-header'>
          <img className='game-logo' src={assets.logo} alt='YANMAR' />
          <div className='match-info'>
            <span className='team-chip' style={{ '--chip-color': playerTeam.color, '--chip-text': playerTeam.text }}>{playerTeam.labels[language]}</span>
            <span className='team-chip keeper-chip' style={{ '--chip-color': activeKeeperKit.primary, '--chip-text': activeKeeperKit.text }}>{keeperTeam.code} GK</span>
            <strong>{t.round} {current + 1}/{questions.length}</strong>
          </div>
        </header>

        <div className='progress-bar' aria-label={`${t.progress}: ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className='game-grid'>
          <section className='question-card'>
            <div className='question-stage'><Visual type={questionData.visual} /></div>
            <div className='question-copy'>
              <p className='eyebrow'>{t.round} {current + 1}</p>
              <h1>{localizedQuestion.question}</h1>
            </div>

            <div className='answer-grid'>
              {localizedQuestion.answers.map((answer, index) => (
                <button className={cx('answer-button', answerClass(index))} disabled={answered} key={`${questionData.id}-${answer}`} type='button' onClick={() => handleAnswer(index)}>
                  <Visual type={questionData.answerVisuals[index]} size='small' />
                  <span className='answer-letter'>{String.fromCharCode(65 + index)}</span>
                  <strong>{answer}</strong>
                </button>
              ))}
            </div>

            <div className={cx('feedback', answered && 'show', outcome)}>
              <div>
                <strong>{statusText}</strong>
                {answered ? <p>{localizedQuestion.fact}</p> : null}
              </div>
              {answered ? (
                <button className='next-action' type='button' onClick={nextQuestion}>{current + 1 >= questions.length ? t.finish : t.next}</button>
              ) : null}
            </div>
          </section>

          <PenaltyArena outcome={outcome} animationId={animationId} playerTeam={playerTeam} keeperTeam={keeperTeam} keeperKit={activeKeeperKit} t={t} />
        </div>
      </section>
    </main>
  );
}
