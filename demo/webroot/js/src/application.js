/**
 * Created by Martin Neundorfer on 10.08.2018.
 * For LABOR.digital
 */
import {registerBlock} from "blocks.js/src/BlockHelpers";
import {BaseBlock} from "blocks.js/src/BaseBlock";


// import "./console";
// import "./es6"
// import {tester} from "./es6";
// import "g8-framework/src/base.framework";
// console.log('done');
// tester();
//
// import "g8-framework/src/base.last";

registerBlock('test', class extends BaseBlock {
	get classes () {
		return {
			'active': 'dashboard__favButton--active'
		}
	}

	constructor($this, context){
		super($this, context);
		this.obj('button').on('click', this._onButtonClick.bind(this));
		this.obj('container').on('click', this._onContainerClick.bind(this));
		this.obj('extFooBar').css('background-color', 'purple').html(this.tpl('mustache', {
			'what': 'World'
		}))
	}

	_onButtonClick(e){
		console.log(this, e.currentTarget);
		this.obj('container').css('background-color', 'green').toggleClass(this.classes.active);
	}

	_onContainerClick(e){
		$(e.currentTarget).css('background-color', '');
	}
});

$(function(){
	$(document).trigger("domChange");
});
