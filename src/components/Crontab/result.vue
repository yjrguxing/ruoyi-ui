<template>
	<div class="popup-result">
		<p class="title">直近5回の実行日時</p>
		<ul class="popup-result-scroll">
			<template v-if='isShow'>
				<li v-for='item in resultList' :key="item">{{item}}</li>
			</template>
			<li v-else>計算結果...</li>
		</ul>
	</div>
</template>

<script setup>
const props = defineProps({
    ex: {
        type: String,
        default: ''
    }
})
const dayRule = ref('')
const dayRuleSup = ref('')
const dateArr = ref([])
const resultList = ref([])
const isShow = ref(false)
watch(() => props.ex, () => expressionChange())
// 式値が変化すると、結果の計算を開始します
function expressionChange() {
    // 計算開始-結果の非表示
    isShow.value = false;
    // 規則配列[0秒、1分、2時、3日、4月、5週、6年]
    let ruleArr = props.ex.split(' ');
    // ループに入った回数を記録する
    let nums = 0;
    // 記号日を一時保存するためのルール結果の配列
    let resultArr = [];
    // 現在の日時は[年、月、日、時、分、秒]まで正確です。
    let nTime = new Date();
    let nYear = nTime.getFullYear();
    let nMonth = nTime.getMonth() + 1;
    let nDay = nTime.getDate();
    let nHour = nTime.getHours();
    let nMin = nTime.getMinutes();
    let nSecond = nTime.getSeconds();
    // ルールによってはここ100年まで年配列、月配列などが可能
    getSecondArr(ruleArr[0]);
    getMinArr(ruleArr[1]);
    getHourArr(ruleArr[2]);
    getDayArr(ruleArr[3]);
    getMonthArr(ruleArr[4]);
    getWeekArr(ruleArr[5]);
    getYearArr(ruleArr[6], nYear);
    // 配列設定
    let sDate = dateArr.value[0];
    let mDate = dateArr.value[1];
    let hDate = dateArr.value[2];
    let DDate = dateArr.value[3];
    let MDate = dateArr.value[4];
    let YDate = dateArr.value[5];
    // 現在の日の配列内のインデックス
    let sIdx = getIndex(sDate, nSecond);
    let mIdx = getIndex(mDate, nMin);
    let hIdx = getIndex(hDate, nHour);
    let DIdx = getIndex(DDate, nDay);
    let MIdx = getIndex(MDate, nMonth);
    let YIdx = getIndex(YDate, nYear);
    // リセット月日時分秒の関数
    const resetSecond = function () {
        sIdx = 0;
        nSecond = sDate[sIdx]
    }
    const resetMin = function () {
        mIdx = 0;
        nMin = mDate[mIdx]
        resetSecond();
    }
    const resetHour = function () {
        hIdx = 0;
        nHour = hDate[hIdx]
        resetMin();
    }
    const resetDay = function () {
        DIdx = 0;
        nDay = DDate[DIdx]
        resetHour();
    }
    const resetMonth = function () {
        MIdx = 0;
        nMonth = MDate[MIdx]
        resetDay();
    }
    // 現在の年が配列の現在値でない場合
    if (nYear !== YDate[YIdx]) {
        resetMonth();
    }
    // 現在の月が配列の現在値でない場合
    if (nMonth !== MDate[MIdx]) {
        resetDay();
    }
    // 現在の「日」が配列の現在値でない場合
    if (nDay !== DDate[DIdx]) {
        resetHour();
    }
    // 現在の「時」が配列の現在値でない場合
    if (nHour !== hDate[hIdx]) {
        resetMin();
    }
    // 現在の「分」が配列の現在値でない場合
    if (nMin !== mDate[mIdx]) {
        resetSecond();
    }
    // 年配列
    goYear: for (let Yi = YIdx; Yi < YDate.length; Yi++) {
        let YY = YDate[Yi];
        // 最大値に到達した場合
        if (nMonth > MDate[MDate.length - 1]) {
            resetMonth();
            continue;
        }
        // 月配列
        goMonth: for (let Mi = MIdx; Mi < MDate.length; Mi++) {
            let MM = MDate[Mi];
            MM = MM < 10 ? '0' + MM : MM;
            // 最大値に到達した場合
            if (nDay > DDate[DDate.length - 1]) {
                resetDay();
                if (Mi === MDate.length - 1) {
                    resetMonth();
                    continue goYear;
                }
                continue;
            }
            // 日配列
            goDay: for (let Di = DIdx; Di < DDate.length; Di++) {
                let DD = DDate[Di];
                let thisDD = DD < 10 ? '0' + DD : DD;
                // 最大値に到達した場合
                if (nHour > hDate[hDate.length - 1]) {
                    resetHour();
                    if (Di === DDate.length - 1) {
                        resetDay();
                        if (Mi === MDate.length - 1) {
                            resetMonth();
                            continue goYear;
                        }
                        continue goMonth;
                    }
                    continue;
                }
                // 日付の正当性を判断しても、合法でなければ現在のループから飛び出す
                if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true && dayRule.value !== 'workDay' && dayRule.value !== 'lastWeek' && dayRule.value !== 'lastDay') {
                    resetDay();
                    continue goMonth;
                }
                // 日付規則に値がある場合
                if (dayRule.value === 'lastDay') {
                    // 合法日でない場合は、前の日付を合法日である月末の最終日に変更する必要があります
                    if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                        while (DD > 0 && checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD--;
                            thisDD = DD < 10 ? '0' + DD : DD;
                        }
                    }
                } else if (dayRule.value === 'workDay') {
                    // 2月30日の日付が入ってきた場合は通常の月末に調整する必要があります。
                    if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                        while (DD > 0 && checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD--;
                            thisDD = DD < 10 ? '0' + DD : DD;
                        }
                    }
                    // 条件に達した日付は曜日X
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'), 'week');
                    // 日曜日には
                    if (thisWeek === 1) {
                        // まず次の日を探して、月末かどうかを判断します
                        DD++;
                        thisDD = DD < 10 ? '0' + DD : DD;
                        // 次の日は合法的な日付ではないと判断
                        if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD -= 3;
                        }
                    } else if (thisWeek === 7) {
                        // 土曜日は1日ではないと判断するだけで操作できます
                        if (dayRuleSup.value !== 1) {
                            DD--;
                        } else {
                            DD += 2;
                        }
                    }
                } else if (dayRule.value === 'weekDay') {
                    // 曜日を指定したら
                    // 現在の日付は曜日です
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'), 'week');
                    if (dayRuleSup.value.indexOf(thisWeek) < 0) {
                        // 最大値に到達した場合
                        if (Di === DDate.length - 1) {
                            resetDay();
                            if (Mi === MDate.length - 1) {
                                resetMonth();
                                continue goYear;
                            }
                            continue goMonth;
                        }
                        continue;
                    }
                } else if (dayRule.value === 'assWeek') {
                    // 何週目の曜日を指定したら
                    // 毎月1日は何曜日ですか
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'), 'week');
                    if (dayRuleSup.value[1] >= thisWeek) {
                        DD = (dayRuleSup.value[0] - 1) * 7 + dayRuleSup.value[1] - thisWeek + 1;
                    } else {
                        DD = dayRuleSup.value[0] * 7 + dayRuleSup.value[1] - thisWeek + 1;
                    }
                } else if (dayRule.value === 'lastWeek') {
                    // 月の最終週数を指定した場合
                    // 2月30日の日付が入ってきた場合は通常の月末に調整する必要があります。
                    if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                        while (DD > 0 && checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD--;
                            thisDD = DD < 10 ? '0' + DD : DD;
                        }
                    }
                    // 月末最終日は何曜日ですか
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'), 'week');
                    // 要求の中で最も近い曜日を見つける
                    if (dayRuleSup.value < thisWeek) {
                        DD -= thisWeek - dayRuleSup.value;
                    } else if (dayRuleSup.value > thisWeek) {
                        DD -= 7 - (dayRuleSup.value - thisWeek)
                    }
                }
                // 日の値が10未満かどうかを判断して「05」というフォーマットに置き換える
                DD = DD < 10 ? '0' + DD : DD;
                // 時配列繰越
                goHour: for (let hi = hIdx; hi < hDate.length; hi++) {
                    let hh = hDate[hi] < 10 ? '0' + hDate[hi] : hDate[hi]
                    // 最大値に到達した場合
                    if (nMin > mDate[mDate.length - 1]) {
                        resetMin();
                        if (hi === hDate.length - 1) {
                            resetHour();
                            if (Di === DDate.length - 1) {
                                resetDay();
                                if (Mi === MDate.length - 1) {
                                    resetMonth();
                                    continue goYear;
                                }
                                continue goMonth;
                            }
                            continue goDay;
                        }
                        continue;
                    }
                    // "分"配列
                    goMin: for (let mi = mIdx; mi < mDate.length; mi++) {
                        let mm = mDate[mi] < 10 ? '0' + mDate[mi] : mDate[mi];
                        // 最大値に到達した場合
                        if (nSecond > sDate[sDate.length - 1]) {
                            resetSecond();
                            if (mi === mDate.length - 1) {
                                resetMin();
                                if (hi === hDate.length - 1) {
                                    resetHour();
                                    if (Di === DDate.length - 1) {
                                        resetDay();
                                        if (Mi === MDate.length - 1) {
                                            resetMonth();
                                            continue goYear;
                                        }
                                        continue goMonth;
                                    }
                                    continue goDay;
                                }
                                continue goHour;
                            }
                            continue;
                        }
                        // "秒"配列
                        goSecond: for (let si = sIdx; si <= sDate.length - 1; si++) {
                            let ss = sDate[si] < 10 ? '0' + sDate[si] : sDate[si];
                            // 現在の日時を追加（日時正当性は日付循環時に判断済み）
                            if (MM !== '00' && DD !== '00') {
                                resultArr.push(YY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss)
                                nums++;
                            }
                            // 件数がいっぱいになったらループを抜ける
                            if (nums === 5) break goYear;
                            // 最大値に到達した場合
                            if (si === sDate.length - 1) {
                                resetSecond();
                                if (mi === mDate.length - 1) {
                                    resetMin();
                                    if (hi === hDate.length - 1) {
                                        resetHour();
                                        if (Di === DDate.length - 1) {
                                            resetDay();
                                            if (Mi === MDate.length - 1) {
                                                resetMonth();
                                                continue goYear;
                                            }
                                            continue goMonth;
                                        }
                                        continue goDay;
                                    }
                                    continue goHour;
                                }
                                continue goMin;
                            }
                        } //goSecond
                    } //goMin
                }//goHour
            }//goDay
        }//goMonth
    }
    // 判断100年以内の結果件数
    if (resultArr.length === 0) {
        resultList.value = ['条件に達していないの結果！'];
    } else {
        resultList.value = resultArr;
        if (resultArr.length !== 5) {
            resultList.value.push('ここ100年で上だけ' + resultArr.length + '条結果！')
        }
    }
    // 結果の表示
    isShow.value = true;
}
// 配列内のビット数の計算に使用の索引
function getIndex(arr, value) {
    if (value <= arr[0] || value > arr[arr.length - 1]) {
        return 0;
    } else {
        for (let i = 0; i < arr.length - 1; i++) {
            if (value > arr[i] && value <= arr[i + 1]) {
                return i + 1;
            }
        }
    }
}
// "年"配列
function getYearArr(rule, year) {
    dateArr.value[5] = getOrderArr(year, year + 100);
    if (rule !== undefined) {
        if (rule.indexOf('-') >= 0) {
            dateArr.value[5] = getCycleArr(rule, year + 100, false)
        } else if (rule.indexOf('/') >= 0) {
            dateArr.value[5] = getAverageArr(rule, year + 100)
        } else if (rule !== '*') {
            dateArr.value[5] = getAssignArr(rule)
        }
    }
}
// "月"配列
function getMonthArr(rule) {
    dateArr.value[4] = getOrderArr(1, 12);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[4] = getCycleArr(rule, 12, false)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[4] = getAverageArr(rule, 12)
    } else if (rule !== '*') {
        dateArr.value[4] = getAssignArr(rule)
    }
}
// "日"配列
function getWeekArr(rule) {
    if (dayRule.value === '' && dayRuleSup.value === '') {
        if (rule.indexOf('-') >= 0) {
            dayRule.value = 'weekDay';
            dayRuleSup.value = getCycleArr(rule, 7, false)
        } else if (rule.indexOf('#') >= 0) {
            dayRule.value = 'assWeek';
            let matchRule = rule.match(/[0-9]{1}/g);
            dayRuleSup.value = [Number(matchRule[1]), Number(matchRule[0])];
            dateArr.value[3] = [1];
            if (dayRuleSup.value[1] === 7) {
                dayRuleSup.value[1] = 0;
            }
        } else if (rule.indexOf('L') >= 0) {
            dayRule.value = 'lastWeek';
            dayRuleSup.value = Number(rule.match(/[0-9]{1,2}/g)[0]);
            dateArr.value[3] = [31];
            if (dayRuleSup.value === 7) {
                dayRuleSup.value = 0;
            }
        } else if (rule !== '*' && rule !== '?') {
            dayRule.value = 'weekDay';
            dayRuleSup.value = getAssignArr(rule)
        }
    }
}
// "日"配列
function getDayArr(rule) {
    dateArr.value[3] = getOrderArr(1, 31);
    dayRule.value = '';
    dayRuleSup.value = '';
    if (rule.indexOf('-') >= 0) {
        dateArr.value[3] = getCycleArr(rule, 31, false)
        dayRuleSup.value = 'null';
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[3] = getAverageArr(rule, 31)
        dayRuleSup.value = 'null';
    } else if (rule.indexOf('W') >= 0) {
        dayRule.value = 'workDay';
        dayRuleSup.value = Number(rule.match(/[0-9]{1,2}/g)[0]);
        dateArr.value[3] = [dayRuleSup.value];
    } else if (rule.indexOf('L') >= 0) {
        dayRule.value = 'lastDay';
        dayRuleSup.value = 'null';
        dateArr.value[3] = [31];
    } else if (rule !== '*' && rule !== '?') {
        dateArr.value[3] = getAssignArr(rule)
        dayRuleSup.value = 'null';
    } else if (rule === '*') {
        dayRuleSup.value = 'null';
    }
}
// "时"配列
function getHourArr(rule) {
    dateArr.value[2] = getOrderArr(0, 23);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[2] = getCycleArr(rule, 24, true)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[2] = getAverageArr(rule, 23)
    } else if (rule !== '*') {
        dateArr.value[2] = getAssignArr(rule)
    }
}
// "分"配列
function getMinArr(rule) {
    dateArr.value[1] = getOrderArr(0, 59);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[1] = getCycleArr(rule, 60, true)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[1] = getAverageArr(rule, 59)
    } else if (rule !== '*') {
        dateArr.value[1] = getAssignArr(rule)
    }
}
// "秒"配列
function getSecondArr(rule) {
    dateArr.value[0] = getOrderArr(0, 59);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[0] = getCycleArr(rule, 60, true)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[0] = getAverageArr(rule, 59)
    } else if (rule !== '*') {
        dateArr.value[0] = getAssignArr(rule)
    }
}
// 渡されたmin-maxに基づいて1つの順序の配列を返す
function getOrderArr(min, max) {
    let arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
}
// 規則で指定された分散値に基づいて配列を戻す
function getAssignArr(rule) {
    let arr = [];
    let assiginArr = rule.split(',');
    for (let i = 0; i < assiginArr.length; i++) {
        arr[i] = Number(assiginArr[i])
    }
    arr.sort(compare)
    return arr;
}
// 一定の算術規則計算に基づいて配列を戻す
function getAverageArr(rule, limit) {
    let arr = [];
    let agArr = rule.split('/');
    let min = Number(agArr[0]);
    let step = Number(agArr[1]);
    while (min <= limit) {
        arr.push(min);
        min += step;
    }
    return arr;
}
// 規則に基づいて周期的な配列を戻す
function getCycleArr(rule, limit, status) {
    // status--ティーブル表示は0から開始するか（では1から開始する）
    let arr = [];
    let cycleArr = rule.split('-');
    let min = Number(cycleArr[0]);
    let max = Number(cycleArr[1]);
    if (min > max) {
        max += limit;
    }
    for (let i = min; i <= max; i++) {
        let add = 0;
        if (status === false && i % limit === 0) {
            add = limit;
        }
        arr.push(Math.round(i % limit + add))
    }
    arr.sort(compare)
    return arr;
}
// 数値サイズの比較（Array.sort用）
function compare(value1, value2) {
    if (value2 - value1 > 0) {
        return -1;
    } else {
        return 1;
    }
}
// 書式設定日の書式設定：2017-9-19 18:04:33
function formatDate(value, type) {
    // 計算日に関する値
    let time = typeof value == 'number' ? new Date(value) : value;
    let Y = time.getFullYear();
    let M = time.getMonth() + 1;
    let D = time.getDate();
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    let week = time.getDay();
    // typeを渡されたら
    if (type === undefined) {
        return Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    } else if (type === 'week') {
        // quartzでは1は日曜日
        return week + 1;
    }
}
// 日付が存在するかどうかを調べる
function checkDate(value) {
    let time = new Date(value);
    let format = formatDate(time)
    return value === format;
}
onMounted(() => {
    expressionChange()
})
</script>