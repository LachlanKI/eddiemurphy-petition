const spicedPg = require('spiced-pg');
let db;
if (process.env.DATABASE_URL) {
    console.log('process env');
    db = spicedPg(process.env.DATABASE_URL);
} else {
    console.log('localhost');
    const secrets = require('./secrets.json');
    db = spicedPg(`postgres:${secrets.user}:${secrets.pass}@localhost:5432/petition`);
}
// const db = spicedPg(process.env.DATABASE_URL || `postgres:${secrets.user}:${secrets.pass}@localhost:5432/petition`);


function newUser(first, last, email, hashPass) {
        return db.query('INSERT INTO users (firstName, lastName, email, hashedPass) VALUES ($1, $2, $3, $4) RETURNING id',
        [first, last, email, hashPass]).then((result) => {
            return result.rows[0].id;
        }).catch((err) => {
            throw(err);
        });
}

module.exports.newUser = newUser;

function checkLogin(email) {
    return db.query(`SELECT users.firstName, users.lastName, users.id, users.hashedPass, user_profile.userid AS prof_id, signatures.userid AS sig_id
                     FROM users
                     LEFT JOIN user_profile
                     ON users.id = user_profile.userid
                     LEFT JOIN signatures
                     ON users.id = signatures.userid
                     WHERE email = $1`,
                    [email]).then((result) => {
                        return result.rows[0];
                    }).catch((err) => console.log(err));
}

module.exports.checkLogin = checkLogin;

function getCoolPeople() {
    return db.query(`SELECT users.firstname, users.lastname, user_profile.age, user_profile.city, user_profile.homepage
                     FROM users
                     JOIN signatures
                     ON users.id = signatures.userid
                     LEFT JOIN user_profile
                     ON users.id = user_profile.userid`).then((res) => {
                         return res.rows;
                     }).catch((err) => {
                         throw(err);
                     });
}

module.exports.getCoolPeople = getCoolPeople;
