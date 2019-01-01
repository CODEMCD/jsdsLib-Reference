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

var HEAD_POS_X = 180;
var HEAD_POS_Y = 60;
var HEAD_LABEL_X = 130;
var HEAD_LABEL_Y = 60;

var TAIL_POS_X = 280;
var TAIL_POS_Y = 60;
var TAIL_LABEL_X = 230;
var TAIL_LABEL_Y = 60;

var ENQ_LABEL_X = 95;
var ENQ_LABEL_Y = 30;
var ENQ_ELEMENT_X = 240;
var ENQ_ELEMENT_Y = 30;

var DEQ_LABEL_X = 95;
var DEQ_LABEL_Y = 60;
var DEQ_ELEMENT_X = 240;
var DEQ_ELEMENT_Y = 60;

var DELBOX_POX_X;
var DELBOX_POX_Y = 50;

var INDEX_COLOR = "#0000FF"
var ELEM_FOREGROUND_COLOR = "#000055";
var ELEM_BACKGROUND_COLOR = "#AAAAFF";
var ELEM_EMPTY_COLOR = "#ffffff";
var ELEM_EMPTY_OUTLINE_COLOR = "#000000";


function QueueArray(am, w, h) {
	this.init(am, w, h);

}

QueueArray.prototype = new Algorithm();
QueueArray.prototype.constructor = QueueArray;
QueueArray.superclass = Algorithm.prototype;


QueueArray.prototype.init = function (am, w, h) {
	QueueArray.superclass.init.call(this, am, w, h);
	this.CANVAS_WIDTH = w;
	this.ARRAY_CUR_LINE = 0;

	HEAD_POS_X = Math.floor(w / 2) - 50;
	TAIL_POS_X = Math.floor(w / 2) + 100;

	HEAD_LABEL_X = Math.floor(w / 2) - 110;
	TAIL_LABEL_X = Math.floor(w / 2) + 50;

	DELBOX_POX_X = Math.floor(w / 2) - 230;

	this.addControls();
	this.setup();
}


QueueArray.prototype.addControls = function () {
	this.controls = [];

	this.enqueueArrayField = addControlToAlgorithmBar("Text", "");
	this.enqueueArrayField.onkeydown = this.returnSubmit(this.enqueueArrayField, this.enqueueArrayCallback.bind(this));
	this.enqueueArrayButton = addControlToAlgorithmBar("Button", "Array Enqueue");
	this.enqueueArrayButton.onclick = this.enqueueArrayCallback.bind(this);
	this.controls.push(this.enqueueArrayField);
	this.controls.push(this.enqueueArrayButton);

	this.enqueueField = addControlToAlgorithmBar("Text", "");
	this.enqueueField.onkeydown = this.returnSubmit(this.enqueueField, this.enqueueCallback.bind(this), 10);
	this.enqueueButton = addControlToAlgorithmBar("Button", "Single Enqueue");
	this.enqueueButton.onclick = this.enqueueCallback.bind(this);
	this.controls.push(this.enqueueField);
	this.controls.push(this.enqueueButton);

	this.dequeueButton = addControlToAlgorithmBar("Button", "Dequeue");
	this.dequeueButton.onclick = this.dequeueCallback.bind(this);
	this.controls.push(this.dequeueButton);

	this.rearrangeButton = addControlToAlgorithmBar("Button", "Rearrange Array");
	this.rearrangeButton.onclick = this.rearrangeCallback.bind(this);
	this.controls.push(this.rearrangeButton);

	this.clearButton = addControlToAlgorithmBar("Button", "Clear Queue");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);

}

QueueArray.prototype.enableUI = function (event) {
	for (var i = 0; i < this.controls.length; i++) {
		this.controls[i].disabled = false;
	}


}
QueueArray.prototype.disableUI = function (event) {
	for (var i = 0; i < this.controls.length; i++) {
		this.controls[i].disabled = true;
	}
}


