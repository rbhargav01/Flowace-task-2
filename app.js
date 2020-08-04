//imports
var alert=require('alert-node')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

//routes
//var indexRouter = require('./routes/index');
var login=require('./routes/login');
var forgot=require('./routes/forgot');
var signup=require('./routes/signup');
//var cart1=require('./routes/cart');

//var aboutus = require('./routes/about');
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//mongoose setup
const mongoose = require('mongoose');
//You need to have an account created ib mongoose and use connect url directly
mongoose.connect('mongodb+srv://'+process.env.username+':'+process.env.password+process.env.url+'/'+process.env.dbname);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('connect');
});

//default
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(__dirname + '/public'));

//Tables Schema
var userSchema = new mongoose.Schema({
  username: { type: String }
  , password: {type: String}
  , name: { type: String }
  , security_question: {type: String}
  , security_answer: {type: String}
});
var cartSchema1 = new mongoose.Schema({
    username: {type:String},
    itemname: {type:String},
    itemprice: {type:String}
});
var transactionsSchema=new mongoose.Schema({
    username:{type : String},
    itemname:{type : String},
    itemprice:{type : Number},
    timestamp:{type : String}
});

var User = mongoose.model('User', userSchema);
var Cart1 = mongoose.model('Cart1', cartSchema1);
var Transactions = mongoose.model('Transactions', transactionsSchema);
var username;
//app.use('/', indexRouter);

app.use('/', login);
app.use('/forgot', forgot);
app.use('/sign-up', signup);
//app.use('/cart/', cart1);
//app.use('/read',cart);

app.post('/sign-up-complete', function (req,res) {
    var psw = req.body.psw;
    var pswrepeat = req.body.pswrepeat;
    if(psw==pswrepeat) {
        User.find({username : req.body.username},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            if (items.length>0) {
                alert("Username already exists");
                res.render('sign-up');
            }
            else{
                var user = new User({
                    username: req.body.username
                    , password: psw
                    , name: req.body.name
                    , security_question: req.body.security_question
                    , security_answer: req.body.security_answer
                });
                user.save(function (err, use) {
                    if (err) return console.error(err);
                    alert("Account created");
                });
                username = req.body.username;
                res.render('home', {username: req.body.username});
            }
        });
    }

    else{
        alert("Entered passwords don't match");
    }
});

app.post('/check', async function (req,res) {
    //alert("Invalid username or password");
    User.find({username:req.body.username, password:req.body.password },function(err, items) {
        if (err) return alert(err);
        if(items.length>0){
            username=req.body.username;
            res.render('home',{username:req.body.username});
        }
        else{
            alert("Invalid username or password");
        }
    });
});

app.get('/home',function(req,res){
    res.render('home',{username:username});
});

app.post('/security', function (req,res) {
    //alert("Invalid username or password");
    User.find({username:req.body.username},function(err, items) {
        if (err) return alert(err);
        if(items.length>0){
            //alert(items);
            res.render('security',{items: items});
        }
        else{
            alert("No such username");
        }
    });
});

app.post('/check-security', function (req,res) {
    //alert("Invalid username or password");
    //alert(req.body.security_answer_given);
    //alert(req.body.security_answer);
    if(req.body.security_answer==req.body.security_answer_given){
        res.render('forgot',{username:req.body.username});
    }
    else{
        alert("Incorrect Answer");
    }
});

app.post('/password-changed', function (req,res) {
    //alert("Invalid username or password");
    var psw = req.body.psw;
    var pswrepeat = req.body.pswrepeat;
    if(psw==pswrepeat){
        var query = {username:req.body.username};
        var update = {password:psw};
        var options = { multi: true};

        User.find({username:req.body.username},function(err, items) {
            if (err) return alert(err);
            if(items.length>0) {
                User.findOneAndUpdate(query, update, options, function (err, result) {
                    if (err) return console.error(err);
                    console.dir(result);
                    alert("Passsword Changed");
                    username = req.body.username;
                    res.render('home', {username: req.body.username});
                });
            }
            else{
                alert("Username does not exist");
            }
        });
        /*
        const userdetails1=User.find({username:req.body.username},function(err, items) {
            if (err) return alert("Invalid username or password");
        });
        userdetails1.set({
            password:psw
        });
        userdetails1.save(function(err, use) {
            if (err) return console.error(err);
            alert("Passsword Changed");
        });
         */
    }
    else{
        alert("Entered passwords don't match");
    }
});

app.use('/cart' ,
    function (req, res ){
        Cart1.find({username : username},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                res.render('cart', {items:items});
            }
            else{
                alert("Oops!! You have no items in your cart yet. Add items to your Cart and checkout from your Cart now!!");
                res.render('home',{username:username});
            }
        });
    });

app.use('/transactions' ,
    function (req, res ){
        Transactions.find({username : username},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                res.render('transactions', {items:items});
            }
            else{
                Cart1.find({username : username},function(err, items) {
                    if (err) return console.error(err);
                    //console.dir(shop);
                    //alert("HI!!");
                    //alert(items);
                    if(items.length>0){
                        alert("You have not made any purchases yet. Checkout from your Cart now!!");
                        res.render('cart', {items:items});
                    }
                    else{
                        alert("Oops!! You have not made any purchases nor any items in your cart yet. Add items to your Cart and checkout from your Cart now!!");
                        res.render('home',{username:username});
                    }
                });
            }

        });
    });

