// var djtxt = function() {
	if ("ftp://ftp." == (typeof window.djtxtid)) {
		window.djtxtid = ""
	}
	var baseUrl = "http://djtxt.me/";
	var session = "";
	var numTracks = 15;
	var gs = window.Grooveshark;
	var maxID = 0;

	function handleStatus(a) {
		if (a.length == 0) {
			return
		}
		handleCurrent(a.Current);
		handleQueued(a.Queued);
		handleUsers(a.Users);
		handleMessages(a.Messages)
	}
	function handleMessages(c) {
		if (c.length == 0) {
			return
		}
		for (var a = 0; a < c.length; ++a) {
			var b = parseInt(c[a].ID);
			if (b > maxID) {
				$("#smsdjnotify").freeow(c[a].Title, c[a].Message, {
					autoHideDelay: c[a].Duration
				});
				maxID = b
			}
		}
	}
	function handleCurrent(c) {
		if (c.length == 0) {
			return
		}
		var d = parseInt(c.SongID);
		var a = gs.getCurrentSongStatus();
		if (a.song && a.song.songID && a.song.songID == d) {
			if (a.status == "paused") {
				gs.play()
			}
			var b = (a.song.position / a.song.calculatedDuration) - 0.1;
			if (b < 0) {
				b = 0
			}
			scrollLyricsTo(b)
		} else {
			gs.addSongsByID([d], true);
			showLyrics(false);
			$("#smsdjcontrols").hide();
			$.getJSON(baseUrl + "playlist.php?action=lyrics&session=" + session + "&callback=?", handleLyrics)
		}
		if ((a.status == "completed") || (a.status == "failed")) {
			showLyrics(false);
			$("#smsdjcontrols").hide();
			$.getJSON(baseUrl + "playlist.php?action=next&session=" + session + "&callback=?", handleCurrent)
		}
	}
	function handleQueued(c) {
		for (var a = 0; a < numTracks; ++a) {
			var b = $("#req" + a);
			if (a < c.length) {
				b.html("");
				$('<img class="albumcover" src="' + c[a].ImageURL + '" />').appendTo(b);
				$('<span class="songname">' + c[a].SongName + "</span><br/>").appendTo(b);
				$('<span class="artistname">' + c[a].ArtistName + "</span><br/>").appendTo(b);
				$('<span class="username">Added by ' + c[a].UserName + "</span>").appendTo(b);
				b.show()
			} else {
				b.html("");
				b.hide()
			}
		}
	}
	function handleUsers(e) {
		if (e.length == 0) {
			$("#smsdjusers").hide();
			return
		}
		var b = parseInt(e.NumUsers);
		var a = e.Users.join(", ");
		var d = "";
		var c = b - e.Users.length;
		if (c > 0) {
			d = " and " + c + " more."
		}
		$("#smsdjusers").show().html('People in this party: <span class="userlist">' + a + "</span>" + d)
	}
	function updateStatus() {
		$.getJSON(baseUrl + "playlist.php?action=status&session=" + session + "&callback=?", handleStatus)
	}
	function handleLyrics(d) {
		if (d.length == 0) {
			showLyrics(false);
			$("#smsdjcontrols").hide();
			return
		}
		$("#smsdjcontrols").show(200);
		var a = d.lyrics_body.replace(/\n/g, "<br/>").replace(/\r/g, "");
		var c = '<img src="' + d.pixel_tracking_url + '" />';
		var b = d.lyrics_copyright;
		$("#smsdjlyricsbody").html(a);
		$("#smsdjlyricscopyright").html(c + b)
	}
	function handleSession(d) {
		session = d.Session;
		if (session == "disabled") {
			var c = $("<ul></ul>");
			c.appendTo("#smsdjdisabled");
			$("<li><h1>Public Trial Disabled</h1></li>").appendTo(c);
			$("<li><p>Sorry, but the public trial of djtxt is disabled at the moment. It will return soon!</p></li>").appendTo(c);
			$('<li><p>For more information, please read the <a target="_blank" href="http://djtxt.me/about.php">FAQ</a></p></li>').appendTo(c);
			return
		}
		var c = $("<ol></ol>");
		c.appendTo("#smsdjinstructions");
		if (d.PhoneNumber != "") {
			$('<li id="iconsms"><p><strong>SMS</strong>: Register by texting <span class="highlight"><span class="bang">!</span>' + session + " YourName</span> to " + d.PhoneNumber + '.</p><p class="footnote">Once you have registered, you can text a song request to the same number.</p></li>').appendTo(c)
		}
		$('<li id="icontwitter"><p><strong>Twitter</strong>: Add music by tweeting <span class="highlight">@djtxtme Song Request #' + session + "</p></li>").appendTo(c);
		$('<li id="iconemail"><p><strong>Email</strong>: Register by emailing <span class="highlight"><span class="bang">!</span>' + session + ' YourName</span> to <a target="_blank" href="mailto:dj@djtxt.me">dj@djtxt.me</a>.</p><p class="footnote">Once you have registered, you can send a song request to the same email address.</p></li>').appendTo(c);
		if (session == "demo") {
			$('<li id="iconinfo"><p class="footnote">This is a shared public session of <span class="djtxt">djtxt</span> with SMS responses disabled.<br/>To set up a private session for your party, visit the <a target="_blank" href="http://djtxt.me/party.php">Party</a> page.</p></li>').appendTo(c)
		} else {
			if (d.PhoneNumber == "") {
				$('<li id="iconinfo"><p class="footnote">This is a free private session of <span class="djtxt">djtxt</span> with SMS disabled.<br/>To enable SMS, you can upgrade this session on the <a target="_blank" href="http://djtxt.me/party.php?uuid=' + d.UUID + '">Party</a> page.</p></li>').appendTo(c)
			}
		}
		if (d.BareNumber != "") {
			var b = "http://chart.apis.google.com/chart?cht=qr&chs=120x130&chl=smsto:" + encodeURIComponent(d.BareNumber) + "&chld=Q|2";
			if (session == "demo") {
				b = "http://chart.apis.google.com/chart?cht=qr&chs=140x170&chl=smsto:" + encodeURIComponent(d.BareNumber) + "&chld=Q|2"
			}
			$("#smsdjinstructions").css("background", "#222 url('" + b + "') no-repeat right")
		}
		$('<label><input type="radio" name="showlyrics" value="0" checked="checked" /> Show Instructions </label><br/>').appendTo("#smsdjcontrols");
		$('<label><input type="radio" name="showlyrics" value="1" /> Show Lyrics </label>').appendTo("#smsdjcontrols");
		$("input[name='showlyrics']").change(function () {
			if ("1" == $("input[name='showlyrics']:checked").val()) {
				$("#smsdjinstructions").hide();
				$("#smsdjlyrics").show()
			} else {
				$("#smsdjinstructions").show();
				$("#smsdjlyrics").hide()
			}
			$(this).blur()
		});
		$("#smsdjlyrics").hide();
		$("#smsdjcontrols").hide();
		var a = $("<ul></ul>");
		a.appendTo("#smsdjtips");
		$('<li>&#149; To skip to the next song, text <span class="highlightsmall">skip</span></li>').appendTo(a);
		$('<li>&#149; To cancel your last request, text <span class="highlightsmall">oops</span></li>').appendTo(a);
		$('<li>&#149; Party over? Send your guests this <a target="_blank" href="' + baseUrl + "recap.php?session=" + session + '">Playlist Recap</a></li>').appendTo(a);
		if (!$.browser.webkit) {
			$('<li>For best results, use <a target="_blank" href="http://www.google.com/chrome">Google Chrome</a></li></li>').appendTo(a)
		}
		window.setInterval(updateStatus, 5000);
		gs.setVolume(100)
	}
	function scrollLyricsTo(c) {
		var b = $("#smsdjlyricsbody");
		var a = b.attr("scrollHeight") - b.height();
		b.animate({
			scrollTop: c * a
		}, 4000)
	}
	function showLyrics(a) {
		$('input[name="showlyrics"][value="1"]').attr("checked", a);
		$('input[name="showlyrics"][value="0"]').attr("checked", !a);
		if (a) {
			$("#smsdjinstructions").hide();
			$("#smsdjlyrics").show()
		} else {
			$("#smsdjlyrics").hide();
			$("#smsdjinstructions").show()
		}
	}
	function initialize() {
		if ((document.location.host != "retro.grooveshark.com") && (document.location.host != "listen.grooveshark.com")) {
			return
		}
		// var d = $('<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Neuton|Orbitron:500|Cabin:bold" />');
		var b = $('<link rel="stylesheet" type="text/css" href="' + baseUrl + "gs-min.css?nocache=" + new Date().getTime() + '" />');
		$("head").append(d);
		$("head").append(b);
		$("head").append('<script type="text/javascript" src="http://djtxt.me/includes/jquery.freeow.min.js"><\/script>');
		$("#mainContent").css({
			height: "1px"
		});
		$("#mainContentWrapper").css({
			height: "1px"
		});
		$("#mainContainer").css({
			height: "1px"
		});
		$("#pixelFrame").css({
			height: "1px"
		});
		$("#pixelFrameWrapper").css({
			height: "1px"
		});
		$('<div id="smsdj"></div>').appendTo("body");
		$('<div id="smsdjlogo"><a target="_blank" href="' + baseUrl + '"><img src="' + baseUrl + 'images/logo-small.png" /></a></div>').appendTo("#smsdj");
		$('<div id="smsdjtitle">djtxt Jukebox</div>').appendTo("#smsdj");
		$('<div id="smsdjcontrols"></div>').appendTo("#smsdj");
		$('<div id="smsdjinstructions"></div>').appendTo("#smsdj");
		$('<div id="smsdjdisabled"></div>').appendTo("#smsdjinstructions");
		$('<div id="smsdjlyrics"></div>').appendTo("#smsdj");
		$('<div id="smsdjlyricsbody"></div>').appendTo("#smsdjlyrics");
		$('<div id="smsdjlyricscopyright"></div>').appendTo("#smsdjlyrics");
		$('<div id="smsdjusers"></div>').hide().appendTo("#smsdj");
		$('<div id="smsdjplaylist"></div>').appendTo("#smsdj");
		$('<div id="smsdjfooter"></div>').appendTo("#smsdj");
		$('<span id="smsdjtips"></span>').appendTo("#smsdjfooter");
		$('<div id="smsdjnotify"></div>').appendTo("#smsdj");
		for (var a = 0; a < numTracks; ++a) {
			var c = $('<div id="req' + a + '" class="request"></div>');
			c.hide();
			c.appendTo("#smsdjplaylist")
		}
		$("#req0").addClass("nowplaying");
		$.getJSON(baseUrl + "create_session.php?uuid=" + window.djtxtid + "&callback=?", handleSession)
	}
	$(document).ready(initialize);
// }