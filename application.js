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

  // app state
  decks: [],
  currentCards: [],
  currentDeck: null,
  currentCard: null,
  currentCardIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  gameStarted: false,

  // constants
  LEFT_ARROW_KEY_CODE: 37,
  DOWN_ARROW_KEY_CODE: 40,
  RIGHT_ARROW_KEY_CODE: 39,

  // models: encapsulate data
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

  // events: user action --> triggers event --> calls controller action
  // --------------------------------------------------------------------------------
  bindCards: function() {
    fc.cardsDiv.on('click', '.card', function() {
      fc.toggleCard();
    });
  },

  bindDeck: function() {
    fc.decksDiv.on('click', 'button', function(e) {
      var name = $(this).data('name');
      fc.loadDeck(name);
    });    
  },

  bindCardsControls: function() {
    fc.cardsControlsDiv.on('click', '#wrong', fc.wrongCallback);
    fc.cardsControlsDiv.on('click', '#correct', fc.correctCallback);
  },

  bindKeyPress: function() {
    $(document).on('keypress', function(e) {
      if (e.keyCode === fc.DOWN_ARROW_KEY_CODE) {
        e.preventDefault();
        fc.toggleCard();
      } else if (fc.gameStarted && e.keyCode === fc.RIGHT_ARROW_KEY_CODE ) {
        fc.correctCallback();
      } else if (fc.gameStarted && e.keyCode === fc.LEFT_ARROW_KEY_CODE) {
        fc.wrongCallback();
      }      
    });
  },

  bindInit: function() {
    fc.bindCards();
    fc.bindDeck();
    fc.bindCardsControls();
    fc.bindKeyPress();
  },

  // views: input data --> render function --> output html
  // --------------------------------------------------------------------------------
  renderCard: function(card) {
    var cardFragment = $('<div class="card">');
    var front = $('<div class="front">').append(card.front);
    var back = $('<div class="back">').append(card.back);
    cardFragment.append(front).append(back);
    return cardFragment;      
  },

  renderDeck: function(deck) {
    var deckFragment = $('<div class="deck">');
    deckFragment.append("<h2>" + deck.name + "</h2>");
    deckFragment.append("<button data-name='"+ deck.name +"'>Play</button>")
    return deckFragment      
  },

  renderDecks: function(deckArray) {
    var decksFragment = $('<div class="decks">');
    deckArray.forEach(function(deck) {
      var deckFragment = fc.renderDeck(deck)
      decksFragment.append(deckFragment);
    });
    return decksFragment;
  },

  renderCardsControls: function() {
    var cardsControlsFragment = $('<div><button id="wrong">wrong</button><button id="correct">correct</button></div>');
    return cardsControlsFragment;
  },

  renderGameInfo: function(currentCardIndex, currentCardsLength, correctCount, wrongCount) {
    var cardsProgress = "<p>Progress: " + currentCardIndex + "/" + currentCardsLength + "</p>";
    cardsProgress += "<p>Correct: " + correctCount + "</p>";
    cardsProgress += "<p>Wrong: " + wrongCount + "</p>";
    return cardsProgress;
  },

  renderReportCard: function(cards, correctCount) {
    var div = $('<div>');
    var reportCardFragment = $('<table class="report-card">');
    var reportCardTHead = "<thead><tr><th>Front</th><th>Back</th><th>Correct?</th></tr></thead>";
    var reportCardTbody = $('<tbody>');
    var reportCardPercentage = $("<p class='percentage'>Percentage: </p>").append(Math.round(correctCount / cards.length * 100) + "%");

    cards.forEach(function(card) {
      var cardFragment = $('<tr class="report-card-card">');
      var correctClass = card.isCorrect ? "correct" : "wrong";
      cardFragment.append("<td>" + card.front + "</td><td>" + card.back + "</td><td class='" + correctClass + "'>" + card.isCorrect + "</td>");
      reportCardTbody.append(cardFragment);
    });

    reportCardFragment.append(reportCardTHead).append(reportCardTbody);
    div.append(reportCardFragment).append(reportCardPercentage);
    return div;
  },

  // controllers: controller actions --> update models, views, and app state
  // --------------------------------------------------------------------------------
  toggleCard: function() {
    fc.cardsDiv.find('.front').slideToggle();
    fc.cardsDiv.find('.back').slideToggle();
  },

  fetchDecks: function(fn) {
    $.getJSON("decks.json", function(data) {
      var decksArray = data.map(function(obj) {
        return new fc.Deck(obj);
      });
      fn(decksArray);
    });
  },

  fetchCards: function(deck, fn) {
    $.getJSON(deck.url, function(data) {
      var cards = data.map(function(obj) {
        return new fc.Card(obj);
      });
      fc.currentCards = cards;
      fn();
    });
  },

  loadDeckCallback: function() {
    fc.loadCard(fc.currentCards[0]);
    fc.updateCardsControls();
    fc.resetGameInfo();
    fc.updateGameInfo();
    fc.gameStarted = true;
  },

  loadDeck: function(name) {
    var deck = fc.decks.find(function(element, index, array) {
      if (element.name === name) {
        return true;
      } else {
        return false;
      }
    });
    fc.cardsDiv.empty();
    fc.currentDeck = deck;
    fc.fetchCards(deck, function() {
      fc.loadDeckCallback();
    });
  },

  updateCardsControls: function() {
    fc.cardsControlsDiv.empty();
    var cardsControlsFragment = fc.renderCardsControls();
    fc.cardsControlsDiv.append(cardsControlsFragment);
  },

  updateGameInfo: function() {
    fc.gameInfoDiv.empty();
    var gameInfoFragment = fc.renderGameInfo(fc.currentCardIndex, fc.currentCards.length, fc.correctCount, fc.wrongCount);
    fc.gameInfoDiv.append(gameInfoFragment);
  },

  loadCard: function(card) {
    fc.currentCard = card;
    var cardFragment = fc.renderCard(card);
    fc.cardsDiv.append(cardFragment);
  },

  loadDecks: function(deckArray) {
    fc.decks = deckArray;
    var decksFragment = fc.renderDecks(deckArray);
    fc.decksDiv.append(decksFragment);
  },

  wrongCallback: function() {
    fc.currentCardIndex += 1;
    fc.currentCard.isCorrect = false;
    fc.wrongCount += 1;
    fc.updateGameInfo(fc.current);
    fc.nextCardLogic();  
  },

  correctCallback: function() {
    fc.currentCardIndex += 1;
    fc.currentCard.isCorrect = true;
    fc.correctCount += 1;
    fc.updateGameInfo();
    fc.nextCardLogic();
  },

  nextCardLogic: function() {
    if (fc.currentCardIndex < fc.currentCards.length) {
      fc.showNextCard();
    } else {
      fc.gameStarted = false;
      var reportCard = fc.renderReportCard(fc.currentCards, fc.correctCount);
      fc.cardsDiv.empty();
      fc.cardsControlsDiv.empty();
      fc.cardsDiv.append(reportCard);
    }
  },

  showNextCard: function() {
    fc.cardsDiv.find('.card').remove();
    fc.loadCard(fc.currentCards[fc.currentCardIndex]);
  },

  resetGameInfo: function() {
    fc.currentCardIndex = 0;
    fc.correctCount = 0;
    fc.wrongCount = 0;
  },

  // init: starting point of app
  // --------------------------------------------------------------------------------
  init: function() {
    fc.fetchDecks(function(deckArray) {
      fc.loadDecks(deckArray);
      fc.loadDeck(fc.decks[0].name);
      fc.bindInit();
      fc.gameStarted = true;
    });
  }
}

fc.init();
