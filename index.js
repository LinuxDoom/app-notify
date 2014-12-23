var sms = require('./lib/sms');
var email = require('./lib/email');
var _ = require('lodash');
var async = require('async');
var q = require('q');

var cfg = {};

function respondWithError(err, method){
  if ( typeof method === 'function' ) {
    return method(err);
  }

  return method.reject(err);
}

function respondWithSuccess(data, method){
  if ( typeof method === 'function' ){
    return method(null, data);
  }

  return method.resolve(data);
}

function send(opts, callback){
  opts = _.extend(cfg, opts);

  var method = !callback ? q.defer() : callback;

  async.parallel([
    //sms
    function(cb){
      sms.send(opts)
        .then(function(data){
          cb(null, data);
        })
        .catch(function(err){
          cb(err);
        });
    },
    //email
    function(cb){
      email.send(opts)
        .then(function(data){
          cb(null, data);
        })
        .catch(function(err){
          cb(err);
        });
    }
  ], function(err, data){
    if ( err ) {
      return respondWithError(err, method);
    }

    return respondWithSuccess(data, method);
  });

  if ( method.promise ) {
    return method.promise;
  }
}

exports.cfg = cfg;
exports.sms = sms;
exports.email = email;
exports.send = send;
