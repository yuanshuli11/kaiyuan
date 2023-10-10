import { MoveBase, MoveBase_ } from './MoveBase';
const { ccclass, property, requireComponent } = cc._decorator;

namespace _RollingLottery {
    /** 方向 */
    export enum Direction {
        竖,
        横
    }
}

/** 旋转抽奖 */
@ccclass
export class RollingLottery extends MoveBase {
    /* --------------- 属性 --------------- */
    /** 子节点刷新事件 */
    @property({
        displayName: '子节点刷新事件',
        tooltip: '(子节点_node, 下标_indexN)',
        type: cc.Component.EventHandler
    })
    itemUpdateEvent = new cc.Component.EventHandler();

    /** 方向 */
    @property({
        displayName: '方向',
        type: cc.Enum(_RollingLottery.Direction)
    })
    dire = _RollingLottery.Direction.竖;
    /* --------------- private --------------- */
    /** 周长 */
    private _perimeterN = 0;
    /** 子节点大小 */
    private _ItemSize!: cc.Size;
    /** 自己矩形 */
    private _selfRect = cc.rect();
    /** 父节点中心点矩形 */
    private _parentCenterRect!: cc.Rect;
    /* --------------- 临时变量 --------------- */
    /** 滚动子节点临时变量 */
    private _temp = new (class {
        /** 当前节点矩形 */
        currNodeRect = cc.rect();
        /** 更新节点坐标 */
        updatePosB = false;
        /** 当前下标 */
        currIndexN!: number;
        /** 超出周长倍数 */
        outOfRangeMultipleN!: number;
    })();
    private _temp3Rect = cc.rect();
    /* ------------------------------- 生命周期 ------------------------------- */
    onLoad() {
        super.onLoad();
        this._initView();
        this._initEvent();
    }
    /* ------------------------------- 功能 ------------------------------- */
    /** 初始化事件 */
    private _initEvent(): void {
        this.node.on(cc.Node.EventType.CHILD_ADDED, this._nodeChildAdded, this);
        this.node.on(cc.Node.EventType.CHILD_REMOVED, this._nodeChildRemoved, this);
    }

    /** 初始化视图 */
    private _initView(): void {
        let layout = this.node.getComponent(cc.Layout);
        if (layout) {
            layout.enabled = false;
        }

        // 初始化子节点及选中
        if (this.node.children.length) {
            // 重置子节点
            this.node.children.forEach((v, kN) => {
                v.name = String(kN + this._currIndexN);
                this.itemUpdateEvent.emit([v, kN + this._currIndexN]);
            });

            this.jump(this._currIndexN);
        }
    }

    /** 重制数据 */
    private _resetData(): void {
        this._currIndexN = 0;
        this._ItemSize = this.node.children[0].getContentSize();

        // item 大小矩形，中心点在节点 (0, 0) 位置
        this._parentCenterRect = cc.rect(
            this.node.convertToWorldSpaceAR(cc.Vec2.ZERO).x - this._ItemSize.width * 0.5,
            this.node.convertToWorldSpaceAR(cc.Vec2.ZERO).y - this._ItemSize.height * 0.5,
            this._ItemSize.width,
            this._ItemSize.height
        );

        // 重置数据
        this._selfRect = this._getBoundingBoxToWorld(this.node);
        this._perimeterN = 0;

        // 更新周长
        let itemSize: cc.Size;
        this.node.children.forEach((v) => {
            itemSize = v.getContentSize();
            this._perimeterN += this.dire === _RollingLottery.Direction.横 ? itemSize.width : itemSize.height;
        });
    }

    /** 重制视图 */
    private _resetView(): void {
        if (this.node.children.length) {
            this.jump(this._currIndexN);
        }
    }

    /** 重置 */
    private _reset(): void {
        this._resetData();
        this._resetView();
    }

    /**
     * 获取在世界坐标系下的节点包围盒(不包含自身激活的子节点范围)
     * @param node_ 目标节点
     * @param outRect_ 输出矩形
     * @returns 输出矩形
     */
    private _getBoundingBoxToWorld(node_: cc.Node, outRect_ = cc.rect()): cc.Rect {
        let width = (node_ as any)['_contentSize'].width;
        let height = (node_ as any)['_contentSize'].height;
        outRect_.x = -node_.anchorX * width;
        outRect_.y = -node_.anchorY * height;
        outRect_.width = width;
        outRect_.height = height;
        (node_ as any)['_calculWorldMatrix']();
        outRect_.transformMat4(outRect_, (node_ as any)['_worldMatrix']);
        return outRect_;
    }

