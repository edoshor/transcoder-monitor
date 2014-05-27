//var backendUrl = 'http://localhost/tm';
var backendUrl = 'http://shidur.bbdomain/tm';
var updateInterval = 2500;

var allEvents = [];

/**
 * The method get the list of events from the server,
 * populate events table and create state refresh timer.
 */
function loadEvents() {
    $.ajax({
		type: 'GET',
		url: backendUrl + '/events',
		dataType: 'json',
		success: function(responseData, textStatus, jqXHR) {
            allEvents = responseData;
            redrawEventsTable();
            refreshEventsState();
		},
		error: function (responseData, textStatus, errorThrown) {
		    alert('loadEvents failed: ' + errorThrown );
		}
	});
}

function redrawEventsTable() {
    var tbody = $('#events').find('tbody');
    tbody.empty();
    $.each(allEvents, function(i, e) {
        tbody.append('<tr><td>' + e.name +
            '</td><td id="event_state_' + e.id + '" class="status">refreshing...</td>' +
            '<td><button id="event_off_' + e.id + '" class="btn btn-danger" ' +
            'onclick="javascript:callEventAction(' + e.id + ',\'off\');">' +
            '<i class="icon-align-left icon-stop"></i>Off</button>&nbsp;&nbsp;' +
            '<button id="event_ready_' + e.id + '" class="btn btn-info" ' +
            'onclick="javascript:callEventAction(' + e.id + ',\'ready\');">' +
            '<i class="icon-align-left icon-check"></i>Ready</button>&nbsp;&nbsp;' +
            '<button id="event_on_' + e.id + '" class="btn btn-success" ' +
            'onclick="javascript:callEventAction(' + e.id + ',\'on\');">' +
            '<i class="icon-align-left icon-play"></i>On</button>' +
            '</td><tr>');
    });
}

/**
 * Update CPU load data for transcoder with given id.
 */
function refreshEventsState() {
    $.each(allEvents, function(i, e) {
        $.ajax({
            type: 'GET',
            url: backendUrl + '/events/' + e.id + '/status',
            dataType: 'json',
            success: function (responseData, textStatus, jqXHR) {
                var state;
                switch (responseData.state) {
                    case 'off':
                        state = '<span class="label label-important">Off </span>&nbsp;&nbsp;';
                        if (responseData.last_switch) {
                            state += formatDateTime(new Date(responseData.last_switch* 1000));
                        }
                        $('#event_on_' + e.id).attr('disabled', 'disabled').addClass('disabled');
                        break;
                    case 'ready':
                        state = '<span class="label label-info">Ready </span>&nbsp;&nbsp;';
                        if (responseData.last_switch) {
                            state += formatDateTime(new Date(responseData.last_switch* 1000));
                        }
                        $('#event_on_' + e.id).removeAttr('disabled').removeClass('disabled');
                        break;
                    case 'on':
                        state = '<span class="label label-success">On </span>&nbsp;&nbsp;'
                            + responseData.uptime;
                        break;
                    default:
                        state = '';
                        break;
                }
                $('#event_state_' + e.id).html(state);
            }
        });

    });
}

function callEventAction(event_id, action) {
    $.get(backendUrl + '/events/' + event_id + '/' + action);
    return false;
}

function formatDateTime(dt) {
    return dt.getDate() + '-' + dt.getMonth() + 1 + '-' + dt.getFullYear()
    + ', ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
}

// load events on startup
$(document).ready(function() {
	loadEvents();
    setInterval("refreshEventsState()", updateInterval);
});

