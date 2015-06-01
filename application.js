var FlashCodes = function() {

  var self = this,
      decksDiv = $('#decks'),
      decks = [];

  var Card = function(front, back) {
    this.front = front;
    this.back = back;
  }

  var Deck = function(name, url) {
    this.name = name;
    this.url = url;

    var cards = [];
  }

  var bindDecks = function() {
    $('#decks').on('click', 'button', function(e) {
      var name = $(this).data('name');
      var deck = decks.find(function(element, index, array) {
        if (element.name === name) {
          return true;
        } else {
          return false;
        }
      });
      console.log(deck);
    });
  }

  var renderDecks = function() {
    decks.forEach(function(deck) {
      var deckFragment = $('<div class="deck">');
      deckFragment.append("<h2>" + deck.name + "</h2>");
      deckFragment.append("<button data-name='"+ deck.name +"'>Play</button>")
      decksDiv.append(deckFragment);
    });

    bindDecks();
  }

  var fetchDecks = function() {
    $.getJSON("decks.json", function(data) {

      data.forEach(function(deck) {
        var deckObj = new Deck(deck.name, deck.url);
        decks.push(deckObj)
      });

      renderDecks();
    });    
  }

  this.init = function() {
    fetchDecks();
  }
};


var fc = new FlashCodes();
fc.init();