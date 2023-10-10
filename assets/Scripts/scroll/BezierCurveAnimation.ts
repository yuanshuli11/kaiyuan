import BezierCurve from './BezierCurve';
const { ccclass, property, help } = cc._decorator;

/** 缓动枚举 */
let easingEnum: any = {};
{
    let tempN = 0;
    for (let kS in cc.easing) {
        if (Object.prototype.hasOwnProperty.call(cc.easing, kS)) {
            easingEnum[kS] = tempN;
            easingEnum[tempN] = kS;
            tempN++;
        }
    }
}

/** 缓动单元 */
@ccclass('BezierCurveAnimationTweenUnit')
class BezierCurveAnimationTweenUnit {
    /* --------------- 属性 --------------- */
    /** 自定义缓动曲线 */
    @property({ displayName: '自定义缓动曲线' })
    customCurveB = false;

    /** 缓动曲线 */
    @property({
        displayName: '缓动曲线',
        type: cc.Enum(easingEnum),
        visible: function (this: BezierCurveAnimationTweenUnit) {
            return !this.customCurveB;
        }
    })
    easing = 0;

    /** 缓动控制点 */
    @property({
        displayName: '控制点',
        type: [cc.Vec3],
        visible: function (this: BezierCurveAnimationTweenUnit) {
            return this.customCurveB;
        }
    })
    controlPointV3S: cc.Vec3[] = [];

    /** 时间（秒） */
    @property({ displayName: '时间（秒）' })
    timeSN = 0;
}

/** 贝塞尔曲线通用动画组件 */
@ccclass
@help('https://www.desmos.com/calculator/cahqdxeshd?lang=zh-CN')
export class BezierCurveAnimation extends cc.Component {
    /* --------------- 属性 --------------- */
    /** 缓动单元 */
    @property({ displayName: '缓动单元', type: [BezierCurveAnimationTweenUnit] })
    tweenUnitAS: BezierCurveAnimationTweenUnit[] = [];

    /** 缓动切换事件 */
    @property({
        displayName: '缓动切换事件',
        tooltip: '(当前缓动下标_indexN)',
        type: [cc.Component.EventHandler]
    })
    tweenSwitchEventAS: cc.Component.EventHandler[] = [];

    /** 更新事件 */
    @property({
        displayName: '更新事件',
        tooltip: '(当前缓动曲线Y_yN, 当前缓动下标_indexN, 总曲线Y_yN)',
        type: [cc.Component.EventHandler]
    })
    updateEventAS: cc.Component.EventHandler[] = [];

    /** 结束事件 */
    @property({ displayName: '结束事件', type: [cc.Component.EventHandler] })
    endEventAS: cc.Component.EventHandler[] = [];
    /* --------------- private --------------- */
    /* ------------------------------- 功能 ------------------------------- */
    /** 触发事件 */
    emit(eventKey_: keyof BezierCurveAnimation, ...argsAS_: any[]): void {
        let eventAS = this[eventKey_] as cc.Component.EventHandler[];
        if (!eventAS) {
            return;
        }
        eventAS.forEach((v) => {
            v.emit(argsAS_);
        });
    }

