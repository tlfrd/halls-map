(function($, Story) {

  var chapters = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  };

  var numberOfChapters = 6;

  var currentChapter = 0;

  Story.nextChapter = function () {
    if (currentChapter < numberOfChapters - 1) {
      hideRightChapter(currentChapter);
      showRightChapter(currentChapter + 1, true);
      currentChapter += 1;
      console.log("Current Chapter: " + currentChapter);
    }
  };

  Story.previousChapter = function() {
    if (currentChapter != 0) {
      hideLeftChapter(currentChapter);
      showLeftChapter(currentChapter - 1, true);
      currentChapter -= 1;
      console.log("Current Chapter: " + currentChapter);
    }
  };

  function hideLeftChapter(id) {
    var chapter = $("#ch" + id);
    chapter.animate({
        left: chapter.width() * 1.1
    }, 500);
  }

  function hideRightChapter(id) {
    var chapter = $("#ch" + id);
    chapter.show().css({
      left: -(chapter.width() * 1.1)
    });
  }

  function showLeftChapter(id, animate_boolean) {
    var chapter = $("#ch" + id);

    if (animate_boolean) {
      chapter.show().css({
        left: -(chapter.width())
      }).animate({
        left: 0
      }, 500);
    } else {
      chapter.show();
    }
  }

  function showRightChapter(id, animate_boolean) {
    var chapter = $("#ch" + id);

    if (animate_boolean) {
      chapter.css({
        left: (chapter.width())
      });
      chapter.show().css({
        left: 0
      });
    } else {
      chapter.show().css({
        left: 0
      });
    }
  }

  Story.init = function () {
    console.log("Current Chapter: " + currentChapter);
    showRightChapter(0, false);

    for (var i = 1; i < numberOfChapters; i+= 1) {
      $("#ch" + i).show();
      $("#ch" + i).hide();
    }

    $('.right-arrow').click(function() {
      Story.nextChapter();
    });
    $('.left-arrow').click(function() {
      Story.previousChapter();
    });
  };

})($, window.Story = window.Story || {});
