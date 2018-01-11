// postgres is on a port 5432
// pg makes a connection to this port on your machine and speaks postgres to it
// keep a connection and keep it alive
// connection pooling helps solve this problem
// the result of the promise is an array with objects which are the rows where th columns are the properties
// could pass object to express handlebars or jsut handlebars
// if you pass a callback in spiced pg you will not get back a promise
// SQL injection is a vunereablity
// never trust any input from the user
// take the user input and escape it ALWAYS
// second argument should be an array

// function findCity(name, id) {
//     db.query(
//         'SELECT * FROM cities WHERE city = $1 AND id = $2',
//         [name, id]
//     ).then((results) => {
//         console.log(results.rows);
//     }).catch((err) => {
//         console.log(err);
//     });
// }

// put all functions that use the database into a module by itself

// \\// __- PRT -__ \\//
// //\\ --_ ONE _-- //\\

// everytime the user clicks on the form the user gets server a new page
// NO AJAX REQUEST REQUIRED THIS IS OLD'SCOOL
// use express handlebars
// all pages need a handlebars template

// STEP ONE

// create a database for this project - create a table called signatures {
// with id SERIAL PRIMARY KEY,
// first VARCHAR NOT NULL
// last VARCHAR NOT NULL
// signature text NOT NULL
// created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//}

// 3 pages
// 1st PAGE FOR WHEN YOU SHOW UP
    // field for the first name and last name and a canvas for the signature (IN FORM TAG)
    // when the mouse goes down on the canvas draw from old mouse x to new mouse x
    // when the user clicks submit, submit three things - first name (TYPE TEXT) - last name (TYPE TEXT) - image dataURL (TYPE HIDDEN)
    // canvas' have a method
    // canvas.toDataURL() // browsers know how to interperet data URLS
    // got to get the dataURL into the <input type="hidden"> before submit happens
    // when the signing is sucessfull set a cookie so that they can never sign again

// 2nd THANK YOU pages
    // should have a link to the third page, which will be the list of signatures.

// 3rd SIGNERS PAGE
    // pass to a handlebars template a list of the signers from the database
    // never show any signature to anyone but the person who signedls

////////////////////////////////////////// PART 2 /////////////////////////////////////////

// need to remember the id of the user who just signed.
// use cookie session middleware
// a session object is available on req objects
// we can use the id in the get request on the subsequent page (thanks)
// if there is no signature id we can assume tht they have not signed the petition
// cookie are pretty to tamper with/ encrypt those cookies
// crypto currency private KEY
//
// var cookieSession = require('cookie-session');
//
// app.use(cookieSession({ // -------- middle ware
//     secret: 'a really hard to guess secret', // ------- this secret should be imported via a secret json file
//     maxAge: 1000 * 60 * 60 * 24 * 14 // 2 WEEKS
// }));
//
// gives a new property called req.session
//
// req.session.signatureId = id; // -------- is the users id
//
// a session is the presence of a specific bit of information that is used by the user. sessions dont last forever.
// hence max age
//
// in this project dont save the signature value into the session -  it is too big
//
// make a query to the database when we use the route, using the id stored in the cookie
// dont need cookei parser anymore

// EXAMPLE
//
// in server.js
//
// var cookieSession = require('cookie-session');
//
// app.use(cookieSession({ // -------- middle ware obv
//     secret: 'the quick brown fox jumps over the lazy dog, and eddie murphy', // ------- this secret should be imported via a secret json file
//     maxAge: 1000 * 60 * 60 * 24 * 14 // 2 WEEKS
// }));
//
//
// app.get('/logout', (req, res, next) => {
//     req.session = null;
//     res.send(`<h1>NOW OUR SESSION IS ${req.session}</h>`);
// });
//
// app.get('/message', (req, res, next)  => {
//     res.send(`<h1>${req.session.message}</h1>
//               <a href='/logout'>logout</a>`)
// });
//
// app.get('/', (req, res, next) => {
//     req.session.message = 'No one has the power to shatter your reams unless you give it to them';
//     res.send(`<a href='/message'>show cookie</a>`);
// });
//
// -------------------------------------
//
// if (req.session.message) {
//     res.redirect('/thanks');
// }

//////////////////////////// AUTHENTICATION ///////////////////////////////////
// Bcrypt
//
// // SETTING THE PASSWORD _ USED IN THE REGESTRATION PROCESS
//
// var bcrypt = require('bcryptjs');
//
// function hashPassword(plainTextPassword) { // -------------from user input /  requires body-parser
//     return new Promise(function(resolve, reject) {
//         bcrypt.genSalt(function(err, salt) {
//             if (err) {
//                 return reject(err);
//             }
//             bcrypt.hash(plainTextPassword, salt, function(err, hash) {
//                 if (err) {
//                     return reject(err);
//                 }
//                 resolve(hash);
//             });
//         });
//     });// then do the database query
// }


// TO COMPARE THE USERS PASSWORD WITH THE HASH

