import express from 'express';
import path from 'path';
import session from 'express-session';
import { resolveSoa } from 'dns';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;

const app = express();
const listaEquipe = [];
const listaJogador = [];

app.use(session({
    secret: 'chavescreta',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), 'publico')));

app.use(express.urlencoded({extended: true}));

function usuarioEstaAutenticado (requisicao, resposta, next)
{
    if(requisicao.session.usuarioAutenticado)
    {
        next();
    }
    else
    {
        resposta.redirect('/login.html');
    }
}
var date;
function autenticarUsuario(requisicao, resposta)
{   
    const usuario = requisicao.body.user;
    const senha = requisicao.body.senha;
    if(usuario == 'admin' && senha == '123')
    {
        
        requisicao.session.usuarioAutenticado = true;
        resposta.cookie('dataUltimoAcesso', new Date().toLocaleString(), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });
        resposta.redirect('/menu.html');
        date = requisicao.cookies.dataUltimoAcesso;
    }
    else
    {
        resposta.write('<!DOCTYPE html>');
        resposta.write('<html>');
        resposta.write('<head>');
        resposta.write('<meta charset="UTF-8">');
        resposta.write('<title>Falha ao realizar login</title>');
        resposta.write('</head>');
        resposta.write('<body>');
        resposta.write('<p>Usuário ou senha inválidos!</p>');
        resposta.write('<a href="/login.html">Voltar</a>');

        if (requisicao.cookies.dataUltimoAcesso)
        {
            resposta.write('<p>');
            
            resposta.write('Seu último acesso foi em ' + requisicao.cookies.dataUltimoAcesso);
            resposta.write('</p>');
        }
        resposta.write('</body>');
        resposta.write('</html>');
        resposta.end();
    }
}
app.post ('/login', autenticarUsuario);

app.get('/login', (req,resp)=>{
    resp.redirect('/login.html');
});

app.get('/logout', (req,resp)=>{

    req.session.destroy();
    resp.redirect('/login.html');
});

// cadastro e lista de equipes
function CadastrarEquipe (req, resp)
{
    const nomeTecnico = req.body.nomeTecnico;
    const equipe = req.body.equipe;
    const tel = req.body.tel;

    if(nomeTecnico && equipe && tel)
    {
        listaEquipe.push ({
            nomeTecnico: nomeTecnico,
            equipe: equipe,
            tel: tel
        });
        resp.redirect('/listarEquipe');
    }
    else
    {
        resp.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            <title>Cadastro de equipe</title>
        </head>
        <body>
        
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                  <a class="navbar-brand" href="menu.html">Campeonato Amador de volei</a>
                  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                  </button>
                  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                      <a class="nav-link " href="cadastroEquipe.html">Cadastro de equipe</a>
                      <a class="nav-link" href="cadastroJogador.html">Cadastro de jogadores</a>
                      <a class="nav-link " href="/logout">Sair</a>
                    </div>
                  </div>
                </div>
              </nav>
        
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <form action="/cadastrarEquipe" method="POST">
                            <legend class="text-center mt-3">Cadastro de equipe</legend>
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="nomeTecnico">nome do tecnico</label>
                                    <input type="text" class="form-control" id="nomeTecnico" name="nomeTecnico" value="${nomeTecnico}">
                                    `);
                                if(nomeTecnico == "")
                                {
                                    resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha o nomeTecnico corretamente</p>`);
                                }

                                resp.write(`
                                </div>
                                <div class="col-md-12">
                                    <label for="equipe">Equipe</label>
                                    <input type="text" class="form-control" id="equipe" name="equipe" value="${equipe}">
                                    `);
                                    if(email == "")
                                    {
                                        resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha o email corretamente</p>`);
                                    }
                                    resp.write(`
                                </div>
                                <div class="col-md-12">
                                    <label for="tel">Telefone do Tecnico</label>
                                    <input type="text" class="form-control" id="tel" name="tel" value="${tel}">
                                    `);
                                    if(tel == "")
                                    {
                                        resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha o telefone corretamente</p>`);
                                    }
                                    resp.write(`
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </body>
        </html>
        `);
    }
    resp.end();
}

