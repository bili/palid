# Palid
Client-Side Javascript Validation

# Demo
更多实例可以参考[demo](https://codesandbox.io/embed/lr173y6nom?fontsize=14)，也可以直接双击运行页面`docs/index.html`查看效果。

## 特性
1. 支持ajax、settimeout等延时验证
2. 支持类input、select、checkbox控件的验证
3. 支持链式验证，支持控制路径上的每一个验证节点/状态
4. 支持自定义验证规则
5. 支持顺序验证和同时验证

## 安装
```
npm install palid
```

## 使用
```
import V from 'palid'

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

另外，还要在控件的同层插入一个class="msg"的dom，用于显示验证结果信息。
```
<input id="age" type="text">
<span class="msg"></span>
```
还可以对显示效果个性化设置
```
.msg.fail {
    color: #f44336;
}
.msg.ok {
    color: #4CAF50;
}
```

