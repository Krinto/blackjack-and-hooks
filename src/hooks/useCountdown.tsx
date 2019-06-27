import { useState, useEffect } from 'react';

const useCountdown = (span: number, delay: number) => {
  const [ complete, setComplete ] = useState(false);
  const [ paused, setPaused ] = useState(false);
  const [ currentTime, setCurrentTime ] = useState(-1);

  const togglePause = () => {
    setPaused(!paused);
  }

  const tick = () => {
    if (!paused && currentTime > 0) {
        setCurrentTime(currentTime - delay);
    }
  }

  const restart = () => {
    setComplete(false);
    setCurrentTime(span);
  }

  useEffect(() => {
    if (currentTime === 0) {
        setComplete(true);
    }
  }, [currentTime])

  // Set up the interval.
  useEffect(() => {
    if (delay !== null && span !== null) {
        setCurrentTime(span);
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
    }
  }, [delay, span]);

  return { complete, currentTime, togglePause, restart }
};

export default useCountdown;