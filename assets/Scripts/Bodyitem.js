// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { UserData } from './model/userdata';
cc.Class({
    extends: cc.Component,

    properties: {
        nameText: {
            default: null,
            type: cc.Label
        },
        midText: {
            default: null,
            type: cc.Label
        },
        endText: {
            default: null,
            type: cc.Label
        },
        statusText: {
            default: null,
            type: cc.Label
        },
        btnDetail: {
            default: null,
            type: cc.Node
        },
        btnDo: {
            default: null,
            type: cc.Node
        },
        btnText: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:
    init(context, index, type, item, parentItem) {
        this.context = context
        this.attr = item

        this.node.setPosition(this.getNewItemPosition(-120, 120 - index * 30))
        this.neetTime = false
        this.timeNum = 0
        this.type = type
        this.parent = parentItem
        this.initItem()
    },
    initItem() {
        switch (this.type) {
            case "officer":
                this.initOfficerItem()
                break;
            case "army":
                this.initArmyItem()
                break;
            case "defense":
                this.initDefenseItem()
                break;
            case "user":
                this.initUserItem()
                break;
        }
    },
    //TODO接下来完成统帅页面
    setClick(text, clickNewFunc, scene) {

        this.btnDo.on('click', clickNewFunc, this);
        if (text != "") {
            this.btnText.string = text
        } else {
            this.btnDo.active = false
        }
    },
    initUserItem() {
        this.nameText.string = this.attr.name
        this.midText.string = this.attr.value
        this.endText.string = ""
    },

    //返回0 说明剩余时间已用尽，需要自动升级了(调用接口查询一下当前建筑的状态,并更新)。如果返回-1 就说明不需要升级
    setShowTime() {
        this.neetTime = true
        //TODO: 根据status值设置时间
        var timeStr = "--"
        var remaining = -1
        if (this.attr && this.attr.building_end > 0 && this.attr.status == 2) {
            var remaining = this.attr.building_end - this.context.getServerTime()
            if (remaining < 0) {
                remaining = 0
            }
            timeStr = this.timeTostr(remaining)
        }

        this.endText.string = timeStr
        return remaining
    },
    // Upgrade 军队
    Upgrade() {
        if (this.lockHttp) {
            return
        }
        this.lockHttp = true
        var _this = this
        this.context.api.MagicUpdate(cc, _this.attr.id, _this.type, function (res) {
            _this.attr = res
            if (res && _this.attr.index >= 0) {
                res.index = _this.attr.index
                UserData.UpdateLocalObject(res)
            } else {
                UserData.reloadHomeInfo("cityArmy", null)
            }
            _this.lockHttp = false
        }, function (errMsg) {
            cc.log("error:", "/magic/update", errMsg)
            _this.lockHttp = false
        })
    },
    initOfficerItem() {
        this.nameText.string = this.attr.on
        this.midText.string = this.attr.st + "星"
        this.endText.string = this.attr.os + "/" + this.attr.op + "/" + this.attr.ok + "/" + this.attr.l
        this.btnDo.on('click', this.onButtonShowOfficerDetail, this);
        this.btnText.string = "查看"
        if (this.statusText) {
            this.statusText.string = `${this.attr.stu_text}`
        }
    },
    //初始化首页军队tab
    initArmyItem() {
        //{"name":"步兵","attack":15,"defense":17,"speed":20,"blood":1,"need_gold":100,"need_food":100,"need_steel":100,"need_oil":300,"oil_spent":5,"can_train":100,"has_num":2000,"training":500,"finish_time":1654433320}
        this.nameText.string = this.attr.name
        this.midText.string = this.context.numToString(this.attr.number) + "/" + this.attr.train_number
        this.setShowTime()
        this.btnDo.on('click', this.onButtonShowArmyDetail, this);
        if (this.attr.status == 1) {
            this.btnText.string = "训练"
        } else {
            this.btnText.string = "查看"
        }

    },
    initDefenseItem() {
        //{"name":"步兵","attack":15,"defense":17,"speed":20,"blood":1,"need_gold":100,"need_food":100,"need_steel":100,"need_oil":300,"oil_spent":5,"can_train":100,"has_num":2000,"training":500,"finish_time":1654433320}
        this.nameText.string = this.attr.name
        this.midText.string = this.context.numToString(this.attr.number) + "/" + this.attr.train_number
        this.setShowTime()
        this.btnDo.on('click', this.onButtonShowArmyDetail, this);
        if (this.attr.status == 1) {
            this.btnText.string = "训练"
        } else {
            this.btnText.string = "查看"
        }
    },
    // onLoad () {},
    onButtonShowOfficerDetail(event) {
        var _attr = this.attr
        var _this = this
        var eventNodeItem = this.context.newAlertItem()
        eventNodeItem.attr = this.attr
        eventNodeItem.reloadPage = function (res) {
            if (_this.parent) {
                _this.parent.updateData(_this.type)
            }

        }
        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("军官", "关闭")
        //{"name":"埃隆·马斯克","star":5,"attack":15,"server":17,"tech":20,"level":1,"status":0}

        alter2Node.addNewLine("text_mid", "姓名:", { "text": _attr.on, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "星级:", { "text": _attr.st + "星", "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "后勤:", { "text": _attr.os, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "军事:", { "text": _attr.op, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "学识:", { "text": _attr.ok, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "级别:", { "text": _attr.l, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "薪资:", { "text": _attr.we, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "状态:", { "text": _attr.stu_text, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "经验值:", { "text": `  ${_attr.exp}/${_attr.next_exp}`, "lineHeight": 30 })
        alter2Node.addNewLine("text_mid", "属性点:", { "text": " " + _attr.attr_num, "lineHeight": 30 })
        if (_attr.skill_1) {
            alter2Node.addNewLine("text_mid", "技能1:", { "text": _attr.skill_1.name + "(" + _attr.skill_level + "级)", "lineHeight": 30, "cusButtonText": "", "eventNodeItem": eventNodeItem, })
        } else {
            alter2Node.addNewLine("text_mid", "技能1:", { "text": "未掌握", "lineHeight": 30, "cusButtonText": "", "eventNodeItem": eventNodeItem })
        }
        if (_attr.skill_2) {
            alter2Node.addNewLine("text_mid", "技能2:", { "text": _attr.skill_2.name + "(" + _attr.skill_level + "级)", "lineHeight": 30, "cusButtonText": "", "eventNodeItem": eventNodeItem, })

        } else {
            alter2Node.addNewLine("text_mid", "技能2:", { "text": "未掌握", "lineHeight": 30, "cusButtonText": "", "eventNodeItem": eventNodeItem })
        }

        if (_attr.skill_3) {
            alter2Node.addNewLine("text_mid", "技能3:", { "text": _attr.skill_3.name + "(" + _attr.skill_level + "级)", "lineHeight": 30, "cusButtonText": "", "eventNodeItem": eventNodeItem, })
        } else {
            alter2Node.addNewLine("text_mid", "技能3:", { "text": "未掌握", "lineHeight": 30, "cusButtonText": "", "eventNodeItem": eventNodeItem })
        }


        if (_attr.stu == 20) {
            alter2Node.AddButtonFrom0(eventNodeItem.funcs["unOfferOfficer"])
        } else if (_attr.stu == 10) {
            alter2Node.AddButtonFrom0(eventNodeItem.funcs["handlerOfficer"])
            alter2Node.AddButtonFrom0(eventNodeItem.funcs["offerOfficer"])
            alter2Node.AddButtonFrom0(eventNodeItem.funcs["empty"])
            alter2Node.AddButtonFrom0(eventNodeItem.funcs["fireOfficer"])
        } else {
            alter2Node.OnButtonFunc = alter2Node.onButtonCancel
        }
        alter2Node.Alert()

        // 添加点击事件 返回true后就关闭弹窗
    },

    //展示出来训练军队的弹窗
    onButtonShowArmyDetail(event) {
        var item = this.context.getArmyByNameType(this.attr.name_type)
        var attr = this.attr
        var btnText = "确定"
        //只有status = 1才可以训练
        if (this.attr.status == 1) {
            btnText = "训练"
        }
        //{"id":1,"name":"步兵","name_type":"1","description":"我是步兵","camp":0,"need_building":"[{\"name_type\":\"1\",\"level\":\"1\"},{\"name_type\":\"13\",\"level\":\"1\"}]","need_tech":"[{\"name_type\":\"0\",\"level\":\"1\"},{\"name_type\":\"0\",\"level\":\"1\"}]","need_resource":"{\"gold\":\"0\",\"food\":\"50\",\"steel\":\"70\",\"oil\":\"10\",\"rare\":\"100\",\"people\":\"1\"}","need_time":10,"attack_down":10,"attack_sea":10,"attack_up":9,"attack_defense":18,"defense":10,"attack_range":20,"speed":300,"blood":100,"oil_need":1,"food_need":1,"type":0,"can_weight":50}
        var alterNewNode = this.context.NewAlert2()
        var eventNodeItem = this.context.newAlertItem()
        eventNodeItem.alterNewNode = alterNewNode
        eventNodeItem.attr = attr
        var _this = this
        eventNodeItem.reloadPage = function (res) {
            if (_this.parent) {
                _this.parent.updateData(_this.type)
            }

        }
        alterNewNode.InitAlert(this.attr.name + ":", btnText);
        alterNewNode.setGridLayout()

        alterNewNode.addNewLine("grid_text", "数量:", { "text": this.attr.number });

        if (this.attr.status == 1) {
            alterNewNode.addNewLine("grid_text", "状态:", { "text": "空闲" });
        } else if (this.attr.status == 2) {
            alterNewNode.addNewLine("grid_text", "状态:", { "text": "训练中" });
        }

        alterNewNode.addNewLine("grid_text", "在训:", { "text": this.attr.train_number });

        var utils = require("utils");

        if (this.attr.status == 1) {
            var selectNum = 0
            alterNewNode.addNewLine("text", "", { "text": "  ========滑动输入训练数量========" });
            var useTimeObj = alterNewNode.addNewLine("grid_text", "", { "text": item.need_resource.rare });
            var sliderObj = alterNewNode.addNewLine("slider", "数量", {
                "nameSize": 32, "max": 0, "callback": function (num) {
                    selectNum = num
                    var fname = "耗时:" + utils.timeToStr(item.need_time * num)
                    useTimeObj.setItemValue(fname)
                }
            })
            this.context.api.getArmyCanTrainNum(cc, this.attr.name_type, function (res) {
                sliderObj.SetMax(res.can_train)
                var fname = "耗时:" + utils.timeToStr(item.need_time * res.can_train / 2)
                useTimeObj.setItemValue(fname)
                selectNum = Math.ceil(res.can_train / 2)

            })
        }


        var _this = this
        if (this.attr.status == 1) {
            // 点击弹窗中的训练按钮，开始训练军队
            alterNewNode.OnButtonFunc = () => {
                //滑动窗口大于0 才说明需要建造军队
                if (selectNum > 0) {
                    selectNum = Math.ceil(selectNum)
                    _this.context.api.trainArmy(cc, this.attr.id, this.attr.name_type, selectNum, function (res) {
                        alterNewNode.onButtonCancel()


                        if (res && _this.attr.index >= 0) {
                            res.attr.index = _this.attr.index
                            UserData.UpdateLocalObject(res.attr)
                        } else {
                            UserData.reloadHomeInfo("cityArmy", null)
                        }

                    }, function (errorMsg) {
                        _this.context.Toast(errorMsg)
                        return
                    })
                }
            }
        } else if (this.attr.status == 2) {
            alterNewNode.addNewLine("text_mid", "提示:", { "text": "解散训练资源返还50%" });
            alterNewNode.addNewLine("text_mid", "完成时间:", { "text": utils.formatUnix(attr.building_end) });


            alterNewNode.AddButtonFrom0(eventNodeItem.funcs["showCancelFunc"])
            if (window.wx && this.attr.has_acce == 0) {
                alterNewNode.AddButton(eventNodeItem.funcs["adArmyAcce"])
            }
            eventNodeItem.ShowPropType = 3
            alterNewNode.AddButton(eventNodeItem.funcs["accePropList"])

        } else {
            alterNewNode.OnButtonFunc = alterNewNode.onButtonCancel
        }
        alterNewNode.addNewLine("text_mid", "属性:", { "text": "" });
        alterNewNode.addNewLine("grid_text", "对地:", { "text": item.attack_down });
        alterNewNode.addNewLine("grid_text", "对空:", { "text": item.attack_up });
        alterNewNode.addNewLine("grid_text", "对海:", { "text": item.attack_sea });
        alterNewNode.addNewLine("grid_text", "对防:", { "text": item.attack_defense });

        alterNewNode.addNewLine("grid_text", "防御:", { "text": item.defense });
        if (item.speed > 0) {
            alterNewNode.addNewLine("grid_text", "速度:", { "text": item.speed });
        }
        alterNewNode.addNewLine("grid_text", "血量:", { "text": item.blood });
        alterNewNode.addNewLine("grid_text", "负重:", { "text": item.can_weight });
        alterNewNode.addNewLine("grid_text", "射程:", { "text": item.attack_range });
        if (item.oil_need > 0) {
            alterNewNode.addNewLine("grid_text", "油耗:", { "text": item.oil_need });
        }
        if (item.need_resource > 0) {
            alterNewNode.addNewLine("grid_text", "人口:", { "text": item.need_resource.people });
        }
        alterNewNode.addNewLine("grid_text", "耗时:", { "text": item.need_time + "s" });
        if (item.description) {
            alterNewNode.addNewLine("text_mid", "条件:", { "text": item.description });
        }
        alterNewNode.addNewLine("text_mid", "资源:", { "text": ">>>>>>>>>>>>>>>>" });
        alterNewNode.addNewLine("grid_text", "粮食:", { "text": item.need_resource.food });
        alterNewNode.addNewLine("grid_text", "钢铁:", { "text": item.need_resource.steel });
        alterNewNode.addNewLine("grid_text", "石油:", { "text": item.need_resource.oil });
        alterNewNode.addNewLine("grid_text", "稀矿:", { "text": item.need_resource.rare });
        alterNewNode.addNewLine("grid_text", "", { "text": "" });

        alterNewNode.Alert()

    },


    timeTostr(timeint) {
        if (timeint <= 0) {
            return "00:00:00"
        }
        var h = parseInt(timeint / 3600);
        var m = parseInt(timeint % 3600 / 60);
        var s = parseInt(timeint % 3600 % 60);
        if (h.length < 10) {
            h = '0' + h;
        }

        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        return h + ':' + m + ':' + s;
    },
    start() {

    },
    getNewItemPosition(floorX, floorY) {
        return cc.v2(floorX, floorY);
    },
    update(dt) {
        if (this.neetTime) {
            this.timeNum++
            if (this.timeNum % 30 == 0) {
                if (this.setShowTime() == 0) {
                    this.Upgrade()
                }
            }

        }
    },
});
