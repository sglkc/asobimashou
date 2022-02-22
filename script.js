/* Game initialization */
const DEFAULT = {
  total: 0,
  timer: 0,
  answered: 0,
  skipped: 0,
  type: 'game-hiragana',
  theme: 'light',
  font: 'inherit',
  dakuten: true,
  card: 'Random',
  kanji: false
};
const LOCAL = JSON.parse(localStorage.getItem('GAME')) || {};
const GAME = Object.assign({}, DEFAULT, LOCAL);
let started = false;

/* Apply saved game settings */
if (GAME.font !== DEFAULT.font) changeFont();
if (GAME.theme !== DEFAULT.theme) {
  $('.game-theme').toggleClass('active');
  toggleTheme();
}

$(`#${GAME.type}`).addClass('active');
$('#game-dakuten').toggleClass('active', GAME.dakuten);
$('#game-dakuten > span').toggleClass(
  'text-decoration-line-through', !GAME.dakuten
);

if (GAME.card !== DEFAULT.card) $('.game-card').toggleClass('active');

$('#game-kanji').toggleClass('active', GAME.kanji)
  .toggleClass('text-decoration-line-through', !GAME.kanji);

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
function nextQuestion() {
  const dakuten = [
    'ば','ぶ','び','べ','ぼ','が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ',
    'だ','ぢ','づ','で','ど','ぱ','ぴ','ぷ','ぺ','ぽ'
  ];
  let id = Math.floor(Math.random()*cards[GAME.card].length);

  if (!(GAME.dakuten)) {
    do {
      id = Math.floor(Math.random()*cards[GAME.card].length);
    } while (dakuten.some(e => cards[GAME.card][id].hiragana.includes(e)));
  }

  const card = cards[GAME.card][id];
  const hiragana = card.hiragana.constructor === Array
    ? card.hiragana[Math.floor(Math.random()*card.hiragana.length)]
    : card.hiragana;
  const katakana = wanakana.toKatakana(hiragana);
  let kanji = card.kanji;
  let question = hiragana;

  if (GAME.type === 'game-mixed') {
    const random = Math.random() < 0.5;
    question = random ? hiragana : wanakana.toKatakana(question);
    kanji = random ? kanji : wanakana.toKatakana(kanji);
  } else if (GAME.type === 'game-katakana') {
    question = katakana;
    kanji = wanakana.toKatakana(kanji);
  }

  $('#question').html(`${question}<rt>${GAME.kanji ? kanji : ''}</rt>`);
  $('#question-id').val(id);
  $('#answer').val('');
  $('#score').html(
    '<i class="bi-check-circle"></i> ' +
    `${GAME.answered}/${GAME.answered + GAME.skipped}`
  );
}

/* Game settings */
$('#option-wrapper button, #game-font').click(() => {
  setTimeout(() => {
    localStorage.setItem('GAME', JSON.stringify(GAME));
  }, 100);
});

$('#game-font').change(() => {
  GAME.font = $('#game-font').val();
  changeFont();
});

$('.game-theme').click((evt) => {
  if ($(evt.target).hasClass('active')) return;
  $('.game-theme').toggleClass('active');
  GAME.theme = $(evt.target).val();
  toggleTheme();
});

$('#game-kanji').click(() => {
  GAME.kanji = !GAME.kanji;
  $('#game-kanji').toggleClass('active', GAME.kanji)
    .toggleClass('text-decoration-line-through', !GAME.kanji);
});

$('.game-type').click((evt) => {
  if ($(evt.target).hasClass('active')) return;
  $('.game-type').removeClass('active');
  $(evt.target).addClass('active');
  GAME.type = $(evt.target).prop('id');
});

$('#game-dakuten').click(() => {
  $('#game-dakuten').toggleClass('active');
  $('#game-dakuten > span').toggleClass(
    'text-decoration-line-through'
  );
  GAME.dakuten = !GAME.dakuten;
});

$('.game-card').click((evt) => {
  if ($(evt.target).hasClass('active')) return;
  $('.game-card').toggleClass('active');
  GAME.card = $(evt.target).val();
});

/* Buttons event listener */
$('#option').click(() => {
  $('#option').toggleClass('active');
  $('#option-wrapper').toggleClass('collapsed p-3');
});

