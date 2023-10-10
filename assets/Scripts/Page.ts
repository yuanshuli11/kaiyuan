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
export default class Page extends VMParent {
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

    @property(cc.Node)
    TabNewNode: cc.Node = null;
    TabName: string;
    listenerPath: string;
    loadFunc: any;
    context: any;
    Button1Func: any;
    Button2Func: any;
    Button1Data: {};
    Button2Data: {};
    // LIFE-CYCLE CALLBACKS:
    initTabList() {
        var _this = this

        let ls = this.getGroupTab(_this.context.TabName)

        this.TabNewNode.getComponent('Tab').init(ls, function (nodeName) {
            _this.TabName = nodeName
            _this.cleanContent()
            _this.context.TabName = nodeName
            switch (nodeName) {
                case "groupList":
                    _this.rebindPath("group.groupList", _this.loadGroupList)
                    _this.loadGroupList(UserData.group.groupList)
                    return
                case "groupMember":
                    _this.rebindPath("group.groupMembers", _this.loadGroupMemberPage)
                    _this.loadGroupMemberPage(UserData.group.groupMembers)

                    return
                case "groupHandler":
                    _this.rebindPath("group.groupMembers", _this.loadGroupMemberPage)
                    _this.loadGroupMemberPage(UserData.group.groupMembers)
                    return
                case "groupRelation":
                    _this.loadGroupRelation()
                    return
            }
        })
    }