QueueArray.prototype.setup = function () {
	this.commands = [];

	this.nextIndex = 0;
	this.initialIndex = this.nextIndex;
	this.size = 0;
	this.prevArrayLen = 0;
	this.queueData = [];

	this.head = 0;
	this.tail = 0;

	this.queueID = [];
	this.queueLabelID = [];

	this.emptyBoxID = [];

	this.labEnqueueValID = 0;
	this.labDequeueValID = 0;

	var headLabelID = this.nextIndex++;
	var tailLabelID = this.nextIndex++;

	var delBoxID = this.nextIndex++;

	var labEnqueueID = this.nextIndex++;
	var labDequeueID = this.nextIndex++;

	this.headID = this.nextIndex++;
	this.tailID = this.nextIndex++;

	this.cmd("CreateLabel", headLabelID, "Head", HEAD_LABEL_X, HEAD_LABEL_Y);
	this.cmd("CreateRectangle", this.headID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, HEAD_POS_X, HEAD_POS_Y);

	this.cmd("CreateLabel", tailLabelID, "Tail", TAIL_LABEL_X, TAIL_LABEL_Y);
	this.cmd("CreateRectangle", this.tailID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, TAIL_POS_X, TAIL_POS_Y);

	this.cmd("CreateRectangle", delBoxID, "Del", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, DELBOX_POX_X, DELBOX_POX_Y);

	this.cmd("CreateLabel", labEnqueueID, "Enqueuing Value: ", ENQ_LABEL_X, ENQ_LABEL_Y);
	this.cmd("CreateLabel", labDequeueID, "Dequeued Value: ", DEQ_LABEL_X, DEQ_LABEL_Y);

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}


QueueArray.prototype.reset = function () {
	
}

QueueArray.prototype.enqueueArrayCallback = function (event) {
	if (this.enqueueArrayField.value != "") {
		var pushVal = this.enqueueArrayField.value;
		this.enqueueArrayField.value = ""
		this.implementAction(this.enqueueArray.bind(this), pushVal);
	}
}


QueueArray.prototype.enqueueCallback = function (event) {
	if (this.enqueueField.value != "") {
		var pushVal = this.enqueueField.value;
		this.enqueueField.value = ""
		this.implementAction(this.enqueue.bind(this), pushVal);
	}
}


QueueArray.prototype.dequeueCallback = function (event) {
	if (this.tail > this.head) {
		this.implementAction(this.dequeue.bind(this), "");
	}
}


QueueArray.prototype.clearCallback = function (event) {
	this.implementAction(this.clearAll.bind(this), "");
}


QueueArray.prototype.rearrangeCallback = function (event) {
	if (this.head > 0) {
		this.implementAction(this.rearrangeArray.bind(this), "");
	}
}


QueueArray.prototype.enqueueArray = function (elemToEnqueue) {
	this.commands = new Array();

	if (this.labEnqueueValID > 0) {
		this.cmd("Delete", this.labEnqueueValID);
		this.cmd("Step");
	}

	var splitVal = elemToEnqueue.substr(1, elemToEnqueue.length - 2);
	splitVal = splitVal.split(',');
	var elemLen = splitVal.length;
	this.labEnqueueValID = this.nextIndex++;

	var printArray = '[' + splitVal[0] + ', ' + '...' + ', ' + splitVal[elemLen - 1] + ']';
	this.cmd("CreateLabel", this.labEnqueueValID, printArray, ENQ_ELEMENT_X, ENQ_ELEMENT_Y);
	this.cmd("Step");

	for (var i = 0; i < elemLen; ++i) {
		this.emptyBoxID[this.tail] = this.nextIndex++;
		this.queueLabelID[this.tail] = this.nextIndex++;
		this.queueID[this.tail] = this.nextIndex++;
		this.queueData[this.tail] = splitVal[i];

		var xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length) / 2);
		var ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
		if (ARRAY_START_X + this.prevArrayLen + ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length > this.CANVAS_WIDTH) {
			this.prevArrayLen = 0;
			xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length) / 2);

			(this.ARRAY_CUR_LINE)++;
			ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
		}

		this.cmd("CreateRectangle", this.emptyBoxID[this.tail],
			"",
			ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length,
			ARRAY_ELEM_HEIGHT,
			xpos,
			ypos);

		this.cmd("CreateRectangle", this.queueID[this.tail],
			splitVal[i],
			ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length,
			ARRAY_ELEM_HEIGHT,
			xpos,
			ypos);
		this.cmd("CreateLabel", this.queueLabelID[this.tail], this.tail, xpos, ypos - ARRAY_ELEM_HEIGHT + 10);
		this.cmd("SetBackgroundColor", this.queueID[this.tail], ELEM_BACKGROUND_COLOR);
		this.cmd("SetForegroundColor", this.queueLabelID[this.tail], INDEX_COLOR);
		this.cmd("Step");

		(this.size)++;
		(this.tail)++;

		this.prevArrayLen += (ARRAY_ELEM_WIDTH + 10 * splitVal[i].toString().length);
	}

	this.cmd("SetText", this.tailID, this.tail);

	return this.commands;
}