// var bcrypt = require('bcryptjs');
// // beofre we run this function we need to have already retrieved the hashed password - promises etc
// function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
//     return new Promise(function(resolve, reject) {
//         bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(doesMatch); // compare the hashe password by using the username entered
//             }
//         });
//     });
// }

//////////////////// EXAMPLES ??????????????????????

// HTML
//
// have a form field for submiting regestration. (have to form action as register or something) two text inputs one username and one password/ button has to be submit for the post request
//
//
// SERVER>JS
//
// app.get('/', (req, res, next) => {
//     your home > > > > >
// });
//
// app.get('/features', (req, res, next) => {
//     can only see this page if you are logged in > > > > >
//
// });
//
// app.post('/login', (req, res, next) => {
//     checkPassword(req.body.password, then a function from the module(probably do this before hand and then do the compare hash in the then of the promise))
// });
//
// app.post('/register', (req, res, next) => {
//     hashPassword(req.body.password).then((hashedPassword) => {
//         console.log(hashedPassword);
//         insert into the database > > > > >
//     })
// });

// might need to research foreign keys

// -_PETITION PART 4_-

// FOREIGN keys
//
// take 2 tables, one table has references to the other table and you can join them together.
// a joined tablr is a temporary table that exists for the purpose of querying
//
// SELECT users.first, users.last, users.pass, users.id, signatures.id
// FROM USERS
// LEFT JOIN signatures
// ON users.id = signatures.id;
//
// These "databaes" are optimised to make these kind of queries very quickly.
//
// app.get('/signers/:city')
//
// you can do toLowerCase in psql
// WHERE LOWER(name) = LOWER('whatever');
//
// JOIN MULTIPLE tables
//
// < `write these using back tick strings inside javascript modules` >
// SELECT first, last, maxAge
// FROM signatures
// JOIN user_profiles
// ON user_profiles.user_id = signatures.user_id
// JOIN users
// ON user.id = sinatures.id;
// WHERE > > > > > >
// ////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\
// |$|$|$|$|$|$| _PETITION PART FIVE_ |$|$|$|$|$|$|
// \\\\\\\\\\\\\\\\\\\\\\\\////////////////////////
// LET THE USERS EDIT THEIR information
//
// DONT LOAD THE PASSWORD AS WE DO NOT KNOW iT (ALL BUT PASSWORD)
//
// IN GET ROUTE OF EDIT PROFILE PAGE
// NEED TO DO A QUERY
// NEEDS TO BE A JOIN TO BOTH USERS AND PROFILE TABLE
//
// app.get('/edit profile', (req, res) => {
//     db.query('select all the stuff', [stuff]).then((results) => {
//         return results.rows[0]
//     });
// });
//
// If the user doesnt have a user_profile row then you have to INSERT
//
// if they want to change password go through all of bcrypt again and then update the hash inside the table.
//
// delete row with signature
// delete from sig
// where userid = something

// SECURITY

// EVAL function
// converst a string into javascript and then runs it.
// var a = 10;
// eval('console.log(a)');
// // if you do have to use it, trust the string passed.
// // its slow
// setTimeout("console.log('10')", 100);
//
// var fn = new Function('console.log(a)');
// fn();
// all these can convert string into functions that run.

// XSS
// cross site scripting.
// inputing a new script tag that loads into the html malicious js.
//
// you can use escape user characters in user input to remove the risk
//
// {{handlebars}} escapes everything unless notified
//  by using {{{triple handlebars}}}
//
//  <img src=0 onerror="alert('REKT')">
//
// OPEN REDIRECTS
// redirecting anywhere is called open redirect
// localhost:8080/register?next=/petition
//
// CLICKJACKING
// never allow your site to be put into a frame
//
// in express
//
// app.use((req, res, next) => {
//     res.setHeader('x-frame-options', 'deny');
//     next();
// });
//
// if using HELMET middleware
// app.disable('x-powered-by');
//
// never present the user any error object as it will give out information that you may not want them to have;
//
// CONTENT SECURITY POLICY header
//
// //
//
// CSRF
// Cross Site Request Forgery
//
// in every request you send and recieve cookies no matter what req.url
// obv these could then be used in attacks
//
// must confirm that the user is deliberately making post request.
// put into every request and unguessable string - or a token
//
// put into everyone of our forms this token
//
// CSURF is middleware that helps with this.
// what csurf will do is put into the session for every request a secret.
// app.use - csurf has to come after cookieSession
//
// form
//     input
//     input
//     input
//     input type='hidden' name='_csrf' value='{{csrfToken}}'
//     button
// /form
//
// app.get('/petition', (req, res, next) => {
//     res.render('petition', {
//         layout: 'main',
//         csrfToken: req.csrfToken()
//     });
// });
//
// maybe trust OWASP
//
// HEROKU
//
// in node there is this object called process, tells us information about pretty much everything within the app.
// process.env - tells us which environment the app is living in - eg local computer or otherwise
// process.env.PORT - this value only gets populated if the environmentcreates it for us
//
// WHAT COULD GO wrong
// -package.json is fucked
// -look at more/view logs on heroku to check for errors
