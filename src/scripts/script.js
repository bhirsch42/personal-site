function addGagMessage(side, content) {
  var el = $(`
    <div class="gag-wrapper gag-wrapper-${side}">
      <div class="gag gag-${side}">
        <div class="message">${content}</div>
      </div>
    </div>
  `);
  $('.message-gag').prepend(el);
  var h = el.find('.message').height() + 60;
  el.css({height: h});
}

function runGag(frames) {
  var total = 0
  frames.forEach((frame) => {
    total += frame[0];
    if (frame[1] == 'left' || frame[1] == 'right') {
      setTimeout(() => {
        if ($('.message-gag').find('.gag-wrapper').length > 5) {
          $($('.message-gag').find('.gag-wrapper')[5]).remove()
        }
        addGagMessage(frame[1], frame[2]);
      }, total);
    }
    if (frame[1] == 'typeTitle') {
      setTimeout(() => {
        typeGagTitle(frame[2]);
      }, total);
    }
    if (frame[1] == 'backspaceTitle') {
      setTimeout(() => {
        backspaceGagTitle();
      }, total);
    }
    if (frame[1] == 'clearTitle') {
      setTimeout(() => {
        clearGagTitle();
      }, total)
    }
    if (frame[1] == 'blink') {
      setTimeout(() => {
        $('#gag-title').addClass('blink');
      }, total);
    }
    if (frame[1] == 'blinkOff') {
      setTimeout(() => {
        $('#gag-title').removeClass('blink');
      }, total);
    }
  });
}

function backspaceGagTitle() {
  var len = $('#gag-title').html().length
  var total = 0
  for (var i = 0; i <= len; i++) {
    total += 100
    setTimeout(() => {
      $('#gag-title').removeClass('blink').addClass('blink-stay');
      var $gagTitle = $('#gag-title');
      var newText = $gagTitle.html().slice(0,-1)
      $gagTitle.html(newText);
      if (newText.length == 0) {
        $('#gag-title').removeClass('blink-stay').addClass('blink');
      }
    }, total)
  }
}

function typeGagTitle(title) {
  var len = title.length
  var total = 0
  for (var i = 0; i <= len; i++) {
    total += 100
    setTimeout(() => {
      $('#gag-title').removeClass('blink').addClass('blink-stay');
      var $gagTitle = $('#gag-title');
      var newText = title.slice(0, $gagTitle.html().length + 1)
      $gagTitle.html(newText);
      if (newText == title) {
        $('#gag-title').removeClass('blink-stay').addClass('blink');
      }
    }, total)
  }
}

function clearGagTitle() {
  var $gagTitle = $('#gag-title');
  $gagTitle.css({'background-color': 'rgb(168,204,255)'});
  setTimeout(() => {
    $gagTitle.html('');
    $gagTitle.css({'background-color': 'white'});
  }, 300);
}

var frames = [
  [3000, 'left', 'Web Dev Rockstar? Really? Don\'t you think that\'s a little lame?'],
  [4000, 'right', "no it's cool"],
  [3000, 'left', 'Employers are going to see this.'],
  [1500, 'left', 'Be professional.'],
  [3300, 'right', "I'm professional!"],
  [1300, 'right', "I'm a very professional guy."],
  [3100, 'left', "Please just call yourself something reasonable."],
  [1700, 'left', "\"Rockstar\" sounds silly."],
  [4300, 'right', "..."],
  [2900, 'right', "...fine"],
  [2000, 'blink'],
  [2000, 'backspaceTitle'],
  [2300, 'right', "How's this?"],
  [1200, 'typeTitle', "Javascript Guru"],
  [3100, 'left', "Holy cow that's pretentious"],
  [3000, 'right', "you're veru judgemental"],
  [1000, 'right', "*very"],
  [3000, 'left', "That aside, can you even call your self a guru?"],
  [3000, 'left', "Have you written a book?"],
  [3000, 'right', "Do you have to write a book to call yourself a guru?"],
  [3000, 'right', "You know what I don't care"],
  [2000, 'right', "I have a better name"],
  [1800, 'backspaceTitle'],
  [1600, 'typeTitle', "Cowboy Coder"],
  [1600, 'left', "no"],
  [800, 'typeTitle', "Cowboy Coder YEEHAW"],
  [1800, 'left', "please no"],
  [1400, 'clearTitle'],
  [1600, 'typeTitle', "KING OF THE INTERNET"],
  [1800, 'left', "stop"],
  [1400, 'clearTitle'],
  [600, 'typeTitle', "ThE ChOsEn OnE"],
  [1800, 'left', "stop it"],
  [1400, 'clearTitle'],
  [600, 'typeTitle', "super FUN code man! :D :D :D"],
  [2600, 'left', "STOP"],
  [1800, 'right', "i really like that one"],
  [2600, 'left', "you can't leave it like that"],
  [1900, 'right', "it really shows off how fun I am"],
  [4600, 'left', "..."],
  [4400, 'right', "here--"],
  [1800, 'backspaceTitle'],
  [6000, 'typeTitle', "Web Developer"],
  [4200, 'left', "Thank you."],
  [3800, 'right', "You're welcome"],
  [1400, 'right', ";)"],
  [2000, 'blinkOff'],
]

runGag(frames)
