/**
 * Created by Martin Neundorfer on 10.08.2018.
 * For LABOR.digital
 */
let test = ['hello', 'world'];
test.forEach((v,k) => {
	console.log(v);
});

// "win" is injected by "jsCompat"
console.log(win);

export function tester(){
	console.log('test');
}