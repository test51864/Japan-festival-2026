import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const questionBank = {
  en: [
    {
      id: 1,
      question: "Where does Yanmar come from?",
      answers: ["Japan", "USA", "Germany"],
      correct: 0,
      fact: "Yanmar was founded in Japan.",
    },
    {
      id: 2,
      question: "No power on site?",
      answers: ["Generator", "Tractor", "Boat"],
      correct: 0,
      fact: "Generators provide power when electricity is unavailable.",
    },
    {
      id: 3,
      question: "Compact tractor power?",
      answers: ["10 hp", "25–50 hp", "200 hp"],
      correct: 1,
      fact: "Compact tractors balance size and power.",
    },
    {
      id: 4,
      question: "What does a pump do?",
      answers: ["Move water", "Make energy", "Cool air"],
      correct: 0,
      fact: "Pumps move water in real situations.",
    },
    {
      id: 5,
      question: "Where is a Yanmar marine engine used?",
      answers: ["Boat", "Car", "Train"],
      correct: 0,
      fact: "Marine engines are used in boats.",
    },
  ],
  nl: [
    {
      id: 1,
      question: "Waar komt Yanmar vandaan?",
      answers: ["Japan", "VS", "Duitsland"],
      correct: 0,
      fact: "Yanmar is opgericht in Japan.",
    },
    {
      id: 2,
      question: "Geen stroom op locatie?",
      answers: ["Generator", "Tractor", "Boot"],
      correct: 0,
      fact: "Generatoren leveren stroom als er geen elektriciteit is.",
    },
    {
      id: 3,
      question: "Hoeveel vermogen heeft een compacte tractor ongeveer?",
      answers: ["10 pk", "25–50 pk", "200 pk"],
      correct: 1,
      fact: "Compacte tractors combineren formaat en kracht.",
    },
    {
      id: 4,
      question: "Wat doet een pomp?",
      answers: ["Water verplaatsen", "Energie maken", "Lucht koelen"],
      correct: 0,
      fact: "Pompen verplaatsen water in praktijksituaties.",
    },
    {
      id: 5,
      question: "Waar gebruik je een Yanmar marine engine?",
      answers: ["Boot", "Auto", "Trein"],
      correct: 0,
      fact: "Marine engines worden gebruikt in boten.",
    },
  ],
};

const copy = {
  en: {
    title: "Yanmar Quiz Arena",
    kicker: "Japan Festival 2026",
    setupTitle: "Ready for kick-off?",
    intro: "Answer fast, score penalties and finish with your result.",
    language: "Language",
    team: "Team",
    start: "Start quiz",
    goals: "Goals",
    round: "Round",
    question: "Question",
    goalText: "GOAL!",
    saveText: "SAVED!",
    missText: "MISS!",
    correctText: "Correct answer",
    wrongText: "Wrong answer",
    next: "Next question",
    finish: "Finish quiz",
    complete: "Full time",
    score: "Score",
    prizeTitle: "Prize draw",
    prizeText: "Leave your email address below for a chance to win.",
    emailPlaceholder: "Enter your email address",
    emailError1: "Please enter your email address.",
    emailError2: "Please enter a valid email address.",
    prizeBtn: "Enter prize draw",
    thanks: "You're in!",
    thanksSub: "Thanks for joining the prize draw.",
    playAgain: "Play again",
    changeSetup: "Change setup",
    perfect: "Perfect striker",
    solid: "Strong performance",
    nice: "Nice effort",
  },
  nl: {
    title: "Yanmar Quiz Arena",
    kicker: "Japan Festival 2026",
    setupTitle: "Klaar voor de aftrap?",
    intro: "Beantwoord snel, scoor penalties en eindig met je resultaat.",
    language: "Taal",
    team: "Team",
    start: "Start quiz",
    goals: "Goals",
    round: "Ronde",
    question: "Vraag",
    goalText: "GOAL!",
    saveText: "GEPAKT!",
    missText: "MIS!",
    correctText: "Goed antwoord",
    wrongText: "Fout antwoord",
    next: "Volgende vraag",
    finish: "Quiz afronden",
    complete: "Full time",
    score: "Score",
    prizeTitle: "Winactie",
    prizeText: "Laat hieronder je e-mailadres achter en maak kans om te winnen.",
    emailPlaceholder: "Vul je e-mailadres in",
    emailError1: "Vul je e-mailadres in.",
    emailError2: "Vul een geldig e-mailadres in.",
    prizeBtn: "Doe mee aan de winactie",
    thanks: "Je doet mee!",
    thanksSub: "Bedankt voor het meedoen aan de winactie.",
    playAgain: "Speel opnieuw",
    changeSetup: "Instellingen wijzigen",
    perfect: "Perfecte spits",
    solid: "Sterke score",
    nice: "Netjes gedaan",
  },
};

