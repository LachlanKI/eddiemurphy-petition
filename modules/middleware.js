const db = require('./sigDatabase.js');

function checkCookie(req, res, next) {
      !req.session.user ? (req.url == '/' || req.url == '/login' ? next() : res.redirect('/'))
    : !req.session.user.info ? (req.url == '/' || req.url == '/login' || req.url == '/more-info' ? next() : res.redirect('/more-info'))
    : !req.session.user.signed ? (req.url == '/signature' || req.url == '/logout' || req.url == '/login' ? next() : res.redirect('/signature'))
    : req.session.user.signed ? (req.url == '/thanks' || req.url == '/cool-people' || req.url == `/cool-people/${req.params.city}` || req.url == '/update-profile' || req.url == '/logout' ? next() : res.redirect('/thanks'))
    : req.url == '/more-info' && req.session.user.info ? res.redirect('/logout') : next();
}

module.exports.checkCookie = checkCookie;

function killSession(req, res, next) {
    req.session = null;
    next();
}

module.exports.killSession = killSession;
