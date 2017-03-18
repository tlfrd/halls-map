(function($, Story) {

  var chapters = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: []
  };

  var currentChapter = 0;

  Story.nextChapter = function () {
    hideRightChapter(currentChapter);
    showRightChapter(currentChapter + 1, true);
    currentChapter += 1;
    console.log("Current Chapter: " + currentChapter);
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
        left: chapter.width() * 1.2
    }, 500);
  }

  function hideRightChapter(id) {
    var chapter = $("#ch" + id);
    chapter.animate({
        right: chapter.width() * 1.2
    }, 500);
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
      chapter.show().css({
        right: -(chapter.width())
      }).animate({
        right: 0
      }, 500);
    } else {
      chapter.show();
    }
  }

  Story.init = function () {
    console.log("Current Chapter: " + currentChapter);
    showRightChapter(0, false);
  };

})($, window.Story = window.Story || {});
