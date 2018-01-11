const bcrypt = require('bcryptjs');

function hashPassword(plainTxtPass) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(plainTxtPass, salt, (err, hash) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });
}

module.exports.hashPassword = hashPassword;

function checkPassword(loginPassVal, storedHashPass) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(loginPassVal, storedHashPass, (err, doesMatch) => {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}

module.exports.checkPassword = checkPassword;
