var apiKey = "b3379b73aaf64f4980a0eeabd66d3455", // production
a8GroupId = "1801684";


// get list of members and populate roster table

var roster = [];

$.when(
	// get A8 roster
	$.ajax({
		url: "https://www.bungie.net/platform/GroupV2/" + a8GroupId + "/Members/",
		headers: {
			"X-API-Key": apiKey
		}
  })
  
	.done(function(json) {

		if (json.ErrorStatus === 'Success') {

			var members = json.Response.results;

			$.each(members, function(i) {
				var member = members[i];
				roster.push(member);
			});

			console.log('a8s member list:', members);

		} else {

			console.log('JSON responded with ', json.ErrorStatus);

		}

	})
	.fail(function(err) {

		console.log(err);

	})

)
.then(function() {
  console.log(roster);
	listMembers(roster);

});


function listMembers(rsp) {

  var
  list = $('.roster-table tbody'),
  on = 0,
  sortMembers = function(method) {
    // sort by date joined
    if (method == joined) {
      list.find('.member').sort(function(a, b) {
        return ($(b).data('joined')) < ($(a).data('joined')) ? 1 : -1;
      }).appendTo(list);
    } else if (method == username) {
      list.find('.member').sort(function(a, b) {
        return ($(b).data('username')) < ($(a).data('username')) ? 1 : -1;
      }).appendTo(list);
    }
    list.find('.member.online').prependTo(list);
  };

  for (var i = 0; i < rsp.length; i++) {

    var
		profile = rsp[i].bungieNetUserInfo,
		member = $('<tr></tr>');

		// tally up online members
		if (rsp[i].isOnline) {
			on++
		}

		// check for valid profile
		// some users don't have Bungie profiles somehow and it breaks function
    if (typeof profile != 'undefined') {
			// store response data in semantic variables
      var
        name = rsp[i].destinyUserInfo.displayName,
        joinDate = rsp[i].joinDate,
        joined = joinDate.substring(0, joinDate.indexOf('T')),
        online = rsp[i].isOnline ? 'online' : '', // If online show 'online' if not show nothing
        icon = profile.iconPath,
        memberId = profile.membershipId,
        memberType = rsp[i].memberType,
        destinyId = rsp[i].destinyUserInfo.membershipId,
        rank = rsp[i].memberType,
        role= '';

      if (rank == 2) {
        role = "Member";
      } else if(rank == 3) {
        role = "Admin";
      } else if( rank == 5 ) {
        role = "Owner"
      }

			// configure DOM node and add to page
      member
        .attr({
          'class': 'j-row vertical-center-row member',
          'href': '/player.html?bungieId=' + memberId + '&destinyId=' + destinyId + '&joined=' + joined + '&rank=' + rank,
          'title': 'See player profile for ' + name,
          'data-joined' : joined.replace(/-/g, ''),
          'data-username': name,
          'data-online' : 'false',
          'data-searchable' : name,
        })
        .html(
            '<th scope="row"><img src="https://www.bungie.net' + icon + '" style="width: 30px; height:30px"></th>' + // #
            '<td>' + name + '</td>' + // Username
            '<td class="text-warning">' + role + '</td>' + // Role - Not the discord role yet
            '<td>' + online + '</td>' + // In game online status
            '<td><a href="https://www.bungie.net/en/Profile/254/' + memberId + '/' + name + '">Click</a></td>' // Bungie Profile 
        );

			if (rsp[i].exalted) {
				member.addClass('exalted')
				.attr({
					'href': '/player.html?bungieId=' + memberId + '&destinyId=' + destinyId + '&joined=' + joined + '&rank=' + rank + '&exalted=true'
				})
				.find('.member-name').find('h3')
				.html(name + ' &nbsp;<span class="gold" title="Exalted">&epsilon;</span>');
			}

			member.appendTo(list);

			// indicate online/offline status
      if (String(online) === 'true') {
        $('#status-' + memberId)
        .text('Online')
        .addClass('online')
        .closest('.member')
        .attr('data-online', true)
        .addClass('online');
      } else {
        $('#status-' + memberId).text('Offline').removeClass('online');
      }

      sortMembers(joined); // sort members by join date

    }

  }

	$('#member-count').text(on + ' / ' + rsp.length + ' Members Online');

}