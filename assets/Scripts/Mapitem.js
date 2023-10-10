// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        flagText: {
            default: null,
            type: cc.Label
        },
        locText: {
            default: null,
            type: cc.Label
        },
        locNode: {
            default: null,
            type: cc.Node
        },
        clickNode: {
            default: null,
            type: cc.Node
        }
    },
    // LIFE-CYCLE CALLBACKS:
    init(context, index, item, parentItem) {
        this.context = context
        this.attr = item
        this.node.setPosition(this.getNewItemPosition(-90 + index % 2 * 160, 220 - Math.floor(index / 2) * 32))
        this.neetTime = false
        this.timeNum = 0
        this.parent = parentItem
        this.initItem()
        this.clickNode.on('click', this.onClick, this);
    },
    onClick() {
        var _this = this
        this.context.api.requestAPI(cc, "GET", "/map/getbyid?id=" + _this.attr.id, {}, function (res) {
            var alter2Node = _this.context.NewAlert2()
            alter2Node.InitAlert(res.table.title, "")
            var loc = 0
            for (var i = 0; i < res.table.body.length; i++) {
                if (res.table.body[i].type == "areatext") {
                    alter2Node.addNewLine("wrap_text", res.table.body[i].key, { "text": res.table.body[i].value })
                } else if (res.table.body[i].type == "text") {
                    if (res.table.body[i].key == "坐标:") {
                        alter2Node.addNewLine("text_mid", res.table.body[i].key, { "text": res.table.body[i].value, "cusButtonText": "收藏" }, function () {
                            var eventNodeItem = {}
                            var funcs = _this.context.AlertFunc.getFuncByName(eventNodeItem)
                            var fn = funcs["collectPosition"].func
                            eventNodeItem.context = _this.context
                            eventNodeItem.attr = res.detail
                            fn(alter2Node, _this.context, eventNodeItem)
                        })
                    } else {
                        alter2Node.addNewLine("text_mid", res.table.body[i].key, { "text": res.table.body[i].value })
                    }
                } else if (res.table.body[i].type == "text_copy") {
                    //解决闭包问题
                    (function (resItem) {
                        alter2Node.addNewLine("text_mid", resItem.key, { "text": resItem.value, "cusButtonText": "复制" }, function (resItem) {
                            _this.context.WebCopyString(this.context, resItem.value)

                        })
                    })(res.table.body[i])
                } else if (res.table.body[i].type == "text_mid") {
                    alter2Node.addNewLine("text_mid", res.table.body[i].key, { "text": res.table.body[i].value })
                } else if (res.table.body[i].type == "text_chat") {
                    alter2Node.addNewLine("text_mid", res.table.body[i].key, { "text": res.table.body[i].value, "cusButtonText": "进入" }, function (resItem) {
                        var eventNodeItem = _this.context.newAlertItem()
                        eventNodeItem.context = _this.context
                        eventNodeItem.forcusUserInfo = res.user
                        _this.context.AlertFunc.UserChatItem(alter2Node, _this.context, eventNodeItem)


                    })
                } else {
                    alter2Node.addNewLine(res.table.body[i].type, res.table.body[i].key, { "text": res.table.body[i].value })
                }
            }

            if (res.table.action.length > 0) {
                var eventNodeItem = {}
                eventNodeItem.context = _this.context
                eventNodeItem.attr = res.detail
                if (res.cityInfo) {
                    eventNodeItem.attr.cityInfo = res.cityInfo
                }
                eventNodeItem.destUser = res.user
                eventNodeItem.funcs = _this.context.AlertFunc.getFuncByName(eventNodeItem)
                for (var i = 0; i < res.table.action.length; i++) {
                    if (eventNodeItem.funcs[res.table.action[i].action]) {
                        alter2Node.AddButtonFrom0(eventNodeItem.funcs[res.table.action[i].action])
                    } else {
                        console.log("==缺少按钮", res.table.action[i].action)
                    }

                }
            }
            alter2Node.Alert()

            // _this.btnData = res.action
        })
    },
    // LIFE-CYCLE CALLBACKS:
    initItem() {
        if (this.attr.city == "深海") {
            this.flagText.string = "🌊🌊"
            this.locText.string = ''
            this.locNode.active = false
        } else {
            this.flagText.string = this.attr.city
            this.locText.string = "(" + this.attr.lng + "," + this.attr.lat + ")"
            if (this.attr.map_type != 10) {
                this.locText.string += "(" + this.attr.level + "级)"
            }
        }

    },
    // onLoad () {},

    start() {

    },
    getNewItemPosition(floorX, floorY) {
        return cc.v2(floorX, floorY);
    },
    // update (dt) {},
});
