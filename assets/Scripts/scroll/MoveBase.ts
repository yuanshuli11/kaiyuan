import { BezierCurveAnimation } from './BezierCurveAnimation';
const { ccclass, property, requireComponent } = cc._decorator;

/** 运动组件基类 */
@ccclass
@requireComponent(BezierCurveAnimation)
export abstract class MoveBase extends cc.Component {
    /* --------------- 属性 --------------- */
    /** 当前下标变更事件 */
    @property({
        displayName: '当前下标变更事件',
        tooltip: '(当前下标_indexN, 上个下标_indexN, 跳过状态_jumpB)',
        type: cc.Component.EventHandler
    })
    indexChangeEvent = new cc.Component.EventHandler();

    /** 结束事件 */
    @property({ displayName: '结束事件', type: cc.Component.EventHandler })
    endEvent = new cc.Component.EventHandler();
    /* --------------- protected --------------- */
    /** 移动状态 */
    protected _moveB = false;
    /** 移动缓动 */
    protected _moveTween: cc.Tween | null;
    /** 循环移动状态 */
    protected _loopRunB = false;
    /** 当前移动配置 */
    protected _moveConfig?: MoveBase_.MoveConfig;
    /** 跳过状态 */
    protected _jumpB = false;
    /** 上次曲线 Y */
    protected _lastCurveYN = 0;
    /** 当前下标 */
    protected _currIndexN!: number;
    /** 当前距离 */
    protected _currDistN = 0;
    /** 总距离 */
    protected _targetDistN = 0;
    /* --------------- public --------------- */
    /** 曲线组件 */
    curveComp!: BezierCurveAnimation;
    /** 当前中心下标 */
    get currIndexN() {
        return this._currIndexN;
    }
    set currIndexN(valueN_) {
        this._setCurrIndexN(valueN_);
    }
    /* ------------------------------- get/set ------------------------------- */
    protected _setCurrIndexN(valueN_: number) {
        if (valueN_ === this._currIndexN) {
            return;
        }
        this.indexChangeEvent.emit([valueN_, this._currIndexN, this._jumpB]);
        this._currIndexN = valueN_;
        // logger.log('当前选中', this._currIndexN);
    }
    /* ------------------------------- 生命周期 ------------------------------- */
    onLoad() {
        this._initData();
    }
    /* ------------------------------- 功能 ------------------------------- */
    /** 初始化数据 */
    protected _initData(): void {
        this.curveComp = this.getComponent(BezierCurveAnimation);

        // 设置更新事件
        let updateEvent = new cc.Component.EventHandler();
        updateEvent.component = cc.js.getClassName(this);
        updateEvent.handler = '_eventUpdate';
        updateEvent.target = this.node;
        this.curveComp.updateEventAS.push(updateEvent);

        // 设置结束事件
        let endEvent = new cc.Component.EventHandler();
        endEvent.component = cc.js.getClassName(this);
        endEvent.handler = '_eventEnd';
        endEvent.target = this.node;
        this.curveComp.endEventAS.push(endEvent);
    }

    /** 运动 */
    protected abstract _move(valueN_: number): void;

    /** 获取当前下标 */
    protected abstract _getCurrIndex(): number;

    /** 获取移动距离 */
    protected abstract _getMoveDist(indexN_: number, scrollConfig_?: MoveBase_.MoveConfig): number;

    /** 停止循环 */
    stop(): void {
        if (!this._moveTween) {
            return;
        }
        this._moveTween.stop();
        this._moveTween = null;
        this._loopRunB = false;
        this._moveB = false;
    }

