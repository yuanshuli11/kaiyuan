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
        TabNewNode: {
            default: null,
            type: cc.Node
        },
    },


    onLoad() {
        this.nowPage = 0
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')


        if (!this.context) {
            return
        }
        this.context.resetFitView(this.node)

        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')

        this.VLayoutNewNodeObj.init(this)
    },

    getGroupTab(focusTab) {
        var ls = Array()
        ls.push({
            "text": "广告福利",
            "name": "myweal",
            "width": 80,
            "focus": 1
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
    },
    showMyWeal(nodeName) {
        var _this = this
        this.cleanContent()
        this.context.api.userAdWeal(cc, function (res) {
            var nums = res.nums
            var max = res.max
            if (!res || res.length == 0) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无任何道具</c>" })
            } else {

                var time = ""
                if (res.hasOwnProperty("flush_time")) {
                    time = "下次刷新:" + res.flush_time
                }
                _this.VLayoutNewNodeObj.addNewLine("text_mid", "福利（" + nums + "/" + max + "）", { "text": time })

                for (var i = 0; i < res.list.length; i++) {

                    (function (dataItem) {
                        var btn = "已过期"
                        if (dataItem.btn_type == 2) {
                            btn = "已发送"
                        }
                        if (dataItem.btn_type == 1) {
                            btn = "观看"
                        }
                        if (dataItem.btn_type == 4) {
                            btn = "已售罄"
                        }
                        _this.VLayoutNewNodeObj.addNewLine("text_mid", dataItem.name + "(+" + dataItem.number + ")", {
                            "text": "当前：" + dataItem.total,
                            "lineHeight": 35,
                            "data": dataItem,
                            "cusButtonText": btn
                        }, function () {
                            var alterNewNode = _this.context.NewAlert4()
                            if (dataItem.btn_type == 2) {
                                alterNewNode.context.Toast("已领取")
                                return
                            }
                            if (dataItem.btn_type == 3) {
                                alterNewNode.context.Toast("已过期")
                                return
                            }
                            if (dataItem.btn_type == 4) {
                                alterNewNode.context.Toast("已售罄")
                                return
                            }
                            _this.context.Ad.ShowAd("Activity", function () {
                                var params = new Object();
                                params.prop_id = dataItem.id

                                _this.context.api.finishUserWeal(cc, params, function () {
                                    alterNewNode.context.Toast("领取成功")
                                    _this.resetPage()
                                    // alterNewNode.onButtonCancel()

                                }, function (errorMsg) {

                                    alterNewNode.context.Toast(errorMsg)
                                    _this.resetPage()
                                    //alterNewNode.onButtonCancel()
                                })
                            }, function (err) {

                                alterNewNode.context.Toast(err)
                                alterNewNode.onButtonCancel()
                            })
                        })
                    })(res.list[i])

                }
            }

            _this.VLayoutNewNodeObj.addNewLine("text_mid", "转盘", {
                "text": `剩余${UserData.user.cfg.has_scroll_time}次`,
                "lineHeight": 35,
                "data": {},
                "cusButtonText": "进入"
            }, function () {
                cc.director.loadScene("ScrollPlay");
            })
            _this.VLayoutNewNodeObj.addNewLine("wrap_text", "说明：", {
                "text": "每种福利只能通过观看广告获取。\n观看广告完成后自动领取福利\n每10分钟刷新一次，" +
                    "\n钻石每天只能领取三次【第一次20个，第二次40个，第三次80个】"
            })

        }, function (errMsg) {
            var alterNewNode = _this.context.NewAlert4()
            alterNewNode.context.Toast("提示:" + errMsg)
        })

    },
    showMyJunBei(nodeName) {
        var _this = this
        this.cleanContent()
        this.context.api.junBeiList(cc, function (res) {

            if (!res || res.length == 0) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无任何道具</c>" })
            } else {
                _this.VLayoutNewNodeObj.addNewLine("text_mid", "军备", { "text": "" })

                for (var i = 0; i < res.length; i++) {

                    (function (dataItem) {

                        _this.VLayoutNewNodeObj.addNewLine("text_mid", dataItem.name, {
                            "text": "    " + dataItem.desc,
                            "lineHeight": 35,
                            "data": dataItem,
                            //"cusButtonText": "详情",
                            "valueColor": "",
                            "titleColor": "",
                        }, function () {
                            // eventNodeItem.funcs["showPropDetail"].func(null, _this.context, eventNodeItem)
                        })
                    })(res[i])

                }
            }
        }, function (errMsg) {
            var alterNewNode = _this.context.NewAlert4()
            alterNewNode.context.Toast("提示:" + errMsg)
        })
    },
    resetPage() {
        var _this = this
        _this.showMyWeal("广告福利")
    },
    cleanContent() {
        for (var i = 0; i < this.VLayoutNode.children.length; i++) {
            this.VLayoutNode.children[i].destroy()
        }
    },
    start() {
        let ls = this.getGroupTab()
        var _this = this
        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.context.TabName = nodeName

            switch (nodeName) {
                case "myweal":
                    _this.showMyWeal(nodeName)
                    return
            }
        })
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)

    }
    // update (dt) {},
});
