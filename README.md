# FIAP_Space
Este é um projeto estudantil referente á uma reserva de espaços por parte dos usuários e administrativo para cadastrar esses espaços. Faz parte do Tech Challenge 4

Passos dados para criar o projeto:
1º - Instalar comandos npm
2º - Em sequência navegue no terminal para acessar a Space e execute npm init, dentro do package.json renomeie o script de 'test' para 'start', acima de 'script', abra uma nova chave e valor dentro do objeto com "type": "commonjs".
3º - npm install webpack
4º - npm install http-server
5º - npm install @supabase/supabase-js
6º - npm install dotenv
7º - npm install axios
8º - npm install express
9º - npm install require
10º - npm install nodemon
11º - npm install cors
12º - npm install jsonwebtoken
13º - npm install bcryptjs
14º - npm install uuid

Crie um arquivo .gitignore e adicione esses textos ao arquivo:
node_modules
package-lock.json
.env

--------------------------------------------------------------
Para rodar localmente o projeto, após clonar a branch.

1º - Acesse o terminal e use o comando npm install, esse comando fará instalar todos os pacotes acima.
*º - O arquivo .env_example nos mostra um exemplo do que precisamos para que tudo funcione corretamente. As variáveis de ambiente precisam estar setadas, e obviamente precisa do banco de dados correlacional com a estrutura necessária.
*º - Para inicializar localmente o frontend: npm start.
*º - Para inicializar localmente o backend: npm run dev.
(Verifique qual porta o backend esta rodando, por padrão via .env acessa a porta 3000, porém caso já esteja sendo usada acessa 3333. Observe o console qual porta, pois irá informar em qual porta está executando localmente, com essa informação renomeie a porta da variável 'api' dentro do arquivo 'apiAddress.js' na pasta 'util' no frontend.)