    /**
     * 循环运动
     * @param speedN_ 速度/秒
     * @param timeSN_ 时间（秒），不填则一直运动
     */
    loop(speedN_: number, timeSN_?: number): void {
        if (this._moveB) {
            return;
        }
        this._moveB = true;
        this._loopRunB = true;
        let tempN: number;
        let target = { valueN: 0, lastValueN: 0 };
        this._moveTween = cc
            .tween(target)
            .repeatForever(
                cc.tween().by(
                    1,
                    {
                        valueN: 1
                    },
                    {
                        progress: (startN: number, endN: number, currentN: number, ratioN: number) => {
                            if (!this.isValid) {
                                return;
                            }
                            tempN = (target.valueN - target.lastValueN) * speedN_;
                            this._move(tempN);
                            this._currDistN += tempN;
                            target.lastValueN = target.valueN;
                            this.currIndexN = this._getCurrIndex();
                            return startN + (endN - startN) * ratioN;
                        }
                    }
                )
            )
            .start();
        if (timeSN_ !== undefined) {
            this.scheduleOnce(() => {
                this.stop();
            }, timeSN_);
        }
    }

    /**
     * 跳转到指定下标
     * @param indexN_ 目标下标
     * @returns
     */
    jump(indexN_: number): void {
        if (this._moveB && !this._loopRunB) {
            return;
        }
        this._moveB = true;
        this._jumpB = true;

        // 停止循环运动
        if (this._loopRunB) {
            this.stop();
        }

        // 更新距离
        this._targetDistN = this._currDistN = this._getMoveDist(indexN_);

        // 直接跳转
        this._move(this._targetDistN);
        this.currIndexN = this._getCurrIndex();
        this._moveB = false;
        this._jumpB = false;
    }

    /**
     * 移动
     * @param indexN_ 目标下标
     * @param scrollConfig_ 运动配置
     * @returns
     */
    move(indexN_: number, scrollConfig_?: MoveBase_.MoveConfig): void {
        if (this._moveB && !this._loopRunB) {
            return;
        }
        this._moveB = true;
        this._moveConfig = new MoveBase_.MoveConfig(scrollConfig_);

        // 停止循环运动
        if (this._loopRunB) {
            this.stop();
        }

        // 更新距离
        this._lastCurveYN = 0;
        this._currDistN = 0;
        this._targetDistN = this._getMoveDist(indexN_, this._moveConfig);

        // 开始缓动
        this._moveTween = this.curveComp.startTween(this._moveConfig.tweenIndexNS);
    }

    /** 获取运动速度 */
    getSpeed(indexN_: number, scrollConfig_?: MoveBase_.GetSpeedConfig): number {
        scrollConfig_ = new MoveBase_.GetSpeedConfig(scrollConfig_);
        /** 目标距离 */
        let targetDistN = this._getMoveDist(indexN_, scrollConfig_);
        return targetDistN * this.curveComp.getCurveY(scrollConfig_.ratioN!, scrollConfig_.tweenIndexNS);
    }
    /* ------------------------------- 自定义事件 ------------------------------- */
    protected _eventUpdate(yN_: number, indexN_: number): void {
        let moveDistN = this._targetDistN * (yN_ - this._lastCurveYN);
        this._currDistN += moveDistN;
        this._move(moveDistN);
        this._lastCurveYN = yN_;
        this.currIndexN = this._getCurrIndex();
        // cc.log('缓动更新', yN_, indexN_, y2N_, yN_ - this._lastCurveYN);
    }

    protected _eventEnd(): void {
        // 更新至终点
        let moveDistN = this._targetDistN - this._currDistN;
        this._currDistN += moveDistN;
        this._move(this._targetDistN - this._currDistN);
        this.currIndexN = this._getCurrIndex();

        // 更新状态
        this._moveB = false;
        this.endEvent.emit([]);
        if (this._moveConfig && this._moveConfig.endCBF) {
            this._moveConfig.endCBF();
        }
        // cc.log('缓动结束');
    }
}

export namespace MoveBase_ {
    /** 运动配置 */
    export class MoveConfig {
        constructor(init_?: MoveConfig) {
            Object.assign(this, init_);
        }
        /** 缓动队列 */
        tweenIndexNS?: number[];
        /** 结束回调 */
        endCBF?: () => void;
    }

    /** 获取速度配置 */
    export class GetSpeedConfig extends MoveConfig {
        constructor(init_?: GetSpeedConfig) {
            super(init_);
            Object.assign(this, init_);
        }
        /** 进度 */
        ratioN? = 0;
    }
}
