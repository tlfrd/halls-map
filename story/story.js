(function($, Story) {

  Story.chaptersUpdate = {
    0: function() {
      console.log("do nothing");
    },
    1: function() {
      console.log("hellodss1");
    },
    2: function() {
      console.log("heddsdsllo1");
    },
    3: function() {
      console.log("hedsddllo1");
    },
    4: function() {
      console.log("hesdsllo1");
    },
    5: function() {
      console.log("hello1");
    }
  };

  // methods to revert
  Story.chaptersRevert = {
    0: function() {
      console.log("hello!!!");
    },
    1: function() {
      console.log("hellodss1");
    },
    2: function() {
      console.log("heddsdsllo1");
    },
    3: function() {
      console.log("hedsddllo1");
    },
    4: function() {
      console.log("hesdsllo1");
    },
    5: function() {
      console.log("hello1");
    }
  };

  var numberOfChapters = 6;

  var currentChapter = 0;

  Story.nextChapter = function () {
    if (currentChapter < numberOfChapters - 1) {
      hideRightChapter(currentChapter);
      showRightChapter(currentChapter + 1, true);
      Story.chaptersRevert[currentChapter]();
      currentChapter += 1;
      Story.chaptersUpdate[currentChapter]();
      console.log("Current Chapter: " + currentChapter);
    }
  };

  Story.previousChapter = function() {
    if (currentChapter != 0) {
      hideLeftChapter(currentChapter);
      showLeftChapter(currentChapter - 1, true);
      Story.chaptersRevert[currentChapter]();
      currentChapter -= 1;
      Story.chaptersUpdate[currentChapter]();
      console.log("Current Chapter: " + currentChapter);
    }
  };

  function hideLeftChapter(id) {
    var chapter = $("#ch" + id);
    chapter.animate({
        left: chapter.width() * 1.1
    }, 500);
    chapter.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
      chapter.hide();
      chapter.unbind();
    });
  }

  function hideRightChapter(id) {
    var chapter = $("#ch" + id);
    chapter.css({
      left: -(chapter.width() * 1.1)
    });
    chapter.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
      chapter.hide();
      chapter.unbind();
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

    callChapterFunctions(id);
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
    Story.chaptersUpdate[currentChapter]();

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
