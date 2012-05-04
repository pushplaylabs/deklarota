var searchSectionUI = function(){};

suServView.extendTo(searchSectionUI, {
	init: function(md){
		this._super();
		this.md = md;
		this.createCon();
		this.createHead();
		this.button = md.button;

		this.gc = this.header ? this.header.add(this.c) : this.c;

		this.setModel(md);
	},
	getC: function(){
		return this.gc;	
	},
	createHead: function(){
		if (this.head_text){
			this.header = $('<h4></h4>').hide().text(this.head_text);

		}
	},
	createCon: function(){
		this.c = $('<ul></ul>');
		if (this.c_class){
			this.c.addClass(this.c_class);
		}
	},
	state_change: {
		active: function(state){
			if (state){
				this.c.addClass('active-section');
				if (this.header){
					this.header.show();
				}
				
			} else {
				this.c.removeClass('active-section');
				if (this.header){
					this.header.hide();
				}
				
			}
		},
		changed: function(time){
			this.appendChildren();
		},
		loading: function(state){
			if (this.header){
				if (state){
					this.header.addClass('loading');
				} else {
					this.header.removeClass('loading');
				}
			}
			
		},
		no_results_text: function(text){
			if (text) {
				if (this.message){
					this.message.remove();
				}
				this.message = $('<li></li>').text(text);
				if (this.button_c){
					this.button_c.before(this.message);
				} else{
					this.c.append(this.message);
				}
			} else {
				if (this.message){
					this.message.remove();
					delete this.message
				}
			}
		},
		'odd-section': function(state){
			if (state){
				this.c.addClass('odd-section')
			} else {
				this.c.removeClass('odd-section')
			}
		}
	},
	appendChildren: function(){
		var _this = this;

		if (this.button){
			var bui = this.button.getFreeView();
			if (bui){
				this.button_c = bui.getC().appendTo(this.c);
			}
			
		}

		var rendering_list = this.md.rendering_list;
		var last_rendered = this.md.edges_list;
		if (rendering_list){
			for (var i = 0; i < rendering_list.length; i++) {

				var cur_ui = rendering_list[i].getFreeView();
				if (cur_ui){
					var ccon = cur_ui.getC();
					if (this.button_c){
						this.button_c.before(ccon);
					} else{
						this.c.append(ccon);
					}
				}

			};
			for (var i = 0; i < last_rendered.length; i++) {
				
				var cur = rendering_list[last_rendered[i]];
				if (cur){
					cur.updateState('bordered', true)
				}
				
			};
		}
		
		
	}
});


var searchSection = function(sectionInfo){};

provoda.Model.extendTo(searchSection, {
	init: function(){
		this._super();
		this.edges_list = [];
		this.rendering_list = [];
	},
	ui_constr: searchSectionUI,
	setActive: function(){
		this.updateState('active', true);
		this.trigger('state-change', true);
	},
	setInactive: function(){
		
		this.updateState('active', false);
		this.trigger('state-change', false);
	},
	loading: function(){
		this.updateState('loading', true);
	},
	loaded: function(){
		this.updateState('loading', false);
	},
	markOdd: function(remove){
		this.updateState('odd-section', !remove)
	},
	getItems: function(no_button){
		var r = [].concat(this.rendering_list);
		if (!no_button && this.button && !this.button.state('disabled')){
			r.push(this.button)
		}
		return r;
	},
	hideButton: function(){
		if (this.button){
			this.button.hide();

		}
	},
	showButton: function(){
		if (this.button){
			this.button.show();
		}
	},
	setButtonText: function(have_results, q){
		if (this.button && this.getButtonText){
			this.button.setText(this.getButtonText(have_results, q));
		}
		
	},
	doesNeed: function(q){
		return q == (this.r && this.r.query);
	},
	scratchResults: function(q){
		if (!q && !this.no_results_text){
			this.setInactive();
		}
		this.loaded();
		this.removeOldResults();
		this.updateState('no_results_text', false);
		
		
		this.r = new searchResults(q);
		this.rendering_list = [];
		this.edges_list = []
		this.setButtonText(false, q);
		this.showButton();
		this.trigger('items-change');
	},
	removeOldResults: function(){

		for (var i = 0; i < this.rendering_list.length; i++) {
			this.rendering_list[i].die();
		};
		
	},
	renderSuggests: function(no_more_results, preview){

		
		var slice = preview && !this.edges_list.length,
			last_rendered = this.edges_list && this.edges_list[this.edges_list.length-1], 
			start = (last_rendered) || 0,
			end   = (slice && Math.min(this.r.length, start + 5)) || this.r.length;
		
		if (this.r.length){
			for (var i=start; i < end; i++) {
				this.rendering_list.push(this.r[i]);
			};
			this.edges_list.push(end);
		} else{
			if (no_more_results){
				if (this.no_results_text){
					this.updateState('no_results_text', this.no_results_text);
					this.hideButton();
				} else{
					this.setInactive();
				}
				
				
			}
		}

		this.updateState('no_more_results', no_more_results);
		this.updateState('preview', preview);
		this.updateState('changed', new Date());

		this.setButtonText(!!this.r.length, this.r.query);
		this.trigger('items-change', this.r.length);
	}
});