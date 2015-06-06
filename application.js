// flashcodes.
// created by travis luong.

var fc = {

  // config
  // --------------------------------------------------------------------------------
  
  // dom elements
  decksDiv: $('#decks'),
  cardsDiv: $('#cards'),
  cardsControlsDiv: $('#cards-controls'),
  gameInfoDiv: $('#game-info'),
  userOptionsDiv: $('#user-options'),
  shuffleButton: $('#shuffle'),
  backFirstButton: $('#back-first'),
  rightColDiv: $('#right-col'),
  gameAreaDiv: $('#game-area'),
  reportCardDiv: $('#report-card'),

  // constants
  LEFT_ARROW_KEY_CODE: 37,
  DOWN_ARROW_KEY_CODE: 40,
  RIGHT_ARROW_KEY_CODE: 39,
  
  // app state
  collections: [],
  decks: [],
  currentCards: [],
  currentDeck: null,
  currentCard: null,
  currentCardIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  gameStarted: false,
  userOptions: {
    shuffle: false,
    backFirst: false
  },

  // models
  // --------------------------------------------------------------------------------
  Card: function(args) {
    this.front = args.front;
    this.back = args.back;
    this.isCorrect = null;
  },

  Deck: function(args) {
    this.name = args.name;
    this.url = args.url;
  },

  // events
  // --------------------------------------------------------------------------------
  bindCards: function() {
    fc.cardsDiv.on('click', '.card', function() {
      fc.toggleCard();
    });
  },

  bindCardsControls: function() {
    fc.cardsControlsDiv.on('click', '#wrong', fc.incrementWrong);
    fc.cardsControlsDiv.on('click', '#correct', fc.incrementCorrect);
  },

  bindDeck: function() {
    fc.decksDiv.on('click', 'button', function(e) {
      fc.loadDeck(e);
    });    
  },

  bindKeyPress: function() {
    $(document).on('keydown', function(e) {
      fc.handleKeyPress(e);
    });
  },

  bindWindowResize: function() {
    $(window).resize(fc.handleWindowResize);
  },

  bindUserOptions: function() {
    fc.shuffleButton.on('click', fc.toggleShuffle);
    fc.backFirstButton.on('click', fc.toggleBackFirst);
  },

  bindInit: function() {
    fc.bindCards();
    fc.bindDeck();
    fc.bindCardsControls();
    fc.bindKeyPress();
    fc.bindUserOptions();
    fc.bindWindowResize();
  },

  // actions
  // --------------------------------------------------------------------------------

  handleKeyPress: function(e) {
    if (!fc.gameStarted) {
      return;
    }
    if (e.keyCode === fc.DOWN_ARROW_KEY_CODE) {
      e.preventDefault();
      fc.toggleCard();
    } else if (e.keyCode === fc.RIGHT_ARROW_KEY_CODE ) {
      fc.incrementCorrect();
    } else if (e.keyCode === fc.LEFT_ARROW_KEY_CODE) {
      fc.incrementWrong();
    }      
  },

  handleWindowResize: function() {
    fc.cardsDiv.css('height', '');
  },

  incrementCorrect: function() {
    fc.currentCardIndex += 1;
    fc.currentCard.isCorrect = true;
    fc.correctCount += 1;
    fc.updateGameInfo();
    fc.nextCardLogic();
  },

  incrementWrong: function() {
    fc.currentCardIndex += 1;
    fc.currentCard.isCorrect = false;
    fc.wrongCount += 1;
    fc.updateGameInfo(fc.current);
    fc.nextCardLogic();  
  },

  loadDeck: function(e) {
    var url = $(e.target).data('url');
    fc.loadDeckByUrl(url);
  },

  toggleShuffle: function() {
    fc.userOptions.shuffle = !fc.userOptions.shuffle;
    fc.shuffleButton.toggleClass('btnOn', fc.userOptions.shuffle);
  },

  toggleBackFirst: function() {
    fc.userOptions.backFirst = !fc.userOptions.backFirst;
    fc.backFirstButton.toggleClass('btnOn', fc.userOptions.backFirst);
  },

  toggleCard: function() {
    fc.cardsDiv.find('.front').slideToggle(100);
    fc.cardsDiv.find('.back').slideToggle(100);
  },  

  // helpers
  // --------------------------------------------------------------------------------

  fetchDecks: function(fn) {
    $.getJSON("decks.json", function(data) {
      var decksArray = data.map(function(obj) {
        return new fc.Deck(obj);
      });
      fn(decksArray);
    });
  },

  fetchCards: function(url, fn) {
    $.getJSON(url, function(data) {
      var cards = data.map(function(obj) {
        return new fc.Card(obj);
      });
      fn(cards);
    });
  },

  fetchCollections: function(fn) {
    $.getJSON("decks.json", function(data) {
      fn(data);
    });
  },

  loadDeckByName: function(name) {
    var deck = fc.decks.filter(function(d) {
      return d.name === name;
    })[0];
    fc.cardsDiv.empty();
    fc.currentDeck = deck;
    fc.fetchCards(deck, function(cards) {
      if (fc.userOptions.shuffle) {
        cards = fc.shuffle(cards);
      }
      fc.currentCards = cards;
      fc.loadCard(fc.currentCards[0]);
      fc.currentCardIndex = 0;
      fc.correctCount = 0;
      fc.wrongCount = 0;
      fc.updateGameInfo();
      fc.reportCardDiv.empty();
      fc.gameAreaDiv.show();
      fc.gameStarted = true;
    });
  },

  loadDeckByUrl: function(url) {
    fc.cardsDiv.empty();
    fc.fetchCards(url, function(cards) {
      if (fc.userOptions.shuffle) {
        cards = fc.shuffle(cards);
      }
      fc.currentCards = cards;
      fc.loadCard(fc.currentCards[0]);
      fc.currentCardIndex = 0;
      fc.correctCount = 0;
      fc.wrongCount = 0;
      fc.updateGameInfo();
      fc.reportCardDiv.empty();
      fc.gameAreaDiv.show();
      fc.gameStarted = true;
    });
  },

  updateGameInfo: function() {
    fc.gameInfoDiv.empty();
    var gameInfoFragment = fc.renderGameInfo(fc.currentCardIndex, 
        fc.currentCards.length, 
        fc.correctCount, 
        fc.wrongCount);
    fc.gameInfoDiv.append(gameInfoFragment);
  },

  loadCollections: function(collectionsArray) {
    var html = fc.renderCollections(collectionsArray);
    fc.decksDiv.append(html);
  },

  loadCard: function(card) {
    fc.currentCard = card;
    var cardFragment = fc.renderCard(card, fc.userOptions.backFirst);
    fc.cardsDiv.append(cardFragment);
    fc.gameAreaDiv.css('height', fc.gameAreaDiv.height());
    fc.cardsDiv.css('height', fc.cardsDiv.height());
    var cardDiv = fc.cardsDiv.find('.card').last();
    fc.cardsControlsDiv.css('height', fc.cardsControlsDiv.height());
    cardDiv.css({'left': '-101%', 
      'position': 'absolute', 
      'height': cardDiv.height(), 
      'width': cardDiv.width()
    });
    cardDiv.animate({
      left: "0"
    }, 200, function() {
      fc.gameAreaDiv.css('height', '');
      cardDiv.css({'left': '', 'position': '', 'height': '', 'width': ''});
      fc.cardsControlsDiv.css('height', '');
    });
  },

  loadDecks: function(deckArray) {
    fc.decks = deckArray;
    var decksFragment = fc.renderDecks(deckArray);
    fc.decksDiv.append(decksFragment);
  },

  nextCardLogic: function() {
    if (fc.currentCardIndex < fc.currentCards.length) {
      fc.showNextCard();
    } else {
      fc.gameStarted = false;
      var reportCard = fc.renderReportCard(fc.currentCards, fc.correctCount);
      fc.cardsDiv.empty();
      fc.gameAreaDiv.hide();
      fc.reportCardDiv.append(reportCard);
    }
  },

  showNextCard: function() {
    var cardDiv = fc.cardsDiv.find('.card');
    cardDiv.css({'position': 'absolute', 'width': cardDiv.width()}).animate({
      left: "101%"
    }, 200, function() {
      $(this).remove();
    });
    fc.loadCard(fc.currentCards[fc.currentCardIndex]);
  },

  shuffle: function(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },

  // views
  // --------------------------------------------------------------------------------
  renderCard: function(card, backFirst) {
    if (!backFirst) {
      var html = '<div class="card">' + 
        '<div class="front">' + card.front + '</div>' +
        '<div class="back hidden">' + card.back + '</div>' +
        '</div>';
    } else {
      var html = '<div class="card">' + 
        '<div class="front hidden">' + card.front + '</div>' +
        '<div class="back">' + card.back + '</div>' +
        '</div>';
    }
    return html;
  },

  renderCollections: function(collectionsArray) {
    var html = '';
    collectionsArray.forEach(function(c) {
      html += '<h3>' + c.title + '</h3>';
      html += '<ul id="collections" class="clearfix">';
      c.decks.forEach(function(d) {
        html += fc.renderDeck(d);
      });
      html += '</ul>';
    });
    return html;
  },

  renderDeck: function(deck) {
    var html = '<li class="deck clearfix">' +
      '<button data-name="'+ deck.name + '" data-url="' + deck.url + '">' + deck.name + '</button>' +
      "</li>";
    return html;  
  },

  renderGameInfo: function(cardIndex, cardsLength, correctCount, wrongCount) {
    var html = '<span class="orange">Progress: ' + cardIndex + '/' + cardsLength + '</span> ' +
      '<span class="wrong">Wrong: ' + wrongCount + '</span> ' +
      '<span class="correct">Correct: ' + correctCount + '</span>';
    return html;
  },

  renderCardRow: function(card) {
    var classAttr = card.isCorrect ? 'correct' : 'wrong';
    var html = '<tr class="report-card-card">' +
      '<td>' + card.front + '</td>' +
      '<td>' + card.back + '</td>' + 
      '<td class="' + classAttr + '">' + card.isCorrect + '</td>' +
      '</tr>';
    return html;
  },

  renderReportCard: function(cards, correctCount) {
    var percentage = Math.round(correctCount / cards.length * 100) + "%";
    var html = '<div>' +
      '<table class="report-card">' + 
      "<thead><tr><th>Front</th><th>Back</th><th>Correct?</th></tr></thead>" +
      '<tbody>';
    cards.forEach(function(card) {
      html += fc.renderCardRow(card);
    });
    html += '</tbody></table>' +
      "<p class='percentage'>Percentage: " + percentage + " </p>";
    return html;
  },

  // init
  // --------------------------------------------------------------------------------
  init: function() {
    fc.fetchCollections(function(data){
      fc.collections = data;
      fc.loadCollections(fc.collections);
      fc.loadDeckByUrl("decks/tutorial.json")
      fc.bindInit();
      fc.gameStarted = true;
    });
  }
}

fc.init();
