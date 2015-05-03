/// <reference path="tsd.d.ts" />
import ko = require('knockout');
import $ = require('jquery');

ko.bindingHandlers['bs-modal'] = {
	init: (element, valueAccessor) => {
		update(element, valueAccessor);

		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			$(element).modal('destroy');
		});

	},

	update: (element, valueAccessor) => update(element, valueAccessor)
};

function update(element: any, valueAccessor: any) {
	var value = valueAccessor();
	if (ko.utils.unwrapObservable(value)) {
		$(element).modal('show');
	} else {
		$(element).modal('hide');
	}
}
