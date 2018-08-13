/*
init: {
	wrap: el,
	loop: true||false,
	event: '',
	dir: 'x||y',
	startPage: 'num',
	dots: els,
	activeClass: ''
}
*/

let normalAttr = [
	'width',
	'height',
	'left',
	'top',
	'bottom',
	'right',
	'marginLeft',
	'marginTop',
	'marginBottom',
	'marginRight'
];

let css3Attr = [
	'rotate',
	'rotateX',
	'rotateY',
	'skewX',
	'skewY',
	'translateX',
	'translateY',
	'translateZ',
	'scale',
	'scaleX',
	'scaleY'
];

function css(ele, attr, val){
	if(typeof attr === 'string' && typeof val === 'undefined'){
		if(css3Attr.indexOf(attr) !== -1){
			return transform(ele, attr);
		}
		let ret = getComputedStyle(ele)[attr];
		return normalAttr.indexOf(attr) !== -1 ? parseFloat(ret) : ret * 1 === ret * 1 ? ret*1 : ret;
	}

	function setAttr(attr, val){
		if(css3Attr.indexOf(attr) !== -1){
			return transform(ele, attr, val);
		}
		if(normalAttr.indexOf(attr) !== -1){
			ele.style[attr] = val ? val + 'px' : val;
		}else{
			ele.style[attr] = val;
		}
	}

	// 批量设置
	if(typeof attr === 'object'){
		for(let key in attr){
			setAttr(key, attr[key]);
		}
		return;
	}

	setAttr(attr, val);
}

function transform(el, attr, val){
	el._transform = el._transform || {};

	if(typeof val === 'undefined'){
		return el._transform[attr];
	}

	el._transform[attr] = val;

	let str = '';

	for(let key in el._transform){
		let value = el._transform[key];
		switch (key) {
			case 'translateX':
			case 'translateY':
			case 'translateZ':
				str += `${key}(${value}px) `;
				break;
			case 'rotate':
			case 'rotateX':
			case 'rotateY':
			case 'skewX':
			case 'skewY':
				str += `${key}(${value}deg) `;
				break;
			default:
				str += `${key}(${value}) `;
		}
	}

	el.style.transform = str.trim();
}

function mTween(props){
	let el = props.el;

	if(el.mTween) return;

	let duration = props.duration || 400,
		fx = props.fx || 'easeOut',
		cb = props.cb,
		attrs = props.attrs || {};
	let beginData = {}, changeData = {};

	for(let key in attrs){
		beginData[key] = css(el, key);
		changeData[key] = attrs[key] - beginData[key];
	}

	let startTime = Date.now();

	(function startMove(){
		el.mTween = window.requestAnimationFrame(startMove);

		let time = Date.now() - startTime;

		if(time > duration){
			time = duration;
			window.cancelAnimationFrame(el.mTween);
			el.mTween = null;
		}
		for(let key in attrs){
			let currentPos = Tween[fx](time, beginData[key], changeData[key], duration);
			css(el, key, currentPos);
		}

		if(time === duration && typeof cb === 'function'){
			cb.call(el);
		}
	})();
}

mTween.stop = function (el){
	window.cancelAnimationFrame(el.mTween);
	el.mTween = null;
};

