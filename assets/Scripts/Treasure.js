// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
        this.context.resetFitView(this.node)

    },

    getGroupTab(focusTab) {
        var ls = Array()
        ls.push({
            "text": "我的宝物",
            "name": "myprop",
            "width": 80,
            "focus": 1
        }, {
            "text": "我的装备",
            "name": "equip",
            "width": 80,
            "focus": 0
        }, {
            "text": "兑换宝物",
            "name": "propShop",
            "width": 80,
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
    },
    showMyProp(nodeName) {
        var _this = this
        this.cleanContent()
        this.context.api.propList(cc, function (res) {
            if (res.length == 0) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无任何宝物</c>" })
            } else {
                _this.VLayoutNewNodeObj.addNewLine("text_mid", "宝物", { "text": "数量" })

                for (var i = 0; i < res.length; i++) {
                    if (nodeName == "equip" && (res[i].detail.type != 10 && res[i].detail.type != 11)) {
                        continue
                    }
                    if (nodeName == "myprop" && (res[i].detail.type == 10 || res[i].detail.type == 11)) {
                        continue
                    }
                    (function (dataItem) {
                        var eventNodeItem = _this.context.newAlertItem()
                        eventNodeItem.data = dataItem
                        let valueColor = ""
                        if (dataItem.detail.type == 10) {
                            valueColor = _this.context.levelColor[dataItem.detail.level] ? _this.context.levelColor[dataItem.detail.level] : ""
                        }
                        _this.VLayoutNewNodeObj.addNewLine("text_mid", dataItem.name, {
                            "text": "    " + dataItem.number,
                            "lineHeight": 35,
                            "data": dataItem,
                            "cusButtonText": "详情",
                            "valueColor": valueColor,
                            "titleColor": valueColor,
                        }, function (event, attr) {
                            eventNodeItem.funcs["showPropDetail"].func(null, _this.context, eventNodeItem)
                        })
                    })(res[i])

                }
            }
        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
        })
    },


    showShop() {
        var _this = this
        this.cleanContent()
        this.context.api.propShop(cc, function (res) {

            if (res.props.length == 0) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>暂无任何宝物</c>" })
            } else {
                _this.VLayoutNewNodeObj.addNewLine("text_mid", "宝物", { "text": "钻石" })
                for (var i = 0; i < res.props.length; i++) {

                    //解决闭包问题
                    (function (dataItem) {
                        var eventNodeItem = _this.context.newAlertItem()
                        eventNodeItem.data = dataItem
                        eventNodeItem.discount = res.discount
                        _this.VLayoutNewNodeObj.addNewLine("text_mid", dataItem.name, { "text": dataItem.price + "钻", "lineHeight": 35, "eventNodeItem": eventNodeItem, "cusButtonText": "兑换" }, function (event, attr) {
                            eventNodeItem.funcs["showShopDetail"].func(null, _this.context, eventNodeItem)
                        })
                    })(res.props[i])

                }
                if (res.discount < 100) {

                    _this.VLayoutNewNodeObj.addNewLine("text_mid", "活动优惠", { "text": `内测期间${res.discount / 10}折` })
                }
            }
        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
        })
    },


    cleanContent() {
        for (var i = 0; i < this.VLayoutNode.children.length; i++) {
            this.VLayoutNode.children[i].destroy()
        }
    },
    start() {
        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')

        this.VLayoutNewNodeObj.init(this)
        let ls = this.getGroupTab()
        var _this = this
        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.context.TabName = nodeName
            switch (nodeName) {
                case "myprop":
                    _this.showMyProp(nodeName)
                    return
                case "equip":
                    _this.showMyProp(nodeName)
                    return
                case "propShop":
                    _this.showShop()
                    return
            }
        })
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
    }
    // update (dt) {},
});
