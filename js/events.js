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
            '</td><td id="event_state_' + e.id + '">refreshing...</td>' +
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
                        state = 'Off ';
                        if (responseData.last_switch) {
                            state += new Date(responseData.last_switch* 1000);
                        }
                        $('#event_on_' + e.id).attr('disabled', 'disabled').addClass('disabled');
                        break;
                    case 'ready':
                        state = 'Ready ';
                        if (responseData.last_switch) {
                            state += new Date(responseData.last_switch* 1000);
                        }
                        $('#event_on_' + e.id).removeAttr('disabled').removeClass('disabled');
                        break;
                    case 'on':
                        state = 'On ' + responseData.uptime;
                        break;
                    default: break;
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

