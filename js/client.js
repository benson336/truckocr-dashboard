$.declare("client", null, {
    init: function (options) {
		var ops_ws= {
			host: "18.191.216.145",
			port: "8017",
			channel: "/dashboard/service/web"
		};
		
		var socket = new websocketClient({
			arg:ops_ws
		});
		
		var ws = socket.ws;
		ws.addEventListener('message', function (evt) {
			var body = JSON.parse(evt.data);
			if(body.querytype&&body.querytype=="rept1"){
				if(body.data){
					var today_volume;
					var props=JSON.parse(body.data);
					for(var i=0;i<props.length;i++){
						var seg=props[i];
						if(seg.element){
							switch(seg.element){
								case "header":
									this.animateValue(jQuery(".container_4col.Ascan-container-count"),1000,seg.data[0].VOLUME,1000);
									this.animateValue(jQuery(".container_4col.Bscan-container-count"),1000,seg.data[1].VOLUME,1000);
									this.animateValue(jQuery(".container_4col.Cscan-container-count"),1000,seg.data[2].VOLUME,1000);
									this.animateValue(jQuery(".container_4col.Dscan-container-count"),1000,seg.data[3].VOLUME,1000);
									today_volume=seg.data[3].VOLUME;
									//jQuery(".container_4col.Ascan-container-count").text(this.addCommas(seg.data[0].VOLUME));
									//jQuery(".container_4col.Bscan-container-count").text(this.addCommas(seg.data[1].VOLUME));
									//jQuery(".container_4col.Cscan-container-count").text(this.addCommas(seg.data[2].VOLUME));
									//jQuery(".container_4col.Dscan-container-count").text(this.addCommas(seg.data[3].VOLUME));
									jQuery(".container_row .container_4cols").show();
									console.log(seg.data);
									break;
								case "barchart":
									this.load_barchart(".container_barchart", seg.data);
									break;
								case "linechart":
									this.load_linechart(".container_linechart",seg.data);
									break;
								case "table":
									if(seg.node=="table-container-delivered-hubcode"){
										this.load_table_horizontal(jQuery("."+seg.node),seg.data,seg["width"],seg["border"],"dynamic_table_horizontal");
									}
									if(seg.node=="table-container-delivered-l30d"){
										seg.data[0]["Volume"]=today_volume;
										this.load_table(jQuery("."+seg.node),seg.data,seg["width"],seg["border"],"dynamic_table");
									}
									break;
								default:
									break;
							}
						}
					}

				}
			}else if(body.querytype=="realtimeByLastDatetime"){
				console.log(body);
			}
			
		}.bind(this));

		this.connect = function () {
			var body = { querytype: "rept1", data: "subscribe" };
			var msg = JSON.stringify(body);
			console.log("send subscribe message:" + msg);
			ws.readySend(msg);
		}
		this.disconnect = function () {
			var body = { querytype: "rept1", data: "unsubscribe" };
			var msg = JSON.stringify(body);
			console.log("send unsubscribe message:" + msg);
			ws.readySend(msg);
		}
		this.connect();
    },
	getRandomInt:function(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	animateValue: function(obj, start, end, duration) {
	    if (start === end) return;
	    var range = end - start;
	    var current = this.getRandomInt(start,end);
	    var increment = end > start? 1 : -1;
	    var stepTime = Math.abs(Math.floor(duration / range));
		var ts=(new Date()).getTime();
	    var timer = setInterval(function() {
	        current += increment;
	        obj.text(this.addCommas(current));
	        if (current == end||(new Date()).getTime()>ts+duration) {
	            clearInterval(timer);
				obj.text(this.addCommas(end));
	        }
	    }.bind(this), stepTime);
	},
	load_table: function(container,data,width,border, table_class){
		if(!data||!data.length) return;
		var headers=Object.keys(data[0]);
		var rows=Object.values(data);
		if(border){
			border="border="+border;
		}else{
			border="";
		}
		var table=jQuery("<table class='"+table_class+"' "+border+" style='width:"+width+";'><tHead></tHead><tBody></tBody></table>");
		table.find("tHead").append(this.gen_headers(headers));
		table.find("tBody").append(this.gen_rows(headers,rows));
		jQuery(container).empty();
		jQuery(container).append(table);
	},
	load_table_horizontal: function(container,source,width,border,table_class){
		if(!source||!source.length) return;
		var data={}
		var headers={}
		for (var i=0;i<source.length;i++){
			var row=source[i];
			if((row["VOLUME"]!=null)) data[row["HUBCODE"]]=row["VOLUME"];
		}
		var headers=Object.keys(data);
		var rows=Object.values(data);
		if(border){
			border="border="+border;
		}else{
			border="";
		}
		var table=jQuery("<table class='"+table_class+"' "+border+" style='width:"+width+";'><tHead></tHead><tBody></tBody></table>");
		table.find("tHead").append(this.gen_headers(headers));
		table.find("tBody").append(this.gen_rows_horizontal(headers,rows));
		jQuery(container).empty();
		jQuery(container).append(table);
	},
	gen_headers: function(headers){
		var h="<tr style='border-bottom: 1px solid #ccc;font-weight:bold;'>";
		for (var i=0;i<headers.length;i++){
			h+='    <td style="padding:5px;">'+headers[i]+'</td>'
		}
		h+='</tr>';
		return jQuery(h);
	},
	gen_rows: function(headers,rows){
		var h="";
		for (var j=0;j<rows.length;j++){
			var tr="<tr style='border-bottom: 1px solid #ccc;'>"
			for (var i=0;i<headers.length;i++){
				var el=rows[j][headers[i]];
				if(jQuery.isNumeric(el)) el=this.addCommas(el);
				tr+='    <td style="padding:5px;">'+el+'</td>'
			}
			
			tr+="</tr>";
			h+=tr;
		}
		return jQuery(h);
	},
	gen_rows_horizontal: function(headers,rows){
		var h="";
		var tr="<tr style='border-bottom: 1px solid #ccc;'>"
		for (var j=0;j<rows.length;j++){
			var el=rows[j];
			if(jQuery.isNumeric(el)) el=this.addCommas(el);
			tr+='    <td style="padding:5px;">'+el+'</td>'
		}
		tr+="</tr>";
		h+=tr;

		return jQuery(h);
	},
	load_barchart: function(chart_name, d){
		var x_data=[];
		var y_data=[];
		for (var i = 0; i <d.length; i++) {
			if(d[i][Object.keys(d[0])[0]]&&d[i][Object.keys(d[0])[1]]){
				x_data.push(d[i][Object.keys(d[0])[0]]);
				y_data.push(d[i][Object.keys(d[0])[1]]);
			}
		}
		var dom = jQuery(chart_name)[0];
		var myChart = echarts.init(dom, "dark", {
		    renderer: 'canvas',
		    useDirtyRect: false
		});
		
		var app = {};
		
		var option;

		option = {
		  backgroundColor:"black",
		  xAxis: {
			type: 'category',
			data: x_data
		  },
		  yAxis: {
			type: 'value'
		  },
		  series: [
			{
			  data: y_data,
			  type: 'bar',
			  itemStyle: {
					color: '#2D98DC'
			  }
			}
		  ]
		}
		
		//#2D98DC

		if (option && typeof option === 'object') {
		  myChart.setOption(option);
		}
		window.addEventListener('resize', myChart.resize);
	},
	load_linechart: function(chart_name,d){
		var x_data=[];
		var y_data=[];
		for (var i = 0; i <d.length; i++) {
			var props=d[i][Object.keys(d[0])[0]];
			x_data.push(props.replace("2023-","").replace("-","/"));
			y_data.push(d[i][Object.keys(d[0])[1]]);
		}
		
		var dom = jQuery(chart_name)[0];
		var myChart = echarts.init(dom, "dark", {
		    renderer: 'canvas',
		    useDirtyRect: false
		});
		
		var app = {};
		
		var option;

		option = {
		  backgroundColor:"black",
		  xAxis: {
			type: 'category',
			data: x_data
		  },
		  yAxis: {
			type: 'value'
		  },
		  series: [
			{
			  data: y_data,
			  type: 'line',
			  itemStyle: {
					color: '#2D98DC'
			  }
			}
		  ]
		}

		if (option && typeof option === 'object') {
		  myChart.setOption(option);
		}
		window.addEventListener('resize', myChart.resize);
	},
    addCommas: function (nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    money: function (valor) {
        if (!valor) return "$0";
        var result = valor.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        if (result.indexOf("-") == -1) return "$" + result;
        else return "($" + result.split("-")[1] + ")";
    },
    percent: function (valor) {
        if (!valor) return "0.0%";
        valor = (valor * 100).toFixed(2) + "%";
        var new_data = (valor) ? valor.replace(/^-/g, "($')!") : "0.0%";
        var datareuse = new_data.split("!");
        if (datareuse.length > 1) return datareuse[0];
        else return new_data;
    },
    updateTimeStamp: function (dt) {
        if (!dt) dt = new Date();
        var hours = ((dt.getHours() + 11) % 12 + 1);
        var minutes = dt.getMinutes();
        var h = (hours < 10) ? ("0" + hours.toString()) : hours.toString()
        var m = (minutes < 10) ? ("0" + minutes.toString()) : minutes.toString()
        h = (h == "00") ? 12 : h;
        $("#div_ts_tiempo")[0].innerHTML = h + ":" + m;
        $("#div_ts_sufix")[0].innerHTML = (dt.getHours() >= 12) ? "PM" : "AM";
    }
})