// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


var ARRAY_START_X = 80;
var ARRAY_START_Y = 170;
var ARRAY_ELEM_WIDTH = 50;
var ARRAY_ELEM_HEIGHT = 50;
var ARRAY_LINE_SPACING = 130;

var TOP_POS_X = 480;
var TOP_POS_Y = 50;
var TOP_LABEL_X = 410;
var TOP_LABEL_Y = 50;

var PUSH_LABEL_X = 80;
var PUSH_LABEL_Y = 30;
var PUSH_ELEMENT_X = 220;
var PUSH_ELEMENT_Y = 30;

var POP_LABEL_X = 80;
var POP_LABEL_Y = 60;
var POP_ELEMENT_X = 220;
var POP_ELEMENT_Y = 60;

var DELBOX_POX_X;
var DELBOX_POX_Y = 50;

var INDEX_COLOR = "#0000FF"
var ELEM_FOREGROUND_COLOR = "#000055";
var ELEM_BACKGROUND_COLOR = "#AAAAFF";

function StackArray(am, w, h) {
	this.init(am, w, h);
}

StackArray.prototype = new Algorithm();
StackArray.prototype.constructor = StackArray;
StackArray.superclass = Algorithm.prototype;


StackArray.prototype.init = function (am, w, h) {
	StackArray.superclass.init.call(this, am, w, h);
	this.CANVAS_WIDTH = w;
	this.ARRAY_CUR_LINE = 0;
	TOP_POS_X = Math.floor(w / 2) - 30;
	TOP_LABEL_X = Math.floor(w / 2) - 90;
	DELBOX_POX_X = Math.floor(w / 2) - 200;

	this.addControls();
	this.setup();
}


StackArray.prototype.addControls = function () {
	this.controls = [];

	this.pushArrayField = addControlToAlgorithmBar("Text", "");
	this.pushArrayField.onkeydown = this.returnSubmit(this.pushArrayField, this.pushArrayCallback.bind(this));
	this.pushArrayButton = addControlToAlgorithmBar("Button", "Array Push");
	this.pushArrayButton.onclick = this.pushArrayCallback.bind(this);
	this.controls.push(this.pushArrayField);
	this.controls.push(this.pushArrayButton);

	this.pushField = addControlToAlgorithmBar("Text", "");
	this.pushField.onkeydown = this.returnSubmit(this.pushField, this.pushCallback.bind(this), 10);
	this.pushButton = addControlToAlgorithmBar("Button", "Single Push");
	this.pushButton.onclick = this.pushCallback.bind(this);
	this.controls.push(this.pushField);
	this.controls.push(this.pushButton);

	this.popButton = addControlToAlgorithmBar("Button", "Pop");
	this.popButton.onclick = this.popCallback.bind(this);
	this.controls.push(this.popButton);

	this.clearButton = addControlToAlgorithmBar("Button", "Clear Stack");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);

}

StackArray.prototype.enableUI = function (event) {
	for (var i = 0; i < this.controls.length; i++) {
		this.controls[i].disabled = false;
	}


}
StackArray.prototype.disableUI = function (event) {
	for (var i = 0; i < this.controls.length; i++) {
		this.controls[i].disabled = true;
	}
}


