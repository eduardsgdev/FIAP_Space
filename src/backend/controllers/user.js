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
    updatePassword,
    listSpaces,
    listSpace,
    getUserReserves,
    getUserReserve,
    reserveUpdate,
    checkSpaceAvailable,
    addUserReserve,
    checkRecorrencyReserve,
    updateReserve,
    getUserActiveReserve
} = require('../models/user/actions.js');
const { insertLog, updateLastLogin } = require('../models/utilFunctions.js');
const { baseUrl } = require('../config/baseUrl.js');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

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

                return response.status(200).json({ message: 'Logado com sucesso.', authorization, email: user.email });

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

const getSpaces = async (request, response) => {
    //request example = { name: 'Quadr', capacity: 50, type: 'Salão de Festas' }
    const data = {}

    if (request.body.capacity != '') {
        data.capacity = request.body.capacity;
    }
    
    if (request.body.type != 'all') {
        data.type = request.body.type;
    }

    const name = request.body.name;
    
    data.status = 1;
    const spaces = await listSpaces(data, name);
    
    if (spaces.length == 0) {
        return response.status(400).json({ message: 'Nenhum dado foi encontrado.' });
    }

    return response.status(200).json({ message: 'Lista de Espaços', spaces: spaces });
}

const getSpace = async (request, response) => {
    //request example = { id: 1 }
    const data = request.body;

    if (data.id == '' || data.id == undefined) {
        return response.status(400).json({ message: 'É necessário enviar um id!'});
    }

    const selectSpace = await listSpace(data.id);
    const space = selectSpace[0];

    if (!space) {
        return response.status(400).json({ message: 'Nenhum dado foi encontrado.'});
    }

    return response.status(200).json({ message: 'Sucesso', space: space });
}

const getReserves = async (request, response) => {
    //request example = { status: 1 } 1: Active, 0: Cancelled, all: All
    const jwt = request.headers['authorization'];
    const decodedToken = await decodedWebToken(jwt); 
    const data = request.body;

    if (data.status < 0 || data.status > 1) {
        return response.status(400).json({ message: 'Status enviado não é permitido.' });
    } else if (!data.status) {
        return response.status(400).json({ message: 'Enviar o status é necessário!'});
    }

    const reserves = await getUserReserves(decodedToken.userData.id, data.status);

    if (reserves.length == 0) {
        return response.status(400).json({ message: 'Nenhum dado foi encontrado.'});
    }

    return response.status(200).json({ message: 'Reservas do usuário', reserves: reserves });
}

const getReserve = async (request, response) => {
    //request example = { reserve_id: 1 }
    const jwt = request.headers['authorization'];
    const decodedToken = await decodedWebToken(jwt); 
    const data = request.body;

    if (!data.reserve_id) {
        return response.status(400).json({ message: 'Enviar o ID é necessário.'});
    }

    const reserve = await getUserReserve(decodedToken.userData.id, data.reserve_id);

    if (reserve.length == 0) {
        return response.status(400).json({ message: 'Nenhum dado foi encontrado.'});
    }

    return response.status(200).json({ message: 'Reserva do usuário', data: reserve });
}

const reserveCancel = async (request, response) => {
    //request example = { reserve_id: 1, status: 1 } 1: Active, 0: Cancelled
    const jwt = request.headers['authorization'];
    const decodedToken = await decodedWebToken(jwt); 
    const data = request.body;

    if (data.reserve_id == '' || data.reserve_id == undefined) {
        return response.status(400).json({ message: 'Enviar o ID da reserva é obrigatório!'});
    } else if (data.status !== "0") {
        return response.status(400).json({ message: 'O status enviado não é permitido.'});
    } else if (!data.status) {
        return response.status(400).json({ message: 'Enviar o status é obrigatório.'});
    }

    const selectReserve = await getUserReserve(decodedToken.userData.id, data.reserve_id);
    const reserve = selectReserve[0];

    const now = new Date().getTime();
    const startDate = new Date(reserve.start_reservation).getTime();

    if (now > startDate) {
        return response.status(400).json({ message: 'Não é possível cancelar uma reserva já iniciada!'});
    }

    if (!reserve) {
        return response.status(400).json({ message: 'Nenhum dado foi encontrado.'});
    }
    
    if (reserve.status == data.status) {
        return response.status(400).json({ message: 'Nenhum dado foi alterado.'});
    }

    insertLog('logs_user', decodedToken.userData.id, 'CANCELRESERVE', data);

    reserveUpdate(data.status, data.reserve_id);
    
    return response.status(200).json({ message: 'Sua reserva foi atualizada.' });
}

