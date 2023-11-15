$.declare("websocketClient", null, {
    init: function (options) {
        var self=this;
        this.connect = function () {
			var link="ws://" + options.arg.host + ":" + options.arg.port + options.arg.channel;
            this.ws = new ReconnectingWebSocket(link, null, { debug: false, reconnectInterval: 60000 });
        };
        this.connect();
        var ws = this.ws;
        ws.onopen = function () {
            console.log("websocket- "+ws.url +" on connect");
        };
		
		var randomUser=function(){
			var characters = 'abcdefghijklmnopqrstuvwxyz'; 
			var result = ' '; 
			var charactersLength = characters.length; 
			for(let i = 0; i < 10; i++) { 
				result +=  
				characters.charAt(Math.floor(Math.random() * charactersLength)); 
			} 
			return result;
		}
		
        //gauge_socket.run(100);
        ws.onmessage = function (evt) {
            var body = JSON.parse(evt.data);
            if (body.querytype == "realtimeByLastDatetime") {
                var datekey = body.data;
                datekey = datekey.replace(/-/g, '/');
                var dt = new Date(datekey);
                setTimeout(function () {
                    $(".lbl_proc_socket").html("Data time:" + datekey);
                    $("#lbl_proc_time").text(datekey);
                    $("#lbl_proc_socket").html("Connected");
                    $("#div_spark_logo_deactivate").css("display","none");
                    $("#div_spark_logo_activate").css("display","block");
                }, 600);

               if($("#div_ts_day").length>0) $("#div_ts_day")[0].innerHTML = monthNames[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear().toString();
                self.updateTimeStamp(dt);
            }
        };
        ws.readySend = function (message, callback) {
            waitForConnection(function () {
                var msg = JSON.parse(message);
                msg.token = randomUser();
				msg.user="marco";
                ws.send(JSON.stringify(msg));
                if (typeof callback !== 'undefined') {
                    callback();
                }
            }, 500);
        };
        ws.readyQuery = function (message, callback) {
            waitForConnection(function () {
                ws.send(message);
                if (typeof callback !== 'undefined') {
                    callback();
                }
            }, 500);
        };
        waitForConnection = function (callback, interval) {
            if (ws.readyState === 1) {
                callback();
            } else {
                var self = this;
                setTimeout(function () {
                    self.waitForConnection(callback, interval);
                }, interval);
            }
        };
    },
    updateTimeStamp: function (dt) {
        if (!dt) dt = new Date();
        var hours = ((dt.getHours() + 11) % 12 + 1);
        var minutes = dt.getMinutes();
        var h = (hours < 10) ? ("0" + hours.toString()) : hours.toString();
        var m = (minutes < 10) ? ("0" + minutes.toString()) : minutes.toString();
        h = (h == "00") ? 12 : h;
        if($("#div_ts_tiempo").length>0)$("#div_ts_tiempo")[0].innerHTML = h + ":" + m;
        if($("#div_ts_tiempo").length>0)$("#div_ts_sufix")[0].innerHTML = (dt.getHours() >= 12) ? "PM" : "AM";
    }
});
