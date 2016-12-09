var inspectBtn = document.querySelector('.run');
inspectBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var n = document.querySelector('.testcases').value;
    eval('runCase'+n+'()');
}, false);

function runCase1() {
    /*
    V('.testcase1 input[name="num"]')
        .match(function() {
    //return V(A,B).or();
            return V('input[name="age"]').notEmpty('Age must not be empty.');
    //return document.querySelector('#option-person').checked;
        }, 'Person required.')
        .notEmpty('Num must not be empty.')
        .match('integer', '#{input} must be number.')
        .match('even', '#{input} must be even.')
        .range(0, 100, '#{input} must be between #{$0} and #{$1}.')
        .go(function(flag) {
            if (!flag) this.dom.classList.add('error');
            else this.dom.classList.remove('error');
        });
        */

    
    //V('.testcase1 input[name="num1"]')
        //.notEmpty('Name must not be empty.')
        //.contains('test')
        //.go('ok');
        

    /*
    V('.testcase1 input[name="name"]')
        .notEmpty('Name must not be empty.')
        .match('word', 'Name must be a legal word.')
        .go('ok');
        */

    /*
    var rangeFn = function(v) {
        return parseFloat(v) < 10 ? true : false;
    }
    V('.testcase1 input[name="num"]')
        .match(['!empty', /^\d+$/g, 'odd', rangeFn], 'You input: #{input}\n\t #{$0} is not satisfied.')
        .go('ok');
        */

    V('.testcase1 input[name="num"]')
        .match(function() {
            //return document.querySelector('#option').checked;
            return V('#option').notEmpty()
        }, 'Option required.')
        //这样编码更容易定义递进规则
        .match(['!empty', 'positive-integer', 'odd'], '请输入奇数')
        .go('ok');
}
function runCase2() {
    V('.testcase2 input[name="p2"]')
        .match(function() {
            return V('.testcase2 input[name="p1"]')
                .notEmpty('P1密码不能为空')
                .match(/^\w{6,20}$/g, 'P1密码不符合要求');
        })
        .notEmpty('P2密码不能为空')
        .equals(document.querySelector('input[name="p1"]').value, '密码不一致')
        .go('ok');
}
function runCase3() {
    V('.testcase3 input[name="date"]')
        .notEmpty('date不能为空')
        .range(Date('2010-02-03'), Date(), '#{input}不在(#{$0}~#{$1})内')
        .go('ok');
    /*
    V('input[name="date"]')
        .notEmpty('date不能为空')
        .match('date', '日期格式yyyy-mm-dd')
        .range('2010-02-03', '2016-02-03', '不在(#{$0}~#{$1})内')
        .go('ok');
        */
}
function runCase4() {
    V('.testcase4 input[name="num"]')
        .notEmpty('num不能为空')
        .match('integer')
        .range(-100, 200, '#{input}不在(#{$0}~#{$1})内')
        .go('ok');
}
function runCase5() {
    V('.testcase5 input[name="hobbies"]')
        .notEmpty()
        .range(1, 2, '已选择#{select}个（值为#{input}），请至少选择#{$0}个，最多选择#{$1}个')
        .go('ok');
}
function runCase6() {
    V('.testcase6 select')
        .notEmpty()
        .range(1, 2, '已选择#{select}个（值为#{input}），请至少选择#{$0}个，最多选择#{$1}个')
        .go('ok');
}
function runCase7() {
    V.pattern('is-zh', /[\u4E00-\u9FA5\uF900-\uFA2D]/);
    V('.testcase7 input').match('is-zh', '请输入包含中文的字符串').go('ok');
}
function runCase8() {
    V('.testcase8 input')
        .notEmpty('请输入正整数')
        .match('integer')
        .go(function(s) {
            console.log(s);
        });
}
function runCase9() {
    var a = V('.testcase9 input[name="num"]').match(['!empty', 'integer']).range(30, 200);
    var b = V('.testcase9 input[name="hobbies"]').notEmpty().range(1, 2);
    var c = V('.testcase9 input[name="name"]').match('has-zh', '请输入包含中文的字符串')
    /*V.serial(a, b, c).go(function(flag, status) {
        console.log(flag, status);
    });*/
    V.parallel([a, b, c]).go(function(flag, vs) {
        console.log(flag, vs);
    });
}
function runCase10() {
    V('.testcase10 input[name="hobbies"]').notEmpty().go();
}