const addReserve = async (request, response) => {
    /*request example = {
        start_reservation: '2024-03-05 08:00:00',
        final_reservation: '2024-03-05 12:00:00',
        qtd_hours: 4,
        space_id: 1,
        email: jose.maluquinho@gmail.com,
    }*/
    const jwt = request.headers['authorization'];
    const decodedToken = await decodedWebToken(jwt);
    const data = request.body;

    const fieldArr = ['start_reservation', 'final_reservation', 'qtd_hours', 'space_id', 'email'];
    for (const item of fieldArr) {
        if (data[item] == undefined || data[item] == '') {
            return response.status(400).json({ message: 'Todos os campos são obrigatórios!' });
        }
    }

    const now = new Date().getTime();
    const startDate = new Date(data.start_reservation).getTime();

    if (now > startDate) {
        return response.status(400).json({ message: 'Você não pode fazer uma reserva com a data passada'});
    }

    const selectRecorrency = await checkRecorrencyReserve(data.space_id);
    const recorrency = selectRecorrency[0];

    if (recorrency) {
        const recorrencyStartDate = new Date(recorrency.start_reservation).getTime();
        if (recorrency.user_id == decodedToken.userData.id && recorrencyStartDate > now) {
            return response.status(400).json({ message: 'Não é possível realizar dois agendamentos ativos do mesmo espaço consecutivamente.'});
        }
    }

  
    if (data.start_reservation > data.final_reservation) {
        return response.status(400).json({ message: 'A data inicial não pode ser maior que o final da reserva.' });
    }

    const start = moment(data.start_reservation, 'YYYY-MM-DD HH:mm:ss');
    const end = moment(data.final_reservation, 'YYYY-MM-DD HH:mm:ss');

    const diff = moment.duration(end.diff(start));

    if (data.qtd_hours < 1 || diff.hours() == 0) {
        return response.status(400).json({ message: 'A permanencia mínima de horas não pode ser menor que 1 hora.' });
    } else if (data.qtd_hours > 8 || diff.hours() >= 8 && diff.minutes() > 0) {
        return response.status(400).json({ message: 'A permanencia máxima de horas não pode ser maior que 8 horas.' });
    }

    const space = await listSpace(data.space_id);
    if (space.length == 0) {
        return response.status(400).json({ message: 'Este espaço não está disponível.'});
    }

    data.total_prize = space[0].prize * diff.hours();
    data.user_id = decodedToken.userData.id;
    data.qtd_hours = diff.hours();

    const selectReserve = await checkSpaceAvailable(data.space_id, data.start_reservation, data.final_reservation);
    const reserve = selectReserve[0];    

    if (reserve) {
        return response.status(400).json({ message: 'Já existe uma reserva para este local no periodo solicitado.' });
    }

    insertLog('logs_user', decodedToken.userData.id, 'ADDRESERVE', data);

    addUserReserve(decodedToken.userData.id, data);

    sendEmail(
        data.email, 
        'Space - Agendamento de Espaço', 
        `A reserva  do espaço ${space[0].name} foi concluída com sucesso, este email será nosso nosso canal de contato para esta reserva!
        
        Atenciosamente, Grupo Q Fiap`,
        );

    return response.status(201).json({ message: 'Sua reserva foi concluída com sucesso.' });

}

const editReserve = async (request, response) => {
    /*request example = {
        reserve_id: 1,
        start_reservation: '2024-03-05 08:00:00',
        final_reservation: '2024-03-05 12:00:00',
        qtd_hours: 4,
        email: jose.maluquinho@gmail.com,
    }*/
    const jwt = request.headers['authorization'];
    const decodedToken = await decodedWebToken(jwt);
    const data = request.body;

    const fieldArr = ['reserve_id', 'start_reservation', 'final_reservation', 'email'];
    for (const item of fieldArr) {
        if (data[item] == undefined || data[item] == '') {
            return response.status(400).json({ message: 'Todos os campos são obrigatórios!' });
        }
    }

    const selectReserve = await getUserActiveReserve(decodedToken.userData.id, data.reserve_id);
    const reserve = selectReserve[0];

    if (!reserve) {
        return response.status(400).json({ message: 'Lamento, esta reserva não foi encontrada.'});
    }

    const now = new Date().getTime();
    const postStartDate = new Date(data.start_reservation).getTime();
    const reserveStartDate = new Date(reserve.start_reservation).getTime();

    if (reserveStartDate < now) {
        return response.status(400).json({ message: 'Você não pode editar uma reserva finalizada!' });
    }

    if (now > postStartDate) {
        return response.status(400).json({ message: 'Você não pode fazer uma reserva com a data passada.'});
    }
  
    if (data.start_reservation > data.final_reservation) {
        return response.status(400).json({ message: 'A data inicial não pode ser maior que o final da reserva.' });
    }

    const start = moment(data.start_reservation, 'YYYY-MM-DD HH:mm:ss');
    const end = moment(data.final_reservation, 'YYYY-MM-DD HH:mm:ss');

    const diff = moment.duration(end.diff(start));

    if (data.qtd_hours < 1 || diff.hours() == 0) {
        return response.status(400).json({ message: 'A permanencia mínima de horas não pode ser menor que 1 hora.' });
    } else if (data.qtd_hours > 8 || diff.hours() >= 8 && diff.minutes() > 0) {
        return response.status(400).json({ message: 'A permanencia máxima de horas não pode ser maior que 8 horas.' });
    }

    const space = await listSpace(reserve.spaces.id);
    if (space.length == 0) {
        return response.status(400).json({ message: 'Este espaço não está disponível.'});
    }

    data.total_prize = space[0].prize * diff.hours();
    data.qtd_hours = diff.hours();

    const selectAlreadyReserve = await checkSpaceAvailable(reserve.spaces.id, data.start_reservation, data.final_reservation);
    const alreadyReserve = selectAlreadyReserve[0];    

    if (alreadyReserve && alreadyReserve.user_id != decodedToken.userData.id) {
        return response.status(400).json({ message: 'Já existe uma reserva para este local no periodo solicitado.' });
    }

    insertLog('logs_user', decodedToken.userData.id, 'EDITRESERVE', data);

    updateReserve(reserve.id, data);

    sendEmail(
        data.email, 
        'Space - Agendamento de Espaço',
        `A reserva  do espaço ${space[0].name} foi editada com sucesso.
        
        Atenciosamente, Grupo Q Fiap`,
        );

    return response.status(200).json({ message: 'Sua reserva foi editada com sucesso.' });

}

module.exports = {
    addUser,
    login,
    resetPassword,
    changePassword,
    getSpaces,
    getSpace,
    getReserves,
    getReserve,
    reserveCancel,
    addReserve,
    editReserve
}