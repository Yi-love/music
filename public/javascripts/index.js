(function(window,document){
	// 查询Dom 元素
	function $ (s) {
		return document.querySelectorAll(s);
	};

	// 切换歌曲
	var lis = $('.music-list li');
	for ( var i = 0 ; i < lis.length ; i ++ ){
		lis[i].onclick = function(){
			for (var j = lis.length - 1; j >= 0; j--) {
				lis[j].className = '';
			};
			this.className = 'selected';
			loadmusic('/music/'+this.title);
		};
	};

	var xhr = new XMLHttpRequest();
	var realsource = null,
	    count = 0;
	// 加载音乐
	function loadmusic(url){
		realsource && realsource[realsource.stop ? 'stop' : 'noteOff']();
		var n = ++count;
		xhr.abort();
		xhr.open('GET' , url);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(){
			decodeAudio(xhr.response , n);
		}
		xhr.send();
	};


	var ac = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
	var gainNode = ac[ac.createGain ? 'createGain' : 'createGainNode']();
	gainNode.connect(ac.destination);
	var analyser = ac.createAnalyser();
	var size = 128;
	analyser.fftSize = size*2;
	analyser.connect(gainNode);


	// 解析音乐
	function decodeAudio(source , n){
		if ( n != count ) return;
		ac.decodeAudioData(source , function(buffer){
			if ( n != count ) return;
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer = buffer;
			bufferSource.connect(analyser);
			// bufferSource.connect(gainNode);
			// bufferSource.connect(ac.destination);
			bufferSource[bufferSource.start ? 'start' : 'noteOn'](0);
			realsource = bufferSource;
		},function(err){
			console.log(err);
		});
	};

	// 时时获取音频数据
	function visualizer(){
		var arr = new Uint8Array(analyser.frequencyBinCount);
		requestAnimationFrame = window.requestAnimationFrame ||
		 						window.webkitRequestAnimationFrame || 
		 						window.mozRequestAnimationFrame;
		function v(){
			analyser.getByteFrequencyData(arr);
			draw(arr);
			requestAnimationFrame(v);
		};
		requestAnimationFrame(v);
	};
	visualizer();
	
	var musiccenter = $('.music-center')[0];
	var height , width , line;
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	musiccenter.appendChild(canvas);

	// 获取（m-n）之间随机值
	var dots = [];
	function random(m , n){
		return Math.round(Math.random()*(n-m)+m);
	};

    // 打印点数
	function getDots(){
		dots = [];
		for( var i = 0 ; i < size ; i++ ){
			var x = random(0 , width);
			var y = random(0 , height);
			var color = 'rgb('+random(0,255)+','+random(0,255)+','+random(0,255)+')';
			dots.push({
				x : x,
				y : y,
				color : color
			});
		}
	}

	// 重新设置尺寸
	function resize(){
		height = musiccenter.clientHeight;
		width = musiccenter.clientWidth;
		canvas.width = width;
		canvas.height = height;
		line = ctx.createLinearGradient(0 , 0 , 0 ,height);
		line.addColorStop(0 , 'red');
		line.addColorStop(0.5 , 'yellow');
		line.addColorStop(1 , 'green');
		getDots();
	};
	resize();
	window.onresize = resize;

	// canvas画出音频数据效果
	function draw(arr){
		ctx.clearRect(0 , 0 , width , height);
		ctx.fillStyle = line;
		var w = width/size;
		for ( var i = 0 ; i < arr.length ; i++ ){
			if ( draw.type == 'column' ){
				var h = arr[i]/(size*2)*height;
				ctx.fillRect(w*i , height-h , w*0.6 , h);
			}else if ( draw.type == 'dot' ){
				ctx.beginPath();
				var o = dots[i];
				var r = arr[i]/(size*2)*40;
				ctx.arc(o.x , o.y , r , 0 , Math.PI*2 , true);
				var g = ctx.createRadialGradient(o.x , o.y , 0 , o.x , o.y , r);
				g.addColorStop(0, '#fff');
				g.addColorStop(1 , o.color);
				ctx.fillStyle = g;
				ctx.fill();
			}
			
		}
	};
	draw.type = 'column';

	// 点击切换音频效果
	var chag = $('.changetype li');
	for ( var i = 0 ; i < chag.length ; i ++ ){
		chag[i].onclick = function(){
			for (var j = chag.length - 1; j >= 0; j--) {
				chag[j].className = '';
			};
			this.className = 'selected';
			draw.type = this.getAttribute('data-type');
		};
	};

	// 调节音量
	function changeVolume(percent){
		gainNode.gain.value = percent*percent;
	};
	$('#volume')[0].onchange = function(){
		changeVolume(this.value/this.max);
	};
	$('#volume')[0].onchange();

	
})(window , document);