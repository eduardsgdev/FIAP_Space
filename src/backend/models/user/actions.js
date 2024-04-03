const { selectRow, updateRow, insertRow, selectInnerJoin, selectConditions } = require('../utilQuerys.js');

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

const listSpaces = (space, spaceName) => {
    if (spaceName == undefined || spaceName == null) {
        spaceName = '';
    }

    return selectConditions('spaces', '*', space, 'name',`%${spaceName}%`, 'id',  'asc');
}

const listSpace = (spaceId) => {
    return selectRow('spaces', '*', 'id', spaceId);
}

const getUserReserves = (userId, statusReserve) => {
    return selectInnerJoin('spaces_reserved', '*', 'spaces', '*', { user_id: userId, status: statusReserve }, 'spaces.name' , '%%', 'id', 'asc');
}

const getUserReserve = (userId, reserveId) => {
    return selectInnerJoin('spaces_reserved', '*', 'spaces', '*', { user_id: userId, id: reserveId }, 'spaces.name' , '%%', 'id', 'asc');
}

const reserveUpdate = (newStatus, reserveId) => {
    updateRow('spaces_reserved', { status: newStatus }, 'id', reserveId);
}

module.exports = {
    insertUser,
    checkLoginAvailable,
    checkEmailAvailable,
    searchLogin,
    updatePassToken,
    getPassToken,
    updatePassword,
    listSpaces,
    listSpace,
    getUserReserves,
    getUserReserve,
    reserveUpdate
}