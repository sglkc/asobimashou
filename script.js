/* Game variable */
const game = {
  start: false,
  score: 0,
  total: 0,
  timer: 0,
  skipped: []
};

/* Game functions */
function startGame() {
  $('#menu').animate({ top: '-100vh' }, 'slow');
  $('#answer').focus();
  nextQuestion();
  startTimer();
}

function stopGame() {
  $('#result').animate({ top: '0' }, 'slow');
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

function nextQuestion() {
  let q = cards[Math.floor(Math.random()*cards.length)];

  $('#question').text(q);
  $('#answer').val('');
  $('#score').html(
    '<i class="bi-check-circle"></i> ' +
    `${game.score}/${game.total}`
  );
  game.total++;
}

function startTimer() {
  game.start = true;
  const element = $('#time');
  const interval = setInterval(() => {
    if (!game.start) return clearInterval(interval);
    element.html(`${++game.timer} <i class="bi-clock"></i>`);
  }, 1000);
}

/* Button event listeners */
$('#start').click(startGame);

$('#stop').click(stopGame);

$('#restart').click(() => {
  $('#menu').animate({ top: 0 }, 750);
  $('#result').animate({ top: '100vh' }, 800);
  $('#start').focus();
});

/* Answer input handling */
$('#answer').keyup(() => {
  const question = $('#question').text().trim();
  const answer = $('#answer').val();
  const kana = wanakana.toKana(answer);

  if (answer.indexOf(' ') > -1) {
    game.skipped.push(question);
    return nextQuestion();
  }

  if (kana !== question) return;

  game.score++;
  nextQuestion();
});

$('#answer').keydown((e) => {
  if (e.key === 'Tab') stopGame();
});
