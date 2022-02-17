/* Game initialization */
const DEFAULT = {
  score: 0,
  total: 0,
  timer: 0,
  skipped: [],
  type: 'game-hiragana',
  theme: 'light',
  font: 'inherit',
  dakuten: true
};
const LOCAL = JSON.parse(localStorage.getItem('GAME')) || {};
const GAME = Object.assign(LOCAL, Object.create(DEFAULT));
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
  $('#result').removeClass('d-none').animate({ top: '0' }, 'slow');
  $('#skipped-table').html('');
  $('#stats-answered').text(GAME.score);
  $('#stats-skipped').text(GAME.skipped.length);
  $('#stats-timer').text(GAME.timer + 's');
  $('#stats-average').text(((GAME.timer / GAME.total).toFixed(2) || 0) + 's');
  $('#restart').focus();

  if (GAME.skipped.length) {
    GAME.skipped.forEach((word) => {
      $('#skipped-table').append(
        `<tr><th>${word}</th><th>${wanakana.toRomaji(word)}</th></tr>`
      );
    });
  } else if (GAME.score) {
    $('#skipped-table').append('<b>You answered every questions!</b>');
  } else {
    $('#skipped-table').append('<b>Wow, 0 answers!</b>');
  }

  started = false;
}

function restartGame() {
  $('#menu').slideDown(750);
  $('#result').animate({ top: '100vh' }, 800, () => {
    $('#result').addClass('d-none');
    $('#game').addClass('d-none');
    $('#time').html('0 <i class="bi-clock"></i>');
    $('#score').html('<i class="bi-check-circle"></i> 0');
    $('#start').prop('disabled', false);
    $('#start').focus();
  });

  GAME.score = DEFAULT.score;
  GAME.total = DEFAULT.total;
  GAME.timer = DEFAULT.timer;
  GAME.skipped = DEFAULT.skipped.slice();
}

function nextQuestion() {
  const dakuten = [
    'ば','ぶ','び','べ','ぼ','が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ',
    'だ','ぢ','づ','で','ど','ぱ','ぴ','ぷ','ぺ','ぽ'
  ];
  let card = cards[Math.floor(Math.random()*cards.length)];

  if (!(GAME.dakuten)) {
    do {
      card = cards[Math.floor(Math.random()*cards.length)];
    } while (dakuten.some(e => card.hiragana.includes(e)))
  }

  const hiragana = card.hiragana;
  const katakana = wanakana.toKatakana(hiragana);
  let question = hiragana;

  if (GAME.type === 'game-mixed') {
    question = Math.random() < 0.5 ? hiragana : katakana;
  } else if (GAME.type === 'game-katakana') {
    question = katakana;
  }

  $('#question').text(question);
  $('#answer').val('');
  $('#score').html(
    '<i class="bi-check-circle"></i> ' +
    `${GAME.score}/${GAME.total}`
  );
  GAME.total++;
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

$('#game-dakuten').click((evt) => {
  GAME.dakuten = $(evt.target).prop('checked');
});

/* Buttons event listener */
$('#start').click(startGame);
$('#stop').click(stopGame);
$('#restart').click(restartGame);

/* Answer input handling */
$('#answer').keyup(() => {
  const question = $('#question').text().trim();
  const q = wanakana.toHiragana(question);
  const answer = $('#answer').val();
  const a = wanakana.toHiragana(answer);

  if (answer.indexOf(' ') > -1) {
    GAME.skipped.push(question);
    return nextQuestion();
  }

  if (q !== a) return;

  GAME.score++;
  nextQuestion();
});

$('#answer').keydown((e) => {
  if (e.key === 'Tab') stopGame();
});
