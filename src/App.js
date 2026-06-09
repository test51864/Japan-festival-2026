import React, { useState } from "react";
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
    subtitle: "Answer correctly to score a penalty.",
    choose: "Choose your answer.",
    goals: "Goals",
    question: "Question",
    arena: "Penalty Arena",
    team: "Team Yanmar",
    correct: "Correct answer. GOAL!",
    save: "Wrong answer. SAVED by the keeper!",
    miss: "Wrong answer. MISS!",
    next: "Next question",
    finish: "Finish quiz",
    finalTitle: "Full Time",
    finalText: (score, total) => `You scored ${score} out of ${total} penalties.`,
    playAgain: "Play again",
  },
  nl: {
    subtitle: "Beantwoord goed om een penalty te scoren.",
    choose: "Kies je antwoord.",
    goals: "Goals",
    question: "Vraag",
    arena: "Penalty Arena",
    team: "Team Yanmar",
    correct: "Goed antwoord. GOAL!",
    save: "Fout antwoord. GEPAKT door de keeper!",
    miss: "Fout antwoord. MIS!",
    next: "Volgende vraag",
    finish: "Quiz afronden",
    finalTitle: "Full Time",
    finalText: (score, total) => `Je scoorde ${score} van de ${total} penalties.`,
    playAgain: "Speel opnieuw",
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getOutcomeText(outcome) {
  if (outcome === "goal") return "GOAL!";
  if (outcome === "save") return "SAVED!";
  if (outcome === "miss") return "MISS!";
  return "";
}

export default function App() {
  const [language, setLanguage] = useState("nl");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [outcome, setOutcome] = useState("idle");
  const [animationKey, setAnimationKey] = useState(0);

  const questions = questionBank[language];
  const t = copy[language];
  const isFinal = currentQuestion >= questions.length;
  const q = questions[currentQuestion];
  const answered = selected !== null;

  function resetQuestion() {
    setSelected(null);
    setOutcome("idle");
    setAnimationKey((key) => key + 1);
  }

  function resetGame(nextLanguage = language) {
    setLanguage(nextLanguage);
    setCurrentQuestion(0);
    setScore(0);
    setSelected(null);
    setOutcome("idle");
    setAnimationKey((key) => key + 1);
  }

  function handleAnswer(index) {
    if (answered || isFinal) return;

    const correct = index === q.correct;
    const nextOutcome = correct ? "goal" : currentQuestion % 2 === 0 ? "save" : "miss";

    setSelected(index);
    setOutcome(nextOutcome);
    setAnimationKey((key) => key + 1);
    if (correct) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (currentQuestion + 1 >= questions.length) {
      setCurrentQuestion(questions.length);
      return;
    }

    setCurrentQuestion((value) => value + 1);
    resetQuestion();
  }

  function answerClass(index) {
    if (!answered) return "";
    if (index === q.correct) return "correct";
    if (index === selected) return "wrong";
    return "muted";
  }

  const statusText = answered
    ? outcome === "goal"
      ? t.correct
      : outcome === "save"
      ? t.save
      : t.miss
    : t.choose;

  return (
    <main className="game">
      <header className="header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <h1>Yanmar Quiz Arena</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="scoreboard">
          <div className="language-toggle" aria-label="Language">
            <button
              className={cx(language === "nl" && "active")}
              type="button"
              onClick={() => resetGame("nl")}
            >
              NL
            </button>
            <button
              className={cx(language === "en" && "active")}
              type="button"
              onClick={() => resetGame("en")}
            >
              EN
            </button>
          </div>
          <div className="score-card">
            <strong>{score}</strong>
            <span>{t.goals}</span>
          </div>
          <div className="score-card">
            <strong>
              {Math.min(currentQuestion + 1, questions.length)}/{questions.length}
            </strong>
            <span>{t.question}</span>
          </div>
        </div>
      </header>

      {!isFinal ? (
        <section className="content">
          <div className="question-panel">
            <div className="question-count">
              {t.question} {currentQuestion + 1}
            </div>
            <h2 className="question">{q.question}</h2>
            <div className="answers">
              {q.answers.map((answer, index) => (
                <button
                  className={cx("answer-btn", answerClass(index))}
                  disabled={answered}
                  key={answer}
                  type="button"
                  onClick={() => handleAnswer(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {answer}
                </button>
              ))}
            </div>

            <div className="meta">
              <div className={cx("status", outcome !== "idle" && outcome)}>{statusText}</div>
              {answered ? (
                <button className="next-btn show" type="button" onClick={nextQuestion}>
                  {currentQuestion + 1 >= questions.length ? t.finish : t.next}
                </button>
              ) : null}
            </div>

            {answered ? <p className="fact-box">{q.fact}</p> : null}
          </div>

          <div className="penalty-panel">
            <div className="arena-title">
              <span>{t.arena}</span>
              <span>{t.team}</span>
            </div>

            <div className={cx("result-banner", outcome !== "idle" && "show", outcome)}>
              {getOutcomeText(outcome)}
            </div>

            <div className={cx("confetti", outcome === "goal" && "show")} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="field">
              <div className="net-label">NET</div>
              <div className={cx("goal-frame", outcome === "goal" && "net-shake")} />
              <div className="goal-line" />

              <div
                className={cx(
                  "keeper",
                  outcome === "goal" && "dive-left",
                  outcome === "save" && "save-center",
                  outcome === "miss" && "dive-left"
                )}
              >
                <div className="head" />
                <div className="body" />
                <div className="legs" />
              </div>

              <div key={`line-${animationKey}`} className={cx("shot-line", outcome)} />
              <div key={`ball-${animationKey}`} className={cx("ball", outcome)} />
            </div>
          </div>
        </section>
      ) : (
        <section className="final-screen show">
          <h2>{t.finalTitle}</h2>
          <p>{t.finalText(score, questions.length)}</p>
          <button className="restart-btn show" type="button" onClick={() => resetGame(language)}>
            {t.playAgain}
          </button>
        </section>
      )}
    </main>
  );
}
