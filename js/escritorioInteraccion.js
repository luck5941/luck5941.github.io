/*
*Variables relativas a selectores del dom
*/
var setting = $('#setting'),
	controlador = $('.controlador'),
	pointer = $('.pointer')
	her = 0,
	i = 0,
	ctrlHeight = parseInt($(controlador).css('height'))
/*
*Variables de control
*/
var moveFlag = false, //Sirve para dejar de recontrolar la posicion de un pointer o de un nodo
	call = false, //para llamar a la funcion e inicie el movimiento circular
	gravity = false,
	mouseup_cont = 0,
	desplazar = false, //Sirve para indicar cuando se puede cambiar el tamaño del fill
	direction = '',
	zindex = 0,
	minifyFlag = true;
/*
*otras variables
*/
var cursor = 'url("media/system/',
	cursorRight = cursor + 'cursorRight.png"), auto',
	cursorLeft = cursor + 'cursorLeft.png"), auto',
	cursorTop = cursor + 'cursorTop.png"), auto',
	cursorDown = cursor + 'cursorDown.png"), auto',
	cursorRightTop = cursor + 'cursorRightTop.png"), auto',
	cursorRightDown = cursor + 'cursorRightDown.png"), auto',
	cursorLeftTop = cursor + 'cursorLeftTop.png"), auto',
	cursorLeftDown = cursor + 'cursorLeftDown.png"), auto';
	closeHand = cursor + 'closeHand.png"), auto';
	openHand = cursor + 'openHand.png"), auto';

/*
* Variables relativas a control de eventos
*/

var is_mobile = ((typeof window.orientation !== "undefined") || (navigator.userAgent.search(/android|iphone|ipad|phone/i) !== -1)),
	click_down = (is_mobile) ? 'touchstart' : 'mousedown',
	click_up = (is_mobile) ? 'touchend' : 'mouseup',
	click_move = (is_mobile) ? 'touchmove' : 'mousemove',
	toDel = '';



//$('body').html(() => {let str =  is_mobile ? "es mobile " : "Es desktop"; str += `\nPor lo tanto  click_down vale: ${click_down}`; return str; })

function externalCntrl(y, i) {
	/*
	*la i indica que controlador se ha movido, siendo los pares para el radio (d1)
	*y los impares para la velocidad speed
	*
	*la y es cuando se ha movido
	*la speed más alta posible es 95 y la más baja 0
	*
	*El d1 maximo es 300 por defecto, pero se actualiza al radio inicial del objeto
	*y el min el radio del circulo principal
	*/
	//1º determinamos a que estamos haciendo referencia
	var obj = '',
		per = 0,
		maxD1 = 600,
		maxSpeed = 95,
		minD1 = mainR,
		y = ctrlHeight -y;
	switch(i){
		case 0:
		case 1:
			obj = trabajos;
			break;
		case 2:
		case 3:
			obj = contacto;
			break;
		case 4:
		case 5:
			obj = aplicaciones;
			break;
		case 6:
		case 7:
			obj = sobremi;
			break;
	}
	maxD1 = obj.d1_init
	//var line = (i%2==0) ? obj.d1 : obj.speed
	// ya tenemos  a que circulo nos referimos

	//El porcentaje en el que nos movemos
	per = y*100/ctrlHeight;

	//Con el porcentaje calculamos el resultado
	if (i%2==0){ //el radio
		obj.extControl = true;
		obj.d1 = per*maxD1/100;
	}
	else {//la velocidad
		obj.speed = maxSpeed - ((per)*(maxSpeed)/100);
		obj.speed += 10;
		if (obj.speed>maxSpeed-15){
			obj.entra = false;
			call = true;
			log(obj.speed);
		}
		if (obj.speed>maxSpeed-19 && obj.speed<maxSpeed-16){
			if (call){
				call = false;
				obj.entra = true;
				obj.rotateNode();
			}
		}

	}
}



setting.on(click_down, function(){
	/*
	*Desbloquear el menu. Esta desactivada de momento
	*/
	if (menu.css('display') == 'none'){
		menu.css('display', 'block')
	}
	else{
		menu.css('display', 'none')
	}
});

