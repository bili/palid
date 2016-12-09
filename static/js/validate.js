/*
 * Validate.js v0.1
 * 
 * Date: 2016-12-07
 * Github: bili/validate.js
 */

//todos:
    //multiple selector
    //tag data-xxx
    //ajax

(function() {
    //类似 jquery
    var $ = function(selector, context) {
        return new $.fn.init(selector, context);
    };
    $.fn = $.prototype;
    $.fn.init = function(selector, context) {
        var nodeList = (context || document).querySelectorAll(selector);
        this.length = nodeList.length;
        for (var i = 0; i < this.length; i++) {
            this[i] = nodeList[i];
        }
        return this;
    };
    $.fn.each = function(fn) {
        var i = 0, length = this.length;
        for (; i < length; i++) {
            fn.call(this[i], i, this[i]);
        }
        return this;
    };

    function isDate(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object Date]';
    }
    function isArray(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object Array]';
    }
    function isString(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object String]';
    }
    function isNumber(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object Number]';
    }
    function isPattern(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object RegExp]';
    }
    function isBoolean(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object Boolean]';
    }
    function isFunction(obj) {
        return typeof obj != 'undefined' 
            && Object.prototype.toString.call(obj) == '[object Function]';
    }
    function isInputText(dom) {
        return typeof dom != 'undefined' 
            && dom.tagName
            && dom.tagName.toLowerCase() == 'input'
            && !isCheckbox(dom)
            && !isSelect(dom)
            && !isRadio(dom)
    }
    function isCheckbox(dom) {
        return typeof dom != 'undefined' 
            && dom.tagName
            && dom.tagName.toLowerCase() == 'input'
            && dom.getAttribute('type') == 'checkbox'
    }
    function isRadio(dom) {
        return typeof dom != 'undefined' 
            && dom.tagName
            && dom.tagName.toLowerCase() == 'input'
            && dom.getAttribute('type') == 'radio'
    }
    function isSelect(dom) {
        return typeof dom != 'undefined' 
            && dom.tagName
            && dom.tagName.toLowerCase() == 'select'
    }

    //用于格式化输出
    //@param str<String> 模板, 变量用#{xxx}包裹
    //@param data<JSON Object> 变量对象，用{}包裹
    //@return <String> 编译后的模板结果
    function tmpl(str, data) {
        str = str.replace(/#{([^}]*)}/g, function(val, replacement) {
            return eval('data.' + replacement);
        });
        return str;
    }

    //用于构建输出信息中的变量
    //@param fields<JSON Object> 自定义对象
    //@param args<arguments> 导入arguments
    //@return <JSON Object>
    function arguing(fields, args) {
        var params = Array.prototype.slice.call(args);
        params.forEach(function(item, idx) {
            fields['$'+(idx++)] = item;
        })
        return fields;
    }

    //验证唯一类，对外暴露为V
    //@param el<DOM selector> 选择器
    //@return <V instance> 
    function _V(el) {
        this.el = el;
        this.dom = $(el);
        if (this.dom.length == 0) {
            throw new Error(tmpl('不存在选择器#{el}', {el: this.el}));
        }
        this.sequence = [];
        this.status = {passed: false, msg: ''};
        return this;
    }

    //内置常见匹配规则
    _V.patterns = {
        //不为空
        '!empty': /\S/,

        /********************数学******************/

        //整数
        'integer': /^-?\d+$/,
        //正整数 如：023
        'positive-integer': /^[0-9]*[1-9][0-9]*$/,
        //负整数
        'negative-integer': /^-[0-9]*[1-9][0-9]*$/,
        //非正整数(负整数+0)
        'not-positive-integer': /^((-\\d+)|(0+))$/,
        //非负整数(正整数+0)
        'not-negative-integer': /^\d+$/,
        //浮点数
        'float': /^(-?\\d+)(\\.\\d+)?$/,
        //正浮点数
        'positive-float': /^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$/,
        //负浮点数
        'negative-float': /^(-(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/,
        //非正浮点数(负浮点数+0)
        'not-positive-float': /^((-\\d+(\\.\\d+)?)|(0+(\\.0+)?))$/,
        //非负浮点数(正浮点数+0)
        'not-negative-float': /^((-\\d+(\\.\\d+)?)|(0+(\\.0+)?))$/,
        //偶数
        'even': function(v) { return v % 2 == 0; },
        //奇数
        'odd': function(v) { return v % 2 != 0; },

        /*******************字符串******************/

        //用户名命名 以$_\d\w开头的非空格字符
        'simple-name': /^[$_\d\w]\S*$/,
        //英文单词, 中间可以保留'-'
        'word': /^[a-zA-Z]+(-[a-zA-Z]+)*$/,
        //是否包含中文（日文，韩文）
        'has-zh': /[\u4E00-\u9FA5\uF900-\uFA2D]/,
        //是否含有全角符号
        'hasFullWidthChars': /[\uFF00-\uFFEF]/,

        /********************日期*******************/

        //日期格式: yyyy-mm-dd
        'date': /^\d{4}-\d{2}-\d{2}$/,
    };

    _V.defaults = {
        //默认输出
        msg: {
            'text-empty': '不能为空',
            'select-empty': '至少选择一项',
            'checkbox-empty': '至少选择一项',
            'radio-empty': '请选择',
            'match': '#{input}: 不符合要求',
            'range': '不在规定范围(#{$0}, #{$1})内',
            'equals': '不相等',
            'contains': '不包含指定字符(串): #{$0}'
        }
    };

    //用于输出验证状态
    //前提需要在被测对象同级插入class="msg"的dom
    //状态包含ok/fail，因此页面样式最好不要再另外定义ok/fail样式，
    //避免冲突
    _V.msg = {};

    _V.msg.ok = function(dom, msg) {
        if (dom && typeof msg != 'undefined') {
            var d = dom.parentNode.querySelector('.msg');
            if (!d) return;
            d.classList.remove('fail');
            d.classList.add('ok');
            d.innerText = msg;
        }
    };

    _V.msg.fail = function(dom, msg) {
        if (dom && typeof msg != 'undefined') {
            var d = dom.parentNode.querySelector('.msg');
            if (!d) return;
            d.classList.remove('ok');
            d.classList.add('fail');
            d.innerText = msg;
        }
    };

    //核心函数
    //匹配输入是否满足条件
    //@param pattern<Array|Pattern|PatternWord|Function> 匹配规则
    //如果为<Array>，则其中的元素类型与上述规则相同
    //如果为<PatternWord>，则只能是内建正则缩写，或是使用V.pattern()定义新的规则
    //如果为<Function>，则返回值类型必须为<Boolean>
    //@param [msg<String>] 不满足该规则时的输出信息
    //@return <V instance>
    _V.prototype.match = function(pattern, msg) {
        var that = this;
        var callee = arguments.callee;
        //支持简单的匹配规则连写: ['xxx', 'xxx']
        if (isArray(pattern)) {
            pattern.forEach(function(item) {
                callee.call(that, item, msg);
            })
        }
        //支持多种自定义匹配规则
        //正则表达式|内置规则|自定义函数匹配
        else {
            this.sequence.push({
                fn: function() {
                    if (isFunction(pattern)) {
                        return pattern.call(this, this.dom[0].value);
                    } else if (isPattern(pattern)) {
                        pattern.lastIndex = 0;
                        return pattern.test(this.dom[0].value);
                    } else if (isString(pattern)) {
                        var p = _V.patterns[pattern];
                        if (isFunction(p)) return p.call(this, this.dom[0].value);
                        else {
                            p.lastIndex = 0;
                            return p ? p.test(this.dom[0].value) : false;
                        }
                    }
                },
                args: arguments,
                fields: arguing({input: this.dom[0].value}, arguments),
                msg: msg || _V.defaults.msg.match,
                scope: this
            });
        }
        return this;
    };

    //判断输入是否不为空
    //支持的dom包含<StringLike|Select|Checkbox|Radio>
    //@param [msg<String>] 不满足该规则时的输出信息
    //@return <V instance> 
    _V.prototype.notEmpty = function(msg) {
        var that = this;
        var dom = this.dom[0];
        if (isInputText(dom)) return this.match('!empty', msg||_V.defaults.msg['text-empty']);
        else if (isSelect(dom)) return this.range(1, Number.MAX_VALUE, msg||_V.defaults.msg['select-empty']);
        else if (isCheckbox(dom)) return this.range(1, Number.MAX_VALUE, msg||_V.defaults.msg['checkbox-empty']);
        else if (isRadio(dom)) return this.match(function() {
            return [].filter.call(that.dom, function(r) {
                return r.checked;
            }).length != 0;
        }, msg||_V.defaults.msg['radio-empty']);
        return this;
    };

    //判断是否包含 chars 字符串
    //@param chars<String> 包含的字符串
    //@param [isFull<Boolean, Default=false>]: 是否完全与输入匹配相等
    //@param [msg<String>] 不满足该规则时的输出信息
    //@return <V instance> 
    _V.prototype.contains = function(chars, isFull, msg) {
        if (!isInputText(this.dom[0])) {
            throw new Error(tmpl('#{el}不支持contains方法', {el: this.el}));
        }
        this.sequence.push({
            fn: function() {
                var full = false;
                if (arguments.length > 1) {
                    full = isBoolean(isFull) ? isFull : full;
                }
                //var p = new RegExp("^\\b"+chars+"\\b$");
                //p.lastIndex = 0;
                return full ? this.dom[0].value === chars : this.dom[0].value.indexOf(chars) != -1;
            },
            args: arguments,
            fields: arguing({input: this.dom[0].value}, arguments),
            msg: msg || _V.defaults.msg.contains,
            scope: this
        });
        return this;
    };

    //判断是否相等
    //_V.prototype.contains 的简写，默认isFull=true
    _V.prototype.equals = function(chars, msg) {
        return this.contains(chars, true, msg||_V.defaults.msg.equals);
    };

    //判断输入是否在允许范围内
    //支持<Date|Number|Checkbox|Select>
    //@param min<Number> 最小值
    //@param max<Number> 最大值
    //@param [msg<String>] 不满足该规则时的输出信息
    //@return <V instance> 
    _V.prototype.range = function(min, max, msg) {
        var that = this;
        if (isCheckbox(this.dom[0])) {
            this.sequence.push({
                fn: function() {
                    var len = [].filter.call(this.dom, function(d) {
                        return d.checked;
                    }).length;
                    return len >= min && len <= max;
                },
                args: arguments,
                fields: arguing({
                    select: (function() {
                        return [].filter.call(that.dom, function(d) {
                            return d.checked;
                        }).length;
                    }()), 
                    input: (function() {
                        var v = [];
                        [].forEach.call(that.dom, function(d) {
                            if (d.checked) v.push(d.value);
                        });
                        return v.join(',');
                    }())
                }, arguments),
                msg: msg || _V.defaults.msg.range,
                scope: this
            });
        } else if (isSelect(this.dom[0])) {
            this.sequence.push({
                fn: function() {
                    var len = [].filter.call(this.dom[0].querySelectorAll('option'), function(o) {
                        return o.selected;
                    }).length;
                    return len >= min && len <= max;
                },
                args: arguments,
                fields: arguing({
                    select: (function() {
                        return [].filter.call(that.dom[0].querySelectorAll('option'), function(o) {
                            return o.selected;
                        }).length;
                    }()), 
                    input: (function() {
                        var v = [];
                        [].forEach.call(that.dom[0].querySelectorAll('option'), function(o) {
                            if (o.selected) v.push(o.value);
                        });
                        return v.join(',');
                    }())
                }, arguments),
                msg: msg || _V.defaults.msg.range,
                scope: this
            });
        } else if (isInputText(this.dom[0])) {
            this.sequence.push({
                fn: function() {
                    if ((isDate(min) && isDate(max))) {
                        var v = new Date(this.dom[0].value.replace('-','/'));
                        return v.getTime() >= min.getTime() && v.getTime() <= max.getTime();
                    } else if (_V.patterns.date.test(min) && _V.patterns.date.test(max)) {
                        return this.dom[0].value >= min && this.dom[0].value <= max;
                    } else if ((isNumber(min) && isNumber(max))) {
                        var v = parseFloat(this.dom[0].value);
                        return v >= min && v <= max;
                    } else return false;
                },
                args: arguments,
                fields: arguing({input: that.dom[0].value}, arguments),
                msg: msg || _V.defaults.msg.range,
                scope: this
            });
        } else throw new Error(tmpl('#{el}不支持range方法', {el: this.el}));
        return this;
    };

    //核心函数
    //逐步验证
    //@param [cb<String|Function>]
    //如果为<String>，则当且仅当@return == true时，输出cb
    //如果为<Function>，则无论与否，回调cb(<验证结果>, <验证状态>)
    //@return <Boolean> 验证通过|不通过
    _V.prototype.go = function(cb) {
        var idx = 0;
        var flag = false;
        flag = this.sequence.every(function(item, i) {
            var args = Array.prototype.slice.call(item.args);
            idx = i;
            var ret = item.fn.apply(item.scope, args);
            return ret instanceof _V ? ret = ret.go() : isBoolean(ret) ? ret : false;
        });
        //When failed to validate...
        if (!flag) {
            var curItem = this.sequence[idx];
            if (curItem.args.length > 0) {
                var msg = tmpl(curItem.msg, curItem.fields);
                _V.msg.fail(this.dom[0], tmpl(curItem.msg, curItem.fields));
                this.status = {passed: false, msg: msg};
            }
        } else {
            if (arguments.length == 0) _V.msg.ok(this.dom[0], '');
            else {
                if (isString(cb)) {
                    var msg = tmpl(cb, {input: this.dom[0].value});
                    _V.msg.ok(this.dom[0], msg);
                }
            }
            this.status = {passed: true, msg: ''};
        }
        //Passed or failed
        if (isFunction(cb)) cb.call(this, this.status);
        return flag;
    };

    //对外暴露的接口
    //@return <V instance>
    function V(el) { return new _V(el); }

    //自定义匹配规则
    //@param pattern_name<String> 自定义规则名称，如果已存在，则覆盖
    //@param pattern_body<Pattern|Function> 自定义规则
    //如果pattern_body为函数，则函数需要返回Boolean值
    V.pattern = function(pattern_name, pattern_body) {
        if (arguments.length != 2 || !isString(pattern_name)) return;
        if (isPattern(pattern_body) || isFunction(pattern_body)) {
            _V.patterns[pattern_name] = pattern_body;
        } else return;
    }

    //顺序执行验证，不满足则中断
    //如果错误，返回第一个中断信息
    //@param <Array<V instance>|Mutiple V instances> 待验证的多个验证对象 
    //@return <Function> go(cb)
    //cb的回调参数为验证通过结果和第一个不通过验证的验证状态
    //只有当执行go()时，才依次执行验证过程
    V.serial = function() {
        var args = [];
        if (arguments.length == 0) return;
        if (isArray(arguments[0])) {
            args = arguments[0];
        } else args = Array.prototype.slice.call(arguments);
        return {
            go: function(cb) {
                var cur_v;
                var flag = args.every(function(v) {
                    return (cur_v = v).go();
                });
                isFunction(cb) && cb.call(null, flag, cur_v.status);
            }
        }
    };

    //并行执行验证，遇错继续执行
    //如果错误，返回所有中断信息(数组)
    //@param <Array<V instance>|Mutiple V instances> 待验证的多个验证对象 
    //@return <Function> go(cb)
    //cb的回调参数为验证通过结果和所有的错误验证状态
    //只有当执行go()时，才同时执行验证过程
    V.parallel = function() {
        var args = [];
        if (arguments.length == 0) return;
        if (isArray(arguments[0])) {
            args = arguments[0];
        } else args = Array.prototype.slice.call(arguments);
        return {
            go: function(cb) {
                var failed_vs_status = [];
                var vs = args.filter(function(v) {
                    return !v.go();
                });
                vs.forEach(function(item) {
                    failed_vs_status.push(item.status);
                })
                isFunction(cb) && cb.call(null, vs.length == 0, failed_vs_status);
            }
        }
    };

    var root = typeof exports !== "undefined" && exports !== null ? exports : window;
    root.V = V;
}());