    /**
     * 更新节点下标
     * @param node_ 目标节点
     * @param indexN_ 下标
     */
    private _updateNodeIndex(node_: cc.Node, indexN_: number): void {
        node_.name = String(indexN_);
        this.itemUpdateEvent.emit([node_, indexN_]);
    }

    /**
     * 上到下移动子节点
     * @param distN_ 距离
     */
    private _moveNodeTopToBottom(distN_: number): void {
        this.node.children.forEach((v, kN) => {
            this._temp.updatePosB = false;
            this._getBoundingBoxToWorld(v, this._temp.currNodeRect);

            // 移动坐标
            this._temp.currNodeRect.y += distN_;

            // 相交则更新节点坐标
            if (this._temp.currNodeRect.intersects(this._selfRect)) {
                this._temp.updatePosB = true;
            }
            // 若不相交则超出范围
            else {
                // 若节点在上方则跳过更新
                if (this._temp.currNodeRect.yMin > this._selfRect.yMax) {
                    this._temp.updatePosB = true;
                } else {
                    // (超出范围 / 周长) + 超出视图区域的 1
                    this._temp.outOfRangeMultipleN =
                        Math.floor((this._selfRect.yMin - this._temp.currNodeRect.yMax) / this._perimeterN) + 1;

                    // 更新坐标
                    this._temp.currNodeRect.y += this._temp.outOfRangeMultipleN * this._perimeterN;

                    v.setPosition(
                        v.parent.convertToNodeSpaceAR(
                            cc.v3(
                                v.convertToWorldSpaceAR(cc.Vec2.ZERO).x,
                                this._temp.currNodeRect.y + this._ItemSize.height * v.anchorY
                            )
                        )
                    );

                    // 更新 item 下标
                    this._updateNodeIndex(
                        v,
                        Number(v.name) - this._temp.outOfRangeMultipleN * this.node.children.length
                    );
                }
            }

            // 更新节点坐标
            if (this._temp.updatePosB) {
                v.setPosition(
                    v.parent.convertToNodeSpaceAR(
                        cc.v3(
                            v.convertToWorldSpaceAR(cc.Vec2.ZERO).x,
                            this._temp.currNodeRect.y + this._temp.currNodeRect.height * v.anchorY
                        )
                    )
                );
            }

            // 更新当前下标
            this._temp.currIndexN = Number(v.name);

            if (
                this._temp.currIndexN < this._currIndexN &&
                this._temp.currNodeRect.intersection(this._temp3Rect, this._parentCenterRect).height >=
                    this._parentCenterRect.height * 0.5
            ) {
                this.currIndexN = this._temp.currIndexN;
            }
        });
    }

    /**
     * 下到上移动子节点
     * @param distN_ 距离
     */
    private _moveNodeBottomToTop(distN_: number): void {
        this.node.children.forEach((v, kN) => {
            this._temp.updatePosB = false;
            this._getBoundingBoxToWorld(v, this._temp.currNodeRect);

            // 移动坐标
            this._temp.currNodeRect.y += distN_;

            // 相交则更新节点坐标
            if (this._temp.currNodeRect.intersects(this._selfRect)) {
                this._temp.updatePosB = true;
            }
            // 若不相交则超出范围
            else {
                // 若节点在下方则跳过更新
                if (this._selfRect.yMin > this._temp.currNodeRect.yMax) {
                    this._temp.updatePosB = true;
                } else {
                    // (超出范围 / 周长) + 超出视图区域的 1
                    this._temp.outOfRangeMultipleN =
                        Math.floor((this._temp.currNodeRect.yMin - this._selfRect.yMax) / this._perimeterN) + 1;

                    // 更新坐标
                    this._temp.currNodeRect.y -= this._temp.outOfRangeMultipleN * this._perimeterN;

                    v.setPosition(
                        v.parent.convertToNodeSpaceAR(
                            cc.v3(
                                v.convertToWorldSpaceAR(cc.Vec2.ZERO).x,
                                this._temp.currNodeRect.y + this._ItemSize.height * v.anchorY
                            )
                        )
                    );

                    // 更新 item 下标
                    this._updateNodeIndex(
                        v,
                        Number(v.name) + this._temp.outOfRangeMultipleN * this.node.children.length
                    );
                }
            }

            // 更新节点坐标
            if (this._temp.updatePosB) {
                v.setPosition(
                    v.parent.convertToNodeSpaceAR(
                        cc.v3(
                            v.convertToWorldSpaceAR(cc.Vec2.ZERO).x,
                            this._temp.currNodeRect.y + this._temp.currNodeRect.height * v.anchorY
                        )
                    )
                );
            }

            // 更新当前下标
            this._temp.currIndexN = Number(v.name);
            if (
                this._temp.currIndexN > this._currIndexN &&
                this._temp.currNodeRect.intersection(this._temp3Rect, this._parentCenterRect).height >=
                    this._parentCenterRect.height * 0.5
            ) {
                this.currIndexN = this._temp.currIndexN;
            }
        });
    }

