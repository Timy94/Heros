const express = require('express');
const handler = require('./handler');


const router = module.exports = express.Router(); //生成路由模块

router
    // .get('/test', handler.test) //测试接口
    .get('/', handler.getIndex) //获取首页
    .get('/index', handler.getIndex) //获取首页
    .get('/edit.html', handler.getEdit) //获取编辑页
    .get('/validUserName', handler.validUserName) //检测用户名
    .get('/logout', handler.logout) //退出登录
    .post('/register', handler.doReg) //实现注册
    .post('/login', handler.doLogin) //实现登录
    .post('/uploadImage', handler.uploadImage) //实现图片上传
    .post('/add', handler.addHero) //实现英雄添加
    .post('/edit', handler.editHero) //实现英雄编辑
    .get('/delete', handler.deleteHero) //实现英雄删除