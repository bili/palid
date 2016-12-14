# validate
Client-Side Javascript Validation

### 安装
直接在页面引入脚本 validate.min.js</br>
如果需要使用更多扩展规则，可以引入 validate.patterns.js，此文件不是必须文件，这里面会不断收集更多的验证规则方便开发者使用。
  
### 使用
```
V('input')
    .notEmpty()
    .match('integer','请输入整数')
    .go(function(s) {
        console.log(s);
    });
        
V('input[name="num"]')
    .notEmpty('num不能为空')
    .match('integer','请输入整数')
    .range(-100, 200, '#{input}不在(#{$0}~#{$1})内')
    .go('ok');

var check = V('input[name="hobbies"]')
  .notEmpty()
  .range(1, 2, '已选择#{select}个（值为#{input}），请至少选择#{$0}个，最多选择#{$1}个');
check.go('ok');
```

当且仅当执行`go()`时才进行验证</br>
更多用例请见 index.html

### 更新
##### v0.2 2016-12-13
1. 支持ajax、settimeout等延时验证
2. 只保留最基本的验证规则，扩展的验证规则都移到 static/js/patterns.js

##### v0.1 2016-12-09
1. 支持类input、select、checkbox控件的验证
2. 支持链式验证
3. 支持自定义验证规则
4. 支持顺序验证和同时验证
