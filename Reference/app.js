/* app.js on 12 April 2011 */
$.Model.extend("GS.Models.Base", {
	cache: {},
	getOneFromCache: function (a) {
		var b = this.shortName.toLowerCase() + "s",
			c = this.cache[a];
		if (c && GS.user) {
			if (GS.user.favorites[b]) c.isFavorite = _.defined(GS.user.favorites[b][a]) ? 1 : 0;
			if (b == "songs" && GS.user.library.songs) c.fromLibrary = _.defined(GS.user.library.songs[a]) ? 1 : 0
		}
		return c
	},
	getManyFromCache: function (a) {
		for (var b = [], c = 0; c < a.length; c++) b.push(this.getOneFromCache(a[c]));
		return b
	},
	wrap: function (a, b) {
		var c = this.id,
			g = a[c];
		b = _.orEqual(b, true);
		if (g) if (g = this.getOneFromCache(g)) return g;
		g = this._super(a);
		if (b && g[c]) if (this.shortName !== "Song" || g.validate()) this.cache[g[c]] = g;
		return g
	},
	wrapCollection: function (a, b, c, g) {
		var h, k, m = [],
			o, r;
		b = _.orEqual(b, null);
		c = _.orEqual(c, false);
		g = _.orEqual(g, false);
		for (h in a) if (a.hasOwnProperty(h)) {
			o = a[h];
			r = this.wrap(o).dupe();
			if (c) for (k in o) {
				if (o.hasOwnProperty(k)) r[k] = o[k]
			} else if (b) for (k in b) if (b.hasOwnProperty(k)) if (k === "USE_INDEX") r[b[k]] = parseInt(h, 10) + 1;
			else r[k] = _.orEqual(o[k], b[k]);
			if (!g || !$.isFunction(r.validate) || r.validate()) m.push(r)
		}
		m._use_call = true;
		return m
	},
	wrapCollectionInObject: function (a, b, c) {
		var g, h, k, m;
		b = _.orEqual(b, null);
		c = _.orEqual(c, false);
		for (g in a) if (a.hasOwnProperty(g)) {
			k = a[g];
			m = this.wrap(k).dupe();
			if (c) for (h in k) {
				if (k.hasOwnProperty(h)) m[h] = k[h]
			} else if (b) for (h in b) if (b.hasOwnProperty(h)) m[h] = _.orEqual(k[h], b[h]);
			a[g] = m
		}
		return a
	}
}, {
	songs: {},
	dupe: function () {
		return new this.Class(this.attrs())
	},
	wrapSongCollection: function (a, b, c) {
		b = GS.Models.Song.wrapCollection(a.Songs || a.songs || a.result || a, b, c, true);
		for (c = 0; c < b.length; c++) this.songs[b[c].SongID] = b[c];
		if (a && a.hasMore) {
			console.log("service has more. current page is: ", this.currentPage);
			this.currentPage++
		} else this.songsLoaded = true;
		return b
	},
	playSongs: function (a) {
		var b = _.orEqual(a.index, -1),
			c = _.orEqual(a.playOnAdd, false),
			g = _.orEqual(a.sort, false),
			h = new GS.Models.PlayContext((this.shortName || "").toLowerCase(), this);
		a.verified && _.isEmpty(this.songs) && this.getSongs(this.callback("playSongs", {
			index: b,
			playOnAdd: c,
			sort: "TrackNum",
			verified: false
		}), null, false);
		var k = [];
		if (g) {
			var m = [];
			_.forEach(this.songs, function (o) {
				m.push(o)
			});
			m = m.sort(function (o, r) {
				if (o.hasOwnProperty(g) && r.hasOwnProperty(g)) return o[g] > r[g];
				else if (o.hasOwnProperty(g)) return true;
				return false
			});
			_.forEach(m, function (o) {
				k.push(o.SongID)
			})
		} else _.forEach(this.songs, function (o) {
			k.push(o.SongID)
		});
		console.log("PLAY SONGS", k);
		GS.player.addSongsToQueueAt(k, a.index, a.playOnAdd, h)
	}
});
(function (a) {
	GS.Models.Base.extend("GS.Models.Song", {
		id: "SongID",
		cache: {},
		defaults: {
			AlbumID: null,
			AlbumName: "",
			ArtistID: null,
			ArtistName: "",
			CoverArtFilename: "",
			EstimateDuration: 0,
			Flags: 0,
			IsLowBitrateAvailable: 0,
			Popularity: "",
			SongID: null,
			SongName: "",
			TrackNum: "0",
			Year: "0",
			artPath: "http://beta.grooveshark.com/static/amazonart/",
			fromLibrary: 0,
			isFavorite: 0,
			isVerified: -1,
			TSAdded: "",
			TSFavorited: "",
			_token: null,
			tokenFailed: false
		},
		songsLoaded: false,
		songsUnverifiedLoaded: false,
		getSong: function (b, c, g, h) {
			var k = this.getOneFromCache(b),
				m = arguments[arguments.length - 1] === h ? {} : arguments[arguments.length - 1];
			h = _.orEqual(h, true);
			if (k) c(k);
			else {
				h && a.publish("gs.page.loading.page");
				GS.service.getQueueSongListFromSongIDs([b], this.callback(["wrapSingleSongFromIDs", c]), g, m)
			}
		},
		getSongFromToken: function (b, c, g, h) {
			var k = this.getOneFromCache(b);
			h = _.orEqual(h, true);
			if (k) c(k);
			else {
				h && a.publish("gs.page.loading.page");
				GS.service.getSongFromToken(b, this.callback(["wrap", c]), g)
			}
		},
		getVerifiedDivider: function () {
			var b = this.wrap({
				SongID: -1,
				SongName: "",
				ArtistName: "",
				ArtistID: 0,
				AlbumName: "",
				AlbumID: 0,
				CoverArtFilename: ""
			}, false);
			b.isVerified = 0;
			return b
		},
		wrap: function (b, c) {
			b = _.orEqual(b, {});
			var g = _.orEqualEx(b.TrackNum, b.trackNum, "0").toString(),
				h = this._super({
					AlbumID: _.orEqualEx(b.AlbumID, b.albumID, 0),
					AlbumName: _.cleanText(_.orEqualEx(b.AlbumName, b.albumName, "")),
					ArtistID: _.orEqualEx(b.ArtistID, b.artistID, null),
					ArtistName: _.cleanText(_.orEqualEx(b.ArtistName, b.artistName, "")),
					CoverArtFilename: _.orEqualEx(b.CoverArtFilename, b.artFilename, ""),
					EstimateDuration: _.orEqualEx(b.EstimateDuration, b.estimateDuration, 0),
					Flags: _.orEqualEx(b.Flags, b.flags, 0),
					IsLowBitrateAvailable: _.orEqualEx(b.IsLowBitrateAvailable, 0),
					SongID: _.orEqualEx(b.SongID, b.songID, null),
					SongName: _.cleanText(_.orEqualEx(b.SongName, b.songName, b.Name, "")),
					TrackNum: g,
					Year: _.cleanText(_.orEqualEx(b.Year, b.year, "0")),
					_token: _.orEqualEx(b._token, null)
				}, c);
			if (h.TrackNum !== g && g !== "0") h.TrackNum = g;
			return h
		},
		wrapQueue: function (b) {
			return this.wrapCollection(b, {
				Flags: 0,
				EstimateDuration: 0,
				autoplayVote: 0,
				parentQueueID: 0,
				queueSongID: 0,
				source: "",
				index: 0,
				context: null,
				sponsoredAutoplayID: 0
			})
		},
		wrapSingleSongFromIDs: function (b) {
			b = this.wrapCollection(b);
			if (b.length) return b[0]
		},
		archive: function (b) {
			return {
				A: b.AlbumID,
				B: b.AlbumName,
				C: b.ArtistID,
				D: b.ArtistName,
				E: b.CoverArtFilename,
				F: b.EstimateDuration,
				G: b.Flags,
				H: b.Popularity,
				I: b.SongID,
				J: b.SongName,
				K: b.TSAdded,
				L: b.TrackNum,
				M: b.Year,
				N: b.isFavorite
			}
		},
		unarchive: function (b) {
			return {
				AlbumID: b.A,
				AlbumName: b.B,
				ArtistID: b.C,
				ArtistName: b.D,
				CoverArtFilename: b.E,
				EstimateDuration: b.F,
				Flags: b.G,
				Popularity: b.H,
				SongID: b.I,
				SongName: b.J,
				TSAdded: b.K,
				TrackNum: isNaN(b.L) ? "0" : b.L,
				Year: isNaN(b.M) ? "0" : b.M,
				isFavorite: b.N
			}
		}
	}, {
		validate: function () {
			if (this.SongID > 0 && this.ArtistID > 0 && this.AlbumID > 0) return true;
			return false
		},
		init: function (b) {
			if (b) {
				this._super(b);
				this.SongName = _.orEqual(b.SongName, b.Name);
				this.AlbumName = _.orEqual(b.AlbumName, "");
				this.searchText = [this.SongName, this.ArtistName, this.AlbumName].join(" ").toLowerCase();
				this.fanbase = GS.Models.Fanbase.wrap({
					objectID: this.SongID,
					objectType: "song"
				});
				this.songs = {};
				delete this.Name
			}
		},
		toUrl: function (b) {
			if (this._token) return _.cleanUrl(this.SongName, this.SongID, "s", this._token, b);
			else if (this.tokenFailed) return _.generate404();
			else {
				this.getToken();
				return this._token ? _.cleanUrl(this.SongName, this.SongID, "s", this._token, b) : _.generate404()
			}
		},
		getToken: function () {
			if (this._token) return this._token;
			else if (this.tokenFailed) return null;
			else {
				GS.service.getTokenForSong(this.SongID, this.callback(this.checkToken), this.callback(this.checkToken), {
					async: false
				});
				return this._token
			}
		},
		checkToken: function (b) {
			if (b.Token) {
				this._token = b.Token;
				GS.Models.Song.cache[this._token] = this;
				GS.Models.Song.getOneFromCache(this.SongID)._token = this._token
			} else this.tokenFailed = true
		},
		getImageURL: function (b) {
			var c = gsConfig.assetHost + "/webincludes/images/default/album_250.png";
			b || (b = "m");
			if (this.CoverArtFilename) c = this.artPath + b + this.CoverArtFilename;
			return c
		},
		getDetailsForFeeds: function () {
			return {
				songID: this.SongID,
				songName: this.SongName,
				albumID: this.AlbumID,
				albumName: this.AlbumName,
				artistID: this.ArtistID,
				artistName: this.ArtistName,
				artFilename: this.ArtFilename,
				track: this.TrackNum
			}
		},
		getRelatedSongs: function (b, c, g) {
			g = _.orEqual(g, true);
			this.album ? this.album.getSongs(b, c, g) : GS.Models.Album.getAlbum(this.AlbumID, this.callback(function (h) {
				this.album = h;
				h.getSongs(b, c, g)
			}), c, false)
		},
		getAffiliateDownloadURLs: function (b) {
			var c;
			if (_.isEmpty(this.affiliateDownloadURLs)) c = this;
			else return this.affiliateDownloadURLs;
			var g = [];
			GS.service.getAffiliateDownloadURLs(this.SongName, this.ArtistName, function (h) {
				a.each(h, function (k, m) {
					if (k === "amazon") k = "Amazon";
					g.push({
						name: k,
						url: m.url
					})
				});
				c.affiliateDownloadURLs = g;
				b(c.affiliateDownloadURLs)
			}, function (h) {
				console.log("models.song.getaffiliatedownloadurls failed", h);
				b({})
			})
		},
		getOptionMenu: function (b) {
			b = _.orEqual(b, {});
			var c = [];
			GS.user.UserID > 0 && c.push({
				title: a.localize.getString("SHARE_EMAIL"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						GS.lightbox.open("share", {
							service: "email",
							type: "song",
							id: this.SongID
						})
					})
				}
			});
			c = c.concat([{
				title: a.localize.getString("SHARE_FACEBOOK"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						GS.lightbox.open("share", {
							service: "facebook",
							type: "song",
							id: this.SongID
						})
					})
				}
			}, {
				title: a.localize.getString("SHARE_TWITTER"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						GS.lightbox.open("share", {
							service: "twitter",
							type: "song",
							id: this.SongID
						})
					})
				}
			}, {
				title: a.localize.getString("SHARE_STUMBLE"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						GS.lightbox.open("share", {
							service: "stumbleupon",
							type: "song",
							id: this.SongID
						})
					})
				}
			}, {
				title: a.localize.getString("SHARE_WIDGET"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						GS.lightbox.open("share", {
							service: "widget",
							type: "song",
							id: this.SongID
						})
					})
				}
			}, {
				title: a.localize.getString("COPY_URL"),
				type: "sub",
				action: {
					type: "fn",
					callback: this.callback(function () {
						ZeroClipboard && GS.Models.Song.getSong(this.SongID, function (k) {
							if (k) {
								var m = ["http://listen.grooveshark.com/" + k.toUrl().replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(k.AlbumName, k.AlbumID, "album").replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(k.ArtistName, k.ArtistID, "artist").replace("#/", "")];
								k = a("div[id^=jjmenu_main_sub]");
								if (window.contextMenuClipboards) {
									window.contextMenuClipboards[0].reposition(a("div.songUrl", k)[0]);
									window.contextMenuClipboards[1].reposition(a("div.albumUrl", k)[0]);
									window.contextMenuClipboards[2].reposition(a("div.artistUrl", k)[0])
								} else window.contextMenuClipboards = [new ZeroClipboard.Client(a("div.songUrl", k)[0]), new ZeroClipboard.Client(a("div.albumUrl", k)[0]), new ZeroClipboard.Client(a("div.artistUrl", k)[0])];
								a.each(window.contextMenuClipboards, function (o, r) {
									r.setText(m[o]);
									if (!r.hasCompleteEvent) {
										r.addEventListener("complete", function (s, u) {
											a("div[id^=jjmenu]").remove();
											console.log("Copied: ", u)
										});
										r.hasCompleteEvent = true
									}
								});
								a("div.songUrl", k).bind("remove", function () {
									try {
										a.each(window.contextMenuClipboards, function (r, s) {
											s.hide()
										})
									} catch (o) {}
								});
								a("div[name$=Url]", k).show()
							}
						})
					})
				},
				customClass: "last copyUrl",
				src: [{
					title: a.localize.getString("SONG_URL"),
					customClass: "songUrl"
				}, {
					title: a.localize.getString("ALBUM_URL"),
					customClass: "albumUrl"
				}, {
					title: a.localize.getString("ARTIST_URL"),
					customClass: " artistUrl"
				}]
			}]);
			c = [{
				title: a.localize.getString("CONTEXT_ADD_TO"),
				type: "sub",
				src: [{
					title: a.localize.getString("CONTEXT_ADD_TO_PLAYLIST_MORE"),
					type: "sub",
					src: GS.Models.Playlist.getPlaylistsMenu(this.SongID, this.callback(function (k) {
						k.addSongs([this.SongID], null, true)
					}))
				}, {
					title: a.localize.getString("MY_MUSIC"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.user.addToLibrary(this.SongID)
						})
					}
				}, {
					title: a.localize.getString("FAVORITES"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.user.addToSongFavorites(this.SongID)
						})
					}
				}],
				customClass: "first"
			}, {
				title: a.localize.getString("CONTEXT_SHARE_SONG"),
				type: "sub",
				src: [{
					title: a.localize.getString("SHARE_EMAIL"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "email",
								type: "song",
								id: this.SongID
							})
						})
					},
					customClass: "first"
				}, {
					title: a.localize.getString("SHARE_FACEBOOK"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "facebook",
								type: "song",
								id: this.SongID
							})
						})
					}
				}, {
					title: a.localize.getString("SHARE_TWITTER"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "twitter",
								type: "song",
								id: this.SongID
							})
						})
					}
				}, {
					title: a.localize.getString("SHARE_STUMBLE"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							window.open(_.makeUrlForShare("stumbleupon", "song", this), "_blank")
						})
					}
				}, {
					title: a.localize.getString("SHARE_REDDIT"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							window.open(_.makeUrlForShare("reddit", "song", this), "_blank")
						})
					}
				}, {
					title: a.localize.getString("SHARE_WIDGET"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "widget",
								type: "song",
								id: this.SongID
							})
						})
					}
				}, {
					title: a.localize.getString("COPY_URL"),
					type: "sub",
					action: {
						type: "fn",
						callback: this.callback(function () {
							ZeroClipboard && GS.Models.Song.getSong(this.SongID, function (k) {
								if (k) {
									var m = ["http://listen.grooveshark.com/" + k.toUrl().replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(k.AlbumName, k.AlbumID, "album").replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(k.ArtistName, k.ArtistID, "artist").replace("#/", "")];
									k = a("div[id^=jjmenu_main_sub]");
									if (window.contextMenuClipboards) {
										window.contextMenuClipboards[0].reposition(a("div.songUrl", k)[0]);
										window.contextMenuClipboards[1].reposition(a("div.albumUrl", k)[0]);
										window.contextMenuClipboards[2].reposition(a("div.artistUrl", k)[0])
									} else window.contextMenuClipboards = [new ZeroClipboard.Client(a("div.songUrl", k)[0]), new ZeroClipboard.Client(a("div.albumUrl", k)[0]), new ZeroClipboard.Client(a("div.artistUrl", k)[0])];
									a.each(window.contextMenuClipboards, function (o, r) {
										r.setText(m[o]);
										if (!r.hasCompleteEvent) {
											r.addEventListener("complete", function (s, u) {
												a("div[id^=jjmenu]").remove();
												console.log("Copied: ", u)
											});
											r.hasCompleteEvent = true
										}
									});
									a("div.songUrl", k).bind("remove", function () {
										try {
											a.each(window.contextMenuClipboards, function (r, s) {
												s.hide()
											})
										} catch (o) {}
									});
									a("div[name$=Url]", k).show()
								}
							})
						})
					},
					customClass: "last copyUrl",
					src: [{
						title: a.localize.getString("SONG_URL"),
						customClass: "songUrl"
					}, {
						title: a.localize.getString("ALBUM_URL"),
						customClass: "albumUrl"
					}, {
						title: a.localize.getString("ARTIST_URL"),
						customClass: " artistUrl"
					}]
				}]
			}, {
				title: a.localize.getString("CONTEXT_BUY_SONG"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						console.log("CLICKED BUY");
						GS.lightbox.open("buySong", this.SongID)
					})
				}
			}];
			var g = 0;
			if (!GS.user.isLoggedIn) for (var h = 0; h < c.length; h++) if (c[h].title == a.localize.getString("CONTEXT_SHARE_SONG") && c[h].src) {
				for (; c[h].src[g];) if (!GS.user.isLoggedIn && c[h].src[g].title == a.localize.getString("SHARE_EMAIL")) {
					c[h].src.splice(g, 1);
					g = Math.min(c[h].src.length, Math.max(0, g--))
				} else g++;
				g = 0
			}
			b.isQueue = _.orEqual(b.isQueue, false);
			b.isQueue && c.push({
				title: a.localize.getString("CONTEXT_FLAG_SONG"),
				type: "sub",
				src: [{
					title: a.localize.getString("CONTEXT_FLAG_BAD_SONG"),
					action: {
						type: "fn",
						callback: function () {
							b.flagSongCallback(1)
						}
					}
				}, {
					title: a.localize.getString("CONTEXT_FLAG_BAD_METADATA"),
					action: {
						type: "fn",
						callback: function () {
							b.flagSongCallback(4)
						}
					}
				}]
			});
			return c
		},
		getTitle: function () {
			return ['"', this.SongName, '" by ', this.ArtistName, ' on "', this.AlbumName, '"'].join("")
		},
		toString: function (b) {
			return (b = _.orEqual(b, false)) ? ["Song. sid:", this.SongID, ", name:", this.SongName, ", aid:", this.ArtistID, ", arname: ", this.ArtistName, ", alid: ", this.AlbumID, ", alname:", this.AlbumName, ", track: ", this.TrackNum, ", verified: ", this.isVerified].join("") : _.getString("SELECTION_SONG_SINGLE", {
				SongName: _.cleanText(this.SongName),
				ArtistName: _.cleanText(this.ArtistName)
			})
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Album", {
		id: "AlbumID",
		cache: {},
		defaults: {
			AlbumName: "",
			AlbumID: null,
			ArtistName: "",
			ArtistID: null,
			CoverArtFilename: "",
			Year: "",
			IsVerified: 0,
			isFavorite: 0,
			songsLoaded: false,
			songsUnverifiedLoaded: false,
			fanbase: null
		},
		getAlbum: function (b, c, g, h) {
			var k = this.getOneFromCache(b);
			h = _.orEqual(h, true);
			if (k) c(k);
			else {
				h && a.publish("gs.page.loading.page");
				GS.service.getAlbumByID(b, this.callback(["wrap", c]), g)
			}
		},
		getFilterAll: function () {
			return this.wrap({
				AlbumID: -1,
				AlbumName: a.localize.getString("ALL_ALBUMS"),
				ArtistName: "",
				ArtistID: -1,
				isVerified: 2,
				isFilterAll: 1
			}, false)
		}
	}, {
		smallAlbum: 5,
		artPath: "http://beta.grooveshark.com/static/amazonart/",
		getSongs: function (b, c, g) {
			var h = arguments[arguments.length - 1] === g ? {} : arguments[arguments.length - 1];
			g = _.orEqual(g, true);
			if (this.songsLoaded) {
				var k = this.wrapManySongs(this.songs);
				if (!_.isEmpty(k) || this.songsUnverifiedLoaded) b(k);
				if (!g && !this.songsUnverifiedLoaded) {
					this.songsUnverifiedLoaded = true;
					GS.service.albumGetSongs(this.AlbumID, false, 0, this.callback(["wrapManySongs", "resetAlbumInfo", b]), c, h)
				}
			} else {
				this.songsLoaded = true;
				g ? GS.service.albumGetSongs(this.AlbumID, true, 0, this.callback(["wrapManyVerifiedSongs", "resetAlbumInfo", b]), c, h) : GS.service.albumGetSongs(this.AlbumID, false, 0, this.callback(["wrapManySongs", "resetAlbumInfo", b]), c, h)
			}
		},
		wrapManySongs: function (b, c) {
			c = _.orEqual(c, false);
			return this.wrapSongCollection(b, {
				isVerified: c ? 1 : -1,
				TrackNum: 0,
				AlbumName: this.AlbumName,
				AlbumID: this.AlbumID,
				Popularity: ""
			})
		},
		wrapManyVerifiedSongs: function (b) {
			return this.wrapManySongs(b, true)
		},
		play: function (b, c) {
			console.log("album.getsongs.play");
			this.getSongs(this.callback("playSongs", {
				index: b,
				playOnAdd: c,
				sort: "TrackNum",
				verified: true
			}))
		},
		resetAlbumInfo: function (b) {
			for (i = 0; i < b.length; i++) {
				b[i].AlbumName = this.AlbumName;
				b[i].AlbumID = this.AlbumID
			}
			return b
		},
		validate: function () {
			if (this.AlbumID > 0 && this.ArtistID > 0) return true;
			return false
		},
		init: function (b) {
			this._super(b);
			this.AlbumName = _.orEqual(b.AlbumName, b.Name || "");
			this.fanbase = GS.Models.Fanbase.wrap({
				objectID: this.AlbumID,
				objectType: "album"
			});
			this.songs = {};
			this.songsUnverifiedLoaded = this.songsLoaded = false;
			this.searchText = [this.AlbumName, this.ArtistName].join(" ").toLowerCase()
		},
		getDetailsForFeeds: function () {
			return {
				albumID: this.AlbumID,
				albumName: this.AlbumName,
				artistID: this.ArtistID,
				artistName: this.ArtistName,
				artFilename: this.ArtFilename
			}
		},
		toUrl: function (b) {
			return _.cleanUrl(this.AlbumName, this.AlbumID, "album", null, b)
		},
		toArtistUrl: function (b) {
			return _.cleanUrl(this.ArtistName, this.ArtistID, "artist", null, b)
		},
		getImageURL: function (b) {
			var c = gsConfig.assetHost + "/webincludes/images/default/album_250.png";
			b || (b = "l");
			if (this.CoverArtFilename) c = this.artPath + b + this.CoverArtFilename;
			return c
		},
		getTitle: function () {
			return ['"', this.AlbumName, '" by ', this.ArtistName].join("")
		},
		toString: function (b) {
			return (b = _.orEqual(b, false)) ? ["Album. alid: ", this.AlbumID, ", alname:", this.AlbumName, ", aid:", this.ArtistID, ", arname: ", this.ArtistName, ", verified: ", this.isVerified].join("") : _.getString("SELECTION_ALBUM_SINGLE", {
				AlbumName: _.cleanText(this.AlbumName),
				ArtistName: _.cleanText(this.ArtistName)
			})
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Artist", {
		id: "ArtistID",
		cache: {},
		defaults: {
			ArtistName: "",
			ArtistID: null,
			CoverArtFilename: "",
			isFavorite: 0,
			songsLoaded: false,
			songsUnverifiedLoaded: false,
			eventsLoaded: false,
			eventIDs: [],
			fanbase: null
		},
		getArtist: function (b, c, g, h) {
			var k = this.getOneFromCache(b);
			h = _.orEqual(h, true);
			if (k) c(k);
			else {
				h && a.publish("gs.page.loading.page");
				GS.service.getArtistByID(b, this.callback(["wrap", c]), g)
			}
		},
		getFilterAll: function () {
			return this.wrap({
				ArtistID: -1,
				ArtistName: a.localize.getString("ALL_ARTISTS"),
				isVerified: 2,
				isFilterAll: 1
			}, false)
		}
	}, {
		smallCollection: 10,
		getSongs: function (b, c, g) {
			var h = arguments[arguments.length - 1] === g ? {} : arguments[arguments.length - 1];
			g = _.orEqual(g, true);
			if (this.songsLoaded) {
				var k = this.wrapManySongs(this.songs);
				if (!_.isEmpty(k) || this.songsUnverifiedLoaded) b(k);
				if (!g && !this.songsUnverfiedLoaded) {
					this.songsUnverifiedLoaded = true;
					GS.service.artistGetSongs(this.ArtistID, false, 0, this.callback(["wrapManySongs", b]), c, h)
				}
			} else {
				this.songsLoaded = true;
				GS.service.artistGetSongs(this.ArtistID, true, 0, this.callback(["wrapManyVerifiedSongs", b]), c, h)
			}
		},
		wrap: function (b, c) {
			b = _.orEqual(b, {});
			try {
				delete b.AlbumID
			} catch (g) {}
			return this._super(b, c)
		},
		wrapManySongs: function (b, c) {
			c = _.orEqual(c, false);
			return this.wrapSongCollection(b, {
				isVerified: c ? 1 : -1,
				Popularity: ""
			})
		},
		wrapManyVerifiedSongs: function (b) {
			return this.wrapManySongs(b, true)
		},
		getEvent: function (b, c, g) {
			var h = arguments[arguments.length - 1] === g ? {} : arguments[arguments.length - 1];
			g = _.orEqual(g, true);
			if (this.eventsLoaded) {
				h = GS.Models.Event.getManyFromCache(this.eventIDs);
				b(h)
			} else {
				g && a.publish("gs.page.loading.grid");
				GS.service.artistGetEvents(this.ArtistID, this.ArtistName, this.callback([GS.Models.Event.wrapMany, b]), c, h)
			}
		},
		cacheAndReturnEvents: function (b) {
			for (var c = GS.Models.User.wrapMany(b.Users || b.Return.fans || b.Return), g = 0; g < c.length; g++) {
				var h = c[g];
				this.userIDs.push(h.UserID);
				GS.Models.User.cache[h.UserID] = h
			}
			if (_.defined(b.hasMore) && b.hasMore) {
				console.log("service has more. current page is: ", this.currentPage);
				this.currentPage++
			} else this.fansLoaded = true;
			return c
		},
		validate: function () {
			if (this.ArtistID > 0) return true;
			return false
		},
		init: function (b) {
			this._super(b);
			this.ArtistName = _.orEqual(b.ArtistName, b.Name || "");
			this.fanbase = GS.Models.Fanbase.wrap({
				objectID: this.ArtistID,
				objectType: "artist"
			});
			this.songs = {};
			this.songsUnverifiedLoaded = this.songsLoaded = false;
			this.eventIDs = [];
			this.eventsLoaded = false;
			this.searchText = this.ArtistName.toLowerCase()
		},
		getDetailsForFeeds: function () {
			return {
				artistID: this.ArtistID,
				artistName: this.ArtistName
			}
		},
		toUrl: function (b) {
			return _.cleanUrl(this.ArtistName, this.ArtistID, "artist", null, b)
		},
		getImageURL: function () {
			return gsConfig.assetHost + "/webincludes/images/default/artist_100.png"
		},
		getTitle: function () {
			return this.ArtistName
		},
		getContextMenu: function () {
			var b = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ARTIST, this);
			return [{
				title: a.localize.getString("CONTEXT_PLAY_ARTIST"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [];
							a.each(c, function (h, k) {
								g.push(k.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_DEFAULT, true, b)
						}, function () {}, false)
					})
				},
				customClass: "first"
			}, {
				title: a.localize.getString("CONTEXT_PLAY_ARTIST_NEXT"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [];
							a.each(c, function (h, k) {
								g.push(k.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_NEXT, false, b)
						}, function () {}, false)
					})
				}
			}, {
				title: a.localize.getString("CONTEXT_PLAY_ARTIST_LAST"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [];
							a.each(c, function (h, k) {
								g.push(k.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_LAST, false, b)
						}, function () {}, false)
					})
				}
			}, {
				customClass: "separator"
			}, {
				title: a.localize.getString("CONTEXT_REPLACE_ALL_SONGS"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [],
								h = GS.player.isPlaying;
							a.each(c, function (k, m) {
								g.push(m.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_REPLACE, h, b)
						}, function () {}, false)
					})
				}
			}]
		},
		toString: function (b) {
			return (b = _.orEqual(b, false)) ? ["Artist. aid:", this.ArtistID, ", arname: ", this.ArtistName].join("") : _.cleanText(this.ArtistName)
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Playlist", {
		id: "PlaylistID",
		cache: {},
		defaults: {
			PlaylistID: 0,
			PlaylistName: "",
			UserID: 0,
			Username: "",
			Description: "",
			NumSongs: 0,
			CoverArtFilename: "",
			Sort: null,
			isFavorite: 0,
			songs: [],
			originalOrder: [],
			songsLoaded: false,
			hasUnsavedChanges: false,
			searchText: "",
			fanbase: null,
			gridKey: 1,
			gridKeyLookup: {},
			songIDLookup: {},
			isDeleted: false,
			artPath: "http://beta.grooveshark.com/static/amazonart/"
		},
		playlistsLoaded: false,
		playlistIDs: [],
		getPlaylist: function (b, c, g, h) {
			var k = this.getOneFromCache(b);
			h = _.orEqual(h, true);
			if (k) c(k);
			else {
				h && a.publish("gs.page.loading.page");
				GS.service.getPlaylistByID(b, this.callback(["wrap", c]), g, {
					async: false
				})
			}
		},
		getPlaylistsOrdered: function (b, c) {
			c = _.orEqual(c, false);
			b = _.orEqual(b, "PlaylistName");
			var g = [];
			a.each(c === false ? GS.user.playlists : GS.user.favorites.playlists, function (h, k) {
				if (c) k.TSAdded = k.TSFavorited;
				g.push(k)
			});
			g.sort(function (h, k) {
				var m, o;
				try {
					m = h[b].toString().toLowerCase();
					o = k[b].toString().toLowerCase()
				} catch (r) {
					console.error("playlistOrdered error: " + r, b, h[b], k[b]);
					return 0
				}
				return m == o ? 0 : m > o ? 1 : -1
			});
			return g
		},
		getPlaylistsMenu: function (b, c, g, h) {
			b = a.makeArray(b);
			g = _.orEqual(g, false);
			h = _.orEqual(h, true);
			var k;
			k = [];
			if (h) {
				k.push({
					title: a.localize.getString("CONTEXT_NEW_PLAYLIST"),
					action: {
						type: "fn",
						callback: function () {
							GS.lightbox.open("newPlaylist", b)
						}
					},
					customClass: "first"
				});
				_.isEmpty(GS.user.playlists) || k.push({
					customClass: "separator"
				})
			}
			a.each(this.getPlaylistsOrdered("PlaylistName"), function (m, o) {
				k.push({
					title: o.PlaylistName,
					action: {
						type: "fn",
						callback: function () {
							c(o);
							return true
						}
					}
				})
			});
			g && a.each(this.getPlaylistsOrdered("PlaylistName", true), function (m, o) {
				k.push({
					title: o.PlaylistName,
					action: {
						type: "fn",
						callback: function () {
							c(o)
						}
					}
				})
			});
			return k
		}
	}, {
		init: function (b) {
			this._super(b);
			this.PlaylistName = _.defined(b.PlaylistName) ? _.cleanText(b.PlaylistName) : _.cleanText(b.Name);
			this.Description = _.orEqual(b.Description, b.About || "");
			this.fanbase = GS.Models.Fanbase.wrap({
				objectID: this.PlaylistID,
				objectType: "playlist"
			});
			this.searchText = [this.PlaylistName, this.Username, this.Description].join(" ").toLowerCase();
			this.songs = [];
			this.originalOrder = [];
			this.songsLoaded = _.orEqual(b.songsLoaded, false);
			this.hasUnsavedChanges = false;
			delete this.Name;
			delete this.About
		},
		getSongs: function (b, c, g) {
			var h = arguments[arguments.length - 1] === g ? {} : arguments[arguments.length - 1];
			g = _.orEqual(g, true);
			if (this.songsLoaded) b(this.songs);
			else {
				g && a.publish("gs.page.loading.grid");
				GS.service.playlistGetSongs(this.PlaylistID, this.callback(["wrapManySongs", b]), c, h)
			}
		},
		validate: function () {
			if (this.PlaylistID > 0) return true;
			return false
		},
		wrapManySongs: function (b) {
			var c = [];
			if (this.hasUnsavedChanges) c = this.songs;
			var g = b.Songs || b.songs || b.result || b;
			this.songs = [];
			this.gridKeyLookup = {};
			this.songIDLookup = {};
			var h;
			g.sort(function (k, m) {
				return parseFloat(k.Sort, 10) - parseFloat(m.Sort, 10)
			});
			for (h = 0; h < g.length; h++) {
				b = GS.Models.Song.wrap(g[h]).dupe();
				b.Sort = h;
				b.GridKey = this.gridKey;
				this.songs.push(b);
				this.gridKeyLookup[b.GridKey] = b;
				this.songIDLookup[b.SongID] = b;
				this.gridKey++
			}
			for (g = 0; g < c.length; g++) {
				b = c[g];
				b.Sort = g + h;
				b.GridKey = this.gridKey;
				c[g] = b;
				this.gridKeyLookup[b.GridKey] = b;
				this.songIDLookup[b.SongID] = b;
				this.gridKey++
			}
			this.originalOrder = this.songs.concat();
			this.songs = this.songs.concat(c);
			this.songsLoaded = true;
			a.publish("gs.playlist.songs.update", this);
			a.publish("gs.playlist.view.update", this);
			this.songs._use_call = true;
			return this.songs
		},
		reapplySorts: function () {
			for (var b = 0; b < this.songs.length; b++) this.songs[b].Sort = b
		},
		play: function (b, c) {
			console.log("playlist.getsongs.play");
			this.getSongs(this.callback("playSongs", {
				index: b,
				playOnAdd: c
			}))
		},
		playSongs: function (b) {
			_.orEqual(b.index, -1);
			_.orEqual(b.playOnAdd, false);
			var c = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, this),
				g, h = [];
			for (g = 0; g < this.songs.length; g++) h.push(this.songs[g].SongID);
			GS.player.addSongsToQueueAt(h, b.index, b.playOnAdd, c)
		},
		getImageURL: function () {
			return gsConfig.assetHost + "/webincludes/images/default/album_250.png"
		},
		addSongAtEnd: function (b) {
			this.hasUnsavedChanges && this.addSongs([b], this.songs.length, true);
			if (GS.user.UserID != this.UserID) return false;
			if (!(b <= 0)) {
				GS.guts.logEvent("songAddedToPlaylist", {
					songID: b
				});
				if (this.songsLoaded) {
					var c;
					c = GS.Models.Song.getOneFromCache(b).dupe();
					c.GridKey = this.gridKey;
					this.gridKeyLookup[c.GridKey] = c;
					this.songIDLookup[c.SongID] = c;
					this.gridKey++;
					this.hasUnsavedChanges = true;
					GS.Controllers.PageController.ALLOW_LOAD = false;
					this.songs.push(c);
					this.reapplySorts();
					GS.user.isLoggedIn ? GS.service.playlistAddSongToExisting(this.PlaylistID, b, this.callback("saveSuccess"), this.callback("saveFailed")) : this.saveSuccess();
					a.publish("gs.playlist.view.update", this)
				} else if (GS.user.isLoggedIn) GS.service.playlistAddSongToExisting(this.PlaylistID, b, this.callback("addSongSuccess"), this.callback("saveFailed"));
				else {
					console.warn("PLAYLIST addSong", this.songsLoaded, GS.user.isLoggedIn);
					return false
				}
			}
		},
		addSongs: function (b, c, g) {
			c = _.orEqual(c, this.songs.length);
			g = _.orEqual(g, false);
			if (b.length == 1 && !this.hasUnsavedChanges && g && c == this.songs.length) this.addSongAtEnd(b[0]);
			else {
				if (GS.user.UserID != this.UserID) return false;
				for (var h, k = [], m = 0; m < b.length; m++) if (!(b[m] <= 0)) {
					h = GS.Models.Song.getOneFromCache(b[m]).dupe();
					h.GridKey = this.gridKey;
					this.gridKeyLookup[h.GridKey] = h;
					this.songIDLookup[h.SongID] = h;
					this.gridKey++;
					k.push(h);
					GS.guts.logEvent("songAddedToPlaylist", {
						songID: h.SongID
					})
				}
				this.hasUnsavedChanges = true;
				GS.Controllers.PageController.ALLOW_LOAD = false;
				this.songs.splice.apply(this.songs, [c, 0].concat(k));
				this.reapplySorts();
				g && this.save();
				a.publish("gs.playlist.view.update", this)
			}
		},
		removeSongs: function (b, c) {
			if (GS.user.UserID != this.UserID) return false;
			c = _.orEqual(c, false);
			this.hasUnsavedChanges = true;
			GS.Controllers.PageController.ALLOW_LOAD = false;
			for (var g, h = 0; h < b.length; h++) if (g = this.songs[b[h]]) g.isDeleted = true;
			this.reapplySorts();
			c && this.save();
			a.publish("gs.playlist.view.update", this)
		},
		moveSongsTo: function (b, c, g) {
			if (GS.user.UserID != this.UserID) return false;
			g = _.orEqual(g, false);
			this.hasUnsavedChanges = true;
			GS.Controllers.PageController.ALLOW_LOAD = false;
			var h, k = [];
			for (h = 0; h < b.length; h++) k.push(this.songs[b[h]]);
			for (h = 0; h < k.length; h++) {
				b = this.songs.indexOf(k[h]);
				this.songs.splice(b, 1);
				b < c && c--
			}
			this.songs.splice.apply(this.songs, [c, 0].concat(k));
			this.reapplySorts();
			g && this.save();
			a.publish("gs.playlist.view.update", this)
		},
		save: function () {
			console.log("PLAYLIST save, loaded?", this.songsLoaded);
			if (this.songsLoaded) {
				var b, c = [],
					g = [];
				for (b = 0; b < this.songs.length; b++) this.songs[b].isDeleted ? GS.guts.logEvent("songRemovedFromPlaylist", {
					songID: this.songs[b].SongID
				}) : c.push(this.songs[b].SongID);
				for (b = 0; b < this.originalOrder.length; b++) g.push(this.originalOrder[b].SongID);
				if (c.join(".") == g.join(".")) {
					this.originalOrder = this.songs.concat();
					this.hasUnsavedChanges = false;
					GS.Controllers.PageController.ALLOW_LOAD = true;
					a.publish("gs.playlist.view.update", this)
				} else {
					GS.user.isLoggedIn ? GS.service.overwritePlaylist(this.PlaylistID, c, this.callback("saveSuccess"), this.callback("saveFailed")) : this.saveSuccess();
					GS.guts.gaTrackEvent("playlist", "savePlaylist")
				}
			} else this.getSongs(this.callback("save"), this.callback("saveFailed"), false)
		},
		saveSuccess: function () {
			for (var b = [], c = 0; c < this.songs.length; c++) this.songs[c].isDeleted || b.push(this.songs[c]);
			this.songsLoaded = true;
			this.songs = b;
			this.originalOrder = this.songs.concat();
			this.hasUnsavedChanges = false;
			GS.Controllers.PageController.ALLOW_LOAD = true;
			b = (new GS.Models.DataString(a.localize.getString("POPUP_SAVE_PLAYLIST_MSG"), {
				playlist: this.PlaylistName
			})).render();
			a.publish("gs.notification", {
				type: "notice",
				message: b
			});
			a.publish("gs.playlist.songs.update", this);
			a.publish("gs.playlist.view.update", this)
		},
		addSongSuccess: function () {
			var b = (new GS.Models.DataString(a.localize.getString("POPUP_SAVE_PLAYLIST_MSG"), {
				playlist: this.PlaylistName
			})).render();
			a.publish("gs.notification", {
				type: "notice",
				message: b
			});
			a.publish("gs.playlist.songs.update", this);
			a.publish("gs.playlist.view.update", this)
		},
		saveFailed: function () {
			a.publish("gs.notification", {
				type: "error",
				message: a.localize.getString("POPUP_FAIL_SAVE_PLAYLIST_MSG")
			})
		},
		remove: function (b) {
			GS.user.deletePlaylist(this.PlaylistID, b);
			GS.guts.logEvent("playlistDeleted", {
				playlistID: this.PlaylistID
			})
		},
		restore: function (b) {
			GS.user.restorePlaylist(this.PlaylistID, b)
		},
		undo: function () {
			this.songs = this.originalOrder.concat();
			for (var b = 0; b < this.songs.length; b++) this.songs[b].isDeleted = false;
			this.hasUnsavedChanges = false;
			GS.Controllers.PageController.ALLOW_LOAD = true;
			this.reapplySorts();
			a.publish("gs.playlist.songs.update", this);
			a.publish("gs.playlist.view.update", this)
		},
		rename: function (b, c, g) {
			GS.service.renamePlaylist(this.PlaylistID, b, this.callback([this._renameSuccess, c], b), this.callback([this._renameFailed, g]))
		},
		_renameSuccess: function (b, c) {
			console.log("playlist.rename.success", c);
			this.PlaylistName = b;
			a.publish("gs.playlist.view.update", this);
			a.publish("gs.auth.playlists.update", this);
			return c
		},
		_renameFailed: function (b) {
			console.log("playlist.rename.failed", b);
			return b
		},
		changeDescription: function (b, c, g) {
			GS.service.setPlaylistAbout(this.PlaylistID, b, this.callback([this._changeDescSuccess, c], b), this.callback([this._changeDescFailed, g]))
		},
		_changeDescSuccess: function (b, c) {
			console.log("playlist.changeDescription.success", c);
			this.Description = b;
			a.publish("gs.playlist.view.update", this);
			return c
		},
		_changeDescFailed: function (b) {
			console.log("playlist.changeDescription.failed", b);
			return b
		},
		getDetailsForFeeds: function () {
			return {
				playlistID: this.PlaylistID,
				playlistName: this.PlaylistName,
				userID: this.UserID,
				username: this.Username,
				description: this.Description
			}
		},
		getTitle: function () {
			return ['"', this.PlaylistName, '" by ', this.Username].join("")
		},
		isSubscribed: function () {
			return GS.user.UserID != this.UserID && this.isFavorite || !_.isEmpty(GS.user.favorites.playlists[this.PlaylistID])
		},
		subscribe: function () {
			GS.user.addToPlaylistFavorites(this.PlaylistID)
		},
		unsubscribe: function () {
			GS.user.removeFromPlaylistFavorites(this.PlaylistID)
		},
		isShortcut: function () {
			return a.inArray(this.PlaylistID.toString(), GS.user.sidebar.playlists) > -1 || a.inArray(this.PlaylistID.toString(), GS.user.sidebar.subscribedPlaylists) > -1
		},
		addShortcut: function (b) {
			GS.user.addToShortcuts("playlist", this.PlaylistID, b)
		},
		removeShortcut: function (b) {
			GS.user.removeFromShortcuts("playlist", this.PlaylistID, b)
		},
		getContextMenu: function () {
			var b = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, this);
			return [{
				title: a.localize.getString("CONTEXT_PLAY_PLAYLIST"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [];
							a.each(c, function (h, k) {
								g.push(k.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_DEFAULT, true, b)
						}, function () {}, false)
					})
				},
				customClass: "first"
			}, {
				title: a.localize.getString("CONTEXT_PLAY_PLAYLIST_NEXT"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [];
							a.each(c, function (h, k) {
								g.push(k.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_NEXT, false, b)
						}, function () {}, false)
					})
				}
			}, {
				title: a.localize.getString("CONTEXT_PLAY_PLAYLIST_LAST"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [];
							a.each(c, function (h, k) {
								g.push(k.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_LAST, false, b)
						}, function () {}, false)
					})
				}
			}, {
				customClass: "separator"
			}, {
				title: a.localize.getString("SHARE_PLAYLIST"),
				type: "sub",
				src: [{
					title: a.localize.getString("SHARE_EMAIL"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "email",
								type: "playlist",
								id: this.PlaylistID
							})
						})
					},
					customClass: "first"
				}, {
					title: a.localize.getString("SHARE_FACEBOOK"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "facebook",
								type: "playlist",
								id: this.PlaylistID
							})
						})
					}
				}, {
					title: a.localize.getString("SHARE_TWITTER"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.lightbox.open("share", {
								service: "twitter",
								type: "playlist",
								id: this.PlaylistID
							})
						})
					}
				}, {
					title: a.localize.getString("SHARE_STUMBLEUPON"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							window.open(_.makeUrlForShare("stumbleupon", "playlist", this), "_blank")
						})
					}
				}, {
					title: a.localize.getString("SHARE_REDDIT"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							window.open(_.makeUrlForShare("reddit", "playlist", this), "_blank")
						})
					}
				}, {
					title: a.localize.getString("SHARE_WIDGET"),
					action: {
						type: "fn",
						callback: this.callback(function () {
							window.contextClipboard || GS.lightbox.open("share", {
								service: "widget",
								type: "playlist",
								id: this.PlaylistID
							})
						})
					}
				}]
			}, {
				title: a.localize.getString("CONTEXT_REPLACE_ALL_SONGS"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.getSongs(function (c) {
							var g = [],
								h = GS.player.isPlaying;
							a.each(c, function (k, m) {
								g.push(m.SongID)
							});
							GS.player.addSongsToQueueAt(g, GS.player.INDEX_REPLACE, h, b)
						}, function () {}, false)
					})
				},
				customClass: "last"
			}]
		},
		toUrl: function (b) {
			return _.cleanUrl(this.PlaylistName, this.PlaylistID, "playlist", null, b)
		},
		toUserUrl: function (b) {
			return _.cleanUrl(this.Username, this.UserID, "user", null, b)
		},
		toString: function (b) {
			return (b = _.orEqual(b, false)) ? ["Playlist. pid: ", this.PlaylistID, ", pname:", this.PlaylistName, ", uid:", this.UserID, ", uname: ", this.Username].join("") : _.getString("SELECTION_PLAYLIST_SINGLE", {
				PlaylistName: _.cleanText(this.PlaylistName),
				Username: _.cleanText(this.Username)
			})
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Popular", {
		cache: {},
		getType: function (b) {
			var c = this.getOneFromCache(b);
			if (!c) {
				c = this.wrap({
					type: b
				});
				this.cache[b] = c
			}
			return c
		}
	}, {
		type: null,
		songsLoaded: false,
		init: function (b) {
			this._super(b);
			this.songsLoaded = false;
			this.songs = []
		},
		getSongs: function (b, c, g) {
			g = _.orEqual(g, true);
			if (this.songsLoaded) {
				this.songs = this.wrapSongCollection(this.songs, {
					Popularity: 0,
					Weight: "",
					NumPlays: "",
					isVerified: -1
				});
				b(this.songs)
			} else {
				g && a.publish("gs.page.loading.grid");
				GS.service.popularGetSongs(this.type, this.callback(["wrapManySongs", b]), c)
			}
		},
		wrapManySongs: function (b) {
			return this.wrapSongCollection(b, {
				USE_INDEX: "Popularity",
				Weight: "",
				NumPlays: "",
				isVerified: -1
			})
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.User", {
		id: "UserID",
		cache: {},
		usersLoaded: false,
		userIDs: [],
		artPath: "http://beta.grooveshark.com/static/userimages/",
		defaults: {
			UserID: 0,
			Username: "",
			Name: "",
			FName: "",
			LName: "",
			Picture: "",
			IsPremium: 0,
			SignupDate: null,
			Location: "",
			Sex: "",
			FollowingFlags: 0,
			Flags: 0,
			isFavorite: 0,
			artPath: "http://beta.grooveshark.com/static/userimages/",
			library: null,
			favorites: {
				songs: {},
				albums: {},
				artists: {},
				playlists: {},
				users: {}
			},
			fanbase: null,
			playlists: {},
			profileFeed: {},
			communityFeed: {}
		},
		getUser: function (b, c, g, h) {
			var k = this.getOneFromCache(b);
			h = _.orEqual(h, true);
			if (k) c(k);
			else {
				h && a.publish("gs.page.loading.page");
				GS.service.getUserByID(b, this.callback(["wrapProxy", c]), g)
			}
		},
		getUserByUsername: function (b, c, g, h) {
			var k = this.getOneFromCache(b);
			h = _.orEqual(h, true);
			if (k) {
				console.log("get user from cache");
				c(k)
			} else {
				h && a.publish("gs.page.loading.page");
				GS.service.getUserByUsername(b, this.callback(["wrapProxy", c]), g)
			}
		},
		wrapProxy: function (b) {
			return this.wrap(b.User || b)
		},
		FLAG_PLUS: 1,
		FLAG_LASTFM: 2,
		FLAG_FACEBOOK: 4,
		FLAG_FACEBOOKUSER: 16,
		FLAG_GOOGLEUSER: 32,
		FLAG_GOOGLE: 64,
		FLAG_ANYWHERE: 128,
		FLAG_ISARTIST: 256
	}, {
		validate: function () {
			if (this.UserID > 0 && this.Username.length > 0) return true;
			return false
		},
		init: function (b) {
			this._super(b);
			b = _.orEqual(this.City, "");
			b += this.State && b.length ? ", " + this.State : _.orEqual(this.State, "");
			b += this.Country && b.length ? ", " + this.Country : _.orEqual(this.Country, "");
			this.Name = _.cleanText(_.orEqual(this.Name, (this.FName || "") + " " + (this.LName || "")));
			this.Location = b;
			this.IsPremium = this.IsPremium == 1 ? 1 : 0;
			this.library = GS.Models.Library.wrap({
				userID: this.UserID
			});
			this.fanbase = GS.Models.Fanbase.wrap({
				objectID: this.UserID,
				objectType: "user"
			});
			this.profileFeed = GS.Models.Feed.wrap({
				user: this
			});
			this.communityFeed = GS.Models.Feed.wrap({
				user: this
			});
			this.recentActiveUsersFeed = GS.Models.Feed.wrap({
				user: this
			});
			this.searchText = [this.Username, this.Locale, this.FName, this.LName].join(" ").toLowerCase();
			this.playlists = {};
			this.favorites = {
				songs: {},
				albums: {},
				artists: {},
				playlists: {},
				users: {}
			}
		},
		autocompleteFavoriteUsers: function () {
			var b = [];
			a.each(this.favorites.users, function (c, g) {
				a.each(g.searchText.trim().split(), function (h, k) {
					b.push([k.trim(), g.UserID])
				})
			});
			return b
		},
		getFavoritesByType: function (b, c, g) {
			var h = arguments[arguments.length - 1] === g ? {} : arguments[arguments.length - 1];
			if (_.isEmpty(this.favorites[b.toLowerCase()])) GS.service.getFavorites(this.UserID, b, this.callback(["load" + b + "Favorites", c]), g, h);
			else {
				h = this.favorites[b.toLowerCase()];
				GS.Models[b.substring(0, b.length - 1)].wrapCollectionInObject(h, {
					TSFavorited: "",
					TSAdded: ""
				});
				h = this.favorites[b.toLowerCase()];
				c(h)
			}
		},
		loadAlbumsFavorites: function (b) {
			var c = {};
			for (var g in b) if (b.hasOwnProperty(g)) {
				b[g].TSAdded = b[g].TSFavorited;
				c[b[g].AlbumID] = b[g]
			}
			this.favorites.albums = GS.Models.Album.wrapCollectionInObject(c, {
				TSFavorited: "",
				TSAdded: "",
				isFavorite: this.isAuth ? 1 : 0
			});
			return this.favorites.albums
		},
		loadArtistsFavorites: function (b) {
			var c = {};
			for (var g in b) if (b.hasOwnProperty(g)) {
				b[g].TSAdded = b[g].TSFavorited;
				c[b[g].ArtistID] = b[g]
			}
			this.favorites.artists = GS.Models.Artist.wrapCollectionInObject(c, {
				TSFavorited: "",
				TSAdded: "",
				isFavorite: this.isAuth ? 1 : 0
			});
			return this.favorites.artists
		},
		loadPlaylistsFavorites: function (b) {
			var c = {};
			for (var g in b) if (b.hasOwnProperty(g)) {
				b[g].TSAdded = b[g].TSFavorited;
				c[b[g].PlaylistID] = b[g]
			}
			this.favorites.playlists = GS.Models.Playlist.wrapCollectionInObject(c, {
				TSFavorited: "",
				TSAdded: "",
				isFavorite: this.isAuth ? 1 : 0
			});
			return this.favorites.playlists
		},
		loadSongsFavorites: function (b) {
			var c = {};
			for (var g in b) if (b.hasOwnProperty(g)) {
				b[g].TSAdded = b[g].TSFavorited;
				c[b[g].SongID] = b[g]
			}
			this.favorites.songs = GS.Models.Song.wrapCollectionInObject(c, {
				TSFavorited: "",
				TSAdded: ""
			});
			for (g in this.favorites.songs) if (this.favorites.songs.hasOwnProperty(g)) {
				b = this.favorites.songs[g];
				if (this.isAuth) {
					b.isFavorite = 1;
					b.fromLibrary = 1
				}
				this.library.songs[b.SongID] = b.dupe()
			}
			return this.favorites.songs
		},
		loadUsersFavorites: function (b) {
			var c = {};
			for (var g in b) if (b.hasOwnProperty(g)) {
				b[g].TSAdded = b[g].TSFavorited;
				b[g].FollowingFlags = parseInt(b[g].FollowingFlags, 10);
				c[b[g].UserID] = b[g]
			}
			this.favorites.users = GS.Models.User.wrapCollectionInObject(c, {
				TSFavorited: "",
				TSAdded: "",
				isFavorite: this.isAuth ? 1 : 0,
				FollowingFlags: 0
			});
			return this.favorites.users
		},
		getPlaylists: function (b, c) {
			_.isEmpty(this.playlists) ? GS.service.userGetPlaylists(this.UserID, this.callback(["cachePlaylists", b]), c) : b()
		},
		cachePlaylists: function (b) {
			var c = {};
			b = b.Playlists;
			for (var g in b) if (b.hasOwnProperty(g)) {
				b[g].Username = this.Username;
				b[g].UserID = this.UserID;
				c[b[g].PlaylistID] = b[g]
			}
			this.playlists = GS.Models.Playlist.wrapCollectionInObject(c)
		},
		getProfileFeed: function (b, c) {
			this.profileFeed.getProfileFeed(this.callback(b), c)
		},
		getCommunityFeed: function (b, c) {
			var g;
			g = this.isAuth ? this.filterOutFriends(1) : this.favorites.users;
			g = _.toArrayID(g);
			g.length ? this.communityFeed.getCommunityFeed(g, this.callback(b), c) : this.communityFeed.getRecentlyActiveUsersFeed(this.callback(b), c)
		},
		filterFriends: function (b) {
			var c = {};
			for (var g in this.favorites.users) if (this.favorites.users[g].FollowingFlags & b) c[g] = this.favorites.users[g];
			return c
		},
		filterOutFriends: function (b) {
			var c = {};
			for (var g in this.favorites.users) this.favorites.users[g].FollowingFlags & b || (c[g] = this.favorites.users[g]);
			return c
		},
		getRecentlyActiveUsersFeed: function (b, c) {
			this.recentActiveUsersFeed.getRecentlyActiveUsersFeed(this.callback(b), c)
		},
		getUserPackage: function () {
			var b = "";
			if (this.Flags & GS.Models.User.FLAG_ANYWHERE) b = "anywhere";
			else if (this.Flags & GS.Models.User.FLAG_PLUS) b = "plus";
			return b
		},
		toUrl: function (b) {
			return _.cleanUrl(this.Username, this.UserID, "user", null, b)
		},
		getImageURL: function (b) {
			var c = gsConfig.assetHost + "/webincludes/images/default/user_100.png";
			b = _.orEqual(b, "m");
			if (this.Picture) c = GS.Models.User.artPath + b + this.Picture;
			else if (b === "l") c = gsConfig.assetHost + "/webincludes/images/default/user_250.png";
			return c
		},
		getDetailsForFeeds: function () {
			return {
				userID: this.UserID,
				username: this.Username,
				isPremium: this.IsPremium,
				location: this.location,
				imageURL: this.getImageURL()
			}
		},
		getTitle: function () {
			return this.Username
		},
		toString: function (b) {
			return (b = _.orEqual(b, false)) ? ["User. uid: ", this.UserID, ", uname:", this.Username, this.FName, this.LName].join("") : _.cleanText(this.Username)
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Library", {}, {
		currentPage: 0,
		userID: null,
		lastModified: 0,
		songsLoaded: false,
		init: function (b) {
			this._super(b);
			this.songsLoaded = false
		},
		getSongs: function (b, c, g) {
			g = _.orEqual(g, true);
			if (this.songsLoaded) {
				this.songs = this.wrapSongCollection(this.songs, {
					TSAdded: "",
					TSFavorited: ""
				});
				b(this.songs)
			} else {
				g && this.currentPage === 0 && a.publish("gs.page.loading.grid");
				GS.service.userGetSongsInLibrary(this.userID, this.currentPage, this.callback(["saveLastModified", "loadSongs", b]), c)
			}
		},
		loadSongs: function (b) {
			return this.wrapSongCollection(b, {
				TSAdded: "",
				TSFavorited: "",
				fromLibrary: GS.user.UserID == this.userID ? 1 : 0
			})
		},
		saveLastModified: function (b) {
			this.lastModified = b.TSModified;
			return b
		},
		refreshLibrary: function (b) {
			if (b.TSModified > this.lastModified) {
				console.log("library is stale");
				this.currentPage = 0;
				this.songsLoaded = false;
				this.getSongs(this.callback("loadLibrary"), false, false)
			} else console.log("library is the freshens")
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Station", {
		TAG_STATIONS: {
			9: "STATION_90S_ALT_ROCK",
			13: "STATION_ALTERNATIVE",
			75: "STATION_AMBIENT",
			96: "STATION_BLUEGRASS",
			230: "STATION_BLUES",
			750: "STATION_CLASSICAL",
			3529: "STATION_CLASSIC_ROCK",
			80: "STATION_COUNTRY",
			67: "STATION_ELECTRONICA",
			191: "STATION_EXPERIMENTAL",
			122: "STATION_FOLK",
			29: "STATION_HIP_HOP",
			136: "STATION_INDIE",
			43: "STATION_JAZZ",
			528: "STATION_LATIN",
			17: "STATION_METAL",
			102: "STATION_OLDIES",
			56: "STATION_POP",
			111: "STATION_PUNK",
			3: "STATION_RAP",
			160: "STATION_REGGAE",
			4: "STATION_RNB",
			12: "STATION_ROCK",
			69: "STATION_TRANCE"
		},
		getStationsMenu: function () {
			var b = [];
			a.each(GS.Models.Station.TAG_STATIONS, this.callback(function (c, g) {
				b.push({
					title: a.localize.getString(g),
					action: {
						type: "fn",
						callback: this.callback(function () {
							GS.user.addToShortcuts("station", c, true)
						})
					}
				})
			}));
			b.sort(function (c, g) {
				var h = c.title.toLowerCase(),
					k = g.title.toLowerCase();
				return h == k ? 0 : h > k ? 1 : -1
			});
			return b
		}
	}, {
		StationID: 0,
		TagID: 0,
		StationTitle: "",
		Artists: [],
		init: function (b) {
			this._super(b)
		}
	})
})(jQuery);
(function (a) {
	a.Model.extend("GS.Models.PlayContext", {}, {
		type: null,
		data: null,
		init: function (b, c) {
			this.type = _.orEqual(b, "unknown");
			this.data = _.orEqual(c, {});
			if (a.isFunction(this.data.getDetailsForFeeds)) this.data = this.data.getDetailsForFeeds()
		}
	})
})(jQuery);
(function (a) {
	a.fn.dataString = function () {
		if (arguments.length === 0) return _.orEqual(this.data("DataString"), null);
		var b = new GS.Models.DataString(arguments[0], arguments[1]);
		b.hookup(this);
		return b
	};
	a.fn.localeDataString = function (b, c, g) {
		b = _.orEqual(b, "");
		c = _.orEqual(c, {});
		g = _.orEqual(g, false);
		var h = a(this).dataString();
		if (!h) {
			h = new GS.Models.DataString;
			h.hookup(this)
		}
		h.string = a.localize.getString(b);
		h.data = c;
		g ? a(this).attr("data-translate-title", b).attr("title", h.render()) : a(this).attr("data-translate-text", b).html(h.render());
		return h
	};
	a.Model.extend("GS.Models.DataString", {}, {
		string: null,
		data: null,
		element: null,
		init: function (b, c) {
			this.string = _.orEqual(b, "");
			this.data = _.orEqual(c, {})
		},
		setString: function (b) {
			this.string = b;
			this.render()
		},
		setData: function (b, c) {
			this.data[b] = c;
			this.render()
		},
		hookup: function (b) {
			this.element = a(b);
			this.element.data("DataString", this)
		},
		render: function () {
			for (var b = this.string, c = [], g; b;) {
				if (g = /^[^\{]+/.exec(b)) c.push(g[0]);
				else if (g = /^\{(.*?)\}/.exec(b)) {
					var h = g[1];
					this.data[h] ? c.push(this.data[h]) : c.push(g[0])
				} else throw "Error rendering data object";
				b = b.substring(g[0].length)
			}
			b = c.join("");
			if (this.element) this.element.attr("tagName") == "INPUT" ? this.element.val(b) : this.element.html(b);
			return b
		}
	})
})(jQuery);
(function (a) {
	GS.Models.User.extend("GS.Models.AuthUser", {
		id: "AuthUserID",
		cache: {},
		loggedOutPlaylistCount: 0,
		wrap: function (b) {
			return this._super(b, false)
		},
		wrapFromService: function (b) {
			return this.wrap(a.extend({}, b, {
				Email: b.Email || b.email,
				Sex: b.Sex || b.sex,
				UserID: b.UserID || b.userID,
				Username: b.Username || b.username,
				IsPremium: b.IsPremium || b.isPremium,
				FName: b.FName || b.fName,
				LName: b.LName || b.lName,
				TSDOB: b.TSDOB || b.tsDOB,
				Privacy: _.orEqualEx(b.Privacy, b.privacy, 0)
			}))
		}
	}, {
		authRealm: 1,
		authToken: "",
		autoAutoplay: false,
		badAuthToken: false,
		favoritesLimit: 500,
		librarySizeLimit: 5E3,
		themeID: "",
		uploadsEnabled: 0,
		UserID: -1,
		Username: "New User",
		Email: "",
		City: "",
		Country: "",
		State: "",
		TSDOB: "",
		Privacy: 0,
		Flags: 0,
		settings: null,
		isLoggedIn: false,
		isAuth: true,
		artistsPlayed: [],
		defaultStations: ["750", "12", "136", "3", "56", "67"],
		init: function (b) {
			this._super(b);
			this.refreshLibraryStatic = this.callback(this.refreshLibrary);
			this.library.songs = {};
			this.playlists = {};
			this.favorites = {
				songs: {},
				albums: {},
				artists: {},
				playlists: {},
				users: {}
			};
			this.sidebarLoaded = false;
			this.sidebar = {
				playlists: [],
				stations: [],
				subscribedPlaylists: []
			};
			this.settings = GS.Models.UserSettings.wrap({
				UserID: this.UserID
			});
			this.lastSeenFeedEvent = (b = store.get("lastSeenFeedEvent" + this.UserID)) ? b : 0;
			this.unseenFeedEvents = this.unseenFeedEventTimeout = 0;
			if (this.UserID > 0) {
				this.isLoggedIn = true;
				this.getPlaylists();
				this.getFavorites();
				this.getSidebar();
				this.getLibrary()
			} else {
				this.isDirty = this.isLoggedIn = false;
				this.sidebarLoaded = true;
				this.sidebar.stations = this.defaultStations.concat()
			}
			this.artistsPlayed = store.get("artistsPlayed" + this.UserID) || [];
			a.subscribe("gs.player.nowplaying", this.callback(this.onSongPlay));
			setTimeout(function () {
				a.publish("gs.auth.stations.update")
			}, 10);
			this.checkVipExpiring();
			window.reportUploadComplete = window.uploadComplete = this.callback(function () {
				location.hash = this.toUrl("music").substring(1);
				this.library.lastModified = 0;
				this.getLibrary()
			})
		},
		onSongPlay: function (b) {
			if (b && b.artistID) {
				var c = this.artistsPlayed.indexOf(b.artistID);
				c != -1 && this.artistsPlayed.splice(c, 1);
				this.artistsPlayed.unshift(b.artistID);
				this.artistsPlayed.splice(999, 1)
			}
		},
		storeData: function () {
			if (_.isEmpty(this.library.songs)) c = null;
			else {
				var b = new Date,
					c = {
						currentPage: this.library.currentPage,
						songsLoaded: this.library.songsLoaded,
						userID: this.library.userID,
						lastModified: this.library.lastModified,
						songs: {}
					};
				for (var g in this.library.songs) if (this.library.songs.hasOwnProperty(g)) c.songs[g] = GS.Models.Song.archive(this.library.songs[g])
			}
			try {
				this.settings.changeLocalSettings({});
				store.set("artistsPlayed" + this.UserID, this.artistsPlayed);
				store.set("lastSeenFeedEvent" + this.UserID, this.lastSeenFeedEvent);
				store.set("library" + this.UserID, c);
				console.log("stored data in: " + (new Date - b) + " milliseconds")
			} catch (h) {
				console.error(h);
				a.publish("gs.auth.store.failure")
			}
		},
		clearData: function () {
			store.remove("library" + this.UserID);
			store.remove("lastSeenFeedEvent" + this.UserID)
		},
		createPlaylist: function (b, c, g, h, k, m) {
			m = _.orEqual(m, true);
			c = _.orEqual(c, []);
			if (this.isLoggedIn) GS.service.createPlaylist(b, c, g, this.callback(["createPlaylistSuccess"], {
				callback: h,
				name: b,
				songIDs: c,
				description: g,
				notify: m
			}), k);
			else {
				GS.Models.AuthUser.loggedOutPlaylistCount++;
				g = GS.Models.Playlist.wrap({
					PlaylistID: -GS.Models.AuthUser.loggedOutPlaylistCount,
					PlaylistName: b,
					Username: this.Username,
					UserID: this.UserID,
					songsLoaded: true,
					TSAdded: (new Date).format("Y-m-d G:i:s"),
					Description: g
				});
				g.addSongs(c, 0, true);
				this.playlists[g.PlaylistID] = g;
				this.isDirty = true;
				a.publish("gs.auth.playlists.update");
				m && a.publish("gs.notification.playlist.create", g);
				h(g)
			}
			GS.guts.logEvent("playlistCreated", {
				playlistName: b
			});
			GS.guts.gaTrackEvent("user", "newPlaylist")
		},
		createPlaylistSuccess: function (b, c) {
			var g = GS.Models.Playlist.wrap({
				PlaylistID: c,
				PlaylistName: b.name,
				Description: b.description,
				UserID: this.UserID,
				Username: this.Username,
				TSAdded: (new Date).format("Y-m-d G:i:s"),
				NumSongs: b.songIDs.length
			});
			this.playlists[g.PlaylistID] = g;
			a.publish("gs.auth.playlists.update");
			b.notify && a.publish("gs.notification.playlist.create", g);
			b.callback(g)
		},
		deletePlaylist: function (b, c) {
			var g = GS.Models.Playlist.getOneFromCache(b);
			if (g && g.UserID === this.UserID) {
				c = _.orEqual(c, true);
				if (this.isLoggedIn) GS.service.deletePlaylist(g.PlaylistID, g.PlaylistName, this.callback(function () {
					g.isDeleted = true;
					g.removeShortcut(false);
					delete this.playlists[g.PlaylistID];
					a.publish("gs.playlist.view.update", g);
					a.publish("gs.auth.playlists.update");
					a.publish("gs.user.playlist.remove");
					if (c) {
						var h = (new GS.Models.DataString(a.localize.getString("POPUP_DELETE_PLAYLIST_MSG"), {
							playlist: g.PlaylistName
						})).render();
						a.publish("gs.notification", {
							type: "notice",
							message: h
						})
					}
				}), this.callback(function () {
					g.isDeleted = false;
					if (c) {
						var h = (new GS.Models.DataString(a.localize.getString("POPUP_FAIL_DELETE_PLAYLIST_MSG"), {
							playlist: g.PlaylistName
						})).render();
						a.publish("gs.notification", {
							type: "error",
							message: h
						})
					}
				}));
				else {
					g.isDeleted = true;
					g.removeShortcut(false);
					delete this.playlists[g.PlaylistID];
					a.publish("gs.playlist.view.update", g);
					a.publish("gs.auth.playlists.update");
					a.publish("gs.user.playlist.remove");
					c && a.publish("gs.notification", {
						type: "notice",
						message: a.localize.getString("NOTIFICATION_PLAYLIST_DELETED")
					})
				}
			}
			GS.guts.gaTrackEvent("user", "deletePlaylist")
		},
		restorePlaylist: function (b, c) {
			var g = GS.Models.Playlist.getOneFromCache(b);
			if (g && g.UserID === this.UserID) {
				c = _.orEqual(c, true);
				if (this.isLoggedIn) GS.service.playlistUndelete(g.PlaylistID, this.callback(function () {
					g.isDeleted = false;
					this.playlists[g.PlaylistID] = g;
					a.publish("gs.playlist.view.update", g);
					c && a.publish("gs.notification", {
						type: "notice",
						message: a.localize.getString("NOTIFICATION_PLAYLIST_RESTORED")
					})
				}), function () {
					c && a.publish("gs.notification", {
						type: "error",
						message: a.localize.getString("NOTIFICATION_PLAYLIST_RESTORE_FAIL")
					})
				});
				else {
					g.isDeleted = false;
					this.playlists[g.PlaylistID] = g;
					a.publish("gs.playlist.view.update", g);
					c && a.publish("gs.notification", {
						type: "notice",
						message: a.localize.getString("NOTIFICATION_PLAYLIST_RESTORED")
					})
				}
			}
			GS.guts.gaTrackEvent("user", "restorePlaylist")
		},
		getSidebar: function () {
			GS.service.getUserSidebar(this.callback("loadSidebar"))
		},
		loadSidebar: function (b) {
			this.sidebarLoaded = true;
			this.sidebar = b;
			a.publish("gs.auth.sidebar.loaded");
			if (this.sidebar.stations.length === 0) {
				var c = this;
				_.forEach(this.defaultStations, function (g) {
					c.addToShortcuts("station", g, false)
				})
			}
		},
		getPlaylists: function (b, c) {
			if (_.isEmpty(this.playlists)) GS.service.userGetPlaylists(this.UserID, this.callback(["loadPlaylists", b]), c);
			else b && b()
		},
		loadPlaylists: function (b) {
			b = b.Playlists;
			for (var c in b) if (b.hasOwnProperty(c)) {
				b[c].Username = this.Username;
				b[c].UserID = this.UserID;
				this.playlists[b[c].PlaylistID] = GS.Models.Playlist.wrap(b[c])
			}
			a.publish("gs.auth.playlists.update")
		},
		getFavorites: function () {
			var b = this;
			_.forEach(["Albums", "Artists", "Playlists", "Songs", "Users"], function (c) {
				GS.service.getFavorites(b.UserID, c, b.callback("load" + c + "Favorites"))
			})
		},
		loadAlbumsFavorites: function (b) {
			this._super(b);
			a.publish("gs.auth.favorites.albums.update")
		},
		loadArtistsFavorites: function (b) {
			this._super(b);
			a.publish("gs.auth.favorites.artists.update")
		},
		loadPlaylistsFavorites: function (b) {
			this._super(b);
			a.publish("gs.auth.favorites.playlists.update")
		},
		loadSongsFavorites: function (b) {
			this._super(b);
			a.publish("gs.auth.favorites.songs.update")
		},
		loadUsersFavorites: function (b) {
			this._super(b);
			a.publish("gs.auth.favorites.users.update");
			this.lastSeenFeedEvent == 0 && this.getUnseenFeeds()
		},
		getLibrary: function () {
			var b = store.get("library" + this.UserID);
			if (b) {
				var c = b.songs;
				delete b.songs;
				this.library = GS.Models.Library.wrap(b);
				for (var g in c) if (c.hasOwnProperty(g)) {
					c[g] = GS.Models.Song.unarchive(c[g]);
					c[g].fromLibrary = 1
				}
				this.library.songs = GS.Models.Song.wrapCollectionInObject(c, {
					TSAdded: "",
					TSFavorited: ""
				});
				GS.service.userGetLibraryTSModified(this.UserID, this.callback("refreshLibrary"))
			} else this.library.getSongs(this.callback("loadLibrary"), false, false)
		},
		refreshLibrary: function (b) {
			if (b.TSModified > this.library.lastModified) {
				this.library.currentPage = 0;
				this.library.songsLoaded = false;
				this.library.getSongs(this.callback("loadLibrary"), false, false)
			}
		},
		loadLibrary: function (b) {
			for (var c = 0; c < b.length; c++) {
				b[c].fromLibrary = 1;
				this.library.songs[b[c].SongID] = b[c]
			}
			a.publish("gs.auth.library.update", [b]);
			this.library.songsLoaded || this.library.getSongs(this.callback("loadLibrary"), false, false)
		},
		addToSongFavorites: function (b, c) {
			c = _.orEqual(c, true);
			if (!this.favorites.songs[b]) {
				var g = GS.Models.Song.getOneFromCache(b);
				if (!g) throw "AUTH.ADDTOSONGFAVES. SONGID NOT IN CACHE: " + b;
				g = g.dupe();
				g.isFavorite = 1;
				g.fromLibrary = 1;
				if (!_.defined(g.TSFavorited) || g.TSFavorited == "") g.TSFavorited = (new Date).format("Y-m-d G:i:s");
				if (!_.defined(g.TSAdded) || g.TSAdded == "") g.TSAdded = g.TSFavorited;
				if (this.library.songs[b]) this.library.songs[b] = g;
				else {
					this.library.songs[b] = g;
					a.publish("gs.auth.library.add", g)
				}
				this.favorites.songs[b] = g.dupe();
				GS.guts.logEvent("objectFavorited", {
					type: "song",
					id: b
				});
				a.publish("gs.auth.song.update", g);
				a.publish("gs.auth.favorite.song", g);
				a.publish("gs.auth.favorites.songs.add", g);
				c && a.publish("gs.notification.favorite.song", g);
				if (this.isLoggedIn) GS.service.favorite("Song", g.SongID, g.getDetailsForFeeds(), null, this.callback(this._favoriteFail, "Song", g));
				else this.isDirty = true;
				GS.guts.gaTrackEvent("user", "favoriteSong")
			}
		},
		addToPlaylistFavorites: function (b, c) {
			c = _.orEqual(c, true);
			if (!this.favorites.playlists[b]) {
				var g = GS.Models.Playlist.getOneFromCache(b);
				if (!g) throw "AUTH.ADDTOPLAYLISTFAVES. PLAYLISTID NOT IN CACHE: " + b;
				g.isFavorite = 1;
				if (!_.defined(g.TSFavorited)) g.TSFavorited = (new Date).format("Y-m-d G:i:s");
				this.favorites.playlists[b] = g;
				GS.guts.logEvent("objectFavorited", {
					type: "playlist",
					id: b
				});
				g.addShortcut(false);
				a.publish("gs.auth.favorites.playlists.update");
				a.publish("gs.auth.playlist.update", g);
				a.publish("gs.auth.favorite.playlist", g);
				a.publish("gs.playlist.view.update", this);
				c && a.publish("gs.notification.favorite.playlist", g);
				if (this.isLoggedIn) GS.service.favorite("Playlist", g.PlaylistID, g.getDetailsForFeeds(), null, this.callback(this._favoriteFail, "Playlist", g));
				else this.isDirty = true;
				GS.guts.gaTrackEvent("user", "favoritePlaylist")
			}
		},
		removeFromPlaylistFavorites: function (b, c) {
			c = _.orEqual(c, true);
			var g = GS.Models.Playlist.getOneFromCache(b);
			if (g) {
				g.removeShortcut(false);
				g.isFavorite = 0;
				GS.Models.Playlist.cache[b] = g;
				delete this.favorites.playlists[b];
				GS.guts.logEvent("objectUnfavorited", {
					type: "playlist",
					id: b
				});
				a.publish("gs.auth.favorites.playlists.update");
				a.publish("gs.auth.playlist.update", g);
				a.publish("gs.playlist.view.update", this);
				this.isLoggedIn && GS.service.unfavorite("Playlist", b);
				c && a.publish("gs.notification", {
					type: "notify",
					message: a.localize.getString("NOTIFICATION_PLAYLIST_UNSUBSCRIBED")
				});
				GS.guts.gaTrackEvent("user", "unfavoritePlaylist")
			}
		},
		removeFromSongFavorites: function (b) {
			var c = this.favorites.songs[b];
			if (c) {
				c.isFavorite = 0;
				delete this.favorites.songs[b];
				GS.guts.logEvent("objectUnfavorited", {
					type: "song",
					id: b
				});
				this.library.songs[b] = c.dupe();
				a.publish("gs.auth.song.update", c);
				a.publish("gs.auth.favorites.songs.remove", c);
				this.isLoggedIn && GS.service.unfavorite("Song", c.SongID);
				GS.guts.gaTrackEvent("user", "unfavoriteSong")
			}
		},
		addToUserFavorites: function (b, c) {
			c = _.orEqual(c, true);
			console.log("add to user favorites", b);
			if (!this.favorites.users[b]) {
				var g = GS.Models.User.getOneFromCache(b);
				if (!g || this.UserID === g.UserID) this._favoriteFail("User", null);
				else {
					g.isFavorite = 1;
					this.favorites.users[b] = g;
					GS.guts.logEvent("objectFavorited", {
						type: "user",
						id: b
					});
					a.publish("gs.auth.favorites.users.update");
					a.publish("gs.auth.user.update", g);
					a.publish("gs.auth.favorite.user", g);
					c && a.publish("gs.notification.favorite.user", g);
					if (this.isLoggedIn) GS.service.favorite("User", g.UserID, g.getDetailsForFeeds(), null, this.callback(this._favoriteFail, "User", g));
					else this.isDirty = true;
					GS.guts.gaTrackEvent("user", "followUser")
				}
			}
		},
		removeFromUserFavorites: function (b) {
			var c = GS.Models.User.getOneFromCache(b);
			if (!(!c || this.UserID === c.UserID)) {
				c.isFavorite = 0;
				GS.Models.User.cache[b] = c;
				delete this.favorites.users[b];
				GS.guts.logEvent("objectUnfavorited", {
					type: "user",
					id: b
				});
				a.publish("gs.auth.favorites.users.update");
				a.publish("gs.auth.user.update", c);
				this.isLoggedIn && GS.service.unfavorite("User", c.UserID);
				GS.guts.gaTrackEvent("user", "unfollowUser")
			}
		},
		changeFollowFlags: function (b) {
			this.isLoggedIn ? GS.service.changeFollowFlags(b, this.callback("changeFollowFlagsSuccess", b), this.callback("changeFollowFlagsFail")) : this.changeFollowFlagsFail()
		},
		changeFollowFlagsSuccess: function (b, c) {
			if (c.success) {
				for (var g in b) if (b.hasOwnProperty(g)) if (this.favorites.users[b[g].userID]) this.favorites.users[b[g].userID].FollowingFlags = b[g].flags;
				this.communityFeed.isDirty = true;
				a.publish("gs.auth.favorites.users.update")
			} else this.changeFollowFlagsFail()
		},
		changeFollowFlagsFail: function () {
			a.publish("gs.notification", {
				message: a.localize.getString("SETTINGS_USER_HIDE_FAIL")
			})
		},
		addToLibrary: function (b, c) {
			c = _.orEqual(c, true);
			var g = [];
			b = a.makeArray(b);
			for (var h = 0; h < b.length; h++) {
				var k = b[h];
				if (!this.library.songs[k]) {
					var m = GS.Models.Song.getOneFromCache(k);
					if (m) {
						m = m.dupe();
						m.fromLibrary = 1;
						if (this.favorites.songs[k]) m.isFavorite = 1;
						if (!_.defined(m.TSAdded) || m.TSAdded == "") m.TSAdded = (new Date).format("Y-m-d G:i:s");
						this.library.songs[k] = m;
						GS.guts.logEvent("songAddedToLibrary", {
							id: k
						});
						a.publish("gs.auth.library.add", m);
						a.publish("gs.auth.song.update", m);
						g.push(m.getDetailsForFeeds())
					}
				}
			}
			if (!_.isEmpty(g)) {
				if (this.isLoggedIn) GS.service.userAddSongsToLibrary(g, this.callback("addToLibrarySuccess", c, g), this.callback("addtoLibraryFailed"));
				else {
					this.isDirty = true;
					this.addToLibrarySuccess(c, g)
				}
				GS.guts.gaTrackEvent("user", "addLibrarySong")
			}
		},
		addToLibrarySuccess: function (b, c, g) {
			b && a.publish("gs.auth.library.songsAdded", {
				songs: c
			});
			if (g) {
				tsAdded = parseInt(g.Timestamps.newTSModified, 10);
				parseInt(g.Timestamps.oldTSModified, 10) > this.library.lastModified && this.library.getSongs(this.callback("loadLibrary"), false, false)
			} else tsAdded = _.unixTime();
			this.library.lastModified = tsAdded;
			b = (new Date(tsAdded * 1E3)).format("Y-m-d G:i:s");
			for (g = 0; g < c.length; g++) this.library.songs[c[g].songID].TSAdded = b
		},
		_favoriteFail: function (b, c) {
			var g = "NOTIFICATION_LIBRARY_ADD_FAIL",
				h = {};
			if (c) switch (b) {
			case "Song":
				g += "_SONG";
				h.name = c.SongName;
				break;
			case "Playlist":
				g += "_PLAYLIST";
				h.name = c.PlaylistName;
				break;
			case "User":
				g += "_USER";
				h.name = c.Username;
				break
			}
			a.publish("gs.notification", {
				type: "error",
				message: (new GS.Models.DataString(a.localize.getString(g), h)).render()
			})
		},
		addToLibraryFailed: function (b) {
			console.error("add to library fail", b);
			b = {
				numSongs: songIDsToAdd.length
			};
			a.publish("gs.notification", {
				type: "error",
				message: (new GS.Models.DataString(a.localize.getString(songIDsToAdd.length > 1 ? "NOTIFICATION_LIBRARY_ADD_SONGS_FAIL" : "NOTIFICATION_LIBRARY_ADD_SONG_FAIL"), b)).render()
			})
		},
		removeFromLibrary: function (b) {
			console.log("auth.removefromlibrary. songid: ", b);
			var c = this.library.songs[b];
			if (c) {
				delete this.library.songs[b];
				GS.guts.logEvent("songRemovedFromLibrary", {
					id: b
				});
				delete this.favorites.songs[b];
				c.fromLibrary = 0;
				c.isFavorite = 0;
				GS.Models.Song.cache[c.SongID] = c;
				a.publish("gs.auth.library.remove", c);
				a.publish("gs.auth.song.update", c);
				if (this.isLoggedIn) {
					GS.service.userRemoveSongFromLibrary(this.UserID, c.SongID, c.AlbumID, c.ArtistID, this.callback("removeFromLibrarySuccess"), this.callback("removeFromLibraryFailed"));
					GS.service.unfavorite("Song", c.SongID)
				} else a.publish("gs.notification", {
					message: a.localize.getString("NOTIFICATION_LIBRARY_REMOVE")
				});
				GS.guts.gaTrackEvent("user", "removeLibrarySong");
				return c
			} else console.warn("removing song not in library!", b)
		},
		removeFromLibrarySuccess: function (b) {
			if (parseInt(b.Timestamps.oldTSModified, 10) > this.library.lastModified) this.library.getSongs(this.callback("loadLibrary"), false, false);
			else this.library.lastModified = parseInt(b.Timestamps.newTSModified, 10);
			a.publish("gs.notification", {
				message: a.localize.getString("NOTIFICATION_LIBRARY_REMOVE")
			})
		},
		removeFromLibraryFailed: function (b) {
			console.error("remove from library fail", b);
			a.publish("gs.notification", {
				type: "error",
				message: a.localize.getString("NOTIFICATION_LIBRARY_REMOVE_FAIL")
			})
		},
		getUnseenFeeds: function () {
			clearTimeout(this.unseenFeedEventTimeout);
			this.getCommunityFeed(this.callback("countUnseenFeeds"), this.callback("countUnseenFeeds"))
		},
		countUnseenFeeds: function () {
			this.unseenFeedEvents = 0;
			for (var b = this.communityFeed.events.length, c = 0; c < b; c++) if (this.communityFeed.events[c].time > this.lastSeenFeedEvent) this.unseenFeedEvents++;
			else break;
			a.publish("gs.auth.user.feeds.update");
			this.unseenFeedEventTimeout = setTimeout("GS.user.getUseenFeeds", 72E5)
		},
		addToShortcuts: function (b, c, g) {
			console.log("authuser.addShortcut", b, c, g);
			g = _.orEqual(g, true);
			switch (b) {
			case "playlist":
				b = GS.Models.Playlist.getOneFromCache(c);
				if (!b || b.isShortcut()) return;
				var h = b.isSubscribed();
				b = h ? "subscribedPlaylists" : "playlists";
				if (h) {
					this.sidebar.subscribedPlaylists.unshift(c.toString());
					a.publish("gs.auth.favorites.playlists.update")
				} else {
					this.sidebar.playlists.unshift(c.toString());
					a.publish("gs.auth.playlists.update")
				}
				break;
			case "station":
				b = "stations";
				if (this.sidebar.stations.indexOf(c.toString()) !== -1) return;
				this.sidebar.stations.unshift(c.toString());
				a.publish("gs.auth.stations.update");
				break;
			default:
				return
			}
			if (this.isLoggedIn) GS.service.addShortcutToUserSidebar(b, c, this.callback(this._addShortcutSuccess, b, c, g), this.callback(this._addShortcutFailed, b, c, g));
			else {
				this.isDirty = true;
				this._addShortcutSuccess(b, c, g, {})
			}
			GS.guts.gaTrackEvent("user", "addShortcut")
		},
		_addShortcutSuccess: function (b, c, g) {
			var h, k = {};
			switch (b) {
			case "playlists":
			case "subscribedPlaylists":
				if (b = GS.Models.Playlist.getOneFromCache(c)) {
					h = "NOTIFICATION_PLAYLIST_SHORTCUT_ADD_SUCCESS";
					k.playlist = b.PlaylistName;
					a.publish("gs.playlist.view.update", b)
				}
				break;
			case "stations":
				h = "NOTIFICATION_STATION_SHORTCUT_ADD_SUCCESS";
				k.station = a.localize.getString(GS.Models.Station.TAG_STATIONS[c]);
				break
			}
			if (g && h) {
				g = new GS.Models.DataString(a.localize.getString(h), k);
				a.publish("gs.notification", {
					type: "notice",
					message: g.render()
				})
			}
		},
		_addShortcutFailed: function (b, c, g) {
			var h, k = {};
			switch (b) {
			case "playlists":
			case "subscribedPlaylists":
				var m = GS.Models.Playlist.getOneFromCache(c);
				if (m) {
					h = "NOTIFICATION_PLAYLIST_SHORTCUT_ADD_FAILED";
					k.playlist = m.PlaylistName
				}
				if (b == "playlists") {
					b = this.sidebar.playlists.indexOf(c.toString());
					if (b != -1) {
						this.sidebar.playlists.splice(b, 1);
						a.publish("gs.auth.playlists.update")
					}
				} else {
					b = this.sidebar.subscribedPlaylists.indexOf(obj.PlaylistID.toString());
					if (b != -1) {
						this.sidebar.subscribedPlaylists.splice(b, 1);
						a.publish("gs.auth.favorites.playlists.update")
					}
				}
				break;
			case "stations":
				h = "NOTIFICATION_STATION_SHORTCUT_ADD_FAILED";
				k.station = a.localize.getString(GS.Models.Station.TAG_STATIONS[c]);
				b = this.sidebar.stations.indexOf(c.toString());
				if (b != -1) {
					this.sidebar.stations.splice(b, 1);
					a.publish("gs.auth.stations.update")
				}
				break
			}
			if (g && h) {
				g = new GS.Models.DataString(a.localize.getString(h), k);
				a.publish("gs.notification", {
					type: "error",
					message: g.render()
				})
			}
		},
		removeFromShortcuts: function (b, c, g) {
			console.log("authuser.removeShortcut", b, c, g);
			g = _.orEqual(g, true);
			var h;
			switch (b) {
			case "playlist":
				b = GS.Models.Playlist.getOneFromCache(c);
				if (!b || !b.isShortcut()) return;
				b = (h = b.isSubscribed()) ? "subscribedPlaylists" : "playlists";
				if (h) {
					h = this.sidebar.subscribedPlaylists.indexOf(c.toString());
					if (h != -1) {
						this.sidebar.subscribedPlaylists.splice(h, 1);
						a.publish("gs.auth.favorites.playlists.update")
					}
				} else {
					h = this.sidebar.playlists.indexOf(c.toString());
					if (h != -1) {
						this.sidebar.playlists.splice(h, 1);
						a.publish("gs.auth.playlists.update")
					}
				}
				break;
			case "station":
				b = "stations";
				h = this.sidebar.stations.indexOf(c.toString());
				if (h != -1) {
					this.sidebar.stations.splice(h, 1);
					a.publish("gs.auth.stations.update")
				} else return;
				break;
			default:
				return
			}
			if (this.isLoggedIn) GS.service.removeShortcutFromUserSidebar(b, c, this.callback(this._removeShortcutSuccess, b, c, g), this.callback(this._removeShortcutFailed, b, c, h, g));
			else {
				this.isDirty = true;
				this._removeShortcutSuccess(b, c, g, {})
			}
			GS.guts.gaTrackEvent("user", "removeShortcut")
		},
		_removeShortcutSuccess: function (b, c, g) {
			var h, k = {};
			switch (b) {
			case "playlists":
			case "subscribedPlaylists":
				if (b = GS.Models.Playlist.getOneFromCache(c)) {
					h = "NOTIFICATION_PLAYLIST_SHORTCUT_REMOVE_SUCCESS";
					k.playlist = b.PlaylistName;
					a.publish("gs.playlist.view.update", b)
				}
				break;
			case "stations":
				h = "NOTIFICATION_STATION_SHORTCUT_REMOVE_SUCCESS";
				k.station = a.localize.getString(GS.Models.Station.TAG_STATIONS[c]);
				break
			}
			if (g && h) {
				g = new GS.Models.DataString(a.localize.getString(h), k);
				a.publish("gs.notification", {
					type: "notice",
					message: g.render()
				})
			}
		},
		_removeShortcutFailed: function (b, c, g, h) {
			var k, m = {};
			if (g < 0) g = 0;
			switch (b) {
			case "playlists":
			case "subscribedPlaylists":
				var o = GS.Models.Playlist.getOneFromCache(c);
				if (o) {
					k = "NOTIFICATION_PLAYLIST_SHORTCUT_REMOVE_FAILED";
					m.playlist = o.PlaylistName
				}
				if (b == "playlists") {
					if (g != -1) {
						this.sidebar.playlists.splice(g, 0, c.toString());
						a.publish("gs.auth.playlists.update")
					}
				} else if (g != -1) {
					this.sidebar.subscribedPlaylists.splice(g, 0, c.toString());
					a.publish("gs.auth.favorites.playlists.update")
				}
				break;
			case "stations":
				k = "NOTIFICATION_STATION_SHORTCUT_REMOVE_FAILED";
				m.station = a.localize.getString(GS.Models.Station.TAG_STATIONS[c]);
				if (g != -1) {
					this.sidebar.stations.splice(g, 0, c.toString());
					a.publish("gs.auth.stations.update")
				}
				break
			}
			if (h && k) {
				b = new GS.Models.DataString(a.localize.getString(k), m);
				a.publish("gs.notification", {
					type: "error",
					message: b.render()
				})
			}
		},
		changePassword: function (b, c, g, h) {
			this.isLoggedIn ? GS.service.changePassword(b, c, this.callback(this._passwordSuccess, g, h), this.callback(this._passwordFailed, h)) : this._passwordFailed(h);
			GS.guts.gaTrackEvent("user", "changePassword")
		},
		_passwordSuccess: function (b, c, g) {
			if (g && g.statusCode === 1) {
				console.log("authuser changepass SUCCESS", g);
				a.isFunction(b) && b(g)
			} else this._passwordFailed(c, g)
		},
		_passwordFailed: function (b, c) {
			console.log("authuser changepass FAILED", c);
			a.isFunction(b) && b(c)
		},
		updateAccountType: function (b) {
			b = b.toLowerCase();
			switch (b) {
			case "plus":
				this.IsPremium = 1;
				this.Flags |= 1;
				break;
			case "anywhere":
				this.IsPremium = 1;
				this.Flags |= 128;
				break;
			default:
				this.IsPremium = 0;
				this.Flags &= -2;
				this.Flags &= -129;
				break
			}
			a.publish("gs.auth.update");
			this.checkVipExpiring();
			GS.guts.gaTrackEvent("user", "updateAccount", b)
		},
		checkVipExpiring: function () {
			this.IsPremium && GS.service.getSubscriptionDetails(this.callback("checkVipExpiringCallback"), this.callback("checkVipExpiringCallback"))
		},
		checkVipExpiringCallback: function (b) {
			var c, g, h = new Date;
			c = false;
			if (!(b === false || b.fault || b.code)) if (!b.bRecurring) {
				g = b.period === "MONTH" ? true : false;
				if (b.dateEnd) {
					c = b.dateEnd.split("-");
					c = g ? new Date(c[0], parseInt(c[1], 10) - 1, c[2]) : new Date(parseInt(c[0], 10) + 1, c[1], c[2])
				} else if (b.dateStart) {
					c = b.dateStart.split("-");
					c = g ? new Date(c[0], parseInt(c[1], 10), c[2]) : new Date(parseInt(c[0], 10) + 1, c[1], c[2])
				}
				if (c) {
					g = _.orEqual(store.get("gs.vipExpire.hasSeen" + this.UserID), 0);
					g = h.getTime() - g;
					h = c.getTime() - h.getTime();
					c = Math.max(0, Math.ceil(h / 864E5));
					c += c == 1 ? " day" : " days";
					c = h <= 0 ? (new GS.Models.DataString(a.localize.getString("POPUP_VIP_EXPIRES_NO_DAYS"), {
						vipPackage: b.subscriptionType
					})).render() : (new GS.Models.DataString(a.localize.getString("POPUP_VIP_EXPIRES_DAYS_LEFT"), {
						daysLeft: c,
						vipPackage: b.subscriptionType
					})).render();
					b.daysLeft = c;
					if (g >= 1728E5) if (h < 864E5) {
						b.timeframe = "oneDay";
						GS.lightbox.open("vipExpires", b)
					} else if (h < 1728E5) {
						b.timeframe = "twoDays";
						GS.lightbox.open("vipExpires", b)
					} else if (h < 12096E5) {
						b.timeframe = "twoWeeks";
						GS.lightbox.open("vipExpires", b)
					} else if (h <= 0 && Math.abs(h) <= 6048E5) {
						b.timeframe = "expired";
						GS.lightbox.open("vipExpires", b)
					}
					setTimeout(this.callback("checkVipExpiring"), 1728E5)
				}
			}
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Fanbase", {}, {
		currentPage: 0,
		objectID: null,
		objectType: "",
		userIDs: [],
		fansLoaded: false,
		getFans: function (b, c, g) {
			g = _.orEqual(g, true);
			if (this.fansLoaded) {
				c = GS.Models.User.getManyFromCache(this.userIDs);
				b(c)
			} else {
				g && this.currentPage === 0 && a.publish("gs.page.loading.grid");
				this.objectType === "playlist" ? GS.service[this.objectType + "GetFans"](this.objectID, this.callback(["cacheAndReturnUsers", b]), c) : GS.service[this.objectType + "GetFans"](this.objectID, this.currentPage, this.callback(["cacheAndReturnUsers", b]), c)
			}
		},
		cacheAndReturnUsers: function (b) {
			for (var c = GS.Models.User.wrapCollection(b.Users || b.Return.fans || b.Return), g = 0; g < c.length; g++) this.userIDs.push(c[g].UserID);
			if (_.defined(b.hasMore) && b.hasMore) {
				console.log("service has more. current page is: ", this.currentPage);
				this.currentPage++
			} else this.fansLoaded = true;
			return c
		}
	})
})(jQuery);
(function () {
	GS.Models.Base.extend("GS.Models.Feed", {}, {
		user: null,
		currentPage: 0,
		isLoaded: false,
		hasMore: false,
		today: null,
		offset: 0,
		events: [],
		fromFavorites: false,
		fromRecent: false,
		lastRequest: 0,
		isDirty: false,
		RATE_LIMIT: 6E5,
		getProfileFeed: function (a, b) {
			var c = new Date;
			if (!this.isLoaded && !this.lastRequest || c.getTime() > this.lastRequest + this.RATE_LIMIT) {
				this.events = [];
				this.today = new Date;
				this.offset = 0;
				this.userIDs = [];
				this.onProgress = a;
				this.onErr = b;
				this.isLoaded = this.hasMore = false;
				this.lastRequest = c.getTime();
				this.fetchProfileDay()
			} else a()
		},
		getCommunityFeed: function (a, b, c) {
			var g = new Date;
			if (!this.isLoaded || g.getTime() > this.lastRequest + this.RATE_LIMIT || this.isDirty) {
				this.events = [];
				this.today = new Date;
				this.offset = 0;
				this.userIDs = a;
				this.onProgress = b;
				this.onErr = c;
				this.fromFavorites = true;
				this.isLoaded = this.hasMore = this.fromRecent = false;
				this.lastRequest = g.getTime();
				this.isDirty = false;
				this.fetchCommunityDay()
			} else b()
		},
		getRecentlyActiveUsersFeed: function (a, b) {
			var c = new Date;
			if (!this.isLoaded || c.getTime() > this.lastRequest + this.RATE_LIMIT || this.isDirty) {
				this.events = [];
				this.today = new Date;
				this.offset = 0;
				this.onProgress = a;
				this.onErr = b;
				this.fromFavorites = false;
				this.fromRecent = true;
				this.isLoaded = this.hasMore = false;
				this.lastRequest = c.getTime();
				if (this.recentUsers && this.recentUsers.length) {
					this.userIDs = _.toArrayID(this.recentUsers);
					this.fetchCommunityDay()
				} else GS.service.getRecentlyActiveUsers(this.callback("onRecentUsers"), this.onErr)
			} else a()
		},
		onRecentUsers: function (a) {
			var b;
			this.recentUsers = {};
			if (a.users && a.users.length) for (var c = 0; c < a.users.length; c++) {
				b = a.users[c];
				b = GS.Models.User.wrap(b);
				this.recentUsers[b.UserID] = b
			}
			this.userIDs = _.toArrayID(this.recentUsers);
			this.fetchCommunityDay()
		},
		fetchProfileDay: function () {
			var a = new Date(this.today.getTime() - this.offset++ * 1E3 * 60 * 60 * 24);
			GS.service.getProcessedUserFeedData(this.user.UserID, a.format("Ymd"), this.callback(["parseProfileFeed", this.onProgress]), this.onErr)
		},
		fetchCommunityDay: function () {
			var a = new Date(this.today.getTime() - this.offset++ * 1E3 * 60 * 60 * 24);
			GS.service.getCombinedProcessedFeedData(this.userIDs, a.format("Ymd"), this.user.UserID, this.callback(["parseCommunityFeed", this.onProgress]), this.onErr)
		},
		parseProfileFeed: function (a) {
			var b;
			for (var c in a.events) if (a.events.hasOwnProperty(c)) if (a.events[c].length) {
				b = this.parseUser(a.events[c], this.user);
				this.events = this.events.concat(b)
			}
			this.isLoaded = !Boolean(a.hasMore) || this.events.length;
			this.events = this.events.sort(this.sortByDate);
			this.events = this.collapse(this.events, 100)
		},
		parseCommunityFeed: function (a) {
			var b, c;
			for (var g in a.userFeeds) if (a.userFeeds.hasOwnProperty(g)) if (a.userFeeds[g].length) {
				if (this.fromFavorites) c = this.user.favorites.users[g];
				else if (this.fromRecent) c = this.recentUsers[g];
				b = this.parseUser(a.userFeeds[g], c);
				this.events = this.events.concat(b)
			}
			this.hasMore = Boolean(a.hasMore);
			this.isLoaded = !Boolean(a.hasMore) || this.events.length;
			this.events = this.events.sort(this.sortByDate);
			this.events = this.collapse(this.events);
			this.events.length < 50 && this.offset < 4 && this.fetchCommunityDay()
		},
		sortByDate: function (a, b) {
			return b.time - a.time
		},
		sortByWeight: function (a, b) {
			return parseInt(b.weight, 10) - parseInt(a.weight, 10)
		},
		collapse: function (a, b) {
			var c = [],
				g, h;
			b = _.orEqual(b, 3);
			for (h = 0; h < a.length; h++) if (h > 0 && a[h].time == a[h - 1].time) {
				if (a[h].weight >= a[h - 1].weight) {
					g = c.indexOf(a[h - 1]);
					g != -1 && c.splice(g, 1);
					c.push(a[h])
				}
			} else c.push(a[h]);
			a = c;
			c = [];
			if (a.length <= 9) return a;
			var k = null,
				m = [],
				o = null;
			_.forEach(a, function (r) {
				if (r.user !== k) {
					if (m.length) if (m.length > b) {
						m.sort(this.sortByWeight);
						c = c.concat(m.slice(0, b))
					} else c = c.concat(m);
					k = r.user;
					m = [r]
				} else if (m.length) {
					o = m[m.length - 1];
					if (r.data && o.data && r.data.songs && o.data.songs && r.data.songs.length == 1 && o.data.songs.length == 1 && r.data.songs[0].SongID == o.data.songs[0].SongID) {
						if (o.type !== GS.Models.FeedEvent.FAVORITE_SONG_TYPE) {
							m.pop();
							m.push(r)
						}
					} else m.push(r)
				} else m.push(r)
			}, this);
			if (m.length) if (m.length > b) {
				m = m.sort(this.sortByWeight);
				c = c.concat(m.slice(0, b))
			} else c = c.concat(m);
			return c
		},
		parseUser: function (a, b) {
			var c = [],
				g;
			for (var h in a) if (a.hasOwnProperty(h)) {
				try {
					g = GS.Models.FeedEvent.wrap(a[h]);
					g.user = b;
					g.date = new Date(g.time * 1E3);
					g.getDataString()
				} catch (k) {
					console.warn("Feed Parse Error: type, event, user:", a[h].type, a[h], b);
					continue
				}
				c.push(g)
			}
			return c
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.FeedEvent", {
		BROADCAST_TWITTER_TYPE: 1,
		EMAIL_TYPE: 2,
		CREATE_PLAYLIST_TYPE: 3,
		FAVORITE_SONG_TYPE: 4,
		FAVORITE_USER_TYPE: 5,
		FAVORITE_PLAYLIST_TYPE: 6,
		FAVORITE_ARTIST_TYPE: 7,
		FAVORITE_ALBUM_TYPE: 8,
		SONG_OBSESSION_TYPE: 9,
		EDIT_PLAYLIST_TYPE: 10,
		LISTEN_ARTIST_TYPE: 11,
		LISTEN_ALBUM_TYPE: 12,
		EDIT_PLAYLIST_LOTS_TYPE: 13,
		LISTEN_LOTS_TYPE: 14,
		BROADCAST_FACEBOOK_TYPE: 15,
		BROADCAST_STUMBLEUPON_TYPE: 16,
		USER_FOLLOWED_TYPE: 17,
		PLAYLIST_FOLLOWED_TYPE: 18,
		SHARE_SONG_TYPE: 19,
		SHARE_SONG_RECEIVED_TYPE: 20,
		LIBRARY_CLEANUP_TYPE: 21,
		LIBRARY_ADD_ARTIST_TYPE: 22,
		LIBRARY_ADD_ALBUM_TYPE: 23,
		LIBRARY_ADD_SONGS_TYPE: 24,
		SHARE_PLAYLIST_TYPE: 25,
		SHARE_PLAYLIST_RECEIVED_TYPE: 26,
		FAVORITE_SONGS_TYPE: 27,
		USERS_FOLLOWED_TYPE: 28,
		FAVORITE_USERS_TYPE: 29,
		SHARES_SONG_TYPE: 30,
		SHARES_PLAYLIST_TYPE: 31,
		FeedTypes: null,
		getTypes: function () {
			var b = {};
			b[GS.Models.FeedEvent.BROADCAST_TWITTER_TYPE] = GS.Models.FeedEvent.feedBroadcast;
			b[GS.Models.FeedEvent.EMAIL_TYPE] = GS.Models.FeedEvent.feedShareEmail;
			b[GS.Models.FeedEvent.CREATE_PLAYLIST_TYPE] = GS.Models.FeedEvent.feedPlaylistCreated;
			b[GS.Models.FeedEvent.FAVORITE_SONG_TYPE] = GS.Models.FeedEvent.feedFavorite;
			b[GS.Models.FeedEvent.FAVORITE_SONGS_TYPE] = GS.Models.FeedEvent.feedFavorites;
			b[GS.Models.FeedEvent.FAVORITE_USER_TYPE] = GS.Models.FeedEvent.feedFavoriteUser;
			b[GS.Models.FeedEvent.FAVORITE_USERS_TYPE] = GS.Models.FeedEvent.feedFavoriteUser;
			b[GS.Models.FeedEvent.FAVORITE_PLAYLIST_TYPE] = GS.Models.FeedEvent.feedFavoritePlaylist;
			b[GS.Models.FeedEvent.FAVORITE_ARTIST_TYPE] = GS.Models.FeedEvent.feedFavoriteArtist;
			b[GS.Models.FeedEvent.FAVORITE_ALBUM_TYPE] = GS.Models.FeedEvent.feedFavoriteAlbum;
			b[GS.Models.FeedEvent.SONG_OBSESSION_TYPE] = GS.Models.FeedEvent.feedSongObsession;
			b[GS.Models.FeedEvent.EDIT_PLAYLIST_TYPE] = GS.Models.FeedEvent.feedPlaylistEdited;
			b[GS.Models.FeedEvent.LISTEN_ARTIST_TYPE] = GS.Models.FeedEvent.feedListenArtist;
			b[GS.Models.FeedEvent.LISTEN_ALBUM_TYPE] = GS.Models.FeedEvent.feedListenAlbum;
			b[GS.Models.FeedEvent.EDIT_PLAYLIST_LOTS_TYPE] = GS.Models.FeedEvent.feedPlaylistEditLots;
			b[GS.Models.FeedEvent.LISTEN_LOTS_TYPE] = GS.Models.FeedEvent.feedListenLots;
			b[GS.Models.FeedEvent.BROADCAST_FACEBOOK_TYPE] = GS.Models.FeedEvent.feedFacebook;
			b[GS.Models.FeedEvent.BROADCAST_STUMBLEUPON_TYPE] = GS.Models.FeedEvent.feedBroadcast;
			b[GS.Models.FeedEvent.BROADCAST_REDDIT_TYPE] = GS.Models.FeedEvent.feedBroadcast;
			b[GS.Models.FeedEvent.USER_FOLLOWED_TYPE] = GS.Models.FeedEvent.feedUserFollowed;
			b[GS.Models.FeedEvent.USERS_FOLLOWED_TYPE] = GS.Models.FeedEvent.feedUserFollowed;
			b[GS.Models.FeedEvent.PLAYLIST_FOLLOWED_TYPE] = GS.Models.FeedEvent.feedPlaylistFollowed;
			b[GS.Models.FeedEvent.SHARE_SONG_TYPE] = GS.Models.FeedEvent.feedShareSong;
			b[GS.Models.FeedEvent.SHARES_SONG_TYPE] = GS.Models.FeedEvent.feedSharesSong;
			b[GS.Models.FeedEvent.SHARE_SONG_RECEIVED_TYPE] = GS.Models.FeedEvent.feedShareReceived;
			b[GS.Models.FeedEvent.LIBRARY_ADD_ARTIST_TYPE] = GS.Models.FeedEvent.feedLibraryArtist;
			b[GS.Models.FeedEvent.LIBRARY_ADD_ALBUM_TYPE] = GS.Models.FeedEvent.feedLibraryAlbum;
			b[GS.Models.FeedEvent.LIBRARY_ADD_SONGS_TYPE] = GS.Models.FeedEvent.feedLibrarySongs;
			b[GS.Models.FeedEvent.SHARE_PLAYLIST_TYPE] = GS.Models.FeedEvent.feedSharePlaylist;
			b[GS.Models.FeedEvent.SHARE_PLAYLIST_RECEIVED_TYPE] = GS.Models.FeedEvent.feedSharePlaylistReceived;
			return b
		},
		feedBroadcast: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			b.dataKey = "FEED_BROADCAST";
			if (b.data.songs[0].albumName.length) c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			else b.dataKey = "FEED_BROADCAST_NO_ALBUM";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFacebook: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			b.dataKey = "FEED_FACEBOOK";
			if (b.data.songs[0].albumName.length) c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			else b.dataKey = "FEED_FACEBOOK_NO_ALBUM";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedShareEmail: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			b.dataKey = "FEED_SHARE_SEND_SONG_SINGLE_EMAIL";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedPlaylistCreated: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			c.numSongs = _.defined(b.data.songCount) ? parseInt(b.data.songCount, 10) : 0;
			b.dataKey = c.numSongs && c.numSongs > 1 ? "FEED_PLAYLIST_CREATED" : "FEED_PLAYLIST_CREATED_NO_SONGS";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFavorite: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			b.dataKey = "FEED_FAVORITE_SONG";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFavorites: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			c.numSongs = b.data.songs.length;
			if (c.numSongs > 2) {
				b.dataKey = "FEED_FAVORITE_SONGS_MANY";
				c.numSongs--
			} else if (c.numSongs == 2) {
				c.song2 = ['<a class="songLink" data-song-index="1">', _.cleanText(b.data.songs[1].songName), "</a>"].join("");
				b.dataKey = "FEED_FAVORITE_SONGS_TWO"
			}
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFavoriteUser: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.followed = ['<a href="', _.cleanUrl(b.data.users[0].username, b.data.users[0].userID, "user"), '">', b.data.users[0].username, "</a>"].join("");
			b.dataKey = "FEED_FAVORITE_USER";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFavoritePlaylist: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			c.author = ['<a href="', _.cleanUrl(b.data.playlist.username, b.data.playlist.userID, "user"), '">', b.data.playlist.username, "</a>"].join("");
			b.dataKey = "FEED_FAVORITE_PLAYLIST";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFavoriteArtist: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.artist = ['<a href="', _.cleanUrl(b.data.artist.artistName, b.data.artist.artistID, "artist"), '">', _.cleanText(b.data.artist.artistName), "</a>"].join("");
			b.dataKey = "FEED_FAVORITE_ARTIST";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedFavoriteAlbum: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.album = ['<a href="', _.cleanUrl(b.data.album.albumName, b.data.album.albumID, "album"), '">', _.cleanText(b.data.album.albumName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.album.artistName, b.data.album.artistID, "artist"), '">', _.cleanText(b.data.album.artistName), "</a>"].join("");
			b.dataKey = "FEED_FAVORITE_ALBUM";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedSongObsession: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			b.dataKey = "FEED_SONG_OBSESSION";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedPlaylistEdited: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			if (b.data.songCount > 1) {
				c.numSongs = b.data.songCount;
				b.dataKey = "FEED_PLAYLIST_EDITED"
			} else b.dataKey = "FEED_PLAYLIST_EDITED_NO_SONGS";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedListenArtist: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.numSongs = b.data.songs.length;
			c.artist = ['<a href="', _.cleanUrl(b.data.artist.artistName, b.data.artist.artistID, "artist"), '">', _.cleanText(b.data.artist.artistName), "</a>"].join("");
			b.dataKey = "FEED_LISTEN_ARTIST";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedListenAlbum: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.numSongs = b.data.songs.length;
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			b.dataKey = "FEED_LISTEN_ALBUM";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedPlaylistEditLots: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			b.dataKey = "FEED_PLAYLIST_EDITED_LOTS";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedListenLots: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			c.numSongs = b.data.songs.length - 1;
			b.dataKey = "FEED_LISTEN_LOTS";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedUserFollowed: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.fan = ['<a href="', _.cleanUrl(b.data.users[0].username, b.data.users[0].userID, "user"), '">', _.cleanText(b.data.users[0].username), "</a>"].join("");
			b.dataKey = "FEED_USER_FOLLOWED";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedPlaylistFollowed: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			c.author = ['<a href="', _.cleanUrl(b.data.playlist.username, b.data.playlist.userID, "user"), '">', b.data.playlist.username, "</a>"].join("");
			c.fan = ['<a href="', _.cleanUrl(b.data.users[0].username, b.data.users[0].userID, "user"), '">', b.data.users[0].username, "</a>"].join("");
			b.dataKey = "FEED_PLAYLIST_FOLLOWED";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedShareSong: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			b.dataKey = "FEED_SHARE_SEND_SONG_SINGLE_USER";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedSharesSong: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			c.numFriends = b.data.peopleCount;
			b.dataKey = "FEED_SHARE_SEND_SONG_MULTIPLE";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedShareReceived: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			c.friend = ['<a href="', _.cleanUrl(b.data.user.username, b.data.user.userID, "user"), '">', _.cleanText(b.data.user.username), "</a>"].join("");
			b.dataKey = "FEED_SHARE_RECEIVED_SONG";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedLibraryArtist: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.numSongs = b.data.songs.length;
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			b.dataKey = "FEED_ADD_LIBRARY_ARTIST";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedLibraryAlbum: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			c.numSongs = b.data.songs.length;
			b.dataKey = "FEED_ADD_LIBRARY_ALBUM";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedLibrarySongs: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.song = ['<a class="songLink">', _.cleanText(b.data.songs[0].songName), "</a>"].join("");
			c.artist = ['<a href="', _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), '">', _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
			c.album = ['<a href="', _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), '">', _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
			if (b.data.songs.length > 2) {
				b.dataKey = "FEED_ADD_LIBRARY_SONGS_MANY";
				c.numSongs = b.data.songs.length - 1
			} else if (b.data.songs.length == 2) {
				c.song2 = ['<a class="songLink" data-song-index="1">', _.cleanText(b.data.songs[1].songName), "</a>"].join("");
				b.dataKey = "FEED_ADD_LIBRARY_SONGS_TWO"
			} else if (b.data.songs.length == 1) b.dataKey = "FEED_ADD_LIBRARY_SONG";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedSharePlaylist: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			b.dataKey = "FEED_SHARE_PLAYLIST";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		feedSharePlaylistReceived: function (b) {
			var c = {};
			c.user = GS.Models.FeedEvent.getUserLink(b.user);
			c.playlist = ['<a href="', _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), '">', _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
			c.friend = ['<a href="', _.cleanUrl(b.data.user.username, b.data.user.userID, "user"), '">', _.cleanText(b.data.user.username), "</a>"].join("");
			b.dataKey = "FEED_SHARE_PLAYLIST_RECEIVED";
			return new GS.Models.DataString(a.localize.getString(b.dataKey), c)
		},
		getUserLink: function (b) {
			return ['<a href="', b.toUrl(), '">', b.Username, "</a>"].join("")
		}
	}, {
		user: null,
		time: null,
		date: null,
		weight: 0,
		data: null,
		type: 0,
		dataString: null,
		dataKey: null,
		validate: function () {
			return true
		},
		init: function (b) {
			this._super(b);
			if (!GS.Models.FeedEvent.FeedTypes) GS.Models.FeedEvent.FeedTypes = GS.Models.FeedEvent.getTypes()
		},
		getKey: function () {
			return this.user.UserID + "-" + this.type + "-" + this.time
		},
		getDataString: function () {
			this.dataString = this.type && GS.Models.FeedEvent.FeedTypes[this.type] ? GS.Models.FeedEvent.FeedTypes[this.type](this) : null
		},
		toHTML: function () {
			this.type && !this.dataString && this.getDataString();
			return this.dataString ? this.dataString.render() : ""
		},
		playSongs: function (b, c) {
			c = _.orEqual(c, false);
			if (this.data.songs && this.data.songs.length) {
				var g = [];
				GS.Models.Song.wrapCollection(this.data.songs);
				for (var h in this.data.songs) this.data.songs.hasOwnProperty(h) && g.push(this.data.songs[h].songID);
				GS.player.addSongsToQueueAt(g, b, c, this.getDetailsForFeed())
			}
		},
		remove: function (b, c) {
			this.user.UserID == GS.user.UserID ? GS.service.feedsRemoveEventFromProfile(this.type, this.time, b, c) : GS.service.removeItemFromCommunityFeed(this.getKey(), this.date.format("Ymd"), b, c)
		},
		getDetailsForFeed: function () {
			return new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_FEED, {
				user: this.user.getDetailsForFeeds(),
				time: this.time,
				date: this.date,
				weight: this.weight,
				data: this.data,
				type: this.type
			})
		},
		toString: function () {
			return ["Feed. type:", this.type, ", usname: ", this.user.UserName].join("")
		}
	})
})(jQuery);
(function (a) {
	var b;
	GS.Models.Base.extend("GS.Models.Theme", {}, {
		themeID: null,
		version: "1.0",
		title: "Unknown",
		author: "Grooveshark",
		location: "default",
		premium: false,
		sponsored: false,
		sections: null,
		assetLocation: "",
		clickIDs: null,
		tracking: null,
		pageTracking: null,
		misc: null,
		videos: null,
		artistIDs: null,
		isFirstLoad: true,
		screensaver: false,
		CSS: "css",
		TOP: "top",
		BOTTOM: "bottom",
		CENTER: "center",
		LEFT: "left",
		RIGHT: "right",
		AUTO: "auto",
		SCALEX: "scalex",
		SCALEY: "scaley",
		init: function (c) {
			b = this;
			c && this._super(c);
			this.assetLocation = "/themes/" + c.location + "/assets/"
		},
		bindAssets: function (c) {
			var g, h, k, m, o, r, s = 0,
				u, w = a(c).attr("id");
			a(c).children().each(function () {
				a(this).is(".flash") || a(this).click(b.callback("handleClick"));
				if (a(this).is(".flash")) {
					g = _.orEqual(a(this).attr("data-flash-wmode"), "opaque");
					h = _.orEqual(a(this).attr("data-flash-width"), "100%");
					k = _.orEqual(a(this).attr("data-flash-height"), "100%");
					if ((m = _.orEqual(a(this).attr("data-flash-src"), null)) && a(this).attr("id")) {
						u = w + "-flash-" + s++;
						a(this).append('<div id="' + u + '"></div>');
						swfobject.embedSWF(b.assetLocation + m + "?ver=" + b.version + "&themeID=" + b.themeID + "&currentTarget=#" + a(this).attr("id"), u, h, k, "9.0.0", null, null, {
							wmode: g
						})
					}
				} else if (a(this).is(".img")) if (r = _.orEqual(a(this).attr("data-img-src"), null)) {
					o = new Image;
					a(this).append(a(o).load(b.callback("onImageLoad", c)).css("visibility", "hidden").attr("src", gsConfig.assetHost + b.assetLocation + r + "?ver=" + b.version))
				}
			})
		},
		onImageLoad: function (c, g) {
			var h = a(g.currentTarget),
				k = h.is("[display=none]");
			h.show();
			setTimeout(function () {
				h.css("visibility", "visible").attr("data-img-width", h.width()).attr("data-img-height", h.height());
				k && h.hide();
				b.position(c)
			}, 0)
		},
		position: function (c) {
			var g, h, k, m, o, r, s, u, w, C, v, H, K, A, y, B, D, G, n = a(c).height(),
				p = a(c).width();
			a(c).children(".img").each(function () {
				g = a(this);
				h = g.find("img");
				k = _.orEqual(parseInt(h.attr("data-img-width")), 0);
				m = _.orEqual(parseInt(h.attr("data-img-height")), 0);
				if (k && m) {
					D = _.orEqual(g.attr("data-img-top"), 0);
					G = _.orEqual(g.attr("data-img-bottom"), 0);
					y = _.orEqual(g.attr("data-img-left"), 0);
					B = _.orEqual(g.attr("data-img-right"), 0);
					r = p - y - B;
					o = n - D - G;
					w = parseInt(_.orEqual(g.attr("data-img-min-width"), 0));
					s = parseInt(_.orEqual(g.attr("data-img-min-height"), 0));
					u = parseInt(_.orEqual(g.attr("data-img-max-height"), o));
					maxWidth = parseInt(_.orEqual(g.attr("data-img-max-width"), r));
					C = g.attr("data-img-proportional") === "false" ? false : true;
					switch (g.attr("data-img-scale")) {
					case "scalex":
						h.width(Math.min(Math.max(w, r), maxWidth));
						C ? h.height(Math.round(h.width() / k * m)) : h.height(Math.min(Math.max(s, Math.round(o), u)));
						break;
					case "scaley":
						h.height(Math.min(Math.max(s, o), u));
						C ? h.width(Math.round(h.height() / m * k)) : h.width(Math.min(Math.max(w, Math.round(r), maxWidth)));
						break;
					case "auto":
					default:
						if (C) {
							v = Math.max(r / k, o / m);
							h.width(Math.round(v * k));
							h.height(Math.round(v * m))
						} else {
							h.width(Math.round(r / k * k));
							h.height(Math.round(o / m * m))
						}
						break
					}
					H = _.orEqual(g.attr("data-pos-x"), b.CENTER);
					K = _.orEqual(g.attr("data-pos-y"), b.CENTER);
					switch (H) {
					case b.LEFT:
						A = isNaN(y) ? y : y + "px";
						h.css(b.LEFT, A);
						break;
					case b.RIGHT:
						A = isNaN(B) ? B : B + "px";
						h.css(b.RIGHT, A);
						break;
					case b.CENTER:
						h.css(b.LEFT, Math.round((r - h.width()) / 2) + "px");
						break
					}
					switch (K) {
					case b.TOP:
						A = isNaN(D) ? D : D + "px";
						h.css(b.TOP, A);
						break;
					case b.BOTTOM:
						A = isNaN(G) ? G : G + "px";
						h.css(b.BOTTOM, A);
						break;
					case b.CENTER:
						h.css(b.TOP, Math.round((o - h.height()) / 2) + "px");
						break
					}
				}
			})
		},
		handleClick: function (c) {
			console.log("theme click", c);
			var g = a(c.currentTarget),
				h;
			switch (g.attr("data-click-action")) {
			case "playSong":
				(c = g.attr("data-song-id")) && a.publish("gs.song.play", {
					songID: c,
					playOnAdd: true,
					getFeedback: true
				});
				break;
			case "playAlbum":
				(c = g.attr("data-album-id")) && a.publish("gs.album.play", {
					albumID: c,
					playOnAdd: true,
					getFeedback: true
				});
				break;
			case "playPlaylist":
				(c = g.attr("data-playlist-id")) && a.publish("gs.playlist.play", {
					playlistID: c,
					playOnAdd: true,
					getFeedback: true
				});
				break;
			case "playStation":
				c = g.attr("data-station-id");
				h = g.attr("data-station-name");
				if (c && h) {
					GS.theme.extraStations[c] = h;
					a.publish("gs.station.play", {
						tagID: c,
						stationName: h
					})
				}
				break;
			case "playVideo":
				c = new GS.Models.Video({
					src: g.attr("data-video-src"),
					swf: g.attr("data-video-swf"),
					title: _.orEqual(g.attr("data-video-title"), null),
					author: _.orEqual(g.attr("data-video-author"), null)
				});
				c.swf.length && GS.lightbox.open("video", {
					video: c
				});
				break;
			case "playVideos":
				if (b.videos && b.videos.length) {
					c = _.defined(c.index) ? c.index % b.videos.length : 0;
					GS.lightbox.open("video", {
						video: b.videos[c],
						videos: b.videos,
						index: c
					})
				}
				break;
			case "promotion":
				GS.lightbox.open("promotion", {
					theme: b
				});
				break;
			default:
				console.log("no action provided");
				break
			}
			g.attr("data-click-id") && GS.service.logThemeOutboundLinkClick(b.themeID, g.attr("data-click-id"))
		}
	})
})(jQuery);
(function () {
	GS.Models.Base.extend("GS.Models.Event", {}, {
		EventID: 0,
		City: "",
		EventName: "",
		StartTime: "",
		TicketsURL: "",
		VenueName: "",
		ArtistName: "",
		init: function (a) {
			this._super(a);
			this.TicketsURL += "?utm_source=1&utm_medium=partner"
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.UserSettings", {
		NOTIF_EMAIL_USER_FOLLOW: 1,
		NOTIF_EMAIL_INVITE_SIGNUP: 2,
		NOTIF_EMAIL_PLAYLIST_SUBSCRIBE: 16,
		NOTIF_EMAIL_NEW_FEATURE: 4096,
		RSS_LISTENS: 2,
		RSS_FAVORITES: 1
	}, {
		UserID: 0,
		local: {
			restoreQueue: 0,
			lowerQuality: 0,
			noPrefetch: 0,
			playPauseFade: 0,
			crossfadeAmount: 5E3,
			crossfadeEnabled: 0,
			tooltips: 0,
			persistShuffle: 1,
			lastShuffle: 0
		},
		FName: "",
		Email: "",
		Country: "",
		Zip: "",
		Sex: "",
		TSDOB: "",
		FeedsDisabled: 0,
		NotificationEmailPrefs: 0,
		emailNotifications: {
			userFollow: true,
			inviteSignup: true,
			playlistSubscribe: true,
			newFeature: true
		},
		rssFeeds: {
			listens: true,
			favorites: true
		},
		_hasLoadedSettings: false,
		init: function (b) {
			this._super(b);
			this.local.restoreQueue = _.orEqual(store.get("player.restoreQueue" + this.UserID), 0);
			this.local.lowerQuality = _.orEqual(store.get("player.lowerQuality" + this.UserID), 0);
			this.local.noPrefetch = _.orEqual(store.get("player.noPrefetch" + this.UserID), 0);
			this.local.playPauseFade = _.orEqual(store.get("player.playPauseFade" + this.UserID), 0);
			this.local.crossfadeAmount = _.orEqual(store.get("player.crossfadeAmount" + this.UserID), 5E3);
			this.local.crossfadeEnabled = _.orEqual(store.get("player.crossfadeEnabled" + this.UserID), 0);
			this.local.lastShuffle = _.orEqual(store.get("player.lastShuffle" + this.UserID), 0);
			this.local.persistShuffle = _.orEqual(store.get("player.persistShuffle" + this.UserID), 1);
			this.local.tooltips = _.orEqual(store.get("user.tooltips" + this.UserID), 0);
			if (this.UserID <= 0) this._hasLoadedSettings = true
		},
		getUserSettings: function (b, c) {
			console.log("user_settings.get", this.UserID);
			if (this.UserID) if (this._hasLoadedSettings) a.isFunction(b) && b(this);
			else GS.service.getUserSettings(this.callback(this._onSettingsSuccess, b), this.callback(this._onSettingsFailed, c))
		},
		_onSettingsSuccess: function (b, c) {
			console.log("user_settings.get.success", c);
			if (c.hasOwnProperty("userInfo")) {
				a.extend(this, c.userInfo);
				if (this.hasOwnProperty("LName") && this.hasOwnProperty("FName")) {
					this.LName = a.trim(this.LName);
					this.FName = a.trim(this.FName);
					if (this.LName) {
						this.FName += " " + this.LName;
						this.FName = a.trim(this.FName)
					}
					delete this.LName
				}
				this.NotificationEmailPrefs = parseInt(this.NotificationEmailPrefs, 10);
				this.FeedsDisabled = parseInt(this.FeedsDisabled, 10);
				this._updateBitmaskProps()
			}
			this.hasLoadedSettings = true;
			a.isFunction(b) && b(this)
		},
		_onSettingsFailed: function (b, c) {
			console.log("user_settings.get.failed", c);
			a.isFunction(b) && b(this)
		},
		_updateBitmaskProps: function () {
			this.emailNotifications = {
				userFollow: !(this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_USER_FOLLOW),
				inviteSignup: !(this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_INVITE_SIGNUP),
				playlistSubscribe: !(this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_PLAYLIST_SUBSCRIBE),
				newFeature: !(this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_NEW_FEATURE)
			};
			this.rssFeeds = {
				listens: !(this.FeedsDisabled & GS.Models.UserSettings.RSS_LISTENS),
				favorites: !(this.FeedsDisabled & GS.Models.UserSettings.RSS_FAVORITES)
			}
		},
		updateProfile: function (b, c, g) {
			b = a.extend({}, {
				FName: this.FName,
				Email: this.Email,
				Country: this.Country,
				Zip: this.Zip,
				Sex: this.Sex,
				TSDOB: this.TSDOB
			}, b);
			console.log("save profile post extend", b);
			if (this.UserID < 1) a.isFunction(g) && g("Not logged in");
			else b.Email !== this.Email && !_.defined(b.password) ? GS.lightbox.open("confirmPasswordProfile", {
				params: b,
				callback: c,
				errback: g
			}) : GS.service.changeUserInfo(b.FName, "", b.Email, b.Country, b.Zip, b.Sex, b.TSDOB, b.password, this.callback(this._saveProfileSuccess, b, c, g), this.callback(this._saveProfileFailed, g))
		},
		_saveProfileSuccess: function (b, c, g, h) {
			if (h && h.statusCode === 1) {
				console.log("user_settings.save.success", h);
				a.extend(this, b);
				a.isFunction(c) && c(h)
			} else this._saveProfileFailed(g, h)
		},
		_saveProfileFailed: function (b, c) {
			console.log("user_settings.save.failed", c);
			a.isFunction(b) && b(c)
		},
		changeNotificationSettings: function (b, c, g) {
			b = a.extend({}, this.emailNotifications, b);
			b = (b.userFollow ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_USER_FOLLOW) | (b.inviteSignup ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_INVITE_SIGNUP) | (b.playlistSubscribe ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_PLAYLIST_SUBSCRIBE) | (b.newFeature ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_NEW_FEATURE);
			if (this.UserID < 1) a.isFunction(g) && g("Not logged in");
			else GS.service.changeNotificationSettings(b, this.callback(this._notificationsSuccess, b, c, g), this.callback(this._notificationsFailed, g))
		},
		_notificationsSuccess: function (b, c, g, h) {
			if (h && h.statusCode === 1) {
				console.log("user_settings.notifications.success", h);
				this.NotificationEmailPrefs = b;
				this._updateBitmaskProps();
				a.isFunction(c) && c(h)
			} else this._notificationsFailed(g, h)
		},
		_notificationsFailed: function (b, c) {
			console.log("user_settings.notifications.failed", c);
			a.isFunction(b) && b(c)
		},
		changeRSSSettings: function (b, c, g) {
			b = a.extend({}, this.rssFeeds, b);
			b = (b.listens ? 0 : GS.Models.UserSettings.RSS_LISTENS) | (b.favorites ? 0 : GS.Models.UserSettings.RSS_FAVORITES);
			if (this.UserID < 1) a.isFunction(g) && g("Not logged in");
			else GS.service.changeFeedSettings(b, this.callback(this._notificationsSuccess, b, c, g), this.callback(this._notificationsFailed, g))
		},
		_rssSuccess: function (b, c, g, h) {
			if (h && h.statusCode === 1) {
				console.log("user_settings.rss.success", h);
				this.FeedsDisabled = b;
				this._updateBitmaskProps();
				a.isFunction(c) && c(h)
			} else this._rssFailed(g, h)
		},
		_rssFailed: function (b, c) {
			console.log("user_settings.rss.failed", c);
			a.isFunction(b) && b(c)
		},
		changeLocalSettings: function (b, c, g) {
			a.extend(this.local, b);
			try {
				store.set("player.restoreQueue" + this.UserID, this.local.restoreQueue);
				store.set("player.lowerQuality" + this.UserID, this.local.lowerQuality);
				store.set("player.noPrefetch" + this.UserID, this.local.noPrefetch);
				store.set("player.playPauseFade" + this.UserID, this.local.playPauseFade);
				store.set("player.crossfadeAmount" + this.UserID, this.local.crossfadeAmount);
				store.set("player.crossfadeEnabled" + this.UserID, this.local.crossfadeEnabled);
				store.set("player.lastShuffle" + this.UserID, this.local.lastShuffle);
				store.set("player.persistShuffle" + this.UserID, this.local.persistShuffle);
				store.set("user.tooltips" + this.UserID, this.local.tooltips)
			} catch (h) {
				a.isFunction(g) && g(this);
				return
			}
			a.publish("gs.settings.local.update", this.local);
			a.isFunction(c) && c(this)
		}
	})
})(jQuery);
(function (a) {
	GS.Models.Base.extend("GS.Models.Video", {
		wrapYoutube: function (b) {
			var c = b.Thumbnails.length && b.Thumbnails[0] ? b.Thumbnails[0].url : "";
			return this.wrap(a.extend(true, {}, b, {
				title: b.Video,
				duration: _.millisToMinutesSeconds(b.Duration * 1E3),
				type: "youtube",
				swf: "http://www.youtube.com/v/" + b.VideoID + "?version=3&enablejsapi=1&version=3&fs=1",
				thumbnail: c,
				width: 480,
				height: 385,
				author: ""
			}))
		}
	}, {
		title: "",
		author: "",
		type: "flash",
		swf: "/webincludes/flash/videoplayer.swf",
		src: "",
		thumb: null,
		thumbnail: null,
		width: 480,
		height: 385,
		flashvars: {
			version: gsConfig.coreVersion
		},
		params: {
			allowscriptaccess: true,
			allowfullscreen: true
		},
		attributes: {
			name: "videoPlayer"
		},
		object: null,
		init: function (b) {
			b && this._super(b)
		},
		embed: function (b) {
			if (this.type == "flash") object = swfobject.embedSWF(this.swf, b, this.width, this.height, "9.0.0", null, this.flashvars, this.params, this.attributes);
			else if (this.type == "iframe") {
				var c = a("<iframe />").width(this.width).height(this.height).attr("src", this.src);
				a("#" + b).html(c)
			} else this.type == "youtube" && GS.youtube.attachPlayer(this.VideoID, this.width, this.height)
		}
	})
})(jQuery);
(function () {
	GS.Models.Base.extend("GS.Models.Visualizer", {}, {
		title: "",
		author: "",
		swf: "/webincludes/flash/visualizerplayer.swf",
		src: "",
		thumb: null,
		width: 480,
		height: 385,
		flashvars: {
			version: gsConfig.coreVersion
		},
		params: {
			allowscriptaccess: true,
			allowfullscreen: true,
			wmode: "window"
		},
		attributes: {
			name: "visualizerPlayer"
		},
		object: null,
		init: function (a) {
			a && this._super(a)
		},
		embed: function (a) {
			object = swfobject.embedSWF(this.swf, a, this.width, this.height, "9.0.0", null, this.flashvars, this.params, this.attributes)
		}
	})
})(jQuery);
$.extend($.View.EJS.Helpers.prototype, {
	localeTag: function (a, b, c) {
		c = c || {};
		c["data-translate-text"] = b;
		return [this.tag(a, c), $.localize.getString(b), this.tagEnd(a)].join("")
	},
	tag: function (a, b, c) {
		var g = ["<" + a];
		_.forEach(b, function (h, k) {
			g.push(" " + k + '="' + h + '"')
		});
		g.push(c || ">");
		return g.join("")
	},
	tagEnd: function (a) {
		return ["</", a, ">"].join("")
	}
});
jQuery.Controller.extend("GS.Controllers.BaseController", {
	init: function () {
		this._super();
		if (this.onWindow) new this($(window));
		else this.onElement && new this($(this.onElement))
	},
	instance: function () {
		if (this.onDocument) return $(document.documentElement).controller(this._shortName);
		if (this.onWindow) return $(window).controller(this._shortName);
		if (this.onElement) return $(this.onElement).controller(this._shortName);
		if (this.hasActiveElement) return $(this.hasActiveElement).controller(this._shortName);
		throw "BaseController. controller, " + this._shortName + ", is improperly embedded on page";
	},
	viewBundles: {},
	bundleVersions: {}
}, {
	init: function () {
		this.subscribe("gs.app.ready", this.callback(this.appReady))
	},
	appReady: function () {},
	subscriptions: [],
	detach: function () {
		if (!this._detached) {
			var a = this,
				b = this.Class._fullName;
			$.each(this._bindings, function (c, g) {
				$.isFunction(g) && g(a.element[0])
			});
			this._bindings = [];
			this.element.removeClass(b);
			for ((b = this.element.find(".gs_grid:last").controller()) && b.grid.destroy(); this.subscriptions.length;) $.unsubscribe(this.subscriptions.pop());
			this._detached = true
		}
	},
	reattach: function () {
		if (this._detached) {
			var a = this.Class;
			this.element.addClass(a._fullName);
			for (var b in a.actions) {
				ready = a.actions[b] || a._getAction(b, this.options);
				this._bindings.push(ready.processor(this.element, ready.parts[2], ready.parts[1], this.callback(b), this))
			}
			this._detached = false
		}
	},
	subscribe: function (a, b, c) {
		(c = _.orEqual(c, true)) ? this.subscriptions.push($.subscribe(a, b)) : $.subscribe(a, b)
	},
	view: function (a, b, c, g) {
		var h = ["gs", "views"];
		if (a.match(/^themes/)) h = [a];
		else if (a.match(/^\//)) h.push(a.replace(/^\//, ""));
		else {
			h.push(this.Class._shortName);
			h.push(a)
		}
		h = "/" + h.join("/");
		h += $.View.ext;
		var k = h.replace(/[\/\.]/g, "_").replace(/_+/g, "_").replace(/^_/, ""),
			m = GS.Controllers.BaseController.viewBundles[k],
			o = GS.Controllers.BaseController.bundleVersions[m] || "",
			r = "",
			s = true;
		b = _.orEqual(b, this);
		c = this.calculateHelpers.call(this, c);
		if ($.View.preCached[k] || !m) return $.View(h, b, c);
		g = _.orEqual(g, 0);
		if (!(g >= 3)) {
			if (g > 0) s = false;
			$.ajax({
				contentType: "application/json",
				dataType: "json",
				type: "GET",
				url: "/gs/views/" + m + ".json?" + o,
				async: false,
				cache: s,
				success: this.callback(function (u) {
					if (u) {
						_.forEach(u, function (w, C) {
							$.View.preCached[C] = w
						});
						r = $.View(h, b, c)
					} else {
						g++;
						setTimeout(this.callback(function () {
							this.view(a, b, c, g)
						}), 100 + g * 100)
					}
				}),
				error: this.callback(function () {
					g++;
					setTimeout(this.callback(function () {
						this.view(a, b, c, g)
					}), 100 + g * 100)
				})
			});
			return r
		}
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.AirbridgeController", {
	onDocument: true
}, {
	isDesktop: false,
	_bridge: null,
	oldWindowOpen: null,
	init: function () {
		if (window.parentSandboxBridge) {
			this.isDesktop = true;
			this._bridge = window.parentSandboxBridge;
			window.childSandboxBridge = this;
			window.console.error = this._bridge.consoleError;
			window.store.set = this._bridge.storeSet;
			window.store.get = this._bridge.storeGet;
			window.store.remove = this._bridge.storeRemove;
			window.store.clear = this._bridge.storeClear;
			gsConfig.assetHost = "http://" + window.location.host;
			$.subscribe("gs.player.playstatus", this.callback(this._onPlayStatus));
			$.subscribe("gs.player.queue.change", this.callback(this._onQueueChange));
			$.subscribe("gs.auth.favorites.songs.add", this.callback(this._onFavLibChanged));
			$.subscribe("gs.auth.favorites.songs.remove", this.callback(this._onFavLibChanged));
			$.subscribe("gs.auth.library.add", this.callback(this._onFavLibChanged));
			$.subscribe("gs.auth.library.remove", this.callback(this._onFavLibChanged));
			var a = this;
			$("body").delegate('a[target="_blank"]', "click", function (b) {
				if (!$(b.target).closest("a").hasClass("airNoFollow")) {
					b.preventDefault();
					b = $(b.target).closest("a").attr("href");
					a._bridge.consoleWarn(b);
					b && a._bridge.navigateToUrl(b, "_blank");
					return false
				}
			});
			this.oldWindowOpen = window.open;
			window.open = function (b, c, g) {
				g = _.orEqual(g, "width=800,height=600");
				return c == "_blank" ? a._bridge.navigateToUrl(b, c) : a.oldWindowOpen.call(window, b, c, g)
			}
		}
		this._super()
	},
	_lastStatus: null,
	_onPlayStatus: function (a) {
		if (a && this._lastStatus) if (a.status === this._lastStatus.status) if (!a.activeSong && !this._lastStatus.activeSong) {
			this._lastStatus = a;
			return
		} else if (a.activeSong && this._lastStatus.activeSong) if (a.activeSong.SongID == this._lastStatus.activeSong.SongID && a.activeSong.autoplayVote == this._lastStatus.activeSong.autoplayVote) {
			this._lastStatus = a;
			return
		}
		this._lastStatus = a;
		this._bridge && this._bridge.playerChange()
	},
	_onQueueChange: function () {
		this._bridge && this._bridge.playerChange()
	},
	_onFavLibChanged: function (a) {
		if (a && GS.player.queue && GS.player.queue.activeSong && parseInt(a.SongID, 10) == parseInt(GS.player.queue.activeSong.SongID, 10)) {
			GS.player.queue.activeSong.isFavorite = a.isFavorite;
			GS.player.queue.activeSong.fromLibrary = a.fromLibrary;
			this._bridge && this._bridge.playerChange()
		}
	},
	appReady: function () {
		this._bridge && this._bridge.ready()
	},
	getDesktopPreferences: function () {
		return this._bridge ? this._bridge.getDesktopPreferences() : null
	},
	setDesktopPreferences: function (a) {
		this._bridge && this._bridge.setDesktopPreferences(a)
	},
	displayNotification: function (a, b) {
		$.publish("gs.notification", {
			type: a,
			message: $.localize.getString(b)
		})
	},
	getQueueStatus: function () {
		var a = GS.player.getCurrentQueue(true);
		a || (a = {});
		if (a.activeSong) {
			a.activeSong.url = "http://listen.grooveshark.com/" + a.activeSong.toUrl().replace("#/", "");
			a.activeSong.imageUrl = a.activeSong.getImageURL()
		}
		a.playStatus = GS.player.lastStatus;
		return a
	},
	setHash: function (a) {
		window.location.hash = a
	},
	safeToClose: function () {
		return window.onbeforeunload()
	},
	addSongsToQueueAt: function () {
		return GS.player.addSongsToQueueAt.apply(GS.player, arguments)
	},
	playSong: function () {
		return GS.player.playSong.apply(GS.player, arguments)
	},
	pauseSong: function () {
		return GS.player.pauseSong.apply(GS.player, arguments)
	},
	resumeSong: function () {
		return GS.player.resumeSong.apply(GS.player, arguments)
	},
	stopSong: function () {
		return GS.player.stopSong.apply(GS.player, arguments)
	},
	previousSong: function () {
		return GS.player.previousSong.apply(GS.player, arguments)
	},
	nextSong: function () {
		return GS.player.nextSong.apply(GS.player, arguments)
	},
	flagSong: function () {
		return GS.player.flagSong.apply(GS.player, arguments)
	},
	voteSong: function () {
		return GS.player.voteSong.apply(GS.player, arguments)
	},
	getIsMuted: function () {
		return GS.player.getIsMuted.apply(GS.player, arguments)
	},
	setIsMuted: function () {
		return GS.player.setIsMuted.apply(GS.player, arguments)
	},
	getVolume: function () {
		return GS.player.getVolume.apply(GS.player, arguments)
	},
	setVolume: function () {
		return GS.player.setVolume.apply(GS.player, arguments)
	},
	getShuffle: function () {
		return GS.player.getShuffle.apply(GS.player, arguments)
	},
	setShuffle: function () {
		return GS.player.setShuffle.apply(GS.player, arguments)
	},
	setAutoplay: function () {
		return GS.player.setAutoplay.apply(GS.player, arguments)
	},
	clearQueue: function () {
		return GS.player.clearQueue.apply(GS.player, arguments)
	},
	getRepeat: function () {
		return GS.player.getRepeat.apply(GS.player, arguments)
	},
	setRepeat: function () {
		return GS.player.setRepeat.apply(GS.player, arguments)
	},
	addPlaylist: function (a, b, c) {
		GS.Models.Playlist.getPlaylist(a, function (g) {
			g.play(b, c)
		}, null, false)
	},
	addSongFromToken: function (a, b, c) {
		GS.Models.Song.getSongFromToken(a, function (g) {
			GS.player.addSongsToQueueAt([g.SongID], b, c)
		}, null, false)
	},
	favoriteSong: function (a) {
		GS.user.addToSongFavorites(a)
	},
	unfavoriteSong: function (a) {
		GS.user.removeFromSongFavorites(a)
	},
	addSongToLibrary: function (a) {
		GS.user.addToLibrary([a])
	},
	removeSongFromLibrary: function (a) {
		GS.user.removeFromLibrary(a)
	},
	executeProtocol: function (a) {
		GS.Controllers.ApiController.instance().executeProtocol(a)
	}
});
(function () {
	function a(n, p, q, t, x, E, F) {
		this.methodName = n;
		this.parameters = _.orEqual(p, {});
		this.useHTTPS = _.orEqual(E, false);
		this.useSWF = _.orEqual(F, false);
		this.callback = _.orEqual(q, null);
		this.errback = _.orEqual(t, null);
		this.overrideHeaders = {};
		this.options = _.orEqual(x, {});
		this.type = "normal";
		this.failedAuth = false
	}
	function b(n, p, q, t, x) {
		this.method = _.orEqual(n, "");
		this.parameters = _.orEqual(p, {});
		this.httpMethod = _.orEqual(q, "POST");
		this.callback = _.orEqual(t, null);
		this.errback = _.orEqual(x, null);
		this.type = "facebook"
	}

	function c(n, p, q, t) {
		this.method = n;
		this.parameters = _.orEqual(p, {});
		this.callback = _.orEqual(q, null);
		this.errback = _.orEqual(t, null);
		this.type = "lastfm"
	}
	function g() {
		function n() {
			if (p.queue.length) {
				p.pendingRequest = p.queue.shift();
				var q = p.pendingRequest.callback,
					t = p.pendingRequest.errback;
				p.pendingRequest.callback = function (x) {
					p.pendingRequest = null;
					$.isFunction(q) && q(x);
					n()
				};
				p.pendingRequest.errback = function (x) {
					p.pendingRequest = null;
					$.isFunction(t) && t(x);
					n()
				};
				h(p.pendingRequest)
			}
		}
		var p = this;
		this.queue = [];
		this.pendingRequest = null;
		this.queueRequest = function (q) {
			this.queue.push(q);
			this.pendingRequest || n()
		}
	}
	function h(n, p) {
		var q = true,
			t = new Date;
		p = _.orEqual(p, 0);
		if (p >= 3) console.error("service.sendRequest. numRetries maxed out. ", n);
		else {
			if (p > 0) q = false;
			GS.service = GS.service || GS.Controllers.ServiceController.instance();
			if (n.type == "facebook" || n.type == "lastfm") if ($.isFunction(GS.service.swfProxy)) {
				q = r();
				GS.service.outgoingSWFCalls[q] = n;
				GS.service.swfProxy(n, {}, q)
			} else GS.service.callsPendingSWF.push(n);
			else if (GS.service.tokenExpires > t.valueOf() || n.methodName == "getCommunicationToken" || n.methodName == "initiateSession" || n.methodName == "getServiceStatus") if (GS.service.downForMaintenance && n.methodName != "getServiceStatus") $.isFunction(n.errback) && n.errback({
				message: $.localize.getString("SERVICE_DOWN_MAINTENANCE"),
				code: GS.service.faultCodes.MAINTENANCE
			});
			else {
				var x = "http://" + GS.service.hostname + "/" + GS.service.defaultEndpoint + "?" + n.methodName;
				t = {
					header: A(n.overrideHeaders),
					method: n.methodName,
					parameters: n.parameters
				};
				if (GS.service.currentToken) {
					GS.service.lastRandomizer = o();
					var E = hex_sha1(n.methodName + ":" + GS.service.currentToken + ":quitStealinMahShit:" + GS.service.lastRandomizer);
					t.header.token = GS.service.lastRandomizer + E
				}
				if (n.useSWF || n.useHTTPS) if ($.isFunction(GS.service.swfProxy)) {
					q = r();
					GS.service.outgoingSWFCalls[q] = n;
					GS.service.swfProxy(n, t.header, q)
				} else GS.service.callsPendingSWF.push(n);
				else $.ajax($.extend({}, n.options, {
					contentType: "application/json",
					dataType: "json",
					type: "POST",
					data: JSON.stringify(t),
					cache: q,
					url: x,
					success: function (F) {
						if (F) k(F, n);
						else {
							p++;
							console.error("service.success NO DATA.  retry request again", n);
							setTimeout(function () {
								h(n, p)
							}, 100 + p * 100)
						}
					},
					error: function (F, I, J) {
						console.error("ajax error: status: " + I + ", error: " + J, F, n);
						F = {};
						switch (I) {
						case "parsererror":
							F.code = GS.service.faultCodes.PARSE_ERROR;
							F.message = $.localize.getString("SERVICE_PARSE_JSON");
							break;
						case "timeout":
							F.code = GS.service.faultCodes.HTTP_TIMEOUT;
							F.message = $.localize.getString("SERVICE_REQUEST_TIMEOUT");
							p++;
							console.error("service.sendRequest.error.timeout.  retry request again", n);
							setTimeout(function () {
								h(n, p)
							}, 100 + p * 100);
							return;
						case "error":
						case "notmodified":
						default:
							F.code = GS.service.faultCodes.HTTP_ERROR;
							F.message = $.localize.getString("SERVICE_HTTP_ERROR");
							break
						}
						$.isFunction(n.errback) && n.errback(F)
					}
				}))
			} else {
				GS.service.callsPendingToken.push(n);
				GS.service.tokenPending || s()
			}
		}
	}
	function k(n, p) {
		if (n && n.header) {
			var q = n.header.session;
			if (q && q != GS.service.sessionID) {
				GS.service.sessionID = q;
				s()
			}
			q = n.header.secondsUntilDowntime;
			if (q < 0) setTimeout(y, 5E3);
			else if (q > 0) {
				q = Math.floor(q / 60);
				var t = (new Date).valueOf();
				if (q <= 60) if (lastDowntimeNotification == 0 || q > 30 && t - lastDowntimeNotification > 36E5 || q <= 30 && q > 15 && t - lastDowntimeNotification > 18E5 || q <= 15 && q > 10 && t - lastDowntimeNotification > 9E5 || q <= 10 && q > 5 && t - lastDowntimeNotification > 6E5 || q <= 5 && t - lastDowntimeNotification > 3E5) {
					lastDowntimeNotification = t;
					q = new GS.Models.DataString($.localize.getString("NOTIFICATION_MAINTENANCE_WARNING"), {
						min: q
					});
					$.publish("gs.notification", {
						type: "info",
						message: q
					})
				}
			}
		}
		if (n && n.fault) m(n.fault, p);
		else $.isFunction(p.callback) && p.callback(n.result)
	}
	function m(n, p) {
		console.error("HANDLE FAULT CODE", n.code);
		if (n.code == GS.service.faultCodes.INVALID_TOKEN) if (GS.service.lastTokenFailed) $.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("SERVICE_ERROR_COMMUNICATING")
		});
		else {
			GS.service.callsPendingToken.push(p);
			GS.service.tokenPending || s();
			return
		} else if (n.code == GS.service.faultCodes.MAINTENANCE) setTimeout(y, 5E3);
		else if (n.code == GS.service.faultCodes.INVALID_CLIENT) {
			console.log("INVALID CLIENT");
			GS.lightbox.open("invalidClient")
		} else if (n.code == GS.service.faultCodes.MUST_BE_LOGGED_IN) if (!p.failedAuth) {
			p.failedAuth = true;
			GS.service.callsPendingAuth.push(p);
			if (!GS.service.reauthPending) {
				GS.service.reauthPending = true;
				GS.service.reauthPending = true;
				GS.auth.reauthenticate(H, K)
			}
			return
		}
		$.isFunction(p.errback) && p.errback(n)
	}
	function o() {
		for (var n = "", p = 0; p < 6; p++) n += Math.floor(Math.random() * 16).toString(16);
		return n != GS.service.lastRandomizer ? n : o()
	}
	function r() {
		var n = String(Math.floor(Math.random() * 1E4));
		return !GS.service.outgoingSWFCalls[n] ? n : r()
	}

	function s() {
		GS.service.currentToken = null;
		GS.service.tokenExpires = 0;
		GS.service.tokenPending = true;
		if (GS.service.sessionID) {
			var n = hex_md5(GS.service.sessionID);
			req = new a("getCommunicationToken", {
				secretKey: n
			}, u, w, {}, true)
		} else req = new a("initiateSession", {});
		h(req)
	}
	function u(n) {
		var p = new Date;
		GS.service.lastTokenFailed = false;
		GS.service.currentToken = n;
		GS.service.tokenPending = false;
		for (GS.service.tokenExpires = 15E5 + p.valueOf(); GS.service.callsPendingToken.length;) {
			req = GS.service.callsPendingToken.shift();
			h(req)
		}
	}
	function w() {
		GS.service.tokenPending = false;
		for (GS.service.lastTokenFailed = true; GS.service.callsPendingToken.length;) {
			req = GS.service.callsPendingToken.shift();
			$.isFunction(req.errback) && req.errback({
				fault: {
					message: $.localize.getString("SERVICE_CREATE_TOKEN_FAIL"),
					code: GS.service.faultCodes.BAD_TOKEN
				}
			})
		}
	}
	function C(n) {
		GS.service = _.orEqual(GS.service, GS.Controllers.ServiceController.instance());
		for (GS.service.country = n ? n : {
			CC1: 0,
			ID: 223,
			CC4: 1073741824,
			CC3: 0,
			CC2: 0
		}; GS.service.callsPendingCountry.length;) {
			req = GS.service.callsPendingCountry.shift();
			req.parameters.country = GS.service.country;
			h(req)
		}
	}
	function v() {
		for (GS.service.country = {
			CC1: 0,
			ID: 223,
			CC4: 1073741824,
			CC3: 0,
			CC2: 0
		}; GS.service.callsPendingCountry.length;) {
			req = GS.service.callsPendingCountry.shift();
			req.parameters.country = GS.service.country;
			h(req)
		}
	}
	function H() {
		GS.service.reauthPending = false;
		for (var n; n = GS.service.callsPendingAuth.shift();) h(n)
	}
	function K() {
		GS.service.reauthPending = false;
		for (var n; n = GS.service.callsPendingAuth.shift();) $.isFunction(n.errback) && n.errback({
			code: GS.service.faultCodes.MUST_BE_LOGGED_IN,
			message: $.localize.getString("SERVICE_LOGIN_REQUIRED")
		})
	}
	function A(n) {
		n = _.orEqual(n, {});
		var p = {
			client: GS.service.client,
			clientRevision: GS.service.clientRevision,
			privacy: GS.service.privacy,
			country: GS.service.country,
			uuid: GS.service.uuID
		};
		if (GS.service.sessionID) p.session = GS.service.sessionID;
		return $.extend(p, n)
	}
	function y() {
		if (!GS.service.downForMaintenance) {
			GS.service.downForMaintenance = true;
			GS.lightbox.open("maintenance");
			B()
		}
	}
	function B() {
		req = new a("getServiceStatus", {}, D, G);
		h(req)
	}
	function D(n) {
		if (n.status == 1) {
			GS.service.downForMaintenance = false;
			GS.lightbox.close()
		} else setTimeout(B, 2E4)
	}
	function G() {
		setTimeout(B, 2E4)
	}
	GS.Controllers.BaseController.extend("GS.Controllers.ServiceController", {
		onDocument: true
	}, {
		hostname: location.host,
		defaultEndpoint: null,
		allowHTTPS: false,
		client: "htmlshark",
		clientRevision: "20101222",
		uuID: null,
		sessionID: null,
		country: null,
		privacy: 0,
		runMode: null,
		sharkletHost: null,
		currentToken: null,
		tokenExpires: 0,
		tokenPending: false,
		lastTokenFailed: false,
		lastRandomizer: null,
		reauthPending: false,
		callsPendingToken: [],
		callsPendingAuth: [],
		callsPendingCountry: [],
		callsPendingSWF: [],
		outgoingSWFCalls: {},
		swfProxy: null,
		downForMaintenance: false,
		lastDowntimeNotification: 0,
		libraryQueue: null,
		playlistQueue: null,
		faultCodes: {
			INVALID_CLIENT: 1024,
			RATE_LIMITED: 512,
			INVALID_TOKEN: 256,
			INVALID_SESSION: 16,
			MAINTENANCE: 10,
			MUST_BE_LOGGED_IN: 8,
			HTTP_TIMEOUT: 6,
			PARSE_ERROR: 4,
			HTTP_ERROR: 2
		},
		init: function () {
			this.sessionID = gsConfig.sessionID;
			this.clientRevision = gsConfig.revision;
			this.country = gsConfig.country;
			this.privacy = gsConfig.user.Privacy;
			this.uuID = gsConfig.uuid;
			this.runMode = gsConfig.runMode;
			this.sharkletHost = gsConfig.sharkletHost;
			this.defaultEndpoint = _.orEqual(gsConfig.endpoint, "more.php");
			this.libraryQueue = new g;
			this.playlistQueue = new g;
			if (!this.sessionID) {
				req = new a("initiateSession", {}, null, null, {
					async: false
				});
				h(req)
			}
			if (this.country) C(this.country);
			else {
				req = new a("getCountry", {}, C, v, {
					async: false
				});
				h(req)
			}
			this._super();
			return true
		},
		swfReady: function () {
			for (var n = 0; n < this.callsPendingSWF.length; n++) h(this.callsPendingSWF[n]);
			this.callsPendingSWF = [];
			return true
		},
		swfBadHost: function () {
			GS.lightbox.open("badHost")
		},
		swfSuccess: function (n, p) {
			var q = this.outgoingSWFCalls[p];
			if (q) q.type !== "normal" && $.isFunction(q.callback) ? q.callback(n) : k(n, q);
			delete this.outgoingSWFCalls[p]
		},
		swfFault: function (n, p) {
			var q = this.outgoingSWFCalls[p];
			if (q) q.type !== "normal" && $.isFunction(q.errback) ? q.errback(n) : m(n, q);
			delete this.outgoingSWFCalls[p]
		},
		swfNeedsToken: function () {
			GS.service.tokenPending || s()
		},
		onChatData: function (n) {
			console.log("Got chat data:", n)
		},
		onChatError: function (n) {
			console.log("Got chat error, event:", n)
		},
		httpsFormSubmit: function (n, p) {
			var q = $("#httpsForm");
			$("#httpsIframe");
			var t = [];
			q.html("");
			q.attr("action", n);
			q.attr("method", "post");
			q.attr("target", "httpsIframe");
			q.attr("enctype", "multipart/form-data");
			_.forEach(p, function (x, E) {
				t.push('<input type="hidden" name="' + E + '" value="' + x + '" />')
			});
			q.append(t.join(""));
			q.submit()
		},
		isFirstVisit: function (n) {
			req = new a("isFirstVisit", {}, n, null, {}, false, true);
			h(req)
		},
		makeFacebookRequest: function (n, p, q, t, x) {
			req = new b(n, p, q, t, x);
			h(req)
		},
		lastfmHandshake: function (n, p, q) {
			req = new c("handshake", n, p, q);
			h(req)
		},
		lastfmNowPlaying: function (n, p, q) {
			req = new c("nowPlaying", n, p, q);
			h(req)
		},
		lastfmSongPlay: function (n, p, q) {
			req = new c("submission", n, p, q);
			h(req)
		},
		rapleafPersonalize: function (n, p, q) {
			req = new a("personalize", {
				redirectURL: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], false, true);
			req.type = "rapleaf";
			h(req)
		},
		rapleafDirect: function (n, p, q) {
			req = new a("direct", {
				email: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], false, true);
			req.type = "rapleaf";
			h(req)
		},
		getAlbumByID: function (n, p, q) {
			req = new a("getAlbumByID", {
				albumID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getArtistByID: function (n, p, q) {
			req = new a("getArtistByID", {
				artistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getPlaylistByID: function (n, p, q) {
			req = new a("getPlaylistByID", {
				playlistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getQueueSongListFromSongIDs: function (n, p, q) {
			req = new a("getQueueSongListFromSongIDs", {
				songIDs: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getSongFromToken: function (n, p, q) {
			req = new a("getSongFromToken", {
				token: n,
				country: this.country
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			this.country ? h(req) : this.callsPendingCountry.push(req)
		},
		getTokenForSong: function (n, p, q) {
			req = new a("getTokenForSong", {
				songID: n,
				country: this.country
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			this.country ? h(req) : this.callsPendingCountry.push(req)
		},
		getUserByID: function (n, p, q) {
			req = new a("getUserByID", {
				userID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getUserByUsername: function (n, p, q) {
			req = new a("getUserByUsername", {
				username: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		albumGetSongs: function (n, p, q, t, x) {
			p = _.orEqual(p, true);
			q = _.orEqual(q, 0);
			req = new a("albumGetSongs", {
				albumID: n,
				isVerified: p,
				offset: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		artistGetAlbums: function (n, p, q, t, x) {
			req = new a("artistGetAlbums", {
				artistID: n,
				isVerified: p,
				offset: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		artistGetSongs: function (n, p, q, t, x) {
			req = new a("artistGetSongs", {
				artistID: n,
				isVerified: p,
				offset: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		playlistGetSongs: function (n, p, q) {
			req = new a("playlistGetSongs", {
				playlistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		popularGetSongs: function (n, p, q) {
			var t = arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1];
			({
				daily: true,
				weekly: true,
				monthly: true
			})[n] || (n = "daily");
			req = new a("popularGetSongs", {
				type: n
			}, p, q, t);
			h(req)
		},
		getArtistsForTagRadio: function (n, p, q) {
			req = new a("getArtistsForTagRadio", {
				tagID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		albumGetFans: function (n, p, q, t) {
			req = new a("albumGetFans", {
				albumID: n,
				offset: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		artistGetFans: function (n, p, q, t) {
			req = new a("artistGetFans", {
				artistID: n,
				offset: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		playlistGetFans: function (n, p, q) {
			req = new a("playlistGetFans", {
				playlistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		songGetFans: function (n, p, q, t) {
			req = new a("songGetFans", {
				songID: n,
				offset: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		userGetFans: function (n, p, q, t) {
			req = new a("userGetFans", {
				userID: n,
				offset: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		authenticateUser: function (n, p, q, t, x) {
			req = new a("authenticateUser", {
				username: n,
				password: p,
				savePassword: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		authenticateFacebookUser: function (n, p, q, t, x, E) {
			req = new a("authenticateFacebookUser", {
				facebookUserID: n,
				sessionKey: p,
				accessToken1: q,
				accessToken3: t
			}, x, E, arguments[arguments.length - 1] === E ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		authenticateGoogleUser: function (n, p) {
			req = new a("authenticateGoogleUser", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		getStoredUsers: function (n, p) {
			req = new a("getStoredUsers", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], false, true);
			h(req)
		},
		deleteStoredUser: function (n, p, q) {
			req = new a("deleteStoredUser", {
				username: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], false, true);
			h(req)
		},
		loginStoredUser: function (n, p, q) {
			req = new a("loginStoredUser", {
				username: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		reportUserChange: function (n, p, q, t, x) {
			req = new a("reportUserChange", {
				userID: n,
				username: p,
				privacy: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1], false, true);
			h(req)
		},
		killAuthToken: function (n, p) {
			req = new a("killAuthToken", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], false, true);
			h(req)
		},
		logoutUser: function (n, p) {
			req = new a("logoutUser", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], false, true);
			h(req)
		},
		userForgotPassword: function (n, p, q) {
			req = new a("userForgotPassword", {
				usernameOrEmail: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		resetPassword: function (n, p, q, t, x) {
			req = new a("resetPassword", {
				usernameOrEmail: n,
				secretResetCode: p,
				newPassword: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		changePassword: function (n, p, q, t) {
			req = new a("changePassword", {
				oldPassword: n,
				newPassword: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		registerUser: function (n, p, q, t, x, E, F, I, J, L, M) {
			req = new a("registerUser", {
				username: n,
				password: p,
				firstName: q,
				lastName: t,
				emailAddress: x,
				sex: E,
				birthDate: F,
				inviteID: I,
				savePassword: J
			}, L, M, arguments[arguments.length - 1] === M ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		userDisableAccount: function (n, p, q, t, x, E) {
			req = new a("userDisableAccount", {
				password: n,
				reason: p,
				details: q,
				contact: t
			}, x, E, arguments[arguments.length - 1] === E ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		getIsUsernameEmailAvailable: function (n, p, q, t) {
			req = new a("getIsUsernameEmailAvailable", {
				username: n,
				emailAddress: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getUserByInviteID: function (n, p, q) {
			req = new a("getUserByInviteID", {
				inviteID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		sendInvites: function (n, p, q) {
			req = new a("sendInvites", {
				emailAddresses: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getUserSettings: function (n, p) {
			req = new a("getUserSettings", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		changeUserInfo: function (n, p, q, t, x, E, F, I, J, L) {
			req = new a("changeUserInfo", {
				fName: n,
				lName: p,
				email: q,
				country: t,
				zip: x,
				sex: E,
				birthday: F,
				password: I
			}, J, L, arguments[arguments.length - 1] === L ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		changeNotificationSettings: function (n, p, q) {
			req = new a("changeNotificationSettings", {
				newValue: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		changePrivacySettings: function (n, p, q) {
			req = new a("changePrivacySettings", {
				newValue: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		changeFeedSettings: function (n, p, q) {
			req = new a("changeFeedSettings", {
				newValue: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getSubscriptionDetails: function (n, p) {
			req = new a("getSubscriptionDetails", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		userGetSongsInLibrary: function (n, p, q, t) {
			p = _.orEqual(p, 0);
			req = new a("userGetSongsInLibrary", {
				userID: n,
				page: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		userGetLibraryTSModified: function (n, p, q) {
			req = new a("userGetLibraryTSModified", {
				userID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		userAddSongsToLibrary: function (n, p, q) {
			req = new a("userAddSongsToLibrary", {
				songs: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			this.libraryQueue.queueRequest(req)
		},
		userRemoveSongFromLibrary: function (n, p, q, t, x, E) {
			req = new a("userRemoveSongFromLibrary", {
				userID: n,
				songID: p,
				albumID: q,
				artistID: t
			}, x, E, arguments[arguments.length - 1] === E ? {} : arguments[arguments.length - 1]);
			this.libraryQueue.queueRequest(req)
		},
		getFavorites: function (n, p, q, t) {
			p = p || "Songs";
			req = new a("getFavorites", {
				userID: n,
				ofWhat: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		favorite: function (n, p, q, t, x) {
			req = new a("favorite", {
				what: n,
				ID: p,
				details: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			this.libraryQueue.queueRequest(req)
		},
		unfavorite: function (n, p, q, t) {
			req = new a("unfavorite", {
				what: n,
				ID: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.libraryQueue.queueRequest(req)
		},
		getUserSidebar: function (n, p) {
			req = new a("getUserSidebar", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		addShortcutToUserSidebar: function (n, p, q, t) {
			req = new a("addShortcutToUserSidebar", {
				what: n,
				id: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.libraryQueue.queueRequest(req)
		},
		removeShortcutFromUserSidebar: function (n, p, q, t) {
			req = new a("removeShortcutFromUserSidebar", {
				what: n,
				id: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.libraryQueue.queueRequest(req)
		},
		userGetPlaylists: function (n, p, q) {
			req = new a("userGetPlaylists", {
				userID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		createPlaylist: function (n, p, q, t, x) {
			req = new a("createPlaylist", {
				playlistName: n,
				songIDs: p,
				playlistAbout: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		deletePlaylist: function (n, p, q, t) {
			req = new a("deletePlaylist", {
				playlistID: n,
				name: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.playlistQueue.queueRequest(req)
		},
		playlistUndelete: function (n, p, q) {
			req = new a("playlistUndelete", {
				playlistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			this.playlistQueue.queueRequest(req)
		},
		overwritePlaylist: function (n, p, q, t) {
			req = new a("overwritePlaylist", {
				playlistID: n,
				songIDs: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.playlistQueue.queueRequest(req)
		},
		playlistAddSongToExisting: function (n, p, q, t) {
			req = new a("playlistAddSongToExisting", {
				playlistID: n,
				songID: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.playlistQueue.queueRequest(req)
		},
		renamePlaylist: function (n, p, q, t) {
			req = new a("renamePlaylist", {
				playlistID: n,
				playlistName: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.playlistQueue.queueRequest(req)
		},
		setPlaylistAbout: function (n, p, q, t) {
			req = new a("setPlaylistAbout", {
				playlistID: n,
				about: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			this.playlistQueue.queueRequest(req)
		},
		getSearchResultsEx: function (n, p, q, t, x) {
			req = new a("getSearchResultsEx", {
				query: n,
				type: p,
				guts: GS.guts ? GS.guts.shouldLog : 0,
				ppOverride: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getSearchSuggestion: function (n, p, q) {
			req = new a("getSearchSuggestion", {
				query: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getArtistAutocomplete: function (n, p, q) {
			req = new a("getArtistAutocomplete", {
				query: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getProcessedUserFeedData: function (n, p, q, t) {
			req = new a("getProcessedUserFeedData", {
				userID: n,
				day: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getCombinedProcessedFeedData: function (n, p, q, t, x) {
			req = new a("getCombinedProcessedFeedData", {
				userIDs: n,
				day: p,
				loggedInUserID: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getRecentlyActiveUsers: function (n, p) {
			req = new a("getRecentlyActiveUsers", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		feedsBanArtist: function (n, p, q) {
			req = new a("feedsBanArtist", {
				artistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		feedsUnbanArtist: function (n, p, q) {
			req = new a("feedsUnbanArtist", {
				artistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		feedsGetBannedArtists: function (n, p) {
			req = new a("feedsGetBannedArtists", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		feedsRemoveEventFromProfile: function (n, p, q, t) {
			req = new a("feedsRemoveEventFromProfile", {
				type: n,
				time: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		removeItemFromCommunityFeed: function (n, p, q, t) {
			req = new a("removeItemFromCommunityFeed", {
				key: n,
				day: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		changeFollowFlags: function (n, p, q) {
			req = new a("changeFollowFlags", {
				userIDsFlags: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getIsTargetingActive: function (n, p, q) {
			req = new a("getIsTargetingActive", {
				themeID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		logTargetedThemeImpression: function (n, p, q) {
			req = new a("logTargetedThemeImpression", {
				themeID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		logThemeOutboundLinkClick: function (n, p, q, t) {
			req = new a("logThemeOutboundLinkClick", {
				themeID: n,
				linkID: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		provideSongFeedbackMessage: function (n, p, q, t) {
			req = new a("provideSongFeedbackMessage", {
				songID: n,
				message: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		provideSongFeedbackVote: function (n, p, q, t, x) {
			req = new a("provideSongFeedbackVote", {
				songID: n,
				vote: p,
				artistID: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		sendShare: function (n, p, q, t, x, E, F, I) {
			req = new a("sendShare", {
				what: n,
				ID: p,
				people: q,
				country: this.country,
				override: t,
				message: x
			}, F, I, arguments[arguments.length - 1] === I ? {} : arguments[arguments.length - 1]);
			if (E) req.overrideHeaders.privacy = 1;
			this.country ? h(req) : this.callsPendingCountry.push(req);
			GS.guts.logEvent("itemSharePerformed", {
				type: n,
				id: p
			})
		},
		getContactInfoForFollowers: function (n, p) {
			req = new a("getContactInfoForFollowers", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		artistGetSongkickEvents: function (n, p, q, t) {
			req = new a("artistGetSongkickEvents", {
				artistID: n,
				name: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getGoogleAuthToken: function (n, p, q, t) {
			req = new a("getGoogleAuthToken", {
				Email: n,
				Passwd: p,
				source: "EscapeMG-Grooveshark-" + this.clientRevision
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		getGoogleContacts: function (n, p, q) {
			req = new a("getGoogleContacts", {
				authToken: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], false, true);
			h(req)
		},
		getDetailsForBroadcast: function (n, p, q) {
			req = new a("getDetailsForBroadcast", {
				songID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		broadcastSong: function (n, p, q, t, x, E, F, I, J) {
			req = new a("broadcastSong", {
				songID: n,
				message: p,
				username: q,
				password: t,
				saveCredentials: x,
				service: E,
				song: F
			}, I, J, arguments[arguments.length - 1] === J ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		logBroadcast: function (n, p, q, t, x) {
			req = new a("logBroadcast", {
				type: n,
				item: p,
				service: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getUserFacebookData: function (n, p) {
			req = new a("getUserFacebookDataEx", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], true);
			h(req)
		},
		saveUserFacebookData: function (n, p, q, t, x, E, F) {
			req = new a("saveUserFacebookDataEx", {
				facebookUserID: n,
				sessionKey: p,
				accessToken1: q,
				accessToken3: t,
				flags: x
			}, E, F, arguments[arguments.length - 1] === F ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		updateUserFacebookData: function (n, p, q, t, x, E, F) {
			req = new a("updateUserFacebookData", {
				facebookUserID: n,
				sessionKey: p,
				accessToken1: q,
				accessToken3: t,
				flags: x
			}, E, F, arguments[arguments.length - 1] === F ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		removeUserFacebookData: function (n, p) {
			req = new a("removeUserFacebookData", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getUserGoogleData: function (n, p) {
			req = new a("getUserGoogleData", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		saveUserGoogleData: function (n, p) {
			req = new a("saveUserGoogleData", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		removeUserGoogleData: function (n, p) {
			req = new a("removeUserGoogleData", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getUsernameSuggestions: function (n, p, q, t, x) {
			req = new a("getUsernameSuggestions", {
				baseUsername: n,
				fullName: p,
				idOrRand: q
			}, t, x, arguments[arguments.length - 1] === x ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		registerFacebookUser: function (n, p, q, t, x, E, F, I, J, L, M, O, N) {
			req = new a("registerFacebookUser", {
				username: n,
				firstName: p,
				emailAddress: q,
				sex: t,
				birthDate: x,
				inviteID: E,
				facebookUserID: F,
				sessionKey: I,
				accessToken1: J,
				accessToken3: L,
				flags: M
			}, O, N, arguments[arguments.length - 1] === N ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		getGroovesharkUsersFromFacebookUserIDs: function (n, p, q) {
			req = new a("getGroovesharkUsersFromFacebookUserIDs", {
				facebookUserIDs: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		registerGoogleUser: function (n, p, q, t, x, E, F, I, J) {
			req = new a("registerGoogleUser", {
				flags: n,
				username: p,
				firstName: q,
				emailAddress: t,
				sex: x,
				birthDate: E,
				inviteID: F
			}, I, J, arguments[arguments.length - 1] === J ? {} : arguments[arguments.length - 1], true, true);
			h(req)
		},
		removeUserGoogleLogin: function (n, p) {
			req = new a("removeUserGoogleLogin", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		updateLastfmService: function (n, p, q, t, x, E, F) {
			req = new a("updateLastfmService", {
				session: n,
				token: p,
				username: q,
				flagsAdd: t,
				flagsRemove: x
			}, E, F, arguments[arguments.length - 1] === F ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getLastfmService: function (n, p) {
			req = new a("getLastfmService", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		removeLastfmService: function (n, p) {
			req = new a("removeLastfmService", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getAffiliateDownloadURLs: function (n, p, q, t) {
			req = new a("getAffiliateDownloadURLs", {
				songName: n,
				artistName: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getServiceStatus: function (n, p) {
			req = new a("getServiceStatus", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		provideVIPFeedback: function (n, p, q, t) {
			req = new a("provideVIPFeedback", {
				fromAddress: n,
				message: p
			}, q, t, arguments[arguments.length - 1] === t ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getEmailAddress: function (n, p) {
			req = new a("getEmailAddress", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		sendMobileAppSMS: function (n, p, q, t, x, E) {
			req = new a("sendMobileAppSMS", {
				phoneNumber: n,
				platform: p,
				callingCode: q,
				country: t
			}, x, E, arguments[arguments.length - 1] === E ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getCountryFromRequestIP: function (n, p) {
			req = new a("getCountryFromRequestIP", {}, n, p, arguments[arguments.length - 1] === p ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		artistGetSimilarArtists: function (n, p, q) {
			req = new a("artistGetSimilarArtists", {
				artistID: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1]);
			h(req)
		},
		getThemeFromDFP: function (n, p, q) {
			req = new a("getThemeFromDFP", {
				paramString: n
			}, p, q, arguments[arguments.length - 1] === q ? {} : arguments[arguments.length - 1], false, true);
			req.type = "dfp";
			h(req)
		}
	})
})();
(function (a) {
	GS.Controllers.BaseController.extend("GS.Controllers.AuthController", {
		onWindow: true
	}, {
		init: function () {
			if (!gsConfig.user.Username) gsConfig.user.Username = "New User";
			if (!gsConfig.user.UserID) gsConfig.user.UserID = -1;
			this._handleLoginChange(GS.Models.AuthUser.wrap(gsConfig.user));
			this._super()
		},
		login: function (b, c, g, h, k) {
			GS.service.authenticateUser(b, c, g, this.callback(this._loginSuccess, "normal", h, k), this.callback(this._loginFailed, "normal", k))
		},
		reauthenticate: function (b, c) {
			GS.user.UserID > 0 ? GS.service.loginStoredUser(GS.user.UserName, this.callback(this._loginSuccess, "reauth", b, c), this.callback(this._loginFailed, "reauth", c)) : c({
				message: "Not logged in"
			})
		},
		loginViaFacebook: function (b, c) {
			GS.facebook.gsLogin(this.callback(this._loginSuccess, "facebook", b, c), this.callback(this._loginFailed, "facebook", c))
		},
		loginViaGoogle: function (b, c) {
			GS.google.login(this.callback(this._loginSuccess, "google", b, c), this.callback(this._loginFailed, "google", c))
		},
		_loginSuccess: function (b, c, g, h) {
			if (h && h.userID == 0 || !h) return this._loginFailed(b, g, h);
			console.log("login.success", h);
			h.authType = b;
			b == "reauth" && h.userID === GS.user.UserID || GS.service.getUserByID(h.userID, this.callback(this._updateUser, h));
			if ((gsConfig.isPreview || GS.airbridge && GS.airbridge.isDesktop) && parseInt(h.isPremium, 10) !== 1) {
				if (a.isFunction(g)) {
					h.error = "POPUP_SIGNUP_LOGIN_FORM_PREMIUM_REQUIRED_ERROR";
					g(h)
				}
			} else a.isFunction(c) && c(h);
			return h
		},
		_loginFailed: function (b, c, g) {
			g || (g = {});
			g.authType = b;
			console.log("login.failed", g);
			b == "reauth" && this._logoutSuccess({});
			a.isFunction(c) && c(g);
			return g
		},
		logout: function () {
			GS.service.logoutUser(this.callback(this._logoutSuccess), this.callback(this._logoutFailed))
		},
		_logoutSuccess: function (b) {
			console.log("logout.success", b);
			GS.user.clearData();
			GS.guts.logEvent("logout", {});
			GS.guts.endContext("userID");
			location.hash = "/";
			this._handleLoginChange(GS.Models.AuthUser.wrap({}))
		},
		_logoutFailed: function (b) {
			console.log("logout.failed", b)
		},
		signup: function (b, c, g, h, k, m, o, r, s) {
			var u = this._getInviteCode();
			GS.service.registerUser(b, c, g, "", h, k, m, u, o, this.callback(this._signupSuccess, "normal", u, r, s), this.callback(this._signupFailed, "normal", s))
		},
		signupViaFacebook: function (b, c, g, h, k, m, o, r) {
			var s = this._getInviteCode();
			GS.service.registerFacebookUser(b, c, g, h, k, s, m.facebookUserID, m.sessionKey, m.accessToken1, m.accessToken3, 0, this.callback(this._signupSuccess, "facebook", s, o, r), this.callback(this._signupFailed, "facebook", r))
		},
		signupViaGoogle: function (b, c, g, h, k, m, o) {
			var r = this._getInviteCode();
			GS.service.registerGoogleUser(0, b, c, g, h, k, r, this.callback(this._signupSuccess, "google", r, m, o), this.callback(this._signupFailed, "google", o))
		},
		_signupSuccess: function (b, c, g, h, k) {
			if (k && k.userID == 0 || !k) return this._signupFailed(b, h, k);
			console.log("signup.success", k);
			k.authType = b;
			if (c) {
				store.set("lastInviteCode", null);
				gsConfig.inviteCode = null;
				GS.service.getUserByInviteID(c, this.callback(this._getInviterSuccess))
			}
			switch (b) {
			case "facebook":
				k.Flags = 4;
				break;
			case "google":
				k.Flags = 32;
				break
			}
			k.doNotReset = true;
			GS.service.getUserByID(k.userID, this.callback(this._updateUser, k));
			a.isFunction(g) && g(k);
			return k
		},
		_signupFailed: function (b, c, g) {
			g || (g = {});
			g.authType = b;
			console.log("signup.failed", g);
			a.isFunction(c) && c(g);
			return g
		},
		_getInviteCode: function () {
			var b = "",
				c = new Date,
				g = store.get("lastInviteCode");
			if (g) if (g.expires && g.expires > c.valueOf()) b = g.inviteCode;
			else store.set("lastInviteCode", null);
			else if (gsConfig.inviteCode) b = gsConfig.inviteCode;
			return b
		},
		_getInviterSuccess: function (b) {
			b = GS.Models.User.wrap(b);
			GS.lightbox.open("followInviter", {
				user: b
			})
		},
		_updateUser: function (b, c) {
			console.log("auth.user.updateUser", b, c);
			c.User.UserID = b.userID;
			if (!b.doNotReset) location.hash = "/";
			var g = a.extend({}, b, c.User);
			this._handleLoginChange(GS.Models.AuthUser.wrapFromService(g), b)
		},
		_handleLoginChange: function (b, c) {
			if (GS.user && GS.user.isDirty) {
				_.forEach(GS.user.playlists, function (h) {
					var k = [];
					_.forEach(h.songs, function (m) {
						k.push(m.SongID)
					});
					b.createPlaylist(h.PlaylistName, k, h.Description, function (m) {
						m.addShortcut(false)
					}, null, false)
				});
				var g = _.map(GS.user.library.songs, function (h) {
					return h.SongID
				});
				b.addToLibrary(g, false);
				_.forEach(GS.user.favorites.playlists, function (h) {
					b.addToPlaylistFavorites(h.PlaylistID, false)
				});
				_.forEach(GS.user.favorites.songs, function (h) {
					b.addToSongFavorites(h.SongID, false)
				});
				_.forEach(GS.user.favorites.users, function (h) {
					b.addToUserFavorites(h.UserID, false)
				});
				_.forEach(GS.user.sidebar.stations, function (h) {
					GS.user.defaultStations.indexOf(h) == -1 && b.addToShortcuts("station", h, false)
				})
			}
			GS.user = b;
			GS.service.reportUserChange(GS.user.UserID, GS.user.Username, GS.user.Privacy);
			a.publish("gs.auth.update", c);
			if (!GS.user.IsPremium && (gsConfig.isPreview || GS.Controllers.AirbridgeController.instance().isDesktop)) {
				if (g = GS.Controllers.LightboxController ? GS.Controllers.LightboxController.instance() : null) g.open("login", {
					premiumRequired: true
				});
				else gsConfig.lightboxOnInit = {
					type: "login",
					defaults: {
						premiumRequired: true
					}
				};
				GS.player && GS.player.pauseNextSong()
			}
			if (GS.guts && GS.user && GS.user.UserID > 0) {
				GS.guts.logEvent("login", {
					username: GS.user.Username,
					userID: GS.user.UserID
				});
				GS.guts.beginContext({
					userID: GS.user.UserID
				})
			}
		}
	})
})(jQuery);
GS.Controllers.BaseController.extend("GS.Controllers.ThemeController", {
	onDocument: true,
	themes: themes,
	sortOrder: themesSortOrder
}, {
	currentTheme: null,
	themes: null,
	sort: null,
	themesLocation: "themes",
	lastDFPChange: null,
	lastUserChange: null,
	themePreferences: null,
	currentSong: null,
	extraStations: {},
	personalizeParams: null,
	hasSeenSponsoredTheme: true,
	promptOnLogin: false,
	themePreferences: {},
	firstTheme: false,
	DEFAULT_USER_THEMEID: 4,
	DEFAULT_PREMIUM_THEMEID: 4,
	THEME_USER_LIMIT: 6E5,
	THEME_RATE_LIMIT: 6E4,
	init: function () {
		this.themes = themes;
		this.sort = themesSortOrder;
		this.themePreferences = store.get("themePreferences") || {};
		$.subscribe("window.resize", this.callback(this.positionTheme));
		$.subscribe("gs.auth.update", this.callback(this.onAuthUpdate));
		$.subscribe("gs.page.home.update", this.callback(this.positionTheme));
		$.subscribe("gs.page.home.view", this.callback([this.themeImpression, this.positionTheme]));
		$.subscribe("gs.page.home.leave", this.callback(this.onLeaveHome));
		$.subscribe("gs.page.page.view", this.callback(this.themePageImpression));
		$.subscribe("gs.player.nowplaying", this.callback(this.onSongPlay));
		$.subscribe("gs.player.streamserver", this.callback(this.onStreamServer));
		$.subscribe("gs.theme.click", this.callback(this.onThemeClick));
		$.subscribe("gs.theme.playVideo", this.callback(this.playVideo));
		this._super()
	},
	appReady: function () {
		var a = (new Date).getTime();
		if (a > 13016304E5 && a < 13017168E5) if (!GS.user || !GS.user.IsPremium) {
			this.setCurrentTheme(20110401);
			this.lastDFPChange = this.lastUserChange = a - 18E4;
			return
		} else GS.notice.go3DS();
		if (GS.user.UserID > -1) this.resetTheme();
		else if (_.defined(store.get("isFirstVisit")) || _.defined(gsConfig.isNoob) && !gsConfig.isNoob) {
			this.isFirstVisit = false;
			this.resetTheme()
		} else GS.service.isFirstVisit(this.callback("onIsFirstVisit"))
	},
	onIsFirstVisit: function (a) {
		this.isFirstVisit = a;
		store.set("isFirstVisit", false);
		this.isFirstVisit ? this.setCurrentTheme(this.DEFAULT_USER_THEMEID) : this.resetTheme()
	},
	onAuthUpdate: function () {
		this.lastDFPChange = this.lastUserChange = null;
		this.hasSeenSponsoredTheme = true;
		if (this.promptOnLogin && GS.user.UserID > 0) {
			this.promptOnLogin = false;
			GS.lightbox.open("promotion", {
				theme: this.currentTheme
			})
		} else this.promptOnLogin || this.resetTheme()
	},
	resetTheme: function (a) {
		if (!(a && a.hasOwnProperty("doNotReset"))) {
			a = new Date;
			!GS.user.IsPremium && this.hasSeenSponsoredTheme && (!this.lastUserChange || a.getTime() - this.lastUserChange > this.THEME_USER_LIMIT) ? this.loadFromDFP() : this.lastOrDefault()
		}
	},
	lastOrDefault: function () {
		var a = this.getLastTheme();
		if (this.themes) {
			if (a && themes[a] && (GS.user.IsPremium && a || themes[a] && !themes[a].premium)) this.setCurrentTheme(a);
			else GS.user.IsPremium ? this.setCurrentTheme(this.DEFAULT_PREMIUM_THEMEID) : this.setCurrentTheme(this.DEFAULT_USER_THEMEID);
			this.themeNotification(GS.player.getCurrentSong())
		}
	},
	loadFromDFP: function () {
		var a = new Date;
		if (!GS.user.IsPremium && (!this.lastDFPChange || a.getTime() - this.lastDFPChange > this.THEME_RATE_LIMIT)) GS.service.getThemeFromDFP(this.buildParams(), this.callback("onGetTheme"), this.callback("onGetThemeErr"))
	},
	onGetTheme: function (a) {
		var b = new Date;
		if (b.getTime() - this.lastUserChange < this.THEME_USER_LIMIT) console.warn("[Stopped DFP Override]");
		else {
			try {
				a = JSON.parse(a)
			} catch (c) {
				console.log("invalid json from DFP", c);
				this.lastOrDefault();
				return
			}
			if (a) if (this.themes[a.themeID] && !this.getLastSeen(a.themeID)) {
				this.themes[a.themeID].clickIDs = a.clickIDs;
				this.themes[a.themeID].tracking = a.tracking;
				this.themes[a.themeID].pageTracking = a.pageTracking;
				this.themes[a.themeID].misc = a.misc;
				this.themes[a.themeID].videos = a.videos;
				if (this.setCurrentTheme(a.themeID)) {
					this.lastDFPChange = b.getTime();
					if (this.currentTheme.sponsored) this.hasSeenSponsoredTheme = false;
					this.themeImpression()
				}
			} else this.lastOrDefault();
			else this.lastOrDefault()
		}
	},
	onGetThemeErr: function () {
		this.lastOrDefault()
	},
	setCurrentThemeDFPOverride: function (a) {
		var b = [];
		b.push("dcmt=text/json");
		b.push("sz=777x777");
		b.push("themeid=" + a);
		a = ";" + b.join(";");
		GS.service.getThemeFromDFP(a, this.callback("onGetThemeDFPOverride"), this.callback("onGetThemeErr"))
	},
	onGetThemeDFPOverride: function (a) {
		try {
			a = JSON.parse(a)
		} catch (b) {
			console.log("invalid json from DFP", b);
			this.lastOrDefault();
			return
		}
		if (a) if (this.themes[a.themeID]) {
			this.themes[a.themeID].clickIDs = a.clickIDs;
			this.themes[a.themeID].tracking = a.tracking;
			this.themes[a.themeID].pageTracking = a.pageTracking;
			this.themes[a.themeID].misc = a.misc;
			this.themes[a.themeID].videos = a.videos;
			this.setCurrentTheme(a.themeID, true);
			this.themeImpression()
		} else this.lastOrDefault();
		else this.lastOrDefault()
	},
	setCurrentTheme: function (a, b) {
		if (!this.themes[a] || this.currentTheme && this.currentTheme.themeID == a || !GS.user.IsPremium && this.themes[a].premium) return false;
		this.lastTheme = this.currentTheme;
		this.promptOnLogin = false;
		this.currentTheme = GS.Models.Theme.wrap(this.themes[a]);
		this.renderTheme();
		if (b) {
			this.hasSeenSponsoredTheme = true;
			this.setLastTheme(a);
			if (this.lastTheme) this.setLastSeen(this.lastTheme.themeID);
			else this.lastUserChange = (new Date).getTime()
		}
		if (!this.firstTheme) {
			GS.guts.gaTrackEvent("themes", "firstTheme", a);
			this.firstTheme = "" + a
		}
		GS.guts.gaTrackEvent("themes", "change", a);
		return true
	},
	setLastTheme: function (a) {
		if (this.themePreferences[GS.user.UserID]) this.themePreferences[GS.user.UserID].lastTheme = a;
		else this.themePreferences[GS.user.UserID] = {
			lastTheme: a,
			lastSeen: {}
		}
	},
	setLastSeen: function (a) {
		var b = new Date;
		this.lastUserChange = b.getTime();
		if (this.themePreferences[GS.user.UserID]) this.themePreferences[GS.user.UserID].lastSeen[a] = b.getTime()
	},
	getLastTheme: function () {
		return this.themePreferences[GS.user.UserID] && this.themePreferences[GS.user.UserID].lastTheme ? this.themePreferences[GS.user.UserID].lastTheme : null
	},
	getLastSeen: function (a) {
		return this.themePreferences[GS.user.UserID] && this.themePreferences[GS.user.UserID].lastSeen[a] ? this.themePreferences[GS.user.UserID].lastSeen[a] : null
	},
	renderTheme: function () {
		if (this.currentTheme) {
			$("#themeStyleSheet").attr("href", [gsConfig.assetHost, this.themesLocation, this.currentTheme.location, "theme.css"].join("/") + "?ver=" + this.currentTheme.version);
			$(".theme_component").html("").removeClass("active");
			for (var a = 0; a < this.currentTheme.sections.length; a++) this.renderSection(this.currentTheme.sections[a]);
			this.positionTheme();
			$(window).resize();
			if (window.location.hash !== "#/" && window.location.hash.toString().indexOf("#/theme") != 0) {
				$("#theme_home object").hide();
				this.currentTheme.artistIDs && this.themeNotification(GS.player.getCurrentSong())
			}
		}
	},
	renderSection: function (a) {
		if (this.currentTheme && a.length && $(a).length) {
			var b = [this.themesLocation, this.currentTheme.location];
			b.push(a.substr(7, a.length));
			b = b.join("/");
			$(a).html(this.view(b)).addClass("active");
			a === "#theme_page_header" && $(a).prepend($("<div class='border'></div>"));
			this.currentTheme.bindAssets(a)
		}
	},
	positionTheme: function () {
		var a;
		if (this.currentTheme) for (var b = 0; b < this.currentTheme.sections.length; b++) {
			a = this.currentTheme.sections[b];
			this.currentTheme.position(a)
		}
	},
	themeNotification: function (a) {
		if ((a = _.orEqual(a, this.currentSong)) && this.currentTheme.artistIDs && window.location.hash !== "#/") for (var b, c = 0; c < this.currentTheme.artistIDs.length; c++) {
			b = this.currentTheme.artistIDs[c];
			if (b == a.ArtistID) {
				GS.notice.displayThemeArtistNotification(a, this.currentTheme);
				break
			}
		}
	},
	onSongPlay: function (a) {
		if (a && a.SongID) {
			if (!this.currentSong || this.currentSong.SongID != a.SongID) {
				this.currentSong = a;
				var b = new Date;
				!GS.user.IsPremium && this.hasSeenSponsoredTheme && (!this.lastUserChange || b.getTime() - this.lastUserChange > this.THEME_USER_LIMIT) ? this.loadFromDFP() : this.themeNotification(a)
			}
		} else this.currentSong = null
	},
	onLeaveHome: function () {
		var a = new Date;
		if (!GS.user.IsPremium && this.hasSeenSponsoredTheme && (!this.lastUserChange || a.getTime() - this.lastUserChange > this.THEME_USER_LIMIT)) this.loadFromDFP()
	},
	onStreamServer: function () {},
	themeImpression: function () {
		if (this.currentTheme) if (this.currentTheme.sponsored && (window.location.hash == "#/" || window.location.hash.toString().indexOf("#/?changetheme&dfp=true&themeid=") == 0)) if ($.isArray(this.currentTheme.tracking)) {
			this.hasSeenSponsoredTheme = true;
			GS.service.logTargetedThemeImpression(this.currentTheme.themeID);
			var a = (new Date).valueOf(),
				b = $("body"),
				c;
			_.forEach(this.currentTheme.tracking, function (g) {
				g += g.indexOf("?") != -1 ? "&" + a : "?" + a;
				c = new Image;
				b.append($(c).load(function (h) {
					$(h.target).remove()
				}).css("visibility", "hidden").attr("src", g))
			})
		}
	},
	themePageImpression: function () {
		if (this.currentTheme) if (this.currentTheme.sponsored && window.location.hash !== "#/" && $("#theme_page_header").is(".active:visible")) if ($.isArray(this.currentTheme.pageTracking)) {
			var a = (new Date).valueOf(),
				b;
			_.forEach(this.currentTheme.pageTracking, function (c) {
				c += c.indexOf("?") != -1 ? "&" + a : "?" + a;
				b = new Image;
				$("body").append($(b).load(function (g) {
					$(g.target).remove()
				}).css("visibility", "hidden").attr("src", c))
			})
		}
	},
	onThemeClick: function (a) {
		a && a.currentTarget && this.currentTheme && this.currentTheme.handleClick(a)
	},
	savePreferences: function () {
		try {
			store.set("themePreferences", this.themePreferences)
		} catch (a) {}
	},
	buildParams: function () {
		var a = [];
		this.currentSong && a.push("2=" + this.currentSong.ArtistID);
		if (GS.user.isLoggedIn) {
			if (GS.user.Sex) a.push("1=" + (GS.user.Sex.toLowerCase() == "m" ? "0" : "1"));
			if (GS.user.TSDOB) {
				var b = GS.user.TSDOB.split("-");
				if (b.length == 3) {
					var c = new Date,
						g = c.getFullYear() - parseInt(b[0], 10);
					if (parseInt(b[1], 10) > c.month) g -= 1;
					else if (parseInt(b[1], 10) == c.month && parseInt(b[2], 10) > c.date) g -= 1;
					var h;
					if (g >= 13 && g < 18) h = "13-17";
					else if (g >= 18 && g < 25) h = "18-24";
					else if (g >= 25 && g < 35) h = "25-34";
					else if (g >= 35 && g < 50) h = "35-49";
					else if (g >= 50) h = "50-";
					h && a.push("0=" + h)
				}
			}
		}
		a.push("dcmt=text/json");
		a.push("sz=777x777");
		a = a.concat(this.getRapParams());
		return ";" + a.join(";")
	},
	getRapParams: function () {
		var a = [],
			b = store.get("personalize" + GS.user.UserID);
		if (!b) return a;
		if (b.length >= 0) return a;
		if (jQuery.isEmptyObject(b)) return a;
		!GS.user.TSDOB && b.age && a.push("0=" + b.age);
		if (!GS.user.Sex && b.gender) a.push("1=" + (b.gender == "Male" ? "0" : "1"));
		b.children && a.push("4=" + b.children);
		b.household_income && a.push("5=" + b.household_income);
		b.marital_status && a.push("6=" + b.marital_status);
		b.home_owner_status && a.push("7=" + b.home_owner_status);
		return a
	},
	playVideo: function (a) {
		if (this.currentTheme) {
			index = _.orEqual(a.index, 0);
			GS.lightbox.open("video", {
				video: this.currentTheme.videos[index],
				videos: this.currentTheme.videos,
				index: index
			})
		}
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.NotificationsController", {
	onDocument: true
}, {
	displayDuration: 5E3,
	queue: [],
	seenArtistNotifications: [],
	currentArtistFeedback: null,
	currentFacebookNotification: null,
	currentFavoritedNotification: null,
	currentLibraryAddedNotification: null,
	sawSignupNotification: false,
	feedbackOnNextSong: false,
	init: function () {
		$.subscribe("gs.notification", this.callback("displayMessage"));
		$.subscribe("gs.player.nowplaying", this.callback("onSongPlay"));
		$.subscribe("gs.player.restorequeue", this.callback("displayRestoreQueue"));
		$.subscribe("gs.facebook.notification.override", this.callback("displayFacebookRateLimit"));
		$.subscribe("gs.facebook.notification.sent", this.callback("displayFacebookSent"));
		$.subscribe("gs.facebook.notification.removed", this.callback("displayFacebookUndoPost"));
		$.subscribe("gs.notification.favorite.song", this.callback("displayFavoritedObject", "song"));
		$.subscribe("gs.notification.favorite.playlist", this.callback("displayFavoritedObject", "playlist"));
		$.subscribe("gs.notification.favorite.user", this.callback("displayFavoritedObject", "user"));
		$.subscribe("gs.notification.playlist.create", this.callback("displayFavoritedObject", "newPlaylist"));
		$.subscribe("gs.auth.library.songsAdded", this.callback("displayLibraryAddedObject"));
		$.subscribe("gs.facebook.notification.connect", this.callback(this.displayFacebookConnect));
		$.subscribe("gs.facebook.notification.songComment", this.callback(this.displayFacebookSongComment));
		this._super()
	},
	onSongPlay: function (a) {
		if (a && (this.feedbackOnNextSong || a.sponsoredAutoplayID)) {
			this.feedbackOnNextSong = false;
			if (this.seenArtistNotifications.indexOf(a.ArtistID) === -1) {
				this.seenArtistNotifications.push(a.ArtistID);
				this.displayArtistFeedback(a)
			}
		}
		if (!this.sawSignupNotification && GS.user.UserID <= 0 && GS.ad.lastActive && GS.player.player) {
			a = (new Date).valueOf() - GS.ad.lastActive.valueOf();
			var b = GS.player.player.getCulmulativeListenTime();
			if (!b.firstVisit && a < 6E4 && b.seconds > 300) {
				this.sawSignupNotification = true;
				$("#notifications").append(this.view("signupNotification", {
					controller: this
				}));
				this.setNotificationTimeout($("#notifications li.notification").last())
			}
		}
	},
	displayMessage: function (a) {
		$("#notifications").append(this.view("notification", {
			controller: this,
			notification: a
		}));
		var b = $("#notifications li.notification").last();
		a.manualClose || this.setNotificationTimeout(b, typeof a.displayDuration != "undefined" ? a.displayDuration : null)
	},
	go3DS: function () {
		$("#notifications").append(this.view("notification_3ds", {
			controller: this
		}))
	},
	"li.notification a.go3ds click": function (a) {
		GS.theme.setCurrentTheme(20110401);
		$(a).closest("li.notification").slideUp().remove()
	},
	displayArtistFeedback: function (a) {
		if (!this.currentArtistFeedback) {
			$("#notifications").append(this.view("artistNotification", {
				controller: this,
				feedbackSong: a
			}));
			this.currentArtistFeedback = $("#notifications .notification").last().data("song", a);
			this.setNotificationTimeout(this.currentArtistFeedback)
		}
	},
	displayThemeArtistNotification: function (a, b) {
		console.warn("THEME NOTIFICATION", a);
		this.currentArtistFeedback && this.currentArtistFeedback.remove();
		this.feedbackSong = a;
		GS.theme.lastDFPChange = (new Date).getTime() + 1E4;
		$("#notifications").append(this.view("themes/" + b.location + "/artist_notification"));
		this.currentArtistFeedback = $("#notifications .notification").last().data("song", a);
		this.setNotificationTimeout(item, 1E4)
	},
	"li.notification a.theme_link click": function (a, b) {
		b.index = parseInt($(a).attr("data-video-index"), 10);
		GS.theme.currentTheme.handleClick(b);
		GS.theme.lastDFPChange = (new Date).getTime();
		if ($(a).attr("data-click-action")) {
			$(a).closest("li.notification").slideUp().remove();
			this.currentArtistFeedback = null
		}
	},
	displayLibraryAddedObject: function (a) {
		var b = {
			controller: this
		},
			c;
		if (a.songs) {
			if (a.songs.length == 1) {
				b.msgKey = "NOTIF_LIBRARY_ADDED_SONG";
				b.msgData = a.songs[0];
				c = "song"
			} else {
				b.msgKey = "NOTIFICATION_LIBRARY_ADD_SONGS";
				b.msgData = {
					numSongs: a.songs.length
				};
				c = "songs"
			}
			$("#notifications").append(this.view("libraryAddedNotification", b));
			this.currentLibraryAddedNotification = $("#notifications .notification").last().data("object", a.songs[0]).data("type", c);
			this.setNotificationTimeout(this.currentLibraryAddedNotification)
		}
	},
	displayFavoritedObject: function (a, b) {
		if (b) {
			if (this.currentLibraryAddedNotification && this.currentLibraryAddedNotification.data("type") == a) {
				var c = this.currentLibraryAddedNotification.data("object");
				a == "song" && _.orEqual(b.songID, b.SongID) == _.orEqual(c.SongID, c.songID) && this.currentLibraryAddedNotification.slideUp().remove()
			}
			c = {
				controller: this,
				type: a
			};
			switch (a) {
			case "playlist":
				c.msgKey = "NOTIF_SUBSCRIBED_PLAYLIST";
				c.msgData = {
					playlistName: b.PlaylistName
				};
				break;
			case "song":
				c.msgKey = "NOTIF_FAVORITED_SONG";
				c.msgData = {
					songName: _.orEqual(b.SongName, b.songName),
					artistName: _.orEqual(b.ArtistName, b.artistName)
				};
				break;
			case "user":
				c.msgKey = "NOTIF_FOLLOWED_USER";
				c.msgData = {
					userName: b.Username
				};
				break;
			case "newPlaylist":
				c.msgKey = "NOTIF_CREATED_PLAYLIST";
				c.msgData = {
					playlistName: b.PlaylistName
				};
				break
			}
			$("#notifications").append(this.view("favoriteNotification", c));
			this.currentFavoritedNotification = $("#notifications .notification").last().data("object", b).data("type", a);
			this.setNotificationTimeout(this.currentFavoritedNotification)
		}
	},
	"li.notification .favorited button.shareWithFacebook click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $(a).closest("li.notification");
		$("button.shareWithFacebook", c).hide();
		$("div.facebookShare", c).show();
		$(a).closest("li.notification").removeClass("notification_success").addClass("notification_form");
		$("div.content", c).prepend('<img src="/webincludes/images/notifications/facebook.png" />');
		$("div.content p", c).addClass("hasIcon");
		var g = $("#fb_share_message", c);
		g.focus(this.callback(function () {
			g.val() == $.localize.getString("NOTIF_SHARE_PREFILL_MSG") && g.val("")
		}));
		g.focusout(this.callback(function () {
			g.val() == "" && g.val($.localize.getString("NOTIF_SHARE_PREFILL_MSG"))
		}));
		return false
	},
	"li.notification .favorited button.shareWithFacebookSubmit click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $(a).closest("li.notification"),
			g = $(c).data("object"),
			h = $(c).data("type"),
			k = $("#fb_share_message", c).val();
		if (k == $.localize.getString("NOTIF_SHARE_PREFILL_MSG")) k = "";
		console.log("sharing to facebook: ", h, g, k);
		switch (h) {
		case "song":
			GS.facebook.onFavoriteSong(g, k);
			break;
		case "playlist":
			GS.facebook.onSubscribePlaylist(g, k);
			break;
		case "newPlaylist":
			GS.facebook.onPlaylistCreate(g, k);
			break;
		case "user":
			GS.facebook.onFollowUser(g, k);
			break
		}
		c.slideUp().remove();
		return false
	},
	displayFacebookRateLimit: function (a) {
		if (a) {
			$("#notifications li.facebook").remove();
			$("#notifications").append(this.view("facebookRateLimitNotification", {
				controller: this,
				type: a.type
			}));
			this.currentFacebookNotification = $("#notifications .notification").last().data("params", a);
			this.setNotificationTimeout(this.currentFacebookNotification)
		}
	},
	"li.notification .facebook button.override click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $(a).closest("li.notification"),
			g = $(c).data("params");
		GS.facebook.postEvent(g, true);
		c.slideUp().remove();
		return false
	},
	displayFacebookSent: function (a) {
		if (a && a.params && a.data) {
			$("#notifications li.facebook").remove();
			$("#notifications").append(this.view("facebookPostNotification", {
				controller: this,
				type: a.params.type,
				hideUndo: a.params.hideUndo
			}));
			this.currentFacebookNotification = $("#notifications .notification").last().data("data", a.data);
			this.setNotificationTimeout(this.currentFacebookNotification)
		}
	},
	"li.notification .facebook button.undo click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $(a).closest("li.notification"),
			g = $(c).data("data");
		console.log("facebook.params", g);
		GS.facebook.removeEvent(g, true);
		c.slideUp().remove();
		return false
	},
	displayFacebookUndoPost: function (a) {
		if (a) {
			$("#notifications li.facebook").remove();
			$("#notifications").append(this.view("facebookUndoPostNotification", {
				controller: this
			}));
			this.currentFacebookNotification = $("#notifications .notification").last().data("data", a);
			this.setNotificationTimeout(this.currentFacebookNotification)
		}
	},
	"li.notification form.artistFeedback button click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $(a).attr("data-vote"),
			g = this.currentArtistFeedback.find("textarea").val(),
			h = this.currentArtistFeedback.data("song");
		this.feedbackSong = h;
		g && g.length && GS.service.provideSongFeedbackMessage(h.SongID, g);
		GS.service.provideSongFeedbackVote(h.SongID, c, h.ArtistID, this.callback("onArtistFeedback", c), this.callback("onArtistFeebackFail"));
		return false
	},
	displayFacebookConnect: function () {
		$("#notifications li.facebook").remove();
		$("#notifications").append(this.view("facebookConnectNotification", {
			controller: this
		}));
		this.currentFacebookNotification = $("#notifications .notification").last();
		this.setNotificationTimeout(this.currentFacebookNotification, 1E4)
	},
	"#fbNotifConnect-btn click": function () {
		console.warn("fbConnect-btn click");
		GS.facebook.login(this.callback("updateFacebookForm"), this.callback("updateFacebookFormWithError"))
	},
	displayFacebookSongComment: function () {
		$("#notifications li.facebook").remove();
		$("#notifications").append(this.view("facebookSongCommentNotification", {
			controller: this
		}));
		this.currentFacebookNotification = $("#notifications .notification").last();
		this.setNotificationTimeout(this.currentFacebookNotification)
	},
	"a.songLink click": function (a, b) {
		var c = parseInt($(a).attr("rel"), 10);
		c && b.which && GS.Models.Song.getSong(c, function (g) {
			if (g) location.hash = g.toUrl()
		})
	},
	onArtistFeedback: function (a, b) {
		var c = {
			controller: this,
			feedbackSong: this.currentArtistFeedback.data("song")
		};
		if (b.success && a == 2) {
			c.urls = b.urls;
			this.currentArtistFeedback.find(".content").html(this.view("artistNotificationResult", c));
			_.isEmpty(b.urls) && this.setNotificationTimeout(this.currentArtistFeedback, this.displayDuration, true)
		} else {
			this.currentArtistFeedback.slideUp().remove();
			this.currentArtistFeedback = null
		}
	},
	onArtistFeedbackFail: function () {
		this.currentArtistFeedback.slideUp().remove();
		this.currentArtistFeedback = null
	},
	"li.notification.artist a.close click": function (a) {
		$(a).closest("li.notification").slideUp().remove();
		this.currentArtistFeedback = null
	},
	displayRestoreQueue: function () {
		console.log("display restore queue");
		$("#notifications").append(this.view("restoreQueue", {
			controller: this
		}));
		this.setNotificationTimeout($("#notifications .notification").last())
	},
	focusInText: false,
	mouseOut: false,
	setNotificationTimeout: function (a, b, c) {
		b = _.orEqual(b, this.displayDuration);
		if (!c) {
			$(a).mouseout(this.callback(function () {
				this.mouseOut = true;
				this.focusInText || this.setNotificationTimeout(a, b, true)
			}));
			$(a).mouseover(this.callback(function () {
				this.mouseOut = false;
				this.clearNotificationTimeout(a)
			}));
			$("textarea", a).focus(this.callback(function () {
				this.focusInText = true;
				this.clearNotificationTimeout(a)
			}));
			$("textarea", a).focusout(this.callback(function () {
				this.focusInText = false;
				this.mouseOut && this.setNotificationTimeout(a, b, true)
			}))
		}
		a.timer && this.clearNotificationTimeout(a);
		a.timer = setTimeout(this.callback(function () {
			this.hideNotification(a)
		}), b)
	},
	clearNotificationTimeout: function (a) {
		clearTimeout(a.timer)
	},
	hideNotification: function (a) {
		if (this.currentArtistFeedback == a) this.currentArtistFeedback = null;
		$(a).slideUp().remove()
	},
	"li.notification a.close click": function (a) {
		$(a).closest("li.notification").slideUp().remove()
	},
	"li.notification .cancel click": function (a) {
		$(a).closest("li.notification").slideUp().remove()
	},
	"form.feedback submit": function () {
		console.log("submit song feedback");
		return false
	},
	"li.notification .loginCTA click": function (a) {
		$(a).closest("li.notification").slideUp().remove();
		GS.lightbox.open("login")
	},
	"li.notification .signupCTA click": function (a) {
		$(a).closest("li.notification").slideUp().remove();
		GS.lightbox.open("signup")
	},
	"li.notification.restoreQueue .restore click": function (a) {
		GS.player.restoreQueue();
		$(a).closest("li.notification").slideUp().remove()
	},
	"li.notification.restoreQueue a.settings click": function (a) {
		if (GS.user.isLoggedIn) location.hash = "/settings";
		else GS.lightbox.open("login");
		$(a).closest("li.notification").slideUp().remove()
	},
	"input focus": function (a) {
		$(a).parent().parent().addClass("active")
	},
	"textarea focus": function (a) {
		$(a).parent().parent().parent().addClass("active")
	},
	"input blur": function (a) {
		$(a).parent().parent().removeClass("active")
	},
	"textarea blur": function (a) {
		$(a).parent().parent().parent().removeClass("active")
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.HeaderController", {
	onElement: "#header"
}, {
	init: function () {
		$.subscribe("gs.auth.update", this.callback(this.update));
		$.subscribe("gs.auth.user.feeds.update", this.callback(this.updateFeedCount));
		$.subscribe("gs.router.history.change", this.callback(this.updateNavButtons));
		this._super()
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		this.user = GS.user;
		this.isDesktop = GS.airbridge ? GS.airbridge.isDesktop : false;
		if (GS.user.isLoggedIn) {
			$("#nav").html(this.view("navLoggedIn"));
			$("#userOptions").html(this.view("loggedIn"))
		} else {
			$("#nav").html(this.view("navLoggedOut"));
			$("#userOptions").html(this.view("loggedOut"))
		}
		this.updateNavButtons()
	},
	updateFeedCount: function () {
		this.user = GS.user;
		this.isDesktop = GS.airbridge ? GS.airbridge.isDesktop : false;
		GS.user.isLoggedIn ? $("#nav").html(this.view("navLoggedIn")) : $("#nav").html(this.view("navLoggedOut"));
		this.updateNavButtons()
	},
	updateNavButtons: function () {
		if (GS.router) {
			$("button.back", this.element).attr("disabled", !GS.router.hasBack);
			$("button.forward", this.element).attr("disabled", !GS.router.hasForward)
		}
	},
	"#grooveshark click": function () {
		if ($("#page").is(".gs_page_home")) {
			$("input.search.autocomplete", "#page").blur();
			if ($("#searchBar_input input").val() == "") {
				$("#searchBar_input span").show();
				$("#searchBar_input span").css("opacity", "1")
			}
		} else setTimeout(function () {
			$("input.search.autocomplete", "#page").blur()
		}, 0)
	},
	"#headerSearchBtn mousedown": function () {
		if ($("#page").is(".gs_page_home")) {
			$("input.search.autocomplete", "#page").focus();
			if ($("#searchBar_input input").val() == "") {
				$("#searchBar_input span").show();
				$("#searchBar_input span").css("opacity", "0.33")
			}
			$("#searchBar_input input").addClass("focused")
		} else var a = $.subscribe("gs.page.home.view", function () {
			setTimeout(function () {
				$("input.search.autocomplete", "#page").focus()
			}, 0);
			$("#searchBar_input span").show();
			$("#searchBar_input span").css("opacity", "0.33");
			$.unsubscribe(a)
		})
	},
	"button.forward click": function () {
		GS.router.forward()
	},
	"button.back click": function () {
		GS.router.back()
	},
	"button.signup click": function () {
		GS.lightbox.open("signup")
	},
	"button.login click": function (a) {
		$(a).toggleClass("active");
		$("#dropdown_loginForm_box").toggle();
		if ($("#dropdown_loginForm_box").is(":visible")) {
			$("#dropdown_loginForm_box").find("input:first").focus();
			this.element.find(".error").hide()
		} else $("#dropdown_loginForm_box").find("input").blur();
		var b = this;
		$("body").click(function (c) {
			!$(c.target).parents("#dropdown_loginForm_box").length && !$(c.target).parents("#header_loginOption").length && b.closeLoginDropdown()
		})
	},
	closeLoginDropdown: function () {
		$("#dropdown_loginForm_box").hide();
		$("#dropdown_loginForm_box").find("input").blur();
		$("#header_login").removeClass("active")
	},
	"button.account click": function (a) {
		$(a).toggleClass("active");
		$("#userSelectOptions").toggle();
		$("body").click(function (b) {
			if (!$(b.target).parents("#header_account_group").length) {
				$("#header_account_button").removeClass("active");
				$("#userSelectOptions").hide()
			}
		})
	},
	"ul.dropdownOptions li.option a click": function () {
		$("#header_account_button").removeClass("active");
		$("#userSelectOptions").hide()
	},
	"button.locale click": function () {
		GS.lightbox.open("locale")
	},
	"a.invite click": function () {
		GS.user.UserID > 0 && GS.lightbox.open("invite")
	},
	"a.feedback click": function () {
		GS.user.IsPremium && GS.lightbox.open("feedback")
	},
	"a.logout click": function () {
		GS.auth.logout()
	},
	"input focus": function (a) {
		$(a).parent().parent().addClass("active")
	},
	"textarea focus": function (a) {
		$(a).parent().parent().parent().addClass("active")
	},
	"input blur": function (a) {
		$(a).parent().parent().removeClass("active")
	},
	"textarea blur": function (a) {
		$(a).parent().parent().parent().removeClass("active")
	},
	showError: function (a) {
		console.log("showError", a, $("div.message", this.element));
		$("div.message", this.element).html($.localize.getString(a));
		this.element.find(".error").show()
	},
	showMessage: function (a) {
		console.log("showMessage", a);
		$("div.message", this.element).html(a);
		this.element.find(".error").show()
	},
	"form#dropdown_loginForm submit": function (a, b) {
		console.log("login.form.subm");
		b.preventDefault();
		this.element.find(".error").hide();
		var c = $("input[name=username]", a).val(),
			g = $("input[name=password]", a).val(),
			h = $("input[name=save]", a).val() ? 1 : 0;
		switch (c.toLowerCase()) {
		case "dbg:googlelogin":
			GS.google.lastError ? this.showMessage("Last Google Login Error: " + GS.google.lastError) : this.showMessage("There does not appear to be any errors with Google Login");
			break;
		default:
			GS.auth.login(c, g, h, this.callback(this.loginSuccess), this.callback(this.loginFailed));
			break
		}
		return false
	},
	"button.facebookLogin click": function () {
		GS.auth.loginViaFacebook(this.callback(this.loginSuccess), this.callback(this.loginFailed));
		this.closeLoginDropdown()
	},
	"button.googleLogin click": function () {
		GS.auth.loginViaGoogle(this.callback(this.loginSuccess), this.callback(this.loginFailed));
		this.closeLoginDropdown()
	},
	loginSuccess: function () {
		this.closeLoginDropdown()
	},
	loginFailed: function (a) {
		console.log("lb.loginfail", arguments);
		if (a.error) this.showError(a.error);
		else if (a && a.authType == "facebook") this.showError("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR");
		else if (a && a.authType == "google") this.showError("POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR");
		else a && a.userID == 0 ? this.showError("POPUP_SIGNUP_LOGIN_FORM_AUTH_ERROR") : this.showError("POPUP_SIGNUP_LOGIN_FORM_GENERAL_ERROR")
	},
	"a.loginLink click": function () {
		$("#dropdown_loginForm_box").hide();
		$("#dropdown_loginForm_box").find("input").blur();
		$("#header_login").removeClass("active").parent("li").removeClass("header_hasBorder").siblings("li").removeClass("header_borderAdjust")
	},
	"a.signup click": function () {
		GS.lightbox.open("signup")
	},
	"a.forget click": function () {
		GS.lightbox.open("forget")
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.SidebarController", {
	onElement: "#sidebar"
}, {
	playlists: [],
	subscribedPlaylists: [],
	stations: [],
	sortBy: "sidebarSort",
	doingSubscribed: false,
	doResize: true,
	init: function () {
		$.subscribe("gs.auth.update", this.callback("update"));
		$.subscribe("gs.auth.playlists.update", this.callback("populateSidebarPlaylists"));
		$.subscribe("gs.auth.favorites.playlists.update", this.callback("populateSidebarSubscribedPlaylists"));
		$.subscribe("gs.auth.stations.update", this.callback("populateSidebarStations"));
		try {
			var a = store.get("gs.sort.sidebar")
		} catch (b) {}
		if (["sidebarSort", "PlaylistName"].indexOf(a) != -1) this.sortBy = a;
		$.subscribe("gs.auth.sidebar.loaded", this.callback(function () {
			this.populateSidebarStations();
			this.populateSidebarSubscribedPlaylists();
			this.populateSidebarPlaylists()
		}));
		this._super()
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		if (GS.user) {
			this.user = GS.user;
			$("#sidebar").resizable("destroy");
			this.element.html(this.view("index"));
			var a = this;
			$("#sidebar").resizable({
				handles: {
					e: $("#sidebar .border")
				},
				minWidth: 65,
				maxWidth: 350,
				animate: false,
				resize: function () {
					$("#deselector").select();
					$(window).resize();
					if ($.browser.mozilla) {
						a.populateSidebarPlaylists();
						a.populateSidebarSubscribedPlaylists();
						a.populateSidebarStations()
					}
				}
			});
			this.populateSidebarPlaylists();
			this.populateSidebarSubscribedPlaylists();
			this.populateSidebarStations();
			$(window).resize();
			this.beginDragDrop()
		}
	},
	changeSort: function (a) {
		this.sortBy = a;
		this.populateSidebarPlaylists();
		this.populateSidebarSubscribedPlaylists();
		this.populateSidebarStations();
		try {
			store.set("gs.sort.sidebar", a)
		} catch (b) {}
	},
	playlistSort: function (a, b) {
		var c, g;
		try {
			if (this.sortBy === "sidebarSort") {
				c = a[this.sortBy];
				g = b[this.sortBy]
			} else {
				c = a[this.sortBy].toString().toLowerCase();
				g = b[this.sortBy].toString().toLowerCase()
			}
		} catch (h) {
			console.error("sidebar.playlistsort error: " + h, this.sortBy, a[this.sortBy], b[this.sortBy]);
			console.error(a, b)
		}
		return c == g ? 0 : c > g ? 1 : -1
	},
	populateSidebarPlaylists: function () {
		if (GS.user.sidebarLoaded) {
			this.playlists = [];
			for (var a = GS.user.sidebar.playlists, b = 0; b < a.length; b++) {
				var c = GS.user.playlists[a[b]];
				if (c) {
					c.sidebarSort = b + 1;
					this.playlists.push(c)
				}
			}
			this.playlists.sort(this.callback("playlistSort"));
			this.showPlaylists()
		}
	},
	populateSidebarSubscribedPlaylists: function () {
		if (GS.user.sidebarLoaded) {
			this.subscribedPlaylists = [];
			for (var a = GS.user.sidebar.subscribedPlaylists, b = 0; b < a.length; b++) {
				var c = GS.user.favorites.playlists[a[b]];
				if (c) {
					c.sidebarSort = b + 1;
					this.subscribedPlaylists.push(c)
				}
			}
			this.subscribedPlaylists.sort(this.callback(this.playlistSort));
			this.showSubscribedPlaylists()
		}
	},
	populateSidebarStations: function () {
		if (GS.user.sidebarLoaded) {
			this.stations = [];
			for (var a = GS.user.sidebar.stations, b = 0; b < a.length; b++) {
				var c = a[b],
					g = $.localize.getString(GS.Models.Station.TAG_STATIONS[c]);
				g && this.stations.push({
					StationID: c,
					Station: GS.Models.Station.TAG_STATIONS[c],
					Name: g,
					PlaylistName: g,
					sidebarSort: b + 1
				})
			}
			this.stations.sort(this.callback("playlistSort"));
			this.showStations()
		}
	},
	showPlaylists: function () {
		$("#sidebar_playlists").html(this.view("playlists", {
			playlists: this.playlists,
			doingSubscribed: false
		}));
		$("#sidebar_playlists_divider").show();
		this.playlists.length ? $("#sidebar_playlist_new").hide() : $("#sidebar_playlist_new").show()
	},
	showSubscribedPlaylists: function () {
		$("#sidebar_subscribed_playlists").html(this.view("playlists", {
			playlists: this.subscribedPlaylists,
			doingSubscribed: true
		}));
		$("#sidebar_playlists_divider").show();
		this.subscribedPlaylists.length ? $("#sidebar_playlist_new").hide() : $("#sidebar_playlist_new").show()
	},
	showStations: function () {
		$("#sidebar_stations").html(this.view("stations"));
		$("#sidebar_stations_divider").show();
		GS.user.sidebar.stations.length < 1 ? $("#sidebar_station_new").show() : $("#sidebar_station_new").hide()
	},
	loginFailed: function (a) {
		if (a && a.authType) if (a.error) {
			console.error("sidebar.login fail", a);
			GS.lightbox.open("login", {
				error: a.error
			})
		} else switch (a.authType) {
		case "facebook":
			console.error("sidebar.facebook.login fail", a);
			GS.lightbox.open("login", {
				error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"
			});
			break;
		case "google":
			console.error("sidebar.goog.login fail", a);
			GS.lightbox.open("login", {
				error: "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR"
			});
			break
		}
	},
	"#sidebar_playlists_divider a.sidebarNew click": function (a, b) {
		b.stopPropagation();
		GS.lightbox.open("newPlaylist", []);
		return false
	},
	"#sidebar_playlist_new a click": function (a, b) {
		b.stopPropagation();
		GS.lightbox.open("newPlaylist", []);
		return false
	},
	"#sidebar_stations_divider a.sidebarNew click": function (a, b) {
		b.stopPropagation();
		var c = GS.Models.Station.getStationsMenu();
		if ($("div.jjsidebarMenuNew").is(":visible")) {
			$("div.jjsidebarMenuNew").hide();
			a.removeClass("active-context")
		} else $(a).jjmenu(b, c, null, {
			xposition: "right",
			yposition: "top",
			orientation: "top",
			show: "show",
			className: "sidebarmenu jjsidebarMenuNew",
			useEllipsis: false
		});
		return false
	},
	"#sidebar_station_new a click": function (a, b) {
		b.stopPropagation();
		var c = GS.Models.Station.getStationsMenu();
		if ($("div.jjsidebarMenuNew").is(":visible")) {
			$("div.jjsidebarMenuNew").hide();
			a.removeClass("active-context")
		} else $(a).jjmenu(b, c, null, {
			xposition: "right",
			yposition: "top",
			orientation: "top",
			show: "show",
			className: "sidebarmenu jjsidebarMenuNew",
			useEllipsis: false
		});
		return false
	},
	".sidebar_playlist_own .remove click": function (a, b) {
		b.stopPropagation();
		b.preventDefault();
		var c = a.parent().parent().attr("rel");
		GS.lightbox.open("removePlaylistSidebar", c);
		return false
	},
	".sidebar_playlist_subscribed .remove click": function (a, b) {
		b.stopPropagation();
		b.preventDefault();
		var c = a.parent().parent().attr("rel");
		GS.lightbox.open("removePlaylistSidebar", c);
		return false
	},
	"li.playlist mousedown": function (a, b) {
		if (b.button === 2) {
			b.stopPropagation();
			var c = a.attr("rel");
			c = GS.Models.Playlist.getOneFromCache(c).getContextMenu();
			$(a).jjmenu(b, c, null, {
				xposition: "mouse",
				yposition: "mouse",
				show: "show",
				className: "playlistmenu"
			})
		}
		return false
	},
	"li.station click": function (a, b) {
		b.stopPropagation();
		var c = a.attr("rel");
		GS.player.setAutoplay(true, c);
		return false
	},
	"li.station .remove click": function (a, b) {
		b.stopPropagation();
		var c = a.parent().parent().attr("rel");
		this.removeStationID = c;
		GS.user.removeFromShortcuts("station", c, true);
		return false
	},
	"a.noProfile click": function () {
		GS.lightbox.open("login")
	},
	"a.upload click": function () {
		(gsConfig.runMode = "production") ? window.open("http://listen.grooveshark.com/upload", "_blank") : window.open("http://" + location.host + "/upload", "_blank")
	},
	"#sidebar_footer a click": function (a, b) {
		b.stopImmediatePropagation();
		var c = GS.Models.Station.getStationsMenu(),
			g = [],
			h = GS.Models.Playlist.getPlaylistsMenu([], function (r) {
				r.addShortcut()
			}, true, false),
			k = {
				title: $.localize.getString("CONTEXT_NEW_PLAYLIST"),
				action: {
					type: "fn",
					callback: function () {
						GS.lightbox.open("newPlaylist", [])
					}
				}
			};
		if (h.length > 0) {
			h = [k,
			{
				customClass: "separator"
			}].concat(h);
			g.push({
				title: $.localize.getString("CONTEXT_ADD_PLAYLIST"),
				customClass: "addplaylist",
				type: "sub",
				src: h
			})
		} else g.push(k);
		g.push({
			title: $.localize.getString("CONTEXT_ADD_STATION"),
			customClass: "addstation",
			type: "sub",
			src: c
		});
		c = [{
			title: $.localize.getString("SETTINGS"),
			action: {
				type: "fn",
				callback: function () {
					window.location.hash = "#/settings"
				}
			}
		}, {
			title: $.localize.getString("CONTEXT_SORT_BY"),
			type: "sub",
			src: [{
				title: $.localize.getString("CONTEXT_SORT_BY_NAME"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.changeSort("PlaylistName")
					})
				}
			}, {
				title: $.localize.getString("DATE_ADDED"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						this.changeSort("sidebarSort")
					})
				}
			}]
		}];
		var m, o;
		switch (a.attr("name")) {
		case "new":
			m = g;
			o = "jjsidebarMenuNew";
			break;
		case "options":
			m = c;
			o = "jjsidebarMenuOptions";
			break
		}
		if ($("div." + o).is(":visible")) {
			$("div." + o).hide();
			a.removeClass("active-context")
		} else $(a).jjmenu(b, m, null, {
			xposition: "left",
			yposition: "top",
			orientation: "top",
			show: "show",
			className: "sidebarmenu " + o,
			useEllipsis: false
		})
	},
	beginDragDrop: function () {
		var a = $("#sidebar_playlists, li.sidebar_myMusic, li.sidebar_favorites");
		$("#sidebar_playlists,#sidebar_subscribed_playlists").bind("draginit", function (b, c) {
			var g = $(b.target).closest(".playlist");
			if (g.length === 0) return false;
			c.isSidebar = true;
			c.playlist = g;
			c.playlistOffsetLeft = b.clientX - g.offset().left;
			c.playlistOffsetTop = b.clientY - g.offset().top
		}).bind("dragstart", function (b, c) {
			c.draggedItems = [GS.Models.Playlist.getOneFromCache(c.playlist.attr("rel"))];
			c.playlistProxy = c.playlist.clone().prepend('<div class="status"></div>').addClass("dragProxy").css("position", "absolute").css("zIndex", "99999").appendTo("body");
			c.playerGuide = $("<div id='queue_songGuide'/>").addClass("size_" + GS.player.queueSize).css("position", "absolute").css("zIndex", "99998").css("width", 10).css("top", $("#queue_list").offset().top + 2).hide().appendTo("body");
			GS.guts.gaTrackEvent("sidebar", "dragSuccess")
		}).bind("drag", function (b, c) {
			c.playlistProxy.css("top", b.clientY - c.playlistOffsetTop).css("left", b.clientX - c.playlistOffsetLeft);
			if (c.dropContainers) {
				var g, h = false;
				for (var k in c.dropContainers) if (c.dropContainers.hasOwnProperty(k)) {
					g = c.dropContainers[k];
					if (g.within(b.clientX, b.clientY).length) {
						h = true;
						break
					}
				}
				h ? c.playlistProxy.addClass("valid").removeClass("invalid") : c.playlistProxy.addClass("invalid").removeClass("valid")
			}
			GS.player.managePlayerGuide(b, c)
		}).bind("dragend", function (b, c) {
			c.playlistProxy.remove();
			c.playerGuide.remove();
			GS.guts.gaTrackEvent("sidebar", "dragEnd")
		});
		a.bind("dropinit", function (b, c) {
			var g = $(b.target).closest(".sidebar.playlist");
			try {
				delete c.dropContainers.sidebar
			} catch (h) {}
			if (g.length > 0) return false;
			c.initTarget = b.target;
			if (c.dropContainers) c.dropContainers.sidebar = a;
			else c.dropContainers = {
				sidebar: a
			}
		}).bind("drop", function (b, c) {
			console.log("sidebar.drop.end", b, c);
			$("#sidebar_playlists li.playlist, li.sidebar_myMusic, li.sidebar_favorites").removeClass("hover");
			var g = $("#sidebar").within(b.clientX, b.clientY).length > 0,
				h = [],
				k = GS.Models.Playlist.getOneFromCache($(".playlist", "#sidebar_playlists").within(b.clientX, b.clientY).attr("rel")),
				m, o, r;
			if (!g) return false;
			if (k instanceof GS.Models.Playlist) {
				if (k.PlaylistID == c.draggedItems[0].PlaylistID) return false
			} else {
				g = $("li.sidebar_myMusic, li.sidebar_favorites").within(b.clientX, b.clientY).attr("rel");
				if (g == "library") o = true;
				else if (g == "favorites") r = true;
				else return false
			}
			if (typeof c.draggedItems[0].SongID !== "undefined") for (g = 0; g < c.draggedItems.length; g++) h.push(c.draggedItems[g].SongID);
			else if (typeof c.draggedItems[0].AlbumID !== "undefined") for (g = 0; g < c.draggedItems.length; g++) c.draggedItems[g].getSongs(function (w) {
				for (m = 0; m < w.length; m++) h.push(w[m].SongID)
			}, null, false, {
				async: false
			});
			else if (typeof c.draggedItems[0].ArtistID !== "undefined") for (g = 0; g < c.draggedItems.length; g++) c.draggedItems[g].getSongs(function (w) {
				for (m = 0; m < w.length; m++) h.push(w[m].SongID)
			}, null, false, {
				async: false
			});
			else if (typeof c.draggedItems[0].PlaylistID !== "undefined") for (g = 0; g < c.draggedItems.length; g++) c.draggedItems[g].getSongs(function (w) {
				for (m = 0; m < w.length; m++) h.push(w[m].SongID)
			}, null, false, {
				async: false
			});
			else if (typeof c.draggedItems[0].UserID !== "undefined") for (g = 0; g < c.draggedItems.length; g++) c.draggedItems[g].getFavoritesByType("Song", function (w) {
				for (m = 0; m < w.length; m++) h.push(w[m].SongID)
			}, null, false, {
				async: false
			});
			if (k instanceof GS.Models.Playlist) {
				k.addSongs(h, null, true);
				var s, u = [];
				$('#grid .slick-row.selected[id!="showQueue"]').each(function (w, C) {
					s = parseInt($(C).attr("row"), 10);
					isNaN(s) || u.push(s + 1)
				});
				u = u.sort(_.numSortA);
				GS.guts.logEvent("OLSongsDraggedToPlaylistSidebarItem", {
					ranks: u,
					songIDs: h
				})
			} else if (o) GS.user.addToLibrary(h);
			else if (r) for (g = 0; g < h.length; g++) GS.user.addToSongFavorites(h[g]);
			GS.guts.gaTrackEvent("sidebar", "dropSuccess")
		})
	},
	handleHover: function (a) {
		a = $(".sidebar_link a", "#sidebar").within(a.clientX, a.clientY);
		$("#sidebar .sidebar_link a").removeClass("hover");
		a.length && a.addClass("hover")
	},
	"a.fromSidebar click": function () {
		GS.page.setFromSidebar(1)
	}
});
(function () {
	var a;
	GS.Controllers.BaseController.extend("GS.Controllers.PlayerController", {
		onElement: "#footer"
	}, {
		REPEAT_NONE: 0,
		REPEAT_ALL: 1,
		REPEAT_ONE: 2,
		repeatStates: {
			none: 0,
			all: 1,
			one: 2
		},
		INDEX_DEFAULT: -1,
		INDEX_NEXT: -2,
		INDEX_LAST: -3,
		INDEX_REPLACE: -4,
		PLAY_STATUS_NONE: 0,
		PLAY_STATUS_INITIALIZING: 1,
		PLAY_STATUS_LOADING: 2,
		PLAY_STATUS_PLAYING: 3,
		PLAY_STATUS_PAUSED: 4,
		PLAY_STATUS_BUFFERING: 5,
		PLAY_STATUS_FAILED: 6,
		PLAY_STATUS_COMPLETED: 7,
		PLAY_CONTEXT_UNKNOWN: "unknown",
		PLAY_CONTEXT_SONG: "song",
		PLAY_CONTEXT_ALBUM: "album",
		PLAY_CONTEXT_ARTIST: "artist",
		PLAY_CONTEXT_PLAYLIST: "playlist",
		PLAY_CONTEXT_RADIO: "radio",
		PLAY_CONTEXT_SEARCH: "search",
		PLAY_CONTEXT_POPULAR: "popular",
		PLAY_CONTEXT_FEED: "feed",
		PLAY_CONTEXT_SIDEBAR: "sidebar",
		crossfadeAmount: 5E3,
		crossfadeEnabled: false,
		playPauseFade: false,
		prefetchEnabled: true,
		lowerQuality: false,
		embedTimeout: 0,
		playlistName: $.localize.getString("NOW_PLAYING"),
		songCountString: new GS.Models.DataString,
		numSongs: 0,
		player: null,
		isPlaying: false,
		isPaused: false,
		isLoading: false,
		nullStatus: {
			activeSong: {},
			bytesLoaded: 0,
			bytesTotal: 0,
			duration: 0,
			position: 0,
			status: 0
		},
		SCRUB_LOCK: false,
		queueIsVisible: true,
		userChangedQueueVisibility: false,
		QUEUE_SIZES: {
			s: {
				width: 139,
				activeWidth: 147
			},
			m: {
				width: 80,
				activeWidth: 96
			}
		},
		queueSize: "m",
		songWidth: 80,
		activeSongWidth: 96,
		gsQueue: null,
		allowRestore: true,
		videoModeEnabled: false,
		powerModeEnabled: false,
		exists: false,
		init: function () {
			a = this;
			if (location.hash.match(/^#\/s(?:ong)?\/(.*)\/?/)) this.allowRestore = false;
			this.beginDragDrop();
			this.addQueueSeek();
			this.addQueueMousewheel();
			this.addShortcuts();
			this.addVolumeSlider();
			this.setQueue(_.orEqual(store.get("queueSize"), "m"));
			$.subscribe("gs.auth.update", this.callback(this.userChange));
			$.subscribe("gs.auth.song.update", this.callback(this.songChange));
			$.subscribe("gs.settings.local.update", this.callback(this.updateWithLocalSettings));
			$.subscribe("gs.song.play", this.callback(this.eventPlaySong));
			$.subscribe("gs.album.play", this.callback(this.eventPlayAlbum));
			$.subscribe("gs.playlist.play", this.callback(this.eventPlayPlaylist));
			$.subscribe("gs.station.play", this.callback(this.eventPlayStation));
			$.subscribe("window.resize", this.callback(this.resize));
			this.exists = true;
			this._super()
		},
		appReady: function () {
			if (swfobject.hasFlashPlayerVersion("9.0.0")) this.embedTimeout = setTimeout(this.callback(this.onEmbedTimeout), 1E4);
			else setTimeout(function () {
				GS.lightbox.open("noFlash")
			}, 500)
		},
		resize: function () {
			a.updateQueueWidth()
		},
		setQueue: function (b) {
			var c = b === "s" ? a.smallQueueSongToHtml : a.queueSongToHtml,
				g = _.defined(a.queue) && a.queue.songs ? a.queue.songs : [];
			a.queueSize = b;
			a.songWidth = a.QUEUE_SIZES[b].width;
			a.activeSongWidth = a.QUEUE_SIZES[b].activeWidth;
			store.set("queueSize", b);
			a.gsQueue = $("#queue").toggleClass("small", b === "s").gsQueue({
				activeItemWidth: a.activeSongWidth,
				itemWidth: a.songWidth,
				itemRenderer: c
			}, g);
			$(window).resize()
		},
		userChange: function () {
			console.log("player.userChange");
			this.updateWithLocalSettings()
		},
		playerExists: function () {
			return this.exists
		},
		playerReady: function () {
			console.log("playerReady");
			a.player.setErrorCallback("GS.Controllers.PlayerController.instance().playerError");
			a.player.setPlaybackStatusCallback("GS.Controllers.PlayerController.instance().playerStatus");
			a.player.setPropertyChangeCallback("GS.Controllers.PlayerController.instance().propertyChange");
			a.player.setQueueChangeCallback("GS.Controllers.PlayerController.instance().queueChange");
			a.player.setSongPropertyChangeCallback("GS.Controllers.PlayerController.instance().songChange");
			a.player.setChatServers(gsConfig.chatServersWeighted ? gsConfig.chatServersWeighted : {});
			var b = a.player.setZoomChangeCallback("GS.Controllers.PlayerController.instance().onZoomChange");
			a.onZoomChange(b);
			$("#volumeSlider").slider("value", a.player.getVolume());
			a.updateWithLocalSettings();
			clearTimeout(a.embedTimeout);
			a.embedTimeout = null;
			GS.lightbox && GS.lightbox.isOpen && GS.lightbox.curType == "swfTimeout" && GS.lightbox.close();
			return true
		},
		onEmbedTimeout: function () {
			a.player || GS.lightbox.open("swfTimeout")
		},
		queueIsRestorable: function () {
			var b = a.getCurrentQueue();
			if (GS.user.settings.local.restoreQueue && a.allowRestore) a.restoreQueue();
			else {
				b.hasRestoreQueue = true;
				$("#queue_clear_button").addClass("undo");
				_.defined(restoreQueue) || $.publish("gs.player.restorequeue")
			}
		},
		onZoomChange: function (b) {
			if (b && (!GS.airbridge || !GS.airbridge.isDesktop)) {
				console.warn("ZOOM CHANGED, NOT ZERO", b);
				alert($.localize.getString("ZOOM_ALERT"))
			}
		},
		storeQueue: function () {
			a.player && a.player.storeQueue()
		},
		playerError: function (b) {
			console.log("player.playererror", b);
			switch (b.type) {
			case "errorAddingSongs":
				console.log("player. failed to add songs: ", b.details.songs, b.details.reason);
				$.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_ADDING_SONG") + ": " + b.details.reason
				});
				break;
			case "playbackError":
				console.log("player. error playing song", b.details.song, b.details.reason, b.details.errorDetail);
				b.details.reason === "unknownHasNext" ? $.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_HASNEXT_MESSAGE")
				}) : $.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_PLAYING_SONG")
				});
				break;
			case "autoplayFailed":
				console.log("player. error fetching autoplay song", b.details.reason);
				b.details.reason === "unknownHasNext" ? $.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_HASNEXT_MESSAGE")
				}) : $.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_FETCHING_RADIO")
				});
				break;
			case "autoplayVoteError":
				console.log("player. error voting song", b.details.song);
				$.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_VOTING_SONG")
				});
				break;
			case "serviceError":
				console.log("player. service error", b.details);
				$.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("ERROR_FETCHING_INFO")
				});
				break
			}
			b.details.errorDetail ? GS.guts.gaTrackEvent("playerError", b.type, b.details.reason, b.details.errorDetail) : GS.guts.gaTrackEvent("playerError", b.type, b.details.reason)
		},
		$seekBar: $("#seeking_wrapper .bar:first"),
		$seekBuffer: $("#seeking_wrapper .bar.buffer"),
		$seekProgress: $("#seeking_wrapper .bar.progress"),
		$seekScrubber: $("#seeking_wrapper .scrubber"),
		lastStatus: false,
		lastPlayedQueueSongID: false,
		playerStatus: function (b) {
			b = b || this.nullStatus;
			if (!this.currentSong || this.currentSong.queueSongID !== b.activeSong.queueSongID) {
				b.activeSong = GS.Models.Song.wrapQueue([b.activeSong])[0];
				this.updateSongOnPlayer(b.activeSong)
			} else b.activeSong = this.currentSong;
			var c = Math.min(1, b.bytesLoaded / b.bytesTotal),
				g = Math.min(1, b.position / b.duration),
				h = this.$seekBar.width();
			c = Math.min(h, c * 100);
			var k = Math.min(h, g * 100);
			g = Math.min(h, Math.max(0, h * g));
			c = isNaN(c) ? 0 : c;
			k = isNaN(k) ? 0 : k;
			g = isNaN(g) ? 0 : g;
			this.$seekBuffer.width(c + "%");
			this.$seekProgress.width(k + "%");
			this.SCRUB_LOCK || this.$seekScrubber.css("left", g);
			if (b.duration > 0) {
				b.position == 0 ? $("#player_elapsed").text("0:00") : $("#player_elapsed").text(_.millisToMinutesSeconds(b.position));
				b.duration == 0 ? $("#player_duration").text("0:00") : $("#player_duration").text(_.millisToMinutesSeconds(b.duration))
			} else {
				$("#player_elapsed").text("0:00");
				$("#player_duration").text("0:00")
			}
			b.currentStreamServer && b.currentStreamServer !== this.lastStatus.currentStreamServer && $.publish("gs.player.streamserver", {
				streamServer: b.currentStreamServer
			});
			this.powerModeEnabled && b.position > 6E4 && this.nextSong();
			switch (b.status) {
			case a.PLAY_STATUS_NONE:
				console.log("PLAY_STATUS_NONE");
				a.isPlaying = false;
				a.isPaused = false;
				a.isLoading = false;
				a.seek.slider("disable");
				$("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
				$("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
				$.publish("gs.player.stopped", b.activeSong);
				break;
			case a.PLAY_STATUS_INITIALIZING:
				GS.guts.logEvent("playStatusUpdate", {
					playStatus: "INITIALIZING"
				});
				console.log("PLAY_STATUS_INITIALIZING");
				a.isPlaying = true;
				a.isPaused = false;
				a.isLoading = true;
				this.lastStatus !== b.status && this.lastStatus == a.PLAY_STATUS_COMPLETED && GS.guts.gaTrackEvent("player", "continueInterrupted", b.activeSong.SongID);
				if ((gsConfig.isPreview || GS.airbridge && GS.airbridge.isDesktop) && !GS.user.IsPremium) {
					this.stopSong();
					GS.lightbox.open("login", {
						premiumRequired: true
					})
				}
				break;
			case a.PLAY_STATUS_LOADING:
				console.log("PLAY_STATUS_LOADING");
				GS.guts.logEvent("playStatusUpdate", {
					playStatus: "LOADING"
				});
				if (this.lastStatus !== b.status) {
					a.isPlaying = true;
					a.isPaused = false;
					a.isLoading = true;
					a.updateSongOnPlayer(b.activeSong);
					$("#player_play_pause").is(".buffering") || $("#player_play_pause").removeClass("play").removeClass("pause").addClass("buffering");
					$("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
					GS.guts.gaTrackEvent("player", "loading", b.activeSong.SongID)
				}
				if (this.pauseNextQueueSongID && this.pauseNextQueueSongID === b.activeSong.queueSongID) {
					this.pauseNextQueueSongID = false;
					this.pauseSong()
				}
				break;
			case a.PLAY_STATUS_PLAYING:
				if (this.lastStatus !== b.status) {
					console.log("PLAY_STATUS_PLAYING");
					a.isPlaying = true;
					a.isPaused = false;
					a.isLoading = false;
					a.seek.slider("enable");
					$("#player_play_pause").is(".pause") || $("#player_play_pause").removeClass("play").addClass("pause").removeClass("buffering");
					$("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
					$.publish("gs.player.playing", b);
					if (this.lastPlayedQueueSongID !== b.activeSong.queueSongID) {
						this.lastStatus == a.PLAY_STATUS_COMPLETED && GS.guts.gaTrackEvent("player", "continueNextSong", b.activeSong.SongID);
						GS.guts.gaTrackEvent("player", "play", b.activeSong.SongID);
						this.trackAutoplayEvent("play");
						this.lastPlayedQueueSongID = b.activeSong ? b.activeSong.queueSongID : false
					}
				}
				if (this.pauseNextQueueSongID && this.pauseNextQueueSongID === b.activeSong.queueSongID) {
					this.pauseNextQueueSongID = false;
					this.pauseSong()
				}
				$.publish("gs.player.playing.continue", b);
				break;
			case a.PLAY_STATUS_PAUSED:
				console.log("PLAY_STATUS_PAUSED");
				GS.guts.logEvent("playStatusUpdate", {
					playStatus: "PAUSED"
				});
				if (this.lastStatus !== b.status) {
					a.isPlaying = false;
					a.isPaused = true;
					a.isLoading = false;
					$("#player_play_pause").is(".play") || $("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
					$("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
					$.publish("gs.player.paused", b.activeSong)
				}
				break;
			case a.PLAY_STATUS_BUFFERING:
				GS.guts.logEvent("playStatusUpdate", {
					playStatus: "BUFFERING"
				});
				console.log("PLAY_STATUS_BUFFERING");
				a.isPlaying = true;
				a.isPaused = false;
				a.isLoading = true;
				$("#player_play_pause").is(".buffering") || $("#player_play_pause").removeClass("play").removeClass("pause").addClass("buffering");
				$("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
				break;
			case a.PLAY_STATUS_FAILED:
				console.log("PLAY_STATUS_FAILED");
				GS.guts.logEvent("playStatusUpdate", {
					playStatus: "FAILED"
				});
				a.isPlaying = false;
				a.isPaused = false;
				a.isLoading = false;
				a.seek.slider("disable");
				$("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
				$("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
				break;
			case a.PLAY_STATUS_COMPLETED:
				console.log("PLAY_STATUS_COMPLETED");
				GS.guts.logEvent("playStatusUpdate", {
					playStatus: "COMPLETED"
				});
				a.isPlaying = false;
				a.isPaused = false;
				a.isLoading = false;
				a.seek.slider("disable");
				$("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
				$("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
				a.$seekBuffer.width("0%");
				a.$seekProgress.width("0%");
				a.$seekScrubber.css("left", 0);
				$.publish("gs.player.stopped", b.activeSong);
				$.publish("gs.player.completed", b.activeSong);
				break
			}
			this.lastStatus = b.status;
			$.publish("gs.player.playstatus", b)
		},
		pauseNextQueueSongID: false,
		pauseNextSong: function () {
			var b = this.getCurrentQueue(true);
			this.pauseNextQueueSongID = b && b.nextSong && b.nextSong.queueSongID ? b.nextSong.queueSongID : false
		},
		propertyChange: function (b) {
			if (b.isMuted) {
				$("#player_volume").addClass("muted");
				$("#volumeSlider").slider("value", 0)
			} else {
				$("#player_volume").removeClass("muted");
				$("#volumeSlider").slider("value", b.volume)
			}
			b.crossfadeEnabled ? $("#player_crossfade").addClass("active") : $("#player_crossfade").removeClass("active")
		},
		queueChange: function (b) {
			var c = b.fullQueue;
			if (a.player) c.hasRestoreQueue = a.player.getQueueIsRestorable();
			a.queue = false;
			switch (b.type) {
			case "queueReset":
				c.activeSong = c.activeSong ? GS.Models.Song.wrapQueue([c.activeSong])[0] : null;
				this.updateSongOnPlayer(c.activeSong);
				c.songs = GS.Models.Song.wrapQueue(c.songs);
				a.queue = c;
				a.updateQueueDetails(c);
				a.updateQueueSongs(c);
				break;
			case "propertyChange":
				if (b.details.hasOwnProperty("autoplayEnabled")) b.details.autoplayEnabled == true ? GS.guts.logEvent("autoplayOn", {}) : GS.guts.logEvent("autoplayOff", {});
				a.updateQueueDetails();
				break;
			case "contentChange":
				a.gsQueue.setActive(a.getCurrentQueue().activeSong.index, false);
				a.gsQueue.setItems(a.getCurrentQueue().songs);
				a.updateQueueWidth();
				a.updateQueueDetails();
				break
			}
			$.publish("gs.player.queue.change")
		},
		songChange: function (b) {
			var c, g;
			a.player && a.player.getCurrentQueue();
			b instanceof GS.Models.Song || (b = GS.Models.Song.wrapQueue([b])[0]);
			g = a.getCurrentQueue().songs;
			for (c = 0; c < g.length; c++) if (g[c].SongID === b.SongID) for (var h in b) if (b.hasOwnProperty(h)) g[c][h] = b[h];
			a.gsQueue.setItems(g);
			a.updateQueueDetails()
		},
		updateWithLocalSettings: function (b) {
			if (this.player) {
				b = b || GS.user.settings.local;
				b.crossfadeEnabled != this.getCrossfadeEnabled() && this.setCrossfadeEnabled(b.crossfadeEnabled);
				b.crossfadeAmount != this.getCrossfadeAmount() && this.setCrossfadeAmount(b.crossfadeAmount);
				b.lowerQuality != this.getLowerQuality() && this.setLowerQuality(b.lowerQuality);
				!b.noPrefetch != this.getPrefetchEnabled() && this.setPrefetchEnabled(!b.noPrefetch);
				b.playPauseFade != this.getPlayPauseFade() && this.setPlayPauseFade(b.playPauseFade);
				this.setPersistShuffle(b.persistShuffle);
				b.persistShuffle && b.lastShuffle != this.getShuffle() && this.setShuffle(b.lastShuffle)
			}
		},
		getEverything: function () {
			if (a.player) return a.player.getEverything();
			return {}
		},
		getPlaybackStatus: function () {
			if (a.player) return a.player.getPlaybackStatus();
			return {}
		},
		getSongDetails: function (b, c) {
			var g;
			b = _.orEqual(b, 0);
			if (typeof c === "number" || typeof c === "string") c = [c];
			if (a.player) {
				g = a.player.getSongDetails(b, c);
				return GS.Models.Song.wrapQueue(g)
			}
			return GS.Models.Song.wrap({})
		},
		getCurrentSong: function () {
			if (a.player) return a.getCurrentQueue().activeSong
		},
		setActiveSong: function (b) {
			if (b && a.player) return a.player.setActiveSong(b);
			return false
		},
		addSongsToQueueAt: function (b, c, g, h) {
			c = _.orEqual(c, this.INDEX_DEFAULT);
			g = _.orEqual(g, false);
			h = _.orEqual(h, {
				type: this.PLAY_CONTEXT_UNKNOWN
			});
			console.log("adding songs with context", h);
			$.isArray(b) || (b = b.split(","));
			var k, m = [];
			for (k = 0; k < b.length; k++) b[k] > 0 && GS.Models.Song.getSong(b[k], this.callback(function (o) {
				o = o.dupe();
				o.songs = {};
				o.fanbase = {};
				m[k] = o
			}), false, false, {
				async: false
			});
			if (a.player) {
				if (c == -4) {
					c = -1;
					this.clearQueue()
				}
				a.player.addSongsToQueueAt(m, c, g, h);
				GS.guts.logEvent("songsQueued", {
					songIDs: b
				})
			}
		},
		playSong: function (b) {
			GS.isPlaying = true;
			a.player && a.player.playSong(b)
		},
		eventPlaySong: function (b) {
			if (b && b.songID) {
				GS.notice.feedbackOnNextSong = _.orEqual(b.getFeedback, false);
				a.addSongAndPlay(b.songID)
			}
		},
		eventPlayAlbum: function (b) {
			if (b && b.albumID) {
				GS.notice.feedbackOnNextSong = _.orEqual(b.getFeedback, false);
				GS.Models.Album.getAlbum(b.albumID, this.callback("playAlbum", b), null, false)
			}
		},
		playAlbum: function (b, c) {
			console.log("player.playAlbum", b, c);
			var g = _.orEqual(b.index, -1),
				h = _.orEqual(b.playOnAdd, false);
			c.play(g, h)
		},
		eventPlayPlaylist: function (b) {
			if (b && b.playlistID) {
				GS.notice.feedbackOnNextSong = _.orEqual(b.getFeedback, false);
				GS.Models.Playlist.getPlaylist(b.playlistID, this.callback("playPlaylist", b), null, false)
			}
		},
		playPlaylist: function (b, c) {
			console.log("player.playPlaylist", b, c);
			var g = _.orEqual(b.index, -1),
				h = _.orEqual(b.playOnAdd, false);
			c.play(g, h)
		},
		eventPlayStation: function (b) {
			if (b && b.tagID) {
				console.log("play station", b.tagID);
				a.setAutoplay(true, b.tagID)
			}
		},
		addSongAndPlay: function (b, c) {
			a.player && a.addSongsToQueueAt([b], a.INDEX_DEFAULT, true, c)
		},
		pauseSong: function () {
			a.isPlaying = false;
			a.isPaused = true;
			if (a.player) {
				a.player.pauseSong();
				$.publish("gs.player.paused")
			}
			GS.guts.gaTrackEvent("player", "pauseSong")
		},
		resumeSong: function () {
			a.isPlaying = true;
			a.isPaused = false;
			a.player && a.player.resumeSong();
			GS.guts.gaTrackEvent("player", "resumeSong")
		},
		stopSong: function () {
			a.isPlaying = false;
			a.isPaused = false;
			a.player && a.player.stopSong();
			GS.guts.gaTrackEvent("player", "stopSong")
		},
		previousSong: function (b) {
			b = b ? true : false;
			if (a.videoModeEnabled) a.youtubePrevSong();
			else a.player && a.player.previousSong(b);
			GS.guts.gaTrackEvent("player", "prevSong");
			a.trackAutoplayEvent("prev")
		},
		nextSong: function () {
			if (a.videoModeEnabled) a.youtubeNextSong();
			else a.player && a.player.nextSong();
			GS.guts.gaTrackEvent("player", "nextSong");
			a.trackAutoplayEvent("next")
		},
		seekTo: function (b) {
			a.player && a.player.seekTo(b);
			GS.guts.gaTrackEvent("player", "seekTo")
		},
		clearQueue: function () {
			if (a.player) {
				a.queue = null;
				a.player.stopSong();
				a.player.clearQueue();
				a.playerStatus(a.player.getPlaybackStatus());
				a.updateQueueWidth();
				a.gsQueue.setActive(0, false);
				a.gsQueue.setItems([]);
				$("#playerDetails_nowPlaying").html("");
				GS.guts.logEvent("queueCleared", {})
			}
			GS.guts.gaTrackEvent("player", "clearQueue")
		},
		restoreQueue: function () {
			a.player && a.player.restoreQueue();
			GS.guts.gaTrackEvent("player", "restoreQueue")
		},
		saveQueue: function () {
			for (var b = a.getCurrentQueue().songs, c = [], g = 0; g < b.length; g++) c.push(b[g].SongID);
			GS.lightbox.open("newPlaylist", c);
			GS.guts.logEvent("queueSaveInitiated", {});
			GS.guts.gaTrackEvent("player", "saveQueue")
		},
		getCurrentQueue: function (b) {
			b = _.orEqual(b, false);
			if (!b && a.queue) return a.queue;
			if (a.player) {
				b = a.player.getCurrentQueue();
				if (b.activeSong) {
					b.activeSong = GS.Models.Song.wrapQueue([b.activeSong])[0];
					this.updateSongOnPlayer(b.activeSong)
				}
				if (b.songs && b.songs.length) b.songs = GS.Models.Song.wrapQueue(b.songs);
				b.hasRestoreQueue = a.player.getQueueIsRestorable();
				return a.queue = b
			}
		},
		getPreviousQueue: function () {
			a.player && a.player.getPreviousQueue();
			GS.guts.gaTrackEvent("player", "previousQueue")
		},
		moveSongsTo: function (b, c) {
			if (typeof b === "number" || typeof b === "string") b = [b];
			a.player && a.player.moveSongsTo(b, c)
		},
		removeSongs: function (b) {
			if (typeof b === "number" || typeof b === "string") b = [b];
			if (a.player) {
				for (queueSongID in b);
				a.player.removeSongs(b);
				a.updateQueueWidth()
			}
			a.queue = false;
			a.queue = a.getCurrentQueue();
			$.publish("gs.player.queue.change");
			GS.guts.gaTrackEvent("player", "removeSongs");
			a.trackAutoplayEvent("removeSongs")
		},
		lastAutoplayInfo: false,
		setAutoplay: function (b, c) {
			var g = a.getCurrentQueue();
			b = b ? true : false;
			c = parseInt(c, 10);
			if (isNaN(c)) c = 0;
			if (c > 0 && g && g.songs.length > 0) GS.lightbox.open("radioClearQueue", c);
			else {
				if (a.player) {
					b ? $("#player button.radio").addClass("active") : $("#player button.radio").removeClass("active");
					$("#queue_radio_button").toggleClass("active", b);
					a.player.setAutoplay(b, c)
				}
				GS.guts.gaTrackEvent("player", b ? "enableRadio" : "disableRadio", c)
			}
		},
		trackLastAutoplayInfo: function (b, c) {
			if (a.lastAutoplayInfo && (!b || a.lastAutoplayInfo.tagID != c)) {
				var g = (new Date).getTime() - a.lastAutoplayInfo.time;
				GS.guts.gaTrackEvent("player", "autoplayDuration", a.lastAutoplayInfo.tagID, g)
			}
			if (b) {
				if (!a.lastAutoplayInfo || a.lastAutoplayInfo && a.lastAutoplayInfo.tagID !== c) a.lastAutoplayInfo = {
					tagID: c,
					time: (new Date).getTime()
				}
			} else a.lastAutoplayInfo = false
		},
		trackAutoplayEvent: function (b) {
			b = "" + b;
			a.lastAutoplayInfo && b && GS.guts.gaTrackEvent("player", "autoplay" + _.ucwords(b), a.lastAutoplayInfo.tagID)
		},
		voteSong: function (b, c) {
			if (a.player) {
				a.player.voteSong(b, c);
				switch (c) {
				case -1:
					GS.guts.logEvent("songDownVoted", {
						songID: this.getSongDetails(a.queue.queueID, [b])[0].SongID
					});
					GS.guts.gaTrackEvent("player", "voteSongDown");
					break;
				case 0:
					GS.guts.logEvent("songVotedNeutral", {
						songID: this.getSongDetails(a.queue.queueID, [b])[0].SongID
					});
					GS.guts.gaTrackEvent("player", "voteSongNeutral");
					break;
				case 1:
					GS.guts.logEvent("songUpVoted", {
						songID: this.getSongDetails(a.queue.queueID, [b])[0].SongID
					});
					GS.guts.gaTrackEvent("player", "voteSongUp");
					break;
				default:
					break
				}
			}
		},
		flagSong: function (b, c) {
			if (a.player) {
				a.player.flagSong(b, c);
				$.publish("gs.notification", {
					message: $.localize.getString("SUCCESS_FLAG_SONG")
				})
			}
			GS.guts.gaTrackEvent("player", "flagSong", c)
		},
		getVolume: function () {
			if (a.player) return a.player.getVolume()
		},
		setVolume: function (b) {
			b = Math.max(0, Math.min(100, parseInt(b, 10)));
			a.player && a.player.setVolume(b);
			GS.guts.gaTrackEvent("player", "setVolume", b)
		},
		getCrossfadeAmount: function () {
			if (a.player) return a.player.getCrossfadeAmount()
		},
		getCrossfadeEnabled: function () {
			if (a.player) return a.player.getCrossfadeEnabled()
		},
		setCrossfadeAmount: function (b) {
			b = parseInt(b, 10);
			a.player && a.player.setCrossfadeAmount(b);
			GS.guts.gaTrackEvent("player", "setCrossfade", b)
		},
		setCrossfadeEnabled: function (b) {
			b = b && GS.user.IsPremium ? true : false;
			a.player && a.player.setCrossfadeEnabled(b);
			GS.user.settings.changeLocalSettings({
				crossfadeEnabled: b ? 1 : 0
			});
			GS.guts.gaTrackEvent("player", b ? "enableCrossfade" : "disableCrossfade")
		},
		setPrefetchEnabled: function (b) {
			b = b ? true : false;
			a.player && a.player.setPrefetchEnabled(b);
			GS.guts.gaTrackEvent("player", b ? "enablePrefetch" : "disablePrefetch")
		},
		getPrefetchEnabled: function () {
			if (a.player) return a.player.getPrefetchEnabled()
		},
		setLowerQuality: function (b) {
			b = b ? true : false;
			a.player && a.player.setLowerQuality(b);
			GS.guts.gaTrackEvent("player", b ? "enableLowerQuality" : "disableLowerQuality")
		},
		getLowerQuality: function () {
			if (a.player) return a.player.getLowerQuality()
		},
		getIsMuted: function () {
			if (a.player) return a.player.getIsMuted()
		},
		setIsMuted: function (b) {
			b = b ? true : false;
			a.player && a.player.setIsMuted(b);
			GS.guts.gaTrackEvent("player", b ? "enableMuted" : "disableMuted")
		},
		getPlayPauseFade: function () {
			if (a.player) return a.player.getPlayPauseFade()
		},
		setPlayPauseFade: function (b) {
			b = b ? true : false;
			a.player && a.player.setPlayPauseFade(b);
			GS.user.settings.changeLocalSettings({
				playPauseFade: b ? 1 : 0
			});
			GS.guts.gaTrackEvent("player", b ? "enablePlayPauseFade" : "disablePlayPauseFade")
		},
		setRepeat: function (b) {
			a.repeat = b;
			a.player && a.player.setRepeat(b);
			GS.guts.gaTrackEvent("player", "setRepeat", b)
		},
		getRepeat: function () {
			if (a.player && a.player.getRepeat) return a.player.getRepeat();
			return a.repeat
		},
		setShuffle: function (b) {
			if (!(a.queue && a.queue.autoplayEnabled)) {
				b = b ? true : false;
				a.player && a.player.setShuffle(b);
				GS.user.settings.changeLocalSettings({
					lastShuffle: b ? 1 : 0
				});
				GS.guts.gaTrackEvent("player", "shuffle", b ? "on" : "off")
			}
		},
		getShuffle: function () {
			if (a.player) return a.player.getShuffle();
			return false
		},
		setPersistShuffle: function (b) {
			b = b ? true : false;
			a.player && a.player.setPersistShuffle(b);
			GS.guts.gaTrackEvent("player", "persistShuffle", b ? "on" : "off")
		},
		getAPIVersion: function () {
			if (a.player) return a.player.getAPIVersion()
		},
		getApplicationVersion: function () {
			if (a.player) return a.player.getApplicationVersion()
		},
		updateSongOnPlayer: function (b, c) {
			c = _.orEqual(c, false);
			if (!(!c && a.currentSong && a.currentSong.queueSongID === b.queueSongID)) {
				a.currentSong = b && !(b instanceof GS.Models.Song) ? GS.Models.Song.wrapQueue([b])[0] : b;
				if (a.currentSong instanceof GS.Models.Song) {
					a.videoIndex = a.currentSong.index;
					$.publish("gs.player.nowplaying", a.currentSong);
					$("#queue_list li.queue-item.queue-item-active").removeClass("active");
					$("#queue_list #" + a.currentSong.queueSongID).addClass("active");
					$("#playerDetails_nowPlaying").html(a.view("currentSongDetails")).attr("rel", a.currentSong.SongID).attr("qsid", a.currentSong.queueSongID);
					_.defined(a.currentSong.index) && a.gsQueue.setActive(a.currentSong.index, !a.isMouseDown)
				}
			}
		},
		updateQueueDetails: function (b) {
			b || (b = a.getCurrentQueue());
			a.queueIsVisible = $("#queue").is(":visible");
			if (b.hasOwnProperty("songs")) {
				b.songs.length && !a.queueIsVisible && !a.userChangedQueueVisibility && a.toggleQueue();
				if (b.songs.length > 0) {
					$("#seeking_wrapper .scrubber").show();
					$("#player_previous").removeAttr("disabled").removeClass("disabled")
				} else {
					$("#seeking_wrapper .scrubber").hide();
					$("#player_previous").attr("disabled", "disabled").addClass("disabled")
				}
			}
			$("#playerDetails_queue").html(a.view("queueDetails"));
			a.songCountString.hookup("#player_songCount");
			if (b.hasOwnProperty("nextSong")) if (b.nextSong) {
				$("#player_next").removeAttr("disabled").removeClass("disabled");
				if (a.pauseNextQueueSongID && b.nextSong.hasOwnProperty("queueSongID")) a.pauseNextQueueSongID = b.nextSong.queueSongID
			} else $("#player_next", a.element).attr("disabled", "disabled").addClass("disabled");
			if (b.hasOwnProperty("activeSong")) if (b.activeSong) {
				$("#player_play_pause").removeAttr("disabled").removeClass("disabled");
				a.updateSongOnPlayer(b.activeSong)
			} else $("#player_play_pause").attr("disabled", "disabled").addClass("disabled");
			if (b.hasOwnProperty("repeatMode")) {
				a.repeatMode = b.repeatMode;
				if (a.repeatMode === a.REPEAT_ALL) $("#player_loop").removeClass("none").addClass("all").addClass("active");
				else if (a.repeatMode === a.REPEAT_ONE) $("#player_loop").removeClass("all").addClass("one").addClass("active");
				else a.repeatMode === a.REPEAT_NONE && $("#player_loop").removeClass("one").addClass("none").removeClass("active")
			}
			if (b.hasOwnProperty("autoplayEnabled")) {
				if (b.autoplayEnabled) {
					$("#queue_list").addClass("autoplay");
					$("#player_shuffle").removeClass("active");
					$("#playerDetails button.radio").addClass("active");
					if (b.currentAutoplayTagID > 0) {
						var c = $.localize.getString(GS.Models.Station.TAG_STATIONS[b.currentAutoplayTagID]);
						c || (c = GS.theme.extraStations[b.currentAutoplayTagID]);
						$("#playerDetails_queue .queueType").text(c)
					} else $("#playerDetails_queue .queueType").text($.localize.getString("NOW_PLAYING"))
				} else {
					$("#queue_list").removeClass("autoplay");
					b.activeSong && b.activeSong.context && b.activeSong.context.type === "playlist" && b.activeSong.context.data.playlistName ? $("#playerDetails_queue .queueType").text(b.activeSong.context.data.playlistName) : $("#playerDetails_queue .queueType").text($.localize.getString("NOW_PLAYING"));
					$("#playerDetails button.radio").removeClass("active");
					b.shuffleEnabled ? $("#player_shuffle").addClass("active") : $("#player_shuffle").removeClass("active")
				}
				a.trackLastAutoplayInfo(b.autoplayEnabled, b.currentAutoplayTagID)
			}
		},
		updateQueueSongs: function (b) {
			if (b.hasOwnProperty("songs")) if (b.songs.length) {
				a.currentSong = b.activeSong;
				a.songs = b.songs;
				a.gsQueue.setActive(b.activeSong.index, false);
				a.gsQueue.setItems(b.songs)
			} else {
				a.activeSong = b.activeSong;
				a.songs = b.songs;
				$("#playerDetails_nowPlaying").html("");
				a.gsQueue.setActive(0, false);
				a.gsQueue.setItems([])
			}
		},
		updateQueueWidth: function () {
			var b, c, g = a.getCurrentQueue();
			if (g) {
				parseInt($("#queue_list_window").css("padding-left"), 10);
				b = $("#queue").width();
				c = $("#queue").height();
				if (g && g.songs && g.songs.length > 0) {
					b = a.songWidth * (g.songs.length - 1) + a.activeSongWidth;
					$("#queue_list").removeClass("empty")
				} else {
					b = b;
					$("#queue_list").addClass("empty").width("")
				}
				c !== $("#queue").height() && a.lastQueueWidth !== b && $(window).resize();
				a.lastQueueWidth = b
			}
		},
		autoScrollWaitDuration: 300,
		beginDragDrop: function () {
			var b = $("#queue_list"),
				c = $("#queue_list_window"),
				g = $("#queue");
			b.bind("draginit", function (h, k) {
				var m = $(h.target).closest(".queue-item");
				if (m.length === 0) return false;
				k.song = m;
				k.songOffsetLeft = h.clientX - m.offset().left;
				k.songOffsetTop = h.clientY - m.offset().top;
				var o = $("#queue_list_window").scrollLeft();
				k.startIndex = Math.max(0, Math.min(Math.floor((h.clientX + o) / m.outerWidth(true)), b.children().length))
			}).bind("dragstart", function (h, k) {
				k.songProxy = k.song.clone().prepend('<div class="status"></div>').css("position", "absolute").css("zIndex", "99999").addClass("queue-item-drag").appendTo("body").mousewheel(function (m, o) {
					$("#queue_list_window").within(m.clientX, m.clientY).length > 0 && $("#queue_list_window").scrollLeft($("#queue_list_window").scrollLeft() - 82 * o)
				});
				k.playerGuide = $("<div id='queue_songGuide'/>").addClass("size_" + GS.player.queueSize).css("position", "absolute").css("zIndex", "99998").css("height", k.song.outerHeight(true)).css("width", 10).css("top", k.song.offset().top + 5).hide().appendTo("body");
				k.stopIndex = -1;
				k.draggedItems = [GS.Models.Song.getOneFromCache(k.song.find(".queueSong").attr("rel"))];
				k.queueLength = a.getCurrentQueue().songs.length;
				GS.guts.gaTrackEvent("player", "dragStart")
			}).bind("drag", function (h, k) {
				var m = $(this).offset().left,
					o = g.within(h.clientX, h.clientY).length > 0,
					r = 0,
					s = c.scrollLeft() - 10,
					u = parseInt(c.width(), 10) * 0.6;
				r = b.parent();
				var w = _.orEqual(a.getCurrentQueue().activeSong.index, 0);
				k.songProxy.css("top", h.clientY - k.songOffsetTop).css("left", h.clientX - k.songOffsetLeft);
				if (o) {
					k.playerGuide.show();
					if (r.offset().left + 200 > h.clientX) {
						r = Math.max(0, s - u);
						$("#queue_list_window").scrollLeft(r);
						a.gsQueue.updateScrollbar();
						clearInterval(k.autoScrollInterval);
						k.autoScrollInterval = setInterval(function () {
							var v = $("#queue_list_window").scrollLeft();
							v = Math.max(0, v - u);
							$("#queue_list_window").scrollLeft(v);
							a.gsQueue.updateScrollbar()
						}, a.autoScrollWaitDuration)
					} else if (r.width() - 200 < h.clientX) {
						r = Math.min(b.width(), s + u);
						$("#queue_list_window").scrollLeft(r);
						a.gsQueue.updateScrollbar();
						clearInterval(k.autoScrollInterval);
						k.autoScrollInterval = setInterval(function () {
							var v = $("#queue_list_window").scrollLeft();
							v = Math.min(b.width(), v + u);
							$("#queue_list_window").scrollLeft(v);
							a.gsQueue.updateScrollbar()
						}, a.autoScrollWaitDuration)
					} else clearInterval(k.autoScrollInterval)
				} else {
					k.playerGuide.hide();
					clearInterval(k.autoScrollInterval)
				}
				if (h.clientX > parseInt($("#queue_list .queue-item-active").css("left"), 10) + a.activeSongWidth) s -= a.activeSongWidth - a.songWidth;
				s = Math.max(0, Math.min(k.queueLength, Math.round((h.clientX + s) / a.songWidth)));
				if (s !== k.stopIndex) {
					m = s * a.songWidth + m - k.playerGuide.width() / 2;
					if (s > w) m += a.activeSongWidth - a.songWidth;
					k.playerGuide.css("left", m);
					k.stopIndex = s
				}
				if (k.dropContainers) {
					w = o;
					for (var C in k.dropContainers) if (k.dropContainers.hasOwnProperty(C)) {
						o = k.dropContainers[C];
						if (o.within(h.clientX, h.clientY).length) {
							w = true;
							break
						}
					}
					w ? k.songProxy.addClass("valid").removeClass("invalid") : k.songProxy.addClass("invalid").removeClass("valid")
				}
			}).bind("dragend", function (h, k) {
				k.playerGuide.remove();
				k.songProxy.remove();
				clearInterval(k.autoScrollInterval);
				if (g.within(h.clientX, h.clientY).length > 0) if (!($(".queue-item", b).length < 2)) if (!(k.stopIndex < 0)) {
					queueSongID = k.song.find(".queueSong").attr("id");
					a.moveSongsTo([queueSongID], k.stopIndex);
					GS.sidebar && GS.sidebar.handleHover(h);
					GS.guts.gaTrackEvent("player", "dragSuccess")
				}
			});
			$("#footer").bind("dropinit", function (h, k) {
				var m = $(h.target).closest(".queue-item");
				try {
					delete k.dropContainers.player
				} catch (o) {}
				if (m.length > 0) return false;
				k.initTarget = h.target;
				k.song = $(".queue-item:first", this);
				console.log("queue.dropinit accept drop", h, k);
				if (k.dropContainers) k.dropContainers.player = $("#footer");
				else k.dropContainers = {
					player: $("#footer")
				}
			}).bind("dropend", function (h, k) {
				console.log("queue.dropend", h, k);
				$(this).offset();
				var m = $("#footer").within(h.clientX, h.clientY).length > 0,
					o = g.within(h.clientX, h.clientY).length > 0,
					r = $("#queue_list_window").scrollLeft(),
					s = [],
					u, w, C;
				if (m) if (!(!o && b.is(":visible"))) if (!(h.clientX === 0 && h.layerX === 0 && h.offsetX === 0 && h.screenX === 0)) {
					if (typeof k.draggedItems[0].SongID !== "undefined") {
						u = [];
						for (o = 0; o < k.draggedItems.length; o++) u.push(k.draggedItems[o].SongID);
						s.push({
							songIDs: u,
							context: k.draggedItemsContext
						});
						var v = [];
						$('#grid .slick-row.selected[id!="showQueue"]').each(function (H, K) {
							var A = parseInt($(K).attr("row"), 10) + 1;
							v.push(A)
						});
						v = v.sort(_.numSortA);
						GS.guts.logEvent("OLSongsDraggedToQueue", {
							songIDs: u,
							ranks: v
						})
					} else if (typeof k.draggedItems[0].AlbumID !== "undefined") for (o = 0; o < k.draggedItems.length; o++) {
						u = [];
						k.draggedItems[o].getSongs(function (H) {
							for (C = 0; C < H.length; C++) u.push(H[C].SongID)
						}, null, false, {
							async: false
						});
						s.push({
							songIDs: u,
							context: new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ALBUM, k.draggedItems[o])
						})
					} else if (typeof k.draggedItems[0].ArtistID !== "undefined") for (o = 0; o < k.draggedItems.length; o++) {
						u = [];
						k.draggedItems[o].getSongs(function (H) {
							for (C = 0; C < H.length; C++) u.push(H[C].SongID)
						}, null, false, {
							async: false
						});
						s.push({
							songIDs: u,
							context: new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ARTIST, k.draggedItems[o])
						})
					} else if (typeof k.draggedItems[0].PlaylistID !== "undefined") for (o = 0; o < k.draggedItems.length; o++) {
						u = [];
						k.draggedItems[o].getSongs(function (H) {
							for (C = 0; C < H.length; C++) u.push(H[C].SongID)
						}, null, false, {
							async: false
						});
						s.push({
							songIDs: u,
							context: new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, k.draggedItems[o])
						})
					} else if (typeof k.draggedItems[0].UserID !== "undefined") for (o = 0; o < k.draggedItems.length; o++) {
						u = [];
						k.draggedItems[o].getFavoritesByType("Song", function (H) {
							for (C = 0; C < H.length; C++) u.push(H[C].SongID)
						}, null, false, {
							async: false
						});
						s.push({
							songIDs: u,
							context: new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_USER, k.draggedItems[o])
						})
					}
					m = g.within(h.clientX, h.clientY).length > 0 || a.getCurrentQueue().songs.length > 0 ? false : true;
					w = Math.max(0, Math.min(Math.round((h.clientX + r) / a.songWidth), k.queueLength));
					for (o = 0; o < s.length; o++) {
						u = s[o].songIDs;
						r = _.orEqual(s[o].context, new GS.Models.PlayContext);
						a.addSongsToQueueAt(u, w, m, r);
						w += u.length;
						m = false
					}
					$(".queue-item:nth-child(" + w + ")", b);
					GS.guts.gaTrackEvent("player", "dropSuccess")
				}
			});
			$.drop({
				tolerance: function (h, k, m) {
					return this.contains(m, [h.clientX, h.clientY])
				}
			})
		},
		managePlayerGuide: function (b, c) {
			if ($("#queue").within(b.clientX, b.clientY).length > 0) {
				c.queueLength = _.orEqual(c.queueLength, a.getCurrentQueue().songs.length);
				var g = a.activeSongWidth - a.songWidth,
					h = $("#queue_list").offset().left;
				g = $("#queue_list_window").scrollLeft() - 10 - (b.clientX > parseInt($("#queue_list .queue-item-active").css("left"), 10) + a.activeSongWidth ? g : 0);
				$("#queue_list").children();
				var k = a.getCurrentQueue().activeSong ? _.orEqual(a.getCurrentQueue().activeSong.index, 0) : 0;
				stopIndex = Math.max(0, Math.min(c.queueLength, Math.round((b.clientX + g) / a.songWidth)));
				guideLeft = stopIndex * a.songWidth + h - c.playerGuide.width() / 2;
				if (stopIndex > k) guideLeft += a.activeSongWidth - a.songWidth;
				c.playerGuide.css("left", guideLeft);
				c.playerGuide.show()
			} else c.playerGuide.hide()
		},
		addQueueSeek: function () {
			this.seek = $("#seeking_wrapper");
			this.scrubber = $("#seeking_wrapper .scrubber").addClass("ui-slider-handle").supersleight();
			$(".bar.buffer .cap_right").supersleight();
			$(".bar.buffer .cap_right .cap_left").supersleight();
			$(".bar.buffer .cap_right .cap_left .inner").supersleight();
			$(".bar.buffer .cap_right").supersleight();
			$(".bar.buffer .cap_right .cap_left").supersleight();
			$(".bar.buffer .cap_right .cap_left .inner").supersleight();
			$(".bar.progress .cap_right").supersleight();
			$(".bar.progress .cap_right .cap_left").supersleight();
			$(".bar.progress .cap_right .cap_left .inner").supersleight();
			this.seek.slider({
				disabled: true,
				max: 1E3,
				start: function () {
					GS.player.SCRUB_LOCK = true
				},
				stop: function () {
					GS.player.SCRUB_LOCK = false
				},
				change: function (b, c) {
					var g = c.value / 1E3,
						h = a.player.getPlaybackStatus();
					a.seekTo(g * h.duration)
				}
			})
		},
		addQueueMousewheel: function () {
			$("#queue_list_window").mousewheel(function (b, c) {
				$(this).scrollLeft($(this).scrollLeft() - 82 * c)
			})
		},
		addShortcuts: function () {
			a.volumeSliderTimeout = null;
			a.volumeSliderDuration = 300;
			$(document).bind("keydown", "space", function (b) {
				if (!($(b.target).is("input,textarea,select") && $(b.target).val().length > 0)) {
					$("#player_play_pause").click();
					GS.guts.gaTrackEvent("player", "playPauseShortcut")
				}
			}).bind("keydown", "ctrl+right", function () {
				a.nextSong();
				GS.guts.gaTrackEvent("player", "nextShortcut");
				return false
			}).bind("keydown", "meta+right", function () {
				a.nextSong();
				GS.guts.gaTrackEvent("player", "nextShortcut");
				return false
			}).bind("keydown", "ctrl+left", function () {
				a.previousSong();
				GS.guts.gaTrackEvent("player", "prevShortcut");
				return false
			}).bind("keydown", "meta+left", function () {
				a.previousSong();
				GS.guts.gaTrackEvent("player", "prevShortcut");
				return false
			}).bind("keydown", "ctrl+up", function () {
				a.setVolume(Math.min(100, a.getVolume() + 5));
				$("#volumeSlider").slider("value", a.getVolume());
				$("#volumeControl").show();
				clearTimeout(a.volumeSliderTimeout);
				a.volumeSliderTimeout = setTimeout(function () {
					$("#volumeControl").hide()
				}, a.volumeSliderDuration);
				GS.guts.gaTrackEvent("player", "volumeUpShortcut", a.getVolume());
				return false
			}).bind("keydown", "meta+up", function () {
				a.setVolume(Math.min(100, a.getVolume() + 5));
				$("#volumeSlider").slider("value", a.getVolume());
				$("#volumeControl").show();
				clearTimeout(a.volumeSliderTimeout);
				a.volumeSliderTimeout = setTimeout(function () {
					$("#volumeControl").hide()
				}, a.volumeSliderDuration);
				GS.guts.gaTrackEvent("player", "volumeUpShortcut", a.getVolume());
				return false
			}).bind("keydown", "ctrl+down", function () {
				a.setVolume(Math.max(0, a.getVolume() - 5));
				$("#volumeSlider").slider("value", a.getVolume());
				$("#volumeControl").show();
				clearTimeout(a.volumeSliderTimeout);
				a.volumeSliderTimeout = setTimeout(function () {
					$("#volumeControl").hide()
				}, a.volumeSliderDuration);
				GS.guts.gaTrackEvent("player", "volumeDownShortcut", a.getVolume());
				return false
			}).bind("keydown", "meta+down", function () {
				a.setVolume(Math.max(0, a.getVolume() - 5));
				$("#volumeSlider").slider("value", a.getVolume());
				$("#volumeControl").show();
				clearTimeout(a.volumeSliderTimeout);
				a.volumeSliderTimeout = setTimeout(function () {
					$("#volumeControl").hide()
				}, a.volumeSliderDuration);
				GS.guts.gaTrackEvent("player", "volumeDownShortcut", a.getVolume());
				return false
			})
		},
		addVolumeSlider: function () {
			var b = function (c, g) {
				var h = "full";
				h = g.value > 75 ? "full" : g.value > 50 ? "threeQuarter" : g.value > 25 ? "half" : g.value > 0 ? "quarter" : "off";
				$("#player_volume").attr("class", "player_control").addClass(h);
				g.value == 0 && a.getIsMuted() ? $("#player_volume").addClass("muted") : a.setVolume(g.value)
			};
			$("#volumeSlider").slider({
				orientation: "vertical",
				range: "min",
				min: 0,
				max: 100,
				slide: b,
				change: b
			})
		},
		".queueSong a.play click": function (b, c) {
			c.stopImmediatePropagation();
			var g = a.getCurrentQueue();
			if (g.activeSong && b.attr("rel") == g.activeSong.queueSongID) if (a.isPlaying) a.pauseSong();
			else a.isPaused ? a.resumeSong() : a.playSong(g.activeSong.queueSongID);
			else a.playSong(b.attr("rel"));
			return false
		},
		".queueSong a.remove click": function (b, c) {
			c.stopImmediatePropagation();
			var g = a.getCurrentQueue().activeSong;
			a.removeSongs([b.parents(".queueSong").attr("id")]);
			a.queue = false;
			a.queue = a.getCurrentQueue();
			a.updateQueueWidth();
			a.gsQueue.setItems(a.queue.songs);
			if (a.queue.activeSong) a.gsQueue.setActive(a.queue.activeSong.index, false);
			else g && g.index && g.index > 0 && a.gsQueue.setActive(g.index - 1, false);
			GS.guts.gaTrackEvent("player", "removeSong", a.queue.activeSong.SongID);
			return false
		},
		".queueSong a.add click": function (b, c) {
			c.stopImmediatePropagation();
			var g = a.getCurrentQueue(),
				h = b.is(".inLibrary"),
				k = b.parents(".queueSong").attr("id");
			g = a.getSongDetails(g.queueID, [k])[0];
			if (a.currentSong && a.currentSong.queueSongID === g.queueSongID) g = a.currentSong;
			if (h) {
				b.removeClass("inLibrary").removeClass("isFavorite");
				GS.user.removeFromLibrary(g.SongID)
			} else {
				b.addClass("inLibrary");
				GS.user.addToLibrary(g.SongID)
			}
			return false
		},
		".queueSong a.favorite click": function (b, c) {
			c.stopImmediatePropagation();
			var g = a.getCurrentQueue(),
				h = b.is(".isFavorite"),
				k = b.parents(".queueSong").attr("id");
			g = a.getSongDetails(g.queueID, [k])[0];
			if (a.currentSong && a.currentSong.queueSongID === g.queueSongID) g = a.currentSong;
			if (h) {
				b.removeClass("isFavorite");
				GS.user.removeFromSongFavorites(g.SongID)
			} else {
				b.addClass("isFavorite");
				GS.user.addToSongFavorites(g.SongID)
			}
			return false
		},
		".queueSong a.options click": function (b, c) {
			c.stopImmediatePropagation();
			var g = this.getCurrentQueue(),
				h = b.parents(".queueSong").attr("id");
			g = this.getSongDetails(g.queueID, [h])[0];
			var k = {
				isQueue: true,
				flagSongCallback: function (m) {
					GS.player.flagSong(h, m)
				}
			};
			if ($("div.qsid" + h).is(":visible")) {
				$("div.qsid" + h).hide();
				b.removeClass("active-context")
			} else $(b).jjmenu(c, g.getOptionMenu(k), null, {
				xposition: "right",
				yposition: "right",
				show: "show",
				className: "queuemenu qsid" + h
			});
			return false
		},
		".queueSong .smile click": function (b, c) {
			c.stopImmediatePropagation();
			console.log("player.smile click", b, c);
			var g = b.parents(".queueSong").attr("id");
			if (b.is(".active")) {
				this.voteSong(g, 0);
				b.removeClass("active").parent().children().find(".frown").removeClass("active");
				GS.guts.gaTrackEvent("player", "unsmile", b.parents(".queueSong").attr("id"));
				this.trackAutoplayEvent("unsmile")
			} else {
				this.voteSong(g, 1);
				b.addClass("active").parent().children().find(".frown").removeClass("active");
				GS.guts.gaTrackEvent("player", "smile", b.parents(".queueSong").attr("id"));
				this.trackAutoplayEvent("smile")
			}
			return false
		},
		".queueSong .frown click": function (b, c) {
			c.stopImmediatePropagation();
			console.log("player.frown click", b.get(), c);
			var g = b.parents(".queueSong").attr("id");
			if (b.is(".active")) {
				this.voteSong(g, 0);
				b.removeClass("active").parent().children().find(".smile").removeClass("active");
				GS.guts.gaTrackEvent("player", "unfrown", b.parents(".queueSong").attr("id"));
				this.trackAutoplayEvent("unfrown")
			} else {
				this.voteSong(g, -1);
				b.addClass("active").parent().children().find(".smile").removeClass("active");
				GS.guts.gaTrackEvent("player", "frown", b.parents(".queueSong").attr("id"));
				this.trackAutoplayEvent("frown")
			}
			return false
		},
		".queueSong, .currentSongLink click": function (b, c) {
			c.stopImmediatePropagation();
			if (!$(c.target).is("a[href]")) {
				var g = b.attr("rel"),
					h = GS.Models.Song.getOneFromCache(g);
				if (h = h && $.isFunction(h.toUrl) ? h.toUrl() : false) {
					location.hash = h;
					GS.guts.gaTrackEvent("player", "songItemLink", g)
				}
				return false
			}
		},
		".queueSong mousedown": function (b, c) {
			c.stopImmediatePropagation();
			if (c.button === 2) {
				var g = GS.Models.Song.getOneFromCache(b.attr("rel")),
					h = b.attr("id");
				b.jjmenu(c, g.getOptionMenu({
					isQueue: true,
					flagSongCallback: function (k) {
						GS.player.flagSong(h, k)
					}
				}), null, {
					xposition: "mouse",
					yposition: "mouse",
					show: "show",
					className: "queuemenu"
				});
				GS.guts.gaTrackEvent("player", "songMenu", g.SongID)
			}
			return false
		},
		"#playerDetails_nowPlaying .add click": function (b, c) {
			var g = $("#playerDetails_nowPlaying").attr("rel"),
				h = b.is(".selected");
			console.log("nowplaying add click", b.get(), c, g, h);
			if (this.getCurrentSong()) h ? GS.user.removeFromLibrary(g) : GS.user.addToLibrary(g);
			return false
		},
		"#playerDetails_nowPlaying .favorite click": function (b) {
			var c = $("#playerDetails_nowPlaying").attr("rel");
			b = b.is(".selected");
			if (this.getCurrentSong()) b ? GS.user.removeFromSongFavorites(c) : GS.user.addToSongFavorites(c);
			return false
		},
		"#playerDetails_nowPlaying .share click": function (b, c) {
			console.log("nowplaying share click", b.get(), c);
			this.getCurrentSong() && GS.lightbox.open("share", {
				service: "email",
				type: "song",
				id: this.getCurrentSong().SongID
			});
			return false
		},
		"#playerDetails_nowPlaying .options click": function (b, c) {
			console.log("nowplaying options click", b.get(), c);
			var g = $("#playerDetails_nowPlaying").attr("rel"),
				h = this.getCurrentSong().queueSongID,
				k = GS.Models.Song.getOneFromCache(g),
				m = {
					isQueue: true,
					flagSongCallback: function (o) {
						GS.player.flagSong(h, o)
					}
				};
			if ($("div.jjplayerNowPlaying").is(":visible")) {
				$("div.jjplayerNowPlaying").hide();
				b.removeClass("active-context")
			} else {
				$(b).jjmenu(c, k.getOptionMenu(m), null, {
					xposition: "left",
					yposition: "top",
					orientation: "top",
					show: "show",
					className: "queuemenu jjplayerNowPlaying"
				});
				GS.guts.gaTrackEvent("player", "nowPlayingMenu", g)
			}
		},
		"#playerDetails_queue .toggleQueue click": function () {
			this.toggleQueue();
			this.userChangedQueueVisibility = true;
			return false
		},
		toggleQueue: function () {
			$("#queue").height();
			$("#footer").height();
			$("#queue").is(":visible");
			$("#queue").toggle();
			if (this.queueIsVisible = $("#queue").is(":visible")) $("#showQueue").addClass("selected");
			else {
				$("#showQueue").removeClass("selected");
				$("div.queuemenu,div.radiomenu").length && $("div.jjmenu").remove()
			}
			$(window).resize();
			GS.guts.gaTrackEvent("player", "toggleQueue", this.queueIsVisible ? "visible" : "hidden")
		},
		"#player_play_pause click": function (b) {
			var c = this.player.getPlaybackStatus();
			if (c) {
				if (c.status === 0) this.playSong(c.activeSong.queueSongID);
				else if (c.status === 7) {
					this.seekTo(0);
					this.playSong(c.activeSong.queueSongID)
				} else {
					if (this.isPlaying) {
						$(b).removeClass("pause").addClass("play");
						$("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
						this.pauseSong()
					} else {
						$(b).removeClass("play").addClass("pause");
						$("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
						this.resumeSong()
					}
					$.publish("gs.player.queue.change")
				}
				return false
			}
		},
		"#player_previous click": function () {
			this.previousSong();
			return false
		},
		"#player_next click": function () {
			this.nextSong();
			return false
		},
		"#player_shuffle click": function (b) {
			if (!a.queue.autoplayEnabled) {
				b.toggleClass("active");
				b = b.is(".active") ? true : false;
				a.setShuffle(b);
				return false
			}
		},
		"#player_loop click": function (b) {
			var c;
			if (b.is(".none")) {
				c = a.REPEAT_ALL;
				b.removeClass("none").addClass("all").addClass("active")
			} else if (b.is(".all")) {
				c = a.REPEAT_ONE;
				b.removeClass("all").addClass("one").addClass("active")
			} else {
				c = a.REPEAT_NONE;
				b.removeClass("one").addClass("none").removeClass("active")
			}
			a.setRepeat(c);
			return false
		},
		"#player_crossfade click": function (b) {
			if (GS.user.UserID > 0 && GS.user.IsPremium) {
				b.toggleClass("active");
				b = b.is(".active") ? true : false;
				a.setCrossfadeEnabled(b)
			} else GS.lightbox.open("vipOnlyFeature");
			return false
		},
		"#player_fullscreen click": function () {
			return false
		},
		"#player_volume click": function (b) {
			console.log("player_volume toggle", this.getIsMuted());
			if (this.getIsMuted()) {
				this.setIsMuted(false);
				$(b).removeClass("muted");
				$("#volumeSlider").slider("value", a.player.getVolume())
			} else {
				this.setIsMuted(true);
				$(b).addClass("muted");
				$("#volumeSlider").slider("value", 0)
			}
			return false
		},
		"#player_volume mouseenter": function () {
			clearTimeout(this.volumeSliderTimeout);
			$("#volumeControl").show();
			return false
		},
		"#player_volume mouseleave": function () {
			clearTimeout(this.volumeSliderTimeout);
			this.volumeSliderTimeout = setTimeout(this.callback(function () {
				$("#volumeControl").hide()
			}), this.volumeSliderDuration);
			return false
		},
		"#volumeControl mouseenter": function () {
			clearTimeout(this.volumeSliderTimeout);
			return false
		},
		"#volumeControl mouseleave": function () {
			clearTimeout(this.volumeSliderTimeout);
			if (this.isMouseDown) {
				var b = this,
					c = function () {
						$("body").unbind("mouseup", c);
						$("body").unbind("mouseleave", c);
						b.isMouseDown = 0;
						b.volumeSliderTimeout = setTimeout(b.callback(function () {
							$("#volumeControl").hide()
						}), b.volumeSliderDuration)
					};
				$("body").bind("mouseup", c);
				$("body").bind("mouseleave", c)
			} else this.volumeSliderTimeout = setTimeout(this.callback(function () {
				$("#volumeControl").hide()
			}), this.volumeSliderDuration);
			return false
		},
		isMouseDown: 0,
		mousedown: function () {
			this.isMouseDown = 1
		},
		mouseup: function () {
			this.isMouseDown = 0
		},
		"#queue_songs_button click": function (b, c) {
			c.stopPropagation();
			var g = this.getCurrentQueue(),
				h = this,
				k = [],
				m = [],
				o = GS.Models.Playlist.getPlaylistsMenu([], function (s) {
					var u = [],
						w = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, s);
					s.getSongs(function (C) {
						for (j = 0; j < C.length; j++) u.push(C[j].SongID);
						GS.player.addSongsToQueueAt(u, h.INDEX_REPLACE, true, w)
					}, null, false, {
						async: false
					})
				}, true, false);
			o.length > 0 && k.push({
				title: $.localize.getString("QUEUE_LOAD_PLAYLIST"),
				customClass: "playlist",
				type: "sub",
				src: o
			});
			if (g && g.songs && g.songs.length > 0) {
				_.forEach(g.songs, function (s) {
					m.push(s.SongID)
				});
				o = GS.Models.Playlist.getPlaylistsMenu(m, function (s) {
					GS.lightbox.open("confirm", {
						message: $.localize.getString("POPUP_ARE_YOU_SURE_OVERWRITE_PLAYLIST"),
						data: s,
						callback: function (u) {
							var w = 0,
								C = u.songs.length,
								v = [];
							for (w = 0; w < C; w++) v.push(w);
							u.removeSongs(v, false);
							u.addSongs(m, 0, true)
						}
					})
				}, false, true);
				var r = GS.Models.Playlist.getPlaylistsMenu(m, function (s) {
					s.addSongs(m, s.length, true)
				}, false, false);
				k.push({
					title: $.localize.getString("QUEUE_SAVE_PLAYLIST"),
					customClass: "saveQueue",
					type: "sub",
					src: o
				});
				k.push({
					title: $.localize.getString("QUEUE_ADD_TO_PLAYLIST"),
					customClass: "saveQueue",
					type: "sub",
					src: r
				});
				k.length && k.push({
					customClass: "separator"
				});
				k.push({
					title: $.localize.getString("QUEUE_EMBED_SONGS"),
					customClass: "shareSongs",
					action: {
						type: "fn",
						callback: function () {
							var s, u = [];
							for (s = 0; s < g.songs.length; s++) u.push(g.songs[s].SongID);
							GS.lightbox.open("share", {
								service: "widget",
								type: "manySongs",
								id: u
							})
						}
					}
				});
				k.push({
					title: $.localize.getString("CONTEXT_ADD_TO_LIBRARY"),
					customClass: "addLibrary",
					action: {
						type: "fn",
						callback: function () {
							var s, u = [];
							for (s = 0; s < g.songs.length; s++) u.push(g.songs[s].SongID);
							GS.user.addToLibrary(u)
						}
					}
				});
				k.push({
					title: $.localize.getString("QUEUE_VIEW_SONGS"),
					customClass: "viewSongs",
					action: {
						type: "fn",
						callback: function () {
							window.location.hash = "#/now_playing"
						}
					}
				})
			}
			o = [{
				title: $.localize.getString("QUEUE_NORMAL"),
				action: {
					type: "fn",
					callback: function () {
						h.queueIsVisible || h.toggleQueue();
						GS.player.setQueue("m")
					}
				}
			}, {
				title: $.localize.getString("QUEUE_SMALL"),
				action: {
					type: "fn",
					callback: function () {
						h.queueIsVisible || h.toggleQueue();
						GS.player.setQueue("s")
					}
				}
			}];
			o.push({
				customClass: "separator"
			});
			this.queueIsVisible ? o.push({
				title: $.localize.getString("QUEUE_HIDE"),
				action: {
					type: "fn",
					callback: function () {
						h.toggleQueue()
					}
				}
			}) : o.push({
				title: $.localize.getString("QUEUE_SHOW"),
				action: {
					type: "fn",
					callback: function () {
						h.toggleQueue()
					}
				}
			});
			k.length && k.push({
				customClass: "separator"
			});
			k.push({
				title: $.localize.getString("QUEUE_SIZES"),
				type: "sub",
				src: o
			});
			if (g && g.songs && g.songs.length && GS.user.IsPremium) {
				k.length && k.push({
					customClass: "separator"
				});
				h.powerModeEnabled ? k.push({
					title: $.localize.getString("PLAYER_DISABLE_POWER_MODE"),
					customClass: "disablePower",
					action: {
						type: "fn",
						callback: function () {
							GS.user.IsPremium ? h.disablePowerMode() : GS.lightbox.open("vipOnlyFeature")
						}
					}
				}) : k.push({
					title: $.localize.getString("PLAYER_ENABLE_POWER_MODE"),
					customClass: "enablePower",
					action: {
						type: "fn",
						callback: function () {
							h.enablePowerMode()
						}
					}
				})
			}
			if ($("div.jjQueueMenu").is(":visible")) {
				$("div.jjQueueMenu").hide();
				b.removeClass("active-context")
			} else {
				$(b).jjmenu(c, k, null, {
					xposition: "right",
					yposition: "top",
					orientation: "top",
					spill: "left",
					show: "show",
					className: "radiomenu jjQueueMenu"
				});
				GS.guts.gaTrackEvent("player", "queueSongMenu")
			}
			return false
		},
		"#queue_radio_button click": function (b, c) {
			var g = this.getCurrentQueue(),
				h = this,
				k = [];
			k.push({
				title: $.localize.getString("QUEUE_LOAD_STATION"),
				customClass: "stations",
				type: "sub",
				src: function () {
					var m = [],
						o = false;
					$.each(GS.Models.Station.TAG_STATIONS, function (r, s) {
						o = !o;
						m.push({
							title: $.localize.getString(s),
							customClass: "station " + (o ? "odd" : "even"),
							action: {
								type: "fn",
								callback: function () {
									h.setAutoplay(true, r)
								}
							}
						})
					});
					m.sort(function (r, s) {
						var u = r.title.toLowerCase(),
							w = s.title.toLowerCase();
						return u == w ? 0 : u > w ? 1 : -1
					});
					return m
				}()
			});
			if (g.autoplayEnabled) {
				k.push({
					customClass: "separator"
				});
				k.push({
					title: $.localize.getString("QUEUE_TURN_OFF_RADIO"),
					action: {
						type: "fn",
						callback: function () {
							h.player && h.player.getCurrentQueue().autoplayEnabled && h.player.setAutoplay(false)
						}
					}
				})
			} else if (g && g.songs && g.songs.length > 0) {
				k.push({
					customClass: "separator"
				});
				k.push({
					title: $.localize.getString("QUEUE_TURN_ON_RADIO"),
					action: {
						type: "fn",
						callback: function () {
							if (h.player) h.player.getCurrentQueue().autoplayEnabled || h.player.setAutoplay(true)
						}
					}
				})
			}
			if ($("div.jjRadioMenu").is(":visible")) {
				$("div.jjRadioMenu").hide();
				b.removeClass("active-context")
			} else {
				$(b).jjmenu(c, k, null, {
					xposition: "right",
					yposition: "top",
					orientation: "top",
					spill: "left",
					show: "show",
					className: "radiomenu jjRadioMenu"
				});
				GS.guts.gaTrackEvent("player", "radioMenu")
			}
			return false
		},
		videoIndex: 0,
		enableVideoMode: function () {
			this.videoModeEnabled = true;
			this.showVideoLightbox();
			if (this.powerModeEnabled) {
				clearInterval(this.powerModeInterval);
				this.powerModeInterval = setInterval(this.callback("youtubeCheckPowerMode"), 1E3)
			}
		},
		disableVideoMode: function () {
			this.videoModeEnabled = false;
			this.hideVideoLightbox();
			this.playSong();
			this.powerModeEnabled && clearInterval(this.powerModeInterval)
		},
		showVideoLightbox: function () {
			GS.lightbox.open("video", {
				isLoading: true,
				sidebarHeader: "POPUP_VIDEO_ALTERNATE"
			});
			var b = this.currentSong,
				c = [b.SongName || "", b.ArtistName || ""].join(" ");
			GS.youtube.search(c, this.callback(function (g) {
				g = g.results;
				var h, k, m = [];
				if (g && g[0] && g[0].VideoID) {
					for (var o = 0; o < g.length; o++) {
						k = GS.Models.Video.wrapYoutube(g[o]);
						h || (h = k);
						m.push(k)
					}
					m = m.splice(0, 4);
					GS.lightbox.close();
					a.videoModeEnabled = true;
					GS.lightbox.open("video", {
						video: h,
						videos: m,
						showVideoControls: true,
						isVideoMode: true,
						sidebarHeader: "POPUP_VIDEO_ALTERNATE"
					});
					GS.lightbox.positionLightbox()
				} else console.error("bad youtube search items", g, c)
			}))
		},
		hideVideoLightbox: function () {
			$("div.lbcontainer.gs_lightbox_video").is(":visible") && GS.lightbox.close()
		},
		youtubePrevSong: function () {
			var b = a.getCurrentQueue(),
				c = b.activeSong.index,
				g = b.songs[c - 1] || {},
				h = [g.SongName || "", g.ArtistName || ""].join(" ");
			if (b.songs[c - 1]) {
				a.setActiveSong(g.queueSongID);
				GS.youtube.search(h, a.callback(function (k) {
					var m = k.results,
						o, r;
					k = [];
					if (m && m[0] && m[0].VideoID) {
						for (var s = 0; s < m.length; s++) {
							r = GS.Models.Video.wrapYoutube(m[s]);
							o || (o = r);
							k.push(r)
						}
						k = k.splice(0, 4);
						this.youtubeRetries = 0;
						GS.youtube.loadVideoById(o.VideoID);
						$("#lightbox .gs_lightbox_video #lightbox_nav .videos").html(this.view("/shared/videos", {
							videos: k,
							startIndex: 0
						}));
						$("#lightbox .gs_lightbox_video #lightbox_header h3 .title").text(o.title);
						m = $("div.lbcontainer.gs_lightbox_video").controller();
						m.video = o;
						m.videos = k;
						m.startIndex = 0;
						GS.lightbox.positionLightbox()
					} else console.error("bad youtube search items", m, h)
				}))
			}
		},
		youtubeNextSong: function () {
			var b = a.getCurrentQueue();
			b = b.songs[b.activeSong.index + 1] || {};
			var c = [b.SongName || "", b.ArtistName || ""].join(" ");
			a.setActiveSong(b.queueSongID);
			GS.youtube.search(c, a.callback(function (g) {
				var h = g.results,
					k, m;
				g = [];
				if (h && h[0] && h[0].VideoID) {
					for (var o = 0; o < h.length; o++) {
						m = GS.Models.Video.wrapYoutube(h[o]);
						k || (k = m);
						g.push(m)
					}
					g = g.splice(0, 4);
					this.youtubeRetries = 0;
					GS.youtube.loadVideoById(k.VideoID);
					$("#lightbox .gs_lightbox_video #lightbox_nav .videos").html(this.view("/shared/videos", {
						videos: g,
						startIndex: 0
					}));
					$("#lightbox .gs_lightbox_video #lightbox_header h3 .title").text(k.title);
					h = $("div.lbcontainer.gs_lightbox_video").controller();
					h.video = k;
					h.videos = g;
					h.startIndex = 0;
					GS.lightbox.positionLightbox()
				} else console.error("bad youtube search items", h, c)
			}))
		},
		youtubeStateChange: function (b) {
			console.log("youtubeStateChange", b);
			switch (b) {
			case 0:
				a.youtubeNextSong();
				break;
			case 5:
				GS.youtube.playVideo();
				break;
			case 1:
				if (this.powerModeEnabled) {
					clearInterval(this.powerModeInterval);
					this.powerModeInterval = setInterval(this.callback("youtubeCheckPowerMode"), 1E3)
				}
				break
			}
		},
		youtubeError: function (b) {
			console.error("youtubeError", b);
			if (a.youtubeRetries >= 3) {
				a.youtubeNextSong();
				console.error("youtube error, try next video, but if maxRetries (3), go to next song")
			} else {
				b = $("#lightbox .gs_lightbox_video #lightbox_nav .videos a.video.active").parent();
				if (b.length && b.next().length) {
					GS.youtubeRetries++;
					b.next().children("a").click()
				} else a.youtubeNextSong()
			}
		},
		searchForVideosBySong: function (b, c, g) {
			b = _.orEqual(b, a.getCurrentQueue().activeSong);
			b = [b.SongName || "", b.ArtistName || "", b.AlbumName || ""].join(" ");
			GS.youtube.search(b, c, g)
		},
		enablePowerMode: function () {
			this.powerModeEnabled = true;
			if (this.videoModeEnabled) {
				clearInterval(this.powerModeInterval);
				this.powerModeInterval = setInterval(this.callback("youtubeCheckPowerMode"), 1E3)
			}
		},
		disablePowerMode: function () {
			this.powerModeEnabled = false;
			this.videoModeEnabled && clearInterval(this.powerModeInterval)
		},
		youtubeCheckPowerMode: function () {
			GS.youtube.getCurrentTime() > 60 && this.nextSong()
		},
		"#queue_clear_button click": function () {
			var b = this.getCurrentQueue();
			if (b.hasRestoreQueue) a.restoreQueue();
			else b && b.songs && b.songs.length > 0 && a.clearQueue();
			$(this).toggleClass("undo", !b.hasResoreQueue)
		},
		queueSongToHtml: function (b, c, g) {
			var h = "paused",
				k = [],
				m = a.getCurrentQueue(),
				o = "",
				r = b.fromLibrary ? "inLibrary" : "",
				s = b.isFavorite ? "isFavorite" : "",
				u = "",
				w = "";
			if (m.activeSong && b.queueSongID === m.activeSong.queueSongID) {
				o += " active";
				if (a.isPlaying) h = ""
			}
			if (m.autoplayEnabled) {
				if (b.autoplayVote === -1 || c === g - 1 && b.source !== "user") o += " greyOut";
				if (b.autoplayVote === 1 || b.autoplayVote === 0 && b.source === "user") {
					u = "active";
					w = ""
				} else if (b.autoplayVote === -1) {
					w = "active";
					u = ""
				}
			}
			k.push('<div id="', b.queueSongID, '" rel="', b.SongID, '" class="', o, ' queueSong">', '<a class="remove" title="', $.localize.getString("removeSong"), '"></a>', '<div class="albumart">', '<div class="radio_options ', m && m.autoplayEnabled ? "active" : "", '">', '<a class="smile ', u, '" title="', $.localize.getString("QUEUE_ITEM_SMILE"), '"></a>', '<a class="frown ', w, '" title="', $.localize.getString("QUEUE_ITEM_FROWN"), '"></a>', "</div>", '<div class="song_options ', r, " ", s, '">', '<a class="add ', r, ' textToggle" title="', $.localize.getString("QUEUE_ADD_SONG_LIBRARY_TITLE"), '"></a>', '<a class="favorite ', s, ' textToggle" title="', $.localize.getString("QUEUE_ADD_SONG_FAVORITE_TITLE"), '"></a>', '<a class="options selectbox" title="', $.localize.getString("QUEUE_ITEM_OPTIONS"), '"></a>', "</div>", '<a class="play ', h, '" rel="', b.queueSongID, '"></a>', '<img src="', b.getImageURL("s"), '" height="100%" width="100%" />', "</div>", '<a title="', _.cleanText(b.SongName), '" class="queueSong_name song ellipsis">', _.cleanText(b.SongName), "</a>", '<a href="', _.cleanUrl(b.ArtistName, b.ArtistID, "artist"), '" title="', _.cleanText(b.ArtistName), '" class="queueSong_artist artist ellipsis">', _.cleanText(b.ArtistName), "</a>", "</div>");
			return k.join("")
		},
		smallQueueSongToHtml: function (b, c, g) {
			var h = "paused",
				k = [],
				m = a.getCurrentQueue(),
				o = "",
				r = b.fromLibrary ? "inLibrary" : "",
				s = b.isFavorite ? "isFavorite" : "",
				u = "",
				w = "";
			if (m.activeSong && b.queueSongID === m.activeSong.queueSongID) {
				o += " active";
				if (a.isPlaying) h = ""
			}
			if (m.autoplayEnabled) {
				if (b.autoplayVote === -1 || c === g - 1 && b.source !== "user") o += " greyOut";
				if (b.autoplayVote === 1 || b.autoplayVote === 0 && b.source === "user") {
					u = "active";
					w = ""
				} else if (b.autoplayVote === -1) {
					w = "active";
					u = ""
				}
			}
			k.push('<div id="', b.queueSongID, '" rel="', b.SongID, '" class="', o, ' queueSong">', '<a class="remove" title="', $.localize.getString("removeSong"), '"></a>', '<div class="radio_options ', m && m.autoplayEnabled ? "active" : "", '">', '<a class="smile ', u, '" title="', $.localize.getString("QUEUE_ITEM_SMILE"), '"></a>', '<a class="frown ', w, '" title="', $.localize.getString("QUEUE_ITEM_FROWN"), '"></a>', "</div>", '<div class="song_options ', r, " ", s, '">', '<a class="play ', h, '" rel="', b.queueSongID, '"></a>', '<a class="add ', r, ' textToggle" title="', $.localize.getString("QUEUE_ADD_SONG_LIBRARY_TITLE"), '"></a>', '<a class="favorite ', s, ' textToggle" title="', $.localize.getString("QUEUE_ADD_SONG_FAVORITE_TITLE"), '"></a>', '<a class="options selectbox" title="', $.localize.getString("QUEUE_ITEM_OPTIONS"), '"></a>', "</div>", '<a title="', _.cleanText(b.SongName), '" class="queueSong_name song ellipsis">', _.cleanText(b.SongName), "</a>", '<a href="', _.cleanUrl(b.ArtistName, b.ArtistID, "artist"), '" title="', _.cleanText(b.ArtistName), '" class="queueSong_artist artist ellipsis">', _.cleanText(b.ArtistName), "</a>", "</div>");
			return k.join("")
		}
	})
})();
(function () {
	var a;
	GS.Controllers.BaseController.extend("GS.Controllers.YoutubeController", {
		onDocument: true
	}, {
		youtube: false,
		youtubeWrapper: false,
		init: function () {
			a = this;
			this._super()
		},
		userChange: function () {
			console.log("youtube.userChange")
		},
		attachPlayer: function (b, c, g) {
			var h = "http://www.youtube.com/v/" + b + "?version=3&enablejsapi=1&version=3&fs=1",
				k = {},
				m = {
					allowScriptAccess: "always",
					allowFullScreen: "true"
				},
				o = {
					id: "youtube_player",
					name: "youtube_player",
					allowFullScreen: "true"
				};
			if (!b || _.notDefined(b)) {
				console.error("youtube. invalid videoID", b);
				return false
			}
			c = c || 480;
			g = g || 385;
			window.onYouTubePlayerReady = function () {
				a.youtube = $("#youtube_player").get(0);
				a.youtubeWrapper = $("#youtube_player_wrapper");
				window.playerYoutubeStateChange = GS.player.youtubeStateChange;
				window.playerYoutubeError = GS.player.youtubeError;
				a.youtube.addEventListener("onStateChange", "playerYoutubeStateChange");
				a.youtube.addEventListener("onError", "playerYoutubeError");
				a.playVideo();
				GS.lightbox.positionLightbox();
				console.log("youtube player ready")
			};
			$("#videoPlayer").length ? swfobject.embedSWF(h, "videoPlayer", c, g, "8", null, k, m, o) : swfobject.embedSWF(h, "youtube_player", c, g, "8", null, k, m, o)
		},
		cueVideoById: function (b, c, g) {
			if (a.youtube) if (c && g) a.youtube.cueVideoById(b, c, g);
			else c ? a.youtube.cueVideoById(b, c) : a.youtube.cueVideoById(b)
		},
		loadVideoById: function (b, c, g) {
			if (a.youtube) if (c && g) a.youtube.loadVideoById(b, c, g);
			else c ? a.youtube.loadVideoById(b, c) : a.youtube.loadVideoById(b)
		},
		cueVideoByUrl: function (b, c) {
			a.youtube && a.youtube.cueVideoByUrl(b, c)
		},
		loadVideoByUrl: function (b, c) {
			a.youtube && a.youtube.loadVideoByUrl(b, c)
		},
		playVideo: function () {
			a.youtube && a.youtube.playVideo()
		},
		pauseVideo: function () {
			a.youtube && a.youtube.pauseVideo()
		},
		stopVideo: function () {
			a.youtube && a.youtube.stopVideo()
		},
		seekTo: function (b, c) {
			a.youtube && a.youtube.seekTo(b, c)
		},
		clearVideo: function () {
			a.youtube && a.youtube.clearVideo()
		},
		mute: function () {
			a.youtube && a.youtube.mute()
		},
		unMute: function () {
			a.youtube && a.youtube.unMute()
		},
		isMuted: function () {
			a.youtube && a.youtube.isMuted()
		},
		setVolume: function (b) {
			a.youtube && a.youtube.setVolume(b)
		},
		getVolume: function () {
			if (a.youtube) return a.youtube.getVolume()
		},
		setSize: function (b, c) {
			a.youtube && a.youtube.setSize(b, c)
		},
		getVideoBytesLoaded: function () {
			if (a.youtube) return a.youtube.getVideoBytesLoaded()
		},
		getVideoBytesTotal: function () {
			if (a.youtube) return a.youtube.getVideoBytesTotal()
		},
		getVideoStartBytes: function () {
			if (a.youtube) return a.youtube.getVideoStartBytes()
		},
		getPlayerState: function () {
			if (a.youtube) return a.youtube.getPlayerState()
		},
		getCurrentTime: function () {
			if (a.youtube) return a.youtube.getCurrentTime()
		},
		getPlaybackQuality: function () {
			if (a.youtube) return a.youtube.getPlaybackQuality()
		},
		setPlaybackQuality: function (b) {
			a.youtube && a.youtube.setPlaybackQuality(b)
		},
		getAvailableQualityLevels: function () {
			if (a.youtube) return a.youtube.getAvailableQualityLevels()
		},
		getDuration: function () {
			if (a.youtube) return a.youtube.getDuration()
		},
		getVideoUrl: function () {
			if (a.youtube) return a.youtube.getVideoUrl()
		},
		getVideoEmbedCode: function () {
			if (a.youtube) return a.youtube.getVideoEmbedCode()
		},
		addEventListener: function (b, c) {
			if (a.youtube) return a.youtube.addEventListener(b, c)
		},
		cache: {},
		search: function (b, c, g) {
			b = $.trim(_.orEqual(b, ""));
			console.error("youtube search: ", b);
			var h = arguments.length < 3 || arguments[arguments.length - 1] === g ? {} : arguments[arguments.length - 1];
			if (!b || b == "") {
				console.error("youtube search. invalid query", b);
				return false
			}
			if (this.cache[b] && $.isFunction(c)) {
				console.log("youtube search already cached:", b);
				c(this.cache[b])
			}
			a.request($.extend({}, h, {
				data: {
					method: "search",
					query: b
				},
				success: function (k) {
					a.cache[b] = k;
					$.isFunction(c) && c(k)
				},
				error: g
			}))
		},
		request: function (b, c) {
			c = _.orEqual(c, 0);
			console.log("youtube request", b, c);
			$.ajax($.extend({}, b, {
				contentType: "application/json",
				dataType: "json",
				async: true,
				url: "/watch.php",
				success: function (g, h) {
					console.log("youtube ajax success. status: " + h + ", request: ", g, b);
					if (g) if (g.error) $.isFunction(b.error) && b.error(g);
					else $.isFunction(b.success) && b.success(g);
					else {
						c++;
						console.error("youtube.service.success NO DATA.  retry request again", b)
					}
				},
				error: function (g, h, k) {
					console.error("youtube ajax error: status: " + h + ", error: " + k, g, b);
					$.isFunction(b.error) && b.error(h, k)
				}
			}))
		}
	})
})();
(function () {
	function a(k) {
		return "<span class='slick-column-name' data-translate-text='" + k.name + "'>" + $.localize.getString(k.name) + "</span>"
	}
	function b(k, m, o, r, s) {
		k = _.ucwords(r.name);
		m = $("#grid").controller();
		return s.isVerified == 0 ? r.name == "ARTIST" ? m.filter.hasOwnProperty("onlyVerified") && !m.filter.onlyVerified ? '<div class="showMore showingMore" data-translate-text="SEARCH_RESULTS_SHOW_LESS">' + $.localize.getString("SEARCH_RESULTS_SHOW_LESS") + "</div>" : '<div class="showMore" data-translate-text="SEARCH_RESULTS_SHOW_MORE">' + $.localize.getString("SEARCH_RESULTS_SHOW_MORE") + "</div>" : "" : ['<a class="field" href="', r.name == "SONG" ? "javascript:_.redirectSong(" + s.SongID + ", event)" : r.name == "USER" ? _.cleanUrl(s.Username, s.UserID, "user") : _.cleanUrl(s[k + "Name"], s[k + "ID"], r.name.toLowerCase()), '" class="ellipsis" title="', o, '">', o, "</a>"].join("")
	}
	function c(k, m, o) {
		return ['<span class="filter field ellipsis" title="', o, '">', o, "</span>"].join("")
	}
	function g(k, m, o, r, s) {
		if (s.isVerified == 0) return "";
		else {
			k = s.isFavorite ? " isFavorite" : "";
			m = s.fromLibrary ? " inLibrary" : "";
			r = s.isFavorite ? "SONG_ROW_REMOVE_SONG_FAVORITE_TITLE" : "SONG_ROW_ADD_SONG_FAVORITE_TITLE";
			var u = s.fromLibrary ? "SONG_ROW_REMOVE_SONG_LIBRARY_TITLE" : "SONG_ROW_ADD_SONG_LIBRARY_TITLE",
				w = GS.player.getCurrentQueue(),
				C = "SONG_ROW_ADD_SONG_PLAY_TITLE";
			if (w && w.songs && w.songs.length > 0) C = "SONG_ROW_ADD_SONG_ADD_TO_PLAYING_TITLE";
			return ['<a class="play" data-translate-title="', C, '" title="', $.localize.getString(C), '"></a><ul class="options ', m, k, '" rel="', s.SongID, '"><li class="favorite"  data-translate-title="', r, '" title="', $.localize.getString(r), '"><a></a></li><li class="library" data-translate-title="', u, '" title="', $.localize.getString(u), '"><a></a></li><li class="more" data-translate-title="SONG_ROW_OPTION_MORE" title="', $.localize.getString("SONG_ROW_OPTION_MORE"), '"><a><span>More...</span></a></li></ul><span class="songName"><a class="songLink ellipsis" title="', o, '" rel="', s.SongID, '">', o, "</a></span>"].join("")
		}
	}
	function h(k, m, o) {
		o = o == "0" ? "&nbsp;" : o;
		return ['<span class="track">', o, "</span>"].join("")
	}
	GS.Controllers.BaseController.extend("GS.Controllers.GridController", {
		columns: {
			song: [{
				id: "song",
				name: "SONG",
				field: "SongName",
				cssClass: "song",
				formatter: g,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "artist",
				name: "ARTIST",
				field: "ArtistName",
				cssClass: "artist",
				formatter: b,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "album",
				name: "ALBUM",
				field: "AlbumName",
				cssClass: "album",
				formatter: b,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "track",
				name: "TRACK_NUM",
				field: "TrackNum",
				cssClass: "track",
				maxWidth: 50,
				formatter: h,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}],
			albumSongs: [{
				id: "song",
				name: "SONG",
				field: "SongName",
				cssClass: "song",
				formatter: g,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "artist",
				name: "ARTIST",
				field: "ArtistName",
				cssClass: "artist",
				formatter: b,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "track",
				name: "TRACK_NUM",
				field: "TrackNum",
				cssClass: "track",
				maxWidth: 50,
				formatter: h,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}],
			queuesong: [{
				id: "song",
				name: "SONG",
				field: "SongName",
				cssClass: "song",
				formatter: function (k, m, o, r, s) {
					return ['<a class="play ', GS.player.isPlaying ? "" : "paused", '" rel="', s.queueSongID, '"><span>Play</span></a><ul class="options', s.fromLibrary ? " inLibrary" : "", s.isFavorite ? " isFavorite" : "", '" rel="', s.SongID, '"><li class="favorite"><a></a></li><li class="library"><a></a></li><li class="more"><a></a></li></ul><span class="songName"><a class="songLink ellipsis" title="', o, '" rel="', s.SongID, '">', o, "</a></span>"].join("")
				},
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "artist",
				name: "ARTIST",
				field: "ArtistName",
				cssClass: "artist",
				formatter: function (k, m, o, r, s) {
					k = s.autoplayVote == 1 || s.autoplayVote == 0 && s.source === "user" ? "selected" : "";
					m = s.autoplayVote == -1 ? "selected" : "";
					var u = _.ucwords(r.name);
					r = _.cleanUrl(s[u + "Name"], s[u + "ID"], r.name.toLowerCase());
					return ['<ul class="options"><li class="smile ', k, '"><a></a></li><li class="frown ', m, '"><a></a></li></ul><a class="field ellipsis" href="', r, '" title="', o, '">', o, "</a>"].join("")
				},
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "album",
				name: "ALBUM",
				field: "AlbumName",
				cssClass: "album",
				formatter: b,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}, {
				id: "track",
				name: "TRACK_NUM",
				field: "TrackNum",
				cssClass: "track",
				maxWidth: 50,
				formatter: h,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}],
			album: [{
				id: "album",
				name: "ALBUM",
				field: "AlbumName",
				cssClass: "albumDetail",
				formatter: function (k, m, o, r, s) {
					k = '<a href="' + s.toArtistUrl() + '">' + s.ArtistName + "</a>";
					k = $("<span></span>").localeDataString("BY_ARTIST", {
						artist: k
					});
					return ['<a href="', s.toUrl(), '" class="image"><img src="', s.getImageURL("m"), '" width="40" height="40" class="avatar" /></a><a href="', s.toUrl(), '" class="title ellipsis">', s.AlbumName, '</a><span class="byline">', k.render(), "</span>"].join("")
				},
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}],
			artist: [{
				id: "artist",
				name: "ARTIST",
				field: "ArtistName",
				cssClass: "artist-row",
				formatter: b,
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}],
			playlist: [{
				id: "playlist",
				name: "PLAYLIST",
				field: "PlaylistName",
				cssClass: "playlist",
				formatter: function (k, m, o, r, s) {
					k = s.isFavorite ? " subscribed" : "";
					m = s && s.NumSongs && s.Artists ? true : false;
					o = s.isFavorite ? "Unsubscribe" : "Subscribe";
					k = s.UserID === GS.user.UserID ? "" : ['<a class="subscribe ', k, '" rel="', s.PlaylistID, '"><span>', o, "</span></a>"].join("");
					if (m) {
						m = s.Artists.split(",");
						o = m.length;
						m.splice(3, m.length);
						o = o > m.length ? "..." : "";
						return ['<a href="', _.cleanUrl(s.PlaylistName, s.PlaylistID, "playlist"), '" class="image"><img src="', s.getImageURL(), '" width="40" height="40" class="albumart" /></a>', k, '<a href="', _.cleanUrl(s.PlaylistName, s.PlaylistID, "playlist"), '">', _.cleanText(s.PlaylistName), " (", s.NumSongs, ' Songs) </a><span class="author">by <a href="', _.cleanUrl(s.Username, s.UserID, "user"), '">', s.Username, '</a>,   <span class="artists"><span data-translate-text="includes">includes</span>: ', m.join(", "), o, "</span></span>"].join("")
					} else return ['<a href="', _.cleanUrl(s.PlaylistName, s.PlaylistID, "playlist"), '" class="image"><img src="', s.getImageURL(), '" width="40" height="40" class="albumart" /></a>', k, '<a href="', _.cleanUrl(s.PlaylistName, s.PlaylistID, "playlist"), '">', _.cleanText(s.PlaylistName), '</a><span class="author">by <a href="', _.cleanUrl(s.Username, s.UserID, "user"), '">', s.Username, "</a></span>"].join("")
				},
				behavior: "selectAndMove",
				sortable: true,
				columnFormatter: a
			}],
			user: [{
				id: "username",
				name: "USER",
				field: "Username",
				cssClass: "user",
				formatter: function (k, m, o, r, s) {
					k = s.isFavorite ? " following" : "";
					m = s.isFavorite ? "UNFOLLOW" : "FOLLOW";
					k = s.UserID === GS.user.UserID ? "" : ['<a class="follow ', k, '" rel="', s.UserID, '"><span data-translate-text="' + m + '">', $.localize.getString(m), "</span></a>"].join("");
					m = _.cleanUrl(s.Username, s.UserID, "user");
					o = '<div class="status ' + s.getUserPackage() + '"></div>';
					return ['<a href="', m, '" class="who image">', o, '<img src="', s.getImageURL(), '" width="40" height="40" class="avatar" /></a>', k, '<a href="', m, '">', s.Username, '</a><span class="location">', s.Country, "</span>"].join("")
				},
				behavior: "selectAndMove",
				sortable: true
			}],
			albumFilter: [{
				id: "album",
				name: "ALBUM",
				field: "AlbumName",
				cssClass: "cell-title",
				formatter: c,
				behavior: "selectAndMove",
				sortable: false,
				collapsable: true,
				columnFormatter: a
			}],
			artistFilter: [{
				id: "artist",
				name: "ARTIST",
				field: "ArtistName",
				cssClass: "cell-title",
				formatter: c,
				behavior: "selectAndMove",
				sortable: false,
				collapsable: true,
				columnFormatter: a
			}],
			event: [{
				id: "artist",
				name: "ARTIST",
				field: "ArtistName",
				cssClass: "cell-title",
				formatter: function (k, m, o) {
					k = (o || "").split(", ");
					m = "";
					o = [];
					for (var r = 0; r < k.length; r++) {
						m = r === k.length - 1 ? "" : ",&nbsp;";
						o.push(['<a href="#/search?q=', _.cleanText(k[r]), '" title="', _.cleanText(k[r]), '">', k[r], m, " </a>"].join(""))
					}
					return ['<div class="filter"><span class="field ellipsis artist">', o.join(""), "</span></div>"].join("")
				},
				behavior: "none",
				sortable: false,
				columnFormatter: a
			}, {
				id: "location",
				name: "LOCATION",
				field: "Location",
				cssClass: "cell-title",
				formatter: function (k, m, o, r, s) {
					return ['<div class="filter"><span class="field ellipsis venue" title="', s.VenueName, '">', s.VenueName, '</span><span class="field ellipsis city" title="', s.City, '">', s.City, "</span></div>"].join("")
				},
				behavior: "none",
				sortable: false,
				columnFormatter: a
			}, {
				id: "date",
				name: "DATE",
				field: "StartTime",
				cssClass: "cell-title",
				formatter: function (k, m, o, r, s) {
					k = s.StartTime.split(" ");
					m = k[1] ? k[1].split(":") : "00:00:00";
					k = k[0].split("-");
					newDate = (new Date(parseInt(k[0], 10), parseInt(k[1], 10) - 1, parseInt(k[2], 10), parseInt(m[0], 10), parseInt(m[1], 10), parseInt(m[2], 10))).format("D M j Y");
					return ['<div class="filter dateTicket"><span class="field ellipsis date" title="', newDate, '">', newDate, '</span><span class="icons ticket"><a class="field ellipsis url" title="', $.localize.getString("BUY_TICKETS"), '">', $.localize.getString("BUY_TICKETS"), "</a></div>"].join("")
				},
				behavior: "none",
				sortable: false,
				columnFormatter: a
			}]
		},
		options: {
			enableCellNavigation: true,
			enableCellRangeSelection: true,
			onCellRangeSelected: function () {
				console.log("cell range select", arguments)
			},
			onSelectedRowChanged: function () {
				console.log("selectd row change", arguments)
			},
			forceFitColumns: true,
			rowHeight: 25,
			editable: false,
			enableAddRow: false,
			rowCssClasses: function (k) {
				var m = "";
				if (k && k.isVerified == 1) m = "verified";
				else if (k && k.isVerified == 0) m = "verifiedDivider";
				return m
			},
			isSelectable: function (k) {
				return k.isVerified == 0 ? false : true
			},
			dragProxy: function (k) {
				var m = k;
				if (k.length > 1) if (k[0] instanceof GS.Models.Song) m = _.getString("SELECTION_SONGS_COUNT", {
					count: k.length
				});
				else if (k[0] instanceof GS.Models.Playlist) m = _.getString("SELECTION_PLAYLIST_COUNT", {
					count: k.length
				});
				else if (k[0] instanceof GS.Models.Artist) m = _.getString("SELECTION_ARTIST_COUNT", {
					count: k.length
				});
				return ['<div class="status"></div><span class="info">', m, "</span>"].join("")
			}
		},
		rowHeights: {
			song: 25,
			album: 50,
			artist: 35,
			playlist: 50,
			user: 50,
			event: 50
		},
		columnsByName: {
			song: "song",
			SongName: "song",
			album: "album",
			AlbumName: "album",
			artist: "artist",
			ArtistName: "artist",
			playlist: "playlist",
			PlaylistName: "playlist",
			user: "user",
			Username: "user",
			TrackNum: "track",
			tracknum: "track",
			track: "track",
			event: "user",
			Event: "user"
		},
		defaultSort: {
			song: "ArtistName",
			album: "TrackNum",
			artist: "Popularity",
			user: "Username",
			playlist: "PlaylistName"
		},
		defaultMultiSorts: {
			SongName: ["isVerified", "SongName", "SongID", "GridKey"],
			ArtistName: ["isVerified", "ArtistName", "AlbumName", "TrackNum", "SongName", "SongID", "GridKey"],
			AlbumName: ["isVerified", "AlbumName", "TrackNum", "SongName", "SongID", "GridKey"],
			TrackNum: ["isVerified", "TrackNum", "SongName", "SongID"],
			Popularity: ["isVerified", "Popularity", "Weight", "NumPlays", "ArtistName", "AlbumName", "TrackNum", "SongName", "SongID"]
		},
		numericColumns: {
			Rank: true,
			Sort: true,
			TrackNum: true,
			Popularity: true,
			Weight: true,
			NumPlays: true,
			Score: true,
			isVerified: true,
			GridKey: true,
			GeoDist: true
		},
		forcedSortDirections: {
			TSAdded: false,
			TSFavorited: false,
			Popularity: true,
			TrackNum: true
		}
	}, {
		dataView: null,
		grid: null,
		idProperty: null,
		selectedRowIDs: [],
		currentRow: 0,
		filter: {
			artistIDs: false,
			albumIDs: false,
			onlyVerified: false
		},
		sortCol: "",
		sortCols: [],
		sortDir: 1,
		origSortDir: 1,
		sortNumeric: false,
		pastSorts: {},
		searchString: "",
		data: null,
		columns: null,
		options: null,
		type: null,
		SMALL_GRID_WIDTH: 600,
		resize: function () {
			var k = 0,
				m = _.orEqual(this.element.attr("data-profile-view"), "0"),
				o = false;
			if (this.element) if (this.element.hasClass("songList")) this.element.css({
				height: Math.min(200, Math.max(25, (this.data || []).length * this.options.rowHeight)),
				width: this.element.parent().innerWidth()
			});
			else {
				var r = GS.Controllers.GridController.columns.song.concat();
				if ($("#search_side_pane").length) {
					k = $("#search_side_pane").width() + 38;
					if (o = $(this.element).width() < this.SMALL_GRID_WIDTH && r.length > 2) k += 4
				}
				m === "1" ? this.element.css({
					"overflow-y": "hidden",
					height: "auto",
					width: this.element.parent().width() - k
				}) : this.element.css({
					height: $("#page").height() - $("#page_header").height() - $("#theme_page_header:visible").height(),
					width: this.element.parent().width() - k
				});
				if (this.grid && this.grid.setColumns && $("#grid").is(".song.everything")) {
					k = [r[0], r[1], r[2]];
					this.element.toggleClass("noAlbums", o);
					if (o) k = [r[0], r[1]];
					if (this.lastColumnLength !== k.length) {
						this.grid.setColumns(k);
						this.lastColumnLength = k.length
					}
				}
			}
		},
		init: function (k, m, o, r, s, u) {
			function w(A, y) {
				var B, D, G, n, p = 1,
					q = false,
					t = false;
				if (v.options.isFilter) v.sortCols = ["isVerified", v.sortCol];
				for (G = 0; G < v.sortCols.length; G++) {
					n = v.sortCols[G];
					p = n === "isVerified" ? v.sortDir ? -1 : 1 : 1;
					try {
						if (v.Class.numericColumns[n]) {
							B = parseFloat(A[n], 10);
							D = parseFloat(y[n], 10);
							if (isNaN(B)) B = 0;
							if (isNaN(D)) D = 0;
							if (n === "TrackNum") {
								if (B !== 0 && D === 0) return v.sortDir ? -1 : 1;
								if (D !== 0 && B === 0) return v.sortDir ? 1 : -1
							}
						} else {
							B = A[n].toString().toLowerCase();
							D = y[n].toString().toLowerCase()
						}
						if (B !== D) return (B > D ? 1 : -1) * p
					} catch (x) {
						if (_.notDefined(A) || isNaN(A)) q = true;
						if (_.notDefined(y) || isNaN(y)) t = true;
						if (q && !t) return -1;
						if (!q && t) return 1;
						return 0
					}
				}
				return 0
			}
			s = _.orEqual(s, "song");
			r = _.orEqual(r, {});
			r.rowHeight = _.orEqual(r.rowHeight, GS.Controllers.GridController.rowHeights[s]);
			r.allowDragSort = _.orEqual(r.allowDragSort, false);
			r.allowDuplicates = _.orEqual(r.allowDuplicates, false);
			r = $.extend({}, GS.Controllers.GridController.options, r);
			if (r.allowDragSort) r.autoDragScroll = true;
			$(window).resize();
			this.subscribe("gs.auth." + s + ".update", this.callback(s + "Change"));
			this.subscribe("gs.auth.favorites." + s + "s.update", this.callback(s + "FavoritesChange"));
			this.subscribe("gs.player.queue.change", this.callback("queueChange"));
			var C = GS.player.getCurrentQueue();
			this.element.toggleClass("hasSongs", C && C.songs && C.songs.length > 0);
			this.data = m;
			this.columns = o;
			this.options = r;
			this.type = s;
			this.idProperty = this.grid = this.dataView = null;
			this.selectedRowIDs = [];
			this.currentRow = 0;
			this.filter = _.orEqual(r.filters, {
				artistIDs: false,
				albumIDs: false,
				onlyVerified: false
			});
			this.sortCol = _.orEqual(r.sortCol, GS.Controllers.GridController.defaultSort[s]);
			this.sortCols = _.orEqual(GS.Controllers.GridController.defaultMultiSorts[this.sortCol], $.makeArray(this.sortCol));
			this.origSortDir = this.sortDir = (this.sortDir = _.orEqual(r.sortDir, 1)) ? true : false;
			this.sortNumeric = GS.Controllers.GridController.numericColumns[this.sortCol] ? true : false;
			this.pastSorts = {};
			this.searchString = "";
			this.allowDragSort = _.orEqual(r.allowDragSort, false);
			var v = this;
			this.idProperty = _.orEqual(u, _.ucwords(s) + "ID");
			this.dataView = new Slick.Data.DataView;
			this.grid = new Slick.Grid($(k), this.dataView.rows, this.columns, this.options);
			this.dataView.setAllowDuplicates(this.options.allowDuplicates);
			this.grid.onContextMenu = function (A, y) {
				A.stopPropagation();
				var B = v.grid.getSelectedRows().sort(function (n, p) {
					return n - p
				}),
					D = [];
				if (!(B.length > 1)) {
					v.currentRow = y;
					v.grid.setSelectedRows([y]);
					v.grid.onSelectedRowsChanged()
				}
				switch (v.type) {
				case "artist":
					D = GS.Models.Artist.getOneFromCache(v.dataView.rows[y].ArtistID).getContextMenu();
					break;
				case "song":
					if (B.length > 1) {
						D = [];
						for (var G = 0; G < B.length; G++) D.push(v.dataView.rows[B[G]].SongID);
						D = v.getContextMenuMultiselectForSong(D)
					} else D = v.getContextMenuForSong(v.dataView.rows[y].SongID);
					break;
				case "playlist":
					D = GS.Models.Playlist.getOneFromCache(v.dataView.rows[y].PlaylistID).getContextMenu();
					break
				}
				$(A.target).jjmenu(A, D, null, {
					xposition: "mouse",
					yposition: "mouse",
					show: "show",
					className: "contextmenu"
				});
				return false
			};
			this.grid.onDblClick = function (A, y) {
				var B = v.dataView.rows[y];
				if (!($(A.target).parents(".options").length > 0)) if (!$(A.target).is("a.play")) if (v.options.isNowPlaying && B.queueSongID) GS.player.playSong(B.queueSongID);
				else if (B.SongID) {
					var D = GS.Controllers.PageController.getActiveController().getPlayContext();
					GS.player.addSongAndPlay(B.SongID, D);
					GS.guts.logEvent("doubleClickToPlay", {
						songID: B.SongID,
						rank: parseInt(y, 10) + 1
					})
				}
			};
			this.grid.onKeyDown = function (A) {
				if (A.which === 65 && (A.ctrlKey || A.metaKey)) {
					A = [];
					v.selectedRowIDs = [];
					for (var y = 0; y < v.dataView.rows.length; y++) {
						A.push(y);
						v.selectedRowIDs.push(v.dataView.rows[y].id)
					}
					v.currentRow = v.dataView.rows.length - 1;
					v.grid.setSelectedRows(_.arrUnique(A));
					v.grid.onSelectedRowsChanged();
					return true
				}
				if (v.handleKeyPress(A)) return true;
				return $(A.target).is("input,textarea,select") ? true : false
			};
			this.grid.onSelectedRowsChanged = function () {
				v.selectedRowIDs = [];
				var A, y, B = v.grid.getSelectedRows().sort(function (G, n) {
					return G - n
				}),
					D = {};
				if (v.options.isFilter) {
					if (B.length === 1 && B[0] === 0 && v.dataView.getItemByIdx(0)[v.idProperty] === -1) B = [];
					A = B.indexOf(0);
					if (A > -1) {
						B.splice(A, 1);
						v.grid.setSelectedRows(B);
						v.grid.onSelectedRowsChanged();
						return
					}
					B.length === 0 ? $(".slick-row[row=0]", v.element).addClass("selected") : $(".slick-row[row=0]", v.element).removeClass("selected")
				}
				A = 0;
				for (l = B.length; A < l; A++) if (y = v.dataView.rows[B[A]]) {
					v.selectedRowIDs.push(y[v.idProperty]);
					D[y[v.idProperty]] = true
				}
				v.selectedRowIDs = _.arrUnique(v.selectedRowIDs);
				if (v.options.isFilter) if (v.type === "album") {
					if (B.length === 0) $(".gs_grid.songs").controller().filter.albumIDs = false;
					else $(".gs_grid.songs").controller().filter.albumIDs = D;
					$(".gs_grid.songs").controller().dataView.refresh()
				} else if (v.type === "artist") {
					if (B.length === 0) {
						$(".gs_grid.songs").controller().filter.artistIDs = false;
						$(".gs_grid.albums").controller().filter.artistIDs = false
					} else {
						$(".gs_grid.songs").controller().filter.artistIDs = D;
						$(".gs_grid.albums").controller().filter.artistIDs = D
					}
					$(".gs_grid.songs").controller().dataView.refresh();
					$(".gs_grid.albums").controller().dataView.refresh();
					$(".gs_grid.albums").controller().grid.onSelectedRowsChanged()
				}
				v.currentRow = _.orEqual(v.grid.getSelectedRows()[B.length - 1], 0);
				$.publish("gs.grid.selectedRows", {
					len: v.selectedRowIDs.length,
					type: v.type
				})
			};
			$(".slick-header-column").click(function () {
				$(this).addClass("selected");
				$(this).siblings().removeClass("selected")
			});
			this.grid.onSort = function (A, y) {
				var B;
				v.sortCol = A.field ? A.field : A;
				if (_.notDefined(y)) y = _.defined(v.pastSorts[v.sortCol]) ? !v.pastSorts[v.sortCol] : true;
				v.sortCols = _.orEqual(GS.Controllers.GridController.defaultMultiSorts[v.sortCol], $.makeArray(v.sortCol));
				v.sortDir = y ? true : false;
				v.element.find(".slick-sort-indicator").removeClass("slick-sort-indicator-asc").removeClass("slick-sort-indicator-desc");
				B = GS.Controllers.GridController.columnsByName[v.sortCol];
				forcedDir = GS.Controllers.GridController.forcedSortDirections[v.sortCol];
				if (_.defined(B)) v.grid.setSortColumn(B, v.sortDir);
				else v.sortDir = _.defined(forcedDir) ? forcedDir : v.origSortDir;
				v.pastSorts[v.sortCol] = v.sortDir;
				v.sortNumeric = GS.Controllers.GridController.numericColumns[v.sortCol] ? true : false;
				v.dataView.sort(w, v.sortDir);
				if (!v.options.isFilter) {
					B = $("a[name=sort][rel=" + v.sortCol + "]");
					B.parent().parent().parent().siblings("button").find("span.label").html(B.find("span").text());
					v.options.sortStoreKey && $.publish("gs.grid.onsort", {
						sortCol: v.sortCol,
						sortDir: v.sortDir,
						sortStoreKey: v.options.sortStoreKey
					})
				}
			};
			v.dataView.onRowCountChanged.subscribe(function () {
				v.grid.updateRowCount();
				v.grid.render();
				v.grid.autosizeColumns()
			});
			v.dataView.onRowsChanged.subscribe(function (A) {
				v.grid.removeRows(A);
				v.grid.render();
				if (v.selectedRowIDs.length > 0) {
					A = [];
					for (var y, B = 0, D = v.selectedRowIDs.length; B < D; B++) {
						y = v.dataView.getRowById(v.selectedRowIDs[B]);
						y !== undefined && A.push(y)
					}
					v.currentRow = _.orEqual(y, 0);
					v.grid.setSelectedRows(_.arrUnique(A));
					v.grid.onSelectedRowsChanged()
				}
			});
			v.grid.onBeforeMoveRows = function () {
				if (v.allowDragSort) return true;
				return false
			};
			v.grid.onMoveRows = function (A, y) {
				console.log("self.grid.onMoveRows", A, y);
				var B = [],
					D = [],
					G = [],
					n = v.dataView.getItems(),
					p, q, t;
				if (!(!v.allowDragSort || v.sortCol !== "Sort")) if (v.options.playlistID) {
					console.log("DRAG REARRANGE PLAYLSIT", A, y);
					(B = GS.Models.Playlist.getOneFromCache(v.options.playlistID)) && B.moveSongsTo(A, y)
				} else {
					p = n.slice(0, y);
					q = n.slice(y, n.length);
					for (t = 0; t < A.length; t++) {
						n[A[t]].Sort = t;
						B.push(n[A[t]])
					}
					A.sort().reverse();
					for (t = 0; t < A.length; t++) {
						n = A[t];
						n < y ? p.splice(n, 1) : q.splice(n - y, 1)
					}
					n = p.concat(B.concat(q));
					for (t = 0; t < n.length; t++) n[t].Sort = t + 1;
					v.data = n;
					for (t = 0; t < A.length; t++) D.push(p.length + t);
					D = _.arrUnique(D);
					v.currentRow = D[D.length - 1];
					v.dataView.beginUpdate();
					v.grid.setSelectedRows(D);
					v.grid.onSelectedRowsChanged();
					v.dataView.setItems(v.data, v.idProperty);
					v.dataView.endUpdate();
					v.dataView.refresh();
					if (v.options.isNowPlaying) {
						p = y;
						for (t = 0; t < B.length; t++) {
							G.push(B[t].queueSongID);
							D = $("#queue .queueSong:nth-child(" + y + ")");
							D.after($("#" + B[t].queueSongID).remove());
							y += 1
						}
						GS.player.moveSongsTo(G, p)
					}
				}
			};
			if (v.allowDragSort) {
				var H = $("#grid"),
					K = $("#grid .slick-viewport");
				H.bind("dropinit", function (A, y) {
					var B = $(A.target).closest(".slick-row");
					try {
						delete y.dropContainers.grid
					} catch (D) {}
					if (B.length > 0) return false;
					y.initTarget = A.target;
					console.log("grid.dropinit accept drop");
					if (y.dropContainers) y.dropContainers.grid = H;
					else y.dropContainers = {
						grid: H
					}
				}).bind("dropend", function (A, y) {
					function B(G, n) {
						n = _.orEqual(n, new GS.Models.PlayContext);
						var p = GS.Models.Playlist.getOneFromCache(v.options.playlistID),
							q = [],
							t;
						for (t = 0; t < G.length; t++) q.push(G[t].SongID);
						v.options.playlistID ? p.addSongs(q) : GS.player.addSongsToQueueAt(q, GS.player.INDEX_DEFAULT, false, n)
					}
					var D;
					if (K.within(A.clientX, A.clientY).length > 0) if (typeof y.draggedItems[0].SongID !== "undefined") B(y.draggedItems, y.draggedItemsContext);
					else if (typeof y.draggedItems[0].AlbumID !== "undefined") for (D = 0; D < y.draggedItems.length; D++) y.draggedItems[D].getSongs(function (G) {
						B(G, new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ALBUM, y.draggedItems[D]))
					}, null, false, {
						async: false
					});
					else if (typeof y.draggedItems[0].ArtistID !== "undefined") for (D = 0; D < y.draggedItems.length; D++) y.draggedItems[D].getSongs(function (G) {
						B(G, new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ARTIST, y.draggedItems[D]))
					}, null, false, {
						async: false
					});
					else if (typeof y.draggedItems[0].PlaylistID !== "undefined") for (D = 0; D < y.draggedItems.length; D++) y.draggedItems[D].getSongs(function (G) {
						B(G, new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, y.draggedItems[D]))
					}, null, false, {
						async: false
					});
					else if (typeof y.draggedItems[0].UserID !== "undefined") for (D = 0; D < y.draggedItems.length; D++) y.draggedItems[D].getFavoritesByType("Song", function (G) {
						B(G, new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_USER, y.draggedItems[D]))
					}, null, false, {
						async: false
					})
				})
			}
			v.dataView.beginUpdate();
			v.dataView.setItems(v.data, v.idProperty);
			v.dataView.setFilter(function (A) {
				if (v.options.isFilter && A.isFilterAll) return true;
				if (v.searchString != "" && A.searchText.indexOf(v.searchString) == -1) return false;
				if (v.filter.hasOwnProperty("onlyVerified") && v.filter.onlyVerified && A.isVerified === -1) return false;
				if (v.filter.artistIDs && !v.filter.artistIDs[A.ArtistID]) return false;
				if (v.filter.albumIDs && !v.filter.albumIDs[A.AlbumID]) return false;
				return true
			});
			v.dataView.endUpdate();
			v.sortCol !== "" && v.grid.onSort(v.sortCol, v.sortDir);
			if (v.options.isFilter) {
				v.grid.setSelectedRows([0]);
				v.grid.onSelectedRowsChanged()
			}
			setTimeout(function () {
				$(window).resize()
			}, 500)
		},
		update: function () {},
		songChange: function (k) {
			var m = $("#page").is(".gs_page_playlist") ? $("#page").controllers(GS.Controllers.Page.PlaylistController)[0] : false;
			m = m ? m.playlist.songIDLookup[k.SongID] : this.dataView.getItemById(k[this.idProperty]);
			if (!m) return false;
			var o = ["isVerified", "TSAdded", "TSFavorited", "Sort"];
			for (var r in k) if (k.hasOwnProperty(r) && o.indexOf(r) == -1) m[r] = k[r];
			this.dataView.updateItem(m[this.idProperty], m)
		},
		albumChange: function (k) {
			var m = this.dataView.getItemById(k[this.idProperty]);
			if (!m) {
				console.error("grid.albumChange. bad album", m);
				return false
			}
			for (var o in k) if (k.hasOwnProperty(o)) m[o] = k[o];
			this.dataView.updateItem(m.AlbumID, m)
		},
		artistChange: function (k) {
			var m = this.dataView.getItemById(k[this.idProperty]);
			if (!m) {
				console.error("grid.artistChange. bad artist", m);
				return false
			}
			for (var o in k) if (k.hasOwnProperty(o)) m[o] = k[o];
			this.dataView.updateItem(m.ArtistID, m)
		},
		playlistChange: function (k) {
			var m = this.dataView.getItemById(k[this.idProperty]);
			if (m) {
				for (var o in k) if (k.hasOwnProperty(o)) m[o] = k[o];
				this.dataView.updateItem(m.PlaylistID, m)
			} else console.error("grid.playlistChange. bad playlist", m)
		},
		userChange: function (k) {
			var m = this.dataView.getItemById(k[this.idProperty]);
			if (!m) {
				console.error("grid.userChange. bad user", m);
				return false
			}
			for (var o in k) if (k.hasOwnProperty(o)) m[o] = k[o];
			this.dataView.updateItem(m.UserID, m)
		},
		songFavoritesChange: function () {
			this.data = this.dataView.getItems();
			for (var k = 0; k < this.data.length; k++) if (GS.user.favorites.songs[this.data[k].SongID]) {
				this.data[k].isFavorite = 1;
				this.data[k].fromLibrary = 1;
				this.dataView.updateItem(this.data[k].SongID, this.data[k])
			}
			this.dataView.beginUpdate();
			this.dataView.setItems(this.data, "SongID");
			this.dataView.endUpdate()
		},
		albumFavoritesChange: function () {
			this.data = this.dataView.getItems();
			for (var k = 0; k < this.data.length; k++) if (GS.user.favorites.albums[this.data[k].AlbumID]) {
				this.data[k].isFavorite = 1;
				this.dataView.updateItem(this.data[k].SongID, this.data[k])
			}
			this.dataView.beginUpdate();
			this.dataView.setItems(this.data, "AlbumID");
			this.dataView.endUpdate()
		},
		artistFavoritesChange: function () {
			this.data = this.dataView.getItems();
			for (var k = 0; k < this.data.length; k++) if (GS.user.favorites.artists[this.data[k].ArtistID]) this.data[k].isFavorite = 1;
			this.dataView.beginUpdate();
			this.dataView.setItems(this.data, "ArtistID");
			this.dataView.endUpdate()
		},
		playlistFavoritesChange: function () {
			this.data = this.dataView.getItems();
			for (var k = 0; k < this.data.length; k++) if (GS.user.favorites.playlists[this.data[k].PlaylistID]) this.data[k].isFavorite = 1;
			this.dataView.beginUpdate();
			this.dataView.setItems(this.data, "PlaylistID");
			this.dataView.endUpdate()
		},
		userFavoritesChange: function () {
			this.data = this.dataView.getItems();
			for (var k = 0; k < this.data.length; k++) if (GS.user.favorites.users[this.data[k].UserID]) this.data[k].isFavorite = 1
		},
		queueChange: function (k) {
			k || (k = GS.player.getCurrentQueue());
			if (this.element) {
				this.element.toggleClass("hasSongs", k && k.songs && k.songs.length > 0);
				k && k.songs && k.songs.length > 0 ? $(".grid-canvas a.play").attr("data-translate-title", "SONG_ROW_ADD_SONG_ADD_TO_PLAYING_TITLE").attr("title", $.localize.getString("SONG_ROW_ADD_SONG_ADD_TO_PLAYING_TITLE")) : $(".grid-canvas a.play").attr("data-translate-title", "SONG_ROW_ADD_SONG_PLAY_TITLE").attr("title", $.localize.getString("SONG_ROW_ADD_SONG_PLAY_TITLE"))
			}
		},
		getContextMenuForSong: function (k) {
			var m = parseInt(this.grid.getSelectedRows()) + 1,
				o = GS.Controllers.PageController.getActiveController().getPlayContext();
			GS.guts.logEvent("rightClickSongItem", {
				songID: k,
				rank: m
			});
			m = [{
				title: $.localize.getString("CONTEXT_PLAY_SONG_NOW"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongAndPlay(k, o)
					}
				},
				customClass: "first"
			}, {
				title: $.localize.getString("CONTEXT_PLAY_SONG_NEXT"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongsToQueueAt([k], GS.player.INDEX_NEXT, false, o)
					}
				}
			}, {
				title: $.localize.getString("CONTEXT_PLAY_SONG_LAST"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongsToQueueAt([k], GS.player.INDEX_LAST, false, o)
					}
				}
			}, {
				customClass: "separator"
			}, {
				title: $.localize.getString("CONTEXT_ADD_TO"),
				type: "sub",
				src: [{
					title: $.localize.getString("CONTEXT_ADD_TO_PLAYLIST_MORE"),
					type: "sub",
					src: GS.Models.Playlist.getPlaylistsMenu(k, function (u) {
						u.addSongs([k], null, true)
					}),
					customClass: "first"
				}, {
					title: $.localize.getString("MY_MUSIC"),
					action: {
						type: "fn",
						callback: function () {
							GS.user.addToLibrary(k)
						}
					}
				}, {
					title: $.localize.getString("FAVORITES"),
					action: {
						type: "fn",
						callback: function () {
							GS.user.addToSongFavorites(k)
						}
					},
					customClass: "last"
				}]
			}, {
				title: $.localize.getString("CONTEXT_SHARE_SONG"),
				type: "sub",
				src: [{
					title: $.localize.getString("SHARE_EMAIL"),
					action: {
						type: "fn",
						callback: function () {
							GS.lightbox.open("share", {
								service: "email",
								type: "song",
								id: k
							})
						}
					},
					customClass: "first"
				}, {
					title: $.localize.getString("SHARE_FACEBOOK"),
					action: {
						type: "fn",
						callback: function () {
							GS.lightbox.open("share", {
								service: "facebook",
								type: "song",
								id: k
							})
						}
					}
				}, {
					title: $.localize.getString("SHARE_TWITTER"),
					action: {
						type: "fn",
						callback: function () {
							GS.lightbox.open("share", {
								service: "twitter",
								type: "song",
								id: k
							})
						}
					}
				}, {
					title: $.localize.getString("SHARE_STUMBLE"),
					action: {
						type: "fn",
						callback: function () {
							GS.Models.Song.getSong(k, function (u) {
								u && window.open(_.makeUrlForShare("stumbleupon", "song", u), "_blank")
							})
						}
					}
				}, {
					title: $.localize.getString("SHARE_REDDIT"),
					action: {
						type: "fn",
						callback: function () {
							GS.Models.Song.getSong(k, function (u) {
								u && window.open(_.makeUrlForShare("reddit", "song", u), "_blank")
							})
						}
					}
				}, {
					title: $.localize.getString("SHARE_WIDGET"),
					action: {
						type: "fn",
						callback: function () {
							GS.lightbox.open("share", {
								service: "widget",
								type: "song",
								id: k
							})
						}
					},
					customClass: "last"
				}, {
					title: $.localize.getString("COPY_URL"),
					type: "sub",
					action: {
						type: "fn",
						callback: this.callback(function () {
							ZeroClipboard && GS.Models.Song.getSong(k, function (u) {
								if (u) {
									var w = ["http://listen.grooveshark.com/" + u.toUrl().replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(u.AlbumName, u.AlbumID, "album").replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(u.ArtistName, u.ArtistID, "artist").replace("#/", "")];
									u = $("div[id^=jjmenu_main_sub]");
									if (window.contextMenuClipboards) {
										window.contextMenuClipboards[0].reposition($("div.songUrl", u)[0]);
										window.contextMenuClipboards[1].reposition($("div.albumUrl", u)[0]);
										window.contextMenuClipboards[2].reposition($("div.artistUrl", u)[0])
									} else window.contextMenuClipboards = [new ZeroClipboard.Client($("div.songUrl", u)[0]), new ZeroClipboard.Client($("div.albumUrl", u)[0]), new ZeroClipboard.Client($("div.artistUrl", u)[0])];
									$.each(window.contextMenuClipboards, function (C, v) {
										v.setText(w[C]);
										if (!v.hasCompleteEvent) {
											v.addEventListener("complete", function (H, K) {
												$("div[id^=jjmenu]").remove();
												console.log("Copied: ", K)
											});
											v.hasCompleteEvent = true
										}
									});
									$("div.songUrl", u).bind("remove", function () {
										try {
											$.each(window.contextMenuClipboards, function (v, H) {
												H.hide()
											})
										} catch (C) {}
									});
									$("div[name$=Url]", u).show()
								}
							})
						})
					},
					customClass: "last copyUrl",
					src: [{
						title: $.localize.getString("SONG_URL"),
						customClass: "songUrl"
					}, {
						title: $.localize.getString("ALBUM_URL"),
						customClass: "albumUrl"
					}, {
						title: $.localize.getString("ARTIST_URL"),
						customClass: " artistUrl"
					}]
				}]
			}, {
				title: $.localize.getString("CONTEXT_BUY_SONG"),
				action: {
					type: "fn",
					callback: this.callback(function () {
						GS.lightbox.open("buySong", k)
					})
				},
				customClass: "last"
			}];
			var r = 0;
			if (!GS.user.isLoggedIn) for (var s = 0; s < m.length; s++) if (m[s].title == $.localize.getString("CONTEXT_SHARE_SONG") && m[s].src) {
				for (; m[s].src[r];) if (!GS.user.isLoggedIn && m[s].src[r].title == $.localize.getString("SHARE_EMAIL")) {
					m[s].src.splice(r, 1);
					r = Math.min(m[s].src.length, Math.max(0, r--))
				} else r++;
				r = 0
			}
			return m
		},
		getContextMenuMultiselectForSong: function (k) {
			var m = this,
				o = GS.Controllers.PageController.getActiveController().getPlayContext(),
				r = this.grid.getSelectedRows();
			_.forEach(r, function (s, u) {
				r[u] += 1
			});
			r = r.sort(_.numSortA);
			GS.guts.logEvent("rightClickSongItems", {
				songIDs: k,
				ranks: r
			});
			return [{
				title: $.localize.getString("CONTEXT_PLAY_SONGS_NOW"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongsToQueueAt(k, GS.player.INDEX_DEFAULT, true, o)
					}
				},
				customClass: "first"
			}, {
				title: $.localize.getString("CONTEXT_PLAY_SONGS_NEXT"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongsToQueueAt(k, GS.player.INDEX_NEXT, false, o)
					}
				}
			}, {
				title: $.localize.getString("CONTEXT_PLAY_SONGS_LAST"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongsToQueueAt(k, GS.player.INDEX_LAST, false, o)
					}
				}
			}, {
				customClass: "separator"
			}, {
				title: $.localize.getString("CONTEXT_ADD_TO"),
				type: "sub",
				src: [{
					title: $.localize.getString("CONTEXT_ADD_TO_PLAYLIST_MORE"),
					type: "sub",
					src: GS.Models.Playlist.getPlaylistsMenu(k, function (s) {
						s.addSongs(k, null, true)
					}),
					customClass: "first"
				}, {
					title: $.localize.getString("MY_MUSIC"),
					action: {
						type: "fn",
						callback: function () {
							GS.user.addToLibrary(m.selectedRowIDs)
						}
					}
				}, {
					title: $.localize.getString("FAVORITES"),
					action: {
						type: "fn",
						callback: function () {
							for (var s = 0; s < m.selectedRowIDs.length; s++) GS.user.addToSongFavorites(m.selectedRowIDs[s])
						}
					},
					customClass: "last"
				}]
			}, {
				customClass: "separator"
			}, {
				title: $.localize.getString("CONTEXT_REPLACE_ALL_SONGS"),
				action: {
					type: "fn",
					callback: function () {
						GS.player.addSongsToQueueAt(k, GS.player.INDEX_REPLACE, GS.player.isPlaying, o)
					}
				},
				customClass: "last"
			}]
		},
		"input.search keyup": function (k) {
			Slick.GlobalEditorLock.cancelCurrentEdit();
			if (e.which == 27) k.value = "";
			this.searchString = k.value.toLowerCase();
			this.dataView.refresh()
		},
		".grid-canvas click": function (k, m) {
			if ($(m.target).parents(".slick-row").length === 0) {
				self.currentRow = 0;
				this.grid.setSelectedRows([]);
				this.grid.onSelectedRowsChanged()
			}
		},
		"* keydown": function (k, m) {
			this.handleKeyPress(m)
		},
		".slick-collapse-indicator click": function (k, m) {
			m.preventDefault();
			$(k).parents("div.page_column").toggleClass("collapsed");
			$(k).parents("div.page_column").addClass("suppressAutoCollapse");
			if ($(k).parents("div.page_column").hasClass("collapsed")) {
				$(k).parents("div.page_column").addClass("manualCollapse").removeClass("manualOpen");
				$(".page_column_fixed.collapsed").width(this.grid.getScrollWidth())
			} else {
				$(k).parents("div.page_column").addClass("manualOpen").removeClass("manualCollapse");
				$(".page_column_fixed").width(175)
			}
			$(window).resize();
			$(".gs_grid:visible").resize()
		},
		handleKeyPress: function (k) {
			if ((k.which === 38 || k.which === 40) && k.shiftKey) {
				var m = this.grid.getSelectedRows().sort(function (s, u) {
					return s - u
				});
				_.orEqual(m[m.length - 1], 1);
				var o, r;
				o = this.currentRow + (k.which === 38 ? -1 : 1);
				o = Math.max(0, Math.min(this.dataView.rows.length - 1, o));
				if ($.inArray(o, m) === -1) {
					m.push(o);
					this.selectedRowIDs.push(this.dataView.getItemByIdx(o).SongID);
					this.currentRow = o;
					this.grid.setSelectedRows(_.arrUnique(m));
					this.grid.onSelectedRowsChanged()
				} else if (k.which === 38) {
					if (o < this.currentRow) {
						r = $.inArray(this.currentRow, m);
						_.arrRemove(m, r, r);
						this.currentRow = o;
						r = $.inArray(this.currentRow, m);
						_.arrRemove(m, r, r);
						m.push(this.currentRow);
						this.grid.setSelectedRows(_.arrUnique(m));
						this.grid.onSelectedRowsChanged()
					}
				} else if (o > this.currentRow) {
					r = $.inArray(this.currentRow, m);
					_.arrRemove(m, r, r);
					this.currentRow = o;
					r = $.inArray(this.currentRow, m);
					_.arrRemove(m, r, r);
					m.push(this.currentRow);
					this.grid.setSelectedRows(_.arrUnique(m));
					this.grid.onSelectedRowsChanged()
				}
				k.preventDefault();
				return true
			}
			return false
		},
		"a.field click": function (k) {
			k = $(k).attr("href");
			var m = parseInt(this.grid.getSelectedRows()[0]) + 1,
				o = $("#grid .slick-row.selected ul.options").attr("rel");
			GS.guts.handleFieldClick(k, m, o)
		},
		"a.songLink click": function (k, m) {
			var o = parseInt($(k).attr("rel"), 10);
			if (o && _.defined(m.which)) {
				var r = $(k).data("clickCount");
				r || (r = 0);
				r++;
				r == 1 && setTimeout(function () {
					$(k).data("clickCount") == 1 && GS.Models.Song.getSong(o, function (s) {
						if (s) location.hash = s.toUrl()
					});
					$(k).data("clickCount", 0)
				}, 300);
				$(k).data("clickCount", r)
			}
		}
	})
})();
GS.Controllers.BaseController.extend("GS.Controllers.AdController", {
	onDocument: true
}, {
	rotateTimer: 0,
	rotationTime: 6E4,
	defaultRotationTime: 6E4,
	maxRotationTime: 36E4,
	lastActive: null,
	lastRotation: null,
	campaignArtists: {},
	campaignsByCampaignID: {},
	userCampaigns: [],
	init: function () {
		$.subscribe("gs.auth.update", this.callback(this.update));
		$.subscribe("gs.player.nowplaying", this.callback(this.onSongPlay));
		this.lastActive = new Date;
		var a = this;
		$("body").bind("mousemove", function () {
			a.lastActive = new Date
		});
		if ((new Date).valueOf() < 13016304E5) this.defaultRotationTime = 45E3;
		this._super()
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		this.user = GS.user;
		this.parseCampaignsForUser();
		GS.user.IsPremium ? this.hideAdBar() : this.showAdBar();
		$(window).resize()
	},
	onSongPlay: function (a) {
		if (this.campaignArtists && this.campaignArtists[a.ArtistID] instanceof Array) for (var b = 0; b < this.campaignArtists[a.ArtistID].length; b++) {
			var c = this.campaignArtists[a.ArtistID][b];
			if (c) {
				var g = this.campaignsByCampaignID[c];
				if (!g) {
					g = {
						id: c,
						count: 1
					};
					this.campaignsByCampaignID[c] = g;
					this.userCampaigns.push(g)
				}
			}
		}
	},
	parseCampaignsForUser: function () {
		this.userCampaigns = [];
		this.campaignsByCampaignID = {};
		var a = store.get("artistsPlayed" + (this.user ? this.user.UserID : -1));
		if (this.campaignArtists && a) for (var b = 0; b < a.length; b++) {
			var c = a[b];
			if (c && this.campaignArtists[c] instanceof Array) for (var g = 0; g < this.campaignArtists[c].length; g++) {
				var h = this.campaignArtists[c][g];
				if (h) {
					var k = this.campaignsByCampaignID[h];
					if (k) k.count++;
					else {
						k = {
							id: h,
							count: 1
						};
						this.campaignsByCampaignID[h] = k;
						this.userCampaigns.push(k)
					}
				}
			}
		}
	},
	showAdBar: function () {
		$("#capital").show();
		$("#application").css("margin-right", "180px");
		$("#capitalFrameWrapper").children("iframe").attr("src", "");
		clearInterval(this.rotateTimer);
		this.rotateTimer = setInterval(this.callback("onRotateTimer"), this.defaultRotationTime);
		this.chooseAd()
	},
	hideAdBar: function () {
		$("#capital").hide();
		$("#application").css("margin-right", 0);
		$("#capitalFrameWrapper").children("iframe").attr("src", "");
		GS.player && GS.player.updateQueueWidth();
		clearInterval(this.rotateTimer)
	},
	onRotateTimer: function () {
		if (this.lastActive && !GS.user.IsPremium) {
			var a = (new Date).valueOf(),
				b = a - this.lastActive.valueOf();
			a = a - this.lastRotation.valueOf();
			if (b <= this.defaultRotationTime) {
				this.rotationTime = this.defaultRotationTime;
				this.chooseAd()
			} else if (a >= this.rotationTime && this.rotationTime <= this.maxRotationTime) {
				this.rotationTime += this.rotationTime;
				this.chooseAd()
			}
		}
	},
	chooseAd: function () {
		var a = new Date;
		this.lastRotation ? console.log("rotating, time since last rotation: ", a.valueOf() - this.lastRotation.valueOf()) : console.log("rotating, this is first rotation");
		this.lastRotation = a;
		this.setAd("/sidebar.php" + this.buildParams())
	},
	buildParams: function () {
		var a = [];
		if (GS.theme && GS.theme.currentTheme) {
			var b = parseInt(GS.theme.currentTheme.themeID, 10);
			b && a.push("ThemeID=" + b)
		}
		GS.player && GS.player.getCurrentSong() && a.push("CurArtist=" + GS.player.getCurrentSong().ArtistID);
		if (this.userCampaigns && this.userCampaigns.length) {
			this.userCampaigns.sort(function (k, m) {
				return m.count - k.count
			});
			(b = campaigns[0].id) && a.push("Bucket=" + b)
		}
		if (GS.user.isLoggedIn) {
			GS.user.Sex && a.push("Gender=" + GS.user.Sex);
			if (GS.user.TSDOB) {
				b = GS.user.TSDOB.split("-");
				if (b.length == 3) {
					var c = new Date,
						g = c.getFullYear() - parseInt(b[0], 10);
					if (parseInt(b[1], 10) > c.month) g -= 1;
					else if (parseInt(b[1], 10) == c.month && parseInt(b[2], 10) > c.date) g -= 1;
					var h;
					if (g >= 13 && g < 18) h = "13-17";
					else if (g >= 18 && g < 25) h = "18-24";
					else if (g >= 25 && g < 35) h = "25-34";
					else if (g >= 35 && g < 50) h = "35-49";
					else if (g >= 50) h = "50-";
					h && a.push("AgeRange=" + h)
				}
			}
		}
		a = a.concat(this.getRapParams());
		a = a.concat(this.getLocaleParams());
		return "?" + a.join("&")
	},
	loadPixel: function () {
		if (GS.user.isLoggedIn) {
			var a = [];
			if (GS.user.TSDOB) {
				var b = GS.user.TSDOB.split("-");
				if (b.length == 3) {
					var c = new Date,
						g = c.getFullYear() - parseInt(b[0], 10);
					if (parseInt(b[1], 10) > c.month) g -= 1;
					else if (parseInt(b[1], 10) == c.month && parseInt(b[2], 10) > c.date) g -= 1
				}
				a.push("100=" + g)
			}
			GS.user.Sex && a.push("200=" + GS.user.Sex);
			if (GS.user.Email) {
				a.push("300=" + hex_md5(GS.user.Email));
				a.push("400=" + hex_sha1(GS.user.Email))
			}
			this.setPixel("/pixels.php" + ("?" + a.join("&")))
		}
	},
	setAd: function (a) {
		var b = $("#capitalFrameWrapper").children("iframe");
		if (b.length > 1) {
			for (var c = b.length - 1; c > 0; c--) b.eq(c).unbind("load").remove();
			b = b.eq(0)
		}
		var g = b.clone();
		g.css("visibility", "hidden");
		g.bind("load", function () {
			b.unbind("load").remove();
			g.css("visibility", "visible")
		});
		g.attr("src", a);
		$("#capitalFrameWrapper").append(g)
	},
	setPixel: function (a) {
		var b = $("#pixelFrameWrapper").children("iframe");
		if (b.length > 1) {
			for (var c = b.length - 1; c > 0; c--) b.eq(c).unbind("load").remove();
			b = b.eq(0)
		}
		c = b.clone();
		c.css("visibility", "hidden");
		c.bind("load", function () {
			b.unbind("load").remove()
		});
		c.attr("src", a);
		$("#pixelFrameWrapper").append(c)
	},
	getRapParams: function () {
		var a = [],
			b = store.get("personalize" + GS.user.UserID);
		if (!b) return a;
		if (b.length >= 0) return a;
		if (jQuery.isEmptyObject(b)) return a;
		!GS.user.TSDOB && b.age && a.push("AgeRange=" + b.age);
		if (!GS.user.Sex && b.gender) a.push("Gender=" + (b.gender == "Male" ? "M" : "F"));
		return a
	},
	getLocaleParams: function () {
		var a = "0=";
		switch (GS.locale.locale) {
		case "en":
			a += "1";
			break;
		case "bg":
			a += "2";
			break;
		case "ca":
			a += "3";
			break;
		case "cs":
			a += "4";
			break;
		case "da":
			a += "5";
			break;
		case "de":
			a += "6";
			break;
		case "es":
			a += "7";
			break;
		case "eu":
			a += "8";
			break;
		case "fi":
			a += "9";
			break;
		case "fr":
			a += "10";
			break;
		case "it":
			a += "11";
			break;
		case "ja":
			a += "12";
			break;
		case "lt":
			a += "13";
			break;
		case "nb":
			a += "14";
			break;
		case "nl":
			a += "15";
			break;
		case "pl":
			a += "16";
			break;
		case "pt":
			a += "17";
			break;
		case "ro":
			a += "18";
			break;
		case "ru":
			a += "19";
			break;
		case "sk":
			a += "20";
			break;
		case "sl":
			a += "21";
			break;
		case "sv":
			a += "22";
			break;
		case "tr":
			a += "23";
			break;
		case "zh":
			a += "24";
			break;
		default:
			a += "1";
			break
		}
		return [a]
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.GUTSController", {
	onDocument: true
}, {
	shouldLog: false,
	server: "/guts",
	appID: "html",
	context: false,
	bufferLength: 10,
	localLogs: [],
	init: function () {
		this.shouldLog = _.orEqual(gsConfig.shouldUseGuts, 0);
		this.server = _.orEqual(gsConfig.gutsServer, false);
		this.context = {};
		this.currentPage = {};
		this.currentPage.pageType = "home";
		this.currentPage.section = "";
		this.currentPage.subpage = "";
		this.currentPage.id = "";
		this.beginContext({
			sessionID: GS.service.sessionID
		});
		this.beginContext({
			initTime: (new Date).getTime()
		});
		this.logEvent("init", {});
		GS.User && GS.UserID && GS.UserID > 0 && this.beginContext({
			userID: GS.user.UserID
		});
		window.chrome && window.chrome.app.isInstalled ? this.gaTrackEvent("chromeApp", "isInstalled") : this.gaTrackEvent("chromeApp", "notInstalled");
		this._super()
	},
	beginContext: function (a) {
		_.forEach(a, function (b, c) {
			if (a.hasOwnProperty(c)) this.context[c] = a[c]
		}, this)
	},
	endContext: function (a) {
		_.defined(this.context[a]) && delete this.context[a]
	},
	logEvent: function (a, b) {
		if (this.shouldLog) {
			var c = {
				time: (new Date).getTime(),
				lpID: a,
				state: {},
				context: {}
			};
			currentContext = this.context;
			_.forEach(currentContext, function (g, h) {
				if (currentContext.hasOwnProperty(h)) if ($.isArray(currentContext[h])) {
					this.context[h] = [];
					_.forEach(currentContext[h], function (k, m) {
						this.push(m)
					}, this.context[h])
				} else this.context[h] = _.orEqual(currentContext[h], "").toString()
			}, c);
			_.forEach(b, function (g, h) {
				if (b.hasOwnProperty(h)) c.state[h] = _.orEqual(g, "").toString()
			}, c);
			this.localLogs.push(c);
			this.checkSendCondition() && this.sendLogs()
		}
	},
	checkSendCondition: function () {
		return this.localLogs.length >= this.bufferLength
	},
	forceSend: function () {
		this.sendLogs()
	},
	sendLogsTimeout: false,
	sendLogsWait: 500,
	sendLogs: function (a) {
		clearTimeout(this.sendLogsTimeout);
		this.sendLogsTimeout = setTimeout(this.callback(function () {
			if (this.localLogs.length > 0) {
				var b = this.toTransmissionFormat(this.localLogs),
					c = true;
				a = _.orEqual(a, 0);
				if (a >= 3) console.log("guts.sendRequest. numRetries maxed out. ", request);
				else {
					if (a > 0) c = false;
					var g = this;
					$.ajax({
						contentType: "text/xml",
						type: "POST",
						data: b,
						url: this.server,
						cache: c,
						success: function (h, k, m) {
							console.log("guts.sendlogs.success. status: " + k + ", request: ", m);
							if (!h) {
								a++;
								console.log("guts.success NO DATA.  retry request again", m);
								setTimeout(g.callback(function () {
									this.sendLogs(a)
								}), 100 + a * 100)
							}
						},
						error: function (h, k, m) {
							console.log("guts.sendlogs.error. status: " + k + ", error: " + m, h)
						}
					});
					this.localLogs = []
				}
			}
		}), this.sendLogsWait)
	},
	toTransmissionFormat: function (a) {
		var b = {
			result: (new Date).getTime() + "\n",
			appID: this.appID
		};
		_.forEach(a, function (c, g) {
			var h = /\:/g,
				k = /\\/g,
				m = a[g];
			this.result += this.appID + "\t";
			this.result += m.lpID + "\t";
			var o = m.context;
			_.forEach(o, function (s, u) {
				if (o.hasOwnProperty(u)) this.result += u + ":" + o[u].replace(k, "\\\\").replace(h, "\\:") + "\t"
			}, this);
			var r = m.state;
			_.forEach(r, function (s, u) {
				if (r.hasOwnProperty(u)) this.result += u + ":" + r[u].replace(k, "\\\\").replace(h, "\\:") + "\t"
			}, this);
			this.result += m.time + "\n"
		}, b);
		return b.result
	},
	handlePageLoad: function (a, b) {
		switch (a) {
		case "user":
			switch (b.length) {
			case 1:
				this.logPageLoad({
					type: a
				});
				break;
			case 2:
				this.logPageLoad({
					type: a,
					id: b.id
				});
				break;
			case 3:
				this.logSubpageLoad({
					type: b.section
				});
				break;
			case 4:
				this.logSubpageLoad({
					type: b.subpage
				});
				break;
			default:
				break
			}
			break;
		case "home":
		case "upload":
			this.logPageLoad({
				type: a
			});
			break;
		case "playlist":
		case "album":
		case "artist":
			switch (b.length) {
			case 2:
				this.logEvent("loadPage", {
					type: a,
					id: b.id
				});
				this.beginContext({
					currentPageType: a
				});
				break;
			case 3:
				this.logEvent("loadSubpage", {
					type: b.subpage
				});
				this.beginContext({
					currentSubpage: b.subpage
				});
				break;
			default:
				break
			}
			break;
		case "search":
			if (b.type == "everything") {
				this.logEvent("loadPage", {
					type: "search"
				});
				this.beginContext({
					currentPageType: "search"
				})
			} else {
				this.logEvent("loadSubpage", {
					type: b.type
				});
				this.beginContext({
					currentPageType: "search"
				});
				this.beginContext({
					currentSubpage: b.type
				})
			}
			break;
		case "popular":
			switch (b.length) {
			case 1:
				this.logPageLoad({
					type: a
				});
				break;
			case 2:
				this.logSubpageLoad({
					type: "monthly"
				});
				break;
			default:
				break
			}
			break;
		case "now_playing":
			this.logPageLoad({
				type: "now playing"
			});
			break;
		case "song":
			switch (b.length) {
			case 2:
				this.logPageLoad({
					type: a
				});
				break;
			case 3:
				this.logSubpageLoad({
					type: b.subpage
				});
				break
			}
			break;
		default:
			this.logPageLoad({
				type: a
			});
			break
		}
		this.type != "search" && !b.subpage && !b.section && this.context.currentSubpage && this.endContext("currentSubpage");
		this.updateCurrentPage(b)
	},
	updateCurrentPage: function (a) {
		this.currentPage.pageType = a.type;
		this.currentPage.id = a.id;
		this.currentPage.section = a.section;
		this.currentPage.subpage = a.subpage
	},
	logPageLoad: function (a) {
		a.id ? this.logEvent("loadPage", {
			type: a.type,
			id: a.id
		}) : this.logEvent("loadPage", {
			type: a.type
		});
		this.beginContext({
			currentPageType: a.type
		});
		this.endContext("currentSubpage")
	},
	logSubpageLoad: function (a) {
		this.logEvent("loadSubpage", {
			type: a.type
		});
		this.beginContext({
			currentSubpage: a.type
		})
	},
	handleFieldClick: function (a, b, c) {
		if (a.indexOf("artist") > -1) GS.guts.logEvent("OLartistPageLoad", {
			rank: b,
			songID: c
		});
		else a.indexOf("album") > -1 && GS.guts.logEvent("OLalbumPageLoad", {
			rank: b,
			songID: c
		})
	},
	handleFeedEventClick: function (a) {
		var b = {};
		switch ($(a).attr("tagName")) {
		case "A":
			feedEvent = $(a).parents(".event");
			if ($(a).attr("href")) {
				var c = $(a).attr("href").split("/");
				b.clickedType = c[1];
				b.clickedID = c[3]
			} else b.clickedType = $(a).attr("class");
			break;
		case "LI":
			feedEvent = $(a).parents(".event");
			a = $(a).attr("class").split(" ");
			a = a[a.length - 1];
			if (a == "option") b.clickedType = "playSongs";
			else if (a == "show") b.clickedType = "showSongs";
			break;
		default:
			break
		}
		b.rank = $(feedEvent).index() + 1;
		var g = $(feedEvent).attr("class");
		c = g.split(" ");
		b.whoseFeed = c[2].split("user")[1];
		_.forEach(c, function (o, r) {
			if (c[r].indexOf("type") > -1) b.eventType = c[r].substring(4, c[r].length)
		}, b);
		var h = {};
		$('.what>a[class!="showSongs"]', feedEvent).each(function () {
			var o = $(this).attr("href");
			if (o !== undefined) {
				o = o.split("/");
				var r = o[1];
				if (h[r]) h[r] += 1;
				else h[r] = 1;
				b[r + h[r]] = o[3]
			}
		});
		var k = {};
		$("#feed>li").each(function () {
			g = $(this).attr("class");
			c = g.split(" ");
			var o = c[1].substring(4, c[1].length);
			if (k[o]) k[o] += 1;
			else k[o] = 1
		});
		var m = "";
		_.forEach(k, function (o, r) {
			m = m + r + ";" + o + ","
		}, m);
		m = m.slice(0, m.length - 1);
		b.counts = m;
		this.logEvent("feedEventClick", b)
	},
	objectListPlayAdd: function (a, b, c) {
		var g, h;
		switch (c) {
		case "play":
			g = "OLPlayClick";
			break;
		case "add":
			g = "OLAddClick";
			break;
		default:
			break
		}
		var k;
		b = $("#grid .slick-row.selected", b);
		if (b.length > 0) {
			h = "";
			$(b).each(function () {
				k = parseInt($(this).attr("row"), 10);
				isNaN(k) || (h = h + (k + 1) + ",")
			});
			h = h.slice(0, h.length - 1)
		} else h = "all";
		this.logEvent(g, {
			songIDs: a,
			ranks: h
		})
	},
	songItemLibraryClick: function (a, b) {
		this.logEvent("OLlibraryClick", {
			songID: a,
			rank: b
		})
	},
	songItemFavoriteClick: function (a, b) {
		this.logEvent("OLfavoriteClick", {
			songID: a,
			rank: b
		})
	},
	songsRemovedFromQueue: function (a) {
		var b = a.details.items;
		if (a) {
			var c = "";
			_.forEach(b, function (g, h) {
				c = c + h[g].songID + ","
			}, c);
			c = c.slice(0, c.length - 1);
			GS.guts.logEvent("songsRemovedFromQueue", {
				songIDs: c
			})
		}
	},
	handleSearchSidebarClick: function (a, b, c) {
		b = a.attr("href");
		b = b.substr(0, b.indexOf("?"));
		var g = b.split("/");
		b = g[1];
		if (b == "search") {
			b = "seeAll";
			this.logEvent("searchSidebarClick", {
				section: c,
				linkType: b
			})
		} else {
			g = g[3];
			$(a).attr("class") == "image" ? this.logEvent("searchSidebarClick", {
				section: c,
				linkType: b,
				id: g,
				imageClick: "true"
			}) : this.logEvent("searchSidebarClick", {
				section: c,
				linkType: b,
				id: g
			})
		}
	},
	gaTrackEvent: function (a, b, c, g) {
		if (_.notDefined(a) || _.notDefined(b)) console.warn("guts.gaTrackEvent: bad category or action", a, b);
		else {
			c = "" + _.orEqual(c, "");
			g = "" + _.orEqual(g, "");
			if (window._gaq && window._gaq.push) if (c && g) window._gaq.push(["_trackEvent", a, b, c, g]);
			else c ? window._gaq.push(["_trackEvent", a, b, c]) : window._gaq.push(["_trackEvent", a, b])
		}
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.LocaleController", {
	onWindow: true
}, {
	locale: "en",
	init: function () {
		var a = this,
			b = (store.get("gs.locale") || gsConfig.lang || this.detectLangauge() || this.locale).substring(0, 2);
		$("[data-translate-text]").localize("gs", {
			language: b
		});
		$("[data-translate-title]").localize("gs", {
			language: b,
			callback: "titleCallback"
		});
		$.subscribe("gs.locale.update", function (c) {
			a.locale = c;
			$("[data-translate-text]").localize("gs", {
				language: c
			});
			$("[data-translate-title]").localize("gs", {
				language: c,
				callback: "titleCallback"
			});
			store.set("gs.locale", c)
		});
		this.locale = b
	},
	detectLangauge: function () {
		var a = window.navigator;
		return a.language || a.browserLanguage || a.systemLanguage || a.userLanguage
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.FacebookController", {
	onDocument: true
}, {
	APPLICATION_ID: "111132365592157",
	SERVICE_ID: 4,
	FACEBOOK_ONLY_SERVICE_ID: 16,
	PERMISSIONS: "offline_access,publish_stream,email,rsvp_event,read_stream,user_about_me,user_likes,user_interests,user_location,user_birthday",
	WALL_FAVORITES: 1,
	WALL_PLAYLIST_CREATE: 2,
	WALL_PLAYLIST_SUBSCRIBE: 4,
	RATE_LIMIT: 3E5,
	profile: null,
	friends: null,
	registeredWithFacebook: false,
	flags: 0,
	lastPost: 0,
	lastPostParams: null,
	connectStatus: "unknown",
	connected: false,
	onLoginSaveData: null,
	init: function () {
		$.subscribe("gs.auth.update", this.callback(this.update));
		this._super()
	},
	initFacebook: function () {
		if (window.FB && window.FB.init) {
			FB.init({
				appId: this.APPLICATION_ID,
				status: false,
				cookie: false,
				xfbml: true
			});
			var a = _.browserDetect();
			if (a.browser == "chrome") {
				FB.XD._origin = window.location.protocol + "//" + document.domain + "/" + FB.guid();
				FB.XD.Flash.init();
				FB.XD._transport = "flash"
			} else if (a.browser == "opera") {
				FB.XD._transport = "fragment";
				FB.XD.Fragment._channelUrl = window.location.protocol + "//" + window.location.host + "/"
			}
			console.log("FACEBOOK INIT");
			FB.getLoginStatus(this.callback(this.onFacebookLoginStatus));
			FB.Event.subscribe("auth.statusChange", this.callback(this.onFacebookLoginStatus))
		}
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		if (GS.user && GS.user.isLoggedIn && (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID)) {
			this.registeredWithFacebook = GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID;
			GS.service.getUserFacebookData(this.callback("onUserFacebookData", null, null))
		} else if (GS.user && GS.user.isLoggedIn && this.onLoginSaveData == GS.user.email) this.save(0, null, function () {
			GS.facebook.clearInfo()
		});
		else {
			this.friends = this.profile = null;
			this.flags = 0;
			this.connected = false;
			if (window.FB && window.FB.init) {
				FB.init({
					appId: this.APPLICATION_ID,
					status: true,
					cookie: false,
					xfbml: true
				});
				FB.getLoginStatus(this.callback(this.onFacebookLoginStatus))
			}
		}
	},
	cleanSession: function (a) {
		var b = a.session_key.split("-");
		a = a.access_token.split("|");
		var c = {};
		c.facebookUserID = b[1];
		c.sessionKey = b[0];
		c.accessToken1 = a[0];
		c.accessToken3 = a[2];
		return c
	},
	onFacebookLoginStatus: function (a) {
		this.connectStatus = a.status;
		switch (this.connectStatus) {
		case "connected":
			break;
		case "notConnected":
			break;
		case "unknown":
		default:
			break
		}
		$.publish("gs.facebook.status")
	},
	onUserFacebookData: function (a, b, c) {
		try {
			console.log("onUserFacebookData", c);
			var g = {};
			if (window.FB && c && c.FacebookUserID) {
				g.session_key = c.SessionKey + "-" + c.FacebookUserID;
				g.access_token = c.AccessToken1 + "|" + g.session_key + "|" + c.AccessToken3;
				g.expires = 0;
				g.uid = c.FacebookUserID;
				g.sig = null;
				g.secret = null;
				var h = FB.getSession();
				if (h && h.uid && h.uid == g.uid) if (h.session_key != g.session_key || h.access_token != g.access_token) {
					g = h;
					this.save(c.Flags)
				}
				this.flags = c.Flags;
				this.connected = true;
				FB.init({
					appId: this.APPLICATION_ID,
					status: false,
					cookie: false,
					xfbml: true,
					session: g
				});
				FB.api("/me", this.callback("getMyProfile", a, b));
				a && a()
			} else {
				GS.user.Flags = (GS.user.Flags | this.SERVICE_ID) - this.SERVICE_ID;
				if (this.registeredWithFacebook) GS.user.Flags = (GS.user.Flags | this.FACEBOOK_ONLY_SERVICE_ID) - this.FACEBOOK_ONLY_SERVICE_ID;
				this.connected = false;
				console.error("couldn't set session from getUserFacebookDataEx");
				b && b()
			}
		} catch (k) {
			this.connected = false;
			b && b()
		}
	},
	gsLogin: function (a, b) {
		console.log("FACEBOOK LOGIN TO GS");
		if (!GS.user.isLoggedIn) if (this.connectStatus == "connected" && window.FB) {
			var c = FB.getSession();
			console.log("facebook session", c);
			if (c) {
				c = this.cleanSession(c);
				GS.service.authenticateFacebookUser(c.facebookUserID, c.sessionKey, c.accessToken1, c.accessToken3, this.callback("onAuthFacebookUser", a, b), b)
			} else this.connectStatus == "notConnected" ? this.register(a, b) : b({
				error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"
			})
		} else this.login(this.callback(this.gsLogin, a, b), b)
	},
	onAuthFacebookUser: function (a, b, c) {
		if (c) if (c.userID == 0) this.register(a, b);
		else {
			this.connected = true;
			a(c)
		} else b && b(c)
	},
	register: function (a, b) {
		if (window.FB && FB.getSession()) FB.Data.query("select {0} from user where uid={1}", "uid,name,first_name,last_name,profile_url,username,about_me,birthday_date,profile_blurb,sex,email,locale,profile_update_time,pic", FB.getSession().uid).wait(function (c) {
			c && c[0] ? GS.facebook.gotProfileForRegister(b, c[0].username ? c[0].username : "", {
				id: c[0].uid,
				name: c[0].name,
				first_name: c[0].first_name,
				last_name: c[0].last_name,
				link: c[0].profile_url,
				bio: c[0].about_me,
				birthday: c[0].birthday_date,
				about: c[0].profile_blurb,
				gender: c[0].sex,
				email: c[0].email,
				locale: c[0].locale,
				updated_time: c[0].profile_update_time,
				picture: c[0].pic
			}) : GS.facebook.gotProfileForRegister(b)
		});
		else b && b({
			error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"
		})
	},
	gotProfileForRegister: function (a, b, c) {
		console.log("gotProfileForRegister", c);
		if (c && !c.error) GS.service.getUsernameSuggestions(b, c.name ? c.name : "", c.id, this.callback("usernameSuggestSuccess", c), this.callback("usernameSuggestFailed", c));
		else a && a({
			error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"
		})
	},
	usernameSuggestSuccess: function (a, b) {
		var c = "";
		if (b && b.length > 0) c = b[0];
		this.openRegisterLightbox(c, a)
	},
	usernameSuggestFailed: function (a) {
		this.openRegisterLightbox("", a)
	},
	openRegisterLightbox: function (a, b) {
		var c = {
			isFacebook: true,
			username: a,
			session: window.FB ? this.cleanSession(FB.getSession()) : null,
			message: $.localize.getString("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_NOT_FOUND")
		};
		if (b) {
			var g = b.birthday.split("/");
			c.month = parseInt(g[0]);
			c.day = parseInt(g[1]);
			c.year = parseInt(g[2]);
			c.fname = b.name ? b.name : "";
			if (b.gender == "female") c.sex = "F";
			else if (b.gender == "male") c.sex = "M";
			c.email = b.email ? b.email : ""
		}
		GS.lightbox.close();
		GS.lightbox.open("signup", c)
	},
	login: function (a, b) {
		if (window.FB && window.FB.login) GS.airbridge && GS.airbridge.isDesktop ? FB.login(this.callback("onAIRLogin", a, b), {
			perms: this.PERMISSIONS
		}) : FB.login(this.callback("onLogin", a, b), {
			perms: this.PERMISSIONS
		});
		else b && b({
			error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"
		})
	},
	onAIRLogin: function (a, b, c) {
		window.setTimeout(function () {
			GS.facebook.onLogin(a, b, c)
		}, 300)
	},
	onLogin: function (a, b, c) {
		if (c.session) if (c.perms) {
			var g = this.PERMISSIONS.split(",");
			_.forEach(g, function (k) {
				if (c.perms.indexOf(k) == -1) {
					console.error("FB Missing Permission:", k);
					b && b({
						error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_DISALLOW_ERROR"
					})
				}
			});
			g = c.session.session_key.split("-");
			var h = c.session.access_token.split("|");
			if (GS.user.isLoggedIn) GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID ? GS.service.updateUserFacebookData(g[1], g[0], h[0], h[2], this.flags, this.callback("onSaveUserFacebookData", a, b), b) : GS.service.saveUserFacebookData(g[1], g[0], h[0], h[2], this.flags, this.callback("onSaveUserFacebookData", a, b), b);
			else {
				this.onFacebookLoginStatus(c);
				a ? a() : GS.service.authenticateFacebookUser(g[1], g[0], h[0], h[2], this.callback("onAuthFacebookUser", a, b), b)
			}
		} else b({
			error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_DISALLOW_ERROR"
		})
	},
	save: function (a, b, c) {
		if (window.FB && FB.getSession() && GS.user.isLoggedIn) {
			var g = FB.getSession().session_key.split("-"),
				h = FB.getSession().access_token.split("|");
			GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID ? GS.service.updateUserFacebookData(g[1], g[0], h[0], h[2], a, this.callback("onSaveUserFacebookData", b, c), c) : GS.service.saveUserFacebookData(g[1], g[0], h[0], h[2], a, this.callback("onSaveUserFacebookData", b, c), c);
			this.flags = a
		}
	},
	onSaveUserFacebookData: function (a, b, c) {
		if (c == 1 && window.FB) {
			this.connected = true;
			FB.api("/me", this.callback("getMyProfile", a, b))
		} else if (c == -1) if (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID) GS.service.getUserFacebookData(this.callback("onUserFacebookData", a, function () {
			b("FACEBOOK_PROBLEM_CONNECTING_ERROR_MSG")
		}));
		else b && b("FACEBOOK_DUPLICATE_ACCOUNT_ERROR_MSG");
		else b && b("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR")
	},
	getMyProfile: function (a, b, c) {
		if (c && c.id) {
			this.profile = c;
			$.publish("gs.facebook.profile.update");
			a && a()
		} else {
			this.connected = false;
			GS.user && GS.user.isLoggedIn && c.error && c.error.message == "Error validating access token." && GS.lightbox.open("reAuthFacebook");
			b && b()
		}
	},
	onSaveSession: function () {},
	logout: function (a) {
		GS.service.removeUserFacebookData(this.callback("onLogout", a))
	},
	onLogout: function (a) {
		this.clearInfo();
		$.publish("gs.facebook.profile.update");
		a && a()
	},
	clearInfo: function () {
		this.friends = this.profile = null;
		this.connected = false;
		this.flags = 0;
		if (window.FB && window.FB.init) {
			FB.init({
				appId: this.APPLICATION_ID,
				status: true,
				cookie: false,
				xfbml: true
			});
			FB.getLoginStatus(this.callback(this.onFacebookLoginStatus))
		}
		$.publish("gs.facebook.profile.update")
	},
	postToFeed: function (a, b, c, g, h) {
		if (this.connectStatus === "connected" && window.FB && FB.getSession()) {
			var k = {};
			a = _.orEqual(a, "me") + "/feed";
			k.link = b;
			k.message = c;
			k.access_token = FB.getSession().access_token;
			k.hideUndo = true;
			GS.service.makeFacebookRequest(a, k, "POST", this.callback("onFeedPost", k, g), this.callback("onFailedPost", h))
		} else $.isFunction(h) && h("No facebook session.")
	},
	onFeedPost: function (a, b) {
		a.hideUndo = true;
		$.publish("gs.facebook.notification.sent", {
			params: a,
			data: {},
			notifData: {}
		});
		b && b()
	},
	postLink: function (a, b, c, g, h, k) {
		if (this.connectStatus === "connected" && window.FB && FB.getSession()) {
			var m = {};
			a = _.orEqual(a, "me") + "/links";
			m.link = b;
			m.message = c;
			m.access_token = FB.getSession().access_token;
			m.type = _.orEqual(g, "song");
			m.hideUndo = true;
			GS.service.makeFacebookRequest(a, m, "POST", this.callback("onFeedPost", m, h), this.callback("onFailedPost", k))
		} else $.isFunction(k) && k("No facebook session.")
	},
	onFailedPost: function (a, b) {
		$.isFunction(a) && a(b)
	},
	onFavoriteSong: function (a, b) {
		if (this.connectStatus === "connected" && window.FB && FB.getSession() && !(this.flags & this.WALL_FAVORITES)) {
			var c = {
				access_token: FB.getSession().access_token
			};
			c.message = b;
			c.type = "favorite";
			c.hideUndo = true;
			if ($.isFunction(a.toUrl)) {
				c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
				this.postEvent(c, false, a)
			} else GS.Models.Song.getSong(_.orEqual(a.SongID, a.songID), this.callback(function (g) {
				c.link = "http://listen.grooveshark.com" + g.toUrl().substr(1);
				this.postEvent(c, false, g)
			}), this.onFailedPostEvent)
		}
	},
	onPlaylistCreate: function (a, b) {
		if (this.connectStatus === "connected" && window.FB && FB.getSession() && !(this.flags & this.WALL_PLAYLIST_CREATE)) {
			var c = {
				access_token: FB.getSession().access_token
			};
			c.message = b;
			c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
			c.type = "playlist";
			c.hideUndo = true;
			this.postEvent(c, false, a)
		}
	},
	onSubscribePlaylist: function (a, b) {
		if (this.connectStatus === "connected" && window.FB && FB.getSession() && !(this.flags & this.WALL_PLAYLIST_SUBSCRIBE)) {
			var c = {
				access_token: FB.getSession().access_token
			};
			c.message = b;
			c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
			c.type = "playlist";
			c.hideUndo = true;
			this.postEvent(c, false, a)
		}
	},
	onFollowUser: function (a, b) {
		if (this.connectStatus === "connected" && window.FB && FB.getSession() && !(this.flags & this.WALL_FAVORITES)) {
			var c = {
				access_token: FB.getSession().access_token
			};
			c.message = b;
			c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
			c.type = "favorite";
			c.hideUndo = true;
			this.postEvent(c, false, a)
		}
	},
	postEvent: function (a, b, c) {
		var g = new Date;
		if ((b = true) || !this.lastPost || g.getTime() > this.lastPost + this.RATE_LIMIT) {
			this.lastPost = g.getTime();
			GS.service.makeFacebookRequest("me/links", a, "POST", this.callback("onPostEvent", a, c), this.callback("onFailedPost", this.callback("onFailedPostEvent")))
		} else $.publish("gs.facebook.notification.override", a)
	},
	onPostEvent: function (a, b, c) {
		$.publish("gs.facebook.notification.sent", {
			params: a,
			data: c,
			notifData: b
		})
	},
	onFailedPostEvent: function () {
		$.publish("gs.facebook.notification.sent", {
			params: {
				type: "error",
				hideUndo: true
			},
			data: {},
			notifData: {}
		})
	},
	removeEvent: function (a) {
		if (window.FB && FB.getSession() && a && a.result) {
			var b = JSON.parse(a.result);
			a = {
				access_token: FB.getSession().access_token,
				method: "delete"
			};
			b = FB.getSession().uid + "_" + b.id;
			GS.service.makeFacebookRequest(b, a, "GET", this.callback("onRemoveEvent"))
		}
	},
	onRemoveEvent: function (a) {
		console.log("facebook.remove.response", a);
		$.publish("gs.facebook.notification.removed", a);
		this.lastPost = false
	},
	getFriends: function (a) {
		if (this.friends) a(this.friends);
		else this.connectStatus === "connected" && window.FB && FB.getSession() ? FB.api("me/friends", this.callback("onFacebookGetFriends", a)) : a(null)
	},
	onFacebookGetFriends: function (a, b) {
		if (b.data) {
			var c = [];
			for (var g in b.data) c.push(b.data[g]);
			c.sort(function (h, k) {
				var m = (h.name || "").toLowerCase(),
					o = (k.name || "").toLowerCase();
				if (m < o) return -1;
				else if (m > o) return 1;
				return 0
			});
			this.friends = c
		}
		a(this.friends)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.LastfmController", {
	onDocument: true
}, {
	SERVICE_ID: 2,
	API_KEY: "b1ecfd8a5f8ec4dbb4cdacb8f3638f6d",
	API_SECRET: "f8ed9c4ea2f1b981e61e1d0df1a98406",
	P_VERSION: "1.2.1",
	URL_USER_AUTH: "http://www.last.fm/api/auth/",
	URL_AUDIOSCROBBLER: "http://ws.audioscrobbler.com/2.0/",
	CLIENT_ID: "gvs",
	CLIENT_VERSION: "1",
	MINIMUM_DURATION: 240,
	authToken: null,
	sessionKey: null,
	username: null,
	sessionID: null,
	flags: 0,
	enabled: false,
	nowPlaying: null,
	lastPlayed: null,
	currentListening: null,
	init: function () {
		$.subscribe("gs.auth.update", this.callback(this.update));
		$.subscribe("gs.auth.favorite.song", this.callback(this.onFavoriteSong));
		$.subscribe("gs.player.nowplaying", this.callback(this.onNowPlaying));
		$.subscribe("gs.player.playing.continue", this.callback(this.onSongPlaying));
		this._super()
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		GS.user.isLoggedIn && GS.user.Flags & this.SERVICE_ID && GS.service.getLastfmService(this.callback("onGetService"), this.callback("onGetService"))
	},
	onGetService: function (a) {
		if (a.Session) {
			this.username = a.Username;
			this.sessionKey = a.Session;
			this.authToken = a.Token;
			this.flags = a.Flags;
			this.enabled = Boolean(this.flags)
		}
	},
	authorize: function () {
		this.sessionKey = null;
		this.getJSON(this.URL_AUDIOSCROBBLER, {
			method: "auth.getToken",
			api_key: this.API_KEY
		}, this.callback("onGetToken"))
	},
	onGetToken: function (a) {
		if (a && a.token) {
			this.authToken = a.token;
			GS.lightbox.open("lastfmApproval")
		} else $.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_FAIL_COMMUNICATE_LASTFM")
		})
	},
	saveSession: function () {
		this.sessionID || this.getJSON(this.URL_AUDIOSCROBBLER, {
			api_key: this.API_KEY,
			method: "auth.getSession",
			token: this.authToken
		}, this.callback("onGetSession"))
	},
	onGetSession: function (a) {
		if (a.session) {
			this.sessionKey = a.session.key;
			this.username = a.session.name;
			GS.service.updateLastfmService(this.sessionKey, this.authToken, this.username, 1, 0, this.callback("onUpdateService"), this.callback("onUpdateService"))
		} else $.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_FAIL_COMMUNICATE_LASTFM")
		})
	},
	onUpdateService: function (a) {
		if (a && a.success) {
			this.enabled = true;
			$.publish("gs.lastfm.profile.update")
		} else $.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_UNABLE_SAVE_LASTFM")
		})
	},
	logout: function (a) {
		this.authToken = this.sessionKey = this.username = this.sessionID = null;
		this.enabled = false;
		GS.service.removeLastfmService(a);
		$.publish("gs.lastfm.profile.update")
	},
	onNowPlaying: function (a) {
		if (this.enabled && a) {
			this.nowPlaying = {
				track: a.SongName,
				artist: a.ArtistName,
				album: a.AlbumName,
				duration: a.EstimateDuration ? Math.round(a.EstimateDuration / 1E3) : 0,
				method: "track.updateNowPlaying",
				sk: this.sessionKey,
				api_key: this.API_KEY
			};
			if (a.TrackNum) this.nowPlaying.trackNumber = String(a.TrackNum);
			a = $.extend(true, {
				api_sig: this.createSignature(this.nowPlaying)
			}, this.nowPlaying);
			GS.service.lastfmNowPlaying(a, this.callback("onNowPlayingComplete"), this.callback("onNowPlayingComplete"))
		}
	},
	onNowPlayingComplete: function () {},
	onSongPlaying: function (a) {
		var b = a.activeSong;
		a = Math.round(a.duration / 1E3);
		if (!this.currentListening || b.SongID != this.currentListening.songID) this.currentListening = {
			songID: b.SongID,
			secondsListened: 0
		};
		else this.currentListening.secondsListened += 0.5;
		if (this.enabled && b && a >= 30 && (this.currentListening.secondsListened >= this.MINIMUM_DURATION || this.currentListening.secondsListened >= a / 2) && !this.lastPlayed) {
			this.lastPlayed = {
				artist: b.ArtistName,
				track: b.SongName,
				timestamp: Math.round((new Date).getTime() / 1E3),
				duration: b.EstimateDuration ? Math.round(b.EstimateDuration / 1E3) : 0,
				album: b.AlbumName,
				method: "track.scrobble",
				sk: this.sessionKey,
				api_key: this.API_KEY
			};
			if (b.TrackNum) this.nowPlaying.trackNumber = String(b.TrackNum);
			b = $.extend(false, {
				api_sig: this.createSignature(this.lastPlayed)
			}, this.lastPlayed);
			GS.service.lastfmSongPlay(b, this.callback("onSongPlayingComplete"), this.callback("onSongPlayingComplete"))
		} else if (b && this.currentListening.secondsListened < this.MINIMUM_DURATION && this.currentListening.secondsListened < a / 2) this.lastPlayed = null
	},
	onSongPlayingComplete: function () {},
	onFavoriteSong: function () {},
	getJSON: function (a, b, c) {
		if (a && b && c) {
			b.api_sig = this.createSignature(b);
			b.format = "json";
			$.ajax({
				url: a,
				data: b,
				success: c,
				error: c,
				dataType: "jsonp",
				cache: true
			})
		}
	},
	createSignature: function (a) {
		var b = [];
		for (var c in a) b.push(c);
		b.sort();
		c = "";
		for (var g in b) c += b[g] + a[b[g]];
		c += this.API_SECRET;
		return c = hex_md5(c)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.GoogleController", {
	onDocument: true
}, {
	SERVICE_ID: 64,
	GOOGLE_ONLY_SERVICE_ID: 32,
	REQUIRED: "email,firstname,lastname",
	EXTENSIONS: {
		"openid.ns.ax": "http://openid.net/srv/ax/1.0",
		"openid.ax.mode": "fetch_request",
		"openid.ax.type.email": "http://axschema.org/contact/email",
		"openid.ax.type.firstname": "http://axschema.org/namePerson/first",
		"openid.ax.type.lastname": "http://axschema.org/namePerson/last",
		"openid.ax.required": "email,firstname,lastname",
		"openid.ui.icon": "true"
	},
	googleOpener: null,
	googleOpenerWindow: null,
	googleOpenerInterval: null,
	connected: false,
	registeredWithGoogle: false,
	email: "",
	firstname: "",
	lastname: "",
	lastError: "",
	onLoginSaveData: null,
	loginSuccessCallback: null,
	loginFailedCallback: null,
	init: function () {
		$.subscribe("gs.auth.update", this.callback(this.update));
		this.googleOpener = googleOpenIDPopup.createPopupOpener({
			realm: "http://*.grooveshark.com",
			opEndpoint: "https://www.google.com/accounts/o8/ud",
			returnToUrl: (window.location.protocol ? window.location.protocol : "http:") + "//" + (window.location.hostname ? window.location.hostname : "listen.grooveshark.com") + "/googleCallback.php",
			shouldEncodeUrls: true,
			extensions: this.EXTENSIONS
		});
		if (!window.confirmGoogleConnection) window.confirmGoogleConnection = function (a) {
			console.log("goog confirm connection", a);
			if (GS.google.googleOpenerInterval) {
				window.clearInterval(GS.google.googleOpenerInterval);
				GS.google.googleOpenerInterval = null
			}
			this.googleOpenerWindow && this.googleOpenerWindow.close();
			try {
				a = JSON.parse(a)
			} catch (b) {
				this.lastError = "parseError";
				console.error("goog json parse error");
				GS.google.loginFailedCallback();
				return
			}
			if (a.mode == "cancel" || a.error == "cancel") {
				this.lastError = "cancel";
				GS.google.onCancelledLogin()
			} else GS.airbridge && GS.airbridge.isDesktop ? window.setTimeout(function () {
				GS.google.onLogin(a)
			}, 300) : GS.google.onLogin(a)
		};
		if (!window.gsGoogleStorageEvent && (window.localStorage || typeof localStorage != "undefined")) {
			window.gsGoogleStorageEvent = function (a) {
				if (!a && window.event) a = window.event;
				if (window.localStorage && typeof b == "undefined") var b = window.localStorage;
				else if (!window.localStorage) return;
				if (a.key && a.key == "googleOpenIDData" && a.newVal && a.newVal != "") {
					window.confirmGoogleConnection(a.newVal);
					if (b) {
						if (b.setItem) b.setItem("googleOpenIDData", "");
						else b.googleOpenIDData = "";
						b.removeItem && b.removeItem("googleOpenIDData")
					}
				} else if (b && b.getItem && b.getItem("googleOpenIDData") && b.getItem("googleOpenIDData") != "" || b.googleOpenIDData && b.googleOpenIDData != "") {
					a = b.getItem ? "" + b.getItem("googleOpenIDData") : "" + b.googleOpenIDData;
					if (b.setItem) b.setItem("googleOpenIDData", "");
					else b.googleOpenIDData = "";
					window.confirmGoogleConnection(a);
					b.removeItem && b.removeItem("googleOpenIDData")
				}
			};
			if (window.addEventListener) window.addEventListener("storage", window.gsGoogleStorageEvent, false);
			else document.attachEvent && document.attachEvent("onstorage", window.gsGoogleStorageEvent)
		}
		this._super()
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		if (GS.user && GS.user.isLoggedIn && (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.GOOGLE_ONLY_SERVICE_ID)) {
			this.registeredWithGoogle = (GS.user.Flags & this.GOOGLE_ONLY_SERVICE_ID) > 0;
			GS.service.getUserGoogleData(this.callback("onUserGoogleData", null, null))
		} else GS.user && GS.user.isLoggedIn && this.onLoginSaveData == GS.user.email ? GS.service.saveUserGoogleData(this.callback("onSaveUserGoogleData", null, null), function () {
			GS.google.clearInfo()
		}) : this.clearInfo()
	},
	onUserGoogleData: function (a, b, c) {
		try {
			console.log("gotUserGoogleData", c);
			if (c && c.GoogleEmailAddress) {
				this.email = c.GoogleEmailAddress;
				this.connected = true;
				$.publish("gs.google.profile.update");
				a && a()
			} else {
				GS.user.Flags = (GS.user.Flags | this.SERVICE_ID) - this.SERVICE_ID;
				if (this.registeredWithGoogle) GS.user.Flags = (GS.user.Flags | this.GOOGLE_ONLY_SERVICE_ID) - this.GOOGLE_ONLY_SERVICE_ID;
				this.clearInfo();
				b && b()
			}
		} catch (g) {
			this.connected = false;
			b && b()
		}
	},
	gsLogin: function (a, b) {
		console.log("GOOGLE LOGIN TO GS");
		GS.user.isLoggedIn ? GS.service.saveUserGoogleData(this.callback("onSaveUserGoogleData", a, b), b) : GS.service.authenticateGoogleUser(this.callback("onAuthGoogleUser", a, b), b)
	},
	onAuthGoogleUser: function (a, b, c) {
		console.log("onAuthGoogleUser", c);
		if (c) if (c.userID == 0) this.register();
		else {
			a(c);
			$.publish("gs.google.profile.update")
		} else b && b(c)
	},
	onSaveUserGoogleData: function (a, b, c) {
		if (c == 1) {
			this.connected = true;
			$.publish("gs.google.profile.update");
			a && a()
		} else if (c == -1) if (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.GOOGLE_ONLY_SERVICE_ID) GS.service.getUserGoogleData(this.callback("onUserGoogleData", a, function () {
			b("GOOGLE_PROBLEM_CONNECTING_ERROR_MSG")
		}));
		else b && b({
			error: "GOOGLE_DUPLICATE_ACCOUNT_ERROR_MSG"
		});
		else if (c == -2) b && b({
			error: "GOOGLE_MISSING_LOGIN_INFO_ERROR_MSG"
		});
		else b && b({
			error: "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR"
		})
	},
	register: function () {
		GS.lightbox.close();
		var a = this.email.split("@")[0];
		if (a) {
			a = a.replace(/^[\.\-_]|[^a-zA-Z0-9\.\-_]|[\.\-_]$/g, "");
			a = a.replace(/([\.\-_]){2,}/g, "$1")
		}
		var b = this.firstname + " " + this.lastname,
			c = Math.floor(Math.random() * 997508) + 1005;
		b || a ? GS.service.getUsernameSuggestions(a, b, c, this.callback("usernameSuggestSuccess"), this.callback("usernameSuggestFailed")) : this.usernameSuggestFailed("")
	},
	usernameSuggestSuccess: function (a) {
		var b = "";
		if (a && a.length > 0) b = a[0];
		this.openRegisterLightbox(b)
	},
	usernameSuggestFailed: function () {
		this.openRegisterLightbox("")
	},
	openRegisterLightbox: function (a) {
		a = {
			isGoogle: true,
			username: a,
			email: this.email,
			fname: this.firstname + " " + this.lastname,
			message: $.localize.getString("POPUP_SIGNUP_LOGIN_FORM_GOOGLE_NOT_FOUND")
		};
		GS.lightbox.open("signup", a)
	},
	login: function (a, b) {
		this.googleOpenerWindow = this.googleOpener.popup(450, 400);
		this.loginSuccessCallback = a;
		this.loginFailedCallback = b;
		if (GS.airbridge && GS.airbridge.isDesktop) {
			this.googleOpenerInterval = window.setInterval(this.callback(function () {
				try {
					if (this.googleOpenerWindow) if (this.googleOpenerWindow.location && this.googleOpenerWindow.location.host == window.location.host) this.googleOpenerWindow.opener = {
						confirmGoogleConnection: window.confirmGoogleConnection
					}
				} catch (g) {}
			}), 120);
			var c = function () {
				setTimeout(this.callback(function () {
					if (this.googleOpenerWindow.location && this.googleOpenerWindow.location.href == "about:blank") {
						window.clearInterval(this.googleOpenerInterval);
						this.googleOpenerInterval = null
					} else this.googleOpenerWindow.onunload = this.callback(c)
				}), 200)
			};
			this.googleOpenerWindow.onunload = this.callback(c)
		}
	},
	onLogin: function (a) {
		if (a.error) {
			this.lastError = a.error;
			this.loginFailedCallback()
		} else {
			if (a.firstName) this.firstname = a.firstName;
			if (a.lastName) this.lastname = a.lastName;
			if (a.email) this.email = a.email;
			this.gsLogin(this.loginSuccessCallback, this.loginFailedCallback)
		}
	},
	onCancelledLogin: function () {},
	onLogout: function (a) {
		this.clearInfo();
		$.publish("gs.google.profile.update");
		a && a()
	},
	clearInfo: function () {
		this.identity = null;
		this.lastname = this.firstname = this.email = "";
		this.registeredWithGoogle = this.connected = false;
		this.onLoginSaveData = null
	},
	logout: function (a) {
		GS.service.removeUserGoogleData(this.callback("onLogout", a))
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.ApiController", {
	onDocument: true
}, {
	_songStatusCallback: "",
	_statusLookup: {
		0: "none",
		1: "loading",
		2: "loading",
		3: "playing",
		4: "paused",
		5: "buffering",
		6: "failed",
		7: "completed"
	},
	_protocolActions: ["play", "add", "next"],
	_lastStatus: null,
	init: function () {
		$.subscribe("gs.player.playstatus", this.callback(this._doStatusCallback));
		this._super()
	},
	getApplicationVersion: function () {
		return gsConfig.revision
	},
	getAPIVersion: function () {
		return 1.3
	},
	executeProtocol: function (a) {
		var b = a.toLowerCase();
		if (b.indexOf("gs://") != -1) {
			a = a.substring(5);
			b = b.substring(5)
		}
		if (a.charAt(a.length - 1) == "/") {
			a = a.substring(0, a.length - 1);
			b = b.substring(0, b.length - 1)
		}
		b = b.split("/");
		var c = b.pop();
		if (this._protocolActions.indexOf(c) == -1) {
			b.push(c);
			c = ""
		}
		if (b[0] == "themes") GS.lightbox.open("themes");
		else {
			if (c) {
				a = a.substring(0, a.length - c.length - 1);
				var g = GS.player.INDEX_DEFAULT,
					h = false;
				switch (c) {
				case "play":
					h = true;
					break;
				case "next":
					g = GS.player.INDEX_NEXT;
					break
				}
				if (GS.player) switch (b[0]) {
				case "s":
					GS.Models.Song.getSong(b[2], this.callback(function (k) {
						GS.player.addSongsToQueueAt(k.SongID, g, h)
					}), null, false);
					break;
				case "song":
					GS.Models.Song.getSongFromToken(b[2], this.callback(function (k) {
						GS.player.addSongsToQueueAt(k.SongID, g, h)
					}), null, false);
					break;
				case "album":
					GS.Models.Album.getAlbum(b[2], this.callback(function (k) {
						k.play(g, h)
					}), null, false);
					break;
				case "playlist":
					GS.Models.Playlist.getPlaylist(b[2], this.callback(function (k) {
						k.play(g, h)
					}), null, false);
					break
				}
			}
			if (b[0] == "search") {
				b = b[b.length - 1];
				a = a.substring(0, a.length - b.length);
				a += "?q=" + b
			}
			console.log("EXECUTE PROTOCOL, redirect", a);
			location.hash = "/" + a
		}
	},
	getCurrentSongStatus: function () {
		return this._buildCurrentPlayStatus()
	},
	setSongStatusCallback: function (a) {
		if ($.isFunction(a)) this._songStatusCallback = a;
		else if (_.isString(a)) {
			a = a.split(".");
			a = this._getObjectChain(window, a);
			if ($.isFunction(a)) this._songStatusCallback = a
		}
		return this._buildCurrentPlayStatus()
	},
	_getObjectChain: function (a, b) {
		var c = b.shift();
		return (c = a[c]) ? b.length ? this._getObjectChain(c, b) : c : null
	},
	_doStatusCallback: function (a) {
		if (a && this._lastStatus) if (a.status === this._lastStatus.status) if (!a.activeSong && !this._lastStatus.activeSong) {
			this._lastStatus = a;
			return
		} else if (a.activeSong && this._lastStatus.activeSong) if (a.activeSong.SongID === this._lastStatus.activeSong.SongID && a.activeSong.autoplayVote === this._lastStatus.activeSong.autoplayVote) {
			this._lastStatus = a;
			return
		}
		this._lastStatus = a;
		$.isFunction(this._songStatusCallback) && this._songStatusCallback(this._buildCurrentPlayStatus())
	},
	_buildCurrentPlayStatus: function () {
		var a = {
			song: null,
			status: "none"
		};
		if (GS.player) {
			var b = GS.player.getPlaybackStatus();
			if (b) if (b.activeSong) {
				var c = GS.Models.Song.getOneFromCache(b.activeSong.SongID);
				a.song = {
					songID: b.activeSong.SongID,
					songName: b.activeSong.SongName.replace(/&amp\;/g, "&"),
					artistID: b.activeSong.ArtistID,
					artistName: b.activeSong.ArtistName.replace(/&amp\;/g, "&"),
					albumID: b.activeSong.AlbumID,
					albumName: b.activeSong.AlbumName.replace(/&amp\;/g, "&"),
					trackNum: c ? c.TrackNum : 0,
					estimateDuration: b.activeSong.EstimateDuration,
					artURL: c ? c.getImageURL() : gsConfig.assetHost + "/webincludes/images/default/album_250.png",
					calculatedDuration: b.duration,
					position: b.position,
					vote: b.activeSong.autoplayVote
				};
				a.status = this._statusLookup[b.status]
			}
		}
		return a
	},
	getPreviousSong: function () {
		var a = null;
		if (GS.player && GS.player.queue && GS.player.queue.previousSong) {
			a = GS.player.queue.previousSong;
			var b = GS.Models.Song.getOneFromCache(a.songID);
			a = {
				songID: a.SongID,
				songName: a.SongName.replace(/&amp\;/g, "&"),
				artistID: a.ArtistID,
				artistName: a.ArtistName.replace(/&amp\;/g, "&"),
				albumID: a.AlbumID,
				albumName: a.AlbumName.replace(/&amp\;/g, "&"),
				trackNum: b ? b.TrackNum : 0,
				estimateDuration: a.EstimateDuration,
				artURL: b ? b.getImageURL() : gsConfig.assetHost + "/webincludes/images/default/album_250.png",
				vote: a.autoplayVote
			}
		}
		return a
	},
	getNextSong: function () {
		var a = null;
		if (GS.player && GS.player.queue && GS.player.queue.nextSong) {
			a = GS.player.queue.nextSong;
			var b = GS.Models.Song.getOneFromCache(a.songID);
			a = {
				songID: a.SongID,
				songName: a.SongName.replace(/&amp\;/g, "&"),
				artistID: a.ArtistID,
				artistName: a.ArtistName.replace(/&amp\;/g, "&"),
				albumID: a.AlbumID,
				albumName: a.AlbumName.replace(/&amp\;/g, "&"),
				trackNum: b ? b.TrackNum : 0,
				estimateDuration: a.EstimateDuration,
				artURL: b ? b.getImageURL() : gsConfig.assetHost + "/webincludes/images/default/album_250.png",
				vote: a.autoplayVote
			}
		}
		return a
	},
	addSongsByID: function (a, b) {
		GS.player && GS.player.addSongsToQueueAt(a, GS.player.INDEX_DEFAULT, b)
	},
	addSongByToken: function (a, b) {
		GS.player && GS.Models.Song.getSongFromToken(a, this.callback(function (c) {
			GS.player.addSongsToQueueAt([c.SongID], GS.player.INDEX_DEFAULT, b)
		}), null, false)
	},
	addAlbumByID: function (a, b) {
		GS.player && GS.Models.Album.getAlbum(a, this.callback(function (c) {
			c.play(GS.player.INDEX_DEFAULT, b)
		}), null, false)
	},
	addPlaylistByID: function (a, b) {
		GS.player && GS.Models.Playlist.getPlaylist(a, this.callback(function (c) {
			c.play(GS.player.INDEX_DEFAULT, b)
		}), null, false)
	},
	play: function () {
		if (GS.player && GS.player.queue && GS.player.queue.activeSong) GS.player.isPaused ? GS.player.resumeSong() : GS.player.playSong(GS.player.queue.activeSong.queueSongID)
	},
	pause: function () {
		GS.player && GS.player.pauseSong()
	},
	togglePlayPause: function () {
		if (GS.player) GS.player.isPaused ? GS.player.resumeSong() : GS.player.pauseSong()
	},
	previous: function () {
		GS.player && GS.player.previousSong()
	},
	next: function () {
		GS.player && GS.player.nextSong()
	},
	setVolume: function (a) {
		GS.player && GS.player.setVolume(a)
	},
	getVolume: function () {
		if (GS.player) return GS.player.getVolume();
		return 0
	},
	setIsMuted: function (a) {
		GS.player && GS.player.setIsMuted(a)
	},
	getIsMuted: function () {
		if (GS.player) return GS.player.getIsMuted();
		return false
	},
	voteCurrentSong: function (a) {
		GS.player && GS.player.queue && GS.player.queue.activeSong && GS.player.voteSong(GS.player.queue.activeSong.queueSongID, a)
	},
	getVoteForCurrentSong: function () {
		if (GS.player && GS.player.queue && GS.player.queue.activeSong) return GS.player.queue.activeSong.autoplayVote
	},
	favoriteCurrentSong: function () {
		GS.player && GS.player.queue && GS.player.queue.activeSong && GS.user.addToSongFavorites(GS.player.queue.activeSong.SongID)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.PageController", {
	onElement: "#page",
	activePageName: null,
	activePageIdentifier: null,
	_element: null,
	activate: function (a, b) {
		if (!this._element) this._element = $(this.onElement);
		if (this.activePageName === a && this.activePageIdentifier === b) return this._element.controller(a);
		var c = this._element.controller(a);
		if (typeof c !== "undefined") {
			if (this.activePageName) {
				this.activePageName === "home" && $.publish("gs.page.home.leave");
				this._element.controller(this.activePageName).detach()
			} else $.each(this._element.controllers(), function (g, h) {
				h.detach()
			});
			c.reattach();
			this.activePageName = a;
			this.activePageIdentifier = b;
			if (a === "home") {
				$("#theme_home *").show();
				$("#theme_page_header").hide()
			} else {
				$("#theme_home *").hide();
				$("#theme_page_header.active").show();
				$("ul.ui-autocomplete").remove();
				$.publish("gs.page.page.view", a)
			}
			return c
		}
	},
	titlePrepend: "Grooveshark - ",
	titlePostpend: " - Grooveshark",
	title: function (a, b) {
		b = typeof b === "undefined" ? true : b;
		document.title = b ? a + this.titlePostpend : this.titlePrepend + a
	},
	ALLOW_LOAD: true,
	justDidConfirm: false,
	lastPage: "",
	confirmMessage: $.localize.getString("ONCLOSE_PAGE_CHANGES"),
	checkLock: function () {
		if (GS.Controllers.PageController.justDidConfirm || !GS.Controllers.PageController.ALLOW_LOAD && !confirm($.localize.getString("ONCLOSE_SAVE_PLAYLIST"))) {
			GS.Controllers.PageController.justDidConfirm = true;
			location.replace([location.protocol, "//", location.host, location.pathname, GS.Controllers.PageController.lastPage].join(""));
			setTimeout(function () {
				GS.Controllers.PageController.justDidConfirm = false
			}, 500);
			return false
		} else {
			GS.Controllers.PageController.justDidConfirm = false;
			GS.Controllers.PageController.ALLOW_LOAD = true;
			GS.Controllers.PageController.lastPage = location.hash;
			GS.Controllers.PageController.confirmMessage = $.localize.getString("ONCLOSE_PAGE_CHANGES");
			$.publish("gs.router.before");
			return true
		}
	},
	getActiveController: function () {
		return this._element.controller(this.activePageName)
	},
	fromSidebar: 0,
	fromCorrectUrl: false
}, {
	url: false,
	type: false,
	id: false,
	subpage: false,
	fromSidebar: false,
	pageSearchHasFocus: false,
	header: {
		name: false,
		breadcrumbs: [],
		imageUrl: false,
		subpages: [],
		options: [],
		labels: []
	},
	list: {
		doPlayAddSelect: false,
		doSearchInPage: false,
		sortOptions: [],
		gridOptions: {
			data: [],
			columns: {},
			options: {}
		}
	},
	cache: {},
	init: function () {
		if (this.Class.shortName === "PageController") {
			$.subscribe("gs.page.loading.page", this.callback("showPageLoading"));
			$.subscribe("gs.page.loading.grid", this.callback("showGridLoading"));
			$.subscribe("gs.grid.selectedRows", this.callback("changeSelectionCount"));
			$.subscribe("gs.router.before", this.callback("handleFromSidebar"));
			$.subscribe("gs.grid.onsort", this.callback("gridOnSort"));
			this._super()
		}
	},
	index: function () {
		this.url = location.hash;
		this.element.html(this.view("index"))
	},
	notFound: function () {
		GS.Controllers.PageController.activate("home", null).notFound()
	},
	showPageLoading: function () {
		this.element.html(this.view("/shared/pageLoading"));
		var a = this.element.find(".page_loading");
		a.css("marginLeft", a.width() / 2 * -1 + "px")
	},
	showGridLoading: function () {
		$("#grid").html(this.view("/shared/loadingIndicator"));
		var a = this.element.find(".page_loading");
		a.css("marginLeft", a.width() / 2 * -1 + "px")
	},
	changeSelectionCount: function (a) {
		if (a.type === "album" || a.type === "artist") $("input.search", this.element).val("").trigger("keyup");
		if (a.type === "song") {
			var b = _.isNumber(a.len) && a.len > 0 ? a.len : 0;
			if (b) {
				$('#page_header .play.count span[class="label"]').localeDataString("SELECTION_PLAY_COUNT", {
					count: b
				});
				$('#page_header .addSongs.count span[class="label"]').localeDataString("SELECTION_ADD_COUNT", {
					count: b
				});
				$('#page_header .deleteSongs.count span[class="label"]').localeDataString("SELECTION_DELETE_COUNT", {
					count: b
				})
			} else {
				$('#page_header .play.count span[class="label"]').localeDataString("SELECTION_PLAY_ALL");
				$('#page_header .addSongs.count span[class="label"]').localeDataString("SELECTION_ADD_ALL");
				$('#page_header .deleteSongs.count span[class="label"]').localeDataString("SELECTION_DELETE_ALL")
			}
			$("#page_header .music_options").toggleClass("hide", b === 0);
			b = $("#page").attr("class").split("_")[2];
			b = a.len > 0 ? "song" : b;
			$("#page_header a[name=share]").parent().hide();
			var c = GS.Controllers.Lightbox.ShareController.allowed[b];
			if (c) {
				$("#page_header button.share").parent().show();
				$.each(c, function (g, h) {
					$("#page_header a[name=share][rel=" + h + "]").show().parent().show().removeClass("hide")
				})
			} else $("#page_header button.share").parent().hide();
			b === "song" ? $('#page_header .share span[class="label"]').localeDataString("SHARE_SONG") : $('#page_header .share span[class="label"]').localeDataString("SHARE_" + b.toUpperCase());
			if (a.len != 1) b === "playlist" ? $("#page_header li.shareOptions").show() : $("#page_header li.shareOptions").hide();
			else $("#page_header li.shareOptions").show();
			a.len <= 0 ? $("#page_header button.deleteSongs").parent().hide() : $("#page_header button.deleteSongs").parent().show();
			if ($("#page").attr("class") == "gs_page_now_playing") a.len <= 0 ? $("#page_header button.delete").hide() : $("#page_header button.delete").show()
		}
	},
	setFromSidebar: function (a) {
		GS.page.fromSidebar = a
	},
	isFromSidebar: function () {
		if (GS.page.fromSidebar === 2) return true;
		else return GS.page.fromSidebar = false
	},
	"a.fromSidebar click": function (a, b) {
		console.error("fromsidebar click", a, b, a.attr("href"));
		b.stopImmediatePropagation();
		GS.page.setFromSidebar(1);
		location.hash = a.attr("href");
		return false
	},
	handleFromSidebar: function () {
		if (GS.page.fromCorrectUrl === true) GS.page.fromCorrectUrl = false;
		else if (GS.page.fromSidebar === 1) GS.page.fromSidebar = 2;
		else if (GS.page.fromSidebar === 2) GS.page.fromSidebar = 0
	},
	correctUrl: function (a, b) {
		if (a && $.isFunction(a.toUrl)) {
			var c = a.toUrl(b);
			if (location.hash !== c) {
				GS.page.fromCorrectUrl = true;
				location.replace(c)
			}
		} else console.error("invalid page.correctUrl obj", a, b)
	},
	gridOnSort: function (a) {
		a && a.sortStoreKey && store.set(a.sortStoreKey, a)
	},
	getPlayContext: function () {
		var a;
		switch (this.type) {
		case "playlist":
			if (this.hasOwnProperty("playlist") && this.playlist instanceof GS.Models.Playlist) a = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, this.playlist);
			break;
		case "artist":
			if (this.hasOwnProperty("artist") && this.playlist instanceof GS.Models.Artist) a = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ARTIST, this.artist);
			break;
		case "album":
			if (this.hasOwnProperty("album") && this.playlist instanceof GS.Models.Album) a = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_ALBUM, this.album);
			break;
		case "user":
			if (this.hasOwnProperty("user") && this.playlist instanceof GS.Models.User) a = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_USER, this.user);
			break;
		case "popular":
			a = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_POPULAR);
			break;
		default:
			if (this.hasOwnProperty("query")) a = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_SEARCH, {
				query: this.query,
				type: this.type ? this.type : "everything"
			});
			break
		}
		return _.orEqual(a, new GS.Models.PlayContext)
	},
	"input focus": function (a) {
		$(a).parent().parent().addClass("active")
	},
	"textarea focus": function (a) {
		$(a).parent().parent().parent().addClass("active")
	},
	"input blur": function (a) {
		$(a).parent().parent().removeClass("active")
	},
	"textarea blur": function (a) {
		$(a).parent().parent().parent().removeClass("active")
	},
	"#page_header .play.playTop click": function () {
		console.log("dropdown.play.default click");
		var a = this.getSongsIDsFromSelectedGridRows();
		a.length && GS.player.addSongsToQueueAt(a, GS.Controllers.PlayerController.INDEX_DEFAULT, true, this.getPlayContext());
		GS.guts.objectListPlayAdd(a, this.element, "play")
	},
	"#page_header .upload click": function () {
		window.open("http://listen.grooveshark.com/upload", "_blank")
	},
	"#page .dropdownButton click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $(a).closest(".btn_group");
		if (c.find(".dropdown").is(":visible")) $("#page .btn_group").removeClass("active");
		else {
			$("#page .btn_group").removeClass("active");
			c.addClass("active");
			$("body").click(function () {
				$("#page .btn_group").removeClass("active")
			})
		}
	},
	"#page_header .dropdownOptions a[name=sort] click": function (a) {
		var b = $("#grid").controller();
		b && b.grid.onSort(a.attr("rel"));
		b = a.find("span");
		a.parent().parent().parent().parent().find(".dropdownButton span.label").html(b.html()).attr("rel", b.attr("rel"))
	},
	"#page_header .dropdownOptions a[name=playNow] click": function () {
		console.log("dropdown.play.now click");
		var a = this.getSongsIDsFromSelectedGridRows();
		a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_DEFAULT, true, this.getPlayContext());
		GS.guts.objectListPlayAdd(a, this.element, "play")
	},
	"#page_header .dropdownOptions a[name=playNext] click": function () {
		console.log("dropdown.play.next click");
		var a = this.getSongsIDsFromSelectedGridRows();
		a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_NEXT, false, this.getPlayContext());
		GS.guts.objectListPlayAdd(a, this.element, "play")
	},
	"#page_header .dropdownOptions a[name=playLast] click": function () {
		console.log("dropdown.play.last click");
		var a = this.getSongsIDsFromSelectedGridRows();
		a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_LAST, false, this.getPlayContext());
		GS.guts.objectListPlayAdd(a, this.element, "play")
	},
	"#page_header .dropdownOptions a[name=replace] click": function () {
		GS.player.clearQueue();
		var a = this.getSongsIDsFromSelectedGridRows();
		a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_REPLACE, true, this.getPlayContext());
		GS.guts.objectListPlayAdd(a, this.element, "play")
	},
	"#page_header .dropdownOptions a[name=addToQueue] click": function () {
		var a = this.getSongsIDsFromSelectedGridRows();
		a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_LAST, false, this.getPlayContext());
		GS.guts.objectListPlayAdd(a, this.element, "add")
	},
	"#page_header .dropdownOptions a[name=addToPlaylist] click": function () {
		var a = this.getSongsIDsFromSelectedGridRows();
		if (a.length) {
			GS.lightbox.open("addSongsToPlaylist", a);
			GS.guts.objectListPlayAdd(a, this.element, "add")
		}
	},
	"#page_header .dropdownOptions a[name=addToNewPlaylist] click": function () {
		var a = this.getSongsIDsFromSelectedGridRows();
		if (a.length) {
			GS.lightbox.open("newPlaylist", a);
			GS.guts.objectListPlayAdd(a, this.element, "add")
		}
	},
	"#page_header .dropdownOptions a[name=addToLibrary] click": function () {
		var a = this.getSongsIDsFromSelectedGridRows();
		if (a.length) {
			GS.user.addToLibrary(a);
			GS.guts.objectListPlayAdd(a, this.element, "add")
		}
	},
	"#page_header .dropdownOptions a[name=addToFavorites] click": function () {
		var a = this.getSongsIDsFromSelectedGridRows();
		if (a.length == 1) {
			GS.user.addToSongFavorites(a[0], true);
			GS.guts.objectListPlayAdd(a, this.element, "add")
		}
	},
	getSongsIDsFromSelectedGridRows: function () {
		var a = $("#grid").controller(),
			b = [];
		if (a && a.selectedRowIDs.length > 0) b = a.selectedRowIDs;
		else if (a) for (var c = 0; c < a.dataView.rows.length; c++) b.push(a.dataView.rows[c].SongID);
		else this.type === "song" && this.song && b.push(this.song.SongID);
		return b
	},
	"#page_header .dropdownOptions a[name=share] click": function (a) {
		console.log("dropdown.share", this.type, this, a.attr("rel"), "click", a);
		var b = this.element.find(".gs_grid:last").controller();
		if (!b || b.selectedRowIDs.length === 0) GS.lightbox.open("share", {
			service: a.attr("rel"),
			type: this.type,
			id: this.id
		});
		else if (b.selectedRowIDs.length === 1) {
			GS.lightbox.open("share", {
				service: a.attr("rel"),
				type: "song",
				id: this.getSongsIDsFromSelectedGridRows()[0]
			});
			a = parseInt($("#grid .slick-row.selected").attr("row"), 10) + 1;
			GS.guts.logEvent("OLShare", {
				songIDs: this.getSongsIDsFromSelectedGridRows()[0],
				ranks: a
			})
		}
	},
	"#page_search input keyup": function (a, b) {
		var c = $("#page_search_results li.selected");
		switch (b.which) {
		case _.keys.ESC:
			$("#page_search_results").hide();
			$("#page_search a.remove").addClass("hide");
			$(a).val("");
			this.inpageSearch();
			return;
		case _.keys.UP:
			c.is(":first-child") ? $("#page_search_results li:last").addClass("selected") : c.prev().addClass("selected");
			c.removeClass("selected");
			return;
		case _.keys.DOWN:
			c.is(":last-child") ? $("#page_search_results li:first").addClass("selected") : c.next().addClass("selected");
			c.removeClass("selected");
			return;
		case _.keys.ENTER:
			$("#page_search").submit();
			return
		}
		$("#page_search a.remove").toggleClass("hide", !$(a).val().length);
		this.inpageSearch()
	},
	searchTimeout: false,
	searchTimeoutWait: 100,
	inpageSearch: function () {
		var a = $("#page_search input");
		clearTimeout(this.searchTimeout);
		this.searchTimeout = setTimeout(this.callback(function () {
			var b = this.element.find(".gs_grid:last").controller(),
				c = $.trim($(a).val().toLowerCase());
			if (b) {
				var g = c;
				if ($("#page").is(".gs_page_search") && _.isString(this.query)) if (c.indexOf(this.query.toLowerCase()) === 0) g = c.substring(this.query.length);
				b.searchString = $.trim(g);
				b.dataView.refresh()
			} else if ($("#feed.events").length) if (c == "") $("#feed.events .event").show();
			else {
				(new Date).getTime();
				$("#feed.events .event").each(function () {
					var h = $(this);
					h.text().toLowerCase().indexOf(c) !== -1 ? h.show() : h.hide()
				});
				(new Date).getTime()
			}
			c.length > 0 ? GS.service.getArtistAutocomplete(c, this.callback("autocompleteSuccess"), this.callback("autocompleteFail")) : $("#page_search_results").hide()
		}), this.searchTimeoutWait)
	},
	"#page_search input focus": function () {
		this.pageSearchHasFocus = true
	},
	"#page_search input blur": function () {
		setTimeout(this.callback(function () {
			this.pageSearchHasFocus || $("#page_search_results").hide()
		}), 500);
		this.pageSearchHasFocus = false
	},
	"#page_search .search-item a click": function (a) {
		$("#page_search_results li.selected").removeClass("selected");
		$(a).parent().addClass("selected");
		$(a).is(".search-item") && $("#page_search input").val($(a).text());
		$("#page_search").submit()
	},
	"#page_search a.icon click": function () {
		$("#page_search input").focus().select()
	},
	"#page_search a.remove click": function (a) {
		$(a).addClass("hide");
		$("#page_search_results").hide();
		$("#page_search input").val("").focus();
		this.inpageSearch()
	},
	"#page_search submit": function (a, b) {
		b.preventDefault();
		GS.search = _.orEqual(GS.search, {});
		GS.search.type = $(a).attr("data-search-type") || "";
		var c = $("#page_search_results li.selected");
		GS.search.query = c.is(".search-item-result") ? c.find("a").text() : $("input[name=q]", a).val();
		if (GS.search.query && GS.search.query.length) {
			this.pageSearchHasFocus = false;
			GS.router.performSearch(GS.search.type, GS.search.query)
		}
	},
	autocompleteSuccess: function (a) {
		this.autocompleteResults = a;
		$("#page_search_results").html(this.view("/shared/pageSearchResults"));
		this.pageSearchHasFocus && $("#page_search_results").show()
	},
	autocompleteFail: function () {
		$("#page_search_results").remove(".search_result").hide()
	},
	addAutocomplete: function (a) {
		a = _.orEqual(a, $("#page").attr("class"));
		a.match(".gs_page_") || (a = ".gs_page_" + a);
		$("input.search.autocomplete", this.element).autocomplete({
			scroll: true,
			matchSubset: false,
			selectFirst: false,
			source: function (b, c) {
				if (b = $.trim(b.term || b)) {
					var g = [];
					GS.service.getArtistAutocomplete(b, function (h) {
						if ($("#page").is(a)) {
							h.Artists && $.each(h.Artists, function (k, m) {
								g.push(m.Name)
							});
							c(g)
						}
					}, function () {})
				}
			},
			select: function (b, c) {
				$("#searchBar_input input").val(c.item.value);
				$("#homeSearch").submit()
			}
		})
	},
	"#feed.events button[name=play] click": function (a) {
		$(a).closest(".event").data("event").playSongs(-1, true)
	},
	"#feed.events .event a[name=play] click": function (a) {
		var b = $(a).closest(".event").data("event");
		a = _.defined($(a).attr("rel")) ? parseInt($(a).attr("rel"), 10) : -1;
		b.playSongs(a, a == -1 || a == -4 ? true : false)
	},
	"#feed.events .event .songLink click": function (a) {
		var b = $(a).closest(".event");
		b = $(b).data("event");
		b = GS.Models.Song.wrapCollection(b.data.songs);
		a = _.defined($(a).attr("data-song-index")) ? parseInt($(a).attr("data-song-index"), 10) : 0;
		if (b.length > 0) if (a = (a = b[a]) && $.isFunction(a.toUrl) ? a.toUrl() : false) location.hash = a;
		return false
	},
	"#feed.events .event button.subscribe click": function (a) {
		var b = $(a).closest(".event").data("event");
		GS.Models.Playlist.getPlaylist(b.data.playlist.playlistID, this.callback("subscribePlaylist", a), this.callback("subscribePlaylistError"), false)
	},
	subscribePlaylist: function (a, b) {
		if (b.isSubscribed()) {
			GS.user.removeFromPlaylistFavorites(b.PlaylistID);
			a.find("span").localeDataString("PLAYLIST_SUBSCRIBE")
		} else {
			GS.user.addToPlaylistFavorites(b.PlaylistID);
			a.find("span").localeDataString("PLAYLIST_UNSUBSCRIBE")
		}
	},
	subscribePlaylistError: function () {
		$.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("NOTIF_FAVORITE_ERROR_GENERAL")
		})
	},
	"#feed.events .event .showSongs click": function (a) {
		a = $(a).closest(".event");
		var b = $(a).data("event"),
			c = $(a).find(".songWrapper"),
			g = $(a).find(".songList");
		if (g.children().length) c.toggle();
		else {
			var h = GS.Models.Song.wrapCollection(b.data.songs);
			c.css("visibility", "hidden").show();
			oldCols = GS.Controllers.GridController.columns.song.concat();
			b = [oldCols[0], oldCols[1], oldCols[2]];
			g.gs_grid(h, b, {
				sortCol: "Sort",
				padding: 0
			});
			$(window).resize();
			c.css("visibility", "visible")
		}
		c = g.is(":visible") ? $.localize.getString("FEED_HIDE_SONGS") : $.localize.getString("FEED_VIEW_SONGS");
		$(a).find("button.showSongs .label").text(c)
	},
	"#feed.events .event .feedControl click": function (a) {
		var b = $(a).closest(".event"),
			c = $(b).data("event");
		switch ($(a).attr("rel")) {
		case "remove":
			b.remove();
			c.remove();
			break
		}
	},
	".slick-row .song .options .favorite click": function (a, b) {
		console.log("song favorite option click", a, b);
		var c = a.parent().attr("rel"),
			g = parseInt($(a).parents(".slick-row").attr("row")) + 1;
		if (a.parent().is(".isFavorite")) {
			GS.user.removeFromSongFavorites(c);
			a.parent().removeClass("isFavorite")
		} else {
			GS.user.addToSongFavorites(c);
			a.parent().addClass("isFavorite");
			GS.guts.songItemFavoriteClick(c, g)
		}
	},
	".slick-row .song .options .library click": function (a, b) {
		console.log("song library option click", a, b);
		var c = a.parent().attr("rel"),
			g = parseInt($(a).parents(".slick-row").attr("row")) + 1;
		if (a.parent().is(".inLibrary")) {
			GS.user.removeFromLibrary(c);
			a.parent().removeClass("inLibrary")
		} else {
			GS.user.addToLibrary(c);
			a.parent().addClass("inLibrary");
			GS.guts.songItemLibraryClick(c, g)
		}
	},
	".slick-row .playlist .subscribe click": function (a, b) {
		console.log("playlist subscribe option click", a, b);
		var c = a.attr("rel");
		if (GS.Models.Playlist.getOneFromCache(c).isSubscribed()) {
			GS.user.removeFromPlaylistFavorites(c);
			a.removeClass("subscribed").find("span").text($.localize.getString("PLAYLIST_SUBSCRIBE"))
		} else {
			GS.user.addToPlaylistFavorites(c);
			a.addClass("subscribed").find("span").text($.localize.getString("PLAYLIST_UNSUBSCRIBE"))
		}
	},
	".slick-row .user .follow click": function (a, b) {
		console.log("user follow option click", a, b);
		var c = a.attr("rel");
		if (a.is(".following")) {
			GS.user.removeFromUserFavorites(c);
			a.removeClass("following").find("a.follow span").text("Follow")
		} else {
			GS.user.addToUserFavorites(c);
			a.addClass("following").find("a.follow span").text("Unfollow")
		}
	},
	".slick-cell.song li.more click": function (a, b) {
		var c = $(a).parents(".options").attr("rel"),
			g = GS.Models.Song.getOneFromCache(c),
			h = $(a).parents(".slick-row").attr("row"),
			k = $(a).parents(".gs_grid").controller(),
			m = {},
			o;
		rank = parseInt(h) + 1;
		if ($("#page").is(".gs_page_now_playing")) {
			o = g.queueSongID;
			m = {
				isQueue: true,
				flagSongCallback: function (r) {
					GS.player.flagSong(o, r)
				}
			}
		}
		if ($("div.gridrow" + h).is(":visible")) {
			$("div.gridrow" + h).hide();
			a.removeClass("active-context")
		} else {
			$(a).jjmenu(b, g.getOptionMenu(m), null, {
				xposition: "right",
				yposition: "right",
				show: "show",
				className: "rowmenu gridrow" + h
			});
			GS.guts.logEvent("songOptionMenuClicked", {
				songID: c,
				rank: rank,
				objList: true
			})
		}
		k.currentRow = h;
		k.grid.setSelectedRows([h]);
		k.grid.onSelectedRowsChanged()
	},
	playClickSongID: false,
	".slick-cell.song a.play click": function (a, b) {
		var c = parseInt(a.siblings("ul.options").attr("rel"), 10),
			g = GS.player.getCurrentQueue(),
			h = GS.player.isPlaying;
		isPaused = GS.player.isPaused;
		if (this.playClickSongID != c) {
			this.playClickSongID = c;
			row = $(a).parents(".slick-row").attr("row");
			rank = parseInt(row) + 1;
			row = $(a).parents(".slick-row").attr("row");
			rank = parseInt(row) + 1;
			if (a.parents(".slick-row").is(".active") && g.activeSong.SongID == c) if (!h && !isPaused) {
				$(a).removeClass("paused");
				GS.player.playSong($(a).parents(".slick-row").attr("rel"))
			} else if (h) {
				$(a).addClass("paused");
				GS.player.pauseSong()
			} else {
				$(a).removeClass("paused");
				GS.player.resumeSong()
			} else if ($("#page").is(".gs_page_now_playing")) {
				b.stopImmediatePropagation();
				GS.player.playSong($(a).parents(".slick-row").attr("rel"))
			} else if ($(a).parents(".gs_grid.hasSongs").length) {
				GS.player.addSongsToQueueAt([c], GS.player.INDEX_DEFAULT, false, this.getPlayContext());
				GS.guts.logEvent("songItemAddButton", {
					songID: c,
					rank: rank
				})
			} else {
				GS.player.addSongAndPlay(c, this.getPlayContext());
				GS.guts.logEvent("songItemPlayButton", {
					songID: c,
					rank: rank
				})
			}
			setTimeout(this.callback(function () {
				this.playClickSongID = false
			}), 500);
			return false
		}
	},
	".slick-row.event click": function (a, b) {
		var c = a.attr("row");
		c = $("#grid").controller().dataView.getItemByIdx(c);
		if (!$(b.target).is("a[href]") && c && c.TicketsURL) {
			window.open(c.TicketsURL, "_blank");
			GS.guts.gaTrackEvent("grid", "eventClick", c.TicketsURL);
			return false
		}
	},
	"#searchForm, #homeSearch submit": function (a, b) {
		b.preventDefault();
		GS.search = _.orEqual(GS.search, {});
		GS.search.query = $("input[name=q]", a).val();
		GS.search.type = $(a).attr("data-search-type") || "";
		GS.search.query && GS.search.query.length && GS.router.performSearch(GS.search.type, GS.search.query)
	},
	"#feed .what>a click": function (a, b) {
		GS.guts.handleFeedEventClick(a, b)
	},
	"#feed li.option click": function (a, b) {
		GS.guts.handleFeedEventClick(a, b)
	},
	"#feed li.show click": function (a, b) {
		GS.guts.handleFeedEventClick(a, b)
	},
	"#searchArtists a click": function (a, b) {
		GS.guts.handleSearchSidebarClick(a, b, "artist")
	},
	"#searchAlbums a click": function (a, b) {
		GS.guts.handleSearchSidebarClick(a, b, "album")
	},
	"#searchPlaylists a click": function (a, b) {
		GS.guts.handleSearchSidebarClick(a, b, "playlist")
	},
	"#searchUsers a click": function (a, b) {
		GS.guts.handleSearchSidebarClick(a, b, "user")
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.RapLeafController", {
	onDocument: true
}, {
	REDIRECT_URL: "",
	personalizeObj: null,
	init: function () {
		$.subscribe("gs.auth.update", this.callback(this.update));
		this._super()
	},
	appReady: function () {
		this.REDIRECT_URL = "http://targeting.grooveshark.com/rapcallback.php";
		this.onPersonalize()
	},
	update: function () {
		this.onPersonalize()
	},
	onPersonalize: function () {
		var a = store.get("personalize" + GS.user.UserID);
		if (a) if (a.length >= 0) this.onRapLeafCall();
		else jQuery.isEmptyObject(a) && this.onRapLeafCall();
		else this.onRapLeafCall()
	},
	onRapLeafCall: function () {
		GS.user.IsPremium || GS.user.isLoggedIn || this.onPersonalizeByWebVisit()
	},
	onPersonalizeByWebVisit: function () {
		GS.service.rapleafPersonalize(this.REDIRECT_URL, this.callback("onPersonalizeCallback"), this.callback("onPersonalizeCallback"))
	},
	onPersonalizeCallback: function (a) {
		var b;
		if (a) try {
			b = JSON.parse(a);
			store.set("personalize" + GS.user.UserID, b);
			a = {};
			if (!GS.user.TSDOB && b.age) a.age = true;
			if (!GS.user.Sex && b.gender) a.gender = true;
			jQuery.isEmptyObject(a) || GS.guts.logEvent("rapleafCollectedData", a)
		} catch (c) {
			store.set("personalize" + GS.user.UserID, null)
		} else store.set("personalize" + GS.user.UserID, null)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.LogController", {
	onDocument: true
}, {
	eventLog: null,
	currentSongID: null,
	init: function () {
		$.subscribe("gs.player.playing", this.callback(this.logSongPlay));
		$.subscribe("gs.page.page.view", this.callback(this.logPageSeen));
		$.subscribe("gs.page.home.view", this.callback(this.logPageSeen));
		$.subscribe("gs.auth.update", this.callback(this.update));
		this._super()
	},
	appReady: function () {
		this.update()
	},
	update: function () {
		this.eventLog = store.get("eventLog" + GS.user.UserID);
		if (!this.eventLog) {
			this.eventLog = {};
			this.saveLog()
		}
	},
	logSongPlay: function () {
		if (this.currentSongID != GS.player.currentSong.SongID) {
			this.currentSongID = GS.player.currentSong.SongID;
			if (this.eventLog.songPlayCount) this.eventLog.songPlayCount++;
			else {
				this.eventLog.songPlayCount = 1;
				if (!this.eventLog.pageSeen || !this.eventLog.pageSeen.song) $.publish("gs.facebook.notification.songComment", {})
			}
			this.saveLog()
		}
	},
	logPageSeen: function () {
		if (this.eventLog) {
			if (!this.eventLog.pageSeen) this.eventLog.pageSeen = [];
			var a = new Date,
				b = null;
			if (window.location.hash == "#/") b = "home";
			else if (window.location.hash == "#/popular") b = "popular";
			else if (window.location.hash == "#/settings") b = "settings";
			else if (window.location.hash == "#/now_playing") b = "nowplaying";
			else if (window.location.hash.toString().indexOf("#/search") >= 0) b = "search";
			else if (window.location.hash.toString().indexOf("#/s/") >= 0) b = "song";
			else if (window.location.hash.toString().indexOf("#/album") >= 0) b = "album";
			else if (window.location.hash.toString().indexOf("#/user/") >= 0) b = window.location.hash.toString().indexOf("/favorites") >= 0 ? "favorites" : window.location.hash.toString().indexOf("/playlists") >= 0 ? "playlists" : window.location.hash.toString().indexOf("/community") >= 0 ? "community" : "mymusic";
			if (b) {
				this.eventLog.pageSeen[b] = a.getTime();
				this.saveLog()
			}
		}
	},
	saveLog: function () {
		store.set("eventLog" + GS.user.UserID, this.eventLog)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.InviteInterface", {
	onDocument: false
}, {
	userInfo: {},
	googleContacts: null,
	facebookFriends: [],
	fbIDs: {},
	slickbox: false,
	peopleError: null,
	people: null,
	onFollowersSuccess: function (a) {
		var b = [];
		$.each(a, this.callback(function (c, g) {
			b.push([g.Email, g.Username + " " + g.Email, g.Username, g.Username]);
			this.userInfo[g.UserID] = g;
			this.userInfo[g.Username] = g
		}));
		a = new $.TextboxList("#emails", {
			addOnBlur: true,
			bitsOptions: {
				editable: {
					growing: true,
					growingOptions: {
						maxWidth: $("#emails").innerWidth() - 10
					}
				}
			},
			plugins: {
				autocomplete: {
					placeholder: $.localize.getString("SHARE_EMAIL_PLACEHOLDER")
				}
			},
			encode: this.callback(function (c) {
				for (var g = [], h = 0; h < c.length; h++) if (c[h][0]) this.userInfo[c[h][0]] ? g.push(this.userInfo[c[h][0]].Email) : g.push(c[h][0]);
				else if (c[h][1]) this.userInfo[c[h][1]] ? g.push(this.userInfo[c[h][1]].Email) : g.push(c[h][1]);
				return g.join(",")
			})
		});
		a.plugins.autocomplete.setValues(b);
		a.addEvent("bitAdd", this.callback(function (c) {
			c.getValue()[1] === "" && c.hide();
			if (this.userInfo[c.getValue()[1]] && _.notDefined(c.getValue()[0])) {
				var g = this.userInfo[c.getValue()[1]];
				c.setValue([g.Email, g.Username + " " + g.Email, g.Username, g.Username]);
				c.show()
			}
		}));
		$("#services_content input.textboxlist-bit-editable-input").focus()
	},
	extractInviteEmails: function (a) {
		var b, c = [],
			g, h = $.trim(a).split(",");
		for (a = 0; a < h.length; a++) {
			g = $.trim(h[a]).split(" ");
			for (b = 0; b < g.length; b++) {
				g[b] = $.trim(g[b]);
				g[b] && c.push(g[b])
			}
		}
		return c
	},
	onFollowersFailed: function (a) {
		console.warn("failed grabbing contact info for followers", autocompleteTerms, a);
		$.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_FAIL_FANS_EMAIL_ONLY")
		})
	},
	onFacebookFriends: function (a) {
		a || (a = []);
		if (this.facebookFriends = a) {
			_.forEach(this.facebookFriends, function (b, c) {
				this.facebookFriends[c].selected = false
			}, this);
			$("contactsContainer.facebook", this.element).show()
		}
		this.onFacebookFriendsCallback()
	},
	formSubmit: function () {
		console.log("interface.formSubmit", this.submitType);
		var a = this,
			b = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
		this.peopleError = [];
		this.people = [];
		switch (this.submitType) {
		case "email":
			var c;
			c = $.trim($("textarea[name=emails]", this.element).val());
			var g = $("div.textboxlist", this.element).find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").filter(":last").text();
			if (c !== "") {
				c = this.extractInviteEmails(c);
				_.forEach(c, function (m) {
					m.match(b) ? a.people.push(m) : a.peopleError.push(m)
				})
			}
			if (g) {
				g = this.extractInviteEmails(g);
				for (c = 0; c < g.length; c++) g[c].match(b) ? this.people.push(g[c]) : this.peopleError.push(g[c])
			}
			if (this.people.length) GS.service.sendInvites(this.people, this.callback("sendInviteSuccess"), this.callback("sendInviteFailed"));
			else this.peopleError.length && this.invalidInviteEmail();
			break;
		case "googleLogin":
			g = $("input[name=google_username]", this.element).val();
			c = $("input[name=google_password]", this.element).val();
			GS.service.getGoogleAuthToken(g, c, this.callback("googAuthSuccess"), this.callback("googAuthFailed"));
			break;
		case "googleContacts":
			var h = [];
			$(".contactsContainer input:checked", this.element).each(function () {
				h.push(this.value)
			});
			h.length && GS.service.sendInvites(h, this.callback("sendInviteSuccess"), this.callback("sendInviteFailed"));
			break;
		case "facebook":
			var k = _.orEqual($("textarea[name=facebookMessage]", this.element).val(), "");
			_.count(this.fbIDs) > 0 ? _.forEach(this.fbIDs, this.callback(function (m, o) {
				GS.facebook.postToFeed(o, "http://listen.grooveshark.com/", k, this.callback("facebookSuccess"), this.callback("facebookFailed"))
			})) : GS.facebook.postToFeed("me", "http://listen.grooveshark.com/", k, this.callback("facebookSuccess"), this.callback("facebookFailed"));
			break
		}
		return false
	},
	sendInviteSuccess: function (a) {
		console.log("invite success", a);
		var b = [],
			c = [],
			g = [],
			h = [],
			k = "";
		if (a) for (var m in a) switch (a[m].status) {
		case "error":
			a[m].errorCode == -3 ? h.push(m) : b.push(m);
			break;
		case "followed":
			c.push(a[m].Username);
			break;
		case "invited":
			g.push(m);
			break
		}
		if (c.length) {
			k = (new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_FOLLOWING"), {
				list: c.join(", ")
			})).render();
			$.publish("gs.notification", {
				type: "info",
				message: k
			});
			console.log("follow", c, k)
		}
		if (g.length) {
			k = g.length > 5 ? (new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_INVITED_SUM"), {
				sum: String(g.length)
			})).render() : (new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_INVITED_LIST"), {
				list: g.join(", ")
			})).render();
			$.publish("gs.notification", {
				type: "info",
				message: k
			});
			console.log("invite", g, k)
		}
		if (h.length) {
			k = (new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_ALREADY_SENT"), {
				list: h.join(", ")
			})).render();
			$.publish("gs.notification", {
				type: "info",
				message: k
			});
			console.log("alreadySent", h, k)
		}
		if (b.length) {
			k = (new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_ERROR"), {
				list: b.join(", ")
			})).render();
			$.publish("gs.notification", {
				type: "error",
				message: k
			});
			console.log("errors", b, k)
		}
		if (this.peopleError.length) this.invalidInviteEmail();
		else if (b.length + c.length + g.length + h.length == 0) {
			this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR"));
			this.element.find(".error").show()
		} else this.sendInviteSuccessCallback()
	},
	sendInviteFailed: function (a) {
		console.warn("invite failed", a);
		this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR"));
		this.element.find(".error").show()
	},
	invalidInviteEmail: function () {
		console.warn("invalid invite email");
		var a = $("div.textboxlist", this.element).find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").filter(":last").text();
		a && this.people.indexOf(a) >= 0 && $("div.textboxlist", this.element).find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").remove();
		_.forEach(this.people, function (b) {
			$("li.textboxlist-bit:contains('" + b + "')").remove()
		});
		this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FORM_RESPONSE_INVALID_EMAIL_ERROR").html($.localize.getString("POPUP_INVITE_FORM_RESPONSE_INVALID_EMAIL_ERROR"));
		this.element.find(".error").show()
	},
	googAuthSuccess: function (a) {
		console.log("goog auth success", a);
		switch (parseInt(a.result.statusCode)) {
		case 1:
			a = String(a.result.rawResponse);
			a = a.substr(a.indexOf("Auth=") + 5);
			GS.service.getGoogleContacts(a, this.callback("googContactsSuccess"), this.callback("googContactsFailed"));
			break;
		case 2:
			this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR"));
			this.element.find(".error").show();
			break;
		default:
			this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
			this.element.find(".error").show();
			break
		}
	},
	googAuthFailed: function (a) {
		console.warn("goog auth failed", a);
		this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
		this.element.find(".error").show()
	},
	googContactsSuccess: function (a) {
		console.log("goog contacts success", a);
		switch (parseInt(a.result.statusCode, 10)) {
		case 1:
			this.googleContacts = a.result.parsedResult;
			this.showOnlyNamedContacts = true;
			this.googContactsSuccessCallback();
			break;
		case 2:
			this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR"));
			this.element.find(".error").show();
			break;
		default:
			this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
			this.element.find(".error").show();
			break
		}
	},
	googContactsFailed: function (a) {
		console.warn("goog contacts failed", a);
		this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
		this.element.find(".error").show()
	},
	facebookSuccess: function (a) {
		console.log("facebook invite success", a);
		this.facebookSuccessCallback()
	},
	facebookFailed: function (a) {
		console.warn("facebook invite failed", a);
		this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FACEBOOK_POST_ERROR").html($.localize.getString("POPUP_INVITE_FACEBOOK_POST_ERROR"));
		this.element.find(".error").show()
	},
	facebookItemClass: function (a, b, c) {
		return "contact clear" + (b >= c.length - 2 ? " last" : "")
	},
	facebookItemRenderer: function (a) {
		return ['<label class="', a.selected ? "selected" : "", '"><img src="http://graph.facebook.com/', a.id, '/picture" /><input class="facebookContact hide" type="checkbox" value="', a.id, '" ', a.selected ? "checked" : "", ' /><span class="facebookUsername">', a.name, "</span></label>"].join("")
	},
	"input keydown": function (a, b) {
		b.keyCode && b.keyCode == 13 && a.is("[name*=google]") && this.formSubmit()
	},
	"input.googleContact click": function (a) {
		$(a).is(":checked") ? $(a).closest("li.contact").addClass("selected") : $(a).closest("li.contact").removeClass("selected")
	},
	"input.facebookContact click": function (a) {
		if ($(a).is(":checked")) {
			$(a).parent().addClass("selected");
			this.fbIDs[a.val()] = a.val();
			this.facebookFriends[parseInt(a.parents("li.contact").attr("rel"), 10)].selected = true
		} else {
			$(a).parent().removeClass("selected");
			delete this.fbIDs[a.val()];
			this.facebookFriends[parseInt(a.parents("li.contact").attr("rel"), 10)].selected = false
		}
		this.slickbox.setItems(this.facebookFriends);
		if (this.submitType == "facebook") _.count(this.fbIDs) > 0 ? this.element.find(".submitButtons .submit span").attr("data-translate-text", "SEND_INVITE").html($.localize.getString("SEND_INVITE")) : this.element.find(".submitButtons .submit span").attr("data-translate-text", "POST_TO_PROFILE").html($.localize.getString("POST_TO_PROFILE"))
	},
	"button.uncheckAll click": function () {
		if (this.submitType == "facebook") {
			this.element.find(".submitButtons .submit span").attr("data-translate-text", "POST_TO_PROFILE").html($.localize.getString("POST_TO_PROFILE"));
			_.forEach(this.facebookFriends, function (a, b) {
				this.facebookFriends[b].selected = false
			}, this);
			this.fbIDs = {};
			this.slickbox.setItems(this.facebookFriends)
		} else this.submitType == "googleContacts" && $(".google_contacts input", this.element).attr("checked", false)
	},
	"button.checkAll click": function () {
		if (this.submitType == "facebook") {
			this.element.find(".submitButtons .submit span").attr("data-translate-text", "SEND_INVITE").html($.localize.getString("SEND_INVITE"));
			_.forEach(this.facebookFriends, function (a, b) {
				this.facebookFriends[b].selected = true;
				this.fbIDs[a.id] = a.id
			}, this);
			this.slickbox.setItems(this.facebookFriends)
		} else this.submitType == "googleContacts" && $(".google_contacts input", this.element).attr("checked", true)
	},
	updateFacebookForm: function () {
		$("#settings_facebook_form").html(this.view("/shared/inviteFacebook"));
		$("#settings_facebook_form .error").addClass("hide");
		$(window).resize()
	},
	updateFacebookFormWithError: function (a) {
		if (typeof a == "object" && a.error) a = a.error;
		$("#settings_facebook_form .error").html($.localize.getString(a));
		$("#settings_facebook_form .error").removeClass("hide");
		$(window).resize()
	},
	"#fbConnect-btn click": function () {
		GS.facebook.login(this.callback("updateFacebookForm"), this.callback("updateFacebookFormWithError"))
	},
	"a.fb-logout click": function () {
		GS.facebook.logout(this.callback("updateFacebookForm"))
	},
	"form#settings_facebook_form submit": function (a, b) {
		b.preventDefault();
		var c = 0;
		$("#settings_facebook_form").find("input:checkbox").not(":checked").each(function (g, h) {
			c |= $(h).val()
		});
		GS.facebook.save(c);
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.VipInterface", {
	onDocument: false,
	vipErrorCodes: {
		"GS-00": "VIP_ERROR_UNKNOWN",
		"GS-01": "VIP_ERROR_LOGIN",
		"GS-02": "VIP_ERROR_ALREADY_VIP",
		"CC-01": "VIP_ERROR_MISSING_NAME",
		"CC-02": "VIP_ERROR_UNKNOWN",
		"CC-03": "VIP_ERROR_MISSING_CC_INFO",
		"CC-04": "VIP_ERROR_ADDRESS",
		"CC-05": "VIP_ERROR_UNKNOWN",
		"CC-06": "VIP_ERROR_PAYMENT_PROCESSOR",
		"CC-07": "VIP_ERROR_SESSION_EXPIRED",
		"CC-08": "VIP_ERROR_INVALID_CC",
		"CC-09": "VIP_ERROR_MISSING_CVD",
		"CC-10": "VIP_ERROR_INVALID_CVD",
		"CC-11": "VIP_ERROR_ADDRESS1_TOO_LONG",
		"CC-000": "VIP_ERROR_GENERIC_PAYMENT_ERROR",
		"CC-000X": "VIP_ERROR_GENERIC_PAYMENT_ERROR",
		"PP-01": "VIP_ERROR_UNKNOWN",
		"PP-02": "VIP_ERROR_UNKNOWN_PAYPAL",
		"PP-03": "VIP_ERROR_UNKNOWN",
		"PP-04": "VIP_ERROR_PAYPAL_CANCEL",
		"PP-000": "VIP_ERROR_PAYPAL_FAIL",
		"PP-000X": "VIP_ERROR_PAYPAL_FAIL",
		"PC-01": "VIP_ERROR_NO_PROMOCODE",
		"PC-02": "VIP_ERROR_CODE_NOT_FOUND",
		"PC-03": "VIP_ERROR_CODE_REDEEMED"
	},
	excludedCreditCardCountries: {
		AF: true,
		AL: true,
		AM: true,
		AO: true,
		AZ: true,
		BA: true,
		BD: true,
		BG: true,
		BI: true,
		BY: true,
		CD: true,
		CF: true,
		CG: true,
		CK: true,
		CS: true,
		CU: true,
		DZ: true,
		EG: true,
		ER: true,
		ET: true,
		GE: true,
		GT: true,
		HT: true,
		ID: true,
		IQ: true,
		IR: true,
		KG: true,
		KH: true,
		KP: true,
		KZ: true,
		LA: true,
		LR: true,
		LY: true,
		MD: true,
		MK: true,
		MM: true,
		MN: true,
		MY: true,
		NG: true,
		NR: true,
		PH: true,
		PK: true,
		RO: true,
		RU: true,
		RW: true,
		SD: true,
		SL: true,
		SR: true,
		SY: true,
		TJ: true,
		TM: true,
		UA: true,
		UZ: true,
		VE: true,
		YE: true,
		ZW: true
	}
}, {
	vipPackages: {
		plus: "plus",
		anywhere: "anywhere",
		vip: "vip"
	},
	vipPackagePrices: {
		month: {
			plus: 6,
			anywhere: 9,
			vip: 3
		},
		year: {
			plus: 60,
			anywhere: 90,
			vip: 30
		}
	},
	showVipErrors: function (a) {
		if (a.errorID && a.message) a.error = [{
			errorID: a.errorID,
			message: a.message
		}];
		var b, c = ['<ul class="errors">'];
		this.element.find(".error.response .message").html("");
		this.element.find(".error.response").hide();
		if (a.error && a.error.length) {
			_.forEach(a.error, this.callback(function (g) {
				if (b = $.trim($.localize.getString(GS.Controllers.Lightbox.VipSignupController.vipErrorCodes[g.errorID]))) c.push("<li>" + b + "</li>");
				else {
					console.error("unknown error in arr", g.errorID, g.message);
					b = _.isString(g.message) ? g.message : g.message[0];
					if (b.match("AVS")) b = $.localize.getString("VIP_ERROR_AVS");
					else if (b.match("invalid XML")) b = $.localize.getString("VIP_ERROR_XML");
					else if (b.match("invalid card number")) b = $.localize.getString("VIP_ERROR_CARD_NUMBER");
					else if (b.match("CVD check")) b = $.localize.getString("VIP_ERROR_CVD");
					b && c.push("<li>" + b + "</li>")
				}
			}));
			c.push("</ul>");
			a = this.element.find(".error").show().find(".message");
			a.html("<strong>" + $.localize.getString("POPUP_VIP_ERROR_MESSAGE") + "</strong> " + c.join(""))
		} else {
			this.element.find(".message").attr("data-translate-text", "VIP_ERROR_UNKNOWN").html($.localize.getString("VIP_ERROR_UNKNOWN"));
			this.element.find(".error").show()
		}
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.HomeController", {}, {
	init: function (a, b) {
		this.update(b);
		this.subscribe("window.resize", this.callback("resize"));
		$(document).keydown(this.callback(function (c) {
			if (!($(c.target).is("input,textarea,object") && !$(c.target).is("#searchBar_input input"))) {
				this.toggleHint({}, c);
				var g = _.orEqual(c.keyCode, c.which),
					h = String.fromCharCode(g).replace(/\s+/g, ""),
					k = {
						17: true,
						37: true,
						38: true,
						39: true,
						40: true
					};
				$("#page").is(".gs_page_home") && !$(c.target).is("input,textarea,object") && h.length && h != "" && !k[g] && $("input.search.autocomplete", this.element).focus();
				if (String.fromCharCode(g) == " " && $(c.target).val().length == 0) return false
			}
		}))
	},
	update: function () {
		if (!GS.lightbox || !GS.lightbox.isOpen) $("input.search.autocomplete", this.element).focus();
		$(".home_settings").toggleClass("hide", GS.user.isLoggedIn);
		$(".home_upgrade").toggleClass("hide", !GS.user.isLoggedIn);
		$.publish("gs.page.home.update")
	},
	index: function () {
		this._super();
		this.addAutocomplete("home");
		this.resize();
		this.subscribe("window.resize", this.callback("resize"));
		this.subscribe("gs.auth.update", this.callback("update"));
		GS.Controllers.PageController.title("Listen to Free Music Online - Internet Radio - Free MP3 Streaming", false);
		$.publish("gs.page.home.view")
	},
	resize: function () {
		var a = $("#homeSearch"),
			b = 500;
		if (a.length) {
			b = Math.max(250, Math.min(500, $(this.element).width() - 200));
			a.width(b).css("marginLeft", -Math.round(b / 2))
		}
	},
	toggleHint: function (a, b) {
		if (b.type == "mousedown") $("#searchBar_input input").val() == "" && b.button != 2 ? $("#searchBar_hint").show().addClass("faded") : $("#searchBar_hint").hide();
		else if (b.type == "keyup" || b.type == "keydown") {
			var c = String.fromCharCode(_.orEqual(b.keyCode, b.which)).replace(/[\b]/g, "");
			if (String.fromCharCode(_.orEqual(b.keyCode, b.which)).replace(/[\s]/g, "").length > 0) $("#searchBar_input input").val() == "" && c.length < 1 ? $("#searchBar_hint").show().addClass("faded") : $("#searchBar_hint").hide()
		} else $("#searchBar_input input").val() == "" ? $("#searchBar_hint").show().removeClass("faded") : $("#searchBar_hint").hide()
	},
	"#homeSearch submit": function (a, b) {
		if ($("input[name=q]", a).val() === "") {
			b.stopImmediatePropagation();
			return false
		}
		return true
	},
	"#searchButton click": function () {
		$("#homeSearch").submit()
	},
	"#searchBar_input span click": function () {
		$("input.search.autocomplete", this.element).focus();
		$("#searchBar_hint").addClass("faded")
	},
	"#homePage keydown": function () {
		$("input.search.autocomplete", this.element).focus()
	},
	"input.search.autocomplete mousedown": function (a, b) {
		return this.toggleHint(a, b)
	},
	"input.search.autocomplete keyup": function (a, b) {
		return this.toggleHint(a, b)
	},
	"input.search.autocomplete focusout": function (a, b) {
		if ($("#searchBar_input input").hasClass("focused")) {
			setTimeout(function () {
				$("input.search.autocomplete", "#page").focus()
			}, 0);
			$("#searchBar_input input").removeClass("focused");
			return true
		} else return this.toggleHint(a, b)
	},
	"a.themes click": function () {
		GS.lightbox.open("themes")
	},
	notFound: function () {
		this.element.html(this.view("not_found"));
		this.addAutocomplete("home");
		this.resize();
		this.subscribe("window.resize", this.callback("resize"));
		this.subscribe("gs.auth.update", this.callback("update"));
		GS.Controllers.PageController.title("Unable To Find What You're Looking For")
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.NowPlayingController", {}, {
	index: function () {
		GS.Controllers.PageController.title("Now Playing");
		this.element.html(this.view("index"));
		$("input.search").select();
		this.list.doSearchInPage = true;
		this.loadGrid(GS.player.getCurrentQueue());
		this.subscribe("gs.player.queue.change", this.callback("loadGrid"))
	},
	loadGrid: function (a) {
		if ($("#page").is(".gs_page_now_playing")) {
			console.log("nowplaying.loadgrid. queue: ", a);
			if (!a) {
				a = GS.player.getCurrentQueue();
				if (!a) {
					this.element.find(".gs_grid").html(this.view("/shared/noResults", {
						type: "song"
					}));
					$("#searchForm input").select();
					this.addAutocomplete("now_playing");
					return
				}
			}
			this.queue = a;
			var b = a.songs.length > 0 && a.songs[0] instanceof GS.Models.Song ? a.songs : GS.Models.Song.wrapQueue(a.songs),
				c = this.element.find(".gs_grid").controller(),
				g = {
					sortCol: "Sort",
					sortDir: 1,
					sortStoreKey: "gs.sort.nowPlaying.songs"
				};
			g = $.extend(g, {
				allowDuplicates: true,
				allowDragSort: true,
				isNowPlaying: true
			});
			for (var h = 1; h < b.length; h++) b[h].Sort = h;
			if (c) {
				g = c.dataView;
				var k = c.grid;
				if (g) {
					g.beginUpdate();
					var m = b.concat(),
						o = g.getItems().concat(),
						r;
					for (h = 0; h < o.length; h++) {
						song = o[h];
						r = m.indexOf(song);
						r != -1 && m.splice(r, 1);
						g.getIdxById(song.SongID);
						curInd = b.indexOf(song);
						curInd == -1 ? g.deleteItem(song.SongID) : g.updateItem(song.GridKey, song)
					}
					m.length && g.addItems(m, "SongID");
					g.endUpdate();
					g.refresh()
				}
				k && k.onSort(c.sortCol, c.sortDir)
			} else if (b.length) {
				g.rowCssClasses = this.callback(function (s) {
					var u = "";
					a = GS.player.getCurrentQueue();
					if (a.activeSong && a.activeSong.queueSongID == s.queueSongID) u += "active";
					if (a.autoplayEnabled) u += " autoplay";
					return u
				});
				g.rowAttrs = function (s) {
					return ["rel='", s.queueSongID, "' rel2='", s.SongID, "'"].join("")
				};
				this.element.find(".gs_grid").gs_grid(b, GS.Controllers.GridController.columns.queuesong, g, "song")
			} else {
				this.element.find(".gs_grid").html(this.view("/shared/noResults", {
					type: "now_playing"
				}));
				$("#searchForm input").select();
				this.addAutocomplete("now_playing")
			}
			a.hasRestoreQueue ? $("#page_header button.clearRestore .restore").show().siblings().hide() : $("#page_header button.clearRestore .clears").show().siblings().hide();
			$("#grid .slick-row.active").removeClass("active");
			if (a.activeSong) {
				$("#grid .slick-row[rel=" + a.activeSong.queueSongID + "]").addClass("active");
				GS.player.isPlaying ? $("#grid .slick-row.active a.play").removeClass("paused") : $("#grid .slick-row.active a.play").addClass("paused")
			}
		}
	},
	"button.delete click": function () {
		var a = [],
			b = this.element.find(".gs_grid").controller();
		if (b) {
			var c = b.grid.getSelectedRows();
			if (c.length !== 0) {
				for (var g = 0; g < c.length; g++) a.push(b.dataView.getItemByIdx(c[g]).queueSongID);
				GS.player.removeSongs(a);
				b.grid.setSelectedRows([]);
				b.selectedRowIDs = [];
				$.publish("gs.grid.selectedRows", {
					len: 0,
					type: "song"
				})
			}
		}
	},
	"button.save click": function (a, b) {
		console.log("nowplaying button.save", a, b);
		var c, g = [],
			h = GS.player.getCurrentQueue().songs;
		for (c = 0; c < h.length; c++) g.push(h[c].SongID);
		GS.lightbox.open("newPlaylist", g);
		GS.guts.logEvent("queueSaveInitiated", {})
	},
	"button.clearRestore click": function (a) {
		if (GS.player.getCurrentQueue().hasRestoreQueue) {
			GS.player.restoreQueue();
			a.find(".restore").show().siblings().hide()
		} else {
			GS.player.clearQueue();
			a.find(".clears").show().siblings().hide()
		}
	},
	".slick-row .smile click": function (a, b) {
		b.stopImmediatePropagation();
		console.log("nowplaying.smile click", a, b);
		var c = a.parents(".slick-row").attr("row");
		c = $("#grid").controller().dataView.getItemByIdx(c).queueSongID;
		GS.player.voteSong(c, 1);
		$(a).addClass("selected").siblings(".frown").removeClass("selected")
	},
	".slick-row .frown click": function (a, b) {
		b.stopImmediatePropagation();
		console.log("nowplaying.frown click", a.get(), b);
		var c = a.parents(".slick-row").attr("row");
		c = $("#grid").controller().dataView.getItemByIdx(c).queueSongID;
		GS.player.voteSong(c, -1);
		$(a).addClass("selected").siblings(".smile").removeClass("selected")
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.PopularController", {}, {
	index: function (a) {
		this.pageType = a = _.orEqual(a, "daily");
		this.type = "popular";
		GS.Controllers.PageController.title("Popular Music: " + _.ucwords(a));
		this.element.html(this.view("index"));
		$("input.search").select();
		this.list.doSearchInPage = true;
		this.popular = GS.Models.Popular.getType(a);
		this.popular.getSongs(this.callback("loadGrid"))
	},
	loadGrid: function (a) {
		var b, c = {
			sortCol: "Popularity",
			sortDir: true,
			sortStoreKey: "gs.sort.popular"
		};
		if (a.length) {
			b = GS.Controllers.GridController.columns.song.concat();
			b = [b[0], b[1], b[2]];
			this.element.find(".gs_grid").gs_grid(a, b, c, "song")
		} else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "song"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("popular")
		}
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.SettingsController", {}, {
	user: null,
	settings: null,
	desktopPrefs: null,
	index: function (a) {
		if ($("#page").is(".gs_page_settings")) {
			this.pageType = a || "profile";
			console.log("gs.page.settings", GS.user);
			if (!GS.user.isLoggedIn) if (this.pageType !== "preferences" && this.pageType !== "subscriptions") this.pageType = "preferences";
			GS.user.settings.getUserSettings(this.callback("loadSettings"), GS.router.notFound);
			this.subscribe("gs.auth.update", this.callback("index"));
			this.subscribe("gs.auth.favorites.users.update", this.callback("updateActivityUsersForm"));
			this.subscribe("gs.facebook.profile.update", this.callback("updateFacebookForm"));
			this.subscribe("gs.lastfm.profile.update", this.callback("updateLastfmForm"));
			this.subscribe("gs.google.profile.update", this.callback("updateGoogleForm"));
			this.subscribe("gs.settings.upload.onload", this.callback("iframeOnload"))
		}
	},
	loadSettings: function () {
		if ($("#page").is(".gs_page_settings")) {
			this.user = GS.user;
			this.settings = GS.user.settings;
			this.desktopPrefs = GS.airbridge.getDesktopPreferences();
			this.element.html(this.view("index"));
			switch (this.pageType) {
			case "profile":
				GS.Controllers.PageController.title("Settings");
				this.showProfile();
				break;
			case "password":
				GS.Controllers.PageController.title("Change Password");
				this.showPassword();
				break;
			case "preferences":
				GS.Controllers.PageController.title("Preferences");
				this.showPreferences();
				break;
			case "services":
				GS.Controllers.PageController.title("Services Settings");
				this.showServices();
				break;
			case "activity":
				GS.Controllers.PageController.title("Activity Settings");
				this.showActivity();
				break;
			case "subscriptions":
				GS.Controllers.PageController.title("Subscriptions Settings");
				GS.user.isLoggedIn ? GS.service.getSubscriptionDetails(this.callback("showSubscriptions"), this.callback("showSubscriptions")) : this.showSubscriptions(false);
				break;
			case "extras":
				GS.Controllers.PageController.title("Extras");
				this.showExtras();
				break
			}
		}
	},
	showProfile: function () {
		this.today = new Date;
		this.dob = new Date;
		if (this.settings.TSDOB) {
			var a = this.settings.TSDOB.split("-");
			this.dob = new Date(parseInt(a[0], 10), parseInt(a[1], 10) - 1, parseInt(a[2], 10))
		}
		this.months = $.localize.getString("MONTHS").split(",");
		this.countries = _.countries;
		this.element.find("#page_pane").html(this.view("profile"));
		$(window).resize();
		$(".selectbox.country span").html($("select.country option:selected").html());
		$(".selectbox.month span").html($("select.month option:selected").html())
	},
	showPassword: function () {
		this.element.find("#page_pane").html(this.view("password"));
		$(window).resize()
	},
	showServices: function () {
		this.element.find("#page_pane").html(this.view("services"));
		this.updateFacebookForm();
		this.updateLastfmForm();
		this.updateGoogleForm();
		$(window).resize()
	},
	showPreferences: function () {
		$(window).resize();
		this.element.find("#page_pane").html(this.view("preferences"));
		if (this.desktopPrefs) {
			$("#desktop_selected_notifDuration", this.element).localeDataString("NUM_SECONDS", {
				seconds: this.desktopPrefs.notifications.duration
			});
			$("option.notifDuration", this.element).each(function () {
				$(this).localeDataString("NUM_SECONDS", {
					seconds: $(this).val()
				})
			})
		}
	},
	showActivity: function () {
		this.settings.privacy = GS.service.privacy;
		this.element.find("#page_pane").html(this.view("activity"));
		this.hideUsers = new $.TextboxList("#settings_usersToHide", {
			addOnBlur: false,
			plugins: {
				autocomplete: {
					placeholder: $.localize.getString("SETTINGS_USER_HIDE_PLACEHOLDER")
				}
			},
			encode: this.callback(function (a) {
				for (var b = [], c = 0; c < a.length; c++) a[c][0] ? b.push(a[c][0]) : b.push(a[c][1]);
				return b.join(",")
			})
		});
		this.hideUsers.addEvent("bitAdd", this.callback("bitCheck"));
		this.updateActivityUsersForm();
		$(window).resize()
	},
	showSubscriptions: function (a) {
		this.data = a;
		this.noData = true;
		this.recurring = this.bVip = this.bAnywhere = this.bPlus = this.hasSpecialVip = false;
		this.billingAmount = this.nextBillingDate = this.paymentType = this.subscriptionType = "";
		this.anywhereMonthPrice = 9;
		this.plusMonthPrice = 6;
		if (a === false || a.fault || a.code || a.bVip && _.notDefined(a.paymentType)) {
			this.noData = true;
			this.recurring = _.orEqual(a.bRecurring, false);
			this.bAnywhere = this.bPlus = false;
			if (GS.user.IsPremium) this.hasSpecialVip = true;
			if (a && a.bVip) this.bVip = parseInt(a.bVip, 10)
		} else {
			this.noData = false;
			switch (a.paymentType) {
			case "OPTIMAL_PAYMENTS":
				this.paymentMethod = $.localize.getString("CREDIT_CARD");
				break;
			case "PAYPAL":
				this.paymentMethod = $.localize.getString("PAYPAL");
				break;
			case "FREE_TRIAL":
				this.paymentMethod = $.localize.getString("FREE_TRIAL");
				break;
			case "ZONG":
				this.paymentMethod = $.localize.getString("ZONG");
				break;
			case "ALLOPASS":
				this.paymentMethod = $.localize.getString("ALLOPASS");
				break;
			case "GWALLET":
				this.paymentMethod = $.localize.getString("GWALLET");
				break;
			case "TRIAL_PAY":
				this.paymentMethod = $.localize.getString("TRIAL_PAY");
				break;
			default:
				this.paymentMethod = _.orEqual(a.paymentType, "")
			}
			this.subscriptionType = a.subscriptionType;
			this.paymentType = a.paymentType;
			this.billingAmount = "$" + a.amount;
			this.recurring = a.bRecurring;
			this.bVip = parseInt(a.bVip, 10);
			this.bAnywhere = (GS.user.Flags & GS.Models.User.FLAG_ANYWHERE) > 0;
			this.bPlus = (GS.user.Flags & GS.Models.User.FLAG_PLUS) > 0;
			try {
				var b = this.recurring ? a.dateNextCheck.split("-") : a.dateEnd.split("-");
				this.nextBillingDate = (new Date(parseInt(b[0], 10), parseInt(b[1], 10) - 1, parseInt(b[2], 10))).format("F j, Y")
			} catch (c) {
				console.error("subPage error:", c);
				this.nextBillingDate = $.localize.getString("UNKNOWN")
			}
		}
		if (this.bVip) this.plusMonthPrice = this.anywhereMonthPrice = 3;
		this.element.find("#page_pane").html(this.view("subscriptions"));
		$(window).resize()
	},
	showExtras: function () {
		this.element.find("#page_pane").html(this.view("extras"));
		swfobject.embedSWF("/webincludes/flash/InstallDesktop.swf", "installAirApp", "330", "180", "9.0.0", null, {
			bgcolor: "#eeeeee"
		});
		$(window).resize()
	},
	paymentTypeToString: function (a) {
		var b = "";
		switch (a) {
		case "FREE_TRIAL":
			break;
		default:
			b = $.localize.getString("SUBSCRIPTIONS_UNKNOWN_PAYMENT_TYPE")
		}
		return b
	},
	bitCheck: function (a) {
		this.userInfo[a.getValue()[1]] || a.hide()
	},
	updateActivityUsersForm: function () {
		console.log("updating users friend activity settings");
		this.hiddenUsers = GS.user.filterFriends(1);
		this.visibleUsers = GS.user.filterOutFriends(1);
		this.element.find("#hiddenUsers").html(this.view("hiddenUsers"));
		this.element.find("#settings_usersToHide").val("");
		this.element.find(".textboxlist-bit-box-deletable").remove();
		this.userInfo = {};
		var a = [];
		$.each(this.visibleUsers, this.callback(function (b, c) {
			a.push([c.UserID, c.Username, c.Username, c.Username]);
			this.userInfo[c.UserID] = c;
			this.userInfo[c.Username] = c
		}));
		_.defined(this.hideUsers) && this.hideUsers.plugins && this.hideUsers.plugins.autocomplete.setValues(a)
	},
	"#settings_userInfo submit": function (a, b) {
		b.preventDefault();
		console.log("settings userinfo submit", a, b);
		var c = $("input[name=fname]", a).val(),
			g = $("input[name=email]", a).val(),
			h = $("select[name=country]", a).val(),
			k = $("input[name=zip]", a).val(),
			m = $("input[name=sex]:checked", a).val(),
			o = [$("select[name=year]", a).val(), parseInt($("select[name=month]", a).val(), 10), $("select[name=day]", a).val()].join("-"),
			r = new Date,
			s = new Date(parseInt($("select[name=year]", a).val(), 10), parseInt($("select[name=month]", a).val(), 10), parseInt($("select[name=day]", a).val(), 10));
		r = Math.round((r.getTime() - s.getTime()) / 31536E6);
		c = {
			FName: c,
			Email: g,
			Country: h,
			Zip: k,
			Sex: m,
			TSDOB: o
		};
		if (r > 13) GS.user.settings.updateProfile(c, this.callback(this._userInfoSuccess), this.callback(this._userInfoFailed));
		else {
			this.userInfoFailed({
				error: $.localize.getString("POP_SIGNUP_FORM_TOO_YOUNG")
			});
			$.publish("gs.notification", {
				type: "error",
				message: $.localize.getString("POP_SIGNUP_FORM_TOO_YOUNG")
			})
		}
		return false
	},
	_userInfoSuccess: function () {
		$("#settings_userInfo .buttons .status").addClass("success")
	},
	_userInfoFailed: function (a) {
		$("#settings_userInfo .buttons .status").addClass("failure");
		switch (a.statusCode) {
		case 0:
			$.publish("gs.notification", {
				type: "error",
				message: $.localize.getString("POPUP_INCORRECT_PASSWORD")
			});
			break;
		case -2:
			$.publish("gs.notification", {
				type: "error",
				message: $.localize.getString("POPUP_EMAIL_INVALID")
			});
			break;
		case -3:
			$.publish("gs.notification", {
				type: "error",
				message: $.localize.getString("POPUP_NAME_CANNOT_BE_EMPTY")
			});
			break;
		case -4:
			$.publish("gs.notification", {
				displayDuration: 1E4,
				type: "error",
				message: $.localize.getString("POPUP_EMAIL_TAKEN")
			});
			break;
		default:
			$.publish("gs.notification", {
				type: "error",
				message: $.localize.getString("POPUP_UNABLE_SAVE_SETTINGS")
			})
		}
	},
	"#uploadPath change": function (a) {
		a = $(a).val();
		a = a.replace(/.+\\/g, "");
		if (a.length > 20) a = a.substr(0, 20) + "&hellip;";
		$("#uploadLabel").html(a)
	},
	isFormOnload: false,
	"#settings_profilePicture submit": function (a, b) {
		console.log("settings profilepic submit", a, b);
		$("#settings_profilePicture .buttons .status").text($.localize.getString("LOADING...")).show();
		return this.isFormOnload = true
	},
	iframeOnload: function (a, b) {
		console.log("iframe.upload.onload", a, b);
		$("#settings_profilePicture .buttons .status").text("");
		var c = a.contentWindow || a.get().contentDocument,
			g;
		if (c.document) c = c.document;
		c = c.body.innerHTML;
		console.log("iframe.upload.resp str", c);
		if (c) {
			try {
				g = $.parseJSON(c)
			} catch (h) {
				g = {}
			}
			console.log("json", g);
			if (!g || !g.success || !g.filename) {
				g = g || {};
				g.error && g.error.code && (g.error.code == 1 || g.error.code == 2) ? $.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("POPUP_UPLOAD_IMAGE_TOO_BIG")
				}) : $.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("POPUP_UNABLE_UPLOAD_IMAGE")
				});
				$("#settings_profilePicture .buttons .status").addClass("failure")
			} else {
				$("#settings_profilePicture .buttons .status").addClass("success");
				c = $("#settings_profilePicture").find("img");
				console.log("change img", c);
				GS.user.Picture = g.filename;
				c.attr("src", GS.user.getImageURL() + "?r=" + (new Date).getTime())
			}
		} else if (this.isFormOnload) {
			$.publish("gs.notification", {
				type: "error",
				message: $.localize.getString("POPUP_UNABLE_UPLOAD_IMAGE")
			});
			$("#settings_profilePicture .buttons .status").addClass("failure")
		}
		return this.isFormOnload = false
	},
	"#settings_changePassword submit": function (a, b) {
		b.preventDefault();
		console.log("settings changepass submit", a, b);
		var c = $("input[name=oldPass]", a).val(),
			g = $("input[name=newPass]", a).val(),
			h = $("input[name=confirmPass]", a).val();
		g == h && c.length > 4 && g.length > 4 ? GS.user.changePassword(c, g, this.callback(this._passwordSuccess), this.callback(this._passwordFailed)) : $.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_SIGNUP_FORM_PASSWORD_INVALID_NO_MATCH")
		});
		return false
	},
	_passwordSuccess: function () {
		$("#settings_changePassword .buttons .status").addClass("success")
	},
	_passwordFailed: function () {
		$("#settings_changePassword .buttons .status").addClass("failure")
	},
	"#settings_changePassword a.forgot click": function () {
		GS.lightbox.open("forget")
	},
	"#settings_notifications submit": function (a, b) {
		b.preventDefault();
		var c = {
			userFollow: $("#settings_notifications_userFollow").is(":checked"),
			inviteSignup: $("#settings_notifications_userSignup").is(":checked"),
			playlistSubscribe: $("#settings_notifications_userSubscribe").is(":checked"),
			newFeature: $("#settings_notifications_newFeature").is(":checked")
		};
		console.log("settings notification submit", c);
		GS.user.settings.changeNotificationSettings(c, this.callback(this._notificationsSuccess), this.callback(this._notificationsFailed));
		return false
	},
	_notificationsSuccess: function (a) {
		$("#settings_notifications .buttons .status").addClass("success");
		console.log("settings notification SUCCESS", a)
	},
	_notificationsFailed: function (a) {
		$("#settings_notifications .buttons .status").addClass("failure");
		$.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_UNABLE_SAVE_NOTIFICATION")
		});
		console.log("settings notification FAILED", a)
	},
	"#settings_feeds submit": function (a, b) {
		b.preventDefault();
		var c = {
			favorites: $("#settings_feeds_favorites").is(":checked"),
			listens: $("#settings_feeds_listens").is(":checked")
		};
		console.log("settings feeds submit", c);
		GS.user.settings.changeRSSSettings(c, this.callback(this._feedSuccess), this.callback(this._feedFailed));
		return false
	},
	_feedSuccess: function (a) {
		$("#settings_feeds .buttons .status").addClass("success");
		console.log("settings feeds SUCCESS", a)
	},
	_feedFailed: function (a) {
		$("#settings_feeds .buttons .status").addClass("failure");
		$.publish("gs.notification", {
			type: "error",
			message: $.localize.getString("POPUP_UNABLE_SAVE_FEED")
		});
		console.log("settings feeds FAILED", a)
	},
	"select blur": function (a) {
		a.change()
	},
	"select keydown": function (a) {
		a.change()
	},
	"select.country change": function (a) {
		$(".selectbox.country span").text(a.find("option:selected").html())
	},
	"select.month change": function (a) {
		$(".selectbox.month span").text(a.find("option:selected").html())
	},
	"select.day change": function (a) {
		$(".selectbox.day span").text(a.find("option:selected").html())
	},
	"select.year change": function (a) {
		$(".selectbox.year span").text(a.find("option:selected").html())
	},
	"select.crossfadeSecs change": function (a) {
		$(".selectbox.crossfadeSecs span").text(a.find("option:selected").html())
	},
	"select.notifPosition change": function (a) {
		$(".selectbox.notifPosition span").text(a.find("option:selected").html())
	},
	"select.notifDuration change": function (a) {
		$(".selectbox.notifDuration span").text(a.find("option:selected").html())
	},
	"li.genderOrientation mousedown": function (a) {
		$(a).data("previous", $("#settings_userInfo input[name=sex]:checked").val())
	},
	"li.genderOrientation click": function (a, b) {
		var c = $("input", a);
		if ($(c).val() === $(a).data("previous")) {
			$("#gender_none").attr("checked", "checked");
			b.preventDefault();
			$(c).blur();
			return false
		}
	},
	"form :input change": function (a) {
		$(a).closest("form").find(".buttons .status").removeClass("success").removeClass("failure")
	},
	"#settings_localSettings button.clearLocal click": function (a, b) {
		b.preventDefault();
		store && store.clear && store.clear();
		$("#settings_localSettings .buttons .status").addClass("success");
		return false
	},
	"#settings_localSettings submit": function (a, b) {
		b.preventDefault();
		console.log("settings localsettings submit", a, b);
		var c = {
			restoreQueue: $("input[name=restoreQueue]:checked", a).length ? 1 : 0,
			persistShuffle: $("input[name=persistShuffle]:checked", a).length ? 1 : 0,
			lowerQuality: $("input[name=lowerQuality]:checked", a).length ? 1 : 0,
			noPrefetch: $("input[name=noPrefetch]:checked", a).length ? 1 : 0,
			playPauseFade: $("input[name=doCrossfade]:checked", a).length ? 1 : 0,
			crossfadeAmount: $("select[name=crossfadeSecs]", a).val() * 1E3,
			tooltips: $("input[name=tooltips]:checked", a).length ? 1 : 0
		};
		GS.user.settings.changeLocalSettings(c, this.callback(this._localSettingSuccess), this.callback(this._localSettingFailed));
		return false
	},
	_localSettingSuccess: function () {
		$("#settings_localSettings .buttons .status").addClass("success").removeClass("failure")
	},
	_localSettingFailed: function () {
		$("#settings_localSettings .buttons .status").addClass("failure").removeClass("success")
	},
	"#settings_activity_privacy submit": function (a, b) {
		b.preventDefault();
		console.log("settings.activity privacy submit", a, b);
		switch ($(a).find("input:checked").val()) {
		case "-1":
			GS.service.privacy = 1;
			$("#settings_activity_privacy .buttons .status").addClass("success");
			break;
		case "0":
			GS.service.privacy = GS.user.Privacy = 0;
			GS.service.changePrivacySettings(0, this.callback("changePrivacySuccess"), this.callback("changePrivacyFailure"));
			break;
		case "1":
			GS.service.privacy = GS.user.Privacy = 1;
			GS.service.changePrivacySettings(1, this.callback("changePrivacySuccess"), this.callback("changePrivacyFailure"));
			break
		}
		return false
	},
	changePrivacySuccess: function (a) {
		if (!a || a.statusCode !== 1) this.changePrivacyFailed(a);
		else {
			$("#settings_activity_privacy .buttons .status").addClass("success");
			GS.service.reportUserChange(GS.user.UserID, GS.user.Username, GS.user.Privacy);
			console.log("settings changePrivacy SUCCESS", a)
		}
	},
	changePrivacyFailed: function (a) {
		$("#settings_activity_privacy .buttons .status").addClass("failure");
		console.log("settings changePrivacy FAILED", a)
	},
	"#settings_activity_users submit": function (a, b) {
		b.preventDefault();
		var c = ($("#settings_usersToHide").val() || "").split(","),
			g = [];
		for (i = 0; i < c.length; i++) this.userInfo[c[i]] && g.push({
			userID: this.userInfo[c[i]].UserID,
			flags: 1
		});
		GS.user.changeFollowFlags(g);
		return false
	},
	"#settings_activity_users button.showUser click": function (a) {
		a = [{
			userID: parseInt($(a).attr("data-userID"), 10),
			flags: 0
		}];
		GS.user.changeFollowFlags(a)
	},
	updateFacebookForm: function () {
		$("#settings_facebook_form").html(this.view("facebook_form"));
		$("#settings_facebook_form .error").addClass("hide");
		$(window).resize()
	},
	updateFacebookFormWithError: function (a) {
		if (typeof a == "object" && a.error) a = a.error;
		$("#settings_facebook_form .error").html($.localize.getString(a));
		$("#settings_facebook_form .error").removeClass("hide");
		$(window).resize()
	},
	"#fbConnect-btn click": function () {
		GS.facebook.login(this.callback("updateFacebookForm"), this.callback("updateFacebookFormWithError"))
	},
	"a.fb-logout click": function () {
		GS.facebook.logout(this.callback("updateFacebookForm"))
	},
	"form#settings_facebook_form submit": function (a, b) {
		b.preventDefault();
		var c = 0;
		$("#settings_facebook_form").find("input:checkbox").not(":checked").each(function (g, h) {
			c |= $(h).val()
		});
		GS.facebook.save(c);
		return false
	},
	updateGoogleForm: function () {
		this.element.find("#settings_google_form").html(this.view("google_form"));
		this.element.find("#settings_google_form .error").addClass("hide");
		$(window).resize()
	},
	updateGoogleFormWithError: function (a) {
		if (!a || !a.error) a = {
			error: "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR"
		};
		this.element.find("#settings_google_form .error").html($.localize.getString(a.error)).removeClass("hide");
		$(window).resize()
	},
	"#googleLogin-btn click": function () {
		GS.google.login(this.callback("updateGoogleForm"), this.callback("updateGoogleFormWithError"))
	},
	"a.google-logout click": function () {
		GS.google.logout(this.callback("updateGoogleForm"))
	},
	updateLastfmForm: function () {
		console.log("UPDATE LASTFM FORM");
		this.element.find("#settings_lastfm_form").html(this.view("lastfm_form"));
		$(window).resize()
	},
	"#lastfmConnect-btn click": function (a, b) {
		b.preventDefault();
		GS.user.UserID > 0 && GS.user.IsPremium ? GS.lastfm.authorize(this.callback("updateLastfmForm")) : GS.lightbox.open("vipOnlyFeature");
		return false
	},
	"a.lastfm-logout click": function () {
		GS.lastfm.logout(this.callback("updateLastfmForm"))
	},
	"#settings_userSubscriptions button.upgrade click": function (a, b) {
		b.preventDefault();
		var c, g = !this.noData && !this.recurring ? 1 : 0;
		if (a.is(".plus")) {
			c = this.bVip ? "vip" : "plus";
			GS.user.isLoggedIn ? GS.lightbox.open("vipSignup", {
				vipPackage: c,
				bExtend: g
			}) : GS.lightbox.open("signup", {
				vipPackage: c,
				bExtend: g
			})
		} else if (a.is(".anywhere")) {
			c = this.bVip ? "vip" : "anywhere";
			GS.user.isLoggedIn ? GS.lightbox.open("vipSignup", {
				vipPackage: c,
				bExtend: g
			}) : GS.lightbox.open("signup", {
				vipPackage: c,
				bExtend: g
			})
		} else {
			c = this.bVip ? "vip" : "anywhere";
			GS.user.isLoggedIn ? GS.lightbox.open("vipSignup", {
				initOffers: true,
				vipPackage: c,
				bExtend: g
			}) : GS.lightbox.open("signup", {
				vipPackage: c,
				bExtend: g
			})
		}
		return false
	},
	"#settings_userSubscriptions button.extend click": function (a, b) {
		b.preventDefault();
		var c;
		c = this.subscriptionType.match("Anywhere") ? "anywhere" : this.subscriptionType.match("Plus") ? "plus" : this.bVip == true || this.bVip == 1 ? "vip" : "plus";
		c === "vip" || c === "anywhere" ? GS.lightbox.open("vipSignup", {
			bExtend: 1,
			vipPackage: this.bVip ? "vip" : c
		}) : GS.lightbox.open("signup", {
			gotoUpgrade: true,
			bExtend: 1,
			vipPackage: this.bVip ? "vip" : c
		})
	},
	"#settings_userSubscriptions button.cancel click": function (a, b) {
		b.preventDefault();
		GS.lightbox.open("vipCancel");
		return false
	},
	"a.feedback click": function () {
		GS.user.IsPremium && GS.lightbox.open("feedback")
	},
	"p.finePrint a.login click": function () {
		GS.lightbox.open("login")
	},
	"p.finePrint a.signup click": function (a) {
		if (a.parent().is(".plus")) GS.lightbox.open("signup", {
			vipPackage: this.bVip ? "vip" : "plus"
		});
		else a.parent().is(".anywhere") ? GS.lightbox.open("signup", {
			vipPackage: this.bVip ? "vip" : "anywhere"
		}) : GS.lightbox.open("signup")
	},
	"#init_deactivate_account click": function (a, b) {
		b.preventDefault();
		GS.lightbox.open("deactivateAccount")
	},
	"#settings_desktop submit": function (a, b) {
		b.preventDefault();
		var c = {
			onClose: $("#settings_desktop input[name=settings_desktop_onClose]:checked").val(),
			onMinimize: $("#settings_desktop input[name=settings_desktop_onMinimize]:checked").val(),
			externalControlEnabled: $("#settings_desktop_globalKeyboard").is(":checked"),
			notifications: {
				songNotifications: $("#settings_desktop_songNotifications").is(":checked"),
				position: parseInt($("select[name=settings_desktop_notifPosition]", a).val(), 10),
				duration: parseInt($("select[name=settings_desktop_notifDuration]", a).val(), 10)
			}
		};
		this.desktopPrefs = c;
		GS.airbridge.setDesktopPreferences(c);
		$("#settings_desktop .buttons .status").addClass("success");
		return false
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.SongController", {}, {
	type: "song",
	index: function (a, b) {
		this.url = location.hash;
		this.token = a || "";
		this.subpage = b || "comments";
		this.playSong = false;
		var c = this.url.indexOf("?");
		if ((c === -1 ? this.url : this.url.substring(0, c)) === GS.loadedPage) {
			this.playSong = true;
			GS.loadedPage = false
		}
		if (this.token) GS.Models.Song.getSongFromToken(this.token, this.callback("loadSong"));
		else {
			console.log("NO SONG TOKEN, not found");
			GS.router.notFound()
		}
	},
	loadSong: function (a) {
		if (a.validate()) {
			this.song = a;
			this.correctUrl(this.song, this.subpage === "comments" ? "" : this.subpage);
			this.id = this.song.SongID;
			this.url = "http://listen.grooveshark.com/" + this.song.toUrl().replace("#/", "");
			this.header.name = this.song.SongName;
			this.header.breadcrumbs = [{
				text: this.song.ArtistName,
				url: _.cleanUrl(this.song.ArtistID, this.song.ArtistName, "artist")
			}, {
				text: this.song.AlbumName,
				url: _.cleanUrl(this.song.AlbumID, this.song.AlbumName, "album")
			}];
			this.header.subpages = ["comments", "related", "fans"];
			this.header.options = false;
			this.list.doPlayAddSelect = true;
			this.list.doSearchInPage = true;
			this.list.sortOptions = [{
				text: "Track",
				column: "TrackNum"
			}, {
				text: "Popularity",
				column: "Popularity"
			}, {
				text: "Song Name",
				column: "Name"
			}, {
				text: "Artist Name",
				column: "ArtistName"
			}];
			this.list.useGrid = true;
			switch (this.subpage) {
			case "fans":
				this.element.html(this.view("fans"));
				$("input.search").select();
				$.publish("gs.page.loading.grid");
				GS.Controllers.PageController.title(this.song.getTitle() + " - fans");
				this.song.fanbase.getFans(this.callback("loadGridFans"), this.callback("loadGridFans"));
				break;
			case "related":
				this.element.html(this.view("related"));
				$("input.search").select();
				$.publish("gs.page.loading.grid");
				this.song.album = GS.Models.Album.getOneFromCache(this.song.AlbumID);
				this.triedUnverified = this.song.album ? this.song.album.songsLoaded && this.song.album.songsUnverifiedLoaded : false;
				GS.Controllers.PageController.title(this.song.getTitle() + " - related");
				this.song.getRelatedSongs(this.callback("loadRelatedGrid"));
				break;
			case "comments":
			default:
				this.song.album = GS.Models.Album.getOneFromCache(this.song.AlbumID);
				this.triedUnverified = this.song.album ? this.song.album.songsLoaded && this.song.album.songsUnverifiedLoaded : false;
				$("#page_header button.share").parent().show();
				GS.Controllers.PageController.title(this.song.getTitle());
				if (window.FB && FB.XFBML && this.url) {
					this.element.html(this.view("index"));
					$("input.search").select();
					$("#page_header button.share").parent().show();
					a = null;
					if (FB._session && GS.facebook.connected) {
						a = FB._session;
						FB._session = {}
					}
					FB.XFBML.parse(window.document.getElementById("page_content"), function () {
						$("#page_content .comments").removeClass("loadingFBComments");
						$(window).resize()
					});
					if (a && GS.facebook.connected) FB._session = a
				}
				this.songFans = [];
				this.relatedSongs = [];
				this.song.fanbase.getFans(this.callback("loadSidebarFans"), this.callback("loadSidebarFans"));
				this.song.getRelatedSongs(this.callback("loadSidebarRelated"));
				this.playSong && GS.player.addSongAndPlay(this.song.SongID);
				break
			}
		} else GS.router.notFound()
	},
	loadSidebarFans: function (a) {
		if (a) {
			var b = [];
			for (var c in a) if (a.hasOwnProperty(c)) {
				if (b.length >= 4) break;
				if (a[c].Picture) {
					b.push(a[c]);
					a.splice(c, 1)
				}
			}
			this.songFans = b = b.concat(a);
			$("#song_fans").html(this.view("song_fans"));
			this.relatedSongs.length && $("#song_fans .bottomRule").show();
			$(window).resize()
		}
	},
	loadSidebarRelated: function (a) {
		if ((!a || a.length < 4) && !this.triedUnverified) {
			this.triedUnverified = true;
			this.song.getRelatedSongs(this.callback("loadSidebarRelated"), null, false)
		} else {
			var b = 0;
			for (var c in a) if (a.hasOwnProperty(c)) {
				if (b++ >= 4) break;
				if (this.id == a[c].SongID) {
					a.splice(c, 1);
					break
				}
			}
			if (a.length) {
				this.relatedSongs = a;
				$("#song_related").html(this.view("song_related"));
				$("#song_fans .bottomRule").show();
				$(window).resize()
			}
		}
	},
	loadGridFans: function (a) {
		var b = store.get("gs.sort.song.fans") || {
			sortCol: "Username",
			sortDir: 1,
			sortStoreKey: "gs.sort.song.fans"
		};
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "user"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("song")
		}
		$(window).resize()
	},
	loadRelatedGrid: function (a) {
		var b = this.element.find(".gs_grid").controller(),
			c = store.get("gs.sort.song.related") || {
				sortCol: "TrackNum",
				sortStoreKey: "gs.sort.song.related"
			};
		c.filters = {
			artistIDs: false,
			albumIDs: false,
			onlyVerified: false
		};
		if (b) {
			c = b.dataView;
			var g = b.grid;
			if (c) {
				c.beginUpdate();
				c.addItems(a, "SongID");
				c.endUpdate();
				c.refresh()
			}
			g && g.onSort(b.sortCol, b.sortDir)
		} else if (a.length) {
			if (a.length < 5 && !this.triedUnverified) {
				this.triedUnverified = true;
				_.forEach(a, function (h) {
					h.isVerified = -1
				});
				this.song.getRelatedSongs(this.callback("loadRelatedGrid"), null, false)
			} else if (!this.triedUnverified) {
				b = GS.Models.Song.getVerifiedDivider();
				c.filters.onlyVerified = 1;
				a.push(b)
			}
			this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.song, c, "song");
			setTimeout(this.callback("selectCurrentSong"), 500)
		} else if (this.triedUnverified) {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "song"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("song")
		} else {
			this.triedUnverified = true;
			this.song.getRelatedSongs(this.callback("loadRelatedGrid"), null, false)
		}
		$(window).resize()
	},
	selectCurrentSong: function () {
		var a = this.element.find(".gs_grid").controller();
		if (a) {
			var b = a.dataView.getIdxById(this.song.SongID),
				c = a.grid.getSelectedRows();
			c.push(b);
			a.selectedRowIDs.push(this.song.SongID);
			a.grid.setSelectedRows(c);
			a.grid.onSelectedRowsChanged()
		}
	},
	".slick-row.verifiedDivider click": function (a, b) {
		b.stopPropagation();
		var c = c = $("#grid").controller(),
			g;
		if (c) {
			if (!this.triedUnverified) {
				this.triedUnverified = true;
				this.song.getRelatedSongs(this.callback("loadRelatedGrid"), null, false)
			}
			if (c.filter.onlyVerified) {
				a.find(".showMore").addClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_LESS").html($.localize.getString("USER_ACTIVITY_SHOW_LESS"));
				c.filter.onlyVerified = false
			} else {
				a.find(".showMore").removeClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_MORE").html($.localize.getString("USER_ACTIVITY_SHOW_MORE"));
				c.filter.onlyVerified = 1
			}(g = c.grid) && g.onSort(c.sortCol, c.sortDir)
		}
	},
	"a.songLink click": function (a) {
		(a = parseInt($(a).attr("rel"), 10)) && GS.Models.Song.getSong(a, function (b) {
			if (b) location.hash = b.toUrl()
		})
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.AlbumController", {}, {
	type: "album",
	index: function (a, b, c) {
		this.url = location.hash;
		this.id = parseInt(a, 10) || 0;
		this.subpage = b || "music";
		this.playOnView = c || false;
		this.id < 0 ? GS.router.notFound() : GS.Models.Album.getAlbum(this.id, this.callback("loadAlbum"))
	},
	loadAlbum: function (a) {
		this.album = a;
		this.correctUrl(this.album, this.subpage === "music" ? "" : this.subpage);
		this.header.name = this.album.AlbumName;
		this.header.breadcrumbs = [{
			text: this.album.ArtistName,
			url: _.cleanUrl(this.album.ArtistID, this.album.ArtistName, "artist")
		}, {
			text: "Albums",
			url: _.cleanUrl(this.album.ArtistID, this.album.ArtistName, "artist") + "/albums"
		}];
		this.header.imageUrl = "http://beta.grooveshark.com/static/amazonart/s" + this.album.CoverArtFileName;
		this.header.subpages = ["music", "fans"];
		this.header.options = false;
		this.list.doPlayAddSelect = true;
		this.list.doSearchInPage = true;
		this.list.useGrid = true;
		this.element.html(this.view("index"));
		$.publish("gs.page.loading.grid");
		$("input.search").select();
		if (this.subpage === "fans") {
			GS.Controllers.PageController.title(this.album.getTitle() + " - fans");
			this.album.fanbase.getFans(this.callback("loadGridFans"));
			$(".page_controls", this.element).hide()
		} else {
			this.triedUnverified = this.album.songsLoaded && this.album.songsUnverifiedLoaded;
			GS.Controllers.PageController.title(this.album.getTitle());
			this.album.getSongs(this.callback("loadGrid"), null, true);
			$(".page_controls", this.element).show()
		}
	},
	loadGridFans: function (a) {
		var b = store.get("gs.sort.album.fans") || {
			sortCol: "Username",
			sortDir: 1,
			sortStoreKey: "gs.sort.albums.fans"
		};
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "user"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("album")
		}
	},
	loadGrid: function (a) {
		var b = this.element.find(".gs_grid").controller(),
			c = store.get("gs.sort.album.songs") || {
				sortCol: "TrackNum",
				sortStoreKey: "gs.sort.albums.songs"
			};
		c.autoHeight = true;
		c.padding = 0;
		c.filters = {
			artistIDs: false,
			albumIDs: false,
			onlyVerified: false
		};
		$("#grid").attr("data-profile-view", 1);
		if (b) {
			c = b.dataView;
			var g = b.grid;
			if (c) {
				c.beginUpdate();
				c.addItems(a, "SongID");
				c.endUpdate();
				c.refresh()
			}
			g && g.onSort(b.sortCol, b.sortDir)
		} else if (a.length) {
			if (a.length < 5 && !this.triedUnverified) {
				this.triedUnverified = true;
				_.forEach(a, function (h) {
					h.isVerified = -1
				});
				this.album.getSongs(this.callback("loadGrid"), null, false)
			} else if (!this.triedUnverified) {
				b = GS.Models.Song.getVerifiedDivider();
				a.push(b);
				c.filters.onlyVerified = 1
			}
			if (this.playOnView && (a.length >= 5 || this.triedUnverified)) this.album.playSongs({
				playOnAdd: true
			});
			this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.albumSongs, c, "song")
		} else if (this.triedUnverified) {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "song"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("album")
		} else {
			this.triedUnverified = true;
			this.album.getSongs(this.callback("loadGrid"), null, false)
		}
	},
	".slick-row.verifiedDivider click": function (a, b) {
		b.stopPropagation();
		var c = c = $("#grid").controller(),
			g;
		if (c) {
			if (!this.triedUnverified) {
				this.triedUnverified = true;
				this.album.getSongs(this.callback("loadGrid"), null, false)
			}
			if (c.filter.onlyVerified) {
				a.find(".showMore").addClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_LESS").html($.localize.getString("USER_ACTIVITY_SHOW_LESS"));
				c.filter.onlyVerified = false
			} else {
				a.find(".showMore").removeClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_MORE").html($.localize.getString("USER_ACTIVITY_SHOW_MORE"));
				c.filter.onlyVerified = 1
			}(g = c.grid) && g.onSort(c.sortCol, c.sortDir)
		}
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.ArtistController", {}, {
	type: "artist",
	index: function (a, b) {
		this.url = location.hash;
		this.id = parseInt(a, 10) || 0;
		this.subpage = b || "music";
		this.id < 0 ? GS.router.notFound() : GS.Models.Artist.getArtist(this.id, this.callback("loadArtist"))
	},
	loadArtist: function (a) {
		this.artist = a;
		this.element.html(this.view("index"));
		this.correctUrl(this.artist, this.subpage === "music" ? "" : this.subpage);
		$("input.search").select();
		switch (this.subpage) {
		case "fans":
			$("#albumGrid").parent().remove();
			GS.Controllers.PageController.title(this.artist.getTitle() + " - Fans");
			this.artist.fanbase.getFans(this.callback("loadGridFans"));
			break;
		case "similar":
			$("#albumGrid").parent().remove();
			GS.Controllers.PageController.title(this.artist.getTitle() + " - Similar");
			GS.service.artistGetSimilarArtists(this.artist.ArtistID, this.callback("loadGridSimilar"), this.callback("loadGridSimilarFailed"));
			break;
		case "events":
			$("#albumGrid").parent().remove();
			GS.Controllers.PageController.title(this.artist.getTitle() + " - Events");
			GS.service.artistGetSongkickEvents(this.artist.ArtistID, this.artist.ArtistName, this.callback("loadGridEvents"), this.callback("loadGridEventsFailed"));
			break;
		default:
			this.triedUnverified = this.artist.songsLoaded && this.artist.songsUnverifiedLoaded;
			GS.Controllers.PageController.title(this.artist.getTitle());
			$.publish("gs.page.loading.grid");
			this.artist.getSongs(this.callback("loadGrid"))
		}
	},
	loadGridFans: function (a) {
		var b = store.get("gs.sort.artist.fans") || {
			sortCol: "Username",
			sortDir: 1,
			sortStoreKey: "gs.sort.artist.fans"
		};
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "user"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("artist")
		}
	},
	albumsSeen: {},
	loadGrid: function (a) {
		setTimeout(this.callback(function () {
			var b, c = [],
				g = store.get("gs.sort.artist.songs") || {
					sortCol: "Popularity",
					sortDir: 0,
					sortStoreKey: "gs.sort.artist.songs"
				},
				h = this.element.find(".gs_grid.songs").controller(),
				k = this.element.find(".gs_grid.albums").controller();
			g = $.extend(g, {
				filters: {
					artistIDs: false,
					albumIDs: false,
					onlyVerified: false
				}
			});
			if (a.length) {
				this.albumsSeen = {};
				for (b = 0; b < a.length; b++) if (!this.albumsSeen[a[b].SongID] && a[b].AlbumName && a[b].AlbumName.length) {
					var m = GS.Models.Album.wrap({
						AlbumName: a[b].AlbumName,
						AlbumID: a[b].AlbumID,
						ArtistName: a[b].ArtistName,
						ArtistID: a[b].ArtistID,
						CoverArtFilename: a[b].CoverArtFilename
					}).dupe();
					m.isVerified = -1;
					c.push(m);
					this.albumsSeen[a[b].AlbumID] = true
				}
				b = GS.Models.Album.getFilterAll();
				c.push(b)
			}
			$("#albumFilters").resizable({
				handles: {
					e: $("#albumFilter-resize")
				},
				minWidth: 30,
				maxWidth: 350,
				animate: false,
				resize: function () {
					$(window).resize()
				}
			});
			if (h) {
				g = h.dataView;
				c = h.grid;
				if (g) {
					g.beginUpdate();
					k.dataView.beginUpdate();
					g.addItems(a, "SongID");
					k.dataView.addItems(a, "SongID");
					g.endUpdate();
					k.dataView.endUpdate();
					g.refresh();
					k.dataView.refresh();
					g = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
						numSongs: g.rows.length
					})).render();
					$("#gridNumItems").text(g).show()
				}
				if (c) {
					c.onSort(h.sortCol, h.sortDir);
					k.grid.onSort(k.sortCol, k.sortDir)
				}
			} else if (a.length) {
				if (a.length < 5 && !this.triedUnverified) {
					this.triedUnverified = true;
					_.forEach(a, function (o) {
						o.isVerified = -1
					});
					this.artist.getSongs(this.callback("loadGrid"), null, false)
				} else if (!this.triedUnverified) {
					h = GS.Models.Song.getVerifiedDivider();
					g.filters.onlyVerified = 1;
					a.push(h)
				}
				this.element.find(".gs_grid.songs").gs_grid(a, GS.Controllers.GridController.columns.song, g, "song");
				this.element.find(".gs_grid.albums").gs_grid(c, GS.Controllers.GridController.columns.albumFilter, {
					rowHeight: 25,
					sortCol: "AlbumName",
					isFilter: true
				}, "album");
				g = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
					numSongs: a.length
				})).render();
				$("#gridNumItems").text(g).show()
			} else if (this.triedUnverified) {
				this.element.find(".gs_grid.songs").html(this.view("/shared/noResults", {
					type: "song"
				}));
				$("#searchForm input").select();
				this.addAutocomplete("artist");
				g = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
					numSongs: "0"
				})).render();
				$("#gridNumItems").text(g).show()
			} else {
				this.triedUnverified = true;
				this.artist.getSongs(this.callback("loadGrid"), null, false)
			}
		}), 100)
	},
	loadGridSimilar: function (a) {
		a = GS.Models.Artist.wrapCollection(a.SimilarArtists, {
			USE_INDEX: "Sort"
		});
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.artist, {}, "artist");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "artist"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("artist")
		}
	},
	loadGridSimilarFailed: function () {
		this.element.find(".gs_grid").html(this.view("/shared/noResults", {
			type: "artist"
		}));
		$("#searchForm input").select();
		this.addAutocomplete("artist")
	},
	loadGridEvents: function (a) {
		var b = {
			sortCol: "StartTime",
			sortDir: 1,
			rowCssClasses: function () {
				return "event"
			}
		};
		a = GS.Models.Event.wrapCollection(a, {
			USE_INDEX: "EventID",
			ArtistName: this.artist.ArtistName
		});
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.event, b, "event");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "event"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("artist")
		}
	},
	loadGridEventsFailed: function () {
		this.element.find(".gs_grid").html(this.view("/shared/noResults", {
			type: "event"
		}));
		$("#searchForm input").select();
		this.addAutocomplete("artist")
	},
	".slick-row.verifiedDivider click": function (a, b) {
		b.stopImmediatePropagation();
		var c = $("#grid").controller(),
			g;
		if (c) {
			if (!this.triedUnverified) {
				this.triedUnverified = true;
				this.artist.getSongs(this.callback("loadGrid"), null, false)
			}
			if (c.filter.onlyVerified) {
				a.find(".showMore").addClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_LESS").html($.localize.getString("USER_ACTIVITY_SHOW_LESS"));
				c.filter.onlyVerified = false
			} else {
				a.find(".showMore").removeClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_MORE").html($.localize.getString("USER_ACTIVITY_SHOW_MORE"));
				c.filter.onlyVerified = 1
			}(g = c.grid) && g.onSort(c.sortCol, c.sortDir)
		}
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.UserController", {}, {
	index: function (a, b) {
		this.UserName = _.cleanText(a);
		this.UserID = parseInt(b, 10);
		if (GS.user.UserID == this.UserID) this.loadMyProfile();
		else isNaN(this.UserID) ? GS.Models.User.getUserByUsername(a, this.callback("redirectUser")) : GS.Models.User.getUser(this.UserID, this.callback("loadProfile"));
		this.subscribe("gs.auth.user.update", this.callback("userUpdated"));
		this.subscribe("gs.auth.favorite.user", this.callback("userUpdated"));
		this.subscribe("gs.auth.favorites.users.update", this.callback("userFavoritesUpdated"))
	},
	userChangeTimeout: false,
	userChangeWaitDuration: 100,
	userFavoritesUpdated: function () {
		clearTimeout(this.userChangeTimeout);
		this.userChangeTimeout = setTimeout(this.callback(function () {
			if (this.user) {
				var a = GS.user.favorites.users[this.user.UserID];
				if (a) {
					console.error("update profile");
					GS.user.UserID == this.UserID ? this.loadMyProfile() : this.loadProfile(a)
				}
			}
		}), this.userChangeWaitDuration)
	},
	userUpdated: function (a) {
		clearTimeout(this.userChangeTimeout);
		this.userChangeTimeout = setTimeout(this.callback(function () {
			if (this.user && this.user.UserID === a.UserID) GS.user.UserID == this.UserID ? this.loadMyProfile() : this.loadProfile(a)
		}), this.userChangeWaitDuration)
	},
	loadMyProfile: function () {
		this.user = GS.user;
		this.subpage = "";
		this.correctUrl(this.user, "");
		GS.Controllers.PageController.title(this.user.getTitle());
		this.element.html(this.view("profile"));
		$("input.search").select();
		$.publish("gs.page.loading.grid");
		this.user.getProfileFeed(this.callback("loadGridProfileFeed", this.user));
		this.user.getPlaylists(this.callback("loadProfilePlaylists", this.user));
		this.user.getFavoritesByType("Users", this.callback("loadProfileCommunity", this.user))
	},
	loadProfile: function (a) {
		this.user = a;
		this.subpage = "";
		this.correctUrl(this.user, "");
		GS.Controllers.PageController.title(this.user.getTitle());
		this.element.html(this.view("profile"));
		$("input.search").select();
		$.publish("gs.page.loading.grid");
		this.user.getProfileFeed(this.callback("loadGridProfileFeed", this.user));
		this.user.getPlaylists(this.callback("loadProfilePlaylists", this.user));
		this.user.getFavoritesByType("Users", this.callback("loadProfileCommunity", this.user))
	},
	loadProfileCommunity: function (a) {
		this.user = a;
		this.following = this.user.favorites.users;
		$("#profile_community").html(this.view("profile_community"))
	},
	loadProfilePlaylists: function (a) {
		this.user = a;
		this.topPlaylists = _.toArray(this.user.playlists).sort(function (b, c) {
			return c.TSAdded > b.TSAdded
		});
		$("#profile_playlists").html(this.view("profile_playlists"))
	},
	loadGridProfileFeed: function (a) {
		this.user = a;
		if (!this.user.profileFeed.isLoaded) return false;
		this.activity = this.user.profileFeed.events;
		this.myCommunity = this.noFriends = false;
		if (this.activity.length) {
			this.element.find(".gs_grid").html(this.view("activity"));
			$("input.search").select()
		} else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "activity"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("user")
		}
		this.element.find(".event").each(this.callback(function (b, c) {
			$(c).data("event", this.activity[b]);
			this.activity[b].dataString.hookup($(c).find("p.what"))
		}));
		$(window).resize()
	},
	music: function (a, b, c) {
		this.UserName = a;
		this.UserID = parseInt(b, 10);
		this.subpage = c || "music";
		this.fromSidebar = GS.page.isFromSidebar();
		if (GS.user.UserID == this.UserID) {
			this.user = GS.user;
			if (this.subpage === "favorites") {
				GS.Controllers.PageController.title(GS.user.getTitle() + " - Favorites");
				this.subscribe("gs.auth.favorites.songs.add", this.callback("addToGrid"));
				this.subscribe("gs.auth.favorites.songs.remove", this.callback("removeFromGrid"));
				this.subscribe("gs.auth.favorites.songs.update", this.callback("loadMySongFavorites"));
				this.loadMySongFavorites()
			} else {
				GS.Controllers.PageController.title(GS.user.getTitle() + " - Music");
				this.subscribe("gs.auth.library.add", this.callback("addToGrid"));
				this.subscribe("gs.auth.library.remove", this.callback("removeFromGrid"));
				this.subscribe("gs.auth.library.update", this.callback("loadGridMusic"));
				this.loadMyMusic()
			}
			this.element.find("#page_header button.opts").show()
		} else isNaN(this.UserID) ? GS.Models.User.getUserByUsername(this.UserName, this.callback("redirectUser")) : GS.Models.User.getUser(this.UserID, this.callback("loadMusic"))
	},
	redirectUser: function (a) {
		this.user = a;
		location.hash = this.user.toUrl();
		return false
	},
	loadMyMusic: function () {
		if ($("#page").is(".gs_page_user")) {
			this.user = GS.user;
			this.UserName = this.user.Username;
			this.UserID = this.user.UserID;
			this.correctUrl(this.user, this.subpage);
			this.element.html(this.view("music"));
			$("input.search").select();
			var a = [];
			for (var b in GS.user.library.songs) if (GS.user.library.songs.hasOwnProperty(b)) {
				GS.user.library.songs[b].fromLibrary = 1;
				a.push(GS.user.library.songs[b])
			}
			this.loadGridMusic(a, true)
		}
	},
	addToGrid: function (a) {
		if (this.UserID !== GS.user.UserID) console.warn("badness!");
		else {
			a.isDeleted = false;
			var b = this.element.find(".gs_grid.songs").controller(),
				c = this.element.find(".gs_grid.artists").controller(),
				g = this.element.find(".gs_grid.albums").controller(),
				h = b.grid,
				k = b.dataView;
			if (k) {
				k.beginUpdate();
				k.addItem(a);
				k.endUpdate();
				k = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
					numSongs: k.rows.length
				})).render();
				$("#gridNumItems").text(k).show()
			}
			h && h.onSort(b.sortCol, b.sortDir);
			if (!this.albumsSeen[a.AlbumID] && a.AlbumName && a.AlbumName.length) {
				g.dataView.beginUpdate();
				b = GS.Models.Album.wrap({
					AlbumName: a.AlbumName,
					AlbumID: a.AlbumID,
					ArtistName: a.ArtistName,
					ArtistID: a.ArtistID
				}).dupe();
				b.isVerified = -1;
				g.dataView.addItem(b);
				g.dataView.endUpdate();
				this.albumsSeen[a.AlbumID] = true;
				g.grid && g.grid.onSort(g.sortCol, g.sortDir)
			}
			if (!this.artistsSeen[a.ArtistID] && a.ArtistName && a.ArtistName.length) {
				c.dataView.beginUpdate();
				g = GS.Models.Artist.wrap({
					ArtistName: a.ArtistName,
					ArtistID: a.ArtistID,
					CoverArtFilename: a.CoverArtFilename
				}).dupe();
				g.isVerified = -1;
				c.dataView.addItem(g);
				c.dataView.endUpdate();
				this.artistsSeen[a.ArtistID] = true;
				c.grid && c.grid.onSort(c.sortCol, c.sortDir)
			}
		}
	},
	removeFromGrid: function (a) {
		a.isDeleted = true;
		var b = this.element.find(".gs_grid.songs").controller(),
			c = b.grid,
			g = b.dataView;
		if (g) {
			g.beginUpdate();
			g.updateItem(a.SongID, a);
			g.endUpdate()
		}
		c && c.onSort(b.sortCol, b.sortDir)
	},
	loadMySongFavorites: function () {
		if ($("#page").is(".gs_page_user")) {
			this.user = GS.user;
			this.UserName = this.user.Username;
			this.UserID = this.user.UserID;
			this.correctUrl(this.user, "music/" + this.subpage);
			this.element.html(this.view("music"));
			$("input.search").select();
			var a = [];
			for (var b in GS.user.favorites.songs) GS.user.favorites.songs.hasOwnProperty(b) && a.push(GS.user.favorites.songs[b]);
			this.loadGridMusic(a)
		}
	},
	loadMusic: function (a) {
		this.user = a;
		this.UserName = this.user.Username;
		this.UserID = this.user.UserID;
		this.fromSidebar = false;
		this.element.html(this.view("music"));
		$("input.search").select();
		if (this.subpage === "favorites") {
			this.correctUrl(this.user, "music/" + this.subpage);
			GS.Controllers.PageController.title(this.user.getTitle() + " - Favorites");
			this.user.getFavoritesByType("Songs", this.callback("loadGridSongFavorites", true))
		} else {
			this.correctUrl(this.user, this.subpage);
			GS.Controllers.PageController.title(this.user.getTitle() + " - Music");
			this.user.library.getSongs(this.callback("loadGridMusic"));
			this.user.getFavoritesByType("Songs", this.callback("loadGridSongFavorites", false))
		}
	},
	loadGridSongFavorites: function (a) {
		var b = [];
		for (var c in this.user.favorites.songs) this.user.favorites.songs.hasOwnProperty(c) && b.push(this.user.favorites.songs[c]);
		this.loadGridMusic(b, a)
	},
	albumsSeen: {},
	artistsSeen: {},
	loadGridMusic: function (a, b) {
		setTimeout(this.callback(function () {
			var c, g, h = [],
				k = [],
				m;
			g = store.get("gs.sort.user.music") || {
				sortCol: "TSAdded",
				sortDir: 0,
				sortStoreKey: "gs.sort.user.music"
			};
			m = this.element.find(".gs_grid.songs").controller();
			artistController = this.element.find(".gs_grid.artists").controller();
			albumController = this.element.find(".gs_grid.albums").controller();
			b = _.orEqual(b, false);
			this.albumsSeen = {};
			this.artistsSeen = {};
			g.rowCssClasses = function (r) {
				return r.isDeleted ? "strikethrough" : ""
			};
			for (c = 0; c < a.length; c++) {
				if (!this.albumsSeen[a[c].AlbumID] && a[c].AlbumName && a[c].AlbumName.length) {
					var o = GS.Models.Album.wrap({
						AlbumName: a[c].AlbumName,
						AlbumID: a[c].AlbumID,
						ArtistName: a[c].ArtistName,
						ArtistID: a[c].ArtistID
					}).dupe();
					o.isVerified = -1;
					h.push(o);
					this.albumsSeen[a[c].AlbumID] = true
				}
				if (!this.artistsSeen[a[c].ArtistID]) {
					o = GS.Models.Artist.wrap({
						ArtistName: a[c].ArtistName,
						ArtistID: a[c].ArtistID,
						CoverArtFilename: a[c].CoverArtFilename
					}).dupe();
					o.isVerified = -1;
					k.push(o);
					this.artistsSeen[a[c].ArtistID] = true
				}
			}
			$("#artistFilters").resizable({
				handles: {
					e: $("#artistFilter-resize")
				},
				minWidth: 30,
				maxWidth: 350,
				animate: false,
				resize: function () {
					$(window).resize()
				}
			});
			$("#albumFilters").resizable({
				handles: {
					e: $("#albumFilter-resize")
				},
				minWidth: 30,
				maxWidth: 350,
				animate: false,
				resize: function () {
					$(window).resize()
				}
			});
			c = GS.Models.Album.getFilterAll();
			h.push(c);
			c = GS.Models.Artist.getFilterAll();
			k.push(c);
			if (m) {
				c = m.dataView;
				g = m.grid;
				if (c) {
					c.beginUpdate();
					albumController.dataView.beginUpdate();
					artistController.dataView.beginUpdate();
					if (b) {
						c.setItems(a, "SongID");
						albumController.dataView.setItems(h, "AlbumID");
						artistController.dataView.setItems(k, "ArtistID")
					} else {
						c.addItems(a, "SongID");
						albumController.dataView.addItems(h, "AlbumID");
						artistController.dataView.addItems(k, "ArtistID")
					}
					c.endUpdate();
					albumController.dataView.endUpdate();
					artistController.dataView.endUpdate();
					c.refresh();
					albumController.dataView.refresh();
					artistController.dataView.refresh();
					h = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
						numSongs: c.rows.length
					})).render();
					$("#gridNumItems").text(h).show()
				}
				if (g) {
					g.onSort(m.sortCol, m.sortDir);
					albumController.grid.onSort(albumController.sortCol, albumController.sortDir);
					artistController.grid.onSort(artistController.sortCol, artistController.sortDir)
				}
			} else {
				if (a.length) {
					m = GS.Controllers.GridController.columns.song.concat();
					m = [m[0], m[1], m[2]];
					this.element.find(".gs_grid.songs").gs_grid(a, m, g);
					this.element.find(".gs_grid.albums").gs_grid(h, GS.Controllers.GridController.columns.albumFilter, {
						rowHeight: 25,
						sortCol: "AlbumName",
						isFilter: true
					}, "album");
					this.element.find(".gs_grid.artists").gs_grid(k, GS.Controllers.GridController.columns.artistFilter, {
						rowHeight: 25,
						sortCol: "ArtistName",
						isFilter: true
					}, "artist");
					h = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
						numSongs: a.length
					})).render()
				} else {
					this.element.find(".grid").html(this.view("/shared/noResults", {
						type: "song"
					}));
					$("#searchForm input").select();
					this.addAutocomplete("user");
					h = (new GS.Models.DataString($.localize.getString("QUEUE_NUM_SONGS"), {
						numSongs: "0"
					})).render()
				}
				$("#gridNumItems").text(h).show()
			}
			this.subpage !== "favorites" && !this.user.library.songsLoaded && GS.user.UserID != this.UserID && this.user.library.getSongs(this.callback("loadGridMusic"), null, false)
		}), 100)
	},
	playlists: function (a, b, c) {
		this.UserName = a;
		this.UserID = b;
		this.subpage = c;
		if (c === "subscribed") {
			if (GS.user.UserID == this.UserID) {
				this.user = GS.user;
				this.loadMySubscribedPlaylists(GS.user)
			} else GS.Models.User.getUser(this.UserID, this.callback("loadSubscribedPlaylists"));
			this.subscribe("gs.auth.favorites.playlists.update", this.callback("loadGridSubscribedPlaylists"))
		} else if (GS.user.UserID == this.UserID) {
			this.user = GS.user;
			this.loadMyPlaylists();
			this.subscribe("gs.auth.playlists.update", this.callback("loadGridPlaylists"));
			this.subscribe("gs.auth.favorites.playlists.update", this.callback("loadGridPlaylists"))
		} else GS.Models.User.getUser(this.UserID, this.callback("loadPlaylists"));
		$(window).resize()
	},
	loadMyPlaylists: function () {
		if ($("#page").is(".gs_page_user")) {
			this.user = GS.user;
			this.correctUrl(this.user, this.subpage);
			GS.Controllers.PageController.title(this.user.getTitle() + " - Playlists");
			this.element.html(this.view("playlists"));
			this.loadGridPlaylists();
			$("input.search").select()
		}
	},
	loadMySubscribedPlaylists: function () {
		if ($("#page").is(".gs_page_user")) {
			this.user = GS.user;
			this.correctUrl(this.user, "playlists/" + this.subpage);
			GS.Controllers.PageController.title(this.user.getTitle() + " - Subscribed Playlists");
			this.element.html(this.view("playlists"));
			this.loadGridSubscribedPlaylists();
			$("input.search").select()
		}
	},
	loadPlaylists: function (a) {
		this.user = a;
		this.correctUrl(this.user, this.subpage);
		GS.Controllers.PageController.title(this.user.getTitle() + " - Playlists");
		this.element.html(this.view("playlists"));
		this.user.getPlaylists(this.callback("loadGridPlaylists"));
		$("input.search").select()
	},
	loadSubscribedPlaylists: function (a) {
		this.user = a;
		this.correctUrl(this.user, "playlists/" + this.subpage);
		GS.Controllers.PageController.title(this.user.getTitle() + " - Subscribed Playlists");
		this.element.html(this.view("playlists"));
		this.user.getFavoritesByType("Playlists", this.callback("loadGridSubscribedPlaylists"));
		$("input.search").select()
	},
	loadGridPlaylists: function () {
		if (this.user) if (this.subpage !== "subscribed") {
			var a = _.toArray(this.user.playlists),
				b, c;
			b = store.get("gs.sort.user.playlists") || {
				sortCol: "TSAdded",
				sortDir: 0,
				sortStoreKey: "gs.sort.user.playlists"
			};
			var g = this.element.find(".gs_grid.playlists").controller();
			if (g) {
				b = g.dataView;
				c = g.grid;
				if (b) {
					b.beginUpdate();
					b.setItems(a, "PlaylistID");
					b.endUpdate();
					b.refresh()
				}
				c && c.onSort(g.sortCol, g.sortDir)
			} else if (a.length) this.element.find(".gs_grid.playlists").gs_grid(a, GS.Controllers.GridController.columns.playlist, b, "playlist");
			else {
				this.element.find(".gs_grid.playlists").html(this.view("/shared/noResults", {
					type: "playlist"
				}));
				$("#searchForm input").select();
				this.addAutocomplete("user")
			}
		}
	},
	loadGridSubscribedPlaylists: function () {
		if (this.user) if (!(!this.user || this.subpage !== "subscribed")) {
			var a = _.toArray(this.user.favorites.playlists),
				b, c;
			b = store.get("gs.sort.user.subscribed") || {
				sortCol: "TSFavorited",
				sortDir: 0,
				sortStoreKey: "gs.sort.user.subscribed"
			};
			var g = this.element.find(".gs_grid").controller();
			if (b.sortCol == "TSAdded") {
				b.sortCol = "TSFavorited";
				store.remove("gs.sort.user.subscribed")
			}
			if (g) {
				b = g.dataView;
				c = g.grid;
				if (b) {
					b.beginUpdate();
					b.setItems(a, "PlaylistID");
					b.endUpdate();
					b.refresh()
				}
				c && c.onSort(g.sortCol, g.sortDir)
			} else if (a.length) this.element.find(".gs_grid.playlists").gs_grid(a, GS.Controllers.GridController.columns.playlist, b, "playlist");
			else {
				this.element.find(".gs_grid.playlists").html(this.view("/shared/noResults", {
					type: "playlist"
				}));
				$("#searchForm input").select();
				this.addAutocomplete("user")
			}
		}
	},
	community: function (a, b, c) {
		this.UserName = a;
		this.UserID = b;
		this.subpage = c;
		this.myCommunity = false;
		if (c == "following") GS.user.UserID == this.UserID ? this.loadFollowing(GS.user) : GS.Models.User.getUser(this.UserID, this.callback("loadFollowing"));
		else if (c == "fans") GS.user.UserID == this.UserID ? this.loadFans(GS.user) : GS.Models.User.getUser(this.UserID, this.callback("loadFans"));
		else if (c == "recent") GS.user.UserID == this.UserID ? this.loadRecentActiveFeed(GS.user) : GS.Models.User.getUser(this.UserID, this.callback("loadRecentActiveFeed"));
		else if (GS.user.UserID == this.UserID) {
			this.loadCommunity(GS.user);
			this.myCommunity = true
		} else GS.Models.User.getUser(this.UserID, this.callback("loadCommunity"))
	},
	loadCommunity: function (a) {
		this.user = a;
		GS.Controllers.PageController.title(this.user.getTitle() + " - Community");
		this.element.html(this.view("community"));
		$.publish("gs.page.loading.grid");
		$("input.search").select();
		_.isEmpty(a.favorites.users) && this.user.UserID > 0 ? this.user.getFavoritesByType("Users", this.callback("loadCommunityFeed")) : this.loadCommunityFeed()
	},
	loadCommunityFeed: function () {
		this.users = this.user.favorites.users;
		this.user.getCommunityFeed(this.callback("loadGridCommunityFeed"))
	},
	loadGridCommunityFeed: function () {
		if (!this.user.communityFeed.isLoaded) return false;
		this.activity = this.user.communityFeed.events;
		this.noFriends = this.user.communityFeed.fromRecent;
		if (this.user === GS.user) {
			this.myCommunity = true;
			if (this.user.communityFeed.events.length) this.user.lastSeenFeedEvent = this.user.communityFeed.events[0].time;
			this.user.countUnseenFeeds()
		}
		if (this.activity.length) {
			this.element.find(".gs_grid").html(this.view("activity"));
			$("input.search").select()
		} else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "activity"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("user")
		}
		this.element.find(".event").each(this.callback(function (a, b) {
			$(b).data("event", this.activity[a]);
			this.activity[a].dataString.hookup($(b).find("p.what"))
		}));
		$(window).resize()
	},
	loadRecentActiveFeed: function (a) {
		this.user = a;
		GS.Controllers.PageController.title(this.user.getTitle() + " - Recent Activity");
		this.element.html(this.view("community"));
		$.publish("gs.page.loading.grid");
		this.user.getRecentlyActiveUsersFeed(this.callback("loadGridRecentActiveFeed"));
		$("input.search").select()
	},
	loadGridRecentActiveFeed: function () {
		this.activity = this.user.recentActiveUsersFeed.events;
		this.noFriends = false;
		if (this.activity.length) {
			this.element.find(".gs_grid").html(this.view("activity"));
			$("input.search").select()
		} else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "activity"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("user")
		}
		this.element.find(".event").each(this.callback(function (a, b) {
			$(b).data("event", this.activity[a]);
			this.activity[a].dataString.hookup($(b).find("p.what"))
		}));
		$(window).resize()
	},
	loadFollowing: function (a) {
		this.user = a;
		GS.Controllers.PageController.title(this.user.getTitle() + " - Following");
		this.element.html(this.view("community"));
		this.user.getFavoritesByType("Users", this.callback("loadGridFans"));
		$("input.search").select()
	},
	loadFans: function (a) {
		this.user = a;
		GS.Controllers.PageController.title(this.user.getTitle() + " - Fans");
		this.element.html(this.view("community"));
		this.user.fanbase.getFans(this.callback("loadGridCommunity"));
		$("input.search").select()
	},
	loadGridCommunity: function (a) {
		var b, c;
		b = store.get("gs.sort.user.community") || {
			sortCol: "Username",
			sortDir: 1,
			sortStoreKey: "gs.sort.user.community"
		};
		var g = this.element.find(".gs_grid").controller();
		if (g) {
			b = g.dataView;
			c = g.grid;
			if (b) {
				b.beginUpdate();
				b.addItems(a, "UserID");
				b.endUpdate()
			}
			c && c.onSort(g.sortCol, g.sortDir)
		} else if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "activity"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("user")
		}
		this.user.fanbase.fansLoaded || this.user.fanbase.getFans(this.callback("loadGridCommunity"))
	},
	loadGridFans: function () {
		var a = _.toArray(this.user.favorites.users),
			b = store.get("gs.sort.user.fans") || {
				sortCol: "Username",
				sortDir: 1,
				sortStoreKey: "gs.sort.user.fans"
			};
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "user"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("user")
		}
	},
	"#feed .event .hideUser click": function (a) {
		a = parseInt($(a).attr("rel"), 10);
		this.find("#feed .user" + a).remove();
		GS.user.changeFollowFlags([{
			userID: a,
			flags: 1
		}])
	},
	"button.invite click": function () {
		this.UserID == GS.user.UserID && GS.user.UserID > 0 && GS.lightbox.open("invite")
	},
	"#feed button.follow click": function (a) {
		var b = parseInt($(a).attr("data-follow-userid"), 10),
			c = "";
		if (a.is(".add")) {
			GS.user.addToUserFavorites(b);
			a.removeClass("add").addClass("remove");
			c = "UNFOLLOW"
		} else {
			GS.user.removeFromUserFavorites(b);
			a.removeClass("remove").addClass("add");
			c = "FOLLOW"
		}
		a.find("span").attr("data-translate-text", c).text($.localize.getString(c))
	},
	"#page_header button.follow click": function (a) {
		var b = parseInt($(a).attr("data-follow-userid"), 10),
			c = "";
		if (a.is(".add")) {
			GS.user.addToUserFavorites(b);
			a.removeClass("add").addClass("remove");
			c = "UNFOLLOW"
		} else {
			GS.user.removeFromUserFavorites(b);
			a.removeClass("remove").addClass("add");
			c = "FOLLOW"
		}
		a.find("span").attr("data-translate-text", c).text($.localize.getString(c))
	},
	"#page_header a[name=delete] click": function () {
		console.log("user.button.delete click");
		var a = $("#grid").controller();
		if (a) {
			var b, c = a.grid.getSelectedRows();
			if (c.length !== 0) {
				for (var g = 0; g < c.length; g++) {
					$("#grid").find(".slick-row[row=" + c[g] + "]").addClass("strikethrough");
					if (b = a.dataView.rows[c[g]]) this.subpage === "favorites" ? GS.user.removeFromSongFavorites(b.SongID) : GS.user.removeFromLibrary(b.SongID)
				}
				a.grid.setSelectedRows([]);
				a.selectedRowIDs = [];
				$.publish("gs.grid.selectedRows", {
					len: 0
				})
			}
		}
	},
	"#page_header button.newPlaylist click": function () {
		GS.lightbox.open("newPlaylist")
	},
	".slick-row .playlist .subscribe click": function (a, b) {
		console.log("playlist subscribe option click", a, b);
		var c = a.attr("rel");
		c = GS.Models.Playlist.getOneFromCache(c);
		if (a.is(".subscribed")) {
			c.unsubscribe();
			a.removeClass("subscribed").find("a.subscribe span").text("Subscribe")
		} else {
			c.subscribe();
			a.addClass("subscribed").find("a.subscribe span").text("Unsubscribe")
		}
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.PlaylistController", {}, {
	type: "playlist",
	index: function (a, b, c) {
		this.url = location.hash;
		this.id = parseInt(a, 10) || 0;
		this.subpage = b || "music";
		this.playOnView = c || false;
		this.subscribe("gs.playlist.view.update", this.callback("onPlaylistUpdate"));
		GS.Models.Playlist.getPlaylist(this.id, this.callback("loadPlaylist"))
	},
	loadPlaylist: function (a) {
		this.playlist = a;
		this.fromSidebar = GS.page.isFromSidebar();
		this.correctUrl(this.playlist, this.subpage === "music" ? "" : this.subpage);
		this.header.name = _.cleanText(this.playlist.PlaylistName);
		this.header.breadcrumbs = [{
			text: this.playlist.Username,
			url: _.cleanUrl(this.playlist.UserID, this.playlist.Username, "user")
		}, {
			text: "Playlists",
			url: _.cleanUrl(this.playlist.UserID, this.playlist.Username, "user", null, "playlists")
		}];
		this.header.subpages = ["music", "fans"];
		this.header.options = false;
		this.list.doPlayAddSelect = true;
		this.list.doSearchInPage = true;
		this.list.sortOptions = [{
			text: "Popularity",
			column: "Popularity"
		}, {
			text: "Song Name",
			column: "Name"
		}, {
			text: "Favorite",
			column: "Favorite"
		}, {
			text: "Artist Name",
			column: "ArtistName"
		}, {
			text: "Album Name",
			column: "AlbumName"
		}];
		this.list.useGrid = true;
		this.element.html(this.view("index"));
		$("input.search").select();
		switch (this.subpage) {
		case "fans":
			GS.Controllers.PageController.title(this.playlist.getTitle() + " - fans");
			this.playlist.fanbase.getFans(this.callback("loadGridFans"));
			$(".page_controls", this.element).hide();
			break;
		default:
			$("#page_header button.share").parent().show();
			GS.Controllers.PageController.title(this.playlist.getTitle());
			this.playlist.getSongs(this.callback("loadGrid"));
			this.updatePlaylistProps(this.playlist);
			$(".page_controls", this.element).show();
			break
		}
		GS.Controllers.PageController.confirmMessage = $.localize.getString("ONCLOSE_SAVE_PLAYLIST")
	},
	updatePlaylistProps: function (a) {
		if (!(!this.playlist || this.playlist.PlaylistID !== a.PlaylistID)) {
			if (this.playlist.hasUnsavedChanges) {
				$("button.save", this.element).show();
				$("button.undo", this.element).show()
			} else {
				$("button.save", this.element).hide();
				$("button.undo", this.element).hide()
			}
			if (this.playlist.isDeleted) {
				$("h3.name", this.element).addClass("strikethrough");
				$("#page_header a[name=delete]").parent().css("display", "none !important");
				$("#page_header a[name=restore]").parent().css("display", "block !important")
			} else {
				$("h3.name", this.element).removeClass("strikethrough");
				$("#page_header a[name=delete]").parent().css("display", "block !important");
				$("#page_header a[name=restore]").parent().css("display", "none !important")
			}
			if (GS.user.UserID !== this.playlist.UserID) if (this.playlist.isFavorite) {
				$("#page_header button.unsubscribe").show();
				$("#page_header button.subscribe").hide()
			} else {
				$("#page_header button.subscribe").show();
				$("#page_header button.unsubscribe").hide()
			}
			if (this.playlist.isShortcut()) {
				$("#page_header a[name=shortcut]").parent().hide();
				$("#page_header a[name=removeshortcut]").parent().show()
			} else {
				$("#page_header a[name=shortcut]").parent().show();
				$("#page_header a[name=removeshortcut]").parent().hide()
			}
		}
	},
	onPlaylistUpdate: function (a) {
		if (!(!this.playlist || this.playlist.PlaylistID !== a.PlaylistID)) {
			console.log("gs.playlist.view.update", a, this.playlist);
			this.updatePlaylistProps(a);
			this.subpage != "fans" && this.playlist.getSongs(this.callback("loadGrid"))
		}
	},
	loadGrid: function (a) {
		var b = {
			sortCol: "Sort",
			sortDir: 1,
			sortStoreKey: "gs.sort.playlist.songs"
		},
			c = this.element.find(".gs_grid").controller();
		if (c) {
			a = c.dataView;
			b = c.grid;
			if (a) {
				var g, h, k, m, o = this.playlist.songs.concat();
				inGrid = a.getItems().concat();
				a.beginUpdate();
				for (k = 0; k < inGrid.length; k++) {
					g = inGrid[k];
					m = o.indexOf(g);
					m != -1 && o.splice(m, 1);
					a.getIdxById(g.GridKey);
					h = this.playlist.songs.indexOf(g);
					h == -1 ? a.deleteItem(g.GridKey) : a.updateItem(g.GridKey, g)
				}
				o.length && a.addItems(o, "GridKey");
				a.endUpdate();
				a.refresh()
			}
			b && b.onSort(c.sortCol, c.sortDir)
		} else {
			if (GS.user.UserID === this.playlist.UserID) {
				b.allowDragSort = true;
				b.allowDuplicates = true;
				b.playlistID = this.playlist.PlaylistID
			}
			if (a.length) {
				this.playOnView && this.playlist.playSongs({
					playOnAdd: true
				});
				b.rowCssClasses = function (s) {
					return s.isDeleted ? "strikethrough" : ""
				};
				$(".grid").unbind("dropend");
				this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.song, b, "song", "GridKey")
			} else {
				this.element.find(".gs_grid").html(this.view("/shared/noResults", {
					type: "song"
				}));
				$("#searchForm input").select();
				this.addAutocomplete("playlist");
				var r = this;
				$(".grid").bind("dropend", function (s, u) {
					if ($("#grid").controller()) return false;
					var w = [];
					if (typeof u.draggedItems[0].SongID !== "undefined") for (k = 0; k < u.draggedItems.length; k++) w.push(u.draggedItems[k].SongID);
					else if (typeof u.draggedItems[0].PlaylistID !== "undefined") for (k = 0; k < u.draggedItems.length; k++) u.draggedItems[k].getSongs(function (C) {
						for (m = 0; m < C.length; m++) w.push(C[m].SongID)
					}, null, false, {
						async: false
					});
					w.length && r.playlist.addSongs(w)
				})
			}
			$(window).resize()
		}
	},
	loadGridFans: function (a) {
		var b = store.get("gs.sort.playlist.fans") || {
			sortCol: "Username",
			sortDir: 1,
			sortStoreKey: "gs.sort.playlist.fans"
		};
		if (a.length) this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user");
		else {
			this.element.find(".gs_grid").html(this.view("/shared/noResults", {
				type: "user"
			}));
			$("#searchForm input").select();
			this.addAutocomplete("playlist")
		}
	},
	getSongsIDsFromSelectedGridRows: function () {
		var a = this.element.find(".gs_grid:last").controller(),
			b = [],
			c;
		if (a && a.selectedRowIDs.length > 0) for (c = 0; c < a.selectedRowIDs.length; c++) {
			var g = this.playlist.gridKeyLookup[a.selectedRowIDs[c]];
			g && b.push(g.SongID)
		} else for (c = 0; c < a.dataView.rows.length; c++) b.push(a.dataView.rows[c].SongID);
		return b
	},
	"#page_header a[name=rename] click": function () {
		console.log("playlist.rename click", this.playlist.PlaylistID);
		GS.lightbox.open("renamePlaylist", this.playlist.PlaylistID)
	},
	"#page_header a[name=delete] click": function () {
		console.log("playlist.delete click", this.playlist.PlaylistID);
		GS.lightbox.open("deletePlaylist", this.playlist.PlaylistID)
	},
	"#page_header a[name=restore] click": function () {
		console.log("playlist.restore click", this.playlist.PlaylistID);
		this.playlist.restore()
	},
	"#page_header a[name=shortcut] click": function () {
		console.log("playlist.shorcut add click", this.playlist.PlaylistID);
		this.playlist.addShortcut();
		$("#page_header a[name=shortcut]").parent().hide();
		$("#page_header a[name=removeshortcut]").parent().show()
	},
	"#page_header a[name=removeshortcut] click": function () {
		console.log("playlist.shortcut remove click", this.playlist.PlaylistID);
		this.playlist.removeShortcut();
		$("#page_header a[name=shortcut]").parent().show();
		$("#page_header a[name=removeshortcut]").parent().hide()
	},
	"#page_header button.deleteSongs click": function () {
		console.log("plist.controls.deleteSongs click");
		var a = this.element.find(".gs_grid:last").controller(),
			b = [],
			c;
		if (a && a.selectedRowIDs.length > 0) for (c = 0; c < a.selectedRowIDs.length; c++) {
			var g = this.playlist.gridKeyLookup[a.selectedRowIDs[c]];
			g && b.push(this.playlist.songs.indexOf(g))
		}
		b.length && this.playlist.removeSongs(b)
	},
	"#page_header button.save click": function () {
		console.log("playlist.save.button click");
		this.playlist.save()
	},
	"#page_header button.undo click": function () {
		console.log("playlist.undo.button click");
		this.playlist.undo()
	},
	"#page_header button.subscribe click": function () {
		console.log("playlist.subscribe.button click");
		this.playlist.subscribe();
		$("#page_header button.subscribe").hide();
		$("#page_header button.unsubscribe").show()
	},
	"#page_header button.unsubscribe click": function () {
		console.log("playlist.unsubscribe.button click");
		this.playlist.unsubscribe();
		$("#page_header button.subscribe").show();
		$("#page_header button.unsubscribe").hide()
	}
});
GS.Controllers.PageController.extend("GS.Controllers.Page.SearchController", {
	cache: {}
}, {
	defaultType: "song",
	validTypes: {
		song: true,
		playlist: true,
		user: true,
		event: true,
		album: true,
		artist: true
	},
	query: "",
	type: "",
	ppOverride: false,
	testVersions: {
		current: 100,
		header: 1,
		options: 1,
		headerAndOptions: 1
	},
	currentTestVersion: "current",
	index: function (a, b) {
		this.ppOverride = false;
		if (b.indexOf("ppVersion:", 0) == 0) {
			queryAsArray = b.split(/\s+/);
			this.ppOverride = queryAsArray[0].split(":")[1];
			b = queryAsArray.splice(1, queryAsArray.length).join(" ")
		}
		this.query = _.orEqual(b, "");
		this.query = this.query.replace(/\+/g, " ");
		this.query = this.query.replace(/\t/g, " ");
		this.cleanQuery = _.cleanText(this.query);
		if ((this.type = _.orEqual(a, "")) && !this.validTypes[this.type]) this.type = this.defaultType;
		GS.search.lastSearch = GS.search.search;
		GS.search.lastType = GS.search.type;
		GS.search.search = this.query;
		GS.search.type = this.type;
		this.currentTestVersion = store.get("gs.search.testVersion.1");
		if (!this.currentTestVersion) {
			this.currentTestVersion = _.randWeightedIndex(this.testVersions);
			store.set("gs.search.testVersion.1", this.currentTestVersion)
		}
		GS.guts.gaTrackEvent("search", "testVersion", this.currentTestVersion);
		this.type ? GS.Controllers.PageController.title("All " + _.ucwords(this.type) + " Results: " + this.query) : GS.Controllers.PageController.title("Search: " + this.query);
		this.element.html(this.view("index"));
		$("input[name=q]", this.element).val(this.query);
		$("input.search").select();
		if (this.query === "") {
			this.element.find(".gs_grid." + a).html(this.view("/shared/noResults", {
				type: this.type,
				isSearch: true
			}));
			$(".gs_grid input[name=q]", this.element).val(this.query);
			$("#searchForm input").select();
			this.addAutocomplete("search")
		} else {
			$("#page_search a.remove").removeClass("hide");
			$.publish("gs.page.loading.grid");
			this.type ? this.getResults() : this.getResults(false, "song", this.callback(function () {
				this.getResults(this.callback(function (c) {
					if ($("#page_content").is(".profile.search")) if (c && c.length) {
						this.artists = c.slice(0, 4);
						$("#searchArtists").html(this.view("topArtists"))
					}
				}), "artist", this.callback(function () {
					if ($("#page_content").is(".profile.search")) if (!GS.user.IsPremium) {
						var c = $('<iframe id="searchCapitalFrame" name="searchCapitalFrame" height="200" width="200" frameborder="0" ></iframe>');
						c.attr("src", "/afcSearchAds.php?q=" + this.query + " music&t=" + (this.type || "song"));
						console.warn(c);
						$("#searchCapital").html(c)
					}
				}));
				this.getResults(this.callback(function (c) {
					if ($("#page_content").is(".profile.search")) if (c && c.length) {
						this.albums = c.slice(0, 4);
						$("#searchAlbums").html(this.view("topAlbums"))
					}
				}), "album");
				this.getResults(this.callback(function (c) {
					if ($("#page_content").is(".profile.search")) if (c && c.length) {
						this.playlists = c.slice(0, 4);
						$("#searchPlaylists").html(this.view("topPlaylists"))
					}
				}), "playlist");
				this.getResults(this.callback(function (c) {
					if ($("#page_content").is(".profile.search")) if (c && c.length) {
						this.users = c.slice(0, 4);
						$("#searchUsers").html(this.view("topUsers"))
					}
				}), "user")
			}));
			$(window).resize()
		}
	},
	getResults: function (a, b, c) {
		var g = this.type;
		cacheKey = "";
		serviceCallback = this.callback(function (h, k, m) {
			if (h === this.query) {
				var o, r, s = false,
					u = {
						sortCol: "Score",
						sortDir: 0
					};
				GS.Controllers.Page.SearchController.cache[k] = m;
				if ($.isArray(m.result)) {
					if ($.isArray(g) && g.length === 1) g = g[0];
					g = g.substring(0, g.length - 1);
					r = GS.Models[_.ucwords(g)].wrapCollection(m.result)
				} else {
					r = {};
					_.forEach(m.result, function (C, v) {
						var H = v.substring(0, v.length - 1);
						r[H] = GS.Models[H].wrapCollection(C)
					})
				}
				if (r && r.length) {
					g = g.toLowerCase();
					if (g === "song") {
						o = GS.Controllers.GridController.columns.song.concat();
						h = [o[0], o[1], o[2]];
						if (!this.type) {
							if (r.length > 50) s = true;
							r = r.slice(0, 50)
						}
					} else {
						h = GS.Controllers.GridController.columns[g];
						if (g === "event") {
							u = {
								sortCol: "StartTime",
								sortDir: 1,
								rowCssClasses: function () {
									return "event"
								}
							};
							for (var w = 0; w < r.length; w++) {
								r[w].EventID = w;
								r[w].StartTime = (new Date(r[w].StartTime * 1E3)).format("Y-m-d G:i:s");
								r[w].ArtistName = r[w].ArtistName || r[w].Artists
							}
						}
					}
					if (this.type || g == "song") {
						GS.search.version = m.version;
						GS.guts.logEvent("search", {
							type: this.type || "everything",
							searchString: this.query,
							searchVersion: m.version,
							testVersion: this.currentTestVersion
						});
						GS.guts.beginContext({
							mostRecentSearch: this.query,
							mostRecentSearchType: this.type || "everything",
							mostRecentSearchVersion: m.version,
							mostRecentTestVersion: this.currentTestVersion
						})
					}
					if ($.isFunction(a)) a(r, k);
					else {
						if (!this.type) {
							u.autoHeight = true;
							u.padding = 0;
							$("#grid").attr("data-profile-view", 1).width($("#page").innerWidth() - $("#search_side_pane").width() - 30).height(25 * r.length + u.padding * 2);
							if (this.element.width() < 800) h = [o[0], o[1]];
							s && $(".belowGrid", this.element).show()
						}
						this.element.find(".gs_grid." + g).gs_grid(r, h, u, g)
					}
				} else if ($.isFunction(a)) a(r, k);
				else {
					g = this.type || "song";
					this.element.find(".gs_grid." + g.toLowerCase()).html(this.view("/shared/noResults", {
						type: g.toLowerCase(),
						isSearch: true
					}));
					$(".gs_grid input[name=q]", this.element).val(this.query);
					$("#searchForm input").select();
					this.addAutocomplete("search")
				}
				$.isFunction(c) && c()
			}
		});
		g = _.orEqual(b, g);
		g = $.isArray(g) ? g : _.ucwords(g) + "s";
		cacheKey = g + ":" + this.query + ":" + this.ppOverride;
		GS.Controllers.Page.SearchController.cache[cacheKey] ? serviceCallback(this.query, cacheKey, GS.Controllers.Page.SearchController.cache[cacheKey]) : GS.service.getSearchResultsEx(this.query, g, this.ppOverride, this.callback(serviceCallback, this.query, cacheKey), this.callback(serviceCallback, this.query, cacheKey))
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.LoginController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		$("#lightbox_footer li").show();
		a && a.username && $("input[name=username]", this.element).val(a.username);
		a && a.error ? this.showError(a.error) : this.element.find(".error").hide();
		this.showCTA = a && a.showCTA ? true : false;
		$("#login_anywhere_cta").toggleClass("hide", !this.showCTA);
		this.resumeRedeem = a && a.resumeRedeem ? true : false;
		if (a && a.premiumRequired) {
			this.premiumRequired = true;
			$("h3", "#lightbox_header").localeDataString("POPUP_SIGNUP_LOGIN_PREMIUM_TITLE")
		} else {
			this.premiumRequired = false;
			$("h3", "#lightbox_header").localeDataString("POPUP_LOGIN_TITLE")
		}
		$("#login_redeem_msg").toggleClass("hide", !this.resumeRedeem);
		$("#login_premium_msg").toggleClass("hide", !this.premiumRequired);
		$("#login_default_msg").toggleClass("hide", this.resumeRedeem || this.premiumRequired);
		$("input[name=password]", this.element).val("");
		$("input[name=username]", this.element).focus()
	},
	showError: function (a) {
		console.log("showError", a, $("div.message", this.element));
		$("div.message", this.element).html($.localize.getString(a));
		this.element.find(".error").show()
	},
	showMessage: function (a) {
		console.log("showMessage", a);
		$("div.message", this.element).html(a);
		this.element.find(".error").show()
	},
	"input focus": function (a) {
		$(a).parent().parent().addClass("active")
	},
	"input blur": function (a) {
		$(a).parent().parent().removeClass("active")
	},
	"a.submit click": function () {
		console.log("login.a.submit.click form subm");
		$("form", this.element).submit()
	},
	"a.signup click": function () {
		GS.lightbox.close();
		GS.lightbox.open("signup")
	},
	"a.upgrade click": function () {
		GS.lightbox.close();
		window.location.hash = "#/settings/subscriptions"
	},
	"a.forget,a.forgot click": function () {
		GS.lightbox.close();
		GS.lightbox.open("forget")
	},
	"form submit": function (a) {
		console.log("login.form.subm");
		var b = $("input[name=username]", a).val(),
			c = $("input[name=password]", a).val();
		a = $("input[name=save]", a).val() ? 1 : 0;
		switch (b.toLowerCase()) {
		case "dbg:googlelogin":
			GS.google.lastError ? this.showMessage("Last Google Login Error: " + GS.google.lastError) : this.showMessage("There does not appear to be any errors with Google Login");
			break;
		default:
			GS.auth.login(b, c, a, this.callback(this.loginSuccess), this.callback(this.loginFailed));
			break
		}
	},
	"a.signup click": function () {
		GS.lightbox.close();
		GS.lightbox.open("signup")
	},
	"button.facebookLogin click": function () {
		GS.auth.loginViaFacebook(this.callback(this.loginSuccess), this.callback(this.loginFailed))
	},
	"button.googleLogin click": function () {
		GS.auth.loginViaGoogle(this.callback(this.loginSuccess), this.callback(this.loginFailed))
	},
	loginSuccess: function () {
		GS.lightbox.close();
		if (this.resumeRedeem) {
			console.error("RESUME REDEEM WITH AUTOSUBMIT");
			GS.lightbox.open("redeem", {
				autoSubmit: true
			})
		}
	},
	loginFailed: function (a) {
		console.log("lb.loginfail", arguments);
		if (a.error) this.showError(a.error);
		else if (a && a.authType == "facebook") this.showError("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR");
		else if (a && a.authType == "google") this.showError("POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR");
		else a && a.userID == 0 ? this.showError("POPUP_SIGNUP_LOGIN_FORM_AUTH_ERROR") : this.showError("POPUP_SIGNUP_LOGIN_FORM_GENERAL_ERROR");
		GS.lightbox.positionLightbox()
	}
});
(function () {
	var a = {
		1: {
			message: "POPUP_SIGNUP_FORM_UNKNOWN_ERROR"
		},
		2: {
			message: "POPUP_SIGNUP_FORM_DUPLICATE_EMAIL",
			fields: ["#signup_email"]
		},
		4: {
			message: "POPUP_SIGNUP_FORM_DUPLICATE_USERNAME",
			fields: ["#signup_username"]
		},
		8: {
			message: "POPUP_SIGNUP_FORM_INVALID_PASSWORD",
			fields: ["#signup_password"]
		},
		16: {
			message: "POPUP_SIGNUP_FORM_MISSING_GENDER",
			fields: ["#sex_M", "#sex_F"]
		},
		32: {
			message: "POPUP_SIGNUP_FORM_MISSING_NAME",
			fields: ["#signup_fname"]
		},
		64: {
			message: "POPUP_SIGNUP_FORM_USERNAME_LENGTH_ERROR",
			fields: ["#signup_username"]
		},
		128: {
			message: "POPUP_SIGNUP_FORM_INVALID_USERNAME",
			fields: ["#signup_username"]
		},
		256: {
			message: "POPUP_SIGNUP_FORM_INVALID_EMAIL",
			fields: ["#signup_email"]
		},
		512: {
			message: "POPUP_SIGNUP_FORM_TOO_YOUNG",
			fields: []
		},
		1024: {
			message: "POPUP_SIGNUP_FORM_PASSWORD_NO_MATCH",
			fields: ["#signup_password", "#signup_password2"]
		},
		2048: {
			message: "POPUP_SIGNUP_FORM_MUST_ACCEPT_TOS",
			fields: ["#signup_tos"]
		},
		4096: {
			message: "POPUP_SIGNUP_FORM_MISSING_DOB",
			fields: []
		}
	};
	GS.Controllers.InviteInterface.extend("GS.Controllers.Lightbox.SignupController", {
		onDocument: false
	}, {
		scrollDuration: 1600,
		curStage: false,
		stages: {
			profile1: "profile1",
			profile2: "profile2",
			invite: "invite",
			upgrade: "upgrade",
			complete: "complete"
		},
		userInfo: {},
		googleContacts: null,
		facebookFriends: [],
		fbIDs: {},
		slickbox: false,
		init: function (b, c) {
			this.update(c)
		},
		update: function (b) {
			this.today = new Date;
			this.months = $.localize.getString("MONTHS").split(",");
			this.expYears = [];
			for (var c = (new Date).getFullYear(), g = 0; g < 5; g++) this.expYears.push(c + g);
			this.element.html(this.view("/lightbox/signup/index"));
			if (b && b.vipPackage && b.gotoComplete) {
				this.vipPackage = b.vipPackage;
				setTimeout(this.callback(function () {
					$("#lightbox_content").scrollTop(2E3);
					this.initComplete(this.vipPackage)
				}), $.browser.msie ? 1E3 : 1)
			} else if (b && b.gotoUpgrade) setTimeout(this.callback(function () {
				$("#lightbox_content").scrollTop(1500);
				this.initUpgrade()
			}), $.browser.msie ? 1E3 : 1);
			else b && b.gotoInvite ? setTimeout(this.callback(function () {
				$("#lightbox_content").scrollTop(1E3);
				this.initInvite()
			}), $.browser.msie ? 1E3 : 1) : this.initProfile1();
			this.isFacebook = false;
			this.fbSession = {};
			this.isGoogle = false;
			if (b) {
				b.username && $("input[name=username]", this.element).val(b.username);
				b.fname && $("input[name=fname]", this.element).val(b.fname);
				b.email && $("input[name=email]", this.element).val(b.email);
				b.month && $("select[name=month]", this.element).val(b.month);
				b.day && $("select[name=day]", this.element).val(b.day);
				b.year && $("select[name=year]", this.element).val(b.year);
				b.sex && $("#sex_" + b.sex, this.element).attr("checked", "checked");
				if (b.isFacebook) {
					this.isFacebook = true;
					if (b.session) this.fbSession = b.session;
					$("li.password").hide();
					a[1024] = "POPUP_SIGNUP_FORM_FACEBOOK_GENERAL_ERROR";
					a[2048] = "POPUP_SIGNUP_FORM_FACEBOOK_GENERAL_ERROR";
					a[4096] = "FACEBOOK_DUPLICATE_ACCOUNT_ERROR_MSG"
				} else if (b.isGoogle) {
					this.isGoogle = true;
					$("li.password").hide();
					a[2048] = "POPUP_SIGNUP_FORM_GOOGLE_GENERAL_ERROR";
					a[4096] = "GOOGLE_DUPLICATE_ACCOUNT_ERROR_MSG"
				}
				b.error && this.element.find(".error").show().find(".message").html(b.error);
				b.message && this.element.find(".intro-message").show().find(".message").html(b.message);
				$(".selectbox.month span").html($(".selectbox.month").find("option:selected").html());
				$(".selectbox.day span").html($(".selectbox.day").find("option:selected").html());
				$(".selectbox.year span").html($(".selectbox.year").find("option:selected").html());
				this.bExtend = (this.bExtend = _.orEqual(b.bExtend, 0)) ? 1 : 0
			}
		},
		initProfile1: function () {
			this.curStage = this.stages.profile1;
			$("#lightbox_content").scrollTo("#signup_profile1", this.scrollDuration);
			$("#lightbox_footer li").hide();
			$("#lightbox_footer li.next").show();
			$("#signup_username").focus();
			GS.lightbox.trackLightboxView("signup/profile1")
		},
		initProfile2: function () {
			$("#signup_profile2").children().length || $("#signup_profile2").html(this.view("/lightbox/signup/profileStep2"));
			this.curStage = this.stages.profile2;
			$("#lightbox_content").scrollTo("#signup_profile2", this.scrollDuration);
			$("#lightbox_footer li").hide();
			$("#lightbox_footer li.back").show();
			$("#lightbox_footer li.next").show();
			$("#signup_fname").focus();
			GS.lightbox.trackLightboxView("signup/profile2")
		},
		initInvite: function () {
			this.curStage = this.stages.invite;
			this.submitType = "facebook";
			$("#signup_inviteSection").html(this.view("/lightbox/signup/invite"));
			$("#lightbox_content").scrollTo("#signup_inviteSection", this.scrollDuration);
			$("#lightbox_footer li").hide();
			$("#lightbox_footer li.back").hide();
			$("#lightbox_footer li.next").show();
			if (GS.user.isLoggedIn) GS.service.getContactInfoForFollowers(this.callback("onFollowersSuccess"), this.callback("onFollowersFailed"));
			else {
				new $.TextboxList("#emails", {
					addOnBlur: true,
					bitsOptions: {
						editable: {
							growing: true,
							growingOptions: {
								maxWidth: $("#emails").innerWidth() - 10
							}
						}
					}
				});
				$("#signupInvite input.textboxlist-bit-editable-input").focus()
			}
			GS.facebook.getFriends(this.callback("onFacebookFriends"));
			this.subscribe("gs.facebook.status", this.callback(function () {
				GS.facebook.getFriends(this.callback("onFacebookFriends"))
			}));
			GS.lightbox.trackLightboxView("signup/invite")
		},
		onFacebookFriendsCallback: function () {
			console.warn("onFacebookFriendscallback", this.facebookFriends.length);
			this.submitType === "facebook" && $("ul.menu li.facebook").removeClass("active").click()
		},
		initUpgrade: function () {
			this.curStage = this.stages.upgrade;
			$("#signup_upgradeSection").html(this.view("/lightbox/signup/upgrade"));
			$("#lightbox_footer").show();
			$("#lightbox_content").scrollTo("#signup_upgradeSection", this.scrollDuration);
			$("#lightbox_footer li").hide();
			$("#lightbox_footer li.back").hide();
			$("#lightbox_footer li.nothanks").show();
			GS.lightbox.trackLightboxView("signup/upgrade")
		},
		"#signup_inviteSection ul.menu li click": function (b) {
			console.warn("invite menu click", b.is(".active"));
			if (!b.is(".active")) {
				b.addClass("active").siblings().removeClass("active");
				this.submitType = b = $.trim(b.attr("class").replace(/(\s+)?(active)(\s+)?/g, ""));
				$("#signupInvite .content .inviteContainer." + b).show().siblings().hide();
				if (b === "facebook") if (this.facebookFriends.length == 0) $(".inviteContainer.facebook .contactsContainer", this.element).show().html(this.view("/shared/inviteFacebook"));
				else this.slickbox = $(".inviteContainer.facebook .contactsContainer", this.element).html("").show().slickbox({
					itemRenderer: this.facebookItemRenderer,
					itemClass: this.facebookItemClass,
					itemWidth: 205,
					itemHeight: 45,
					verticalGap: 5,
					horizontalGap: 8,
					hidePositionInfo: true,
					listClass: "contacts facebook_contacts"
				}, this.facebookFriends);
				else b === "email" && setTimeout(function () {
					$("#signupInvite .textboxlist-bit-editable-input").focus()
				}, 0)
			}
		},
		initComplete: function (b) {
			this.curStage = this.stages.complete;
			this.vipPackage = b;
			$("#signup_completeSection").html(this.view("/lightbox/signup/complete"));
			$("#lightbox_footer").show();
			$("#lightbox_content").scrollTo("#signup_completeSection", this.scrollDuration);
			$("#lightbox_footer li").hide();
			$("#lightbox_footer li.finish").show();
			location.hash = "/";
			GS.lightbox.trackLightboxView("signup/complete")
		},
		"a.login click": function () {
			GS.lightbox.close();
			GS.lightbox.open("login")
		},
		"#lightbox_footer li.submit, #pane_footer li.submit click": function (b, c) {
			c.preventDefault();
			if (this.curStage == this.stages.profile1) this.checkProfile1() && this.initProfile2();
			else if (this.curStage == this.stages.profile2) this.profileSubmit() && this.initInvite();
			else if (this.curStage == this.stages.invite) this.inviteSubmit() && this.initUpgrade();
			else if (this.curStage == this.stages.upgrade) this.initComplete();
			else if (this.curStage == this.stages.complete) {
				GS.facebook.connected || setTimeout(this.callback(function () {
					$.publish("gs.facebook.notification.connect", {})
				}), 3E3);
				GS.lightbox.close()
			}
			return false
		},
		"#lightbox_footer li.back, #pane_footer li.back click": function (b, c) {
			c.preventDefault();
			if (this.curStage == this.stages.profile2) this.initProfile1();
			else if (this.curStage == this.stages.invite) this.initProfile2();
			else if (this.curStage == this.stages.upgrade) this.initInvite();
			else this.curStage == this.stages.complete && this.initInvite();
			return false
		},
		"#lightbox_footer li.close click": function () {
			GS.lightbox.close()
		},
		"#signupUpgrade li.upgrade click": function (b) {
			b = b.is(".plus") ? "plus" : "anywhere";
			GS.lightbox.close();
			GS.lightbox.open("vipSignup", {
				vipPackage: b,
				isSignup: true,
				bExtend: this.bExtend
			})
		},
		"#signup_username change": function (b) {
			var c = /^([a-zA-Z0-9]+[\.\-_]?)+[a-zA-Z0-9]+$/,
				g = b.val();
			this.element.find(".error.response").hide();
			if (g !== "" && g.match(c) && g.length && !(g.length < 5 || g.length > 32)) b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
			else {
				b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
				this.signupFailed({
					errorCode: 128
				})
			}
		},
		"#signup_password change": function (b) {
			var c = b.val(),
				g = $("#signup_password2").val();
			this.element.find(".error.response").hide();
			if (c !== "" && c.length && !(c.length < 5 || c.length > 32)) {
				b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
				if (c === g) $("#signup_password2").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
				else g !== "" && this.signupFailed({
					errorCode: 1024
				})
			} else {
				b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
				this.signupFailed({
					errorCode: 8
				})
			}
		},
		"#signup_password2 change": function (b) {
			var c = $("#signup_password").val(),
				g = b.val();
			this.element.find(".error.response").hide();
			if (g && c === g) {
				b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
				$("#signup_password").change()
			} else {
				b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
				$("#signup_password").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
				this.signupFailed({
					errorCode: 1024
				})
			}
		},
		"#signup_email change": function (b) {
			var c = b.val();
			this.element.find(".error.response").hide();
			if (c.match(_.emailRegex)) b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
			else {
				b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
				this.signupFailed({
					errorCode: 256
				})
			}
		},
		"#signup_fname change": function (b) {
			b.val() !== "" ? b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error")
		},
		"#signup_tos change": function (b) {
			b.is(":checked") ? b.parent().removeClass("error") : b.parent().addClass("error")
		},
		"input,select keydown": function (b, c) {
			c.keyCode && c.keyCode == 13 && !b.is("[name*=google]") && $("#lightbox_footer li.submit:visible, #pane_footer li.submit:visible").click()
		},
		"select focus": function (b) {
			b.parents(".input_wrapper").addClass("active")
		},
		"select blur": function (b) {
			b.parents(".input_wrapper").removeClass("active");
			b.change()
		},
		"select keydown": function (b) {
			b.change()
		},
		"select.country,#signup_country change": function (b) {
			$(".selectbox.country span").html(b.find("option:selected").html())
		},
		"select.month change": function (b) {
			$(".selectbox.month span").html(b.find("option:selected").html())
		},
		"select.day change": function (b) {
			$(".selectbox.day span").html(b.find("option:selected").html())
		},
		"select.year change": function (b) {
			$(".selectbox.year span").html(b.find("option:selected").html())
		},
		"select.year,select.month,select.day change": function () {
			var b = parseInt($("select[name=month]", this.element).val(), 10),
				c = parseInt($("select[name=year]", this.element).val(), 10),
				g = parseInt($("select[name=day]", this.element).val(), 10),
				h = $("select[name=month]", this.element).find("option:selected").val(),
				k = $("select[name=year]", this.element).find("option:selected").val(),
				m = $("select[name=day]", this.element).find("option:selected").val();
			this.element.find(".error.response").hide();
			k !== "" && (!c || c < 0) ? $("select[name=year]", this.element).parents(".input_wrapper").addClass("error").parent().siblings("label").addClass("error") : $("select[name=year]", this.element).parents(".input_wrapper").removeClass("error").parent().siblings("label").removeClass("error");
			h !== "" && (!b || b < 0) ? $("select[name=month]", this.element).parents(".input_wrapper").addClass("error").parent().siblings("label").addClass("error") : $("select[name=month]", this.element).parents(".input_wrapper").removeClass("error").parent().siblings("label").removeClass("error");
			m !== "" && (!g || g < 0) ? $("select[name=day]", this.element).parents(".input_wrapper").addClass("error").parent().siblings("label").addClass("error") : $("select[name=day]", this.element).parents(".input_wrapper").removeClass("error").parent().siblings("label").removeClass("error");
			if (c && b && g) {
				b = new Date(c, b, g);
				b = (new Date).getTime() - b.getTime();
				b = b / 864E5;
				b = Math.floor(b / 365.24);
				if (b < 13) {
					$(".input_wrapper.year, .input_wrapper.month, .input_wrapper.day").addClass("error").parent().siblings("label").addClass("error");
					this.signupFailed({
						errorCode: 512
					})
				} else $(".input_wrapper.year, .input_wrapper.month, .input_wrapper.day").removeClass("error").parent().siblings("label").removeClass("error")
			}
		},
		"#signupAccount li.sex_field label mousedown": function (b) {
			$(b).data("previous", $("#signupAccount input[name=sex]:checked").val())
		},
		"#signupAccount li.sex_field label click": function (b, c) {
			var g = $("input", b);
			if ($(g).val() === $(b).data("previous")) {
				$("#sex_Deselect").attr("checked", "checked");
				c.preventDefault();
				$(g).blur();
				return false
			}
		},
		".error.response a.toggle click": function (b) {
			$(b).closest(".error.response").hide()
		},
		checkProfile1: function () {
			var b = true,
				c = $("#signupAccount input[name=username]").val(),
				g = $("#signupAccount input[name=email]").val(),
				h = $("#signupAccount input[name=password]").val(),
				k = $("#signupAccount input[name=password2]").val(),
				m = $("#signupAccount input[name=tos]").is(":checked"),
				o = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
				r = 0;
			this.element.find(".error.response").hide();
			c.length || (r |= 64);
			c.match(/^([a-zA-Z0-9]+[\.\-_]?)+[a-zA-Z0-9]+$/) || (r |= 128);
			if (!g.length || !g.match(o)) r |= 256;
			if (!this.isFacebook && !this.isGoogle) {
				if (h.length < 5 || h.length > 32) r |= 8;
				if (h !== k) r |= 1024
			}
			m || (r |= 2048);
			GS.service.getIsUsernameEmailAvailable(c, g, this.callback(function (s) {
				if (!s.username && c.length) r |= 4;
				if (!s.email && g.length) r |= 2
			}), null, {
				async: false
			});
			if (r > 0) {
				this.signupFailed({
					errorCode: r
				});
				b = false
			} else {
				this.element.find(".error.response").hide();
				this.element.find(".intro-message.response").hide();
				$("#signup_username").change();
				$("#signup_email").change();
				$("#signup_tos").change();
				if (!this.isGoogle && !this.isFacebook) {
					$("#signup_password").change();
					$("#signup_password2").change()
				}
				if ($("#signupAccount .input_wrapper.error, #signupAccount p.tos.error").length) b = false
			}
			return b
		},
		profileSubmit: function () {
			console.log("signup.profileSubmit. form.submit", this);
			var b = $("#signupAccount input[name=username]").val(),
				c = $("#signupAccount input[name=password]").val(),
				g = $("#signupAccount input[name=email]").val(),
				h = $("#signupAccount input[name=fname]").val(),
				k = $("#signupAccount input[name=sex]:checked").val(),
				m = [$("#signupAccount select[name=year]").val(), $("#signupAccount select[name=month]").val(), $("#signupAccount select[name=day]").val()].join("-");
			$("#signupAccount input[name=tos]").is(":checked");
			$("#signupAccount input[name=artist]").is(":checked");
			var o = parseInt($("select[name=month]", this.element).val(), 10),
				r = parseInt($("select[name=year]", this.element).val(), 10),
				s = parseInt($("select[name=day]", this.element).val(), 10),
				u = 0;
			this.element.find(".error.response").hide();
			$("select.year,select.month,select.day", this.element).change();
			$("#signup_fname").change();
			if (r && o && s) {
				birthDate = new Date(r, o, s);
				dateDiff = (new Date).getTime() - birthDate.getTime();
				ageDays = dateDiff / 864E5;
				ageYears = Math.floor(ageDays / 365.24);
				if (ageYears < 13) u |= 512
			} else {
				$(".input_wrapper.year, .input_wrapper.month, .input_wrapper.day").addClass("error").parent().siblings("label").addClass("error");
				u |= 4096
			}
			h.length || (u |= 32);
			k || (k = "");
			if (u > 0 || $("#signupAccount .input_wrapper.error, #signupAccount p.tos.error, #signupAccount div.field.error").length) {
				this.signupFailed({
					errorCode: u
				});
				return false
			}
			if (this.isFacebook) GS.auth.signupViaFacebook(b, h, g, k, m, this.fbSession, this.callback(this.signupSuccess), this.callback(this.signupFailed));
			else this.isGoogle ? GS.auth.signupViaGoogle(b, h, g, k, m, this.callback(this.signupSuccess), this.callback(this.signupFailed)) : GS.auth.signup(b, c, h, g, k, m, false, this.callback(this.signupSuccess), this.callback(this.signupFailed));
			return false
		},
		signupSuccess: function () {
			this.element.find(".error.response").hide();
			this.initInvite()
		},
		signupFailed: function (b) {
			var c, g = ['<ul class="errors">'];
			console.warn("lb.signupfailed, data, errorCode, details", b, b.errorCode, b.details);
			$.each(a, function (m, o) {
				if (b.errorCode & m) {
					g.push("<li>" + $.localize.getString(o.message) + " </li>");
					if (o.fields) for (i = 0; i < o.fields.length; i++) $(o.fields[i]).parents(".input_wrapper").addClass("error").siblings("label").addClass("error")
				}
			});
			g.push("</ul>");
			c = this.element.find(".error.response").show().find(".message");
			if (b.errorCode && b.errorCode & 2 && (this.isFacebook || this.isGoogle)) {
				var h = $("#signupAccount input[name=email]").val();
				if (this.isGoogle) {
					GS.google.onLoginSaveData = h;
					var k = $.localize.getString("POPUP_SIGNUP_FORM_GOOGLE_EMAIL_INUSE_LINK")
				} else if (this.isFacebook) {
					GS.facebook.onLoginSaveData = h;
					k = $.localize.getString("POPUP_SIGNUP_FORM_FACEBOOK_EMAIL_INUSE_LINK")
				}
				for (i = 0; i < g.length; i++) if (g[i].match(/email\saddress/)) {
					g[i] = g[i].replace(" </li>", k);
					break
				}
			}
			c.html("<strong>" + $.localize.getString("POPUP_SIGNUP_ERROR_MESSAGE") + "</strong> " + g.join(""));
			GS.lightbox.positionLightbox()
		},
		"#lightbox ul.errors .loginAs click": function (b, c) {
			c.preventDefault();
			GS.lightbox.close();
			if (this.isGoogle) GS.lightbox.open("login", {
				error: "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_EMAIL_INUSE",
				username: GS.google.onLoginSaveData
			});
			else this.isFacebook && GS.lightbox.open("login", {
				error: "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_EMAIL_INUSE",
				username: GS.facebook.onLoginSaveData
			})
		},
		inviteSubmit: function () {
			return true
		},
		"#signupInvite submit": function (b, c) {
			c.preventDefault();
			if (this.submitType.match("google")) this.submitType = $("ul.login", this.element).is(":visible") ? "googleLogin" : "googleContacts";
			this.formSubmit();
			return false
		},
		sendInviteSuccessCallback: function () {
			this.initUpgrade()
		},
		googContactsSuccessCallback: function () {
			this.submitType = "googleContacts";
			$("ul.google_contacts", this.element).html(this.view("/shared/googleContacts"));
			$(".inviteContainer.google ul.login", this.element).hide();
			$(".googleContacts", this.element).show();
			$("ul.google_contacts li:even").addClass("even contactRow_even");
			$("ul.google_contacts li:odd").addClass("odd contactRow_odd");
			$(".inviteContainer.google ul.submitButtons li.login", this.element).hide().siblings().show()
		},
		facebookSuccessCallback: function () {
			this.initUpgrade()
		},
		upgradeSubmit: function () {
			if (this.vipPackage === false) {
				this.initUpgrade();
				return false
			}
			return true
		},
		completeSubmit: function () {
			return true
		}
	})
})();
(function () {
	GS.Controllers.VipInterface.extend("GS.Controllers.Lightbox.VipSignupController", {
		onDocument: false
	}, {
		creditCardStages: {
			payment: "payment",
			billing: "billing",
			confirmation: "confirmation"
		},
		paypalStages: {
			payment: "payment",
			redirect: "redirect",
			confirmation: "confirmation"
		},
		offersStages: {
			promocode: "promocode",
			confirmation: "confirmation"
		},
		curCreditCardStage: false,
		curPaypalStage: false,
		curOffersStage: false,
		vipToken: false,
		vipCallbackUrl: false,
		recurring: true,
		vipPackage: false,
		paymentType: "creditcard",
		isSignup: false,
		init: function (a, b) {
			this.update(b)
		},
		update: function (a) {
			this.today = new Date;
			this.months = $.localize.getString("MONTHS").split(",");
			this.expYears = [];
			this.vip = this.anywhere = 0;
			this.excludedCountries = GS.Controllers.Lightbox.VipSignupController.excludedCreditCardCountries;
			this.paymentType = "creditcard";
			this.bExtend = (this.bExtend = _.orEqual(a.bExtend, 0)) ? 1 : 0;
			for (var b = (new Date).getFullYear(), c = 0; c < 10; c++) this.expYears.push(b + c);
			this.vipEndpoint = gsConfig.runMode == "production" ? "https://vip.grooveshark.com/" : "https://stagingvip.grooveshark.com/";
			this.vipToken = hex_md5((new Date).getTime());
			this.vipCallbackUrl = location.protocol + "//" + location.host + "/vipCallback.php";
			if (a && a.vipPackage) {
				this.anywhere = a.vipPackage === this.vipPackages.anywhere ? 1 : 0;
				this.vip = a.vipPackage === this.vipPackages.vip ? 1 : 0
			}
			if (this.vip) {
				this.monthPrice = this.vipPackagePrices.month.vip;
				this.yearPrice = this.vipPackagePrices.year.vip
			} else if (this.anywhere) {
				this.monthPrice = this.vipPackagePrices.month.anywhere;
				this.yearPrice = this.vipPackagePrices.year.anywhere
			} else {
				this.monthPrice = this.vipPackagePrices.month.plus;
				this.yearPrice = this.vipPackagePrices.year.plus
			}
			if (a && a.isSignup) this.isSignup = true;
			this.element.html(this.view("/lightbox/vipSignup"));
			if (a && a.initOffers) this.initOffersBilling();
			else a && a.initPaypal ? this.initPaypalBilling() : this.initCreditCardBilling();
			GS.lightbox.positionLightbox()
		},
		initCreditCardBilling: function () {
			this.paymentType = "creditcard";
			this.curCreditCardStage = this.creditCardStages.payment;
			$("#creditcard_content").show().siblings().hide();
			$("#creditcard_content ul.progress li.payment").addClass("active").siblings().removeClass("active progress_previousStep progress_currentStep").parent().removeClass("progress_onLast");
			$("#creditcard_content ul.stages li.stage.payment").show().siblings().hide();
			$("#billing_options .creditcard.pane a").addClass("active").parent().siblings().children("a").removeClass("active");
			$("#creditcard_content ul.progress li.payment").addClass("progress_currentStep").removeClass("progress_previousStep");
			$("#creditcard_content ul.progress li.billing").addClass("progress_nextStep").removeClass("active progress_currentStep");
			$(".selectbox.cardType span").html($("select.cardType option:selected").html());
			$(".selectbox.expMonth span").html($("select.expMonth option:selected").html());
			$(".selectbox.expYear span").html($("select.expYear option:selected").html());
			$(".selectbox.state span").html($("select.state option:selected").html());
			$(".selectbox.country span").html($("select#ccCountry option:selected").html());
			$("#pane_footer ul.right li.next").show().siblings().hide();
			this.isSignup ? $("#pane_footer ul.left li").show() : $("#pane_footer ul.left li").hide();
			this.element.find(".error.response").hide();
			GS.lightbox.trackLightboxView("vipSignup/creditcard1")
		},
		initPaypalBilling: function () {
			this.paymentType = "paypal";
			this.curPaypalStage = this.paypalStages.payment;
			$("#paypal_content").show().siblings("").hide();
			$("#paypal_content ul.progress li.payment").siblings().removeClass("active progress_previousStep progress_currentStep").parent().removeClass("progress_onLast");
			$("#paypal_content ul.stages li.stage.payment").show().siblings().hide();
			$("#billing_options .paypal.pane a").addClass("active").parent().siblings().children("a").removeClass("active");
			$("#paypal_content ul.progress li.payment").addClass("progress_currentStep").removeClass("progress_previousStep");
			$("#paypal_content ul.progress li.redirect").addClass("progress_nextStep").removeClass("active progress_currentStep");
			$(".selectbox.country span").html($("select#ccCountry option:selected").html());
			$("#pane_footer ul.right li").show();
			this.isSignup ? $("#pane_footer ul.left li").show() : $("#pane_footer ul.left li").hide();
			this.element.find(".error.response").hide();
			GS.lightbox.trackLightboxView("vipSignup/paypal1")
		},
		initCellPhoneBilling: function () {
			this.paymentType = "cellphone";
			$("#cellphone_content").show().siblings().hide();
			$("#cellphone_content ul.progress li.payment").addClass("active").siblings().removeClass("active progress_previousStep progress_currentStep").parent().removeClass("progress_onLast");
			$("#cellphone_content ul.stages li.stage.promocode").show().siblings().hide();
			$("#billing_options .cellphone.pane a").addClass("active").parent().siblings().children("a").removeClass("active");
			$("#pane_footer ul.right li").show();
			this.isSignup ? $("#pane_footer ul.left li").show() : $("#pane_footer ul.left li").hide();
			this.element.find(".error.response").hide();
			GS.lightbox.trackLightboxView("vipSignup/cellphone1")
		},
		initOffersBilling: function () {
			this.paymentType = "offers";
			this.curOffersStage = this.offersStages.promocode;
			this.recurring = false;
			$("#offers_content").show().siblings().hide();
			$("#billing_options .offers.pane a").addClass("active").parent().siblings().children("a").removeClass("active");
			$("#pane_footer ul.right li.next").show().siblings().hide();
			this.isSignup ? $("#pane_footer ul.left li").show() : $("#pane_footer ul.left li").hide();
			this.element.find(".error.response").hide();
			GS.lightbox.trackLightboxView("vipSignup/offers1");
			$("#offers_content ul.progress li.payment").addClass("active progress_currentStep").removeClass("progress_previousStep").siblings().removeClass("active progress_currentStep").parent().removeClass("progress_onLast")
		},
		"#billing_options .creditcard.pane click": function (a) {
			a.is(".active") || this.initCreditCardBilling()
		},
		"#billing_options .paypal.pane click": function (a) {
			a.is(".active") || this.initPaypalBilling()
		},
		"#billing_options .cellphone.pane click": function (a) {
			a.is(".active") || this.initCellPhoneBilling()
		},
		"#billing_options .offers.pane click": function (a) {
			a.is(".active") || this.initOffersBilling()
		},
		"#lightbox_footer li.submit, #pane_footer li.submit click": function (a, b) {
			b.preventDefault();
			if (this.paymentType === "creditcard") if (this.curCreditCardStage === this.creditCardStages.payment) {
				if (this.checkCreditCard1()) {
					$("#creditcard_content ul.progress li.payment").removeClass("progress_currentStep").addClass("progress_previousStep");
					$("#creditcard_content ul.progress li.billing").addClass("active progress_currentStep").removeClass("progress_nextStep");
					$("#creditcard_content ul.progress li.confirmation").addClass("progress_lastStep");
					$("#creditcard_content ul.stages li.stage.billing").show().siblings().hide();
					$("#creditcard_content ul.right li.next").show().siblings().hide();
					$("#creditcard_content ul.left li").show();
					this.curCreditCardStage = this.creditCardStages.billing;
					this.element.find(".error.response").hide();
					GS.lightbox.trackLightboxView("vipSignup/creditcard2")
				}
			} else {
				if (this.curCreditCardStage === this.creditCardStages.billing) if (this.checkCreditCard2()) return this.creditCardSubmit()
			} else if (this.paymentType === "paypal") if (this.curPaypalStage === this.paypalStages.payment) {
				$("#paypal_content ul.progress li.payment").removeClass("progress_currentStep").addClass("progress_previousStep");
				$("#paypal_content ul.progress li.redirect").addClass("active progress_currentStep").removeClass("progress_nextStep");
				$("#paypal_content ul.progress li.confirmation").addClass("progress_lastStep");
				$("#paypal_content ul.stages li.stage.redirect").show().siblings().hide();
				$("#paypal_content ul.right li.next").show().siblings().hide();
				$("#paypal_content ul.left li").show();
				this.curPaypalStage = this.paypalStages.redirect;
				this.element.find(".error.response").hide();
				GS.lightbox.trackLightboxView("vipSignup/paypal2")
			}
			this.billingSubmit();
			return false
		},
		"#lightbox_footer li.back, #pane_footer li.back click": function (a, b) {
			b.preventDefault();
			if (this.paymentType === "creditcard") if (this.curCreditCardStage === this.creditCardStages.payment) {
				if (this.isSignup) {
					GS.lightbox.close();
					GS.lightbox.open("signup", {
						gotoUpgrade: true
					})
				}
			} else if (this.curCreditCardStage === this.creditCardStages.billing) {
				$("#creditcard_content ul.progress li.payment").addClass("progress_currentStep").removeClass("progress_previousStep");
				$("#creditcard_content ul.progress li.billing").addClass("progress_nextStep").removeClass("active progress_currentStep");
				$("#creditcard_content ul.stages li.stage.payment").show().siblings().hide();
				$("#creditcard_content ul.right li.next").show().siblings().hide();
				this.isSignup ? $("#creditcard_content ul.left li").show() : $("#creditcard_content ul.left li").hide();
				this.curCreditCardStage = this.creditCardStages.payment;
				GS.lightbox.trackLightboxView("vipSignup/creditcard1")
			} else {
				if (this.curCreditCardStage === this.creditCardStages.confirmation) {
					$("#creditcard_content ul.progress li.billing").addClass("progress_currentStep").removeClass("progress_previousStep").parent().removeClass("progress_onLast");
					$("#creditcard_content ul.progress li:last").removeClass("active progress_currentStep");
					$("#creditcard_content ul.stages li.stage.billing").show().siblings().hide();
					$("#creditcard_content ul.right li.next").show().siblings().hide();
					$("#creditcard_content ul.left li").show();
					this.curCreditCardStage = this.creditCardStages.billing;
					GS.lightbox.trackLightboxView("vipSignup/creditcard2")
				}
			} else if (this.paymentType === "paypal") if (this.curPaypalStage === this.paypalStages.payment) {
				if (this.isSignup) {
					GS.lightbox.close();
					GS.lightbox.open("signup", {
						gotoUpgrade: true
					})
				}
			} else if (this.curPaypalStage === this.paypalStages.redirect) {
				$("#paypal_content ul.progress li.payment").addClass("progress_currentStep").removeClass("progress_previousStep");
				$("#paypal_content ul.progress li.redirect").addClass("progress_nextStep").removeClass("active progress_currentStep");
				$("#paypal_content ul.stages li.stage.payment").show().siblings().hide();
				$("#paypal_content ul.right li.next").show().siblings().hide();
				this.isSignup ? $("#paypal_content ul.left li").show() : $("#paypal_content ul.left li").hide();
				this.curPaypalStage = this.paypalStages.payment;
				GS.lightbox.trackLightboxView("vipSignup/paypal1")
			} else {
				if (this.curPaypalStage === this.paypalStages.confirmation) {
					$("#paypal_content ul.progress li.redirect").addClass("progress_currentStep").removeClass("progress_previousStep").parent().removeClass("progress_onLast");
					$("#paypal_content ul.progress li.confirmation").removeClass("active progress_currentStep");
					$("#paypal_content ul.stages li.stage.redirect").show().siblings().hide();
					$("#paypal_content ul.right li.next").show().siblings().hide();
					$("#paypal_content ul.left li").show();
					this.curPaypalStage = this.paypalStages.redirect;
					GS.lightbox.trackLightboxView("vipSignup/paypal2")
				}
			} else if (this.paymentType === "cellphone") return false;
			else if (this.paymentType === "offers") if (this.curOffersStage === this.offersStages.promocode) {
				if (this.isSignup) {
					GS.lightbox.close();
					GS.lightbox.open("signup", {
						gotoUpgrade: true
					})
				}
			} else {
				$("#offers_content ul.progress li.promocode").addClass("progress_currentStep active").removeClass("progress_previousStep").parent().removeClass("progress_onLast");
				$("#offers_content ul.progress li.confirmation").addClass("progress_nextStep").removeClass("active progress_currentStep").siblings().removeClass("progress_nextStep");
				$("#offers_content #pane_footer ul.right li").show();
				$("#offers_content ul.stages li.stage.promocode").show().siblings().hide();
				this.isSignup ? $("#offers_content ul.left li").show() : $("#offers_content ul.left li").hide();
				this.curOffersStage = this.offersStages.promocode;
				GS.lightbox.trackLightboxView("vipSignup/offers1")
			}
			return false
		},
		"#lightbox_footer li.close click": function () {
			GS.lightbox.close()
		},
		"select focus": function (a) {
			console.error("sel", a.parents(".input_wrapper"));
			a.parents(".input_wrapper").addClass("active")
		},
		"select blur": function (a) {
			a.parents(".input_wrapper").removeClass("active");
			a.change()
		},
		"select keydown": function (a) {
			a.change()
		},
		"select.month change": function (a) {
			$(".selectbox.month span").html(a.find("option:selected").html())
		},
		"select.day change": function (a) {
			$(".selectbox.day span").html(a.find("option:selected").html())
		},
		"select.year change": function (a) {
			$(".selectbox.year span").html(a.find("option:selected").html())
		},
		"select.cardType change": function (a) {
			$(".selectbox.cardType span").text(a.find("option:selected").html())
		},
		"select.expMonth change": function (a) {
			$(".selectbox.expMonth span").text(a.find("option:selected").html())
		},
		"select.expYear change": function (a) {
			$(".selectbox.expYear span").text(a.find("option:selected").html())
		},
		"select.state change": function (a) {
			$(".selectbox.state span").text(a.find("option:selected").html())
		},
		"select#ccCountry change": function (a) {
			var b = a.find("option:selected").val();
			$(".selectbox.country span").text(a.find("option:selected").html());
			b === "US" ? a.parents("ul").removeClass("showRegion", a.parents("ul")) : a.parents("ul").addClass("showRegion")
		},
		"select#paypalCountry change": function (a) {
			$(".selectbox.country span").text(a.find("option:selected").html())
		},
		".vipPackage input:radio change": function (a) {
			$(".vipPackage label").removeClass("active");
			$(a).closest("label").toggleClass("active", $(a).is(":checked"))
		},
		billingSubmit: function () {
			if (this.paymentType === "creditcard") {
				if (this.curCreditCardStage !== this.creditCardStages.payment) if (this.curCreditCardStage !== this.creditCardStages.billing) if (this.curCreditCardStage === this.creditCardStages.confirmation) return this.creditCardConfirmSubmit()
			} else if (this.paymentType === "paypal") {
				if (this.curPaypalStage !== this.paypalStages.payment) if (this.curPaypalStage === this.paypalStages.redirect) return this.paypalSubmit();
				else if (this.curPaypalStage === this.paypalStages.confirmation) return this.paypalConfirmSubmit()
			} else if (this.paymentType === "offers") if (this.curOffersStage === this.offersStages.promocode) return this.offersSubmit();
			else {
				if (this.curOffersStage === this.offersStages.confirmation) return this.offersConfirmSubmit()
			} else if (this.paymentType === "cellphone") return this.cellphoneSubmit();
			return false
		},
		checkCreditCard1: function () {
			var a = [],
				b = /[^\d ]/,
				c = $("#creditcard_content select[name=cardType]").val(),
				g = $("#creditcard_content input[name=cardNumber]").val().replace(/(\s+)/g, "").replace(/(-)/g, ""),
				h = $("#creditcard_content input[name=secCode]").val(),
				k = $("#creditcard_content select[name=expMonth]").val(),
				m = $("#creditcard_content select[name=expYear]").val();
			this.element.find(".error.response").hide();
			if (!c || !g || !h || !k || !m) a.push({
				errorID: "CC-03"
			});
			c ? $("#creditcard_content select[name=cardType]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=cardType]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			if (!g || g.length > 16 || g.length < 13 || b.test(g)) {
				a.push({
					message: $.localize.getString("VIP_ERROR_CARD_NUMBER")
				});
				$("#creditcard_content input[name=cardNumber]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error")
			} else $("#creditcard_content input[name=cardNumber]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
			if (!h || h.length > 4 || h.length < 3 || b.test(h)) {
				a.push({
					message: $.localize.getString("VIP_ERROR_INVALID_CVD")
				});
				$("#creditcard_content input[name=secCode]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error")
			} else $("#creditcard_content input[name=secCode]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
			k ? $("#creditcard_content select[name=expMonth]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=expMonth]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			m ? $("#creditcard_content select[name=expYear]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=expYear]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			if (a.length) {
				this.showVipErrors({
					error: a
				});
				return false
			}
			return true
		},
		checkCreditCard2: function () {
			var a = [],
				b = $("#creditcard_content select[name=country]").val(),
				c = $("#creditcard_content input[name=fname]").val(),
				g = $("#creditcard_content input[name=lname]").val(),
				h = $("#creditcard_content input[name=address1]").val(),
				k = $("#creditcard_content input[name=city]").val(),
				m = $("#creditcard_content input[name=zip]").val();
			this.element.find(".error.response").hide();
			if (!b || !k || !m || !h) a.push({
				errorID: "CC-03"
			});
			if (!c || !g) a.push({
				errorID: "CC-01"
			});
			b ? $("#creditcard_content select[name=iso]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=iso]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			c ? $("#creditcard_content input[name=fname]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=fname]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			g ? $("#creditcard_content input[name=lname]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=lname]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			h ? $("#creditcard_content input[name=address1]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=address1]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			k ? $("#creditcard_content input[name=city]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=city]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			m ? $("#creditcard_content input[name=zip]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=zip]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
			$("#signupBilling .input_wrapper.error, #signupBilling p.tos.error, #signupBilling div.field.error");
			if (a.length) {
				this.showVipErrors({
					error: a
				});
				return false
			}
			return true
		},
		creditCardSubmit: function () {
			var a = hex_md5((new Date).getTime()),
				b = {
					vipToken: this.vipToken,
					callbackMethod: a,
					callbackUrl: this.vipCallbackUrl,
					vipPackage: $("#creditcard_content input[name=ccPackage]:checked").val(),
					anywhere: this.anywhere,
					bExtend: this.bExtend,
					recurring: 1,
					iso: $("#creditcard_content select[name=country]").val(),
					fName: $("#creditcard_content input[name=fname]").val(),
					lName: $("#creditcard_content input[name=lname]").val(),
					cardType: $("#creditcard_content select[name=cardType]").val(),
					expMonth: $("#creditcard_content select[name=expMonth]").val(),
					expYear: $("#creditcard_content select[name=expYear]").val(),
					cardNumber: $("#creditcard_content input[name=cardNumber]").val().replace(/(\s+)/g, "").replace(/(-)/g, ""),
					secCode: $("#creditcard_content input[name=secCode]").val(),
					address1: $("#creditcard_content input[name=address1]").val(),
					address2: $("#creditcard_content input[name=address2]").val(),
					city: $("#creditcard_content input[name=city]").val(),
					state: $("#creditcard_content select[name=state]").val(),
					region: $("#creditcard_content input[name=region]").val(),
					zip: $("#creditcard_content input[name=zip]").val()
				};
			GS.service.httpsFormSubmit(this.vipEndpoint + "payByCreditCard.php", b);
			window[a] = this.callback(function (c) {
				console.error("ccsubmit win.callback", b, c, "success:", c.bSuccess, $("#httpsIframe"));
				if (c.bSuccess) {
					this.creditCardConfirmToken = c.token;
					$("#creditcard_content .confirmation td.vipPackage").html(c.description);
					$("#creditcard_content .confirmation td.price").html("$" + c.amount);
					$("#creditcard_content .confirmation td.tax").html("$" + c.tax);
					$("#creditcard_content .confirmation td.total").html("$" + c.total);
					c.bRecurring == true || c.bRecurring == "1" ? $("#creditcard_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_RECURRING") : $("#creditcard_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_NOT_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_NOT_RECURRING");
					$("#creditcard_content ul.progress li.billing").addClass("progress_previousStep").removeClass("progress_currentStep");
					$("#creditcard_content ul.progress li.confirmation").addClass("active progress_currentStep").parent().addClass("progress_onLast");
					$("#creditcard_content ul.stages li.stage.confirmation").show().siblings().hide();
					$("#creditcard_content ul.right li.next").show().siblings().hide();
					$("#creditcard_content ul.left li").show();
					this.curCreditCardStage = this.creditCardStages.confirmation;
					this.element.find(".error.response").hide();
					GS.lightbox.trackLightboxView("vipSignup/creditcardConfirm")
				} else this.showVipErrors(c)
			});
			return false
		},
		creditCardConfirmSubmit: function () {
			var a = hex_md5((new Date).getTime()),
				b = {
					callbackUrl: this.vipCallbackUrl,
					callbackMethod: a,
					token: this.creditCardConfirmToken
				};
			GS.service.httpsFormSubmit(this.vipEndpoint + "payByCreditCardConfirm.php", b);
			window[a] = this.callback(function (c) {
				console.error("cc confirmsubmit win.callback", b, c, "success:", c.bSuccess, $("#httpsIframe"));
				var g = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
				if (c.bSuccess) {
					GS.user.updateAccountType(g);
					GS.lightbox.trackLightboxView("vipSignup/success");
					GS.lightbox.trackLightboxView("vipSignup/ccSuccess");
					GS.lightbox.close();
					GS.lightbox.open("signup", {
						gotoComplete: true,
						vipPackage: g
					});
					location.hash = "#/settings/subscriptions"
				} else this.showVipErrors(c)
			})
		},
		paypalSubmit: function () {
			var a = 0,
				b = this.vipEndpoint + "payByPaypal.php",
				c = hex_md5((new Date).getTime()),
				g = {
					vipToken: this.vipToken,
					callbackUrl: this.vipCallbackUrl,
					callbackMethod: c,
					vipPackage: $("#paypal_content input[name=paypalPackage]:checked").val(),
					anywhere: this.anywhere,
					bExtend: this.bExtend,
					recurring: 1,
					country: $("#paypal_content select[name=country]").val()
				};
			_.forEach(g, function (h, k) {
				b += a === 0 ? "?" + k + "=" + encodeURI(h) : "&" + k + "=" + encodeURI(h);
				a++
			});
			console.error("open paypal window", b);
			window.open(b, "_blank");
			$("#paypal_content p.redirectLink a").attr("href", b);
			window[c] = this.callback(function (h) {
				console.error("paypalsubmit win.callback", g, h, $("#httpsIframe"));
				if (h.bSuccess) {
					this.paypalConfirmToken = h.token;
					$("#paypal_content .confirmation td.vipPackage").html(h.description);
					$("#paypal_content .confirmation td.price").html("$" + h.amount);
					$("#paypal_content .confirmation td.tax").html("$" + h.tax);
					$("#paypal_content .confirmation td.total").html("$" + h.total);
					h.bRecurring == true || h.bRecurring == "1" ? $("#paypal_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_RECURRING") : $("#paypal_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_NOT_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_NOT_RECURRING");
					$("#paypal_content ul.progress li.redirect").addClass("progress_previousStep").removeClass("progress_currentStep");
					$("#paypal_content ul.progress li.confirmation").addClass("active progress_currentStep").parent().addClass("progress_onLast");
					$("#paypal_content ul.stages li.stage.confirmation").show().siblings().hide();
					$("#paypal_content ul.right li.next").show().siblings().hide();
					$("#paypal_content ul.left li").show();
					this.curPaypalStage = this.paypalStages.confirmation;
					this.element.find(".error.response").hide();
					GS.lightbox.trackLightboxView("vipSignup/paypalConfirm")
				} else this.showVipErrors(h)
			});
			$("#paypal_content ul.progress li").addClass("active");
			$("#paypal_content ul.progress li:last").removeClass("active");
			$("#paypal_content ul.stages li.stage.redirect").show().siblings().hide();
			$("#paypal_content #pane_footer li").hide();
			$("#paypal_content ul.left li").show();
			this.curPaypalStage = this.paypalStages.redirect;
			return false
		},
		paypalConfirmSubmit: function () {
			var a = hex_md5((new Date).getTime()),
				b = {
					callbackMethod: a,
					callbackUrl: this.vipCallbackUrl,
					token: this.paypalConfirmToken
				};
			GS.service.httpsFormSubmit(this.vipEndpoint + "payByPaypalConfirm.php", b);
			window[a] = this.callback(function (c) {
				console.error("paypal confirmsubmit win.callback", b, c, "success:", c.bSuccess, $("#httpsIframe"));
				var g = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
				if (c.bSuccess) {
					GS.user.updateAccountType(g);
					GS.lightbox.trackLightboxView("vipSignup/success");
					GS.lightbox.trackLightboxView("vipSignup/paypalSuccess");
					GS.lightbox.close();
					GS.lightbox.open("signup", {
						gotoComplete: true,
						vipPackage: g
					});
					location.hash = "#/settings/subscriptions"
				} else this.showVipErrors(c)
			});
			return false
		},
		offersSubmit: function () {
			var a = $("#signup_promocode").val();
			if (a === "") $("#signup_promocode").parent().parent().addClass("error");
			else {
				$("#signup_promocode").parent().parent().removeClass("error");
				var b = hex_md5((new Date).getTime()),
					c = {
						vipToken: this.vipToken,
						callbackMethod: b,
						callbackUrl: this.vipCallbackUrl,
						anywhere: this.anywhere,
						bExtend: this.bExtend,
						code: a
					};
				GS.service.httpsFormSubmit(this.vipEndpoint + "payByPromoCode.php", c);
				window[b] = this.callback(function (g) {
					console.error("offersubmit win.callback", c, g, $("#httpsIframe"));
					if (g.bSuccess) {
						this.offersConfirmToken = g.token;
						$("#offers_content .confirmation .description").html(g.description);
						g.bRecurring == true || g.bRecurring == "1" ? $("#offers_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_RECURRING") : $("#offers_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_NOT_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_NOT_RECURRING");
						GS.user.IsPremium ? $("#offers_content .confirmation p.userWarning").show() : $("#offers_content .confirmation p.userWarning").hide();
						$("#offers_content ul.progress li.promocode").addClass("progress_previousStep").removeClass("progress_currentStep");
						$("#offers_content ul.progress li.confirmation").addClass("active progress_currentStep").parent().addClass("progress_onLast");
						$("#offers_content ul.stages li.stage.confirmation").show().siblings().hide();
						$("#offers_content ul.right li.next").show().siblings().hide();
						$("#offers_content ul.left li").show();
						this.curOffersStage = this.offersStages.confirmation;
						this.element.find(".error.response").hide();
						GS.lightbox.trackLightboxView("vipSignup/offersConfirm")
					} else this.showVipErrors(g)
				})
			}
			return false
		},
		offersConfirmSubmit: function () {
			var a = hex_md5((new Date).getTime()),
				b = {
					callbackMethod: a,
					callbackUrl: this.vipCallbackUrl,
					token: this.offersConfirmToken
				};
			GS.service.httpsFormSubmit(this.vipEndpoint + "payByPromoCodeConfirm.php", b);
			window[a] = this.callback(function (c) {
				console.error("offers confirmsubmit win.callback", b, c, "success:", c.bSuccess, $("#httpsIframe"));
				var g = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
				if (c.bSuccess) {
					GS.user.updateAccountType(g);
					GS.lightbox.trackLightboxView("vipSignup/success");
					GS.lightbox.trackLightboxView("vipSignup/offersSuccess");
					GS.lightbox.close();
					GS.lightbox.open("signup", {
						gotoComplete: true,
						vipPackage: g
					});
					location.hash = "#/settings/subscriptions"
				} else this.showVipErrors(c)
			});
			return false
		},
		cellphoneSubmit: function () {
			return false
		},
		cellphoneConfirmSubmit: function () {
			return false
		}
	})
})();
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VipExpiresController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.data = _.orEqual(a, {});
		this.daysLeft = _.orEqual(this.data.daysLeft, "days");
		this.timeframe = _.orEqual(this.data.timeframe, "twoWeeks");
		this.element.html(this.view("/lightbox/vipExpires"));
		console.log("vipExpires data", a)
	},
	"button.remind click": function () {
		console.error("remind later for:", this.timeframe);
		store.set("gs.vipExpire.hasSeen" + GS.user.UserID, (new Date).getTime());
		GS.lightbox.close()
	},
	"button.renew click": function () {
		GS.lightbox.close();
		var a;
		a = this.data.subscriptionType.match("Anywhere") ? "anywhere" : this.data.subscriptionType.match("Plus") ? "plus" : this.data.bVip == true || this.data.bVip == 1 ? "vip" : "plus";
		a === "vip" || a === "anywhere" ? GS.lightbox.open("vipSignup", {
			bExtend: 1,
			vipPackage: this.data.bVip ? "vip" : a
		}) : GS.lightbox.open("signup", {
			gotoUpgrade: true,
			bExtend: 1,
			vipPackage: this.data.bVip ? "vip" : a
		})
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VipCancelController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		this.element.html(this.view("/lightbox/vipCancel"))
	},
	"a.submit click": function () {
		console.log("vipCancel.a.submit.click form.submit");
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		var c = hex_md5((new Date).getTime()),
			g = {
				callbackMethod: c,
				callbackUrl: location.protocol + "//" + location.host + "/vipCallback.php"
			};
		GS.service.httpsFormSubmit((gsConfig.runMode == "production" ? "https://vip.grooveshark.com/" : "https://stagingvip.grooveshark.com/") + "disableRecurring.php", g);
		window[c] = this.callback(function (h) {
			console.error("cancel win.callback", g, h, "success:", h.bSuccess, $("#httpsIframe"));
			GS.lightbox.close();
			location.hash = "/settings/subscriptions?r=" + (new Date).getTime()
		});
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.FollowInviterController", {
	onDocument: false
}, {
	user: null,
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.user = a.user;
		console.log("lb.followinviter.init", this.user);
		if (this.user) {
			this.element.html(this.view("/lightbox/followInviter"));
			a = (new GS.Models.DataString($.localize.getString("POPUP_FOLLOW_INVITER_MESSAGE"), {
				user: this.user.Username
			})).render();
			$("#message").html(a)
		}
	},
	"button.submit click": function () {
		console.log("lb.followinviter submit");
		GS.user.addToUserFavorites(this.user.UserID);
		GS.lightbox.close()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ThemesController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		this.list = GS.Controllers.ThemeController.sortOrder;
		this.element.html(this.view("/lightbox/themes"));
		setTimeout(this.callback("renderThemes", this.list), 100)
	},
	renderThemes: function (a) {
		$("#themes_content").slickbox({
			itemRenderer: this.themeItem,
			itemWidth: 154,
			itemHeight: 127,
			scrollPane: "#lightbox_content"
		}, a);
		$(window).resize()
	},
	themeItem: function (a) {
		a = GS.Controllers.ThemeController.themes[a];
		var b = gsConfig.assetHost + "/themes/" + a.location + "/preview.jpg",
			c = "";
		if (a.premium) c = '<span class="isPremium"></span>';
		return ['<a class="theme" rel="', a.themeID, '"><img src="', b, '"><span class="title ellipsis" title="', a.title, '">', a.title, '</span><span class="author">by ', a.author, "</span></a>", c].join("")
	},
	"a.theme click": function (a) {
		var b = _.defined($(a).attr("rel")) ? parseInt($(a).attr("rel"), 10) : 4,
			c = GS.Controllers.ThemeController.themes[b];
		a = $(".title", a).text();
		if (c && (GS.user.IsPremium || !c.premium)) {
			GS.theme.setCurrentTheme(b, true);
			GS.guts.logEvent("themeChangePerformed", {
				theme: a
			});
			GS.lightbox.trackLightboxView("themes/" + a)
		} else if (c) {
			GS.lightbox.close();
			GS.lightbox.open("vipOnlyFeature")
		}
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ShareController", {
	onDocument: false,
	allowed: {
		album: ["email", "facebook", "stumbleupon", "twitter", "widget"],
		playlist: ["email", "facebook", "stumbleupon", "twitter", "reddit", "widget"],
		song: ["email", "facebook", "stumbleupon", "twitter", "reddit", "widget"],
		manySongs: ["widget"]
	}
}, {
	service: "email",
	type: null,
	id: 0,
	ids: [],
	idsUrl: "",
	metadata: null,
	userInfo: {},
	MAX_TWEET_LENGTH: 140,
	init: function (a, b) {
		this.update(b);
		this.positionSub = $.subscribe("lightbox.position", this.callback(this._repositionClips))
	},
	destroy: function (a) {
		$.unsubscribe(this.positionSub);
		if (this.clipHandler) {
			this.clipHandler.destroy();
			this.clipHandler = null
		}
		if (this.widgetClipHandler) {
			this.widgetClipHandler.destroy();
			this.widgetClipHandler = null
		}
		this._super(a)
	},
	"#share_message.twitter keyup": function (a) {
		console.log("text change");
		var b = $(a).val();
		b.length <= this.MAX_TWEET_LENGTH ? $("#twitter_counter").html(b.length) : $(a).val(b.substring(0, this.MAX_TWEET_LENGTH))
	},
	update: function (a) {
		console.log("gs.lightbox.share", a);
		this.service = a.service;
		this.type = a.type;
		this.id = a.id;
		this.userInfo = {};
		switch (a.type) {
		case "album":
			GS.Models.Album.getAlbum(this.id, this.callback(function (b) {
				console.log("album loaded", b);
				this.metadata = b;
				this.metadata.name = b.AlbumName;
				this.metadata.by = b.ArtistName;
				this.metadata.url = "http://listen.grooveshark.com/" + b.toUrl().replace("#/", "");
				b.getSongs(function (c) {
					$.each(c, function (g, h) {
						this.ids.push(h.SongID);
						this.idsUrl += h.SongID + ","
					})
				});
				self.loadService()
			}));
			break;
		case "playlist":
			GS.Models.Playlist.getPlaylist(this.id, this.callback(function (b) {
				this.metadata = b;
				this.metadata.name = b.PlaylistName;
				this.metadata.by = b.Username;
				this.metadata.url = "http://listen.grooveshark.com/" + b.toUrl().replace("#/", "");
				console.log("playlist loaded", b);
				this.loadService()
			}));
			break;
		case "song":
			GS.Models.Song.getSong(this.id, this.callback(function (b) {
				this.metadata = b;
				this.metadata.name = b.SongName;
				this.metadata.by = b.ArtistName;
				this.metadata.url = "http://listen.grooveshark.com/" + b.toUrl().replace("#/", "");
				this.idsUrl = b.SongID;
				console.log("song loaded", b);
				this.loadService()
			}));
			break;
		case "manySongs":
			this.idsUrl = this.id.join(",");
			this.loadService();
			break
		}
	},
	loadService: function () {
		this.submitKey = "SHARE";
		this.showSubmit = true;
		switch (this.service) {
		case "facebook":
			if (GS.facebook.connected) GS.facebook.getFriends(this.callback(function (a) {
				this.facebookFriends = a || [];
				this.submitKey = "SHARE_FACEBOOK_WALL";
				this.renderService();
				var b = [];
				$.each(this.facebookFriends, this.callback(function (c, g) {
					b.push([g.id, g.name, g.name])
				}));
				a = new $.TextboxList("#facebook_share_to", {
					addOnBlur: true,
					bitsOptions: {
						editable: {
							growing: true,
							growingOptions: {
								maxWidth: 335
							}
						}
					},
					plugins: {
						autocomplete: {
							placeholder: $.localize.getString("SHARE_FACEBOOK_PLACEHOLDER")
						}
					},
					encode: this.callback(function (c) {
						var g = [];
						if (c.length) {
							for (var h = 0; h < c.length; h++) c[h][0] && g.push(c[h][0]);
							this.element.find(".submit span").attr("data-translate-text", "SEND_INVITE").html($.localize.getString("SHARE_FACEBOOK_FRIENDS"))
						} else this.element.find(".submit span").attr("data-translate-text", "POST_TO_PROFILE").html($.localize.getString("SHARE_FACEBOOK_WALL"));
						return g.join(",")
					})
				});
				a.plugins.autocomplete.setValues(b);
				a.addEvent("bitAdd", function (c) {
					if (c.getValue()[1] === "") c.hide();
					else {
						var g = $("#facebook_share_to").val().split(",");
						if (g) {
							var h = g.indexOf(c.getValue()[0]);
							console.log(h);
							c.getValue()[0] && h >= 0 && h != g.length - 1 && c.hide()
						}
					}
				});
				a.fireEvent("focus")
			}), this.callback(function () {
				this.facebookFriends = [];
				this.submitKey = "SHARE_FACEBOOK_WALL";
				this.element.find(".error").show().find(".message").text($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR_FRIENDS"));
				this.renderService()
			}));
			else {
				this.facebookFriends = [];
				this.submitKey = "SHARE";
				this.renderService()
			}
			GS.lightbox.trackLightboxView("share/facebook");
			break;
		case "email":
			this.renderService();
			GS.user.UserID > 0 && GS.service.getContactInfoForFollowers(this.callback(function (a) {
				var b = [];
				$.each(a, this.callback(function (c, g) {
					b.push([g.UserID, g.Username + " " + g.Email, g.Username, g.Username]);
					this.userInfo[g.UserID] = g;
					this.userInfo[g.Username] = g
				}));
				a = new $.TextboxList("#share_to", {
					addOnBlur: true,
					bitsOptions: {
						editable: {
							growing: true,
							growingOptions: {
								maxWidth: 335
							}
						}
					},
					plugins: {
						autocomplete: {
							placeholder: $.localize.getString("SHARE_EMAIL_PLACEHOLDER")
						}
					},
					encode: this.callback(function (c) {
						for (var g = [], h = 0; h < c.length; h++) if (c[h][0]) g.push(c[h][0]);
						else c[h][1] && g.push(c[h][1]);
						return g.join(",")
					})
				});
				a.plugins.autocomplete.setValues(b);
				a.addEvent("bitAdd", function (c) {
					c.getValue()[1] === "" && c.hide()
				});
				a.fireEvent("focus")
			}), this.callback(function (a) {
				console.error("failed grabbing contact info for followers", autocompleteTerms, a);
				$.publish("gs.notification", {
					type: "error",
					message: $.localize.getString("POPUP_FAIL_FANS_EMAIL_ONLY")
				})
			}), {
				async: false
			});
			GS.lightbox.trackLightboxView("share/email");
			setTimeout(function () {
				$("#share_content .textboxlist-bit-editable-input").focus()
			}, 0);
			break;
		case "twitter":
			this.monday = (new Date).format("D") === "Mon" ? true : false;
			GS.service.getDetailsForBroadcast(this.id, this.callback(function (a) {
				console.log("getDetailsForBroadcast", a);
				this.tinysong = a;
				this.submitKey = "SHARE_BROADCAST";
				this.renderService()
			}));
			GS.lightbox.trackLightboxView("share/twitter");
			break;
		case "stumbleupon":
			this.submitKey = "SHARE_STUMBLE";
			this.renderService();
			GS.lightbox.trackLightboxView("share/stumbleupon");
			break;
		case "reddit":
			this.submitKey = "SHARE_REDDIT";
			this.renderService();
			GS.lightbox.trackLightboxView("share/reddit");
			break;
		default:
			this.showSubmit = false;
			this.renderService();
			GS.lightbox.trackLightboxView("share/default");
			break
		}
	},
	renderService: function () {
		console.log("renderService", this.type, this.service);
		this.element.html(this.view("/lightbox/share/index"));
		if (this.service == "facebook") if (this.facebookFriends.length) $(".instruction", this.element).show();
		else GS.facebook.connected && $(".instruction", this.element).hide();
		GS.lightbox.positionLightbox();
		$("input:nth-child(2)", this.element).focus()
	},
	_repositionClips: function () {
		var a = this;
		if ($("#" + this.type + "_share_copy_url").length) if (this.clipHandler) this.clipHandler.reposition(this.type + "_share_copy_url");
		else {
			this.clipHandler = new ZeroClipboard.Client;
			this.clipHandler.setText(this.metadata.url);
			this.clipHandler.setHandCursor(true);
			this.clipHandler.setCSSEffects(true);
			this.clipHandler.glue(this.type + "_share_copy_url");
			$("#" + this.type + "_share_copy_url").removeClass("copied").children("span").html($.localize.getString("SHARE_COPY"));
			this.clipHandler.addEventListener("complete", function (b, c) {
				console.log("Copied text to clipboard:\n" + c);
				$("#" + a.type + "_share_copy_url").addClass("copied").children("span").html($.localize.getString("SHARE_COPIED"))
			})
		}
		if (this.service == "widget" && $("#widget_copy").length) if (this.widgetClipHandler) this.widgetClipHandler.reposition("widget_copy");
		else {
			this.widgetClipHandler = new ZeroClipboard.Client;
			this.widgetClipHandler.setText($("#share_message").val());
			this.widgetClipHandler.setHandCursor(true);
			this.widgetClipHandler.setCSSEffects(true);
			this.widgetClipHandler.glue("widget_copy");
			$("#widget_copy").removeClass("copied").children("span").html($.localize.getString("SHARE_COPY_TO_CLIPBOARD"));
			this.widgetClipHandler.addEventListener("complete", function (b, c) {
				console.log("Copied text to clipboard:\n" + c);
				$("#widget_copy").addClass("copied").children("span").html($.localize.getString("SHARE_COPIED_TO_CLIPBOARD"))
			})
		}
	},
	"a.submit, button.submit click": function (a, b) {
		console.log("share.a.submit.click form subm");
		$("form", this.element).submit();
		b.preventDefault();
		b.stopPropagation()
	},
	"form submit": function (a, b) {
		console.log("SHARE FORM SUBMIT");
		b.preventDefault();
		b.stopPropagation();
		switch (this.service) {
		case "email":
			this.broadcastEmail(a, b);
			break;
		case "stumbleupon":
		case "reddit":
			window.open(_.makeUrlForShare(this.service, this.type, this.metadata), "_blank");
			break;
		case "twitter":
			if (this.type === "song") {
				var c = $("textarea[name=share_message]", this.element).val();
				c = c.replace(this.tinysong.tinySongURL, "");
				window.open("http://twitter.com/share?related=grooveshark&url=" + encodeURIComponent(this.tinysong.tinySongURL) + "&text=" + encodeURIComponent(c), "_blank");
				GS.lightbox.close()
			} else if (this.type === "playlist") {
				c = $("textarea[name=share_message]", this.element).val();
				window.open("http://twitter.com/share?related=grooveshark&url=http://listen.grooveshark.com/" + encodeURIComponent(this.metadata.toUrl().replace("#/", "")) + "&text=" + encodeURIComponent(c), "_blank");
				GS.lightbox.close()
			}
			break;
		case "facebook":
			c = "http://listen.grooveshark.com/" + this.metadata.toUrl().replace("#/", "");
			if (GS.facebook.connected) {
				var g = $("#facebook_share_to").val() == "" ? [] : $("#facebook_share_to").val().split(","),
					h = $("textarea[name=facebookMessage]", a).val();
				if (g.length) for (var k = 0; k < g.length; k++) GS.facebook.postToFeed(g[k], c, h, this.callback("facebookSuccess"), this.callback("facebookFailed"));
				else GS.facebook.postLink("me", c, h, this.type, this.callback("facebookSuccess"), this.callback("facebookFailed"))
			} else {
				window.open("http://facebook.com/share.php?u=" + encodeURIComponent(c), "_blank");
				GS.lightbox.close()
			}
			break
		}
		return false
	},
	broadcastEmail: function (a) {
		var b = ($("input[name=to]", a).val() || "").split(","),
			c = $("textarea[name=message]", a).val(),
			g = [],
			h = $("#share_to").siblings(".textboxlist").find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").filter(":last").text();
		a = $("input[name=privacy]", a).is(":checked");
		_.forEach(b, function (k) {
			if (this.userInfo[k]) g.push({
				userID: this.userInfo[k].UserID,
				username: this.userInfo[k].Username,
				email: this.userInfo[k].Email
			});
			else k && g.push({
				email: k
			})
		}, this);
		h && g.push({
			email: h
		});
		if (g.length) {
			console.log("BROADCAST EMAIL", g);
			GS.service.sendShare(this.type, this.id, g, true, c, a, this.callback("broadcastEmailSuccess"), this.callback("broadcastEmailFailed"))
		} else this.broadcastEmailFailed()
	},
	broadcastEmailSuccess: function (a) {
		var b = [];
		if (!a) return this.broadcastEmailFailed(a);
		if (a.Result && a.Result.emailsFailed && a.Result.emailsFailed.length > 0) {
			_.forEach(a.Result.emailsFailed, function (c) {
				switch (c.failReason) {
				case 1:
					b.push("<li>" + (new GS.Models.DataString($.localize.getString("POPUP_SHARE_ERROR_ALREADY_MESSAGED"), {
						emailAddresses: c.person.email
					})).render() + "</li>");
					break
				}
			});
			if (b.length) {
				a = "<ul>" + b.join("") + "</ul>";
				this.element.find(".error").show().find(".message").html(a)
			}
		} else {
			GS.lightbox.close();
			$.publish("gs.notification", {
				message: $.localize.getString("NOTIF_FACEBOOK_SHARE_" + this.type.toUpperCase())
			})
		}
	},
	broadcastEmailFailed: function () {
		console.log("lb.share.email failed", arguments);
		this.element.find(".error").text($.localize.getString("POPUP_FAIL_SHARING_FANS")).show();
		GS.lightbox.positionLightbox()
	},
	facebookSuccess: function (a) {
		console.log("facebook share success", a);
		GS.lightbox.close()
	},
	facebookFailed: function (a) {
		console.log("facebook share failed", a);
		this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR"));
		GS.lightbox.positionLightbox()
	},
	"#share_options .email click": function () {
		this.service = "email";
		this.loadService()
	},
	"#share_options .facebook click": function () {
		this.service = "facebook";
		this.loadService()
	},
	"#share_options .stumble click": function () {
		this.service = "stumbleupon";
		this.loadService()
	},
	"#share_options .twitter click": function () {
		this.service = "twitter";
		this.loadService()
	},
	"#share_options .reddit click": function () {
		this.service = "reddit";
		this.loadService()
	},
	"#share_options .widget click": function () {
		this.service = "widget";
		this.loadService()
	},
	"button.customize click": function (a, b) {
		console.error("customize.click", a, b);
		this.type == "playlist" ? window.open("http://widgets.grooveshark.com/make?new&playlistid=" + this.id, "_blank") : window.open("http://widgets.grooveshark.com/make?new&songs=" + this.idsUrl, "_blank")
	},
	"#lightbox .error .message .resetPerms click": function (a, b) {
		b.preventDefault();
		GS.facebook.logout(function () {
			GS.facebook.login(function () {
				$("#lightbox").find(".error").hide()
			}, function (c) {
				c && c.error ? $("#lightbox").find(".error").find(".message").html($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR_PREPEND_ERROR") + "<br />" + $.localize.getString(c.error)) : $("#lightbox").find(".error").find(".message").text($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR_PREPEND_ERROR"))
			})
		})
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ForgetController", {
	onDocument: false
}, {
	MIN_USERPASS_LENGTH: 5,
	MAX_USERPASS_LENGTH: 32,
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		if (a && _.defined(a.resetCode)) {
			this.reset = true;
			this.resetCode = a.resetCode
		} else this.resetCode = this.reset = false;
		this.element.html(this.view("/lightbox/forget"))
	},
	showError: function (a) {
		console.log("showError", a, $("div.message", this.element));
		$("div.message", this.element).html($.localize.getString(a));
		this.element.find(".error").show();
		GS.lightbox.positionLightbox()
	},
	"a.login click": function (a) {
		console.log("forget.a.login click", $(a).get());
		GS.lightbox.close();
		GS.lightbox.open("login")
	},
	"a.submit click": function () {
		console.log("forgot.a.submit.click form.submit");
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		console.log("forgot.form.submit");
		b.preventDefault();
		var c = $("input[name=username]", a).val();
		if (this.reset) {
			var g = $("input[name=newPassword]", a).val(),
				h = $("input[name=confirmPassword]", a).val();
			g == h && g.length && g.length >= this.MIN_USERPASS_LENGTH && g.length <= this.MAX_USERPASS_LENGTH ? GS.service.resetPassword(c, this.resetCode, g, this.callback(this.resetSuccess, c, g), this.callback(this.resetFailed)) : this.showError("POPUP_SIGNUP_FORM_PASSWORD_INVALID_NO_MATCH")
		} else GS.service.userForgotPassword(c, this.callback(this.serviceSuccess), this.callback(this.serviceFailed));
		return false
	},
	serviceSuccess: function (a) {
		console.log("FORGOT SUCCESS", a);
		if (a && a.userID == 0 || !a) return this.serviceFailed(a);
		GS.lightbox.close()
	},
	serviceFailed: function () {
		console.log("lb.servicefail", arguments);
		this.showError("POPUP_SIGNUP_FORGOT_FORM_RESPONSE_ERROR")
	},
	resetSuccess: function (a, b, c) {
		console.log("RESET SUCCESS", c);
		if (!c || c.success != 1) return this.resetFailed(c);
		GS.lightbox.close();
		GS.auth.login(a, b)
	},
	resetFailed: function (a) {
		console.log("lb.servicefail", arguments);
		if (_.defined(a.success)) a.success == 0 ? this.showError("POPUP_FORGET_RESET_ERROR_BADUSER") : this.showError("POPUP_FORGET_RESET_ERROR_BADCODE");
		else this.showError("POPUP_FORGET_RESET_ERROR_UNKNOWN")
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.FeedbackController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.feedback.init");
		this.user = GS.user;
		this.feelings = $.localize.getString("POPUP_FEEDBACK_FEELINGS").split(",");
		this.element.html(this.view("/lightbox/feedback"))
	},
	"a.submit, button.submit click": function () {
		$("form", this.element).submit()
	},
	"#feedback_feeling change": function (a) {
		$(a).siblings("span").text($(a).val())
	},
	"form submit": function (a, b) {
		b.preventDefault();
		var c = $("input[name=email]", a).val(),
			g = $("select[name=feeling]", a).val(),
			h = $("textarea[name=feedback]", a).val();
		if (h.length && c.length) {
			g = "User email address: " + c + "\nMood: " + g + "\nFeedback report:\n" + h;
			this.element.find(".error").hide();
			GS.service.provideVIPFeedback(c, g, this.callback(this.feedbackSuccess), this.callback(this.feedbackFailed))
		} else if (h.length) c.length || this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_FEEDBACK_ERROR_FEEDBACK"));
		else this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_FEEDBACK_ERROR_FEEDBACK"));
		return false
	},
	feedbackSuccess: function (a) {
		if (a && a.Success == 0 || !a) return this.feedbackFailed(a);
		GS.lightbox.close();
		$.publish("gs.user.feedback", a)
	},
	feedbackFailed: function () {
		console.log("lb.feedbackfail", arguments);
		this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_FEEDBACK_ERROR"));
		GS.lightbox.close()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.BadHostController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.badhost.init");
		this.element.html(this.view("/lightbox/badHost"))
	},
	"a.submit click": function () {
		console.log("invalidClient.a.submit.click refresh page");
		window.location.href = "http://www.grooveshark.com"
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.InteractionTimeController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.interactiontime.init");
		this.element.html(this.view("/lightbox/interactionTime"));
		this.subscribe("gs.player.paused", this.callback("onSongPause"))
	},
	onSongPause: function () {
		$("#lb_interacation_message").attr("data-translate-text", "POPUP_INTERACTION_MSG_PAUSED").html($.localize.getString("POPUP_INTERACTION_MSG_PAUSED"));
		$("#lb_interacation_submit").attr("data-translate-text", "POPUP_INTERACTION_RESUME").html($.localize.getString("POPUP_INTERACTION_RESUME"))
	},
	"#lightbox a.upgrade click": function () {
		GS.player.pauseNextQueueSongID = false;
		GS.player.resumeSong();
		GS.lightbox.close()
	},
	"#lightbox a.submit click": function () {
		$("form", this.element).submit()
	},
	"#lightbox a.close click": function () {
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		GS.player.pauseNextQueueSongID = false;
		GS.player.resumeSong();
		GS.lightbox.close();
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.InvalidClientController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.invalidclient.init");
		this.element.html(this.view("/lightbox/invalidClient"))
	},
	"a.submit click": function () {
		console.log("invalidClient.a.submit.click refresh page");
		window.location.reload(true)
	},
	"button click": function () {
		console.log("invalidClient.a.submit.click refresh page");
		window.location.reload(true)
	}
});
GS.Controllers.InviteInterface.extend("GS.Controllers.Lightbox.InviteController", {
	onDocument: false
}, {
	userInfo: {},
	googleContacts: null,
	facebookFriends: [],
	fbIDs: {},
	slickbox: false,
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		a = _.orEqual(a, {});
		this.submitType = "facebook";
		this.element.html(this.view("/lightbox/invite/invite"));
		$("#lightbox_pane").html(this.view("/lightbox/invite/facebook"));
		if (this.facebookFriends.length == 0) $(".facebook.contactsContainer", this.element).show().html(this.view("/shared/inviteFacebook"));
		else this.slickbox = $(".facebook.contactsContainer", this.element).html("").show().slickbox({
			itemRenderer: this.facebookItemRenderer,
			itemClass: this.facebookItemClass,
			itemWidth: 180,
			itemHeight: 45,
			verticalGap: 5,
			horizontalGap: 8,
			hidePositionInfo: true,
			listClass: "contacts facebook_contacts"
		}, this.facebookFriends);
		GS.facebook.getFriends(this.callback("onFacebookFriends"));
		this.subscribe("gs.facebook.status", this.callback(function () {
			GS.facebook.getFriends(this.callback("onFacebookFriends"))
		}));
		if (a.gotoFacebook) $("#invite_options a.facebook_service").click();
		else a.gotoGoogle && $("#invite_options a.google_service").click()
	},
	onFacebookFriendsCallback: function () {
		console.log("onFacebookFriendscallback", this.facebookFriends.length);
		this.submitType === "facebook" && $("#invite_options a.facebook_service").removeClass("active").click()
	},
	"a.submit click": function () {
		console.log("invite.a.submitEmail.click form subm");
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		console.log("invite.form.subm", this.submitType);
		b.preventDefault();
		this.element.find(".error").hide();
		this.formSubmit();
		return false
	},
	sendInviteSuccessCallback: function () {
		GS.lightbox.close()
	},
	googContactsSuccessCallback: function () {
		this.submitType = "googleContacts";
		$("#lightbox_pane", this.element).html(this.view("/lightbox/invite/googleContacts"));
		$("ul.google_contacts", this.element).html(this.view("/shared/googleContacts")).show();
		GS.lightbox.positionLightbox();
		$("ul.google_contacts li:even").addClass("even contactRow_even");
		$("ul.google_contacts li:odd").addClass("odd contactRow_odd")
	},
	facebookSuccessCallback: function () {
		GS.lightbox.close()
	},
	"#invite_options a click": function (a, b) {
		b.preventDefault();
		if (!$(a).is(".active")) {
			$("#invite_options a.active").removeClass("active");
			$(a).addClass("active");
			switch ($(a).attr("name")) {
			case "email":
				this.submitType = "email";
				$("#lightbox_pane", this.element).html(this.view("/lightbox/invite/email"));
				if (GS.user.isLoggedIn) GS.service.getContactInfoForFollowers(this.callback("onFollowersSuccess"), this.callback("onFollowersFailed"));
				else new $.TextboxList("#emails", {
					addOnBlur: true,
					bitsOptions: {
						editable: {
							growing: true,
							growingOptions: {
								maxWidth: $("#emails").innerWidth() - 10
							}
						}
					}
				});
				break;
			case "google":
				this.submitType = "googleLogin";
				$("#lightbox_pane", this.element).html(this.view("/lightbox/invite/googleLogin"));
				$("input[name=google_username]", this.element).focus();
				break;
			case "facebook":
				this.submitType = "facebook";
				$("#lightbox_pane", this.element).html(this.view("/lightbox/invite/facebook"));
				if (this.facebookFriends.length == 0) $(".facebook.contactsContainer", this.element).show().html(this.view("/shared/inviteFacebook"));
				else this.slickbox = $(".facebook.contactsContainer", this.element).html("").show().slickbox({
					itemRenderer: this.facebookItemRenderer,
					itemClass: this.facebookItemClass,
					itemWidth: 180,
					itemHeight: 45,
					verticalGap: 5,
					horizontalGap: 8,
					hidePositionInfo: true,
					listClass: "contacts facebook_contacts"
				}, this.facebookFriends);
				break
			}
		}
		GS.lightbox.positionLightbox();
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.LocaleController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		this.languages = [{
			locale: "ca",
			name: "Catal\u00e0"
		}, {
			locale: "cs",
			name: "\u010ce\u0161tina"
		}, {
			locale: "da",
			name: "Dansk"
		}, {
			locale: "de",
			name: "Deutsch"
		}, {
			locale: "en",
			name: "English"
		}, {
			locale: "es",
			name: "Espa\u00f1ol"
		}, {
			locale: "eu",
			name: "Euskara"
		}, {
			locale: "fr",
			name: "Fran\u00e7ais"
		}, {
			locale: "nl",
			name: "Nederlands"
		}, {
			locale: "lt",
			name: "Lietuvi\u0173"
		}, {
			locale: "pl",
			name: "Polski"
		}, {
			locale: "pt",
			name: "Portugu\u00eas"
		}, {
			locale: "ru",
			name: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439"
		}, {
			locale: "sk",
			name: "Sloven\u010dina"
		}, {
			locale: "fi",
			name: "Suomi"
		}, {
			locale: "sv",
			name: "Svenska"
		}, {
			locale: "tr",
			name: "T\u00fcrk\u00e7e"
		}, {
			locale: "zh",
			name: "\u4e2d\u6587"
		}, {
			locale: "bg",
			name: "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438"
		}, {
			locale: "it",
			name: "Italiano"
		}, {
			locale: "ja",
			name: "\u65e5\u672c\u8a9e"
		}, {
			locale: "nb",
			name: "Norsk "
		}, {
			locale: "ro",
			name: "Rom\u00e2n\u0103"
		}, {
			locale: "sl",
			name: "Sloven\u0161\u010dina"
		}];
		this.languages.sort(function (a, b) {
			return a.name > b.name ? 1 : -1
		});
		this.element.html(this.view("/lightbox/locale"))
	},
	"a.language click": function (a) {
		$.publish("gs.locale.update", $(a).attr("rel"));
		a = $(a).attr("rel");
		GS.guts.logEvent("localeChangePerformed", {
			locale: a
		});
		GS.guts.beginContext({
			locale: a
		});
		GS.lightbox.close()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.MaintenanceController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.maintenance.init");
		this.element.html(this.view("/lightbox/maintenance"))
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.SessionBadController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.sessionbad.init");
		this.element.html(this.view("/lightbox/sessionBad"))
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VIPOnlyFeatureController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.viponlyfeat.init");
		this.element.html(this.view("/lightbox/vipOnlyFeature"));
		GS.lightbox.positionLightbox()
	},
	"button.submit click": function () {
		GS.lightbox.close();
		GS.user.UserID > 0 ? GS.lightbox.open("vipPerks") : GS.lightbox.open("signup")
	}
});
(function () {
	GS.Controllers.VipInterface.extend("GS.Controllers.Lightbox.VipPerksController", {
		onDocument: false
	}, {
		tourStep: 0,
		vipPackage: null,
		PLUS_STEPS: 5,
		ANYWHERE_STEPS: 7,
		STEP_WIDTH: 648,
		STEP_TRANSITION: 600,
		init: function (a, b) {
			this.update(b)
		},
		update: function () {
			this.element.html(this.view("/lightbox/perks/index"));
			GS.lightbox.positionLightbox();
			GS.lightbox.trackLightboxView("/lightbox/perks")
		},
		"button.upgrade click": function (a) {
			a = _.orEqual($(a).attr("rel"), this.vipPackage);
			console.log("vip signup", a);
			GS.lightbox.close();
			GS.lightbox.open("vipSignup", {
				vipPackage: a,
				isSignup: false
			})
		},
		"a.takeTour click": function (a) {
			$("#intro_tour").hide();
			if ($(a).attr("rel") == "plus") {
				this.vipPackage = "plus";
				$("#perks_title").text("Grooveshark Plus");
				$("#anywhere_tour").hide();
				$("#plus_tour").show().scrollLeft(0);
				$("#plus_tour_steps").css("left", 0)
			} else {
				this.vipPackage = "anywhere";
				$("#perks_title").text("Grooveshark Anywhere");
				$("#plus_tour").hide();
				$("#anywhere_tour").show().scrollLeft(0);
				$("#anywhere_tour_steps").css("left", 0)
			}
			this.tourStep = 0;
			$("#lightbox_footer").show();
			this.updateNavigation();
			GS.lightbox.positionLightbox()
		},
		"button.intro click": function () {
			$("#intro_tour").show();
			$("#lightbox_footer, #plus_tour, #anywhere_tour").hide();
			$("#perks_title").text($.localize.getString("POPUP_PERKS_TITLE"));
			GS.lightbox.positionLightbox()
		},
		"a.gotoStep click": function (a) {
			this.tourStep = _.defined($(a).attr("rel")) ? parseInt($(a).attr("rel")) : 0;
			this.animateToStep();
			this.updateNavigation()
		},
		"button.next click": function () {
			this.tourStep++;
			this.animateToStep();
			this.updateNavigation()
		},
		"button.back click": function () {
			if (this.tourStep > 0) {
				this.tourStep--;
				this.animateToStep();
				this.updateNavigation()
			}
		},
		updateNavigation: function () {
			if (this.tourStep == 0) {
				$("#lightbox_footer .intro").show();
				$("#lightbox_footer .back").hide();
				$("#lightbox_footer .next").show();
				$("#lightbox_footer .finish").hide()
			} else if (this.vipPackage == "plus" && this.tourStep + 1 == this.PLUS_STEPS || this.vipPackage == "anywhere" && this.tourStep + 1 == this.ANYWHERE_STEPS) {
				$("#lightbox_footer .intro").hide();
				$("#lightbox_footer .back").show();
				$("#lightbox_footer .next").hide();
				$("#lightbox_footer .finish").show()
			} else {
				$("#lightbox_footer .intro").hide();
				$("#lightbox_footer .back").show();
				$("#lightbox_footer .next").show();
				$("#lightbox_footer .finish").hide()
			}
			var a = this.vipPackage == "plus" ? this.PLUS_STEPS : this.ANYWHERE_STEPS;
			a = $(".tour_steps_nav", this.element).html(this.view("/lightbox/perks/stepProgress", {
				steps: a,
				index: this.tourStep
			}));
			a.css("marginLeft", a.width() / 2 * -1);
			GS.lightbox.trackLightboxView("lightbox/perks/" + this.vipPackage + "/step" + this.tourStep)
		},
		animateToStep: function () {
			if (this.vipPackage == "plus" && this.tourStep < this.PLUS_STEPS) $.browser.msie ? $("#plus_tour_steps").stop().animate({
				left: -(this.STEP_WIDTH * this.tourStep)
			}, this.STEP_TRANSITION) : $("#plus_tour").stop().animate({
				scrollLeft: this.STEP_WIDTH * this.tourStep
			}, this.STEP_TRANSITION);
			else if (this.vipPackage == "anywhere" && this.tourStep < this.ANYWHERE_STEPS) $.browser.msie ? $("#anywhere_tour_steps").stop().animate({
				left: -(this.STEP_WIDTH * this.tourStep)
			}, this.STEP_TRANSITION) : $("#anywhere_tour").stop().animate({
				scrollLeft: this.STEP_WIDTH * this.tourStep
			}, this.STEP_TRANSITION)
		}
	})
})();
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.NewPlaylistController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.songIDs = $.makeArray(a);
		this.element.html(this.view("/lightbox/newPlaylist"))
	},
	"a.submit click": function () {
		$("form", this.element).submit()
	},
	saveToSidebar: false,
	"form submit": function (a) {
		var b = $("input[name=name]", a).val(),
			c = $("textarea[name=description]", a).val();
		this.saveToSidebar = $("input[name=save]", a).is(":checked");
		if (b.length) GS.user.createPlaylist(b, this.songIDs, c, this.callback("createSuccess"), this.callback("createFailed"));
		else {
			$("div.error .message", this.element).text($.localize.getString("POPUP_PLAYLIST_METADATA_ENTER_NAME_ERROR"));
			$("div.error", this.element).show()
		}
		return false
	},
	createSuccess: function (a) {
		this.playlist = a;
		$("div.error", this.element).hide();
		this.saveToSidebar && this.playlist.addShortcut(true);
		GS.lightbox.close()
	},
	createFailed: function (a) {
		console.error("playlist.new failed", a);
		$("div.error .message", this.element).text($.localize.getString("POPUP_PLAYLIST_METADATA_ERROR"));
		$("div.error", this.element).show()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RemovePlaylistSidebarController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		console.log("lb.removePlaylist.init", a);
		this.playlistID = a;
		this.playlist = GS.Models.Playlist.getOneFromCache(a);
		this.isSubscribed = this.playlist.isSubscribed();
		a = (new GS.Models.DataString($.localize.getString("POPUP_DELETE_PLAYLIST_QUESTION"), {
			playlist: this.playlist.PlaylistName
		})).render();
		this.element.html(this.view("/lightbox/removePlaylistSidebar"));
		this.element.find("#message").html(a)
	},
	"button.shortcut click": function (a, b) {
		b.stopImmediatePropagation();
		this.playlist.removeShortcut();
		GS.lightbox.close()
	},
	"button.playlist click": function (a, b) {
		b.stopImmediatePropagation();
		this.playlist.isSubscribed() ? this.playlist.unsubscribe() : this.playlist.remove();
		GS.lightbox.close()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		b.stopPropagation()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RenamePlaylistController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.playlistID = a;
		this.playlist = GS.Models.Playlist.getOneFromCache(a);
		this.element.html(this.view("/lightbox/renamePlaylist"))
	},
	"a.submit click": function () {
		console.log("renameplaylist.a.submit.click form subm");
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		console.log("renameplaylist.form.subm");
		b.preventDefault();
		this.name = $("input[name=name]", a).val();
		this.description = $("textarea[name=description]", a).val();
		this.counter = 0;
		if (this.name.length) {
			this.playlist.rename(this.name, this.callback(this.renameSuccess), this.callback(this.renameFailed));
			this.playlist.changeDescription(this.description, this.callback(this.renameSuccess), this.callback(this.renameFailed))
		} else {
			$("div.error .message", this.element).text($.localize.getString("POPUP_PLAYLIST_METADATA_ENTER_NAME_ERROR")).show();
			$("div.error", this.element).show()
		}
		return false
	},
	renameSuccess: function () {
		this.counter++;
		if (this.counter === 2) {
			GS.lightbox.close();
			location.hash = this.playlist.toUrl()
		}
	},
	renameFailed: function (a) {
		console.error("playlist.rename failed", a);
		$("div.error .message", this.element).text($.localize.getString("POPUP_PLAYLIST_META_TITLE_ERROR")).show();
		$("div.error", this.element).show()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.DeletePlaylistController", {
	onDocument: false
}, {
	user: null,
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.playlistID = a;
		this.playlist = GS.Models.Playlist.getOneFromCache(a);
		console.log("lb.deleteplaylist", this.playlistID, this.playlist);
		this.element.html(this.view("/lightbox/deletePlaylist"));
		a = (new GS.Models.DataString($.localize.getString("POPUP_DELETE_PLAYLIST_MESSAGE"), {
			playlist: this.playlist.PlaylistName
		})).render();
		this.element.find("#message").html(a)
	},
	"button.submit click": function (a, b) {
		console.log("lb.deleteplaylist submit");
		b.stopImmediatePropagation();
		this.playlist.remove();
		GS.lightbox.close()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		b.stopPropagation()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.AddSongsToPlaylistController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.songIDs = a;
		console.log("lb.addsongtoplaylist.init");
		this.playlists = [];
		for (var b in GS.user.playlists) GS.user.playlists.hasOwnProperty(b) && this.playlists.push(GS.user.playlists[b]);
		this.element.html(this.view("/lightbox/addSongsToPlaylist"))
	},
	"input.playlist click": function (a) {
		$(a).is(":checked") ? $(a).closest("li.playlist").addClass("selected") : $(a).closest("li.playlist").removeClass("selected")
	},
	"a.submit click": function () {
		console.log("addSongsToPlaylist.a.submit.click form subm");
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		console.log("addSongsToPlaylist.form.subm");
		b.preventDefault();
		var c, g, h = this,
			k = false;
		$("input:checked", this.element).each(function () {
			console.log("PLAYLIST ADD", this.value);
			c = this.value;
			if (g = GS.Models.Playlist.getOneFromCache(c)) {
				k = true;
				g.addSongs(h.songIDs, null, true)
			}
		});
		k && GS.lightbox.close();
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.BuySongController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.songID = a;
		(this.song = GS.Models.Song.getOneFromCache(this.songID)) ? GS.service.getAffiliateDownloadURLs(this.song.SongName, this.song.ArtistName, this.callback("urlsSuccess"), this.callback("urlsFailed")) : this.urlsFailed();
		this.element.html(this.view("/lightbox/buySong"))
	},
	urlsSuccess: function (a) {
		console.log("getAffiliateDownloadURLs", a);
		var b = false,
			c = false;
		if (a.amazon && a.amazon.url) $("a.amazon", this.element).attr("href", a.amazon.url).show();
		else b = true;
		if (a.iTunes && a.iTunes.url) $("a.itunes", this.element).attr("href", a.iTunes.url).show();
		else c = true;
		b && c && this.urlsFailed()
	},
	urlsFailed: function () {
		$(".error", this.element).show()
	},
	"a click": function () {
		GS.lightbox.close()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.LastfmApprovalController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.lastfm.approval.init");
		this.user = GS.user;
		this.visited = false;
		this.element.html(this.view("/lightbox/lastfm_approval"))
	},
	"a.gotoLastfm click": function (a, b) {
		if (this.visited) {
			b.preventDefault();
			GS.lastfm.saveSession();
			GS.lightbox.close()
		} else {
			$(a).find("span").text("Back from Last.fm");
			this.visited = true
		}
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RestoreQueueController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		$(this.element).html(this.view("/lightbox/restoreQueue"));
		console.log("restoreQueue.form.get", $("form", this.element).get())
	},
	"a.submit click": function () {
		console.log("restoreQueue.a.submit.click form subm");
		GS.player.restoreQueue();
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		console.log("restoreQueue.form.subm");
		b.preventDefault();
		var c = $("input[name=save]", a).val();
		console.log("restore queue save: ", c);
		store.set("player.restoreQueue", c);
		c && GS.player.restoreQueue();
		GS.lightbox.close();
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RadioClearQueueController", {
	onDocument: false
}, {
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		this.stationID = a;
		$(this.element).html(this.view("/lightbox/radioClearQueue"))
	},
	"a.submit click": function () {
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		GS.player.clearQueue();
		GS.player.setAutoplay(true, this.stationID);
		GS.lightbox.close();
		return false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.NoFlashController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.noFlash.init");
		this.element.html(this.view("/lightbox/noFlash"))
	},
	"a.submit click": function () {
		window.location.reload(true)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.UnsupportedBrowserController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.unsupportedBrowser.init");
		this.element.html(this.view("/lightbox/unsupportedBrowser"))
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VideoController", {
	onDocument: false
}, {
	embed: null,
	wasPlaying: false,
	isVideoMode: false,
	showPlayerControls: false,
	init: function (a, b) {
		this.update(b);
		this.subscribe("gs.video.playing", this.callback("setVideo"));
		this.subscribe("gs.video.player.ready", this.callback("setVideos"));
		this.subscribe("gs.player.streamserver", this.callback(this.onStreamServer))
	},
	update: function (a) {
		this.options = a;
		this.startIndex = _.orEqual(a.index, 0);
		this.video = a.video;
		this.videos = _.orEqual(a.videos, [this.video]);
		this.element.html(this.view("/lightbox/video"));
		this.wasPlaying = GS.player.isPlaying;
		GS.player.pauseSong();
		if (a.isVideoMode) this.isVideoMode = true;
		GS.theme.currentTheme.sections.indexOf("#theme_lightbox_header") >= 0 && GS.theme.renderSection("#theme_lightbox_header");
		if (this.options.videos && this.options.videos.length) {
			this.element.addClass("videos");
			this.options.video.flashvars.index = this.startIndex
		} else this.element.removeClass("videos");
		if (this.options.video) this.embed = this.options.video.embed("videoPlayer");
		$(window).resize()
	},
	onStreamServer: function (a) {
		document.videoPlayer && document.videoPlayer.loadCrossdomain && document.videoPlayer.loadCrossdomain(a.streamServer)
	},
	setVideo: function (a) {
		$("a.video").removeClass("active");
		$($("a.video").get(a.index)).addClass("active")
	},
	setVideos: function () {
		this.options.video ? document.videoPlayer.setVideos([this.options.video]) : document.videoPlayer.setVideos(this.options.videos)
	},
	detach: function () {
		GS.player.enableVideoMode && GS.player.disableVideoMode()
	},
	destroy: function () {
		GS.player.videoModeEnabled && this.isVideoMode && GS.player.disableVideoMode();
		this.wasPlaying && GS.player.resumeSong()
	},
	"a.video click": function (a) {
		$("a.video").removeClass("active");
		$(a).addClass("active");
		a = _.orEqual(parseInt($(a).attr("data-video-index"), 10), 0);
		var b = this.videos[a];
		console.log("video click", b);
		if (b) {
			switch (b.type) {
			case "iframe":
				if (!$("#videoPlayer") || !$("#videoPlayer").length) $(".content", this.element).html('<div id="videoPlayer"></div>');
				b.embed("videoPlayer");
				break;
			case "youtube":
				GS.youtube.attachPlayer(b.VideoID, b.width, b.height);
				break;
			case "flash":
			default:
				document.videoPlayer && document.videoPlayer.setVideo && document.videoPlayer.setVideo(a);
				break
			}
			b.title ? $("#lightbox_header .title").text(" - " + b.title) : $("#lightbox_header .title").text("")
		}
	},
	"#videoPlayerPrev click": function () {
		GS.player.youtubePrevSong()
	},
	"#videoPlayerNext click": function () {
		GS.player.youtubeNextSong()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VisualizerController", {
	onDocument: false
}, {
	embed: null,
	wasPlaying: false,
	visualizers: [{
		src: gsConfig.assetHost + "/webincludes/visualizers/LineNoFourier.swf",
		title: "Amped",
		thumbnail: gsConfig.assetHost + "/webincludes/images/lightbox/visualizer/linenofourier_thumb.png",
		width: 480,
		height: 320
	}, {
		src: gsConfig.assetHost + "/webincludes/visualizers/LineWorm.swf",
		title: "Worms",
		thumbnail: gsConfig.assetHost + "/webincludes/images/lightbox/visualizer/lineworm_thumb.png",
		width: 480,
		height: 320
	}, {
		src: gsConfig.assetHost + "/webincludes/visualizers/Tunnel.swf",
		title: "Tunnel",
		thumbnail: gsConfig.assetHost + "/webincludes/images/lightbox/visualizer/tunnel_thumb.png",
		width: 480,
		height: 320
	}, {
		src: gsConfig.assetHost + "/webincludes/visualizers/LineSmooth.swf",
		title: "Linear",
		thumbnail: gsConfig.assetHost + "/webincludes/images/lightbox/visualizer/linesmooth_thumb.png",
		width: 480,
		height: 320
	}, {
		src: gsConfig.assetHost + "/webincludes/visualizers/Explosion.swf",
		title: "Explosion",
		thumbnail: gsConfig.assetHost + "/webincludes/images/lightbox/visualizer/explosion_thumb.png",
		width: 480,
		height: 320
	}],
	init: function (a, b) {
		for (var c = _.orEqual(b.index, 0), g = 0; g < this.visualizers.length; g++) this.visualizers[g] = new GS.Models.Visualizer(this.visualizers[g]);
		this.subscribe("gs.visualizer.playing", this.callback("setVisualizer"));
		this.subscribe("gs.visualizer.player.ready", this.callback("setVisualizers"));
		this.subscribe("gs.player.streamserver", this.callback(this.onStreamServer));
		this.update({
			visualizer: this.visualizers[c],
			visualizers: this.visualizers,
			index: c
		})
	},
	update: function (a) {
		this.options = a;
		this.element.html(this.view("/lightbox/visualizer"));
		if (this.options.visualizers && this.options.visualizers.length) this.options.visualizer.flashvars.index = this.options.index;
		if (!this.embed) this.embed = this.options.visualizer.embed("visualizerPlayer");
		$(window).resize()
	},
	onStreamServer: function (a) {
		document.visualizerPlayer && document.visualizerPlayer.loadCrossdomain && document.visualizerPlayer.loadCrossdomain(a.streamServer)
	},
	setVisualizer: function (a) {
		$("a.visualizer").removeClass("active");
		$($("a.visualizer").get(a.index)).addClass("active")
	},
	setVisualizers: function () {
		if (document.visualizerPlayer && document.visualizerPlayer.setVisualizers) {
			for (var a = [], b, c = 0; c < this.options.visualizers.length; c++) {
				b = this.options.visualizers[c];
				a.push({
					author: b.author,
					height: b.height,
					src: b.src,
					thumbnail: b.thumbnail,
					title: b.title,
					width: b.width
				})
			}
			document.visualizerPlayer.setVisualizers(a)
		}
	},
	"a.visualizer click": function (a) {
		if (document.visualizerPlayer.setVisualizer) {
			$("a.visualizer").removeClass("active");
			$(a).addClass("active");
			document.visualizerPlayer.setVisualizer(parseInt($(a).attr("data-visualizer-index")))
		}
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ReAuthFacebookController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.reAuthFacebook.init");
		this.element.html(this.view("/lightbox/reAuthFacebook"))
	},
	"#lightbox button.submit click": function () {
		GS.facebook.login(function () {
			GS.lightbox.close()
		})
	},
	"#lightbox button.close click": function () {
		GS.facebook.logout(function () {
			GS.lightbox.close()
		})
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.SwfTimeoutController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.swftimeout.init");
		this.element.html(this.view("/lightbox/swfTimeout"));
		this.checkPlayer()
	},
	checkPlayerTimeout: false,
	checkPlayerWait: 1E3,
	checkPlayerCount: 0,
	checkPlayerMaxTries: 60,
	checkPlayer: function () {
		console.warn("player exists?", GS.player.player);
		if (GS.player.player) {
			GS.lightbox.trackLightboxView("swfTimeout/autoClosed");
			setTimeout(function () {
				GS.lightbox.close()
			}, 10)
		} else if (this.checkPlayerCount < this.checkPlayerMaxTries) {
			this.checkPlayerCount++;
			setTimeout(this.callback("checkPlayer"), this.checkPlayerWait)
		}
	},
	"button.reload click": function () {
		window.location.reload(true)
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.DeactivateAccountController", {
	onDocument: false
}, {
	init: function () {
		this.update()
	},
	update: function () {
		console.log("lb.deactivate.init");
		this.element.html(this.view("/lightbox/deactivateAccount"))
	},
	"a.submit, button.submit click": function () {
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		var c = parseInt($("input[name=deactivate_reason]:checked", a).val(), 10),
			g = $("textarea[name=deactivate_other_details]", a).val(),
			h = parseInt($("input[name=deactive_contact]:checked", a).val(), 10),
			k = $("input[name=deactivate_confirm]", a).val();
		if (c && k.length) {
			this.element.find(".error").hide();
			GS.service.userDisableAccount(k, c, g, h, this.callback(this.disableSuccess), this.callback(this.disableFailed))
		} else if (c) k.length || this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_DEACTIVATE_ERROR_PASSWORD"));
		else this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_DEACTIVATE_ERROR_REASON"));
		return false
	},
	"input[name=deactivate_reason] change": function () {
		parseInt($("#deactivateAccountForm input[name=deactivate_reason]:checked").val(), 10)
	},
	"textarea[name=deactivate_other_details] click": function () {
		$("#deactivate_reason_other").attr("checked", true);
		$("#deactivateAccountForm textarea[name=deactivate_other_details]").focus()
	},
	disableSuccess: function (a) {
		if (!a) return this.disableFailed(a);
		GS.auth.logout();
		GS.lightbox.close()
	},
	disableFailed: function () {
		console.log("lb.deactivate.fail", arguments);
		this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_DEACTIVATE_ERROR"))
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.PromotionController", {
	onDocument: false
}, {
	theme: null,
	promptOnLogin: false,
	init: function (a, b) {
		this.subscribe("lightbox.close.click", this.callback(this.onClose));
		this.update(b)
	},
	update: function (a) {
		this.options = a;
		this.theme = _.orEqual(a.theme, "");
		this.element.html(this.view("themes/" + this.theme.location + "/promotion"));
		$(window).resize()
	},
	"button.promo_login click": function () {
		GS.theme.promptOnLogin = true;
		GS.theme.lastDFPChange = (new Date).getTime() + 6E5;
		GS.lightbox.close();
		GS.lightbox.open("login")
	},
	"button.promo_signup click": function () {
		GS.theme.promptOnLogin = true;
		GS.theme.lastDFPChange = (new Date).getTime() + 6E5;
		GS.lightbox.close();
		GS.lightbox.open("signup")
	},
	"a.switchUser click": function () {
		GS.theme.promptOnLogin = true;
		GS.theme.lastDFPChange = (new Date).getTime() + 6E5;
		GS.lightbox.close();
		GS.auth.logout();
		setTimeout(GS.lightbox.open("login"), 0)
	},
	"a.submit click": function (a, b) {
		GS.theme.currentTheme.handleClick(b);
		GS.lightbox.close();
		GS.theme.promptOnLogin = false
	},
	onClose: function () {
		GS.theme.promptOnLogin = false
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ConfirmPasswordProfileController", {
	onDocument: false
}, {
	profileParams: null,
	serviceCallback: null,
	serviceErrback: null,
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		console.log("lb.confirmpassword.init");
		this.profileParams = a.params;
		this.serviceCallback = a.callback;
		this.serviceErrback = a.errback;
		this.element.html(this.view("/lightbox/confirmPasswordProfile"))
	},
	"button.submit click": function () {
		$("form", this.element).submit()
	},
	"form submit": function (a, b) {
		b.preventDefault();
		var c = $("input[name=confirmPassword]", a).val();
		if (c) {
			this.profileParams.password = c;
			GS.user.settings.updateProfile(this.profileParams, this.serviceCallback, this.serviceErrback);
			GS.lightbox.close()
		} else {
			$("div.message", this.element).html($.localize.getString("POPUP_CONFIRM_EMAIL_ERROR_NOPW"));
			this.element.find(".error").show()
		}
		return false
	}
});
(function () {
	GS.Controllers.VipInterface.extend("GS.Controllers.Lightbox.RedeemController", {
		onDocument: false
	}, {
		type: "",
		promoCode: "",
		threeDays: 2592E5,
		anywhere: false,
		vip: false,
		init: function (a, b) {
			this.update(b)
		},
		update: function (a) {
			a = _.orEqual(a, {});
			this.type = _.orEqual(a.type, "");
			this.vipEndpoint = gsConfig.runMode == "production" ? "https://vip.grooveshark.com/" : "https://stagingvip.grooveshark.com/";
			this.vipToken = hex_md5((new Date).getTime());
			this.vipCallbackUrl = location.protocol + "//" + location.host + "/vipCallback.php";
			var b = (new Date).getTime();
			redeemInfo = store.get("lastRedeemCode");
			this.promoCode = "";
			if (redeemInfo && redeemInfo.promoCode && redeemInfo.expires >= b) {
				this.type = _.orEqual(redeemInfo.type, this.type);
				this.promoCode = redeemInfo.promoCode
			}
			this.element.html(this.view("/lightbox/redeem/index"));
			if (a && a.autoSubmit && this.promoCode) GS.user.isLoggedIn ? this.redeemFormSubmit() : this.subscribe("gs.auth.update", this.callback(function () {
				this.redeemFormSubmit()
			}));
			GS.lightbox.trackLightboxView("redeem")
		},
		"#redeem_promocode focus": function (a) {
			a.val() == $.localize.getString("POPUP_REDEEM_ENTER_CODE") && a.val("");
			$("#redeem_invalid_code").hide()
		},
		"#redeem_promocode keyup": function () {
			$("#redeem_invalid_code").hide()
		},
		"#redeem_promocode blur": function (a) {
			a.val() == "" && a.val($.localize.getString("POPUP_REDEEM_ENTER_CODE"))
		},
		"#redeemForm submit": function (a, b) {
			b.preventDefault();
			this.redeemFormSubmit();
			return false
		},
		redeemFormSubmit: function () {
			var a, b = $("#redeem_promocode").val();
			if (b === "") $("#redeem_promocode").parent().parent().addClass("error");
			else if (GS.user.isLoggedIn) {
				$("#redeem_promocode").parent().parent().removeClass("error");
				a = hex_md5((new Date).getTime());
				GS.service.httpsFormSubmit(this.vipEndpoint + "payByPromoCode.php", {
					vipToken: this.vipToken,
					callbackMethod: a,
					callbackUrl: this.vipCallbackUrl,
					code: b
				});
				window[a] = this.callback(function (c) {
					console.error("offersubmit win.callback", h, c, $("#httpsIframe"));
					if (c.bSuccess) {
						this.element.find(".error.response").hide();
						GS.lightbox.trackLightboxView("redeem/offersConfirm");
						var g = hex_md5((new Date).getTime()),
							h = {
								callbackMethod: g,
								callbackUrl: this.vipCallbackUrl,
								token: c.token
							};
						if (c.description.match(/anywhere/i)) this.anywhere = true;
						else if (c.description.match(/vip/i)) this.vip = true;
						GS.service.httpsFormSubmit(this.vipEndpoint + "payByPromoCodeConfirm.php", h);
						window[g] = this.callback(function (k) {
							console.error("offers confirmsubmit win.callback", h, k, "success:", k.bSuccess, $("#httpsIframe"));
							var m = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
							if (k.bSuccess) {
								GS.user.updateAccountType(m);
								this.element.html(this.view("/lightbox/redeem/success"));
								GS.lightbox.trackLightboxView("redeem/success")
							} else this.showVipErrors(k)
						})
					} else this.showVipErrors(c)
				})
			} else {
				a = (new Date).getTime() + this.threeDays;
				store.set("lastRedeemCode", {
					promoCode: b,
					expires: a,
					type: this.type
				});
				GS.lightbox.close();
				GS.lightbox.open("login", {
					showCTA: true,
					resumeRedeem: true
				})
			}
		}
	})
})();
GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ConfirmController", {
	onDocument: false
}, {
	approveCallback: null,
	cancelCallback: null,
	data: null,
	init: function (a, b) {
		this.update(b)
	},
	update: function (a) {
		a = _.orEqual(a, {});
		this.title = a.title;
		this.message = _.orEqual(a.message, "");
		this.approveCallback = a.callback;
		this.cancelCallback = a.errback;
		this.data = _.orEqual(a.data, {});
		this.element.html(this.view("/lightbox/confirm"))
	},
	"button.submit click": function () {
		this.approveCallback && this.approveCallback(this.data);
		GS.lightbox.close()
	},
	"button.cancel click": function () {
		this.cancelCallback && this.cancelCallback(this.data);
		GS.lightbox.close()
	}
});
GS.Controllers.BaseController.extend("GS.Controllers.LightboxController", {
	onElement: "#lightbox_wrapper"
}, {
	priorities: {
		sessionBad: 12,
		SESSION_BAD: 12,
		maintenance: 11,
		DOWN_FOR_MAINTENANCE: 11,
		invalidClient: 10,
		INVALID_CLIENT: 10,
		badHost: 8,
		BAD_HOST: 8,
		interactionTime: 7,
		INTERACTION_TIMER: 7,
		vipRequiredLogin: 5,
		VIP_REQUIRED_LOGIN: 5,
		vipOnlyFeature: 3,
		VIP_ONLY_FEATURE: 3,
		signup: 2,
		SIGNUP: 2,
		vipSignup: 1,
		VIP_SIGNUP: 1
	},
	notCloseable: ["maintenance", "invalidClient", "sessionBad", "badHost", "swfTimeout"],
	queue: [],
	queuedOptions: {},
	curType: null,
	isOpen: false,
	priority: 0,
	init: function () {
		$.subscribe("window.resize", this.callback(this.positionLightbox));
		if (gsConfig.lightboxOnInit) {
			this.open(gsConfig.lightboxOnInit.type, gsConfig.lightboxOnInit.defaults);
			gsConfig.lightboxOnInit = false
		}
		this._super()
	},
	positionLightbox: function () {
		if (this.isOpen) {
			this.curType !== "signup" && $("#lightbox_content").css("height", "auto");
			var a = Math.max($("#lightbox_wrapper").width(), 400),
				b = Math.min(Math.max($("#lightbox_wrapper").height(), 100), $("body").height() - 70);
			a = Math.round($("#main").width() / 2 - a / 2);
			var c = Math.max(35, Math.round($("#main").height() / 2 - b / 2)),
				g = $("#lightbox_content").height(),
				h = $("#lightbox_header", this.element).outerHeight() + $("#div.error.response:visible", this.element).outerHeight() + $("#lightbox_footer", this.element).outerHeight(),
				k = 0;
			$(".measure", "#lightbox_content").each(function (m) {
				k += $(m).height()
			});
			b = Math.min(Math.max(150, parseInt(b - h, 10)));
			if (b < g && !$("#lightbox_content").is(".fixed_content")) {
				$("#lightbox_content").height(b);
				$(".lightbox_pane_content").height($("#lightbox_content").height() - $("#lightbox_content #pane_footer").outerHeight() - k)
			}
			$("#lightbox_wrapper").css({
				top: c,
				left: a
			});
			this.queuedOptions[this.curType] && this.queuedOptions[this.curType].showPlayerControls && $("#lightbox_overlay").height($(window).height() - $("#player").height());
			$.publish("lightbox.position")
		}
	},
	open: function (a, b) {
		var c = this.queue.indexOf(a),
			g = _.orEqual(this.priorities[a], 0);
		b = _.orEqual(b, null);
		var h = this;
		if (this.curType === a) return false;
		this.queuedOptions[a] = b;
		if (g < this.currentPriority) this.queue.indexOf(a) === -1 && this.queue.push(a);
		else {
			this.curType && this.queue.indexOf(this.curType) === -1 && this.queue.push(this.curType);
			if (!(this.queue.length && c !== -1 && c > -1)) {
				this.curType = a;
				this.currentPriority = g;
				this.isOpen = true;
				$("#lightbox_overlay").height("100%");
				$("#lightbox_wrapper .lbcontainer." + a)[$.String.underscore("gs_lightbox_" + a)](b);
				$("#lightbox .lbcontainer." + a).show(1, function () {
					h.positionLightbox();
					$(this).find("form input:first:visible").focus()
				}).siblings().not(".login").empty();
				this.trackLightboxView(a);
				if ($("#lightbox_wrapper").is(":visible")) this.queue.indexOf(a) === -1 && this.queue.unshift(a);
				else this.queue.indexOf(a) === -1 && this.queue.push(a);
				$("#theme_home .flash object").hide();
				$("#lightbox_wrapper,#lightbox_overlay").show();
				this.notCloseable.indexOf(this.curType) == -1 ? $("#lightbox_close").show() : $("#lightbox_close").hide()
			}
		}
	},
	close: function () {
		var a, b;
		a = this.queue.shift();
		if (_.defined(a)) {
			$("#lightbox_wrapper .lbcontainer." + a).hide();
			a !== "login" && $("#lightbox_wrapper .lbcontainer." + a).empty().controller().destroy()
		}
		this.currentPriority = this.curType = false;
		if (this.queue.length > 0) {
			this.queue = this.sortQueueByPriority(this.queue);
			a = this.queue.shift();
			b = this.queuedOptions[a];
			try {
				this.open(a, b)
			} catch (c) {
				console.warn("error opening next lightbox", c);
				this.isOpen = this.currentPriority = this.curType = false;
				$("#lightbox_wrapper,#lightbox_overlay").hide();
				$("#theme_home .flash object").show()
			}
		} else {
			this.isOpen = this.currentPriority = this.curType = false;
			$("#lightbox_wrapper,#lightbox_overlay").hide();
			$("#theme_home .flash object").show()
		}
	},
	sortQueueByPriority: function (a) {
		a.sort(this.callback(function (b, c) {
			var g = _.orEqual(this.priorities[b], 0),
				h = _.orEqual(this.priorities[c], 0);
			return g == h ? 0 : g > h ? 1 : -1
		})).reverse();
		return a
	},
	trackLightboxView: function (a) {
		a = "#/lb/" + a;
		if (window._gaq && window._gaq.push) {
			a = encodeURI(a);
			window._gaq.push(["_trackPageview", a])
		}
	},
	".close click": function (a, b) {
		b.preventDefault();
		console.log("lightbox close");
		GS.lightbox.close()
	},
	"input focus": function (a) {
		$(a).parent().parent().addClass("active")
	},
	"textarea focus": function (a) {
		$(a).parent().parent().parent().addClass("active")
	},
	"input blur": function (a) {
		$(a).parent().parent().removeClass("active")
	},
	"textarea blur": function (a) {
		$(a).parent().parent().parent().removeClass("active")
	}
});
(function (a) {
	function b(h) {
		if (_.defined(h.inviteCode)) {
			gsConfig.inviteCode = h.inviteCode;
			var k = (new Date).valueOf() + 12096E5;
			try {
				store.set("lastInviteCode", {
					inviteCode: h.inviteCode,
					expires: k
				})
			} catch (m) {}
		}
		if (h.hasOwnProperty("changetheme") && _.defined(h.themeid)) _.defined(h.dfp) && h.dfp == "true" ? GS.theme.setCurrentThemeDFPOverride(h.themeid) : GS.theme.setCurrentTheme(h.themeid, true);
		h.hasOwnProperty("themes") && GS.lightbox.open("themes");
		if (h.hasOwnProperty("password")) {
			k = {};
			if (h.hasOwnProperty("code")) k.resetCode = h.code;
			GS.lightbox.open("forget", k)
		}
		h.hasOwnProperty("invite") && GS.lightbox.open("invite");
		h.hasOwnProperty("signup") && GS.lightbox.open("signup");
		h.hasOwnProperty("login") && GS.lightbox.open("login");
		if (h.hasOwnProperty("measurePerformance")) {
			var o = false,
				r = function () {
					if (a("#grid ul.options").length) {
						top.hasLoaded("search");
						GS.player.addSongsToQueueAt([a("#grid ul.options:first").attr("rel")], -1, true);
						setTimeout(s, 1)
					} else setTimeout(r, 1)
				},
				s = function () {
					if (GS.player.isPlaying && !GS.player.isLoading && !o) {
						o = true;
						top.hasLoaded("play")
					} else setTimeout(s, 1)
				};
			if (window.top && window != top && a.isFunction(top.hasLoaded)) {
				top.hasLoaded("page");
				setTimeout(r, 1);
				location.hash = "/search?q=eminem"
			}
		}
	}
	function c() {
		var h = a.makeArray(arguments),
			k = h.shift()[0],
			m = this;
		if (_.isEmpty(k)) m.length = 0;
		else {
			k = k.replace(/\/$/, "").split("/");
			m.length = k.length;
			var o;
			_.forEach(k, function (r, s) {
				o = h[s];
				m[o] = r
			})
		}
	}
	GS.router = new(function () {
		var h = this;
		this._routes = [];
		this._history = [];
		this._nextHashShift = this._historyIndex = 0;
		this.hasForward = this.hasBack = false;
		this.get = function (k, m, o) {
			o = _.orEqual(o, this);
			if (!(k instanceof RegExp) && !_.isString(k)) console.error("invalid route, must be String or RegExp");
			else {
				if (_.isString(k)) k = RegExp("^" + k + "$");
				this._routes.push({
					path: k,
					callback: m,
					context: o
				})
			}
		};
		this.notFound = function () {
			window.location.hash = "#/notFound"
		};
		this.back = function () {
			this.navHistory(-1)
		};
		this.forward = function () {
			this.navHistory(1)
		};
		this.navHistory = function (k) {
			var m = this._historyIndex + k;
			if (m >= 0 && m < this._history.length) {
				this._nextHashShift = k;
				window.location.hash = this._history[m]
			}
		};
		this.performSearch = function (k, m) {
			if (m.indexOf("http://") == 0 && m.indexOf("tinysong") == -1) {
				m = m.substring(7);
				var o = m.indexOf("#");
				if (o != -1) window.location.hash = m.substring(o);
				else {
					o = m.indexOf("/");
					window.location.hash = "#" + m.substring(o)
				}
			} else {
				k = k.toLowerCase();
				if (k == "song") k = null;
				m = encodeURIComponent(m);
				window.location.hash = k ? "#/search/" + k + "?q=" + m : "#/search?q=" + m
			}
		};
		this.run = function () {
			this.page = GS.Controllers.PageController;
			this.before = this.page.checkLock;
			a(window).hashchange(function () {
				var k = location.hash;
				if (k && k.length) k = location.href.substring(location.href.indexOf("#"));
				h._onHashChange(k)
			});
			a(window).trigger("hashchange")
		};
		this._onHashChange = function (k) {
			if (a.isFunction(this.before)) if (!this.before()) return;
			window._gaq && _gaq.push && _gaq.push(["_trackPageview", k]);
			window.COMSCORE && COMSCORE.beacon && COMSCORE.beacon({
				c1: 2,
				c2: "8187464",
				c4: (location.protocol + "//" + location.host + "/" + k).replace("#/", "")
			});
			if (this._nextHashShift != 0) {
				var m = this._historyIndex + this._nextHashShift;
				if (m >= 0 && m < this._history.length && this._history[m] == k) this._historyIndex = m;
				else this._nextHashShift = 0
			}
			if (this._nextHashShift == 0) {
				this._history = this._history.slice(0, this._historyIndex + 1);
				k && this._history.push(k);
				this._historyIndex = this._history.length - 1
			}
			this._nextHashShift = 0;
			m = this._parseQueryString(k);
			var o = k.replace(g, "");
			if (k = this._getRouteForPath(o)) {
				o = o.match(k.path);
				o.shift();
				m.splat = o;
				if (a.isFunction(k.callback)) {
					k.callback.call(k.context, m);
					b(m)
				}
				this.hasBack = this._history.length && this._historyIndex > 0;
				this.hasForward = this._history.length && this._historyIndex < this._history.length - 1;
				a.publish("gs.router.history.change")
			} else this.notFound()
		};
		this._getRouteForPath = function (k) {
			var m, o;
			for (o = 0; o < this._routes.length; o++) {
				var r = this._routes[o];
				if (r.path.test(k)) {
					m = r;
					break
				}
			}
			return m
		};
		this._parseQueryString = function (k) {
			var m = {},
				o, r;
			if (k = k.match(g)) {
				k = k[1].split("&");
				for (r = 0; r < k.length; r++) {
					o = k[r].split("=");
					m = this._parseParamPair(m, decodeURIComponent(o[0]), decodeURIComponent(o[1]))
				}
			}
			return m
		};
		this._parseParamPair = function (k, m, o) {
			if (k[m]) if (_isArray(k[m])) k[m].push(o);
			else k[m] = [k[m], o];
			else k[m] = o;
			return k
		}
	});
	GS.router.get("", function () {
		var h = window.location,
			k = h.href.substring(h.href.indexOf(h.host) + h.host.length);
		h.replace(h.protocol + "//" + h.host + "/#" + k)
	});
	GS.router.get("#/", function (h) {
		h = _.defined(h.search);
		this.page.activate("home", null).index(h);
		GS.guts.handlePageLoad("home", {})
	});
	GS.router.get("#/notFound", function () {
		this.page.activate("home", null).notFound()
	});
	GS.router.get(/^#\/user\/(.*)\/?$/, function (h) {
		h = new c(h.splat, "login", "id", "section", "subpage");
		var k = this.page.activate("user", h.id);
		switch (h.length) {
		case 1:
			k.music(h.login, null);
			break;
		case 2:
			k.index(h.login, h.id);
			break;
		case 3:
			k[h.section](h.login, h.id, h.section);
			break;
		case 4:
			k[h.section](h.login, h.id, h.subpage);
			break;
		default:
			this.notFound()
		}
		GS.guts.handlePageLoad("user", h)
	});
	GS.router.get(/^#\/playlist\/(.*)\/?/, function (h) {
		var k = new c(h.splat, "name", "id", "subpage"),
			m = this.page.activate("playlist", k.id);
		switch (k.length) {
		case 2:
		case 3:
			var o = _.orEqual(k.subpage, "music");
			m.index(k.id, o, h.play);
			break;
		default:
			this.notFound()
		}
		GS.guts.handlePageLoad("playlist", k)
	});
	GS.router.get(/^#\/s(?:ong)?\/(.*)\/?/, function (h) {
		h = new c(h.splat, "name", "token", "subpage");
		var k = this.page.activate("song", h.token);
		switch (h.length) {
		case 2:
		case 3:
			var m = _.orEqual(h.subpage, "comments");
			k.index(h.token, m);
			break;
		default:
			this.notFound()
		}
		GS.guts.handlePageLoad("song", h)
	});
	GS.router.get(/^#\/(album|artist)\/(.*)\/?/, function (h) {
		var k = h.splat.shift(),
			m = new c(h.splat, "name", "id", "subpage"),
			o = this.page.activate(k, m.id);
		switch (m.length) {
		case 2:
		case 3:
			var r = _.orEqual(m.subpage, "music");
			o.index(m.id, r, h.play);
			break;
		default:
			this.notFound()
		}
		GS.guts.handlePageLoad(k, m)
	});
	GS.router.get(/^#\/redeem\/?(.*)\/?/, function (h) {
		h = new c(h.splat, "type");
		this.page.activate("home", null).index();
		GS.lightbox.open("redeem", {
			type: h.type
		});
		GS.guts.handlePageLoad("redeem", h)
	});
	GS.router.get(/^#\/(theme)\/(.*)\/?/, function (h) {
		h.splat.shift();
		var k = new c(h.splat, "name", "themeid", "type");
		_.defined(h.dfp) ? GS.theme.setCurrentThemeDFPOverride(k.themeid) : GS.theme.setCurrentTheme(k.themeid, true);
		this.page.activate("home", null).index()
	});
	GS.router.get(/^#\/search\/?(.*)?\/?/, function (h) {
		var k = new c(h.splat, "type");
		this.page.activate("search", (k.type || "everything") + (h.q || h.query)).index(k.type, h.q || h.query);
		if (k.type) k.subpage = k.type;
		else k.type = "everything";
		GS.guts.handlePageLoad("search", k)
	});
	GS.router.get(/^#\/(.*)\/?$/, function (h) {
		h = new c(h.splat, "page", "type");
		var k = this.page.activate(h.page, null);
		_.defined(k) ? k.index(h.type) : this.notFound();
		GS.guts.handlePageLoad(h.page, h)
	});
	var g = /\?([^#]*)$/
})(jQuery);
(function (a) {
	function b() {
		clearTimeout(h);
		if (m) {
			clearTimeout(m);
			a.browser.msie ? a("#homeSearch,.ui-autocomplete").show() : a("#homeSearch,.ui-autocomplete").stop().css({
				opacity: 1
			})
		}
		h = setTimeout(function () {
			var u = GS.player.getPlaybackStatus();
			if (u && u.status === GS.player.PLAY_STATUS_PLAYING && !GS.user.IsPremium) {
				GS.player.pauseNextSong();
				GS.lightbox.open("interactionTime")
			}
		}, k);
		if (GS.theme && GS.theme.currentTheme && GS.theme.currentTheme.screensaver) m = setTimeout(function () {
			a.browser.msie ? a("#homeSearch,.ui-autocomplete").hide() : a("#homeSearch,.ui-autocomplete").animate({
				opacity: 0
			}, 500)
		}, o)
	}
	function c() {
		var u = document.title || "";
		if (u.indexOf("#") != -1) u = u.substring(0, u.indexOf("#"));
		if (document.title != u && u != "") document.title = u
	}
	var g = 0;
	a(window).resize(function () {
		var u = false;
		if (g != a("#application").width()) {
			g = a("#application").width();
			u = true;
			a.browser.msie && a(window).resize()
		}
		a("#content").css({
			height: a(window).height() - a("#header").height() - a("#footer").height()
		});
		u ? a("#sidebar").css({
			height: a(window).height() - a("#header").height() - a("#footer").height(),
			width: g < 620 ? 100 : g < 844 ? 150 : g < 1100 ? 175 : 200
		}) : a("#sidebar").css({
			height: a(window).height() - a("#header").height() - a("#footer").height()
		});
		a("#page_wrapper").css({
			height: a(window).height() - a("#header").height() - a("#footer").height(),
			width: a("#application").width() - a("#sidebar").width()
		});
		a("#page_wrapper .meta").outerWidth() + a("#page_wrapper .page_options").outerWidth() > a("#page_wrapper").width() && a("#page_nav").addClass("page_nav_collapsed");
		a("#page_content").css({
			height: a("#page_wrapper").height() - a("#page_header").height() - a("#page_footer").height() - a("#theme_page_header.active").height(),
			width: a("#page_wrapper").width()
		});
		a("#page_content .noResults_pane").css({
			height: a("#page_content").height() - 20
		});
		a("#page_content .page_column_fluid").each(function () {
			var w = 0,
				C = a("#page_wrapper").width();
			a(this).siblings(".page_column").each(function () {
				a(this).height(a("#page_content").height());
				if (a(this).is(".page_filter")) {
					if (!a(this).is(".suppressAutoCollapse")) if (g < 844 && !a(this).is(".manualOpen")) a(this).addClass("collapsed");
					else if (g < 1100 && w > 0 && !a(this).is(".manualOpen")) a(this).addClass("collapsed");
					else a(this).is(".manualCollapse") || a(this).removeClass("collapsed");
					a(this).removeClass("suppressAutoCollapse");
					if (a(this).is(".collapsed")) {
						var v = a(this).find(".gs_grid").controller();
						v && v.grid && a(this).width(v.grid.getScrollWidth())
					} else a(this).width(175)
				}
				w += a(this).outerWidth()
			});
			a(this).is(".scrollable") ? a(this).css({
				width: C - w,
				height: a("#page_content").height()
			}) : a(this).css({
				width: C - w
			})
		});
		a.publish("window.resize");
		a(".gs_grid").resize()
	});
	a(window).unload(function () {
		GS.user.isLoggedIn && GS.user.storeData();
		GS.theme && GS.theme.savePreferences()
	});
	var h, k = 36E5,
		m, o = 15E3;
	a("body").konami(function () {
		a.publish("gs.playlist.play", {
			playlistID: 40563861,
			playOnAdd: true
		})
	});
	a("body").bind("mousemove", b);
	a("body").bind("keydown", b);
	b();
	a.browser.msie && a(document).bind("propertychange", function () {
		event.propertyName == "title" && c()
	});
	GS.windowResizeTimeout = null;
	GS.windowResizeWait = 10;
	a(window).resize();
	if (window.gsViewBundles) GS.Controllers.BaseController.viewBundles = window.gsViewBundles;
	if (window.gsBundleVersions) GS.Controllers.BaseController.bundleVersions = window.gsBundleVersions;
	if (window.gsPageBundle && a.isPlainObject(gsPageBundle)) for (var r in gsPageBundle) if (gsPageBundle.hasOwnProperty(r)) a.View.preCached[r] = gsPageBundle[r];
	GS.airbridge = GS.Controllers.AirbridgeController.instance();
	GS.service = GS.Controllers.ServiceController.instance();
	GS.auth = GS.Controllers.AuthController.instance();
	GS.lightbox = GS.Controllers.LightboxController.instance();
	GS.notice = GS.Controllers.NotificationsController.instance();
	GS.header = GS.Controllers.HeaderController.instance();
	GS.sidebar = GS.Controllers.SidebarController.instance();
	GS.theme = GS.Controllers.ThemeController.instance();
	GS.page = GS.Controllers.PageController.instance();
	GS.player = GS.Controllers.PlayerController.instance();
	GS.youtube = GS.Controllers.YoutubeController.instance();
	GS.ad = GS.Controllers.AdController.instance();
	GS.guts = GS.Controllers.GUTSController.instance();
	GS.locale = GS.Controllers.LocaleController.instance();
	GS.facebook = GS.Controllers.FacebookController.instance();
	GS.lastfm = GS.Controllers.LastfmController.instance();
	GS.google = GS.Controllers.GoogleController.instance();
	GS.search = {
		search: "",
		type: "",
		lastSearch: "",
		lastType: ""
	};
	GS.loadedPage = location.hash;
	r = GS.loadedPage.indexOf("?");
	GS.loadedPage = r === -1 ? GS.loadedPage : GS.loadedPage.substring(0, r);
	window.Grooveshark = GS.Controllers.ApiController.instance();
	a(document).bind("keydown", "ctrl+a", function (u) {
		var w = [],
			C = a(".gs_grid:last").controller();
		if (!a(u.target).is("input,select,textarea") && C) {
			for (u = 0; u < C.dataView.rows.length; u++) {
				w.push(u);
				C.selectedRowIDs.push(C.dataView.rows[u].id)
			}
			C.grid.setSelectedRows(w);
			C.grid.onSelectedRowsChanged();
			return false
		}
	});
	(function () {
		var u = new a.Event("remove"),
			w = a.fn.remove;
		a.fn.remove = function () {
			a(this).trigger(u);
			w.apply(this, arguments)
		}
	})();
	r = true;
	var s = _.browserDetect();
	switch (s.browser) {
	case "chrome":
		if (s.version >= 6) r = false;
		break;
	case "safari":
		if (s.version >= 5) r = false;
		break;
	case "msie":
		if (s.version >= 7 && s.version < 9) r = false;
		break;
	case "firefox":
		if (s.version >= 3) r = false;
		break;
	case "mozilla":
		if (s.version >= 1.9) r = false;
		break;
	case "opera":
		if (s.version >= 11) r = false;
		break;
	case "adobeair":
		r = false;
		break
	}
	r && GS.lightbox.open("unsupportedBrowser");
	window.playSongFromAd = function (u) {
		try {
			u = u || [];
			typeof u == "object" && u.constructor == Array || (u = [u]);
			GS.player.addSongsToQueueAt(u, null, true)
		} catch (w) {}
	};
	a(function () {
		var u = null;
		a("body").mouseup(function () {
			a: {
				var w = "";
				if (window.getSelection) w = window.getSelection();
				else if (document.getSelection) w = document.getSelection();
				else if (document.selection) w = document.selection.createRange().text;
				else {
					u = "";
					break a
				}
				u = w.toString()
			}
			f = u.length;
			w = 0;
			var C = u.replace(/\s/g, " ");
			C = C.split(" ");
			for (z = 0; z < C.length; z++) C[z].length > 0 && w++;
			d = w;
			u !== null && d < 60 && f > 3 && _gaq.push(["_trackEvent", "user", "copyText", u])
		})
	});
	GS.gotoUpgradePage = function () {
		location.hash = "/settings/subscriptions"
	};
	a(document).ready(function () {
		a("*").scrollTop(0);
		document.body.scroll = "no";
		a("#main,#page_wrapper").scroll(function (u) {
			if (a(this).scrollTop() > 0) {
				console.warn("Fixing Scroll", u.target);
				a(this).scrollTop(0)
			}
			return false
		});
		a.browser.msie && c();
		a.publish("gs.app.ready");
		GS.router.run()
	})
})(jQuery);
window.onbeforeunload = function (a) {
	GS.player.storeQueue();
	var b;
	a = a || window.event;
	if (!GS.user.isLoggedIn && GS.user.isDirty) {
		b = $.localize.getString("ONCLOSE_PROMPT_LOGIN");
		GS.lightbox.open("login")
	}
	if (GS.player.isPlaying) b = $.localize.getString("ONCLOSE_PLAYING");
	if (!GS.Controllers.PageController.ALLOW_LOAD) b = GS.Controllers.PageController.confirmMessage;
	if (b) {
		if (a) a.returnValue = b;
		return b
	}
};