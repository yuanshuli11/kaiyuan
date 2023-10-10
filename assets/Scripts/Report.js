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
        scrollview: {
            default: null,
            type: cc.ScrollView
        },
        listBody: {
            default: null,
            type: cc.Node
        },
        viewBody: {
            default: null,
            type: cc.Node
        },
        detailBody: {
            default: null,
            type: cc.Node
        },
        detailViewBody: {
            default: null,
            type: cc.Node
        },
        detailBodyLayout: {
            default: null,
            type: cc.Node
        },
        TabNewNode: {
            default: null,
            type: cc.Node
        },
        btn1: {
            default: null,
            type: cc.Node
        },
        btn2: {
            default: null,
            type: cc.Node
        },
        handleNode: {
            default: null,
            type: cc.Node
        },
    },
    initTabList() {
        var _this = this

        let ls = this.getGroupTab(_this.context.NowPage)
        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.TabName = nodeName
            _this.cleanContent()
            _this.context.TabName = nodeName
            _this.btn1.active = true
            _this.btn2.active = true
            _this.handleNode.active = false
            switch (nodeName) {

                case "report1":
                    _this.btn1.active = false
                    _this.btn2.active = false
                    _this.handleNode.active = true

                    _this.getRankList("1", 0)

                    return
                case "report2":
                    _this.resetList("2", 0)

                    return
                case "report3":
                    _this.resetList("3", 0)
                    return
                case "report4":
                    _this.resetList("4", 0)
                    return
            }
        })
    },
    scrollToBottom(event) {
        if (this.rType == "1") {
            return
        }
        if (this.nowPage >= this.maxPage) {
            this.context.Toast("已经是最底部啦")
            return
        }
        this.resetList(this.rType, this.nowPage + 1)

    },
    // LIFE-CYCLE CALLBACKS:
    getRankList(rType, page) {
        if (this.lockClick) {
            return
        }
        this.rType = rType
        this.dataLimit = 5
        let dataInfo = []
        let _this = this
        this.lockClick = true
        this.nowPage = page
        this.maxPage = 1
        this.context.api.getReportRankList(cc, function (res) {
            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    //解决闭包问题
                    (function (resItem) {
                        var item = resItem

                        item.title = `${resItem.user_id == UserData.user.info.user_id ? "" : "被"}` + `${resItem.battle_type}` + `(${resItem.status_text})`
                        if (resItem.battle_info) {
                            item.line_content = `出发地:${resItem.battle_info.attack.city_name}(${resItem.battle_info.attack.area_lng},${resItem.battle_info.attack.area_lat}) \n`
                            item.line_content += `目的地:${resItem.battle_info.defense.city_name}(${resItem.battle_info.defense.area_lng},${resItem.battle_info.defense.area_lat})\n`
                            item.line_content += `军官:${resItem.battle_info.attack.officer_name}`
                        }
                        item.title_color = resItem.user_id == UserData.user.info.user_id ? "" : "#f1592a"
                        if (item.status == 20 || item.status == 30) {
                            item.next_handle_time = 0
                        }
                        item.type = "rank"
                        item.allowEdit = false
                        dataInfo[_this.dataOffset + i] = item
                    })(res[i])

                }
            }
            _this.lockClick = false
            _this.addToPage(dataInfo)
        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.lockClick = false

        })
    },
    // LIFE-CYCLE CALLBACKS:
    resetList(rType, page) {
        if (this.lockClick) {
            return
        }
        this.rType = rType
        this.dataLimit = 10
        let dataInfo = []
        let _this = this
        this.lockClick = true
        this.nowPage = page
        this.context.api.getReportList(cc, this.dataLimit, this.dataLimit * page, rType, function (res) {
            _this.dataLimit = res.count
            if (res.list.length > 0) {
                for (var i = 0; i < res.list.length; i++) {
                    //解决闭包问题
                    (function (resItem) {
                        resItem.allowEdit = true
                        dataInfo[_this.dataOffset + i] = resItem
                    })(res.list[i])

                }
            } else {
                _this.maxPage = page
            }
            _this.lockClick = false
            _this.addToPage(dataInfo)
        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.lockClick = false

        })
    },
    onLoad() {
        this.nowPage = 0
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        this.context.resetFitView(this.node)


        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')
        this.VLayoutNewNodeObj.init(this)
        this.detailBodyLayoutObj = this.detailBodyLayout.getComponent('VLayout')
        this.detailBodyLayoutObj.init(this)
        this.dataInfo = []
        var _this = this
        this.dataLimit = 40
        this.dataOffset = 0
        this.lockClick = false
        this.initTabList()
        this.scrollview.node.on('scroll-to-bottom', this.scrollToBottom, this);
        this.maxPage = 100
        this.hasIDs = {}

    },
    start() {
        this.context.AddHeaderUI(this.node)

        // 显示页面的Footer
        this.context.AddFooterV3_2(this.node)
    },
    backToHome() {
        this.context.skipScene("Main")
    },
    deleteAll() {

        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("清空战报", "清空")

        alter2Node.addNewLine("wrap_text", "提示:", { "text": `请问您确定清空本页展示的所有战报吗？\n` })
        alter2Node.addNewLine("wrap_text", "", { "text": `本操作不可撤回，请谨慎选择。` })

        let _this = this
        alter2Node.OnButtonFunc = function () {
            let ids = Array()
            for (let key in _this.hasIDs) {
                ids.push(Number(key))
            }


            if (ids.length == 0) {
                return
            }
            _this.context.api.deleteReport(cc, ids, function (res) {
                alter2Node.context.Toast("清除成功")
                _this.cleanContent()
                alter2Node.onButtonCancel()
            }, function (errorMsg) {
                alter2Node.context.Toast(errorMsg)
                alter2Node.onButtonCancel()
            })
        }


        alter2Node.Alert()
    },
    hasChildDestroy() {
        let _this = this
        var i = 0
        for (let key in _this.hasIDs) {
            if (_this.hasIDs[key] && _this.hasIDs[key].node && _this.hasIDs[key].node.active == true) {
                i++
            }
        }
        if (i < 6) {
            this.scrollToBottom()
        }
    },
    readAll() {
        let _this = this
        let ids = Array()
        for (let key in _this.hasIDs) {
            ids.push(Number(key))
        }

        if (ids.length == 0) {
            return
        }
        _this.context.api.readReport(cc, ids, function (res) {
            _this.context.Toast("全部已读")
            for (let key in _this.hasIDs) {
                _this.hasIDs[key].hasRead()
            }
        }, function (errorMsg) {
            _this.context.Toast(errorMsg)
        })
    },
    onHandlerClick(event, customerButton) {
        var click = "on"
        for (var i = 0; i < this.handleNode.children.length; i++) {
            if (this.handleNode.children[i].name == customerButton) {
                if (this.handleNode.children[i].onClick) {
                    click = "of"
                    this.handleNode.children[i].getComponent(cc.Button).normalSprite = this.handleNode.children[i].getComponent(cc.Button).disabledSprite
                    this.handleNode.children[i].onClick = false
                } else {
                    click = "on"
                    this.handleNode.children[i].getComponent(cc.Button).normalSprite = this.handleNode.children[i].getComponent(cc.Button).pressedSprite
                    this.handleNode.children[i].onClick = true
                }

            } else {
                this.handleNode.children[i].getComponent(cc.Button).normalSprite = this.handleNode.children[i].getComponent(cc.Button).disabledSprite
                this.handleNode.children[i].onClick = false
            }
        }
        this.HandlerSelect(click, customerButton)
    },
    HandlerSelect(click, type) {
        for (let key in this.hasIDs) {
            if (click == "of") {
                this.hasIDs[key].node.active = true
                continue
            }
            this.hasIDs[key].node.active = false
            if (click == "on") {
                switch (type) {
                    case "focus":
                        if (this.hasIDs[key].data.report.defense_user_id != 0 && this.hasIDs[key].data.report.user_id != UserData.user.info.user_id) {
                            this.hasIDs[key].node.active = true
                        }
                        break
                    case "battle":
                        if (this.hasIDs[key].data.report.status == 30) {
                            this.hasIDs[key].node.active = true
                        }
                        break
                    case "wait":
                        if (this.hasIDs[key].data.report.status == 20) {
                            this.hasIDs[key].node.active = true
                        }
                        break
                    case "owner":
                        if (this.hasIDs[key].data.report.user_id == UserData.user.info.user_id) {
                            this.hasIDs[key].node.active = true
                        }
                        break
                }
            }

        }
    },
    showDetail(attr) {
        var rank = null
        if (attr.report.type == "rank" && attr.report.next_handle_time > this.context.getServerTime() && (attr.report.status == 0 || attr.report.status == 50) && (attr.report.user_id == UserData.user.info.user_id || attr.report.defense_user_id == UserData.user.info.user_id)) {
            rank = attr.report
            // 被攻击预警 点击需要展示战报
            if (attr.report.user_id == UserData.user.info.user_id) {
                rank.report_id = attr.report.battle_info.attack.report_id
            } else if (attr.report.defense_user_id == UserData.user.info.user_id) {
                rank.report_id = attr.report.battle_info.defense.report_id
            } else {
                this.context.Toast("查询预警战报失败")
                return
            }

        } else if (attr.report.type == "rank" && attr.report.next_handle_time < this.context.getServerTime() && attr.report.status == 50) {
            this.context.Toast("已抵达")
            return
        } else if (attr.report.type == "rank" && attr.report.status == 60) {
            var eventNodeItem = {}
            eventNodeItem.context = this.context
            eventNodeItem.funcs = this.context.AlertFunc.getFuncByName(eventNodeItem)
            eventNodeItem.attr = attr.report
            if (attr.report.user_id == UserData.user.info.user_id) {
                eventNodeItem.funcs["stayArmyBack"].func(null, this.context, eventNodeItem)
            } else {
                eventNodeItem.funcs["sendArmyBack"].func(null, this.context, eventNodeItem)
            }

            return
        } else if (attr.report.type == "rank") {
            var eventNodeItem = {}
            eventNodeItem.context = this.context
            eventNodeItem.funcs = this.context.AlertFunc.getFuncByName(eventNodeItem)
            eventNodeItem.attr = attr.report
            eventNodeItem.funcs["showBattleHandle"].func(null, this.context, eventNodeItem)
            return
        }
        if (!this.listBody || !this.detailBody) {
            return
        }

        var reportID = rank ? rank.report_id : attr.report.id
        if (!reportID) {
            this.context.Toast("该队伍无法查看详情")
            return NodeIterator
        }
        this.listBody.active = false
        this.detailBody.active = true
        this.detailBodyLayoutObj.cleanChilds()
        var _this = this
        this.context.api.getReportByID(cc, reportID, function (res) {
            _this.detailBodyLayoutObj.addNewLine("text", "", { "text": "" });

            _this.detailBodyLayoutObj.addNewLine("headback", "headback", { "doButtonText": "返回" }, function () {
                _this.detailBody.active = false
                _this.listBody.active = true
            })
            attr.report = res
            _this.detailBodyLayoutObj.addNewLine("wrap_high_text", "", { "text": attr.report.message })
            if (attr.report.action) {
                _this.detailBodyLayoutObj.addNewLine("text_click", "", attr.report.action, function (event, data) {
                    data.report_id = attr.report.id
                    if (rank) {
                        if (rank.id) {
                            data.rank_id = rank.id
                        }
                        if (rank.report_id) {
                            data.report_id = rank.report_id
                        }
                    }

                    switch (data.action) {
                        case "battle_setting":
                            _this.showBattleSetting(data)
                            return
                        case "battle_recovery":
                            _this.showBattleRecovery(data)
                            return
                        case "battle_back":
                            _this.showBattleBack(data)
                            return
                    }


                })
            }


            _this.detailBodyLayoutObj.addNewLine("footer", "footer", { "doButtonText": "返回" }, function () {
                _this.detailBody.active = false
                _this.listBody.active = true
            })
            _this.detailBodyLayoutObj.addNewLine("text", "", { "text": "" });
            _this.detailBodyLayoutObj.addNewLine("text", "", { "text": "" });

            _this.detailBodyLayoutObj.end()
        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
            _this.detailBodyLayoutObj.addNewLine("headback", "headback", { "doButtonText": "返回" }, function () {
                _this.detailBody.active = false
                _this.listBody.active = true
            })
        })




    },
    //展示战斗设置弹窗
    showBattleBack(data) {
        var _this = this
        this.context.api.goBattleBack(cc, data.report_id, data.rank_id, function (res) {
            _this.context.Toast("30秒后回城")
            _this.context.reloadPage()
        }, function (errMsg) {
            _this.context.Toast(errMsg)
        })
    },
    //展示战斗设置弹窗
    showBattleSetting(data) {
        var eventNodeItem = {}
        eventNodeItem.context = this.context
        eventNodeItem.funcs = this.context.AlertFunc.getFuncByName(eventNodeItem)
        eventNodeItem.attr = data.attr
        eventNodeItem.funcs["showBattleHandle"].func(null, this.context, eventNodeItem)
    },
    //展示恢复伤兵
    showBattleRecovery(data) {
        this.context.ListFunc["showBattleRecovery"](this.context, data)
    },

    addToPage(items) {
        if (!items || items.length == 0) {
            if (this.VLayoutNode.children.length == 0) {
                this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无军报</c>" })
            }
            return
        }
        let _this = this
        for (var i = 0; i < items.length; i++) {
            //解决闭包问题
            (function (item) {
                if (_this.hasIDs[item.id]) {
                    return
                }
                let objItem = _this.VLayoutNewNodeObj.addNewLine("report_text", item.title, {
                    "timeText": item.created_at.substring(5, 16),
                    "text": item.line_content,
                    "cronTime": item.next_handle_time,
                    "report": item,
                    "parent": _this,
                }, function (attr) {
                    _this.showDetail(attr)
                })
                _this.hasIDs[item.id] = objItem
            })(items[i])


        }

    },

    cleanContent() {
        for (var i = 0; i < this.VLayoutNode.children.length; i++) {
            this.VLayoutNode.children[i].destroy()
        }
        this.hasIDs = {}
    },

    getGroupTab(focusTab) {
        var ls = Array()
        ls.push({
            "text": "行军",
            "name": "report1",
            "width": 60,
            "focus": 1
        })
        ls.push({
            "text": "战报",
            "name": "report3",
            "width": 60,
            "focus": 0
        })

        ls.push({
            "text": "打野",
            "name": "report2",
            "width": 60,
            "focus": 0
        })
        ls.push({
            "text": "运输",
            "name": "report4",
            "width": 60,
            "focus": 0
        })
        if (this.context.TabName && this.context.TabName != "" && ls.length > 1) {
            for (var i = 0; i < ls.length; i++) {

                if (ls[i].name == this.context.TabName) {
                    ls[i].focus = 1
                } else {
                    ls[i].focus = 0
                }
            }
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
    }
    // update (dt) {},
});
