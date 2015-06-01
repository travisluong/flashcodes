var FlashCodes = function() {

  var self = this,
      decksDiv = $('#decks'),
      cardsDiv = $('#cards'),
      decks = [],
      currentDeck = null;

  var Card = function(front, back) {
    this.front = front;
    this.back = back;

    this.render = function() {
      var cardFragment = $('<div class="card">');
      cardFragment.append(this.front + " " + this.back);
      return cardFragment;      
    }
  }

  var Deck = function(name, url) {
    this.name = name;
    this.url = url;

    var cards = [];

    this.fetchCards = function(fn) {
      $.getJSON(this.url, function(data) {
        data.forEach(function(card) {
          var cardObj = new Card(card.front, card.back);
          cards.push(cardObj);
        });
        fn();
      });
    }

    this.getCards = function() {
      return cards;
    }

    this.size = function() {
      return cards.length;
    }

    this.render = function() {
      var deckFragment = $('<div class="deck">');
      deckFragment.append("<h2>" + this.name + "</h2>");
      deckFragment.append("<button data-name='"+ this.name +"'>Play</button>")
      return deckFragment      
    }

    this.renderCards = function() {
      var cardsFragment = $('<div class="cards">');
      cards.forEach(function(card) {
        cardsFragment.append(card.render());
      });
      return cardsFragment;
    }
  }

  var loadDeck = function(deck) {
    cardsDiv.empty();
    currentDeck = deck;
    if (currentDeck.size() === 0) {
      currentDeck.fetchCards(function() {
        var cardsFragment = currentDeck.renderCards();
        cardsDiv.append(cardsFragment);
      });
    } else {
      var cardsFragment = currentDeck.renderCards();
      cardsDiv.append(cardsFragment);
    }
  }

  var bindDecks = function(decksFragment) {
    decksFragment.on('click', 'button', function(e) {
      var name = $(this).data('name');
      var deck = decks.find(function(element, index, array) {
        if (element.name === name) {
          return true;
        } else {
          return false;
        }
      });
      loadDeck(deck);
    });
  }

  var renderDecks = function(deckArray) {
    var decksFragment = $('<div class="decks">');
    deckArray.forEach(function(deck) {
      decksFragment.append(deck.render());
    });
    return decksFragment;
  }

  var fetchDecks = function() {
    $.getJSON("decks.json", function(data) {

      data.forEach(function(deck) {
        var deckObj = new Deck(deck.name, deck.url);
        decks.push(deckObj)
      });

      var decksFragment = renderDecks(decks);
      bindDecks(decksFragment);
      decksDiv.append(decksFragment);
    });    
  }

  this.init = function() {
    fetchDecks();
  }
};


var fc = new FlashCodes();
fc.init();