    /**
     * 左到右移动子节
     * @param distN_ 距离
     */
    private _moveNodeLeftToRight(distN_: number): void {
        this.node.children.forEach((v, kN) => {
            this._temp.updatePosB = false;
            this._getBoundingBoxToWorld(v, this._temp.currNodeRect);

            // 移动坐标
            this._temp.currNodeRect.x += distN_;

            // 相交则更新节点坐标
            if (this._temp.currNodeRect.intersects(this._selfRect)) {
                this._temp.updatePosB = true;
            }
            // 若不相交则超出范围
            else {
                // 若节点在左方则跳过更新
                if (this._temp.currNodeRect.xMax < this._selfRect.xMin) {
                    this._temp.updatePosB = true;
                } else {
                    // (超出范围 / 周长) + 超出视图区域的 1
                    this._temp.outOfRangeMultipleN =
                        Math.floor((this._temp.currNodeRect.xMin - this._selfRect.xMax) / this._perimeterN) + 1;

                    // 更新坐标
                    this._temp.currNodeRect.x -= this._temp.outOfRangeMultipleN * this._perimeterN;

                    v.setPosition(
                        v.parent.convertToNodeSpaceAR(
                            cc.v3(
                                this._temp.currNodeRect.x + this._ItemSize.width * v.anchorX,
                                v.convertToWorldSpaceAR(cc.Vec2.ZERO).y
                            )
                        )
                    );

                    // 更新 item 下标
                    this._updateNodeIndex(
                        v,
                        Number(v.name) - this._temp.outOfRangeMultipleN * this.node.children.length
                    );
                }
            }

            // 更新节点坐标
            if (this._temp.updatePosB) {
                v.setPosition(
                    v.parent.convertToNodeSpaceAR(
                        cc.v3(
                            this._temp.currNodeRect.x + this._temp.currNodeRect.width * v.anchorX,
                            v.convertToWorldSpaceAR(cc.Vec2.ZERO).y
                        )
                    )
                );
            }

            // 更新当前下标
            this._temp.currIndexN = Number(v.name);

            if (
                this._temp.currIndexN < this._currIndexN &&
                this._temp.currNodeRect.intersection(this._temp3Rect, this._parentCenterRect).width >=
                    this._parentCenterRect.width * 0.5
            ) {
                this.currIndexN = this._temp.currIndexN;
            }
        });
    }

    /**
     * 右到左移动子节
     * @param distN_ 距离
     */
    private _moveNodeRightToLeft(distN_: number): void {
        this.node.children.forEach((v, kN) => {
            this._temp.updatePosB = false;
            this._getBoundingBoxToWorld(v, this._temp.currNodeRect);

            // 移动坐标
            this._temp.currNodeRect.x += distN_;

            // 相交则更新节点坐标
            if (this._temp.currNodeRect.intersects(this._selfRect)) {
                this._temp.updatePosB = true;
            }
            // 若不相交则超出范围
            else {
                // 若节点在右方则跳过更新
                if (this._temp.currNodeRect.xMin > this._selfRect.xMax) {
                    this._temp.updatePosB = true;
                } else {
                    // (超出范围 / 周长) + 超出视图区域的 1
                    this._temp.outOfRangeMultipleN =
                        Math.floor((this._selfRect.xMin - this._temp.currNodeRect.xMax) / this._perimeterN) + 1;

                    // 更新坐标
                    this._temp.currNodeRect.x += this._temp.outOfRangeMultipleN * this._perimeterN;

                    v.setPosition(
                        v.parent.convertToNodeSpaceAR(
                            cc.v3(
                                this._temp.currNodeRect.x + this._ItemSize.width * v.anchorX,
                                v.convertToWorldSpaceAR(cc.Vec2.ZERO).y
                            )
                        )
                    );

                    // 更新 item 下标
                    this._updateNodeIndex(
                        v,
                        Number(v.name) + this._temp.outOfRangeMultipleN * this.node.children.length
                    );
                }
            }

            // 更新节点坐标
            if (this._temp.updatePosB) {
                v.setPosition(
                    v.parent.convertToNodeSpaceAR(
                        cc.v3(
                            this._temp.currNodeRect.x + this._temp.currNodeRect.width * v.anchorX,
                            v.convertToWorldSpaceAR(cc.Vec2.ZERO).y
                        )
                    )
                );
            }

            // 更新当前下标
            this._temp.currIndexN = Number(v.name);

            if (
                this._temp.currIndexN > this._currIndexN &&
                this._temp.currNodeRect.intersection(this._temp3Rect, this._parentCenterRect).width >=
                    this._parentCenterRect.width * 0.5
            ) {
                this.currIndexN = this._temp.currIndexN;
            }
        });
    }

