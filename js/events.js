var backendUrl = 'http://shidur.bbdomain:9292';
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
		crossDomain: true,
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
            '</td><td id="event_state_' + e.id + '">refreshing...</td>' +
            '<td><button id="event_start_' + e.id + '" class="btn btn-success" ' +
            'onclick="javascript:callEventAction(' + e.id + ',\'start\');">' +
            '<i class="icon-align-left icon-play"></i>Start</button>' +
            '<button id="event_stop_' + e.id + '" class="btn btn-danger" ' +
            'onclick="javascript:callEventAction(' + e.id + ',\'stop\');">' +
            '<i class="icon-align-left icon-stop"></i>Stop</button>' +
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
            crossDomain: true,
            dataType: 'json',
            success: function (responseData, textStatus, jqXHR) {
                var state;
                if (responseData.running) {
                    state = 'Running ' + responseData.uptime;
                    $('#event_start_' + e.id).attr('disabled', 'disabled').addClass('disabled');
                    $('#event_stop_' + e.id).removeAttr('disabled').removeClass('disabled');
                } else {
                    state = 'Stopped ';
                    if (responseData.last_switch) {
                        state += new Date(responseData.last_switch* 1000);
                    }

                    $('#event_start_' + e.id).removeAttr('disabled').removeClass('disabled');
                    $('#event_stop_' + e.id).attr('disabled', 'disabled').addClass('disabled');
                }
                $('#event_state_' + e.id).text(state);
            }
        });

    });
}

function callEventAction(event_id, action) {
    $.get(backendUrl + '/events/' + event_id + '/' + action);
    return false;
}

// load events on startup
$(document).ready(function() {
	loadEvents();
    setInterval("refreshEventsState()", updateInterval);
});

