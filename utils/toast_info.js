const util = require('util');
let toast_info = {
    t0: (p1, p2) => util.format('%s申请加入小组%s', p1, p2),
    t1: (p1) => util.format('你已进入小组%s', p1),
    t2: (p1) => util.format('你被踢出小组%s', p1),
    t3: (p1) => util.format('你加入的小组%s被组长解散', p1),
    t4: (p1) => util.format('你被设为小组%s组长', p1),
    t5: (p1, p2) => util.format('%s退出小组%s', p1, p2),
    t6: (p1) => util.format('你申请加入小组%s被拒绝', p1),
    t7: (p1, p2) => util.format('%s申请加入小组%s', p1, p2),

    t10: (p1, p2) => util.format('你发布的任务%s被%s接受', p1, p2),
    t11: (p1, p2) => util.format('你发布的任务%s被%s完成', p1, p2),
    t12: (p1, p2) => util.format('你发布的任务%s被%s取消接受', p1, p2),
    t13: (p1, p2) => util.format('你完成的任务%s被%s确认', p1, p2)
};

module.exports = toast_info;