app.get('/listarEquipe', (req, resp) => {
    resp.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <title>Lista Equipe</title>
    </head>
    <body>

    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="menu.html">Lista de Equipes</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <a class="nav-link "  href="cadastroEquipe.html">Cadastro de Equipes</a>
              <a class="nav-link" href="cadastroJogador.html">Cadastro de jogador</a>
              <a class="nav-link " href="/logout">Sair</a>
            </div>
          </div>
        </div>
      </nav>

    <h2 class="text-center" style="margin-top: 50px;">Lista de equipes</h2> 
        
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col">Nome do tecnico</th>
                        <th scope="col">Equipe</th>
                        <th scope="col">Telefone</th>
                    </tr>
                    </thead>
                    <tbody>`);
                    for(let i=0; i<listaEquipe.length; i++)
                    {
                        resp.write(`
                            <tr>
                                <td>${listaEquipe[i].nomeTecnico}</td>
                                <td>${listaEquipe[i].equipe}</td>
                                <td>${listaEquipe[i].tel}</td>
                            </tr>
                        `);
                    }
                    resp.write(`
                    </div>
                    </div>
                </div>
                    </tbody>
                </table>
                
                    <a href="/cadastroEquipe.html" class="text-center" style="text-decoration: none;">Voltar para tela de cadastro</a><br>
                    <a href="/menu.html" class="text-center" style="text-decoration: none;">Voltar para o menu</a>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    </body>
    </html>

    `);
    resp.end();
});


// cadastro e lista de jogadores
function cadastrarJogador (req, resp)
{
    const nomeJogador = req.body.nomeJogador;
    const equipe = req.body.equipe;
    const numeroJogador = req.body.numeroJogador;

    if(nomeJogador && equipe && numeroJogador)
    {
        listaJogador.push ({
            nomeJogador: nomeJogador,
            equipe: equipe,
            numeroJogador: numeroJogador
        });
        resp.redirect('/listarJogador');
    }
    else
    {
        resp.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            <title>Cadastro de Jogador</title>
        </head>
        <body>
        
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                  <a class="navbar-brand" href="menu.html">Campeonato amador de volei</a>
                  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                  </button>
                  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                      <a class="nav-link "  href="cadastroEquipe.html">Cadastro de equipe</a>
                      <a class="nav-link" href="cadastrarJogador.html">Cadastro de jogador</a>
                      <a class="nav-link " href="/logout">Sair</a>
                    </div>
                  </div>
                </div>
              </nav>
        
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <form action="/cadastrarJogador" method="POST">
                            <legend class="text-center mt-3">Cadastro de Jogador</legend>
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="nomeJogador">Nome</label>
                                    <input type="text" class="form-control" id="nomeJogador" name="nomeJogador" value="${nomeJogador}">
                                    `);

                                if(nomeJogador == "")
                                {
                                    resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha o nome corretamente</p>`);
                                }
                                resp.write(`
                                </div>
                                <div class="col-md-12">
                                    <label for="equipe">Raça</label>
                                    <input type="text" class="form-control" id="equipe" name="equipe" value="${equipe}">
                                    `);
                                    if(equipe == "")
                                    {
                                        resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha a equipe corretamente</p>`);
                                    }
                                    resp.write(`
                                </div>
                                <div class="col-md-12">
                                    <label for="numeroJogador">Numero do jogador</label>
                                    <input type="text" class="form-control" id="numeroJogador" name="numeroJogador" value="${numeroJogador}">
                                    `);
                                    if(numeroJogador == "")
                                    {
                                        resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha a numeroJogador corretamente</p>`);
                                    }
                                    resp.write(`
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
            
        </body>
        </html>
        `);

    }
    resp.end();
}
function cadastrarJogador (req, resp)
{
    const nomeJogador = req.body.nomeJogador;
    const equipe = req.body.equipe;
    const numeroJogador = req.body.numeroJogador;

    if(nomeJogador && equipe && numeroJogador)
    {
        listaJogador.push ({
            nomeJogador: nomeJogador,
            equipe: equipe,
            numeroJogador: numeroJogador
        });
        resp.redirect('/listarJogador');
    }
    else
    {
        resp.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            <title>Cadastro de Jogador/title>
        </head>
        <body>
        
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                  <a class="navbar-brand" href="menu.html">Campeonato Amador de volei</a>
                  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                  </button>
                  <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                      <a class="nav-link "  href="cadastroEquipe.html">Cadastro de equipes</a>
                      <a class="nav-link" href="cadastrarJogador.html">Cadastro de jogador</a>
                      <a class="nav-link " href="/logout">Sair</a>
                    </div>
                  </div>
                </div>
              </nav>
        
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <form action="/cadastrarJogador" method="POST">
                            <legend class="text-center mt-3">Cadastro de Jogador</legend>
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="nomeJogador">Nome</label>
                                    <input type="text" class="form-control" id="nomeJogador" name="nomeJogador" value="${nomeJogador}">
                                    `);

                                if(nomeJogador == "")
                                {
                                    resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha o nome corretamente</p>`);
                                }
                                resp.write(`
                                </div>
                                <div class="col-md-12">
                                    <label for="equipe">Raça</label>
                                    <input type="text" class="form-control" id="equipe" name="equipe" value="${equipe}">
                                    `);
                                    if(equipe == "")
                                    {
                                        resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha a raça corretamente</p>`);
                                    }
                                    resp.write(`
                                </div>
                                <div class="col-md-12">
                                    <label for="numeroJogador">Idade em anos</label>
                                    <input type="text" class="form-control" id="numeroJogador" name="numeroJogador" value="${numeroJogador}">
                                    `);
                                    if(numeroJogador == "")
                                    {
                                        resp.write(`<p style="color: white; background: lightcoral; padding: 5px; margin-top: 3px; border-radius: 6px;">Preencha a numeroJogador corretamente</p>`);
                                    }
                                    resp.write(`
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
            
        </body>
        </html>
        `);

    }
    resp.end();
}

