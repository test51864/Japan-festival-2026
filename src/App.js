import React, { useMemo, useState } from "react";
import "./App.css";

const assets = {
  logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Yanmar_logo_2013_full_horizontal.svg",
  mark: "https://upload.wikimedia.org/wikipedia/commons/4/42/Yanmar_logo_flying-Y.svg",
};

const teams = {
  netherlands: {
    code: "NL",
    color: "#f47b20",
    labels: { en: "Team Netherlands", nl: "Team Netherlands" },
  },
  japan: {
    code: "JP",
    color: "#e30613",
    labels: { en: "Team Japan", nl: "Team Japan" },
  },
};

const questionBank = {
  en: [
    {
      id: "brand-mark",
      question: "Which logo mark is associated with Yanmar?",
      answers: [
        { label: "Flying-Y", visual: "flying-y" },
        { label: "Target symbol", visual: "target" },
        { label: "Mitsubishi diamonds", visual: "diamonds" },
      ],
      correct: 0,
      visual: "brand-focus",
      fact: "Yanmar's brand mark is the Flying-Y, inspired by the Y in Yanmar and the wings of the Oniyanma.",
    },
    {
      id: "products",
      question: "What does Yanmar produce?",
      answers: [
        { label: "Engines, generators, pumps and machinery", visual: "products" },
        { label: "Only smartphones", visual: "phone" },
        { label: "Only clothing", visual: "shirt" },
      ],
      correct: 0,
      visual: "products-stage",
      fact: "Yanmar works across power, marine, agriculture, construction and energy solutions.",
    },
    {
      id: "premium-red",
      question: "Which color is strongly linked to Yanmar branding?",
      answers: [
        { label: "Premium Red", visual: "premium-red" },
        { label: "Neon Purple", visual: "purple" },
        { label: "Pastel Pink", visual: "pink" },
      ],
      correct: 0,
      visual: "red-stage",
      fact: "Yanmar red represents pioneering spirit, passion, sunlight and natural wealth.",
    },
    {
      id: "oniyanma",
      question: "What is an Oniyanma?",
      answers: [
        { label: "A dragonfly", visual: "oniyanma" },
        { label: "A mountain", visual: "mountain" },
        { label: "A football club", visual: "football" },
      ],
      correct: 0,
      visual: "oniyanma-stage",
      fact: "The Yanmar name is connected to the Oniyanma, a powerful Japanese dragonfly and harvest symbol.",
    },
    {
      id: "osaka",
      question: "In which Japanese city was Yanmar founded?",
      answers: [
        { label: "Osaka", visual: "osaka" },
        { label: "Paris", visual: "paris" },
        { label: "New York", visual: "new-york" },
      ],
      correct: 0,
      visual: "city-stage",
      fact: "Yanmar was founded in Osaka, Japan in 1912.",
    },
    {
      id: "football",
      question: "Which clubs connect Yanmar with football?",
      answers: [
        { label: "Almere City FC and Cerezo Osaka", visual: "club-pair" },
        { label: "Real Madrid and Chelsea", visual: "generic-clubs" },
        { label: "Ajax and Barcelona", visual: "generic-clubs" },
      ],
      correct: 0,
      visual: "football-stage",
      fact: "This quiz links the Yanmar brand story with its football presence in the Netherlands and Japan.",
    },
  ],
  nl: [
    {
      id: "brand-mark",
      question: "Welk logo mark hoort bij Yanmar?",
      answers: [
        { label: "Flying-Y", visual: "flying-y" },
        { label: "Target-symbool", visual: "target" },
        { label: "Mitsubishi-diamanten", visual: "diamonds" },
      ],
      correct: 0,
      visual: "brand-focus",
      fact: "Het Yanmar brand mark is de Flying-Y, geinspireerd door de Y van Yanmar en de vleugels van de Oniyanma.",
    },
    {
      id: "products",
      question: "Wat produceert Yanmar?",
      answers: [
        { label: "Motoren, generatoren, pompen en machines", visual: "products" },
        { label: "Alleen smartphones", visual: "phone" },
        { label: "Alleen kleding", visual: "shirt" },
      ],
      correct: 0,
      visual: "products-stage",
      fact: "Yanmar werkt aan power, marine, landbouw, bouwmachines en energie-oplossingen.",
    },
    {
      id: "premium-red",
      question: "Welke kleur hoort sterk bij Yanmar branding?",
      answers: [
        { label: "Premium Red", visual: "premium-red" },
        { label: "Neonpaars", visual: "purple" },
        { label: "Pastelroze", visual: "pink" },
      ],
      correct: 0,
      visual: "red-stage",
      fact: "Yanmar rood staat voor pioniersgeest, passie, zonlicht en natuurlijke rijkdom.",
    },
    {
      id: "oniyanma",
      question: "Wat is een Oniyanma?",
      answers: [
        { label: "Een libel", visual: "oniyanma" },
        { label: "Een berg", visual: "mountain" },
        { label: "Een voetbalclub", visual: "football" },
      ],
      correct: 0,
      visual: "oniyanma-stage",
      fact: "De naam Yanmar is verbonden met de Oniyanma, een krachtige Japanse libel en symbool voor oogst.",
    },
    {
      id: "osaka",
      question: "In welke Japanse stad is Yanmar opgericht?",
      answers: [
        { label: "Osaka", visual: "osaka" },
        { label: "Parijs", visual: "paris" },
        { label: "New York", visual: "new-york" },
      ],
      correct: 0,
      visual: "city-stage",
      fact: "Yanmar is in 1912 opgericht in Osaka, Japan.",
    },
    {
      id: "football",
      question: "Welke clubs verbinden Yanmar met voetbal?",
      answers: [
        { label: "Almere City FC en Cerezo Osaka", visual: "club-pair" },
        { label: "Real Madrid en Chelsea", visual: "generic-clubs" },
        { label: "Ajax en Barcelona", visual: "generic-clubs" },
      ],
      correct: 0,
      visual: "football-stage",
      fact: "Deze quiz verbindt het Yanmar brand verhaal met voetbal in Nederland en Japan.",
    },
  ],
};

