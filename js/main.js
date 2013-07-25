
// Application variables

var filenames = ['airport', 'comehere', 'helloworld',
				 'idontunderstand', 'library', 'meetyou',
				 'speakenglish', 'textme', 'thankyou', 
				 'time', 'winetalking', 'yourname'];
var phrases =   ['I would like to go to the airport', 
				 'Do you come here often?', 
				 'Hello world!',
				 'I don\'t understand', 
				 'Where is the library?', 
				 'Nice to meet you',
				 'Do you speak English?', 
				 'Text me a bit later', 
				 'Thank you', 
				 'What time is it?', 
				 'That\'s just the wine talking', 
				 'What is your name?'];
var language = 'fr';
var correct_index = -1;
var score = 0;
var audioPlayer = document.getElementsByTagName('audio')[0];
var flag = $('#flag');
var play_button = $('#play_button');
var language_name = $('#language_name');
var canvas = document.getElementsByTagName('canvas')[0];
var context = canvas.getContext('2d');
var buttonsAnimating = false;

$(window).load(function() {
	
	// flag button code
	flag.click(function() {
		changeLanguage();
	});	
	flag.mouseover(function() {
		flag.fadeTo(200,1);
		language_name.fadeTo(200,1);
	});	
	flag.mouseout(function() {
		flag.fadeTo(200,0.5);
		language_name.fadeTo(200,0.5);
	});	
	
	// audioplayer events
	audioPlayer.addEventListener('durationchange', emptyCanvas);
	audioPlayer.addEventListener('timeupdate', updateSeekbar);		
	audioPlayer.addEventListener('ended', function(){
		play_button.css("background-image", 'url("img/play.png")');
	}, false);
	audioPlayer.addEventListener('play', function(){
		play_button.css("background-image", 'url("img/stop.png")');
	}, false);

	// play button controls
	play_button.click(function() {
		if (!audioPlayer.paused)
		{
			audioPlayer.pause();
			play_button.css("background-image", 'url("img/play.png")');
		}
		else {
			play_button.css("background-image", 'url("img/stop.png")');
			audioPlayer.load();
			audioPlayer.play();
		}
	});
	play_button.mousedown(function() {
		play_button.css("background-image", play_button.css("background-image").replace("stop","stop_pressed").replace("play","play_pressed"));
	});
	play_button.mouseup(function() {
		play_button.css("background-image", play_button.css("background-image").replace("_pressed",""));
	});
	play_button.mouseout(function() {
		play_button.css("background-image", play_button.css("background-image").replace("_pressed",""));
	});

	// draw seekbar
	context.beginPath();
	context.lineWidth = 13;
	context.strokeStyle = '#ff0000';
	emptyCanvas();
	
	// answer button code
	$('#answer_0').click(function() {sendAnswer(0)});
	$('#answer_1').click(function() {sendAnswer(1)});
	$('#answer_2').click(function() {sendAnswer(2)});
	
	$("#answer_list li").mouseup(function() {$(this).removeClass("down_gradient"); $(this).addClass("up_gradient")});
	$("#answer_list li").mouseout(function() {$(this).removeClass("down_gradient"); $(this).addClass("up_gradient")});
	$("#answer_list li").mousedown(function() {$(this).removeClass("up_gradient"); $(this).addClass("down_gradient")});
		
	// begin round
	newRound();
});

var newRound = function () {
	// load a new phrase and answers
	 
	answers = getRandomAnswers();
	var old_correct_index = correct_index;
	do {
		correct_index = Math.floor(Math.random() * answers.length);
	}
	while (correct_index == old_correct_index);
	audioPlayer.src = getAnswerFilename(answers[correct_index]);
	$('#answer_0').html(answers[0].phrase);
	$('#answer_1').html(answers[1].phrase);
	$('#answer_2').html(answers[2].phrase);
};

var changeLanguage = function () {
	// change the language of the phrases
	
	$('#flag').attr("src","img/flag_" + language + ".jpg");
	language = (language =='fr') ? 'es' : 'fr';
	var full_name = (language =='fr') ? 'Spanish' : 'French'
	language_name.html("Switch to " + full_name);
	newRound();	
	audioPlayer.play();
};

var getRandomPhraseIndices = function() {
	// Return an array containing 3 randomly indices 
	
	var a = Math.floor(Math.random() * filenames.length);
	do {
		var b = Math.floor(Math.random() * filenames.length);		
	} while (b == a)
	do {
		var c = Math.floor(Math.random() * filenames.length);		
	} while (c == a || c == b)
	return [a, b, c];
};

var getRandomAnswers = function() {
	// Return an array containing 3 randomly selected phrases 
	
	var currentPhraseIndices = getRandomPhraseIndices();
	var currentPhrases = [];
	for (var i = 0; i < 3; i++) {
		var currentIndex = currentPhraseIndices[i];
		currentPhrases[i] = {
	        filename: filenames[currentIndex],
	        phrase: phrases[currentIndex],
	        index: currentIndex
		};
	}
	return currentPhrases;
}

var getAnswerFilename = function(phrase) {
	// Return the path to the mp3 for the passed phrase 
	if (audioPlayer.canPlayType('audio/mpeg;')) {
		return "audio/" + language + "/" + phrase.filename + ".mp3";
	}
	else {
		return "audio/" + language + "/" + phrase.filename + ".ogg";
	}
}

var sendAnswer = function(index) {
	// Answer with specified index
	
	if (buttonsAnimating) {
		return;
	}
	if (index == correct_index)
	{
		$('#score').html("Score: " + ++score);
	}
	var correct_answer = $('#answer_'+correct_index);
	var delay_ms = 150;
	
	buttonsAnimating = true;
	correct_answer.addClass("correct");
	setTimeout(function() {correct_answer.removeClass("correct")}, delay_ms);
	setTimeout(function() {correct_answer.addClass("correct")}, delay_ms * 2);
	
	setTimeout(function() {
		correct_answer.removeClass("correct");
		newRound();
		audioPlayer.play();
		buttonsAnimating = false;
	}, delay_ms * 8);
};

// canvas methods

var emptyCanvas = function() {
	// clear the seekbars
	
	context.fillStyle = "black";
	context.fillRect(0, 0, 95, 14);
	context.fillStyle = "white";
	context.fillRect(1, 1, 93, 12);
};

var updateSeekbar = function() {
	// update the seekbar to reflect the current played duration
	
	if (isNaN(audioPlayer.duration)) {
		return;
	}
	var x_position = Math.max(0,  Math.ceil((2 + audioPlayer.currentTime * 93) /audioPlayer.duration));
	context.beginPath();
	context.moveTo(1,7);
	context.lineTo(x_position, 7);
    context.closePath();
    context.stroke();
};