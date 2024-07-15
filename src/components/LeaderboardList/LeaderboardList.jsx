import styles from "./LeaderboardList.module.css";
import cn from "classnames";
import { format } from "date-fns";
import { Puzzle } from "../Puzzle/Puzzle";
import { useState } from "react";
import { Ball } from "../Ball/Ball";

function formatSeconds(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date;
}

export function LeaderboardList({ position, userName, achievements, time }) {
  const [isPopupPuzzleVisible, setIsPopupPuzzleVisible] = useState(false);
  const [isPopupBallVisible, setIsPopupBallVisible] = useState(false);

  const formattedTime = format(formatSeconds(time), "mm:ss");

  const handleBallMouseEnter = () => {
    setIsPopupBallVisible(true);
  };

  const handleBallMouseLeave = () => {
    setIsPopupBallVisible(false);
  };

  const handlePuzzleMouseEnter = () => {
    setIsPopupPuzzleVisible(true);
  };

  const handlePuzzleMouseLeave = () => {
    setIsPopupPuzzleVisible(false);
  };

  return (
    <div className={styles.sectionTop}>
      <p className={cn(styles.sectionText, styles.textPosition)}>{position}</p>
      <p className={cn(styles.sectionText, styles.textUser)}>{userName}</p>
      <div className={styles.sectionIcons}>
        <img
          src={`${achievements.includes(1) ? "./puzzle_empty.svg" : "./puzzle.svg"}`}
          alt="puzzle"
          onMouseEnter={handleBallMouseEnter}
          onMouseLeave={handleBallMouseLeave}
        />
        <img
          src={`${achievements.includes(2) ? "./magic_ball_empty.svg" : "./magic_ball.svg"}`}
          alt="ball"
          onMouseEnter={handlePuzzleMouseEnter}
          onMouseLeave={handlePuzzleMouseLeave}
        />
        {isPopupBallVisible && <Ball />}
        {isPopupPuzzleVisible && <Puzzle />}
      </div>
      <p className={cn(styles.sectionText, styles.textTime)}>{formattedTime}</p>
    </div>
  );
}