const copy = {
  en: {
    title: "Yanmar Power League",
    event: "Japan Festival 2026",
    intro: "A premium penalty quiz built around Yanmar's brand story.",
    chooseLanguage: "Language",
    chooseTeam: "Team",
    start: "Start match",
    goals: "Goals",
    round: "Round",
    progress: "Progress",
    answer: "Choose your answer",
    goal: "Correct. Goal.",
    save: "Wrong. Saved.",
    miss: "Wrong. Miss.",
    next: "Next question",
    finish: "Finish match",
    complete: "Full time",
    playAgain: "Play again",
    changeSetup: "Change setup",
    finalLead: (score, total) => `You scored ${score} of ${total}.`,
    perfect: "Perfect brand striker.",
    solid: "Strong performance.",
    nice: "Good effort.",
    prizeTitle: "Prize draw",
    prizeText: "Leave an email address to join the draw.",
    emailPlaceholder: "Email address",
    emailError: "Enter a valid email address.",
    submit: "Join draw",
    thanks: "Entry saved.",
  },
  nl: {
    title: "Yanmar Power League",
    event: "Japan Festival 2026",
    intro: "Een premium penaltyquiz rond het merkverhaal van Yanmar.",
    chooseLanguage: "Taal",
    chooseTeam: "Team",
    start: "Start wedstrijd",
    goals: "Goals",
    round: "Ronde",
    progress: "Voortgang",
    answer: "Kies je antwoord",
    goal: "Goed. Goal.",
    save: "Fout. Gepakt.",
    miss: "Fout. Mis.",
    next: "Volgende vraag",
    finish: "Wedstrijd afronden",
    complete: "Full time",
    playAgain: "Speel opnieuw",
    changeSetup: "Setup wijzigen",
    finalLead: (score, total) => `Je scoorde ${score} van ${total}.`,
    perfect: "Perfecte brand striker.",
    solid: "Sterke prestatie.",
    nice: "Netjes gedaan.",
    prizeTitle: "Winactie",
    prizeText: "Laat een e-mailadres achter om mee te doen.",
    emailPlaceholder: "E-mailadres",
    emailError: "Vul een geldig e-mailadres in.",
    submit: "Doe mee",
    thanks: "Inschrijving opgeslagen.",
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Visual({ type, size = "regular" }) {
  if (type === "flying-y") {
    return (
      <div className={cx("visual", "visual-logo", `visual-${size}`)}>
        <img src={assets.mark} alt="Yanmar Flying-Y" />
      </div>
    );
  }

  if (type === "brand-focus") {
    return (
      <div className="stage-visual stage-brand">
        <img src={assets.mark} alt="Yanmar Flying-Y" />
        <span>FLYING-Y</span>
      </div>
    );
  }

  if (type === "target") return <div className={cx("visual", "symbol-target", `visual-${size}`)} aria-hidden="true" />;
  if (type === "diamonds") return <div className={cx("visual", "symbol-diamonds", `visual-${size}`)} aria-hidden="true"><span /><span /><span /></div>;
  if (type === "premium-red") return <div className={cx("visual", "swatch-red", `visual-${size}`)}><span>RED</span></div>;
  if (type === "purple") return <div className={cx("visual", "swatch-purple", `visual-${size}`)}><span>PUR</span></div>;
  if (type === "pink") return <div className={cx("visual", "swatch-pink", `visual-${size}`)}><span>PNK</span></div>;
  if (type === "products") return <ProductIcons size={size} />;
  if (type === "products-stage") return <ProductIcons stage />;
  if (type === "phone") return <DeviceIcon label="APP" />;
  if (type === "shirt") return <ShirtIcon />;
  if (type === "oniyanma" || type === "oniyanma-stage") return <OniyanmaVisual stage={type === "oniyanma-stage"} />;
  if (type === "mountain") return <MountainIcon />;
  if (type === "football" || type === "football-stage") return <FootballVisual stage={type === "football-stage"} />;
  if (type === "osaka" || type === "city-stage") return <CityVisual label="OSAKA" stage={type === "city-stage"} />;
  if (type === "paris") return <CityVisual label="PAR" />;
  if (type === "new-york") return <CityVisual label="NYC" />;
  if (type === "club-pair") return <ClubPair />;
  if (type === "generic-clubs") return <GenericClubs />;
  if (type === "red-stage") return <div className="stage-visual stage-red"><span>PREMIUM RED</span></div>;

  return null;
}

function ProductIcons({ stage = false, size = "regular" }) {
  return (
    <div className={cx("product-icons", stage && "stage-visual", !stage && `visual-${size}`)} aria-hidden="true">
      <span>ENG</span>
      <span>GEN</span>
      <span>PUMP</span>
      <span>MACH</span>
    </div>
  );
}

function DeviceIcon({ label }) {
  return <div className="visual device-icon"><span>{label}</span></div>;
}

function ShirtIcon() {
  return <div className="visual shirt-icon" aria-hidden="true"><span /></div>;
}

function OniyanmaVisual({ stage = false }) {
  return (
    <div className={cx(stage ? "stage-visual" : "visual", "oniyanma-visual")} aria-hidden="true">
      <span className="wing wing-left" />
      <span className="wing wing-right" />
      <span className="body" />
      <span className="head" />
    </div>
  );
}

function MountainIcon() {
  return <div className="visual mountain-icon" aria-hidden="true"><span /></div>;
}

function FootballVisual({ stage = false }) {
  return <div className={cx(stage ? "stage-visual" : "visual", "football-visual")} aria-hidden="true"><span /></div>;
}

function CityVisual({ label, stage = false }) {
  return (
    <div className={cx(stage ? "stage-visual" : "visual", "city-visual")} aria-hidden="true">
      <span>{label}</span>
      <i />
      <i />
      <i />
    </div>
  );
}

function ClubPair() {
  return (
    <div className="visual club-pair" aria-hidden="true">
      <span>ALM</span>
      <span>CER</span>
    </div>
  );
}

function GenericClubs() {
  return (
    <div className="visual club-pair muted-clubs" aria-hidden="true">
      <span>FC</span>
      <span>FC</span>
    </div>
  );
}

function SetupScreen({ language, setLanguage, team, setTeam, onStart }) {
  const t = copy[language];
  const canStart = Boolean(language && team);

  return (
    <main className="app app-setup">
      <section className="setup-shell">
        <div className="setup-brand-panel">
          <div className="brand-card">
            <img className="yanmar-wordmark" src={assets.logo} alt="YANMAR" />
            <div className="brand-divider" />
            <p>{t.event}</p>
          </div>
          <img className="hero-mark" src={assets.mark} alt="" aria-hidden="true" />
        </div>

        <div className="setup-panel">
          <p className="eyebrow">{t.event}</p>
          <h1>{t.title}</h1>
          <p className="intro-copy">{t.intro}</p>

          <div className="setup-group">
            <div className="group-label">{t.chooseLanguage}</div>
            <div className="segmented-control" aria-label={t.chooseLanguage}>
              <button className={cx(language === "nl" && "active")} type="button" onClick={() => setLanguage("nl")}>NL</button>
              <button className={cx(language === "en" && "active")} type="button" onClick={() => setLanguage("en")}>EN</button>
            </div>
          </div>

          <div className="setup-group">
            <div className="group-label">{t.chooseTeam}</div>
            <div className="team-grid">
              {Object.entries(teams).map(([id, value]) => (
                <button
                  className={cx("team-card", team === id && "active")}
                  key={id}
                  style={{ "--team-color": value.color }}
                  type="button"
                  onClick={() => setTeam(id)}
                >
                  <span>{value.code}</span>
                  <strong>{value.labels[language]}</strong>
                </button>
              ))}
            </div>
          </div>

          <button className="primary-cta" disabled={!canStart} type="button" onClick={onStart}>
            {t.start}
          </button>
        </div>
      </section>
    </main>
  );
}

function PenaltyArena({ outcome, animationId, teamColor, t }) {
  const active = outcome !== "idle";
  const banner = outcome === "goal" ? "GOAL" : outcome === "save" ? "SAVE" : outcome === "miss" ? "MISS" : "";

  return (
    <aside className="arena-card" style={{ "--team-color": teamColor }}>
      <div className="arena-topline">
        <span>Penalty Arena</span>
        <span>{active ? banner : t.answer}</span>
      </div>
      <div className={cx("result-flash", active && "show", outcome)}>{banner}</div>
      <div className={cx("confetti", outcome === "goal" && "show")} aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span />
      </div>
      <div className="arena-field">
        <div className={cx("goal-net", outcome === "goal" && "shake")} />
        <div className="goal-line" />
        <div className={cx("keeper", outcome === "goal" && "dive-left", outcome === "save" && "save-center", outcome === "miss" && "dive-right")}>
          <span className="keeper-head" />
          <span className="keeper-body" />
          <span className="keeper-leg keeper-leg-left" />
          <span className="keeper-leg keeper-leg-right" />
        </div>
        <div key={`line-${animationId}`} className={cx("shot-line", outcome)} />
        <div key={`ball-${animationId}`} className={cx("ball", outcome)} />
      </div>
    </aside>
  );
}

function FinalScreen({ score, total, t, onPlayAgain, onChangeSetup }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const label = score === total ? t.perfect : score >= Math.ceil(total * 0.66) ? t.solid : t.nice;

  function submitEmail(event) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t.emailError);
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem("yanmar_quiz_leads") || "[]");
      existing.push({ email: trimmed, score, total, createdAt: new Date().toISOString() });
      localStorage.setItem("yanmar_quiz_leads", JSON.stringify(existing));
    } catch (storageError) {
      // Local storage can be unavailable in private browsing; the UI should still complete.
    }

    setError("");
    setSubmitted(true);
  }

  return (
    <main className="app app-final">
      <section className="final-card">
        <img className="final-logo" src={assets.logo} alt="YANMAR" />
        <p className="eyebrow">{t.complete}</p>
        <h1>{t.finalLead(score, total)}</h1>
        <div className="result-medal">{label}</div>

        <form className="lead-form" onSubmit={submitEmail} noValidate>
          <h2>{t.prizeTitle}</h2>
          <p>{submitted ? t.thanks : t.prizeText}</p>
          {!submitted ? (
            <>
              <input value={email} type="email" placeholder={t.emailPlaceholder} onChange={(event) => setEmail(event.target.value)} />
              {error ? <div className="form-error">{error}</div> : null}
              <button className="primary-cta" type="submit">{t.submit}</button>
            </>
          ) : null}
        </form>

        <div className="final-actions">
          <button className="secondary-cta" type="button" onClick={onChangeSetup}>{t.changeSetup}</button>
          <button className="primary-cta" type="button" onClick={onPlayAgain}>{t.playAgain}</button>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [language, setLanguage] = useState("nl");
  const [team, setTeam] = useState("netherlands");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [outcome, setOutcome] = useState("idle");
  const [animationId, setAnimationId] = useState(0);

  const t = copy[language];
  const questions = questionBank[language];
  const question = questions[current];
  const activeTeam = teams[team];
  const isFinal = current >= questions.length;
  const answered = selected !== null;
  const progress = useMemo(() => {
    const base = isFinal ? questions.length : current + (answered ? 1 : 0);
    return Math.round((base / questions.length) * 100);
  }, [answered, current, isFinal, questions.length]);

  function resetRound() {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setOutcome("idle");
    setAnimationId((value) => value + 1);
  }

  function startGame() {
    resetRound();
    setStarted(true);
  }

  function handleAnswer(index) {
    if (answered || isFinal) return;

    const isCorrect = index === question.correct;
    const nextOutcome = isCorrect ? "goal" : current % 2 === 0 ? "save" : "miss";

    setSelected(index);
    setOutcome(nextOutcome);
    setAnimationId((value) => value + 1);
    if (isCorrect) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      setCurrent(questions.length);
      setSelected(null);
      setOutcome("idle");
      return;
    }

    setCurrent((value) => value + 1);
    setSelected(null);
    setOutcome("idle");
    setAnimationId((value) => value + 1);
  }

  function answerClass(index) {
    if (!answered) return "";
    if (index === question.correct) return "is-correct";
    if (index === selected) return "is-wrong";
    return "is-muted";
  }

  if (!started) {
    return <SetupScreen language={language} setLanguage={setLanguage} team={team} setTeam={setTeam} onStart={startGame} />;
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

  const statusText = answered ? (outcome === "goal" ? t.goal : outcome === "save" ? t.save : t.miss) : t.answer;

  return (
    <main className="app app-game">
      <section className="game-shell">
        <header className="game-header">
          <img className="game-logo" src={assets.logo} alt="YANMAR" />
          <div className="match-info">
            <span style={{ "--team-color": activeTeam.color }}>{activeTeam.labels[language]}</span>
            <strong>{t.round} {current + 1}/{questions.length}</strong>
          </div>
        </header>

        <div className="progress-bar" aria-label={`${t.progress}: ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="game-grid">
          <section className="question-card">
            <div className="question-stage">
              <Visual type={question.visual} />
            </div>

            <div className="question-copy">
              <p className="eyebrow">{t.round} {current + 1}</p>
              <h1>{question.question}</h1>
            </div>

            <div className="answer-grid">
              {question.answers.map((answer, index) => (
                <button
                  className={cx("answer-button", answerClass(index))}
                  disabled={answered}
                  key={answer.label}
                  type="button"
                  onClick={() => handleAnswer(index)}
                >
                  <Visual type={answer.visual} size="small" />
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                  <strong>{answer.label}</strong>
                </button>
              ))}
            </div>

            <div className={cx("feedback", answered && "show", outcome)}>
              <div>
                <strong>{statusText}</strong>
                {answered ? <p>{question.fact}</p> : null}
              </div>
              {answered ? (
                <button className="next-action" type="button" onClick={nextQuestion}>
                  {current + 1 >= questions.length ? t.finish : t.next}
                </button>
              ) : null}
            </div>
          </section>

          <PenaltyArena outcome={outcome} animationId={animationId} teamColor={activeTeam.color} t={t} />
        </div>
      </section>
    </main>
  );
}
