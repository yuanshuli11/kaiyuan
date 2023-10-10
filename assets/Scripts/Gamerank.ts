// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import VMParent from "./modelView/VMParent";
import { UserData } from './model/userdata';
import TsVLayout from './vlayouts/ts/TsVLayout';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Gamerank extends VMParent {
    data = {
        Button1Text: "",
        Button2Text: ""
    }
    @property(cc.Layout)
    VLayoutNode: TsVLayout = null;
    @property(cc.Button)
    PageButton1: cc.Button = null;
    @property(cc.Button)
    PageButton2: cc.Button = null;
    @property(cc.Button)
    PageButton3: cc.Button = null;
    @property(cc.Button)
    PageButton4: cc.Button = null;
    @property(cc.Node)
    turnPageNode: cc.Node = null;
    @property(cc.Node)
    TabNewNode: cc.Node = null;
    TabName: string;
    listenerPath: string;
    loadFunc: any;
    context: any;
    Button1Func: any;
    Button2Func: any;
    Button3Func: any;
    Button4Func: any;
    @property(cc.Label)
    Button1Name: cc.Label = null;
    @property(cc.Label)
    Button2Name: cc.Label = null;
    @property(cc.Label)
    Button3Name: cc.Label = null;
    @property(cc.Label)
    Button4Name: cc.Label = null;
    PageNum: number;
    turnPageObj: null;
    tType: "";
    // LIFE-CYCLE CALLBACKS:
    initTabList() {
        var _this = this

        let ls = this.getGroupTab(_this.context.NowPage)

        this.TabNewNode.getComponent('Tab').init(ls, (nodeName) => {
            this.TabName = nodeName
            this.cleanContent()
            this.context.TabName = nodeName
            // _this.PageButton1.active = false
            // _this.PageButton2.active = false
            // _this.PageButton3.active = false
            // _this.PageButton4.active = false
            this.turnPageNode.active = false
            this.showHonourFunc()

            switch (nodeName) {
                case "officer":
                    this.showOfficerFunc()
                    this.loadOfficerList("officer_power", 1)
                    this.turnPageNode.active = true
                    return
                case "p2p_honor":
                    this.loadOfficerList("p2p_honor", 1)
                    return
                case "all_honor":
                    this.loadHonourList("all_honor", 1)
                    return
                case "week_koutimes":
                    this.loadOfficerList("week_koutimes", 1)
                    return
                case "army_num":
                    this.loadArmyNumList("army_num", 1)
                    return
                case "diamands":
                    // 用户充值流水
                    this.loadUserDiamands()
                    return
                case "battle":
                    this.loadActivityList()
                    return
            }
        })
    }
    showHonourFunc() {
        this.PageButton1.node.active = false
        this.PageButton2.node.active = false
        this.PageButton3.node.active = false
        this.PageButton4.node.active = false
    }

    showOfficerFunc() {

        this.PageButton1.node.active = true
        this.Button1Name.string = "军事"
        this.PageButton2.node.active = true
        this.Button2Name.string = "学识"
        this.PageButton3.node.active = true
        this.Button3Name.string = "后勤"
        this.PageButton4.node.active = true
        this.Button4Name.string = "等级"
        this.PageButton4.node.active = true

        this.PageButton1.interactable = false
        this.PageButton2.interactable = true
        this.PageButton3.interactable = true
        this.PageButton4.interactable = true
        this.btn1NodeFunc = () => {
            this.PageButton1.interactable = false
            this.PageButton2.interactable = true
            this.PageButton3.interactable = true
            this.PageButton4.interactable = true
            this.loadOfficerList("officer_power", 1)
        }
        this.btn2NodeFunc = () => {
            this.PageButton1.interactable = true
            this.PageButton2.interactable = false
            this.PageButton3.interactable = true
            this.PageButton4.interactable = true
            this.loadOfficerList("officer_knowledge", 1)
        }
        this.btn3NodeFunc = () => {
            this.PageButton1.interactable = true
            this.PageButton2.interactable = true
            this.PageButton3.interactable = false
            this.PageButton4.interactable = true
            this.loadOfficerList("officer_service", 1)
        }
        this.btn4NodeFunc = () => {
            this.PageButton1.interactable = true
            this.PageButton2.interactable = true
            this.PageButton3.interactable = true
            this.PageButton4.interactable = false
            this.loadOfficerList("level", 1)
        }
    }

    onLoad() {
        super.onLoad();
        if (!UserData.user.info) {
            //TODO 可跳转到登录页面
            return
        }
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')

        this.context.resetFitView(this.node)

        this.VLayoutNode = this.VLayoutNode.getComponent(TsVLayout)
        this.VLayoutNode.init(this)
        this.PageButton1.node.active = false
        this.PageButton2.node.active = false
        this.PageButton3.node.active = false
        this.PageButton4.node.active = false
        this.initTabList()

        this.turnPageObj = this.turnPageNode.getComponent('Pageaction')
    }
    loadPageRank(tType, page) {
        switch (tType) {
            case "all_honor":
                this.loadHonourList("all_honor", page)
                break
            case "p2p_honor":
                this.loadHonourList("p2p_honor", page)
                break
            default:
                this.loadOfficerList(tType, page)
                return
        }
    }
    loadActivityList() {
        var _this = this
        this.context.api.GetActivityList(cc, function (ls) {
            if (!ls) {
                return
            }
            //解决闭包问题
            for (var item of ls) {
                (function (item) {
                    if (!item.config || (_this.context.getServerTime() > item.config.end_time)) {
                        return
                    }

                    _this.VLayoutNode.addNewLine("wrap_text", "", { "data": { "source_id": item.id, "attr": item, } }, function () {
                        return {
                            "name": item.config.name,
                            "content": `进行中`,
                            "clickNewFunc": item.config ? item.config.action : `enterActivity`,
                            "clickNewFuncText": `进入`
                        }
                    })
                })(item)

            }
        })

    }
    loadUserDiamands() {
        if (!UserData.user.info.total_money || UserData.user.info.total_money <= 0) {
            return
        }
        this.VLayoutNode.addNewLine("wrap_text", "", {}, function () {
            if (UserData.user.info.next_limit_receive == -1) {
                return {
                    "name": "",
                    "content": ``,
                    "clickNewFunc": ``,
                    "clickNewFuncText": ``
                }
            }
        })
        if (UserData.user.info.total_money <= 0) {
            this.VLayoutNode.addNewLine("text", "", {

            }, function () {
                return {
                    "name": "暂无流水",
                    "content": ""
                }
            })
        } else {

            this.VLayoutNode.addNewLine("wrap_text", "", {}, function () {
                return {
                    "name": "",
                    "content": ""
                }
            })

            this.VLayoutNode.addNewLine("wrap_text", "", {}, function () {
                if (UserData.user.info.next_limit_receive == -1) {
                    return {
                        "name": "已充值:",
                        "content": UserData.user.info.total_money + "钻石" + ` 暂无下阶段奖励`,
                        "clickNewFunc": ``,
                        "clickNewFuncText": ``
                    }
                } else {
                    return {
                        "name": "已充值:",
                        "content": UserData.user.info.total_money + "钻石" + `${UserData.user.info.total_money > UserData.user.info.next_limit_receive ? "(已达成)" : ""}`,
                        "clickNewFunc": `${UserData.user.info.total_money >= UserData.user.info.next_limit_receive ? "receiveTotalLimit" : ""}`,
                        "clickNewFuncText": `${UserData.user.info.total_money >= UserData.user.info.next_limit_receive ? "领取" : ""}`
                    }
                }

            })
            if (UserData.user.info.next_reward) {
                this.addChongzhiItem(this.VLayoutNode, UserData.user.info.next_reward)
            }
            if (this.context.dict.activity) {
                this.VLayoutNode.addNewLine("wrap_text", "", {}, function () {
                    return {
                        "name": "",
                        "content": ""
                    }
                })
                this.VLayoutNode.addNewLine("wrap_text", "", {}, function () {
                    return {
                        "name": "",
                        "content": ">>>>>更多活动>>>>>"
                    }
                })
                for (var i = 0; i < this.context.dict.activity.length; i++) {
                    this.addChongzhiItem(this.VLayoutNode, this.context.dict.activity[i])
                    this.VLayoutNode.addNewLine("right_line", "", {}, function () {
                        return {
                            "name": "",
                            "content": ""
                        }
                    })
                }
            }
        }
    }
    addChongzhiItem(vLayoutNode, reward) {
        if (!reward) {
            return
        }
        vLayoutNode.addNewLine("wrap_text", "", {}, function () {
            return {
                "name": "充值活动:",
                "content": reward.name
            }
        })
        if (reward.officer) {
            for (var i = 0; i < reward.officer.length; i++) {
                vLayoutNode.addNewLine("wrap_text", "", {}, function () {
                    return {
                        "name": reward.officer[i].on + ":",
                        "content": `后勤: +${reward.officer[i].os} \n军事: +${reward.officer[i].op}\n学识: +${reward.officer[i].ok}\n属性点: +${reward.officer[i].attr_num}`
                    }
                })
            }
        }
        if (reward.prop) {
            for (var i = 0; i < reward.prop.length; i++) {
                let color = null
                if (reward.prop[i].color) {
                    color = new cc.Color().fromHEX(reward.prop[i].color);
                }
                if (i == 0) {

                    vLayoutNode.addNewLine("wrap_text", "", {}, function () {
                        return {
                            "name": "道具奖励:",
                            "content": `${reward.prop[i].text}: +${reward.prop[i].num}`,
                            "valueColor": color,
                        }
                    })
                } else {
                    vLayoutNode.addNewLine("wrap_text", "", {}, function () {
                        return {
                            "name": "",
                            "content": `${reward.prop[i].text}: +${reward.prop[i].num}`,
                            "valueColor": color,
                        }
                    })
                }

            }
        }

    }
    loadArmyNumList(tType, page) {
        if (page > 1) {
            return
        }
        if (page < 1) {
            return
        }
        if (tType) {
            this.tType = tType
        }
        this.PageNum = page

        this.context.api.getRankList(cc, this.tType, page, (res) => {

            if (!res || res.length == 0) {
                return
            }
            this.VLayoutNode.cleanChilds()
            this.VLayoutNode.addNewLine("text_rank_item", "", {
                "rank": ">>",
                "user": "玩家",
                "name": "排行",
                "score": "",
            }, null)
            for (var i = 0; i < res.length; i++) {
                this.VLayoutNode.addNewLine("text_rank_item", "", {
                    "rank": ">>",
                    "user": res[i].user_name,
                    "name": res[i].rank,
                    "score": "",
                }, null)
            }

            this.resetTurnPage(this.PageNum)
        }, () => {

        })
    }
    loadHonourList(tType, page) {
        if (page > 1) {
            return
        }
        if (page < 1) {
            return
        }
        if (tType) {
            this.tType = tType
        }
        this.PageNum = page

        this.context.api.getRankList(cc, this.tType, page, (res) => {

            if (!res || res.length == 0) {
                return
            }
            this.VLayoutNode.cleanChilds()
            this.VLayoutNode.addNewLine("text_rank_item", "", {
                "rank": "排行",
                "user": "军衔",
                "name": "用户",
                "score": "数值",
            }, null)
            for (var i = 0; i < res.length; i++) {
                this.VLayoutNode.addNewLine("text_rank_item", "", {
                    "rank": res[i].rank,
                    "user": res[i].officer_name,
                    "name": res[i].user_name,
                    "score": res[i].score,
                }, null)
            }

            this.resetTurnPage(this.PageNum)
        }, () => {

        })
    }

    loadOfficerList(tType, page) {
        if (page > 10) {
            return
        }
        if (page < 1) {
            return
        }
        if (tType) {
            this.tType = tType
        }
        this.PageNum = page
        this.context.api.getRankList(cc, this.tType, page, (res) => {
            if (!res || res.length == 0) {
                return
            }

            this.VLayoutNode.cleanChilds()

            if (tType == "p2p_honor" || tType == "week_koutimes") {
                this.VLayoutNode.addNewLine("text_rank_item", "", {
                    "rank": "排行",
                    "user": "军衔",
                    "name": "用户",
                    "score": "数值",
                }, null)
                for (var i = 0; i < res.length; i++) {
                    this.VLayoutNode.addNewLine("text_rank_item", "", {
                        "rank": res[i].rank,
                        "user": res[i].officer_name,
                        "name": res[i].user_name,
                        "score": res[i].score,
                    }, null)
                }
            } else {
                this.VLayoutNode.addNewLine("text_rank_item", "", {
                    "rank": "排行",
                    "name": "军官",
                    "user": "用户",
                    "score": "数值",
                }, null)
                for (var i = 0; i < res.length; i++) {
                    this.VLayoutNode.addNewLine("text_rank_item", "", {
                        "rank": res[i].rank,
                        "name": res[i].officer_name,
                        "user": res[i].user_name,
                        "score": res[i].score,
                    }, null)
                }
            }
            if (tType == "week_koutimes" || tType == "p2p_honor") {
                this.VLayoutNode.addNewLine("wrap_text", "", {
                    "content": "每周日24:00重置"
                }, function (item) {
                    return {
                        name: `>>>>>>`,
                        content: "每周日24:00重置      >>>>>>",
                    }
                })
            }
            this.resetTurnPage(this.PageNum)
        }, () => {

        })
    }

    btn1NodeFunc() {
        if (this.Button1Func) {
            this.Button1Func(this.context, this.Button1Data)
        }
    }
    btn2NodeFunc() {
        if (this.Button2Func) {
            this.Button2Func(this.context, this.Button2Data)
        }
    }
    btn3NodeFunc() {
        if (this.Button3Func) {
            this.Button3Func(this.context, this.Button3Data)
        }
    }
    btn4NodeFunc() {
        if (this.Button4Func) {
            this.Button4Func(this.context, this.Button4Data)
        }
    }
    start() {
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
    }
    getGroupTab(focusTab) {
        var ls = Array()

        switch (focusTab) {
            case "Gamerank":
                ls.push(
                    {
                        "text": "军官",
                        "name": "officer",
                        "width": 60,
                        "focus": 1
                    },
                    {
                        "text": "荣誉",
                        "name": "all_honor",
                        "width": 60,
                        "focus": 0
                    },
                    {
                        "text": "击伤",
                        "name": "p2p_honor",
                        "width": 60,
                        "focus": 0
                    },
                    {
                        "text": "战力",
                        "name": "army_num",
                        "width": 60,
                        "focus": 0
                    },

                )
                break;
            case "Activity":
                ls.push(
                    {
                        "text": "活动",
                        "name": "battle",
                        "width": 80,
                        "focus": 1
                    },
                )
                if (cc.props.showLeiChong) {
                    ls.push(
                        {
                            "text": "累充",
                            "name": "diamands",
                            "width": 80,
                            "focus": 0
                        },

                    )
                }
                break;
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
    resetTurnPage(page) {
        //page limit this
        if (this.turnPageObj) {
            this.turnPageObj.resetTurnPage(page, 10, this, "LoadPageRank")
        }

    }
    cleanContent() {
        if (this.VLayoutNode) {
            this.VLayoutNode.cleanChilds()
        }
    }
    // update (dt) {}
}