$('body').on(click_down, '.pointer', function(){
	her = $(this);
	moveFlag = true;
	i = $(this).index('.pointer');
	var top = parseInt($(controlador[i]).offset().top),
		bottom = top+ctrlHeight,
		height = parseInt(her.css('height'))
	menu.on(click_move, function(e){
		if (moveFlag){
			var Ypos = (is_mobile)?  e.originalEvent.touches[0].pageY : e.pageY;
			y = Ypos - top
			y = (y+top<top) ? 0 : y
			y = (y+top>bottom) ? bottom-top-height : y
			her.css({'margin-top':y});
			externalCntrl(y, i);
		}
	}).on(click_up, function(){moveFlag=false;});
}).on(click_down, "[move='true']", function(e){
	e.stopPropagation();
	her = ($(this).attr('id').search('_txt') === -1) ? $(this) : $('#' + $(this).attr('id').replace('_txt', ''));
	moveFlag = true;
	var x = 0,
		y = 0,
		obj = {};
	$('#controlMenu').css('z-index', -6);
	her.css('cursor', closeHand);
	$svg.on(click_move, function(e){
		if (moveFlag){
			var xPos = (is_mobile) ? e.originalEvent.touches[0].pageX: e.pageX,
				Ypos = (is_mobile) ? e.originalEvent.touches[0].pageY: e.pageY;
			x = xPos*100/w;
			y = (Ypos*100/h)/(w/h);
			obj = eval(her.attr('id'));
			obj.move(x, y);
			gravity = true;
			for (var i = 0; i<gravityObject.length; i++){
				gravityObject[i].gravityForce(obj);
			}

		}
	}).on(click_up, async function(){
		if (!moveFlag) return;
		her.css('cursor', 'inherit');
        moveFlag=false;
        if (typeof(obj.entra) !== 'undefined'){
        	obj.entra = true;
        	obj.recalcularPos()
        	await sleep(obj.speed);
        	obj.rotateNode();
        }
    	$('#controlMenu').css('z-index', 1)
    	gravity = false;
    	mouseup_cont++
    	for (var i = 0; i<gravityObject.length; i++){
			gravityObject[i].gravityAction(obj);
		}
		return;
    })
	return;
}).on('dblclick', "[move='true']", async function(e){
	e.stopPropagation();
	her = ($(this).attr('id').search('_txt') === -1) ? $(this) : $('#' + $(this).attr('id').replace('_txt', ''));
	obj = eval(her.attr('id').replace('_txt', ''));

	obj.entra = false;
	try{
		obj.c.goTo(open.cx, open.cy/(h/w), 1500)
	}
	catch(e) {
		log(e)
		obj.goTo(open.cx, open.cy/(h/w), 1500)
	}
	await sleep(1600)
	open.gravityActive = true;
	open.gravityAction(obj);
	open.gravityActive = false;
	obj.entra = true;
	obj.rotateNode();
}).on('mousewheel DOMMouseScroll', '.fill', onScroll
).on(click_move, '.fill', function(e){
	var id = $(this).attr('id'),
		Xpos = (is_mobile) ? e.originalEvent.touches[0].pageX : e.pageX,
		Ypos = (is_mobile) ? e.originalEvent.touches[0].pageY : e.pageY;
	direction = '';
	eval('var obj = '+id);
	desplazar = true;
	if (e.Xpos >= obj.cordX +obj.w-obj.border && Ypos <=obj.cordY+obj.border){
		direction = '';
		desplazar = false;
	}
	else if (Xpos >= obj.cordX +obj.w-obj.border){
		$(this).css('cursor', cursorRight);
		direction = 'right';
	}
	else if (Xpos <= obj.cordX +obj.border){
		$(this).css('cursor', cursorLeft);
		direction = 'left';
	}
	else if (Ypos >=obj.cordY+obj.h-obj.border){
		$(this).css('cursor', cursorDown);
		direction = 'down';
	}
	else{
		$(this).css('cursor', 'inherit');
		desplazar = false;
		direction = '';
	}
}).on(click_down, '.fill', function(e){
		if (!desplazar) return;
		var id = $(this).attr('id')
		eval ('var obj = '+id)
		var cords = [obj.cordX, obj.cordY, obj.w, obj.h];
		var flag = true;

		$('body').on(click_move, function(e){
			if (!flag) return;
			var Xpos = (is_mobile) ? e.originalEvent.touches[0].pageX : e.pageX,
				Ypos = (is_mobile) ? e.originalEvent.touches[0].pageY : e.pageY;
			switch (direction) {
				case 'rightTop':
					return;
					break;
				case 'leftTop':
				case 'rightDown':
				case 'leftDown':
					cords = [(Xpos-obj.cordX),(Ypos-obj.cordY)];
					break;
				case 'right':
					obj.reStyle({'width': Xpos-obj.cordX})
					log('{width: '+ obj.w+'+('+Xpos+'-'+obj.cordX+'+'+obj.w+')}');
					log({'width': obj.w+(Xpos-obj.cordX+obj.w)});
					break;
				case 'left':
					obj.reStyle({'left': Xpos, 'width': (cords[2]+cords[0]-Xpos)})
					break;
				case 'down':
					obj.reStyle({'height': Ypos-obj.cordY})
					break;
				case 'top':
					cords = [e.pageY];
					break;
				default:
					return;
					break;
			}
		}).on(click_up, function(){flag = false;})
}).on(click_up, function(){flag = false;
}).on(click_down, '.fill .close', function() {
	var id = $(this).parent().parent().attr('id');
	eval('var obj = '+id + ';');
	obj.close();
}).on(click_down, '.fill .minify', function() {
	var id = $(this).parent().parent().attr('id');
	eval('var obj = '+id + ';');
	obj.minify();
}).on(click_down, '.header .maximizy', function() {
	var id = $(this).parent().parent().attr('id');
	eval('var obj = '+id + ';');
	obj.maximizy();
}).on(click_down, '.fill .header', function(e){
	if(e.target !== e.currentTarget) return;

	var id = $(this).parent().attr('id'),
		Xpos = (is_mobile) ? e.originalEvent.touches[0].pageX :e.pageX,
		Ypos = (is_mobile) ? e.originalEvent.touches[0].pageY :e.pageY;
	eval('var obj = '+id + ';');
	var stop = false;
	var restX = (Ypos-obj.cordY);
	var restY = (Xpos-obj.cordX);
	$(this).css('cursor', closeHand);
	if (obj.big)
		obj.reStyle({'width': obj.w_init, 'height': obj.h_init});

	$('body').on(click_move, function(e){
		if (stop) return;
		var Xpos = (is_mobile) ? e.originalEvent.touches[0].pageX : e.pageX,
			Ypos = (is_mobile) ? e.originalEvent.touches[0].pageY : e.pageY;
		if (Ypos <= 20){
			if($('#screenBlue').css('display') !== 'none' && $('#screenBlue').css('display') !== 'block')
				$('<div id="screenBlue" style = "height: '+h+'px"></div>').insertAfter($svg);
			else
				$('#screenBlue').css('display', 'block')

			$('#screenBlue').css({'width': 0, 'height': 0}).animate({'width': w*0.95+'px', 'height': h+'px'}, 500)
		}
		else
			$('#screenBlue').css({'width': '0px', 'height': '0px', 'display': 'none'})
		obj.reStyle({'top': (Ypos-restX), 'left': (Xpos-restY)})
	})
	.on(click_up, function(e){stop = true; return;})


	}).on(click_up, '.fill .header', function(e){
		if(e.target !== e.currentTarget) return;
		stop = true;
		var Xpos = (is_mobile) ? e.originalEvent.touches[0].pageX : e.pageX,
			Ypos = (is_mobile) ? e.originalEvent.touches[0].pageY : e.pageY;
		var id = $(this).parent().attr('id');
		eval('var obj = '+id + ';');
		$(this).css('cursor', openHand);
		$('#screenBlue').css('display', 'none');
		if (Ypos <=20)
			obj.maximizy();
}).on(click_down, '.fill', function(){
	var id = $(this).attr('id')
	eval('var obj ='+ id +';');
	zindex++
	obj.jqr.css('z-index', zindex)
}).on('mouseenter', '#minify', function() {minify.showAll();
}).on(click_down, '.second', function() {
	var id = $(this).attr('id').replace('Min', '');
	eval('var obj = ' +id);
	obj.jqr.css({'display': 'blok', 'left': minify.cx*w/100, 'top': (minify.cy*h/100)/(h/w), 'width': 0, 'height': 0, 'opacity': 1})
			.animate({'left': obj.cordX, 'top': obj.cordY, 'width': obj.w, 'height': obj.h}, 1000);
	minify.secondPlane = minify.secondPlane.popMe(obj);
	$('.second').remove();
}).on('mouseover', '.second', function(){
	var id = $(this).attr('id').replace('Min', '');
	eval('var obj = ' +id);
	obj.jqr.css({'display': 'block', 'left': obj.cordX, 'top': obj.cordY, 'width': obj.w, 'height': obj.h, 'opacity': 0.6});
	$(this).css('opacity', 0.4);
}).on('mouseout', '.second', function(){
	var id = $(this).attr('id').replace('Min', '');
	eval('var obj = ' +id);
	obj.jqr.css({'display': 'none', 'left': minify.cx, 'top': minify.cy, 'width': 0, 'height': 0, 'opacity': 1});
	$(this).css('opacity', 1);
}).on(click_down, '.play', playPaused)
.on(click_down, '.fullScreen', fullScreen)
.on(click_down, '.volumen', vol_dragStart)
.on(click_up, '.volumen', vol_dragend);


