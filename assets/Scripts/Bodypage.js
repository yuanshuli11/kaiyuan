// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UserData } from "./model/userdata";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        header: {
            default: null,
            type: cc.Node
        },
        turnPageNode: {
            default: null,
            type: cc.Node
        },
        pageBodyItemFab: {
            default: null,
            type: cc.Prefab
        },

        noContentFab: {
            default: null,
            type: cc.Prefab
        },
        bodyLayout: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:
    //this.main.context,"officer",officerInfo
    init(context, index, type, dataInfo) {
        this.nowPage = 0
        this.context = context
        this.contType = type
        this.dataInfo = dataInfo
        this.turnPageObj = this.turnPageNode.getComponent('Pageaction')
        this.cleanContent()
        if (type == "user") {
            this.loadUserPage()
        } else {
            this.loadPage(-1)
        }

        this.node.setPosition(this.getNewItemPosition(350 * index - 700, 0))

    },
    setHeader(name, level, attr) {
        this.header.getChildByName("name").getComponent(cc.Label).string = name
        this.header.getChildByName("level").getComponent(cc.Label).string = level
        this.header.getChildByName("attr").getComponent(cc.Label).string = attr


    },
    updateData(tType) {


    },

    loadArmy() {
        var _this = this
        this.context.api.requestAPI(cc, "GET", "/home/city/info", {}, function (res) {
            if (_this.contType == "army") {
                _this.dataInfo = res.ca //更新城市军队
            }
            _this.loadPage(-1)
        }, function (errMsg) {
        })
    },

    cleanContent() {

        for (var i = 0; i < this.bodyLayout.children.length; i++) {
            this.bodyLayout.children[i].destroy()
        }
    },
    //dataInfo {"user_name":"叫一个小草","user_flag":"风","honor":12000,"range":"--","rank":"中尉","post":"连长","city_num":10,"diamonds":100}
    loadUserPage() {
        var eventNodeItem = {}
        eventNodeItem.context = this.context
        eventNodeItem.showAreaList = this.showAreaList
        eventNodeItem.showCityList = this.showCityList
        eventNodeItem.funcs = this.context.AlertFunc.getFuncByName(eventNodeItem)
        eventNodeItem.data = this.dataInfo
        this.header.active = false
        this.turnPageNode.active = false
        var bodyItem = this.bodyLayout
        this.cleanContent()
        var _this = this
        this.addItemToBody(bodyItem, "统帅:", this.dataInfo.name, "复制", function () {
            if (window.wx) {
                // console.log('复制---微信小游戏--cc.sys.platform=', cc.sys.platform);
                wx.setClipboardData({
                    data: _this.dataInfo.name,
                    success: function (res) {

                        console.log("success复制成功：", _this.dataInfo.name);
                        if (window.qq) {
                            context.Toast(_this.dataInfo.name + "复制成功")
                        }
                        return true;
                    }
                });

                return;
            }
        })
        this.addItemToBody(bodyItem, "旗号:", this.dataInfo.user_flag, "", this)
        this.addItemToBody(bodyItem, "荣誉:", this.dataInfo.honor, "", this)

        if (!UserData.user.info.gropu_id == 0) {
            this.addItemToBody(bodyItem, "军团:", "未加入军团", "加入", function () {
                this.context.skipScene("Group");
            })
        } else if (UserData.group.groupInfo && UserData.group.groupInfo.name) {

            this.addItemToBody(bodyItem, "军团:", UserData.group.groupInfo.name, "进入", function () {
                this.context.skipScene("Group");
            })
        }


        if (this.dataInfo.zhiwei_item) {
            if (this.dataInfo.zhiwei_item.next) {
                this.addItemToBody(bodyItem, "职位:", this.dataInfo.zhiwei_item.name, "晋升", function () {
                    eventNodeItem.funcs["showZhiWeiAlert"].func(null, eventNodeItem.context, eventNodeItem)
                })
            } else {
                this.addItemToBody(bodyItem, "职位:", this.dataInfo.zhiwei_item.name, "", this)
            }

        }
        if (this.dataInfo.junxian_item) {
            if (this.dataInfo.junxian_item.next) {
                this.addItemToBody(bodyItem, "军衔:", this.dataInfo.junxian_item.name, "晋衔", function () {
                    eventNodeItem.funcs["showJunxianAlert"].func(null, eventNodeItem.context, eventNodeItem)

                })
            } else {
                this.addItemToBody(bodyItem, "军衔:", this.dataInfo.junxian_item.name, "", this)
            }
        }
        if (UserData.city.info) {
            this.addItemToBody(bodyItem, "城市:", `${UserData.city.info.name}(${UserData.city.info.lng},${UserData.city.info.lat})`, "列表", function () {
                eventNodeItem.showCityList(eventNodeItem)
            })
            // this.addItemToBody(bodyItem, "城市:", `${this.dataInfo.cityInfo.name}(${this.dataInfo.cityInfo.lng},${this.dataInfo.cityInfo.lat})  共${this.dataInfo.city_number} 座`, "列表", function () {
            //     eventNodeItem.showCityList(eventNodeItem)
            // })        
        }


        this.addItemToBody(bodyItem, "野地:", "显示城市附属区域", "查看", function () {
            eventNodeItem.showAreaList(eventNodeItem)
        })

        if (this.dataInfo.cityInfo && this.dataInfo.cityInfo.producted_text) {
            this.addItemToBody(bodyItem, "保护期:", "截止 " + this.dataInfo.cityInfo.producted_text, "", this)

        }
        //   if (cc.props.appID == "wx9d7a39310aef047e") {
        this.addItemToBody(bodyItem, "钻石:", this.dataInfo.diamonds, "获取", function () {
            _this.exchangeDimands(eventNodeItem)
        })
        // } else {
        //     this.addItemToBody(bodyItem, "钻石:", this.dataInfo.diamonds, "", this)
        // }


    },

    showCityList(eventNodeItem) {
        var alter2Node = eventNodeItem.context.NewAlert2()
        alter2Node.InitAlert("城市列表", "关闭")
        alter2Node.context.api.getCityList(cc, function (res) {
            for (var i = 0; i < res.length; i++) {

                (function (item) {
                    var neweventNodeItem = {}
                    neweventNodeItem.context = eventNodeItem.context
                    neweventNodeItem.attr = item
                    neweventNodeItem.funcs = eventNodeItem.context.AlertFunc.getFuncByName(neweventNodeItem)
                    var text = `${item.name}(${item.lng},${item.lat})`
                    if (cc.props.userInfo.main_city == item.id) {
                        alter2Node.addNewLine("text", "", { "text": text, "editAction": "详情", "attr": item, "eventNodeItem": neweventNodeItem }, function () {
                            // alter2Node.onButtonCancel()
                            neweventNodeItem.funcs["展示城市"].func(alter2Node, alter2Node.context, neweventNodeItem)
                        })
                    } else {
                        alter2Node.addNewLine("text", "", { "text": text, "editAction": "详情", "editAction2": "运输", "attr": item, "eventNodeItem": neweventNodeItem }, function () {
                            // alter2Node.onButtonCancel()
                            neweventNodeItem.funcs["展示城市"].func(alter2Node, alter2Node.context, neweventNodeItem)
                        }, function () {
                            alter2Node.onButtonCancel()
                            var actionData = {}
                            actionData.map = neweventNodeItem.attr
                            actionData.action = "运输"
                            cc.props.SceneContext = actionData
                            alter2Node.context.skipScene("Battle");
                        })
                    }

                })(res[i])
            }
        })
        alter2Node.OnButtonFunc = function () {
            alter2Node.onButtonCancel()
        }
        alter2Node.Alert()
    },

    exchangeDimands(eventNodeItem) {
        var alter2Node = eventNodeItem.context.NewAlert2()
        alter2Node.InitAlert("兑换钻石", "兑换")
        alter2Node.addNewLine("wrap_text", "提示", { "text": "征服9级寇城获取宝箱，即可获得钻石。\n参与游戏活动可获取钻石Key。兑换Key,可通过游戏活动获取Key" })

        var intNode = alter2Node.addNewLine("input_long", "Key:", { "maxLength": 32, "value": "", "lineHeight": 30, "showNumberKey": true })
        alter2Node.OnButtonFunc = function () {
            if (!intNode.getValue()) {
                eventNodeItem.context.Toast("请填写Key")
                return
            }
            eventNodeItem.context.api.ExchangeKey(cc, intNode.getValue(), function () {
                eventNodeItem.context.Toast("兑换成功")
                alter2Node.onButtonCancel()
                eventNodeItem.context.reloadPage()
            }, function (err) {
                eventNodeItem.context.Toast(err)
                //alter2Node.onButtonCancel()
            })

            //
        }
        alter2Node.Alert()
    },


    showAreaList(eventNodeItem) {
        var alter2Node = eventNodeItem.context.NewAlert2()
        alter2Node.InitAlert("附属野地", "关闭")
        alter2Node.context.api.getCityArea(cc, function (res) {
            for (var i = 0; i < res.length; i++) {

                //解决闭包问题
                (function (item) {
                    var neweventNodeItem = {}
                    neweventNodeItem.context = eventNodeItem.context
                    neweventNodeItem.attr = item
                    neweventNodeItem.funcs = eventNodeItem.context.AlertFunc.getFuncByName(neweventNodeItem)
                    var text = `${item.city}(${item.lng},${item.lat})`
                    alter2Node.addNewLine("text", "", { "text": text, "editAction": "详情", "attr": item, "eventNodeItem": neweventNodeItem }, function () {
                        // alter2Node.onButtonCancel()
                        neweventNodeItem.funcs["展示野地"].func(alter2Node, alter2Node.context, neweventNodeItem)
                    })
                })(res[i])
            }
        })
        alter2Node.OnButtonFunc = function () {
            alter2Node.onButtonCancel()
        }
        alter2Node.Alert()
    },


    addItemToBody(bodyItem, name, value, btnText, alertFunc) {
        var obj = {}
        obj.name = name
        obj.value = value
        var newItem = cc.instantiate(this.pageBodyItemFab);
        bodyItem.addChild(newItem);
        newItem.getComponent('Bodyitem').init(this.context, bodyItem.children.length - 1, this.contType, obj)

        newItem.getComponent('Bodyitem').setClick(btnText, alertFunc)


    },

    loadPage(page) {
        if (page == -1) {
            page = this.nowPage
        } else {
            this.nowPage = page
        }
        this.cleanContent()
        var pageNum = 8
        var offset = page * pageNum
        var limitMum = pageNum + offset
        var bodyItem = this.bodyLayout
        var showIndex = 0
        if (this.contType == "officer" && (!this.dataInfo || this.dataInfo.length == 0)) {
            var node = cc.instantiate(this.noContentFab);
            if (node) {
                var nodeObj = node.getComponent('VLayoutNoContentItem')
                if (nodeObj) {
                    nodeObj.init(this, "", { "value": "<color=#000000>还未招募军官，前往军校>></c>", "lineHeight": 30 }, function (event, attr) {
                        cc.director.loadScene("School");
                    })
                    bodyItem.addChild(node);
                }

            }
        } else {
            for (var i = 0; i < this.dataInfo.length; i++) {
                if (this.dataInfo[i].locDelete == true) {
                    continue
                }
                if (i >= offset && i < limitMum) {
                    var newItem = cc.instantiate(this.pageBodyItemFab);
                    bodyItem.addChild(newItem);
                    this.dataInfo[i].locDelete = false
                    this.dataInfo[i].locIndex = i
                    newItem.getComponent('Bodyitem').init(this.context, showIndex, this.contType, this.dataInfo[i], this,)
                    showIndex++
                }
            }
            this.resetTurnPage(page)

        }

    },
    changeUserAlert() {

    },
    resetTurnPage(page) {
        //page limit this
        this.turnPageObj.resetTurnPage(page, 8, this)
    },
    getNewItemPosition(floorX, floorY) {
        return cc.v2(floorX, floorY);
    },
    start() {

    },

    // update (dt) {},
});
