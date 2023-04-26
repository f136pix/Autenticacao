//ULTILIZANDO O DOTENV PARA ESCONDER OS DADOS NO REP PUBLICO
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();

//Necessario para o funcionamento do EJS
app.use(express.static("public"));
app.set('view engine', 'ejs');

//Necessario para o funcionamento do Body-Parser
app.use(bodyParser.urlencoded({extended:true}));

//Conectando ao DB
mongoose.connect("mongodb+srv://admin:Filipeco123@cluster0.uaaw1ki.mongodb.net/FrasesDB", {useNewUrlParser: true});

//Criando o schema do usuario : apenas um email e senha
//O Schema precisa ser um 'new mongoose.schema', pois so assim conseguimos usar o encrypt
const schemaUsuario = new mongoose.Schema({
    email: String,
    senha: String
});
                                                //O unico campo que desejamos encriptar é senha
schemaUsuario.plugin(encrypt, {secret: process.env.ENCRIPTAR, encryptedFields: ['senha']});


//Criando o model baseado no Schema
const Usuario = new mongoose.model("Usuario", schemaUsuario)

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
    const novoUsuario = new Usuario({
        //Pegando o name dos inputs e aplicando o body-parser
        email: req.body.email,
        senha: req.body.senha
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
}));

app.post('/login', ((req,res) => {
    const user = req.body.email;
    const senha = req.body.senha;

    Usuario.findOne({email: user})
    //Usando metodos assincronos
    .then((usuarioEncontrado) => {
        if(usuarioEncontrado) {
            if (usuarioEncontrado.senha === senha){
                res.render('frases')
            }
        }})
        //Lidando com o error
        .catch((err) => {
            console.log(err)
        })
   }))

app.listen(3000, (() => {
    console.log('Aberto no PORT 3000')
}));