const teams = {
  netherlands: {
    code: "NL",
    color: "#f58220",
    labels: { en: "Team Netherlands", nl: "Team Netherlands" },
  },
  japan: {
    code: "JP",
    color: "#111111",
    labels: { en: "Team Japan", nl: "Team Japan" },
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function BrandLockup({ compact = false }) {
  return (
    <div className={cx("brand-lockup", compact && "brand-lockup--compact")}>
      <div className="flying-y" aria-hidden="true">
        <span />
      </div>
      <div className="wordmark">YANMAR</div>
    </div>
  );
}

function SegmentedButton({ active, children, onClick }) {
  return (
    <button
      className={cx("segmented-button", active && "is-active")}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function SetupScreen({ language, setLanguage, team, setTeam, onStart }) {
  const t = copy[language];

  return (
    <main className="app-screen setup-screen">
      <section className="setup-panel" aria-labelledby="setup-title">
        <BrandLockup />
        <p className="kicker">{t.kicker}</p>
        <h1 id="setup-title">{t.setupTitle}</h1>
        <p className="intro-copy">{t.intro}</p>

        <div className="setup-controls">
          <fieldset>
            <legend>{t.language}</legend>
            <div className="segmented-control">
              <SegmentedButton active={language === "nl"} onClick={() => setLanguage("nl")}>
                NL
              </SegmentedButton>
              <SegmentedButton active={language === "en"} onClick={() => setLanguage("en")}>
                EN
              </SegmentedButton>
            </div>
          </fieldset>

          <fieldset>
            <legend>{t.team}</legend>
            <div className="team-grid">
              {Object.entries(teams).map(([key, option]) => (
                <button
                  className={cx("team-card", team === key && "is-active")}
                  key={key}
                  type="button"
                  onClick={() => setTeam(key)}
                  style={{ "--team-color": option.color }}
                  aria-pressed={team === key}
                >
                  <span>{option.code}</span>
                  <strong>{option.labels[language]}</strong>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <button className="primary-action" type="button" onClick={onStart}>
          {t.start}
        </button>
      </section>
    </main>
  );
}

function PenaltyArena({ shotState, shotKey, t, team }) {
  const active = shotState !== "idle";
  const shotClass = active ? `is-${shotState}` : "";
  const bannerText =
    shotState === "goal"
      ? t.goalText
      : shotState === "save"
      ? t.saveText
      : shotState === "miss"
      ? t.missText
      : "";

  return (
    <section className="arena-panel" aria-label="Penalty Arena">
      <div className="arena-topline">
        <span>Penalty Arena</span>
        <span>{teams[team].code}</span>
      </div>

      <div className={cx("result-badge", active && "show", shotClass)} aria-live="polite">
        {bannerText}
      </div>

      <div className={cx("confetti", shotState === "goal" && "show")} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="field">
        <div className={cx("goal-frame", shotState === "goal" && "is-shaking")} />
        <div className="goal-line" />

        <div className={cx("keeper", shotClass)}>
          <span className="keeper-head" />
          <span className="keeper-body" />
          <span className="keeper-legs" />
        </div>

        <div key={`line-${shotKey}`} className={cx("shot-line", shotClass)} />
        <div key={`ball-${shotKey}`} className={cx("ball", shotClass)} />
      </div>
    </section>
  );
}

function ResultLabel({ score, total, t }) {
  let label = t.nice;
  if (score === total) label = t.perfect;
  else if (score >= Math.ceil(total * 0.6)) label = t.solid;

  return <div className="result-label">{label}</div>;
}

export default function App() {
  const [language, setLanguage] = useState("nl");
  const [team, setTeam] = useState("netherlands");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shotState, setShotState] = useState("idle");
  const [shotKey, setShotKey] = useState(0);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");

  const t = copy[language];
  const questions = questionBank[language];
  const q = questions[current];
  const isLastQuestion = current === questions.length - 1;
  const activeTeam = useMemo(() => teams[team], [team]);
  const progress = Math.min(((current + 1) / questions.length) * 100, 100);

  useEffect(() => {
    if (displayScore === score) return undefined;

    const timeout = setTimeout(() => {
      setDisplayScore((previous) => (previous < score ? previous + 1 : score));
    }, 110);

    return () => clearTimeout(timeout);
  }, [displayScore, score]);

  function resetRun() {
    setCurrent(0);
    setScore(0);
    setDisplayScore(0);
    setSelected(null);
    setShowFeedback(false);
    setShotState("idle");
    setShotKey((key) => key + 1);
    setEmail("");
    setEmailSubmitted(false);
    setEmailError("");
  }

  function startGame() {
    resetRun();
    setStarted(true);
  }

  function handleAnswer(index) {
    if (showFeedback || selected !== null) return;

    const isCorrect = index === q.correct;
    const outcome = isCorrect ? "goal" : current % 2 === 0 ? "save" : "miss";

    setSelected(index);
    setShotKey((key) => key + 1);
    setShotState(outcome);

    setTimeout(() => {
      if (isCorrect) setScore((value) => value + 1);
      setShowFeedback(true);
    }, 520);
  }

  function nextQuestion() {
    if (isLastQuestion) {
      setCurrent((value) => value + 1);
      return;
    }

    setCurrent((value) => value + 1);
    setSelected(null);
    setShowFeedback(false);
    setShotState("idle");
    setShotKey((key) => key + 1);
  }

  function playAgain() {
    resetRun();
    setStarted(true);
  }

  function changeSetup() {
    resetRun();
    setStarted(false);
  }

  function submitEmail(event) {
    event.preventDefault();

    const trimmed = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!trimmed) {
      setEmailError(t.emailError1);
      return;
    }

    if (!valid) {
      setEmailError(t.emailError2);
      return;
    }

    const entry = {
      email: trimmed,
      score,
      team,
      language,
      date: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("yanmar_leads") || "[]");
    existing.push(entry);
    localStorage.setItem("yanmar_leads", JSON.stringify(existing));

    setEmailError("");
    setEmailSubmitted(true);
  }

  function getAnswerClass(index) {
    if (!showFeedback && selected !== index) return "";
    if (showFeedback && index === q.correct) return "is-correct";
    if (showFeedback && selected === index && index !== q.correct) return "is-wrong";
    return "";
  }

  if (!started) {
    return (
      <SetupScreen
        language={language}
        setLanguage={setLanguage}
        team={team}
        setTeam={setTeam}
        onStart={startGame}
      />
    );
  }

  if (current >= questions.length) {
    return (
      <main className="app-screen final-screen">
        <section className="final-panel">
          <BrandLockup />
          <p className="kicker">{t.complete}</p>
          <h1>
            {t.score}: {score}/{questions.length}
          </h1>
          <ResultLabel score={score} total={questions.length} t={t} />

          <form className="prize-form" onSubmit={submitEmail} noValidate>
            <h2>{t.prizeTitle}</h2>
            <p>{emailSubmitted ? t.thanksSub : t.prizeText}</p>

            {!emailSubmitted ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.emailPlaceholder}
                  aria-label={t.emailPlaceholder}
                />
                {emailError ? <div className="form-error">{emailError}</div> : null}
                <button className="primary-action" type="submit">
                  {t.prizeBtn}
                </button>
              </>
            ) : (
              <div className="thanks-message">{t.thanks}</div>
            )}
          </form>

          <div className="final-actions">
            <button className="secondary-action" type="button" onClick={changeSetup}>
              {t.changeSetup}
            </button>
            <button className="primary-action" type="button" onClick={playAgain}>
              {t.playAgain}
            </button>
          </div>
        </section>
      </main>
    );
  }

  const shotOutcomeText =
    shotState === "goal"
      ? t.goalText
      : shotState === "save"
      ? t.saveText
      : shotState === "miss"
      ? t.missText
      : "";
  const feedbackTitle =
    selected === q.correct
      ? `${t.correctText}. ${t.goalText}`
      : `${t.wrongText}. ${shotOutcomeText}`;

  return (
    <main className="app-screen game-screen">
      <section className="game-frame">
        <header className="game-header">
          <BrandLockup compact />
          <div className="score-strip" aria-label="Scoreboard">
            <div className="score-chip" style={{ "--team-color": activeTeam.color }}>
              <strong>{activeTeam.code}</strong>
              <span>{activeTeam.labels[language]}</span>
            </div>
            <div className="score-chip">
              <strong>{displayScore}</strong>
              <span>{t.goals}</span>
            </div>
            <div className="score-chip">
              <strong>
                {current + 1}/{questions.length}
              </strong>
              <span>{t.round}</span>
            </div>
          </div>
        </header>

        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="play-grid">
          <section className="question-panel" aria-labelledby="question-title">
            <p className="question-kicker">
              {t.question} {current + 1}
            </p>
            <h1 id="question-title">{q.question}</h1>

            <div className="answer-list">
              {q.answers.map((answer, index) => (
                <button
                  key={answer}
                  className={cx("answer-button", getAnswerClass(index))}
                  type="button"
                  disabled={showFeedback || selected !== null}
                  onClick={() => handleAnswer(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{answer}</strong>
                </button>
              ))}
            </div>

            {showFeedback ? (
              <div className={cx("feedback-box", shotState === "goal" ? "is-good" : "is-bad")}>
                <h2>{feedbackTitle}</h2>
                <p>{q.fact}</p>
                <button className="primary-action" type="button" onClick={nextQuestion}>
                  {isLastQuestion ? t.finish : t.next}
                </button>
              </div>
            ) : null}
          </section>

          <PenaltyArena shotState={shotState} shotKey={shotKey} t={t} team={team} />
        </div>
      </section>
    </main>
  );
}
