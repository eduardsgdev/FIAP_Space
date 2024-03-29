const { sendEmail } = require('../config/smtp.js');
const { createWebToken, decodedWebToken } = require('../security/token.js');
const { selectConditions, updateRow, selectRow, insertRow, selectInnerJoin } = require('../models/utilQuerys.js');
const { createHash, comparePassword } = require('../security/hash.js');
const { 
    insertUser, 
    checkLoginAvailable, 
    checkEmailAvailable, 
    searchLogin, 
    updatePassToken, 
    getPassToken, 
    updatePassword
} = require('../models/user/actions.js');
const { insertLog, updateLastLogin } = require('../models/utilFunctions.js');
const { baseUrl } = require('../config/baseUrl.js');
const { v4: uuidv4 } = require('uuid');

const addUser = async (request, response) => {
    const data = request.body;
    /*requst example = {
        name: eduardo,
        login: 11111111100,
        email: eduard.sg@icloud.com,
        password: 1234,
        confirm_password: 1234,
    }
    */

    const selectLogin = await checkLoginAvailable(data.login);
    const unavailableLogin = selectLogin[0];
    if (unavailableLogin && unavailableLogin.login != undefined) {
        return response.status(400).json({ message: 'O CPF informado já está cadastrado no sistema.'});
    }
    
    const selectEmail = await checkEmailAvailable(data.email);
    const unavailableEmail = selectEmail[0];
    if (unavailableEmail) {
        return response.status(400).json({ message: 'O Email informado já está cadastrado no sistema.'});
    }

    if (data.name == '' || data.name == undefined) {
        return response.status(400).json({ message: 'O nome deve ser preenchido.'});
    } else if (data.login == '' || data.login == undefined || data.login.length != 11) {
        return response.status(400).json({ message: 'CPF deve ser preenchido corretamente'});
    } else if (data.password == ''  || data.password == undefined || data.password != data.confirm_password) {
        return response.status(400).json({ message: 'As senhas devem ser preenchidas e corresponderem.'});
    }

    data.password = await createHash(data.password);
    
    const allowedDomains = ['gmail.com', 'outlook.com', 'icloud.com', 'hotmail.com'];

    if (data.email && typeof data.email === 'string') {
        const match = data.email.match(/@(.+)$/);
        if (match) {
            const domain = match[1];
            if (!allowedDomains.includes(domain)) {
                return response.status(400).json({ message: 'O domínio do email não é permitido.' });
            }
        } else {
            return response.status(400).json({ message: 'O email não é válido.' });
        }
    } else {
        return response.status(400).json({ message: 'O email não foi fornecido ou é inválido.' });
    }

    insertUser({
        name: data.name,
        login: data.login,
        email: data.email,
        password: data.password,
        nivel: 1,
        status: 1
    });

    insertLog('logs_user', null, 'ADDUSER', {
        name: data.name,
        login: data.login,
        email: data.email
    });

    sendEmail(
        data.email, 
        'Bem vindo á Space', 
        `Olá, seja muito bem vindo a nossa plataforma!
        
        Atenciosamente, Grupo Q Fiap`,
        );

    return response.status(201).json({ message: 'Cadastrado com sucesso!'});
}

const login = async (request, response) => {
    //request example = { login: '11111111111', password: 'xxxxx' }
    const data = request.body;
    
    if (data.login == '' || data.login == undefined || data.login == null) {
        return response.status(400).json({ message: 'Login é um campo obrigatório.'});
    }
    
    if (data.password == '' || data.password == undefined || data.password == null) {
        return response.status(400).json({ message: 'Password é um campo obrigatório.'});
    }
    
    const selectUser = await searchLogin(data.login);

    if (selectUser.length == 1) {
        const user = selectUser[0];
        if (data.login == user.login && await comparePassword(data.password, user.password) == true) {
            if (user.nivel == 1) {
                if (user.status != 1) {
                    return response.status(400).json({ message: 'Usuário não está ativo!'});
                }
                updateLastLogin(user.id);
                
                insertLog('logs_user', user.id, 'LOGINSUCCESSFULL', { login: user.login });

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

const resetPassword = async (request, response) => {
    //request example = { email: 'appsonlysga@gmail.com' }
    const data = request.body;

    const selectEmail = await checkEmailAvailable(data.email);
    const userData = selectEmail[0];
    if (!userData) {
        return response.status(400).json({ message: 'Email não encontrado!'});
    }    
    const uniqId = uuidv4();
    updatePassToken(uniqId, userData.id);

    insertLog('logs_user', userData.id, 'REQUESTRESETPASSWORD', userData);

    sendEmail(
        data.email,
        'Recuperação de Senha - Space',
        `Olá,

        Você solicitou a redefinição de senha. Sempre confira se este é o último link gerado. 

        ${baseUrl}/src/frontend/views/user/password-reset/index.html?id=${uniqId}

        Atenciosamente, Grupo Q Fiap.`
    );

    return response.status(200).json({ message: 'Um email de recuperação de senha foi enviado.'});

}

const changePassword = async (request, response) => {
    //request example = { token: 'r769991247694', password: '1234', confirm_password: '1234' }
    const data = request.body;
    
    const selectToken = await getPassToken(data.token);
    const userData = selectToken[0];
    if (!userData) {
        return response.status(400).json({ message: 'Parece que seu token de redefinição expirou!'});
    }

    if (data.password != data.confirm_password) {
        return response.status(400).json({ message: 'As senhas devem corresponder!'})
    } else if (data.password == '' || data.confirm_password == '') {
        return response.status(400).json({ message: 'As senhas não podem ser vazias.'})
    }
    data.password = await createHash(data.password);
    updatePassword(data.password, userData.id);
    updatePassToken(null, userData.id);

    insertLog('logs_user', userData.id, 'CHANGEPASSWORD', userData);

    sendEmail(
        userData.email,
        'Alteração de Senha - Space',
        `Olá,

        Sua senha foi alterada!

        Atenciosamente, Grupo Q Fiap.`
    );

    return response.status(200).json({ message: 'A senha foi atualizada com sucesso.'})
    
}

module.exports = {
    addUser,
    login,
    resetPassword,
    changePassword
}