import { MoveBase, MoveBase_ } from './MoveBase';
const { ccclass, property, requireComponent } = cc._decorator;

namespace _ScrollCell {
    /** 方向 */
    export enum Direction {
        顺序,
        倒序
    }


}

/** 滚动单格 */
@ccclass
export class ScrollCell extends MoveBase {
    /* --------------- 属性 --------------- */
    /** 方向 */
    @property({
        displayName: '方向',
        type: cc.Enum(_ScrollCell.Direction)
    })
    dire = _ScrollCell.Direction.顺序;

    /** 内容容器 */
    @property({ displayName: '内容容器', type: cc.Node })
    contentNode: cc.Node = null!;

    /** 初始下标 */
    @property({ displayName: '初始下标' })
    startIndexN = 0;
    /* --------------- private --------------- */
    /** 总距离 */
    private _totalDistN = 0;
    /* ------------------------------- 生命周期 ------------------------------- */
    onLoad() {
        super.onLoad();
        this._initView();
    }
    /* ------------------------------- 功能 ------------------------------- */
    /** 初始化视图 */
    private _initView(): void {
        this.jump(this.startIndexN);
        this._totalDistN = 0;
    }

    /** 初始化数据 */
    protected _initData(): void {
        super._initData();
    }

    /** 运动 */
    protected _move(valueN_: number): void { }

    /** 获取当前下标 */
    protected _getCurrIndex(): number {
        return Math.floor((this._totalDistN + this._currDistN) / (1 / this.contentNode.children.length));
    }

    protected _getMoveDist(indexN_: number, scrollConfig_?: ScrollCell_.ScrollConfig): number {
        /** 上次距离 */
        let lastDistN = this._totalDistN % 1;
        /** 目标距离 */
        let targetDist = (1 / this.contentNode.children.length) * indexN_;
        if (this.dire === _ScrollCell.Direction.顺序) {
            if (targetDist > lastDistN) {
                targetDist = targetDist - lastDistN;
            } else if (targetDist < lastDistN) {
                targetDist = 1 - lastDistN + targetDist;
            }
            // 圈数
            return targetDist + (scrollConfig_ ? scrollConfig_.turnN! : 0);
        } else {
            if (targetDist > lastDistN) {
                targetDist = targetDist - lastDistN;
            } else if (targetDist < lastDistN) {
                targetDist = 1 - lastDistN + targetDist;
            }
            // 圈数
            return -(1 - targetDist) - (scrollConfig_ ? scrollConfig_.turnN! : 0);
        }
    }

    stop(): void {
        if (this._moveB) {
            this._totalDistN += this._currDistN;
        }
        super.stop();
    }

    loop(speedN_: number, timeSN_?: number): void {
        if (this.dire === _ScrollCell.Direction.倒序) {
            speedN_ = -speedN_;
        }
        super.loop(speedN_, timeSN_);
    }
    renderItems(ls) {
        for (var i = 0; i < this.node.children.length; i++) {
            var labelItem = this.node.children[i].getChildByName("Text").getComponent(cc.Label)
            labelItem.string = ls[i].name
            var rateItem = this.node.children[i].getChildByName("Rate").getComponent(cc.Label)
            rateItem.string = ls[i].probability * 100 + '%'

        }
    }
    jump(indexN_: number): void {
        this._totalDistN = 0;
        super.jump(indexN_);
        this._totalDistN = this._targetDistN;
    }

    move(indexN_: number, scrollConfig_?: ScrollCell_.ScrollConfig): void {
        super.move(indexN_, new ScrollCell_.ScrollConfig(scrollConfig_));
    }

    getSpeed(indexN_: number, scrollConfig_?: ScrollCell_.GetSpeedConfig): number {
        return super.getSpeed(indexN_, new ScrollCell_.GetSpeedConfig(scrollConfig_));
    }
    /* ------------------------------- 自定义事件 ------------------------------- */
    protected _eventEnd(): void {
        super._eventEnd();
        this._totalDistN += this._targetDistN;
    }
}

export namespace ScrollCell_ {
    /** 方向 */
    export const Direction = _ScrollCell.Direction;
    /** 方向 */
    export type Direction = _ScrollCell.Direction;

    /** 滚动配置 */
    export class ScrollConfig extends MoveBase_.MoveConfig {
        constructor(init_?: ScrollConfig) {
            super(init_);
            Object.assign(this, init_);
        }
        /** 圈数 */
        turnN?= 1;
    }

    /** 获取滚动速度配置 */
    export class GetSpeedConfig extends ScrollConfig {
        constructor(init_?: GetSpeedConfig) {
            super(init_);
            Object.assign(this, init_);
        }
        /** 进度 */
        ratioN?= 0;
    }
}
