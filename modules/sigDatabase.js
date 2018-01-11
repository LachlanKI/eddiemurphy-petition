const spicedPg = require('spiced-pg');
let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL)
} else {
    const secrets = require('./secrets.json');
    db = spicedPg(`postgres:${secrets.user}:${secrets.pass}@localhost:5432/petition`)
}

function newSig(id, sig) {
    return db.query('INSERT INTO signatures (userid, signature) VALUES ($1, $2)',
             [id, sig]).catch((err) => console.log(err));
}

module.exports.newSig = newSig;

function getSig(id) {
    return db.query('SELECT signature FROM signatures WHERE userid = $1',
                    [id]).then((result) => {
                        return result.rows[0].signature;
                    }).catch((err) => {
                        throw(err);
                    });
}

module.exports.getSig = getSig;

function deleteSignature(id) {
    return db.query(`DELETE FROM signatures
                     WHERE userid = $1`,
                     [id]).catch((err) => console.log(err));
}

module.exports.deleteSignature = deleteSignature;

function giveCookieHash() {
    return "eddie murphy's non stop party is really bangin";
}

module.exports.giveCookieHash = giveCookieHash;
