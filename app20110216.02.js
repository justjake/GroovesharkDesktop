  $.Model.extend("GS.Models.Base", {cache : {}, getOneFromCache : (function (a)
{
  var b = this.shortName.toLowerCase() + "s";
  if (GS.user && GS.user.favorites[b])
    if (b = GS.user.favorites[b][a])
      return b;
  return this.cache[a];
}
), getManyFromCache : (function (a)
{
  for (var b = [], c = 0;c < a.length;c++)
    b.push(this.getOneFromCache(a[c]));
  return b;
}
), wrap : (function (a,b)
{
  var c = this.id, d = a[c];
  b = _.orEqual(b, true);
  if (d)
    if (d = this.getOneFromCache(d))
      return d;
  d = this._super(a);
  if (b && d[c])
    if (this.shortName !== "Song" || d.validate())
      this.cache[d[c]] = d;
  return d;
}
), wrapManyInObject : (function (a,b)
{
  for (c in a)
    if (a.hasOwnProperty(c))
      a[c] = this.wrap(a[c], b);
  return a;
}
), wrapManySearchResults : (function (a)
{
  a = a.result || a;
  for (var b = [], c, d, f = 0;f < a.length;f++)
    {
      c = a[f];
      d = this.wrap(c);
      for (g in c)
        if (c.hasOwnProperty(g))
          d[g] || (d[g] = c[g]);
      b.push(d);
    }
  return b;
}
)}, {songIDs : [], dupe : (function ()
{
  return new this.Class(this.attrs());
}
), wrapManySongs : (function (a,b)
{
  var c = a.Songs || a.songs || a.result || a, d = [], f;
  b = _.orEqual(b, false);
  for (var g = 0;g < c.length;g++)
    {
      c[g].isVerified = b ? 1 : - 1;
      f = GS.Models.Song.wrap(c[g]);
      f.isVerified = b ? 1 : - 1;
      if (f.isVerified && c[g].TrackNum)
        f.TrackNum = parseInt(c[g].TrackNum);
      if (f.SongID > 0)
        {
          d.push(f);
          this.songIDs.push(f.SongID);
        }
    }
  if (a && a.hasMore)
    {
      console.log("service has more. current page is: ", this.currentPage);
      this.currentPage++;
    }
  else
    this.songsLoaded = true;
  d._use_call = true;
  return d;
}
), wrapManyVerifiedSongs : (function (a)
{
  return this.wrapManySongs(a, true);
}
), playSongs : (function (a)
{
  _.orEqual(a.index, - 1);
  _.orEqual(a.playOnAdd, false);
  var b = _.orEqual(a.sort, false);
  if (b)
    {
      var c = GS.Models.Song.getManyFromCache(this.songIDs);
      c = c.sort((function (d,f)
{
  if (d.hasOwnProperty(b) && f.hasOwnProperty(b))
    return d[b] > f[b];
  else
    if (d.hasOwnProperty(b))
      return true;
  return false;
}
));
      this.songIDs = [];
      _.forEach(c, (function (d)
{
  this.songIDs.push(d.SongID);
}
), this);
    }
  console.log("PLAY SONGS", this.songIDs);
  GS.player.addSongsToQueueAt(this.songIDs, a.index, a.playOnAdd);
}
)});
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Song", {id : "SongID", cache : {}, defaults : {AlbumID : null, AlbumName : "", ArtistID : null, ArtistName : "", CoverArtFilename : "", EstimateDuration : 0, Flags : 0, IsLowBitrateAvailable : 0, Popularity : "", SongID : null, SongName : "", TrackNum : 0, Year : 0, artPath : "http://beta.grooveshark.com/static/amazonart/", fromLibrary : 0, isFavorite : 0, isVerified : - 1, _token : null, tokenFailed : false}, songsLoaded : false, songsUnverifiedLoaded : false, songIDs : [], getSong : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b), h = arguments[(arguments.length - 1)] === f ? {} : arguments[(arguments.length - 1)];
  f = _.orEqual(f, true);
  if (g)
    c(g);
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getQueueSongListFromSongIDs([b], this.callback(["wrapSongsFromIDs", c]), d, h);
    }
}
), getSongFromToken : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b);
  f = _.orEqual(f, true);
  if (g)
    c(g);
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getSongFromToken(b, this.callback(["wrap", c]), d);
    }
}
), getVerifiedDivider : (function ()
{
  return this.wrap({SongID : - 1, SongName : "", ArtistName : "", ArtistID : 0, AlbumName : "", AlbumID : 0, CoverArtFilename : "", isVerified : 0}, false);
}
), wrapQueue : (function (b)
{
  for (var c = [], d = 0;d < b.length;d++)
    {
      var f = b[d], g = this.wrap({SongID : f.songID, SongName : f.songName, ArtistName : f.artistName, ArtistID : f.artistID, AlbumName : f.albumName, AlbumID : f.albumID, CoverArtFilename : f.artFilename, EstimateDuration : f.estimateDuration}).dupe();
      g.EstimateDuration = f.estimateDuration;
      _.forEach(["autoplayVote", "flags", "parentQueueID", "queueSongID", "source", "index"], (function (h)
{
  g[h] = f[h];
}
));
      c.push(g);
    }
  return c;
}
), wrapSongsFromIDs : (function (b)
{
  for (var c = [], d = 0;d < b.length;d++)
    {
      var f = b[d], g = this.wrap({SongID : f.SongID, SongName : f.SongName ? f.SongName : f.Name, ArtistName : f.ArtistName, ArtistID : f.ArtistID, AlbumName : f.AlbumName, AlbumID : f.AlbumID, CoverArtFilename : f.ArtFilename, EstimateDuration : f.EstimateDuration}).dupe();
      _.forEach(["AutoplayVote", "Flags", "ParentQueueID", "QueueSongID", "Source", "Index"], (function (h)
{
  g[h] = f[h];
}
));
      c.push(g);
    }
  return c;
}
), wrapFeed : (function (b)
{
  for (var c = 0, d = b.length, f = [];c < d;c++)
    f.push(this.wrap({SongID : b[c].songID, SongName : b[c].songName, ArtistName : b[c].artistName, ArtistID : b[c].artistID, AlbumName : b[c].albumName, AlbumID : b[c].albumID, CoverArtFilename : b[c].artFilename}));
  return f;
}
), archive : (function (b)
{
  return {A : b.AlbumID, B : b.AlbumName, C : b.ArtistID, D : b.ArtistName, E : b.CoverArtFilename, F : b.EstimateDuration, G : b.Flags, H : b.Popularity, I : b.SongID, J : b.SongName, K : b.TSAdded, L : b.TrackNum, M : b.Year, N : b.isFavorite};
}
), unarchive : (function (b)
{
  return {AlbumID : b.A, AlbumName : b.B, ArtistID : b.C, ArtistName : b.D, CoverArtFilename : b.E, EstimateDuration : b.F, Flags : b.G, Popularity : b.H, SongID : b.I, SongName : b.J, TSAdded : b.K, TrackNum : b.L, Year : b.M, isFavorite : b.N};
}
), getOneFromCache : (function (b)
{
  if (GS.user)
    {
      var c = GS.user.library.songs[b];
      if (c)
        return c;
      if (c = GS.user.favorites.songs[b])
        return c;
    }
  return this.cache[b];
}
)}, {validate : (function ()
{
  if (this.SongID > 0 && this.ArtistID > 0 && this.AlbumID > 0)
    return true;
  return false;
}
), init : (function (b)
{
  if (b)
    {
      this._super(b);
      this.SongName = _.orEqual(b.SongName, b.Name);
      this.AlbumName = _.orEqual(b.AlbumName, "");
      this.searchText = [this.SongName, this.ArtistName, this.AlbumName].join(" ").toLowerCase();
      this.fanbase = GS.Models.Fanbase.wrap({objectID : this.SongID, objectType : "song"});
      delete this.Name;
    }
}
), toUrl : (function (b)
{
  if (this._token)
    return _.cleanUrl(this.SongName, this.SongID, "s", this._token, b);
  else
    if (this.tokenFailed)
      return _.generate404();
    else
      {
        this.getToken();
        return _.cleanUrl(this.SongName, this.SongID, "s", this._token, b);
      }
}
), getToken : (function ()
{
  if (this._token)
    return this._token;
  else
    if (this.tokenFailed)
      return null;
    else
      {
        GS.service.getTokenForSong(this.SongID, this.callback(this.checkToken), this.callback(this.checkToken), {async : false});
        return this._token;
      }
}
), setToken : (function (b)
{
  if (b !== this._token)
    this._token = b;
}
), checkToken : (function (b)
{
  if (b.Token)
    {
      this._token = b.Token;
      GS.Models.Song.cache[this._token] = this;
      GS.Models.Song.getOneFromCache(this.SongID)._token = this._token;
    }
  else
    this.tokenFailed = true;
}
), getImageURL : (function (b)
{
  var c = gsConfig.assetHost + "/webincludes/images/default/album_100.png";
  b || (b = "m");
  if (this.CoverArtFilename)
    c = this.artPath + b + this.CoverArtFilename;
  return c;
}
), getDetailsForFeeds : (function ()
{
  return {songID : this.SongID, songName : this.SongName, albumID : this.AlbumID, albumName : this.AlbumName, artistID : this.ArtistID, artistName : this.ArtistName, artFilename : this.ArtFilename, track : this.TrackNum};
}
), getRelatedSongs : (function (b,c,d)
{
  d = _.orEqual(d, true);
  this.album ? this.album.getSongs(b, c, d) : GS.Models.Album.getAlbum(this.AlbumID, this.callback((function (f)
{
  this.album = f;
  f.getSongs(b, c, d);
}
)), c, false);
}
), getAffiliateDownloadURLs : (function (b)
{
  var c;
  if (_.isEmpty(this.affiliateDownloadURLs))
    c = this;
  else
    return this.affiliateDownloadURLs;
  var d = [];
  GS.service.getAffiliateDownloadURLs(this.SongName, this.ArtistName, (function (f)
{
  a.each(f, (function (g,h)
{
  if (g === "amazon")
    g = "Amazon";
  d.push({name : g, url : h.url});
}
));
  c.affiliateDownloadURLs = d;
  b(c.affiliateDownloadURLs);
}
), (function (f)
{
  console.log("models.song.getaffiliatedownloadurls failed", f);
  b({});
}
));
}
), getOptionMenu : (function (b)
{
  b = _.orEqual(b, {});
  var c = [];
  GS.user.UserID > 0 && c.push({title : a.localize.getString("SHARE_EMAIL"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "email", type : "song", id : this.SongID});
}
))}});
  c = c.concat([{title : a.localize.getString("SHARE_FACEBOOK"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "facebook", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("SHARE_TWITTER"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "twitter", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("SHARE_STUMBLE"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "stumbleupon", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("SHARE_WIDGET"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "widget", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("COPY_URL"), type : "sub", action : {type : "fn", callback : this.callback((function ()
{
  ZeroClipboard && GS.Models.Song.getSong(this.SongID, (function (g)
{
  if (g)
    {
      var h = ["http://listen.grooveshark.com/" + g.toUrl().replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(g.AlbumName, g.AlbumID, "album").replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(g.ArtistName, g.ArtistID, "artist").replace("#/", "")];
      g = a("div[id^=jjmenu_main_sub]");
      if (window.contextMenuClipboards)
        {
          window.contextMenuClipboards[0].reposition((a("div.songUrl", g))[0]);
          window.contextMenuClipboards[1].reposition((a("div.albumUrl", g))[0]);
          window.contextMenuClipboards[2].reposition((a("div.artistUrl", g))[0]);
        }
      else
        window.contextMenuClipboards = [new ZeroClipboard.Client((a("div.songUrl", g))[0]), new ZeroClipboard.Client((a("div.albumUrl", g))[0]), new ZeroClipboard.Client((a("div.artistUrl", g))[0])];
      a.each(window.contextMenuClipboards, (function (o,p)
{
  p.setText(h[o]);
  if (! p.hasCompleteEvent)
    {
      p.addEventListener("complete", (function (q,t)
{
  a("div[id^=jjmenu]").remove();
  console.log("Copied: ", t);
}
));
      p.hasCompleteEvent = true;
    }
}
));
      a("div.songUrl", g).bind("remove", (function ()
{
  try
    {
      a.each(window.contextMenuClipboards, (function (p,q)
{
  q.hide();
}
));
    }
  catch (o)
    {}
}
));
      a("div[name$=Url]", g).show();
    }
}
));
}
))}, customClass : "last copyUrl", src : [{title : a.localize.getString("SONG_URL"), customClass : "songUrl"}, {title : a.localize.getString("ALBUM_URL"), customClass : "albumUrl"}, {title : a.localize.getString("ARTIST_URL"), customClass : " artistUrl"}]}]);
  c = [{title : a.localize.getString("CONTEXT_ADD_TO"), type : "sub", src : [{title : a.localize.getString("CONTEXT_ADD_TO_PLAYLIST_MORE"), type : "sub", src : GS.Models.Playlist.getPlaylistsMenu(this.SongID, this.callback((function (g)
{
  g.addSongs([this.SongID], null, true);
}
)))}, {title : a.localize.getString("MY_MUSIC"), action : {type : "fn", callback : this.callback((function ()
{
  GS.user.addToLibrary(this.SongID);
}
))}}, {title : a.localize.getString("FAVORITES"), action : {type : "fn", callback : this.callback((function ()
{
  GS.user.addToSongFavorites(this.SongID);
}
))}}], customClass : "first"}, {title : a.localize.getString("CONTEXT_SHARE_SONG"), type : "sub", src : [{title : a.localize.getString("SHARE_EMAIL"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "email", type : "song", id : this.SongID});
}
))}, customClass : "first"}, {title : a.localize.getString("SHARE_FACEBOOK"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "facebook", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("SHARE_TWITTER"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "twitter", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("SHARE_STUMBLE"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "stumbleupon", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("SHARE_WIDGET"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "widget", type : "song", id : this.SongID});
}
))}}, {title : a.localize.getString("COPY_URL"), type : "sub", action : {type : "fn", callback : this.callback((function ()
{
  ZeroClipboard && GS.Models.Song.getSong(this.SongID, (function (g)
{
  if (g)
    {
      var h = ["http://listen.grooveshark.com/" + g.toUrl().replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(g.AlbumName, g.AlbumID, "album").replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(g.ArtistName, g.ArtistID, "artist").replace("#/", "")];
      g = a("div[id^=jjmenu_main_sub]");
      if (window.contextMenuClipboards)
        {
          window.contextMenuClipboards[0].reposition((a("div.songUrl", g))[0]);
          window.contextMenuClipboards[1].reposition((a("div.albumUrl", g))[0]);
          window.contextMenuClipboards[2].reposition((a("div.artistUrl", g))[0]);
        }
      else
        window.contextMenuClipboards = [new ZeroClipboard.Client((a("div.songUrl", g))[0]), new ZeroClipboard.Client((a("div.albumUrl", g))[0]), new ZeroClipboard.Client((a("div.artistUrl", g))[0])];
      a.each(window.contextMenuClipboards, (function (o,p)
{
  p.setText(h[o]);
  if (! p.hasCompleteEvent)
    {
      p.addEventListener("complete", (function (q,t)
{
  a("div[id^=jjmenu]").remove();
  console.log("Copied: ", t);
}
));
      p.hasCompleteEvent = true;
    }
}
));
      a("div.songUrl", g).bind("remove", (function ()
{
  try
    {
      a.each(window.contextMenuClipboards, (function (p,q)
{
  q.hide();
}
));
    }
  catch (o)
    {}
}
));
      a("div[name$=Url]", g).show();
    }
}
));
}
))}, customClass : "last copyUrl", src : [{title : a.localize.getString("SONG_URL"), customClass : "songUrl"}, {title : a.localize.getString("ALBUM_URL"), customClass : "albumUrl"}, {title : a.localize.getString("ARTIST_URL"), customClass : " artistUrl"}]}]}, {title : a.localize.getString("CONTEXT_BUY_SONG"), action : {type : "fn", callback : this.callback((function ()
{
  console.log("CLICKED BUY");
  GS.lightbox.open("buySong", this.SongID);
}
))}}];
  var d = 0;
  if (! GS.user.isLoggedIn)
    for (var f = 0;f < c.length;f++)
      if (c[f].title == a.localize.getString("CONTEXT_SHARE_SONG") && c[f].src)
        {
          for (;c[f].src[d];)
            if (! GS.user.isLoggedIn && c[f].src[d].title == a.localize.getString("SHARE_EMAIL"))
              {
                c[f].src.splice(d, 1);
                d = Math.min(c[f].src.length, Math.max(0, d--));
              }
            else
              d++;
          d = 0;
        }
  b.isQueue = _.orEqual(b.isQueue, false);
  b.isQueue && c.push({title : a.localize.getString("CONTEXT_FLAG_SONG"), type : "sub", src : [{title : a.localize.getString("CONTEXT_FLAG_BAD_SONG"), action : {type : "fn", callback : (function ()
{
  b.flagSongCallback(1);
}
)}}, {title : a.localize.getString("CONTEXT_FLAG_BAD_METADATA"), action : {type : "fn", callback : (function ()
{
  b.flagSongCallback(4);
}
)}}]});
  return c;
}
), getTitle : (function ()
{
  return ["\"", this.SongName, "\" by ", this.ArtistName, " on \"", this.AlbumName, "\""].join("");
}
), toString : (function (b)
{
  return (b = _.orEqual(b, false)) ? ["Song. sid:", this.SongID, ", name:", this.SongName, ", aid:", this.ArtistID, ", arname: ", this.ArtistName, ", alid: ", this.AlbumID, ", alname:", this.AlbumName, ", track: ", this.TrackNum, ", verified: ", this.isVerified].join("") : _.getString("SELECTION_SONG_SINGLE", {SongName : _.cleanText(this.SongName), ArtistName : _.cleanText(this.ArtistName)});
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Album", {id : "AlbumID", cache : {}, getAlbum : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b);
  f = _.orEqual(f, true);
  if (g)
    c(g);
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getAlbumByID(b, this.callback(["wrap", c]), d);
    }
}
), getFilterAll : (function ()
{
  return this.wrap({AlbumID : - 1, AlbumName : a.localize.getString("ALL_ALBUMS"), ArtistName : "", ArtistID : - 1, isVerified : 2, isFilterAll : 1}, false);
}
)}, {AlbumName : "", AlbumID : null, ArtistName : "", ArtistID : null, CoverArtFilename : "", Year : "", IsVerified : 0, isFavorite : 0, songsLoaded : false, songsUnverifiedLoaded : false, songIDs : [], fanbase : null, smallAlbum : 5, artPath : "http://beta.grooveshark.com/static/amazonart/", getSongs : (function (b,c,d)
{
  var f = arguments[(arguments.length - 1)] === d ? {} : arguments[(arguments.length - 1)];
  d = _.orEqual(d, true);
  if (this.songsLoaded)
    {
      var g, h = GS.Models.Song.getManyFromCache(this.songIDs);
      for (g = 0;g < h.length;g++)
        {
          h[g].AlbumName = this.AlbumName;
          h[g].AlbumID = this.AlbumID;
        }
      b(h);
      if (! d && ! this.songsUnverifiedLoaded)
        {
          this.songsUnverifiedLoaded = true;
          GS.service.albumGetSongs(this.AlbumID, false, 0, this.callback(["wrapManySongs", "resetAlbumInfo", b]), c, f);
        }
    }
  else
    {
      this.songsLoaded = true;
      d ? GS.service.albumGetSongs(this.AlbumID, true, 0, this.callback(["wrapManyVerifiedSongs", "resetAlbumInfo", b]), c, f) : GS.service.albumGetSongs(this.AlbumID, false, 0, this.callback(["wrapManySongs", "resetAlbumInfo", b]), c, f);
    }
}
), play : (function (b,c)
{
  console.log("album.getsongs.play");
  this.getSongs(this.callback("playSongs", {index : b, playOnAdd : c, sort : "TrackNum"}));
}
), resetAlbumInfo : (function (b)
{
  for (i = 0;i < b.length;i++)
    {
      b[i].AlbumName = this.AlbumName;
      b[i].AlbumID = this.AlbumID;
    }
  return b;
}
), validate : (function ()
{
  if (this.AlbumID > 0 && this.ArtistID > 0)
    return true;
  return false;
}
), init : (function (b)
{
  this._super(b);
  this.AlbumName = _.orEqual(b.AlbumName, b.Name || "");
  this.fanbase = GS.Models.Fanbase.wrap({objectID : this.AlbumID, objectType : "album"});
  this.songIDs = [];
  this.songsUnverifiedLoaded = this.songsLoaded = false;
  this.searchText = [this.AlbumName, this.ArtistName].join(" ").toLowerCase();
}
), getDetailsForFeeds : (function ()
{
  return {albumID : this.AlbumID, albumName : this.AlbumName, artistID : this.ArtistID, artistName : this.ArtistName, artFilename : this.ArtFilename};
}
), toUrl : (function (b)
{
  return _.cleanUrl(this.AlbumName, this.AlbumID, "album", null, b);
}
), toArtistUrl : (function (b)
{
  return _.cleanUrl(this.ArtistName, this.ArtistID, "artist", null, b);
}
), getImageURL : (function (b)
{
  var c = gsConfig.assetHost + "/webincludes/images/default/album_250.png";
  b || (b = "l");
  if (this.CoverArtFilename)
    c = this.artPath + b + this.CoverArtFilename;
  return c;
}
), getTitle : (function ()
{
  return ["\"", this.AlbumName, "\" by ", this.ArtistName].join("");
}
), toString : (function (b)
{
  return (b = _.orEqual(b, false)) ? ["Album. alid: ", this.AlbumID, ", alname:", this.AlbumName, ", aid:", this.ArtistID, ", arname: ", this.ArtistName, ", verified: ", this.isVerified].join("") : _.getString("SELECTION_ALBUM_SINGLE", {AlbumName : _.cleanText(this.AlbumName), ArtistName : _.cleanText(this.ArtistName)});
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Artist", {id : "ArtistID", cache : {}, getArtist : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b);
  f = _.orEqual(f, true);
  if (g)
    c(g);
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getArtistByID(b, this.callback(["wrap", c]), d);
    }
}
), getFilterAll : (function ()
{
  return this.wrap({ArtistID : - 1, ArtistName : a.localize.getString("ALL_ARTISTS"), isVerified : 2, isFilterAll : 1}, false);
}
)}, {ArtistName : "", ArtistID : null, CoverArtFilename : "", isFavorite : 0, songsLoaded : false, songsUnverifiedLoaded : false, songIDs : [], eventsLoaded : false, eventIDs : [], fanbase : null, smallCollection : 10, getSongs : (function (b,c,d)
{
  var f = arguments[(arguments.length - 1)] === d ? {} : arguments[(arguments.length - 1)];
  d = _.orEqual(d, true);
  if (this.songsLoaded)
    {
      var g = GS.Models.Song.getManyFromCache(this.songIDs);
      b(g);
      if (! d && ! this.songsUnverfiedLoaded)
        {
          this.songsUnverifiedLoaded = true;
          GS.service.artistGetSongs(this.ArtistID, false, 0, this.callback(["wrapManySongs", b]), c, f);
        }
    }
  else
    {
      this.songsLoaded = true;
      GS.service.artistGetSongs(this.ArtistID, true, 0, this.callback(["wrapManyVerifiedSongs", b]), c, f);
    }
}
), getEvent : (function (b,c,d)
{
  var f = arguments[(arguments.length - 1)] === d ? {} : arguments[(arguments.length - 1)];
  d = _.orEqual(d, true);
  if (this.eventsLoaded)
    {
      f = GS.Models.Event.getManyFromCache(this.eventIDs);
      b(f);
    }
  else
    {
      d && a.publish("gs.page.loading.grid");
      GS.service.artistGetEvents(this.ArtistID, this.ArtistName, this.callback([GS.Models.Event.wrapMany, b]), c, f);
    }
}
), cacheAndReturnEvents : (function (b)
{
  for (var c = GS.Models.User.wrapMany(b.Users || b.Return.fans || b.Return), d = 0;d < c.length;d++)
    {
      var f = c[d];
      this.userIDs.push(f.UserID);
      GS.Models.User.cache[f.UserID] = f;
    }
  if (_.defined(b.hasMore) && b.hasMore)
    {
      console.log("service has more. current page is: ", this.currentPage);
      this.currentPage++;
    }
  else
    this.fansLoaded = true;
  return c;
}
), validate : (function ()
{
  if (this.ArtistID > 0)
    return true;
  return false;
}
), init : (function (b)
{
  this._super(b);
  this.ArtistName = _.orEqual(b.ArtistName, b.Name || "");
  this.fanbase = GS.Models.Fanbase.wrap({objectID : this.ArtistID, objectType : "artist"});
  this.songIDs = [];
  this.songsUnverifiedLoaded = this.songsLoaded = false;
  this.eventIDs = [];
  this.eventsLoaded = false;
  this.searchText = this.ArtistName.toLowerCase();
}
), getDetailsForFeeds : (function ()
{
  return {artistID : this.ArtistID, artistName : this.ArtistName};
}
), toUrl : (function (b)
{
  return _.cleanUrl(this.ArtistName, this.ArtistID, "artist", null, b);
}
), getImageURL : (function ()
{
  return gsConfig.assetHost + "/webincludes/images/default/artist_100.png";
}
), getTitle : (function ()
{
  return this.ArtistName;
}
), getContextMenu : (function ()
{
  return [{title : a.localize.getString("CONTEXT_PLAY_ARTIST"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [];
  a.each(b, (function (d,f)
{
  c.push(f.SongID);
}
));
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_DEFAULT, true);
}
), (function ()
{
  }
), false);
}
))}, customClass : "first"}, {title : a.localize.getString("CONTEXT_PLAY_ARTIST_NEXT"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [];
  a.each(b, (function (d,f)
{
  c.push(f.SongID);
}
));
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_NEXT);
}
), (function ()
{
  }
), false);
}
))}}, {title : a.localize.getString("CONTEXT_PLAY_ARTIST_LAST"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [];
  a.each(b, (function (d,f)
{
  c.push(f.SongID);
}
));
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_LAST);
}
), (function ()
{
  }
), false);
}
))}}, {customClass : "separator"}, {title : a.localize.getString("CONTEXT_REPLACE_ALL_SONGS"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [], d = GS.player.isPlaying;
  a.each(b, (function (f,g)
{
  c.push(g.SongID);
}
));
  GS.player.clearQueue();
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_LAST, d);
}
), (function ()
{
  }
), false);
}
))}}];
}
), toString : (function (b)
{
  return (b = _.orEqual(b, false)) ? ["Artist. aid:", this.ArtistID, ", arname: ", this.ArtistName].join("") : _.cleanText(this.ArtistName);
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Playlist", {id : "PlaylistID", cache : {}, defaults : {PlaylistID : 0, PlaylistName : "", UserID : 0, Username : "", Description : "", NumSongs : 0, CoverArtFilename : "", Sort : null, isFavorite : 0, songs : [], originalOrder : [], songsLoaded : false, hasUnsavedChanges : false, searchText : "", fanbase : null, gridKey : 1, gridKeyLookup : {}, songIDLookup : {}, isDeleted : false, artPath : "http://beta.grooveshark.com/static/amazonart/"}, playlistsLoaded : false, playlistIDs : [], getPlaylist : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b);
  f = _.orEqual(f, true);
  if (g)
    c(g);
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getPlaylistByID(b, this.callback(["wrap", c]), d, {async : false});
    }
}
), getPlaylistsOrdered : (function (b,c)
{
  c = _.orEqual(c, false);
  b = _.orEqual(b, "PlaylistName");
  var d = [];
  a.each(c === false ? GS.user.playlists : GS.user.favorites.playlists, (function (f,g)
{
  if (c)
    g.TSAdded = g.TSFavorited;
  d.push(g);
}
));
  d.sort((function (f,g)
{
  var h, o;
  try
    {
      h = f[b].toString().toLowerCase();
      o = g[b].toString().toLowerCase();
    }
  catch (p)
    {
      console.error("playlistOrdered error: " + p, b, f[b], g[b]);
      return 0;
    }
  return h == o ? 0 : h > o ? 1 : - 1;
}
));
  return d;
}
), getPlaylistsMenu : (function (b,c,d,f)
{
  b = a.makeArray(b);
  d = _.orEqual(d, false);
  f = _.orEqual(f, true);
  var g;
  g = [];
  if (f)
    {
      g.push({title : a.localize.getString("CONTEXT_NEW_PLAYLIST"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("newPlaylist", b);
}
)}, customClass : "first"});
      _.isEmpty(GS.user.playlists) || g.push({customClass : "separator"});
    }
  a.each(this.getPlaylistsOrdered("PlaylistName"), (function (h,o)
{
  g.push({title : o.PlaylistName, action : {type : "fn", callback : (function ()
{
  c(o);
  return true;
}
)}});
}
));
  d && a.each(this.getPlaylistsOrdered("PlaylistName", true), (function (h,o)
{
  g.push({title : o.PlaylistName, action : {type : "fn", callback : (function ()
{
  c(o);
}
)}});
}
));
  return g;
}
)}, {init : (function (b)
{
  this._super(b);
  this.PlaylistName = _.orEqual(b.PlaylistName, b.Name || "");
  this.Description = _.orEqual(b.Description, b.About || "");
  this.fanbase = GS.Models.Fanbase.wrap({objectID : this.PlaylistID, objectType : "playlist"});
  this.searchText = [this.PlaylistName, this.Username, this.Description].join(" ").toLowerCase();
  this.songs = [];
  this.originalOrder = [];
  this.hasUnsavedChanges = this.songsLoaded = false;
  delete this.Name;
  delete this.About;
}
), getSongs : (function (b,c,d)
{
  var f = arguments[(arguments.length - 1)] === d ? {} : arguments[(arguments.length - 1)];
  d = _.orEqual(d, true);
  if (this.songsLoaded)
    b(this.songs);
  else
    {
      d && a.publish("gs.page.loading.grid");
      GS.service.playlistGetSongs(this.PlaylistID, this.callback(["wrapManySongs", b]), c, f);
    }
}
), validate : (function ()
{
  if (this.PlaylistID > 0)
    return true;
  return false;
}
), wrapManySongs : (function (b)
{
  var c = [];
  if (this.hasUnsavedChanges)
    c = this.songs;
  var d = b.Songs || b.songs || b.result || b;
  this.songs = [];
  this.gridKeyLookup = {};
  this.songIDLookup = {};
  var f;
  d.sort((function (g,h)
{
  return parseFloat(g.Sort, 10) - parseFloat(h.Sort, 10);
}
));
  for (f = 0;f < d.length;f++)
    {
      b = GS.Models.Song.wrap(d[f]).dupe();
      b.Sort = f;
      b.GridKey = this.gridKey;
      this.songs.push(b);
      this.gridKeyLookup[b.GridKey] = b;
      this.songIDLookup[b.SongID] = b;
      this.gridKey++;
    }
  for (d = 0;d < c.length;d++)
    {
      b = c[d];
      b.Sort = d + f;
      b.GridKey = this.gridKey;
      c[d] = b;
      this.gridKeyLookup[b.GridKey] = b;
      this.songIDLookup[b.SongID] = b;
      this.gridKey++;
    }
  this.originalOrder = this.songs.concat();
  this.songs = this.songs.concat(c);
  this.songsLoaded = true;
  a.publish("gs.playlist.songs.update", this);
  a.publish("gs.playlist.view.update", this);
  this.songs._use_call = true;
  return this.songs;
}
), reapplySorts : (function ()
{
  for (var b = 0;b < this.songs.length;b++)
    this.songs[b].Sort = b;
}
), play : (function (b,c)
{
  console.log("playlist.getsongs.play");
  this.getSongs(this.callback("playSongs", {index : b, playOnAdd : c}));
}
), playSongs : (function (b)
{
  _.orEqual(b.index, - 1);
  _.orEqual(b.playOnAdd, false);
  var c, d = [];
  for (c = 0;c < this.songs.length;c++)
    d.push(this.songs[c].SongID);
  GS.player.addSongsToQueueAt(d, b.index, b.playOnAdd);
}
), getImageURL : (function ()
{
  return gsConfig.assetHost + "/webincludes/images/default/album_100.png";
}
), addSongs : (function (b,c,d)
{
  if (GS.user.UserID != this.UserID)
    return false;
  for (var f, g = [], h = 0;h < b.length;h++)
    if (! (b[h] <= 0))
      {
        f = GS.Models.Song.getOneFromCache(b[h]).dupe();
        f.GridKey = this.gridKey;
        this.gridKeyLookup[f.GridKey] = f;
        this.songIDLookup[f.SongID] = f;
        this.gridKey++;
        g.push(f);
        GS.guts.logEvent("songAddedToPlaylist", {songID : f.SongID});
      }
  c = _.orEqual(c, this.songs.length);
  d = _.orEqual(d, false);
  this.hasUnsavedChanges = true;
  GS.Controllers.PageController.ALLOW_LOAD = false;
  this.songs.splice.apply(this.songs, [c, 0].concat(g));
  this.reapplySorts();
  d && this.save();
  a.publish("gs.playlist.view.update", this);
}
), removeSongs : (function (b,c)
{
  if (GS.user.UserID != this.UserID)
    return false;
  c = _.orEqual(c, false);
  this.hasUnsavedChanges = true;
  GS.Controllers.PageController.ALLOW_LOAD = false;
  for (var d, f = 0;f < b.length;f++)
    if (d = this.songs[b[f]])
      d.isDeleted = true;
  this.reapplySorts();
  c && this.save();
  a.publish("gs.playlist.view.update", this);
}
), moveSongsTo : (function (b,c,d)
{
  if (GS.user.UserID != this.UserID)
    return false;
  d = _.orEqual(d, false);
  this.hasUnsavedChanges = true;
  GS.Controllers.PageController.ALLOW_LOAD = false;
  var f, g, h;
  for (g = 0;g < b.length;g++)
    {
      f = b[g];
      h = this.songs[f];
      if (c < f)
        {
          this.songs.splice(c, 0, h);
          this.songs.splice(f + 1, 1);
          c++;
        }
      else
        if (c > f)
          {
            this.songs.splice(c, 0, h);
            this.songs.splice(f, 1);
          }
    }
  this.reapplySorts();
  d && this.save();
  a.publish("gs.playlist.view.update", this);
}
), save : (function ()
{
  console.log("PLAYLIST save, loaded?", this.songsLoaded);
  if (this.songsLoaded)
    {
      var b, c = [], d = [];
      for (b = 0;b < this.songs.length;b++)
        this.songs[b].isDeleted ? GS.guts.logEvent("songRemovedFromPlaylist", {songID : this.songs[b].SongID}) : c.push(this.songs[b].SongID);
      for (b = 0;b < this.originalOrder.length;b++)
        d.push(this.originalOrder[b].SongID);
      if (c.join(".") == d.join("."))
        {
          this.originalOrder = this.songs.concat();
          this.hasUnsavedChanges = false;
          GS.Controllers.PageController.ALLOW_LOAD = true;
          a.publish("gs.playlist.view.update", this);
        }
      else
        GS.user.isLoggedIn ? GS.service.overwritePlaylist(this.PlaylistID, c, this.callback("saveSuccess"), this.callback("saveFailed")) : this.saveSuccess();
    }
  else
    this.getSongs(this.callback("save"), this.callback("saveFailed"), false);
}
), saveSuccess : (function ()
{
  for (var b = [], c = 0;c < this.songs.length;c++)
    this.songs[c].isDeleted || b.push(this.songs[c]);
  this.songsLoaded = true;
  this.songs = b;
  this.originalOrder = this.songs.concat();
  this.hasUnsavedChanges = false;
  GS.Controllers.PageController.ALLOW_LOAD = true;
  b = new GS.Models.DataString(a.localize.getString("POPUP_SAVE_PLAYLIST_MSG"), {playlist : this.PlaylistName}).render();
  a.publish("gs.notification", {type : "notice", message : b});
  a.publish("gs.playlist.songs.update", this);
  a.publish("gs.playlist.view.update", this);
}
), saveFailed : (function ()
{
  a.publish("gs.notification", {type : "error", message : a.localize.getString("POPUP_FAIL_SAVE_PLAYLIST_MSG")});
}
), remove : (function (b)
{
  GS.user.deletePlaylist(this.PlaylistID, b);
  GS.guts.logEvent("playlistDeleted", {playlistID : this.PlaylistID});
}
), restore : (function (b)
{
  GS.user.restorePlaylist(this.PlaylistID, b);
}
), undo : (function ()
{
  this.songs = this.originalOrder.concat();
  for (var b = 0;b < this.songs.length;b++)
    this.songs[b].isDeleted = false;
  this.hasUnsavedChanges = false;
  GS.Controllers.PageController.ALLOW_LOAD = true;
  this.reapplySorts();
  a.publish("gs.playlist.songs.update", this);
  a.publish("gs.playlist.view.update", this);
}
), rename : (function (b,c,d)
{
  GS.service.renamePlaylist(this.PlaylistID, b, this.callback([this._renameSuccess, c], b), this.callback([this._renameFailed, d]));
}
), _renameSuccess : (function (b,c)
{
  console.log("playlist.rename.success", c);
  this.PlaylistName = b;
  a.publish("gs.playlist.view.update", this);
  a.publish("gs.auth.playlists.update", this);
  return c;
}
), _renameFailed : (function (b)
{
  console.log("playlist.rename.failed", b);
  return b;
}
), changeDescription : (function (b,c,d)
{
  GS.service.setPlaylistAbout(this.PlaylistID, b, this.callback([this._changeDescSuccess, c], b), this.callback([this._changeDescFailed, d]));
}
), _changeDescSuccess : (function (b,c)
{
  console.log("playlist.changeDescription.success", c);
  this.Description = b;
  a.publish("gs.playlist.view.update", this);
  return c;
}
), _changeDescFailed : (function (b)
{
  console.log("playlist.changeDescription.failed", b);
  return b;
}
), getDetailsForFeeds : (function ()
{
  return {playlistID : this.PlaylistID, playlistName : this.PlaylistName, userID : this.UserID, username : this.Username, description : this.Description};
}
), getTitle : (function ()
{
  return ["\"", this.PlaylistName, "\" by ", this.Username].join("");
}
), isSubscribed : (function ()
{
  return GS.user.UserID != this.UserID && this.isFavorite || ! _.isEmpty(GS.user.favorites.playlists[this.PlaylistID]);
}
), subscribe : (function ()
{
  GS.user.addToPlaylistFavorites(this.PlaylistID);
}
), unsubscribe : (function ()
{
  GS.user.removeFromPlaylistFavorites(this.PlaylistID);
}
), isShortcut : (function ()
{
  return a.inArray(this.PlaylistID.toString(), GS.user.sidebar.playlists) > - 1 || a.inArray(this.PlaylistID.toString(), GS.user.sidebar.subscribedPlaylists) > - 1;
}
), addShortcut : (function (b)
{
  GS.user.addToShortcuts("playlist", this.PlaylistID, b);
}
), removeShortcut : (function (b)
{
  GS.user.removeFromShortcuts("playlist", this.PlaylistID, b);
}
), getContextMenu : (function ()
{
  return [{title : a.localize.getString("CONTEXT_PLAY_PLAYLIST"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [];
  a.each(b, (function (d,f)
{
  c.push(f.SongID);
}
));
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_DEFAULT, true);
}
), (function ()
{
  }
), false);
}
))}, customClass : "first"}, {title : a.localize.getString("CONTEXT_PLAY_PLAYLIST_NEXT"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [];
  a.each(b, (function (d,f)
{
  c.push(f.SongID);
}
));
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_NEXT);
}
), (function ()
{
  }
), false);
}
))}}, {title : a.localize.getString("CONTEXT_PLAY_PLAYLIST_LAST"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [];
  a.each(b, (function (d,f)
{
  c.push(f.SongID);
}
));
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_LAST);
}
), (function ()
{
  }
), false);
}
))}}, {customClass : "separator"}, {title : a.localize.getString("SHARE_PLAYLIST"), type : "sub", src : [{title : a.localize.getString("SHARE_EMAIL"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "email", type : "playlist", id : this.PlaylistID});
}
))}, customClass : "first"}, {title : a.localize.getString("SHARE_FACEBOOK"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "facebook", type : "playlist", id : this.PlaylistID});
}
))}}, {title : a.localize.getString("SHARE_TWITTER"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "twitter", type : "playlist", id : this.PlaylistID});
}
))}}, {title : a.localize.getString("SHARE_STUMBLEUPON"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("share", {service : "stumbleupon", type : "playlist", id : this.PlaylistID});
}
))}}, {title : a.localize.getString("SHARE_WIDGET"), action : {type : "fn", callback : this.callback((function ()
{
  window.contextClipboard || GS.lightbox.open("share", {service : "widget", type : "playlist", id : this.PlaylistID});
}
))}}]}, {title : a.localize.getString("CONTEXT_REPLACE_ALL_SONGS"), action : {type : "fn", callback : this.callback((function ()
{
  this.getSongs((function (b)
{
  var c = [], d = GS.player.isPlaying, f = new GS.Models.PlayContext(GS.player.PLAY_CONTEXT_PLAYLIST, this);
  a.each(b, (function (g,h)
{
  c.push(h.SongID);
}
));
  GS.player.clearQueue();
  GS.player.addSongsToQueueAt(c, GS.player.INDEX_LAST, d, f);
}
), (function ()
{
  }
), false);
}
))}, customClass : "last"}];
}
), toUrl : (function (b)
{
  return _.cleanUrl(this.PlaylistName, this.PlaylistID, "playlist", null, b);
}
), toUserUrl : (function (b)
{
  return _.cleanUrl(this.Username, this.UserID, "user", null, b);
}
), toString : (function (b)
{
  return (b = _.orEqual(b, false)) ? ["Playlist. pid: ", this.PlaylistID, ", pname:", this.PlaylistName, ", uid:", this.UserID, ", uname: ", this.Username].join("") : _.getString("SELECTION_PLAYLIST_SINGLE", {PlaylistName : _.cleanText(this.PlaylistName), Username : _.cleanText(this.Username)});
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Popular", {cache : {}, getType : (function (b)
{
  var c = this.getOneFromCache(b);
  if (! c)
    {
      c = this.wrap({type : b});
      this.cache[b] = c;
    }
  return c;
}
)}, {type : null, songsLoaded : false, songIDs : [], init : (function (b)
{
  this._super(b);
  this.songIDs = [];
  this.songsLoaded = false;
}
), getSongs : (function (b,c,d)
{
  d = _.orEqual(d, true);
  if (this.songsLoaded)
    {
      c = GS.Models.Song.getManyFromCache(this.songIDs);
      b(c);
    }
  else
    {
      d && a.publish("gs.page.loading.grid");
      GS.service.popularGetSongs(this.type, this.callback(["wrapManySongs", b]), c);
    }
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.User", {id : "UserID", cache : {}, usersLoaded : false, userIDs : [], getUser : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b);
  f = _.orEqual(f, true);
  if (g)
    c(g);
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getUserByID(b, this.callback(["wrapProxy", c]), d);
    }
}
), getUserByUsername : (function (b,c,d,f)
{
  var g = this.getOneFromCache(b);
  f = _.orEqual(f, true);
  if (g)
    {
      console.log("get user from cache");
      c(g);
    }
  else
    {
      f && a.publish("gs.page.loading.page");
      GS.service.getUserByUsername(b, this.callback(["wrapProxy", c]), d);
    }
}
), wrapProxy : (function (b)
{
  return this.wrap(b.User || b);
}
), FLAG_PLUS : 1, FLAG_LASTFM : 2, FLAG_FACEBOOK : 4, FLAG_FACEBOOKUSER : 16, FLAG_GOOGLEUSER : 32, FLAG_GOOGLE : 64, FLAG_ANYWHERE : 128, FLAG_ISARTIST : 256}, {UserID : 0, Username : "", Name : "", FName : "", LName : "", Picture : "", IsPremium : 0, SignupDate : null, Location : "", Sex : "", FollowingFlags : 0, Flags : 0, isFavorite : 0, artPath : "http://beta.grooveshark.com/static/userimages/", library : null, favorites : {songs : {}, albums : {}, artists : {}, playlists : {}, users : {}}, fanbase : null, playlists : {}, profileFeed : {}, communityFeed : {}, validate : (function ()
{
  if (this.UserID > 0 && this.Username.length > 0)
    return true;
  return false;
}
), init : (function (b)
{
  this._super(b);
  b = _.orEqual(this.City, "");
  b += this.State && b.length ? ", " + this.State : _.orEqual(this.State, "");
  b += this.Country && b.length ? ", " + this.Country : _.orEqual(this.Country, "");
  this.Name = _.orEqual(this.Name, (this.FName || "") + " " + (this.LName || ""));
  this.Location = b;
  this.IsPremium = this.IsPremium == 1 ? 1 : 0;
  this.library = GS.Models.Library.wrap({userID : this.UserID});
  this.fanbase = GS.Models.Fanbase.wrap({objectID : this.UserID, objectType : "user"});
  this.profileFeed = GS.Models.Feed.wrap({user : this});
  this.communityFeed = GS.Models.Feed.wrap({user : this});
  this.recentActiveUsersFeed = GS.Models.Feed.wrap({user : this});
  this.searchText = [this.Username, this.Locale, this.FName, this.LName].join(" ").toLowerCase();
  this.playlists = {};
  this.favorites = {songs : {}, albums : {}, artists : {}, playlists : {}, users : {}};
}
), autocompleteFavoriteUsers : (function ()
{
  var b = [];
  a.each(this.favorites.users, (function (c,d)
{
  a.each(d.searchText.trim().split(), (function (f,g)
{
  b.push([g.trim(), d.UserID]);
}
));
}
));
  return b;
}
), getFavoritesByType : (function (b,c,d)
{
  var f = arguments[(arguments.length - 1)] === d ? {} : arguments[(arguments.length - 1)];
  GS.service.getFavorites(this.UserID, b, this.callback(["load" + b + "Favorites", c]), d, f);
}
), loadAlbumsFavorites : (function (b)
{
  var c;
  for (d in b)
    if (b.hasOwnProperty(d))
      {
        c = b[d];
        if (this.isAuth)
          {
            c = GS.Models.Album.wrap(c, false);
            c.isFavorite = 1;
          }
        else
          c = GS.Models.Album.wrap(c);
        this.favorites.albums[c.AlbumID] = c;
      }
  return this.favorites.albums;
}
), loadArtistsFavorites : (function (b)
{
  var c;
  for (d in b)
    if (b.hasOwnProperty(d))
      {
        c = b[d];
        if (this.isAuth)
          {
            c = GS.Models.Artist.wrap(c, false);
            c.isFavorite = 1;
          }
        else
          c = GS.Models.Artist.wrap(c);
        this.favorites.artists[c.ArtistID] = c;
      }
  return this.favorites.artists;
}
), loadPlaylistsFavorites : (function (b)
{
  var c;
  for (d in b)
    if (b.hasOwnProperty(d))
      {
        c = b[d];
        if (this.isAuth)
          {
            c = GS.Models.Playlist.wrap(c, false);
            c.isFavorite = 1;
          }
        else
          c = GS.Models.Playlist.wrap(c);
        this.favorites.playlists[c.PlaylistID] = c;
      }
  return this.favorites.playlists;
}
), loadSongsFavorites : (function (b)
{
  var c, d;
  for (f in b)
    if (b.hasOwnProperty(f))
      {
        c = b[f];
        if (this.isAuth)
          {
            d = GS.Models.Song.wrap(c, false);
            d.isFavorite = 1;
            d.fromLibrary = 1;
            d.TSAdded = c.TSAdded = c.TSFavorited;
            this.library.songs[d.SongID] = d;
          }
        else
          {
            d = GS.Models.Song.wrap(c);
            d.TSAdded = c.TSAdded = c.TSFavorited;
          }
        this.favorites.songs[d.SongID] = d;
      }
  return this.favorites.songs;
}
), loadUsersFavorites : (function (b)
{
  var c, d;
  for (f in b)
    if (b.hasOwnProperty(f))
      {
        c = b[f];
        if (this.isAuth)
          {
            d = GS.Models.User.wrap(c, false);
            d.isFavorite = 1;
            d.FollowingFlags = parseInt(c.FollowingFlags, 10);
          }
        else
          d = GS.Models.User.wrap(c);
        this.favorites.users[d.UserID] = d;
      }
  return this.favorites.users;
}
), getPlaylists : (function (b,c)
{
  _.isEmpty(this.playlists) ? GS.service.userGetPlaylists(this.UserID, this.callback(["cachePlaylists", b]), c) : b();
}
), cachePlaylists : (function (b)
{
  b = b.Playlists;
  var c;
  for (d in b)
    if (b.hasOwnProperty(d))
      {
        b[d].Username = this.Username;
        b[d].UserID = this.UserID;
        c = GS.Models.Playlist.wrap(b[d]);
        this.playlists[c.PlaylistID] = c;
      }
}
), getProfileFeed : (function (b,c)
{
  this.profileFeed.getProfileFeed(this.callback(b), c);
}
), getCommunityFeed : (function (b,c)
{
  var d;
  d = this.isAuth ? this.filterOutFriends(1) : this.favorites.users;
  d = _.toArrayID(d);
  d.length ? this.communityFeed.getCommunityFeed(d, this.callback(b), c) : this.communityFeed.getRecentlyActiveUsersFeed(this.callback(b), c);
}
), filterFriends : (function (b)
{
  var c = {};
  for (d in this.favorites.users)
    if (this.favorites.users[d].FollowingFlags & b)
      c[d] = this.favorites.users[d];
  return c;
}
), filterOutFriends : (function (b)
{
  var c = {};
  for (d in this.favorites.users)
    this.favorites.users[d].FollowingFlags & b || (c[d] = this.favorites.users[d]);
  return c;
}
), getRecentlyActiveUsersFeed : (function (b,c)
{
  this.recentActiveUsersFeed.getRecentlyActiveUsersFeed(this.callback(b), c);
}
), getUserPackage : (function ()
{
  var b = "";
  if (this.Flags & GS.Models.User.FLAG_ANYWHERE)
    b = "anywhere";
  else
    if (this.Flags & GS.Models.User.FLAG_PLUS)
      b = "plus";
  return b;
}
), toUrl : (function (b)
{
  return _.cleanUrl(this.Username, this.UserID, "user", null, b);
}
), getImageURL : (function (b)
{
  var c = gsConfig.assetHost + "/webincludes/images/default/user_100.png";
  b || (b = "m");
  if (this.Picture)
    c = this.artPath + b + this.Picture;
  else
    if (b === "l")
      c = gsConfig.assetHost + "/webincludes/images/default/user_250.png";
  return c;
}
), getDetailsForFeeds : (function ()
{
  return {userID : this.UserID, username : this.Username, isPremium : this.IsPremium, location : this.location, imageURL : this.getImageURL()};
}
), getTitle : (function ()
{
  return this.Username;
}
), toString : (function (b)
{
  return (b = _.orEqual(b, false)) ? ["User. uid: ", this.UserID, ", uname:", this.Username, this.FName, this.LName].join("") : _.cleanText(this.Username);
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Library", {}, {currentPage : 0, userID : null, lastModified : 0, songIDs : [], songsLoaded : false, init : (function (b)
{
  this._super(b);
  this.songIDs = [];
  this.songsLoaded = false;
}
), getSongs : (function (b,c,d)
{
  d = _.orEqual(d, true);
  if (this.songsLoaded)
    {
      c = GS.Models.Song.getManyFromCache(this.songIDs);
      b(c);
    }
  else
    {
      d && this.currentPage === 0 && a.publish("gs.page.loading.grid");
      GS.service.userGetSongsInLibrary(this.userID, this.currentPage, this.callback(["saveLastModified", "wrapManySongs", b]), c);
    }
}
), removeSongs : (function (b)
{
  if (GS.user.UserID != this.userID)
    return false;
  for (var c, d, f = b.length;f > 0;f--)
    {
      d = this.songIDs.splice(b[f], 1);
      c = GS.Models.Song.getOneFromCache(d);
      GS.user.removeFromLibrary(d);
      c.isFavorite && GS.user.removeFromSongFavorites(d);
    }
}
), saveLastModified : (function (b)
{
  this.lastModified = b.TSModified;
  return b;
}
), refreshLibrary : (function (b)
{
  if (b.TSModified > this.lastModified)
    {
      console.log("library is stale");
      this.currentPage = 0;
      this.songsLoaded = false;
      this.getSongs(this.callback("loadLibrary"), false, false);
    }
  else
    console.log("library is the freshens");
}
)});
}
)(jQuery);
  (function (a)
{
  a.Model.extend("GS.Models.PlayContext", {}, {type : null, data : null, init : (function (b,c)
{
  this.type = _.orEqual(b, "unknown");
  this.data = _.orEqual(c, {});
}
)});
}
)(jQuery);
  (function (a)
{
  a.fn.dataString = (function ()
{
  if (arguments.length === 0)
    return _.orEqual(this.data("DataString"), null);
  var b = new GS.Models.DataString(arguments[0], arguments[1]);
  b.hookup(this);
  return b;
}
);
  a.fn.localeDataString = (function (b,c,d)
{
  b = _.orEqual(b, "");
  c = _.orEqual(c, {});
  d = _.orEqual(d, false);
  c = new GS.Models.DataString(a.localize.getString(b), c);
  c.hookup(this);
  d ? a(this).attr("data-translate-title", b).attr("title", c.render()) : a(this).attr("data-translate-text", b).html(c.render());
  return c;
}
);
  a.Model.extend("GS.Models.DataString", {}, {string : null, data : null, element : null, init : (function (b,c)
{
  this.string = _.orEqual(b, "");
  this.data = _.orEqual(c, {});
}
), setString : (function (b)
{
  this.string = b;
  this.render();
}
), setData : (function (b,c)
{
  this.data[b] = c;
  this.render();
}
), hookup : (function (b)
{
  this.element = a(b);
  this.element.data("DataString", this);
}
), render : (function ()
{
  for (var b = this.string, c = [], d;b;)
    {
      if (d = /^[^\{]+/.exec(b))
        c.push(d[0]);
      else
        if (d = /^\{(.*?)\}/.exec(b))
          {
            var f = d[1];
            this.data[f] ? c.push(this.data[f]) : c.push(d[0]);
          }
        else
          throw "Error rendering data object";
      b = b.substring(d[0].length);
    }
  b = c.join("");
  if (this.element)
    this.element.attr("tagName") == "INPUT" ? this.element.val(b) : this.element.html(b);
  return b;
}
)});
}
)(jQuery);
  (function (a)
{
  var b = [];
  GS.Models.User.extend("GS.Models.AuthUser", {id : "AuthUserID", cache : {}, loggedOutPlaylistCount : 0, wrap : (function (c)
{
  return this._super(c, false);
}
), wrapFromService : (function (c)
{
  return this.wrap(a.extend({}, c, {Email : c.Email || c.email, Sex : c.Sex || c.sex, UserID : c.UserID || c.userID, Username : c.Username || c.username, IsPremium : c.IsPremium || c.isPremium, FName : c.FName || c.fName, LName : c.LName || c.lName, TSDOB : c.TSDOB || c.tsDOB}));
}
)}, {authRealm : 1, authToken : "", autoAutoplay : false, badAuthToken : false, favoritesLimit : 500, librarySizeLimit : 5000, themeID : "", uploadsEnabled : 0, UserID : - 1, Username : "New User", Email : "", City : "", Country : "", State : "", TSDOB : "", privacy : 0, Flags : 0, settings : null, isLoggedIn : false, isAuth : true, artistsPlayed : [], stations : {13 : "ALTERNATIVE", 75 : "AMBIENT", 96 : "BLUEGRASS", 230 : "BLUES", 750 : "CLASSICAL", 3529 : "CLASSIC_ROCK", 80 : "COUNTRY", 67 : "ELECTRONICA", 191 : "EXPERIMENTAL", 122 : "FOLK", 29 : "HIP_HOP", 136 : "INDIE", 43 : "JAZZ", 528 : "LATIN", 17 : "METAL", 102 : "OLDIES", 56 : "POP", 111 : "PUNK", 3 : "RAP", 160 : "REGGAE", 4 : "RNB", 12 : "ROCK", 69 : "TRANCE"}, defaultStations : ["750", "12", "136", "3", "56", "67"], init : (function (c)
{
  this._super(c);
  this.refreshLibraryStatic = this.callback(this.refreshLibrary);
  this.library.songs = {};
  this.playlists = {};
  this.favorites = {songs : {}, albums : {}, artists : {}, playlists : {}, users : {}};
  this.sidebarLoaded = false;
  this.sidebar = {playlists : [], stations : [], subscribedPlaylists : []};
  this.settings = GS.Models.UserSettings.wrap({UserID : this.UserID});
  this.lastSeenFeedEvent = (c = store.get("lastSeenFeedEvent" + this.UserID)) ? c : 0;
  this.unseenFeedEvents = this.unseenFeedEventTimeout = 0;
  if (this.UserID > 0)
    {
      this.isLoggedIn = true;
      this.getPlaylists();
      this.getFavorites();
      this.getSidebar();
      this.getLibrary();
    }
  else
    {
      this.isDirty = false;
      this.sidebarLoaded = true;
      this.sidebar.stations = this.defaultStations.concat();
    }
  this.artistsPlayed = store.get("artistsPlayed" + this.UserID) || [];
  a.subscribe("gs.player.nowplaying", this.callback(this.onSongPlay));
  setTimeout((function ()
{
  a.publish("gs.auth.stations.update");
}
), 10);
  this.checkVipExpiring();
  window.reportUploadComplete = window.uploadComplete = this.callback((function ()
{
  location.hash = "/upload/complete";
  this.library.lastModified = 0;
  this.getLibrary();
}
));
}
), onSongPlay : (function (c)
{
  if (c && c.artistID)
    {
      var d = this.artistsPlayed.indexOf(c.artistID);
      d != - 1 && this.artistsPlayed.splice(d, 1);
      this.artistsPlayed.unshift(c.artistID);
      this.artistsPlayed.splice(999, 1);
    }
}
), storeData : (function ()
{
  if (! _.isEmpty(this.library.songs))
    {
      var c = new Date(), d = {currentPage : this.library.currentPage, songsLoaded : this.library.songsLoaded, userID : this.library.userID, lastModified : this.library.lastModified, songs : {}};
      for (f in this.library.songs)
        if (this.library.songs.hasOwnProperty(f))
          d.songs[f] = GS.Models.Song.archive(this.library.songs[f]);
      try
        {
          this.settings.changeLocalSettings({});
          store.set("artistsPlayed" + this.UserID, this.artistsPlayed);
          store.set("lastSeenFeedEvent" + this.UserID, this.lastSeenFeedEvent);
          store.set("library" + this.UserID, d);
          console.log("stored data in: " + new Date() - c + " milliseconds");
        }
      catch (g)
        {
          console.error(g);
          a.publish("gs.auth.store.failure");
        }
    }
}
), clearData : (function ()
{
  store.remove("library" + this.UserID);
  store.remove("lastSeenFeedEvent" + this.UserID);
}
), createPlaylist : (function (c,d,f,g,h,o)
{
  o = _.orEqual(o, true);
  d = _.orEqual(d, []);
  if (this.isLoggedIn)
    GS.service.createPlaylist(c, d, f, this.callback(["createPlaylistSuccess"], {callback : g, name : c, songIDs : d, description : f, notify : o}), h);
  else
    {
      GS.Models.AuthUser.loggedOutPlaylistCount++;
      f = GS.Models.Playlist.wrap({PlaylistID : - GS.Models.AuthUser.loggedOutPlaylistCount, PlaylistName : c, Username : this.Username, UserID : this.UserID, songsLoaded : true, TSAdded : new Date().format("Y-m-d G:i:s"), Description : f});
      d = _.map(d, (function (p)
{
  return {SongID : p};
}
));
      f.wrapManySongs(d);
      this.playlists[f.PlaylistID] = f;
      this.isDirty = true;
      g(f);
    }
  GS.guts.logEvent("playlistCreated", {playlistName : c});
}
), createPlaylistSuccess : (function (c,d)
{
  var f = GS.Models.Playlist.wrap({PlaylistID : d, PlaylistName : c.name, Description : c.description, UserID : this.UserID, Username : this.Username, TSAdded : new Date().format("Y-m-d G:i:s"), NumSongs : c.songIDs.length});
  this.playlists[f.PlaylistID] = f;
  a.publish("gs.auth.playlists.update");
  c.notify && a.publish("gs.notification.playlist.create", f);
  c.callback(f);
}
), deletePlaylist : (function (c,d)
{
  var f = GS.Models.Playlist.getOneFromCache(c);
  if (f && f.UserID === this.UserID)
    {
      d = _.orEqual(d, true);
      if (this.isLoggedIn)
        GS.service.deletePlaylist(f.PlaylistID, f.PlaylistName, this.callback((function ()
{
  f.isDeleted = true;
  f.removeShortcut(false);
  delete this.playlists[f.PlaylistID];
  a.publish("gs.playlist.view.update", f);
  a.publish("gs.auth.playlists.update");
  a.publish("gs.user.playlist.remove");
  if (d)
    {
      var g = new GS.Models.DataString(a.localize.getString("POPUP_DELETE_PLAYLIST_MSG"), {playlist : f.PlaylistName}).render();
      a.publish("gs.notification", {type : "notice", message : g});
    }
}
)), this.callback((function ()
{
  f.isDeleted = false;
  if (d)
    {
      var g = new GS.Models.DataString(a.localize.getString("POPUP_FAIL_DELETE_PLAYLIST_MSG"), {playlist : f.PlaylistName}).render();
      a.publish("gs.notification", {type : "error", message : g});
    }
}
)));
      else
        {
          f.isDeleted = true;
          f.removeShortcut(false);
          delete this.playlists[f.PlaylistID];
          a.publish("gs.playlist.view.update", f);
          a.publish("gs.auth.playlists.update");
          a.publish("gs.user.playlist.remove");
          d && a.publish("gs.notification", {type : "notice", message : "Playlist successfully deleted."});
        }
    }
}
), restorePlaylist : (function (c,d)
{
  var f = GS.Models.Playlist.getOneFromCache(c);
  if (f && f.UserID === this.UserID)
    {
      d = _.orEqual(d, true);
      if (this.isLoggedIn)
        GS.service.playlistUndelete(f.PlaylistID, this.callback((function ()
{
  f.isDeleted = false;
  this.playlists[f.PlaylistID] = f;
  a.publish("gs.playlist.view.update", f);
  d && a.publish("gs.notification", {type : "notice", message : "Playlist successfully restored."});
}
)), (function ()
{
  d && a.publish("gs.notification", {type : "error", message : "Failed to restore playlist."});
}
));
      else
        {
          f.isDeleted = false;
          this.playlists[f.PlaylistID] = f;
          a.publish("gs.playlist.view.update", f);
          d && a.publish("gs.notification", {type : "notice", message : "Playlist successfully restored."});
        }
    }
}
), getSidebar : (function ()
{
  GS.service.getUserSidebar(this.callback("loadSidebar"));
}
), loadSidebar : (function (c)
{
  this.sidebarLoaded = true;
  this.sidebar = c;
  a.publish("gs.auth.sidebar.loaded");
  if (this.sidebar.stations.length === 0)
    {
      var d = this;
      _.forEach(this.defaultStations, (function (f)
{
  d.addToShortcuts("station", f, false);
}
));
    }
}
), getPlaylists : (function (c,d)
{
  if (_.isEmpty(this.playlists))
    GS.service.userGetPlaylists(this.UserID, this.callback(["loadPlaylists", c]), d);
  else
    c && c();
}
), loadPlaylists : (function (c)
{
  c = c.Playlists;
  for (d in c)
    if (c.hasOwnProperty(d))
      {
        c[d].Username = this.Username;
        c[d].UserID = this.UserID;
        this.playlists[c[d].PlaylistID] = GS.Models.Playlist.wrap(c[d]);
      }
  a.publish("gs.auth.playlists.update");
}
), getFavorites : (function ()
{
  var c = this;
  _.forEach(["Albums", "Artists", "Playlists", "Songs", "Users"], (function (d)
{
  GS.service.getFavorites(c.UserID, d, c.callback("load" + d + "Favorites"));
}
));
}
), loadAlbumsFavorites : (function (c)
{
  this._super(c);
  a.publish("gs.auth.favorites.albums.update");
}
), loadArtistsFavorites : (function (c)
{
  this._super(c);
  a.publish("gs.auth.favorites.artists.update");
}
), loadPlaylistsFavorites : (function (c)
{
  this._super(c);
  a.publish("gs.auth.favorites.playlists.update");
}
), loadSongsFavorites : (function (c)
{
  this._super(c);
  a.publish("gs.auth.favorites.songs.update");
}
), loadUsersFavorites : (function (c)
{
  this._super(c);
  a.publish("gs.auth.favorites.users.update");
  this.lastSeenFeedEvent == 0 && this.getUnseenFeeds();
}
), getLibrary : (function ()
{
  var c = store.get("library" + this.UserID);
  if (c)
    {
      var d = c.songs;
      delete c.songs;
      this.library = GS.Models.Library.wrap(c);
      for (f in d)
        if (d.hasOwnProperty(f))
          {
            d[f] = GS.Models.Song.unarchive(d[f]);
            d[f].fromLibrary = 1;
          }
      this.library.songs = GS.Models.Song.wrapManyInObject(d, false);
      GS.service.userGetLibraryTSModified(this.UserID, this.callback("refreshLibrary"));
    }
  else
    this.library.getSongs(this.callback("loadLibrary"), false, false);
}
), refreshLibrary : (function (c)
{
  if (c.TSModified > this.library.lastModified)
    {
      this.library.currentPage = 0;
      this.library.songsLoaded = false;
      this.library.getSongs(this.callback("loadLibrary"), false, false);
    }
}
), loadLibrary : (function (c)
{
  for (var d = 0;d < c.length;d++)
    {
      c[d].fromLibrary = 1;
      this.library.songs[c[d].SongID] = c[d];
    }
  a.publish("gs.auth.library.update", [c]);
  this.library.songsLoaded || this.library.getSongs(this.callback("loadLibrary"), false, false);
}
), addToSongFavorites : (function (c,d)
{
  d = _.orEqual(d, true);
  if (! this.favorites.songs[c])
    {
      var f = GS.Models.Song.getOneFromCache(c);
      if (! f)
        throw "AUTH.ADDTOSONGFAVES. SONGID NOT IN CACHE: " + c;
      f.isFavorite = 1;
      f.fromLibrary = 1;
      if (! _.defined(f.TSFavorited))
        f.TSFavorited = new Date().format("Y-m-d G:i:s");
      if (! _.defined(f.TSAdded))
        f.TSAdded = f.TSFavorited;
      if (this.library.songs[c])
        this.library.songs[c] = f;
      else
        {
          this.library.songs[c] = f;
          a.publish("gs.auth.library.add", f);
        }
      this.favorites.songs[c] = f;
      GS.guts.logEvent("objectFavorited", {type : "song", id : c});
      a.publish("gs.auth.song.update", f);
      a.publish("gs.auth.favorite.song", f);
      a.publish("gs.auth.favorites.songs.add", f);
      d && a.publish("gs.notification.favorite.song", f);
      if (this.isLoggedIn)
        GS.service.favorite("Song", f.SongID, f.getDetailsForFeeds(), null, this.callback(this._favoriteFail, "Song", f));
      else
        this.isDirty = true;
    }
}
), addToPlaylistFavorites : (function (c,d)
{
  d = _.orEqual(d, true);
  if (! this.favorites.playlists[c])
    {
      var f = GS.Models.Playlist.getOneFromCache(c);
      if (! f)
        throw "AUTH.ADDTOPLAYLISTFAVES. PLAYLISTID NOT IN CACHE: " + c;
      f.isFavorite = 1;
      if (! _.defined(f.TSFavorited))
        f.TSFavorited = new Date().format("Y-m-d G:i:s");
      this.favorites.playlists[c] = f;
      GS.guts.logEvent("objectFavorited", {type : "playlist", id : c});
      f.addShortcut(false);
      a.publish("gs.auth.favorites.playlists.update");
      a.publish("gs.auth.playlist.update", f);
      a.publish("gs.auth.favorite.playlist", f);
      a.publish("gs.playlist.view.update", this);
      d && a.publish("gs.notification.favorite.playlist", f);
      if (this.isLoggedIn)
        GS.service.favorite("Playlist", f.PlaylistID, f.getDetailsForFeeds(), null, this.callback(this._favoriteFail, "Playlist", f));
      else
        this.isDirty = true;
    }
}
), removeFromPlaylistFavorites : (function (c,d)
{
  d = _.orEqual(d, true);
  var f = GS.Models.Playlist.getOneFromCache(c);
  if (f)
    {
      f.removeShortcut(false);
      f.isFavorite = 0;
      GS.Models.Playlist.cache[c] = f;
      delete this.favorites.playlists[c];
      GS.guts.logEvent("objectUnfavorited", {type : "playlist", id : c});
      a.publish("gs.auth.favorites.playlists.update");
      a.publish("gs.auth.playlist.update", f);
      a.publish("gs.playlist.view.update", this);
      this.isLoggedIn && GS.service.unfavorite("Playlist", c);
      d && a.publish("gs.notification", {type : "notify", message : "No longer subscribed to playlist."});
    }
}
), removeFromSongFavorites : (function (c)
{
  var d = this.favorites.songs[c];
  if (d)
    {
      d.isFavorite = 0;
      delete this.favorites.songs[c];
      GS.guts.logEvent("objectUnfavorited", {type : "song", id : c});
      this.library.songs[c] = d;
      a.publish("gs.auth.song.update", d);
      a.publish("gs.auth.favorites.songs.remove", d);
      this.isLoggedIn && GS.service.unfavorite("Song", d.SongID);
    }
}
), addToUserFavorites : (function (c,d)
{
  d = _.orEqual(d, true);
  console.log("add to user favorites", c);
  if (! this.favorites.users[c])
    {
      var f = GS.Models.User.getOneFromCache(c);
      if (! f || this.UserID === f.UserID)
        this._favoriteFail("User", null);
      else
        {
          f.isFavorite = 1;
          this.favorites.users[c] = f;
          GS.guts.logEvent("objectFavorited", {type : "user", id : c});
          a.publish("gs.auth.favorites.users.update");
          a.publish("gs.auth.user.update", f);
          a.publish("gs.auth.favorite.user", f);
          d && a.publish("gs.notification.favorite.user", f);
          if (this.isLoggedIn)
            GS.service.favorite("User", f.UserID, f.getDetailsForFeeds(), null, this.callback(this._favoriteFail, "User", f));
          else
            this.isDirty = true;
        }
    }
}
), removeFromUserFavorites : (function (c)
{
  var d = GS.Models.User.getOneFromCache(c);
  if (! (! d || this.UserID === d.UserID))
    {
      d.isFavorite = 0;
      GS.Models.User.cache[c] = d;
      delete this.favorites.users[c];
      GS.guts.logEvent("objectUnfavorited", {type : "user", id : c});
      a.publish("gs.auth.favorites.users.update");
      a.publish("gs.auth.user.update", d);
      this.isLoggedIn && GS.service.unfavorite("User", d.UserID);
    }
}
), changeFollowFlags : (function (c)
{
  GS.service.changeFollowFlags(c, this.callback("changeFollowFlagsSuccess", c), this.callback("changeFollowFlagsFail"));
}
), changeFollowFlagsSuccess : (function (c,d)
{
  if (d.success)
    {
      for (f in c)
        if (c.hasOwnProperty(f))
          if (this.favorites.users[c[f].userID])
            this.favorites.users[c[f].userID].FollowingFlags = c[f].flags;
      this.communityFeed.isDirty = true;
      a.publish("gs.auth.favorites.users.update");
    }
  else
    this.changeFollowFlagsFail();
}
), changeFollowFlagsFail : (function ()
{
  a.publish("gs.notification", {message : a.localize.getString("SETTINGS_USER_HIDE_FAIL")});
}
), addToLibrary : (function (c,d)
{
  d = _.orEqual(d, true);
  b = [];
  c = a.makeArray(c);
  for (var f = 0;f < c.length;f++)
    {
      var g = c[f];
      if (! this.library.songs[g])
        {
          var h = GS.Models.Song.getOneFromCache(g);
          if (h)
            {
              h.fromLibrary = 1;
              if (this.favorites.songs[g])
                h.isFavorite = 1;
              if (! _.defined(h.TSAdded))
                h.TSAdded = new Date().format("Y-m-d G:i:s");
              this.library.songs[g] = h;
              GS.guts.logEvent("songAddedToLibrary", {id : g});
              a.publish("gs.auth.library.add", h);
              a.publish("gs.auth.song.update", h);
              b.push(h.getDetailsForFeeds());
            }
        }
    }
  if (! _.isEmpty(b))
    if (this.isLoggedIn)
      GS.service.userAddSongsToLibrary(b, this.callback("addToLibrarySuccess", d), this.callback("addtoLibraryFailed"));
    else
      {
        this.isDirty = true;
        this.addToLibrarySuccess(d);
      }
}
), addToLibrarySuccess : (function (c,d)
{
  if (c)
    {
      var f, g = ["Successfully added", b.length, b.length > 1 ? "songs" : "song", "to your library"].join(" ");
      b.length > 1 ? a.publish("gs.notification", {message : g}) : GS.Models.Song.getSong(_.orEqual(b[0].songID, b[0].SongID), (function (o)
{
  a.publish("gs.auth.library.singleSongAdded", {message : g, object : o});
}
), (function ()
{
  a.publish("gs.notification", {message : g});
}
));
    }
  if (d)
    {
      f = parseInt(d.Timestamps.newTSModified, 10);
      parseInt(d.Timestamps.oldTSModified, 10) > this.library.lastModified && this.library.getSongs(this.callback("loadLibrary"), false, false);
    }
  else
    f = _.unixTime();
  this.library.lastModified = f;
  f = new Date(f * 1000).format("Y-m-d G:i:s");
  for (var h = 0;h < b.length;h++)
    this.library.songs[b[h].songID].TSAdded = f;
}
), _favoriteFail : (function (c,d)
{
  var f = "";
  if (d)
    switch (c)
    {
      case "Song":
        f = d.SongName;
        break ;
      case "Playlist":
        f = d.PlaylistName;
        break ;
      case "User":
        f = d.Username;
        break ;
    }
  f = f !== "" ? ["Failed to add the", c.toLowerCase(), f, "to your favorites"].join(" ") : ["Failed to add a", c.toLowerCase(), "to your favorites"].join(" ");
  a.publish("gs.notification", {type : "error", message : f});
}
), addToLibraryFailed : (function (c)
{
  console.error("add to library fail", c);
  c = ["Failed to add", songIDsToAdd.length, songIDsToAdd.length > 1 ? "songs" : "song", "to your library"].join(" ");
  a.publish("gs.notification", {type : "error", message : c});
}
), removeFromLibrary : (function (c)
{
  console.log("auth.removefromlibrary. songid: ", c);
  var d = this.library.songs[c];
  if (d)
    {
      delete this.library.songs[c];
      GS.guts.logEvent("songRemovedFromLibrary", {id : c});
      delete this.favorites.songs[c];
      d.fromLibrary = 0;
      d.isFavorite = 0;
      GS.Models.Song.cache[d.SongID] = d;
      a.publish("gs.auth.library.remove", d);
      a.publish("gs.auth.song.update", d);
      if (this.isLoggedIn)
        {
          GS.service.userRemoveSongFromLibrary(this.UserID, d.SongID, d.AlbumID, d.ArtistID, this.callback("removeFromLibrarySuccess"), this.callback("removeFromLibraryFailed"));
          GS.service.unfavorite("Song", d.SongID);
        }
      else
        a.publish("gs.notification", {message : "Successfully removed song from your library."});
      return d;
    }
}
), removeFromLibrarySuccess : (function (c)
{
  if (parseInt(c.Timestamps.oldTSModified, 10) > this.library.lastModified)
    this.library.getSongs(this.callback("loadLibrary"), false, false);
  else
    this.library.lastModified = parseInt(c.Timestamps.newTSModified, 10);
  a.publish("gs.notification", {message : "Successfully removed song from your library."});
}
), removeFromLibraryFailed : (function (c)
{
  console.error("remove from library fail", c);
  a.publish("gs.notification", {type : "error", message : "Failed removing song to library"});
}
), getUnseenFeeds : (function ()
{
  clearTimeout(this.unseenFeedEventTimeout);
  this.getCommunityFeed(this.callback("countUnseenFeeds"), this.callback("countUnseenFeeds"));
}
), countUnseenFeeds : (function ()
{
  this.unseenFeedEvents = 0;
  for (var c = this.communityFeed.events.length, d = 0;d < c;d++)
    if (this.communityFeed.events[d].time > this.lastSeenFeedEvent)
      this.unseenFeedEvents++;
    else
      break ;
  a.publish("gs.auth.user.feeds.update");
  this.unseenFeedEventTimeout = setTimeout("GS.user.getUseenFeeds", 7200000);
}
), addToShortcuts : (function (c,d,f)
{
  console.log("authuser.addShortcut", c, d, f);
  f = _.orEqual(f, true);
  switch (c)
  {
    case "playlist":
      c = GS.Models.Playlist.getOneFromCache(d);
      if (! c || c.isShortcut())
        return ;
      var g = c.isSubscribed();
      c = g ? "subscribedPlaylists" : "playlists";
      if (g)
        {
          this.sidebar.subscribedPlaylists.unshift(d.toString());
          a.publish("gs.auth.favorites.playlists.update");
        }
      else
        {
          this.sidebar.playlists.unshift(d.toString());
          a.publish("gs.auth.playlists.update");
        }
      break ;
    case "station":
      c = "stations";
      if (this.sidebar.stations.indexOf(d.toString()) !== - 1)
        return ;
      this.sidebar.stations.unshift(d.toString());
      a.publish("gs.auth.stations.update");
      break ;
    default:
      return ;
  }
  if (this.isLoggedIn)
    GS.service.addShortcutToUserSidebar(c, d, this.callback(this._addShortcutSuccess, c, d, f), this.callback(this._addShortcutFailed, c, d, f));
  else
    {
      this.isDirty = true;
      this._addShortcutSuccess(c, d, f, {});
    }
}
), _addShortcutSuccess : (function (c,d,f)
{
  var g, h = {};
  switch (c)
  {
    case "playlists":
    case "subscribedPlaylists":
      if (c = GS.Models.Playlist.getOneFromCache(d))
        {
          g = "NOTIFICATION_PLAYLIST_SHORTCUT_ADD_SUCCESS";
          h.playlist = c.PlaylistName;
          a.publish("gs.playlist.view.update", c);
        }
      break ;
    case "stations":
      g = "NOTIFICATION_STATION_SHORTCUT_ADD_SUCCESS";
      h.station = a.localize.getString("STATION_" + this.stations[d]);
      break ;
  }
  if (f && g)
    {
      f = new GS.Models.DataString(a.localize.getString(g), h);
      a.publish("gs.notification", {type : "notice", message : f.render()});
    }
}
), _addShortcutFailed : (function (c,d,f)
{
  var g, h = {};
  switch (c)
  {
    case "playlists":
    case "subscribedPlaylists":
      var o = GS.Models.Playlist.getOneFromCache(d);
      if (o)
        {
          g = "NOTIFICATION_PLAYLIST_SHORTCUT_ADD_FAILED";
          h.playlist = o.PlaylistName;
        }
      if (c == "playlists")
        {
          c = this.sidebar.playlists.indexOf(d.toString());
          if (c != - 1)
            {
              this.sidebar.playlists.splice(c, 1);
              a.publish("gs.auth.playlists.update");
            }
        }
      else
        {
          c = this.sidebar.subscribedPlaylists.indexOf(obj.PlaylistID.toString());
          if (c != - 1)
            {
              this.sidebar.subscribedPlaylists.splice(c, 1);
              a.publish("gs.auth.favorites.playlists.update");
            }
        }
      break ;
    case "stations":
      g = "NOTIFICATION_STATION_SHORTCUT_ADD_FAILED";
      h.station = a.localize.getString("STATION_" + this.stations[d]);
      c = this.sidebar.stations.indexOf(d.toString());
      if (c != - 1)
        {
          this.sidebar.stations.splice(c, 1);
          a.publish("gs.auth.stations.update");
        }
      break ;
  }
  if (f && g)
    {
      f = new GS.Models.DataString(a.localize.getString(g), h);
      a.publish("gs.notification", {type : "error", message : f.render()});
    }
}
), removeFromShortcuts : (function (c,d,f)
{
  console.log("authuser.removeShortcut", c, d, f);
  f = _.orEqual(f, true);
  var g;
  switch (c)
  {
    case "playlist":
      c = GS.Models.Playlist.getOneFromCache(d);
      if (! c || ! c.isShortcut())
        return ;
      c = (g = c.isSubscribed()) ? "subscribedPlaylists" : "playlists";
      if (g)
        {
          g = this.sidebar.subscribedPlaylists.indexOf(d.toString());
          if (g != - 1)
            {
              this.sidebar.subscribedPlaylists.splice(g, 1);
              a.publish("gs.auth.favorites.playlists.update");
            }
        }
      else
        {
          g = this.sidebar.playlists.indexOf(d.toString());
          if (g != - 1)
            {
              this.sidebar.playlists.splice(g, 1);
              a.publish("gs.auth.playlists.update");
            }
        }
      break ;
    case "station":
      c = "stations";
      g = this.sidebar.stations.indexOf(d.toString());
      if (g != - 1)
        {
          this.sidebar.stations.splice(g, 1);
          a.publish("gs.auth.stations.update");
        }
      else
        return ;
      break ;
    default:
      return ;
  }
  if (this.isLoggedIn)
    GS.service.removeShortcutFromUserSidebar(c, d, this.callback(this._removeShortcutSuccess, c, d, f), this.callback(this._removeShortcutFailed, c, d, g, f));
  else
    {
      this.isDirty = true;
      this._removeShortcutSuccess(c, d, f, {});
    }
}
), _removeShortcutSuccess : (function (c,d,f)
{
  var g, h = {};
  switch (c)
  {
    case "playlists":
    case "subscribedPlaylists":
      if (c = GS.Models.Playlist.getOneFromCache(d))
        {
          g = "NOTIFICATION_PLAYLIST_SHORTCUT_REMOVE_SUCCESS";
          h.playlist = c.PlaylistName;
          a.publish("gs.playlist.view.update", c);
        }
      break ;
    case "stations":
      g = "NOTIFICATION_STATION_SHORTCUT_REMOVE_SUCCESS";
      h.station = a.localize.getString("STATION_" + this.stations[d]);
      break ;
  }
  if (f && g)
    {
      f = new GS.Models.DataString(a.localize.getString(g), h);
      a.publish("gs.notification", {type : "notice", message : f.render()});
    }
}
), _removeShortcutFailed : (function (c,d,f,g)
{
  var h, o = {};
  if (f < 0)
    f = 0;
  switch (c)
  {
    case "playlists":
    case "subscribedPlaylists":
      var p = GS.Models.Playlist.getOneFromCache(d);
      if (p)
        {
          h = "NOTIFICATION_PLAYLIST_SHORTCUT_REMOVE_FAILED";
          o.playlist = p.PlaylistName;
        }
      if (c == "playlists")
        {
          if (f != - 1)
            {
              this.sidebar.playlists.splice(f, 0, d.toString());
              a.publish("gs.auth.playlists.update");
            }
        }
      else
        if (f != - 1)
          {
            this.sidebar.subscribedPlaylists.splice(f, 0, d.toString());
            a.publish("gs.auth.favorites.playlists.update");
          }
      break ;
    case "stations":
      h = "NOTIFICATION_STATION_SHORTCUT_REMOVE_FAILED";
      o.station = a.localize.getString("STATION_" + this.stations[d]);
      if (f != - 1)
        {
          this.sidebar.stations.splice(f, 0, d.toString());
          a.publish("gs.auth.stations.update");
        }
      break ;
  }
  if (g && h)
    {
      c = new GS.Models.DataString(a.localize.getString(h), o);
      a.publish("gs.notification", {type : "error", message : c.render()});
    }
}
), changePassword : (function (c,d,f,g)
{
  GS.service.changePassword(c, d, this.callback(this._passwordSuccess, f), this.callback(this._passwordFailed, g));
}
), _passwordSuccess : (function (c,d)
{
  console.log("authuser changepass SUCCESS", d);
  a.isFunction(c) && c(d);
}
), _passwordFailed : (function (c,d)
{
  console.log("authuser changepass FAILED", d);
  a.isFunction(c) && c(d);
}
), updateAccountType : (function (c)
{
  c = c.toLowerCase();
  switch (c)
  {
    case "plus":
      this.IsPremium = 1;
      this.Flags |= 1;
      break ;
    case "anywhere":
      this.IsPremium = 1;
      this.Flags |= 128;
      break ;
    default:
      this.IsPremium = 0;
      this.Flags &= - 2;
      this.Flags &= - 129;
      break ;
  }
  a.publish("gs.auth.update");
  this.checkVipExpiring();
}
), checkVipExpiring : (function ()
{
  this.IsPremium && GS.service.getSubscriptionDetails(this.callback("checkVipExpiringCallback"), this.callback("checkVipExpiringCallback"));
}
), checkVipExpiringCallback : (function (c)
{
  var d, f, g = new Date();
  d = false;
  if (! (c === false || c.fault || c.code))
    if (! c.bRecurring)
      {
        f = c.period === "MONTH" ? true : false;
        if (c.dateEnd)
          {
            d = c.dateEnd.split("-");
            d = f ? new Date(d[0], parseInt(d[1], 10) - 1, d[2]) : new Date(parseInt(d[0], 10) + 1, d[1], d[2]);
          }
        else
          if (c.dateStart)
            {
              d = c.dateStart.split("-");
              d = f ? new Date(d[0], parseInt(d[1], 10), d[2]) : new Date(parseInt(d[0], 10) + 1, d[1], d[2]);
            }
        if (d)
          {
            f = _.orEqual(store.get("gs.vipExpire.hasSeen" + this.UserID), 0);
            f = g.getTime() - f;
            g = d.getTime() - g.getTime();
            d = Math.max(0, Math.ceil(g / 86400000));
            d += d == 1 ? " day" : " days";
            d = g <= 0 ? new GS.Models.DataString(a.localize.getString("POPUP_VIP_EXPIRES_NO_DAYS"), {vipPackage : c.subscriptionType}).render() : new GS.Models.DataString(a.localize.getString("POPUP_VIP_EXPIRES_DAYS_LEFT"), {daysLeft : d, vipPackage : c.subscriptionType}).render();
            c.daysLeft = d;
            if (f >= 172800000)
              if (g < 86400000)
                {
                  c.timeframe = "oneDay";
                  GS.lightbox.open("vipExpires", c);
                }
              else
                if (g < 172800000)
                  {
                    c.timeframe = "twoDays";
                    GS.lightbox.open("vipExpires", c);
                  }
                else
                  if (g < 1209600000)
                    {
                      c.timeframe = "twoWeeks";
                      GS.lightbox.open("vipExpires", c);
                    }
                  else
                    if (g <= 0 && Math.abs(g) <= 604800000)
                      {
                        c.timeframe = "expired";
                        GS.lightbox.open("vipExpires", c);
                      }
            setTimeout(this.callback("checkVipExpiring"), 172800000);
          }
      }
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.Fanbase", {}, {currentPage : 0, objectID : null, objectType : "", userIDs : [], fansLoaded : false, getFans : (function (b,c,d)
{
  d = _.orEqual(d, true);
  if (this.fansLoaded)
    {
      c = GS.Models.User.getManyFromCache(this.userIDs);
      b(c);
    }
  else
    {
      d && this.currentPage === 0 && a.publish("gs.page.loading.grid");
      this.objectType === "playlist" ? GS.service[(this.objectType + "GetFans")](this.objectID, this.callback(["cacheAndReturnUsers", b]), c) : GS.service[(this.objectType + "GetFans")](this.objectID, this.currentPage, this.callback(["cacheAndReturnUsers", b]), c);
    }
}
), cacheAndReturnUsers : (function (b)
{
  for (var c = GS.Models.User.wrapMany(b.Users || b.Return.fans || b.Return), d = 0;d < c.length;d++)
    this.userIDs.push(c[d].UserID);
  if (_.defined(b.hasMore) && b.hasMore)
    {
      console.log("service has more. current page is: ", this.currentPage);
      this.currentPage++;
    }
  else
    this.fansLoaded = true;
  return c;
}
)});
}
)(jQuery);
  (function ()
{
  GS.Models.Base.extend("GS.Models.Feed", {}, {user : null, currentPage : 0, isLoaded : false, hasMore : false, today : null, offset : 0, events : [], fromFavorites : false, fromRecent : false, lastRequest : 0, isDirty : false, RATE_LIMIT : 600000, getProfileFeed : (function (a,b)
{
  var c = new Date();
  if (! this.isLoaded && ! this.lastRequest || c.getTime() > this.lastRequest + this.RATE_LIMIT)
    {
      this.events = [];
      this.today = new Date();
      this.offset = 0;
      this.userIDs = [];
      this.onProgress = a;
      this.onErr = b;
      this.isLoaded = this.hasMore = false;
      this.lastRequest = c.getTime();
      this.fetchProfileDay();
    }
  else
    a();
}
), getCommunityFeed : (function (a,b,c)
{
  var d = new Date();
  if (! this.isLoaded || d.getTime() > this.lastRequest + this.RATE_LIMIT || this.isDirty)
    {
      this.events = [];
      this.today = new Date();
      this.offset = 0;
      this.userIDs = a;
      this.onProgress = b;
      this.onErr = c;
      this.fromFavorites = true;
      this.isLoaded = this.hasMore = this.fromRecent = false;
      this.lastRequest = d.getTime();
      this.isDirty = false;
      this.fetchCommunityDay();
    }
  else
    b();
}
), getRecentlyActiveUsersFeed : (function (a,b)
{
  var c = new Date();
  if (! this.isLoaded || c.getTime() > this.lastRequest + this.RATE_LIMIT || this.isDirty)
    {
      this.events = [];
      this.today = new Date();
      this.offset = 0;
      this.onProgress = a;
      this.onErr = b;
      this.fromFavorites = false;
      this.fromRecent = true;
      this.isLoaded = this.hasMore = false;
      this.lastRequest = c.getTime();
      if (this.recentUsers && this.recentUsers.length)
        {
          this.userIDs = _.toArrayID(this.recentUsers);
          this.fetchCommunityDay();
        }
      else
        GS.service.getRecentlyActiveUsers(this.callback("onRecentUsers"), this.onErr);
    }
  else
    a();
}
), onRecentUsers : (function (a)
{
  var b;
  this.recentUsers = {};
  if (a.users && a.users.length)
    for (var c = 0;c < a.users.length;c++)
      {
        b = a.users[c];
        b = GS.Models.User.wrap(b);
        this.recentUsers[b.UserID] = b;
      }
  this.userIDs = _.toArrayID(this.recentUsers);
  this.fetchCommunityDay();
}
), fetchProfileDay : (function ()
{
  var a = new Date(this.today.getTime() - this.offset++ * 1000 * 60 * 60 * 24);
  GS.service.getProcessedUserFeedData(this.user.UserID, a.format("Ymd"), this.callback(["parseProfileFeed", this.onProgress]), this.onErr);
}
), fetchCommunityDay : (function ()
{
  var a = new Date(this.today.getTime() - this.offset++ * 1000 * 60 * 60 * 24);
  GS.service.getCombinedProcessedFeedData(this.userIDs, a.format("Ymd"), this.user.UserID, this.callback(["parseCommunityFeed", this.onProgress]), this.onErr);
}
), parseProfileFeed : (function (a)
{
  var b;
  for (c in a.events)
    if (a.events.hasOwnProperty(c))
      if (a.events[c].length)
        {
          b = this.parseUser(a.events[c], this.user);
          this.events = this.events.concat(b);
        }
  this.isLoaded = ! Boolean(a.hasMore) || this.events.length;
  this.events = this.events.sort(this.sortByDate);
}
), parseCommunityFeed : (function (a)
{
  var b, c;
  for (d in a.userFeeds)
    if (a.userFeeds.hasOwnProperty(d))
      if (a.userFeeds[d].length)
        {
          if (this.fromFavorites)
            c = this.user.favorites.users[d];
          else
            if (this.fromRecent)
              c = this.recentUsers[d];
          b = this.parseUser(a.userFeeds[d], c);
          this.events = this.events.concat(b);
        }
  this.hasMore = Boolean(a.hasMore);
  this.isLoaded = ! Boolean(a.hasMore) || this.events.length;
  this.events = this.events.sort(this.sortByDate);
  this.events = this.collapse(this.events);
  this.events.length < 50 && this.offset < 4 && this.fetchCommunityDay();
}
), sortByDate : (function (a,b)
{
  return b.time - a.time;
}
), sortByWeight : (function (a,b)
{
  return parseInt(b.weight, 10) - parseInt(a.weight, 10);
}
), collapse : (function (a)
{
  var b = [], c, d;
  for (d = 0;d < a.length;d++)
    if (d > 0 && a[d].time == a[(d - 1)].time)
      {
        if (a[d].weight > a[(d - 1)].weight)
          {
            c = b.indexOf(a[(d - 1)]);
            c != - 1 && b.splice(c, 1);
            b.push(a[d]);
          }
      }
    else
      b.push(a[d]);
  a = b;
  b = [];
  if (a.length <= 10)
    return a;
  var f = null, g = [];
  _.forEach(a, (function (h)
{
  if (h.user !== f)
    {
      if (g.length)
        if (g.length > 3)
          {
            g.sort(this.sortByWeight);
            b = b.concat(g.slice(0, 3));
          }
        else
          b = b.concat(g);
      f = h.user;
      g = [h];
    }
  else
    g.push(h);
}
), this);
  if (g.length)
    if (g.length > 3)
      {
        g = g.sort(this.sortByWeight);
        b = b.concat(g.slice(0, 3));
      }
    else
      b = b.concat(g);
  return b;
}
), parseUser : (function (a,b)
{
  var c = [], d;
  for (f in a)
    if (a.hasOwnProperty(f))
      {
        try
          {
            d = GS.Models.FeedEvent.wrap(a[f]);
            d.user = b;
            d.date = new Date(d.time * 1000);
            d.getDataString();
          }
        catch (g)
          {
            console.warn("Feed Parse Error: type, event, user:", a[f].type, a[f], b);
            continue ;
          }
        c.push(d);
      }
  return c;
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.FeedEvent", {BROADCAST_TWITTER_TYPE : 1, EMAIL_TYPE : 2, CREATE_PLAYLIST_TYPE : 3, FAVORITE_SONG_TYPE : 4, FAVORITE_USER_TYPE : 5, FAVORITE_PLAYLIST_TYPE : 6, FAVORITE_ARTIST_TYPE : 7, FAVORITE_ALBUM_TYPE : 8, SONG_OBSESSION_TYPE : 9, EDIT_PLAYLIST_TYPE : 10, LISTEN_ARTIST_TYPE : 11, LISTEN_ALBUM_TYPE : 12, EDIT_PLAYLIST_LOTS_TYPE : 13, LISTEN_LOTS_TYPE : 14, BROADCAST_FACEBOOK_TYPE : 15, BROADCAST_STUMBLEUPON_TYPE : 16, USER_FOLLOWED_TYPE : 17, PLAYLIST_FOLLOWED_TYPE : 18, SHARE_SONG_TYPE : 19, SHARE_SONG_RECEIVED_TYPE : 20, LIBRARY_CLEANUP_TYPE : 21, LIBRARY_ADD_ARTIST_TYPE : 22, LIBRARY_ADD_ALBUM_TYPE : 23, LIBRARY_ADD_SONGS_TYPE : 24, SHARE_PLAYLIST_TYPE : 25, SHARE_PLAYLIST_RECEIVED_TYPE : 26, FAVORITE_SONGS_TYPE : 27, USERS_FOLLOWED_TYPE : 28, FAVORITE_USERS_TYPE : 29, SHARES_SONG_TYPE : 30, SHARES_PLAYLIST_TYPE : 31, FeedTypes : null, getTypes : (function ()
{
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
  return b;
}
), feedBroadcast : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  b.dataKey = "FEED_BROADCAST";
  if (b.data.songs[0].albumName.length)
    c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  else
    b.dataKey = "FEED_BROADCAST_NO_ALBUM";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFacebook : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  b.dataKey = "FEED_FACEBOOK";
  if (b.data.songs[0].albumName.length)
    c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  else
    b.dataKey = "FEED_FACEBOOK_NO_ALBUM";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedShareEmail : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  b.dataKey = "FEED_SHARE_SEND_SONG_SINGLE_EMAIL";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedPlaylistCreated : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  if (parseInt(b.data.songCount, 10))
    {
      c.numSongs = b.data.songCount;
      b.dataKey = "FEED_PLAYLIST_CREATED";
    }
  else
    b.dataKey = "FEED_PLAYLIST_CREATED_NO_SONGS";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFavorite : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  b.dataKey = "FEED_FAVORITE_SONG";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFavorites : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.numSongs = b.data.songs.length;
  b.dataKey = "FEED_FAVORITE_SONGS";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFavoriteUser : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.followed = ["<a href=\"", _.cleanUrl(b.data.users[0].username, b.data.users[0].userID, "user"), "\">", b.data.users[0].username, "</a>"].join("");
  b.dataKey = "FEED_FAVORITE_USER";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFavoritePlaylist : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  c.author = ["<a href=\"", _.cleanUrl(b.data.playlist.username, b.data.playlist.userID, "user"), "\">", b.data.playlist.username, "</a>"].join("");
  b.dataKey = "FEED_FAVORITE_PLAYLIST";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFavoriteArtist : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.artist = ["<a href=\"", _.cleanUrl(b.data.artist.artistName, b.data.artist.artistID, "artist"), "\">", _.cleanText(b.data.artist.artistName), "</a>"].join("");
  b.dataKey = "FEED_FAVORITE_ARTIST";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedFavoriteAlbum : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.album = ["<a href=\"", _.cleanUrl(b.data.album.albumName, b.data.album.albumID, "album"), "\">", _.cleanText(b.data.album.albumName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.album.artistName, b.data.album.artistID, "artist"), "\">", _.cleanText(b.data.album.artistName), "</a>"].join("");
  b.dataKey = "FEED_FAVORITE_ALBUM";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedSongObsession : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  b.dataKey = "FEED_SONG_OBSESSION";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedPlaylistEdited : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  if (b.data.songCount)
    {
      c.numSongs = b.data.songCount;
      b.dataKey = "FEED_PLAYLIST_EDITED";
    }
  else
    b.dataKey = "FEED_PLAYLIST_EDITED_NO_SONGS";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedListenArtist : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.numSongs = b.data.songs.length;
  c.artist = ["<a href=\"", _.cleanUrl(b.data.artist.artistName, b.data.artist.artistID, "artist"), "\">", _.cleanText(b.data.artist.artistName), "</a>"].join("");
  b.dataKey = "FEED_LISTEN_ARTIST";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedListenAlbum : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.numSongs = b.data.songs.length;
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  b.dataKey = "FEED_LISTEN_ALBUM";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedPlaylistEditLots : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  b.dataKey = "FEED_PLAYLIST_EDITED_LOTS";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedListenLots : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.numSongs = b.data.songs.length;
  b.dataKey = "FEED_LISTEN_LOTS";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedUserFollowed : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.fan = ["<a href=\"", _.cleanUrl(b.data.users[0].username, b.data.users[0].userID, "user"), "\">", _.cleanText(b.data.users[0].username), "</a>"].join("");
  b.dataKey = "FEED_USER_FOLLOWED";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedPlaylistFollowed : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  c.author = ["<a href=\"", _.cleanUrl(b.data.playlist.username, b.data.playlist.userID, "user"), "\">", b.data.playlist.username, "</a>"].join("");
  c.fan = ["<a href=\"", _.cleanUrl(b.data.users[0].username, b.data.users[0].userID, "user"), "\">", b.data.users[0].username, "</a>"].join("");
  b.dataKey = "FEED_PLAYLIST_FOLLOWED";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedShareSong : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  b.dataKey = "FEED_SHARE_SEND_SONG_SINGLE_USER";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedSharesSong : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  c.numFriends = b.data.peopleCount;
  b.dataKey = "FEED_SHARE_SEND_SONG_MULTIPLE";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedShareReceived : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  c.friend = ["<a href=\"", _.cleanUrl(b.data.user.username, b.data.user.userID, "user"), "\">", _.cleanText(b.data.user.username), "</a>"].join("");
  b.dataKey = "FEED_SHARE_RECEIVED_SONG";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedLibraryArtist : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.numSongs = b.data.songs.length;
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  b.dataKey = "FEED_ADD_LIBRARY_ARTIST";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedLibraryAlbum : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  c.numSongs = b.data.songs.length;
  b.dataKey = "FEED_ADD_LIBRARY_ALBUM";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedLibrarySongs : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.song = ["<a class=\"songLink\">", _.cleanText(b.data.songs[0].songName), "</a>"].join("");
  c.artist = ["<a href=\"", _.cleanUrl(b.data.songs[0].artistName, b.data.songs[0].artistID, "artist"), "\">", _.cleanText(b.data.songs[0].artistName), "</a>"].join("");
  c.album = ["<a href=\"", _.cleanUrl(b.data.songs[0].albumName, b.data.songs[0].albumID, "album"), "\">", _.cleanText(b.data.songs[0].albumName), "</a>"].join("");
  if (b.data.songs.length > 2)
    {
      b.dataKey = "FEED_ADD_LIBRARY_SONGS_MANY";
      c.numSongs = b.data.songs.length - 1;
    }
  else
    if (b.data.songs.length == 2)
      {
        c.song2 = ["<a class=\"songLink\">", _.cleanText(b.data.songs[1].songName), "</a>"].join("");
        b.dataKey = "FEED_ADD_LIBRARY_SONGS_TWO";
      }
    else
      if (b.data.songs.length == 1)
        b.dataKey = "FEED_ADD_LIBRARY_SONG";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedSharePlaylist : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  b.dataKey = "FEED_SHARE_PLAYLIST";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), feedSharePlaylistReceived : (function (b)
{
  var c = {};
  c.user = GS.Models.FeedEvent.getUserLink(b.user);
  c.playlist = ["<a href=\"", _.cleanUrl(b.data.playlist.playlistName, b.data.playlist.playlistID, "playlist"), "\">", _.cleanText(b.data.playlist.playlistName), "</a>"].join("");
  c.friend = ["<a href=\"", _.cleanUrl(b.data.user.username, b.data.user.userID, "user"), "\">", _.cleanText(b.data.user.username), "</a>"].join("");
  b.dataKey = "FEED_SHARE_PLAYLIST_RECEIVED";
  return new GS.Models.DataString(a.localize.getString(b.dataKey), c);
}
), getUserLink : (function (b)
{
  return ["<a href=\"", b.toUrl(), "\">", b.Username, "</a>"].join("");
}
)}, {user : null, time : null, date : null, weight : 0, data : null, type : 0, dataString : null, dataKey : null, validate : (function ()
{
  return true;
}
), init : (function (b)
{
  this._super(b);
  if (! GS.Models.FeedEvent.FeedTypes)
    GS.Models.FeedEvent.FeedTypes = GS.Models.FeedEvent.getTypes();
}
), getKey : (function ()
{
  return this.user.UserID + "-" + this.type + "-" + this.time;
}
), getDataString : (function ()
{
  this.dataString = this.type && GS.Models.FeedEvent.FeedTypes[this.type] ? GS.Models.FeedEvent.FeedTypes[this.type](this) : null;
}
), toHTML : (function ()
{
  this.type && ! this.dataString && this.getDataString();
  return this.dataString ? this.dataString.render() : "";
}
), playSongs : (function (b,c)
{
  c = _.orEqual(c, false);
  if (this.data.songs && this.data.songs.length)
    {
      var d = [];
      GS.Models.Song.wrapFeed(this.data.songs);
      for (f in this.data.songs)
        this.data.songs.hasOwnProperty(f) && d.push(this.data.songs[f].songID);
      GS.player.addSongsToQueueAt(d, b, c);
    }
}
), remove : (function (b,c)
{
  this.user.UserID == GS.user.UserID ? GS.service.feedsRemoveEventFromProfile(this.type, this.time, b, c) : GS.service.removeItemFromCommunityFeed(this.getKey(), this.date.format("Ymd"), b, c);
}
), toString : (function ()
{
  return ["Feed. type:", this.type, ", usname: ", this.user.UserName].join("");
}
)});
}
)(jQuery);
  (function (a)
{
  var b;
  GS.Models.Base.extend("GS.Models.Theme", {}, {themeID : null, version : "1.0", title : "Unknown", author : "Grooveshark", location : "default", vip : false, sponsored : false, sections : null, assetLocation : "", clickIDs : null, tracking : null, pageTracking : null, misc : null, videos : null, CSS : "css", TOP : "top", BOTTOM : "bottom", CENTER : "center", LEFT : "left", RIGHT : "right", AUTO : "auto", SCALEX : "scalex", SCALEY : "scaley", init : (function (c)
{
  b = this;
  c && this._super(c);
  this.assetLocation = "/themes/" + c.location + "/assets/";
}
), bindAssets : (function (c)
{
  var d, f, g, h, o, p, q = 0, t, A = a(c).attr("id");
  a(c).children().each((function ()
{
  a(this).is(".flash") || a(this).click(b.callback("handleClick"));
  if (a(this).is(".flash"))
    {
      d = _.orEqual(a(this).attr("data-flash-wmode"), "opaque");
      f = _.orEqual(a(this).attr("data-flash-width"), "100%");
      g = _.orEqual(a(this).attr("data-flash-height"), "100%");
      if ((h = _.orEqual(a(this).attr("data-flash-src"), null)) && a(this).attr("id"))
        {
          t = A + "-flash-" + q++;
          a(this).append("<div id=\"" + t + "\"></div>");
          swfobject.embedSWF(b.assetLocation + h + "?ver=" + b.version + "&themeID=" + b.themeID + "&currentTarget=#" + a(this).attr("id"), t, f, g, "9.0.0", null, null, {wmode : d});
        }
    }
  else
    if (a(this).is(".img"))
      if (p = _.orEqual(a(this).attr("data-img-src"), null))
        {
          o = new Image();
          a(this).append(a(o).load(b.callback("onImageLoad", c)).css("visibility", "hidden").attr("src", gsConfig.assetHost + b.assetLocation + p + "?ver=" + b.version));
        }
}
));
}
), onImageLoad : (function (c,d)
{
  var f = a(d.currentTarget), g = f.is("[display=none]");
  f.show();
  setTimeout((function ()
{
  f.css("visibility", "visible").attr("data-img-width", f.width()).attr("data-img-height", f.height());
  g && f.hide();
  b.position(c);
}
), 0);
}
), position : (function (c)
{
  var d, f, g, h, o, p, q, t, A, B, s, G, H, w, u, x, y, D, k = a(c).height(), m = a(c).width();
  a(c).children(".img").each((function ()
{
  d = a(this);
  f = d.find("img");
  g = _.orEqual(parseInt(f.attr("data-img-width")), 0);
  h = _.orEqual(parseInt(f.attr("data-img-height")), 0);
  if (g && h)
    {
      y = _.orEqual(d.attr("data-img-top"), 0);
      D = _.orEqual(d.attr("data-img-bottom"), 0);
      u = _.orEqual(d.attr("data-img-left"), 0);
      x = _.orEqual(d.attr("data-img-right"), 0);
      p = m - u - x;
      o = k - y - D;
      A = parseInt(_.orEqual(d.attr("data-img-min-width"), 0));
      q = parseInt(_.orEqual(d.attr("data-img-min-height"), 0));
      t = parseInt(_.orEqual(d.attr("data-img-max-height"), o));
      maxWidth = parseInt(_.orEqual(d.attr("data-img-max-width"), p));
      B = _.orEqual(d.attr("data-img-proportional"), true);
      switch (d.attr("data-img-scale"))
      {
        case "scalex":
          f.width(Math.min(Math.max(A, p), maxWidth));
          B ? f.height(Math.round(f.width() / g * h)) : f.height(Math.min(Math.max(q, Math.round(o), t)));
          break ;
        case "scaley":
          f.height(Math.min(Math.max(q, o), t));
          B ? f.width(Math.round(f.height() / h * g)) : f.width(Math.min(Math.max(A, Math.round(p), maxWidth)));
          break ;
        case "auto":
        default:
          if (B)
            {
              s = Math.max(p / g, o / h);
              f.width(Math.round(s * g));
              f.height(Math.round(s * h));
            }
          else
            {
              f.width(Math.round(p / g * g));
              f.height(Math.round(o / h * h));
            }
          break ;
      }
      G = _.orEqual(d.attr("data-pos-x"), b.CENTER);
      H = _.orEqual(d.attr("data-pos-y"), b.CENTER);
      switch (G)
      {
        case b.LEFT:
          w = isNaN(u) ? u : u + "px";
          f.css(b.LEFT, w);
          break ;
        case b.RIGHT:
          w = isNaN(x) ? x : x + "px";
          f.css(b.RIGHT, w);
          break ;
        case b.CENTER:
          f.css(b.LEFT, Math.round((p - f.width()) / 2) + "px");
          break ;
      }
      switch (H)
      {
        case b.TOP:
          w = isNaN(y) ? y : y + "px";
          f.css(b.TOP, w);
          break ;
        case b.BOTTOM:
          w = isNaN(D) ? D : D + "px";
          f.css(b.BOTTOM, w);
          break ;
        case b.CENTER:
          f.css(b.TOP, Math.round((o - f.height()) / 2) + "px");
          break ;
      }
    }
}
));
}
), handleClick : (function (c)
{
  console.log("theme click", c);
  var d = a(c.currentTarget), f;
  switch (d.attr("data-click-action"))
  {
    case "playSong":
      (c = d.attr("data-song-id")) && a.publish("gs.song.play", {songID : c, playOnAdd : true});
      break ;
    case "playAlbum":
      (c = d.attr("data-album-id")) && a.publish("gs.album.play", {albumID : c, playOnAdd : true});
      break ;
    case "playPlaylist":
      (c = d.attr("data-playlist-id")) && a.publish("gs.playlist.play", {playlistID : c, playOnAdd : true});
      break ;
    case "playStation":
      c = d.attr("data-station-id");
      f = d.attr("data-station-name");
      if (c && f)
        {
          GS.theme.extraStations[c] = f;
          a.publish("gs.station.play", {tagID : c, stationName : f});
        }
      break ;
    case "playVideo":
      c = new GS.Models.Video({swf : d.attr("data-video-src"), title : _.orEqual(d.attr("data-video-title"), null), author : _.orEqual(d.attr("data-video-author"), null)});
      c.swf.length && GS.lightbox.open("video", {video : c});
      break ;
    case "playVideos":
      if (b.videos && b.videos.length)
        {
          c = _.orEqual(c.index % b.videos.length, 0);
          GS.lightbox.open("video", {video : b.videos[c], videos : b.videos, index : c});
        }
      break ;
    default:
      console.log("no action provided");
      break ;
  }
  d.attr("data-click-id") && GS.service.logThemeOutboundLinkClick(b.themeID, d.attr("data-click-id"));
}
)});
}
)(jQuery);
  (function ()
{
  GS.Models.Base.extend("GS.Models.Event", {}, {EventID : 0, City : "", EventName : "", StartTime : "", TicketsURL : "", VenueName : "", ArtistName : "", init : (function (a)
{
  this._super(a);
  this.TicketsURL += "?utm_source=1&utm_medium=partner";
}
)});
}
)(jQuery);
  (function (a)
{
  GS.Models.Base.extend("GS.Models.UserSettings", {NOTIF_EMAIL_USER_FOLLOW : 1, NOTIF_EMAIL_INVITE_SIGNUP : 2, NOTIF_EMAIL_PLAYLIST_SUBSCRIBE : 16, NOTIF_EMAIL_NEW_FEATURE : 4096, RSS_LISTENS : 2, RSS_FAVORITES : 1}, {UserID : 0, local : {restoreQueue : 0, lowerQuality : 0, noPrefetch : 0, playPauseFade : 0, crossfadeAmount : 5000, crossfadeEnabled : 0, tooltips : 0, persistShuffle : 1, lastShuffle : 0}, FName : "", Email : "", Country : "", Zip : "", Sex : "", TSDOB : "", FeedsDisabled : 0, NotificationEmailPrefs : 0, emailNotifications : {userFollow : true, inviteSignup : true, playlistSubscribe : true, newFeature : true}, rssFeeds : {listens : true, favorites : true}, _hasLoadedSettings : false, init : (function (b)
{
  this._super(b);
  this.local.restoreQueue = store.get("player.restoreQueue" + this.UserID) || 0;
  this.local.lowerQuality = store.get("player.lowerQuality" + this.UserID) || 0;
  this.local.noPrefetch = store.get("player.noPrefetch" + this.UserID) || 0;
  this.local.playPauseFade = store.get("player.playPauseFade" + this.UserID) || 0;
  this.local.crossfadeAmount = store.get("player.crossfadeAmount" + this.UserID) || 5000;
  this.local.crossfadeEnabled = store.get("player.crossfadeEnabled" + this.UserID) || 0;
  this.local.lastShuffle = store.get("player.lastShuffle" + this.UserID) || 0;
  this.local.persistShuffle = store.get("player.persistShuffle" + this.UserID) || 1;
  this.local.tooltips = store.get("user.tooltips" + this.UserID) || 0;
  if (this.UserID <= 0)
    this._hasLoadedSettings = true;
}
), getUserSettings : (function (b,c)
{
  console.log("user_settings.get", this.UserID);
  if (this.UserID)
    if (this._hasLoadedSettings)
      a.isFunction(b) && b(this);
    else
      GS.service.getUserSettings(this.callback(this._onSettingsSuccess, b), this.callback(this._onSettingsFailed, c));
}
), _onSettingsSuccess : (function (b,c)
{
  console.log("user_settings.get.success", c);
  if (c.hasOwnProperty("userInfo"))
    {
      a.extend(this, c.userInfo);
      if (this.hasOwnProperty("LName") && this.hasOwnProperty("FName"))
        {
          this.LName = a.trim(this.LName);
          this.FName = a.trim(this.FName);
          if (this.LName)
            {
              this.FName += " " + this.LName;
              this.FName = a.trim(this.FName);
            }
          delete this.LName;
        }
      this.NotificationEmailPrefs = parseInt(this.NotificationEmailPrefs, 10);
      this.FeedsDisabled = parseInt(this.FeedsDisabled, 10);
      this._updateBitmaskProps();
    }
  this.hasLoadedSettings = true;
  a.isFunction(b) && b(this);
}
), _onSettingsFailed : (function (b,c)
{
  console.log("user_settings.get.failed", c);
  a.isFunction(b) && b(this);
}
), _updateBitmaskProps : (function ()
{
  this.emailNotifications = {userFollow : ! (this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_USER_FOLLOW), inviteSignup : ! (this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_INVITE_SIGNUP), playlistSubscribe : ! (this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_PLAYLIST_SUBSCRIBE), newFeature : ! (this.NotificationEmailPrefs & GS.Models.UserSettings.NOTIF_EMAIL_NEW_FEATURE)};
  this.rssFeeds = {listens : ! (this.FeedsDisabled & GS.Models.UserSettings.RSS_LISTENS), favorites : ! (this.FeedsDisabled & GS.Models.UserSettings.RSS_FAVORITES)};
}
), updateProfile : (function (b,c,d)
{
  b = a.extend({}, {FName : this.FName, Email : this.Email, Country : this.Country, Zip : this.Zip, Sex : this.Sex, TSDOB : this.TSDOB}, b);
  console.log("save profile post extend", b);
  GS.service.changeUserInfo(b.FName, "", b.Email, b.Country, b.zip, b.Sex, b.TSDOB, this.callback(this._saveProfileSuccess, b, c), this.callback(this._saveProfileFailed, d));
}
), _saveProfileSuccess : (function (b,c,d)
{
  console.log("user_settings.save.success", d);
  a.extend(this, b);
  a.isFunction(c) && c(this);
}
), _saveProfileFailed : (function (b,c)
{
  console.log("user_settings.save.failed", c);
  a.isFunction(b) && b(c);
}
), changeNotificationSettings : (function (b,c,d)
{
  b = a.extend({}, this.emailNotifications, b);
  b = (b.userFollow ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_USER_FOLLOW) | (b.inviteSignup ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_INVITE_SIGNUP) | (b.playlistSubscribe ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_PLAYLIST_SUBSCRIBE) | (b.newFeature ? 0 : GS.Models.UserSettings.NOTIF_EMAIL_NEW_FEATURE);
  GS.service.changeNotificationSettings(b, this.callback(this._notificationsSuccess, b, c), this.callback(this._notificationsFailed, d));
}
), _notificationsSuccess : (function (b,c,d)
{
  console.log("user_settings.notifications.success", d);
  this.NotificationEmailPrefs = b;
  this._updateBitmaskProps();
  a.isFunction(c) && c(this);
}
), _notificationsFailed : (function (b,c)
{
  console.log("user_settings.notifications.failed", c);
  a.isFunction(b) && b(c);
}
), changeRSSSettings : (function (b,c,d)
{
  b = a.extend({}, this.rssFeeds, b);
  b = (b.listens ? 0 : GS.Models.UserSettings.RSS_LISTENS) | (b.favorites ? 0 : GS.Models.UserSettings.RSS_FAVORITES);
  GS.service.changeFeedSettings(b, this.callback(this._notificationsSuccess, b, c), this.callback(this._notificationsFailed, d));
}
), _rssSuccess : (function (b,c,d)
{
  console.log("user_settings.rss.success", d);
  this.FeedsDisabled = b;
  this._updateBitmaskProps();
  a.isFunction(c) && c(this);
}
), _rssFailed : (function (b,c)
{
  console.log("user_settings.rss.failed", c);
  a.isFunction(b) && b(c);
}
), changeLocalSettings : (function (b,c)
{
  a.extend(this.local, b);
  store.set("player.restoreQueue" + this.UserID, this.local.restoreQueue);
  store.set("player.lowerQuality" + this.UserID, this.local.lowerQuality);
  store.set("player.noPrefetch" + this.UserID, this.local.noPrefetch);
  store.set("player.playPauseFade" + this.UserID, this.local.playPauseFade);
  store.set("player.crossfadeAmount" + this.UserID, this.local.crossfadeAmount);
  store.set("player.crossfadeEnabled" + this.UserID, this.local.crossfadeEnabled);
  store.set("player.lastShuffle" + this.UserID, this.local.lastShuffle);
  store.set("player.persistShuffle" + this.UserID, this.local.persistShuffle);
  store.set("user.tooltips" + this.UserID, this.local.tooltips);
  a.publish("gs.settings.local.update", this.local);
  a.isFunction(c) && c(this);
}
)});
}
)(jQuery);
  (function ()
{
  GS.Models.Base.extend("GS.Models.Video", {}, {title : "", author : "", swf : "/webincludes/flash/videoplayer.swf", src : "", thumb : null, width : 480, height : 385, flashvars : {version : gsConfig.coreVersion}, params : {allowscriptaccess : true, allowfullscreen : true}, attributes : {name : "videoPlayer"}, object : null, init : (function (a)
{
  a && this._super(a);
}
), embed : (function (a)
{
  object = swfobject.embedSWF(this.swf, a, this.width, this.height, "9.0.0", null, this.flashvars, this.params, this.attributes);
}
)});
}
)(jQuery);
  $.extend($.View.EJS.Helpers.prototype, {localeTag : (function (a,b,c)
{
  c = c || {};
  c["data-translate-text"] = b;
  return [this.tag(a, c), $.localize.getString(b), this.tagEnd(a)].join("");
}
), tag : (function (a,b,c)
{
  var d = ["<" + a];
  _.forEach(b, (function (f,g)
{
  d.push(" " + g + "=\"" + f + "\"");
}
));
  d.push(c || ">");
  return d.join("");
}
), tagEnd : (function (a)
{
  return ["</", a, ">"].join("");
}
)});
  jQuery.Controller.extend("GS.Controllers.BaseController", {init : (function ()
{
  this._super();
  if (this.onWindow)
    new this($(window));
  else
    this.onElement && new this($(this.onElement));
}
), instance : (function ()
{
  if (this.onDocument)
    return $(document.documentElement).controller(this._shortName);
  if (this.onWindow)
    return $(window).controller(this._shortName);
  if (this.onElement)
    return $(this.onElement).controller(this._shortName);
  if (this.hasActiveElement)
    return $(this.hasActiveElement).controller(this._shortName);
  throw "BaseController. controller, " + this._shortName + ", is improperly embedded on page";
}
), viewBundles : {}, bundleVersions : {}}, {subscriptions : [], detach : (function ()
{
  if (! this._detached)
    {
      var a = this, b = this.Class._fullName;
      $.each(this._bindings, (function (c,d)
{
  $.isFunction(d) && d(a.element[0]);
}
));
      this._bindings = [];
      this.element.removeClass(b);
      for ((b = this.element.find(".gs_grid:last").controller()) && b.grid.destroy();this.subscriptions.length;)
        $.unsubscribe(this.subscriptions.pop());
      this._detached = true;
    }
}
), reattach : (function ()
{
  if (this._detached)
    {
      var a = this.Class;
      this.element.addClass(a._fullName);
      for (b in a.actions)
        {
          ready = a.actions[b] || a._getAction(b, this.options);
          this._bindings.push(ready.processor(this.element, ready.parts[2], ready.parts[1], this.callback(b), this));
        }
      this._detached = false;
    }
}
), subscribe : (function (a,b,c)
{
  (c = _.orEqual(c, true)) ? this.subscriptions.push($.subscribe(a, b)) : $.subscribe(a, b);
}
), view : (function (a,b,c,d)
{
  var f = ["gs", "views"];
  if (a.match(/^themes/))
    f = [a];
  else
    if (a.match(/^\//))
      f.push(a.replace(/^\//, ""));
    else
      {
        f.push(this.Class._shortName);
        f.push(a);
      }
  f = "/" + f.join("/");
  f += $.View.ext;
  var g = f.replace(/[\/\.]/g, "_").replace(/_+/g, "_").replace(/^_/, ""), h = GS.Controllers.BaseController.viewBundles[g], o = GS.Controllers.BaseController.bundleVersions[h] || "", p = "", q = true;
  b = _.orEqual(b, this);
  c = this.calculateHelpers.call(this, c);
  if ($.View.preCached[g] || ! h)
    return $.View(f, b, c);
  d = _.orEqual(d, 0);
  if (! (d >= 3))
    {
      if (d > 0)
        q = false;
      $.ajax({contentType : "application/json", dataType : "json", type : "GET", url : "/gs/views/" + h + ".json?" + o, async : false, cache : q, success : this.callback((function (t)
{
  if (t)
    {
      _.forEach(t, (function (A,B)
{
  $.View.preCached[B] = A;
}
));
      p = $.View(f, b, c);
    }
  else
    {
      d++;
      setTimeout(this.callback((function ()
{
  this.view(a, b, c, d);
}
)), 100 + d * 100);
    }
}
)), error : this.callback((function ()
{
  d++;
  setTimeout(this.callback((function ()
{
  this.view(a, b, c, d);
}
)), 100 + d * 100);
}
))});
      return p;
    }
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.AirbridgeController", {onDocument : true}, {isDesktop : false, _bridge : null, oldWindowOpen : null, init : (function ()
{
  if (window.parentSandboxBridge)
    {
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
      $("body").delegate("a[target=\"_blank\"]", "click", (function (b)
{
  if (! $(b.target).closest("a").hasClass("airNoFollow"))
    {
      b.preventDefault();
      b = $(b.target).closest("a").attr("href");
      a._bridge.consoleWarn(b);
      b && a._bridge.navigateToUrl(b, "_blank");
      return false;
    }
}
));
      this.oldWindowOpen = window.open;
      window.open = (function (b,c,d)
{
  d = _.orEqual(d, "width=800,height=600");
  c == "_blank" ? a._bridge.navigateToUrl(b, c) : a.oldWindowOpen.call(window, b, c, d);
}
);
    }
}
), _lastStatus : null, _onPlayStatus : (function (a)
{
  if (a && this._lastStatus)
    if (a.status === this._lastStatus.status)
      if (! a.activeSong && ! this._lastStatus.activeSong)
        {
          this._lastStatus = a;
          return ;
        }
      else
        if (a.activeSong && this._lastStatus.activeSong)
          if (a.activeSong.songID == this._lastStatus.activeSong.songID && a.activeSong.autoplayVote == this._lastStatus.activeSong.autoplayVote)
            {
              this._lastStatus = a;
              return ;
            }
  this._lastStatus = a;
  this._bridge && this._bridge.playerChange();
}
), _onQueueChange : (function ()
{
  this._bridge && this._bridge.playerChange();
}
), _onFavLibChanged : (function (a)
{
  if (a && GS.player.queue && GS.player.queue.activeSong && parseInt(a.SongID, 10) == parseInt(GS.player.queue.activeSong.SongID, 10))
    {
      GS.player.queue.activeSong.isFavorite = a.isFavorite;
      GS.player.queue.activeSong.fromLibrary = a.fromLibrary;
      this._bridge && this._bridge.playerChange();
    }
}
), ready : (function ()
{
  this._bridge && this._bridge.ready();
}
), getDesktopPreferences : (function ()
{
  return this._bridge ? this._bridge.getDesktopPreferences() : null;
}
), setDesktopPreferences : (function (a)
{
  this._bridge && this._bridge.setDesktopPreferences(a);
}
), displayNotification : (function (a,b)
{
  $.publish("gs.notification", {type : a, message : $.localize.getString(b)});
}
), getQueueStatus : (function ()
{
  var a = GS.player.getCurrentQueue(true);
  a || (a = {});
  if (a.activeSong)
    {
      a.activeSong.url = "http://listen.grooveshark.com/" + a.activeSong.toUrl().replace("#/", "");
      a.activeSong.imageUrl = a.activeSong.getImageURL();
    }
  a.playStatus = GS.player.lastStatus;
  return a;
}
), setHash : (function (a)
{
  window.location.hash = a;
}
), safeToClose : (function ()
{
  return window.onbeforeunload();
}
), addSongsToQueueAt : (function ()
{
  return GS.player.addSongsToQueueAt.apply(GS.player, arguments);
}
), playSong : (function ()
{
  return GS.player.playSong.apply(GS.player, arguments);
}
), pauseSong : (function ()
{
  return GS.player.pauseSong.apply(GS.player, arguments);
}
), resumeSong : (function ()
{
  return GS.player.resumeSong.apply(GS.player, arguments);
}
), stopSong : (function ()
{
  return GS.player.stopSong.apply(GS.player, arguments);
}
), previousSong : (function ()
{
  return GS.player.previousSong.apply(GS.player, arguments);
}
), nextSong : (function ()
{
  return GS.player.nextSong.apply(GS.player, arguments);
}
), flagSong : (function ()
{
  return GS.player.flagSong.apply(GS.player, arguments);
}
), voteSong : (function ()
{
  return GS.player.voteSong.apply(GS.player, arguments);
}
), getIsMuted : (function ()
{
  return GS.player.getIsMuted.apply(GS.player, arguments);
}
), setIsMuted : (function ()
{
  return GS.player.setIsMuted.apply(GS.player, arguments);
}
), getVolume : (function ()
{
  return GS.player.getVolume.apply(GS.player, arguments);
}
), setVolume : (function ()
{
  return GS.player.setVolume.apply(GS.player, arguments);
}
), getShuffle : (function ()
{
  return GS.player.getShuffle.apply(GS.player, arguments);
}
), setShuffle : (function ()
{
  return GS.player.setShuffle.apply(GS.player, arguments);
}
), setAutoplay : (function ()
{
  return GS.player.setAutoplay.apply(GS.player, arguments);
}
), clearQueue : (function ()
{
  return GS.player.clearQueue.apply(GS.player, arguments);
}
), getRepeat : (function ()
{
  return GS.player.getRepeat.apply(GS.player, arguments);
}
), setRepeat : (function ()
{
  return GS.player.setRepeat.apply(GS.player, arguments);
}
), addPlaylist : (function (a,b,c)
{
  GS.Models.Playlist.getPlaylist(a, (function (d)
{
  d.play(b, c);
}
), null, false);
}
), addSongFromToken : (function (a,b,c)
{
  GS.Models.Song.getSongFromToken(a, (function (d)
{
  GS.player.addSongsToQueueAt([d.SongID], b, c);
}
), null, false);
}
), favoriteSong : (function (a)
{
  GS.user.addToSongFavorites(a);
}
), unfavoriteSong : (function (a)
{
  GS.user.removeFromSongFavorites(a);
}
), addSongToLibrary : (function (a)
{
  GS.user.addToLibrary([a]);
}
), removeSongFromLibrary : (function (a)
{
  GS.user.removeFromLibrary(a);
}
), executeProtocol : (function (a)
{
  GS.Controllers.ApiController.instance().executeProtocol(a);
}
)});
  (function ()
{
  function a(k,m,n,r,v,z,C,E)
  {
    this.methodName = k;
    this.parameters = _.orEqual(m, {});
    this.useHTTPS = _.orEqual(C, false);
    this.useSWF = _.orEqual(E, false);
    this.callback = _.orEqual(n, null);
    this.errback = _.orEqual(r, null);
    this.overrideEndpoint = _.orEqual(z, null);
    this.overrideHeaders = {};
    this.options = _.orEqual(v, {});
    this.type = "normal";
    this.failedAuth = false;
  }
  function b(k,m,n,r,v)
  {
    this.method = _.orEqual(k, "");
    this.parameters = _.orEqual(m, {});
    this.httpMethod = _.orEqual(n, "POST");
    this.callback = _.orEqual(r, null);
    this.errback = _.orEqual(v, null);
    this.type = "facebook";
  }
  function c(k,m,n,r)
  {
    this.method = k;
    this.parameters = _.orEqual(m, {});
    this.callback = _.orEqual(n, null);
    this.errback = _.orEqual(r, null);
    this.type = "lastfm";
  }
  function d(k,m)
  {
    var n = true, r = new Date();
    m = _.orEqual(m, 0);
    if (m >= 3)
      console.error("service.sendRequest. numRetries maxed out. ", k);
    else
      {
        if (m > 0)
          n = false;
        GS.service = GS.service || GS.Controllers.ServiceController.instance();
        if (k.type == "facebook" || k.type == "lastfm")
          if ($.isFunction(GS.service.swfProxy))
            {
              n = o();
              GS.service.outgoingSWFCalls[n] = k;
              console.log("swfproxy:", k, {}, n);
              GS.service.swfProxy(k, {}, n);
            }
          else
            GS.service.callsPendingSWF.push(k);
        else
          if (GS.service.tokenExpires > r.valueOf() || k.methodName == "getCommunicationToken" || k.methodName == "initiateSession" || k.methodName == "getServiceStatus")
            if (GS.service.downForMaintenance && k.methodName != "getServiceStatus")
              $.isFunction(k.errback) && k.errback({message : $.localize.getString("SERVICE_DOWN_MAINTENANCE"), code : GS.service.faultCodes.MAINTENANCE});
            else
              {
                r = "more.php";
                if (GS.service.runMode === "dev")
                  r = "proxy.php";
                var v = "http://" + GS.service.hostname + "/" + r + "?" + k.methodName, z = {header : H(k.overrideHeaders), method : k.methodName, parameters : k.parameters};
                if (GS.service.currentToken)
                  {
                    GS.service.lastRandomizer = h();
                    r = hex_sha1(k.methodName + ":" + GS.service.currentToken + ":quitStealinMahShit:" + GS.service.lastRandomizer);
                    z.header.token = GS.service.lastRandomizer + r;
                  }
                if (k.useSWF || k.useHTTPS)
                  if ($.isFunction(GS.service.swfProxy))
                    {
                      n = o();
                      GS.service.outgoingSWFCalls[n] = k;
                      console.log("swfproxy:", k, z.header, n);
                      GS.service.swfProxy(k, z.header, n);
                    }
                  else
                    GS.service.callsPendingSWF.push(k);
                else
                  $.ajax($.extend(k.options, {contentType : "application/json", dataType : "json", type : "POST", data : JSON.stringify(z), cache : n, url : v, success : (function (C,E)
{
  console.log("ajax success: " + v + ", status: " + E + ", request: ", z, C);
  if (C)
    f(C, k);
  else
    {
      m++;
      console.error("service.success NO DATA.  retry request again", k);
      setTimeout((function ()
{
  d(k, m);
}
), 100 + m * 100);
    }
}
), error : (function (C,E,F)
{
  console.error("ajax error: status: " + E + ", error: " + F, C, k);
  C = {};
  switch (E)
  {
    case "parsererror":
      C.code = GS.service.faultCodes.PARSE_ERROR;
      C.message = $.localize.getString("SERVICE_PARSE_JSON");
      break ;
    case "timeout":
      C.code = GS.service.faultCodes.HTTP_TIMEOUT;
      C.message = $.localize.getString("SERVICE_REQUEST_TIMEOUT");
      m++;
      console.error("service.sendRequest.error.timeout.  retry request again", k);
      setTimeout((function ()
{
  d(k, m);
}
), 100 + m * 100);
      return ;
    case "error":
    case "notmodified":
    default:
      C.code = GS.service.faultCodes.HTTP_ERROR;
      C.message = $.localize.getString("SERVICE_HTTP_ERROR");
      break ;
  }
  $.isFunction(k.errback) && k.errback(C);
}
)}));
              }
          else
            {
              GS.service.callsPendingToken.push(k);
              GS.service.tokenPending || p();
            }
      }
  }
  function f(k,m)
  {
    if (k && k.header)
      {
        var n = k.header.session;
        if (n && n != GS.service.sessionID)
          {
            GS.service.sessionID = n;
            p();
          }
        n = k.header.secondsUntilDowntime;
        if (n < 0)
          setTimeout(u, 5000);
        else
          if (n > 0)
            {
              n = Math.floor(n / 60);
              var r = new Date().valueOf();
              if (n <= 60)
                if (lastDowntimeNotification == 0 || n > 30 && r - lastDowntimeNotification > 3600000 || n <= 30 && n > 15 && r - lastDowntimeNotification > 1800000 || n <= 15 && n > 10 && r - lastDowntimeNotification > 900000 || n <= 10 && n > 5 && r - lastDowntimeNotification > 600000 || n <= 5 && r - lastDowntimeNotification > 300000)
                  {
                    lastDowntimeNotification = r;
                    n = new GS.Models.DataString($.localize.getString("NOTIFICATION_MAINTENANCE_WARNING"), {min : n});
                    $.publish("gs.notification", {type : "info", message : n});
                  }
            }
      }
    if (k && k.fault)
      g(k.fault, m);
    else
      $.isFunction(m.callback) && m.callback(k.result);
  }
  function g(k,m)
  {
    console.error("HANDLE FAULT CODE", k.code);
    if (k.code == GS.service.faultCodes.INVALID_TOKEN)
      {
        GS.service.callsPendingToken.push(m);
        GS.service.tokenPending || p();
      }
    else
      {
        if (k.code == GS.service.faultCodes.MAINTENANCE)
          setTimeout(u, 5000);
        else
          if (k.code == GS.service.faultCodes.INVALID_CLIENT)
            {
              console.log("INVALID CLIENT");
              GS.lightbox.open("invalidClient");
            }
          else
            if (k.code == GS.service.faultCodes.MUST_BE_LOGGED_IN)
              if (! m.failedAuth)
                {
                  m.failedAuth = true;
                  GS.service.callsPendingAuth.push(m);
                  if (! GS.service.reauthPending)
                    {
                      GS.service.reauthPending = true;
                      GS.service.reauthPending = true;
                      GS.auth.reauthenticate(s, G);
                    }
                  return ;
                }
        $.isFunction(m.errback) && m.errback(k);
      }
  }
  function h()
  {
    for (var k = "", m = 0;m < 6;m++)
      k += Math.floor(Math.random() * 16).toString(16);
    return k != GS.service.lastRandomizer ? k : h();
  }
  function o()
  {
    var k = String(Math.floor(Math.random() * 10000));
    return ! GS.service.outgoingSWFCalls[k] ? k : o();
  }
  function p()
  {
    GS.service.currentToken = null;
    GS.service.tokenExpires = 0;
    GS.service.tokenPending = true;
    if (GS.service.sessionID)
      {
        var k = hex_md5(GS.service.sessionID);
        req = new a("getCommunicationToken", {secretKey : k}, q, t, null, null, true);
      }
    else
      req = new a("initiateSession", {});
    d(req);
  }
  function q(k)
  {
    var m = new Date();
    GS.service.currentToken = k;
    GS.service.tokenPending = false;
    for (GS.service.tokenExpires = 1500000 + m.valueOf();GS.service.callsPendingToken.length;)
      {
        req = GS.service.callsPendingToken.shift();
        d(req);
      }
  }
  function t()
  {
    for (GS.service.tokenPending = false;GS.service.callsPendingToken.length;)
      {
        req = GS.service.callsPendingToken.shift();
        $.isFunction(req.errback) && req.errback({fault : {message : $.localize.getString("SERVICE_CREATE_TOKEN_FAIL"), code : GS.service.faultCodes.BAD_TOKEN}});
      }
  }
  function A(k)
  {
    GS.service = _.orEqual(GS.service, GS.Controllers.ServiceController.instance());
    for (GS.service.country = k ? k : {CC1 : 0, ID : 223, CC4 : 1073741824, CC3 : 0, CC2 : 0};GS.service.callsPendingCountry.length;)
      {
        req = GS.service.callsPendingCountry.shift();
        req.parameters.country = GS.service.country;
        d(req);
      }
  }
  function B()
  {
    for (GS.service.country = {CC1 : 0, ID : 223, CC4 : 1073741824, CC3 : 0, CC2 : 0};GS.service.callsPendingCountry.length;)
      {
        req = GS.service.callsPendingCountry.shift();
        req.parameters.country = GS.service.country;
        d(req);
      }
  }
  function s()
  {
    GS.service.reauthPending = false;
    for (var k;k = GS.service.callsPendingAuth.shift();)
      d(k);
  }
  function G()
  {
    GS.service.reauthPending = false;
    for (var k;k = GS.service.callsPendingAuth.shift();)
      $.isFunction(k.errback) && k.errback({code : GS.service.faultCodes.MUST_BE_LOGGED_IN, message : $.localize.getString("SERVICE_LOGIN_REQUIRED")});
  }
  function H(k)
  {
    k = _.orEqual(k, {});
    var m = {client : GS.service.client, clientRevision : GS.service.clientRevision, privacy : GS.service.privacy, country : GS.service.country, uuid : GS.service.uuID};
    if (GS.service.sessionID)
      m.session = GS.service.sessionID;
    return $.extend(m, k);
  }
  function w()
  {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function (k)
{
  var m = Math.random() * 16 | 0;
  return (k == "x" ? m : m & 3 | 8).toString(16);
}
)).toUpperCase();
  }
  function u()
  {
    if (! GS.service.downForMaintenance)
      {
        GS.service.downForMaintenance = true;
        GS.lightbox.open("maintenance");
        x();
      }
  }
  function x()
  {
    req = new a("getServiceStatus", {}, y, D);
    d(req);
  }
  function y(k)
  {
    console.log("maintenanceCallback", k);
    if (k.status == 1)
      {
        GS.service.downForMaintenance = false;
        GS.lightbox.close();
      }
    else
      setTimeout(x, 20000);
  }
  function D(k)
  {
    console.log("maintenanceCallback", k);
    setTimeout(x, 20000);
  }
  GS.Controllers.BaseController.extend("GS.Controllers.ServiceController", {onDocument : true}, {hostname : location.host, defaultEndpoint : "more.php", allowHTTPS : false, client : "htmlshark", clientRevision : "20101222", uuID : null, sessionID : null, country : null, privacy : 0, runMode : null, sharkletHost : null, currentToken : null, tokenExpires : 0, tokenPending : false, lastRandomizer : null, reauthPending : false, callsPendingToken : [], callsPendingAuth : [], callsPendingCountry : [], callsPendingSWF : [], outgoingSWFCalls : {}, swfProxy : null, downForMaintenance : false, lastDowntimeNotification : 0, faultCodes : {INVALID_CLIENT : 1024, RATE_LIMITED : 512, INVALID_TOKEN : 256, INVALID_SESSION : 16, MAINTENANCE : 10, MUST_BE_LOGGED_IN : 8, HTTP_TIMEOUT : 6, PARSE_ERROR : 4, HTTP_ERROR : 2}, init : (function ()
{
  this.sessionID = gsConfig.sessionID;
  this.clientRevision = gsConfig.revision;
  this.country = gsConfig.country;
  this.privacy = gsConfig.user.Privacy;
  this.uuID = w();
  this.runMode = gsConfig.runMode;
  this.sharkletHost = gsConfig.sharkletHost;
  if (! this.sessionID)
    {
      req = new a("initiateSession", {}, null, null, {async : false});
      d(req);
    }
  if (this.country)
    A(this.country);
  else
    {
      req = new a("getCountry", {}, A, B, {async : false});
      d(req);
    }
  return true;
}
), swfReady : (function ()
{
  for (var k = 0;k < this.callsPendingSWF.length;k++)
    d(this.callsPendingSWF[k]);
  this.callsPendingSWF = [];
}
), swfBadHost : (function ()
{
  GS.lightbox.open("badHost");
}
), swfSuccess : (function (k,m)
{
  var n = this.outgoingSWFCalls[m];
  console.log("swf success. result, key, request", k, m, n);
  if (n)
    n.type !== "normal" && $.isFunction(n.callback) ? n.callback(k) : f(k, n);
  delete this.outgoingSWFCalls[m];
}
), swfFault : (function (k,m)
{
  var n = this.outgoingSWFCalls[m];
  console.log("swf fault. fault, key, request", k, m, n);
  if (n)
    n.type !== "normal" && $.isFunction(n.errback) ? n.errback(k) : g(k, n);
  delete this.outgoingSWFCalls[m];
}
), swfNeedsToken : (function ()
{
  GS.service.tokenPending || p();
}
), httpsFormSubmit : (function (k,m)
{
  var n = $("#httpsForm");
  $("#httpsIframe");
  var r = [];
  console.error("httpsFormSubmit", k, m, n);
  n.html("");
  n.attr("action", k);
  n.attr("method", "post");
  n.attr("target", "httpsIframe");
  n.attr("enctype", "multipart/form-data");
  _.forEach(m, (function (v,z)
{
  r.push("<input type=\"hidden\" name=\"" + z + "\" value=\"" + v + "\" />");
}
));
  n.append(r.join(""));
  n.submit();
}
), isFirstVisit : (function (k)
{
  req = new a("isFirstVisit", {}, k, null, null, null, false, true);
  d(req);
}
), makeFacebookRequest : (function (k,m,n,r,v)
{
  req = new b(k, m, n, r, v);
  d(req);
}
), lastfmHandshake : (function (k,m,n)
{
  req = new c("handshake", k, m, n);
  d(req);
}
), lastfmNowPlaying : (function (k,m,n)
{
  req = new c("nowPlaying", k, m, n);
  d(req);
}
), lastfmSongPlay : (function (k,m,n)
{
  req = new c("submission", k, m, n);
  d(req);
}
), rapleafPersonalize : (function (k,m,n)
{
  req = new a("personalize", {redirectURL : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, false, true);
  req.type = "rapleaf";
  d(req);
}
), rapleafDirect : (function (k,m,n)
{
  req = new a("direct", {email : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, false, true);
  req.type = "rapleaf";
  d(req);
}
), getAlbumByID : (function (k,m,n)
{
  req = new a("getAlbumByID", {albumID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getArtistByID : (function (k,m,n)
{
  req = new a("getArtistByID", {artistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getPlaylistByID : (function (k,m,n)
{
  req = new a("getPlaylistByID", {playlistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getQueueSongListFromSongIDs : (function (k,m,n)
{
  req = new a("getQueueSongListFromSongIDs", {songIDs : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getSongFromToken : (function (k,m,n)
{
  req = new a("getSongFromToken", {token : k, country : this.country}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  this.country ? d(req) : this.callsPendingCountry.push(req);
}
), getTokenForSong : (function (k,m,n)
{
  req = new a("getTokenForSong", {songID : k, country : this.country}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  this.country ? d(req) : this.callsPendingCountry.push(req);
}
), getUserByID : (function (k,m,n)
{
  req = new a("getUserByID", {userID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUserByUsername : (function (k,m,n)
{
  req = new a("getUserByUsername", {username : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), albumGetSongs : (function (k,m,n,r,v)
{
  m = _.orEqual(m, true);
  n = _.orEqual(n, 0);
  req = new a("albumGetSongs", {albumID : k, isVerified : m, offset : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), artistGetAlbums : (function (k,m,n,r,v)
{
  req = new a("artistGetAlbums", {artistID : k, isVerified : m, offset : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), artistGetSongs : (function (k,m,n,r,v)
{
  req = new a("artistGetSongs", {artistID : k, isVerified : m, offset : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), playlistGetSongs : (function (k,m,n)
{
  req = new a("playlistGetSongs", {playlistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), popularGetSongs : (function (k,m,n)
{
  var r = arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)];
  {daily : true, weekly : true, monthly : true}[k] || (k = "daily");
  req = new a("popularGetSongs", {type : k}, m, n, r);
  d(req);
}
), getArtistsForTagRadio : (function (k,m,n)
{
  req = new a("getArtistsForTagRadio", {tagID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), albumGetFans : (function (k,m,n,r)
{
  req = new a("albumGetFans", {albumID : k, offset : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), artistGetFans : (function (k,m,n,r)
{
  req = new a("artistGetFans", {artistID : k, offset : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), playlistGetFans : (function (k,m,n)
{
  req = new a("playlistGetFans", {playlistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), songGetFans : (function (k,m,n,r)
{
  req = new a("songGetFans", {songID : k, offset : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), userGetFans : (function (k,m,n,r)
{
  req = new a("userGetFans", {userID : k, offset : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), authenticateUser : (function (k,m,n,r,v)
{
  req = new a("authenticateUser", {username : k, password : m, savePassword : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), authenticateFacebookUser : (function (k,m,n,r,v,z)
{
  req = new a("authenticateFacebookUser", {facebookUserID : k, sessionKey : m, accessToken1 : n, accessToken3 : r}, v, z, arguments[(arguments.length - 1)] === z ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), authenticateGoogleUser : (function (k,m)
{
  req = new a("authenticateGoogleUser", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), getStoredUsers : (function (k,m)
{
  req = new a("getStoredUsers", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, false, true);
  d(req);
}
), deleteStoredUser : (function (k,m,n)
{
  req = new a("deleteStoredUser", {username : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, false, true);
  d(req);
}
), loginStoredUser : (function (k,m,n)
{
  req = new a("loginStoredUser", {username : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), reportUserChange : (function (k,m,n,r,v)
{
  req = new a("reportUserChange", {userID : k, username : m, privacy : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)], null, false, true);
  d(req);
}
), killAuthToken : (function (k,m)
{
  req = new a("killAuthToken", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, false, true);
  d(req);
}
), logoutUser : (function (k,m)
{
  req = new a("logoutUser", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, false, true);
  d(req);
}
), userForgotPassword : (function (k,m,n)
{
  req = new a("userForgotPassword", {usernameOrEmail : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, true);
  d(req);
}
), changePassword : (function (k,m,n,r)
{
  req = new a("changePassword", {oldPassword : k, newPassword : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), registerUser : (function (k,m,n,r,v,z,C,E,F,J,I)
{
  req = new a("registerUser", {username : k, password : m, firstName : n, lastName : r, emailAddress : v, sex : z, birthDate : C, inviteID : E, savePassword : F}, J, I, arguments[(arguments.length - 1)] === I ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), userDisableAccount : (function (k,m,n,r,v,z)
{
  req = new a("userDisableAccount", {password : k, reason : m, details : n, contact : r}, v, z, arguments[(arguments.length - 1)] === z ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), getIsUsernameEmailAvailable : (function (k,m,n,r)
{
  req = new a("getIsUsernameEmailAvailable", {username : k, emailAddress : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUserByInviteID : (function (k,m,n)
{
  req = new a("getUserByInviteID", {inviteID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, true);
  d(req);
}
), sendInvites : (function (k,m,n)
{
  req = new a("sendInvites", {emailAddresses : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUserSettings : (function (k,m)
{
  req = new a("getUserSettings", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), changeUserInfo : (function (k,m,n,r,v,z,C,E,F)
{
  req = new a("changeUserInfo", {fName : k, lName : m, email : n, country : r, zip : v, sex : z, birthday : C}, E, F, arguments[(arguments.length - 1)] === F ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), changeUserFlags : (function (k,m,n,r)
{
  req = new a("changeUserFlags", {add : k, remove : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), changeNotificationSettings : (function (k,m,n)
{
  req = new a("changeNotificationSettings", {newValue : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), changePrivacySettings : (function (k,m,n)
{
  req = new a("changePrivacySettings", {newValue : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), changeFeedSettings : (function (k,m,n)
{
  req = new a("changeFeedSettings", {newValue : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getSubscriptionDetails : (function (k,m)
{
  req = new a("getSubscriptionDetails", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), userGetSongsInLibrary : (function (k,m,n,r)
{
  m = _.orEqual(m, 0);
  req = new a("userGetSongsInLibrary", {userID : k, page : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), userGetLibraryTSModified : (function (k,m,n)
{
  req = new a("userGetLibraryTSModified", {userID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), userAddSongsToLibrary : (function (k,m,n)
{
  req = new a("userAddSongsToLibrary", {songs : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), userRemoveSongFromLibrary : (function (k,m,n,r,v,z)
{
  req = new a("userRemoveSongFromLibrary", {userID : k, songID : m, albumID : n, artistID : r}, v, z, arguments[(arguments.length - 1)] === z ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getFavorites : (function (k,m,n,r)
{
  m = m || "Songs";
  req = new a("getFavorites", {userID : k, ofWhat : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), favorite : (function (k,m,n,r,v)
{
  req = new a("favorite", {what : k, ID : m, details : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), unfavorite : (function (k,m,n,r)
{
  req = new a("unfavorite", {what : k, ID : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUserSidebar : (function (k,m)
{
  req = new a("getUserSidebar", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), addShortcutToUserSidebar : (function (k,m,n,r)
{
  req = new a("addShortcutToUserSidebar", {what : k, id : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), removeShortcutFromUserSidebar : (function (k,m,n,r)
{
  req = new a("removeShortcutFromUserSidebar", {what : k, id : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), userGetPlaylists : (function (k,m,n)
{
  req = new a("userGetPlaylists", {userID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), createPlaylist : (function (k,m,n,r,v)
{
  req = new a("createPlaylist", {playlistName : k, songIDs : m, playlistAbout : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), deletePlaylist : (function (k,m,n,r)
{
  req = new a("deletePlaylist", {playlistID : k, name : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), playlistUndelete : (function (k,m,n)
{
  req = new a("playlistUndelete", {playlistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), overwritePlaylist : (function (k,m,n,r)
{
  req = new a("overwritePlaylist", {playlistID : k, songIDs : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), renamePlaylist : (function (k,m,n,r)
{
  req = new a("renamePlaylist", {playlistID : k, playlistName : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), setPlaylistAbout : (function (k,m,n,r)
{
  req = new a("setPlaylistAbout", {playlistID : k, about : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getSearchResultsEx : (function (k,m,n,r)
{
  req = new a("getSearchResultsEx", {query : k, type : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getSearchSuggestion : (function (k,m,n)
{
  req = new a("getSearchSuggestion", {query : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getArtistAutocomplete : (function (k,m,n)
{
  req = new a("getArtistAutocomplete", {query : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getProcessedUserFeedData : (function (k,m,n,r)
{
  req = new a("getProcessedUserFeedData", {userID : k, day : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getCombinedProcessedFeedData : (function (k,m,n,r,v)
{
  req = new a("getCombinedProcessedFeedData", {userIDs : k, day : m, loggedInUserID : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getRecentlyActiveUsers : (function (k,m)
{
  req = new a("getRecentlyActiveUsers", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), feedsBanArtist : (function (k,m,n)
{
  req = new a("feedsBanArtist", {artistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), feedsUnbanArtist : (function (k,m,n)
{
  req = new a("feedsUnbanArtist", {artistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), feedsGetBannedArtists : (function (k,m)
{
  req = new a("feedsGetBannedArtists", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), feedsRemoveEventFromProfile : (function (k,m,n,r)
{
  req = new a("feedsRemoveEventFromProfile", {type : k, time : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), removeItemFromCommunityFeed : (function (k,m,n,r)
{
  req = new a("removeItemFromCommunityFeed", {key : k, day : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), changeFollowFlags : (function (k,m,n)
{
  req = new a("changeFollowFlags", {userIDsFlags : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getIsTargetingActive : (function (k,m,n)
{
  req = new a("getIsTargetingActive", {themeID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), logTargetedThemeImpression : (function (k,m,n)
{
  req = new a("logTargetedThemeImpression", {themeID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), logThemeOutboundLinkClick : (function (k,m,n,r)
{
  req = new a("logThemeOutboundLinkClick", {themeID : k, linkID : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), provideSongFeedbackMessage : (function (k,m,n,r)
{
  req = new a("provideSongFeedbackMessage", {songID : k, message : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), provideSongFeedbackVote : (function (k,m,n,r,v)
{
  req = new a("provideSongFeedbackVote", {songID : k, vote : m, artistID : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), sendShare : (function (k,m,n,r,v,z,C,E)
{
  console.log("service sendShare", k, m, n, r, v, z);
  req = new a("sendShare", {what : k, ID : m, people : n, country : this.country, override : r, message : v}, C, E, arguments[(arguments.length - 1)] === E ? {} : arguments[(arguments.length - 1)]);
  if (z)
    req.overrideHeaders.privacy = 1;
  this.country ? d(req) : this.callsPendingCountry.push(req);
  GS.guts.logEvent("itemSharePerformed", {type : k, id : m});
}
), getContactInfoForFollowers : (function (k,m)
{
  req = new a("getContactInfoForFollowers", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), artistGetSongkickEvents : (function (k,m,n,r)
{
  req = new a("artistGetSongkickEvents", {artistID : k, name : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getGoogleAuthToken : (function (k,m,n,r)
{
  req = new a("getGoogleAuthToken", {Email : k, Passwd : m, source : "EscapeMG-Grooveshark-" + this.clientRevision}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)], null, true);
  d(req);
}
), getGoogleContacts : (function (k,m,n)
{
  req = new a("getGoogleContacts", {authToken : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, false, true);
  d(req);
}
), getDetailsForBroadcast : (function (k,m,n)
{
  req = new a("getDetailsForBroadcast", {songID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), broadcastSong : (function (k,m,n,r,v,z,C,E,F)
{
  req = new a("broadcastSong", {songID : k, message : m, username : n, password : r, saveCredentials : v, service : z, song : C}, E, F, arguments[(arguments.length - 1)] === F ? {} : arguments[(arguments.length - 1)], null, true);
  d(req);
}
), logBroadcast : (function (k,m,n,r,v)
{
  req = new a("logBroadcast", {type : k, item : m, service : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUserFacebookData : (function (k,m)
{
  req = new a("getUserFacebookDataEx", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, true);
  d(req);
}
), saveUserFacebookData : (function (k,m,n,r,v,z,C)
{
  console.log("SERVICE CALL saveUserFacebookDataEx");
  req = new a("saveUserFacebookDataEx", {facebookUserID : k, sessionKey : m, accessToken1 : n, accessToken3 : r, flags : v}, z, C, arguments[(arguments.length - 1)] === C ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), updateUserFacebookData : (function (k,m,n,r,v,z,C)
{
  console.log("SERVICE CALL updateUserFacebookData");
  req = new a("updateUserFacebookData", {facebookUserID : k, sessionKey : m, accessToken1 : n, accessToken3 : r, flags : v}, z, C, arguments[(arguments.length - 1)] === C ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), removeUserFacebookData : (function (k,m)
{
  req = new a("removeUserFacebookData", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUserGoogleData : (function (k,m)
{
  req = new a("getUserGoogleData", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), saveUserGoogleData : (function (k,m)
{
  req = new a("saveUserGoogleData", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), removeUserGoogleData : (function (k,m)
{
  req = new a("removeUserGoogleData", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getUsernameSuggestions : (function (k,m,n,r,v)
{
  req = new a("getUsernameSuggestions", {baseUsername : k, fullName : m, idOrRand : n}, r, v, arguments[(arguments.length - 1)] === v ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), registerFacebookUser : (function (k,m,n,r,v,z,C,E,F,J,I,L,K)
{
  req = new a("registerFacebookUser", {username : k, firstName : m, emailAddress : n, sex : r, birthDate : v, inviteID : z, facebookUserID : C, sessionKey : E, accessToken1 : F, accessToken3 : J, flags : I}, L, K, arguments[(arguments.length - 1)] === K ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), getGroovesharkUsersFromFacebookUserIDs : (function (k,m,n)
{
  req = new a("getGroovesharkUsersFromFacebookUserIDs", {facebookUserIDs : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), registerGoogleUser : (function (k,m,n,r,v,z,C,E,F)
{
  req = new a("registerGoogleUser", {flags : k, username : m, firstName : n, emailAddress : r, sex : v, birthDate : z, inviteID : C}, E, F, arguments[(arguments.length - 1)] === F ? {} : arguments[(arguments.length - 1)], null, true, true);
  d(req);
}
), removeUserGoogleLogin : (function (k,m)
{
  req = new a("removeUserGoogleLogin", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), updateLastfmService : (function (k,m,n,r,v,z,C)
{
  req = new a("updateLastfmService", {session : k, token : m, username : n, flagsAdd : r, flagsRemove : v}, z, C, arguments[(arguments.length - 1)] === C ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getLastfmService : (function (k,m)
{
  req = new a("getLastfmService", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), removeLastfmService : (function (k,m)
{
  req = new a("removeLastfmService", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getAffiliateDownloadURLs : (function (k,m,n,r)
{
  req = new a("getAffiliateDownloadURLs", {songName : k, artistName : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getServiceStatus : (function (k,m)
{
  req = new a("getServiceStatus", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), provideVIPFeedback : (function (k,m,n,r)
{
  req = new a("provideVIPFeedback", {fromAddress : k, message : m}, n, r, arguments[(arguments.length - 1)] === r ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getEmailAddress : (function (k,m)
{
  req = new a("getEmailAddress", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), sendMobileAppSMS : (function (k,m,n,r,v,z)
{
  req = new a("sendMobileAppSMS", {phoneNumber : k, platform : m, callingCode : n, country : r}, v, z, arguments[(arguments.length - 1)] === z ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getCountryFromRequestIP : (function (k,m)
{
  req = new a("getCountryFromRequestIP", {}, k, m, arguments[(arguments.length - 1)] === m ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), artistGetSimilarArtists : (function (k,m,n)
{
  req = new a("artistGetSimilarArtists", {artistID : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)]);
  d(req);
}
), getThemeFromDFP : (function (k,m,n)
{
  req = new a("getThemeFromDFP", {paramString : k}, m, n, arguments[(arguments.length - 1)] === n ? {} : arguments[(arguments.length - 1)], null, false, true);
  req.type = "dfp";
  d(req);
}
)});
}
)();
  (function (a)
{
  GS.Controllers.BaseController.extend("GS.Controllers.AuthController", {onWindow : true}, {init : (function ()
{
  if (! gsConfig.user.Username)
    gsConfig.user.Username = "New User";
  if (! gsConfig.user.UserID)
    gsConfig.user.UserID = - 1;
  this._handleLoginChange(GS.Models.AuthUser.wrap(gsConfig.user));
}
), login : (function (b,c,d,f,g)
{
  GS.service.authenticateUser(b, c, d, this.callback(this._loginSuccess, "normal", f, g), this.callback(this._loginFailed, "normal", g));
}
), reauthenticate : (function (b,c)
{
  GS.user.UserID > 0 ? GS.service.loginStoredUser(GS.user.UserName, this.callback(this._loginSuccess, "reauth", b, c), this.callback(this._loginFailed, "reauth", c)) : c({message : "Not logged in"});
}
), loginViaFacebook : (function (b,c)
{
  GS.facebook.gsLogin(this.callback(this._loginSuccess, "facebook", b, c), this.callback(this._loginFailed, "facebook", c));
}
), loginViaGoogle : (function (b,c)
{
  GS.google.login(this.callback(this._loginSuccess, "google", b, c), this.callback(this._loginFailed, "google", c));
}
), _loginSuccess : (function (b,c,d,f)
{
  if (f && f.userID == 0 || ! f)
    return this._loginFailed(b, d, f);
  console.log("login.success", f);
  f.authType = b;
  b == "reauth" && f.userID === GS.user.UserID || GS.service.getUserByID(f.userID, this.callback(this._updateUser, f));
  a.isFunction(c) && c(f);
  return f;
}
), _loginFailed : (function (b,c,d)
{
  d || (d = {});
  d.authType = b;
  console.log("login.failed", d);
  b == "reauth" && this._logoutSuccess({});
  a.isFunction(c) && c(d);
  return d;
}
), logout : (function ()
{
  GS.service.logoutUser(this.callback(this._logoutSuccess), this.callback(this._logoutFailed));
}
), _logoutSuccess : (function (b)
{
  console.log("logout.success", b);
  GS.user.clearData();
  GS.guts.logEvent("logout", {});
  GS.guts.endContext("userID");
  if (gsConfig.isPreview)
    window.location.replace(window.location.protocol + "//" + window.location.host + "/login.php");
  else
    location.hash = "/";
  this._handleLoginChange(GS.Models.AuthUser.wrap({}));
}
), _logoutFailed : (function (b)
{
  console.log("logout.failed", b);
}
), signup : (function (b,c,d,f,g,h,o,p,q)
{
  var t = this._getInviteCode();
  GS.service.registerUser(b, c, d, "", f, g, h, t, o, this.callback(this._signupSuccess, "normal", t, p, q), this.callback(this._signupFailed, "normal", q));
}
), signupViaFacebook : (function (b,c,d,f,g,h,o,p)
{
  var q = this._getInviteCode();
  GS.service.registerFacebookUser(b, c, d, f, g, q, h.facebookUserID, h.sessionKey, h.accessToken1, h.accessToken3, 0, this.callback(this._signupSuccess, "facebook", q, o, p), this.callback(this._signupFailed, "facebook", p));
}
), signupViaGoogle : (function (b,c,d,f,g,h,o)
{
  var p = this._getInviteCode();
  GS.service.registerGoogleUser(0, b, c, d, f, g, p, this.callback(this._signupSuccess, "google", p, h, o), this.callback(this._signupFailed, "google", o));
}
), _signupSuccess : (function (b,c,d,f,g)
{
  if (g && g.userID == 0 || ! g)
    return this._signupFailed(b, f, g);
  console.log("signup.success", g);
  g.authType = b;
  if (c)
    {
      store.set("lastInviteCode", null);
      gsConfig.inviteCode = null;
      GS.service.getUserByInviteID(c, this.callback(this._getInviterSuccess));
    }
  switch (b)
  {
    case "facebook":
      g.Flags = 4;
      break ;
    case "google":
      g.Flags = 32;
      break ;
  }
  g.doNotReset = true;
  GS.service.getUserByID(g.userID, this.callback(this._updateUser, g));
  a.isFunction(d) && d(g);
  return g;
}
), _signupFailed : (function (b,c,d)
{
  d || (d = {});
  d.authType = b;
  console.log("signup.failed", d);
  a.isFunction(c) && c(d);
  return d;
}
), _getInviteCode : (function ()
{
  var b = "", c = new Date(), d = store.get("lastInviteCode");
  if (d)
    if (d.expires && d.expires > c.valueOf())
      b = d.inviteCode;
    else
      store.set("lastInviteCode", null);
  else
    if (gsConfig.inviteCode)
      b = gsConfig.inviteCode;
  return b;
}
), _getInviterSuccess : (function (b)
{
  b = GS.Models.User.wrap(b);
  GS.lightbox.open("followInviter", {user : b});
}
), _updateUser : (function (b,c)
{
  console.log("auth.user.updateUser", b, c);
  c.User.UserID = b.userID;
  if (! b.doNotReset)
    location.hash = "/";
  var d = a.extend({}, b, c.User);
  this._handleLoginChange(GS.Models.AuthUser.wrapFromService(d), b);
}
), _handleLoginChange : (function (b,c)
{
  if (GS.user && GS.user.isDirty)
    {
      _.forEach(GS.user.playlists, (function (f)
{
  var g = [];
  _.forEach(f.songs, (function (h)
{
  g.push(h.SongID);
}
));
  b.createPlaylist(f.PlaylistName, g, f.Description, (function (h)
{
  h.addShortcut(false);
}
), null, false);
}
));
      var d = _.map(GS.user.library.songs, (function (f)
{
  return f.SongID;
}
));
      b.addToLibrary(d, false);
      _.forEach(GS.user.favorites.playlists, (function (f)
{
  b.addToPlaylistFavorites(f.PlaylistID, false);
}
));
      _.forEach(GS.user.favorites.songs, (function (f)
{
  b.addToSongFavorites(f.SongID, false);
}
));
      _.forEach(GS.user.favorites.users, (function (f)
{
  b.addToUserFavorites(f.UserID, false);
}
));
      _.forEach(GS.user.sidebar.stations, (function (f)
{
  GS.user.defaultStations.indexOf(f) == - 1 && b.addToShortcuts("station", f, false);
}
));
    }
  GS.user = b;
  GS.service.reportUserChange(GS.user.UserID, GS.user.Username, GS.user.privacy);
  a.publish("gs.auth.update", c);
  if (GS.guts && GS.user && GS.user.UserID > 0)
    {
      GS.guts.logEvent("login", {username : GS.user.Username, userID : GS.user.UserID});
      GS.guts.beginContext({userID : GS.user.UserID});
    }
}
)});
}
)(jQuery);
  GS.Controllers.BaseController.extend("GS.Controllers.ThemeController", {onDocument : true, themes : themes, sortOrder : themesSortOrder}, {currentTheme : null, themes : null, sort : null, themesLocation : "themes", initialThemeID : null, lastDFPChange : null, lastUserChange : null, themePreferences : null, currentSong : null, extraStations : {}, personalizeParams : null, hasSeenSponsoredTheme : true, DEFAULT_USER_THEMEID : 4, DEFAULT_PREMIUM_THEMEID : 4, THEME_USER_LIMIT : 600000, THEME_RATE_LIMIT : 60000, init : (function ()
{
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
}
), ready : (function ()
{
  if (GS.user.UserID > - 1)
    this.resetTheme();
  else
    if (_.defined(store.get("isFirstVisit")) || _.defined(gsConfig.isNoob) && ! gsConfig.isNoob)
      {
        this.isFirstVisit = false;
        this.resetTheme();
      }
    else
      GS.service.isFirstVisit(this.callback("onIsFirstVisit"));
}
), onIsFirstVisit : (function (a)
{
  this.isFirstVisit = a;
  store.set("isFirstVisit", false);
  this.isFirstVisit ? this.setCurrentTheme(4) : this.resetTheme();
}
), onAuthUpdate : (function ()
{
  this.lastDFPChange = this.lastUserChange = null;
  this.hasSeenSponsoredTheme = true;
  this.resetTheme();
}
), resetTheme : (function (a)
{
  a && a.hasOwnProperty("doNotReset") || (! GS.user.IsPremium && this.hasSeenSponsoredTheme && (! this.lastUserChange || now.getTime() - this.lastUserChange > this.THEME_USER_LIMIT) ? this.loadFromDFP() : this.lastOrDefault());
}
), lastOrDefault : (function ()
{
  var a = this.getLastTheme();
  if (this.themes)
    if (a && themes[a] && (GS.user.IsPremium && a || themes[a] && ! themes[a].vip))
      this.setCurrentTheme(a);
    else
      GS.user.IsPremium ? this.setCurrentTheme(this.DEFAULT_PREMIUM_THEMEID) : this.setCurrentTheme(this.DEFAULT_USER_THEMEID);
}
), loadFromDFP : (function ()
{
  var a = new Date();
  if (! GS.user.IsPremium && (! this.lastDFPChange || a.getTime() - this.lastDFPChange > this.THEME_RATE_LIMIT))
    GS.service.getThemeFromDFP(this.buildParams(), this.callback("onGetTheme"), this.callback("onGetThemeErr"));
}
), onGetTheme : (function (a)
{
  try
    {
      a = JSON.parse(a);
    }
  catch (b)
    {
      console.log("invalid json from DFP", b);
      this.lastOrDefault();
      return ;
    }
  if (a)
    if (this.themes[a.themeID] && ! this.getLastSeen(a.themeID))
      {
        var c = new Date();
        this.themes[a.themeID].clickIDs = a.clickIDs;
        this.themes[a.themeID].tracking = a.tracking;
        this.themes[a.themeID].pageTracking = a.pageTracking;
        this.themes[a.themeID].misc = a.misc;
        this.themes[a.themeID].videos = a.videos;
        if (this.setCurrentTheme(a.themeID))
          {
            this.lastDFPChange = c.getTime();
            if (this.currentTheme.sponsored)
              this.hasSeenSponsoredTheme = false;
            this.themeImpression();
          }
      }
    else
      this.lastOrDefault();
  else
    this.lastOrDefault();
}
), onGetThemeErr : (function ()
{
  this.lastOrDefault();
}
), setCurrentThemeDFPOverride : (function (a)
{
  var b = [];
  b.push("dcmt=text/json");
  b.push("sz=777x777");
  b.push("themeid=" + a);
  a = ";" + b.join(";");
  GS.service.getThemeFromDFP(a, this.callback("onGetThemeDFPOverride"), this.callback("onGetThemeErr"));
}
), onGetThemeDFPOverride : (function (a)
{
  try
    {
      a = JSON.parse(a);
    }
  catch (b)
    {
      console.log("invalid json from DFP", b);
      this.lastOrDefault();
      return ;
    }
  if (a)
    if (this.themes[a.themeID])
      {
        this.themes[a.themeID].clickIDs = a.clickIDs;
        this.themes[a.themeID].tracking = a.tracking;
        this.themes[a.themeID].pageTracking = a.pageTracking;
        this.themes[a.themeID].misc = a.misc;
        this.themes[a.themeID].videos = a.videos;
        this.setCurrentTheme(a.themeID, true);
        this.themeImpression();
      }
    else
      this.lastOrDefault();
  else
    this.lastOrDefault();
}
), setCurrentTheme : (function (a,b)
{
  if (! this.themes[a] || this.currentTheme && this.currentTheme.themeID == a)
    return false;
  this.lastTheme = this.currentTheme;
  this.currentTheme = GS.Models.Theme.wrap(this.themes[a]);
  this.renderTheme();
  if (b)
    {
      this.hasSeenSponsoredTheme = true;
      this.setLastTheme(a);
      this.lastTheme && this.setLastSeen(this.lastTheme.themeID);
    }
  return true;
}
), setLastTheme : (function (a)
{
  if (this.themePreferences[GS.user.UserID])
    this.themePreferences[GS.user.UserID].lastTheme = a;
  else
    this.themePreferences[GS.user.UserID] = {lastTheme : a, lastSeen : {}};
}
), setLastSeen : (function (a)
{
  var b = new Date();
  this.lastUserChange = b.getTime();
  if (this.themePreferences[GS.user.UserID])
    this.themePreferences[GS.user.UserID].lastSeen[a] = b.getTime();
}
), getLastTheme : (function ()
{
  return this.themePreferences[GS.user.UserID] && this.themePreferences[GS.user.UserID].lastTheme ? this.themePreferences[GS.user.UserID].lastTheme : null;
}
), getLastSeen : (function (a)
{
  return this.themePreferences[GS.user.UserID] && this.themePreferences[GS.user.UserID].lastSeen[a] ? this.themePreferences[GS.user.UserID].lastSeen[a] : null;
}
), renderTheme : (function ()
{
  if (this.currentTheme)
    {
      $("#themeStyleSheet").attr("href", [gsConfig.assetHost, this.themesLocation, this.currentTheme.location, "theme.css"].join("/") + "?ver=" + this.currentTheme.version);
      $(".theme_component").html("").removeClass("active");
      for (var a = 0;a < this.currentTheme.sections.length;a++)
        this.renderSection(this.currentTheme.sections[a]);
      this.positionTheme();
      window.location.hash !== "#/" && window.location.hash.toString().indexOf("#/?changetheme&themeid=") != 0 && $("#theme_home object").hide();
    }
}
), renderSection : (function (a)
{
  if (this.currentTheme && a.length)
    {
      var b = [this.themesLocation, this.currentTheme.location];
      b.push(a.substr(7, a.length));
      b = b.join("/");
      $(a).html(this.view(b)).addClass("active");
      a === "#theme_page_header" && $(a).prepend($("<div class='border'></div>"));
      this.currentTheme.bindAssets(a);
    }
}
), positionTheme : (function ()
{
  var a;
  if (this.currentTheme)
    for (var b = 0;b < this.currentTheme.sections.length;b++)
      {
        a = this.currentTheme.sections[b];
        this.currentTheme.position(a);
      }
}
), onSongPlay : (function (a)
{
  if (a && a.SongID)
    {
      if (! this.currentSong || this.currentSong.SongID != a.SongID)
        {
          this.currentSong = a;
          a = new Date();
          if (! GS.user.IsPremium && this.hasSeenSponsoredTheme && (! this.lastUserChange || a.getTime() - this.lastUserChange > this.THEME_USER_LIMIT))
            this.loadFromDFP();
        }
    }
  else
    this.currentSong = null;
}
), onLeaveHome : (function ()
{
  var a = new Date();
  if (! GS.user.IsPremium && this.hasSeenSponsoredTheme && (! this.lastUserChange || a.getTime() - this.lastUserChange > this.THEME_USER_LIMIT))
    this.loadFromDFP();
}
), onStreamServer : (function ()
{
  }
), themeImpression : (function ()
{
  if (this.currentTheme)
    if (this.currentTheme.sponsored && (window.location.hash == "#/" || window.location.hash.toString().indexOf("#/?changetheme&dfp=true&themeid=") == 0))
      if ($.isArray(this.currentTheme.tracking))
        {
          this.hasSeenSponsoredTheme = true;
          GS.service.logTargetedThemeImpression(this.currentTheme.themeID);
          var a = new Date().valueOf(), b = $("body"), c;
          _.forEach(this.currentTheme.tracking, (function (d)
{
  d += d.indexOf("?") != - 1 ? "&" + a : "?" + a;
  c = new Image();
  b.append($(c).load((function (f)
{
  $(f.target).remove();
}
)).css("visibility", "hidden").attr("src", d));
}
));
        }
}
), themePageImpression : (function ()
{
  if (this.currentTheme)
    if (this.currentTheme.sponsored && window.location.hash !== "#/" && $("#theme_page_header").is(".active:visible"))
      if ($.isArray(this.currentTheme.pageTracking))
        {
          var a = new Date().valueOf(), b;
          _.forEach(this.currentTheme.pageTracking, (function (c)
{
  c += c.indexOf("?") != - 1 ? "&" + a : "?" + a;
  b = new Image();
  $("body").append($(b).load((function (d)
{
  $(d.target).remove();
}
)).css("visibility", "hidden").attr("src", c));
}
));
        }
}
), onThemeClick : (function (a)
{
  a && a.currentTarget && this.currentTheme && this.currentTheme.handleClick(a);
}
), savePreferences : (function ()
{
  try
    {
      store.set("themePreferences", this.themePreferences);
    }
  catch (a)
    {}
}
), buildParams : (function ()
{
  var a = [];
  this.currentSong && a.push("2=" + this.currentSong.ArtistID);
  if (GS.user.isLoggedIn)
    {
      if (GS.user.Sex)
        a.push("1=" + (GS.user.Sex.toLowerCase() == "m" ? "0" : "1"));
      if (GS.user.TSDOB)
        {
          var b = GS.user.TSDOB.split("-");
          if (b.length == 3)
            {
              var c = new Date(), d = c.getFullYear() - parseInt(b[0], 10);
              if (parseInt(b[1], 10) > c.month)
                d -= 1;
              else
                if (parseInt(b[1], 10) == c.month && parseInt(b[2], 10) > c.date)
                  d -= 1;
              var f;
              if (d >= 13 && d < 18)
                f = "13-17";
              else
                if (d >= 18 && d < 25)
                  f = "18-24";
                else
                  if (d >= 25 && d < 35)
                    f = "25-34";
                  else
                    if (d >= 35 && d < 50)
                      f = "35-49";
                    else
                      if (d >= 50)
                        f = "50-";
              f && a.push("0=" + f);
            }
        }
    }
  a.push("dcmt=text/json");
  a.push("sz=777x777");
  a = a.concat(this.getRapParams());
  return ";" + a.join(";");
}
), getRapParams : (function ()
{
  var a = [], b = store.get("personalize" + GS.user.UserID);
  if (! b)
    return a;
  if (b.length >= 0)
    return a;
  if (jQuery.isEmptyObject(b))
    return a;
  ! GS.user.TSDOB && b.age && a.push("0=" + b.age);
  if (! GS.user.Sex && b.gender)
    a.push("1=" + (b.gender == "Male" ? "0" : "1"));
  b.children && a.push("4=" + b.children);
  b.household_income && a.push("5=" + b.household_income);
  b.marital_status && a.push("6=" + b.marital_status);
  b.home_owner_status && a.push("7=" + b.home_owner_status);
  return a;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.NotificationsController", {onDocument : true}, {displayDuration : 5000, queue : [], currentArtistFeedback : null, currentFacebookNotification : null, currentFavoritedNotification : null, currentLibraryAddedNotification : null, init : (function ()
{
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
  $.subscribe("gs.auth.library.singleSongAdded", this.callback("displayLibraryAddedObject", "song"));
}
), onSongPlay : (function (a)
{
  if (a && (a.sponsoredAutoplayID || 1))
    this.displayArtistFeedback(a);
}
), displayMessage : (function (a)
{
  this.notification = a;
  $("#notifications").append(this.view("notification"));
  var b = $("#notifications li.notification").last();
  a.manualClose || this.setNotificationTimeout(b);
}
), displayArtistFeedback : (function ()
{
  }
), displayLibraryAddedObject : (function (a,b)
{
  if (b.object && b.message)
    {
      this.addedObj = b.object;
      this.notifMsg = b.message;
      this.type = a;
      $("#notifications").append(this.view("libraryAddedNotification"));
      this.currentLibraryAddedNotification = $("#notifications .notification").last().data("object", b.object).data("type", a);
      this.setNotificationTimeout(this.currentLibraryAddedNotification);
    }
}
), displayFavoritedObject : (function (a,b)
{
  if (b)
    {
      this.favoritedObj = b;
      this.type = a;
      if (this.currentLibraryAddedNotification && this.currentLibraryAddedNotification.data("type") == a)
        {
          var c = this.currentLibraryAddedNotification.data("object");
          a == "song" && _.orEqual(b.songID, b.SongID) == _.orEqual(c.SongID, c.songID) && this.currentLibraryAddedNotification.slideUp().remove();
        }
      $("#notifications").append(this.view("favoriteNotification"));
      this.currentFavoritedNotification = $("#notifications .notification").last().data("object", b).data("type", a);
      this.setNotificationTimeout(this.currentFavoritedNotification);
    }
}
), "li.notification .favorited button.shareWithFacebook click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).closest("li.notification");
  $("button.shareWithFacebook", c).addClass("hide");
  $("div.facebookShare", c).removeClass("hide");
  $(a).closest("li.notification").removeClass("notification_success").addClass("notification_form");
  $("div.content", c).prepend("<img src=\"/webincludes/images/notifications/facebook.png\" />");
  $("div.content p", c).addClass("hasIcon");
  var d = $("#fb_share_message", c);
  d.focus(this.callback((function ()
{
  d.val() == $.localize.getString("NOTIF_SHARE_PREFILL_MSG") && d.val("");
}
)));
  d.focusout(this.callback((function ()
{
  d.val() == "" && d.val($.localize.getString("NOTIF_SHARE_PREFILL_MSG"));
}
)));
  return false;
}
), "li.notification .favorited button.shareWithFacebookSubmit click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).closest("li.notification"), d = $(c).data("object"), f = $(c).data("type"), g = $("#fb_share_message", c).val();
  if (g == $.localize.getString("NOTIF_SHARE_PREFILL_MSG"))
    g = "";
  console.log("sharing to facebook: ", f, d, g);
  switch (f)
  {
    case "song":
      GS.facebook.onFavoriteSong(d, g);
      break ;
    case "playlist":
      GS.facebook.onSubscribePlaylist(d, g);
      break ;
    case "newPlaylist":
      GS.facebook.onPlaylistCreate(d, g);
      break ;
    case "user":
      GS.facebook.onFollowUser(d, g);
      break ;
  }
  c.slideUp().remove();
  return false;
}
), displayFacebookRateLimit : (function (a)
{
  if (a)
    {
      this.type = a.type;
      $("#notifications li.facebook").remove();
      $("#notifications").append(this.view("facebookRateLimitNotification"));
      this.currentFacebookNotification = $("#notifications .notification").last().data("params", a);
      this.setNotificationTimeout(this.currentFacebookNotification);
    }
}
), "li.notification .facebook button.override click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).closest("li.notification"), d = $(c).data("params");
  GS.facebook.postEvent(d, true);
  c.slideUp().remove();
  return false;
}
), displayFacebookSent : (function (a)
{
  if (a && a.params && a.data)
    {
      this.type = a.params.type;
      this.hideUndo = a.params.hideUndo;
      $("#notifications li.facebook").remove();
      $("#notifications").append(this.view("facebookPostNotification"));
      this.currentFacebookNotification = $("#notifications .notification").last().data("data", a.data);
      this.setNotificationTimeout(this.currentFacebookNotification);
    }
}
), "li.notification .facebook button.undo click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).closest("li.notification"), d = $(c).data("data");
  console.log("facebook.params", d);
  GS.facebook.removeEvent(d, true);
  c.slideUp().remove();
  return false;
}
), displayFacebookUndoPost : (function (a)
{
  if (a)
    {
      $("#notifications li.facebook").remove();
      $("#notifications").append(this.view("facebookUndoPostNotification"));
      this.currentFacebookNotification = $("#notifications .notification").last().data("data", a);
      this.setNotificationTimeout(this.currentFacebookNotification);
    }
}
), "li.notification form.artistFeedback button click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).attr("data-vote"), d = this.currentArtistFeedback.find("textarea").val(), f = this.currentArtistFeedback.data("song");
  this.feedbackSong = f;
  d && d.length && GS.service.provideSongFeedbackMessage(f.SongID, d);
  GS.service.provideSongFeedbackVote(f.SongID, c, f.ArtistID, this.callback("onArtistFeedback", c), this.callback("onArtistFeebackFail"));
  return false;
}
), onArtistFeedback : (function (a,b)
{
  this.feedbackSong = this.currentArtistFeedback.data("song");
  if (b.success && a == 2)
    {
      this.urls = b.urls;
      this.currentArtistFeedback.find(".content").html(this.view("artistNotificationResult"));
    }
  else
    {
      this.currentArtistFeedback.slideUp().remove();
      this.currentArtistFeedback = null;
    }
}
), onArtistFeedbackFail : (function ()
{
  this.currentArtistFeedback.slideUp().remove();
  this.currentArtistFeedback = null;
}
), "li.notification.artist a.close click" : (function (a)
{
  $(a).closest("li.notification").slideUp().remove();
  this.currentArtistFeedback = null;
}
), displayRestoreQueue : (function ()
{
  console.log("display restore queue");
  $("#notifications").append(this.view("restoreQueue"));
  this.setNotificationTimeout($("#notifications .notification").last());
}
), focusInText : false, mouseOut : false, setNotificationTimeout : (function (a,b)
{
  if (! b)
    {
      $(a).mouseout(this.callback((function ()
{
  this.mouseOut = true;
  this.focusInText || this.setNotificationTimeout(a, true);
}
)));
      $(a).mouseover(this.callback((function ()
{
  this.mouseOut = false;
  this.clearNotificationTimeout(a);
}
)));
      $("textarea", a).focus(this.callback((function ()
{
  this.focusInText = true;
  this.clearNotificationTimeout(a);
}
)));
      $("textarea", a).focusout(this.callback((function ()
{
  this.focusInText = false;
  this.mouseOut && this.setNotificationTimeout(a, true);
}
)));
    }
  a.timer && this.clearNotificationTimeout(a);
  a.timer = setTimeout(this.callback((function ()
{
  this.hideNotification(a);
}
)), this.displayDuration);
}
), clearNotificationTimeout : (function (a)
{
  clearTimeout(a.timer);
}
), hideNotification : (function (a)
{
  $(a).slideUp().remove();
}
), "li.notification a.close click" : (function (a)
{
  $(a).closest("li.notification").slideUp().remove();
}
), "li.notification .cancel click" : (function (a)
{
  $(a).closest("li.notification").slideUp().remove();
}
), "form.feedback submit" : (function ()
{
  console.log("submit song feedback");
  return false;
}
), "li.notification.restoreQueue .restore click" : (function (a)
{
  GS.player.restoreQueue();
  $(a).closest("li.notification").slideUp().remove();
}
), "li.notification.restoreQueue a.settings click" : (function (a)
{
  if (GS.user.isLoggedIn)
    location.hash = "/settings";
  else
    GS.lightbox.open("login");
  $(a).closest("li.notification").slideUp().remove();
}
), "input focus" : (function (a)
{
  $(a).parent().parent().addClass("active");
}
), "textarea focus" : (function (a)
{
  $(a).parent().parent().parent().addClass("active");
}
), "input blur" : (function (a)
{
  $(a).parent().parent().removeClass("active");
}
), "textarea blur" : (function (a)
{
  $(a).parent().parent().parent().removeClass("active");
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.HeaderController", {onElement : "#header"}, {init : (function ()
{
  $.subscribe("gs.auth.update", this.callback(this.update));
  $.subscribe("gs.auth.user.feeds.update", this.callback(this.updateFeedCount));
  $.subscribe("gs.router.history.change", this.callback(this.updateNavButtons));
}
), ready : (function ()
{
  this.update();
}
), update : (function ()
{
  this.user = GS.user;
  this.isDesktop = GS.airbridge ? GS.airbridge.isDesktop : false;
  if (GS.user.isLoggedIn)
    {
      $("#nav").html(this.view("navLoggedIn"));
      $("#userOptions").html(this.view("loggedIn"));
    }
  else
    {
      $("#nav").html(this.view("navLoggedOut"));
      $("#userOptions").html(this.view("loggedOut"));
    }
  this.updateNavButtons();
}
), updateFeedCount : (function ()
{
  this.user = GS.user;
  this.isDesktop = GS.airbridge ? GS.airbridge.isDesktop : false;
  GS.user.isLoggedIn ? $("#nav").html(this.view("navLoggedIn")) : $("#nav").html(this.view("navLoggedOut"));
  this.updateNavButtons();
}
), updateNavButtons : (function ()
{
  if (GS.router)
    {
      $("button.back", this.element).attr("disabled", ! GS.router.hasBack);
      $("button.forward", this.element).attr("disabled", ! GS.router.hasForward);
    }
}
), "button.login click" : (function ()
{
  GS.lightbox.open("login");
}
), "button.signup click" : (function ()
{
  GS.lightbox.open("signup");
}
), "button.locale click" : (function ()
{
  GS.lightbox.open("locale");
}
), "button.dropdownButton click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).closest(".btn_group");
  if (c.find(".dropdown").is(":visible"))
    $(".btn_group").removeClass("active");
  else
    {
      $(".btn_group").removeClass("active");
      c.addClass("active");
      $("body").click((function ()
{
  $(".btn_group").removeClass("active");
}
));
    }
}
), "button.forward click" : (function ()
{
  GS.router.forward();
}
), "button.back click" : (function ()
{
  GS.router.back();
}
), "a.invite click" : (function ()
{
  GS.user.UserID > 0 && GS.lightbox.open("invite");
}
), "a.feedback click" : (function ()
{
  GS.user.IsPremium && GS.lightbox.open("feedback");
}
), "a.logout click" : (function ()
{
  GS.auth.logout();
}
), "#grooveshark click" : (function ()
{
  if ($("#page").is(".gs_page_home"))
    {
      $("input.search.autocomplete", "#page").blur();
      if ($("#searchBar_input input").val() == "")
        {
          $("#searchBar_input span").show();
          $("#searchBar_input span").css("opacity", "1");
        }
    }
  else
    setTimeout((function ()
{
  $("input.search.autocomplete", "#page").blur();
}
), 0);
}
), "#headerSearchBtn mousedown" : (function ()
{
  if ($("#page").is(".gs_page_home"))
    {
      $("input.search.autocomplete", "#page").focus();
      if ($("#searchBar_input input").val() == "")
        {
          $("#searchBar_input span").show();
          $("#searchBar_input span").css("opacity", "0.33");
        }
      $("#searchBar_input input").addClass("focused");
    }
  else
    var a = $.subscribe("gs.page.home.view", (function ()
{
  setTimeout((function ()
{
  $("input.search.autocomplete", "#page").focus();
}
), 0);
  $("#searchBar_input span").show();
  $("#searchBar_input span").css("opacity", "0.33");
  $.unsubscribe(a);
}
));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.SidebarController", {onElement : "#sidebar"}, {playlists : [], subscribedPlaylists : [], stations : [], sortBy : "sidebarSort", doingSubscribed : false, doResize : true, init : (function ()
{
  $.subscribe("gs.auth.update", this.callback("update"));
  $.subscribe("gs.auth.playlists.update", this.callback("populateSidebarPlaylists"));
  $.subscribe("gs.auth.favorites.playlists.update", this.callback("populateSidebarSubscribedPlaylists"));
  $.subscribe("gs.auth.stations.update", this.callback("populateSidebarStations"));
  $.subscribe("gs.auth.sidebar.loaded", this.callback((function ()
{
  this.populateSidebarStations();
  this.populateSidebarSubscribedPlaylists();
  this.populateSidebarPlaylists();
}
)));
}
), ready : (function ()
{
  this.update();
}
), update : (function ()
{
  if (GS.user)
    {
      this.user = GS.user;
      $("#sidebar").resizable("destroy");
      this.element.html(this.view("index"));
      var a = this;
      $("#sidebar").resizable({handles : {e : $("#sidebar .border")}, minWidth : 65, maxWidth : 350, animate : false, resize : (function ()
{
  $("#deselector").select();
  $(window).resize();
  if ($.browser.mozilla)
    {
      a.populateSidebarStations();
      a.populateSidebarSubscribedPlaylists();
      a.populateSidebarPlaylists();
    }
}
)});
      this.populateSidebarStations();
      this.populateSidebarSubscribedPlaylists();
      this.populateSidebarPlaylists();
      $(window).resize();
      this.beginDragDrop();
    }
}
), playlistSort : (function (a,b)
{
  var c, d;
  try
    {
      if (this.sortBy === "sidebarSort")
        {
          c = a[this.sortBy];
          d = b[this.sortBy];
        }
      else
        {
          c = a[this.sortBy].toString().toLowerCase();
          d = b[this.sortBy].toString().toLowerCase();
        }
    }
  catch (f)
    {
      console.error("sidebar.playlistsort error: " + f, this.sortBy, a[this.sortBy], b[this.sortBy]);
      console.error(a, b);
    }
  return c == d ? 0 : c > d ? 1 : - 1;
}
), populateSidebarPlaylists : (function ()
{
  if (GS.user.sidebarLoaded)
    {
      this.playlists = [];
      for (var a = GS.user.sidebar.playlists, b = 0;b < a.length;b++)
        {
          var c = GS.user.playlists[a[b]];
          if (c)
            {
              c.sidebarSort = b + 1;
              this.playlists.push(c);
            }
        }
      this.playlists.sort(this.callback("playlistSort"));
      this.showPlaylists();
    }
}
), populateSidebarSubscribedPlaylists : (function ()
{
  if (GS.user.sidebarLoaded)
    {
      this.subscribedPlaylists = [];
      for (var a = GS.user.sidebar.subscribedPlaylists, b = 0;b < a.length;b++)
        {
          var c = GS.user.favorites.playlists[a[b]];
          if (c)
            {
              c.sidebarSort = b + 1;
              this.subscribedPlaylists.push(c);
            }
        }
      this.subscribedPlaylists.sort(this.callback(this.playlistSort));
      this.showSubscribedPlaylists();
    }
}
), populateSidebarStations : (function ()
{
  if (GS.user.sidebarLoaded)
    {
      this.stations = [];
      for (var a = GS.user.sidebar.stations, b = 0;b < a.length;b++)
        {
          var c = a[b], d = $.localize.getString("STATION_" + GS.user.stations[c]);
          d && this.stations.push({StationID : c, Station : GS.user.stations[c], Name : d, PlaylistName : d, sidebarSort : b + 1});
        }
      this.stations.sort(this.callback("playlistSort"));
      this.showStations();
    }
}
), showPlaylists : (function ()
{
  $("#sidebar_playlists").html(this.view("playlists", {playlists : this.playlists, doingSubscribed : false}));
  this.playlists.length || this.subscribedPlaylists.length ? $("#sidebar_playlists_divider").show() : $("#sidebar_playlists_divider").hide();
}
), showSubscribedPlaylists : (function ()
{
  $("#sidebar_subscribed_playlists").html(this.view("playlists", {playlists : this.subscribedPlaylists, doingSubscribed : true}));
  this.playlists.length || this.subscribedPlaylists.length ? $("#sidebar_playlists_divider").show() : $("#sidebar_playlists_divider").hide();
}
), showStations : (function ()
{
  $("#sidebar_stations").html(this.view("stations"));
  this.stations.length ? $("#sidebar_stations_divider").show() : $("#sidebar_stations_divider").hide();
}
), "li.sidebar_loginFacebook a click" : (function ()
{
  GS.auth.loginViaFacebook(null, this.callback(this.loginFailed));
}
), "li.sidebar_loginGoogle a click" : (function ()
{
  GS.auth.loginViaGoogle(null, this.callback(this.loginFailed));
}
), loginFailed : (function (a)
{
  if (a && a.authType)
    if (a.error)
      {
        console.error("sidebar.login fail", a);
        GS.lightbox.open("login", {error : a.error});
      }
    else
      switch (a.authType)
      {
        case "facebook":
          console.error("sidebar.facebook.login fail", a);
          GS.lightbox.open("login", {error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"});
          break ;
        case "google":
          console.error("sidebar.goog.login fail", a);
          GS.lightbox.open("login", {error : "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR"});
          break ;
      }
}
), "div#sidebar_playlists_divider a.sidebarNew click" : (function (a,b)
{
  b.stopPropagation();
  GS.lightbox.open("newPlaylist", []);
  return false;
}
), "li.playlist.reg .remove click" : (function (a,b)
{
  b.stopPropagation();
  b.preventDefault();
  var c = a.parent().parent().attr("rel");
  GS.lightbox.open("removePlaylistSidebar", c);
  return false;
}
), "li.playlist.subscribed .remove click" : (function (a,b)
{
  b.stopPropagation();
  b.preventDefault();
  var c = a.parent().parent().attr("rel");
  GS.lightbox.open("removePlaylistSidebar", c);
  return false;
}
), "li.playlist mousedown" : (function (a,b)
{
  if (b.button === 2)
    {
      b.stopPropagation();
      var c = a.attr("rel");
      c = GS.Models.Playlist.getOneFromCache(c).getContextMenu();
      $(a).jjmenu(b, c, null, {xposition : "mouse", yposition : "mouse", show : "show", className : "playlistmenu"});
    }
  return false;
}
), "li.station click" : (function (a,b)
{
  b.stopPropagation();
  var c = a.attr("rel");
  GS.player.setAutoplay(true, c);
  return false;
}
), "li.station .remove click" : (function (a,b)
{
  b.stopPropagation();
  var c = a.parent().parent().attr("rel");
  this.removeStationID = c;
  GS.user.removeFromShortcuts("station", c, true);
  return false;
}
), "a.noProfile click" : (function ()
{
  GS.lightbox.open("login");
}
), "a.upload click" : (function ()
{
  window.open("http://listen.grooveshark.com/upload", "_blank");
}
), "#sidebar_footer a click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = this.callback((function ()
{
  var p = [];
  $.each(GS.user.stations, this.callback((function (q,t)
{
  p.push({title : $.localize.getString("STATION_" + t), action : {type : "fn", callback : this.callback((function ()
{
  GS.user.addToShortcuts("station", q, true);
}
))}});
}
)));
  p.sort((function (q,t)
{
  var A = q.title.toLowerCase(), B = t.title.toLowerCase();
  return A == B ? 0 : A > B ? 1 : - 1;
}
));
  return p;
}
)), d = [], f = GS.Models.Playlist.getPlaylistsMenu([], (function (p)
{
  p.addShortcut();
}
), true, false), g = {title : $.localize.getString("CONTEXT_NEW_PLAYLIST"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("newPlaylist", []);
}
)}};
  if (f.length > 0)
    {
      f = [g, {customClass : "separator"}].concat(f);
      d.push({title : $.localize.getString("CONTEXT_ADD_PLAYLIST"), customClass : "addplaylist", type : "sub", src : f});
    }
  else
    d.push(g);
  d.push({title : $.localize.getString("CONTEXT_ADD_STATION"), customClass : "addstation", type : "sub", src : c()});
  c = [{title : $.localize.getString("SETTINGS"), action : {type : "fn", callback : (function ()
{
  window.location.hash = "#/settings";
}
)}}, {title : $.localize.getString("CONTEXT_SORT_BY"), type : "sub", src : [{title : $.localize.getString("CONTEXT_SORT_BY_NAME"), action : {type : "fn", callback : this.callback((function ()
{
  this.sortBy = "PlaylistName";
  this.populateSidebarPlaylists();
  this.populateSidebarSubscribedPlaylists();
  this.populateSidebarStations();
}
))}}, {title : $.localize.getString("DATE_ADDED"), action : {type : "fn", callback : this.callback((function ()
{
  this.sortBy = "sidebarSort";
  this.populateSidebarPlaylists();
  this.populateSidebarSubscribedPlaylists();
  this.populateSidebarStations();
}
))}}]}];
  var h, o;
  switch (a.attr("name"))
  {
    case "new":
      h = d;
      o = "jjsidebarMenuNew";
      break ;
    case "options":
      h = c;
      o = "jjsidebarMenuOptions";
      break ;
  }
  if ($("div." + o).is(":visible"))
    {
      $("div." + o).hide();
      a.removeClass("active-context");
    }
  else
    $(a).jjmenu(b, h, null, {xposition : "left", yposition : "top", orientation : "top", show : "show", className : "sidebarmenu " + o, useEllipsis : false});
}
), beginDragDrop : (function ()
{
  var a = $("#sidebar_playlists");
  $("#sidebar_playlists,#sidebar_subscribed_playlists").bind("draginit", (function (b,c)
{
  var d = $(b.target).closest(".playlist");
  if (d.length === 0)
    return false;
  c.playlist = d;
  c.playlistOffsetLeft = b.clientX - (d.offset()).left;
  c.playlistOffsetTop = b.clientY - (d.offset()).top;
}
)).bind("dragstart", (function (b,c)
{
  c.draggedItems = [GS.Models.Playlist.getOneFromCache(c.playlist.attr("rel"))];
  c.playlistProxy = c.playlist.clone().prepend("<div class=\"status\"></div>").addClass("dragProxy").css("position", "absolute").css("zIndex", "99999").appendTo("body");
  c.playerGuide = $("<div id='queue_songGuide'/>").css("position", "absolute").css("zIndex", "99998").css("height", 125).css("width", 10).css("top", ($("#queue_list").offset()).top + 2).hide().appendTo("body");
}
)).bind("drag", (function (b,c)
{
  c.playlistProxy.css("top", b.clientY - c.playlistOffsetTop).css("left", b.clientX - c.playlistOffsetLeft);
  if (c.dropContainers)
    {
      var d, f = false;
      for (g in c.dropContainers)
        if (c.dropContainers.hasOwnProperty(g))
          {
            d = c.dropContainers[g];
            if ((d.within(b.clientX, b.clientY)).length)
              {
                f = true;
                break ;
              }
          }
      f ? c.playlistProxy.addClass("valid").removeClass("invalid") : c.playlistProxy.addClass("invalid").removeClass("valid");
    }
  GS.player.managePlayerGuide(b, c);
}
)).bind("dragend", (function (b,c)
{
  c.playlistProxy.remove();
  c.playerGuide.remove();
}
));
  a.bind("dropinit", (function (b,c)
{
  var d = $(b.target).closest(".sidebar.playlist");
  try
    {
      delete c.dropContainers.sidebar;
    }
  catch (f)
    {}
  if (d.length > 0)
    return false;
  c.initTarget = b.target;
  if (c.dropContainers)
    c.dropContainers.sidebar = a;
  else
    c.dropContainers = {sidebar : a};
}
)).bind("dropend", (function (b,c)
{
  console.log("sidebar.drop.end", b, c);
  $("#sidebar_playlists li.playlist").removeClass("hover");
  var d = ($("#sidebar").within(b.clientX, b.clientY)).length > 0, f = [], g = GS.Models.Playlist.getOneFromCache($(".playlist", "#sidebar_playlists").within(b.clientX, b.clientY).attr("rel")), h;
  if (! d || ! (g  instanceof  GS.Models.Playlist))
    return false;
  if (g.PlaylistID == c.draggedItems[0].PlaylistID)
    return false;
  if (typeof c.draggedItems[0].SongID !== "undefined")
    for (d = 0;d < c.draggedItems.length;d++)
      f.push(c.draggedItems[d].SongID);
  else
    if (typeof c.draggedItems[0].AlbumID !== "undefined")
      for (d = 0;d < c.draggedItems.length;d++)
        c.draggedItems[d].getSongs((function (p)
{
  for (h = 0;h < p.length;h++)
    f.push(p[h].SongID);
}
), null, false, {async : false});
    else
      if (typeof c.draggedItems[0].ArtistID !== "undefined")
        for (d = 0;d < c.draggedItems.length;d++)
          c.draggedItems[d].getSongs((function (p)
{
  for (h = 0;h < p.length;h++)
    f.push(p[h].SongID);
}
), null, false, {async : false});
      else
        if (typeof c.draggedItems[0].PlaylistID !== "undefined")
          for (d = 0;d < c.draggedItems.length;d++)
            c.draggedItems[d].getSongs((function (p)
{
  for (h = 0;h < p.length;h++)
    f.push(p[h].SongID);
}
), null, false, {async : false});
        else
          if (typeof c.draggedItems[0].UserID !== "undefined")
            for (d = 0;d < c.draggedItems.length;d++)
              c.draggedItems[d].getFavoritesByType("Song", (function (p)
{
  for (h = 0;h < p.length;h++)
    f.push(p[h].SongID);
}
), null, false, {async : false});
  g.addSongs(f, null, true);
  var o = [];
  $("#grid .selected[id!=\"showQueue\"]").each((function (p,q)
{
  var t = parseInt($(q).attr("row"), 10) + 1;
  o.push(t);
}
));
  o = o.sort(_.numSortA);
  GS.guts.logEvent("OLSongsDraggedToPlaylistSidebarItem", {ranks : o, songIDs : f});
}
));
}
), handleHover : (function (a)
{
  a = $(".sidebar_link a", "#sidebar").within(a.clientX, a.clientY);
  $("#sidebar .sidebar_link a").removeClass("hover");
  a.length && a.addClass("hover");
}
), "a.fromSidebar click" : (function ()
{
  GS.page.setFromSidebar(1);
}
)});
  (function ()
{
  var a;
  GS.Controllers.BaseController.extend("GS.Controllers.PlayerController", {onElement : "#footer"}, {REPEAT_NONE : 0, REPEAT_ALL : 1, REPEAT_ONE : 2, repeatStates : {none : 0, all : 1, one : 2}, INDEX_DEFAULT : - 1, INDEX_NEXT : - 2, INDEX_LAST : - 3, INDEX_REPLACE : - 4, PLAY_STATUS_NONE : 0, PLAY_STATUS_INITIALIZING : 1, PLAY_STATUS_LOADING : 2, PLAY_STATUS_PLAYING : 3, PLAY_STATUS_PAUSED : 4, PLAY_STATUS_BUFFERING : 5, PLAY_STATUS_FAILED : 6, PLAY_STATUS_COMPLETED : 7, PLAY_CONTEXT_UNKNOWN : "unknown", PLAY_CONTEXT_SONG : "song", PLAY_CONTEXT_ALBUM : "album", PLAY_CONTEXT_ARTIST : "artist", PLAY_CONTEXT_PLAYLIST : "playlist", PLAY_CONTEXT_RADIO : "radio", PLAY_CONTEXT_SEARCH : "search", PLAY_CONTEXT_POPULAR : "popular", PLAY_CONTEXT_FEED : "feed", crossfadeAmount : 5000, crossfadeEnabled : false, playPauseFade : false, prefetchEnabled : true, lowerQuality : false, embedTimeout : 0, playlistName : $.localize.getString("NOW_PLAYING"), songCountString : new GS.Models.DataString(), numSongs : 0, player : null, isPlaying : false, isPaused : false, nullStatus : {activeSong : {}, bytesLoaded : 0, bytesTotal : 0, duration : 0, position : 0, status : 0}, SCRUB_LOCK : false, queueIsVisible : true, userChangedQueueVisibility : false, QUEUE_SIZES : {s : {width : 139, activeWidth : 147}, m : {width : 80, activeWidth : 96}}, queueSize : "m", songWidth : 80, activeSongWidth : 96, gsQueue : null, allowRestore : true, init : (function ()
{
  a = this;
  if (location.hash.match(/^#\/s(?:ong)?\/(.*)\/?/))
    this.allowRestore = false;
  swfobject.hasFlashPlayerVersion("9.0.0") ? this.attachPlayer() : setTimeout((function ()
{
  GS.lightbox.open("noFlash");
}
), 500);
  this.beginDragDrop();
  this.addQueueSeek();
  this.addQueueMousewheel();
  this.addShortcuts();
  this.addVolumeSlider();
  this.setQueue("m");
  $.subscribe("gs.auth.update", this.callback(this.userChange));
  $.subscribe("gs.auth.song.update", this.callback(this.songChange));
  $.subscribe("gs.settings.local.update", this.callback(this.updateWithLocalSettings));
  $.subscribe("gs.song.play", this.callback(this.eventPlaySong));
  $.subscribe("gs.album.play", this.callback(this.eventPlayAlbum));
  $.subscribe("gs.playlist.play", this.callback(this.eventPlayPlaylist));
  $.subscribe("gs.station.play", this.callback(this.eventPlayStation));
  $.subscribe("window.resize", this.callback(this.resize));
}
), resize : (function ()
{
  a.updateQueueWidth();
}
), setQueue : (function (b)
{
  var c = b === "s" ? a.smallQueueSongToHtml : a.queueSongToHtml, d = _.defined(a.queue) && a.queue.songs ? a.queue.songs : [];
  a.queueSize = b;
  a.songWidth = a.QUEUE_SIZES[b].width;
  a.activeSongWidth = a.QUEUE_SIZES[b].activeWidth;
  a.gsQueue = $("#queue").toggleClass("small", b === "s").gsQueue({activeItemWidth : a.activeSongWidth, itemWidth : a.songWidth, itemRenderer : c}, d);
  $(window).resize();
}
), userChange : (function ()
{
  console.log("player.userChange");
  this.updateWithLocalSettings();
}
), attachPlayer : (function ()
{
  var b = "/JSQueue.swf";
  if (gsConfig.runMode && gsConfig.runMode === "dev")
    {
      b += "?" + new Date().getTime();
      hostname = "devcowbell.grooveshark.com";
    }
  else
    if (gsConfig.runMode && gsConfig.runMode === "staging")
      {
        b += "?" + new Date().getTime();
        hostname = "stagingcowbell.grooveshark.com";
      }
    else
      {
        b += "?" + gsConfig.swfVersion;
        hostname = "cowbell.grooveshark.com";
      }
  var c = {hostname : hostname, session : window.gsConfig.sessionID, name : "jsPlayerEmbed", playerController : "GS.Controllers.PlayerController.instance()", serviceController : "GS.Controllers.ServiceController.instance()", disableHTTPS : 0};
  ($("#swfWrapper")).length || $(this.element).append("<div id=\"swfWrapper\"></div>");
  swfobject.embedSWF(b, "swfWrapper", "10", "10", "9.0.0", null, c, {allowScriptAccess : "always"}, {id : "jsPlayerEmbed", name : "jsPlayerEmbed"});
  this.embedTimeout = setTimeout(this.callback(this.onEmbedTimeout), 10000);
}
), playerReady : (function ()
{
  a.player.setErrorCallback("GS.Controllers.PlayerController.instance().playerError");
  a.player.setPlaybackStatusCallback("GS.Controllers.PlayerController.instance().playerStatus");
  a.player.setPropertyChangeCallback("GS.Controllers.PlayerController.instance().propertyChange");
  a.player.setQueueChangeCallback("GS.Controllers.PlayerController.instance().queueChange");
  a.player.setSongPropertyChangeCallback("GS.Controllers.PlayerController.instance().songChange");
  var b = a.player.setZoomChangeCallback("GS.Controllers.PlayerController.instance().onZoomChange");
  a.onZoomChange(b);
  $("#volumeSlider").slider("value", a.player.getVolume());
  a.updateWithLocalSettings();
  clearTimeout(a.embedTimeout);
  GS.lightbox && GS.lightbox.isOpen && GS.lightbox.curType == "swfTimeout" && GS.lightbox.close();
}
), onEmbedTimeout : (function ()
{
  a.player || GS.lightbox.open("swfTimeout");
}
), queueIsRestorable : (function ()
{
  var b = a.getCurrentQueue();
  if (GS.user.settings.local.restoreQueue && a.allowRestore)
    a.restoreQueue();
  else
    {
      b.hasRestoreQueue = true;
      $("#queue_clear_button").addClass("undo");
      _.defined(restoreQueue) || $.publish("gs.player.restorequeue");
    }
}
), onZoomChange : (function (b)
{
  b && console.warn("ZOOM CHANGED, NOT ZERO", b);
}
), storeQueue : (function ()
{
  a.player && a.player.storeQueue();
}
), playerError : (function (b)
{
  console.log("player.playererror", b);
  switch (b.type)
  {
    case "errorAddingSongs":
      console.log("player. failed to add songs: ", b.details.songs, b.details.reason);
      $.publish("gs.notification", {type : "error", message : $.localize.getString("ERROR_ADDING_SONG") + ": " + b.details.reason});
      break ;
    case "playbackError":
      console.log("player. error playing song", b.details.song, b.details.reason);
      $.publish("gs.notification", {type : "error", header : $.localize.getString("ERROR_HASNEXT_HEADER"), message : $.localize.getString("ERROR_HASNEXT_MESSAGE")});
      break ;
    case "autoplayFailed":
      console.log("player. error fetching autoplay song", b.details.reason);
      b.details.reason === "unknownHasNext" ? $.publish("gs.notification", {type : "error", header : $.localize.getString("ERROR_HASNEXT_HEADER"), message : $.localize.getString("ERROR_HASNEXT_MESSAGE")}) : $.publish("gs.notification", {type : "error", message : $.localize.getString("ERROR_FETCHING_RADIO")});
      break ;
    case "autoplayVoteError":
      console.log("player. error voting song", b.details.song);
      $.publish("gs.notification", {type : "error", message : $.localize.getString("ERROR_VOTING_SONG")});
      break ;
    case "serviceError":
      console.log("player. service error", b.details);
      $.publish("gs.notification", {type : "error", message : $.localize.getString("ERROR_FETCHING_INFO")});
      break ;
  }
}
), "$seekBar" : $("#seeking_wrapper .bar:first"), "$seekBuffer" : $("#seeking_wrapper .bar.buffer"), "$seekProgress" : $("#seeking_wrapper .bar.progress"), "$seekScrubber" : $("#seeking_wrapper .scrubber"), playerStatus : (function (b)
{
  b = b || this.nullStatus;
  if (! this.currentSong || this.currentSong.queueSongID !== b.activeSong.queueSongID)
    {
      b.activeSong = (GS.Models.Song.wrapQueue([b.activeSong]))[0];
      this.updateSongOnPlayer(b.activeSong);
    }
  else
    b.activeSong = this.currentSong;
  var c = Math.min(1, b.bytesLoaded / b.bytesTotal), d = Math.min(1, b.position / b.duration), f = this.$seekBar.width();
  c = Math.min(f, c * 100);
  var g = Math.min(f, d * 100);
  d = Math.min(f, Math.max(0, f * d));
  c = isNaN(c) ? 0 : c;
  g = isNaN(g) ? 0 : g;
  d = isNaN(d) ? 0 : d;
  this.$seekBuffer.width(c + "%");
  this.$seekProgress.width(g + "%");
  this.SCRUB_LOCK || this.$seekScrubber.css("left", d);
  if (b.duration > 0)
    {
      b.position == 0 ? $("#player_elapsed").text("0:00") : $("#player_elapsed").text(_.millisToMinutesSeconds(b.position));
      b.duration == 0 ? $("#player_duration").text("0:00") : $("#player_duration").text(_.millisToMinutesSeconds(b.duration));
    }
  else
    {
      $("#player_elapsed").text("0:00");
      $("#player_duration").text("0:00");
    }
  b.currentStreamServer && b.currentStreamServer !== this.lastStatus.currentStreamServer && $.publish("gs.player.streamserver", {streamServer : b.currentStreamServer});
  switch (b.status)
  {
    case a.PLAY_STATUS_NONE:
      console.log("PLAY_STATUS_NONE");
      a.isPlaying = false;
      a.isPaused = false;
      a.seek.slider("disable");
      $("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
      $("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
      $.publish("gs.player.stopped", b.activeSong);
      break ;
    case a.PLAY_STATUS_INITIALIZING:
      GS.guts.logEvent("playStatusUpdate", {playStatus : "INITIALIZING"});
      console.log("PLAY_STATUS_INITIALIZING");
      a.isPlaying = true;
      a.isPaused = false;
      break ;
    case a.PLAY_STATUS_LOADING:
      console.log("PLAY_STATUS_LOADING");
      GS.guts.logEvent("playStatusUpdate", {playStatus : "LOADING"});
      if (this.lastStatus !== b.status)
        {
          a.isPlaying = true;
          a.isPaused = false;
          a.updateSongOnPlayer(b.activeSong);
          $("#player_play_pause").is(".buffering") || $("#player_play_pause").removeClass("play").removeClass("pause").addClass("buffering");
          $("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
        }
      if (this.pauseNextQueueSongID && this.pauseNextQueueSongID === b.activeSong.queueSongID)
        {
          this.pauseNextQueueSongID = false;
          this.pauseSong();
        }
      break ;
    case a.PLAY_STATUS_PLAYING:
      if (this.lastStatus !== b.status)
        {
          a.isPlaying = true;
          a.isPaused = false;
          a.seek.slider("enable");
          $("#player_play_pause").is(".pause") || $("#player_play_pause").removeClass("play").addClass("pause").removeClass("buffering");
          $("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
          $.publish("gs.player.playing", b);
        }
      if (this.pauseNextQueueSongID && this.pauseNextQueueSongID === b.activeSong.queueSongID)
        {
          this.pauseNextQueueSongID = false;
          this.pauseSong();
        }
      $.publish("gs.player.playing.continue", b);
      break ;
    case a.PLAY_STATUS_PAUSED:
      console.log("PLAY_STATUS_PAUSED");
      GS.guts.logEvent("playStatusUpdate", {playStatus : "PAUSED"});
      if (this.lastStatus !== b.status)
        {
          a.isPlaying = false;
          a.isPaused = true;
          $("#player_play_pause").is(".play") || $("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
          $("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
          $.publish("gs.player.paused", b.activeSong);
        }
      break ;
    case a.PLAY_STATUS_BUFFERING:
      GS.guts.logEvent("playStatusUpdate", {playStatus : "BUFFERING"});
      console.log("PLAY_STATUS_BUFFERING");
      a.isPlaying = true;
      a.isPaused = false;
      $("#player_play_pause").is(".buffering") || $("#player_play_pause").removeClass("play").removeClass("pause").addClass("buffering");
      $("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
      break ;
    case a.PLAY_STATUS_FAILED:
      console.log("PLAY_STATUS_FAILED");
      GS.guts.logEvent("playStatusUpdate", {playStatus : "FAILED"});
      a.isPlaying = false;
      a.isPaused = false;
      a.seek.slider("disable");
      $("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
      $("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
      break ;
    case a.PLAY_STATUS_COMPLETED:
      console.log("PLAY_STATUS_COMPLETED");
      GS.guts.logEvent("playStatusUpdate", {playStatus : "COMPLETED"});
      a.isPlaying = false;
      a.isPaused = false;
      a.seek.slider("disable");
      $("#player_play_pause").addClass("play").removeClass("pause").removeClass("buffering");
      $("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
      a.$seekBuffer.width("0%");
      a.$seekProgress.width("0%");
      a.$seekScrubber.css("left", 0);
      $.publish("gs.player.stopped", b.activeSong);
      $.publish("gs.player.completed", b.activeSong);
      break ;
  }
  this.lastStatus = b.status;
  $.publish("gs.player.playstatus", b);
}
), pauseNextQueueSongID : false, pauseNextSong : (function ()
{
  var b = this.getCurrentQueue();
  this.pauseNextQueueSongID = b && b.nextSong && b.nextSong.queueSongID ? b.nextSong.queueSongID : false;
}
), propertyChange : (function (b)
{
  if (b.isMuted)
    {
      $("#player_volume").addClass("muted");
      $("#volumeSlider").slider("value", 0);
    }
  else
    {
      $("#player_volume").removeClass("muted");
      $("#volumeSlider").slider("value", b.volume);
    }
  b.crossfadeEnabled ? $("#player_crossfade").addClass("active") : $("#player_crossfade").removeClass("active");
}
), queueChange : (function (b)
{
  var c = b.fullQueue;
  if (a.player)
    c.hasRestoreQueue = a.player.getQueueIsRestorable();
  a.queue = false;
  switch (b.type)
  {
    case "queueReset":
      c.activeSong = c.activeSong ? (GS.Models.Song.wrapQueue([c.activeSong]))[0] : null;
      this.updateSongOnPlayer(c.activeSong);
      c.songs = GS.Models.Song.wrapQueue(c.songs);
      a.queue = c;
      a.updateQueueDetails(c);
      a.updateQueueSongs(c);
      break ;
    case "propertyChange":
      if (b.details.hasOwnProperty("autoplayEnabled"))
        b.details.autoplayEnabled == true ? GS.guts.logEvent("autoplayOn", {}) : GS.guts.logEvent("autoplayOff", {});
      a.updateQueueDetails();
      break ;
    case "contentChange":
      a.gsQueue.setActive((a.getCurrentQueue()).activeSong.index, false);
      a.gsQueue.setItems((a.getCurrentQueue()).songs);
      a.updateQueueWidth();
      a.updateQueueDetails();
      break ;
  }
  $.publish("gs.player.queue.change");
}
), songChange : (function (b)
{
  var c, d, f = a.player ? a.player.getCurrentQueue() : {activeSong : false};
  b  instanceof  GS.Models.Song || (b = (GS.Models.Song.wrapQueue([b]))[0]);
  d = (a.getCurrentQueue()).songs;
  for (c = 0;c < d.length;c++)
    if (d[c].SongID === b.SongID)
      {
        for (g in b)
          if (b.hasOwnProperty(g))
            d[c][g] = b[g];
        a.songs = [d[c]];
        if (f.activeSong && f.activeSong.queueSongID === d[c].queueSongID)
          {
            if (a.currentSong && a.currentSong.index)
              d[c].index = a.currentSong.index;
            a.updateSongOnPlayer(d[c], true);
          }
      }
  a.gsQueue.setItems(d);
}
), updateWithLocalSettings : (function (b)
{
  if (this.player)
    {
      b = b || GS.user.settings.local;
      b.crossfadeEnabled != this.getCrossfadeEnabled() && this.setCrossfadeEnabled(b.crossfadeEnabled);
      b.crossfadeAmount != this.getCrossfadeAmount() && this.setCrossfadeAmount(b.crossfadeAmount);
      b.lowerQuality != this.getLowerQuality() && this.setLowerQuality(b.lowerQuality);
      ! b.noPrefetch != this.getPrefetchEnabled() && this.setPrefetchEnabled(! b.noPrefetch);
      b.playPauseFade != this.getPlayPauseFade() && this.setPlayPauseFade(b.playPauseFade);
      this.setPersistShuffle(b.persistShuffle);
      b.persistShuffle && b.lastShuffle != this.getShuffle() && this.setShuffle(b.lastShuffle);
    }
}
), getEverything : (function ()
{
  if (a.player)
    return a.player.getEverything();
  return {};
}
), getPlaybackStatus : (function ()
{
  if (a.player)
    return a.player.getPlaybackStatus();
  return {};
}
), getSongDetails : (function (b,c)
{
  var d;
  b = _.orEqual(b, 0);
  if (typeof c === "number" || typeof c === "string")
    c = [c];
  if (a.player)
    {
      d = a.player.getSongDetails(b, c);
      return GS.Models.Song.wrapQueue(d);
    }
  return GS.Models.Song.wrap({});
}
), getCurrentSong : (function ()
{
  if (a.player)
    return (a.getCurrentQueue()).activeSong;
}
), addSongsToQueueAt : (function (b,c,d,f)
{
  c = _.orEqual(c, this.INDEX_DEFAULT);
  d = _.orEqual(d, false);
  f = _.orEqual(f, {type : this.PLAY_CONTEXT_UNKNOWN});
  $.isArray(b) || (b = b.split(","));
  var g, h, o = [];
  for (g = 0;g < b.length;g++)
    {
      h = GS.Models.Song.getOneFromCache(b[g]);
      if (! _.defined(h) && b[g] > 0)
        GS.Models.Song.getSong(b[g], this.callback((function (p)
{
  o[g] = p;
}
)), false, false, {async : false});
      else
        o[g] = h;
    }
  if (a.player)
    {
      if (c == - 4)
        {
          c = - 1;
          this.clearQueue();
        }
      a.player.addSongsToQueueAt(o, c, d, f);
      GS.guts.logEvent("songsQueued", {songIDs : b});
    }
}
), playSong : (function (b)
{
  GS.isPlaying = true;
  GS.isPlaying = true;
  a.player && a.player.playSong(b);
}
), eventPlaySong : (function (b)
{
  b && b.songID && a.addSongAndPlay(b.songID);
}
), eventPlayAlbum : (function (b)
{
  b && b.albumID && GS.Models.Album.getAlbum(b.albumID, this.callback("playAlbum", b), null, false);
}
), playAlbum : (function (b,c)
{
  console.log("player.playAlbum", b, c);
  var d = _.orEqual(b.index, - 1), f = _.orEqual(b.playOnAdd, false);
  c.play(d, f);
}
), eventPlayPlaylist : (function (b)
{
  b && b.playlistID && GS.Models.Playlist.getPlaylist(b.playlistID, this.callback("playPlaylist", b), null, false);
}
), playPlaylist : (function (b,c)
{
  console.log("player.playPlaylist", b, c);
  var d = _.orEqual(b.index, - 1), f = _.orEqual(b.playOnAdd, false);
  c.play(d, f);
}
), eventPlayStation : (function (b)
{
  if (b && b.tagID)
    {
      console.log("play station", b.tagID);
      a.setAutoplay(true, b.tagID);
    }
}
), addSongAndPlay : (function (b)
{
  b = GS.Models.Song.getOneFromCache(b);
  a.player && a.player.addSongsToQueueAt([b], a.INDEX_DEFAULT, true);
}
), pauseSong : (function ()
{
  a.isPlaying = false;
  a.isPaused = true;
  if (a.player)
    {
      a.player.pauseSong();
      $.publish("gs.player.paused");
    }
}
), resumeSong : (function ()
{
  a.isPlaying = true;
  a.isPaused = false;
  a.player && a.player.resumeSong();
}
), stopSong : (function ()
{
  a.isPlaying = false;
  a.isPaused = false;
  a.player && a.player.stopSong();
}
), previousSong : (function (b)
{
  b = b ? true : false;
  a.player && a.player.previousSong(b);
}
), nextSong : (function ()
{
  a.player && a.player.nextSong();
}
), seekTo : (function (b)
{
  a.player && a.player.seekTo(b);
}
), clearQueue : (function ()
{
  if (a.player)
    {
      a.queue = null;
      a.player.stopSong();
      a.player.clearQueue();
      a.playerStatus(a.player.getPlaybackStatus());
      a.updateQueueWidth();
      a.gsQueue.setActive(0, false);
      a.gsQueue.setItems([]);
      $("#playerDetails_nowPlaying").html("");
      GS.guts.logEvent("queueCleared", {});
    }
}
), restoreQueue : (function ()
{
  a.player && a.player.restoreQueue();
}
), saveQueue : (function ()
{
  for (var b = (a.getCurrentQueue()).songs, c = [], d = 0;d < b.length;d++)
    c.push(b[d].SongID);
  GS.lightbox.open("newPlaylist", c);
  GS.guts.logEvent("queueSaveInitiated", {});
}
), getCurrentQueue : (function (b)
{
  b = _.orEqual(b, false);
  if (! b && a.queue)
    return a.queue;
  if (a.player)
    {
      b = a.player.getCurrentQueue();
      if (b.activeSong)
        {
          b.activeSong = (GS.Models.Song.wrapQueue([b.activeSong]))[0];
          this.updateSongOnPlayer(b.activeSong);
        }
      if (b.songs && b.songs.length)
        b.songs = GS.Models.Song.wrapQueue(b.songs);
      b.hasRestoreQueue = a.player.getQueueIsRestorable();
      return a.queue = b;
    }
}
), getPreviousQueue : (function ()
{
  a.player && a.player.getPreviousQueue();
}
), moveSongsTo : (function (b,c)
{
  if (typeof b === "number" || typeof b === "string")
    b = [b];
  a.player && a.player.moveSongsTo(b, c);
}
), removeSongs : (function (b)
{
  if (typeof b === "number" || typeof b === "string")
    b = [b];
  if (a.player)
    {
      for (queueSongID in b)
        {}
      a.player.removeSongs(b);
      a.updateQueueWidth();
    }
  a.queue = false;
  a.queue = a.getCurrentQueue();
  $.publish("gs.player.queue.change");
}
), setAutoplay : (function (b,c)
{
  var d = a.getCurrentQueue();
  b = b ? true : false;
  c = parseInt(c, 10);
  if (isNaN(c))
    c = 0;
  if (c > 0 && d && d.songs.length > 0)
    GS.lightbox.open("radioClearQueue", c);
  else
    if (a.player)
      {
        b ? $("#player button.radio").addClass("active") : $("#player button.radio").removeClass("active");
        $("#queue_radio_button").toggleClass("active", b);
        a.player.setAutoplay(b, c);
      }
}
), voteSong : (function (b,c)
{
  if (a.player)
    {
      a.player.voteSong(b, c);
      switch (c)
      {
        case - 1:
          GS.guts.logEvent("songDownVoted", {songID : (this.getSongDetails(a.queue.queueID, [b]))[0].SongID});
          break ;
        case 0:
          GS.guts.logEvent("songVotedNeutral", {songID : (this.getSongDetails(a.queue.queueID, [b]))[0].SongID});
          break ;
        case 1:
          GS.guts.logEvent("songUpVoted", {songID : (this.getSongDetails(a.queue.queueID, [b]))[0].SongID});
          break ;
        default:
          break ;
      }
    }
}
), flagSong : (function (b,c)
{
  if (a.player)
    {
      a.player.flagSong(b, c);
      $.publish("gs.notification", {message : $.localize.getString("SUCCESS_FLAG_SONG")});
    }
}
), getVolume : (function ()
{
  if (a.player)
    return a.player.getVolume();
}
), setVolume : (function (b)
{
  b = Math.max(0, Math.min(100, parseInt(b, 10)));
  a.player && a.player.setVolume(b);
}
), getCrossfadeAmount : (function ()
{
  if (a.player)
    return a.player.getCrossfadeAmount();
}
), getCrossfadeEnabled : (function ()
{
  if (a.player)
    return a.player.getCrossfadeEnabled();
}
), setCrossfadeAmount : (function (b)
{
  b = parseInt(b, 10);
  a.player && a.player.setCrossfadeAmount(b);
}
), setCrossfadeEnabled : (function (b)
{
  b = b && GS.user.IsPremium ? true : false;
  a.player && a.player.setCrossfadeEnabled(b);
  GS.user.settings.changeLocalSettings({crossfadeEnabled : b ? 1 : 0});
}
), setPrefetchEnabled : (function (b)
{
  b = b ? true : false;
  a.player && a.player.setPrefetchEnabled(b);
}
), getPrefetchEnabled : (function ()
{
  if (a.player)
    return a.player.getPrefetchEnabled();
}
), setLowerQuality : (function (b)
{
  b = b ? true : false;
  a.player && a.player.setLowerQuality(b);
}
), getLowerQuality : (function ()
{
  if (a.player)
    return a.player.getLowerQuality();
}
), getIsMuted : (function ()
{
  if (a.player)
    return a.player.getIsMuted();
}
), setIsMuted : (function (b)
{
  b = b ? true : false;
  a.player && a.player.setIsMuted(b);
}
), getPlayPauseFade : (function ()
{
  if (a.player)
    return a.player.getPlayPauseFade();
}
), setPlayPauseFade : (function (b)
{
  b = b ? true : false;
  a.player && a.player.setPlayPauseFade(b);
  GS.user.settings.changeLocalSettings({playPauseFade : b ? 1 : 0});
}
), setRepeat : (function (b)
{
  a.repeat = b;
  a.player && a.player.setRepeat(b);
}
), getRepeat : (function ()
{
  if (a.player && a.player.getRepeat)
    return a.player.getRepeat();
  return a.repeat;
}
), setShuffle : (function (b)
{
  if (! a.queue.autoplayEnabled)
    {
      b = b ? true : false;
      a.player && a.player.setShuffle(b);
      GS.user.settings.changeLocalSettings({lastShuffle : b ? 1 : 0});
    }
}
), getShuffle : (function ()
{
  if (a.player)
    return a.player.getShuffle();
}
), setPersistShuffle : (function (b)
{
  b = b ? true : false;
  a.player && a.player.setPersistShuffle(b);
}
), getAPIVersion : (function ()
{
  if (a.player)
    return a.player.getAPIVersion();
}
), getApplicationVersion : (function ()
{
  if (a.player)
    return a.player.getApplicationVersion();
}
), updateSongOnPlayer : (function (b,c)
{
  c = _.orEqual(c, false);
  if (! (! c && a.currentSong && a.currentSong.queueSongID === b.queueSongID))
    {
      a.currentSong = b && ! (b  instanceof  GS.Models.Song) ? (GS.Models.Song.wrapQueue([b]))[0] : b;
      if (a.currentSong  instanceof  GS.Models.Song)
        {
          $.publish("gs.player.nowplaying", a.currentSong);
          $("#queue_list li.queue-item.queue-item-active").removeClass("active");
          $("#queue_list #" + a.currentSong.queueSongID).addClass("active");
          $("#playerDetails_nowPlaying").html(a.view("currentSongDetails")).attr("rel", a.currentSong.SongID).attr("qsid", a.currentSong.queueSongID);
          _.defined(a.currentSong.index) && a.gsQueue.setActive(a.currentSong.index, ! a.isMouseDown);
        }
    }
}
), updateQueueDetails : (function (b)
{
  b || (b = a.getCurrentQueue());
  a.queueIsVisible = $("#queue").is(":visible");
  if (b.hasOwnProperty("songs"))
    {
      b.songs.length && ! a.queueIsVisible && ! a.userChangedQueueVisibility && a.toggleQueue();
      if (b.songs.length > 0)
        {
          $("#seeking_wrapper .scrubber").show();
          $("#player_previous").removeAttr("disabled").removeClass("disabled");
        }
      else
        {
          $("#seeking_wrapper .scrubber").hide();
          $("#player_previous").attr("disabled", "disabled").addClass("disabled");
        }
    }
  $("#playerDetails_queue").html(a.view("queueDetails"));
  a.songCountString.hookup("#player_songCount");
  if (b.hasOwnProperty("nextSong"))
    b.nextSong ? $("#player_next").removeAttr("disabled").removeClass("disabled") : $("#player_next", a.element).attr("disabled", "disabled").addClass("disabled");
  if (b.hasOwnProperty("activeSong"))
    if (b.activeSong)
      {
        $("#player_play_pause").removeAttr("disabled").removeClass("disabled");
        a.updateSongOnPlayer(b.activeSong);
      }
    else
      $("#player_play_pause").attr("disabled", "disabled").addClass("disabled");
  if (b.hasOwnProperty("repeatMode"))
    {
      a.repeatMode = b.repeatMode;
      if (a.repeatMode === a.REPEAT_ALL)
        $("#player_loop").removeClass("none").addClass("all").addClass("active");
      else
        if (a.repeatMode === a.REPEAT_ONE)
          $("#player_loop").removeClass("all").addClass("one").addClass("active");
        else
          a.repeatMode === a.REPEAT_NONE && $("#player_loop").removeClass("one").addClass("none").removeClass("active");
    }
  if (b.hasOwnProperty("autoplayEnabled"))
    if (b.autoplayEnabled)
      {
        $("#queue_list").addClass("autoplay");
        $("#player_shuffle").removeClass("active");
        $("#playerDetails button.radio").addClass("active");
        if (b.currentAutoplayTagID > 0)
          {
            var c = $.localize.getString("STATION_" + GS.user.stations[b.currentAutoplayTagID]);
            c || (c = GS.theme.extraStations[b.currentAutoplayTagID]);
            $("#playerDetails_queue .queueType").text(c);
          }
        else
          $("#playerDetails_queue .queueType").text($.localize.getString("NOW_PLAYING"));
      }
    else
      {
        $("#queue_list").removeClass("autoplay");
        $("#playerDetails_queue .queueType").text($.localize.getString("NOW_PLAYING"));
        $("#playerDetails button.radio").removeClass("active");
        b.shuffleEnabled ? $("#player_shuffle").addClass("active") : $("#player_shuffle").removeClass("active");
      }
}
), updateQueueSongs : (function (b)
{
  if (b.hasOwnProperty("songs"))
    if (b.songs.length)
      {
        a.currentSong = b.activeSong;
        a.songs = b.songs;
        a.gsQueue.setActive(b.activeSong.index, false);
        a.gsQueue.setItems(b.songs);
      }
    else
      {
        a.activeSong = b.activeSong;
        a.songs = b.songs;
        $("#playerDetails_nowPlaying").html("");
        a.gsQueue.setActive(0, false);
        a.gsQueue.setItems([]);
      }
}
), updateQueueWidth : (function ()
{
  var b, c, d = a.getCurrentQueue();
  if (d)
    {
      parseInt($("#queue_list_window").css("padding-left"), 10);
      b = $("#queue").width();
      c = $("#queue").height();
      if (d && d.songs && d.songs.length > 0)
        {
          b = a.songWidth * (d.songs.length - 1) + a.activeSongWidth;
          $("#queue_list").removeClass("empty");
        }
      else
        {
          b = b;
          $("#queue_list").addClass("empty").width("");
        }
      c !== $("#queue").height() && a.lastQueueWidth !== b && $(window).resize();
      a.lastQueueWidth = b;
    }
}
), autoscrollWaitDuration : 300, beginDragDrop : (function ()
{
  var b = $("#queue_list"), c = $("#queue_list_window"), d = $("#queue");
  b.bind("draginit", (function (f,g)
{
  var h = $(f.target).closest(".queue-item");
  if (h.length === 0)
    return false;
  g.song = h;
  g.songOffsetLeft = f.clientX - (h.offset()).left;
  g.songOffsetTop = f.clientY - (h.offset()).top;
  var o = $("#queue_list_window").scrollLeft();
  g.startIndex = Math.max(0, Math.min(Math.floor((f.clientX + o) / h.outerWidth(true)), (b.children()).length));
}
)).bind("dragstart", (function (f,g)
{
  g.songProxy = g.song.clone().prepend("<div class=\"status\"></div>").css("position", "absolute").css("zIndex", "99999").addClass("queue-item-drag").appendTo("body");
  g.playerGuide = $("<div id='queue_songGuide'/>").css("position", "absolute").css("zIndex", "99998").css("height", g.song.outerHeight(true)).css("width", 10).css("top", (g.song.offset()).top + 5).hide().appendTo("body");
  g.stopIndex = - 1;
  g.draggedItems = [GS.Models.Song.getOneFromCache(g.song.find(".queueSong").attr("rel"))];
  g.queueLength = (a.getCurrentQueue()).songs.length;
}
)).bind("drag", (function (f,g)
{
  var h = ($(this).offset()).left, o = (d.within(f.clientX, f.clientY)).length > 0, p = 0, q = c.scrollLeft() - 10, t = parseInt(c.width(), 10) * 0.6;
  p = b.parent();
  var A = _.orEqual((a.getCurrentQueue()).activeSong.index, 0);
  g.songProxy.css("top", f.clientY - g.songOffsetTop).css("left", f.clientX - g.songOffsetLeft);
  if (o)
    {
      g.playerGuide.show();
      if ((p.offset()).left + 200 > f.clientX)
        {
          p = Math.max(0, q - t);
          $("#queue_list_window").scrollLeft(p);
          a.gsQueue.updateScrollbar();
          clearInterval(g.autoScrollInterval);
          g.autoScrollInterval = setInterval((function ()
{
  var s = $("#queue_list_window").scrollLeft();
  s = Math.max(0, s - t);
  $("#queue_list_window").scrollLeft(s);
  a.gsQueue.updateScrollbar();
}
), a.autoscrollWaitDuration);
        }
      else
        if (p.width() - 200 < f.clientX)
          {
            p = Math.min(b.width(), q + t);
            $("#queue_list_window").scrollLeft(p);
            a.gsQueue.updateScrollbar();
            clearInterval(g.autoScrollInterval);
            g.autoScrollInterval = setInterval((function ()
{
  var s = $("#queue_list_window").scrollLeft();
  s = Math.min(b.width(), s + t);
  $("#queue_list_window").scrollLeft(s);
  a.gsQueue.updateScrollbar();
}
), a.autoscrollWaitDuration);
          }
        else
          clearInterval(g.autoScrollInterval);
    }
  else
    {
      g.playerGuide.hide();
      clearInterval(g.autoScrollInterval);
    }
  if (f.clientX > parseInt($("#queue_list .queue-item-active").css("left"), 10) + a.activeSongWidth)
    q -= a.activeSongWidth - a.songWidth;
  q = Math.max(0, Math.min(g.queueLength, Math.round((f.clientX + q) / a.songWidth)));
  if (q !== g.stopIndex)
    {
      h = q * a.songWidth + h - g.playerGuide.width() / 2;
      if (q > A)
        h += a.activeSongWidth - a.songWidth;
      g.playerGuide.css("left", h);
      g.stopIndex = q;
    }
  if (g.dropContainers)
    {
      A = o;
      for (B in g.dropContainers)
        if (g.dropContainers.hasOwnProperty(B))
          {
            o = g.dropContainers[B];
            if ((o.within(f.clientX, f.clientY)).length)
              {
                A = true;
                break ;
              }
          }
      A ? g.songProxy.addClass("valid").removeClass("invalid") : g.songProxy.addClass("invalid").removeClass("valid");
    }
}
)).bind("dragend", (function (f,g)
{
  g.playerGuide.remove();
  g.songProxy.remove();
  clearInterval(g.autoScrollInterval);
  if ((d.within(f.clientX, f.clientY)).length > 0)
    if (! (($(".queue-item", b)).length < 2))
      if (! (g.stopIndex < 0))
        {
          queueSongID = g.song.find(".queueSong").attr("id");
          a.moveSongsTo([queueSongID], g.stopIndex);
          GS.sidebar && GS.sidebar.handleHover(f);
        }
}
));
  $("#footer").bind("dropinit", (function (f,g)
{
  var h = $(f.target).closest(".queue-item");
  try
    {
      delete g.dropContainers.player;
    }
  catch (o)
    {}
  if (h.length > 0)
    return false;
  g.initTarget = f.target;
  g.song = $(".queue-item:first", this);
  console.log("queue.dropinit accept drop", f, g);
  if (g.dropContainers)
    g.dropContainers.player = $("#footer");
  else
    g.dropContainers = {player : $("#footer")};
}
)).bind("dropend", (function (f,g)
{
  console.log("queue.dropend", f, g);
  $(this).offset();
  var h = ($("#footer").within(f.clientX, f.clientY)).length > 0, o = (d.within(f.clientX, f.clientY)).length > 0, p = $("#queue_list_window").scrollLeft(), q = [], t;
  if (h)
    if (! (! o && b.is(":visible")))
      if (! (f.clientX === 0 && f.layerX === 0 && f.offsetX === 0 && f.screenX === 0))
        {
          if (typeof g.draggedItems[0].SongID !== "undefined")
            {
              for (h = 0;h < g.draggedItems.length;h++)
                q.push(g.draggedItems[h].SongID);
              var A = [];
              $("#grid .selected[id!=\"showQueue\"]").each((function (B,s)
{
  var G = parseInt($(s).attr("row"), 10) + 1;
  A.push(G);
}
));
              A = A.sort(_.numSortA);
              GS.guts.logEvent("OLSongsDraggedToQueue", {songIDs : q, ranks : A});
            }
          else
            if (typeof g.draggedItems[0].AlbumID !== "undefined")
              for (h = 0;h < g.draggedItems.length;h++)
                g.draggedItems[h].getSongs((function (B)
{
  for (t = 0;t < B.length;t++)
    q.push(B[t].SongID);
}
), null, false, {async : false});
            else
              if (typeof g.draggedItems[0].ArtistID !== "undefined")
                for (h = 0;h < g.draggedItems.length;h++)
                  g.draggedItems[h].getSongs((function (B)
{
  for (t = 0;t < B.length;t++)
    q.push(B[t].SongID);
}
), null, false, {async : false});
              else
                if (typeof g.draggedItems[0].PlaylistID !== "undefined")
                  for (h = 0;h < g.draggedItems.length;h++)
                    g.draggedItems[h].getSongs((function (B)
{
  for (t = 0;t < B.length;t++)
    q.push(B[t].SongID);
}
), null, false, {async : false});
                else
                  if (typeof g.draggedItems[0].UserID !== "undefined")
                    for (h = 0;h < g.draggedItems.length;h++)
                      g.draggedItems[h].getFavoritesByType("Song", (function (B)
{
  for (t = 0;t < B.length;t++)
    q.push(B[t].SongID);
}
), null, false, {async : false});
          h = GS.Models.Song.getManyFromCache(q);
          o = (d.within(f.clientX, f.clientY)).length > 0 || (a.getCurrentQueue()).songs.length > 0 ? false : true;
          p = Math.max(0, Math.min(Math.round((f.clientX + p) / a.songWidth), g.queueLength));
          a.player.addSongsToQueueAt(h, p, o);
          p += 1;
          $(".queue-item:nth-child(" + p + ")", b);
        }
}
));
  $.drop({tolerance : (function (f,g,h)
{
  return this.contains(h, [f.clientX, f.clientY]);
}
)});
}
), managePlayerGuide : (function (b,c)
{
  if (($("#queue").within(b.clientX, b.clientY)).length > 0)
    {
      c.queueLength = _.orEqual(c.queueLength, (a.getCurrentQueue()).songs.length);
      var d = a.activeSongWidth - a.songWidth, f = ($("#queue_list").offset()).left;
      d = $("#queue_list_window").scrollLeft() - 10 - (b.clientX > parseInt($("#queue_list .queue-item-active").css("left"), 10) + a.activeSongWidth ? d : 0);
      $("#queue_list").children();
      var g = (a.getCurrentQueue()).activeSong ? _.orEqual((a.getCurrentQueue()).activeSong.index, 0) : 0;
      stopIndex = Math.max(0, Math.min(c.queueLength, Math.round((b.clientX + d) / a.songWidth)));
      guideLeft = stopIndex * a.songWidth + f - c.playerGuide.width() / 2;
      if (stopIndex > g)
        guideLeft += a.activeSongWidth - a.songWidth;
      c.playerGuide.css("left", guideLeft);
      c.playerGuide.show();
    }
  else
    c.playerGuide.hide();
}
), addQueueSeek : (function ()
{
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
  this.seek.slider({disabled : true, max : 1000, start : (function ()
{
  GS.player.SCRUB_LOCK = true;
}
), stop : (function ()
{
  GS.player.SCRUB_LOCK = false;
}
), change : (function (b,c)
{
  var d = c.value / 1000, f = a.player.getPlaybackStatus();
  a.seekTo(d * f.duration);
}
)});
}
), addQueueMousewheel : (function ()
{
  $("#queue_list_window").mousewheel((function (b,c)
{
  $(this).scrollLeft($(this).scrollLeft() - 82 * c);
}
));
}
), addShortcuts : (function ()
{
  a.volumeSliderTimeout = null;
  a.volumeSliderDuration = 300;
  $(document).bind("keydown", "space", (function (b)
{
  if (! $(b.target).is("input,textarea,select"))
    {
      b.preventDefault();
      a.isPlaying ? a.pauseSong() : a.resumeSong();
    }
}
)).bind("keydown", "ctrl+right", (function ()
{
  a.nextSong();
  return false;
}
)).bind("keydown", "meta+right", (function ()
{
  a.nextSong();
  return false;
}
)).bind("keydown", "ctrl+left", (function ()
{
  a.previousSong();
  return false;
}
)).bind("keydown", "meta+left", (function ()
{
  a.previousSong();
  return false;
}
)).bind("keydown", "ctrl+up", (function ()
{
  a.setVolume(Math.min(100, a.getVolume() + 5));
  $("#volumeSlider").slider("value", a.getVolume());
  $("#volumeControl").show();
  clearTimeout(a.volumeSliderTimeout);
  a.volumeSliderTimeout = setTimeout((function ()
{
  $("#volumeControl").hide();
}
), a.volumeSliderDuration);
  return false;
}
)).bind("keydown", "meta+up", (function ()
{
  a.setVolume(Math.min(100, a.getVolume() + 5));
  $("#volumeSlider").slider("value", a.getVolume());
  $("#volumeControl").show();
  clearTimeout(a.volumeSliderTimeout);
  a.volumeSliderTimeout = setTimeout((function ()
{
  $("#volumeControl").hide();
}
), a.volumeSliderDuration);
  return false;
}
)).bind("keydown", "ctrl+down", (function ()
{
  a.setVolume(Math.max(0, a.getVolume() - 5));
  $("#volumeSlider").slider("value", a.getVolume());
  $("#volumeControl").show();
  clearTimeout(a.volumeSliderTimeout);
  a.volumeSliderTimeout = setTimeout((function ()
{
  $("#volumeControl").hide();
}
), a.volumeSliderDuration);
  return false;
}
)).bind("keydown", "meta+down", (function ()
{
  a.setVolume(Math.max(0, a.getVolume() - 5));
  $("#volumeSlider").slider("value", a.getVolume());
  $("#volumeControl").show();
  clearTimeout(a.volumeSliderTimeout);
  a.volumeSliderTimeout = setTimeout((function ()
{
  $("#volumeControl").hide();
}
), a.volumeSliderDuration);
  return false;
}
));
}
), addVolumeSlider : (function ()
{
  var b = (function (c,d)
{
  var f = "full";
  f = d.value > 75 ? "full" : d.value > 50 ? "threeQuarter" : d.value > 25 ? "half" : d.value > 0 ? "quarter" : "off";
  $("#player_volume").attr("class", "player_control").addClass(f);
  d.value == 0 && a.getIsMuted() ? $("#player_volume").addClass("muted") : a.setVolume(d.value);
}
);
  $("#volumeSlider").slider({orientation : "vertical", range : "min", min : 0, max : 100, slide : b, change : b});
}
), ".queueSong a.play click" : (function (b,c)
{
  c.stopImmediatePropagation();
  var d = a.getCurrentQueue();
  if (d.activeSong && b.attr("rel") == d.activeSong.queueSongID)
    if (a.isPlaying)
      a.pauseSong();
    else
      a.isPaused ? a.resumeSong() : a.playSong(d.activeSong.queueSongID);
  else
    a.playSong(b.attr("rel"));
  return false;
}
), ".queueSong a.remove click" : (function (b,c)
{
  c.stopImmediatePropagation();
  var d = (a.getCurrentQueue()).activeSong;
  a.removeSongs([b.parents(".queueSong").attr("id")]);
  a.queue = false;
  a.queue = a.getCurrentQueue();
  a.updateQueueWidth();
  a.gsQueue.setItems(a.queue.songs);
  if (a.queue.activeSong)
    a.gsQueue.setActive(a.queue.activeSong.index, false);
  else
    d && d.index && d.index > 0 && a.gsQueue.setActive(d.index - 1, false);
  return false;
}
), ".queueSong a.add click" : (function (b,c)
{
  c.stopImmediatePropagation();
  var d = a.getCurrentQueue(), f = b.is(".inLibrary"), g = b.parents(".queueSong").attr("id");
  d = (a.getSongDetails(d.queueID, [g]))[0];
  if (a.currentSong && a.currentSong.queueSongID === d.queueSongID)
    d = a.currentSong;
  if (f)
    {
      b.removeClass("inLibrary").removeClass("isFavorite");
      GS.user.removeFromLibrary(d.SongID);
    }
  else
    {
      b.addClass("inLibrary");
      GS.user.addToLibrary(d.SongID);
    }
  return false;
}
), ".queueSong a.favorite click" : (function (b,c)
{
  c.stopImmediatePropagation();
  var d = a.getCurrentQueue(), f = b.is(".isFavorite"), g = b.parents(".queueSong").attr("id");
  d = (a.getSongDetails(d.queueID, [g]))[0];
  if (a.currentSong && a.currentSong.queueSongID === d.queueSongID)
    d = a.currentSong;
  if (f)
    {
      b.removeClass("isFavorite");
      GS.user.removeFromSongFavorites(d.SongID);
    }
  else
    {
      b.addClass("isFavorite");
      GS.user.addToSongFavorites(d.SongID);
    }
  return false;
}
), ".queueSong a.options click" : (function (b,c)
{
  c.stopImmediatePropagation();
  var d = this.getCurrentQueue(), f = b.parents(".queueSong").attr("id");
  d = (this.getSongDetails(d.queueID, [f]))[0];
  var g = {isQueue : true, flagSongCallback : (function (h)
{
  GS.player.flagSong(f, h);
}
)};
  if ($("div.qsid" + f).is(":visible"))
    {
      $("div.qsid" + f).hide();
      b.removeClass("active-context");
    }
  else
    $(b).jjmenu(c, d.getOptionMenu(g), null, {xposition : "right", yposition : "right", show : "show", className : "queuemenu qsid" + f});
  return false;
}
), ".queueSong .smile click" : (function (b,c)
{
  c.stopImmediatePropagation();
  console.log("player.smile click", b, c);
  var d = $(b).parents(".queueSong").attr("id");
  if ($(b).is(".active"))
    {
      this.voteSong(d, 0);
      $(b).removeClass("active").parent().children().find(".frown").removeClass("active");
    }
  else
    {
      this.voteSong(d, 1);
      $(b).addClass("active").parent().children().find(".frown").removeClass("active");
    }
  return false;
}
), ".queueSong .frown click" : (function (b,c)
{
  c.stopImmediatePropagation();
  console.log("player.frown click", b.get(), c);
  var d = $(b).parents(".queueSong").attr("id");
  if ($(b).is(".active"))
    {
      this.voteSong(d, 0);
      $(b).removeClass("active").parent().children().find(".smile").removeClass("active");
    }
  else
    {
      this.voteSong(d, - 1);
      $(b).addClass("active").parent().children().find(".smile").removeClass("active");
    }
  return false;
}
), ".queueSong click" : (function (b,c)
{
  c.stopImmediatePropagation();
  if (! $(c.target).is("a[href]"))
    {
      var d = b.attr("rel");
      if (d = (d = GS.Models.Song.getOneFromCache(d)) && $.isFunction(d.toUrl) ? d.toUrl() : false)
        location.hash = d;
      return false;
    }
}
), ".queueSong mousedown" : (function (b,c)
{
  c.stopImmediatePropagation();
  if (c.button === 2)
    {
      var d = GS.Models.Song.getOneFromCache(b.attr("rel")), f = b.attr("id"), g = {isQueue : true, flagSongCallback : (function (h)
{
  GS.player.flagSong(f, h);
}
)};
      $(b).jjmenu(c, d.getOptionMenu(g), null, {xposition : "mouse", yposition : "mouse", show : "show", className : "queuemenu"});
    }
  return false;
}
), "#playerDetails_nowPlaying .add click" : (function (b,c)
{
  var d = $("#playerDetails_nowPlaying").attr("rel"), f = b.is(".selected");
  console.log("nowplaying add click", b.get(), c, d, f);
  if (this.getCurrentSong())
    f ? GS.user.removeFromLibrary(d) : GS.user.addToLibrary(d);
  return false;
}
), "#playerDetails_nowPlaying .favorite click" : (function (b,c)
{
  var d = $("#playerDetails_nowPlaying").attr("rel"), f = b.is(".selected");
  console.log("nowplaying favorite click", b.get(), c, d, f);
  if (this.getCurrentSong())
    f ? GS.user.removeFromSongFavorites(d) : GS.user.addToSongFavorites(d);
  return false;
}
), "#playerDetails_nowPlaying .share click" : (function (b,c)
{
  console.log("nowplaying share click", b.get(), c);
  this.getCurrentSong() && GS.lightbox.open("share", {service : "email", type : "song", id : (this.getCurrentSong()).SongID});
  return false;
}
), "#playerDetails_nowPlaying .options click" : (function (b,c)
{
  console.log("nowplaying options click", b.get(), c);
  var d = $("#playerDetails_nowPlaying").attr("rel"), f = (this.getCurrentSong()).queueSongID;
  d = GS.Models.Song.getOneFromCache(d);
  var g = {isQueue : true, flagSongCallback : (function (h)
{
  GS.player.flagSong(f, h);
}
)};
  if ($("div.jjplayerNowPlaying").is(":visible"))
    {
      $("div.jjplayerNowPlaying").hide();
      b.removeClass("active-context");
    }
  else
    $(b).jjmenu(c, d.getOptionMenu(g), null, {xposition : "left", yposition : "top", orientation : "top", show : "show", className : "queuemenu jjplayerNowPlaying"});
}
), "#playerDetails_queue .toggleQueue click" : (function ()
{
  this.toggleQueue();
  this.userChangedQueueVisibility = true;
  return false;
}
), toggleQueue : (function ()
{
  $("#queue").height();
  $("#footer").height();
  $("#queue").is(":visible");
  $("#queue").toggle();
  if (this.queueIsVisible = $("#queue").is(":visible"))
    $("#showQueue").addClass("selected");
  else
    {
      $("#showQueue").removeClass("selected");
      ($("div.queuemenu,div.radiomenu")).length && $("div.jjmenu").remove();
    }
  $(window).resize();
}
), "#player_play_pause click" : (function (b)
{
  var c = this.player.getPlaybackStatus();
  if (c)
    {
      if (c.status === 0)
        this.playSong(c.activeSong.queueSongID);
      else
        if (c.status === 7)
          {
            console.log("status is 4, seek to 0 and start playing");
            this.seekTo(0);
            this.playSong(c.activeSong.queueSongID);
          }
        else
          {
            if (this.isPlaying)
              {
                $(b).removeClass("pause").addClass("play");
                $("#queue_list li.queue-item.queue-item-active a.play").addClass("paused");
                this.pauseSong();
              }
            else
              {
                $(b).removeClass("play").addClass("pause");
                $("#queue_list li.queue-item.queue-item-active a.play").removeClass("paused");
                this.resumeSong();
              }
            $.publish("gs.player.queue.change");
          }
      return false;
    }
}
), "#player_previous click" : (function ()
{
  this.previousSong();
  return false;
}
), "#player_next click" : (function ()
{
  this.nextSong();
  return false;
}
), "#player_shuffle click" : (function (b)
{
  if (! a.queue.autoplayEnabled)
    {
      b.toggleClass("active");
      b = b.is(".active") ? true : false;
      a.setShuffle(b);
      return false;
    }
}
), "#player_loop click" : (function (b)
{
  var c;
  if (b.is(".none"))
    {
      c = a.REPEAT_ALL;
      b.removeClass("none").addClass("all").addClass("active");
    }
  else
    if (b.is(".all"))
      {
        c = a.REPEAT_ONE;
        b.removeClass("all").addClass("one").addClass("active");
      }
    else
      {
        c = a.REPEAT_NONE;
        b.removeClass("one").addClass("none").removeClass("active");
      }
  a.setRepeat(c);
  return false;
}
), "#player_crossfade click" : (function (b)
{
  if (GS.user.UserID > 0 && GS.user.IsPremium)
    {
      b.toggleClass("active");
      b = b.is(".active") ? true : false;
      a.setCrossfadeEnabled(b);
    }
  else
    GS.lightbox.open("vipOnlyFeature");
  return false;
}
), "#player_fullscreen click" : (function ()
{
  return false;
}
), "#player_volume click" : (function (b)
{
  console.log("player_volume toggle", this.getIsMuted());
  if (this.getIsMuted())
    {
      this.setIsMuted(false);
      $(b).removeClass("muted");
      $("#volumeSlider").slider("value", a.player.getVolume());
    }
  else
    {
      this.setIsMuted(true);
      $(b).addClass("muted");
      $("#volumeSlider").slider("value", 0);
    }
  return false;
}
), "#player_volume mouseenter" : (function ()
{
  clearTimeout(this.volumeSliderTimeout);
  $("#volumeControl").show();
  return false;
}
), "#player_volume mouseleave" : (function ()
{
  clearTimeout(this.volumeSliderTimeout);
  this.volumeSliderTimeout = setTimeout(this.callback((function ()
{
  $("#volumeControl").hide();
}
)), this.volumeSliderDuration);
  return false;
}
), "#volumeControl mouseenter" : (function ()
{
  clearTimeout(this.volumeSliderTimeout);
  return false;
}
), "#volumeControl mouseleave" : (function ()
{
  clearTimeout(this.volumeSliderTimeout);
  if (this.isMouseDown)
    {
      var b = this, c = (function ()
{
  $("body").unbind("mouseup", c);
  $("body").unbind("mouseleave", c);
  b.isMouseDown = 0;
  b.volumeSliderTimeout = setTimeout(b.callback((function ()
{
  $("#volumeControl").hide();
}
)), b.volumeSliderDuration);
}
);
      $("body").bind("mouseup", c);
      $("body").bind("mouseleave", c);
    }
  else
    this.volumeSliderTimeout = setTimeout(this.callback((function ()
{
  $("#volumeControl").hide();
}
)), this.volumeSliderDuration);
  return false;
}
), isMouseDown : 0, mousedown : (function ()
{
  this.isMouseDown = 1;
}
), mouseup : (function ()
{
  this.isMouseDown = 0;
}
), "#queue_songs_button click" : (function (b,c)
{
  c.stopPropagation();
  var d = this.getCurrentQueue(), f = this, g = [], h = [], o = GS.Models.Playlist.getPlaylistsMenu([], (function (p)
{
  var q = [];
  p.getSongs((function (t)
{
  for (j = 0;j < t.length;j++)
    q.push(t[j].SongID);
  GS.player.addSongsToQueueAt(q, f.INDEX_REPLACE, true);
}
), null, false, {async : false});
}
), true, false);
  o.length > 0 && g.push({title : $.localize.getString("QUEUE_LOAD_PLAYLIST"), customClass : "playlist", type : "sub", src : o});
  if (d && d.songs && d.songs.length > 0)
    {
      _.forEach(d.songs, (function (p)
{
  h.push(p.SongID);
}
));
      o = GS.Models.Playlist.getPlaylistsMenu(h, (function (p)
{
  for (var q = 0, t = p.songs.length, A = [];q < t;q++)
    A.push(q);
  p.removeSongs(A, false);
  p.addSongs(h, 0, true);
}
), true, true);
      g.push({title : $.localize.getString("QUEUE_SAVE_PLAYLIST"), customClass : "saveQueue", type : "sub", src : o});
      g.length && g.push({customClass : "separator"});
      g.push({title : $.localize.getString("QUEUE_EMBED_SONGS"), customClass : "shareSongs", action : {type : "fn", callback : (function ()
{
  var p, q = [];
  for (p = 0;p < d.songs.length;p++)
    q.push(d.songs[p].SongID);
  GS.lightbox.open("share", {service : "widget", type : "manySongs", id : q});
}
)}});
      g.push({title : $.localize.getString("QUEUE_VIEW_SONGS"), customClass : "viewSongs", action : {type : "fn", callback : (function ()
{
  window.location.hash = "#/now_playing";
}
)}});
    }
  else
    return false;
  if ($("div.jjQueueMenu").is(":visible"))
    {
      $("div.jjQueueMenu").hide();
      b.removeClass("active-context");
    }
  else
    $(b).jjmenu(c, g, null, {xposition : "right", yposition : "top", orientation : "top", spill : "left", show : "show", className : "radiomenu jjQueueMenu"});
  return false;
}
), "#queue_radio_button click" : (function (b,c)
{
  var d = this.getCurrentQueue(), f = this, g = [];
  g.push({title : $.localize.getString("QUEUE_LOAD_STATION"), customClass : "stations", type : "sub", src : (function ()
{
  var h = [], o = false;
  $.each(GS.user.stations, (function (p,q)
{
  o = ! o;
  h.push({title : $.localize.getString("STATION_" + q), customClass : "station " + (o ? "odd" : "even"), action : {type : "fn", callback : (function ()
{
  f.setAutoplay(true, p);
}
)}});
}
));
  h.sort((function (p,q)
{
  var t = p.title.toLowerCase(), A = q.title.toLowerCase();
  return t == A ? 0 : t > A ? 1 : - 1;
}
));
  return h;
}
)()});
  if (d.autoplayEnabled)
    {
      g.push({customClass : "separator"});
      g.push({title : $.localize.getString("QUEUE_TURN_OFF_RADIO"), action : {type : "fn", callback : (function ()
{
  f.player && (f.player.getCurrentQueue()).autoplayEnabled && f.player.setAutoplay(false);
}
)}});
    }
  else
    if (d && d.songs && d.songs.length > 0)
      {
        g.push({customClass : "separator"});
        g.push({title : $.localize.getString("QUEUE_TURN_ON_RADIO"), action : {type : "fn", callback : (function ()
{
  if (f.player)
    (f.player.getCurrentQueue()).autoplayEnabled || f.player.setAutoplay(true);
}
)}});
      }
  if ($("div.jjRadioMenu").is(":visible"))
    {
      $("div.jjRadioMenu").hide();
      b.removeClass("active-context");
    }
  else
    $(b).jjmenu(c, g, null, {xposition : "right", yposition : "top", orientation : "top", spill : "left", show : "show", className : "radiomenu jjRadioMenu"});
  return false;
}
), "#queue_clear_button click" : (function ()
{
  var b = this.getCurrentQueue();
  if (b.hasRestoreQueue)
    a.restoreQueue();
  else
    b && b.songs && b.songs.length > 0 && a.clearQueue();
  $(this).toggleClass("undo", ! b.hasResoreQueue);
}
), queueSongToHtml : (function (b,c,d)
{
  var f = "paused", g = [], h = a.getCurrentQueue(), o = "", p = b.fromLibrary ? "inLibrary" : "", q = b.isFavorite ? "isFavorite" : "", t = "", A = "";
  if (h.activeSong && b.queueSongID === h.activeSong.queueSongID)
    {
      o += " active";
      if (a.isPlaying)
        f = "";
    }
  if (h.autoplayEnabled)
    {
      if (b.autoplayVote === - 1 || c === d - 1 && b.source !== "user")
        o += " greyOut";
      if (b.autoplayVote === 1 || b.autoplayVote === 0 && b.source === "user")
        {
          t = "active";
          A = "";
        }
      else
        if (b.autoplayVote === - 1)
          {
            A = "active";
            t = "";
          }
    }
  g.push("<div id=\"", b.queueSongID, "\" rel=\"", b.SongID, "\" class=\"", o, " queueSong\">", "<a class=\"remove\" title=\"", $.localize.getString("removeSong"), "\"></a>", "<div class=\"albumart\">", "<div class=\"radio_options ", h && h.autoplayEnabled ? "active" : "", "\">", "<a class=\"smile ", t, "\" title=\"", $.localize.getString("QUEUE_ITEM_SMILE"), "\"></a>", "<a class=\"frown ", A, "\" title=\"", $.localize.getString("QUEUE_ITEM_FROWN"), "\"></a>", "</div>", "<div class=\"song_options ", p, " ", q, "\">", "<a class=\"add ", p, " textToggle\" title=\"", $.localize.getString("QUEUE_ADD_SONG_LIBRARY_TITLE"), "\"></a>", "<a class=\"favorite ", q, " textToggle\" title=\"", $.localize.getString("QUEUE_ADD_SONG_FAVORITE_TITLE"), "\"></a>", "<a class=\"options selectbox\" title=\"", $.localize.getString("QUEUE_ITEM_OPTIONS"), "\"></a>", "</div>", "<a class=\"play ", f, "\" rel=\"", b.queueSongID, "\"></a>", "<img src=\"", b.getImageURL(), "\" height=\"100%\" width=\"100%\" />", "</div>", "<a title=\"", _.cleanText(b.SongName), "\" class=\"queueSong_name song ellipsis\">", _.cleanText(b.SongName), "</a>", "<a href=\"", _.cleanUrl(b.ArtistName, b.ArtistID, "artist"), "\" title=\"", _.cleanText(b.ArtistName), "\" class=\"queueSong_artist artist ellipsis\">", _.cleanText(b.ArtistName), "</a>", "</div>");
  return g.join("");
}
), smallQueueSongToHtml : (function (b,c,d)
{
  var f = "paused", g = [], h = a.getCurrentQueue(), o = "", p = b.fromLibrary ? "inLibrary" : "", q = b.isFavorite ? "isFavorite" : "", t = "", A = "";
  if (h.activeSong && b.queueSongID === h.activeSong.queueSongID)
    {
      o += " active";
      if (a.isPlaying)
        f = "";
    }
  if (h.autoplayEnabled)
    {
      if (b.autoplayVote === - 1 || c === d - 1 && b.source !== "user")
        o += " greyOut";
      if (b.autoplayVote === 1 || b.autoplayVote === 0 && b.source === "user")
        {
          t = "active";
          A = "";
        }
      else
        if (b.autoplayVote === - 1)
          {
            A = "active";
            t = "";
          }
    }
  g.push("<div id=\"", b.queueSongID, "\" rel=\"", b.SongID, "\" class=\"", o, " queueSong\">", "<a class=\"remove\" title=\"", $.localize.getString("removeSong"), "\"></a>", "<div class=\"radio_options ", h && h.autoplayEnabled ? "active" : "", "\">", "<a class=\"smile ", t, "\" title=\"", $.localize.getString("QUEUE_ITEM_SMILE"), "\"></a>", "<a class=\"frown ", A, "\" title=\"", $.localize.getString("QUEUE_ITEM_FROWN"), "\"></a>", "</div>", "<div class=\"song_options ", p, " ", q, "\">", "<a class=\"add ", p, " textToggle\" title=\"", $.localize.getString("QUEUE_ADD_SONG_LIBRARY_TITLE"), "\"></a>", "<a class=\"favorite ", q, " textToggle\" title=\"", $.localize.getString("QUEUE_ADD_SONG_FAVORITE_TITLE"), "\"></a>", "<a class=\"options selectbox\" title=\"", $.localize.getString("QUEUE_ITEM_OPTIONS"), "\"></a>", "</div>", "<a class=\"play ", f, "\" rel=\"", b.queueSongID, "\"></a>", "<a title=\"", _.cleanText(b.SongName), "\" class=\"queueSong_name song ellipsis\">", _.cleanText(b.SongName), "</a>", "<a href=\"", _.cleanUrl(b.ArtistName, b.ArtistID, "artist"), "\" title=\"", _.cleanText(b.ArtistName), "\" class=\"queueSong_artist artist ellipsis\">", _.cleanText(b.ArtistName), "</a>", "</div>");
  return g.join("");
}
)});
}
)();
  (function ()
{
  function a(g)
  {
    return "<span class='slick-column-name' data-translate-text='" + g.name + "'>" + $.localize.getString(g.name) + "</span>";
  }
  function b(g,h,o,p,q)
  {
    g = _.ucwords(p.name);
    h = $("#grid").controller();
    return q.isVerified == 0 ? p.name == "ARTIST" ? h.filter.hasOwnProperty("onlyVerified") && ! h.filter.onlyVerified ? "<div class=\"showMore showingMore\" data-translate-text=\"SEARCH_RESULTS_SHOW_LESS\">" + $.localize.getString("SEARCH_RESULTS_SHOW_LESS") + "</div>" : "<div class=\"showMore\" data-translate-text=\"SEARCH_RESULTS_SHOW_MORE\">" + $.localize.getString("SEARCH_RESULTS_SHOW_MORE") + "</div>" : "" : ["<a class=\"field\" href=\"", p.name == "SONG" ? "javascript:_.redirectSong(" + q.SongID + ", event)" : p.name == "USER" ? _.cleanUrl(q.Username, q.UserID, "user") : _.cleanUrl(q[(g + "Name")], q[(g + "ID")], p.name.toLowerCase()), "\" class=\"ellipsis\" title=\"", o, "\">", o, "</a>"].join("");
  }
  function c(g,h,o)
  {
    return ["<span class=\"filter field ellipsis\" title=\"", o, "\">", o, "</span>"].join("");
  }
  function d(g,h,o,p,q)
  {
    if (q.isVerified == 0)
      return "";
    else
      {
        g = q.isFavorite ? " isFavorite" : "";
        h = q.fromLibrary ? " inLibrary" : "";
        p = q.isFavorite ? "SONG_ROW_REMOVE_SONG_FAVORITE_TITLE" : "SONG_ROW_ADD_SONG_FAVORITE_TITLE";
        var t = q.fromLibrary ? "SONG_ROW_REMOVE_SONG_LIBRARY_TITLE" : "SONG_ROW_ADD_SONG_LIBRARY_TITLE";
        return ["<a class=\"play\" data-translate-title=\"SONG_ROW_ADD_SONG_PLAY_TITLE\" title=\"", $.localize.getString("SONG_ROW_ADD_SONG_PLAY_TITLE"), "\"></a><ul class=\"options ", h, g, "\" rel=\"", q.SongID, "\"><li class=\"favorite\"  data-translate-title=\"", p, "\" title=\"", $.localize.getString(p), "\"><a></a></li><li class=\"library\" data-translate-title=\"", t, "\" title=\"", $.localize.getString(t), "\"><a></a></li><li class=\"more\" data-translate-title=\"SONG_ROW_OPTION_MORE\" title=\"", $.localize.getString("SONG_ROW_OPTION_MORE"), "\"><a><span>More...</span></a></li></ul><span class=\"songName ellipsis\" title=\"", o, "\">", o, "</span>"].join("");
      }
  }
  function f(g,h,o)
  {
    o = o == "0" ? "&nbsp;" : o;
    return ["<span class=\"track\">", o, "</span>"].join("");
  }
  GS.Controllers.BaseController.extend("GS.Controllers.GridController", {columns : {song : [{id : "song", name : "SONG", field : "SongName", cssClass : "song", formatter : d, behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "artist", name : "ARTIST", field : "ArtistName", cssClass : "artist", formatter : b, behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "album", name : "ALBUM", field : "AlbumName", cssClass : "album", formatter : b, behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "track", name : "TRACK_NUM", field : "TrackNum", cssClass : "track", maxWidth : 50, formatter : f, behavior : "selectAndMove", sortable : true, columnFormatter : a}], albumSongs : [{id : "song", name : "SONG", field : "SongName", cssClass : "song", formatter : d, behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "artist", name : "ARTIST", field : "ArtistName", cssClass : "artist", formatter : b, behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "track", name : "TRACK_NUM", field : "TrackNum", cssClass : "track", maxWidth : 50, formatter : f, behavior : "selectAndMove", sortable : true, columnFormatter : a}], queuesong : [{id : "song", name : "SONG", field : "SongName", cssClass : "song", formatter : (function (g,h,o,p,q)
{
  return ["<a class=\"play ", GS.player.isPlaying ? "" : "paused", "\" rel=\"", q.queueSongID, "\"><span>Play</span></a><ul class=\"options", q.fromLibrary ? " inLibrary" : "", q.isFavorite ? " isFavorite" : "", "\" rel=\"", q.SongID, "\"><li class=\"favorite\"><a></a></li><li class=\"library\"><a></a></li><li class=\"more\"><a></a></li></ul><span class=\"songName ellipsis\" title=\"", o, "\">" + o + "</span>"].join("");
}
), behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "artist", name : "ARTIST", field : "ArtistName", cssClass : "artist", formatter : (function (g,h,o,p,q)
{
  g = q.autoplayVote == 1 || q.autoplayVote == 0 && q.source === "user" ? "selected" : "";
  h = q.autoplayVote == - 1 ? "selected" : "";
  var t = _.ucwords(p.name);
  p = _.cleanUrl(q[(t + "Name")], q[(t + "ID")], p.name.toLowerCase());
  return ["<ul class=\"options\"><li class=\"smile ", g, "\"><a></a></li><li class=\"frown ", h, "\"><a></a></li></ul><a class=\"field ellipsis\" href=\"", p, "\" title=\"", o, "\">", o, "</a>"].join("");
}
), behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "album", name : "ALBUM", field : "AlbumName", cssClass : "album", formatter : b, behavior : "selectAndMove", sortable : true, columnFormatter : a}, {id : "track", name : "TRACK_NUM", field : "TrackNum", cssClass : "track", maxWidth : 50, formatter : f, behavior : "selectAndMove", sortable : true, columnFormatter : a}], album : [{id : "album", name : "ALBUM", field : "AlbumName", cssClass : "albumDetail", formatter : (function (g,h,o,p,q)
{
  g = "<a href=\"" + q.toArtistUrl() + "\">" + q.ArtistName + "</a>";
  g = $("<span></span>").localeDataString("BY_ARTIST", {artist : g});
  return ["<a href=\"", q.toUrl(), "\" class=\"image\"><img src=\"", q.getImageURL("m"), "\" width=\"40\" height=\"40\" class=\"avatar\" /></a><a href=\"", q.toUrl(), "\" class=\"title ellipsis\">", q.AlbumName, "</a><span class=\"byline\">", g.render(), "</span>"].join("");
}
), behavior : "selectAndMove", sortable : true, columnFormatter : a}], artist : [{id : "artist", name : "ARTIST", field : "ArtistName", cssClass : "artist-row", formatter : b, behavior : "selectAndMove", sortable : true, columnFormatter : a}], playlist : [{id : "playlist", name : "PLAYLIST", field : "PlaylistName", cssClass : "playlist", formatter : (function (g,h,o,p,q)
{
  g = q.isFavorite ? " subscribed" : "";
  h = q && q.NumSongs && q.Artists ? true : false;
  o = q.isFavorite ? "Unsubscribe" : "Subscribe";
  g = q.UserID === GS.user.UserID ? "" : ["<a class=\"subscribe ", g, "\" rel=\"", q.PlaylistID, "\"><span>", o, "</span></a>"].join("");
  if (h)
    {
      h = q.Artists.split(",");
      o = h.length;
      h.splice(3, h.length);
      o = o > h.length ? "..." : "";
      return ["<a href=\"", _.cleanUrl(q.PlaylistName, q.PlaylistID, "playlist"), "\" class=\"image\"><img src=\"", q.getImageURL(), "\" width=\"40\" height=\"40\" class=\"albumart\" /></a>", g, "<a href=\"", _.cleanUrl(q.PlaylistName, q.PlaylistID, "playlist"), "\">", q.PlaylistName, " (", q.NumSongs, " Songs) </a><span class=\"author\">by <a href=\"", _.cleanUrl(q.UserID, q.Username, "user"), "\">", q.Username, "</a>,   <span class=\"artists\"><span data-translate-text=\"includes\">includes</span>: ", h.join(", "), o, "</span></span>"].join("");
    }
  else
    return ["<a href=\"", _.cleanUrl(q.PlaylistName, q.PlaylistID, "playlist"), "\" class=\"image\"><img src=\"", q.getImageURL(), "\" width=\"40\" height=\"40\" class=\"albumart\" /></a>", g, "<a href=\"", _.cleanUrl(q.PlaylistName, q.PlaylistID, "playlist"), "\">", q.PlaylistName, "</a><span class=\"author\">by <a href=\"", _.cleanUrl(q.UserID, q.Username, "user"), "\">", q.Username, "</a></span>"].join("");
}
), behavior : "selectAndMove", sortable : true, columnFormatter : a}], user : [{id : "username", name : "USER", field : "Username", cssClass : "user", formatter : (function (g,h,o,p,q)
{
  g = q.isFavorite ? " following" : "";
  h = q.isFavorite ? "UNFOLLOW" : "FOLLOW";
  g = q.UserID === GS.user.UserID ? "" : ["<a class=\"follow ", g, "\" rel=\"", q.UserID, "\"><span data-translate-text=\"" + h + "\">", $.localize.getString(h), "</span></a>"].join("");
  h = _.cleanUrl(q.UserID, q.Username, "user");
  o = "<div class=\"status " + q.getUserPackage() + "\"></div>";
  return ["<a href=\"", h, "\" class=\"who image\">", o, "<img src=\"", q.getImageURL(), "\" width=\"40\" height=\"40\" class=\"avatar\" /></a><a class=\"follow content\"><span>", g, "</span></a><a href=\"", h, "\">", q.Username, "</a><span class=\"location\">", q.Country, "</span>"].join("");
}
), behavior : "selectAndMove", sortable : true}], albumFilter : [{id : "album", name : "ALBUM", field : "AlbumName", cssClass : "cell-title", formatter : c, behavior : "selectAndMove", sortable : false, collapsable : true, columnFormatter : a}], artistFilter : [{id : "artist", name : "ARTIST", field : "ArtistName", cssClass : "cell-title", formatter : c, behavior : "selectAndMove", sortable : false, collapsable : true, columnFormatter : a}], event : [{id : "artist", name : "ARTIST", field : "ArtistName", cssClass : "cell-title", formatter : (function (g,h,o)
{
  g = (o || "").split(", ");
  h = "";
  o = [];
  for (var p = 0;p < g.length;p++)
    {
      h = p === g.length - 1 ? "" : ",&nbsp;";
      o.push(["<a href=\"#/search?q=", _.cleanText(g[p]), "\" title=\"", _.cleanText(g[p]), "\">", g[p], h, " </a>"].join(""));
    }
  return ["<div class=\"filter\"><span class=\"field ellipsis artist\">", o.join(""), "</span></div>"].join("");
}
), behavior : "none", sortable : false, columnFormatter : a}, {id : "location", name : "LOCATION", field : "Location", cssClass : "cell-title", formatter : (function (g,h,o,p,q)
{
  return ["<div class=\"filter\"><span class=\"field ellipsis venue\" title=\"", q.VenueName, "\">", q.VenueName, "</span><span class=\"field ellipsis city\" title=\"", q.City, "\">", q.City, "</span></div>"].join("");
}
), behavior : "none", sortable : false, columnFormatter : a}, {id : "date", name : "DATE", field : "StartTime", cssClass : "cell-title", formatter : (function (g,h,o,p,q)
{
  g = q.StartTime.split(" ");
  h = g[1] ? g[1].split(":") : "00:00:00";
  g = g[0].split("-");
  newDate = new Date(parseInt(g[0], 10), parseInt(g[1], 10) - 1, parseInt(g[2], 10), parseInt(h[0], 10), parseInt(h[1], 10), parseInt(h[2], 10)).format("D M j Y");
  return ["<div class=\"filter dateTicket\"><span class=\"field ellipsis date\" title=\"", newDate, "\">", newDate, "</span><span class=\"icons ticket\"><a class=\"field ellipsis url\" title=\"", $.localize.getString("BUY_TICKETS"), "\">", $.localize.getString("BUY_TICKETS"), "</a></div>"].join("");
}
), behavior : "none", sortable : false, columnFormatter : a}]}, options : {enableCellNavigation : true, enableCellRangeSelection : true, onCellRangeSelected : (function ()
{
  console.log("cell range select", arguments);
}
), onSelectedRowChanged : (function ()
{
  console.log("selectd row change", arguments);
}
), forceFitColumns : true, rowHeight : 25, editable : false, enableAddRow : false, rowCssClasses : (function (g)
{
  var h = "";
  if (g && g.isVerified == 1)
    h = "verified";
  else
    if (g && g.isVerified == 0)
      h = "verifiedDivider";
  return h;
}
), isSelectable : (function (g)
{
  return g.isVerified == 0 ? false : true;
}
), dragProxy : (function (g)
{
  var h = g;
  if (g.length > 1)
    if (g[0]  instanceof  GS.Models.Song)
      h = _.getString("SELECTION_SONGS_COUNT", {count : g.length});
    else
      if (g[0]  instanceof  GS.Models.Playlist)
        h = _.getString("SELECTION_PLAYLIST_COUNT", {count : g.length});
      else
        if (g[0]  instanceof  GS.Models.Artist)
          h = _.getString("SELECTION_ARTIST_COUNT", {count : g.length});
  return ["<div class=\"status\"></div><span class=\"info\">", h, "</span>"].join("");
}
)}, rowHeights : {song : 25, album : 50, artist : 35, playlist : 50, user : 50, event : 50}, columnsByName : {song : "song", SongName : "song", album : "album", AlbumName : "album", artist : "artist", ArtistName : "artist", playlist : "playlist", PlaylistName : "playlist", user : "user", Username : "user", TrackNum : "track", tracknum : "track", track : "track", event : "user", Event : "user"}, defaultSort : {song : "ArtistName", album : "TrackNum", artist : "Popularity", user : "Username", playlist : "PlaylistName"}, defaultMultiSorts : {SongName : ["isVerified", "SongName", "SongID", "GridKey"], ArtistName : ["isVerified", "ArtistName", "AlbumName", "TrackNum", "SongName", "SongID", "GridKey"], AlbumName : ["isVerified", "AlbumName", "TrackNum", "SongName", "SongID", "GridKey"], TrackNum : ["isVerified", "TrackNum", "SongName", "SongID"], Popularity : ["isVerified", "Popularity", "ArtistName", "AlbumName", "TrackNum", "SongName", "SongID"]}, numericColumns : {Rank : true, Sort : true, TrackNum : true, Popularity : true, Score : true, isVerified : true, GridKey : true, GeoDist : true}}, {dataView : null, grid : null, idProperty : null, selectedRowIDs : [], currentRow : 0, filter : {artistIDs : false, albumIDs : false, onlyVerified : false}, sortCol : "", sortDir : 1, origSortDir : 1, sortNumeric : false, pastSorts : {}, searchString : "", data : null, columns : null, options : null, type : null, SMALL_GRID_WIDTH : 600, resize : (function ()
{
  var g = 0, h = _.orEqual(this.element.attr("data-profile-view"), "0"), o = false;
  if (this.element)
    if (this.element.hasClass("songList"))
      this.element.css({height : Math.min(200, Math.max(25, (this.data || []).length * this.options.rowHeight)), width : this.element.parent().innerWidth()});
    else
      {
        var p = GS.Controllers.GridController.columns.song.concat();
        if (($("#search_side_pane")).length)
          {
            g = $("#search_side_pane").width() + 38;
            if (o = $(this.element).width() < this.SMALL_GRID_WIDTH && p.length > 2)
              g += 4;
          }
        h === "1" ? this.element.css({"overflow-y" : "hidden", height : "auto", width : this.element.parent().width() - g}) : this.element.css({height : $("#page").height() - $("#page_header").height() - $("#theme_page_header:visible").height(), width : this.element.parent().width() - g});
        if (this.grid && this.grid.setColumns && $("#grid").is(".song.everything"))
          {
            g = [p[0], p[1], p[2]];
            this.element.toggleClass("noAlbums", o);
            if (o)
              g = [p[0], p[1]];
            if (this.lastColumnLength !== g.length)
              {
                this.grid.setColumns(g);
                this.lastColumnLength = g.length;
              }
          }
      }
}
), init : (function (g,h,o,p,q,t)
{
  function A(w,u)
  {
    var x, y, D, k, m = _.orEqual(GS.Controllers.GridController.defaultMultiSorts[s.sortCol], $.makeArray(s.sortCol)), n = 1, r = false, v = false, z, C = m.length;
    if (s.options.isFilter)
      {
        m = ["isVerified", s.sortCol];
        C = m.length;
      }
    for (z = 0;z < C;z++)
      {
        n = m[z] === "isVerified" ? s.sortDir ? - 1 : 1 : 1;
        try
          {
            if (GS.Controllers.GridController.numericColumns[m[z]])
              {
                x = parseFloat(w[m[z]], 10);
                y = parseFloat(u[m[z]], 10);
                D = isNaN(x);
                k = isNaN(y);
                x = D ? 0 : x;
                y = k ? 0 : y;
                if (m[z] === "TrackNum")
                  {
                    if (x !== 0 && y === 0)
                      return s.sortDir ? - 1 : 1;
                    if (y !== 0 && x === 0)
                      return s.sortDir ? 1 : - 1;
                  }
              }
            else
              {
                x = w[m[z]].toString().toLowerCase();
                y = u[m[z]].toString().toLowerCase();
              }
            if (x != y)
              return (x > y ? 1 : - 1) * n;
          }
        catch (E)
          {
            console.error("GRID COMPARE ERROR", E, ". grid vars: sortDir: ", s.sortDir, ", sortCol: ", s.sortCol, ", sortNumeric: ", s.sortNumeric);
            console.error(z + ", curSort: " + m[z] + ", a sort: " + w[m[z]] + ", b sort: " + u[m[z]], ", final values: ", "" + x, "" + y);
            console.error(w, u);
            if (_.notDefined(w) || isNaN(w))
              r = true;
            if (_.notDefined(u) || isNaN(u))
              v = true;
            if (r && ! v)
              return - 1;
            if (! r && v)
              return 1;
            return 0;
          }
      }
    return 0;
  }
  q = _.orEqual(q, "song");
  p = _.orEqual(p, {});
  p.rowHeight = _.orEqual(p.rowHeight, GS.Controllers.GridController.rowHeights[q]);
  p.allowDragSort = _.orEqual(p.allowDragSort, false);
  p.allowDuplicates = _.orEqual(p.allowDuplicates, false);
  p = $.extend({}, GS.Controllers.GridController.options, p);
  if (p.allowDragSort)
    p.autoDragScroll = true;
  $(window).resize();
  this.subscribe("gs.auth." + q + ".update", this.callback(q + "Change"));
  this.subscribe("gs.auth.favorites." + q + "s.update", this.callback(q + "FavoritesChange"));
  this.subscribe("gs.player.queue.change", this.callback("queueChange"));
  var B = GS.player.getCurrentQueue();
  this.element.toggleClass("hasSongs", B && B.songs && B.songs.length > 0);
  this.data = h;
  this.columns = o;
  this.options = p;
  this.type = q;
  this.idProperty = this.grid = this.dataView = null;
  this.selectedRowIDs = [];
  this.currentRow = 0;
  this.filter = _.orEqual(p.filters, {artistIDs : false, albumIDs : false, onlyVerified : false});
  this.sortCol = _.orEqual(p.sortCol, GS.Controllers.GridController.defaultSort[q]);
  this.origSortDir = this.sortDir = (this.sortDir = _.orEqual(p.sortDir, 1)) ? true : false;
  this.sortNumeric = GS.Controllers.GridController.numericColumns[this.sortCol] ? true : false;
  this.pastSorts = {};
  this.searchString = "";
  this.allowDragSort = _.orEqual(p.allowDragSort, false);
  var s = this;
  this.idProperty = _.orEqual(t, _.ucwords(q) + "ID");
  this.dataView = new Slick.Data.DataView();
  this.grid = new Slick.Grid($(g), this.dataView.rows, this.columns, this.options);
  this.dataView.setAllowDuplicates(this.options.allowDuplicates);
  this.grid.onContextMenu = (function (w,u)
{
  w.stopPropagation();
  var x = s.grid.getSelectedRows().sort((function (k,m)
{
  return k - m;
}
)), y = [];
  if (! (x.length > 1))
    {
      s.currentRow = u;
      s.grid.setSelectedRows([u]);
      s.grid.onSelectedRowsChanged();
    }
  switch (s.type)
  {
    case "artist":
      y = GS.Models.Artist.getOneFromCache(s.dataView.rows[u].ArtistID).getContextMenu();
      break ;
    case "song":
      if (x.length > 1)
        {
          y = [];
          for (var D = 0;D < x.length;D++)
            y.push(s.dataView.rows[x[D]].SongID);
          y = s.getContextMenuMultiselectForSong(y);
        }
      else
        y = s.getContextMenuForSong(s.dataView.rows[u].SongID);
      break ;
    case "playlist":
      y = GS.Models.Playlist.getOneFromCache(s.dataView.rows[u].PlaylistID).getContextMenu();
      break ;
  }
  $(w.target).jjmenu(w, y, null, {xposition : "mouse", yposition : "mouse", show : "show", className : "contextmenu"});
  return false;
}
);
  this.grid.onDblClick = (function (w,u)
{
  var x = s.dataView.rows[u];
  if (! (($(w.target).parents(".options")).length > 0))
    if (! $(w.target).is("a.play"))
      if (s.options.isNowPlaying && x.queueSongID)
        GS.player.playSong(x.queueSongID);
      else
        if (x.SongID)
          {
            GS.player.addSongAndPlay(x.SongID);
            GS.guts.logEvent("doubleClickToPlay", {songID : x.SongID, rank : parseInt(u, 10) + 1});
          }
}
);
  this.grid.onKeyDown = (function (w)
{
  if (w.which === 65 && w.ctrlKey)
    {
      w = [];
      s.selectedRowIDs = [];
      for (var u = 0;u < s.dataView.rows.length;u++)
        {
          w.push(u);
          s.selectedRowIDs.push(s.dataView.rows[u].id);
        }
      s.currentRow = s.dataView.rows.length - 1;
      s.grid.setSelectedRows(_.arrUnique(w));
      s.grid.onSelectedRowsChanged();
      return true;
    }
  if (s.handleKeyPress(w))
    return true;
  return false;
}
);
  this.grid.onSelectedRowsChanged = (function ()
{
  s.selectedRowIDs = [];
  var w, u, x = s.grid.getSelectedRows().sort((function (D,k)
{
  return D - k;
}
)), y = {};
  if (s.options.isFilter)
    {
      if (x.length === 1 && x[0] === 0 && (s.dataView.getItemByIdx(0))[s.idProperty] === - 1)
        x = [];
      w = x.indexOf(0);
      if (w > - 1)
        {
          x.splice(w, 1);
          s.grid.setSelectedRows(x);
          s.grid.onSelectedRowsChanged();
          return ;
        }
      x.length === 0 ? $(".slick-row[row=0]", s.element).addClass("selected") : $(".slick-row[row=0]", s.element).removeClass("selected");
    }
  w = 0;
  for (l = x.length;w < l;w++)
    if (u = s.dataView.rows[x[w]])
      {
        s.selectedRowIDs.push(u[s.idProperty]);
        y[u[s.idProperty]] = true;
      }
  s.selectedRowIDs = _.arrUnique(s.selectedRowIDs);
  if (s.options.isFilter)
    if (s.type === "album")
      {
        if (x.length === 0)
          ($(".gs_grid.songs").controller()).filter.albumIDs = false;
        else
          ($(".gs_grid.songs").controller()).filter.albumIDs = y;
        ($(".gs_grid.songs").controller()).dataView.refresh();
      }
    else
      if (s.type === "artist")
        {
          if (x.length === 0)
            {
              ($(".gs_grid.songs").controller()).filter.artistIDs = false;
              ($(".gs_grid.albums").controller()).filter.artistIDs = false;
            }
          else
            {
              ($(".gs_grid.songs").controller()).filter.artistIDs = y;
              ($(".gs_grid.albums").controller()).filter.artistIDs = y;
            }
          ($(".gs_grid.songs").controller()).dataView.refresh();
          ($(".gs_grid.albums").controller()).dataView.refresh();
          ($(".gs_grid.albums").controller()).grid.onSelectedRowsChanged();
        }
  s.currentRow = _.orEqual((s.grid.getSelectedRows())[(x.length - 1)], 0);
  $.publish("gs.grid.selectedRows", {len : s.selectedRowIDs.length, type : s.type});
}
);
  $(".slick-header-column").click((function ()
{
  $(this).addClass("selected");
  $(this).siblings().removeClass("selected");
}
));
  this.grid.onSort = (function (w,u)
{
  var x;
  s.sortCol = w.field ? w.field : w;
  if (typeof u === "undefined")
    u = _.defined(s.pastSorts[s.sortCol]) ? ! s.pastSorts[s.sortCol] : true;
  s.sortDir = u ? true : false;
  s.element.find(".slick-sort-indicator").removeClass("slick-sort-indicator-asc").removeClass("slick-sort-indicator-desc");
  x = GS.Controllers.GridController.columnsByName[s.sortCol];
  if (_.defined(x))
    s.grid.setSortColumn(x, s.sortDir);
  else
    s.sortDir = s.origSortDir;
  s.pastSorts[s.sortCol] = s.sortDir;
  s.sortNumeric = GS.Controllers.GridController.numericColumns[s.sortCol] ? true : false;
  s.dataView.sort(s.callback(A), s.sortDir);
  if (! s.options.isFilter)
    {
      x = $("a[name=sort][rel=" + s.sortCol + "]");
      x.parent().parent().parent().siblings("button").find("span.label").html(x.find("span").text());
      s.options.sortStoreKey && $.publish("gs.grid.onsort", {sortCol : s.sortCol, sortDir : s.sortDir, sortStoreKey : s.options.sortStoreKey});
    }
}
);
  s.dataView.onRowCountChanged.subscribe((function ()
{
  s.grid.updateRowCount();
  s.grid.render();
  s.grid.autosizeColumns();
}
));
  s.dataView.onRowsChanged.subscribe((function (w)
{
  s.grid.removeRows(w);
  s.grid.render();
  if (s.selectedRowIDs.length > 0)
    {
      w = [];
      for (var u, x = 0, y = s.selectedRowIDs.length;x < y;x++)
        {
          u = s.dataView.getRowById(s.selectedRowIDs[x]);
          u !== undefined && w.push(u);
        }
      s.currentRow = _.orEqual(u, 0);
      s.grid.setSelectedRows(_.arrUnique(w));
      s.grid.onSelectedRowsChanged();
    }
}
));
  s.grid.onBeforeMoveRows = (function ()
{
  if (s.allowDragSort)
    return true;
  return false;
}
);
  s.grid.onMoveRows = (function (w,u)
{
  console.log("self.grid.onMoveRows", w, u);
  var x = [], y = [], D = [], k = s.dataView.getItems(), m, n, r;
  if (! (! s.allowDragSort || s.sortCol !== "Sort"))
    if (s.options.playlistID)
      {
        console.log("DRAG REARRANGE PLAYLSIT", w, u);
        (x = GS.Models.Playlist.getOneFromCache(s.options.playlistID)) && x.moveSongsTo(w, u);
      }
    else
      {
        m = k.slice(0, u);
        n = k.slice(u, k.length);
        for (r = 0;r < w.length;r++)
          {
            k[w[r]].Sort = r;
            x.push(k[w[r]]);
          }
        w.sort().reverse();
        for (r = 0;r < w.length;r++)
          {
            k = w[r];
            k < u ? m.splice(k, 1) : n.splice(k - u, 1);
          }
        k = m.concat(x.concat(n));
        for (r = 0;r < k.length;r++)
          k[r].Sort = r + 1;
        s.data = k;
        for (r = 0;r < w.length;r++)
          y.push(m.length + r);
        y = _.arrUnique(y);
        s.currentRow = y[(y.length - 1)];
        s.dataView.beginUpdate();
        s.grid.setSelectedRows(y);
        s.grid.onSelectedRowsChanged();
        s.dataView.setItems(s.data, s.idProperty);
        s.dataView.endUpdate();
        s.dataView.refresh();
        if (s.options.isNowPlaying)
          {
            m = u;
            for (r = 0;r < x.length;r++)
              {
                D.push(x[r].queueSongID);
                y = $("#queue .queueSong:nth-child(" + u + ")");
                y.after($("#" + x[r].queueSongID).remove());
                u += 1;
              }
            GS.player.moveSongsTo(D, m);
          }
      }
}
);
  if (s.allowDragSort)
    {
      var G = $("#grid"), H = $("#grid .slick-viewport");
      G.bind("dropinit", (function (w,u)
{
  var x = $(w.target).closest(".slick-row");
  try
    {
      delete u.dropContainers.grid;
    }
  catch (y)
    {}
  if (x.length > 0)
    return false;
  u.initTarget = w.target;
  console.log("grid.dropinit accept drop");
  if (u.dropContainers)
    u.dropContainers.grid = G;
  else
    u.dropContainers = {grid : G};
}
)).bind("dropend", (function (w,u)
{
  function x(D)
  {
    var k = GS.Models.Playlist.getOneFromCache(s.options.playlistID), m = [], n;
    for (n = 0;n < D.length;n++)
      m.push(D[n].SongID);
    s.options.playlistID ? k.addSongs(m) : GS.player.addSongsToQueueAt(m);
  }
  var y;
  if ((H.within(w.clientX, w.clientY)).length > 0)
    if (typeof u.draggedItems[0].SongID !== "undefined")
      x(u.draggedItems);
    else
      if (typeof u.draggedItems[0].AlbumID !== "undefined")
        for (y = 0;y < u.draggedItems.length;y++)
          u.draggedItems[y].getSongs(x, null, false, {async : false});
      else
        if (typeof u.draggedItems[0].ArtistID !== "undefined")
          for (y = 0;y < u.draggedItems.length;y++)
            u.draggedItems[y].getSongs(x, null, false, {async : false});
        else
          if (typeof u.draggedItems[0].PlaylistID !== "undefined")
            for (y = 0;y < u.draggedItems.length;y++)
              u.draggedItems[y].getSongs(x, null, false, {async : false});
          else
            if (typeof u.draggedItems[0].UserID !== "undefined")
              for (y = 0;y < u.draggedItems.length;y++)
                u.draggedItems[y].getFavoritesByType("Song", x, null, false, {async : false});
}
));
    }
  s.dataView.beginUpdate();
  s.dataView.setItems(s.data, s.idProperty);
  s.dataView.setFilter((function (w)
{
  if (s.options.isFilter && w.isFilterAll)
    return true;
  if (s.searchString != "" && w.searchText.indexOf(s.searchString) == - 1)
    return false;
  if (s.filter.hasOwnProperty("onlyVerified") && s.filter.onlyVerified && w.isVerified === - 1)
    return false;
  if (s.filter.artistIDs && ! s.filter.artistIDs[w.ArtistID])
    return false;
  if (s.filter.albumIDs && ! s.filter.albumIDs[w.AlbumID])
    return false;
  return true;
}
));
  s.dataView.endUpdate();
  s.sortCol !== "" && s.grid.onSort(s.sortCol, s.sortDir);
  if (s.options.isFilter)
    {
      s.grid.setSelectedRows([0]);
      s.grid.onSelectedRowsChanged();
    }
  setTimeout((function ()
{
  $(window).resize();
}
), 500);
}
), update : (function ()
{
  }
), songChange : (function (g)
{
  var h = $("#page").is(".gs_page_playlist") ? ($("#page").controllers(GS.Controllers.Page.PlaylistController))[0] : false;
  h = h ? h.playlist.songIDLookup[g.SongID] : this.dataView.getItemById(g[this.idProperty]);
  if (! h)
    return false;
  for (o in g)
    if (g.hasOwnProperty(o))
      h[o] = g[o];
  this.dataView.updateItem(h[this.idProperty], h);
}
), albumChange : (function (g)
{
  var h = this.dataView.getItemById(g[this.idProperty]);
  if (! h)
    {
      console.error("grid.albumChange. bad album", h);
      return false;
    }
  for (o in g)
    if (g.hasOwnProperty(o))
      h[o] = g[o];
  this.dataView.updateItem(h.AlbumID, h);
}
), artistChange : (function (g)
{
  var h = this.dataView.getItemById(g[this.idProperty]);
  if (! h)
    {
      console.error("grid.artistChange. bad artist", h);
      return false;
    }
  for (o in g)
    if (g.hasOwnProperty(o))
      h[o] = g[o];
  this.dataView.updateItem(h.ArtistID, h);
}
), playlistChange : (function (g)
{
  var h = this.dataView.getItemById(g[this.idProperty]);
  if (h)
    {
      for (o in g)
        if (g.hasOwnProperty(o))
          h[o] = g[o];
      this.dataView.updateItem(h.PlaylistID, h);
    }
  else
    console.error("grid.playlistChange. bad playlist", h);
}
), userChange : (function (g)
{
  var h = this.dataView.getItemById(g[this.idProperty]);
  if (! h)
    {
      console.error("grid.userChange. bad user", h);
      return false;
    }
  for (o in g)
    if (g.hasOwnProperty(o))
      h[o] = g[o];
  this.dataView.updateItem(h.UserID, h);
}
), songFavoritesChange : (function ()
{
  this.data = this.dataView.getItems();
  for (var g = 0;g < this.data.length;g++)
    if (GS.user.favorites.songs[this.data[g].SongID])
      {
        this.data[g].isFavorite = 1;
        this.data[g].fromLibrary = 1;
        this.dataView.updateItem(this.data[g].SongID, this.data[g]);
      }
  this.dataView.beginUpdate();
  this.dataView.setItems(this.data, "SongID");
  this.dataView.endUpdate();
}
), albumFavoritesChange : (function ()
{
  this.data = this.dataView.getItems();
  for (var g = 0;g < this.data.length;g++)
    if (GS.user.favorites.albums[this.data[g].AlbumID])
      {
        this.data[g].isFavorite = 1;
        this.dataView.updateItem(this.data[g].SongID, this.data[g]);
      }
  this.dataView.beginUpdate();
  this.dataView.setItems(this.data, "AlbumID");
  this.dataView.endUpdate();
}
), artistFavoritesChange : (function ()
{
  this.data = this.dataView.getItems();
  for (var g = 0;g < this.data.length;g++)
    if (GS.user.favorites.artists[this.data[g].ArtistID])
      this.data[g].isFavorite = 1;
  this.dataView.beginUpdate();
  this.dataView.setItems(this.data, "ArtistID");
  this.dataView.endUpdate();
}
), playlistFavoritesChange : (function ()
{
  this.data = this.dataView.getItems();
  for (var g = 0;g < this.data.length;g++)
    if (GS.user.favorites.playlists[this.data[g].PlaylistID])
      this.data[g].isFavorite = 1;
  this.dataView.beginUpdate();
  this.dataView.setItems(this.data, "PlaylistID");
  this.dataView.endUpdate();
}
), userFavoritesChange : (function ()
{
  this.data = this.dataView.getItems();
  for (var g = 0;g < this.data.length;g++)
    if (GS.user.favorites.users[this.data[g].UserID])
      this.data[g].isFavorite = 1;
}
), queueChange : (function (g)
{
  g || (g = GS.player.getCurrentQueue());
  this.element && this.element.toggleClass("hasSongs", g && g.songs && g.songs.length > 0);
}
), getContextMenuForSong : (function (g)
{
  var h = parseInt(this.grid.getSelectedRows()) + 1;
  GS.guts.logEvent("rightClickSongItem", {songID : g, rank : h});
  h = [{title : $.localize.getString("CONTEXT_PLAY_SONG_NOW"), action : {type : "fn", callback : (function ()
{
  GS.player.addSongAndPlay(g);
}
)}, customClass : "first"}, {title : $.localize.getString("CONTEXT_PLAY_SONG_NEXT"), action : {type : "fn", callback : (function ()
{
  GS.player.addSongsToQueueAt([g], GS.player.INDEX_NEXT);
}
)}}, {title : $.localize.getString("CONTEXT_PLAY_SONG_LAST"), action : {type : "fn", callback : (function ()
{
  GS.player.addSongsToQueueAt([g], GS.player.INDEX_LAST);
}
)}}, {customClass : "separator"}, {title : $.localize.getString("CONTEXT_ADD_TO"), type : "sub", src : [{title : $.localize.getString("CONTEXT_ADD_TO_PLAYLIST_MORE"), type : "sub", src : GS.Models.Playlist.getPlaylistsMenu(g, (function (q)
{
  q.addSongs([g], null, true);
}
)), customClass : "first"}, {title : $.localize.getString("MY_MUSIC"), action : {type : "fn", callback : (function ()
{
  GS.user.addToLibrary(g);
}
)}}, {title : $.localize.getString("FAVORITES"), action : {type : "fn", callback : (function ()
{
  GS.user.addToSongFavorites(g);
}
)}, customClass : "last"}]}, {title : $.localize.getString("CONTEXT_SHARE_SONG"), type : "sub", src : [{title : $.localize.getString("SHARE_EMAIL"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("share", {service : "email", type : "song", id : g});
}
)}, customClass : "first"}, {title : $.localize.getString("SHARE_FACEBOOK"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("share", {service : "facebook", type : "song", id : g});
}
)}}, {title : $.localize.getString("SHARE_TWITTER"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("share", {service : "twitter", type : "song", id : g});
}
)}}, {title : $.localize.getString("SHARE_STUMBLE"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("share", {service : "stumbleupon", type : "song", id : g});
}
)}}, {title : $.localize.getString("SHARE_WIDGET"), action : {type : "fn", callback : (function ()
{
  GS.lightbox.open("share", {service : "widget", type : "song", id : g});
}
)}, customClass : "last"}, {title : $.localize.getString("COPY_URL"), type : "sub", action : {type : "fn", callback : this.callback((function ()
{
  ZeroClipboard && GS.Models.Song.getSong(g, (function (q)
{
  if (q)
    {
      var t = ["http://listen.grooveshark.com/" + q.toUrl().replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(q.AlbumName, q.AlbumID, "album").replace("#/", ""), "http://listen.grooveshark.com/" + _.cleanUrl(q.ArtistName, q.ArtistID, "artist").replace("#/", "")];
      q = $("div[id^=jjmenu_main_sub]");
      if (window.contextMenuClipboards)
        {
          window.contextMenuClipboards[0].reposition(($("div.songUrl", q))[0]);
          window.contextMenuClipboards[1].reposition(($("div.albumUrl", q))[0]);
          window.contextMenuClipboards[2].reposition(($("div.artistUrl", q))[0]);
        }
      else
        window.contextMenuClipboards = [new ZeroClipboard.Client(($("div.songUrl", q))[0]), new ZeroClipboard.Client(($("div.albumUrl", q))[0]), new ZeroClipboard.Client(($("div.artistUrl", q))[0])];
      $.each(window.contextMenuClipboards, (function (A,B)
{
  B.setText(t[A]);
  if (! B.hasCompleteEvent)
    {
      B.addEventListener("complete", (function (s,G)
{
  $("div[id^=jjmenu]").remove();
  console.log("Copied: ", G);
}
));
      B.hasCompleteEvent = true;
    }
}
));
      $("div.songUrl", q).bind("remove", (function ()
{
  try
    {
      $.each(window.contextMenuClipboards, (function (B,s)
{
  s.hide();
}
));
    }
  catch (A)
    {}
}
));
      $("div[name$=Url]", q).show();
    }
}
));
}
))}, customClass : "last copyUrl", src : [{title : $.localize.getString("SONG_URL"), customClass : "songUrl"}, {title : $.localize.getString("ALBUM_URL"), customClass : "albumUrl"}, {title : $.localize.getString("ARTIST_URL"), customClass : " artistUrl"}]}]}, {title : $.localize.getString("CONTEXT_BUY_SONG"), action : {type : "fn", callback : this.callback((function ()
{
  GS.lightbox.open("buySong", g);
}
))}, customClass : "last"}];
  var o = 0;
  if (! GS.user.isLoggedIn)
    for (var p = 0;p < h.length;p++)
      if (h[p].title == $.localize.getString("CONTEXT_SHARE_SONG") && h[p].src)
        {
          for (;h[p].src[o];)
            if (! GS.user.isLoggedIn && h[p].src[o].title == $.localize.getString("SHARE_EMAIL"))
              {
                h[p].src.splice(o, 1);
                o = Math.min(h[p].src.length, Math.max(0, o--));
              }
            else
              o++;
          o = 0;
        }
  return h;
}
), getContextMenuMultiselectForSong : (function (g)
{
  var h = this, o = this.grid.getSelectedRows();
  _.forEach(o, (function (p,q)
{
  o[q] += 1;
}
));
  o = o.sort(_.numSortA);
  GS.guts.logEvent("rightClickSongItems", {songIDs : g, ranks : o});
  return [{title : $.localize.getString("CONTEXT_PLAY_SONGS_NOW"), action : {type : "fn", callback : (function ()
{
  GS.player.addSongsToQueueAt(g, GS.player.INDEX_DEFAULT, true);
}
)}, customClass : "first"}, {title : $.localize.getString("CONTEXT_PLAY_SONGS_NEXT"), action : {type : "fn", callback : (function ()
{
  GS.player.addSongsToQueueAt(g, GS.player.INDEX_NEXT);
}
)}}, {title : $.localize.getString("CONTEXT_PLAY_SONGS_LAST"), action : {type : "fn", callback : (function ()
{
  GS.player.addSongsToQueueAt(g, GS.player.INDEX_LAST);
}
)}}, {customClass : "separator"}, {title : $.localize.getString("CONTEXT_ADD_TO"), type : "sub", src : [{title : $.localize.getString("CONTEXT_ADD_TO_PLAYLIST_MORE"), type : "sub", src : GS.Models.Playlist.getPlaylistsMenu(g, (function (p)
{
  p.addSongs(g, null, true);
}
)), customClass : "first"}, {title : $.localize.getString("MY_MUSIC"), action : {type : "fn", callback : (function ()
{
  GS.user.addToLibrary(h.selectedRowIDs);
}
)}}, {title : $.localize.getString("FAVORITES"), action : {type : "fn", callback : (function ()
{
  for (var p = 0;p < h.selectedRowIDs.length;p++)
    GS.user.addToSongFavorites(h.selectedRowIDs[p]);
}
)}, customClass : "last"}]}, {customClass : "separator"}, {title : $.localize.getString("CONTEXT_REPLACE_ALL_SONGS"), action : {type : "fn", callback : (function ()
{
  var p = GS.player.isPlaying;
  GS.player.clearQueue();
  GS.player.addSongsToQueueAt(g, GS.player.INDEX_LAST, p);
}
)}, customClass : "last"}];
}
), "input.search keyup" : (function (g)
{
  Slick.GlobalEditorLock.cancelCurrentEdit();
  if (e.which == 27)
    g.value = "";
  this.searchString = g.value.toLowerCase();
  this.dataView.refresh();
}
), ".grid-canvas click" : (function (g,h)
{
  if (($(h.target).parents(".slick-row")).length === 0)
    {
      self.currentRow = 0;
      this.grid.setSelectedRows([]);
      this.grid.onSelectedRowsChanged();
    }
}
), "* keydown" : (function (g,h)
{
  this.handleKeyPress(h);
}
), ".slick-collapse-indicator click" : (function (g,h)
{
  h.preventDefault();
  $(g).parents("div.page_column").toggleClass("collapsed");
  $(g).parents("div.page_column").hasClass("collapsed") ? $(".page_column_fixed.collapsed").width(this.grid.getScrollWidth()) : $(".page_column_fixed").width(175);
  $(window).resize();
  $(".gs_grid:visible").resize();
}
), handleKeyPress : (function (g)
{
  if ((g.which === 38 || g.which === 40) && g.shiftKey)
    {
      var h = this.grid.getSelectedRows().sort((function (q,t)
{
  return q - t;
}
));
      _.orEqual(h[(h.length - 1)], 1);
      var o, p;
      o = this.currentRow + (g.which === 38 ? - 1 : 1);
      o = Math.max(0, Math.min(this.dataView.rows.length - 1, o));
      if ($.inArray(o, h) === - 1)
        {
          h.push(o);
          this.selectedRowIDs.push((this.dataView.getItemByIdx(o)).SongID);
          this.currentRow = o;
          this.grid.setSelectedRows(_.arrUnique(h));
          this.grid.onSelectedRowsChanged();
        }
      else
        if (g.which === 38)
          {
            if (o < this.currentRow)
              {
                p = $.inArray(this.currentRow, h);
                _.arrRemove(h, p, p);
                this.currentRow = o;
                p = $.inArray(this.currentRow, h);
                _.arrRemove(h, p, p);
                h.push(this.currentRow);
                this.grid.setSelectedRows(_.arrUnique(h));
                this.grid.onSelectedRowsChanged();
              }
          }
        else
          if (o > this.currentRow)
            {
              p = $.inArray(this.currentRow, h);
              _.arrRemove(h, p, p);
              this.currentRow = o;
              p = $.inArray(this.currentRow, h);
              _.arrRemove(h, p, p);
              h.push(this.currentRow);
              this.grid.setSelectedRows(_.arrUnique(h));
              this.grid.onSelectedRowsChanged();
            }
      g.preventDefault();
      return true;
    }
  return false;
}
), "a.field click" : (function (g)
{
  g = $(g).attr("href");
  var h = parseInt((this.grid.getSelectedRows())[0]) + 1, o = $("#grid .selected ul.options").attr("rel");
  GS.guts.handleFieldClick(g, h, o);
}
)});
}
)();
  GS.Controllers.BaseController.extend("GS.Controllers.AdController", {onDocument : true}, {rotateTimer : 0, rotationTime : 60000, defaultRotationTime : 60000, maxRotationTime : 360000, lastActive : null, lastRotation : null, campaignArtists : {}, campaignsByCampaignID : {}, userCampaigns : [], init : (function ()
{
  $.subscribe("gs.auth.update", this.callback(this.update));
  $.subscribe("gs.player.nowplaying", this.callback(this.onSongPlay));
  this.lastActive = new Date();
  var a = this;
  $("body").bind("mousemove", (function ()
{
  a.lastActive = new Date();
}
));
}
), ready : (function ()
{
  this.update();
}
), update : (function ()
{
  this.user = GS.user;
  this.parseCampaignsForUser();
  GS.user.IsPremium ? this.hideAdBar() : this.showAdBar();
  $(window).resize();
  setTimeout(this.callback(this.loadPixel), 10000);
}
), onSongPlay : (function (a)
{
  if (this.campaignArtists && this.campaignArtists[a.ArtistID]  instanceof  Array)
    for (var b = 0;b < this.campaignArtists[a.ArtistID].length;b++)
      {
        var c = this.campaignArtists[a.ArtistID][b];
        if (c)
          {
            var d = this.campaignsByCampaignID[c];
            if (! d)
              {
                d = {id : c, count : 1};
                this.campaignsByCampaignID[c] = d;
                this.userCampaigns.push(d);
              }
          }
      }
}
), parseCampaignsForUser : (function ()
{
  this.userCampaigns = [];
  this.campaignsByCampaignID = {};
  var a = store.get("artistsPlayed" + (this.user ? this.user.UserID : - 1));
  if (this.campaignArtists && a)
    for (var b = 0;b < a.length;b++)
      {
        var c = a[b];
        if (c && this.campaignArtists[c]  instanceof  Array)
          for (var d = 0;d < this.campaignArtists[c].length;d++)
            {
              var f = this.campaignArtists[c][d];
              if (f)
                {
                  var g = this.campaignsByCampaignID[f];
                  if (g)
                    g.count++;
                  else
                    {
                      g = {id : f, count : 1};
                      this.campaignsByCampaignID[f] = g;
                      this.userCampaigns.push(g);
                    }
                }
            }
      }
}
), showAdBar : (function ()
{
  $("#capital").show();
  $("#application").css("margin-right", "180px");
  $("#capitalFrameWrapper").children("iframe").attr("src", "");
  clearInterval(this.rotateTimer);
  this.rotateTimer = setInterval(this.callback("onRotateTimer"), this.defaultRotationTime);
  this.chooseAd();
}
), hideAdBar : (function ()
{
  $("#capital").hide();
  $("#application").css("margin-right", 0);
  $("#capitalFrameWrapper").children("iframe").attr("src", "");
  GS.player.updateQueueWidth();
  clearInterval(this.rotateTimer);
}
), onRotateTimer : (function ()
{
  if (this.lastActive && ! GS.user.IsPremium)
    {
      var a = new Date().valueOf(), b = a - this.lastActive.valueOf();
      a = a - this.lastRotation.valueOf();
      if (b <= this.defaultRotationTime)
        {
          this.rotationTime = this.defaultRotationTime;
          this.chooseAd();
        }
      else
        if (a >= this.rotationTime && this.rotationTime <= this.maxRotationTime)
          {
            this.rotationTime += this.rotationTime;
            this.chooseAd();
          }
    }
}
), chooseAd : (function ()
{
  var a = new Date();
  this.lastRotation ? console.log("rotating, time since last rotation: ", a.valueOf() - this.lastRotation.valueOf()) : console.log("rotating, this is first rotation");
  this.lastRotation = a;
  this.setAd("/sidebar.php" + this.buildParams());
}
), buildParams : (function ()
{
  var a = [];
  if (GS.theme && GS.theme.currentTheme)
    {
      var b = parseInt(GS.theme.currentTheme.themeID, 10);
      b && a.push("ThemeID=" + b);
    }
  GS.player && GS.player.getCurrentSong() && a.push("CurArtist=" + (GS.player.getCurrentSong()).ArtistID);
  if (this.userCampaigns && this.userCampaigns.length)
    {
      this.userCampaigns.sort((function (g,h)
{
  return h.count - g.count;
}
));
      (b = campaigns[0].id) && a.push("Bucket=" + b);
    }
  if (GS.user.isLoggedIn)
    {
      GS.user.Sex && a.push("Gender=" + GS.user.Sex);
      if (GS.user.TSDOB)
        {
          b = GS.user.TSDOB.split("-");
          if (b.length == 3)
            {
              var c = new Date(), d = c.getFullYear() - parseInt(b[0], 10);
              if (parseInt(b[1], 10) > c.month)
                d -= 1;
              else
                if (parseInt(b[1], 10) == c.month && parseInt(b[2], 10) > c.date)
                  d -= 1;
              var f;
              if (d >= 13 && d < 18)
                f = "13-17";
              else
                if (d >= 18 && d < 25)
                  f = "18-24";
                else
                  if (d >= 25 && d < 35)
                    f = "25-34";
                  else
                    if (d >= 35 && d < 50)
                      f = "35-49";
                    else
                      if (d >= 50)
                        f = "50-";
              f && a.push("AgeRange=" + f);
            }
        }
    }
  a = a.concat(this.getRapParams());
  return "?" + a.join("&");
}
), loadPixel : (function ()
{
  if (GS.user.isLoggedIn)
    {
      var a = [];
      if (GS.user.TSDOB)
        {
          var b = GS.user.TSDOB.split("-");
          if (b.length == 3)
            {
              var c = new Date(), d = c.getFullYear() - parseInt(b[0], 10);
              if (parseInt(b[1], 10) > c.month)
                d -= 1;
              else
                if (parseInt(b[1], 10) == c.month && parseInt(b[2], 10) > c.date)
                  d -= 1;
            }
          a.push("100=" + d);
        }
      GS.user.Sex && a.push("200=" + GS.user.Sex);
      if (GS.user.Email)
        {
          a.push("300=" + hex_md5(GS.user.Email));
          a.push("400=" + hex_sha1(GS.user.Email));
        }
      this.setPixel("/pixels.php" + "?" + a.join("&"));
    }
}
), setAd : (function (a)
{
  var b = $("#capitalFrameWrapper").children("iframe");
  if (b.length > 1)
    {
      for (var c = b.length - 1;c > 0;c--)
        b.eq(c).unbind("load").remove();
      b = b.eq(0);
    }
  var d = b.clone();
  d.css("visibility", "hidden");
  d.bind("load", (function ()
{
  b.unbind("load").remove();
  d.css("visibility", "visible");
}
));
  d.attr("src", a);
  $("#capitalFrameWrapper").append(d);
}
), setPixel : (function (a)
{
  var b = $("#pixelFrameWrapper").children("iframe");
  if (b.length > 1)
    {
      for (var c = b.length - 1;c > 0;c--)
        b.eq(c).unbind("load").remove();
      b = b.eq(0);
    }
  c = b.clone();
  c.css("visibility", "hidden");
  c.bind("load", (function ()
{
  b.unbind("load").remove();
}
));
  c.attr("src", a);
  $("#pixelFrameWrapper").append(c);
}
), getRapParams : (function ()
{
  var a = [], b = store.get("personalize" + GS.user.UserID);
  if (! b)
    return a;
  if (b.length >= 0)
    return a;
  if (jQuery.isEmptyObject(b))
    return a;
  ! GS.user.TSDOB && b.age && a.push("AgeRange=" + b.age);
  if (! GS.user.Sex && b.gender)
    a.push("Gender=" + (b.gender == "Male" ? "M" : "F"));
  return a;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.GUTSController", {onDocument : true}, {shouldLog : false, server : "/guts", appID : "html", context : false, bufferLength : 10, localLogs : [], init : (function ()
{
  this.shouldLog = _.orEqual(gsConfig.shouldUseGuts, false);
  this.server = _.orEqual(gsConfig.gutsServer, false);
  this.context = {};
  this.currentPage = {};
  this.currentPage.pageType = "home";
  this.currentPage.section = "";
  this.currentPage.subpage = "";
  this.currentPage.id = "";
  this.beginContext({sessionID : GS.service.sessionID});
  this.beginContext({initTime : new Date().getTime()});
  this.logEvent("init", {});
  GS.User && GS.UserID && GS.UserID > 0 && this.beginContext({userID : GS.user.UserID});
}
), beginContext : (function (a)
{
  _.forEach(a, (function (b,c)
{
  if (a.hasOwnProperty(c))
    this.context[c] = a[c];
}
), this);
}
), endContext : (function (a)
{
  _.defined(this.context[a]) && delete this.context[a];
}
), logEvent : (function (a,b)
{
  if (this.shouldLog)
    {
      var c = {time : new Date().getTime(), lpID : a, state : {}, context : {}};
      currentContext = this.context;
      _.forEach(currentContext, (function (d,f)
{
  if (currentContext.hasOwnProperty(f))
    if ($.isArray(currentContext[f]))
      {
        this.context[f] = [];
        _.forEach(currentContext[f], (function (g,h)
{
  this.push(h);
}
), this.context[f]);
      }
    else
      this.context[f] = _.orEqual(currentContext[f], "").toString();
}
), c);
      _.forEach(b, (function (d,f)
{
  if (b.hasOwnProperty(f))
    c.state[f] = _.orEqual(d, "").toString();
}
), c);
      this.localLogs.push(c);
      this.checkSendCondition() && this.sendLogs();
    }
}
), checkSendCondition : (function ()
{
  return this.localLogs.length >= this.bufferLength;
}
), forceSend : (function ()
{
  this.sendLogs();
}
), sendLogsTimeout : false, sendLogsWait : 500, sendLogs : (function (a)
{
  clearTimeout(this.sendLogsTimeout);
  this.sendLogsTimeout = setTimeout(this.callback((function ()
{
  if (this.localLogs.length > 0)
    {
      var b = this.toTransmissionFormat(this.localLogs), c = true;
      a = _.orEqual(a, 0);
      if (a >= 3)
        console.log("guts.sendRequest. numRetries maxed out. ", request);
      else
        {
          if (a > 0)
            c = false;
          var d = this;
          $.ajax({contentType : "text/xml", type : "POST", data : b, url : this.server, cache : c, success : (function (f,g,h)
{
  console.log("guts.sendlogs.success. status: " + g + ", request: ", h);
  if (! f)
    {
      a++;
      console.log("guts.success NO DATA.  retry request again", h);
      setTimeout(d.callback((function ()
{
  this.sendLogs(a);
}
)), 100 + a * 100);
    }
}
), error : (function (f,g,h)
{
  console.log("guts.sendlogs.error. status: " + g + ", error: " + h, f);
}
)});
          this.localLogs = [];
        }
    }
}
)), this.sendLogsWait);
}
), toTransmissionFormat : (function (a)
{
  var b = {result : new Date().getTime() + "\n", appID : this.appID};
  _.forEach(a, (function (c,d)
{
  var f = /\:/, g = /\\/, h = a[d];
  this.result += this.appID + "\t";
  this.result += h.lpID + "\t";
  var o = h.context;
  _.forEach(o, (function (q,t)
{
  if (o.hasOwnProperty(t))
    this.result += t + ":" + o[t].replace(g, "\\\\").replace(f, "\\:") + "\t";
}
), this);
  var p = h.state;
  _.forEach(p, (function (q,t)
{
  if (p.hasOwnProperty(t))
    this.result += t + ":" + p[t].replace(g, "\\\\").replace(f, "\\:") + "\t";
}
), this);
  this.result += h.time + "\n";
}
), b);
  return b.result;
}
), handlePageLoad : (function (a,b)
{
  switch (a)
  {
    case "user":
      switch (b.length)
      {
        case 1:
          this.logPageLoad({type : a});
          break ;
        case 2:
          this.logPageLoad({type : a, id : b.id});
          break ;
        case 3:
          this.logSubpageLoad({type : b.section});
          break ;
        case 4:
          this.logSubpageLoad({type : b.subpage});
          break ;
        default:
          break ;
      }
      break ;
    case "home":
    case "upload":
      this.logPageLoad({type : a});
      break ;
    case "playlist":
    case "album":
    case "artist":
      switch (b.length)
      {
        case 2:
          this.logEvent("loadPage", {type : a, id : b.id});
          this.beginContext({currentPageType : a});
          break ;
        case 3:
          this.logEvent("loadSubpage", {type : b.subpage});
          this.beginContext({currentSubpage : b.subpage});
          break ;
        default:
          break ;
      }
      break ;
    case "search":
      if (b.type == "everything")
        {
          this.logEvent("loadPage", {type : "search"});
          this.beginContext({currentPageType : "search"});
        }
      else
        {
          this.logEvent("loadSubpage", {type : b.type});
          this.beginContext({currentPageType : "search"});
          this.beginContext({currentSubpage : b.type});
        }
      break ;
    case "popular":
      switch (b.length)
      {
        case 1:
          this.logPageLoad({type : a});
          break ;
        case 2:
          this.logSubpageLoad({type : "monthly"});
          break ;
        default:
          break ;
      }
      break ;
    case "now_playing":
      this.logPageLoad({type : "now playing"});
      break ;
    case "song":
      switch (b.length)
      {
        case 2:
          this.logPageLoad({type : a});
          break ;
        case 3:
          this.logSubpageLoad({type : b.subpage});
          break ;
      }
      break ;
    default:
      this.logPageLoad({type : a});
      break ;
  }
  this.type != "search" && ! b.subpage && ! b.section && this.context.currentSubpage && this.endContext("currentSubpage");
  this.updateCurrentPage(b);
}
), updateCurrentPage : (function (a)
{
  this.currentPage.pageType = a.type;
  this.currentPage.id = a.id;
  this.currentPage.section = a.section;
  this.currentPage.subpage = a.subpage;
}
), logPageLoad : (function (a)
{
  a.id ? this.logEvent("loadPage", {type : a.type, id : a.id}) : this.logEvent("loadPage", {type : a.type});
  this.beginContext({currentPageType : a.type});
  this.endContext("currentSubpage");
}
), logSubpageLoad : (function (a)
{
  this.logEvent("loadSubpage", {type : a.type});
  this.beginContext({currentSubpage : a.type});
}
), handleFieldClick : (function (a,b,c)
{
  if (a.indexOf("artist") > - 1)
    GS.guts.logEvent("OLartistPageLoad", {rank : b, songID : c});
  else
    a.indexOf("album") > - 1 && GS.guts.logEvent("OLalbumPageLoad", {rank : b, songID : c});
}
), handleFeedEventClick : (function (a)
{
  var b = {};
  switch ($(a).attr("tagName"))
  {
    case "A":
      feedEvent = $(a).parents(".event");
      if ($(a).attr("href"))
        {
          var c = $(a).attr("href").split("/");
          b.clickedType = c[1];
          b.clickedID = c[3];
        }
      else
        b.clickedType = $(a).attr("class");
      break ;
    case "LI":
      feedEvent = $(a).parents(".event");
      a = $(a).attr("class").split(" ");
      a = a[(a.length - 1)];
      if (a == "option")
        b.clickedType = "playSongs";
      else
        if (a == "show")
          b.clickedType = "showSongs";
      break ;
    default:
      break ;
  }
  b.rank = $(feedEvent).index() + 1;
  var d = $(feedEvent).attr("class");
  c = d.split(" ");
  b.whoseFeed = (c[2].split("user"))[1];
  _.forEach(c, (function (o,p)
{
  if (c[p].indexOf("type") > - 1)
    b.eventType = c[p].substring(4, c[p].length);
}
), b);
  var f = {};
  $(".what>a[class!=\"showSongs\"]", feedEvent).each((function ()
{
  var o = $(this).attr("href");
  if (o !== undefined)
    {
      o = o.split("/");
      var p = o[1];
      if (f[p])
        f[p] += 1;
      else
        f[p] = 1;
      b[p + f[p]] = o[3];
    }
}
));
  var g = {};
  $("#feed>li").each((function ()
{
  d = $(this).attr("class");
  c = d.split(" ");
  var o = c[1].substring(4, c[1].length);
  if (g[o])
    g[o] += 1;
  else
    g[o] = 1;
}
));
  var h = "";
  _.forEach(g, (function (o,p)
{
  h = h + p + ";" + o + ",";
}
), h);
  h = h.slice(0, h.length - 1);
  b.counts = h;
  this.logEvent("feedEventClick", b);
}
), objectListPlayAdd : (function (a,b,c)
{
  var d, f;
  switch (c)
  {
    case "play":
      d = "OLPlayClick";
      break ;
    case "add":
      d = "OLAddClick";
      break ;
    default:
      break ;
  }
  b = $("#grid .selected", b);
  if (b.length > 0)
    {
      f = "";
      $(b).each((function ()
{
  f = f + parseInt($(this).attr("row")) + 1 + ",";
}
));
      f = f.slice(0, f.length - 1);
      this.logEvent(d, {songIDs : a, ranks : f});
    }
}
), songItemLibraryClick : (function (a,b)
{
  this.logEvent("OLlibraryClick", {songID : a, rank : b});
}
), songItemFavoriteClick : (function (a,b)
{
  this.logEvent("OLfavoriteClick", {songID : a, rank : b});
}
), songsRemovedFromQueue : (function (a)
{
  var b = a.details.items;
  if (a)
    {
      var c = "";
      _.forEach(b, (function (d,f)
{
  c = c + f[d].songID + ",";
}
), c);
      c = c.slice(0, c.length - 1);
      GS.guts.logEvent("songsRemovedFromQueue", {songIDs : c});
    }
}
), handleSearchSidebarClick : (function (a,b,c)
{
  b = a.attr("href");
  b = b.substr(0, b.indexOf("?"));
  var d = b.split("/");
  b = d[1];
  if (b == "search")
    {
      b = "seeAll";
      this.logEvent("searchSidebarClick", {section : c, linkType : b});
    }
  else
    {
      d = d[3];
      $(a).attr("class") == "image" ? this.logEvent("searchSidebarClick", {section : c, linkType : b, id : d, imageClick : "true"}) : this.logEvent("searchSidebarClick", {section : c, linkType : b, id : d});
    }
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.LocaleController", {onWindow : true}, {locale : "en", init : (function ()
{
  var a = this, b = (store.get("gs.locale") || gsConfig.lang || this.detectLangauge() || this.locale).substring(0, 2);
  $("[data-translate-text]").localize("gs", {language : b});
  $("[data-translate-title]").localize("gs", {language : b, callback : "titleCallback"});
  $.subscribe("gs.locale.update", (function (c)
{
  a.locale = c;
  $("[data-translate-text]").localize("gs", {language : c});
  $("[data-translate-title]").localize("gs", {language : c, callback : "titleCallback"});
  store.set("gs.locale", c);
}
));
  this.locale = b;
}
), detectLangauge : (function ()
{
  var a = window.navigator;
  return a.language || a.browserLanguage || a.systemLanguage || a.userLanguage;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.FacebookController", {onDocument : true}, {APPLICATION_ID : "111132365592157", SERVICE_ID : 4, FACEBOOK_ONLY_SERVICE_ID : 16, PERMISSIONS : "offline_access,publish_stream,email,rsvp_event,read_stream,user_about_me,user_likes,user_interests,user_location,user_birthday", WALL_FAVORITES : 1, WALL_PLAYLIST_CREATE : 2, WALL_PLAYLIST_SUBSCRIBE : 4, RATE_LIMIT : 300000, profile : null, friends : null, registeredWithFacebook : false, flags : 0, lastPost : 0, lastPostParams : null, connectStatus : "unknown", connected : false, onLoginSaveData : null, init : (function ()
{
  $.subscribe("gs.auth.update", this.callback(this.update));
}
), initFacebook : (function ()
{
  if (window.FB && window.FB.init)
    {
      FB.init({appId : this.APPLICATION_ID, status : true, cookie : false, xfbml : true});
      console.log("FACEBOOK INIT");
      FB.getLoginStatus(this.callback(this.onFacebookLoginStatus));
      FB.Event.subscribe("auth.statusChange", this.callback(this.onFacebookLoginStatus));
    }
}
), ready : (function ()
{
  this.update();
}
), update : (function ()
{
  if (GS.user && GS.user.isLoggedIn && (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID))
    {
      this.registeredWithFacebook = GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID;
      GS.service.getUserFacebookData(this.callback("onUserFacebookData", null, null));
    }
  else
    if (GS.user && GS.user.isLoggedIn && this.onLoginSaveData == GS.user.email)
      this.save(0, null, (function ()
{
  GS.facebook.clearInfo();
}
));
    else
      {
        this.friends = this.profile = null;
        this.flags = 0;
        this.connected = false;
        if (window.FB && window.FB.init)
          {
            FB.init({appId : this.APPLICATION_ID, status : true, cookie : false, xfbml : true});
            FB.getLoginStatus(this.callback(this.onFacebookLoginStatus));
          }
      }
}
), cleanSession : (function (a)
{
  var b = a.session_key.split("-");
  a = a.access_token.split("|");
  var c = {};
  c.facebookUserID = b[1];
  c.sessionKey = b[0];
  c.accessToken1 = a[0];
  c.accessToken3 = a[2];
  return c;
}
), onFacebookLoginStatus : (function (a)
{
  this.connectStatus = a.status;
  switch (this.connectStatus)
  {
    case "connected":
      break ;
    case "notConnected":
      break ;
    case "unknown":
    default:
      break ;
  }
  $.publish("gs.facebook.status");
}
), onUserFacebookData : (function (a,b,c)
{
  try
    {
      console.log("onUserFacebookData", c);
      var d = {};
      if (window.FB && c && c.FacebookUserID)
        {
          d.session_key = c.SessionKey + "-" + c.FacebookUserID;
          d.access_token = c.AccessToken1 + "|" + d.session_key + "|" + c.AccessToken3;
          d.expires = 0;
          d.uid = c.FacebookUserID;
          d.sig = null;
          d.secret = null;
          var f = FB.getSession();
          if (f && f.uid && f.uid == d.uid)
            if (f.session_key != d.session_key || f.access_token != d.access_token)
              {
                d = f;
                this.save(c.Flags);
              }
          this.flags = c.Flags;
          this.connected = true;
          FB.init({appId : this.APPLICATION_ID, status : false, cookie : false, xfbml : false, session : d});
          FB.api("/me", this.callback("getMyProfile", a, b));
          a && a();
        }
      else
        {
          GS.user.Flags = (GS.user.Flags | this.SERVICE_ID) - this.SERVICE_ID;
          if (this.registeredWithFacebook)
            GS.user.Flags = (GS.user.Flags | this.FACEBOOK_ONLY_SERVICE_ID) - this.FACEBOOK_ONLY_SERVICE_ID;
          this.connected = false;
          console.error("couldn't set session from getUserFacebookDataEx");
          b && b();
        }
    }
  catch (g)
    {
      this.connected = false;
      b && b();
    }
}
), gsLogin : (function (a,b)
{
  console.log("FACEBOOK LOGIN TO GS");
  if (! GS.user.isLoggedIn)
    if (this.connectStatus == "connected" && window.FB)
      {
        var c = FB.getSession();
        console.log("facebook session", c);
        if (c)
          {
            c = this.cleanSession(c);
            GS.service.authenticateFacebookUser(c.facebookUserID, c.sessionKey, c.accessToken1, c.accessToken3, this.callback("onAuthFacebookUser", a, b), b);
          }
        else
          this.connectStatus == "notConnected" ? this.register(a, b) : b({error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"});
      }
    else
      this.login(this.callback(this.gsLogin, a, b), b);
}
), onAuthFacebookUser : (function (a,b,c)
{
  if (c)
    if (c.userID == 0)
      this.register(a, b);
    else
      {
        this.connected = true;
        a(c);
      }
  else
    b && b(c);
}
), register : (function (a,b)
{
  if (window.FB && FB.getSession())
    FB.Data.query("select {0} from user where uid={1}", "uid,name,first_name,last_name,profile_url,username,about_me,birthday_date,profile_blurb,sex,email,locale,profile_update_time,pic", (FB.getSession()).uid).wait((function (c)
{
  c && c[0] ? GS.facebook.gotProfileForRegister(b, c[0].username ? c[0].username : "", {id : c[0].uid, name : c[0].name, first_name : c[0].first_name, last_name : c[0].last_name, link : c[0].profile_url, bio : c[0].about_me, birthday : c[0].birthday_date, about : c[0].profile_blurb, gender : c[0].sex, email : c[0].email, locale : c[0].locale, updated_time : c[0].profile_update_time, picture : c[0].pic}) : GS.facebook.gotProfileForRegister(b);
}
));
  else
    b && b({error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"});
}
), gotProfileForRegister : (function (a,b,c)
{
  console.log("gotProfileForRegister", c);
  if (c && ! c.error)
    GS.service.getUsernameSuggestions(b, c.name ? c.name : "", c.id, this.callback("usernameSuggestSuccess", c), this.callback("usernameSuggestFailed", c));
  else
    a && a({error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"});
}
), usernameSuggestSuccess : (function (a,b)
{
  var c = "";
  if (b && b.length > 0)
    c = b[0];
  this.openRegisterLightbox(c, a);
}
), usernameSuggestFailed : (function (a)
{
  this.openRegisterLightbox("", a);
}
), openRegisterLightbox : (function (a,b)
{
  var c = {isFacebook : true, username : a, session : window.FB ? this.cleanSession(FB.getSession()) : null, message : $.localize.getString("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_NOT_FOUND")};
  if (b)
    {
      var d = b.birthday.split("/");
      c.month = parseInt(d[0]);
      c.day = parseInt(d[1]);
      c.year = parseInt(d[2]);
      c.fname = b.name ? b.name : "";
      if (b.gender == "female")
        c.sex = "F";
      else
        if (b.gender == "male")
          c.sex = "M";
      c.email = b.email ? b.email : "";
    }
  GS.lightbox.close();
  GS.lightbox.open("signup", c);
}
), login : (function (a,b)
{
  if (window.FB && window.FB.login)
    {
      var c = _.browserDetect();
      if (c.browser == "chrome")
        {
          FB.XD._origin = window.location.protocol + "//" + document.domain + "/" + FB.guid();
          FB.XD.Flash.init();
          FB.XD._transport = "flash";
        }
      else
        if (c.browser == "opera")
          {
            FB.XD._transport = "fragment";
            FB.XD.Fragment._channelUrl = window.location.protocol + "//" + window.location.host + "/";
          }
      FB.login(this.callback("onLogin", a, b), {perms : this.PERMISSIONS});
    }
  else
    b && b({error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR"});
}
), onLogin : (function (a,b,c)
{
  if (c.session)
    if (c.perms)
      {
        var d = this.PERMISSIONS.split(",");
        for (f in d)
          if (c.perms.indexOf(d[f]) == - 1)
            {
              b && b({error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_DISALLOW_ERROR"});
              return ;
            }
        d = c.session.session_key.split("-");
        f = c.session.access_token.split("|");
        if (GS.user.isLoggedIn)
          GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID ? GS.service.updateUserFacebookData(d[1], d[0], f[0], f[2], this.flags, this.callback("onSaveUserFacebookData", a, b), b) : GS.service.saveUserFacebookData(d[1], d[0], f[0], f[2], this.flags, this.callback("onSaveUserFacebookData", a, b), b);
        else
          {
            this.onFacebookLoginStatus(c);
            a ? a() : GS.service.authenticateFacebookUser(d[1], d[0], f[0], f[2], this.callback("onAuthFacebookUser", a, b), b);
          }
      }
    else
      b({error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_DISALLOW_ERROR"});
}
), save : (function (a,b,c)
{
  if (window.FB && FB.getSession())
    {
      var d = (FB.getSession()).session_key.split("-"), f = (FB.getSession()).access_token.split("|");
      GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID ? GS.service.updateUserFacebookData(d[1], d[0], f[0], f[2], a, this.callback("onSaveUserFacebookData", b, c), c) : GS.service.saveUserFacebookData(d[1], d[0], f[0], f[2], a, this.callback("onSaveUserFacebookData", b, c), c);
      this.flags = a;
    }
}
), onSaveUserFacebookData : (function (a,b,c)
{
  if (c == 1 && window.FB)
    {
      this.connected = true;
      FB.api("/me", this.callback("getMyProfile", a, b));
    }
  else
    if (c == - 1)
      if (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.FACEBOOK_ONLY_SERVICE_ID)
        GS.service.getUserFacebookData(this.callback("onUserFacebookData", a, (function ()
{
  b("FACEBOOK_PROBLEM_CONNECTING_ERROR_MSG");
}
)));
      else
        b && b("FACEBOOK_DUPLICATE_ACCOUNT_ERROR_MSG");
    else
      b && b("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR");
}
), getMyProfile : (function (a,b,c)
{
  if (c && c.id)
    {
      this.profile = c;
      $.publish("gs.facebook.profile.update");
      a && a();
    }
  else
    {
      this.connected = false;
      GS.user && GS.user.isLoggedIn && c.error && c.error.message == "Error validating access token." && GS.lightbox.open("reAuthFacebook");
      b && b();
    }
}
), onSaveSession : (function ()
{
  }
), logout : (function (a)
{
  GS.service.removeUserFacebookData(this.callback("onLogout", a));
}
), onLogout : (function (a)
{
  this.clearInfo();
  $.publish("gs.facebook.profile.update");
  a && a();
}
), clearInfo : (function ()
{
  this.friends = this.profile = null;
  this.connected = false;
  this.flags = 0;
  if (window.FB && window.FB.init)
    {
      FB.init({appId : this.APPLICATION_ID, status : true, cookie : false, xfbml : true});
      FB.getLoginStatus(this.callback(this.onFacebookLoginStatus));
    }
  $.publish("gs.facebook.profile.update");
}
), postToFeed : (function (a,b,c,d,f)
{
  if (this.connectStatus === "connected" && window.FB && FB.getSession())
    {
      var g = {};
      a = _.orEqual(a, "me") + "/feed";
      g.link = b;
      g.message = c;
      g.access_token = (FB.getSession()).access_token;
      g.hideUndo = true;
      GS.service.makeFacebookRequest(a, g, "POST", this.callback("onFeedPost", g, d), this.callback("onFailedPost", f));
    }
  else
    $.isFunction(f) && f("No facebook session.");
}
), onFeedPost : (function (a,b)
{
  a.hideUndo = true;
  $.publish("gs.facebook.notification.sent", {params : a, data : {}, notifData : {}});
  b && b();
}
), postLink : (function (a,b,c,d,f)
{
  if (this.connectStatus === "connected" && window.FB && FB.getSession())
    {
      var g = {};
      g.link = a;
      g.message = b;
      g.access_token = (FB.getSession()).access_token;
      g.type = _.orEqual(c, "song");
      g.hideUndo = true;
      GS.service.makeFacebookRequest("me/links", g, "POST", this.callback("onFeedPost", g, d), this.callback("onFailedPost", f));
    }
  else
    $.isFunction(f) && f("No facebook session.");
}
), onFailedPost : (function (a,b)
{
  $.isFunction(a) && a(b);
}
), onFavoriteSong : (function (a,b)
{
  if (this.connectStatus === "connected" && window.FB && FB.getSession() && ! (this.flags & this.WALL_FAVORITES))
    {
      var c = {access_token : (FB.getSession()).access_token};
      c.message = b;
      c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
      c.type = "favorite";
      c.hideUndo = true;
      this.postEvent(c, false, a);
    }
}
), onPlaylistCreate : (function (a,b)
{
  if (this.connectStatus === "connected" && window.FB && FB.getSession() && ! (this.flags & this.WALL_PLAYLIST_CREATE))
    {
      var c = {access_token : (FB.getSession()).access_token};
      c.message = b;
      c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
      c.type = "playlist";
      c.hideUndo = true;
      this.postEvent(c, false, a);
    }
}
), onSubscribePlaylist : (function (a,b)
{
  if (this.connectStatus === "connected" && window.FB && FB.getSession() && ! (this.flags & this.WALL_PLAYLIST_SUBSCRIBE))
    {
      var c = {access_token : (FB.getSession()).access_token};
      c.message = b;
      c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
      c.type = "playlist";
      c.hideUndo = true;
      this.postEvent(c, false, a);
    }
}
), onFollowUser : (function (a,b)
{
  if (this.connectStatus === "connected" && window.FB && FB.getSession() && ! (this.flags & this.WALL_FAVORITES))
    {
      var c = {access_token : (FB.getSession()).access_token};
      c.message = b;
      c.link = "http://listen.grooveshark.com" + a.toUrl().substr(1);
      c.type = "favorite";
      c.hideUndo = true;
      this.postEvent(c, false, a);
    }
}
), postEvent : (function (a,b,c)
{
  var d = new Date();
  if ((b = true) || ! this.lastPost || d.getTime() > this.lastPost + this.RATE_LIMIT)
    {
      this.lastPost = d.getTime();
      GS.service.makeFacebookRequest("me/links", a, "POST", this.callback("onPostEvent", a, c), this.callback("onFailedPost", this.callback("onFailedPostEvent")));
    }
  else
    $.publish("gs.facebook.notification.override", a);
}
), onPostEvent : (function (a,b,c)
{
  $.publish("gs.facebook.notification.sent", {params : a, data : c, notifData : b});
}
), onFailedPostEvent : (function ()
{
  $.publish("gs.facebook.notification.sent", {params : {type : "error", hideUndo : true}, data : {}, notifData : {}});
}
), removeEvent : (function (a)
{
  if (window.FB && FB.getSession() && a && a.result)
    {
      var b = JSON.parse(a.result);
      a = {access_token : (FB.getSession()).access_token, method : "delete"};
      b = (FB.getSession()).uid + "_" + b.id;
      GS.service.makeFacebookRequest(b, a, "GET", this.callback("onRemoveEvent"));
    }
}
), onRemoveEvent : (function (a)
{
  console.log("facebook.remove.response", a);
  $.publish("gs.facebook.notification.removed", a);
  this.lastPost = false;
}
), getFriends : (function (a)
{
  if (this.friends)
    a(this.friends);
  else
    this.connectStatus === "connected" && window.FB && FB.getSession() ? FB.api("me/friends", this.callback("onFacebookGetFriends", a)) : a(null);
}
), onFacebookGetFriends : (function (a,b)
{
  if (b.data)
    {
      var c = [];
      for (d in b.data)
        c.push(b.data[d]);
      c.sort((function (f,g)
{
  var h = (f.name || "").toLowerCase(), o = (g.name || "").toLowerCase();
  if (h < o)
    return - 1;
  else
    if (h > o)
      return 1;
  return 0;
}
));
      this.friends = c;
    }
  a(this.friends);
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.LastfmController", {onDocument : true}, {SERVICE_ID : 2, API_KEY : "b1ecfd8a5f8ec4dbb4cdacb8f3638f6d", API_SECRET : "f8ed9c4ea2f1b981e61e1d0df1a98406", P_VERSION : "1.2.1", URL_USER_AUTH : "http://www.last.fm/api/auth/", URL_AUDIOSCROBBLER : "http://ws.audioscrobbler.com/2.0/", CLIENT_ID : "gvs", CLIENT_VERSION : "1", MINIMUM_DURATION : 240, authToken : null, sessionKey : null, username : null, sessionID : null, flags : 0, enabled : false, nowPlaying : null, lastPlayed : null, currentListening : null, init : (function ()
{
  $.subscribe("gs.auth.update", this.callback(this.update));
  $.subscribe("gs.auth.favorite.song", this.callback(this.onFavoriteSong));
  $.subscribe("gs.player.nowplaying", this.callback(this.onNowPlaying));
  $.subscribe("gs.player.playing.continue", this.callback(this.onSongPlaying));
}
), ready : (function ()
{
  this.update();
}
), update : (function ()
{
  GS.user.isLoggedIn && GS.user.Flags & this.SERVICE_ID && GS.service.getLastfmService(this.callback("onGetService"), this.callback("onGetService"));
}
), onGetService : (function (a)
{
  if (a.Session)
    {
      this.username = a.Username;
      this.sessionKey = a.Session;
      this.authToken = a.Token;
      this.flags = a.flags;
      this.enabled = Boolean(this.flags);
    }
}
), authorize : (function ()
{
  this.sessionKey = null;
  this.getJSON(this.URL_AUDIOSCROBBLER, {method : "auth.getToken", api_key : this.API_KEY}, this.callback("onGetToken"));
}
), onGetToken : (function (a)
{
  if (a && a.token)
    {
      this.authToken = a.token;
      GS.lightbox.open("lastfmApproval");
    }
  else
    $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_FAIL_COMMUNICATE_LASTFM")});
}
), saveSession : (function ()
{
  this.sessionID || this.getJSON(this.URL_AUDIOSCROBBLER, {api_key : this.API_KEY, method : "auth.getSession", token : this.authToken}, this.callback("onGetSession"));
}
), onGetSession : (function (a)
{
  if (a.session)
    {
      this.sessionKey = a.session.key;
      this.username = a.session.name;
      GS.service.updateLastfmService(this.sessionKey, this.authToken, this.username, 1, 0, this.callback("onUpdateService"), this.callback("onUpdateService"));
    }
  else
    $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_FAIL_COMMUNICATE_LASTFM")});
}
), onUpdateService : (function (a)
{
  if (a && a.success)
    {
      this.enabled = true;
      $.publish("gs.lastfm.profile.update");
    }
  else
    $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_UNABLE_SAVE_LASTFM")});
}
), logout : (function (a)
{
  this.authToken = this.sessionKey = this.username = this.sessionID = null;
  this.enabled = false;
  GS.service.removeLastfmService(a);
  $.publish("gs.lastfm.profile.update");
}
), onNowPlaying : (function (a)
{
  if (this.enabled && a)
    {
      this.nowPlaying = {track : a.SongName, artist : a.ArtistName, album : a.AlbumName, duration : a.EstimateDuration ? Math.round(a.EstimateDuration / 1000) : 0, method : "track.updateNowPlaying", sk : this.sessionKey, api_key : this.API_KEY};
      if (a.TrackNum)
        this.nowPlaying.trackNumber = String(a.TrackNum);
      a = $.extend(true, {api_sig : this.createSignature(this.nowPlaying)}, this.nowPlaying);
      GS.service.lastfmNowPlaying(a, this.callback("onNowPlayingComplete"), this.callback("onNowPlayingComplete"));
    }
}
), onNowPlayingComplete : (function ()
{
  }
), onSongPlaying : (function (a)
{
  var b = a.activeSong;
  a = Math.round(a.duration / 1000);
  if (! this.currentListening || b.SongID != this.currentListening.songID)
    this.currentListening = {songID : b.SongID, secondsListened : 0};
  else
    this.currentListening.secondsListened += 0.5;
  if (this.enabled && b && a >= 30 && (this.currentListening.secondsListened >= this.MINIMUM_DURATION || this.currentListening.secondsListened >= a / 2) && ! this.lastPlayed)
    {
      this.lastPlayed = {artist : b.ArtistName, track : b.SongName, timestamp : Math.round(new Date().getTime() / 1000), duration : b.EstimateDuration ? Math.round(b.EstimateDuration / 1000) : 0, album : b.AlbumName, method : "track.scrobble", sk : this.sessionKey, api_key : this.API_KEY};
      if (b.TrackNum)
        this.nowPlaying.trackNumber = String(b.TrackNum);
      b = $.extend(false, {api_sig : this.createSignature(this.lastPlayed)}, this.lastPlayed);
      GS.service.lastfmSongPlay(b, this.callback("onSongPlayingComplete"), this.callback("onSongPlayingComplete"));
    }
  else
    if (b && this.currentListening.secondsListened < this.MINIMUM_DURATION && this.currentListening.secondsListened < a / 2)
      this.lastPlayed = null;
}
), onSongPlayingComplete : (function ()
{
  }
), onFavoriteSong : (function ()
{
  }
), getJSON : (function (a,b,c)
{
  if (a && b && c)
    {
      b.api_sig = this.createSignature(b);
      b.format = "json";
      $.ajax({url : a, data : b, success : c, error : c, dataType : "jsonp", cache : true});
    }
}
), createSignature : (function (a)
{
  var b = [];
  for (c in a)
    b.push(c);
  b.sort();
  c = "";
  for (d in b)
    c += b[d] + a[b[d]];
  c += this.API_SECRET;
  return c = hex_md5(c);
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.GoogleController", {onDocument : true}, {SERVICE_ID : 64, GOOGLE_ONLY_SERVICE_ID : 32, REQUIRED : "email,firstname,lastname", EXTENSIONS : {"openid.ns.ax" : "http://openid.net/srv/ax/1.0", "openid.ax.mode" : "fetch_request", "openid.ax.type.email" : "http://axschema.org/contact/email", "openid.ax.type.firstname" : "http://axschema.org/namePerson/first", "openid.ax.type.lastname" : "http://axschema.org/namePerson/last", "openid.ax.required" : "email,firstname,lastname", "openid.ui.icon" : "true"}, googleOpener : null, connected : false, registeredWithGoogle : false, email : "", firstname : "", lastname : "", lastError : "", onLoginSaveData : null, loginSuccessCallback : null, loginFailedCallback : null, init : (function ()
{
  $.subscribe("gs.auth.update", this.callback(this.update));
  this.googleOpener = googleOpenIDPopup.createPopupOpener({realm : "http://*.grooveshark.com", opEndpoint : "https://www.google.com/accounts/o8/ud", returnToUrl : (window.location.protocol ? window.location.protocol : "http:") + "//" + (window.location.hostname ? window.location.hostname : "listen.grooveshark.com") + "/googleCallback.php", shouldEncodeUrls : true, extensions : this.EXTENSIONS});
  if (! window.confirmGoogleConnection)
    window.confirmGoogleConnection = (function (a)
{
  console.log("goog confirm connection", a);
  try
    {
      a = JSON.parse(a);
    }
  catch (b)
    {
      this.lastError = "parseError";
      console.error("goog json parse error");
      GS.google.loginFailedCallback();
      return ;
    }
  if (a.mode == "cancel" || a.error == "cancel")
    {
      this.lastError = "cancel";
      GS.google.onCancelledLogin();
    }
  else
    GS.google.onLogin(a);
}
);
  if (! window.gsGoogleStorageEvent && (window.localStorage || typeof localStorage != "undefined"))
    {
      window.gsGoogleStorageEvent = (function (a)
{
  if (! a && window.event)
    a = window.event;
  if (window.localStorage && typeof b == "undefined")
    var b = window.localStorage;
  else
    if (! window.localStorage)
      return ;
  if (a.key && a.key == "googleOpenIDData" && a.newVal && a.newVal != "")
    {
      window.confirmGoogleConnection(a.newVal);
      if (b)
        {
          if (b.setItem)
            b.setItem("googleOpenIDData", "");
          else
            b.googleOpenIDData = "";
          b.removeItem && b.removeItem("googleOpenIDData");
        }
    }
  else
    if (b && b.getItem && b.getItem("googleOpenIDData") && b.getItem("googleOpenIDData") != "" || b.googleOpenIDData && b.googleOpenIDData != "")
      {
        a = b.getItem ? "" + b.getItem("googleOpenIDData") : "" + b.googleOpenIDData;
        if (b.setItem)
          b.setItem("googleOpenIDData", "");
        else
          b.googleOpenIDData = "";
        window.confirmGoogleConnection(a);
        b.removeItem && b.removeItem("googleOpenIDData");
      }
}
);
      if (window.addEventListener)
        window.addEventListener("storage", window.gsGoogleStorageEvent, false);
      else
        document.attachEvent && document.attachEvent("onstorage", window.gsGoogleStorageEvent);
    }
}
), ready : (function ()
{
  this.update();
}
), update : (function ()
{
  if (GS.user && GS.user.isLoggedIn && (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.GOOGLE_ONLY_SERVICE_ID))
    {
      this.registeredWithGoogle = (GS.user.Flags & this.GOOGLE_ONLY_SERVICE_ID) > 0;
      GS.service.getUserGoogleData(this.callback("onUserGoogleData", null, null));
    }
  else
    GS.user && GS.user.isLoggedIn && this.onLoginSaveData == GS.user.email ? GS.service.saveUserGoogleData(this.callback("onSaveUserGoogleData", null, null), (function ()
{
  GS.google.clearInfo();
}
)) : this.clearInfo();
}
), onUserGoogleData : (function (a,b,c)
{
  try
    {
      console.log("gotUserGoogleData", c);
      if (c && c.GoogleEmailAddress)
        {
          this.email = c.GoogleEmailAddress;
          this.connected = true;
          $.publish("gs.google.profile.update");
          a && a();
        }
      else
        {
          GS.user.Flags = (GS.user.Flags | this.SERVICE_ID) - this.SERVICE_ID;
          if (this.registeredWithGoogle)
            GS.user.Flags = (GS.user.Flags | this.GOOGLE_ONLY_SERVICE_ID) - this.GOOGLE_ONLY_SERVICE_ID;
          this.clearInfo();
          b && b();
        }
    }
  catch (d)
    {
      this.connected = false;
      b && b();
    }
}
), gsLogin : (function (a,b)
{
  console.log("GOOGLE LOGIN TO GS");
  GS.user.isLoggedIn ? GS.service.saveUserGoogleData(this.callback("onSaveUserGoogleData", a, b), b) : GS.service.authenticateGoogleUser(this.callback("onAuthGoogleUser", a, b), b);
}
), onAuthGoogleUser : (function (a,b,c)
{
  console.log("onAuthGoogleUser", c);
  if (c)
    if (c.userID == 0)
      this.register();
    else
      {
        a(c);
        $.publish("gs.google.profile.update");
      }
  else
    b && b(c);
}
), onSaveUserGoogleData : (function (a,b,c)
{
  if (c == 1)
    {
      this.connected = true;
      $.publish("gs.google.profile.update");
      a && a();
    }
  else
    if (c == - 1)
      if (GS.user.Flags & this.SERVICE_ID || GS.user.Flags & this.GOOGLE_ONLY_SERVICE_ID)
        GS.service.getUserGoogleData(this.callback("onUserGoogleData", a, (function ()
{
  b("GOOGLE_PROBLEM_CONNECTING_ERROR_MSG");
}
)));
      else
        b && b({error : "GOOGLE_DUPLICATE_ACCOUNT_ERROR_MSG"});
    else
      if (c == - 2)
        b && b({error : "GOOGLE_MISSING_LOGIN_INFO_ERROR_MSG"});
      else
        b && b({error : "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR"});
}
), register : (function ()
{
  GS.lightbox.close();
  var a = (this.email.split("@"))[0];
  if (a)
    {
      a = a.replace(/^[\.\-_]|[^a-zA-Z0-9\.\-_]|[\.\-_]$/g, "");
      a = a.replace(/([\.\-_]){2,}/g, "$1");
    }
  var b = this.firstname + " " + this.lastname, c = Math.floor(Math.random() * 997508) + 1005;
  b || a ? GS.service.getUsernameSuggestions(a, b, c, this.callback("usernameSuggestSuccess"), this.callback("usernameSuggestFailed")) : this.usernameSuggestFailed("");
}
), usernameSuggestSuccess : (function (a)
{
  var b = "";
  if (a && a.length > 0)
    b = a[0];
  this.openRegisterLightbox(b);
}
), usernameSuggestFailed : (function ()
{
  this.openRegisterLightbox("");
}
), openRegisterLightbox : (function (a)
{
  a = {isGoogle : true, username : a, email : this.email, fname : this.firstname + " " + this.lastname, message : $.localize.getString("POPUP_SIGNUP_LOGIN_FORM_GOOGLE_NOT_FOUND")};
  GS.lightbox.open("signup", a);
}
), login : (function (a,b)
{
  this.googleOpener.popup(450, 400);
  this.loginSuccessCallback = a;
  this.loginFailedCallback = b;
}
), onLogin : (function (a)
{
  if (a.error)
    {
      this.lastError = a.error;
      this.loginFailedCallback();
    }
  else
    {
      if (a.firstName)
        this.firstname = a.firstName;
      if (a.lastName)
        this.lastname = a.lastName;
      if (a.email)
        this.email = a.email;
      this.gsLogin(this.loginSuccessCallback, this.loginFailedCallback);
    }
}
), onCancelledLogin : (function ()
{
  }
), onLogout : (function (a)
{
  this.clearInfo();
  $.publish("gs.google.profile.update");
  a && a();
}
), clearInfo : (function ()
{
  this.identity = null;
  this.lastname = this.firstname = this.email = "";
  this.registeredWithGoogle = this.connected = false;
  this.onLoginSaveData = null;
}
), logout : (function (a)
{
  GS.service.removeUserGoogleData(this.callback("onLogout", a));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.ApiController", {onDocument : true}, {_songStatusCallback : "", _statusLookup : {0 : "none", 1 : "loading", 2 : "loading", 3 : "playing", 4 : "paused", 5 : "buffering", 6 : "failed", 7 : "completed"}, _protocolActions : ["play", "add", "next"], _lastStatus : null, init : (function ()
{
  $.subscribe("gs.player.playstatus", this.callback(this._doStatusCallback));
}
), getApplicationVersion : (function ()
{
  return gsConfig.revision;
}
), getAPIVersion : (function ()
{
  return 1.3;
}
), executeProtocol : (function (a)
{
  var b = a.toLowerCase();
  if (b.indexOf("gs://") != - 1)
    {
      a = a.substring(5);
      b = b.substring(5);
    }
  if (a.charAt(a.length - 1) == "/")
    {
      a = a.substring(0, a.length - 1);
      b = b.substring(0, b.length - 1);
    }
  b = b.split("/");
  var c = b.pop();
  if (this._protocolActions.indexOf(c) == - 1)
    {
      b.push(c);
      c = "";
    }
  if (b[0] == "themes")
    GS.lightbox.open("themes");
  else
    {
      if (c)
        {
          a = a.substring(0, a.length - c.length - 1);
          var d = GS.player.INDEX_DEFAULT, f = false;
          switch (c)
          {
            case "play":
              f = true;
              break ;
            case "next":
              d = GS.player.INDEX_NEXT;
              break ;
          }
          if (GS.player)
            switch (b[0])
            {
              case "s":
                GS.Models.Song.getSong(b[2], this.callback((function (g)
{
  GS.player.addSongsToQueueAt(g.SongID, d, f);
}
)), null, false);
                break ;
              case "song":
                GS.Models.Song.getSongFromToken(b[2], this.callback((function (g)
{
  GS.player.addSongsToQueueAt(g.SongID, d, f);
}
)), null, false);
                break ;
              case "album":
                GS.Models.Album.getAlbum(b[2], this.callback((function (g)
{
  g.play(d, f);
}
)), null, false);
                break ;
              case "playlist":
                GS.Models.Playlist.getPlaylist(b[2], this.callback((function (g)
{
  g.play(d, f);
}
)), null, false);
                break ;
            }
        }
      if (b[0] == "search")
        {
          b = b[(b.length - 1)];
          a = a.substring(0, a.length - b.length);
          a += "?q=" + b;
        }
      console.log("EXECUTE PROTOCOL, redirect", a);
      location.hash = "/" + a;
    }
}
), getCurrentSongStatus : (function ()
{
  return this._buildCurrentPlayStatus();
}
), setSongStatusCallback : (function (a)
{
  if ($.isFunction(a))
    this._songStatusCallback = a;
  else
    if (_.isString(a))
      {
        a = a.split(".");
        a = this._getObjectChain(window, a);
        if ($.isFunction(a))
          this._songStatusCallback = a;
      }
  return this._buildCurrentPlayStatus();
}
), _getObjectChain : (function (a,b)
{
  var c = b.shift();
  return (c = a[c]) ? b.length ? this._getObjectChain(c, b) : c : null;
}
), _doStatusCallback : (function (a)
{
  if (a && this._lastStatus)
    if (a.status === this._lastStatus.status)
      if (! a.activeSong && ! this._lastStatus.activeSong)
        {
          this._lastStatus = a;
          return ;
        }
      else
        if (a.activeSong && this._lastStatus.activeSong)
          if (a.activeSong.songID === this._lastStatus.activeSong.songID && a.activeSong.autoplayVote === this._lastStatus.activeSong.autoplayVote)
            {
              this._lastStatus = a;
              return ;
            }
  this._lastStatus = a;
  $.isFunction(this._songStatusCallback) && this._songStatusCallback(this._buildCurrentPlayStatus());
}
), _buildCurrentPlayStatus : (function ()
{
  var a = {song : null, status : "none"};
  if (GS.player)
    {
      var b = GS.player.getPlaybackStatus();
      if (b)
        if (b.activeSong)
          {
            var c = GS.Models.Song.getOneFromCache(b.activeSong.songID);
            a.song = {songID : b.activeSong.songID, songName : b.activeSong.songName, artistID : b.activeSong.artistID, artistName : b.activeSong.artistName, albumID : b.activeSong.albumID, albumName : b.activeSong.albumName, trackNum : c ? c.TrackNum : 0, estimateDuration : b.activeSong.estimateDuration, artURL : c ? c.getImageURL() : gsConfig.assetHost + "/webincludes/images/default/album_100.png", calculatedDuration : b.duration, position : b.position, vote : b.activeSong.autoplayVote};
            a.status = this._statusLookup[b.status];
          }
    }
  return a;
}
), getPreviousSong : (function ()
{
  var a = null;
  if (GS.player && GS.player.queue && GS.player.queue.previousSong)
    {
      a = GS.player.queue.previousSong;
      var b = GS.Models.Song.getOneFromCache(a.songID);
      a = {songID : a.songID, songName : a.songName, artistID : a.artistID, artistName : a.artistName, albumID : a.albumID, albumName : a.albumName, trackNum : b ? b.TrackNum : 0, estimateDuration : a.estimateDuration, artURL : b ? b.getImageURL() : gsConfig.assetHost + "/webincludes/images/default/album_100.png", vote : a.autoplayVote};
    }
  return a;
}
), getNextSong : (function ()
{
  var a = null;
  if (GS.player && GS.player.queue && GS.player.queue.nextSong)
    {
      a = GS.player.queue.nextSong;
      var b = GS.Models.Song.getOneFromCache(a.songID);
      a = {songID : a.songID, songName : a.songName, artistID : a.artistID, artistName : a.artistName, albumID : a.albumID, albumName : a.albumName, trackNum : b ? b.TrackNum : 0, estimateDuration : a.estimateDuration, artURL : b ? b.getImageURL() : gsConfig.assetHost + "/webincludes/images/default/album_100.png", vote : a.autoplayVote};
    }
  return a;
}
), addSongsByID : (function (a,b)
{
  GS.player && GS.player.addSongsToQueueAt(a, GS.player.INDEX_DEFAULT, b);
}
), addSongByToken : (function (a,b)
{
  GS.player && GS.Models.Song.getSongFromToken(a, this.callback((function (c)
{
  GS.player.addSongsToQueueAt([c.SongID], GS.player.INDEX_DEFAULT, b);
}
)), null, false);
}
), addAlbumByID : (function (a,b)
{
  GS.player && GS.Models.Album.getAlbum(a, this.callback((function (c)
{
  c.play(GS.player.INDEX_DEFAULT, b);
}
)), null, false);
}
), addPlaylistByID : (function (a,b)
{
  GS.player && GS.Models.Playlist.getPlaylist(a, this.callback((function (c)
{
  c.play(GS.player.INDEX_DEFAULT, b);
}
)), null, false);
}
), play : (function ()
{
  if (GS.player && GS.player.queue && GS.player.queue.activeSong)
    GS.player.isPaused ? GS.player.resumeSong() : GS.player.playSong(GS.player.queue.activeSong.queueSongID);
}
), pause : (function ()
{
  GS.player && GS.player.pauseSong();
}
), togglePlayPause : (function ()
{
  if (GS.player)
    GS.player.isPaused ? GS.player.resumeSong() : GS.player.pauseSong();
}
), previous : (function ()
{
  GS.player && GS.player.previousSong();
}
), next : (function ()
{
  GS.player && GS.player.nextSong();
}
), setVolume : (function (a)
{
  GS.player && GS.player.setVolume(a);
}
), getVolume : (function ()
{
  if (GS.player)
    return GS.player.getVolume();
  return 0;
}
), setIsMuted : (function (a)
{
  GS.player && GS.player.setIsMuted(a);
}
), getIsMuted : (function ()
{
  if (GS.player)
    return GS.player.getIsMuted();
  return false;
}
), voteCurrentSong : (function (a)
{
  GS.player && GS.player.queue && GS.player.queue.activeSong && GS.player.voteSong(GS.player.queue.activeSong.queueSongID, a);
}
), getVoteForCurrentSong : (function ()
{
  if (GS.player && GS.player.queue && GS.player.queue.activeSong)
    return GS.player.queue.activeSong.autoplayVote;
}
), favoriteCurrentSong : (function ()
{
  GS.player && GS.player.queue && GS.player.queue.activeSong && GS.user.addToSongFavorites(GS.player.queue.activeSong.SongID);
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.PageController", {onElement : "#page", activePage : null, _element : null, activate : (function (a)
{
  if (! this._element)
    this._element = $(this.onElement);
  if (this.activePage === a)
    return this._element.controller(a);
  var b = this._element.controller(a);
  if (typeof b !== "undefined")
    {
      if (this.activePage)
        {
          this.activePage === "home" && $.publish("gs.page.home.leave");
          this._element.controller(this.activePage).detach();
        }
      else
        $.each(this._element.controllers(), (function (c,d)
{
  d.detach();
}
));
      b.reattach();
      this.activePage = a;
      $("#theme_home *").toggle(a === "home");
      $("#theme_page_header").toggle(a !== "home" && $("#theme_page_header").is(".active"));
      if (a !== "home")
        {
          $("ul.ui-autocomplete").remove();
          $.publish("gs.page.page.view", a);
        }
      return b;
    }
}
), titlePrepend : "Grooveshark - ", titlePostpend : " - Grooveshark", title : (function (a,b)
{
  b = typeof b === "undefined" ? true : b;
  document.title = b ? a + this.titlePostpend : this.titlePrepend + a;
}
), ALLOW_LOAD : true, justDidConfirm : false, lastPage : "", confirmMessage : $.localize.getString("ONCLOSE_PAGE_CHANGES"), checkLock : (function ()
{
  if (GS.Controllers.PageController.justDidConfirm || ! GS.Controllers.PageController.ALLOW_LOAD && ! confirm($.localize.getString("ONCLOSE_SAVE_PLAYLIST")))
    {
      GS.Controllers.PageController.justDidConfirm = true;
      location.replace([location.protocol, "//", location.host, location.pathname, GS.Controllers.PageController.lastPage].join(""));
      setTimeout((function ()
{
  GS.Controllers.PageController.justDidConfirm = false;
}
), 500);
      return false;
    }
  else
    {
      GS.Controllers.PageController.justDidConfirm = false;
      GS.Controllers.PageController.ALLOW_LOAD = true;
      GS.Controllers.PageController.lastPage = location.hash;
      GS.Controllers.PageController.confirmMessage = $.localize.getString("ONCLOSE_PAGE_CHANGES");
      $.publish("gs.router.before");
      return true;
    }
}
), fromSidebar : 0, fromCorrectUrl : false}, {url : false, type : false, id : false, subpage : false, fromSidebar : false, pageSearchHasFocus : false, header : {name : false, breadcrumbs : [], imageUrl : false, subpages : [], options : [], labels : []}, list : {doPlayAddSelect : false, doSearchInPage : false, sortOptions : [], gridOptions : {data : [], columns : {}, options : {}}}, cache : {}, init : (function ()
{
  if (this.Class.shortName === "PageController")
    {
      $.subscribe("gs.page.loading.page", this.callback("showPageLoading"));
      $.subscribe("gs.page.loading.grid", this.callback("showGridLoading"));
      $.subscribe("gs.grid.selectedRows", this.callback("changeSelectionCount"));
      $.subscribe("gs.router.before", this.callback("handleFromSidebar"));
      $.subscribe("gs.grid.onsort", this.callback("gridOnSort"));
    }
}
), index : (function ()
{
  this.url = location.hash;
  this.element.html(this.view("index"));
}
), notFound : (function ()
{
  GS.Controllers.PageController.activate("home").notFound();
}
), showPageLoading : (function ()
{
  this.element.html(this.view("/shared/pageLoading"));
}
), showGridLoading : (function ()
{
  $("#grid").html(this.view("/shared/loadingIndicator"));
}
), changeSelectionCount : (function (a)
{
  if (a.type === "album" || a.type === "artist")
    $("input.search", this.element).val("").trigger("keyup");
  if (a.type === "song")
    {
      var b = _.isNumber(a.len) && a.len > 0 ? a.len : 0;
      if (b)
        {
          $("#page_header .play.count span[class=\"label\"]").localeDataString("SELECTION_PLAY_COUNT", {count : b});
          $("#page_header .addSongs.count span[class=\"label\"]").localeDataString("SELECTION_ADD_COUNT", {count : b});
          $("#page_header .deleteSongs.count span[class=\"label\"]").localeDataString("SELECTION_DELETE_COUNT", {count : b});
        }
      else
        {
          $("#page_header .play.count span[class=\"label\"]").localeDataString("SELECTION_PLAY_ALL");
          $("#page_header .addSongs.count span[class=\"label\"]").localeDataString("SELECTION_ADD_ALL");
          $("#page_header .deleteSongs.count span[class=\"label\"]").localeDataString("SELECTION_DELETE_ALL");
        }
      $("#page_header .music_options").toggleClass("hide", b === 0);
      b = ($("#page").attr("class").split("_"))[2];
      b = a.len > 0 ? "song" : b;
      $("#page_header a[name=share]").parent().hide();
      var c = GS.Controllers.Lightbox.ShareController.allowed[b];
      if (c)
        {
          $("#page_header button.share").parent().show();
          $.each(c, (function (d,f)
{
  $("#page_header a[name=share][rel=" + f + "]").show().parent().show().removeClass("hide");
}
));
        }
      else
        $("#page_header button.share").parent().hide();
      b === "song" ? $("#page_header button.share > span.label").html($.localize.getString("SHARE_SONG")) : $("#page_header button.share > span.label").html($.localize.getString("SHARE_" + b.toUpperCase()));
      if (a.len != 1)
        b === "playlist" ? $("#page_header li.shareOptions").show() : $("#page_header li.shareOptions").hide();
      else
        $("#page_header li.shareOptions").show();
      a.len <= 0 ? $("#page_header button.deleteSongs").parent().hide() : $("#page_header button.deleteSongs").parent().show();
      if ($("#page").attr("class") == "gs_page_now_playing")
        a.len <= 0 ? $("#page_header button.delete").hide() : $("#page_header button.delete").show();
    }
}
), setFromSidebar : (function (a)
{
  GS.page.fromSidebar = a;
}
), isFromSidebar : (function ()
{
  if (GS.page.fromSidebar === 2)
    return true;
  else
    return GS.page.fromSidebar = false;
}
), "a.fromSidebar click" : (function (a,b)
{
  console.error("fromsidebar click", a, b, a.attr("href"));
  b.stopImmediatePropagation();
  GS.page.setFromSidebar(1);
  location.hash = a.attr("href");
  return false;
}
), handleFromSidebar : (function ()
{
  if (GS.page.fromCorrectUrl === true)
    GS.page.fromCorrectUrl = false;
  else
    if (GS.page.fromSidebar === 1)
      GS.page.fromSidebar = 2;
    else
      if (GS.page.fromSidebar === 2)
        GS.page.fromSidebar = 0;
}
), correctUrl : (function (a,b)
{
  if (a && $.isFunction(a.toUrl))
    {
      var c = a.toUrl(b);
      if (location.hash !== c)
        {
          GS.page.fromCorrectUrl = true;
          location.replace(c);
        }
    }
  else
    console.error("invalid page.correctUrl obj", a, b);
}
), gridOnSort : (function (a)
{
  a && a.sortStoreKey && store.set(a.sortStoreKey, a);
}
), "input focus" : (function (a)
{
  $(a).parent().parent().addClass("active");
}
), "textarea focus" : (function (a)
{
  $(a).parent().parent().parent().addClass("active");
}
), "input blur" : (function (a)
{
  $(a).parent().parent().removeClass("active");
}
), "textarea blur" : (function (a)
{
  $(a).parent().parent().parent().removeClass("active");
}
), "#page_header .play.playTop click" : (function ()
{
  console.log("dropdown.play.default click");
  var a = this.getSongsIDsFromSelectedGridRows();
  a.length && GS.player.addSongsToQueueAt(a, GS.Controllers.PlayerController.INDEX_DEFAULT, true);
  GS.guts.objectListPlayAdd(a, this.element, "play");
}
), "#page_header .upload click" : (function ()
{
  window.open("http://listen.grooveshark.com/upload", "_blank");
}
), "#page .dropdownButton click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $(a).closest(".btn_group");
  if (c.find(".dropdown").is(":visible"))
    $("#page .btn_group").removeClass("active");
  else
    {
      $("#page .btn_group").removeClass("active");
      c.addClass("active");
      $("body").click((function ()
{
  $("#page .btn_group").removeClass("active");
}
));
    }
}
), "#page_header .dropdownOptions a[name=sort] click" : (function (a)
{
  var b = $("#grid").controller();
  b && b.grid.onSort(a.attr("rel"));
  b = a.find("span");
  a.parent().parent().parent().parent().find(".dropdownButton span.label").html(b.html()).attr("rel", b.attr("rel"));
}
), "#page_header .dropdownOptions a[name=playNow] click" : (function ()
{
  console.log("dropdown.play.now click");
  var a = this.getSongsIDsFromSelectedGridRows();
  a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_DEFAULT, true);
  GS.guts.objectListPlayAdd(a, this.element, "play");
}
), "#page_header .dropdownOptions a[name=playNext] click" : (function ()
{
  console.log("dropdown.play.next click");
  var a = this.getSongsIDsFromSelectedGridRows();
  a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_NEXT);
  GS.guts.objectListPlayAdd(a, this.element, "play");
}
), "#page_header .dropdownOptions a[name=playLast] click" : (function ()
{
  console.log("dropdown.play.last click");
  var a = this.getSongsIDsFromSelectedGridRows();
  a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_LAST);
  GS.guts.objectListPlayAdd(a, this.element, "play");
}
), "#page_header .dropdownOptions a[name=replace] click" : (function ()
{
  GS.player.clearQueue();
  console.log("dropdown.play.replace click");
  var a = this.getSongsIDsFromSelectedGridRows();
  a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_REPLACE, true);
  GS.guts.objectListPlayAdd(a, this.element, "play");
}
), "#page_header .dropdownOptions a[name=addToQueue] click" : (function ()
{
  console.log("dropdown.add.queue click " + this.type);
  var a = this.getSongsIDsFromSelectedGridRows();
  a.length && GS.player.addSongsToQueueAt(a, GS.player.INDEX_LAST);
  GS.guts.objectListPlayAdd(a, this.element, "add");
}
), "#page_header .dropdownOptions a[name=addToPlaylist] click" : (function ()
{
  console.error("button addtoplaylist click");
  var a = this.getSongsIDsFromSelectedGridRows();
  if (a.length)
    {
      GS.lightbox.open("addSongsToPlaylist", a);
      GS.guts.objectListPlayAdd(a, this.element, "add");
    }
}
), "#page_header .dropdownOptions a[name=addToLibrary] click" : (function ()
{
  console.log("dropdown.add.library click");
  var a = this.getSongsIDsFromSelectedGridRows();
  if (a.length)
    {
      GS.user.addToLibrary(a);
      GS.guts.objectListPlayAdd(a, this.element, "add");
    }
  GS.guts.objectListPlayAdd(a, this.element, "add");
}
), "#page_header .dropdownOptions a[name=addToFavorites] click" : (function ()
{
  console.log("dropdown.add.favorites click");
  var a = this.getSongsIDsFromSelectedGridRows();
  if (a.length)
    {
      GS.user.addToSongFavorites(a);
      GS.guts.objectListPlayAdd(a, this.element, "add");
    }
  GS.guts.objectListPlayAdd(a, this.element, "add");
}
), getSongsIDsFromSelectedGridRows : (function ()
{
  var a = $("#grid").controller(), b = [];
  if (a && a.selectedRowIDs.length > 0)
    b = a.selectedRowIDs;
  else
    for (var c = 0;c < a.dataView.rows.length;c++)
      b.push(a.dataView.rows[c].SongID);
  return b;
}
), "#page_header .dropdownOptions a[name=share] click" : (function (a)
{
  console.log("dropdown.share", this.type, this, a.attr("rel"), "click", a);
  var b = this.element.find(".gs_grid:last").controller();
  if (! b || b.selectedRowIDs.length === 0)
    GS.lightbox.open("share", {service : a.attr("rel"), type : this.type, id : this.id});
  else
    if (b.selectedRowIDs.length === 1)
      {
        GS.lightbox.open("share", {service : a.attr("rel"), type : "song", id : (this.getSongsIDsFromSelectedGridRows())[0]});
        a = parseInt($("#grid .selected").attr("row"), 10) + 1;
        GS.guts.logEvent("OLShare", {songIDs : (this.getSongsIDsFromSelectedGridRows())[0], ranks : a});
      }
}
), "#page_search input keyup" : (function (a,b)
{
  var c = $("#page_search_results li.selected");
  switch (b.which)
  {
    case _.keys.ESC:
      $("#page_search_results").hide();
      $("#page_search a.remove").addClass("hide");
      $(a).val("");
      return ;
    case _.keys.UP:
      c.is(":first-child") ? $("#page_search_results li:last").addClass("selected") : c.prev().addClass("selected");
      c.removeClass("selected");
      return ;
    case _.keys.DOWN:
      c.is(":last-child") ? $("#page_search_results li:first").addClass("selected") : c.next().addClass("selected");
      c.removeClass("selected");
      return ;
    case _.keys.ENTER:
      $("#page_search").submit();
      return ;
  }
  $("#page_search a.remove").toggleClass("hide", ! ($(a).val()).length);
  this.inpageSearch();
}
), searchTimeout : false, searchTimeoutWait : 100, inpageSearch : (function ()
{
  var a = $("#page_search input");
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(this.callback((function ()
{
  var b = this.element.find(".gs_grid:last").controller(), c = $.trim($(a).val().toLowerCase());
  if (b)
    {
      var d = c;
      if ($("#page").is(".gs_page_search") && _.isString(this.query))
        if (c.indexOf(this.query.toLowerCase()) === 0)
          d = c.substring(this.query.length);
      b.searchString = $.trim(d);
      b.dataView.refresh();
    }
  else
    if (($("#feed.events")).length)
      if (c == "")
        $("#feed.events .event").show();
      else
        {
          new Date().getTime();
          $("#feed.events .event").each((function ()
{
  var f = $(this);
  f.text().toLowerCase().indexOf(c) !== - 1 ? f.show() : f.hide();
}
));
          new Date().getTime();
        }
  c.length > 0 ? GS.service.getArtistAutocomplete(c, this.callback("autocompleteSuccess"), this.callback("autocompleteFail")) : $("#page_search_results").hide();
}
)), this.searchTimeoutWait);
}
), "#page_search input focus" : (function ()
{
  this.pageSearchHasFocus = true;
}
), "#page_search input blur" : (function ()
{
  setTimeout(this.callback((function ()
{
  this.pageSearchHasFocus || $("#page_search_results").hide();
}
)), 500);
  this.pageSearchHasFocus = false;
}
), "#page_search .search-item a click" : (function (a)
{
  $("#page_search_results li.selected").removeClass("selected");
  $(a).parent().addClass("selected");
  $(a).is(".search-item") && $("#page_search input").val($(a).text());
  $("#page_search").submit();
}
), "#page_search a.icon click" : (function ()
{
  $("#page_search input").focus().select();
}
), "#page_search a.remove click" : (function (a)
{
  $(a).addClass("hide");
  $("#page_search_results").hide();
  $("#page_search input").val("").focus();
  this.inpageSearch();
}
), "#page_search submit" : (function (a,b)
{
  b.preventDefault();
  GS.search = _.orEqual(GS.search, {});
  GS.search.type = $(a).attr("data-search-type") || "";
  var c = $("#page_search_results li.selected");
  GS.search.query = c.is(".search-item-result") ? c.find("a").text() : $("input[name=q]", a).val();
  if (GS.search.query && GS.search.query.length)
    {
      this.pageSearchHasFocus = false;
      GS.router.performSearch(GS.search.type, GS.search.query);
    }
}
), autocompleteSuccess : (function (a)
{
  this.autocompleteResults = a;
  $("#page_search_results").html(this.view("/shared/pageSearchResults"));
  this.pageSearchHasFocus && $("#page_search_results").show();
}
), autocompleteFail : (function ()
{
  $("#page_search_results").remove(".search_result").hide();
}
), "#feed.events button[name=play] click" : (function (a)
{
  $(a).closest(".event").data("event").playSongs(- 1, true);
}
), "#feed.events .event a[name=play] click" : (function (a)
{
  var b = $(a).closest(".event").data("event");
  a = _.orEqual($(a).attr("rel"), - 1);
  b.playSongs(a, a == - 1 ? true : false);
}
), "#feed.events .event .songLink click" : (function (a)
{
  a = $(a).closest(".event");
  a = $(a).data("event");
  a = GS.Models.Song.wrapFeed(a.data.songs);
  if (a.length == 1)
    if (a = (a = a[0]) && $.isFunction(a.toUrl) ? a.toUrl() : false)
      location.hash = a;
  return false;
}
), "#feed.events .event .showSongs click" : (function (a)
{
  a = $(a).closest(".event");
  var b = $(a).data("event"), c = $(a).find(".songWrapper"), d = $(a).find(".songList");
  if ((d.children()).length)
    c.toggle();
  else
    {
      var f = GS.Models.Song.wrapFeed(b.data.songs);
      c.css("visibility", "hidden").show();
      oldCols = GS.Controllers.GridController.columns.song.concat();
      b = [oldCols[0], oldCols[1], oldCols[2]];
      d.gs_grid(f, b, {sortCol : "Sort", padding : 0});
      $(window).resize();
      c.css("visibility", "visible");
    }
  c = d.is(":visible") ? $.localize.getString("FEED_HIDE_SONGS") : $.localize.getString("FEED_VIEW_SONGS");
  $(a).find("button.showSongs .label").text(c);
}
), "#feed.events .event .feedControl click" : (function (a)
{
  var b = $(a).closest(".event"), c = $(b).data("event");
  switch ($(a).attr("rel"))
  {
    case "remove":
      b.remove();
      c.remove();
      break ;
  }
}
), ".slick-row .song .options .favorite click" : (function (a,b)
{
  console.log("song favorite option click", a, b);
  var c = a.parent().attr("rel"), d = parseInt($(a).parents(".slick-row").attr("row")) + 1;
  if (a.parent().is(".isFavorite"))
    {
      GS.user.removeFromSongFavorites(c);
      a.parent().removeClass("isFavorite");
    }
  else
    {
      GS.user.addToSongFavorites(c);
      a.parent().addClass("isFavorite");
      GS.guts.songItemFavoriteClick(c, d);
    }
}
), ".slick-row .song .options .library click" : (function (a,b)
{
  console.log("song library option click", a, b);
  var c = a.parent().attr("rel"), d = parseInt($(a).parents(".slick-row").attr("row")) + 1;
  if (a.parent().is(".inLibrary"))
    {
      GS.user.removeFromLibrary(c);
      a.parent().removeClass("inLibrary");
    }
  else
    {
      GS.user.addToLibrary(c);
      a.parent().addClass("inLibrary");
      GS.guts.songItemLibraryClick(c, d);
    }
}
), ".slick-row .playlist .subscribe click" : (function (a,b)
{
  console.log("playlist subscribe option click", a, b);
  var c = a.attr("rel");
  if (GS.Models.Playlist.getOneFromCache(c).isSubscribed())
    {
      GS.user.removeFromPlaylistFavorites(c);
      a.removeClass("subscribed").find("span").text($.localize.getString("PLAYLIST_SUBSCRIBE"));
    }
  else
    {
      GS.user.addToPlaylistFavorites(c);
      a.addClass("subscribed").find("span").text($.localize.getString("PLAYLIST_UNSUBSCRIBE"));
    }
}
), ".slick-row .user .follow click" : (function (a,b)
{
  console.log("user follow option click", a, b);
  var c = a.attr("rel");
  if (a.is(".following"))
    {
      GS.user.removeFromUserFavorites(c);
      a.removeClass("following").find("a.follow span").text("Follow");
    }
  else
    {
      GS.user.addToUserFavorites(c);
      a.addClass("following").find("a.follow span").text("Unfollow");
    }
}
), ".slick-cell.song li.more click" : (function (a,b)
{
  var c = $(a).parents(".options").attr("rel"), d = GS.Models.Song.getOneFromCache(c), f = $(a).parents(".slick-row").attr("row"), g = $(a).parents(".gs_grid").controller(), h = {}, o;
  rank = parseInt(f) + 1;
  if ($("#page").is(".gs_page_now_playing"))
    {
      o = d.queueSongID;
      h = {isQueue : true, flagSongCallback : (function (p)
{
  GS.player.flagSong(o, p);
}
)};
    }
  if ($("div.gridrow" + f).is(":visible"))
    {
      $("div.gridrow" + f).hide();
      a.removeClass("active-context");
    }
  else
    {
      $(a).jjmenu(b, d.getOptionMenu(h), null, {xposition : "right", yposition : "right", show : "show", className : "rowmenu gridrow" + f});
      GS.guts.logEvent("songOptionMenuClicked", {songID : c, rank : rank, objList : true});
    }
  g.currentRow = f;
  g.grid.setSelectedRows([f]);
  g.grid.onSelectedRowsChanged();
}
), playClickSongID : false, ".slick-cell.song a.play click" : (function (a,b)
{
  var c = parseInt(a.siblings("ul.options").attr("rel"), 10), d = GS.player.getCurrentQueue(), f = GS.player.isPlaying;
  isPaused = GS.player.isPaused;
  if (this.playClickSongID != c)
    {
      this.playClickSongID = c;
      row = $(a).parents(".slick-row").attr("row");
      rank = parseInt(row) + 1;
      row = $(a).parents(".slick-row").attr("row");
      rank = parseInt(row) + 1;
      if (a.parents(".slick-row").is(".active") && d.activeSong.SongID == c)
        if (! f && ! isPaused)
          {
            $(a).removeClass("paused");
            GS.player.playSong($(a).parents(".slick-row").attr("rel"));
          }
        else
          if (f)
            {
              $(a).addClass("paused");
              GS.player.pauseSong();
            }
          else
            {
              $(a).removeClass("paused");
              GS.player.resumeSong();
            }
      else
        if ($("#page").is(".gs_page_now_playing"))
          {
            b.stopImmediatePropagation();
            GS.player.playSong($(a).parents(".slick-row").attr("rel"));
          }
        else
          if (($(a).parents(".gs_grid.hasSongs")).length)
            {
              GS.player.addSongsToQueueAt([c]);
              GS.guts.logEvent("songItemAddButton", {songID : c, rank : rank});
            }
          else
            {
              GS.player.addSongAndPlay(c);
              GS.guts.logEvent("songItemPlayButton", {songID : c, rank : rank});
            }
      setTimeout(this.callback((function ()
{
  this.playClickSongID = false;
}
)), 500);
      return false;
    }
}
), ".slick-row.event click" : (function (a,b)
{
  var c = a.attr("row");
  c = ($("#grid").controller()).dataView.getItemByIdx(c);
  $(b.target).is("a[href]") || window.open(c.TicketsURL, "_blank");
}
), "#searchForm, #homeSearch submit" : (function (a,b)
{
  b.preventDefault();
  GS.search = _.orEqual(GS.search, {});
  GS.search.query = $("input[name=q]", a).val();
  GS.search.type = $(a).attr("data-search-type") || "";
  GS.search.query && GS.search.query.length && GS.router.performSearch(GS.search.type, GS.search.query);
}
), "#feed .what>a click" : (function (a,b)
{
  GS.guts.handleFeedEventClick(a, b);
}
), "#feed li.option click" : (function (a,b)
{
  GS.guts.handleFeedEventClick(a, b);
}
), "#feed li.show click" : (function (a,b)
{
  GS.guts.handleFeedEventClick(a, b);
}
), "#searchArtists a click" : (function (a,b)
{
  GS.guts.handleSearchSidebarClick(a, b, "artist");
}
), "#searchAlbums a click" : (function (a,b)
{
  GS.guts.handleSearchSidebarClick(a, b, "album");
}
), "#searchPlaylists a click" : (function (a,b)
{
  GS.guts.handleSearchSidebarClick(a, b, "playlist");
}
), "#searchUsers a click" : (function (a,b)
{
  GS.guts.handleSearchSidebarClick(a, b, "user");
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.RapLeafController", {onDocument : true}, {REDIRECT_URL : "", personalizeObj : null, init : (function ()
{
  $.subscribe("gs.auth.update", this.callback(this.update));
}
), ready : (function ()
{
  this.REDIRECT_URL = "http://targeting.grooveshark.com/rapcallback.php";
  this.onPersonalize();
}
), update : (function ()
{
  this.onPersonalize();
}
), onPersonalize : (function ()
{
  var a = store.get("personalize" + GS.user.UserID);
  if (a)
    if (a.length >= 0)
      this.onRapLeafCall();
    else
      jQuery.isEmptyObject(a) && this.onRapLeafCall();
  else
    this.onRapLeafCall();
}
), onRapLeafCall : (function ()
{
  GS.user.IsPremium || GS.user.isLoggedIn || this.onPersonalizeByWebVisit();
}
), onPersonalizeByWebVisit : (function ()
{
  GS.service.rapleafPersonalize(this.REDIRECT_URL, this.callback("onPersonalizeCallback"), this.callback("onPersonalizeCallback"));
}
), onPersonalizeCallback : (function (a)
{
  var b;
  if (a)
    try
      {
        b = JSON.parse(a);
        store.set("personalize" + GS.user.UserID, b);
        a = {};
        if (! GS.user.TSDOB && b.age)
          a.age = true;
        if (! GS.user.Sex && b.gender)
          a.gender = true;
        jQuery.isEmptyObject(a) || GS.guts.logEvent("rapleafCollectedData", a);
      }
    catch (c)
      {
        store.set("personalize" + GS.user.UserID, null);
      }
  else
    store.set("personalize" + GS.user.UserID, null);
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.InviteInterface", {onDocument : false}, {userInfo : {}, googleContacts : null, facebookFriends : [], fbIDs : {}, slickbox : false, peopleError : null, people : null, onFollowersSuccess : (function (a)
{
  var b = [];
  $.each(a, this.callback((function (c,d)
{
  b.push([d.Email, d.Username + " " + d.Email, d.Username, d.Username]);
  this.userInfo[d.UserID] = d;
  this.userInfo[d.Username] = d;
}
)));
  a = new $.TextboxList("#emails", {addOnBlur : true, bitsOptions : {editable : {growing : true, growingOptions : {maxWidth : $("#emails").innerWidth() - 10}}}, plugins : {autocomplete : {placeholder : $.localize.getString("SHARE_EMAIL_PLACEHOLDER")}}, encode : this.callback((function (c)
{
  for (var d = [], f = 0;f < c.length;f++)
    if (c[f][0])
      this.userInfo[c[f][0]] ? d.push(this.userInfo[c[f][0]].Email) : d.push(c[f][0]);
    else
      if (c[f][1])
        this.userInfo[c[f][1]] ? d.push(this.userInfo[c[f][1]].Email) : d.push(c[f][1]);
  return d.join(",");
}
))});
  a.plugins.autocomplete.setValues(b);
  a.addEvent("bitAdd", this.callback((function (c)
{
  (c.getValue())[1] === "" && c.hide();
  if (this.userInfo[(c.getValue())[1]] && _.notDefined((c.getValue())[0]))
    {
      var d = this.userInfo[(c.getValue())[1]];
      c.setValue([d.Email, d.Username + " " + d.Email, d.Username, d.Username]);
      c.show();
    }
}
)));
  a.fireEvent("focus");
}
), onFollowersFailed : (function (a)
{
  console.warn("failed grabbing contact info for followers", autocompleteTerms, a);
  $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_FAIL_FANS_EMAIL_ONLY")});
}
), onFacebookFriends : (function (a)
{
  a || (a = []);
  if (this.facebookFriends = a)
    {
      _.forEach(this.facebookFriends, (function (b,c)
{
  this.facebookFriends[c].selected = false;
}
), this);
      $("contactsContainer.facebook", this.element).show();
    }
  this.onFacebookFriendsCallback();
}
), formSubmit : (function ()
{
  console.log("interface.formSubmit", this.submitType);
  var a = this, b = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  this.peopleError = [];
  this.people = [];
  switch (this.submitType)
  {
    case "email":
      var c;
      c = $.trim($("textarea[name=emails]", this.element).val());
      var d = $("div.textboxlist", this.element).find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").filter(":last").text();
      if (c !== "")
        {
          c = c.split(",");
          _.forEach(c, (function (h)
{
  h.match(b) ? a.people.push(h) : a.peopleError.push(h);
}
));
        }
      if (d)
        d.match(b) ? this.people.push(d) : this.peopleError.push(d);
      if (this.people.length)
        GS.service.sendInvites(this.people, this.callback("sendInviteSuccess"), this.callback("sendInviteFailed"));
      else
        this.peopleError.length && this.invalidInviteEmail();
      break ;
    case "googleLogin":
      d = $("input[name=google_username]", this.element).val();
      c = $("input[name=google_password]", this.element).val();
      GS.service.getGoogleAuthToken(d, c, this.callback("googAuthSuccess"), this.callback("googAuthFailed"));
      break ;
    case "googleContacts":
      var f = [];
      $(".contactsContainer input:checked", this.element).each((function ()
{
  f.push(this.value);
}
));
      f.length && GS.service.sendInvites(f, this.callback("sendInviteSuccess"), this.callback("sendInviteFailed"));
      break ;
    case "facebook":
      var g = _.orEqual($("textarea[name=facebookMessage]", this.element).val(), "");
      _.count(this.fbIDs) > 0 ? _.forEach(this.fbIDs, this.callback((function (h,o)
{
  GS.facebook.postToFeed(o, "http://listen.grooveshark.com/", g, this.callback("facebookSuccess"), this.callback("facebookFailed"));
}
))) : GS.facebook.postToFeed("me", "http://listen.grooveshark.com/", g, this.callback("facebookSuccess"), this.callback("facebookFailed"));
      break ;
  }
  return false;
}
), sendInviteSuccess : (function (a)
{
  console.log("invite success", a);
  var b = [], c = [], d = [], f = [], g = "";
  if (a)
    for (h in a)
      switch (a[h].status)
      {
        case "error":
          a[h].errorCode == - 3 ? f.push(h) : b.push(h);
          break ;
        case "followed":
          c.push(a[h].Username);
          break ;
        case "invited":
          d.push(h);
          break ;
      }
  if (c.length)
    {
      g = new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_FOLLOWING"), {list : c.join(", ")}).render();
      $.publish("gs.notification", {type : "info", message : g});
      console.log("follow", c, g);
    }
  if (d.length)
    {
      g = d.length > 5 ? new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_INVITED_SUM"), {sum : String(d.length)}).render() : new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_INVITED_LIST"), {list : d.join(", ")}).render();
      $.publish("gs.notification", {type : "info", message : g});
      console.log("invite", d, g);
    }
  if (f.length)
    {
      g = new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_ALREADY_SENT"), {list : f.join(", ")}).render();
      $.publish("gs.notification", {type : "info", message : g});
      console.log("alreadySent", f, g);
    }
  if (b.length)
    {
      g = new GS.Models.DataString($.localize.getString("POPUP_INVITE_FORM_RESPONSE_ERROR"), {list : b.join(", ")}).render();
      $.publish("gs.notification", {type : "error", message : g});
      console.log("errors", b, g);
    }
  if (this.peopleError.length)
    this.invalidInviteEmail();
  else
    if (b.length + c.length + d.length + f.length == 0)
      {
        this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR"));
        this.element.find(".error").show();
      }
    else
      this.sendInviteSuccessCallback();
}
), sendInviteFailed : (function (a)
{
  console.warn("invite failed", a);
  this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_FORM_RESPONSE_UNKNOWN_ERROR"));
  this.element.find(".error").show();
}
), invalidInviteEmail : (function ()
{
  console.warn("invalid invite email");
  var a = $("div.textboxlist", this.element).find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").filter(":last").text();
  a && this.people.indexOf(a) >= 0 && $("div.textboxlist", this.element).find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").remove();
  _.forEach(this.people, (function (b)
{
  $("li.textboxlist-bit:contains('" + b + "')").remove();
}
));
  this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FORM_RESPONSE_INVALID_EMAIL_ERROR").html($.localize.getString("POPUP_INVITE_FORM_RESPONSE_INVALID_EMAIL_ERROR"));
  this.element.find(".error").show();
}
), googAuthSuccess : (function (a)
{
  console.log("goog auth success", a);
  switch (parseInt(a.result.statusCode))
  {
    case 1:
      a = String(a.result.rawResponse);
      a = a.substr(a.indexOf("Auth=") + 5);
      GS.service.getGoogleContacts(a, this.callback("googContactsSuccess"), this.callback("googContactsFailed"));
      break ;
    case 2:
      this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR"));
      this.element.find(".error").show();
      break ;
    default:
      this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
      this.element.find(".error").show();
      break ;
  }
}
), googAuthFailed : (function (a)
{
  console.warn("goog auth failed", a);
  this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
  this.element.find(".error").show();
}
), googContactsSuccess : (function (a)
{
  console.log("goog contacts success", a);
  switch (parseInt(a.result.statusCode, 10))
  {
    case 1:
      this.googleContacts = a.result.parsedResult;
      this.showOnlyNamedContacts = true;
      this.googContactsSuccessCallback();
      break ;
    case 2:
      this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_AUTH_ERROR"));
      this.element.find(".error").show();
      break ;
    default:
      this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
      this.element.find(".error").show();
      break ;
  }
}
), googContactsFailed : (function (a)
{
  console.warn("goog contacts failed", a);
  this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR").html($.localize.getString("POPUP_INVITE_GOOGAUTH_RESPONSE_UNKNOWN_ERROR"));
  this.element.find(".error").show();
}
), facebookSuccess : (function (a)
{
  console.log("facebook invite success", a);
  this.facebookSuccessCallback();
}
), facebookFailed : (function (a)
{
  console.warn("facebook invite failed", a);
  this.element.find(".message").attr("data-translate-text", "POPUP_INVITE_FACEBOOK_POST_ERROR").html($.localize.getString("POPUP_INVITE_FACEBOOK_POST_ERROR"));
  this.element.find(".error").show();
}
), facebookItemClass : (function (a,b,c)
{
  return "contact clear" + (b >= c.length - 2 ? " last" : "");
}
), facebookItemRenderer : (function (a)
{
  return ["<label class=\"", a.selected ? "selected" : "", "\"><img src=\"http://graph.facebook.com/", a.id, "/picture\" /><input class=\"facebookContact hide\" type=\"checkbox\" value=\"", a.id, "\" ", a.selected ? "checked" : "", " /><span class=\"facebookUsername\">", a.name, "</span></label>"].join("");
}
), "input keydown" : (function (a,b)
{
  b.keyCode && b.keyCode == 13 && a.is("[name*=google]") && this.formSubmit();
}
), "input.googleContact click" : (function (a)
{
  $(a).is(":checked") ? $(a).closest("li.contact").addClass("selected") : $(a).closest("li.contact").removeClass("selected");
}
), "input.facebookContact click" : (function (a)
{
  if ($(a).is(":checked"))
    {
      $(a).parent().addClass("selected");
      this.fbIDs[a.val()] = a.val();
      this.facebookFriends[(parseInt(a.parents("li.contact").attr("rel"), 10))].selected = true;
    }
  else
    {
      $(a).parent().removeClass("selected");
      delete this.fbIDs[(a.val())];
      this.facebookFriends[(parseInt(a.parents("li.contact").attr("rel"), 10))].selected = false;
    }
  this.slickbox.setItems(this.facebookFriends);
  if (this.submitType == "facebook")
    _.count(this.fbIDs) > 0 ? this.element.find(".submit span").attr("data-translate-text", "SEND_INVITE").html($.localize.getString("SEND_INVITE")) : this.element.find(".submit span").attr("data-translate-text", "POST_TO_PROFILE").html($.localize.getString("POST_TO_PROFILE"));
}
), "button.uncheckAll click" : (function ()
{
  if (this.submitType == "facebook")
    {
      this.element.find(".submitButtons .submit span").attr("data-translate-text", "POST_TO_PROFILE").html($.localize.getString("POST_TO_PROFILE"));
      _.forEach(this.facebookFriends, (function (a,b)
{
  this.facebookFriends[b].selected = false;
}
), this);
      this.fbIDs = {};
      this.slickbox.setItems(this.facebookFriends);
    }
  else
    this.submitType == "googleContacts" && $(".google_contacts input", this.element).attr("checked", false);
}
), "button.checkAll click" : (function ()
{
  if (this.submitType == "facebook")
    {
      this.element.find(".submitButtons .submit span").attr("data-translate-text", "SEND_INVITE").html($.localize.getString("SEND_INVITE"));
      _.forEach(this.facebookFriends, (function (a,b)
{
  this.facebookFriends[b].selected = true;
  this.fbIDs[a.id] = a.id;
}
), this);
      this.slickbox.setItems(this.facebookFriends);
    }
  else
    this.submitType == "googleContacts" && $(".google_contacts input", this.element).attr("checked", true);
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.HomeController", {}, {init : (function (a,b)
{
  this.update(b);
  this.subscribe("window.resize", this.callback("resize"));
  $(document).keydown(this.callback((function (c)
{
  this.toggleHint({}, c);
  var d = String.fromCharCode(_.orEqual(c.keyCode, c.which)).replace(/\s+/, "");
  $("#page").is(".gs_page_home") && ! $(c.target).is("input,textarea,object") && d.length && $("input.search.autocomplete", this.element).focus();
}
)));
}
), update : (function ()
{
  if (! GS.lightbox || ! GS.lightbox.isOpen)
    $("input.search.autocomplete", this.element).focus();
  $(".home_settings").toggleClass("hide", GS.user.isLoggedIn);
  $(".home_upgrade").toggleClass("hide", ! GS.user.isLoggedIn);
  $.publish("gs.page.home.update");
}
), index : (function ()
{
  this._super();
  this.addAutocomplete();
  this.resize();
  this.subscribe("window.resize", this.callback("resize"));
  this.subscribe("gs.auth.update", this.callback("update"));
  GS.Controllers.PageController.title("Listen to Free Music Online - Internet Radio - Free MP3 Streaming", false);
  $.publish("gs.page.home.view");
}
), resize : (function ()
{
  var a = $("#homeSearch"), b = 500;
  if (a.length)
    {
      b = Math.max(250, Math.min(500, $(this.element).width() - 200));
      a.width(b).css("marginLeft", - Math.round(b / 2));
    }
}
), addAutocomplete : (function ()
{
  $("input.search.autocomplete", this.element).autocomplete({scroll : true, matchSubset : false, selectFirst : false, source : (function (a,b)
{
  if (a.term && a)
    {
      var c = [];
      GS.service.getArtistAutocomplete(a.term, (function (d)
{
  if ($("#page").is(".gs_page_home"))
    {
      d.Artists && $.each(d.Artists, (function (f,g)
{
  c.push(g.Name);
}
));
      b(c);
    }
}
), (function ()
{
  }
));
    }
}
), select : (function (a,b)
{
  $("#searchBar_input input").val(b.item.value);
  $("#homeSearch").submit();
}
)});
}
), toggleHint : (function (a,b)
{
  if (b.type == "mousedown")
    if ($("#searchBar_input input").val() == "" && b.button != 2)
      {
        $("#searchBar_input span").show();
        $("#searchBar_input span").css("opacity", "0.33");
      }
    else
      $("#searchBar_input span").hide();
  else
    if (b.type == "keyup" || b.type == "keydown")
      {
        var c = String.fromCharCode(_.orEqual(b.keyCode, b.which)).replace(/[\b]/, "");
        if ((String.fromCharCode(_.orEqual(b.keyCode, b.which)).replace(/[\s]/, "")).length > 0)
          if ($("#searchBar_input input").val() == "" && c.length < 1)
            {
              $("#searchBar_input span").show();
              $("#searchBar_input span").css("opacity", "0.33");
            }
          else
            $("#searchBar_input span").hide();
      }
    else
      if ($("#searchBar_input input").val() == "")
        {
          $("#searchBar_input span").show();
          $("#searchBar_input span").css("opacity", "1");
        }
      else
        $("#searchBar_input span").hide();
}
), "#homeSearch submit" : (function (a,b)
{
  if ($("input[name=q]", a).val() === "")
    {
      b.stopImmediatePropagation();
      return false;
    }
  return true;
}
), "#searchButton click" : (function ()
{
  $("#homeSearch").submit();
}
), "#searchBar_input span click" : (function ()
{
  $("input.search.autocomplete", this.element).focus();
  $("#searchBar_input span").css("opacity", "0.33");
}
), "#homePage keydown" : (function ()
{
  $("input.search.autocomplete", this.element).focus();
}
), "input.search.autocomplete mousedown" : (function (a,b)
{
  return this.toggleHint(a, b);
}
), "input.search.autocomplete keyup" : (function (a,b)
{
  return this.toggleHint(a, b);
}
), "input.search.autocomplete focusout" : (function (a,b)
{
  if ($("#searchBar_input input").hasClass("focused"))
    {
      setTimeout((function ()
{
  $("input.search.autocomplete", "#page").focus();
}
), 0);
      $("#searchBar_input input").removeClass("focused");
      return true;
    }
  else
    return this.toggleHint(a, b);
}
), "a.themes click" : (function ()
{
  GS.lightbox.open("themes");
}
), notFound : (function ()
{
  this.element.html(this.view("not_found"));
  this.addAutocomplete();
  this.resize();
  this.subscribe("window.resize", this.callback("resize"));
  this.subscribe("gs.auth.update", this.callback("update"));
  GS.Controllers.PageController.title("Unable To Find What You're Looking For");
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.NowPlayingController", {}, {index : (function ()
{
  GS.Controllers.PageController.title("Now Playing");
  this.element.html(this.view("index"));
  this.list.doSearchInPage = true;
  this.loadGrid(GS.player.getCurrentQueue());
  this.subscribe("gs.player.queue.change", this.callback("loadGrid"));
}
), loadGrid : (function (a)
{
  if ($("#page").is(".gs_page_now_playing"))
    {
      console.log("nowplaying.loadgrid. queue: ", a);
      if (! a)
        {
          a = GS.player.getCurrentQueue();
          if (! a)
            {
              this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "song"}));
              return ;
            }
        }
      this.queue = a;
      var b = a.songs.length > 0 && a.songs[0]  instanceof  GS.Models.Song ? a.songs : GS.Models.Song.wrapQueue(a.songs), c = this.element.find(".gs_grid").controller(), d = {sortCol : "Sort", sortDir : 1, sortStoreKey : "gs.sort.nowPlaying.songs"};
      d = $.extend(d, {allowDuplicates : true, allowDragSort : true, isNowPlaying : true});
      for (var f = 1;f < b.length;f++)
        b[f].Sort = f;
      if (c)
        {
          d = c.dataView;
          var g = c.grid;
          if (d)
            {
              d.beginUpdate();
              var h = b.concat(), o = d.getItems().concat(), p;
              for (f = 0;f < o.length;f++)
                {
                  song = o[f];
                  p = h.indexOf(song);
                  p != - 1 && h.splice(p, 1);
                  d.getIdxById(song.SongID);
                  curInd = b.indexOf(song);
                  curInd == - 1 ? d.deleteItem(song.SongID) : d.updateItem(song.GridKey, song);
                }
              h.length && d.addItems(h, "SongID");
              d.endUpdate();
              d.refresh();
            }
          g && g.onSort(c.sortCol, c.sortDir);
        }
      else
        if (b.length)
          {
            d.rowCssClasses = this.callback((function (q)
{
  var t = "";
  a = GS.player.getCurrentQueue();
  if (a.activeSong && a.activeSong.queueSongID == q.queueSongID)
    t += "active";
  if (a.autoplayEnabled)
    t += " autoplay";
  return t;
}
));
            d.rowAttrs = (function (q)
{
  return ["rel='", q.queueSongID, "' rel2='", q.SongID, "'"].join("");
}
);
            this.element.find(".gs_grid").gs_grid(b, GS.Controllers.GridController.columns.queuesong, d, "song");
          }
        else
          this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "now_playing"}));
      a.hasRestoreQueue ? $("#page_header button.clearRestore .restore").show().siblings().hide() : $("#page_header button.clearRestore .clears").show().siblings().hide();
      $("#grid .slick-row.active").removeClass("active");
      if (a.activeSong)
        {
          $("#grid .slick-row[rel=" + a.activeSong.queueSongID + "]").addClass("active");
          GS.player.isPlaying ? $("#grid .slick-row.active a.play").removeClass("paused") : $("#grid .slick-row.active a.play").addClass("paused");
        }
    }
}
), "button.delete click" : (function ()
{
  var a = [], b = this.element.find(".gs_grid").controller();
  if (b)
    {
      var c = b.grid.getSelectedRows();
      if (c.length !== 0)
        {
          for (var d = 0;d < c.length;d++)
            a.push((b.dataView.getItemByIdx(c[d])).queueSongID);
          GS.player.removeSongs(a);
          b.grid.setSelectedRows([]);
          b.selectedRowIDs = [];
          $.publish("gs.grid.selectedRows", {len : 0, type : "song"});
        }
    }
}
), "button.save click" : (function (a,b)
{
  console.log("nowplaying button.save", a, b);
  var c, d = [], f = (GS.player.getCurrentQueue()).songs;
  for (c = 0;c < f.length;c++)
    d.push(f[c].SongID);
  GS.lightbox.open("newPlaylist", d);
  GS.guts.logEvent("queueSaveInitiated", {});
}
), "button.clearRestore click" : (function (a)
{
  if ((GS.player.getCurrentQueue()).hasRestoreQueue)
    {
      GS.player.restoreQueue();
      a.find(".restore").show().siblings().hide();
    }
  else
    {
      GS.player.clearQueue();
      a.find(".clears").show().siblings().hide();
    }
}
), ".slick-row .smile click" : (function (a,b)
{
  b.stopImmediatePropagation();
  console.log("nowplaying.smile click", a, b);
  var c = a.parents(".slick-row").attr("row");
  c = (($("#grid").controller()).dataView.getItemByIdx(c)).queueSongID;
  GS.player.voteSong(c, 1);
  $(a).addClass("selected").siblings(".frown").removeClass("selected");
}
), ".slick-row .frown click" : (function (a,b)
{
  b.stopImmediatePropagation();
  console.log("nowplaying.frown click", a.get(), b);
  var c = a.parents(".slick-row").attr("row");
  c = (($("#grid").controller()).dataView.getItemByIdx(c)).queueSongID;
  GS.player.voteSong(c, - 1);
  $(a).addClass("selected").siblings(".smile").removeClass("selected");
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.PopularController", {}, {index : (function (a)
{
  this.pageType = a = _.orEqual(a, "daily");
  this.type = "popular";
  GS.Controllers.PageController.title("Popular Music: " + _.ucwords(a));
  this.element.html(this.view("index"));
  this.list.doSearchInPage = true;
  this.popular = GS.Models.Popular.getType(a);
  this.popular.getSongs(this.callback("loadGrid"));
}
), loadGrid : (function (a)
{
  var b, c = store.get("gs.sort.popular") || {sortCol : "Popularity", sortStoreKey : "gs.sort.popular"};
  for (b = 0;b < a.length;b++)
    {
      a[b].Popularity = b + 1;
      a[b].isVerified = - 1;
    }
  if (a.length)
    {
      b = GS.Controllers.GridController.columns.song.concat();
      b = [b[0], b[1], b[2]];
      this.element.find(".gs_grid").gs_grid(a, b, c, "song");
    }
  else
    this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "song"}));
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.SettingsController", {}, {user : null, settings : null, desktopPrefs : null, index : (function (a)
{
  if ($("#page").is(".gs_page_settings"))
    {
      this.pageType = a || "profile";
      console.log("gs.page.settings", GS.user);
      if (! GS.user.isLoggedIn)
        if (this.pageType !== "preferences" && this.pageType !== "subscriptions")
          this.pageType = "preferences";
      GS.user.settings.getUserSettings(this.callback("loadSettings"), GS.router.notFound);
      this.subscribe("gs.auth.update", this.callback("index"));
      this.subscribe("gs.auth.favorites.users.update", this.callback("updateActivityUsersForm"));
      this.subscribe("gs.facebook.profile.update", this.callback("updateFacebookForm"));
      this.subscribe("gs.lastfm.profile.update", this.callback("updateLastfmForm"));
      this.subscribe("gs.google.profile.update", this.callback("updateGoogleForm"));
      this.subscribe("gs.settings.upload.onload", this.callback("iframeOnload"));
    }
}
), loadSettings : (function ()
{
  if ($("#page").is(".gs_page_settings"))
    {
      this.user = GS.user;
      this.settings = GS.user.settings;
      this.desktopPrefs = GS.airbridge.getDesktopPreferences();
      this.element.html(this.view("index"));
      switch (this.pageType)
      {
        case "profile":
          GS.Controllers.PageController.title("Settings");
          this.showProfile();
          break ;
        case "password":
          GS.Controllers.PageController.title("Change Password");
          this.showPassword();
          break ;
        case "preferences":
          GS.Controllers.PageController.title("Preferences");
          this.showPreferences();
          break ;
        case "services":
          GS.Controllers.PageController.title("Services Settings");
          this.showServices();
          break ;
        case "activity":
          GS.Controllers.PageController.title("Activity Settings");
          this.showActivity();
          break ;
        case "subscriptions":
          GS.Controllers.PageController.title("Subscriptions Settings");
          GS.service.getSubscriptionDetails(this.callback("showSubscriptions"), this.callback("showSubscriptions"));
          break ;
        case "extras":
          GS.Controllers.PageController.title("Extras");
          this.showExtras();
          break ;
      }
    }
}
), showProfile : (function ()
{
  this.today = new Date();
  this.dob = new Date();
  if (this.settings.TSDOB)
    {
      var a = this.settings.TSDOB.split("-");
      this.dob = new Date(parseInt(a[0], 10), parseInt(a[1], 10) - 1, parseInt(a[2], 10));
    }
  this.months = $.localize.getString("MONTHS").split(",");
  this.countries = _.countries;
  this.element.find("#page_pane").html(this.view("profile"));
  $(window).resize();
  $(".selectbox.country span").html($("select.country option:selected").html());
  $(".selectbox.month span").html($("select.month option:selected").html());
}
), showPassword : (function ()
{
  this.element.find("#page_pane").html(this.view("password"));
  $(window).resize();
}
), showServices : (function ()
{
  this.element.find("#page_pane").html(this.view("services"));
  this.updateFacebookForm();
  this.updateLastfmForm();
  this.updateGoogleForm();
  $(window).resize();
}
), showPreferences : (function ()
{
  this.element.find("#page_pane").html(this.view("preferences"));
  $(window).resize();
}
), showActivity : (function ()
{
  this.settings.privacy = GS.service.privacy;
  this.element.find("#page_pane").html(this.view("activity"));
  this.hideUsers = new $.TextboxList("#settings_usersToHide", {addOnBlur : false, plugins : {autocomplete : {placeholder : $.localize.getString("SETTINGS_USER_HIDE_PLACEHOLDER")}}, encode : this.callback((function (a)
{
  for (var b = [], c = 0;c < a.length;c++)
    a[c][0] ? b.push(a[c][0]) : b.push(a[c][1]);
  return b.join(",");
}
))});
  this.hideUsers.addEvent("bitAdd", this.callback("bitCheck"));
  this.updateActivityUsersForm();
  $(window).resize();
}
), showSubscriptions : (function (a)
{
  this.data = a;
  this.noData = true;
  this.recurring = this.bVip = this.bAnywhere = this.bPlus = this.hasSpecialVip = false;
  this.billingAmount = this.nextBillingDate = this.paymentType = this.subscriptionType = "";
  this.anywhereMonthPrice = 9;
  this.plusMonthPrice = 6;
  if (a === false || a.fault || a.code || a.bVip && _.notDefined(a.paymentType))
    {
      this.noData = true;
      this.recurring = _.orEqual(a.bRecurring, false);
      this.bAnywhere = this.bPlus = false;
      if (GS.user.IsPremium)
        this.hasSpecialVip = true;
      if (a && a.bVip)
        this.bVip = parseInt(a.bVip, 10);
    }
  else
    {
      this.noData = false;
      switch (a.paymentType)
      {
        case "OPTIMAL_PAYMENTS":
          this.paymentMethod = $.localize.getString("CREDIT_CARD");
          break ;
        case "PAYPAL":
          this.paymentMethod = $.localize.getString("PAYPAL");
          break ;
        case "FREE_TRIAL":
          this.paymentMethod = $.localize.getString("FREE_TRIAL");
          break ;
        case "ZONG":
          this.paymentMethod = $.localize.getString("ZONG");
          break ;
        case "ALLOPASS":
          this.paymentMethod = $.localize.getString("ALLOPASS");
          break ;
        case "GWALLET":
          this.paymentMethod = $.localize.getString("GWALLET");
          break ;
        case "TRIAL_PAY":
          this.paymentMethod = $.localize.getString("TRIAL_PAY");
          break ;
        default:
          this.paymentMethod = _.orEqual(a.paymentType, "");
      }
      this.subscriptionType = a.subscriptionType;
      this.paymentType = a.paymentType;
      this.billingAmount = "$" + a.amount;
      this.recurring = a.bRecurring;
      this.bVip = parseInt(a.bVip, 10);
      this.bAnywhere = (GS.user.Flags & GS.Models.User.FLAG_ANYWHERE) > 0;
      this.bPlus = (GS.user.Flags & GS.Models.User.FLAG_PLUS) > 0;
      try
        {
          var b = this.recurring ? a.dateNextCheck.split("-") : a.dateEnd.split("-");
          this.nextBillingDate = new Date(parseInt(b[0], 10), parseInt(b[1], 10) - 1, parseInt(b[2], 10)).format("F j, Y");
        }
      catch (c)
        {
          console.error("subPage error:", c);
          this.nextBillingDate = $.localize.getString("UNKNOWN");
        }
    }
  if (this.bVip)
    this.plusMonthPrice = this.anywhereMonthPrice = 3;
  this.element.find("#page_pane").html(this.view("subscriptions"));
  $(window).resize();
}
), showExtras : (function ()
{
  this.element.find("#page_pane").html(this.view("extras"));
  swfobject.embedSWF("/webincludes/flash/InstallDesktop.swf", "installAirApp", "330", "180", "9.0.0", null, {bgcolor : "#eeeeee"});
  $(window).resize();
}
), paymentTypeToString : (function (a)
{
  var b = "";
  switch (a)
  {
    case "FREE_TRIAL":
      break ;
    default:
      b = $.localize.getString("SUBSCRIPTIONS_UNKNOWN_PAYMENT_TYPE");
  }
  return b;
}
), bitCheck : (function (a)
{
  this.userInfo[(a.getValue())[1]] || a.hide();
}
), updateActivityUsersForm : (function ()
{
  console.log("updating users friend activity settings");
  this.hiddenUsers = GS.user.filterFriends(1);
  this.visibleUsers = GS.user.filterOutFriends(1);
  this.element.find("#hiddenUsers").html(this.view("hiddenUsers"));
  this.element.find("#settings_usersToHide").val("");
  this.element.find(".textboxlist-bit-box-deletable").remove();
  this.userInfo = {};
  var a = [];
  $.each(this.visibleUsers, this.callback((function (b,c)
{
  a.push([c.UserID, c.Username, c.Username, c.Username]);
  this.userInfo[c.UserID] = c;
  this.userInfo[c.Username] = c;
}
)));
  _.defined(this.hideUsers) && this.hideUsers.plugins && this.hideUsers.plugins.autocomplete.setValues(a);
}
), "#settings_userInfo submit" : (function (a,b)
{
  b.preventDefault();
  console.log("settings userinfo submit", a, b);
  var c = $("input[name=fname]", a).val(), d = $("input[name=email]", a).val(), f = $("select[name=country]", a).val(), g = $("input[name=zip]", a).val(), h = $("input[name=sex]:checked", a).val(), o = [$("select[name=year]", a).val(), parseInt($("select[name=month]", a).val(), 10), $("select[name=day]", a).val()].join("-"), p = new Date(), q = new Date(parseInt($("select[name=year]", a).val(), 10), parseInt($("select[name=month]", a).val(), 10), parseInt($("select[name=day]", a).val(), 10));
  p = Math.round((p.getTime() - q.getTime()) / 31536000000);
  c = {FName : c, Email : d, Country : f, Zip : g, Sex : h, TSDOB : o};
  if (p > 13)
    GS.user.settings.updateProfile(c, this.callback(this._userInfoSuccess), this.callback(this._userInfoFailed));
  else
    {
      this.userInfoFailed({error : $.localize.getString("POP_SIGNUP_FORM_TOO_YOUNG")});
      $.publish("gs.notification", {type : "error", message : $.localize.getString("POP_SIGNUP_FORM_TOO_YOUNG")});
    }
  return false;
}
), _userInfoSuccess : (function ()
{
  $("#settings_userInfo .buttons .status").addClass("success");
}
), _userInfoFailed : (function ()
{
  $("#settings_userInfo .buttons .status").addClass("failure");
  $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_UNABLE_SAVE_SETTINGS")});
}
), "#uploadPath change" : (function (a)
{
  a = $(a).val();
  a = a.replace(/.+\\/g, "");
  if (a.length > 20)
    a = a.substr(0, 20) + "&hellip;";
  $("#uploadLabel").html(a);
}
), "#settings_profilePicture submit" : (function (a,b)
{
  console.log("settings profilepic submit", a, b);
  $("#settings_profilePicture .buttons .status").text($.localize.getString("LOADING...")).show();
  return true;
}
), iframeOnload : (function (a,b)
{
  console.log("iframe.upload.onload", a, b);
  $("#settings_profilePicture .buttons .status").text("");
  var c = a.contentWindow || (a.get()).contentDocument, d;
  if (c.document)
    c = c.document;
  c = c.body.innerHTML;
  console.log("iframe.upload.resp str", c);
  if (c)
    {
      try
        {
          d = $.parseJSON(c);
        }
      catch (f)
        {
          d = {};
        }
      console.log("json", d);
      if (! d || ! d.success || ! d.filename)
        {
          d = d || {};
          d.error && d.error.code && (d.error.code == 1 || d.error.code == 2) ? $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_UPLOAD_IMAGE_TOO_BIG")}) : $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_UNABLE_UPLOAD_IMAGE")});
          $("#settings_profilePicture .buttons .status").addClass("failure");
        }
      else
        {
          $("#settings_profilePicture .buttons .status").addClass("success");
          c = $("#settings_profilePicture").find("img");
          console.log("change img", c);
          GS.user.Picture = d.filename;
          c.attr("src", GS.user.getImageURL() + "?r=" + new Date().getTime());
        }
    }
  return false;
}
), "#settings_changePassword submit" : (function (a,b)
{
  b.preventDefault();
  console.log("settings changepass submit", a, b);
  var c = $("input[name=oldPass]", a).val(), d = $("input[name=newPass]", a).val(), f = $("input[name=confirmPass]", a).val();
  d == f && c.length > 4 && d.length > 4 ? GS.user.changePassword(c, d, this.callback(this._passwordSuccess), this.callback(this._passwordFailed)) : $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_SIGNUP_FORM_PASSWORD_INVALID_NO_MATCH")});
  return false;
}
), _passwordSuccess : (function ()
{
  $("#settings_changePassword .buttons .status").addClass("success");
}
), _passwordFailed : (function ()
{
  $("#settings_changePassword .buttons .status").addClass("failure");
}
), "#settings_changePassword a.forgot click" : (function ()
{
  GS.lightbox.open("forget");
}
), "#settings_notifications submit" : (function (a,b)
{
  b.preventDefault();
  var c = {userFollow : $("#settings_notifications_userFollow").is(":checked"), inviteSignup : $("#settings_notifications_userSignup").is(":checked"), playlistSubscribe : $("#settings_notifications_userSubscribe").is(":checked"), newFeature : $("#settings_notifications_newFeature").is(":checked")};
  console.log("settings notification submit", c);
  GS.user.settings.changeNotificationSettings(c, this.callback(this._notificationsSuccess), this.callback(this._notificationsFailed));
  return false;
}
), _notificationsSuccess : (function (a,b)
{
  $("#settings_notifications .buttons .status").addClass("success");
  console.log("settings notification SUCCESS", b);
}
), _notificationsFailed : (function (a)
{
  $("#settings_notifications .buttons .status").addClass("failure");
  $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_UNABLE_SAVE_NOTIFICATION")});
  console.log("settings notification FAILED", a);
}
), "#settings_feeds submit" : (function (a,b)
{
  b.preventDefault();
  var c = {favorites : $("#settings_feeds_favorites").is(":checked"), listens : $("#settings_feeds_listens").is(":checked")};
  console.log("settings feeds submit", c);
  GS.user.settings.changeRSSSettings(c, this.callback(this._feedSuccess), this.callback(this._feedFailed));
  return false;
}
), _feedSuccess : (function (a,b)
{
  $("#settings_feeds .buttons .status").addClass("success");
  console.log("settings feeds SUCCESS", b);
}
), _feedFailed : (function (a)
{
  $("#settings_feeds .buttons .status").addClass("failure");
  $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_UNABLE_SAVE_FEED")});
  console.log("settings feeds FAILED", a);
}
), "select blur" : (function (a)
{
  a.change();
}
), "select keydown" : (function (a)
{
  a.change();
}
), "select.country change" : (function (a)
{
  $(".selectbox.country span").text(a.find("option:selected").html());
}
), "select.month change" : (function (a)
{
  $(".selectbox.month span").text(a.find("option:selected").html());
}
), "select.day change" : (function (a)
{
  $(".selectbox.day span").text(a.find("option:selected").html());
}
), "select.year change" : (function (a)
{
  $(".selectbox.year span").text(a.find("option:selected").html());
}
), "select.crossfadeSecs change" : (function (a)
{
  $(".selectbox.crossfadeSecs span").text(a.find("option:selected").html());
}
), "select.notifPosition change" : (function (a)
{
  $(".selectbox.notifPosition span").text(a.find("option:selected").html());
}
), "select.notifDuration change" : (function (a)
{
  $(".selectbox.notifDuration span").text(a.find("option:selected").html());
}
), "form :input change" : (function (a)
{
  $(a).closest("form").find(".buttons .status").removeClass("success").removeClass("failure");
}
), "#settings_localSettings button.clearLocal click" : (function (a,b)
{
  b.preventDefault();
  store && store.clear && store.clear();
  $("#settings_localSettings .buttons .status").addClass("success");
  return false;
}
), "#settings_localSettings submit" : (function (a,b)
{
  b.preventDefault();
  console.log("settings localsettings submit", a, b);
  var c = {restoreQueue : ($("input[name=restoreQueue]:checked", a)).length ? 1 : 0, persistShuffle : ($("input[name=persistShuffle]:checked", a)).length ? 1 : 0, lowerQuality : ($("input[name=lowerQuality]:checked", a)).length ? 1 : 0, noPrefetch : ($("input[name=noPrefetch]:checked", a)).length ? 1 : 0, playPauseFade : ($("input[name=doCrossfade]:checked", a)).length ? 1 : 0, crossfadeAmount : $("select[name=crossfadeSecs]", a).val() * 1000, tooltips : ($("input[name=tooltips]:checked", a)).length ? 1 : 0};
  GS.user.settings.changeLocalSettings(c, this.callback(this._localSettingSuccess));
  return false;
}
), _localSettingSuccess : (function ()
{
  $("#settings_localSettings .buttons .status").addClass("success");
}
), "#settings_activity_privacy submit" : (function (a,b)
{
  b.preventDefault();
  console.log("settings.activity privacy submit", a, b);
  switch ($(a).find("input:checked").val())
  {
    case "-1":
      GS.service.privacy = 1;
      $("#settings_activity_privacy .buttons .status").addClass("success");
      break ;
    case "0":
      GS.service.privacy = GS.user.privacy = 0;
      GS.service.changePrivacySettings(0, this.callback("changePrivacySuccess"), this.callback("changePrivacyFailure"));
      break ;
    case "1":
      GS.service.privacy = GS.user.privacy = 1;
      GS.service.changePrivacySettings(1, this.callback("changePrivacySuccess"), this.callback("changePrivacyFailure"));
      break ;
  }
  return false;
}
), changePrivacySuccess : (function (a)
{
  $("#settings_activity_privacy .buttons .status").addClass("success");
  console.log("settings changepass SUCCESS", a);
}
), changePrivacyFailed : (function (a)
{
  $("#settings_activity_privacy .buttons .status").addClass("failure");
  console.log("settings changepass FAILED", a);
}
), "#settings_activity_users submit" : (function (a,b)
{
  b.preventDefault();
  var c = ($("#settings_usersToHide").val() || "").split(","), d = [];
  for (i = 0;i < c.length;i++)
    this.userInfo[c[i]] && d.push({userID : this.userInfo[c[i]].UserID, flags : 1});
  GS.user.changeFollowFlags(d);
  return false;
}
), "#settings_activity_users button.showUser click" : (function (a)
{
  a = [{userID : parseInt($(a).attr("data-userID"), 10), flags : 0}];
  GS.user.changeFollowFlags(a);
}
), updateFacebookForm : (function ()
{
  $("#settings_facebook_form").html(this.view("facebook_form"));
  $("#settings_facebook_form .error").addClass("hide");
  $(window).resize();
}
), updateFacebookFormWithError : (function (a)
{
  if (typeof a == "object" && a.error)
    a = a.error;
  $("#settings_facebook_form .error").html($.localize.getString(a));
  $("#settings_facebook_form .error").removeClass("hide");
  $(window).resize();
}
), "#fbConnect-btn click" : (function ()
{
  GS.facebook.login(this.callback("updateFacebookForm"), this.callback("updateFacebookFormWithError"));
}
), "a.fb-logout click" : (function ()
{
  GS.facebook.logout(this.callback("updateFacebookForm"));
}
), "form#settings_facebook_form submit" : (function (a,b)
{
  b.preventDefault();
  var c = 0;
  $("#settings_facebook_form").find("input:checkbox").not(":checked").each((function (d,f)
{
  c |= $(f).val();
}
));
  GS.facebook.save(c);
  return false;
}
), updateGoogleForm : (function ()
{
  this.element.find("#settings_google_form").html(this.view("google_form"));
  this.element.find("#settings_google_form .error").addClass("hide");
  $(window).resize();
}
), updateGoogleFormWithError : (function (a)
{
  if (! a || ! a.error)
    a = {error : "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR"};
  this.element.find("#settings_google_form .error").html($.localize.getString(a.error)).removeClass("hide");
  $(window).resize();
}
), "#googleLogin-btn click" : (function ()
{
  GS.google.login(this.callback("updateGoogleForm"), this.callback("updateGoogleFormWithError"));
}
), "a.google-logout click" : (function ()
{
  GS.google.logout(this.callback("updateGoogleForm"));
}
), updateLastfmForm : (function ()
{
  console.log("UPDATE LASTFM FORM");
  this.element.find("#settings_lastfm_form").html(this.view("lastfm_form"));
  $(window).resize();
}
), "#lastfmConnect-btn click" : (function (a,b)
{
  b.preventDefault();
  GS.user.UserID > 0 && GS.user.IsPremium ? GS.lastfm.authorize(this.callback("updateLastfmForm")) : GS.lightbox.open("vipOnlyFeature");
  return false;
}
), "a.lastfm-logout click" : (function ()
{
  GS.lastfm.logout(this.callback("updateLastfmForm"));
}
), "#settings_userSubscriptions button.upgrade click" : (function (a,b)
{
  b.preventDefault();
  var c, d = ! this.noData && ! this.recurring ? 1 : 0;
  if (a.is(".plus"))
    {
      c = this.bVip ? "vip" : "plus";
      GS.user.isLoggedIn ? GS.lightbox.open("vipSignup", {vipPackage : c, bExtend : d}) : GS.lightbox.open("signup", {vipPackage : c, bExtend : d});
    }
  else
    if (a.is(".anywhere"))
      {
        c = this.bVip ? "vip" : "anywhere";
        GS.user.isLoggedIn ? GS.lightbox.open("vipSignup", {vipPackage : c, bExtend : d}) : GS.lightbox.open("signup", {vipPackage : c, bExtend : d});
      }
    else
      {
        c = this.bVip ? "vip" : "anywhere";
        GS.user.isLoggedIn ? GS.lightbox.open("vipSignup", {initOffers : true, vipPackage : c, bExtend : d}) : GS.lightbox.open("signup", {vipPackage : c, bExtend : d});
      }
  return false;
}
), "#settings_userSubscriptions button.extend click" : (function (a,b)
{
  b.preventDefault();
  var c;
  c = this.subscriptionType.match("Anywhere") ? "anywhere" : this.subscriptionType.match("Plus") ? "plus" : this.bVip == true || this.bVip == 1 ? "vip" : "plus";
  c === "vip" || c === "anywhere" ? GS.lightbox.open("vipSignup", {bExtend : 1, vipPackage : this.bVip ? "vip" : c}) : GS.lightbox.open("signup", {gotoUpgrade : true, bExtend : 1, vipPackage : this.bVip ? "vip" : c});
}
), "#settings_userSubscriptions button.cancel click" : (function (a,b)
{
  b.preventDefault();
  GS.lightbox.open("vipCancel");
  return false;
}
), "a.feedback click" : (function ()
{
  GS.user.IsPremium && GS.lightbox.open("feedback");
}
), "p.finePrint a.login click" : (function ()
{
  GS.lightbox.open("login");
}
), "p.finePrint a.signup click" : (function (a)
{
  if (a.parent().is(".plus"))
    GS.lightbox.open("signup", {vipPackage : this.bVip ? "vip" : "plus"});
  else
    a.parent().is(".anywhere") ? GS.lightbox.open("signup", {vipPackage : this.bVip ? "vip" : "anywhere"}) : GS.lightbox.open("signup");
}
), "#init_deactivate_account click" : (function (a,b)
{
  b.preventDefault();
  GS.lightbox.open("deactivateAccount");
}
), "#settings_desktop submit" : (function (a,b)
{
  b.preventDefault();
  var c = {onClose : $("#settings_desktop input[name=settings_desktop_onClose]:checked").val(), onMinimize : $("#settings_desktop input[name=settings_desktop_onMinimize]:checked").val(), externalControlEnabled : $("#settings_desktop_globalKeyboard").is(":checked"), notifications : {songNotifications : $("#settings_desktop_songNotifications").is(":checked"), position : parseInt($("select[name=settings_desktop_notifPosition]", a).val(), 10), duration : parseInt($("select[name=settings_desktop_notifDuration]", a).val(), 10)}};
  this.desktopPrefs = c;
  GS.airbridge.setDesktopPreferences(c);
  $("#settings_desktop .buttons .status").addClass("success");
  return false;
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.SongController", {}, {type : "song", index : (function (a,b)
{
  this.url = location.hash;
  this.token = a || "";
  this.subpage = b || "related";
  this.playSong = false;
  if (this.url === GS.loadedPage)
    {
      this.playSong = true;
      GS.loadedPage = false;
    }
  if (this.token)
    GS.Models.Song.getSongFromToken(this.token, this.callback("loadSong"));
  else
    {
      console.log("NO SONG TOKEN, not found");
      GS.router.notFound();
    }
}
), loadSong : (function (a)
{
  this.song = a;
  if (a.validate())
    {
      this.song = a;
      this.correctUrl(this.song, this.subpage === "related" ? "" : this.subpage);
      this.id = this.song.SongID;
      this.header.name = this.song.SongName;
      this.header.breadcrumbs = [{text : this.song.ArtistName, url : _.cleanUrl(this.song.ArtistID, this.song.ArtistName, "artist")}, {text : this.song.AlbumName, url : _.cleanUrl(this.song.AlbumID, this.song.AlbumName, "album")}];
      this.header.subpages = ["related", "fans"];
      this.header.options = false;
      this.list.doPlayAddSelect = true;
      this.list.doSearchInPage = true;
      this.list.sortOptions = [{text : "Track", column : "TrackNum"}, {text : "Popularity", column : "Popularity"}, {text : "Song Name", column : "Name"}, {text : "Artist Name", column : "ArtistName"}];
      this.list.useGrid = true;
      this.element.html(this.view("index"));
      $.publish("gs.page.loading.grid");
      switch (this.subpage)
      {
        case "fans":
          this.element.html(this.view("fans"));
          $.publish("gs.page.loading.grid");
          GS.Controllers.PageController.title(this.song.getTitle() + " - fans");
          this.song.fanbase.getFans(this.callback("loadGridFans"), this.callback("loadGridFans"));
          break ;
        case "related":
        default:
          this.element.html(this.view("index"));
          $.publish("gs.page.loading.grid");
          this.song.album = GS.Models.Album.getOneFromCache(this.song.AlbumID);
          this.triedUnverified = this.song.album ? this.song.album.songsLoaded && this.song.album.songsUnverifiedLoaded : false;
          GS.Controllers.PageController.title(this.song.getTitle());
          this.song.getRelatedSongs(this.callback("loadRelatedGrid"));
          this.playSong && GS.player.addSongAndPlay(this.song.SongID);
          break ;
      }
    }
  else
    GS.router.notFound();
}
), loadGridFans : (function (a)
{
  var b = store.get("gs.sort.song.fans") || {sortCol : "Username", sortDir : 1, sortStoreKey : "gs.sort.song.fans"};
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "user"}));
}
), loadRelatedGrid : (function (a)
{
  var b = this.element.find(".gs_grid").controller(), c = store.get("gs.sort.song.related") || {sortCol : "TrackNum", sortStoreKey : "gs.sort.song.related"};
  c.filters = {artistIDs : false, albumIDs : false, onlyVerified : false};
  if (b)
    {
      c = b.dataView;
      var d = b.grid;
      if (c)
        {
          c.beginUpdate();
          c.addItems(a, "SongID");
          c.endUpdate();
          c.refresh();
        }
      d && d.onSort(b.sortCol, b.sortDir);
    }
  else
    if (a.length)
      {
        if (a.length < 5 && ! this.triedUnverified)
          {
            this.triedUnverified = true;
            this.song.getRelatedSongs(this.callback("loadRelatedGrid"), null, false);
          }
        else
          if (! this.triedUnverified)
            {
              b = GS.Models.Song.getVerifiedDivider();
              c.filters.onlyVerified = 1;
              a.push(b);
            }
        this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.song, c, "song");
        setTimeout(this.callback("selectCurrentSong"), 500);
      }
    else
      if (this.triedUnverified)
        this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "song"}));
      else
        {
          this.triedUnverified = true;
          this.song.getRelatedSongs(this.callback("loadRelatedGrid"), null, false);
        }
}
), selectCurrentSong : (function ()
{
  var a = this.element.find(".gs_grid").controller();
  if (a)
    {
      var b = a.dataView.getIdxById(this.song.SongID), c = a.grid.getSelectedRows();
      c.push(b);
      a.selectedRowIDs.push(this.song.SongID);
      a.grid.setSelectedRows(c);
      a.grid.onSelectedRowsChanged();
    }
}
), ".slick-row.verifiedDivider click" : (function (a,b)
{
  b.stopPropagation();
  var c = c = $("#grid").controller(), d;
  if (c)
    {
      if (! this.triedUnverified)
        {
          this.triedUnverified = true;
          this.song.getRelatedSongs(this.callback("loadRelatedGrid"), null, false);
        }
      if (c.filter.onlyVerified)
        {
          a.find(".showMore").addClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_LESS").html($.localize.getString("USER_ACTIVITY_SHOW_LESS"));
          c.filter.onlyVerified = false;
        }
      else
        {
          a.find(".showMore").removeClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_MORE").html($.localize.getString("USER_ACTIVITY_SHOW_MORE"));
          c.filter.onlyVerified = 1;
        }
      (d = c.grid) && d.onSort(c.sortCol, c.sortDir);
    }
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.AlbumController", {}, {type : "album", index : (function (a,b)
{
  this.url = location.hash;
  this.id = parseInt(a, 10) || 0;
  this.subpage = b || "music";
  this.id < 0 ? GS.router.notFound() : GS.Models.Album.getAlbum(this.id, this.callback("loadAlbum"));
}
), loadAlbum : (function (a)
{
  this.album = a;
  this.correctUrl(this.album, this.subpage === "music" ? "" : this.subpage);
  this.header.name = this.album.AlbumName;
  this.header.breadcrumbs = [{text : this.album.ArtistName, url : _.cleanUrl(this.album.ArtistID, this.album.ArtistName, "artist")}, {text : "Albums", url : _.cleanUrl(this.album.ArtistID, this.album.ArtistName, "artist") + "/albums"}];
  this.header.imageUrl = "http://beta.grooveshark.com/static/amazonart/s" + this.album.CoverArtFileName;
  this.header.subpages = ["music", "fans"];
  this.header.options = false;
  this.list.doPlayAddSelect = true;
  this.list.doSearchInPage = true;
  this.list.useGrid = true;
  this.element.html(this.view("index"));
  $.publish("gs.page.loading.grid");
  if (this.subpage === "fans")
    {
      GS.Controllers.PageController.title(this.album.getTitle() + " - fans");
      this.album.fanbase.getFans(this.callback("loadGridFans"));
      $(".page_controls", this.element).hide();
    }
  else
    {
      this.triedUnverified = this.album.songsLoaded && this.album.songsUnverifiedLoaded;
      GS.Controllers.PageController.title(this.album.getTitle());
      this.album.getSongs(this.callback("loadGrid"), null, true);
      $(".page_controls", this.element).show();
    }
}
), loadGridFans : (function (a)
{
  var b = store.get("gs.sort.album.fans") || {sortCol : "Username", sortDir : 1, sortStoreKey : "gs.sort.albums.fans"};
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "user"}));
}
), loadGrid : (function (a)
{
  var b = this.element.find(".gs_grid").controller(), c = store.get("gs.sort.album.songs") || {sortCol : "TrackNum", sortStoreKey : "gs.sort.albums.songs"};
  c.autoHeight = true;
  c.padding = 0;
  c.filters = {artistIDs : false, albumIDs : false, onlyVerified : false};
  $("#grid").attr("data-profile-view", 1);
  console.log("farts");
  if (b)
    {
      c = b.dataView;
      var d = b.grid;
      if (c)
        {
          c.beginUpdate();
          c.addItems(a, "SongID");
          c.endUpdate();
          c.refresh();
        }
      d && d.onSort(b.sortCol, b.sortDir);
    }
  else
    if (a.length)
      {
        if (a.length < 5 && ! this.triedUnverified)
          {
            this.triedUnverified = true;
            this.album.getSongs(this.callback("loadGrid"), null, false);
          }
        else
          if (! this.triedUnverified)
            {
              b = GS.Models.Song.getVerifiedDivider();
              a.push(b);
              c.filters.onlyVerified = 1;
            }
        this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.albumSongs, c, "song");
      }
    else
      if (this.triedUnverified)
        this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "song"}));
      else
        {
          this.triedUnverified = true;
          this.album.getSongs(this.callback("loadGrid"), null, false);
        }
}
), ".slick-row.verifiedDivider click" : (function (a,b)
{
  b.stopPropagation();
  var c = c = $("#grid").controller(), d;
  if (c)
    {
      if (! this.triedUnverified)
        {
          this.triedUnverified = true;
          this.album.getSongs(this.callback("loadGrid"), null, false);
        }
      if (c.filter.onlyVerified)
        {
          a.find(".showMore").addClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_LESS").html($.localize.getString("USER_ACTIVITY_SHOW_LESS"));
          c.filter.onlyVerified = false;
        }
      else
        {
          a.find(".showMore").removeClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_MORE").html($.localize.getString("USER_ACTIVITY_SHOW_MORE"));
          c.filter.onlyVerified = 1;
        }
      (d = c.grid) && d.onSort(c.sortCol, c.sortDir);
    }
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.ArtistController", {}, {type : "artist", index : (function (a,b)
{
  this.url = location.hash;
  this.id = parseInt(a, 10) || 0;
  this.subpage = b || "music";
  this.id < 0 ? GS.router.notFound() : GS.Models.Artist.getArtist(this.id, this.callback("loadArtist"));
}
), loadArtist : (function (a)
{
  this.artist = a;
  this.element.html(this.view("index"));
  this.correctUrl(this.artist, this.subpage === "music" ? "" : this.subpage);
  switch (this.subpage)
  {
    case "fans":
      $("#albumGrid").parent().remove();
      GS.Controllers.PageController.title(this.artist.getTitle() + " - Fans");
      this.artist.fanbase.getFans(this.callback("loadGridFans"));
      break ;
    case "similar":
      $("#albumGrid").parent().remove();
      GS.Controllers.PageController.title(this.artist.getTitle() + " - Similar");
      GS.service.artistGetSimilarArtists(this.artist.ArtistID, this.callback("loadGridSimilar"), this.callback("loadGridSimilarFailed"));
      break ;
    case "events":
      $("#albumGrid").parent().remove();
      GS.Controllers.PageController.title(this.artist.getTitle() + " - Events");
      GS.service.artistGetSongkickEvents(this.artist.ArtistID, this.artist.ArtistName, this.callback("loadGridEvents"), this.callback("loadGridEventsFailed"));
      break ;
    default:
      this.triedUnverified = this.artist.songsLoaded && this.artist.songsUnverifiedLoaded;
      GS.Controllers.PageController.title(this.artist.getTitle());
      $.publish("gs.page.loading.grid");
      this.artist.getSongs(this.callback("loadGrid"));
  }
}
), loadGridFans : (function (a)
{
  var b = store.get("gs.sort.artist.fans") || {sortCol : "Username", sortDir : 1, sortStoreKey : "gs.sort.artist.fans"};
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "user"}));
}
), albumsSeen : {}, loadGrid : (function (a)
{
  setTimeout(this.callback((function ()
{
  var b, c = [], d = store.get("gs.sort.artist.songs") || {sortCol : "Popularity", sortDir : 0, sortStoreKey : "gs.sort.artist.songs"}, f = this.element.find(".gs_grid.songs").controller(), g = this.element.find(".gs_grid.albums").controller();
  d = $.extend(d, {filters : {artistIDs : false, albumIDs : false, onlyVerified : false}});
  if (a.length)
    {
      this.albumsSeen = {};
      for (b = 0;b < a.length;b++)
        if (! this.albumsSeen[a[b].SongID] && a[b].AlbumName && a[b].AlbumName.length)
          {
            c.push(GS.Models.Album.wrap({AlbumName : a[b].AlbumName, AlbumID : a[b].AlbumID, ArtistName : a[b].ArtistName, ArtistID : a[b].ArtistID, CoverArtFilename : a[b].CoverArtFilename, isVerified : - 1}));
            this.albumsSeen[a[b].AlbumID] = true;
          }
      b = GS.Models.Album.getFilterAll();
      c.push(b);
    }
  $("#albumFilters").resizable({handles : {e : $("#albumFilter-resize")}, minWidth : 30, maxWidth : 350, animate : false, resize : (function ()
{
  $(window).resize();
}
)});
  if (f)
    {
      c = f.dataView;
      d = f.grid;
      if (c)
        {
          c.beginUpdate();
          g.dataView.beginUpdate();
          c.addItems(a, "SongID");
          g.dataView.addItems(a, "SongID");
          c.endUpdate();
          g.dataView.endUpdate();
          c.refresh();
          g.dataView.refresh();
        }
      if (d)
        {
          d.onSort(f.sortCol, f.sortDir);
          g.grid.onSort(g.sortCol, g.sortDir);
        }
    }
  else
    if (a.length)
      {
        if (a.length < 5 && ! this.triedUnverified)
          {
            this.triedUnverified = true;
            this.artist.getSongs(this.callback("loadGrid"), null, false);
          }
        else
          if (! this.triedUnverified)
            {
              f = GS.Models.Song.getVerifiedDivider();
              d.filters.onlyVerified = 1;
              a.push(f);
            }
        this.element.find(".gs_grid.songs").gs_grid(a, GS.Controllers.GridController.columns.song, d, "song");
        this.element.find(".gs_grid.albums").gs_grid(c, GS.Controllers.GridController.columns.albumFilter, {rowHeight : 25, sortCol : "AlbumName", isFilter : true}, "album");
      }
    else
      if (this.triedUnverified)
        this.element.find(".gs_grid.songs").html(this.view("/shared/noResults", {type : "song"}));
      else
        {
          this.triedUnverified = true;
          this.artist.getSongs(this.callback("loadGrid"), null, false);
        }
}
)), 100);
}
), loadGridSimilar : (function (a)
{
  a = GS.Models.Artist.wrapMany(a.SimilarArtists);
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.artist, {}, "artist") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "artist"}));
}
), loadGridSimilarFailed : (function ()
{
  this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "artist"}));
}
), loadGridEvents : (function (a)
{
  var b = {sortCol : "StartTime", sortDir : 1, rowCssClasses : (function ()
{
  return "event";
}
)};
  a = GS.Models.Event.wrapMany(a);
  for (var c = 0;c < a.length;c++)
    {
      a[c].EventID = c;
      a[c].ArtistName = this.artist.ArtistName;
    }
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.event, b, "event") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "event"}));
}
), loadGridEventsFailed : (function ()
{
  this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "event"}));
}
), ".slick-row.verifiedDivider click" : (function (a,b)
{
  b.stopImmediatePropagation();
  var c = $("#grid").controller(), d;
  if (c)
    {
      if (! this.triedUnverified)
        {
          this.triedUnverified = true;
          this.artist.getSongs(this.callback("loadGrid"), null, false);
        }
      if (c.filter.onlyVerified)
        {
          a.find(".showMore").addClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_LESS").html($.localize.getString("USER_ACTIVITY_SHOW_LESS"));
          c.filter.onlyVerified = false;
        }
      else
        {
          a.find(".showMore").removeClass("showingMore").attr("data-translate-text", "USER_ACTIVITY_SHOW_MORE").html($.localize.getString("USER_ACTIVITY_SHOW_MORE"));
          c.filter.onlyVerified = 1;
        }
      (d = c.grid) && d.onSort(c.sortCol, c.sortDir);
    }
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.UserController", {}, {index : (function (a,b)
{
  this.UserName = a.replace(/[_\+]/, " ");
  this.UserID = parseInt(b, 10);
  if (GS.user.UserID == this.UserID)
    this.loadMyProfile();
  else
    isNaN(this.UserID) ? GS.Models.User.getUserByUsername(this.UserName, this.callback("redirectUser")) : GS.Models.User.getUser(this.UserID, this.callback("loadProfile"));
  this.subscribe("gs.auth.user.update", this.callback("userUpdated"));
  this.subscribe("gs.auth.favorite.user", this.callback("userUpdated"));
  this.subscribe("gs.auth.favorites.users.update", this.callback("userFavoritesUpdated"));
}
), userChangeTimeout : false, userChangeWaitDuration : 100, userFavoritesUpdated : (function ()
{
  clearTimeout(this.userChangeTimeout);
  this.userChangeTimeout = setTimeout(this.callback((function ()
{
  if (this.user)
    {
      var a = GS.user.favorites.users[this.user.UserID];
      if (a)
        {
          console.error("update profile");
          GS.user.UserID == this.UserID ? this.loadMyProfile() : this.loadProfile(a);
        }
    }
}
)), this.userChangeWaitDuration);
}
), userUpdated : (function (a)
{
  clearTimeout(this.userChangeTimeout);
  this.userChangeTimeout = setTimeout(this.callback((function ()
{
  if (this.user && this.user.UserID === a.UserID)
    GS.user.UserID == this.UserID ? this.loadMyProfile() : this.loadProfile(a);
}
)), this.userChangeWaitDuration);
}
), loadMyProfile : (function ()
{
  this.user = GS.user;
  this.subpage = "";
  this.correctUrl(this.user, "");
  GS.Controllers.PageController.title(this.user.getTitle());
  this.element.html(this.view("profile"));
  $.publish("gs.page.loading.grid");
  this.user.getProfileFeed(this.callback("loadGridProfileFeed", this.user));
  this.user.getPlaylists(this.callback("loadProfilePlaylists", this.user));
  this.user.getFavoritesByType("Users", this.callback("loadProfileCommunity", this.user));
}
), loadProfile : (function (a)
{
  this.user = a;
  this.subpage = "";
  this.correctUrl(this.user, "");
  GS.Controllers.PageController.title(this.user.getTitle());
  this.element.html(this.view("profile"));
  $.publish("gs.page.loading.grid");
  this.user.getProfileFeed(this.callback("loadGridProfileFeed", this.user));
  this.user.getPlaylists(this.callback("loadProfilePlaylists", this.user));
  this.user.getFavoritesByType("Users", this.callback("loadProfileCommunity", this.user));
}
), loadProfileCommunity : (function (a)
{
  this.user = a;
  this.following = this.user.favorites.users;
  $("#profile_community").html(this.view("profile_community"));
}
), loadProfilePlaylists : (function (a)
{
  this.user = a;
  this.topPlaylists = _.toArray(this.user.playlists).sort((function (b,c)
{
  return c.TSAdded > b.TSAdded;
}
));
  $("#profile_playlists").html(this.view("profile_playlists"));
}
), loadGridProfileFeed : (function (a)
{
  this.user = a;
  if (! this.user.profileFeed.isLoaded)
    return false;
  this.activity = this.user.profileFeed.events;
  this.myCommunity = this.noFriends = false;
  this.activity.length ? this.element.find(".gs_grid").html(this.view("activity")) : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "activity"}));
  this.element.find(".event").each(this.callback((function (b,c)
{
  $(c).data("event", this.activity[b]);
  this.activity[b].dataString.hookup($(c).find("p.what"));
}
)));
  $(window).resize();
}
), music : (function (a,b,c)
{
  this.UserName = a;
  this.UserID = parseInt(b, 10);
  this.subpage = c || "music";
  this.fromSidebar = GS.page.isFromSidebar();
  if (GS.user.UserID == this.UserID)
    {
      this.user = GS.user;
      if (this.subpage === "favorites")
        {
          GS.Controllers.PageController.title(GS.user.getTitle() + " - Favorites");
          this.subscribe("gs.auth.favorites.songs.add", this.callback("addToGrid"));
          this.subscribe("gs.auth.favorites.songs.remove", this.callback("removeFromGrid"));
          this.subscribe("gs.auth.favorites.songs.update", this.callback("loadMySongFavorites"));
          this.loadMySongFavorites();
        }
      else
        {
          GS.Controllers.PageController.title(GS.user.getTitle() + " - Music");
          this.subscribe("gs.auth.library.add", this.callback("addToGrid"));
          this.subscribe("gs.auth.library.remove", this.callback("removeFromGrid"));
          this.subscribe("gs.auth.library.update", this.callback("loadGridMusic"));
          this.loadMyMusic();
        }
      this.element.find("#page_header button.opts").show();
    }
  else
    isNaN(this.UserID) ? GS.Models.User.getUserByUsername(this.UserName, this.callback("redirectUser")) : GS.Models.User.getUser(this.UserID, this.callback("loadMusic"));
}
), redirectUser : (function (a)
{
  this.user = a;
  location.hash = this.user.toUrl();
  return false;
}
), loadMyMusic : (function ()
{
  if ($("#page").is(".gs_page_user"))
    {
      this.user = GS.user;
      this.UserName = this.user.Username;
      this.UserID = this.user.UserID;
      this.correctUrl(this.user, this.subpage);
      this.element.html(this.view("music"));
      var a = [];
      for (b in GS.user.library.songs)
        GS.user.library.songs.hasOwnProperty(b) && a.push(GS.user.library.songs[b]);
      this.loadGridMusic(a, true);
    }
}
), addToGrid : (function (a)
{
  a.isDeleted = false;
  var b = this.element.find(".gs_grid.songs").controller(), c = this.element.find(".gs_grid.artists").controller(), d = this.element.find(".gs_grid.albums").controller(), f = b.grid, g = b.dataView;
  if (g)
    {
      g.beginUpdate();
      g.addItem(a);
      g.endUpdate();
    }
  f && f.onSort(b.sortCol, b.sortDir);
  if (! this.albumsSeen[a.AlbumID] && a.AlbumName && a.AlbumName.length)
    {
      d.dataView.beginUpdate();
      d.dataView.addItem(GS.Models.Album.wrap({AlbumName : a.AlbumName, AlbumID : a.AlbumID, ArtistName : a.ArtistName, ArtistID : a.ArtistID, isVerified : - 1}));
      d.dataView.endUpdate();
      this.albumsSeen[a.AlbumID] = true;
      d.grid && d.grid.onSort(d.sortCol, d.sortDir);
    }
  if (! this.artistsSeen[a.ArtistID] && a.ArtistName && a.ArtistName.length)
    {
      c.dataView.beginUpdate();
      c.dataView.addItem(GS.Models.Artist.wrap({ArtistName : a.ArtistName, ArtistID : a.ArtistID, CoverArtFilename : a.CoverArtFilename, isVerified : - 1}));
      c.dataView.endUpdate();
      this.artistsSeen[a.ArtistID] = true;
      c.grid && c.grid.onSort(c.sortCol, c.sortDir);
    }
}
), removeFromGrid : (function (a)
{
  a.isDeleted = true;
  var b = this.element.find(".gs_grid.songs").controller(), c = b.grid, d = b.dataView;
  if (d)
    {
      d.beginUpdate();
      d.updateItem(a.SongID, a);
      d.endUpdate();
    }
  c && c.onSort(b.sortCol, b.sortDir);
}
), loadMySongFavorites : (function ()
{
  if ($("#page").is(".gs_page_user"))
    {
      this.user = GS.user;
      this.UserName = this.user.Username;
      this.UserID = this.user.UserID;
      this.correctUrl(this.user, "music/" + this.subpage);
      this.element.html(this.view("music"));
      var a = [];
      for (b in GS.user.favorites.songs)
        GS.user.favorites.songs.hasOwnProperty(b) && a.push(GS.user.favorites.songs[b]);
      this.loadGridMusic(a);
    }
}
), loadMusic : (function (a)
{
  this.user = a;
  this.UserName = this.user.Username;
  this.UserID = this.user.UserID;
  this.fromSidebar = false;
  this.element.html(this.view("music"));
  if (this.subpage === "favorites")
    {
      this.correctUrl(this.user, "music/" + this.subpage);
      GS.Controllers.PageController.title(this.user.getTitle() + " - Favorites");
      this.user.getFavoritesByType("Songs", this.callback("loadGridSongFavorites", true));
    }
  else
    {
      this.correctUrl(this.user, this.subpage);
      GS.Controllers.PageController.title(this.user.getTitle() + " - Music");
      this.user.library.getSongs(this.callback("loadGridMusic"));
      this.user.getFavoritesByType("Songs", this.callback("loadGridSongFavorites", false));
    }
}
), loadGridSongFavorites : (function (a)
{
  var b = [];
  for (c in this.user.favorites.songs)
    this.user.favorites.songs.hasOwnProperty(c) && b.push(this.user.favorites.songs[c]);
  this.loadGridMusic(b, a);
}
), albumsSeen : {}, artistsSeen : {}, loadGridMusic : (function (a,b)
{
  setTimeout(this.callback((function ()
{
  var c, d, f = [], g = [], h;
  d = store.get("gs.sort.user.music") || {sortCol : "TSAdded", sortDir : 0, sortStoreKey : "gs.sort.user.music"};
  h = this.element.find(".gs_grid.songs").controller();
  artistController = this.element.find(".gs_grid.artists").controller();
  albumController = this.element.find(".gs_grid.albums").controller();
  b = _.orEqual(b, false);
  this.albumsSeen = {};
  this.artistsSeen = {};
  d.rowCssClasses = (function (o)
{
  return o.isDeleted ? "strikethrough" : "";
}
);
  for (c = 0;c < a.length;c++)
    {
      if (! this.albumsSeen[a[c].AlbumID] && a[c].AlbumName && a[c].AlbumName.length)
        {
          f.push(GS.Models.Album.wrap({AlbumName : a[c].AlbumName, AlbumID : a[c].AlbumID, ArtistName : a[c].ArtistName, ArtistID : a[c].ArtistID, isVerified : - 1}));
          this.albumsSeen[a[c].AlbumID] = true;
        }
      if (! this.artistsSeen[a[c].ArtistID])
        {
          g.push(GS.Models.Artist.wrap({ArtistName : a[c].ArtistName, ArtistID : a[c].ArtistID, CoverArtFilename : a[c].CoverArtFilename, isVerified : - 1}));
          this.artistsSeen[a[c].ArtistID] = true;
        }
    }
  $("#artistFilters").resizable({handles : {e : $("#artistFilter-resize")}, minWidth : 30, maxWidth : 350, animate : false, resize : (function ()
{
  $(window).resize();
}
)});
  $("#albumFilters").resizable({handles : {e : $("#albumFilter-resize")}, minWidth : 30, maxWidth : 350, animate : false, resize : (function ()
{
  $(window).resize();
}
)});
  c = GS.Models.Album.getFilterAll();
  f.push(c);
  c = GS.Models.Artist.getFilterAll();
  g.push(c);
  if (h)
    {
      d = h.dataView;
      c = h.grid;
      if (d)
        {
          d.beginUpdate();
          albumController.dataView.beginUpdate();
          artistController.dataView.beginUpdate();
          if (b)
            {
              d.setItems(a, "SongID");
              albumController.dataView.setItems(f, "AlbumID");
              artistController.dataView.setItems(g, "ArtistID");
            }
          else
            {
              d.addItems(a, "SongID");
              albumController.dataView.addItems(f, "AlbumID");
              artistController.dataView.addItems(g, "ArtistID");
            }
          d.endUpdate();
          albumController.dataView.endUpdate();
          artistController.dataView.endUpdate();
          d.refresh();
          albumController.dataView.refresh();
          artistController.dataView.refresh();
        }
      if (c)
        {
          c.onSort(h.sortCol, h.sortDir);
          albumController.grid.onSort(albumController.sortCol, albumController.sortDir);
          artistController.grid.onSort(artistController.sortCol, artistController.sortDir);
        }
    }
  else
    if (a.length)
      {
        h = GS.Controllers.GridController.columns.song.concat();
        h = [h[0], h[1], h[2]];
        this.element.find(".gs_grid.songs").gs_grid(a, h, d);
        this.element.find(".gs_grid.albums").gs_grid(f, GS.Controllers.GridController.columns.albumFilter, {rowHeight : 25, sortCol : "AlbumName", isFilter : true}, "album");
        this.element.find(".gs_grid.artists").gs_grid(g, GS.Controllers.GridController.columns.artistFilter, {rowHeight : 25, sortCol : "ArtistName", isFilter : true}, "artist");
      }
    else
      this.element.find(".grid").html(this.view("/shared/noResults", {type : "song"}));
  this.subpage !== "favorites" && ! this.user.library.songsLoaded && GS.user.UserID != this.UserID && this.user.library.getSongs(this.callback("loadGridMusic"), null, false);
}
)), 100);
}
), playlists : (function (a,b,c)
{
  this.UserName = a;
  this.UserID = b;
  this.subpage = c;
  if (c === "subscribed")
    {
      if (GS.user.UserID == this.UserID)
        {
          this.user = GS.user;
          this.loadMySubscribedPlaylists(GS.user);
        }
      else
        GS.Models.User.getUser(this.UserID, this.callback("loadSubscribedPlaylists"));
      this.subscribe("gs.auth.favorites.playlists.update", this.callback("loadGridSubscribedPlaylists"));
    }
  else
    if (GS.user.UserID == this.UserID)
      {
        this.user = GS.user;
        this.loadMyPlaylists();
        this.subscribe("gs.auth.playlists.update", this.callback("loadGridPlaylists"));
        this.subscribe("gs.auth.favorites.playlists.update", this.callback("loadGridPlaylists"));
      }
    else
      GS.Models.User.getUser(this.UserID, this.callback("loadPlaylists"));
  $(window).resize();
}
), loadMyPlaylists : (function ()
{
  if ($("#page").is(".gs_page_user"))
    {
      this.user = GS.user;
      this.correctUrl(this.user, this.subpage);
      GS.Controllers.PageController.title(this.user.getTitle() + " - Playlists");
      this.element.html(this.view("playlists"));
      this.loadGridPlaylists();
    }
}
), loadMySubscribedPlaylists : (function ()
{
  if ($("#page").is(".gs_page_user"))
    {
      this.user = GS.user;
      this.correctUrl(this.user, "playlists/" + this.subpage);
      GS.Controllers.PageController.title(this.user.getTitle() + " - Subscribed Playlists");
      this.element.html(this.view("playlists"));
      this.loadGridSubscribedPlaylists();
    }
}
), loadPlaylists : (function (a)
{
  this.user = a;
  this.correctUrl(this.user, this.subpage);
  GS.Controllers.PageController.title(this.user.getTitle() + " - Playlists");
  this.element.html(this.view("playlists"));
  this.user.getPlaylists(this.callback("loadGridPlaylists"));
}
), loadSubscribedPlaylists : (function (a)
{
  this.user = a;
  this.correctUrl(this.user, "playlists/" + this.subpage);
  GS.Controllers.PageController.title(this.user.getTitle() + " - Subscribed Playlists");
  this.element.html(this.view("playlists"));
  this.user.getFavoritesByType("Playlists", this.callback("loadGridSubscribedPlaylists"));
}
), loadGridPlaylists : (function ()
{
  if (this.user)
    if (this.subpage !== "subscribed")
      {
        var a = _.toArray(this.user.playlists), b, c;
        b = store.get("gs.sort.user.playlists") || {sortCol : "TSAdded", sortDir : 0, sortStoreKey : "gs.sort.user.playlists"};
        var d = this.element.find(".gs_grid.playlists").controller();
        if (d)
          {
            b = d.dataView;
            c = d.grid;
            if (b)
              {
                b.beginUpdate();
                b.setItems(a, "PlaylistID");
                b.endUpdate();
                b.refresh();
              }
            c && c.onSort(d.sortCol, d.sortDir);
          }
        else
          a.length ? this.element.find(".gs_grid.playlists").gs_grid(a, GS.Controllers.GridController.columns.playlist, b, "playlist") : this.element.find(".gs_grid.playlists").html(this.view("/shared/noResults", {type : "playlist"}));
      }
}
), loadGridSubscribedPlaylists : (function ()
{
  if (this.user)
    if (! (! this.user || this.subpage !== "subscribed"))
      {
        var a = _.toArray(this.user.favorites.playlists), b, c;
        b = store.get("gs.sort.user.subscribed") || {sortCol : "TSFavorited", sortDir : 0, sortStoreKey : "gs.sort.user.subscribed"};
        var d = this.element.find(".gs_grid").controller();
        if (b.sortCol == "TSAdded")
          {
            b.sortCol = "TSFavorited";
            store.remove("gs.sort.user.subscribed");
          }
        if (d)
          {
            b = d.dataView;
            c = d.grid;
            if (b)
              {
                b.beginUpdate();
                b.setItems(a, "PlaylistID");
                b.endUpdate();
                b.refresh();
              }
            c && c.onSort(d.sortCol, d.sortDir);
          }
        else
          a.length ? this.element.find(".gs_grid.playlists").gs_grid(a, GS.Controllers.GridController.columns.playlist, b, "playlist") : this.element.find(".gs_grid.playlists").html(this.view("/shared/noResults", {type : "playlist"}));
      }
}
), community : (function (a,b,c)
{
  this.UserName = a;
  this.UserID = b;
  this.subpage = c;
  this.myCommunity = false;
  if (c == "following")
    GS.user.UserID == this.UserID ? this.loadFollowing(GS.user) : GS.Models.User.getUser(this.UserID, this.callback("loadFollowing"));
  else
    if (c == "fans")
      GS.user.UserID == this.UserID ? this.loadFans(GS.user) : GS.Models.User.getUser(this.UserID, this.callback("loadFans"));
    else
      if (c == "recent")
        GS.user.UserID == this.UserID ? this.loadRecentActiveFeed(GS.user) : GS.Models.User.getUser(this.UserID, this.callback("loadRecentActiveFeed"));
      else
        if (GS.user.UserID == this.UserID)
          {
            this.loadCommunity(GS.user);
            this.myCommunity = true;
          }
        else
          GS.Models.User.getUser(this.UserID, this.callback("loadCommunity"));
}
), loadCommunity : (function (a)
{
  this.user = a;
  GS.Controllers.PageController.title(this.user.getTitle() + " - Community");
  this.element.html(this.view("community"));
  $.publish("gs.page.loading.grid");
  _.isEmpty(a.favorites.users) && this.user.UserID > 0 ? this.user.getFavoritesByType("Users", this.callback("loadCommunityFeed")) : this.loadCommunityFeed();
}
), loadCommunityFeed : (function ()
{
  this.users = this.user.favorites.users;
  this.user.getCommunityFeed(this.callback("loadGridCommunityFeed"));
}
), loadGridCommunityFeed : (function ()
{
  if (! this.user.communityFeed.isLoaded)
    return false;
  this.activity = this.user.communityFeed.events;
  this.noFriends = this.user.communityFeed.fromRecent;
  if (this.user === GS.user)
    {
      this.myCommunity = true;
      if (this.user.communityFeed.events.length)
        this.user.lastSeenFeedEvent = this.user.communityFeed.events[0].time;
      this.user.countUnseenFeeds();
    }
  this.activity.length ? this.element.find(".gs_grid").html(this.view("activity")) : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "activity"}));
  this.element.find(".event").each(this.callback((function (a,b)
{
  $(b).data("event", this.activity[a]);
  this.activity[a].dataString.hookup($(b).find("p.what"));
}
)));
  $(window).resize();
}
), loadRecentActiveFeed : (function (a)
{
  this.user = a;
  GS.Controllers.PageController.title(this.user.getTitle() + " - Recent Activity");
  this.element.html(this.view("community"));
  $.publish("gs.page.loading.grid");
  this.user.getRecentlyActiveUsersFeed(this.callback("loadGridRecentActiveFeed"));
}
), loadGridRecentActiveFeed : (function ()
{
  this.activity = this.user.recentActiveUsersFeed.events;
  this.noFriends = false;
  this.activity.length ? this.element.find(".gs_grid").html(this.view("activity")) : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "activity"}));
  this.element.find(".event").each(this.callback((function (a,b)
{
  $(b).data("event", this.activity[a]);
  this.activity[a].dataString.hookup($(b).find("p.what"));
}
)));
  $(window).resize();
}
), loadFollowing : (function (a)
{
  this.user = a;
  GS.Controllers.PageController.title(this.user.getTitle() + " - Following");
  this.element.html(this.view("community"));
  this.user.getFavoritesByType("Users", this.callback("loadGridFans"));
}
), loadFans : (function (a)
{
  this.user = a;
  GS.Controllers.PageController.title(this.user.getTitle() + " - Fans");
  this.element.html(this.view("community"));
  this.user.fanbase.getFans(this.callback("loadGridCommunity"));
}
), loadGridCommunity : (function (a)
{
  var b, c;
  b = store.get("gs.sort.user.community") || {sortCol : "Username", sortDir : 1, sortStoreKey : "gs.sort.user.community"};
  var d = this.element.find(".gs_grid").controller();
  if (d)
    {
      b = d.dataView;
      c = d.grid;
      if (b)
        {
          b.beginUpdate();
          b.addItems(a, "UserID");
          b.endUpdate();
        }
      c && c.onSort(d.sortCol, d.sortDir);
    }
  else
    a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "activity"}));
  this.user.fanbase.fansLoaded || this.user.fanbase.getFans(this.callback("loadGridCommunity"));
}
), loadGridFans : (function ()
{
  var a = _.toArray(this.user.favorites.users), b = store.get("gs.sort.user.fans") || {sortCol : "Username", sortDir : 1, sortStoreKey : "gs.sort.user.fans"};
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "user"}));
}
), "#feed li.event .hideUser click" : (function (a)
{
  a = parseInt($(a).attr("rel"), 10);
  this.find("#feed li.user" + a).remove();
  GS.user.changeFollowFlags([{userID : a, flags : 1}]);
}
), "button.invite click" : (function ()
{
  this.UserID == GS.user.UserID && GS.user.UserID > 0 && GS.lightbox.open("invite");
}
), "#feed button.follow click" : (function (a)
{
  var b = parseInt($(a).attr("data-follow-userID"), 10), c = "";
  if (a.is(".add"))
    {
      GS.user.addToUserFavorites(b);
      a.removeClass("add").addClass("remove");
      c = "UNFOLLOW";
    }
  else
    {
      GS.user.removeFromUserFavorites(b);
      a.removeClass("remove").addClass("add");
      c = "FOLLOW";
    }
  a.find("span").attr("data-translate-text", c).text($.localize.getString(c));
}
), "#page_header button.follow click" : (function (a)
{
  var b = parseInt($(a).attr("data-follow-userID"), 10), c = "";
  if (a.is(".add"))
    {
      GS.user.addToUserFavorites(b);
      a.removeClass("add").addClass("remove");
      c = "UNFOLLOW";
    }
  else
    {
      GS.user.removeFromUserFavorites(b);
      a.removeClass("remove").addClass("add");
      c = "FOLLOW";
    }
  a.find("span").attr("data-translate-text", c).text($.localize.getString(c));
}
), "#page_header a[name=delete] click" : (function ()
{
  console.log("user.button.delete click");
  var a = $("#grid").controller();
  if (a)
    {
      var b, c = a.grid.getSelectedRows();
      if (c.length !== 0)
        {
          for (var d = 0;d < c.length;d++)
            {
              $("#grid").find(".slick-row[row=" + c[d] + "]").addClass("strikethrough");
              if (b = a.dataView.rows[c[d]])
                this.subpage === "favorites" ? GS.user.removeFromSongFavorites(b.SongID) : GS.user.removeFromLibrary(b.SongID);
            }
          a.grid.setSelectedRows([]);
          a.selectedRowIDs = [];
          $.publish("gs.grid.selectedRows", {len : 0});
        }
    }
}
), "#page_header button.newPlaylist click" : (function ()
{
  GS.lightbox.open("newPlaylist");
}
), ".slick-row .playlist .subscribe click" : (function (a,b)
{
  console.log("playlist subscribe option click", a, b);
  var c = a.attr("rel");
  c = GS.Models.Playlist.getOneFromCache(c);
  if (a.is(".subscribed"))
    {
      c.unsubscribe();
      a.removeClass("subscribed").find("a.subscribe span").text("Subscribe");
    }
  else
    {
      c.subscribe();
      a.addClass("subscribed").find("a.subscribe span").text("Unsubscribe");
    }
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.PlaylistController", {}, {type : "playlist", index : (function (a,b)
{
  this.url = location.hash;
  this.id = parseInt(a, 10) || 0;
  this.subpage = b || "music";
  this.subscribe("gs.playlist.view.update", this.callback("onPlaylistUpdate"));
  GS.Models.Playlist.getPlaylist(this.id, this.callback("loadPlaylist"));
}
), loadPlaylist : (function (a)
{
  this.playlist = a;
  this.fromSidebar = GS.page.isFromSidebar();
  this.correctUrl(this.playlist, this.subpage === "music" ? "" : this.subpage);
  this.header.name = this.playlist.PlaylistName;
  this.header.breadcrumbs = [{text : this.playlist.Username, url : _.cleanUrl(this.playlist.UserID, this.playlist.Username, "user")}, {text : "Playlists", url : _.cleanUrl(this.playlist.UserID, this.playlist.Username, "user", null, "playlists")}];
  this.header.subpages = ["music", "fans"];
  this.header.options = false;
  this.list.doPlayAddSelect = true;
  this.list.doSearchInPage = true;
  this.list.sortOptions = [{text : "Popularity", column : "Popularity"}, {text : "Song Name", column : "Name"}, {text : "Favorite", column : "Favorite"}, {text : "Artist Name", column : "ArtistName"}, {text : "Album Name", column : "AlbumName"}];
  this.list.useGrid = true;
  this.element.html(this.view("index"));
  switch (this.subpage)
  {
    case "fans":
      GS.Controllers.PageController.title(this.playlist.getTitle() + " - fans");
      this.playlist.fanbase.getFans(this.callback("loadGridFans"));
      $(".page_controls", this.element).hide();
      break ;
    default:
      $("#page_header button.share").parent().show();
      GS.Controllers.PageController.title(this.playlist.getTitle());
      this.playlist.getSongs(this.callback("loadGrid"));
      this.updatePlaylistProps(this.playlist);
      $(".page_controls", this.element).show();
      break ;
  }
  GS.Controllers.PageController.confirmMessage = $.localize.getString("ONCLOSE_SAVE_PLAYLIST");
}
), updatePlaylistProps : (function (a)
{
  if (! (! this.playlist || this.playlist.PlaylistID !== a.PlaylistID))
    {
      if (this.playlist.hasUnsavedChanges)
        {
          $("button.save", this.element).show();
          $("button.undo", this.element).show();
        }
      else
        {
          $("button.save", this.element).hide();
          $("button.undo", this.element).hide();
        }
      if (this.playlist.isDeleted)
        {
          $("h3.name", this.element).addClass("strikethrough");
          $("#page_header a[name=delete]").parent().css("display", "none !important");
          $("#page_header a[name=restore]").parent().css("display", "block !important");
        }
      else
        {
          $("h3.name", this.element).removeClass("strikethrough");
          $("#page_header a[name=delete]").parent().css("display", "block !important");
          $("#page_header a[name=restore]").parent().css("display", "none !important");
        }
      if (GS.user.UserID !== this.playlist.UserID)
        if (this.playlist.isFavorite)
          {
            $("#page_header button.unsubscribe").show();
            $("#page_header button.subscribe").hide();
          }
        else
          {
            $("#page_header button.subscribe").show();
            $("#page_header button.unsubscribe").hide();
          }
      if (this.playlist.isShortcut())
        {
          $("#page_header a[name=shortcut]").parent().hide();
          $("#page_header a[name=removeshortcut]").parent().show();
        }
      else
        {
          $("#page_header a[name=shortcut]").parent().show();
          $("#page_header a[name=removeshortcut]").parent().hide();
        }
    }
}
), onPlaylistUpdate : (function (a)
{
  if (! (! this.playlist || this.playlist.PlaylistID !== a.PlaylistID))
    {
      console.log("gs.playlist.view.update", a, this.playlist);
      this.updatePlaylistProps(a);
      this.subpage != "fans" && this.playlist.getSongs(this.callback("loadGrid"));
    }
}
), loadGrid : (function (a)
{
  var b = {sortCol : "Sort", sortDir : 1, sortStoreKey : "gs.sort.playlist.songs"}, c = this.element.find(".gs_grid").controller();
  if (c)
    {
      a = c.dataView;
      b = c.grid;
      if (a)
        {
          var d, f, g, h, o = this.playlist.songs.concat();
          inGrid = a.getItems().concat();
          a.beginUpdate();
          for (g = 0;g < inGrid.length;g++)
            {
              d = inGrid[g];
              h = o.indexOf(d);
              h != - 1 && o.splice(h, 1);
              a.getIdxById(d.GridKey);
              f = this.playlist.songs.indexOf(d);
              f == - 1 ? a.deleteItem(d.GridKey) : a.updateItem(d.GridKey, d);
            }
          o.length && a.addItems(o, "GridKey");
          a.endUpdate();
          a.refresh();
        }
      b && b.onSort(c.sortCol, c.sortDir);
    }
  else
    {
      if (GS.user.UserID === this.playlist.UserID)
        {
          b.allowDragSort = true;
          b.allowDuplicates = true;
          b.playlistID = this.playlist.PlaylistID;
        }
      if (a.length)
        {
          b.rowCssClasses = (function (q)
{
  return q.isDeleted ? "strikethrough" : "";
}
);
          $(".grid").unbind("dropend");
          this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.song, b, "song", "GridKey");
        }
      else
        {
          this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "song"}));
          var p = this;
          $(".grid").bind("dropend", (function (q,t)
{
  if ($("#grid").controller())
    return false;
  var A = [];
  if (typeof t.draggedItems[0].SongID !== "undefined")
    for (g = 0;g < t.draggedItems.length;g++)
      A.push(t.draggedItems[g].SongID);
  else
    if (typeof t.draggedItems[0].PlaylistID !== "undefined")
      for (g = 0;g < t.draggedItems.length;g++)
        t.draggedItems[g].getSongs((function (B)
{
  for (h = 0;h < B.length;h++)
    A.push(B[h].SongID);
}
), null, false, {async : false});
  A.length && p.playlist.addSongs(A);
}
));
        }
      $(window).resize();
    }
}
), loadGridFans : (function (a)
{
  var b = store.get("gs.sort.playlist.fans") || {sortCol : "Username", sortDir : 1, sortStoreKey : "gs.sort.playlist.fans"};
  a.length ? this.element.find(".gs_grid").gs_grid(a, GS.Controllers.GridController.columns.user, b, "user") : this.element.find(".gs_grid").html(this.view("/shared/noResults", {type : "user"}));
}
), getSongsIDsFromSelectedGridRows : (function ()
{
  var a = this.element.find(".gs_grid:last").controller(), b = [], c;
  if (a && a.selectedRowIDs.length > 0)
    for (c = 0;c < a.selectedRowIDs.length;c++)
      {
        var d = this.playlist.gridKeyLookup[a.selectedRowIDs[c]];
        d && b.push(d.SongID);
      }
  else
    for (c = 0;c < a.dataView.rows.length;c++)
      b.push(a.dataView.rows[c].SongID);
  return b;
}
), "#page_header a[name=rename] click" : (function ()
{
  console.log("playlist.rename click", this.playlist.PlaylistID);
  GS.lightbox.open("renamePlaylist", this.playlist.PlaylistID);
}
), "#page_header a[name=delete] click" : (function ()
{
  console.log("playlist.delete click", this.playlist.PlaylistID);
  GS.lightbox.open("deletePlaylist", this.playlist.PlaylistID);
}
), "#page_header a[name=restore] click" : (function ()
{
  console.log("playlist.restore click", this.playlist.PlaylistID);
  this.playlist.restore();
}
), "#page_header a[name=shortcut] click" : (function ()
{
  console.log("playlist.shorcut add click", this.playlist.PlaylistID);
  this.playlist.addShortcut();
  $("#page_header a[name=shortcut]").parent().hide();
  $("#page_header a[name=removeshortcut]").parent().show();
}
), "#page_header a[name=removeshortcut] click" : (function ()
{
  console.log("playlist.shortcut remove click", this.playlist.PlaylistID);
  this.playlist.removeShortcut();
  $("#page_header a[name=shortcut]").parent().show();
  $("#page_header a[name=removeshortcut]").parent().hide();
}
), "#page_header button.deleteSongs click" : (function ()
{
  console.log("plist.controls.deleteSongs click");
  var a = this.element.find(".gs_grid:last").controller(), b = [], c;
  if (a && a.selectedRowIDs.length > 0)
    for (c = 0;c < a.selectedRowIDs.length;c++)
      {
        var d = this.playlist.gridKeyLookup[a.selectedRowIDs[c]];
        d && b.push(this.playlist.songs.indexOf(d));
      }
  b.length && this.playlist.removeSongs(b);
}
), "#page_header button.save click" : (function ()
{
  console.log("playlist.save.button click");
  this.playlist.save();
}
), "#page_header button.undo click" : (function ()
{
  console.log("playlist.undo.button click");
  this.playlist.undo();
}
), "#page_header button.subscribe click" : (function ()
{
  console.log("playlist.subscribe.button click");
  this.playlist.subscribe();
  $("#page_header button.subscribe").hide();
  $("#page_header button.unsubscribe").show();
}
), "#page_header button.unsubscribe click" : (function ()
{
  console.log("playlist.unsubscribe.button click");
  this.playlist.unsubscribe();
  $("#page_header button.subscribe").show();
  $("#page_header button.unsubscribe").hide();
}
)});
  GS.Controllers.PageController.extend("GS.Controllers.Page.SearchController", {cache : {}}, {defaultType : "song", validTypes : {song : true, playlist : true, user : true, event : true, album : true, artist : true}, query : "", type : "", index : (function (a,b)
{
  this.query = _.orEqual(b, "");
  this.query = this.query.replace(/\+/g, " ");
  this.cleanQuery = _.cleanText(this.query);
  if ((this.type = _.orEqual(a, "")) && ! this.validTypes[this.type])
    this.type = this.defaultType;
  GS.search.lastSearch = GS.search.search;
  GS.search.lastType = GS.search.type;
  GS.search.search = this.query;
  GS.search.type = this.type;
  GS.guts.logEvent("search", {type : this.type || "everything", searchString : this.query});
  GS.guts.beginContext({mostRecentSearch : this.query});
  this.type ? GS.Controllers.PageController.title("All " + _.ucwords(this.type) + " Results: " + this.query) : GS.Controllers.PageController.title("Search: " + this.query);
  this.element.html(this.view("index"));
  $("input[name=q]", this.element).val(this.query);
  if (this.query === "")
    {
      this.element.find(".gs_grid." + a).html(this.view("/shared/noResults", {type : this.type}));
      $(".gs_grid input[name=q]", this.element).val(this.query);
    }
  else
    {
      $("#page_search a.remove").removeClass("hide");
      $.publish("gs.page.loading.grid");
      if (this.type)
        this.getResults();
      else
        {
          var c = ["Artists", "Playlists", "Users", "Albums"];
          this.getResults(false, "song", this.callback((function ()
{
  this.getResults(this.callback((function (d)
{
  if ($("#page_content").is(".profile"))
    {
      if (d.Artist)
        {
          this.artists = d.Artist.splice(0, 4);
          $("#searchArtists").html(this.view("topArtists"));
        }
      if (d.Playlist)
        {
          this.playlists = d.Playlist.splice(0, 4);
          $("#searchPlaylists").html(this.view("topPlaylists"));
        }
      if (d.User)
        {
          this.users = d.User.splice(0, 4);
          $("#searchUsers").html(this.view("topUsers"));
        }
      if (d.Album)
        {
          this.albums = d.Album.splice(0, 4);
          $("#searchAlbums").html(this.view("topAlbums"));
        }
    }
}
)), c, this.callback((function ()
{
  GS.user.IsPremium || (Math.random() > 0.5 ? $("#searchCapital").html("<iframe id=\"searchCapitalFrame\" name=\"searchCapitalFrame\" height=\"200\" width=\"200\" frameborder=\"0\" src=\"/afsSearchAds.php?q=" + this.query + " music&t=" + (this.type || "song") + "\"></iframe>") : $("#searchCapital").html("<iframe id=\"searchCapitalFrame\" name=\"searchCapitalFrame\" height=\"200\" width=\"200\" frameborder=\"0\" src=\"/afcSearchAds.php?q=" + this.query + " music&t=" + (this.type || "song") + "\"></iframe>"));
}
)));
}
)));
        }
      $(window).resize();
    }
}
), getResults : (function (a,b,c)
{
  var d = this.type;
  cacheKey = "";
  serviceCallback = this.callback((function (f,g)
{
  if (f === this.query)
    {
      var h, o, p, q = {sortCol : "Score", sortDir : 0};
      GS.Controllers.Page.SearchController.cache[cacheKey] = g;
      if ($.isArray(g.result))
        {
          d = d.substring(0, d.length - 1);
          p = GS.Models[(_.ucwords(d))].wrapManySearchResults(g.result);
        }
      else
        {
          p = {};
          _.forEach(g.result, (function (A,B)
{
  var s = B.substring(0, B.length - 1);
  p[s] = GS.Models[s].wrapManySearchResults(A);
}
));
        }
      if (p && p.length)
        {
          d = d.toLowerCase();
          if (d === "song")
            {
              o = GS.Controllers.GridController.columns.song.concat();
              h = [o[0], o[1], o[2]];
              this.type || (p = p.splice(0, 50));
            }
          else
            {
              h = GS.Controllers.GridController.columns[d];
              if (d === "event")
                {
                  q = {sortCol : "StartTime", sortDir : 1, rowCssClasses : (function ()
{
  return "event";
}
)};
                  for (var t = 0;t < p.length;t++)
                    {
                      p[t].EventID = t;
                      p[t].StartTime = new Date(p[t].StartTime * 1000).format("Y-m-d G:i:s");
                      p[t].ArtistName = p[t].ArtistName || p[t].Artists;
                    }
                }
            }
          if ($.isFunction(a))
            a(p);
          else
            {
              if (! this.type)
                {
                  q.autoHeight = true;
                  q.padding = 0;
                  $("#grid").attr("data-profile-view", 1).width($("#page").innerWidth() - $("#search_side_pane").width() - 30).height(25 * p.length + q.padding * 2);
                  if (this.element.width() < 800)
                    h = [o[0], o[1]];
                }
              this.element.find(".gs_grid." + d).gs_grid(p, h, q, d);
            }
        }
      else
        if ($.isFunction(a))
          a(p);
        else
          {
            this.element.find(".gs_grid." + d.toLowerCase()).html(this.view("/shared/noResults", {type : d.toLowerCase()}));
            $(".gs_grid input[name=q]", this.element).val(this.query);
          }
      $.isFunction(c) && c();
    }
}
));
  d = _.orEqual(b, d);
  d = $.isArray(d) ? d : _.ucwords(d) + "s";
  cacheKey = d + ":" + this.query;
  GS.Controllers.Page.SearchController.cache[cacheKey] ? serviceCallback(this.query, GS.Controllers.Page.SearchController.cache[cacheKey]) : GS.service.getSearchResultsEx(this.query, d, this.callback(serviceCallback, this.query));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.LightboxController", {onElement : "#lightbox_wrapper"}, {priorities : {sessionBad : 12, SESSION_BAD : 12, maintenance : 11, DOWN_FOR_MAINTENANCE : 11, invalidClient : 10, INVALID_CLIENT : 10, badHost : 8, BAD_HOST : 8, interactionTime : 7, INTERACTION_TIMER : 7, vipRequiredLogin : 5, VIP_REQUIRED_LOGIN : 5, vipOnlyFeature : 3, VIP_ONLY_FEATURE : 3, signup : 2, SIGNUP : 2, vipSignup : 1, VIP_SIGNUP : 1}, notCloseable : ["maintenance", "invalidClient", "sessionBad", "badHost", "swfTimeout"], queue : [], queuedOptions : {}, curType : null, isOpen : false, priority : 0, init : (function ()
{
  $.subscribe("window.resize", this.callback(this.positionLightbox));
}
), positionLightbox : (function ()
{
  if (this.isOpen)
    {
      this.curType !== "signup" && $("#lightbox_content").css("height", "auto");
      var a = Math.max($("#lightbox_wrapper").width(), 400), b = Math.min(Math.max($("#lightbox_wrapper").height(), 100), $("body").height() - 70);
      a = Math.round($("#application").width() / 2 - a / 2);
      var c = Math.max(35, Math.round($("body").height() / 2 - b / 2)), d = $("#lightbox_content").height(), f = $("#lightbox_header", this.element).outerHeight() + $("#div.error.response:visible", this.element).outerHeight() + $("#lightbox_footer", this.element).outerHeight(), g = 0;
      $(".measure", "#lightbox_content").each((function (h)
{
  g += $(h).height();
}
));
      b = Math.min(Math.max(150, parseInt(b - f, 10)));
      if (b < d && ! $("#lightbox_content").is(".fixed_content"))
        {
          $("#lightbox_content").height(b);
          $(".lightbox_pane_content").height($("#lightbox_content").height() - $("#lightbox_content #pane_footer").outerHeight() - g);
        }
      $("#lightbox_wrapper").css({top : c, left : a});
      $.publish("lightbox.position");
    }
}
), open : (function (a,b)
{
  var c = this.queue.indexOf(a), d = _.orEqual(this.priorities[a], 0);
  b = _.orEqual(b, null);
  var f = this;
  if (this.curType === a)
    return false;
  this.queuedOptions[a] = b;
  if (d < this.currentPriority)
    this.queue.indexOf(a) === - 1 && this.queue.push(a);
  else
    {
      this.curType && this.queue.indexOf(this.curType) === - 1 && this.queue.push(this.curType);
      if (! (this.queue.length && c !== - 1 && c > - 1))
        {
          this.curType = a;
          this.currentPriority = d;
          this.isOpen = true;
          $("#lightbox_wrapper .lbcontainer." + a)[$.String.underscore("gs_lightbox_" + a)](b);
          $("#lightbox .lbcontainer." + a).show(1, (function ()
{
  f.positionLightbox();
  $(this).find("form input:first:visible").focus();
}
)).siblings().hide();
          this.trackLightboxView(a);
          if ($("#lightbox_wrapper").is(":visible"))
            this.queue.indexOf(a) === - 1 && this.queue.unshift(a);
          else
            this.queue.indexOf(a) === - 1 && this.queue.push(a);
          $("#theme_home .flash object").css("visibility", "hidden");
          $("#lightbox_wrapper,#lightbox_overlay").show();
          this.notCloseable.indexOf(this.curType) == - 1 ? $("#lightbox_close").show() : $("#lightbox_close").hide();
        }
    }
}
), close : (function ()
{
  var a, b;
  a = this.queue.shift();
  if (_.defined(a))
    {
      $("#lightbox_wrapper .lbcontainer." + a).hide();
      a !== "login" && $("#lightbox_wrapper .lbcontainer." + a).empty().controller().destroy();
    }
  this.currentPriority = this.curType = false;
  if (this.queue.length > 0)
    {
      this.queue = this.sortQueueByPriority(this.queue);
      a = this.queue.shift();
      b = this.queuedOptions[a];
      try
        {
          this.open(a, b);
        }
      catch (c)
        {
          console.warn("error opening next lightbox", c);
          this.isOpen = this.currentPriority = this.curType = false;
          $("#lightbox_wrapper,#lightbox_overlay").hide();
          $("#theme_home .flash object").css("visibility", "visible");
        }
    }
  else
    {
      this.isOpen = this.currentPriority = this.curType = false;
      $("#lightbox_wrapper,#lightbox_overlay").hide();
      $("#theme_home .flash object").css("visibility", "visible");
    }
}
), sortQueueByPriority : (function (a)
{
  a.sort(this.callback((function (b,c)
{
  var d = _.orEqual(this.priorities[b], 0), f = _.orEqual(this.priorities[c], 0);
  return d == f ? 0 : d > f ? 1 : - 1;
}
))).reverse();
  return a;
}
), trackLightboxView : (function (a)
{
  a = "#/lb/" + a;
  window._gaq && _gaq.push && _gaq.push(["_trackPageview", a]);
}
), ".close click" : (function (a,b)
{
  b.preventDefault();
  console.log("lightbox close");
  GS.lightbox.close();
}
), "input focus" : (function (a)
{
  $(a).parent().parent().addClass("active");
}
), "textarea focus" : (function (a)
{
  $(a).parent().parent().parent().addClass("active");
}
), "input blur" : (function (a)
{
  $(a).parent().parent().removeClass("active");
}
), "textarea blur" : (function (a)
{
  $(a).parent().parent().parent().removeClass("active");
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.LoginController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  $("#lightbox_footer li").show();
  a && a.username && $("input[name=username]", this.element).val(a.username);
  a && a.error ? this.showError(a.error) : this.element.find(".error").hide();
  $("input[name=password]", this.element).val("");
  $("input[name=username]", this.element).focus();
}
), showError : (function (a)
{
  console.log("showError", a, $("div.message", this.element));
  $("div.message", this.element).html($.localize.getString(a));
  this.element.find(".error").show();
}
), showMessage : (function (a)
{
  console.log("showMessage", a);
  $("div.message", this.element).html(a);
  this.element.find(".error").show();
}
), "input focus" : (function (a)
{
  $(a).parent().parent().addClass("active");
}
), "input blur" : (function (a)
{
  $(a).parent().parent().removeClass("active");
}
), "a.submit click" : (function ()
{
  console.log("login.a.submit.click form subm");
  $("form", this.element).submit();
}
), "a.signup click" : (function ()
{
  GS.lightbox.close();
  GS.lightbox.open("signup");
}
), "a.forget,a.forgot click" : (function ()
{
  GS.lightbox.close();
  GS.lightbox.open("forget");
}
), "form submit" : (function (a)
{
  console.log("login.form.subm");
  var b = $("input[name=username]", a).val(), c = $("input[name=password]", a).val();
  a = $("input[name=save]", a).val() ? 1 : 0;
  switch (b.toLowerCase())
  {
    case "dbg:googlelogin":
      GS.google.lastError ? this.showMessage("Last Google Login Error: " + GS.google.lastError) : this.showMessage("There does not appear to be any errors with Google Login");
      break ;
    default:
      GS.auth.login(b, c, a, this.callback(this.loginSuccess), this.callback(this.loginFailed));
      break ;
  }
}
), "a.signup click" : (function ()
{
  GS.lightbox.close();
  GS.lightbox.open("signup");
}
), "button.facebookLogin click" : (function ()
{
  GS.auth.loginViaFacebook(this.callback(this.loginSuccess), this.callback(this.loginFailed));
}
), "button.googleLogin click" : (function ()
{
  GS.auth.loginViaGoogle(this.callback(this.loginSuccess), this.callback(this.loginFailed));
}
), loginSuccess : (function ()
{
  GS.lightbox.close();
}
), loginFailed : (function (a)
{
  console.log("lb.loginfail", arguments);
  if (a.error)
    this.showError(a.error);
  else
    if (a && a.authType == "facebook")
      this.showError("POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_ERROR");
    else
      if (a && a.authType == "google")
        this.showError("POPUP_SIGNUP_LOGIN_FORM_GOOGLE_ERROR");
      else
        a && a.userID == 0 ? this.showError("POPUP_SIGNUP_LOGIN_FORM_AUTH_ERROR") : this.showError("POPUP_SIGNUP_LOGIN_FORM_GENERAL_ERROR");
  GS.lightbox.positionLightbox();
}
)});
  (function ()
{
  var a = {1 : {message : "POPUP_SIGNUP_FORM_UNKNOWN_ERROR"}, 2 : {message : "POPUP_SIGNUP_FORM_DUPLICATE_EMAIL", fields : ["#signup_email"]}, 4 : {message : "POPUP_SIGNUP_FORM_DUPLICATE_USERNAME", fields : ["#signup_username"]}, 8 : {message : "POPUP_SIGNUP_FORM_INVALID_PASSWORD", fields : ["#signup_password"]}, 16 : {message : "POPUP_SIGNUP_FORM_MISSING_GENDER", fields : ["#sex_M", "#sex_F"]}, 32 : {message : "POPUP_SIGNUP_FORM_MISSING_NAME", fields : ["#signup_fname"]}, 64 : {message : "POPUP_SIGNUP_FORM_USERNAME_LENGTH_ERROR", fields : ["#signup_username"]}, 128 : {message : "POPUP_SIGNUP_FORM_INVALID_USERNAME", fields : ["#signup_username"]}, 256 : {message : "POPUP_SIGNUP_FORM_INVALID_EMAIL", fields : ["#signup_email"]}, 512 : {message : "POPUP_SIGNUP_FORM_TOO_YOUNG", fields : []}, 1024 : {message : "POPUP_SIGNUP_FORM_PASSWORD_NO_MATCH", fields : ["#signup_password", "#signup_password2"]}, 2048 : {message : "POPUP_SIGNUP_FORM_MUST_ACCEPT_TOS", fields : ["#signup_tos"]}, 4096 : {message : "POPUP_SIGNUP_FORM_MISSING_DOB", fields : []}};
  GS.Controllers.InviteInterface.extend("GS.Controllers.Lightbox.SignupController", {onDocument : false}, {scrollDuration : 1600, curStage : false, stages : {profile1 : "profile1", profile2 : "profile2", invite : "invite", upgrade : "upgrade", complete : "complete"}, userInfo : {}, googleContacts : null, facebookFriends : [], fbIDs : {}, slickbox : false, init : (function (b,c)
{
  this.update(c);
}
), update : (function (b)
{
  this.today = new Date();
  this.months = $.localize.getString("MONTHS").split(",");
  this.expYears = [];
  for (var c = new Date().getFullYear(), d = 0;d < 5;d++)
    this.expYears.push(c + d);
  this.element.html(this.view("/lightbox/signup/index"));
  if (b && b.vipPackage && b.gotoComplete)
    {
      this.vipPackage = b.vipPackage;
      setTimeout(this.callback((function ()
{
  $("#lightbox_content").scrollTop(2000);
  this.initComplete(this.vipPackage);
}
)), $.browser.msie ? 1000 : 1);
    }
  else
    if (b && b.gotoUpgrade)
      setTimeout(this.callback((function ()
{
  $("#lightbox_content").scrollTop(1500);
  this.initUpgrade();
}
)), $.browser.msie ? 1000 : 1);
    else
      b && b.gotoInvite ? setTimeout(this.callback((function ()
{
  $("#lightbox_content").scrollTop(1000);
  this.initInvite();
}
)), $.browser.msie ? 1000 : 1) : this.initProfile1();
  this.isFacebook = false;
  this.fbSession = {};
  this.isGoogle = false;
  if (b)
    {
      b.username && $("input[name=username]", this.element).val(b.username);
      b.fname && $("input[name=fname]", this.element).val(b.fname);
      b.email && $("input[name=email]", this.element).val(b.email);
      b.month && $("select[name=month]", this.element).val(b.month);
      b.day && $("select[name=day]", this.element).val(b.day);
      b.year && $("select[name=year]", this.element).val(b.year);
      b.sex && $("#sex_" + b.sex, this.element).attr("checked", "checked");
      if (b.isFacebook)
        {
          this.isFacebook = true;
          if (b.session)
            this.fbSession = b.session;
          $("li.password").hide();
          a[1024] = "POPUP_SIGNUP_FORM_FACEBOOK_GENERAL_ERROR";
          a[2048] = "POPUP_SIGNUP_FORM_FACEBOOK_GENERAL_ERROR";
          a[4096] = "FACEBOOK_DUPLICATE_ACCOUNT_ERROR_MSG";
        }
      else
        if (b.isGoogle)
          {
            this.isGoogle = true;
            $("li.password").hide();
            a[2048] = "POPUP_SIGNUP_FORM_GOOGLE_GENERAL_ERROR";
            a[4096] = "GOOGLE_DUPLICATE_ACCOUNT_ERROR_MSG";
          }
      b.error && this.element.find(".error").show().find(".message").html(b.error);
      b.message && this.element.find(".intro-message").show().find(".message").html(b.message);
      $(".selectbox.month span").html($(".selectbox.month").find("option:selected").html());
      $(".selectbox.day span").html($(".selectbox.day").find("option:selected").html());
      $(".selectbox.year span").html($(".selectbox.year").find("option:selected").html());
      this.bExtend = (this.bExtend = _.orEqual(b.bExtend, 0)) ? 1 : 0;
    }
}
), initProfile1 : (function ()
{
  this.curStage = this.stages.profile1;
  $("#lightbox_content").scrollTo("#signup_profile1", this.scrollDuration);
  $("#lightbox_footer li").hide();
  $("#lightbox_footer li.next").show();
  $("#signup_username").focus();
  GS.lightbox.trackLightboxView("signup/profile1");
}
), initProfile2 : (function ()
{
  ($("#signup_profile2").children()).length || $("#signup_profile2").html(this.view("/lightbox/signup/profileStep2"));
  this.curStage = this.stages.profile2;
  $("#lightbox_content").scrollTo("#signup_profile2", this.scrollDuration);
  $("#lightbox_footer li").hide();
  $("#lightbox_footer li.back").show();
  $("#lightbox_footer li.next").show();
  $("#signup_fname").focus();
  GS.lightbox.trackLightboxView("signup/profile2");
}
), initInvite : (function ()
{
  this.curStage = this.stages.invite;
  this.submitType = "email";
  $("#signup_inviteSection").html(this.view("/lightbox/signup/invite"));
  $("#lightbox_content").scrollTo("#signup_inviteSection", this.scrollDuration);
  $("#lightbox_footer li").hide();
  $("#lightbox_footer li.back").hide();
  $("#lightbox_footer li.next").show();
  if (GS.user.isLoggedIn)
    GS.service.getContactInfoForFollowers(this.callback("onFollowersSuccess"), this.callback("onFollowersFailed"));
  else
    {
      new $.TextboxList("#emails", {addOnBlur : true, bitsOptions : {editable : {growing : true, growingOptions : {maxWidth : $("#emails").innerWidth() - 10}}}});
      $("#signupInvite input.textboxlist-bit-editable-input").focus();
    }
  GS.facebook.getFriends(this.callback("onFacebookFriends"));
  this.subscribe("gs.facebook.status", this.callback((function ()
{
  GS.facebook.getFriends(this.callback("onFacebookFriends"));
}
)));
  GS.lightbox.trackLightboxView("signup/invite");
}
), onFacebookFriendsCallback : (function ()
{
  console.log("onFacebookFriendscallback", this.facebookFriends.length);
  this.submitType === "facebook" && $("ul.menu li.facebook").removeClass("active").click();
}
), initUpgrade : (function ()
{
  this.curStage = this.stages.upgrade;
  $("#signup_upgradeSection").html(this.view("/lightbox/signup/upgrade"));
  $("#lightbox_footer").show();
  $("#lightbox_content").scrollTo("#signup_upgradeSection", this.scrollDuration);
  $("#lightbox_footer li").hide();
  $("#lightbox_footer li.back").hide();
  $("#lightbox_footer li.nothanks").show();
  GS.lightbox.trackLightboxView("signup/upgrade");
}
), "#signup_inviteSection ul.menu li click" : (function (b)
{
  console.error("invite menu click", b.is(".active"));
  if (! b.is(".active"))
    {
      b.addClass("active").siblings().removeClass("active");
      this.submitType = b = $.trim(b.attr("class").replace(/(\s+)?(active)(\s+)?/g, ""));
      $("#signupInvite .content .inviteContainer." + b).show().siblings().hide();
      if (b === "facebook")
        this.slickbox = $(".inviteContainer.facebook .contactsContainer", this.element).show().slickbox({itemRenderer : this.facebookItemRenderer, itemClass : this.facebookItemClass, itemWidth : 205, itemHeight : 45, verticalGap : 5, horizontalGap : 8, hidePositionInfo : true, listClass : "contacts facebook_contacts"}, this.facebookFriends);
    }
}
), initComplete : (function (b)
{
  this.curStage = this.stages.complete;
  this.vipPackage = b;
  $("#signup_completeSection").html(this.view("/lightbox/signup/complete"));
  $("#lightbox_footer").show();
  $("#lightbox_content").scrollTo("#signup_completeSection", this.scrollDuration);
  $("#lightbox_footer li").hide();
  $("#lightbox_footer li.finish").show();
  location.hash = "/";
  GS.lightbox.trackLightboxView("signup/complete");
}
), "a.login click" : (function ()
{
  GS.lightbox.close();
  GS.lightbox.open("login");
}
), "#lightbox_footer li.submit, #pane_footer li.submit click" : (function (b,c)
{
  c.preventDefault();
  if (this.curStage == this.stages.profile1)
    this.checkProfile1() && this.initProfile2();
  else
    if (this.curStage == this.stages.profile2)
      this.profileSubmit() && this.initInvite();
    else
      if (this.curStage == this.stages.invite)
        this.inviteSubmit() && this.initUpgrade();
      else
        if (this.curStage == this.stages.upgrade)
          this.initComplete();
        else
          this.curStage == this.stages.complete && GS.lightbox.close();
  return false;
}
), "#lightbox_footer li.back, #pane_footer li.back click" : (function (b,c)
{
  c.preventDefault();
  if (this.curStage == this.stages.profile2)
    this.initProfile1();
  else
    if (this.curStage == this.stages.invite)
      this.initProfile2();
    else
      if (this.curStage == this.stages.upgrade)
        this.initInvite();
      else
        this.curStage == this.stages.complete && this.initInvite();
  return false;
}
), "#lightbox_footer li.close click" : (function ()
{
  GS.lightbox.close();
}
), "#signupUpgrade li.upgrade click" : (function (b)
{
  b = b.is(".plus") ? "plus" : "anywhere";
  GS.lightbox.close();
  GS.lightbox.open("vipSignup", {vipPackage : b, isSignup : true, bExtend : this.bExtend});
}
), "#signup_username change" : (function (b)
{
  var c = /^([a-zA-Z0-9]+[\.\-_]?)+[a-zA-Z0-9]+$/, d = b.val();
  this.element.find(".error.response").hide();
  if (d !== "" && d.match(c) && d.length && ! (d.length < 5 || d.length > 32))
    b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
  else
    {
      b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
      this.signupFailed({errorCode : 128});
    }
}
), "#signup_password change" : (function (b)
{
  var c = b.val(), d = $("#signup_password2").val();
  this.element.find(".error.response").hide();
  if (c !== "" && c.length && ! (c.length < 5 || c.length > 32))
    {
      b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
      if (c === d)
        $("#signup_password2").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
      else
        d !== "" && this.signupFailed({errorCode : 1024});
    }
  else
    {
      b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
      this.signupFailed({errorCode : 8});
    }
}
), "#signup_password2 change" : (function (b)
{
  var c = $("#signup_password").val(), d = b.val();
  this.element.find(".error.response").hide();
  if (d && c === d)
    {
      b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
      $("#signup_password").change();
    }
  else
    {
      b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
      $("#signup_password").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
      this.signupFailed({errorCode : 1024});
    }
}
), "#signup_email change" : (function (b)
{
  var c = b.val();
  this.element.find(".error.response").hide();
  if (c.match(_.emailRegex))
    b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
  else
    {
      b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
      this.signupFailed({errorCode : 256});
    }
}
), "#signup_fname change" : (function (b)
{
  b.val() !== "" ? b.parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : b.parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
}
), "#signup_tos change" : (function (b)
{
  b.is(":checked") ? b.parent().removeClass("error") : b.parent().addClass("error");
}
), "input,select keydown" : (function (b,c)
{
  c.keyCode && c.keyCode == 13 && ! b.is("[name*=google]") && $("#lightbox_footer li.submit:visible, #pane_footer li.submit:visible").click();
}
), "select focus" : (function (b)
{
  b.parents(".input_wrapper").addClass("active");
}
), "select blur" : (function (b)
{
  b.parents(".input_wrapper").removeClass("active");
  b.change();
}
), "select keydown" : (function (b)
{
  b.change();
}
), "select.country,#signup_country change" : (function (b)
{
  $(".selectbox.country span").html(b.find("option:selected").html());
}
), "select.month change" : (function (b)
{
  $(".selectbox.month span").html(b.find("option:selected").html());
}
), "select.day change" : (function (b)
{
  $(".selectbox.day span").html(b.find("option:selected").html());
}
), "select.year change" : (function (b)
{
  $(".selectbox.year span").html(b.find("option:selected").html());
}
), "select.year,select.month,select.day change" : (function ()
{
  var b = parseInt($("select[name=month]", this.element).val(), 10), c = parseInt($("select[name=year]", this.element).val(), 10), d = parseInt($("select[name=day]", this.element).val(), 10), f = $("select[name=month]", this.element).find("option:selected").val(), g = $("select[name=year]", this.element).find("option:selected").val(), h = $("select[name=day]", this.element).find("option:selected").val();
  this.element.find(".error.response").hide();
  g !== "" && (! c || c < 0) ? $("select[name=year]", this.element).parents(".input_wrapper").addClass("error").parent().siblings("label").addClass("error") : $("select[name=year]", this.element).parents(".input_wrapper").removeClass("error").parent().siblings("label").removeClass("error");
  f !== "" && (! b || b < 0) ? $("select[name=month]", this.element).parents(".input_wrapper").addClass("error").parent().siblings("label").addClass("error") : $("select[name=month]", this.element).parents(".input_wrapper").removeClass("error").parent().siblings("label").removeClass("error");
  h !== "" && (! d || d < 0) ? $("select[name=day]", this.element).parents(".input_wrapper").addClass("error").parent().siblings("label").addClass("error") : $("select[name=day]", this.element).parents(".input_wrapper").removeClass("error").parent().siblings("label").removeClass("error");
  if (c && b && d)
    {
      b = new Date(c, b, d);
      b = new Date().getTime() - b.getTime();
      b = b / 86400000;
      b = Math.floor(b / 365.24);
      if (b < 13)
        {
          $(".input_wrapper.year, .input_wrapper.month, .input_wrapper.day").addClass("error").parent().siblings("label").addClass("error");
          this.signupFailed({errorCode : 512});
        }
      else
        $(".input_wrapper.year, .input_wrapper.month, .input_wrapper.day").removeClass("error").parent().siblings("label").removeClass("error");
    }
}
), "input[name=sex] change" : (function ()
{
  var b = $("#signupAccount input[name=sex]").val();
  ! b || b === "" ? $("#signupAccount input[name=sex]").parent().parent().addClass("error") : $("#signupAccount input[name=sex]").parent().parent().removeClass("error");
}
), ".error.response a.toggle click" : (function (b)
{
  $(b).closest(".error.response").hide();
}
), checkProfile1 : (function ()
{
  var b = true, c = $("#signupAccount input[name=username]").val(), d = $("#signupAccount input[name=email]").val(), f = $("#signupAccount input[name=password]").val(), g = $("#signupAccount input[name=password2]").val(), h = $("#signupAccount input[name=tos]").is(":checked"), o = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, p = 0;
  this.element.find(".error.response").hide();
  c.length || (p |= 64);
  c.match(/^([a-zA-Z0-9]+[\.\-_]?)+[a-zA-Z0-9]+$/) || (p |= 128);
  if (! d.length || ! d.match(o))
    p |= 256;
  if (! this.isFacebook && ! this.isGoogle)
    {
      if (f.length < 5 || f.length > 32)
        p |= 8;
      if (f !== g)
        p |= 1024;
    }
  h || (p |= 2048);
  GS.service.getIsUsernameEmailAvailable(c, d, this.callback((function (q)
{
  if (! q.username && c.length)
    p |= 4;
  if (! q.email && d.length)
    p |= 2;
}
)), null, {async : false});
  if (p > 0)
    {
      this.signupFailed({errorCode : p});
      b = false;
    }
  else
    {
      this.element.find(".error.response").hide();
      this.element.find(".intro-message.response").hide();
      $("#signup_username").change();
      $("#signup_email").change();
      $("#signup_tos").change();
      if (! this.isGoogle && ! this.isFacebook)
        {
          $("#signup_password").change();
          $("#signup_password2").change();
        }
      if (($("#signupAccount .input_wrapper.error, #signupAccount p.tos.error")).length)
        b = false;
    }
  return b;
}
), profileSubmit : (function ()
{
  console.log("signup.profileSubmit. form.submit", this);
  var b = $("#signupAccount input[name=username]").val(), c = $("#signupAccount input[name=password]").val(), d = $("#signupAccount input[name=email]").val(), f = $("#signupAccount input[name=fname]").val(), g = $("#signupAccount input[name=sex]:checked").val(), h = [$("#signupAccount select[name=year]").val(), $("#signupAccount select[name=month]").val(), $("#signupAccount select[name=day]").val()].join("-");
  $("#signupAccount input[name=tos]").is(":checked");
  $("#signupAccount input[name=artist]").is(":checked");
  var o = parseInt($("select[name=month]", this.element).val(), 10), p = parseInt($("select[name=year]", this.element).val(), 10), q = parseInt($("select[name=day]", this.element).val(), 10), t = 0;
  this.element.find(".error.response").hide();
  $("select.year,select.month,select.day", this.element).change();
  $("#signup_fname").change();
  ! g || g === "" ? $("#signupAccount input[name=sex]").parent().parent().addClass("error") : $("#signupAccount input[name=sex]").parent().parent().removeClass("error");
  if (p && o && q)
    {
      birthDate = new Date(p, o, q);
      dateDiff = new Date().getTime() - birthDate.getTime();
      ageDays = dateDiff / 86400000;
      ageYears = Math.floor(ageDays / 365.24);
      if (ageYears < 13)
        t |= 512;
    }
  else
    {
      $(".input_wrapper.year, .input_wrapper.month, .input_wrapper.day").addClass("error").parent().siblings("label").addClass("error");
      t |= 4096;
    }
  if (! g || ! g.length)
    t |= 16;
  f.length || (t |= 32);
  if (t > 0 || ($("#signupAccount .input_wrapper.error, #signupAccount p.tos.error, #signupAccount div.field.error")).length)
    {
      this.signupFailed({errorCode : t});
      return false;
    }
  if (this.isFacebook)
    GS.auth.signupViaFacebook(b, f, d, g, h, this.fbSession, this.callback(this.signupSuccess), this.callback(this.signupFailed));
  else
    this.isGoogle ? GS.auth.signupViaGoogle(b, f, d, g, h, this.callback(this.signupSuccess), this.callback(this.signupFailed)) : GS.auth.signup(b, c, f, d, g, h, false, this.callback(this.signupSuccess), this.callback(this.signupFailed));
  return false;
}
), signupSuccess : (function ()
{
  this.element.find(".error.response").hide();
  this.initInvite();
}
), signupFailed : (function (b)
{
  var c, d = ["<ul class=\"errors\">"];
  console.warn("lb.signupfailed", b, b.details);
  $.each(a, (function (h,o)
{
  if (b.errorCode & h)
    {
      d.push("<li>" + $.localize.getString(o.message) + " </li>");
      if (o.fields)
        for (i = 0;i < o.fields.length;i++)
          $(o.fields[i]).parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
    }
}
));
  d.push("</ul>");
  c = this.element.find(".error.response").show().find(".message");
  if (b.errorCode && b.errorCode & 2 && (this.isFacebook || this.isGoogle))
    {
      var f = $("#signupAccount input[name=email]").val();
      if (this.isGoogle)
        {
          GS.google.onLoginSaveData = f;
          var g = $.localize.getString("POPUP_SIGNUP_FORM_GOOGLE_EMAIL_INUSE_LINK");
        }
      else
        if (this.isFacebook)
          {
            GS.facebook.onLoginSaveData = f;
            g = $.localize.getString("POPUP_SIGNUP_FORM_FACEBOOK_EMAIL_INUSE_LINK");
          }
      for (i = 0;i < d.length;i++)
        if (d[i].match(/email\saddress/))
          {
            d[i] = d[i].replace(" </li>", g);
            break ;
          }
    }
  c.html("<strong>" + $.localize.getString("POPUP_SIGNUP_ERROR_MESSAGE") + "</strong> " + d.join(""));
  GS.lightbox.positionLightbox();
}
), "#lightbox ul.errors .loginAs click" : (function (b,c)
{
  c.preventDefault();
  GS.lightbox.close();
  if (this.isGoogle)
    GS.lightbox.open("login", {error : "POPUP_SIGNUP_LOGIN_FORM_GOOGLE_EMAIL_INUSE", username : GS.google.onLoginSaveData});
  else
    this.isFacebook && GS.lightbox.open("login", {error : "POPUP_SIGNUP_LOGIN_FORM_FACEBOOK_EMAIL_INUSE", username : GS.facebook.onLoginSaveData});
}
), inviteSubmit : (function ()
{
  return true;
}
), "#signupInvite submit" : (function (b,c)
{
  c.preventDefault();
  if (this.submitType.match("google"))
    this.submitType = $("ul.login", this.element).is(":visible") ? "googleLogin" : "googleContacts";
  this.formSubmit();
  return false;
}
), sendInviteSuccessCallback : (function ()
{
  this.initUpgrade();
}
), googContactsSuccessCallback : (function ()
{
  this.submitType = "googleContacts";
  $("ul.google_contacts", this.element).html(this.view("/shared/googleContacts"));
  $(".inviteContainer.google ul.login", this.element).hide();
  $(".googleContacts", this.element).show();
  $("ul.google_contacts li:even").addClass("even contactRow_even");
  $("ul.google_contacts li:odd").addClass("odd contactRow_odd");
  $(".inviteContainer.google ul.submitButtons li.login", this.element).hide().siblings().show();
}
), facebookSuccessCallback : (function ()
{
  this.initUpgrade();
}
), upgradeSubmit : (function ()
{
  if (this.vipPackage === false)
    {
      this.initUpgrade();
      return false;
    }
  return true;
}
), completeSubmit : (function ()
{
  return true;
}
)});
}
)();
  (function ()
{
  var a = {"GS-00" : "VIP_ERROR_UNKNOWN", "GS-01" : "VIP_ERROR_LOGIN", "GS-02" : "VIP_ERROR_ALREADY_VIP", "CC-01" : "VIP_ERROR_MISSING_NAME", "CC-02" : "VIP_ERROR_UNKNOWN", "CC-03" : "VIP_ERROR_MISSING_CC_INFO", "CC-04" : "VIP_ERROR_ADDRESS", "CC-05" : "VIP_ERROR_UNKNOWN", "CC-06" : "VIP_ERROR_PAYMENT_PROCESSOR", "CC-07" : "VIP_ERROR_SESSION_EXPIRED", "CC-08" : "VIP_ERROR_INVALID_CC", "CC-09" : "VIP_ERROR_MISSING_CVD", "CC-10" : "VIP_ERROR_INVALID_CVD", "CC-11" : "VIP_ERROR_ADDRESS1_TOO_LONG", "CC-000" : "VIP_ERROR_GENERIC_PAYMENT_ERROR", "CC-000X" : "VIP_ERROR_GENERIC_PAYMENT_ERROR", "PP-01" : "VIP_ERROR_UNKNOWN", "PP-02" : "VIP_ERROR_UNKNOWN_PAYPAL", "PP-03" : "VIP_ERROR_UNKNOWN", "PP-04" : "VIP_ERROR_PAYPAL_CANCEL", "PP-000" : "VIP_ERROR_PAYPAL_FAIL", "PP-000X" : "VIP_ERROR_PAYPAL_FAIL", "PC-01" : "VIP_ERROR_NO_PROMOCODE", "PC-02" : "VIP_ERROR_CODE_NOT_FOUND", "PC-03" : "VIP_ERROR_CODE_REDEEMED"}, b = {AF : true, AL : true, AM : true, AO : true, AZ : true, BA : true, BD : true, BG : true, BI : true, BY : true, CD : true, CF : true, CG : true, CK : true, CS : true, CU : true, DZ : true, EG : true, ER : true, ET : true, GE : true, GT : true, HT : true, ID : true, IQ : true, IR : true, KG : true, KH : true, KP : true, KZ : true, LA : true, LR : true, LY : true, MD : true, MK : true, MM : true, MN : true, MY : true, NG : true, NR : true, PH : true, PK : true, RO : true, RU : true, RW : true, SD : true, SL : true, SR : true, SY : true, TJ : true, TM : true, UA : true, UZ : true, VE : true, YE : true, ZW : true};
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VipSignupController", {onDocument : false}, {vipPackages : {plus : "plus", anywhere : "anywhere", vip : "vip"}, vipPackagePrices : {month : {plus : 6, anywhere : 9, vip : 3}, year : {plus : 60, anywhere : 90, vip : 30}}, creditCardStages : {payment : "payment", billing : "billing", confirmation : "confirmation"}, paypalStages : {payment : "payment", redirect : "redirect", confirmation : "confirmation"}, offersStages : {promocode : "promocode", confirmation : "confirmation"}, curCreditCardStage : false, curPaypalStage : false, curOffersStage : false, vipToken : false, vipCallbackUrl : false, recurring : true, vipPackage : false, paymentType : "creditcard", isSignup : false, init : (function (c,d)
{
  this.update(d);
}
), update : (function (c)
{
  this.today = new Date();
  this.months = $.localize.getString("MONTHS").split(",");
  this.expYears = [];
  this.vip = this.anywhere = 0;
  this.excludedCountries = b;
  this.paymentType = "creditcard";
  this.bExtend = (this.bExtend = _.orEqual(c.bExtend, 0)) ? 1 : 0;
  for (var d = new Date().getFullYear(), f = 0;f < 10;f++)
    this.expYears.push(d + f);
  this.vipToken = hex_md5(new Date().getTime());
  this.vipEndpoint = gsConfig.runMode == "production" ? "https://vip.grooveshark.com/" : "https://stagingvip.grooveshark.com/";
  this.vipCallbackUrl = location.protocol + "//" + location.host + "/vipCallback.php";
  if (c && c.vipPackage)
    {
      this.anywhere = c.vipPackage === this.vipPackages.anywhere ? 1 : 0;
      this.vip = c.vipPackage === this.vipPackages.vip ? 1 : 0;
    }
  if (this.vip)
    {
      this.monthPrice = this.vipPackagePrices.month.vip;
      this.yearPrice = this.vipPackagePrices.year.vip;
    }
  else
    if (this.anywhere)
      {
        this.monthPrice = this.vipPackagePrices.month.anywhere;
        this.yearPrice = this.vipPackagePrices.year.anywhere;
      }
    else
      {
        this.monthPrice = this.vipPackagePrices.month.plus;
        this.yearPrice = this.vipPackagePrices.year.plus;
      }
  if (c && c.isSignup)
    this.isSignup = true;
  this.element.html(this.view("/lightbox/vipSignup"));
  if (c && c.initOffers)
    this.initOffersBilling();
  else
    c && c.initPaypal ? this.initPaypalBilling() : this.initCreditCardBilling();
  GS.lightbox.positionLightbox();
}
), initCreditCardBilling : (function ()
{
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
  GS.lightbox.trackLightboxView("vipSignup/creditcard1");
}
), initPaypalBilling : (function ()
{
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
  GS.lightbox.trackLightboxView("vipSignup/paypal1");
}
), initCellPhoneBilling : (function ()
{
  this.paymentType = "cellphone";
  $("#cellphone_content").show().siblings().hide();
  $("#cellphone_content ul.progress li.payment").addClass("active").siblings().removeClass("active progress_previousStep progress_currentStep").parent().removeClass("progress_onLast");
  $("#cellphone_content ul.stages li.stage.promocode").show().siblings().hide();
  $("#billing_options .cellphone.pane a").addClass("active").parent().siblings().children("a").removeClass("active");
  $("#pane_footer ul.right li").show();
  this.isSignup ? $("#pane_footer ul.left li").show() : $("#pane_footer ul.left li").hide();
  this.element.find(".error.response").hide();
  GS.lightbox.trackLightboxView("vipSignup/cellphone1");
}
), initOffersBilling : (function ()
{
  this.paymentType = "offers";
  this.curOffersStage = this.offersStages.promocode;
  this.recurring = false;
  $("#offers_content").show().siblings().hide();
  $("#billing_options .offers.pane a").addClass("active").parent().siblings().children("a").removeClass("active");
  $("#pane_footer ul.right li.next").show().siblings().hide();
  this.isSignup ? $("#pane_footer ul.left li").show() : $("#pane_footer ul.left li").hide();
  this.element.find(".error.response").hide();
  GS.lightbox.trackLightboxView("vipSignup/offers1");
  $("#offers_content ul.progress li.payment").addClass("active progress_currentStep").removeClass("progress_previousStep").siblings().removeClass("active progress_currentStep").parent().removeClass("progress_onLast");
}
), "#billing_options .creditcard.pane click" : (function (c)
{
  c.is(".active") || this.initCreditCardBilling();
}
), "#billing_options .paypal.pane click" : (function (c)
{
  c.is(".active") || this.initPaypalBilling();
}
), "#billing_options .cellphone.pane click" : (function (c)
{
  c.is(".active") || this.initCellPhoneBilling();
}
), "#billing_options .offers.pane click" : (function (c)
{
  c.is(".active") || this.initOffersBilling();
}
), "#lightbox_footer li.submit, #pane_footer li.submit click" : (function (c,d)
{
  d.preventDefault();
  if (this.paymentType === "creditcard")
    if (this.curCreditCardStage === this.creditCardStages.payment)
      {
        if (this.checkCreditCard1())
          {
            $("#creditcard_content ul.progress li.payment").removeClass("progress_currentStep").addClass("progress_previousStep");
            $("#creditcard_content ul.progress li.billing").addClass("active progress_currentStep").removeClass("progress_nextStep");
            $("#creditcard_content ul.progress li.confirmation").addClass("progress_lastStep");
            $("#creditcard_content ul.stages li.stage.billing").show().siblings().hide();
            $("#creditcard_content ul.right li.next").show().siblings().hide();
            $("#creditcard_content ul.left li").show();
            this.curCreditCardStage = this.creditCardStages.billing;
            this.element.find(".error.response").hide();
            GS.lightbox.trackLightboxView("vipSignup/creditcard2");
          }
      }
    else
      {
        if (this.curCreditCardStage === this.creditCardStages.billing)
          if (this.checkCreditCard2())
            return this.creditCardSubmit();
      }
  else
    if (this.paymentType === "paypal")
      if (this.curPaypalStage === this.paypalStages.payment)
        {
          $("#paypal_content ul.progress li.payment").removeClass("progress_currentStep").addClass("progress_previousStep");
          $("#paypal_content ul.progress li.redirect").addClass("active progress_currentStep").removeClass("progress_nextStep");
          $("#paypal_content ul.progress li.confirmation").addClass("progress_lastStep");
          $("#paypal_content ul.stages li.stage.redirect").show().siblings().hide();
          $("#paypal_content ul.right li.next").show().siblings().hide();
          $("#paypal_content ul.left li").show();
          this.curPaypalStage = this.paypalStages.redirect;
          this.element.find(".error.response").hide();
          GS.lightbox.trackLightboxView("vipSignup/paypal2");
        }
  this.billingSubmit();
  return false;
}
), "#lightbox_footer li.back, #pane_footer li.back click" : (function (c,d)
{
  d.preventDefault();
  if (this.paymentType === "creditcard")
    if (this.curCreditCardStage === this.creditCardStages.payment)
      {
        if (this.isSignup)
          {
            GS.lightbox.close();
            GS.lightbox.open("signup", {gotoUpgrade : true});
          }
      }
    else
      if (this.curCreditCardStage === this.creditCardStages.billing)
        {
          $("#creditcard_content ul.progress li.payment").addClass("progress_currentStep").removeClass("progress_previousStep");
          $("#creditcard_content ul.progress li.billing").addClass("progress_nextStep").removeClass("active progress_currentStep");
          $("#creditcard_content ul.stages li.stage.payment").show().siblings().hide();
          $("#creditcard_content ul.right li.next").show().siblings().hide();
          this.isSignup ? $("#creditcard_content ul.left li").show() : $("#creditcard_content ul.left li").hide();
          this.curCreditCardStage = this.creditCardStages.payment;
          GS.lightbox.trackLightboxView("vipSignup/creditcard1");
        }
      else
        {
          if (this.curCreditCardStage === this.creditCardStages.confirmation)
            {
              $("#creditcard_content ul.progress li.billing").addClass("progress_currentStep").removeClass("progress_previousStep").parent().removeClass("progress_onLast");
              $("#creditcard_content ul.progress li:last").removeClass("active progress_currentStep");
              $("#creditcard_content ul.stages li.stage.billing").show().siblings().hide();
              $("#creditcard_content ul.right li.next").show().siblings().hide();
              $("#creditcard_content ul.left li").show();
              this.curCreditCardStage = this.creditCardStages.billing;
              GS.lightbox.trackLightboxView("vipSignup/creditcard2");
            }
        }
  else
    if (this.paymentType === "paypal")
      if (this.curPaypalStage === this.paypalStages.payment)
        {
          if (this.isSignup)
            {
              GS.lightbox.close();
              GS.lightbox.open("signup", {gotoUpgrade : true});
            }
        }
      else
        if (this.curPaypalStage === this.paypalStages.redirect)
          {
            $("#paypal_content ul.progress li.payment").addClass("progress_currentStep").removeClass("progress_previousStep");
            $("#paypal_content ul.progress li.redirect").addClass("progress_nextStep").removeClass("active progress_currentStep");
            $("#paypal_content ul.stages li.stage.payment").show().siblings().hide();
            $("#paypal_content ul.right li.next").show().siblings().hide();
            this.isSignup ? $("#paypal_content ul.left li").show() : $("#paypal_content ul.left li").hide();
            this.curPaypalStage = this.paypalStages.payment;
            GS.lightbox.trackLightboxView("vipSignup/paypal1");
          }
        else
          {
            if (this.curPaypalStage === this.paypalStages.confirmation)
              {
                $("#paypal_content ul.progress li.redirect").addClass("progress_currentStep").removeClass("progress_previousStep").parent().removeClass("progress_onLast");
                $("#paypal_content ul.progress li.confirmation").removeClass("active progress_currentStep");
                $("#paypal_content ul.stages li.stage.redirect").show().siblings().hide();
                $("#paypal_content ul.right li.next").show().siblings().hide();
                $("#paypal_content ul.left li").show();
                this.curPaypalStage = this.paypalStages.redirect;
                GS.lightbox.trackLightboxView("vipSignup/paypal2");
              }
          }
    else
      if (this.paymentType === "cellphone")
        return false;
      else
        if (this.paymentType === "offers")
          if (this.curOffersStage === this.offersStages.promocode)
            {
              if (this.isSignup)
                {
                  GS.lightbox.close();
                  GS.lightbox.open("signup", {gotoUpgrade : true});
                }
            }
          else
            if (this.curPaypalStage === this.paypalStages.confirmation)
              {
                $("#offers_content ul.progress li.promocode").addClass("progress_currentStep").removeClass("progress_previousStep").parent().removeClass("progress_onLast");
                $("#offers_content ul.progress li.confirmation").addClass("progress_nextStep").siblings().removeClass("active progress_currentStep");
                $("#offers_content #pane_footer ul.right li").show();
                this.isSignup ? $("#offers_content ul.left li").show() : $("#offers_content ul.left li").hide();
                $("#offers_content ul.stages li.stage.promocode").show().siblings().hide();
                this.curOffersStage = this.offersStages.payment;
                GS.lightbox.trackLightboxView("vipSignup/offers1");
              }
  return false;
}
), "#lightbox_footer li.close click" : (function ()
{
  GS.lightbox.close();
}
), "select focus" : (function (c)
{
  console.error("sel", c.parents(".input_wrapper"));
  c.parents(".input_wrapper").addClass("active");
}
), "select blur" : (function (c)
{
  c.parents(".input_wrapper").removeClass("active");
  c.change();
}
), "select keydown" : (function (c)
{
  c.change();
}
), "select.month change" : (function (c)
{
  $(".selectbox.month span").html(c.find("option:selected").html());
}
), "select.day change" : (function (c)
{
  $(".selectbox.day span").html(c.find("option:selected").html());
}
), "select.year change" : (function (c)
{
  $(".selectbox.year span").html(c.find("option:selected").html());
}
), "select.cardType change" : (function (c)
{
  $(".selectbox.cardType span").text(c.find("option:selected").html());
}
), "select.expMonth change" : (function (c)
{
  $(".selectbox.expMonth span").text(c.find("option:selected").html());
}
), "select.expYear change" : (function (c)
{
  $(".selectbox.expYear span").text(c.find("option:selected").html());
}
), "select.state change" : (function (c)
{
  $(".selectbox.state span").text(c.find("option:selected").html());
}
), "select#ccCountry change" : (function (c)
{
  var d = c.find("option:selected").val();
  $(".selectbox.country span").text(c.find("option:selected").html());
  d === "US" ? c.parents("ul").removeClass("showRegion", c.parents("ul")) : c.parents("ul").addClass("showRegion");
}
), "select#paypalCountry change" : (function (c)
{
  $(".selectbox.country span").text(c.find("option:selected").html());
}
), ".vipPackage input:radio change" : (function (c)
{
  $(".vipPackage label").removeClass("active");
  $(c).closest("label").toggleClass("active", $(c).is(":checked"));
}
), billingSubmit : (function ()
{
  if (this.paymentType === "creditcard")
    {
      if (this.curCreditCardStage !== this.creditCardStages.payment)
        if (this.curCreditCardStage !== this.creditCardStages.billing)
          if (this.curCreditCardStage === this.creditCardStages.confirmation)
            return this.creditCardConfirmSubmit();
    }
  else
    if (this.paymentType === "paypal")
      {
        if (this.curPaypalStage !== this.paypalStages.payment)
          if (this.curPaypalStage === this.paypalStages.redirect)
            return this.paypalSubmit();
          else
            if (this.curPaypalStage === this.paypalStages.confirmation)
              return this.paypalConfirmSubmit();
      }
    else
      if (this.paymentType === "offers")
        if (this.curOffersStage === this.offersStages.promocode)
          return this.offersSubmit();
        else
          {
            if (this.curOffersStage === this.offersStages.confirmation)
              return this.offersConfirmSubmit();
          }
      else
        if (this.paymentType === "cellphone")
          return this.cellphoneSubmit();
  return false;
}
), checkCreditCard1 : (function ()
{
  var c = [], d = /[^\d ]/, f = $("#creditcard_content select[name=cardType]").val(), g = $("#creditcard_content input[name=cardNumber]").val().replace(/(\s+)/g, "").replace(/(-)/g, ""), h = $("#creditcard_content input[name=secCode]").val(), o = $("#creditcard_content select[name=expMonth]").val(), p = $("#creditcard_content select[name=expYear]").val();
  this.element.find(".error.response").hide();
  if (! f || ! g || ! h || ! o || ! p)
    c.push({errorID : "CC-03"});
  f ? $("#creditcard_content select[name=cardType]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=cardType]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  if (! g || g.length > 16 || g.length < 13 || d.test(g))
    {
      c.push({message : $.localize.getString("VIP_ERROR_CARD_NUMBER")});
      $("#creditcard_content input[name=cardNumber]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
    }
  else
    $("#creditcard_content input[name=cardNumber]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
  if (! h || h.length > 4 || h.length < 3 || d.test(h))
    {
      c.push({message : $.localize.getString("VIP_ERROR_INVALID_CVD")});
      $("#creditcard_content input[name=secCode]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
    }
  else
    $("#creditcard_content input[name=secCode]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error");
  o ? $("#creditcard_content select[name=expMonth]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=expMonth]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  p ? $("#creditcard_content select[name=expYear]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=expYear]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  if (c.length)
    {
      this.showVipErrors({error : c});
      return false;
    }
  return true;
}
), checkCreditCard2 : (function ()
{
  var c = [], d = $("#creditcard_content select[name=country]").val(), f = $("#creditcard_content input[name=fname]").val(), g = $("#creditcard_content input[name=lname]").val(), h = $("#creditcard_content input[name=address1]").val(), o = $("#creditcard_content input[name=city]").val(), p = $("#creditcard_content input[name=zip]").val();
  this.element.find(".error.response").hide();
  if (! d || ! o || ! p || ! h)
    c.push({errorID : "CC-03"});
  if (! f || ! g)
    c.push({errorID : "CC-01"});
  d ? $("#creditcard_content select[name=iso]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content select[name=iso]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  f ? $("#creditcard_content input[name=fname]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=fname]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  g ? $("#creditcard_content input[name=lname]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=lname]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  h ? $("#creditcard_content input[name=address1]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=address1]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  o ? $("#creditcard_content input[name=city]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=city]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  p ? $("#creditcard_content input[name=zip]").parents(".input_wrapper").removeClass("error").siblings("label").removeClass("error") : $("#creditcard_content input[name=zip]").parents(".input_wrapper").addClass("error").siblings("label").addClass("error");
  $("#signupBilling .input_wrapper.error, #signupBilling p.tos.error, #signupBilling div.field.error");
  if (c.length)
    {
      this.showVipErrors({error : c});
      return false;
    }
  return true;
}
), creditCardSubmit : (function ()
{
  var c = hex_md5(new Date().getTime()), d = {vipToken : this.vipToken, callbackMethod : c, callbackUrl : this.vipCallbackUrl, vipPackage : $("#creditcard_content input[name=ccPackage]:checked").val(), anywhere : this.anywhere, bExtend : this.bExtend, recurring : 1, iso : $("#creditcard_content select[name=country]").val(), fName : $("#creditcard_content input[name=fname]").val(), lName : $("#creditcard_content input[name=lname]").val(), cardType : $("#creditcard_content select[name=cardType]").val(), expMonth : $("#creditcard_content select[name=expMonth]").val(), expYear : $("#creditcard_content select[name=expYear]").val(), cardNumber : $("#creditcard_content input[name=cardNumber]").val().replace(/(\s+)/g, "").replace(/(-)/g, ""), secCode : $("#creditcard_content input[name=secCode]").val(), address1 : $("#creditcard_content input[name=address1]").val(), address2 : $("#creditcard_content input[name=address2]").val(), city : $("#creditcard_content input[name=city]").val(), state : $("#creditcard_content select[name=state]").val(), region : $("#creditcard_content input[name=region]").val(), zip : $("#creditcard_content input[name=zip]").val()};
  GS.service.httpsFormSubmit(this.vipEndpoint + "payByCreditCard.php", d);
  window[c] = this.callback((function (f)
{
  console.error("ccsubmit win.callback", d, f, "success:", f.bSuccess, $("#httpsIframe"));
  if (f.bSuccess)
    {
      this.creditCardConfirmToken = f.token;
      $("#creditcard_content .confirmation td.vipPackage").html(f.description);
      $("#creditcard_content .confirmation td.price").html("$" + f.amount);
      $("#creditcard_content .confirmation td.tax").html("$" + f.tax);
      $("#creditcard_content .confirmation td.total").html("$" + f.total);
      f.bRecurring == true || f.bRecurring == "1" ? $("#creditcard_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_RECURRING") : $("#creditcard_content .confirmation p.recurring").html($.localize.getString("SUBSCRIPTION_NOT_RECURRING")).attr("data-translate-text", "SUBSCRIPTION_NOT_RECURRING");
      $("#creditcard_content ul.progress li.billing").addClass("progress_previousStep").removeClass("progress_currentStep");
      $("#creditcard_content ul.progress li.confirmation").addClass("active progress_currentStep").parent().addClass("progress_onLast");
      $("#creditcard_content ul.stages li.stage.confirmation").show().siblings().hide();
      $("#creditcard_content ul.right li.next").show().siblings().hide();
      $("#creditcard_content ul.left li").show();
      this.curCreditCardStage = this.creditCardStages.confirmation;
      this.element.find(".error.response").hide();
      GS.lightbox.trackLightboxView("vipSignup/creditcardConfirm");
    }
  else
    this.showVipErrors(f);
}
));
  return false;
}
), creditCardConfirmSubmit : (function ()
{
  var c = hex_md5(new Date().getTime()), d = {callbackUrl : this.vipCallbackUrl, callbackMethod : c, token : this.creditCardConfirmToken};
  GS.service.httpsFormSubmit(this.vipEndpoint + "payByCreditCardConfirm.php", d);
  window[c] = this.callback((function (f)
{
  console.error("ccconfirmsubmit win.callback", d, f, "success:", f.bSuccess, $("#httpsIframe"));
  var g = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
  if (f.bSuccess)
    {
      GS.user.updateAccountType(g);
      GS.lightbox.trackLightboxView("vipSignup/success");
      GS.lightbox.close();
      GS.lightbox.open("signup", {gotoComplete : true, vipPackage : g});
      location.hash = "#/settings/subscriptions";
    }
  else
    this.showVipErrors(f);
}
));
}
), paypalSubmit : (function ()
{
  var c = 0, d = this.vipEndpoint + "payByPaypal.php", f = hex_md5(new Date().getTime()), g = {vipToken : this.vipToken, callbackUrl : this.vipCallbackUrl, callbackMethod : f, vipPackage : $("#paypal_content input[name=paypalPackage]:checked").val(), anywhere : this.anywhere, bExtend : this.bExtend, recurring : 1, country : $("#paypal_content select[name=country]").val()};
  _.forEach(g, (function (h,o)
{
  d += c === 0 ? "?" + o + "=" + encodeURI(h) : "&" + o + "=" + encodeURI(h);
  c++;
}
));
  console.error("open paypal window", d);
  window.open(d, "_blank");
  $("#paypal_content p.redirectLink a").attr("href", d);
  window[f] = this.callback((function (h)
{
  console.error("paypalsubmit win.callback", g, h, $("#httpsIframe"));
  if (h.bSuccess)
    {
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
      GS.lightbox.trackLightboxView("vipSignup/paypalConfirm");
    }
  else
    this.showVipErrors(h);
}
));
  $("#paypal_content ul.progress li").addClass("active");
  $("#paypal_content ul.progress li:last").removeClass("active");
  $("#paypal_content ul.stages li.stage.redirect").show().siblings().hide();
  $("#paypal_content #pane_footer li").hide();
  $("#paypal_content ul.left li").show();
  this.curPaypalStage = this.paypalStages.redirect;
  return false;
}
), paypalConfirmSubmit : (function ()
{
  var c = hex_md5(new Date().getTime()), d = {callbackMethod : c, callbackUrl : this.vipCallbackUrl, token : this.paypalConfirmToken};
  GS.service.httpsFormSubmit(this.vipEndpoint + "payByPaypalConfirm.php", d);
  window[c] = this.callback((function (f)
{
  console.error("ccconfirmsubmit win.callback", d, f, "success:", f.bSuccess, $("#httpsIframe"));
  var g = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
  if (f.bSuccess)
    {
      GS.user.updateAccountType(g);
      GS.lightbox.trackLightboxView("vipSignup/success");
      GS.lightbox.close();
      GS.lightbox.open("signup", {gotoComplete : true, vipPackage : g});
      location.hash = "#/settings/subscriptions";
    }
  else
    this.showVipErrors(f);
}
));
  return false;
}
), offersSubmit : (function ()
{
  var c = $("#signup_promocode").val();
  if (c === "")
    $("#signup_promocode").parent().parent().addClass("error");
  else
    {
      $("#signup_promocode").parent().parent().removeClass("error");
      var d = hex_md5(new Date().getTime()), f = {vipToken : this.vipToken, callbackMethod : d, callbackUrl : this.vipCallbackUrl, anywhere : this.anywhere, bExtend : this.bExtend, code : c};
      GS.service.httpsFormSubmit(this.vipEndpoint + "payByPromoCode.php", f);
      window[d] = this.callback((function (g)
{
  console.error("offersubmit win.callback", f, g, $("#httpsIframe"));
  if (g.bSuccess)
    {
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
      GS.lightbox.trackLightboxView("vipSignup/offersConfirm");
    }
  else
    this.showVipErrors(g);
}
));
    }
  return false;
}
), offersConfirmSubmit : (function ()
{
  var c = hex_md5(new Date().getTime()), d = {callbackMethod : c, callbackUrl : this.vipCallbackUrl, token : this.offersConfirmToken};
  GS.service.httpsFormSubmit(this.vipEndpoint + "payByPromoCodeConfirm.php", d);
  window[c] = this.callback((function (f)
{
  console.error("ccconfirmsubmit win.callback", d, f, "success:", f.bSuccess, $("#httpsIframe"));
  var g = this.anywhere || this.vip ? this.vipPackages.anywhere : this.vipPackages.plus;
  if (f.bSuccess)
    {
      GS.user.updateAccountType(g);
      GS.lightbox.trackLightboxView("vipSignup/success");
      GS.lightbox.close();
      GS.lightbox.open("signup", {gotoComplete : true, vipPackage : g});
      location.hash = "#/settings/subscriptions";
    }
  else
    this.showVipErrors(f);
}
));
  return false;
}
), cellphoneSubmit : (function ()
{
  return false;
}
), cellphoneConfirmSubmit : (function ()
{
  return false;
}
), showVipErrors : (function (c)
{
  if (c.errorID && c.message)
    c.error = [{errorID : c.errorID, message : c.message}];
  var d, f = ["<ul class=\"errors\">"];
  this.element.find(".error.response .message").html("");
  this.element.find(".error.response").hide();
  if (c.error && c.error.length)
    {
      _.forEach(c.error, this.callback((function (g)
{
  if (d = $.trim($.localize.getString(a[g.errorID])))
    f.push("<li>" + d + "</li>");
  else
    {
      console.error("unknown error in arr", g.errorID, g.message);
      d = _.isString(g.message) ? g.message : g.message[0];
      if (d.match("AVS"))
        d = $.localize.getString("VIP_ERROR_AVS");
      else
        if (d.match("invalid XML"))
          d = $.localize.getString("VIP_ERROR_XML");
        else
          if (d.match("invalid card number"))
            d = $.localize.getString("VIP_ERROR_CARD_NUMBER");
          else
            if (d.match("CVD check"))
              d = $.localize.getString("VIP_ERROR_CVD");
      d && f.push("<li>" + d + "</li>");
    }
}
)));
      f.push("</ul>");
      c = this.element.find(".error").show().find(".message");
      c.html("<strong>" + $.localize.getString("POPUP_VIP_ERROR_MESSAGE") + "</strong> " + f.join(""));
    }
  else
    {
      this.element.find(".message").attr("data-translate-text", "VIP_ERROR_UNKNOWN").html($.localize.getString("VIP_ERROR_UNKNOWN"));
      this.element.find(".error").show();
    }
}
)});
}
)();
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VipExpiresController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.data = _.orEqual(a, {});
  this.daysLeft = _.orEqual(this.data.daysLeft, "days");
  this.timeframe = _.orEqual(this.data.timeframe, "twoWeeks");
  this.element.html(this.view("/lightbox/vipExpires"));
  console.log("vipExpires data", a);
}
), "button.remind click" : (function ()
{
  console.error("remind later for:", this.timeframe);
  store.set("gs.vipExpire.hasSeen" + GS.user.UserID, new Date().getTime());
  GS.lightbox.close();
}
), "button.renew click" : (function ()
{
  GS.lightbox.close();
  var a;
  a = this.data.subscriptionType.match("Anywhere") ? "anywhere" : this.data.subscriptionType.match("Plus") ? "plus" : this.data.bVip == true || this.data.bVip == 1 ? "vip" : "plus";
  a === "vip" || a === "anywhere" ? GS.lightbox.open("vipSignup", {bExtend : 1, vipPackage : this.data.bVip ? "vip" : a}) : GS.lightbox.open("signup", {gotoUpgrade : true, bExtend : 1, vipPackage : this.data.bVip ? "vip" : a});
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VipCancelController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  this.element.html(this.view("/lightbox/vipCancel"));
}
), "a.submit click" : (function ()
{
  console.log("vipCancel.a.submit.click form.submit");
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  var c = hex_md5(new Date().getTime()), d = {callbackMethod : c, callbackUrl : location.protocol + "//" + location.host + "/vipCallback.php"};
  GS.service.httpsFormSubmit((gsConfig.runMode == "production" ? "https://vip.grooveshark.com/" : "https://stagingvip.grooveshark.com/") + "disableRecurring.php", d);
  window[c] = this.callback((function (f)
{
  console.error("cancel win.callback", d, f, "success:", f.bSuccess, $("#httpsIframe"));
  GS.lightbox.close();
  location.hash = "/settings/subscriptions?r=" + new Date().getTime();
}
));
  return false;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.FollowInviterController", {onDocument : false}, {user : null, init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.user = a.user;
  console.log("lb.followinviter.init", this.user);
  if (this.user)
    {
      this.element.html(this.view("/lightbox/followInviter"));
      a = new GS.Models.DataString($.localize.getString("POPUP_FOLLOW_INVITER_MESSAGE"), {user : this.user.Username}).render();
      $("#message").html(a);
    }
}
), "button.submit click" : (function ()
{
  console.log("lb.followinviter submit");
  GS.user.addToUserFavorites(this.user.UserID);
  GS.lightbox.close();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ThemesController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  this.list = GS.Controllers.ThemeController.sortOrder;
  this.element.html(this.view("/lightbox/themes"));
  console.log("themes list", this.list);
  setTimeout(this.callback("renderThemes", this.list), 50);
}
), renderThemes : (function (a)
{
  $("#themes_content").slickbox({itemRenderer : this.themeItem, itemWidth : 154, itemHeight : 127, scrollPane : "#lightbox_content"}, a);
  $(window).resize();
}
), themeItem : (function (a)
{
  a = GS.Controllers.ThemeController.themes[a];
  return ["<a class=\"theme\" rel=\"", a.themeID, "\"><img src=\"", gsConfig.assetHost + "/themes/" + a.location + "/preview.jpg", "\"><span class=\"title\">", a.title, "</span><span class=\"author\">by ", a.author, "</span></a>"].join("");
}
), "a.theme click" : (function (a)
{
  console.log("switch theme", a.attr("rel"));
  GS.theme.setCurrentTheme(a.attr("rel"), true);
  GS.guts.logEvent("themeChangePerformed", {theme : $(".title", a).text()});
}
), "a.submit click" : (function ()
{
  console.log("themes.a.submit.click form.submit");
  $("form", this.element).submit();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ShareController", {onDocument : false, allowed : {album : ["email", "facebook", "stumbleupon", "twitter", "widget"], playlist : ["email", "facebook", "stumbleupon", "twitter", "widget"], song : ["email", "facebook", "stumbleupon", "twitter", "widget"], manySongs : ["widget"]}}, {service : "email", type : null, id : 0, ids : [], idsUrl : "", metadata : null, userInfo : {}, MAX_TWEET_LENGTH : 140, init : (function (a,b)
{
  this.update(b);
  this.positionSub = $.subscribe("lightbox.position", this.callback(this._repositionClips));
}
), destroy : (function (a)
{
  $.unsubscribe(this.positionSub);
  if (this.clipHandler)
    {
      this.clipHandler.destroy();
      this.clipHandler = null;
    }
  if (this.widgetClipHandler)
    {
      this.widgetClipHandler.destroy();
      this.widgetClipHandler = null;
    }
  this._super(a);
}
), "#share_message.twitter keyup" : (function (a)
{
  console.log("text change");
  var b = $(a).val();
  b.length <= this.MAX_TWEET_LENGTH ? $("#twitter_counter").html(b.length) : $(a).val(b.substring(0, this.MAX_TWEET_LENGTH));
}
), update : (function (a)
{
  console.log("gs.lightbox.share", a);
  this.service = a.service;
  this.type = a.type;
  this.id = a.id;
  this.userInfo = {};
  switch (a.type)
  {
    case "album":
      GS.Models.Album.getAlbum(this.id, this.callback((function (b)
{
  console.log("album loaded", b);
  this.metadata = b;
  this.metadata.name = b.AlbumName;
  this.metadata.by = b.ArtistName;
  this.metadata.url = "http://listen.grooveshark.com/" + b.toUrl().replace("#/", "");
  b.getSongs((function (c)
{
  $.each(c, (function (d,f)
{
  this.ids.push(f.SongID);
  this.idsUrl += f.SongID + ",";
}
));
}
));
  self.loadService();
}
)));
      break ;
    case "playlist":
      GS.Models.Playlist.getPlaylist(this.id, this.callback((function (b)
{
  this.metadata = b;
  this.metadata.name = b.PlaylistName;
  this.metadata.by = b.Username;
  this.metadata.url = "http://listen.grooveshark.com/" + b.toUrl().replace("#/", "");
  console.log("playlist loaded", b);
  this.loadService();
}
)));
      break ;
    case "song":
      GS.Models.Song.getSong(this.id, this.callback((function (b)
{
  this.metadata = b;
  this.metadata.name = b.SongName;
  this.metadata.by = b.ArtistName;
  this.metadata.url = "http://listen.grooveshark.com/" + b.toUrl().replace("#/", "");
  this.idsUrl = b.SongID;
  console.log("song loaded", b);
  this.loadService();
}
)));
      break ;
    case "manySongs":
      this.idsUrl = this.id.join(",");
      this.loadService();
      break ;
  }
}
), loadService : (function ()
{
  this.submitKey = "SHARE";
  this.showSubmit = true;
  switch (this.service)
  {
    case "facebook":
      if (GS.facebook.connected)
        GS.facebook.getFriends(this.callback((function (a)
{
  this.facebookFriends = a || [];
  this.submitKey = "SHARE_FACEBOOK_WALL";
  this.renderService();
  var b = [];
  $.each(this.facebookFriends, this.callback((function (c,d)
{
  b.push([d.id, d.name, d.name]);
}
)));
  a = new $.TextboxList("#facebook_share_to", {addOnBlur : true, bitsOptions : {editable : {growing : true, growingOptions : {maxWidth : 335}}}, plugins : {autocomplete : {placeholder : $.localize.getString("SHARE_FACEBOOK_PLACEHOLDER")}}, encode : this.callback((function (c)
{
  var d = [];
  if (c.length)
    {
      for (var f = 0;f < c.length;f++)
        c[f][0] && d.push(c[f][0]);
      this.element.find(".submit span").attr("data-translate-text", "SEND_INVITE").html($.localize.getString("SHARE_FACEBOOK_FRIENDS"));
    }
  else
    this.element.find(".submit span").attr("data-translate-text", "POST_TO_PROFILE").html($.localize.getString("SHARE_FACEBOOK_WALL"));
  return d.join(",");
}
))});
  a.plugins.autocomplete.setValues(b);
  a.addEvent("bitAdd", (function (c)
{
  (c.getValue())[1] === "" && c.hide();
}
));
  a.fireEvent("focus");
}
)), this.callback((function ()
{
  this.facebookFriends = [];
  this.submitKey = "SHARE_FACEBOOK_WALL";
  this.element.find(".error").show().find(".message").text($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR_FRIENDS"));
  this.renderService();
}
)));
      else
        {
          this.facebookFriends = [];
          this.submitKey = "SHARE";
          this.renderService();
        }
      GS.lightbox.trackLightboxView("share/facebook");
      break ;
    case "email":
      this.renderService();
      GS.user.UserID > 0 && GS.service.getContactInfoForFollowers(this.callback((function (a)
{
  var b = [];
  $.each(a, this.callback((function (c,d)
{
  b.push([d.UserID, d.Username + " " + d.Email, d.Username, d.Username]);
  this.userInfo[d.UserID] = d;
  this.userInfo[d.Username] = d;
}
)));
  a = new $.TextboxList("#share_to", {addOnBlur : true, bitsOptions : {editable : {growing : true, growingOptions : {maxWidth : 335}}}, plugins : {autocomplete : {placeholder : $.localize.getString("SHARE_EMAIL_PLACEHOLDER")}}, encode : this.callback((function (c)
{
  for (var d = [], f = 0;f < c.length;f++)
    if (c[f][0])
      d.push(c[f][0]);
    else
      c[f][1] && d.push(c[f][1]);
  return d.join(",");
}
))});
  a.plugins.autocomplete.setValues(b);
  a.addEvent("bitAdd", (function (c)
{
  (c.getValue())[1] === "" && c.hide();
}
));
  a.fireEvent("focus");
}
)), this.callback((function (a)
{
  console.error("failed grabbing contact info for followers", autocompleteTerms, a);
  $.publish("gs.notification", {type : "error", message : $.localize.getString("POPUP_FAIL_FANS_EMAIL_ONLY")});
}
)), {async : false});
      GS.lightbox.trackLightboxView("share/email");
      break ;
    case "twitter":
      this.monday = new Date().format("D") === "Mon" ? true : false;
      GS.service.getDetailsForBroadcast(this.id, this.callback((function (a)
{
  console.log("getDetailsForBroadcast", a);
  this.tinysong = a;
  this.submitKey = "SHARE_BROADCAST";
  this.renderService();
}
)));
      GS.lightbox.trackLightboxView("share/twitter");
      break ;
    case "stumbleupon":
      this.submitKey = "SHARE_STUMBLE";
      this.renderService();
      GS.lightbox.trackLightboxView("share/stumbleupon");
      break ;
    default:
      this.showSubmit = false;
      this.renderService();
      GS.lightbox.trackLightboxView("share/default");
      break ;
  }
}
), renderService : (function ()
{
  console.log("renderService", this.type, this.service);
  this.element.html(this.view("/lightbox/share/index"));
  if (this.service == "facebook")
    if (this.facebookFriends.length)
      $(".instruction", this.element).show();
    else
      GS.facebook.connected && $(".instruction", this.element).hide();
  GS.lightbox.positionLightbox();
  $("input:nth-child(2)", this.element).focus();
}
), _repositionClips : (function ()
{
  var a = this;
  if (($("#" + this.type + "_share_copy_url")).length)
    if (this.clipHandler)
      this.clipHandler.reposition(this.type + "_share_copy_url");
    else
      {
        this.clipHandler = new ZeroClipboard.Client();
        this.clipHandler.setText(this.metadata.url);
        this.clipHandler.setHandCursor(true);
        this.clipHandler.setCSSEffects(true);
        this.clipHandler.glue(this.type + "_share_copy_url");
        $("#" + this.type + "_share_copy_url").removeClass("copied").children("span").html($.localize.getString("SHARE_COPY"));
        this.clipHandler.addEventListener("complete", (function (b,c)
{
  console.log("Copied text to clipboard:\n" + c);
  $("#" + a.type + "_share_copy_url").addClass("copied").children("span").html($.localize.getString("SHARE_COPIED"));
}
));
      }
  if (this.service == "widget" && ($("#widget_copy")).length)
    if (this.widgetClipHandler)
      this.widgetClipHandler.reposition("widget_copy");
    else
      {
        this.widgetClipHandler = new ZeroClipboard.Client();
        this.widgetClipHandler.setText($("#share_message").val());
        this.widgetClipHandler.setHandCursor(true);
        this.widgetClipHandler.setCSSEffects(true);
        this.widgetClipHandler.glue("widget_copy");
        $("#widget_copy").removeClass("copied").children("span").html($.localize.getString("SHARE_COPY_TO_CLIPBOARD"));
        this.widgetClipHandler.addEventListener("complete", (function (b,c)
{
  console.log("Copied text to clipboard:\n" + c);
  $("#widget_copy").addClass("copied").children("span").html($.localize.getString("SHARE_COPIED_TO_CLIPBOARD"));
}
));
      }
}
), "a.submit, button.submit click" : (function (a,b)
{
  console.log("share.a.submit.click form subm");
  $("form", this.element).submit();
  b.preventDefault();
  b.stopPropagation();
}
), "form submit" : (function (a,b)
{
  console.log("SHARE FORM SUBMIT");
  b.preventDefault();
  b.stopPropagation();
  switch (this.service)
  {
    case "email":
      this.broadcastEmail(a, b);
      break ;
    case "stumbleupon":
      window.open("http://www.stumbleupon.com/submit?url=http://listen.grooveshark.com/" + this.metadata.toUrl().replace("#/", ""), "_blank");
      break ;
    case "twitter":
      if (this.type === "song")
        {
          var c = $("textarea[name=share_message]", this.element).val().replace(/ /, "+");
          c = c.replace(this.tinysong.tinySongURL, "");
          window.open("http://twitter.com/share?related=grooveshark&url=" + escape(this.tinysong.tinySongURL) + "&text=" + escape(c), "_blank");
          GS.lightbox.close();
        }
      else
        if (this.type === "playlist")
          {
            c = $("textarea[name=share_message]", this.element).val().replace(/ /, "+");
            window.open("http://twitter.com/share?related=grooveshark&url=http://listen.grooveshark.com/" + escape(this.metadata.toUrl().replace("#/", "")) + "&text=" + escape(c), "_blank");
            GS.lightbox.close();
          }
      break ;
    case "facebook":
      c = "http://listen.grooveshark.com/" + this.metadata.toUrl().replace("#/", "");
      if (GS.facebook.connected)
        {
          var d = $("#facebook_share_to").val() == "" ? [] : $("#facebook_share_to").val().split(","), f = $("textarea[name=facebookMessage]", a).val();
          if (d.length)
            for (var g = 0;g < d.length;g++)
              GS.facebook.postToFeed(d[g], c, f, this.callback("facebookSuccess"), this.callback("facebookFailed"));
          else
            GS.facebook.postLink(c, f, this.type, this.callback("facebookSuccess"), this.callback("facebookFailed"));
        }
      else
        {
          window.open("http://facebook.com/share.php?u=" + escape(c), "_blank");
          GS.lightbox.close();
        }
      break ;
  }
  return false;
}
), broadcastEmail : (function (a)
{
  var b = ($("input[name=to]", a).val() || "").split(","), c = $("textarea[name=message]", a).val(), d = [], f = $("#share_to").siblings(".textboxlist").find(".textboxlist-bit").not(".textboxlist-bit-box-deletable").filter(":last").text();
  a = $("input[name=privacy]", a).is(":checked");
  _.forEach(b, (function (g)
{
  if (this.userInfo[g])
    d.push({userID : this.userInfo[g].UserID, username : this.userInfo[g].Username, email : this.userInfo[g].Email});
  else
    g && d.push({email : g});
}
), this);
  f && d.push({email : f});
  if (d.length)
    {
      console.log("BROADCAST EMAIL", d);
      GS.service.sendShare(this.type, this.id, d, true, c, a, this.callback("broadcastEmailSuccess"), this.callback("broadcastEmailFailed"));
    }
  else
    this.broadcastEmailFailed();
}
), broadcastEmailSuccess : (function (a)
{
  var b = [];
  if (! a)
    return this.broadcastEmailFailed(a);
  if (a.Result && a.Result.emailsFailed && a.Result.emailsFailed.length > 0)
    {
      _.forEach(a.Result.emailsFailed, (function (c)
{
  switch (c.failReason)
  {
    case 1:
      b.push("<li>" + new GS.Models.DataString($.localize.getString("POPUP_SHARE_ERROR_ALREADY_MESSAGED"), {emailAddresses : c.person.email}).render() + "</li>");
      break ;
  }
}
));
      if (b.length)
        {
          a = "<ul>" + b.join("") + "</ul>";
          this.element.find(".error").show().find(".message").html(a);
        }
    }
  else
    {
      GS.lightbox.close();
      $.publish("gs.notification", {message : $.localize.getString("NOTIF_FACEBOOK_SHARE_" + this.type.toUpperCase())});
    }
}
), broadcastEmailFailed : (function ()
{
  console.log("lb.share.email failed", arguments);
  this.element.find(".error").text($.localize.getString("POPUP_FAIL_SHARING_FANS")).show();
  GS.lightbox.positionLightbox();
}
), facebookSuccess : (function (a)
{
  console.log("facebook share success", a);
  GS.lightbox.close();
}
), facebookFailed : (function (a)
{
  console.log("facebook share failed", a);
  this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR"));
  GS.lightbox.positionLightbox();
}
), "#share_options .email click" : (function ()
{
  this.service = "email";
  this.loadService();
}
), "#share_options .facebook click" : (function ()
{
  this.service = "facebook";
  this.loadService();
}
), "#share_options .stumble click" : (function ()
{
  this.service = "stumbleupon";
  this.loadService();
}
), "#share_options .twitter click" : (function ()
{
  this.service = "twitter";
  this.loadService();
}
), "#share_options .widget click" : (function ()
{
  this.service = "widget";
  this.loadService();
}
), "button.customize click" : (function (a,b)
{
  console.error("customize.click", a, b);
  this.type == "playlist" ? window.open("http://widgets.grooveshark.com/make?new&playlistid=" + this.id, "_blank") : window.open("http://widgets.grooveshark.com/make?new&songs=" + this.idsUrl, "_blank");
}
), "#lightbox .error .message .resetPerms click" : (function (a,b)
{
  b.preventDefault();
  GS.facebook.logout((function ()
{
  GS.facebook.login((function ()
{
  $("#lightbox").find(".error").hide();
}
), (function (c)
{
  c && c.error ? $("#lightbox").find(".error").find(".message").html($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR_PREPEND_ERROR") + "<br />" + $.localize.getString(c.error)) : $("#lightbox").find(".error").find(".message").text($.localize.getString("POPUP_SHARE_FACEBOOK_ERROR_PREPEND_ERROR"));
}
));
}
));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ForgetController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  this.element.html(this.view("/lightbox/forget"));
}
), "a.login click" : (function (a)
{
  console.log("forget.a.login click", $(a).get());
  GS.lightbox.close();
  GS.lightbox.open("login");
}
), "a.submit click" : (function ()
{
  console.log("forgot.a.submit.click form.submit");
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  console.log("forgot.form.submit");
  b.preventDefault();
  var c = $("input[name=username]", a).val();
  GS.service.userForgotPassword(c, this.callback(this.serviceSuccess), this.callback(this.serviceFailed));
  return false;
}
), serviceSuccess : (function (a)
{
  console.log("FORGOT SUCCESS", a);
  if (a && a.userID == 0 || ! a)
    return this.serviceFailed(a);
  GS.lightbox.close();
}
), serviceFailed : (function ()
{
  console.log("lb.servicefail", arguments);
  this.element.find(".error").show();
  GS.lightbox.positionLightbox();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.FeedbackController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.feedback.init");
  this.user = GS.user;
  this.feelings = $.localize.getString("POPUP_FEEDBACK_FEELINGS").split(",");
  this.element.html(this.view("/lightbox/feedback"));
}
), "a.submit, button.submit click" : (function ()
{
  $("form", this.element).submit();
}
), "#feedback_feeling change" : (function (a)
{
  $(a).siblings("span").text($(a).val());
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  var c = $("input[name=email]", a).val(), d = $("select[name=feeling]", a).val(), f = $("textarea[name=feedback]", a).val();
  if (f.length && c.length)
    {
      d = "User email address: " + c + "\nMood: " + d + "\nFeedback report:\n" + f;
      this.element.find(".error").hide();
      GS.service.provideVIPFeedback(c, d, this.callback(this.feedbackSuccess), this.callback(this.feedbackFailed));
    }
  else
    if (f.length)
      c.length || this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_FEEDBACK_ERROR_FEEDBACK"));
    else
      this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_FEEDBACK_ERROR_FEEDBACK"));
  return false;
}
), feedbackSuccess : (function (a)
{
  if (a && a.Success == 0 || ! a)
    return this.feedbackFailed(a);
  GS.lightbox.close();
  $.publish("gs.user.feedback", a);
}
), feedbackFailed : (function ()
{
  console.log("lb.feedbackfail", arguments);
  this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_FEEDBACK_ERROR"));
  GS.lightbox.close();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.BadHostController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.badhost.init");
  this.element.html(this.view("/lightbox/badHost"));
}
), "a.submit click" : (function ()
{
  console.log("invalidClient.a.submit.click refresh page");
  window.location.href = "http://www.grooveshark.com";
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.InteractionTimeController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.interactiontime.init");
  this.element.html(this.view("/lightbox/interactionTime"));
  this.subscribe("gs.player.paused", this.callback("onSongPause"));
}
), onSongPause : (function ()
{
  $("#lb_interacation_message").attr("data-translate-text", "POPUP_INTERACTION_MSG_PAUSED").html($.localize.getString("POPUP_INTERACTION_MSG_PAUSED"));
  $("#lb_interacation_submit").attr("data-translate-text", "POPUP_INTERACTION_RESUME").html($.localize.getString("POPUP_INTERACTION_RESUME"));
}
), "#lightbox a.upgrade click" : (function ()
{
  GS.player.pauseNextQueueSongID = false;
  GS.player.resumeSong();
  GS.lightbox.close();
}
), "#lightbox a.submit click" : (function ()
{
  $("form", this.element).submit();
}
), "#lightbox a.close click" : (function ()
{
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  GS.player.pauseNextQueueSongID = false;
  GS.player.resumeSong();
  GS.lightbox.close();
  return false;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.InvalidClientController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.invalidclient.init");
  this.element.html(this.view("/lightbox/invalidClient"));
}
), "a.submit click" : (function ()
{
  console.log("invalidClient.a.submit.click refresh page");
  window.location.reload(true);
}
), "button click" : (function ()
{
  console.log("invalidClient.a.submit.click refresh page");
  window.location.reload(true);
}
)});
  GS.Controllers.InviteInterface.extend("GS.Controllers.Lightbox.InviteController", {onDocument : false}, {userInfo : {}, googleContacts : null, facebookFriends : [], fbIDs : {}, slickbox : false, init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  a = _.orEqual(a, {});
  this.submitType = "email";
  this.element.html(this.view("/lightbox/invite/invite"));
  $("#lightbox_pane", this.element).html(this.view("/lightbox/invite/email"));
  if (GS.user.isLoggedIn)
    GS.service.getContactInfoForFollowers(this.callback("onFollowersSuccess"), this.callback("onFollowersFailed"));
  else
    {
      new $.TextboxList("#emails", {addOnBlur : true, bitsOptions : {editable : {growing : true, growingOptions : {maxWidth : $("#emails").innerWidth() - 10}}}});
      $("#signupInvite input.textboxlist-bit-editable-input").focus();
    }
  GS.facebook.getFriends(this.callback("onFacebookFriends"));
  this.subscribe("gs.facebook.status", this.callback((function ()
{
  GS.facebook.getFriends(this.callback("onFacebookFriends"));
}
)));
  if (a.gotoFacebook)
    $("#invite_options a.facebook_service").click();
  else
    a.gotoGoogle && $("#invite_options a.google_service").click();
}
), onFacebookFriendsCallback : (function ()
{
  console.log("onFacebookFriendscallback", this.facebookFriends.length);
  this.submitType === "facebook" && $("#invite_options a.facebook_service").removeClass("active").click();
}
), "a.submit click" : (function ()
{
  console.log("invite.a.submitEmail.click form subm");
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  console.log("invite.form.subm", this.submitType);
  b.preventDefault();
  this.element.find(".error").hide();
  this.formSubmit();
  return false;
}
), sendInviteSuccessCallback : (function ()
{
  GS.lightbox.close();
}
), googContactsSuccessCallback : (function ()
{
  this.submitType = "googleContacts";
  $("#lightbox_pane", this.element).html(this.view("/lightbox/invite/googleContacts"));
  $("ul.google_contacts", this.element).html(this.view("/shared/googleContacts")).show();
  GS.lightbox.positionLightbox();
  $("ul.google_contacts li:even").addClass("even contactRow_even");
  $("ul.google_contacts li:odd").addClass("odd contactRow_odd");
}
), facebookSuccessCallback : (function ()
{
  GS.lightbox.close();
}
), "#invite_options a click" : (function (a,b)
{
  b.preventDefault();
  if (! $(a).is(".active"))
    {
      $("#invite_options a.active").removeClass("active");
      $(a).addClass("active");
      switch ($(a).attr("name"))
      {
        case "email":
          this.submitType = "email";
          $("#lightbox_pane", this.element).html(this.view("/lightbox/invite/email"));
          break ;
        case "google":
          this.submitType = "googleLogin";
          $("#lightbox_pane", this.element).html(this.view("/lightbox/invite/googleLogin"));
          $("input[name=google_username]", this.element).focus();
          break ;
        case "facebook":
          this.submitType = "facebook";
          $("#lightbox_pane", this.element).html(this.view("/lightbox/invite/facebook"));
          this.slickbox = $(".facebook.contactsContainer", this.element).show().slickbox({itemRenderer : this.facebookItemRenderer, itemClass : this.facebookItemClass, itemWidth : 180, itemHeight : 45, verticalGap : 5, horizontalGap : 8, hidePositionInfo : true, listClass : "contacts facebook_contacts"}, this.facebookFriends);
          break ;
      }
    }
  GS.lightbox.positionLightbox();
  return false;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.LocaleController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  this.languages = [{locale : "ca", name : "Català"}, {locale : "cs", name : "\u010ce\u0161tina"}, {locale : "da", name : "Dansk"}, {locale : "de", name : "Deutsch"}, {locale : "en", name : "English"}, {locale : "es", name : "Español"}, {locale : "eu", name : "Euskara"}, {locale : "fr", name : "Français"}, {locale : "nl", name : "Nederlands"}, {locale : "lt", name : "Lietuvi\u0173"}, {locale : "pl", name : "Polski"}, {locale : "pt", name : "Português"}, {locale : "ru", name : "\u0420\u0443\u0441\u0441\u043a\u0438\u0439"}, {locale : "sk", name : "Sloven\u010dina"}, {locale : "fi", name : "Suomi"}, {locale : "sv", name : "Svenska"}, {locale : "tr", name : "Türkçe"}, {locale : "zh", name : "\u4e2d\u6587"}, {locale : "bg", name : "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438"}, {locale : "it", name : "Italiano"}, {locale : "ja", name : "\u65e5\u672c\u8a9e"}, {locale : "nb", name : "Norsk "}, {locale : "ro", name : "Român\u0103"}, {locale : "sl", name : "Sloven\u0161\u010dina"}];
  this.languages.sort((function (a,b)
{
  return a.name > b.name ? 1 : - 1;
}
));
  this.element.html(this.view("/lightbox/locale"));
}
), "a.language click" : (function (a)
{
  $.publish("gs.locale.update", $(a).attr("rel"));
  a = $(a).attr("rel");
  GS.guts.logEvent("localeChangePerformed", {locale : a});
  GS.guts.beginContext({locale : a});
  GS.lightbox.close();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.MaintenanceController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.maintenance.init");
  this.element.html(this.view("/lightbox/maintenance"));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.SessionBadController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.sessionbad.init");
  this.element.html(this.view("/lightbox/sessionBad"));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VIPOnlyFeatureController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.viponlyfeat.init");
  this.element.html(this.view("/lightbox/vipOnlyFeature"));
}
), "a.submit click" : (function ()
{
  GS.lightbox.close();
}
), "button.submit click" : (function ()
{
  GS.lightbox.close();
  GS.lightbox.open("signup");
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VipRequiredController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.viprequired.init");
  this.element.html(this.view("/lightbox/vipRequired"));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.NewPlaylistController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.songIDs = $.makeArray(a);
  this.element.html(this.view("/lightbox/newPlaylist"));
}
), "a.submit click" : (function ()
{
  $("form", this.element).submit();
}
), saveToSidebar : false, "form submit" : (function (a)
{
  var b = $("input[name=name]", a).val(), c = $("textarea[name=description]", a).val();
  this.saveToSidebar = $("input[name=save]", a).is(":checked");
  GS.user.createPlaylist(b, this.songIDs, c, this.callback("createSuccess"), this.callback("createFailed"));
  return false;
}
), createSuccess : (function (a)
{
  this.playlist = a;
  $("div.error", this.element).hide();
  this.saveToSidebar && this.playlist.addShortcut(true);
  GS.lightbox.close();
}
), createFailed : (function (a)
{
  console.error("playlist.new failed", a);
  $("div.error", this.element).text("Unable to create playlist").show();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RemovePlaylistSidebarController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  console.log("lb.removePlaylist.init", a);
  this.playlistID = a;
  this.playlist = GS.Models.Playlist.getOneFromCache(a);
  this.isSubscribed = this.playlist.isSubscribed();
  a = new GS.Models.DataString($.localize.getString("POPUP_DELETE_PLAYLIST_QUESTION"), {playlist : this.playlist.PlaylistName}).render();
  this.element.html(this.view("/lightbox/removePlaylistSidebar"));
  this.element.find("#message").html(a);
}
), "button.shortcut click" : (function (a,b)
{
  b.stopImmediatePropagation();
  this.playlist.removeShortcut();
  GS.lightbox.close();
}
), "button.playlist click" : (function (a,b)
{
  b.stopImmediatePropagation();
  this.playlist.isSubscribed() ? this.playlist.unsubscribe() : this.playlist.remove();
  GS.lightbox.close();
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  b.stopPropagation();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RenamePlaylistController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.playlistID = a;
  this.playlist = GS.Models.Playlist.getOneFromCache(a);
  this.element.html(this.view("/lightbox/renamePlaylist"));
}
), "a.submit click" : (function ()
{
  console.log("renameplaylist.a.submit.click form subm");
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  console.log("renameplaylist.form.subm");
  b.preventDefault();
  this.name = $("input[name=name]", a).val();
  this.description = $("textarea[name=description]", a).val();
  this.counter = 0;
  this.playlist.rename(this.name, this.callback(this.renameSuccess), this.callback(this.renameFailed));
  this.playlist.changeDescription(this.description, this.callback(this.renameSuccess), this.callback(this.renameFailed));
  return false;
}
), renameSuccess : (function ()
{
  this.counter++;
  if (this.counter === 2)
    {
      GS.lightbox.close();
      location.hash = this.playlist.toUrl();
    }
}
), renameFailed : (function (a)
{
  console.error("playlist.rename failed", a);
  $("div.error", this.element).text("An error occurred saving your changes.").show();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.DeletePlaylistController", {onDocument : false}, {user : null, init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.playlistID = a;
  this.playlist = GS.Models.Playlist.getOneFromCache(a);
  console.log("lb.deleteplaylist", this.playlistID, this.playlist);
  this.element.html(this.view("/lightbox/deletePlaylist"));
  a = new GS.Models.DataString($.localize.getString("POPUP_DELETE_PLAYLIST_MESSAGE"), {playlist : this.playlist.PlaylistName}).render();
  this.element.find("#message").html(a);
}
), "button.submit click" : (function (a,b)
{
  console.log("lb.deleteplaylist submit");
  b.stopImmediatePropagation();
  this.playlist.remove();
  GS.lightbox.close();
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  b.stopPropagation();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.AddSongsToPlaylistController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.songIDs = a;
  console.log("lb.addsongtoplaylist.init");
  this.playlists = [];
  for (b in GS.user.playlists)
    GS.user.playlists.hasOwnProperty(b) && this.playlists.push(GS.user.playlists[b]);
  this.element.html(this.view("/lightbox/addSongsToPlaylist"));
}
), "input.playlist click" : (function (a)
{
  $(a).is(":checked") ? $(a).closest("li.playlist").addClass("selected") : $(a).closest("li.playlist").removeClass("selected");
}
), "a.submit click" : (function ()
{
  console.log("addSongsToPlaylist.a.submit.click form subm");
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  console.log("addSongsToPlaylist.form.subm");
  b.preventDefault();
  var c, d, f = this, g = false;
  $("input:checked", this.element).each((function ()
{
  console.log("PLAYLIST ADD", this.value);
  c = this.value;
  if (d = GS.Models.Playlist.getOneFromCache(c))
    {
      g = true;
      d.addSongs(f.songIDs, null, true);
    }
}
));
  g && GS.lightbox.close();
  return false;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.BuySongController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.songID = a;
  (this.song = GS.Models.Song.getOneFromCache(this.songID)) ? GS.service.getAffiliateDownloadURLs(this.song.SongName, this.song.ArtistName, this.callback("urlsSuccess"), this.callback("urlsFailed")) : this.urlsFailed();
  this.element.html(this.view("/lightbox/buySong"));
}
), urlsSuccess : (function (a)
{
  console.log("getAffiliateDownloadURLs", a);
  var b = false, c = false;
  if (a.amazon && a.amazon.url)
    $("a.amazon", this.element).attr("href", a.amazon.url).show();
  else
    b = true;
  if (a.iTunes && a.iTunes.url)
    $("a.itunes", this.element).attr("href", a.iTunes.url).show();
  else
    c = true;
  b && c && this.urlsFailed();
}
), urlsFailed : (function ()
{
  $(".error", this.element).show();
}
), "a click" : (function ()
{
  GS.lightbox.close();
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.LastfmApprovalController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.lastfm.approval.init");
  this.user = GS.user;
  this.visited = false;
  this.element.html(this.view("/lightbox/lastfm_approval"));
}
), "a.gotoLastfm click" : (function (a,b)
{
  if (this.visited)
    {
      b.preventDefault();
      GS.lastfm.saveSession();
      GS.lightbox.close();
    }
  else
    {
      $(a).find("span").text("Back from Last.fm");
      this.visited = true;
    }
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RestoreQueueController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  $(this.element).html(this.view("/lightbox/restoreQueue"));
  console.log("restoreQueue.form.get", $("form", this.element).get());
}
), "a.submit click" : (function ()
{
  console.log("restoreQueue.a.submit.click form subm");
  GS.player.restoreQueue();
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  console.log("restoreQueue.form.subm");
  b.preventDefault();
  var c = $("input[name=save]", a).val();
  console.log("restore queue save: ", c);
  store.set("player.restoreQueue", c);
  c && GS.player.restoreQueue();
  GS.lightbox.close();
  return false;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.RadioClearQueueController", {onDocument : false}, {init : (function (a,b)
{
  this.update(b);
}
), update : (function (a)
{
  this.stationID = a;
  $(this.element).html(this.view("/lightbox/radioClearQueue"));
}
), "a.submit click" : (function ()
{
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  GS.player.clearQueue();
  GS.player.setAutoplay(true, this.stationID);
  GS.lightbox.close();
  return false;
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.NoFlashController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.noFlash.init");
  this.element.html(this.view("/lightbox/noFlash"));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.UnsupportedBrowserController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.unsupportedBrowser.init");
  this.element.html(this.view("/lightbox/unsupportedBrowser"));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.VideoController", {onDocument : false}, {embed : null, wasPlaying : false, init : (function (a,b)
{
  this.update(b);
  this.subscribe("gs.video.playing", this.callback("setVideo"));
  this.subscribe("gs.video.player.ready", this.callback("setVideos"));
}
), update : (function (a)
{
  this.options = a;
  this.element.html(this.view("/lightbox/video"));
  this.wasPlaying = GS.player.isPlaying;
  GS.player.pauseSong();
  GS.theme.currentTheme.sections.indexOf("#theme_lightbox_header") >= 0 && GS.theme.renderSection("#theme_lightbox_header");
  if (this.options.videos && this.options.videos.length)
    {
      this.element.addClass("videos");
      this.options.video.flashvars.index = this.options.index;
    }
  this.embed = this.options.video.embed("videoPlayer");
  $(window).resize();
}
), setVideo : (function (a)
{
  $("a.video").removeClass("active");
  $($("a.video").get(a.index)).addClass("active");
}
), setVideos : (function ()
{
  document.videoPlayer.setVideos(this.options.videos);
}
), "a.video click" : (function (a)
{
  if (document.videoPlayer.setVideo)
    {
      $("a.video").removeClass("active");
      $(a).addClass("active");
      document.videoPlayer.setVideo(parseInt($(a).attr("data-video-index")));
    }
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.ReAuthFacebookController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.reAuthFacebook.init");
  this.element.html(this.view("/lightbox/reAuthFacebook"));
}
), "#lightbox button.submit click" : (function ()
{
  GS.facebook.login((function ()
{
  GS.lightbox.close();
}
));
}
), "#lightbox button.close click" : (function ()
{
  GS.facebook.logout((function ()
{
  GS.lightbox.close();
}
));
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.SwfTimeoutController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.swftimeout.init");
  this.element.html(this.view("/lightbox/swfTimeout"));
  this.checkPlayer();
}
), checkPlayerTimeout : false, checkPlayerWait : 1000, checkPlayerCount : 0, checkPlayerMaxTries : 60, checkPlayer : (function ()
{
  console.error("player exists?", GS.player.player);
  if (GS.player.player)
    {
      GS.lightbox.trackLightboxView("swfTimeout/autoClosed");
      GS.lightbox.close();
    }
  else
    if (this.checkPlayerCount < this.checkPlayerMaxTries)
      {
        this.checkPlayerCount++;
        setTimeout(this.callback("checkPlayer"), this.checkPlayerWait);
      }
}
), "button.reload click" : (function ()
{
  window.location.reload(true);
}
)});
  GS.Controllers.BaseController.extend("GS.Controllers.Lightbox.DeactivateAccountController", {onDocument : false}, {init : (function ()
{
  this.update();
}
), update : (function ()
{
  console.log("lb.deactivate.init");
  this.element.html(this.view("/lightbox/deactivateAccount"));
}
), "a.submit, button.submit click" : (function ()
{
  $("form", this.element).submit();
}
), "form submit" : (function (a,b)
{
  b.preventDefault();
  var c = parseInt($("input[name=deactivate_reason]:checked", a).val(), 10), d = $("textarea[name=deactivate_other_details]", a).val(), f = parseInt($("input[name=deactive_contact]:checked", a).val(), 10), g = $("input[name=deactivate_confirm]", a).val();
  if (c && g.length)
    {
      this.element.find(".error").hide();
      GS.service.userDisableAccount(g, c, d, f, this.callback(this.disableSuccess), this.callback(this.disableFailed));
    }
  else
    if (c)
      g.length || this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_DEACTIVATE_ERROR_PASSWORD"));
    else
      this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_DEACTIVATE_ERROR_REASON"));
  return false;
}
), "input[name=deactivate_reason] change" : (function ()
{
  var a = parseInt($("#deactivateAccountForm input[name=deactivate_reason]:checked").val(), 10);
  $("#deactivateAccountForm textarea[name=deactivate_other_details]").attr("disabled", a !== 4);
}
), disableSuccess : (function (a)
{
  if (! a)
    return this.disableFailed(a);
  GS.auth.logout();
  GS.lightbox.close();
}
), disableFailed : (function ()
{
  console.log("lb.deactivate.fail", arguments);
  this.element.find(".error").show().find(".message").html($.localize.getString("POPUP_DEACTIVATE_ERROR"));
}
)});
  (function (a)
{
  function b()
  {
    var d = a.makeArray(arguments), f = (d.shift())[0], g = this;
    if (_.isEmpty(f))
      g.length = 0;
    else
      {
        f = f.replace(/\/$/, "").split("/");
        g.length = f.length;
        var h;
        _.forEach(f, (function (o,p)
{
  h = d[p];
  g[h] = o;
}
));
      }
  }
  GS.router = new (function ()
{
  var d = this;
  this._routes = [];
  this._history = [];
  this._nextHashShift = this._historyIndex = 0;
  this.hasForward = this.hasBack = false;
  this.get = (function (f,g,h)
{
  h = _.orEqual(h, this);
  if (! (f  instanceof  RegExp) && ! _.isString(f))
    console.error("invalid route, must be String or RegExp");
  else
    {
      if (_.isString(f))
        f = RegExp("^" + f + "$");
      this._routes.push({path : f, callback : g, context : h});
    }
}
);
  this.notFound = (function ()
{
  window.location.hash = "#/notFound";
}
);
  this.back = (function ()
{
  this.navHistory(- 1);
}
);
  this.forward = (function ()
{
  this.navHistory(1);
}
);
  this.navHistory = (function (f)
{
  var g = this._historyIndex + f;
  if (g >= 0 && g < this._history.length)
    {
      this._nextHashShift = f;
      window.location.hash = this._history[g];
    }
}
);
  this.performSearch = (function (f,g)
{
  if (g.indexOf("http://") == 0 && g.indexOf("tinysong") == - 1)
    {
      g = g.substring(7);
      var h = g.indexOf("#");
      if (h != - 1)
        window.location.hash = g.substring(h);
      else
        {
          h = g.indexOf("/");
          window.location.hash = "#" + g.substring(h);
        }
    }
  else
    {
      f = f.toLowerCase();
      if (f == "song")
        f = null;
      g = encodeURIComponent(g);
      window.location.hash = f ? "#/search/" + f + "?q=" + g : "#/search?q=" + g;
    }
}
);
  this.run = (function ()
{
  this.page = GS.Controllers.PageController;
  this.before = this.page.checkLock;
  a(window).hashchange((function ()
{
  var f = location.hash;
  if (f && f.length)
    f = location.href.substring(location.href.indexOf("#"));
  d._onHashChange(f);
}
));
  a(window).trigger("hashchange");
}
);
  this._onHashChange = (function (f)
{
  if (a.isFunction(this.before))
    if (! this.before())
      return ;
  window._gaq && _gaq.push && _gaq.push(["_trackPageview", f]);
  window.COMSCORE && COMSCORE.beacon && COMSCORE.beacon({c1 : 2, c2 : "8187464", c4 : (location.protocol + "//" + location.host + "/" + f).replace("#/", "")});
  if (this._nextHashShift != 0)
    {
      var g = this._historyIndex + this._nextHashShift;
      if (g >= 0 && g < this._history.length && this._history[g] == f)
        this._historyIndex = g;
      else
        this._nextHashShift = 0;
    }
  if (this._nextHashShift == 0)
    {
      this._history = this._history.slice(0, this._historyIndex + 1);
      f && this._history.push(f);
      this._historyIndex = this._history.length - 1;
    }
  this._nextHashShift = 0;
  g = this._parseQueryString(f);
  var h = f.replace(c, "");
  if (f = this._getRouteForPath(h))
    {
      h = h.match(f.path);
      h.shift();
      g.splat = h;
      a.isFunction(f.callback) && f.callback.call(f.context, g);
      this.hasBack = this._history.length && this._historyIndex > 0;
      this.hasForward = this._history.length && this._historyIndex < this._history.length - 1;
      a.publish("gs.router.history.change");
    }
  else
    this.notFound();
}
);
  this._getRouteForPath = (function (f)
{
  var g, h;
  for (h = 0;h < this._routes.length;h++)
    {
      var o = this._routes[h];
      if (o.path.test(f))
        {
          g = o;
          break ;
        }
    }
  return g;
}
);
  this._parseQueryString = (function (f)
{
  var g = {}, h, o;
  if (f = f.match(c))
    {
      f = f[1].split("&");
      for (o = 0;o < f.length;o++)
        {
          h = f[o].split("=");
          g = this._parseParamPair(g, decodeURIComponent(h[0]), decodeURIComponent(h[1]));
        }
    }
  return g;
}
);
  this._parseParamPair = (function (f,g,h)
{
  if (f[g])
    if (_isArray(f[g]))
      f[g].push(h);
    else
      f[g] = [f[g], h];
  else
    f[g] = h;
  return f;
}
);
}
)();
  GS.router.get("", (function ()
{
  var d = window.location, f = d.href.substring(d.href.indexOf(d.host) + d.host.length);
  d.replace(d.protocol + "//" + d.host + "#" + f);
}
));
  GS.router.get("#/", (function (d)
{
  var f = _.defined(d.search);
  this.page.activate("home").index(f);
  GS.guts.handlePageLoad("home", {});
  if (_.defined(d.inviteCode))
    {
      gsConfig.inviteCode = d.inviteCode;
      f = new Date().valueOf() + 1209600000;
      try
        {
          store.set("lastInviteCode", {inviteCode : d.inviteCode, expires : f});
        }
      catch (g)
        {}
    }
  if (d.hasOwnProperty("changetheme") && _.defined(d.themeid))
    _.defined(d.dfp) && d.dfp == "true" ? GS.theme.setCurrentThemeDFPOverride(d.themeid) : GS.theme.setCurrentTheme(d.themeid, true);
  d.hasOwnProperty("themes") && GS.lightbox.open("themes");
  d.hasOwnProperty("password") && GS.lightbox.open("forget");
  d.hasOwnProperty("invite") && GS.lightbox.open("invite");
  d.hasOwnProperty("signup") && GS.lightbox.open("signup");
  d.hasOwnProperty("login") && GS.lightbox.open("login");
}
));
  GS.router.get("#/notFound", (function ()
{
  this.page.activate("home").notFound();
}
));
  GS.router.get(/^#\/user\/(.*)\/?$/, (function (d)
{
  d = new b(d.splat, "login", "id", "section", "subpage");
  var f = this.page.activate("user");
  switch (d.length)
  {
    case 1:
      f.music(d.login, null);
      break ;
    case 2:
      f.index(d.login, d.id);
      break ;
    case 3:
      f[d.section](d.login, d.id, d.section);
      break ;
    case 4:
      f[d.section](d.login, d.id, d.subpage);
      break ;
    default:
      this.notFound();
  }
  GS.guts.handlePageLoad("user", d);
}
));
  GS.router.get(/^#\/playlist\/(.*)\/?/, (function (d)
{
  d = new b(d.splat, "name", "id", "subpage");
  var f = this.page.activate("playlist");
  switch (d.length)
  {
    case 2:
    case 3:
      var g = _.orEqual(d.subpage, "music");
      f.index(d.id, g);
      break ;
    default:
      this.notFound();
  }
  GS.guts.handlePageLoad("playlist", d);
}
));
  GS.router.get(/^#\/s(?:ong)?\/(.*)\/?/, (function (d)
{
  d = new b(d.splat, "name", "token", "subpage");
  var f = this.page.activate("song");
  switch (d.length)
  {
    case 2:
    case 3:
      var g = _.orEqual(d.subpage, "related");
      f.index(d.token, g);
      break ;
    default:
      this.notFound();
  }
  GS.guts.handlePageLoad("song", d);
}
));
  GS.router.get(/^#\/(album|artist)\/(.*)\/?/, (function (d)
{
  var f = d.splat.shift(), g = this.page.activate(f);
  d = new b(d.splat, "name", "id", "subpage");
  switch (d.length)
  {
    case 2:
    case 3:
      var h = _.orEqual(d.subpage, "music");
      g.index(d.id, h);
      break ;
    default:
      this.notFound();
  }
  GS.guts.handlePageLoad(f, d);
}
));
  GS.router.get(/^#\/search\/?(.*)?\/?/, (function (d)
{
  var f = this.page.activate("search"), g = new b(d.splat, "type");
  f.index(g.type, d.q || d.query);
  if (g.type)
    g.subpage = g.type;
  else
    g.type = "everything";
  GS.guts.handlePageLoad("search", g);
}
));
  GS.router.get(/^#\/(.*)\/?$/, (function (d)
{
  d = new b(d.splat, "page", "type");
  var f = this.page.activate(d.page);
  _.defined(f) ? f.index(d.type) : this.notFound();
  GS.guts.handlePageLoad(d.page, d);
}
));
  var c = /\?([^#]*)$/;
}
)(jQuery);
  (function (a)
{
  function b()
  {
    clearTimeout(d);
    d = setTimeout((function ()
{
  var o = GS.player.getPlaybackStatus();
  if (o && o.status === GS.player.PLAY_STATUS_PLAYING && ! GS.user.IsPremium)
    {
      GS.player.pauseNextSong();
      GS.lightbox.open("interactionTime");
    }
}
), f);
  }
  var c = 0;
  a(window).resize((function ()
{
  var o = false;
  if (c != a("#application").width())
    {
      c = a("#application").width();
      o = true;
    }
  a("#content").css({height : a(window).height() - a("#header").height() - a("#footer").height()});
  o ? a("#sidebar").css({height : a(window).height() - a("#header").height() - a("#footer").height(), width : c < 620 ? 100 : c < 844 ? 150 : c < 1100 ? 175 : 200}) : a("#sidebar").css({height : a(window).height() - a("#header").height() - a("#footer").height()});
  a("#page_wrapper").css({height : a(window).height() - a("#header").height() - a("#footer").height(), width : a("#application").width() - a("#sidebar").width()});
  a("#page_header .meta").outerWidth() + a("#page_header .page_options").outerWidth() + 50 > a("#page_header").width() && a("#page_nav").addClass("page_nav_collapsed");
  a("#page_content").css({height : a("#page_wrapper").height() - a("#page_header").height() - a("#page_footer").height() - a("#theme_page_header:visible").height(), width : a("#page_wrapper").width()});
  a("#page_content .page_column_fluid").each((function ()
{
  var p = 0, q = a("#page_wrapper").width();
  a(this).siblings(".page_column").each((function ()
{
  a(this).height(a("#page_content").height());
  if (a(this).is(".page_filter"))
    if (c < 844)
      a(this).addClass("hide");
    else
      if (c < 1100 && p > 0)
        a(this).addClass("hide");
      else
        {
          a(this).removeClass("hide");
          p += a(this).outerWidth();
        }
  else
    p += a(this).outerWidth();
}
));
  a(this).is(".scrollable") ? a(this).css({width : q - p, height : a("#page_content").height()}) : a(this).css({width : q - p});
}
));
  a.publish("window.resize");
  a(".gs_grid:visible").resize();
}
));
  a(document).ready((function ()
{
  document.body.scroll = "no";
  a("#main,#page_wrapper").scroll((function (o)
{
  if (a(this).scrollTop() > 0)
    {
      console.warn("Fixing Scroll", o);
      a(this).scrollTop(0);
    }
  return false;
}
));
}
));
  a(window).unload((function ()
{
  GS.user.isLoggedIn && GS.user.storeData();
  GS.theme && GS.theme.savePreferences();
}
));
  var d, f = 3600000;
  a("body").konami((function ()
{
  a.publish("gs.playlist.play", {playlistID : 40563861, playOnAdd : true});
}
));
  a("body").bind("mousemove", b);
  a("body").bind("keydown", b);
  b();
  GS.windowResizeTimeout = null;
  GS.windowResizeWait = 10;
  a(window).resize();
  if (window.gsViewBundles)
    GS.Controllers.BaseController.viewBundles = window.gsViewBundles;
  if (window.gsBundleVersions)
    GS.Controllers.BaseController.bundleVersions = window.gsBundleVersions;
  if (window.gsPageBundle && a.isPlainObject(gsPageBundle))
    for (g in gsPageBundle)
      if (gsPageBundle.hasOwnProperty(g))
        a.View.preCached[g] = gsPageBundle[g];
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
  GS.ad = GS.Controllers.AdController.instance();
  GS.guts = GS.Controllers.GUTSController.instance();
  GS.locale = GS.Controllers.LocaleController.instance();
  GS.facebook = GS.Controllers.FacebookController.instance();
  GS.lastfm = GS.Controllers.LastfmController.instance();
  GS.google = GS.Controllers.GoogleController.instance();
  GS.search = {search : "", type : "", lastSearch : "", lastType : ""};
  GS.loadedPage = location.hash;
  window.Grooveshark = GS.Controllers.ApiController.instance();
  a(document).bind("keydown", "ctrl+a", (function ()
{
  var o, p = [], q = a(".gs_grid:last").controller();
  if (q)
    {
      for (o = 0;o < q.dataView.rows.length;o++)
        {
          p.push(o);
          q.selectedRowIDs.push(q.dataView.rows[o].id);
        }
      q.grid.setSelectedRows(p);
      q.grid.onSelectedRowsChanged();
    }
  return false;
}
));
  (function ()
{
  var o = new a.Event("remove"), p = a.fn.remove;
  a.fn.remove = (function ()
{
  a(this).trigger(o);
  p.apply(this, arguments);
}
);
}
)();
  g = true;
  var h = _.browserDetect();
  switch (h.browser)
  {
    case "chrome":
      if (h.version >= 6)
        g = false;
      break ;
    case "safari":
      if (h.version >= 5)
        g = false;
      break ;
    case "msie":
      if (h.version >= 7 && h.version < 9)
        g = false;
      break ;
    case "firefox":
      if (h.version >= 3)
        g = false;
      break ;
    case "mozilla":
      if (h.version >= 1.9)
        g = false;
      break ;
    case "opera":
      if (h.version >= 11)
        g = false;
      break ;
    case "adobeair":
      g = false;
      break ;
  }
  g && GS.lightbox.open("unsupportedBrowser");
  document.referrer.match(location.protocol + "//" + location.host) || a.getJSON("http://artists.grooveshark.com/referrers.php?jsoncallback=?", {referrer : document.referrer, page : location.href});
  window.playSongFromAd = (function (o)
{
  try
    {
      o = o || [];
      typeof o == "object" && o.constructor == Array || (o = [o]);
      GS.player.addSongsToQueueAt(o, null, true);
    }
  catch (p)
    {}
}
);
  GS.router.run();
  GS.airbridge.ready();
}
)(jQuery);
  window.onbeforeunload = (function (a)
{
  GS.player.storeQueue();
  var b;
  a = a || window.event;
  if (! GS.user.isLoggedIn && GS.user.isDirty)
    {
      b = $.localize.getString("ONCLOSE_PROMPT_LOGIN");
      GS.lightbox.open("login");
    }
  if (GS.player.isPlaying)
    b = $.localize.getString("ONCLOSE_PLAYING");
  if (! GS.Controllers.PageController.ALLOW_LOAD)
    b = GS.Controllers.PageController.confirmMessage;
  if (b)
    {
      if (a)
        a.returnValue = b;
      return b;
    }
}
);