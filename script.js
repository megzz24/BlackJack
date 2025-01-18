const balance = document.getElementById("balance");
const totalBet = document.querySelector(".total-bet");
const dealButton = document.getElementById("deal-button");
const gamePage = document.getElementById("game-page");
const playBet = document.getElementById("play-bet");
const dealerCards = document.getElementById("dealer-cards");
const playerCards = document.getElementById("player-cards");
const playerScore = document.getElementById("player-score");
const dealerScore = document.getElementById("dealer-score");
const cashOutButton = document.getElementById("cash-out-button");
const playPage = document.getElementById("play-page");

let bankBalance = 1000;
let bet = 0;
let betsPlaced = [];
let dealerHand = [];
let playerHand = [];

const deck = [
    "C2.png","C3.png","C4.png","C5.png","C6.png","C7.png","C8.png","C9.png","C10.png","CA.png","CJ.png","CK.png","CQ.png",
    "D2.png","D3.png","D4.png","D5.png","D6.png","D7.png","D8.png","D9.png","D10.png","DA.png","DJ.png","DK.png","DQ.png",
    "H2.png","H3.png","H4.png","H5.png","H6.png","H7.png","H8.png","H9.png","H10.png","HA.png","HJ.png","HK.png","HQ.png",
    "S2.png","S3.png","S4.png","S5.png","S6.png","S7.png","S8.png","S9.png","S10.png","SA.png","SJ.png","SK.png","SQ.png"
];
const shuffledDeck = shuffle(deck);

document.getElementById("play-button").addEventListener("click", () => {
    gamePage.classList.remove("hidden");
    gamePage.style.display = "flex";

    document.getElementById("start-page").classList.add("hidden");

    const header = document.getElementById("header");
    header.classList.remove("hidden");
    header.style.display = "flex";

    dealButton.style.visibility="hidden";
    document.getElementById("rules-button").style.visibility="hidden";
});

document.addEventListener("DOMContentLoaded", () => {
    balance.textContent = `$${bankBalance}`;
    totalBet.textContent = "$0";

    const chipsContainer = document.getElementById("chips-container");
    const chipValues = [1, 5, 25, 50, 100, 500, 1000];

    chipValues.forEach(value => {
        const chip = document.createElement("button");
        chip.className = "chip";
        chip.setAttribute("data-value", value);
        chip.textContent = value;

        chip.addEventListener("click", () => {
            bankBalance -= value;
            bet += value;
            betsPlaced.push(value);

            balance.textContent = `$${bankBalance}`;
            totalBet.textContent = `$${bet}`;

            updateVisibility();
            animateChip(chip);
        });

        chipsContainer.appendChild(chip);
    });
});

function updateVisibility() {
    if (bet > 0) {
        dealButton.style.visibility = "visible";
    } else {
        dealButton.style.visibility = "hidden";
    }

    const chips = document.querySelectorAll(".chip");
    chips.forEach(chip => {
        const chipValue = parseInt(chip.getAttribute("data-value"), 10);
        if (chipValue > bankBalance) {
            chip.style.display = "none";
        } else {
            chip.style.display = "flex";
        }
    });
}

function animateChip(chip) {
    const chipRect = chip.getBoundingClientRect();
    const totalBetRect = totalBet.getBoundingClientRect();

    const deltaX = totalBetRect.left - chipRect.left;
    const deltaY = totalBetRect.top - chipRect.top;

    const chipClone = chip.cloneNode(true);
    chipClone.style.position = "absolute";
    chipClone.style.top = `${chipRect.top}px`;
    chipClone.style.left = `${chipRect.left}px`;
    chipClone.style.width = `${chipRect.width}px`;
    chipClone.style.height = `${chipRect.height}px`;
    chipClone.style.zIndex = "1000";

    document.body.appendChild(chipClone);

    chipClone.animate(
        [
            { transform: "translate(0, 0)" },
            { transform: `translate(${deltaX}px, ${deltaY}px)` }
        ],
        {
            duration: 400,
            easing: "ease-in-out"
        }
    ).onfinish = () => {
        chipClone.remove();
    };
}

