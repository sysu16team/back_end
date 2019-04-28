/**
 * 检查 type 参数项
 * 可能输入为 1,2,3,4 这种格式，或all
 * 将其转化为[Op.or]数组，或删除该项
 * 
 * @param query_params  JSON格式的查询字符串
 * @param which         检查的参数名称
 */
let checkParamsAndConvert  = (query_params, which) => {
    if (query_params[which].toLowerCase() == 'all') {
        // 直接删去就好，无需任何限制
        delete query_params[which]
    } else if (query_params[which].indexOf(',') != -1) {
        // 说明是输入数组形式，改成 Op.or
        let term = query_params[which]
        term = term.split(',').map(Number)
        query_params[which] = {
            [Op.or]: term
        }
    }
    return query_params
}

/**
 * Check whether a obj's attributes is undefined
 * @param {*} obj               The object
 * @param {Array} checklist     The param list waiting to be test
 * @return {Boolean}            A boolean          
 *  * `true`: if all attribute is not undefined
 *  * `false`: if some in the list is undefined
 */
let checkUndefined = (obj, checklist) => {
    let checkItem = (obj, item) => {
        return obj[item] != undefined;
    };
    if (checklist instanceof Array) {
        for (let i = 0; i < checklist.length; i++) {
            if (!checkItem(obj, checklist[i])) return false;
        }
        return true;
    } else {
        return checkItem(obj, checklist);
    }
}

let response = (ctx, result) => {
    if (Number.isInteger(result.code)) 
        ctx.response.status = result.code
    else
        ctx.response.status = 500
    if (!result.data) {
        result.data = []
    }
    if (result.code == 200) {
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }
    } else {
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }
    }
    return ctx;
}

module.exports = {
    checkParamsAndConvert: checkParamsAndConvert,
    checkUndefined: checkUndefined
}