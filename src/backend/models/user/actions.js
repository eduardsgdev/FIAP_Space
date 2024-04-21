const { selectRow, updateRow, insertRow, selectInnerJoin, selectConditions, checkReserve } = require('../utilQuerys.js');

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
    return selectConditions('spaces', '*', { id: spaceId, status: 1}, 'name', '%%', 'id', 'asc');
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

const checkSpaceAvailable = (spaceId, startDateAndTime, finalDateAndTime) => {
    return checkReserve('spaces_reserved', '*', { space_id: spaceId, status: 1 }, startDateAndTime, finalDateAndTime, 'id', 'asc');
}

const addUserReserve = (userID, insertData) => {
    insertRow('spaces_reserved', { 
        start_reservation: insertData.start_reservation, 
        final_reservation: insertData.final_reservation,
        reserved_hours: insertData.qtd_hours,
        user_id: userID,
        space_id: insertData.space_id,
        status: 1
    });
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
    reserveUpdate,
    checkSpaceAvailable,
    addUserReserve
}