StackArray.prototype.setup = function () {
	this.commands = [];

	this.nextIndex = 0;
	this.prevArrayLen = 0;
	this.stackData = [];
	this.lineTotalLen = [];

	this.labPushValID = 0;
	this.labPopValID = 0;
	this.stackID = [];
	this.stackLabelID = [];

	this.top = 0;
	this.initialIndex = this.nextIndex;

	this.topID = this.nextIndex++;
	var topLabelID = this.nextIndex++;
	var delBoxID = this.nextIndex++;
	var labPushID = this.nextIndex++;
	var labPopID = this.nextIndex++;

	this.cmd("CreateLabel", topLabelID, "top", TOP_LABEL_X, TOP_LABEL_Y);
	this.cmd("CreateRectangle", this.topID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, TOP_POS_X, TOP_POS_Y);

	this.cmd("CreateRectangle", delBoxID, "Del", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, DELBOX_POX_X, DELBOX_POX_Y);

	this.cmd("CreateLabel", labPushID, "Pushed Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPopID, "Popped Value: ", POP_LABEL_X, POP_LABEL_Y);

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}


StackArray.prototype.reset = function () {
	this.top = 0;
	this.nextIndex = this.initialIndex;

	this.prevArrayLen = 0;
	this.stackData = [];
	this.lineTotalLen = [];
}

StackArray.prototype.pushArrayCallback = function (event) {
	if (this.pushArrayField.value != "") {
		var pushVal = this.pushArrayField.value;
		this.pushArrayField.value = ""
		this.implementAction(this.pushArray.bind(this), pushVal);
	}
}


StackArray.prototype.pushCallback = function (event) {
	if (this.pushField.value != "") {
		var pushVal = this.pushField.value;
		this.pushField.value = ""
		this.implementAction(this.push.bind(this), pushVal);
	}
}


StackArray.prototype.popCallback = function (event) {
	if (this.top > 0) {
		this.implementAction(this.pop.bind(this), "");
	}
}


StackArray.prototype.clearCallback = function (event) {
	this.implementAction(this.clearData.bind(this), "");
}

StackArray.prototype.clearData = function (ignored) {
	this.commands = new Array();
	this.clearAll();
	return this.commands;
}

StackArray.prototype.pushArray = function (elemToPush) {
	this.commands = new Array();

	if(this.labPushValID > 0) {
		this.cmd("Delete", this.labPushValID);
		this.cmd("Step");
	}

	var splitVal = elemToPush.substr(1, elemToPush.length - 2);
	splitVal = splitVal.split(',');
	var elemLen = splitVal.length;
	this.labPushValID = this.nextIndex++;

	var printArray = '[' + splitVal[0] + ', ' + '...' + ', ' + splitVal[elemLen - 1] + ']';
	this.cmd("CreateLabel", this.labPushValID, printArray, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
	this.cmd("Step");

	for (var i = 0; i < elemLen; ++i) {
		this.stackID[this.top] = this.nextIndex++;
		this.stackLabelID[this.top] = this.nextIndex++;
		this.stackData[this.top] = splitVal[i];

		var xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length) / 2);
		var ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
		if (ARRAY_START_X + this.prevArrayLen + ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length > this.CANVAS_WIDTH) {
			this.lineTotalLen[this.ARRAY_CUR_LINE] = this.prevArrayLen;
			this.prevArrayLen = 0;
			xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length) / 2);

			(this.ARRAY_CUR_LINE)++;
			ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
		}

		this.cmd("CreateRectangle", this.stackID[this.top],
			splitVal[i],
			ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length,
			ARRAY_ELEM_HEIGHT,
			xpos,
			ypos);
		this.cmd("CreateLabel", this.stackLabelID[this.top], this.top, xpos, ypos - ARRAY_ELEM_HEIGHT + 10);
		this.cmd("SetBackgroundColor", this.stackID[this.top], ELEM_BACKGROUND_COLOR);
		this.cmd("SetForegroundColor", this.stackLabelID[this.top], INDEX_COLOR);
		this.cmd("Step");
		this.top++;

		this.prevArrayLen += (ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length);
	}

	this.cmd("SetText", this.topID, this.top);

	return this.commands;
}

