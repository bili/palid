# validate
Client-Side Javascript Validation

### 安装
在页面直接引入脚本 validate.min.js

### 使用
`
    V('.testcase8 input')
        .notEmpty('请输入正整数')
        .match('integer')
        .go(function(s) {
            console.log(s);
        });
`
更多用例请见 index.html

### 更新
##### v0.2
1. 支持ajax、settimeout等延时验证
2. 只保留最基本的验证规则，扩展的验证规则都移到 static/js/patterns.js

##### v0.1
1. 支持类input、select、checkbox的验证
2. 支持链式验证
3. 支持自定义验证规则
4. 支持顺序验证和同时验证