    loadGroupMemberPage(members) {

        let _this = this
        if (_this.context.TabName != "groupMember" && _this.context.TabName != "groupHandler") {
            return
        }

        _this.VLayoutNode.cleanChilds()
        if (_this.TabName == "groupMember") {
            _this.VLayoutNode.addUniqLine("header", {}, "text", "", function (item) {
                return {
                    name: "成员",
                    content: "职位",
                    clickNewFunc: "",
                    clickNewFuncText: "",
                    notShow: 0,
                }
            })
        }

        for (var i = 0; i < members.length; i++) {
            //解决闭包问题
            (function (member, i) {
                _this.VLayoutNode.addUniqLine("group.groupMembers." + member.id, member, "text", "group.groupMembers." + i, function (item) {
                    let notShow = _this.TabName == "groupMember" ? (item.status == 30 ? 0 : 1) : (item.status == 10 ? 0 : 1)
                    let clickNewFunc = _this.TabName == "groupMember" ? "showgroupMemberDetail" : "showgroupMemberDetail"
                    let clickNewFuncText = _this.TabName == "groupMember" ? "查看" : "审批"

                    return {
                        name: item.user_name,
                        content: item.role_text,
                        clickNewFunc: clickNewFunc,
                        clickNewFuncText: clickNewFuncText,
                        notShow: notShow,
                    }
                })
            })(members[i], i)
        }

        if (_this.TabName == "groupHandler") {

            _this.VLayoutNode.addUniqLine("tech1", UserData.group.groupInfo.tech_1, "text", "", function (item) {
                return {
                    name: "军团",
                    content: UserData.group.groupInfo.tech_1.name,
                    clickNewFunc: "showTechDetail",
                    clickNewFuncText: "研究",
                    notShow: 0,
                }
            })
            _this.VLayoutNode.addUniqLine("tech2", UserData.group.groupInfo.tech_2, "text", "", function (item) {
                return {
                    name: "军团",
                    content: UserData.group.groupInfo.tech_2.name,
                    clickNewFunc: "showTechDetail",
                    clickNewFuncText: "研究",
                    notShow: 0,
                }
            })
            _this.VLayoutNode.addUniqLine("tech3", UserData.group.groupInfo.tech_3, "text", "", function (item) {
                return {
                    name: "军团",
                    content: UserData.group.groupInfo.tech_3.name,
                    clickNewFunc: "showTechDetail",
                    clickNewFuncText: "研究",
                    notShow: 0,
                }
            })
            _this.VLayoutNode.addUniqLine("tech4", UserData.group.groupInfo.tech_4, "text", "", function (item) {
                return {
                    name: "军团",
                    content: UserData.group.groupInfo.tech_4.name,
                    clickNewFunc: "showTechDetail",
                    clickNewFuncText: "研究",
                    notShow: 0,
                }
            })
            _this.VLayoutNode.addUniqLine("tech5", UserData.group.groupInfo.tech_5, "text", "", function (item) {
                return {
                    name: "军团",
                    content: UserData.group.groupInfo.tech_5.name,
                    clickNewFunc: "showTechDetail",
                    clickNewFuncText: "研究",
                    notShow: 0,
                }
            })
            _this.VLayoutNode.addUniqLine("tuichu", {}, "text", "", function (item) {
                return {
                    name: "个人",
                    content: "我要退团",
                    clickNewFunc: "ExitGroupConfirm",
                    clickNewFuncText: "退出",
                    notShow: 0,
                }
            })
        }
        this.PageButton1.node.active = false
        this.PageButton2.node.active = false
    }
    loadGroupRelation() {
        this.data.Button1Text = "添加敌对"
        if (this.context.ListFunc["addHostile"]) {
            this.Button1Func = this.context.ListFunc["addHostile"]
        }
        this.PageButton1.node.active = true
        let _this = this
        _this.VLayoutNode.cleanChilds()
        this.context.api.RelationList(cc, "group", function (res) {
            if (!res || res.length == 0) {
                _this.VLayoutNode.addNewLine("text", "-", {}, function () {
                    return {
                        name: "",
                        content: "暂无敌对军团",
                        clickNewFunc: "",
                        clickNewFuncText: "",
                        notShow: 0,
                    }
                })

                return
            }
            _this.VLayoutNode.addNewLine("text", "-", {}, function () {
                return {
                    name: "军团名称",
                    content: "关系",
                    clickNewFunc: "",
                    clickNewFuncText: "",
                    notShow: 0,
                }
            })
            for (var i = 0; i < res.length; i++) {
                (function (resItem) {
                    _this.VLayoutNode.addNewLine("text", "i" + i, resItem, function (resItem) {
                        console.log("===", JSON.stringify(UserData.group.groupMyInfo))
                        if (UserData.group.groupMyInfo.role > 0) {
                            return {
                                name: resItem.attr.name,
                                content: resItem.status == 1 ? "敌对" : "友好",
                                clickNewFunc: "addYouhao",
                                clickNewFuncText: "友好",
                                notShow: 0,
                            }
                        } else {
                            return {
                                name: resItem.attr.name,
                                content: resItem.status == 1 ? "敌对" : "友好",
                                clickNewFunc: "",
                                clickNewFuncText: "",
                                notShow: 0,
                            }
                        }

                    })
                })(res[i])
            }


        }, function (errorMsg) {

        })
    }
    loadGroupList(groupList) {

        let _this = this
        if (_this.context.TabName != "groupList") {
            return
        }
        if (UserData.user.info.group_id == 0) {
            this.data.Button1Text = "创建军团"
            if (this.context.ListFunc["createGroup"]) {
                this.Button1Func = this.context.ListFunc["createGroup"]
            }

            this.data.Button2Text = "我的申请"
            if (this.context.ListFunc["myApply"]) {
                this.Button2Func = this.context.ListFunc["myApply"]
            }
            this.PageButton1.node.active = true
            this.PageButton2.node.active = true
        } else {
            this.PageButton1.node.active = false
            this.PageButton2.node.active = false

        }
        if (!groupList || groupList.length <= 0) {
            return
        }
        _this.VLayoutNode.cleanChilds()
        _this.VLayoutNode.addUniqLine("header", {}, "text", "", function (item) {
            return {
                name: "军团",
                content: "荣誉",
                clickNewFunc: "",
                clickNewFuncText: "",
                notShow: 0,
            }
        })

        for (var i = 0; i < groupList.length; i++) {
            //解决闭包问题

            (function (groupItem, i) {
                _this.VLayoutNode.addUniqLine("group.groupList." + groupItem.id, groupItem, "text", "group.groupList." + i, function (item) {
                    return {
                        name: item.name,
                        content: item.honor,
                        clickNewFunc: "groupDetail",
                        clickNewFuncText: "查看",
                        notShow: 0,
                    }
                })

            })(groupList[i], i)
        }
        _this.VLayoutNode.addUniqLine("footer", {}, "text", "", function (item) {
            return {
                name: "",
                content: "",
                clickNewFunc: "",
                clickNewFuncText: "",
                notShow: 0,
            }
        })


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

        this.PageButton1.node.active = false
        this.PageButton2.node.active = false
        this.VLayoutNode = this.VLayoutNode.getComponent(TsVLayout)
        this.VLayoutNode.init(this)
        this.initTabList()
        UserData.reloadHomeInfo("userGroup,groupMember", null)

    }
    onEnable() {
        //通过脚本监听数值变化
        if (this.listenerPath) {
            this.VM.bindPath(this.listenerPath, this.OnChangeData, this);

        }
    }
    rebindPath(listenerPath: string, loadFunc) {
        if (this.listenerPath) {
            this.VM.unbindPath(this.listenerPath, null, this);
        }

        this.listenerPath = listenerPath
        this.loadFunc = loadFunc
        if (this.listenerPath) {
            this.VM.bindPath(this.listenerPath, this.OnChangeData, this);
        }


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
    onDisable() {
        //记得移除监听变化
        if (this.listenerPath) {
            this.VM.unbindPath(this.listenerPath, this.OnChangeData, this)
        }
    }
    OnChangeData(item) {
        if (this.loadFunc) {
            this.initTabList()
            this.loadFunc(item)
        }
    }
    start() {
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)

    }
    getGroupTab(focusTab) {
        var ls = Array()

        if (UserData.user.info.group_id == 0) {
            ls.push({
                "text": "军团列表",
                "name": "groupList",
                "width": 80,
                "focus": 1
            })
        } else {
            ls.push({
                "text": "成员",
                "name": "groupMember",
                "width": 60,
                "focus": focusTab == "groupMember" ? 1 : 0
            }, {
                "text": "事务",
                "name": "groupHandler",
                "width": 60,
                "focus": focusTab == "groupHandler" ? 1 : 0

            }, {
                "text": "关系",
                "name": "groupRelation",
                "width": 60,
                "focus": focusTab == "groupRelation" ? 1 : 0

            }, {
                "text": "列表",
                "name": "groupList",
                "width": 60,
                "focus": focusTab == "groupList" ? 1 : 0

            })
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
    cleanContent() {
        if (this.VLayoutNode) {
            this.VLayoutNode.cleanChilds()
        }
    },
    // update (dt) {}
}
