/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var receipts = [];

function getReceipts(cb) {
  
  ajax({
    url: 'http://businessornot.herokuapp.com/api/v1/receipts',
    type: 'json'
  },
  function(data) {
    Settings.data('receipts', data.contents);
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

function showReceipt(receipt) {
  
  var card = new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: receipt.name,
    body: 'Press any button.'
  });
  
  card.show();

  card.on('click', 'up', function(e) {
    postAnswer(receipt.id, true, function(err, result) {
      if (err) return console.log('error');
      
      receipts.pop();
      if (receipts.length)
        showReceipt();
      else
        showNothingYet();
      
    });
  });
}

function showNothingYet() {
  var card = new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: 'Nothing to show :(',
    body: 'Press any button.'
  });
  
  card.show();

  card.on('click', 'select', function(e) {
    start();
  });
}

start();
