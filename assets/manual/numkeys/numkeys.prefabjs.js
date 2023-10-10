var NumKeysKey = require('numkeys_key.prefabjs')

cc.Class({
    extends: cc.Component,

    properties: {

        init_hidden: true,

        max_length: 6,
        auto_finish_on_max_length: true,

        title: '',
        nums_value: "",
        numkeys_close_btn: cc.Node,

        nums_node: cc.Node,
        btn_nums: [NumKeysKey],                // seq index is num value
        btn_commit: cc.Node,
        btn_back: cc.Node,

        label_disp: cc.Label,
        label_title: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.init()
        // this.bind_btns()

        this.bind_num_keys()
    },

    init() {
        var that = this

        that.nums_value = ''
        that.label_disp.string = that.nums_value

        that.label_title.string = that.title

        that.node.on('touchend', function (e) {
            e.stopPropagation()
        })
        that.nums_node.on('touchend', function (e) {
            e.stopPropagation()
        })


        that.numkeys_close_btn.on('touchend', function (e) {
            e.stopPropagation()

            that.hide()
        })

        that.btn_commit.on('touchend', () => {
            if (this.commit_callback) {
                this.commit_callback(that, that.nums_value)
            }
        })

        that.btn_back.on('touchend', function () {
            that.set_nums_value(that.nums_value.substr(0, that.nums_value.length - 1))
        })
    },
    set_callback(f) {
        this.commit_callback = f
    },
    show() {
        var that = this

        that.node.active = true
        that.stop_anim()
        that.numkeys_anim = cc.tween(that.nums_node)
            .to(
                0.2, {
                scale: 1,
            }, {
                easing: 'smooth'
            }
            ).start()
    },

    hide() {
        var that = this

        that.stop_anim()
        that.numkeys_anim = cc.tween(that.nums_node)
            .to(
                0.1, {
                scale: 0,
            }, {
                easing: 'smooth'
            }
            ).call(function () {
                that.node.active = false
            })
            .start()
    },

    set_nums_value(val) {
        var that = this

        let old_nums_value = that.nums_value

        that.nums_value = val
        that.label_disp.string = that.nums_value

        //  that.node.emit('on_set_nums_value', val)

        if (old_nums_value !== val) {
            //    that.node.emit('on_change_nums_value', old_nums_value, val)
        }

        if (that.auto_finish_on_max_length) {
            if (that.nums_value.length == that.max_length) {
                //    that.node.emit('on_auto_finish_on_max_length', that.nums_value)
            }
        }
    },

    get_nums_value() {
        var that = this

        return that.num_value
    },

    set_title(title) {
        if (!title) {
            this.label_title.active = false
            return
        }
        var that = this

        that.title = title
        that.label_title.string = that.title
        this.label_title.active = true
    },

    set_max_length(max_length) {
        var that = this

        that.max_length = max_length
        if (that.nums_value.length > max_length) {
            that.set_nums_value(that.nums_value.substr(0, that.max_length))
        }
    },

    stop_anim() {
        var that = this

        if (that.numkeys_anim) {
            that.numkeys_anim.stop()
        }
    },

    bind_num_keys() {
        var that = this

        for (let k in that.btn_nums) {
            let btn_num = that.btn_nums[k]
            let btn_val = btn_num.value
            btn_num.node.on('touchend', function () {
                if (that.nums_value.length < that.max_length) {
                    that.set_nums_value(that.nums_value + btn_val)
                }
            })
        }
    },


    // update (dt) {},
});
