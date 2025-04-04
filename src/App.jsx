import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const programData = {
  program: [
    { name: 'Отжимания', duration: 10, isRest: false },
    { name: 'Отзых', duration: 5, isRest: true },
    { name: 'Пресс', duration: 10, isRest: false },
  ]
};

const WARNING_TIME = 3;  // Время до предупреждения (в секундах)

export default function WorkoutTimer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(programData.program[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const timerRef = useRef(null);
  const startSoundRef = useRef(new Audio('./assets/start-sound.mp3'));
  const warningSoundRef = useRef(new Audio('./assets/warning-sound.mp3'));

  useEffect(() => {
    if (isRunning) {
      if (remainingTime === programData.program[currentIndex].duration && !programData.program[currentIndex].isRest) {
        // Не воспроизводим звук старта, если это отдых
        startSoundRef.current.play();
      }

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === WARNING_TIME) {
            setIsWarning(true);
            warningSoundRef.current.play();
          }

          if (prev <= 1) {
            handleSkip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, remainingTime]);

  const handleStart = () => {
    setIsRunning(true);
    setIsWarning(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsWarning(false);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setIsWarning(false);
    const nextIndex = currentIndex + 1;
    if (nextIndex < programData.program.length) {
      setCurrentIndex(nextIndex);
      setRemainingTime(programData.program[nextIndex].duration);
      setIsRunning(true);
    } else {
      setCurrentIndex(0);
      setRemainingTime(programData.program[0].duration);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsWarning(false);
    setCurrentIndex(0);
    setRemainingTime(programData.program[0].duration);
  };

  const handleProgramClick = (index) => {
    setIsRunning(false);
    setIsWarning(false);
    setCurrentIndex(index);
    setRemainingTime(programData.program[index].duration);
  };

  const currentStep = programData.program[currentIndex];

  // Статус программы
  const getProgramStatus = () => {
    if (isRunning) {
      return currentStep.isRest ? 'Отдых' : 'Работа';
    } else {
      return 'Пауза';
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Таймер слева */}
        <div className="timer-card">
          <h1>Workout Timer</h1>
          <h2 className="exercise-name">{currentStep.name}</h2>
          <div className={`time-display ${isWarning ? 'warning-step' : ''}`}>
            {remainingTime}s
          </div>
          <div className="button-group">
            <button className="start" onClick={handleStart}>START</button>
            <button className="pause" onClick={handlePause}>PAUSE</button>
            <button className="reset" onClick={handleReset}>RESET</button>
          </div>
          <h3>Status: {getProgramStatus()}</h3> {/* Статус программы */}
        </div>

        {/* Программа справа */}
        <div className="program-list">
          <h3>Program Steps</h3>
          <ul>
            {programData.program.map((step, index) => (
              <li
                key={index}
                className={`${index === currentIndex ? 'active-step' : 'step'} 
                  ${step.isRest ? 'rest-step' : ''} 
                  ${isWarning && index === currentIndex ? 'warning-step' : ''}`}
                onClick={() => handleProgramClick(index)}
              >
                {step.name} - {step.duration}s
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
