/**
 * Created by crazytster on 04.04.17.
 */
var yAxis = {
    title: {
        text: 'Литры (л)'
    },
    min: 0
};
var series = [
    {
        name: 'Холодная вода',
        color: '#7cb5ec',
        data: []
    }, {
        name: 'Горячая вода',
        color: '#f45b5b',
        data: []
    }
];

function setChartGlobalParams()
{
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
}

function currentDayChart()
{
    cd_chart = Highcharts.chart('current_day', {
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
        },
        series: series
    });
}

function currentMonthChart()
{
    var options = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Потребление холодной и горячей воды за месяц'
        },
        subtitle: {
            text: '(разбивка по дням)'
        },
        legend: {
            labelFormatter: function() {
                var total = 0;
                for(var i=this.yData.length; i--;) { total += this.yData[i]; };
                return this.name + ' - Всего: ' + total;
            }
        },
        xAxis: {
            title: {
                text: 'Число'
            },
            categories: [],
            crosshair: {
                enabled: true,
                events: {
                    click: function (e) {
                        const category = cm_chart.options.xAxis[0].categories[cm_chart.columnIndex]
                        //window.alert(category)
                        cm_chart.series[0].data[cm_chart.columnIndex].color = "blue";
                        cm_chart.series[1].data[cm_chart.columnIndex].color = "red";
                        cm_chart.redraw();
                    }
                }
            }
        },
        yAxis: yAxis,
        tooltip: {
            formatter: function(tooltip) {
                var items = this.points || splat(this), s;
                cm_chart.columnIndex = cm_chart.options.xAxis[0].categories.indexOf(this.x)
                // Build the header
                s = [tooltip.tooltipFooterHeaderFormatter(items[0])];
                // build the values
                s = s.concat(tooltip.bodyFormatter(items));
                // footer
                s.push(tooltip.tooltipFooterHeaderFormatter(items[0], true));
                return s;
            },
            shared: true,
            useHTML: true
        },

        series: series,
    };
    cm_chart = Highcharts.chart('current_month', options);
}