QueueArray.prototype.enqueue = function (elemToEnqueue) {
	this.commands = new Array();

	if (this.labEnqueueValID > 0) {
		this.cmd("Delete", this.labEnqueueValID);
		this.cmd("Step");
	}

	//앞에 그려져야 하기 때문에 id값이 작아야함
	this.emptyBoxID[this.tail] = this.nextIndex++;
	this.labEnqueueValID = this.nextIndex++;
	this.queueID[this.tail] = this.nextIndex++;
	this.queueLabelID[this.tail] = this.nextIndex++;

	this.queueData[this.tail] = elemToEnqueue;

	this.cmd("CreateLabel", this.labEnqueueValID, elemToEnqueue, ENQ_ELEMENT_X, ENQ_ELEMENT_Y);
	this.cmd("Step");

	// var xpos = (this.size  % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
	// var ypos = Math.floor(this.size / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y;

	var xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * elemToEnqueue.toString().length) / 2);
	var ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
	if (ARRAY_START_X + this.prevArrayLen + ARRAY_ELEM_WIDTH + 10 * elemToEnqueue.toString().length > this.CANVAS_WIDTH) {
		this.prevArrayLen = 0;
		xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * elemToEnqueue.toString().length) / 2);

		(this.ARRAY_CUR_LINE)++;
		ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
	}

	this.cmd("CreateRectangle", this.emptyBoxID[this.tail],
		"",
		ARRAY_ELEM_WIDTH + 10 * elemToEnqueue.toString().length,
		ARRAY_ELEM_HEIGHT,
		xpos,
		ypos);

	this.cmd("CreateRectangle", this.queueID[this.tail],
		elemToEnqueue,
		ARRAY_ELEM_WIDTH + 10 * elemToEnqueue.toString().length,
		ARRAY_ELEM_HEIGHT,
		xpos,
		ypos);

	this.cmd("CreateLabel", this.queueLabelID[this.tail], this.tail, xpos, ypos - ARRAY_ELEM_HEIGHT + 10);
	this.cmd("SetBackgroundColor", this.queueID[this.tail], ELEM_BACKGROUND_COLOR);
	this.cmd("SetForegroundColor", this.queueLabelID[this.tail], INDEX_COLOR);
	this.cmd("Step");

	(this.size)++;
	(this.tail)++;
	this.cmd("SetText", this.tailID, this.tail);
	this.cmd("Step");

	this.prevArrayLen += (ARRAY_ELEM_WIDTH + 10 * elemToEnqueue.toString().length);

	return this.commands;
}

QueueArray.prototype.dequeue = function (ignored) {
	this.commands = new Array();

	if (this.labDequeueValID > 0) {
		this.cmd("Delete", this.labDequeueValID);
		this.cmd("Step");
	}

	this.labDequeueValID = this.nextIndex++;
	(this.size)--;

	this.cmd("Move", this.queueID[this.head], DELBOX_POX_X, DELBOX_POX_Y);
	this.cmd("Step");


	this.cmd("Delete", this.queueID[this.head]);
	//this.cmd("Delete", this.queueLabelID[this.head]);
	this.cmd("Step");

	var dequeuedVal = this.queueData[this.head]
	this.cmd("CreateLabel", this.labDequeueValID, dequeuedVal, DEQ_ELEMENT_X, DEQ_ELEMENT_Y);

	(this.head)++;
	this.cmd("SetText", this.headID, this.head);
	this.cmd("Step");

	return this.commands;
}


