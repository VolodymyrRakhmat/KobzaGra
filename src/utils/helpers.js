import words from './words.json';

export const getRandomWord = () => words[Math.floor(Math.random() * words.length)];

export const checkGuess = (guess, target) => {
  if (guess.length !== 5 || !words.includes(guess)) return null;
  return guess.split('').map((letter, index) => {
    if (letter === target[index]) return { letter, color: 'green' };
    if (target.includes(letter)) return { letter, color: 'yellow' };
    return { letter, color: 'gray' };
  });
};