// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { UserData } from "./model/userdata";
import TouchItem from "./tools/TouchItem";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    touchNode: cc.Node = null;
    @property(cc.Node)
    touchV: cc.Node = null;
    @property(cc.Node)
    touchH: cc.Node = null;

    @property(cc.Node)
    buildingNode: cc.Node = null;
    @property(cc.Node)
    buildingNodeHandler: cc.Node = null;

    @property(cc.Node)
    armyNode: cc.Node = null;
    @property(cc.Node)
    armyNodeHandler: cc.Node = null;

    @property(cc.Node)
    billingNode: cc.Node = null;
    flushSwitch: boolean = false;
    timeNum: number = 0;

    @property(cc.Node)
    msgNode: cc.Node = null;

    @property(cc.Node)
    reportNode: cc.Node = null;

    @property(cc.Node)
    taskNode: cc.Node = null;

    @property(cc.Label)
    cityName: cc.Label = null;
    touchObj: TouchItem;
    reportObj: TouchItem;
    hasTouch: boolean = false;
    hasReportTouch: boolean = false;
    billItems: {};
    context: null;
    onLoad() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }

        this.timeNum = 0
        this.billItems = {}
    }


    onTouchClick() {
        if (this.hasTouch) {
            cc.tween(this.touchV).to(0.2, { height: 0 }).start();
            cc.tween(this.touchH).to(0.2, { width: 0 }).start();
            this.hasTouch = false
        } else {
            cc.tween(this.touchV).to(0.2, { height: 200 }).start();
            cc.tween(this.touchH).to(0.2, { width: 160 }).start();
            this.hasTouch = true
            cc.tween(this.armyNodeHandler).to(0.2, { width: 0, height: 0 }).start();
            cc.tween(this.buildingNodeHandler).to(0.2, { width: 0, height: 0 }).start();
        }
    }

    cleanEventStep(itemName) {

        let id = 0
        for (var i = 0; i < this.context.EventList.length; i++) {
            if (this.context.EventList[i].type == itemName) {
                id = this.context.EventList[i].id
                break
            }
        }
        var _context = this.context

        this.context.api.readEvent(cc, id, itemName, function (res) {
            _context.loopEvent()
            return
        })
    }
    //点击建造按钮
    buildingClick() {
        if (!this.buildingNode) {
            return
        }
        if (this.buildingNodeHandler.width == 0) {
            cc.tween(this.buildingNodeHandler).to(0.2, { width: 190, height: 115 }).start();

            cc.tween(this.armyNodeHandler).to(0.2, { width: 0, height: 0 }).start();
            cc.tween(this.touchV).to(0.2, { height: 0 }).start();
            cc.tween(this.touchH).to(0.2, { width: 0 }).start();
        } else {
            cc.tween(this.buildingNodeHandler).to(0.2, { width: 0, height: 0 }).start();
        }
    }
    //点击主城按钮
    mainClick() {
        this.skipToPage("Main")
    }
    //点击军事外交按钮
    mapClick() {
        this.context.changeToMap()

    }
    start() {

        if (this.cityName && UserData.city.info) {
            this.cityName.string = "当前城市: " + UserData.city.info.name
        }
        this.touchObj = this.touchNode.getComponent(TouchItem)
        this.touchObj.init(cc.view.getVisibleSize().width / 2 - 20, cc.view.getVisibleSize().height / 2 - 100, (touchType, event) => {
            let touches = event.getTouches();
            let touchBegin = touches[0].getStartLocation()
            let nowTouch = touches[0].getLocation()
            switch (touchType) {
                case cc.Node.EventType.TOUCH_START:
                    touchBegin = nowTouch
                    break;
                case cc.Node.EventType.TOUCH_MOVE:
                    if (!this.hasTouch && (Math.abs(touchBegin.x - nowTouch.x) > 5 || Math.abs(touchBegin.y - nowTouch.y) > 5)) {
                        this.hasTouch = true
                    }
                    break;
                case cc.Node.EventType.TOUCH_END:
                    break;
                case cc.Node.EventType.TOUCH_CANCEL:
                    break;
            }
        })
        if (this.reportNode) {
            this.reportObj = this.reportNode.getComponent(TouchItem)
            this.reportObj.init(cc.view.getVisibleSize().width / 2 - 20, cc.view.getVisibleSize().height / 2 - 150, (touchType, event) => {
                let touches = event.getTouches();
                let touchBegin = touches[0].getStartLocation()
                let nowTouch = touches[0].getLocation()
                switch (touchType) {
                    case cc.Node.EventType.TOUCH_START:
                        break;
                    case cc.Node.EventType.TOUCH_MOVE:
                        if (!this.hasReportTouch && (Math.abs(touchBegin.x - nowTouch.x) > 5 || Math.abs(touchBegin.y - nowTouch.y) > 5)) {
                            this.hasReportTouch = true
                        }
                        break;
                    case cc.Node.EventType.TOUCH_END:
                        break;
                    case cc.Node.EventType.TOUCH_CANCEL:
                        break;
                }
            })
        }

    }
    checkEventOn() {
        if (!this.context.EventList) {
            return
        }
        this.billItems = {}
        var hasWarning = false
        for (var i = 0; i < this.context.EventList.length; i++) {
            // if (!this.ChildMap[this.context.EventList[i].type]) {
            //     continue
            // }
            if (this.context.EventList[i].type == cc.props.NowPage) {
                continue
            }
            if (this.context.EventList[i].type != "Report") {
                this.beginFlush()
            }
            if (this.context.EventList[i].content == "warning") {
                hasWarning = true
                this.billItems[this.context.EventList[i].type] = "warning"
            } else if (this.billItems[this.context.EventList[i].type] != "warning") {
                this.billItems[this.context.EventList[i].type] = this.context.EventList[i].content
            }

        }
        if (hasWarning) {
            this.warningColor = "#FF5E5E"
        } else {
            this.warningColor = "#D7D7D7"
        }
        this.taskNode.getChildByName("billing").active = false
        this.msgNode.getChildByName("billing").active = false
        this.msgNode.getChildByName("billing").active = false
    }
    beginFlush() {
        this.flushSwitch = true
        this.timeNum = 0
    }
    endFlush() {
        this.flushSwitch = false
    }
    update(dt) {
        this.timeNum++
        if (this.flushSwitch && this.billingNode) {
            if (this.timeNum % 40 == 0 && !this.hasTouch) {
                this.billingNode.active = true
                //每10秒重新检查一下有没有新任务
                if (this.timeNum % 300 == 0) {
                    this.flushSwitch = false
                }
            } else if (this.timeNum % 20 == 0) {
                this.billingNode.active = false
            }
        } else if (!this.flushSwitch && this.timeNum % 60 == 0) {
            this.checkEventOn()
        }
        if (this.billItems) {
            if (this.timeNum % 40 == 0) {
                if (this.billItems["Task"]) {
                    this.taskNode.getChildByName("billing").active = true
                }
                if (this.billItems["Msg"]) {
                    this.msgNode.getChildByName("billing").active = true
                }
                if (this.billItems["Report"] || this.billItems["Warning"]) {
                    this.reportNode.getChildByName("billing").active = true
                    if (this.billItems["Report"] == "warning") {
                        this.reportNode.getChildByName("billing").color = new cc.Color().fromHEX(this.warningColor);
                    }
                }
            } else if (this.timeNum % 20 == 0) {
                this.billingNode.active = false
                if (this.billItems["Task"]) {
                    this.taskNode.getChildByName("billing").active = false
                }
                if (this.billItems["Msg"]) {
                    this.msgNode.getChildByName("billing").active = false
                }
                if (this.billItems["Report"]) {
                    this.reportNode.getChildByName("billing").active = false

                }
            }
        }
    }

    // 点击内部跳转按钮
    onClickItem(event, btnName) {
        console.log("==ss11", JSON.stringify(this.billItems))

        switch (btnName) {
            case "Qie":
                this.context.ListFunc["showCityList"](this.context, null)
                break
            case "Report":

                if (this.hasReportTouch == true) {
                    this.hasReportTouch = false
                    return
                }
                this.cleanEventStep(btnName)
                this.skipToPage(btnName)
                break
            case "Msg":
                this.cleanEventStep(btnName)
                this.skipToPage(this.billItems["Msg"] ? this.billItems["Msg"] : "Msg")
                break
            case "Task":
                this.cleanEventStep(btnName)
                this.skipToPage(btnName)
                break
            case "Exit":
                cc.props.logininfo = {}
                if (cc.props.logininfo.account_type == "taptap") {
                    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "taptapLogout", "()V");
                }
                cc.director.loadScene("Loading");
                break
            default:
                this.skipToPage(btnName)
        }
    }
    skipToPage(btnName) {
        cc.props.NowPage = btnName
        this.context.NowPage = ""
        switch (btnName) {
            case "Army":
            case "Officer":
            case "Defense":
            case "ArmyBuilding":
            case "ResBuilding":
            case "Tech":
            case "Owner":
                cc.props.NowPage = btnName
                this.context.NowPage = btnName
                cc.director.loadScene("Building");
                break
            case "School":
                cc.props.NowPage = btnName
                this.context.NowPage = btnName
                cc.director.loadScene("School");
                break
            case "Main":
                cc.props.NowPage = btnName
                this.context.NowPage = btnName
                cc.director.loadScene("Main");
                break
            case "Group":
                cc.props.NowPage = btnName
                this.context.NowPage = btnName
                cc.director.loadScene("Group");
                break
            case "Activity":
                cc.props.NowPage = "Gamerank"
                this.context.NowPage = "Activity"
                cc.director.loadScene("Gamerank");
                break
            case "Gamerank":
                cc.props.NowPage = "Gamerank"
                this.context.NowPage = "Gamerank"
                cc.director.loadScene("Gamerank");
                break
            case "Play":
                cc.director.loadScene("Play");
                break
            case "AdWeal":
                cc.director.loadScene("AdWeal");
                break
            case "Msg":
                cc.director.loadScene("Msg");
                break
            case "UserChat":
                this.context.NowPage = "UserChat"
                cc.director.loadScene("Msg");
                break
            case "Treasure":
                cc.director.loadScene("Treasure");
                break
            case "Report":
                cc.director.loadScene("Report");
                break
            case "Flush":
                this.context.reloadPage()
                break
            default:
                cc.director.loadScene(btnName);
                break
        }
    }

    // update (dt) {}
}
