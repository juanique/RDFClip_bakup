var Notifier = Class.extend({
    init: function(){
        // requires base class to define 
        this.listeners = [];
    },
    addListener: function(callback) {
        this.listeners.push(callback);
    },

    notifyAll:  function(eventName, args) {
        for (var i in this.listeners) {
            var listener = this.listeners[i];
            try {
                if(typeof(listener[eventName]) == "function"){
                    listener[eventName](args, this);
                }
            } catch (e) {
                //no listener for event
            }
        }
    }
});
