var backendUrl = 'http://shidur.bbdomain:9292';
var updateInterval = 1000;

var slots = [];
var txcoder = null;

function loadTranscoder(tx_id) {
    $.ajax({
		type: 'GET',
		url: backendUrl + '/transcoders/' + tx_id,
		crossDomain: true,
		dataType: 'json',
		success: function(responseData, textStatus, jqXHR) {
	   		txcoder = responseData;
		},
		error: function (responseData, textStatus, errorThrown) {
		    alert('loadTranscoder failed: ' + errorThrown );
		}
	});
}

function loadSlots(tx_id) {
    $.ajax({
		type: 'GET',
		url: backendUrl + '/transcoders/' + tx_id + '/slots',
		crossDomain: true,
		dataType: 'json',
		success: function(responseData, textStatus, jqXHR) {
	   		slots = responseData;
			$('#slots')
			.empty()
			.append('<tr><th>Slot id</th><th>Scheme</th><th>State</th><th>Link</th><th>Action</th></tr>')
			
			$.each(slots, function(i, slot) {
				var link = 'http://' + txcoder.host + ':' + (slot.slot_id + 8000);				
				$('#slots')
				.append('<tr><td>' + slot.slot_id + '</td>' +
                        '<td>' + slot.scheme_name + '</td>' +
                        '<td id="slot_status_' + slot.id + '"></td>' +
                        '<td><a href="' + link + '">' + link + '</a></td>' +
                        '<td id="slot_action_' + slot.id + '"></td></tr>');
			});
		},
		error: function (responseData, textStatus, errorThrown) {
		    alert('loadSlots failed: ' + errorThrown );
		}
	});
}

function refreshSlotsStatus() {
	$.each(slots, function(i, slot) {	
		$.ajax({
		type: 'GET',
		url: slotActionUrl(txcoder.id, slot.id) + 'status',
		crossDomain: true,
		dataType: 'json',
		success: function(responseData, textStatus, jqXHR) {
			var statusHtml = 'Stopped';
			var actionLink = '<button class="btn btn-success"' +
                'onclick="javascript:callSlotAction(' + txcoder.id +',' + slot.id + ',\'start\');">' +
                '<i class="icon-align-left icon-play"></i> Start</button>';

			if (responseData.running) {
				statusHtml = 'Running, uptime: ' + responseData.uptime;
                actionLink = '<button class="btn btn-danger"' +
                    'onclick="javascript:callSlotAction(' + txcoder.id +',' + slot.id + ',\'stop\');">' +
                    '<i class="icon-align-left icon-stop"></i> Stop</button>';
			}


			$('#slot_status_' + slot.id).text(statusHtml);
			$('#slot_action_' + slot.id).html(actionLink);
		},
		error: function (responseData, textStatus, errorThrown) {
			console.warn('loadTranscoder failed: ' + errorThrown );
		}
		});
	});
}

function slotActionUrl(tx_id, s_id) {
	return backendUrl + '/transcoders/' + tx_id + '/slots/' + s_id + '/';
}

function callSlotAction(tx_id, s_id, action) {
	var url = slotActionUrl(tx_id, s_id) + action;
	$.get(url);
	return false;
}

// load transcoders on startup
$(document).ready(function() {
	var tx_id = 4;
	loadTranscoder(tx_id);
	loadSlots(tx_id);
	setInterval("refreshSlotsStatus()", updateInterval);
});

