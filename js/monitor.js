var backendUrl = 'http://shidur.bbdomain.org/tm';
var updateInterval = 2500;

var cpuPlotOptions = {
	series: {
        shadowSize: 0 // drawing is faster without shadows
    },
	xaxis: {
        mode: 'time',
        timezone: 'browser'
    }
};

/**
 * The method get the list of transcoders from the server,
 * populate transcoders table and create cpu load and temperature plots
 */
function loadTranscoders() {
    $.ajax({
		type: 'GET',
		url: backendUrl + '/transcoders',
		dataType: 'json',
		success: function(responseData, textStatus, jqXHR) {
            $('#txcoders').empty().append('<tr><th>Id</th><th>Name</th><th>Address</th></tr>')
	   		$.each(responseData, function(i, item) {
				$('#txcoders')
				.append('<tr><td>' + item.id + '</td><td>' + item.name + '</td><td>'
                        + item.host + ':' + item.port + '</td><tr>');

               createCpuPlot(item);
               createTemperaturePlot(item);
			});
		},
		error: function (responseData, textStatus, errorThrown) {
		    alert('loadEvents failed: ' + errorThrown );
		}
	});
}

/**
 * Create CPU load plot for the given transcoder.
 * @param txcoder
 */
function createCpuPlot(txcoder) {
    $('#cpu-load-plots').append("<div id=\"cpu-plot-container-" + txcoder.id + "\"></div>");
    $('#cpu-plot-container-' + txcoder.id)
        .append("<h5>" + txcoder.name + "</h5>")
        .append("<div id='cpu-plot-" + txcoder.id + "' style='width:100%; height:200px;'></div>");

    var plotContainer = $('#cpu-plot-' + txcoder.id)
    plotContainer.data('plot', $.plot(plotContainer, [], cpuPlotOptions));
    setInterval("updateCpuData('" + txcoder.id + "')", updateInterval);
    updateCpuData(txcoder.id);
}

/**
 * Create CPU temperature plot for the given transcoder.
 * @param txcoder
 */
function createTemperaturePlot(txcoder) {
    $('#temperature-plots').append("<div id=\"temperature-plot-container-" + txcoder.id + "\"></div>");
    $('#temperature-plot-container-' + txcoder.id)
        .append("<h5>" + txcoder.name + "</h5>")
        .append("<div id='temperature-plot-" + txcoder.id + "' style='width:100%; height:200px;'></div>");

    var plotContainer = $('#temperature-plot-' + txcoder.id)
    plotContainer.data('plot', $.plot(plotContainer, [], cpuPlotOptions));
    setInterval("updateTemperatureData('" + txcoder.id + "')", updateInterval);
    updateTemperatureData(txcoder.id);
}

/**
 * Update CPU load data for transcoder with given id.
 * @param tx_id
 */
function updateCpuData(tx_id) {
  	$.ajax({
		type: 'GET',
		url: backendUrl + '/monitor/' + tx_id + '/cpu?period=' + monitorPeriod(),
		dataType: 'json',
		success: function (responseData, textStatus, jqXHR) {
			var plot = $('#cpu-plot-' + tx_id).data('plot');
			plot.setData([ convertTimeSeries(responseData) ]);
			plot.setupGrid();
			plot.draw();	
		}
	});
}

/**
 * Update CPU temperature data for transcoder with given id.
 * @param tx_id
 */
function updateTemperatureData(tx_id) {
  	$.ajax({
		type: 'GET',
		url: backendUrl + '/monitor/' + tx_id + '/temp?period=' + monitorPeriod(),
		dataType: 'json',
		success: function (responseData, textStatus, jqXHR) {
			var seriesData = [];
			$.each(responseData, function(i, item) {
				seriesData.push({label: 'core-' + i , data: convertTimeSeries(item)});
			});

			var plot = $('#temperature-plot-' + tx_id).data('plot');
			plot.setData(seriesData);
			plot.setupGrid();
			plot.draw();	
		}
	});
}

/**
 * Get monitor period the user selected.
 * @returns remote query api period parameter.
 */
function monitorPeriod() {
	return	$("#monitor-period").val();
}

/**
 * Convert the time series to JavaScript timestamps.
 *
 * The remote api return UNIX timestamps, i.e. seconds since the epoch.
 * We need to multiply by 1000 to get it in milliseconds.
 *
 * The method modifies its input in place.
 * @param series Time series to be converted
 */
function convertTimeSeries(series) {
	for (var i = 0; i < series.length; ++i) {
        series[i][0] *= 1000;
	}
    return series;
}

// load transcoders on startup
$(document).ready(function() {
	loadTranscoders();
});

