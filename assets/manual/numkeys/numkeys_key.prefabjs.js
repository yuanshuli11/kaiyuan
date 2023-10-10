cc.Class({
    extends: cc.Component,

    properties: {
        value: '', 
        label: cc.Label, 
    },

    editor: {
        executeInEditMode: true
    },

    start () {
        var that = this

        that.label.string = that.value
    },

});
