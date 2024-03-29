const { selectRow, updateRow, insertRow, selectInnerJoin } = require('../utilQuerys.js');

const checkLoginAvailable = (requestedLogin) => {
    return selectRow('users', 'login', 'login', requestedLogin);
}

const insertUser = (insertData) => {
    insertRow('users', insertData);
}

const checkEmailAvailable = (requestedEmail) => {
    return selectRow('users', 'id, email', 'email', requestedEmail);
}

const searchLogin = (login) => {
    return selectRow('users', 'id, name, login, password, nivel, status', 'login', login);
}

const updatePassToken = (uniqId, userId) => {
    updateRow('users', { password_token : uniqId }, 'id', userId );
}

const getPassToken = (uniqId) => {
    return selectRow('users', 'id, email', 'password_token', uniqId);
}

const updatePassword = (newPassword, userId) => {
    updateRow('users', { password: newPassword }, 'id', userId);
}

module.exports = {
    insertUser,
    checkLoginAvailable,
    checkEmailAvailable,
    searchLogin,
    updatePassToken,
    getPassToken,
    updatePassword
}