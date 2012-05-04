var song;
(function(){
	"use strict";
	var baseSong = createSongBase(suMapModel);
	song = function(omo, player, mp3_search){
		this.init.call(this, omo, player, mp3_search);
		var _this = this;
		this.updateNavTexts();

		this.on('view', function(no_navi, user_want){
			su.views.show_track_page(this, no_navi);
			if (user_want){
				//fixme - never true!
				if (_this.wasMarkedAsPrev()){
					su.track_event('Song click', 'previous song');
				} else if (_this.wasMarkedAsNext()){
					su.track_event('Song click', 'next song');
				} else if (_this.state('play')){
					su.track_event('Song click', 'zoom to itself');
				}
			}
			
		});
		
		this.mf_cor = new mfCor(this, this.omo);
		this.addChild(this.mf_cor);
		this.mf_cor.on('before-mf-play', function(mopla) {
			_this.player.changeNowPlaying(_this);
			_this.findNeighbours();
			_this.mopla = mopla;
		});
		this.regDOMDocChanges(function() {
			if (su.ui.nav.daddy){
				var child_ui = _this.getFreeView('nav');
				if (child_ui){
					su.ui.nav.daddy.append(child_ui.getC());
					child_ui.appended();
				}
			}
		});
		this.watchStates(['files_search', 'marked_as'], function(files_search, marked_as) {
			if (marked_as && files_search && files_search.complete){
				this.updateState('can-expand', true);
			} else {
				this.updateState('can-expand', false);
			}
		});
		this.watchState('mp-show', function(opts) {
			var
				_this = this,
				oldCb = this.makePlayableOnNewSearch;

			if (opts){
				if (!oldCb){
					this.makePlayableOnNewSearch = function() {
						_this.makeSongPlayalbe(true);
					};
					this.mp3_search.on('new-search', this.makePlayableOnNewSearch);
					
				}
			} else {
				if (oldCb){
					this.mp3_search.off('new-search', oldCb);
					delete this.makePlayableOnNewSearch;
				}
			}
		});
	};

	baseSong.extendTo(song, {
		ui_constr: {
			main: songUI,
			nav: trackNavUI
		},
		page_name: 'song page',
		updateFilesSearchState: function(complete, get_next){
			this._super.apply(this, arguments);
			if (this.isHaveTracks('mp3')){
				this.plst_titl.markAsPlayable();
			}
		},
		mlmDie: function() {
			this.hide();
		}
	});
	//song.prototype = song_methods;
})();
