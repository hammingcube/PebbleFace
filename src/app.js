/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var receipts = [];

var NothingYet = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Nothing to show :(',
  body: 'Press any button.'
});

NothingYet.on('click', 'select', function(e) {
  start();
});
NothingYet.show();

function getReceipts(cb) {
  
  ajax({
    url: 'http://businessornot.herokuapp.com/api/v1/receipts',
    type: 'json'
  },
  function(data) {
    console.log(data, JSON.stringify(data));
    Settings.data('receipts', data.receipts);
    cb(null);
  },
  function(data) {
    cb(data);
  });
  
}

function postAnswer(id, answer, cb) {
  
  ajax({
    url: 'http://businessornot.herokuapp.com/api/v1/receipts/'+id,
    type: 'json',
    method: 'post',
    data: {answer: answer}
  },
  function(data) {
    cb(null);
  },
  function(data) {
    cb(data);
  });
  
}

function lastReceipt () {
  return receipts[receipts.length - 1];
}

function start() {
  getReceipts(function() {
    receipts = Settings.data('receipts') || [];
    if (receipts.length) {
      showReceipt(lastReceipt());
    } else {
      showNothingYet();
    }
  });
}

function nextCard () {
  receipts.pop();
  if (receipts.length) {
    showReceipt(lastReceipt());
  } else {
    showNothingYet();
  }
}

function showReceipt(receipt) {
  var card = new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: receipt.name,
    body: 'Press any button.'
  });
  
  card.show();

  card.on('click', 'up', function(e) {
    card.body("Pressed");
    postAnswer(receipt.id, true, function(err, result) {
      if (err) return console.log('error');

      card.hide();
      nextCard();
      
    });
  });
  card.on('click', 'down', function(e) {
    postAnswer(receipt.id, false, function(err, result) {
      if (err) return console.log('error');
      
      card.hide();
      nextCard();
      
    });
  });
}

function showNothingYet() {
  NothingYet.show();
}

start();