document.getElementById("all-in-button").addEventListener("click", () => {
    if (bankBalance > 0) {
        betsPlaced.push(bankBalance);
        bet += bankBalance;
        totalBet.textContent = `$${bet}`;

        bankBalance = 0;
        balance.textContent = "$0";

        updateVisibility();
    }
});

document.getElementById("undo-button").addEventListener("click", () => {
    if (betsPlaced.length > 0) {
        const prevBet = betsPlaced.pop();
        bet -= prevBet;
        bankBalance += prevBet;

        balance.textContent = `$${bankBalance}`;
        totalBet.textContent = `$${bet}`;
        updateVisibility();
    }
});

document.getElementById("clear-bet-button").addEventListener("click", () => {
    if (bet > 0) {
        bankBalance += bet;
        bet = 0;

        balance.textContent = `$${bankBalance}`;
        totalBet.textContent = `$${bet}`;
        updateVisibility();
    }
});

dealButton.addEventListener("click", () => {
    gamePage.style.display = "none";
    cashOutButton.style.visibility = "hidden";
    playPage.style.display = "flex";
    playBet.textContent=`$${bet}`;
    dealInitialCards();
});

function getRandomCard(deck) {
    const randomIndex = Math.floor(Math.random() * deck.length);
    return deck[randomIndex];
}

function animateCardToSide(cardImage, targetSide) {
    return new Promise((resolve) => {
        document.body.style.overflow = "hidden";

        const card = document.createElement("img");
        card.src = `images/${cardImage}`;
        card.className = "card";

        card.style.position = "absolute";
        card.style.top = "10px";
        card.style.right = "10px";
        card.style.zIndex = "1000";

        document.body.appendChild(card);

        const targetRect = targetSide.getBoundingClientRect();
        const deltaX = targetRect.left + targetSide.children.length * 90 - card.getBoundingClientRect().left;
        const deltaY = targetRect.top - card.getBoundingClientRect().top;

        card.animate(
            [
                { transform: "translate(0, 0)", opacity: 1 },
                { transform: `translate(${deltaX}px, ${deltaY}px)`, opacity: 1 }
            ],
            {
                duration: 500,
                easing: "ease-in-out"
            }
        ).onfinish = () => {
            card.style.position = "static";
            card.style.transform = "none";
            targetSide.appendChild(card);
            document.body.style.overflow = "";

            resolve();
        };
    });
}

