// O DOTENV PARA ESCONDER OS DADOS NO REP PUBLICO
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//const md5 = require('md5')
//Usado o Bcrypt para encriptar as senhas
bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

//Necessario para o funcionamento do EJS
app.use(express.static("public"));
app.set('view engine', 'ejs');

//Necessario para o funcionamento do Body-Parser
app.use(bodyParser.urlencoded({extended:true}));

//Conectando ao DB                      //Ultilizando o DOTENV 
mongoose.connect(`mongodb+srv://admin:${process.env.SENHADB}@cluster0.uaaw1ki.mongodb.net/FrasesDB`, {useNewUrlParser: true});

//Criando o schema do usuario : apenas um email e senha
const schemaUsuario = new mongoose.Schema({
    email: String,
    senha: String
});                                            

//Criando o model baseado no Schema
const Usuario = new mongoose.model("Usuario", schemaUsuario) //Sera salvo como usuarios pois o monggose sempre coloca no plural

app.get('/', ((req, res) => {
    res.render('home');
}));

app.get('/login', ((req, res) => {
    res.render('login');
}));


app.get('/registrar', ((req, res) => {
    res.render('registrar');
}));

app.post('/registrar',((req,res) => {

    //Gerando o HASH com bcrypt, passando como parametro a senha no EJS
    bcrypt.hash(req.body.senha, saltRounds, function(err, hash) {
        const novoUsuario = new Usuario({
            //Pegando o name dos inputs no HTML e aplicando o body-parser
            email: req.body.email,
            senha: hash   //Salvando a senha ultilizando o HASH que é devolvido na callback
        });
    
        //Salvando no DB
        novoUsuario
            .save()         
            .then(() => {
                res.render('frases')
            })
            .catch((err) => {
                console.log(err);
            });
    });
  
}));

app.post('/login', ((req,res) => {
    const user = req.body.email;
    const senha = req.body.senha;

    Usuario.findOne({email: user})
    //Usando metodos assincronos
    .then((usuarioEncontrado) => {
        if(usuarioEncontrado) {
            bcrypt.compare(senha, usuarioEncontrado.senha, (err, resCallback) => {
                //Checando se o resultado da função é true, caso seja, podemos realizar o render da pagina frases
                if(resCallback){
                    res.render('frases')
                }
            });
        }})
        //Lidando com o error
        .catch((err) => {
            console.log(err)
        })
   }))

app.listen(3000, (() => {
    console.log('Aberto no PORT 3000')
}));
