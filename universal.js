(function(window, doc) {
	//公共变量&方法 (public var function)
	
	var pVF = {
		//这里可以添加公共属性
		iconURL : "icon/",
		
		//这里可以添加公共方法
		//注释格式如下：
			/*
			 * @description	方法描述
			 * @parameter {类型} 参数名（“[参数名]”表示可选参数） 说明
			 * @property {类型} 属性名 说明
			 * @return {类型} 返回值
			 */
		getObj : function(idName) {
			/*
			 * @description	根据ID获取HTML元素
			 * @parameter {string} idName 名字
			 * @return {object} obj	HTML元素
			 */
			if (typeof idName !== "string") {
				throw new Error("idName must be a string");
			}
			var obj = doc.getElementById(idName);
			if (obj) {
				return obj;
			} else {
				throw new Error('ID name "' + idName + '" was not found.');
			}
		},
		getObjs : function(className) {
			/*
			 * @description	根据类名获取HTML元素集合
			 * @parameter {string} className 类名
			 * @return {array} objs HTML元素数组
			 */
			if (typeof className !== "string") {
				throw new Error("className must be a string!");
			}
			var getElementsByClassName = function(className) {
				var eles =  doc.getElementsByTagName("*"),
					resultArr = [];
				for (var i = 0, len = eles.length; i < len; i++) {
					var eachEle = eles[i],
						classNames = eachEle.className.split(" ");
					for (var j = 0, len2 = classNames.length; j < len2; j++) {
						if (classNames[j] === className) {
							resultArr.push(eachEle);
							break;
						}
					}
				}
				return resultArr;
			},
			objs = typeof  doc.getElementsByClassName === "function" ?  doc.getElementsByClassName(className) : getElementsByClassName(className);
			
			return Array.prototype.slice.apply(objs);
		},
		addScript : function(url, callback) {
			/*
			 * @description	动态加载JS文件
			 * @parameter {string} url 请求地址
			 * @parameter {function} [callback] 回调函数
			 * @return {object} this
			 */
			var script = doc.createElement("script");
			script.src = url;
			script.type = "text/javascript";
			script.charset = "utf-8";
			var body = doc.body || doc.getElementsByTagName("body")[0];
			body.appendChild(script);
			
			if (callback) {
				if (typeof callback === "function") {
					if (!script.readyState) {
						script.onload = function() {
							script.onload = null;
							callback();
						};
					} else{
						script.onreadystatechange = function() {
							if (script.readyState === "loaded" || script.readyState === "complete") {
								script.onreadystatechange = null;
								callback();
							}
						};
					}
				} else {
					throw new Error("callback must be a function");
				}
			}
			
			return this;
		},
		shallowCopy : function(obj) {
			/*
			 * @description	浅拷贝
			 * @parameter {object} obj 被拷贝的对象
			 * @return {object} newObj 拷贝的新对象
			 */
			if (typeof obj !== "object") {
				return obj;
			}
			var newObj = obj instanceof Array ? [] : {};
			for (var prop in obj) {
				newObj[prop] = obj[prop]; 
			}
			
			return newObj;
		},
		deepCopy : function(obj) {
			/*
			 * @description	深拷贝
			 * @parameter {object} obj 被拷贝的对象
			 * @return {object} newObj 拷贝的新对象
			 */
			if (typeof obj !== "object") {
				return obj;
			}
			var newObj = obj instanceof Array ? [] : {};
			for (var prop in obj) {
				newObj[prop] = arguments.callee(obj[prop]);
			}
			
			return newObj;
		},
		inheritObject : function(obj) {
			/*
			 * @description	对象继承
			 * @parameter {object} obj 被继承的对象
			 * @return {object} 新对象
			 */
			function F() {}
			F.prototype = obj;
			
			return new F();
		},
		isEmptyObject : function(obj) {
			/*
			 * @description	判断是否为空对象
			 * @parameter {object} obj 被判断的对象
			 * @return {boolean} 判断结果
			 */
			for (var prop in obj) {
				return false;
			}
			
			return true;
		},
		ajax : function(parameters) {
			/*
			 * @description	用Ajax获取数据。
			 * @parameter {object} parameters 数据对象，属性如下：
			 * @property {string} url 请求地址
			 * @property {string} [method] 请求方式，默认【get】
			 * @property {object} [data] 发送的数据，默认【{}】
			 * @property {boolean} [async] 是否异步，默认【false】
			 * @property {function} [success] 请求数据成功的回调函数，默认【function(data){}】，【data】表示请求到的数据
			 * @property {function} [error] 请求数据失败的回调函数，默认【function(status){}】，【status】表示XHR的状态码
			 * @return {undefined}
			 */
			
			var url = parameters.url,
				method = parameters.method || "get",
				data = parameters.data || {},
				async = parameters.async || false,
				success = parameters.success || function(data){},
				error = parameters.error || function(status){},
				formData = function(data) {
					var newData = "";
					for (var prop in data) {
						newData += encodeURIComponent(prop);
						newData += "=";
						newData += encodeURIComponent(data[prop]);
						newData += "&";
					}
					return newData.substring(0, newData.length - 1);
				};
				
			if (typeof url !== "string") {
				throw new Error("url must be a string");
			}
			if (typeof data !== "object") {
				throw new Error("data must be a object");
			}
			if (!this.isEmptyObject(data)) {
				if (method === "get") {
					if (url.indexOf("?") === -1) {
						url += "?";
					} else if (url.indexOf("&") !== url.length - 1) {
						url += "&";
					}
					url += formData(data);
					data = null;
				} else{
					data = formData(data);
				}
			}
			
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
						success(xhr.responseText);
					} else{
						error(xhr.status);
					}
				}
			};
			xhr.open(method, url, async);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(data);
		},
		getStrLen : function(str) {
			/*
			 * @description	获取字符串长度，一个中文字符等于两个英文字符。
			 * @parameter {string} str 字符串
			 * @return {number} 该字符串的长度
			 */
		    str = str.toString();
		    var count = 0;
		    for (var i = 0, n = str.length; i < n; i++) {
		        var c = str.charCodeAt(i);
		        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
		        	count++;
		        } else {
		        	count += 2;
		        }  
		    }
		    return Math.ceil(count / 2);  
		},
		addEventListener : function(dom, type, func) {
			/*
			 * @description	为元素添加监听事件
			 * @parameter {object} dom DOM元素
			 * @parameter {string} type 事件类型
			 * @parameter {function} func 为此事件绑定的函数
			 * @return {object} this
			 */
			if (dom.addEventListener) {
				dom.addEventListener(type, func, false);	//false 表示在事件冒泡阶段执行
			} else if(dom.attachEvent) {
				dom.attachEvent("on" + type, func);
			} else{
				dom["on" + type] = func;
			}
			
			return this;
		},
		removeEventListener : function(dom, type, func) {
			/*
			 * @description	为元素移除监听事件
			 * @parameter {object} dom DOM元素
			 * @parameter {string} type 事件类型
			 * @parameter {function} func 之前为此事件绑定的函数
			 * @return {object} this
			 */
			if (dom.removeEventListener) {
				dom.removeEventListener(type, func, false);	//false 表示在事件冒泡阶段执行
			} else if(dom.detachEvent) {
				dom.detachEvent("on" + type, func);
			} else{
				dom["on" + type] = null;
			}
			
			return this;
		},
		preventDefault : function(event) {
			/*
			 * @description	阻止事件的默认行为
			 * @parameter {object} [event] 事件
			 * @return {object} this
			 */
			event = event || window.event;
			if (event.preventDefault) {
				event.preventDefault();
			} else{
				event.returnValue = false;
			}
			
			return this;
		},
		getTarget : function(event) {
			/*
			 * @description	获取点击事件的当前HTML对象
			 * @parameter {object} [event] 事件
			 * @return {object} 当前HTML对象
			 */
			event = event || window.event;
			
			return event.target || event.srcElement;
		},
		addCookie : function(name, value, day) {
			/*
			 * @description	添加指定cookie
			 * @parameter {string} name  名字
			 * @parameter {string} [value]  值
			 * @parameter {number} [day]  天数
			 * @return {object} this
			 */
			if (typeof name !== "string") {
				throw new Error("name must be a string");
			}
			day = day || 7;		//默认存一周
			var time = new Date();
			time.setTime(time.getTime() + Number(day) * 24 * 60 * 60 * 1000);
			doc.cookie = name + "=" + value + ";expires=" + time.toUTCString();
			
			return this;
		},
		deleteCookie : function(name) {
			/*
			 * @description	删除指定cookie
			 * @parameter {string} name  名字
			 * @return {object} this
			 */
			if (typeof name !== "string") {
				throw new Error("name must be a string");
			}
			var time = new Date();
			time.setTime(time.getTime() - 1000);
			doc.cookie = name + "=;expires=" + time.toUTCString();
			
			return this;
		},
		getCookie : function(name) {
			/*
			 * @description	获取指定cookie
			 * @parameter {string} name  名字
			 * @return {string} value 获取的值
			 */
			if (typeof name !== "string") {
				throw new Error("name must be a string");
			}
			var value = "",
				arr = doc.cookie.split(";");
			for (var i = 0, len = arr.length; i < len; i++) {
				var item = arr[i].trim();
				if (item.indexOf(name) > -1) {
					value = item.substring(name.length + 1);
					break;
				}
			}
			
			return value;
		}
	};
	
	//是否具有AMD的模块模块加载框架【RequireJS】,若存在则定义此模块，否则定义全局变量【pVF】。
	typeof define === "function" ? define({pVF : pVF}) : window.pVF = pVF;
	
})(window, document);