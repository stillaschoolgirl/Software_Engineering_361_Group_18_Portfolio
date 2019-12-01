var express = require('express');
var app = express();

var bodyParser = require('body-parser');
const url = require('url');

var session = require('express-session');
var mysql = require('./dbcon.js');

let hbs = require('express-handlebars').create({
    defaultLayout: 'main',
    extname: 'hbs',
    layoutDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'password',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        path: '/',
	secure: false,
        httpOnly: true,
        maxAge: 600 * 100000
    }

}));
app.use(express.static('public'));

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('port', 10001);

let cssFile;
app.get(`/css/${cssFile}`, function(req,res){
    res.send(`/css/${cssFile}`);
    res.end;
});
let jsFile;
app.get(`/js/${jsFile}`, function(req,res){
    res.send(`/js/${jsFile}`);
    res.end();
});
let imgFile;
app.get(`/img/${imgFile}`, function(req,res){
    res.send(`/img/${imgFile}`);
    res.end();
});

app.get('/', function(req,res){
	var context = {};
	res.render('home', context);
});

app.get('/login',function(req,res){
    var context = {};
    context.title = 'Login page';
    context.script = ['login.js'];
    res.render('login',context);
});
app.post('/login',function(req,res){
    let context = {};
    let sql = `SELECT username,password FROM users WHERE username=?`;
    let values = req.body.username;
    
    mysql.pool.query(sql,values,results => {
	if(results && results[0] && results[0].password === req.body.password)
	    res.render('landingPage');
	else{
	    context.invalidCredentials = true;
	    res.send(context);
	}
    });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
