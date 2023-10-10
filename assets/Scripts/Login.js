// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


import { UserData } from './model/userdata';
import FMJava from "./FMJava";

cc.Class({
    extends: cc.Component,

    properties: {
        accountInput: {
            default: null,
            type: cc.EditBox
        },
        passwdInput: {
            default: null,
            type: cc.EditBox
        },
        loginNode: {
            default: null,
            type: cc.Node
        },


        loginImg: {
            default: null,
            type: cc.Node
        },
        wxButton: {
            default: null,
            type: cc.Node
        },
        yinsiNode: {
            default: null,
            type: cc.Node
        },
        oplabel: {
            default: null,
            type: cc.Node
        },
        serverSelector: {
            default: null,
            type: cc.Node
        },
        otherLoginNode: {
            default: null,
            type: cc.Node
        },
        appleNode: {
            default: null,
            type: cc.Node
        }
    },


    onLoad() {
        //初始化basseEvent``
        var contextNode = cc.find("context")
        if (contextNode) {
            this.context = contextNode.getComponent('Ctx')

        } else {
            cc.director.loadScene("Login");
            return
        }

        if (!this.context) {
            return
        }

        this.context.resetFitView(this.node)
        var _this = this
        this.serverMap = {}
        _this.serverSelectorObj = _this.serverSelector.getComponent('VLayoutSelectorItem')
        if (window.tt) {
            //隐藏普通登陆按钮
            this.disableInputLogin()
            this.loginImg.active = true
            var _this = this
            cc.props.showAd = true
            //隐藏普通登陆按钮
            this.ttLogin()
            tt.onTouchEnd(function () {
                if (cc.props.NowPage != "Login" || _this.wxButton.active == true) {
                    return
                }
                _this.context.loginInit(function () {
                    UserData.init(_this.context, cc.props.logininfo, function () {
                        _this.context.skipScene("Main")
                    })
                })
                // _this.onTouchEnd(_this)
            })
        } else if (window.qg) {

            //隐藏普通登陆按钮
            this.disableInputLogin()
            this.loginImg.active = true
            var _this = this
            this.oplabel.active = true
            this.opLogin()
        } else if (window.qq) {//确定是在qq真机环境下
            //隐藏普通登陆按钮
            this.disableInputLogin()
            this.loginImg.active = true
            _this.wxButton.active = true
            this.qqLogin()
        } else if (window.wx) {//确定是在微信真机环境下
            //隐藏普通登陆按钮
            this.disableInputLogin()
            this.loginImg.active = true
            _this.wxButton.active = true
            this.wxLogin()
        } else {
            // this.headerNode.active = false
            this.showInputLogin()
        }
        if (cc.sys.platform != cc.sys.ANDROID) {
            this.otherLoginNode.active = false
        }
        if (cc.sys.os === cc.sys.OS_IOS) {
            this.appleNode.active = true
        }
        cc.props.encryptKey = "hash"
        this.context.api.baseInfo(cc, function (res) {
            _this.context.setServerTime(res.server_time)
            if (res.encrypt_key != "") {
                // 不做实际使用 只做为开关混淆视听
                cc.props.encryptKey = res.encrypt_key
            }
            // res.server_list.push({
            //     "text": "决胜中途岛",
            //     "value": "server05"
            // })
            for (var i = 0; i < res.server_list.length; i++) {
                _this.serverMap[res.server_list[i].value] = res.server_list[i].text
            }

            cc.props.serverMap = _this.serverMap
            cc.props.ServerList = res.server_list
            cc.props.notice = res.notice

            _this.serverSelectorObj.init("", {
                "value": cc.props.ServerList
            })
        }, function (err) {
            console.log("login error", err)
        })
    },
    clickWLogin() {
        this.onTouchEnd(this)
    },
    onTouchEnd(_this) {
        if (_this.lockTemp || !_this.context || !_this.context.api) {
            cc.director.loadScene("Loading");
            return
        }
        cc.props.ServerKey = _this.serverSelectorObj.getValue()
        if (!cc.props.ServerKey) {
            this.context.Toast("请选择服务器")
            return
        }
        cc.props.ServerName = _this.serverMap[cc.props.ServerKey]

        if (window.wx && !window.tt && !window.qq) {
            _this.lockTemp = true
            var tmplIds = ['rUwQGeK6AWKFcfLUEmTp_9b1Or9CA0UzZduKWHhEgI8', 'RZGQyYfjuhUVSvKlA20U56vJmP-qeLDL4QhTIwCM1VI', '70UPAfjlxYnaTy-nYlGg2nkhVDWrpk2AbvUcvLnSJSE'] // 用户同意的消息模板id
            // 这里是获取下发权限地方，根据官方文档，可以根据  wx.getSetting() 的 withSubscriptions   这个参数获取用户是否打开订阅消息总开关。后面我们需要获取用户是否同意总是同意消息推送。所以这里要给它设置为true 。
            // 每次执到这都会拉起授权弹窗
            wx.requestSubscribeMessage({   // 调起消息订阅界面
                tmplIds: tmplIds,
                success(res) {
                    _this.lockTemp = false
                    var tempV = Array()
                    for (let key in res) {
                        if (key != "errMsg" && res[key] == "accept") {
                            tempV.push(key)
                        }
                    }
                    _this.context.api.updateTempKey(cc, tempV, function () {
                        _this.context.loginInit(function () {
                            UserData.init(_this.context, cc.props.logininfo, function () {
                                _this.context.skipScene("Main")
                            })
                        })
                    }, function () {
                        _this.context.loginInit(function () {
                            UserData.init(_this.context, cc.props.logininfo, function () {
                                _this.context.skipScene("Main")
                            })
                        })
                    })
                },
                fail(er) {
                    _this.lockTemp = false
                    // _this.context.Toast("订阅消息失败")
                    _this.context.loginInit(function () {
                        UserData.init(_this.context, cc.props.logininfo, function () {
                            _this.context.skipScene("Main")
                        })
                    })
                }
            })
        } else if (cc.props.logininfo && cc.props.logininfo.token) {
            _this.context.loginInit(function () {
                UserData.init(_this.context, cc.props.logininfo, function () {
                    _this.context.skipScene("Main")
                })
            })
        } else {
            this.context.Toast("正在链接服务器,请稍后再点击")
            return
        }
    },
    disableInputLogin() {
        this.accountInput.active = false
        this.passwdInput.node.active = false
        this.loginNode.active = false
    },
    showInputLogin() {

        this.accountInput.node.active = true
        this.passwdInput.node.active = true
        this.loginNode.active = true

        if (cc.sys.localStorage.getItem("lastAccount")) {
            this.accountInput.string = cc.sys.localStorage.getItem("lastAccount")
            this.passwdInput.string = cc.sys.localStorage.getItem("lastPasswd")

        }
    },
    opLogin() {
        var _this = this
        const { EQAPPKEY, EQVERSION } = require('./eq_qg/eq_qgconf.js'); require("./eq_qg/eq_qg.js");
        qg["eqapi"] && qg["eqapi"].init({ EQAPPKEY, EQVERSION });

        qg.login({
            success: function (res) {
                if (res.data) {
                    _this.context.api.opLogin(cc, "30838939", res.data.token, function (item) {
                        cc.props.logininfo = item
                        _this.wxButton.active = true
                        _this.lockTemp = false
                        // if (item.first_login == true) {
                        //     _this.yinsiClick()
                        // }
                        //     _this.initEQConfig(_this, item)

                    }, function (errMsg) {
                        console.log("api err:", errMsg)
                        _this.context.Toast(errMsg)
                        setTimeout(function () { _this.context.skipScene("Login") }, 2000);
                    })
                } else {
                    console.log("auth err:", errMsg)
                    _this.context.Toast('登录失败！' + res.errMsg)
                    //   setTimeout(function () { _this.context.skipScene("Login") }, 2000);

                }
            },
            fail: function (res) {
                // errCode、errMsg
                console.log("err:", JSON.stringify(res))
            }
        })





    },

    ttLogin() {
        var _this = this

        const { appId } = TMAConfig;

        cc.props.wxTopMenu = window.tt.getMenuButtonBoundingClientRect()
        // const { EQAPPKEY, EQVERSION, EQAUTH } = require('./eq_toutiao/eq_toutiao_conf.js'); require("./eq_toutiao/eq_toutiao.js");
        // tt["eqapi"] && tt["eqapi"].init({ EQAPPKEY, EQVERSION, EQAUTH });


        window.tt.login({
            success(res) {
                if (res.code) {
                    _this.context.api.ttLogin(cc, appId, res.code, function (item) {
                        cc.props.logininfo = item
                        // _this.initEQConfig(_this, item)
                        _this.wxButton.active = true
                        _this.lockTemp = false
                    }, function (errMsg) {
                        console.log("api err:", errMsg)
                        _this.context.Toast(errMsg)
                        setTimeout(function () { _this.context.skipScene("Login") }, 2000);
                    })
                } else {
                    console.log("auth err:", errMsg)
                    _this.context.Toast('登录失败！' + res.errMsg)
                    setTimeout(function () { _this.context.skipScene("Login") }, 2000);

                }
            }
        })
    },
    initEQConfig(_this, loginInfo) {
        // if (window.tt || window.qg) {
        //     tt["eqRegisterHandler"](function (data) {
        //         if (!data || !data.gameconfig || !data.gameconfig.config && data.gameconfig.config.account_config) {
        //             return
        //         }
        //         let user_config = data.gameconfig.config.account_config.filter(v => v.account_name === loginInfo.user_name)[0];
        //         let config = { ...data.gameconfig.config, ...user_config };
        //         //              {"ban":0,"DimandKey":"XBADD","account_name":"test","account_property":{"NoAd":true,"AutoExchange":true}}
        //         if (config.account_property && config.account_property.AutoExchange === true && config.DimandKey != "") {
        //             cc.props.NoAd = config.account_property.NoAd
        //             _this.context.api.ExchangeKey(cc, config.DimandKey, function () {
        //                 return
        //             }, function (err) {
        //                 return
        //             })
        //         }
        //         //

        //     })
        // }

    },
    onShareAppMessage(res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: '222222',
            path: '/page/user?id=123'
        }
    },
    qqLogin() {
        cc.props.logininfo.token = undefined
        var _this = this
        cc.sys.localStorage.setItem("token", "")

        window.qq.login({
            success(res) {
                if (res.code) {
                    _this.context.api.encryptData = {
                        encryptKey: res.code.substring(20, 32) + res.code.substring(0, 20),
                        iv: res.code.substring(10, 26),
                    }
                    _this.context.api.qqLogin(cc, cc.props.appID, res.code, function (item) {
                        _this.context.Toast("成功连接QQ服务")
                        cc.props.logininfo = item
                        cc.sys.localStorage.setItem("token", cc.props.logininfo.token)
                        //_this.showWxAuthButton()
                        _this.setWxFenxiang()
                        _this.firstLoginAlert(item.first_login)
                        _this.lockTemp = false
                        if (item.last_server && _this.serverMap[item.last_server]) {
                            _this.serverSelectorObj.setSelectedItem(item.last_server, _this.serverMap[item.last_server])
                        }
                    }, function (errMsg) {
                        console.log("api err:", errMsg)
                        _this.context.Toast(errMsg)
                        setTimeout(function () { _this.context.skipScene("Login") }, 2000);

                    })
                } else {
                    console.log("auth err:", errMsg)
                    _this.context.Toast('登录失败！' + res.errMsg)
                    setTimeout(function () { _this.context.skipScene("Login") }, 2000);

                }
            },
            fail(errMsg) {
                console.log("qq login err:", errMsg)

            }
        })

    },
    wxLogin() {

        var _this = this
        let appid = window.wx.getAccountInfoSync().miniProgram.appId
        cc.props.wxTopMenu = window.wx.getMenuButtonBoundingClientRect()
        cc.sys.localStorage.setItem("token", "")

        window.wx.login({
            success(res) {
                const userCryptoManager = wx.getUserCryptoManager()
                userCryptoManager.getLatestUserKey({
                    success: function (encryptData) {
                        _this.context.api.encryptData = encryptData
                        if (res.code) {
                            _this.context.api.wxLogin(cc, appid, res.code, function (item) {
                                cc.props.logininfo = item
                                cc.sys.localStorage.setItem("token", cc.props.logininfo.token)
                                //_this.showWxAuthButton()
                                _this.setWxFenxiang()
                                _this.lockTemp = false
                                if (item.last_server && _this.serverMap[item.last_server]) {
                                    _this.serverSelectorObj.setSelectedItem(item.last_server, _this.serverMap[item.last_server])
                                }
                            }, function (errMsg) {
                                console.log("api err:", errMsg)
                                _this.context.Toast(errMsg)
                                setTimeout(function () { _this.context.skipScene("Loading") }, 2000);

                            })
                        } else {
                            console.log("auth err:", res)
                            _this.context.Toast('登录失败！' + res.errMsg)
                            setTimeout(function () { _this.context.skipScene("Loading") }, 2000);

                        }
                    }
                })

            }
        })



    },

    setWxFenxiang() {
        if (window.wx) {

            if (window.qq) {
                qq.showShareMenu({
                    showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
                })
                qq.onShareAppMessage(() => {
                    return {
                        title: '邀请你一起体验战争策略，指尖二战',
                        query: 'user_id=' + cc.props.logininfo.user_id,
                        shareTemplateId: "EE558DDCEFB407FD811CC6C06181D6AF",
                        shareTemplateData: { "txt1": "指尖二战，经典策略游戏", "txt2": "我也要玩" }
                    }
                })
            } else {
                wx.showShareMenu({
                    withShareTicket: true,
                    menus: ['shareAppMessage', 'shareTimeline']
                })

                wx.onShareTimeline(() => {
                    return {
                        title: '邀请你一起体验战争策略，指尖二战',
                        imageUrlId: 'xmENRyYoQf+0iwkLyfOgyQ==', // 图片 URL
                        query: 'user_id=' + cc.props.logininfo.user_id
                    }
                })

                wx.onShareAppMessage(() => {
                    return {
                        title: '邀请你一起体验战争策略，指尖二战',
                        imageUrlId: 'xmENRyYoQf+0iwkLyfOgyQ==', // 图片 URL
                        query: 'user_id=' + cc.props.logininfo.user_id,
                        toCurrentGroup: false
                    }
                })
                // wx.createGameClubButton({
                //     icon: 'white',
                //     text: "二战圈",
                //     style: {
                //         left: 10,
                //         top: 76,
                //         width: 30,
                //         height: 30,
                //     }
                // })

            }



        }

    },


    onLogin() {
        var data = {}
        var _this = this
        data.account = this.accountInput.string
        data.passwd = this.passwdInput.string
        var context = this.context

        if (!context) {
            this.reloadPage()
            return
        }
        if (!data.account || !data.passwd) {
            context.Toast("账号密码不能为空")
            return
        }
        var t = "78361b0cb24e4b93b739c7e3aa28f013"
        cc.props.logininfo.token = undefined
        cc.sys.localStorage.setItem("token", "")
        if (this.accountInput.string) {
            cc.sys.localStorage.setItem("lastAccount", this.accountInput.string)
            cc.sys.localStorage.setItem("lastPasswd", this.passwdInput.string)
        }


        context.api.encryptData = {
            encryptKey: t.substring(20, 32) + t.substring(0, 20),
            iv: t.substring(10, 26),
        }
        context.api.requestAPI(cc, "POST", "/auth/login", data, function (res) {
            cc.props.logininfo = res
            console.log(":::", JSON.stringify(cc.props.logininfo))
            cc.sys.localStorage.setItem("token", cc.props.logininfo.token)
            context.loginInit(function () {
                UserData.init(context, cc.props.logininfo, function () {
                    _this.accountInput.string = ""
                    _this.passwdInput.string = ""
                    context.skipScene("SelectServer")
                })
            })

        }, function (errMsg) {
            console.log("login err:", errMsg)
            context.Toast(errMsg)

        })
        // 
    },
    goTORegister() {
        this.context.skipScene("Register");
    },
    appleLogin() {
        FMJava.AppleLogin()
    },
    visitorLogin() {
        this.context.skipScene("VisitorRegister");
    },
    fuwuClick(firstLogin) {
        let _this = this
        var alter2Node = _this.context.NewAlert2()
        let eventNodeItem = _this.context.newAlertItem()
        alter2Node.InitAlert("服务协议", "同意")

        cc.assetManager.loadRemote(cc.props.fuwuxieyi, (err, textAsset) => {
            alter2Node.addNewLine("text_mid", "", { "text": "《服务协议》" })
            alter2Node.addNewLine("text_mid", "", { "text": "" })
            alter2Node.addNewLine("wrap_high_text", "", { "text": textAsset.text })
        });

        alter2Node.OnButtonFunc = function () {
            cc.sys.localStorage.setItem("hasShowYinsi", "true")
            alter2Node.onButtonCancel()
        }
        alter2Node.btnCancel.active = false
        alter2Node.AddButton(eventNodeItem.funcs["refuseXieyi"])
        alter2Node.Alert()
    },
    firstLoginAlert(firstLogin) {
        if (!firstLogin) {
            return
        }
        let _this = this
        var alter2Node = _this.context.NewAlert2()
        let eventNodeItem = _this.context.newAlertItem()

        alter2Node.InitAlert("提示", "同意")
        alter2Node.addNewLine("text_mid", ">>>>>>>>", {
            "text": "请阅读隐私协议",
            "cusButtonText": "阅读",
        }, function () {
            _this.yinsiClick()
        })
        alter2Node.addNewLine("text_mid", ">>>>>>>>", {
            "text": "请阅读用户协议",
            "cusButtonText": "阅读",
        }, function () {
            _this.fuwuClick()
        })

        alter2Node.OnButtonFunc = function () {
            alter2Node.onButtonCancel()
        }
        alter2Node.btnCancel.active = false
        alter2Node.AddButton(eventNodeItem.funcs["refuseXieyi"])
        alter2Node.Alert()

    },
    yinsiClick() {

        let _this = this
        var alter2Node = _this.context.NewAlert2()
        let eventNodeItem = _this.context.newAlertItem()

        alter2Node.InitAlert("隐私协议", "同意")
        cc.assetManager.loadRemote(cc.props.yinsixieyi, (err, textAsset) => {
            alter2Node.addNewLine("wrap_high_text", "", { "text": textAsset.text })
        });
        alter2Node.OnButtonFunc = function () {
            alter2Node.onButtonCancel()
        }
        alter2Node.btnCancel.active = false
        alter2Node.AddButton(eventNodeItem.funcs["refuseXieyi"])
        alter2Node.Alert()
    },
    start() {
        if (!this.context) {
            cc.director.loadScene("Login");
            return
        }

        cc.sys.localStorage.setItem("token", "")
        if (!cc.props.alreadyUpdate) {
            this.context.HotUpdate()
            cc.props.alreadyUpdate = true
        }
        if (!cc.sys.localStorage.getItem("hasShowYinsi")) {
            if (cc.sys.platform != cc.sys.ANDROID && (window.qq || cc.sys.os === cc.sys.OS_IOS)) {
                this.firstLoginAlert(true)
            }
        }
        FMJava.InitSdk()
        this.context.AddHeaderUI(this.node)

    },
    taptapLogin() {
        if (cc.sys.platform == cc.sys.ANDROID) {
            FMJava.taptapInit()
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            // TODO 加上IOS的ShowVideo
            context.Toast("暂不支持，敬请期待")
        }
    },
    wxClickLogin() {
        context.Toast("暂不支持，敬请期待")
    },
});
