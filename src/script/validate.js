/*
 * Validate.js v0.2
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
    //@param scope<Object> 上下文对象
    //主要用于解决该项目中无法获取实时的控件value，因此利用函数来workround，
    //因此需要在需要具体的控件value时，需要将函数执行来获得value。
    //这种情况目前只出现在给定的input和select控件上。
    //@return <String> 编译后的模板结果                                                                                                                         
    function tmpl(str, data, scope) {
        var that = scope || this;
        if (!str) return;
        str = str.replace(/#{([^}]*)}/g, function(val, replacement) {
            if (replacement == 'input' || replacement == 'select') {
                var fn = (eval('data.' + replacement));
                if (isFunction(fn)) return fn.call(that);
            } 
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
        // 验证队列
        // 每次添加一个验证规则，都会加入到此队列中
        this.sequence = [];
        // 用于记录实时的验证状态
        this.status = {passed: false, msg: '', dom: this.dom};
        return this;
    }

    //内置常见匹配规则
    _V.patterns = {
        //不为空
        '!empty': /\S/,

        /********************数学******************/

        //整数
        'integer': /^-?\d+$/,
        //浮点数
        'float': /^(-?\\d+)(\\.\\d+)?$/,
        //偶数
        'even': function(v) { return v % 2 == 0; },
        //奇数
        'odd': function(v) { return v % 2 != 0; },

        /*******************字符串******************/

        //用户名命名 以$_\d\w开头的非空格字符
        'simple-name': /^[$_\d\w]\S*$/,
        //英文单词, 中间可以保留'-'
        'word': /^[a-zA-Z]+(-[a-zA-Z]+)*$/,

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
            'range': '不在规定范围(#{$0}, #{$1})内',
            'equals': '不相等',
            'contains': '不包含指定字符(串): #{$0}',
            'defer': 'pending...',
            'ok': 'ok'
        }
    };

    //用于输出验证状态
    //前提条件：需要在被测对象同级插入class="msg"的dom
    //状态包含ok/fail，因此页面样式最好不要再另外定义ok/fail样式，
    //以避免冲突
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
    //@param [msg<String>] 不满足该规则时的输出信息, 
    //没有提供默认提示信息, 该信息会覆盖内嵌信息，不写，则保留内嵌信息
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
                    try {
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
                    } catch(e) {
                        throw new Error(tmpl('验证规则#{p}不存在', {p: pattern}));
                    }
                },
                args: arguments,
                // input值采用函数的方式，是为了解决无法获取最新的value，
                // 当需要具体的input值时，再执行该函数获取最新值
                fields: arguing({input: function() {return this.dom[0].value}}, arguments),
                msg: msg,
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
                return full ? this.dom[0].value === chars : this.dom[0].value.indexOf(chars) != -1;
            },
            args: arguments,
            fields: arguing({input: function() {return this.dom[0].value}}, arguments),
            msg: msg || _V.defaults.msg.contains,
            scope: this
        });
        return this;
    };

    //判断是否相等
    //_V.prototype.contains的简写，默认isFull=true
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
                    var len = [].filter.call(that.dom, function(d) {
                        return d.checked;
                    }).length;
                    return len >= min && len <= max;
                },
                args: arguments,
                fields: arguing({
                    select: function() {
                        return [].filter.call(that.dom, function(d) {
                            return d.checked;
                        }).length;
                    }, 
                    input: function() {
                        var v = [];
                        [].forEach.call(that.dom, function(d) {
                            if (d.checked) v.push(d.value);
                        });
                        return v.join(',');
                    }
                }, arguments),
                msg: msg || _V.defaults.msg.range,
                scope: this
            });
        } else if (isSelect(this.dom[0])) {
            this.sequence.push({
                fn: function() {
                    var len = [].filter.call(that.dom[0].querySelectorAll('option'), function(o) {
                        return o.selected;
                    }).length;
                    return len >= min && len <= max;
                },
                args: arguments,
                fields: arguing({
                    select: function() {
                        return [].filter.call(that.dom[0].querySelectorAll('option'), function(o) {
                            return o.selected;
                        }).length;
                    }, 
                    input: function() {
                        var v = [];
                        [].forEach.call(that.dom[0].querySelectorAll('option'), function(o) {
                            if (o.selected) v.push(o.value);
                        });
                        return v.join(',');
                    }
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
                fields: arguing({input: function() {return that.dom[0].value}}, arguments),
                msg: msg || _V.defaults.msg.range,
                scope: this
            });
        } else throw new Error(tmpl('#{el}不支持range方法', {el: this.el}));
        return this;
    };

    //延时验证
    //包括ajax、setTimeout等方法
    //@param cb<Function> 验证逻辑
    //@param [msg<String>] 不满足该规则时的输出信息
    _V.prototype.defer = function(cb, msg) {
        if (!isFunction(cb)) throw new Error('defer仅支持函数参数');
        this.sequence.push({
            fn: function() {
                var that = this;
                return new Promise(function(resolve, reject) {
                    cb.call(that, that.dom[0].value, resolve, reject);
                });
            },
            args: arguments,
            fields: arguing({input: function() {this.dom[0].value}}, arguments),
            msg: msg || _V.defaults.msg.defer,
            scope: this
        });
        return this;
    };

    //核心函数
    //逐步验证
    //@param [cb<String|Function>]
    //如果为<String>，则当且仅当@return == true时，输出cb
    //如果为<Function>，则无论与否，回调cb(<验证结果>, <验证状态>)
    //@return <Boolean> 验证通过|不通过
    _V.prototype.go = function(cb) {
        var that = this;
        var iterator = this.sequence[Symbol.iterator]();
        var item;
        var ret = true;
        var callee;
        (function run() {
            callee = arguments.callee;
            if (ret == true && (item = iterator.next()) && !item.done) {
                var args = Array.prototype.slice.call(item.value.args);
                ret = item.value.fn.apply(item.value.scope, args);
                _V.msg.ok(that.dom[0], _V.defaults.msg.defer);
                if (ret instanceof Promise) {
                    ret.then(function() {
                        ret = true;
                        _V.msg.ok(that.dom[0], _V.defaults.msg.ok);
                        callee.call(that);
                    }, function() {
                        if (item.value.args.length > 0) {
                            var msg = tmpl(item.value.msg, item.value.fields, that);
                            _V.msg.fail(that.dom[0], msg);
                            that.status = {passed: false, msg: msg, dom: that.dom};
                        }
                        ret = false;
                        if (isFunction(cb)) cb.call(that, that.status);
                    });
                } else {
                    ret instanceof _V ? ret = ret.go() : isBoolean(ret) ? ret : false;
                    if (!ret) {
                        if (item.value.args.length > 0) {
                            var msg = tmpl(item.value.msg, item.value.fields, that);
                            _V.msg.fail(that.dom[0], msg);
                            that.status = {passed: false, msg: msg, dom: that.dom};
                        }
                        if (isFunction(cb)) cb.call(that, that.status);
                    } else {
                        _V.msg.ok(that.dom[0], _V.defaults.msg.ok);
                        callee.call(that);
                    }
                }
            } else if (item.done) {
                that.status = {passed: true, msg: _V.defaults.msg.ok};
                if (typeof cb == 'undefined') _V.msg.ok(that.dom[0], that.status.msg);
                else {
                    if (isString(cb)) {
                        var msg = tmpl(cb, {input: that.dom[0].value});
                        _V.msg.ok(that.dom[0], msg);
                    } else {
                        if (isFunction(cb)) {
                            cb.call(that, that.status);
                        }
                    }
                }
            }
        }());
        return item.done;
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
            if (!_V.patterns[pattern_name]) _V.patterns[pattern_name] = pattern_body;
        }
        return;
    }

    //顺序执行验证，不满足则中断，始终从第一个开始验证
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
                var v, callee;
                var iterator = args[Symbol.iterator]();
                (function() {
                    callee = arguments.callee;
                    if ((v = iterator.next()) && !v.done) {
                        var p = new Promise(function(resolve, reject) {
                            v.value.go(function(ret) {
                                ret.passed ? resolve(ret) : reject(ret);
                            });
                        });
                        p.then(function(ret) {
                            callee.call();
                        }, function(ret) {
                            isFunction(cb) && cb.call(null, v.done, v.value.status);
                        });
                    } else if (v.done) {
                        isFunction(cb)
                            && cb.call(
                                null, 
                                v.done, 
                                {
                                    passed: v.done, 
                                    msg: _V.defaults.msg.ok
                                }
                            );
                    }
                }());
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
                var toTest = [];
                args.forEach(function(item) {
                    toTest.push((function(v) {
                        return new Promise(function(resolve, reject) {
                            v.go(function(ret) { resolve(ret); });
                        });
                    }(item)));
                })
                Promise
                    .all(toTest)
                    .then(function(ret) {
                        var not_passed_vs = ret.filter(function(v) {
                            return !v.passed;
                        });
                        if (not_passed_vs.length == 0) isFunction(cb) && cb.call(null, true, []);
                        else isFunction(cb) && cb.call(null, false, not_passed_vs);
                    })
            }
        }
    };

    var root = typeof exports !== "undefined" && exports !== null ? exports : window;
    root.V = V;
}());