app.get('/listarJogador', (req,resp) => {

    resp.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <title>Lista Jogador</title>
    </head>
    <body>

    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="menu.html">Campeonado Amador de volei</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <a class="nav-link "  href="cadastrarEquipe.html">Cadastro de equipe</a>
              <a class="nav-link" href="cadastrarJogador.html">Cadastro de jogador</a>
              <a class="nav-link " href="/logout">Sair</a>
            </div>
          </div>
        </div>
      </nav>

    <h2 class="text-center" style="margin-top: 50px;">Lista de Jogador</h2> 
        
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">Equipe</th>
                        <th scope="col">Numero da camisa</th>
                    </tr>
                    </thead>
                    <tbody>`);
                    for(let i=0; i<listaJogador.length; i++)
                    {
                        resp.write(`
                            <tr>
                                <td>${listaJogador[i].nomeJogador}</td>
                                <td>${listaJogador[i].equipe}</td>
                                <td>${listaJogador[i].numeroJogador}</td>
                            </tr>
                        `);
                    }
                    resp.write(`
                    </div>
                    </div>
                </div>
                    </tbody>
                </table>
                
                    <a href="/cadastroJogador.html" class="text-center" style="text-decoration: none;">Voltar para tela de cadastro</a><br>
                    <a href="/menu.html" class="text-center" style="text-decoration: none;">Voltar para o menu</a>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    </body>
    </html>

    `);
    resp.end();
});


app.get('/menu.html', (req, resp) => {
    
        resp.write(`
        
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <title>Menu</title>
</head>

<body>

    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="menu.html">Campeonato Amador de volei</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <a class="nav-link" href="cadastrarEquipe.html">Cadastro de equipe</a>
              <a class="nav-link" href="cadastrarJogador.html">Cadastro de jogador</a>
              <a class="nav-link" href="/logout">Sair</a>
            </div>
          </div>
        </div>
      </nav>

    `);

    resp.write('<p>');
    resp.write('Seu último acesso foi em ' + date);
    resp.write('</p>');

    
    resp.write(` 
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>
        
        `);
  });

app.use(usuarioEstaAutenticado,express.static(path.join(process.cwd(), 'protegido')));
app.post('/cadastrarEquipe', CadastrarEquipe);
app.post('/cadastrarJogador', cadastrarJogador);


app.listen(porta,host,() => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
})
