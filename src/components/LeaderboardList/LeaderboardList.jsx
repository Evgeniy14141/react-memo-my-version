import styles from "./LeaderboardList.module.css";
import cn from "classnames";
import { format } from "date-fns";

function formatSeconds(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date;
}

export function LeaderboardList({ position, userName, time }) {
  const formattedTime = format(formatSeconds(time), "mm:ss");

  return (
    <div className={styles.sectionTop}>
      <div>
        <p className={cn(styles.sectionText, styles.textPosition)}>{position}</p>
        <p className={cn(styles.sectionText, styles.textUser)}>{userName}</p>
      </div>
      <p className={cn(styles.sectionText, styles.textTime)}>{formattedTime}</p>
    </div>
  );
}