QueueArray.prototype.rearrangeArray = function () {
	this.commands = new Array();

	for (var i = 0; i < this.head; ++i) {
		this.cmd("Delete", this.emptyBoxID[i]);
		this.cmd("Delete", this.queueLabelID[i]);
	}
	this.cmd("Step");

	this.prevArrayLen = 0;
	this.ARRAY_CUR_LINE = 0;
	var newIdx = 0;
	for (var i = this.head; i < this.tail; ++i) {
		this.queueLabelID[newIdx] = this.nextIndex++;

		var xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * this.queueData[i].toString().length) / 2);;
		var ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
		if (ARRAY_START_X + this.prevArrayLen + ARRAY_ELEM_WIDTH + 10 * this.queueData[i].toString().length > this.CANVAS_WIDTH) {
			this.prevArrayLen = 0;
			xpos = ARRAY_START_X + this.prevArrayLen + Math.ceil((ARRAY_ELEM_WIDTH + 10 * this.queueData[i].toString().length) / 2);

			(this.ARRAY_CUR_LINE)++;
			ypos = this.ARRAY_CUR_LINE * ARRAY_LINE_SPACING + ARRAY_START_Y;
		}

		this.cmd("Delete", this.queueLabelID[i]);
		this.cmd("Move", this.emptyBoxID[i], xpos, ypos);
		this.cmd("Move", this.queueID[i], xpos, ypos);
		this.queueID[newIdx] = this.queueID[i];
		this.emptyBoxID[newIdx] = this.emptyBoxID[i];
		this.cmd("Step");

		this.cmd("CreateLabel", this.queueLabelID[newIdx], newIdx, xpos, ypos - ARRAY_ELEM_HEIGHT + 10);
		this.cmd("SetForegroundColor", this.queueLabelID[newIdx], INDEX_COLOR);

		this.prevArrayLen += (ARRAY_ELEM_WIDTH + 10 * this.queueData[i].toString().length);

		newIdx++;
	}

	this.head = 0;
	this.tail = this.size;
	this.cmd("SetText", this.headID, this.head);
	this.cmd("SetText", this.tailID, this.tail);

	return this.commands;
}


QueueArray.prototype.clearAll = function () {
	this.commands = new Array();

	var i;

	for (i = 0; i < this.head; ++i) {
		this.cmd("Delete", this.queueLabelID[i]);
		this.cmd("Delete", this.emptyBoxID[i]);
		this.cmd("Step");
	}
	for (i = this.head; i < this.tail; ++i) {
		this.cmd("Delete", this.emptyBoxID[i]);
		this.cmd("Delete", this.queueID[i]);
		this.cmd("Delete", this.queueLabelID[i]);
		this.cmd("Step");
	}

	
	if(this.labEnqueueValID > 0) {
		this.cmd("Delete", this.labEnqueueValID);
	}
	if(this.labDequeueValID > 0) {
		this.cmd("Delete", this.labDequeueValID);
	}
	this.labEnqueueValID = this.nextIndex++;
	this.cmd("CreateLabel", this.labEnqueueValID, "CLEAR", ENQ_ELEMENT_X, ENQ_ELEMENT_Y);
	this.labDequeueValID = this.nextIndex++;
	this.cmd("CreateLabel", this.labDequeueValID, "CLEAR", DEQ_ELEMENT_X, DEQ_ELEMENT_Y);

	this.cmd("SetText", this.headID, "0");
	this.cmd("SetText", this.tailID, "0");

	this.size = 0;
	this.head = 0;
	this.tail = 0;
	this.prevArrayLen = 0;
	this.ARRAY_CUR_LINE = 0;

	return this.commands;
}


var currentAlg;

function init() {
	var animManag = initCanvas();
	currentAlg = new QueueArray(animManag, canvas.width, canvas.height);
}
