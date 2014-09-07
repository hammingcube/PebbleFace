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
  title: 'BIZ or NOT',
  icon: 'images/menu_icon.png',
  subtitle: 'No receipts',
  body: 'Press any button to reload'
});

NothingYet.on('click', 'select', start);
NothingYet.on('click', 'up', start);
NothingYet.on('click', 'down', start);
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
    title: 'BIZ or NOT',
    icon: 'images/menu_icon.png',
    subtitle: receipt.name,
    body: 'Press any button.'
  });
  
  card.show();

  card.on('click', 'up', function(e) {
    card.title("BIZ");
    postAnswer(receipt.id, true, function(err, result) {
      if (err) return console.log('error');

      card.hide();
      nextCard();
      
    });
  });
  card.on('click', 'down', function(e) {
    card.title("NOT");
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
