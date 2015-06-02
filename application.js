// flashcodes.
// created by travis luong.

// configuration. top level variables.
// --------------------------------------------------------------------------------
var fc = {
  decksDiv: $('#decks'),
  cardsDiv: $('#cards'),
  cardsControlsDiv: $('#cards-controls'),
  gameInfoDiv: $('#game-info'),
  decks: [],
  currentDeck: null,
  currentCard: null,
  currentCardIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  LEFT_ARROW_KEY_CODE: 37,
  DOWN_ARROW_KEY_CODE: 40,
  RIGHT_ARROW_KEY_CODE: 39,
  gameStarted: false
};

// models. code for data models. card and deck.
// --------------------------------------------------------------------------------
fc.Card = function(front, back) {
  this.front = front;
  this.back = back;
  this.isCorrect = null;
}

fc.Deck = function(name, url) {
  this.name = name;
  this.url = url;

  var cards = [];

  this.fetchCards = function(fn) {
    $.getJSON(this.url, function(data) {
      data.forEach(function(card) {
        var cardObj = new fc.Card(card.front, card.back);
        cards.push(cardObj);
      });
      fn();
    });
  }

  this.getCard = function(index) {
    return cards[index];
  }

  this.getCards = function() {
    return cards;
  }

  this.size = function() {
    return cards.length;
  }
}

// events. code that handles events. use event delegation for future elements.
// --------------------------------------------------------------------------------
fc.Card.bind = function() {
  fc.cardsDiv.on('click', '.card', function() {
    fc.toggleCard();
  });
}

fc.Deck.bind = function(decksFragment) {
  decksFragment.on('click', 'button', function(e) {
    var name = $(this).data('name');
    var deck = fc.decks.find(function(element, index, array) {
      if (element.name === name) {
        return true;
      } else {
        return false;
      }
    });
    fc.loadDeck(deck);
  });    
}

fc.bindCardsControls = function(cardsControlsFragment) {
  cardsControlsFragment.find('#wrong').on('click', function() {
    fc.wrongCallback();
  });
  cardsControlsFragment.find('#correct').on('click', function() {
    fc.correctCallback();
  });
  // $(document).off('keypress');
  $(document).on('keypress', function(e) {
    if (fc.gameStarted && e.keyCode === fc.LEFT_ARROW_KEY_CODE) {
      fc.wrongCallback();
    }
  });
  $(document).on('keypress', function(e) {
    if (fc.gameStarted && e.keyCode === fc.RIGHT_ARROW_KEY_CODE ) {
      fc.correctCallback();
    }
  });  
}

fc.bindKeyDown = function() {
  $(document).on('keypress', function(e) {
    if (e.keyCode === fc.DOWN_ARROW_KEY_CODE) {
      e.preventDefault();
      fc.toggleCard();
    }
  });
}

// rendering. code that generates html.
// --------------------------------------------------------------------------------
fc.Card.prototype.render = function() {
  var cardFragment = $('<div class="card">');
  var front = $('<div class="front">').append(this.front);
  var back = $('<div class="back">').append(this.back);
  cardFragment.append(front).append(back);

  return cardFragment;      
}

fc.Deck.prototype.render = function() {
  var deckFragment = $('<div class="deck">');
  deckFragment.append("<h2>" + this.name + "</h2>");
  deckFragment.append("<button data-name='"+ this.name +"'>Play</button>")
  return deckFragment      
}

fc.Deck.render = function(deckArray) {
  var decksFragment = $('<div class="decks">');
  deckArray.forEach(function(deck) {
    decksFragment.append(deck.render());
  });
  return decksFragment;
}

fc.renderCardsControls = function() {
  var cardsControlsFragment = $('<div><button id="wrong">wrong</button><button id="correct">correct</button></div>');
  return cardsControlsFragment;
}

fc.renderGameInfo = function() {
  var cardsProgress = "<p>Progress: " + fc.currentCardIndex + "/" + fc.currentDeck.size() + "</p>";
  cardsProgress += "<p>Correct: " + fc.correctCount + "</p>";
  cardsProgress += "<p>Wrong: " + fc.wrongCount + "</p>";
  return cardsProgress;
}