    /** 初始化数据 */
    protected _initData(): void {
        super._initData();
        this._resetData();
    }

    /** 运动 */
    protected _move(valueN_: number): void {
        if (!valueN_) {
            return;
        }
        // 左右滚动
        if (this.dire === _RollingLottery.Direction.横) {
            // 从左往右
            if (valueN_ > 0) {
                this._moveNodeLeftToRight(valueN_);
            }
            // 从右往左
            else if (valueN_ < 0) {
                this._moveNodeRightToLeft(valueN_);
            }
        }
        // 上下滚动
        else {
            // 从上往下
            if (valueN_ < 0) {
                this._moveNodeTopToBottom(valueN_);
            }
            // 从下往上
            else if (valueN_ > 0) {
                this._moveNodeBottomToTop(valueN_);
            }
        }
    }

    /** 获取当前下标 */
    protected _getCurrIndex(): number {
        return this.currIndexN;
    }

    protected _getMoveDist(indexN_: number, scrollConfig_?: RollingLottery_.ScrollConfig): number {
        /** 当前节点 */
        let currNode = this.node.getChildByName(String(this._currIndexN));
        /** 间隔格子 */
        let intervalN = indexN_ - this._currIndexN;
        /** 格子距离 */
        let boxDistN = this.dire === _RollingLottery.Direction.横 ? this._ItemSize.width : this._ItemSize.height;
        /** 当前格子距父节点(0, 0)的偏移坐标 */
        let offsetDistV3 = this.node
            .convertToWorldSpaceAR(cc.Vec2.ZERO)
            .clone()
            .subtract(currNode.convertToWorldSpaceAR(cc.Vec2.ZERO));
        // 设置总距离
        if (this.dire === _RollingLottery.Direction.横) {
            return -intervalN * boxDistN + offsetDistV3.x;
        } else {
            return intervalN * boxDistN + offsetDistV3.y;
        }
    }

    loop(speedN_: number, timeSN_?: number): void {
        if (this.dire === _RollingLottery.Direction.竖) {
            speedN_ = -speedN_;
        }
        super.loop(speedN_, timeSN_);
    }

    move(indexN_: number, scrollConfig_?: RollingLottery_.ScrollConfig): void {
        super.move(indexN_, new RollingLottery_.ScrollConfig(scrollConfig_));
    }

    jump(indexN_: number): void {
        super.jump(indexN_);
        this.currIndexN = indexN_;
    }

    getSpeed(indexN_: number, scrollConfig_?: RollingLottery_.GetSpeedConfig): number {
        return super.getSpeed(indexN_, new RollingLottery_.GetSpeedConfig(scrollConfig_));
    }
    /* ------------------------------- 节点事件 ------------------------------- */
    private _nodeChildAdded(): void {
        this._reset();
    }

    private _nodeChildRemoved(): void {
        this._reset();
    }
}

export namespace RollingLottery_ {
    /** 方向 */
    export const Direction = _RollingLottery.Direction;
    /** 方向 */
    export type Direction = _RollingLottery.Direction;

    /** 滚动配置 */
    export class ScrollConfig extends MoveBase_.MoveConfig {
        constructor(init_?: ScrollConfig) {
            super(init_);
        }
    }

    /** 获取滚动速度配置 */
    export class GetSpeedConfig extends ScrollConfig {
        constructor(init_?: GetSpeedConfig) {
            super(init_);
            Object.assign(this, init_);
        }
        /** 进度 */
        ratioN? = 0;
    }
}
