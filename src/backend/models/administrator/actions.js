const { selectRow, updateRow, insertRow } = require('../utilQuerys.js');

const searchUser = (login) => {
    return selectRow('users', 'id, name, login, password, nivel, status', 'login', login).then(response => {
        return response;
    })
}

module.exports = {
    searchUser
}