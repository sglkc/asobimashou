/* Game initialization */
const DEFAULT = {
  total: 0,
  timer: 0,
  answered: 0,
  skipped: 0,
  type: 'game-hiragana',
  theme: 'light',
  font: 'inherit',
  dakuten: true
};
const LOCAL = JSON.parse(localStorage.getItem('GAME')) || {};
const GAME = Object.assign({}, DEFAULT, LOCAL);
let started = false;
let cards;

$.getJSON('cards.json', (data) => {
  cards = data.cards;
  $('#start').prop('disabled', false);
  $('#start').html('<i class="bi-play-fill"></i> Start');
});

/* Apply saved game settings */
if (GAME.font !== DEFAULT.font) changeFont();
if (GAME.theme !== DEFAULT.theme) {
  $('.game-theme').removeClass('active');
  $('.game-theme[value=dark]').addClass('active');
  toggleTheme();
}

$(`#${GAME.type}`).prop('checked', true);
$('#game-dakuten').prop('checked', GAME.dakuten);
$('label[for="game-dakuten"] span').toggleClass(
  'text-decoration-line-through', !GAME.dakuten
);

/* Game setting functions */
function changeFont() {
  $('#game-font').val(GAME.font);
  $('.game-font-change').css('font-family', GAME.font);
}

function toggleTheme() {
  $('body, #menu, #result').toggleClass('bg-dark text-white');
  $('#answer').toggleClass('text-white');
  $('kbd').toggleClass('bg-light text-black');
  $('.table').toggleClass('table-hover text-white');
  $('.btn').toggleClass('btn-outline-dark btn-outline-light');
};

/* Game functions */
function startGame() {
  const element = $('#time');
  const interval = setInterval(() => {
    if (!started) return clearInterval(interval);
    element.html(`${++GAME.timer} <i class="bi-clock"></i>`);
  }, 1000);

  $('#review-table').html('');
  $('#start').prop('disabled', true);
  $('#game').removeClass('d-none');
  $('#menu').slideUp(500);
  $('#answer').focus();
  started = true;
  GAME.type = $("input[name='game-type']:checked").prop('id');
  localStorage.setItem('GAME', JSON.stringify(GAME));
  nextQuestion();
}

function stopGame() {
  const average = (GAME.timer / (GAME.answered + GAME.skipped));

  $('#result').removeClass('d-none').animate({ top: '0' }, 'slow');
  $('#stats-answered').text(GAME.answered);
  $('#stats-skipped').text(GAME.skipped);
  $('#stats-timer').text(GAME.timer + 's');
  $('#stats-average').text(average.toFixed(2) + 's');
  $('#restart').focus();
  started = false;

  if (!GAME.answered && !GAME.skipped) {
    $('#review-wrapper').prepend('<b>Be serious.</b>');
  } else if (!GAME.answered && GAME.skipped) {
    $('#review-wrapper').prepend('<b>Practice more!</b>');
  }
}

function restartGame() {
  $('#menu').slideDown(750);
  $('#result').animate({ top: '100vh' }, 800, () => {
    $('#result').addClass('d-none');
    $('#game').addClass('d-none');
    $('#time').html('0 <i class="bi-clock"></i>');
    $('#score').html('<i class="bi-check-circle"></i> 0');
    $('#review-wrapper b').remove();
    $('#copy').html('<i class="bi-share"></i> Share');
    $('#start').prop('disabled', false);
    $('#start').focus();
  });

  GAME.timer = DEFAULT.timer;
  GAME.answered = DEFAULT.answered;
  GAME.skipped = DEFAULT.skipped;
}

function nextQuestion() {
  const dakuten = [
    'ば','ぶ','び','べ','ぼ','が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ',
    'だ','ぢ','づ','で','ど','ぱ','ぴ','ぷ','ぺ','ぽ'
  ];
  let id = Math.floor(Math.random()*cards.length);

  if (!(GAME.dakuten)) {
    do {
      id = Math.floor(Math.random()*cards.length);
    } while (dakuten.some(e => cards[id].hiragana.includes(e)))
  }

  const card = cards[id];
  const hiragana = card.hiragana;
  const katakana = wanakana.toKatakana(hiragana);
  let question = hiragana;

  if (GAME.type === 'game-mixed') {
    question = Math.random() < 0.5 ? hiragana : katakana;
  } else if (GAME.type === 'game-katakana') {
    question = katakana;
  }

  $('#question').text(question);
  $('#question-id').val(id);
  $('#answer').val('');
  $('#score').html(
    '<i class="bi-check-circle"></i> ' +
    `${GAME.answered}/${GAME.answered + GAME.skipped}`
  );
}

/* Game settings */
$('#game-font').change(() => {
  GAME.font = $('#game-font').val();
  changeFont();
});

$('.game-theme').click((evt) => {
  if ($(evt.target).hasClass('active')) return;
  $('.game-theme').removeClass('active');
  $(evt.target).addClass('active');
  GAME.theme = $(evt.target).val();
  toggleTheme();
});

$('#game-dakuten').click(() => {
  GAME.dakuten = $('#game-dakuten').prop('checked');
  $('label[for="game-dakuten"] span').toggleClass(
    'text-decoration-line-through', !GAME.dakuten
  );
});

/* Buttons event listener */
$('#start').click(startGame);
$('#stop').click(stopGame);
$('#restart').click(restartGame);
$('#copy').click(() => {
  const average = (GAME.timer / (GAME.answered + GAME.skipped));
  const type = $(`label[for="${GAME.type}"]`).text().trim();
  const dakuten = GAME.dakuten ? 'with' : 'without';
  const text = 'Asobimashou! 遊びましょう！\n' +
    'https://asobimashou.netlify.app/\n' +
    `Game Type: ${type}, ${dakuten} dakuten\n` +
    `Answered: ${GAME.answered} | Skipped: ${GAME.skipped}\n` +
    `Time: ${GAME.timer}s | Average: ${average.toFixed(2)}s`;
  const element = $('<textarea></textarea>').appendTo('#result');
  $(element).html(text).select();
  document.execCommand('copy');
  $(element).remove();
  $('#copy').html('<i class="bi-share"></i> Copied to clipboard!');
});

/* Answer input handling */
$('#answer').keyup(() => {
  const id = $('#question-id').val();
  const card = cards[id];
  const jisho = 'https://jisho.org/word/' + card.kanji;
  const meaning = card.meaning.split(', ')[0];
  const question = $('#question').text().trim();
  const romaji = wanakana.toRomaji(question);
  const q = wanakana.toHiragana(question);
  const answer = $('#answer').val();
  const a = wanakana.toHiragana(answer);

  if (answer.indexOf(' ') > -1) {
    $('#review-table').append(
      `<tr><th><a href="${jisho}" target="_blank">${question}</a>` +
      `</th><td class="text-danger">${romaji}</td><td>${meaning}</td></tr>`
    );
    GAME.skipped++;
    return nextQuestion();
  }

  if (q !== a) return;

  $('#review-table').append(
    `<tr><th><a href="${jisho}" target="_blank">${question}</a>` +
    `</th><td>${romaji}</td><td>${meaning}</td></tr>`
  );
  GAME.answered++;
  nextQuestion();
});

$('#answer').keydown((e) => {
  if (e.key === 'Tab') stopGame();
});