StackArray.prototype.push = function (elemToPush) {
	this.commands = new Array();

	if(this.labPushValID > 0) {
		this.cmd("Delete", this.labPushValID);
		this.cmd("Step");
	}

	this.labPushValID = this.nextIndex++;
	this.stackID[this.top] = this.nextIndex++;
	this.stackLabelID[this.top] = this.nextIndex++;
	this.stackData[this.top] = elemToPush;

	this.cmd("CreateLabel", this.labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
	this.cmd("Step");

	var xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * elemToPush.toString().length) / 2);
	var ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
	if (ARRAY_START_X + this.prevArrayLen + ARRAY_ELEM_WIDTH + 10 * elemToPush.toString().length > this.CANVAS_WIDTH) {
		this.lineTotalLen[this.ARRAY_CUR_LINE] = this.prevArrayLen;
		this.prevArrayLen = 0;
		xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * elemToPush.toString().length) / 2);

		(this.ARRAY_CUR_LINE)++;
		ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
	}

	//var xpos = (this.top % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
	//var ypos = Math.floor(this.top / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

	this.cmd("CreateRectangle", this.stackID[this.top],
		elemToPush,
		ARRAY_ELEM_WIDTH + 10 * elemToPush.toString().length,
		ARRAY_ELEM_HEIGHT,
		xpos,
		ypos);
	this.cmd("CreateLabel", this.stackLabelID[this.top], this.top, xpos, ypos - ARRAY_ELEM_HEIGHT + 10);
	this.cmd("SetForegroundColor", this.stackID[this.top], ELEM_FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", this.stackID[this.top], ELEM_BACKGROUND_COLOR);
	this.cmd("SetForegroundColor", this.stackLabelID[this.top], INDEX_COLOR);
	this.cmd("Step");
	this.top++;
	this.cmd("SetText", this.topID, this.top);

	this.prevArrayLen += (ARRAY_ELEM_WIDTH + 10 * elemToPush.toString().length);

	return this.commands;
}

StackArray.prototype.pop = function (ignored) {
	this.commands = new Array();

	if (this.top > 0) {
		if(this.labPopValID > 0) {
			this.cmd("Delete", this.labPopValID);
			this.cmd("Step");
		}

		this.labPopValID = this.nextIndex++;

		this.top--;
		this.cmd("SetText", this.topID, this.top);

		this.cmd("Move", this.stackID[this.top], DELBOX_POX_X, DELBOX_POX_Y);
		this.cmd("Step");
		this.cmd("Delete", this.stackID[this.top]);
		this.cmd("Delete", this.stackLabelID[this.top]);
		this.cmd("Step");

		this.cmd("CreateLabel", this.labPopValID, this.stackData[this.top], POP_ELEMENT_X, POP_ELEMENT_Y);
		this.cmd("Step");

		this.prevArrayLen -= (ARRAY_ELEM_WIDTH + 10 * this.stackData[this.top].toString().length);
		if(this.top > 0 && this.prevArrayLen == 0) {
			(this.ARRAY_CUR_LINE)--;
			this.prevArrayLen = this.lineTotalLen[this.ARRAY_CUR_LINE];
		}
	}

	return this.commands;
}



StackArray.prototype.clearAll = function () {
	this.commands = new Array();

	for (var i = this.top - 1; i >= 0; --i) {
		this.cmd("Delete", this.stackID[i]);
		this.cmd("Delete", this.stackLabelID[i]);
		this.cmd("Step");
	}

	if(this.labPushValID > 0) {
		this.cmd("Delete", this.labPushValID);
	}
	if(this.labPopValID > 0) {
		this.cmd("Delete", this.labPopValID);
	}
	this.labPushValID = this.nextIndex++;
	this.cmd("CreateLabel", this.labPushValID, "CLEAR", PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
	this.labPopValID = this.nextIndex++;
	this.cmd("CreateLabel", this.labPopValID, "CLEAR", POP_ELEMENT_X, POP_ELEMENT_Y);

	this.cmd("SetText", this.topID, "0");
	this.top = 0;
	this.prevArrayLen = 0;
	this.ARRAY_CUR_LINE = 0;
	return this.commands;

}



var currentAlg;

function init() {
	var animManag = initCanvas();
	currentAlg = new StackArray(animManag, canvas.width, canvas.height);
}
