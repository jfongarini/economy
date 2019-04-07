/***********************************************************************************
** jQuery Drag&Drop
** 		Version: 		1.0.0
** 		License: 		GPL v3. See LICENSE file.
**		Author: 		Choko <choko@chaksoft.fr>
***********************************************************************************/

$.event.props.push('dataTransfer');
$(function() {
	var $sources = $('div[data-dd="source"]');
	var $targets = $('div[data-dd="target"]');
	var i, $origin;
	if($sources.length > 0) {
		$sources.find('*').each(function(idx, item) {
			var $element = $(item);
			$element.attr("unselectable", "on"); // IE
			$element.attr("id", "dd-source-" + idx);
			if(($element.attr("data-dd-status") && $element.attr("data-dd-status") == 'draggable') || !$element.attr("data-dd-status")) {
				$element.prop("draggable", true);
			}
			$element.on({
				dragstart: function(ev) {
					i = $(this).index;
					$(this).css({ 'opacity': '0.65' });
					$origin = $(this);
					ev.dataTransfer.setData('text', $element[0].outerHTML);
					ev.dataTransfer.setData('source', $element.attr("id"));
				}
			});
		});
		$targets.each(function(idx, item) {
			var $element = $(item);
			$element.attr("id", "dd-target-" + idx);
			$element.on({
				dragenter: function(ev) {
					$(this).animate({
						'box-shadow': '2px 2px 4px #aaf'
					}, 'fast');
					ev.preventDefault();
				},
				dragleave: function(ev) {
					$(this).animate({
						'box-shadow': 'initial'
					}, 'fast');
				},
				dragover: function(ev) {
					ev.preventDefault();
				},
				drop: function(ev) {
					if(i !== $(this).index()) {
						var data = ev.dataTransfer.getData('text');
						var $data = $(data);
						$data.removeAttr("opacity");
						$(this).append($data);
						$("#" + ev.dataTransfer.getData("source")).remove();
						
					}
					$(this).animate({
						'box-shadow': 'initial'
					}, 'fast');
				},
				dragend: function(ev) {
					$(this).css({ 'opacity': '1.0' });
				}
			});
		});
	}
	$("[draggable]").each(function(idx, item) {
		var $element = $(item);
		if(($element.attr("data-dd-reordable") && $element.attr("data-dd-reordable") == 'true')) {
			$element.on({
				drop: function(ev) {
					if(i !== $(this).index()) {
						
					}
				}
			});
		}
	});
});