let Tween = {
	linear: function (t, b, c, d){  //匀速
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){  //加速曲线
		return c*(t/=d)*t + b;
	},
	easeOut: function(t, b, c, d){  //减速曲线
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(t, b, c, d){  //加速减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d){  //加加速曲线
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(t, b, c, d){  //减减速曲线
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			let s = p/4;
		} else {
			let s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(t, b, c, d, a, p){    //*正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			let s = p / 4;
		} else {
			let s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	elasticBoth: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d/2) == 2 ) {
			return b+c;
		}
		if (!p) {
			p = d*(0.3*1.5);
		}
		if ( !a || a < Math.abs(c) ) {
			a = c;
			let s = p/4;
		}
		else {
			let s = p/(2*Math.PI) * Math.asin (c/a);
		}
		if (t < 1) {
			return - 0.5*(a*Math.pow(2,10*(t-=1)) *
				Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) *
			Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	},
	backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 3.70158;  //回缩的距离
		}
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	backBoth: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		if ((t /= d/2 ) < 1) {
			return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		}
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
		return c - Tween['bounceOut'](d-t, 0, c, d) + b;
	},
	bounceOut: function(t, b, c, d){//*
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		}
		return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	},
	bounceBoth: function(t, b, c, d){
		if (t < d/2) {
			return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
};

function MyScroll(init) {

	let _this = this;

	this.off = true;
	this.event = 'click';
	this.startPage = 1;
	this.dir = 'x';

	Object.assign(this,init);

	this.roll = this.wrap.children[0];
	this.rolls = this.roll.children;
	if (this.dir == 'x') {
		this.pageSize = parseInt(this.rolls[0].offsetWidth);
	}else if (this.dir == 'y') {
		this.pageSize = parseInt(this.rolls[0].offsetHeight);
	}

	if (this.loop) {
		this.roll.appendChild(this.rolls[0].cloneNode(true));
	}

	if (this.startPage > 0 && this.startPage <= this.rolls.length - 1) {
		this.n = this.startPage - 1;
	}else {
		this.n = 0;
	}

	if (this.dir == 'x') {
		css(this.roll,'translateX',- this.n * this.pageSize);
	}else if (this.dir == 'y') {
		css(this.roll,'translateY',- this.n * this.pageSize);
	}

	css(this.roll,'translateZ',0);

	this.reset();
	this.dotChange();

	this.dots.forEach(function (item,index) {
		item.addEventListener(_this.event,function() {
			_this.reset();
			item.classList.add(_this.activeClass);
			_this.tab(index);
		})
	});

}

MyScroll.prototype = {
	shift: function () {
		let _this = this;
		if (this.dir == 'x') {
			mTween({
				el: _this.roll,
				attrs: {
					'translateX': - _this.n * _this.pageSize
				},
				duration: 500,
				fx: 'easeOut',
				cb: function () {
					_this.off = true;
				}
			})
		}else if (this.dir == 'y') {
			mTween({
				el: _this.roll,
				attrs: {
					'translateY': - _this.n * _this.pageSize
				},
				duration: 500,
				fx: 'easeOut',
				cb: function () {
					_this.off = true;
				}
			})
		}
	},
	tab: function (index) {
		this.n = index;
		this.shift();
	},
	noFrame: function () {
		if (this.dir == 'x') {
			css(this.roll, 'translateX', -this.n * this.pageSize);
		}else if (this.dir == 'y') {
			css(this.roll, 'translateY', -this.n * this.pageSize);
		}
	},
	reset: function () {
		let _this = this;
		this.dots.forEach(function (nav) {
			nav.classList.remove(_this.activeClass);
		})
	},
	dotChange: function () {
		this.dots[this.n].classList.add('active')
	},
	next: function () {
		let _this = this;
		if (this.off) {
			this.off = false;
			if (this.loop) {
				if (this.n == this.rolls.length - 1) {
					this.n = 0;
					this.noFrame();
				}
				this.n++;
				if(this.n <= this.rolls.length - 2) {
					this.reset();
					this.dotChange();
				}else {
					this.reset();
					this.dots[0].classList.add('active');
				}
			}else {
				if (this.n < this.rolls.length - 2) {
					this.n++;
					this.reset();
					this.dotChange();
				}
			}
			this.shift();
		}
	},
	prev: function () {
		let _this = this;
		if (this.off) {
			this.off = false;
			if (this.loop) {
				if (this.n < 1) {
					this.n = this.rolls.length - 1;
					this.noFrame();
				}
			}
			this.n--;
			this.reset();
			this.dotChange();
			this.shift();
		}
	}
};


let prev = document.querySelector('.prev');
let next = document.querySelector('.next');
let wrap = document.querySelector('.wrap');
let navs = document.querySelectorAll('nav span');

let scroll = new MyScroll({
	wrap,
	dots:navs,
	loop: true,
	activeClass: 'active',
	startPage: 3
});


prev.onclick = function () {
	scroll.prev();
};
next.onclick = function () {
	scroll.next();
};

/*setInterval(function () {
	scroll.next();
},1500);*/
