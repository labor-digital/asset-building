/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
document.addEventListener('DOMContentLoaded', () => {
	console.log('loaded');
	document.querySelector('.componentA').addEventListener('click', e => {
		alert('component A: ' + e.type);
	});
}, false);
