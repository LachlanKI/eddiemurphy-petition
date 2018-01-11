const spicedPg = require('spiced-pg');
const handlebars = require('handlebars');
let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL)
} else {
    const secrets = require('./secrets.json');
    db = spicedPg(`postgres:${secrets.user}:${secrets.pass}@localhost:5432/petition`)
}

function userInfo(id, body) {
    return db.query('INSERT INTO user_profile (userId, age, city, homepage) VALUES ($1, $2, LOWER($3), $4)',
                    [id, body.age || null, body.city, body.homepage]).catch((err) => console.log(err));
}

module.exports.userInfo = userInfo;

function getByLocation(city) {
    return db.query(`SELECT users.firstname, users.lastname, user_profile.age, user_profile.city, user_profile.homepage
                     FROM users
                     JOIN signatures
                     ON users.id = signatures.userid
                     LEFT JOIN user_profile
                     ON users.id = user_profile.userid
                     WHERE user_profile.city = $1`,
                     [city]).then((res) => {
                         return res.rows;
                     }).catch((err) => console.log(err));
}

module.exports.getByLocation = getByLocation;

function updateProfile(id, body) {
    return db.query(`UPDATE users
                     SET firstname = $2,
                         lastname = $3,
                         email = $4
                     WHERE users.id = $1`,
                     [id, body.firstname, body.lastname, body.email]).then(() => {
                         return db.query(`UPDATE user_profile
                                          SET age = $2,
                                              city = $3,
                                              homepage = $4
                                          WHERE user_profile.userid = $1`,
                                          [id, body.age, body.city, body.homepage]);
                     }).catch((err) => console.log(err))
}

module.exports.updateProfile = updateProfile;

function getUpdate(id) {
    return db.query(`SELECT users.firstname, users.email, users.lastname, user_profile.age, user_profile.city, user_profile.homepage
                     FROM users
                     LEFT JOIN user_profile
                     ON users.id = user_profile.userId
                     WHERE users.id = $1`,
                     [id]).then((results) => {
                         return results.rows[0];
                     }).catch((err) => console.log(err));
}

module.exports.getUpdate = getUpdate;

function updatePassword(id, hash) {
    return db.query(`UPDATE users
                     SET hashedpass = $2
                     WHERE users.id = $1`,
                     [id, hash]).catch((err) => console.log(err));
}

module.exports.updatePassword = updatePassword;

function myHelper(results) {
    const cleanStr = results.city.replace(/<\/?[^>]+(>|$)/g, "");
    if (results.age && results.city) {
        return new handlebars.SafeString(`(${results.age}, <a href="/cool-people/${cleanStr}">${cleanStr}</a>)`);
    } else if (results.age) {
        return `(${results.age})`;
    } else if (results.city) {
        return new handlebars.SafeString(`(<a href="/cool-people/${cleanStr}">${cleanStr}</a>)`);
    }
}

module.exports.myHelper = myHelper;
