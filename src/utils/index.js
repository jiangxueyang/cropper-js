/* 数据类型 */
export function getType(value) {
	return Object.prototype.toString.call(value).toLowerCase().slice(8, -1)
}

/* 是否为对象 */
export function isObject(value) {
	return getType(value) === 'object'
}
/* 是否为函数 */
export function isFunction(value) {
	return getType(value) === 'function'
}

/* 是否为空 */
export function isEmpty(value) {
	return value === null || value === '' || value === undefined
}

/* 是否为数值 */
export function isNumber(value) {
	return getType(value) === 'number' || /^\d+$/.test(value)
}

/* 打印报警，并返回false */
export function warn(tip) {
	console.error(tip)
	return false
}
/* 保留小数点位数 */
export function toFixed(num, decimal = 2) {
	return Number(num.toFixed(decimal))
}
