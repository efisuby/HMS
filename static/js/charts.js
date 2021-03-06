/**
 * Created by crazytster on 04.04.17.
 */
var cd_chart, cm_chart, last12Month_chart;
var yAxis = {
    title: {
        text: 'Литры (л)'
    },
    min: 0
};

function setChartGlobalParams()
{
    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        lang: {
            loading: 'Загрузка...',
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            shortMonths: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
            exportButtonTitle: "Экспорт",
            printButtonTitle: "Печать",
            rangeSelectorFrom: "С",
            rangeSelectorTo: "По",
            rangeSelectorZoom: "Период",
            downloadPNG: 'Скачать PNG',
            downloadJPEG: 'Скачать JPEG',
            downloadPDF: 'Скачать PDF',
            downloadSVG: 'Скачать SVG',
            printChart: 'Напечатать график'
        }
    });
}

function addSeries(chart)
{
    chart.addSeries({
        name: 'Холодная вода',
        color: '#7cb5ec',
        data: []
    }, false);
    chart.addSeries({
        name: 'Горячая вода',
        color: '#f45b5b',
        data: []
    }, false);
    chart.redraw();
}

function selectSeries(chart)
{
    chart.series[0].data.forEach(function(e){
        e.update({ color: '#7cb5ec' }, true, false);
    });
    chart.series[1].data.forEach(function(e){
        e.update({ color: '#f45b5b' }, true, false);
    });
    chart.series[0].data[chart.columnIndex].update({ color: 'blue' }, true, false);
    chart.series[1].data[chart.columnIndex].update({ color: 'red' }, true, false);
    chart.redraw();

    if (chart.name == 'cm_chart') {
        var day = days[chart.columnIndex];
        executeAjaxRequest({action: 'get', param: 'day', date: day}, function (result) {
            if (result['data']['current_day']['status'] = 'success') {
                updateChart(cd_chart, result['data']['current_day']);
            } else {
                $('.current_day').html(result['data']['current_day']['status'] + '<br>' + result['data']['current_day']['data']);
            }
        });
    }

    if (chart.name == 'last12Month_chart') {
        var month = months[chart.columnIndex];
        executeAjaxRequest({action: 'get', param: 'month', date: month}, function (result) {
            if (result['data']['current_month']['status'] = 'success') {
                days = result['data']['current_month']['data']['ts'][1];
                updateChart(cm_chart, result['data']['current_month']);
            } else {
                $('.current_month').html(result['data']['current_month']['status'] + '<br>' + result['data']['current_month']['data']);
            }
        });
    }
}

function updateChart(chart, data, selectSeries)
{
    if (data['status'] == 'success') {
        selectSeries = selectSeries || false;
        if (chart.name == 'cm_chart') {
            chart.xAxis[0].setCategories(data['data']['ts'][0]);
            days = data['data']['ts'][1];
        }
        if (chart.name == 'last12Month_chart') {
            chart.xAxis[0].setCategories(data['data']['ts'][0]);
            months = data['data']['ts'][1];
        }
        if (chart.name == 'cd_chart') {
            chart.setTitle(null, {text: data['data']['date']});
        }
        chart.series[0].setData(data['data']['coldwater']);
        chart.series[1].setData(data['data']['hotwater']);
        if (selectSeries) {
            var col_count = data['data']['ts'][0].length - 1;
            chart.series[0].data[col_count].color = "blue";
            chart.series[1].data[col_count].color = "red";
        }
        chart.redraw();
        chart.legend.update();
    } else {
        $('.' + chart.name).html(data['status'] + '<br>' + data['data']);
    }

}

function tooltipFormatter(obj, chart, tooltip)
{
    var items = obj.points || splat(obj), s;
    chart.columnIndex = chart.options.xAxis[0].categories.indexOf(obj.x);
    // Build the header
    s = [tooltip.tooltipFooterHeaderFormatter(items[0])];
    // build the values
    s = s.concat(tooltip.bodyFormatter(items));
    // footer
    s.push(tooltip.tooltipFooterHeaderFormatter(items[0], true));
    return s;
}

function currentDayChart()
{
    cd_chart = Highcharts.chart('cd_chart', {
        chart: {
            type: 'spline',
            zoomType: 'x'
        },
        title: {
            text: 'Потребление холодной и горячей воды за день'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                hour: '%H:%M'
            },
            title: {
                text: 'Время (ЧЧ:ММ)'
            }
        },
        yAxis: yAxis,
        legend: {
            labelFormatter: function() {
                return this.name + ': ' + this.yData[this.yData.length - 1];
            }
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%H:%M:%S}: {point.y:2f} л'
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: true
                }
            }
        }
    });
    addSeries(cd_chart);
    cd_chart.name = 'cd_chart';
}

function currentMonthChart()
{
    cm_chart = Highcharts.chart('cm_chart', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Потребление холодной и горячей воды за месяц'
        },
        subtitle: {
            text: '(разбивка по дням)'
        },
        xAxis: {
            title: {
                text: 'Число'
            },
            categories: [],
            crosshair: {
                enabled: true,
                events: {click: function() {selectSeries(cm_chart);}}
            }
        },
        yAxis: yAxis,
        legend: {
            labelFormatter: function() {
                var total = 0;
                for(var i=this.yData.length; i--;) { total += this.yData[i]; };
                return this.name + ' - Всего: ' + total;
            }
        },
        tooltip: {
            //headerFormat: '<span style="font-size:14px"><b>{point.key}</b></span><table>',
            //pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:1f} л</b></td></tr>',
            //footerFormat: '</table>',
            shared: true,
            //useHTML: true,
            formatter: function(tooltip) {return tooltipFormatter(this, cm_chart, tooltip);}
        },
        plotOptions: {
            series: {
                events: {click: function() {selectSeries(cm_chart);}}
            }
        }
    });
    addSeries(cm_chart);
    cm_chart.name = 'cm_chart';
}

function last12MonthChart()
{
    last12Month_chart = Highcharts.chart('last12Month_chart', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Потребление холодной и горячей воды за последние 12 месяцев'
        },
        subtitle: {
            text: '(разбивка по месяцам)'
        },
        xAxis: {
            title: {
                text: 'Число'
            },
            categories: [],
            crosshair: {
                enabled: true,
                events: {click: function() {selectSeries(last12Month_chart);}}
            }
        },
        yAxis: yAxis,
        legend: {
            labelFormatter: function() {
                var total = 0;
                var length = this.yData.length;
                for(var i = 0; i < length; i++) {total += this.yData[i];}
                return '<b>' + this.name + ':</b>' + '<br>- Всего: ' + total + '<br>- Среднее за месяц: ' + (+(total/length).toFixed(2));
            }
        },
        tooltip: {
            //headerFormat: '<span style="font-size:14px"><b>{point.key}</b></span><table>',
            //pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:1f} л</b></td></tr>',
            //footerFormat: '</table>',
            shared: true,
            //useHTML: true,
            formatter: function(tooltip) {return tooltipFormatter(this, last12Month_chart, tooltip);}
        },
        plotOptions: {
            series: {
                events: {click: function() {selectSeries(last12Month_chart);}}
            }
        }
    });
    addSeries(last12Month_chart);
    last12Month_chart.name = 'last12Month_chart';
}