fc.renderReportCard = function() {
  var div = $('<div>');
  var reportCardFragment = $('<table class="report-card">');
  var reportCardTHead = "<thead><tr><th>Front</th><th>Back</th><th>Correct?</th></tr></thead>";
  var reportCardTbody = $('<tbody>');
  var reportCardPercentage = $("<p class='percentage'>Percentage: </p>").append(Math.round(fc.correctCount / fc.currentDeck.size() * 100) + "%");

  fc.currentDeck.getCards().forEach(function(card) {
    var cardFragment = $('<tr class="report-card-card">');
    var correctClass = card.isCorrect ? "correct" : "wrong";
    cardFragment.append("<td>" + card.front + "</td><td>" + card.back + "</td><td class='" + correctClass + "'>" + card.isCorrect + "</td>");
    reportCardTbody.append(cardFragment);
  });

  reportCardFragment.append(reportCardTHead).append(reportCardTbody);
  div.append(reportCardFragment).append(reportCardPercentage);
  return div;
}

// actions. code that changes the state of the app. updates models and views.
// --------------------------------------------------------------------------------
fc.toggleCard = function() {
  fc.cardsDiv.find('.front').slideToggle();
  fc.cardsDiv.find('.back').slideToggle();
}

fc.Deck.fetch = function(fn) {
  $.getJSON("decks.json", function(data) {
    var deckArray = [];
    data.forEach(function(deck) {
      var deckObj = new fc.Deck(deck.name, deck.url);
      deckArray.push(deckObj)
    });
    fn(deckArray);
  });    
}

fc.loadDeckCallback = function() {
  fc.loadCard(fc.currentDeck.getCards()[0]);
  fc.updateCardsControls();
  fc.resetGameInfo();
  fc.updateGameInfo();
  fc.gameStarted = true;
}

fc.loadDeck = function(deck) {
  fc.cardsDiv.empty();
  fc.currentDeck = deck;
  if (fc.currentDeck.size() === 0) {
    fc.currentDeck.fetchCards(function() {
      fc.loadDeckCallback();
    });
  } else {
    fc.loadDeckCallback();
  }
}

fc.updateCardsControls = function() {
  fc.cardsControlsDiv.empty();
  var cardsControlsFragment = fc.renderCardsControls();
  fc.bindCardsControls(cardsControlsFragment);
  fc.cardsControlsDiv.append(cardsControlsFragment);
}

fc.updateGameInfo = function() {
  fc.gameInfoDiv.empty();
  var gameInfoFragment = fc.renderGameInfo();
  fc.gameInfoDiv.append(gameInfoFragment);
}

fc.loadCard = function(card) {
  fc.currentCard = card;
  var cardFragment = card.render();
  fc.cardsDiv.append(cardFragment);
}

fc.wrongCallback = function() {
  fc.currentCardIndex += 1;
  fc.currentCard.isCorrect = false;
  fc.wrongCount += 1;
  fc.updateGameInfo();
  fc.nextCardLogic();  
}

fc.correctCallback = function() {
  fc.currentCardIndex += 1;
  fc.currentCard.isCorrect = true;
  fc.correctCount += 1;
  fc.updateGameInfo();
  fc.nextCardLogic();
}

fc.nextCardLogic = function() {
  if (fc.currentCardIndex < fc.currentDeck.size()) {
    fc.showNextCard();
  } else {
    fc.gameStarted = false;
    var reportCard = fc.renderReportCard();
    fc.cardsDiv.empty();
    fc.cardsControlsDiv.empty();
    fc.cardsDiv.append(reportCard);
  }
}

fc.showNextCard = function() {
  fc.cardsDiv.find('.card').remove();
  fc.loadCard(fc.currentDeck.getCard(fc.currentCardIndex));
}

fc.resetGameInfo = function() {
  fc.currentCardIndex = 0;
  fc.correctCount = 0;
  fc.wrongCount = 0;
}

// init. the entry point for the app.
// --------------------------------------------------------------------------------
fc.init = function() {
  fc.Deck.fetch(function(deckArray) {
    fc.decks = deckArray;
    var decksFragment = fc.Deck.render(deckArray);
    fc.Deck.bind(decksFragment);
    fc.decksDiv.append(decksFragment);
    fc.loadDeck(fc.decks[0]);
    fc.bindKeyDown();
    fc.gameStarted = true;
    fc.Card.bind();
  });
}

fc.init();