async function dealInitialCards() {
    const cardBack = "back_light.png";
    const card1 = getRandomCard(shuffledDeck);
    dealerHand.push(card1);
    await animateCardToSide(cardBack, dealerCards);

    const card2 = getRandomCard(shuffledDeck);
    playerHand.push(card2);
    await animateCardToSide(card2, playerCards);
    playerScore.textContent = calculateHandScore(playerHand);

    const card3 = getRandomCard(shuffledDeck);
    dealerHand.push(card3);
    await animateCardToSide(card3, dealerCards);
    dealerScore.textContent = getCardValue(card3);

    const card4 = getRandomCard(shuffledDeck);
    playerHand.push(card4);
    await animateCardToSide(card4, playerCards);
    playerScore.textContent = calculateHandScore(playerHand);

    const playerBlackjack = checkBlackjack(playerHand);
    const dealerBlackjack = checkBlackjack(dealerHand);

    if (playerBlackjack || dealerBlackjack) {
        flipCard(dealerCards.children[0], card1);

        hitButton.visibility = "hidden";
        standButton.disabled = "hidden";

        await delay(2000);

        if (playerBlackjack && dealerBlackjack) {
            message = "Blackjack! It's a tie!";
        } else if (playerBlackjack) {
            message = "Blackjack! Player wins!";
            bankBalance += bet * 2.5;
            playBet.textContent = `$${bet * 2.5}`;
        } else if (dealerBlackjack) {
            message = "Blackjack! Dealer wins!";
        }

        setTimeout(() => {
            balance.textContent = `$${bankBalance}`;
            showResultPopup(message);
        }, 3000);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}

function getCardValue(card) {
    const rank = card.slice(1, card.length - 4);

    if (rank === "A") {
        return 11;
    } else if (rank === "K" || rank === "Q" || rank === "J" || rank === "10") {
        return 10;
    } else {
        return parseInt(rank, 10);
    }
}

function calculateHandScore(hand) {
    let score = 0;
    let aceCount = 0;

    hand.forEach(card => {
        const cardValue = getCardValue(card);
        score += cardValue;
        if (cardValue === 11) {
            aceCount++;
        }
    });

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

function dealCard(hand, side, score) {
    return new Promise((resolve) => {
        const card = getRandomCard(shuffledDeck);
        hand.push(card);

        animateCardToSide(card, side).then(() => {
            score.textContent = calculateHandScore(hand);
            resolve();
        });
    });
}

const hitButton = document.getElementById("hit-button");
hitButton.addEventListener("click", () => {
    dealCard(playerHand, playerCards, playerScore);
    if (calculateHandScore(playerHand) > 21) {
        determineWinner();
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const standButton = document.getElementById("stand-button");
standButton.addEventListener("click", async () => {
    flipCard(dealerCards.children[0], dealerHand[0]);
    hitButton.style.visibility = "hidden";
    standButton.style.visibility = "hidden";

    await delay(2000);

    while (calculateHandScore(dealerHand) < 17) {
        await dealCard(dealerHand, dealerCards, dealerScore);
    }

    determineWinner();
});

function determineWinner() {
    hitButton.style.visibility = "hidden";
    standButton.style.visibility = "hidden";

    const playerScoreValue = calculateHandScore(playerHand);
    const dealerScoreValue = calculateHandScore(dealerHand);

    if (playerScoreValue > 21) {
        message = "Player busts! Dealer wins!";
        playBet.textContent = "$0";
    } else if (dealerScoreValue > 21) {
        message = "Dealer busts! Player wins!";
        bankBalance += bet * 2;
        playBet.textContent = `$${bet * 2}`;
    } else if (playerScoreValue > dealerScoreValue) {
        message = "Player wins!";
        bankBalance += bet * 2;
        playBet.textContent = `$${bet * 2}`;
    } else if (playerScoreValue < dealerScoreValue) {
        message = "Dealer wins!";
        playBet.textContent = "$0";
    } else {
        message = "It's a tie!";
        bankBalance += bet;
    }

    setTimeout(() => {
        balance.textContent = `$${bankBalance}`;
        showResultPopup(message);
    }, 3000);
}

function checkBlackjack(hand) {
    firstCardValue = getCardValue(hand[0]);
    secondCardValue = getCardValue(hand[1]);

    return firstCardValue + secondCardValue === 21;
}

function showResultPopup(message) {
    modal = document.createElement("div");
    modal.id = "result-modal";
    document.body.appendChild(modal);

    modal.textContent = message;

    modal.style.display = "flex";
    playPage.classList.add("blur");

    setTimeout(() => {
        modal.style.display = "none";
        playPage.classList.remove("blur");
        resetGame();
    }, 3000);
}

function flipCard(cardElement, actualCard) {
    cardElement.src = `images/${actualCard}`;
    dealerScore.textContent = calculateHandScore(dealerHand);
}

function resetGame() {
    bet = 0;
    betsPlaced = [];
    dealerHand = [];
    playerHand = [];

    balance.textContent = `$${bankBalance}`;
    totalBet.textContent = "$0";

    playerCards.innerHTML = "";
    dealerCards.innerHTML = "";

    playerScore.textContent = '0';
    dealerScore.textContent = '0';

    hitButton.style.visibility = "visible";
    standButton.style.visibility = "visible";
    dealButton.style.visibility = "hidden";

    updateVisibility();
    cashOutButton.style.visibility = "visible";

    playPage.style.display = "none";
    gamePage.style.display = "flex";

    hitButton.disabled = false;
    standButton.disabled = false;
}
