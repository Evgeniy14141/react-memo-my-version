import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import { LeaderboardList } from "../LeaderboardList/LeaderboardList";
import styles from "./Leaderboard.module.css";
import cn from "classnames";
import { useLeaders } from "../../hooks/useLeaders";

export function Leaderboard() {
  const { leaders } = useLeaders();

  return (
    <div className={styles.leaderboard}>
      <header className={styles.header}>
        <p className={styles.headerTitle}>Лидерборд</p>
        <Link to={"/"}>
          <Button>Начать игру</Button>
        </Link>
      </header>
      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <div>
            <p className={cn(styles.sectionText, styles.textPosition)}>Позиция</p>
            <p className={cn(styles.sectionText, styles.textUser)}>Пользователь</p>
          </div>
          <p className={cn(styles.sectionText, styles.textTime)}>Время</p>
        </div>
        {leaders.map((leader, index) => (
          <LeaderboardList position={`# ${index + 1}`} userName={leader.name} time={leader.time} key={leader.id} />
        ))}
      </section>
    </div>
  );
}
