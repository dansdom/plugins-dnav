/* 
	jQuery Dynamic Nav Plugin - v1.0  
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// creates a dynamic nav for floated elements that exceed the width of its container

(function($){

	$.fn.Dnav = function(config)
	{
		// config - default settings
		var settings = {
			arrowWidth : 30,
			navPrev : ".prev",
			navNext : ".next",
			anchorX :  0,
			anchorY : 0,
			disabled : "disabled",
			speed : 500
					 };

		// if settings have been defined then overwrite the default ones
          // comments:        true value makes the merge recursive. that is - 'deep' copy
		//				{} creates an empty object so that the second object doesn't overwrite the first object
		//				this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//				the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){
			// do pluging stuff here
			// each box calling the plugin now has the variable name: myBox
			var nav = $(this);
			nav.navControls = false;
			
			// get the selector for the next and prev buttons	
			// console.log(opts.navPrev);		
			var prevSelector = $.fn.Dnav.getEl(opts.navPrev);
			var nextSelector = $.fn.Dnav.getEl(opts.navNext);
						
			// add the previous and next buttons
			nav.parent().prepend("<a href='#' "+prevSelector.type+"='"+prevSelector.text+"' style='display:none'>prev</a>").append("<a href='#' "+nextSelector.type+"='"+nextSelector.text+"' style='display:none'>next</a>");
			// add css to the ul
			nav.parent().css({"overflow":"hidden", "position":"relative"});
			nav.find("li").css({"float" : "left","display" : "block"});
			
			$.fn.Dnav.init(nav, opts);
			
			$(window).resize(function(){
				$.fn.Dnav.init(nav, opts);
			});

			// end of plugin stuff
		});

		// return jQuery object
		return this;
	};

	// plugin functions go here - example of two different ways to call a function, and also two ways of using the namespace
	// note: $.fn.testPlugin.styleBox allows for this function to be extended beyond the scope of the plugin and used elsewhere, 
	// that is why it is a superior namespace. Also: anonymous function calling I think is probably better naming practise too.

	$.fn.Dnav.init = function(nav, opts)
	{
		// get dimensions of the nav
		nav.navWidth = nav.parent().width();
		nav.ulWidth = 0;
		// controls are currently not displaying
		
		// add the control buttons to the nav		
		nav.prev = $(opts.navPrev);
		nav.next = $(opts.navNext);
		// style the nav arrows
		nav.prev.css({
						"position" : "absolute",
						"top" : opts.anchorY + "px",
						"left" : opts.anchorX + "px",
						"width" : opts.arrowWidth + "px",
						"z-index" : "2"
					});
		nav.next.css({
						"position" : "absolute",
						"top" : opts.anchorY + "px",
						"right" : opts.anchorX + "px",
						"width" : opts.arrowWidth + "px",
						"z-index" : "2"
					});
		nav.arrowWidth = opts.arrowWidth * 2;
		nav.find("li").each(function(){
			nav.ulWidth += $(this).outerWidth();		
		});
		nav.ulWidth += nav.arrowWidth;
		
		// console.log("ulWidth: "+nav.ulWidth+", navWidth: "+nav.navWidth+", arrowWidth: "+nav.arrowWidth+", nav controls: "+nav.navControls);
		// decide whther to make or remove the controls
		if (nav.ulWidth > nav.navWidth)
		{
			$.fn.Dnav.makeControls(nav, opts);
			//console.log("making controls");
		}		
		else if (nav.ulWidth <= (nav.navWidth + nav.arrowWidth) && nav.navControls == true)
		{
			$.fn.Dnav.removeControls(nav, opts);
			//console.log("removing controls");
		}				
	};
	
	// gets the element selector class/id and the value
	$.fn.Dnav.getEl = function(selector)
	{
		var selectorArray = selector.split(' ');
		var elSelector = selectorArray[selectorArray.length - 1];
		// find if it's an id or class
		var theType = elSelector.charAt(0);
		// get the selector text
		var theText = elSelector.substring(1);
				
		el = {};
		if (theType == ".")
		{
			el.type = "class";
		}
		else if (theType == "#")
		{
			el.type = "id";
		}
		el.text = theText;
		return el;
	};
	
	$.fn.Dnav.makeControls = function(nav, opts)
	{
		nav.navControls = true;
		// will target the nav object specifically here		
		nav.prev.css("display","block").unbind().addClass(opts.disabled);
		nav.next.css("display","block").unbind().removeClass(opts.disabled);		
		// style the list
		nav.css({"padding-left":opts.arrowWidth+"px", "padding-right":opts.arrowWidth+"px", "position":"absolute", "top":"0px", "left":"0px", "width":nav.ulWidth+"px", "z-index":"1"}); 
		// set the animation point to 0
		nav.animationPoint = 0;
		// set the nav counter to 0
		nav.counter = 0;		
		
		nav.prev.click(function()
		{
			nav.stop(true, true);
			var leftPos = parseInt(nav.css("left")),
				firstWidth = nav.children("li:eq(0)").outerWidth();	
				
			// find the next animation point
			nav.next.removeClass(opts.disabled);			
			// find next animation point
			nav.animationPoint = leftPos + nav.children("li:eq("+(nav.counter-1)+")").outerWidth();
			
			if (nav.animationPoint >= 0)
			{
				nav.animate({"left":"0px"});
				nav.counter = 0;			
				$(this).addClass("disabled");
				// console.log(nav.counter);
			}
			else
			{
				// then animate to the prev position
				nav.animate({"left":nav.animationPoint+"px"}, opts.speed);
				nav.counter--;
				if (nav.counter < 0)
				{
					nav.counter = 0;
				}
				// console.log(nav.counter);			
			}
			return false;		
		});
		
		nav.next.click(function()
		{
			nav.stop(true, true);
			var nextWidth = nav.children("li:eq("+(nav.counter)+")").outerWidth(),
				lastWidth = nav.children("li:last").outerWidth(),
				leftPos = parseInt(nav.css("left")), // left position of the list
				widthDiff = nav.navWidth - nav.ulWidth; // different between the ul length and the tabs length
				
			nav.animationPoint = leftPos - nav.children("li:eq("+(nav.counter)+")").outerWidth();		
		
			
			nav.prev.removeClass(opts.disabled);
			// I think checking the last width might be a mistake. might have to check the counter item width??
			var counterItemWidth = nav.children("li:eq("+(nav.counter)+")").outerWidth();
			if (nav.animationPoint > (widthDiff - counterItemWidth))
			{
				// check the next navigation point and decide if this is the last or not
				var nextAnimationPoint = leftPos - nav.children("li:eq("+(nav.counter + 1)+")").outerWidth() - nav.children("li:eq("+(nav.counter)+")").outerWidth();
				var nextCounterItemWidth = nav.children("li:eq("+(nav.counter + 1)+")").outerWidth();
				if (nextAnimationPoint < (widthDiff - nextCounterItemWidth))
				{
					$(this).addClass(opts.disabled);
				}
				// then animate to the next position			
				nav.animate({"left":nav.animationPoint+"px"}, opts.speed);
				nav.counter++;
				// console.log(nav.counter);											
			}
			else
			{			
				// end of the LIST!
				nav.animationPoint = -widthDiff;			
				// add disabled class to the button			
				$(this).addClass(opts.disabled);
				// console.log(nav.counter);
			}
			// I need to check for the next animation point so that I can assign the disabled class as I reach the end.
			// console.log("clicked next");
			return false;
		});
		
	};	
	
	// removes the controls from the page and unbinds the events on them
	$.fn.Dnav.removeControls = function(nav, opts)
	{
		nav.navControls = false;
		nav.next.unbind().css("display","none");	
		nav.prev.unbind().css("display","none");	
		nav.css({"position":"static", "padding":"0px", "left":"0", "right":"0"});			
	};

	// end of module
})(jQuery);