app.post( '/buy',
        async function (req, res ){
            //alert(req.body.item_buy_username+" "+req.body.item_buy_itemname+" "+req.body.item_buy_itemprice);
            var transactions = new Transactions({
                username: req.body.item_buy_username,
                itemname: req.body.item_buy_itemname,
                itemprice:req.body.item_buy_itemprice,
                timestamp:getCurTime()
            });
            await transactions.save(async function(err, use) {
                if (err) return console.error(err);
                alert(req.body.item_buy_itemname + " has been purchased for $" + req.body.item_buy_itemprice);

            await Cart1.find({username:req.body.item_buy_username, itemname:req.body.item_buy_itemname }).remove().exec(async function callback (err, numAffected) {
                if (err) return console.error(err);
                console.dir(numAffected);
                //alert("Item removed from cart");

                await Cart1.find({username : username},function(err, items) {
                    if (err) return console.error(err);
                    //console.dir(shop);
                    //alert("HI!!");
                    //alert(items);
                    res.render('cart', {items:items});
                });
            });
            });
});
app.post( '/delete',
    function (req, res ) {

        Cart1.find({
            username: req.body.item_remove_username,
            itemname: req.body.item_remove_itemname
        }).remove().exec(function callback(err, numAffected) {
            if (err) return console.error(err);
            console.dir(numAffected);
            alert("Item removed from cart");
            Cart1.find({username: req.body.item_remove_username}, function (err, items) {
                if (err) return console.error(err);
                //console.dir(shop);
                //alert("HI!!");
                //alert(items);
                res.render('cart', {items: items});
                //res.render('message', {
                //  message: 'Item updated ' + numAffected
                //});
            });

        });
    });
app.post( '/shopping-samsung',
    function (req, res ){
        var cart1 = new Cart1({
            username: username,
            itemname:"Samsung",
            itemprice:800
        });
        Cart1.find({username : username,itemname:"Samsung"},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                alert("You already have this item in your cart. Complete the purchase of this item to purchase more!!");
            }
            else{
                cart1.save(function(err, use) {
                    if (err) return console.error(err);
                    alert("Item added to cart");
                });

            }
        });

    }
);
app.post( '/shopping-oneplus',
    function (req, res ){
        var cart1 = new Cart1({
            username: username
            , itemname:"OnePlus",
            itemprice:600
        });
        Cart1.find({username : username,itemname:"OnePlus"},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                alert("You already have this item in your cart. Complete the purchase of this item to purchase more!!");
            }
            else{
                cart1.save(function(err, use) {
                    if (err) return console.error(err);
                    alert("Item added to cart");
                });

            }
        });
    }
);
app.post( '/shopping-redmi',
    function (req, res ){
        var cart1 = new Cart1({
            username: username
            , itemname:"Redmi",
            itemprice:400
        });
        Cart1.find({username : username,itemname:"Redmi"},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                alert("You already have this item in your cart. Complete the purchase of this item to purchase more!!");
            }
            else{
                cart1.save(function(err, use) {
                    if (err) return console.error(err);
                    alert("Item added to cart");
                });

            }
        });
    }
);
app.post( '/shopping-oppo',
    function (req, res ){
        var cart1 = new Cart1({
            username: username
            , itemname:"Oppo",
            itemprice:500
        });
        Cart1.find({username : username,itemname:"Oppo"},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                alert("You already have this item in your cart. Complete the purchase of this item to purchase more!!");
            }
            else{
                cart1.save(function(err, use) {
                    if (err) return console.error(err);
                    alert("Item added to cart");
                });

            }
        });
    }
);
app.post( '/shopping-vivo',
    function (req, res ){
        var cart1 = new Cart1({
            username: username
            , itemname:"Vivo",
            itemprice:500
        });
        Cart1.find({username : username,itemname:"Vivo"},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                alert("You already have this item in your cart. Complete the purchase of this item to purchase more!!");
            }
            else{
                cart1.save(function(err, use) {
                    if (err) return console.error(err);
                    alert("Item added to cart");
                });

            }
        });
    }
);
app.post( '/shopping-apple',
    function (req, res ){
        var cart1 = new Cart1({
            username: username
            , itemname:"iPhone",
            itemprice:1000
        });
        Cart1.find({username : username,itemname:"iPhone"},function(err, items) {
            if (err) return console.error(err);
            //console.dir(shop);
            //alert("HI!!");
            //alert(items);
            if(items.length>0){
                alert("You already have this item in your cart. Complete the purchase of this item to purchase more!!");
            }
            else{
                cart1.save(function(err, use) {
                    if (err) return console.error(err);
                    alert("Item added to cart");
                });

            }
        });
    }
);

function getCurTime(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let CurTime=year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    return CurTime;
}

module.exports = app;

