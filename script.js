/* Game variable */
const game = {
  start: false,
  score: 0,
  total: 0,
  timer: 0,
  skipped: [],
  type: 'game-hiragana'
};

/* Game functions */
function startGame() {
  const element = $('#time');
  const interval = setInterval(() => {
    if (!game.start) return clearInterval(interval);
    element.html(`${++game.timer} <i class="bi-clock"></i>`);
  }, 1000);

  $('#game').removeClass('d-none');
  $('#menu').slideUp(800);
  $('#answer').focus();
  game.start = true;
  game.type = $("input[name='game-type']:checked").prop('id');
  nextQuestion();
}

function stopGame() {
  $('#result').removeClass('d-none').animate({ top: '0' }, 'slow');
  $('#skipped-table').html('');
  $('#stats-answered').text(game.score);
  $('#stats-skipped').text(game.skipped.length);
  $('#stats-timer').text(game.timer + 's');
  $('#stats-average').text(((game.timer / game.total).toFixed(2) || 0) + 's');

  if (game.skipped.length) {
    game.skipped.forEach((word) => {
      $('#skipped-table').append(
        `<tr><th>${word}</th><th>${wanakana.toRomaji(word)}</th></tr>`
      );
    });
  } else if (game.score) {
    $('#skipped-table').append('<b>You answered every questions!</b>');
  } else {
    $('#skipped-table').append('<b>Wow, 0 answers!</b>');
  }

  game.start = false;
  game.score = 0;
  game.total = 0;
  game.timer = 0;
  game.skipped = [];
}

function restartGame() {
  $('#menu').slideDown(750);
  $('#result').animate({ top: '100vh' }, 800, () => {
    $('#result').addClass('d-none');
    $('#game').addClass('d-none');
    $('#start').focus();
  });
}

function nextQuestion() {
  const hiragana = cards[Math.floor(Math.random()*cards.length)];
  const katakana = wanakana.toKatakana(hiragana);
  let question = hiragana;

  if (game.type === 'game-mixed') {
    question = Math.random() < 0.5 ? hiragana : katakana;
  } else if (game.type === 'game-katakana') {
    question = katakana;
  }

  $('#question').text(question);
  $('#answer').val('');
  $('#score').html(
    '<i class="bi-check-circle"></i> ' +
    `${game.score}/${game.total}`
  );
  game.total++;
}

/* Game settings */
$('#game-font').change(() => {
  $('.game-font-change').css('font-family', $('#game-font').val());
});

$('.game-theme').click((evt) => {
  if ($(evt.target).hasClass('active')) return;

  $('.game-theme').removeClass('active');
  $(evt.target).addClass('active');
  $('body, #menu, #result').toggleClass('bg-dark text-white');
  $('#answer').toggleClass('text-white');
  $('kbd').toggleClass('bg-light text-black');
  $('.table').toggleClass('table-hover text-white');
  $('.btn').toggleClass('btn-outline-dark btn-outline-light');
});

/* Buttons event listener */
$('#start').click(startGame);
$('#stop').click(stopGame);
$('#restart').click(restartGame);

/* Answer input handling */
$('#answer').keyup(() => {
  const question = $('#question').text().trim();
  const romaji = wanakana.toRomaji(question);
  const answer = $('#answer').val();

  if (answer.indexOf(' ') > -1) {
    game.skipped.push(question);
    return nextQuestion();
  }

  if (romaji !== answer) return;

  game.score++;
  nextQuestion();
});

$('#answer').keydown((e) => {
  if (e.key === 'Tab') stopGame();
});
