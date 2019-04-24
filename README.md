# validate
Client-Side Javascript Validation

## 特性
1. 支持ajax、settimeout等延时验证
2. 支持类input、select、checkbox控件的验证
3. 支持链式验证
4. 支持自定义验证规则
5. 支持顺序验证和同时验证

## 安装
下载并直接在页面引入脚本 validate.min.js</br>
```
<script src="dist/script/validate.min.js"></script>
```

如果需要使用更多扩展规则，可以引入 validate.patterns.min.js，此文件不是必须文件，这里面会不断收集更多的验证规则方便开发者使用。
  
## 使用
```
V('input')
    .notEmpty()
    .match('integer','请输入整数')
    .done(function(s) {
        console.log(s);
    });
        
V('input[name="num"]')
    .notEmpty('num不能为空')
    .match('integer','请输入整数')
    .range(-100, 200, '#{input}不在(#{$0}~#{$1})内')
    .done('ok');

var check = V('input[name="hobbies"]')
  .notEmpty()
  .range(1, 2, '已选择#{select}个（值为#{input}），请至少选择#{$0}个，最多选择#{$1}个');
check.done('ok');
```

当且仅当执行`done()`时才进行验证</br>
更多用例请见 index.html

