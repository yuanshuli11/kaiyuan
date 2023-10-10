import { UserData } from './model/userdata';
import { RollingLottery } from './scroll/RollingLottery';
import { RotatingLottery } from './scroll/RotatingLottery';
import { ScrollCell } from './scroll/ScrollCell';
const { ccclass, property } = cc._decorator;

@ccclass
export class main extends cc.Component {


    /** 滚动单格 */
    @property({ displayName: '滚动单格', type: ScrollCell })
    scrollCell: ScrollCell = null!;
    @property({ displayName: '启动按钮', type: cc.Button })
    scrollBtn: cc.Button
    @property({ displayName: '冷却时间', type: cc.Label })
    scrollTime: cc.Label;
    scrollInfo: any;
    lock: false;
    timeNum: number;
    onLoad() {
        this.timeNum = 0
    }
    onDestroy() {
        this.context.Ad.DestroyBanner()

    }
    start() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

        this.resetScrollBtn()
        this.context.api.GetScrollInfo(cc, (res) => {
            this.scrollID = res.uuid
            this.scrollCell.renderItems(res.enhance.chest_prop_list)
            this.scrollInfo = res
        })
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3_2(this.node)

        if (cc.view.getVisibleSize().height > 700) {
            this.context.Ad.ShowBanner()
        }


    }
    rateTextAlert() {
        if (!this.scrollInfo) {
            return
        }
        var neweventNodeItem = context.newAlertItem()
        var alter2Node = context.NewAlert2()
        neweventNodeItem.alertNode = alter2Node
        alter2Node.InitAlert("转盘说明", "关闭")
        alter2Node.addNewLine("wrap_text", `说明:`, {
            "text": `观看广告即可启动一次转盘\n每次转盘冷却时间为30分钟\n每天可启动20次转盘。`
        })
        alter2Node.addNewLine("text_mid", `道具:`, {
            "text": `概率`
        })
        for (var i = 0; i < this.scrollInfo.enhance.chest_prop_list.length; i++) {
            alter2Node.addNewLine("text_mid", `${this.scrollInfo.enhance.chest_prop_list[i].name}:`, {
                "text": `${this.scrollInfo.enhance.chest_prop_list[i].probability * 100}%`
            })
        }

        alter2Node.OnButtonFunc = alter2Node.onButtonCancel

        alter2Node.Alert()
    }
    resetScrollBtn() {
        if (UserData.user.cfg.next_scroll_time > this.context.getServerTime()) {
            this.scrollBtn.interactable = false
        } else {
            this.scrollBtn.interactable = true
        }
    }
    runScroll() {
        if (UserData.user.cfg.has_scroll_time <= 0) {
            this.context.Toast(`今日次数已用尽`)
            return
        }
        if (UserData.user.cfg.next_scroll_time > this.context.getServerTime()) {
            this.context.Toast(`转盘冷却中请稍后再试`)
            return
        }
        if (this.lock) {
            return
        }
        this.lock = true
        this.context.Ad.ShowAd("Task", () => {
            let sleepMS = Math.floor(Math.random() * 1000);
            this.scrollCell.loop(3);
            setTimeout(() => {
                this.context.api.OpenScroll(cc, this.scrollInfo.uuid, (res) => {
                    this.scrollCell.move(res.index, {
                        endCBF: () => {
                            this.context.Toast(`获得奖励:${res.prop_list[0].name}`)
                        }
                    });
                    UserData.user.cfg = res.user_cfg
                    this.resetScrollBtn()
                }, (err) => {
                    this.lock = false
                    this.context.Toast(err)
                    cc.director.loadScene("ScrollPlay");
                })
            }, sleepMS);
        }, (err) => {
            this.context.Toast(err)
        })

        setTimeout(() => {
            this.lock = false
        }, 5000)
    }
    /* ------------------------------- segmentation ------------------------------- */
    eventItemUpdate(node_: cc.Node, indexN_: number): void {
        node_.getComponentInChildren(cc.Label).string = indexN_ + '';
    }

    eventCeilUpdate(currIndexN_: number, preIndexN_: number, jumpB_: boolean): void {
        let lenN = this.scrollCell.contentNode.children.length;
        if (currIndexN_ < 0) {
            currIndexN_ = lenN - Math.abs(Math.floor(currIndexN_ % lenN));
        }
        if (preIndexN_ !== undefined && preIndexN_ < 0) {
            preIndexN_ = lenN - Math.abs(Math.floor(preIndexN_ % lenN));
        }
        currIndexN_ = currIndexN_ % lenN;
        // 更新当前选中节点
        this.scrollCell.contentNode.children[currIndexN_].color = cc.Color.YELLOW;
        // 更新上个选中节点
        if (preIndexN_ !== undefined) {
            preIndexN_ = preIndexN_ % lenN;
            this.scrollCell.contentNode.children[preIndexN_].color = cc.Color.WHITE;
        }
    }

    eventCenterNode(indexN_: number): void {
        // cc.log('当前下标', indexN_);
    }

    eventScrollEnd(): void {
        // cc.log('滚动结束');
    }
    resetTimeButton() {

        if (UserData.user.cfg.next_scroll_time <= this.context.getServerTime()) {
            this.scrollTime.string = ""
            this.resetScrollBtn()
            return
        }
        var remaining = UserData.user.cfg.next_scroll_time - this.context.getServerTime()
        this.scrollTime.string = `冷却中: ` + this.context.timeTostr(remaining)
    }
    update(dt) {

        this.timeNum++
        if (this.timeNum % 30 == 0) {
            this.resetTimeButton()
        }

    }
}
