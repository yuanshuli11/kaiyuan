// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import VMParent from "./modelView/VMParent";
import { UserData } from './model/userdata';
import TsVLayout from './vlayouts/ts/TsVLayout';
import FMJava from "./FMJava";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends VMParent {

    @property(cc.Node)
    bodyNode: cc.Node = null;
    @property(cc.Node)
    resPage: cc.Node = null;

    @property(cc.Node)
    shareNode: cc.Node = null;

    @property(cc.Label)
    shareText: cc.Label = null;

    @property(cc.Node)
    TabNewNode: cc.Node = null;

    @property(cc.Node)
    ResNode: cc.Node = null;
    @property(cc.Node)
    LayoutBody: cc.Node = null;
    @property(cc.Node)
    LayoutNode: cc.Node = null;

    context: null;
    LayoutNewNodeObj: TsVLayout;
    timeNum: number = 0;
    initTabList() {
        var _this = this

        let ls = this.getGroupTab(_this.context.NowPage)
        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.TabName = nodeName
            _this.context.TabName = nodeName
            _this.ResNode.active = false
            _this.LayoutNode.active = true

            switch (nodeName) {
                case "Main":
                    _this.ResNode.active = true
                    _this.LayoutNode.active = false
                    _this.ReloadHomeRes(UserData.city.res)
                    _this.ReloadHomePeopleInfo(UserData.city.info)
                    UserData.reloadHomeInfo("resource,city,cityOfficer,cityArmy", null)
                    return
                case "Area":
                    _this.LayoutNewNodeObj.cleanChilds()
                    _this.rebindPath("city.areaList", _this.ReloadAreaPage)

                    _this.ResNode.active = false
                    _this.LayoutNode.active = true
                    _this.ReloadAreaPage(UserData.city.areaList)
                    UserData.reloadCityAreas(null)

                    return
                case "Owner":
                    _this.LayoutNewNodeObj.cleanChilds()
                    _this.ResNode.active = false
                    _this.LayoutNode.active = true
                    _this.listenerPath = "user.info"
                    _this.LoadUserInfo(UserData.user.info)
                    _this.rebindPath("user.info", _this.LoadUserInfo)
                    UserData.reloadHomeInfo("city,userGroup", null)

                    return
            }
        })
    }
    LoadUserInfo() {
        let _this = this
        this.LayoutNewNodeObj.cleanChilds()
        // this.data.name = data.name
        // this.data.content = data.content
        // this.data.clickNewFunc = data.clickNewFunc
        // this.data.clickNewFuncText = data.clickNewFuncText
        this.LayoutNewNodeObj.addUniqLine("username", {}, "text", "", function (item) {
            return {
                name: `统帅`,
                content: UserData.user.info.name,
                clickNewFunc: "operateCommander",
                clickNewFuncText: "改名",
                notShow: 0,
            }
        })
        if (UserData.user.logininfo.account) {
            this.LayoutNewNodeObj.addUniqLine("account", {}, "text", "", function (item) {
                return {
                    name: `账号`,
                    content: UserData.user.logininfo.account,
                    clickNewFunc: "showAccountDetail",
                    clickNewFuncText: "设置",
                    notShow: 0,
                }
            })
        } else {
            this.LayoutNewNodeObj.addUniqLine("account", {}, "text", "", function (item) {
                return {
                    name: `账号`,
                    content: cc.props.AlowDestroy ? "绑定邮箱/注销账号" : "绑定邮箱",
                    clickNewFunc: "showAccountDetail",
                    clickNewFuncText: "管理",
                    notShow: 0,
                }
            })
        }
        this.LayoutNewNodeObj.addUniqLine("qihao", {}, "text", "", function (item) {
            return {
                name: `旗号`,
                content: UserData.user.info.user_flag,
                clickNewFunc: "operateFlagCommander",
                clickNewFuncText: "修改",
                notShow: 0,
            }
        })
        this.LayoutNewNodeObj.addUniqLine("honor", {}, "text", "", function (item) {
            return {
                name: `荣誉:`,
                content: UserData.user.info.honor,
                notShow: 0,
            }
        })
        this.LayoutNewNodeObj.addUniqLine("juntuan", {}, "text", "", function (item) {
            return {
                name: `军团:`,
                content: UserData.user.info.group_id == 0 ? "未加入军团" : UserData.group.groupInfo.name,
                clickNewFunc: function () {
                    _this.context.skipScene("Group");
                },
                clickNewFuncText: UserData.user.info.group_id == 0 ? "加入" : "进入",
                notShow: 0,
            }
        })

        this.LayoutNewNodeObj.addUniqLine("zhiwei", {}, "text", "", function (item) {
            return {
                name: `职位:`,
                content: UserData.user.info.zhiwei_item ? UserData.user.info.zhiwei_item.name : "无",
                clickNewFunc: "showZhiWeiAlert",
                clickNewFuncText: "晋升",
                notShow: 0,
            }
        })
        this.LayoutNewNodeObj.addUniqLine("junxian", {}, "text", "", function (item) {
            return {
                name: `军衔:`,
                content: UserData.user.info.junxian_item ? UserData.user.info.junxian_item.name : "无",
                clickNewFunc: "showJunxianAlert",
                clickNewFuncText: "晋衔",
                notShow: 0,
            }
        })



        this.LayoutNewNodeObj.addUniqLine("baohu", {}, "text", "", function (item) {
            let notShow = 1
            if (UserData.user.info.producted_text) {
                notShow = 0
            }
            return {
                name: `保护期:`,
                content: "截止 " + UserData.user.info.producted_text,
                clickNewFunc: "",
                clickNewFuncText: "",
                notShow: notShow,
            }
        })
        if (UserData.user.info.vip_end_time > this.context.getServerTime()) {
            this.LayoutNewNodeObj.addUniqLine("vip", {}, "text", "", function (item) {

                return {
                    name: `会员:`,
                    content: "截止 " + this.context.TimestampToTime(UserData.user.info.vip_end_time),
                    clickNewFunc: "",
                    clickNewFuncText: "",
                    notShow: 0,
                }
            })
        }
        this.LayoutNewNodeObj.addUniqLine("zuanshi", {}, "text", "", function (item) {
            return {
                name: `钻石:`,
                content: UserData.user.info.diamonds,
                clickNewFunc: "exchangeDimands",
                clickNewFuncText: "获取",
                notShow: 0,
            }
        })
        // if (window.wx && window.wx.getAccountInfoSync && window.wx.getAccountInfoSync().miniProgram.appId == "wxcf35d47fbe89993e") {
        //     this.LayoutNewNodeObj.addUniqLine("msg", {}, "text", "", function (item) {

        //         return {
        //             name: `警讯:`,
        //             content: UserData.user.info.notify_end_time_text ? "截止" + UserData.user.info.notify_end_time_text : "订阅过期",
        //             clickNewFunc: "openNotify",
        //             clickNewFuncText: "启动",
        //             notShow: 0,
        //         }
        //     })
        // }
        // this.LayoutNewNodeObj.addUniqLine("tili", {}, "text", "玩法", function (item) {
        //     return {
        //         "name": "体力:",
        //         "content": UserData.user.info.ad_battle_time,
        //         "clickNewFunc": ``,
        //         "clickNewFuncText": ``
        //     }
        // })
        this.LayoutNewNodeObj.addUniqLine("wanfa", {}, "text", "玩法", function (item) {

            return {
                name: `玩法:`,
                content: "游戏玩法说明",
                clickNewFunc: "skipToPlay",
                clickNewFuncText: "阅读",
                notShow: 0,
            }
        })
    }
    onLoad() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

        if (!cc.props.childPage) {
            cc.props.childPage = 0
        }

        this.context.childPage = cc.props.childPage
        if (window.tt) {
            this.shareNode.active = true
        }
        this.LayoutNewNodeObj = this.LayoutNode.getComponent(TsVLayout)
        this.LayoutNewNodeObj.init(this)

        FMJava.InitCsj()
    }

    start() {
        this.bodyNode.height = this.node.height - 110
        this.resPage.height = this.bodyNode.height
        this.LayoutBody.height = this.bodyNode.height

        this.initTabList()
        if (cc.props.IsNew) {
            cc.props.IsNew = false
            // this.context.yindao()
            if (window.wx && window.wx.reportEvent) {
                wx.reportEvent('expt_init_success', { expt_data: 1 })
            }

        }
        // 显示页面的Header Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
        if (UserData.city.info.source_id >= 0) {
            cc.props.sourceID = UserData.city.info.source_id
        }
    }
    zhaoji() {
        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("召集", "召集")
        alter2Node.addNewLine("text", "", { "text": "" })

        alter2Node.addNewLine("wrap_text", "提示:", { "text": "使用移民条例/法案可增加城市人口" })
        var propMap = {}
        var textNode = null
        var propNode = alter2Node.addNewLine("selector", "道具:", { "value": [] }, function () {
            var id = Number(propNode.getValue())
            if (propMap[id]) {
                textNode.resetText("道具说明:", { "text": propMap[id].detail.desc })
            } else {
                textNode.resetText("道具说明:", { "text": "" })
            }
            return
        })
        alter2Node.addNewLine("wrap_text", "", { "text": "" })

        textNode = alter2Node.addNewLine("wrap_text", "", { "text": "" })
        var neweventNodeItem = this.context.newAlertItem()

        alter2Node.AddButton(neweventNodeItem.funcs["adPeople"])
        this.context.api.propListWithUseLoc(cc, "people_num", function (res) {
            var items = Array()
            items.push({ "text": "无", "value": 0 })

            for (var i = 0; i < res.length; i++) {
                if (res[i].number <= 0) {
                    continue
                }
                if (res[i].detail.use_loc != "people_num") {
                    continue
                }
                items.push({ "text": `${res[i].name}(${res[i].number})`, "value": res[i].id })
                propMap[res[i].id] = res[i]

            }
            propNode.setSelector(items)
        }, function (errMsg) {
            cc.log("error", "propListWithUseLoc", errMsg)
        })
        var _this = this

        alter2Node.OnButtonFunc = function () {
            var propID = Number(propNode.getValue())
            if (!propID) {
                this.context.Toast("请选择道具")
                return
            }
            var data = {
                "id": propID,
                "number": 1,
            }
            //调用道具接口
            _this.context.api.UserPropV2(cc, data, function (res) {
                alter2Node.onButtonCancel()
                if (res) {
                    _this.context.Toast(res.attr)
                } else {
                    _this.context.Toast("召集成功")
                }
                UserData.reloadHomeInfo("resource", null)

            }, function (msg) {
                _this.context.Toast(msg)
                alter2Node.onButtonCancel()
            })

        }
        alter2Node.Alert()
    }
    setLove() {
        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("安抚", "安抚")
        alter2Node.addNewLine("text", "", { "text": "" })

        alter2Node.addNewLine("wrap_text", "提示:", { "text": "花费10000黄金和100000粮食进行安抚。\n\n安抚可以增加城市民心，降低民怨。" })


        var _this = this

        alter2Node.OnButtonFunc = function () {
            if (UserData.city.info.next_love_time > this.context.getServerTime()) {
                _this.context.Toast(`冷却中(${UserData.city.info.next_love_time - this.context.getServerTime()}秒)`)
                return
            }

            _this.context.api.SetLove(cc, function (res) {
                UserData.city.info = res
                alter2Node.onButtonCancel()
                _this.context.Toast(`安抚成功`)
            }, function (msg) {
                _this.context.Toast(msg)
                alter2Node.onButtonCancel()

            })
        }
        alter2Node.Alert()


    }
    setTax() {
        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("设定税率", "确定")

        alter2Node.addNewLine("wrap_text", "提示:", { "text": "提高税率可以增加黄金收入，但是影响城内民心" })
        alter2Node.addNewLine("wrap_text", "范围:", { "text": "税率可以设定为10%-90%" })

        var taxValue = alter2Node.addNewLine("input_long", "税率:", { "value": UserData.city.res.gold_tax, "showNumberKey": true, "placeholder": "税率", "maxLength": 3 })
        var _this = this
        alter2Node.OnButtonFunc = function () {
            if (!Number(taxValue.getValue())) {
                _this.context.Toast("只能输入数字10-90")
                return
            }
            var num = Number(taxValue.getValue())

            if (num < 10 || num > 90) {
                _this.context.Toast("只能输入数字10-90")
                return
            }

            _this.context.api.SetTax(cc, num, function (res) {
                UserData.city.res.gold_tax = num
                UserData.city.res = UserData.city.res
                alter2Node.onButtonCancel()

            }, function (msg, error) {
                _this.context.Toast(msg)
                alter2Node.onButtonCancel()

            })
        }
        alter2Node.Alert()


    }
    ReloadAreaPage(res) {

        if (!res) {
            return
        }

        let context = this.context
        let _this = this
        this.LayoutNewNodeObj.diableChilds()

        for (var i = 0; i < res.length; i++) {
            //解决闭包问题
            (function (item) {
                _this.LayoutNewNodeObj.addUniqLine("city.areaList." + item.id, item, "text_map_item", "city.areaList." + i, function (data) {

                    let officerName = "无军官"
                    if (data.station_army && data.station_army.officer && data.station_army.officer.length > 0) {
                        officerName = data.station_army.officer[0].on
                        if (data.station_army.officer.length > 1) {
                            officerName = "*" + officerName
                        }
                    }
                    let status = "状态:无人驻守"
                    if (data.collect_begin > 0) {
                        status = "状态:采集⛏ "
                    } else if (officerName != "无军官") {
                        status = "状态:驻守 "
                    }
                    return {
                        name: `${data.city} (${data.lng},${data.lat})(${data.level}级)`,
                        status: status,
                        officer: officerName,
                        beginTime: data.collect_begin,
                        btn1Text: "详情",
                        btn1Func: "showMapDetail",
                        btn2Text: "派遣",
                        btn2Func: function () {

                            var actionData = {}
                            actionData.map = data
                            actionData.action = "派遣"
                            actionData.fromArea = false
                            cc.props.SceneContext = actionData
                            context.skipScene("Battle");
                        },
                        btn3Text: "召回",
                        btn3Func: function () {

                            var actionData = {}
                            actionData.map = data
                            actionData.action = "派遣"
                            actionData.fromArea = true
                            cc.props.SceneContext = actionData
                            context.skipScene("Battle");
                        },
                        notShow: data.city_id == UserData.city.info.id ? 0 : 1,
                    }
                })
            })(res[i])
        }
    }
    onEnable() {
        //通过脚本监听数值变化

        if (this.listenerPath) {
            this.VM.bindPath(this.listenerPath, this.OnChangeData, this);
        } else {
            this.VM.bindPath("city.res", this.ReloadHomeRes, this);
            this.VM.bindPath("city.info", this.ReloadHomePeopleInfo, this);
        }

    }
    OnChangeData(item) {
        if (this.loadFunc) {
            this.loadFunc(item)
        }
    }
    onDisable() {
        //记得移除监听变化
        this.VM.unbindPath("city.res", null, this)
        this.VM.unbindPath("city.info", null, this)
        if (this.listenerPath) {
            this.VM.unbindPath(this.listenerPath, this.OnChangeData, this)
        }
    }
    rebindPath(listenerPath: string, loadFunc) {
        this.VM.unbindPath("user.info", null, this);
        this.VM.unbindPath("city.res", null, this);
        this.VM.unbindPath("city.info", null, this);
        this.VM.unbindPath("city.areaList", null, this);

        this.listenerPath = listenerPath
        this.loadFunc = loadFunc
        if (this.listenerPath) {
            this.VM.bindPath(this.listenerPath, this.OnChangeData, this);
        }


    }
    ReloadHomeRes(cr) {
        if (!cr) {
            return
        }
        this.changeResNode("gold", cr.gold, cr.gold_change, null)
        this.changeResNode("food", cr.food, cr.food_change, null)
        this.changeResNode("steel", cr.steel, cr.steel_change, null)
        this.changeResNode("oil", cr.oil, cr.oil_change, null)
        this.changeResNode("rare", cr.rare, cr.rare_change, null)
        this.changeResNode("tax", cr.gold_tax, -1, null)
        this.changeResNode("people", cr.people, -1, cr.people_max)


    }
    ReloadHomePeopleInfo(c) {
        if (!c) {
            return
        }
        this.changeResNode("people_heart", c.people_love, -1, null)
        this.changeResNode("people_hate", c.people_hate, -1, null)
    }
    changeResNode(name, num, speed, max) {
        if (!this.context) {
            return
        }
        var newNum = this.context.numToString(num)
        if (name == "tax") {
            newNum += "%"
        }
        if (max > 0) {
            this.resPage.getChildByName(name).getChildByName("value").getComponent(cc.Label).string = newNum + "/" + max
        } else {
            this.resPage.getChildByName(name).getChildByName("value").getComponent(cc.Label).string = newNum
        }
        if (speed > 0) {
            this.resPage.getChildByName(name).getChildByName("unit").getComponent(cc.Label).string = this.context.numToString(speed) + "/h"
        }
    }





    onClickLuping() {
        var _this = this
        var context = this.context
        if (!context) {
            return
        }
        if (cc.props.fenxiangBegin > 0) {
            _this.reloadLupinButton()
            return
        } else if (cc.props.fenxiangBegin == -1) {
            if (window.tt) {
                tt.getSystemInfo({
                    success(res) {
                        const screenWidth = res.screenWidth;
                        const screenHeight = res.screenHeight;
                        const recorder = tt.getGameRecorderManager();
                        const clipIndexList = []; // 剪辑索引列表

                        var maskInfo = recorder.getMark();
                        var x = (screenWidth - maskInfo.markWidth) / 2;
                        var y = (screenHeight - maskInfo.markHeight) / 2;

                        recorder.onStart((res) => {
                            cc.props.fenxiangBegin = context.getServerTime() + 30
                            console.log("录屏开始");
                            // do something;
                            _this.reloadLupinButton()
                        });
                        //添加水印并且居中处理
                        recorder.start({
                            duration: 30,
                            isMarkOpen: true,
                            locLeft: x,
                            locTop: y,
                        });
                        recorder.onStop((recorderRes) => {
                            cc.props.fenxiangBegin = -1

                            if (_this && _this.reloadLupinButton) {
                                _this.reloadLupinButton()
                            }
                            var alter2Node = context.NewAlert2()
                            alter2Node.InitAlert("录屏完成", "分享")
                            alter2Node.addNewLine("text", "", { "text": "" })
                            alter2Node.addNewLine("text_mid", "录频时长:", { "text": "30s" })
                            alter2Node.addNewLine("wrap_text", "提示:", { "text": "欢迎分享录屏，让更多小伙伴看到你的精彩瞬间！\n\n\n点击分享后，可以编辑视频。做出更精彩的效果哦!" })

                            alter2Node.OnButtonFunc = function () {
                                tt.shareAppMessage({
                                    title: "我的游戏分享",
                                    channel: "video",
                                    extra: {
                                        videoTopics: ["小兵爱登顶", "带你起飞，和我一起统帅千军吧"], // 抖音或头条小视频话题列表
                                        videoPath: recorderRes.videoPath,
                                        withVideoId: true,
                                    },
                                    success(res) {
                                        tt.showModal({
                                            title: "分享成功",
                                            content: "也许下一个明星统帅就是你哦～",
                                        });
                                    },
                                    fail(e) {
                                        console.log("分享失败:", e)
                                        tt.showModal({
                                            title: "分享失败",
                                            content: "点击分享按钮再试一试",
                                        });
                                    },
                                });
                            }
                            alter2Node.Alert()
                        });
                    },
                });
            }
        }
    }
    flushLupinButton() {
        if (cc.props.fenxiangBegin >= 0) {
            var remaining = cc.props.fenxiangBegin - this.context.getServerTime()
            if (remaining < 0) {
                remaining = 0
            }
            if (remaining > 0) {
                this.shareText.string = "录屏中(" + remaining + ")"
            } else {
                this.shareText.string = "录屏中"
            }
            this.shareNode.interactable = false
        } else {
            this.shareText.string = "录屏分享"
            this.shareNode.interactable = true
        }
    }
    reloadLupinButton() {
        if (!this.shareNode) {
            return
        }
        if (cc.props.childPage != 0) {
            this.shareNode.active = false
            return
        }
        if (window.tt) {
            this.shareNode.active = true
        } else {
            this.shareNode.active = false
        }
        this.flushLupinButton()
    }
    getGroupTab(focusTab) {
        var ls = Array()
        ls.push({
            "text": "城市信息",
            "name": "Main",
            "width": 80,
            "focus": 1
        })
        ls.push({
            "text": "统帅信息",
            "name": "Owner",
            "width": 80,
            "focus": 0
        })
        ls.push({
            "text": "附属野地",
            "name": "Area",
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
    }
    update(dt) {
        if (cc.props.fenxiangBegin > 0) {
            this.timeNum++
            if (this.timeNum % 30 == 0) {
                this.flushLupinButton()
            }
        }

    }
}
