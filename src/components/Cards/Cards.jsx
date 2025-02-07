import { shuffle } from "lodash";
import { useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { useEasyMode } from "../../hooks/useEasyMode";
import { DEFAULT_MODE_LIVES, EASY_MODE_LIVES } from "../../const";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}

function closeUnmatchedCards(setCards, openCardsWithoutPair) {
  setTimeout(() => {
    setCards(currentCards =>
      currentCards.map(card =>
        openCardsWithoutPair.some(openCard => openCard.id === card.id) ? { ...card, open: false } : card,
      ),
    );
  }, 1000);
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const { isEasyMode } = useEasyMode();
  const [lives, setLives] = useState(isEasyMode ? EASY_MODE_LIVES : DEFAULT_MODE_LIVES);
  const [perkUses, setPerkUses] = useState(0);
  const [counterPerk, setCounterPerk] = useState(2);
  const [achievements, setAchievements] = useState(isEasyMode ? [1] : []);

  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);
  // Текущий статус игры
  const [status, setStatus] = useState(STATUS_PREVIEW);

  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
  }
  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
  }
  function resetGame() {
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setLives(isEasyMode ? EASY_MODE_LIVES : DEFAULT_MODE_LIVES);
    setPerkUses(0);
    setCounterPerk(2);
  }

  function alohomora() {
    if (perkUses >= 2) return;
    setPerkUses(prev => prev + 1);
    setCounterPerk(prev => prev - 1);

    if (perkUses === 0) {
      setAchievements([...achievements, 2]);
    }

    const closedCards = cards.filter(card => !card.open);
    if (closedCards.length < 2) return;

    const randomCardIndex = Math.floor(Math.random() * closedCards.length);
    const randomCard = closedCards[randomCardIndex];

    const matchingCard = cards.find(
      card => card.suit === randomCard.suit && card.rank === randomCard.rank && card.id !== randomCard.id,
    );

    if (matchingCard) {
      setCards(currentCards =>
        currentCards.map(card =>
          card.id === randomCard.id || card.id === matchingCard.id ? { ...card, open: true } : card,
        ),
      );
    }
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        return true;
      }

      return false;
    });

    const playerLost = openCardsWithoutPair.length >= 2;

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    if (playerLost) {
      if (!isEasyMode) {
        finishGame(STATUS_LOST);
        return;
      } else {
        // Функция закрытия карточек
        setLives(prevState => prevState - 1);
        closeUnmatchedCards(setCards, openCardsWithoutPair);
      }
    }
    // ... игра продолжается
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate]);

  useEffect(() => {
    if (lives === 0) {
      finishGame(STATUS_LOST);
    }
  }, [lives]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>
        {isEasyMode && (
          <span className={styles.attemptСounter}>
            <svg width="30" height="26" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.53 3.27849C12.6964 1.22519 10.2335 0.000124665 8.08277 0.000124664C4.40879 0.000124663 0.183699 2.06893 -8.96305e-08 8.27535C0.170897 14.3992 6.86026 19.5464 13.2644 24.474C13.7441 24.8432 14.2223 25.2111 14.696 25.5781C14.696 25.5781 14.696 25.5781 14.696 25.578C14.6961 25.5781 14.6961 25.5781 14.6961 25.5781C14.9305 25.3965 15.1655 25.2147 15.4009 25.0326C21.9912 19.9345 28.8473 14.6309 29.0247 8.27535C28.841 2.06893 24.2485 0.00012207 20.5745 0.00012207C18.4238 0.00012207 16.169 1.22519 14.53 3.27849Z"
                fill="#FF4545"
              />
            </svg>
            {lives}
          </span>
        )}
        {status === STATUS_IN_PROGRESS ? (
          <>
            <div className={styles.perks}>
              <img className={styles.cardPerk} src="../card_perk.svg" alt="eye_perk" onClick={alohomora} />
              <div className={styles.counterPerk}>{counterPerk}</div>
            </div>
            <Button onClick={resetGame}>Начать заново</Button>
          </>
        ) : null}
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            pairsCount={pairsCount}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
            achievements={achievements}
          />
        </div>
      ) : null}
    </div>
  );
}
