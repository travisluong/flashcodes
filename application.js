var fc = {
  decksDiv: $('#decks'),
  cardsDiv: $('#cards'),
  cardsControlsDiv: $('#cards-control'),
  decks: [],
  currentDeck: null
};

fc.Card = function(front, back) {
  this.front = front;
  this.back = back;
}

fc.Card.prototype.render = function() {
  var cardFragment = $('<div class="card">');
  var front = $('<div class="front">').append(this.front);
  var back = $('<div class="back">').append(this.back);
  cardFragment.append(front).append(back);

  return cardFragment;      
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

  this.size = function() {
    return cards.length;
  }

  this.renderCards = function() {
    var cardsFragment = $('<div class="cards">');
    cards.forEach(function(card) {
      cardsFragment.append(card.render());
    });
    return cardsFragment;
  }
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

fc.loadDeck = function(deck) {
  fc.cardsDiv.empty();
  fc.currentDeck = deck;
  if (fc.currentDeck.size() === 0) {
    fc.currentDeck.fetchCards(function() {
      var cardsFragment = fc.currentDeck.renderCards();
      fc.cardsDiv.append(cardsFragment);
    });
  } else {
    var cardsFragment = fc.currentDeck.renderCards();
    fc.cardsDiv.append(cardsFragment);
  }
}

fc.init = function() {
  fc.Deck.fetch(function(deckArray) {
    fc.decks = deckArray;
    var decksFragment = fc.Deck.render(deckArray);
    fc.Deck.bind(decksFragment);
    fc.decksDiv.append(decksFragment);
  });
}

fc.init();
