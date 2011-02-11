/*
 * search.js: chainable search functions for Loggly
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var qs = require('querystring'),
    interns = require('./interns');

//
// function Search (query, client, callback) 
//   Chainable search object for Loggly API
//
var Search = exports.Search = function (query, client, callback) {
  this.query = query;
  this.client = client;
  this.baseUrl = 'search?';
  
  // If we're passed a callback, run immediately.
  if (callback) {
    this.callback = callback;
    this.run();
  }
};

//
// function meta (meta)
//   Sets the appropriate metadata for this search query:
//   e.g. ip, inputname
//
Search.prototype.meta = function (meta) {
  this._meta = meta;
  return this;
};

//
// function context (context)
//   Sets the appropriate context for this search query:
//   e.g. rows, start, from, until, order, format, fields
//
Search.prototype.context = function (context) {
  this._context = context;
  return this;
};

//
// function run (callback) 
//   
//
Search.prototype.run = function (callback) {
  // Trim the search query 
  this.query.trim();
  
  // Update the callback for this instance if it's passed
  this.callback = callback || this.callback;
  if (!this.callback) {
    throw new Error('Cannot run search without a callback function.');
  }
  
  // If meta was passed, update the search query appropriately
  if (this._meta) {
    this.query += ' ' + qs.unescape(qs.stringify(this._meta, ' ', ':'));
  }

  // Set the context for the query string
  this._context = this._context || {};
  this._context.q = this.query;

  var self = this, searchOptions = {
    uri: this.client.logglyUrl(this.baseUrl + qs.stringify(this._context)),
    auth: this.client.config.auth
  };
  
  interns.loggly(searchOptions, this.callback, function (res, body) {
    self.callback(null, JSON.parse(body));
  });
  
  return this;
};