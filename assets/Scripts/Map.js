// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import VLayout from './vlayouts/VLayout';


cc.Class({
    extends: cc.Component,

    properties: {
        mapItemFab: {
            default: null,
            type: cc.Prefab
        },
        upButton: {
            default: null,
            type: cc.Node
        },
        downButton: {
            default: null,
            type: cc.Node
        },
        leftButton: {
            default: null,
            type: cc.Node
        },
        rightButton: {
            default: null,
            type: cc.Node
        },
        mapBodyNode: {
            default: null,
            type: cc.Node
        },
        skipX: {
            default: null,
            type: cc.EditBox
        },
        skipY: {
            default: null,
            type: cc.EditBox
        },
        TabNewNode: {
            default: null,
            type: cc.Node
        },
        VLayout1: {
            default: null,
            type: cc.Node
        },
        VLayout2: {
            default: null,
            type: cc.Node
        },
        PageCom: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:
    initTabList() {
        var _this = this
        let ls = this.getGroupTab()
        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.cleanContent()
            _this.cleanVLayout()
            switch (nodeName) {
                case "map":
                    _this.onMap()
                    return
                case "collector":
                    _this.onCollector()
                    return
            }
        })
    },

    onCollector() {
        var _this = this
        console.log("pageCom", this.PageCom)
        this.PageCom && (this.PageCom.active = false)
        this.VLayout1 && (this.VLayout1.active = false)
        this.VLayout2 && (this.VLayout2.active = true)
        this.context.api.GetCollectList(cc, 1, function (res) {
            res && res.forEach(function (item) {
                var p = item.position
                if (!p) {
                    return
                }
                //if (data.btn1Func){
                //    this.btn1Func = data.btn1Func.func
                //    this.btn1Text.string = data.btn1Func.btnText
                //    this.btn1.active = true
                var eventNodeItem = _this.context.newAlertItem()
                var a = _this.VLayout2Node.addNewLine("text", "", {
                    "text": `${p.name}    (${p.lng},${p.lat})`,
                    "editAction2": "删除",
                    "editAction": "详情",
                    "attr": item
                }, (res) => {
                    var fn = eventNodeItem.funcs['showMapDetailAlert'].func
                    fn(_this.VLayout2Node, _this.context, p.map_id)
                }, (context, info) => {
                    var alertNode = context.NewAlert2()
                    alertNode.InitAlert("确认删除", "删除")
                    alertNode.addNewLine("wrap_text", "", { "text": `确认从收藏夹中删除${info.attr.position.name} (${info.attr.position.lng}, ${info.attr.position.lat}) 坐标吗？删除后，可以再地图页重新收藏。` })
                    alertNode.OnButtonFunc = function (btnName) {
                        _this.context.api.DeleteCollect(cc, info.attr.collect_id, function () {
                            _this.cleanVLayout()
                            _this.onCollector()
                            context.Toast("删除成功")
                        }, (e) => {
                            context.Toast(e)
                        })
                        alertNode.onButtonCancel()
                    }
                    alertNode.Alert()
                })
            })
        }, function (error) {

        })
    },

    getGroupTab() {
        let ls = []
        ls.push({
            "text": "地图区",
            "name": "map",
            "width": 60,
            "focus": 1
        })
        ls.push({
            "text": "收藏夹",
            "name": "collector",
            "width": 60,
            "focus": 0
        })
        return ls
    },

    onMap() {
        this.PageCom && (this.PageCom.active = true)
        this.VLayout1 && (this.VLayout1.active = true)
        this.VLayout2 && (this.VLayout2.active = false)
        if (this.context.latestLoc) {
            this.updateMap(this.context.latestLoc.lng, this.context.latestLoc.lat)
            this.context.latestLoc = null
        } else if (this.context && this.context.cityInfo) {
            this.updateMap(this.context.cityInfo.lng, this.context.cityInfo.lat)
        } else {
            this.context.Toast("数据异常，请刷新页面恢复")
        }

    },
    onClickInput(event, btnName) {
        this.context.NewNumberKeys(`输入${btnName}`, 3, (numberObj, value) => {
            if (btnName == "x") {
                this.skipX.string = value
            } else {
                this.skipY.string = value
            }
            numberObj.hide()
        })
    },
    skipCkick() {
        if (this.skipX.string == "" || this.skipY.string == "") {
            this.context.Toast("请输入坐标")
            return
        }
        var lng = Number(this.skipX.string)
        var lat = Number(this.skipY.string)
        if (lng < 0) {
            lng = 0
        }
        if (lat < 0) {
            lat = 0
        }
        if (lng > 500) {
            lng = 500
        }
        if (lat > 400) {
            lat = 400
        }
        if (lng >= 500 || lng < 0) {
            this.context.Toast("X坐标不存在")
            return
        }
        if (lat >= 400 || lat < 0) {
            this.context.Toast("Y坐标不存在")
            return
        }
        this.updateMap(lng, lat)

    },
    pageButton(event) {
        if (this.btnData && this.btnData[event.node.name]) {

            this.updateMap(this.btnData[event.node.name].lng, this.btnData[event.node.name].lat)
        }
    },

    cleanVLayout() {
        if (this.VLayout2Node) {
            this.VLayout2Node.cleanChilds()
        }
    },


    cleanContent() {
        if (this.mapBodyNode.children) {
            for (var i = 0; i < this.mapBodyNode.children.length; i++) {
                this.mapBodyNode.children[i].destroy()
            }
        }
    },
    updateMap(lng, lat) {
        if (this.lock) {
            return
        }
        var _this = this
        _this.lock = true

        _this.cleanContent()
        this.context.api.MapList(cc, 0, lng, lat, function (res) {
            for (var i = 0; i < res.list.length; i++) {
                var newItem = cc.instantiate(_this.mapItemFab);
                _this.mapBodyNode.addChild(newItem);
                newItem.getComponent('Mapitem').init(_this.context, i, res.list[i], _this)
            }
            _this.btnData = res.action
            _this.lock = false

        }, function (err) {

            _this.context.Toast(err)
            _this.lock = false
        })
    },
    onLoad() {
        var _this = this
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')

        this.context.resetFitView(this.node)


        this.upButton.on('click', this.pageButton, this);
        this.downButton.on('click', this.pageButton, this);
        this.leftButton.on('click', this.pageButton, this);
        this.rightButton.on('click', this.pageButton, this);
        this.initTabList()
        this.VLayout2Node = this.VLayout2.getComponent(VLayout)
        this.VLayout2Node.init(this)
    },
    onDestroy() {
        this.context.Ad.DestroyBanner()
    },
    start() {
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)

        this.context.AddFooterV3_2(this.node)

    }
    // update (dt) {},
});