function playPaused(e) {
	if (e.which !== 1) return;
	var id = $(e.currentTarget).parent().parent().parent().parent().attr('id').replace('Fill', ''),
		played = "<circle cx=\"50\" cy=\"6\" r=\"5.73\" class=\"st5\" /><path d=\"M48 3 L48 9 L53 6 Z\" class=\"st7\" />",
		paused = "<circle cx=\"50\" cy=\"6\" r=\"5.73\" class=\"st5\" /><path d=\"M48 3 L48 9 \" class=\"st7\" /><path d=\"M53 3 L53 9 \" class=\"st7\" />";
	if (!videos[id].state) videos[id].obj.play();
	else videos[id].obj.pause();
	videos[id].state = !videos[id].state;
	//d3.select('.playPause').html(() => {return (videos[id].state) ? paused : played;});
	$('.play').html(()=> {return (videos[id].state) ? paused : played;})
}

function fullScreen(e) {
	if (e.which !== 1) return;
	var id = $(e.currentTarget).parent().parent().parent().parent().attr('id').replace('Fill', '');
	if (videos[id].obj.requestFullscreen)
        videos[id].obj.requestFullscreen();
    else if (videos[id].obj.msRequestFullscreen)
        videos[id].obj.msRequestFullscreen();
    else if (videos[id].obj.mozRequestFullScreen)
        videos[id].obj.mozRequestFullScreen();
    else if (videos[id].obj.webkitRequestFullscreen)
        videos[id].obj.webkitRequestFullscreen();
    else
        console.log("Fullscreen API is not supported");
    videos[id].state = false;
    playPaused(e)
}

function vol_dragStart(e) {
	let dim = $(e.currentTarget).parent()[0].getBoundingClientRect(),
		x = e.clientX - dim.left,
		id = $(e.currentTarget).parent().parent().parent().parent().attr("id");
	x = x*100/dim.width;
	let vol = x-22;
	vol = vol*100/5.5
	videos[id].volume = vol;
	$(e.currentTarget).find(".vol").attr("cx", ()=>x);

}
function vol_dragend(e){

}




function onScroll(e, id = undefined){
	var id = (typeof(id) == 'undefined') ? $(this).attr('id') : id.slice(1);
	var d;
	if (e.wheelDelta) d = e.wheelDelta;
	if (e.originalEvent.detail) d = e.originalEvent.detail *-40;
	if (e.originalEvent && e.originalEvent.wheelDelta) d = e.originalEvent.wheelDelta;
	eval(id+'.scroll(d)')
}

//desktop.canMove();
minify.secondPlane = [];


