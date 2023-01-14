const a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const b = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// 计算某年某月有几天
const getDays = (y, m) => {
	if (m == 0) {
		--y
		m = 12
	}
	if (m == 13) {
		++y
		m = 1
	}
	if (y % 4 == 0 && y % 100 != 0 || y % 400 == 0)
		return b[m]
	else
		return a[m]
}

// 计算某年某月某日是星期几
const getWeek = (y, m, d) => {
	if(m<3){
		m+=12
		--y
	}
	const c = parseInt(y / 100),
		p = y % 100
	const ans = (parseInt(c / 4) - 2 * c + p + parseInt(p / 4) + parseInt(13 * (m + 1) / 5) + d - 1)
	return (ans%7+7)%7
}

export default {
	getDays,
	getWeek
}