    /**
     * 开始缓动
     * @param tweenIndex_ 指定缓动或缓动队列
     * @returns
     */
    startTween(tweenIndex_?: number | number[]): cc.Tween | null {
        /** 缓动队列 */
        let tweenUnitAs = this.tweenUnitAS;

        // 获取缓动队列
        if (tweenIndex_ !== undefined) {
            if (typeof tweenIndex_ === 'number') {
                tweenUnitAs = tweenUnitAs.slice(tweenIndex_, 1);
            } else {
                tweenUnitAs = [];
                tweenIndex_.forEach((vN) => {
                    tweenUnitAs.push(this.tweenUnitAS[vN]);
                });
            }
            tweenUnitAs = tweenUnitAs.filter((v) => Boolean(v));
        }
        if (!tweenUnitAs.length) {
            return null;
        }

        /** 总时间（秒） */
        let totalTimeSN = tweenUnitAs.reduce((preValue, currValue) => preValue + currValue.timeSN, 0);
        /** 时间占比 */
        let timeRatioNs: number[] = [];
        {
            let currN = 0;
            tweenUnitAs.forEach((v, kN) => {
                let ratioN = v.timeSN / totalTimeSN;
                currN += ratioN;
                timeRatioNs.push(currN);
            });
        }
        /** 曲线函数 */
        let curveFS = tweenUnitAs.map((v) => {
            if (v.customCurveB) {
                let curve = new BezierCurve(v.controlPointV3S);
                return (kN: number) => {
                    return curve.point(kN)!.y;
                };
            } else {
                return (cc.easing as any)[easingEnum[v.easing]].bind(cc.easing) as (kN: number) => number;
            }
        });
        /** 上次缓动下标 */
        let lastTweenIndexN = 0;
        /** 缓动对象 */
        let tweenTarget = { valueN: 0 };
        /** 缓动 */
        let tween = cc
            .tween(tweenTarget)
            .to(
                totalTimeSN,
                {
                    valueN: 1
                },
                {
                    progress: (startN: number, endN: number, currentN: number, ratioN: number) => {
                        /** 当前缓动下标 */
                        let tweenIndexN = timeRatioNs.findIndex((vN) => ratioN <= vN);
                        if (tweenIndexN === -1) {
                            return;
                        }
                        /** 上个时间占比 */
                        let lastTimeRatioN = tweenIndexN ? timeRatioNs[tweenIndexN - 1] : 0;
                        /** 当前时间范围 */
                        let timeRangeN = timeRatioNs[tweenIndexN] - lastTimeRatioN;
                        /** 曲线位置 */
                        let posN = (ratioN - lastTimeRatioN) / timeRangeN;
                        /** 当前曲线 Y */
                        let currCurveYN = curveFS[tweenIndexN](posN);
                        /** 总曲线 Y */
                        let totalCurveYN = currCurveYN * timeRangeN + lastTimeRatioN;
                        // 缓动切换事件触发
                        if (lastTweenIndexN !== tweenIndexN) {
                            this.emit('tweenSwitchEventAS', lastTweenIndexN);
                        }
                        // 更新事件触发
                        this.emit('updateEventAS', currCurveYN, tweenIndexN, totalCurveYN);
                        // 更新缓动下标
                        lastTweenIndexN = tweenIndexN;
                        return startN + (endN - startN) * ratioN;
                    }
                }
            )
            .call(() => {
                // 结束事件触发
                this.emit('endEventAS');
            })
            .start();
        return tween;
    }

    /**
     * 获取曲线 Y
     * @param ratioN_ 进度
     * @param tweenIndex_ 指定缓动或缓动队列
     * @returns
     */
    getCurveY(ratioN_: number, tweenIndex_?: number | number[]): number {
        /** 缓动队列 */
        let tweenUnitAs = this.tweenUnitAS;

        // 获取缓动队列
        if (tweenIndex_ !== undefined) {
            if (typeof tweenIndex_ === 'number') {
                tweenUnitAs = tweenUnitAs.slice(tweenIndex_, 1);
            } else {
                tweenUnitAs = [];
                tweenIndex_.forEach((vN) => {
                    tweenUnitAs.push(this.tweenUnitAS[vN]);
                });
            }
            tweenUnitAs = tweenUnitAs.filter((v) => Boolean(v));
        }
        if (!tweenUnitAs.length) {
            return 0;
        }

        /** 总时间（秒） */
        let totalTimeSN = tweenUnitAs.reduce((preValue, currValue) => preValue + currValue.timeSN, 0);
        /** 时间占比 */
        let timeRatioNs: number[] = [];
        {
            let currN = 0;
            tweenUnitAs.forEach((v, kN) => {
                let ratioN = v.timeSN / totalTimeSN;
                currN += ratioN;
                timeRatioNs.push(currN);
            });
        }

        /** 当前缓动下标 */
        let tweenIndexN = timeRatioNs.findIndex((vN) => ratioN_ <= vN);
        if (tweenIndexN === -1) {
            return 0;
        }

        /** 曲线函数 */
        let curveFS = tweenUnitAs.map((v) => {
            if (v.customCurveB) {
                let curve = new BezierCurve(v.controlPointV3S);
                return (kN: number) => {
                    return curve.point(kN)!.y;
                };
            } else {
                return (cc.easing as any)[easingEnum[v.easing]].bind(cc.easing) as (kN: number) => number;
            }
        });

        /** 上个时间占比 */
        let lastTimeRatioN = tweenIndexN ? timeRatioNs[tweenIndexN - 1] : 0;
        /** 当前时间范围 */
        let timeRangeN = timeRatioNs[tweenIndexN] - lastTimeRatioN;
        /** 曲线位置 */
        let posN = (ratioN_ - lastTimeRatioN) / timeRangeN;
        return curveFS[tweenIndexN](posN);
    }
}
