const { selectRow, updateRow, insertRow, selectConditions } = require('../utilQuerys.js');

const searchUser = (login) => {
    return selectRow('users', 'id, name, login, password, nivel, status', 'login', login).then(response => {
        return response;
    })
}

const listSpaces = (space) => {
    return selectConditions('spaces', '*', space, 'id', 'asc');
}

const spaceUpdateStatus = (newStatus, spaceId) => {
    updateRow('spaces', { status: newStatus }, 'id',  spaceId);
}

const selectSpaceById = (id) => {
    return selectRow('spaces', '*', 'id', id);
}

const insertSpace = (space) => {
    insertRow('spaces', space);
}

module.exports = {
    searchUser,
    listSpaces,
    spaceUpdateStatus,
    selectSpaceById,
    insertSpace
}