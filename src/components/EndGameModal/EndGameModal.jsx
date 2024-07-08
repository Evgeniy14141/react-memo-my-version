import styles from "./EndGameModal.module.css";

import { Button } from "../Button/Button";

import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { useState } from "react";
import { useLeaders } from "../../hooks/useLeaders";

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick }) {
  let title = isWon ? "Вы победили!" : "Вы проиграли!";

  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;

  const imgAlt = isWon ? "celebration emodji" : "dead emodji";

  const [newLeader, setNewLeader] = useState({
    name: "",
    time: gameDurationSeconds,
  });
  const { leaders } = useLeaders();

  console.log(leaders);

  if (gameDurationMinutes * 60 + gameDurationSeconds < leaders[2].time && isWon) {
    title = "Вы попали на лидерборд!";
  }

  let isLeader = gameDurationMinutes * 60 + gameDurationSeconds < leaders[2].time && isWon;

  function handleInputChange(event) {
    const { name, value } = event.target;
    setNewLeader({
      ...newLeader,
      [name]: value,
    });
  }

  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>
      {isLeader && (
        <div className={styles.leaderboardInfo}>
          <input
            className={styles.nameInput}
            type="text"
            name="name"
            value={newLeader.name}
            placeholder="Пользователь"
            onChange={handleInputChange}
          />
          <Button>Сохранить результат</Button>
        </div>
      )}
      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>

      <Button onClick={onClick}>Начать сначала</Button>
    </div>
  );
}
