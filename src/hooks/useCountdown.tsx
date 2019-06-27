import { useState, useEffect, useCallback } from 'react';

const useCountdown = (span: number) => {
  const [ complete, setComplete ] = useState(false);
  const [ paused, setPaused ] = useState(false);
  const [ currentTime, setCurrentTime ] = useState(span);

  const togglePause = () => {
    setPaused(!paused);
  }

  const tick = useCallback(() => {
    setCurrentTime(c => c > 0 ? c - 1 : 0);
  }, []);

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
    if (span !== null) {
      setCurrentTime(span);
      let id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }
  }, [span, tick]);

  return { complete, currentTime, restart }
};

export default useCountdown;