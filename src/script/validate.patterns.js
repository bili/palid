//整数
V.pattern('integer', /^-?\d+$/);
//浮点数
V.pattern('float', /^(-?\\d+)(\\.\\d+)?$/);
//偶数
V.pattern('even', function(v) { return v % 2 == 0; });
//奇数
V.pattern('odd', function(v) { return v % 2 != 0; });
//正整数 如：023
V.pattern('positive-integer', /^[0-9]*[1-9][0-9]*$/);
//负整数
V.pattern('negative-integer', /^-[0-9]*[1-9][0-9]*$/);
//非正整数(负整数+0)
V.pattern('not-positive-integer', /^((-\\d+)|(0+))$/);
//非负整数(正整数+0)
V.pattern('not-negative-integer', /^\d+$/);
//正浮点数
V.pattern('positive-float', /^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$/);
//负浮点数
V.pattern('negative-float', /^(-(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/);
//非正浮点数(负浮点数+0)
V.pattern('not-positive-float', /^((-\\d+(\\.\\d+)?)|(0+(\\.0+)?))$/);
//非负浮点数(正浮点数+0)
V.pattern('not-negative-float', /^((-\\d+(\\.\\d+)?)|(0+(\\.0+)?))$/);
//是否包含中文（日文，韩文）
V.pattern('has-zh', /[\u4E00-\u9FA5\uF900-\uFA2D]/);
//是否含有全角符号
V.pattern('hasFullWidthChars', /[\uFF00-\uFFEF]/);
