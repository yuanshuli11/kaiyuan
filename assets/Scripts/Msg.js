// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { UserData } = require("./model/userdata");

cc.Class({
    extends: cc.Component,

    properties: {
        VLayoutNode: {
            default: null,
            type: cc.Node
        },
        turnPageNode: {
            default: null,
            type: cc.Node
        },
        turnPageNode: {
            default: null,
            type: cc.Node
        },
        TabNewNode: {
            default: null,
            type: cc.Node
        },
        View: {
            default: null,
            type: cc.ScrollView
        },
        flushButton: {
            default: null,
            type: cc.Button
        },
        sendButton: {
            default: null,
            type: cc.Button
        },

    },

    // LIFE-CYCLE CALLBACKS:
    flushMsg() {
        this.flushButton.interactable = false
        if (!this.nodeName) {
            this.context.reloadPage()
        } else {
            this.reloadPage(this.nodeName)
        }

    },
    sendMsg() {

        // 完成私聊消息
        let context = this.context
        var alter2Node = context.NewAlert2()
        alter2Node.InitAlert("发送消息", "发送")

        var neweventNodeItem = context.newAlertItem()
        neweventNodeItem.alertNode = alter2Node
        // neweventNodeItem.attr = attr
        alter2Node.addNewLine("text", "", { "text": "" })
        alter2Node.addNewLine("text", "", { "text": "" })

        let msgNode = alter2Node.addNewLine("input_long", "内容:", { "value": "", "placeholder": "消息内容", "maxLength": 32, "itemKey": "sendMsg" })

        var _this = this
        alter2Node.OnButtonFunc = function () {
            if (msgNode.getValue() == "") {
                context.Toast("消息不能为空")
                return
            }
            context.api.SendMsg(cc, cc.props.userInfo.group_id, _this.msgType, msgNode.getValue(), function (res) {
                alter2Node.onButtonCancel()
                context.Toast("发送成功")
                _this.msgList.push(res)
                _this.loadChatList(_this)

            }, function (errMsg) {
                alter2Node.onButtonCancel()
                context.Toast(errMsg)
            })
        }
        alter2Node.Alert()
    },
    start() {
        if (!this.context) {
            cc.director.loadScene("Login");
            return
        }
        // if (window.tt && window.tt.getLaunchOptionsSync().extra.mpVersion == "")
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
    },
    onLoad() {
        this.timeNum = 0
        this.flushButton.interactable = false

        if (!cc.props.userInfo || !cc.props.userInfo.user_id) {
            context.skipScene("Main")
            return
        }

        this.nowPage = 0
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        this.context.resetFitView(this.node)


        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')
        this.VLayoutNewNodeObj.init(this)

        this.turnPageObj = this.turnPageNode.getComponent('Pageaction')
        this.dataInfo = []
        var _this = this
        this.lockClick = false
        let ls = this.getTab()
        var _this = this

        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.nodeName = nodeName
            _this.reloadPage(nodeName)
        })
    },
    reloadPage(nodeName) {
        var _this = this
        _this.tabName = nodeName
        _this.cleanContent()

        switch (nodeName) {
            case "UserChat":
                _this.msgType = 50
                _this.showChatList()
                return
            case "WordChat":
                _this.msgType = 20
                _this.showWorldChat()
                return
            case "SysChat":
                _this.msgType = 90
                _this.showSysChat()
                return
            case "GroupChat":
                _this.msgType = 10
                _this.showGroupChat()

                return
                // case "":   
                //     _this.showGroupHandler()
                return
        }
    },

    showChatList() {
        //  
        this.flushButton.node.active = false
        this.sendButton.node.active = false
        let _this = this

        this.context.api.getUserChatList(cc, function (res) {
            if (!res.data || res.data.length == 0) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无私聊</c>" })
                return
            }
            UserData.user.userChatList = res.data
            _this.loadUserChatList()

        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.lockClick = false

        })
    },
    loadUserChatList() {
        if (!UserData.user.userChatList) {
            return
        }
        let _this = this
        _this.cleanContent()
        for (var i = 0; i < UserData.user.userChatList.length; i++) {
            (function (chatItem) {
                _this.VLayoutNewNodeObj.addNewLine("chat_text", "", {
                    "chatItem": chatItem,
                }, function (attr) {
                    var eventNodeItem = _this.context.newAlertItem()
                    eventNodeItem.context = _this.context
                    eventNodeItem.chatItem = attr.chatItem
                    eventNodeItem.callback = () => {
                        _this.loadUserChatList()
                    }
                    _this.context.AlertFunc.UserChatItem(null, _this.context, eventNodeItem)
                })
            })(UserData.user.userChatList[i])
        }
        setTimeout(function () {
            if (_this.View) {
                _this.View.scrollToTop(0.1)
            }
        }, 100);
    },
    loadChatList(_this) {
        _this.cleanContent()
        this.flushButton.active = true
        this.sendButton.node.active = true
        if (_this.msgType == 90) {
            this.sendButton.node.active = false
        }
        if (this.msgList.length == 0) {
            this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无任何消息</c>" })
            return
        }


        for (var i = 0; i < _this.msgList.length; i++) {
            let itemName = _this.msgList[i].user_name
            if (_this.msgList[i].user_id == cc.props.userInfo.user_id) {
                itemName = "我:"
            }
            if (_this.msgList[i].user_id == 0) {
                _this.VLayoutNewNodeObj.addNewLine("wrap_text", itemName, { "text": `${_this.msgList[i].time}\n\n${_this.msgList[i].msg}`, "titleColor": new cc.color(225, 137, 38, 255) })

            } else {
                _this.VLayoutNewNodeObj.addNewLine("wrap_text", itemName, { "text": `${_this.msgList[i].time}\n\n${_this.msgList[i].msg}` })

            }
            setTimeout(function () {
                if (_this.View) {
                    _this.View.scrollToBottom(0.1)
                }
            }, 100);
        }
        if (_this.msgType == 20) {
            _this.VLayoutNewNodeObj.addNewLine("wrap_text", "提示", { "text": `发送世界消息需要耗费50钻石` })
        }
        _this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "" })
        _this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "" })


    },
    showSysChat() {
        let _this = this
        this.context.api.getSysChat(cc, function (res) {
            if (!res.data) {
                return
            }
            _this.msgList = res.data
            _this.loadChatList(_this)

        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.lockClick = false

        })
    },

    showWorldChat() {
        let _this = this
        this.context.api.getWorldChat(cc, function (res) {
            if (!res.data) {
                return
            }
            _this.msgList = res.data
            _this.loadChatList(_this)

        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.lockClick = false

        })
    },

    showGroupChat() {
        let _this = this
        this.context.api.getGroupChat(cc, function (res) {
            if (!res.data) {
                return
            }
            _this.msgList = res.data
            _this.loadChatList(_this)

        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.lockClick = false

        })
    },

    cleanContent() {
        for (var i = 0; i < this.VLayoutNode.children.length; i++) {
            this.VLayoutNode.children[i].destroy()
        }
    },
    getTab() {
        var ls = Array()
        if (cc.props.userInfo.group_id == 0) {
            this.nodeName = "UserChat"
            ls.push(
                {
                    "text": "世界",
                    "name": "WordChat",
                    "width": 60,
                    "focus": this.context.NowPage == "" ? 1 : 0
                },
                {
                    "text": "私聊",
                    "name": "UserChat",
                    "width": 60,
                    "focus": this.context.NowPage == "UserChat" ? 1 : 0
                },
                {
                    "text": "系统",
                    "name": "SysChat",
                    "width": 60,
                    "focus": this.context.NowPage == "SysChat" ? 1 : 0

                },


            )
        } else {
            this.nodeName = "GroupChat"
            ls.push(

                {
                    "text": "军团",
                    "name": "GroupChat",
                    "width": 60,
                    "focus": this.context.NowPage == "" ? 1 : 0
                },
                {
                    "text": "私聊",
                    "name": "UserChat",
                    "width": 80,
                    "focus": this.context.NowPage == "UserChat" ? 1 : 0

                },
                {
                    "text": "世界消息",
                    "name": "WordChat",
                    "width": 60,
                    "focus": this.context.NowPage == "WordChat" ? 1 : 0

                },
                {
                    "text": "系统",
                    "name": "SysChat",
                    "width": 60,
                    "focus": this.context.NowPage == "SysChat" ? 1 : 0

                },
            )
        }
        let hasFocus = 0
        for (var i = 0; i < ls.length; i++) {
            if (ls[i].focus == 1) {
                hasFocus = 1
                break
            }
        }
        if (hasFocus == 0 && ls.length > 0) {
            ls[0].focus = 1
        }
        return ls
    },

    update(dt) {
        this.timeNum++
        if (this.timeNum % 100 == 0 && this.flushButton.interactable == false) {
            this.flushButton.interactable = true
        }
    },
});
