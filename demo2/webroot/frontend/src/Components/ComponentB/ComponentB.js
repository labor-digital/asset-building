/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.componentB').addEventListener('click', e => {
		import('../../DynamicComponents/ComponentC/ComponentC');
	});
}, false);
