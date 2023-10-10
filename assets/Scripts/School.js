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
        flushTime: {
            default: null,
            type: cc.Label
        },
        flushButton: {
            default: null,
            type: cc.Button
        },
        flushButtonLabel: {
            default: null,
            type: cc.Label
        },
        // adflushTime: {
        //     default: null,
        //     type: cc.Label
        // },
        // adNode: {
        //     default: null,
        //     type: cc.Node
        // },
        // adflushButton: {
        //     default: null,
        //     type: cc.Button
        // },
        // adflushButtonLabel: {
        //     default: null,
        //     type: cc.Label
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.timeNum = 0
        this.nowPage = 0


        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')
        this.SchoolBuilding = null
        this.resetBody()
    },
    resetTimeButton() {
        if (!this.SchoolBuilding || !this.SchoolBuilding.attr) {
            return
        }
        if (!this.SchoolBuilding.attr.next_time) {
            this.SchoolBuilding.attr.next_time = this.context.getServerTime()
        }


        var remaining = this.SchoolBuilding.attr.next_time - this.context.getServerTime()
        if (remaining <= 0) {
            remaining = 0
            this.flushButton.interactable = true
            this.flushTime.node.active = false
            this.flushButtonLabel.string = "刷新军校"
        } else {
            this.flushButton.interactable = false
            this.flushTime.node.active = true
            this.flushTime.string = this.context.timeTostr(remaining)
            this.flushButtonLabel.string = "冷却中.."
        }



    },
    flushList() {
        var _this = this
        if (!this.SchoolBuilding || !this.SchoolBuilding.attr) {
            return
        }
        if (!this.SchoolBuilding.attr.next_time) {
            this.SchoolBuilding.attr.next_time = this.context.getServerTime()
        }
        if (this.SchoolBuilding.attr && (this.SchoolBuilding.attr.next_time - this.context.getServerTime() > 0)) {
            this.context.Toast("每20分钟可刷新一次")
            return
        }
        this.context.api.flushSchool(cc, function (res) {
            _this.resetBody()
            _this.context.Toast("刷新成功")
        })
    },
    // adFlushList() {
    //     var _this = this
    //     if (!this.SchoolBuilding.attr.ad_next_time) {
    //         this.SchoolBuilding.attr.ad_next_time = this.context.getServerTime()
    //     }
    //     if (this.SchoolBuilding.attr && (this.SchoolBuilding.attr.ad_next_time - this.context.getServerTime() > 0)) {
    //         this.context.Toast("每5分钟可广告刷新一次")
    //         return
    //     }

    //     this.context.Ad.ShowAd("army", function () {
    //         _this.context.api.adFlushSchool(cc, function (res) {
    //             _this.resetBody()
    //             _this.context.Toast("刷新成功")
    //         })
    //     }, function (err) {
    //         _this.context.Toast(err)
    //     })

    // },
    resetBody() {
        var _this = this
        if (this.lockClick || !_this.VLayoutNewNodeObj) {
            return
        }

        this.lockClick = true

        this.context.api.getSchoolOfficer(cc, function (res) {
            _this.lockClick = false
            if (!_this.VLayoutNewNodeObj) {
                return
            }
            _this.VLayoutNewNodeObj.init(_this)
            _this.SchoolBuilding = res.school
            if (!res.school) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>还未建造军校,去建造>></c>" }, function (event, attr) {
                    cc.props.NowPage = "ArmyBuilding"
                    _this.context.NowPage = "ArmyBuilding"
                    cc.director.loadScene("Building");
                })
            } else if (!res.officer) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>军官被招完了，10分钟可刷新一次</c>" }, function (event, attr) {
                    //   _this.flushList()
                })
            } else {
                for (var i = 0; i < res.officer.length; i++) {
                    var item = res.officer[i]
                    _this.VLayoutNewNodeObj.addNewLine("text_mid", res.officer[i].officer_name, { "text": _this.getAttrStr(res.officer[i]), "cusButtonText": "招募", "attr": item }, function (attr) {
                        _this.zhaomu(attr.attr.id)
                    })
                }
            }
        }, function () {
            this.lockClick = false
        })
    },
    zhaomu(id) {
        var _this = this
        this.context.api.zhaomuOfficer(cc, id, function (res) {
            _this.context.Toast("招募成功")
            _this.resetBody()
        })
    },
    getAttrStr(officer) {
        return "" + officer.officer_service + "/" + officer.officer_power + "/" + officer.officer_knowledge + "/" + officer.level + "(" + officer.star + "星)"
    },

    start() {
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
    },

    update(dt) {

        this.timeNum++
        if (this.timeNum % 30 == 0) {
            this.resetTimeButton()
        }

    },
});
