// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { UserData } from "./model/userdata";
import ArmyItem from "./war/Army";


class BattleHistory {
    Result: number
    MaxTime: number
    Time: number
    Logs: LogItem[]
}
class LogItem {
    ID: number
    Type: string
    Time: number
    ArmyLog: ArmyLogItem
    OfficerLog: OfficerLogItem
}
class ArmyLogItem {
    NameType: string
    Action: string
    HandleAction: string
    Number: number
    MoveNumber: number
    Location: number

    FocusNameType: string
    ReduceNumber: number
    AttackBlood: number
    FinalNumber: number
}
class OfficerLogItem {
    OfficerID: string
    Skill: string
    SkillAffect: string
}
class ArmyRank {
    id: number
    user_id: number
    next_handle_time: number
    battle_result: number
    battle_times: number
    armies: armyAction[]
    defense_armies: armyAction[]
}
class armyAction {
    name_type: string
    action: string
    number: number
}
@ccclass
export class WarSqrt extends cc.Component {

    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Label)
    battleTimeLabel: cc.Label = null;
    @property(cc.Prefab)
    armyUpItemFab: cc.Prefab;
    @property(cc.Prefab)
    armyDownItemFab: cc.Prefab;
    @property(cc.Node)
    Sqrt: cc.Node = null;
    @property
    text: string = 'hello';
    @property(cc.Node)
    Handler: cc.Node = null;
    @property(cc.Node)
    BodyNode: cc.Node = null;
    @property(cc.Slider)
    sliderHandler: cc.Slider = null;

    @property(cc.Node)
    nextLocationButton: cc.Node = null;
    @property(cc.Node)
    nextAttackRangeNode: cc.Node = null;
    @property(cc.Node)
    saveConfigNode: cc.Node = null;
    @property(cc.Node)
    nextActionNode: cc.Node = null;

    sqrtLength: 5960;
    NowTime: number;
    armyrank: ArmyRank;
    downInfo: {
        maxLocation: 0,
        armies: { [key: number]: ArmyItem }
        armyList: ArmyItem[];
    };
    upInfo: {
        maxLocation: 0,
        armies: { [key: number]: ArmyItem }
        armyList: ArmyItem[];
    };
    history: BattleHistory
    timeNumber: number
    ownerBattleRole: string
    rankID: number;
    hasInit: boolean;
    lock: boolean;
    nextAPItime: number;
    textLog: { [key: number]: string[] }
    getSqrtRange(length) {
        if (length >= this.sqrtLength) {
            length = this.sqrtLength
        }
        return length * this.Sqrt.height / this.sqrtLength;
    }
    // LIFE-CYCLE CALLBACKS:
    getArmyYLocation(type, attackType, location) {
        var loc = this.getSqrtRange(location)
        // 如果展示在上面, 则需要转换为从大向小。
        if (type == "up") {
            loc = (this.sqrtLength - location) * this.Sqrt.height / this.sqrtLength
        }
        loc = loc - this.Sqrt.height / 2
        return loc
    }
    addLog(toward, text) {
        if (!this.textLog) {
            this.textLog = {}
        }
        if (!this.textLog[this.NowTime]) {
            this.textLog[this.NowTime] = Array()
        }
        var ownerText = toward == "down" ? "我方" : "对方"
        this.textLog[this.NowTime].push(`【${ownerText}】 ${text}`)
    }
    onLoad() {
        this.Sqrt.height = this.node.height - 250
        this.timeNumber = 0
        this.Handler.height = 200
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
    }
    onSlider(event) {
        if (this.sliderHandler.progress > 1) {
            this.sliderHandler.progress = 1
        } else if (this.sliderHandler.progress < 0) {
            this.sliderHandler.progress = 0
        }
        this.BodyNode.scale = this.sliderHandler.progress * 0.5 + 0.5
    }

    setsqrtLength(length) {
        this.sqrtLength = length;
    }
    showNextLocation() {
        for (var nameType in this.downInfo.armies) {
            let item = this.downInfo.armies[nameType]
            item.showLocationLine(true)
        }
    }
    showNextAttackRange() {
        for (var nameType in this.downInfo.armies) {
            let item = this.downInfo.armies[nameType]
            item.showAttackRangeLine(true)
        }
    }

    offHandler() {
        for (var nameType in this.upInfo.armies) {
            this.upInfo.armies[nameType].showLocationLine(false)
        }
        for (var nameType in this.downInfo.armies) {
            this.downInfo.armies[nameType].showLocationLine(false)
        }

    }
    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)

        this.downInfo = {
            armyList: Array(),
            maxLocation: 0,
            armies: {}
        }
        this.upInfo = {
            armyList: Array(),
            maxLocation: 0,
            armies: {}
        }
        this.rankID = cc.props.rankID
        this.NowTime = 0
        if (!UserData.user.info || !UserData.user.info.user_id) {
            return
        }
        this.flushPage()
    }
    resetActionNode() {
        if (cc.props.NowPage == "battleHistory" || (this.armyrank && this.armyrank.battle_result != 0)) {
            this.nextActionNode.active = true
        } else {
            this.saveConfigNode.active = true
        }
        this.flushTimeLabel()
    }
    goBack() {
        cc.director.loadScene("Report");
    }
    closeAllHandle() {
        for (var i in this.downInfo.armies) {
            let item = this.downInfo.armies[i]
            item.offHandler()
        }
    }
    saveConfig() {
        if (!this.history || this.history.Result != 0) {
            this.context.Toast("战斗已结束")
            return
        }
        var data = {}
        var cfg = {}
        for (var i in this.downInfo.armies) {
            let item = this.downInfo.armies[i]
            if (item.data.number <= 0) {
                continue
            }
            cfg[item.data.nameType] = item.data.handleAction
        }

        data["rank_id"] = this.armyrank.id
        data["cfg"] = cfg
        this.context.api.setBattleCfg(cc, data, (res) => {
            context.Toast("设置成功")
            return
        }, function (errMsg) {
            context.Toast("错误:" + errMsg)
        })
    }

    flushPage() {
        if (this.lock) {
            return
        }
        if (this.nextAPItime > 0) {
            return
        }
        this.nextAPItime = 5
        this.lock = true

        this.context.api.getArmyRank(cc, this.rankID, (res) => {
            if (!res) {
                this.context.Toast("战报已经不在啦")
                return
            }
            this.armyrank = res
            this.history = res.log
            this.resetActionNode()
            this.setsqrtLength(res.battle_area_length)
            if (!this.hasInit) {
                // 初始化进攻方军队对象
                if (res.user_id == UserData.user.info.user_id) {
                    this.ininArmyItems("up", "defense", res.log.DefenseArmy, res.log.DefenseArmySpeed, res.log.DefenseArmyAttackRange)
                    this.ininArmyItems("down", "attack", res.log.AttackArmy, res.log.AttackArmySpeed, res.log.AttackArmyAttackRange)
                    this.ownerBattleRole = "AttackAction"
                } else {
                    // 初始化防守方军队对象
                    this.ininArmyItems("up", "attack", res.log.AttackArmy, res.log.AttackArmySpeed, res.log.AttackArmyAttackRange)
                    this.ininArmyItems("down", "defense", res.log.DefenseArmy, res.log.DefenseArmySpeed, res.log.DefenseArmyAttackRange)
                    this.ownerBattleRole = "DefenseAction"
                }
                this.flushLocation()
            }
            if (this.armyrank && this.NowTime < this.history.Time && cc.props.NowPage != "battleHistory") {
                var gapTime = this.history.Time - this.NowTime
                for (var i = 0; i < gapTime; i++) {
                    this.showNextTime()
                }
            }
            this.resetArmyAction()
            this.hasInit = true
            this.lock = false
        }, () => {
            this.lock = false
        })
    }
    resetArmyAction() {
        if (!this.armyrank) {
            return
        }
        for (var i in this.armyrank.armies) {
            let item = this.armyrank.armies[i]
            let obj = this.getArmyObj(this.getAttackToward(), item.name_type)
            if (obj) {
                obj.setHandleAction(item.action)
            }
        }
        for (var i in this.armyrank.defense_armies) {
            let item = this.armyrank.defense_armies[i]
            let obj = this.getArmyObj(this.getDefenseToward(), item.name_type)
            if (obj) {
                obj.setHandleAction(item.action)
            }
        }
    }
    onTouchStart(event) {
        return true
    }
    onTouchMove(event) {

        var touchLoc = event.getDelta();

        this.BodyNode.x += touchLoc.x
        this.BodyNode.y += touchLoc.y
        if (this.BodyNode.x < - cc.view.getVisibleSize().width / 2) {
            this.BodyNode.x = - cc.view.getVisibleSize().width / 2
        }
        if (this.BodyNode.x > cc.view.getVisibleSize().width / 2) {
            this.BodyNode.x = cc.view.getVisibleSize().width / 2
        }

        if (this.BodyNode.y < -cc.view.getVisibleSize().height / 3) {
            this.BodyNode.y = -cc.view.getVisibleSize().height / 3
        }
        if (this.BodyNode.y > cc.view.getVisibleSize().height / 3) {
            this.BodyNode.y = cc.view.getVisibleSize().height / 3
        }

        return true
    }
    onTouchEnd(event) {
        return true
    }
    showNextTime() {
        if (!this.history || !this.history.Logs) {
            return
        }
        this.NowTime++
        for (var i in this.history.Logs) {
            let item = this.history.Logs[i]
            if (item.Time != this.NowTime) {
                continue
            }
            if (item.ArmyLog) {
                this.updateArmyItem(item.Type, item.ArmyLog)
            }
            if (item.OfficerLog) {
                this.updateOfficerItem(item.Type, item.OfficerLog)
            }
            if (item.Time != this.NowTime) {
                break
            }
        }
        this.flushLocation()
        this.flushTimeLabel()
        if (this.NowTime >= this.history.Time) {
            this.NowTime = this.history.Time
            // 战斗结束
            if (this.history.Result != 0) {
                this.showBattleLog()
            }
            return
        }
        console.log(this.textLog)

    }
    showBattleLog() {
        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("战斗过程", "关闭")

        if (this.history.Result != 0) {
            switch (this.history.Result) {
                case 1:
                    tips = "进攻方胜利"
                    break
                case 2:
                    tips = "防守方胜利"
                    break
            }
            alter2Node.addNewLine("text_mid", "战斗结果:", { "text": tips })
            alter2Node.addNewLine("text_mid", "", { "text": "重新查看战斗过程>", "cusButtonText": "查看" }, () => {
                cc.props.NowPage = "battleHistory"
                cc.props.BattleID = this.rankID
                this.downInfo = null
                this.upInfo = null
                this.hasInit = false
                cc.director.loadScene("War");
                alter2Node.onButtonCancel()

            })
        }

        let lg = ""
        let da = ""
        for (var ii in this.upInfo.armyList) {

            let item = this.upInfo.armyList[ii]
            if (item.data.number <= 0) {
                continue
            }
            da += `${item.data.text}:${item.data.number}  位置:${item.data.location}\n`
        }
        if (da != "") {
            lg += "对方剩余兵力:\n" + da + "\n"
        }
        let wa = ""
        for (var ii in this.downInfo.armyList) {

            let item = this.downInfo.armyList[ii]
            if (item.data.number <= 0) {
                continue
            }
            wa += `${item.data.text}:${item.data.number}  位置:${item.data.location}\n`
        }
        if (wa != "") {
            lg += "我方剩余兵力:\n" + wa
        }
        lg += "\n\n"
        for (var i = 20; i > 0; i--) {

            if (this.textLog && this.textLog[i]) {
                lg += `第${i}回合>>>>>>>>>\n`
                for (var j in this.textLog[i]) {
                    lg += this.textLog[i][j] + "\n"
                }
                lg += "\n\n"
            }
        }
        if (this.history && this.history.Result != 0) {
            var tips = ""
            switch (this.history.Result) {
                case 1:
                    tips = "进攻方胜利"
                    break
                case 2:
                    tips = "防守方胜利"
                    break
            }
            lg += tips + "\n"
        }
        alter2Node.addNewLine("wrap_high_text", "战斗过程:", { "text": lg })

        alter2Node.OnButtonFunc = function () {
            alter2Node.onButtonCancel()
        }
        alter2Node.Alert()
    }
    updateOfficerItem(itemType: string, officerLog: OfficerLogItem) {
        if (!officerLog || !officerLog.OfficerID) {
            return
        }
        this.addLog(this.getToward(itemType), this.context.ReplaceI18NText(officerLog.SkillAffect))
    }

    // 如果我方是防守方 则当前展示战场时 进攻方在上方 防守方在下方
    getAttackToward() {
        if (this.armyrank.user_id == UserData.user.info.user_id) {
            return "down"
        }
        return "up"
    }
    // 如果我方是进攻方 则当前展示战场时 进攻方在下方 防守方在上方 
    getDefenseToward() {
        if (this.armyrank.user_id == UserData.user.info.user_id) {
            return "up"
        }
        return "down"
    }
    getToward(itemType: string) {
        if (itemType == this.ownerBattleRole) {
            return "down"
        } else {
            return "up"
        }
    }
    updateArmyItem(itemType: string, armyLog: ArmyLogItem) {
        let armyObj = this.getArmyObj(itemType, armyLog.NameType)
        if (!armyObj || armyObj.data.number == 0) {
            return
        }

        armyObj.SetNumber(this.NowTime, armyLog.Number)
        if (armyLog.Action == "move") {
            if (armyLog.MoveNumber) {
                this.addLog(armyObj.data.toward, `${armyObj.data.text} 移动:${armyLog.MoveNumber ? armyLog.MoveNumber : 0} 位置:${armyLog.Location ? armyLog.Location : 0}`)
            }
            armyObj.MoveTo(this.NowTime, armyLog.HandleAction, armyLog.Location)
        } else if (armyLog.Action == "attack") {
            let focusObj = this.getArmyObj(this.getFocusItemType(itemType), armyLog.FocusNameType)
            this.addLog(armyObj.data.toward, `${armyObj.data.text}(${armyObj.data.number}) 攻击 ${focusObj.data.text} 造成伤害:${armyLog.AttackBlood} 摧毁:${armyLog.ReduceNumber} 剩余:${focusObj.data.number - armyLog.ReduceNumber}`)
            if (focusObj) {
                focusObj.SetNumber(this.NowTime, armyLog.FinalNumber ? armyLog.FinalNumber : 0)
            }
        }
    }
    getFocusItemType(itemType: string) {
        if (itemType == "AttackAction") {
            return "DefenseAction"
        }
        return "AttackAction"
    }

    getArmyObj(itemType: string, nameType: string) {
        if (itemType == this.ownerBattleRole) {
            return this.downInfo.armies[nameType]
        } else {
            return this.upInfo.armies[nameType]
        }
    }
    ininArmyItems(toward, attackType, armyInfo, armySpeedConfig, attackRangeConfig) {

        for (var i = 0; i < armyInfo.length; i++) {

            let armyItem = armyInfo[i]
            if (armyItem.number <= 0) {
                continue
            }

            var node = null
            if (toward == "up") {
                node = cc.instantiate(this.armyUpItemFab);
            } else {
                node = cc.instantiate(this.armyDownItemFab);
            }
            var nodeObj = node.getComponent(ArmyItem)
            this.Sqrt.addChild(node)
            let speed = armySpeedConfig[armyItem.name_type] ? armySpeedConfig[armyItem.name_type] : 0
            let attackRange = attackRangeConfig[armyItem.name_type] ? attackRangeConfig[armyItem.name_type] : 0

            nodeObj.Init(this, armyItem.name, armyItem.name_type, toward, attackType, armyItem.location, armyItem.number, speed, attackRange)

            if (toward == "up") {
                this.upInfo.armies[armyItem.name_type] = nodeObj
                this.upInfo.armyList.push(nodeObj)
            } else {
                this.downInfo.armies[armyItem.name_type] = nodeObj
                this.downInfo.armyList.push(nodeObj)
            }
        }
    }

    flushLocation() {
        this.flyqueue(this.upInfo.armyList)
        this.flyqueue(this.downInfo.armyList)
        this.BodyNode.x = 0
        this.BodyNode.y = 0
    }
    flyqueue(armyObjList) {
        armyObjList.sort(function (a, b) { return b.data.location - a.data.location });

        var newArray1 = Array()
        var newArray2 = Array()
        for (var i = 0; i < armyObjList.length; i++) {
            if (armyObjList[i].isWall()) {
                continue
            }
            if (i < 14) {
                if (i % 2 == 0) {
                    newArray1.push(armyObjList[i])
                } else {
                    newArray1.unshift(armyObjList[i])
                }
            } else {
                if (i % 2 == 0) {
                    newArray2.push(armyObjList[i])
                } else {
                    newArray2.unshift(armyObjList[i])
                }
            }
        }
        for (var i = 0; i < newArray1.length; i++) {
            newArray1[i].SetX((newArray1.length / 2 - i) * 50)
        }
        for (var i = 0; i < newArray2.length; i++) {
            newArray2[i].SetX((newArray2.length / 2 - i) * 50)
        }
        return
    }
    flushTimeLabel() {
        this.battleTimeLabel.string = `第${this.NowTime} 回合`
        if (this.history.Result != 0) {
            if (cc.props.NowPage == "battleHistory") {
                this.timeLabel.string = "战斗回放"
            } else {
                this.timeLabel.string = "战斗结束"
            }

            return
        }
        let finalTime = this.armyrank.next_handle_time - this.context.getServerTime() - 5
        if (finalTime < 0) {
            finalTime = 0
            this.timeLabel.string = "刷新中..."

        } else {
            this.timeLabel.string = finalTime + "s"

        }
    }
    update(dt: number) {
        this.timeNumber++
        if (!this.armyrank) {
            return
        }
        if (this.timeNumber % 30 == 0) {
            this.nextAPItime--
            this.flushTimeLabel()
            if (this.armyrank && this.armyrank.battle_result == 0 && this.armyrank.next_handle_time <= this.context.getServerTime()) {
                if (!this.lock) {
                    this.flushPage()
                }
            }
        }
    }

