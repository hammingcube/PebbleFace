/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */
/* global setInterval */
var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

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
    
    var receipts = Settings.data('receipts');

    var existing = receipts.reduce(function(map, r) {
      map[r.id] = r;
      return map;
    }, {});
    
    data.receipts.forEach(function(r) {
      if (!existing[r.id]) {
        receipts.push(r);
      }
    });
    
    Settings.data('receipts', receipts);
    if (cb) cb(null);
  },
  function(data) {
    if (cb) cb(data);
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
  var receipts = Settings.data('receipts');
  return receipts[receipts.length - 1];
}

function start() {
  getReceipts(function() {
    var receipts = Settings.data('receipts') || [];
    if (receipts.length) {
      showReceipt(lastReceipt());
    } else {
      showNothingYet();
    }
  });
}

function nextCard () {
  var receipts = Settings.data('receipts');
  receipts.pop();
  Settings.data('receipts', receipts);
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
setInterval(getReceipts, 2000);

