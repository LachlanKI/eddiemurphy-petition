const express = require('express');
const bodyParser = require('body-parser');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const db = require('./modules/sigDatabase.js');
const bcrypt = require('./modules/crypto.js');
const userDb = require('./modules/userDatabase.js');
const profile = require('./modules/profile.js');
const midWare = require('./modules/middleware.js');
const app = express();

////////////////////////////////// setup

const hbHelpers = hb.create({
    helpers: {
        myHelper: profile.myHelper
    }
});
app.engine('handlebars', hbHelpers.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(__dirname + '/public'));

////////////////////////////////// enable cookie session

app.use(cookieSession({
    secret: db.giveCookieHash(),
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(csrf());

////////////////////////////////// middleware

const checkCookie = midWare.checkCookie;
const killSession = midWare.killSession;

////////////////////////////////// routes / get

app.get('/update-profile', checkCookie, (req, res, next) => {
    profile.getUpdate(req.session.user.userId).then((results) => {
        res.render('edit-profile', {
            layout: 'main',
            user: results,
            csrfToken: req.csrfToken()
        });
    }).catch((err) => console.log(err));
});

app.get('/cool-people/:city', checkCookie, (req, res, next) => {
    profile.getByLocation(req.params.city).then((results) =>{
        if (!results.length) {
            req.session.user.city = req.params.city.replace(/<\/?[^>]+(>|$)/g, "");
            res.redirect('/cool-people');
        } else {
            res.render('location', {
                layout: 'main',
                city: results[0].city,
                coolpeople: results
            });
        }
    }).catch((err) => console.log(err));
});

app.get('/more-info', checkCookie, (req, res, next) => {
    if (req.session.user.info) {
        res.redirect('/signature');
    } else {
        res.render('profile', {
            layout: 'main',
            csrfToken: req.csrfToken()
        });
    }
});

app.get('/cool-people', checkCookie, (req, res, next) => {
    if (req.session.user.city) {
        userDb.getCoolPeople().then((results) => {
            res.render('coolpeople', {
                layout: 'main',
                coolpeople: results,
                oops: req.session.user.city
            });
            req.session.user.city = null;
        }).catch((err) => console.log(err));
    } else {
        userDb.getCoolPeople().then((results) => {
            res.render('coolpeople', {
                layout: 'main',
                coolpeople: results
            });
        }).catch((err) => console.log(err));
    }
});

app.get('/logout', checkCookie, killSession, (req, res, next) => {
    res.redirect('/');
});

app.get('/thanks', checkCookie, (req, res, next) => {
    db.getSig(req.session.user.userId).then((val) => {
        res.render('thanks', {
            layout: 'main',
            sig: val,
            name: req.session.user.firstname,
            csrfToken: req.csrfToken()
        });
    }).catch((err) => console.log(err));
});

app.get('/login', checkCookie, (req, res, next) => {
    res.render('login', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
});

app.get('/signature', checkCookie, (req, res, next) => {
    res.render('form', {
        layout: 'main',
        csrfToken: req.csrfToken()
    })
});

app.get('/', checkCookie, (req, res, next) => {
    res.render('register', {
        layout: 'main',
        csrfToken: req.csrfToken()
    });
});

app.get('*', (req, res, next) => {
    res.statusCode = 404;
    res.render('404', {
        layout: 'main'
    });
});

////////////////////////////////// routes / post

app.post('/delete-sig', (req, res, next) => {
    db.deleteSignature(req.session.user.userId).then(() => {
        req.session.user.signed = false;
        res.redirect('/signature');
    });
});

app.post('/update-profile', (req, res, next) => {
    let options = (body, woops) => {
        return {
            layout: 'main',
            user: body,
            oops: woops,
            csrfToken: req.csrfToken()
        }
    }
    const whtSpce = /^\s+$/;
    if (whtSpce.test(req.body.city) || whtSpce.test(req.body.homepage)) {
        profile.getUpdate(req.session.user.userId).then((results) => {
            res.render('edit-profile', options(results, 'city or homepage cannot be white space')); // work on this
        }).catch((err) => console.log(err));
    } else if (req.body.age > 150 || req.body.age < 0) {
        profile.getUpdate(req.session.user.userId).then((results) => {
            res.render('edit-profile', options(results, 'that age is not valid'));
        }).catch((err) => console.log(err));
    } else if (req.body.email.indexOf('@') === -1) {
        profile.getUpdate(req.session.user.userId).then((results) => {
            res.render('edit-profile', options(results, 'that email is invalid'));
        }).catch((err) => console.log(err));
    } else if (!req.body.firstname.length || !req.body.lastname.length || whtSpce.test(req.body.firstname) || whtSpce.test(req.body.lastname)) {
        profile.getUpdate(req.session.user.userId).then((results) => {
            res.render('edit-profile', options(results, 'one of your names is invalid'));
        }).catch((err) => console.log(err));
    } else {
        if (req.body.password) {
            bcrypt.hashPassword(req.body.password).then((hash) => {
                profile.updatePassword(req.session.user.userId, hash).then(() => {
                    profile.updateProfile(req.session.user.userId, req.body).then(() => {
                        res.redirect('/thanks');
                    }).catch((err) => console.log(err));
                });
            });
        } else {
            profile.updateProfile(req.session.user.userId, req.body).then(() => {
                res.redirect('/thanks');
            }).catch((err) => console.log(err));
        }
    }
});

app.post('/login', (req, res, next) => {
    let options = (woops) => {
        return {
            layout: 'main',
            oops: woops,
            csrfToken: req.csrfToken()
        }
    }
    if (!req.body.email || !req.body.password) {
        res.render('login', options('something went wrong'));
    } else {
        userDb.checkLogin(req.body.email).then((results) => {
            return bcrypt.checkPassword(req.body.password, results.hashedpass).then((doesMatch) => {
                if (doesMatch) {
                        req.session.user = {
                            firstname: results.firstname,
                            surname: results.lastname,
                            userId: results.id,
                            info: results.prof_id ? true : false,
                            signed: results.sig_id ? true : false
                        }
                        res.redirect('/signature');
                } else {
                    res.render('login', options('something went wrong'));
                }
            });
        }).catch((err) => {
            res.render('login', options('something went wrong'));
        });
    }
});

app.post('/register', (req, res, next) => {
    let options = (woops) => {
        return {
            layout: 'main',
            oops: woops,
            csrfToken: req.csrfToken()
        }
    }
    const whtSpce = /^\s+$/;
    if (!req.body.first || !req.body.second || !req.body.email || !req.body.password || whtSpce.test(req.body.first) || whtSpce.test(req.body.last)) {
        res.render('register', options('something went wrong'));
    } else {
        if (req.body.email.indexOf('@') > -1) {
            bcrypt.hashPassword(req.body.password).then((hash) => {
                userDb.newUser(req.body.first, req.body.second, req.body.email, hash).then((id) => {
                    req.session.user = {
                        firstname: req.body.first,
                        surname: req.body.second,
                        userId: id
                    }
                    res.redirect('/more-info');
                }).catch((err) => {
                    res.render('register', options('that email is already registered'));
                });
            }).catch((err) => console.log(err));
        } else {
            res.render('register', options('that email is invalid'));
        }
    }
});

app.post('/submitSignature', (req, res, next) => {
    if (!req.body.sig) {
        res.render('form', {
            layout: 'main',
            oops: 'oops',
            csrfToken: req.csrfToken()
        });
    } else {
        db.newSig(req.session.user.userId, req.body.sig).then(() => {
            req.session.user.signed = true;
            res.redirect('/thanks');
        }).catch((err) => console.log(err));
    }
});

app.post('/user-info', (req, res, next) => {
    let options = (woops) => {
        return {
            layout: 'main',
            oops: woops,
            csrfToken: req.csrfToken()
        }
    }
    const whtSpce = /^\s+$/;
    if (whtSpce.test(req.body.city) || whtSpce.test(req.body.homepage)) {
        res.render('profile', options('city or homepage cannot be whitespace'));
    } else if (req.body.age > 150 || req.body.age < 0) {
        res.render('profile', options('that age is invalid'));
    } else {
        if (req.session.user.userId) {
            profile.userInfo(req.session.user.userId, req.body).then(() => {
                req.session.user.info = true;
                res.redirect('/signature');
            }).catch((err) => console.log(err));
        } else {
            res.send('you have not registered but have still found your way here');
        }
    }
});

app.listen(process.env.PORT || 8080, () => console.log('listening...'));
