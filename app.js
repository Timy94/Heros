const express = require('express');
const path = require('path');
const session = require('express-session');
const router = require('./router');
const bodyParser = require('body-parser');


const app = express();

//端口监听
app.listen(3002, () => {
    console.log('http://127.0.0.1:3002');
});

//设置模板引擎
app.engine('html', require('express-art-template'));
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production'
});
app.set('views', path.join(__dirname, './views'));


//使用body-parser中间件
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//使用session中间件
app.use(session({
    secret: 'hero-list',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 10 //保存时间 10min
    }
}));


//托管静态资源
app.use(express.static('public'));

//分配路由
app.use(router);
//托管静态页面
app.use('/', express.static(path.join(__dirname, 'views')));