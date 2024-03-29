const { createWebToken, decodedWebToken } = require('../security/token.js');
const { selectConditions, updateRow, selectRow } = require('../models/utilQuerys.js');
const { comparePassword } = require('../security/hash.js');
const { searchUser } = require('../models/administrator/actions.js');
const { insertLog, updateLastLogin } = require('../models/utilFunctions.js');

const login = async (request, response) => {
    //request example = { login: '11111111111', password: 'xxxxx' }
    const data = request.body;
    
    if (data.login == '' || data.login == undefined || data.login == null) {
        return response.status(400).json({ message: 'Login é um campo obrigatório.'});
    }
    
    if (data.password == '' || data.password == undefined || data.password == null) {
        return response.status(400).json({ message: 'Password é um campo obrigatório.'});
    }
    
    const selectUser = await searchUser(data.login);

    if (selectUser.length == 1) {
        const user = selectUser[0];
        if (data.login == user.login && await comparePassword(data.password, user.password) == true) {
            if (user.nivel == 2) {
                if (user.status != 1) {
                    return response.status(400).json({ message: 'Usuário não está ativo!'});
                }
                updateLastLogin(user.id);
                
                insertLog('logs_admin', user.id, 'LOGINSUCCESSFULL', { login: user.login });

                const authorization = createWebToken(user.id, user.name, user.login, user.nivel);

                return response.status(200).json({ message: 'Logado com sucesso.', authorization});

            } else {
                return response.status(401).json({ message: 'Nível não permitido!'});
            }
        } else {
            return response.status(400).json({ message: 'Login ou Senha incorretos!'});
        }
    } else{
        return response.status(400).json({ message: 'Usuário não encontrado.'});
    }
}

module.exports = {
    login
}