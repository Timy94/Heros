const url = require('url');
const path = require('path');
const formidable = require('formidable');


const AuxRes = require('./AuxRes');

const dataModel = require('./dataModel');


module.exports = {
    // //测试用接口
    // test: function (req, res) {
    //     res.send('测试接口');
    // },
    //检测用户名是否有效
    validUserName: function (req, res) {
        let obj = url.parse(req.url, true).query;
        // dataModel.queryUser(obj, {
        //     fail: err => { //查询失败
        //         res.json({
        //             code: 500,
        //             msg: '服务器异常'
        //         });
        //     },
        //     success: hasUser => { //查询成功
        //         res.json({
        //             code: hasUser ? 201 : 200,
        //             msg: hasUser ? '用户名不可用' : '用户名可用'
        //         })
        //     }
        // });
        dataModel.queryUser( //查询用户
            obj, //要查询的数据
            AuxRes(res, hasUser => { //测试辅助响应类，以简化代码,查询成功的回调
                res.json({
                    code: hasUser ? 201 : 200,
                    msg: hasUser ? '用户名不可用' : '用户名可用'
                })
            })
        );
    },
    // 实现注册
    doReg: function (req, res) {
        dataModel.registUser( //数据注册
            req.body, //新增的用户数据
            AuxRes(res, () => { //成功回调
                res.json({
                    code: 200,
                    msg: '测试成功'
                });
            })
        );
    },
    // 实现登录
    doLogin: function (req, res) {
        dataModel.queryUser( //查询用户
            req.body, //要查询的数据
            AuxRes(res, userData => { //查询成功的回调
                if (userData) req.session.username = userData.username; //存在用户数据，则将用户名存入session，实现登录状态保存
                res.json({
                    code: userData ? 200 : 201,
                    msg: userData ? '登录成功' : '用户名或密码错误'
                });
            })
        )
    },
    //根据登录状态获取首页
    getIndex: function (req, res) {
        if (!req.session.username) { //不存在登陆状态，则重定向登录页面
            res.redirect('./login.html');
            return;
        }
        dataModel.getHeros( //获取英雄列表
            req.session.username, //指定用户
            AuxRes(res, heros => { //成功获取的回调
                res.render('index.html', { //服务器端动态渲染首页
                    heros,
                    username: req.session.username
                });
            })
        )
    },
    //退出登录
    logout: function (req, res) {
        req.session.username = null;
        res.redirect('./login.html');
    },
    // 实现图片上传
    uploadImage: function (req, res) {
        let form = new formidable.IncomingForm(); //实例化
        form.encoding = 'utf-8'; //设置编码格式
        form.keepExtensions = true; //保持扩展名
        form.uploadDir = __dirname + '/public/images'; //文件存放路径

        //解析请求体中的表单数据
        form.parse(req, (err, fields, files) => {
            res.json({
                code: err ? 500 : 200,
                msg: err ? '服务器异常' : '上传成功',
                img: err ? undefined : path.basename(files.img.path)
            });
        });
    },
    // 实现英雄添加
    addHero: function (req, res) {
        dataModel.addHero(
            req.session.username, //指定用户
            req.body, //新增英雄信息 
            AuxRes(res, () => { //成功回调
                res.json({
                    code: 200,
                    msg: '添加成功'
                })
            })
        );
    },
    // 获取编辑页面
    getEdit: function (req, res) {
        let id = url.parse(req.url, true).query.id;
        dataModel.getHeros(
            req.session.username, //指定用户
            AuxRes(res, heros => { //成功获取英雄列表
                res.render('edit.html', heros.filter(v => v.id == id)[0]) //根据指定id的英雄渲染编辑页面
            })
        )
    },
    //实现英雄编辑
    editHero: function (req, res) {
        dataModel.editHero(
            req.session.username, //指定用户
            req.body, //英雄数据
            AuxRes(res, () => { //成功回调
                res.json({
                    code: 200,
                    msg: '编辑成功'
                });
            })
        )
    },
    //实现英雄删除
    deleteHero: function (req, res) {
        let id = url.parse(req.url, true).query.id;
        dataModel.deleteHero(
            req.session.username, //指定用户
            id, //指定英雄id
            AuxRes(res, () => { //成功回调
                res.json({
                    code: 200,
                    msg: '删除成功'
                });
            })
        )
    }
}