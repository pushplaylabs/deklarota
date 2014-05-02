define(['provoda', 'spv', 'app_serv', 'js/libs/BrowseMap',
'./user_music_lfm', './Cloudcasts', './LoadableListBase', './SongsList',
'js/modules/declr_parsers'],
function(provoda, spv, app_serv, BrowseMap,
user_music_lfm, Cloudcasts, LoadableListBase, SongsList,
declr_parsers) {
'use strict';
var localize = app_serv.localize;

var SongFansList = function(){};
user_music_lfm.LfmUsersList.extendTo(SongFansList, {
	init: function(opts, params) {
		this._super.apply(this, arguments);
		this.initStates(params);
	},
	getRqData: function() {
		return {
			artist: this.state('artist_name'),
			track: this.state('track_name')
		};
	},
	'nest_req-list_items': [
		declr_parsers.lfm.getUsers('topfans', true),
		['lfm', 'get', function() {
			return ['track.getTopFans', this.getRqData()];
		}]
	],
	beforeReportChange: function(list) {
		list.sort(function(a,b ){return spv.sortByRules(a, b, [
			{
				field: function(item) {
					var image = item.state('lfm_img');
					image = image && (image.lfm_id || image.url);
					if (image && image.search(/gif$/) == -1){
						return 1;
					} else if (!image) {
						return 2;
					} else {
						return 3;
					}
				}
			}
		]);});
		return list;
	}
});

var parseVKPostSong = spv.mmap({
	props_map: {
		artist: null,
		track: 'title'
	}
});


var VKPostSongs = function() {};
SongsList.extendTo(VKPostSongs, {
	init: function() {
		this._super.apply(this, arguments);
		this.initStates();
	},
/*	'nest_req-songs-list': [
		declr_parsers.lfm.getUsers('topfans', true),
		['lfm', 'get', function() {
			return ['track.getTopFans', this.getRqData()];
		}]
	]*/
});

var VKPostsList = function() {};
LoadableListBase.extendTo(VKPostsList, {
	init: function(opts, params) {
		this._super.apply(this, arguments);
		//this.sub_pa_params = params;
		this.initStates(params);
	},
	model_name: 'justlists',
	hp_bound: {
		artist_name: null,
		track_name: null
	},
	//model_name: 'cloudcasts_list',
	splitItemData: function(data) {
		return [data.props, {
			subitems: {
				'songs-list': spv.getTargetField(data, 'attachments.songs')
			}
		}];
	},
	
	makeDataItem: function(data, params) {
		return this.initSi(VKPostSongs, data, params);
	},
	
	/*
	makeDataItem: function(data) {
		var item = this.app.start_page.getSPI('cloudcasts/' + this.app.encodeURLPart(data.key), true);
		item.addRawData(data);
		return item;
	},
	*/
	'nest_req-lists_list': [
		[{
			is_array: true,
			source: 'response.items',
			props_map: {
				props: {
					nav_title: 'owner_id',
					url_part: ['urlp', 'owner_id']
				},
				attachments: [function(array) {
					if (!array) {
						return;
					}
					var songs = [];
					for (var i = 0; i < array.length; i++) {
						var cur = array[i];
						if (cur.type == 'audio') {
							songs.push(parseVKPostSong(cur.audio));
						}
					}
					return {
						songs: songs
					};
				}, 'attachments']

			}
		},
		true,
		[
			['vk_users',
			function(r) {
				return r.response.profiles;
			}]
		]],
		['vk_api', 'get', function() {
			return ['newsfeed.search', {
				q: this.head_props.artist_name + ' ' + this.head_props.track_name + ' has:audio',
				extended: 1
			}, null];
		}]
	]
});

var SongCard = function() {};
BrowseMap.Model.extendTo(SongCard, {
	model_name: 'songcard',
	init: function(opts, params) {
		this._super.apply(this, arguments);
		this.sub_pa_params = {
			artist_name: params.artist_name,
			track_name: params.track_name
		};
		this.initStates(params);
		this.on('state_change-mp_show', function(e) {
			if (e.value){
				this.fullInit();

				var fans = this.getNesting('fans');
				if (fans){
					fans.preloadStart();
				}
			}
		});
	},
	'compx-nav_title': {
		depends_on: ['artist_name', 'track_name'],
		fn: function(artist_name, track_name) {
			return artist_name + ' - ' + track_name;
		}
	},

	initForSong: function() {
		var fans = this.getSPI('fans', true);
		this.updateNesting('fans', fans);
		fans.preloadStart();


		var cloudcasts = this.getSPI('cloudcasts', true);
		this.updateNesting('cloudcasts', cloudcasts);


		this.updateNesting('vk_posts', this.getSPI('vk_posts'));
		this.getSPI('vk_posts').preloadStart();

	},
	fullInit: function() {
		var artist_name = this.state('artist_name');
		if (artist_name){
			var artcard = this.app.getArtcard(this.state('artist_name'));
			if (artcard){
				this.updateNesting('artist', artcard);
			}
		}
		this.updateNesting('fans', this.getSPI('fans'));
	},
	sub_pa: {
		'fans':{
			constr: SongFansList,
			title: localize('Top fans')
		},
		'cloudcasts': {
			constr: Cloudcasts.SongcardCloudcasts,
			title: 'Cloudcasts'
		},
		'vk_posts': {
			constr: VKPostsList,
			title: 'Posts from vk.com'
		}
	}
});
return SongCard;
});