$('#start').click(() => {
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
  nextQuestion();
});

$('#review').click(() => {
  $('#result').removeClass('d-none').animate({ top: '0' }, 'slow');
});

$('#stop').click(() => {
  const average = (GAME.timer / (GAME.answered + GAME.skipped));

  $('#result').removeClass('d-none').animate({ top: '0' }, 'slow');
  $('#stats-answered').text(GAME.answered);
  $('#stats-skipped').text(GAME.skipped);
  $('#stats-timer').text(GAME.timer + 's');
  $('#stats-average').text(average.toFixed(2) + 's');
  $('#review').prop('disabled', false);
  $('#restart').focus();
  started = false;

  if (!GAME.answered && !GAME.skipped) {
    $('#review-wrapper').prepend('<b>Be serious.</b>');
  } else if (!GAME.answered && GAME.skipped) {
    $('#review-wrapper').prepend('<b>Practice more!</b>');
  }
});

$('#restart').click(() => {
  $('#menu').slideDown(750);
  $('#result').animate({ top: '100vh' }, 800, () => {
    $('#result').addClass('d-none');
    $('#game').addClass('d-none');
    $('#time').html('0 <i class="bi-clock"></i>');
    $('#score').html('<i class="bi-check-circle"></i> 0');
    $('#review-wrapper b').remove();
    $('#copy').html('<i class="bi-table"></i> Copy Table');
    $('#share').html('<i class="bi-share"></i> Share');
    $('#start').prop('disabled', false);
    $('#start').focus();
  });

  GAME.timer = DEFAULT.timer;
  GAME.answered = DEFAULT.answered;
  GAME.skipped = DEFAULT.skipped;
});

$('#copy').click(() => {
  const text = $('#review-table').text()
    .replaceAll('‎‎', '\n')
    .replaceAll('‎', ' ー ')
    .trim()
    || 'Why did I copy this?';
  const element = $(`<textarea>${text}</textarea>`).appendTo('#result')
    .select();
  document.execCommand('copy');
  element.remove();
  $('#copy').html('<i class="bi-table"></i> Copied!');
});

$('#share').click(() => {
  const average = (GAME.timer / (GAME.answered + GAME.skipped));
  const type = $('.game-type.active').text().trim();
  const text = 'Asobimashou! 遊びましょう！\n' +
    `${location.href}\n` +
    `Card: ${GAME.card} | Type: ${type} | Dakuten: ${GAME.dakuten}\n` +
    `Answered: ${GAME.answered} | Skipped: ${GAME.skipped}\n` +
    `Time: ${GAME.timer}s | Average: ${average.toFixed(2)}s`;
  const element = $(`<textarea>${text}</textarea>`).appendTo('#result')
    .select();
  document.execCommand('copy');
  $(element).remove();
  $('#share').html('<i class="bi-share"></i> Copied!');
});

/* Answer input handling */
$('#answer').keyup(() => {
  const id = $('#question-id').val();
  const card = cards[GAME.card][id];
  const jisho = 'https://jisho.org/word/' + card.kanji;
  const means = card.meaning.split(', ')[0].trim();
  const meaning = means.match(/\(((?!\)).)*$/) ? means + ')' : means;
  const question = $('#question')[0].childNodes[0].nodeValue.trim();
  const romaji = wanakana.toRomaji(question);
  const q = wanakana.toHiragana(question);
  const answer = $('#answer').val();
  const a = wanakana.toHiragana(answer);

  if (answer.indexOf(' ') > -1) {
    $('#review-table').append(
      `<tr><th><i class="d-none">❌（${card.kanji}）</i>`+
      `<a href="${jisho}" target="_blank">${question}</a>‎</th>` +
      `<td class="text-danger">${romaji}‎</td><td>${meaning}‎‎</td></tr>`
    );
    GAME.skipped++;
    return nextQuestion();
  }

  if (q !== a) return;

  $('#review-table').append(
    `<tr><th><i class="d-none">（${card.kanji}）</i>`+
    `<a href="${jisho}" target="_blank">${question}</a>‎</th>` +
    `<td>${romaji}‎</td><td>${meaning}‎‎</td></tr>`
  );
  GAME.answered++;
  nextQuestion();
});

$('#answer').keydown((e) => {
  if (e.key === 'Tab') $('#stop').click();
});
