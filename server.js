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
app.use(bodyParser.raw());
app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, '/public'));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('port', 5583);

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

var globalList = [];

app.get('/', function(req,res){
    var context = {};
    context.loggedIn = req.session.loggedIn;
    context.css = ['style.css'];
    res.render('home', context);
});

app.get('/logout',function(req,res){
    var context = {};
    context.title = 'Logged Out';
    context.script = ['login.js'];
    context.css = ['style.css'];
    req.session.destroy();
    res.render('login',context);
});

app.get('/login',function(req,res){
    var context = {};
    context.title = 'Login page';
    context.script = ['login.js'];
    context.css = ["style.css"];
    res.render('login',context);
});

app.post('/login',function(req,res){
    let context = {};
    let sql = `SELECT id,username,password FROM users WHERE username=?`;
    let values = req.body.username;

    mysql.pool.query(sql,values,(err,results) => {

	if(results && results[0] && results[0].password === req.body.password){
	    req.session.loggedIn = true;
	    req.session.userId = results[0].id;
	    res.redirect('/storeSearch');
	}
	else{
	    context.invalidCredentials = true;
	    context.css = ['style.css'];
	    context.script = ['login.js'];
	    res.render('login',context);
	}
    });
});

//to display page to search for store
app.get('/storeSearch', function (req, res){
    var context = {};
    context.css = ['style.css'];
    res.render('storeSearch', context);
});
app.get('/productSearch',(req,res) => {
    let context = {};
    let sql = `SELECT * FROM products WHERE product_name LIKE ?`;
    let values = [`%${req.query.searchQuery}%`];
    mysql.pool.query(sql,values,(err, results, fields) => {
	if (err){
	    next(err);
	    return;
	}
	res.send(results);
    });
});
app.get('/buildList',(req,res) => {
    var context = {};
//    context.loggedIn = req.session.loggedIn;
    context.title = 'Create Shopping List';
    context.script = ['buildList.js'];
    context.css = ['buildList.css'];
    console.log(context);
    res.render('buildList',context);
});
app.get('/getAllDepartments',(req,res) => {
    var context = {};
    let sql = `SELECT * FROM departments`;
    mysql.pool.query(sql,null,(err, results, fields) => {
	if (err){
	    next(err);
	    return;
	}
	res.send(results);
    });
});
app.post('/saveList',(req,res) => {
    var context = {};
    let sql = `INSERT INTO lists (userid,listname,num_items) VALUES (?,?,?)`;
    let values = [
	req.session.loggedIn ? req.session.userId : 0,
	req.body.listName,
	req.body.list.length
    ];
    new Promise((resolve,reject) => 
		mysql.pool.query(sql,values,(err, res, fields) => err ? reject(err) : resolve(res))
    )
	.then((results) => {
	    let listResults = [];
	    sql = `INSERT INTO lists_products (list_id,product_id) VALUES (?,?)`;
	    req.body.list.forEach(item => {
		values = [results.insertId,item.id];
		console.log(sql);
		console.log(values);
		listResults.push(new Promise((resolve,reject) =>
		    mysql.pool.query(sql,values,(err,res) => err ? reject(err) : resolve(res))
		));
	    });
	    Promise.all(listResults)
		.then(() => res.send(context.success = true))
		.catch((err) => res.send(context.success = false));
	})
	.catch((err) => {
	    console.log(err);
	    res.send(context.success = false);
	})
});

//to show all stores existing in database
app.get('/showAllStores', function(req, res){
	var context = {};
	var queryString = "Select * FROM stores";
	mysql.pool.query(queryString, function(err, rows, fields){
		if (err){
			next(err);
			return;
		}
		var params = [];
		for (var row in rows){
			var addStore = {
				'name':rows[row].name,
				'address':rows[row].address,
				'city':rows[row].city,
				'state':rows[row].state,
				'zipcode':rows[row].zipcode
				};
			params.push(addStore);
		}
		context.results = params;
	        context.css = ['style.css'];
		context.script = ['mapLinks.js'];
		res.render('showStores', context);
	});
});

//to display page showing search results
app.get('/storeSearchResults', function (req, res){
	var context = {};
	var andRequired = false;
	var queryString = "SELECT * FROM stores WHERE ";
	
	//if name field was not empty
	if(req.query.name != ""){
		queryString += "name='" + req.query.name + "'";
		andRequired = true;
	}
	
	//if address field was not empty
	if (req.query.address !=""){
		if (andRequired){
			queryString += " AND "
		}
		queryString += "address='" + req.query.address + "'";
		andRequired = true;
	}
	
	//if city field was not empty
	if (req.query.city !=""){
		if (andRequired){
			queryString += " AND "
		}
		queryString += "city='" + req.query.city + "'";
		andRequired = true;
	}
	
	//if state field was not default
	if (req.query.state !="0"){
		if (andRequired){
			queryString += " AND "
		}
		queryString += "state='" + req.query.state + "'";
		andRequired = true;
	}
	
	//if zipcode field was not empty 
	if (req.query.zipcode !=""){
		if (andRequired){
			queryString += " AND "
		}
		queryString += "zipcode='" + req.query.zipcode + "'";
		andRequired = true;
	}
	
	mysql.pool.query(queryString, function(err, rows, fields){
		if (err){
			next(err);
			return;
		}
		var params = [];
		for (var row in rows){
			var addStore = {
				'name':rows[row].name,
				'address':rows[row].address,
				'city':rows[row].city,
				'state':rows[row].state,
				'zipcode':rows[row].zipcode,
				'map_link':rows[row].map_link
			};
			params.push(addStore);
		}
		context.results = params;
	    context.css = ['style.css'];
		res.render('showStores', context);
	});
});

//To build a list
app.get('/buildList', function(req, res){
    for (var p in req.query) {
		if ( req.query[p] != 'submit'){
         globalList.push({ name: p, value: req.query[p] });
		}
    }
	console.log(globalList);
    var fill = {};
    fill.queryList = globalList;
    res.render('buildList', fill);
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
